// Ciclo completo do reconhecimento ONLINE (modo online exclusivo): o reconhecedor é o único dono do microfone.
// Uso: node tests/e2e/speech-online.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
// REAL: app construído, telas, motor central (speech.js / recorder.js), registro, IndexedDB.
// SIMULADO: o serviço de reconhecimento (webkitSpeechRecognition falso com a sequência de eventos do Chrome:
// start → audiostart → soundstart → speechstart → parciais → final → speechend → audioend → end; roteiros de falha).
// Não comprova o serviço real do Android: isso é a validação física no Galaxy S25+ (diagnóstico em Ajustes → Áudio).
// Regressão da causa raiz: no modo online, NENHUMA captura própria (getUserMedia) pode rodar junto com o reconhecimento.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = resolve(process.argv[4] || join(ROOT, 'evidence/speech-online'));
mkdirSync(OUT, { recursive: true });
const PORT = 8833, BASE = `http://localhost:${PORT}${BASE_PATH}`;
const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

// Reconhecedor simulado com roteiro. window.__sr = { kind, text, utterances } por tentativa:
//  speak: fala com parciais e final; interim: só parciais (o final nunca vem); silent: inicia e não ouve nada;
//  network: erro de rede; nostart: start() não produz evento algum; throw: start() lança.
// utterances = quantas sessões “ouvem” fala nesta tentativa (as reiniciadas depois ficam em silêncio).
const INIT = () => {
  window.__gum = 0; window.__srMade = 0; window.__srAborts = 0; window.__srLive = [];
  const md = navigator.mediaDevices;
  if (md && md.getUserMedia) { const g = md.getUserMedia.bind(md); md.getUserMedia = (c) => { window.__gum++; return g(c); }; }
  class FakeSR {
    constructor() { window.__srMade++; this.ended = false; window.__srLive.push(this); }
    fire(n, ev = {}) { if (this.ended && n !== 'end') return; const f = this[`on${n}`]; if (f) f(ev); if (n === 'end') this.ended = true; }
    later(ms, fn) { setTimeout(() => { if (!this.ended) fn(); }, ms); }
    res(text, final) { const r = [{ transcript: text, confidence: final ? 0.9 : 0 }]; r.isFinal = final; this.fire('result', { resultIndex: 0, results: [r] }); }
    start() {
      const s = window.__sr || { kind: 'speak', text: 'hello', utterances: 1 };
      if (s.kind === 'throw') { const e = new Error('busy'); e.name = 'InvalidStateError'; throw e; }
      if (s.kind === 'nostart') return;
      this.later(20, () => { this.fire('start'); this.fire('audiostart'); });
      if (s.kind === 'network') { this.later(80, () => { this.fire('error', { error: 'network' }); this.fire('end'); }); return; }
      if (s.kind === 'silent' || !(s.utterances > 0)) return; // ouve silêncio até stop/abort
      s.utterances--;
      const words = s.text.split(' ');
      this.speaking = true;
      this.later(60, () => { this.fire('soundstart'); this.fire('speechstart'); });
      this.later(250, () => this.res(words.slice(0, Math.ceil(words.length / 2)).join(' '), false));
      this.later(500, () => this.res(s.text, false));
      if (s.kind === 'interim') return; // o final só viria depois; parar antes dele não pode perder o parcial
      this.later(800, () => { this.res(s.text, true); this.fire('speechend'); this.fire('audioend'); this.fire('end'); });
    }
    stop() { setTimeout(() => this.fire('end'), 30); }
    abort() { window.__srAborts++; setTimeout(() => this.fire('end'), 5); }
  }
  window.webkitSpeechRecognition = FakeSR; delete window.SpeechRecognition;
};

