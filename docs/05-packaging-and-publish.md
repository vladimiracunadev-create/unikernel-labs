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
- Inno Setup si vas a compilar el instalador de forma manual

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

## 5. Build recomendado del instalador

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\build-windows-installer.ps1
```

Ese comando:

- sincroniza `labs.windows.json`
- corre `node scripts/verify-localhost.js`
- corre `dotnet test`
- publica el launcher self-contained
- compila `windows/installer/UnikernelControlCenter.iss`
- instala, abre y desinstala el launcher para verificar el instalador

Artefactos:

```text
artifacts/publish/win-x64/UnikernelLabs.Launcher.exe
artifacts/installer/UnikernelControlCenter-1.0.0-win-x64-setup.exe
```

## 6. Publish portable alternativo

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

## 7. CI de instalador

El repo incluye:

```text
.github/workflows/build-windows-installer.yml
```

Ese workflow ejecuta el mismo flujo en `windows-latest` y publica el instalador como artifact de Actions.

## 8. Flujo de instalacion sugerido

1. usuario instala WSL2
2. usuario instala Ubuntu o Debian
3. usuario instala dependencias base y `kraft`
4. usuario valida el dashboard localhost
5. usuario abre el launcher
6. usuario configura distro y ruta Linux del repo
7. usuario inicia servicios y los verifica por `localhost`

## 9. Validacion real hecha en este repo

Se valido localmente en Windows:

- `node scripts/verify-localhost.js`: ok
- `dotnet test`: 25 tests ok
- `build-windows-installer.ps1`: ok
- instalacion silenciosa del `.exe`: ok
- arranque del launcher instalado: ok
- desinstalacion de verificacion: ok

## 10. Que mejorar en una v2

- MSI firmado o MSIX
- bootstrap mas automatico para `kraft`
- deteccion y reparacion de prerequisitos
- mejor sincronizacion de catalogo en tiempo de ejecucion
- validacion guiada desde la propia app
