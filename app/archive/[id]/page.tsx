import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ArchiveDetailClient from './ArchiveDetailClient';

interface Props {
  params: Promise<{ id: string }>;
}

// HTML 태그 제거 함수
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').substring(0, 160);
}

// 첫 번째 이미지 추출 함수
function extractFirstImage(html: string): string | undefined {
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : undefined;
}

// 동적 메타데이터 생성
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://testshinblog.vercel.app';

  const archive = await prisma.archive.findUnique({
    where: { id },
  });

  if (!archive) {
    return { title: '글을 찾을 수 없습니다' };
  }

  const description = stripHtml(archive.content);
  const ogImage = extractFirstImage(archive.content) || archive.imageUrl;

  return {
    title: `${archive.title} | SHIN 블로그`,
    description,
    openGraph: {
      title: archive.title,
      description,
      type: 'article',
      publishedTime: archive.createdAt.toISOString(),
      authors: ['SHIN'],
      url: `${baseUrl}/archive/${id}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      siteName: 'SHIN 블로그',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: archive.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `${baseUrl}/archive/${id}`,
    },
  };
}

export default async function ArchiveDetailPage({ params }: Props) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://testshinblog.vercel.app';

  const archive = await prisma.archive.findUnique({
    where: { id },
  });

  if (!archive) {
    notFound();
  }

  // JSON-LD 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: archive.title,
    datePublished: archive.createdAt.toISOString(),
    dateModified: archive.createdAt.toISOString(),
    author: {
      '@type': 'Person',
      name: 'SHIN',
    },
    publisher: {
      '@type': 'Person',
      name: 'SHIN',
    },
    description: stripHtml(archive.content),
    url: `${baseUrl}/archive/${id}`,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/archive/${id}`,
    },
    image: extractFirstImage(archive.content) || archive.imageUrl,
  };

  // Prisma 객체를 일반 객체로 변환
  const archiveData = {
    id: archive.id,
    title: archive.title,
    content: archive.content,
    category: archive.category,
    tags: archive.tags,
    imageUrl: archive.imageUrl,
    fileUrl: archive.fileUrl,
    rating: archive.rating,
    createdAt: archive.createdAt.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArchiveDetailClient archive={archiveData as any} id={id} />
    </>
  );
}
