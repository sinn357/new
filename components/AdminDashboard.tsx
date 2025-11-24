'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAdmin } from '@/contexts/AdminContext'
import Link from 'next/link'

interface AdminDashboardProps {
  isOpen: boolean
  onClose: () => void
}

interface Stats {
  totalWorks: number
  totalArchives: number
  totalCategories: number
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const { isAdmin, logout } = useAdmin()
  const [stats, setStats] = useState<Stats>({
    totalWorks: 0,
    totalArchives: 0,
    totalCategories: 0
  })

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchStats()
    }
  }, [isOpen, isAdmin])

  const fetchStats = async () => {
    try {
      // Fetch works
      const worksRes = await fetch('/api/works')
      const worksData = await worksRes.json()

      // Fetch archives
      const archivesRes = await fetch('/api/archives')
      const archivesData = await archivesRes.json()

      // Calculate unique categories
      const workCategories = new Set(worksData.works?.map((w: any) => w.category) || [])
      const archiveCategories = new Set(archivesData.archives?.map((a: any) => a.category) || [])
      const totalCategories = new Set([...workCategories, ...archiveCategories]).size

      setStats({
        totalWorks: worksData.works?.length || 0,
        totalArchives: archivesData.archives?.length || 0,
        totalCategories
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const quickActions = [
    { label: 'New Work Post', href: '/work', icon: '💼', color: 'from-indigo-500 to-purple-500' },
    { label: 'New Archive Post', href: '/archive', icon: '📝', color: 'from-teal-500 to-green-500' },
    { label: 'Edit Home Content', href: '/', icon: '🏠', color: 'from-orange-500 to-red-500' },
  ]

  if (!isAdmin) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4"
          >
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-teal-500 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      ⚙️
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                      <p className="text-white/80 text-sm">Quick actions & statistics</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="text-white/80 hover:text-white text-3xl leading-none"
                  >
                    ×
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6">
                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    📝 Quick Actions
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                      <Link
                        key={action.href}
                        href={action.href}
                        onClick={onClose}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow`}
                        >
                          <div className="text-3xl mb-2">{action.icon}</div>
                          <p className="text-white text-sm font-medium">{action.label}</p>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    📊 Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-4 rounded-xl border border-indigo-200 dark:border-indigo-700">
                      <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1">Total Works</p>
                      <p className="text-3xl font-bold text-indigo-900 dark:text-indigo-300">{stats.totalWorks}</p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/30 p-4 rounded-xl border border-teal-200 dark:border-teal-700">
                      <p className="text-teal-600 dark:text-teal-400 text-sm font-medium mb-1">Total Archives</p>
                      <p className="text-3xl font-bold text-teal-900 dark:text-teal-300">{stats.totalArchives}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 rounded-xl border border-purple-200 dark:border-purple-700">
                      <p className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-1">Categories</p>
                      <p className="text-3xl font-bold text-purple-900 dark:text-purple-300">{stats.totalCategories}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Status */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="text-green-900 dark:text-green-300 font-semibold">Admin Mode: ON</p>
                        <p className="text-green-700 dark:text-green-400 text-sm">You have full access to edit content</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={logout}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Logout
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
