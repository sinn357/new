'use client';

import { useEffect, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { applyHeadingCollapse } from '@/lib/heading-collapse';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

interface CollapsibleContentProps {
  html: string;
  className?: string;
}

export default function CollapsibleContent({ html, className = '' }: CollapsibleContentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxSlides, setLightboxSlides] = useState<Array<{ src: string; alt?: string }>>([]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    applyHeadingCollapse(container, { addToggleButtons: true });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    inputs.forEach((input) => {
      input.disabled = true;
    });

    const images = container.querySelectorAll<HTMLImageElement>('img');
    images.forEach((img, idx) => {
      const nextSrc = getCloudinaryImageUrl(img.src);
      if (nextSrc && img.src !== nextSrc) {
        img.src = nextSrc;
      }
      img.dataset.lightboxIndex = String(idx);
      img.classList.add('clickable-content-image');
    });

    const handleImageClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const clickedImage = target?.closest('img');
      if (!clickedImage || !container.contains(clickedImage)) return;

      const allImages = Array.from(container.querySelectorAll<HTMLImageElement>('img'));
      if (allImages.length === 0) return;

      const slides = allImages.map((img) => ({
        src: img.src,
        alt: img.alt || '이미지',
      }));

      const nextIndex = Number(clickedImage.dataset.lightboxIndex ?? 0);
      setLightboxSlides(slides);
      setLightboxIndex(Number.isFinite(nextIndex) ? nextIndex : 0);
      setIsLightboxOpen(true);
    };

    container.addEventListener('click', handleImageClick);
    return () => {
      container.removeEventListener('click', handleImageClick);
    };
  }, [html]);

  return (
    <>
      <div
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Lightbox
        open={isLightboxOpen}
        close={() => setIsLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
        plugins={[Zoom]}
      />
    </>
  );
}
