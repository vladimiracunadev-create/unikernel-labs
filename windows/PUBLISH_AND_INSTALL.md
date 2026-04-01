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

## 6. Publicar el launcher

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

## 7. Configurar el launcher

Al abrir el ejecutable publicado, configura:

- distro WSL2: `Ubuntu`
- ruta Linux del repo: `/mnt/c/dev/unikernel-labs` o la ruta Linux equivalente

## 8. Validar la superficie localhost

Desde el dashboard o desde la app Windows, prueba un lab como `nginx-runtime`.

Por API:

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

## 9. Nota de packaging

`labs.windows.json` se genera desde `labs.config.json`.

Si cambias el catalogo antes de publicar:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```
