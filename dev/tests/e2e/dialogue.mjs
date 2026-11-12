// Testes de ponta a ponta das atividades de diálogo em cinco fases (The Story of John).
// Uso: node tests/e2e/dialogue.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
//
// REAL: app construído, Chromium (viewport de celular), áudio Kokoro gravado, contagem de audições pelo fim real da
// reprodução, gravação (MediaRecorder) com microfone falso (arquivo WAV), IndexedDB, retomada, service worker/offline
// (D12) e o reconhecimento Moonshine no aparelho (D11).
// SIMULADO (só aqui, nunca no app): (1) — (desde 2026-11-11 a fase 4 usa as 10 questões reais de john-p1-e01); (2) o AI Gateway (https://gw.test), que aprova/reprova por regra fixa — não é avaliação
// semântica; (3) nas fases 1 e 5, exceto D11, a transcrição vem de window.__DRG_TEST_ASR (texto controlado pelo teste).
// Nada disto valida a qualidade de um modelo de IA real, o reconhecimento com voz humana ou o Galaxy S25+.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = resolve(process.argv[4] || join(ROOT, 'evidence/dialogue'));
const FIX = join(ROOT, 'tests/fixtures');
mkdirSync(OUT, { recursive: true });
const PORT = 8812, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const ACT = 'john-p1-e01';
const APPDIR = join(SITE, BASE_PATH.replace(/^\/|\/$/g, ''));

const results = [];
const record = (id, name, status, evidence) => { results.push({ id, name, status, evidence }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); await shot(`${id}-falha`).catch(() => {}); } };
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

// ---------- dados só do teste ----------
const PACK = JSON.parse(readFileSync(join(APPDIR, 'data/dialogues.js'), 'utf8').replace(/^[\s\S]*?window\.DRG_DIALOGUES = /, '').replace(/;\s*$/, ''));
const A = PACK.activities.find((a) => a.id === ACT);
const ITEMS = A.itemIds.map((id) => PACK.items.find((x) => x.id === id));
const patchedPack = (endpoint) => {
  const p = JSON.parse(JSON.stringify(PACK));
  p.evaluation = { endpoint, timeoutMs: 5000 };
  return `window.DRG_DIALOGUES = ${JSON.stringify(p)};`;
};
const gwCalls = [];
let gwDown = false;
function gateway(route) {
  if (gwDown) return route.abort('failed');
  const body = JSON.parse(route.request().postData());
  gwCalls.push({ attemptId: body.attemptId, key: route.request().headers()['idempotency-key'], text: body.response.text });
  const bad = /XERRO/.test(body.response.text);
  return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({
    attemptId: body.attemptId, status: 'evaluated', score: bad ? 40 : 90, meaningPreserved: !bad, preservedElements: bad ? [] : ['sentido geral'],
    omissions: bad ? ['informação essencial'] : [], distortions: [], suggestedTranslation: body.reference.text, explanationPtBr: bad ? '[TESTE] Omitiu parte essencial.' : '[TESTE] Sentido preservado.',
    rubricVersion: 'dre-translation-semantic-1', evaluatorVersion: 'gateway-de-teste' }) });
}

