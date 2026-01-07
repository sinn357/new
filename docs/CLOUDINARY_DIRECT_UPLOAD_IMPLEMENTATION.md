# Cloudinary 직접 업로드 구현 완료 보고서

> **작업 날짜**: 2026-01-07
> **작업자**: Claude Code + Partner
> **커밋 범위**: `2ef5be3` ~ `98bc1a1`

---

## 📋 작업 개요

**목표**: Vercel Serverless Function Body Size 제한(10MB)을 우회하여 대용량 파일 업로드 지원

**Before**:
- 이미지: 10MB+ → 압축 → 9MB
- 동영상: 4.5MB 제한 (Vercel Hobby Plan)
- PDF/ZIP: 4.5MB 제한

**After**:
- 이미지: 10MB (원본 유지)
- 동영상: **100MB** ⬆️
- PDF/ZIP: **100MB** ⬆️

---

## 🔧 구현 내용

### 1. Cloudinary Signed Upload 구현

#### 1-1. 서명 생성 API 엔드포인트 추가
**파일**: `app/api/cloudinary-signature/route.ts`

```typescript
POST /api/cloudinary-signature
Body: { paramsToSign: { timestamp, folder } }
Response: { signature, apiKey, cloudName, timestamp }
```

**특징**:
- API 키를 클라이언트에 노출하지 않음 (보안)
- 서명만 생성하는 가벼운 요청 (빠름)
- Cloudinary API Secret으로 서명 생성

#### 1-2. FileUpload 컴포넌트 전면 개편
**파일**: `components/FileUpload.tsx`

**업로드 플로우**:
```
1. 클라이언트: 파일 선택
2. 클라이언트 → 서버: 서명 요청 (/api/cloudinary-signature)
3. 서버 → 클라이언트: 서명 반환
4. 클라이언트 → Cloudinary: 직접 업로드 (Vercel 우회!)
5. Cloudinary → 클라이언트: 업로드 완료 (URL 반환)
```

**주요 변경**:
- `browser-image-compression` 제거 (불필요)
- 클라이언트 파일 크기 검증 추가
- 한국어 에러 메시지
- 업로드 진행 상태 표시

#### 1-3. 기존 /api/upload Route Deprecated
**파일**: `app/api/upload/route.ts`

**변경**:
- 파일 상단에 DEPRECATED 주석 추가
- 기존 코드 유지 (하위 호환성)
- 새 업로드는 직접 업로드 사용

---

### 2. 동영상 지원 추가

#### 2-1. Tiptap Video Extension 생성
**파일**: `lib/tiptap-extensions/Video.ts`

**기능**:
- `<video>` 태그 렌더링
- `setVideo()` 명령어 추가
- controls, src 속성 지원

#### 2-2. RichTextEditor 동영상 처리
**파일**: `components/RichTextEditor.tsx`

**업데이트**:
- Video extension 추가
- `handleImageUpload()` → 동영상/이미지 자동 구분
- 파일 확장자로 타입 감지 (mp4, mov, webm, avi, m4v, ogg)

**동작**:
```typescript
// 이미지: editor.chain().focus().setImage({ src: url })
// 동영상: editor.chain().focus().setVideo({ src: url })
```

---

## 📊 성능 개선

### 업로드 속도
```
Before: 클라이언트 → Vercel → Cloudinary (2번 전송)
After:  클라이언트 → Cloudinary (1번 전송)

개선: 약 2배 빠름
```

### 서버 부하
```
Before: 모든 파일이 Vercel 서버 경유
After:  서명 생성만 서버 사용 (가벼운 요청)

개선: 서버 CPU/메모리 사용량 대폭 감소
```

---

## 🐛 해결한 이슈

### Issue 1: Invalid Signature 에러 (401 Unauthorized)
**원인**: `upload_preset`과 `signature`를 동시에 전송

**해결**:
- `upload_preset` 제거
- Signed Upload로 정상화

**커밋**: `93b2fdf`

---

### Issue 2: 이미지/동영상이 엑박으로 표시
**원인**: RichTextEditor가 `setImage()`만 호출 (동영상 미지원)

**해결**:
- Video extension 생성
- `handleImageUpload()`에서 동영상/이미지 자동 구분
- 파일 확장자 기반 분기 처리

**커밋**: `98bc1a1`

---

## 📦 파일 크기 제한

### Cloudinary Free Plan
| 파일 타입 | 제한 |
|-----------|------|
| 이미지 | 10MB/파일 |
| 동영상 | 100MB/파일 |
| PDF/ZIP | 100MB/파일 |

### 클라이언트 검증
**파일**: `components/FileUpload.tsx:28-39`

```typescript
const sizeMB = file.size / 1024 / 1024;
const isImage = file.type.startsWith('image/');
const maxSize = isImage ? 10 : 100;

if (sizeMB > maxSize) {
  setUploadError(
    `파일 크기가 너무 큽니다. ${isImage ? '이미지' : '동영상/PDF/ZIP'}는 최대 ${maxSize}MB까지 업로드 가능합니다. (현재: ${sizeMB.toFixed(2)}MB)`
  );
  return;
}
```

