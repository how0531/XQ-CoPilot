'use client';

// XQ Chatbot 主頁面 - 專業 UI/UX 設計
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '@/components/auth/LoginButton';
import ChatContainer from '@/components/chat/ChatContainer';
import ChatSidebar from '@/components/chat/ChatSidebar';

export default function Home() {
  const { user, loading, isGuestMode, enterGuestMode } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 載入狀態 - 使用 Skeleton Screen 避免 Content Jumping
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  // 登入頁面 - 符合 UI/UX Pro Max 設計原則
  // 如果非訪客且未登入，顯示登入頁面
  if (!user && !isGuestMode) {
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
            {/* Logo/Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              XQ Chatbot
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-300">
              專業的 XS 腳本語言 AI 助理
            </p>
          </div>

          <LoginButton />
          
          <button
            onClick={() => enterGuestMode()}
            className="w-full mt-4 py-2 px-4 bg-white/50 hover:bg-white/70 dark:bg-gray-800/50 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors border border-gray-200 dark:border-gray-700"
          >
            訪客預覽 (Guest Preview)
          </button>

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

  // 聊天介面（已登入或訪客模式）- 專業布局
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* 側邊欄 */}
      <ChatSidebar
        currentChatId={selectedChatId}
        onSelectChat={(id) => {
          setSelectedChatId(id);
          setIsSidebarOpen(false); // Mobile: 選擇後關閉
        }}
        onNewChat={() => {
          setSelectedChatId(undefined);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 主要內容區域 */}
      <div className="flex-1 flex flex-col h-full w-full relative">
        {/* 頂部導航欄 */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-sm border-b border-gray-200 dark:border-gray-700 z-20">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Logo & Title */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white hidden sm:block">
                  XQ Chatbot
                </h1>
                {isGuestMode && (
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium dark:bg-orange-900/30 dark:text-orange-400">
                    訪客模式
                  </span>
                )}
              </div>
            </div>

            {/* Warning / Status */}
            {isGuestMode && (
               <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                訪客預覽模式 (使用系統 API Key)
              </div>
            )}
          </div>
        </header>

        {/* 對話區域 */}
        <main className="flex-1 overflow-hidden relative">
          <ChatContainer
            key={selectedChatId || 'new'} // 確保切換對話時重新掛載
            chatId={selectedChatId}
            onChatCreated={(newId) => setSelectedChatId(newId)}
          />
        </main>
      </div>
    </div>
  );
}
