'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Archive, ARCHIVE_CATEGORIES, ArchiveCategory } from '@/lib/archive-store';
import { useAdmin } from '@/contexts/AdminContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import InlineEdit from '@/components/InlineEdit';
import AnimatedCard from '@/components/AnimatedCard';
import ArchiveForm from '@/components/ArchiveForm';
import { useArchives, useDeleteArchive } from '@/lib/hooks/useArchives';

interface PageContent {
  page: string;
  title: string;
  content: string;
}

export default function ArchivePage() {
  const { isAdmin } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'archive';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'archive',
    id: '',
    title: '',
    message: ''
  });
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  // TanStack Query hooks
  const { data: archives = [], isLoading, error } = useArchives(selectedCategory || undefined);
  const { data: allArchives = [] } = useArchives();
  const deleteArchive = useDeleteArchive();

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/page-content?page=archive');
      const data = await response.json();
      setPageContent(data.content);
    } catch (error) {
      console.error('Failed to fetch page content:', error);
    }
  };

  const saveTitle = async (newTitle: string) => {
    const response = await fetch('/api/page-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'archive',
        title: newTitle,
        content: pageContent?.content || ''
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save title');
    }

    const result = await response.json();
    setPageContent(result.pageContent);
  };

  const saveContent = async (newContent: string) => {
    const response = await fetch('/api/page-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'archive',
        title: pageContent?.title || 'Archive',
        content: newContent
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save content');
    }

    const result = await response.json();
    setPageContent(result.pageContent);
  };

  useEffect(() => {
    fetchPageContent();
  }, []);

  const handleFormSuccess = () => {
    // TanStack Query가 자동으로 캐시를 무효화하고 재조회
    setShowForm(false);
    setEditingArchive(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingArchive(null);
  };

  const handleDeleteArchive = (archive: Archive) => {
    setDeleteModal({
      isOpen: true,
      type: 'archive',
      id: archive.id,
      title: '글 삭제',
      message: `"${archive.title}" 글을 삭제하시겠습니까?`
    });
  };

  const handleConfirmDelete = async () => {
    deleteArchive.mutate(deleteModal.id, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, type: 'archive', id: '', title: '', message: '' });
      },
    });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, type: 'archive', id: '', title: '', message: '' });
  };

  const handleEditArchive = (archive: Archive) => {
    setEditingArchive(archive);
    setShowForm(true);
  };

  const filteredCategories = Object.entries(ARCHIVE_CATEGORIES);

  if (isLoading) return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-8 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>

          {isAdmin ? (
            <InlineEdit
              text={pageContent?.title || 'Archive'}
              onSave={saveTitle}
              className="mb-6"
              textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
              placeholder="제목을 입력하세요"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              {pageContent?.title || 'Archive'}
            </h1>
          )}

          {isAdmin ? (
            <InlineEdit
              text={pageContent?.content || ''}
              onSave={saveContent}
              className="mb-12 max-w-2xl mx-auto"
              textClassName="text-xl text-gray-600 dark:text-gray-300"
              isTextarea={true}
              placeholder="내용을 입력하세요"
            />
          ) : (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              {pageContent?.content || ''}
            </p>
          )}

          {isAdmin && (
            <button
              onClick={() => {
                if (showForm && editingArchive) {
                  handleFormCancel();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {showForm ? (editingArchive ? '편집 취소' : '폼 숨기기') : '새 글 작성'}
            </button>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">카테고리</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === ''
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                전체 ({allArchives.length})
              </button>
              {filteredCategories.map(([key, info]) => {
                const categoryArchives = allArchives.filter(archive => archive.category === key);
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      selectedCategory === key
                        ? 'bg-indigo-500 text-white'
                        : `${info.color} hover:opacity-80`
                    }`}
                  >
                    <span>{info.icon}</span>
                    {info.label}
                    <span className="text-xs opacity-75">
                      ({categoryArchives.length})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Add Archive Form */}
      {isAdmin && showForm && (
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <ArchiveForm
              editingArchive={editingArchive}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </section>
      )}

      {/* Archives List */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {archives.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  📝
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {selectedCategory ? '해당 카테고리에 글이 없습니다' : '아직 작성된 글이 없습니다'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isAdmin ? '첫 번째 글을 작성해서 아카이브를 시작해보세요!' : '관리자가 글을 작성하면 여기에 표시됩니다.'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    첫 글 작성하기
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {archives.map((archive, index) => {
                const categoryInfo = ARCHIVE_CATEGORIES[archive.category as ArchiveCategory];
                return (
                  <AnimatedCard key={archive.id} delay={index * 0.1}>
                    <article
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 dark:border-gray-700 group"
                    >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                          {categoryInfo?.icon} {categoryInfo?.label || archive.category}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(archive.createdAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditArchive(archive)}
                            className="text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                            title="글 수정"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteArchive(archive)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                            title="글 삭제"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>

                    <Link href={`/archive/${archive.id}`}>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors cursor-pointer">
                        {archive.title}
                      </h2>
                    </Link>

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 line-clamp-3">
                      {archive.content}
                    </p>

                    {archive.tags && archive.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {archive.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* File attachments */}
                    {(archive.imageUrl || archive.fileUrl) && (
                      <div className="flex flex-wrap gap-3 mb-4">
                        {archive.imageUrl && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-indigo-50 px-2 py-1 rounded-md">
                            <span>🖼️</span>
                            <span>이미지</span>
                          </div>
                        )}
                        {archive.fileUrl && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-md">
                            <span>📎</span>
                            <span>첨부파일</span>
                          </div>
                        )}
                      </div>
                    )}

                    <Link
                      href={`/archive/${archive.id}`}
                      className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
                    >
                      더 읽기 →
                    </Link>
                  </article>
                  </AnimatedCard>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={deleteArchive.isPending}
      />

    </div>
  );
}
