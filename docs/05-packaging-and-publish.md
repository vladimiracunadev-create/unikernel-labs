# 📦 Packaging and Publish — Unikernel Control Center v1

> Cómo publicar el launcher sin ocultar su arquitectura real.
> Para contribuir → [CONTRIBUTING.md](../CONTRIBUTING.md)

---

## 🎯 Qué publicas

Publicas una app Windows que actúa como panel de control local.

La cadena real es:

```text
📦 .exe Windows → 🐧 WSL2 → 🐧 distro Linux → ⚡ kraft → 🖥️ QEMU → 🌐 localhost
```

---

## ✅ Precondiciones

### En Windows

| Requisito | Para qué |
|---|---|
| ✅ WSL2 habilitado | Backend Linux |
| ✅ Distro Linux instalada (Ubuntu/Debian) | Runtime |
| ✅ Node.js | Dashboard local |
| ✅ .NET 8 SDK | Compilar el launcher |
| ✅ Inno Setup | Compilar el instalador _(solo si es manual)_ |

### En la distro Linux (WSL)

| Requisito | Para qué |
|---|---|
| ✅ `kraft` | Orquestación de unikernels |
| ✅ `qemu-system` | Runtime de VMs |
| ✅ `iptables` | Port-forwarding |
| ✅ `/dev/kvm` accesible | Virtualización acelerada |
| ✅ Repo accesible desde ruta Linux | Acceso a labs y catálogo |

---

## 📋 Catálogo a empaquetar

El launcher incluye:

- `labs.windows.json` ← generado desde `labs.config.json`
- `logo.png`
- `app.ico`

> [!IMPORTANT]
> Sincroniza siempre antes de publicar:
>
> ```powershell
> node scripts/sync-launcher-catalog.js
> ```

---

## 🔍 Verificaciones previas

```powershell
# Smoke test del dashboard y catálogo
node scripts/verify-localhost.js

# Tests del launcher
dotnet test .\launcher\windows\src\UnikernelLabs.Launcher.Tests\UnikernelLabs.Launcher.Tests.csproj
```

---

## 🚀 Build recomendado del instalador

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

Este comando ejecuta automáticamente:

1. ✅ Sincroniza `labs.windows.json`
2. ✅ Corre `verify-localhost.js`
3. ✅ Corre `dotnet test`
4. ✅ Publica el launcher self-contained
5. ✅ Compila `windows/installer/UnikernelControlCenter.iss`
6. ✅ Instala, abre y desinstala para verificar el instalador

### Artefactos generados

```text
artifacts/publish/win-x64/UnikernelLabs.Launcher.exe
artifacts/installer/UnikernelControlCenter-2.0.0-win-x64-setup.exe
```

---

## 🔧 Publish portable alternativo

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

---

## ⚙️ CI del instalador

El repo incluye `.github/workflows/build-windows-installer.yml` que ejecuta el mismo flujo en `windows-latest` y publica el instalador como artifact de Actions.

---

## 📋 Flujo de instalación para el usuario final

1. 🪟 Instalar WSL2
2. 🐧 Instalar Ubuntu o Debian
3. ⚡ Instalar dependencias base y `kraft`
4. 🧪 Validar el dashboard localhost
5. 🖥️ Abrir el launcher
6. ⚙️ Configurar distro y ruta Linux del repo
7. ✅ Iniciar servicios y verificar por `localhost`

---

## ✅ Validación real hecha en este repo

| Check | Estado |
|---|---|
| `node scripts/verify-localhost.js` | ✅ ok |
| `dotnet test` (25 tests) | ✅ ok |
| `build-windows-installer.ps1` | ✅ ok |
| Instalación silenciosa del `.exe` | ✅ ok |
| Arranque del launcher instalado | ✅ ok |
| Desinstalación de verificación | ✅ ok |

---

## 🔮 Qué mejorar en una v2

- MSI firmado o MSIX
- Bootstrap más automático para `kraft`
- Detección y reparación de prerequisitos
- Mejor sincronización de catálogo en tiempo de ejecución
- Validación guiada desde la propia app

---

📖 Ver también: [04-windows-localhost-launcher.md](04-windows-localhost-launcher.md) · [CONTRIBUTING.md](../CONTRIBUTING.md) · [windows/PUBLISH_AND_INSTALL.md](../windows/PUBLISH_AND_INSTALL.md)
