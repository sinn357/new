# Blog Web Changelog

## 2026-02-20

### Changed
- **Work 본문 길이 제한 상향**: 생성/임시저장 검증 최대 길이를 10,000자에서 100,000자로 조정

### Tests
- **workSchema 테스트 갱신**: 길이 제한 테스트 기준을 100,001자 거부로 갱신

### Notes
- **Archive 본문 제한 유지**: 기존 50,000자 제한은 변경 없음


## 2026-02-05

### Added
- **Archive/Work 이중 언어 토글**: 한국어/영어 전환 지원 (콘텐츠를 한 글에 분리 저장)
- **작성 폼 언어 탭**: Archive/Work 폼에서 한국어/영어 본문을 분리 작성
- **미디어 공유 도우미**: 한국어 본문 미디어를 영어 본문에 복사 버튼 제공

### Changed
- **목록/홈/피드 기본 언어 처리**: Archive/Work 요약/미리보기/메타데이터에 한국어 콘텐츠 사용

### Fixed
- **빌드 실패 해결**: 메타데이터에서 `contentForMeta` 누락으로 발생한 타입 오류 수정
- **작성/수정 페이지 크래시**: `FormControl` 단일 자식 규칙 위반으로 발생한 런타임 오류 수정

### Commits
- `7b7b79b`: feat: add bilingual content toggle
- `6f4159d`: fix: define archive metadata content
- `88cb1c5`: fix: define work metadata content
- `b12f850`: fix: avoid multiple children in form control

## 2026-02-03

### Changed
- **About 페이지 숨김 처리**: 내비게이션 및 모바일 메뉴에서 제거, 사이트맵에서도 제외

### Commits
- `160eec3`: chore: hide about from navigation

## 2026-02-02

### Added
- **임시저장=숨김 업로드 전환**: 임시저장 시 Work/Archive에 바로 저장하고 `isPublished=false`로 숨김 처리
- **공개 상태 토글**: Work/Archive 폼에 공개 여부 설정 추가

### Changed
- **공개 노출 필터링**: 비관리자는 `isPublished=true`만 조회, 상세 페이지도 숨김 글은 404 처리
- **Draft 관련 정리**: Draft API/모델 제거

### Database
- **isPublished 컬럼 추가**: Work/Archive에 공개 상태 컬럼 반영 (db push)

### Commits
- `49fe8d6`: feat: store drafts as hidden posts

## 2026-01-23

### Added
- **홈 상태 문구 인라인 편집**: 관리자 모드에서 "Currently building..." 문구 직접 수정
- **홈 상단 아이콘화**: HOME 텍스트 대신 추상 H 아이콘 적용

### Fixed
- **Cloudinary 이미지 호환성**: 이미지 URL 자동 최적화로 관리자/읽기 모드 이미지 엑박 방지
- **모바일 이미지 플리커 완화**: 이미지 URL 정규화 적용
- **About/Home 기본 텍스트 플래시 제거**: 데이터 로드 전 콘텐츠 페이드 인 처리
- **갤러리 이미지 크롭 제거**: 편집/읽기 모드 모두 object-contain 적용
- **홈 히어로 배경 표시**: 테크 그리드 레이어 z-index 수정

### Changed
- **홈 히어로 배경 리디자인**: 테크 그리드 + 회로 라인 + 노드 글로우로 교체

### Commits
- `20ad643`: fix: normalize cloudinary image urls
- `347e48a`: feat: refine home hero visuals and editable status
- `20336e4`: fix: strengthen hero grid and avoid about flash
- `8b03cd6`: fix: ensure hero grid renders above page background
- `842fa25`: fix: avoid home content flash on load
- `7e3e1df`: fix: avoid gallery image cropping
- `ab5652c`: fix: prevent gallery crop in read mode

## 2026-01-02

### Added
- **Rich text 접기/펼치기 (Heading 기반)**: H1/H2/H3 토글 버튼 + 접힘 상태 저장
- **TaskList NodeView**: 체크박스/텍스트 레이아웃 강제 고정

### Fixed
- **리치 텍스트 단축키 안정화**: Cmd/Ctrl+B/I/U 및 리스트 단축키 반영
- **리치 텍스트 리스트/블록 스타일 표시**: editor/reader 모두 가시성 복구
- **체크리스트 취소선 처리**: 편집 모드 즉시 반영
- **읽기 모드 체크박스 비활성화**

### Changed
- **업로드 최대 용량 상향**: 50MB (API/안내 문구 동기화)

### Commits
- `660512d`: fix: restore editor shortcuts and list styling
- `82b0b12`: fix: avoid editor self-reference in key handler
- `634f2c1`: feat: add paragraph/code buttons and drop style shortcuts
- `09e928e`: fix: style rich text blocks and task lists
- `78b057a`: feat: add collapsible blocks for rich text
- `bd39ba0`: fix: guard collapsible node position
- `dd0e905`: fix: improve lists, checklists, and collapsible blocks
- `f1729cf`: fix: improve collapsible behavior and task list layout
- `ac7689d`: feat: add heading-based collapsible sections
- `262fc5d`: fix: adjust heading collapse and prose styles
- `91a0193`: fix: enable editor heading toggle and task items
- `00cf379`: fix: stabilize heading toggle and task list alignment
- `e96606a`: fix: sync editor collapse state and disable read checkboxes
- `2a359f4`: fix: make editor heading collapse reactive
- `e732c9a`: fix: persist heading collapse on toggle
- `a674dca`: chore: raise upload size limit to 50MB

---

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

## 2026-01-07

### Added
- Cloudinary 동영상 썸네일 미리보기 (홈/Work/Archive 리스트)
- 동영상 플레이 오버레이 표시

### Fixed
- RichTextEditor 중복 extension 경고 제거 (Link, Underline)
- Work/Archive validation에 동영상 `<video>` 허용
- 모바일 상세 페이지 레이아웃 전체 폭 사용

---

## 2025-11-12

### Added
- Framer Motion 애니메이션
- AnimatedCard, AnimatedHero, ScrollProgress

---

**Last Updated**: 2026-02-05
