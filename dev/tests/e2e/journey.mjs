// Jornada Conversation Practice no app (Chromium): acesso fora do seletor de personagem, sessão da unidade, ouvir sem ver
// o texto, ler e responder, progresso próprio, conclusão, diálogo com origem, áudio e funcionamento offline.
// Uso: node tests/e2e/journey.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]. Não valida o aparelho real.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/journey');
mkdirSync(OUT, { recursive: true });
const PORT = 8793, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

let server = await serve(SITE, PORT);
const errors = [], external = [];
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
const page = ctx.pages()[0] || await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
const go = async (hash) => { await page.goto(BASE + hash); await page.reload(); await page.waitForTimeout(900); };
const app = (fn, arg) => page.evaluate(fn, arg);
const cardsOf = (rx) => app((src) => { const r = new RegExp(src); return Object.keys(window.DRG_APP.state.cards).filter((k) => r.test(k)).sort(); }, rx.source);
// marca cartões como vencidos hoje (é o que a revisão espaçada faz com eles) e grava
const seedDue = (keys) => app(async (ks) => { const st = window.DRG_APP.state, t = window.DRG_APP.today();
  for (const k of ks) st.cards[k] = { k, box: 0, due: t, reps: 1, lapses: 0, streak: 0, last: t - 1, lastResult: 'ok', created: t - 1 }; await window.DRG_APP.flush(); }, keys);

let lucasBefore = null;
await check('J01', 'Jornada própria (não é história de personagem): cartão no Início abre a lista de unidades; a escolha persiste ao recarregar', async () => {
  await go('#/');
  await page.waitForTimeout(2500); // service worker instala e pré-cacheia
  assert(await page.locator('[data-role=journey-entry]').isVisible(), 'cartão da jornada ausente');
  await go('#/stories');
  const pickerHasCp = await page.locator('main').textContent(); // escolha de histórias: só personagens
  await go('#/');
  lucasBefore = await cardsOf(/^(item:it\.|sent:R|block:R|q:R)/);
  await page.locator('[data-role=journey-entry-all]').click();
  await page.waitForTimeout(600);
  const units = await page.locator('[data-role=journey-unit]').evaluateAll((els) => els.map((e) => [e.dataset.unit, e.dataset.complete]));
  await page.screenshot({ path: join(OUT, 'J01-inicio-jornada.png'), fullPage: true });
  assert(JSON.stringify(units) === '[["CP01","false"],["CP02","false"]]', JSON.stringify(units));
  await go('#/');
  const s = await app(() => ({ j: window.DRG_APP.journey && window.DRG_APP.journey.id, saved: window.DRG_APP.state.settings.journey, ch: window.DRG_APP.character.id, routines: window.DRG_APP.content.routines.map((r) => r.id) }));
  assert(s.j === 'cp' && s.saved === 'cp' && s.ch === 'lucas' && JSON.stringify(s.routines) === '["CP01","CP02"]', JSON.stringify(s));
  assert(!/Conversation/.test(pickerHasCp), 'a jornada não é um personagem');
  return { unidades: units.map((u) => u[0]), salvo: s.saved, personagem: s.ch };
});

await check('J02', 'Sessão do CP01: começa pelas expressões do diálogo (itens cp.*), sem nada das rotinas', async () => {
  await go('#/session?routine=CP01');
  const seen = [];
  for (let i = 0; i < 8; i++) {
    const ex = await app(() => { const e = window.DRG_APP.debugExercise; return e && e.type !== 'summary' ? { type: e.type, k: e.entry && e.entry.k, right: e.options && e.options.find((o) => o.correct) ? (e.options.find((o) => o.correct).pt || e.options.find((o) => o.correct).text) : null } : null; });
    if (!ex) break;
    seen.push(ex.k);
    const bar = page.locator('.actionbar');
    if (ex.type === 'learn') await bar.getByRole('button', { name: 'Próximo', exact: true }).click();
    else if (ex.type === 'mc') { await page.locator('.options .option', { hasText: ex.right }).first().click(); await page.waitForTimeout(150); await bar.getByRole('button', { name: 'Continuar', exact: true }).click(); }
    else break;
    await page.waitForTimeout(250);
  }
  assert(seen.length >= 3 && seen.every((k) => /^item:cp\./.test(k)), JSON.stringify(seen));
  await app(() => window.DRG_APP.flush());
  return { vistos: seen.slice(0, 5) };
});

