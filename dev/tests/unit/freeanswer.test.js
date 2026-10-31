// Respostas orais LIVRES: avaliação contextual (sem texto-alvo), divergências de reconhecimento,
// métricas e divisão de gravações longas. Transcrições escritas à mão (controladas) e reais do modelo local.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLexicon, isKnownWord, lemma } from '../../app/js/engine/lexicon.js';
import { analyseFreeAnswer, buildVocab, questionIntent, measure, insufficientAudio } from '../../app/js/engine/freeanswer.js';
import { splitForAsr } from '../../app/js/audio/segment.js';

// o mesmo arquivo que o app baixa do cache (data/lexicon.txt.gz)
setLexicon(gunzipSync(readFileSync(new URL('../../app/data/lexicon.txt.gz', import.meta.url))).toString('utf8').split('\n'));
const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const vocab = buildVocab(content);
const Q = content.questions;
const A = { silent: false, speechSec: 9, totalSec: 10, pauses: 2, longPauses: 0 };
const run = (qid, transcript, analysis = A) => analyseFreeAnswer({ question: Q[qid].q, model: Q[qid].a, transcript, analysis, vocab });
const flagged = (r) => r.practice.map((p) => p.text.toLowerCase());

test('pedagógico 1 — sinônimos e vocabulário fora do exemplo não são penalizados', () => {
  const r = run('G.Q01', 'I get up early, eat toast and take the bus to my job, then I study in the evening.');
  assert.equal(r.status, 'answers');
  assert.deepEqual(flagged(r), []);
  assert.ok(r.words.every((w) => w.state === 'good'));
});

test('pedagógico 2 — responde à pergunta sem reproduzir o exemplo (caso do enunciado)', () => {
  const r = run('G.Q01', 'I wake up at five, have breakfast, and then I drive to work.');
  assert.equal(r.status, 'answers');
  assert.ok(r.checklist.find((c) => c.id === 'activities').ok);
  assert.ok(r.checklist.find((c) => c.id === 'time').ok);
});

test('pedagógico 3 — palavra omitida pela transcrição não vira erro de pronúncia', () => {
  // o aluno disse “brush my teeth”, o reconhecedor omitiu “teeth”
  const r = run('G.Q09', 'Before going to bed I brush my and get ready for the next day.');
  assert.notEqual(r.status, 'off-topic');
  assert.ok(r.words.every((w) => w.state !== 'needs_practice'), 'omissão não pode ser marcada como erro');
  assert.match(r.pronunciation.note, /não mede os sons/);
});

test('pedagógico 4 — palavra trocada pelo reconhecedor é sinalizada como DIVERGÊNCIA, com a palavra provável', () => {
  const r = run('R01.Q4', 'I heat up my lunch and watch some chest videos, sometimes I play a quick game.');
  assert.equal(r.status, 'answers');
  assert.deepEqual(flagged(r), ['chest']);
  const p = r.practice[0];
  assert.equal(p.flag, 'confusion');
  assert.equal(p.ref, 'chess');
  assert.match(p.reason, /O app ouviu “chest”/);
  assert.match(p.reason, /se disse “chest”, está tudo certo/);
  assert.doesNotMatch(p.reason, /vogal|consoante|fonema|pronunciou errado/i);
  // palavra inexistente em inglês: provável erro do reconhecimento
  const r2 = run('G.Q01', 'I wake up at five and drive for youber to the office, then I work.');
  assert.deepEqual(flagged(r2), ['youber']);
  assert.equal(r2.practice[0].flag, 'nonword');
  assert.match(r2.practice[0].reason, /provável erro do reconhecimento/);
});

test('pedagógico 5 — pertinente com erros gramaticais continua “responde à pergunta”', () => {
  const r = run('G.Q01', 'I wakes up at six and go to work by car, after I has lunch with my colleagues.');
  assert.equal(r.status, 'answers');
  assert.deepEqual(flagged(r), []);
});

test('pedagógico 6 — gramaticalmente simples, mas comunica a ideia pedida', () => {
  assert.equal(run('R01.Q1', 'Usually at half past six.').status, 'answers');
  assert.equal(run('R10.Q1', 'Because I want to see my kids.').status, 'answers');
  assert.equal(run('N.Q04', 'Coffee and bread with cheese.').status, 'answers');
  const yes = run('N.Q10', 'Yes, I do.');
  assert.equal(yes.status, 'answers');
  assert.ok(yes.tips.some((t) => /Desenvolva/.test(t)), 'sugere desenvolver, sem reprovar');
});

test('pedagógico 7 — áudio insuficiente, transcrição vazia, curta ou degenerada: inconclusivo e sem avaliação', () => {
  for (const [t, a, reason] of [['I wake up', { silent: true, speechSec: 0, totalSec: 3 }, 'audio'], ['', A, 'empty'], ['Five.', A, 'short'], ['I I I I I I I I', A, 'degenerate'], ['0 0 0 0 0 0 0 0 0 0', A, 'degenerate']]) {
    const r = run('G.Q01', t, a);
    assert.equal(r.status, 'inconclusive', t);
    assert.equal(r.reason, reason, t);
    assert.deepEqual(r.practice, []);
    assert.ok(r.words.every((w) => w.state === 'uncertain'));
  }
  assert.ok(insufficientAudio({ silent: false, speechSec: 0.5 }));
  assert.ok(!insufficientAudio({ silent: false, speechSec: 4 }));
});

