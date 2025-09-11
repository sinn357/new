'use client';

import { useState } from 'react';
import Link from 'next/link';
import emailjs from '@emailjs/browser';

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

export default function Contact() {
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
      // EmailJS 환경변수 가져오기
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

      console.log('EmailJS 설정 확인:', {
        serviceId: serviceId || 'MISSING',
        templateId: templateId || 'MISSING',
        publicKey: publicKey ? 'SET' : 'MISSING'
      });

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS 환경변수가 설정되지 않았습니다');
      }

      // EmailJS 초기화
      emailjs.init(publicKey);

      // 이메일 템플릿 파라미터 준비 (웹사이트 주인에게 전송)
      const templateParams = {
        from_name: formData.name,        // 문의자 이름
        from_email: formData.email,      // 문의자 이메일
        subject: formData.subject,       // 문의 제목
        category: getCategoryLabel(formData.category), // 문의 카테고리
        message: formData.message,       // 문의 내용
        to_name: '웹사이트 운영자',        // 받는 사람 (당신)
        reply_to: formData.email         // 답장할 이메일 주소
      };

      console.log('이메일 전송 시작...', templateParams);
      console.log('EmailJS 호출 파라미터:', { serviceId, templateId });

      // EmailJS로 이메일 전송
      console.log('EmailJS.send 호출 직전');
      const result = await emailjs.send(serviceId, templateId, templateParams);
      console.log('EmailJS.send 호출 완료');
      
      console.log('이메일 전송 성공:', result);
      setStatus('success');
      
      // 폼 리셋
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: ''
      });
      setErrors({});
    } catch (error) {
      console.log('이메일 전송 실패 - 에러 타입:', typeof error);
      console.log('이메일 전송 실패 - 에러 문자열:', String(error));
      console.log('이메일 전송 실패 - JSON:', JSON.stringify(error));
      
      // EmailJS 특정 에러 확인
      if (error && error.constructor && error.constructor.name) {
        console.log('에러 생성자:', error.constructor.name);
      }
      
      // 모든 속성 확인
      if (error && typeof error === 'object') {
        console.log('에러 객체의 모든 키:', Object.keys(error));
        const errorObj = error as Record<string, unknown>;
        for (const key in errorObj) {
          console.log(`에러.${key}:`, errorObj[key]);
        }
      }
      
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
    
    // 에러 상태 초기화
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
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Contact Me
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            궁금한 점이나 제안사항이 있으시면 언제든 연락주세요! 💌
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* 연락처 정보 섹션 */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">연락처 정보</h2>
              
              <div className="space-y-4">
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
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">연락 카테고리</h3>
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

          {/* 연락 폼 섹션 */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">메시지 보내기</h2>
            
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
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

              <div>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:hover:shadow-lg"
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}