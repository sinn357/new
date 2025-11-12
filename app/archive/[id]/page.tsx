'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ARCHIVE_CATEGORIES, ArchiveCategory } from '@/lib/archive-store';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import Link from 'next/link';
import Image from 'next/image';
import { useAdmin } from '@/contexts/AdminContext';
import { isImageFile, isVideoFile, isAudioFile, isPdfFile, getFileIcon, getFileTypeLabel, getFileName } from '@/lib/file-utils';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <section className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/archive" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
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
          <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 mb-8">
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
              <ReactMarkdown
                components={{
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const language = match ? match[1] : '';
                    
                    return !inline && language ? (
                      <SyntaxHighlighter
                        style={oneDark}
                        language={language}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold text-gray-900 mb-4 border-b pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-2">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-4">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-purple-500 pl-4 py-2 mb-4 bg-purple-50 text-gray-700 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      className="text-purple-600 hover:text-purple-700 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  img: ({ src, alt }: any) => (
                    <img 
                      src={src} 
                      alt={alt}
                      className="max-w-full h-auto rounded-lg shadow-md mb-4"
                    />
                  )
                }}
              >
                {archive.content}
              </ReactMarkdown>
            </div>

            {archive.tags && archive.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {archive.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* File attachments */}
            {(archive.imageUrl || archive.fileUrl) && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-3">첨부 파일</h3>
                <div className="grid gap-4">
                  {archive.imageUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getFileIcon(archive.imageUrl)}</span>
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{getFileTypeLabel(archive.imageUrl)}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{getFileName(archive.imageUrl)}</p>
                        </div>
                        <a 
                          href={archive.imageUrl} 
                          download
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          다운로드
                        </a>
                      </div>
                      
                      {/* Image preview */}
                      {isImageFile(archive.imageUrl) && (
                        <a 
                          href={archive.imageUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <div className="relative max-w-full" style={{ maxHeight: '300px' }}>
                            <Image 
                              src={archive.imageUrl} 
                              alt="첨부 이미지"
                              width={400}
                              height={300}
                              className="rounded-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer object-contain"
                              style={{ maxHeight: '300px', width: 'auto' }}
                            />
                          </div>
                        </a>
                      )}
                      
                      {/* Video preview */}
                      {isVideoFile(archive.imageUrl) && (
                        <video 
                          controls 
                          className="w-full max-w-md rounded-md border border-gray-200"
                          style={{ maxHeight: '300px' }}
                        >
                          <source src={archive.imageUrl} />
                          Your browser does not support the video tag.
                        </video>
                      )}
                      
                      {/* Audio preview */}
                      {isAudioFile(archive.imageUrl) && (
                        <audio controls className="w-full max-w-md">
                          <source src={archive.imageUrl} />
                          Your browser does not support the audio tag.
                        </audio>
                      )}
                      
                      {/* PDF preview */}
                      {isPdfFile(archive.imageUrl) && (
                        <div className="mt-3">
                          <a 
                            href={archive.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                          >
                            <span>📄</span>
                            PDF 열어보기
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {archive.fileUrl && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">{getFileIcon(archive.fileUrl)}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{getFileTypeLabel(archive.fileUrl)}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{getFileName(archive.fileUrl)}</p>
                        </div>
                        <a 
                          href={archive.fileUrl} 
                          download
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                          다운로드
                        </a>
                      </div>
                      
                      {/* Image preview */}
                      {isImageFile(archive.fileUrl) && (
                        <a 
                          href={archive.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-block"
                        >
                          <div className="relative max-w-full" style={{ maxHeight: '300px' }}>
                            <Image 
                              src={archive.fileUrl} 
                              alt="첨부 파일"
                              width={400}
                              height={300}
                              className="rounded-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer object-contain"
                              style={{ maxHeight: '300px', width: 'auto' }}
                            />
                          </div>
                        </a>
                      )}
                      
                      {/* Video preview */}
                      {isVideoFile(archive.fileUrl) && (
                        <video 
                          controls 
                          className="w-full max-w-md rounded-md border border-gray-200"
                          style={{ maxHeight: '300px' }}
                        >
                          <source src={archive.fileUrl} />
                          Your browser does not support the video tag.
                        </video>
                      )}
                      
                      {/* Audio preview */}
                      {isAudioFile(archive.fileUrl) && (
                        <audio controls className="w-full max-w-md">
                          <source src={archive.fileUrl} />
                          Your browser does not support the audio tag.
                        </audio>
                      )}
                      
                      {/* PDF preview */}
                      {isPdfFile(archive.fileUrl) && (
                        <div className="mt-3">
                          <a 
                            href={archive.fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors"
                          >
                            <span>📄</span>
                            PDF 열어보기
                          </a>
                        </div>
                      )}
                    </div>
                  )}
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