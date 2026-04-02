# 🐍 Lab 03 — python-http

[![Status](https://img.shields.io/badge/status-ready-brightgreen)](../labs.config.json)
[![Port](https://img.shields.io/badge/puerto-8081-blue)](http://localhost:8081)
[![Runtime](https://img.shields.io/badge/runtime-kraft%20%2B%20QEMU-orange)](../docs/00-windows-and-wsl2.md)

> Runtime Python con volumen montado para ejecutar una app mínima como unikernel.

---

## 📋 Datos del lab

| Campo | Valor |
|---|---|
| Puerto host | `8081` |
| Instancia kraft | `ukl-python` |
| Protocolo health | HTTP |
| URL local | [http://localhost:8081](http://localhost:8081) |

---

## 🚀 Ejecutar (modo v1 — daemon)

Desde WSL:

```bash
kraft run -W -d --name ukl-python -p 8081:8081
```

---

## ✅ Verificar

```bash
curl http://127.0.0.1:8081/
```

```powershell
Invoke-WebRequest http://127.0.0.1:8081 -UseBasicParsing
```

---

## 🪟 Desde el dashboard o launcher

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/03/start
Invoke-RestMethod http://127.0.0.1:9091/api/labs/03/health
```

---

## 💡 Nota conceptual

Este lab muestra la transición desde _"contenedor con código montado"_ hacia
_"runtime unikernel con código montado"_: misma idea, diferente stack de ejecución.

---

📖 Ver también: [RUNBOOK.md](../RUNBOOK.md) · [02-nginx-runtime](../02-nginx-runtime/README.md) · [04-node-http](../04-node-http/README.md)
