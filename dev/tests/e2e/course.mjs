// Curso — Atividades no app (Chromium, 412 px): importação no aparelho (ícone “Adicionar atividade”), 21 questões em
// sequência, salvamento automático, fechar e reabrir, edição de respostas anteriores, dados de validação já gravados
// preservados (e fora da interface), exportação (ícone “Exportar respostas”; parcial permitida, nada é apagado),
// transferência entre aparelhos, offline e funcionalidades existentes intactas.
// Uso: node tests/e2e/course.mjs <pasta-do-site> <caminho-base> [evidências]
// Conteúdo: DRG_COURSE_FILE=<arquivo da atividade> (fica fora do repositório); sem ele, gera uma atividade sintética
// de 21 questões. Os logs não imprimem o texto da atividade.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { parseActivity } from '../../app/js/engine/course.js';
import { deflateRawSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/course');
mkdirSync(OUT, { recursive: true });
const PORT = 8799, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const synthetic = () => ['SAMPLE ACTIVITY — PART 9', 'Header line that is ignored.', ...Array.from({ length: 21 }, (_, k) => [
  `QUESTION ${k + 1}`, `Sample Title ${k + 1}`, `“Hello, Sam. Is line ${k + 1} ready?”`, 'I don’t know yet.', 'We meet at half past five.']).flat()].join('\n');
const SRC = process.env.DRG_COURSE_FILE ? readFileSync(process.env.DRG_COURSE_FILE, 'utf8') : synthetic();
const P = parseActivity(SRC);
const TOTAL = P.questions.length;
const pt = (n, i) => `Tradução ${n}.${i + 1}: ação, coração, você — “ótimo”?`;

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const server = await serve(SITE, PORT);
const stopServer = () => new Promise((r) => { server.close(r); if (server.closeAllConnections) server.closeAllConnections(); });
const errors = [], external = [];
let ctx, page;
async function open() {
  ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, acceptDownloads: true });
  page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
}
const go = async (hash) => { await page.goto(BASE + hash); await page.waitForTimeout(600); };
const app = (fn, arg) => page.evaluate(fn, arg);
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
const noHScroll = () => app(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
const title = () => page.locator('.topbar h1').textContent();
const kvCourse = () => app(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('course'); g.onsuccess = () => res(g.result); }; }));
const act = async () => { const d = await kvCourse(); return d && d.activities[d.last]; };
/** Abre “Adicionar atividade” (ícone), escolhe o arquivo e devolve o texto do resultado (prévia, erro ou ok). */
async function addFile(pg, name, text, mime = 'text/plain') {
  if (!(await pg.locator('[data-role=import-sheet]').count())) { await pg.click('[data-role=open-import]'); await pg.waitForSelector('[data-role=import-sheet]'); }
  await pg.setInputFiles('[data-role=import-file]', { name, mimeType: mime, buffer: Buffer.isBuffer(text) ? text : Buffer.from(text, 'utf8') });
  await pg.waitForSelector('[data-role=import-preview], [data-role=import-error], [data-role=import-same], [data-role=import-ok]');
  return (await pg.locator('[data-role=import-status]').innerText()).replace(/\s+/g, ' ');
}
async function applyAndClose(pg) { await pg.click('[data-role=import-apply]'); await pg.waitForSelector('[data-role=import-ok]'); const t = await pg.locator('[data-role=import-ok]').textContent(); await pg.keyboard.press('Escape'); await pg.waitForTimeout(300); return t; }
const kvRaw = (pg) => pg.evaluate(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('course'); g.onsuccess = () => res(g.result); }; }));
async function fillQuestion(n) {
  const areas = page.locator('[data-role=block-pt]');
  const k = await areas.count();
  for (let i = 0; i < k; i++) await areas.nth(i).fill(pt(n, i));
  return k;
}

await open();
let exported = null; // TXT exportado em C07 (usado na transferência para o “celular”, C14–C17)
let journeysBefore = null;

