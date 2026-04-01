param(
  [string]$InstallDir
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path

if ([string]::IsNullOrWhiteSpace($InstallDir))
{
  $InstallDir = Join-Path $repoRoot ".tools\InnoSetup"
}

function Find-Iscc {
  param(
    [string]$BaseDirectory
  )

  if (-not (Test-Path $BaseDirectory))
  {
    return $null
  }

  $match = Get-ChildItem -Path $BaseDirectory -Filter "ISCC.exe" -Recurse -File -ErrorAction SilentlyContinue |
    Select-Object -First 1

  if ($match)
  {
    return $match.FullName
  }

  return $null
}

$existing = Find-Iscc -BaseDirectory $InstallDir
if ($existing)
{
  $existing
  return
}

$downloadDir = Join-Path $repoRoot ".tools\downloads"
New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$installerPath = Join-Path $downloadDir "innosetup-installer.exe"
Invoke-WebRequest "https://jrsoftware.org/download.php/is.exe" -OutFile $installerPath

& $installerPath "/VERYSILENT" "/SUPPRESSMSGBOXES" "/NORESTART" "/SP-" "/DIR=$InstallDir"

if ($LASTEXITCODE -ne 0)
{
  throw "La instalacion de Inno Setup fallo con codigo $LASTEXITCODE."
}

$iscc = Find-Iscc -BaseDirectory $InstallDir
if (-not $iscc)
{
  throw "No se encontro ISCC.exe despues de instalar Inno Setup en $InstallDir."
}

$iscc
