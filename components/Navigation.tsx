'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
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
      </div>
    </nav>
  )
}
