@echo off
setlocal
cd /d "%~dp0.."
echo Kryvexis route fix: removing duplicate /login and /boot routes in app\ ...
for %%F in (app\login\page.tsx app\login\page.jsx app\boot\page.tsx app\boot\page.jsx) do (
  if exist "%%F" (
    echo Deleting %%F
    del /f /q "%%F"
  ) else (
    echo OK (not found): %%F
  )
)
echo Done. Restart dev server: Ctrl+C then npm run dev
endlocal
