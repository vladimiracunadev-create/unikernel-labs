# COMPATIBILITY

## Resumen ejecutivo

Este proyecto está pensado para una experiencia:

- **Windows 11 + WSL2**
- **Debian o Ubuntu dentro de WSL2**
- **KraftKit + QEMU/KVM** dentro de Linux
- **Launcher Windows** como capa de control

## Compatibilidad práctica

### Windows
- Bueno para UX, launcher, navegador, automatización PowerShell y publicación `.exe`.
- No es el runtime principal de los unikernels.

### WSL2
- Es la capa recomendada para correr `kraft` en Windows.
- El repo debe clonarse preferentemente en el filesystem Linux, no en `/mnt/c/...`.

### Linux nativo
- Sigue siendo la ruta más limpia para validar labs, puertos y troubleshooting.

### macOS
- Útil para estudiar y construir, pero esta versión del repo está optimizada mentalmente para Windows + WSL2.

## Riesgos operativos

1. Falta de virtualización o nested virtualization.
2. Falta de `/dev/kvm`.
3. QEMU no instalado dentro de WSL2.
4. Repo clonado en filesystem Windows en vez de Linux.
5. Colisiones de puertos en localhost.
6. Labs con madurez distinta según runtime/catálogo.

## Reglas de diseño del repo

- El usuario Windows debe sentir un flujo tipo producto.
- El backend real puede seguir siendo Linux.
- Los puertos deben ser previsibles.
- Los nombres de instancia deben ser estables para logs y stop.
- Cada lab debe tener README y puerto claro si es servicio.
