import { test, expect } from '@playwright/test';
import { login } from '../../helpers/auth';
import { getMailClient, makeTestAddress } from '../../helpers/mail';

test('invoice email flow can be triggered', async ({ page }) => {
  const invoiceId = process.env.E2E_INVOICE_ID;
  const hasMail = !!process.env.MAILOSAUR_SERVER_ID && !!process.env.MAILOSAUR_API_KEY;
  test.skip(!invoiceId || !hasMail, 'Set E2E_INVOICE_ID, MAILOSAUR_SERVER_ID, and MAILOSAUR_API_KEY to enable this test');

  await login(page);
  const email = makeTestAddress('invoice');

  await page.goto(`/invoices/${invoiceId}`);

  await page.getByRole('button', { name: /email/i }).first().click();

  const toField = page.getByLabel(/to/i).or(page.getByPlaceholder(/email/i)).first();
  await toField.fill(email);

  await page.getByRole('button', { name: /send/i }).click();
  await expect(page.getByText(/sent|queued|success/i).first()).toBeVisible({ timeout: 15000 });

  const { client, serverId } = getMailClient();
  const message = await client.messages.get(serverId, { sentTo: email }, { timeout: 30000 });
  expect(message.subject || '').toMatch(/invoice/i);
});
