export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const posts: Post[] = [];

export function listPosts(): Post[] {
  return [...posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createPost({ title, content }: { title: string; content: string }): Post {
  const post: Post = {
    id: crypto.randomUUID(),
    title,
    content,
    createdAt: new Date().toISOString()
  };
  
  posts.push(post);
  return post;
}

export function getPost(id: string): Post | undefined {
  return posts.find(post => post.id === id);
}