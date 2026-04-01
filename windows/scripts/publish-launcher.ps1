param(
  [string]$Runtime = "win-x64",
  [string]$Configuration = "Release"
)

$project = ".\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj"

dotnet publish $project `
  -c $Configuration `
  -r $Runtime `
  --self-contained true `
  /p:PublishSingleFile=true

Write-Host "Publicación completada." -ForegroundColor Green
