// TypeScript 類型定義 - Skill
export interface Skill {
  name: string;          // 技能名稱（例如：交易腳本專家）
  description: string;   // 技能描述
  path: string;          // SKILL.md 檔案路徑
  content: string;       // SKILL.md 完整內容
}

export interface SkillMetadata {
  name: string;
  description: string;
  path: string;
}
