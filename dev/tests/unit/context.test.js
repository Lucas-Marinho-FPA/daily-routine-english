// Bateria de regressão da avaliação contextual (casos A, B e C do relatório de testes no Galaxy S25+)
// e das regras de normalização e comparação. Determinística: transcrições e respostas escritas à mão.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createChecker } from '../../app/js/engine/checker.js';
import { setLexicon } from '../../app/js/engine/lexicon.js';
import { findDivergences, contextPool, soundsLike } from '../../app/js/engine/context.js';
import { analyseFreeAnswer, buildVocab } from '../../app/js/engine/freeanswer.js';

setLexicon(gunzipSync(readFileSync(new URL('../../app/data/lexicon.txt.gz', import.meta.url))).toString('utf8').split('\n'));
const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const ck = createChecker(content.language);
const pool = contextPool(content, ck);
const vocab = buildVocab(content);
const G = content.questions['G.Q01'];
const div = (t, model = G.a) => findDivergences(t, { checker: ck, pool, model });
const free = (t, q = G) => {
  const divergences = div(t, q.a);
  return analyseFreeAnswer({ question: q.q, model: q.a, transcript: t, analysis: { silent: false, speechSec: 10, totalSec: 11, pauses: 2, longPauses: 0 }, vocab, divergences, naturalness: ck.naturalness(t) });
};
const MODEL_B = 'At 5:30, I get ready to leave, open the Uber app and set my destination to my office.';
const spansOf = (text, spans, state) => spans.filter((s) => s.state === state).map((s) => text.slice(s.start, s.end));

// ---------- CASO A: reconhecimento incorreto em contexto conhecido (fala) ----------
const CASE_A = 'I wake up at around five a.m. I take a shower and brush my teeth after that. I sit on my Uber app and set this nation to the office.';

test('Caso A — “sit on my” e “this nation” sinalizados como POSSÍVEL erro de reconhecimento, com o trecho esperado', () => {
  const d = div(CASE_A);
  assert.deepEqual(d.map((x) => [x.heard, x.expected]), [['sit on my', 'open the'], ['this nation', 'my destination']]);
  assert.match(d[1].context, /set ___ to/);
  assert.match(d[1].ref.text, /set my destination/);
});

test('Caso A — a transcrição original é preservada; as hipóteses não substituem o texto', () => {
  const r = free(CASE_A);
  assert.equal(r.transcript, CASE_A);
  const flagged = r.words.filter((w) => w.state === 'needs_practice').map((w) => w.text);
  assert.deepEqual(flagged, ['sit', 'on', 'my', 'this', 'nation']);
  for (const w of r.words.filter((x) => x.flag === 'context')) {
    assert.match(w.reason, /Pode ter sido o reconhecimento ou a pronúncia/); // as duas hipóteses, sem atribuir ao aluno
    assert.match(w.reason, /ignore esta marca/);
    assert.doesNotMatch(w.reason, /pronunciou|pronúncia errada|vogal|consoante|fonema/i);
  }
  assert.ok(r.words.filter((w) => w.state === 'good').length > 15, 'o resto continua “Reconhecida”');
});

test('Caso A — a adequação da resposta continua independente da transcrição: responde, cita horário e desenvolve', () => {
  const r = free(CASE_A);
  assert.equal(r.status, 'answers');
  for (const id of ['topic', 'activities', 'time', 'length']) assert.ok(r.checklist.find((c) => c.id === id).ok, id);
  assert.equal(r.pronunciation.evaluated, false);
});

// ---------- CASO B: resposta escrita semanticamente válida ----------
test('Caso B — aceita “five thirty a.m.” e “the office”; nota de estilo clara; destaque só no lugar certo', () => {
  const ans = 'At five thirty a.m., I get ready to leave, open the Uber app and set my destination to the office.';
  const r = ck.check(ans, [MODEL_B]);
  assert.equal(r.cls, 'accepted_variant');
  assert.ok(r.accepted);
  assert.deepEqual(r.notes, ['Aceito. “the office” também está correto aqui; o modelo usa “my office”.']);
  // nada é marcado como faltando ou a mais; o “my” de “my destination” NÃO acende
  assert.deepEqual(spansOf(r.diff.targetText, r.diff.targetSpans, 'miss'), []);
  assert.deepEqual(spansOf(r.diff.answerText, r.diff.answerSpans, 'extra'), []);
  assert.deepEqual(spansOf(r.diff.targetText, r.diff.targetSpans, 'style'), ['my']);
  assert.equal(r.diff.targetSpans.filter((s) => s.state === 'style')[0].start, MODEL_B.lastIndexOf('my'));
  assert.deepEqual(spansOf(r.diff.answerText, r.diff.answerSpans, 'equiv'), ['five', 'thirty', 'a.m.']);
  assert.doesNotMatch(r.notes.join(' '), /@\d|erro|gramat/i, 'sem tokens internos nem erro inventado');
});

// ---------- CASO C: horário compreensível, mas pouco natural ----------
test('Caso C — “five and thirty a.m.” entendido como 5:30, aceito com UMA sugestão de naturalidade (sem erros artificiais)', () => {
  const r = ck.check('At five and thirty a.m., I get ready to leave, open the Uber app and set my destination to my office.', [MODEL_B]);
  assert.equal(r.cls, 'accepted_variant');
  assert.deepEqual(r.notes, ['Seu significado está claro (5:30). Uma forma mais natural é: “At five thirty a.m.”.']);
  assert.equal(r.diff, null, 'nenhuma palavra marcada');
  // na fala: a mesma dica aparece em “Gramática e naturalidade”, sem marcar palavras
  const f = free('At five and thirty a.m. I get ready to leave, open the Uber app and set my destination to my office.');
  assert.deepEqual(f.language.naturalness, ['Seu significado está claro (5:30). Uma forma mais natural é: “At five thirty a.m.”.']);
  assert.deepEqual(f.practice, []);
});

