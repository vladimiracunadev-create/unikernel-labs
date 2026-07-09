#!/usr/bin/env bash
set -euo pipefail
# Servidor estático auxiliar. Se ata a 127.0.0.1 para NO exponer el árbol del
# repo (código, .git, docs) a la red local. El dashboard real es
# `node dashboard-server/server.js`, que además aplica un allowlist de assets.
python3 -m http.server 9091 --bind 127.0.0.1
