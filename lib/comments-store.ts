export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  createdAt: string;
}

const comments: Comment[] = [];

export function listComments(postId: string): Comment[] {
  return comments
    .filter(comment => comment.postId === postId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createComment({ postId, author, content }: { postId: string; author: string; content: string }): Comment {
  const comment: Comment = {
    id: crypto.randomUUID(),
    postId,
    author,
    content,
    createdAt: new Date().toISOString()
  };
  
  comments.push(comment);
  return comment;
}