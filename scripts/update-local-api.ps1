param(
  [int]$ReadinessSeconds = 15
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$logDir = Join-Path $root ".tmp"
$stdout = Join-Path $logDir "qbox-api.stdout.log"
$stderr = Join-Path $logDir "qbox-api.stderr.log"
$updateLog = Join-Path $logDir "update-local-api.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-Step {
  param([Parameter(Mandatory = $true)][string]$Message)

  $entry = "$(Get-Date -Format o) $Message"
  Add-Content -Path $updateLog -Value $entry
  Write-Output $Message
}

function Get-EnvValue {
  param([Parameter(Mandatory = $true)][string]$Name)

  if (-not (Test-Path -LiteralPath $envPath)) {
    throw "Missing root .env file."
  }

  $line = Get-Content -LiteralPath $envPath |
    Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } |
    Select-Object -First 1

  if (-not $line) {
    throw "$Name is missing from root .env."
  }

  $value = ($line -replace "^\s*$([regex]::Escape($Name))\s*=\s*", "").Trim('"').Trim("'")
  if (-not $value) {
    throw "$Name is empty in root .env."
  }

  return $value
}

function Import-RootEnv {
  foreach ($line in Get-Content -LiteralPath $envPath) {
    if ($line -match "^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$") {
      $name = $matches[1]
      $value = $matches[2].Trim('"').Trim("'")
      [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
  }
}

function Invoke-RepoCommand {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)][string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($Arguments -join ' ')"
  }
}

function Get-QboxApiProcesses {
  $processes = @(Get-CimInstance Win32_Process)
  $roots = @(
    $processes |
      Where-Object {
        $_.CommandLine -match "@qbox/api\s+start" -or
        $_.CommandLine -match "--filter\s+@qbox/api\s+start"
      }
  )

  if ($roots.Count -eq 0) {
    return @()
  }

  $ids = [System.Collections.Generic.HashSet[int]]::new()
  foreach ($process in $roots) {
    [void]$ids.Add([int]$process.ProcessId)
  }

  do {
    $added = $false
    foreach ($process in $processes) {
      if ($ids.Contains([int]$process.ParentProcessId) -and -not $ids.Contains([int]$process.ProcessId)) {
        [void]$ids.Add([int]$process.ProcessId)
        $added = $true
      }
    }
  } while ($added)

  $processes |
    Where-Object { $ids.Contains([int]$_.ProcessId) } |
    Where-Object { $_.Name -match "^(node|node.exe|cmd.exe)$" }
}

function Stop-QboxApiProcesses {
  $processes = @(Get-QboxApiProcesses)
  if ($processes.Count -eq 0) {
    return
  }

  $ids = $processes |
    Sort-Object ProcessId -Descending |
    Select-Object -ExpandProperty ProcessId

  Stop-Process -Id $ids -Force
}

function Invoke-Health {
  param([Parameter(Mandatory = $true)][string]$Path)

  $uri = "http://127.0.0.1:$env:API_PORT$Path"
  $response = Invoke-WebRequest -Uri $uri -UseBasicParsing -TimeoutSec 5
  if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) {
    throw "Health check failed: $Path"
  }
}

Set-Location $root

foreach ($name in @(
  "DATABASE_URL",
  "DISCORD_TOKEN",
  "DISCORD_APPLICATION_ID",
  "DISCORD_GUILD_ID",
  "DISCORD_OAUTH_CLIENT_ID",
  "DISCORD_OAUTH_CLIENT_SECRET",
  "DISCORD_OAUTH_REDIRECT_URI",
  "API_PUBLIC_BASE_URL",
  "AUTH_KEY_VERSION",
  "AUTH_SESSION_HMAC_KEY",
  "AUTH_CSRF_HMAC_KEY",
  "AUTH_METADATA_HMAC_KEY",
  "AUTH_OAUTH_ENCRYPTION_KEY"
)) {
  [void](Get-EnvValue $name)
}

Import-RootEnv

if (-not $env:API_HOST) { $env:API_HOST = "127.0.0.1" }
if (-not $env:API_PORT) { $env:API_PORT = "3000" }

Write-Step "Applying Prisma migrations."
Invoke-RepoCommand "pnpm" @("--filter", "@qbox/prisma", "prisma:migrate:deploy")
Write-Step "Generating Prisma client."
Invoke-RepoCommand "pnpm" @("prisma:generate")
Write-Step "Building workspace."
Invoke-RepoCommand "pnpm" @("build")
Write-Step "Typechecking workspace."
Invoke-RepoCommand "pnpm" @("typecheck")

Write-Step "Stopping existing QboxPlatform API process tree."
Stop-QboxApiProcesses

Remove-Item $stdout, $stderr -ErrorAction SilentlyContinue

Write-Step "Starting QboxPlatform API."
$process = Start-Process `
  -FilePath "pnpm.cmd" `
  -ArgumentList @("--filter", "@qbox/api", "start") `
  -WorkingDirectory $root `
  -RedirectStandardOutput $stdout `
  -RedirectStandardError $stderr `
  -WindowStyle Hidden `
  -PassThru

Start-Sleep -Seconds $ReadinessSeconds

Write-Step "Verifying QboxPlatform API readiness."
$apiProcesses = @(Get-QboxApiProcesses)
$runtime = @(
  $apiProcesses |
    Where-Object {
      $_.Name -match "^node(\.exe)?$" -and
      $_.CommandLine -match "node\s+dist/run\.js"
    }
)
if ($runtime.Count -ne 1) {
  throw "Expected exactly one QboxPlatform API runtime process, found $($runtime.Count)."
}

Invoke-Health "/health/live"
Invoke-Health "/health/ready"

[PSCustomObject]@{
  ApiRuntimePid = $runtime[0].ProcessId
  ReadinessVerified = $true
}
