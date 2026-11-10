// Curso — Atividades: catálogo por arquivo de estudo (Chromium, 412 px). Ícone “Adicionar atividade” com arquivo
// estruturado (4 partes), prévia e confirmação, ordem e bloqueio sequencial, duplicação evitada, adoção da atividade
// que já estava no aparelho (respostas intactas), atualização controlada (histórico guardado), arquivo inválido,
// exportação sem respostas, offline, cópia de segurança do registro e tela limpa. Conteúdo SINTÉTICO.
// Uso: node tests/e2e/coursecatalog.mjs <pasta-do-site> <caminho-base> [evidências]. Não valida o aparelho real.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/coursecatalog');
mkdirSync(OUT, { recursive: true });
const PORT = 8797, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const Q = (n, part, tag = '') => ({ n, blocos: [`Part ${part} title ${n}${tag}`, `Line A of question ${n} in part ${part}${tag}.`, `Line B of question ${n} in part ${part}.`] });
const PART = (part, nq, version = '1', tag = '') => ({ id: `ACT-001-P0${part}`, parte: part, titulo: `Parte ${part}`, versao: version, questoes: Array.from({ length: nq }, (_, i) => Q(i + 1, part, tag)) });
const PKG = (parts) => JSON.stringify({ kind: 'daily-routine-english/atividade', formato: 1, conjunto: { id: 'ACT-001', titulo: 'Curso — Atividades' }, partes: parts });
const LEGACY = ['MATERIAL ANTIGO — PARTE 1', ...PART(1, 2).questoes.flatMap((q) => [`QUESTION ${q.n}`, ...q.blocos])].join('\n'); // a Parte 1 já no aparelho

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const server = await serve(SITE, PORT);
const errors = [], external = [];
let ctx, page;
async function open() {
  ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, acceptDownloads: true });
  page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
}
const go = async (hash) => { await page.goto(BASE + hash); await page.waitForTimeout(700); };
const app = (fn, arg) => page.evaluate(fn, arg);
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
const kv = (key) => app((k) => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get(k); g.onsuccess = () => res(g.result || null); }; }), key);
async function addFile(name, text, mime = 'application/json') {
  if (!(await page.locator('[data-role=import-sheet]').count())) { await page.click('[data-role=open-import]'); await page.waitForSelector('[data-role=import-sheet]'); }
  await page.setInputFiles('[data-role=import-file]', { name, mimeType: mime, buffer: Buffer.from(text, 'utf8') });
  await page.waitForSelector('[data-role=import-preview], [data-role=import-error], [data-role=import-same], [data-role=import-ok]');
  return (await page.locator('[data-role=import-status]').innerText()).replace(/\s+/g, ' ');
}
const apply = async () => { await page.click('[data-role=import-apply]'); await page.waitForSelector('[data-role=import-ok]'); const t = await page.locator('[data-role=import-ok]').textContent(); await page.keyboard.press('Escape'); await page.waitForTimeout(400); return t; };
const cards = () => app(() => [...document.querySelectorAll('[data-role=activity]')].map((c) => ({ code: c.dataset.code, title: c.querySelector('h3').textContent, locked: !!c.querySelector('[data-role=activity-lock]'), open: !!c.querySelector('[data-role=open-activity]'), offline: !!c.querySelector('[data-role=offline]') })));

await open();
let legacyId = null;

await check('K01', 'Atividade antiga já no aparelho (importada antes, sem código) com respostas; a área mostra ícones discretos', async () => {
  await go('');
  await app(async () => { await window.DRG_APP.chooseCharacter('lucas'); window.DRG_APP.go('#/course'); });
  await page.waitForTimeout(600);
  const p = await addFile('antiga.txt', LEGACY, 'text/plain');
  assert(/2 questões/.test(p), p);
  await apply();
  const d = await kv('course');
  legacyId = d.last;
  await page.click('[data-role=open-activity]');
  await page.waitForSelector('[data-role=block-pt]');
  for (const [i, el] of (await page.locator('[data-role=block-pt]').all()).entries()) await el.fill(`Resposta antiga 1.${i}`);
  await page.click('[data-role=q-save]');
  await page.waitForTimeout(600);
  await go('#/course');
  await shot('k01-antiga');
  return { atividadeAntiga: legacyId };
});

