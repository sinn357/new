# CLAUDE.md — Persistent Session Context (My-Site Blog Platform)

> 목적: Claude Code가 세션이 달라도 동일한 규칙/맥락에서 동작하도록 하는 단일 소스(SSOT).

---

## 0) Meta
- **Project:** My-Site - Personal Blog Platform
- **Repo Root:** /Users/woocheolshin/Documents/Vibecoding_1/my-site
- **GitHub:** https://github.com/sinn357/new.git
- **Owner:** Partner
- **Last Updated:** 2025-09-29 21:00 KST
- **Session Goal (Today):** ✅ 사이트 제목 변경 + 미디어 삽입 기능 구현 완료 + MD 파일 체계적 정리

---

## 1) Mission / Non-Goals
- **Mission (one-liner):** Next.js 기반 개인 블로그 플랫폼으로 포트폴리오와 아카이브 관리 시스템 구축
- **Non-Goals:** 브레인스토밍 금지 / 범위 밖 리팩토링 금지 / 불필요한 포맷팅 변경 금지.

---

## 2) Architecture Snapshot
- **Context:** Next.js 15.5.2 + TypeScript + Prisma + PostgreSQL로 구성된 개인 블로그 플랫폼
- **Services/Modules:** Next.js Frontend (UI), Prisma ORM (데이터베이스), Cloudinary (미디어 저장), EmailJS (연락 기능)
- **Data Flow:** 사용자 입력 → Next.js API Routes → Prisma ORM → PostgreSQL → 응답
- **External Deps:** Neon PostgreSQL, Cloudinary CDN, EmailJS

> 상세 다이어그램은 /docs/ARCHITECTURE.md

---

## 3) Repo Map (Brief)

my-site/
├─ app/                 # Next.js App Router
│  ├─ layout.tsx        # 루트 레이아웃 (메타데이터, 네비게이션)
│  ├─ page.tsx          # 홈페이지
│  ├─ work/             # 포트폴리오 섹션
│  ├─ about/            # 소개 페이지
│  ├─ archive/          # 아카이브 섹션
│  └─ api/              # API 라우트
├─ components/          # 재사용 가능한 컴포넌트
│  ├─ MarkdownEditor.tsx # 미디어 삽입 지원 마크다운 에디터
│  ├─ FileUpload.tsx    # 파일 업로드 컴포넌트
│  └─ ...
├─ lib/                 # 유틸리티 함수
├─ contexts/            # React Context
├─ docs/                # 기술 문서
├─ prisma/              # 데이터베이스 스키마
└─ CLAUDE.md           # 프로젝트 컨텍스트

---

## 4) Runbook / Environment
- **Language/Runtime:** Node.js 20 (TypeScript)
- **Package mgr:** npm
- **Setup:**
  - `npm install`
  - 환경변수: .env.local 파일 설정 (DATABASE_URL, CLOUDINARY_*)
- **Dev Run:** `npm run dev`
- **Test:** TBD
- **Build:** `npm run build`
- **Lint/Format/Typecheck:** `npm run lint`
- **Local URLs:** http://localhost:3000
- **Production URLs:** TBD (Vercel 배포 예정)
- **Secrets:** `.env.local` 사용. **절대** 코드/로그/PR에 노출 금지.

---

