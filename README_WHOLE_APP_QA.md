# Kryvexis OS Whole-App QA Pack

## Setup
1. Copy `.env.e2e.example` to `.env.e2e`
2. Fill in your login and optional Mailosaur values
3. Run:

```bat
npm install
npx playwright install
npm run test:e2e:ui
```

## Minimum env values
- `PLAYWRIGHT_BASE_URL`
- `E2E_LOGIN_EMAIL`
- `E2E_LOGIN_PASSWORD`

## What this pack tests
- login / shell smoke
- sidebar visibility
- Buyers routes
- Products route
- Import Station
- email API reachability
- optional Mailosaur email verification
- mobile Buyers route


## v5 fix
- Updated `tests/helpers/auth.ts` so the password field selector does not collide with the 'Show password' button.


## v6 fix
- Updated `tests/specs/app/smoke.spec.ts` to use visible, specific assertions instead of the overly broad branding text check.


## v8 fix
- Updated `tests/specs/imports/import-station.spec.ts` to use exact section-title matching so it no longer collides with the subtitle text.


## v9 fix
- Corrected `tests/specs/imports/import-station.spec.ts` to use exact text matching for section titles (`^import products$`, `^import suppliers$`, `^import clients$`).
