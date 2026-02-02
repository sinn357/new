import { prisma } from "@/lib/db";
import { archiveSchema, archiveDraftSchema } from '@/lib/validations/archive';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    await prisma.$connect();

    const isAdmin = await isAdminAuthenticated();
    const where: { category?: string; isPublished?: boolean } = {};
    if (category) where.category = category;
    if (!isAdmin) where.isPublished = true;
    const archives = await prisma.archive.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ success: true, archives });
  } catch (error) {
    console.error('Database error:', error);

    return Response.json({
      success: false,
      archives: [],
      error: 'Database connection failed',
      message: 'Please configure DATABASE_URL environment variable in Vercel'
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/archive - Start');

    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      console.log('Authentication failed: Not authenticated');
      return Response.json(
        { error: "Unauthorized - Admin authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Request body:', body);

    // Zod validation
    const schema = body?.isPublished === false ? archiveDraftSchema : archiveSchema;
    const validated = schema.safeParse(body);

    if (!validated.success) {
      console.log('Validation failed:', validated.error.format());
      return Response.json(
        {
          error: "Validation failed",
          details: validated.error.format()
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    console.log('Creating archive with:', data);

    await prisma.$connect();

    const archive = await prisma.archive.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        tags: data.tags, // Already array from Zod transform
        imageUrl: data.imageUrl || null,
        fileUrl: data.fileUrl || null,
        isPublished: data.isPublished ?? true
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
