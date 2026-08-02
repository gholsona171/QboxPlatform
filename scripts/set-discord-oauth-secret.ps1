param()

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"

if (-not (Test-Path -LiteralPath $envPath)) {
  throw "Missing root .env file."
}

$secureSecret = Read-Host "Discord OAuth client secret" -AsSecureString
$secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureSecret)

try {
  $secret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
  if ([string]::IsNullOrWhiteSpace($secret)) {
    throw "Discord OAuth client secret cannot be empty."
  }

  $lines = [System.Collections.Generic.List[string]]::new()
  $lines.AddRange([string[]](Get-Content -LiteralPath $envPath))
  $updated = $false

  for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "^\s*DISCORD_OAUTH_CLIENT_SECRET\s*=") {
      $lines[$i] = "DISCORD_OAUTH_CLIENT_SECRET=$secret"
      $updated = $true
      break
    }
  }

  if (-not $updated) {
    if ($lines.Count -gt 0 -and $lines[$lines.Count - 1].Trim() -ne "") {
      $lines.Add("")
    }
    $lines.Add("DISCORD_OAUTH_CLIENT_SECRET=$secret")
  }

  Set-Content -LiteralPath $envPath -Value $lines -Encoding utf8
  Write-Output "DISCORD_OAUTH_CLIENT_SECRET updated in root .env."
} finally {
  if ($secretPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
  }
}