await check('C01', 'Início mostra a área (nome neutro); a área abre vazia, com importação', async () => {
  await go('#/');
  await app(async () => { await window.DRG_APP.chooseCharacter('lucas'); window.DRG_APP.go('#/'); }); // primeira abertura: escolha do personagem
  await page.waitForTimeout(500);
  await page.waitForSelector('[data-role=course-entry]');
  journeysBefore = await app(() => ({ dr: !!document.querySelector('[data-role=track-dr]'), cp: !!document.querySelector('[data-role=journey-entry]'), profiles: Object.keys(window.DRG_APP.state.profiles).sort(), cards: Object.values(window.DRG_APP.state.profiles).reduce((n, p) => n + Object.keys((p && p.cards) || {}).length, 0) }));
  assert(journeysBefore.dr && journeysBefore.cp, 'jornadas no Início');
  await page.click('[data-role=open-course]');
  await page.waitForSelector('[data-role=no-activity]');
  const t = await title();
  assert(t === 'Curso — Atividades', `título ${t}`);
  const tools = await app(() => ['open-import', 'open-export'].map((r) => { const b = document.querySelector(`.topbar [data-role=${r}]`); const q = b && b.getBoundingClientRect(); return b ? { r, label: b.getAttribute('aria-label'), title: b.title, w: Math.round(q.width), h: Math.round(q.height) } : null; }));
  assert(tools.every((x) => x && x.label && x.title && x.w >= 44 && x.h >= 44), `ícones discretos e tocáveis: ${JSON.stringify(tools)}`);
  const body = await page.locator('body').innerText();
  assert(!/professor|validad/i.test(body), 'texto de validação na área');
  const priv = new RegExp(Buffer.from('XGIoPzppdGFbdcO6XXxFQUN8cGVyc29ubmFsaXRcdyp8bGFzdHJvKVxi', 'base64').toString('utf8'), 'i');
  assert(!priv.test(body), 'nome privado na tela');
  await shot('c01-area');
  return { titulo: t, jornadas: journeysBefore };
});

await check('C02', `Importa o arquivo no aparelho: ${TOTAL} questões; “Começar” abre a Questão 1 sem nenhuma tradução pronta`, async () => {
  const sent = [];
  const spy = (r) => sent.push({ method: r.method(), url: r.url(), body: r.postData() || '' });
  page.on('request', spy);
  const msg = await addFile(page, 'atividade.txt', SRC);
  assert(msg.includes(`${TOTAL} questões`), msg);
  await applyAndClose(page);
  await page.waitForTimeout(500);
  page.off('request', spy);
  const sample = P.questions[0].blocks[1];
  assert(!sent.some((r) => r.method !== 'GET' || r.body.includes(sample) || decodeURIComponent(r.url).includes(sample)), `o arquivo importado gerou envio: ${JSON.stringify(sent.map((r) => r.method + ' ' + r.url))}`);
  await page.click('[data-role=open-activity]');
  await page.waitForSelector('[data-role=block-pt]');
  assert(await title() === `Questão 1 de ${TOTAL}`, await title());
  const ens = await page.locator('[data-role=block-en]').allTextContents();
  assert(JSON.stringify(ens) === JSON.stringify(P.questions[0].blocks), 'blocos da Questão 1 diferentes do arquivo');
  const vals = await page.locator('[data-role=block-pt]').evaluateAll((els) => els.map((e) => e.value));
  assert(vals.every((v) => v === ''), 'tradução pré-preenchida');
  const navDisabled = await page.locator('[data-role=q-nav] button').evaluateAll((b) => b.slice(1).every((x) => x.disabled));
  assert(navDisabled, 'questões seguintes deveriam estar bloqueadas');
  await shot('c02-q1');
  return { blocosQ1: ens.length, totalBlocos: P.questions.reduce((n, q) => n + q.blocks.length, 0), requisicoesDuranteImportacao: sent.length, envios: 0 };
});

