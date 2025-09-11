'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Post } from '@/lib/posts-store';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalComments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/posts');
        const data = await response.json();
        setPosts(data.posts.slice(0, 3)); // 최신 3개만
        setStats({
          totalPosts: data.posts.length,
          totalComments: data.posts.reduce((sum: number, post: Post) => sum + (post.comments?.length || 0), 0)
        });
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Welcome to My Blog
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            개발과 기술에 대한 생각을 공유하는 공간입니다. 함께 성장해나가요! 🚀
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.totalPosts}</div>
              <div className="text-sm text-gray-500">포스트</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{stats.totalComments}</div>
              <div className="text-sm text-gray-500">댓글</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/posts"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              모든 포스트 보기
            </Link>
            <Link
              href="/contact"
              className="border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:bg-gray-50"
            >
              연락하기
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            최신 포스트
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">아직 포스트가 없습니다.</p>
              <Link
                href="/posts"
                className="inline-block mt-4 text-blue-500 hover:text-blue-600 font-medium"
              >
                첫 번째 포스트 작성하기 →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
                >
                  <div className="p-8">
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                      <Link
                        href={`/posts/${post.id}`}
                        className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                      >
                        더 읽기 →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          
          {posts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/posts"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                모든 포스트 보기
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-16 bg-white/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800">About</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            안녕하세요! 개발에 대한 열정과 지식을 공유하는 블로그입니다. 
            새로운 기술을 배우고, 경험을 나누며, 함께 성장하는 것을 좋아합니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Next.js', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm font-medium"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
