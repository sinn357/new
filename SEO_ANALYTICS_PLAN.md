# SEO & Analytics 구현 계획

> 블로그 검색 노출, 트래픽 분석, 광고 및 독자 참여 기능 추가 계획

---

## 📊 현재 상태

- ✅ Tiptap WYSIWYG 에디터
- ✅ Work, Archive 포스팅 기능
- ✅ 이미지 갤러리
- ❌ SEO 최적화 없음 (검색 노출 안됨)
- ❌ Analytics 없음 (트래픽 측정 불가)
- ❌ 댓글, RSS 등 블로그 기본 기능 없음

---

## 🎯 목표

**네이버블로그/티스토리/게이츠노트처럼:**
- 구글/네이버에서 글 검색 가능
- 트래픽 통계 확인
- 광고 수익화 (장기)
- 독자 참여 (댓글, 공유)

**게이츠노트 벤치마크:**
- 월 87만 유저, 192만 페이지뷰
- 구글 상위 랭킹
- 완벽한 SEO 구조

---

## 🚀 Phase 1: SEO 기본 (필수) - 1~2일

### 1.1 Next.js Metadata API 적용

**모든 페이지에 동적 메타데이터 추가**

**파일: `app/archive/[id]/page.tsx`**
```typescript
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

// 동적 메타데이터 생성
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const post = await prisma.archive.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return { title: 'Post Not Found' };
  }

  // HTML에서 텍스트 추출 (description용)
  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').substring(0, 160);
  const description = stripHtml(post.content);

  // 첫 번째 이미지 추출
  const extractFirstImage = (html: string): string | undefined => {
    const match = html.match(/<img[^>]+src="([^">]+)"/);
    return match ? match[1] : undefined;
  };
  const ogImage = extractFirstImage(post.content);

  return {
    title: `${post.title} | Your Blog Name`,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: ['Your Name'],
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function ArchivePage({ params }: { params: { id: string } }) {
  // 기존 코드 유지
}
```

**적용 대상:**
- `app/archive/[id]/page.tsx`
- `app/work/[id]/page.tsx`
- `app/page.tsx` (홈페이지)
- `app/archive/page.tsx` (목록 페이지)
- `app/work/page.tsx` (목록 페이지)

---

### 1.2 sitemap.xml 생성

**파일: `app/sitemap.ts`**
```typescript
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://my-site-phi-ruddy.vercel.app'; // 실제 도메인으로 변경

  // 정적 페이지
  const staticPages = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/work`, lastModified: new Date() },
    { url: `${baseUrl}/archive`, lastModified: new Date() },
  ];

  // 동적 페이지 - Work
  const works = await prisma.work.findMany({
    select: { id: true, updatedAt: true },
  });
  const workPages = works.map((work) => ({
    url: `${baseUrl}/work/${work.id}`,
    lastModified: work.updatedAt,
  }));

  // 동적 페이지 - Archive
  const archives = await prisma.archive.findMany({
    select: { id: true, updatedAt: true },
  });
  const archivePages = archives.map((archive) => ({
    url: `${baseUrl}/archive/${archive.id}`,
    lastModified: archive.updatedAt,
  }));

  return [...staticPages, ...workPages, ...archivePages];
}
```

---

### 1.3 robots.txt 생성

**파일: `app/robots.ts`**
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'], // 필요 시 추가
    },
    sitemap: 'https://my-site-phi-ruddy.vercel.app/sitemap.xml',
  };
}
```

---

### 1.4 JSON-LD 구조화 데이터

**파일: `app/archive/[id]/page.tsx` (기존 파일에 추가)**
```typescript
export default async function ArchivePage({ params }: { params: { id: string } }) {
  const post = await prisma.archive.findUnique({ where: { id: params.id } });

  if (!post) return <div>Not Found</div>;

  // JSON-LD 구조화 데이터
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Your Name',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 기존 렌더링 코드 */}
    </>
  );
}
```

---

### 1.5 Google Search Console 등록

**배포 후 수동 작업:**
1. https://search.google.com/search-console 접속
2. 사이트 추가
3. sitemap.xml 제출: `https://yourdomain.com/sitemap.xml`
4. 색인 요청

---

## 🚀 Phase 2: Analytics (필수) - 1일

### 2.1 Google Analytics 4 (GA4)

**Step 1: GA4 계정 생성**
- https://analytics.google.com
- 측정 ID 발급: `G-XXXXXXXXXX`

