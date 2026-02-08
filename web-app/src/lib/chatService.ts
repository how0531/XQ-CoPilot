// Chat Service - 處理 Firestore 對話紀錄操作
import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  serverTimestamp,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { Message, Conversation } from '@/types/message';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

/**
 * 建立新對話
 */
export async function createChat(userId: string, firstMessage: string, skillName: string): Promise<string> {
  if (!db) throw new Error('Firebase 未初始化');

  // 自動生成標題（取前 20 個字）
  const title = firstMessage.substring(0, 20) + (firstMessage.length > 20 ? '...' : '');

  const chatData = {
    userId,
    title,
    skillName,
    preview: title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, CHATS_COLLECTION), chatData);
  return docRef.id;
}

/**
 * 取得用戶的所有對話列表
 */
export async function getUserChats(userId: string, limitCount = 20): Promise<Conversation[]> {
  if (!db) return [];

  const q = query(
    collection(db, CHATS_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Conversation));
}

/**
 * 取得特定對話的訊息
 */
export async function getChatMessages(chatId: string): Promise<Message[]> {
  if (!db) return [];

  // 取得訊息 Sub-collection
  const q = query(
    collection(db, CHATS_COLLECTION, chatId, MESSAGES_COLLECTION),
    orderBy('timestamp', 'asc') // 訊息按時間順序排列
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Message));
}

/**
 * 儲存訊息到對話中
 */
export async function saveMessageToChat(chatId: string, message: Omit<Message, 'id'>): Promise<string> {
  if (!db) throw new Error('Firebase 未初始化');

  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const messagesRef = collection(chatRef, MESSAGES_COLLECTION);

  // 1. 新增訊息到 Sub-collection
  const msgDoc = await addDoc(messagesRef, {
    ...message,
    timestamp: serverTimestamp(), // 使用伺服器時間
  });

  // 2. 更新對話的 updatedAt 和 preview
  const preview = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
  await updateDoc(chatRef, {
    updatedAt: serverTimestamp(),
    preview: message.role === 'user' ? preview : undefined, // 僅更新為用戶訊息預覽，或可更新為最新訊息
  });

  return msgDoc.id;
}

/**
 * 刪除對話
 */
export async function deleteChat(chatId: string): Promise<void> {
  if (!db) throw new Error('Firebase 未初始化');

  // 注意：Client SDK 無法直接刪除 Sub-collection，通常需要 Cloud Function
  // 這裡僅刪除 Parent Document，Sub-collections 會變成孤兒（但在 Client 視角已消失）
  // 若要完整刪除，需遞迴刪除 Sub-collection
  
  await deleteDoc(doc(db, CHATS_COLLECTION, chatId));
}

/**
 * 更新對話標題
 */
export async function updateChatTitle(chatId: string, newTitle: string): Promise<void> {
  if (!db) throw new Error('Firebase 未初始化');

  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  await updateDoc(chatRef, {
    title: newTitle,
    updatedAt: serverTimestamp(),
  });
}
