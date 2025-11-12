# 미디어 삽입 기능 구현 가이드

## 개요
Work와 Archive 페이지에서 글 작성 시 이미지와 동영상을 쉽게 삽입할 수 있는 기능을 MarkdownEditor 컴포넌트에 구현했습니다.

## 구현 내용

### 1. MarkdownEditor 컴포넌트 확장

#### 주요 기능
- **편집 툴바**: 굵게, 기울임, 제목, 링크, 미디어 버튼 제공
- **미디어 업로드 패널**: 📷 미디어 버튼 클릭 시 FileUpload 컴포넌트와 연동
- **자동 마크다운 삽입**: 업로드된 파일을 적절한 마크다운 문법으로 자동 변환
- **비디오 렌더링**: 동영상 파일을 자동 감지하여 `<video>` 태그로 렌더링
- **커서 위치 관리**: 삽입 후 커서가 적절한 위치로 자동 이동

#### 기술적 구현

##### 1. 상태 관리
```typescript
const [showMediaUpload, setShowMediaUpload] = useState(false);
const textareaRef = useRef<HTMLTextAreaElement>(null);
```

##### 2. 텍스트 삽입 함수
```typescript
const insertText = (text: string) => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const newValue = value.substring(0, start) + text + value.substring(end);

  onChange(newValue);

  // 커서 위치를 삽입된 텍스트 뒤로 이동
  setTimeout(() => {
    textarea.focus();
    textarea.setSelectionRange(start + text.length, start + text.length);
  }, 0);
};
```

##### 3. 미디어 업로드 처리
```typescript
const handleMediaUpload = (url: string) => {
  const fileExtension = url.split('.').pop()?.toLowerCase();
  const isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(fileExtension || '');

  if (isVideo) {
    insertText(`\n![동영상](${url})\n\n`);
  } else {
    insertText(`\n![이미지](${url})\n\n`);
  }

  setShowMediaUpload(false);
};
```

##### 4. 비디오 렌더링 지원
```typescript
img: ({ src, alt }: any) => {
  // 비디오 파일 확장자 체크
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi'];
  const fileExtension = src?.split('.').pop()?.toLowerCase();
  const isVideo = videoExtensions.includes(fileExtension || '');

  if (isVideo) {
    return (
      <video
        controls
        className="max-w-full h-auto rounded-lg shadow-md mb-4"
        style={{ maxWidth: '600px', width: '100%' }}
      >
        <source src={src} type={`video/${fileExtension}`} />
        동영상을 재생할 수 없습니다.
      </video>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="max-w-full h-auto rounded-lg shadow-md mb-4"
    />
  );
}
```

### 2. UI 구성

#### 툴바 버튼
- **굵게 (B)**: `**텍스트**` 삽입
- **기울임 (I)**: `*텍스트*` 삽입
- **제목 (H2)**: `## 제목` 삽입
- **링크 (🔗)**: `[링크텍스트](URL)` 삽입
- **미디어 (📷)**: 미디어 업로드 패널 토글

#### 미디어 업로드 패널
- FileUpload 컴포넌트 재사용
- 이미지와 동영상 파일 모두 지원
- 업로드 후 자동으로 패널 닫힘

### 3. 지원 파일 형식

#### 이미지
- JPG, PNG, GIF, WebP 등
- 마크다운: `![이미지](URL)`
- 렌더링: `<img>` 태그

#### 동영상
- MP4, WebM, MOV, AVI 등
- 마크다운: `![동영상](URL)` (이미지 문법 사용)
- 렌더링: `<video>` 태그 (자동 감지)

### 4. 사용자 경험

#### 편집 모드
1. 📷 미디어 버튼 클릭
2. 파일 선택 (드래그&드롭 또는 클릭)
3. 업로드 완료 후 자동으로 마크다운 문법 삽입
4. 커서가 삽입된 내용 뒤로 자동 이동

#### 미리보기 모드
- 이미지는 반응형으로 표시 (최대 너비 제한)
- 동영상은 컨트롤이 있는 플레이어로 표시
- 최대 너비 600px로 제한하여 레이아웃 유지

### 5. 마크다운 사용법 가이드 업데이트

```text
제목: # H1, ## H2, ### H3
강조: **굵게**, *기울임*
링크: [텍스트](URL)
이미지: ![alt텍스트](이미지URL)
동영상: ![동영상](동영상URL) - mp4, webm, mov 등 지원
목록: - 또는 1. 사용
인용: > 인용문
코드: `인라인코드` 또는 ```언어명
미디어 업로드: 📷 미디어 버튼으로 파일 업로드 후 자동 삽입
```

## 적용 범위

### Work 페이지
- 포트폴리오 프로젝트 설명에 이미지/동영상 삽입 가능
- 프로젝트 데모 동영상, 스크린샷 등 활용

### Archive 페이지
- 블로그 포스트에 다양한 미디어 컨텐츠 삽입 가능
- 기술 가이드, 튜토리얼 등에서 시각적 설명 강화

## 향후 개선 사항

1. **드래그&드롭 지원**: 텍스트 에리어에 직접 파일 드롭
2. **이미지 리사이징**: 업로드 시 자동 크기 최적화
3. **동영상 썸네일**: 동영상 업로드 시 썸네일 자동 생성
4. **미디어 갤러리**: 기존 업로드한 미디어 재사용 기능
5. **진행률 표시**: 큰 파일 업로드 시 진행률 표시

## 기술적 고려사항

### 성능
- 대용량 파일 업로드 시 Cloudinary에서 자동 최적화
- 동영상은 스트리밍으로 로드하여 초기 로딩 시간 단축

### 호환성
- 모든 주요 브라우저에서 `<video>` 태그 지원
- 모바일 기기에서도 정상 작동

### 보안
- 파일 형식 검증으로 악성 파일 업로드 방지
- Cloudinary를 통한 안전한 파일 저장

## 결론

이 구현을 통해 사용자는 Work와 Archive 페이지에서 텍스트와 함께 이미지, 동영상을 자유롭게 삽입할 수 있게 되었습니다. 직관적인 툴바 인터페이스와 자동 마크다운 변환으로 편의성을 극대화했으며, 반응형 렌더링으로 다양한 디바이스에서 최적의 사용자 경험을 제공합니다.