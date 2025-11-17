import { test, expect } from '@playwright/test'

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays login modal when admin button clicked', async ({ page }) => {
    // 관리자 버튼 찾기 (우측 하단 버튼)
    const adminButton = page.locator('button:has-text("Admin")')
    await adminButton.click()

    // 로그인 모달이 표시되는지 확인
    await expect(page.locator('text=관리자 로그인')).toBeVisible()
  })

  test('shows error for incorrect password', async ({ page }) => {
    // 관리자 버튼 클릭
    const adminButton = page.locator('button:has-text("Admin")')
    await adminButton.click()

    // 잘못된 비밀번호 입력
    await page.fill('input[type="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // 에러 메시지 확인
    await expect(page.locator('text=비밀번호가 올바르지 않습니다')).toBeVisible()
  })

  test('allows admin login with correct password', async ({ page }) => {
    // 관리자 버튼 클릭
    const adminButton = page.locator('button:has-text("Admin")')
    await adminButton.click()

    // 올바른 비밀번호 입력 (환경변수에서 가져오거나 테스트용 비밀번호)
    const password = process.env.ADMIN_PASSWORD || 'test123'
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')

    // 모달이 닫히고 관리자 기능이 활성화되었는지 확인
    await expect(page.locator('text=관리자 로그인')).not.toBeVisible()

    // Work 페이지로 이동
    await page.goto('/work')

    // 관리자 전용 버튼이 보이는지 확인
    await expect(page.locator('button:has-text("새 작업 추가")')).toBeVisible()
  })

  test('allows admin logout', async ({ page }) => {
    // 먼저 로그인
    const adminButton = page.locator('button:has-text("Admin")')
    await adminButton.click()

    const password = process.env.ADMIN_PASSWORD || 'test123'
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')

    // 로그인 성공 확인
    await expect(page.locator('text=관리자 로그인')).not.toBeVisible()

    // 로그아웃 버튼 클릭
    await adminButton.click()
    const logoutButton = page.locator('button:has-text("로그아웃")')
    await logoutButton.click()

    // Work 페이지로 이동
    await page.goto('/work')

    // 관리자 전용 버튼이 보이지 않는지 확인
    await expect(page.locator('button:has-text("새 작업 추가")')).not.toBeVisible()
  })
})
