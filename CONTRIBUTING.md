# Contribuir a unikernel-labs

Gracias por tu interes en contribuir. Este documento resume como cambiar labs, dashboard, launcher y documentacion sin romper la coherencia actual del proyecto.

## Tipos de contribucion

| Tipo | Descripcion |
|---|---|
| Nuevo lab | nuevo servicio o ejemplo unikernel |
| Fix del dashboard | cambios en `dashboard-server/` o `dashboard.js` |
| Fix del launcher | cambios en la app WinForms |
| Mejora de docs | README, runbooks, guias Windows/WSL |
| CI/CD | cambios en workflows y verificadores |

---

## Regla principal: un solo catalogo fuente

El catalogo fuente es:

```text
labs.config.json
```

El launcher consume:

```text
launcher/windows/src/UnikernelLabs.Launcher/labs.windows.json
```

Ese archivo del launcher se **genera**. No se debe editar manualmente.

Despues de cambiar `labs.config.json`, ejecuta:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```

---

## Anadir o modificar un lab

Cada lab vive en un directorio numerado en la raiz del repo.

### Estructura minima

```text
NN-nombre-del-lab/
|-- Kraftfile
|-- README.md
`-- src/
```

### Registro en `labs.config.json`

Anade o ajusta un item completo, por ejemplo:

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

Luego sincroniza el catalogo del launcher:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```

### Actualizar `Makefile`

Si el lab necesita targets dedicados, anadelos en `Makefile`.

---

## Validacion minima antes de abrir PR

### Dashboard y catalogo

```powershell
# desde la raiz del repo
node scripts/verify-localhost.js
```

o:

```bash
make test-dashboard
```

### Runtime Linux

Desde WSL:

```bash
bash scripts/doctor.sh
```

### Lab nuevo o modificado

```bash
cd NN-nombre-del-lab
kraft build
kraft run -W -d --name ukl-mi-servicio -p PUERTO:PUERTO
```

Y luego valida `localhost` con el protocolo correspondiente.

---

## Launcher Windows

El launcher esta en:

```text
launcher/windows/src/UnikernelLabs.Launcher
```

### Requisitos de desarrollo

- .NET 8 SDK
- Visual Studio 2022+ o Rider con soporte Windows Desktop
- WSL2 con Ubuntu o Debian
- catalogo sincronizado desde `labs.config.json`

### Ejecutar tests del launcher

```powershell
cd launcher\windows\src\UnikernelLabs.Launcher.Tests
dotnet test --logger "console;verbosity=normal"
```

### Publicar la app

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

Si solo necesitas el `.exe` portable:

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

---

## Convenciones

- usa nombres de lab en formato `NN-kebab-case`
- usa nombres de instancia estables como `ukl-...`
- mantén puertos fijos y previsibles
- si un lab expone un servicio, documenta claramente su URL o puerto
- no rompas la sincronizacion entre dashboard y launcher

---

## Flujo git sugerido

1. crea una rama descriptiva
2. haz cambios pequenos y verificables
3. actualiza docs si cambias flujo operativo
4. ejecuta las validaciones que apliquen
5. abre el PR con contexto claro

Ejemplos de commit:

```text
feat: add redis health flow to dashboard
fix: harden localhost dashboard static path handling
docs: align Windows setup with kraft install script
```
