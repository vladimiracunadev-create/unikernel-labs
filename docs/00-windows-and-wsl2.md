# Windows and WSL2

## Mensaje corto

Sí puedes tener una experiencia tipo aplicación Windows.

No, el unikernel no se ejecuta como proceso Windows nativo común.

## Modelo recomendado

- Windows para UX y launcher
- WSL2 para Linux
- `kraft` para correr y gestionar instancias
- `localhost` para exponer servicios

## Recomendaciones

- usar Debian o Ubuntu
- clonar en filesystem Linux
- publicar puertos fijos
- mantener nombres de instancia estables
