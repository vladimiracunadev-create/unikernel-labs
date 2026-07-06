# 🧪 Selección de labs — Estado de validación

> Qué labs están listos para usar, cuáles son pistas de exploración y qué evitar al empezar.

---

## 🟢 Primera ola — Labs operativos

| # | Lab | Estado | Puerto | Instancia |
|---|---|---|---:|---|
| 01 | [hello-world](../01-hello-world/README.md) | ✅ ready | — | `ukl-hello` |
| 02 | [nginx-runtime](../02-nginx-runtime/README.md) | ✅ validado end-to-end | 8080 | `ukl-nginx` |
| 03 | [python-http](../03-python-http/README.md) | ✅ ready | 8081 | `ukl-python` |
| 04 | [node-http](../04-node-http/README.md) | ✅ ready | 8082 | `ukl-node` |
| 05 | [redis-runtime](../05-redis-runtime/README.md) | ✅ ready | 6379 | `ukl-redis` |

---

## 🏅 Validado end-to-end en esta iteración

- ✅ Dashboard localhost en `:9091`
- ✅ `nginx-runtime` en `:8080` con respuesta HTTP real

Los demás labs siguen en el catálogo y deben verificarse con el mismo flujo:

1. 🩺 Diagnóstico WSL (`scripts/doctor.sh`)
2. ▶️ Start desde dashboard o launcher
3. ✅ Health por API (`/api/labs/NN/health`)
4. 🌐 Validación directa en `localhost:<puerto>`

---

## 🔮 Segunda ola — Pistas de exploración

| # | Pista | Doc |
|---|---|---|
| 06 | Benchmarks formales | [06-benchmarks/README.md](../06-benchmarks/README.md) |
| 07 | `urunc` — runtime OCI para unikernels | [07-urunc-track/README.md](../07-urunc-track/README.md) |
| 08 | `kraft cloud` (Unikraft Cloud) — despliegue cloud | [08-kraft-cloud-track/README.md](../08-kraft-cloud-track/README.md) |

---

## 🚫 Por dónde no empezar

> [!CAUTION]
> Estos casos no son el punto de entrada correcto para esta suite:

- Ecosistemas multi-servicio complejos (eso es `docker-labs`)
- Equivalentes exactos de Docker Compose
- Features Windows nativas que salten WSL

---

📖 Ver también: [01-benchmark-strategy.md](01-benchmark-strategy.md) · [RUNBOOK.md](../RUNBOOK.md) · [ROADMAP.md](../ROADMAP.md)
