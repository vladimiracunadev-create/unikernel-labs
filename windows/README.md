# Windows

Este directorio documenta la capa Windows de **Unikernel Control Center v1**.

## Rol real de Windows

Windows no es el runtime de los unikernels.

Windows aporta:

- dashboard local en Node.js
- app de escritorio WinForms
- automatizacion PowerShell
- apertura de `localhost`
- publicacion del `.exe`

No aporta ni necesita una publicacion del dashboard en GitHub Pages.

El runtime real sigue estando en:

- WSL2
- Ubuntu o Debian
- `kraft`
- QEMU/KVM
- `iptables`

## Flujo recomendado hoy

1. preparar WSL2
2. instalar dependencias base con `windows/scripts/install-runtime-prereqs.ps1`
3. instalar `kraft` dentro de WSL con `scripts/install-kraft-wsl.sh`
4. validar el entorno con `doctor-windows.ps1` o `scripts/doctor.sh`
5. levantar el dashboard local en `http://localhost:9091`
6. usar el launcher como superficie desktop sobre el mismo backend

## Scripts principales

- `scripts/install-wsl-debian.ps1`
- `scripts/install-runtime-prereqs.ps1`
- `scripts/doctor-windows.ps1`
- `scripts/detect-wsl-context.ps1`
- `scripts/start-lab.ps1`
- `scripts/stop-lab.ps1`
- `scripts/logs-lab.ps1`
- `scripts/status-labs.ps1`
- `scripts/health-lab.ps1`
- `scripts/open-lab.ps1`
- `scripts/publish-launcher.ps1`

## Nota sobre el catalogo

La fuente de verdad del catalogo esta en:

```text
../labs.config.json
```

El launcher usa una copia generada en:

```text
../launcher/windows/src/UnikernelLabs.Launcher/labs.windows.json
```

Sincronizala con:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```

## Guia rapida

Consulta:

- `PUBLISH_AND_INSTALL.md`
- `../ENVIRONMENT_SETUP.md`
- `../docs/04-windows-localhost-launcher.md`
