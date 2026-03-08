# Kryvexis OS Whole-App QA

## Install

```bash
npm install
npx playwright install chromium
```

## Configure

Copy `.env.e2e.example` to `.env.e2e` and fill in:
- `PLAYWRIGHT_BASE_URL`
- `E2E_LOGIN_EMAIL`
- `E2E_LOGIN_PASSWORD`
- optional Mailosaur + invoice/quote IDs

## Run

```bash
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:report
```

## Covered areas
- shell/login smoke
- buyers
- products
- import station
- email API
- invoice email UI flow
- mobile buyers route

Expand selectors and IDs to match the latest UI where needed.
