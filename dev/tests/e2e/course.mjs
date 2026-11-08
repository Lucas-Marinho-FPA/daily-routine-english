// Curso — Atividades no app (Chromium, 412 px): importação no aparelho, 21 questões em sequência, salvamento automático,
// fechar e reabrir, edição de respostas anteriores, validação do professor por questão, exportação TXT só no fim,
// offline e funcionalidades existentes intactas.
// Uso: node tests/e2e/course.mjs <pasta-do-site> <caminho-base> [evidências]
// Conteúdo: DRG_COURSE_FILE=<arquivo da atividade> (fica fora do repositório); sem ele, gera uma atividade sintética
// de 21 questões. Os logs não imprimem o texto da atividade.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';
import { parseActivity } from '../../app/js/engine/course.js';

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
  const body = await page.locator('body').innerText();
  const priv = new RegExp(Buffer.from('XGIoPzppdGFbdcO6XXxFQUN8cGVyc29ubmFsaXRcdyp8bGFzdHJvKVxi', 'base64').toString('utf8'), 'i');
  assert(!priv.test(body), 'nome privado na tela');
  await shot('c01-area');
  return { titulo: t, jornadas: journeysBefore };
});

await check('C02', `Importa o arquivo no aparelho: ${TOTAL} questões; “Começar” abre a Questão 1 sem nenhuma tradução pronta`, async () => {
  await page.click('[data-role=import] summary');
  const sent = [];
  const spy = (r) => sent.push({ method: r.method(), url: r.url(), body: r.postData() || '' });
  page.on('request', spy);
  await page.setInputFiles('[data-role=import-file]', { name: 'atividade.txt', mimeType: 'text/plain', buffer: Buffer.from(SRC, 'utf8') });
  await page.waitForSelector('[data-role=import-ok]');
  await page.waitForTimeout(500);
  page.off('request', spy);
  const sample = P.questions[0].blocks[1];
  assert(!sent.some((r) => r.method !== 'GET' || r.body.includes(sample) || decodeURIComponent(r.url).includes(sample)), `o arquivo importado gerou envio: ${JSON.stringify(sent.map((r) => r.method + ' ' + r.url))}`);
  const msg = await page.locator('[data-role=import-ok]').textContent();
  assert(msg.includes(`${TOTAL} questões`), msg);
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
    if (await page.locator('[data-role=export-txt], [data-role=export-blocked]').count()) exportSeen.push(n);
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

await check('C07', `Na Questão ${TOTAL} concluída: “Exportar todas as respostas” gera o TXT completo (${TOTAL} questões, inglês + tradução, acentos)`, async () => {
  await page.waitForSelector('[data-role=export-txt]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-role=export-txt]')]);
  const txt = readFileSync(await dl.path(), 'utf8');
  exported = txt;
  writeFileSync(join(OUT, 'export-shape.json'), JSON.stringify({ file: dl.suggestedFilename(), bytes: Buffer.byteLength(txt), lines: txt.split('\n').length }, null, 1));
  const expected = P.questions.map((q) => [`QUESTÃO ${q.n}`, ...q.blocks.flatMap((en, i) => [en, pt(q.n, i)])].join('\n')).join('\n\n') + '\n';
  assert(txt === expected, 'conteúdo exportado diferente do esperado');
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

await check('C09', 'Validação do professor só na Questão 2: versão corrigida registrada, data, enviada e checagem preservadas', async () => {
  await page.locator('[data-role=q-nav] button', { hasText: /^2/ }).first().click();
  await page.waitForTimeout(500);
  await page.click('[data-role=teacher] summary').catch(() => {});
  if (await page.locator('[data-role=teacher-start]').count()) await page.click('[data-role=teacher-start]');
  await page.locator('[data-role=teacher-pt]').first().fill('Correção do professor — título');
  await page.click('[data-role=teacher-validate]');
  await page.waitForSelector('[data-role=official-answer]');
  await page.waitForTimeout(300);
  const chip = await page.locator('[data-role=q-validated]').textContent();
  assert(/Validada pelo professor em/.test(chip), chip);
  // uma só versão visível: a do professor, como resposta oficial (campo travado; sem a lista paralela de correção)
  const first = page.locator('[data-role=block-pt]').first();
  assert(await first.isDisabled() && (await first.inputValue()) === 'Correção do professor — título' && (await page.locator('[data-role=teacher-pt]').count()) === 0, 'resposta oficial');
  await shot('c09-teacher');
  await page.locator('[data-role=q-nav] button', { hasText: /^4/ }).first().click();
  await page.waitForTimeout(500);
  const other = await page.locator('[data-role=q-validated]').textContent();
  assert(/Aguardando/.test(other), `a Questão 4 não deveria estar validada: ${other}`);
  const a = await act();
  const t = a.teacher[2];
  assert(t.validatedAt && t.blocks[0] === 'Correção do professor — título', 'correção');
  assert(a.answers[2][0] === 'Correção do professor — título' && a.submitted[2].blocks[0] === pt(2, 0) && a.submitted[2].check.length === P.questions[1].blocks.length, 'versão enviada/checagem');
  const validated = Object.values(a.teacher).filter((x) => x.validatedAt).length;
  assert(validated === 1, `validadas: ${validated}`);
  return { validadas: validated, questao4: other };
});

await check('C10', 'Exportação incompleta é recusada e diz o que falta (bloco apagado na Questão 5)', async () => {
  await page.locator('[data-role=q-nav] button', { hasText: /^5/ }).first().click();
  await page.waitForTimeout(500);
  await page.locator('[data-role=block-pt]').nth(1).fill('');
  await page.waitForTimeout(500);
  await go('#/course');
  const blocked = await page.locator('[data-role=export-blocked]').count();
  const exp = await page.locator('[data-role=export-txt]').count();
  await page.goto(`${BASE}#/cq/${(await act()).id}?q=${TOTAL}`); await page.waitForTimeout(600);
  const msg = await page.locator('[data-role=export-blocked]').textContent().catch(() => '');
  assert(!exp && /Questão 5: bloco 2 sem tradução/.test(msg), `bloqueio: ${msg}`);
  await page.locator('[data-role=q-nav] button', { hasText: /^5/ }).first().click();
  await page.waitForTimeout(500);
  await page.locator('[data-role=block-pt]').nth(1).fill(pt(5, 1));
  await page.click('[data-role=q-save]');
  await page.waitForTimeout(500);
  return { areaBloqueada: blocked === 0 ? 'sem caixa na área (atividade incompleta não mostra exportação)' : 'caixa de bloqueio', mensagem: msg.replace(/\s+/g, ' ').slice(0, 80) };
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
  const val = await page.locator('[data-role=activity-validated]').textContent();
  await page.click('[data-role=open-activity]');
  await page.waitForTimeout(600);
  assert(await title() === `Questão 7 de ${TOTAL}`, `retomou em ${await title()}`);
  const a = await act();
  assert(a.answers[3][1] === 'Versão revisada pelo aluno' && a.teacher[2].validatedAt, 'dados perdidos');
  assert(prog.startsWith(`${TOTAL} de ${TOTAL}`) && /1 de/.test(val), `${prog} / ${val}`);
  return { inicio: home.replace(/^[^:]*:/, '…:'), area: prog, validadas: val };
});

// ---------- transferência para outro aparelho (“celular”) e correções do professor ----------
{
  const PHONE = join(OUT, '.profile-celular');
  rmSync(PHONE, { recursive: true, force: true });
  let c2, p2;
  const openPhone = async () => { c2 = await chromium.launchPersistentContext(PHONE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true }); p2 = c2.pages()[0] || await c2.newPage(); p2.on('pageerror', (e) => errors.push(e.message)); };
  const kv2 = () => p2.evaluate(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const g = r.result.transaction('kv').objectStore('kv').get('course'); g.onsuccess = () => res(g.result); }; }));
  const act2 = async () => { const d = await kv2(); return d && d.activities[d.last]; };
  const importFile = async (role, name, text) => {
    await p2.goto(BASE + '#/course'); await p2.waitForTimeout(700);
    await p2.$eval('[data-role=transfer]', (d) => { d.open = true; }); // abre a seção (sem fechá-la se já estiver aberta)
    await p2.setInputFiles(`[data-role=${role}]`, { name, mimeType: 'text/plain', buffer: Buffer.from(text, 'utf8') });
    await p2.waitForSelector('[data-role=transfer-preview], [data-role=transfer-error]');
    return (await p2.locator('[data-role=transfer-status]').innerText()).replace(/\s+/g, ' ');
  };
  // arquivo de correções do professor (exemplo): só as questões 2 e 7, com as traduções corrigidas
  const teacherFile = (nums, tag, alter = null) => nums.map((n) => {
    const q = P.questions[n - 1];
    return [`QUESTÃO ${n}`, ...q.blocks.flatMap((en, i) => [alter && alter.n === n && i === 1 ? alter.en : en, `${tag} ${n}.${i + 1} — correção`])].join('\n');
  }).join('\n\n') + '\n';

  await check('C14', `Celular: “Importar minhas respostas” com o TXT exportado → ${TOTAL} questões associadas às questões certas (inglês conferido); respostas visíveis e editáveis`, async () => {
    await openPhone();
    await p2.goto(BASE); await p2.waitForTimeout(800);
    await p2.evaluate(async () => { await window.DRG_APP.chooseCharacter('lucas'); window.DRG_APP.go('#/'); });
    await p2.goto(BASE + '#/course'); await p2.waitForTimeout(700);
    await p2.click('[data-role=import] summary');
    await p2.setInputFiles('[data-role=import-file]', { name: 'atividade.txt', mimeType: 'text/plain', buffer: Buffer.from(SRC, 'utf8') });
    await p2.waitForSelector('[data-role=import-ok]');
    const prev = await importFile('import-own', 'respostas.txt', exported.replace(/\n/g, '\r\n'));
    assert(prev.includes(`${TOTAL} de ${TOTAL} questões identificadas`), prev);
    await p2.click('[data-role=transfer-apply]');
    await p2.waitForSelector('[data-role=transfer-ok]');
    const a = await act2();
    // o que o computador exportou (C07): todas as respostas pt(n, i); cada uma na sua questão e bloco
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

  await check('C15', 'Correções do professor (exemplo com as questões 2 e 7): viram a resposta oficial, validadas; únicas exibidas; reimportar minhas respostas não as altera', async () => {
    const prev = await importFile('import-teacher', 'correcoes.txt', teacherFile([2, 7], 'Corrigido'));
    assert(/2 de \d+ questões identificadas/.test(prev) && /validadas pelo professor/.test(prev), prev);
    await p2.click('[data-role=transfer-apply]');
    await p2.waitForSelector('[data-role=transfer-ok]');
    let a = await act2();
    assert(a.teacher[2].validatedAt && a.teacher[7].validatedAt && a.answers[2][0] === 'Corrigido 2.1 — correção' && a.answers[7][3] === 'Corrigido 7.4 — correção', 'validação/substituição');
    assert(a.answers[5][1] === 'Editada no celular' && a.answers[3][0] === pt(3, 0), 'outras questões mudaram');
    await p2.goto(`${BASE}#/cq/${a.id}?q=2`); await p2.waitForTimeout(700);
    const official = await p2.locator('[data-role=official-answer]').count();
    const first = p2.locator('[data-role=block-pt]').first();
    assert(official === 1 && await first.isDisabled() && (await first.inputValue()) === 'Corrigido 2.1 — correção' && (await p2.locator('[data-role=teacher-pt]').count()) === 0, 'Q2 oficial');
    await p2.screenshot({ path: join(OUT, 'c15-oficial.png'), fullPage: true });
    // reimportar as respostas pessoais: as validadas não mudam
    const prev2 = await importFile('import-own', 'respostas.txt', exported);
    assert(/não mudam/.test(prev2), prev2);
    await p2.click('[data-role=transfer-apply]'); await p2.waitForSelector('[data-role=transfer-ok]');
    a = await act2();
    assert(a.answers[2][0] === 'Corrigido 2.1 — correção' && a.answers[7][3] === 'Corrigido 7.4 — correção', 'validadas foram sobrescritas');
    return { previa: prev.slice(0, 160), reimportacao: prev2.match(/\d+ questões serão atualizadas[^.]*/)[0] };
  });

  await check('C16', 'Arquivo que não confere (inglês alterado na questão 3): mostra o problema e não altera nada', async () => {
    const before = JSON.stringify(await kv2());
    const prev = await importFile('import-teacher', 'errado.txt', teacherFile([3], 'X', { n: 3, en: 'This line is not in the activity.' }));
    const apply = await p2.locator('[data-role=transfer-apply]').count();
    const after = JSON.stringify(await kv2());
    assert(/Nada foi alterado/.test(prev) && /Questão 3: o bloco 2 em inglês não foi encontrado/.test(prev) && apply === 0 && before === after, prev);
    return prev.slice(0, 170);
  });

  await check('C17', 'Fechar e reabrir no celular: respostas importadas, edição e validações preservadas; nova correção posterior atualiza a questão', async () => {
    await c2.close();
    await openPhone();
    let a = await (async () => { await p2.goto(BASE + '#/course'); await p2.waitForTimeout(800); return act2(); })();
    // (a reimportação das respostas pessoais em C15 devolveu à Q5 a resposta do arquivo; as validadas ficaram)
    assert(a.answers[5][1] === pt(5, 1) && a.teacher[2].validatedAt && a.teacher[7].validatedAt && a.answers[2][0] === 'Corrigido 2.1 — correção' && a.answers[10][0] === pt(10, 0), 'persistência: ' + JSON.stringify({ q5: a.answers[5][1], q2: a.answers[2][0] }));
    const prev = await importFile('import-teacher', 'correcoes-2.txt', teacherFile([2], 'Corrigido de novo'));
    await p2.click('[data-role=transfer-apply]'); await p2.waitForSelector('[data-role=transfer-ok]');
    a = await act2();
    const nQ = Object.keys(a.answers).length;
    assert(a.answers[2][0] === 'Corrigido de novo 2.1 — correção' && a.teacher[2].blocks[0] === 'Corrigido de novo 2.1 — correção' && a.teacher[7].validatedAt && nQ === TOTAL, JSON.stringify({ q2: a.answers[2][0], nQ }));
    await c2.close();
    return { aposReabrir: 'preservado', novaCorrecaoQ2: a.answers[2][0], questoes: nQ, validadas: Object.values(a.teacher).filter((t) => t.validatedAt).length };
  });
}

await check('C12', 'Funciona offline (servidor desligado): área, questão e exportação', async () => {
  await stopServer();
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(800);
  const ok = await page.locator('[data-role=block-pt]').count();
  await go('#/course').catch(() => {});
  const area = await page.locator('[data-role=export-txt]').count();
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
