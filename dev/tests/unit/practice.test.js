// Ciclo de prática do Speaking Lab: lista automática “Vamos praticar”, portão da tentativa mais recente
// e lista de revisão. Transcrições escritas à mão (controladas), com casos observados no modelo local.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evaluateWords, wordsOf, wordAudioText } from '../../app/js/engine/wordfeedback.js';
import { analyseAttempt, practiceSummary, practiceReason, latestGate } from '../../app/js/engine/practice.js';
import { updatePracticeWords, forgetRecording, freshState } from '../../app/js/engine/progress.js';
import { audioKey } from '../../app/js/engine/text.js';

const S = 'I brush my teeth again and play one or two quick chess games before my break ends.';
const attemptFor = (text, heard) => analyseAttempt(evaluateWords(text, { text: heard, confidence: 0 }), text);
const words = (a) => a.list.map((x) => x.text);

test('palavra reconhecida não vira pendência; leitura correta → lista vazia e resumo positivo', () => {
  const a = attemptFor(S, S);
  assert.deepEqual(a.list, []);
  assert.ok(a.conclusive);
  assert.equal(practiceSummary(a.list), 'Nenhuma palavra pendente nesta tentativa.');
});

test('palavra substituída é sinalizada com o que foi ouvido (chess → chest), sem rótulo fonético', () => {
  const a = attemptFor(S, 'I brush my teeth again and play one or two quick chest games before my break ends.');
  assert.deepEqual(words(a), ['chess']);
  assert.equal(a.list[0].kind, 'substituted');
  assert.equal(practiceReason(a.list[0]), 'o app ouviu “chest”');
  assert.doesNotMatch(practiceReason(a.list[0]), /vogal|consoante|fonema|tônica/i);
  assert.equal(practiceSummary(a.list), 'Vamos praticar 1 palavra.');
});

test('palavra omitida é sinalizada como “não foi reconhecida”; várias palavras → resumo no plural', () => {
  const t = 'At noon, I have lunch at home and spend fifteen minutes on my notes.';
  const a = attemptFor(t, 'At noon I have lunch at home and spend fifty minutes on my.');
  assert.deepEqual(words(a), ['fifteen', 'notes']);
  assert.equal(a.list.find((x) => x.text === 'notes').kind, 'missing');
  assert.equal(practiceReason(a.list.find((x) => x.text === 'notes')), 'não foi reconhecida');
  assert.equal(practiceSummary(a.list), 'Vamos praticar 2 palavras.');
});

test('diferenças irrelevantes (pontuação, maiúsculas, horário, flexão, composto, nome próprio) não criam pendências', () => {
  assert.deepEqual(words(attemptFor('I finish work at 6:00 p.m. and drive home.', 'i finish work at 6pm, and drive home')), []);
  assert.deepEqual(words(attemptFor('I walk to the office.', 'I walked to the office')), []);
  assert.deepEqual(words(attemptFor('I put my lunch box in the fridge.', 'I put my lunchbox in the fridge.')), []);
  assert.deepEqual(words(attemptFor('I drive for Uber on my way to work.', 'I drive for you, but on my way to work.')), []);
});

test('tentativa inconclusiva (sem reconhecimento, silêncio, transcrição degenerada) não gera lista nem rótulo de erro', () => {
  assert.equal(analyseAttempt(evaluateWords(S, null), S).conclusive, false);
  assert.equal(analyseAttempt(evaluateWords(S, { text: S, confidence: 0.9 }, { insufficient: true }), S).list.length, 0);
  const deg = analyseAttempt(evaluateWords(S, { text: 'I brush 0 0 0 0 0 0 0 0', confidence: 0 }), S);
  assert.equal(deg.conclusive, false);
  assert.deepEqual(deg.list, []);
});

test('palavra repetida na frase aparece uma vez; se falhou em algum ponto, continua pendente', () => {
  const t = 'I brush my teeth and then I brush my teeth again.';
  const a = attemptFor(t, 'I brush my teeth and then I brush my tits again.');
  assert.deepEqual(words(a), ['teeth']);
  assert.ok(!a.goodKeys.includes('teeth'));
});

test('cada palavra da lista tem áudio isolado embutido (mesma voz britânica das frases)', () => {
  globalThis.window = globalThis;
  eval(readFileSync(new URL('../../app/data/audio-index.js', import.meta.url), 'utf8'));
  const files = globalThis.DRG_AUDIO.files;
  const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
  const missing = [];
  for (const s of Object.values(content.sentences)) for (const seg of wordsOf(s.en)) if (!seg.weak && !files[audioKey(wordAudioText(seg))]) missing.push(seg.text);
  assert.deepEqual(missing, []);
  const a = attemptFor(S, 'I brush my teeth again and play one or two quick chest games before my break ends.');
  assert.ok(files[audioKey(a.list[0].audioText)], 'áudio de “chess”');
});

test('portão da tentativa mais recente: resultado atrasado é descartado', () => {
  const g = latestGate();
  const t1 = g.next();
  const t2 = g.next(); // nova gravação começou antes de t1 terminar
  assert.equal(g.isCurrent(t1), false);
  assert.equal(g.isCurrent(t2), true);
  g.invalidate(); // saiu da tela / excluiu a gravação
  assert.equal(g.isCurrent(t2), false);
});

test('lista de revisão: entra automaticamente; só sai após 2 tentativas favoráveis seguidas; marcação manual é preservada', () => {
  const st = freshState(1);
  const bad = attemptFor(S, 'I brush my teeth again and play one or two quick chest games before my break ends.');
  const good = attemptFor(S, S);
  st.difficultWords = { games: { at: 1, from: 'x' } }; // marcada à mão
  updatePracticeWords(st, 'sent:A', bad);
  assert.equal(st.difficultWords.chess.auto, true);
  updatePracticeWords(st, 'sent:A', good);
  assert.ok(st.difficultWords.chess, 'uma transcrição favorável não basta');
  updatePracticeWords(st, 'sent:A', bad); // falhou de novo: zera a sequência
  updatePracticeWords(st, 'sent:A', good);
  assert.ok(st.difficultWords.chess);
  updatePracticeWords(st, 'sent:A', good);
  assert.equal(st.difficultWords.chess, undefined, 'saiu após 2 acertos seguidos');
  assert.ok(st.difficultWords.games, 'marcação manual não é removida');
  updatePracticeWords(st, 'sent:A', analyseAttempt(evaluateWords(S, null), S)); // inconclusiva: nada muda
  assert.deepEqual(Object.keys(st.difficultWords), ['games']);
});

test('excluir a gravação de um exercício não afeta os outros nem o progresso', () => {
  const st = freshState(1);
  st.xp = 50;
  st.recordingsMeta = { 'sent:A': { at: 1 }, 'sent:B': { at: 2 } };
  forgetRecording(st, 'sent:A');
  assert.deepEqual(Object.keys(st.recordingsMeta), ['sent:B']);
  assert.equal(st.xp, 50);
});
