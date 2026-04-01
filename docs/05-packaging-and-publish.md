# Packaging and publish

Esta guía aterriza cómo transformar **Unikernel Control Center v1** en una entrega Windows más presentable sin prometer algo que técnicamente no es.

## 1. Qué publicas realmente

Publicas una **aplicación Windows** que actúa como panel de control.

No publicas:

- un runtime nativo de `kraft` para Windows
- unikernels corriendo como procesos Windows normales

La cadena correcta es:

```text
.exe Windows -> WSL2 -> distro Linux -> kraft -> localhost
```

## 2. Precondiciones

En Windows:

- WSL2 habilitado
- virtualización disponible
- una distro Linux instalada (Debian o Ubuntu)
- .NET 8 SDK si vas a compilar localmente

En la distro Linux:

- `kraft`
- `qemu-system`
- acceso a `/dev/kvm`
- repo clonado en una ruta Linux estable

## 3. Publish recomendado

Desde PowerShell en Windows:

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

Salida esperada:

```text
launcher/windows/src/UnikernelLabs.Launcher/bin/Release/net8.0-windows/win-x64/publish
```

## 4. Qué empaquetar en una entrega v1

Mínimo:

- `UnikernelLabs.Launcher.exe`
- `labs.windows.json`
- `logo.png`
- `app.ico`
- `README.md`
- `windows/PUBLISH_AND_INSTALL.md`

Opcional:

- acceso directo
- script bootstrap para validar WSL2
- script de doctor de entorno

## 5. Instalación sugerida

Una v1 honesta puede instalarse así:

1. usuario instala WSL2
2. usuario instala Debian/Ubuntu
3. usuario ejecuta `install-runtime-prereqs.ps1`
4. usuario clona `unikernel-labs` dentro de WSL2
5. usuario abre el launcher y configura:
   - distro
   - ruta Linux del repo
6. usuario inicia servicios desde el launcher

## 6. Qué mejorar si luego quieres una v2

- empaquetador MSI o similar
- detección automática de WSL2 y distro
- autocompletado de ruta Linux
- health checks HTTP más ricos
- mejores logs de arranque y fallos
- actualización del catálogo sin recompilar
