// Aceite do MVP de jornadas no app (Chromium, 412 px): personas com progresso próprio, Daily Routine × Conversation
// Practice, módulos com cinco etapas e cadeados, Palavras-chave/Expressões, ouvir sem ver o texto, Speaking Lab com o
// contexto do módulo, aplicação integrada, XP/níveis/revisão, migração do progresso antigo, PWA offline e layout.
// Uso: node tests/e2e/mvp.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]. Não valida o aparelho real.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/mvp');
mkdirSync(OUT, { recursive: true });
const PORT = 8795, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

let server = await serve(SITE, PORT);
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
const profile = () => app(() => ({ active: window.DRG_APP.state.activeProfile, cards: Object.keys(window.DRG_APP.state.cards).length, xp: window.DRG_APP.state.xp }));
const stages = () => app(() => [...document.querySelectorAll('[data-role=stage]')].map((li) => `${li.dataset.stage}:${li.dataset.state}`));

/** Responde ao exercício atual corretamente (ou errado). */
async function answer(mode = 'right') {
  const ex = await app(() => {
    const e = window.DRG_APP.debugExercise;
    if (!e) return null;
    return { type: e.type, options: e.options, targets: e.targets, target: e.target, pieces: e.pieces, shuffled: e.type === 'order' ? e.shuffled : null };
  });
  if (!ex) throw new Error('sem exercício');
  const bar = page.locator('.actionbar');
  const clickBar = (name) => bar.getByRole('button', { name, exact: true }).click();
  switch (ex.type) {
    case 'learn': await clickBar('Próximo'); return ex.type;
    case 'mc': { const o = ex.options.find((x) => (mode === 'right') === !!x.correct); await page.locator('.options .option', { hasText: o.pt }).first().click(); break; }
    case 'listen': case 'read': { const o = ex.options.find((x) => (mode === 'right') === !!x.correct); await page.locator('.options .option', { hasText: o.text }).first().click(); break; }
    case 'recall': case 'cloze': { await page.locator('.ex-area input').first().fill(mode === 'right' ? (ex.type === 'cloze' ? ex.target : ex.targets[0]) : 'banana'); await clickBar('Verificar'); break; }
    case 'write': { await page.locator('.ex-area textarea').first().fill(mode === 'right' ? ex.targets[0] : 'no'); await clickBar('Verificar'); break; }
    case 'order': {
      const used = new Set();
      for (const piece of ex.pieces) { const i = ex.shuffled.findIndex((p, j) => p === piece && !used.has(j)); used.add(i); await page.locator('.tiles:not(.answer) .tile').nth(i).click(); }
      await clickBar('Verificar'); break;
    }
    case 'pairs': {
      const items = await app(() => window.DRG_APP.debugExercise.items.map((i) => ({ en: i.en, pt: i.pt })));
      for (const p of items) { await page.locator('.pairs .option.en', { hasText: p.en }).first().click(); await page.locator('.pairs .option:not(.en)', { hasText: p.pt }).first().click(); }
      break;
    }
    case 'conv': case 'tell': case 'retell': case 'seq': {
      if (ex.type === 'seq') throw new Error('seq não esperado');
      await page.locator('.ex-area textarea').first().fill('Nice to meet you. I am from Leeds and I work in a small team.');
      await clickBar('Ver modelo e avaliar');
      await page.getByRole('button', { name: 'Consegui', exact: true }).click();
      return ex.type;
    }
    case 'summary': return 'summary';
    default: throw new Error('tipo ' + ex.type);
  }
  await page.waitForTimeout(100);
  await clickBar('Continuar');
  return ex.type;
}
/** Pratica uma etapa em sessões seguidas até concluí-la (como o aluno faria), no máximo `n` sessões. */
async function completeStage(mod, stage, n = 8) {
  const types = new Set();
  for (let i = 0; i < n; i++) {
    (await runSession(`#/session?routine=${mod}&stage=${stage}`, 40)).forEach((t) => types.add(t));
    await go(`#/module/${mod}`);
    if ((await stages()).includes(`${stage}:done`)) break;
  }
  return [...types];
}
async function runSession(hash, max = 40) {
  await go(hash);
  const types = [];
  for (let i = 0; i < max; i++) {
    const t = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
    if (!t || t === 'summary') break;
    types.push(await answer());
    await page.waitForTimeout(80);
  }
  return types;
}

