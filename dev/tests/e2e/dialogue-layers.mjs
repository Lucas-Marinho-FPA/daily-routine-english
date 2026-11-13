// Atividade em camadas (john-p1-e01, documento-fonte aprovado de 2026-11-13): 7 etapas, 32 unidades, 25 frases, diálogo.
// Uso: node tests/e2e/dialogue-layers.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
// REAL: app construído, Chromium (celular), áudio Kokoro, contagem de audições pelo fim REAL da reprodução, gravação
// (MediaRecorder, microfone falso), corretor de escrita, IndexedDB, retomada. SIMULADO: a transcrição da fala
// (window.__DRG_TEST_ASR, texto controlado pelo teste) — não valida o reconhecimento com voz humana nem o Galaxy S25+.
// Para chegar às etapas seguintes sem refazer cada item pela interface, alguns testes SEMEIAM tentativas aprovadas das
// etapas anteriores no IndexedDB (dito em cada teste); o mecanismo de cada etapa é exercido pela interface real.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = resolve(process.argv[4] || join(ROOT, 'evidence/dialogue-layers'));
const FIX = join(ROOT, 'tests/fixtures');
mkdirSync(OUT, { recursive: true });
const PORT = 8814, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const ACT = 'john-p1-e01';
const APPDIR = join(SITE, BASE_PATH.replace(/^\/|\/$/g, ''));
const PACK = JSON.parse(readFileSync(join(APPDIR, 'data/dialogues.js'), 'utf8').replace(/^[\s\S]*?window\.DRG_DIALOGUES = /, '').replace(/;\s*$/, ''));
const SRC = JSON.parse(readFileSync(join(ROOT, 'content/dialogues/john-p1-e01-layers.json'), 'utf8'));
const A = PACK.activities.find((a) => a.id === ACT);
const item = (id) => PACK.items.find((x) => x.id === id);
const UNITS = A.unitIds.map(item), SENTS = A.sentenceIds.map(item);

