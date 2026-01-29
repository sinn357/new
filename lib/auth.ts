import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SALT_ROUNDS = 12; // 높은 보안을 위한 강력한 해싱

// ===== Rate Limiting 설정 =====
const MAX_LOGIN_ATTEMPTS = 5; // 최대 로그인 시도 횟수
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15분 (밀리초)

// 메모리 기반 Rate Limiting (프로덕션에서는 Redis 권장)
interface LoginAttempt {
  count: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

const loginAttempts = new Map<string, LoginAttempt>();

/**
 * Rate Limiting 체크 - IP 기반
 */
export function checkRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt) {
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null };
  }

  // 잠금 상태 확인
  if (attempt.lockedUntil && now < attempt.lockedUntil) {
    return { allowed: false, remainingAttempts: 0, lockedUntil: attempt.lockedUntil };
  }

  // 잠금 해제 또는 오래된 시도 초기화
  if (attempt.lockedUntil && now >= attempt.lockedUntil) {
    loginAttempts.delete(identifier);
    return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS, lockedUntil: null };
  }

  return {
    allowed: attempt.count < MAX_LOGIN_ATTEMPTS,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - attempt.count,
    lockedUntil: null
  };
}

/**
 * 로그인 실패 기록
 */
export function recordFailedAttempt(identifier: string): { locked: boolean; lockedUntil: number | null } {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier) || { count: 0, lastAttempt: now, lockedUntil: null };

  attempt.count += 1;
  attempt.lastAttempt = now;

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.lockedUntil = now + LOCKOUT_DURATION;
    loginAttempts.set(identifier, attempt);
    return { locked: true, lockedUntil: attempt.lockedUntil };
  }

  loginAttempts.set(identifier, attempt);
  return { locked: false, lockedUntil: null };
}

/**
 * 로그인 성공 시 시도 기록 초기화
 */
export function clearLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * 비밀번호를 해시화합니다
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * 입력된 비밀번호와 해시된 비밀번호를 비교합니다
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * 환경변수에서 관리자 이메일을 가져옵니다
 */
export function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error('ADMIN_EMAIL environment variable is not set');
  }
  return email;
}

/**
 * 환경변수에서 해시된 관리자 비밀번호를 가져옵니다
 */
export function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    throw new Error('ADMIN_PASSWORD_HASH environment variable is not set');
  }
  return hash;
}

/**
 * 관리자 이메일 검증
 */
export function verifyAdminEmail(email: string): boolean {
  const adminEmail = getAdminEmail();
  return email.toLowerCase().trim() === adminEmail.toLowerCase().trim();
}

/**
 * JWT 시크릿키를 가져옵니다
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * 관리자 JWT 토큰을 생성합니다
 */
export function generateAdminToken(): string {
  const payload = {
    role: 'admin',
    iat: Math.floor(Date.now() / 1000),
  };
  
  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: '24h', // 24시간 유효
  });
}

/**
 * JWT payload 타입 정의
 */
interface JWTPayload {
  role: string;
  iat: number;
  exp: number;
}

/**
 * JWT 토큰을 검증하고 payload를 반환합니다
 */
export function verifyToken(token: string): { role: string; iat: number } | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as JWTPayload;
    return { role: decoded.role, iat: decoded.iat };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * 현재 요청에서 관리자 인증 상태를 확인합니다
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token');
    
    if (!token) return false;
    
    const decoded = verifyToken(token.value);
    return decoded?.role === 'admin';
  } catch (error) {
    console.error('Admin auth check failed:', error);
    return false;
  }
}