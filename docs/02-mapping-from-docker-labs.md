# Mapeo desde docker-labs

## Qué sí se conserva

- estructura por labs
- historia principal del repo
- dashboard local
- documentación profunda
- criterio de operación

## Qué cambia

- `docker compose` deja de ser el centro
- el runtime pasa a `kraft` / QEMU / KVM / catálogos OCI de Unikraft
- la compatibilidad Windows se vuelve menos transparente
- la narrativa técnica migra desde “levanta stacks” hacia “evalúa especialización y compatibilidad”

## Traducción sugerida

- Docker Labs = operabilidad de stacks y observabilidad local
- Unikernel Labs = especialización, arranque y criterio arquitectónico
