import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://testshinblog.vercel.app';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/work`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 동적 페이지 - Work
  const works = await prisma.work.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const workPages: MetadataRoute.Sitemap = works.map((work) => ({
    url: `${baseUrl}/work/${work.id}`,
    lastModified: work.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // 동적 페이지 - Archive
  const archives = await prisma.archive.findMany({
    select: { id: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  const archivePages: MetadataRoute.Sitemap = archives.map((archive) => ({
    url: `${baseUrl}/archive/${archive.id}`,
    lastModified: archive.createdAt,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...workPages, ...archivePages];
}
