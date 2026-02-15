'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Archive, ARCHIVE_CATEGORIES, ArchiveCategory } from '@/lib/archive-store';
import { useAdmin } from '@/contexts/AdminContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import InlineEdit from '@/components/InlineEdit';
import AnimatedCard from '@/components/AnimatedCard';
import ArchiveForm from '@/components/ArchiveForm';
import { useArchives, useDeleteArchive } from '@/lib/hooks/useArchives';
import StarRating from '@/components/StarRating';
import { getCloudinaryImageUrl } from '@/lib/cloudinary';
import { getContentForLang } from '@/lib/bilingual-content';

type MediaPreview = {
  url: string;
  type: 'image' | 'video';
};

function getVideoThumbnailUrl(videoUrl: string): string {
  const transformed = videoUrl.includes('/upload/')
    ? videoUrl.replace('/upload/', '/upload/so_0,f_jpg/')
    : videoUrl;
  return transformed.replace(/\.(mp4|mov|webm|avi|m4v|ogg)(\?.*)?$/i, '.jpg');
}

// Helper function to extract first media from HTML
function extractFirstMedia(html: string): MediaPreview | null {
  // Try to extract from gallery first
  const galleryRegex = /data-images="([^"]+)"/;
  const galleryMatch = html.match(galleryRegex);
  if (galleryMatch) {
    try {
      const images = JSON.parse(galleryMatch[1].replace(/&quot;/g, '"'));
      if (Array.isArray(images) && images.length > 0) {
        return { url: images[0], type: 'image' };
      }
    } catch (e) {
      // Fallback to img tag
    }
  }

  // Fallback to regular img tag
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const imgMatch = html.match(imgRegex);
  if (imgMatch) return { url: imgMatch[1], type: 'image' };

  const videoRegex = /<video[^>]+src="([^">]+)"/;
  const videoMatch = html.match(videoRegex);
  if (videoMatch) return { url: videoMatch[1], type: 'video' };

  const sourceRegex = /<video[^>]*>[\s\S]*?<source[^>]+src="([^">]+)"/;
  const sourceMatch = html.match(sourceRegex);
  if (sourceMatch) return { url: sourceMatch[1], type: 'video' };

  return null;
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

interface PageContent {
  page: string;
  title: string;
  content: string;
}

function ArchivePageContent() {
  const { isAdmin } = useAdmin();
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams?.get('edit');

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

  // Load archive for editing when edit ID is in URL
  useEffect(() => {
    if (editId && allArchives.length > 0) {
      const archiveToEdit = allArchives.find(a => a.id === editId);
      if (archiveToEdit) {
        setEditingArchive(archiveToEdit);
        setShowForm(true);
      }
    }
  }, [editId, allArchives]);

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
      title: 'Delete Post',
      message: `Are you sure you want to delete "${archive.title}"?`
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteArchive.mutateAsync(deleteModal.id);
    } finally {
      setDeleteModal({ isOpen: false, type: 'archive', id: '', title: '', message: '' });
    }
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
                text={pageContent?.title || 'Archive'}
                onSave={saveTitle}
                className="mb-6"
                textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 bg-clip-text text-transparent pb-2"
                placeholder="Enter title"
              />
            </motion.div>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 bg-clip-text text-transparent pb-2 mb-6"
            >
              {pageContent?.title || 'Archive'}
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
                placeholder="Enter content"
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
                if (showForm && editingArchive) {
                  handleFormCancel();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 dark:from-indigo-600 dark:to-teal-600 dark:hover:from-indigo-700 dark:hover:to-teal-700 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {showForm ? (editingArchive ? 'Cancel Edit' : 'Hide Form') : 'Write New Post'}
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
                <span>All</span>
                <span className={`text-xs ${selectedCategory === '' ? 'opacity-90' : 'opacity-60'}`}>
                  {allArchives.length}
                </span>
              </motion.button>

              {filteredCategories.map(([key, info]) => {
                const categoryArchives = allArchives.filter(archive => archive.category === key);
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
                      {categoryArchives.length}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>

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
                  {selectedCategory ? 'No posts in this category' : 'No posts yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isAdmin ? 'Write your first post to start the archive!' : 'Posts will appear here when the administrator writes them.'}
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    Write First Post
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
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group overflow-hidden cursor-pointer"
                    role="link"
                    tabIndex={0}
                    onClick={(event) => {
                      if ((event.target as HTMLElement).closest('a, button')) return;
                      router.push(`/archive/${archive.id}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.target !== event.currentTarget) return;
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        router.push(`/archive/${archive.id}`);
                      }
                    }}
                  >
                    {(() => {
                      const archiveContent = getContentForLang(archive.content, 'ko');
                      const media = extractFirstMedia(archiveContent);
                      if (!media) return null;
                      const previewSrc = media.type === 'video'
                        ? getVideoThumbnailUrl(media.url)
                        : (getCloudinaryImageUrl(media.url) ?? media.url);
                      return (
                        <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img
                            src={previewSrc}
                            alt={archive.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {media.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="flex items-center justify-center w-12 h-12 bg-black/50 rounded-full">
                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                          {categoryInfo?.icon} {categoryInfo?.label || archive.category}
                        </span>
                        {isAdmin && !archive.isPublished && (
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                            Hidden
                          </span>
                        )}
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
                            title="Edit Post"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteArchive(archive)}
                            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                            title="Delete Post"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {archive.title}
                    </h2>

                    {(archive as any).rating && (
                      <div className="mb-4">
                        <StarRating value={(archive as any).rating} readonly size="sm" />
                      </div>
                    )}

                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 line-clamp-2">
                      {stripHtml(getContentForLang(archive.content, 'ko'))}
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
                            <span>Image</span>
                          </div>
                        )}
                        {archive.fileUrl && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-md">
                            <span>📎</span>
                            <span>Attachment</span>
                          </div>
                        )}
                      </div>
                    )}

                    </div>
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

export default function ArchivePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <ArchivePageContent />
    </Suspense>
  );
}
