import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SALT_ROUNDS = 12; // 높은 보안을 위한 강력한 해싱

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
 * JWT 토큰을 검증하고 payload를 반환합니다
 */
export function verifyToken(token: string): { role: string; iat: number } | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as any;
    return decoded;
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