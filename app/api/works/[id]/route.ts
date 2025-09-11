import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const work = await prisma.work.findUnique({ 
      where: { id }
    });
    
    if (!work) {
      return Response.json(
        { error: "Work not found" },
        { status: 404 }
      );
    }
    
    return Response.json({ work });
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
    const work = await prisma.work.findUnique({ 
      where: { id }
    });
    
    if (!work) {
      return Response.json(
        { error: "Work not found" },
        { status: 404 }
      );
    }
    
    await prisma.work.delete({
      where: { id }
    });
    
    return Response.json({ message: "Work deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}