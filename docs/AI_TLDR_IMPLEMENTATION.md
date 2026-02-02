# AI TL;DR Implementation (Blog Web)

> Archive/Work 글 작성 폼에 AI TL;DR 생성 기능 추가

**작성일**: 2026-02-02

---

## 1. 개요

블로그 작성 워크플로우에 AI TL;DR 요약 기능을 추가했다.  
작성자가 본문을 입력한 뒤 **AI TL;DR 버튼 → 미리보기 → 본문에 삽입** 흐름으로 활용한다.

핵심 목표:
- 글 작성 효율 개선
- 독자용 요약을 빠르게 삽입

---

## 2. 사용 방법

1) `/archive` 또는 `/work` 페이지에서 새 글 작성/수정
2) 본문 입력 후 `AI TL;DR` 클릭
3) 미리보기 확인
4) `본문에 적용` → 본문 상단에 TL;DR 삽입
5) 저장

---

## 3. 서버 구현 (LangChain)

### API Route
- 경로: `app/api/ai/summary/route.ts`

### LangChain 구성 요소
- `ChatOpenAI`: OpenAI 모델 호출
- `ChatPromptTemplate`: system/user 템플릿 구성
- `StructuredOutputParser` + `zod`: JSON 출력 강제 및 검증

### 응답 스키마
```
{
  "title": "string",
  "summary": "string",
  "bullets": ["string"],
  "confidence": 0.0-1.0
}
```

### 환경변수
- `OPENAI_API_KEY` 필요 (Vercel/로컬 각각 설정)

---

## 4. UI 적용

### 적용 위치
- `components/ArchiveForm.tsx`
- `components/WorkForm.tsx`

### UI 흐름
- `AI TL;DR` 버튼 클릭 → `/api/ai/summary` 호출
- 결과 미리보기 출력
- `본문에 적용` 클릭 시 HTML 블록 삽입

삽입 HTML (요약 블록)
```
<div data-ai-summary="true">
  <p><strong>TL;DR</strong></p>
  <ul>
    <li>...</li>
  </ul>
  <p>요약 문장</p>
</div>
```

---

## 5. 주요 변경 파일

- `app/api/ai/summary/route.ts`
- `components/ArchiveForm.tsx`
- `components/WorkForm.tsx`

---

## 6. 운영 참고

- TL;DR은 본문에 직접 삽입되므로, 독자 페이지에 자동 노출됨
- AI 실패 시 에러 메시지 표시
- 추후 TL;DR을 별도 필드로 분리 가능

---

**Owner**: Blog Web
**Goal**: AI-assisted Content Writing
