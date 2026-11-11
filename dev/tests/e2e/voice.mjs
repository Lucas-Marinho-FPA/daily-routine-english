// Fala nas fases 1 e 5 dos diálogos: recorte do silêncio, segunda passada e corte do reconhecedor (2026-11-11).
// Uso: node tests/e2e/voice.mjs <pasta-do-site> <caminho-base> <pasta-dos-áudios> [pasta-de-evidências]
//   <pasta-dos-áudios>: as gravações do diagnóstico de voz (audio/ e noise/, cada uma com meta.json), geradas com a voz
//   sintética Kokoro (gen.py do diagnóstico): 10 expressões/falas × 6 variantes (sem folga, silêncio de gravação manual,
//   parada tardia, volume baixo, fala lenta, pausas entre palavras) + 2 falas longas × 5 + ruído de fundo a 20 e 10 dB.
//   Os áudios (~18 MB) não ficam no repositório.
//
// REAL: app construído, Moonshine no aparelho (worker + ONNX), decodificação, análise de voz, recorte (speechBounds),
// comparador e a MESMA função de avaliação usada pela interface (App.voiceEval = evaluateRecording de ui/dialogue.js);
// em V04, a interface real da fase 1 com o microfone falso do Chromium.
// CONTROLADO: em V03, só o texto devolvido pelo reconhecedor (para reproduzir um corte, que o Moonshine não faz de modo
// determinístico); o áudio e a análise de voz são reais.
// Não valida voz humana nem o Galaxy S25+.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const AUDIO = resolve(process.argv[4] || '');
const OUT = resolve(process.argv[5] || join(ROOT, 'evidence/voice'));
if (!process.argv[4] || !existsSync(join(AUDIO, 'audio/meta.json'))) { console.error('pasta dos áudios do diagnóstico ausente'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const PORT = 8827, BASE = `http://localhost:${PORT}${BASE_PATH}`;

const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const sets = [['audio', JSON.parse(readFileSync(join(AUDIO, 'audio/meta.json'), 'utf8'))], ['noise', JSON.parse(readFileSync(join(AUDIO, 'noise/meta.json'), 'utf8'))]];
const server = await serve(SITE, PORT);
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });
let ctx = await chromium.launchPersistentContext(PROFILE, { serviceWorkers: 'block' });
let page = ctx.pages()[0] || await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.route('**/__voice/**', (r) => { const [, set, file] = new URL(r.request().url()).pathname.match(/__voice\/([^/]+)\/(.+)$/); r.fulfill({ body: readFileSync(join(AUDIO, set, file)), contentType: 'audio/wav' }); });
await page.goto(BASE); await page.waitForFunction(() => window.DRG_APP && window.DRG_APP.state);
await page.evaluate(() => window.DRG_APP.asr.local.install());

// fase 1: todo item recortado; fase 5: falas de até 4 palavras recortadas (as duas longas vão inteiras)
const evaluate = (set, id, text) => page.evaluate(async ({ set, id, text }) => {
  const trim = text.trim().split(/\s+/).length <= 4; // = trimForLine (fase 5); itens da fase 1 têm até 4 palavras: sempre recortados
  const blob = await (await fetch(`__voice/${set}/${id}.wav`)).blob();
  const { result, heard } = await window.DRG_APP.voiceEval(blob, { target: text, trim });
  return { id, text, trim, status: result.status, score: result.score, heard, asr: result.evidence.asr, summary: result.feedback && result.feedback.summary };
}, { set, id, text });

const bench = {};
await check('V01', 'Gravações sem ruído (70): nenhuma transcrição vazia/inconclusiva; falas longas inteiras sem regressão; nenhum corte falso', async () => {
  const rows = [];
  for (const [id, m] of Object.entries(sets[0][1])) rows.push(await evaluate('audio', id, m.text));
  bench.audio = rows;
  const inc = rows.filter((r) => r.status === 'inconclusive'), np = rows.filter((r) => r.status === 'needs_practice'), cut = rows.filter((r) => r.asr.tailCut);
  const longs = rows.filter((r) => !r.trim);
  assert(!inc.length, `inconclusivas: ${inc.map((r) => `${r.id}:${r.heard}`).join(' | ')}`);
  assert(!cut.length, `corte falso: ${cut.map((r) => r.id).join(', ')}`);
  assert(longs.length === 10 && longs.every((r) => r.status === 'passed'), `falas longas: ${JSON.stringify(longs.map((r) => [r.id, r.status, r.score]))}`);
  return { aprovadas: rows.length - np.length, abaixoDoCorte: np.map((r) => `${r.id} “${r.heard}” ${r.score}%`), segundaPassada: rows.filter((r) => r.asr.secondPass !== null).map((r) => r.id) };
});

await check('V02', 'Gravações com ruído de fundo a 20 e 10 dB (32): nenhuma inconclusiva por transcrição vazia; nenhum corte falso', async () => {
  const rows = [];
  for (const [id, m] of Object.entries(sets[1][1])) rows.push(await evaluate('noise', id, m.text));
  bench.noise = rows;
  const inc = rows.filter((r) => r.status === 'inconclusive'), np = rows.filter((r) => r.status === 'needs_practice'), cut = rows.filter((r) => r.asr.tailCut);
  assert(!inc.length, `inconclusivas: ${inc.map((r) => `${r.id}:${r.heard}`).join(' | ')}`);
  assert(!cut.length, `corte falso: ${cut.map((r) => r.id).join(', ')}`);
  return { aprovadas: rows.length - np.length, total: rows.length, abaixoDoCorte: np.map((r) => `${r.id} “${r.heard}” ${r.score}%`) };
});

