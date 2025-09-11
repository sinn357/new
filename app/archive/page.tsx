'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Archive, ARCHIVE_CATEGORIES, ArchiveCategory } from '@/lib/archive-store';
import { useAdmin } from '@/contexts/AdminContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function ArchivePage() {
  const { isAdmin } = useAdmin();
  const [archives, setArchives] = useState<Archive[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ArchiveCategory>('business');
  const [tags, setTags] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);

  const fetchArchives = async (categoryFilter?: string) => {
    try {
      const url = categoryFilter 
        ? `/api/archive?category=${categoryFilter}`
        : '/api/archive';
      const response = await fetch(url);
      const data = await response.json();
      setArchives(data.archives || []);
    } catch {
      setError('Failed to fetch archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives(selectedCategory || undefined);
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: content.trim(),
          category,
          tags: tagsArray
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create archive');
      }

      // Reset form
      setTitle('');
      setContent('');
      setCategory('business');
      setTags('');
      setShowForm(false);
      
      await fetchArchives(selectedCategory || undefined);
    } catch {
      setError('Failed to create archive');
    } finally {
      setSubmitting(false);
    }
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
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/archive/${deleteModal.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete archive');
      }

      await fetchArchives(selectedCategory || undefined);
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

  const handleEditArchive = (archive: Archive) => {
    setEditingArchive(archive);
    setTitle(archive.title);
    setContent(archive.content);
    setCategory(archive.category as ArchiveCategory);
    setTags(archive.tags?.join(', ') || '');
    setShowForm(true);
  };

  const handleUpdateArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !editingArchive) return;

    setSubmitting(true);
    try {
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await fetch(`/api/archive/${editingArchive.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: content.trim(),
          category,
          tags: tagsArray
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update archive');
      }

      setTitle('');
      setContent('');
      setCategory('business');
      setTags('');
      setShowForm(false);
      setEditingArchive(null);
      
      await fetchArchives(selectedCategory || undefined);
    } catch {
      setError('Failed to update archive');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setTitle('');
    setContent('');
    setCategory('business');
    setTags('');
    setShowForm(false);
    setEditingArchive(null);
  };

  const filteredCategories = Object.entries(ARCHIVE_CATEGORIES);
  const archivesByCategory = archives.reduce((acc, archive) => {
    if (!acc[archive.category]) {
      acc[archive.category] = [];
    }
    acc[archive.category].push(archive);
    return acc;
  }, {} as Record<string, Archive[]>);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Archive
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            자유로운 글쓰기와 다양한 리뷰들을 담아놓은 개인적인 기록 공간입니다. 📝
          </p>
          
          {isAdmin && (
            <button
              onClick={() => {
                if (showForm && editingArchive) {
                  handleCancelEdit();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {showForm ? (editingArchive ? '편집 취소' : '폼 숨기기') : '새 글 작성'}
            </button>
          )}
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">카테고리</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${ 
                  selectedCategory === '' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체 ({archives.length})
              </button>
              {filteredCategories.map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${ 
                    selectedCategory === key 
                      ? 'bg-blue-500 text-white' 
                      : `${info.color} hover:opacity-80`
                  }`}
                >
                  <span>{info.icon}</span>
                  {info.label}
                  <span className="text-xs opacity-75">
                    ({archivesByCategory[key]?.length || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Add Archive Form */}
      {isAdmin && showForm && (
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingArchive ? '글 수정' : '새 글 작성'}
              </h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={editingArchive ? handleUpdateArchive : handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      제목 *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="글 제목을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 *
                    </label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ArchiveCategory)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {filteredCategories.map(([key, info]) => (
                        <option key={key} value={key}>
                          {info.icon} {info.label}
                        </option>
                      ))}
                    </select>
                  </div>
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="자유롭게 글을 작성해보세요..."
                    required
                  />
                </div>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                    태그
                  </label>
                  <input
                    type="text"
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="태그1, 태그2, 태그3 (쉼표로 구분)"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {submitting ? (editingArchive ? '수정 중...' : '작성 중...') : (editingArchive ? '글 수정' : '글 작성')}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Archives List */}
      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto">
          {archives.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    첫 글 작성하기
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {archives.map((archive) => {
                const categoryInfo = ARCHIVE_CATEGORIES[archive.category as ArchiveCategory];
                return (
                  <article
                    key={archive.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          {categoryInfo?.icon} {categoryInfo?.label || archive.category}
                        </span>
                        <span className="text-sm text-gray-500">
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
                            className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            title="글 수정"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteArchive(archive)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="글 삭제"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/archive/${archive.id}`}>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors cursor-pointer">
                        {archive.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3">
                      {archive.content}
                    </p>
                    
                    {archive.tags && archive.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {archive.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <Link
                      href={`/archive/${archive.id}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      더 읽기 →
                    </Link>
                  </article>
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
        isDeleting={isDeleting}
      />
    </div>
  );
}