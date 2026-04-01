# Windows

Este directorio define la experiencia **Windows + WSL2 + localhost** de **Unikernel Control Center v1**.

## Rol de Windows en la arquitectura

Windows no actúa como runtime nativo de `kraft`.

Su papel en esta versión es:

- shell de entrada
- automatización PowerShell
- compilación/publicación del launcher
- apertura de `localhost`
- capa UX del producto

## Qué trae la iteración actual

- scripts de operación para Windows
- launcher WinForms con icono y branding
- menú superior, barra de estado y consola operacional
- **barra lateral con iconos**
- **autodetección al iniciar, selector visual de distro WSL y ruta Linux**
- **grilla de servicios con estado por colores y health checks ricos para HTTP, Redis y TCP**
- configuración guardada en `%LOCALAPPDATA%/UnikernelControlCenter/settings.json`

## Contenido

- `scripts/install-wsl-debian.ps1`
- `scripts/install-runtime-prereqs.ps1`
- `scripts/doctor-windows.ps1`
- `scripts/start-lab.ps1`
- `scripts/stop-lab.ps1`
- `scripts/logs-lab.ps1`
- `scripts/status-labs.ps1`
- `scripts/health-lab.ps1`
- `scripts/open-lab.ps1`
- `scripts/publish-launcher.ps1`
- `scripts/detect-wsl-context.ps1`

## Launcher

El launcher real está en:

```text
../launcher/windows/src/UnikernelLabs.Launcher
```

## Flujo sugerido

1. validar WSL2 y virtualización
2. instalar `kraft` dentro de Debian/Ubuntu
3. clonar el repo en Linux
4. ejecutar `make doctor`
5. compilar o publicar el launcher Windows
6. iniciar servicios, validar health y abrir `localhost`

## Guía rápida

Revisa `PUBLISH_AND_INSTALL.md` para el flujo de publicación e instalación.
