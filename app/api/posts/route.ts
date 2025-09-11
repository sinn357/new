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
    console.log('POST /api/posts - Start');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, content } = body as { title?: unknown; content?: unknown };

    if (typeof title !== "string" || typeof content !== "string" || 
        title.trim() === "" || content.trim() === "") {
      console.log('Validation failed:', { title: typeof title, content: typeof content });
      return Response.json(
        { error: "Title and content must be non-empty strings" },
        { status: 400 }
      );
    }

    console.log('Creating post with:', { title: title.trim(), content: content.trim() });
    
    // 데이터베이스 연결 확인
    await prisma.$connect();
    
    const post = await prisma.post.create({ 
      data: { title: title.trim(), content: content.trim() } 
    });
    
    console.log('Post created successfully:', post.id);
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/posts error:', error);
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
      { error: "Failed to create post", details: error instanceof Error ? error.message : 'Database error' },
      { status: 500 }
    );
  }
}