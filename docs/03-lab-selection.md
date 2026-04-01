# Seleccion de labs

## Primera ola

- hello-world
- nginx-runtime
- python-http
- node-http
- redis-runtime

## Estado de validacion actual

En esta iteracion quedo validado end-to-end:

- dashboard localhost en `:9091`
- `nginx-runtime` en `:8080`

Los demas labs siguen en el catalogo y deben verificarse con el mismo flujo:

1. diagnostico WSL
2. start desde dashboard o launcher
3. health por API
4. validacion directa en `localhost`

## Segunda ola

- benchmarks formales
- `runu`
- `kraft cloud`
- rootfs personalizados

## No partir por aqui

- ecosistemas multi-servicio complejos
- equivalentes exactos de Docker Compose
- features Windows nativas que salten WSL
