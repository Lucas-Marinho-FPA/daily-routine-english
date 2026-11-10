// Curso — Atividades → Praticar (Chromium, 412 px, microfone falso): entrada “Praticar” no cartão da atividade,
// vocabulário/expressões com feedback imediato, escuta, fechar e reabrir no meio da prática (retomada), progresso salvo
// em registro próprio (kv 'course-practice') sem alterar a tradução (kv 'course') nem o estudo das jornadas (kv 'state'),
// tradução reversa só depois da validação do professor e fala sem reconhecimento instalado (não corrige, não bloqueia).
// Uso: node tests/e2e/coursepractice.mjs <pasta-do-site> <caminho-base> [evidências]. Conteúdo SINTÉTICO.
// Não valida o aparelho real (Galaxy S25+), a voz do sistema nem o reconhecimento de fala instalado.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/coursepractice');
mkdirSync(OUT, { recursive: true });
const PORT = 8798, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const SRC = ['SYNTHETIC PRACTICE — PART 1',
  'QUESTION 1', 'Answering the Phone', 'Good morning, could you hold on a moment, please?', "I'm afraid she is in a meeting. Can I take a message?",
  'QUESTION 2', 'Checking In', 'I booked a room for two nights.', 'The flight was late, so we arrived at the hotel after midnight.', 'Please call me back when you get this message.',
].join('\n');
const TEACHER = ['QUESTÃO 2', 'Checking In', 'Fazendo o check-in', 'I booked a room for two nights.', 'Reservei um quarto para duas noites.',
  'The flight was late, so we arrived at the hotel after midnight.', 'O voo atrasou, então chegamos ao hotel depois da meia-noite.',
  'Please call me back when you get this message.', 'Por favor, me ligue de volta quando receber esta mensagem.'].join('\n');

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const server = await serve(SITE, PORT);
const errors = [], external = [];
let ctx, page;
async function open() {
  ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true,
    permissions: ['microphone'], args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
}
const go = async (hash) => { await page.goto(BASE + hash); await page.waitForTimeout(600); };
const app = (fn, arg) => page.evaluate(fn, arg);
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
const kv = (key) => app((k) => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get(k); g.onsuccess = () => res(g.result || null); g.onerror = () => res(null); }; r.onerror = () => res(null); }), key);
const noHScroll = () => app(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

/** Responde o exercício na tela: alternativa certa, alternativa errada ou texto digitado. */
async function answer({ wrong = false } = {}) {
  const skill = await page.getAttribute('[data-role=exercise]', 'data-skill');
  if (await page.locator('[data-role=options] button').count()) {
    await page.click(`[data-role=options] button[data-correct="${wrong ? 0 : 1}"] >> nth=0`);
  } else if (await page.locator('[data-role=cloze-input], [data-role=write-input], [data-role=rev-input]').count()) {
    await page.locator('[data-role=cloze-input], [data-role=write-input], [data-role=rev-input]').first().fill(wrong ? 'zzz qqq' : 'take a message');
    await page.click('[data-role=check]');
  } else return { skill, result: null };
  await page.waitForSelector('[data-role=result], [data-role=feedback] .notice');
  return { skill, result: await page.getAttribute('[data-role=result]', 'data-result').catch(() => null) };
}

await open();
let courseBefore = null, stateBefore = null, actId = null;

await check('P01', 'Atividade importada mostra “Praticar” no cartão e na questão', async () => {
  await go('#/');
  await app(async () => { await window.DRG_APP.chooseCharacter('lucas'); window.DRG_APP.go('#/course'); });
  await page.waitForSelector('[data-role=import]');
  await page.click('[data-role=import] summary');
  await page.fill('[data-role=import-text]', SRC);
  await page.click('[data-role=import-paste]');
  await page.waitForSelector('[data-role=import-ok]');
  await page.waitForSelector('[data-role=activity] [data-role=open-practice]');
  actId = await page.getAttribute('[data-role=activity]', 'data-id');
  await page.click('[data-role=open-activity]');
  await page.waitForSelector('[data-role=course-head] [data-role=open-practice]');
  return `atividade ${actId}`;
});

await check('P02', 'Início da prática: tipos com contagem; tradução reversa indisponível sem validação do professor', async () => {
  await page.click('[data-role=course-head] [data-role=open-practice]');
  await page.waitForSelector('[data-role=practice-modes]');
  await page.waitForTimeout(800); // a tela da questão grava a posição ao sair: o “antes” é medido depois disso
  courseBefore = JSON.stringify(await kv('course'));
  stateBefore = JSON.stringify(await kv('state'));
  const st = await app(() => Object.fromEntries([...document.querySelectorAll('[data-role^=mode-]')].map((b) => [b.dataset.role, !b.disabled])));
  assert(st['mode-vocab'] && st['mode-listen'] && st['mode-speak'], JSON.stringify(st));
  assert(!st['mode-rev'], 'tradução reversa liberada sem validação');
  const body = await page.locator('body').innerText();
  assert(/validadas pelo professor/.test(body), 'motivo da indisponibilidade');
  assert(/voz do sistema/.test(body), 'aviso: voz do sistema, não gravação do curso');
  assert(await noHScroll(), 'rolagem horizontal');
  await shot('p02-inicio');
  return st;
});

let firstKeys = null;
await check('P03', 'Vocabulário: um exercício por vez, feedback imediato e progresso salvo em registro próprio', async () => {
  await page.click('[data-role=mode-vocab]');
  await page.waitForSelector('[data-role=exercise]');
  const step = await page.textContent('[data-role=step]');
  assert(/^1 de \d+$/.test(step), step);
  const a1 = await answer();
  assert(a1.result, `sem resultado em ${a1.skill}`);
  await shot('p03-feedback');
  await page.click('[data-role=next]');
  await page.waitForSelector('[data-role=step]:has-text("2 de")');
  const a2 = await answer({ wrong: true });
  const p = await kv('course-practice');
  const ap = p && p.acts[actId];
  assert(ap && ap.stats.attempts === 2, JSON.stringify(ap && ap.stats));
  assert(ap.session.mode === 'vocab' && ap.session.i === 1, `sessão ${JSON.stringify(ap.session && { i: ap.session.i })}`);
  firstKeys = ap.session.keys;
  return { a1, a2, stats: ap.stats };
});

await check('P04', 'Fechar e reabrir no meio: a prática continua no mesmo exercício', async () => {
  await ctx.close();
  await open();
  await go(`#/cpr/${encodeURIComponent(actId)}`);
  await page.waitForSelector('[data-role=resume-practice]');
  const label = await page.textContent('[data-role=resume-practice]');
  assert(/2 de/.test(label), label);
  await page.click('[data-role=resume-practice]');
  await page.waitForSelector('[data-role=step]:has-text("2 de")');
  const p = await kv('course-practice');
  assert(JSON.stringify(p.acts[actId].session.keys) === JSON.stringify(firstKeys), 'fila diferente');
  return label.trim();
});

await check('P05', 'Rodada até o fim; “Repetir os erros” traz só os errados', async () => {
  for (let guard = 0; guard < 20; guard++) {
    if (await page.locator('[data-role=session-end]').count()) break;
    if (!(await page.locator('[data-role=next]:not(.hidden)').count())) await answer({ wrong: true });
    await page.click('[data-role=next]');
    await page.waitForTimeout(250);
  }
  await page.waitForSelector('[data-role=session-end]');
  const score = await page.textContent('[data-role=session-score]');
  const p = await kv('course-practice');
  const errs = p.acts[actId].session.keys.filter((k) => p.acts[actId].session.results[k] === 'bad');
  if (errs.length) {
    await page.click('[data-role=repeat-errors]');
    await page.waitForSelector('[data-role=exercise]');
    const p2 = await kv('course-practice');
    assert(JSON.stringify(p2.acts[actId].session.keys) === JSON.stringify(errs), 'repetição com outros itens');
  }
  await shot('p05-fim');
  return { score, erros: errs.length };
});

await check('P06', 'A prática não altera a tradução (kv course) nem o estudo das jornadas (kv state)', async () => {
  const now = await kv('course');
  if (JSON.stringify(now) !== courseBefore) {
    const was = JSON.parse(courseBefore);
    const diff = Object.keys({ ...was, ...now }).filter((k) => JSON.stringify(was[k]) !== JSON.stringify(now[k]));
    const actDiff = Object.keys({ ...was.activities[actId], ...now.activities[actId] }).filter((k) => JSON.stringify(was.activities[actId][k]) !== JSON.stringify(now.activities[actId][k]));
    throw new Error(`atividade alterada pela prática: ${diff.join(',')} / ${actDiff.join(',')}`);
  }
  assert(JSON.stringify(await kv('state')) === stateBefore, 'estado das jornadas alterado pela prática');
  return 'iguais';
});

await check('P07', 'Escuta: alternativas em inglês, resposta conferida e texto mostrado depois', async () => {
  await go(`#/cpr/${encodeURIComponent(actId)}`);
  await page.waitForSelector('[data-role=mode-listen]');
  await page.click('[data-role=mode-listen]');
  await page.waitForSelector('[data-role=exercise][data-skill^=lis]');
  const n = await page.locator('[data-role=options] button').count();
  assert(n >= 3, `${n} alternativas`);
  const a = await answer();
  assert(a.result === 'good', JSON.stringify(a));
  assert(/Você ouviu/.test(await page.textContent('[data-role=feedback]')), 'texto conferido');
  return { alternativas: n };
});

await check('P08', 'Fala sem reconhecimento instalado: grava, avisa e não corrige nem bloqueia', async () => {
  await go(`#/cpr/${encodeURIComponent(actId)}`);
  await page.click('[data-role=mode-speak]');
  await page.waitForSelector('[data-role=exercise][data-skill^=spk]');
  await page.click('[data-role=hide-text]');
  assert(await page.locator('[data-role=speak-text].hidden').count() === 1, 'texto não foi ocultado');
  await page.click('[data-role=rec]');
  await page.waitForTimeout(1500);
  await page.click('[data-role=rec]');
  await page.waitForSelector('[data-role=asr-off]', { timeout: 15000 });
  const txt = await page.textContent('[data-role=speak-out]');
  assert(/não é corrigida/.test(txt), txt);
  assert(await page.locator('[data-role=skip]').count(), 'sem como seguir');
  await shot('p08-fala');
  return 'aviso exibido';
});

await check('P09', 'Tradução reversa só depois da validação do professor: enunciado = versão do professor', async () => {
  await go('#/course');
  await page.click('[data-role=transfer] summary');
  await page.setInputFiles('[data-role=import-teacher]', { name: 'correcao.txt', mimeType: 'text/plain', buffer: Buffer.from(TEACHER) });
  await page.waitForSelector('[data-role=transfer-apply]');
  await page.click('[data-role=transfer-apply]');
  await page.waitForSelector('[data-role=transfer-ok]');
  await go(`#/cpr/${encodeURIComponent(actId)}`);
  await page.waitForSelector('[data-role=mode-rev]:not([disabled])');
  await page.click('[data-role=mode-rev]');
  await page.waitForSelector('[data-role=rev-pt]');
  const pt = await page.textContent('[data-role=rev-pt]');
  assert(TEACHER.split('\n').includes(pt), `enunciado não é a versão do professor: ${pt}`);
  await page.fill('[data-role=rev-input]', 'zzz qqq');
  await page.click('[data-role=check]');
  await page.waitForSelector('[data-role=result]');
  assert(/Original:/.test(await page.textContent('[data-role=feedback]')), 'original não exibido');
  const c = await kv('course');
  assert(c.activities[actId].teacher[2].validatedAt && !c.activities[actId].teacher[1], 'validação alterada');
  return pt;
});

await check('P10', 'Jornadas intactas no Início; sem erros de página, sem rede externa, sem rolagem horizontal', async () => {
  await go('#/');
  await page.waitForSelector('[data-role=course-entry]');
  const j = await app(() => ({ dr: !!document.querySelector('[data-role=track-dr]'), cp: !!document.querySelector('[data-role=journey-entry]') }));
  assert(j.dr && j.cp, JSON.stringify(j));
  assert(await noHScroll(), 'rolagem horizontal');
  assert(!errors.length, errors.join(' | '));
  assert(!external.length, external.join(' '));
  return j;
});

await ctx.close();
await new Promise((r) => { server.close(r); if (server.closeAllConnections) server.closeAllConnections(); });
const ok = results.filter((r) => r.status === 'aprovado').length;
writeFileSync(join(OUT, 'coursepractice-results.json'), JSON.stringify({ at: new Date().toISOString(), conteudo: 'sintético', results }, null, 1));
console.log(`\n${ok}/${results.length} aprovados`);
process.exit(ok === results.length ? 0 : 1);
