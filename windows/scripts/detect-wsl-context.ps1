param()

Write-Host "== WSL distros detectadas ==" -ForegroundColor Cyan
wsl.exe -l -q

$preferred = @('Debian','Ubuntu','Ubuntu-24.04','Ubuntu-22.04')
$distros = (wsl.exe -l -q) | Where-Object { $_ -and $_.Trim() -ne '' } | ForEach-Object { $_.Trim() }
$selected = $null
foreach ($name in $preferred) {
  $match = $distros | Where-Object { $_ -ieq $name } | Select-Object -First 1
  if ($match) { $selected = $match; break }
}
if (-not $selected -and $distros.Count -gt 0) { $selected = $distros[0] }

if (-not $selected) {
  Write-Host "No se detectaron distros WSL. Instala Debian o Ubuntu primero." -ForegroundColor Yellow
  exit 1
}

Write-Host ""
Write-Host "Distro sugerida: $selected" -ForegroundColor Green
Write-Host ""
Write-Host "== Candidatas de ruta Linux para unikernel-labs ==" -ForegroundColor Cyan
wsl.exe -d $selected -- bash -lc 'for p in "$HOME/dev/unikernel-labs" "$HOME/projects/unikernel-labs" "$HOME/src/unikernel-labs" "$HOME/work/unikernel-labs" "$HOME/code/unikernel-labs"; do [ -d "$p" ] && echo "$p"; done; find "$HOME" -maxdepth 5 -type d -name "unikernel-labs" 2>/dev/null | head -n 8'