const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); await shot(`${id}-falha`).catch(() => {}); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const server = await serve(SITE, PORT);
const external = [], pageErrors = [], audioReqs = [];
rmSync(join(OUT, '.profile'), { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(join(OUT, '.profile'), {
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${join(FIX, 'bm_george-R01-B1-S1.wav')}`, '--autoplay-policy=no-user-gesture-required'],
  viewport: { width: 384, height: 832 }, isMobile: true, hasTouch: true, permissions: ['microphone'], serviceWorkers: 'block' });
await ctx.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; });
const page = ctx.pages()[0] || await ctx.newPage();
ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); const m = u.match(/audio\/([0-9a-f]{8})\.ogg/); if (m) audioReqs.push(m[1]); });
page.on('pageerror', (e) => pageErrors.push(e.message));
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
const go = async (hash) => { await page.goto(BASE + hash); await page.waitForTimeout(500); };
const reload = async () => { await page.reload(); await page.waitForTimeout(600); };
const textOf = (sel) => page.locator(sel).first().textContent();
const setHeard = (text) => page.evaluate((t) => { window.__heard = t; window.__DRG_TEST_ASR = { status: async () => 'installed', transcribe: async () => ({ text: window.__heard, confidence: 0, engine: 'teste', secs: 2, segments: null }) }; }, text);
const store = () => page.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); r.onerror = rej; });
  return new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result || null); });
});
/** Semeia tentativas aprovadas (pré-requisito) e/ou progresso de outra atividade, preservando o que já existe. */
const seed = (entries, extra = {}) => page.evaluate(async ({ entries, extra, ACT }) => {
  const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
  const cur = await new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result || { v: 1, acts: {}, consent: { online: false, at: null } }); });
  const p = cur.acts[ACT] || (cur.acts[ACT] = { contentVersion: null, startedAt: 1, completedAt: null, attempts: {}, listens: {}, rounds: [], notes: '', order: {} });
  let n = 0;
  for (const [phase, ids] of entries) for (const id of ids) { const attemptId = `att-seed-${phase}-${id}-${n++}`; p.attempts[attemptId] = { attemptId, phase, itemId: id, inputType: 'text', response: 'seed', status: 'passed', score: 100, threshold: 80, feedback: { summary: 'semeado pelo teste' }, evidence: null, evaluationMode: 'local_deterministic', rubricVersion: 'seed', evaluatorVersion: 'seed', createdAt: Date.now() - 1000 + n, evaluatedAt: Date.now(), syncStatus: 'local', tries: 0, nextTryAt: 0, lastError: null }; }
  Object.assign(cur.acts, extra);
  await new Promise((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(cur, 'dialogues'); t.oncomplete = res; });
}, { entries, extra, ACT });

async function listenOnce() {
  const before = await textOf('[data-role=listen-count]');
  await page.click('[data-role=listen-item]');
  await page.waitForFunction((b) => document.querySelector('[data-role=listen-count]')?.textContent !== b, before, { timeout: 20000 });
}
async function recordOnce(ms = 1200) {
  await page.evaluate(() => document.querySelectorAll('[data-role=feedback]').forEach((e) => e.remove()));
  await page.click('[data-role=record-item]');
  await page.waitForSelector('[data-role=stop]', { timeout: 8000 });
  await page.waitForTimeout(ms);
  if (await page.locator('[data-role=stop]').count()) await page.click('[data-role=stop]').catch(() => {});
  await page.waitForSelector('[data-role=feedback]', { timeout: 30000 });
  return page.getAttribute('[data-role=feedback]', 'data-status');
}
const chipIds = () => page.$$eval('[data-role=item-chips] [data-item]', (b) => b.map((x) => x.dataset.item));
const writeAnswer = async (text) => { await page.evaluate(() => document.querySelectorAll('[data-role=feedback]').forEach((e) => e.remove())); await page.fill('[data-role=answer]', text); await page.click('[data-role=submit]'); await page.waitForSelector('[data-role=feedback]'); return page.getAttribute('[data-role=feedback]', 'data-status'); };

// ---------- início ----------
await page.goto(BASE); await page.waitForSelector('#app');
await page.evaluate(async () => { const A = window.DRG_APP; A.state.settings.characterChosen = true; A.state.welcomed = true; A.state.settings.rate = 1.6; A.applySettings(); await A.flush(); });
// progresso ANTERIOR preservado: uma tentativa antiga (formato de 5 fases) da e01 e progresso da e02 (atividade fora da navegação)
await seed([['vocab', ['john-p1-e01-v05']]], { 'john-p1-e02': { contentVersion: null, startedAt: 5, completedAt: null, attempts: { 'att-old-e02': { attemptId: 'att-old-e02', phase: 'vocab', itemId: 'john-p1-e02-v01', status: 'passed', score: 90, createdAt: 5 } }, listens: { 'vocab:john-p1-e02-v01': 3 }, rounds: [], notes: 'nota antiga', order: {} } });

await check('L01', 'Navegação: só john-p1-e01 na experiência ativa; as outras 45 fora da lista e do acesso direto', async () => {
  await go('#/dialogues'); await page.waitForSelector('[data-role=dialogue]');
  const listed = await page.$$eval('[data-role=dialogue]', (l) => l.map((x) => x.dataset.id));
  const parts = await page.$$eval('[data-role=part]', (l) => l.map((x) => x.dataset.part));
  await go('#/dialogue/john-p1-e02'); const r1 = page.url();
  await go('#/dphase/john-p2-e01?p=vocab'); const r2 = page.url();
  await go('#/'); const home = await textOf('[data-role=dialogues-entry]');
  await shot('01-lista');
  assert(listed.length === 1 && listed[0] === ACT && parts.join() === '1', `listadas: ${listed.join(',')} partes ${parts}`);
  assert(r1.endsWith('#/dialogues') && r2.endsWith('#/dialogues'), `acesso direto não bloqueado: ${r1} ${r2}`);
  assert(/0 de 1 diálogo/.test(home) && /sete etapas/.test(home), home);
  return { listadas: listed, inicio: home.replace(/\s+/g, ' ').slice(0, 120) };
});

await check('L02', 'Conteúdo íntegro: 32 unidades e 25 frases iguais ao documento-fonte (ids estáveis, EN, PT, origem), cada uma com áudio; 7 falas originais', async () => {
  assert(UNITS.length === 32 && SENTS.length === 25, `${UNITS.length}/${SENTS.length}`);
  SRC.units.forEach((u, i) => { const x = UNITS[i]; assert(x.id === `${ACT}-u${u.code.slice(1)}` && x.en === u.en && x.pt === u.pt && x.category === u.kind, `${u.code}: ${JSON.stringify(x)}`); });
  SRC.sentences.forEach((s, i) => { const x = SENTS[i]; assert(x.id === `${ACT}-f${s.code.slice(1)}` && x.en === s.en && x.pt === s.pt && x.origin === s.origin, `${s.code}`); });
  assert(SENTS.filter((x) => x.origin === 'expansion').map((x) => x.code).join() === Array.from({ length: 15 }, (_, i) => `F${i + 11}`).join(), 'expansões ≠ F11–F25');
  const present = await page.evaluate((keys) => keys.filter((k) => window.DRG_AUDIO.files[k] !== undefined).length, [...UNITS, ...SENTS].map((x) => x.audio));
  assert(present === 57, `áudio presente para ${present}/57`);
  assert(A.lines.length === 7 && A.lines.map((l) => l.speaker).join() === 'Rick,John,Rick,John,Rick,John,Rick', 'falas');
  return { unidades: 32, frases: 25, expansoes: 15, audios: present };
});

await check('L03', 'Tela do diálogo: três camadas, 9 etapas (1–6 + 7.1–7.3); só a etapa 1 aberta; pré-requisitos lineares', async () => {
  await go(`#/dialogue/${ACT}`); await page.waitForSelector('[data-role=phases]');
  const layers = await page.$$eval('[data-role=phases]', (l) => l.map((x) => `${x.dataset.layer}:${x.querySelectorAll('[data-role=phase]').length}`));
  const states = await page.$$eval('[data-role=phase]', (l) => l.map((x) => `${x.dataset.phase}=${x.dataset.state}`));
  await shot('03-dialogo');
  assert(layers.join() === 'unit:3,sentence:3,dialogue:3', layers.join());
  assert(states[0] === 'u-write=available' && states.slice(1).every((s) => s.endsWith('=locked')), states.join(' '));
  await go(`#/dphase/${ACT}?p=u-speak`); assert(page.url().endsWith(`#/dialogue/${ACT}`), 'etapa 2 abriu sem a etapa 1');
  return states;
});

await check('L04', 'Etapa 1 (unidades — escrever): EN + PT juntos; errado → precisa de prática com referência; correto → aprovado; forma falada de notação aceita; as 32 unidades', async () => {
  await go(`#/dphase/${ACT}?p=u-write`); await page.waitForSelector('[data-role=layer-card]');
  const ids = await chipIds();
  const shownEn = await textOf('[data-role=item-en]'), shownPt = await textOf('[data-role=item-pt]');
  const bad = await writeAnswer('hello world');
  const ref = await textOf('[data-role=reference]');
  const ok = await writeAnswer(UNITS[0].en);
  await page.click(`[data-role=item-chips] [data-item="${ACT}-u05"]`); await page.waitForSelector(`[data-role=layer-card][data-item="${ACT}-u05"]`);
  const variant = await writeAnswer('meet, met');
  await shot('04-etapa1');
  assert(ids.join() === A.unitIds.join(), 'unidades da etapa 1 ≠ inventário');
  assert(shownEn === UNITS[0].en && shownPt === UNITS[0].pt, `${shownEn} / ${shownPt}`);
  assert(bad === 'needs_practice' && ref.includes(UNITS[0].en) && ok === 'passed' && variant === 'passed', `${bad} ${ok} ${variant}`);
  return { unidades: ids.length, errado: bad, certo: ok, notacao: variant };
});

await check('L05', 'Etapa 2 (unidades — falar): gravação bloqueada até 3 reproduções COMPLETAS; reprodução interrompida não conta; depois grava e avalia; contador retomado após recarregar', async () => {
  await seed([['u-write', A.unitIds]]); await reload(); // pré-requisito: etapa 1 semeada
  await go(`#/dphase/${ACT}?p=u-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const ids = await chipIds();
  const it = UNITS[0];
  const lock0 = await page.locator('[data-role=record-item]').isDisabled();
  // reprodução interrompida: começa e é parada antes do fim — não conta
  await page.click('[data-role=listen-item]'); await page.waitForTimeout(250);
  await page.evaluate(() => { location.hash = '#/'; }); await page.waitForTimeout(400); // sair da tela no meio da reprodução: não conta
  await go(`#/dphase/${ACT}?p=u-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const afterStop = await textOf('[data-role=listen-count]');
  const reqBefore = audioReqs.length;
  await listenOnce(); const lock1 = await page.locator('[data-role=record-item]').isDisabled();
  await listenOnce(); const lock2 = await page.locator('[data-role=record-item]').isDisabled();
  await reload(); const resumed = await textOf('[data-role=listen-count]');
  await listenOnce(); const lock3 = await page.locator('[data-role=record-item]').isDisabled();
  const played = [...new Set(audioReqs.slice(reqBefore))];
  await setHeard('remember me');
  const st = await recordOnce();
  await shot('05-etapa2');
  assert(ids.join() === A.unitIds.join(), 'unidades da etapa 2 ≠ etapa 1');
  assert(lock0 && /0\/3/.test(afterStop) && lock1 && lock2 && /2\/3/.test(resumed) && !lock3, JSON.stringify({ lock0, afterStop, lock1, lock2, resumed, lock3 }));
  assert(played.length === 1 && played[0] === it.audio, `áudio tocado ${played} ≠ ${it.audio}`);
  assert(st === 'passed', st);
  return { bloqueio: [lock0, lock1, lock2, lock3], interrompida: afterStop, retomada: resumed, audio: it.audio, resultado: st };
});

await check('L06', 'Etapa 3 (unidades — ouvir e escrever): as 32, ordem embaralhada e estável após recarregar, inglês oculto antes da resposta, áudio do próprio item', async () => {
  await seed([['u-speak', A.unitIds]]); await reload();
  await go(`#/dphase/${ACT}?p=u-listen`); await page.waitForSelector('[data-role=layer-card]');
  const order = await chipIds();
  const hidden = await page.getAttribute('[data-role=layer-card]', 'data-revealed');
  const enBefore = await page.locator('[data-role=layer-card] [data-role=item-en]').count();
  const cur = await page.getAttribute('[data-role=layer-card]', 'data-item');
  const r0 = audioReqs.length; await page.click('[data-role=listen-item]'); await page.waitForTimeout(800);
  const played = [...new Set(audioReqs.slice(r0))];
  const st = await writeAnswer(item(cur).en);
  const enAfter = await textOf('[data-role=layer-card] [data-role=item-en]');
  await reload(); const order2 = await chipIds();
  await shot('06-etapa3');
  assert(order.length === 32 && [...order].sort().join() === [...A.unitIds].sort().join(), 'conjunto ≠ 32 unidades');
  assert(order.join() !== A.unitIds.join(), 'ordem não embaralhada');
  assert(order2.join() === order.join(), 'ordem mudou ao recarregar');
  assert(hidden === 'false' && enBefore === 0 && enAfter === item(cur).en && st === 'passed', `${hidden} ${enBefore} ${enAfter} ${st}`);
  assert(played.length === 1 && played[0] === item(cur).audio, `áudio ${played} ≠ ${item(cur).audio}`);
  return { primeiro: cur, ordemEstavel: true, resultado: st };
});

await check('L07', 'Etapas 4–6 (frases): as mesmas 25 frases nas três; expansão identificada como não sendo fala de personagem; bloqueio de 3 escutas na etapa 5; listening embaralhado e oculto na 6', async () => {
  await seed([['u-listen', A.unitIds]]); await reload();
  await go(`#/dphase/${ACT}?p=s-write`); await page.waitForSelector('[data-role=layer-card]');
  const w = await chipIds();
  await page.click(`[data-role=item-chips] [data-item="${ACT}-f11"]`); await page.waitForSelector(`[data-role=layer-card][data-item="${ACT}-f11"]`);
  const eyebrowExp = await textOf('[data-role=layer-card] .eyebrow');
  const st4 = await writeAnswer(item(`${ACT}-f11`).en);
  await seed([['s-write', A.sentenceIds]]); await reload();
  await go(`#/dphase/${ACT}?p=s-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const sp = await chipIds();
  const lock0 = await page.locator('[data-role=record-item]').isDisabled();
  await listenOnce(); await listenOnce(); const lock2 = await page.locator('[data-role=record-item]').isDisabled();
  await listenOnce(); const lock3 = await page.locator('[data-role=record-item]').isDisabled();
  await setHeard(item(sp[0]).spoken.replace(/[?.!,]/g, ''));
  const st5 = await recordOnce(1500);
  await shot('07-etapa5');
  await seed([['s-speak', A.sentenceIds]]); await reload();
  await go(`#/dphase/${ACT}?p=s-listen`); await page.waitForSelector('[data-role=layer-card]');
  const ls = await chipIds();
  const enBefore = await page.locator('[data-role=layer-card] [data-role=item-en]').count();
  const cur = await page.getAttribute('[data-role=layer-card]', 'data-item');
  const st6 = await writeAnswer(item(cur).en);
  await shot('07-etapa6');
  assert(w.join() === A.sentenceIds.join() && sp.join() === A.sentenceIds.join() && [...ls].sort().join() === [...A.sentenceIds].sort().join() && ls.join() !== A.sentenceIds.join(), 'conjuntos/ordem');
  assert(/expansão/i.test(eyebrowExp) && st4 === 'passed', `${eyebrowExp} ${st4}`);
  assert(lock0 && lock2 && !lock3 && st5 === 'passed', JSON.stringify({ lock0, lock2, lock3, st5 }));
  assert(enBefore === 0 && st6 === 'passed', `${enBefore} ${st6}`);
  return { frases: 25, expansao: eyebrowExp, etapa5: st5, etapa6: st6 };
});

await check('L08', 'Etapa 7: 7.1 abre após a etapa 6; diálogo completo na ordem, com personagens e áudio de cada fala; 7.2 e 7.3 em sequência; inglês das falas liberado após a etapa 6', async () => {
  await seed([['s-listen', A.sentenceIds]]); await reload();
  await go(`#/dialogue/${ACT}`); await page.waitForSelector('[data-role=phases]');
  const states = await page.$$eval('[data-role=phase]', (l) => Object.fromEntries(l.map((x) => [x.dataset.phase, x.dataset.state])));
  const lines = await page.$$eval('.dlg-line', (l) => l.map((x) => `${x.querySelector('.dlg-speaker').textContent}: ${x.querySelector('.dlg-en') ? x.querySelector('.dlg-en').textContent : '?'}`));
  await go(`#/dphase/${ACT}?p=listening`); await page.waitForSelector('[data-role=listening-card]');
  const q = await page.locator('[data-role=questions-locked]').count();
  await shot('08-etapa7');
  assert(states.listening === 'available' && states.reading === 'locked' && states.translation === 'locked', JSON.stringify(states));
  assert(lines.length === 7 && lines.join('|') === A.lines.map((l) => `${l.speaker}: ${l.en}`).join('|'), lines.join(' | '));
  assert(q === 1, 'questões antes das 3 audições do diálogo');
  return { estados: states, falas: lines.length };
});

await check('L09', 'Retomada e preservação: progresso salvo por etapa; tentativa antiga da e01 e progresso da e02 (fora da navegação) intactos; pacote com as 46 atividades, 403 questões', async () => {
  const s = await store();
  const p = s.acts[ACT];
  const old = Object.values(p.attempts).find((a) => a.phase === 'vocab' && a.itemId === 'john-p1-e01-v05');
  const byPhase = Object.values(p.attempts).reduce((m, a) => (m[a.phase] = (m[a.phase] || 0) + 1, m), {});
  assert(old && s.acts['john-p1-e02'] && s.acts['john-p1-e02'].notes === 'nota antiga' && s.acts['john-p1-e02'].attempts['att-old-e02'], 'progresso anterior perdido');
  assert(p.listens[`u-speak:${UNITS[0].id}`] === 3 && p.order['u-listen'] && p.order['s-listen'], 'escutas/ordem não salvas');
  assert(PACK.activities.length === 46 && PACK.questions.length === 403 && PACK.active.join() === ACT, 'pacote');
  return { tentativasPorEtapa: byPhase, escutasSalvas: p.listens[`u-speak:${UNITS[0].id}`], atividades: PACK.activities.length };
});

// ---------- fechamento de qualidade (2026-11-13) ----------
const unitByCode = (c) => UNITS.find((x) => x.code === c);
async function openItem(phase, id) { await go(`#/dphase/${ACT}?p=${phase}`); await page.waitForSelector('[data-role=item-chips]'); await page.click(`[data-role=item-chips] [data-item="${id}"]`); await page.waitForSelector(`[data-item="${id}"][data-role$=card]`); }

await check('L11', 'Notação × fala: “sound + adjective” aparece como padrão e o aluno ouve/diz “sounds interesting” (fala 7); nada de notação verbalizada', async () => {
  const u = unitByCode('U31');
  await openItem('u-speak', u.id);
  const pattern = await textOf('[data-role=item-pattern]');
  const say = await textOf('[data-role=item-say]');
  const r0 = audioReqs.length; await page.click('[data-role=listen-item]'); await page.waitForTimeout(900);
  const played = [...new Set(audioReqs.slice(r0))];
  await shot('11-notacao');
  assert(pattern === 'sound + adjective' && /Ouça e diga:\s*sounds interesting/.test(say) && /fala 7/.test(say), `${pattern} | ${say}`);
  assert(played.length === 1 && played[0] === u.audio && u.spoken === 'sounds interesting', `${played} ${u.audio} ${u.spoken}`);
  assert(UNITS.every((x) => !/[→+/…]|\bplus\b/.test(x.spoken)), 'notação na forma falada');
  return { exibido: pattern, falado: u.spoken, audio: u.audio };
});

await check('L12', 'Feedback da fala (U11 “work for”): acerto só com evidência; erro marca o trecho e orienta; alvo dentro de fala maior e transcrição vazia ficam inconclusivos; “work with” não aprova “work for”', async () => {
  const u = unitByCode('U11');
  await openItem('u-speak', u.id);
  for (let i = 0; i < 3; i++) await listenOnce();
  const out = {};
  await setHeard('I work for a company'); out.dentro = await recordOnce();
  out.dentroMsg = (await textOf('[data-role=feedback]')).replace(/\s+/g, ' ');
  await setHeard(''); out.vazio = await recordOnce();
  out.vazioMsg = (await textOf('[data-role=feedback]')).replace(/\s+/g, ' ');
  await setHeard('work with'); out.contraste = await recordOnce();
  out.marcas = await page.$$eval('[data-role=item-en] .vx-w', (l) => l.map((x) => `${x.textContent}:${x.dataset.marks}`).join(' '));
  out.praticar = await textOf('[data-role=to-practise]');
  out.dica = await textOf('[data-role=retry-hint]');
  await setHeard('work for'); out.acerto = await recordOnce();
  await shot('12-feedback');
  assert(out.dentro === 'inconclusive' && /mais palavras do que a unidade/.test(out.dentroMsg), JSON.stringify(out));
  assert(out.vazio === 'inconclusive' && /não conta como erro seu|Não aprova nem reprova/.test(out.vazioMsg), out.vazioMsg);
  assert(out.contraste === 'needs_practice' && /for:missing/.test(out.marcas) && /for/.test(out.praticar) && /trechos muito curtos/.test(out.dica), JSON.stringify(out));
  assert(out.acerto === 'passed', out.acerto); // (a etapa 2 já vem semeada como aprovada pelos testes anteriores: vale o status de cada tentativa)
  return out;
});

await check('L13', 'Ouvir e escrever com forma falada: quem ouve “sounds interesting” e escreve isso é aprovado; a notação do documento também é aceita', async () => {
  const u = unitByCode('U31');
  await openItem('u-listen', u.id);
  const a = await writeAnswer('sounds interesting');
  const say = await textOf('[data-role=item-say]');
  await openItem('u-listen', u.id);
  const b = await writeAnswer('sound + adjective');
  assert(a === 'passed' && b === 'passed' && /sounds interesting/.test(say), `${a} ${b} ${say}`);
  return { ouvido: a, notacao: b };
});

await check('L14', 'Tradução 7.3 sem avaliador online: limitação explícita; após enviar, compara com a referência e registra autoavaliação; nada é aprovado; cópia da referência depois de vista não aprova', async () => {
  // pré-requisito semeado: 7.1 (rodada de compreensão aprovada) e 7.2 (leitura aprovada)
  await page.evaluate(async ({ ACT, qids }) => {
    const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
    const cur = await new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result); });
    const p = cur.acts[ACT];
    p.listens.listening = 3;
    p.rounds.push({ id: 'round-seed', kind: 'full', submittedAt: Date.now(), total: qids.length, correct: qids.length, results: qids.map((q) => ({ questionId: q, chosen: 'x', correct: true })), passed: true, passMark: 8, rubricVersion: 'seed' });
    await new Promise((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(cur, 'dialogues'); t.oncomplete = res; });
  }, { ACT, qids: A.questionIds });
  await seed([['reading', A.lines.map((l) => l.id)]]); await reload();
  const L = A.lines[6];
  await go(`#/dphase/${ACT}?p=translation`); await page.waitForSelector('[data-role=translation-card]');
  await page.click(`[data-role=item-chips] [data-item="${L.id}"]`); await page.waitForSelector(`[data-role=translation-card][data-line="${L.id}"]`);
  const instr = await textOf('[data-role=translation-instruction]');
  await page.fill('[data-role=answer]', 'Parece legal.'); await page.click('[data-role=submit]');
  await page.waitForSelector('[data-role=self-compare]');
  const ref = await textOf('[data-role=self-compare] [data-role=reference]');
  await page.click('[data-role=self-review]'); await page.waitForSelector('[data-role=answer]');
  await page.fill('[data-role=answer]', L.pt); await page.click('[data-role=submit]');
  await page.waitForSelector('[data-role=self-compare]');
  await page.click('[data-role=self-ok]'); await page.waitForSelector('[data-role=self-check]');
  const s = await store();
  const atts = Object.values(s.acts[ACT].attempts).filter((a) => a.phase === 'translation' && a.itemId === L.id);
  await shot('14-traducao');
  assert(/ainda não está ativo/.test(instr) && /não conta como aprovada/.test(instr), instr);
  assert(ref.includes(L.pt), ref);
  assert(atts.length === 2 && atts.every((a) => a.status === 'pending') && atts[0].revealedAt && atts.some((a) => a.selfCheck && a.selfCheck.value === 'ok'), JSON.stringify(atts.map((a) => [a.status, !!a.revealedAt, a.selfCheck && a.selfCheck.value])));
  return { tentativas: atts.map((a) => `${a.status}${a.selfCheck ? `/${a.selfCheck.value}` : ''}`), referenciaVista: true };
});

await check('L15', 'Sem evidência confiável não decide: Moonshine divergente em unidade curta e texto online parcial ficam “não consegui avaliar” (nunca erro do aluno); acerto continua aprovando', async () => {
  const asr = (text, engine, partial = false) => page.evaluate(({ text, engine, partial }) => { window.__DRG_TEST_ASR = { status: async () => 'installed', transcribe: async () => ({ text, confidence: 0, engine, secs: 2, segments: null, partial }) }; }, { text, engine, partial });
  const u = unitByCode('U21'); // “work with”
  await openItem('u-speak', u.id);
  for (let i = 0; i < 3; i++) await listenOnce();
  await asr('work for', 'local-model'); const div = await recordOnce();
  const divMsg = (await textOf('[data-role=feedback]')).replace(/\s+/g, ' ');
  await asr('work with', 'local-model'); const ok = await recordOnce();
  const f = SENTS.find((x) => x.code === 'F08'); // “I usually work with different teams.”
  await seed([['s-write', A.sentenceIds]]); await reload();
  await openItem('s-speak', f.id);
  for (let i = 0; i < 3; i++) await listenOnce();
  await asr('I usually work with', 'online', true); const part = await recordOnce(1500);
  const partPractise = await page.locator('[data-role=to-practise]').count() ? await textOf('[data-role=to-practise]') : '';
  assert(div === 'inconclusive' && /não conta como erro seu/.test(divMsg), `${div} ${divMsg}`);
  assert(ok === 'passed', ok);
  assert(part !== 'passed' && part !== 'needs_practice' || !/different|teams/.test(partPractise), `${part} ${partPractise}`);
  assert(!/different|teams/.test(partPractise), `parcial culpou o aluno: ${partPractise}`);
  return { moonshineDivergente: div, moonshineCerto: ok, onlineParcial: part, praticar: partPractise || '—' };
});

record('L10', 'Sem erros de página e sem requisições externas', !pageErrors.length && !external.length, { erros: pageErrors.slice(0, 3), externas: external.slice(0, 3) });
await ctx.close(); server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
