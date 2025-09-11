import { prisma } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const comment = await prisma.comment.findUnique({ 
      where: { id }
    });
    
    if (!comment) {
      return Response.json(
        { error: "Comment not found" },
        { status: 404 }
      );
    }
    
    await prisma.comment.delete({
      where: { id }
    });
    
    return Response.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}