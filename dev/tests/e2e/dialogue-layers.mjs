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

/** Uma reprodução completa do modelo (o botão volta a ficar ativo quando a reprodução termina e a tela é redesenhada). */
async function listenOnce() {
  await page.evaluate(() => { const b = document.querySelector('[data-role=listen-item]'); b.dataset.waiting = '1'; });
  await page.click('[data-role=listen-item]');
  await page.waitForFunction(() => { const b = document.querySelector('[data-role=listen-item]'); return b && !b.dataset.waiting && !b.disabled; }, null, { timeout: 20000 });
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
const chipIds = async () => { // ordem completa da etapa atual (o slider mostra só 5 números): a sorteada e salva, ou a do conteúdo
  const phase = new URL(page.url()).hash.match(/p=([\w-]+)/)[1];
  const st = await store(); const o = st && st.acts[ACT] && (st.acts[ACT].order || {})[phase];
  return o || (phase[0] === 'u' ? A.unitIds : phase[0] === 's' ? A.sentenceIds : A.lines.map((l) => l.id));
};
const writeAnswer = async (text) => { // ajuste 01: com áudio-modelo, ouvir até o fim antes de enviar
  if ((await page.getAttribute('[data-role=submit]', 'data-locked')) === 'true') await listenOnce();
  await page.evaluate(() => document.querySelectorAll('[data-role=feedback]').forEach((e) => e.remove())); await page.fill('[data-role=answer]', text); await page.click('[data-role=submit]'); await page.waitForSelector('[data-role=feedback]'); return page.getAttribute('[data-role=feedback]', 'data-status'); };

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
  const ref = await page.locator('[data-role=feedback] [data-role=reference]').count(); // ajuste 06: sem a resposta-modelo
  const ok = await writeAnswer(UNITS[0].en);
  await openItem('u-write', `${ACT}-u26`);
  const variant = await writeAnswer('help someone, help a team'); // forma falada da notação “/” aceita
  await shot('04-etapa1');
  assert(ids.join() === A.unitIds.join(), 'unidades da etapa 1 ≠ inventário');
  assert(shownEn === UNITS[0].en && shownPt === UNITS[0].pt, `${shownEn} / ${shownPt}`);
  assert(bad === 'needs_practice' && ref === 0 && ok === 'passed' && variant === 'passed', `${bad} ${ref} ${ok} ${variant}`);
  return { unidades: ids.length, errado: bad, certo: ok, notacao: variant };
});

