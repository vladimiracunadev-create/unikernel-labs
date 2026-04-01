# ENVIRONMENT_SETUP

## Objetivo

Preparar un host Windows para usar `unikernel-labs` con el flujo real del producto:

- dashboard local en Windows
- backend WSL2
- servicios publicados en `localhost`
- opcion de usar tambien la app de escritorio WinForms

---

## 1. Instalar Windows + WSL2

Instala una distro recomendada, idealmente `Ubuntu`:

```powershell
wsl --install -d Ubuntu
```

Reinicia si Windows lo solicita.

---

## 2. Elegir la ubicacion del repo

Hay dos layouts validos:

### Opcion A: repo en Windows

Recomendada si quieres priorizar el dashboard Node en Windows y la app de escritorio:

```text
C:\dev\unikernel-labs
```

En WSL eso se ve como:

```text
/mnt/c/dev/unikernel-labs
```

Este fue el layout validado para el flujo actual de `localhost`.

### Opcion B: repo en filesystem Linux

Recomendada si vas a trabajar mas tiempo desde consola Linux:

```bash
mkdir -p ~/dev
cd ~/dev
git clone <TU-REPO-GITHUB> unikernel-labs
cd unikernel-labs
```

---

## 3. Instalar dependencias base en WSL

Desde PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-runtime-prereqs.ps1 -Distro Ubuntu
```

Ese script instala una base minima. Para dejar el runtime listo para los labs de red, instala tambien:

```powershell
wsl.exe -u root -d Ubuntu -- bash -lc "apt-get update && apt-get install -y --no-install-recommends bison build-essential flex git libncurses-dev qemu-system socat unzip wget iptables"
```

---

## 4. Instalar KraftKit

Si el repo esta en `C:\dev\unikernel-labs`:

```powershell
wsl.exe -d Ubuntu -- bash /mnt/c/dev/unikernel-labs/scripts/install-kraft-wsl.sh
```

Si el repo esta en una ruta Linux:

```bash
bash scripts/install-kraft-wsl.sh
```

Ese script:

- instala `kraft` y `kraftld` en `~/.local/bin`
- agrega `~/.local/bin` al `PATH` en `~/.profile`

Verifica:

```powershell
wsl.exe -d Ubuntu -- bash -lc "source ~/.profile; kraft version"
```

---

## 5. Diagnostico inicial

Si el repo esta en `C:\dev\unikernel-labs`:

```powershell
wsl.exe -d Ubuntu -- bash -lc "source ~/.profile; cd /mnt/c/dev/unikernel-labs && bash scripts/doctor.sh"
```

Debes ver al menos:

- `/dev/kvm` existe
- `kraft version` responde
- `qemu-system-x86_64` instalado

---

## 6. Levantar el dashboard local

Desde PowerShell:

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Abre:

```text
http://localhost:9091
```

El panel de diagnostico debe mostrar:

- distro WSL detectada
- version de `kraft`
- API activa

---

## 7. Validar un servicio real

Inicia `nginx-runtime` desde la UI o por API:

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start
```

Valida health:

```powershell
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

---

## 8. Launcher Windows

Publica o ejecuta la app:

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

Al abrir la app, configura:

- `WSL distro`: por ejemplo `Ubuntu`
- `Linux repo path`: por ejemplo `/mnt/c/dev/unikernel-labs` o `/home/<tu_usuario>/dev/unikernel-labs`

---

## 9. Troubleshooting rapido

Si `localhost` no responde:

1. revisa `http://localhost:9091/api/diagnostics`
2. revisa `bash scripts/doctor.sh` dentro de WSL
3. confirma `kraft version`
4. confirma `qemu-system-x86_64 --version`
5. confirma `iptables --version`
6. revisa `kraft ps`
7. revisa `kraft logs <nombre>`
8. confirma que no haya colision de puertos en `8080`, `8081`, `8082`, `6379` o `9091`
