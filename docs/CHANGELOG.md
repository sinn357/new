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
