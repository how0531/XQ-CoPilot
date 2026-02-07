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
  messages: Message[];
}
