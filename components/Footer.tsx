'use client'

import { FaEnvelope } from 'react-icons/fa'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
  const socialLinks = [
    {
      icon: <FaEnvelope />,
      href: 'mailto:sinn357@naver.com',
      label: 'Email',
      color: 'hover:text-teal-400'
    },
  ]

  return (
    <footer className="relative mt-16 overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 -z-10">
        <svg
          className="absolute bottom-0 w-full h-32"
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ d: "M0,60 C240,90 480,30 720,60 C960,90 1200,30 1440,60 L1440,120 L0,120 Z" }}
            animate={{
              d: [
                "M0,60 C240,90 480,30 720,60 C960,90 1200,30 1440,60 L1440,120 L0,120 Z",
                "M0,60 C240,30 480,90 720,60 C960,30 1200,90 1440,60 L1440,120 L0,120 Z",
                "M0,60 C240,90 480,30 720,60 C960,90 1200,30 1440,60 L1440,120 L0,120 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            fill="url(#gradient)"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgb(99, 102, 241)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Glass Footer Content */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-t border-white/20 dark:border-gray-700/20 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Connect - Centered */}
          <div className="text-center mb-8">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Connect
            </h4>
            <div className="flex gap-6 justify-center">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.2, y: -4 }}
                  whileTap={{ scale: 0.9 }}
                  className={`text-3xl text-gray-600 dark:text-gray-400 ${social.color} transition-colors`}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 dark:border-gray-700 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                © {new Date().getFullYear()} SHIN. All rights reserved.
              </p>
              <p className="flex items-center gap-2">
                Made with <span className="text-red-500">❤️</span> using <span className="font-semibold text-gray-800 dark:text-gray-200">Next.js 15</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