await check('C03', 'Avançar exige todas as traduções da questão (mostra o que falta e não avança)', async () => {
  await page.locator('[data-role=block-pt]').first().fill('Algo');
  await page.click('[data-role=q-save]');
  await page.waitForSelector('[data-role=q-missing]');
  const miss = await page.locator('[data-role=q-missing]').textContent();
  assert(await title() === `Questão 1 de ${TOTAL}`, 'avançou com blocos vazios');
  return miss;
});

await check('C04', 'Salvamento automático: digitar, recarregar e fechar o app inteiro preservam o texto (sem clicar em salvar)', async () => {
  await fillQuestion(1);
  await page.waitForTimeout(700);
  await page.reload(); await page.waitForTimeout(700);
  const v1 = await page.locator('[data-role=block-pt]').nth(1).inputValue();
  assert(v1 === pt(1, 1), `após recarregar: ${v1}`);
  await page.locator('[data-role=block-pt]').nth(1).fill(pt(1, 1) + ' editado');
  await page.waitForTimeout(400); // salvamento automático (~0,15 s depois de digitar)
  await ctx.close(); // fecha o app inteiro, sem clicar em salvar
  await open();
  await go('#/course');
  await page.click('[data-role=open-activity]');
  await page.waitForSelector('[data-role=block-pt]');
  const v2 = await page.locator('[data-role=block-pt]').nth(1).inputValue();
  assert(v2 === pt(1, 1) + ' editado', `após fechar e reabrir: ${v2}`);
  // sair do app logo depois de digitar (o sistema esconde a página e a encerra): cópia síncrona ao esconder
  await page.locator('[data-role=block-pt]').nth(2).fill('Digitado e saiu na hora');
  await app(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
  await ctx.close();
  await open();
  await go('#/course');
  await page.click('[data-role=open-activity]');
  await page.waitForSelector('[data-role=block-pt]');
  const v3 = await page.locator('[data-role=block-pt]').nth(2).inputValue();
  assert(v3 === 'Digitado e saiu na hora', `saída imediata: ${v3}`);
  await page.locator('[data-role=block-pt]').nth(1).fill(pt(1, 1));
  return 'recarregar, fechar/reabrir e sair logo após digitar: texto preservado';
});

const exportSeen = [];
await check('C05', `Percorre as ${TOTAL} questões uma a uma (Questão n de ${TOTAL}, progresso, sem exportação antes do fim)`, async () => {
  for (let n = 1; n <= TOTAL; n++) {
    assert(await title() === `Questão ${n} de ${TOTAL}`, `título na ${n}: ${await title()}`);
    const ens = await page.locator('[data-role=block-en]').allTextContents();
    assert(JSON.stringify(ens) === JSON.stringify(P.questions[n - 1].blocks), `blocos da questão ${n}`);
    const prog = await page.locator('[data-role=course-progress]').textContent();
    assert(prog.startsWith(`${n - 1} de ${TOTAL}`), `progresso na ${n}: ${prog}`);
    if (await page.locator('[data-role=open-export-final]').count()) exportSeen.push(n);
    await fillQuestion(n);
    await page.click('[data-role=q-save]');
    await page.waitForTimeout(n === TOTAL ? 700 : 500);
    if (n < TOTAL && n === 20) await shot('c05-q20');
  }
  assert(!exportSeen.length, `exportação apareceu antes de concluir: ${exportSeen}`);
  assert(await title() === `Questão ${TOTAL} de ${TOTAL}`, 'deveria ficar na última');
  return { questoes: TOTAL, exportacaoAntesDoFim: exportSeen.length };
});

await check('C06', 'Checagem básica aparece só depois de salvar, como orientação (não bloqueia, não muda a resposta)', async () => {
  const levels = await page.locator('[data-role=block-check] .chip').evaluateAll((c) => c.map((x) => x.dataset.level));
  assert(levels.length > 0, 'sem checagem na questão salva');
  assert(await page.locator('[data-role=check-note]').count() === 1, 'sem aviso de que não é correção oficial');
  const v = await page.locator('[data-role=block-pt]').first().inputValue();
  assert(v === pt(TOTAL, 0), 'resposta alterada');
  return { niveis: [...new Set(levels)] };
});

await check('C07', `Na Questão ${TOTAL} concluída: “Exportar respostas” gera o TXT completo (cabeçalho + ${TOTAL} questões, inglês + tradução, acentos)`, async () => {
  await page.waitForSelector('[data-role=open-export-final]');
  await page.click('[data-role=open-export-final]');
  await page.waitForSelector('[data-role=export-complete]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-role=export-txt]')]);
  const txt = readFileSync(await dl.path(), 'utf8');
  await page.keyboard.press('Escape');
  exported = txt;
  writeFileSync(join(OUT, 'export-shape.json'), JSON.stringify({ file: dl.suggestedFilename(), bytes: Buffer.byteLength(txt), lines: txt.split('\n').length }, null, 1));
  const expected = P.questions.map((q) => [`QUESTÃO ${q.n}`, ...q.blocks.flatMap((en, i) => [en, pt(q.n, i)])].join('\n')).join('\n\n') + '\n';
  const [head, ...rest] = txt.split('\n\nQUESTÃO 1\n');
  assert(`QUESTÃO 1\n${rest.join('')}` === expected, 'corpo exportado diferente do esperado');
  assert(/^Curso — Atividades\nAtividade: .+\nExportado em: .+\nSituação: completa \(\d+ de \d+/.test(head), `cabeçalho: ${head}`);
  assert((txt.match(/^QUESTÃO \d+$/gm) || []).length === TOTAL, 'número de questões no TXT');
  await shot('c07-export');
  return { arquivo: dl.suggestedFilename(), questoes: TOTAL, bytes: Buffer.byteLength(txt) };
});

