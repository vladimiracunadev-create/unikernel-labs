# RUNBOOK

## Flujo operativo recomendado

### 1. Validar WSL

```powershell
wsl.exe -d Ubuntu -- bash -lc "source ~/.profile; cd /mnt/c/dev/unikernel-labs && bash scripts/doctor.sh"
```

### 2. Levantar el dashboard local

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Abrir:

```text
http://localhost:9091
```

### 3. Iniciar un lab desde la API del dashboard

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start
```

### 4. Verificar el servicio real

```powershell
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

---

## Nombres de instancia

| Lab | Nombre de instancia |
|---|---|
| hello-world | `ukl-hello` |
| nginx-runtime | `ukl-nginx` |
| python-http | `ukl-python` |
| node-http | `ukl-node` |
| redis-runtime | `ukl-redis` |

---

## Puertos

| Servicio | Puerto |
|---|---:|
| dashboard local + API | 9091 |
| nginx | 8080 |
| python | 8081 |
| node | 8082 |
| redis | 6379 |

---

## Comandos rapidos

### Estado

```bash
kraft ps
```

### Logs

```bash
kraft logs ukl-nginx
kraft logs ukl-python
kraft logs ukl-node
kraft logs ukl-redis
```

### Detener

```bash
kraft stop ukl-nginx
kraft stop ukl-python
kraft stop ukl-node
kraft stop ukl-redis
```

### Verificacion automatizada

```powershell
# desde la raiz del repo
node scripts/verify-localhost.js
```

---

## Uso desde la app Windows

- iniciar `UnikernelLabs.Launcher.exe`
- seleccionar distro WSL
- indicar path Linux del repo
- elegir lab
- usar `Start`, `Stop`, `Logs`, `Health`, `Open` y `Status`

El launcher usa el mismo modelo de `localhost` que el dashboard.

---

## Criterio operativo

- Windows es la capa de UX
- WSL2 es la capa tecnica
- `kraft`, QEMU y `iptables` viven en Linux
- los servicios deben exponerse en puertos fijos
- el catalogo fuente vive en `labs.config.json`
- el catalogo del launcher se genera desde ese archivo
