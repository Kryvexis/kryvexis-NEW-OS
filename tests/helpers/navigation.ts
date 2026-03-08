import { Page, expect } from '@playwright/test';

export async function openFromSidebar(page: Page, label: string) {
  await page.getByRole('link', { name: new RegExp(label, 'i') }).click();
  await expect(page).toHaveURL(new RegExp(label.toLowerCase().replace(/\s+/g, '[-/]')));
}
