#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://127.0.0.1:8080/}"
mkdir -p reports

echo "== benchmark simple =="
echo "target: ${URL}"

date > reports/last-benchmark.txt
printf 'target=%s\n' "$URL" >> reports/last-benchmark.txt

if command -v wrk >/dev/null 2>&1; then
  wrk -t2 -c20 -d10s "$URL" | tee -a reports/last-benchmark.txt
elif command -v curl >/dev/null 2>&1; then
  echo "wrk no está disponible; usando 10 requests simples con curl" | tee -a reports/last-benchmark.txt
  for i in $(seq 1 10); do
    curl -s -o /dev/null -w "request=$i http_code=%{http_code} total=%{time_total}\n" "$URL" | tee -a reports/last-benchmark.txt
  done
else
  echo "No se encontró wrk ni curl" >&2
  exit 1
fi
