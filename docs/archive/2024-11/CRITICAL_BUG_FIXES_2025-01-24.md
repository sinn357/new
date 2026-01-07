# Critical Bug Fixes - 2025-01-24

> **작업 날짜**: 2025년 1월 24일
> **담당**: Claude Code
> **커밋**: c20ba75, ef72d85

---

## 📋 작업 개요

사용자 피드백을 기반으로 Archive 페이지와 About 페이지의 치명적인 UI/UX 버그를 진단하고 수정한 작업입니다. 초기에는 간단한 수정으로 해결될 것으로 예상했으나, 근본 원인 분석을 통해 여러 레이어에서 문제가 발생하고 있음을 확인했습니다.

---

## 🐛 보고된 문제점

### 1. Archive 페이지 - 카테고리바 스크롤 문제 ⭐ Critical
**증상**:
- PC 환경에서 카테고리 바가 "게임", "드라마" 카테고리를 표시하지 못함
- 전체 11개 카테고리 중 "음식"까지만 보이고 나머지 2개 잘림
- 모바일에서는 스크롤이 작동했으나 PC에서는 **스크롤 자체가 불가능**
- 사용자가 오른쪽에 더 있는지 알 수 없음

### 2. About 페이지 - 빈 텍스트 저장 불가 ⭐ Critical
**증상**:
- 대제목(title)과 소제목(subtitle/content)을 빈 문자열로 저장 시도 시 실패
- 저장 버튼을 눌러도 이전 텍스트로 계속 되돌아감
- InlineEdit 컴포넌트가 빈 값을 거부하는 것으로 추정

### 3. About 페이지 - Skills/Interests/Experience 디자인 미적용
**증상**:
- 쉼표로 구분해서 입력해도 pills(알약 모양) 디자인이 적용되지 않음
- 평범한 텍스트로만 표시됨
- Experience 섹션은 아예 수정조차 안됨

---

## 🔍 진단 과정

### Phase 1: 초기 수정 시도 (실패)

**가설**: `overflow-hidden`이 자식의 `overflow-x-auto`를 막고 있음

**시도한 수정**:
```typescript
// archive/page.tsx:260, work/page.tsx:273
// 변경 전
<div className="... overflow-hidden">
  <div className="... overflow-x-auto scrollbar-hide ...">

// 변경 후
<div className="...">  // overflow-hidden 제거
  <div className="... overflow-x-auto scrollbar-hide ...">
```

**결과**: ❌ 실패 - 사용자가 여전히 스크롤 불가 보고

---

### Phase 2: 근본 원인 분석

#### 문제 1 분석: 스크롤바 문제

**파일 검토**:
1. `app/archive/page.tsx:261` - 카테고리바 구현
2. `app/globals.css:114-121` - scrollbar-hide 클래스 정의
3. `lib/archive-store.ts:20-32` - 11개 카테고리 정의 확인

**핵심 발견**:
```css
/* app/globals.css:114-121 */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE/Edge */
  scrollbar-width: none;     /* Firefox */
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;            /* Chrome/Safari */
}
```

**진단 결과**:
- ✅ `overflow-x-auto`는 정상 작동 중
- ❌ `scrollbar-hide` 클래스가 스크롤바를 **완전히 숨김**
- ❌ PC 사용자는 스크롤 가능한지 알 수 없음
- ❌ 마우스 휠/드래그로 스크롤해도 시각적 피드백 없음

#### 문제 2 분석: 빈 텍스트 검증

**파일 검토**:
1. `components/InlineEdit.tsx:27` - 저장 로직
2. `app/api/page-content/route.ts:90` - API 검증 로직

**핵심 발견**:
```typescript
// InlineEdit.tsx:27 (초기 수정에서 이미 해결)
if (value.trim() !== text.trim()) {  // ❌ trim()으로 빈 값 차단
  await onSave(value.trim());
}

// API route.ts:90 (진짜 범인!)
if (!page || !title || !content) {  // ❌ 빈 문자열은 falsy
  return Response.json(
    { error: 'Page, title, and content are required' },
    { status: 400 }
  );
}
```

**진단 결과**:
- InlineEdit는 이미 수정했으나 효과 없음
- **API 레벨에서 빈 문자열을 거부**하고 있었음
- JavaScript의 falsy 체크: `""` → `false` → 400 에러 반환

#### 문제 3 분석: Pills 디자인

**파일 검토**:
1. `app/about/page.tsx:384-397` - Skills 렌더링 로직
2. `app/about/page.tsx:65-67` - 데이터 소스

