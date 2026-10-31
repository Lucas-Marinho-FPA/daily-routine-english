// Testes de ponta a ponta (Playwright + Chromium, viewport de celular, microfone falso).
// Uso: node tests/e2e/run.mjs [pasta-de-evidências]
// Ambiente SIMULADO: não substitui o teste no Galaxy S25+ (ver docs/TEST_REPORT.md).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const APP = join(ROOT, 'app');
const OUT = process.argv[2] || join(ROOT, 'docs/evidence/e2e');
mkdirSync(OUT, { recursive: true });
const PORT = 8790;
const BASE = `http://localhost:${PORT}/`;
const content = JSON.parse(readFileSync(join(ROOT, 'content/build/content.json'), 'utf8'));

const results = [];
const record = (id, name, status, evidence) => { results.push({ id, name, status, evidence }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof evidence === 'string' ? evidence : JSON.stringify(evidence)}`); };
const check = async (id, name, fn) => {
  try { const ev = await fn(); record(id, name, 'aprovado', ev ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

// Reconhecimento de fala simulado (o Chromium headless de Linux não tem backend de fala).
const ASR_MOCK = `
  class FakeSR {
    constructor() { this.processLocally = false; this.lang = 'en-GB'; }
    start() { setTimeout(() => { const alt = { transcript: window.__asrText || 'I wake up at five a m take a shower and brush my teeth', confidence: 0.86 };
      const res = [alt]; this.onresult && this.onresult({ results: [res] }); this.onend && this.onend(); }, 150); }
    abort() {} stop() {}
  }
  FakeSR.prototype.processLocally = false;
  FakeSR.available = async () => (localStorage.getItem('asrOff') ? 'unavailable' : 'available');
  window.SpeechRecognition = FakeSR; window.webkitSpeechRecognition = FakeSR;
`;

// Sonda de áudio: registra todo elemento de mídia que tocou, para saber o que está soando agora.
const AUDIO_PROBE = `
  window.__media = new Set(); window.__plays = [];
  const op = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { window.__media.add(this); window.__plays.push({ src: (this.currentSrc || this.src || '').slice(0, 60), t: performance.now() }); return op.call(this); };
  window.__audible = () => [...window.__media].filter((m) => !m.paused && !m.ended).map((m) => (m.currentSrc || m.src || '').replace(location.origin, '').slice(0, 60));
  window.__speaking = () => ('speechSynthesis' in window) && speechSynthesis.speaking;
`;

const server = await serve(APP, PORT);
const browser = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ['microphone'], acceptDownloads: true });
await ctx.addInitScript(ASR_MOCK);
await ctx.addInitScript(AUDIO_PROBE);
const page = await ctx.newPage();
const external = [];
const pageErrors = [];
page.on('request', (r) => { const u = r.url(); if (!u.startsWith(BASE) && !/^(blob|data):/.test(u)) external.push(u); });
page.on('pageerror', (e) => pageErrors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') pageErrors.push('console: ' + m.text()); });

const state = () => page.evaluate(() => JSON.parse(JSON.stringify(window.DRG_APP.state)));
const go = async (hash) => {
  // mesma URL não dispara hashchange: nesse caso força a rota pelo próprio app
  const same = page.url() === BASE + hash || (hash === '' && page.url() === BASE);
  if (same) await page.evaluate((h) => window.DRG_APP.go(h || '#/'), hash);
  else await page.goto(BASE + hash);
  await page.waitForTimeout(400);
};
const shot = (name) => page.screenshot({ path: join(OUT, name + '.png') });
const waitResult = async () => {
  try { await page.waitForSelector('.fb[data-state="result"]', { timeout: 8000 }); } catch (e) {
    const fb = await page.evaluate(() => { const f = document.querySelector('.fb'); return f ? `${f.dataset.state}: ${f.textContent.slice(0, 160)}` : 'sem .fb'; });
    throw new Error(`resultado não apareceu (${fb}) · settings=${JSON.stringify(await page.evaluate(() => window.DRG_APP.state.settings))}`);
  }
};


/** Responde ao exercício atual. mode: 'right' | 'wrong' */
async function answer(mode = 'right') {
  const ex = await page.evaluate(() => {
    const e = window.DRG_APP.debugExercise;
    if (!e) return null;
    const pick = (o) => o && JSON.parse(JSON.stringify(o));
    return { type: e.type, item: pick(e.item && { en: e.item.en, pt: e.item.pt }), targets: e.targets, target: e.target, pieces: e.pieces, shuffled: e.shuffled,
      sentences: e.sentences && e.sentences.map((s) => s.id), shuffledSeq: e.shuffled && e.shuffled.id ? null : (e.type === 'seq' ? e.shuffled.map((s) => s.id) : null),
      options: e.options, verb: e.verb && e.verb.third, pairs: e.type === 'pairs' ? e.items.map((i) => ({ en: i.en, pt: i.pt })) : null };
  });
  if (!ex) throw new Error('sem exercício');
  const bar = page.locator('.actionbar');
  const clickBar = (name) => bar.getByRole('button', { name, exact: true }).click();
  switch (ex.type) {
    case 'learn': await clickBar('Próximo'); return ex.type;
    case 'mc': {
      const opt = mode === 'right' ? ex.options.find((o) => o.correct) : ex.options.find((o) => !o.correct);
      await page.locator('.options .option', { hasText: opt.pt }).first().click();
      break;
    }
    case 'recall': case 'cloze': case 'vb3': {
      const val = mode === 'right' ? (ex.type === 'cloze' ? ex.target : ex.type === 'vb3' ? ex.verb : ex.targets[0]) : 'banana split';
      await page.locator('.ex-area input').first().fill(val);
      await clickBar('Verificar');
      break;
    }
    case 'write': {
      await page.locator('.ex-area textarea').first().fill(mode === 'right' ? ex.targets[0] : 'I like turtles.');
      await clickBar('Verificar');
      break;
    }
    case 'order': {
      const seqOrder = mode === 'right' ? ex.pieces : [...ex.pieces].reverse();
      const used = new Set();
      for (const piece of seqOrder) {
        const idx = ex.shuffled.findIndex((p, i) => p === piece && !used.has(i));
        used.add(idx);
        await page.locator('.tiles:not(.answer) .tile').nth(idx).click();
      }
      await clickBar('Verificar');
      break;
    }
    case 'seq': {
      const correct = ex.sentences;
      const order = mode === 'right' ? correct : [...correct].reverse();
      for (const sid of order) {
        const text = content.sentences[sid].en;
        await page.locator('.seq-item', { hasText: text.slice(0, 40) }).first().click();
      }
      await clickBar('Verificar');
      break;
    }
    case 'pairs': {
      for (const p of ex.pairs) {
        await page.locator('.pairs .option.en', { hasText: p.en }).first().click();
        await page.locator('.pairs .option:not(.en)', { hasText: p.pt }).first().click();
      }
      break;
    }
    case 'tell': case 'retell': case 'conv': {
      await page.locator('.ex-area textarea').first().fill(mode === 'right' ? 'I usually wake up at five, take a shower and brush my teeth.' : '');
      await clickBar('Ver modelo e avaliar');
      await page.getByRole('button', { name: mode === 'right' ? 'Consegui' : 'Preciso rever', exact: true }).click();
      return ex.type;
    }
    case 'summary': return 'summary';
    default: throw new Error('tipo desconhecido ' + ex.type);
  }
  await page.waitForTimeout(120);
  await clickBar('Continuar');
  return ex.type;
}

async function runSession(hash, { wrongEvery = 0, max = 60 } = {}) {
  await go(hash);
  const types = [];
  for (let i = 0; i < max; i++) {
    const t = await page.evaluate(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
    if (t === 'summary') break;
    const wrong = wrongEvery && types.filter((x) => x !== 'learn').length % wrongEvery === wrongEvery - 1 && t !== 'learn';
    types.push(await answer(wrong ? 'wrong' : 'right'));
    await page.waitForTimeout(80);
  }
  return types;
}

// ---------------- testes ----------------
await check('T01', 'Abre em localhost e registra o service worker', async () => {
  await go('');
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(async () => { await page.reload(); });
  await page.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 });
  const cached = await page.evaluate(async () => { const keys = await caches.keys(); const c = await caches.open(keys[0]); return (await c.keys()).length; });
  // primeira abertura: sem escolha obrigatória — o Início já orienta, com a história do Lucas como padrão
  const pick = await page.locator('[data-role=character-pick]').count();
  const home = await page.evaluate(() => { const m = /História de (\S+)/.exec((document.querySelector('[data-role=journey-context]') || {}).textContent || ''); return m ? m[1] : null; });
  await shot('01-home');
  assert(cached >= 540, `pré-cache com ${cached} arquivos`);
  assert(pick === 0 && home === 'Lucas', `primeira abertura: escolha=${pick}, história=${home}`);
  return `${cached} arquivos em cache; história inicial: ${home}`;
});

await check('T02', 'Primeira sessão completa (respostas corretas)', async () => {
  const types = await runSession('#/session');
  const s = await state();
  assert(types.length >= 6, `apenas ${types.length} telas`);
  assert(s.xp > 0, 'XP não aumentou');
  await shot('02-summary');
  return { telas: types.length, tipos: [...new Set(types)], xp: s.xp, cartoes: Object.keys(s.cards).length };
});

await check('T03', 'Erros reaparecem na mesma sessão e geram feedback', async () => {
  const before = await state();
  // força revisão: sessão de foco na R01 com erros a cada 3 respostas
  const types = await runSession('#/session?routine=R01', { wrongEvery: 3 });
  const s = await state();
  const lapsed = Object.values(s.cards).filter((c) => c.lapses > 0);
  assert(lapsed.length > 0, 'nenhum erro registrado');
  const retried = s.log.filter((l, i) => s.log.slice(0, i).some((p) => p.k === l.k && p.o === 'bad'));
  assert(retried.length > 0, 'nenhum cartão errado voltou na sessão');
  return { telas: types.length, errados: lapsed.length, repetidosNaSessao: retried.length, xpAntes: before.xp, xpDepois: s.xp };
});

await check('T04', 'Várias sessões desbloqueiam níveis mais altos (recuperar, construir, frases, perguntas)', async () => {
  // simula dias seguintes adiantando o "hoje" via due dos cartões
  for (let d = 0; d < 6; d++) {
    await page.evaluate(() => { const st = window.DRG_APP.state; for (const c of Object.values(st.cards)) c.due -= 7; return window.DRG_APP.flush(); });
    await runSession('#/session?routine=R01');
  }
  const s = await state();
  const skills = [...new Set(Object.keys(s.cards).map((k) => k.split(':')[2]))];
  assert(skills.includes('rcl'), 'sem recuperação ativa');
  return { habilidades: skills, cartoes: Object.keys(s.cards).length, xp: s.xp };
});

await check('T05', 'Exercícios de cada tipo aparecem e podem ser respondidos', async () => {
  const seen = new Set();
  for (let d = 0; d < 8 && seen.size < 9; d++) {
    await page.evaluate(() => { const st = window.DRG_APP.state; for (const c of Object.values(st.cards)) { c.due -= 30; c.box = Math.min(6, c.box + 1); } return window.DRG_APP.flush(); });
    (await runSession('#/session?routine=R01')).forEach((t) => seen.add(t));
  }
  await shot('05-after-many');
  assert(seen.has('mc') && seen.has('recall'), 'faltam tipos básicos');
  return [...seen].sort();
});

await check('T06', 'Progresso persiste após recarregar (sem duplicar XP)', async () => {
  const a = await state();
  await page.reload(); await page.waitForTimeout(800);
  const b = await state();
  assert(a.xp === b.xp, `XP mudou ${a.xp} → ${b.xp}`);
  assert(Object.keys(a.cards).length === Object.keys(b.cards).length, 'cartões diferentes');
  // voltar/avançar não pontua de novo
  await page.goBack(); await page.goForward(); await page.waitForTimeout(500);
  const c = await state();
  assert(c.xp === b.xp, 'XP mudou ao navegar');
  return { xp: b.xp, cartoes: Object.keys(b.cards).length };
});

await check('T07', 'Funciona offline (servidor desligado + rede cortada) e mantém o progresso', async () => {
  const before = await state();
  server.close();
  await ctx.setOffline(true);
  await go('#/stats'); await page.waitForTimeout(600);
  const title = await page.locator('.topbar h1').textContent();
  const after = await state();
  const audio = await page.evaluate(async (key) => { const r = await fetch(`audio/${key}.ogg`, { headers: { Range: 'bytes=0-' } }); return { status: r.status, bytes: (await r.arrayBuffer()).byteLength }; }, content.sentences['R01-B1-S1'].au);
  const types = await runSession('#/session', { max: 40 });
  await shot('07-offline-session');
  assert(after.xp === before.xp, 'progresso diferente offline');
  assert(audio.bytes > 1000, 'áudio não veio do cache');
  return { titulo: title, audio, sessaoOffline: types.length };
});

await check('T08', 'Speaking Lab: gravar, analisar, salvar e recarregar a gravação (offline)', async () => {
  await go('#/lab?sentence=R01-B1-S1');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(2500);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('text=Minha voz', { timeout: 8000 });
  await shot('08-lab-recorded');
  const s = await state();
  assert(s.recordingsMeta['sent:R01-B1-S1'], 'gravação não registrada');
  await page.reload(); await page.waitForTimeout(1500);
  const saved = await page.locator('text=Última gravação salva').count();
  assert(saved > 0, 'gravação não reapareceu após recarregar');
  return 'gravação de ~2,5 s salva no IndexedDB e recarregada';
});

await check('T09', 'Speaking Lab: reconhecimento do Chrome no aparelho (simulado) — consultado só a pedido; gravar avalia sem clique extra', async () => {
  await go('#/lab?sentence=R01-B1-S1');
  await page.getByRole('button', { name: 'Agora não' }).click(); // convite do modelo local
  await page.getByRole('button', { name: /Ver se está disponível/ }).click();
  await page.waitForTimeout(400);
  assert(await page.getByRole('button', { name: /Avaliar minha gravação|Verificar palavras/ }).count() === 0, 'botão manual de avaliação ainda existe');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(1500);
  await page.locator('.rec-btn').click();
  await waitResult();
  const good = await page.locator('.target-wrap .w[data-state="good"]').count();
  const heard = await page.locator('.fb-details').textContent();
  await shot('09-lab-asr');
  assert(good > 0, 'nenhuma palavra reconhecida');
  assert(/Transcrição: “I wake up/.test(heard), heard);
  return `${good} palavras reconhecidas · ${heard.match(/Transcrição: “[^”]{0,50}/)[0]}`;
});


// ---------- feedback de pronúncia inline ----------
const layoutInfo = () => page.evaluate(() => {
  const box = document.querySelector('.target-wrap');
  const spans = [...box.querySelectorAll('.w')];
  const tops = new Set(spans.map((s) => Math.round(s.getBoundingClientRect().top)));
  const parents = new Set(spans.map((s) => s.parentElement));
  return {
    words: spans.length, lines: tops.size, paragraphs: box.querySelectorAll('p').length,
    parentsAreParagraphs: [...parents].every((p) => p.tagName === 'P'), brs: box.querySelectorAll('br').length,
    inline: spans.every((s) => getComputedStyle(s).display === 'inline'),
    texts: [...box.querySelectorAll('p')].map((p) => p.textContent),
    colored: spans.filter((s) => /w-(good|needs_practice|uncertain)/.test(s.className)).length,
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    fontPx: parseFloat(getComputedStyle(box.querySelector('p')).fontSize),
  };
});
const sentences = Object.values(content.sentences);
const shortest = sentences.reduce((a, b) => (b.en.length < a.en.length ? b : a));

await check('T19', 'Inline — estado A: frase curta numa única linha, texto idêntico e sem cores antes de gravar', async () => {
  await go(`#/lab?sentence=${shortest.id}`);
  const L = await layoutInfo();
  assert(L.lines === 1, `${L.lines} linhas para “${shortest.en}”`);
  assert(L.texts[0] === shortest.en, 'texto alterado');
  assert(L.colored === 0, 'há cores antes da avaliação');
  assert(L.inline && L.parentsAreParagraphs && L.brs === 0, 'palavras fora do fluxo inline');
  await shot('19-inline-before');
  return { frase: shortest.en, palavras: L.words, linhas: L.lines };
});

