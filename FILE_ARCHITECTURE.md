# 🏗️ FILE_ARCHITECTURE — Unikernel Control Center v1

> Árbol comentado del repositorio. Para el contexto de cada componente,
> consulta el [README.md](README.md).

---

## Árbol de archivos

```text
unikernel-labs/
│
├── 01-hello-world/          # Lab: unikernel hello-world básico
├── 02-nginx-runtime/        # Lab: NGINX unikernel en localhost:8080 ✅ validado
├── 03-python-http/          # Lab: Python HTTP server en localhost:8081
├── 04-node-http/            # Lab: Node.js HTTP server en localhost:8082
├── 05-redis-runtime/        # Lab: Redis unikernel en localhost:6379
├── 06-benchmarks/           # Pista: estrategia de benchmarking
├── 07-runu-track/           # Pista: runtime alternativo runu
├── 08-kraft-cloud-track/    # Pista: despliegue en KraftCloud
│
├── assets/                  # Branding: cover SVG, logo, icono
│
├── dashboard-server/
│   ├── server.js            # 🌐 API REST local (Node.js) — backend del dashboard
│   ├── server.test.js       # Tests del dashboard-server
│   └── package.json
│
├── docs/
│   ├── 00-windows-and-wsl2.md         # Modelo Windows + WSL2
│   ├── 01-benchmark-strategy.md       # Estrategia de benchmarking
│   ├── 02-mapping-from-docker-labs.md # Diferencias con docker-labs
│   ├── 03-lab-selection.md            # Selección y estado de labs
│   ├── 04-windows-localhost-launcher.md # Arquitectura del launcher
│   └── 05-packaging-and-publish.md   # Empaquetado e instalador
│
├── launcher/
│   └── windows/
│       └── src/
│           ├── UnikernelLabs.Launcher/        # App WinForms principal
│           └── UnikernelLabs.Launcher.Tests/  # Tests .NET
│
├── scripts/
│   ├── benchmark.sh                # Script de benchmarking
│   ├── doctor.sh                   # Diagnóstico de entorno WSL
│   ├── install-kraft-wsl.sh        # Instalación de KraftKit en WSL
│   ├── serve.sh                    # Servidor de archivos estáticos
│   ├── sync-launcher-catalog.js    # 🔄 Genera labs.windows.json desde labs.config.json
│   ├── sync-launcher-catalog.test.js
│   └── verify-localhost.js         # 🧪 Smoke test del flujo localhost
│
├── windows/
│   ├── README.md
│   ├── PUBLISH_AND_INSTALL.md
│   └── scripts/                    # PowerShell: build, publish, install, prereqs
│
├── artifacts/                      # Binarios publicados e instalador .exe
│
├── dashboard.css                   # 🎨 Estilos del dashboard web
├── dashboard.js                    # ⚡ Lógica del dashboard web
├── index.html                      # 🌐 Dashboard UI principal
├── labs.config.json                # 📋 CATÁLOGO RAÍZ — fuente de verdad
├── Makefile                        # Targets de automatización
└── README.md                       # Punto de entrada del repositorio
```

---

## 🔑 Piezas clave

| Archivo | Rol | Editar |
|---|---|---|
| `labs.config.json` | Fuente de verdad del catálogo operativo | ✅ Editar aquí |
| `launcher/.../labs.windows.json` | Catálogo del launcher (generado) | ❌ No editar directamente |
| `dashboard-server/server.js` | Backend localhost que conecta Windows con WSL | ✅ |
| `scripts/sync-launcher-catalog.js` | Sincroniza catálogo raíz → launcher | ✅ |
| `scripts/verify-localhost.js` | Valida el flujo local del dashboard y su API | ✅ |
| `scripts/doctor.sh` | Diagnóstico de WSL, kraft y QEMU | ✅ |

---

## 🔄 Flujo de datos del catálogo

```text
[1] labs.config.json          ← fuente de verdad
        │
        ▼ node scripts/sync-launcher-catalog.js
[2] labs.windows.json         ← consumido por el launcher WinForms
        │
        ▼
[3] Dashboard + Launcher      ← misma topología localhost
```

---

📖 Ver también: [README.md](README.md) · [CONTRIBUTING.md](CONTRIBUTING.md) · [RUNBOOK.md](RUNBOOK.md)
