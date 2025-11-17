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
  sections?: {
    skills?: string[];
    interests?: string[];
    fullIntroText?: string;
    mainTitle?: string;
    jobTitle?: string;
    mainIcon?: string;
    experience?: Array<{
      title: string;
      description: string;
      tech: string;
      color: string;
    }>;
    contactInfo?: {
      email?: string;
      website?: string;
      responseTime?: string;
      emailIcon?: string;
      websiteIcon?: string;
      responseTimeIcon?: string;
    };
    contactCategories?: Array<{
      name: string;
      description: string;
      color: string;
    }>;
    philosophy?: Array<{
      icon: string;
      title: string;
      description: string;
      color: string;
    }>;
    sectionTitles?: {
      experienceTitle?: string;
      skillsTitle?: string;
      interestsTitle?: string;
      contactInfoTitle?: string;
      philosophyTitle?: string;
      contactCategoryTitle?: string;
    };
  };
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

  // Get values from database
  const skills = pageContent?.sections?.skills || [];
  const interests = pageContent?.sections?.interests || [];
  const fullIntroText = pageContent?.sections?.fullIntroText || '';

  // Split intro text for display (first paragraph for preview, rest for "more")
  const textParagraphs = fullIntroText.split('\n\n').filter(p => p.trim());
  const introPreview = textParagraphs[0] || '';
  const moreContent = textParagraphs.slice(1).join('\n\n');
  const mainTitle = pageContent?.sections?.mainTitle || '개발자';
  const jobTitle = pageContent?.sections?.jobTitle || '풀스택 웹 개발자';
  const mainIcon = pageContent?.sections?.mainIcon || '👨‍💻';
  
  // Section titles
  const sectionTitles = pageContent?.sections?.sectionTitles || {};
  const experienceTitle = sectionTitles.experienceTitle || '경험 & 배경';
  const skillsTitle = sectionTitles.skillsTitle || '기술 스택';
  const interestsTitle = sectionTitles.interestsTitle || '관심사';
  const contactInfoTitle = sectionTitles.contactInfoTitle || '연락처 정보';
  const philosophyTitle = sectionTitles.philosophyTitle || '개발 철학';
  const contactCategoryTitle = sectionTitles.contactCategoryTitle || '연락 카테고리';
  const contactEmail = pageContent?.sections?.contactInfo?.email || 'your.email@example.com';
  const contactWebsite = pageContent?.sections?.contactInfo?.website || 'https://your-blog.com';
  const contactResponseTime = pageContent?.sections?.contactInfo?.responseTime || '보통 24시간 이내';
  const emailIcon = pageContent?.sections?.contactInfo?.emailIcon || '📧';
  const websiteIcon = pageContent?.sections?.contactInfo?.websiteIcon || '🌐';
  const responseTimeIcon = pageContent?.sections?.contactInfo?.responseTimeIcon || '⏰';
  
  const experience = pageContent?.sections?.experience || [];
  
  const contactCategories = pageContent?.sections?.contactCategories || [];
  
  const philosophy = pageContent?.sections?.philosophy || [];

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
        content: newContent,
        sections: pageContent?.sections
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save content');
    }

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
        content: pageContent?.content || '안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다. 🚀',
        sections: updatedSections
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save section data');
    }

    const result = await response.json();
    setPageContent(result.pageContent);
  };

  const saveSkills = async (skillsText: string) => {
    const skillsArray = skillsText.split(',').map(skill => skill.trim()).filter(skill => skill);
    await saveSectionData('skills', skillsArray);
  };

  const saveInterests = async (interestsText: string) => {
    const interestsArray = interestsText.split(',').map(interest => interest.trim()).filter(interest => interest);
    await saveSectionData('interests', interestsArray);
  };

  const saveJobTitle = async (newJobTitle: string) => {
    await saveSectionData('jobTitle', newJobTitle);
  };

  const saveFullIntroText = async (newFullIntroText: string) => {
    await saveSectionData('fullIntroText', newFullIntroText);
  };

  const saveMainTitle = async (newMainTitle: string) => {
    await saveSectionData('mainTitle', newMainTitle);
  };

  const saveMainIcon = async (newMainIcon: string) => {
    await saveSectionData('mainIcon', newMainIcon);
  };

  const saveSectionTitle = async (sectionKey: string, newTitle: string) => {
    const updatedSectionTitles = {
      ...pageContent?.sections?.sectionTitles,
      [sectionKey]: newTitle
    };
    await saveSectionData('sectionTitles', updatedSectionTitles);
  };

  const saveContactEmail = async (newEmail: string) => {
    const updatedContactInfo = {
      ...pageContent?.sections?.contactInfo,
      email: newEmail
    };
    await saveSectionData('contactInfo', updatedContactInfo);
  };

  const saveContactWebsite = async (newWebsite: string) => {
    const updatedContactInfo = {
      ...pageContent?.sections?.contactInfo,
      website: newWebsite
    };
    await saveSectionData('contactInfo', updatedContactInfo);
  };

  const saveContactResponseTime = async (newResponseTime: string) => {
    const updatedContactInfo = {
      ...pageContent?.sections?.contactInfo,
      responseTime: newResponseTime
    };
    await saveSectionData('contactInfo', updatedContactInfo);
  };

  const saveEmailIcon = async (newEmailIcon: string) => {
    const updatedContactInfo = {
      ...pageContent?.sections?.contactInfo,
      emailIcon: newEmailIcon
    };
    await saveSectionData('contactInfo', updatedContactInfo);
  };

  const saveWebsiteIcon = async (newWebsiteIcon: string) => {
    const updatedContactInfo = {
      ...pageContent?.sections?.contactInfo,
      websiteIcon: newWebsiteIcon
    };
    await saveSectionData('contactInfo', updatedContactInfo);
  };

  const saveResponseTimeIcon = async (newResponseTimeIcon: string) => {
    const updatedContactInfo = {
      ...pageContent?.sections?.contactInfo,
      responseTimeIcon: newResponseTimeIcon
    };
    await saveSectionData('contactInfo', updatedContactInfo);
  };

  const saveExperience = async (experienceText: string) => {
    // Parse experience from text format: "title1|description1|tech1,title2|description2|tech2,..."
    const experienceArray = experienceText.split(',').map((item, index) => {
      const parts = item.split('|').map(part => part.trim());
      const colors = ['blue', 'purple', 'green', 'orange', 'red', 'indigo'];
      return {
        title: parts[0] || '',
        description: parts[1] || '',
        tech: parts[2] || '',
        color: colors[index % colors.length]
      };
    }).filter(item => item.title);
    await saveSectionData('experience', experienceArray);
  };

  const saveContactCategories = async (categoriesText: string) => {
    // Parse categories from text format: "name1|description1,name2|description2,..."
    const categoriesArray = categoriesText.split(',').map((item, index) => {
      const parts = item.split('|').map(part => part.trim());
      const colors = ['blue', 'purple', 'green', 'orange', 'red', 'indigo'];
      return {
        name: parts[0] || '',
        description: parts[1] || '',
        color: colors[index % colors.length]
      };
    }).filter(item => item.name);
    await saveSectionData('contactCategories', categoriesArray);
  };

  const savePhilosophy = async (philosophyText: string) => {
    // Parse philosophy from text format: "icon1|title1|description1,icon2|title2|description2,..."
    const philosophyArray = philosophyText.split(',').map((item, index) => {
      const parts = item.split('|').map(part => part.trim());
      const colors = ['blue', 'purple', 'green', 'orange', 'red', 'indigo'];
      return {
        icon: parts[0] || '💭',
        title: parts[1] || '',
        description: parts[2] || '',
        color: colors[index % colors.length]
      };
    }).filter(item => item.title);
    await saveSectionData('philosophy', philosophyArray);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors"
          >
            ← 홈으로 돌아가기
          </Link>
          
          {isAdmin ? (
            <InlineEdit
              text={pageContent?.title || 'About Me'}
              onSave={saveTitle}
              className="mb-6"
              textClassName="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
              placeholder="제목을 입력하세요"
            />
          ) : (
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-teal-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-6">
              {pageContent?.title || 'About Me'}
            </h1>
          )}
          
          {isAdmin ? (
            <InlineEdit
              text={pageContent?.content || '안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다. 🚀'}
              onSave={saveContent}
              className="mb-12 max-w-2xl mx-auto"
              textClassName="text-xl text-gray-600 dark:text-gray-300"
              isTextarea={true}
              placeholder="내용을 입력하세요"
            />
          ) : (
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              {pageContent?.content || '안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다. 🚀'}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-12">
          {/* 소개 섹션 */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-teal-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {isAdmin ? (
                    <InlineEdit
                      text={mainIcon}
                      onSave={saveMainIcon}
                      textClassName="text-2xl"
                      placeholder="아이콘을 입력하세요"
                    />
                  ) : (
                    mainIcon
                  )}
                </div>
                <div>
                  {isAdmin ? (
                    <InlineEdit
                      text={mainTitle}
                      onSave={saveMainTitle}
                      textClassName="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1"
                      placeholder="메인 타이틀을 입력하세요"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1">{mainTitle}</h2>
                  )}
                  {isAdmin ? (
                    <InlineEdit
                      text={jobTitle}
                      onSave={saveJobTitle}
                      textClassName="text-gray-600"
                      placeholder="직업을 입력하세요"
                    />
                  ) : (
                    <p className="text-gray-600">{jobTitle}</p>
                  )}
                </div>
              </div>
              
              {isAdmin ? (
                <div className="mb-4">
                  <InlineEdit
                    text={fullIntroText}
                    onSave={saveFullIntroText}
                    textClassName="text-gray-700 leading-relaxed"
                    isTextarea={true}
                    placeholder="전체 소개 텍스트를 입력하세요 (단락은 빈 줄로 구분하세요)"
                  />
                  <p className="text-xs text-gray-400 mt-2">첫 번째 단락은 미리보기로, 나머지는 &quot;더 보기&quot;에 표시됩니다. 단락은 빈 줄로 구분하세요.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {introPreview}
                  </p>
                  
                  {showMore && moreContent && (
                    <div className="text-gray-700 leading-relaxed space-y-3 mb-4">
                      {moreContent.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {!isAdmin && moreContent && (
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                >
                  {showMore ? '접기' : '더 보기'} {showMore ? '↑' : '↓'}
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              {isAdmin ? (
                <InlineEdit
                  text={experienceTitle}
                  onSave={(newTitle) => saveSectionTitle('experienceTitle', newTitle)}
                  className="mb-6"
                  textClassName="text-xl font-bold text-gray-800"
                  placeholder="섹션 제목을 입력하세요"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{experienceTitle}</h3>
              )}
              {isAdmin ? (
                <div className="mb-4">
                  <InlineEdit
                    text={experience.map(exp => `${exp.title}|${exp.description}|${exp.tech}`).join(', ')}
                    onSave={saveExperience}
                    textClassName="text-gray-600 text-sm"
                    placeholder="경험을 입력하세요 (형식: 제목|설명|기술스택, 제목2|설명2|기술스택2)"
                    isTextarea={true}
                  />
                  <p className="text-xs text-gray-400 mt-2">형식: 제목|설명|기술스택을 쉼표로 구분해서 입력하세요</p>
                </div>
              ) : null}
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className={`border-l-4 border-${exp.color}-500 pl-4`}>
                    <h4 className="font-semibold text-gray-800">{exp.title}</h4>
                    <p className="text-gray-600 text-sm">{exp.description}</p>
                    <p className="text-gray-500 text-xs mt-1">{exp.tech}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 스킬 & 관심사 섹션 */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              {isAdmin ? (
                <InlineEdit
                  text={skillsTitle}
                  onSave={(newTitle) => saveSectionTitle('skillsTitle', newTitle)}
                  className="mb-6"
                  textClassName="text-xl font-bold text-gray-800"
                  placeholder="섹션 제목을 입력하세요"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{skillsTitle}</h3>
              )}
              {isAdmin ? (
                <div className="mb-4">
                  <InlineEdit
                    text={skills.join(', ')}
                    onSave={saveSkills}
                    textClassName="text-gray-600 text-sm"
                    placeholder="기술 스택을 쉼표로 구분해서 입력하세요 (예: JavaScript, React, Node.js)"
                    isTextarea={true}
                  />
                  <p className="text-xs text-gray-400 mt-2">쉼표(,)로 구분해서 입력하세요</p>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={skill}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      index % 3 === 0
                        ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-700'
                        : index % 3 === 1
                        ? 'bg-gradient-to-r from-teal-100 to-teal-200 text-teal-700'
                        : 'bg-gradient-to-r from-green-100 to-green-200 text-green-700'
                    }`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              {isAdmin ? (
                <InlineEdit
                  text={interestsTitle}
                  onSave={(newTitle) => saveSectionTitle('interestsTitle', newTitle)}
                  className="mb-6"
                  textClassName="text-xl font-bold text-gray-800"
                  placeholder="섹션 제목을 입력하세요"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{interestsTitle}</h3>
              )}
              {isAdmin ? (
                <div className="mb-4">
                  <InlineEdit
                    text={interests.join(', ')}
                    onSave={saveInterests}
                    textClassName="text-gray-600 text-sm"
                    placeholder="관심사를 쉼표로 구분해서 입력하세요 (예: 웹 개발, 오픈소스, 새로운 기술)"
                    isTextarea={true}
                  />
                  <p className="text-xs text-gray-400 mt-2">쉼표(,)로 구분해서 입력하세요</p>
                </div>
              ) : null}
              <div className="space-y-3">
                {interests.map((interest, index) => (
                  <div key={interest} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      index % 4 === 0 ? 'bg-indigo-500' :
                      index % 4 === 1 ? 'bg-teal-500' :
                      index % 4 === 2 ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <span className="text-gray-700">{interest}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 연락처 정보 섹션 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              {isAdmin ? (
                <InlineEdit
                  text={contactInfoTitle}
                  onSave={(newTitle) => saveSectionTitle('contactInfoTitle', newTitle)}
                  className="mb-6"
                  textClassName="text-xl font-bold text-gray-800"
                  placeholder="섹션 제목을 입력하세요"
                />
              ) : (
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">{contactInfoTitle}</h3>
              )}
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    {isAdmin ? (
                      <InlineEdit
                        text={emailIcon}
                        onSave={saveEmailIcon}
                        textClassName="text-lg"
                        placeholder="이메일 아이콘을 입력하세요"
                      />
                    ) : (
                      emailIcon
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">이메일</p>
                    {isAdmin ? (
                      <InlineEdit
                        text={contactEmail}
                        onSave={saveContactEmail}
                        textClassName="text-gray-600"
                        placeholder="이메일 주소를 입력하세요"
                      />
                    ) : (
                      <p className="text-gray-600">{contactEmail}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                    {isAdmin ? (
                      <InlineEdit
                        text={websiteIcon}
                        onSave={saveWebsiteIcon}
                        textClassName="text-lg"
                        placeholder="웹사이트 아이콘을 입력하세요"
                      />
                    ) : (
                      websiteIcon
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">웹사이트</p>
                    {isAdmin ? (
                      <InlineEdit
                        text={contactWebsite}
                        onSave={saveContactWebsite}
                        textClassName="text-gray-600"
                        placeholder="웹사이트 URL을 입력하세요"
                      />
                    ) : (
                      <p className="text-gray-600">{contactWebsite}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    {isAdmin ? (
                      <InlineEdit
                        text={responseTimeIcon}
                        onSave={saveResponseTimeIcon}
                        textClassName="text-lg"
                        placeholder="응답 시간 아이콘을 입력하세요"
                      />
                    ) : (
                      responseTimeIcon
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">응답 시간</p>
                    {isAdmin ? (
                      <InlineEdit
                        text={contactResponseTime}
                        onSave={saveContactResponseTime}
                        textClassName="text-gray-600"
                        placeholder="응답 시간을 입력하세요"
                      />
                    ) : (
                      <p className="text-gray-600">{contactResponseTime}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <Link
                href="/work"
                className="w-full block bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
              >
                작업물 보기
              </Link>
            </div>
            
            {/* 연락 카테고리 정보 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              {isAdmin ? (
                <InlineEdit
                  text={contactCategoryTitle}
                  onSave={(newTitle) => saveSectionTitle('contactCategoryTitle', newTitle)}
                  className="mb-4"
                  textClassName="text-lg font-bold text-gray-800"
                  placeholder="섹션 제목을 입력하세요"
                />
              ) : (
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">{contactCategoryTitle}</h4>
              )}
              {isAdmin ? (
                <div className="mb-4">
                  <InlineEdit
                    text={contactCategories.map(cat => `${cat.name}|${cat.description}`).join(', ')}
                    onSave={saveContactCategories}
                    textClassName="text-gray-600 text-sm"
                    placeholder="카테고리를 입력하세요 (형식: 이름|설명, 이름2|설명2)"
                    isTextarea={true}
                  />
                  <p className="text-xs text-gray-400 mt-2">형식: 이름|설명을 쉼표로 구분해서 입력하세요</p>
                </div>
              ) : null}
              <div className="space-y-3 text-sm">
                {contactCategories.map((category, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-2 h-2 bg-${category.color}-500 rounded-full`}></div>
                    <span className="text-gray-700">
                      <strong>{category.name}:</strong> {category.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          {isAdmin ? (
            <InlineEdit
              text={philosophyTitle}
              onSave={(newTitle) => saveSectionTitle('philosophyTitle', newTitle)}
              className="mb-8"
              textClassName="text-2xl font-bold text-center text-gray-800"
              placeholder="섹션 제목을 입력하세요"
            />
          ) : (
            <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">{philosophyTitle}</h3>
          )}
          {isAdmin ? (
            <div className="mb-6">
              <InlineEdit
                text={philosophy.map(item => `${item.icon}|${item.title}|${item.description}`).join(', ')}
                onSave={savePhilosophy}
                textClassName="text-gray-600 text-sm"
                placeholder="철학을 입력하세요 (형식: 아이콘|제목|설명, 아이콘2|제목2|설명2)"
                isTextarea={true}
              />
              <p className="text-xs text-gray-400 mt-2">형식: 아이콘|제목|설명을 쉼표로 구분해서 입력하세요</p>
            </div>
          ) : null}
          <div className="grid md:grid-cols-3 gap-8">
            {philosophy.map((item, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {item.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">연락하기</h3>
          
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
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
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
                className="bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-8 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:hover:shadow-lg"
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