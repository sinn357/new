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
import FileUpload from '@/components/FileUpload';
import MarkdownEditor from '@/components/MarkdownEditor';
import { useEffect } from 'react';

interface WorkFormProps {
  editingWork?: Work | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type WorkFormInput = z.input<typeof workSchema>;

export default function WorkForm({ editingWork, onSuccess, onCancel }: WorkFormProps) {
  const isEditing = !!editingWork;

  // Using any type to bypass Zod transform type inference issue with React Hook Form
  // Runtime behavior is correct but TypeScript can't infer types properly
  const form = useForm<any>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'product',
      techStack: '',
      githubUrl: '',
      demoUrl: '',
      youtubeUrl: '',
      instagramUrl: '',
      imageUrl: '',
      fileUrl: '',
      status: 'completed',
      duration: ''
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
        githubUrl: editingWork.githubUrl || '',
        demoUrl: editingWork.demoUrl || '',
        youtubeUrl: editingWork.youtubeUrl || '',
        instagramUrl: editingWork.instagramUrl || '',
        imageUrl: editingWork.imageUrl || '',
        fileUrl: editingWork.fileUrl || '',
        status: editingWork.status,
        duration: editingWork.duration || ''
      });
    }
  }, [editingWork, form]);

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

  const selectedCategory = form.watch('category');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
        {isEditing ? '작업물 수정' : '새 작업물 추가'}
      </h2>

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

          {/* Content (Markdown) */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>설명 * (마크다운 지원)</FormLabel>
                <FormControl>
                  <MarkdownEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="프로젝트에 대한 상세 설명을 마크다운으로 작성하세요..."
                    rows={8}
                  />
                </FormControl>
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
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://github.com/username/repo"
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

          {/* Image, File, Status */}
          <div className="grid md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대표 이미지</FormLabel>
                  <FormControl>
                    <FileUpload
                      onFileUpload={field.onChange}
                      accept="image/*"
                      label="이미지 선택"
                      currentUrl={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fileUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>첨부 파일</FormLabel>
                  <FormControl>
                    <FileUpload
                      onFileUpload={field.onChange}
                      accept="*/*"
                      label="파일 선택"
                      currentUrl={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
