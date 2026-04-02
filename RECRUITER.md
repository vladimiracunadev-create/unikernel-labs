# 🎯 RECRUITER — Para hiring managers y recruiters

> Qué demuestra este repo y qué dice sobre las capacidades de su autor.

---

## 🧠 Qué demuestra este repo

| Skill demostrada | Evidencia concreta |
|---|---|
| 🔍 Criterio técnico | Distingue contenedores de unikernels; no los mezcla ni los conflata |
| 🏗️ Diseño de sistema | Arquitectura de 3 capas: UX Windows · control Node.js · runtime Linux |
| 🪟 Desarrollo Windows | App WinForms con autodetección de WSL, grilla de servicios, persistencia |
| 🐧 Operación Linux | `kraft`, QEMU/KVM, `iptables`, scripts Bash en WSL2 |
| 🌐 API REST local | Dashboard Node.js con endpoints de start/stop/logs/health |
| 📦 DevOps | GitHub Actions, Inno Setup installer, dotnet publish self-contained |
| 📖 Documentación honesta | No se promete Windows nativo donde no corresponde |
| 🧪 Testing | 25 tests .NET, verify-localhost.js, smoke tests de API |

---

## 🔀 Narrativa de portafolio

| Repo | Qué muestra |
|---|---|
| `docker-labs` | Reproducibilidad y operación de stacks con Docker Compose |
| `unikernel-labs` | Especialización, benchmarking y diseño de una suite local v1 |

Donde `docker-labs` demuestra profundidad en orquestación de stacks,
`unikernel-labs` demuestra capacidad de **aterrizar tecnología avanzada**
en una UX entendible y operable desde Windows, con backend Linux real.

---

## ⚙️ Stack técnico demostrado

```text
🪟 Windows   →  WinForms · Node.js · PowerShell · Inno Setup
🐧 Linux     →  KraftKit · QEMU/KVM · iptables · Bash
☁️ CI/CD     →  GitHub Actions · dotnet publish · self-contained EXE
```

---

## 📋 Lo que esta v1 sí promete

- Control local de servicios unikernel **desde Windows**
- Backend real en **WSL2** (no emulación)
- Puertos estables en **localhost**
- Instalador `.exe` funcional y verificado
- Una base útil para evolucionar hacia una experiencia desktop más madura

> [!NOTE]
> La documentación es honesta: no se declara "Unikernel Desktop completo" ni se promete runtime Windows nativo para `kraft`.
> Esa claridad técnica es parte de lo que este repo demuestra.

---

📖 Ver también: [README.md](README.md) · [ROADMAP.md](ROADMAP.md) · [COMPATIBILITY.md](COMPATIBILITY.md)
