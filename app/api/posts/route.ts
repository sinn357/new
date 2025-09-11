import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    
    const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ posts });
  } catch (error) {
    console.error('Database error:', error);
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.error('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 20));
    
    // 데이터베이스 연결 실패 시 빈 배열 반환
    return Response.json({ 
      posts: [],
      error: 'Database connection failed',
      message: 'Please configure DATABASE_URL environment variable in Vercel'
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content } = body as { title?: unknown; content?: unknown };

    if (typeof title !== "string" || typeof content !== "string" || 
        title.trim() === "" || content.trim() === "") {
      return Response.json(
        { error: "Title and content must be non-empty strings" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({ 
      data: { title: title.trim(), content: content.trim() } 
    });
    return Response.json({ post }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }
}