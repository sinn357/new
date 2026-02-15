export interface Work {
  id: string;
  title: string;
  content: string;
  category: 'product' | 'media' | 'photography';
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  imageUrl?: string;
  fileUrl?: string;
  status: 'completed' | 'in-progress' | 'planned';
  duration?: string;
  isPublished: boolean;
  createdAt: string;
}

export const WORK_CATEGORIES = {
  'product': { label: 'Product', color: 'bg-blue-100 text-blue-800', icon: '💻' },
  'media': { label: 'Media', color: 'bg-red-100 text-red-800', icon: '🎥' },
  'photography': { label: 'Photography', color: 'bg-green-100 text-green-800', icon: '📸' }
} as const;

export type WorkCategory = keyof typeof WORK_CATEGORIES;

const works: Work[] = [];

export function listWorks(): Work[] {
  return [...works].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function listWorksByCategory(category?: string): Work[] {
  const allWorks = listWorks();
  if (!category) return allWorks;
  return allWorks.filter(work => work.category === category);
}

export function createWork({ 
  title, 
  content, 
  category = 'product',
  techStack = [], 
  githubUrl, 
  demoUrl, 
  youtubeUrl,
  instagramUrl,
  imageUrl, 
  fileUrl,
  status = 'completed', 
  duration,
  isPublished = true
}: { 
  title: string; 
  content: string; 
  category?: WorkCategory;
  techStack?: string[];
  githubUrl?: string;
  demoUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  imageUrl?: string;
  fileUrl?: string;
  status?: 'completed' | 'in-progress' | 'planned';
  duration?: string;
  isPublished?: boolean;
}): Work {
  const work: Work = {
    id: crypto.randomUUID(),
    title,
    content,
    category,
    techStack,
    githubUrl,
    demoUrl,
    youtubeUrl,
    instagramUrl,
    imageUrl,
    fileUrl,
    status,
    duration,
    isPublished,
    createdAt: new Date().toISOString()
  };
  
  works.push(work);
  return work;
}

export function getWork(id: string): Work | undefined {
  return works.find(work => work.id === id);
}