await check('T20', 'Inline — texto longo quebra naturalmente (sem quebra por palavra), espaços/pontuação preservados', async () => {
  const res = {};
  for (const [w, hgt] of [[360, 740], [412, 915]]) {
    await page.setViewportSize({ width: w, height: hgt });
    await go('#/lab?block=R01-B1');
    const L = await layoutInfo();
    const block = content.blocks['R01-B1'];
    assert(L.texts.length === 1 && L.texts[0] === block.en, 'texto do bloco alterado');
    assert(L.lines > 1 && L.lines <= Math.ceil(L.words / 4), `${L.lines} linhas para ${L.words} palavras`);
    assert(L.inline && L.parentsAreParagraphs && L.brs === 0 && !L.overflow, 'layout inválido');
    assert(L.fontPx >= 16, `fonte ${L.fontPx}px`);
    res[`${w}px`] = { palavras: L.words, linhas: L.lines, fontePx: L.fontPx };
  }
  await go('#/lab?routine=R01&full=1');
  const R = await layoutInfo();
  const r1 = content.routines[0];
  assert(R.paragraphs === r1.blocks.length && R.texts.every((t, i) => t === content.blocks[r1.blocks[i]].en), 'rotina completa alterada');
  res.rotinaCompleta = { paragrafos: R.paragraphs, palavras: R.words, linhas: R.lines };
  await page.setViewportSize({ width: 412, height: 915 });
  return res;
});

