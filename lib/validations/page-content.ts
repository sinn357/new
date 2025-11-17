import { z } from 'zod';

/**
 * PageContent 스키마 - 페이지 제목/내용 수정 시 사용
 *
 * 특징:
 * - page: 페이지 식별자 (work, archive, about 등)
 * - title/content: 페이지 헤더 정보
 */
export const pageContentSchema = z.object({
  page: z.string()
    .min(1, '페이지 이름을 입력하세요')
    .regex(/^[a-z-]+$/, '페이지 이름은 소문자와 하이픈만 사용할 수 있습니다'),

  title: z.string()
    .min(1, '제목을 입력하세요')
    .max(200, '제목은 200자 이하여야 합니다'),

  content: z.string()
    .max(5000, '내용은 5,000자 이하여야 합니다')
    .optional()
    .default('')
});

/**
 * PageContent 생성/수정 시 사용하는 타입
 */
export type PageContentInput = z.infer<typeof pageContentSchema>;
