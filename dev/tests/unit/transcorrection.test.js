// Correção contextual de transcrições (respostas orais livres): distinguir
//   A. possível erro do reconhecimento, com hipótese contextual rotulada (nunca certeza);
//   B. erro real de inglês (concordância “I gets ready”), sem marcar a palavra como erro do reconhecedor;
//   C. caso inconclusivo (sem hipótese segura, fala curta, nome próprio).
// Testes TEXTUAIS e determinísticos, pelo mesmo encadeamento da interface (ui/freeanswer.js). Não medem pronúncia.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createChecker } from '../../app/js/engine/checker.js';
import { setLexicon } from '../../app/js/engine/lexicon.js';
import { findDivergences, contextPool } from '../../app/js/engine/context.js';
import { analyseFreeAnswer, buildVocab, contextualHypothesis } from '../../app/js/engine/freeanswer.js';
import { agreementIssues } from '../../app/js/engine/agreement.js';
import { frameRefs } from '../../app/js/engine/coherence.js';
import { wordTokens } from '../../app/js/engine/text.js';

setLexicon(gunzipSync(readFileSync(new URL('../../app/data/lexicon.txt.gz', import.meta.url))).toString('utf8').split('\n'));
const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const moonshine = JSON.parse(readFileSync(new URL('../fixtures/moonshine-transcripts.json', import.meta.url)));
const ck = createChecker(content.language);
const pool = contextPool(content, ck);
const vocab = buildVocab(content);
const frames = frameRefs(content);
const Q = content.questions;
const AN = { silent: false, speechSec: 12, totalSec: 13, pauses: 2, longPauses: 0 };
const free = (qid, t, { alternatives } = {}) => analyseFreeAnswer({
  question: Q[qid].q, model: Q[qid].a, alternatives: alternatives || Q[qid].altAnswers || [], unit: 'q', transcript: t, analysis: AN, vocab, frames,
  divergences: findDivergences(t, { checker: ck, pool, model: Q[qid].a }), naturalness: ck.naturalness(t), grammar: ck.coverage(t, { keywords: [] }).grammar,
});
const clean = (s) => s.replace(/[.,!?;:]+$/, '').toLowerCase();
const state = (r, word) => r.words.filter((w) => clean(w.text) === word).map((w) => w.state);
const marks = (r) => r.practice.map((p) => [clean(p.heard), p.ref]);
const amber = (r) => r.words.filter((w) => w.state === 'needs_practice').map((w) => clean(w.text));

// coerência visual × lógica: cada destaque âmbar pertence a uma marca, cada marca aponta para palavras âmbar
// com o mesmo texto, e a transcrição exibida é a reconhecida (nada é substituído)
function assertCoherent(r, input) {
  assert.equal(r.transcript, input.trim(), 'transcrição preservada');
  if (r.status === 'inconclusive') { assert.equal(r.practice.length, 0); assert.ok(r.words.every((w) => w.state === 'uncertain')); return; }
  r.words.forEach((w, i) => assert.equal(w.w, i, 'índices das palavras sem deslocamento'));
  const covered = new Set(r.practice.flatMap((p) => p.ws || [p.w]));
  for (const w of r.words) if (w.state === 'needs_practice') assert.ok(covered.has(w.w), `“${w.text}” âmbar sem marca`);
  for (const p of r.practice) {
    const ws = p.ws || [p.w];
    for (const k of ws) assert.equal(r.words[k].state, 'needs_practice', `marca “${p.heard}” aponta para palavra não âmbar`);
    const shown = ws.map((k) => clean(r.words[k].text)).join(' ');
    assert.ok(clean(p.heard).replace(/-/g, ' ').includes(shown.split(' ')[0]), `marca “${p.heard}” destaca “${shown}”`);
    assert.ok(['recognition', 'inconclusive'].includes(p.category), `categoria de “${p.heard}”`);
    if (p.ref) assert.match(p.reason, /sugestão|Sugestão|Se você quis dizer/, 'hipótese rotulada como sugestão');
  }
}

test('1 — “offsy”, “ofcy” e “off-scene” → hipótese contextual “office”, rotulada, sem trocar a transcrição', () => {
  const ref = 'I arrive in my near-ofcy, near my off-scene.';
  const r = free('R01.Q2', ref);
  assert.equal(r.transcript, ref);
  assert.deepEqual(marks(r), [['ofcy', 'office'], ['off-scene', 'office']]);
  assert.deepEqual(state(r, 'ofcy'), ['needs_practice']);
  assert.deepEqual(state(r, 'off'), ['needs_practice']);
  assert.deepEqual(state(r, 'scene'), ['needs_practice']);
  const p = r.practice[0];
  assert.equal(p.category, 'recognition');
  assert.match(p.reason, /pode ter sido reconhecida incorretamente/);
  assert.match(p.reason, /talvez você tenha dito “office” \(sugestão, não a transcrição\)/);
  assert.match(p.reason, /Confira se essa sugestão corresponde ao que você disse/);
  assert.doesNotMatch(p.reason, /você (pronunciou|disse) corretamente/);
  // “offsy” isolado: mesma hipótese; numa frase sem outra relação com a pergunta, não vira “fora do tema”
  const r2 = free('R01.Q2', 'I go to the offsy.');
  assert.deepEqual(marks(r2), [['offsy', 'office']]);
  assert.equal(r2.status, 'unclear');
  assert.match(r2.message, /pode ter reconhecido errado.*“offsy” — talvez “office”/);
  assert.deepEqual(r2.hypotheses, [{ heard: 'offsy', ref: 'office' }]);
  assert.equal(contextualHypothesis('offsy', ['office', 'drive', 'accept']), 'office');
  assertCoherent(r, ref); assertCoherent(r2, 'I go to the offsy.');
});

