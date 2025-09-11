import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    await prisma.$connect();
    
    const where = category ? { category } : {};
    const archives = await prisma.archive.findMany({ 
      where,
      orderBy: { createdAt: "desc" } 
    });
    
    return Response.json({ archives });
  } catch (error) {
    console.error('Database error:', error);
    
    return Response.json({ 
      archives: [],
      error: 'Database connection failed',
      message: 'Please configure DATABASE_URL environment variable in Vercel'
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/archive - Start');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      title, 
      content, 
      category = 'writing', 
      tags = [],
      imageUrl,
      fileUrl
    } = body as { 
      title?: unknown; 
      content?: unknown; 
      category?: string; 
      tags?: string[];
      imageUrl?: string;
      fileUrl?: string;
    };

    if (typeof title !== "string" || typeof content !== "string" || 
        title.trim() === "" || content.trim() === "") {
      console.log('Validation failed:', { title: typeof title, content: typeof content });
      return Response.json(
        { error: "Title and content must be non-empty strings" },
        { status: 400 }
      );
    }

    console.log('Creating archive with:', { title: title.trim(), content: content.trim(), category, tags });
    
    await prisma.$connect();
    
    const archive = await prisma.archive.create({ 
      data: { 
        title: title.trim(), 
        content: content.trim(),
        category: category || 'writing',
        tags: Array.isArray(tags) ? tags : [],
        imageUrl: imageUrl?.trim() || null,
        fileUrl: fileUrl?.trim() || null
      } 
    });
    
    console.log('Archive created successfully:', archive.id);
    return Response.json({ archive }, { status: 201 });
  } catch (error) {
    console.error('POST /api/archive error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Failed to create archive", details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}