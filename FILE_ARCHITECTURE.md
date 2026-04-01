# FILE_ARCHITECTURE

```text
unikernel-labs/
|-- 01-hello-world/
|-- 02-nginx-runtime/
|-- 03-python-http/
|-- 04-node-http/
|-- 05-redis-runtime/
|-- 06-benchmarks/
|-- 07-runu-track/
|-- 08-kraft-cloud-track/
|-- assets/
|-- dashboard-server/
|   |-- package.json
|   |-- server.js
|   `-- server.test.js
|-- docs/
|-- launcher/
|   `-- windows/
|      `-- src/
|         |-- UnikernelLabs.Launcher/
|         `-- UnikernelLabs.Launcher.Tests/
|-- scripts/
|   |-- benchmark.sh
|   |-- doctor.sh
|   |-- install-kraft-wsl.sh
|   |-- serve.sh
|   |-- sync-launcher-catalog.js
|   |-- sync-launcher-catalog.test.js
|   `-- verify-localhost.js
|-- windows/
|   |-- README.md
|   |-- PUBLISH_AND_INSTALL.md
|   `-- scripts/
|-- dashboard.css
|-- dashboard.js
|-- index.html
|-- labs.config.json
|-- Makefile
`-- README.md
```

## Piezas clave

- `labs.config.json` es la fuente de verdad del catalogo operativo
- `launcher/windows/src/UnikernelLabs.Launcher/labs.windows.json` es un artefacto generado para la app Windows
- `dashboard-server/server.js` es el backend localhost que conecta Windows con WSL
- `scripts/verify-localhost.js` valida el flujo local del dashboard y su API

## Novedad principal de esta iteracion

El repo ya no se apoya en dos historias separadas para web y desktop.

Ahora la relacion correcta es:

1. `labs.config.json` define los labs
2. `scripts/sync-launcher-catalog.js` genera el catalogo del launcher
3. el dashboard local y la app Windows operan sobre el mismo modelo de servicios
