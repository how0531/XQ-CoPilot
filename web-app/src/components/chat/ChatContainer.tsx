'use client';

// 對話容器主元件
import { useState } from 'react';
import { Message } from '@/types/message';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

export default function ChatContainer() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (content: string) => {
    // 新增使用者訊息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Timestamp.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 呼叫 Chat API（加入 userId）
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          skillName: '交易腳本專家', // 預設使用交易腳本專家（之後可改為選單）
          userId: user?.uid || null, // 加入 userId 以讀取個人 API Key
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 請求失敗');
      }

      // 處理串流回應
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: Timestamp.now(),
        skillUsed: '交易腳本專家',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter((line) => line.startsWith('data: '));

          for (const line of lines) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              assistantMessage.content += parsed.text;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { ...assistantMessage };
                return newMessages;
              });
            } catch (e) {
              console.error('解析串流資料失敗:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('傳送訊息失敗:', error);
      
      // 顯示錯誤訊息給用戶
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `❌ 錯誤：${error.message}\n\n提示：請在個人設定中配置您的 Gemini API Key。`,
        timestamp: Timestamp.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <MessageList messages={messages} />
      {isLoading && <TypingIndicator />}
      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
