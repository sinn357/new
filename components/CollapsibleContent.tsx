'use client';

import { useEffect, useRef } from 'react';
import { applyHeadingCollapse } from '@/lib/heading-collapse';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

interface CollapsibleContentProps {
  html: string;
  className?: string;
}

export default function CollapsibleContent({ html, className = '' }: CollapsibleContentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    applyHeadingCollapse(containerRef.current, { addToggleButtons: true });
    const inputs = containerRef.current.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    inputs.forEach((input) => {
      input.disabled = true;
    });
    const images = containerRef.current.querySelectorAll<HTMLImageElement>('img');
    images.forEach((img) => {
      const nextSrc = getCloudinaryImageUrl(img.src);
      if (nextSrc && img.src !== nextSrc) {
        img.src = nextSrc;
      }
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
