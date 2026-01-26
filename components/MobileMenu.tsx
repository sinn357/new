'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const prevPathname = useRef(pathname)

  // 라우트 변경 시 메뉴 닫기 (실제로 경로가 변경되었을 때만)
  useEffect(() => {
    if (prevPathname.current !== pathname && isOpen) {
      onClose()
      prevPathname.current = pathname
    }
  }, [pathname, isOpen, onClose])

  // ESC 키로 닫기 + 스크롤 방지
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // 스크롤 방지
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* 오버레이 배경 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 메뉴 패널 */}
      <div className="fixed top-0 right-0 bottom-0 w-64 bg-white dark:bg-gray-900 shadow-xl z-50 md:hidden">
        <div className="flex flex-col h-full">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <span className="text-lg font-semibold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent">
              Menu
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="메뉴 닫기"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 링크 목록 */}
          <nav className="flex-1 p-6">
            <ul className="space-y-4">
              {[
                { label: 'Work', href: '/work' },
                { label: 'Archive', href: '/archive' },
                { label: 'About', href: '/about' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-3 px-4 rounded-lg font-medium transition-all ${
                      pathname === item.href
                        ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 푸터 */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              © {new Date().getFullYear()} SHIN
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
