// Testes de ponta a ponta da prática ISOLADA de palavras no Speaking Lab (reconhecimento local REAL).
// Uso: node tests/e2e/wordpractice.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
//
// REAL: modelo Moonshine no Chromium, gravação (MediaRecorder), transcrição, IndexedDB, cache offline.
// SIMULADO: a “voz” vem de arquivos WAV sintéticos (tests/fixtures) como microfone falso; W12 simula microfone
// bloqueado e falha do reconhecimento; W05/W07/W13 partem de um resultado salvo editado para ter 2 palavras na lista.
// Nada disto valida o reconhecimento no Galaxy S25+ nem com voz humana.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/wordpractice');
const FIX = join(ROOT, 'tests/fixtures');
mkdirSync(OUT, { recursive: true });
const PORT = 8796, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const results = [];
const record = (id, name, status, evidence) => { results.push({ id, name, status, evidence }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } if (process.env.WP_DEBUG && page) console.log('   dec', JSON.stringify(await page.evaluate(() => window.__dec.splice(0)).catch(() => null))); };
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

let server = await serve(SITE, PORT);
const external = [], pageErrors = [];
let ctx, page;
async function launch(micFile) {
  if (ctx) await ctx.close();
  ctx = await chromium.launchPersistentContext(PROFILE, {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${join(FIX, micFile)}%noloop`, '--autoplay-policy=no-user-gesture-required'],
    viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true, permissions: ['microphone'],
  });
  // sonda: quantas vezes o microfone foi aberto (nenhuma gravação pode começar sozinha)
  await ctx.addInitScript(`window.__mic = 0; const __gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); navigator.mediaDevices.getUserMedia = (c) => { window.__mic++; return __gum(c); };`);
  if (process.env.WP_DEBUG) await ctx.addInitScript(`window.__dec = []; const __d = BaseAudioContext.prototype.decodeAudioData; BaseAudioContext.prototype.decodeAudioData = async function (b) { const n = b.byteLength; const r = await __d.call(this, b); const d = r.getChannelData(0); let m = 0; for (const v of d) m = Math.max(m, Math.abs(v)); window.__dec.push({ bytes: n, secs: +r.duration.toFixed(2), peak: +m.toFixed(2) }); return r; };`);
  page = ctx.pages()[0] || await ctx.newPage();
  ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
  page.on('pageerror', (e) => pageErrors.push(e.message));
}
const go = async (hash) => { await page.goto(BASE + hash); await page.reload(); await page.waitForTimeout(800); };
const S1 = '#/lab?sentence=R01-B1-S1', KEY = 'sent:R01-B1-S1';
const S2 = '#/lab?sentence=R07-B2-S2', KEY2 = 'sent:R07-B2-S2'; // “After we tidy up the kitchen, I focus on preparing for my English class.”
const fbState = () => page.evaluate(() => (document.querySelector('.fb') || {}).dataset?.state || null);
const waitFinal = () => page.waitForFunction(() => ['result', 'inconclusive', 'error'].includes((document.querySelector('.fb') || {}).dataset?.state), null, { timeout: 90000 });
const chips = () => page.evaluate(() => [...document.querySelectorAll('.pchip')].map((b) => `${b.textContent.trim()}:${b.dataset.status}`));
const panelStatus = () => page.getAttribute('[data-role=word-practice]', 'data-status');
const result = () => page.evaluate(() => { const r = document.querySelector('[data-role=wp-result]'); return r ? { result: r.dataset.result, heard: r.querySelector('[data-role=wp-heard]').textContent, text: r.textContent } : null; });
/** Toca em “Praticar esta palavra/Tentar novamente”, fala por `ms` (arquivo do microfone falso) e para. */
async function practiseWord(ms = 2600) {
  await page.locator('[data-role=wp-record]').click();
  await page.waitForSelector('[data-role=word-practice][data-status=recording] [data-role=wp-stop]', { timeout: 5000 });
  await page.waitForTimeout(ms);
  // a gravação da palavra para sozinha em 6 s: só toca em “Parar” se ainda estiver gravando
  await page.evaluate(() => { const b = document.querySelector('[data-role=wp-stop]'); if (b) b.click(); });
  await page.waitForFunction(() => !['recording', 'processing'].includes(document.querySelector('[data-role=word-practice]')?.dataset.status), null, { timeout: 90000 });
}
// estado do banco: gravação da frase (áudio + resultado) e nº de áudios guardados
const dbSnap = (k = KEY) => page.evaluate(async (key) => {
  const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
  const get = (store, k) => new Promise((res) => { const t = db.transaction(store).objectStore(store).get(k); t.onsuccess = () => res(t.result); });
  const count = (store) => new Promise((res) => { const t = db.transaction(store).objectStore(store).count(); t.onsuccess = () => res(t.result); });
  const a = await get('audio', key), r = await get('recordings', key);
  const out = { audios: await count('audio'), registros: await count('recordings'), bytes: a ? a.bytes : 0, recordedAt: r && r.recordedAt, result: r && r.meta && r.meta.result ? r.meta.result.text : null, kv: await new Promise((res) => { const t = db.transaction('kv').objectStore('kv').getAllKeys(); t.onsuccess = () => res(t.result); }) };
  db.close();
  return out;
}, k);
const progressOf = () => page.evaluate((k) => JSON.stringify({ dw: window.DRG_APP.state.difficultWords || {}, rec: window.DRG_APP.state.recordingsMeta[k] || null, xp: window.DRG_APP.state.xp }), KEY);

// ---------- A: microfone com a frase lida trocando “teeth” por “tits” ----------
await launch('bm_george-R01-B1-S1-sub.wav');
await check('W00', 'Preparação: modelo local instalado e frase gravada com troca de palavra → “Vamos praticar: teeth”', async () => {
  await go('#/lab');
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.DRG_APP.asr.local.install());
  await go(S1);
  await page.locator('.rec-btn').click(); await page.waitForTimeout(6200); await page.locator('.rec-btn').click();
  await waitFinal();
  const c = await chips();
  assert(JSON.stringify(c) === '["teeth:todo"]', JSON.stringify(c));
  return { lista: c };
});

let before = null, progBefore = null;
await check('W01', 'Cartão da palavra: alvo em destaque, transcrição anterior, Ouvir/Devagar/Na frase e “Praticar esta palavra”; nada grava sozinho', async () => {
  before = await dbSnap(); progBefore = await progressOf();
  const mic0 = await page.evaluate(() => window.__mic);
  await page.locator('.pchip').first().click();
  await page.waitForTimeout(500);
  const txt = await page.locator('[data-role=word-practice]').textContent();
  const btns = await page.locator('[data-role=word-practice] button').allTextContents();
  assert(await page.locator('.wp-target').textContent() === 'teeth', 'alvo');
  assert(/na frase, o app ouviu “/.test(txt), txt);
  assert(['Ouvir', 'Devagar', 'Na frase', 'Praticar esta palavra'].every((b) => btns.some((x) => x.includes(b))), JSON.stringify(btns));
  assert(/avalia só esta palavra, não a frase/.test(txt), 'faltou deixar claro que avalia só a palavra');
  assert((await page.locator('[data-role=wp-full]').textContent()).trim() === 'Gravar a frase completa', 'ação da frase completa antes de praticar');
  assert(await page.evaluate(() => window.__mic) === mic0, 'o microfone abriu sem toque');
  await page.screenshot({ path: join(OUT, 'W01-cartao.png'), fullPage: true });
  return { anterior: (await page.locator('[data-role=wp-before]').textContent()).trim(), botoes: btns.map((b) => b.trim()) };
});

await check('W12', 'Falhas: microfone bloqueado e reconhecimento com erro (SIMULADOS) — aviso claro, nada trava, tentativa não contada', async () => {
  await page.evaluate(() => { window.__gumReal = navigator.mediaDevices.getUserMedia; navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error('x'), { name: 'NotAllowedError' })); });
  await page.locator('[data-role=wp-record]').click();
  await page.waitForSelector('[data-role=wp-error]', { timeout: 5000 });
  const micErr = await page.locator('[data-role=wp-error]').textContent();
  assert(/microfone foi bloqueado/.test(micErr) && await panelStatus() === 'todo', `${micErr} · ${await panelStatus()}`);
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = window.__gumReal; });
  // reconhecimento: o worker do modelo não pode ser criado
  await page.evaluate(() => { window.DRG_APP.asr.local.release(); window.__RealWorker = window.Worker; window.Worker = function () { throw new Error('worker bloqueado (teste)'); }; });
  await practiseWord();
  const asrErr = await page.locator('[data-role=wp-error]').textContent().catch(() => '');
  const st = await panelStatus();
  await page.evaluate(() => { window.Worker = window.__RealWorker; });
  assert(/reconhecimento falhou/.test(asrErr) && st === 'todo', `${asrErr} · ${st}`);
  assert(await page.locator('[data-role=wp-record]').textContent().then((t) => /Tentar novamente/.test(t)), 'sem “Tentar novamente”');
  assert(await page.locator('.pchip').first().getAttribute('data-status') === 'todo', 'falha contada como tentativa');
  return { microfone: micErr.trim().slice(0, 60), reconhecimento: asrErr.trim() };
});

await check('W02', 'A frase inteira dita no lugar da palavra: nunca acerto, e “O app ouviu” mostra a transcrição REAL, sem trocar pela palavra-alvo', async () => {
  await practiseWord(6400);
  const r = await result();
  // a frase inteira: “Não reconhecida” (se o app ouviu “tits”) ou “Inconclusivo” (se ouviu “teeth” junto de outras) — nunca acerto
  assert(r && ['mismatch', 'extra'].includes(r.result) && !/^“teeth”$/i.test(r.heard) && r.heard.length > 10, JSON.stringify(r));
  assert(/Tentar novamente/.test(await page.locator('[data-role=wp-record]').textContent()), r.text);
  assert(JSON.stringify(await chips()) === '["teeth:retry"]', JSON.stringify(await chips()));
  return { ouvido: r.heard, resultado: r.result };
});

await check('W10', 'Separação: tentativas da palavra não alteram a gravação, o resultado nem o progresso da frase', async () => {
  const after = await dbSnap();
  const progAfter = await progressOf();
  assert(after.audios === before.audios && after.registros === before.registros, JSON.stringify({ before, after }));
  assert(after.bytes === before.bytes && after.recordedAt === before.recordedAt && after.result === before.result, JSON.stringify({ before, after }));
  assert(progAfter === progBefore, `${progBefore} → ${progAfter}`);
  return { audios: after.audios, bytesFrase: after.bytes, resultadoFrase: after.result };
});

await check('W11', 'Nenhum áudio de palavra persistido: IndexedDB com as mesmas chaves e o mesmo nº de áudios', async () => {
  const s = await dbSnap();
  assert(JSON.stringify(s.kv) === JSON.stringify(before.kv) && s.audios === before.audios, JSON.stringify({ antes: before.kv, depois: s.kv }));
  return { chavesKv: s.kv, audios: s.audios };
});

// ---------- B: microfone dizendo outra palavra isolada (“fridge”) ----------
await launch('word-fridge.wav');
await check('W06', 'Erro de palavra isolada e repetição: microfone diz “fridge” para o alvo “teeth” → outra palavra; tentar de novo quantas vezes quiser', async () => {
  await go(S1);
  await page.waitForSelector('.fb[data-state="result"]', { timeout: 10000 });
  await page.locator('.pchip').first().click();
  const heard = [];
  for (let i = 0; i < 2; i++) { await practiseWord(); const r = await result(); heard.push(r && `${r.result}:${r.heard}`); }
  assert(heard.every((x) => x && x.startsWith('mismatch:')), JSON.stringify(heard));
  assert(await panelStatus() === 'retry', await panelStatus());
  await page.screenshot({ path: join(OUT, 'W06-erro.png'), fullPage: true });
  return { tentativas: heard };
});

// ---------- C: microfone com a frase correta (contém “teeth” com outras palavras) ----------
await launch('bm_george-R01-B1-S1.wav');
await check('W04', 'Palavras extras: a palavra-alvo aparece junto com outras → inconclusivo (“diga só a palavra”), não acerto', async () => {
  await go(S1);
  await page.waitForSelector('.fb[data-state="result"]', { timeout: 10000 });
  await page.locator('.pchip').first().click();
  await practiseWord(6400);
  const r = await result();
  assert(r && r.result === 'extra' && /Diga só “teeth”/.test(r.text), JSON.stringify(r));
  assert(await panelStatus() === 'retry', await panelStatus());
  return { ouvido: r.heard, resultado: r.result };
});

// ---------- D: silêncio ----------
await launch('silence.wav');
await check('W03', 'Transcrição vazia/silêncio: “(nada)”, pede nova tentativa e nunca conta como acerto; o modelo nem é chamado', async () => {
  await go(S1);
  await page.waitForSelector('.fb[data-state="result"]', { timeout: 10000 });
  await page.locator('.pchip').first().click();
  await practiseWord(2000);
  const r = await result();
  assert(r && r.result === 'empty' && r.heard === '(nada)' && /Tentar novamente/.test(await page.locator('[data-role=wp-record]').textContent()), JSON.stringify(r));
  assert(page.workers().length === 0, 'o modelo foi carregado para uma tentativa sem voz');
  return { resultado: r.result, ouvido: r.heard };
});

// ---------- E: microfone dizendo “kitchen” isolado ----------
// resultado guardado da frase com duas divergências (kitchen → chicken, class → glass), SIMULADO; o áudio salvo é o real
const setSaved = (text) => page.evaluate(async ([key, text]) => {
  const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
  await new Promise((res) => { const t = db.transaction('recordings', 'readwrite'); const s = t.objectStore('recordings'); const g = s.get(key); g.onsuccess = () => { const v = g.result; v.meta.result = { text, at: Date.now() }; s.put(v, key); }; t.oncomplete = res; });
  db.close();
}, [KEY2, text]);
const TWO = 'After we tidy up the chicken, I focus on preparing for my English glass.';
await launch('word-kitchen.wav');
await check('W05', 'Acerto: “kitchen” dito isoladamente → reconhecida, confirmação positiva, aviso de que não é medição completa; “Praticar próxima palavra”', async () => {
  await go(S2);
  await page.locator('.rec-btn').click(); await page.waitForTimeout(2600); await page.locator('.rec-btn').click(); // cria a gravação da frase
  await waitFinal();
  await setSaved(TWO);
  await go(S2);
  await page.waitForSelector('.fb[data-state="result"]', { timeout: 10000 });
  assert(JSON.stringify(await chips()) === '["kitchen:todo","class:todo"]', JSON.stringify(await chips()));
  await page.locator('.pchip', { hasText: 'kitchen' }).click();
  await practiseWord();
  const r = await result();
  assert(r && r.result === 'match' && /Reconhecida/.test(r.text) && /Não é uma medição completa/.test(r.text), JSON.stringify(r));
  assert(JSON.stringify(await chips()) === '["kitchen:done","class:todo"]', JSON.stringify(await chips()));
  assert(await page.locator('[data-role=wp-next]').count() === 1, 'faltou “Praticar próxima palavra”');
  await page.screenshot({ path: join(OUT, 'W05-acerto.png'), fullPage: true });
  return { ouvido: r.heard, chips: await chips() };
});

await check('W07', 'Próxima palavra e retorno à anterior: estados por palavra preservados, repetir uma palavra já reconhecida', async () => {
  await page.locator('[data-role=wp-next]').click(); // “Praticar próxima palavra” não grava sozinho
  assert(await page.locator('.wp-target').textContent() === 'class' && await panelStatus() === 'todo', 'não avançou');
  await practiseWord(); // o microfone diz “kitchen”: errado para “class”
  const wrong = await result();
  assert(wrong.result === 'mismatch', JSON.stringify(wrong));
  await page.locator('.pchip', { hasText: 'kitchen' }).click(); // voltar à anterior mantém o resultado
  assert((await result()).result === 'match' && await panelStatus() === 'done', 'perdeu o estado da anterior');
  await page.locator('[data-role=wp-record]', { hasText: 'Repetir esta palavra' }).click(); // repetir a já reconhecida
  await page.waitForSelector('[data-role=wp-stop]');
  await page.waitForTimeout(2600);
  await page.evaluate(() => { const b = document.querySelector('[data-role=wp-stop]'); if (b) b.click(); });
  await page.waitForFunction(() => !['recording', 'processing'].includes(document.querySelector('[data-role=word-practice]')?.dataset.status), null, { timeout: 90000 });
  const st = await chips();
  const prog = await page.locator('[data-role=wp-progress]').textContent();
  assert(JSON.stringify(st) === '["kitchen:done","class:retry"]' && /1 de 2/.test(prog), `${JSON.stringify(st)} ${prog}`);
  assert(await page.locator('[data-role=wp-full]').count() === 1 && await page.locator('[data-role=wp-all-done]').count() === 0, 'ação da frase completa');
  return { class: wrong.heard, estados: st, progresso: prog };
});

await check('W09', '“Agora, pratique a frase completa” volta à gravação da frase (mesma tela) e o resultado da frase é o da nova gravação', async () => {
  const s0 = await dbSnap(KEY2);
  await page.locator('[data-role=wp-full]').click();
  await page.waitForSelector('.rec-btn.on', { timeout: 5000 });
  const inView = await page.evaluate(() => { const r = document.querySelector('.rec-panel').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
  assert(await page.locator('[data-role=word-practice]').count() === 0, 'o cartão da palavra ficou aberto durante a gravação da frase');
  await page.waitForTimeout(2600);
  await page.locator('.rec-btn').click();
  await waitFinal();
  const s1 = await dbSnap(KEY2);
  assert(inView && s1.recordedAt > s0.recordedAt && s1.audios === s0.audios, JSON.stringify({ inView, s0, s1 }));
  return { gravacaoVisivel: inView, estado: await fbState(), audios: s1.audios };
});

await check('W13', 'Offline: servidor desligado e rede cortada — a prática da palavra continua funcionando', async () => {
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await setSaved(TWO);
  await go(S2);
  await page.waitForSelector('.pchip', { timeout: 10000 });
  await page.locator('.pchip', { hasText: 'kitchen' }).click();
  await practiseWord();
  const r = await result();
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  assert(r && r.result === 'match', JSON.stringify(r));
  return { offline: true, ouvido: r.heard };
});

await check('W15', 'Layout 430 px: sem rolagem horizontal, navegação inferior visível, botões com ≥ 40 px, sem texto “null”', async () => {
  await go(S1);
  await page.waitForSelector('.pchip', { timeout: 10000 });
  await page.locator('.pchip').first().click();
  await page.waitForTimeout(400);
  const m = await page.evaluate(() => {
    const nav = document.querySelector('nav.nav');
    const small = [...document.querySelectorAll('[data-role=word-practice] button')].filter((b) => b.getBoundingClientRect().height < 40).map((b) => b.textContent.trim());
    return { fullButtons: [...document.querySelectorAll('[data-role=practice] button')].filter((b) => /frase completa/.test(b.textContent)).length, nullText: /\bnull\b|undefined/.test(document.querySelector('[data-role=practice]').textContent), scrollW: document.documentElement.scrollWidth, w: innerWidth, nav: nav ? getComputedStyle(nav).display !== 'none' && nav.getBoundingClientRect().bottom <= innerHeight + 1 : null, small };
  });
  await page.screenshot({ path: join(OUT, 'W15-430px.png') });
  assert(m.fullButtons === 1 && !m.nullText && m.scrollW <= m.w && m.nav !== false && !m.small.length, JSON.stringify(m));
  return m;
});

await check('W14', 'Nenhuma requisição externa e nenhum erro de JavaScript', async () => {
  const relevant = pageErrors.filter((e) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED|net::|worker bloqueado/.test(e));
  assert(external.length === 0, external.slice(0, 3).join(', '));
  assert(relevant.length === 0, relevant.slice(0, 3).join(' | '));
  return { externas: 0, erros: 0 };
});

await ctx.close();
server.close();
rmSync(PROFILE, { recursive: true, force: true });
const summary = { when: new Date().toISOString(), environment: 'Chromium (Playwright) headless, Linux — microfone falso com fala SINTÉTICA; não é o Galaxy S25+', passed: results.filter((r) => r.status === 'aprovado').length, failed: results.filter((r) => r.status !== 'aprovado').length, results };
writeFileSync(join(OUT, 'wordpractice-results.json'), JSON.stringify(summary, null, 1));
console.log(`\n${summary.passed} aprovados, ${summary.failed} reprovados`);
process.exit(summary.failed ? 1 : 0);
