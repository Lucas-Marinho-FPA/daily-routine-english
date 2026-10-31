// Personagens no app (Chromium): seleção Lucas ↔ Karla, sessão só com o conteúdo do personagem, progresso isolado,
// preferência persistida, funcionamento offline e layout no celular. Não valida o Galaxy S25+ real.
// Uso: node tests/e2e/characters.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/characters');
mkdirSync(OUT, { recursive: true });
const PORT = 8794, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

let server = await serve(SITE, PORT);
const errors = [], external = [];
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 430, height: 932 }, isMobile: true, hasTouch: true });
const page = ctx.pages()[0] || await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
const go = async (hash) => { await page.goto(BASE + hash); await page.reload(); await page.waitForTimeout(900); };
const app = (fn, arg) => page.evaluate(fn, arg);
// cartões por dono: só do Lucas (fora do pacote da Karla), só da Karla, e vocabulário compartilhado; “lucasState” = estado exato dos do Lucas
// progresso por perfil: cada persona tem os próprios cartões e XP (o ativo fica no topo do estado)
const cardsBy = () => app(() => {
  const st = window.DRG_APP.state;
  const of = (id) => (id === st.activeProfile ? { cards: st.cards, xp: st.xp } : st.profiles[id] || { cards: {}, xp: 0 });
  const L = of('lucas').cards, K = of('karla').cards;
  const kshared = Object.keys(K).filter((x) => /^item:it\./.test(x)).length;
  const lucasState = JSON.stringify(Object.keys(L).sort().map((x) => [x, L[x].box, L[x].due, L[x].reps]));
  const karlaOutside = Object.keys(K).filter((x) => !/:(K\d\d|K\.|k\.|it\.)/.test(x)).length; // na Karla, só conteúdo dela (e vocabulário genérico)
  return { lucas: Object.keys(L).length, karla: Object.keys(K).length, shared: kshared, karlaOutside, xp: { lucas: of('lucas').xp, karla: of('karla').xp }, lucasState };
});
/** Avança pelos exercícios “aprender” e de múltipla escolha (resposta certa) e devolve os IDs vistos. */
async function study(n) {
  const seen = [];
  for (let i = 0; i < n; i++) {
    const ex = await app(() => { const e = window.DRG_APP.debugExercise; if (!e) return null; return { type: e.type, id: e.entry ? e.entry.id : null, unit: e.entry ? e.entry.unit : null, right: e.options ? (e.options.find((o) => o.correct) || {}).pt : null }; });
    if (!ex || ex.type === 'summary') break;
    seen.push(`${ex.unit}:${ex.id}`);
    const bar = page.locator('.actionbar');
    if (ex.type === 'learn') await bar.getByRole('button', { name: 'Próximo', exact: true }).click();
    else if (ex.type === 'mc') { await page.locator('.options .option', { hasText: ex.right }).first().click(); await page.waitForTimeout(150); await bar.getByRole('button', { name: 'Continuar', exact: true }).click(); }
    else break;
    await page.waitForTimeout(250);
  }
  return seen;
}

const savedSettings = () => app(async () => {
  const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
  const v = await new Promise((res) => { const g = db.transaction('kv').objectStore('kv').get('state'); g.onsuccess = () => res(g.result); });
  db.close();
  return v && v.settings ? { character: v.settings.character, chosen: v.settings.characterChosen } : null;
});
// grava o estado e o põe também na memória do app (o app grava o que tem na memória ao recarregar)
const putState = (st) => app((x) => new Promise((res) => { window.DRG_APP.state = JSON.parse(JSON.stringify(x)); const r = indexedDB.open('drg'); r.onsuccess = () => { const tx = r.result.transaction('kv', 'readwrite'); tx.objectStore('kv').put(x, 'state'); tx.oncomplete = () => { r.result.close(); res(); }; }; }), st);
const homeName = () => page.locator('[data-role=active-character] [data-role=active-name]').textContent();