await check('C08', 'Editar resposta anterior (Questão 3): muda a versão atual; a primeira versão enviada fica preservada', async () => {
  await page.locator('[data-role=q-nav] button', { hasText: /^3/ }).first().click();
  await page.waitForTimeout(500);
  assert(await title() === `Questão 3 de ${TOTAL}`, await title());
  await page.locator('[data-role=block-pt]').nth(1).fill('Versão revisada pelo aluno');
  await page.click('[data-role=q-save]');
  await page.waitForTimeout(500);
  await page.locator('[data-role=q-nav] button', { hasText: /^3/ }).first().click();
  await page.waitForTimeout(500);
  assert(await page.locator('[data-role=block-pt]').nth(1).inputValue() === 'Versão revisada pelo aluno', 'edição perdida');
  const a = await act();
  assert(a.answers[3][1] === 'Versão revisada pelo aluno' && a.submitted[3].blocks[1] === pt(3, 1), 'versões');
  return { atual: a.answers[3][1], enviada: a.submitted[3].blocks[1] };
});

await check('C09', 'Dados de validação do professor já gravados (aparelho antigo): preservados e usados internamente, sem nada na interface; o campo continua editável', async () => {
  // simula o registro de um aparelho que já tinha a correção do professor na Questão 2 (como gravava a versão anterior)
  await page.waitForTimeout(500);
  await app(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const s = r.result.transaction('kv', 'readwrite').objectStore('kv'); const g = s.get('course'); g.onsuccess = () => {
    const d = g.result; const a = d.activities[d.last]; const n = a.questions[1].blocks.length;
    a.teacher[2] = { blocks: Array.from({ length: n }, (_, i) => (i === 0 ? 'Correção do professor — título' : a.answers[2][i])), validatedAt: Date.now(), imported: true };
    a.answers[2] = a.teacher[2].blocks.slice(); d.savedAt = Date.now() + 60000; s.put(d, 'course').onsuccess = () => { localStorage.removeItem('drg.course.mirror'); res(); }; }; }; }));
  await page.goto(`${BASE}#/cq/${(await act()).id}?q=2`); await page.reload(); await page.waitForTimeout(700);
  const ui = await page.locator('#view').innerText();
  assert(!/professor|validad/i.test(ui), 'texto de validação na questão');
  assert(!(await page.locator('[data-role=teacher], [data-role=q-validated], [data-role=official-answer]').count()), 'elementos de validação na questão');
  const first = page.locator('[data-role=block-pt]').first();
  assert(!(await first.isDisabled()) && (await first.inputValue()) === 'Correção do professor — título', 'campo travado ou resposta diferente');
  await shot('c09-sem-validacao');
  // usados internamente: Praticar oferece a tradução reversa da Questão 2 (resposta de referência)
  await page.click('[data-role=course-head] [data-role=open-practice]');
  await page.waitForSelector('[data-role=mode-rev]');
  const rev = await page.locator('[data-role=mode-rev]').isDisabled();
  const pui = await page.locator('#view').innerText();
  assert(!rev && !/professor|validad/i.test(pui), `tradução reversa ${rev ? 'indisponível' : 'ok'}; texto: ${/professor|validad/i.test(pui)}`);
  const a = await act();
  assert(a.teacher[2].validatedAt && a.teacher[2].blocks[0] === 'Correção do professor — título' && a.submitted[2].blocks[0] === pt(2, 0), 'dados');
  await page.goto(`${BASE}#/cq/${a.id}?q=2`); await page.waitForTimeout(600);
  return { campo: 'editável', traducaoReversa: 'disponível', dadosDoProfessor: 'preservados' };
});

