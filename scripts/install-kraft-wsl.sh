#!/usr/bin/env bash
set -euo pipefail

PREFIX="${HOME}/.local/bin"
WORKDIR="$(mktemp -d)"
PROFILE="${HOME}/.profile"
PATH_LINE='export PATH="$HOME/.local/bin:$PATH"'

cleanup() {
  rm -rf "${WORKDIR}"
}

trap cleanup EXIT

mkdir -p "${PREFIX}"

VERSION="$(curl -sSfL https://get.kraftkit.sh/latest.txt)"

# Valida el formato de versión antes de interpolarlo en URLs. Evita descargas
# corruptas o inyección de ruta si el endpoint devuelve algo inesperado.
if ! printf '%s' "${VERSION}" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Versión de kraft inválida recibida: '${VERSION}'" >&2
  exit 1
fi

BASE="https://github.com/unikraft/kraftkit/releases/latest/download"
ARCHIVE_NAME="kraft_${VERSION}_linux_amd64.tar.gz"
ARCHIVE="${WORKDIR}/kraft.tar.gz"

curl -sSfL "${BASE}/${ARCHIVE_NAME}" -o "${ARCHIVE}"

# Verificación de integridad (best-effort): si el release publica checksums,
# se valida el SHA256 del archivo descargado; si no, se avisa y se continúa.
CHECKSUMS="${WORKDIR}/checksums.txt"
if curl -sSfL "${BASE}/kraft_${VERSION}_checksums.txt" -o "${CHECKSUMS}" 2>/dev/null \
  || curl -sSfL "${BASE}/checksums.txt" -o "${CHECKSUMS}" 2>/dev/null; then
  EXPECTED="$(grep " ${ARCHIVE_NAME}\$" "${CHECKSUMS}" 2>/dev/null | awk '{print $1}' | head -1)"
  if [ -n "${EXPECTED}" ]; then
    ACTUAL="$(sha256sum "${ARCHIVE}" | awk '{print $1}')"
    if [ "${EXPECTED}" != "${ACTUAL}" ]; then
      echo "Checksum SHA256 no coincide para ${ARCHIVE_NAME}." >&2
      echo "  esperado: ${EXPECTED}" >&2
      echo "  obtenido: ${ACTUAL}" >&2
      exit 1
    fi
    echo "Checksum SHA256 verificado."
  else
    echo "Aviso: sin checksum para ${ARCHIVE_NAME}; se omite verificación." >&2
  fi
else
  echo "Aviso: no se pudo descargar checksums; se omite verificación de integridad." >&2
fi

tar -xzf "${ARCHIVE}" -C "${WORKDIR}"

install "${WORKDIR}/kraft" "${PREFIX}/kraft"
install "${WORKDIR}/kraftld" "${PREFIX}/kraftld"

if [ ! -f "${PROFILE}" ] || ! grep -qxF "${PATH_LINE}" "${PROFILE}"; then
  printf '%s\n' "${PATH_LINE}" >> "${PROFILE}"
fi

export PATH="${HOME}/.local/bin:${PATH}"
kraft version
