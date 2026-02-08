
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildSystemPrompt } from '../src/lib/gemini';
import { loadCoreDocs, loadSkillContent } from '../src/lib/skillLoader';
import fs from 'fs';
import path from 'path';

// 加載環境變數 (手動讀取 avoids dotenv path issues)
const envPath = path.join(process.cwd(), '.env.local');
let apiKey = '';
try {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) {
      apiKey = match[1].trim();
    }
  }
} catch (e) {
  console.warn('Could not read .env.local');
}

async function testTradingGen() {
  if (!apiKey) {
    apiKey = process.env.GEMINI_API_KEY || ''; 
  }
  
  if (!apiKey) {
    console.error('❌ No API Key found');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  console.log('載入 Trading Script Skill...');
  const skill = await loadSkillContent('trading_script');
  const docs = await loadCoreDocs();
  
  const systemPrompt = buildSystemPrompt(
    skill ? skill.content : '', 
    docs
  );

  const userRequest = `15分K進場條件:1.KD在50以下 2.macd在0軸以上黃金交叉 3.股價在20ma以上 4. 23ema與45ema>144EMA與169ema`;

  console.log('Sending Request:', userRequest);

  const chat = model.startChat({
    history: [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: '了解，我是 XS 交易腳本專家。請說明您的交易策略。' }] }
    ]
  });

  try {
    const result = await chat.sendMessage(userRequest);
    const response = result.response.text();

    console.log('\n--- AI Generated Script ---');
    console.log(response);
    
    // 簡單驗證關鍵字
    if (response.includes('stochastic') && response.includes('MACD') && response.includes('Average')) {
       console.log('\n✅ 腳本包含 KD (stochastic), MACD, Average 關鍵函數');
    }
    
    // 寫入結果檔案
    fs.writeFileSync('result_trading_test.txt', response, 'utf-8');
    
  } catch (error: any) {
    console.error('API Error:', error.message);
  }
}

testTradingGen().catch(console.error);
