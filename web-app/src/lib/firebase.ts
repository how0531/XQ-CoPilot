// Firebase 配置與初始化
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// 檢查是否有必要的 Firebase 配置
const hasRequiredConfig = 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Firebase 配置對象
const firebaseConfig = hasRequiredConfig ? {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} : null;

// 初始化 Firebase App（防止 Hot Reload 重複初始化）
let app: FirebaseApp | null = null;

if (firebaseConfig) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

// 導出 Auth 和 Firestore 實例（訪客模式時為 null）
export const auth: Auth = app ? getAuth(app) : null as any;
export const db: Firestore = app ? getFirestore(app) : null as any;
export const isFirebaseConfigured = hasRequiredConfig;
