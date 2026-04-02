# 🔀 Mapeo desde docker-labs

> Diferencias conceptuales y técnicas entre `docker-labs` y `unikernel-labs`.
> Para el contexto completo, consulta [README.md](../README.md).

---

## 🤝 Qué se conserva

| Aspecto | Descripción |
|---|---|
| 📁 Estructura por labs | Directorio numerado por tipo de servicio |
| 📖 Narrativa del repo | Aprendizaje progresivo, bien documentado |
| 🏠 Operación local | Sin dependencias de cloud para el flujo principal |
| 🌐 Foco en `localhost` | Los servicios se exponen en puertos locales |
| 📚 Documentación por capas | README + docs/ + per-lab README |

---

## 🔄 Qué cambia

| Aspecto | `docker-labs` | `unikernel-labs` |
|---|---|---|
| Orquestación | `docker compose` | `kraft` + Kraftfile |
| Runtime | Docker daemon | QEMU/KVM en WSL2 |
| Host Windows | Runtime nativo | Solo capa de control |
| Catálogo | `docker-compose.yml` | `labs.config.json` |
| UX adicional | — | Dashboard Node.js + Launcher WinForms |

---

## 🎯 Traducción sugerida

| Concepto | Rol |
|---|---|
| `docker-labs` | Orquestación de stacks reproducibles |
| `unikernel-labs` | Control local de servicios unikernel sobre WSL2 |

---

## ✅ Resultado esperado

La experiencia final **no** es "Docker Desktop con otro nombre".

Es:

- 🖥️ Dashboard localhost como panel de control
- 🪟 Launcher Windows como superficie desktop
- 🐧 Backend WSL2 como runtime real
- 🌐 Servicios unikernel publicados en puertos fijos

---

📖 Ver también: [README.md](../README.md) · [03-lab-selection.md](03-lab-selection.md) · [04-windows-localhost-launcher.md](04-windows-localhost-launcher.md)
