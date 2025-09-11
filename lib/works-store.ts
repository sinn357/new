export interface Work {
  id: string;
  title: string;
  content: string;
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  status: 'completed' | 'in-progress' | 'planned';
  duration?: string;
  createdAt: string;
}

const works: Work[] = [];

export function listWorks(): Work[] {
  return [...works].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createWork({ 
  title, 
  content, 
  techStack = [], 
  githubUrl, 
  demoUrl, 
  imageUrl, 
  status = 'completed', 
  duration 
}: { 
  title: string; 
  content: string; 
  techStack?: string[];
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  status?: 'completed' | 'in-progress' | 'planned';
  duration?: string;
}): Work {
  const work: Work = {
    id: crypto.randomUUID(),
    title,
    content,
    techStack,
    githubUrl,
    demoUrl,
    imageUrl,
    status,
    duration,
    createdAt: new Date().toISOString()
  };
  
  works.push(work);
  return work;
}

export function getWork(id: string): Work | undefined {
  return works.find(work => work.id === id);
}