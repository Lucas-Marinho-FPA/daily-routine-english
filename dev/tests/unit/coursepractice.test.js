// Curso — Atividades → Praticar (engine/coursepractice.js): extração de vocabulário, questões com resposta verificável,
// significado só confirmado (professor ou glossário do app), equivalentes aceitos, ausência de dados, progresso isolado
// e retomada, tradução reversa só com respostas validadas pelo professor. Conteúdo SINTÉTICO (o material do curso não
// é versionado).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setGlossary } from '../../app/js/engine/glossary.js';
import { parseActivity, newActivity, exportText, officialAnswers, checkTranslation } from '../../app/js/engine/course.js';
import {
  extractItems, teacherConfirmed, candidates, makeExercise, splitKey, checkMeaning, checkCloze, checkReverse, locateIn,
  emptyProgress, validProgress, actProgress, record, buildQueue, startSession, sessionOpen, sessionErrors, practiceSummary,
  PRACTICE_KEY, disjoint,
} from '../../app/js/engine/coursepractice.js';

setGlossary(JSON.parse(gunzipSync(readFileSync(new URL('../../app/data/glossary-en-pt.json.gz', import.meta.url)))));

const SRC = `SYNTHETIC PRACTICE — PART 1
QUESTION 1
Answering the Phone
Good morning, could you hold on a moment, please?
I'm afraid she is in a meeting. Can I take a message?
QUESTION 2
Checking In
I booked a room for two nights.
The flight was late, so we arrived at the hotel after midnight.
Please call me back when you get this message.
`;
const TEACHER_Q2 = ['Fazendo o check-in', 'Reservei um quarto para duas noites.', 'O voo atrasou, então chegamos ao hotel depois da meia-noite.', 'Por favor, me ligue de volta quando receber esta mensagem.'];
const fresh = () => newActivity(parseActivity(SRC), 1);
const validate = (act, n, blocks) => { act.answers[n] = blocks.slice(); act.done[n] = 2; act.teacher[n] = { blocks: blocks.slice(), validatedAt: 3 }; };
const seq = (...v) => { let i = 0; return () => v[i++ % v.length]; };

test('extração: vocabulário e expressões do original, com origem (questão e bloco)', () => {
  const items = extractItems(fresh());
  const by = (id) => items.find((i) => i.id === id);
  for (const id of ['u:hold on', 'u:take a message', "u:i'm afraid", 'u:booked', 'u:flight']) assert.ok(by(id), id);
  assert.equal(by('u:take a message').kind, 'expr');
  assert.deepEqual(by('u:take a message').src.map(({ q, b }) => ({ q, b })), [{ q: 1, b: 2 }]);
  assert.deepEqual(by('u:take a message').src[0].surface, ['take', 'a', 'message']);
  assert.ok(!items.some((i) => i.id === 'u:could' || i.id === 'u:the'), 'palavras gramaticais e modais ficam de fora');
});

test('significado só confirmado: glossário do app ou versão validada pelo professor — nunca o FreeDict sozinho', () => {
  const act = fresh();
  let items = extractItems(act, teacherConfirmed([act]));
  const by = (id) => items.find((i) => i.id === id);
  assert.equal(by('u:take a message').via, 'app');
  assert.ok(by('u:take a message').meanings.includes('anotar recado'));
  assert.equal(by('u:booked').reliable, false, '“booked” → “livro” (FreeDict) não é confirmado');
  assert.equal(by('u:back').reliable, false);
  validate(act, 2, TEACHER_Q2);
  items = extractItems(act, teacherConfirmed([act]));
  assert.equal(by('u:booked').via, 'professor');
  assert.deepEqual(by('u:booked').meanings, ['reservar'], 'só o sentido que aparece na versão do professor');
  assert.equal(by('u:back').reliable, false, 'o professor escreveu “de volta”, não “costas”');
  // confirmação vinda de OUTRA atividade validada do aparelho
  const other = newActivity(parseActivity('OTHER\nQUESTION 1\nWe booked a table.\n'), 1);
  validate(other, 1, ['Reservamos uma mesa.']);
  const fromOther = extractItems(fresh(), teacherConfirmed([other])).find((i) => i.id === 'u:booked');
  assert.deepEqual(fromOther.meanings, ['reservar']);
});

