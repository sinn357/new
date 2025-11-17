import { prisma } from "@/lib/db";
import { archiveSchema } from '@/lib/validations/archive';

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

    // Zod validation
    const validated = archiveSchema.safeParse(body);

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
        fileUrl: data.fileUrl || null
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
