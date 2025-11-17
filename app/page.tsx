'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Work } from '@/lib/work-store';
import { Archive } from '@/lib/archive-store';
import { useAdmin } from '@/contexts/AdminContext';
import InlineEdit from '@/components/InlineEdit';
import AnimatedCard from '@/components/AnimatedCard';
import AnimatedHero from '@/components/AnimatedHero';

interface PageContent {
  page: string;
  title: string;
  content: string;
}

export default function Home() {
  const { isAdmin } = useAdmin();
  const [works, setWorks] = useState<Work[]>([]);
  const [archives, setArchives] = useState<Archive[]>([]);
  const [totalWorks, setTotalWorks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [aboutContent, setAboutContent] = useState<PageContent | null>(null);

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/page-content?page=home');
      const data = await response.json();
      setPageContent(data.content);
    } catch (error) {
      console.error('Failed to fetch page content:', error);
    }
  };

  const fetchAboutContent = async () => {
    try {
      const response = await fetch('/api/page-content?page=about');
      const data = await response.json();
      setAboutContent(data.content);
    } catch (error) {
      console.error('Failed to fetch about content:', error);
    }
  };

  const fetchArchives = async () => {
    try {
      const response = await fetch('/api/archive');
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }
      const data = await response.json();
      const latestArchives = data.archives.slice(0, 3);
      setArchives(latestArchives);
    } catch (error) {
      console.error('Failed to fetch archives:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/work');
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.error) {
          throw new Error(`API error: ${data.error} - ${data.message || ''}`);
        }
        
        setWorks(data.works.slice(0, 3)); // 최신 3개만
        setTotalWorks(data.works.length);
      } catch (error) {
        console.error('Failed to fetch works:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchPageContent();
    fetchAboutContent();
    fetchArchives();
  }, []);

  const saveTitle = async (newTitle: string) => {
    const response = await fetch('/api/page-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'home',
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
        page: 'home',
        title: pageContent?.title || 'Welcome to My Blog',
        content: newContent
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save content');
    }

    const result = await response.json();
    setPageContent(result.pageContent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="px-6 py-20 text-center">
        <AnimatedHero className="max-w-4xl mx-auto">
          {isAdmin ? (
            <InlineEdit
              text={pageContent?.title || 'Welcome to My Blog'}
              onSave={saveTitle}
              className="mb-6"
              textClassName="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 bg-clip-text text-transparent"
              placeholder="제목을 입력하세요"
            />
          ) : (
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 bg-clip-text text-transparent mb-6">
              {pageContent?.title || 'Welcome to My Blog'}
            </h1>
          )}
          
          {isAdmin ? (
            <InlineEdit
              text={pageContent?.content || ''}
              onSave={saveContent}
              className="mb-12 max-w-2xl mx-auto"
              textClassName="text-xl md:text-2xl text-gray-600"
              isTextarea={true}
              placeholder="내용을 입력하세요"
            />
          ) : (
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              {pageContent?.content || ''}
            </p>
          )}
          
          {/* Stats */}
          <div className="flex justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalWorks}</div>
              <div className="text-sm text-gray-500">작업물</div>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/work"
              className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              작업물 보기
            </Link>
            <Link
              href="/archive"
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              아카이브 보기
            </Link>
            <Link
              href="/about"
              className="border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-200 px-8 py-3 rounded-full font-medium transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              소개 및 연락
            </Link>
          </div>
        </AnimatedHero>
      </section>

      {/* Latest Works Section */}
      <section className="px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            최신 작업물
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : works.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">아직 작업물이 없습니다.</p>
              <Link
                href="/work"
                className="inline-block mt-4 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium"
              >
                첫 번째 작업물 추가하기 →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {works.map((work, index) => (
                <AnimatedCard key={work.id} delay={index * 0.1}>
                  <article
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700"
                  >
                    <div className="p-8">
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                        {work.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {work.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          {new Date(work.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        <Link
                          href={`/work/${work.id}`}
                          className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium text-sm"
                        >
                          자세히 보기 →
                        </Link>
                      </div>
                    </div>
                  </article>
                </AnimatedCard>
              ))}
            </div>
          )}
          
          {works.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/work"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                모든 작업물 보기
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Archive Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100 text-center">
            최신 아카이브
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
            
          </p>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
            </div>
          ) : archives.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">아직 아카이브 글이 없습니다.</p>
              <Link
                href="/archive"
                className="inline-block mt-4 text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-medium"
              >
                첫 번째 글 작성하기 →
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {archives.map((archive, index) => (
                <AnimatedCard key={archive.id} delay={index * 0.1}>
                  <article
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 dark:border-gray-700"
                  >
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 text-sm font-medium rounded-full">
                          {archive.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2">
                        {archive.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {archive.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          {new Date(archive.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                        <Link
                          href={`/archive/${archive.id}`}
                          className="text-teal-500 dark:text-teal-400 hover:text-teal-600 dark:hover:text-teal-300 font-medium text-sm"
                        >
                          자세히 보기 →
                        </Link>
                      </div>
                    </div>
                  </article>
                </AnimatedCard>
              ))}
            </div>
          )}
          
          {archives.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/archive"
                className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
              >
                모든 아카이브 보기
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="px-6 py-16 bg-white/50 dark:bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-gray-100">
            {aboutContent?.title || 'About'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {aboutContent?.content || ''}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React', 'Next.js', 'TypeScript', 'Node.js', 'Prisma', 'PostgreSQL'].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-teal-100 dark:from-indigo-900 dark:to-teal-900 text-gray-700 dark:text-gray-200 rounded-full text-sm font-medium"
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