# 🪟 Windows — Unikernel Control Center v1

> Scripts, herramientas y guías para la capa Windows de la suite.
> Para el setup completo → [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md)

---

## 🎯 Rol real de Windows en esta suite

Windows **no es** el runtime de los unikernels.

| Windows aporta | Runtime real (en WSL2) |
|---|---|
| 🖥️ Dashboard local (Node.js) | ⚡ `kraft` + QEMU/KVM |
| 🪟 App de escritorio WinForms | 🐧 Ubuntu o Debian |
| ⚙️ Automatización PowerShell | 🔒 `iptables` |
| 🌐 Apertura de `localhost` | 🖥️ `/dev/kvm` |
| 📦 Instalador `.exe` (Inno Setup) | — |

---

## ⚙️ Scripts disponibles

| Script | Propósito |
|---|---|
| `install-wsl-debian.ps1` | Instala una distro WSL (Ubuntu/Debian) |
| `install-runtime-prereqs.ps1` | Instala dependencias base de runtime en WSL |
| `doctor-windows.ps1` | Diagnóstico de entorno desde Windows |
| `detect-wsl-context.ps1` | Detecta distros WSL disponibles |
| `start-lab.ps1` | Inicia un lab por ID |
| `stop-lab.ps1` | Detiene un lab por ID |
| `logs-lab.ps1` | Muestra logs de un lab |
| `status-labs.ps1` | Estado de todos los labs |
| `health-lab.ps1` | Health check de un lab |
| `open-lab.ps1` | Abre la URL de un lab en el navegador |
| `publish-launcher.ps1` | Publica el launcher como `.exe` portable |
| `build-windows-installer.ps1` | Build completo: sync + tests + publish + Inno Setup |
| `verify-windows-installer.ps1` | Verifica un instalador ya generado |
| `resolve-dotnet.ps1` | Detecta .NET SDK disponible |
| `install-inno-setup.ps1` | Instala Inno Setup si no está disponible |

---

## 🔄 Flujo recomendado

1. 🪟 Preparar WSL2 con `install-runtime-prereqs.ps1`
2. ⚡ Instalar `kraft` con `scripts/install-kraft-wsl.sh`
3. 🩺 Validar con `doctor-windows.ps1` o `scripts/doctor.sh`
4. 🖥️ Levantar el dashboard en `http://localhost:9091`
5. 🪟 Usar el launcher sobre el mismo backend

---

## 📋 Nota sobre el catálogo

| Archivo | Rol | Editable |
|---|---|---|
| `../labs.config.json` | Fuente de verdad | ✅ Aquí |
| `../launcher/windows/src/UnikernelLabs.Launcher/labs.windows.json` | Catálogo del launcher | ❌ Generado |

Sincroniza con:

```powershell
# desde la raíz del repo
node scripts/sync-launcher-catalog.js
```

---

📖 Ver también: [PUBLISH_AND_INSTALL.md](PUBLISH_AND_INSTALL.md) · [ENVIRONMENT_SETUP.md](../ENVIRONMENT_SETUP.md) · [docs/04-windows-localhost-launcher.md](../docs/04-windows-localhost-launcher.md) · [docs/05-packaging-and-publish.md](../docs/05-packaging-and-publish.md)
