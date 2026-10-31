// Prática isolada de palavras: comparação lexical da tentativa e estado de prática da sessão (funções puras).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchIsolatedWord, wordPracticeSession } from '../../app/js/engine/practice.js';

const st = (t, h) => matchIsolatedWord(t, h).status;

test('acerto: a transcrição é a palavra-alvo', () => {
  assert.equal(st('While', 'while'), 'match');
  assert.equal(st('oats', 'oats'), 'match');
});

test('erro: outra palavra, mesmo parecida na escrita ou no som, não conta como acerto', () => {
  assert.equal(st('While', 'why are'), 'mismatch');
  assert.equal(st('fruit', 'fridge'), 'mismatch');
  assert.equal(st('oats', 'oat'), 'mismatch'); // sem tolerância de flexão na palavra isolada
  assert.equal(st('brother', 'bother'), 'mismatch'); // sem Levenshtein
  assert.equal(st('teeth', 'tits'), 'mismatch');
  assert.equal(st("Emma's", 'Emma'), 'mismatch');
});

test('vazio: silêncio, transcrição vazia ou só pontuação nunca é acerto', () => {
  for (const h of ['', '   ', null, undefined, '...', '?']) assert.equal(st('While', h), 'empty', String(h));
});

test('palavras extras: a palavra aparece junto com outras → inconclusivo', () => {
  assert.equal(st('oats', 'I eat oats'), 'extra');
  assert.equal(st('While', 'while while'), 'extra');
  assert.equal(st('fruit', 'fruit and oats'), 'extra');
  assert.equal(st('fruit', 'fridge and oats'), 'mismatch');
});

test('normalização: maiúsculas, pontuação periférica e formas equivalentes', () => {
  assert.equal(st('While', 'While.'), 'match');
  assert.equal(st('while', '“WHILE!”'), 'match');
  assert.equal(st('five', '5'), 'match');
  assert.equal(st('practise', 'practice'), 'match'); // grafia americana ↔ britânica
  assert.equal(st('lunchbox', 'lunch box'), 'match');
});

test('a transcrição original é preservada sem alteração', () => {
  assert.equal(matchIsolatedWord('While', '  Why are? ').heard, 'Why are?');
  assert.equal(matchIsolatedWord('While', 'While.').heard, 'While.');
});

const LIST = [{ key: 'while', text: 'While' }, { key: 'fruit', text: 'fruit' }, { key: 'oats', text: 'oats' }];
const M = (status) => ({ status, heard: '' });

test('repetir uma tentativa incorreta: continua “tente de novo” e conta as tentativas; o acerto conclui', () => {
  const s = wordPracticeSession();
  assert.equal(s.get('while').status, 'todo');
  s.start('while'); assert.equal(s.get('while').status, 'recording');
  s.processing('while'); assert.equal(s.get('while').status, 'processing');
  s.result('while', M('mismatch')); assert.equal(s.get('while').status, 'retry');
  s.start('while'); s.processing('while'); s.result('while', M('extra'));
  assert.deepEqual([s.get('while').status, s.get('while').tries], ['retry', 2]);
  s.start('while'); s.processing('while'); s.result('while', M('match'));
  assert.deepEqual([s.get('while').status, s.get('while').tries], ['done', 3]);
  // repetir uma palavra já reconhecida e errar não desfaz o acerto da sessão (o último resultado fica em `last`)
  s.start('while'); s.processing('while'); s.result('while', M('mismatch'));
  assert.deepEqual([s.get('while').status, s.get('while').last.status], ['done', 'mismatch']);
});

test('próxima palavra, voltar à anterior e conclusão (sem concluir a frase)', () => {
  const s = wordPracticeSession();
  assert.equal(s.next(LIST, 'while').key, 'fruit');
  s.start('while'); s.result('while', M('match'));
  assert.equal(s.next(LIST, 'while').key, 'fruit');
  assert.equal(s.next(LIST, 'oats').key, 'fruit'); // dá a volta e pula as concluídas
  s.start('fruit'); s.result('fruit', M('match'));
  assert.equal(s.get('while').status, 'done'); // voltar à anterior mantém o estado
  assert.equal(s.allDone(LIST), false);
  s.start('oats'); s.result('oats', M('match'));
  assert.equal(s.next(LIST, 'oats'), null);
  assert.equal(s.allDone(LIST), true);
  assert.equal(s.doneCount(LIST), 3);
});

test('falha do microfone ou do reconhecimento: volta ao estado anterior sem contar tentativa', () => {
  const s = wordPracticeSession();
  s.start('fruit'); s.abort('fruit');
  assert.deepEqual([s.get('fruit').status, s.get('fruit').tries], ['todo', 0]);
  s.start('fruit'); s.result('fruit', M('mismatch'));
  s.start('fruit'); s.processing('fruit'); s.abort('fruit');
  assert.deepEqual([s.get('fruit').status, s.get('fruit').tries], ['retry', 1]);
  s.start('fruit'); s.result('fruit', M('match'));
  s.start('fruit'); s.abort('fruit');
  assert.equal(s.get('fruit').status, 'done');
});

test('recorte da palavra isolada: só o trecho com voz, com margem de 0,15 s; sem voz, o áudio inteiro', async () => {
  const { speechBounds } = await import('../../app/js/audio/segment.js');
  const sr = 16000, pcm = new Float32Array(sr * 3); // 3 s: silêncio, voz de 0,6 s a 1,1 s, silêncio
  for (let i = Math.round(0.6 * sr); i < Math.round(1.1 * sr); i++) pcm[i] = 0.3 * Math.sin(i / 7);
  const b = speechBounds(pcm, sr);
  assert.ok(Math.abs(b.start / sr - 0.45) < 0.03 && Math.abs(b.end / sr - 1.25) < 0.03, JSON.stringify({ start: b.start / sr, end: b.end / sr }));
  assert.deepEqual(speechBounds(new Float32Array(sr), sr), { start: 0, end: sr });
});
