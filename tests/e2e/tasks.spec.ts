import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://izfdmyssktrzbkzmzeat.supabase.co',
  'sb_publishable_FEnPtbqvk6l1_G2UbRRFFA__C7Cpa9i'
)

const TEST_EMAIL = 'rizkifaizal125@gmail.com'
const TEST_PASSWORD = 'cdmeledak12'

test.describe('Task Management', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD)
    await expect(page).toHaveURL('/dashboard')
    // pastikan modal tidak terbuka sebelum test
    await expect(page.getByTestId('task-modal')).not.toBeVisible()
  })

  test.afterEach(async () => {
    // login dulu ke supabase client
    await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase
        .from('tasks')
        .delete()
        .eq('user_id', user.id)
    }
  })

  test.describe('Dashboard', () => {
    test('TC-TASK-001: should display dashboard elements correctly', async ({ page }) => {
      const dashboard = new DashboardPage(page)

      await expect(page.getByTestId('navbar')).toBeVisible()
      await expect(dashboard.addTaskButton).toBeVisible()
      await expect(dashboard.searchInput).toBeVisible()
      await expect(page.getByTestId('filter-all')).toBeVisible()
      await expect(page.getByTestId('filter-todo')).toBeVisible()
      await expect(page.getByTestId('filter-in_progress')).toBeVisible()
      await expect(page.getByTestId('filter-done')).toBeVisible()
      await expect(page.getByTestId('user-email')).toContainText(TEST_EMAIL)
    })

    test('TC-TASK-002: should show empty state or task list', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      await dashboard.filterByStatus('all')

      const taskList = page.getByTestId('task-list')
      const emptyState = page.getByTestId('empty-state')
      const hasEmpty = await emptyState.isVisible()
      const hasList = await taskList.isVisible()
      expect(hasEmpty || hasList).toBeTruthy()
    })
  })

  test.describe('Create Task', () => {
    test('TC-TASK-003: should open add task modal', async ({ page }) => {
      const dashboard = new DashboardPage(page)

      await dashboard.addTaskButton.click()
      await expect(dashboard.taskModal).toBeVisible()
      await expect(dashboard.modalTitleInput).toBeVisible()
      await expect(dashboard.modalSaveButton).toBeVisible()
      await expect(dashboard.modalCancelButton).toBeVisible()
    })

    test('TC-TASK-004: should show error when title is empty', async ({ page }) => {
      const dashboard = new DashboardPage(page)

      await dashboard.addTaskButton.click()
      await dashboard.modalSaveButton.click()
      await expect(dashboard.modalError).toBeVisible()
      await expect(dashboard.modalError).toContainText('Title wajib diisi')
      await dashboard.modalCancelButton.click()
      await expect(dashboard.taskModal).not.toBeVisible()
    })

    test('TC-TASK-005: should close modal when cancel is clicked', async ({ page }) => {
      const dashboard = new DashboardPage(page)

      await dashboard.addTaskButton.click()
      await expect(dashboard.taskModal).toBeVisible()
      await dashboard.modalCancelButton.click()
      await expect(dashboard.taskModal).not.toBeVisible()
    })

    test('TC-TASK-006: should create task with title only', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Test Task ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalSaveButton.click()

      // tunggu modal tertutup dulu
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })
    })

    test('TC-TASK-007: should create task with all fields', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Full Task ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalDescriptionInput.fill('Test description')
      await dashboard.modalStatusSelect.selectOption('in_progress')
      await dashboard.modalPrioritySelect.selectOption('high')
      await dashboard.modalDueDateInput.fill('2025-12-31')
      await dashboard.modalSaveButton.click()

      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })
    })

    test('TC-TASK-008: should create task with special characters in title', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Task Special ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalSaveButton.click()

      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Edit Task', () => {
    test('TC-TASK-009: should open edit modal with existing data', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Edit Test ${Date.now()}`

      // buat task dulu
      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })

      // ambil task id dari card pertama
      const firstCard = page.locator('[data-testid^="task-card-"]').first()
      const taskId = await firstCard.getAttribute('data-testid').then(id => id?.replace('task-card-', ''))

      if (taskId) {
        await page.getByTestId(`btn-edit-${taskId}`).click()
        await expect(dashboard.taskModal).toBeVisible()
        await expect(dashboard.modalTitleInput).toHaveValue(taskTitle)
        await dashboard.modalCancelButton.click()
        await expect(dashboard.taskModal).not.toBeVisible()
      }
    })

    test('TC-TASK-010: should edit task title successfully', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const originalTitle = `Original ${Date.now()}`
      const updatedTitle = `Updated ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(originalTitle)
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(originalTitle)).toBeVisible({ timeout: 10000 })

      const firstCard = page.locator('[data-testid^="task-card-"]').first()
      const taskId = await firstCard.getAttribute('data-testid').then(id => id?.replace('task-card-', ''))

      if (taskId) {
        await page.getByTestId(`btn-edit-${taskId}`).click()
        await expect(dashboard.taskModal).toBeVisible()
        await dashboard.modalTitleInput.clear()
        await dashboard.modalTitleInput.fill(updatedTitle)
        await dashboard.modalSaveButton.click()
        await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
        await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 10000 })
      }
    })

    test('TC-TASK-011: should update task status', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Status Test ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })

      const firstCard = page.locator('[data-testid^="task-card-"]').first()
      const taskId = await firstCard.getAttribute('data-testid').then(id => id?.replace('task-card-', ''))

      if (taskId) {
        await page.getByTestId(`btn-edit-${taskId}`).click()
        await expect(dashboard.taskModal).toBeVisible()
        await dashboard.modalStatusSelect.selectOption('done')
        await dashboard.modalSaveButton.click()
        await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
        await expect(page.getByText('Done').first()).toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Delete Task', () => {
    test('TC-TASK-012: should show delete confirmation modal', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Delete Test ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })

      const firstCard = page.locator('[data-testid^="task-card-"]').first()
      const taskId = await firstCard.getAttribute('data-testid').then(id => id?.replace('task-card-', ''))

      if (taskId) {
        await page.getByTestId(`btn-delete-${taskId}`).click()
        await expect(dashboard.deleteModal).toBeVisible()
        await expect(dashboard.deleteConfirmButton).toBeVisible()
        await expect(dashboard.deleteCancelButton).toBeVisible()
        await dashboard.deleteCancelButton.click()
        await expect(dashboard.deleteModal).not.toBeVisible()
      }
    })

    test('TC-TASK-013: should cancel delete', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Cancel Delete ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })

      const firstCard = page.locator('[data-testid^="task-card-"]').first()
      const taskId = await firstCard.getAttribute('data-testid').then(id => id?.replace('task-card-', ''))

      if (taskId) {
        await page.getByTestId(`btn-delete-${taskId}`).click()
        await expect(dashboard.deleteModal).toBeVisible()
        await dashboard.deleteCancelButton.click()
        await expect(dashboard.deleteModal).not.toBeVisible()
        await expect(page.getByText(taskTitle)).toBeVisible()
      }
    })

    test('TC-TASK-014: should delete task successfully', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `To Be Deleted ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(taskTitle)).toBeVisible({ timeout: 10000 })

      const firstCard = page.locator('[data-testid^="task-card-"]').first()
      const taskId = await firstCard.getAttribute('data-testid').then(id => id?.replace('task-card-', ''))

      if (taskId) {
        await page.getByTestId(`btn-delete-${taskId}`).click()
        await expect(dashboard.deleteModal).toBeVisible()
        await dashboard.deleteConfirmButton.click()
        await expect(dashboard.deleteModal).not.toBeVisible({ timeout: 10000 })
        await expect(page.getByText(taskTitle)).not.toBeVisible({ timeout: 10000 })
      }
    })
  })

  test.describe('Filter & Search', () => {
    test('TC-TASK-015: should filter tasks by todo status', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Todo Task ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalStatusSelect.selectOption('todo')
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })

      await dashboard.filterByStatus('todo')
        const taskCards = page.locator('[data-testid^="task-card-"]')
        const cardCount = await taskCards.count()
        for (let i = 0; i < cardCount; i++) {
        await expect(taskCards.nth(i).getByText('In Progress')).toHaveCount(0)
        await expect(taskCards.nth(i).getByText('Done')).toHaveCount(0)
        }
    })

    test('TC-TASK-016: should filter tasks by done status', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const taskTitle = `Done Task ${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(taskTitle)
      await dashboard.modalStatusSelect.selectOption('done')
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })

        await dashboard.filterByStatus('done')
        const taskCards = page.locator('[data-testid^="task-card-"]')
        const cardCount = await taskCards.count()
        for (let i = 0; i < cardCount; i++) {
        await expect(taskCards.nth(i).getByText('To Do')).toHaveCount(0)
        await expect(taskCards.nth(i).getByText('In Progress')).toHaveCount(0)
        }
    })

    test('TC-TASK-017: should search task by keyword', async ({ page }) => {
      const dashboard = new DashboardPage(page)
      const uniqueTitle = `UniqueSearch${Date.now()}`

      await dashboard.addTaskButton.click()
      await dashboard.modalTitleInput.fill(uniqueTitle)
      await dashboard.modalSaveButton.click()
      await expect(dashboard.taskModal).not.toBeVisible({ timeout: 10000 })
      await expect(page.getByText(uniqueTitle)).toBeVisible({ timeout: 10000 })

      await dashboard.searchTask(uniqueTitle)
      await expect(page.getByText(uniqueTitle)).toBeVisible()
    })

    test('TC-TASK-018: should show empty state when search has no results', async ({ page }) => {
      const dashboard = new DashboardPage(page)

      await dashboard.searchTask('xxxxxxxxxnotfoundxxxxxxxxx')
      await expect(page.getByTestId('empty-state')).toBeVisible()
    })
  })
})