test('questões geradas têm resposta verificável; múltipla escolha só com alternativas de sentido disjunto', () => {
  const act = fresh();
  validate(act, 2, TEACHER_Q2);
  const items = extractItems(act, teacherConfirmed([act]));
  const cand = candidates(act, items);
  assert.ok(cand.counts.mean >= 5 && cand.counts.cloze >= 5 && cand.counts.write >= 5, JSON.stringify(cand.counts));
  for (const key of cand.keys) {
    for (const r of [Math.random, seq(0.1, 0.9, 0.5)]) {
      const ex = makeExercise(act, cand, key, r);
      assert.ok(ex, `${key} sem exercício`);
      if (ex.options) {
        assert.equal(ex.options.filter((o) => o.correct).length, 1, key);
        assert.equal(new Set(ex.options.map((o) => o.text)).size, ex.options.length, `${key}: alternativas repetidas`);
        assert.ok(ex.options.length >= 3, key);
      }
      if (ex.skill === 'mean' || ex.skill === 'recall') {
        const others = cand.items.filter((i) => ex.options.some((o) => !o.correct && (o.text === i.en || o.text === i.meanings.slice(0, 2).join(' / '))));
        for (const o of others) assert.ok(disjoint(ex.item, o), `${key}: ${o.en} não é disjunta`);
      }
      if (ex.skill === 'cloze') assert.equal(`${ex.before}${ex.answer}${ex.after}`, act.questions.find((q) => q.n === ex.src.q).blocks[ex.src.b], 'o gabarito é o trecho do original');
      if (ex.skill === 'lisItem' || ex.skill === 'lisBlock') assert.ok(ex.options.some((o) => o.correct && o.text === ex.text));
    }
  }
  // significado de item não confirmado nunca vira questão
  assert.ok(!cand.keys.includes('mean|u:back') && !cand.keys.includes('write|u:back'));
  // “is in” foi casado pela forma-base com a chave “be in” (outra expressão): sem confirmação, não vira “completar”
  assert.ok(!cand.keys.includes('cloze|u:be in'));
});

test('ausência de dados: atividade sem vocabulário confirmado ou curta demais não gera questões sem gabarito', () => {
  const tiny = newActivity(parseActivity('TINY\nQUESTION 1\nZorblax.\n'), 1);
  const cand = candidates(tiny, extractItems(tiny));
  assert.deepEqual(cand.counts.mean || 0, 0);
  assert.deepEqual(cand.counts.lisBlock || 0, 0, 'escuta exige ao menos 3 frases distintas');
  assert.deepEqual(cand.counts.rev || 0, 0);
  assert.deepEqual(buildQueue(cand, actProgress(emptyProgress(), tiny.id), 'vocab'), []);
  assert.equal(makeExercise(tiny, cand, 'mean|u:inexistente'), null);
  assert.equal(locateIn('Hello there.', ['goodbye']), null);
});

test('equivalentes aceitos; sentido do glossário não confirmado não conta como erro', () => {
  const act = fresh();
  validate(act, 2, TEACHER_Q2);
  const items = extractItems(act, teacherConfirmed([act]));
  const by = (id) => items.find((i) => i.id === id);
  assert.equal(checkMeaning(by('u:hold on'), 'espere').result, 'good');
  assert.equal(checkMeaning(by('u:hold on'), 'Aguardar um pouco').result, 'good');
  assert.equal(checkMeaning(by('u:take a message'), 'deixar recado').result, 'good');
  assert.equal(checkMeaning(by('u:booked'), 'reservei').result, 'good');
  assert.equal(checkMeaning(by('u:booked'), 'livro').result, 'unverified', 'sentido do glossário fora de contexto: sem evidência');
  assert.equal(checkMeaning(by('u:booked'), 'comer').result, 'bad');
  assert.equal(checkMeaning(by('u:booked'), '   ').result, 'empty');
  assert.equal(checkCloze('take a message', 'Take a message').result, 'good');
  assert.equal(checkCloze('booked', 'book').result, 'ok', 'mesma forma-base, outra flexão');
  assert.equal(checkCloze('booked', 'reserved').result, 'bad');
  assert.equal(checkReverse('I booked a room for two nights.', 'i booked a room for two nights').result, 'good');
  assert.equal(checkReverse('I booked a room for two nights.', 'I book a room for two night').result, 'ok');
  assert.equal(checkReverse('I booked a room for two nights.', 'Hello there, my friend').result, 'bad');
  assert.equal(checkReverse('I booked a room for two nights.', 'I reserved a room for two nights').result, 'unverified', 'paráfrase possível: não reprova');
});

