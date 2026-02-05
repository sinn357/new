# Blog Web - Error Fixes

## 2026-02-05

### Build Failures (TypeScript)

**Error Message**:
```
Type error: Cannot find name 'contentForMeta'
```

**Affected**: `app/archive/[id]/page.tsx`, `app/work/[id]/page.tsx` (빌드 단계)

**Root Cause**:
- 메타데이터/JSON-LD에서 `contentForMeta`를 참조했으나 변수 정의가 누락됨

**Solution**:
- `const contentForMeta = getContentForLang(..., 'ko')` 정의 추가

**Result**:
- 타입 체크 통과 및 빌드 성공

---

### Archive/Work Form Crash (Client Runtime)

**Error Message**:
```
React.Children.only expected to receive a single React element child.
```

**Affected**: Archive/Work 작성/수정 폼 (클라이언트 런타임)

**Root Cause**:
- `FormControl` 컴포넌트 내부에 `<input>`과 `RichTextEditor` 두 개의 자식이 들어감

**Solution**:
- 숨겨진 `<input>`을 `FormControl` 밖으로 이동

**Result**:
- 작성/수정 화면 정상 로드

## 2025-11-18

### Database Column Missing (Runtime Error)

**Error Message**:
```
Invalid prisma.work.findMany() invocation:
The column Work.isFeatured does not exist in the current database.
```

**Affected**: Work, Archive 페이지 (런타임)

**Root Cause**:
- 최신 브랜치 (`enhance-blog-features`)가 main에 병합 안 됨
- Prisma 스키마 변경사항이 DB에 적용 안 됨
- `Work.isFeatured`, `Archive.rating` 컬럼 누락

**Solution**:
1. 최신 브랜치 확인: `git fetch origin`
2. 브랜치 병합: `git merge origin/claude/enhance-blog-features-01U5vmkLQjLg2y1fztC3pbdp`
3. DB 동기화: `npx prisma db push`
4. Vercel 자동 재배포

**Result**:
- Database 스키마 동기화 완료
- Work/Archive 페이지 정상 작동

**Lesson**:
- 웹 Claude가 작업한 브랜치는 main 병합 확인 필수
- Vercel 배포 전 DB 스키마 동기화 체크

---

**Last Updated**: 2026-02-05
