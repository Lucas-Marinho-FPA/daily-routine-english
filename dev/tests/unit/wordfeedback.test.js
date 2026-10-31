// Feedback de pronúncia palavra por palavra: segmentação, estados e nota (sem avaliações inventadas).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { segment, wordsOf, evaluateWords, scoreAttempt, STATES } from '../../app/js/engine/wordfeedback.js';

const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const S = 'I wake up at 5:00 a.m., take a shower and brush my teeth.';
const stateOf = (ev, word) => ev.words.find((x) => x.text === word).state;
const goodAnalysis = { silent: false, speechSec: 3.2, pauses: 1, longPauses: 0, wpm: 130, paceVsReference: 1.1 };

test('segmentação reconstrói o texto exatamente (espaços, pontuação e ordem) em todas as frases e blocos', () => {
  const texts = [...Object.values(content.sentences).map((s) => s.en), ...Object.values(content.blocks).map((b) => b.en), "It's eleven o'clock — isn't it?  Yes!"];
  for (const t of texts) {
    assert.equal(segment(t).map((s) => s.text).join(''), t);
    const ws = wordsOf(t);
    ws.forEach((w, i) => assert.equal(w.w, i));
  }
  const ws = wordsOf(S).map((w) => w.text);
  assert.deepEqual(ws, ['I', 'wake', 'up', 'at', '5:00', 'a.m.', 'take', 'a', 'shower', 'and', 'brush', 'my', 'teeth']);
});

test('sem reconhecimento: todas as palavras ficam "uncertain" (nenhuma cor de acerto ou erro inventada)', () => {
  const ev = evaluateWords(S, null);
  assert.equal(ev.evaluated, false);
  assert.ok(ev.words.every((w) => w.state === 'uncertain'));
  assert.match(ev.note, /indisponível/);
});

test('gravação insuficiente e transcrição vazia: inconclusivo', () => {
  assert.ok(evaluateWords(S, { text: 'I wake up', confidence: 0.9 }, { insufficient: true }).words.every((w) => w.state === 'uncertain'));
  assert.ok(evaluateWords(S, { text: '', confidence: 0 }).words.every((w) => w.state === 'uncertain'));
});

test('confiança baixa do reconhecedor: inconclusivo, não erro', () => {
  const ev = evaluateWords(S, { text: 'I wake up at five a m take a shower and brush my teeth', confidence: 0.3 });
  assert.ok(ev.words.every((w) => w.state === 'uncertain'));
});

test('leitura reconhecida inteira: palavras "good", com horas por extenso equivalentes a 5:00 a.m.', () => {
  const ev = evaluateWords(S, { text: 'I wake up at five a.m. take a shower and brush my teeth', confidence: 0.9 });
  assert.ok(ev.evaluated);
  assert.ok(ev.words.every((w) => w.state === 'good'), JSON.stringify(ev.words.filter((w) => w.state !== 'good')));
  const ev2 = evaluateWords(S, { text: 'I wake up at 5 am take a shower and brush my teeth', confidence: 0 });
  assert.equal(stateOf(ev2, '5:00'), 'good');
  assert.equal(stateOf(ev2, 'a.m.'), 'good');
});

test('substituição: palavra de conteúdo vira "needs_practice" e o motivo cita o que foi ouvido, sem inventar o tipo de erro', () => {
  const ev = evaluateWords(S, { text: 'I wake up at five a.m. take a shower and brush my tits', confidence: 0.85 });
  const t = ev.words.find((w) => w.text === 'teeth');
  assert.equal(t.state, 'needs_practice');
  assert.match(t.reason, /ouviu “tits”/);
  assert.doesNotMatch(t.reason, /vogal|consoante|tônica/i, 'não pode afirmar qual som errou');
  assert.equal(stateOf(ev, 'brush'), 'good');
});

test('omissão: palavra de conteúdo ausente = "needs_practice"; palavra átona ausente = "uncertain"', () => {
  const ev = evaluateWords(S, { text: 'I wake up five a.m. take shower and my teeth', confidence: 0.8 });
  assert.equal(stateOf(ev, 'brush'), 'needs_practice');
  assert.equal(stateOf(ev, 'at'), 'uncertain');
  assert.equal(stateOf(ev, 'a'), 'uncertain');
});

test('grafia americana na transcrição não é erro (analyze ↔ analyse)', () => {
  const t = 'I analyse profitability, efficiency and business performance.';
  const ev = evaluateWords(t, { text: 'I analyze profitability efficiency and business performance', confidence: 0.9 });
  assert.ok(ev.words.every((w) => w.state === 'good'));
});

test('todos os estados produzidos pertencem ao conjunto definido', () => {
  for (const asr of [null, { text: 'random words here', confidence: 0.9 }, { text: S, confidence: 0.9 }]) {
    for (const w of evaluateWords(S, asr).words) assert.ok(STATES.includes(w.state));
  }
});

test('nota: sem reconhecimento não há nota geral; entonação nunca recebe nota inventada', () => {
  const ev = evaluateWords(S, null);
  const sc = scoreAttempt({ evaluation: ev, analysis: goodAnalysis, expectedWords: 13 });
  assert.equal(sc.overall, null);
  assert.equal(sc.dims.find((d) => d.id === 'prosody').score, null);
  assert.ok(sc.dims.find((d) => d.id === 'fluency').score !== null, 'ritmo é medido a partir da gravação');
});