await check('C01', 'Primeira abertura: escolha pelo nome (Lucas marcado como padrão); sem confirmar nada é escolhido; escolher a Karla e continuar', async () => {
  await go('#/');
  await page.waitForTimeout(2500); // service worker instala e pré-cacheia
  const pick = page.locator('[data-role=character-pick]');
  assert(await pick.isVisible(), 'tela de escolha não apareceu');
  const opts = await pick.locator('[role=radio]').evaluateAll((els) => els.map((e) => [e.dataset.character, e.getAttribute('aria-checked'), e.querySelector('.char-name').textContent]));
  assert(JSON.stringify(opts) === '[["lucas","true","Lucas"],["karla","false","Karla"],["lucas-kid","false","Lukinhas"],["heitor","false","Heitor"]]', JSON.stringify(opts));
  assert(await pick.locator('img').count() === 0, 'imagem na escolha');
  const s0 = await app(() => ({ ch: window.DRG_APP.character.id, same: window.DRG_APP.content === window.DRG_APP.baseContent }));
  assert(s0.ch === 'lucas' && s0.same, JSON.stringify(s0));
  await page.screenshot({ path: join(OUT, 'C01-escolha-inicial.png') });
  // sem confirmar: reabrir mostra a escolha de novo (nada foi marcado como escolhido)
  await go('#/');
  assert(await page.locator('[data-role=character-pick]').isVisible(), 'a escolha sumiu sem confirmação');
  assert((await savedSettings()).chosen === false, 'marcado como escolhido sem confirmar');
  await page.locator('[data-role=character-pick] [role=radio][data-character=karla]').click();
  const btn = page.locator('[data-role=character-pick] [data-role=confirm-character]');
  assert(/Continuar com Karla/.test(await btn.textContent()), await btn.textContent());
  await btn.click();
  await page.waitForTimeout(500);
  assert(await homeName() === 'Karla', 'Início não mostra a Karla');
  assert(await page.locator('[data-role=character-pick]').count() === 0, 'escolha continua na tela');
  const s = await app(() => ({ ch: window.DRG_APP.character.id, routines: window.DRG_APP.content.routines.map((r) => r.id), cards: Object.keys(window.DRG_APP.state.cards).length }));
  assert(s.ch === 'karla' && s.routines[0] === 'K01' && s.cards === 0, JSON.stringify(s));
  // recarregar: a escolha persiste e a tela de escolha não volta
  await go('#/');
  const saved = await savedSettings();
  assert(await homeName() === 'Karla' && await page.locator('[data-role=character-pick]').count() === 0 && saved.character === 'karla' && saved.chosen === true, JSON.stringify(saved));
  await page.screenshot({ path: join(OUT, 'C01-inicio-karla.png') });
  // volta ao Lucas pelo Início para criar a base de progresso dele
  await page.locator('[data-role=switch-character]').click();
  await page.locator('[data-role=active-character] [role=radio][data-character=lucas]').click();
  await page.locator('[data-role=active-character] [data-role=confirm-character]').click();
  await page.waitForTimeout(500);
  assert(await homeName() === 'Lucas', 'troca para o Lucas falhou');
  return { opcoes: opts.map((o) => o[2]), padrao: 'lucas', escolhido: 'karla', salvo: saved };
});

let lucasAfter = null, xpBefore = 0;
await check('C02', 'Progresso do Lucas criado numa sessão (base para conferir o isolamento)', async () => {
  await go('#/session');
  const seen = await study(10);
  lucasAfter = await cardsBy();
  xpBefore = await app(() => window.DRG_APP.state.xp);
  assert(seen.length >= 3 && seen.every((x) => !/K\d\d|k\./.test(x)), JSON.stringify(seen));
  assert(lucasAfter.karla === 0 && lucasAfter.lucas > 0, JSON.stringify(lucasAfter));
  return { vistos: seen.slice(0, 6), cartoes: { ...lucasAfter, lucasState: undefined }, xp: xpBefore };
});