test('tradução reversa: só questões validadas pelo professor; Parte sem validação (ex.: Parte 4) não gera gabarito', () => {
  const act = fresh();
  // aluno respondeu tudo e há avaliação automática, mas o professor não validou nada
  act.answers[1] = ['Atendendo o telefone', 'Bom dia, pode aguardar um momento, por favor?', 'Infelizmente ela está em reunião. Posso anotar o recado?'];
  act.done[1] = 2;
  act.teacher[1] = { blocks: act.answers[1].slice(), validatedAt: null }; // correção em andamento, NÃO validada
  let cand = candidates(act, extractItems(act, teacherConfirmed([act])));
  assert.equal(cand.counts.rev || 0, 0, 'resposta do aluno ou correção não validada nunca vira gabarito');
  assert.ok(cand.counts.lisBlock > 0 && cand.counts.spkBlock > 0, 'práticas baseadas no inglês original continuam disponíveis');
  validate(act, 2, TEACHER_Q2);
  cand = candidates(act, extractItems(act, teacherConfirmed([act])));
  const revs = cand.keys.filter((k) => splitKey(k)[0] === 'rev');
  assert.equal(revs.length, 4);
  for (const k of revs) {
    const ex = makeExercise(act, cand, k);
    assert.equal(ex.src.q, 2);
    assert.equal(ex.pt, TEACHER_Q2[ex.src.b], 'enunciado = versão validada pelo professor');
    assert.equal(ex.answer, act.questions[1].blocks[ex.src.b], 'gabarito = inglês original');
  }
  // desfazer a validação (“Editar a correção”) tira a questão da tradução reversa
  act.teacher[2].validatedAt = null;
  cand = candidates(act, extractItems(act, teacherConfirmed([act])));
  assert.equal(cand.counts.rev || 0, 0);
});

test('a prática não altera a atividade (respostas, validação, exportação e avaliação automática)', () => {
  const act = fresh();
  validate(act, 1, ['Atendendo o telefone', 'Bom dia, pode aguardar um momento, por favor?', 'Infelizmente ela está em reunião. Posso anotar o recado?']);
  validate(act, 2, TEACHER_Q2);
  const before = JSON.stringify(act);
  const exp = exportText(act);
  const chk = checkTranslation(act.questions[0].blocks[2], act.answers[1][2]);
  const cand = candidates(act, extractItems(act, teacherConfirmed([act])));
  for (const k of cand.keys) makeExercise(act, cand, k);
  const p = emptyProgress();
  for (const k of cand.keys.slice(0, 5)) record(p, act.id, k, 'bad');
  assert.equal(JSON.stringify(act), before);
  assert.equal(exportText(act), exp);
  assert.deepEqual(officialAnswers(act, 2), TEACHER_Q2);
  assert.deepEqual(checkTranslation(act.questions[0].blocks[2], act.answers[1][2]), chk);
});

test('progresso isolado por atividade, em registro próprio; retomada da sessão e repetição dos erros', () => {
  assert.equal(PRACTICE_KEY, 'course-practice', 'separado de kv “course” (tradução) e kv “state” (jornadas)');
  const a = fresh();
  const b = newActivity(parseActivity(SRC.replace('PART 1', 'PART 2').replace('two nights', 'three nights')), 1);
  assert.notEqual(a.id, b.id);
  const p = emptyProgress();
  const cand = candidates(a, extractItems(a));
  const ap = actProgress(p, a.id);
  const keys = buildQueue(cand, ap, 'vocab', { size: 4, rand: seq(0.3) });
  assert.equal(keys.length, 4);
  startSession(ap, 'vocab', keys, 10);
  record(p, a.id, keys[0], 'good'); ap.session.results[keys[0]] = 'good'; ap.session.i = 1;
  record(p, a.id, keys[1], 'bad'); ap.session.results[keys[1]] = 'bad'; ap.session.i = 2;
  record(p, a.id, keys[2], 'unverified'); ap.session.results[keys[2]] = 'unverified';
  assert.equal(actProgress(p, b.id).stats.attempts, 0, 'outra atividade não é afetada');
  assert.deepEqual(ap.stats, { attempts: 3, good: 1, ok: 0, bad: 1, unverified: 1 });
  assert.equal(ap.cards[keys[2]].reps, 0, '“sem evidência” não mexe na repetição espaçada');
  assert.equal(ap.cards[keys[2]].unverified, 1);
  // gravado e lido de novo (como no IndexedDB): a sessão continua de onde parou
  const reopened = validProgress(JSON.parse(JSON.stringify(p)));
  const ap2 = actProgress(reopened, a.id);
  assert.ok(sessionOpen(ap2));
  assert.equal(ap2.session.keys[ap2.session.i], keys[2]);
  assert.deepEqual(sessionErrors(ap2.session), [keys[1]]);
  // modo “Repetir erros”: só o que teve erro na última tentativa
  assert.deepEqual(buildQueue(cand, ap2, 'errors'), [keys[1]]);
  record(reopened, a.id, keys[1], 'good');
  assert.deepEqual(buildQueue(cand, ap2, 'errors'), []);
  const sum = practiceSummary(ap2, cand);
  assert.equal(sum.practised, 3);
  assert.equal(sum.errors, 0);
  assert.deepEqual(validProgress({ v: 99 }), emptyProgress(), 'registro inválido não quebra a prática');
});
