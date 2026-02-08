
import { loadCoreDocs } from '../src/lib/skillLoader';
import path from 'path';

async function main() {
  console.log('Testing loadCoreDocs...');
  console.log('Testing loadCoreDocs with auto-discovery...');
  console.log('Current Process CWD:', process.cwd());

  const content = await loadCoreDocs();
  
  if (content.length > 0) {
    console.log('✅ loadCoreDocs success!');
    console.log('Content length:', content.length);
    console.log('Preview:', content.substring(0, 200));
  } else {
    console.error('❌ loadCoreDocs returned empty string.');
  }
}

main().catch(console.error);