await check('C03', 'Ajustes → Personagem: escolher a Karla troca o conteúdo (jornada K01–K11), sem perder o progresso', async () => {
  await go('#/settings');
  const opts = await page.locator('[data-role=characters] [role=radio]').allTextContents();
  assert(opts.length === 4 && /Lucas/.test(opts[0]) && /Karla/.test(opts[1]) && /em preparação/.test(opts[1]) && /Imagens: 0 de 6 prontas/.test(opts[1]) && /Lukinhas.*10 rotina\(s\), 66 frases/.test(opts[2]) && /Heitor/.test(opts[3]), JSON.stringify(opts));
  await page.locator('[data-role=characters] [role=radio][data-character=karla]').click();
  await page.waitForTimeout(400);
  const s = await app(() => ({ ch: window.DRG_APP.character.id, set: window.DRG_APP.state.settings.character, routines: window.DRG_APP.content.routines.map((r) => r.id) }));
  const checked = await page.locator('[data-role=characters] [role=radio][data-character=karla]').getAttribute('aria-checked');
  assert(s.ch === 'karla' && s.set === 'karla' && JSON.stringify(s.routines) === '["K01","K02","K03","K04","K05","K06","K07","K08","K09","K10","K11"]' && checked === 'true', JSON.stringify(s));
  assert(JSON.stringify(await cardsBy()) === JSON.stringify(lucasAfter), 'o progresso mudou ao trocar de personagem');
  await page.screenshot({ path: join(OUT, 'C03-ajustes-personagem.png'), fullPage: true });
  return { rotinas: s.routines, opcoes: opts.map((o) => o.replace(/\s+/g, ' ').slice(0, 60)) };
});

await check('C04', 'Sessão com a Karla: só conteúdo dela (e vocabulário genérico compartilhado); telas de Estudar e Falar com K01–K03', async () => {
  await go('#/');
  assert(await homeName() === 'Karla', 'Início não mostra a Karla');
  await go('#/session');
  const seen = await study(6);
  assert(seen.length >= 3, JSON.stringify(seen));
  assert(seen.every((x) => /^(item:(k\.|it\.)|sent:K|block:K|q:K\.|pairs)/.test(x)), `fora do pacote: ${JSON.stringify(seen)}`);
  await go('#/explore');
  const routinesTxt = await page.locator('main').textContent();
  assert(/K01/.test(routinesTxt) && !/R01/.test(routinesTxt), 'Estudar mostra rotinas de outro personagem');
  await go('#/routine/K01');
  const rt = await page.locator('main').textContent();
  assert(/personal training clients/.test(rt) && /group Pilates classes/.test(rt), rt.slice(0, 200));
  await go('#/lab');
  const lab = await page.locator('main').textContent();
  assert(/wake up at around 5:00/.test(lab), lab.slice(0, 200));
  await go('#/lab?sentence=R01-B1-S1'); // link antigo do Lucas com a Karla ativa: volta ao Lab, sem quebrar
  assert((await page.evaluate(() => location.hash)) === '#/lab', 'alvo de outro personagem não tratado');
  const c = await cardsBy();
  assert(c.karla > 0 && c.karlaOutside === 0 && c.lucasState === lucasAfter.lucasState, JSON.stringify({ c, lucasAfter }));
  await page.screenshot({ path: join(OUT, 'C04-rotina-k01.png'), fullPage: true });
  return { vistos: seen.slice(0, 6), cartoes: { ...c, lucasState: undefined }, lucasIntacto: true };
});

await check('C05', 'Voltar ao Lucas: conteúdo, progresso e XP dele intactos; a Karla tem XP próprio (não somam)', async () => {
  const xpK = await app(() => window.DRG_APP.state.xp);
  await go('#/settings');
  await page.locator('[data-role=characters] [role=radio][data-character=lucas]').click();
  await page.waitForTimeout(300);
  const s = await app(() => ({ ch: window.DRG_APP.character.id, same: window.DRG_APP.content === window.DRG_APP.baseContent, xp: window.DRG_APP.state.xp }));
  const c = await cardsBy();
  assert(s.ch === 'lucas' && s.same && c.lucasState === lucasAfter.lucasState && s.xp === xpBefore && xpK > 0 && c.xp.karla === xpK, JSON.stringify({ s, c, xpK, xpBefore }));
  await go('#/session');
  const seen = await study(3);
  assert(seen.every((x) => !/K\d\d|k\./.test(x)), JSON.stringify(seen));
  return { xp: s.xp, cartoes: { ...c, lucasState: undefined } };
});

