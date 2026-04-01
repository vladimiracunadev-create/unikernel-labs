# 03-python-http

Runtime Python con volumen montado para ejecutar una app mínima.

## Ejecutar

```bash
kraft run -W -p 8081:8081
```

## Probar

```bash
curl http://127.0.0.1:8081/
```

## Nota

Este lab es útil para mostrar una transición conceptual desde “contenedor con código montado” hacia “runtime unikernel con código montado”.


## Operación recomendada para esta v1

```bash
kraft run -W -d --name ukl-python -p 8081:8081
```
