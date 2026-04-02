# 🪟🐧 Windows y WSL2 — Modelo operativo

> Cómo funciona realmente la relación entre Windows y el runtime unikernel.
> Setup completo → [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md)

---

## Respuesta corta

**Sí**, puedes tener una experiencia tipo aplicación Windows.

**No**, el unikernel no corre como un proceso Windows común.

---

## 🏗️ Modelo recomendado

| Capa | Herramienta | Rol |
|---|---|---|
| 🪟 UX | Dashboard local · Launcher WinForms | Control e interacción |
| 🔌 Puente | `wsl.exe` | Ejecuta comandos en Linux desde Windows |
| 🐧 Runtime | WSL2 (Ubuntu/Debian) | Entorno Linux real |
| ⚡ Orquestación | `kraft` + QEMU/KVM | Gestiona instancias unikernel |
| 🌐 Exposición | `localhost:<puerto>` + `iptables` | Servicios accesibles desde Windows |

---

## 🔁 Topología validada

```text
🪟  Windows
     │
     ▼  wsl.exe
🐧  Ubuntu o Debian en WSL2
     │
     ▼  kraft + QEMU/KVM + iptables
⚡  Unikernel runtime
     │
     ▼
🌐  localhost:8080 / 8081 / 8082 / 6379
```

---

## ✅ Recomendaciones

| ✅ Haz esto | 🚫 Evita esto |
|---|---|
| Usa `Ubuntu` o `Debian` como distro WSL | Intentar correr `kraft` directamente en Windows |
| Deja el repo en `C:\dev\unikernel-labs` si priorizas Windows | Editar `labs.windows.json` a mano |
| Clona en `~/dev/unikernel-labs` si priorizas consola Linux | Cambiar puertos sin actualizar el catálogo |
| Mantén puertos fijos (ver [RUNBOOK.md](../RUNBOOK.md)) | Mezclar layouts Windows y Linux sin consistencia |
| Valida siempre con `doctor.sh` y `verify-localhost.js` | Asumir que funciona sin diagnóstico |

---

📖 Ver también: [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) · [RUNBOOK.md](../RUNBOOK.md) · [COMPATIBILITY.md](../COMPATIBILITY.md)