await check('C06', 'Preferência persistida: recarregar mantém o personagem escolhido; a escolha fica no estado salvo (o mesmo do backup)', async () => {
  await go('#/settings');
  await page.locator('[data-role=characters] [role=radio][data-character=karla]').click();
  await page.waitForTimeout(300);
  await app(() => window.DRG_APP.flush());
  await go('#/');
  const ch = await app(() => window.DRG_APP.character.id);
  // o que fica gravado (e vai no backup “Exportar”): o estado salvo no IndexedDB
  const saved = await app(async () => {
    const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
    const v = await new Promise((res) => { const g = db.transaction('kv').objectStore('kv').get('state'); g.onsuccess = () => res(g.result); });
    db.close();
    return v && v.settings ? v.settings.character : null;
  });
  assert(ch === 'karla' && saved === 'karla', JSON.stringify({ ch, saved }));
  return { aposRecarregar: ch, salvo: saved };
});

await check('C07', 'Offline (servidor desligado e rede cortada): Karla abre, estuda e mostra a rotina', async () => {
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await go('#/routine/K02');
  const t = await page.locator('main').textContent();
  await go('#/routine/K10');
  const t10 = await page.locator('main').textContent();
  if (!/Hyrox/.test(t10)) throw new Error('episódio K10 offline não abriu');
  await go('#/session');
  const seen = await study(2);
  await go('#/');
  const offName = await homeName();
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  assert(/Tuesdays and Thursdays/.test(t) && seen.length >= 1 && offName === 'Karla', `${t.slice(0, 120)} ${JSON.stringify(seen)} ${offName}`);
  return { offline: true, vistos: seen, inicioOffline: offName };
});

await check('C08', 'Layout 430 px: sem rolagem horizontal em Início, Ajustes, Estudar, Falar e rotina da Karla; marcador sem imagem genérica', async () => {
  const over = [];
  for (const hsh of ['#/', '#/settings', '#/explore', '#/lab', '#/routine/K01', '#/stats', '#/review']) {
    await go(hsh);
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, w: innerWidth }));
    if (m.sw > m.w) over.push(`${hsh}:${m.sw}`);
  }
  await go('#/');
  const marks = await page.locator('[data-role=active-character] .char-ph, [data-role=active-character] img').count();
  const imgs = await page.locator('img.char-img').count();
  await page.screenshot({ path: join(OUT, 'C08-inicio-430.png') });
  assert(!over.length && marks === 0 && imgs === 0, JSON.stringify({ over, marks, imgs }));
  return { semRolagem: true, inicio: 'só o nome, sem imagem' };
});

await check('C10', 'Início → “Trocar personagem”: seletor leve marca o atual; Cancelar não muda nada; Karla → Lucas → Karla, nome atualizado na hora e mantido ao recarregar', async () => {
  await go('#/');
  const start = await homeName();
  const before = await cardsBy();
  await page.locator('[data-role=switch-character]').click();
  const opts = await page.locator('[data-role=active-character] [role=radio]').evaluateAll((els) => els.map((e) => [e.dataset.character, e.getAttribute('aria-checked'), /atual/.test(e.textContent)]));
  const other = start === 'Karla' ? 'lucas' : 'karla';
  assert(opts.find((o) => o[0] === start.toLowerCase())[1] === 'true' && opts.find((o) => o[0] === start.toLowerCase())[2], JSON.stringify(opts));
  assert(await page.locator('[data-role=active-character] [data-role=confirm-character]').isDisabled(), 'confirmar sem mudar');
  await page.screenshot({ path: join(OUT, 'C10-seletor-inicio.png') });
  await page.locator(`[data-role=active-character] [role=radio][data-character=${other}]`).click();
  await page.locator('[data-role=cancel-character]').click();
  assert(await homeName() === start, 'Cancelar trocou o personagem');
  const seq = [];
  for (const id of [other, start.toLowerCase(), other]) {
    await page.locator('[data-role=switch-character]').click();
    await page.locator(`[data-role=active-character] [role=radio][data-character=${id}]`).click();
    await page.locator('[data-role=active-character] [data-role=confirm-character]').click();
    await page.waitForTimeout(400);
    const n = await homeName();
    const r1 = await page.locator('[data-role=track-dr] h3').textContent();
    seq.push(`${n} (${r1.slice(0, 24)})`);
    assert(n.toLowerCase() === id && (await app(() => window.DRG_APP.character.id)) === id, `${n} ≠ ${id}`);
    assert(r1 === `Daily Routine · ${n}`, r1);
  }
  await go('#/');
  const saved = await savedSettings();
  const after = await cardsBy();
  assert(await homeName() === (other === 'karla' ? 'Karla' : 'Lucas') && saved.character === other, JSON.stringify(saved));
  assert(JSON.stringify(after) === JSON.stringify(before), 'trocar mudou progresso ou XP de alguma persona');
  return { inicio: start, sequencia: seq, salvo: saved.character };
});

