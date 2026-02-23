@echo off
echo Kryvexis route fix: removing duplicate /login and /boot routes (if present)...
if exist "app\login\page.tsx" (
  echo Deleting app\login\page.tsx
  del /f /q "app\login\page.tsx"
) else (
  echo OK: app\login\page.tsx not found
)
if exist "app\boot\page.tsx" (
  echo Deleting app\boot\page.tsx
  del /f /q "app\boot\page.tsx"
) else (
  echo OK: app\boot\page.tsx not found
)
echo Done. Restart dev server: Ctrl+C then npm run dev
