// File utility functions for handling different file types

export function getFileExtension(url: string): string {
  return url.split('.').pop()?.toLowerCase() || '';
}

export function getFileName(url: string): string {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] || 'unknown-file';
}

export function isImageFile(url: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
  const extension = getFileExtension(url);
  return imageExtensions.includes(extension);
}

export function isVideoFile(url: string): boolean {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'mkv'];
  const extension = getFileExtension(url);
  return videoExtensions.includes(extension);
}

export function isAudioFile(url: string): boolean {
  const audioExtensions = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'];
  const extension = getFileExtension(url);
  return audioExtensions.includes(extension);
}

export function isPdfFile(url: string): boolean {
  return getFileExtension(url) === 'pdf';
}

export function getFileIcon(url: string): string {
  const extension = getFileExtension(url);
  
  if (isImageFile(url)) return '🖼️';
  if (isVideoFile(url)) return '🎥';
  if (isAudioFile(url)) return '🎵';
  if (isPdfFile(url)) return '📄';
  
  // Specific file type icons
  switch (extension) {
    case 'txt': return '📝';
    case 'doc':
    case 'docx': return '📄';
    case 'xls':
    case 'xlsx': return '📊';
    case 'ppt':
    case 'pptx': return '📊';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz': return '🗜️';
    case 'json': return '📋';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx': return '📜';
    case 'html':
    case 'css': return '🌐';
    case 'py': return '🐍';
    case 'java': return '☕';
    case 'cpp':
    case 'c':
    case 'h': return '⚙️';
    default: return '📎';
  }
}

export function getFileTypeLabel(url: string): string {
  const extension = getFileExtension(url);
  
  if (isImageFile(url)) return '이미지';
  if (isVideoFile(url)) return '동영상';
  if (isAudioFile(url)) return '오디오';
  if (isPdfFile(url)) return 'PDF 문서';
  
  switch (extension) {
    case 'txt': return '텍스트 파일';
    case 'doc':
    case 'docx': return 'Word 문서';
    case 'xls':
    case 'xlsx': return 'Excel 파일';
    case 'ppt':
    case 'pptx': return 'PowerPoint 파일';
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz': return '압축 파일';
    case 'json': return 'JSON 파일';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx': return 'JavaScript/TypeScript';
    case 'html': return 'HTML 파일';
    case 'css': return 'CSS 파일';
    case 'py': return 'Python 파일';
    case 'java': return 'Java 파일';
    case 'cpp':
    case 'c':
    case 'h': return 'C/C++ 파일';
    default: return `${extension.toUpperCase()} 파일`;
  }
}