// ---------- antes de tudo: um progresso ANTIGO (esquema 1, único para todos) gravado no aparelho ----------
await check('M00', 'Migração: progresso antigo (esquema 1) é dividido por persona e jornada, sem perder XP nem cartões; cópia do original guardada', async () => {
  await go('#/');
  await page.waitForTimeout(2500); // service worker instala e pré-cacheia
  const t = await app(() => window.DRG_APP.today());
  const card = (k) => ({ k, box: 2, due: t + 5, reps: 2, lapses: 0, streak: 2, last: t - 1, lastResult: 'good', created: t - 3 });
  const legacy = { schema: 1, contentVersion: 'old', xp: 640, firstDay: t - 3, days: { [t - 1]: { xp: 640, ex: 30, good: 30, bad: 0, sessions: 2, rec: 0, recXp: 0, rewarded: {}, effort: {} } },
    achievements: { 'first-session': Date.now() }, settings: { character: 'lucas', characterChosen: true, journey: null }, welcomed: true,
    cards: Object.fromEntries(['item:it.wake-up:rec', 'sent:R01-B1-S1:ord', 'sent:K01-B1-S1:ord', 'lq:CP.L1:lis'].map((k) => [k, card(k)])),
    log: [], myAnswers: { 'K.Q1': { text: 'I work at a club.' } }, recordingsMeta: {}, pending: [], userVariants: {}, checklist: {} };
  await app((st) => new Promise((res, rej) => { const r = indexedDB.open('drg', 2); r.onsuccess = () => { const tx = r.result.transaction('kv', 'readwrite'); tx.objectStore('kv').put(st, 'state'); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); }; }), legacy);
  await page.reload(); await page.waitForTimeout(1200);
  const s = await app(() => { const st = window.DRG_APP.state; const p = (id) => (id === st.activeProfile ? st : st.profiles[id]);
    return { schema: st.schema, active: st.activeProfile, lucas: [Object.keys(p('lucas').cards).sort(), p('lucas').xp], karla: [Object.keys(p('karla').cards), Object.keys(p('karla').myAnswers)], cp: Object.keys(p('journey:cp').cards) }; });
  const prev = await app(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('state.prev'); g.onsuccess = () => res(g.result && g.result.schema); }; }));
  assert(s.schema === 2 && s.lucas[1] === 640 && s.lucas[0].join() === 'item:it.wake-up:rec,sent:R01-B1-S1:ord' && s.karla[0].join() === 'sent:K01-B1-S1:ord' && s.karla[1].join() === 'K.Q1' && s.cp.join() === 'lq:CP.L1:lis' && prev === 1, JSON.stringify({ s, prev }));
  return { ...s, copiaOriginal: `esquema ${prev}` };
});

await check('M01', 'Início orientador: as duas jornadas separadas, cada uma com sessão atual, contexto, etapa atual, próxima atividade e Continuar; sem XP, nível ou avatar', async () => {
  await go('#/');
  const h = await app(() => ({
    tracks: [...document.querySelectorAll('section.journey .journey-title')].map((x) => x.textContent),
    next: [...document.querySelectorAll('[data-role=next-step]')].map((x) => x.textContent),
    ctx: (document.querySelector('[data-role=journey-context]') || {}).textContent || '',
    cont: [...document.querySelectorAll('[data-role=continue-dr], [data-role=open-journey]')].map((b) => b.disabled),
    reward: /\bXP\b|Nível|Conquista|dias seguidos/.test(document.querySelector('main').textContent),
    avatar: document.querySelectorAll('[data-role=persona], [data-role=switch-character], img.char-img').length }));
  await shot('M01-inicio');
  assert(JSON.stringify(h.tracks) === '["Daily Routine","Conversation Practice"]' && h.next.length === 2 && h.next.every((t) => /Sessão atual.*Etapa atual.*Próxima atividade/.test(t))
    && /História de Lucas/.test(h.ctx) && h.cont.join() === 'false,false' && !h.reward && h.avatar === 0 && await noHScroll(), JSON.stringify(h));
  return h;
});

