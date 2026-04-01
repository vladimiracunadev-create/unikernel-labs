# COMPATIBILITY

## Resumen ejecutivo

La experiencia principal del repo esta pensada para:

- Windows 11
- WSL2
- Ubuntu o Debian dentro de WSL
- `kraft` instalado en `~/.local/bin`
- QEMU/KVM disponible
- `iptables` disponible
- dashboard local o launcher Windows como capa de control

## Matriz practica

### Windows + WSL2

Es la ruta principal del producto.

Validado en esta iteracion:

- dashboard local en `localhost:9091`
- deteccion de `Ubuntu`
- `kraft version`
- arranque de `nginx-runtime`
- respuesta real en `http://localhost:8080`

### Repo en filesystem Windows

Ruta ejemplo:

```text
C:\dev\unikernel-labs
```

Visto desde WSL:

```text
/mnt/c/dev/unikernel-labs
```

Este layout funciona bien para:

- dashboard Node corriendo en Windows
- launcher WinForms
- pruebas rapidas de `localhost`

### Repo en filesystem Linux

Sigue siendo una buena opcion para trabajo prolongado desde WSL.

Es mas limpia para builds y workflows Linux puros, aunque no es obligatoria para el flujo actual del dashboard.

### Linux nativo

Sigue siendo util para troubleshooting y validacion de labs, pero el producto se narra como Windows + WSL2 + localhost.

### macOS

Sirve para lectura, desarrollo parcial y documentacion, pero no es la ruta principal del producto.

## Riesgos operativos

1. falta de virtualizacion o nested virtualization
2. falta de `/dev/kvm`
3. `kraft` no instalado o fuera de `PATH`
4. QEMU no instalado
5. `iptables` ausente
6. colisiones de puertos en `localhost`
7. diferencias de madurez entre labs

## Reglas de diseno

- la UX principal se cuenta desde Windows
- el runtime real sigue siendo Linux
- los puertos deben ser estables
- los nombres de instancia deben ser estables
- `labs.config.json` es la fuente de verdad
- la app Windows debe seguir el mismo catalogo y la misma topologia localhost