**조건부 렌더링 구조**:
```typescript
{isAdmin ? (
  <InlineEdit ... />  // 관리자: 편집 모드
) : skills.length > 0 ? (
  <div className="flex flex-wrap gap-2">
    {skills.map((skill, index) => (
      <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-teal-500 ...">
        {skill}
      </span>
    ))}
  </div>
) : (
  <p>아직 추가된 스킬이 없습니다.</p>
)}
```

**진단 결과**:
- ✅ 코드는 완벽하게 작성되어 있음
- ❌ 사용자가 **admin 모드로 로그인한 상태**에서 테스트
- 조건부 렌더링의 첫 번째 분기(`isAdmin`)만 실행되어 InlineEdit만 보임
- 사용자가 로그아웃하니 pills 정상 표시 확인

---

## ✅ 해결 방법

### 수정 1: 스크롤바 가시화

**목표**: 얇고 세련된 스크롤바로 스크롤 가능 영역 명확히 표시

**구현**:

1. **globals.css에 커스텀 스크롤바 스타일 추가**:
```css
/* app/globals.css:123-156 */
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: rgb(129, 140, 248) transparent;
}

.scrollbar-thin::-webkit-scrollbar {
  height: 6px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgb(129, 140, 248);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgb(99, 102, 241);
}

.dark .scrollbar-thin {
  scrollbar-color: rgb(129, 140, 248) transparent;
}
```

2. **카테고리바에 적용**:
```typescript
// archive/page.tsx:261, work/page.tsx:274
// 변경 전
<div className="... overflow-x-auto scrollbar-hide ...">

// 변경 후
<div className="... overflow-x-auto scrollbar-thin ...">
```

**특징**:
- 6px 높이의 얇은 스크롤바
- Indigo 색상으로 브랜드 일관성 유지
- 호버 시 색상 진하게 변경
- 다크모드 지원
- 크로스 브라우저 호환 (Chrome, Firefox, Safari, Edge)

---

### 수정 2: API 빈 값 검증 로직 개선

**목표**: 빈 문자열("")을 유효한 값으로 허용

**구현**:

```typescript
// app/api/page-content/route.ts

// POST 핸들러 (49-53줄)
// 변경 전
if (!page || !title || !content) {  // ❌ falsy 체크

// 변경 후
if (!page || title === undefined || content === undefined) {  // ✅ undefined만 거부

// PUT 핸들러 (90-94줄)
// 동일하게 수정
if (!page || title === undefined || content === undefined) {
```

**차이점**:
| 검사 방식 | `""` (빈 문자열) | `null` | `undefined` | `0` |
|----------|----------------|--------|-------------|-----|
| `!value` | ❌ 거부 | ❌ 거부 | ❌ 거부 | ❌ 거부 |
| `value === undefined` | ✅ 허용 | ✅ 허용 | ❌ 거부 | ✅ 허용 |

**결과**:
- 빈 문자열 저장 가능
- 실제로 값이 없는 경우(`undefined`)만 400 에러 반환
- title과 content를 비워서 저장 가능

---

### 수정 3: Admin 모드 설명

**문제 해결**:
- 사용자에게 admin 로그아웃 후 테스트 요청
- 로그아웃 시 pills/bullet points/timeline 디자인 정상 표시 확인

**교훈**:
- 조건부 렌더링이 있는 경우, 모든 분기를 테스트해야 함
- Admin 모드와 일반 모드의 UI가 다르다는 점을 문서화 필요

---

## 📊 영향 범위

### 변경된 파일

| 파일 | 변경 내용 | 라인 수 |
|-----|---------|---------|
| `app/archive/page.tsx` | scrollbar-hide → scrollbar-thin | 1줄 |
| `app/work/page.tsx` | scrollbar-hide → scrollbar-thin | 1줄 |
| `app/globals.css` | 커스텀 스크롤바 스타일 추가 | +43줄 |
| `app/api/page-content/route.ts` | 빈 값 검증 로직 수정 (POST/PUT) | 2줄 |
| `components/InlineEdit.tsx` | trim() 제거 (이전 커밋) | 2줄 |
| `app/about/page.tsx` | 빈 문자열 체크 개선 (이전 커밋) | 3줄 |

### 커밋 히스토리

