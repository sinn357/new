# Blog Web Changelog

## 2025-01-24

### Fixed
- **카테고리바 스크롤 문제 해결** (Archive/Work 페이지)
  - `scrollbar-hide` → `scrollbar-thin` 커스텀 클래스로 변경
  - 6px 높이의 얇은 인디고 색상 스크롤바 추가
  - PC 환경에서 모든 카테고리(게임, 드라마 포함) 표시 가능
  - 다크모드 지원 스크롤바 스타일
- **빈 텍스트 저장 기능 구현** (About 페이지)
  - API 검증 로직 수정: falsy 체크 → undefined 체크
  - POST/PUT 핸들러에서 빈 문자열("") 허용
  - title과 content를 비워서 저장 가능
- **InlineEdit 컴포넌트 개선**
  - trim() 제거로 빈 문자열 저장 가능
  - 검증 로직 개선

### Changed
- `app/globals.css`: 커스텀 스크롤바 스타일 추가 (+43줄)
- `app/api/page-content/route.ts`: 빈 값 검증 로직 개선

### Documentation
- `docs/CRITICAL_BUG_FIXES_2025-01-24.md` 작성
  - 문제 진단 과정 상세 기록
  - 근본 원인 분석 및 해결 방법
  - 배운 점과 개선 사항 정리

### Commits
- `ef72d85`: fix: resolve scrollbar visibility and empty text validation issues
- `c20ba75`: fix: resolve critical UI issues on Archive and About pages

---

## 2025-11-24

### Added - Major Redesign ⭐⭐⭐
- **Footer 재디자인**
  - Glassmorphism 스타일 (Navigation과 일치)
  - Animated Wave 배경 (Indigo → Purple → Teal)
  - Quick Links 섹션 (Work, Archive, About)
  - Enhanced social links with hover animations
- **Admin Dashboard Modal**
  - 설정(⚙️) 버튼으로 접근
  - Quick Actions: Work/Archive 생성, Home 편집 바로가기
  - 실시간 통계: 총 작업물, 아카이브, 카테고리 수
  - Admin 상태 표시 + Logout 버튼
- **About Page - Bento Grid Layout**
  - 기존 단일 컬럼 → Modern Bento Grid
  - Profile Card (2x2 large): 아바타, 이름, 역할, 소개, 연락처
  - Skills Card: 그라디언트 pills 디자인
  - Interests Card: Bullet points
  - Experience Timeline: 타임라인 + 연도 배지
  - CTA Card: Contact Form → Floating Modal로 변경
  - 모든 섹션 InlineEdit 지원
- **Floating Glass Filter Bar** (Work/Archive)
  - Sticky positioning (스크롤 시 상단 고정)
  - Glassmorphism + 가로 스크롤
  - Gradient scroll indicators
  - 70% 공간 절약

### Changed
- About 페이지 코드 **70% 감소** (1101줄 → 240줄)
- Hero Section 간소화 (Work/Archive와 일관성)
- `scrollbar-hide` CSS utility 추가

### Documentation
- `docs/MAJOR_REDESIGN_2025-11-24.md` 작성 (소급)
  - 디자인 철학 및 원칙
  - 각 컴포넌트 상세 설명
  - 테스트 시나리오
  - 배운 점

### Commits
- `d679258`: feat: Major redesign - Footer, Admin Dashboard, and About page

### 이후 수정 사항
- Footer Quick Links 제거 (Connect만 유지)
- Admin Dashboard 설정 버튼 제거
- Category Bar 스크롤 문제 수정 (2025-01-24)

---

## 2025-11-18

### Added
- Featured Projects 기능 (`isFeatured` 필드)
- Image Lightbox 컴포넌트
- Rating System (Archive)
- Social Sharing (ShareButtons)
- Spoiler Blur 기능
- Print 최적화 스타일

### Fixed
- Database 스키마 동기화 (Work.isFeatured, Archive.rating)
- `npx prisma db push` 실행
- Vercel 빌드 성공

### Changed
- Cloudinary 폴더: `my-site-uploads` → `blog-web`
- Cloudinary 환경변수 추가 (.env, Vercel)

### Merged
- Branch: `claude/enhance-blog-features` → `main`
- 7개 커밋 병합

### Commits
- `01d1d47`: refactor: Change Cloudinary folder
- `4a4c559`: fix: Remove unused WorkCategory import
- `f93ec54`: fix: TypeScript type errors
- `f9f01f7`: feat: Add social sharing
- `916dbe9`: feat: Add Featured Projects
- `c9f089f`: feat: Add image lightbox
- `5b38e71`: feat: Add rating system

---

## 2025-11-17

### Added
- Dark Mode (Indigo + Teal theme)
- ThemeToggle 컴포넌트

### Fixed
- tailwind.config.js darkMode 설정

### Documentation
- CLAUDE.md 업데이트 (ADR-005)

---

## 2025-11-12

### Added
- Framer Motion 애니메이션
- AnimatedCard, AnimatedHero, ScrollProgress

---

**Last Updated**: 2025-11-18
