param(
  [string]$Runtime = "win-x64",
  [string]$Configuration = "Release",
  [string]$Version,
  [switch]$SkipTests,
  [switch]$SkipLocalhostChecks,
  [switch]$SkipInstallerVerification
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$projectPath = Join-Path $repoRoot "launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj"
$testsPath = Join-Path $repoRoot "launcher\windows\src\UnikernelLabs.Launcher.Tests\UnikernelLabs.Launcher.Tests.csproj"
$installerScript = Join-Path $repoRoot "windows\installer\UnikernelControlCenter.iss"
$publishDir = Join-Path $repoRoot "artifacts\publish\$Runtime"
$outputDir = Join-Path $repoRoot "artifacts\installer"
$dotnetHome = Join-Path $repoRoot ".tools\dotnet-home"
$nugetPackages = Join-Path $repoRoot ".tools\nuget-packages"
$nugetHttpCache = Join-Path $repoRoot ".tools\nuget-http-cache"
$nugetConfig = Join-Path $repoRoot "NuGet.Config"

New-Item -ItemType Directory -Force -Path $publishDir | Out-Null
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
New-Item -ItemType Directory -Force -Path $dotnetHome | Out-Null
New-Item -ItemType Directory -Force -Path $nugetPackages | Out-Null
New-Item -ItemType Directory -Force -Path $nugetHttpCache | Out-Null

$dotnet = & (Join-Path $PSScriptRoot "resolve-dotnet.ps1") -InstallIfMissing
$iscc = & (Join-Path $PSScriptRoot "install-inno-setup.ps1")
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

$env:DOTNET_CLI_HOME = $dotnetHome
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = "1"
$env:DOTNET_NOLOGO = "1"
$env:NUGET_PACKAGES = $nugetPackages
$env:NUGET_HTTP_CACHE_PATH = $nugetHttpCache

if (-not $nodeCommand)
{
  throw "No se encontro node en PATH. Es necesario para sincronizar el catalogo y correr las verificaciones localhost."
}

$node = $nodeCommand.Source

if ([string]::IsNullOrWhiteSpace($Version))
{
  [xml]$projectXml = Get-Content -Path $projectPath
  $Version = $projectXml.Project.PropertyGroup.Version
}

Write-Host "Sincronizando catalogo del launcher..." -ForegroundColor Cyan
& $node (Join-Path $repoRoot "scripts\sync-launcher-catalog.js")
if ($LASTEXITCODE -ne 0)
{
  throw "La sincronizacion del catalogo fallo con codigo $LASTEXITCODE."
}

if (-not $SkipLocalhostChecks)
{
  Write-Host "Ejecutando validaciones localhost..." -ForegroundColor Cyan
  & $node (Join-Path $repoRoot "scripts\verify-localhost.js")
  if ($LASTEXITCODE -ne 0)
  {
    throw "Las validaciones localhost fallaron con codigo $LASTEXITCODE."
  }
}

if (-not $SkipTests)
{
  Write-Host "Ejecutando pruebas del launcher..." -ForegroundColor Cyan
  & $dotnet restore $testsPath --configfile $nugetConfig --nologo
  if ($LASTEXITCODE -ne 0)
  {
    throw "dotnet restore fallo con codigo $LASTEXITCODE."
  }

  & $dotnet test $testsPath -c $Configuration --no-restore --nologo
  if ($LASTEXITCODE -ne 0)
  {
    throw "dotnet test fallo con codigo $LASTEXITCODE."
  }
}

Write-Host "Publicando launcher..." -ForegroundColor Cyan
& $dotnet publish $projectPath `
  -c $Configuration `
  -r $Runtime `
  --self-contained true `
  /p:PublishSingleFile=true `
  --configfile $nugetConfig `
  -o $publishDir

if ($LASTEXITCODE -ne 0)
{
  throw "dotnet publish fallo con codigo $LASTEXITCODE."
}

Write-Host "Compilando instalador..." -ForegroundColor Cyan
& $iscc `
  "/DMyAppVersion=$Version" `
  "/DMyPublishDir=$publishDir" `
  "/DMyRepoRoot=$repoRoot" `
  "/DMyOutputDir=$outputDir" `
  $installerScript

if ($LASTEXITCODE -ne 0)
{
  throw "La compilacion del instalador fallo con codigo $LASTEXITCODE."
}

$installer = Get-ChildItem -Path $outputDir -Filter "*-setup.exe" -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $installer)
{
  throw "No se encontro el instalador generado en $outputDir."
}

if (-not $SkipInstallerVerification)
{
  Write-Host "Verificando instalador..." -ForegroundColor Cyan
  & (Join-Path $PSScriptRoot "verify-windows-installer.ps1") -InstallerPath $installer.FullName
  if ($LASTEXITCODE -ne 0)
  {
    throw "La verificacion del instalador fallo con codigo $LASTEXITCODE."
  }
}

Write-Host "Instalador generado en $($installer.FullName)" -ForegroundColor Green