const server = await serve(SITE, PORT);
const PROFILE = join(OUT, '.profile'); rmSync(PROFILE, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(PROFILE, { serviceWorkers: 'block', permissions: ['microphone', 'clipboard-read', 'clipboard-write'], viewport: { width: 412, height: 915 },
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
await ctx.addInitScript(INIT);
const page = ctx.pages()[0] || await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
await page.goto(BASE); await page.waitForFunction(() => window.DRG_APP && window.DRG_APP.state);
await page.evaluate(async () => { const A = window.DRG_APP; A.state.welcomed = true; A.state.settings.onlineSpeech = true; await A.chooseCharacter('lucas'); await A.flush(); });

const SENT = await page.evaluate(() => window.DRG_APP.baseContent.sentences['R01-B1-S1'].en);
const script = (s) => page.evaluate((x) => { window.__sr = x; }, s);
const counters = () => page.evaluate(() => ({ gum: window.__gum, sr: window.__srMade, aborts: window.__srAborts }));
const last = () => page.evaluate(() => { const e = window.DRG_APP.speech.lastAttempt(); return e && { ...e, verdict: window.DRG_APP.speech.verdict(e) }; });
const fresh = async (hash) => { await page.goto(BASE + '#/'); await page.goto(BASE + hash); await page.reload(); await page.waitForTimeout(500); };
const labResult = async () => { await page.waitForSelector('.fb[data-state="result"], .fb[data-state="inconclusive"], .fb[data-state="error"]', { timeout: 20000 }); return page.evaluate(() => { const f = document.querySelector('.fb'); return { state: f.dataset.state, text: f.textContent }; }); };

await check('O01', 'Speaking Lab (frase): ciclo completo — parciais e final, fim automático por silêncio (1,8 s), transcrição entregue; nenhuma captura própria (getUserMedia) no modo online', async () => {
  await fresh('#/lab?sentence=R01-B1-S1');
  const c0 = await counters();
  await script({ kind: 'speak', text: SENT, utterances: 1 });
  const t0 = Date.now();
  await page.locator('.rec-btn').click();               // sem tocar em Parar: o fim vem do silêncio depois da fala
  const r = await labResult();
  const took = Date.now() - t0;
  const c1 = await counters(); const e = await last();
  assert(c1.gum === c0.gum, `getUserMedia chamado ${c1.gum - c0.gum}× no modo online`);
  assert(r.state === 'result' && r.text.includes(`Transcrição: “${SENT.slice(0, 20)}`), `${r.state}: ${r.text.slice(0, 160)}`);
  assert(e.engine === 'online' && e.verdict.code === 'ok' && e.partials === 2 && e.finals === 1 && e.endReason === 'silêncio' && e.delivered, JSON.stringify(e.verdict) + ' ' + e.endReason);
  assert(e.events.some((x) => x.e === 'fim de fala (silêncio 1.8 s)'), 'sem o marco do fim por silêncio');
  assert(await page.locator('[data-role=mine]').count() === 0 && await page.locator('[data-role=online-no-audio]').count() === 1, '“Minha voz” sem áudio ou aviso ausente');
  return { tela: r.state, ms: took, parciais: e.partials, finais: e.finals, fim: e.endReason, origem: e.source };
});

await check('O02', 'Resposta livre (Speaking Lab, pergunta): fim por silêncio de 3 s; transcrição entregue ao painel', async () => {
  await fresh('#/lab?q=R01.Q1');
  await script({ kind: 'speak', text: 'I usually wake up at six and I take a shower before breakfast', utterances: 1 });
  await page.locator('.rec-btn').click();
  await page.waitForSelector('[data-role=free-feedback][data-state=result]', { timeout: 20000 });
  const e = await last();
  const txt = await page.locator('[data-role=free-feedback]').textContent();
  assert(e.events.some((x) => x.e === 'fim de fala (silêncio 3 s)') && e.endReason === 'silêncio' && e.delivered, JSON.stringify(e.events.slice(-4)));
  assert(/I usually wake up at six/.test(txt), txt.slice(0, 200));
  return { fim: e.endReason, entregue: e.delivered };
});

await check('O03', 'Diálogo — fase 1 (vocabulário): mesma tentativa online; o app ouviu o item', async () => {
  await page.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
    const st = { v: 1, acts: { 'john-p1-e01': { attempts: {}, listens: { 'vocab:john-p1-e01-v05': 3 }, rounds: [], notes: '', order: {}, startedAt: 1 } }, consent: { online: false, at: null } };
    await new Promise((r) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(st, 'dialogues'); t.oncomplete = r; });
  });
  await fresh('#/dphase/john-p1-e01?p=vocab'); await page.waitForSelector('[data-role=item-chips]');
  await page.click('[data-role=item-chips] [data-item="john-p1-e01-v05"]');
  const en = (await page.locator('[data-role=item-en]').textContent()).trim();
  await script({ kind: 'speak', text: en, utterances: 1 });
  const c0 = await counters();
  await page.click('[data-role=record-item]');
  await page.waitForSelector('[data-role=feedback]', { timeout: 20000 });
  const heard = await page.locator('[data-role=heard]').textContent();
  const head = await page.locator('[data-role=feedback]').getAttribute('data-status').catch(() => null);
  const e = await last(); const c1 = await counters();
  assert(heard === `“${en}”`, `ouviu ${heard} (esperado ${en})`);
  assert(c1.gum === c0.gum && e.engine === 'online' && e.verdict.code === 'ok' && e.source.startsWith('#/dphase'), JSON.stringify({ gum: c1.gum - c0.gum, v: e.verdict, src: e.source }));
  return { item: en, ouviu: heard, status: head };
});

