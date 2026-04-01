SHELL := /bin/bash

.PHONY: help serve doctor run-hello run-nginx run-python run-node run-redis stop-hello stop-nginx stop-python stop-node stop-redis status logs-nginx logs-python logs-node logs-redis benchmark-nginx

help:
	@echo "Targets disponibles:"
	@echo "  make serve         # dashboard local en 9091"
	@echo "  make doctor        # diagnóstico rápido del host"
	@echo "  make run-hello     # hello world (validación)"
	@echo "  make run-nginx     # nginx unikernel en 8080"
	@echo "  make run-python    # python unikernel en 8081"
	@echo "  make run-node      # node unikernel en 8082"
	@echo "  make run-redis     # redis unikernel en 6379"
	@echo "  make status        # lista instancias"
	@echo "  make stop-*        # detiene instancia"
	@echo "  make logs-*        # muestra logs"
	@echo "  make benchmark-nginx"

serve:
	@python3 -m http.server 9091

doctor:
	@bash scripts/doctor.sh

run-hello:
	@cd 01-hello-world && kraft run -W -d --name ukl-hello

run-nginx:
	@cd 02-nginx-runtime && kraft run -W -d --name ukl-nginx -p 8080:80

run-python:
	@cd 03-python-http && kraft run -W -d --name ukl-python -p 8081:8081

run-node:
	@cd 04-node-http && kraft run -W -d --name ukl-node -p 8082:8082

run-redis:
	@cd 05-redis-runtime && kraft run -W -d --name ukl-redis -p 6379:6379

stop-hello:
	@kraft stop ukl-hello || true

stop-nginx:
	@kraft stop ukl-nginx || true

stop-python:
	@kraft stop ukl-python || true

stop-node:
	@kraft stop ukl-node || true

stop-redis:
	@kraft stop ukl-redis || true

status:
	@kraft ps

logs-nginx:
	@kraft logs ukl-nginx || true

logs-python:
	@kraft logs ukl-python || true

logs-node:
	@kraft logs ukl-node || true

logs-redis:
	@kraft logs ukl-redis || true

benchmark-nginx:
	@bash scripts/benchmark.sh http://127.0.0.1:8080/
