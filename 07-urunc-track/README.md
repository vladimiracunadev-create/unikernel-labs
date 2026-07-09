# 🔬 Track 07 — urunc

[![Status](https://img.shields.io/badge/status-pista%20experimental-yellow)](../ROADMAP.md)
[![Milestone](https://img.shields.io/badge/milestone-Fase%20B-blue)](../ROADMAP.md)

> Exploración de ejecución de unikernels empaquetados como OCI
> a través de runtimes de contenedor compatibles con containerd.

---

## 🎯 Objetivo de este track

Explorar cómo un unikernel empaquetado en formato OCI puede ejecutarse
a través de [**urunc**](https://urunc.io) — un runtime de contenedor integrado con
`containerd` — sin necesitar `kraft run` directamente.

> [!NOTE]
> Este track se llamaba antes **`runu`**. El runtime OCI para unikernels
> evolucionó y hoy el proyecto vigente es **`urunc`** ([urunc.io](https://urunc.io)),
> integrado con containerd vía `io.containerd.urunc.v2`.

---

## 🧩 Qué es urunc

`urunc` cierra la brecha entre unikernels y el ecosistema cloud-native. Se invoca
como cualquier runtime de containerd, por ejemplo con `nerdctl`:

```bash
nerdctl run --runtime io.containerd.urunc.v2 <imagen-unikernel-oci>
```

### Unikernels y monitores soportados

| Unikernel | Monitor (VMM) |
|---|---|
| **Unikraft** | QEMU · Firecracker |
| **Rumprun** | Solo5 |
| **MirageOS** | Solo5 · QEMU |
| **Mewz** (WASM) | QEMU |
| **Linux** (kernel custom) | QEMU · Firecracker · Cloud Hypervisor |
| **Hermit** | QEMU |

---

## ⚠️ Alcance correcto

> [!CAUTION]
> No tomar este track como "ya reemplaza Docker".

Su función es:

- Explorar integración con runtimes OCI (`urunc` + containerd)
- Construir narrativa técnica sobre portabilidad de unikernels
- **No** prometer equivalencia operacional total con Docker

---

## 🔮 Estado

⏳ Pendiente — ver [ROADMAP.md · Fase B](../ROADMAP.md)

---

📖 Ver también: [08-kraft-cloud-track](../08-kraft-cloud-track/README.md) · [docs/02-mapping-from-docker-labs.md](../docs/02-mapping-from-docker-labs.md) · [ROADMAP.md](../ROADMAP.md)
