'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/lib/posts-store';
import { Comment } from '@/lib/comments-store';
import DeleteConfirmModal from '@/components/DeleteConfirmModal';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'post' | 'comment';
    id: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'post',
    id: '',
    title: '',
    message: ''
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      const response = await fetch(`/api/posts/${id}`);
      if (!response.ok) {
        throw new Error('Post not found');
      }
      const data = await response.json();
      setPost(data.post);
    } catch {
      setError('Failed to fetch post');
    }
  }, [id]);

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/comments?postId=${id}`);
      const data = await response.json();
      setComments(data.comments);
    } catch {
      setError('Failed to fetch comments');
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchPost(), fetchComments()]);
      setLoading(false);
    };
    loadData();
  }, [id, fetchPost, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          postId: id,
          author: author.trim(), 
          content: content.trim() 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create comment');
      }

      setAuthor('');
      setContent('');
      await fetchComments();
    } catch {
      setError('Failed to create comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = () => {
    setDeleteModal({
      isOpen: true,
      type: 'post',
      id: id,
      title: '포스트 삭제',
      message: '이 포스트를 삭제하시겠습니까? 모든 댓글도 함께 삭제됩니다.'
    });
  };

  const handleDeleteComment = (commentId: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'comment',
      id: commentId,
      title: '댓글 삭제',
      message: '이 댓글을 삭제하시겠습니까?'
    });
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const endpoint = deleteModal.type === 'post' 
        ? `/api/posts/${deleteModal.id}`
        : `/api/comments/${deleteModal.id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${deleteModal.type}`);
      }

      if (deleteModal.type === 'post') {
        router.push('/posts');
      } else {
        await fetchComments();
      }
      
      setDeleteModal({ isOpen: false, type: 'post', id: '', title: '', message: '' });
    } catch {
      setError(`Failed to delete ${deleteModal.type}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModal({ isOpen: false, type: 'post', id: '', title: '', message: '' });
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!post) return <div className="flex justify-center p-8 text-red-500">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 포스트 메인 영역 - 더 크고 눈에 띄게 */}
      <div className="bg-white p-12 rounded-2xl shadow-lg mb-12 border border-gray-100">
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">{post.title}</h1>
          <button
            onClick={handleDeletePost}
            className="text-red-500 hover:text-red-700 p-3 rounded-lg hover:bg-red-50 transition-colors"
            title="포스트 삭제"
          >
            🗑️
          </button>
        </div>
        <div className="text-base text-gray-500 mb-8 border-b border-gray-200 pb-6">
          {new Date(post.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </div>
        
        {/* 포스트 내용 - 더 큰 텍스트와 여백 */}
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap leading-8 text-lg">
            {post.content}
          </p>
        </div>
      </div>

      {/* 댓글 영역 - 시각적으로 분리 */}
      <div className="bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Comments ({comments.length})</h2>
        
        <form onSubmit={handleSubmit} className="mb-8 border-b pb-6">
          <div className="mb-4">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Write your comment"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting || !author.trim() || !content.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-6 text-sm">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-white border-l-4 border-blue-200 pl-4 py-3 rounded-r-lg shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800 text-sm">{comment.author}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 text-sm transition-colors"
                    title="댓글 삭제"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

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