await check('V03', 'Corte do reconhecedor (áudio real, texto do reconhecedor controlado): segunda passada recupera; sem recuperação e com voz restante → inconclusiva; fala curta de verdade → resultado normal', async () => {
  const r = await page.evaluate(async () => {
    const A = window.DRG_APP;
    const blobOf = async (set, id) => (await fetch(`__voice/${set}/${id}.wav`)).blob();
    const run = async (blob, target, trim, texts) => {
      const calls = [];
      globalThis.__DRG_TEST_ASR = { status: async () => 'installed', transcribe: async (b, o) => { calls.push(!!o.word); const t = texts[calls.length - 1] ?? texts[texts.length - 1]; return { text: t, confidence: 0, engine: 'teste' }; } };
      try { const { result } = await A.voiceEval(blob, { target, trim }); return { status: result.status, score: result.score, calls, asr: result.evidence.asr, summary: result.feedback.summary }; } finally { delete globalThis.__DRG_TEST_ASR; }
    };
    const L04 = "I'm working for a technology company in Manchester.";
    return {
      // 1ª passada parou em “Different.”; a 2ª (sem recorte) ouviu tudo → vale a 2ª: aprovada
      recupera: await run(await blobOf('audio', 'different-teams__slow'), 'different teams', true, ['Different.', 'Different teams.']),
      // fala longa (≈3 s de voz) cortada nas duas passadas em “I'm working for a” → inconclusiva (não reprova)
      cortada: await run(await blobOf('audio', 'l04__mic'), L04, false, ["I'm working for a", "I'm working for a"]),
      // o aluno parou em “this week” (a gravação só tem isso) e o texto pedia mais → resultado normal (não é corte)
      curta: await run(await blobOf('audio', 'this-week__tight'), 'this week is busy', true, ['This week.', 'This week.']),
    };
  });
  assert(r.recupera.status === 'passed' && r.recupera.calls.join() === 'true,false' && r.recupera.asr.secondPass === 'Different teams.', `recupera: ${JSON.stringify(r.recupera)}`);
  assert(r.cortada.status === 'inconclusive' && r.cortada.score === null && r.cortada.asr.tailCut && /não conta como erro/.test(r.cortada.summary), `cortada: ${JSON.stringify(r.cortada)}`);
  assert(r.curta.status === 'needs_practice' && !r.curta.asr.tailCut, `curta: ${JSON.stringify(r.curta)}`);
  return { recupera: `${r.recupera.status} (2ª passada)`, cortada: `${r.cortada.status} (voz ${r.cortada.asr.voicedSec} s)`, curta: `${r.curta.status} ${r.curta.score}% (voz ${r.curta.asr.voicedSec} s)` };
});
await ctx.close();

// V04: interface REAL da fase 1 (botão gravar → MediaRecorder → Moonshine → resultado na tela) com o microfone falso
const ui = async (file, itemId) => {
  const prof = join(OUT, `.profile-${itemId}`); rmSync(prof, { recursive: true, force: true });
  const c = await chromium.launchPersistentContext(prof, { serviceWorkers: 'block', permissions: ['microphone'],
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${join(AUDIO, 'audio', file)}.wav%noloop`] });
  const p = c.pages()[0] || await c.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(BASE); await p.waitForFunction(() => window.DRG_APP && window.DRG_APP.state);
  await p.evaluate(() => window.DRG_APP.asr.local.install());
  await p.evaluate(async (id) => { // 3 audições do item (só libera o botão de gravar)
    const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
    const st = { v: 1, acts: { 'john-p1-e01': { attempts: {}, listens: { [`vocab:${id}`]: 3 }, rounds: [], notes: '', order: {}, startedAt: 1 } }, consent: { online: false, at: null } };
    await new Promise((r) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(st, 'dialogues'); t.oncomplete = r; });
  }, itemId);
  await p.goto(BASE + '#/dphase/john-p1-e01?p=vocab'); await p.reload(); await p.waitForTimeout(800);
  await p.click(`[data-role=item-chips] [data-item="${itemId}"]`);
  await p.click('[data-role=record-item]');
  await p.waitForSelector('[data-role=stop]');
  await p.waitForTimeout(4500);
  await p.click('[data-role=stop]');
  await p.waitForSelector('[data-role=feedback]', { timeout: 120000 });
  const fb = await p.evaluate(() => ({ status: document.querySelector('[data-role=feedback]').dataset.status, heard: (document.querySelector('[data-role=heard]') || {}).textContent || null }));
  await p.screenshot({ path: join(OUT, `V04-${itemId}.png`), fullPage: true });
  await c.close();
  return fb;
};
await check('V04', 'Interface real da fase 1 (microfone falso, Moonshine real): “different teams” e “these days” com pausas entre as palavras — antes vazias/inconclusivas', async () => {
  const a = await ui('different-teams__pauses', 'john-p1-e01-v05');
  const b = await ui('these-days__pauses', 'john-p1-e01-v01');
  assert(a.status === 'passed' && b.status === 'passed', JSON.stringify({ a, b }));
  return { 'different teams': `${a.status} ${a.heard}`, 'these days': `${b.status} ${b.heard}` };
});

record('V05', 'Sem erros de página', !errors.length, errors.slice(0, 5));
server.close();
writeFileSync(join(OUT, 'bench.json'), JSON.stringify(bench, null, 1));
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
