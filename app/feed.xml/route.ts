import { prisma } from '@/lib/db';
import { getContentForLang } from '@/lib/bilingual-content';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://testshinblog.vercel.app';

  // Archive 글 가져오기
  const archives = await prisma.archive.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Work 글 가져오기
  const works = await prisma.work.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // HTML 태그 제거
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 200);
  };

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>SHIN 블로그</title>
    <link>${baseUrl}</link>
    <description>SHIN의 개인 블로그 - 포트폴리오, 글, 리뷰, 여행기</description>
    <language>ko-KR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>SHIN 블로그</title>
      <link>${baseUrl}</link>
    </image>
    ${archives
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/archive/${post.id}</link>
      <guid isPermaLink="true">${baseUrl}/archive/${post.id}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <category>${post.category}</category>
      <description><![CDATA[${stripHtml(getContentForLang(post.content, 'ko'))}...]]></description>
    </item>`
      )
      .join('')}
    ${works
      .map(
        (work) => `
    <item>
      <title><![CDATA[[Work] ${work.title}]]></title>
      <link>${baseUrl}/work/${work.id}</link>
      <guid isPermaLink="true">${baseUrl}/work/${work.id}</guid>
      <pubDate>${new Date(work.createdAt).toUTCString()}</pubDate>
      <category>work</category>
      <description><![CDATA[${stripHtml(getContentForLang(work.content, 'ko'))}...]]></description>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