---

## 🔒 보안

### API 키 보호
- ✅ API Secret은 서버에만 존재
- ✅ 클라이언트에 노출되는 것: API Key (공개 가능)
- ✅ 서명은 서버에서만 생성

### Signed Upload
- ✅ 타임스탬프 기반 서명 (재사용 불가)
- ✅ folder 파라미터로 업로드 위치 제한
- ✅ 악의적 업로드 방지

---

## 🧪 디버깅 로그

### FileUpload 로그
```javascript
=== Cloudinary Upload Result ===
File: video.MP4 (26.61MB)
Secure URL: https://res.cloudinary.com/...
Public ID: blog-web/...
Resource Type: video
================================
🔵 onFileUpload 콜백 호출 시작
전달할 URL: https://...
✅ onFileUpload 콜백 호출 완료
```

### RichTextEditor 로그
```javascript
=== RichTextEditor 미디어 업로드 ===
받은 URL: https://res.cloudinary.com/.../video.mov
파일 확장자: mov
비디오 여부: true
동영상 삽입 중...
미디어 삽입 완료
```

**목적**: 업로드 플로우 추적 및 문제 진단

---

## 📝 커밋 히스토리

### 1. `2ef5be3` - feat: implement Cloudinary direct upload to bypass Vercel limits
- `/api/cloudinary-signature` 엔드포인트 추가
- FileUpload 컴포넌트 직접 업로드로 전환
- browser-image-compression 제거
- 업로드 제한 증가 (10MB → 100MB)

### 2. `93b2fdf` - fix: correct Cloudinary signature validation and add file size checks
- `upload_preset` 제거 (Invalid Signature 해결)
- 클라이언트 파일 크기 검증 추가
- 한국어 에러 메시지

### 3. `4ad2494` - debug: add detailed console logs for image upload debugging
- Cloudinary 응답 로그 추가
- MarkdownEditor 미디어 업로드 로그

### 4. `3ae59c8` - debug: add onFileUpload callback execution logs
- 콜백 실행 추적 로그

### 5. `98bc1a1` - feat: add video support to RichTextEditor
- Tiptap Video extension 생성
- RichTextEditor 동영상/이미지 자동 구분
- 동영상 재생 지원

---

## 🚀 배포

### Vercel 자동 배포
- GitHub push → Vercel 자동 빌드 & 배포
- 환경변수 확인 필요:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### 빌드 테스트
```bash
npm run build
```

**결과**: ✅ 모든 빌드 통과

---

## 📚 참고 문서

### Cloudinary
- [Signed Uploads](https://cloudinary.com/documentation/upload_images#signed_uploads)
- [Direct Upload from Browser](https://cloudinary.com/documentation/upload_images#uploading_directly_from_the_browser)

### Tiptap
- [Custom Extensions](https://tiptap.dev/docs/editor/extensions/custom-extensions)
- [Video Extension Example](https://github.com/ueberdosis/tiptap/discussions/1480)

---

## ⚠️ 알려진 제한사항

### 1. Duplicate Extension 경고
```
[tiptap warn]: Duplicate extension names found: ['link', 'underline']
```
- 영향: 기능 정상 작동, 콘솔 경고만 표시
- 해결: 다음 세션에서 수정 예정

### 2. 동영상만 업로드 시 게시 불가
- Validation이 `<video>` 태그 미인식
- 해결: 다음 세션에서 수정 예정

### 3. 동영상 썸네일 미표시
- 홈/Work/Archive 리스트에서 동영상 미리보기 없음
- 해결: 다음 세션에서 Cloudinary 썸네일 추가 예정

### 4. 모바일 박스 좁음
- 모바일에서 게시물 콘텐츠 영역 협소
- 해결: 다음 세션에서 반응형 개선 예정

---

## ✅ 작업 완료 체크리스트

- [x] Cloudinary 서명 생성 API 구현
- [x] FileUpload 직접 업로드 전환
- [x] 파일 크기 검증 추가
- [x] 에러 메시지 한국어화
- [x] 동영상 업로드 지원 (100MB)
- [x] Tiptap Video extension 생성
- [x] RichTextEditor 동영상 처리
- [x] 디버깅 로그 추가
- [x] 빌드 테스트 통과
- [x] Git 커밋 & 푸시
- [x] Vercel 자동 배포

---

## 🎯 다음 단계

다음 세션 작업 목록은 `NEXT_SESSION_TASKS.md` 참고

**우선순위**:
1. Duplicate extension 경고 제거
2. 동영상 validation 수정
3. Cloudinary 썸네일 미리보기
4. 모바일 반응형 개선

---

**문서 작성일**: 2026-01-07
**마지막 커밋**: `98bc1a1`
