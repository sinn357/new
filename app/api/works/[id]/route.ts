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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const body = await request.json();
    const { 
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
      duration 
    } = body;

    if (!title?.trim() || !content?.trim()) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const work = await prisma.work.findUnique({ 
      where: { id }
    });
    
    if (!work) {
      return Response.json(
        { error: "Work not found" },
        { status: 404 }
      );
    }
    
    const updatedWork = await prisma.work.update({
      where: { id },
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
        techStack: techStack || [],
        githubUrl: githubUrl?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        youtubeUrl: youtubeUrl?.trim() || null,
        instagramUrl: instagramUrl?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        status: status || 'completed',
        duration: duration?.trim() || null
      }
    });
    
    return Response.json({ work: updatedWork });
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