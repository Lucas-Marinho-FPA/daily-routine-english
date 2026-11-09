#!/usr/bin/env bash
# Base Pedagógica — verificação 12: o aplicativo não mudou.
# Monta uma cópia de trabalho a partir da árvore ATUAL (com base/), roda o build completo do app e compara, arquivo
# por arquivo, o app gerado com o app publicado na referência (padrão: b194cee). Também confirma que nada de base/ ou
# docs/ entrou no app nem na lista de pré-cache do service worker. Somente leitura no repositório.
# Uso: bash dev/tools/base/conferir-app.sh [referência] [pasta-temporária]   (precisa de node_modules: NODE_MODULES=<dir>)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../../.." && pwd)"
REF="${1:-b194cee}"
TMP="${2:-$(mktemp -d)}"
rm -rf "$TMP/work" "$TMP/ref"; mkdir -p "$TMP/ref"
bash "$REPO/dev/setup-workdir.sh" "$TMP/work" >/dev/null
if [ -n "${NODE_MODULES:-}" ]; then ln -s "$NODE_MODULES" "$TMP/work/node_modules"; else (cd "$TMP/work" && npm ci --silent); fi
(cd "$TMP/work" && node tools/build-app.mjs > "$TMP/build.log" 2>&1) || { cat "$TMP/build.log"; exit 1; }
git -C "$REPO" archive "$REF" | tar -x -C "$TMP/ref"
rm -rf "$TMP/ref"/.[!.]*   # arquivos ocultos da raiz (.nojekyll) são do Pages; o setup-workdir.sh nunca os copiou
rm -rf "$TMP/ref/dev" "$TMP/ref/docs" "$TMP/ref/CLAUDE.md" "$TMP/ref/HANDOFF.md" "$TMP/ref/README.md"
echo "build: $(tail -1 "$TMP/build.log")"
if diff -rq "$TMP/ref" "$TMP/work/app" > "$TMP/diff.txt"; then echo "app gerado == app de $REF: idêntico ($(find "$TMP/ref" -type f | wc -l) arquivos)"; else echo "DIFERENÇAS em relação a $REF:"; cat "$TMP/diff.txt"; exit 1; fi
if [ -e "$TMP/work/app/base" ] || [ -e "$TMP/work/app/docs" ]; then echo "ERRO: base/ ou docs/ dentro do app"; exit 1; fi
if grep -qE '"(base|docs|dev)/' "$TMP/work/app/sw.js"; then echo "ERRO: base/, docs/ ou dev/ no pré-cache"; exit 1; fi
echo "base/ e docs/ fora do app e do pré-cache: ok"