```bash
ef72d85 fix: resolve scrollbar visibility and empty text validation issues
├─ 스크롤바 가시화 (scrollbar-thin)
├─ API 빈 값 검증 수정
└─ globals.css 커스텀 스크롤바 스타일

c20ba75 fix: resolve critical UI issues on Archive and About pages
├─ overflow-hidden 제거
├─ InlineEdit trim() 제거
└─ About 페이지 빈 문자열 체크 개선
```

---

## 🧪 테스트 가이드

### 1. 카테고리바 스크롤 테스트

**PC 환경**:
1. `/archive` 또는 `/work` 페이지 접속
2. 카테고리바 하단에 얇은 인디고 스크롤바 확인
3. 마우스 드래그 또는 휠 스크롤로 "게임", "드라마" 카테고리 확인
4. 스크롤바 호버 시 색상 진하게 변하는지 확인

**모바일 환경**:
1. 동일하게 스크롤 테스트
2. 터치 스크롤 정상 작동 확인

### 2. 빈 텍스트 저장 테스트

**Admin 모드**:
1. `/about` 페이지 접속
2. 대제목(title) 편집 버튼 클릭
3. 모든 텍스트 삭제 후 저장
4. 빈 텍스트로 저장되고 페이지 새로고침 시 유지 확인
5. 소제목(subtitle) 동일하게 테스트

### 3. Pills 디자인 테스트

**Admin 로그아웃 상태**:
1. `/about` 페이지 접속
2. Skills 섹션: 인디고-틸 그라디언트 pills 표시 확인
3. Interests 섹션: 틸 색상 bullet points 표시 확인
4. Experience 섹션: 연도 배지 + 타임라인 표시 확인

---

## 🎓 배운 점

### 1. 계층적 문제 분석의 중요성

**문제**: 스크롤바 안 보임
- ❌ 잘못된 진단: "overflow-hidden이 막고 있다"
- ✅ 올바른 진단: "scrollbar-hide가 스크롤바를 숨기고 있다"

**교훈**:
- 증상만 보고 추측하지 말고, 관련된 모든 레이어 확인
- CSS 클래스 이름이 힌트를 준다 (`scrollbar-hide`)

### 2. API 레벨 검증 확인 필수

**문제**: 프론트엔드 수정했는데도 저장 안됨
- ❌ InlineEdit만 수정하고 끝
- ✅ API 라우트의 검증 로직도 확인

**교훈**:
- Full-stack 버그는 모든 레이어 검토 필요
- 프론트 → API → DB 전체 흐름 추적

### 3. Falsy vs Undefined 구분

**문제**: `!value` 체크의 함정
```javascript
!""        // true  (빈 문자열도 거부)
!0         // true  (0도 거부)
!false     // true  (false도 거부)
!undefined // true  (undefined 거부) ✅
```

**해결**:
```javascript
value === undefined  // undefined만 정확히 검사
```

**교훈**:
- 빈 문자열이 유효한 값인 경우 `=== undefined` 사용
- falsy 체크(`!value`)는 의도하지 않은 값도 거부할 수 있음

### 4. 조건부 렌더링 테스트

**문제**: Admin 모드에서만 테스트
```typescript
{isAdmin ? (
  <AdminView />   // ← 여기만 테스트됨
) : (
  <UserView />    // ← 테스트 안됨
)}
```

**교훈**:
- 조건부 렌더링의 모든 분기를 테스트해야 함
- Admin/User 권한별 UI 차이 명확히 문서화

---

## 🚀 다음 개선 사항

### UX 개선
- [ ] 카테고리바 좌우 스크롤 버튼 추가 (화살표)
- [ ] 스크롤 위치에 따라 좌우 그라디언트 인디케이터 동적 표시
- [ ] 모바일에서 스와이프 제스처 힌트 추가

### 코드 품질
- [ ] InlineEdit 컴포넌트에 validation 옵션 추가
  ```typescript
  <InlineEdit
    allowEmpty={true}
    minLength={0}
    maxLength={100}
  />
  ```
- [ ] API 에러 메시지 개선 (빈 값 vs 누락 구분)

### 문서화
- [ ] Admin vs User 모드 UI 차이 스크린샷 추가
- [ ] 테스트 체크리스트를 자동화 스크립트로 변환

---

## 📚 관련 문서

- `components/InlineEdit.tsx` - 인라인 편집 컴포넌트
- `app/api/page-content/route.ts` - 페이지 콘텐츠 API
- `app/globals.css` - 전역 스타일 및 스크롤바 정의
- `lib/archive-store.ts` - Archive 카테고리 정의

---

**작성**: Claude Code
**검증**: Partner (사용자 피드백 기반)
**날짜**: 2025-01-24
