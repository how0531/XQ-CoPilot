// Firestore 對話記錄管理
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase';
import { Conversation, Message } from '@/types/message';

/**
 * 建立新對話
 */
export async function createConversation(
  userId: string,
  firstMessage: Message
): Promise<string> {
  try {
    const conversationData = {
      userId,
      title: firstMessage.content.substring(0, 50) + '...', // 取前 50 字作為標題
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      messages: [firstMessage],
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  } catch (error) {
    console.error('建立對話失敗:', error);
    throw error;
  }
}

/**
 * 更新對話（新增訊息）
 */
export async function addMessageToConversation(
  conversationId: string,
  message: Message
): Promise<void> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      messages: [...(await getConversationMessages(conversationId)), message],
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('新增訊息失敗:', error);
    throw error;
  }
}

/**
 * 取得使用者所有對話
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const conversations: Conversation[] = [];

    querySnapshot.forEach((doc) => {
      conversations.push({
        id: doc.id,
        ...doc.data(),
      } as Conversation);
    });

    return conversations;
  } catch (error) {
    console.error('取得對話列表失敗:', error);
    return [];
  }
}

/**
 * 取得特定對話的所有訊息
 */
async function getConversationMessages(conversationId: string): Promise<Message[]> {
  try {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDocs(query(collection(db, 'conversations'), where('__name__', '==', conversationId)));
    
    if (conversationDoc.empty) {
      return [];
    }

    const data = conversationDoc.docs[0].data();
    return data.messages || [];
  } catch (error) {
    console.error('取得對話訊息失敗:', error);
    return [];
  }
}
