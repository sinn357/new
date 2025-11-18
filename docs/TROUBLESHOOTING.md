# Troubleshooting Guide

> 프로젝트에서 발생한 주요 문제와 해결 방법을 기록합니다.

---

## Issue #1: Database Connection Failed in Production (2025-11-18)

### 증상
```
Error: Database connection failed
Please configure DATABASE_URL environment variable in Vercel
```

Work 페이지와 Archive 페이지에서 위 에러 발생.

### 진단 과정

**1단계: 환경변수 확인**
- Vercel → Settings → Environment Variables 확인
- DATABASE_URL 존재 여부 체크
- Environment 체크박스 확인 (Production, Preview, Development)

**2단계: Vercel 재배포**
- 환경변수 추가 후 반드시 Redeploy 필요
- "Use existing Build Cache" 체크 해제하고 재배포

**3단계: Runtime Logs 확인**
- Vercel → Deployments → 최신 배포 → **Runtime Logs** 탭
- Build Logs가 아닌 Runtime Logs를 확인해야 함
- 페이지 접속 시 실시간 로그 확인

**4단계: 실제 원인 발견**

Runtime Logs에서 발견한 실제 에러:
```
prisma:error
Invalid `prisma.work.findMany()` invocation:

The column `Work.isFeatured` does not exist in the current database.

DATABASE_URL present: true
DATABASE_URL prefix: postgresql://neondb_
```

→ **DATABASE_URL은 정상이었지만, Production DB 스키마가 업데이트 안 됨!**

### 원인

로컬에서 Prisma 스키마 변경 후:
- ✅ 로컬 DB: `prisma db push`로 스키마 동기화 완료
- ❌ Production DB: 스키마 동기화 안 함

Production DB에는 여전히 이전 스키마만 존재:
- `Work.isFeatured` 컬럼 없음
- `Archive.rating` 컬럼 없음

### 해결 방법

**방법 1: Prisma CLI (로컬에서 실행)**

```bash
# Production DATABASE_URL 사용
DATABASE_URL="postgresql://user:pass@host/db?pgbouncer=true" npx prisma db push
```

**방법 2: Neon SQL Editor (추천, 빠름)**

Neon Dashboard → SQL Editor에서 직접 실행:

```sql
-- Work 테이블에 isFeatured 컬럼 추가
ALTER TABLE "Work" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- Archive 테이블에 rating 컬럼 추가
ALTER TABLE "Archive" ADD COLUMN "rating" INTEGER;
```

### 교훈

1. **Prisma 스키마 변경 시 체크리스트:**
   - [ ] 로컬 DB 동기화: `prisma db push`
   - [ ] Production DB 동기화: Neon SQL Editor 또는 CLI
   - [ ] Vercel 재배포
   - [ ] Production Runtime Logs 확인

2. **로그 확인 우선순위:**
   - 브라우저 Network 탭 (클라이언트 에러만 보임)
   - Vercel Build Logs (빌드 에러만 보임)
   - **Vercel Runtime Logs** ← 실제 서버 에러 확인 필수!

3. **DATABASE_URL 설정 체크리스트:**
   - Neon Pooled Connection 사용 (`?pgbouncer=true`)
   - Vercel Environment: Production + Preview + Development 모두 체크
   - 환경변수 추가 후 반드시 Redeploy

---

## Issue #2: Cloudinary 환경변수 공유 (2025-11-18)

### 질문
여러 앱(family-app, blog)에서 같은 Cloudinary 환경변수를 사용해도 되나요? 파일이 섞이나요?

### 답변
✅ **완전히 안전하게 공유 가능합니다!**

**환경변수 공유:**
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- 같은 Cloudinary 계정을 사용

**파일 구분:**
- 업로드 시 `folder` 옵션으로 자동 분류
- 코드에서 반드시 명시:
  ```typescript
  cloudinary.uploader.upload_stream({
    folder: 'blog-web',  // 앱별로 다른 폴더명 사용
  })
  ```

**Cloudinary Media Library 구조:**
```
cloudinary.com/console
├── family-app/       (family-app 파일들)
└── blog-web/         (blog 파일들)
```

**장점:**
- 비용 절감 (하나의 계정만 관리)
- 통합 관리 (하나의 대시보드에서 모든 미디어 확인)
- 무료 플랜 할당량 공유 (25GB, 25,000 transformations/월)

### 구현

**Before:**
```typescript
folder: 'my-site-uploads',
```

**After (commit: 01d1d47):**
```typescript
folder: 'blog-web',
```

### 주의사항
- ⚠️ 코드에서 `folder` 옵션 반드시 명시
- ⚠️ 그렇지 않으면 루트에 모든 파일이 섞임
- ⚠️ 무료 플랜 용량 제한을 여러 앱이 공유

---

## Issue #3: Vercel Preview Environment vs Production

### 문제
환경변수를 추가했는데 Preview 배포에서 에러가 발생했습니다.

### 원인
Git 브랜치 배포 (예: `claude/enhance-blog-features-...`)는 **Preview 환경**입니다.

Vercel Environment Variables 설정:
```
✅ Production     → main 브랜치 배포
✅ Preview        → Git 브랜치 배포 (여기!)
✅ Development    → vercel dev 로컬 실행
```

### 해결
Preview 체크박스 반드시 활성화!

---

## 일반적인 디버깅 절차

### 1. Vercel 배포 에러

**단계:**
1. Vercel → Deployments → 최신 배포 클릭
2. **Build Logs** 탭 확인
   - TypeScript 컴파일 에러
   - 패키지 설치 에러
   - Prisma generate 에러
3. **Runtime Logs** 탭 확인
   - 페이지 접속 시 서버 에러
   - API 호출 에러
   - 환경변수 누락

### 2. 데이터베이스 연결 에러

**체크리스트:**
- [ ] DATABASE_URL 환경변수 존재 확인
- [ ] Neon Pooled Connection 사용 (`?pgbouncer=true`)
- [ ] Vercel Environment 체크박스 확인
- [ ] Vercel Redeploy 실행
- [ ] Runtime Logs에서 `DATABASE_URL present:` 확인
- [ ] Prisma 스키마와 DB 스키마 동기화 확인

### 3. API 에러 디버깅

**우선순위:**
1. 브라우저 Network 탭 (Response 확인)
2. Vercel Runtime Logs (서버 에러 확인)
3. 로컬 테스트 (`npm run dev`)
4. Prisma Studio (`npx prisma studio`)

---

## 참고 문서

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neon Connection Guide](https://neon.tech/docs/connect/connection-pooling)
- [Prisma Schema Management](https://www.prisma.io/docs/concepts/components/prisma-schema)
- [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api_reference)