await check('T21', 'Inline — gravar com reconhecimento local (simulado): cores por palavra, toque explica, nota parcial', async () => {
  await page.evaluate(() => { localStorage.removeItem('asrOff'); window.DRG_APP.state.settings.asrKnown = 'available'; return window.DRG_APP.flush(); });
  await page.reload(); await page.waitForTimeout(600);
  await go('#/lab?sentence=R01-B1-S1');
  await page.waitForTimeout(600);
  await page.evaluate(() => { window.__asrText = 'I wake up at five a m take a shower and brush my tits'; });
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(400);
  const during = await layoutInfo();
  await page.waitForTimeout(2200);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('.w[data-state]', { timeout: 8000 });
  const states = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('.target-wrap .w')].map((s) => [s.textContent, s.dataset.state])));
  assert(during.colored === 0, 'cores durante a gravação');
  assert(states.teeth === 'needs_practice', `teeth=${states.teeth}`);
  assert(states.wake === 'good' && states.shower === 'good' && states['5:00'] === 'good', JSON.stringify(states));
  assert(states.a === 'good' || states.a === 'uncertain', `a=${states.a}`);
  const L = await layoutInfo();
  assert(L.lines <= 3 && L.inline && L.brs === 0, 'fluxo quebrado após colorir');
  await page.locator('.target-wrap .w', { hasText: 'teeth' }).click();
  const detail = await page.locator('.word-detail').textContent();
  assert(/ouviu “tits”/.test(detail) && /Precisa de prática/.test(detail), detail);
  const score = await page.locator('.fb .score-line').textContent();
  const details = await page.locator('.fb-details').textContent();
  assert(/^\d+\/100Avaliação parcial/.test(score), score);
  assert(/Acentuação e entonação[^]*não avaliado/.test(details), 'entonação deveria estar indisponível');
  const chips = await page.locator('.pchip').allTextContents();
  assert(chips.length === 1 && chips[0].trim() === 'teeth', `lista de prática: ${JSON.stringify(chips)}`);
  // gravação e reprodução continuam funcionando
  await page.evaluate(() => {
    window.__played = [];
    const orig = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { const p = orig.call(this); window.__played.push({ src: this.src.slice(0, 5) }); p.then(() => { window.__played.at(-1).ok = true; }).catch((e) => { window.__played.at(-1).err = e.name; }); return p; };
  });
  await page.getByRole('button', { name: 'Minha voz' }).click();
  await page.waitForTimeout(500);
  const playing = await page.evaluate(() => window.__played.some((x) => x.src === 'blob:' && x.ok));
  await shot('21-inline-after');
  assert(playing, 'a própria voz não tocou');
  return { estados: states, nota: score.trim(), praticar: chips, detalhe: detail.slice(0, 90) };
});

await check('T22', 'Inline — sem reconhecimento no aparelho: palavras cinza (não avaliadas) e sem nota geral', async () => {
  await page.evaluate(() => { localStorage.setItem('asrOff', '1'); });
  await page.reload(); await page.waitForTimeout(600);
  await go('#/lab?sentence=R01-B1-S1');
  await page.waitForTimeout(800);
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(2200);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('.w[data-state]', { timeout: 8000 });
  const states = await page.evaluate(() => [...new Set([...document.querySelectorAll('.target-wrap .w')].map((s) => s.dataset.state))]);
  const scores = await page.locator('.score-num').count();
  const note = await page.locator('[data-role=asr-off]').textContent();
  await shot('22-inline-no-asr');
  assert(states.length === 1 && states[0] === 'uncertain', JSON.stringify(states));
  assert(scores === 0, 'nota exibida sem reconhecimento');
  assert(/Análise automática desligada/.test(note), note);
  assert(await page.locator('.pchip').count() === 0, 'lista de prática sem evidência');
  // pergunta: resposta livre — gravar não colore o modelo
  await go('#/lab?q=R01.Q1');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(1500);
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(1500);
  const qColored = (await layoutInfo()).colored;
  assert(qColored === 0, 'pergunta foi avaliada automaticamente');
  await page.evaluate(() => { localStorage.removeItem('asrOff'); });
  return { estados: states, nota: 'nenhuma', aviso: note.slice(0, 80) };
});


// ---------- controle central de áudio ----------
const audible = () => page.evaluate(() => window.__audible());
const silent = async () => { const a = await audible(); const sp = await page.evaluate(() => window.__speaking()); return a.length === 0 && !sp; };
async function recordShort(hash, ms = 2500) {
  await go(hash);
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(ms);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('[data-role=mine]', { timeout: 8000 });
  await page.waitForTimeout(300);
}
const mine = () => page.locator('[data-role=mine]');
const mineInfo = () => page.evaluate(() => {
  const b = document.querySelector('[data-role=mine]');
  const el = [...window.__media].find((m) => (m.src || '').startsWith('blob:'));
  return { label: b.textContent, pressed: b.getAttribute('aria-pressed'), t: el ? el.currentTime : null, paused: el ? el.paused : null };
});

