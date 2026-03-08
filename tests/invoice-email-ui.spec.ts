import { test, expect } from '@playwright/test'
import { login } from './helpers/auth'
import { getMailClient, makeTestAddress } from './helpers/mail'

test.describe('Invoice email UI', () => {
  test('invoice email sends and arrives in Mailosaur', async ({ page }) => {
    const invoiceId = process.env.E2E_INVOICE_ID
    const hasMail = !!process.env.MAILOSAUR_SERVER_ID && !!process.env.MAILOSAUR_API_KEY
    test.skip(!invoiceId || !hasMail, 'Set MAILOSAUR_SERVER_ID, MAILOSAUR_API_KEY, and E2E_INVOICE_ID.')

    const { client, serverId } = getMailClient()
    const email = makeTestAddress('invoice')

    await login(page)
    await page.goto(`/invoices/${invoiceId}`)

    await page.getByRole('button', { name: /email/i }).first().click()

    const toField = page.getByLabel(/to/i).or(page.getByPlaceholder(/email/i)).first()
    await toField.fill(email)

    await page.getByRole('button', { name: /^send$/i }).click()

    await expect(page.getByText(/sent|queued|success/i).first()).toBeVisible({ timeout: 15000 })

    const message = await client.messages.get(serverId, { sentTo: email }, { timeout: 30000 })
    expect(message.subject || '').toMatch(/invoice/i)
  })
})
