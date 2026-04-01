param(
  [string]$Distro = "Debian"
)

$linuxScript = @"
set -e
sudo apt-get update
sudo apt-get install -y curl git make python3 qemu-system-x86 qemu-system-arm
echo "Instalación base completada. Instala kraft según la guía oficial de tu entorno."
"@

wsl.exe -d $Distro -- bash -lc $linuxScript
