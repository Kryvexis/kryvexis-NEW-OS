import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Kryvexis OS smoke', () => {
  test('login and shell loads', async ({ page }) => {
    await login(page)
    await page.goto('/sales/overview')

    await expect(page).toHaveURL(/sales\/overview/)
    await expect(page.getByRole('button', { name: /sign out/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sales/i }).first()).toBeVisible()
    await expect(page.getByText(/^overview$/i).last()).toBeVisible()
  })

  test('desktop navigation shows core sections', async ({ page }) => {
    await login(page)
    await page.goto('/sales/overview')

    for (const label of ['Sales', 'Buyers', 'Accounting', 'Operations', 'Insights']) {
      await expect(page.getByRole('link', { name: new RegExp(label, 'i') }).first()).toBeVisible()
    }
  })
})
