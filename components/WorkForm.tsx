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
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildBilingualContent, splitBilingualContent } from '@/lib/bilingual-content';

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
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [activeLanguage, setActiveLanguage] = useState<'ko' | 'en'>('ko');
  const [koContent, setKoContent] = useState('');
  const [enContent, setEnContent] = useState('');

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
      isFeatured: false,
      isPublished: true
    }
  });

  const syncFormContent = useCallback(
    (nextKo: string, nextEn: string, markDirty = true) => {
      const combined = buildBilingualContent(nextKo, nextEn);
      form.setValue('content', combined, { shouldDirty: markDirty });
    },
    [form]
  );

  // 편집 모드일 때 폼 값 설정
  useEffect(() => {
    if (editingWork) {
      const split = splitBilingualContent(editingWork.content || '');
      const nextKo = split.isBilingual ? split.ko : editingWork.content || '';
      const nextEn = split.isBilingual ? split.en : '';
      setKoContent(nextKo);
      setEnContent(nextEn);
      setActiveLanguage('ko');
      form.reset({
        title: editingWork.title,
        content: buildBilingualContent(nextKo, nextEn),
        category: editingWork.category,
        techStack: editingWork.techStack?.join(', ') || '',
        demoUrl: editingWork.demoUrl || '',
        youtubeUrl: editingWork.youtubeUrl || '',
        instagramUrl: editingWork.instagramUrl || '',
        imageUrl: editingWork.imageUrl || '',
        fileUrl: editingWork.fileUrl || '',
        status: editingWork.status,
        duration: editingWork.duration || '',
        isFeatured: (editingWork as any).isFeatured || false,
        isPublished: (editingWork as any).isPublished ?? true
      });
      syncFormContent(nextKo, nextEn, false);
    }
  }, [editingWork, form, syncFormContent]);

  useEffect(() => {
    if (!editingWork) {
      setKoContent('');
      setEnContent('');
      setActiveLanguage('ko');
      syncFormContent('', '', false);
    }
  }, [editingWork, syncFormContent]);

  useEffect(() => {
    setDraftId(editingWork?.id ?? null);
  }, [editingWork?.id]);

  const onSubmit = async (data: WorkFormInput) => {
    try {
      const targetId = isEditing ? editingWork.id : draftId;
      const url = targetId ? `/api/work/${targetId}` : '/api/work';
      const method = targetId ? 'PUT' : 'POST';
      const combinedContent = buildBilingualContent(koContent, enContent);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          content: combinedContent,
          isPublished: typeof (data as any).isPublished === 'boolean' ? (data as any).isPublished : true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} work`);
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['works'] });

      form.reset(); // 자동 리셋!
      setKoContent('');
      setEnContent('');
      setActiveLanguage('ko');
      syncFormContent('', '', false);
      setDraftId(null);
      setDraftSavedAt(null);
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
    setKoContent('');
    setEnContent('');
    setActiveLanguage('ko');
    syncFormContent('', '', false);
    onCancel();
  };

  const persistDraft = async (values: WorkFormInput) => {
    setDraftError(null);
    setIsDraftSaving(true);
    try {
      const combinedContent = buildBilingualContent(koContent, enContent);
      form.setValue('isPublished', false, { shouldDirty: true });
      const targetId = draftId;
      const response = await fetch(targetId ? `/api/work/${targetId}` : '/api/work', {
        method: targetId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          content: combinedContent,
          isPublished: false
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        const message = result?.error || '임시 저장에 실패했습니다.';
        setDraftError(message);
        return;
      }
      const nextId = result?.work?.id ?? targetId;
      if (nextId && nextId !== draftId) {
        setDraftId(nextId);
      }
      setDraftSavedAt(new Date().toISOString());
    } catch (error) {
      console.error('Draft save error:', error);
      setDraftError('임시 저장에 실패했습니다.');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const values = form.getValues();
    await persistDraft(values as WorkFormInput);
  };

  const formatDraftTime = (timestamp: string | null) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString('ko-KR', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getActiveContent = () => (activeLanguage === 'ko' ? koContent : enContent);

  const setKoContentWithSync = (next: string) => {
    setKoContent(next);
    syncFormContent(next, enContent);
  };

  const setEnContentWithSync = (next: string) => {
    setEnContent(next);
    syncFormContent(koContent, next);
  };

  const setActiveContentWithSync = (next: string) => {
    if (activeLanguage === 'ko') {
      setKoContentWithSync(next);
    } else {
      setEnContentWithSync(next);
    }
  };

  const getMediaTags = (html: string) => {
    const tags: string[] = [];
    const imgTags = html.match(/<img[^>]*>/g) ?? [];
    const videoTags = html.match(/<video[\s\S]*?<\/video>/g) ?? [];
    const audioTags = html.match(/<audio[\s\S]*?<\/audio>/g) ?? [];
    tags.push(...imgTags, ...videoTags, ...audioTags);
    return tags;
  };

  const handleCopyKoMediaToEn = () => {
    const mediaTags = getMediaTags(koContent);
    const missingTags = mediaTags.filter((tag) => !enContent.includes(tag));
    if (missingTags.length === 0) return;
    const nextContent = `${missingTags.join('')}${enContent ? `\n${enContent}` : ''}`;
    setEnContentWithSync(nextContent);
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

    const content = getActiveContent() || '';
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
    const content = getActiveContent() || '';
    const summaryHtml = buildSummaryHtml(summaryData.summary, summaryData.bullets);
    const nextContent = upsertSummary(content, summaryHtml);
    setActiveContentWithSync(nextContent);
  };

  const handleGenerateTranslation = async () => {
    setTranslationError(null);
    setTranslationData(null);

    const content = getActiveContent() || '';
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
    if (translationData.target === 'en') {
      setEnContentWithSync(translationData.translation);
      setActiveLanguage('en');
      return;
    }
    if (translationData.target === 'ko') {
      setKoContentWithSync(translationData.translation);
      setActiveLanguage('ko');
    }
  };

  const selectedCategory = form.watch('category');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {isEditing ? '작업물 수정' : '새 작업물 추가'}
      </h2>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Button type="button" variant="outline" size="sm" onClick={handleSaveDraft} disabled={isDraftSaving}>
          {isDraftSaving ? '저장 중...' : '임시 저장'}
        </Button>
        {draftSavedAt && (
          <span>마지막 임시 저장: {formatDraftTime(draftSavedAt)}</span>
        )}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          임시 저장은 숨김 상태로 저장됩니다.
        </span>
      </div>
      {draftError && (
        <p className="text-sm text-red-600 dark:text-red-300 mb-4">{draftError}</p>
      )}

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
                    <div className="inline-flex rounded-full border border-gray-200 bg-white px-1 py-1 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900">
                      <button
                        type="button"
                        onClick={() => setActiveLanguage('ko')}
                        className={`px-3 py-1 rounded-full transition-colors ${
                          activeLanguage === 'ko'
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                        }`}
                      >
                        한국어
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveLanguage('en')}
                        className={`px-3 py-1 rounded-full transition-colors ${
                          activeLanguage === 'en'
                            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                            : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                        }`}
                      >
                        English
                      </button>
                    </div>
                    {activeLanguage === 'en' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyKoMediaToEn}
                        disabled={getMediaTags(koContent).length === 0}
                      >
                        한국어 미디어 복사
                      </Button>
                    )}
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
                      disabled={isTranslating || translateTarget !== 'en' || activeLanguage !== 'ko'}
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
                <input type="hidden" {...field} />
                <FormControl>
                  <RichTextEditor
                    value={activeLanguage === 'ko' ? koContent : enContent}
                    onChange={(value) => {
                      if (activeLanguage === 'ko') {
                        setKoContentWithSync(value);
                      } else {
                        setEnContentWithSync(value);
                      }
                    }}
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
                      <span className="font-semibold">
                        번역 미리보기 ({translationData.target === 'en' ? '영어' : translationData.target})
                      </span>
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

          <FormField
            control={form.control}
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">공개 상태</FormLabel>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    체크 해제 시 관리자만 볼 수 있습니다.
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
