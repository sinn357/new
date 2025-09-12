import { verifyPassword, getAdminPasswordHash, generateAdminToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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

    // 환경 변수에서 해시된 관리자 패스워드 가져오기
    const adminPasswordHash = getAdminPasswordHash();
    
    // bcrypt로 비밀번호 검증
    const isValid = await verifyPassword(password.trim(), adminPasswordHash);
    
    if (isValid) {
      // JWT 토큰 생성
      const token = generateAdminToken();
      
      // HTTP-only 쿠키로 토큰 설정
      const cookieStore = await cookies();
      cookieStore.set('admin-token', token, {
        httpOnly: true,     // XSS 공격 방지
        secure: process.env.NODE_ENV === 'production', // HTTPS에서만 전송
        sameSite: 'strict', // CSRF 공격 방지
        maxAge: 24 * 60 * 60, // 24시간 (초 단위)
        path: '/',
      });
      
      return Response.json({ 
        success: true, 
        message: "Admin authentication successful" 
      });
    } else {
      // 브루트포스 공격 방지를 위한 의도적 지연
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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

// 로그아웃 API 추가
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('admin-token');
    
    return Response.json({ 
      success: true, 
      message: "Logged out successfully" 
    });
  } catch (error) {
    console.error('Logout error:', error);
    
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}