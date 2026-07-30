param (
    [string]$BaseUrl = "http://localhost:8124/",
    [string]$ProfileName = "Goal Tracker Dev",
    [string]$Username = "goal-tracker-dev",
    [string]$Password = "goal-tracker-dev",
    [int]$StartupTimeoutSeconds = 120
)

$ErrorActionPreference = "Stop"

$baseUri = [Uri]$BaseUrl
if ($baseUri.Host -notin @("localhost", "127.0.0.1", "::1")) {
    throw "Refusing to create the disposable dev profile on non-loopback host '$($baseUri.Host)'."
}

$BaseUrl = $BaseUrl.TrimEnd("/") + "/"
$clientId = $BaseUrl
$apiUrl = "${BaseUrl}api/"
$onboardingUrl = "${BaseUrl}api/onboarding"

function Invoke-JsonPost {
    param (
        [string]$Uri,
        [hashtable]$Body,
        [hashtable]$Headers = @{}
    )

    Invoke-RestMethod `
        -Uri $Uri `
        -Method Post `
        -ContentType "application/json" `
        -Headers $Headers `
        -Body ($Body | ConvertTo-Json -Depth 5 -Compress)
}

Write-Host ""
Write-Host "Waiting for Home Assistant..."
$deadline = (Get-Date).AddSeconds($StartupTimeoutSeconds)
$apiReady = $false

while ((Get-Date) -lt $deadline) {
    try {
        Invoke-RestMethod -Uri $apiUrl -TimeoutSec 5 | Out-Null
        $apiReady = $true
    } catch {
        if ([int]$_.Exception.Response.StatusCode -eq 401) {
            $apiReady = $true
        }
    }

    if ($apiReady) {
        break
    }

    Start-Sleep -Seconds 2
}

if (-not $apiReady) {
    throw "Home Assistant did not become ready within $StartupTimeoutSeconds seconds."
}

try {
    $onboardingResponse = Invoke-RestMethod -Uri $onboardingUrl -TimeoutSec 5
    $onboarding = @() + $onboardingResponse
} catch {
    if ([int]$_.Exception.Response.StatusCode -eq 404) {
        Write-Host "Home Assistant dev profile is already initialized."
        return
    }

    throw
}

$pendingSteps = @($onboarding | Where-Object { -not $_.done })
if ($pendingSteps.Count -eq 0) {
    Write-Host "Home Assistant dev profile is already initialized."
    return
}

Write-Host "Initializing disposable Home Assistant dev profile..."
$userStep = $onboarding | Where-Object { $_.step -eq "user" }
$authCode = $null

if (-not $userStep.done) {
    $userResult = Invoke-JsonPost `
        -Uri "${BaseUrl}api/onboarding/users" `
        -Body @{
            name = $ProfileName
            username = $Username
            password = $Password
            client_id = $clientId
            language = "en"
        }
    $authCode = $userResult.auth_code
} else {
    # Recover cleanly if a previous bootstrap stopped after creating the user.
    $loginFlow = Invoke-JsonPost `
        -Uri "${BaseUrl}auth/login_flow" `
        -Body @{
            client_id = $clientId
            handler = @("homeassistant", $null)
            redirect_uri = $clientId
        }

    $loginResult = Invoke-JsonPost `
        -Uri "${BaseUrl}auth/login_flow/$($loginFlow.flow_id)" `
        -Body @{
            client_id = $clientId
            username = $Username
            password = $Password
        }

    if ($loginResult.type -ne "create_entry") {
        throw "The existing partial onboarding state does not use the disposable dev profile. Run reset-dev.ps1 to recreate it."
    }

    $authCode = $loginResult.result
}

$tokenResult = Invoke-RestMethod `
    -Uri "${BaseUrl}auth/token" `
    -Method Post `
    -ContentType "application/x-www-form-urlencoded" `
    -Body @{
        client_id = $clientId
        grant_type = "authorization_code"
        code = $authCode
    }

$authHeaders = @{
    Authorization = "Bearer $($tokenResult.access_token)"
}

foreach ($step in @("core_config", "analytics")) {
    $stepStatus = $onboarding | Where-Object { $_.step -eq $step }
    if (-not $stepStatus.done) {
        Invoke-JsonPost `
            -Uri "${BaseUrl}api/onboarding/$step" `
            -Body @{} `
            -Headers $authHeaders | Out-Null
    }
}

$integrationStep = $onboarding | Where-Object { $_.step -eq "integration" }
if (-not $integrationStep.done) {
    Invoke-JsonPost `
        -Uri "${BaseUrl}api/onboarding/integration" `
        -Body @{
            client_id = $clientId
            redirect_uri = $clientId
        } `
        -Headers $authHeaders | Out-Null
}

$finalStatusResponse = Invoke-RestMethod -Uri $onboardingUrl -TimeoutSec 5
$finalStatus = @() + $finalStatusResponse
$stillPending = @($finalStatus | Where-Object { -not $_.done })
if ($stillPending.Count -gt 0) {
    throw "Home Assistant onboarding did not complete: $($stillPending.step -join ', ')."
}

Write-Host "Disposable Home Assistant dev profile is ready."
