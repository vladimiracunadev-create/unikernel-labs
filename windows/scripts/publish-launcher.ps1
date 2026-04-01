param(
  [string]$Runtime = "win-x64",
  [string]$Configuration = "Release",
  [string]$OutputDir
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$project = Join-Path $repoRoot "launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj"
$dotnet = & (Join-Path $PSScriptRoot "resolve-dotnet.ps1") -InstallIfMissing
$dotnetHome = Join-Path $repoRoot ".tools\dotnet-home"
$nugetPackages = Join-Path $repoRoot ".tools\nuget-packages"
$nugetHttpCache = Join-Path $repoRoot ".tools\nuget-http-cache"
$nugetConfig = Join-Path $repoRoot "NuGet.Config"

if ([string]::IsNullOrWhiteSpace($OutputDir))
{
  $OutputDir = Join-Path $repoRoot "artifacts\publish\$Runtime"
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
New-Item -ItemType Directory -Force -Path $dotnetHome | Out-Null
New-Item -ItemType Directory -Force -Path $nugetPackages | Out-Null
New-Item -ItemType Directory -Force -Path $nugetHttpCache | Out-Null

$env:DOTNET_CLI_HOME = $dotnetHome
$env:DOTNET_SKIP_FIRST_TIME_EXPERIENCE = "1"
$env:DOTNET_NOLOGO = "1"
$env:NUGET_PACKAGES = $nugetPackages
$env:NUGET_HTTP_CACHE_PATH = $nugetHttpCache

& $dotnet publish $project `
  -c $Configuration `
  -r $Runtime `
  --self-contained true `
  /p:PublishSingleFile=true `
  --configfile $nugetConfig `
  -o $OutputDir

if ($LASTEXITCODE -ne 0)
{
  throw "dotnet publish fallo con codigo $LASTEXITCODE."
}

Write-Host "Publicacion completada en $OutputDir" -ForegroundColor Green
