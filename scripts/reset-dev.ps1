# scripts/reset-dev.ps1

Write-Host ""
Write-Host "Resetting Goal Tracker Dev environment..."

& "$PSScriptRoot\clean-dev.ps1"
& "$PSScriptRoot\setup-dev.ps1"
