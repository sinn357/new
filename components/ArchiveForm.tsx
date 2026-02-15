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
import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { buildBilingualContent, splitBilingualContent } from '@/lib/bilingual-content';

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
    resolver: zodResolver(archiveSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'essay',
      tags: '',
      imageUrl: '',
      fileUrl: '',
      rating: null,
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
    if (editingArchive) {
      const split = splitBilingualContent(editingArchive.content || '');
      const nextKo = split.isBilingual ? split.ko : editingArchive.content || '';
      const nextEn = split.isBilingual ? split.en : '';
      setKoContent(nextKo);
      setEnContent(nextEn);
      setActiveLanguage('ko');
      form.reset({
        title: editingArchive.title,
        content: buildBilingualContent(nextKo, nextEn),
        category: editingArchive.category as any,
        tags: editingArchive.tags?.join(', ') || '',
        imageUrl: editingArchive.imageUrl || '',
        fileUrl: editingArchive.fileUrl || '',
        rating: (editingArchive as any).rating || null,
        isPublished: (editingArchive as any).isPublished ?? true
      });
      syncFormContent(nextKo, nextEn, false);
    }
  }, [editingArchive, form, syncFormContent]);

  useEffect(() => {
    if (!editingArchive) {
      setKoContent('');
      setEnContent('');
      setActiveLanguage('ko');
      syncFormContent('', '', false);
    }
  }, [editingArchive, syncFormContent]);

  useEffect(() => {
    setDraftId(editingArchive?.id ?? null);
  }, [editingArchive?.id]);

  const onSubmit = async (data: ArchiveFormInput) => {
    try {
      const targetId = isEditing ? editingArchive.id : draftId;
      const url = targetId ? `/api/archive/${targetId}` : '/api/archive';
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
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} archive`);
      }

      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: ['archives'] });

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
      form.setError('root', {
        message: `Failed to ${isEditing ? 'update' : 'create'} archive.`
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

  const persistDraft = async (values: ArchiveFormInput) => {
    setDraftError(null);
    setIsDraftSaving(true);
    try {
      const combinedContent = buildBilingualContent(koContent, enContent);
      form.setValue('isPublished', false, { shouldDirty: true });
      const targetId = draftId;
      const response = await fetch(targetId ? `/api/archive/${targetId}` : '/api/archive', {
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
        const message = result?.error || 'Failed to save draft.';
        setDraftError(message);
        return;
      }
      const nextId = result?.archive?.id ?? targetId;
      if (nextId && nextId !== draftId) {
        setDraftId(nextId);
      }
      setDraftSavedAt(new Date().toISOString());
    } catch (error) {
      console.error('Draft save error:', error);
      setDraftError('Failed to save draft.');
    } finally {
      setIsDraftSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    const values = form.getValues();
    await persistDraft(values as ArchiveFormInput);
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
      setSummaryError('No content to summarize.');
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
        const message = result?.error || 'Failed to generate summary.';
        setSummaryError(message);
        return;
      }

      setSummaryData({
        summary: result.data.summary,
        bullets: Array.isArray(result.data.bullets) ? result.data.bullets : [],
      });
    } catch (error) {
      console.error('Summary generation error:', error);
      setSummaryError('Failed to generate summary.');
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
      setTranslationError('No content to translate.');
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
        const message = result?.error || 'Failed to generate translation.';
        setTranslationError(message);
        return;
      }

      setTranslationData({
        translation: result.data.translation,
        target: result.data.target || translateTarget,
      });
    } catch (error) {
      console.error('Translation generation error:', error);
      setTranslationError('Failed to generate translation.');
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {isEditing ? 'Edit Archive' : 'Add New Archive'}
      </h2>
      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Button type="button" variant="outline" size="sm" onClick={handleSaveDraft} disabled={isDraftSaving}>
          {isDraftSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        {draftSavedAt && (
          <span>Last saved: {formatDraftTime(draftSavedAt)}</span>
        )}
        <span className="text-xs text-gray-400 dark:text-gray-500">
          Drafts are saved as hidden.
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
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter title"
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
                <FormLabel>Category *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="dark:bg-gray-700 dark:text-white dark:border-gray-600">
                      <SelectValue placeholder="Select category" />
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
                <FormLabel>Rating (Optional)</FormLabel>
                <FormControl>
                  <div className="py-2">
                    <StarRating
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </div>
                </FormControl>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Leave a rating for reviews like movies, books, music, etc.
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
                  <span>Content *</span>
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
                        Korean
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
                        Copy Korean Media
                      </Button>
                    )}
                    <Select value={translateTarget} onValueChange={setTranslateTarget}>
                      <SelectTrigger className="h-8 w-[150px] dark:bg-gray-700 dark:text-white dark:border-gray-600">
                        <SelectValue placeholder="Target Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh" disabled>
                          Chinese (Coming Soon)
                        </SelectItem>
                        <SelectItem value="ja" disabled>
                          Japanese (Coming Soon)
                        </SelectItem>
                        <SelectItem value="es" disabled>
                          Spanish (Coming Soon)
                        </SelectItem>
                        <SelectItem value="ar" disabled>
                          Arabic (Coming Soon)
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
                      {isTranslating ? 'Translating...' : 'Translate All'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isSummarizing}
                    >
                      {isSummarizing ? 'Summarizing...' : 'AI TL;DR'}
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
                    placeholder="Write your content..."
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
                      <span className="font-semibold">TL;DR Preview</span>
                      <Button type="button" size="sm" onClick={handleApplySummary}>
                        Apply to Content
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
                        Translation Preview ({translationData.target === 'en' ? 'English' : translationData.target})
                      </span>
                      <Button type="button" size="sm" onClick={handleApplyTranslation}>
                        Apply to Content
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

          {/* Tags */}
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input
                    placeholder="tag1, tag2, tag3 (comma separated)"
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
            name="isPublished"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Published</FormLabel>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Uncheck to make visible only to admin.
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
                ? (isEditing ? 'Updating...' : 'Adding...')
                : (isEditing ? 'Update Archive' : 'Add Archive')}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
