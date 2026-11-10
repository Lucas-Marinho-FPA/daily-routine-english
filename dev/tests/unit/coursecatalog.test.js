// Curso — Atividades: catálogo por arquivo de estudo (formato oficial), adoção das atividades já existentes no
// aparelho, atualização controlada (histórico preservado), bloqueio sequencial entre partes e exportação das respostas
// (completa, parcial e vazia, sem alterar nada). Conteúdo SINTÉTICO (o material do curso não é versionado).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseActivity, newActivity, finishQuestion, summary, contentKey, applyTeacherAnswers, officialAnswers, isValidated,
  readPackage, planPackage, applyPackage, updateActivity, partLock, catalogOrder, exportReport, exportText, PACKAGE_KIND,
} from '../../app/js/engine/course.js';

const Q = (n, k = 3, tag = '') => ({ n, blocos: [`Title ${n}${tag}`, ...Array.from({ length: k - 1 }, (_, i) => `Line ${n}.${i + 1}${tag} is here.`)] });
const pkgOf = (parts, extra = {}) => JSON.stringify({ kind: PACKAGE_KIND, formato: 1, conjunto: { id: 'ACT-001', titulo: 'Curso — Atividades', ...extra.conjunto },
  partes: parts.map(([parte, nq, tag = '', v = '1']) => ({ id: `ACT-001-P0${parte}`, parte, titulo: `Parte ${parte}`, versao: v, questoes: Array.from({ length: nq }, (_, i) => Q(i + 1, 3, `${tag}p${parte}`)), ...extra.parte })), ...extra.raiz });
const data = () => ({ v: 1, activities: {}, last: null });
const fill = (act, n, pt = 'Resposta') => { const q = act.questions.find((x) => x.n === n); act.answers[n] = q.blocks.map((_, i) => `${pt} ${n}.${i}`); finishQuestion(act, n, 5); };

test('formato oficial: lê conjunto e partes, ordena, e recusa arquivo inválido com mensagens compreensíveis', () => {
  const p = readPackage(pkgOf([[2, 2], [1, 3]]));
  assert.deepEqual(p.errors, []);
  assert.equal(p.set, 'ACT-001');
  assert.deepEqual(p.parts.map((x) => [x.code, x.part, x.questions.length]), [['ACT-001-P01', 1, 3], ['ACT-001-P02', 2, 2]]);
  assert.equal(readPackage('não é json'), null);
  assert.equal(readPackage(JSON.stringify({ kind: 'outra-coisa' })), null, 'outro JSON não é tratado como arquivo de estudo');
  const bad = JSON.parse(pkgOf([[1, 2]]));
  bad.formato = 2; bad.conjunto.id = 'xyz'; bad.partes[0].questoes[1].n = 5; bad.partes[0].questoes[0].blocos = ['ok', ''];
  const r = readPackage(JSON.stringify(bad));
  assert.ok(r.errors.length >= 4, r.errors.join(' | '));
  assert.ok(r.errors.some((e) => /Formato 2/.test(e)) && r.errors.some((e) => /conjunto/.test(e)) && r.errors.some((e) => /fora de ordem/.test(e)) && r.errors.some((e) => /vazios/.test(e)));
  const dup = JSON.parse(pkgOf([[1, 1], [1, 1]]));
  assert.ok(readPackage(JSON.stringify(dup)).errors.some((e) => /mais de uma vez/.test(e)));
  const wrongId = JSON.parse(pkgOf([[1, 1]])); wrongId.partes[0].id = 'ACT-002-P01';
  assert.ok(readPackage(JSON.stringify(wrongId)).errors.some((e) => /não confere com o conjunto/.test(e)));
});

test('campos desconhecidos (fonte, autor, de-para…) são ignorados: não entram na atividade nem na exportação', () => {
  const raw = pkgOf([[1, 2]], { raiz: { fonte: 'NOME-DA-FONTE', dePara: { 'ACT-001': 'X' } }, parte: { autor: 'NOME-DO-AUTOR', origem: 'curso-x' }, conjunto: { instituicao: 'INST' } });
  const d = data();
  applyPackage(d, planPackage(d, readPackage(raw)), 1);
  const act = d.activities['ACT-001-P01'];
  const all = JSON.stringify(act) + exportReport(act, 2).text + JSON.stringify(exportReport(act, 2).json);
  for (const w of ['NOME-DA-FONTE', 'NOME-DO-AUTOR', 'curso-x', 'INST', 'dePara']) assert.ok(!all.includes(w), w);
});

