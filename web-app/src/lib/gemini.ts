// Gemini API 客戶端配置
import { GoogleGenerativeAI } from '@google/generative-ai';

// 初始化 Gemini AI（使用環境變數）
const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY 環境變數未設定，AI 功能將無法運作');
}

export const genAI = new GoogleGenerativeAI(apiKey);

// 使用 Gemini 2.5 Flash (Pro 模型目前 429 配額不足，Flash 穩定可用)
export const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash'
});

/**
 * 組裝 System Prompt
 * @param skillContent - 選擇的 Skill 內容
 * @param docsContent - 核心文件內容
 * @param apiIndexContent - API 索引內容
 */
export function buildSystemPrompt(
  skillContent: string,
  docsContent?: string,
  apiIndexContent?: string
): string {
  const parts: string[] = [
    '# 最高準則 (High Priority Rules)',
    '1. 第一步必須先詢問用戶：「請問您需要什麼類型的腳本？」（例如：選股、交易、指標...）',
    '2. 第二步必須引導用戶：「請說明您的進出場邏輯或是觸發條件？」',
    '3. 禁止在用戶未提供明確邏輯前直接生成完整腳本。',
    '',
    '# 角色定義',
    '你是一位專業的 XQ Script (XS) 語言專家助理，專門協助使用者編寫 XS 腳本。',
    '',
    '# 輸出規範',
    '- 必須使用繁體中文（台灣）回覆',
    '- 提供完整、可執行的程式碼範例',
    '- 關鍵邏輯必須包含繁體中文註解',
    '- 回覆風格：直接、精簡，不說廢話 (No chatter)',
    '- 除非用戶詢問原因，否則直接提供程式碼',
    '',
    '# 專業技能',
    skillContent,
  ];

  if (docsContent) {
    parts.push('', '# XS 核心文件與語法參考', docsContent);
  }

  if (apiIndexContent) {
    parts.push('', '# API 索引', apiIndexContent);
  }

  return parts.join('\n');
}
