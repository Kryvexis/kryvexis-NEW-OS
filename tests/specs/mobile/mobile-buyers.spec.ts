import { test, expect, devices } from '@playwright/test';
import { login } from '../../helpers/auth';

test.use({ ...devices['Pixel 7'] });

test('mobile buyers route loads', async ({ page }) => {
  await login(page);
  await page.goto('/m/buyers');
  await expect(page).toHaveURL(/\/m\/buyers/);
  await expect(page.getByRole('link', { name: /review\s*&\s*order/i })).toBeVisible();
  await expect(page.locator('body')).toContainText(/low stock|full stock|recent/i);
});
