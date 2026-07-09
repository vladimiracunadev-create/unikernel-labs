# 🗺️ ROADMAP — Unikernel Control Center v1

> Historial de versiones completadas y features planeadas.
> Para el estado actual del repo, consulta el [README.md](README.md).

---

## ✅ v2.0.0 — Producto + hardening _(completo)_

[![v2](https://img.shields.io/badge/v2.0.0-completo-brightgreen)](CHANGELOG.md)

- [x] Refresh del ecosistema Unikraft (runtimes al catálogo, `urunc`, Unikraft Cloud)
- [x] Health en tiempo real, toasts y tema claro/oscuro en el dashboard web
- [x] Endpoint `/api/system` y endurecimiento de seguridad (anti rebinding, allowlist)
- [x] Hardening del launcher .NET, scripts shell y PowerShell
- [x] CI con tests Node, acciones pinneadas a SHA y `permissions` explícitos
- [x] Landing page de producto en GitHub Pages + `CHANGELOG.md`

> Detalle completo en el [CHANGELOG](CHANGELOG.md).

---

## ✅ v1.0.0 — Control Center inicial _(completo)_

[![v1](https://img.shields.io/badge/v1.0.0-completo-brightgreen)](README.md)

- [x] Estructura del repo y catálogo raíz (`labs.config.json`)
- [x] Dashboard local con API REST en `localhost:9091`
- [x] Labs runtime iniciales (hello, nginx, python, node, redis)
- [x] Launcher WinForms con autodetección de distro WSL
- [x] Instalador `.exe` y workflow CI de build
- [x] Documentación de compatibilidad
- [x] Guía Windows + WSL2
- [x] Branding: portada SVG, icono y logo para la app

---

> [!NOTE]
> Las siguientes son **fases de trabajo** (no versiones de release). El versionado
> del producto sigue SemVer: la versión publicada es la del [CHANGELOG](CHANGELOG.md).

## ⏳ Fase A — Validación real _(en progreso)_

[![fase-a](https://img.shields.io/badge/fase%20A-en%20progreso-yellow)](docs/01-benchmark-strategy.md)

- [ ] Capturas de pantalla y evidencias del flujo completo
- [ ] Benchmark reproducible de hello-world y nginx-runtime
- [ ] Notas de memoria y boot time
- [ ] Tabla comparativa: Linux nativo vs WSL2

---

## 🔮 Fase B — Expansión pragmática

[![fase-b](https://img.shields.io/badge/fase%20B-planificado-blue)](docs/03-lab-selection.md)

- [ ] Track `urunc` — runtime OCI + containerd ([07-urunc-track](07-urunc-track/README.md))
- [ ] Track cloud con `kraft cloud` / Unikraft Cloud ([08-kraft-cloud-track](08-kraft-cloud-track/README.md))
- [ ] Ejemplo de rootfs custom
- [ ] Pipeline GitHub Actions para labs

---

## 🔮 Fase C — Madurez de portafolio

[![fase-c](https://img.shields.io/badge/fase%20C-planificado-blue)](RECRUITER.md)

- [ ] Recruiter walkthrough guiado
- [ ] Demo grabada del flujo completo
- [ ] Dataset de benchmarks reproducible
- [ ] Comparación directa con `docker-labs`

---

## 📐 Principios de evolución

| Principio | Descripción |
|---|---|
| 🎯 Honestidad técnica | No prometer runtime Windows nativo donde no corresponde |
| 🪟 Windows es la UX | El modo de interacción principal sigue siendo Windows |
| 🐧 Linux es el runtime | WSL2 + kraft + QEMU siempre en el backend |
| 📋 Un catálogo raíz | `labs.config.json` controla todo |

---

📖 Ver también: [README.md](README.md) · [CONTRIBUTING.md](CONTRIBUTING.md) · [RECRUITER.md](RECRUITER.md)
