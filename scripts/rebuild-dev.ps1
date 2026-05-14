Write-Host ""
Write-Host "Rebuilding Goal Tracker Dev environment..."

$base = "$PSScriptRoot\..\dev_instance"
$composeFile = "$base\docker-compose.yml"

Write-Host ""
Write-Host "Stopping and removing Docker containers..."
docker compose -f "$composeFile" down --remove-orphans
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose down failed."
}

Write-Host ""
Write-Host "Rebuilding bundled card assets..."
npm run build
if ($LASTEXITCODE -ne 0) {
    throw "npm run build failed."
}

Write-Host ""
Write-Host "Syncing card and integration into the dev instance..."
& "$PSScriptRoot\link-dev.ps1"
if ($LASTEXITCODE -ne 0) {
    throw "link-dev.ps1 failed."
}

Write-Host ""
Write-Host "Pulling the latest Home Assistant image..."
docker compose -f "$composeFile" pull
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose pull failed."
}

Write-Host ""
Write-Host "Starting fresh Docker containers..."
docker compose -f "$composeFile" up --force-recreate --build -d
if ($LASTEXITCODE -ne 0) {
    throw "Docker compose up failed."
}

Write-Host ""
Write-Host "Home Assistant is rebuilding at:"
Write-Host "  http://localhost:8124/goal-tracker/test"
Write-Host ""
Write-Host "This preserves dev_instance\config\.storage. Use reset-dev.ps1 when you intentionally want to wipe local Home Assistant state."
