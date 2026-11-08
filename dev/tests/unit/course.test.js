// Curso — Atividades (engine/course.js): importação sem alterar o texto, avanço sequencial, primeira versão enviada
// preservada, exportação só completa e checagem básica. Conteúdo sintético (o material do curso não é versionado).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseActivity, activityId, newActivity, answersOf, missingBlocks, isDone, summary, canOpen, finishQuestion,
  exportProblems, exportText, checkTranslation, questionCheck,
} from '../../app/js/engine/course.js';

const SRC = `MY ACTIVITY — PART 1
Notes for the implementer: ignored until the first question.

QUESTION 1
Meeting a Friend

“Hello, Anna. How are you?”
“I’m fine, thanks — and you?”
QUESTION 2
Numbers
There are 3 buses before 8 o’clock.
\r
QUESTION 3
Last One
I don’t know.
`;

const fill = (act, n, texts) => { act.answers[n] = texts.slice(); };

test('importa: título, questões em ordem, um bloco por linha (título incluído), sem alterar o texto', () => {
  const p = parseActivity(SRC);
  assert.deepEqual(p.errors, []);
  assert.equal(p.title, 'MY ACTIVITY — PART 1');
  assert.deepEqual(p.questions.map((q) => q.n), [1, 2, 3]);
  assert.deepEqual(p.questions[0].blocks, ['Meeting a Friend', '“Hello, Anna. How are you?”', '“I’m fine, thanks — and you?”']);
  assert.equal(p.questions[1].blocks[1], 'There are 3 buses before 8 o’clock.');
  assert.ok(!JSON.stringify(p).includes('implementer'), 'texto antes da 1ª questão é ignorado');
});

test('importação inválida informa o problema', () => {
  assert.ok(parseActivity('só um título').errors.length);
  assert.match(parseActivity('T\nQUESTION 1\nA\nQUESTION 3\nB').errors.join(' '), /fora de ordem/);
  assert.match(parseActivity('T\nQUESTION 1\nQUESTION 2\nB').errors.join(' '), /vazia/);
  assert.equal(parseActivity('T\nQUESTÃO 1\nA').questions.length, 1);
});

test('mesmo arquivo → mesma atividade (reimportar mantém respostas); conteúdo diferente → outra', () => {
  assert.equal(activityId(parseActivity(SRC)), activityId(parseActivity(SRC.replace(/\n/g, '\r\n'))));
  assert.notEqual(activityId(parseActivity(SRC)), activityId(parseActivity(SRC.replace('Anna', 'Ana'))));
});

test('navegação sequencial: a próxima abre só com a anterior concluída; questões concluídas continuam editáveis', () => {
  const act = newActivity(parseActivity(SRC), 1);
  assert.equal(canOpen(act, 1), true);
  assert.equal(canOpen(act, 2), false);
  fill(act, 1, ['Encontrando uma amiga', '“Oi, Anna. Como vai?”', '']);
  assert.deepEqual(finishQuestion(act, 1, 5), { ok: false, missing: [3] });
  assert.equal(canOpen(act, 2), false);
  fill(act, 1, ['Encontrando uma amiga', '“Oi, Anna. Como vai?”', '“Tudo bem, obrigada — e você?”']);
  assert.equal(finishQuestion(act, 1, 6).ok, true);
  assert.equal(canOpen(act, 2), true);
  assert.equal(canOpen(act, 3), false);
  // edição posterior: a versão atual muda; a primeira versão enviada fica preservada
  act.answers[1][1] = '“Olá, Anna. Como você está?”';
  assert.equal(finishQuestion(act, 1, 9).ok, true);
  assert.equal(act.submitted[1].blocks[1], '“Oi, Anna. Como vai?”');
  assert.equal(act.submitted[1].at, 6);
  assert.equal(act.submitted[1].check.length, 3);
  // apagar um bloco de uma questão concluída: deixa de contar como concluída até completar de novo
  act.answers[1][2] = ' ';
  assert.equal(isDone(act, 1), false);
  assert.deepEqual(missingBlocks(act, 1), [3]);
});

