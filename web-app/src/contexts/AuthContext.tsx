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
  enterGuestMode: () => void; // 手動進入訪客模式
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    // 1. 檢查是否缺少 Firebase 配置
    if (!isFirebaseConfigured) {
      console.warn('⚠️ 缺少 Firebase 配置，強制進入訪客模式');
      setIsGuestMode(true);
      setLoading(false);
      return;
    }

    // 2. 檢查 LocalStorage 是否有手動訪客標記
    const storedGuestMode = localStorage.getItem('xq_chatbot_guest_mode');
    if (storedGuestMode === 'true') {
      setIsGuestMode(true);
      setLoading(false);
      return;
    }

    // 3. 正常模式：監聽 Firebase Auth 狀態
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // 如果登入成功，確保退出訪客模式
      if (user) {
        setIsGuestMode(false);
        localStorage.removeItem('xq_chatbot_guest_mode');
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      alert('⚠️ 系統錯誤：缺少 Firebase 配置，無法登入');
      return;
    }
    
    // 如果在訪客模式下點擊登入，先清除訪客狀態
    if (isGuestMode) {
      setIsGuestMode(false);
      localStorage.removeItem('xq_chatbot_guest_mode');
    }

    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOut = async () => {
    if (isGuestMode) {
      setIsGuestMode(false);
      localStorage.removeItem('xq_chatbot_guest_mode');
      // 重新載入以觸發 Auth 狀態檢查
      window.location.reload();
      return;
    }
    await firebaseSignOut(auth);
  };

  const enterGuestMode = () => {
    setIsGuestMode(true);
    localStorage.setItem('xq_chatbot_guest_mode', 'true');
    setUser(null); // 確保清除使用者狀態
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isGuestMode, enterGuestMode }}>
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