await check('T23', 'Áudio — “Minha voz” tem play/pausa que reflete o estado real e retoma do ponto pausado', async () => {
  await recordShort('#/lab?sentence=R01-B1-S1', 3000);
  await mine().click();
  await page.waitForTimeout(500);
  const playing = await mineInfo();
  assert(playing.pressed === 'true' && /Pausar/.test(playing.label) && playing.paused === false, JSON.stringify(playing));
  assert((await audible()).length === 1 && (await audible())[0].startsWith('blob:'), JSON.stringify(await audible()));
  await mine().click();
  await page.waitForTimeout(250);
  const paused = await mineInfo();
  assert(paused.pressed === 'false' && paused.label === 'Minha voz' && paused.paused === true && paused.t > 0.2, JSON.stringify(paused));
  assert(await silent(), 'ainda tocando depois de pausar');
  await mine().click();
  await page.waitForTimeout(150);
  const resumed = await mineInfo();
  assert(resumed.paused === false && resumed.t >= paused.t, `não retomou: ${JSON.stringify(resumed)}`);
  await page.waitForTimeout(3500); // termina sozinho → botão volta a “Minha voz”
  const ended = await mineInfo();
  assert(ended.pressed === 'false' && ended.label === 'Minha voz', JSON.stringify(ended));
  return { tocando: playing.label, pausadoEm: +paused.t.toFixed(2), retomadoEm: +resumed.t.toFixed(2), fim: ended.label };
});

await check('T24', 'Áudio — referência toca pelo controle central e um áudio novo para o anterior (sem duplicar)', async () => {
  await mine().click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Referência', exact: true }).click();
  await page.waitForTimeout(400);
  const a1 = await audible();
  assert(a1.length === 1 && a1[0].includes('audio/'), `esperado só a referência: ${JSON.stringify(a1)}`);
  assert((await mineInfo()).pressed === 'false', '“Minha voz” deveria ter parado');
  await page.getByRole('button', { name: 'Ouvir referência' }).click();
  await page.waitForTimeout(300);
  const a2 = await audible();
  assert(a2.length === 1, `duas reproduções ao mesmo tempo: ${JSON.stringify(a2)}`);
  await mine().click();
  await page.waitForTimeout(300);
  const a3 = await audible();
  assert(a3.length === 1 && a3[0].startsWith('blob:'), JSON.stringify(a3));
  await page.getByRole('button', { name: 'Parar', exact: true }).click();
  await page.waitForTimeout(200);
  assert(await silent(), '“Parar” não parou “Minha voz”');
  return { referencia: a1[0], depoisDeOuvirReferencia: a2.length, minhaVozDepois: a3.length };
});

await check('T25', 'Áudio — sair da tela para tudo (Minha voz, referência, A/B) e nada recomeça ao voltar', async () => {
  const res = {};
  // Minha voz → outra tela
  await mine().click();
  await page.waitForTimeout(300);
  assert((await audible()).length === 1, 'não começou');
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(300);
  res.minhaVoz = await silent();
  // volta: não recomeça sozinho
  await page.goBack();
  await page.waitForTimeout(1500);
  res.semReinicio = await silent();
  // referência → outra tela
  await page.getByRole('button', { name: 'Ouvir referência' }).click();
  await page.waitForTimeout(300);
  await page.evaluate(() => { location.hash = '#/stats'; });
  await page.waitForTimeout(300);
  res.referencia = await silent();
  // A/B: sair durante a parte A; a parte B (minha voz) não pode começar depois
  await page.goBack();
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: 'Comparar A/B' }).click();
  await page.waitForTimeout(300);
  const leftAt = await page.evaluate(() => { location.hash = '#/'; return performance.now(); });
  await page.waitForTimeout(5000);
  const late = await page.evaluate((t) => window.__plays.filter((p) => p.t > t + 50), leftAt);
  res.ab = (await silent()) && late.length === 0;
  assert(Object.values(res).every(Boolean), JSON.stringify({ ...res, late }));
  return res;
});

await check('T26', 'Áudio — avançar para o próximo exercício para o áudio do exercício anterior', async () => {
  await page.evaluate(() => { window.DRG_APP.state.settings.autoplay = false; });
  await go('#/session');
  let found = null;
  for (let i = 0; i < 20 && !found; i++) {
    const t = await page.evaluate(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
    if (t === 'summary') break;
    const spk = page.locator('.ex-area button[aria-label="Ouvir"]').first();
    if (await spk.count()) {
      await spk.click();
      await page.waitForTimeout(150);
      const before = await audible();
      if (before.length) {
        await answer('right');
        await page.waitForTimeout(150);
        found = { tipo: t, tocandoAntes: before[0], silencioDepois: await silent() };
        break;
      }
    }
    await answer('right');
  }
  await page.evaluate(() => { window.DRG_APP.state.settings.autoplay = true; });
  assert(found, 'nenhum exercício com áudio encontrado');
  assert(found.silencioDepois, 'o áudio continuou no exercício seguinte');
  return found;
});

await check('T27', 'Áudio — fechar a folha (modal) de um item para o áudio que ela iniciou', async () => {
  await go('#/routine/R01');
  await page.locator('.list-btn').first().click();
  await page.waitForSelector('.sheet');
  await page.locator('.sheet button[aria-label="Ouvir"]').first().click();
  await page.waitForTimeout(150);
  const before = await audible();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  assert(before.length === 1, `não tocou: ${JSON.stringify(before)}`);
  assert(await silent(), 'continuou tocando após fechar a folha');
  return { tocando: before[0], depoisDeFechar: 'silêncio' };
});

await check('T28', 'Áudio — ao sair da tela os recursos são liberados (elemento sem fonte, URL da gravação revogada)', async () => {
  await recordShort('#/lab?sentence=R01-B1-S1', 1500);
  const blobUrl = await page.evaluate(async () => {
    document.querySelector('[data-role=mine]').click();
    await new Promise((r) => setTimeout(r, 200));
    return [...window.__media].filter((m) => (m.src || '').startsWith('blob:')).at(-1).src;
  });
  const el = await page.evaluateHandle(() => [...window.__media].filter((m) => (m.src || '').startsWith('blob:')).at(-1));
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(300);
  const after = await el.evaluate((m) => ({ src: m.getAttribute('src'), paused: m.paused }));
  const revoked = await page.evaluate(async (u) => { try { await fetch(u); return false; } catch (e) { return true; } }, blobUrl);
  assert(after.paused && !after.src, JSON.stringify(after));
  assert(revoked, 'URL da gravação continua válida');
  return { elemento: after, urlRevogada: revoked };
});

await check('T29', 'Gravação preservada — tocar referência durante a gravação não a interrompe; sair no meio salva a gravação', async () => {
  await go('#/lab?sentence=R01-B1-S2');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Ouvir referência' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Parar', exact: true }).click();
  await page.waitForTimeout(600);
  const still = await page.locator('.rec-btn.on').count();
  assert(still === 1, 'a gravação foi interrompida pelo controle de áudio');
  await page.locator('.rec-btn').click();
  await page.waitForSelector('[data-role=mine]', { timeout: 8000 });
  const s1 = await state();
  assert(s1.recordingsMeta['sent:R01-B1-S2'], 'gravação não registrada');
  // sair no meio de uma gravação: o microfone é liberado e o áudio gravado até ali é salvo
  await go('#/lab?sentence=R01-B1-S3');
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(1200);
  await page.evaluate(() => { location.hash = '#/'; });
  await page.waitForTimeout(1200);
  await go('#/lab?sentence=R01-B1-S3');
  await page.waitForTimeout(800);
  const saved = await page.locator('text=Última gravação salva').count();
  assert(saved > 0, 'a gravação interrompida pela troca de tela foi perdida');
  return 'gravação seguiu durante a referência; gravação interrompida pela saída foi salva';
});

