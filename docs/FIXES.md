# Blog Web - Error Fixes

## 2026-02-21

### Lightbox Type Error on Vercel Build

**Error Message**:
```
Type error: Type '({ onClick, disabled }) => JSX.Element' is not assignable to type '() => ReactNode'
```

**Affected**: `components/CollapsibleContent.tsx` (production build / TypeScript 단계)

**Root Cause**:
- 설치된 `yet-another-react-lightbox` 타입 정의에서 `render.buttonPrev/buttonNext` 시그니처가 인자 없는 함수였는데,
  인자를 받는 커스텀 렌더를 전달함

**Solution**:
- 커스텀 `render.buttonPrev/buttonNext` 제거
- 라이브러리 기본 네비 버튼 사용
- 네비 버튼 위치/스타일은 CSS 오버라이드(`.yarl__navigation_prev`, `.yarl__navigation_next`)로 처리

**Result**:
- `next build` TypeScript 에러 해소

---

### Collapsible Reset + Broken Images After Closing Lightbox

**Error Symptoms**:
- 이미지 라이트박스 닫으면 접기 상태가 전부 펼쳐짐
- 본문 이미지가 엑박으로 바뀌는 현상 발생

**Affected**: `components/CollapsibleContent.tsx`

**Root Cause**:
- 라이트박스 open/close 상태 변경으로 컴포넌트 리렌더 시,
  `dangerouslySetInnerHTML`가 재주입되어 본문 DOM 상태(접힘/이미지 상태)가 초기화됨

**Solution**:
- `dangerouslySetInnerHTML` 주입 객체를 `useMemo`로 고정해서 `html` 값이 바뀔 때만 재주입되도록 변경

**Result**:
- 라이트박스 진입/종료 후에도 접기 상태 유지
- 이미지 엑박 재발 방지

---

### Editor Toolbar Overlap and FAB Collision

**Error Symptoms**:
- 글쓰기 시 sticky 툴바가 상단 네비게이션에 가려짐
- 우하단 상/하단 이동 버튼이 로그인(Admin) 버튼과 겹침

**Affected**: `components/RichTextEditor.tsx`

**Solution**:
- 툴바 sticky offset 상향 (`top-24`)
- 빠른 이동 버튼 위치 상향 (`bottom-24`)

**Result**:
- 상단 툴바 가림 해소
- 하단 고정 버튼 간 겹침 해소

---

## 2026-02-20

### Work Content Limit Update

**Change**:
- Work 본문 길이 제한을 10,000자에서 100,000자로 상향

**Affected**: `lib/validations/work.ts`, `lib/validations/__tests__/work.test.ts`

**Result**:
- 긴 본문 업로드/저장 가능

---


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

**Last Updated**: 2026-02-21