await check('C10', 'Exportação parcial (bloco apagado na Questão 5) pelo ícone: avisa o que falta, exporta e não altera nada', async () => {
  await page.locator('[data-role=q-nav] button', { hasText: /^5/ }).first().click();
  await page.waitForTimeout(500);
  await page.locator('[data-role=block-pt]').nth(1).fill('');
  await page.waitForTimeout(500);
  await go('#/course');
  const before = JSON.stringify((await kvRaw(page)).activities);
  await page.click('[data-role=open-export]');
  await page.waitForSelector('[data-role=export-partial]');
  const msg = (await page.locator('[data-role=export-partial]').textContent()).replace(/\s+/g, ' ');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-role=export-txt]')]);
  const txt = readFileSync(await dl.path(), 'utf8');
  const [dj] = await Promise.all([page.waitForEvent('download'), page.click('[data-role=export-json]')]);
  const js = JSON.parse(readFileSync(await dj.path(), 'utf8'));
  await shot('c10-parcial');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const after = JSON.stringify((await kvRaw(page)).activities);
  assert(/questão 5/.test(msg) && /CONTÉM RESPOSTAS INCOMPLETAS/.test(txt) && /Questão 5 \(bloco 2\)/.test(txt), `${msg} / ${txt.slice(0, 300)}`);
  assert(js.completa === false && js.questoes[4].blocos[1].preenchido === false && js.questoes.length === TOTAL, 'JSON');
  assert(!/validad|teacher/i.test(txt) && !/"(teacher|validatedAt|submitted|archive)"/.test(JSON.stringify(js)), 'dados de validação na exportação');
  assert(before === after, 'a exportação alterou a atividade');
  await page.goto(`${BASE}#/cq/${(await act()).id}?q=5`); await page.waitForTimeout(600);
  await page.locator('[data-role=block-pt]').nth(1).fill(pt(5, 1));
  await page.click('[data-role=q-save]');
  await page.waitForTimeout(500);
  return { aviso: msg.slice(0, 90), txt: 'CONTÉM RESPOSTAS INCOMPLETAS', json: 'completa=false', alterou: 'nada' };
});

