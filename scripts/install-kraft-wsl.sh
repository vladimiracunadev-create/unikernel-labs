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
ARCHIVE="${WORKDIR}/kraft.tar.gz"

curl -sSfL "https://github.com/unikraft/kraftkit/releases/latest/download/kraft_${VERSION}_linux_amd64.tar.gz" -o "${ARCHIVE}"
tar -xzf "${ARCHIVE}" -C "${WORKDIR}"

install "${WORKDIR}/kraft" "${PREFIX}/kraft"
install "${WORKDIR}/kraftld" "${PREFIX}/kraftld"

if [ ! -f "${PROFILE}" ] || ! grep -qxF "${PATH_LINE}" "${PROFILE}"; then
  printf '%s\n' "${PATH_LINE}" >> "${PROFILE}"
fi

export PATH="${HOME}/.local/bin:${PATH}"
kraft version
