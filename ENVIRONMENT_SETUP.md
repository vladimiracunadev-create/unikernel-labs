# 🔧 ENVIRONMENT_SETUP — Unikernel Control Center v1

> Guía completa para preparar un host Windows para usar `unikernel-labs`.
> Para operación del día a día, consulta [RUNBOOK.md](RUNBOOK.md).

---

## Objetivo

Preparar un host Windows con el flujo real del producto:

- 🖥️ Dashboard local en Windows
- 🐧 Backend WSL2
- 🌐 Servicios publicados en `localhost`
- 🪟 Opción de usar también la app de escritorio WinForms

---

## 🪟 Paso 1 · Instalar Windows + WSL2

Instala una distro recomendada (idealmente `Ubuntu`):

```powershell
wsl --install -d Ubuntu
```

Reinicia si Windows lo solicita.

---

## 📁 Paso 2 · Elegir la ubicación del repo

Hay dos layouts válidos:

### 🅐 Repo en Windows _(recomendado)_

Prioriza el dashboard Node en Windows y la app de escritorio:

```text
C:\dev\unikernel-labs
```

Visto desde WSL:

```text
/mnt/c/dev/unikernel-labs
```

> [!TIP]
> Este es el layout validado para el flujo actual de `localhost`. Úsalo si quieres la experiencia más directa.

### 🅑 Repo en filesystem Linux

Recomendado si trabajarás principalmente desde consola Linux:

```bash
mkdir -p ~/dev
cd ~/dev
git clone <TU-REPO-GITHUB> unikernel-labs
cd unikernel-labs
```

---

## 📦 Paso 3 · Instalar dependencias base en WSL

Desde PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-runtime-prereqs.ps1 -Distro Ubuntu
```

Luego instala las dependencias de runtime como `root` en WSL:

```powershell
wsl.exe -u root -d Ubuntu -- bash -lc "apt-get update && apt-get install -y --no-install-recommends bison build-essential flex git libncurses-dev qemu-system socat unzip wget iptables"
```

---

## ⚡ Paso 4 · Instalar KraftKit

Si el repo está en `C:\dev\unikernel-labs`:

```powershell
wsl.exe -d Ubuntu -- bash /mnt/c/dev/unikernel-labs/scripts/install-kraft-wsl.sh
```

Si el repo está en una ruta Linux:

```bash
bash scripts/install-kraft-wsl.sh
```

El script instala `kraft` y `kraftld` en `~/.local/bin` y actualiza `~/.profile`.

Verifica con:

```powershell
wsl.exe -d Ubuntu -- bash -lc "source ~/.profile; kraft version"
```

---

## 🩺 Paso 5 · Diagnóstico inicial

```powershell
wsl.exe -d Ubuntu -- bash -lc "source ~/.profile; cd /mnt/c/dev/unikernel-labs && bash scripts/doctor.sh"
```

Resultado esperado:

| Check | Esperado |
|---|---|
| `/dev/kvm` | ✅ existe |
| `kraft version` | ✅ responde |
| `qemu-system-x86_64` | ✅ instalado |
| `iptables` | ✅ disponible |

---

## 🖥️ Paso 6 · Levantar el dashboard local

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Abre → **[http://localhost:9091](http://localhost:9091)**

El panel de diagnóstico debe mostrar:

- Distro WSL detectada
- Versión de `kraft`
- API activa

---

## 🧪 Paso 7 · Validar un servicio real

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

## 🪟 Paso 8 · Launcher Windows _(opcional)_

Build recomendado del instalador:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

Solo el ejecutable portable:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

Al abrir la app, configura:

- `WSL distro`: por ejemplo `Ubuntu`
- `Linux repo path`: por ejemplo `/mnt/c/dev/unikernel-labs`

📖 Más info → [`docs/05-packaging-and-publish.md`](docs/05-packaging-and-publish.md)

---

## 🔥 Paso 9 · Troubleshooting rápido

> [!WARNING]
> Si `localhost` no responde, sigue este checklist en orden:

1. Revisa `http://localhost:9091/api/diagnostics`
2. Ejecuta `bash scripts/doctor.sh` dentro de WSL
3. Confirma `kraft version` _(dentro de WSL con `source ~/.profile`)_
4. Confirma `qemu-system-x86_64 --version`
5. Confirma `iptables --version`
6. Revisa `kraft ps`
7. Revisa `kraft logs <nombre>`
8. Confirma que no haya colisión de puertos en `8080`, `8081`, `8082`, `6379` o `9091`

---

📖 Ver también: [RUNBOOK.md](RUNBOOK.md) · [COMPATIBILITY.md](COMPATIBILITY.md) · [docs/00-windows-and-wsl2.md](docs/00-windows-and-wsl2.md)
