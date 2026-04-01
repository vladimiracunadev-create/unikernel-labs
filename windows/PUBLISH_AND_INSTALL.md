# Publish and install (Windows)

Esta guia resume como dejar operativa la v1 en un equipo Windows.

## 1. Instalar WSL2 y una distro

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-wsl-debian.ps1 -Distro Ubuntu
```

## 2. Instalar dependencias base dentro de WSL

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-runtime-prereqs.ps1 -Distro Ubuntu
```

Luego completa el runtime:

```powershell
wsl.exe -u root -d Ubuntu -- bash -lc "apt-get update && apt-get install -y --no-install-recommends bison build-essential flex git libncurses-dev qemu-system socat unzip wget iptables"
```

## 3. Instalar KraftKit

Si el repo esta en `C:\dev\unikernel-labs`:

```powershell
wsl.exe -d Ubuntu -- bash /mnt/c/dev/unikernel-labs/scripts/install-kraft-wsl.sh
```

## 4. Validar entorno

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\doctor-windows.ps1 -Distro Ubuntu -LinuxRepoPath /mnt/c/dev/unikernel-labs
```

## 5. Levantar el dashboard local

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Verifica:

```powershell
Invoke-RestMethod http://127.0.0.1:9091/api/diagnostics | ConvertTo-Json
```

## 6. Generar el instalador de Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

Este flujo ejecuta en orden:

- sincronizacion de `labs.windows.json`
- validaciones localhost
- pruebas del launcher
- `dotnet publish`
- compilacion del instalador con Inno Setup
- instalacion silenciosa + arranque del launcher + desinstalacion de verificacion

Artefactos esperados:

```text
artifacts/publish/win-x64/UnikernelLabs.Launcher.exe
artifacts/installer/UnikernelControlCenter-1.0.0-win-x64-setup.exe
```

Si solo quieres publicar el ejecutable portable, usa:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

o manualmente:

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

## 7. Instalar o verificar el instalador

Para validar un instalador ya generado:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\verify-windows-installer.ps1 `
  -InstallerPath .\artifacts\installer\UnikernelControlCenter-1.0.0-win-x64-setup.exe
```

## 8. Configurar el launcher

Al abrir el launcher instalado o publicado, configura:

- distro WSL2: `Ubuntu`
- ruta Linux del repo: `/mnt/c/dev/unikernel-labs` o la ruta Linux equivalente

## 9. Validar la superficie localhost

Desde el dashboard o desde la app Windows, prueba un lab como `nginx-runtime`.

Por API:

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

## 10. CI del instalador

El repo incluye el workflow:

```text
.github/workflows/build-windows-installer.yml
```

Ese workflow compila y verifica el instalador en `windows-latest` y publica el `.exe` como artifact de GitHub Actions.

## 11. Nota de packaging

`labs.windows.json` se genera desde `labs.config.json`.

Si cambias el catalogo antes de publicar:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```
