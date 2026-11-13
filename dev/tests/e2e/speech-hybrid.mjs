// Motor de fala central (js/audio/speech.js): online do navegador primeiro, Moonshine do aparelho como alternativa.
// Uso: node tests/e2e/speech-hybrid.mjs <pasta-do-site> <caminho-base> <wav-do-microfone> [pasta-de-evidências]
//   <wav-do-microfone>: gravação com “different teams” (ex.: different-teams__mic.wav do diagnóstico de voz, voz sintética).
//
// REAL: app construído, gravação (MediaRecorder com o microfone falso do Chromium), Moonshine no aparelho, avaliadores,
// telas (diálogos fase 1, Speaking Lab, prática de palavra, resposta livre), consentimento, armazenamento.
// SIMULADO: o reconhecimento ONLINE do navegador (webkitSpeechRecognition falso: o Chromium de teste não tem serviço
// de fala) e a falta de internet (navigator.onLine = false via setOffline). Não comprova o serviço real do Android.
// etapa 2 do formato em camadas (john-p1-e01, 2026-11-13): unidade U22 “different teams” (mesmo áudio do antigo item v05); etapa 1 semeada como pré-requisito
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const MIC = resolve(process.argv[4] || '');
const OUT = resolve(process.argv[5] || join(ROOT, 'evidence/speech-hybrid'));
if (!process.argv[4] || !existsSync(MIC)) { console.error('wav do microfone ausente'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const PORT = 8828, BASE = `http://localhost:${PORT}${BASE_PATH}`;
const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); await page.screenshot({ path: join(OUT, `${id}-falha.png`), fullPage: true }).catch(() => {}); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

// reconhecimento online SIMULADO, controlado por window.__sr = { mode: 'ok' | 'network' | 'silent', text }
const FAKE_SR = () => {
  window.__srMade = []; window.__gum = 0;
  const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia = (c) => { window.__gum++; return gum(c); };
  class FakeSR {
    constructor() { window.__srMade.push(this); this.lang = ''; this.continuous = null; this.started = false; this.aborted = false; this.arg = undefined; }
    _cfg() { return window.__sr || { mode: 'ok', text: '' }; }
    start(arg) {
      this.started = true; this.arg = arg; const c = this._cfg(); const m = c.mode;
      if (m === 'silent') return;
      setTimeout(() => { this.onstart && this.onstart(); this.onaudiostart && this.onaudiostart(); }, 20);
      if (m === 'network') setTimeout(() => { this.onerror && this.onerror({ error: 'network' }); this.onend && this.onend(); }, 60);
      if (m === 'denied') setTimeout(() => { this.onerror && this.onerror({ error: 'not-allowed' }); this.onend && this.onend(); }, 40); // microfone negado ao reconhecimento
      // 1ª sessão: “no-speech” (aluno ainda não falou) e fim; a sessão reiniciada funciona
      if (m === 'nospeech-first' && window.__srMade.filter((x) => x.started).length === 1) setTimeout(() => { this.onerror && this.onerror({ error: 'no-speech' }); this.onend && this.onend(); }, 80);
    }
    stop() {
      const { mode, text, delay } = this._cfg();
      window.__trackAtStop = this.arg && this.arg.readyState;
      if (mode === 'ok' || mode === 'slow' || mode === 'nospeech-first') setTimeout(() => { const alt = { transcript: text, confidence: 0.92 }; const r = [alt]; r.isFinal = true; this.onresult && this.onresult({ resultIndex: 0, results: [r] }); this.onend && this.onend(); }, mode === 'slow' ? (delay || 7000) : 30);
      else if (mode !== 'network' && mode !== 'denied') setTimeout(() => { this.onend && this.onend(); }, 10);
    }
    abort() { this.aborted = true; setTimeout(() => { this.onend && this.onend(); }, 5); }
  }
  window.webkitSpeechRecognition = FakeSR; delete window.SpeechRecognition;
};

let server = await serve(SITE, PORT);
const PROFILE = join(OUT, '.profile'); rmSync(PROFILE, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', permissions: ['microphone', 'clipboard-read', 'clipboard-write'],
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', `--use-file-for-fake-audio-capture=${MIC}`] });
await ctx.addInitScript(FAKE_SR);
const page = ctx.pages()[0] || await ctx.newPage();
const errors = []; page.on('pageerror', (e) => errors.push(e.message));
const setSR = (v) => page.evaluate((x) => { window.__sr = x; }, v);
const counts = () => page.evaluate(() => ({ sr: window.__srMade.length, gum: window.__gum }));
const lastAttempt = () => page.evaluate(async () => {
  const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
  const st = await new Promise((r) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => r(t.result); });
  const all = Object.values(((st || {}).acts || {})['john-p1-e01']?.attempts || {}).sort((a, b) => a.createdAt - b.createdAt);
  const a = all[all.length - 1]; return a ? { status: a.status, score: a.score, asr: a.evidence && a.evidence.asr } : null;
});

await page.goto(BASE); await page.waitForFunction(() => window.DRG_APP && window.DRG_APP.state);
await page.evaluate(async () => { const A = window.DRG_APP; A.state.welcomed = true; await A.chooseCharacter('lucas'); await A.asr.local.install(); });
await page.evaluate(async () => { // 3 audições do item “different teams” (libera o botão de gravar da fase 1)
  const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
  const st = { v: 1, acts: { 'john-p1-e01': { attempts: Object.fromEntries(Array.from({ length: 32 }, (_, i) => { const id = 'john-p1-e01-u' + String(i + 1).padStart(2, '0'); return ['seed-' + id, { attemptId: 'seed-' + id, phase: 'u-write', itemId: id, status: 'passed', score: 100, createdAt: 1 }]; })), listens: { 'u-speak:john-p1-e01-u22': 3 }, rounds: [], notes: '', order: {}, startedAt: 1 } }, consent: { online: false, at: null } };
  await new Promise((r) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(st, 'dialogues'); t.oncomplete = r; });
});
const openPhase1 = async () => { await page.goto(BASE + '#/dphase/john-p1-e01?p=u-speak'); await page.reload(); await page.waitForSelector('[data-role=item-chips]'); await page.click('[data-role=item-chips] [data-item="john-p1-e01-u22"]'); };
/** Uma tentativa na fase 1 (botão real → gravação real → motor central → avaliador). consent: 'online' | 'local' | null */
const phase1Attempt = async ({ consent = null, ms = 3500 } = {}) => {
  // a tela mostra o resultado da última tentativa ao abrir o item (remodelagem de 2026-11-12): só vale o desta gravação
  await page.evaluate(() => document.querySelectorAll('[data-role=feedback]').forEach((e) => e.remove()));
  await page.click('[data-role=record-item]');
  if (consent) { await page.waitForSelector('[data-role=speech-consent]', { timeout: 5000 }); await page.click(`[data-role=speech-consent] [data-choice=${consent}]`); }
  await page.waitForSelector('[data-role=stop]', { timeout: 10000 });
  await page.waitForTimeout(ms);
  if (await page.locator('[data-role=stop]').count()) await page.click('[data-role=stop]').catch(() => {}); // a captura pode ter encerrado sozinha (fim de fala automático)
  await page.waitForSelector('[data-role=feedback]', { timeout: 120000 });
  await page.waitForTimeout(300);
  return { ...(await lastAttempt()), heard: await page.textContent('[data-role=heard]').catch(() => null), engineLine: await page.textContent('[data-role=asr-engine]').catch(() => null) };
};