await check('C11', 'Fechar e reabrir o app: tudo preservado; a área retoma do ponto em que parou', async () => {
  await page.locator('[data-role=q-nav] button', { hasText: /^7/ }).first().click();
  await page.waitForTimeout(400);
  await page.locator('[data-role=block-pt]').last().focus();
  await page.waitForTimeout(500);
  await ctx.close();
  await open();
  await go('#/');
  const home = await page.locator('[data-role=course-next]').textContent();
  await go('#/course');
  const prog = await page.locator('[data-role=activity-progress]').textContent();
  await page.click('[data-role=open-activity]');
  await page.waitForTimeout(600);
  assert(await title() === `Questão 7 de ${TOTAL}`, `retomou em ${await title()}`);
  const a = await act();
  assert(a.answers[3][1] === 'Versão revisada pelo aluno' && a.teacher[2].validatedAt, 'dados perdidos');
  assert(prog.startsWith(`${TOTAL} de ${TOTAL}`), prog);
  return { inicio: home.replace(/^[^:]*:/, '…:'), area: prog };
});

// ---------- outro aparelho (“celular”): importar a atividade e as respostas exportadas; sem importação de correção ----------
{
  const PHONE = join(OUT, '.profile-celular');
  rmSync(PHONE, { recursive: true, force: true });
  let c2, p2;
  const openPhone = async () => { c2 = await chromium.launchPersistentContext(PHONE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }); p2 = c2.pages()[0] || await c2.newPage(); p2.on('pageerror', (e) => errors.push(e.message)); };
  const act2 = async () => { const d = await kvRaw(p2); return d && d.activities[d.last]; };
  const area = async () => { await p2.goto(BASE + '#/course'); await p2.waitForTimeout(700); };

  await check('C14', `Celular: “Adicionar atividade” com o TXT exportado → ${TOTAL} questões associadas às questões certas (inglês conferido); respostas visíveis e editáveis`, async () => {
    await openPhone();
    await p2.goto(BASE); await p2.waitForTimeout(800);
    await p2.evaluate(async () => { await window.DRG_APP.chooseCharacter('lucas'); window.DRG_APP.go('#/'); });
    await area();
    await addFile(p2, 'atividade.txt', SRC); await applyAndClose(p2);
    const prev = await addFile(p2, 'respostas.txt', exported.replace(/\n/g, '\r\n'));
    assert(prev.includes(`${TOTAL} de ${TOTAL} questões identificadas`), prev);
    await applyAndClose(p2);
    const a = await act2();
    const wrong = [];
    for (const q of P.questions) q.blocks.forEach((_, i) => { if ((a.answers[q.n] || [])[i] !== pt(q.n, i)) wrong.push(`${q.n}.${i + 1}`); });
    assert(!wrong.length, `respostas fora do lugar: ${wrong.slice(0, 5)}`);
    await p2.goto(`${BASE}#/cq/${a.id}?q=5`); await p2.waitForTimeout(700);
    const ta = p2.locator('[data-role=block-pt]').nth(1);
    assert((await ta.inputValue()) === pt(5, 1) && !(await ta.isDisabled()), 'Q5 no celular');
    await ta.fill('Editada no celular'); await p2.waitForTimeout(500);
    assert((await act2()).answers[5][1] === 'Editada no celular', 'edição no celular não salvou');
    await p2.screenshot({ path: join(OUT, 'c14-celular.png'), fullPage: true });
    return { previa: prev.slice(0, 160), questoes: TOTAL, blocosConferidos: P.questions.reduce((n, q) => n + q.blocks.length, 0) };
  });

  await check('C15', 'Sem importação de correção/validação do professor na interface; reimportar as respostas é seguro (mesmo resultado)', async () => {
    await area();
    await p2.click('[data-role=open-import]'); await p2.waitForSelector('[data-role=import-sheet]');
    const sheetText = await p2.locator('[data-role=import-sheet]').innerText();
    const roles = await p2.locator('[data-role=import-teacher], [data-role=transfer]').count();
    assert(!roles && !/professor|correç|validad/i.test(sheetText), `importação de correção visível: ${sheetText.slice(0, 120)}`);
    await p2.keyboard.press('Escape');
    const prev = await addFile(p2, 'respostas.txt', exported);
    await applyAndClose(p2);
    const a = await act2();
    assert(a.answers[5][1] === pt(5, 1) && a.answers[3][0] === pt(3, 0), 'reimportação');
    return { importacaoDeCorrecao: 'ausente', reimportacao: prev.slice(0, 120) };
  });

  await check('C16', 'Arquivo de respostas que não confere (inglês alterado na questão 3): mostra o problema e não altera nada', async () => {
    await area();
    const before = JSON.stringify(await kvRaw(p2));
    const bad = P.questions.slice(0, 3).map((q) => [`QUESTÃO ${q.n}`, ...q.blocks.flatMap((en, i) => [q.n === 3 && i === 1 ? 'This line is not in the activity.' : en, `X ${q.n}.${i + 1}`])].join('\n')).join('\n\n') + '\n';
    const prev = await addFile(p2, 'errado.txt', bad);
    const apply = await p2.locator('[data-role=import-apply]').count();
    await p2.keyboard.press('Escape');
    const after = JSON.stringify(await kvRaw(p2));
    assert(/Nada foi alterado/.test(prev) && /Questão 3: o bloco 2 em inglês não foi encontrado/.test(prev) && apply === 0 && before === after, prev);
    return prev.slice(0, 170);
  });

  await check('C17', 'Fechar e reabrir no celular: respostas importadas e edição preservadas; a área retoma', async () => {
    await c2.close();
    await openPhone();
    await area();
    const a = await act2();
    assert(a.answers[5][1] === pt(5, 1) && a.answers[10][0] === pt(10, 0) && Object.keys(a.answers).length === TOTAL, 'persistência');
    const prog = (await p2.locator('[data-role=activity-progress]').textContent()).trim();
    await c2.close();
    return { aposReabrir: 'preservado', progresso: prog };
  });
}

