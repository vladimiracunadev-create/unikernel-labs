# Windows localhost launcher

## Objetivo

Convertir el laboratorio en algo cercano a una **suite local Windows**, sin fingir que el unikernel corre como proceso nativo de Windows.

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
[Debian/Ubuntu en WSL2]
   |
   v
[kraft + QEMU/KVM]
   |
   v
[Unikernel / servicio]
   |
   v
[localhost:<puerto>]
```

## Responsabilidades del launcher

- autodetectar o pedir nombre de distro
- autodetectar o pedir path Linux del repo
- leer catálogo de labs
- iniciar servicios
- detener servicios
- consultar logs
- abrir URLs
- mostrar salida en una consola integrada
- verificar salud HTTP/TCP/Redis con más contexto

## Qué NO hace el launcher

- no reemplaza `kraft`
- no elimina WSL2
- no empaqueta por sí solo los unikernels
- no garantiza compatibilidad universal con todos los labs

## Beneficios

- experiencia más cercana a producto
- mejor demo para portafolio
- separación clara entre UX y runtime
- crecimiento futuro hacia instalador o servicio Windows


## Relación con packaging

Complementa este documento con `docs/05-packaging-and-publish.md` y `windows/PUBLISH_AND_INSTALL.md` para la ruta de publicación e instalación de la v1.


## Ajuste V7

La v7 del launcher agrega:

- autodetección al iniciar
- selector visual de distros WSL detectadas
- grilla de servicios con estado por colores

Esto refuerza el posicionamiento de **Unikernel Control Center v1** como capa operativa Windows, sin presentarlo todavía como `Desktop`.
