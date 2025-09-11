'use client';

import { useState } from 'react';

interface FileUploadProps {
  onFileUpload: (url: string) => void;
  accept?: string;
  label?: string;
  currentUrl?: string;
}

export default function FileUpload({ 
  onFileUpload, 
  accept = "image/*,video/*,.pdf,.zip", 
  label = "파일 업로드",
  currentUrl 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      onFileUpload(result.url);
      
      // Clear the input
      e.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (url?: string) => {
    if (!url) return '📁';
    
    try {
      const extension = url.split('.').pop()?.toLowerCase();
      
      switch (extension) {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'webp':
          return '🖼️';
        case 'mp4':
        case 'mov':
        case 'avi':
        case 'mkv':
          return '🎥';
        case 'pdf':
          return '📄';
        case 'zip':
          return '📦';
        default:
          return '📁';
      }
    } catch {
      return '📁';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer transition-colors">
          <span>{getFileIcon(currentUrl)}</span>
          {uploading ? '업로드 중...' : label}
          <input
            type="file"
            onChange={handleFileChange}
            accept={accept}
            disabled={uploading}
            className="hidden"
          />
        </label>
        
        {currentUrl && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>✓ 파일 업로드됨</span>
            <a 
              href={currentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
            >
              미리보기
            </a>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
      
      {!currentUrl && (
        <p className="text-xs text-gray-500">
          지원 형식: 이미지, 비디오, PDF, ZIP (최대 10MB)
        </p>
      )}
    </div>
  );
}