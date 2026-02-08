
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../src/lib/gemini';
import { loadCoreDocs, loadSkillContent } from '../src/lib/skillLoader';
import fs from 'fs';
import path from 'path';

// 加載環境變數 (手動讀取 avoids dotenv path issues)
const envPath = path.join(process.cwd(), '.env.local');
let apiKey = '';
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/GEMINI_API_KEY=(.*)/);
  if (match) {
    apiKey = match[1].trim();
  }
} catch (e) {
  console.warn('Could not read .env.local');
}

async function testRankSyntax() {
  if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY || ''; // Fallback
  }
  
  if (!apiKey) {
    console.error('❌ No API Key found');
    return;
  }
  
  console.log('API Key loaded (length):', apiKey.length);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // 1. 準備 System Prompt
  const skill = await loadSkillContent('stock_picker_script'); // 選股腳本
  const docs = await loadCoreDocs();
  
  const systemPrompt = buildSystemPrompt(
    skill ? skill.content : '', 
    docs // 載入正確的文件
  );

  // 2. 模擬對話
  // 用戶直接問需求，測試是否符合 "最高準則" (可能會被擋)，或者因為我們是測試腳本，我們可以直接觀察它是否知道 Rank 用法
  // 為了測試 Rank 語法，我們繞過 "詢問階段"，直接給它明確指令
  // 但為了遵守 Prompt 原則，如果它回問，也是正確的。
  
  const userMessage = "幫我寫一個選股腳本：找到成交量排名前150且融資維持率低於140的股票"; 
  // 我故意加了 "選股腳本" 四個字，跳過 Step 1 的確認與詢問，直接測試 Step 3 的生成能力

  console.log('User:', userMessage);
  console.log('Sending to AI...');

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '了解，我是 XS 專家。' }] }
    ]
  });

  const result = await chat.sendMessage(userMessage);
  const response = result.response.text();

  console.log('\n--- AI Response ---');
  console.log(response);
  console.log('-------------------\n');

  // 驗證是否包含正確的 Rank 語法 structure
  let status = 'UNKNOWN';
  if (response.includes('rank ') && response.includes('begin') && response.includes('retval')) {
     console.log('✅ 檢測到正確的 Rank 物件宣告語法 (rank ... begin)');
     status = 'SUCCESS';
  } else if (response.includes('Rank(')) {
     console.log('❌ 警告：檢測到可能的錯誤函數語法 Rank(...)');
     status = 'FAIL';
  }

  const outputContent = `
--- Ensure UTF-8 ---
User: ${userMessage}
Status: ${status}
Response:
${response}
  `;
  fs.writeFileSync('result_utf8.txt', outputContent, 'utf-8');
  console.log('Output written to result_utf8.txt');
}

testRankSyntax().catch(console.error);
