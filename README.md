# unikernel-labs

![Unikernel Control Center v1](assets/branding/cover-v7.svg)

> **Unikernel Control Center v1**  
> Laboratorio y suite local para **levantar servicios unikernel de forma controlada** desde Windows, usando **WSL2 + localhost** como backend operativo.

![Build](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/unikernel-labs/dotnet-launcher.yml?branch=main&label=build)
![Tests](https://img.shields.io/github/actions/workflow/status/vladimiracunadev-create/unikernel-labs/dotnet-launcher.yml?branch=main&label=tests)
![Release](https://img.shields.io/github/v/release/vladimiracunadev-create/unikernel-labs?label=release)
![Status](https://img.shields.io/badge/status-v1-blue)
![Product](https://img.shields.io/badge/product-Control%20Center%20v1-6f42c1)
![Mode](https://img.shields.io/badge/mode-Windows%20%2B%20WSL2%20%2B%20localhost-orange)
![UI](https://img.shields.io/badge/ui-sidebar%20%2B%20autodetect%20%2B%20health-1f6feb)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Contributing](https://img.shields.io/badge/contributions-welcome-brightgreen)

---

## Web Dashboard — Node.js REST API

El dashboard **no es estático**. Es un servidor Node.js que corre en Windows y proxea todos los comandos `kraft` hacia WSL2 automáticamente.

```
[ Navegador → http://localhost:9091 ]
         |
[ dashboard-server/server.js  (Node.js en Windows) ]
         |
[ wsl.exe -d Ubuntu -- bash -lc "kraft ..." ]
         |
[ kraft + QEMU/KVM dentro de WSL2 ]
         |
[ servicios unikernel en localhost:808x / 6379 ]
```

### Levantar el dashboard (desde Windows)

```powershell
# Requiere Node.js instalado en Windows — sin dependencias externas
node dashboard-server/server.js
# o equivalente:
make serve
```

Abrir en el navegador: **http://localhost:9091**

### Lo que muestra el dashboard

| Elemento | Descripción |
|---|---|
| Panel de diagnóstico | Estado de WSL2, versión de kraft instalada, API activa |
| Cards por lab | Barra de color: verde=corriendo, gris=detenido, atenuado=planificado |
| Controles por lab | Iniciar · Detener · Logs · Abrir (solo si el servicio está activo) |
| Búsqueda en tiempo real | Filtra por nombre o puerto |
| Auto-refresh | Actualización automática cada 10 segundos |

### Instalar kraft en WSL (requerido para operar labs)

```bash
wsl -d Ubuntu -- bash -lc "curl -sSfL get.kraftkit.sh | sh"
```

Una vez instalado, el panel de diagnóstico muestra la versión detectada y todos los controles Iniciar / Detener / Logs funcionan desde el navegador sin configuración adicional.

---

## Qué incluye esta versión

- **dashboard web con REST API** — Node.js sin dependencias externas, corre en Windows
- **proxy WSL2 automático** — detecta la distro Ubuntu al arrancar, no requiere configuración
- **panel de diagnóstico** — WSL2, kraft, API en una sola vista
- **selector visual de distros WSL** en el launcher Windows
- **grilla de servicios con estado por colores** (running / stopped / planned)
- **health checks** por protocolo: HTTP, Redis, TCP
- **logs en tiempo real** al iniciar/detener desde el dashboard
- **persistencia de configuración** en el launcher

**sigue siendo un Control Center v1**, no un reemplazo de Docker Desktop ni un runtime Windows nativo para `kraft`.

---

## Qué es realmente

Este repositorio **no es un demo decorativo**.

Es una base de trabajo para una **Versión 1 operativa** donde:

1. una **aplicación Windows** actúa como panel de control,
2. **WSL2** aporta el backend Linux,
3. cada servicio unikernel se ejecuta de forma controlada,
4. los endpoints se exponen a **`localhost`**,
5. el usuario puede iniciar, detener, revisar logs, abrir servicios y verificar salud del puerto.

La idea central es clara:

**producto Windows arriba, runtime Linux abajo, localhost al centro.**

---

## Cómo debe presentarse

Nombre del producto:

- **Unikernel Control Center v1**

Nombre del repositorio:

- **`unikernel-labs`**

Forma correcta de describirlo:

> Suite local orientada a Windows para gobernar servicios unikernel con backend WSL2 y acceso por localhost.

---

## Qué sí resuelve esta v1

- encendido controlado de servicios unikernel
- apagado de servicios
- consulta de logs
- apertura rápida de URLs locales
- **health checks ricos por protocolo**
- validación del entorno WSL2/Linux
- catálogo de labs y endpoints
- base para evolucionar luego a una experiencia más completa y madura

## Qué no promete todavía

- runtime Windows nativo para `kraft`
- reemplazo 1:1 de Docker Desktop
- instalador completo tipo producto terminado
- gestión visual profunda de volúmenes, imágenes, redes y settings avanzados
- madurez homogénea para todos los labs

---

## Arquitectura operativa

```text
[ Unikernel Control Center v1 (.exe Windows) ]
                  |
                  v
             [ WSL2 ]
                  |
                  v
     [ Debian/Ubuntu + kraft + QEMU/KVM ]
                  |
                  v
      [ servicios unikernel publicados a localhost ]
```

Esto permite una experiencia práctica como:

- Start
- Stop
- Logs
- Status
- Health / Autodetect
- Open

sin fingir que el runtime corre como proceso Windows nativo.

---

## Componentes principales

| Componente | Descripción |
|---|---|
| `dashboard-server/server.js` | Servidor Node.js — REST API + proxy WSL2 para kraft |
| `index.html` / `dashboard.js` / `dashboard.css` | Frontend del dashboard web |
| `labs.config.json` | Catálogo de labs: id, puerto, comando de inicio, health protocol |
| `launcher/windows/src/UnikernelLabs.Launcher/` | App WinForms .NET 8 para Windows |
| `01-hello-world` … `08-kraft-cloud-track` | Labs y rutas de aprendizaje |
| `Makefile` | `serve`, `doctor`, `run-*`, `stop-*`, `logs-*`, `benchmark-*` |
| `scripts/` | Bash helpers: doctor, benchmark |
| `docs/` | Documentación extendida por tema |

---

## Quickstart por capas

### A. Web Dashboard (recomendado)

Desde Windows (requiere Node.js):

```powershell
cd C:\dev\unikernel-labs
node dashboard-server/server.js
```

Abrir **http://localhost:9091** en el navegador. El panel de diagnóstico indica si WSL2 y kraft están listos.

### B. Validar entorno Linux/WSL2

```bash
cd ~/dev/unikernel-labs
make doctor
```

### C. Levantar servicios desde consola

```bash
make run-nginx
make run-python
make run-node
make run-redis
```

### D. Levantar servicios desde Windows

1. abrir la solución del launcher
2. compilar o publicar
3. indicar la distro WSL2
4. indicar el path Linux del repo
5. seleccionar un lab
6. usar **Start / Stop / Logs / Health / Autodetect / Open / Status**

---

## Servicios localhost sugeridos

| Servicio | Puerto host | URL |
|---|---:|---|
| Dashboard estático | 9091 | http://localhost:9091 |
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

Incluye:

- WinForms .NET 8
- ejecución de `wsl.exe`
- lectura de catálogo JSON
- Start / Stop / Logs / Status / Health / Autodetect / Open
- configuración editable para:
  - selector visual de distro WSL detectada
  - path Linux del repo
- **sidebar con accesos rápidos**
- **autodetección al iniciar**
- **grilla de servicios con estado por colores**
- **estado visual de salud por endpoint con detalle HTTP/Redis/TCP**

### Publicar como `.exe`

Desde Windows con .NET 8 SDK:

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

Consulta además:

- `windows/PUBLISH_AND_INSTALL.md`
- `docs/05-packaging-and-publish.md`

---

## Orden sugerido de validación

1. `make doctor`
2. `make run-nginx`
3. `make run-python`
4. `make run-node`
5. `make run-redis`
6. levantar el launcher Windows
7. revisar la **grilla por colores** y validar el resultado HTTP/PONG/TCP
8. abrir endpoints en `localhost`
9. capturar screenshots y métricas

---

## Documentos clave

- `RUNBOOK.md`
- `COMPATIBILITY.md`
- `ENVIRONMENT_SETUP.md`
- `docs/00-windows-and-wsl2.md`
- `docs/04-windows-localhost-launcher.md`
- `docs/05-packaging-and-publish.md`
- `windows/PUBLISH_AND_INSTALL.md`
- `launcher/README.md`

---

## Posicionamiento honesto

Esta v1 puede presentarse como:

> **Unikernel Control Center v1**  
> Capa de control local para servicios unikernel en Windows, con backend WSL2, localhost por servicio y verificación básica de salud.

No debe presentarse todavía como:

- **Unikernel Desktop**
- reemplazo total de Docker Desktop
- runtime nativo de unikernels sobre Windows

---

## Próxima evolución razonable

- health checks más ricos (HTTP status, no solo puerto)
- autodescubrimiento del estado del servicio
- panel de settings más completo
- empaquetado/instalación más guiado
- observabilidad y métricas comparativas

---

## Descarga

Descarga el último `.exe` auto-contenido desde [Releases](../../releases/latest).
No requiere instalación — solo ejecutar y configurar la distro WSL2.

---

## Contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) para instrucciones sobre cómo añadir labs, modificar el launcher o reportar bugs.

---

## Licencia

Apache-2.0
