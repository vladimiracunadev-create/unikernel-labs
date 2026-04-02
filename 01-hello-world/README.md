# ⚡ Lab 01 — hello-world

[![Status](https://img.shields.io/badge/status-ready-brightgreen)](../labs.config.json)
[![Runtime](https://img.shields.io/badge/runtime-kraft%20%2B%20QEMU-orange)](../docs/00-windows-and-wsl2.md)

> Lab mínimo para validar que `kraft` está correctamente instalado y el runtime funciona.

---

## 🎯 Qué valida este lab

| Check | Descripción |
|---|---|
| ✅ `kraft` instalado | El binario responde y puede ejecutar Kraftfiles |
| ✅ Catálogo accesible | Las imágenes base de Unikraft son descargables |
| ✅ Runtime básico | QEMU puede levantar una instancia unikernel |
| ✅ Primer paso en WSL2 | Valida la topología Windows → WSL2 |

---

## 🚀 Ejecutar

Desde WSL:

```bash
cd /mnt/c/dev/unikernel-labs/01-hello-world
kraft run -W
```

---

## 🪟 Desde el dashboard o launcher

```powershell
$headers = @{ 'X-UCC-Request'='1'; 'Origin'='http://127.0.0.1:9091' }
Invoke-RestMethod -Method Post -Headers $headers http://127.0.0.1:9091/api/labs/01/start
```

---

📖 Ver también: [RUNBOOK.md](../RUNBOOK.md) · [02-nginx-runtime](../02-nginx-runtime/README.md) · [docs/03-lab-selection.md](../docs/03-lab-selection.md)