await check('L05', 'Etapa 2 (ajustes 03/04): gravar só depois de UMA reprodução completa (interrompida não conta); depois, ouvir e gravar livremente; destaque alterna Ouvir → Gravar → Ouvir; escuta salva após recarregar', async () => {
  await seed([['u-write', A.unitIds]]); await reload(); // pré-requisito: etapa 1 semeada
  await go(`#/dphase/${ACT}?p=u-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const it = UNITS[0];
  const emph = async () => ({ ouvir: await page.getAttribute('[data-role=listen-item]', 'data-emph'), gravar: await page.getAttribute('[data-role=record-item]', 'data-emph') });
  const e0 = await emph(); const lock0 = await page.locator('[data-role=record-item]').isDisabled();
  const counter = await page.locator('[data-role=listen-count]').count(); // sem contador de 3 audições
  await page.click('[data-role=listen-item]'); await page.waitForTimeout(250);
  await page.evaluate(() => { location.hash = '#/'; }); await page.waitForTimeout(400); // sair no meio da reprodução: não conta
  await go(`#/dphase/${ACT}?p=u-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const lockStop = await page.locator('[data-role=record-item]').isDisabled();
  const reqBefore = audioReqs.length;
  await listenOnce(); const lock1 = await page.locator('[data-role=record-item]').isDisabled(); const e1 = await emph();
  await reload(); const lockReload = await page.locator('[data-role=record-item]').isDisabled();
  const played = [...new Set(audioReqs.slice(reqBefore))];
  await setHeard('remember me');
  const st = await recordOnce(); const e2 = await emph(); const lockAfter = await page.locator('[data-role=record-item]').isDisabled();
  await listenOnce(); const e3 = await emph();
  for (let i = 0; i < 4; i++) await listenOnce(); // ouvir quantas vezes quiser
  const st2 = await recordOnce();
  await shot('05-etapa2');
  assert(lock0 && e0.ouvir === 'true' && e0.gravar === 'false' && counter === 0, JSON.stringify({ lock0, e0, counter }));
  assert(lockStop && !lock1 && !lockReload && e1.gravar === 'true' && e1.ouvir === 'false', JSON.stringify({ lockStop, lock1, lockReload, e1 }));
  assert(st === 'passed' && e2.ouvir === 'true' && e2.gravar === 'false' && !lockAfter && e3.gravar === 'true' && st2 === 'passed', JSON.stringify({ st, e2, lockAfter, e3, st2 }));
  assert(played.length === 1 && played[0] === it.audio, `áudio tocado ${played} ≠ ${it.audio}`);
  return { antes: e0, depoisDeOuvir: e1, depoisDeGravar: e2, ouviuDeNovo: e3, interrompidaLibera: !lockStop, resultado: [st, st2] };
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
  await openItem('s-write', `${ACT}-f11`);
  const eyebrowExp = await page.locator('[data-role=layer-card] .eyebrow').count(); // ajuste 02: sem classificação interna
  const st4 = await writeAnswer(item(`${ACT}-f11`).en);
  await seed([['s-write', A.sentenceIds]]); await reload();
  await go(`#/dphase/${ACT}?p=s-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const sp = await chipIds();
  const lock0 = await page.locator('[data-role=record-item]').isDisabled();
  const lock2 = lock0;
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
  assert(eyebrowExp === 0 && st4 === 'passed', `${eyebrowExp} ${st4}`);
  assert(lock0 && lock2 && !lock3 && st5 === 'passed', JSON.stringify({ lock0, lock2, lock3, st5 }));
  assert(enBefore === 0 && st6 === 'passed', `${enBefore} ${st6}`);
  return { frases: 25, rotuloInterno: eyebrowExp, etapa5: st5, etapa6: st6 };
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
  assert(p.listens[`u-speak:${UNITS[0].id}`] >= 1 && p.order['u-listen'] && p.order['s-listen'], 'escutas/ordem não salvas');
  assert(PACK.activities.length === 46 && PACK.questions.length === 403 && PACK.active.join() === ACT, 'pacote');
  return { tentativasPorEtapa: byPhase, escutasSalvas: p.listens[`u-speak:${UNITS[0].id}`], atividades: PACK.activities.length };
});

// ---------- fechamento de qualidade (2026-11-13) ----------
const unitByCode = (c) => UNITS.find((x) => x.code === c);
async function openItem(phase, id) {
  // slider de 5 números com bloqueio por item (ajuste 09): para abrir um item adiante, os anteriores da etapa precisam estar
  // resolvidos — o teste os semeia como aprovados e depois coloca o item no centro pelo próprio slider
  await go(`#/dphase/${ACT}?p=${phase}`); await page.waitForSelector('[data-role=item-chips]');
  const order = await page.evaluate(({ ACT, phase }) => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const t = r.result.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(((t.result.acts[ACT] || {}).order || {})[phase] || null); }; }), { ACT, phase });
  const ids = order || (phase[0] === 'u' ? A.unitIds : phase[0] === 's' ? A.sentenceIds : A.lines.map((l) => l.id));
  const before = ids.slice(0, ids.indexOf(id));
  const st = await store(); const p = st.acts[ACT];
  const done = (x) => Object.values(p.attempts).some((a) => a.phase === phase && a.itemId === x && a.status === 'passed') || ((p.skipped || {})[phase] || {})[x];
  const missing = before.filter((x) => !done(x));
  if (missing.length) { await seed([[phase, missing]]); await reload(); await go(`#/dphase/${ACT}?p=${phase}`); await page.waitForSelector('[data-role=item-chips]'); }
  for (let k = 0; k < 40 && (await page.getAttribute('[data-role=item-chips] [aria-current=true]', 'data-item')) !== id; k++) {
    const cur = await page.getAttribute('[data-role=item-chips] [aria-current=true]', 'data-item');
    const dir = ids.indexOf(id) > ids.indexOf(cur) ? 1 : -1;
    const sel = await page.$$eval('[data-role=item-chips] [data-item]', (b, d) => { const xs = b.map((x) => x.dataset.item); const c = b.findIndex((x) => x.getAttribute('aria-current') === 'true'); return xs[c + d] || null; }, dir);
    await page.click(`[data-role=item-chips] [data-item="${sel}"]`); await page.waitForTimeout(80);
  }
  await page.waitForSelector(`[data-role$=card][data-item="${id}"], [data-role$=card][data-line="${id}"]`);
}

