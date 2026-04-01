param(
  [string]$Distro = "Debian"
)

Write-Host "Instalando WSL2 con distro $Distro..." -ForegroundColor Cyan
wsl --install -d $Distro
Write-Host "Si Windows solicita reinicio, aplícalo antes de continuar." -ForegroundColor Yellow
