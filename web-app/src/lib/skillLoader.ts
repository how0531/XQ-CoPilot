// Skill 動態載入器
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { Skill, SkillMetadata } from '@/types/skill';

const SKILLS_DIR = path.join(process.cwd(), '..', '.agent', 'skills');

/**
 * 載入所有 Skills 的 Metadata
 */
export async function loadAllSkillsMetadata(): Promise<SkillMetadata[]> {
  try {
    const skillDirs = await fs.readdir(SKILLS_DIR);
    const skills: SkillMetadata[] = [];

    for (const dir of skillDirs) {
      const skillPath = path.join(SKILLS_DIR, dir, 'SKILL.md');
      
      try {
        const skillContent = await fs.readFile(skillPath, 'utf-8');
        const { data } = matter(skillContent);

        skills.push({
          name: data.name || dir,
          description: data.description || '',
          path: skillPath,
        });
      } catch (error) {
        console.warn(`無法載入 Skill: ${dir}`, error);
      }
    }

    return skills;
  } catch (error) {
    console.error('載入 Skills 失敗:', error);
    return [];
  }
}

/**
 * 載入特定 Skill 的完整內容
 */
export async function loadSkillContent(skillName: string): Promise<Skill | null> {
  try {
    const skillDirs = await fs.readdir(SKILLS_DIR);
    
    for (const dir of skillDirs) {
      const skillPath = path.join(SKILLS_DIR, dir, 'SKILL.md');
      
      try {
        const skillContent = await fs.readFile(skillPath, 'utf-8');
        const { data, content } = matter(skillContent);

        if (data.name === skillName || dir === skillName) {
          return {
            name: data.name || dir,
            description: data.description || '',
            path: skillPath,
            content: content, // Markdown 內容（不含 YAML Frontmatter）
          };
        }
      } catch (error) {
        console.warn(`無法讀取 Skill: ${dir}`, error);
      }
    }

    return null;
  } catch (error) {
    console.error('載入 Skill 內容失敗:', error);
    return null;
  }
}

/**
 * 載入核心 XS 文件 (取代原本不存在的 XS_完整指引.md)
 * 包含：內建函數、系統函數、XS語法運用 (Rank等)
 */
export async function loadCoreDocs(): Promise<string> {
  try {
    // 嘗試多種可能的路徑 (適應 Dev 與 Production 環境)
    const potentialPaths = [
      path.join(process.cwd(), '..', '說明'), // Dev: web-app/../說明
      path.join(process.cwd(), '說明'),       // Root: 說明
      path.join(__dirname, '..', '..', '..', '..', '說明') // Built: .next/server/app/api/...
    ];

    let docsDir = '';
    for (const p of potentialPaths) {
      try {
        await fs.access(p);
        docsDir = p;
        break;
      } catch {
        continue;
      }
    }

    if (!docsDir) {
       console.warn(`[loadCoreDocs] 找不到說明資料夾。CWD: ${process.cwd()}`);
       return '';
    }

    const filesToLoad = ['1_XS_語法教科書.md', '內建.md', '系統.md', '2_XS_函數字典.md'];
    
    let combinedContent = '';

    for (const file of filesToLoad) {
      const filePath = path.join(docsDir, file);
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        combinedContent += `\n\n# 文件: ${file}\n\n${content}`;
        console.log(`[loadCoreDocs] 已載入: ${filePath}`); // Debug log (optional)
      } catch (err) {
        console.warn(`[loadCoreDocs] 無法載入文件 (Skipping): ${file}`, err);
        // Skip this file and continue
      }
    }

    return combinedContent;
  } catch (error) {
    console.error('載入核心文件失敗:', error);
    return '';
  }
}

/**
 * 載入 API 索引
 */
export async function loadAPIIndex(): Promise<string> {
  try {
    const apiIndexPath = path.join(process.cwd(), '..', 'references', 'api_index.md');
    return await fs.readFile(apiIndexPath, 'utf-8');
  } catch (error) {
    console.error('載入 api_index.md 失敗:', error);
    return '';
  }
}
