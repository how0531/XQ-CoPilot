// Chat API Route - 處理 AI 對話請求
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '@/lib/gemini';
import { loadSkillContent, loadXSGuide, loadAPIIndex } from '@/lib/skillLoader';
import { getUserApiKey } from '@/lib/userSettings';

export async function POST(req: NextRequest) {
  try {
    const { messages, skillName, userId } = await req.json();

    // 驗證請求
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: '無效的訊息格式' },
        { status: 400 }
      );
    }

    // 1. 優先使用用戶的 API Key
    let apiKey: string | null = null;
    if (userId) {
      apiKey = await getUserApiKey(userId);
    }

    // 2. 否則使用伺服器的 API Key
    if (!apiKey) {
      apiKey = process.env.GEMINI_API_KEY || null;
    }

    // 3. 如果都沒有，回傳錯誤
    if (!apiKey) {
      return NextResponse.json(
        { error: '請在個人設定中配置 Gemini API Key，或聯繫管理員' },
        { status: 401 }
      );
    }

    // 動態初始化 Gemini（使用對應的 API Key）
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // 載入選擇的 Skill
    let skillContent = '';
    if (skillName) {
      const skill = await loadSkillContent(skillName);
      if (skill) {
        skillContent = skill.content;
      }
    }

    // 載入 XS 指引與 API 索引（可選）
    const xsGuide = await loadXSGuide();
    const apiIndex = await loadAPIIndex();

    // 組裝 System Prompt
    const systemPrompt = buildSystemPrompt(skillContent, xsGuide, apiIndex);

    // 準備對話歷史（將 system prompt 加入）
    const chatHistory = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '了解，我是 XQ Script 專家助理，將使用繁體中文協助您。' }] },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    // 呼叫 Gemini API（串流回應）
    const chat = model.startChat({
      history: chatHistory.slice(0, -1), // 排除最後一則訊息
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.content);

    // 建立串流回應
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('串流錯誤:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API 錯誤:', error);
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    );
  }
}
