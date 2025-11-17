import { z } from 'zod';

/**
 * Work 스키마 - 작업물 생성/수정 시 사용
 *
 * 특징:
 * - URL 필드 자동 검증 (optional)
 * - techStack은 문자열 배열로 저장 (콤마 구분 입력)
 * - 제목/내용 길이 제한
 */
export const workSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력하세요')
    .max(200, '제목은 200자 이하여야 합니다'),

  content: z.string()
    .min(1, '내용을 입력하세요')
    .max(10000, '내용은 10,000자 이하여야 합니다'),

  category: z.enum(['product', 'media', 'photography'], {
    message: '올바른 카테고리를 선택하세요'
  }),

  techStack: z.string()
    .optional()
    .default('')
    .transform((val) => {
      // 콤마로 구분된 문자열을 배열로 변환
      if (!val || val.trim() === '') return [];
      return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }),

  githubUrl: z.string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      { message: '올바른 GitHub URL을 입력하세요' }
    ),

  demoUrl: z.string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      { message: '올바른 데모 URL을 입력하세요' }
    ),

  youtubeUrl: z.string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      { message: '올바른 YouTube URL을 입력하세요' }
    ),

  instagramUrl: z.string()
    .optional()
    .refine(
      (val) => !val || val === '' || z.string().url().safeParse(val).success,
      { message: '올바른 Instagram URL을 입력하세요' }
    ),

  imageUrl: z.string().optional(),
  fileUrl: z.string().optional(),

  status: z.enum(['completed', 'in-progress', 'planned'], {
    message: '올바른 상태를 선택하세요'
  }).default('completed'),

  duration: z.string()
    .max(100, '기간은 100자 이하여야 합니다')
    .optional()
});

/**
 * Work 생성 시 사용하는 타입
 * Zod 스키마에서 자동 추론
 */
export type WorkInput = z.infer<typeof workSchema>;

/**
 * Work 수정 시 사용하는 스키마 (id 포함)
 */
export const workUpdateSchema = workSchema.extend({
  id: z.string().min(1, 'ID가 필요합니다')
});

export type WorkUpdateInput = z.infer<typeof workUpdateSchema>;
