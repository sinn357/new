interface SkeletonCardProps {
  variant?: 'work' | 'archive';
}

export default function SkeletonCard({ variant = 'work' }: SkeletonCardProps) {
  if (variant === 'archive') {
    return (
      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 animate-pulse">
        {/* Thumbnail skeleton */}
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>

        {/* Category and date */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>

        {/* Title */}
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>

        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>

        {/* Read more button */}
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </article>
    );
  }

  // Work variant
  return (
    <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
      {/* Thumbnail skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>

      <div className="p-6">
        {/* Category and status */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        </div>

        {/* Title */}
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>

        {/* Content */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
        </div>

        {/* Tech stack */}
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    </article>
  );
}