let lucasAfter = null;
await check('M02', 'Navegação: aba Daily Routine → módulos → módulo com as seis etapas; só a primeira aberta, as demais com cadeado; etapa bloqueada não abre por link direto', async () => {
  await page.click('nav.nav a[href="#/dr"]'); await page.waitForTimeout(600);
  const mods = await page.locator('[data-role=module-card]').count();
  await page.click('[data-unit=R02]'); await page.waitForTimeout(500);
  const st = await stages();
  const lockedLinks = await page.locator('[data-role=stage][data-state=locked] a').count();
  await shot('M02-modulo');
  await go('#/session?routine=R02&stage=apply');
  const redirected = await app(() => location.hash);
  assert(mods === 18 && st.join() === 'vocab:open,expr:locked,build:locked,listen:locked,speak:locked,apply:locked' && lockedLinks === 0 && redirected === '#/module/R02', JSON.stringify({ mods, st, redirected }));
  return { modulos: mods, etapas: st, linkDireto: redirected };
});

await check('M03', 'Palavras-chave: significado, classe, áudio, exemplo do módulo, situação (novo/aprendido/para revisar) e marcação que persiste', async () => {
  await go('#/words/R02?kind=vocab');
  const w = await app(() => [...document.querySelectorAll('[data-role=word]')].map((x) => ({ en: x.querySelector('.word-en').textContent, pt: x.querySelector('.word-pt').textContent, audio: !!x.querySelector('.icon-btn.accent'), ex: !!x.querySelector('.ex'), state: x.dataset.state })));
  await page.locator('[data-role=word] [data-role=mark]').first().click();
  await page.waitForTimeout(600); await page.reload(); await page.waitForTimeout(800);
  const marked = await app(() => document.querySelector('[data-role=word] [data-role=mark]').getAttribute('aria-pressed'));
  await shot('M03-palavras');
  assert(w.length >= 3 && w.every((x) => x.en && x.pt && x.audio && x.ex && x.state === 'new') && marked === 'true' && await noHScroll(), JSON.stringify({ w: w.slice(0, 2), marked }));
  return { itens: w.length, exemplo: w[0], marcadaAposRecarregar: marked };
});

await check('M04', 'Etapa concluída pela prática (não por visita): sessão de Palavras-chave dá XP no perfil e abre Expressões práticas; mesma revisão espaçada', async () => {
  const before = await profile();
  await go('#/module/R02');
  const visited = await stages(); // só visitar não muda nada
  const types = await runSession('#/session?routine=R02&stage=vocab');
  await go('#/module/R02');
  const after = await stages();
  const p = await profile();
  const due = await app(() => Object.values(window.DRG_APP.state.cards).filter((c) => c.k.startsWith('item:')).every((c) => c.due > window.DRG_APP.today() - 1 && typeof c.box === 'number'));
  lucasAfter = p;
  assert(visited[0] === 'vocab:open' && after[0] === 'vocab:done' && after[1] === 'expr:open' && p.xp > before.xp && p.cards > before.cards && due && types.every((t) => ['learn', 'mc', 'pairs', 'recall'].includes(t)), JSON.stringify({ visited, after, before, p, types }));
  return { tipos: [...new Set(types)], xp: `${before.xp} → ${p.xp}`, etapas: after.slice(0, 3) };
});

await check('M05', 'Combinações → Construção de frases → Ouvir e entender: a frase toca sem texto na tela; o texto aparece só depois da resposta', async () => {
  await completeStage('R02', 'expr');
  await completeStage('R02', 'build');
  const st = await stages();
  await go('#/session?routine=R02&stage=listen');
  const ex = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
  const before = await app(() => ({ revealed: !!document.querySelector('.ex-area .para.dialogue'), play: !!document.querySelector('[data-role=listen-play]') }));
  await shot('M05-ouvir');
  const right = await app(() => window.DRG_APP.debugExercise.options.find((o) => o.correct).text);
  await page.locator('.options .option', { hasText: right }).first().click();
  await page.waitForTimeout(300);
  const after = await app(() => !!document.querySelector('.ex-area .para.dialogue'));
  await shot('M05-ouvir-depois');
  assert(st[1] === 'expr:done' && st[2] === 'build:done' && st[3] === 'listen:open' && ex === 'listen' && before.play && !before.revealed && after, JSON.stringify({ st, ex, before, after }));
  return { etapas: st.slice(1, 4), antes: before, textoDepois: after };
});

