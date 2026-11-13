// Fim de fala automático (recorder.js#endpointer): a captura encerra sozinha depois da fala + silêncio contínuo.
// Uso: node tests/e2e/endpoint.mjs <pasta-do-site> <caminho-base> <pasta-dos-áudios> [pasta-de-evidências]
//   <pasta-dos-áudios>: curta.wav, pausas.wav, hesitacao.wav, pausalonga.wav, silencio.wav + meta.json (voz sintética
//   Kokoro; silêncio inicial 0,6 s e final 5 s). Os áudios não ficam no repositório.
//
// REAL: app construído, microfone falso do Chromium tocando o áudio uma vez, gravação, detecção de fala, Moonshine (para
// conferir que a fala INTEIRA foi gravada) e a tela real da fase 1. SIMULADO: o reconhecimento online (só em E07).
// Tempos medidos do início da gravação até o fim automático; tolerância para o tempo de partida do microfone falso.
// etapa 2 do formato em camadas (john-p1-e01, 2026-11-13): unidade U22 “different teams” (mesmo áudio do antigo item v05); etapa 1 semeada como pré-requisito
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const AUDIO = resolve(process.argv[4] || '');
const OUT = resolve(process.argv[5] || join(ROOT, 'evidence/endpoint'));
const META = JSON.parse(readFileSync(join(AUDIO, 'meta.json'), 'utf8'));
mkdirSync(OUT, { recursive: true });
const PORT = 8831, BASE = `http://localhost:${PORT}${BASE_PATH}`;
const SILENCE = 1.8; // parâmetro inicial (recorder.js ENDPOINT.silenceMs)
const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };
const server = await serve(SITE, PORT);
const errors = [];

const NO_ONLINE = () => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; };
// modo online: o reconhecedor é o dono do microfone (não há gravação junto): fala com parciais em 0,3 s e 0,7 s; o
// resultado final só vem no stop (o fim é decidido pelo app: 1,8 s sem atividade de fala do reconhecimento)
const FAKE_ONLINE = () => {
  window.__srMade = []; window.__gum = 0;
  const md = navigator.mediaDevices; const g = md.getUserMedia.bind(md); md.getUserMedia = (c) => { window.__gum++; return g(c); };
  const res = (t, final) => { const r = [{ transcript: t, confidence: final ? 0.9 : 0 }]; r.isFinal = final; return { resultIndex: 0, results: [r] }; };
  class FakeSR { constructor() { window.__srMade.push(this); } start() { const first = window.__srMade.length === 1; setTimeout(() => { this.onstart && this.onstart(); this.onaudiostart && this.onaudiostart(); }, 20);
      if (first) { setTimeout(() => { this.onspeechstart && this.onspeechstart(); this.onresult && this.onresult(res('different', false)); }, 300); setTimeout(() => this.onresult && this.onresult(res('different teams', false)), 700); } }
    stop() { setTimeout(() => { const r = [{ transcript: 'different teams', confidence: 0.9 }]; r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); this.onend && this.onend(); }, 30); }
    abort() { setTimeout(() => this.onend && this.onend(), 5); } }
  window.webkitSpeechRecognition = FakeSR; delete window.SpeechRecognition;
};