await check('O04', 'Parar no meio da frase (só parciais): o último parcial não se perde e é entregue', async () => {
  await fresh('#/lab?sentence=R01-B1-S1');
  await script({ kind: 'interim', text: SENT, utterances: 1 });
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(700);
  await page.locator('.rec-btn').click();
  const r = await labResult();
  const e = await last();
  assert(r.text.includes('Transcrição: “') && e.finals === 0 && e.partials === 2 && e.delivered && e.events.some((x) => x.e === 'parcial aproveitado'), `${r.state} ${JSON.stringify(e.verdict)}`);
  return { tela: r.state, fim: e.endReason };
});

await check('O05', 'Sem resultado (iniciou e não ouviu — o sintoma do aparelho): mensagem técnica explícita, sem nota; não é erro do aluno; diagnóstico “3”', async () => {
  await fresh('#/lab?sentence=R01-B1-S1');
  await script({ kind: 'silent' });
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(1200);
  await page.locator('.rec-btn').click();
  const r = await labResult();
  const e = await last();
  assert(r.state === 'error' && /não devolveu texto/.test(r.text) && /não conta como erro seu/.test(r.text), `${r.state}: ${r.text.slice(0, 160)}`);
  assert(await page.locator('.target-wrap .w[data-state="needs_practice"]').count() === 0, 'palavras marcadas como erro do aluno');
  assert(e.verdict.code === '3', JSON.stringify(e.verdict));
  return { tela: r.state, diagnóstico: e.verdict.text };
});

await check('O06', 'Erro do serviço (rede): a tentativa termina sem esperar; mensagem com o motivo; sem troca para o Moonshine', async () => {
  await fresh('#/lab?sentence=R01-B1-S1');
  await page.evaluate(() => { window.__asrW = 0; });
  await script({ kind: 'network' });
  const t0 = Date.now();
  await page.locator('.rec-btn').click();
  const r = await labResult();
  const e = await last();
  assert(Date.now() - t0 < 6000, `demorou ${Date.now() - t0} ms`);
  assert(r.state === 'error' && /falha de rede do serviço de reconhecimento/.test(r.text) && /não conta como erro seu/.test(r.text), `${r.state}: ${r.text.slice(0, 200)}`);
  assert(e.error === 'network' && e.endReason === 'erro:network', JSON.stringify(e));
  assert(await page.getByRole('button', { name: 'Gravar novamente' }).count() >= 1 && await page.getByRole('button', { name: 'Tentar de novo' }).count() === 0, 'ação de nova tentativa errada');
  return { ms: Date.now() - t0, motivo: e.error };
});

await check('O07', 'O reconhecimento não inicia (sem eventos): encerra em 6 s com diagnóstico “2”, sem esperar o limite de 2 min', async () => {
  await fresh('#/lab?sentence=R01-B1-S1');
  await script({ kind: 'nostart' });
  await page.locator('.rec-btn').click();
  const r = await labResult();
  const e = await last();
  assert(e.verdict.code === '2' && /não iniciou/.test(e.endReason), JSON.stringify(e.verdict) + e.endReason);
  assert(r.state === 'error', r.state);
  return { diagnóstico: e.verdict.text };
});

await check('O08', 'start() recusado (lança): erro explícito, diagnóstico “2”', async () => {
  await fresh('#/lab?sentence=R01-B1-S1');
  await script({ kind: 'throw' });
  await page.locator('.rec-btn').click();
  const r = await labResult();
  const e = await last();
  assert(e.verdict.code === '2' && e.startError === 'start:InvalidStateError' && r.state === 'error', JSON.stringify(e.verdict));
  return { diagnóstico: e.verdict.text };
});

await check('O09', 'Tentativas consecutivas e cancelamento: resultado tardio de uma sessão anterior não contamina a atual; uma sessão por vez', async () => {
  await fresh('#/lab?sentence=R01-B1-S1');
  await script({ kind: 'silent' });
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(300);
  // a tela fecha no meio da tentativa (troca de atividade): a sessão é abortada
  const before = await counters();
  await page.evaluate(() => window.DRG_APP.go('#/settings'));
  await page.waitForTimeout(400);
  const after = await counters();
  // um resultado “atrasado” do reconhecedor antigo chega agora: tem que ser ignorado
  await page.evaluate(() => { const old = window.__srLive[window.__srLive.length - 1]; old.ended = false; old.res('stale words from before', true); old.ended = true; });
  const mark = await page.evaluate(() => window.__srLive.length); // só as sessões criadas a partir daqui
  const cancelled = await last();
  await page.goto(BASE + '#/lab?sentence=R01-B1-S1'); await page.waitForTimeout(500);
  await script({ kind: 'speak', text: SENT, utterances: 1 });
  await page.locator('.rec-btn').click();
  const r = await labResult();
  const e = await last();
  assert(after.aborts > before.aborts, 'a sessão não foi abortada ao sair da tela');
  assert(cancelled.cancelled && cancelled.words === 0 && cancelled.verdict.code === 'cancelada', JSON.stringify(cancelled.verdict) + cancelled.words);
  assert(!r.text.includes('stale') && r.text.includes(`Transcrição: “${SENT.slice(0, 20)}`) && e.id !== cancelled.id, r.text.slice(0, 160));
  await page.waitForTimeout(200);
  const live = await page.evaluate((m) => window.__srLive.slice(m).filter((x) => !x.ended).length, mark);
  assert(live === 0, `${live} sessões ainda abertas depois da tentativa`);
  return { abortadas: after.aborts - before.aborts, cancelada: cancelled.verdict.text, atual: e.verdict.code };
});

