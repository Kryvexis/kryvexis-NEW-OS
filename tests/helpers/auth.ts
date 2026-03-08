import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  const email = process.env.E2E_LOGIN_EMAIL;
  const password = process.env.E2E_LOGIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing E2E_LOGIN_EMAIL or E2E_LOGIN_PASSWORD in environment');
  }

  await page.goto('/login');

  await page.getByLabel(/email/i).fill(email);
  await page.locator('input[type="password"], input[name="password"]').first().fill(password);
  await page.getByRole('button', { name: /sign in|login/i }).click();

  await expect(page).not.toHaveURL(/\/login$/);
}
