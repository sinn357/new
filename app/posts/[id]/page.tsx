'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { Post } from '@/lib/posts-store';
import { Comment } from '@/lib/comments-store';

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!post) return <div className="flex justify-center p-8 text-red-500">Post not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-md mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="text-sm text-gray-500 mb-6">
          {new Date(post.createdAt).toLocaleString()}
        </div>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-6">Comments ({comments.length})</h2>
        
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

        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-gray-200 pl-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{comment.author}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}