test('2 — resposta diferente do exemplo não é marcada só por ser diferente', () => {
  for (const t of ['I listen to podcasts and check the traffic on my phone.', 'I usually listen to music and plan my day in the car.', 'I take the bus and read the news on my phone.']) {
    const r = free('R01.Q2', t);
    assert.deepEqual(amber(r), [], t);
    assert.deepEqual(r.hypotheses, [], t);
    assert.notEqual(r.status, 'off-topic', t);
  }
});

test('3 — alternativa aceita: reconhecida como resposta válida e usada como contexto de hipótese', () => {
  const alt = Q['R01.Q1'].altAnswers[0];
  const r = free('R01.Q1', alt);
  assert.equal(r.status, 'answers');
  assert.deepEqual(amber(r), []);
  // palavra só da alternativa (não do exemplo) passa a valer como contexto: “metrow” → “metro” (sugestão)
  const alts = ['I take the metro and read the news on my phone.'];
  const t = 'I take the metrow and read the news.';
  assert.deepEqual(marks(free('R01.Q2', t, { alternatives: [] })), [['metrow', null]]);
  const r2 = free('R01.Q2', t, { alternatives: alts });
  assert.deepEqual(marks(r2), [['metrow', 'metro']]);
  assert.notEqual(r2.status, 'off-topic');
  // e a alternativa dita por extenso não gera nenhuma marca
  assert.deepEqual(amber(free('R01.Q2', alts[0], { alternatives: alts })), []);
});

test('4 — “I gets ready” é erro de gramática (concordância), não do reconhecimento', () => {
  const t = 'I gets ready and drive for Uber and accept rides along the way.';
  const r = free('R01.Q2', t);
  assert.deepEqual(state(r, 'gets'), ['good']);
  assert.deepEqual(r.practice, []);
  assert.equal(r.language.grammar.length, 1);
  assert.match(r.language.grammar[0], /Concordância \(Present Simple\).*“I get”, não “I gets”/);
  assert.equal(r.status, 'answers', 'adequação independente da gramática');
  assert.deepEqual(agreementIssues('I usually has breakfast. They watches TV. He always drive to work.').map((x) => x.fix), ['I usually have', 'they watch', 'he always drives']);
  assert.deepEqual(agreementIssues('Does she go to work? Can he drive? I guess I focus on my work. She goes home.'), []);
  // terceira pessoa já coberta por uma regra do corretor: sem mensagem duplicada
  const r3 = free('R01.Q2', 'My wife go to work and I drive for Uber along the way.');
  assert.ok(r3.language.grammar.filter((g) => /Concordância|3ª pessoa/.test(g)).length <= 1);
});

test('5 — inserções e omissões não deslocam o destaque', () => {
  for (const t of ['I um arrive at at the offsy near my gym.', 'arrive the offsy.', 'Well, uh, I I drive and then I arrive at the offsy, you know.']) {
    const r = free('R01.Q2', t);
    const k = r.words.findIndex((w) => clean(w.text) === 'offsy');
    assert.ok(k >= 0, t);
    assert.equal(r.words[k].state, 'needs_practice', t);
    assert.equal(r.practice[0].w, k, t);
    assert.equal(amber(r).join(' '), 'offsy', t);
    assertCoherent(r, t);
  }
});

test('6 — contrações e variantes preservadas, sem marca', () => {
  const cases = [
    "I'm driving for Uber and I don't stop until I'm near the office.",
    "I don't drive in the morning; I'd rather organise my day before I leave.",
    'I organize my rides and I practise English in the car.',
  ];
  for (const t of cases) {
    const r = free('R01.Q2', t);
    assert.equal(r.transcript, t);
    assert.deepEqual(amber(r), [], t);
    assert.deepEqual(r.language.grammar, [], t);
    assertCoherent(r, t);
  }
  // mantém a contração como foi reconhecida (sem expandir nem “corrigir”)
  assert.ok(free('R01.Q2', cases[0]).words.some((w) => w.text === "I'm"));
});

