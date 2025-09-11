export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body as { password?: unknown };

    if (typeof password !== "string" || password.trim() === "") {
      return Response.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    // 환경 변수에서 관리자 패스워드 가져오기
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"; // 기본값 설정
    
    if (password.trim() === adminPassword) {
      return Response.json({ 
        success: true, 
        message: "Admin authentication successful" 
      });
    } else {
      return Response.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid JSON format" },
        { status: 400 }
      );
    }
    
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}