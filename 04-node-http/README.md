# 🟢 Lab 04 — node-http

[![Status](https://img.shields.io/badge/status-ready-brightgreen)](../labs.config.json)
[![Port](https://img.shields.io/badge/puerto-8082-blue)](http://localhost:8082)
[![Runtime](https://img.shields.io/badge/runtime-kraft%20%2B%20QEMU-orange)](../docs/00-windows-and-wsl2.md)

> Runtime Node.js para una app HTTP mínima como unikernel.

---

## 📋 Datos del lab

| Campo | Valor |
|---|---|
| Puerto host | `8082` |
| Instancia kraft | `ukl-node` |
| Protocolo health | HTTP |
| URL local | [http://localhost:8082](http://localhost:8082) |

---

## 🚀 Ejecutar (modo v1 — daemon)

Desde WSL:

```bash
kraft run -W -d --name ukl-node -p 8082:8082
```

---

## ✅ Verificar

```bash
curl http://127.0.0.1:8082/
```

```powershell
Invoke-WebRequest http://127.0.0.1:8082 -UseBasicParsing
```

---

## 🪟 Desde el dashboard o launcher

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/04/start
Invoke-RestMethod http://127.0.0.1:9091/api/labs/04/health
```

---

📖 Ver también: [RUNBOOK.md](../RUNBOOK.md) · [03-python-http](../03-python-http/README.md) · [05-redis-runtime](../05-redis-runtime/README.md)
