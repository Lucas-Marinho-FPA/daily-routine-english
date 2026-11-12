// Seletor de reconhecimento em Ajustes → Áudio (settings.onlineSpeech): modo “Online” OU modo “Moonshine”, sem troca
// automática entre eles. Uso: node tests/e2e/speech-mode.mjs <pasta-do-site> <caminho-base> <wav-do-microfone> [evidências]
// REAL: app construído, gravação (microfone falso), Moonshine, telas, IndexedDB. SIMULADO: o reconhecimento online
// (webkitSpeechRecognition falso) e a falta de internet (navigator.onLine). Não comprova o serviço real do Android.
// “Inicializado” = instâncias de SpeechRecognition criadas e workers do Moonshine (asr/worker.js) criados na tentativa.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const MIC = resolve(process.argv[4] || '');
const OUT = resolve(process.argv[5] || join(ROOT, 'evidence/speech-mode'));
if (!process.argv[4] || !existsSync(MIC)) { console.error('wav do microfone ausente'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const PORT = 8832, BASE = `http://localhost:${PORT}${BASE_PATH}`;
const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const INIT = () => {
  window.__srMade = 0; window.__asrWorkers = 0;
  const W = window.Worker;
  window.Worker = class extends W { constructor(url, o) { if (String(url).includes('asr/')) window.__asrWorkers++; super(url, o); } };
  class FakeSR { constructor() { window.__srMade++; } start() { const m = (window.__sr || {}).mode || 'ok'; setTimeout(() => { this.onstart && this.onstart(); this.onaudiostart && this.onaudiostart(); }, 20);
      if (m === 'network') setTimeout(() => { this.onerror && this.onerror({ error: 'network' }); this.onend && this.onend(); }, 60); }
    stop() { if (((window.__sr || {}).mode || 'ok') !== 'ok') return; setTimeout(() => { const r = [{ transcript: 'different teams', confidence: 0.9 }]; r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); this.onend && this.onend(); }, 30); }
    abort() { setTimeout(() => this.onend && this.onend(), 5); } }
  window.webkitSpeechRecognition = FakeSR; delete window.SpeechRecognition;
};
const server = await serve(SITE, PORT);
const PROFILE = join(OUT, '.profile'); rmSync(PROFILE, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(PROFILE, { serviceWorkers: 'block', permissions: ['microphone', 'clipboard-read', 'clipboard-write'], viewport: { width: 412, height: 915 },
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${MIC}`] });
await ctx.addInitScript(INIT);
const page = ctx.pages()[0] || await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE); await page.waitForFunction(() => window.DRG_APP && window.DRG_APP.state);
await page.evaluate(async () => { const A = window.DRG_APP; A.state.welcomed = true; await A.chooseCharacter('lucas'); await A.asr.local.install(); await A.flush(); });

const lastAttempt = () => page.evaluate(async () => {
  const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
  const st = await new Promise((r) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => r(t.result); });
  const all = Object.values(((st || {}).acts || {})['john-p1-e01']?.attempts || {}).sort((a, b) => a.createdAt - b.createdAt);
  const a = all[all.length - 1]; return a ? { status: a.status, engine: a.evidence && a.evidence.asr ? a.evidence.asr.engine : null, heard: a.evidence ? a.evidence.heard : null, why: a.feedback && a.feedback.summary } : null;
});
/** Uma tentativa na fase 1 (tela real); devolve o resultado e o que foi inicializado nesta página. */
async function attempt({ sr = { mode: 'ok' }, offline = false } = {}) {
  await page.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
    const st = { v: 1, acts: { 'john-p1-e01': { attempts: {}, listens: { 'vocab:john-p1-e01-v05': 3 }, rounds: [], notes: '', order: {}, startedAt: 1 } }, consent: { online: false, at: null } };
    await new Promise((r) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(st, 'dialogues'); t.oncomplete = r; });
  });
  await page.goto(BASE + '#/dphase/john-p1-e01?p=vocab'); await page.reload(); await page.waitForSelector('[data-role=item-chips]');
  await page.evaluate(({ sr, offline }) => { window.__sr = sr; if (offline) Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false }); }, { sr, offline });
  await page.click('[data-role=item-chips] [data-item="john-p1-e01-v05"]');
  await page.click('[data-role=record-item]');
  await page.waitForSelector('[data-role=stop]', { timeout: 10000 }); await page.waitForTimeout(3500);
  if (await page.locator('[data-role=stop]').count()) await page.click('[data-role=stop]').catch(() => {});
  await page.waitForSelector('[data-role=feedback]', { timeout: 120000 }); await page.waitForTimeout(300);
  return { ...(await lastAttempt()), sr: await page.evaluate(() => window.__srMade), moonshine: await page.evaluate(() => window.__asrWorkers), consentAsked: await page.locator('[data-role=speech-consent]').count() };
}
const pick = async (label) => {
  await page.goto(BASE + '#/settings'); await page.reload(); await page.waitForSelector('.seg[aria-label="Reconhecimento de voz"]');
  await page.locator('.seg[aria-label="Reconhecimento de voz"] button', { hasText: label }).click();
  await page.evaluate(() => window.DRG_APP.flush());
};
const pressed = () => page.$$eval('.seg[aria-label="Reconhecimento de voz"] button', (bs) => bs.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.textContent));

await check('M01', 'Ajustes → Áudio: seletor com os dois modos; a escolha persiste ao fechar e reabrir o app', async () => {
  await pick('Moonshine (aparelho)');
  await page.goto(BASE + '#/settings'); await page.reload(); await page.waitForSelector('.seg[aria-label="Reconhecimento de voz"]');
  const a = await pressed(); const va = await page.evaluate(() => window.DRG_APP.state.settings.onlineSpeech);
  await pick('Online (navegador)');
  await page.goto(BASE + '#/settings'); await page.reload(); await page.waitForSelector('.seg[aria-label="Reconhecimento de voz"]');
  const b = await pressed(); const vb = await page.evaluate(() => window.DRG_APP.state.settings.onlineSpeech);
  const diag = await page.textContent('[data-role=speech-mode-diag]').catch(() => '');
  assert(JSON.stringify(a) === '["Moonshine (aparelho)"]' && va === false && JSON.stringify(b) === '["Online (navegador)"]' && vb === true, JSON.stringify({ a, va, b, vb }));
  return { depoisDeReabrir: [a[0], b[0]], diagnóstico: diag };
});

await check('M02', 'Modo Online: só o online é inicializado e usado (nenhum worker do Moonshine)', async () => {
  const r = await attempt();
  assert(r.engine === 'online' && r.status === 'passed' && r.sr === 1 && r.moonshine === 0 && !r.consentAsked, JSON.stringify(r));
  return r;
});

await check('M03', 'Modo Online com falha de rede: SEM troca para o Moonshine — inconclusiva, não reprova; Moonshine não carregado', async () => {
  const r = await attempt({ sr: { mode: 'network' } });
  assert(r.status === 'inconclusive' && !r.engine && r.moonshine === 0 && /online indisponível/.test(r.why), JSON.stringify(r));
  return r;
});

await check('M04', 'Modo Online sem internet: nenhuma escuta online e nenhum Moonshine — inconclusiva com o motivo', async () => {
  const r = await attempt({ offline: true });
  assert(r.status === 'inconclusive' && r.sr === 0 && r.moonshine === 0 && /sem internet/.test(r.why), JSON.stringify(r));
  return r;
});

await check('M05', 'Alternância para Moonshine (pelo seletor): só o Moonshine é inicializado; nenhuma escuta online, nenhum pedido de consentimento', async () => {
  await pick('Moonshine (aparelho)');
  const r = await attempt();
  assert(r.engine === 'local-model' && r.sr === 0 && r.moonshine >= 1 && !r.consentAsked && /teams/i.test(r.heard || ''), JSON.stringify(r));
  return r;
});

await check('M06', 'Alternância de volta para Online (pelo seletor): volta a usar só o online', async () => {
  await pick('Online (navegador)');
  const r = await attempt();
  assert(r.engine === 'online' && r.sr === 1 && r.moonshine === 0, JSON.stringify(r));
  return r;
});

await check('M07', 'Registro identifica o modo e o mecanismo de cada tentativa (e a ausência de troca)', async () => {
  await page.goto(BASE + '#/settings'); await page.reload(); await page.waitForSelector('[data-role=speech-log-copy]');
  await page.click('[data-role=speech-log-copy]');
  const rep = await page.evaluate(() => navigator.clipboard.readText());
  assert(/modo: online \| captura: faixa do gravador[^\n]*motor: online/.test(rep) && /modo: local[^\n]*motor: local-model/.test(rep) && /motor: nenhum[^\n]*sem troca \(modo online\)/.test(rep), rep.slice(0, 600));
  return rep.split('\n').filter((l) => l.startsWith('#')).slice(0, 5).map((l) => l.replace(/^#\d+ \S+ \| /, '').slice(0, 110));
});

await check('M09', 'Modo Moonshine sem o modelo instalado: pede a instalação; não usa o modo local do Chrome (processLocally) nem nenhum outro mecanismo', async () => {
  await pick('Moonshine (aparelho)');
  await page.evaluate(async () => { await window.DRG_APP.asr.local.remove(); window.DRG_APP.state.settings.asrKnown = 'available'; delete window.DRG_APP.state.settings.asrPrompt; await window.DRG_APP.flush(); });
  // navegador que OFERECE o modo local do Chrome: ele não pode ser consultado nem usado no modo Moonshine
  await page.evaluate(() => { const F = window.webkitSpeechRecognition; F.prototype.processLocally = false; window.__plQueries = 0; F.available = async () => { window.__plQueries++; return 'available'; }; });
  await page.goto(BASE + '#/lab?sentence=R01-B1-S1'); await page.reload();
  await page.evaluate(() => { const F = window.webkitSpeechRecognition; F.prototype.processLocally = false; window.__plQueries = 0; F.available = async () => { window.__plQueries++; return 'available'; }; });
  await page.waitForSelector('.rec-btn'); await page.waitForTimeout(800);
  await page.locator('.rec-btn').click(); await page.waitForTimeout(3500); if (await page.locator('.rec-btn.on').count()) await page.locator('.rec-btn').click();
  await page.waitForSelector('.fb[data-state="setup"], .fb[data-state="unavailable"]', { timeout: 15000 });
  const fb = await page.textContent('.fb');
  const r = await page.evaluate(() => ({ sr: window.__srMade, pl: window.__plQueries, moonshine: window.__asrWorkers }));
  const chromeLink = await page.locator('text=reconhecimento do Chrome').count();
  assert(/Baixar reconhecimento|instal/i.test(fb) && r.sr === 0 && r.pl === 0 && chromeLink === 0, JSON.stringify({ fb: fb.slice(0, 160), ...r, chromeLink }));
  return { tela: fb.replace(/\s+/g, ' ').slice(0, 90), escutasOnline: r.sr, consultasProcessLocally: r.pl, linkChrome: chromeLink };
});

record('M08', 'Sem erros de página', !errors.length, errors.slice(0, 5));
await ctx.close(); server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
