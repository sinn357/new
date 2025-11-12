'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import MobileMenu from './MobileMenu'
import ThemeToggle from './ThemeToggle'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleCloseMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <>
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md bg-white/80 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          신우철
        </Link>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex space-x-6 text-gray-700 font-medium">
            {[
              { label: 'Work', href: '/work' },
              { label: 'Archive', href: '/archive' },
              { label: 'About', href: '/about' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-all duration-200 hover:scale-105 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:bg-clip-text"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>

        {/* 모바일 버튼들 */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="메뉴 열기"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    {/* 모바일 메뉴 */}
    <MobileMenu
      isOpen={mobileMenuOpen}
      onClose={handleCloseMenu}
    />
  </>
  )
}
