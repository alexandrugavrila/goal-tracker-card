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

# Create symlink to custom card
Write-Host ""
Write-Host "Creating symlink for goal-tracker-card.js..."
& "$PSScriptRoot\link-dev.ps1"

# Start Docker in background
Write-Host ""
Write-Host "Starting Docker container in background..."

Start-Job -ScriptBlock {
    docker-compose -f "$using:base\docker-compose.yml" up
} | Out-Null

Write-Host "Docker container is starting in the background. Use 'Get-Job' and 'Receive-Job' to monitor."
