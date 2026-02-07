// Gemini API 客戶端配置
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini AI（使用環境變數）
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY 環境變數未設定');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// 使用 Gemini 1.5 Pro（支援長文本窗口）
export const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro'
});

/**
 * 組裝 System Prompt
 * @param skillContent - 選擇的 Skill 內容
 * @param xsGuideContent - XS 完整指引內容
 * @param apiIndexContent - API 索引內容
 */
export function buildSystemPrompt(
  skillContent: string,
  xsGuideContent?: string,
  apiIndexContent?: string
): string {
  const parts: string[] = [
    '# 角色定義',
    '你是一位專業的 XQ Script (XS) 語言專家助理，專門協助使用者編寫 XS 腳本。',
    '',
    '# 輸出規範',
    '- 必須使用繁體中文（台灣）回覆',
    '- 提供完整、可執行的程式碼範例',
    '- 關鍵邏輯必須包含繁體中文註解',
    '',
    '# 專業技能',
    skillContent,
  ];

  if (xsGuideContent) {
    parts.push('', '# XS 語言完整指引', xsGuideContent);
  }

  if (apiIndexContent) {
    parts.push('', '# API 索引', apiIndexContent);
  }

  return parts.join('\n');
}
