# 🪟 Launcher — Unikernel Control Center v1

> Superficie desktop de **Unikernel Control Center v1**.
> Una app WinForms .NET 8 que gobierna servicios unikernel desde Windows.

---

## 🏗️ Qué es hoy

Una app WinForms que actúa como panel de control Windows sobre un backend WSL2.

> [!NOTE]
> No ejecuta unikernels como procesos Windows nativos.
> Ejecuta `wsl.exe`, llama a `kraft` dentro de Linux y opera sobre servicios en `localhost`.

---

## ✅ Capacidades actuales

| Función | Descripción |
|---|---|
| 🔍 Autodetección WSL | Detecta distros disponibles al iniciar |
| 📁 Configuración de repo | Detecta o pide el path Linux del repo |
| 🎨 Grilla de servicios | Estado visual por servicio con colores |
| ▶️ Start / ⏹️ Stop | Inicia y detiene servicios en WSL |
| 📄 Logs | Salida de `kraft logs` en consola integrada |
| 🩺 Health | Checks HTTP, Redis y TCP |
| 🌐 Open | Abre la URL del servicio en el navegador |
| 📊 Status | Estado visual por servicio |
| 💾 Persistencia | Configuración local guardada entre sesiones |

---

## 🔗 Relación con el dashboard

El launcher y el dashboard comparten el **mismo modelo operativo**:

| Aspecto | Dashboard (`server.js`) | Launcher (WinForms) |
|---|---|---|
| Catálogo fuente | `labs.config.json` | `labs.windows.json` (generado) |
| Backend | WSL2 | WSL2 |
| Puertos | `localhost` | `localhost` |
| Acciones | API REST | UI WinForms |

Sincroniza el catálogo antes de publicar:

```powershell
# desde la raíz del repo
node scripts/sync-launcher-catalog.js
```

---

## 🚀 Build y publicación

### Instalador completo (recomendado)

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

### Artefactos generados

```text
artifacts/publish/win-x64/UnikernelLabs.Launcher.exe
artifacts/installer/UnikernelControlCenter-2.0.0-win-x64-setup.exe
```

---

## 📋 Flujo recomendado

1. 🩺 Validar dashboard localhost y runtime WSL
2. 🔄 Sincronizar catálogo del launcher
3. 📦 Generar el instalador o publicar la app
4. ⚙️ Configurar distro y path Linux
5. ✅ Probar `Start / Health / Open` sobre `nginx-runtime`

---

## 📋 Qué representa esta v1

| ✅ Sí | ❌ Todavía no |
|---|---|
| Experiencia Windows creíble | MSI firmado o auto-actualización |
| Control por servicio | Administración avanzada de imágenes/redes |
| Puertos `localhost` previsibles | Reemplazo funcional completo de Docker Desktop |
| Base desktop reutilizable | — |

---

📖 Ver también: [windows/README.md](../windows/README.md) · [docs/04-windows-localhost-launcher.md](../docs/04-windows-localhost-launcher.md) · [docs/05-packaging-and-publish.md](../docs/05-packaging-and-publish.md)
