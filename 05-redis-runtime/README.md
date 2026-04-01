# 05-redis-runtime

Lab base para Redis como unikernel.

## Ejecutar

```bash
kraft run -W -p 6379:6379
```

## Validar

```bash
redis-cli -p 6379 ping
```

## Uso

- comparar cold start
- comparar memoria base
- comparar con Redis en Docker / VM / Linux host


## Operación recomendada para esta v1

```bash
kraft run -W -d --name ukl-redis -p 6379:6379
```