// ---------- outro celular: atividade em .docx, arquivo de transferência, um só cartão, remover ----------
await check('C18', 'Outro aparelho: atividade em .docx; TXT de respostas recusado como atividade; arquivo de transferência do “computador” → um só cartão com o mesmo progresso; remover cartão', async () => {
  const was = page.url(); // C12 continua da tela em que estava
  await go('#/course');
  await page.locator('[data-role=activity-more] summary').first().click();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('[data-role=export-transfer]').first().click()]);
  const transfer = readFileSync(await dl.path(), 'utf8');
  const pcDone = (await page.locator('[data-role=activity-progress]').first().textContent()).trim();
  await page.goto(was); await page.waitForTimeout(600);
  const PH = join(OUT, '.profile-celular2');
  rmSync(PH, { recursive: true, force: true });
  const c3 = await chromium.launchPersistentContext(PH, { viewport: { width: 412, height: 915 }, isMobile: true });
  const p3 = c3.pages()[0] || await c3.newPage();
  p3.on('pageerror', (e) => errors.push(e.message));
  try {
    await p3.goto(BASE); await p3.waitForTimeout(800);
    await p3.evaluate(async () => { await window.DRG_APP.chooseCharacter('lucas'); });
    await p3.goto(BASE + '#/course'); await p3.waitForTimeout(700);
    // .docx como o Word grava (ZIP + word/document.xml, um parágrafo por linha)
    const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    const xml = `<w:document><w:body>${SRC.split(/\r?\n/).map((l) => `<w:p><w:r><w:t xml:space="preserve">${esc(l)}</w:t></w:r></w:p>`).join('')}</w:body></w:document>`;
    const nm = Buffer.from('word/document.xml'), raw = Buffer.from(xml), dat = deflateRawSync(raw);
    const L = Buffer.alloc(30); L.writeUInt32LE(0x04034b50, 0); L.writeUInt16LE(8, 8); L.writeUInt32LE(dat.length, 18); L.writeUInt16LE(nm.length, 26);
    const CD = Buffer.alloc(46); CD.writeUInt32LE(0x02014b50, 0); CD.writeUInt16LE(8, 10); CD.writeUInt32LE(dat.length, 20); CD.writeUInt16LE(nm.length, 28);
    const E = Buffer.alloc(22); E.writeUInt32LE(0x06054b50, 0); E.writeUInt16LE(1, 10); E.writeUInt32LE(30 + nm.length + dat.length, 16);
    const docxMsg = await addFile(p3, 'atividade.docx', Buffer.concat([L, nm, dat, CD, nm, E]), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    assert(docxMsg.includes(`${TOTAL} questões`), docxMsg);
    await applyAndClose(p3);
    // o TXT exportado (respostas) não vira um cartão novo: é reconhecido como respostas da atividade
    const asAnswers = await addFile(p3, 'respostas.txt', exported);
    assert(/Respostas da atividade/.test(asAnswers) && !/adicionada/.test(asAnswers), asAnswers);
    await p3.click('[data-role=import-cancel]');
    // cópia de segurança (transferência) do “computador”
    const prev = await addFile(p3, 'transferencia.json', transfer, 'application/json');
    await applyAndClose(p3);
    await p3.waitForTimeout(500);
    const cards = await p3.locator('[data-role=activity]').count();
    const done = (await p3.locator('[data-role=activity-progress]').first().textContent()).trim();
    assert(cards === 1 && done === pcDone && /já está neste aparelho/.test(prev), JSON.stringify({ cards, done, pcDone, prev }));
    // remover o cartão (com confirmação), em “Opções”
    await p3.locator('[data-role=activity-more] summary').first().click();
    await p3.locator('[data-role=remove-activity]').click();
    await p3.getByRole('button', { name: 'Remover', exact: true }).last().click();
    await p3.waitForSelector('[data-role=no-activity]');
    return { docx: docxMsg.slice(0, 80), txtComoAtividade: 'reconhecido como respostas', transferencia: prev.slice(0, 150), cartoes: cards, progresso: done, remover: 'ok' };
  } finally { await c3.close(); }
});

