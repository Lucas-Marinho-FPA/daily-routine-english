# dev/ — fontes, ferramentas e testes do Daily Routine English

A raiz do repositório é o **app publicado** (o que o GitHub Pages serve). Esta pasta guarda o que é preciso para
**continuar o desenvolvimento**: conteúdo-fonte, geradores, build, testes, fixtures e evidências. Nada daqui entra
no pré-cache do app (o service worker só lista os arquivos do app).

## Estrutura

| Pasta/arquivo | O que é |
|---|---|
| `content/word/` | extração (já sanitizada) dos documentos Word das rotinas do Lucas |
| `content/enrich/` | curadoria: itens, perguntas, linguagem, estrutura, episódios R11–R18 (Lucas 2.0), registro de revisão |
| `content/characters/karla.json` | pacote da Karla (K01–K11) |
| `content/characters/lucas-kid.json` | **pacote do Lukinhas** (L01–L10): os dez textos, traduções, 73 expressões, 30 perguntas |
| `content/personas-planned.json` | personagens previstos sem conteúdo (Heitor) |
| `content/journeys/cp.json` | Conversation Practice (CP01–CP02), conteúdo original |
| `content/build/` | gerado pelo build (mantido aqui para os testes rodarem sem regenerar áudio/durações) |
| `tools/build-app.mjs` | build completo: conteúdo, personagens, jornadas, léxico, `dist/app.js`, `sw.js` |
| `tools/build-content.mjs` · `build-characters.mjs` · `build-journeys.mjs` | builds parciais (chamados pelo build-app) |
| `tools/lukinhas-source.mjs` | **gerador do pacote do Lukinhas** (confere os dez textos caractere por caractere) |
| `tools/gen_audio.py` · `qa_audio.py` | áudio britânico offline (Kokoro) e conferência de pronúncia |
| `tools/qr.mjs` · `screenshots.mjs` · `sw.template.js` · `extract_word.py` | QR da página de instalação, capturas do manifesto, modelo do service worker, extração do Word |
| `tests/unit/` | testes unitários (`node --test`), inclui `lukinhas.test.js` |
| `tests/e2e/` | testes E2E Chromium: `run`, `run-pages`, `asr-local`, `storage`, `wordpractice`, `characters`, `journey`, `mvp`, `pwa`, `lukinhas` |
| `tests/fixtures/` | áudios sintéticos, transcrições reais do Moonshine, referências publicadas de Lucas/Karla, **`lukinhas-texts.json`** (os dez textos aprovados) |
| `vendor/` | dicionário CMU (léxico) e fontes do reconhecimento de fala (Moonshine, onnxruntime-web, tokenizer; MIT) |
| `docs/` | notas internas antigas (backlog de publicação, relatório de integridade) |
| `evidence/2026-10-31/` | logs da última regressão completa (Lukinhas) |
| `setup-workdir.sh` | monta a cópia de trabalho a partir do clone |

## Fora do repositório, de propósito

- `tools/privacy_sanitize.py` — contém literalmente os nomes privados que remove; a extração em `content/word/` já
  está sanitizada, então o build não precisa dele. Os padrões de proteção nos builds e testes estão codificados.
- `tests/fixtures/conversation-book-01-02.json` — texto do Conversation Book (sem licença): o build e os testes
  funcionam sem ele (a comparação com o livro fica desligada).
- Documento Word original do usuário (fonte de `content/word/`), modelo Kokoro e `node_modules/`.
- Binários do reconhecimento de fala em `vendor/asr` (~38 MB): idênticos aos de `asr/` na raiz; o
  `setup-workdir.sh` copia de lá.

## Reconstruir e testar a partir de um clone

```bash
git clone https://github.com/Lucas-Marinho-FPA/daily-routine-english.git
cd daily-routine-english && git checkout mvp-jornadas
bash dev/setup-workdir.sh ../drg-work      # monta app/ + fontes
cd ../drg-work
npm ci                                      # esbuild e playwright (Chromium do playwright: npx playwright install chromium, se faltar)
npm test                                    # unitários
node tools/build-app.mjs                    # rebuild (gera app/dist, app/data, app/sw.js)
# E2E (em sequência, nunca em paralelo); para simular o GitHub Pages, sirva app/ sob /daily-routine-english/:
mkdir -p ../site && cp -a app ../site/daily-routine-english
node tests/e2e/lukinhas.mjs ../site /daily-routine-english/ ../ev-lukinhas
node tests/e2e/pwa.mjs ../site /daily-routine-english/ ../ev-pwa
node tests/e2e/run.mjs ../ev-local          # (run.mjs e run-pages.mjs têm caminhos de saída próprios)
```

Para publicar uma versão nova do app, os arquivos gerados em `drg-work/app/` são copiados de volta para a raiz do
repositório (mesma árvore), conferidos com `git diff` e commitados — publicação só com autorização explícita.

Áudio novo (opcional): Python com `kokoro-onnx` 0.6, `onnxruntime`, `soundfile`, `phonemizer`, `espeakng-loader`,
`numpy`, mais `ffmpeg`; modelo `kokoro-v1.0.int8.onnx` e `voices-v1.0.bin` (projeto kokoro-onnx). Comando:
`python tools/gen_audio.py <kokoro.onnx> <voices.bin>` (incremental; vozes por entrada no manifesto).