await check('C11', 'Atividade em andamento: dentro da sessão não há troca; respostas já dadas ficam no personagem certo; trocar e voltar não perde nada', async () => {
  await go('#/');
  if (await homeName() !== 'Lucas') {
    await page.locator('[data-role=switch-character]').click();
    await page.locator('[data-role=active-character] [role=radio][data-character=lucas]').click();
    await page.locator('[data-role=active-character] [data-role=confirm-character]').click();
    await page.waitForTimeout(400);
  }
  const snap = () => app(() => JSON.stringify([window.DRG_APP.state.xp, Object.entries(window.DRG_APP.state.cards).sort().map(([k, c]) => [k, c.box, c.due, c.reps])]));
  const before = await cardsBy(), snap0 = await snap();
  await go('#/session?routine=R02'); // rotina ainda não praticada: a sessão registra algo novo
  const inSession = await page.locator('[data-role=switch-character], .nav, [data-role=characters]').count();
  const seen = await study(4); // “aprender” rende XP; múltipla escolha cria/atualiza cartões
  const mid = await cardsBy(), snap1 = await snap();
  const savedKeys = await app((b) => Object.keys(window.DRG_APP.state.cards).filter((k) => !JSON.parse(b)[1].some((x) => x[0] === k)), snap0);
  const saved = await app(async () => { await window.DRG_APP.flush(); return Object.keys(window.DRG_APP.state.cards).length; });
  // a pessoa sai da sessão e troca de personagem: as respostas já dadas continuam no Lucas
  await go('#/');
  await page.locator('[data-role=switch-character]').click();
  await page.locator('[data-role=active-character] [role=radio][data-character=karla]').click();
  await page.locator('[data-role=active-character] [data-role=confirm-character]').click();
  await page.waitForTimeout(400);
  const withK = await cardsBy(), snapK = await snap();
  await page.locator('[data-role=switch-character]').click();
  await page.locator('[data-role=active-character] [role=radio][data-character=lucas]').click();
  await page.locator('[data-role=active-character] [data-role=confirm-character]').click();
  await page.waitForTimeout(400);
  const back = await cardsBy(), snapL = await snap();
  assert(inSession === 0, 'controle de troca visível durante a sessão');
  assert(seen.length >= 2 && seen.every((x) => !/K\d\d|k\./.test(x)), JSON.stringify(seen));
  assert(mid.karla === before.karla && snap1 !== snap0, 'respostas da sessão não registradas ');
  assert(savedKeys.every((k) => !/:(K\d\d|K\.|k\.)/.test(k)), `cartão novo fora do Lucas: ${savedKeys}`);
  assert(snapK !== snap1 && withK.lucasState === mid.lucasState && snapL === snap1 && back.karla === mid.karla && back.lucasState === mid.lucasState, 'troca alterou o progresso');
  return { vistos: seen, cartoesSalvos: saved, novos: savedKeys, progressoIntacto: true };
});

