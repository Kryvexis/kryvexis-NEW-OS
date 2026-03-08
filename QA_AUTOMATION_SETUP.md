# Kryvexis OS QA automation setup

This project now includes a starter QA harness using:
- Playwright for UI/API checks
- Mailosaur for email verification
- Vercel preview or local dev server as the test target

## 1. Install dependencies

```bash
npm install
npx playwright install chromium
```

## 2. Copy the example env file

Create a `.env.e2e` or export these variables in your shell using `.env.e2e.example` as the template.

Required for most tests:
- `E2E_LOGIN_EMAIL`
- `E2E_LOGIN_PASSWORD`

Optional:
- `PLAYWRIGHT_BASE_URL` to run against Vercel/staging
- `E2E_TEST_EMAIL_TO` for the email API smoke test
- `MAILOSAUR_API_KEY`
- `MAILOSAUR_SERVER_ID`
- `E2E_INVOICE_ID`

## 3. Run the tests

Local app auto-start:

```bash
npm run test:e2e
```

Against a deployed preview:

```bash
PLAYWRIGHT_BASE_URL=https://your-preview-url.vercel.app npm run test:e2e
```

Interactive UI mode:

```bash
npm run test:e2e:ui
```

## 4. What is covered

Current starter suite:
- Login and shell smoke
- Buyers navigation and review/order flow
- Buyers tab switching
- Import Station visibility
- Email API smoke test (optional)
- Invoice email UI test with Mailosaur (optional)

## 5. Recommended next tests

Add these next for fuller coverage:
- Products page load and supplier lookup
- Clients page load
- Create quote flow
- Create invoice flow
- Import actual CSV fixture uploads
- Payment record flow
- Overdue reminder cron route

## 6. Notes

- Some tests are intentionally skipped unless the required environment variables are provided.
- The invoice email UI test needs a real invoice ID in the target environment.
- If your login page or button labels change, update the selectors in `tests/`.