await check('L11', 'U31: a expressão real “sounds interesting” em primeiro plano, tradução natural, “sound + adjective” só como complemento; o aluno ouve exatamente isso; nada de notação verbalizada', async () => {
  const u = unitByCode('U31');
  await openItem('u-speak', u.id);
  const main = await textOf('[data-role=vocab-card] [data-role=item-en]');
  const pt = await textOf('[data-role=vocab-card] [data-role=item-pt]');
  const note = await textOf('[data-role=vocab-card] [data-role=item-note]');
  const r0 = audioReqs.length; await page.click('[data-role=listen-item]'); await page.waitForTimeout(900);
  const played = [...new Set(audioReqs.slice(r0))];
  await shot('11-notacao');
  assert(main === 'sounds interesting' && pt === 'Parece interessante.' && /sound \+ adjective/.test(note), `${main} | ${pt} | ${note}`);
  assert(played.length === 1 && played[0] === u.audio && u.spoken === 'sounds interesting', `${played} ${u.audio} ${u.spoken}`);
  assert(UNITS.every((x) => !/[→+/…]|\bplus\b/.test(x.spoken)), 'notação na forma falada');
  return { exibido: main, traducao: pt, complemento: note, falado: u.spoken, audio: u.audio };
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

await check('L13', 'Ouvir e escrever: quem ouve “sounds interesting” e escreve isso é aprovado; depois do envio aparece a expressão (e o padrão como complemento)', async () => {
  const u = unitByCode('U31');
  await openItem('u-listen', u.id);
  const a = await writeAnswer('sounds interesting');
  const shown = await textOf('[data-role=layer-card] [data-role=item-en]');
  const note = await textOf('[data-role=layer-card] [data-role=item-note]');
  assert(a === 'passed' && shown === 'sounds interesting' && /sound \+ adjective/.test(note), `${a} ${shown} ${note}`);
  return { ouvido: a, exibido: shown, complemento: note };
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
  await openItem('translation', L.id);
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


// ---------- correções da validação real no Galaxy S25+ (2026-11-13) ----------
/** Zera o progresso da e01 (mantém as outras atividades) e semeia etapas aprovadas + tentativas sem sucesso/pendentes. */
const resetE01 = (passedEntries = [], failing = [], skipped = []) => page.evaluate(async ({ ACT, passedEntries, failing, skipped }) => {
  const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
  const cur = await new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result); });
  const p = cur.acts[ACT] = { contentVersion: null, startedAt: 1, completedAt: null, attempts: {}, listens: {}, rounds: [], notes: '', order: {}, skipped: {} };
  let n = 0; const now = Date.now() - 100000;
  const att = (phase, id, status) => { const attemptId = `att-seed-${n++}`; p.attempts[attemptId] = { attemptId, phase, itemId: id, inputType: 'text', response: 'seed', status, score: status === 'passed' ? 100 : status === 'needs_practice' ? 40 : null, threshold: 80, feedback: { summary: 'semeado pelo teste' }, evidence: null, evaluationMode: 'local_deterministic', rubricVersion: 'seed', evaluatorVersion: 'seed', createdAt: now + n, evaluatedAt: now + n, syncStatus: 'local', tries: 0, nextTryAt: 0, lastError: null }; };
  for (const [phase, ids] of passedEntries) for (const id of ids) att(phase, id, 'passed');
  for (const [phase, id, status, k] of failing) for (let i = 0; i < k; i++) att(phase, id, status);
  for (const [phase, id] of skipped) (p.skipped[phase] || (p.skipped[phase] = {}))[id] = now;
  await new Promise((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(cur, 'dialogues'); t.oncomplete = res; });
}, { ACT, passedEntries, failing, skipped });
const phaseStates = async () => { await go(`#/dialogue/${ACT}`); await page.waitForSelector('[data-role=phase]'); return Object.fromEntries(await page.$$eval('[data-role=phase]', (l) => l.map((x) => [x.dataset.phase, x.dataset.state]))); };

await check('L16', 'Bloqueio do aparelho reproduzido e corrigido (etapa 2): 31/32 aprovados e U05 sem reconhecimento; “Tentativa n de 3”; “Continuar sem concluir” só após a 3ª; item fica pendente; etapa aprovada (31/32 = 96%) e etapa 3 liberada', async () => {
  const stuck = `${ACT}-u05`;
  await resetE01([['u-write', A.unitIds], ['u-speak', A.unitIds.filter((x) => x !== stuck)]]); await reload();
  await openItem('u-speak', stuck);
  for (let i = 0; i < 3; i++) await listenOnce();
  const out = { tentativas: [] };
  await setHeard('meet Matt');
  for (let i = 0; i < 3; i++) {
    out.tentativas.push(await recordOnce());
    out.tentativas.push((await textOf('[data-role=tries]')).trim());
    if (i < 2) assert(!(await page.locator('[data-role=skip-item]').count()), `“continuar” antes da 3ª tentativa (${i + 1})`);
  }
  out.antes = (await phaseStates())['u-speak'];
  await openItem('u-speak', stuck);
  await shot('16a-tres-tentativas');
  assert(await page.locator('[data-role=skip-item]').count() === 1, 'sem “Continuar sem concluir” depois de 3 tentativas');
  await page.click('[data-role=skip-item]'); await page.waitForTimeout(400);
  out.pendente = (await textOf('[data-role=item-skipped]')).trim();
  out.chip = await page.getAttribute(`[data-role=item-chips] [data-item="${stuck}"]`, 'data-skipped');
  out.rodape = (await textOf('[data-role=phase-score]')).replace(/\s+/g, ' ');
  await shot('16b-pendente');
  const st = await phaseStates(); out.depois = st['u-speak']; out.etapa3 = st['u-listen'];
  const s = await store(); const m = Object.values(s.acts[ACT].attempts).filter((a) => a.phase === 'u-speak' && a.itemId === stuck);
  assert(out.antes === 'needs_retry' && out.depois === 'completed' && out.etapa3 === 'available', JSON.stringify(out));
  assert(out.chip === 'true' && /pendente/i.test(out.pendente) && /31 de 31|96%|31 de 32/.test(out.rodape) && !m.some((a) => a.status === 'passed'), JSON.stringify(out));
  assert(s.acts[ACT].skipped['u-speak'][stuck] > 0, 'pendente não registrado');
  return out;
});

await check('L17', 'Não volta sozinho ao pendente: com 2 itens restantes, pular o 1º leva ao 2º; “Próximo item” nunca devolve o pendente; ao final, a etapa fecha com o aproveitamento', async () => {
  const [a, b] = [`${ACT}-u07`, `${ACT}-u11`];
  await resetE01([['u-write', A.unitIds], ['u-speak', A.unitIds.filter((x) => x !== a && x !== b)]], [['u-speak', a, 'inconclusive', 3]]); await reload();
  await openItem('u-speak', a);
  await page.click('[data-role=skip-item]'); await page.waitForTimeout(400);
  const now1 = await page.getAttribute('[data-role=vocab-card]', 'data-item');
  for (let i = 0; i < 3; i++) await listenOnce();
  await setHeard('work for'); const ok = await recordOnce();
  const nextBtn = await page.locator('[data-role=next-item]').count();
  const st = await phaseStates();
  await go(`#/dphase/${ACT}?p=u-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const rodape = (await textOf('[data-role=phase-score]')).replace(/\s+/g, ' ');
  assert(now1 === b, `depois de pular ${a} foi para ${now1}`);
  assert(ok === 'passed' && nextBtn === 0, `aprovado=${ok}, próximo=${nextBtn} (não pode voltar ao pendente)`);
  assert(st['u-speak'] === 'completed' && /falha do reconhecimento/.test(rodape), `${st['u-speak']} | ${rodape}`);
  return { depoisDePular: now1, segundo: ok, botaoProximo: nextBtn, etapa: st['u-speak'], rodape };
});

await check('L18', 'Aproveitamento por etapa (frases, 25 itens): 23/25 = 92% aprova; 20/25 = 80% aprova; 19/25 = 76% não aprova e mantém a etapa seguinte bloqueada', async () => {
  const S = A.sentenceIds; const prev = [['u-write', A.unitIds], ['u-speak', A.unitIds], ['u-listen', A.unitIds]];
  const scen = async (n) => {
    const rest = S.slice(n);
    await resetE01([...prev, ['s-write', S.slice(0, n)]], rest.map((id) => ['s-write', id, 'needs_practice', 3]), rest.map((id) => ['s-write', id])); await reload();
    const st = await phaseStates();
    await go(`#/dphase/${ACT}?p=s-write`); await page.waitForSelector('[data-role=layer-card]');
    const ratio = await page.getAttribute('[data-role=phase-score]', 'data-ratio');
    return { etapa4: st['s-write'], etapa5: st['s-speak'], ratio };
  };
  const r = { acima: await scen(23), exato: await scen(20) };
  r.abaixo = await scen(19); await shot('18-abaixo-de-80');
  assert(r.acima.etapa4 === 'completed' && r.acima.ratio === '92' && r.acima.etapa5 === 'available', JSON.stringify(r.acima));
  assert(r.exato.etapa4 === 'completed' && r.exato.ratio === '80', JSON.stringify(r.exato));
  assert(r.abaixo.etapa4 === 'needs_retry' && r.abaixo.ratio === '76' && r.abaixo.etapa5 === 'locked', JSON.stringify(r.abaixo));
  return r;
});

await check('L19', 'Escrita (ajustes 01/05/06/07): no Listening, tradução visível e inglês oculto; enviar sem ouvir até o fim mostra a orientação; erro marcado sem revelar a resposta (X por letra que falta, letra a mais em vermelho); frase completa só no acerto integral', async () => {
  await resetE01(['u-write', 'u-speak', 'u-listen', 's-write', 's-speak'].map((ph) => [ph, ph[0] === 'u' ? A.unitIds : A.sentenceIds])); await reload();
  const F14 = `${ACT}-f14`; // “This week I'm working with a different team.”
  await openItem('s-listen', F14);
  const ptBefore = await textOf('[data-role=layer-card] [data-role=item-pt]');
  const enBefore = await page.locator('[data-role=layer-card] [data-role=item-en]').count();
  await page.fill('[data-role=answer]', 'This week I\'m working different teams'); await page.click('[data-role=submit]'); await page.waitForTimeout(300);
  const msg = (await textOf('[data-role=listen-first]')).trim(); const noFb = await page.locator('[data-role=feedback]').count();
  const typed = await page.inputValue('[data-role=answer]');
  await listenOnce();
  const kept = await page.inputValue('[data-role=answer]');
  await page.click('[data-role=submit]'); await page.waitForSelector('[data-role=feedback]');
  const st = await page.getAttribute('[data-role=feedback]', 'data-status');
  const echo = await textOf('[data-role=answer-echo]');
  const marks = await page.$$eval('[data-role=answer-echo] [data-mark]', (l) => l.map((x) => `${x.dataset.mark}:${x.textContent}`));
  const fbText = (await textOf('[data-role=feedback]')).replace(/\s+/g, ' ');
  const enAfterErr = await page.locator('[data-role=layer-card] [data-role=item-en]').count();
  const color = await page.evaluate(() => [getComputedStyle(document.querySelector('[data-mark=missing]')).color, getComputedStyle(document.querySelector('[data-mark=extra]')).color]);
  await shot('19-escrita-mascara');
  const ok = await writeAnswer("This week I'm working with a different team.");
  const enAfterOk = await textOf('[data-role=layer-card] [data-role=item-en]');
  assert(/Esta semana/.test(ptBefore) && enBefore === 0, `antes: ${ptBefore} / ${enBefore}`);
  assert(msg === 'Escute a frase com atenção antes de enviar. Ela será trabalhada novamente na próxima etapa de Listening.' && noFb === 0 && kept === typed, `${msg} ${noFb} ${kept}`);
  assert(echo === "This week I'm working XXXX X different teams" && marks.join() === 'missing:XXXX,missing:X,extra:s', `${echo} | ${marks}`);
  assert(!/with a different team/.test(fbText) && enAfterErr === 0 && color[0] === color[1], `revelou: ${fbText} / ${enAfterErr} / ${color}`);
  assert(ok === 'passed' && enAfterOk === "This week I'm working with a different team.", `${ok} ${enAfterOk}`);
  return { orientacao: msg, escreveu: echo, marcas: marks, status: st, depoisDoAcerto: enAfterOk };
});

await check('L20', 'Leitura 7.2 (fala): mesma regra — 3 tentativas, continuar, segue para a próxima fala; U05 “I met someone.” e U04 “meet someone” em exercícios separados; U26 toca o próprio áudio (reticências entre as partes, sem silêncio fixo)', async () => {
  const qids = A.questionIds;
  await resetE01(['u-write', 'u-speak', 'u-listen'].map((ph) => [ph, A.unitIds]).concat(['s-write', 's-speak', 's-listen'].map((ph) => [ph, A.sentenceIds])), [['reading', A.lines[0].id, 'needs_practice', 3]]);
  await page.evaluate(async ({ ACT, qids }) => {
    const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
    const cur = await new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result); });
    const p = cur.acts[ACT]; p.listens.listening = 3;
    p.rounds.push({ id: 'round-seed', kind: 'full', submittedAt: Date.now(), total: qids.length, correct: qids.length, results: qids.map((q) => ({ questionId: q, chosen: 'x', correct: true })), passed: true, passMark: 8, rubricVersion: 'seed' });
    await new Promise((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(cur, 'dialogues'); t.oncomplete = res; });
  }, { ACT, qids }); await reload();
  await go(`#/dphase/${ACT}?p=reading`); await page.waitForSelector('[data-role=reading-card]');
  const first = await page.getAttribute('[data-role=reading-card]', 'data-line');
  await openItem('reading', A.lines[0].id); await page.waitForTimeout(300);
  const canSkip = await page.locator('[data-role=skip-item]').count();
  await page.click('[data-role=skip-item]'); await page.waitForTimeout(400);
  const after = await page.getAttribute('[data-role=reading-card]', 'data-line');
  await shot('20-leitura-pendente');
  const u04 = unitByCode('U04'), u05 = unitByCode('U05'), u26 = unitByCode('U26');
  await openItem('u-speak', u26.id);
  const r0 = audioReqs.length; await page.click('[data-role=listen-item]'); await page.waitForTimeout(900);
  const played = [...new Set(audioReqs.slice(r0))];
  const dur = await page.evaluate((k) => window.DRG_AUDIO.files[k], u26.audio);
  assert(canSkip === 1 && after === A.lines[1].id, `continuar=${canSkip}, depois=${after}`);
  assert(first === A.lines[1].id || first === A.lines[0].id, first);
  assert(u04.en === 'meet someone' && u05.en === 'I met someone.' && u05.spoken === 'I met someone.', `${u04.en} | ${u05.en}`);
  const man = JSON.parse(readFileSync(join(ROOT, 'content/build/dialogues-audio-manifest.json'), 'utf8'));
  assert(played[0] === u26.audio && dur > 1 && (man.find((m) => m.key === u26.audio) || {}).text === 'help someone... help a team', `${played} ${dur}`);
  return { leituraDepoisDeContinuar: after, U04: u04.en, U05: `${u05.en} — ${u05.pt}`, U26audio: `${u26.audio} (${dur}s)` };
});


