# 📦 Release Notes · v5 — Health Checks & Packaging

> **Unikernel Control Center v1** — Iteración de health checks,
> empaquetado y nuevos scripts de operación Windows.

---

## ✨ Cambios principales

- 🪟 Launcher mejorado
  - Barra lateral con iconos
  - Health checks por puerto/endpoint desde la app
  - Tarjetas visuales de instalación y publish
- 📖 Nueva documentación
  - [`docs/05-packaging-and-publish.md`](docs/05-packaging-and-publish.md)
  - [`windows/PUBLISH_AND_INSTALL.md`](windows/PUBLISH_AND_INSTALL.md)
- ⚙️ Nuevos scripts PowerShell
  - `health-lab.ps1`
  - `install-runtime-prereqs.ps1`
  - `publish-launcher.ps1`

---

## 🎯 Posicionamiento

Se mantiene el naming de producto: **Unikernel Control Center v1**

Y se conserva la línea honesta:

| Capa | Rol |
|---|---|
| 🪟 Launcher Windows | UX superior |
| 🐧 Backend WSL2/Linux | Runtime real |
| 🌐 localhost por servicio | Superficie operativa |

---

📖 Ver también: [RELEASE_NOTES_V4.md](RELEASE_NOTES_V4.md) · [RELEASE_NOTES_V7.md](RELEASE_NOTES_V7.md) · [README.md](README.md)
