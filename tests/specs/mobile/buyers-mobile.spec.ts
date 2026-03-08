import { test, expect, devices } from '@playwright/test';
import { login } from '../../helpers/auth';

test.use({ ...devices['Pixel 5'] });

test('mobile buyers route opens', async ({ page }) => {
  await login(page);
  await page.goto('/m/buyers');
  await expect(page).toHaveURL(/\/m\/buyers/);
});