await check('L21', 'Slider de 5 números (ajuste 09, viewport Android): ativo no centro e laranja (48 px), 2 anteriores verdes menores, 2 seguintes bloqueados com cadeado centrado; arrastar troca o ativo (até o último liberado) e reorganiza; bloqueado não abre; extensão total visível; sem troca de tela', async () => {
  await resetE01([['u-write', A.unitIds], ['u-speak', A.unitIds.slice(0, 5)]]); await reload();
  await go(`#/dphase/${ACT}?p=u-speak`); await page.waitForSelector('[data-role=vocab-card]');
  const url0 = page.url();
  const geo = () => page.evaluate(() => {
    const bs = [...document.querySelectorAll('[data-role=item-chips] .ns-b')];
    const vis = bs.filter((b) => !b.classList.contains('ns-empty'));
    const sz = (b) => Math.round(b.getBoundingClientRect().width);
    const cur = document.querySelector('[data-role=item-chips] [aria-current=true]'); const r = cur.getBoundingClientRect();
    const locks = vis.filter((b) => b.dataset.locked === 'true').map((b) => { const c = b.getBoundingClientRect(), l = b.querySelector('.ns-lock svg').getBoundingClientRect(); return Math.round(Math.abs((l.left + l.width / 2) - (c.left + c.width / 2)) + Math.abs((l.top + l.height / 2) - (c.top + c.height / 2))); });
    return { n: vis.length, nums: vis.map((b) => b.textContent.trim()), sizes: bs.map(sz), cls: vis.map((b) => b.className.match(/ns-(current|passed|locked|open|retry|skipped)/)[1]),
      centre: Math.round((r.left + r.width / 2) - innerWidth / 2), bg: getComputedStyle(cur).backgroundColor, locks, total: document.querySelector('[data-role=item-total]').textContent,
      item: document.querySelector('[data-role=vocab-card]').dataset.item, pageW: document.documentElement.scrollWidth };
  });
  const g0 = await geo(); // ativo = 6 (5 aprovados): 4, 5 verdes · 6 · 7, 8 bloqueados
  // toque num bloqueado: não abre
  const tapAt = async (sel) => { const bb = await page.locator(sel).first().boundingBox(); await page.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(400); };
  await tapAt('[data-role=item-chips] [data-locked=true]');
  const gLocked = await geo();
  // arraste real para a direita (volta 2 itens)
  const box = await page.locator('[data-role=item-chips]').boundingBox();
  const cdp = await ctx.newCDPSession(page);
  const drag = async (dx) => { const pt = { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + 24) }; await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [pt] });
    for (let i = 1; i <= 10; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: pt.x + (dx * i) / 10, y: pt.y }] }); await page.waitForTimeout(16); }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await page.waitForTimeout(500); };
  await drag(115); const g1 = await geo();
  await drag(-240); const g2 = await geo(); // para a esquerda: avança, mas só até o último liberado (6)
  await tapAt('[data-role=item-chips] .ns-passed'); const g3 = await geo();
  await shot('21-slider');
  assert(g0.n === 5 && g0.nums.join() === '4,5,6,7,8' && g0.cls.join() === 'passed,passed,current,locked,locked' && g0.item === `${ACT}-u06`, JSON.stringify(g0));
  assert(g0.sizes[2] === 48 && g0.sizes[1] === 40 && g0.sizes[3] === 40 && g0.sizes[0] === 32 && g0.sizes[4] === 32 && Math.abs(g0.centre) <= 1, `tamanhos/centro ${JSON.stringify(g0)}`);
  assert(/rgb\(255, 176, 97\)|rgb\(176, 77, 5\)/.test(g0.bg) && g0.locks.every((d) => d <= 2) && g0.total === '6 de 32' && g0.pageW <= 384, `cor/cadeado/total ${JSON.stringify(g0)}`);
  assert(gLocked.item === g0.item, 'bloqueado abriu');
  assert(g1.item === `${ACT}-u04` && g1.nums.join() === '2,3,4,5,6' && Math.abs(g1.centre) <= 1, `arraste p/ direita ${JSON.stringify(g1)}`);
  assert(g2.item === `${ACT}-u06` && g2.cls[2] === 'current' && g2.cls[3] === 'locked', `arraste p/ esquerda ${JSON.stringify(g2)}`);
  assert(g3.item === `${ACT}-u04` && page.url() === url0, `toque/tela ${JSON.stringify(g3)} ${page.url()}`);
  return { inicio: `${g0.nums.join(' ')} (${g0.cls.join(',')})`, tamanhos: g0.sizes, total: g0.total, arrasteDireita: g1.item, arrasteEsquerda: g2.item, cadeadoCentrado: g0.locks };
});

record('L10', 'Sem erros de página e sem requisições externas', !pageErrors.length && !external.length, { erros: pageErrors.slice(0, 3), externas: external.slice(0, 3) });
await ctx.close(); server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
