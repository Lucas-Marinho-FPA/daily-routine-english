#!/usr/bin/env node
// Build completo do app: conteúdo → bundle JS (esbuild, só em desenvolvimento) → service worker com pré-cache.
// O resultado em app/ é estático e não tem dependências: basta servir a pasta.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { qrSvg } from './qr.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'app');

execFileSync(process.execPath, [join(ROOT, 'tools/build-content.mjs')], { stdio: 'inherit' });
execFileSync(process.execPath, [join(ROOT, 'tools/build-characters.mjs')], { stdio: 'inherit' }); // personagens: data/characters.js
execFileSync(process.execPath, [join(ROOT, 'tools/build-journeys.mjs')], { stdio: 'inherit' }); // jornadas (Conversation Practice): data/journeys.js

mkdirSync(join(APP, 'dist'), { recursive: true });
const esbuild = await import('esbuild');

// léxico do inglês (CMU Pronouncing Dictionary, BSD-2) + vocabulário do app, compactado: confere transcrições livres
{
  const { gzipSync } = await import('node:zlib');
  const content = JSON.parse(readFileSync(join(ROOT, 'content/build/content.json'), 'utf8'));
  const { wordTokens } = await import('../app/js/engine/text.js');
  const words = new Set(readFileSync(join(ROOT, 'vendor/cmudict/words.txt'), 'utf8').split('\n').filter(Boolean));
  const add = (t) => { if (t) for (const w of wordTokens(t)) if (/^[a-z][a-z']*$/.test(w)) words.add(w); };
  for (const x of [...Object.values(content.sentences), ...Object.values(content.blocks)]) add(x.en);
  for (const q of Object.values(content.questions)) { add(q.q); add(q.a); }
  for (const it of Object.values(content.items)) add(it.en);
  // pacotes de personagens (Karla…): as palavras deles também são “do app” (ex.: Pilates, spinning)
  const chars = JSON.parse(readFileSync(join(ROOT, 'content/build/characters.json'), 'utf8'));
  for (const c of chars.characters) if (c.content && c.content !== 'base') {
    for (const x of [...Object.values(c.content.sentences), ...Object.values(c.content.questions)]) { add(x.en || x.q); add(x.a); }
    for (const it of Object.values(c.content.items)) add(it.en);
  }
  // jornadas (Conversation Practice): falas originais americanas e adaptações britânicas
  const jrs = JSON.parse(readFileSync(join(ROOT, 'content/build/journeys.json'), 'utf8'));
  for (const j of jrs.journeys) {
    for (const x of [...Object.values(j.content.sentences), ...Object.values(j.content.questions)]) { add(x.en || x.q); add(x.a); }
    for (const x of [...Object.values(j.content.listening), ...Object.values(j.content.reading)]) { add(x.q); x.options.forEach(add); }
    for (const it of Object.values(j.content.items)) add(it.en);
  }
  writeFileSync(join(APP, 'data/lexicon.txt.gz'), gzipSync([...words].sort().join('\n'), { level: 9 }));
  writeFileSync(join(APP, 'data/lexicon-LICENSE.txt'), 'Lista de palavras derivada do CMU Pronouncing Dictionary.\n\n' + readFileSync(join(ROOT, 'vendor/cmudict/LICENSE'), 'utf8'));
}

// Reconhecimento de fala local (opcional): worker + runtime WASM + modelo em app/asr/.
// NÃO entra no pré-cache: só é baixado quando o aluno pede (≈ 40 MB, uma vez) e fica num cache próprio.
const ASR = join(APP, 'asr');
const VENDOR = join(ROOT, 'vendor/asr');
rmSync(ASR, { recursive: true, force: true });
mkdirSync(join(ASR, 'tiny/quantized'), { recursive: true });
await esbuild.build({
  entryPoints: [join(APP, 'js/audio/asr-worker.js')],
  bundle: true,
  format: 'esm',
  target: ['chrome100'],
  outfile: join(ASR, 'worker.js'),
  // build só-WASM do onnxruntime (sem WebGPU/JSEP): runtime de 11 MB em vez de 22 MB
  alias: { 'onnxruntime-web': join(VENDOR, 'onnxruntime-web/dist/ort.wasm.min.mjs'), 'llama-tokenizer-js': join(VENDOR, 'llama-tokenizer-js/llama-tokenizer.js') },
  legalComments: 'none',
  banner: { js: '// Reconhecimento de fala local — Moonshine (MIT, Useful Sensors), onnxruntime-web (MIT, Microsoft), llama-tokenizer-js (MIT). Ver LICENSES.txt.' },
});
copyFileSync(join(VENDOR, 'onnxruntime-web/dist/ort-wasm-simd-threaded.mjs'), join(ASR, 'ort-wasm-simd-threaded.mjs'));
copyFileSync(join(VENDOR, 'onnxruntime-web/dist/ort-wasm-simd-threaded.wasm'), join(ASR, 'ort-wasm-simd-threaded.wasm'));
for (const f of ['encoder_model.onnx', 'decoder_model_merged.onnx']) copyFileSync(join(VENDOR, 'moonshine-js/model/quantized', f), join(ASR, 'tiny/quantized', f));
writeFileSync(join(ASR, 'LICENSES.txt'), [
  'Reconhecimento de fala local do Daily Routine English: componentes de terceiros (todos MIT).',
  '', '=== Moonshine (código e modelo inglês "tiny") — @moonshine-ai/moonshine-js 0.1.29 ===', readFileSync(join(VENDOR, 'moonshine-js/LICENSE'), 'utf8'),
  '', '=== onnxruntime-web 1.22.0 — MIT License, Copyright (c) Microsoft Corporation ===',
  '', '=== llama-tokenizer-js 1.2.2 ===', readFileSync(join(VENDOR, 'llama-tokenizer-js/LICENSE.md'), 'utf8'),
].join('\n'));
const asrFiles = ['worker.js', 'ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm', 'tiny/quantized/encoder_model.onnx', 'tiny/quantized/decoder_model_merged.onnx'];
const asrHash = createHash('sha256');
for (const f of asrFiles) asrHash.update(f).update(readFileSync(join(ASR, f)));
// sha por arquivo: numa versão nova, arquivos idênticos já baixados são reaproveitados (sem baixar 38 MB de novo)
const asrManifest = { version: asrHash.digest('hex').slice(0, 12), files: asrFiles.map((f) => ({ path: `asr/${f}`, size: statSync(join(ASR, f)).size, sha: createHash('sha256').update(readFileSync(join(ASR, f))).digest('hex').slice(0, 16) })) };

await esbuild.build({
  define: { __ASR_MANIFEST__: JSON.stringify(asrManifest) },
  entryPoints: [join(APP, 'js/main.js')],
  bundle: true,
  format: 'iife',
  target: ['chrome100'],
  outfile: join(APP, 'dist/app.js'),
  legalComments: 'none',
  banner: { js: '// Daily Routine English Game — bundle gerado por tools/build-app.mjs a partir de app/js (fonte legível).' },
});

// página de instalação: código QR com o endereço público dela, gerado aqui (tools/qr.mjs, sem biblioteca externa)
const INSTALL_URL = 'https://lucas-marinho-fpa.github.io/daily-routine-english/install.html';
mkdirSync(join(APP, 'img'), { recursive: true });
writeFileSync(join(APP, 'img/install-qr.svg'), qrSvg(INSTALL_URL, { label: 'Código QR: lucas-marinho-fpa.github.io/daily-routine-english/install.html' }));

// lista de arquivos para o pré-cache (tudo em app/ exceto o código-fonte modular e o próprio sw.js)
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = relative(APP, p).split('\\').join('/');
    // screenshots/: só para o pedido de instalação do navegador (online); não ocupam espaço no aparelho
    if (statSync(p).isDirectory()) { if (rel !== 'js' && rel !== 'asr' && rel !== 'screenshots') walk(p); continue; }
    if (rel === 'sw.js' || name.startsWith('.') || !/\.(html|js|css|webmanifest|png|svg|ogg|json|gz|txt)$/.test(name)) continue;
    files.push(rel);
  }
};
walk(APP);
files.sort();
const hash = createHash('sha256');
for (const f of files) hash.update(f).update(readFileSync(join(APP, f)));
const version = hash.digest('hex').slice(0, 12);
const precache = ['./', ...files];
const sw = readFileSync(join(ROOT, 'tools/sw.template.js'), 'utf8')
  .replace('__VERSION__', version)
  .replace('__FILES__', JSON.stringify(precache));
writeFileSync(join(APP, 'sw.js'), sw);
const bytes = files.reduce((n, f) => n + statSync(join(APP, f)).size, 0);
console.log(JSON.stringify({ version, files: files.length, totalMB: +(bytes / 1048576).toFixed(2), bundleKB: Math.round(statSync(join(APP, 'dist/app.js')).size / 1024), asrOptionalMB: +(asrManifest.files.reduce((n, f) => n + f.size, 0) / 1048576).toFixed(1) }));