await check('H00', 'Fechar o pedido de consentimento sem escolher: grava pelo aparelho e NÃO guarda recusa (pergunta de novo)', async () => {
  await openPhase1();
  await setSR({ mode: 'ok', text: 'different teams' });
  await page.click('[data-role=record-item]');
  await page.waitForSelector('[data-role=speech-consent]');
  await page.mouse.click(10, 10); // fora da folha
  await page.waitForSelector('[data-role=stop]', { timeout: 10000 }); await page.waitForTimeout(3500); if (await page.locator('[data-role=stop]').count()) await page.click('[data-role=stop]').catch(() => {});;
  await page.waitForSelector('[data-role=feedback]', { timeout: 120000 });
  const saved = await page.evaluate(() => window.DRG_APP.state.settings.onlineSpeech);
  const a = await lastAttempt();
  assert(saved === undefined && a.asr.engine === 'local-model', JSON.stringify({ saved, a }));
  return { consentimento: 'não decidido', motor: a.asr.engine };
});

await check('H01', 'Primeira gravação com internet: pede o consentimento UMA vez, antes do microfone; aceito → online (o reconhecedor é o dono do microfone, sem captura própria); resultado vai ao avaliador da fase 1', async () => {
  await openPhase1();
  await setSR({ mode: 'ok', text: 'different teams' });
  const c0 = await counts();
  const r = await phase1Attempt({ consent: 'online' });
  const c1 = await counts();
  const saved = await page.evaluate(() => window.DRG_APP.state.settings.onlineSpeech);
  assert(saved === true, `consentimento ${saved}`);
  assert(r.status === 'passed' && r.asr.engine === 'online', JSON.stringify(r)); // motor pela evidência da tentativa (a linha técnica saiu do cartão na remodelagem de 2026-11-12)
  assert(c1.sr - c0.sr === 1 && c1.gum - c0.gum === 0, `uma escuta online e NENHUMA captura própria: ${JSON.stringify({ c0, c1 })}`);
  const sr = await page.evaluate(() => { const x = window.__srMade[window.__srMade.length - 1]; return { track: x.arg instanceof MediaStreamTrack ? x.arg.kind : String(x.arg), continuous: x.continuous }; });
  assert(sr.track === 'undefined' && sr.continuous === false, `start() sem faixa / configuração: ${JSON.stringify(sr)}`);
  return { status: r.status, motor: r.asr.engine, ouviu: r.heard, ...sr };
});

