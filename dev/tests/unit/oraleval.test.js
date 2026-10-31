// Avaliação pedagógica das respostas orais em camadas: integridade → correspondência → coerência → adequação → feedback.
// Testes TEXTUAIS e determinísticos (transcrições escritas à mão ou reais do Moonshine): validam a lógica de avaliação
// sem depender do reconhecimento. Não medem pronúncia nem acústica — o app não tem alinhamento acústico.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createChecker } from '../../app/js/engine/checker.js';
import { setLexicon } from '../../app/js/engine/lexicon.js';
import { findDivergences, contextPool } from '../../app/js/engine/context.js';
import { analyseFreeAnswer, buildVocab } from '../../app/js/engine/freeanswer.js';
import { evaluateWords } from '../../app/js/engine/wordfeedback.js';
import { frameRefs, findSlotSuspicions, findOddCombinations, findHoles, findContradictions, soundsAlike } from '../../app/js/engine/coherence.js';
import { transcriptIntegrity, estimateTokens } from '../../app/js/engine/integrity.js';
import { splitForAsr, speechBounds, voiceProfile, voicedSeconds, inSpeechAt } from '../../app/js/audio/segment.js';

setLexicon(gunzipSync(readFileSync(new URL('../../app/data/lexicon.txt.gz', import.meta.url))).toString('utf8').split('\n'));
const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const durations = JSON.parse(readFileSync(new URL('../../content/build/audio-durations.json', import.meta.url)));
const moonshine = JSON.parse(readFileSync(new URL('../fixtures/moonshine-transcripts.json', import.meta.url)));
const ck = createChecker(content.language);
const pool = contextPool(content, ck);
const vocab = buildVocab(content);
const frames = frameRefs(content);
const Q = content.questions;
const AN = { silent: false, speechSec: 12, totalSec: 13, pauses: 2, longPauses: 0 };
// o mesmo encadeamento da interface (ui/freeanswer.js)
const free = (qid, t, { integrity = null, unit = 'q' } = {}) => analyseFreeAnswer({
  question: Q[qid].q, model: Q[qid].a, alternatives: Q[qid].altAnswers || [], unit, transcript: t, analysis: AN, vocab, frames, integrity,
  divergences: findDivergences(t, { checker: ck, pool, model: Q[qid].a }), naturalness: ck.naturalness(t), grammar: ck.coverage(t, { keywords: [] }).grammar,
});
const state = (r, word) => r.words.filter((w) => w.text.replace(/[.,!?;:]+$/, '').toLowerCase() === word).map((w) => w.state);
const flags = (r) => r.practice.map((p) => [p.heard.toLowerCase(), p.ref]);

// ---------- casos reais (relato do aluno: sanduíche de frango com alface e tomate, app da Uber) ----------
const REAL = 'I wake up at five. I ate a kitten sandwich with salad. Usually I ate a little and tomato. I opened my over app and set this station to my office.';

test('1 — “chicken” ouvido como “kitten” num contexto de comida: âmbar, sugestão rotulada, transcrição intacta', () => {
  const r = free('G.Q01', REAL);
  assert.equal(r.transcript, REAL);
  assert.deepEqual(state(r, 'kitten'), ['needs_practice']);
  const p = r.practice.find((x) => x.heard === 'kitten');
  assert.equal(p.ref, 'chicken');
  assert.equal(p.strength, 'likely');
  assert.match(p.reason, /não é um alimento/);
  assert.match(p.reason, /Sugestão \(não é a transcrição\): “chicken”/);
  assert.notEqual(state(r, 'kitten')[0], 'good');
});

test('2 — “lettuce” ouvido como “a little” numa lista de acompanhamentos', () => {
  const r = free('N.Q04', 'Usually I ate a little and tomato.');
  assert.deepEqual(flags(r), [['little', 'lettuce']]);
  assert.deepEqual(state(r, 'little'), ['needs_practice']);
  assert.match(r.practice[0].reason, /não ocupa o lugar de um nome/);
  assert.match(r.practice[0].reason, /soa parecido com “lettuce”/);
});