let server = await serve(SITE, PORT);
const external = [], pageErrors = [];
let ctx, page;
async function launch({ mic = 'bm_george-R01-B1-S1.wav', loop = true, sw = false, profile = 'p1', fresh = true, patch = true } = {}) {
  if (ctx) await ctx.close();
  const dir = join(OUT, `.profile-${profile}`);
  if (fresh) rmSync(dir, { recursive: true, force: true });
  ctx = await chromium.launchPersistentContext(dir, {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${join(FIX, mic)}${loop ? '' : '%noloop'}`, '--autoplay-policy=no-user-gesture-required'],
    viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, permissions: ['microphone'], serviceWorkers: sw ? 'allow' : 'block',
  });
  await ctx.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; }); // caminho do aparelho (Moonshine): navegador sem reconhecimento online (motor central: speech.js)
  if (patch) {
    await ctx.route('**/data/dialogues.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: patchedPack('https://gw.test') }));
    await ctx.route('**/index.html', async (r) => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace("connect-src 'self' file: blob: data:;", "connect-src 'self' file: blob: data: https://gw.test;") }); });
    await ctx.route(/\/daily-routine-english\/$/, async (r) => { const res = await r.fetch(); r.fulfill({ response: res, body: (await res.text()).replace("connect-src 'self' file: blob: data:;", "connect-src 'self' file: blob: data: https://gw.test;") }); });
    await ctx.route('https://gw.test/**', gateway);
  }
  page = ctx.pages()[0] || await ctx.newPage();
  ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u) && !u.startsWith('https://gw.test')) external.push(u); });
  page.on('pageerror', (e) => pageErrors.push(e.message));
}
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
const go = async (hash) => { await page.goto(BASE + hash); await page.waitForTimeout(400); };
const firstRun = async () => {
  await page.goto(BASE);
  await page.waitForSelector('#app');
  await page.evaluate(async () => { const A = window.DRG_APP; A.state.settings.characterChosen = true; A.state.welcomed = true; A.state.settings.rate = 1.6; A.applySettings(); await A.flush(); });
};
const setHeard = (text) => page.evaluate((t) => { window.__heard = t; window.__DRG_TEST_ASR = { status: async () => 'installed', transcribe: async () => ({ text: window.__heard, confidence: 0, engine: 'teste', secs: 2, segments: null }), release() {} }; }, text);
const store = () => page.evaluate(async () => {
  const db = await new Promise((res, rej) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); r.onerror = rej; });
  return new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result || null); });
});
const textOf = (sel) => page.locator(sel).first().textContent();

async function listenItem(n = 3) {
  for (let k = 0; k < n; k++) {
    const before = await textOf('[data-role=listen-count]');
    await page.click('[data-role=listen-item]');
    await page.waitForFunction((b) => document.querySelector('[data-role=listen-count]')?.textContent !== b, before, { timeout: 20000 });
  }
}
async function recordOnce(ms = 1200) {
  await page.evaluate(() => document.querySelectorAll('[data-role=feedback]').forEach((e) => e.remove())); // só vale o resultado desta gravação
  await page.click('[data-role=record-item], [data-role=record-line]');
  await page.waitForSelector('[data-role=stop]', { timeout: 8000 });
  await page.waitForTimeout(ms);
  if (await page.locator('[data-role=stop]').count()) await page.click('[data-role=stop]').catch(() => {}); // a captura pode ter encerrado sozinha (fim de fala automático)
  await page.waitForSelector('[data-role=feedback]', { timeout: 120000 });
  return page.getAttribute('[data-role=feedback]', 'data-status');
}

// =============================================================================================================
await launch();
await firstRun();

await check('D01', 'Início e lista: entrada própria, 7 partes, 46 diálogos; sem XP/níveis/recompensas nas telas novas', async () => {
  await go('#/');
  assert(await page.locator('[data-role=dialogues-entry]').count() === 1, 'cartão no Início');
  await page.click('[data-role=open-dialogues]');
  await page.waitForSelector('[data-role=dialogue]');
  const parts = await page.locator('[data-role=part]').count();
  const n = await page.locator('[data-role=dialogue]').count();
  assert(parts === 7 && n === PACK.activities.length, `${parts} partes, ${n} diálogos`);
  const txt = await page.locator('main').textContent();
  assert(!/\bXP\b|nível|pontos|moedas|sequência de dias|recompensa|ranking|conquista/i.test(txt), 'termo de gamificação na lista');
  await shot('D01-lista');
  return `${parts} partes, ${n} diálogos`;
});

await check('D02', 'Tela do diálogo: inglês e tradução ocultos antes das fases 2/3; fases 2–5 bloqueadas; áudio por fala disponível', async () => {
  await go(`#/dialogue/${ACT}`);
  await page.waitForSelector('[data-role=phases]');
  const states = await page.$$eval('[data-role=phase]', (els) => els.map((e) => e.dataset.state));
  assert(states.join() === 'available,locked,locked,locked,locked', states.join());
  const body = await page.locator('[data-role=tab-dialogue]').textContent();
  for (const l of A.lines) { assert(!body.includes(l.en), `inglês exposto: ${l.en}`); assert(!body.includes(l.pt), `tradução exposta: ${l.pt}`); }
  assert(await page.locator('[data-role=line-audio]:not([disabled])').count() === A.lines.length, 'áudio de cada fala');
  assert(await page.locator('[data-role=audio-missing]').count() === 0, 'aviso de áudio ausente');
  await shot('D02-dialogo');
  return states.join();
});

await check('D03', 'Fase 1: gravação só depois de 3 audições COMPLETAS; audição interrompida não conta', async () => {
  await go(`#/dphase/${ACT}?p=vocab`);
  await page.waitForSelector('[data-role=vocab-card]');
  assert(await page.locator('[data-role=record-item]').isDisabled(), 'gravação liberada antes das audições');
  await page.click('[data-role=listen-item]');
  await page.waitForTimeout(150);
  await go(`#/dialogue/${ACT}`); // sai no meio: player.stopAll()
  await go(`#/dphase/${ACT}?p=vocab`);
  await page.waitForSelector('[data-role=vocab-card]');
  assert((await textOf('[data-role=listen-count]')).includes('0/3'), `contou audição interrompida: ${await textOf('[data-role=listen-count]')}`);
  await listenItem(2);
  assert(await page.locator('[data-role=record-item]').isDisabled(), 'liberou com 2');
  await listenItem(1);
  assert(!(await page.locator('[data-role=record-item]').isDisabled()), 'não liberou com 3');
  return await textOf('[data-role=listen-count]');
});

await check('D04', 'Fase 1: item abaixo de 80% fica para prática; inconclusivo não aprova nem reprova; ≥ 80% aprova; média não compensa', async () => {
  await setHeard('these');
  let st = await recordOnce();
  const score = await textOf('[data-role=score]').catch(() => '');
  assert(st === 'needs_practice', `esperado needs_practice, veio ${st} ${score}`);
  await setHeard('');
  st = await recordOnce();
  assert(st === 'inconclusive', `vazio → ${st}`);
  const fbText = await textOf('[data-role=feedback]');
  assert(/não aprova nem reprova/i.test(fbText), 'mensagem de inconclusivo');
  await setHeard('these days');
  st = await recordOnce();
  assert(st === 'passed', `correto → ${st}`);
  // demais itens: todos aprovados, menos um que fica abaixo do corte (a fase não conclui)
  for (const it of ITEMS.slice(1)) {
    await page.click(`[data-role=item-chips] [data-item="${it.id}"]`);
    await page.waitForSelector(`[data-role=vocab-card][data-item="${it.id}"]`);
    await listenItem(3);
    await setHeard(it.id === ITEMS[ITEMS.length - 1].id ? 'what' : it.spoken.replace(/[?.!]/g, ''));
    await recordOnce();
  }
  let footer = await page.getAttribute('[data-role=phase-footer]', 'data-state');
  assert(footer !== 'completed', `fase concluída com item abaixo do corte (${footer})`);
  const last = ITEMS[ITEMS.length - 1];
  await setHeard(last.spoken.replace(/[?.!]/g, ''));
  await recordOnce();
  footer = await page.getAttribute('[data-role=phase-footer]', 'data-state');
  const chipsSt = await page.$$eval('[data-role=item-chips] [data-item]', (els) => els.map((e) => `${e.dataset.item.slice(-3)}:${e.dataset.status}`).join(' '));
  const dbg = await store().then((s) => Object.values(s.acts['john-p1-e01'].attempts).filter((a) => a.phase === 'vocab').map((a) => `${a.itemId.slice(-3)}=${a.status}/${a.score}/${a.response}`).join(' | '));
  assert(footer === 'completed', `fase não concluiu: ${footer} — ${chipsSt} — ${dbg}`);
  await shot('D04-vocab');
  return `${ITEMS.length} itens aprovados individualmente`;
});

await check('D05', 'Fase 2: frase oculta antes do envio; pista sem a tradução completa; 79%/omissão reprova; contração aceita', async () => {
  await go(`#/dphase/${ACT}?p=dictation`);
  await page.waitForSelector('[data-role=dictation-card]');
  for (let k = 0; k < A.lines.length; k++) {
    const lineId = await page.getAttribute('[data-role=dictation-card]', 'data-line');
    const l = A.lines.find((x) => x.id === lineId);
    const card = await textOf('[data-role=dictation-card]');
    assert(!card.includes(l.en), 'frase-alvo visível antes do envio');
    assert(!card.includes(l.pt), 'tradução completa usada como pista');
    if (k === 0) {
      await page.fill('[data-role=answer]', l.en.split(' ').slice(0, Math.max(1, Math.floor(l.en.split(' ').length / 2))).join(' '));
      await page.click('[data-role=submit]');
      await page.waitForSelector('[data-role=feedback]');
      assert(await page.getAttribute('[data-role=feedback]', 'data-status') === 'needs_practice', 'metade da frase aprovou');
      assert((await textOf('[data-role=reference]')).includes(l.en), 'referência depois do envio');
      await page.click(`[data-role=item-chips] [data-item="${l.id}"]`);
      assert(!(await textOf('[data-role=dictation-card]')).includes(l.en), 'nova tentativa sem a referência na tela');
    }
    const ans = l.en.replace(/\bI'm\b/, 'I am').replace(/\bthat's\b/i, 'that is');
    await page.fill('[data-role=answer]', ans);
    await page.click('[data-role=submit]');
    await page.waitForSelector('[data-role=feedback]');
    const st = await page.getAttribute('[data-role=feedback]', 'data-status');
    assert(st === 'passed', `${l.id} (“${ans}”) → ${st}`);
    if (k < A.lines.length - 1) await page.click('[data-role=next-item]');
  }
  assert(await page.getAttribute('[data-role=phase-footer]', 'data-state') === 'completed', 'fase 2 não concluiu');
  await go(`#/dialogue/${ACT}`);
  const body = await page.locator('[data-role=tab-dialogue]').textContent();
  assert(A.lines.every((l) => body.includes(l.en)), 'inglês visível depois da fase 2');
  assert(A.lines.every((l) => !body.includes(l.pt)), 'tradução ainda oculta');
  return `${A.lines.length} frases`;
});

await check('D06', 'Fase 3: autorização; offline fica pendente e sobrevive ao reabrir; reconexão avalia uma vez; paráfrase aceita; omissão reprova', async () => {
  await go(`#/dphase/${ACT}?p=translation`);
  await page.waitForSelector('[data-role=translation-card]');
  assert(!(await textOf('[data-role=translation-card]')).includes(A.lines[0].pt), 'referência antes da tentativa');
  assert(await page.getAttribute('[data-role=remote-blocker]', 'data-code') === 'consent', 'pede autorização antes de enviar');
  await page.click('[data-role=consent-yes]');
  // 1) offline: resposta salva e pendente
  await ctx.setOffline(true);
  await page.waitForFunction(() => document.querySelector('[data-role=online-state]')?.textContent === 'Sem internet');
  await page.fill('[data-role=answer]', 'Você lembra do John Bennett?');
  await page.click('[data-role=submit]');
  await page.waitForSelector('[data-role=feedback][data-status=pending]');
  assert(!(await textOf('[data-role=line-result]')).includes(A.lines[0].pt), 'referência exibida com avaliação pendente');
  let s = await store();
  const pend = Object.values(s.acts[ACT].attempts).filter((a) => a.phase === 'translation' && a.status === 'pending');
  assert(pend.length === 1, 'pendente no IndexedDB');
  // volta a internet, mas o serviço de avaliação está fora: a tentativa automática falha e a resposta continua pendente
  gwDown = true;
  await ctx.setOffline(false);
  await page.waitForFunction(() => document.querySelector('[data-role=online-state]')?.textContent === 'Online');
  await page.waitForTimeout(1500);
  s = await store();
  assert(s.acts[ACT].attempts[pend[0].attemptId].status === 'pending', 'falha do serviço mudou o estado');
  // fechar e reabrir o app: continua pendente, com contador
  await page.reload(); await page.waitForTimeout(300);
  await go(`#/dphase/${ACT}?p=translation`);
  await page.waitForSelector('[data-role=pending-note]');
  assert((await textOf('[data-role=pending-count]')).startsWith('1 '), 'contador de pendentes');
  // 2) serviço de volta: “Enviar agora” avalia UMA vez (paráfrase aprovada)
  gwDown = false;
  await page.click('[data-role=send-pending]');
  await page.waitForFunction(() => !document.querySelector('[data-role=pending-count]'), null, { timeout: 15000 });
  s = await store();
  const done = s.acts[ACT].attempts[pend[0].attemptId];
  assert(done.status === 'passed' && done.evaluationMode === 'remote_ai', `após reconectar: ${done.status}`);
  assert(gwCalls.filter((c) => c.attemptId === pend[0].attemptId).length === 1 && gwCalls[0].key === pend[0].attemptId, `enviada ${gwCalls.length}×, com idempotency-key`);
  // 3) omissão essencial reprova (regra do gateway de teste) e a fala continua pendente de prática
  await go(`#/dphase/${ACT}?p=translation`);
  await page.waitForSelector('[data-role=translation-card]');
  const second = await page.getAttribute('[data-role=translation-card]', 'data-line');
  await page.fill('[data-role=answer]', 'XERRO claro');
  await page.click('[data-role=submit]');
  await page.waitForSelector('[data-role=feedback][data-status=needs_practice]');
  assert((await textOf('[data-role=reference]')).includes(A.lines.find((l) => l.id === second).pt), 'referência após avaliação');
  // 4) igual à referência: aprovado localmente, sem chamar o gateway; o resto, paráfrases aprovadas online
  const before = gwCalls.length;
  for (const l of A.lines) {
    if (l.id === pend[0].itemId) continue;
    await page.click(`[data-role=item-chips] [data-item="${l.id}"]`);
    await page.waitForSelector(`[data-role=translation-card][data-line="${l.id}"]`);
    const local = l.id === A.lines[1].id;
    await page.fill('[data-role=answer]', local ? l.pt : `${l.pt} (paráfrase)`);
    await page.click('[data-role=submit]');
    await page.waitForSelector('[data-role=feedback][data-status=passed]', { timeout: 15000 });
  }
  assert(gwCalls.length - before === A.lines.length - 2, `chamadas ao gateway: ${gwCalls.length - before}`);
  assert(await page.getAttribute('[data-role=phase-footer]', 'data-state') === 'completed', 'fase 3 não concluiu');
  await shot('D06-traducao');
  // fases 4 e 5 abrem juntas depois da tradução (a leitura não depende da compreensão)
  await go(`#/dialogue/${ACT}`);
  await page.waitForSelector('[data-role=phases]');
  const after3 = await page.$$eval('[data-role=phase]', (els) => els.map((e) => e.dataset.state));
  assert(after3[3] === 'available' && after3[4] === 'available', `fases 4/5 após a tradução: ${after3}`);
  return `${gwCalls.length} avaliações online, 1 local`;
});

await check('D07', 'Fase 4 (questões reais): 3 audições liberam 10 questões; correção só após envio; 7/10 → só as 3 erradas voltam, sem a resposta antes; ao acertá-las a fase é aprovada sem nova rodada completa', async () => {
  await go(`#/dphase/${ACT}?p=listening`);
  await page.waitForSelector('[data-role=listening-card]');
  assert(await page.locator('[data-role=questions]').count() === 0, 'questões antes das audições');
  await page.fill('[data-role=notes]', 'John: tech company, Manchester');
  for (let k = 1; k <= 3; k++) {
    await page.click('[data-role=play-dialogue]');
    await page.waitForFunction((n) => document.querySelector('[data-role=listen-count]')?.textContent.includes(`${n}/3`), k, { timeout: 90000 });
  }
  await page.waitForSelector('[data-role=questions][data-kind=full]');
  const realQ = PACK.questions.filter((q) => q.activityId === ACT);
  assert(realQ.length === 10 && await page.locator('[data-role=questions] [data-question]').count() === 10, '10 questões reais');
  assert(!/professor|validação/i.test(await page.locator('main').textContent()), 'aviso de validação exibido ao aluno');
  const shownText = await page.locator('[data-role=questions]').textContent();
  assert(realQ.every((q) => !shownText.includes(q.explanation.slice(0, 30))), 'explicação antes do envio');
  const answerAll = async (nRight) => {
    const qs = await page.$$eval('[data-role=questions] [data-question]', (els) => els.map((e) => e.dataset.question));
    for (let i = 0; i < qs.length; i++) await page.click(`[data-role=questions] [data-question="${qs[i]}"] [data-option="${i < nRight ? 'a' : 'b'}"]`);
    await page.click('[data-role=submit-round]');
    await page.waitForSelector('[data-role=round-result]');
    return qs;
  };
  const order = await answerAll(7);
  assert(await page.getAttribute('[data-role=round-result]', 'data-passed') === 'false', '7/10 aprovou');
  const wrong = order.slice(7);
  for (const id of wrong) {
    assert(await page.getAttribute(`[data-role=round-result] [data-question="${id}"]`, 'data-revealed') === 'false', `resposta revelada antes da recuperação (${id})`);
    const right = realQ.find((q) => q.id === id).options[0].text;
    assert(!(await textOf(`[data-role=round-result] [data-question="${id}"]`)).includes(right), 'texto da resposta certa exibido');
  }
  assert(await page.getAttribute(`[data-role=round-result] [data-question="${order[0]}"]`, 'data-revealed') === 'true', 'explicação da acertada');
  await page.click('[data-role=round-result] [data-role=continue]');
  await page.waitForSelector('[data-role=questions][data-kind=recovery]');
  const rec = await page.$$eval('[data-role=questions] [data-question]', (els) => els.map((e) => e.dataset.question));
  assert(rec.length === 3 && rec.every((id) => wrong.includes(id)), `recuperação só com as erradas: ${rec}`);
  await answerAll(1); // acerta 1 de 3 → 8/10
  assert(await page.getAttribute('[data-role=round-result]', 'data-tally') === '8', 'contagem 8/10');
  assert(await page.getAttribute('[data-role=round-result]', 'data-passed') === 'true', '8/10 com a recuperação não aprovou');
  await page.click('[data-role=round-result] [data-role=continue]');
  assert(await page.getAttribute('[data-role=phase-footer]', 'data-state') === 'completed', 'fase 4 não concluiu');
  assert(await page.locator('[data-role=questions][data-kind=full]').count() === 0, 'pediu nova rodada completa');
  // erradas restantes: recuperação opcional e “Ver as respostas”
  await page.waitForSelector('[data-role=optional-recovery]');
  await page.click('[data-role=reveal-answers]');
  assert(await page.locator('[data-revealed=true]').count() === 2, 'respostas das 2 restantes ao pedir');
  const s = await store();
  assert(s.acts[ACT].notes.includes('Manchester'), 'anotações salvas');
  assert(s.acts[ACT].rounds.filter((r) => r.kind === 'full').length === 1, 'mais de uma rodada completa');
  await shot('D07-compreensao');
  return `rodadas: ${s.acts[ACT].rounds.map((r) => `${r.kind}:${r.correct}/${r.total}`).join(', ')}`;
});

await check('D08', 'Fase 5: inconclusivo não reprova; retomada após fechar no meio; todas as falas ≥ 80% concluem a atividade', async () => {
  await go(`#/dphase/${ACT}?p=reading`);
  await page.waitForSelector('[data-role=reading-card]');
  await setHeard('');
  let st = await recordOnce();
  assert(st === 'inconclusive', `vazio → ${st}`);
  assert(await page.getAttribute('[data-role=reading-card]', 'data-status') !== 'needs_practice', 'inconclusivo virou reprovação');
  const l0 = A.lines[0];
  await setHeard(l0.en);
  st = await recordOnce();
  assert(st === 'passed', `leitura correta → ${st}`);
  // fecha o app no meio da fase e reabre: continua na fala seguinte
  await page.reload(); await page.waitForTimeout(300);
  await go(`#/dphase/${ACT}?p=reading`);
  await page.waitForSelector('[data-role=reading-card]');
  const resumed = await page.getAttribute('[data-role=reading-card]', 'data-line');
  assert(resumed === A.lines[1].id, `retomou em ${resumed}`);
  for (const l of A.lines.slice(1)) {
    await page.click(`[data-role=item-chips] [data-item="${l.id}"]`);
    await page.waitForSelector(`[data-role=reading-card][data-line="${l.id}"]`);
    await setHeard(l.en);
    st = await recordOnce();
    assert(st === 'passed', `${l.id} → ${st}`);
  }
  await go(`#/dialogue/${ACT}`);
  await page.waitForSelector('[data-role=activity-result]');
  assert(await page.getAttribute('[data-role=activity-state]', 'data-state') === 'completed', 'atividade não concluída');
  const txt = await page.locator('main').textContent();
  assert(!/\bXP\b|nível|pontos|moedas|recompensa|ranking|conquista/i.test(txt.replace('não há pontos nem recompensas', '')), 'gamificação no resultado');
  await shot('D08-resultado');
  return 'concluída';
});

await check('D09', 'Progresso separado: jornadas Daily Routine e Conversation Practice intactas; o diálogo grava só em kv/dialogues', async () => {
  const st = await page.evaluate(() => ({ profiles: Object.fromEntries(Object.entries(window.DRG_APP.state.profiles).map(([k, p]) => [k, Object.keys(p.cards || {}).length])) }));
  const total = Object.values(st.profiles).reduce((n, x) => n + x, 0);
  assert(total === 0, `cartões criados nas jornadas: ${JSON.stringify(st.profiles)}`);
  const s = await store();
  assert(Object.keys(s.acts).includes(ACT), 'progresso do diálogo salvo');
  return st.profiles;
});

await check('D10', 'Microfone bloqueado: tentativa inconclusiva com orientação (não reprova)', async () => {
  await ctx.clearPermissions();
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('negado', 'NotAllowedError'); }; });
  await go(`#/dphase/john-p1-e02?p=vocab`);
  // fase 1 da atividade 2: libera a gravação do 1º item e tenta gravar
  await page.waitForSelector('[data-role=vocab-card]');
  await page.evaluate(() => { navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('negado', 'NotAllowedError'); }; });
  await listenItem(3);
  await page.click('[data-role=record-item]');
  await page.waitForSelector('[data-role=feedback]');
  const st = await page.getAttribute('[data-role=feedback]', 'data-status');
  assert(st === 'inconclusive', `microfone negado → ${st}`);
  return st;
});

