# 🗺️ ROADMAP — Unikernel Control Center v1

> Historial de versiones completadas y features planeadas.
> Para el estado actual del repo, consulta el [README.md](README.md).

---

## ✅ v1 — Control Center inicial _(completo)_

[![v1](https://img.shields.io/badge/v1-completo-brightgreen)](README.md)

- [x] Estructura del repo y catálogo raíz (`labs.config.json`)
- [x] Dashboard local con API REST en `localhost:9091`
- [x] Labs runtime iniciales (hello, nginx, python, node, redis)
- [x] Launcher WinForms con autodetección de distro WSL
- [x] Instalador `.exe` y workflow CI de build
- [x] Documentación de compatibilidad
- [x] Guía Windows + WSL2
- [x] Branding: portada SVG, icono y logo para la app

---

## ⏳ v0.2 — Validación real _(en progreso)_

[![v0.2](https://img.shields.io/badge/v0.2-en%20progreso-yellow)](docs/01-benchmark-strategy.md)

- [ ] Capturas de pantalla y evidencias del flujo completo
- [ ] Benchmark reproducible de hello-world y nginx-runtime
- [ ] Notas de memoria y boot time
- [ ] Tabla comparativa: Linux nativo vs WSL2

---

## 🔮 v0.3 — Expansión pragmática

[![v0.3](https://img.shields.io/badge/v0.3-planificado-blue)](docs/03-lab-selection.md)

- [ ] Track `urunc` — runtime OCI + containerd ([07-urunc-track](07-urunc-track/README.md))
- [ ] Track cloud con `kraft cloud` / Unikraft Cloud ([08-kraft-cloud-track](08-kraft-cloud-track/README.md))
- [ ] Ejemplo de rootfs custom
- [ ] Pipeline GitHub Actions para labs

---

## 🔮 v0.4 — Madurez de portafolio

[![v0.4](https://img.shields.io/badge/v0.4-planificado-blue)](RECRUITER.md)

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
