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
    .max(10000, '내용은 10,000자 이하여야 합니다')
    .refine((val) => {
      // HTML에서 태그 제거하고 텍스트만 추출
      const textContent = val.replace(/<[^>]*>/g, '').trim();
      // 텍스트가 없어도 이미지나 갤러리가 있으면 OK
      const hasMedia = val.includes('<img') || val.includes('<video') || val.includes('data-type="image-gallery"');
      return textContent.length > 0 || hasMedia;
    }, '텍스트, 이미지 또는 동영상을 추가하세요'),

  category: z.enum(['product', 'media', 'photography'], {
    message: '올바른 카테고리를 선택하세요'
  }),

  techStack: z.union([
      z.string(),
      z.array(z.string())
    ])
    .optional()
    .default('')
    .transform((val) => {
      // 이미 배열이면 그대로 반환 (클라이언트에서 transform된 경우)
      if (Array.isArray(val)) return val;
      // 콤마로 구분된 문자열을 배열로 변환
      if (!val || val.trim() === '') return [];
      return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }),

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
    .optional(),

  isFeatured: z.boolean()
    .optional()
    .default(false),

  isPublished: z.boolean()
    .optional()
    .default(true)
});

/**
 * Draft용 Work 스키마 - 임시 저장 시 사용
 * 제목/내용은 빈 문자열 허용
 */
export const workDraftSchema = z.object({
  title: z.string()
    .max(200, '제목은 200자 이하여야 합니다')
    .optional()
    .default(''),

  content: z.string()
    .max(10000, '내용은 10,000자 이하여야 합니다')
    .optional()
    .default(''),

  category: z.enum(['product', 'media', 'photography'], {
    message: '올바른 카테고리를 선택하세요'
  }).optional().default('product'),

  techStack: z.union([
      z.string(),
      z.array(z.string())
    ])
    .optional()
    .default('')
    .transform((val) => {
      if (Array.isArray(val)) return val;
      if (!val || val.trim() === '') return [];
      return val.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }),

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
    .optional(),

  isFeatured: z.boolean()
    .optional()
    .default(false),

  isPublished: z.boolean()
    .optional()
    .default(true)
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
