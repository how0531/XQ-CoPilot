
import * as dotenv from 'dotenv';
import * as path from 'path';

// 1. Load Environment Variables FIRST (before importing lib/gemini)
const envPath = path.join(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

// 2. Import the actual library file used by the Web App
// Note: We need to use dynamic import or require to ensure env is loaded first if it were a side-effect, 
// but since we loaded dotenv above, standard import should work if we were using modules correctly.
// However, to be safe with execution order in this script:
async function testAppConfig() {
    console.log('🔍 驗證專案設定 (src/lib/gemini.ts)...');
    
    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ 尚未讀取到環境變數，請檢查 .env.local');
        return;
    }

    try {
        // Dynamic import to emulate app usage
        const { model } = await import('../src/lib/gemini');
        
        console.log(`✅ 成功載入 src/lib/gemini.ts`);
        console.log(`ℹ️  目前設定模型: ${model.model}`);

        console.log('🚀 嘗試發送測試訊息...');
        const result = await model.generateContent("Hello! Are you working? Reply with 'Yes, I am live!'");
        const response = result.response;
        const text = response.text();

        console.log(`🤖 AI 回應: ${text}`);
        console.log('🎉 驗證成功！網頁版 Chatbot 核心功能正常。');

    } catch (error: any) {
        console.error('❌ 驗證失敗:', error.message);
        if (error.message.includes('429')) {
            console.error('⚠️ 原因: 配額不足 (Quota Exceeded)');
        }
    }
}

testAppConfig();