test('importar: partes novas com IDs estáveis e únicos; o mesmo arquivo de novo não duplica nada', () => {
  const d = data();
  const pkg = readPackage(pkgOf([[1, 3], [2, 2], [3, 2], [4, 21]]));
  const plan = planPackage(d, pkg);
  assert.deepEqual(plan.map((x) => x.kind), ['new', 'new', 'new', 'new']);
  const r = applyPackage(d, plan, 1);
  assert.deepEqual(r.added, ['ACT-001-P01', 'ACT-001-P02', 'ACT-001-P03', 'ACT-001-P04']);
  assert.equal(new Set(Object.keys(d.activities)).size, 4);
  assert.deepEqual(catalogOrder(Object.values(d.activities)).map((a) => a.part), [1, 2, 3, 4]);
  assert.equal(d.activities['ACT-001-P04'].questions.length, 21);
  fill(d.activities['ACT-001-P01'], 1);
  const again = planPackage(d, pkg);
  assert.deepEqual(again.map((x) => x.kind), ['same', 'same', 'same', 'same']);
  applyPackage(d, again, 2);
  assert.equal(Object.keys(d.activities).length, 4, 'nenhuma cópia');
  assert.equal(d.activities['ACT-001-P01'].answers[1][0], 'Resposta 1.0', 'respostas intactas');
});

test('adoção: atividade que já estava no aparelho (importada antes, sem código) entra no catálogo com respostas, correções e progresso intactos', () => {
  const d = data();
  const pkg = readPackage(pkgOf([[1, 3]]));
  // a mesma Parte 1, importada antes como texto (QUESTION n), já respondida e com correção do professor gravada
  const txt = ['ATIVIDADE ANTIGA', ...pkg.parts[0].questions.flatMap((q) => [`QUESTION ${q.n}`, ...q.blocks])].join('\n');
  const old = newActivity(parseActivity(txt), 1);
  d.activities[old.id] = old;
  fill(old, 1); fill(old, 2);
  applyTeacherAnswers(old, { questions: [{ n: 2, answers: old.questions[1].blocks.map((_, i) => `Professor ${i}`) }] }, 3);
  old.pos = { q: 2, b: 1 };
  const before = JSON.stringify({ q: old.questions, a: old.answers, d: old.done, s: old.submitted, t: old.teacher, p: old.pos });
  const plan = planPackage(d, pkg);
  assert.equal(plan[0].kind, 'adopt');
  applyPackage(d, plan, 4);
  assert.equal(Object.keys(d.activities).length, 1, 'não cria outra atividade');
  const a = d.activities[old.id];
  assert.equal(a.code, 'ACT-001-P01');
  assert.equal(a.part, 1);
  assert.equal(JSON.stringify({ q: a.questions, a: a.answers, d: a.done, s: a.submitted, t: a.teacher, p: a.pos }), before);
  assert.ok(isValidated(a, 2) && officialAnswers(a, 2)[0] === 'Professor 0', 'dados do professor preservados para uso interno');
});

test('atualização controlada: versão diferente guarda a anterior inteira e leva as respostas dos trechos que não mudaram', () => {
  const d = data();
  applyPackage(d, planPackage(d, readPackage(pkgOf([[1, 3]]))), 1);
  const act = d.activities['ACT-001-P01'];
  fill(act, 1); fill(act, 2); fill(act, 3);
  applyTeacherAnswers(act, { questions: [{ n: 1, answers: ['P0', 'P1', 'P2'] }] }, 2);
  const v1 = JSON.parse(JSON.stringify(act));
  // versão 2: questão 2 muda um bloco; questão 4 nova
  const raw = JSON.parse(pkgOf([[1, 4, '', '2']]));
  raw.partes[0].questoes = [...v1.questions.map((q) => ({ n: q.n, blocos: q.blocks.slice() })), Q(4, 2, 'novo')];
  raw.partes[0].questoes[1].blocos[2] = 'A changed line.';
  const plan = planPackage(d, readPackage(JSON.stringify(raw)));
  assert.equal(plan[0].kind, 'update');
  const r = applyPackage(d, plan, 9);
  assert.deepEqual(r.updated[0], { code: 'ACT-001-P01', kept: 2, changed: 1, added: 1, removed: 0, carried: 3 + 2 + 3 });
  assert.equal(act.version, '2');
  assert.equal(act.archive.length, 1, 'versão anterior guardada');
  assert.deepEqual(act.archive[0].answers, v1.answers);
  assert.deepEqual(act.archive[0].questions, v1.questions);
  assert.deepEqual(act.answers[2], [v1.answers[2][0], v1.answers[2][1], ''], 'bloco alterado fica sem resposta (a antiga está no histórico)');
  assert.ok(!act.done[2], 'questão alterada volta a ficar em aberto');
  assert.ok(act.done[1] && act.done[3]);
  assert.ok(isValidated(act, 1), 'questão idêntica mantém os dados do professor');
  assert.equal(act.questions.length, 4);
});

