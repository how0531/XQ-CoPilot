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
 * 載入 XS 完整指引
 */
export async function loadXSGuide(): Promise<string> {
  try {
    const guidePath = path.join(process.cwd(), '..', 'XS_完整指引.md');
    return await fs.readFile(guidePath, 'utf-8');
  } catch (error) {
    console.error('載入 XS_完整指引.md 失敗:', error);
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