await check('D14', 'Diálogo curto (3 questões): rodada reduzida com corte proporcional (3/3 = 80% arredondado), recuperação só da errada; leitura em voz alta disponível antes da compreensão', async () => {
  const SHORT = 'john-p2-x02';
  const sa = PACK.activities.find((a) => a.id === SHORT);
  const sq = PACK.questions.filter((q) => q.activityId === SHORT);
  assert(sq.length === 3, `questões do diálogo curto: ${sq.length}`);
  // progresso SINTÉTICO das fases 1–3 gravado direto no IndexedDB (atalho do teste; as fases 1–3 já são testadas em D04–D06)
  await page.evaluate(async ({ sa }) => {
    const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
    const get = () => new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result); });
    const st = await get();
    const attempts = {}; let n = 0;
    const add = (phase, itemId) => { const id = `syn-${n++}`; attempts[id] = { attemptId: id, phase, itemId, status: 'passed', score: 100, threshold: 80, evaluationMode: 'teste', createdAt: n, evaluatedAt: n }; };
    sa.itemIds.forEach((id) => add('vocab', id));
    for (const ph of ['dictation', 'translation']) sa.lines.forEach((l) => add(ph, l.id));
    st.acts[sa.id] = { contentVersion: null, startedAt: 1, completedAt: null, attempts, listens: {}, rounds: [], notes: '', order: {} };
    await new Promise((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(st, 'dialogues'); t.oncomplete = res; });
  }, { sa });
  await page.reload(); await page.waitForTimeout(400);
  await go(`#/dialogue/${SHORT}`);
  await page.waitForSelector('[data-role=phases]');
  const states = await page.$$eval('[data-role=phase]', (els) => els.map((e) => e.dataset.state));
  assert(states[3] === 'available' && states[4] === 'available', `fases 4/5: ${states}`);
  assert((await textOf('[data-phase=listening]')).includes('3 questões · aprovação com 3/3'), await textOf('[data-phase=listening]'));
  await go(`#/dphase/${SHORT}?p=listening`);
  for (let k = 1; k <= 3; k++) {
    await page.click('[data-role=play-dialogue]');
    await page.waitForFunction((n) => document.querySelector('[data-role=listen-count]')?.textContent.includes(`${n}/3`), k, { timeout: 60000 });
  }
  await page.waitForSelector('[data-role=questions][data-kind=full]');
  assert(await page.locator('[data-role=questions] [data-question]').count() === 3, 'rodada de 3');
  const qs = await page.$$eval('[data-role=questions] [data-question]', (els) => els.map((e) => e.dataset.question));
  for (let i = 0; i < 3; i++) await page.click(`[data-role=questions] [data-question="${qs[i]}"] [data-option="${i < 2 ? 'a' : 'b'}"]`);
  await page.click('[data-role=submit-round]');
  await page.waitForSelector('[data-role=round-result]');
  assert(await page.getAttribute('[data-role=round-result]', 'data-passed') === 'false', '2/3 aprovou (67% < 80%)');
  assert(await page.getAttribute(`[data-role=round-result] [data-question="${qs[2]}"]`, 'data-revealed') === 'false', 'resposta revelada antes da recuperação');
  await page.click('[data-role=round-result] [data-role=continue]');
  await page.waitForSelector('[data-role=questions][data-kind=recovery]');
  assert(await page.locator('[data-role=questions] [data-question]').count() === 1, 'só a errada volta');
  await page.click(`[data-role=questions] [data-option="a"]`);
  await page.click('[data-role=submit-round]');
  await page.waitForSelector('[data-role=round-result][data-passed=true]');
  await page.click('[data-role=round-result] [data-role=continue]');
  assert(await page.getAttribute('[data-role=phase-footer]', 'data-state') === 'completed', 'fase 4 reduzida não concluiu');
  await shot('D14-rodada-reduzida');
  return 'rodada 2/3 → recuperação 1/1 → 3/3';
});

