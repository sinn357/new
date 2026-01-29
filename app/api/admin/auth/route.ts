import {
  verifyPassword,
  getAdminPasswordHash,
  generateAdminToken,
  verifyAdminEmail,
  checkRateLimit,
  recordFailedAttempt,
  clearLoginAttempts
} from '@/lib/auth';
import { cookies, headers } from 'next/headers';

/**
 * 클라이언트 IP 주소 가져오기
 */
async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
}

export async function POST(request: Request) {
  try {
    const clientIP = await getClientIP();

    // Rate Limiting 체크
    const rateLimit = checkRateLimit(clientIP);
    if (!rateLimit.allowed) {
      const remainingTime = rateLimit.lockedUntil
        ? Math.ceil((rateLimit.lockedUntil - Date.now()) / 1000 / 60)
        : 15;

      console.warn(`[Auth] Rate limit exceeded for IP: ${clientIP}`);

      return Response.json(
        {
          error: "Too many login attempts",
          message: `너무 많은 로그인 시도입니다. ${remainingTime}분 후에 다시 시도해주세요.`,
          lockedUntil: rateLimit.lockedUntil
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body as { email?: unknown; password?: unknown };

    // 이메일 검증
    if (typeof email !== "string" || email.trim() === "") {
      return Response.json(
        { error: "Email is required", message: "이메일을 입력해주세요." },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    if (typeof password !== "string" || password.trim() === "") {
      return Response.json(
        { error: "Password is required", message: "비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    // 관리자 이메일 검증
    const isValidEmail = verifyAdminEmail(email.trim());
    if (!isValidEmail) {
      // 브루트포스 공격 방지를 위한 의도적 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { locked, lockedUntil } = recordFailedAttempt(clientIP);
      const remaining = rateLimit.remainingAttempts - 1;

      console.warn(`[Auth] Invalid email attempt from IP: ${clientIP}, email: ${email}`);

      if (locked) {
        return Response.json(
          {
            error: "Account locked",
            message: "로그인 시도 횟수를 초과했습니다. 15분 후에 다시 시도해주세요.",
            lockedUntil
          },
          { status: 429 }
        );
      }

      return Response.json(
        {
          error: "Invalid credentials",
          message: `이메일 또는 비밀번호가 올바르지 않습니다. (남은 시도: ${remaining}회)`,
          remainingAttempts: remaining
        },
        { status: 401 }
      );
    }

    // 환경 변수에서 해시된 관리자 패스워드 가져오기
    const adminPasswordHash = getAdminPasswordHash();

    // bcrypt로 비밀번호 검증
    const isValidPassword = await verifyPassword(password.trim(), adminPasswordHash);

    if (isValidPassword) {
      // 로그인 성공 - 시도 기록 초기화
      clearLoginAttempts(clientIP);

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

      console.log(`[Auth] Successful login from IP: ${clientIP}`);

      return Response.json({
        success: true,
        message: "Admin authentication successful"
      });
    } else {
      // 브루트포스 공격 방지를 위한 의도적 지연
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { locked, lockedUntil } = recordFailedAttempt(clientIP);
      const remaining = rateLimit.remainingAttempts - 1;

      console.warn(`[Auth] Invalid password attempt from IP: ${clientIP}`);

      if (locked) {
        return Response.json(
          {
            error: "Account locked",
            message: "로그인 시도 횟수를 초과했습니다. 15분 후에 다시 시도해주세요.",
            lockedUntil
          },
          { status: 429 }
        );
      }

      return Response.json(
        {
          error: "Invalid credentials",
          message: `이메일 또는 비밀번호가 올바르지 않습니다. (남은 시도: ${remaining}회)`,
          remainingAttempts: remaining
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin auth error:', error);

    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid JSON format", message: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    return Response.json(
      { error: "Internal server error", message: "서버 오류가 발생했습니다." },
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