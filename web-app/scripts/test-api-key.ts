
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// 嘗試讀取 .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('❌ 錯誤：找不到 GEMINI_API_KEY 環境變數。請檢查 .env.local');
    process.exit(1);
}

console.log(`🔑 正在使用 API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)} 進行測試`);


async function testConnection() {
    const genAI = new GoogleGenerativeAI(apiKey!);
    // Pro 模型配額不足 (429)，改回 gemini-2.5-flash
    const modelsToCheck = ['gemini-2.5-flash'];
    

    const log = (msg: string) => {
        console.log(msg);
        fs.appendFileSync('result_utf8.txt', msg + '\n');
    };

    log('🔍 正在檢測此 API Key 支援的模型...\n');

    let successCount = 0;

    for (const modelName of modelsToCheck) {
        process.stdout.write(`Testing ${modelName.padEnd(20)} ... `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            await result.response;
            console.log('✅ 可用 (Available)');
            fs.appendFileSync('test-result.txt', `Testing ${modelName}: ✅ 可用 (Available)\n`);
            successCount++;
        } catch (error: any) {
             console.log(`❌ 錯誤 (${error.message.split(' ')[0]}...)`);
             fs.appendFileSync('test-result.txt', `Testing ${modelName}: ❌ 錯誤 (${error.message})\n`);
        }
    }

    log('\n----------------------------------------');
    if (successCount > 0) {
        log(`🎉 檢測完成！此 Key 支援 ${successCount} 個模型。`);
        log('建議：系統目前設定為使用 gemini-2.5-flash。');
    } else {
        log('⚠️ 檢測完成。此 Key 目前無法存取任何測試的 Gemini 模型。');
    }
}


testConnection();