test('atividade do aparelho com pequenas diferenças (≥ 50% igual) é atualizada, não duplicada; conteúdo de outra parte não é tocado', () => {
  const d = data();
  const pkg = readPackage(pkgOf([[1, 3]]));
  const txt = ['ANTIGA', ...pkg.parts[0].questions.flatMap((q) => [`QUESTION ${q.n}`, ...q.blocks.map((b, i) => (q.n === 3 && i === 2 ? 'Different text.' : b))])].join('\n');
  const old = newActivity(parseActivity(txt), 1);
  d.activities[old.id] = old;
  fill(old, 1);
  const plan = planPackage(d, pkg);
  assert.equal(plan[0].kind, 'update');
  assert.ok(plan[0].adopt);
  applyPackage(d, plan, 2);
  assert.equal(Object.keys(d.activities).length, 1);
  assert.equal(d.activities[old.id].code, 'ACT-001-P01');
  assert.equal(d.activities[old.id].answers[1][0], 'Resposta 1.0');
  // conflito: o conteúdo da P02 do arquivo já pertence à P01 catalogada → nada é feito
  const clash = JSON.parse(pkgOf([[2, 1]]));
  clash.partes[0].questoes = d.activities[old.id].questions.map((q) => ({ n: q.n, blocos: q.blocks.slice() }));
  const p2 = planPackage(d, readPackage(JSON.stringify(clash)));
  assert.equal(p2[0].kind, 'conflict');
  assert.deepEqual(applyPackage(d, p2, 3).skipped, ['ACT-001-P02']);
  assert.equal(Object.keys(d.activities).length, 1);
});

test('progressão: Parte 1 livre; a seguinte abre só quando todas as questões da anterior estão concluídas', () => {
  const d = data();
  applyPackage(d, planPackage(d, readPackage(pkgOf([[1, 2], [2, 1], [4, 1]]))), 1);
  const all = () => Object.values(d.activities);
  const [p1, p2, p4] = ['ACT-001-P01', 'ACT-001-P02', 'ACT-001-P04'].map((c) => d.activities[c]);
  assert.equal(partLock(p1, all()), null);
  assert.match(partLock(p2, all()).reason, /Conclua todas as questões da Parte 1/);
  fill(p1, 1);
  assert.ok(partLock(p2, all()), 'uma questão só não basta');
  fill(p1, 2);
  assert.equal(partLock(p2, all()), null);
  assert.match(partLock(p4, all()).reason, /Adicione a Parte 3/);
  const loose = newActivity(parseActivity('SOLTA\nQUESTION 1\nHello.\n'), 1);
  assert.equal(partLock(loose, [...all(), loose]), null, 'atividade sem conjunto nunca é bloqueada (sem regressão)');
  assert.equal(summary(p2).complete, false, 'atividade nova, não validada, disponível para estudo');
});

test('exportação: completa, parcial (avisa o que falta) e vazia; texto legível na ordem original; JSON complementar; nada muda', () => {
  const d = data();
  applyPackage(d, planPackage(d, readPackage(pkgOf([[1, 3]]))), 1);
  const act = d.activities['ACT-001-P01'];
  const empty = exportReport(act, Date.UTC(2026, 10, 10, 15));
  assert.equal(empty.complete, false);
  assert.match(empty.text, /CONTÉM RESPOSTAS INCOMPLETAS \(0 de 3/);
  assert.match(empty.text, /Questão 1 \(sem resposta\)/);
  fill(act, 1);
  act.answers[2] = ['Só o título', '', ''];
  const before = JSON.stringify(act);
  const part = exportReport(act, Date.UTC(2026, 10, 10, 15));
  assert.equal(JSON.stringify(act), before, 'exportar não altera a atividade');
  assert.match(part.text, /^Curso — Atividades\nAtividade: ACT-001-P01 · Parte 1 · versão 1\nExportado em: /);
  assert.match(part.text, /Faltam: Questão 2 \(blocos 2, 3\); Questão 3 \(sem resposta\)/);
  const order = [...part.text.matchAll(/^QUESTÃO (\d+)$/gm)].map((m) => +m[1]);
  assert.deepEqual(order, [1, 2, 3]);
  assert.match(part.text, /QUESTÃO 1\nTitle 1p1\nResposta 1\.0\nLine 1\.1p1 is here\.\nResposta 1\.1/);
  assert.deepEqual(part.json.atividade, { id: 'ACT-001-P01', parte: 1, titulo: 'Parte 1', versao: '1' });
  assert.equal(part.json.exportadoEm, '2026-11-10T15:00:00.000Z');
  assert.deepEqual(part.json.questoes[1].blocos.map((b) => b.preenchido), [true, false, false]);
  assert.ok(!/teacher|professor|validad/i.test(JSON.stringify(part.json)) && !/professor|validad/i.test(part.text), 'sem dados de validação');
  fill(act, 2); fill(act, 3);
  const full = exportReport(act);
  assert.equal(full.complete, true);
  assert.match(full.text, /Situação: completa \(3 de 3/);
  assert.equal(exportReport(act).text.split('QUESTÃO 1')[1], exportText(act).split('QUESTÃO 1')[1], 'o corpo é o mesmo formato da plataforma');
  assert.equal(contentKey(act), contentKey(JSON.parse(before)), 'conteúdo intacto');
});