test('exportação só com todas concluídas; lista o que falta; formato QUESTÃO n + inglês + tradução, acentos preservados', () => {
  const act = newActivity(parseActivity(SRC), 1);
  fill(act, 1, ['Encontrando uma amiga', '“Oi, Anna. Como vai?”', '“Tudo bem, obrigada — e você?”']);
  finishQuestion(act, 1);
  fill(act, 2, ['Números', '']);
  assert.equal(exportText(act), null);
  assert.deepEqual(exportProblems(act), ['Questão 2: bloco 2 sem tradução', 'Questão 3: blocos 1, 2 sem tradução']);
  fill(act, 2, ['Números', 'Há 3 ônibus antes das 8 horas.']);
  fill(act, 3, ['A última', 'Eu não sei.']);
  assert.deepEqual(exportProblems(act), ['Questão 2: não foi finalizada', 'Questão 3: não foi finalizada']);
  finishQuestion(act, 2); finishQuestion(act, 3);
  assert.equal(summary(act).complete, true);
  assert.equal(exportText(act), [
    'QUESTÃO 1', 'Meeting a Friend', 'Encontrando uma amiga', '“Hello, Anna. How are you?”', '“Oi, Anna. Como vai?”',
    '“I’m fine, thanks — and you?”', '“Tudo bem, obrigada — e você?”', '',
    'QUESTÃO 2', 'Numbers', 'Números', 'There are 3 buses before 8 o’clock.', 'Há 3 ônibus antes das 8 horas.', '',
    'QUESTÃO 3', 'Last One', 'A última', 'I don’t know.', 'Eu não sei.', ''].join('\n'));
});

test('validação do professor é por questão e não muda a resposta enviada', () => {
  const act = newActivity(parseActivity(SRC), 1);
  fill(act, 1, ['Encontrando uma amiga', '“Oi, Anna. Como vai?”', '“Tudo bem, obrigada — e você?”']);
  finishQuestion(act, 1, 2);
  act.teacher[1] = { blocks: answersOf(act, 1), validatedAt: null };
  act.teacher[1].blocks[0] = 'Encontrando um amigo';
  act.teacher[1].validatedAt = 10;
  assert.equal(summary(act).validated, 1);
  assert.equal(act.answers[1][0], 'Encontrando uma amiga');
  assert.equal(act.submitted[1].blocks[0], 'Encontrando uma amiga');
  assert.equal(canOpen(act, 2), true, 'validação não é exigida para avançar');
});

test('checagem básica: níveis e motivos (orientação, não correção)', () => {
  assert.equal(checkTranslation('Hello.', '').level, 'empty');
  assert.equal(checkTranslation('Can I take a message?', 'Can I take a message?').level, 'attention');
  assert.equal(checkTranslation('“Hello, Anna. How are you?”', '“Oi, Anna. Como vai?”').level, 'ok');
  assert.equal(checkTranslation('There are 3 buses before 8 o’clock.', 'Há três ônibus antes das oito.').level, 'review');
  assert.match(checkTranslation('I don’t know the answer to that question.', 'Eu sei a resposta para essa pergunta.').notes.join(' '), /negação/);
  assert.match(checkTranslation('Where is it?', 'Onde fica.').notes.join(' '), /pergunta/);
  assert.match(checkTranslation('I am meeting Anna at the station later today.', 'Vou encontrar a moça na estação mais tarde hoje.').notes.join(' '), /Anna/);
  assert.equal(checkTranslation('There is another train at four o’clock in the afternoon.', 'Há outro.').level, 'attention');
  assert.equal(checkTranslation('Asking for and Giving Directions to the Cinema', 'Pedindo e dando informações para ir ao cinema').level, 'ok', 'título em Title Case não gera alerta de nome');
  const act = newActivity(parseActivity(SRC), 1);
  fill(act, 3, ['A última', 'I don’t know.']);
  assert.equal(questionCheck(act, 3), 'attention');
});
