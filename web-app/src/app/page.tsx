'use client';

// XQ Chatbot 主頁面 - 專業 UI/UX 設計
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/auth/LoginButton';
import UserProfile from '@/components/auth/UserProfile';
import ChatContainer from '@/components/chat/ChatContainer';

export default function Home() {
  const { user, loading } = useAuth();

  // 載入狀態 - 使用 Skeleton Screen 避免 Content Jumping
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  // 登入頁面 - 符合 UI/UX Pro Max 設計原則
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
        {/* 背景裝飾元素 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* 登入卡片 - Glass Morphism */}
        <div className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 sm:p-12 max-w-md w-full border border-white/20">
          <div className="text-center mb-8">
            {/* Logo/Icon Placeholder - 使用 SVG 而非 emoji */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            
            {/* 標題 - WCAG AA 色彩對比 */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              XQ Chatbot
            </h1>
            
            {/* 副標題 - 充足對比度 (slate-600 > 4.5:1) */}
            <p className="text-lg text-slate-600 dark:text-slate-300">
              專業的 XS 腳本語言 AI 助理
            </p>
          </div>

          {/* 登入按鈕 */}
          <LoginButton />

          {/* 提示文字 - 符合 color-contrast 原則 */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            使用 Google 帳號安全登入
          </p>

          {/* 功能特點 */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>即時 AI 對話，專業腳本建議</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>多種專業技能（交易/指標/警示）</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>雲端儲存對話歷史記錄</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 聊天介面（已登入）- 專業布局
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* 頂部導航欄 - 浮動設計 (避免 content hiding) */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo - SVG Icon */}
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              XQ Chatbot
            </h1>
          </div>
          <UserProfile />
        </div>
      </header>

      {/* 對話區域 - 確保不會被 navigation 遮擋 */}
      <main className="flex-1 overflow-hidden">
        <ChatContainer />
      </main>
    </div>
  );
}
