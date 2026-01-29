'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LoginResult {
  success: boolean;
  message?: string;
  remainingAttempts?: number;
  lockedUntil?: number;
}

interface AdminContextType {
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 페이지 로드 시 서버에서 인증 상태 확인
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/check', {
        credentials: 'include', // 쿠키 포함
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAuthenticated);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 포함
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdmin(true);
        setShowLoginModal(false);
        return { success: true };
      } else {
        return {
          success: false,
          message: data.message || '로그인에 실패했습니다.',
          remainingAttempts: data.remainingAttempts,
          lockedUntil: data.lockedUntil
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: '네트워크 오류가 발생했습니다.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include', // 쿠키 포함
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAdmin(false);
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      login,
      logout,
      showLoginModal,
      setShowLoginModal,
      isLoading
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}