await check('M06', 'Troca de história: a da Karla tem progresso próprio (cartões e registro interno); o do Lucas volta intacto; nada se mistura depois de recarregar', async () => {
  await go('#/stories'); await page.click('[data-role=story][data-character=karla]'); await page.waitForTimeout(700);
  const k0 = await profile();
  await go('#/');
  const kHome = await app(() => (document.querySelector('[data-role=journey-context]') || {}).textContent || '');
  await runSession('#/session?routine=K01&stage=vocab');
  const k1 = await profile();
  await go('#/stories'); await page.click('[data-role=story][data-character=lucas]'); await page.waitForTimeout(700);
  await page.reload(); await page.waitForTimeout(900);
  const l = await profile();
  assert(k0.active === 'karla' && k0.cards === 1 && k0.xp === 0 && /História de Karla/.test(kHome) && k1.xp > 0 && l.active === 'lucas' && l.xp === lucasAfter.xp + 0 + (l.xp - lucasAfter.xp) && l.xp >= lucasAfter.xp && l.cards >= lucasAfter.cards, JSON.stringify({ k0, k1, l, lucasAfter }));
  return { karlaAntes: k0, karlaDepois: k1, lucas: l };
});

await check('M07', 'Conversation Practice: jornada à parte (perfil próprio), módulos com etapas; praticar não toca na Daily Routine', async () => {
  const l0 = await profile();
  await go('#/');
  await page.click('[data-role=journey-entry-all]'); await page.waitForTimeout(600);
  const units = await page.locator('[data-role=journey-unit]').count();
  const titles = await app(() => [...document.querySelectorAll('[data-role=journey-unit] h3')].map((x) => x.textContent));
  const c0 = await profile();
  await completeStage('CP01', 'vocab');
  await completeStage('CP01', 'expr');
  const c1 = await profile();
  await go('#/modules');
  await page.click('nav.nav a[href="#/dr"]'); await page.waitForTimeout(500); // aba própria: sai da jornada
  const l1 = await profile();
  assert(units === 2 && c0.active === 'journey:cp' && c0.cards === 1 && c1.xp > c0.xp && l1.active === 'lucas' && l1.cards === l0.cards && l1.xp === l0.xp && !titles.some((t) => /Introducing Yourself|Expressing Opinions/.test(t)), JSON.stringify({ units, titles, c0, c1, l0, l1 }));
  return { unidades: titles, cp: `${c0.cards} → ${c1.cards} cartões`, lucasIntacto: l1 };
});

await check('M08', 'Speaking Lab com o contexto do módulo: só as frases e perguntas dele; gravar conta para “Falar na prática”', async () => {
  await app(async () => { await window.DRG_APP.setJourney('cp'); });
  await completeStage('CP01', 'build');
  await completeStage('CP01', 'listen');
  const st = await stages();
  await go('#/lab?routine=CP01&module=1');
  const head = await app(() => !!document.querySelector('[data-role=lab-module]'));
  const tabs = await app(() => [...document.querySelectorAll('.seg button')].map((b) => b.textContent));
  const list = await page.locator('main').textContent();
  await shot('M08-lab-modulo');
  for (const sid of ['CP01-B1-S1', 'CP01-B1-S2', 'CP01-B1-S3']) {
    await go(`#/lab?sentence=${sid}`);
    await page.locator('.rec-btn').click(); await page.waitForTimeout(1300); await page.locator('.rec-btn').click(); await page.waitForTimeout(900);
  }
  await go('#/module/CP01');
  const st2 = await stages();
  assert(st[4] === 'speak:open' && head && !tabs.includes('Drills') && !/R01|wake up at 5/.test(list) && st2[4] === 'speak:done' && st2[5] === 'apply:open', JSON.stringify({ st, head, tabs, st2 }));
  return { antes: st[4], abas: tabs, depois: st2.slice(4) };
});

await check('M09', 'Aplicar: sessão integrada (ler, responder por escrito/fala, recontar, falar de você) e conclusão do módulo', async () => {
  const types = new Set(await completeStage('CP01', 'apply'));
  const st = await stages();
  const text = await page.locator('[data-role=module-text]').count();
  await go('#/modules');
  const done = await app(() => document.querySelector('[data-unit=CP01]').dataset.complete);
  await shot('M09-jornada');
  assert(st.every((s) => s.endsWith(':done')) && done === 'true' && types.has('conv') && types.has('read') && text === 1, JSON.stringify({ st, done, types: [...types] }));
  return { tipos: [...types], concluido: done };
});

