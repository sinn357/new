'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function About() {
  const [showMore, setShowMore] = useState(false);

  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express',
    'Python', 'PostgreSQL', 'MongoDB', 'Prisma', 'Git', 'Docker'
  ];

  const interests = [
    '웹 개발', '오픈소스', '새로운 기술', '문제 해결', '팀워크', '지식 공유'
  ];

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
            About Me
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            안녕하세요! 개발과 지식 공유를 사랑하는 개발자입니다. 🚀
          </p>
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

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">연락하기</h3>
              <p className="text-gray-600 mb-6">
                프로젝트 협업이나 기술적인 이야기를 나누고 싶으시면 언제든 연락주세요!
              </p>
              
              <div className="flex gap-4">
                <Link
                  href="/contact"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center"
                >
                  연락하기
                </Link>
                <Link
                  href="/posts"
                  className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-6 rounded-lg font-medium transition-all duration-300 hover:bg-gray-50 text-center"
                >
                  포스트 보기
                </Link>
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
      </div>
    </div>
  );
}