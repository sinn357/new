import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return Response.json(
      { error: "postId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ comments });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, author, content } = body as { 
      postId?: unknown; 
      author?: unknown; 
      content?: unknown; 
    };

    if (typeof postId !== "string" || typeof author !== "string" || typeof content !== "string" ||
        postId.trim() === "" || author.trim() === "" || content.trim() === "") {
      return Response.json(
        { error: "postId, author, and content must be non-empty strings" },
        { status: 400 }
      );
    }

    // Check if post exists (more efficient than count)
    const post = await prisma.post.findUnique({ 
      where: { id: postId.trim() },
      select: { id: true }
    });
    
    if (!post) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: { 
        postId: postId.trim(), 
        author: author.trim(), 
        content: content.trim() 
      },
    });
    
    return Response.json({ comment }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid JSON" },
        { status: 400 }
      );
    }
    
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}