## 5) Conventions
- **Code Style:** ESLint + Prettier (Next.js 기본 설정)
- **Commits:** Conventional Commits
  - `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `perf:`, `build:`, `ci:`
- **Branching:** `main` 브랜치 사용
- **PR Rules:** 작은 단위, 명확한 설명, TODO 금지(이슈로 전환)
- **Versioning:** Git 태그 기반

---

## 6) Quality Gates (DoD)
- ✅ TypeScript 컴파일 통과
- ✅ ESLint 규칙 준수
- ✅ 로깅/에러 핸들링 추가 (필요시)
- ✅ 문서 갱신(변경사항 반영)
- ✅ 보안 점검(비밀키/토큰/PII 노출 없음)

---

## 7) Testing Strategy
- **Unit:** 핵심 로직 테스트 (향후 Jest 도입 예정)
- **Integration:** API 라우트 테스트
- **E2E (선택):** 주요 사용자 플로우
- **Manual:** 개발 중 브라우저 테스트

---

## 8) Observability
- **Logs:** console.log/error (개발), 향후 구조화 로깅 검토
- **Metrics:** Next.js 기본 메트릭스
- **Error Tracking:** 향후 Sentry 등 도입 검토

---

## 9) Security & Privacy
- **Secrets:** 환경변수 (.env.local)
- **AuthZ/AuthN:** 관리자 모드 (AdminContext)
- **PII:** 최소한의 사용자 데이터만 저장

---

## 10) Data & Migration
- **Schemas:** prisma/schema.prisma
- **Migrations:** `prisma db push` (개발), `prisma migrate` (프로덕션)
- **Database:** Neon PostgreSQL

---

## 11) Release / CI-CD
- **Pipelines:** GitHub → Vercel 자동 배포
- **Envs:** development (localhost) / production (Vercel)

---

## 12) Tasks (Single Source of Truth)
### Active (in this session)
- **세션 완료**: 사이트 제목 변경 + 미디어 삽입 기능 구현 + MD 파일 정리 완료

### Recent Done
- **T-003:** MD 파일 체계적 정리 ✅ (2025-09-29) - CLAUDE.md 생성 + docs 폴더 구조 정리 + investment-app 패턴 적용
- **T-002:** Work와 Archive 페이지 미디어 삽입 기능 추가 ✅ (2025-09-29) - MarkdownEditor 컴포넌트에 툴바, 미디어 업로드, 자동 문법 삽입, 비디오 렌더링 지원 구현
- **T-001:** 사이트 제목 변경 ✅ (2025-09-29) - layout.tsx에서 메타데이터 "Create Next App" → "Blog Testing" 변경

### Backlog
- **B-001:** 포트폴리오 섹션 확장
- **B-002:** 아카이브 카테고리 시스템 개선
- **B-003:** 검색 기능 추가
- **B-004:** 댓글 시스템 구현
- **B-005:** SEO 최적화
- **B-006:** 다크모드 지원

> 원칙: **세션당 Active ≤ 2**.

---

## 13) ADR (Architecture Decision Records)

### ADR-001: Next.js App Router 선택
- Date: 2025-09-29
- Context: 블로그 플랫폼 기술 스택 결정 필요
- Options: Next.js Pages Router vs App Router vs Gatsby vs 기타
- Decision: Next.js 15.5.2 App Router 사용
- Consequences:
  - 장점: 최신 React 기능, 서버 컴포넌트, 향상된 라우팅
  - 단점: 러닝 커브, 일부 라이브러리 호환성 이슈 가능
  - 선택 이유: 현대적 개발 경험, 성능 최적화, 확장성

### ADR-002: 미디어 삽입 시스템 아키텍처
- Date: 2025-09-29
- Context: Work/Archive 페이지에서 글 작성 시 이미지/동영상 삽입 기능 필요
- Options: 별도 미디어 컴포넌트 vs MarkdownEditor 확장 vs 외부 에디터 라이브러리
- Decision: MarkdownEditor 컴포넌트 확장으로 통합 구현
- Consequences:
  - **통합성**: 하나의 컴포넌트에서 텍스트+미디어 편집 완료
  - **일관성**: Work/Archive 페이지 모두 동일한 편집 경험
  - **확장성**: 기존 FileUpload 컴포넌트 재사용, 향후 기능 추가 용이
  - **기술적 구현**:
    - 툴바 버튼으로 미디어 업로드 패널 토글
    - 업로드 후 자동 마크다운 문법 삽입 (![이미지](URL), ![동영상](URL))
    - 비디오 파일 자동 감지 및 `<video>` 태그 렌더링
    - 커서 위치 자동 관리로 UX 향상

### ADR-003: 문서화 구조 표준화
- Date: 2025-09-29
- Context: 프로젝트 문서 관리 체계화 필요, investment-app 패턴 적용
- Options: 단일 README vs 분산 문서 vs 체계적 docs 폴더
- Decision: investment-app과 동일한 CLAUDE.md + docs/ 구조 채택
- Consequences:
  - **일관성**: 다른 프로젝트와 동일한 문서 구조로 관리 효율성 향상
  - **추적성**: CLAUDE.md에 Tasks/ADR로 모든 작업 히스토리 기록
  - **모듈화**: docs/ 폴더에 기능별 상세 가이드 분리
  - **확장성**: 새로운 기능 추가 시 문서 패턴 재사용 가능

---

## 14) Risk Log
- **R-001:** Vercel 배포 시 환경변수 누락 → **대응:** 배포 전 환경변수 체크리스트 확인
- **R-002:** 미디어 파일 용량 제한 → **대응:** Cloudinary 용량 모니터링, 압축 설정

---

## 15) Glossary
- **MarkdownEditor**: 마크다운 편집 + 미디어 삽입 지원 통합 컴포넌트
- **AdminContext**: 관리자 권한 관리 React Context
- **FileUpload**: Cloudinary 연동 파일 업로드 컴포넌트

---

## 16) Claude Session Protocol
1) **Start:** 이 파일의 0,1,12,13을 읽고 **오늘 목표/Active/ADR 변경 없음/논의할 1문항**을 **5줄 이내**로 보고.
2) **Search→Edit 최소화:** 전체 파일 출력 금지. **검색으로 위치 특정 → 부분 수정 → diff**만 제시.
3) **Diff first:** 불필요한 포맷 변경 금지. 리팩토링은 티켓화.
4) **Run & Report:** 명령은 코드블록에 정확히. 결과는 상위 로그 10줄.
5) **Close:** 결과 요약(3줄) + 남은 리스크(1줄) + `Tasks/ADR` 갱신 후 저장.

---

## 17) Token Budget Guide
- 전체 코드/로그 노출 금지.
- 함수/블록 단위로만 제시.
- 설명은 5–7줄 요약. 표/리스트 과다 금지.
- 동일 맥락 반복 설명 금지(링크/섹션 참조).

---

## 18) Notes
- 장시간 세션에서는 **요약 빈도↑**, 파일 전체 출력 금지.
- 광범위 변경 필요 시: 먼저 목표/범위를 5줄로 합의 → 티켓 생성 → 분할 수행.