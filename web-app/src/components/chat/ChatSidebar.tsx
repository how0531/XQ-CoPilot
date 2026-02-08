'use client';

// 聊天側邊欄元件
import { useEffect, useState } from 'react';
import { Conversation } from '@/types/message';
import { getUserChats, deleteChat } from '@/lib/chatService';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import UserProfile from '@/components/auth/UserProfile';

interface ChatSidebarProps {
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({ 
  currentChatId, 
  onSelectChat, 
  onNewChat,
  isOpen,
  onClose
}: ChatSidebarProps) {
  const { user, isGuestMode } = useAuth();
  const [chats, setChats] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  // 載入對話列表
  useEffect(() => {
    if (user && !isGuestMode) {
      loadChats();
    }
  }, [user, isGuestMode, currentChatId]); // currentChatId 改變時也重新載入（更新預覽/時間）

  const loadChats = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserChats(user.uid);
      setChats(data);
    } catch (error) {
      console.error('載入對話失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!confirm('確定要刪除此對話紀錄嗎？')) return;

    try {
      await deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (currentChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  };

  // 格式化時間：如果是今天顯示時間，否則顯示日期
  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate();
      const now = new Date();
      const isToday = date.getDate() === now.getDate() && 
                      date.getMonth() === now.getMonth() && 
                      date.getFullYear() === now.getFullYear();
      
      return isToday 
        ? date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  if (isGuestMode) {
    return null; // 訪客模式不顯示側邊欄
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col h-full shadow-xl md:shadow-none`}>
        
        {/* Header: Title & Close Button */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 md:static z-10">
           <h2 className="font-bold text-lg text-gray-800 dark:text-gray-200">歷史對話</h2>
           <button 
             onClick={onClose} 
             className="md:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
             aria-label="關閉選單"
           >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            新對話
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-500 text-sm">
              <svg className="w-12 h-12 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              尚無對話紀錄
            </div>
          ) : (
            chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  if (window.innerWidth < 768) onClose();
                }}
                className={`group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-all border ${
                  currentChatId === chat.id
                    ? 'bg-white dark:bg-gray-800 border-indigo-200 dark:border-indigo-500/30 shadow-sm ring-1 ring-indigo-50 dark:ring-indigo-900/50'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <h3 className={`font-medium text-sm truncate pr-2 flex-1 ${
                    currentChatId === chat.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {chat.title || '新對話'}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap ml-1 mt-0.5 font-mono">
                    {formatTime(chat.updatedAt)}
                  </span>
                </div>
                
                <p className={`text-xs truncate pr-6 h-4 ${
                  currentChatId === chat.id ? 'text-gray-500 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'
                }`}>
                  {chat.preview || '無預覽內容'}
                </p>

                {/* Delete Button (Hover Only) */}
                <button
                  onClick={(e) => handleDeleteChat(e, chat.id)}
                  className="absolute right-2 bottom-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  title="刪除對話"
                  aria-label="刪除對話"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
        
        {/* Footer: User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
           <UserProfile />
        </div>
      </div>
    </>
  );
}
