# ENVIRONMENT_SETUP

## Objetivo

Preparar un host Windows para usar `unikernel-labs` como una suite local controlada por Unikernel Control Center v1.

---

## 1) Windows 11 + WSL2

Instala una distro recomendada, por ejemplo Debian:

```powershell
wsl --install -d Debian
```

Luego reinicia si Windows lo solicita.

---

## 2) Dentro de WSL2

Actualiza paquetes e instala herramientas base:

```bash
sudo apt-get update
sudo apt-get install -y   ca-certificates   curl   git   make   python3   python3-pip   qemu-system-x86   qemu-utils   socat   build-essential
```

Instala `kraft`:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://get.kraftkit.sh | sh
```

Verifica:

```bash
kraft version
```

---

## 3) Clonar el repo en filesystem Linux

No lo clones primero en `/mnt/c/...`.

Hazlo así:

```bash
mkdir -p ~/dev
cd ~/dev
git clone <TU-REPO-GITHUB> unikernel-labs
cd unikernel-labs
```

---

## 4) Diagnóstico inicial

```bash
make doctor
```

---

## 5) Validar localhost

Ejecuta un servicio:

```bash
make run-nginx
```

Luego abre en Windows:

```text
http://localhost:8080
```

---

## 6) Launcher Windows

Compilar/publicar desde Windows:

```powershell
dotnet publish .\launcher\windows\src\UnikernelLabs.Launcher\UnikernelLabs.Launcher.csproj `
  -c Release `
  -r win-x64 `
  --self-contained true `
  /p:PublishSingleFile=true
```

Al abrir la app, configura:

- **WSL distro**: por ejemplo `Debian`
- **Linux repo path**: por ejemplo `/home/<tu_usuario>/dev/unikernel-labs`

---

## 7) Recomendación de troubleshooting

Si `localhost` no responde:

1. revisar `kraft ps`
2. revisar `kraft logs <nombre>`
3. revisar colisión de puertos
4. confirmar que el servicio se lanzó con `-p host:guest`
5. validar WSL2 / red / firewall si aplica
