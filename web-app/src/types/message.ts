// TypeScript 類型定義 - 訊息
import { Timestamp } from 'firebase/firestore';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Timestamp;
  skillUsed?: string; // 使用的 Skill 名稱（可選）
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preview?: string; // 最後一則訊息預覽
  messages?: Message[]; // 完整訊息（可選，僅在進入聊天室時載入）
  skillName?: string; // 使用的 Skill
}
