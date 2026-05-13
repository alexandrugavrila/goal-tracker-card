# scripts\link-dev.ps1
param (
    [string]$SourceFile = "goal-tracker-card.js",
    [string]$TargetDir = "dev_instance\config\www\custom-cards",
    [string]$LinkName = "goal-tracker-card.js"
)

$fullSource = Resolve-Path $SourceFile
$fullTarget = Resolve-Path -ErrorAction SilentlyContinue $TargetDir
if (-not $fullTarget) {
    New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null
    $fullTarget = Resolve-Path $TargetDir
}

$linkPath = Join-Path $fullTarget $LinkName

if (Test-Path $linkPath) {
    Write-Host "Removing existing dev card file at $linkPath"
    Remove-Item $linkPath -Force
}

Write-Host "Copying built card:"
Write-Host "  Target: $linkPath"
Write-Host "  Source: $fullSource"
Copy-Item -Path $fullSource -Destination $linkPath -Force

$integrationSource = Resolve-Path "custom_components\goal_tracker"
$integrationTargetRoot = "$PSScriptRoot\..\dev_instance\config\custom_components"
$integrationTarget = Join-Path $integrationTargetRoot "goal_tracker"

if (-not (Test-Path $integrationTargetRoot)) {
    New-Item -ItemType Directory -Path $integrationTargetRoot -Force | Out-Null
}

if (Test-Path $integrationTarget) {
    Write-Host "Removing existing dev integration at $integrationTarget"
    Remove-Item -Recurse -Force $integrationTarget
}

Write-Host "Copying Goal Tracker integration:"
Write-Host "  Target: $integrationTarget"
Write-Host "  Source: $integrationSource"
Copy-Item -Path $integrationSource -Destination $integrationTarget -Recurse -Force
