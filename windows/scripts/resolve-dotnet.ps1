param(
  [switch]$InstallIfMissing,
  [string]$Channel = "8.0",
  [string]$InstallDir
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

if ([string]::IsNullOrWhiteSpace($InstallDir))
{
  $InstallDir = Join-Path $repoRoot ".tools\dotnet"
}

$command = Get-Command dotnet -ErrorAction SilentlyContinue
if ($command -and $command.Source)
{
  $command.Source
  return
}

$localDotnet = Join-Path $InstallDir "dotnet.exe"
if (Test-Path $localDotnet)
{
  $localDotnet
  return
}

if (-not $InstallIfMissing)
{
  throw "No se encontro dotnet. Instala .NET 8 SDK o ejecuta este script con -InstallIfMissing."
}

$toolsDir = Split-Path -Parent $InstallDir
New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null

$installerScript = Join-Path $toolsDir "dotnet-install.ps1"
if (-not (Test-Path $installerScript))
{
  Invoke-WebRequest "https://dot.net/v1/dotnet-install.ps1" -OutFile $installerScript
}

& powershell -ExecutionPolicy Bypass -File $installerScript -Channel $Channel -InstallDir $InstallDir

if ($LASTEXITCODE -ne 0 -or -not (Test-Path $localDotnet))
{
  throw "No se pudo instalar dotnet en $InstallDir."
}

$localDotnet
