
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

// Redirect logs
const logStream = fs.createWriteStream('result_utf8.txt', { flags: 'w' }); // Overwrite
const log = (msg: string) => {
    console.log(msg);
    logStream.write(msg + '\n');
};

async function diagnose() {
    log('🔍 深度診斷工具: 模型可用性全面測試');
    log(`🔑 testing Key: ...${apiKey?.slice(-5)}`);

    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    

    // 1. Get Models
    log('Fetching model list...');
    const listRes = await fetch(`${baseUrl}/models?key=${apiKey}`);
    const listData = await listRes.json();
    
    if (!listRes.ok) {
        log(`❌ List models failed: ${JSON.stringify(listData)}`);
        return;
    }

    const models = (listData as any).models || [];
    log(`Found ${models.length} models.`);
    

    // Sort model names
    const sortedModels = models.sort((a: any, b: any) => a.name.localeCompare(b.name));

    const header = '\n================ Available Models ================';
    console.log(header);
    logStream.write(header + '\n');

    sortedModels.forEach((m: any) => {
        const name = m.name.replace('models/', '');
        const supportsGenerate = m.supportedGenerationMethods?.includes('generateContent') ? '✅ Gen' : '   ';
        const line = `${supportsGenerate}  ${name} (v: ${m.version})`;
        console.log(line);
        logStream.write(line + '\n');
    });
    
    const footer = '==================================================\n';
    console.log(footer);
    logStream.write(footer + '\n');


    // 2. Test Generation for specific 'Thinking' candidates
    const candidates = ['gemini-2.5-pro', 'gemini-exp-1206', 'gemini-2.5-flash'];
    
    console.log('\n================ Testing Candidates ================');

    for (const modelName of candidates) {
        process.stdout.write(`Testing ${modelName} ... `);
        
        try {
            const genUrl = `${baseUrl}/models/${modelName}:generateContent?key=${apiKey}`;
            const res = await fetch(genUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: "Hi" }] }]
                })
            });
            
            const data = await res.json();
            
            if (res.ok && data.candidates?.[0]?.content) {
                console.log(`✅ SUCCESS!`);
                logStream.write(`Testing ${modelName} ... ✅ SUCCESS!\n`);
            } else {
                console.log(`❌ (${res.status})`);
                logStream.write(`Testing ${modelName} ... ❌ (${res.status}) - ${JSON.stringify(data)}\n`);
            }
        } catch (e: any) {
            console.log(`❌ Error`);
            logStream.write(`Testing ${modelName} ... ❌ Error: ${e.message}\n`);
        }
    }

}

diagnose();
