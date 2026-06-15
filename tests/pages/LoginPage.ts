import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly fullNameInput: Locator
  readonly submitButton: Locator
  readonly toggleModeButton: Locator
  readonly errorMessage: Locator
  readonly successMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByTestId('input-email')
    this.passwordInput = page.getByTestId('input-password')
    this.fullNameInput = page.getByTestId('input-fullname')
    this.submitButton = page.getByTestId('btn-submit')
    this.toggleModeButton = page.getByTestId('btn-toggle-mode')
    this.errorMessage = page.getByTestId('error-message')
    this.successMessage = page.getByTestId('success-message')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async register(fullName: string, email: string, password: string) {
    await this.toggleModeButton.click()
    await this.fullNameInput.fill(fullName)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}