# 🔀 COMPATIBILITY — Unikernel Control Center v1

> Plataformas soportadas, matriz de validación y riesgos operativos.
> Para el setup, consulta [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md).

---

## Resumen ejecutivo

La experiencia principal está diseñada para:

- 🪟 **Windows 11** con WSL2 habilitado
- 🐧 **Ubuntu o Debian** dentro de WSL2
- ⚡ `kraft` instalado en `~/.local/bin`
- 🖥️ QEMU/KVM disponible (`/dev/kvm`)
- 🔒 `iptables` disponible
- 🌐 Dashboard local o launcher Windows como capa de control

---

## 📊 Matriz de plataformas

| Plataforma | Dashboard | Launcher | Labs | Notas |
|---|:---:|:---:|:---:|---|
| 🪟 Windows 11 + WSL2 | ✅ | ✅ | ✅ | **Ruta principal validada** |
| 🪟 Windows 10 + WSL2 | 🟡 | 🟡 | 🟡 | No validado explícitamente |
| 🐧 Linux nativo | 🟡 | ❌ | ✅ | Útil para troubleshooting de labs |
| 🍎 macOS | 🟡 | ❌ | 🟡 | Solo lectura y desarrollo parcial |
| ☁️ Linux en CI (Actions) | 🟡 | ✅ | 🟡 | Build del launcher validado |

**Leyenda:** ✅ validado · 🟡 parcial / no validado · ❌ no soportado

---

## 🪟 Windows + WSL2 — Ruta principal

Es la ruta principal del producto. Validado en esta iteración:

- ✅ Dashboard local en `localhost:9091`
- ✅ Detección de `Ubuntu` en WSL2
- ✅ `kraft version` responde correctamente
- ✅ Arranque de `nginx-runtime`
- ✅ Respuesta real en `http://localhost:8080`
- ✅ Build e instalación silenciosa del `.exe`

### Repo en filesystem Windows

```text
C:\dev\unikernel-labs   →   /mnt/c/dev/unikernel-labs (desde WSL)
```

Funciona bien para:

- Dashboard Node corriendo en Windows
- Launcher WinForms
- Pruebas rápidas de `localhost`

### Repo en filesystem Linux

Buena opción para trabajo prolongado desde WSL. Más limpia para builds y workflows Linux puros.

---

## 🐧 Linux nativo

Útil para troubleshooting y validación de labs directamente, pero el producto se narra como **Windows + WSL2 + localhost**.

---

## 🍎 macOS

Sirve para lectura, desarrollo parcial y documentación. No es la ruta principal del producto.

---

## ⚠️ Riesgos operativos

> [!CAUTION]
> Estos riesgos pueden impedir completamente el arranque de los labs:

| # | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| 1 | Falta de virtualización o nested virtualization | 🔴 Crítico | Habilitar en BIOS / Hyper-V |
| 2 | `/dev/kvm` no disponible | 🔴 Crítico | Verificar con `ls /dev/kvm` |
| 3 | `kraft` no instalado o fuera de `PATH` | 🔴 Crítico | Ejecutar `install-kraft-wsl.sh` |
| 4 | QEMU no instalado | 🔴 Crítico | `apt-get install qemu-system` |
| 5 | `iptables` ausente | 🟠 Alto | `apt-get install iptables` |
| 6 | Colisiones de puertos en `localhost` | 🟠 Alto | Verificar con `netstat -tulpn` |
| 7 | Diferencias de madurez entre labs | 🟡 Medio | Consultar [docs/03-lab-selection.md](docs/03-lab-selection.md) |

---

## 📐 Reglas de diseño

- La UX principal se cuenta **desde Windows**
- El runtime real sigue siendo **Linux**
- Los puertos deben ser **estables** (ver [RUNBOOK.md](RUNBOOK.md))
- Los nombres de instancia deben ser **estables** (`ukl-*`)
- `labs.config.json` es la **fuente de verdad**
- La app Windows debe seguir el mismo catálogo y la misma topología localhost

---

📖 Ver también: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) · [RUNBOOK.md](RUNBOOK.md) · [docs/00-windows-and-wsl2.md](docs/00-windows-and-wsl2.md)
