// Remodelagem (2026-10-31): ciclo pedagógico único de seis etapas nas duas jornadas, estados de progresso (fonte única),
// vocabulário do CP01 tirado do próprio diálogo, traduções de apoio das perguntas e recuperação no Speaking depois de
// tentativas repetidas (palavra isolada, repetição e calibração temporária).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contentFor } from '../../app/js/engine/characters.js';
import { journeyView } from '../../app/js/engine/journeys.js';
import { STAGES, STATE_LABEL, moduleStatus, trackStatus, stageFilter, stageKeys, moduleItems, moduleOf, moduleSentences } from '../../app/js/engine/modules.js';
import { cardKey } from '../../app/js/engine/scheduler.js';
import { locate } from '../../app/js/engine/exercises.js';
import { applyTranslations, questionPt } from '../../app/js/engine/translations.js';
import { matchIsolatedWord, attemptTracker, calibrate, sentenceVerdict, PERSIST_AFTER } from '../../app/js/engine/practice.js';

const load = (f, name) => { const w = {}; new Function('window', readFileSync(new URL(`../../app/data/${f}`, import.meta.url), 'utf8'))(w); return w[name]; };
const base = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const REG = load('characters.js', 'DRG_CHARACTERS');
const JR = load('journeys.js', 'DRG_JOURNEYS');
const PT = load('translations.js', 'DRG_PT');
globalThis.DRG_CHARACTERS = REG; globalThis.DRG_JOURNEYS = JR;
const karla = contentFor(base, 'karla', REG);
const lk = contentFor(base, 'lucas-kid', REG);
const cp = journeyView(base, 'cp', JR);
const ok = (k) => ({ k, box: 2, due: 1, reps: 2, lapses: 0, streak: 2, last: 1, lastResult: 'good', created: 1 });
const wrong = (k) => ({ k, box: 0, due: 1, reps: 1, lapses: 1, streak: 0, last: 1, lastResult: 'bad', created: 1 });

test('ciclo único: seis etapas na ordem pedagógica, as mesmas no Daily Routine e no Conversation Practice', () => {
  assert.deepEqual(STAGES.map((s) => s.en), ['Vocabulary', 'Collocations, phrasal verbs & expressions', 'Sentence building', 'Listening', 'Speaking', 'Application']);
  for (const [v, id] of [[base, 'R01'], [karla, 'K01'], [lk, 'L01'], [cp, 'CP01'], [cp, 'CP02']]) {
    assert.deepEqual(moduleStatus(v, id, { cards: {} }).stages.map((s) => s.id), ['vocab', 'expr', 'build', 'listen', 'speak', 'apply'], id);
  }
  assert.deepEqual(Object.keys(STATE_LABEL).sort(), ['done', 'locked', 'open', 'progress']);
});

test('palavras × combinações: vocabulário só com palavras; phrasal verbs, collocations e expressões na etapa 2', () => {
  for (const [v, r] of [...base.routines.map((r) => [base, r]), ...karla.routines.map((r) => [karla, r]), ...cp.routines.map((r) => [cp, r])]) {
    for (const it of moduleItems(v, r, 'vocab')) assert.ok(it.c !== 'phrasal' && it.c !== 'sentence', `${r.id}: ${it.en} (${it.c}) na etapa de palavras`);
    for (const it of moduleItems(v, r, 'expr')) assert.ok(!['word', 'verb', 'professional'].includes(it.c), `${r.id}: ${it.en} (${it.c}) na etapa de combinações`);
  }
});

test('CP01: vocabulário compatível com o objetivo — palavras do próprio diálogo, com significado e áudio', () => {
  const r = moduleOf(cp, 'CP01');
  const vocab = moduleItems(cp, r, 'vocab');
  assert.ok(vocab.length >= 10, `só ${vocab.length} palavras`);
  const sents = moduleSentences(cp, r).map((s) => cp.sentences[s]);
  const audio = load('audio-index.js', 'DRG_AUDIO').files;
  for (const it of vocab) {
    assert.ok(it.pt && it.au && audio[it.au], `${it.en}: significado e áudio`);
    assert.ok(it.sentences.some((sid) => sents.some((s) => s.id === sid && locate(it, s.en))), `${it.en} aparece no diálogo do CP01`);
  }
  for (const w of ['team', 'welcome', 'software developer', 'friendly', 'everyone', 'join', 'move', 'club', 'later']) assert.ok(vocab.some((it) => it.en === w), w);
});

test('construção de frases: etapa própria; montar/escrever certo ao menos uma vez conclui (domínio, não perfeição)', () => {
  const r = moduleOf(base, 'R02');
  const K = stageKeys(base, r);
  const cards = {};
  for (const k of [...K.vocab, ...K.expr]) cards[k] = ok(k);
  let m = moduleStatus(base, 'R02', { cards });
  const build = () => m.stages.find((s) => s.id === 'build');
  assert.equal(build().state, 'open');
  const sents = K.build;
  cards[cardKey('sent', sents[0], 'ord')] = ok(cardKey('sent', sents[0], 'ord'));
  m = moduleStatus(base, 'R02', { cards });
  assert.equal(build().state, 'progress', 'começou: em andamento');
  for (const s of sents.slice(0, build().need)) cards[cardKey('sent', s, 'ord')] = ok(cardKey('sent', s, 'ord'));
  cards[cardKey('sent', sents[sents.length - 1], 'wrt')] = wrong(cardKey('sent', sents[sents.length - 1], 'wrt'));
  m = moduleStatus(base, 'R02', { cards });
  assert.equal(build().state, 'done');
  assert.equal(m.next.id, 'listen');
  // filtro da sessão: só montar/escrever frases e ordenar blocos do módulo; Aplicar não inclui mais montar frases
  const f = stageFilter(base, 'R02', 'build');
  assert.ok(f({ unit: 'sent', id: sents[0], skill: 'ord' }) && f({ unit: 'sent', id: sents[0], skill: 'wrt' }));
  assert.ok(!f({ unit: 'item', id: 'x', skill: 'rec' }) && !f({ unit: 'q', id: r.questions[0], skill: 'conv' }));
  assert.ok(!stageFilter(base, 'R02', 'apply')({ unit: 'sent', id: sents[0], skill: 'ord' }));
});