await check('C12', 'Funciona offline (servidor desligado): área, questão e exportação', async () => {
  await stopServer();
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(800);
  const ok = await page.locator('[data-role=block-pt]').count();
  await go('#/course').catch(() => {});
  await page.click('[data-role=open-export]').catch(() => {});
  await page.waitForTimeout(400);
  const area = await page.locator('[data-role=export-txt]').count();
  await page.keyboard.press('Escape').catch(() => {});
  await ctx.setOffline(false);
  assert(ok > 0 && area === 1, `offline: blocos ${ok}, exportação ${area}`);
  return { blocos: ok, exportacao: area };
});

await check('C13', 'Funcionalidades existentes intactas: jornadas no Início, progresso das jornadas sem mudança, sem erros, sem rede externa, sem rolagem lateral', async () => {
  await go('#/');
  const now = await app(() => ({ dr: !!document.querySelector('[data-role=track-dr]'), cp: !!document.querySelector('[data-role=journey-entry]'), profiles: Object.keys(window.DRG_APP.state.profiles).sort(), cards: Object.values(window.DRG_APP.state.profiles).reduce((n, p) => n + Object.keys((p && p.cards) || {}).length, 0) }));
  assert(JSON.stringify(now) === JSON.stringify(journeysBefore), `antes ${JSON.stringify(journeysBefore)} depois ${JSON.stringify(now)}`);
  assert(await noHScroll(), 'rolagem lateral no Início');
  await go('#/modules');
  assert(await page.locator('[data-role=module]').count() > 0 || await page.locator('.card').count() > 0, 'lista de módulos');
  assert(!errors.length, `erros: ${errors.join(' | ')}`);
  assert(!external.length, `externas: ${external.join(', ')}`);
  await shot('c13-home');
  return { jornadas: now, erros: errors.length, externas: external.length };
});

await ctx.close();
const ok = results.filter((r) => r.status === 'aprovado').length;
writeFileSync(join(OUT, 'course-results.json'), JSON.stringify({ at: new Date().toISOString(), conteudo: process.env.DRG_COURSE_FILE ? 'arquivo real (fora do repositório)' : 'sintético', questoes: TOTAL, results }, null, 1));
console.log(`\n${ok} aprovados, ${results.length - ok} reprovados`);
process.exit(ok === results.length ? 0 : 1);