await check('J03', 'Ouvir e responder: o trecho toca sem texto na tela; o texto só aparece depois da resposta; acerto gera XP e cartão próprio', async () => {
  await seedDue(['lq:CP.L1:lis']);
  const xp0 = await app(() => window.DRG_APP.state.xp);
  await go('#/session?mode=review');
  const ex = await app(() => { const e = window.DRG_APP.debugExercise; return { type: e.type, k: e.entry.k, right: e.options.find((o) => o.correct).text, lines: e.clips.map((c) => c.text), keys: e.clips.map((c) => c.key) }; });
  assert(ex.type === 'listen' && ex.k === 'lq:CP.L1:lis', JSON.stringify(ex));
  const before = await page.locator('main').textContent();
  const hidden = ex.lines.every((l) => !before.includes(l.slice(0, 25)));
  const audio = await app((ks) => ks.map((k) => !!window.DRG_AUDIO.files[k]), ex.keys);
  await page.screenshot({ path: join(OUT, 'J03-ouvir-antes.png') });
  await page.locator('.options .option', { hasText: ex.right }).click();
  await page.waitForTimeout(300);
  const after = await page.locator('main').textContent();
  await page.screenshot({ path: join(OUT, 'J03-ouvir-depois.png'), fullPage: true });
  const card = await app(() => window.DRG_APP.state.cards['lq:CP.L1:lis']);
  const xp1 = await app(() => window.DRG_APP.state.xp);
  assert(hidden, 'texto do trecho visível antes da resposta');
  assert(audio.every(Boolean), `áudio embutido ausente: ${JSON.stringify(audio)}`);
  assert(ex.lines.length === 13 && after.includes(ex.lines[1].slice(0, 25)) && /first day/.test(after), 'transcrição do diálogo inteiro não revelada depois');
  assert(card.box >= 1 && card.lastResult === 'good' && xp1 > xp0, JSON.stringify({ card, xp0, xp1 }));
  await page.locator('.actionbar').getByRole('button', { name: 'Continuar', exact: true }).click();
  return { trecho: ex.lines.length + ' falas', xp: xp1 - xp0 };
});

await check('J04', 'Ler e responder: diálogo à vista com a fala de referência destacada; erro mostra a correta e a explicação', async () => {
  await seedDue(['rq:CP.R5:rdq']);
  await go('#/session?mode=review');
  const ex = await app(() => { const e = window.DRG_APP.debugExercise; return { type: e.type, wrong: e.options.find((o) => !o.correct).text, right: e.options.find((o) => o.correct).text }; });
  assert(ex.type === 'read', JSON.stringify(ex));
  const lines = await page.locator('.read-passage .line').count();
  const hl = await page.locator('.read-passage .line.hl').textContent();
  await page.locator('.options .option', { hasText: ex.wrong }).click();
  await page.waitForTimeout(300);
  const fb = await page.locator('.feedback').textContent();
  const right = await page.locator('.options .option.right').textContent();
  await page.screenshot({ path: join(OUT, 'J04-ler.png'), fullPage: true });
  const card = await app(() => window.DRG_APP.state.cards['rq:CP.R5:rdq']);
  assert(lines === 12 && /not keen on spy films/.test(hl), `${lines} ${hl}`);
  assert(right === ex.right && /keen/i.test(fb) && card.lastResult === 'bad' && card.box === 0, JSON.stringify({ right, fb: fb.slice(0, 80), card }));
  return { falas: lines, referencia: hl.slice(0, 50) };
});

