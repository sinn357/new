import { prisma } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

// GET - 모든 페이지 콘텐츠 또는 특정 페이지 콘텐츠 가져오기
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    
    if (page) {
      // 특정 페이지 콘텐츠 조회
      const content = await prisma.pageContent.findUnique({
        where: { page }
      });
      
      return Response.json({ content });
    } else {
      // 모든 페이지 콘텐츠 조회
      const contents = await prisma.pageContent.findMany({
        orderBy: { page: 'asc' }
      });
      
      return Response.json({ contents });
    }
  } catch (error) {
    console.error('GET /api/page-content error:', error);
    return Response.json(
      { error: 'Failed to fetch page content' },
      { status: 500 }
    );
  }
}

// POST - 새 페이지 콘텐츠 생성 (관리자만)
export async function POST(request: Request) {
  try {
    // 관리자 인증 확인
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { page, title, content, sections } = body;

    if (!page || !title || !content) {
      return Response.json(
        { error: 'Page, title, and content are required' },
        { status: 400 }
      );
    }

    const pageContent = await prisma.pageContent.create({
      data: {
        page,
        title,
        content,
        ...(sections && { sections }),
      }
    });

    return Response.json({ pageContent }, { status: 201 });
  } catch (error) {
    console.error('POST /api/page-content error:', error);
    return Response.json(
      { error: 'Failed to create page content' },
      { status: 500 }
    );
  }
}

// PUT - 페이지 콘텐츠 수정 (관리자만)
export async function PUT(request: Request) {
  try {
    // 관리자 인증 확인
    const isAdmin = await isAdminAuthenticated();
    if (!isAdmin) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { page, title, content, sections } = body;

    if (!page || !title || !content) {
      return Response.json(
        { error: 'Page, title, and content are required' },
        { status: 400 }
      );
    }

    // upsert를 사용하여 존재하면 업데이트, 없으면 생성
    const pageContent = await prisma.pageContent.upsert({
      where: { page },
      update: {
        title,
        content,
        ...(sections && { sections }),
      },
      create: {
        page,
        title,
        content,
        ...(sections && { sections }),
      }
    });

    return Response.json({ pageContent });
  } catch (error) {
    console.error('PUT /api/page-content error:', error);
    return Response.json(
      { error: 'Failed to update page content' },
      { status: 500 }
    );
  }
}