// ---------- Speaking Lab 2.0: ciclo de prática (reconhecimento SIMULADO pelo FakeSR) ----------
const chessSentence = sentences.find((x) => /quick chess games before my break/.test(x.en));
const { audioKey } = await import('../../app/js/engine/text.js');

await check('T30', 'Lista automática: só a palavra divergente; tocar reproduz o áudio dela; praticar a palavra (reconhecimento do Chrome) e regravar a frase atualiza a lista', async () => {
  await page.evaluate(() => { localStorage.removeItem('asrOff'); window.DRG_APP.state.settings.asrKnown = 'available'; return window.DRG_APP.flush(); });
  await page.reload(); await page.waitForTimeout(500); // nova página: sem o status em memória da página anterior
  await go(`#/lab?sentence=${chessSentence.id}`);
  await page.evaluate((t) => { window.__asrText = t; }, chessSentence.en.replace('chess', 'chest'));
  await recordShort(`#/lab?sentence=${chessSentence.id}`, 1500).catch(() => {});
  await waitResult();
  const chips = (await page.locator('.pchip').allTextContents()).map((x) => x.trim());
  assert(chips.length === 1 && chips[0] === 'chess', JSON.stringify(chips));
  const summary = await page.locator('.score-summary').textContent();
  assert(summary === 'Vamos praticar 1 palavra.', summary);
  await page.evaluate(() => { window.__plays.length = 0; });
  await page.locator('.pchip').first().click();
  await page.waitForTimeout(300);
  const plays = await page.evaluate(() => window.__plays.map((p) => p.src));
  const key = audioKey('chess');
  assert(plays.some((u) => u.includes(`audio/${key}`)), `tocou ${JSON.stringify(plays)} (esperado ${key})`);
  const pressed = await page.locator('.pchip').first().getAttribute('aria-pressed');
  const focusWord = await page.locator('.target-wrap .w-focus').textContent();
  assert(pressed === 'true' && focusWord === 'chess', `${pressed} ${focusWord}`);
  const panel = await page.locator('.practice-panel').textContent();
  assert(/o app ouviu “chest”/.test(panel) && !/vogal|consoante|fonema/i.test(panel), panel);
  // botões do painel têm ação real
  await page.getByRole('button', { name: 'Devagar' }).click();
  await page.waitForTimeout(250);
  const slow = await page.evaluate(() => { const m = [...window.__media].find((x) => !x.paused); return m ? m.playbackRate : null; });
  await page.getByRole('button', { name: 'Na frase' }).click();
  await page.waitForTimeout(250);
  const sentenceKey = chessSentence.au;
  const inSentence = await page.evaluate((k) => window.__plays.some((p) => p.src.includes(`audio/${k}`)), sentenceKey);
  assert(slow && slow < 1 && inSentence, `devagar=${slow} naFrase=${inSentence}`);
  // prática isolada da palavra com o reconhecimento do Chrome (simulado): “chess” sozinho é reconhecido
  await page.evaluate(() => { window.__asrText = 'Chess.'; });
  await page.getByRole('button', { name: 'Praticar esta palavra' }).click();
  await page.waitForSelector('[data-role=wp-stop]');
  await page.waitForTimeout(1200);
  await page.locator('[data-role=wp-stop]').click();
  await page.waitForSelector('[data-role=wp-result]', { timeout: 10000 });
  const word = await page.locator('[data-role=wp-result]').getAttribute('data-result');
  const wordHeard = await page.locator('[data-role=wp-heard]').textContent();
  assert(word === 'match' && wordHeard === '“Chess.”', `${word} ${wordHeard}`);
  // regravar a frase a partir do cartão: a nova tentativa (correta) limpa a lista
  await page.evaluate((t) => { window.__asrText = t; }, chessSentence.en);
  await page.getByRole('button', { name: 'Agora, pratique a frase completa' }).click();
  await page.waitForTimeout(400);
  assert(await page.locator('.rec-btn.on').count() === 1, 'não começou a gravar');
  assert(await page.locator('.pchip').count() === 0 && await page.locator('.w[data-state]').count() === 0, 'resultado antigo continuou visível durante a nova gravação');
  await page.waitForTimeout(1200);
  await page.locator('.rec-btn').click();
  await waitResult();
  const ok = await page.locator('[data-role=practice-ok]').textContent();
  assert(/Nenhuma palavra pendente nesta tentativa/.test(ok) && await page.locator('.pchip').count() === 0, ok);
  await shot('30-practice-cycle');
  return { lista: chips, audioDaPalavra: key, devagar: slow, palavraIsolada: `${word} ${wordHeard}`, depoisDeRegravar: ok.trim() };
});

await check('T31', 'Lista de revisão automática e resultado guardado com a gravação (sem marcar palavras à mão)', async () => {
  const s = await state();
  assert(s.difficultWords.chess && s.difficultWords.chess.auto, JSON.stringify(s.difficultWords.chess));
  assert(await page.locator('.word-pick').count() === 0, 'seleção manual de palavras ainda aparece com análise automática');
  return { revisao: { chess: { auto: s.difficultWords.chess.auto, okStreak: s.difficultWords.chess.okStreak } } };
});

await check('T32', 'Excluir gravação: só a do exercício; resultado e pendências somem; recursos liberados; outras gravações e XP intactos', async () => {
  await recordShort('#/lab?sentence=R01-B1-S1', 1200);
  const other = 'sent:' + chessSentence.id;
  const before = await state();
  assert(before.recordingsMeta[other] && before.recordingsMeta['sent:R01-B1-S1'], 'pré-condição');
  await waitResult();
  const blobUrl = await page.evaluate(() => [...window.__media].filter((m) => (m.src || '').startsWith('blob:')).at(-1)?.src || null);
  const el = await page.evaluateHandle(() => [...window.__media].filter((m) => (m.src || '').startsWith('blob:')).at(-1) || null);
  await page.getByRole('button', { name: 'Excluir gravação' }).click();
  await page.getByRole('button', { name: 'Excluir', exact: true }).click();
  await page.waitForTimeout(500);
  const after = await state();
  const ui = await page.evaluate(() => ({ title: document.querySelector('.rec-title').textContent, colored: document.querySelectorAll('.w[data-state]').length, fb: document.querySelector('.fb').dataset.state, mine: !!document.querySelector('[data-role=mine]') && document.querySelector('.rec-after:not(.hidden)') !== null }));
  const revoked = blobUrl ? await page.evaluate(async (u) => { try { await fetch(u); return false; } catch (e) { return true; } }, blobUrl) : true;
  const src = await el.evaluate((m) => (m ? m.getAttribute('src') : null));
  assert(!after.recordingsMeta['sent:R01-B1-S1'] && after.recordingsMeta[other], JSON.stringify(Object.keys(after.recordingsMeta)));
  assert(after.xp === before.xp, `XP mudou: ${before.xp} → ${after.xp}`);
  assert(ui.title === 'Gravar minha voz' && ui.colored === 0 && !ui.mine && ui.fb === 'idle', JSON.stringify(ui));
  assert(revoked && !src, 'recursos da gravação não liberados');
  await page.reload(); await page.waitForTimeout(800);
  assert(await page.locator('text=Última gravação salva').count() === 0, 'gravação excluída voltou após recarregar');
  await go(`#/lab?sentence=${chessSentence.id}`);
  await page.waitForTimeout(800);
  assert(await page.locator('text=Última gravação salva').count() === 1, 'excluiu a gravação de outro exercício');
  return { excluida: 'sent:R01-B1-S1', preservada: other, xp: after.xp, urlRevogada: revoked };
});