await check('K02', 'Arquivo de estudo com 4 partes: prévia (reconhece a Parte 1 do aparelho), confirmação, ordem 1–4, Parte 1 aberta e 2–4 bloqueadas', async () => {
  const p = await addFile('ACT-001.json', PKG([PART(1, 2), PART(2, 2), PART(3, 1), PART(4, 3)]));
  assert(/4 partes/.test(p) && /Parte 1 \(2 questões\): já está neste aparelho — passa a fazer parte do catálogo/.test(p) && /Parte 2 \(2 questões\): nova/.test(p), p);
  await shot('k02-previa');
  const ok = await apply();
  const c = await cards();
  assert(JSON.stringify(c.map((x) => x.code)) === JSON.stringify(['ACT-001-P01', 'ACT-001-P02', 'ACT-001-P03', 'ACT-001-P04']), JSON.stringify(c));
  assert(c[0].open && c[0].offline && !c[0].locked && c.slice(1).every((x) => x.locked && !x.open), JSON.stringify(c));
  const d = await kv('course');
  const p1 = d.activities[legacyId];
  assert(p1 && p1.code === 'ACT-001-P01' && p1.answers[1][0] === 'Resposta antiga 1.0' && Object.keys(d.activities).length === 4, 'adoção sem perda');
  const body = await page.locator('#view').innerText();
  assert(!/professor|validad|ACT-001|MATERIAL ANTIGO/i.test(body), 'texto interno ou de validação visível');
  const safety = await kv('course.copia-antes-catalogo');
  const was = safety && safety.data && safety.data.activities[legacyId];
  assert(was && !was.code && was.answers[1][0] === 'Resposta antiga 1.0', 'cópia de segurança do registro como era antes da mudança');
  await shot('k02-catalogo');
  return { resultado: ok.trim(), partes: c.map((x) => `${x.title}${x.locked ? ' (bloqueada)' : ''}`) };
});

await check('K03', 'O mesmo arquivo de novo: “nada muda” (sem duplicar); arquivo inválido: mensagem clara e nada muda', async () => {
  const before = JSON.stringify((await kv('course')).activities);
  const same = await addFile('ACT-001.json', PKG([PART(1, 2), PART(2, 2), PART(3, 1), PART(4, 3)]));
  assert(/nada muda/.test(same) && !(await page.locator('[data-role=import-apply]').count()), same);
  const bad = await addFile('quebrado.json', PKG([{ ...PART(2, 1), id: 'ACT-001-P09' }]).replace('"formato":1', '"formato":3'));
  assert(/Nada foi alterado/.test(bad) && /Formato 3 não suportado/.test(bad) && /não confere com o conjunto/.test(bad), bad);
  const junk = await addFile('lixo.txt', 'só um texto qualquer', 'text/plain');
  assert(/Nada foi alterado/.test(junk), junk);
  await page.keyboard.press('Escape');
  assert(JSON.stringify((await kv('course')).activities) === before, 'algo mudou');
  return { duplicado: 'nada muda', invalido: bad.slice(0, 120) };
});

await check('K04', 'Progressão: concluir todas as questões da Parte 1 libera a Parte 2 (a 3 continua bloqueada); rota direta de parte bloqueada é recusada', async () => {
  const d0 = await kv('course');
  const p2id = Object.values(d0.activities).find((a) => a.code === 'ACT-001-P02').id;
  await go(`#/cq/${encodeURIComponent(p2id)}?q=1`);
  assert(await page.locator('[data-role=q-locked]').count() === 1 && !(await page.locator('[data-role=block-pt]').count()), 'parte bloqueada abriu pela rota');
  await go(`#/cq/${encodeURIComponent(legacyId)}?q=2`);
  for (const [i, el] of (await page.locator('[data-role=block-pt]').all()).entries()) await el.fill(`Resposta 2.${i}`);
  await page.click('[data-role=q-save]');
  await page.waitForTimeout(600);
  await go('#/course');
  const c = await cards();
  assert(!c[1].locked && c[1].open && c[2].locked && c[3].locked, JSON.stringify(c));
  await shot('k04-parte2-liberada');
  return c.map((x) => `${x.title}: ${x.locked ? 'bloqueada' : 'liberada'}`);
});

