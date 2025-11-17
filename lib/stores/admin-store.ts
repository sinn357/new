import { create } from 'zustand'

interface AdminStore {
  // State
  isAdmin: boolean
  showLoginModal: boolean
  isLoading: boolean

  // Actions
  setIsAdmin: (isAdmin: boolean) => void
  setShowLoginModal: (show: boolean) => void
  setIsLoading: (loading: boolean) => void

  checkAuthStatus: () => Promise<void>
  login: (password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const useAdminStore = create<AdminStore>((set) => ({
  // Initial state
  isAdmin: false,
  showLoginModal: false,
  isLoading: true,

  // Actions
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setShowLoginModal: (showLoginModal) => set({ showLoginModal }),
  setIsLoading: (isLoading) => set({ isLoading }),

  checkAuthStatus: async () => {
    try {
      set({ isLoading: true })
      const response = await fetch('/api/admin/check', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        set({ isAdmin: data.isAuthenticated })
      } else {
        set({ isAdmin: false })
      }
    } catch (error) {
      console.error('Auth check error:', error)
      set({ isAdmin: false })
    } finally {
      set({ isLoading: false })
    }
  },

  login: async (password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password })
      })

      if (response.ok) {
        set({ isAdmin: true, showLoginModal: false })
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  },

  logout: async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      set({ isAdmin: false })
    }
  },
}))
