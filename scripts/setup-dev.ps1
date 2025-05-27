Write-Host ""
Write-Host "Setting up Goal Tracker Dev environment..."

$base = "$PSScriptRoot\..\dev_instance"

# Start Docker in background
Write-Host ""
Write-Host "Starting Docker container in background..."

Start-Job -ScriptBlock {
    docker-compose -f "$using:base\docker-compose.yml" up
} | Out-Null

Write-Host "Docker container is starting in the background. Use 'Get-Job' and 'Receive-Job' to monitor."