await check('K05', 'Exportar respostas pelo ícone: Parte 2 sem nenhuma resposta → exporta avisando (0 de 2), nada muda', async () => {
  await page.click('[data-role=open-export]');
  await page.waitForSelector('[data-role=export-sheet]');
  const d0 = await kv('course');
  const p2id = Object.values(d0.activities).find((a) => a.code === 'ACT-001-P02').id;
  await page.selectOption('[data-role=export-pick]', p2id);
  await page.waitForSelector('[data-role=export-partial]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-role=export-txt]')]);
  const txt = readFileSync(await dl.path(), 'utf8');
  await page.keyboard.press('Escape');
  assert(/^Curso — Atividades\nAtividade: ACT-001-P02 · Parte 2 · versão 1/.test(txt) && /CONTÉM RESPOSTAS INCOMPLETAS \(0 de 2/.test(txt) && /Questão 1 \(sem resposta\); Questão 2 \(sem resposta\)/.test(txt), txt.slice(0, 260));
  assert(JSON.stringify((await kv('course')).activities) === JSON.stringify(d0.activities), 'exportar alterou dados');
  return { arquivo: dl.suggestedFilename(), situacao: 'incompleta (0 de 2)' };
});

await check('K06', 'Atualização controlada (versão 2 da Parte 1, uma linha alterada): prévia, histórico guardado, respostas dos trechos iguais mantidas', async () => {
  const v2 = PART(1, 2, '2');
  v2.questoes[1].blocos[2] = 'A rewritten line B for question 2.';
  const p = await addFile('ACT-001-v2.json', PKG([v2]));
  assert(/versão 2 diferente/.test(p) && /versão anterior inteira fica guardada/.test(p), p);
  await apply();
  const a = (await kv('course')).activities[legacyId];
  assert(a.version === '2' && a.archive.length === 1 && a.archive[0].answers[2][2] === 'Resposta 2.2', 'histórico');
  assert(a.answers[1][0] === 'Resposta antiga 1.0' && a.answers[2][0] === 'Resposta 2.0' && a.answers[2][2] === '' && !a.done[2] && a.done[1], JSON.stringify({ a2: a.answers[2], done: a.done }));
  const c = await cards();
  assert(c[1].locked, 'Parte 2 deveria voltar a bloquear: a questão alterada da Parte 1 ficou em aberto');
  return { versao: a.version, historico: a.archive.length, mantidas: 'questão 1 inteira; questão 2 blocos 1–2' };
});

await check('K07', 'Offline (servidor desligado): catálogo, questão e exportação funcionam com o que já está no aparelho', async () => {
  await page.waitForTimeout(3000); // service worker pronto
  await new Promise((r) => { server.close(r); if (server.closeAllConnections) server.closeAllConnections(); });
  await ctx.setOffline(true);
  await go('#/course');
  const c = await cards();
  await page.click('[data-role=open-activity] >> nth=0');
  await page.waitForSelector('[data-role=block-pt]');
  await go('#/course');
  await page.click('[data-role=open-export]');
  const exp = await page.locator('[data-role=export-txt]').count();
  await page.keyboard.press('Escape');
  await ctx.setOffline(false);
  assert(c.length === 4 && exp === 1, JSON.stringify({ c: c.length, exp }));
  return { partes: c.length, questao: 'abriu', exportacao: 'disponível' };
});

await check('K08', 'Tela limpa no celular: sem rolagem lateral, sem erros, sem rede externa; ações no alto com área de toque ≥ 44 px', async () => {
  const m = await app(() => ({ scroll: document.documentElement.scrollWidth > innerWidth + 1, tools: [...document.querySelectorAll('.topbar .icon-btn')].map((b) => { const r = b.getBoundingClientRect(); return [b.dataset.role, Math.round(r.width), Math.round(r.height)]; }) }));
  assert(!m.scroll && m.tools.filter(([r, w, h]) => /open-(import|export)/.test(r) && w >= 44 && h >= 44).length === 2, JSON.stringify(m));
  assert(!errors.length, errors.join(' | '));
  assert(!external.length, external.join(' '));
  await shot('k08-tela');
  return m.tools;
});

await ctx.close();
const ok = results.filter((r) => r.status === 'aprovado').length;
writeFileSync(join(OUT, 'coursecatalog-results.json'), JSON.stringify({ at: new Date().toISOString(), conteudo: 'sintético', results }, null, 1));
console.log(`\n${ok} aprovados, ${results.length - ok} reprovados`);
process.exit(ok === results.length ? 0 : 1);
