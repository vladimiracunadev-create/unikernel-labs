# Publish and install (Windows)

Esta guía resume cómo dejar operativa la **v1** en un equipo Windows.

## 1. Instalar WSL2 y una distro

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-wsl-debian.ps1 -Distro Debian
```

## 2. Preparar runtime dentro de WSL2

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\install-runtime-prereqs.ps1 -Distro Debian
```

## 3. Validar entorno

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\doctor-windows.ps1 -Distro Debian -LinuxRepoPath /home/tu_usuario/dev/unikernel-labs
```

## 4. Publicar el launcher

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\publish-launcher.ps1
```

## 5. Ejecutar

Abre el ejecutable publicado y configura:

- distro WSL2
- ruta Linux del repo

Luego usa:

- Autodetectar entorno
- Start
- Stop
- Logs
- Health
- Open
- Status

## 6. Detectar contexto WSL2

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\detect-wsl-context.ps1
```

## 7. Health check rápido

```powershell
powershell -ExecutionPolicy Bypass -File .\windows\scripts\health-lab.ps1 -Lab nginx
```

## 8. Recordatorio técnico

La app Windows es el **panel de control**.  
Los servicios unikernel se ejecutan en **WSL2/Linux** y se exponen a **localhost**.