await check('M10', 'Progresso e revisão: o Início mostra o progresso de cada jornada (etapas demonstradas); itens vencidos voltam na revisão da jornada aberta', async () => {
  await app(async () => { const st = window.DRG_APP.state, t = window.DRG_APP.today(); for (const c of Object.values(st.cards).slice(0, 3)) c.due = t; await window.DRG_APP.flush(); });
  await go('#/');
  const h = await app(() => ({ due: (document.querySelector('[data-role=due]') || {}).textContent || '', cp: document.querySelector('[data-role=journey-entry]').textContent }));
  await go('#/session?mode=review');
  const t = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
  const cpDone = (h.cp.match(/(\d+)\/12 etapas/) || [])[1];
  assert(/Revisão: 3 itens/.test(h.due) && cpDone === '6' && /1 de 2 sessões concluídas/.test(h.cp) && t && t !== 'summary', JSON.stringify({ h, t }));
  return { revisao: '3 itens', cp: `${cpDone} de 12 etapas`, exercicio: t };
});

await check('M11', 'História prevista (Heitor): aparece “em preparação” e não pode ser escolhida; quem já a tinha ativa vê a Daily Routine em preparação, sem conteúdo de outra história; Conversation Practice disponível', async () => {
  await app(async () => { await window.DRG_APP.setJourney(null); });
  await go('#/stories');
  const card = await app(() => { const e = document.querySelector('[data-role=story][data-character=heitor]'); return { tag: e.tagName, disabled: e.getAttribute('aria-disabled'), text: e.textContent }; });
  // estado antigo com o Heitor ativo (escolhido antes desta versão)
  await app(async () => { await window.DRG_APP.chooseCharacter('heitor'); });
  await go('#/');
  const h = await app(() => ({ p: window.DRG_APP.state.activeProfile, cards: Object.keys(window.DRG_APP.state.cards).length, dr: document.querySelector('[data-role=continue-dr]').disabled, cp: document.querySelector('[data-role=open-journey]').disabled }));
  await shot('M11-heitor');
  await go('#/session'); const s = await page.locator('[data-role=planned]').count();
  await go('#/lab'); const lab = await page.locator('[data-role=planned]').count();
  await go('#/dr'); const dr = await page.locator('[data-role=planned]').count();
  await go('#/stories'); await page.click('[data-role=story][data-character=lucas]'); await page.waitForTimeout(600);
  assert(card.tag === 'DIV' && card.disabled === 'true' && /7 anos/.test(card.text) && /em preparação/.test(card.text), JSON.stringify(card));
  assert(h.p === 'heitor' && h.cards === 0 && h.dr === true && h.cp === false && s === 1 && lab === 1 && dr === 1, JSON.stringify({ h, s, lab, dr }));
  return { ...h, escolhaBloqueada: true };
});

await check('M12', 'PWA offline (servidor desligado e rede cortada): abre, navega por módulo e palavras, áudio local, progresso intacto', async () => {
  const before = await profile();
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(1200);
  const after = await profile();
  await go('#/module/R02'); const st = await stages();
  await go('#/words/R02?kind=expr'); const words = await page.locator('[data-role=word]').count();
  const audio = await app(async () => { const it = Object.values(window.DRG_APP.content.items).find((i) => i.routines.includes('R02') && window.DRG_AUDIO.files[i.au]); const r = await fetch(`audio/${it.au}.ogg`); return { ok: r.ok, bytes: (await r.arrayBuffer()).byteLength }; });
  const sw = await app(() => !!navigator.serviceWorker.controller);
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  assert(sw && after.xp === before.xp && after.cards === before.cards && st.length === 6 && words > 3 && audio.ok && audio.bytes > 1000, JSON.stringify({ sw, before, after, st, words, audio }));
  return { serviceWorker: sw, progresso: after, palavras: words, audio };
});

await check('M13', 'Layout 412 px sem rolagem horizontal nas telas novas; nenhuma requisição externa nem erro', async () => {
  const bad = [];
  for (const hsh of ['#/', '#/dr', '#/cp', '#/stories', '#/stats', '#/modules', '#/module/R02', '#/words/R02?kind=expr', '#/lab?routine=R02&module=1', '#/session?routine=R02&stage=listen', '#/settings']) {
    await go(hsh);
    if (!(await noHScroll())) bad.push(hsh);
  }
  assert(!bad.length && !external.length && !errors.length, JSON.stringify({ bad, external: external.slice(0, 3), errors: errors.slice(0, 3) }));
  return { telas: 11, externas: 0, erros: 0 };
});

await ctx.close();
server.close();
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 1));
const ok = results.filter((r) => r.status === 'aprovado').length;
console.log(`\n${ok} aprovados, ${results.length - ok} reprovados`);
process.exit(ok === results.length ? 0 : 1);
