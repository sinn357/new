'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import emailjs from '@emailjs/browser';
import { useAdmin } from '@/contexts/AdminContext';
import InlineEdit from '@/components/InlineEdit';
import { FaEnvelope, FaGlobe } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  subject: string;
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
  sections?: {
    name?: string;
    role?: string;
    bio?: string;
    email?: string;
    website?: string;
    skills?: string[];
    experience?: Array<{
      year: string;
      title: string;
      description: string;
    }>;
    interests?: string[];
  };
}

export default function AboutPage() {
  const { isAdmin } = useAdmin();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [contentReady, setContentReady] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const name = pageContent?.sections?.name || '개발자';
  const role = pageContent?.sections?.role || '풀스택 개발자';
  const bio = pageContent?.sections?.bio || '안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다.';
  const email = pageContent?.sections?.email || 'your.email@example.com';
  const website = pageContent?.sections?.website || 'https://your-site.com';
  const skills = pageContent?.sections?.skills || [];
  const experience = pageContent?.sections?.experience || [];
  const interests = pageContent?.sections?.interests || [];

  useEffect(() => {
    fetchPageContent();
  }, []);

  const fetchPageContent = async () => {
    try {
      const response = await fetch('/api/page-content?page=about');
      const data = await response.json();
      setPageContent(data.content);
    } catch (error) {
      console.error('Failed to fetch page content:', error);
    } finally {
      setContentReady(true);
    }
  };

  const saveTitle = async (newTitle: string) => {
    const response = await fetch('/api/page-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'about',
        title: newTitle,
        content: pageContent?.content || '',
        sections: pageContent?.sections
      })
    });

    if (!response.ok) throw new Error('Failed to save title');
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
        content: newContent,
        sections: pageContent?.sections
      })
    });

    if (!response.ok) throw new Error('Failed to save content');
    const result = await response.json();
    setPageContent(result.pageContent);
  };

  const saveSectionData = async (sectionKey: string, newValue: unknown) => {
    const updatedSections = {
      ...pageContent?.sections,
      [sectionKey]: newValue
    };

    const response = await fetch('/api/page-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: 'about',
        title: pageContent?.title || 'About Me',
        content: pageContent?.content || '',
        sections: updatedSections
      })
    });

    if (!response.ok) throw new Error('Failed to save section data');
    const result = await response.json();
    setPageContent(result.pageContent);
  };

  const saveName = async (newName: string) => saveSectionData('name', newName);
  const saveRole = async (newRole: string) => saveSectionData('role', newRole);
  const saveBio = async (newBio: string) => saveSectionData('bio', newBio);
  const saveSkills = async (skillsText: string) => {
    if (!skillsText || !skillsText.trim()) {
      await saveSectionData('skills', []);
      return;
    }
    const skillsArray = skillsText.split(',').map(s => s.trim()).filter(s => s);
    await saveSectionData('skills', skillsArray);
  };

  const saveInterests = async (interestsText: string) => {
    if (!interestsText || !interestsText.trim()) {
      await saveSectionData('interests', []);
      return;
    }
    const interestsArray = interestsText.split(',').map(i => i.trim()).filter(i => i);
    await saveSectionData('interests', interestsArray);
  };

  const saveExperience = async (experienceText: string) => {
    if (!experienceText || !experienceText.trim()) {
      await saveSectionData('experience', []);
      return;
    }
    // Format: "year|title|description, year2|title2|description2"
    const experienceArray = experienceText.split(',').map(item => {
      const parts = item.split('|').map(p => p.trim());
      return {
        year: parts[0] || '',
        title: parts[1] || '',
        description: parts[2] || ''
      };
    }).filter(item => item.year && item.title);
    await saveSectionData('experience', experienceArray);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요.';
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }
    if (!formData.subject.trim()) newErrors.subject = '제목을 입력해주세요.';
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
    if (!validateForm()) return;

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
        message: formData.message,
        to_name: '웹사이트 운영자',
        reply_to: formData.email
      };

      await emailjs.send(serviceId, templateId, templateParams);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
      setTimeout(() => setContactFormOpen(false), 2000);
    } catch (error) {
      console.error('이메일 전송 실패:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className={`transition-opacity duration-200 ${contentReady ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

        <div className="max-w-4xl mx-auto text-center">
          {isAdmin ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <InlineEdit
                text={pageContent?.title || 'About Me'}
                onSave={saveTitle}
                className="mb-6"
                textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 bg-clip-text text-transparent pb-2"
                placeholder="제목을 입력하세요"
              />
            </motion.div>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-indigo-400 dark:to-teal-400 bg-clip-text text-transparent pb-2 mb-6"
            >
              {pageContent?.title || 'About Me'}
            </motion.h1>
          )}

          {isAdmin ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <InlineEdit
                text={pageContent?.content || ''}
                onSave={saveContent}
                className="mb-12 max-w-2xl mx-auto"
                textClassName="text-xl text-gray-600 dark:text-gray-300"
                isTextarea={true}
                placeholder="내용을 입력하세요"
              />
            </motion.div>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              {pageContent?.content || ''}
            </motion.p>
          )}
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Profile Card - Large */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 lg:row-span-2 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-shadow"
          >
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-full flex items-center justify-center text-white text-4xl font-bold flex-shrink-0">
                {name.charAt(0)}
              </div>
              <div className="flex-1">
                {isAdmin ? (
                  <InlineEdit
                    text={name}
                    onSave={saveName}
                    textClassName="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2"
                    placeholder="이름을 입력하세요"
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{name}</h2>
                )}

                {isAdmin ? (
                  <InlineEdit
                    text={role}
                    onSave={saveRole}
                    textClassName="text-indigo-600 dark:text-indigo-400 font-medium mb-4"
                    placeholder="직책을 입력하세요"
                  />
                ) : (
                  <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">{role}</p>
                )}

                {isAdmin ? (
                  <InlineEdit
                    text={bio}
                    onSave={saveBio}
                    textClassName="text-gray-600 dark:text-gray-300 leading-relaxed"
                    isTextarea={true}
                    placeholder="소개를 입력하세요"
                  />
                ) : (
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{bio}</p>
                )}
              </div>
            </div>

            {/* Contact Links */}
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900/50 dark:to-indigo-800/50 text-indigo-700 dark:text-indigo-300 rounded-full hover:scale-105 transition-transform"
              >
                <FaEnvelope /> Email
              </a>
            </div>
          </motion.div>

          {/* Skills Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">🛠️ Skills</h3>
            {isAdmin ? (
              <div>
                <InlineEdit
                  text={skills.join(', ')}
                  onSave={saveSkills}
                  textClassName="text-gray-600 dark:text-gray-300 text-sm"
                  isTextarea={true}
                  placeholder="쉼표로 구분해서 입력 (예: React, Node.js, TypeScript)"
                />
                <p className="text-xs text-gray-400 mt-2">쉼표(,)로 구분해서 입력하세요</p>
              </div>
            ) : skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-teal-500 text-white text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">아직 추가된 스킬이 없습니다.</p>
            )}
          </motion.div>

          {/* Interests Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl p-6 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-shadow"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">💡 Interests</h3>
            {isAdmin ? (
              <div>
                <InlineEdit
                  text={interests.join(', ')}
                  onSave={saveInterests}
                  textClassName="text-gray-600 dark:text-gray-300 text-sm"
                  isTextarea={true}
                  placeholder="쉼표로 구분해서 입력 (예: 웹 개발, AI, 오픈소스)"
                />
                <p className="text-xs text-gray-400 mt-2">쉼표(,)로 구분해서 입력하세요</p>
              </div>
            ) : interests.length > 0 ? (
              <div className="space-y-2">
                {interests.map((interest, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm">{interest}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">아직 추가된 관심사가 없습니다.</p>
            )}
          </motion.div>

          {/* Experience Timeline - Full Width */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="md:col-span-3 lg:col-span-2 backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl p-8 shadow-xl border border-white/20 dark:border-gray-700/20 hover:shadow-2xl transition-shadow"
          >
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">📚 Experience</h3>
            {isAdmin ? (
              <div>
                <InlineEdit
                  text={experience.map(exp => `${exp.year}|${exp.title}|${exp.description}`).join(', ')}
                  onSave={saveExperience}
                  textClassName="text-gray-600 dark:text-gray-300 text-sm"
                  isTextarea={true}
                  placeholder="형식: 년도|제목|설명, 년도2|제목2|설명2 (예: 2023|프로젝트 A|설명, 2024|프로젝트 B|설명)"
                />
                <p className="text-xs text-gray-400 mt-2">형식: 년도|제목|설명을 쉼표로 구분 (예: 2023|프로젝트 A|프로젝트 설명)</p>
              </div>
            ) : experience.length > 0 ? (
              <div className="space-y-6">
                {experience.map((exp, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {exp.year}
                      </div>
                      {index < experience.length - 1 && (
                        <div className="w-0.5 h-full bg-gradient-to-b from-indigo-500 to-teal-500 mt-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{exp.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">아직 추가된 경험이 없습니다.</p>
            )}
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-gradient-to-br from-indigo-500 to-teal-500 rounded-3xl p-6 shadow-xl border border-white/20 text-white hover:shadow-2xl transition-shadow cursor-pointer"
            onClick={() => setContactFormOpen(true)}
          >
            <h3 className="text-2xl font-bold mb-2">💬 Get in Touch</h3>
            <p className="text-white/90 text-sm mb-4">프로젝트나 협업 문의는 언제든 환영합니다!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-white text-indigo-600 font-semibold py-3 rounded-xl hover:shadow-lg transition-shadow"
            >
              Contact Me →
            </motion.button>
          </motion.div>
        </div>
      </div>

      {/* Floating Contact Form Modal */}
      {contactFormOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setContactFormOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:h-auto z-50 overflow-y-auto"
          >
            <div className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Contact Me</h3>
                <button
                  onClick={() => setContactFormOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                >
                  ×
                </button>
              </div>

              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                  ✅ 메시지가 성공적으로 전송되었습니다!
                </div>
              )}

              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  ❌ 메시지 전송에 실패했습니다. 다시 시도해주세요.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">이름 *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="홍길동"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">이메일 *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">제목 *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                      errors.subject ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="문의 제목"
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">메시지 *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 resize-vertical ${
                      errors.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="메시지를 입력하세요..."
                  />
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
                >
                  {loading ? '전송 중...' : '메시지 보내기'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
      </div>
    </div>
  );
}
