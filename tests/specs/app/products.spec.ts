import { test, expect } from '@playwright/test';
import { login } from '../../helpers/auth';

test('operations products page opens', async ({ page }) => {
  await login(page);
  await page.goto('/operations/products');
  await expect(page).toHaveURL(/\/operations\/products/);
  await expect(page.locator('main')).toContainText(/products|catalog|stock|inventory/i);
});
