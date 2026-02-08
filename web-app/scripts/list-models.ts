
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load Env
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
        process.env[k] = envConfig[k];
    }
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('❌ No API Key found');
    process.exit(1);
}

async function listModels() {
    console.log('🔍 正在查詢可用模型列表...');
    console.log(`🔑 Key: ...${apiKey?.slice(-5)}`);
    console.log('--------------------------------------------------');

    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    
    try {
        const response = await fetch(`${baseUrl}/models?key=${apiKey}`);
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ 查詢失敗:', JSON.stringify(data.error, null, 2));
            return;
        }

        const models = (data as any).models || [];
        console.log(`🎉 總共發現 ${models.length} 個模型：\n`);

        const sortedModels = models.sort((a: any, b: any) => a.name.localeCompare(b.name));

        console.log('📝 [對話/生成模型 (Generate Content)]:');
        
        sortedModels.forEach((m: any) => {
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                 const name = m.name.replace('models/', '');
                 console.log(`   - ${name.padEnd(35)} (Version: ${m.version})`);
            }
        });

        console.log('\n🔧 [其他模型 (Embeddings, etc.)]:');
        sortedModels.forEach((m: any) => {
            if (!m.supportedGenerationMethods || !m.supportedGenerationMethods.includes('generateContent')) {
                const name = m.name.replace('models/', '');
                console.log(`   - ${name.padEnd(35)}`);
            }
        });

    } catch (err) {
        console.error('❌ 發生錯誤:', err);
    }
}

listModels();
