param(
  [string]$Distro = "Debian",
  [string]$LinuxRepoPath = "/home/$USER/dev/unikernel-labs"
)

Write-Host "=== Windows / WSL2 doctor ===" -ForegroundColor Cyan
wsl -l -v

Write-Host "`n=== Linux doctor ===" -ForegroundColor Cyan
wsl.exe -d $Distro -- bash -lc "cd $LinuxRepoPath && bash scripts/doctor.sh"
