import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Buyers workflow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto('/buyers')
    await expect(page.getByRole('link', { name: /review\s*&\s*order/i }).first()).toBeVisible()
  })

  test('review and order opens desktop purchase list', async ({ page }) => {
    await page.getByRole('link', { name: /review\s*&\s*order/i }).first().click()
    await expect(page).toHaveURL(/\/buyers\/purchase-list/)
    await expect(page.locator('body')).toContainText(/purchase list|review order|supplier|order/i)
  })

  test('buyers tabs switch', async ({ page }) => {
    const outTab = page.getByRole('link', { name: /out \(/i }).first()
    const lowTab = page.getByRole('link', { name: /low \(/i }).first()

    await outTab.click()
    await expect(page).toHaveURL(/tab=out/)

    await lowTab.click()
    await expect(page).toHaveURL(/tab=low/)
  })
})