await check('H02', 'Modo online com falha de rede → SEM troca para o Moonshine (seletor de Ajustes): inconclusiva, não reprova; sem novo pedido de consentimento', async () => {
  await openPhase1(); await setSR({ mode: 'network' });
  const c0 = await counts();
  const r = await phase1Attempt();
  const c1 = await counts();
  assert(!(await page.locator('[data-role=speech-consent]').count()), 'consentimento perguntado de novo');
  assert(!r.asr.engine && r.status === 'inconclusive' && /falha de rede do serviço de reconhecimento/.test(await page.textContent('[data-role=feedback]')), JSON.stringify(r));
  assert(c1.sr - c0.sr === 1 && c1.gum - c0.gum === 0, `sem captura própria: ${JSON.stringify({ c0, c1 })}`);
  return { status: r.status, motor: r.asr.engine, motivo: r.asr.fallbackReason, ouviu: r.heard };
});

await check('H03', 'Modo online, serviço mudo → aviso interno em 6 s; inconclusiva (sem Moonshine); a tela não trava', async () => {
  await openPhase1(); await setSR({ mode: 'silent' });
  const r = await phase1Attempt({ ms: 6500 });
  assert(!r.asr.engine && r.status === 'inconclusive' && /não respondeu|sem texto/.test(await page.textContent('[data-role=feedback]')), JSON.stringify(r));
  return { motor: r.asr.engine, motivo: r.asr.fallbackReason };
});

await check('H03b', 'Resultado online demorado (7 s depois de parar): espera o fim natural, NÃO troca para o Moonshine', async () => {
  await openPhase1(); await setSR({ mode: 'slow', text: 'different teams', delay: 7000 });
  const r = await phase1Attempt();
  assert(r.asr.engine === 'online' && r.status === 'passed', JSON.stringify(r));
  return { motor: r.asr.engine };
});

await check('H03c', '“no-speech” no começo da gravação: a escuta online recomeça e entrega o texto', async () => {
  await openPhase1(); await setSR({ mode: 'nospeech-first', text: 'different teams' });
  const c0 = await counts();
  const r = await phase1Attempt();
  const c1 = await counts();
  assert(r.asr.engine === 'online' && r.status === 'passed' && c1.sr - c0.sr === 2 && c1.gum - c0.gum === 0, JSON.stringify({ r, c0, c1 }));
  return { motor: r.asr.engine, sessões: c1.sr - c0.sr, capturas: c1.gum - c0.gum };
});

await check('H04', 'Modo online sem internet (navigator.onLine = false) → nenhuma escuta online; inconclusiva (sem Moonshine); gravação normal', async () => {
  await openPhase1(); await setSR({ mode: 'ok', text: 'different teams' });
  // só o estado “sem internet” do navegador (a decisão do motor); o Moonshine sem rede real é coberto por voice/pwa
  await page.evaluate(() => { Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false }); });
  const c0 = await counts();
  const r = await phase1Attempt();
  const c1 = await counts();
  await page.evaluate(() => { delete navigator.onLine; });
  assert(c1.sr === c0.sr && !r.asr.engine && r.status === 'inconclusive' && /sem internet/.test(await page.textContent('[data-role=feedback]')), JSON.stringify({ r, c0, c1 }));
  return { motor: r.asr.engine, motivo: r.asr.fallbackReason };
});

