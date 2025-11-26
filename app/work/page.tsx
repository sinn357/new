'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Work, WORK_CATEGORIES } from '@/lib/work-store';
import { useAdmin } from '@/contexts/AdminContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import InlineEdit from '@/components/InlineEdit';
import AnimatedCard from '@/components/AnimatedCard';
import WorkForm from '@/components/WorkForm';
import { useWorks, useDeleteWork } from '@/lib/hooks/useWorks';

// Helper function to extract first image from HTML
function extractFirstImage(html: string): string | null {
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = html.match(imgRegex);
  return match ? match[1] : null;
}

// Helper function to strip HTML tags for preview
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const statusLabels = {
  'completed': '완료됨',
  'in-progress': '진행중',
  'planned': '계획됨'
};

const statusColors = {
  'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'in-progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'planned': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
};

interface PageContent {
  page: string;
  title: string;
  content: string;
}

function WorkPageContent() {
  const { isAdmin } = useAdmin();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'work';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'work',
    id: '',
    title: '',
    message: ''
  });
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  // TanStack Query hooks
  const { data: works = [], isLoading, error } = useWorks(selectedCategory || undefined);
  const { data: allWorks = [] } = useWorks();
  const deleteWork = useDeleteWork();

  // Load work for editing when edit ID is in URL
  useEffect(() => {
    if (editId && allWorks.length > 0) {
      const workToEdit = allWorks.find(w => w.id === editId);
      if (workToEdit) {
        setEditingWork(workToEdit);
        setShowForm(true);
      }
    }
  }, [editId, allWorks]);

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/page-content?page=work');
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
        page: 'work',
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
        page: 'work',
        title: pageContent?.title || 'My Work',
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
    setEditingWork(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingWork(null);
  };

  const handleDeleteWork = (work: Work) => {
    setDeleteModal({
      isOpen: true,
      type: 'work',
      id: work.id,
      title: '작업물 삭제',
      message: `"${work.title}" 작업물을 삭제하시겠습니까?`
    });
  };

  const handleConfirmDelete = async () => {
    deleteWork.mutate(deleteModal.id, {
      onSuccess: () => {
        setDeleteModal({ isOpen: false, type: 'work', id: '', title: '', message: '' });
      },
    });
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, type: 'work', id: '', title: '', message: '' });
  };

  const handleEditWork = (work: Work) => {
    setEditingWork(work);
    setShowForm(true);
  };

  // Featured 프로젝트를 우선 정렬
  const sortedWorks = [...works].sort((a, b) => {
    const aFeatured = (a as any).isFeatured || false;
    const bFeatured = (b as any).isFeatured || false;
    if (aFeatured && !bFeatured) return -1;
    if (!aFeatured && bFeatured) return 1;
    return 0;
  });

  if (isLoading) return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Loading...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen dark:bg-gray-900 dark:text-white">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

        <div className="max-w-4xl mx-auto text-center">
          {isAdmin ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InlineEdit
                text={pageContent?.title || 'My Work'}
                onSave={saveTitle}
                className="mb-6"
                textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 bg-clip-text text-transparent pb-2"
                placeholder="제목을 입력하세요"
              />
            </motion.div>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 bg-clip-text text-transparent pb-2 mb-6"
            >
              {pageContent?.title || 'My Work'}
            </motion.h1>
          )}

          {isAdmin ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <InlineEdit
                text={pageContent?.content || ''}
                onSave={saveContent}
                className="mb-12 max-w-2xl mx-auto"
                textClassName="text-xl text-gray-600 dark:text-gray-300"
                isTextarea={true}
                placeholder="내용을 입력하세요"
              />
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              {pageContent?.content || ''}
            </motion.p>
          )}

          {isAdmin && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              onClick={() => {
                if (showForm && editingWork) {
                  handleFormCancel();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 dark:from-indigo-600 dark:to-teal-600 dark:hover:from-indigo-700 dark:hover:to-teal-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {showForm ? (editingWork ? '편집 취소' : '폼 숨기기') : '새 작업물 추가'}
            </motion.button>
          )}
        </div>
      </section>

      {/* Floating Glass Filter Bar */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="sticky top-20 z-40 px-6 pb-8"
      >
        <div className="max-w-6xl mx-auto relative">
          {/* Scroll Indicator Left */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-indigo-50 via-indigo-50/50 to-transparent dark:from-gray-900 dark:via-gray-900/50 dark:to-transparent pointer-events-none z-10 rounded-l-full"></div>

          {/* Scroll Indicator Right */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-indigo-50 via-indigo-50/50 to-transparent dark:from-gray-900 dark:via-gray-900/50 dark:to-transparent pointer-events-none z-10 rounded-r-full"></div>

          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-full px-4 py-3 shadow-lg border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center gap-2 overflow-x-auto scroll-smooth px-8 scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-transparent hover:scrollbar-thumb-indigo-500">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-md'
                    : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                }`}
              >
                <span>전체</span>
                <span className={`text-xs ${selectedCategory === '' ? 'opacity-90' : 'opacity-60'}`}>
                  {allWorks.length}
                </span>
              </motion.button>

              {Object.entries(WORK_CATEGORIES).map(([key, info]) => {
                const categoryWorks = allWorks.filter(work => work.category === key);
                const isActive = selectedCategory === key;
                return (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-teal-500 text-white shadow-md'
                        : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                    <span className={`text-xs ${isActive ? 'opacity-90' : 'opacity-60'}`}>
                      {categoryWorks.length}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Add Work Form */}
      {isAdmin && showForm && (
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <WorkForm
              editingWork={editingWork}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        </section>
      )}

      {/* Works Gallery */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {works.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  💼
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">아직 작업물이 없습니다</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  첫 번째 프로젝트를 추가해서 포트폴리오를 시작해보세요!
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 dark:from-indigo-600 dark:to-teal-600 dark:hover:from-indigo-700 dark:hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    첫 작업물 추가하기
                  </button>
                )}
                {!isAdmin && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    관리자만 작업물을 추가할 수 있습니다.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedWorks.map((work, index) => (
                <AnimatedCard key={work.id} delay={index * 0.1}>
                  <article
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group ${
                      (work as any).isFeatured
                        ? 'border-2 border-yellow-400 dark:border-yellow-500'
                        : 'border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                  {(work as any).isFeatured && (
                    <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      ⭐ FEATURED
                    </div>
                  )}
                  {(() => {
                    const firstImage = extractFirstImage(work.content);
                    return firstImage ? (
                      <div className="h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                        <img
                          src={firstImage}
                          alt={work.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    ) : null;
                  })()}

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${WORK_CATEGORIES[work.category]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {WORK_CATEGORIES[work.category]?.icon} {WORK_CATEGORIES[work.category]?.label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[work.status]}`}>
                          {statusLabels[work.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {work.duration && (
                          <span className="text-xs text-gray-500">
                            ⏱ {work.duration}
                          </span>
                        )}
                        {isAdmin && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditWork(work)}
                              className="text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors"
                              title="작업물 수정"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteWork(work)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                              title="작업물 삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <Link href={`/work/${work.id}`}>
                        {work.title}
                      </Link>
                    </h3>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {stripHtml(work.content)}
                    </p>

                    {work.techStack && work.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {work.techStack.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {work.techStack.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                            +{work.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        {new Date(work.createdAt).toLocaleDateString('ko-KR')}
                      </span>

                      <div className="flex gap-2">
                        {work.githubUrl && (
                          <a
                            href={work.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="GitHub"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                          </a>
                        )}
                        {work.demoUrl && (
                          <a
                            href={work.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Live Demo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                        {work.youtubeUrl && (
                          <a
                            href={work.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="YouTube"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                            </svg>
                          </a>
                        )}
                        {work.instagramUrl && (
                          <a
                            href={work.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                            title="Instagram"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.070-4.85.070-3.204 0-3.584-.012-4.849-.070-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                          </a>
                        )}
                        {work.fileUrl && (
                          <a
                            href={work.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                            title="File"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
                </AnimatedCard>
              ))}
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
        isDeleting={deleteWork.isPending}
      />

    </div>
  );
}

export default function WorkPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <WorkPageContent />
    </Suspense>
  );
}
