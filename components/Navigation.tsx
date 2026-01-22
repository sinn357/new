'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'
import { useAdmin } from '@/contexts/AdminContext'

const menuItems = [
  { label: 'Work', href: '/work' },
  { label: 'Archive', href: '/archive' },
  { label: 'About', href: '/about' },
]

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isAdmin } = useAdmin()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-lg py-3'
            : 'bg-transparent py-6'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo with Hover Effect */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" aria-label="Home">
                <div className="flex items-center justify-center h-10 w-10 rounded-full border border-indigo-200/60 dark:border-indigo-400/40 bg-white/40 dark:bg-gray-900/40 backdrop-blur">
                  <svg
                    viewBox="0 0 48 48"
                    className="h-6 w-6 text-indigo-600 dark:text-indigo-300"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M10 36V12" />
                    <path d="M38 36V12" />
                    <path d="M10 24H38" />
                    <circle cx="24" cy="24" r="3" />
                  </svg>
                </div>
              </Link>
            </motion.div>

            {/* Center Menu - Glass Dock Style (Desktop) */}
            <div className="hidden md:flex items-center gap-1 backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 rounded-full px-2 py-2 shadow-xl">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      href={item.href}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-lg'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className="backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 rounded-full">
                  <ThemeToggle />
                </div>
              </motion.div>


              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="md:hidden p-2 rounded-full backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <div className="text-xl text-gray-700 dark:text-gray-300">
                  {mobileMenuOpen ? '✕' : '☰'}
                </div>
              </motion.button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu with Slide Animation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-t border-white/20 dark:border-gray-700/20 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link
                        href={item.href}
                        onClick={handleCloseMenu}
                        className={`block px-4 py-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-lg'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  )
}
