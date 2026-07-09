# 📓 Changelog

Todos los cambios notables de **Unikernel Control Center** se documentan aquí.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/)
y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [2.0.0] — 2026-07-09

Salto de "labs" a **producto**: refresh del ecosistema Unikraft, endurecimiento
de seguridad transversal, y una capa de UI de gestión al estilo Docker Desktop.

### Added

- **Dashboard web:** health badges por servicio (consume `/api/labs/:id/health`),
  toasts de feedback en start/stop, toggle de tema claro/oscuro (persistente,
  respeta `prefers-color-scheme`), y auto-poll de logs mientras el panel está abierto.
- **API:** nuevo endpoint `GET /api/system` con estado agregado (running/ready/
  planned, versión de kraft, uptime, distro).
- **Landing page** de producto (`landing/`) publicada vía GitHub Pages.
- **Track 07 → `urunc`:** documentación del runtime OCI vigente (containerd,
  QEMU/Firecracker). Antes se llamaba `runu`.
- `CHANGELOG.md` (este archivo) y cobertura de tests Node en CI.

### Changed

- **Runtimes al catálogo actual:** `python 3.13`, `node 20`, `redis 7.2`
  (nginx 1.25 ya vigente). Tags verificados contra el registry oficial.
- **Track 08:** KraftCloud → **Unikraft Cloud** (el CLI sigue siendo `kraft cloud`).
- Versión del producto unificada a **2.0.0** (SemVer) en todas las fuentes
  (`package.json`, `.csproj`, instalador Inno Setup).
- CI: acciones pinneadas a SHA, `permissions: contents:read`, triggers de push
  restringidos a `main`.

### Fixed

- **Seguridad web:** validación de cabecera `Host` (anti DNS-rebinding); allowlist
  de assets estáticos (no se expone código/`.git`); `spawn` con timeout que fuerza
  SIGKILL y resuelve (evita peticiones colgadas); path traversal devuelve 403 con
  request cruda; `noopener` al abrir servicios.
- **Launcher .NET:** encoding UTF-8 en `wsl -l` (autodetección de distros rota por
  UTF-16); timeout + `Kill(entireProcessTree)` en comandos (evita congelar la UI);
  escape de `relativePath`; `SettingsStore.Save` resiliente; try/catch en los
  handlers de detección.
- **Scripts:** `serve.sh` atado a `127.0.0.1`; `install-kraft-wsl.sh` valida versión
  y verifica checksum SHA256; PowerShell `start-lab`/`doctor` pasan la ruta como
  argumento (sin inyección); `detect-wsl-context` arregla el caso de una sola distro.
- Detección de instancias en ejecución por igualdad exacta (antes por substring).

---

## [1.0.0] — 2026-04

Primer release del Control Center: dashboard local + launcher WinForms +
instalador Windows, con backend WSL2 + `kraft` + QEMU. Las notas de las
iteraciones previas (v4/v5/v7) se conservan como referencia histórica en los
archivos `RELEASE_NOTES_V*.md`.

[2.0.0]: https://github.com/vladimiracunadev-create/unikernel-labs/releases/tag/v2.0.0
[1.0.0]: https://github.com/vladimiracunadev-create/unikernel-labs/releases/tag/v1.0.0