test('3 — “Uber” ouvido como “over” (e “destination” como “station”) num contexto de deslocamento', () => {
  const r = free('N.Q02', 'I opened my over app and set this station to my office.');
  assert.deepEqual(flags(r), [['over', 'Uber'], ['station', 'destination']]);
  assert.equal(r.practice[0].strength, 'likely');   // som parecido + palavra funcional no lugar de um nome
  assert.equal(r.practice[1].strength, 'possible'); // só som parecido: “pode não corresponder”
  assert.match(r.practice[1].reason, /pode não corresponder/);
});

test('4 — frase gramaticalmente errada mas compreensível: correção de gramática, sem suspeita de reconhecimento', () => {
  const r = free('N.Q02', 'I drive to work and my wife go to the office by bus.');
  assert.equal(r.status, 'answers');
  assert.deepEqual(r.practice, []);
  assert.ok(r.language.grammar.some((g) => /3ª pessoa/.test(g)));
  assert.ok(r.words.every((w) => w.state !== 'needs_practice'));
});

test('5 — resposta correta com vocabulário diferente do modelo: aceita, nada marcado', () => {
  const r = free('N.Q04', 'For breakfast I normally have toast with cheese and a cup of tea.');
  assert.equal(r.status, 'answers');
  assert.deepEqual(r.practice, []);
  assert.ok(r.checklist.find((c) => c.id === 'food').ok);
});

test('6 — alternativa válida que não está na referência (ônibus × carro, presunto × frango): não é erro', () => {
  const a = free('N.Q02', 'I take the bus and then the train to the office.');
  assert.equal(a.status, 'answers');
  assert.deepEqual(a.practice, []);
  const b = free('N.Q04', 'I usually have a ham sandwich with lettuce and tomato.');
  assert.deepEqual(b.practice, []);
  assert.deepEqual(state(b, 'ham'), ['good']);
});

test('7 — frase incomum mas plausível (“pumpkin sandwich”): não é rejeitada nem marcada', () => {
  const r = free('N.Q04', 'I usually have a pumpkin sandwich with salad for breakfast.');
  assert.equal(r.status, 'answers');
  assert.deepEqual(r.practice, []);
  assert.notEqual(state(r, 'pumpkin')[0], 'needs_practice');
});

test('8 — elemento solicitado realmente ausente (transcrição íntegra): “responde em parte” com orientação', () => {
  const integrity = transcriptIntegrity({ text: 'x', segments: [{ secs: 6, voicedSec: 4, text: 'I wake up and take a shower, then I have breakfast.' }] });
  assert.equal(integrity.complete, true);
  const r = free('R01.Q1', 'I wake up and take a shower, then I have breakfast.', { integrity });
  assert.equal(r.status, 'partial');
  const time = r.checklist.find((c) => c.id === 'time');
  assert.equal(time.ok, false);
  assert.ok(!time.unconfirmed);
  assert.ok(r.tips.some((t) => /horário/.test(t)));
});

test('9 — aluno disse o elemento mas a transcrição o omitiu (lacuna “at and”): “não confirmado”, não “faltou”', () => {
  const r = free('R01.Q1', 'I usually wake up at and then I take a shower.');
  assert.equal(r.status, 'unclear');
  const time = r.checklist.find((c) => c.id === 'time');
  assert.equal(time.ok, null);
  assert.equal(time.unconfirmed, true);
  assert.match(r.message, /pode ter perdido parte da sua fala/);
  assert.match(r.message, /depois de “at”/);
  assert.ok(!r.tips.some((t) => /horário/.test(t)), 'não manda “dizer o horário” quando ele pode ter sido dito');
});

