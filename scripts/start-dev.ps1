Write-Host ""
Write-Host "Starting Goal Tracker Dev environment..."

$base = "$PSScriptRoot\..\dev_instance"

Write-Host ""
Write-Host "Ensuring goal-tracker-card.js is linked..."
& "$PSScriptRoot\link-dev.ps1"

Write-Host ""
Write-Host "Starting Docker container in background..."
Start-Job -ScriptBlock {
    docker compose -f "$using:base\docker-compose.yml" up
} | Out-Null

Write-Host ""
Write-Host "Home Assistant is starting at:"
Write-Host "  http://localhost:8124/goal-tracker/test"
Write-Host ""
Write-Host "Use 'Get-Job' and 'Receive-Job' to monitor startup logs."
Write-Host "This script preserves dev_instance\config\.storage so onboarding stays complete."

Start-Process "http://localhost:8124/goal-tracker/test"
