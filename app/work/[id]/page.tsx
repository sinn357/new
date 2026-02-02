import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import WorkDetailClient from './WorkDetailClient';

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

  const work = await prisma.work.findUnique({
    where: { id },
  });

  const isAdmin = await isAdminAuthenticated();
  if (!work || (!isAdmin && !work.isPublished)) {
    return { title: '작업물을 찾을 수 없습니다' };
  }

  const description = stripHtml(work.content);
  const ogImage = extractFirstImage(work.content) || work.imageUrl;

  return {
    title: `${work.title} | SHIN 포트폴리오`,
    description,
    openGraph: {
      title: work.title,
      description,
      type: 'article',
      publishedTime: work.createdAt.toISOString(),
      authors: ['SHIN'],
      url: `${baseUrl}/work/${id}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      siteName: 'SHIN 블로그',
      locale: 'ko_KR',
    },
    twitter: {
      card: 'summary_large_image',
      title: work.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: `${baseUrl}/work/${id}`,
    },
  };
}

export default async function WorkDetailPage({ params }: Props) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://testshinblog.vercel.app';

  const work = await prisma.work.findUnique({
    where: { id },
  });

  const isAdmin = await isAdminAuthenticated();
  if (!work || (!isAdmin && !work.isPublished)) {
    notFound();
  }

  // JSON-LD 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: work.title,
    datePublished: work.createdAt.toISOString(),
    author: {
      '@type': 'Person',
      name: 'SHIN',
    },
    description: stripHtml(work.content),
    url: `${baseUrl}/work/${id}`,
    image: extractFirstImage(work.content) || work.imageUrl,
  };

  // Prisma 객체를 일반 객체로 변환
  const workData = {
    id: work.id,
    title: work.title,
    content: work.content,
    category: work.category,
    techStack: work.techStack,
    githubUrl: work.githubUrl,
    demoUrl: work.demoUrl,
    youtubeUrl: work.youtubeUrl,
    instagramUrl: work.instagramUrl,
    imageUrl: work.imageUrl,
    fileUrl: work.fileUrl,
    status: work.status as 'completed' | 'in-progress' | 'planned',
    duration: work.duration,
    isFeatured: work.isFeatured,
    isPublished: work.isPublished,
    createdAt: work.createdAt.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WorkDetailClient work={workData as any} id={id} />
    </>
  );
}
