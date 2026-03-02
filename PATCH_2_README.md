# Patch 2 — PWA install support (Vercel)

This patch adds basic PWA support (install to home screen) for Kryvexis OS.

## Apply
1) Unzip into project root (overwrite)
2) Install deps: `npm install`
3) Build: `npm run build`
4) Commit + push

## Notes
- PWA is enabled in production builds; disabled in local dev by default.
- Android/Chrome should show an install prompt after a few visits (or via browser menu).
- iOS Safari: Share → Add to Home Screen.