await check('J05', 'Progresso próprio: praticar a jornada não toca nos cartões das rotinas; sair volta ao Lucas; R01 continua igual', async () => {
  const cp = await cardsOf(/^(item:cp\.|lq:|rq:|sent:CP|q:CP)/);
  await go('#/modules');
  await page.locator('nav.nav a[href="#/dr"]').click(); // aba da Daily Routine: sai da jornada sem misturar contextos
  await page.waitForTimeout(500);
  const lucasAfter = await cardsOf(/^(item:it\.|sent:R|block:R|q:R)/); // perfil do Lucas (a jornada tem perfil próprio)
  await go('#/');
  const home = { name: await page.evaluate(() => { const m = /História de (\S+)/.exec((document.querySelector('[data-role=journey-context]') || {}).textContent || ''); return m ? m[1] : null; }), r1: await page.locator('[data-role=track-dr]').textContent(), entry: await page.locator('[data-role=journey-entry]').count() };
  const s = await app(() => ({ j: window.DRG_APP.journey, saved: window.DRG_APP.state.settings.journey, same: window.DRG_APP.content === window.DRG_APP.baseContent }));
  assert(JSON.stringify(lucasAfter) === JSON.stringify(lucasBefore), 'cartões das rotinas mudaram');
  assert(cp.length >= 4 && home.name === 'Lucas' && /Daily Routine/.test(home.r1) && /R01/.test(home.r1) && home.entry === 1 && s.j === null && s.saved === null && s.same, JSON.stringify({ home, s, cp: cp.length }));
  // Karla também não vê nada da jornada
  await go('#/stories'); await page.locator('[data-role=story][data-character=karla]').click(); await page.waitForTimeout(300);
  const k = await app(() => ({ routines: window.DRG_APP.content.routines.map((r) => r.id).join(','), lq: !!window.DRG_APP.content.listening }));
  await go('#/stories'); await page.locator('[data-role=story][data-character=lucas]').click(); await page.waitForTimeout(300);
  assert(/^K01/.test(k.routines) && !k.lq, JSON.stringify(k));
  return { cartoesJornada: cp.length, rotinasIntactas: true };
});

await check('J06', 'Conclusão: CP01 concluída quando as seis etapas (palavras, combinações, construção de frases, ouvir, falar, aplicar) são cumpridas; CP02 continua em andamento', async () => {
  await go('#/');
  await page.locator('[data-role=open-journey]').click();
  await page.waitForTimeout(400);
  await app(async () => {
    const A = window.DRG_APP, c = A.content, st = A.state, t = A.today();
    const put = (k, box) => { st.cards[k] = { k, box, due: t + 3, reps: 1, lapses: 0, streak: 1, last: t, lastResult: 'good', created: t }; };
    const r = c.routines[0];
    r.listening.forEach((id) => put(`lq:${id}:lis`, 1));
    r.reading.forEach((id) => put(`rq:${id}:rdq`, 1));
    r.questions.forEach((q) => put(`q:${q}:conv`, 1));
    r.blocks.flatMap((b) => c.blocks[b].sentences).forEach((s) => put(`sent:${s}:ord`, 1));
    r.items.forEach((i) => put(`item:${i}:rec`, 1));
    r.blocks.flatMap((b) => c.blocks[b].sentences).slice(0, 3).forEach((s) => { st.recordingsMeta[`sent:${s}`] = { at: Date.now(), count: 1 }; });
    await A.flush();
  });
  await go('#/modules');
  const units = await page.locator('[data-role=journey-unit]').evaluateAll((els) => els.map((e) => [e.dataset.unit, e.dataset.complete]));
  await go('#/module/CP01');
  const skills = await page.locator('[data-role=stage]').evaluateAll((els) => els.map((e) => `${e.dataset.state === 'done' ? '✅' : '⬜'}${e.textContent.trim()}`));
  await page.screenshot({ path: join(OUT, 'J06-conclusao.png'), fullPage: true });
  assert(JSON.stringify(units) === '[["CP01","true"],["CP02","false"]]', JSON.stringify(units));
  assert(skills.length === 6 && skills.every((x) => x.startsWith('✅')), JSON.stringify(skills));
  return { unidades: units, habilidades: skills.map((x) => x.replace(/\s+/g, ' ').slice(0, 30)) };
});

