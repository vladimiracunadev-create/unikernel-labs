# 02-nginx-runtime

Lab para publicar NGINX como unikernel.

## Ejecutar

```bash
kraft run -W -p 8080:80
```

## Probar

```bash
curl http://127.0.0.1:8080/
```

## Objetivo

- entender port mapping
- medir tiempo de arranque
- tener el primer target HTTP para benchmark


## Operación recomendada para esta v1

```bash
kraft run -W -d --name ukl-nginx -p 8080:80
```
