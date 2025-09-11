'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Work, WORK_CATEGORIES, WorkCategory } from '@/lib/works-store';
import { useAdmin } from '@/contexts/AdminContext';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';
import FileUpload from '@/components/FileUpload';

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

export default function WorksPage() {
  const { isAdmin } = useAdmin();
  const [works, setWorks] = useState<Work[]>([]);
  const [allWorks, setAllWorks] = useState<Work[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<WorkCategory>('product');
  const [techStack, setTechStack] = useState<string>('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [status, setStatus] = useState<'completed' | 'in-progress' | 'planned'>('completed');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);

  const fetchWorks = async (categoryFilter?: string) => {
    try {
      const url = categoryFilter 
        ? `/api/works?category=${categoryFilter}`
        : '/api/works';
      const response = await fetch(url);
      const data = await response.json();
      setWorks(data.works || []);
    } catch {
      setError('Failed to fetch works');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWorks = async () => {
    try {
      const response = await fetch('/api/works');
      const data = await response.json();
      return data.works || [];
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const loadWorks = async () => {
      const all = await fetchAllWorks();
      setAllWorks(all);
      fetchWorks(selectedCategory || undefined);
    };
    loadWorks();
  }, []);

  useEffect(() => {
    fetchWorks(selectedCategory || undefined);
  }, [selectedCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const techStackArray = techStack.split(',').map(tech => tech.trim()).filter(tech => tech);
      
      const response = await fetch('/api/works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: content.trim(),
          category,
          techStack: techStackArray,
          githubUrl: githubUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          youtubeUrl: youtubeUrl.trim() || undefined,
          instagramUrl: instagramUrl.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          fileUrl: fileUrl.trim() || undefined,
          status,
          duration: duration.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create work');
      }

      // Reset form
      setTitle('');
      setContent('');
      setCategory('product');
      setTechStack('');
      setGithubUrl('');
      setDemoUrl('');
      setYoutubeUrl('');
      setInstagramUrl('');
      setImageUrl('');
      setFileUrl('');
      setStatus('completed');
      setDuration('');
      setShowForm(false);
      
      const all = await fetchAllWorks();
      setAllWorks(all);
      await fetchWorks(selectedCategory || undefined);
    } catch {
      setError('Failed to create work');
    } finally {
      setSubmitting(false);
    }
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
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/works/${deleteModal.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete work');
      }

      const all = await fetchAllWorks();
      setAllWorks(all);
      await fetchWorks(selectedCategory || undefined);
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

  const handleEditWork = (work: Work) => {
    setEditingWork(work);
    setTitle(work.title);
    setContent(work.content);
    setCategory(work.category as WorkCategory);
    setTechStack(work.techStack?.join(', ') || '');
    setGithubUrl(work.githubUrl || '');
    setDemoUrl(work.demoUrl || '');
    setYoutubeUrl(work.youtubeUrl || '');
    setInstagramUrl(work.instagramUrl || '');
    setImageUrl(work.imageUrl || '');
    setFileUrl(work.fileUrl || '');
    setStatus(work.status);
    setDuration(work.duration || '');
    setShowForm(true);
  };

  const handleUpdateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !editingWork) return;

    setSubmitting(true);
    try {
      const techStackArray = techStack.split(',').map(tech => tech.trim()).filter(tech => tech);
      
      const response = await fetch(`/api/works/${editingWork.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: title.trim(), 
          content: content.trim(),
          category,
          techStack: techStackArray,
          githubUrl: githubUrl.trim() || undefined,
          demoUrl: demoUrl.trim() || undefined,
          youtubeUrl: youtubeUrl.trim() || undefined,
          instagramUrl: instagramUrl.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          fileUrl: fileUrl.trim() || undefined,
          status,
          duration: duration.trim() || undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update work');
      }

      setTitle('');
      setContent('');
      setCategory('product');
      setTechStack('');
      setGithubUrl('');
      setDemoUrl('');
      setYoutubeUrl('');
      setInstagramUrl('');
      setImageUrl('');
      setFileUrl('');
      setStatus('completed');
      setDuration('');
      setShowForm(false);
      setEditingWork(null);
      
      const all = await fetchAllWorks();
      setAllWorks(all);
      await fetchWorks(selectedCategory || undefined);
    } catch {
      setError('Failed to update work');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setTitle('');
    setContent('');
    setCategory('product');
    setTechStack('');
    setGithubUrl('');
    setDemoUrl('');
    setYoutubeUrl('');
    setInstagramUrl('');
    setImageUrl('');
    setFileUrl('');
    setStatus('completed');
    setDuration('');
    setShowForm(false);
    setEditingWork(null);
  };

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
            My Works
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            프로덕트, 미디어, 포토그래피 등 다양한 작업물들을 소개합니다. 💻🎥📸
          </p>
          
          {isAdmin && (
            <button
              onClick={() => {
                if (showForm && editingWork) {
                  handleCancelEdit();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {showForm ? (editingWork ? '편집 취소' : '폼 숨기기') : '새 작업물 추가'}
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
                전체 ({allWorks.length})
              </button>
              {Object.entries(WORK_CATEGORIES).map(([key, info]) => {
                const categoryWorks = allWorks.filter(work => work.category === key);
                return (
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
                      ({categoryWorks.length})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Add Work Form */}
      {isAdmin && showForm && (
        <section className="px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingWork ? '작업물 수정' : '새 작업물 추가'}
              </h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={editingWork ? handleUpdateWork : handleSubmit} className="space-y-6">
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
                      placeholder="프로젝트 제목을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      작업 기간
                    </label>
                    <input
                      type="text"
                      id="duration"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 2주, 1개월"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 *
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as WorkCategory)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(WORK_CATEGORIES).map(([key, info]) => (
                      <option key={key} value={key}>
                        {info.icon} {info.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                    설명 *
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="프로젝트에 대한 상세 설명을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                    기술 스택
                  </label>
                  <input
                    type="text"
                    id="techStack"
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="React, Node.js, TypeScript (쉼표로 구분)"
                  />
                </div>

                {/* Conditional URL Fields based on Category */}
                <div className="space-y-6">
                  {category === 'product' && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
                          GitHub URL
                        </label>
                        <input
                          type="url"
                          id="githubUrl"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                          데모 URL
                        </label>
                        <input
                          type="url"
                          id="demoUrl"
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://your-demo.com"
                        />
                      </div>
                    </div>
                  )}

                  {category === 'media' && (
                    <div>
                      <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        id="youtubeUrl"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  )}

                  {category === 'photography' && (
                    <div>
                      <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        id="instagramUrl"
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://www.instagram.com/p/..."
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      대표 이미지
                    </label>
                    <FileUpload 
                      onFileUpload={setImageUrl}
                      accept="image/*"
                      label="이미지 선택"
                      currentUrl={imageUrl}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      첨부 파일
                    </label>
                    <FileUpload 
                      onFileUpload={setFileUrl}
                      accept="*/*"
                      label="파일 선택"
                      currentUrl={fileUrl}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                      상태
                    </label>
                    <select
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'completed' | 'in-progress' | 'planned')}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="completed">완료됨</option>
                      <option value="in-progress">진행중</option>
                      <option value="planned">계획됨</option>
                    </select>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !title.trim() || !content.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {submitting ? (editingWork ? '수정 중...' : '추가 중...') : (editingWork ? '작업물 수정' : '작업물 추가')}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Works Gallery */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {works.length === 0 ? (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  💼
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">아직 작업물이 없습니다</h3>
                <p className="text-gray-600 mb-6">
                  첫 번째 프로젝트를 추가해서 포트폴리오를 시작해보세요!
                </p>
                {isAdmin && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                  >
                    첫 작업물 추가하기
                  </button>
                )}
                {!isAdmin && (
                  <p className="text-gray-500 text-sm">
                    관리자만 작업물을 추가할 수 있습니다.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {works.map((work) => (
                <article
                  key={work.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  {work.imageUrl && (
                    <div className="h-48 bg-gray-100 overflow-hidden">
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
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
                              className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                              title="작업물 수정"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteWork(work)}
                              className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                              title="작업물 삭제"
                            >
                              🗑️
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors">
                      <Link href={`/works/${work.id}`}>
                        {work.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {work.content}
                    </p>
                    
                    {work.techStack && work.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {work.techStack.slice(0, 3).map((tech, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {tech}
                          </span>
                        ))}
                        {work.techStack.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                            +{work.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {new Date(work.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      
                      <div className="flex gap-2">
                        {work.githubUrl && (
                          <a
                            href={work.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
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
                            className="p-2 text-gray-600 hover:text-green-600 transition-colors"
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
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors"
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
                            className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
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
                            className="p-2 text-gray-600 hover:text-purple-600 transition-colors"
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
        isDeleting={isDeleting}
      />
    </div>
  );
}