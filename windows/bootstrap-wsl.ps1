param(
  [string]$Distro = "Debian"
)

Write-Host "Bootstrap básico de WSL2 para Unikernel Control Center v1" -ForegroundColor Cyan
wsl --install -d $Distro
Write-Host "Después del reinicio, instala kraft dentro de la distro y clona el repo en ~/dev/unikernel-labs." -ForegroundColor Yellow