await check('C12', 'Dados ausentes ou inválidos: personagem desconhecido/ inválido cai no Lucas sem travar; estado antigo sem a escolha não é interrompido; nada é apagado', async () => {
  const orig = await app(() => JSON.parse(JSON.stringify(window.DRG_APP.state)));
  const nCards = Object.keys(orig.cards).length;
  const out = {};
  // 1) personagem inexistente
  await putState({ ...orig, settings: { ...orig.settings, character: 'zzz' } });
  await go('#/');
  out.desconhecido = { ch: await app(() => window.DRG_APP.character.id), pick: await page.locator('[data-role=character-pick]').count(), nome: await homeName() };
  // 2) tipo inválido
  await putState({ ...orig, settings: { ...orig.settings, character: 42, characterChosen: 'x' } });
  await go('#/');
  out.invalido = { ch: await app(() => window.DRG_APP.character.id), pick: await page.locator('[data-role=character-pick]').count() };
  // 3) usuário antigo (estado de antes desta versão: sem characterChosen) com a Karla ativa
  const old = JSON.parse(JSON.stringify(orig)); delete old.settings.characterChosen; old.settings.character = 'karla';
  await putState(old);
  await go('#/');
  out.antigo = { ch: await app(() => window.DRG_APP.character.id), pick: await page.locator('[data-role=character-pick]').count(), chosen: await app(() => window.DRG_APP.state.settings.characterChosen) };
  // 4) ajustes corrompidos (não-objeto)
  await putState({ ...orig, settings: 'lixo' });
  await go('#/');
  out.ajustesCorrompidos = { ch: await app(() => window.DRG_APP.character.id), pick: await page.locator('[data-role=character-pick]').count(), cards: await app(() => Object.keys(window.DRG_APP.state.cards).length), goal: await app(() => window.DRG_APP.state.settings.dailyGoal) };
  // restaura
  await putState(orig);
  await go('#/');
  const restored = await app(() => Object.keys(window.DRG_APP.state.cards).length);
  assert(out.desconhecido.ch === 'lucas' && out.desconhecido.pick === 0 && out.desconhecido.nome === 'Lucas', JSON.stringify(out));
  assert(out.invalido.ch === 'lucas' && out.invalido.pick === 0, JSON.stringify(out));
  assert(out.antigo.ch === 'karla' && out.antigo.pick === 0 && out.antigo.chosen === true, JSON.stringify(out));
  assert(out.ajustesCorrompidos.ch === 'lucas' && out.ajustesCorrompidos.pick === 0 && out.ajustesCorrompidos.cards === nCards && out.ajustesCorrompidos.goal === 12, JSON.stringify(out));
  assert(restored === nCards, 'estado não restaurado');
  return out;
});

await check('C13', 'Jornada da Karla: 11 episódios em Estudar; episódio com etapa, foco da língua, diálogo com quem fala e tipos de pergunta; sessão do episódio só com conteúdo dele; R01 do Lucas continua rotina do Word', async () => {
  await go('#/');
  if (await homeName() !== 'Karla') {
    await page.locator('[data-role=switch-character]').click();
    await page.locator('[data-role=active-character] [role=radio][data-character=karla]').click();
    await page.locator('[data-role=active-character] [data-role=confirm-character]').click();
    await page.waitForTimeout(400);
  }
  await go('#/explore');
  const ids = await page.locator('main .card .chips .chip:first-child').allTextContents();
  assert(JSON.stringify(ids) === JSON.stringify(['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11']), JSON.stringify(ids));
  await go('#/routine/K06');
  const stage = await page.locator('[data-role=stage]').textContent();
  const grammar = await page.locator('[data-role=grammar]').textContent();
  const lines = await page.locator('.para.dialogue .line').allTextContents();
  const qkinds = await page.locator('main .list .small.muted').allTextContents();
  await page.screenshot({ path: join(OUT, 'C13-episodio-k06.png'), fullPage: true });
  assert(stage === 'Etapa B' && /Present|Perguntas/.test(grammar), `${stage} | ${grammar}`);
  assert(lines.length === 5 && /^Karla: Good morning, Sophie!/.test(lines[0]) && /^Sophie: A bit tired/.test(lines[1]), JSON.stringify(lines));
  assert(qkinds.some((x) => /compreensão/.test(x)) && qkinds.some((x) => /sobre você/.test(x)), JSON.stringify(qkinds));
  // sessão do episódio: só itens/frases do K05 (e genéricos usados nele)
  await go('#/session?routine=K05');
  const seen = await study(6);
  const k05 = await app(() => new Set(window.DRG_APP.content.routines.find((r) => r.id === 'K05').items));
  const okIds = await app((xs) => xs.every((x) => { const [u, id] = x.split(':'); const c = window.DRG_APP.content; const r = c.routines.find((y) => y.id === 'K05'); return u === 'pairs' || (u === 'item' ? r.items.includes(id) : u === 'sent' ? id.startsWith('K05-') : true); }), seen);
  assert(seen.length >= 3 && okIds, JSON.stringify(seen));
  // Lucas: a rotina R01 continua sem etapa, sem diálogo e com o chip de sempre
  await page.locator('a[href="#/"]').first().click().catch(() => {});
  await go('#/');
  await page.locator('[data-role=switch-character]').click();
  await page.locator('[data-role=active-character] [role=radio][data-character=lucas]').click();
  await page.locator('[data-role=active-character] [data-role=confirm-character]').click();
  await page.waitForTimeout(400);
  await go('#/routine/R01');
  const lucas = { stage: await page.locator('[data-role=stage]').count(), dialogue: await page.locator('.para.dialogue').count(), chip: await page.locator('main .chips').first().textContent(), routines: await app(() => window.DRG_APP.content.routines.length), same: await app(() => window.DRG_APP.content === window.DRG_APP.baseContent) };
  assert(lucas.stage === 1 && lucas.dialogue === 0 && /Tipo de dia/.test(lucas.chip) && /Prioritária/.test(lucas.chip) && lucas.routines === 18 && lucas.same, JSON.stringify(lucas));
  return { episodios: ids.length, k06: { etapa: stage, falas: lines.length }, sessaoK05: seen.slice(0, 5), lucas: 'inalterado', k05itens: k05.size };
});

