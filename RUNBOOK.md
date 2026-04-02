# 🛠️ RUNBOOK — Unikernel Control Center v1

> Guía operativa del día a día para levantar, monitorear y detener labs unikernel desde Windows.
> Para el setup inicial, consulta [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

---

## 🩺 1 · Validar WSL antes de operar

```powershell
wsl.exe -d Ubuntu -- bash -lc "source ~/.profile; cd /mnt/c/dev/unikernel-labs && bash scripts/doctor.sh"
```

Debes ver:

- ✅ `/dev/kvm` existe
- ✅ `kraft version` responde
- ✅ `qemu-system-x86_64` instalado

---

## 🖥️ 2 · Levantar el dashboard local

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Abre → **[http://localhost:9091](http://localhost:9091)**

---

## ▶️ 3 · Iniciar un lab desde la API

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start
```

---

## ✅ 4 · Verificar el servicio real

```powershell
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

---

## 📡 Puertos

| Servicio | Puerto | URL |
|---|---:|---|
| 🖥️ Dashboard + API | 9091 | http://localhost:9091 |
| 🌐 nginx | 8080 | http://localhost:8080 |
| 🐍 python | 8081 | http://localhost:8081 |
| 🟢 node | 8082 | http://localhost:8082 |
| 🗄️ redis | 6379 | redis://localhost:6379 |

---

## 🏷️ Nombres de instancia

| Lab | Instancia kraft |
|---|---|
| hello-world | `ukl-hello` |
| nginx-runtime | `ukl-nginx` |
| python-http | `ukl-python` |
| node-http | `ukl-node` |
| redis-runtime | `ukl-redis` |

---

## ⚡ Comandos rápidos (dentro de WSL)

### Estado general

```bash
kraft ps
```

### Logs por servicio

```bash
kraft logs ukl-nginx
kraft logs ukl-python
kraft logs ukl-node
kraft logs ukl-redis
```

### Detener servicios

```bash
kraft stop ukl-nginx
kraft stop ukl-python
kraft stop ukl-node
kraft stop ukl-redis
```

### Verificación automatizada (desde Windows)

```powershell
# desde la raíz del repo
node scripts/verify-localhost.js
# o
make test-dashboard
```

---

## 🪟 Uso desde la app Windows

1. Inicia `UnikernelLabs.Launcher.exe`
2. Selecciona distro WSL (autodetectada)
3. Indica el path Linux del repo (ej. `/mnt/c/dev/unikernel-labs`)
4. Elige un lab de la grilla
5. Usa `Start` · `Stop` · `Logs` · `Health` · `Open` · `Status`

> [!NOTE]
> El launcher usa el mismo modelo de `localhost` que el dashboard. No son implementaciones desconectadas.

---

## 🏗️ Criterio operativo

| Capa | Responsabilidad |
|---|---|
| 🪟 Windows | Capa de UX (dashboard, launcher) |
| 🐧 WSL2 | Capa técnica (kraft, QEMU, iptables) |
| 🌐 localhost | Superficie de servicios expuestos |
| 📋 `labs.config.json` | Fuente de verdad del catálogo |

---

📖 Ver también: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) · [CONTRIBUTING.md](CONTRIBUTING.md) · [docs/04-windows-localhost-launcher.md](docs/04-windows-localhost-launcher.md)