await check('O10', 'Nova tentativa enquanto outra está aberta: a anterior é cancelada antes (nunca duas sessões)', async () => {
  await page.evaluate(() => window.DRG_APP.flush());
  const out = await page.evaluate(async () => {
    window.__sr = { kind: 'silent' };
    const mark = window.__srLive.length; // só as sessões deste teste
    const sp = window.DRG_APP.speech;
    const a = await sp.listen({ silenceMs: 1800 });
    window.__sr = { kind: 'speak', text: 'second attempt', utterances: 1 };
    const b = await sp.listen({ silenceMs: 1800 });
    const ra = await a.stopped; const rb = await b.stopped;
    const ta = await sp.transcribe(ra.blob).then((x) => x.text, (e) => `erro:${e.code}`);
    const tb = await sp.transcribe(rb.blob).then((x) => x.text, (e) => `erro:${e.code}`);
    await new Promise((r) => setTimeout(r, 200));
    return { ta, tb, open: window.__srLive.slice(mark).filter((x) => !x.ended).length, sessoes: window.__srLive.length - mark };
  });
  assert(out.ta === 'erro:cancelled' && out.tb === 'second attempt' && out.open === 0, JSON.stringify(out));
  return out;
});

await check('O11', 'Diagnóstico integrado (Ajustes → Áudio): frase real pelo mesmo caminho; microfone, início, resultado, entrega e motor = modo', async () => {
  await fresh('#/settings');
  await page.waitForSelector('[data-role=speech-check-start]');
  await script({ kind: 'speak', text: 'I wake up at five take a shower and brush my teeth', utterances: 1 });
  const c0 = await counters();
  await page.click('[data-role=speech-check-start]');
  await page.waitForSelector('[data-role=speech-check-verdict]', { timeout: 20000 });
  const items = await page.$$eval('[data-role=speech-check-list] li', (ls) => ls.map((l) => `${l.dataset.ok}|${l.textContent}`));
  const v = await page.locator('[data-role=speech-check-verdict]').textContent();
  const e = await last(); const c1 = await counters();
  assert(items.length === 5 && items.every((x) => x.startsWith('true|')), items.join(' / '));
  assert(/\[ok\]/.test(v) && e.source === 'diagnóstico (Ajustes → Áudio)' && c1.gum === c0.gum, v + e.source);
  // falha: o mesmo painel mostra onde parou
  await script({ kind: 'silent' });
  await page.click('[data-role=speech-check-start]');
  await page.waitForTimeout(800);
  await page.click('[data-role=speech-check-start]');
  await page.waitForSelector('[data-role=speech-check-verdict]', { timeout: 20000 });
  const v2 = await page.locator('[data-role=speech-check-verdict]').textContent();
  const bad = await page.$$eval('[data-role=speech-check-list] li[data-ok=false]', (ls) => ls.map((l) => l.textContent.split(':')[0]));
  assert(/\[3\]/.test(v2) && bad.includes('❌ Resultado chegou'), v2 + bad.join(','));
  return { ok: v.trim(), falha: v2.trim() };
});

await check('O12', 'Registro copiável: origem, motor, eventos, contagens, motivo do fim e diagnóstico — sem o texto falado', async () => {
  const rep = await page.evaluate(() => window.DRG_APP.speech.logReport());
  writeFileSync(join(OUT, 'registro.txt'), rep);
  assert(/origem: #\/lab/.test(rep) && /origem: #\/dphase/.test(rep) && /resultado: \[ok\]/.test(rep) && /resultado: \[3\]/.test(rep) && /resultado: \[2\]/.test(rep), rep.slice(0, 400));
  assert(/parciais: 2 · finais: 1/.test(rep) && /fim: silêncio/.test(rep) && /audiostart@/.test(rep), 'campos ausentes');
  assert(!rep.includes(SENT) && !rep.includes('I usually wake up') && !rep.includes('second attempt'), 'o texto falado apareceu no registro');
  return `${rep.split('\n').length} linhas`;
});

await check('O13', 'Sem erros de página', async () => { assert(!errors.length, errors.join(' | ')); return []; });

await ctx.close(); server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.status === 'aprovado').length;
console.log(`${ok}/${results.length} aprovados`);
process.exit(ok === results.length ? 0 : 1);
