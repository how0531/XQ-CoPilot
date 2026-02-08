
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// 1. 初始化 Firebase Admin
// 讀取 Service Account Key (假設位於專案根目錄的上一層，即 XQ chatbot 根目錄)
const SERVICE_ACCOUNT_PATH = path.join(process.cwd(), '..', 'serviceAccountKey.json');

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error(`❌ 錯誤：找不到 Service Account Key。請確認檔案位於：${SERVICE_ACCOUNT_PATH}`);
  console.error('💡 提示：請確保您已下載 serviceAccountKey.json 並放置於專案根目錄。');
  process.exit(1);
}

// 避免重複初始化
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin 初始化成功');
  } catch (error) {
    console.error('❌ Firebase Admin 初始化失敗:', error);
    process.exit(1);
  }
}

const db = admin.firestore();
const KNOWLEDGE_COLLECTION = 'knowledge_base';
const AGENT_DIR = path.join(process.cwd(), '..', '.agent'); // 指向 .agent 資料夾

async function seedKnowledgeBase() {
  console.log(`🚀 開始掃描知識庫：${AGENT_DIR}`);

  if (!fs.existsSync(AGENT_DIR)) {
    console.error(`❌ 錯誤：找不到 .agent 資料夾：${AGENT_DIR}`);
    process.exit(1);
  }

  try {
    // 2. 遞迴讀取檔案 (.md 和 .xs)
    // 使用 glob 模式匹配
    const files = await glob('**/*.{md,xs}', { 
      cwd: AGENT_DIR,
      ignore: ['**/node_modules/**', '**/.git/**'] 
    });

    console.log(`mb 找到 ${files.length} 個檔案，準備上傳...`);

    const batchSize = 100; // Firestore Batch 上限為 500
    let batch = db.batch();
    let counter = 0;
    let totalUploaded = 0;

    for (const file of files) {
      const filePath = path.join(AGENT_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // 解析路徑資訊
      // file 可能是 "skills/trading_script/strategy.md"
      const pathParts = file.split(/[/\\]/); // 處理 Windows/Unix 路徑分隔符
      const fileName = pathParts.pop() || '';
      // Category 取父資料夾名稱，如果沒有父資料夾則為 root
      const category = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'root';
      const fileType = path.extname(fileName);
      
      // ID 使用檔案名稱 (移除副檔名，或保留看需求，這裡保留以確保唯一性如 .md vs .xs)
      // 用戶說 "ID": "檔案名稱"
      const docId = fileName; 

      const docRef = db.collection(KNOWLEDGE_COLLECTION).doc(docId);
      
      const docData = {
        id: docId,
        title: fileName, // 用戶要求 Title 也是檔案名稱
        content: fileContent,
        category: category,
        fileType: fileType,
        path: file, // 額外紀錄相對路徑，方便除錯
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(docRef, docData, { merge: true }); // 使用 merge 避免覆蓋掉可能存在的其他欄位
      
      counter++;
      
      if (counter >= batchSize) {
        await batch.commit();
        totalUploaded += counter;
        console.log(`...已上傳 ${totalUploaded} 筆資料`);
        batch = db.batch(); // 重置 batch
        counter = 0;
      }
    }

    if (counter > 0) {
      await batch.commit();
      totalUploaded += counter;
    }

    console.log(`🎉 成功完成！共上傳 ${totalUploaded} 筆資料到 '${KNOWLEDGE_COLLECTION}'。`);

  } catch (error) {
    console.error('❌ 執行失敗:', error);
    process.exit(1);
  }
}

seedKnowledgeBase();
