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
    Write-Host "Removing existing link at $linkPath"
    Remove-Item $linkPath -Force
}

Write-Host "Linking:"
Write-Host "  Target: $linkPath"
Write-Host "  Source: $fullSource"
New-Item -ItemType SymbolicLink -Path $linkPath -Target $fullSource | Out-Null
