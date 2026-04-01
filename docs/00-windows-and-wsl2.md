# Windows and WSL2

## Mensaje corto

Si, puedes tener una experiencia tipo aplicacion Windows.

No, el unikernel no corre como un proceso Windows comun.

## Modelo recomendado

- Windows para UX
- dashboard local o launcher para operacion
- WSL2 para Linux
- `kraft` para gestionar instancias
- QEMU/KVM para el runtime
- `localhost` para exponer servicios

## Topologia validada

```text
Windows
  -> dashboard-server/server.js o launcher WinForms
  -> wsl.exe
  -> Ubuntu
  -> kraft + qemu + iptables
  -> localhost:8080/8081/8082/6379
```

## Recomendaciones

- usar `Ubuntu` o `Debian`
- si priorizas Windows, puedes dejar el repo en `C:\dev\unikernel-labs`
- si priorizas consola Linux, puedes clonarlo en `~/dev/unikernel-labs`
- mantener puertos fijos
- mantener nombres de instancia estables
- validar siempre con `scripts/doctor.sh` y `scripts/verify-localhost.js`
