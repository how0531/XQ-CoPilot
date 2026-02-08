'use client';

// 全域身份驗證狀態管理
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isGuestMode: boolean; // 是否為訪客模式
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  const isGuestMode = !isFirebaseConfigured;

  useEffect(() => {
    if (isGuestMode) {
      // ⚠️ 訪客模式：缺少 Firebase 配置，跳過初始化
      console.warn('⚠️ 訪客模式：缺少 Firebase 配置，AI 功能需要配置 API Keys');
      setUser(null);
      setLoading(false);
      return;
    }

    // 正常模式：監聽 Firebase Auth 狀態
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isGuestMode]);

  const signInWithGoogle = async () => {
    if (isGuestMode) {
      alert('⚠️ 訪客模式：請先在 .env.local 配置 Firebase API Keys 才能登入');
      return;
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    if (isGuestMode) return;
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isGuestMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必須在 AuthProvider 內部使用');
  }
  return context;
}