**Step 2: 코드 추가**

**파일: `app/layout.tsx`**
```typescript
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID; // .env에 추가

  return (
    <html>
      <head>
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**파일: `.env` (추가)**
```env
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

**Vercel 환경변수에도 추가 필요!**

---

### 2.2 Vercel Analytics (대안)

**더 간편한 옵션:**
```bash
npm install @vercel/analytics
```

**파일: `app/layout.tsx`**
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

**장점:**
- 설정 간편
- Vercel 대시보드에서 바로 확인
- 프라이버시 친화적

---

## 🚀 Phase 3: 독자 참여 - 2~3일

### 3.1 RSS Feed

**파일: `app/feed.xml/route.ts`**
```typescript
import { prisma } from '@/lib/prisma';

export async function GET() {
  const baseUrl = 'https://my-site-phi-ruddy.vercel.app';

  const posts = await prisma.archive.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Your Blog Name</title>
    <link>${baseUrl}</link>
    <description>Your blog description</description>
    <language>ko-KR</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${posts
      .map(
        (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/archive/${post.id}</link>
      <guid>${baseUrl}/archive/${post.id}</guid>
      <pubDate>${new Date(post.createdAt).toUTCString()}</pubDate>
      <description><![CDATA[${post.content.substring(0, 200)}...]]></description>
    </item>`
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

**RSS 링크 추가:**
```html
<!-- app/layout.tsx <head> 안에 -->
<link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/feed.xml" />
```

---

### 3.2 댓글 시스템 (Giscus)

**Step 1: GitHub Discussions 활성화**
- 리포지토리 Settings → Features → Discussions 체크

**Step 2: Giscus 설치**
```bash
npm install @giscus/react
```

**Step 3: Giscus 설정**
- https://giscus.app 에서 설정 생성
- 리포지토리, 카테고리 선택
- 코드 복사

**파일: `components/Comments.tsx` (신규)**
```typescript
'use client';

import Giscus from '@giscus/react';

export default function Comments() {
  return (
    <Giscus
      repo="sinn357/new" // 실제 리포지토리
      repoId="YOUR_REPO_ID" // giscus.app에서 복사
      category="General"
      categoryId="YOUR_CATEGORY_ID" // giscus.app에서 복사
      mapping="pathname"
      reactionsEnabled="1"
      emitMetadata="0"
      inputPosition="top"
      theme="light"
      lang="ko"
    />
  );
}
```

**파일: `app/archive/[id]/page.tsx` (하단에 추가)**
```typescript
import Comments from '@/components/Comments';

export default async function ArchivePage({ params }: { params: { id: string } }) {
  // ... 기존 코드

  return (
    <div>
      {/* 기존 콘텐츠 */}
      <article>{post.content}</article>

      {/* 댓글 시스템 */}
      <div className="mt-12">
        <Comments />
      </div>
    </div>
  );
}
```

---

### 3.3 소셜 공유 버튼

**파일: `components/ShareButtons.tsx` (신규)**
```typescript
'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  url: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex gap-3 items-center">
      <span className="text-sm text-gray-600">공유:</span>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        트위터
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
      >
        페이스북
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        링크드인
      </a>

      <button
        onClick={copyLink}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
      >
        {copied ? '복사됨!' : '링크 복사'}
      </button>
    </div>
  );
}
```

**사용:**
```typescript
// app/archive/[id]/page.tsx
import ShareButtons from '@/components/ShareButtons';

export default async function ArchivePage({ params }: { params: { id: string } }) {
  const url = `https://my-site-phi-ruddy.vercel.app/archive/${params.id}`;

  return (
    <div>
      {/* 콘텐츠 */}
      <ShareButtons title={post.title} url={url} />
    </div>
  );
}
```

---

## 🚀 Phase 4: 광고 & 검색 (추후)

### 4.1 Google AdSense

**요구사항:**
- ✅ 최소 10개 이상의 고품질 콘텐츠
- ✅ 월 5,000+ 페이지뷰 (권장)
- ✅ 독자적 도메인 (선택, 승인율 높음)
- ✅ AdSense 정책 준수

**신청 절차:**
1. https://adsense.google.com 가입
2. 사이트 추가 및 코드 삽입
3. 승인 대기 (1-2주)
4. 승인 후 광고 게재

**파일: `components/AdSense.tsx` (승인 후)**
```typescript
'use client';

