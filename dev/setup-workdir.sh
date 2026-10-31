#!/usr/bin/env bash
# Monta a cópia de trabalho de desenvolvimento a partir de um clone do repositório:
#   <destino>/app/        ← o app publicado (raiz do repositório, sem dev/, docs/ e documentos de continuidade)
#   <destino>/content/, tools/, tests/, vendor/, package.json, docs/  ← vindos de dev/
# Os binários grandes do reconhecimento de fala (idênticos aos de asr/) são copiados de asr/ para vendor/asr/,
# em vez de ficarem duplicados no repositório.
# Uso: bash dev/setup-workdir.sh [destino]   (padrão: ../drg-work ao lado do clone)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-$REPO/../drg-work}"
mkdir -p "$DEST/app"
DEST="$(cd "$DEST" && pwd)"
cp -a "$REPO/dev/." "$DEST/"
rm -f "$DEST/setup-workdir.sh"
(cd "$REPO" && for f in *; do
  case "$f" in dev|docs|CLAUDE.md|HANDOFF.md|README.md) ;; *) cp -a "$f" "$DEST/app/" ;; esac
done)
mkdir -p "$DEST/vendor/asr/onnxruntime-web/dist" "$DEST/vendor/asr/moonshine-js/model/quantized"   # pastas vazias não vão para o git
cp "$REPO/asr/ort-wasm-simd-threaded.wasm" "$REPO/asr/ort-wasm-simd-threaded.mjs" "$DEST/vendor/asr/onnxruntime-web/dist/"
cp "$REPO/asr/tiny/quantized/encoder_model.onnx" "$REPO/asr/tiny/quantized/decoder_model_merged.onnx" "$DEST/vendor/asr/moonshine-js/model/quantized/"
echo "Cópia de trabalho pronta em $DEST"
echo "Próximos passos: cd \"$DEST\" && npm ci && npm test   (build: node tools/build-app.mjs)"
