# 🌐 Lab 02 — nginx-runtime

[![Status](https://img.shields.io/badge/status-validado%20end--to--end-brightgreen)](../labs.config.json)
[![Port](https://img.shields.io/badge/puerto-8080-blue)](http://localhost:8080)
[![Runtime](https://img.shields.io/badge/runtime-kraft%20%2B%20QEMU-orange)](../docs/00-windows-and-wsl2.md)

> NGINX como unikernel — primer target HTTP real de la suite.
> **Único lab validado end-to-end** en esta iteración v1.

---

## 📋 Datos del lab

| Campo | Valor |
|---|---|
| Puerto host | `8080` |
| Instancia kraft | `ukl-nginx` |
| Protocolo health | HTTP |
| URL local | [http://localhost:8080](http://localhost:8080) |

---

## 🚀 Ejecutar (modo v1 — daemon)

Desde WSL:

```bash
kraft run -W -d --name ukl-nginx -p 8080:80
```

---

## ✅ Verificar

```bash
# Desde WSL
curl http://127.0.0.1:8080/
```

```powershell
# Desde PowerShell
Invoke-WebRequest http://127.0.0.1:8080 -UseBasicParsing
```

---

## 🪟 Desde el dashboard o launcher (recomendado)

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }

# Iniciar
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/02/start

# Health check
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/health

# Logs
Invoke-RestMethod http://127.0.0.1:9091/api/labs/02/logs
```

---

## 🎯 Por qué importa este lab

- Primer target HTTP: base para todos los benchmarks de red
- Valida port mapping `8080:80` en QEMU/KVM
- Confirma que `iptables` y WSL2 están correctamente configurados

---

📖 Ver también: [RUNBOOK.md](../RUNBOOK.md) · [01-hello-world](../01-hello-world/README.md) · [03-python-http](../03-python-http/README.md) · [docs/01-benchmark-strategy.md](../docs/01-benchmark-strategy.md)
