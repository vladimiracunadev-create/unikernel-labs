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
    [string[]]$SearchRoots
  )

  $command = Get-Command ISCC.exe -ErrorAction SilentlyContinue
  if ($command -and $command.Source)
  {
    return $command.Source
  }

  foreach ($root in $SearchRoots)
  {
    if ([string]::IsNullOrWhiteSpace($root) -or -not (Test-Path $root))
    {
      continue
    }

    $match = Get-ChildItem -Path $root -Filter "ISCC.exe" -Recurse -File -ErrorAction SilentlyContinue |
      Select-Object -First 1

    if ($match)
    {
      return $match.FullName
    }
  }

  foreach ($candidate in @(
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe"
  ))
  {
    if (Test-Path $candidate)
    {
      return $candidate
    }
  }

  return $null
}

$searchRoots = @(
  $InstallDir,
  (Join-Path $repoRoot ".tools")
)

$existing = Find-Iscc -SearchRoots $searchRoots
if ($existing)
{
  $existing
  return
}

$choco = Get-Command choco -ErrorAction SilentlyContinue
if ($choco)
{
  Write-Host "Intentando instalar Inno Setup con Chocolatey..." -ForegroundColor Cyan
  & $choco.Source install innosetup --no-progress -y

  if ($LASTEXITCODE -eq 0)
  {
    $existing = Find-Iscc -SearchRoots $searchRoots
    if ($existing)
    {
      $existing
      return
    }
  }
}

$downloadDir = Join-Path $repoRoot ".tools\downloads"
New-Item -ItemType Directory -Force -Path $downloadDir | Out-Null
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

$installerPath = Join-Path $downloadDir "innosetup-installer.exe"
Invoke-WebRequest "https://jrsoftware.org/download.php/is.exe" -OutFile $installerPath

$installProcess = Start-Process -FilePath $installerPath `
  -ArgumentList @("/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART", "/SP-", "/DIR=$InstallDir") `
  -Wait `
  -PassThru

if ($installProcess.ExitCode -ne 0)
{
  throw "La instalacion de Inno Setup fallo con codigo $($installProcess.ExitCode)."
}

$iscc = Find-Iscc -SearchRoots $searchRoots
if (-not $iscc)
{
  throw "No se encontro ISCC.exe despues de instalar Inno Setup."
}

$iscc
