# RUNBOOK

## Flujo operativo recomendado

### Desde WSL2

```bash
cd ~/dev/unikernel-labs
make doctor
make run-nginx
make run-python
make run-node
make run-redis
```

### Desde Windows

- iniciar `UnikernelLabs.Launcher.exe`
- seleccionar distro
- indicar repo Linux
- elegir lab
- Start / Stop / Logs / Open

---

## Nombres de instancia sugeridos

| Lab | Nombre de instancia |
|---|---|
| hello-world | `ukl-hello` |
| nginx | `ukl-nginx` |
| python-http | `ukl-python` |
| node-http | `ukl-node` |
| redis | `ukl-redis` |

---

## Puertos

| Servicio | Puerto |
|---|---:|
| dashboard | 9091 |
| nginx | 8080 |
| python | 8081 |
| node | 8082 |
| redis | 6379 |

---

## Comandos rápidos

### Estado

```bash
kraft ps
```

### Logs

```bash
kraft logs ukl-nginx
kraft logs ukl-python
kraft logs ukl-node
kraft logs ukl-redis
```

### Detener

```bash
kraft stop ukl-nginx
kraft stop ukl-python
kraft stop ukl-node
kraft stop ukl-redis
```

---

## Dashboard

```bash
cd ~/dev/unikernel-labs
python3 -m http.server 9091
```

Abrir en Windows:

```text
http://localhost:9091
```

---

## Criterio de operación

- El launcher Windows es la cara del producto.
- WSL2 es la capa técnica.
- Los labs de red deben priorizar puertos fijos y nombres estables.
- “Open” debe existir solo cuando el servicio tiene URL.
