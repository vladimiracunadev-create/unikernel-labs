# 📊 Benchmark Strategy — Unikernel Labs

> Estrategia para comparar unikernels contra otras tecnologías de forma rigurosa y reproducible.
> Ver estado actual → [docs/03-lab-selection.md](03-lab-selection.md)

---

## 📐 Matriz mínima de métricas

| Métrica | Descripción | Herramienta sugerida |
|---|---|---|
| ⏱️ Cold start | Tiempo hasta primera respuesta | `time kraft run` |
| 📈 Warm latency | p50 / p95 / p99 | `wrk`, `hyperfine` |
| 🧠 Memoria base | RSS / huella observable | `/proc/<pid>/status` |
| 🚀 Throughput | Requests por segundo | `wrk`, `ab` |
| 📦 Artifact size | Tamaño de imagen / binario | `du`, `ls -lh` |
| 🔧 Complejidad | Esfuerzo operativo (cualitativo) | Evaluación manual |

---

## 🔀 Comparativas sugeridas

| Escenario | Descripción |
|---|---|
| 🐧 Nativo Linux | Punto de referencia base |
| 🐳 Docker en Linux | Overhead de contenedor puro |
| 🐳 Docker Desktop / WSL2 | Overhead en entorno Windows |
| ⚡ Unikraft con `kraft run` | El objetivo de esta suite |

---

## ⚖️ Regla de publicación

> [!IMPORTANT]
> Nunca publicar un benchmark sin declarar todos estos campos:

| Campo | Ejemplo |
|---|---|
| Host real | Intel Core i7-1185G7, 16GB RAM |
| CPU / RAM | x86_64, 16 GB |
| Sistema operativo | Windows 11 + WSL2 Ubuntu 22.04 |
| ¿Usó WSL2? | Sí / No |
| ¿Usó `-W`? | Sí (QEMU sin KVM) / No (con KVM) |
| Versión de runtime | `kraft v0.11.0`, imagen `nginx:latest` |

---

📖 Ver también: [03-lab-selection.md](03-lab-selection.md) · [ROADMAP.md](../ROADMAP.md)
