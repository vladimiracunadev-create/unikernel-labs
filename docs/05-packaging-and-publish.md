# Packaging and publish

Esta guia aterriza como publicar **Unikernel Control Center v1** sin ocultar su arquitectura real.

## 1. Que publicas

Publicas una app Windows que actua como panel de control.

La cadena real es:

```text
.exe Windows -> WSL2 -> distro Linux -> kraft -> qemu -> localhost
```

## 2. Precondiciones

En Windows:

- WSL2 habilitado
- una distro Linux instalada
- Node.js si vas a usar el dashboard
- .NET 8 SDK si vas a compilar el launcher

En la distro Linux:

- `kraft`
- `qemu-system`
- `iptables`
- acceso a `/dev/kvm`
- repo accesible desde la ruta Linux configurada

## 3. Catalogo a empaquetar

El launcher incluye:

- `labs.windows.json`
- `logo.png`
- `app.ico`

Pero recuerda:

- `labs.windows.json` se genera desde `labs.config.json`
- no conviene editarlo a mano antes de publicar

Sincroniza primero:

```powershell
# desde la raiz del repo
node scripts/sync-launcher-catalog.js
```

## 4. Verificaciones previas

Antes de publicar, ejecuta:

```powershell
# desde la raiz del repo
node scripts/verify-localhost.js
```

y, si corresponde:

```powershell
dotnet test .\launcher\windows\src\UnikernelLabs.Launcher.Tests\UnikernelLabs.Launcher.Tests.csproj
```

## 5. Publish recomendado

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

## 6. Flujo de instalacion sugerido

1. usuario instala WSL2
2. usuario instala Ubuntu o Debian
3. usuario instala dependencias base y `kraft`
4. usuario valida el dashboard localhost
5. usuario abre el launcher
6. usuario configura distro y ruta Linux del repo
7. usuario inicia servicios y los verifica por `localhost`

## 7. Que mejorar en una v2

- instalador MSI o similar
- bootstrap mas automatico para `kraft`
- deteccion y reparacion de prerequisitos
- mejor sincronizacion de catalogo en tiempo de ejecucion
- validacion guiada desde la propia app
