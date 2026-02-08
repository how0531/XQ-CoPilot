
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const REPO_URL = 'https://github.com/mophyfei/xs-helper.git';
// 使用 .agent/external_cache 作為持久化緩存目錄 (Persistent Cache)
const CACHE_DIR = path.join(process.cwd(), '.agent', 'external_cache');
const TARGET_FILE = path.join(process.cwd(), '說明', '2_XS_函數字典.md');

// 確保緩存目錄存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const repoDir = path.join(CACHE_DIR, 'xs-helper');

try {
  console.log('🔄 開始同步 XS Helper 知識庫...');

  if (fs.existsSync(repoDir)) {
    console.log(`📂 發現現有知識庫: ${repoDir}`);
    console.log('⬇️  執行 git pull 更新...');
    execSync('git pull', { cwd: repoDir, stdio: 'inherit' });
  } else {
    console.log(`📥 初次下載，執行 git clone...`);
    execSync(`git clone ${REPO_URL} xs-helper`, { cwd: CACHE_DIR, stdio: 'inherit' });
  }

  const sourceFile = path.join(repoDir, 'xs-helper backup', 'all_documentation.md');
  
  if (fs.existsSync(sourceFile)) {
    console.log('📄 正在更新系統核心文件 (2_XS_函數字典.md)...');
    
    // 讀取並添加標頭資訊，標記更新時間
    const content = fs.readFileSync(sourceFile, 'utf-8');
    const header = `> [!NOTE]\n> 此文件自動同步自: ${REPO_URL}\n> 上次更新時間: ${new Date().toLocaleString('zh-TW')}\n\n`;
    
    fs.writeFileSync(TARGET_FILE, header + content, 'utf-8');
    console.log(`✅ 更新成功！已將最新知識寫入: ${TARGET_FILE}`);

  } else {
     console.error('❌ 錯誤: 在來源 Git Repo 中找不到 xs-helper backup/all_documentation.md');
  }

  // --- Sync xscript_preset (Official Examples) ---
  console.log('\n🔄 開始同步 XScript Preset (官方範例庫)...');
  const PRESET_REPO_URL = 'https://github.com/sysjust-xq/xscript_preset.git';
  const PRESET_DIR = path.join(process.cwd(), 'references', 'xscript_preset');

  if (fs.existsSync(PRESET_DIR)) {
     const gitDir = path.join(PRESET_DIR, '.git');
     if (fs.existsSync(gitDir)) {
        console.log(`📂 發現現有範例庫: ${PRESET_DIR}`);
        console.log('⬇️  執行 git pull 更新...');
        execSync('git pull', { cwd: PRESET_DIR, stdio: 'inherit' });
     } else {
        console.log(`⚠️  ${PRESET_DIR} 存在但不是 git repo，跳過更新。`);
     }
  } else {
     console.log(`📥 初次下載官方範例，執行 git clone...`);
     execSync(`git clone ${PRESET_REPO_URL} xscript_preset`, { cwd: path.dirname(PRESET_DIR), stdio: 'inherit' });
  }
  console.log('✅ XScript Preset 同步完成！');


} catch (error: any) {
  console.error('❌ 同步失敗:', error.message);
}
