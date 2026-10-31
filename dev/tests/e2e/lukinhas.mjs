// Daily Routine do Lukinhas no app (Chromium, 412 px): dez sessões, texto integral com tradução e expressões tocáveis,
// áudio local, etapas (palavras, expressões com “mais natural”, ouvir, Speaking Lab do módulo, aplicar e produção
// livre), progresso próprio, offline e layout. Uso: node tests/e2e/lukinhas.mjs <pasta-do-site> <caminho-base> [evidências].
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/lukinhas');
mkdirSync(OUT, { recursive: true });
const PORT = 8798, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });
const TEXTS = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/lukinhas-texts.json'), 'utf8')).texts;

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

let server = await serve(SITE, PORT);
const stopServer = () => new Promise((r) => { server.close(r); if (server.closeAllConnections) server.closeAllConnections(); });
const errors = [], external = [];
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true,
  args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'] });
const page = ctx.pages()[0] || await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
const go = async (hash) => { await page.goto(BASE + hash); await page.waitForTimeout(700); };
const app = (fn, arg) => page.evaluate(fn, arg);
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
const noHScroll = () => app(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const stages = () => app(() => [...document.querySelectorAll('[data-role=stage]')].map((li) => `${li.dataset.stage}:${li.dataset.state}`));
const types = new Set();

async function answer() {
  const ex = await app(() => { const e = window.DRG_APP.debugExercise; return e ? { type: e.type, options: e.options, targets: e.targets, target: e.target, pieces: e.pieces, shuffled: e.type === 'order' ? e.shuffled : null } : null; });
  if (!ex) throw new Error('sem exercício');
  types.add(ex.type);
  const bar = page.locator('.actionbar');
  const clickBar = (name) => bar.getByRole('button', { name, exact: true }).click();
  switch (ex.type) {
    case 'learn': await clickBar('Próximo'); return ex.type;
    case 'mc': await page.locator('.options .option', { hasText: ex.options.find((o) => o.correct).pt }).first().click(); break;
    case 'listen': case 'read': case 'nat': await page.locator('.options .option', { hasText: ex.options.find((o) => o.correct).text }).first().click(); break;
    case 'recall': case 'cloze': await page.locator('.ex-area input').first().fill(ex.type === 'cloze' ? ex.target : ex.targets[0]); await clickBar('Verificar'); break;
    case 'write': await page.locator('.ex-area textarea').first().fill(ex.targets[0]); await clickBar('Verificar'); break;
    case 'order': {
      const used = new Set();
      for (const p of ex.pieces) { const i = ex.shuffled.findIndex((x, j) => x === p && !used.has(j)); used.add(i); await page.locator('.tiles:not(.answer) .tile').nth(i).click(); }
      await clickBar('Verificar'); break;
    }
    case 'pairs': {
      const items = await app(() => window.DRG_APP.debugExercise.items.map((i) => ({ en: i.en, pt: i.pt })));
      for (const p of items) { await page.locator('.pairs .option.en', { hasText: p.en }).first().click(); await page.locator('.pairs .option:not(.en)', { hasText: p.pt }).first().click(); }
      break;
    }
    case 'conv': case 'tell': case 'retell': {
      await page.locator('.ex-area textarea').first().fill('I wake up early, make my bed and feed my dog. Then I have breakfast, take a shower and help around the house.');
      await clickBar('Ver modelo e avaliar');
      await page.getByRole('button', { name: 'Consegui', exact: true }).click();
      return ex.type;
    }
    case 'seq': {
      const ids = await app(() => window.DRG_APP.debugExercise.sentences.map((s) => s.en));
      for (const t of ids) await page.locator('.seq-item', { hasText: t.slice(0, 40) }).first().click();
      await clickBar('Verificar'); break;
    }
    case 'summary': return 'summary';
    default: throw new Error('tipo ' + ex.type);
  }
  await page.waitForTimeout(100);
  await clickBar('Continuar');
  return ex.type;
}
async function completeStage(mod, stage, n = 8) {
  for (let i = 0; i < n; i++) {
    await go(`#/session?routine=${mod}&stage=${stage}`);
    for (let k = 0; k < 40; k++) {
      const t = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
      if (!t || t === 'summary') break;
      await answer();
      await page.waitForTimeout(60);
    }
    await go(`#/module/${mod}`);
    if ((await stages()).includes(`${stage}:done`)) return true;
  }
  return false;
}

await check('K01', 'Lukinhas é o protagonista fixo existente: aparece na escolha de histórias com esse nome; a Daily Routine dele tem as dez sessões', async () => {
  await go('#/');
  await page.waitForTimeout(2500);
  // personagens são protagonistas das histórias (não perfis nem avatares): a troca é feita em “Histórias”
  await go('#/stories');
  const names = await app(() => [...document.querySelectorAll('[data-role=story]')].map((b) => [b.dataset.character, b.querySelector('b').textContent]));
  await page.click('[data-role=story][data-character=lucas-kid]'); await page.waitForTimeout(600);
  await go('#/');
  const home = await app(() => ({ ctx: (document.querySelector('[data-role=journey-context]') || {}).textContent || '', dr: document.querySelector('[data-role=track-dr]').textContent, profile: window.DRG_APP.state.activeProfile }));
  await go('#/dr');
  const mods = await app(() => [...document.querySelectorAll('[data-role=module-card]')].map((a) => a.dataset.unit));
  await shot('K01-sessoes');
  assert(JSON.stringify(names) === '[["lucas","Lucas"],["karla","Karla"],["lucas-kid","Lukinhas"],["heitor","Heitor"]]', JSON.stringify(names));
  assert(/História de Lukinhas/.test(home.ctx) && /L01/.test(home.dr) && home.profile === 'lucas-kid', JSON.stringify(home));
  assert(mods.join() === 'L01,L02,L03,L04,L05,L06,L07,L08,L09,L10' && await noHScroll(), mods.join());
  return { historias: names.map((n) => n[1]), sessoes: mods.length };
});

await check('K02', 'Texto de cada sessão: integral (igual ao aprovado), título, foco, nível, objetivo, língua em contexto, vocabulário prioritário e tradução', async () => {
  const bad = [];
  for (const id of Object.keys(TEXTS)) {
    await go(`#/routine/${id}`);
    const t = await app(() => [...document.querySelectorAll('.para .sent')].map((s) => s.textContent).join(' '));
    const meta = await app(() => ({ focus: !!document.querySelector('[data-role=focus]'), level: !!document.querySelector('[data-role=level]'), grammar: !!document.querySelector('[data-role=grammar]'), vocab: document.querySelectorAll('[data-role=session-vocab] .hl-chip').length, hl: document.querySelectorAll('.hl-expr').length }));
    if (t !== TEXTS[id] || !meta.focus || !meta.level || !meta.grammar || meta.vocab < 7 || meta.hl < 7) bad.push({ id, same: t === TEXTS[id], ...meta });
  }
  await go('#/routine/L05');
  await page.getByRole('button', { name: 'Mostrar tradução' }).click();
  const pt = await app(() => [...document.querySelectorAll('.para-pt')].map((p) => p.textContent).join(' '));
  await shot('K02-texto-L05');
  assert(!bad.length, JSON.stringify(bad));
  assert(/nove e quarenta/.test(pt) && /onze e meia/.test(pt) && await noHScroll(), pt.slice(0, 120));
  return { sessoes: 10, textosIntegros: true, traducao: 'L05 com horários' };
});

await check('K03', 'Expressão tocável: significado, explicação, exemplo adicional com tradução e áudio local (expressão e exemplo)', async () => {
  await go('#/routine/L06');
  await page.locator('.hl-expr', { hasText: 'kick back' }).first().click();
  await page.waitForTimeout(300);
  const card = await app(() => { const c = document.querySelector('[data-role=expression]'); return c ? { item: c.dataset.item, text: c.textContent } : null; });
  await shot('K03-expressao');
  const audio = await app(async (id) => { const it = window.DRG_APP.content.items[id]; const f = async (k) => { const r = await fetch(`audio/${k}.ogg`); return r.ok && (await r.arrayBuffer()).byteLength > 1000; }; return { expr: await f(it.au), ex: await f(it.extra.au) }; }, card && card.item);
  await page.keyboard.press('Escape');
  assert(card && card.item === 'lk.kick-back' && /relaxar/.test(card.text) && /informal/.test(card.text) && /Outro exemplo/.test(card.text) && /After a long day/.test(card.text), JSON.stringify(card));
  assert(audio.expr && audio.ex, JSON.stringify(audio));
  return { expressao: 'kick back', audio };
});

await check('K04', 'Áudio britânico do texto: todas as frases das dez sessões têm clipe local', async () => {
  const r = await app(async () => { const c = window.DRG_APP.content; const s = Object.values(c.sentences); return { total: s.length, embedded: s.filter((x) => window.DRG_AUDIO.files[x.au]).length }; });
  const one = await app(async () => { const s = window.DRG_APP.content.sentences['L10-B3-S3']; const r = await fetch(`audio/${s.au}.ogg`); return r.ok; });
  assert(r.total === 66 && r.embedded === 66 && one, JSON.stringify(r));
  return r;
});

await check('K05', 'Sessão 01, etapas 1 e 2: Palavras-chave e Expressões praticadas (incluindo “mais natural” e completar), cadeado abre a etapa seguinte', async () => {
  await go('#/module/L01');
  const head = await page.locator('[data-role=session-text]').count();
  const st0 = await stages();
  const v = await completeStage('L01', 'vocab');
  const e = await completeStage('L01', 'expr');
  const st1 = await stages();
  await shot('K05-modulo-L01');
  assert(head === 1 && st0.join() === 'vocab:open,expr:locked,build:locked,listen:locked,speak:locked,apply:locked' && v && e && st1[2] === 'build:open', JSON.stringify({ head, st0, st1 }));
  return { antes: st0[0], depois: st1.slice(0, 3), tipos: [...types] };
});

await check('K06', '“Mais natural” no app: a frase mostra a forma simples; escolher a expressão britânica; a frase do texto aparece depois', async () => {
  // sessão 06: depois de reconhecer as expressões, o exercício aparece para itens com forma simples
  await app(async () => { const A = window.DRG_APP, st = A.state, t = A.today(); for (const id of ['lk.kick-back', 'lk.turn-up', 'lk.head-outside', 'lk.make-our-way', 'lk.grab']) st.cards[`item:${id}:rec`] = { k: `item:${id}:rec`, box: 2, due: t + 5, reps: 2, lapses: 0, streak: 2, last: t, lastResult: 'good', created: t }; await A.flush(); });
  let found = null;
  await go('#/session?routine=L06&stage=vocab'); // a etapa 1 da L06 abre primeiro; “mais natural” vale nas duas etapas de palavras
  for (let i = 0; i < 25 && !found; i++) {
    const t = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
    if (!t || t === 'summary') break;
    if (t === 'nat') { found = await app(() => { const e = window.DRG_APP.debugExercise; return { plain: e.plain, right: e.options.find((o) => o.correct).text, shown: document.querySelector('[data-role=nat-sentence]').textContent }; }); break; }
    await answer();
  }
  if (!found) { // a etapa 1 pode não ter forma simples: vai para a 2, liberada pela prática
    await completeStage('L06', 'vocab');
    await go('#/session?routine=L06&stage=expr');
    for (let i = 0; i < 25 && !found; i++) {
      const t = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
      if (!t || t === 'summary') break;
      if (t === 'nat') { found = await app(() => { const e = window.DRG_APP.debugExercise; return { plain: e.plain, right: e.options.find((o) => o.correct).text, shown: document.querySelector('[data-role=nat-sentence]').textContent }; }); break; }
      await answer();
    }
  }
  assert(found, 'exercício “mais natural” não apareceu');
  await shot('K06-mais-natural');
  await page.locator('.options .option', { hasText: found.right }).first().click();
  await page.waitForTimeout(200);
  const after = await app(() => ({ ok: !!document.querySelector('.options .option.right'), text: document.querySelector('.ex-area').textContent }));
  assert(found.shown.includes(found.plain) && after.ok && /No texto/.test(after.text), JSON.stringify({ found, after: after.text.slice(0, 120) }));
  return found;
});

await check('K07', 'Construção de frases e Ouvir e entender (L01): montar/escrever as frases da sessão; depois a frase toca sem texto; etapas concluídas', async () => {
  const built = await completeStage('L01', 'build', 10);
  if (!built) throw new Error('construção de frases não concluiu: ' + (await stages()).join());
  await go('#/session?routine=L01&stage=listen');
  const before = await app(() => ({ type: window.DRG_APP.debugExercise.type, revealed: !!document.querySelector('.ex-area .para.dialogue') }));
  const ok = await completeStage('L01', 'listen');
  assert(before.type === 'listen' && !before.revealed && ok, JSON.stringify(before));
  return { construcao: built, tipo: before.type, concluida: ok };
});

await check('K08', 'Speaking Lab da sessão: só frases e perguntas do Lukinhas; gravar e reabrir a gravação; 3 gravações concluem a etapa', async () => {
  await go('#/lab?routine=L01&module=1');
  const head = await page.locator('[data-role=lab-module]').count();
  const list = await page.locator('main').textContent();
  for (const sid of ['L01-B1-S1', 'L01-B1-S2', 'L01-B1-S3']) {
    await go(`#/lab?sentence=${sid}`);
    await page.locator('.rec-btn').click(); await page.waitForTimeout(1300); await page.locator('.rec-btn').click(); await page.waitForTimeout(900);
  }
  const ref = await page.locator('main').textContent();
  await shot('K08-lab');
  await go('#/module/L01');
  const st = await stages();
  assert(head === 1 && /wake up very early/.test(list) && !/5:00 a\.m\.|on-site/i.test(list) && /clean up after him/.test(ref) && st[4] === 'speak:done', JSON.stringify({ head, st }));
  return { etapa: st[4] };
});

await check('K09', 'Aplicar (L01): responder, recontar e falar de si sem ler; as seis etapas concluídas', async () => {
  const ok = await completeStage('L01', 'apply', 10);
  const st = await stages();
  const done = await app(() => window.DRG_APP.state.cards['q:L.Q3:conv']);
  assert(ok && st.every((s) => s.endsWith(':done')) && done && done.reps > 0, JSON.stringify({ st, done }));
  return { etapas: st, producao: 'L.Q3 respondida', tipos: [...types] };
});

await check('K10', 'Progresso próprio do Lukinhas: separado do Lucas; persiste ao recarregar', async () => {
  const lk = await app(() => ({ p: window.DRG_APP.state.activeProfile, cards: Object.keys(window.DRG_APP.state.cards).length, out: Object.keys(window.DRG_APP.state.cards).filter((k) => !/:(L\d\d|L\.Q|lk\.)/.test(k)).length }));
  await page.reload(); await page.waitForTimeout(800);
  const again = await app(() => Object.keys(window.DRG_APP.state.cards).length);
  const lucas = await app(() => Object.keys((window.DRG_APP.state.profiles.lucas || {}).cards || {}).filter((k) => /:(L\d\d|L\.Q|lk\.)/.test(k)).length);
  assert(lk.p === 'lucas-kid' && lk.cards > 20 && lk.out === 0 && again === lk.cards && lucas === 0, JSON.stringify({ lk, again, lucas }));
  return { cartoes: lk.cards, lucasSemLukinhas: true };
});

await check('K11', 'Offline (servidor desligado e rede cortada): abre a sessão, mostra texto, expressão e áudio; segue a prática', async () => {
  await stopServer();
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(1000);
  await go('#/routine/L10');
  const t = await app(() => [...document.querySelectorAll('.para .sent')].map((s) => s.textContent).join(' '));
  await page.locator('.hl-expr', { hasText: 'pretty much' }).first().click(); await page.waitForTimeout(200);
  const sheetOk = await page.locator('[data-role=expression]').count();
  await page.keyboard.press('Escape');
  const audio = await app(async () => { const s = window.DRG_APP.content.sentences['L10-B1-S1']; const r = await fetch(`audio/${s.au}.ogg`); return r.ok && (await r.arrayBuffer()).byteLength > 1000; });
  await go('#/session?routine=L02&stage=vocab');
  const ex = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  assert(t === TEXTS.L10 && sheetOk === 1 && audio && ex && ex !== 'summary', JSON.stringify({ same: t === TEXTS.L10, sheetOk, audio, ex }));
  return { texto: 'L10 integral', expressao: true, audio, exercicio: ex };
});

await check('K12', 'Layout 412 px sem rolagem horizontal nas telas do módulo; nenhum erro nem requisição externa', async () => {
  const bad = [];
  for (const hsh of ['#/modules', '#/module/L05', '#/routine/L10', '#/words/L08?kind=expr', '#/lab?routine=L09&module=1', '#/session?routine=L02&stage=vocab']) { await go(hsh); if (!(await noHScroll())) bad.push(hsh); }
  assert(!bad.length && !errors.length && !external.length, JSON.stringify({ bad, errors: errors.slice(0, 3), external: external.slice(0, 3) }));
  return { telas: 6, erros: 0, externas: 0 };
});

await ctx.close();
await stopServer();
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 1));
const ok = results.filter((r) => r.status === 'aprovado').length;
console.log(`\n${ok} aprovados, ${results.length - ok} reprovados`);
process.exit(ok === results.length ? 0 : 1);
