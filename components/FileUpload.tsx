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
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');

    // 파일 크기 검증
    const sizeMB = file.size / 1024 / 1024;
    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 10 : 100;

    if (sizeMB > maxSize) {
      setUploadError(
        `파일 크기가 너무 큽니다. ${isImage ? '이미지' : '동영상/PDF/ZIP'}는 최대 ${maxSize}MB까지 업로드 가능합니다. (현재: ${sizeMB.toFixed(2)}MB)`
      );
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1단계: 서버에서 Cloudinary 서명 받기
      const timestamp = Math.round(Date.now() / 1000);
      const folder = 'blog-web';

      const paramsToSign = {
        timestamp,
        folder
      };

      const signatureResponse = await fetch('/api/cloudinary-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paramsToSign })
      });

      if (!signatureResponse.ok) {
        throw new Error('Failed to get upload signature');
      }

      const { signature, apiKey, cloudName } = await signatureResponse.json();

      // 2단계: Cloudinary에 직접 업로드
      const formData = new FormData();
      formData.append('file', file);
      formData.append('timestamp', timestamp.toString());
      formData.append('folder', folder);
      formData.append('signature', signature);
      formData.append('api_key', apiKey);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        const errorMessage = errorData.error?.message || 'Upload failed';

        // Cloudinary 에러 메시지 개선
        if (errorMessage.includes('File size too large')) {
          throw new Error(`파일 크기 제한 초과: ${isImage ? '이미지는 10MB' : '동영상/PDF/ZIP은 100MB'}까지 가능`);
        } else if (errorMessage.includes('Invalid image file')) {
          throw new Error('유효하지 않은 이미지 파일입니다.');
        } else if (errorMessage.includes('Invalid Signature')) {
          throw new Error('업로드 인증 실패. 잠시 후 다시 시도해주세요.');
        }

        throw new Error(errorMessage);
      }

      const result = await uploadResponse.json();
      onFileUpload(result.secure_url);

      // 업로드 성공 로그
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      console.log(`✅ 업로드 완료: ${file.name} (${sizeMB}MB)`);

      // Clear the input
      e.target.value = '';
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
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
          {uploading
            ? uploadProgress > 0
              ? `업로드 중... ${uploadProgress}%`
              : '업로드 중...'
            : label}
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
          지원 형식: 이미지 (10MB), 비디오/PDF/ZIP (100MB)
          <br />
          <span className="text-green-600">
            ⚡ Cloudinary 직접 업로드 - 빠르고 안전
          </span>
        </p>
      )}
    </div>
  );
}
