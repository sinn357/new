'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Work } from '@/lib/works-store';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/contexts/AdminContext';

const statusLabels = {
  'completed': '완료됨',
  'in-progress': '진행중',
  'planned': '계획됨'
};

const statusColors = {
  'completed': 'bg-green-100 text-green-800',
  'in-progress': 'bg-blue-100 text-blue-800', 
  'planned': 'bg-yellow-100 text-yellow-800'
};

export default function WorkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchWork = useCallback(async () => {
    try {
      const response = await fetch(`/api/works/${id}`);
      if (!response.ok) {
        throw new Error('Work not found');
      }
      const data = await response.json();
      setWork(data.work);
    } catch {
      setError('Failed to fetch work');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchWork();
  }, [id, fetchWork]);

  const handleDeleteWork = () => {
    setDeleteModal({
      isOpen: true,
      type: 'work',
      id: id,
      title: '작업물 삭제',
      message: '이 작업물을 삭제하시겠습니까?'
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/works/${deleteModal.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete work');
      }

      router.push('/works');
      setDeleteModal({ isOpen: false, type: 'work', id: '', title: '', message: '' });
    } catch {
      setError('Failed to delete work');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, type: 'work', id: '', title: '', message: '' });
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (!work) return <div className="flex justify-center p-8 text-red-500">Work not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <section className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <Link 
            href="/works" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            ← 작업물 목록으로 돌아가기
          </Link>
        </div>
      </section>

      {error && (
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      )}

      {/* Work Hero Section */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Work Image */}
            {work.imageUrl && (
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  <Image
                    src={work.imageUrl}
                    alt={work.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            )}
            
            {/* Work Info */}
            <div className={`order-1 ${work.imageUrl ? 'lg:order-2' : 'lg:col-span-2'}`}>
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[work.status]}`}>
                      {statusLabels[work.status]}
                    </span>
                    {work.duration && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        ⏱ {work.duration}
                      </span>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      onClick={handleDeleteWork}
                      className="text-red-500 hover:text-red-700 p-3 rounded-lg hover:bg-red-50 transition-colors"
                      title="작업물 삭제"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {work.title}
                </h1>

                <div className="text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                  작성일: {new Date(work.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </div>

                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-lg">
                    {work.content}
                  </p>
                </div>

                {/* Tech Stack */}
                {work.techStack && work.techStack.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">기술 스택</h3>
                    <div className="flex flex-wrap gap-2">
                      {work.techStack.map((tech, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 text-sm rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {work.githubUrl && (
                    <a
                      href={work.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                      GitHub에서 보기
                    </a>
                  )}
                  {work.demoUrl && (
                    <a
                      href={work.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      라이브 데모
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
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