test('nota: com reconhecimento, combina só as dimensões medidas (pesos renormalizados) e marca como parcial', () => {
  const ev = evaluateWords(S, { text: 'I wake up at five a.m. take a shower and brush my tits', confidence: 0.85 });
  const sc = scoreAttempt({ evaluation: ev, analysis: goodAnalysis, expectedWords: 13 });
  const intel = sc.dims.find((d) => d.id === 'intelligibility').score;
  assert.ok(intel > 80 && intel < 100);
  assert.ok(sc.overall !== null && sc.partial);
  assert.equal(sc.dims.find((d) => d.id === 'prosody').score, null);
  const expected = Math.round((intel * 0.6 + sc.dims.find((d) => d.id === 'fluency').score * 0.2 + 100 * 0.05) / 0.85);
  assert.equal(sc.overall, expected);
});

test('nota: gravação ruim não gera nota baixa (gera ausência de nota)', () => {
  const ev = evaluateWords(S, { text: S, confidence: 0.9 });
  const sc = scoreAttempt({ evaluation: ev, analysis: { silent: true, speechSec: 0, pauses: 0, longPauses: 0 }, expectedWords: 13 });
  assert.equal(sc.overall, null);
  assert.match(sc.message, /insuficiente/);
});

test('nota: fala mais lenta (até 1,8× a referência) não perde pontos de duração', () => {
  const ev = evaluateWords(S, { text: S, confidence: 0.9 });
  const sc = scoreAttempt({ evaluation: ev, analysis: { ...goodAnalysis, paceVsReference: 1.7, wpm: 80 }, expectedWords: 13 });
  assert.equal(sc.dims.find((d) => d.id === 'duration').score, 100);
});

test('verificação sem gravação (só reconhecimento): ritmo e duração indisponíveis, nota parcial', () => {
  const ev = evaluateWords(S, { text: S, confidence: 0.9 });
  const sc = scoreAttempt({ evaluation: ev, analysis: null, expectedWords: 13, recorded: false });
  assert.equal(sc.overall, 100);
  assert.ok(sc.partial);
  assert.equal(sc.dims.find((d) => d.id === 'fluency').score, null);
});

// ---------- reconhecimento local (Moonshine): normalização da transcrição, sem inventar erros ----------
const goodAll = (t, heard) => evaluateWords(t, { text: heard, confidence: 0 }).words.filter((w) => w.state === 'needs_practice').map((w) => w.text);

test('transcrição do modelo local: formas equivalentes não viram erro (compostos, horas, flexões, nomes próprios)', () => {
  // casos reais observados na calibração do modelo local (voz sintética britânica lendo as frases do app)
  assert.deepEqual(goodAll('I put my lunch box in the fridge.', 'I put my lunchbox in the fridge.'), []);
  assert.deepEqual(goodAll('I listen to an English audiobook.', 'I listen to an English audio book.'), []);
  assert.deepEqual(goodAll('I deal with my usual tasks.', 'Ideal with my usual tasks.'), []);
  assert.deepEqual(goodAll('I go home at around noon.', 'I go home at a round noon.'), []);
  assert.deepEqual(goodAll('I finish work at 6:00 p.m. and drive home.', 'I finish work at 6p. M. and drive home.'), []);
  assert.deepEqual(goodAll('I get home at around 8:30 p.m.', 'I get home at around 8:30pm.'), []);
  assert.deepEqual(goodAll('At 9:00 a.m., I log in.', 'At 900a. M. I log in.'), []);
  assert.deepEqual(goodAll('I walk to the office and switch on my laptop.', 'I walked to the office and switched on my laptop.'), []);
  assert.deepEqual(goodAll('In the afternoon, I finalise my reports.', 'In the afternoon, I finalized my reports.'), []);
  assert.deepEqual(goodAll('I drive for Uber on my way to work.', 'I drive for you, but on my way to work.'), [], 'nome próprio não reconhecido fica cinza, não vermelho');
  const ev = evaluateWords('I drive for Uber on my way to work.', { text: 'I drive for you, but on my way to work.', confidence: 0 });
  assert.equal(stateOf(ev, 'Uber'), 'uncertain');
});

test('transcrição do modelo local: troca real de palavra continua sendo apontada', () => {
  assert.deepEqual(goodAll(S, 'I wake up at 5am, take a shower and brush my tits.'), ['teeth']);
  assert.deepEqual(goodAll('I work until 6:00 p.m.', 'I walk until 6 p.m.'), ['work']);
  assert.deepEqual(goodAll('I listen to music during the drive.', 'I listen to music during the dive.'), ['drive']);
  assert.deepEqual(goodAll('I spend fifteen minutes on my notes.', 'I spend fifty minutes on my notes.'), ['fifteen']);
});

test('transcrição degenerada (laço de repetição do modelo): tudo inconclusivo, sem nota', () => {
  const ev = evaluateWords('I wake up at 5:00 a.m. and go to the gym.', { text: 'I wake up at 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0', confidence: 0 });
  assert.equal(ev.evaluated, false);
  assert.ok(ev.words.every((w) => w.state === 'uncertain'));
  assert.match(ev.note, /não confiável/);
  assert.equal(scoreAttempt({ evaluation: ev, analysis: goodAnalysis, expectedWords: 11 }).overall, null);
});

test('confiança 0 (o modelo local não informa confiança) não é tratada como confiança baixa', () => {
  const ev = evaluateWords(S, { text: S, confidence: 0 });
  assert.ok(ev.evaluated && ev.words.every((w) => w.state === 'good'));
});
