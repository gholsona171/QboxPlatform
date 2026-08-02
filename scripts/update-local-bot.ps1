param(
  [int]$ReadinessSeconds = 15
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$logDir = Join-Path $root ".tmp"
$stdout = Join-Path $logDir "qbox-bot.stdout.log"
$stderr = Join-Path $logDir "qbox-bot.stderr.log"
$updateLog = Join-Path $logDir "update-local-bot.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

function Write-Step {
  param([Parameter(Mandatory = $true)][string]$Message)

  $entry = "$(Get-Date -Format o) $Message"
  Add-Content -Path $updateLog -Value $entry
  Write-Output $Message
}

function Get-EnvValue {
  param([Parameter(Mandatory = $true)][string]$Name)

  if (-not (Test-Path $envPath)) {
    throw "Missing root .env file."
  }

  $line = Get-Content $envPath |
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

function Get-QboxBotProcesses {
  $processes = @(Get-CimInstance Win32_Process)
  $roots = @(
    $processes |
      Where-Object {
        $_.CommandLine -match "@qbox/bot\s+start" -or
        $_.CommandLine -match "--filter\s+@qbox/bot\s+start"
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
    Where-Object {
      $_.Name -match "^(node|node.exe|cmd.exe)$"
    }
}

function Stop-QboxBotProcesses {
  $processes = @(Get-QboxBotProcesses)
  if ($processes.Count -eq 0) {
    return
  }

  $ids = $processes |
    Sort-Object ProcessId -Descending |
    Select-Object -ExpandProperty ProcessId

  Stop-Process -Id $ids -Force
}

function Get-DeploymentPlan {
  $output = & pnpm --filter "@qbox/bot" deploy:commands:dev:dry-run 2>&1
  if ($LASTEXITCODE -ne 0) {
    $output | Write-Output
    throw "Guild command deployment dry-run failed."
  }

  $output | Write-Output

  $plan = $output |
    ForEach-Object {
      try { $_ | ConvertFrom-Json -ErrorAction Stop } catch { $null }
    } |
    Where-Object { $_.msg -eq "Discord command deployment plan created." } |
    Select-Object -Last 1

  if (-not $plan) {
    throw "Could not read Discord command deployment dry-run plan."
  }

  return $plan
}

Set-Location $root

Write-Step "Verifying DATABASE_URL."
$env:DATABASE_URL = Get-EnvValue "DATABASE_URL"

Write-Step "Applying Prisma migrations."
Invoke-RepoCommand "pnpm" @("--filter", "@qbox/prisma", "prisma:migrate:deploy")
Write-Step "Generating Prisma client."
Invoke-RepoCommand "pnpm" @("prisma:generate")
Write-Step "Building workspace."
Invoke-RepoCommand "pnpm" @("build")
Write-Step "Typechecking workspace."
Invoke-RepoCommand "pnpm" @("typecheck")

Write-Step "Running guild command deployment dry-run."
$plan = Get-DeploymentPlan
$hasCommandChanges =
  $plan.additions.Count -gt 0 -or
  $plan.updates.Count -gt 0 -or
  $plan.removals.Count -gt 0

if ($hasCommandChanges) {
  Write-Step "Applying changed guild command definitions."
  Invoke-RepoCommand "pnpm" @("--filter", "@qbox/bot", "deploy:commands:dev")
}

Write-Step "Stopping existing QboxPlatform bot process tree."
Stop-QboxBotProcesses

Remove-Item $stdout, $stderr -ErrorAction SilentlyContinue

Write-Step "Starting QboxPlatform bot."
$process = Start-Process `
  -FilePath "pnpm.cmd" `
  -ArgumentList @("--filter", "@qbox/bot", "start") `
  -WorkingDirectory $root `
  -RedirectStandardOutput $stdout `
  -RedirectStandardError $stderr `
  -WindowStyle Hidden `
  -PassThru

Start-Sleep -Seconds $ReadinessSeconds

Write-Step "Verifying QboxPlatform bot readiness."
$botProcesses = @(Get-QboxBotProcesses)
$runtime = @(
  $botProcesses |
    Where-Object {
      $_.Name -match "^node(\.exe)?$" -and
      $_.CommandLine -match "node\s+dist/index\.js"
    }
)
if ($runtime.Count -ne 1) {
  throw "Expected exactly one QboxPlatform bot runtime process, found $($runtime.Count)."
}

$logs = Get-Content $stdout -ErrorAction SilentlyContinue -Tail 200
foreach ($pattern in @(
  "Persistent permission database ready.",
  "Discord commands loaded.",
  "Discord client connected.",
  "Qbox Platform started."
)) {
  $matched = @($logs | Select-String -SimpleMatch $pattern | Select-Object -First 1)
  if ($matched.Count -eq 0) {
    throw "Bot readiness log not found: $pattern"
  }
}

[PSCustomObject]@{
  BotRuntimePid = $runtime[0].ProcessId
  CommandChangesApplied = $hasCommandChanges
  ReadinessVerified = $true
}
