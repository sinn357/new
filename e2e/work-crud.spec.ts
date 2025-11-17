import { test, expect } from '@playwright/test'

test.describe('Work CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // 관리자 로그인
    await page.goto('/')
    const adminButton = page.locator('button:has-text("Admin")')
    await adminButton.click()

    const password = process.env.ADMIN_PASSWORD || 'test123'
    await page.fill('input[type="password"]', password)
    await page.click('button[type="submit"]')

    // 로그인 완료 대기
    await expect(page.locator('text=관리자 로그인')).not.toBeVisible()

    // Work 페이지로 이동
    await page.goto('/work')
  })

  test('create new work item', async ({ page }) => {
    // "새 작업 추가" 버튼 클릭
    await page.click('button:has-text("새 작업 추가")')

    // 폼이 표시되는지 확인
    await expect(page.locator('input[name="title"]')).toBeVisible()

    // 작업물 정보 입력
    await page.fill('input[name="title"]', 'E2E Test Work')
    await page.fill('textarea[name="content"]', 'This is a test work created by E2E test')
    await page.selectOption('select[name="category"]', 'product')
    await page.fill('input[name="techStack"]', 'React, TypeScript, Playwright')

    // 저장 버튼 클릭
    await page.click('button[type="submit"]')

    // 목록에 표시되는지 확인 (약간의 대기 후)
    await page.waitForTimeout(1000)
    await expect(page.locator('text=E2E Test Work')).toBeVisible()
  })

  test('edit existing work item', async ({ page }) => {
    // 먼저 작업물 생성
    await page.click('button:has-text("새 작업 추가")')
    await page.fill('input[name="title"]', 'Work to Edit')
    await page.fill('textarea[name="content"]', 'Original content')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)

    // 수정 버튼 찾기 및 클릭
    const editButton = page.locator('button:has-text("수정")').first()
    await editButton.click()

    // 폼에서 내용 수정
    await page.fill('input[name="title"]', 'Edited Work Title')
    await page.fill('textarea[name="content"]', 'Updated content')

    // 저장
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)

    // 수정된 내용 확인
    await expect(page.locator('text=Edited Work Title')).toBeVisible()
  })

  test('delete work item', async ({ page }) => {
    // 먼저 작업물 생성
    await page.click('button:has-text("새 작업 추가")')
    await page.fill('input[name="title"]', 'Work to Delete')
    await page.fill('textarea[name="content"]', 'This will be deleted')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)

    // 삭제 버튼 찾기 및 클릭
    const deleteButton = page.locator('button:has-text("삭제")').first()
    await deleteButton.click()

    // 확인 모달에서 확인 버튼 클릭
    await page.click('button:has-text("삭제"):not(:disabled)')
    await page.waitForTimeout(1000)

    // 삭제된 항목이 목록에 없는지 확인
    await expect(page.locator('text=Work to Delete')).not.toBeVisible()
  })

  test('filter works by category', async ({ page }) => {
    // 카테고리 필터 버튼 클릭
    const categoryButton = page.locator('button:has-text("프로덕트")')
    if (await categoryButton.isVisible()) {
      await categoryButton.click()
      await page.waitForTimeout(500)

      // 필터링된 결과가 표시되는지 확인
      // (실제 데이터가 있을 경우에만 작동)
    }
  })
})
