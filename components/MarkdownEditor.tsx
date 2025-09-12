'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "마크다운으로 내용을 작성해보세요...",
  rows = 10 
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'edit'
              ? 'border-blue-500 text-blue-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          ✏️ 편집
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'preview'
              ? 'border-blue-500 text-blue-600 bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          👀 미리보기
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[300px] border border-t-0 border-gray-300 rounded-b-lg">
        {activeTab === 'edit' ? (
          <div className="relative">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="w-full p-4 border-none resize-none outline-none rounded-b-lg font-mono text-sm"
              style={{ minHeight: '300px' }}
            />
            <div className="absolute top-2 right-2 text-xs text-gray-400">
              마크다운 지원
            </div>
          </div>
        ) : (
          <div className="p-4 min-h-[300px] bg-white rounded-b-lg">
            {value.trim() ? (
              <div className="prose max-w-none">
                <ReactMarkdown
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      
                      return !inline && language ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={language}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-bold text-gray-900 mb-4 border-b pb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-2xl font-semibold text-gray-800 mb-3 mt-8">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside mb-4 text-gray-700 space-y-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside mb-4 text-gray-700 space-y-2">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="ml-4">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic">
                        {children}
                      </blockquote>
                    ),
                    a: ({ href, children }) => (
                      <a 
                        href={href} 
                        className="text-blue-600 hover:text-blue-700 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    ),
                    img: ({ src, alt }: any) => (
                      <img 
                        src={src} 
                        alt={alt}
                        className="max-w-full h-auto rounded-lg shadow-md mb-4"
                      />
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto mb-4">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>
                    ),
                    th: ({ children }) => (
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-b border-gray-200">
                        {children}
                      </td>
                    )
                  }}
                >
                  {value}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                미리보기할 내용이 없습니다
              </div>
            )}
          </div>
        )}
      </div>

      {/* Markdown Help */}
      {activeTab === 'edit' && (
        <div className="mt-2 text-xs text-gray-500">
          <details className="cursor-pointer">
            <summary className="hover:text-gray-700">마크다운 사용법</summary>
            <div className="mt-2 p-3 bg-gray-50 rounded border text-xs space-y-1">
              <div><strong>제목:</strong> # H1, ## H2, ### H3</div>
              <div><strong>강조:</strong> **굵게**, *기울임*</div>
              <div><strong>링크:</strong> [텍스트](URL)</div>
              <div><strong>이미지:</strong> ![alt텍스트](이미지URL)</div>
              <div><strong>목록:</strong> - 또는 1. 사용</div>
              <div><strong>인용:</strong> &gt; 인용문</div>
              <div><strong>코드:</strong> `인라인코드` 또는 ```언어명</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}