import { useEffect } from 'react';

export default function AdSense() {
  useEffect(() => {
    try {
      (window.adsbygone = window.adsbygone || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client="ca-pub-XXXXXXXXXX" // 승인 후 발급
      data-ad-slot="XXXXXXXXXX"
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
```

---

### 4.2 사이트 내 검색 기능

**Option A: 자체 구현 (Prisma)**

**파일: `app/api/search/route.ts` (신규)**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') || '';

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await prisma.archive.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: 10,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ results });
}
```

**파일: `components/SearchBar.tsx` (신규)**
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="검색..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button type="submit" className="absolute right-2 top-2">
        🔍
      </button>
    </form>
  );
}
```

**Option B: Algolia** (유료, 강력)
- 빠른 검색, 타이포 교정, 필터링
- 무료 플랜: 월 10,000건

---

## 📋 우선순위 체크리스트

### ✅ Phase 1: SEO (완료 - 2026-01-27)
- [x] Metadata API 적용 (archive, work, home)
- [x] sitemap.ts 생성 (`/sitemap.xml`)
- [x] robots.ts 생성 (`/robots.txt`)
- [x] JSON-LD 구조화 데이터
- [x] Google Search Console 등록
- [x] 네이버 서치어드바이저 등록

### ✅ Phase 2: Analytics (완료 - 2026-01-27)
- [x] Google Analytics 4 설치 (측정 ID: G-2R94FQ1FKC)
- [x] Vercel Analytics 설치
- [x] 환경변수 설정 (NEXT_PUBLIC_GA_ID)

### 🔄 Phase 3: 독자 참여 (진행 중)
- [x] RSS Feed 생성 (`/feed.xml`)
- [ ] Giscus 댓글 시스템
- [x] 소셜 공유 버튼 (기존에 구현됨)

### ⏳ Phase 4: 광고 & 검색 (트래픽 확보 후)
- [ ] Google AdSense 신청 (콘텐츠 10+ 필요)
- [ ] 사이트 내 검색 기능

---

## 🔗 외부 플랫폼 연동

### Medium 연동
- **현재 상태**: Import 기능 비활성화 (새 계정은 활동 필요)
- **해결 방법**:
  1. Medium에서 몇 개 글 작성 후 활동 쌓기
  2. 수동으로 글 복사해서 게시
  3. 활동 후 RSS Import 기능 활성화되면 `/feed.xml` 연동

### Substack 연동
- **현재 상태**: RSS 자동 import 기능 없음 (Substack은 뉴스레터 플랫폼)
- **연동 방법**:
  1. 수동: 블로그 새 글 → Substack 뉴스레터에 링크 포함
  2. 자동화: Zapier로 RSS → Email 자동화 설정
  3. 크로스 포스팅: 블로그 + Substack 둘 다 게시

### 커스텀 도메인
- **현재**: `testshinblog.vercel.app` (Vercel 서브도메인)
- **권장**: 장기 운영/수익화 목표 시 커스텀 도메인 구매 추천
- **장점**: SEO 유리, AdSense 승인 쉬움, 전문적 이미지
- **구매처**: Namecheap, Porkbun, 가비아 등
- **연결**: Vercel Dashboard → Settings → Domains에서 5분 내 설정 가능

---

## 📊 성공 지표

**1개월 후:**
- [ ] Google Search Console에서 클릭 수 확인
- [ ] GA4에서 일 평균 방문자 확인

**3개월 후:**
- [ ] 주요 키워드 구글 상위 노출
- [ ] 월 1,000+ 페이지뷰

**6개월 후:**
- [ ] AdSense 승인 및 수익화
- [ ] 월 5,000+ 페이지뷰

---

## 🔗 참고 자료

**SEO:**
- Next.js Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
- Google Search Console: https://search.google.com/search-console
- 네이버 서치어드바이저: https://searchadvisor.naver.com

**Analytics:**
- Google Analytics: https://analytics.google.com
- Vercel Analytics: https://vercel.com/docs/analytics

**RSS & 연동:**
- RSS Feed: `/feed.xml`
- Zapier (자동화): https://zapier.com

**댓글:**
- Giscus: https://giscus.app

**광고:**
- Google AdSense: https://adsense.google.com

**도메인:**
- Namecheap: https://namecheap.com
- Porkbun: https://porkbun.com

---

**작성일**: 2025-12-29
**마지막 업데이트**: 2026-01-27