test('10 — transcrição truncada, trecho perdido ou corte no meio da fala: integridade avisa e a avaliação se ajusta', () => {
  // corte: texto no limite de 6 tokens/s do reconhecedor
  const cut = transcriptIntegrity({ text: '', segments: [{ secs: 2, voicedSec: 1.9, text: 'I wake up at five and then I take a shower' }] });
  assert.deepEqual(cut.issues.map((x) => x.code), ['possibly-truncated']);
  // trecho com voz que voltou vazio + corte em fala
  const lost = transcriptIntegrity({ text: '', segments: [{ secs: 20, voicedSec: 14, text: 'I wake up at five and take a shower before breakfast every day', cutInSpeech: true }, { secs: 15, voicedSec: 9, text: '' }] });
  assert.deepEqual(lost.issues.map((x) => x.code).sort(), ['cut-in-speech', 'lost-part', 'low-density']); // 12 palavras em 23 s de voz
  const r = free('R01.Q1', 'I go to the gym and then I work at the office.', { integrity: lost });
  assert.equal(r.status, 'unclear');
  assert.equal(r.checklist.find((c) => c.id === 'time').unconfirmed, true);
  // leitura: fim da frase depois da última âncora fica “não avaliado”, não “praticar”
  const ev = evaluateWords('I wake up at five and take a shower.', { text: 'I wake up at five and', confidence: 0 }, { tailUnreliable: true });
  assert.deepEqual(ev.words.slice(-3).map((w) => w.state), ['uncertain', 'uncertain', 'uncertain']);
  const ev2 = evaluateWords('I wake up at five and take a shower.', { text: 'I wake up at five and', confidence: 0 });
  assert.deepEqual(ev2.words.slice(-3).map((w) => w.state), ['needs_practice', 'uncertain', 'needs_practice'], 'sem o aviso de corte, o comportamento anterior é mantido (“a” é átona)');
});

test('10b — sem falso aviso de corte nas 101 leituras reais do Moonshine (duração real de cada áudio)', () => {
  let flagged = 0;
  for (const x of moonshine) {
    const secs = durations[content.sentences[x.id].au];
    if (transcriptIntegrity({ text: x.heard, secs }).issues.length) flagged++;
  }
  assert.equal(flagged, 0);
  assert.ok(estimateTokens('Presentations.') >= 2);
});

test('11 — palavra desconhecida ou nome próprio: não é substituída por adivinhação contextual', () => {
  const r = free('N.Q02', 'I open the Bolt app and drive to Itaipava.');
  assert.deepEqual(r.practice, []);
  assert.deepEqual(state(r, 'itaipava'), ['uncertain']);
  assert.ok(!r.words.some((w) => /Uber/.test(w.reason || '')));
});

test('12 — texto completo com contradição relevante: apontada sem decidir qual informação vale', () => {
  const c = findContradictions('I wake up at five every day. I usually wake up at eight and go to work.');
  assert.equal(c.length, 1);
  assert.deepEqual(c[0].times, ['five', 'eight']);
  assert.deepEqual(findContradictions('On weekdays I wake up at five, but on weekends I wake up at eight.'), []);
  assert.equal(findContradictions('I leave home at 6 p.m. in the morning.')[0].kind, 'period');
  const r = free('G.Q01', 'I wake up at five every day. I usually wake up at eight and go to work.');
  assert.equal(r.coherence.length, 1);
  assert.match(r.coherence[0].msg, /dois horários/);
  assert.match(r.coherence[0].msg, /pode ter sido o reconhecimento/);
});

test('13 — grafias britânica e americana válidas: aceitas na resposta livre e na leitura', () => {
  const r = free('R06.Q3', 'I practice English vocabulary and analyze my notes in the cafeteria; I organize everything in my neighborhood.');
  assert.deepEqual(r.practice, []);
  assert.ok(['practice', 'analyze', 'organize', 'neighborhood'].every((w) => state(r, w)[0] === 'good'));
  const ev = evaluateWords('I practise English and analyse reports in the neighbourhood cafeteria.', { text: 'I practice English and analyze reports in the neighborhood cafetaria.', confidence: 0 });
  assert.ok(ev.words.every((w) => w.state === 'good'), JSON.stringify(ev.words.map((w) => w.text + ':' + w.state)));
  // distância de edição sozinha não prova acerto: outra palavra real do inglês não conta
  const ev2 = evaluateWords('My brother drives.', { text: 'My bother drives.', confidence: 0 });
  assert.equal(ev2.words[1].state, 'needs_practice');
});

