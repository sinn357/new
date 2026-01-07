# 다음 세션 작업 목록

> **날짜**: 2026-01-07
> **우선순위 순서로 정렬**

---

## 🎯 작업 개요

동영상 업로드 기능 개선 및 모바일 UX 최적화

---

## 📋 작업 목록

### 1️⃣ Tiptap Duplicate Extension 경고 제거 (⏱️ 1분)

**문제**:
```
[tiptap warn]: Duplicate extension names found: ['link', 'underline']
```

**원인**:
- `RichTextEditor.tsx`에서 `Underline`, `Link`를 extensions 배열에 추가했는데
- `StarterKit`에 이미 포함되어 있을 가능성

**해결 방법**:
1. `components/RichTextEditor.tsx` 열기
2. extensions 배열에서 `Underline`, `Link` 제거
3. 또는 StarterKit.configure에서 명시적으로 제외

**파일**:
- `components/RichTextEditor.tsx` (164-174줄 근처)

---

### 2️⃣ 동영상만 있어도 게시 가능하도록 Validation 수정 (⏱️ 5분)

**문제**:
- 동영상만 업로드하고 "추가" 버튼 클릭 시
- "텍스트 또는 이미지를 추가하세요" 에러 발생

**원인**:
- Validation 로직이 `<video>` 태그를 인식하지 못함
- 텍스트 또는 `<img>` 태그만 체크

**해결 방법**:
1. `components/ArchiveForm.tsx` 및 `WorkForm.tsx`에서 validation 로직 찾기
2. 정규식 또는 조건문에 `<video>` 태그 포함 추가
3. 예시:
   ```typescript
   // Before
   const hasContent = content.trim() || /<img/.test(content);

   // After
   const hasContent = content.trim() || /<img/.test(content) || /<video/.test(content);
   ```

**파일**:
- `components/ArchiveForm.tsx`
- `components/WorkForm.tsx`

---

### 3️⃣ Cloudinary 동영상 썸네일 미리보기 추가 (⏱️ 15분)

**문제**:
- 홈/Work/Archive 리스트에서 동영상이 미리보기로 표시 안 됨
- 엑박 또는 빈 공간으로 보임

**해결 방법** (권장: Cloudinary 자동 썸네일):

**방법 A**: URL 변환 방식 (가장 간단)
```typescript
// 동영상 URL에서 썸네일 생성
function getVideoThumbnail(videoUrl: string): string {
  // https://res.cloudinary.com/.../video.mp4
  // → https://res.cloudinary.com/.../video.jpg
  return videoUrl.replace(/\.(mp4|mov|webm|avi|m4v|ogg)$/i, '.jpg');
}
```

**방법 B**: Cloudinary Transformation API (더 정교)
```typescript
// https://res.cloudinary.com/.../upload/v123/video.mp4
// → https://res.cloudinary.com/.../upload/so_0,f_jpg/v123/video.jpg
// so_0: 0초 시점, f_jpg: jpg 포맷
```

**구현 위치**:
- 홈 페이지: `app/page.tsx` (Work/Archive 미리보기)
- Work 페이지: `app/work/page.tsx`
- Archive 페이지: `app/archive/page.tsx`

**UI 개선**:
- 썸네일 위에 플레이 버튼 오버레이 추가
- 동영상임을 명확히 표시

**파일**:
- `app/page.tsx`
- `app/work/page.tsx`
- `app/archive/page.tsx`
- (선택) `lib/utils/media.ts` - 유틸 함수 생성

---

### 4️⃣ 모바일 게시물 박스 제거 (⏱️ 10분)

**문제**:
- 모바일에서 게시물 자세히 보기가 박스 안에 갇혀 좁음
- 테두리와 패딩으로 인해 콘텐츠 영역 협소

**해결 방법**:
- 데스크톱: 박스 유지 (테두리, 패딩, max-width)
- 모바일: 박스 제거 (전체 폭 사용)

**CSS 수정 예시**:
```css
/* Desktop */
.post-detail {
  border: 1px solid #e5e7eb;
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

/* Mobile (768px 이하) */
@media (max-width: 768px) {
  .post-detail {
    border: none;
    border-top: 1px solid #e5e7eb; /* 구분선만 */
    padding: 16px 12px;
    max-width: 100%;
  }
}
```

**또는 Tailwind 사용**:
```tsx
<div className="
  border border-gray-300 p-8 max-w-3xl mx-auto
  md:border-none md:border-t md:p-4 md:max-w-full
">
```

**파일**:
- `app/work/[id]/page.tsx`
- `app/archive/[id]/page.tsx`

---

## 🔍 테스트 체크리스트

### 1번 작업 후:
- [ ] 브라우저 콘솔에 duplicate extension 경고 사라짐
- [ ] Link, Underline 기능 정상 작동

### 2번 작업 후:
- [ ] 동영상만 업로드 → "추가" 버튼 클릭 → 정상 게시
- [ ] 텍스트만 → 정상 게시
- [ ] 이미지만 → 정상 게시

### 3번 작업 후:
- [ ] 홈 페이지 Work/Archive 섹션에서 동영상 썸네일 표시
- [ ] Work 리스트에서 동영상 썸네일 표시
- [ ] Archive 리스트에서 동영상 썸네일 표시
- [ ] 썸네일 클릭 → 상세 페이지 이동 → 동영상 재생 가능

### 4번 작업 후:
- [ ] 데스크톱: 게시물 박스 그대로 유지
- [ ] 모바일 (iPhone/Android): 박스 없이 전체 폭 사용
- [ ] 모바일에서 콘텐츠 가독성 향상

---

## 📚 참고 자료

### Cloudinary Video Thumbnails
- [Cloudinary Docs - Video Thumbnails](https://cloudinary.com/documentation/video_manipulation_and_delivery#generating_video_thumbnails)
- 자동 썸네일: `.mp4` → `.jpg` 변환
- 특정 시점: `so_2.5` (2.5초 시점)

### Responsive Design
- Tailwind Breakpoints: `sm:`, `md:`, `lg:`
- 모바일 우선: 기본 스타일 → 데스크톱 override

---

## 💡 추가 제안 (선택)

### 동영상 재생 버튼 오버레이
썸네일 위에 플레이 버튼 아이콘 추가:
```tsx
<div className="relative">
  <img src={thumbnail} alt="Video thumbnail" />
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-16 h-16 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-white">
        {/* Play icon */}
      </svg>
    </div>
  </div>
</div>
```

### 동영상 시간 표시
썸네일 우측 하단에 동영상 길이 표시 (예: "2:34")
- Cloudinary에서 `duration` 메타데이터 사용

---

**세션 시작 시 이 문서를 Claude에게 제공하세요!**
