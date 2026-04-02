# 📦 Publish and Install — Windows

> Cómo dejar operativa v1 en un equipo Windows desde cero.
> Para la guía completa → [docs/05-packaging-and-publish.md](../docs/05-packaging-and-publish.md)

---

## 🪟 Paso 1 · Instalar WSL2 y una distro

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-wsl-debian.ps1 -Distro Ubuntu
```

---

## 📦 Paso 2 · Instalar dependencias base en WSL

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-runtime-prereqs.ps1 -Distro Ubuntu
```

Luego completa el runtime:

```powershell
wsl.exe -u root -d Ubuntu -- bash -lc "apt-get update && apt-get install -y --no-install-recommends bison build-essential flex git libncurses-dev qemu-system socat unzip wget iptables"
```

---

## ⚡ Paso 3 · Instalar KraftKit

```powershell
wsl.exe -d Ubuntu -- bash /mnt/c/dev/unikernel-labs/scripts/install-kraft-wsl.sh
```

---

## 🩺 Paso 4 · Validar entorno

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\doctor-windows.ps1 -Distro Ubuntu -LinuxRepoPath /mnt/c/dev/unikernel-labs
```

---

## 🖥️ Paso 5 · Levantar el dashboard local

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Verifica la API:

```powershell
Invoke-RestMethod http://127.0.0.1:9091/api/diagnostics | ConvertTo-Json
```

---

## 🚀 Paso 6 · Generar el instalador de Windows

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

Este flujo ejecuta en orden:

1. ✅ Sincroniza `labs.windows.json`
2. ✅ Valida el flujo localhost
3. ✅ Corre `dotnet test`
4. ✅ `dotnet publish` self-contained
5. ✅ Compila el instalador con Inno Setup
6. ✅ Instala, abre y desinstala para verificar

### Artefactos generados

```text
artifacts/publish/win-x64/UnikernelLabs.Launcher.exe
artifacts/installer/UnikernelControlCenter-1.0.0-win-x64-setup.exe
```

### Solo el ejecutable portable

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

O manualmente:

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

---

## ✅ Paso 7 · Verificar un instalador ya generado

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\verify-windows-installer.ps1 `
  -InstallerPath .\artifacts\installer\UnikernelControlCenter-1.0.0-win-x64-setup.exe
```

---

## ⚙️ Paso 8 · Configurar el launcher

Al abrir el launcher instalado o publicado, configura:

| Campo | Valor ejemplo |
|---|---|
| Distro WSL2 | `Ubuntu` |
| Ruta Linux del repo | `/mnt/c/dev/unikernel-labs` |

---

## 🧪 Paso 9 · Validar la superficie localhost

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

---

## ⚙️ Paso 10 · CI del instalador

El workflow `.github/workflows/build-windows-installer.yml` compila y verifica
el instalador en `windows-latest` y publica el `.exe` como artifact de GitHub Actions.

---

## 🔄 Nota de sincronización del catálogo

> [!IMPORTANT]
> Si cambias `labs.config.json` antes de publicar, sincroniza siempre:
>
> ```powershell
> node scripts/sync-launcher-catalog.js
> ```

---

📖 Ver también: [README.md](README.md) · [docs/05-packaging-and-publish.md](../docs/05-packaging-and-publish.md) · [CONTRIBUTING.md](../CONTRIBUTING.md)
