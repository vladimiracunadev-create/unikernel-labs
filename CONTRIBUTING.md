# Contribuir a Unikernel Labs

Gracias por tu interés en contribuir. Este documento describe cómo puedes añadir mejoras, reportar problemas o proponer nuevos labs.

## Índice

- [Tipos de contribución](#tipos-de-contribución)
- [Añadir un nuevo lab](#añadir-un-nuevo-lab)
- [Modificar el launcher Windows](#modificar-el-launcher-windows)
- [Flujo de trabajo con git](#flujo-de-trabajo-con-git)
- [Convenciones](#convenciones)

---

## Tipos de contribución

| Tipo | Descripción |
|---|---|
| Nuevo lab | Nuevo servicio unikernel en `labs/` con Kraftfile |
| Fix en launcher | Corrección en la app WinForms C# |
| Mejora de docs | README, RUNBOOK, ENVIRONMENT_SETUP, etc. |
| CI/CD | Mejoras en `.github/workflows/` |

---

## Añadir un nuevo lab

Cada lab es un directorio auto-contenido bajo la raíz del repositorio.

### Estructura mínima

```
NN-nombre-del-lab/
├── Kraftfile          # configuración de kraft (spec v0.6)
├── README.md          # descripción, puerto expuesto, cómo validar
└── src/               # código fuente de la aplicación (si aplica)
```

### Kraftfile mínimo

```yaml
spec: v0.6

runtime: unikraft.org/base:latest

rootfs: ./src

cmd: ["/app"]
```

### Registrar el lab en los catálogos

1. **`labs.config.json`** (dashboard web):

```json
{
  "id": "NN",
  "name": "nombre-del-lab",
  "description": "Descripción corta del servicio",
  "port": 8083,
  "url": "http://localhost:8083",
  "status": "ready"
}
```

2. **`launcher/windows/src/UnikernelLabs.Launcher/labs.windows.json`** (launcher Windows):

```json
{
  "Id": "NN",
  "Name": "nombre-del-lab",
  "Description": "Descripción corta del servicio en localhost:PUERTO",
  "RelativePath": "NN-nombre-del-lab",
  "StartCommand": "cd '{lab_path}' && kraft run -W -d --name ukl-nombre -p PUERTO:PUERTO",
  "StopCommand": "kraft stop ukl-nombre || true",
  "LogsCommand": "kraft logs ukl-nombre || true",
  "Url": "http://localhost:PUERTO"
}
```

3. **`Makefile`** — añade targets:

```makefile
run-nombre:
	cd NN-nombre-del-lab && kraft run -W -d --name ukl-nombre -p PUERTO:PUERTO

stop-nombre:
	kraft stop ukl-nombre || true

logs-nombre:
	kraft logs ukl-nombre || true
```

### Validar antes de PR

```bash
make doctor
cd NN-nombre-del-lab && kraft build
make run-nombre
curl http://localhost:PUERTO   # o el comando apropiado
make stop-nombre
```

---

## Modificar el launcher Windows

El launcher es una app WinForms .NET 8 en `launcher/windows/src/UnikernelLabs.Launcher/`.

### Requisitos de desarrollo

- .NET 8 SDK
- Visual Studio 2022+ o Rider (con workload de Windows Desktop)
- WSL2 con una distro Linux configurada

### Compilar y ejecutar

```powershell
cd launcher\windows\src\UnikernelLabs.Launcher
dotnet run
```

### Ejecutar tests

```powershell
cd launcher\windows\src\UnikernelLabs.Launcher.Tests
dotnet test --logger "console;verbosity=normal"
```

### Publicar como `.exe` auto-contenido

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

---

## Flujo de trabajo con git

1. Haz un fork del repositorio
2. Crea una rama descriptiva:
   ```bash
   git checkout -b feat/lab-postgres
   git checkout -b fix/health-check-timeout
   ```
3. Realiza tus cambios con commits claros
4. Abre un Pull Request usando las plantillas disponibles

### Mensajes de commit

```
feat: añadir lab PostgreSQL unikernel (puerto 5432)
fix: corregir timeout en health check HTTP
docs: actualizar ENVIRONMENT_SETUP con paso de kraft cloud
```

---

## Convenciones

- Los labs siguen numeración `NN-nombre-en-kebab-case`
- Puertos sugeridos: `8083`, `8084`, `8085`... continuando la secuencia existente
- Todos los labs deben incluir un `README.md` con instrucciones de validación
- El código C# sigue las convenciones de .NET (PascalCase para tipos, camelCase para variables locales)
- No se aceptan cambios que rompan el build del launcher (`dotnet build` debe pasar en CI)

---

## Dudas

Abre un [issue](../../issues) con la etiqueta `question`.
