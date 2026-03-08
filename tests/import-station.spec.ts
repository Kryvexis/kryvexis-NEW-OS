import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'

test.describe('Import Station', () => {
  test('import station shows all three import blocks', async ({ page }) => {
    await login(page)
    await page.goto('/import-station')

    await expect(page.getByText(/^Import Station$/i)).toBeVisible()

    const clientsHeading = page.getByText(/^Import Clients$/i)
    await clientsHeading.scrollIntoViewIfNeeded()
    await expect(clientsHeading).toBeVisible()

    const productsHeading = page.getByText(/^Import Products$/i)
    await productsHeading.scrollIntoViewIfNeeded()
    await expect(productsHeading).toBeVisible()

    const suppliersHeading = page.getByText(/^Import Suppliers$/i)
    await suppliersHeading.scrollIntoViewIfNeeded()
    await expect(suppliersHeading).toBeVisible()
  })
})