await check('T33', 'Primeira entrada em Falar: convite para instalar aparece; “Agora não” respeitado sem repetir a cada visita', async () => {
  await page.evaluate(() => { delete window.DRG_APP.state.settings.asrPrompt; return window.DRG_APP.flush(); });
  await go('#/lab');
  await page.reload(); await page.waitForTimeout(800);
  const card = await page.locator('[data-role=asr-setup]').textContent();
  assert(/Avalie sua pronúncia/.test(card) && /\d+ MB/.test(card) && /internet/.test(card) && /offline/.test(card) && /no aparelho/.test(card), card);
  assert(await page.getByRole('button', { name: 'Baixar reconhecimento' }).count() === 1, 'sem ação primária');
  await page.getByRole('button', { name: 'Agora não' }).click();
  await page.waitForTimeout(200);
  assert(await page.locator('[data-role=asr-setup]').count() === 0, 'cartão não fechou');
  await page.reload(); await page.waitForTimeout(800);
  assert(await page.locator('[data-role=asr-setup]').count() === 0, 'convite reapareceu depois de “Agora não”');
  const s = await state();
  return { tamanho: card.match(/\d+ MB/)[0], escolha: s.settings.asrPrompt };
});

await check('T34', 'Interface: alvos de toque ≥ 40 px, contraste ≥ 4,5:1 (claro e escuro) nos textos novos, sem rolagem horizontal', async () => {
  const res = {};
  for (const theme of ['light', 'dark']) {
    await page.evaluate((t) => { window.DRG_APP.state.settings.theme = t; window.DRG_APP.applySettings(); }, theme);
    await page.evaluate((t) => { window.__asrText = t; }, chessSentence.en.replace('chess', 'chest'));
    await recordShort(`#/lab?sentence=${chessSentence.id}`, 1200);
    await waitResult();
    await page.locator('.pchip').first().click();
    await page.waitForTimeout(200);
    res[theme] = await page.evaluate(() => {
      const parse = (c) => { const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; const v = ctx.fillStyle; if (v.startsWith('#')) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)); return v.match(/[\d.]+/g).slice(0, 3).map(Number); };
      const lum = (rgb) => { const [r, g, b] = rgb.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
      const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; } return getComputedStyle(document.body).backgroundColor; };
      const ratio = (el) => { const a = lum(parse(getComputedStyle(el).color)), b = lum(parse(bgOf(el))); return +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2); };
      const sel = ['.w-legend .lg', '.score-tag', '.score-summary', '.score-num', '.pchip', '.practice-panel .muted', '.rec-title', '.eyebrow', '.link-btn.danger', '.practice-hint'];
      const contrast = Object.fromEntries(sel.map((q) => [q, document.querySelector(q) ? ratio(document.querySelector(q)) : null]));
      const small = [...document.querySelectorAll('.view button, .view .pchip, .view summary')].filter((b) => b.offsetParent && !b.closest('.word-detail')).map((b) => { const r = b.getBoundingClientRect(); return { t: (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 20), w: Math.round(r.width), h: Math.round(r.height) }; }).filter((r) => r.h < 40 || r.w < 40);
      return { contrast, small, overflow: document.documentElement.scrollWidth > innerWidth + 1 };
    });
    await shot(`34-${theme}`);
  }
  await page.evaluate(() => { window.DRG_APP.state.settings.theme = 'auto'; window.DRG_APP.applySettings(); });
  for (const [theme, r] of Object.entries(res)) {
    const low = Object.entries(r.contrast).filter(([, v]) => v !== null && v < 4.5);
    assert(!low.length, `${theme}: contraste baixo ${JSON.stringify(low)}`);
    assert(!r.small.length, `${theme}: alvos pequenos ${JSON.stringify(r.small)}`);
    assert(!r.overflow, `${theme}: rolagem horizontal`);
  }
  return { claro: res.light.contrast, escuro: res.dark.contrast };
});

// ---------- missões: resposta oral livre (sem o modelo local instalado nesta suíte) ----------
async function goToQuestion(qid, hash = '#/session?routine=R01&mode=present') {
  await go(hash);
  for (let i = 0; i < 25; i++) {
    const cur = await page.evaluate(() => { const e = window.DRG_APP.debugExercise; return e && e.q ? e.q.id : e && e.type; });
    if (cur === qid) return true;
    if (cur === 'summary') break;
    await answer('right');
  }
  throw new Error(`não cheguei a ${qid}`);
}

await check('T35', 'Missão com resposta livre sem o modelo: grava, ouve, explica a instalação (tamanho real), nenhuma avaliação inventada; XP e conclusão intactos', async () => {
  await page.evaluate(() => { delete window.DRG_APP.state.settings.asrPrompt; return window.DRG_APP.flush(); });
  await page.reload(); await page.waitForTimeout(500);
  await goToQuestion('G.Q01');
  const q = await page.locator('.big-en').first().textContent();
  assert(/Could you tell me about your daily routine\?/.test(q), q);
  await page.locator('.rec-btn').click();
  await page.waitForTimeout(1500);
  await page.locator('.rec-btn').click();
  await page.waitForSelector('[data-role=mine]', { timeout: 8000 });
  await page.waitForSelector('[data-role=free-feedback] [data-role=asr-setup]', { timeout: 5000 });
  const card = await page.locator('[data-role=free-feedback]').textContent();
  const sizeMB = await page.evaluate(() => Math.round(window.DRG_APP.asr.local.downloadBytes() / 1048576));
  assert(/Sua gravação está salva/.test(card) && new RegExp(`${sizeMB} MB`).test(card), card.slice(0, 200));
  assert(await page.locator('.fa-status, .score-num').count() === 0, 'avaliação exibida sem reconhecimento');
  await page.locator('[data-role=mine]').click();
  await page.waitForTimeout(300);
  const playing = await page.locator('[data-role=mine]').getAttribute('aria-pressed');
  await page.locator('[data-role=mine]').click();
  assert(playing === 'true', 'a própria voz não tocou');
  await page.getByRole('button', { name: 'Agora não' }).click();
  const off = await page.locator('[data-role=free-feedback]').textContent();
  assert(/Análise automática desligada/.test(off), off);
  // a missão continua: modelo, autoavaliação e XP como antes
  const before = await state();
  await page.locator('.actionbar').getByRole('button', { name: 'Ver modelo e avaliar' }).click();
  await page.getByRole('button', { name: 'Consegui', exact: true }).click();
  await page.waitForTimeout(300);
  const after = await state();
  assert(after.cards['q:G.Q01:conv'] && after.cards['q:G.Q01:conv'].reps > ((before.cards['q:G.Q01:conv'] || {}).reps || 0), 'cartão da pergunta não registrado');
  // regra existente: XP por cartão tem limite diário (testes anteriores já responderam G.Q01 hoje)
  const today = Object.keys(before.days).map(Number).sort((x, y) => x - y).at(-1);
  const rewarded = ((before.days[today] || {}).rewarded || {})['q:G.Q01:conv'] || 0;
  assert(rewarded < 2 ? after.xp > before.xp : after.xp === before.xp, `XP fora da regra: ${before.xp} → ${after.xp} (recompensas hoje: ${rewarded})`);
  return { pergunta: q, convite: `${sizeMB} MB`, xp: `${before.xp} → ${after.xp} (recompensas anteriores hoje: ${rewarded})` };
});

