Write-Host ""
Write-Host "Setting up Goal Tracker Dev environment..."

$base = "$PSScriptRoot\..\dev_instance"
$config = "$base\config"

# Ensure required folders exist
$folders = @(
    "$config\www\custom-cards",
    "$config\dashboards"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        Write-Host "Creating folder: $folder"
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
    }
}

& "$PSScriptRoot\start-dev.ps1"
