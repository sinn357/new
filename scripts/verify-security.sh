#!/bin/bash

# 보안 시스템 검증 스크립트
echo "🔒 보안 시스템 검증 시작..."
echo "================================"

# 1. bcrypt 해시화 확인
echo "✅ 1. bcrypt 해시화 확인:"
if grep -q "bcrypt.hash" lib/auth.ts; then
    echo "   ✓ bcrypt 해시화 구현됨"
else
    echo "   ✗ bcrypt 해시화 미구현"
fi

# 2. Salt Rounds 12 확인
echo "✅ 2. Salt Rounds 12 확인:"
if grep -q "SALT_ROUNDS = 12" lib/auth.ts; then
    echo "   ✓ Salt Rounds 12로 설정됨"
else
    echo "   ✗ Salt Rounds 설정 확인 필요"
fi

# 3. 브루트포스 방지 (1초 지연) 확인
echo "✅ 3. 브루트포스 방지 확인:"
if grep -q "setTimeout.*1000" app/api/admin/auth/route.ts; then
    echo "   ✓ 1초 지연 구현됨"
else
    echo "   ✗ 브루트포스 방지 미구현"
fi

# 4. 환경변수 해시 관리 확인
echo "✅ 4. 환경변수 해시 관리:"
if [ -f ".env.local" ] && grep -q "ADMIN_PASSWORD_HASH" .env.local; then
    echo "   ✓ 환경변수에 해시 저장됨"
else
    echo "   ✗ 환경변수 설정 확인 필요"
fi

# 5. JWT 토큰 시스템 확인
echo "✅ 5. JWT 토큰 시스템:"
if grep -q "generateAdminToken" app/api/admin/auth/route.ts; then
    echo "   ✓ JWT 토큰 생성 구현됨"
else
    echo "   ✗ JWT 토큰 시스템 미구현"
fi

# 6. HTTP-only 쿠키 확인
echo "✅ 6. HTTP-only 쿠키:"
if grep -q "httpOnly: true" app/api/admin/auth/route.ts; then
    echo "   ✓ HTTP-only 쿠키 설정됨"
else
    echo "   ✗ HTTP-only 쿠키 미설정"
fi

# 7. CSRF 방지 확인
echo "✅ 7. CSRF 방지:"
if grep -q "sameSite: 'strict'" app/api/admin/auth/route.ts; then
    echo "   ✓ SameSite=strict 설정됨"
else
    echo "   ✗ CSRF 방지 설정 확인 필요"
fi

# 8. 은밀한 관리자 UI 확인
echo "✅ 8. 은밀한 관리자 UI:"
if grep -q "fixed bottom-4 right-4" components/AdminButton.tsx; then
    echo "   ✓ 관리자 버튼 하단 우측 고정됨"
else
    echo "   ✗ 관리자 UI 위치 확인 필요"
fi

echo "================================"
echo "🎉 보안 시스템 검증 완료!"
echo ""
echo "📋 직접 테스트 방법:"
echo "1. npm run dev"
echo "2. http://localhost:3000 접속"
echo "3. 하단 우측 ⚙ 버튼 클릭"
echo "4. 비밀번호: Ss5327390@"