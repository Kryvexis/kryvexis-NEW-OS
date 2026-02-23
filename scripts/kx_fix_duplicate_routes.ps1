$ErrorActionPreference = "Stop"

Write-Host "Kryvexis route fix: removing duplicate /login and /boot routes (if present)..." -ForegroundColor Cyan

$paths = @(
  "app\login\page.tsx",
  "app\boot\page.tsx"
)

foreach ($p in $paths) {
  if (Test-Path $p) {
    Write-Host "Deleting $p" -ForegroundColor Yellow
    Remove-Item $p -Force
  } else {
    Write-Host "OK: $p not found" -ForegroundColor DarkGray
  }
}

Write-Host "Done. Restart dev server: Ctrl+C then npm run dev" -ForegroundColor Green
