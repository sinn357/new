'use client';

import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';

interface PageContent {
  page: string;
  title: string;
  subtitle?: string;
  content: string;
}

interface PageContentEditorProps {
  page: string;
  currentContent?: PageContent;
  onSave: (content: PageContent) => void;
  onCancel: () => void;
}

export default function PageContentEditor({ 
  page, 
  currentContent, 
  onSave, 
  onCancel 
}: PageContentEditorProps) {
  const { isAdmin } = useAdmin();
  const [title, setTitle] = useState(currentContent?.title || '');
  const [subtitle, setSubtitle] = useState(currentContent?.subtitle || '');
  const [content, setContent] = useState(currentContent?.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const pageContent = {
        page,
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        content: content.trim()
      };

      const response = await fetch('/api/page-content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pageContent)
      });

      if (!response.ok) {
        throw new Error('Failed to save page content');
      }

      const result = await response.json();
      onSave(result.pageContent);
    } catch (error) {
      console.error('Failed to save page content:', error);
      alert('페이지 콘텐츠 저장에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageLabels: Record<string, string> = {
    home: '홈',
    about: '소개',
    work: '작업',
    archive: '아카이브'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {pageLabels[page] || page} 페이지 편집
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목 *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="페이지 제목을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
              부제목 (선택사항)
            </label>
            <input
              type="text"
              id="subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="부제목을 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용 *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="페이지 내용을 입력하세요"
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              마크다운 문법을 사용할 수 있습니다.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}