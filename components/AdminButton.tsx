'use client';

import { useAdmin } from '@/contexts/AdminContext';

export default function AdminButton() {
  const { isAdmin, logout, setShowLoginModal, isLoading } = useAdmin();

  if (isLoading) {
    return null; // 로딩 중에는 아무것도 표시하지 않음
  }

  if (isAdmin) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs shadow-lg">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          <button
            onClick={logout}
            className="hover:text-red-300 transition-colors"
            title="로그아웃"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowLoginModal(true)}
      className="fixed bottom-4 right-4 z-50 w-8 h-8 bg-gray-800/20 hover:bg-gray-800/40 backdrop-blur-sm rounded-full opacity-30 hover:opacity-60 transition-all duration-300 flex items-center justify-center text-xs"
      title="관리자"
    >
      ⚙
    </button>
  );
}