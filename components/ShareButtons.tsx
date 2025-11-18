'use client';

import { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link2, Check, Printer } from 'lucide-react';

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export default function ShareButtons({ url, title, description = '' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative">
      {/* Main Share Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="
          inline-flex items-center gap-2 px-4 py-2
          bg-gray-100 dark:bg-gray-700
          hover:bg-gray-200 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-200
          rounded-lg font-medium text-sm
          transition-all duration-200
          border border-gray-300 dark:border-gray-600
        "
      >
        <Share2 className="w-4 h-4" />
        공유하기
      </button>

      {/* Share Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                공유하기
              </p>
            </div>

            <div className="p-2">
              {/* Twitter */}
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <Twitter className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Twitter에 공유</span>
              </a>

              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <Facebook className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-200">Facebook에 공유</span>
              </a>

              {/* LinkedIn */}
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                onClick={() => setShowMenu(false)}
              >
                <Linkedin className="w-5 h-5 text-blue-700" />
                <span className="text-sm text-gray-700 dark:text-gray-200">LinkedIn에 공유</span>
              </a>

              <div className="my-2 border-t border-gray-200 dark:border-gray-700" />

              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">링크 복사됨!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-200">링크 복사</span>
                  </>
                )}
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <Printer className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-200">인쇄</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
