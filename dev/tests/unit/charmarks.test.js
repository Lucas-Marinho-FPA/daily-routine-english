// Marcação visual por trecho (vocabulário): alinhamento entre esperado e transcrição, a partir do avaliador real.
// Só apresentação: estado, nota e “Palavras a praticar” continuam do avaliador (conferido aqui também).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markWord, classifyWord } from '../../app/js/engine/charmarks.js';
import { evaluateSpeech } from '../../app/js/engine/dialogueeval.js';

/** Avalia como a fase 1 e devolve a expressão marcada: “team[s]” → 'team+ s-'; verde +, vermelho -, amarelo ?. */
function marks(expected, heard) {
  const r = evaluateSpeech(expected, { text: heard, engine: 'online' });
  const words = (r.feedback && r.feedback.words) || [];
  const sym = { good: '+', missing: '-', uncertain: '?' };
  const shown = r.status === 'passed' || r.status === 'needs_practice'
    ? words.map((w) => markWord(w.text, w).map((s) => `${s.text}${sym[s.mark]}`).join(' ')).join(' | ')
    : '(sem cores)';
  return { status: r.status, shown, toPractise: (r.feedback && r.feedback.toPractise) || [] };
}

test('palavra inteira correta: verde', () => {
  assert.equal(marks('teams', 'teams').shown, 'teams+');
  assert.equal(marks('different', 'different').shown, 'different+');
});

test('plural omitido: “team” verde + só o “s” vermelho (palavra contínua)', () => {
  const m = marks('different teams', 'different team');
  assert.equal(m.shown, 'different+ | team+ s-');
  assert.equal(m.status, 'needs_practice');                 // aprovação e lista do avaliador inalteradas
  assert.deepEqual(m.toPractise, ['teams']);
  assert.equal(marks('teams', 'team').shown, 'team+ s-');
});

test('terminação verbal omitida: “work” verde + “s” vermelho; outras terminações seguras', () => {
  assert.equal(marks('works', 'work').shown, 'work+ s-');
  assert.equal(marks('he works', 'he work').shown, 'he+ | work+ s-');
  assert.equal(classifyWord({ text: 'working', state: 'needs_practice', heard: 'work' }).kind, 'suffix');
  assert.equal(classifyWord({ text: 'finished', state: 'needs_practice', heard: 'finish' }).kind, 'suffix');
  assert.equal(classifyWord({ text: 'boxes', state: 'needs_practice', heard: 'box' }).kind, 'suffix');
  assert.deepEqual(markWord('John\'s', { text: "John's", state: 'needs_practice', heard: 'john' }), [{ text: 'John', mark: 'good' }, { text: "'s", mark: 'missing' }]);
});

test('substituição sem correspondência confiável: inteira vermelha (semelhança só no fim não conta)', () => {
  assert.equal(marks('teams', 'dreams').shown, 'teams-');
  assert.equal(marks('different teams', 'different dreams').shown, 'different+ | teams-');
  assert.equal(marks('project analyst', 'hello world').shown, 'project- | analyst-');
});

test('correspondência parcial ambígua: amarela (sem inventar o trecho que faltou)', () => {
  assert.equal(marks('different', 'difficult').shown, 'different?');
  assert.equal(marks('colour', 'color').shown, 'colour?');             // variante sem terminação segura
  assert.equal(marks('works', 'working').shown, 'works?');             // terminação trocada, não omitida
  assert.equal(marks('cities', 'city').shown, 'cities?');              // y → ies: o começo ouvido não é começo exato
  assert.equal(classifyWord({ text: 'red', state: 'needs_practice', heard: 're' }).kind, 'missing'); // base curta demais
});

test('palavra ausente (nada ouvido no lugar): vermelha', () => {
  assert.equal(marks('different teams', 'different').shown, 'different+ | teams-');
});

test('várias palavras, contrações, pontuação e variantes aceitas pelo avaliador ficam verdes', () => {
  assert.equal(marks('That sounds interesting.', 'that sounds interesting').shown, 'That+ | sounds+ | interesting+');
  assert.equal(marks("That's right", 'that is right').shown, "That's+ | right+");
  assert.equal(marks("That's right", 'thats right').shown, "That's+ | right+");
  assert.equal(marks("five o'clock", "5 o'clock").shown, "five+ | o'clock+");
  assert.equal(marks('What do you do?', 'what do you do').shown, 'What+ | do+ | you+ | do+');
  // contração ouvida por extenso que o avaliador não aceitou: várias palavras no lugar → amarela, não vermelha
  assert.equal(marks("I'm working", 'I am working').shown, "I'm? | working+");
  // palavra átona não avaliada continua amarela
  assert.equal(marks('work for a company', 'work for company').shown, 'work+ | for+ | a? | company+');
});

test('texto de exibição com pontuação: o corte respeita as letras (“teams,” → “team” + “s,”)', () => {
  assert.deepEqual(markWord('teams,', { text: 'teams', state: 'needs_practice', heard: 'team' }), [{ text: 'team', mark: 'good' }, { text: 's,', mark: 'missing' }]);
  assert.deepEqual(markWord('Teams', { text: 'Teams', state: 'needs_practice', heard: 'TEAM' }), [{ text: 'Team', mark: 'good' }, { text: 's', mark: 'missing' }]);
});

test('inconclusivo ou transcrição vazia: nenhuma cor', () => {
  assert.equal(marks('different teams', '').shown, '(sem cores)');
  assert.equal(marks('different teams', '').status, 'inconclusive');
});
