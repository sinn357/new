'use client';

import { useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import Image from 'next/image';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';

interface ImageLightboxProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 클릭 시 확대 뷰를 제공하는 이미지 컴포넌트
 */
export default function ImageLightbox({
  src,
  alt = '이미지',
  width = 400,
  height = 300,
  className = '',
  style
}: ImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displaySrc = getCloudinaryImageUrl(src) ?? src;

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer transition-transform hover:scale-105 ${className}`}
        style={style}
      >
        <Image
          src={displaySrc}
          alt={alt}
          width={width}
          height={height}
          className="rounded-lg shadow-md hover:shadow-xl transition-shadow"
          style={style}
        />
      </div>

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={[{ src: displaySrc }]}
        plugins={[Zoom]}
        render={{}}
      />
    </>
  );
}

interface ImageGalleryLightboxProps {
  images: Array<{ src: string; alt?: string }>;
  currentIndex?: number;
  onClose?: () => void;
}

/**
 * 여러 이미지를 슬라이드로 보여주는 갤러리 라이트박스
 */
export function ImageGalleryLightbox({
  images,
  currentIndex = 0,
  onClose
}: ImageGalleryLightboxProps) {
  const [index, setIndex] = useState(currentIndex);

  return (
    <Lightbox
      open={true}
      close={onClose}
      index={index}
      slides={images.map(img => ({ src: img.src, alt: img.alt }))}
      plugins={[Zoom]}
      on={{
        view: ({ index: newIndex }) => setIndex(newIndex)
      }}
    />
  );
}

interface ClickableImageProps {
  src: string;
  alt?: string;
  className?: string;
}

/**
 * 마크다운에서 사용할 클릭 가능한 이미지 컴포넌트
 */
export function ClickableImage({ src, alt, className = '' }: ClickableImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displaySrc = getCloudinaryImageUrl(src) ?? src;

  return (
    <>
      <img
        src={displaySrc}
        alt={alt}
        onClick={() => setIsOpen(true)}
        className={`cursor-pointer hover:opacity-90 transition-opacity ${className}`}
      />

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={[{ src: displaySrc }]}
        plugins={[Zoom]}
        render={{}}
      />
    </>
  );
}
