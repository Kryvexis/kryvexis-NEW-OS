$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "..")
Write-Host "Kryvexis route fix: removing duplicate /login and /boot routes in app/ ..." -ForegroundColor Cyan
$targets = @("app\login\page.tsx","app\login\page.jsx","app\boot\page.tsx","app\boot\page.jsx")
foreach ($t in $targets) {
  if (Test-Path $t) { Write-Host "Deleting $t" -ForegroundColor Yellow; Remove-Item $t -Force }
  else { Write-Host "OK (not found): $t" -ForegroundColor DarkGray }
}
Write-Host "Done. Restart dev server: Ctrl+C then npm run dev" -ForegroundColor Green