test('fora do tema e sem o elemento pedido: orientação, não “erro”', () => {
  const off = run('G.Q01', 'The weather is nice and the president said something about the economy.');
  assert.equal(off.status, 'off-topic');
  assert.match(off.message, /Pode ser erro do reconhecimento/);
  const part = run('R01.Q1', 'I go to the gym and then I work at the office.');
  assert.equal(part.status, 'partial');
  assert.ok(part.tips.some((t) => /horário/.test(t)));
});

test('contrações, flexões, horários, compostos e grafias BrE/AmE não geram marcações', () => {
  const r = run('G.Q01', "I don't wake up late. I'm usually up at 5:30am, I've got a lunchbox, I analyze reports, I practice English and I'd rather drive.");
  assert.deepEqual(flagged(r), []);
  assert.ok(isKnownWord("don't") && isKnownWord('woke') && isKnownWord('lunchbox') === false);
  assert.equal(lemma('woke'), 'wake');
  assert.equal(lemma('studies'), 'study');
  assert.equal(lemma('stopped'), 'stop');
});

test('intenção da pergunta (critério explícito)', () => {
  const cases = { 'What time do you wake up?': 'time', 'How often do you have English classes?': 'frequency', 'Why do you wake up later on some days?': 'reason',
    'How long do you study before class?': 'duration', 'Where do you work?': 'place', 'What does “sharp” mean?': 'meaning', 'What do you usually have for breakfast?': 'food',
    'Do you like chess?': 'like', 'Could you tell me about your daily routine?': 'activities', 'Is your job stressful?': 'yesno',
    'Do you play chess online or on a physical board?': 'info', 'What is the most challenging part of your routine?': 'info' };
  for (const [q, i] of Object.entries(cases)) assert.equal(questionIntent(q), i, q);
  assert.equal(questionIntent('', 'routine'), 'activities');
});

test('respostas-exemplo do próprio app são reconhecidas como resposta à pergunta (≥ 95%)', () => {
  const qs = Object.values(Q).filter((q) => q.a);
  const ok = qs.filter((q) => run(q.id, q.a).status === 'answers').length;
  assert.ok(ok / qs.length >= 0.95, `${ok}/${qs.length}`);
});

test('transcrições REAIS do modelo local (fala correta, 101 frases): quase nenhuma marcação indevida', () => {
  const rows = JSON.parse(readFileSync(new URL('../fixtures/moonshine-transcripts.json', import.meta.url)));
  let words = 0, flags = 0;
  for (const r of rows) { const a = run('G.Q01', r.heard); words += a.words.length; flags += a.practice.length; }
  assert.ok(flags / words < 0.005, `${flags}/${words}`);
});

test('métricas: só o que foi medido; velocidade fora da faixa plausível fica indisponível', () => {
  assert.deepEqual(measure(null, 10), { totalSec: null, speechSec: null, wpm: null, pauses: null, longPauses: null });
  assert.equal(measure({ silent: false, speechSec: 12, totalSec: 14, pauses: 3, longPauses: 1 }, 24).wpm, 120);
  assert.equal(measure({ silent: false, speechSec: 2, totalSec: 3, pauses: 0, longPauses: 0 }, 6).wpm, null, 'trecho curto demais');
  assert.equal(measure({ silent: false, speechSec: 4, totalSec: 5, pauses: 0, longPauses: 0 }, 60).wpm, null, '900 palavras/min não é plausível');
  const r = run('G.Q01', 'I wake up at five, have breakfast, and then I drive to work.', { silent: false, speechSec: 6, totalSec: 8, pauses: 1, longPauses: 0 });
  assert.equal(r.metrics.wpm, 130);
  assert.equal(r.pronunciation.evaluated, false);
});

test('gravação longa: dividida em trechos ≤ 24 s, contíguos, sem perder áudio, cortando nas pausas', () => {
  const sr = 16000;
  const pcm = new Float32Array(sr * 70);
  for (let i = 0; i < pcm.length; i++) pcm[i] = Math.sin(i / 7) * 0.3;          // “fala” contínua
  for (const s of [18, 37, 55]) pcm.fill(0, s * sr, Math.round((s + 0.6) * sr)); // pausas
  const segs = splitForAsr(pcm, sr);
  assert.ok(segs.length >= 3);
  assert.equal(segs[0].start, 0);
  assert.equal(segs.at(-1).end, pcm.length);
  for (let i = 1; i < segs.length; i++) assert.equal(segs[i].start, segs[i - 1].end);
  for (const s of segs) assert.ok((s.end - s.start) / sr <= 24.01);
  for (const s of segs.slice(0, -1)) assert.equal(pcm[s.end], 0, `corte fora da pausa em ${s.end / sr} s`);
  assert.deepEqual(splitForAsr(new Float32Array(sr * 20), sr), [{ start: 0, end: sr * 20 }]);
});
