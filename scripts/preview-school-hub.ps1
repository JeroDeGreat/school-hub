param(
  [int]$Port = 3000,
  [ValidateSet("external", "none")]
  [string]$OpenMode = "external"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$previewUrl = "http://127.0.0.1:$Port/phone?role=admin&view=dashboard"
$demoUrl = "http://127.0.0.1:$Port/demo?role=admin"
$logDir = Join-Path $env:TEMP "school-hub-preview"

function Require-Command {
  param(
    [string]$Name,
    [string]$InstallHint
  )

  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is not installed. $InstallHint"
  }
}

function Test-PreviewReady {
  param([string]$Url)

  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

Require-Command -Name "node" -InstallHint "Install Node.js from https://nodejs.org and run this launcher again."
Require-Command -Name "npm" -InstallHint "Install Node.js from https://nodejs.org and run this launcher again."

Set-Location $repoRoot

if (-not (Test-Path (Join-Path $repoRoot "node_modules"))) {
  Write-Host "Installing ClassLoop dependencies..."
  & npm.cmd install
  if ($LASTEXITCODE -ne 0) {
    throw "npm install failed."
  }
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

if (-not (Test-PreviewReady -Url $previewUrl)) {
  Write-Host "Starting ClassLoop preview server..."

  $serverCommand = @(
    "Set-Location '$repoRoot'"
    "npm.cmd run preview:phone"
  ) -join "; "

  Start-Process -FilePath "powershell.exe" -ArgumentList @(
    "-NoExit",
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    $serverCommand
  ) -WorkingDirectory $repoRoot | Out-Null

  $ready = $false
  $deadline = (Get-Date).AddMinutes(2)

  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2

    if (Test-PreviewReady -Url $previewUrl) {
      $ready = $true
      break
    }
  }

  if (-not $ready) {
    throw "ClassLoop did not start within 2 minutes. Run npm run preview:phone in the repo to inspect the server directly."
  }
}

Write-Host ""
Write-Host "ClassLoop preview is ready."
Write-Host "Preview: $previewUrl"
Write-Host "Demo:    $demoUrl"

if ($OpenMode -eq "external") {
  Write-Host "Opening ClassLoop phone preview..."
  Start-Process $previewUrl | Out-Null
}