test('progresso preservado: etapa concluída continua concluída mesmo com uma anterior ainda aberta', () => {
  const r = moduleOf(base, 'R03');
  const K = stageKeys(base, r);
  const cards = {};
  for (const k of [...K.vocab, ...K.expr, ...K.listen]) cards[k] = ok(k); // ouvir feito antes de “construção” virar etapa
  const m = moduleStatus(base, 'R03', { cards });
  const st = Object.fromEntries(m.stages.map((s) => [s.id, s.state]));
  assert.equal(st.build, 'open');
  assert.equal(st.listen, 'done', 'não volta a aparecer bloqueada');
  assert.equal(st.speak, 'locked');
  assert.equal(m.state, 'progress');
});

test('fonte única: situação do módulo e da trilha vêm do mesmo cálculo (concluído só com as seis etapas)', () => {
  const t0 = trackStatus(cp, { cards: {} });
  assert.equal(t0.total, cp.routines.length * 6);
  assert.ok(t0.modules.every((m) => m.state === 'open' && !m.complete));
  assert.equal(t0.current.id, 'CP01');
});

test('traduções de apoio: toda pergunta e toda resposta-modelo das duas jornadas têm português', () => {
  const g = { DRG_PT: PT, DRG_CONTENT: base, DRG_CHARACTERS: REG, DRG_JOURNEYS: JR };
  applyTranslations(g);
  const all = [...Object.values(base.questions), ...Object.values(karla.questions), ...Object.values(lk.questions), ...Object.values(cp.questions)];
  assert.ok(all.length >= 180);
  for (const q of all) {
    const t = questionPt(q);
    assert.ok(t.q && t.support, `${q.id}: pergunta sem tradução`);
    if (q.a) assert.ok(t.a, `${q.id}: resposta-modelo sem tradução`);
    else assert.equal(t.a, '', `${q.id}: pergunta aberta não ganha resposta inventada`);
  }
  assert.equal(base.questions['R01.Q1'].q, 'What time do you wake up?', 'o inglês aprovado não muda');
});

test('palavra isolada: repetir 2 ou 3 vezes na mesma gravação vale; outras palavras junto continuam inconclusivas', () => {
  assert.equal(matchIsolatedWord('chores', 'chores').status, 'match');
  assert.deepEqual([matchIsolatedWord('chores', 'Chores, chores.').status, matchIsolatedWord('chores', 'Chores, chores.').reps], ['match', 2]);
  assert.equal(matchIsolatedWord('chores', 'chores chores chores').reps, 3);
  assert.equal(matchIsolatedWord('chores', 'chores chores chores chores').status, 'extra');
  assert.equal(matchIsolatedWord('chores', 'my chores').status, 'extra');
  assert.equal(matchIsolatedWord('chores', 'shores').status, 'mismatch');
  assert.equal(matchIsolatedWord('lunch box', 'lunch box lunch box').status, 'match');
});

test(`recuperação: palavra pendente nas últimas ${PERSIST_AFTER} tentativas é destacada; antes disso, não`, () => {
  const t = attemptTracker();
  t.add(['chores', 'tidy']); t.add(['chores']);
  assert.deepEqual(t.persistent(), []);
  t.add(['chores', 'downstairs']);
  assert.deepEqual(t.persistent(), ['chores']);
  t.add([]);
  assert.deepEqual(t.persistent(), [], 'reconhecida na tentativa mais recente: deixa de ser persistente');
});

test('calibração temporária: só a palavra confirmada isoladamente deixa de contar como erro; o resultado diz a confiabilidade', () => {
  const text = 'I help with the chores';
  const ev = { evaluated: true, words: [{ state: 'good' }, { state: 'good' }, { state: 'good' }, { state: 'good' }, { state: 'needs_practice', heard: 'shores' }] };
  const none = calibrate(ev, text, []);
  assert.equal(none.evaluation.words[4].state, 'needs_practice');
  const c = calibrate(ev, text, ['chores']);
  assert.deepEqual(c.calibrated, ['chores']);
  assert.equal(c.evaluation.words[4].state, 'uncertain');
  assert.ok(/não como erro/.test(c.evaluation.words[4].reason));
  assert.equal(ev.words[4].state, 'needs_practice', 'a avaliação original não é alterada');
  assert.equal(sentenceVerdict({ pending: [], calibrated: [] }).reliability, 'high');
  assert.equal(sentenceVerdict({ pending: [], calibrated: ['chores'] }).reliability, 'qualified');
  assert.equal(sentenceVerdict({ pending: ['chores'], calibrated: [], persistent: ['chores'] }).reliability, 'inconclusive');
  assert.equal(sentenceVerdict({ pending: ['chores'], calibrated: [], persistent: [] }).reliability, 'partial');
});
