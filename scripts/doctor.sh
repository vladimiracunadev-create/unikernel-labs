#!/usr/bin/env bash
set -euo pipefail

echo "=== unikernel-labs doctor ==="
echo "PWD: $(pwd)"
echo

echo "[1] WSL / kernel"
uname -a || true
echo

echo "[2] /dev/kvm"
if [[ -e /dev/kvm ]]; then
  echo "OK: /dev/kvm existe"
else
  echo "WARN: /dev/kvm no existe"
fi
echo

echo "[3] kraft"
if command -v kraft >/dev/null 2>&1; then
  kraft version || true
else
  echo "WARN: kraft no está instalado"
fi
echo

echo "[4] qemu"
if command -v qemu-system-x86_64 >/dev/null 2>&1; then
  qemu-system-x86_64 --version | head -n 1 || true
else
  echo "WARN: qemu-system-x86_64 no está instalado"
fi
echo

echo "[5] python3"
python3 --version || true
echo

echo "[6] localhost ports"
for p in 8080 8081 8082 6379 9091; do
  if command -v ss >/dev/null 2>&1 && ss -ltn "( sport = :$p )" | tail -n +2 | grep -q .; then
    echo "PORT $p: en uso"
  else
    echo "PORT $p: libre o no detectado"
  fi
done
