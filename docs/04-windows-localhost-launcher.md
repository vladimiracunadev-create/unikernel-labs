# 🪟🚀 Windows localhost launcher — Arquitectura

> Cómo funciona el launcher WinForms y su relación con el dashboard.
> Para empaquetar y publicar → [05-packaging-and-publish.md](05-packaging-and-publish.md)

---

## 🎯 Objetivo

Convertir el laboratorio en una **suite local Windows creíble** sin fingir
que el runtime unikernel corre como proceso nativo de Windows.

---

## 🏗️ Arquitectura

```text
👤  [Usuario]
       │
       ▼
🪟  [Launcher Windows .exe]
       │  wsl.exe
       ▼
🐧  [Ubuntu o Debian en WSL2]
       │  kraft + QEMU/KVM + iptables
       ▼
⚡  [Servicio unikernel]
       │
       ▼
🌐  [localhost:<puerto>]
```

---

## 📋 Responsabilidades del launcher

| Función | Descripción |
|---|---|
| 🔍 Autodetección | Detecta distros WSL disponibles al iniciar |
| 📁 Configuración | Pide o autodetecta el path Linux del repo |
| 📋 Catálogo | Lee `labs.windows.json` (generado desde `labs.config.json`) |
| ▶️ Start | Inicia el servicio en WSL |
| ⏹️ Stop | Detiene el servicio en WSL |
| 📄 Logs | Muestra salida de `kraft logs` |
| 🌐 Open | Abre la URL del servicio en el navegador |
| 🩺 Health | Verifica salud HTTP/TCP/Redis según protocolo |
| 📊 Status | Muestra estado visual por servicio |

---

## 🔗 Relación con el dashboard

> [!NOTE]
> El launcher **no es** una implementación paralela desconectada.
> Comparte exactamente el mismo modelo que el dashboard local.

| Aspecto | Dashboard (`server.js`) | Launcher (WinForms) |
|---|---|---|
| Catálogo fuente | `labs.config.json` | `labs.windows.json` (generado) |
| Topología | localhost | localhost |
| Acciones | start / stop / logs / health | start / stop / logs / health / open |
| Interfaz | Web (HTML/JS) | Desktop (WinForms) |

---

## ❌ Qué no hace el launcher

- No reemplaza `kraft`
- No elimina WSL2
- No empaqueta por sí solo los unikernels
- No garantiza compatibilidad universal con cualquier lab

---

## 🎯 Posicionamiento correcto

El launcher es la superficie desktop de **Unikernel Control Center v1**.

> No debe venderse todavía como un "Unikernel Desktop" completo.

---

📖 Ver también: [05-packaging-and-publish.md](05-packaging-and-publish.md) · [RUNBOOK.md](../RUNBOOK.md) · [00-windows-and-wsl2.md](00-windows-and-wsl2.md)
