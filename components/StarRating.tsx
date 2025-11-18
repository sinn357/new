'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value?: number | null;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 'md'
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const currentRating = value || 0;
  const displayRating = readonly ? currentRating : (hoverRating || currentRating);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverRating(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={`
            transition-all duration-150
            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}
            ${!readonly && 'focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded'}
          `}
          aria-label={`${rating}점`}
        >
          <Star
            className={`
              ${sizeClasses[size]}
              transition-colors duration-150
              ${rating <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300 dark:text-gray-600'
              }
            `}
          />
        </button>
      ))}
      {!readonly && currentRating > 0 && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {currentRating}/5
        </span>
      )}
    </div>
  );
}