await check('C14', 'Lucas 2.0: R01–R10 do Word intactos e primeiro; episódios R11–R18 com etapa, diálogo e perguntas; áudio britânico embutido; episódio abre e pratica offline', async () => {
  await go('#/explore');
  const ids = await page.locator('main .card .chips .chip:first-child').allTextContents();
  assert(ids.length === 18 && ids[0] === 'R01' && ids[17] === 'R18', JSON.stringify(ids));
  await go('#/routine/R01');
  const r01 = await page.locator('main .para').first().textContent();
  await go('#/routine/R14');
  const stage = await page.locator('[data-role=stage]').textContent();
  const lines = await page.locator('.para.dialogue .line').allTextContents();
  const qs = await page.locator('main .list .small.muted').allTextContents();
  await page.screenshot({ path: join(OUT, 'C14-lucas-r14.png'), fullPage: true });
  const audio = await app(() => { const c = window.DRG_APP.content, ids = c.routines.filter((r) => r.kind === 'episode').flatMap((r) => r.blocks.flatMap((b) => c.blocks[b].sentences)); return { total: ids.length, comAudio: ids.filter((s) => window.DRG_AUDIO.files[c.sentences[s].au]).length }; });
  assert(r01.startsWith('I wake up at 5:00 a.m.'), r01.slice(0, 60));
  assert(stage === 'Etapa C' && lines.length === 6 && /^Manager: Can you explain why/.test(lines[0]) && /^Lucas: I'm not sure that's the best option/.test(lines[3]), JSON.stringify({ stage, lines }));
  assert(qs.some((x) => /compreensão/.test(x)) && qs.some((x) => /sobre você/.test(x)), JSON.stringify(qs));
  assert(audio.total === audio.comAudio, `áudio embutido: ${audio.comAudio}/${audio.total}`);
  // offline: episódio novo abre e a sessão dele roda
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await go('#/routine/R16');
  const t16 = await page.locator('main').textContent();
  await go('#/session?routine=R16');
  const seen = await study(3);
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  assert(/BPO service/.test(t16) && seen.length >= 1 && seen.every((x) => !/K\d\d|k\./.test(x)), JSON.stringify(seen));
  return { rotinas: ids.length, r14: { etapa: stage, falas: lines.length }, audio, offline: seen };
});

await check('C09', 'Nenhuma requisição externa e nenhum erro de JavaScript', async () => {
  const relevant = errors.filter((e) => !/net::|Failed to fetch|ERR_INTERNET_DISCONNECTED/.test(e));
  assert(!external.length && !relevant.length, JSON.stringify({ external: external.slice(0, 3), errors: relevant.slice(0, 3) }));
  return { externas: 0, erros: 0 };
});

await ctx.close();
server.close();
rmSync(PROFILE, { recursive: true, force: true });
const summary = { when: new Date().toISOString(), environment: 'Chromium (Playwright) headless, Linux — não é o Galaxy S25+', passed: results.filter((r) => r.status === 'aprovado').length, failed: results.filter((r) => r.status !== 'aprovado').length, results };
writeFileSync(join(OUT, 'characters-results.json'), JSON.stringify(summary, null, 1));
console.log(`\n${summary.passed} aprovados, ${summary.failed} reprovados`);
process.exit(summary.failed ? 1 : 0);
