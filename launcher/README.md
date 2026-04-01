# Launcher

La carpeta `launcher/` contiene la cara de producto de **Unikernel Control Center v1**.

## Qué incluye ahora

- branding inicial del producto
- icono y logo para la aplicación Windows
- cabecera visual tipo producto
- menú superior con acciones principales
- barra de estado
- **barra lateral con iconos**
- **autodetección al iniciar, selector visual de distros WSL y detección de la ruta Linux del repo**
- detalle del servicio seleccionado
- **grilla de servicios con estado por colores y health checks ricos para HTTP, Redis y TCP**
- persistencia simple de la configuración local

## Objetivo

Entregar una experiencia más seria y demostrable para Windows sin ocultar que el backend real sigue viviendo en **WSL2 + kraft**.

## Subárbol principal

```text
windows/src/UnikernelLabs.Launcher
```

## Qué representa esta v1

Sí representa:

- control por servicio
- apertura de endpoints `localhost`
- verificación rápida de salud
- validación básica del entorno
- narrativa de producto consistente

Todavía no representa:

- desktop completo con settings avanzados
- instalador final
- administración profunda de imágenes, redes o volúmenes
- reemplazo funcional total de Docker Desktop
