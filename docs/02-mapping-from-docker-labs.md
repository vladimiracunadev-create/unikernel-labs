# Mapeo desde docker-labs

## Que se conserva

- estructura por labs
- narrativa del repo
- operacion local
- foco en `localhost`
- documentacion por capas

## Que cambia

- `docker compose` deja de ser el centro
- el runtime pasa a `kraft` + QEMU/KVM
- Windows deja de ser host de runtime y pasa a ser capa de control
- aparece un dashboard local con API y una app Windows sobre la misma topologia
- el catalogo raiz pasa a `labs.config.json` y el launcher consume una copia generada

## Traduccion sugerida

- Docker Labs = orquestacion de stacks
- Unikernel Labs = control local de servicios unikernel sobre WSL2

## Resultado esperado

La experiencia final no es "Docker Desktop con otro nombre".

Es:

- dashboard localhost
- launcher Windows
- backend WSL2
- servicios unikernel publicados en puertos fijos
