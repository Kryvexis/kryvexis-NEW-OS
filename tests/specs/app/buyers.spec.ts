import { test, expect } from '@playwright/test';
import { login } from '../../helpers/auth';

test.describe('Buyers interactions', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/buyers');
    await expect(page).toHaveURL(/\/buyers/);
  });

  test('review and order opens the purchase list flow', async ({ page }) => {
    await page.getByRole('link', { name: /review\s*&\s*order/i }).first().click();
    await expect(page).toHaveURL(/purchase-list|review|order/i);
    await expect(page.locator('main')).toContainText(/review|order|purchase/i);
  });

  test('open products opens the products screen', async ({ page }) => {
    await page.getByRole('link', { name: /open products/i }).first().click();
    await expect(page).toHaveURL(/products/i);
    await expect(page.locator('main')).toContainText(/products|catalog|stock|inventory/i);
  });

  test('open suppliers opens the suppliers screen', async ({ page }) => {
    await page.getByRole('link', { name: /open suppliers/i }).first().click();
    await expect(page).toHaveURL(/suppliers/i);
    await expect(page.locator('main')).toContainText(/suppliers|vendor|account|contact/i);
  });

  test('stock movements opens the stock movement screen', async ({ page }) => {
    await page.getByRole('link', { name: /stock movements/i }).first().click();
    await expect(page).toHaveURL(/stock|movement/i);
    await expect(page.locator('main')).toContainText(/stock|movement|history|inventory/i);
  });

  test('open stock changes into a stock-focused view', async ({ page }) => {
    await page.getByRole('link', { name: /open stock/i }).first().click();
    await expect(page).toHaveURL(/stock|inventory/i);
    await expect(page.locator('main')).toContainText(/stock|inventory|on hand|low stock/i);
  });
});
