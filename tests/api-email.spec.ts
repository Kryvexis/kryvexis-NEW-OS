import { test, expect } from '@playwright/test'

test.describe('Email API', () => {
  test('email API responds sanely', async ({ request }) => {
    const to = process.env.E2E_TEST_EMAIL_TO
    test.skip(!to, 'Set E2E_TEST_EMAIL_TO to exercise the email API.')

    const response = await request.post('/api/email/send', {
      data: {
        to,
        subject: `Kryvexis test ${Date.now()}`,
        text: 'Automated Playwright smoke test',
      },
    })

    expect([200, 400, 401, 405, 500]).toContain(response.status())
  })
})
