param(
  [string]$Distro = "Debian",
  [string]$LinuxRepoPath
)

$env:WSL_UTF8 = "1"

if (-not $LinuxRepoPath) {
  # Resuelve el HOME real de la distro. Evita el bug de "/home/$USER/…":
  # $USER es una variable de bash, no de PowerShell (en PS expande a vacío).
  $wslHome = wsl.exe -d $Distro -- bash -lc 'printf %s "$HOME"'
  if ($wslHome) { $wslHome = ($wslHome -replace "`0", '').Trim() }
  if (-not $wslHome) { $wslHome = "/root" }
  $LinuxRepoPath = "$wslHome/dev/unikernel-labs"
}

Write-Host "=== Windows / WSL2 doctor ===" -ForegroundColor Cyan
wsl -l -v

Write-Host "`n=== Linux doctor ===" -ForegroundColor Cyan
# La ruta va como argumento posicional ($1), entrecomillada en bash.
wsl.exe -d $Distro -- bash -lc 'cd "$1" && bash scripts/doctor.sh' bash $LinuxRepoPath