test('14 — pausas e segmentação: trechos contíguos, sem perda nem duplicação; cortes nas pausas', () => {
  const sr = 16000, tone = (n, f) => Float32Array.from({ length: n }, (_, i) => 0.3 * Math.sin((2 * Math.PI * f * i) / sr));
  const parts = [];
  for (let k = 0; k < 12; k++) { parts.push(tone(sr * 4, 220 + k * 10)); parts.push(new Float32Array(sr * 0.6)); } // 12 frases de 4 s com pausas
  const pcm = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0; for (const p of parts) { pcm.set(p, o); o += p.length; }
  const segs = splitForAsr(pcm, sr);
  assert.ok(segs.length > 1);
  assert.equal(segs[0].start, 0);
  assert.equal(segs.at(-1).end, pcm.length);
  for (let i = 1; i < segs.length; i++) assert.equal(segs[i].start, segs[i - 1].end, 'contíguos: sem buraco nem sobreposição');
  const prof = voiceProfile(pcm, sr);
  for (const s of segs.slice(0, -1)) assert.equal(inSpeechAt(prof, s.end), false, 'corte caiu numa pausa');
  const total = segs.reduce((n, s) => n + voicedSeconds(prof, s.start, s.end), 0);
  assert.ok(Math.abs(total - voicedSeconds(prof, 0, pcm.length)) < 0.05, 'toda a fala está em algum trecho');
  // palavra isolada: recorte com no mínimo 1 s do próprio áudio (limite de 6 tokens/s do reconhecedor)
  const word = new Float32Array(sr * 3); word.set(tone(sr * 0.3, 300), sr);
  const b = speechBounds(word, sr, { minSec: 1 });
  assert.ok(b.end - b.start >= sr && b.start <= sr && b.end >= sr * 1.3);
});

test('15 — impossível decidir entre erro do aluno e do reconhecimento: as duas hipóteses, sem culpar o aluno', () => {
  const r = free('G.Q01', REAL);
  for (const p of r.practice) {
    assert.match(p.reason, /reconhecimento ou a pronúncia/);
    assert.match(p.reason, /Se você disse “[^”]+” mesmo, ignore esta marca/);
    assert.doesNotMatch(p.reason, /você errou|pronunciou errado|fonema|vogal|consoante/i);
  }
  assert.equal(r.status, 'answers', 'trechos suspeitos não reprovam a resposta');
  assert.equal(r.transcript, REAL);
});

// ---------- regressão de falsos alarmes (medida antes de fixar as regras) ----------
test('sem falsos alarmes: respostas-modelo, frases e blocos do conteúdo e as 101 leituras reais do Moonshine', () => {
  const texts = [...Object.values(Q).map((q) => q.a).filter(Boolean), ...Object.values(content.sentences).map((s) => s.en), ...Object.values(content.blocks).map((b) => b.en)];
  const fp = texts.filter((t) => findSlotSuspicions(t, frames).length || findOddCombinations(t).length || findHoles(t).length || findContradictions(t).length);
  assert.deepEqual(fp, []);
  const fpm = moonshine.filter((x) => findSlotSuspicions(x.heard, frames).length || findOddCombinations(x.heard).length || findContradictions(x.heard).length);
  assert.deepEqual(fpm.map((x) => x.id), []);
});

test('cores = evidência: verde só com vocabulário/contexto compatível; âmbar só com sinal; cinza sem evidência', () => {
  const r = free('G.Q01', REAL);
  const by = (st) => r.words.filter((w) => w.state === st).map((w) => w.text.replace(/[.,!?;:]+$/, ''));
  assert.deepEqual(by('needs_practice'), ['kitten', 'little', 'over', 'station']);
  for (const w of ['sandwich', 'salad', 'tomato', 'app', 'office']) assert.ok(by('good').includes(w), w);
  // palavras curtas encostadas num trecho suspeito não ficam verdes
  assert.ok(['my', 'this'].every((w) => by('uncertain').includes(w)));
  // palavra real do inglês fora do vocabulário da atividade e sem moldura: cinza, nunca verde
  const g = free('G.Q01', 'I wake up at five and feed my iguana before work.');
  assert.deepEqual(state(g, 'iguana'), ['uncertain']);
});

test('som parecido: critério estrito (pares do caso real sim; alternativas comuns não)', () => {
  for (const [a, b] of [['kitten', 'chicken'], ['over', 'Uber'], ['a little', 'lettuce'], ['station', 'destination']]) assert.ok(soundsAlike(a, b), `${a}/${b}`);
  for (const [a, b] of [['pumpkin', 'chicken'], ['ham', 'chicken'], ['bus', 'bike'], ['button', 'chicken'], ['school', 'office'], ['salad', 'lettuce']]) assert.ok(!soundsAlike(a, b), `${a}/${b}`);
});
