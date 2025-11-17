import { z } from 'zod';

/**
 * Archive 카테고리 (archive-store.ts와 동기화)
 */
const ARCHIVE_CATEGORY_KEYS = [
  'business',
  'essay',
  'movie',
  'book',
  'music',
  'anime',
  'comics',
  'product',
  'food',
  'game',
  'activity'
] as const;

/**
 * Archive 스키마 - 아카이브 생성/수정 시 사용
 *
 * 특징:
 * - 태그는 콤마 구분 문자열 → 배열 변환
 * - 카테고리는 사전 정의된 값만 허용
 * - 제목/내용 길이 제한
 */
export const archiveSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력하세요')
    .max(200, '제목은 200자 이하여야 합니다'),

  content: z.string()
    .min(1, '내용을 입력하세요')
    .max(50000, '내용은 50,000자 이하여야 합니다'),

  category: z.enum(ARCHIVE_CATEGORY_KEYS, {
    message: '올바른 카테고리를 선택하세요'
  }),

  tags: z.string()
    .optional()
    .default('')
    .transform((val) => {
      // 콤마로 구분된 문자열을 배열로 변환
      if (!val || val.trim() === '') return [];
      return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }),

  imageUrl: z.string().optional(),
  fileUrl: z.string().optional()
});

/**
 * Archive 생성 시 사용하는 타입
 */
export type ArchiveInput = z.infer<typeof archiveSchema>;

/**
 * Archive 수정 시 사용하는 스키마 (id 포함)
 */
export const archiveUpdateSchema = archiveSchema.extend({
  id: z.string().min(1, 'ID가 필요합니다')
});

export type ArchiveUpdateInput = z.infer<typeof archiveUpdateSchema>;
