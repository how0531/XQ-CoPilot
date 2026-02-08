'use client';

// API Key 設定元件
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { saveUserApiKey, deleteUserApiKey, validateGeminiApiKey } from '@/lib/userSettings';

export default function APIKeySettings() {
  const { user, isGuestMode } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  // 檢查是否已有 API Key
  useEffect(() => {
    const checkExistingKey = async () => {
      if (user && !isGuestMode) {
        const { getUserApiKey } = await import('@/lib/userSettings');
        const existingKey = await getUserApiKey(user.uid);
        setHasExistingKey(!!existingKey);
      }
    };
    checkExistingKey();
  }, [user, isGuestMode]);

  const handleValidate = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: '請輸入 API Key' });
      return;
    }

    setIsValidating(true);
    setMessage(null);

    try {
      const isValid = await validateGeminiApiKey(apiKey);
      if (isValid) {
        setMessage({ type: 'success', text: '✅ API Key 有效！' });
      } else {
        setMessage({ type: 'error', text: '❌ API Key 無效，請檢查' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '驗證失敗，請稍後再試' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setMessage({ type: 'error', text: '請先登入' });
      return;
    }

    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: '請輸入 API Key' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      await saveUserApiKey(user.uid, apiKey);
      setMessage({ type: 'success', text: '✅ API Key 已儲存' });
      setHasExistingKey(true);
      setApiKey(''); // 清空輸入框
    } catch (error) {
      setMessage({ type: 'error', text: '儲存失敗，請稍後再試' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;

    if (!confirm('確定要刪除已儲存的 API Key？')) return;

    try {
      await deleteUserApiKey(user.uid);
      setMessage({ type: 'success', text: '✅ API Key 已刪除' });
      setHasExistingKey(false);
    } catch (error) {
      setMessage({ type: 'error', text: '刪除失敗，請稍後再試' });
    }
  };

  if (isGuestMode) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <p className="text-orange-800 dark:text-orange-200 text-sm">
          ⚠️ 訪客模式：請登入後才能儲存個人 API Key
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 說明 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 關於 Gemini API Key
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• 配置個人 API Key 可使用自己的免費額度</li>
          <li>• 取得方式：<a href="https://ai.google.dev/gemini-api/docs/api-key" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">Google AI Studio</a></li>
          <li>• API Key 會加密儲存，僅您可讀取</li>
        </ul>
      </div>

      {/* API Key 輸入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Gemini API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="AIzaSy..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      {/* 按鈕組 */}
      <div className="flex gap-3">
        <button
          onClick={handleValidate}
          disabled={isValidating || !apiKey.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isValidating ? '驗證中...' : '驗證'}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !apiKey.trim()}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? '儲存中...' : '儲存'}
        </button>
        {hasExistingKey && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            刪除已儲存的 Key
          </button>
        )}
      </div>

      {/* 訊息提示 */}
      {message && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* 當前狀態 */}
      {hasExistingKey && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✅ 已配置個人 API Key
          </p>
        </div>
      )}
    </div>
  );
}