// ---------- D11: reconhecimento REAL (Moonshine) com a voz Kokoro da fala como microfone ----------
await check('D11', 'Reconhecimento local real: leitura em voz alta de uma fala aprovada pelo Moonshine (voz sintética)', async () => {
  const line = A.lines[A.lines.length - 1]; // “That sounds interesting.”
  const wav = join(OUT, 'mic-line.wav');
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', join(APPDIR, `audio/${line.audio}.ogg`), '-af', 'adelay=600|600,apad=pad_dur=2', '-ar', '48000', '-ac', '1', wav]);
  const keep = join(OUT, '.profile-p1');
  await ctx.close(); ctx = null;
  // mesmo perfil (atividade já na fase 5), microfone = a fala gravada
  ctx = await chromium.launchPersistentContext(keep, {
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${wav}%noloop`, '--autoplay-policy=no-user-gesture-required'],
    viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, permissions: ['microphone'], serviceWorkers: 'block',
  });
  await ctx.addInitScript(() => { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; }); // caminho do aparelho (Moonshine): navegador sem reconhecimento online (motor central: speech.js)
  await ctx.route('**/data/dialogues.js', (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: patchedPack('https://gw.test') }));
  page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.goto(BASE);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.DRG_APP.asr.local.install());
  await go(`#/dphase/${ACT}?p=reading`);
  await page.click(`[data-role=item-chips] [data-item="${line.id}"]`);
  await page.waitForSelector(`[data-role=reading-card][data-line="${line.id}"]`);
  const st = await recordOnce(4000);
  const heard = await textOf('[data-role=heard]').catch(() => '');
  assert(st === 'passed', `Moonshine: ${st} — ouviu ${heard}`);
  return `ouviu ${heard}`;
});

// ---------- D12: offline com o service worker (sem interceptação) ----------
await check('D12', 'Offline real: com o app em cache, a lista, o diálogo e o áudio funcionam sem servidor', async () => {
  await launch({ sw: true, profile: 'p2', patch: false });
  await page.goto(BASE);
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 120000 }).catch(() => null);
  await page.evaluate(async () => { const A = window.DRG_APP; A.state.settings.characterChosen = true; A.state.welcomed = true; await A.flush(); });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 120000 });
  // espera o pré-cache terminar (diagnóstico do PWA)
  await page.waitForFunction(async () => { const ks = await caches.keys(); return ks.some((k) => k.startsWith('drgshell')); }, null, { timeout: 120000 });
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await page.goto(BASE + '#/dialogues').catch(() => {});
  await page.waitForSelector('[data-role=dialogue]', { timeout: 20000 });
  await go(`#/dialogue/${ACT}`);
  await page.waitForSelector('[data-role=line-audio]');
  const r = await page.evaluate(async (key) => { const a = new Audio(`audio/${key}.ogg`); try { await a.play(); await new Promise((ok, ko) => { a.onended = ok; a.onerror = ko; }); return 'tocou'; } catch (e) { return `falhou ${e && e.message}`; } }, A.lines[0].audio);
  assert(r === 'tocou', r);
  server = await serve(SITE, PORT);
  return r;
});

if (ctx) await ctx.close();
server.close();
const unexpected = external.filter((u) => !u.startsWith('https://gw.test'));
record('D13', 'Sem conexões externas além do gateway de teste; sem erros de página', unexpected.length || pageErrors.length ? 'reprovado' : 'aprovado', { externas: unexpected.slice(0, 5), erros: pageErrors.slice(0, 5) });
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