// ---------- normalização e comparação (itens 1–14) ----------
test('1 — horários equivalentes em número e por extenso', () => {
  const m = 'I leave home at 5:45 a.m.';
  for (const a of ['I leave home at five forty-five a.m.', 'I leave home at 5:45 in the morning.', 'I leave home at quarter to six a.m.', 'I leave home at five forty five am.', 'I leave home at 5:45am.']) {
    assert.ok(ck.check(a, [m]).accepted, a);
  }
  assert.ok(ck.check('I work until six p.m.', ['I work until 6:00 p.m.']).accepted);
  assert.ok(!ck.check('I leave home at 6:45 a.m.', [m]).accepted, 'outro horário não é equivalente');
});

test('3 — “my office” e “the office” aceitos quando o sentido se mantém; a troca é estilo, não gramática', () => {
  const r = ck.check('I park near the gym.', ['I park near my gym.']);
  assert.ok(r.accepted);
  assert.match(r.notes[0], /também está correto aqui/);
});

test('7 e 10 — palavra legítima fora do modelo e vocabulário diferente não viram suspeita de reconhecimento', () => {
  for (const t of ['I check my Uber app and set the destination to the office.', 'I use the Uber app and set the address to the office.', 'I get up early, eat toast and take the bus to my job.']) {
    assert.deepEqual(div(t), [], t);
    assert.deepEqual(free(t).practice, [], t);
  }
});

test('8 e 9 — resposta curta pertinente e resposta desenvolvida e coerente', () => {
  assert.equal(free('Usually at half past six.', content.questions['R01.Q1']).status, 'answers');
  const long = free('I wake up at five, take a shower and brush my teeth. Then I open the Uber app, set my destination to the office and accept rides on the way.');
  assert.equal(long.status, 'answers');
  assert.deepEqual(long.practice, []);
});

test('11 — erro gramatical real é distinguido de diferença de estilo', () => {
  const g = ck.check('At 5:30, I gets ready to leave, open the Uber app and set my destination to my office.', [MODEL_B]);
  assert.equal(g.cls, 'grammar');
  assert.ok(!g.accepted);
  assert.match(g.notes[0], /“gets”.*“get”/);
  const s = ck.check('At 5:30, I get ready to leave, open the Uber app and set my destination to the office.', [MODEL_B]);
  assert.ok(s.accepted);
  assert.equal(ck.check('My wife go to bed at ten.', ['My wife goes to bed at ten.']).cls, 'grammar');
});

test('12 — artigos, possessivos e preposições não são descartados na comparação', () => {
  const noArticle = ck.check('At 5:30, I get ready to leave, open the Uber app and set my destination to office.', [MODEL_B]);
  assert.equal(noArticle.cls, 'grammar');
  assert.deepEqual(spansOf(noArticle.diff.targetText, noArticle.diff.targetSpans, 'miss'), ['my']);
  assert.ok(!ck.check('At 5:30, I get ready to leave, open the Uber app and set my destination my office.', [MODEL_B]).accepted, 'falta “to”');
  assert.ok(!ck.check('At 5:30, I get ready to leave, open Uber app and set my destination to my office.', [MODEL_B]).accepted, 'falta “the”');
});

test('13 — transcrição inconclusiva: sem nota, sem marcações, sem afirmações', () => {
  for (const t of ['', 'I I I I I I I I', 'Five.']) {
    const r = free(t);
    assert.equal(r.status, 'inconclusive', t);
    assert.deepEqual(r.practice, []);
  }
  assert.deepEqual(div('I I I I'), []);
});

test('14 — palavras realmente ausentes ou trocadas: troca dentro de frase conhecida vira suspeita; omissão não vira acusação', () => {
  const swapped = div('I brush my teeth again and play one or two quick chest games before my break ends.');
  assert.deepEqual(swapped.map((d) => [d.heard, d.expected]), [['chest', 'chess']]);
  const missing = free('I take a shower and brush my and then I open the Uber app.');
  assert.ok(missing.words.every((w) => w.state !== 'needs_practice' || w.flag !== 'context' || w.text !== 'teeth'));
  assert.deepEqual(div('I take a shower and brush my and then I open the Uber app.'), [], 'omissão não é marcada como erro');
});

test('as próprias frases do app nunca geram suspeita (355 referências)', () => {
  const bad = pool.filter((r) => findDivergences(r.text, { checker: ck, pool }).length);
  assert.deepEqual(bad.map((r) => r.text), []);
});

test('transcrições REAIS do modelo (fala correta, 101 frases): só erros reais do reconhecedor são sinalizados', () => {
  const rows = JSON.parse(readFileSync(new URL('../fixtures/moonshine-transcripts.json', import.meta.url)));
  const flags = rows.flatMap((r) => findDivergences(r.heard, { checker: ck, pool }).map((d) => `${d.heard}→${d.expected}`));
  // cada um destes é um erro real do Moonshine na fala sintética (chess→chest, Uber→youber, “I deal”→“Ideal”)
  assert.deepEqual([...new Set(flags)].sort(), ['Ideal→deal', 'chest→chess', 'youber→Uber']);
});

test('critério de som parecido (só para suspeita)', () => {
  assert.ok(soundsLike('this nation', 'destination'));
  assert.ok(soundsLike('chest', 'chess'));
  assert.ok(!soundsLike('address', 'destination'));
  assert.ok(!soundsLike('check', 'open'));
});
