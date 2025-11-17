import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Sidebar (for future use)
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // View preferences
  workViewMode: 'grid' | 'list'
  archiveViewMode: 'grid' | 'list'
  setWorkViewMode: (mode: 'grid' | 'list') => void
  setArchiveViewMode: (mode: 'grid' | 'list') => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Initial state
      theme: 'system',
      sidebarOpen: true,
      workViewMode: 'grid',
      archiveViewMode: 'grid',

      // Theme actions
      setTheme: (theme) => set({ theme }),

      // Sidebar actions
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      // View mode actions
      setWorkViewMode: (workViewMode) => set({ workViewMode }),
      setArchiveViewMode: (archiveViewMode) => set({ archiveViewMode }),
    }),
    {
      name: 'ui-storage', // localStorage key
    }
  )
)
