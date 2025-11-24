'use client';

import { useState } from 'react';

interface InlineEditProps {
  text: string;
  onSave: (newText: string) => Promise<void>;
  className?: string;
  textClassName?: string;
  isTextarea?: boolean;
  placeholder?: string;
}

export default function InlineEdit({ 
  text, 
  onSave, 
  className = '', 
  textClassName = '',
  isTextarea = false,
  placeholder = ''
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (value !== text) {
      setIsLoading(true);
      try {
        await onSave(value);
      } catch (error) {
        console.error('Failed to save:', error);
        setValue(text); // 실패시 원래 텍스트로 되돌림
      } finally {
        setIsLoading(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setValue(text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTextarea) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey && isTextarea) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className={`relative ${className}`}>
        {isTextarea ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={`w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${textClassName}`}
            rows={3}
            placeholder={placeholder}
            disabled={isLoading}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            autoFocus
            className={`w-full p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${textClassName}`}
            placeholder={placeholder}
            disabled={isLoading}
          />
        )}
        {isTextarea && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            Ctrl+Enter로 저장
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-md">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`group relative ${className}`}>
      <div className={textClassName}>
        {text || placeholder}
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-blue-500 hover:bg-blue-600 text-white p-1 rounded-full text-xs transition-all duration-200 transform hover:scale-110"
        title="편집"
      >
        ✏️
      </button>
    </div>
  );
}