// 用戶設定管理模組（Firestore）
import { db } from './firebase';
import { doc, getDoc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { GoogleGenerativeAI } from '@google/generative-ai';

const USER_SETTINGS_COLLECTION = 'user_settings';

/**
 * 取得用戶的 Gemini API Key
 */
export async function getUserApiKey(userId: string): Promise<string | null> {
  try {
    if (!db) return null; // 訪客模式
    
    const docRef = doc(db, USER_SETTINGS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // 解碼 Base64
      return data.geminiApiKey ? atob(data.geminiApiKey) : null;
    }
    return null;
  } catch (error) {
    console.error('取得用戶 API Key 失敗:', error);
    return null;
  }
}

/**
 * 儲存用戶的 Gemini API Key（Base64 編碼）
 */
export async function saveUserApiKey(userId: string, apiKey: string): Promise<void> {
  try {
    if (!db) throw new Error('Firebase 未初始化');
    
    // Base64 編碼
    const encodedKey = btoa(apiKey);
    
    const docRef = doc(db, USER_SETTINGS_COLLECTION, userId);
    await setDoc(docRef, {
      userId,
      geminiApiKey: encodedKey,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('儲存用戶 API Key 失敗:', error);
    throw error;
  }
}

/**
 * 刪除用戶的 Gemini API Key
 */
export async function deleteUserApiKey(userId: string): Promise<void> {
  try {
    if (!db) throw new Error('Firebase 未初始化');
    
    const docRef = doc(db, USER_SETTINGS_COLLECTION, userId);
    await setDoc(docRef, {
      geminiApiKey: null,
      updatedAt: Timestamp.now(),
    }, { merge: true });
  } catch (error) {
    console.error('刪除用戶 API Key 失敗:', error);
    throw error;
  }
}

/**
 * 驗證 Gemini API Key 是否有效
 */
export async function validateGeminiApiKey(apiKey: string): Promise<boolean> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    // 發送測試請求
    const result = await model.generateContent('test');
    const response = await result.response;
    
    return !!response.text();
  } catch (error) {
    console.error('API Key 驗證失敗:', error);
    return false;
  }
}