await check('J07', 'Diálogo: falas com quem fala, origem de cada bloco (conteúdo do app), notas de variante, sem “treino para a aula”', async () => {
  await go('#/routine/CP02');
  const lines = await page.locator('.para.dialogue .line').allTextContents();
  const prov = await page.locator('[data-provenance]').evaluateAll((els) => els.map((e) => e.dataset.provenance));
  const main = await page.locator('main').textContent();
  await page.screenshot({ path: join(OUT, 'J07-dialogo-cp02.png'), fullPage: true });
  assert(lines.length === 18 && /^Omar: What do you fancy doing tonight\?/.test(lines[0]) && /^Zoe: I really like this café/.test(lines[12]), JSON.stringify(lines.slice(0, 2)));
  assert(JSON.stringify(prov) === '["new","new"]', JSON.stringify(prov));
  assert(/Variante/.test(main) && /favourite/.test(main) && !/Treino para a aula/.test(main) && !/Original do livro/.test(main), 'notas/botão/origem');
  return { falas: lines.length, origem: prov };
});

await check('J08', 'Offline (servidor desligado e rede cortada): jornada abre, diálogo e áudio vêm do aparelho, sessão de ouvir funciona', async () => {
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await go('#/modules');
  const units = await page.locator('[data-role=journey-unit]').count();
  await go('#/routine/CP01');
  const t = await page.locator('main').textContent();
  const audio = await app(async () => { const s = window.DRG_APP.content.sentences['CP01-B1-S2']; const r = await fetch(`audio/${s.au}.ogg`); return { ok: r.ok, bytes: (await r.arrayBuffer()).byteLength }; });
  await seedDue(['lq:CP.L6:lis']);
  await app(async () => { const c = window.DRG_APP.state.cards['rq:CP.R5:rdq']; if (c) c.due = window.DRG_APP.today() + 2; await window.DRG_APP.flush(); }); // só o ouvir vence agora
  await go('#/session?mode=review');
  const ex = await app(() => window.DRG_APP.debugExercise.type);
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  assert(units === 2 && /A new face at the office/.test(t) && audio.ok && audio.bytes > 1000 && ex === 'listen', JSON.stringify({ units, audio, ex }));
  return { unidades: units, audio, exercicio: ex };
});

await check('J10', 'Speaking: o Speaking Lab abre as falas da unidade (lista e fala isolada) com gravação; nada das rotinas', async () => {
  await go('#/lab?routine=CP01');
  const list = await page.locator('main').textContent();
  await go('#/lab?sentence=CP01-B1-S7');
  const one = await page.locator('main').textContent();
  const rec = await page.locator('main .rec-btn').count();
  await page.screenshot({ path: join(OUT, 'J10-lab-fala.png'), fullPage: true });
  assert(/I don't think we've met/.test(list) && !/R01|wake up at 5/.test(list), list.slice(0, 160));
  assert(/have you met Daniel/.test(one) && rec >= 1, `${one.slice(0, 120)} rec=${rec}`);
  return { lab: 'falas do CP01', gravar: rec };
});

await check('J09', 'Layout 412 px sem rolagem horizontal (Início da jornada, diálogo, sessão) e nenhum erro/requisição externa', async () => {
  const over = [];
  for (const hsh of ['#/', '#/routine/CP01', '#/routine/CP02', '#/explore', '#/session?routine=CP02']) {
    await go(hsh);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }));
    if (m.sw > m.w) over.push(`${hsh}:${m.sw}`);
  }
  const relevant = errors.filter((e) => !/net::|Failed to fetch|ERR_INTERNET_DISCONNECTED/.test(e));
  assert(!over.length && !external.length && !relevant.length, JSON.stringify({ over, external: external.slice(0, 3), errors: relevant.slice(0, 3) }));
  return { semRolagem: true, externas: 0, erros: 0 };
});

await ctx.close();
server.close();
rmSync(PROFILE, { recursive: true, force: true });
const summary = { when: new Date().toISOString(), environment: 'Chromium (Playwright) headless, Linux — não é o aparelho real', passed: results.filter((r) => r.status === 'aprovado').length, failed: results.filter((r) => r.status !== 'aprovado').length, results };
writeFileSync(join(OUT, 'journey-results.json'), JSON.stringify(summary, null, 1));
console.log(`\n${summary.passed} aprovados, ${summary.failed} reprovados`);
process.exit(summary.failed ? 1 : 0);
