export interface Archive {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  fileUrl?: string;
  isPublished: boolean;
  createdAt: string;
}

export interface ArchiveComment {
  id: string;
  archiveId: string;
  author: string;
  content: string;
  createdAt: string;
}

export const ARCHIVE_CATEGORIES = {
  'business': { label: '비즈니스', color: 'bg-blue-100 text-blue-800', icon: '💼' },
  'essay': { label: '에세이', color: 'bg-purple-100 text-purple-800', icon: '📝' },
  'movie': { label: '영화', color: 'bg-red-100 text-red-800', icon: '🎬' },
  'book': { label: '책', color: 'bg-green-100 text-green-800', icon: '📚' },
  'music': { label: '음악', color: 'bg-yellow-100 text-yellow-800', icon: '🎵' },
  'anime': { label: '애니', color: 'bg-indigo-100 text-indigo-800', icon: '🎭' },
  'comics': { label: '코믹스', color: 'bg-orange-100 text-orange-800', icon: '📖' },
  'product': { label: '제품', color: 'bg-teal-100 text-teal-800', icon: '📱' },
  'food': { label: '음식', color: 'bg-amber-100 text-amber-800', icon: '🍽️' },
  'game': { label: '게임', color: 'bg-cyan-100 text-cyan-800', icon: '🎮' },
  'drama': { label: '드라마', color: 'bg-pink-100 text-pink-800', icon: '📺' }
} as const;

export type ArchiveCategory = keyof typeof ARCHIVE_CATEGORIES;

const archives: Archive[] = [];

export function listArchives(): Archive[] {
  return [...archives].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listArchivesByCategory(category?: string): Archive[] {
  const allArchives = listArchives();
  if (!category) return allArchives;
  return allArchives.filter(archive => archive.category === category);
}

export function createArchive({ 
  title, 
  content, 
  category = 'business', 
  tags = [],
  isPublished = true
}: { 
  title: string; 
  content: string; 
  category?: string;
  tags?: string[];
  isPublished?: boolean;
}): Archive {
  const archive: Archive = {
    id: crypto.randomUUID(),
    title,
    content,
    category,
    tags,
    isPublished,
    createdAt: new Date().toISOString()
  };
  
  archives.push(archive);
  return archive;
}

export function getArchive(id: string): Archive | undefined {
  return archives.find(archive => archive.id === id);
}