await check('T36', 'Caso A no app (transcrição real do relato do S25+ injetada como resultado salvo): transcrição intacta, trechos suspeitos em âmbar, legenda e explicação corretas', async () => {
  const CASE_A = 'I wake up at around five a.m. I take a shower and brush my teeth after that. I sit on my Uber app and set this nation to the office.';
  await go('#/');
  // grava no armazenamento local uma gravação (1 s de silêncio) com a transcrição do caso A, como o app faria
  await page.evaluate(async (text) => {
    const sr = 8000, n = sr, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    const db = await new Promise((res, rej) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    await new Promise((res, rej) => { const tx = db.transaction('recordings', 'readwrite'); tx.objectStore('recordings').put({ blob: new Blob([buf], { type: 'audio/wav' }), meta: { ms: 9000, analysis: { silent: false, speechSec: 9, totalSec: 10, pauses: 2, longPauses: 0 }, free: { text, at: Date.now() } }, at: Date.now() }, 'q:G.Q01'); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    db.close();
  }, CASE_A);
  await go('#/lab?q=G.Q01');
  await page.waitForSelector('[data-role=free-feedback][data-state=result]', { timeout: 8000 });
  const fb = page.locator('[data-role=free-feedback]');
  const transcript = await fb.locator('.fa-text').textContent();
  const amber = await fb.locator('.fa-text .w[data-state=needs_practice]').allTextContents();
  const legendTxt = await fb.locator('.w-legend').textContent();
  const status = await fb.locator('.fa-status').textContent();
  assert(transcript === CASE_A, `transcrição alterada: ${transcript}`);
  assert(JSON.stringify(amber) === JSON.stringify(['sit', 'on', 'my', 'this', 'nation']), JSON.stringify(amber));
  assert(/Compatível/.test(legendTxt) && /Confira/.test(legendTxt) && /Não avaliada/.test(legendTxt), legendTxt); // cores = evidência
  assert(status === 'Responde à pergunta', status);
  // tocar em “nation” abre o trecho inteiro “this nation”, com a hipótese e o áudio que existe de fato
  await fb.locator('.fa-text .w', { hasText: /^nation\.?$/ }).click();
  const panel = await fb.locator('.practice-panel').textContent();
  const focused = await fb.locator('.fa-text .w-focus').allTextContents();
  assert(/o app ouviu “this nation”/.test(panel) && /“my destination”/.test(panel) && /reconhecimento ou a pronúncia/.test(panel), panel);
  assert(JSON.stringify(focused) === JSON.stringify(['this', 'nation']), JSON.stringify(focused));
  assert(await fb.getByRole('button', { name: 'Ouvir a frase de referência' }).count() === 1, 'sem a frase de referência');
  assert(await fb.getByRole('button', { name: 'Ouvir minha resposta' }).count() >= 1, 'sem ouvir a própria gravação');
  assert(!/pronunciou|pronúncia errada/i.test(await fb.textContent()), 'afirma erro de pronúncia');
  await shot('36-caso-a');
  return { trechos: ['sit on my', 'this nation'], status, legenda: legendTxt.trim() };
});

// grava uma “resposta salva” (1 s de silêncio + transcrição e, opcionalmente, integridade), como o app faria
const injectFree = (key, free) => page.evaluate(async ([key, free]) => {
  const sr = 8000, n = sr, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  const db = await new Promise((res, rej) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  await new Promise((res, rej) => { const tx = db.transaction(['recordings', 'audio'], 'readwrite'); tx.objectStore('audio').put({ blob: new Blob([buf], { type: 'audio/wav' }), bytes: buf.byteLength, type: 'audio/wav', recordedAt: Date.now() }, key); tx.objectStore('recordings').put({ meta: { ms: 9000, analysis: { silent: false, speechSec: 9, totalSec: 10, pauses: 2, longPauses: 0 }, free: { ...free, at: Date.now() } }, recordedAt: Date.now(), at: Date.now(), audio: true }, key); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
  db.close();
}, [key, free]);

await check('T37', 'Caso real (frango/alface/Uber) no app: trechos que destoam em âmbar com sugestão rotulada, transcrição intacta; integridade e “não confirmado” visíveis', async () => {
  const REAL = 'I wake up at five. I ate a kitten sandwich with salad. Usually I ate a little and tomato. I opened my over app and set this station to my office.';
  await go('#/');
  await injectFree('q:G.Q01', { text: REAL });
  await go('#/lab?q=G.Q01');
  await page.waitForSelector('[data-role=free-feedback][data-state=result]', { timeout: 8000 });
  const fb = page.locator('[data-role=free-feedback]');
  const transcript = await fb.locator('.fa-text').textContent();
  const amber = await fb.locator('.fa-text .w[data-state=needs_practice]').allTextContents();
  const green = await fb.locator('.fa-text .w[data-state=good]').allTextContents();
  assert(transcript === REAL, `transcrição alterada: ${transcript}`);
  assert(JSON.stringify(amber) === JSON.stringify(['kitten', 'little', 'over', 'station']), JSON.stringify(amber));
  assert(!green.some((x) => /kitten|little|over|station/.test(x)), 'trecho suspeito em verde');
  await fb.locator('.fa-text .w', { hasText: /^kitten$/ }).click();
  const panel = await fb.locator('.practice-panel').textContent();
  assert(/Sugestão \(não é a transcrição\): “chicken”/.test(panel) && /não é um alimento/.test(panel) && /reconhecimento ou a pronúncia/.test(panel), panel);
  assert(await fb.getByRole('button', { name: 'Ouvir minha resposta' }).count() >= 1, 'sem ouvir a própria gravação');
  await shot('37-caso-real');
  // integridade: trecho com voz que voltou vazio → aviso, e o horário que não aparece fica “não confirmado”
  await injectFree('q:R01.Q1', { text: 'I go to the gym and then I work at the office.', integrity: { checked: true, complete: false, issues: [{ code: 'lost-part', part: 1, msg: 'Um trecho com voz não gerou texto (trecho 2 de 2): parte da fala pode ter sido perdida pelo reconhecimento.' }] } });
  await go('#/lab?q=R01.Q1');
  await page.waitForSelector('[data-role=free-feedback][data-state=result]', { timeout: 8000 });
  const integ = await fb.locator('[data-role=fa-integrity]').textContent();
  const status = await fb.locator('.fa-status').textContent();
  const unk = await fb.locator('.fa-check li.unk').textContent();
  assert(/pode estar incompleta/.test(integ) && /não é tratado como “você não disse”/.test(integ), integ);
  assert(status === 'Não deu para confirmar tudo', status);
  assert(/não confirmado/.test(unk), unk);
  await shot('37-integridade');
  return { ambar: amber, status, item: unk.trim().slice(0, 60) };
});

await check('T10', 'Backup: exportar, apagar e restaurar recupera 100% do estado', async () => {
  const before = await state();
  await go('#/settings');
  await page.waitForTimeout(3000); // espera toasts anteriores sumirem
  await shot('10-settings');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.getByRole('button', { name: 'Exportar backup' }).click()]);
  const file = join(OUT, 'backup-test.json');
  await dl.saveAs(file);
  // apagar
  await page.getByRole('button', { name: 'Apagar todo o progresso…' }).click();
  const [dl2] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exportar backup e apagar' }).click()]);
  await dl2.saveAs(join(OUT, 'backup-before-wipe.json'));
  await page.getByRole('button', { name: 'Apagar', exact: true }).click();
  await page.waitForTimeout(600);
  const wiped = await state();
  assert(wiped.xp === 0 && Object.keys(wiped.cards).length === 0, 'não apagou');
  // restaurar
  await go('#/settings');
  await page.locator('input[type=file]').setInputFiles(file);
  await page.getByRole('button', { name: 'Restaurar' }).click();
  await page.waitForTimeout(800);
  const after = await state();
  const strip = (s) => { const c = JSON.parse(JSON.stringify(s)); delete c.updatedAt; delete c.lastBackupAt; return c; };
  const same = JSON.stringify(strip(after).cards) === JSON.stringify(strip(before).cards) && after.xp === before.xp && JSON.stringify(after.days) === JSON.stringify(before.days);
  assert(same, 'estado restaurado difere');
  return { xp: after.xp, cartoes: Object.keys(after.cards).length };
});

await check('T11', 'Backup inválido é recusado sem perder dados', async () => {
  const before = await state();
  const bad = join(OUT, 'bad.json');
  writeFileSync(bad, '{"app":"outro","state":{}}');
  await go('#/settings');
  await page.locator('input[type=file]').setInputFiles(bad);
  const toast = await page.locator('.toast', { hasText: 'importar' }).first().textContent({ timeout: 4000 }).catch(() => '');
  assert(toast, 'nenhuma mensagem de erro exibida');
  const after = await state();
  assert(after.xp === before.xp, 'estado alterado');
  return toast;
});

await check('T12', 'Estado corrompido no armazenamento é recuperado sem travar', async () => {
  await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const tx = r.result.transaction('kv', 'readwrite'); tx.objectStore('kv').put({ schema: 1, cards: 'lixo', days: null, xp: 'x' }, 'state'); tx.oncomplete = () => { r.result.close(); res(); }; }; }));
  await page.reload();
  const warn = await page.locator('.toast').first().textContent({ timeout: 4000 }).catch(() => '');
  const s = await state();
  assert(typeof s.xp === 'number' && typeof s.cards === 'object', 'estado inválido');
  assert(/danificada/.test(warn), 'usuário não foi avisado do reparo');
  // restaura o backup para continuar os testes
  await go('#/settings');
  const sane = { xp: s.xp, cards: Object.keys(s.cards).length };
  await page.locator('input[type=file]').setInputFiles(join(OUT, 'backup-test.json'));
  await page.getByRole('button', { name: 'Restaurar' }).click();
  await page.waitForTimeout(600);
  const restored = await state();
  assert(Object.keys(restored.cards).length > 0, 'restauração após corrupção falhou');
  return { aviso: warn.slice(0, 80) + '…', saneado: sane, restaurado: { xp: restored.xp, cards: Object.keys(restored.cards).length } };
});

