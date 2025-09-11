import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const post = await prisma.post.findUnique({ 
      where: { id },
      include: { comments: true }
    });
    
    if (!post) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    return Response.json({ post });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const post = await prisma.post.findUnique({ 
      where: { id }
    });
    
    if (!post) {
      return Response.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    await prisma.post.delete({
      where: { id }
    });
    
    return Response.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}