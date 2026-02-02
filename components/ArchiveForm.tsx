'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { archiveSchema } from '@/lib/validations/archive';
import { z } from 'zod';
import { Archive, ARCHIVE_CATEGORIES } from '@/lib/archive-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import RichTextEditor from '@/components/RichTextEditor';
import StarRating from '@/components/StarRating';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface ArchiveFormProps {
  editingArchive?: Archive | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type ArchiveFormInput = z.input<typeof archiveSchema>;

export default function ArchiveForm({ editingArchive, onSuccess, onCancel }: ArchiveFormProps) {
  const isEditing = !!editingArchive;
  const queryClient = useQueryClient();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{ summary: string; bullets: string[] } | null>(null);

  // Using any type to bypass Zod transform type inference issue with React Hook Form
  // Runtime behavior is correct but TypeScript can't infer types properly
  const form = useForm<any>({
    resolver: zodResolver(archiveSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'essay',
      tags: '',
      imageUrl: '',
      fileUrl: '',
      rating: null
    }
  });

  // 편집 모드일 때 폼 값 설정
  useEffect(() => {
    if (editingArchive) {
      form.reset({
        title: editingArchive.title,
        content: editingArchive.content,
        category: editingArchive.category as any,
        tags: editingArchive.tags?.join(', ') || '',
        imageUrl: editingArchive.imageUrl || '',
        fileUrl: editingArchive.fileUrl || '',
        rating: (editingArchive as any).rating || null
      });
    }
  }, [editingArchive, form]);

  const onSubmit = async (data: ArchiveFormInput) => {
    try {
      const url = isEditing ? `/api/archive/${editingArchive.id}` : '/api/archive';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} archive`);
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['archives'] });

      form.reset(); // 자동 리셋!
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      form.setError('root', {
        message: `아카이브 ${isEditing ? '수정' : '생성'}에 실패했습니다.`
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  const stripHtml = (html: string) =>
    html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const buildSummaryHtml = (summary: string, bullets: string[]) => {
    const safeSummary = summary.trim();
    const safeBullets = bullets.filter((item) => item.trim().length > 0);
    const bulletsHtml = safeBullets.length
      ? `<ul>${safeBullets.map((item) => `<li>${item}</li>`).join('')}</ul>`
      : '';

    return `<div data-ai-summary=\"true\"><p><strong>TL;DR</strong></p>${bulletsHtml}<p>${safeSummary}</p></div>`;
  };

  const upsertSummary = (content: string, summaryHtml: string) => {
    const summaryRegex = /<div data-ai-summary="true">[\\s\\S]*?<\\/div>/;
    if (summaryRegex.test(content)) {
      return content.replace(summaryRegex, summaryHtml);
    }
    return `${summaryHtml}${content ? `\\n${content}` : ''}`;
  };

  const handleGenerateSummary = async () => {
    setSummaryError(null);
    setSummaryData(null);

    const content = form.getValues('content') || '';
    const text = stripHtml(content);

    if (!text) {
      setSummaryError('요약할 내용이 없습니다.');
      return;
    }

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        const message = result?.error || '요약 생성에 실패했습니다.';
        setSummaryError(message);
        return;
      }

      setSummaryData({
        summary: result.data.summary,
        bullets: Array.isArray(result.data.bullets) ? result.data.bullets : [],
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      setSummaryError('요약 생성에 실패했습니다.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleApplySummary = () => {
    if (!summaryData) return;
    const content = form.getValues('content') || '';
    const summaryHtml = buildSummaryHtml(summaryData.summary, summaryData.bullets);
    const nextContent = upsertSummary(content, summaryHtml);
    form.setValue('content', nextContent, { shouldDirty: true });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {isEditing ? '아카이브 수정' : '새 아카이브 추가'}
      </h2>

      {form.formState.errors.root && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          {form.formState.errors.root.message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목 *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="제목을 입력하세요"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>카테고리 *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="카테고리를 선택하세요" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-80 overflow-y-auto">
                    {Object.entries(ARCHIVE_CATEGORIES).map(([key, info]) => (
                      <SelectItem key={key} value={key}>
                        {info.icon} {info.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Rating */}
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>평점 (선택사항)</FormLabel>
                <FormControl>
                  <div className="py-2">
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  영화, 책, 음악 등 리뷰 글에 평점을 남겨보세요
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content (Markdown) */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between gap-3">
                  <span>내용 *</span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isSummarizing}
                    >
                      {isSummarizing ? '요약 중...' : 'AI TL;DR'}
                    </Button>
                  </div>
                </FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="내용을 작성하세요..."
                  />
                </FormControl>
                {summaryError && (
                  <p className="text-sm text-red-600 dark:text-red-300 mt-2">{summaryError}</p>
                )}
                {summaryData && (
                  <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">TL;DR 미리보기</span>
                      <Button type="button" size="sm" onClick={handleApplySummary}>
                        본문에 적용
                      </Button>
                    </div>
                    <p className="mt-2">{summaryData.summary}</p>
                    {summaryData.bullets.length > 0 && (
                      <ul className="mt-2 list-disc pl-5">
                        {summaryData.bullets.map((item, index) => (
                          <li key={`${item}-${index}`}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>태그</FormLabel>
                <FormControl>
                  <Input
                    placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {form.formState.isSubmitting
                ? (isEditing ? '수정 중...' : '추가 중...')
                : (isEditing ? '아카이브 수정' : '아카이브 추가')}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={form.formState.isSubmitting}
            >
              취소
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
