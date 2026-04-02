# 📊 Track 06 — Benchmarks

[![Status](https://img.shields.io/badge/status-pista-yellow)](../ROADMAP.md)
[![Milestone](https://img.shields.io/badge/milestone-v0.2-orange)](../ROADMAP.md)

> Este track **no promete resultados mágicos**. Define cómo medir de forma seria
> y reproducible. Consulta la estrategia completa → [docs/01-benchmark-strategy.md](../docs/01-benchmark-strategy.md)

---

## 🎯 Comparativas planificadas

| Lab | Comparativa |
|---|---|
| 🌐 nginx | Docker Linux vs Docker Desktop/WSL2 vs Unikraft |
| ⚡ hello-world | Tiempo a primera respuesta (cold start) |
| 🗄️ redis | Arranque y huella de memoria |

---

## 📁 Artefactos esperados

```text
06-benchmarks/
└── reports/
    ├── nginx-cold-start.txt
    ├── redis-memory.txt
    └── summary.md      ← tabla resumen con hardware declarado
```

> [!IMPORTANT]
> Todo benchmark debe declarar: CPU/RAM, SO, versión de runtime, si usó WSL2 y si usó `-W`.
> Ver [docs/01-benchmark-strategy.md](../docs/01-benchmark-strategy.md) para la regla completa.

---

## 🔮 Estado

⏳ Pendiente — ver [ROADMAP.md v0.2](../ROADMAP.md)

---

📖 Ver también: [docs/01-benchmark-strategy.md](../docs/01-benchmark-strategy.md) · [05-redis-runtime](../05-redis-runtime/README.md) · [02-nginx-runtime](../02-nginx-runtime/README.md)
