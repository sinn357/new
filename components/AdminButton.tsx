'use client';

import { useAdmin } from '@/contexts/AdminContext';

export default function AdminButton() {
  const { isAdmin, logout, setShowLoginModal } = useAdmin();

  if (isAdmin) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          관리자 모드
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowLoginModal(true)}
      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
    >
      🔐 관리자
    </button>
  );
}