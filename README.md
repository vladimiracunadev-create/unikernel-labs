# unikernel-labs

![Unikernel Control Center v1](assets/branding/cover-v7.svg)

> **Unikernel Control Center v1**
> Suite local para levantar y gobernar servicios unikernel desde Windows, usando WSL2 como backend Linux y `localhost` como superficie operativa.

![Build](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/unikernel-labs/dotnet-launcher.yml?branch=main&label=build)
![Tests](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/unikernel-labs/dotnet-launcher.yml?branch=main&label=tests)
![Release](https://img.shields.io/github/v/release/vladimiracunadev-create/unikernel-labs?label=release)
![Status](https://img.shields.io/badge/status-v1-blue)
![Mode](https://img.shields.io/badge/mode-Windows%20%2B%20WSL2%20%2B%20localhost-orange)
![License](https://img.shields.io/badge/license-Apache--2.0-green)

---

## Que es este repo

Este repo junta tres piezas que trabajan sobre la misma idea:

- un **dashboard local** en Node.js que corre en Windows y publica una API en `http://localhost:9091`
- una **aplicacion de escritorio WinForms** para Windows
- un conjunto de **labs unikernel** que se ejecutan dentro de WSL2 usando `kraft` y QEMU/KVM

La arquitectura correcta es esta:

```text
[ Navegador o app Windows ]
            |
            v
[ dashboard-server/server.js o launcher WinForms ]
            |
            v
[ wsl.exe -> Ubuntu/Debian ]
            |
            v
[ kraft + QEMU/KVM + iptables ]
            |
            v
[ servicios publicados en localhost ]
```

No es un dashboard estatico. No es un runtime Windows nativo para `kraft`. Es una capa de control Windows sobre un runtime Linux real.

---

## Estado actual

Lo que hoy esta implementado y documentado en este repo:

- dashboard local con REST API en `localhost:9091`
- diagnostico de WSL, distro y version de `kraft`
- start, stop, logs y health por lab
- catalogo raiz en `labs.config.json`
- catalogo del launcher generado desde ese catalogo raiz
- scripts para sincronizar catalogo y verificar el flujo localhost
- launcher WinForms que consume el mismo set de labs

Lo que se valido durante esta iteracion:

- arranque del dashboard en Windows
- deteccion de `Ubuntu` en WSL2
- instalacion de `kraft` dentro de WSL
- instalacion de dependencias de runtime (`qemu-system`, `iptables`, etc.)
- arranque real de `nginx-runtime`
- respuesta real en `http://localhost:8080`

---

## Fuente de verdad del catalogo

El catalogo operativo principal es:

- `labs.config.json`

El launcher usa:

- `launcher/windows/src/UnikernelLabs.Launcher/labs.windows.json`

Ese archivo del launcher **ya no se debe editar a mano**. Se genera desde el catalogo raiz con:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```

Si agregas o cambias labs, actualiza `labs.config.json` primero y luego sincroniza el catalogo del launcher.

---

## Componentes principales

| Componente | Rol |
|---|---|
| `dashboard-server/server.js` | API local + puente entre Windows y WSL |
| `index.html`, `dashboard.js`, `dashboard.css` | UI web del dashboard |
| `labs.config.json` | catalogo raiz de servicios |
| `scripts/sync-launcher-catalog.js` | genera el catalogo del launcher |
| `scripts/verify-localhost.js` | smoke test del flujo localhost |
| `launcher/windows/src/UnikernelLabs.Launcher/` | app WinForms de escritorio |
| `01-hello-world` a `08-kraft-cloud-track` | labs y pistas de trabajo |
| `windows/scripts/` | helpers de entorno y operacion desde Windows |

---

## Quickstart recomendado

### 1. Preparar Windows + WSL

Instala una distro WSL2, por ejemplo `Ubuntu`.

Si quieres la experiencia mas directa para Windows, deja el repo en:

```text
C:\dev\unikernel-labs
```

Desde WSL, esa ruta sera:

```text
/mnt/c/dev/unikernel-labs
```

Esa topologia fue la usada para validar el flujo actual del dashboard localhost.

### 2. Instalar dependencias base en Ubuntu

Desde PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-runtime-prereqs.ps1 -Distro Ubuntu
```

Luego instala las dependencias de runtime faltantes como `root` en WSL:

```powershell
wsl.exe -u root -d Ubuntu -- bash -lc "apt-get update && apt-get install -y --no-install-recommends bison build-essential flex git libncurses-dev qemu-system socat unzip wget iptables"
```

### 3. Instalar KraftKit dentro de WSL

Si el repo esta en `C:\dev\unikernel-labs`:

```powershell
wsl.exe -d Ubuntu -- bash /mnt/c/dev/unikernel-labs/scripts/install-kraft-wsl.sh
```

Si el repo esta en una ruta Linux, ejecuta el mismo script desde esa ruta Linux.

### 4. Validar el entorno

```powershell
wsl.exe -d Ubuntu -- bash -lc "source ~/.profile; cd /mnt/c/dev/unikernel-labs && bash scripts/doctor.sh"
```

### 5. Levantar el dashboard

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Abre:

```text
http://localhost:9091
```

### 6. Probar un lab real

Puedes iniciar `nginx-runtime` desde la UI o por API:

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start
```

Luego verifica:

```powershell
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

---

## Servicios localhost

| Servicio | Puerto host | URL |
|---|---:|---|
| Dashboard local + API | 9091 | http://localhost:9091 |
| NGINX unikernel | 8080 | http://localhost:8080 |
| Python HTTP | 8081 | http://localhost:8081 |
| Node HTTP | 8082 | http://localhost:8082 |
| Redis | 6379 | redis://localhost:6379 |

---

## Launcher Windows

Ruta:

```text
launcher/windows/src/UnikernelLabs.Launcher
```

La app de escritorio:

- usa `wsl.exe` para ejecutar comandos reales dentro de WSL
- comparte el mismo modelo de `localhost`
- consume `labs.windows.json`, que ahora se genera desde `labs.config.json`
- permite `Start`, `Stop`, `Logs`, `Health`, `Open`, `Status` y autodeteccion

Para publicarla:

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

Consulta tambien:

- `windows/PUBLISH_AND_INSTALL.md`
- `launcher/README.md`
- `docs/04-windows-localhost-launcher.md`
- `docs/05-packaging-and-publish.md`

---

## Verificacion automatizada

Para validar el flujo localhost y la sincronizacion del catalogo:

```powershell
# desde la raiz del repo
node scripts/verify-localhost.js
```

o:

```bash
make test-dashboard
```

Ese verificador comprueba:

- resolucion segura de archivos estaticos
- truncado de logs
- sincronizacion entre `labs.config.json` y `labs.windows.json`
- smoke test de la API localhost

---

## Lo que esta v1 si promete

- control local de servicios unikernel desde Windows
- backend real en WSL2
- puertos estables en `localhost`
- lectura de logs
- health checks basicos por protocolo
- una base util para evolucionar hacia una experiencia de escritorio mas madura

## Lo que esta v1 no promete

- runtime Windows nativo para `kraft`
- reemplazo completo de Docker Desktop
- instalador final tipo MSI
- soporte uniforme para cualquier lab o cualquier runtime

---

## Documentos clave

- `RUNBOOK.md`
- `ENVIRONMENT_SETUP.md`
- `COMPATIBILITY.md`
- `CONTRIBUTING.md`
- `windows/README.md`
- `windows/PUBLISH_AND_INSTALL.md`
- `launcher/README.md`
- `docs/00-windows-and-wsl2.md`
- `docs/04-windows-localhost-launcher.md`
- `docs/05-packaging-and-publish.md`

---

## Licencia

Apache-2.0
