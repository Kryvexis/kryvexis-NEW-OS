Kryvexis UI color fix ZIP

Files:
- app/globals.css
- tailwind.config.ts

What this patch does:
- replaces the washed-out mint/emerald feel with a cleaner blue/cobalt accent system
- improves light-mode contrast for shell, cards, buttons, tabs, chips, and modal surfaces
- keeps dark mode supported
- adds semantic token support: success / warning / danger / info
- remaps older emerald-heavy light-mode classes to the main accent where helpful, so existing screens improve without rewriting every page

Recommended steps:
1. Copy these files into your repo.
2. Run:
   git add app/globals.css tailwind.config.ts
   git commit -m "ui: refresh color system and light-mode contrast"
   git push origin main
3. Redeploy and hard refresh.

Notes:
- This is a token/system-first patch. It should improve sidebar/header/POS/Buyers colors without requiring a full page rewrite.
- If you want a second ZIP after this, the next best pass is component-level cleanup for the desktop sidebar and POS page.
