# My Site - Personal Blog Platform

A modern personal blog platform built with Next.js 15, featuring portfolio management and content archiving capabilities.

## Features

### ✅ Completed
- **블로그 포스트 관리**: 작성, 조회, 삭제
- **댓글 시스템**: 포스트별 댓글 기능
- **포트폴리오 섹션**: Work 페이지를 통한 프로젝트 관리
- **아카이브 시스템**: 카테고리별 콘텐츠 분류
- **연락 기능**: EmailJS 기반 연락 폼
- **관리자 모드**: AdminContext 기반 권한 관리
- **미디어 삽입**: 이미지/동영상 업로드 및 마크다운 편집
- **반응형 디자인**: 모바일/데스크톱 최적화
- **데이터 지속성**: PostgreSQL 기반 안전한 저장

### 🚀 최신 업데이트 (2025-09-29)
- **사이트 제목 변경**: "Create Next App" → "Blog Testing"
- **미디어 삽입 기능**: MarkdownEditor에 통합된 이미지/동영상 업로드
  - 📷 툴바 버튼으로 쉬운 미디어 삽입
  - 자동 마크다운 문법 변환
  - 비디오 파일 자동 감지 및 재생
  - 커서 위치 자동 관리

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Email**: EmailJS for contact form
- **Deployment**: Vercel
- **Styling**: Tailwind CSS

## Database Setup

The application uses PostgreSQL as the database with Prisma as the ORM.

### Local Development

1. Set up your database URL in `.env`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
   ```

2. Run Prisma migrations:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

### Cloud Deployment

For production deployment on Vercel:

1. Set up a cloud PostgreSQL database (Neon, Supabase, or Aiven)
2. Add `DATABASE_URL` environment variable in Vercel dashboard
3. The `vercel.json` configuration handles Prisma generation during build

## API Endpoints

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get post by ID
- `DELETE /api/posts/[id]` - Delete post by ID
- `GET /api/comments?postId=[id]` - Get comments for a post
- `POST /api/comments` - Create new comment
- `DELETE /api/comments/[id]` - Delete comment by ID

## Contact Form Setup (EmailJS)

The contact form uses EmailJS to send emails directly from the client-side. To enable email sending:

### 1. Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Create a new email service (Gmail, Outlook, etc.)

### 2. Create Email Template
1. Go to Email Templates in your EmailJS dashboard
2. Create a new template with these variables:
   ```
   From: {{from_name}} ({{from_email}})
   Subject: [{{category}}] {{subject}}
   
   Message:
   {{message}}
   
   ---
   Sent from: {{to_name}}'s Blog Contact Form
   ```

### 3. Get Your Keys
1. **Service ID**: From your Email Services page
2. **Template ID**: From your Email Templates page  
3. **Public Key**: From your Account page

### 4. Update Environment Variables
Update your `.env` file:
```bash
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_actual_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_actual_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_actual_public_key
```

### 5. Test the Contact Form
1. Fill out the contact form
2. Check your configured email for the message
3. If not configured, the form will simulate sending (success message without actual email)

### Template Variables Available:
- `{{from_name}}` - Sender's name
- `{{from_email}}` - Sender's email
- `{{subject}}` - Message subject
- `{{category}}` - Contact category (일반 문의, 협업 제안, etc.)
- `{{message}}` - Message content
- `{{to_name}}` - Recipient name (defaults to "Blog Owner")

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 📁 프로젝트 구조

### 문서화
- `CLAUDE.md` - 프로젝트 컨텍스트 및 세션 관리
- `docs/` - 기술 문서 폴더
  - `MEDIA_INSERTION_IMPLEMENTATION.md` - 미디어 삽입 기능 구현 가이드
  - `BLOG_PLATFORM_*_IMPLEMENTATION.md` - 블로그 플랫폼 구현 히스토리
  - `PROJECT_SUMMARY_*.md` - 날짜별 프로젝트 요약

### 주요 디렉토리
```
my-site/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── work/              # 포트폴리오 섹션
│   ├── archive/           # 아카이브 섹션
│   └── api/               # API 라우트
├── components/            # 재사용 컴포넌트
│   ├── MarkdownEditor.tsx # 미디어 삽입 지원 에디터
│   └── FileUpload.tsx     # 파일 업로드
├── contexts/              # React Contexts
├── lib/                   # 유틸리티 함수
├── prisma/                # 데이터베이스 스키마
└── docs/                  # 프로젝트 문서
```

## Deployment Status

✅ **Local Database**: PostgreSQL setup complete
✅ **API Routes**: All endpoints working
✅ **Frontend**: Post creation/viewing functional
✅ **Comments**: Comment system working
✅ **Media Upload**: Image/video insertion working
✅ **GitHub**: Code versioned at https://github.com/sinn357/new.git
🔄 **Production**: Ready for Vercel deployment

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

🤖 Generated with [Claude Code](https://claude.ai/code)