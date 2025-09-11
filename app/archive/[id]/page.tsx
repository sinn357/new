'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ARCHIVE_CATEGORIES, ArchiveCategory } from '@/lib/archive-store';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Link from 'next/link';
import { useAdmin } from '@/contexts/AdminContext';

export default function ArchiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const [archive, setArchive] = useState<Archive | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchArchive = useCallback(async () => {
    try {
      const response = await fetch(`/api/archive/${id}`);
      if (!response.ok) {
        throw new Error('Archive not found');
      }
      const data = await response.json();
      setArchive(data.archive);
    } catch {
      setError('Failed to fetch archive');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArchive();
  }, [id, fetchArchive]);

  const handleDeleteArchive = () => {
    setDeleteModal({
      isOpen: true,
      type: 'archive',
      id: id,
      title: '글 삭제',
      message: '이 글을 삭제하시겠습니까?'
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/archive/${deleteModal.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete archive');
      }

      router.push('/archive');
      setDeleteModal({ isOpen: false, type: 'archive', id: '', title: '', message: '' });
    } catch {
      setError('Failed to delete archive');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, type: 'archive', id: '', title: '', message: '' });
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!archive) return <div className="flex justify-center p-8 text-red-500">Archive not found</div>;

  const categoryInfo = ARCHIVE_CATEGORIES[archive.category as ArchiveCategory];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/archive" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← 아카이브 목록으로 돌아가기
          </Link>
        </div>
      </section>

      {error && (
        <div className="max-w-4xl mx-auto px-6 mb-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Archive Content */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                  {categoryInfo?.icon} {categoryInfo?.label || archive.category}
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {new Date(archive.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </span>
              </div>
              {isAdmin && (
                <button
                  onClick={handleDeleteArchive}
                  className="text-red-500 hover:text-red-700 p-3 rounded-lg hover:bg-red-50 transition-colors"
                  title="글 삭제"
                >
                  🗑️
                </button>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
              {archive.title}
            </h1>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                {archive.content}
              </p>
            </div>

            {archive.tags && archive.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {archive.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </section>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}