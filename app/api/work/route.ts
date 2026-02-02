import { prisma } from "@/lib/db";
import { workSchema, workDraftSchema } from '@/lib/validations/work';
import { isAdminAuthenticated } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();

    const isAdmin = await isAdminAuthenticated();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const where: { category?: string; isPublished?: boolean } = {};
    if (category) where.category = category;
    if (!isAdmin) where.isPublished = true;

    const works = await prisma.work.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return Response.json({ success: true, works });
  } catch (error) {
    console.error('Database error:', error);
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.error('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 20));

    // 데이터베이스 연결 실패 시 빈 배열 반환
    return Response.json({
      success: false,
      works: [],
      error: 'Database connection failed',
      message: 'Please configure DATABASE_URL environment variable in Vercel'
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/work - Start');

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
    const schema = body?.isPublished === false ? workDraftSchema : workSchema;
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

    console.log('Creating work with:', data);

    // 데이터베이스 연결 확인
    await prisma.$connect();

    const work = await prisma.work.create({
      data: {
        title: data.title,
        content: data.content,
        category: data.category,
        techStack: data.techStack, // Already array from Zod transform
        demoUrl: data.demoUrl || null,
        youtubeUrl: data.youtubeUrl || null,
        instagramUrl: data.instagramUrl || null,
        imageUrl: data.imageUrl || null,
        fileUrl: data.fileUrl || null,
        status: data.status,
        duration: data.duration || null,
        isPublished: data.isPublished ?? true
      }
    });

    console.log('Work created successfully:', work.id);
    return Response.json({ work }, { status: 201 });
  } catch (error) {
    console.error('POST /api/work error:', error);
    console.error('Error type:', typeof error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');

    // JSON 파싱 에러 체크
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }

    // 데이터베이스 에러 체크
    return Response.json(
      { error: "Failed to create work", details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}
