param (
    [switch]$NoBrowser
)

Write-Host ""
Write-Host "Starting Goal Tracker Dev environment..."

$base = "$PSScriptRoot\..\dev_instance"
$containerName = "homeassistant-goal-tracker-card-dev"
$expectedConfigPath = (Resolve-Path "$base\config").Path

$existingContainerJson = docker inspect $containerName 2>$null
if ($LASTEXITCODE -eq 0) {
    $existingContainer = $existingContainerJson | ConvertFrom-Json
    $configMount = $existingContainer.Mounts | Where-Object { $_.Destination -eq "/config" }

    if ($configMount -and $configMount.Source -ne $expectedConfigPath) {
        Write-Host ""
        Write-Host "Replacing stale dev container mounted from:"
        Write-Host "  $($configMount.Source)"
        Write-Host "The config and .storage files at that location will not be removed."
        docker rm -f $containerName | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Could not remove stale dev container."
        }
    }
}

Write-Host ""
Write-Host "Ensuring goal-tracker-card.js is copied into the dev instance..."
& "$PSScriptRoot\link-dev.ps1"

Write-Host ""
Write-Host "Starting Docker container..."
docker compose -f "$base\docker-compose.yml" up -d
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose up failed."
}

& "$PSScriptRoot\initialize-dev.ps1"

Write-Host ""
Write-Host "Home Assistant is running at:"
Write-Host "  http://localhost:8124/"
Write-Host "Opening the Goal Tracker card at:"
Write-Host "  http://localhost:8124/goal-tracker/test"
Write-Host ""
Write-Host "This script preserves dev_instance\config\.storage and initializes a disposable profile when needed."

if (-not $NoBrowser) {
    Start-Process "http://localhost:8124/goal-tracker/test"
}
