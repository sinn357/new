import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // 데이터베이스 연결 테스트
    await prisma.$connect();
    
    const works = await prisma.work.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ works });
  } catch (error) {
    console.error('Database error:', error);
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.error('DATABASE_URL prefix:', process.env.DATABASE_URL?.substring(0, 20));
    
    // 데이터베이스 연결 실패 시 빈 배열 반환
    return Response.json({ 
      works: [],
      error: 'Database connection failed',
      message: 'Please configure DATABASE_URL environment variable in Vercel'
    });
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/works - Start');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      title, 
      content, 
      techStack = [], 
      githubUrl, 
      demoUrl, 
      imageUrl, 
      status = 'completed', 
      duration 
    } = body as { 
      title?: unknown; 
      content?: unknown; 
      techStack?: string[]; 
      githubUrl?: string; 
      demoUrl?: string; 
      imageUrl?: string; 
      status?: string; 
      duration?: string; 
    };

    if (typeof title !== "string" || typeof content !== "string" || 
        title.trim() === "" || content.trim() === "") {
      console.log('Validation failed:', { title: typeof title, content: typeof content });
      return Response.json(
        { error: "Title and content must be non-empty strings" },
        { status: 400 }
      );
    }

    console.log('Creating work with:', { title: title.trim(), content: content.trim(), techStack, githubUrl, demoUrl, imageUrl, status, duration });
    
    // 데이터베이스 연결 확인
    await prisma.$connect();
    
    const work = await prisma.work.create({ 
      data: { 
        title: title.trim(), 
        content: content.trim(),
        techStack: Array.isArray(techStack) ? techStack : [],
        githubUrl: githubUrl || null,
        demoUrl: demoUrl || null,
        imageUrl: imageUrl || null,
        status: status || 'completed',
        duration: duration || null
      } 
    });
    
    console.log('Work created successfully:', work.id);
    return Response.json({ work }, { status: 201 });
  } catch (error) {
    console.error('POST /api/works error:', error);
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