await check('T13', 'Layout: sem rolagem horizontal em 360/412/480 px, fonte 130%, tema escuro', async () => {
  const screens = ['', '#/explore', '#/routine/R01', '#/context/work', '#/category/qa', '#/lab', '#/lab?block=R01-B3', '#/review', '#/stats', '#/settings', '#/checklist', '#/session'];
  const problems = [];
  for (const [w, hgt] of [[360, 640], [412, 915], [480, 1000]]) {
    await page.setViewportSize({ width: w, height: hgt });
    for (const fs of [1, 1.3]) {
      await page.evaluate((f) => { window.DRG_APP.state.settings.fontScale = f; window.DRG_APP.applySettings(); }, fs);
      for (const s of screens) {
        await go(s);
        const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        const small = await page.evaluate(() => [...document.querySelectorAll('button, a.btn, .nav a')].filter((b) => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.height < 36 || r.width < 36); }).map((b) => b.textContent.trim().slice(0, 20)));
        if (over) problems.push(`${w}px fs${fs} ${s || '#/'}: rolagem horizontal`);
        if (small.length && fs === 1 && w === 412) problems.push(`${s || '#/'} alvos <36px: ${small.slice(0, 3).join(', ')}`);
      }
    }
  }
  await page.evaluate(() => { window.DRG_APP.state.settings.fontScale = 1; window.DRG_APP.state.settings.theme = 'dark'; window.DRG_APP.applySettings(); });
  await page.setViewportSize({ width: 412, height: 915 });
  await go('#/routine/R01'); await shot('13-dark-routine');
  await go(''); await shot('13-dark-home');
  await page.setViewportSize({ width: 360, height: 640 });
  await go('#/session'); await shot('13-session-360x640');
  await page.evaluate(() => { window.DRG_APP.state.settings.theme = 'auto'; window.DRG_APP.applySettings(); });
  await page.setViewportSize({ width: 412, height: 915 });
  assert(!problems.some((p) => p.includes('rolagem')), problems.join(' | '));
  return problems.length ? { avisos: problems } : 'sem problemas';
});

// file:// (contingência A)
await check('T16', 'Abre direto pelo arquivo (file://) com conteúdo e sessão', async () => {
  const p2 = await ctx.newPage();
  const errs = [];
  p2.on('pageerror', (e) => errs.push(e.message));
  await p2.goto('file://' + join(APP, 'index.html'));
  await p2.waitForTimeout(800);
  const title = await p2.locator('.topbar h1').textContent();
  await p2.goto('file://' + join(APP, 'index.html') + '#/session');
  await p2.waitForTimeout(800);
  const kind = await p2.locator('.ex-kind').first().textContent();
  await p2.close();
  assert(!errs.length, errs.join(' | '));
  return { titulo: title, primeiroExercicio: kind };
});

await check('T17', 'Treino para a aula (R01): contar os 7 blocos, perguntas e rotina completa', async () => {
  const types = await runSession('#/session?routine=R01&mode=present', { max: 30 });
  const s = await state();
  const told = content.routines[0].blocks.filter((b) => s.cards[`block:${b}:tell`]).length;
  assert(told === 7, `${told} blocos contados`);
  assert(s.cards['routine:R01:retell'], 'rotina completa não praticada');
  return { telas: types.length, blocos: told, perguntas: types.filter((t) => t === 'conv').length };
});

await check('T18', 'Desempenho e memória (cache quente, offline)', async () => {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Performance.enable');
  const times = [];
  await go('');
  for (let i = 0; i < 3; i++) {
    await page.reload();
    await page.waitForSelector('.hero');
    times.push(await page.evaluate(() => Math.round(performance.now()))); // ms desde o início desta navegação
  }
  // troca de exercício: tempo entre clicar e o próximo exercício aparecer
  await page.evaluate(() => window.DRG_APP.go('#/session'));
  await page.waitForTimeout(400);
  const metrics = (await cdp.send('Performance.getMetrics')).metrics;
  const heap = metrics.find((m) => m.name === 'JSHeapUsedSize').value;
  const nodes = metrics.find((m) => m.name === 'Nodes').value;
  const median = times.sort((a, b) => a - b)[1];
  assert(median < 1500, `abertura ${median} ms`);
  return { aberturaMs: times, heapMB: +(heap / 1048576).toFixed(1), nosDOM: nodes };
});

await check('T14', 'Nenhuma requisição externa em toda a execução', async () => {
  assert(external.length === 0, external.slice(0, 5).join(', '));
  return '0 requisições fora do app';
});

await check('T15', 'Nenhum erro de JavaScript na página', async () => {
  const relevant = pageErrors.filter((e) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED|net::/.test(e));
  assert(relevant.length === 0, relevant.slice(0, 3).join(' | '));
  return pageErrors.length ? `${pageErrors.length} avisos de rede esperados no modo offline` : 'nenhum';
});

await browser.close();
const summary = { when: new Date().toISOString(), env: 'Chromium headless (Playwright), viewport 412×915 móvel, microfone falso, reconhecimento de fala simulado', passed: results.filter((r) => r.status === 'aprovado').length, failed: results.filter((r) => r.status !== 'aprovado').length, results };
writeFileSync(join(OUT, 'e2e-results.json'), JSON.stringify(summary, null, 1));
console.log(`\n${summary.passed} aprovados, ${summary.failed} reprovados`);
process.exit(summary.failed ? 1 : 0);