await check('H05', 'Modo Moonshine (Ajustes) → nenhuma escuta online; só o Moonshine', async () => {
  await page.evaluate(() => { window.DRG_APP.state.settings.onlineSpeech = false; return window.DRG_APP.flush(); });
  await openPhase1(); await setSR({ mode: 'ok', text: 'different teams' });
  const c0 = await counts();
  const r = await phase1Attempt();
  const c1 = await counts();
  await page.evaluate(() => { window.DRG_APP.state.settings.onlineSpeech = true; return window.DRG_APP.flush(); });
  assert(c1.sr === c0.sr && r.asr.engine === 'local-model' && !r.asr.fallbackReason, JSON.stringify({ r, c0, c1 }));
  return { motor: r.asr.engine, motivo: r.asr.fallbackReason };
});

await check('H06', 'Idioma: gravação usa en-GB por padrão; o motor aceita en-US', async () => {
  const lang = await page.evaluate(async () => { const c = await window.DRG_APP.speech.listen(); const l = window.__srMade[window.__srMade.length - 1].lang; c.cancel(); await c.stopped; return l; });
  const us = await page.evaluate(async () => { const c = await window.DRG_APP.speech.listen({ lang: 'en-US' }); const l = window.__srMade[window.__srMade.length - 1].lang; c.cancel(); await c.stopped; return l; });
  assert(lang === 'en-GB' && us === 'en-US', `${lang} / ${us}`);
  return { padrão: lang, us };
});

await check('H07', 'Cancelar: sair da tela durante a gravação encerra a gravação E a escuta online', async () => {
  await openPhase1(); await setSR({ mode: 'ok', text: 'different teams' });
  await page.click('[data-role=record-item]'); await page.waitForSelector('[data-role=stop]');
  await page.evaluate(() => { location.hash = '#/dialogues'; });
  await page.waitForTimeout(400);
  const ab = await page.evaluate(() => window.__srMade[window.__srMade.length - 1].aborted);
  assert(ab === true, 'escuta online não foi abortada');
  return 'abortada';
});

await check('H08', 'Speaking Lab (frase): texto online vai à avaliação por palavra; prática de palavra também pelo motor central', async () => {
  await page.goto(BASE + '#/lab?sentence=R01-B1-S1'); await page.reload(); await page.waitForSelector('.rec-btn');
  await setSR({ mode: 'ok', text: 'I wake up at 5 a.m. take a shower and brush my' }); // depois do recarregamento
  await page.locator('.rec-btn').click(); await page.waitForTimeout(4000); if (await page.locator('.rec-btn.on').count()) await page.locator('.rec-btn').click(); // pode ter encerrado sozinha
  await page.waitForSelector('.fb[data-state="result"], .fb[data-state="inconclusive"]', { timeout: 60000 });
  const words = await page.$$eval('.target-text .w', (els) => els.map((e) => `${e.textContent}:${e.dataset.state}`));
  const det = await page.textContent('.fb');
  assert(words.filter((w) => w.endsWith(':good')).length >= 9 && /teeth:needs_practice/.test(words.join(' ')) && /online do navegador/.test(det), JSON.stringify(words));
  await setSR({ mode: 'ok', text: 'Teeth.' });
  await page.locator('.pchip', { hasText: 'teeth' }).first().click(); // a palavra a praticar
  await page.getByRole('button', { name: 'Praticar esta palavra' }).first().click();
  await page.waitForSelector('[data-role=wp-stop]'); await page.waitForTimeout(1200); if (await page.locator('[data-role=wp-stop]').count()) await page.locator('[data-role=wp-stop]').click().catch(() => {});
  await page.waitForSelector('[data-role=wp-result]', { timeout: 30000 });
  const wp = await page.getAttribute('[data-role=wp-result]', 'data-result');
  assert(wp === 'match', `prática de palavra: ${wp}`);
  return { verdes: words.filter((w) => w.endsWith(':good')).length, praticar: 'teeth', palavra: wp };
});

