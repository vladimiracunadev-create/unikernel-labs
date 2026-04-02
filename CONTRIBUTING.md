# 🤝 CONTRIBUTING — Unikernel Control Center v1

> Gracias por tu interés en contribuir. Este documento resume cómo cambiar labs,
> dashboard, launcher y documentación sin romper la coherencia del proyecto.
> Consulta el [RUNBOOK.md](RUNBOOK.md) para los comandos operativos.

---

## 🗂️ Tipos de contribución

| Tipo | Descripción | Archivos clave |
|---|---|---|
| 🧪 Nuevo lab | Nuevo servicio o ejemplo unikernel | `NN-nombre/`, `labs.config.json` |
| 🖥️ Fix del dashboard | Cambios en la API o UI web | `dashboard-server/`, `dashboard.js` |
| 🪟 Fix del launcher | Cambios en la app WinForms | `launcher/windows/src/` |
| 📖 Mejora de docs | README, runbooks, guías Windows/WSL | `docs/`, raíz |
| ⚙️ CI/CD | Cambios en workflows y verificadores | `.github/workflows/` |

---

## 📋 Regla principal: un solo catálogo fuente

El catálogo fuente es `labs.config.json`.

El launcher consume `launcher/windows/src/UnikernelLabs.Launcher/labs.windows.json`, que **se genera**. No se debe editar manualmente.

Después de cambiar `labs.config.json`, ejecuta:

```powershell
# desde la raíz del repo
node scripts/sync-launcher-catalog.js
```

> [!IMPORTANT]
> Nunca edites `labs.windows.json` directamente. Siempre sincroniza desde `labs.config.json`.

---

## 🧪 Añadir o modificar un lab

### Estructura mínima

```text
NN-nombre-del-lab/
├── Kraftfile
├── README.md
└── src/
```

### Registro en `labs.config.json`

```json
{
  "id": "09",
  "name": "mi-servicio",
  "path": "09-mi-servicio",
  "status": "ready",
  "description": "Servicio HTTP en localhost:8083.",
  "url": "http://localhost:8083",
  "port": 8083,
  "kraftName": "ukl-mi-servicio",
  "startCommand": "kraft run -W -d --name ukl-mi-servicio -p 8083:8083",
  "stopCommand": "kraft stop ukl-mi-servicio || true",
  "logsCommand": "kraft logs ukl-mi-servicio || true",
  "healthProtocol": "http"
}
```

Luego sincroniza el catálogo del launcher:

```powershell
node scripts/sync-launcher-catalog.js
```

### Actualizar `Makefile`

Si el lab necesita targets dedicados, añádelos en `Makefile`.

---

## ✅ Validación mínima antes de abrir PR

### Dashboard y catálogo

```powershell
node scripts/verify-localhost.js
# o
make test-dashboard
```

### Runtime Linux (desde WSL)

```bash
bash scripts/doctor.sh
```

### Lab nuevo o modificado

```bash
cd NN-nombre-del-lab
kraft build
kraft run -W -d --name ukl-mi-servicio -p PUERTO:PUERTO
```

Valida `localhost` con el protocolo correspondiente.

---

## 🪟 Launcher Windows

El launcher está en `launcher/windows/src/UnikernelLabs.Launcher`.

### Requisitos de desarrollo

- .NET 8 SDK
- Visual Studio 2022+ o Rider con soporte Windows Desktop
- WSL2 con Ubuntu o Debian
- Catálogo sincronizado desde `labs.config.json`

### Tests del launcher

```powershell
cd launcher\windows\src\UnikernelLabs.Launcher.Tests
dotnet test --logger "console;verbosity=normal"
```

### Publicar la app

```powershell
# Instalador completo
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1

# Solo el .exe portable
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

📖 Más info → [`docs/05-packaging-and-publish.md`](docs/05-packaging-and-publish.md)

---

## 📝 Convenciones

- Usa nombres de lab en formato `NN-kebab-case`
- Usa nombres de instancia estables como `ukl-<nombre>`
- Mantén puertos fijos y previsibles (ver [RUNBOOK.md](RUNBOOK.md))
- Si un lab expone un servicio, documenta su URL o puerto en su `README.md`
- No rompas la sincronización entre dashboard y launcher

---

## 🌿 Flujo git sugerido

1. 🌿 Crea una rama descriptiva
2. ✏️ Haz cambios pequeños y verificables
3. 📖 Actualiza docs si cambias flujo operativo
4. ✅ Ejecuta las validaciones que apliquen
5. 🚀 Abre el PR con contexto claro

### Ejemplos de commits

```text
feat: add redis health flow to dashboard
fix: harden localhost dashboard static path handling
docs: align Windows setup with kraft install script
test: add sync-catalog edge case coverage
```

---

📖 Ver también: [RUNBOOK.md](RUNBOOK.md) · [FILE_ARCHITECTURE.md](FILE_ARCHITECTURE.md) · [docs/05-packaging-and-publish.md](docs/05-packaging-and-publish.md)
