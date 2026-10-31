# Dependências do reconhecimento de fala local (todas MIT)

| Pasta | Origem | Uso |
|---|---|---|
| `moonshine-js/` | `@moonshine-ai/moonshine-js` 0.1.29 (npm): `src/model.ts`, `src/constants.ts`, `src/log.ts`, `LICENSE` e o modelo inglês `tiny/quantized` (`encoder_model.onnx`, `decoder_model_merged.onnx`) | inferência Moonshine |
| `onnxruntime-web/` | `onnxruntime-web` 1.22.0 (npm): build só-WASM (`ort.wasm.min.mjs`, `ort-wasm-simd-threaded.{mjs,wasm}`) | runtime ONNX |
| `llama-tokenizer-js/` | `llama-tokenizer-js` 1.2.2 (npm) | decodificação dos tokens |

Única alteração: em `moonshine-js/src/constants.ts`, os endereços padrão (download.moonshine.ai e cdn.jsdelivr.net) foram trocados por `./`, para que nada possa ser buscado fora do app.
`tools/build-app.mjs` compila `app/js/audio/asr-worker.js` com estas fontes para `app/asr/`.
