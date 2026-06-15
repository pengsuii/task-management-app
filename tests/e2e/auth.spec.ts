import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'

const TEST_EMAIL = 'rizkifaizal125@gmail.com'
const TEST_PASSWORD = 'cdmeledak12'

test.describe('Authentication', () => {

  test.describe('Login', () => {
    test('TC-AUTH-001: should display login form correctly', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await expect(page.getByTestId('auth-card')).toBeVisible()
      await expect(loginPage.emailInput).toBeVisible()
      await expect(loginPage.passwordInput).toBeVisible()
      await expect(loginPage.submitButton).toBeVisible()
      await expect(loginPage.toggleModeButton).toBeVisible()
    })

    test('TC-AUTH-002: should show error when email and password are empty', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.submitButton.click()
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.errorMessage).toContainText('Email dan password wajib diisi')
    })

    test('TC-AUTH-003: should show error with wrong credentials', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.login('wrong@email.com', 'wrongpassword')
      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.errorMessage).toContainText('Email atau password salah')
    })

    test('TC-AUTH-004: should login successfully with valid credentials', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.login(TEST_EMAIL, TEST_PASSWORD)
      await expect(page).toHaveURL('/dashboard')
      await expect(page.getByTestId('dashboard-page')).toBeVisible()
    })

    test('TC-AUTH-005: should redirect to dashboard if already logged in', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD)
      await expect(page).toHaveURL('/dashboard')

      await page.goto('/login')
      await expect(page).toHaveURL('/dashboard')
    })
  })

  test.describe('Register', () => {
    test('TC-AUTH-006: should toggle to register form', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.toggleModeButton.click()
      await expect(loginPage.fullNameInput).toBeVisible()
      await expect(loginPage.submitButton).toContainText('Create Account')
    })

    test('TC-AUTH-007: should show error when full name is empty on register', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.toggleModeButton.click()
      await loginPage.emailInput.fill('test@email.com')
      await loginPage.passwordInput.fill('password123')
      await loginPage.submitButton.click()

      await expect(loginPage.errorMessage).toBeVisible()
      await expect(loginPage.errorMessage).toContainText('Nama lengkap wajib diisi')
    })

    test('TC-AUTH-008: should show error when fields are empty on register', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()

      await loginPage.toggleModeButton.click()
      await loginPage.submitButton.click()

      await expect(loginPage.errorMessage).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('TC-AUTH-009: should logout successfully', async ({ page }) => {
      const loginPage = new LoginPage(page)
      await loginPage.goto()
      await loginPage.login(TEST_EMAIL, TEST_PASSWORD)
      await expect(page).toHaveURL('/dashboard')

      await page.getByTestId('btn-logout').click()
      await expect(page).toHaveURL('/login')
    })

    test('TC-AUTH-010: should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/dashboard')
      await expect(page).toHaveURL('/login')
    })
  })
})