# Blog Web Changelog

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
