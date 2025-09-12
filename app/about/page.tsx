'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { useAdmin } from '@/contexts/AdminContext';
import InlineEdit from '@/components/InlineEdit';

interface FormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

interface PageContent {
  page: string;
  title: string;
  content: string;
}

export default function About() {
  const { isAdmin } = useAdmin();
  const [showMore, setShowMore] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pageContent, setPageContent] = useState<PageContent | null>(null);

  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
    'Python', 'PostgreSQL', 'MongoDB', 'Prisma', 'Git', 'Docker'
  ];

  const interests = [
    '웹 개발', '오픈소스', '새로운 기술', '문제 해결', '팀워크', '지식 공유'
  ];

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/page-content?page=about');
      const data = await response.json();
      setPageContent(data.content);
    } catch (error) {
      console.error('Failed to fetch page content:', error);
    }
  };

  useEffect(() => {
    fetchPageContent();
  }, []);

  const saveTitle = async (newTitle: string) => {
    const response = await fetch('/api/page-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'about',
        title: newTitle,
        content: pageContent?.content || '안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다. 🚀'
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
        page: 'about',
        title: pageContent?.title || 'About Me',
        content: newContent
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save content');
    }

    const result = await response.json();
    setPageContent(result.pageContent);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = '제목을 입력해주세요.';
    }

    if (!formData.message.trim()) {
      newErrors.message = '메시지를 입력해주세요.';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = '메시지는 최소 10자 이상 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS 환경변수가 설정되지 않았습니다');
      }

      emailjs.init(publicKey);

      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        category: getCategoryLabel(formData.category),
        message: formData.message,
        to_name: '웹사이트 운영자',
        reply_to: formData.email
      };

      await emailjs.send(serviceId, templateId, templateParams);
      setStatus('success');
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
      setErrors({});
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (category: string): string => {
    const categoryMap: Record<string, string> = {
      general: '일반 문의',
      collaboration: '협업 제안',
      technical: '기술 문의',
      feedback: '피드백'
    };
    return categoryMap[category] || category;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

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
          
          {isAdmin ? (
            <InlineEdit
              text={pageContent?.title || 'About Me'}
              onSave={saveTitle}
              className="mb-6"
              textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              placeholder="제목을 입력하세요"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              {pageContent?.title || 'About Me'}
            </h1>
          )}
          
          {isAdmin ? (
            <InlineEdit
              text={pageContent?.content || '안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다. 🚀'}
              onSave={saveContent}
              className="mb-12 max-w-2xl mx-auto"
              textClassName="text-xl text-gray-600"
              isTextarea={true}
              placeholder="내용을 입력하세요"
            />
          ) : (
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              {pageContent?.content || '안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다. 🚀'}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* 소개 섹션 */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  👨‍💻
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">개발자</h2>
                  <p className="text-gray-600">풀스택 웹 개발자</p>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                안녕하세요! 웹 개발에 열정을 가진 개발자입니다. 사용자에게 가치를 제공하는 
                서비스를 만드는 것을 좋아하며, 새로운 기술을 배우고 적용하는 것에 즐거움을 
                느낍니다.
              </p>
              
              {showMore && (
                <div className="text-gray-700 leading-relaxed space-y-3">
                  <p>
                    특히 React와 Next.js를 활용한 모던 웹 개발에 관심이 많으며, 
                    백엔드는 Node.js와 Python을 주로 사용합니다. 데이터베이스는 
                    PostgreSQL과 MongoDB를 경험했습니다.
                  </p>
                  <p>
                    개발뿐만 아니라 팀워크와 소통을 중요하게 생각하며, 지식을 공유하고 
                    함께 성장하는 것을 좋아합니다.
                  </p>
                </div>
              )}
              
              <button
                onClick={() => setShowMore(!showMore)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {showMore ? '접기' : '더 보기'} {showMore ? '↑' : '↓'}
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">경험 & 배경</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-800">웹 개발</h4>
                  <p className="text-gray-600 text-sm">프론트엔드와 백엔드 개발 경험</p>
                  <p className="text-gray-500 text-xs mt-1">React, Next.js, Node.js</p>
                </div>
                
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-800">프로젝트 관리</h4>
                  <p className="text-gray-600 text-sm">개인 및 팀 프로젝트 경험</p>
                  <p className="text-gray-500 text-xs mt-1">Git, Agile</p>
                </div>
                
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-800">지속적인 학습</h4>
                  <p className="text-gray-600 text-sm">새로운 기술 습득과 적용</p>
                  <p className="text-gray-500 text-xs mt-1">온라인 강의, 문서 학습</p>
                </div>
              </div>
            </div>
          </div>

          {/* 스킬 & 관심사 섹션 */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">기술 스택</h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={skill}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      index % 3 === 0
                        ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'
                        : index % 3 === 1
                        ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700'
                        : 'bg-gradient-to-r from-green-100 to-green-200 text-green-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">관심사</h3>
              <div className="space-y-3">
                {interests.map((interest, index) => (
                  <div key={interest} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      index % 4 === 0 ? 'bg-blue-500' :
                      index % 4 === 1 ? 'bg-purple-500' :
                      index % 4 === 2 ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-gray-700">{interest}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 연락처 정보 섹션 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">연락처 정보</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    📧
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">이메일</p>
                    <p className="text-gray-600">your.email@example.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    🌐
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">웹사이트</p>
                    <p className="text-gray-600">https://your-blog.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    ⏰
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">응답 시간</p>
                    <p className="text-gray-600">보통 24시간 이내</p>
                  </div>
                </div>
              </div>
              
              <Link
                href="/work"
                className="w-full block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                작업물 보기
              </Link>
            </div>
            
            {/* 연락 카테고리 정보 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h4 className="text-lg font-bold text-gray-800 mb-4">연락 카테고리</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>일반 문의:</strong> 기본적인 질문이나 안내</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>협업 제안:</strong> 프로젝트나 파트너십</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>기술 문의:</strong> 개발 관련 질문</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700"><strong>피드백:</strong> 사이트 개선 제안</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">개발 철학</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                🎯
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">사용자 중심</h4>
              <p className="text-gray-600 text-sm">
                사용자의 경험을 최우선으로 생각하며, 직관적이고 편리한 인터페이스를 만들어 나갑니다.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                💡
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">지속적인 개선</h4>
              <p className="text-gray-600 text-sm">
                완벽한 코드는 없다고 생각합니다. 항상 더 나은 방법을 찾고 개선해 나갑니다.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                🤝
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">협업과 소통</h4>
              <p className="text-gray-600 text-sm">
                혼자서는 할 수 없는 일들을 팀워크로 이뤄내고, 지식을 나누며 함께 성장합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">연락하기</h3>
          
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              ✅ 메시지가 성공적으로 전송되었습니다! 곧 답변드리겠습니다.
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              ❌ 메시지 전송에 실패했습니다. 다시 시도해주세요.
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="홍길동"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="general">일반 문의</option>
                  <option value="collaboration">협업 제안</option>
                  <option value="technical">기술 문의</option>
                  <option value="feedback">피드백</option>
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.subject ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="문의 제목을 입력하세요"
                />
                {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                메시지 *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical ${
                  errors.message ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="메시지를 자세히 적어주세요..."
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    전송 중...
                  </span>
                ) : (
                  '메시지 보내기'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}