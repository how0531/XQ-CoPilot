'use client';

// 對話容器主元件
import { useState, useEffect, useRef } from 'react';
import { Message } from '@/types/message';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { createChat, getChatMessages, saveMessageToChat } from '@/lib/chatService';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

interface ChatContainerProps {
  chatId?: string;
  onChatCreated?: (chatId: string) => void;
}

export default function ChatContainer({ chatId, onChatCreated }: ChatContainerProps) {
  const { user, isGuestMode } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // 載入歷史訊息
  useEffect(() => {
    async function loadMessages() {
      if (chatId && user && !isGuestMode) {
        try {
          const history = await getChatMessages(chatId);
          setMessages(history);
        } catch (error) {
          console.error('載入訊息失敗:', error);
        }
      } else {
        setMessages([]);
      }
    }
    loadMessages();
  }, [chatId, user, isGuestMode]);

  const handleSendMessage = async (content: string) => {
    if (isSending) return;
    setIsSending(true);

    // 1. 準備使用者訊息
    const tempUserMessageId = Date.now().toString();
    const userMessage: Message = {
      id: tempUserMessageId,
      role: 'user',
      content,
      timestamp: Timestamp.now(),
    };

    // 樂觀更新 UI
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let currentChatId = chatId;

      // 2. 如果是新對話且非訪客模式，先建立對話與儲存訊息
      if (!isGuestMode && user) {
        if (!currentChatId) {
          currentChatId = await createChat(user.uid, content, '交易腳本專家');
          // 通知父元件更新 URL，但不中斷流程
          if (onChatCreated) onChatCreated(currentChatId);
        }
        
        // 儲存使用者訊息
        if (currentChatId) {
          await saveMessageToChat(currentChatId, {
            role: 'user',
            content,
            timestamp: Timestamp.now(),
          });
        }
      }

      // 3. 呼叫 Chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          skillName: '交易腳本專家',
          userId: user?.uid || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API 請求失敗');
      }

      // 4. 處理 AI 回應串流
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMessageId = (Date.now() + 1).toString();

      // 先顯示空的 AI 訊息
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Timestamp.now(),
          skillUsed: '交易腳本專家',
        },
      ]);

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
              assistantContent += parsed.text;
              
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'assistant') {
                  lastMsg.content = assistantContent;
                }
                return newMessages;
              });
            } catch (e) {
              console.error('解析串流資料失敗:', e);
            }
          }
        }
      }

      // 5. 完整回應後儲存 AI 訊息（非訪客模式）
      if (!isGuestMode && currentChatId && assistantContent) {
        await saveMessageToChat(currentChatId, {
          role: 'assistant',
          content: assistantContent,
          timestamp: Timestamp.now(),
          skillUsed: '交易腳本專家',
        });
      }

    } catch (error: any) {
      console.error('傳送訊息失敗:', error);
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: `❌ 錯誤：${error.message}\n\n提示：請在個人設定中配置您的 Gemini API Key，或確認網路連線。`,
        timestamp: Timestamp.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      <MessageList messages={messages} />
      {isLoading && <TypingIndicator />}
      <MessageInput onSend={handleSendMessage} disabled={isLoading || isSending} />
    </div>
  );
}