/** Abre um navegador cujo microfone toca `wav` uma vez e prepara a fase 1 (item “different teams”). */
async function open(wav, init = NO_ONLINE, consent = undefined) {
  const prof = join(OUT, `.profile-${wav}`); rmSync(prof, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(prof, { serviceWorkers: 'block', permissions: ['microphone'], viewport: { width: 412, height: 915 },
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${join(AUDIO, wav)}.wav%noloop`] });
  await ctx.addInitScript(init);
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE); await page.waitForFunction(() => window.DRG_APP && window.DRG_APP.state);
  await page.evaluate(async (c) => { const A = window.DRG_APP; A.state.welcomed = true; if (c !== undefined) A.state.settings.onlineSpeech = c; await A.chooseCharacter('lucas'); await A.asr.local.install(); await A.flush(); }, consent);
  await page.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
    const st = { v: 1, acts: { 'john-p1-e01': { attempts: Object.fromEntries(Array.from({ length: 32 }, (_, i) => { const id = 'john-p1-e01-u' + String(i + 1).padStart(2, '0'); return ['seed-' + id, { attemptId: 'seed-' + id, phase: 'u-write', itemId: id, status: 'passed', score: 100, createdAt: 1 }]; })), listens: { 'u-speak:john-p1-e01-u22': 3 }, rounds: [], notes: '', order: {}, startedAt: 1 } }, consent: { online: false, at: null } };
    await new Promise((r) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(st, 'dialogues'); t.oncomplete = r; });
  });
  await page.goto(BASE + '#/dphase/john-p1-e01?p=u-speak'); await page.reload(); await page.waitForSelector('[data-role=item-chips]');
  await page.click('[data-role=item-chips] [data-item="john-p1-e01-u22"]');
  return { ctx, page };
}
const attempts = (page) => page.evaluate(async () => {
  const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
  const st = await new Promise((r) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => r(t.result); });
  return Object.values(((st || {}).acts || {})['john-p1-e01']?.attempts || {}).sort((a, b) => a.createdAt - b.createdAt);
});
/** Grava SEM tocar em Parar; devolve quando a captura encerrou sozinha (s desde o início) e o que foi transcrito. */
async function autoAttempt(page, { manualAt = null } = {}) {
  await page.click('[data-role=record-item]');
  await page.waitForSelector('[data-role=stop]', { timeout: 15000 });
  const t0 = Date.now();
  if (manualAt !== null) { await page.waitForTimeout(manualAt * 1000); await page.click('[data-role=stop]'); }
  await page.waitForFunction(() => !document.querySelector('[data-role=stop]'), null, { timeout: 30000, polling: 50 });
  const stoppedAt = (Date.now() - t0) / 1000;
  await page.waitForSelector('[data-role=feedback]', { timeout: 120000 });
  const list = await attempts(page);
  const last = list[list.length - 1] || {};
  return { stoppedAt: +stoppedAt.toFixed(2), heard: (last.evidence && last.evidence.heard) || null, engine: last.evidence && last.evidence.asr && last.evidence.asr.engine };
}
const has = (t, w) => new RegExp(`\\b${w}`, 'i').test(t || '');

await check('E01', 'Frase curta: a captura encerra sozinha ≈ 1,8 s depois do fim da fala (sem tocar em Parar) e a avaliação aparece', async () => {
  const { ctx, page } = await open('curta');
  const r = await autoAttempt(page); await ctx.close();
  const exp = META.curta.speechEnd + SILENCE;
  assert(r.stoppedAt >= exp - 0.6 && r.stoppedAt <= exp + 1.2 && has(r.heard, 'teams'), `${JSON.stringify(r)} esperado ≈ ${exp.toFixed(2)} s`);
  return { ...r, esperado: `≈ ${exp.toFixed(2)} s` };
});

await check('E02', 'Pausas curtas entre palavras (0,8 s): continua ouvindo; a frase inteira é gravada', async () => {
  const { ctx, page } = await open('pausas');
  const r = await autoAttempt(page); await ctx.close();
  const exp = META.pausas.speechEnd + SILENCE;
  assert(r.stoppedAt >= exp - 0.6 && has(r.heard, 'teams'), `${JSON.stringify(r)} esperado ≈ ${exp.toFixed(2)} s`);
  return { ...r, esperado: `≈ ${exp.toFixed(2)} s` };
});

await check('E03', 'Hesitação (1,2 s de pausa no meio): não é tomada como fim; “teams” também é gravado', async () => {
  const { ctx, page } = await open('hesitacao');
  const r = await autoAttempt(page); await ctx.close();
  assert(r.stoppedAt >= META.hesitacao.speechEnd + SILENCE - 0.6 && has(r.heard, 'teams'), JSON.stringify(r));
  return r;
});

await check('E04', 'Pausa maior que o limite (2,6 s): encerra depois da primeira palavra — comportamento esperado do parâmetro (registrado)', async () => {
  const { ctx, page } = await open('pausalonga');
  const r = await autoAttempt(page); await ctx.close();
  const exp = META.pausalonga.firstEnd + SILENCE;
  assert(r.stoppedAt <= exp + 1.2 && !has(r.heard, 'teams'), JSON.stringify(r));
  return { ...r, esperado: `≈ ${exp.toFixed(2)} s` };
});

await check('E05', 'Sem fala nenhuma: NÃO encerra por silêncio; só no limite de segurança (fase 1: 8 s)', async () => {
  const { ctx, page } = await open('silencio');
  const r = await autoAttempt(page); await ctx.close();
  assert(r.stoppedAt >= 7.5, JSON.stringify(r));
  return r;
});

await check('E06', 'Parar manual continua valendo (no meio da fala)', async () => {
  const { ctx, page } = await open('curta');
  const r = await autoAttempt(page, { manualAt: 1.0 }); await ctx.close();
  assert(r.stoppedAt <= 1.8, JSON.stringify(r));
  return r;
});

await check('E07', 'Modo online (o reconhecedor é o dono do microfone, sem gravação junto): fim automático 1,8 s depois da última fala reconhecida; o resultado final chega antes da avaliação', async () => {
  const { ctx, page } = await open('curta', FAKE_ONLINE, true);
  const r = await autoAttempt(page);
  const log = await page.evaluate(() => window.DRG_APP.speech.logReport());
  const gum = await page.evaluate(() => window.__gum);
  await ctx.close();
  const exp = 0.7 + SILENCE; // última atividade de fala do reconhecimento (parcial em 0,7 s) + silêncio
  assert(r.engine === 'online' && r.heard === 'different teams' && gum === 0, JSON.stringify({ ...r, gum }));
  assert(r.stoppedAt >= exp - 0.4 && r.stoppedAt <= exp + 1.2 && /speechstart@\d+ms → .*fim de fala \(silêncio 1\.8 s\)@\d+ms → .*result\(final\)/.test(log), `${JSON.stringify(r)} ${log.split('\n').slice(-1)[0].slice(0, 300)}`);
  return { ...r, esperado: `≈ ${exp.toFixed(2)} s`, getUserMedia: gum };
});

await check('E08', 'Cancelar (sair da tela durante a gravação): nada é avaliado nem salvo', async () => {
  const { ctx, page } = await open('curta');
  const n0 = (await attempts(page)).length;
  await page.click('[data-role=record-item]'); await page.waitForSelector('[data-role=stop]');
  await page.waitForTimeout(500);
  await page.evaluate(() => { location.hash = '#/dialogues'; });
  await page.waitForTimeout(5000);
  const n1 = (await attempts(page)).length;
  await ctx.close();
  assert(n1 === n0, `tentativas ${n0} → ${n1}`);
  return 'nenhuma tentativa criada';
});

record('E09', 'Sem erros de página', !errors.length, errors.slice(0, 5));
server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
