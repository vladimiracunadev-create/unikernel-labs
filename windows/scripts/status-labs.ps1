param(
  [string]$Distro = "Debian"
)

wsl.exe -d $Distro -- bash -lc "kraft ps"
