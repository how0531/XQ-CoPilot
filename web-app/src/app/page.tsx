'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/auth/LoginButton';
import UserProfile from '@/components/auth/UserProfile';
import ChatContainer from '@/components/chat/ChatContainer';

export default function Home() {
  const { user, loading } = useAuth();

  // 載入中狀態
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-gray-600">載入中...</div>
      </div>
    );
  }

  // 未登入：顯示登入頁面
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-8 p-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">
              XQ Chatbot
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              專業的 XS 腳本語言 AI 助理
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              協助您編寫交易、指標、警示與選股腳本
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  // 已登入：顯示聊天介面
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 頂部導航欄 */}
      <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            XQ Chatbot
          </h1>
          <p className="text-sm text-gray-500">XS 腳本語言助理</p>
        </div>
        <UserProfile />
      </header>

      {/* 聊天介面 */}
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}
