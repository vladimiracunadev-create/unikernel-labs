param()

# WSL_UTF8=1 hace que `wsl.exe -l` emita UTF-8 en vez de UTF-16LE, evitando
# nombres de distro con bytes NUL intercalados que rompen las comparaciones.
$env:WSL_UTF8 = "1"

Write-Host "== WSL distros detectadas ==" -ForegroundColor Cyan
wsl.exe -l -q

$preferred = @('Debian','Ubuntu','Ubuntu-24.04','Ubuntu-22.04')
# @(...) fuerza array aunque haya una sola distro (si no, $distros.Count es
# $null y $distros[0] devolvería el primer carácter). -replace limpia NUL residual.
$distros = @(wsl.exe -l -q) |
  ForEach-Object { ($_ -replace "`0", '').Trim() } |
  Where-Object { $_ -ne '' }

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
