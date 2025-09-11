import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const archive = await prisma.archive.findUnique({ 
      where: { id }
    });
    
    if (!archive) {
      return Response.json(
        { error: "Archive not found" },
        { status: 404 }
      );
    }
    
    return Response.json({ archive });
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
    const archive = await prisma.archive.findUnique({ 
      where: { id }
    });
    
    if (!archive) {
      return Response.json(
        { error: "Archive not found" },
        { status: 404 }
      );
    }
    
    await prisma.archive.delete({
      where: { id }
    });
    
    return Response.json({ message: "Archive deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}