test('7 — horários e números (“five thirty”, “5:30”) preservados e aceitos', () => {
  for (const t of ['I wake up at five thirty in the morning.', 'I wake up at 5:30 because my schedule is busy.', 'I wake up at half past five.']) {
    const r = free('R01.Q1', t);
    assert.equal(r.transcript, t);
    assert.deepEqual(amber(r), [], t);
    assert.ok(r.checklist.find((c) => c.id === 'time').ok, t);
    assert.ok(r.words.filter((w) => /\d|five|thirty|half/.test(w.text)).every((w) => w.state === 'good'), t);
  }
});

test('8 — transcrição curta ou ambígua: inconclusiva, sem hipótese nem excesso de confiança', () => {
  for (const t of ['Offsy.', 'Uber office.', 'um']) {
    const r = free('R01.Q2', t);
    assert.equal(r.status, 'inconclusive', t);
    assert.deepEqual(r.practice, [], t);
    assert.ok(r.words.every((w) => w.state === 'uncertain'), t);
    assert.equal(r.hypotheses, undefined, t);
  }
  // empate entre duas candidatas → nenhuma sugestão
  assert.equal(contextualHypothesis('bak', ['bake', 'back']), null);
  assert.equal(contextualHypothesis('xq', ['office']), null);
});

test('9 — resposta correta e não literal ao exemplo: sem falso positivo', () => {
  const t = "I check the app, accept a ride and drive to my office. It's a good way to earn some money.";
  const r = free('R01.Q2', t);
  assert.equal(r.status, 'answers');
  assert.deepEqual(amber(r), []);
  assert.deepEqual(r.language.grammar, []);
  assert.deepEqual(r.hypotheses, []);
});

test('10 — resposta claramente inadequada mantém a avaliação de adequação', () => {
  const r = free('R01.Q2', 'My favourite colour is blue and I like dogs.');
  assert.equal(r.status, 'off-topic');
  assert.deepEqual(r.hypotheses, []);
  assert.equal(r.checklist.find((c) => c.id === 'topic').ok, false);
  // um erro de gramática não “salva” nem derruba a adequação
  const r2 = free('R01.Q2', 'My favourite colour is blue and I likes dogs.');
  assert.equal(r2.status, 'off-topic');
  assert.match(r2.language.grammar.join(' '), /“I like”, não “I likes”/);
  for (const [ok, bad] of [['I get ready and drive for Uber.', 'I gets ready and drive for Uber.'], ['I wake up at five.', 'I wakes up at five.']]) {
    const q = ok.startsWith('I wake') ? 'R01.Q1' : 'R01.Q2';
    assert.equal(free(q, bad).status, free(q, ok).status, bad);
  }
});

test('11 — trechos não avaliáveis não são forçados em uma classe', () => {
  // palavra inexistente sem candidata no contexto: marcada como inconclusiva, sem sugestão inventada
  const r = free('R01.Q2', 'I drive for Uber and zorblat rides along the way.');
  const p = r.practice.find((x) => clean(x.heard) === 'zorblat');
  assert.equal(p.ref, null);
  assert.equal(p.category, 'inconclusive');
  assert.match(p.reason, /o contexto não indica uma palavra provável/);
  assert.doesNotMatch(p.reason, /talvez/);
  // nome próprio fora do vocabulário: cinza (não avaliado), nem âmbar nem verde
  const r2 = free('R01.Q2', 'I drive for Uber with Kowalski and accept rides along the way.');
  assert.deepEqual(state(r2, 'kowalski'), ['uncertain']);
  assert.deepEqual(r2.practice, []);
  assertCoherent(r, 'I drive for Uber and zorblat rides along the way.');
});

test('12 — coerência entre estado visual e lógico (casos acima + 101 transcrições reais do Moonshine)', () => {
  const qids = Object.keys(Q).filter((k) => k.startsWith('R01.'));
  const inputs = [
    ['R01.Q2', 'I arrive in my near-ofcy, near my off-scene.'], ['R01.Q2', 'I go to the offsy.'], ['R01.Q2', 'I gets ready and drive for Uber.'],
    ['R01.Q2', 'I drive for Uber and zorblat rides along the way.'], ['R01.Q1', 'I wake up at five thirty in the morning.'],
    ['R01.Q2', 'I go to the offsy and then near the ofcy, by my off-scene.'],
    ...moonshine.map((x, i) => [qids[i % qids.length], x.heard]),
  ];
  let hyp = 0;
  for (const [qid, t] of inputs) {
    const r = free(qid, t);
    assertCoherent(r, t);
    // concordância nunca vira destaque âmbar
    for (const a of agreementIssues(t)) for (const w of wordTokens(a.heard).slice(-1)) assert.ok(!amber(r).includes(w), `${t}: “${w}” âmbar por gramática`);
    if (inputs.indexOf(inputs.find((x) => x[1] === t)) >= 6) hyp += r.hypotheses.length;
  }
  // transcrições reais e corretas do Moonshine não ganham hipóteses de reconhecimento nem erros de concordância
  assert.equal(hyp, 0);
  assert.equal(moonshine.filter((x) => agreementIssues(x.heard).length).length, 0);
});
