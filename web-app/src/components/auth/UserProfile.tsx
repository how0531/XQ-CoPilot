'use client';

// 使用者個人資料顯示元件（含登出按鈕）
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function UserProfile() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const handleSignOut = async () => {
    if (confirm('確定要登出嗎？')) {
      await signOut();
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {user.photoURL && (
        <Image
          src={user.photoURL}
          alt={user.displayName || '使用者頭像'}
          width={40}
          height={40}
          className="rounded-full"
        />
      )}
      <div className="flex-1">
        <p className="font-medium text-sm">{user.displayName}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      <button
        onClick={handleSignOut}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        登出
      </button>
    </div>
  );
}
