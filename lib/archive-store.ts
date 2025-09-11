export interface Archive {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
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
  'writing': { label: '글쓰기', color: 'bg-blue-100 text-blue-800', icon: '✍️' },
  'essay': { label: '에세이', color: 'bg-purple-100 text-purple-800', icon: '📝' },
  'review:movie': { label: '영화 리뷰', color: 'bg-red-100 text-red-800', icon: '🎬' },
  'review:book': { label: '책 리뷰', color: 'bg-green-100 text-green-800', icon: '📚' },
  'review:music': { label: '음악 리뷰', color: 'bg-yellow-100 text-yellow-800', icon: '🎵' },
  'travel': { label: '여행', color: 'bg-indigo-100 text-indigo-800', icon: '✈️' },
  'thoughts': { label: '생각', color: 'bg-gray-100 text-gray-800', icon: '💭' },
  'life': { label: '일상', color: 'bg-pink-100 text-pink-800', icon: '🌱' }
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
  category = 'writing', 
  tags = [] 
}: { 
  title: string; 
  content: string; 
  category?: string;
  tags?: string[];
}): Archive {
  const archive: Archive = {
    id: crypto.randomUUID(),
    title,
    content,
    category,
    tags,
    createdAt: new Date().toISOString()
  };
  
  archives.push(archive);
  return archive;
}

export function getArchive(id: string): Archive | undefined {
  return archives.find(archive => archive.id === id);
}