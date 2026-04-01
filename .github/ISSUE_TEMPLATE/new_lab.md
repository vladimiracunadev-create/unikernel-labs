---
name: Propuesta de nuevo lab
about: Propón un nuevo servicio unikernel para añadir al catálogo
title: '[LAB] '
labels: enhancement, new-lab
assignees: ''
---

## Nombre del lab

`NN-nombre-en-kebab-case` (ej: `06-postgres-runtime`)

## Descripción

¿Qué servicio expone este lab? ¿Por qué es útil como ejemplo de unikernel?

## Runtime / imagen base

¿Qué runtime de kraft se usaría? (ej: `unikraft.org/nginx:latest`, imagen custom, etc.)

## Puerto expuesto

| Puerto en el host | Puerto interno | Protocolo |
|---|---|---|
| 8083 | 8083 | HTTP / TCP / ... |

## Comando de validación

¿Cómo se verifica que el servicio funciona correctamente?

```bash
curl http://localhost:8083
# o
redis-cli -h localhost -p 6379 ping
```

## Kraftfile propuesto (si tienes uno)

```yaml
spec: v0.6

runtime: ...

rootfs: ./src

cmd: ["/app"]
```

## Contexto adicional

¿Hay alguna dependencia especial, volumen montado o configuración extra que requiera?
