# Benchmark strategy

## Matriz mínima

| Escenario | Métrica |
|---|---|
| cold start | tiempo hasta primera respuesta |
| warm latency | p50 / p95 / p99 |
| memoria base | RSS / huella observable |
| throughput | requests por segundo |
| artifact size | tamaño de imagen / binario |
| complejidad | esfuerzo operativo |

## Comparativas sugeridas

- nativo Linux
- Docker en Linux
- Docker Desktop / WSL2
- Unikraft con `kraft run`

## Regla

Nunca publicar un benchmark sin declarar:

- host real
- CPU / RAM
- sistema operativo
- si se usó WSL2
- si se usó `-W`
- versión de runtime / imagen
