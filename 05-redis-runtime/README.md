# 🗄️ Lab 05 — redis-runtime

[![Status](https://img.shields.io/badge/status-ready-brightgreen)](../labs.config.json)
[![Port](https://img.shields.io/badge/puerto-6379-blue)](redis://localhost:6379)
[![Runtime](https://img.shields.io/badge/runtime-kraft%20%2B%20QEMU-orange)](../docs/00-windows-and-wsl2.md)

> Redis como unikernel — referencia de cold start y huella de memoria.

---

## 📋 Datos del lab

| Campo | Valor |
|---|---|
| Imagen runtime | `unikraft.org/redis:7.2` |
| Puerto host | `6379` |
| Instancia kraft | `ukl-redis` |
| Protocolo health | TCP |
| URL local | `redis://localhost:6379` |

---

## 🚀 Ejecutar (modo v1 — daemon)

Desde WSL:

```bash
kraft run -W -d --name ukl-redis -p 6379:6379
```

---

## ✅ Verificar

```bash
redis-cli -p 6379 ping
# Esperado: PONG
```

---

## 🪟 Desde el dashboard o launcher

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/05/start
Invoke-RestMethod http://127.0.0.1:9091/api/labs/05/health
```

---

## 📊 Uso en benchmarks

Este lab es referencia base para:

| Métrica | Qué compara |
|---|---|
| ⏱️ Cold start | Redis unikernel vs Redis en Docker vs Redis nativo |
| 🧠 Memoria base | RSS de la instancia unikernel vs alternativas |
| 🚀 Throughput | Requests por segundo con `redis-benchmark` |

---

📖 Ver también: [RUNBOOK.md](../RUNBOOK.md) · [04-node-http](../04-node-http/README.md) · [06-benchmarks](../06-benchmarks/README.md) · [docs/01-benchmark-strategy.md](../docs/01-benchmark-strategy.md)
