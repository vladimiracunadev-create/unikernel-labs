# Launcher

La carpeta `launcher/` contiene la superficie desktop de **Unikernel Control Center v1**.

## Que es hoy

Es una app WinForms .NET 8 que actua como panel de control Windows sobre un backend WSL2.

No ejecuta unikernels como procesos Windows nativos. Ejecuta `wsl.exe`, llama a `kraft` dentro de Linux y opera sobre servicios expuestos en `localhost`.

## Capacidades actuales

- autodeteccion de distro WSL
- deteccion de ruta Linux del repo
- grilla de servicios con estado visual
- health checks HTTP, Redis y TCP
- consola integrada para salida operativa
- `Start`, `Stop`, `Logs`, `Status`, `Health` y `Open`
- persistencia de configuracion local

## Relacion con el dashboard localhost

El launcher y el dashboard comparten el mismo modelo operativo:

- mismo backend WSL2
- mismos puertos `localhost`
- mismo catalogo de labs a partir de `labs.config.json`

El archivo que usa la app:

```text
windows/src/UnikernelLabs.Launcher/labs.windows.json
```

se genera desde:

```text
../../labs.config.json
```

con:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```

## Subarbol principal

```text
windows/src/UnikernelLabs.Launcher
```

## Flujo recomendado

1. dejar sano el dashboard localhost y el runtime WSL
2. sincronizar el catalogo del launcher
3. generar el instalador o publicar la app
4. configurar distro y path Linux
5. probar `Start / Health / Open` sobre `nginx-runtime`

## Build recomendado

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

Ese flujo genera y verifica:

- `artifacts/publish/win-x64/UnikernelLabs.Launcher.exe`
- `artifacts/installer/UnikernelControlCenter-1.0.0-win-x64-setup.exe`

## Lo que representa esta v1

Si representa:

- una experiencia Windows creible
- control por servicio
- puertos `localhost` previsibles
- una base desktop reutilizable

Todavia no representa:

- MSI firmado o auto-actualizacion
- administracion avanzada de imagenes o redes
- reemplazo funcional completo de Docker Desktop