await check('H09', 'Resposta livre (pergunta do Lab): texto online vai à avaliação contextual', async () => {
  await page.goto(BASE + '#/lab?q=R01.Q1'); await page.reload(); await page.waitForSelector('.rec-btn');
  await setSR({ mode: 'ok', text: 'I usually wake up at five in the morning' }); // depois do recarregamento
  await page.locator('.rec-btn').click(); await page.waitForTimeout(4000); if (await page.locator('.rec-btn.on').count()) await page.locator('.rec-btn').click(); // pode ter encerrado sozinha
  await page.waitForSelector('.fa-transcript', { timeout: 60000 });
  const t = await page.textContent('.fa-transcript');
  assert(/I usually wake up at five in the morning/.test(t), t.slice(0, 160));
  return 'transcrição online na avaliação';
});

await check('H10', 'Ajustes → Áudio: opção do reconhecimento online e diagnóstico atualizado', async () => {
  await page.goto(BASE + '#/settings'); await page.reload(); await page.waitForTimeout(1500);
  const txt = await page.textContent('#view');
  assert(/Reconhecimento de voz/.test(txt) && /Moonshine \(aparelho\)/.test(txt) && /Reconhecimento de voz \(modo\)\s*online \(navegador\)/.test(txt), txt.match(/Reconhecimento de voz \(modo\)[^·]*/)?.[0] || 'sem linha');
  await page.click('[data-role=speech-log-copy]');
  const rep = await page.evaluate(() => navigator.clipboard.readText());
  assert(/captura: reconhecimento online \(dono do microfone\)/.test(rep) && /reconhecimento:start\(\)@/.test(rep) && /tentativa encerrada@/.test(rep) && /motor: online/.test(rep) && /erro: network/.test(rep) && !/different teams/i.test(rep), rep.slice(0, 400));
  return 'opção + diagnóstico + registro (sem texto falado)';
});

record('H11', 'Sem erros de página', !errors.length, errors.slice(0, 5));
await ctx.close();
// microfone negado: contexto sem permissão nem aceite automático
{
  const p2 = join(OUT, '.profile-denied'); rmSync(p2, { recursive: true, force: true });
  const c2 = await chromium.launchPersistentContext(p2, { serviceWorkers: 'block', args: ['--use-fake-device-for-media-stream'] });
  await c2.addInitScript(FAKE_SR);
  const pg = c2.pages()[0] || await c2.newPage();
  await pg.goto(BASE); await pg.waitForFunction(() => window.DRG_APP && window.DRG_APP.state);
  // modo Moonshine: a gravação (getUserMedia) é negada → mensagem clara, nenhuma escuta online
  await pg.evaluate(async () => { const A = window.DRG_APP; A.state.welcomed = true; A.state.settings.onlineSpeech = false; await A.chooseCharacter('lucas'); await A.flush(); });
  await pg.goto(BASE + '#/lab?sentence=R01-B1-S1'); await pg.reload(); await pg.waitForSelector('.rec-btn');
  await pg.locator('.rec-btn').click(); await pg.waitForTimeout(1500);
  const msg = await pg.textContent('#view');
  const made = await pg.evaluate(() => window.__srMade.length);
  record('H12', 'Microfone negado (modo Moonshine): mensagem clara, nenhuma escuta online iniciada', /microfone/i.test(msg) && made === 0, { escutas: made, mensagem: (msg.match(/[^.]*microfone[^.]*\./i) || [''])[0].slice(0, 120) });
  // modo online: o microfone é do reconhecimento; negado, o serviço responde “not-allowed” → motivo explícito
  await pg.evaluate(async () => { const A = window.DRG_APP; A.state.settings.onlineSpeech = true; window.__sr = { mode: 'denied' }; await A.flush(); });
  await pg.goto(BASE + '#/settings'); await pg.goto(BASE + '#/lab?sentence=R01-B1-S1'); await pg.waitForSelector('.rec-btn');
  await pg.evaluate(() => { window.__sr = { mode: 'denied' }; });
  await pg.locator('.rec-btn').click();
  await pg.waitForSelector('.fb[data-state="error"]', { timeout: 15000 }).catch(() => {});
  const msg2 = await pg.textContent('#view');
  record('H12b', 'Microfone negado (modo online): o reconhecimento responde “not-allowed” e a tela explica (não é erro do aluno)', /microfone bloqueado para o reconhecimento/.test(msg2) && /não conta como erro seu/.test(msg2), (msg2.match(/O reconhecimento online[^.]*\./) || [''])[0].slice(0, 160));
  await c2.close();
}
server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
