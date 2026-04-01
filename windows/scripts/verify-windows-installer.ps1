param(
  [Parameter(Mandatory = $true)]
  [string]$InstallerPath,
  [string]$InstallDir,
  [switch]$KeepInstalled
)

$ErrorActionPreference = "Stop"

$resolvedInstaller = (Resolve-Path $InstallerPath).Path

if ([string]::IsNullOrWhiteSpace($InstallDir))
{
  $InstallDir = Join-Path $env:TEMP "UnikernelControlCenter-InstallTest"
}

$installParent = Split-Path -Parent $InstallDir
New-Item -ItemType Directory -Force -Path $installParent | Out-Null

$logPath = Join-Path $installParent "UnikernelControlCenter-InstallTest.log"

if (Test-Path $InstallDir)
{
  Remove-Item -LiteralPath $InstallDir -Recurse -Force
}

$installProcess = Start-Process -FilePath $resolvedInstaller `
  -ArgumentList @("/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART", "/SP-", "/DIR=$InstallDir", "/LOG=$logPath") `
  -Wait `
  -PassThru

if ($installProcess.ExitCode -ne 0)
{
  throw "La instalacion silenciosa fallo con codigo $($installProcess.ExitCode). Revisa $logPath."
}

$exePath = Join-Path $InstallDir "UnikernelLabs.Launcher.exe"
$catalogPath = Join-Path $InstallDir "labs.windows.json"
$logoPath = Join-Path $InstallDir "logo.png"
$iconPath = Join-Path $InstallDir "app.ico"

foreach ($path in @($exePath, $catalogPath, $logoPath, $iconPath))
{
  if (-not (Test-Path $path))
  {
    throw "Falta un archivo esperado del instalador: $path"
  }
}

$process = Start-Process -FilePath $exePath -WorkingDirectory $InstallDir -PassThru
try
{
  $null = $process.WaitForInputIdle(10000)
}
catch
{
  # Algunos entornos devuelven excepcion si la ventana principal tarda en exponerse.
}

Start-Sleep -Seconds 3
$process.Refresh()

if ($process.HasExited)
{
  throw "El launcher cerro al iniciar. ExitCode: $($process.ExitCode)"
}

$null = $process.CloseMainWindow()
if (-not $process.WaitForExit(5000))
{
  Stop-Process -Id $process.Id -Force
}

if (-not $KeepInstalled)
{
  $uninstaller = Get-ChildItem -Path $InstallDir -Filter "unins*.exe" -File | Select-Object -First 1
  if ($uninstaller)
  {
    $uninstallProcess = Start-Process -FilePath $uninstaller.FullName `
      -ArgumentList @("/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART") `
      -Wait `
      -PassThru

    if ($uninstallProcess.ExitCode -ne 0)
    {
      throw "La desinstalacion de verificacion fallo con codigo $($uninstallProcess.ExitCode)."
    }
  }
}

Write-Host "Instalador verificado correctamente." -ForegroundColor Green
Write-Host "Instalador: $resolvedInstaller"
Write-Host "Log: $logPath"
