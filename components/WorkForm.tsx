'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workSchema } from '@/lib/validations/work';
import { z } from 'zod';
import { Work, WORK_CATEGORIES } from '@/lib/work-store';
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
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface WorkFormProps {
  editingWork?: Work | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type WorkFormInput = z.input<typeof workSchema>;

export default function WorkForm({ editingWork, onSuccess, onCancel }: WorkFormProps) {
  const isEditing = !!editingWork;
  const queryClient = useQueryClient();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryData, setSummaryData] = useState<{ summary: string; bullets: string[] } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationData, setTranslationData] = useState<{ translation: string; target: string } | null>(null);
  const [translateTarget, setTranslateTarget] = useState('en');
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Using any type to bypass Zod transform type inference issue with React Hook Form
  // Runtime behavior is correct but TypeScript can't infer types properly
  const form = useForm<any>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'product',
      techStack: '',
      demoUrl: '',
      youtubeUrl: '',
      instagramUrl: '',
      imageUrl: '',
      fileUrl: '',
      status: 'completed',
      duration: '',
      isFeatured: false
    }
  });

  // 편집 모드일 때 폼 값 설정
  useEffect(() => {
    if (editingWork) {
      form.reset({
        title: editingWork.title,
        content: editingWork.content,
        category: editingWork.category,
        techStack: editingWork.techStack?.join(', ') || '',
        demoUrl: editingWork.demoUrl || '',
        youtubeUrl: editingWork.youtubeUrl || '',
        instagramUrl: editingWork.instagramUrl || '',
        imageUrl: editingWork.imageUrl || '',
        fileUrl: editingWork.fileUrl || '',
        status: editingWork.status,
        duration: editingWork.duration || '',
        isFeatured: (editingWork as any).isFeatured || false
      });
    }
  }, [editingWork, form]);

  const draftKey = isEditing ? `work:draft:${editingWork?.id ?? 'edit'}` : 'work:draft:new';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(draftKey);
    if (!raw) {
      setHasDraft(false);
      setDraftSavedAt(null);
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setHasDraft(true);
      setDraftSavedAt(typeof parsed?.savedAt === 'number' ? parsed.savedAt : null);
    } catch {
      setHasDraft(false);
      setDraftSavedAt(null);
    }
  }, [draftKey]);

  const onSubmit = async (data: WorkFormInput) => {
    try {
      const url = isEditing ? `/api/work/${editingWork.id}` : '/api/work';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} work`);
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['works'] });

      if (typeof window !== 'undefined') {
        localStorage.removeItem(draftKey);
      }
      setHasDraft(false);
      setDraftSavedAt(null);

      form.reset(); // 자동 리셋!
      onSuccess();
    } catch (error) {
      console.error('Form submission error:', error);
      // 에러를 form.setError로 표시 가능
      form.setError('root', {
        message: `작업물 ${isEditing ? '수정' : '생성'}에 실패했습니다.`
      });
    }
  };

  const handleCancel = () => {
    form.reset();
    onCancel();
  };

  const persistDraft = (values: WorkFormInput) => {
    if (typeof window === 'undefined') return;
    const payload = {
      values,
      savedAt: Date.now(),
    };
    localStorage.setItem(draftKey, JSON.stringify(payload));
    setHasDraft(true);
    setDraftSavedAt(payload.savedAt);
  };

  useEffect(() => {
    const subscription = form.watch((values) => {
      const title = typeof values.title === 'string' ? values.title.trim() : '';
      const content = typeof values.content === 'string' ? values.content.trim() : '';
      const hasContent = title.length > 0 || content.length > 0;
      if (!hasContent) return;

      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
      draftTimerRef.current = setTimeout(() => {
        persistDraft(values as WorkFormInput);
      }, 800);
    });

    return () => {
      subscription.unsubscribe();
      if (draftTimerRef.current) {
        clearTimeout(draftTimerRef.current);
      }
    };
  }, [form, draftKey]);

  const handleSaveDraft = () => {
    const values = form.getValues();
    persistDraft(values as WorkFormInput);
  };

  const handleLoadDraft = () => {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.values) {
        form.reset(parsed.values);
        setDraftSavedAt(typeof parsed.savedAt === 'number' ? parsed.savedAt : null);
        setHasDraft(true);
      }
    } catch {
      // ignore invalid draft payload
    }
  };

  const handleClearDraft = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(draftKey);
    setHasDraft(false);
    setDraftSavedAt(null);
  };

  const formatDraftTime = (timestamp: number | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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
    const summaryRegex = new RegExp('<div data-ai-summary=\"true\">[\\s\\S]*?<\\/div>');
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

  const handleGenerateTranslation = async () => {
    setTranslationError(null);
    setTranslationData(null);

    const content = form.getValues('content') || '';
    const text = typeof content === 'string' ? content.trim() : '';

    if (!text) {
      setTranslationError('번역할 내용이 없습니다.');
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target: translateTarget }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        const message = result?.error || '번역 생성에 실패했습니다.';
        setTranslationError(message);
        return;
      }

      setTranslationData({
        translation: result.data.translation,
        target: result.data.target || translateTarget,
      });
    } catch (error) {
      console.error('Translation generation error:', error);
      setTranslationError('번역 생성에 실패했습니다.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleApplyTranslation = () => {
    if (!translationData) return;
    form.setValue('content', translationData.translation, { shouldDirty: true });
  };

  const selectedCategory = form.watch('category');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {isEditing ? '작업물 수정' : '새 작업물 추가'}
      </h2>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Button type="button" variant="outline" size="sm" onClick={handleSaveDraft}>
          임시 저장
        </Button>
        {hasDraft && (
          <>
            <Button type="button" variant="outline" size="sm" onClick={handleLoadDraft}>
              임시 저장 불러오기
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handleClearDraft}>
              임시 저장 삭제
            </Button>
          </>
        )}
        {draftSavedAt && (
          <span>마지막 임시 저장: {formatDraftTime(draftSavedAt)}</span>
        )}
      </div>

      {form.formState.errors.root && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
          {form.formState.errors.root.message}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title & Duration */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>제목 *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="프로젝트 제목을 입력하세요"
                      {...field}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>작업 기간</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 2주, 1개월"
                      {...field}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                  <SelectContent>
                    {Object.entries(WORK_CATEGORIES).map(([key, info]) => (
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

          {/* Content (Rich Text) */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between gap-3">
                  <span>설명 *</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={translateTarget} onValueChange={setTranslateTarget}>
                      <SelectTrigger className="h-8 w-[150px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectValue placeholder="번역 언어" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">영어</SelectItem>
                        <SelectItem value="zh" disabled>
                          중국어 (준비중)
                        </SelectItem>
                        <SelectItem value="ja" disabled>
                          일본어 (준비중)
                        </SelectItem>
                        <SelectItem value="es" disabled>
                          스페인어 (준비중)
                        </SelectItem>
                        <SelectItem value="ar" disabled>
                          아랍어 (준비중)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateTranslation}
                      disabled={isTranslating || translateTarget !== 'en'}
                    >
                      {isTranslating ? '번역 중...' : '전체 번역'}
                    </Button>
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
                    placeholder="프로젝트에 대한 상세 설명을 작성하세요..."
                  />
                </FormControl>
                {summaryError && (
                  <p className="text-sm text-red-600 dark:text-red-300 mt-2">{summaryError}</p>
                )}
                {translationError && (
                  <p className="text-sm text-red-600 dark:text-red-300 mt-2">{translationError}</p>
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
                {translationData && (
                  <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">번역 미리보기 (영어)</span>
                      <Button type="button" size="sm" onClick={handleApplyTranslation}>
                        본문에 적용
                      </Button>
                    </div>
                    <div
                      className="prose prose-sm mt-2 max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: translationData.translation }}
                    />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tech Stack */}
          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem>
                <FormLabel>기술 스택</FormLabel>
                <FormControl>
                  <Input
                    placeholder="React, Node.js, TypeScript (쉼표로 구분)"
                    {...field}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Conditional URL Fields based on Category */}
          <div className="space-y-6">
            {selectedCategory === 'product' && (
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="demoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>데모 URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://your-demo.com"
                          {...field}
                          className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedCategory === 'media' && (
              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>YouTube URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        {...field}
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedCategory === 'photography' && (
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://www.instagram.com/p/..."
                        {...field}
                        className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상태</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="completed">완료됨</SelectItem>
                    <SelectItem value="in-progress">진행중</SelectItem>
                    <SelectItem value="planned">계획됨</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration & Featured */}
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>작업 기간</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="예: 2주, 1개월"
                      {...field}
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">⭐ Featured 프로젝트</FormLabel>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      홈 페이지에 강조 표시
                    </p>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {form.formState.isSubmitting
                ? (isEditing ? '수정 중...' : '추가 중...')
                : (isEditing ? '작업물 수정' : '작업물 추가')}
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
