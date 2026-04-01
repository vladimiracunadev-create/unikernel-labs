# Windows localhost launcher

## Objetivo

Convertir el laboratorio en una suite local Windows creible, sin fingir que el runtime unikernel corre como proceso nativo de Windows.

## Arquitectura

```text
[Usuario]
   |
   v
[Launcher Windows .exe]
   |
   v
[wsl.exe]
   |
   v
[Ubuntu o Debian en WSL2]
   |
   v
[kraft + QEMU/KVM + iptables]
   |
   v
[servicio unikernel]
   |
   v
[localhost:<puerto>]
```

## Responsabilidades del launcher

- autodetectar distro WSL
- autodetectar o pedir path Linux del repo
- leer el catalogo generado del launcher
- iniciar servicios
- detener servicios
- consultar logs
- abrir URLs
- mostrar salida operativa
- verificar salud HTTP/TCP/Redis

## Relacion con el dashboard

El launcher no es una implementacion paralela desconectada.

Debe seguir:

- el mismo catalogo fuente (`labs.config.json`)
- la misma topologia localhost
- la misma idea de `Start / Stop / Logs / Health / Open`

El dashboard sigue siendo local. No forma parte de una estrategia de publicacion en GitHub Pages.

## Que no hace

- no reemplaza `kraft`
- no elimina WSL2
- no empaqueta por si solo los unikernels
- no garantiza compatibilidad universal con cualquier lab

## Posicionamiento correcto

El launcher es la superficie desktop de **Unikernel Control Center v1**.

No debe venderse todavia como un "Unikernel Desktop" completo.
