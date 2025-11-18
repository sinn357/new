'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SpoilerBlurProps {
  children: React.ReactNode;
}

export default function SpoilerBlur({ children }: SpoilerBlurProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div className="relative my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-yellow-400 dark:border-yellow-500">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-yellow-600 dark:text-yellow-400 text-sm font-semibold">
          ⚠️ 스포일러 주의
        </span>
      </div>

      <div
        className={`
          transition-all duration-300 relative
          ${isRevealed ? '' : 'blur-md select-none'}
        `}
      >
        {children}
      </div>

      {!isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={() => setIsRevealed(true)}
            className="
              bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700
              text-white px-6 py-3 rounded-lg font-medium
              shadow-lg hover:shadow-xl transition-all duration-300
              flex items-center gap-2
              transform hover:scale-105
            "
          >
            <Eye className="w-5 h-5" />
            스포일러 보기
          </button>
        </div>
      )}

      {isRevealed && (
        <button
          onClick={() => setIsRevealed(false)}
          className="
            mt-3 text-sm text-gray-600 dark:text-gray-400
            hover:text-gray-800 dark:hover:text-gray-200
            flex items-center gap-1 transition-colors
          "
        >
          <EyeOff className="w-4 h-4" />
          다시 숨기기
        </button>
      )}
    </div>
  );
}
