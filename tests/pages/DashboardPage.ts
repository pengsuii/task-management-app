import { Page, Locator } from '@playwright/test'

export class DashboardPage {
  readonly page: Page
  readonly addTaskButton: Locator
  readonly searchInput: Locator
  readonly taskList: Locator
  readonly emptyState: Locator
  readonly logoutButton: Locator
  readonly taskModal: Locator
  readonly modalTitleInput: Locator
  readonly modalDescriptionInput: Locator
  readonly modalStatusSelect: Locator
  readonly modalPrioritySelect: Locator
  readonly modalDueDateInput: Locator
  readonly modalSaveButton: Locator
  readonly modalCancelButton: Locator
  readonly modalError: Locator
  readonly deleteModal: Locator
  readonly deleteConfirmButton: Locator
  readonly deleteCancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addTaskButton = page.getByTestId('btn-add-task')
    this.searchInput = page.getByTestId('input-search')
    this.taskList = page.getByTestId('task-list')
    this.emptyState = page.getByTestId('empty-state')
    this.logoutButton = page.getByTestId('btn-logout')
    this.taskModal = page.getByTestId('task-modal')
    this.modalTitleInput = page.getByTestId('modal-input-title')
    this.modalDescriptionInput = page.getByTestId('modal-input-description')
    this.modalStatusSelect = page.getByTestId('modal-select-status')
    this.modalPrioritySelect = page.getByTestId('modal-select-priority')
    this.modalDueDateInput = page.getByTestId('modal-input-due-date')
    this.modalSaveButton = page.getByTestId('modal-btn-save')
    this.modalCancelButton = page.getByTestId('modal-btn-cancel')
    this.modalError = page.getByTestId('modal-error')
    this.deleteModal = page.getByTestId('delete-modal')
    this.deleteConfirmButton = page.getByTestId('delete-btn-confirm')
    this.deleteCancelButton = page.getByTestId('delete-btn-cancel')
  }

  async goto() {
    await this.page.goto('/dashboard')
  }

  async addTask(title: string, description?: string, status?: string, priority?: string, dueDate?: string) {
    await this.addTaskButton.click()
    await this.modalTitleInput.fill(title)
    if (description) await this.modalDescriptionInput.fill(description)
    if (status) await this.modalStatusSelect.selectOption(status)
    if (priority) await this.modalPrioritySelect.selectOption(priority)
    if (dueDate) await this.modalDueDateInput.fill(dueDate)
    await this.modalSaveButton.click()
  }

  async editTask(taskId: string, title: string) {
    await this.page.getByTestId(`btn-edit-${taskId}`).click()
    await this.modalTitleInput.clear()
    await this.modalTitleInput.fill(title)
    await this.modalSaveButton.click()
  }

  async deleteTask(taskId: string) {
    await this.page.getByTestId(`btn-delete-${taskId}`).click()
    await this.deleteConfirmButton.click()
  }

  async filterByStatus(status: 'all' | 'todo' | 'in_progress' | 'done') {
    await this.page.getByTestId(`filter-${status}`).click()
  }

  async searchTask(keyword: string) {
    await this.searchInput.fill(keyword)
  }

  async logout() {
    await this.logoutButton.click()
  }
}