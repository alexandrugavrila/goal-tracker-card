# scripts/clean-dev.ps1

Write-Host ""
Write-Host "Cleaning Goal Tracker Dev Environment..."

# Step 1: Stop and remove Docker container
Write-Host "Stopping and removing Docker container..."
docker rm -f homeassistant-goal-tracker-card-dev 2>$null | Out-Null

# Step 2: Remove .storage folder
$storagePath = "$PSScriptRoot\..\dev_instance\config\.storage"
if (Test-Path $storagePath) {
    Write-Host "Removing .storage folder: $storagePath"
    Remove-Item -Recurse -Force $storagePath
} else {
    Write-Host "No .storage folder found — skipping."
}

# Step 3: Remove symbolic link for the card
$linkPath = "$PSScriptRoot\..\dev_instance\config\www\custom-cards\goal-tracker-card.js"
if (Test-Path $linkPath) {
    Write-Host "Removing symlink: $linkPath"
    Remove-Item -Force $linkPath
} else {
    Write-Host "No symlink found — skipping."
}

# Step 4: Remove .HA_VERSION
$versionFile = "$PSScriptRoot\..\dev_instance\config\.HA_VERSION"
if (Test-Path $versionFile) {
    Write-Host "Removing .HA_VERSION file"
    Remove-Item -Force $versionFile
}

# Step 5: Remove Home Assistant log files
$logFiles = Get-ChildItem "$PSScriptRoot\..\dev_instance\config" -Filter "home-assistant.log*" -ErrorAction SilentlyContinue
foreach ($logFile in $logFiles) {
    Write-Host "Removing log file: $($logFile.Name)"
    Remove-Item -Force $logFile.FullName
}

# Step 6: Remove deps folder
$depsPath = "$PSScriptRoot\..\dev_instance\config\deps"
if (Test-Path $depsPath) {
    Write-Host "Removing deps folder: $depsPath"
    Remove-Item -Recurse -Force $depsPath
} else {
    Write-Host "No deps folder found — skipping."
}

# Step 7: Remove tts folder
$ttsPath = "$PSScriptRoot\..\dev_instance\config\tts"
if (Test-Path $ttsPath) {
    Write-Host "Removing tts folder: $ttsPath"
    Remove-Item -Recurse -Force $ttsPath
} else {
    Write-Host "No tts folder found — skipping."
}

Write-Host ""
Write-Host "Clean complete."
