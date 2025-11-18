import React from 'react';
import ReactMarkdown from 'react-markdown';
import SpoilerBlur from '@/components/SpoilerBlur';

interface MarkdownPart {
  type: 'normal' | 'spoiler';
  content: string;
}

/**
 * [spoiler]...[/spoiler] 문법을 파싱하여 배열로 반환
 */
export function parseSpoilers(content: string): MarkdownPart[] {
  const parts: MarkdownPart[] = [];
  const regex = /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 스포일러 이전의 일반 텍스트
    if (match.index > lastIndex) {
      parts.push({
        type: 'normal',
        content: content.substring(lastIndex, match.index)
      });
    }

    // 스포일러 콘텐츠
    parts.push({
      type: 'spoiler',
      content: match[1]
    });

    lastIndex = regex.lastIndex;
  }

  // 마지막 남은 일반 텍스트
  if (lastIndex < content.length) {
    parts.push({
      type: 'normal',
      content: content.substring(lastIndex)
    });
  }

  // 스포일러가 없으면 전체를 일반 텍스트로 반환
  if (parts.length === 0) {
    parts.push({
      type: 'normal',
      content: content
    });
  }

  return parts;
}

interface RenderMarkdownWithSpoilersProps {
  content: string;
  markdownComponents?: any;
  className?: string;
}

/**
 * 스포일러를 포함한 마크다운을 렌더링
 */
export function RenderMarkdownWithSpoilers({
  content,
  markdownComponents,
  className = ''
}: RenderMarkdownWithSpoilersProps) {
  const parts = parseSpoilers(content);

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === 'spoiler') {
          return (
            <SpoilerBlur key={index}>
              <ReactMarkdown components={markdownComponents}>
                {part.content}
              </ReactMarkdown>
            </SpoilerBlur>
          );
        }

        return (
          <ReactMarkdown key={index} components={markdownComponents}>
            {part.content}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}
