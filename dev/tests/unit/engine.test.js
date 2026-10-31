import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { grade, newCard, buildSession, unlockedNew, cardKey, INTERVALS } from '../../app/js/engine/scheduler.js';
import { freshState, recordAnswer, recordSession, recordRecording, streak, migrate, levelForXp } from '../../app/js/engine/progress.js';
import { makeExercise, locate, orderPieces, makePairs } from '../../app/js/engine/exercises.js';
import { tokenSpans, wordTokens } from '../../app/js/engine/text.js';

const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const T = 20000;

test('Leitner: acerto sobe de caixa; erro volta à caixa 0 e vence hoje', () => {
  let c = newCard('item:x:rec', T);
  c = grade(c, 'good', T); assert.equal(c.box, 1); assert.equal(c.due, T + INTERVALS[1]);
  c = grade(c, 'good', T + 1); assert.equal(c.box, 2); assert.equal(c.due, T + 1 + INTERVALS[2]);
  c = grade(c, 'bad', T + 4); assert.equal(c.box, 0); assert.equal(c.due, T + 4); assert.equal(c.lapses, 1);
  c = grade(c, 'good', T + 4); assert.equal(c.box, 1); assert.equal(c.due, T + 5, 'após o erro, reaparece no dia seguinte');
  c = grade(c, 'ok', T + 5); assert.equal(c.box, 1); assert.equal(c.due, T + 6);
});

test('Sessão inicial: começa pela Rotina 1 com itens novos e tamanho limitado', () => {
  const q = buildSession(content, {}, { today: T, rand: seeded(7) });
  assert.ok(q.length > 0 && q.length <= 12);
  const learn = q.filter((x) => x.learn);
  assert.ok(learn.length >= 1 && learn.length <= 6);
  const r1Items = new Set(content.routines[0].items);
  assert.ok(learn.every((x) => r1Items.has(x.id)), 'itens novos devem vir da R01');
});

test('Desbloqueio progressivo: recuperação só depois de reconhecer (caixa ≥ 2)', () => {
  const id = 'it.wake-up';
  const cards = { [cardKey('item', id, 'rec')]: { ...newCard(cardKey('item', id, 'rec'), T), box: 1 } };
  assert.ok(!unlockedNew(content, cards, {}).some((u) => u.k === cardKey('item', id, 'rcl')));
  cards[cardKey('item', id, 'rec')].box = 2;
  assert.ok(unlockedNew(content, cards, {}).some((u) => u.k === cardKey('item', id, 'rcl')));
});

test('Erros reaparecem: cartão errado entra na próxima sessão do mesmo dia', () => {
  const state = freshState('1');
  const k = cardKey('item', 'it.heat-up', 'rec');
  recordAnswer(state, k, 'bad', { today: T });
  const q = buildSession(content, state.cards, { today: T, rand: seeded(3) });
  assert.ok(q.some((x) => x.k === k));
});

test('XP: o mesmo cartão rende no máximo 2 vezes por dia; erro rende esforço uma vez', () => {
  const state = freshState('1');
  const k = cardKey('item', 'it.heat-up', 'rec');
  const gains = [1, 2, 3, 4, 5].map(() => recordAnswer(state, k, 'good', { today: T }).xp);
  assert.ok(gains[0] > 0 && gains[1] > 0);
  assert.deepEqual(gains.slice(2), [0, 0, 0]);
  const k2 = cardKey('item', 'it.tidy-up', 'rec');
  assert.equal(recordAnswer(state, k2, 'bad', { today: T }).xp, 2);
  assert.equal(recordAnswer(state, k2, 'bad', { today: T }).xp, 0);
  assert.equal(state.xp, gains.reduce((a, b) => a + b, 0) + 2);
  // dia seguinte volta a render
  assert.ok(recordAnswer(state, k, 'good', { today: T + 1 }).xp > 0);
});

test('XP de sessão e de gravação têm teto diário', () => {
  const state = freshState('1');
  const xs = [1, 2, 3, 4].map(() => recordSession(state, { count: 10, bad: 0 }, T).xp);
  assert.deepEqual(xs, [20, 20, 20, 0]);
  const r1 = recordRecording(state, 'S1', {}, T).xp, r2 = recordRecording(state, 'S1', {}, T).xp;
  assert.equal(r1, 5); assert.equal(r2, 0);
  assert.equal(recordSession(state, { count: 3, bad: 0 }, T + 1).xp, 0, 'sessão muito curta não pontua');
});

test('Sequência de dias com folga semanal', () => {
  const state = freshState('1');
  state.firstDay = T - 30;
  const study = (n) => { state.days[n] = { xp: 0, ex: 6, sessions: 1, rec: 0, rewarded: {}, effort: {} }; };
  [T - 4, T - 3, T - 1, T].forEach(study); // falta em T-2
  assert.equal(streak(state, T).days, 4);
  delete state.days[T];
  assert.equal(streak(state, T).days, 3, 'hoje ainda sem estudo não quebra');
  state.days = {}; [T - 4, T - 3, T - 2].forEach(study); // T-1 folga, T ainda não conta
  assert.equal(streak(state, T).days, 3);
  state.days = {}; [T - 5, T - 4, T - 2].forEach(study); // duas faltas na mesma semana (T-3 e T-1) -> só conta T-2
  assert.equal(streak(state, T).days, 1);
  state.days = {}; [T - 6, T - 3].forEach(study); // faltas T-5, T-4 seguidas -> quebra
  assert.equal(streak(state, T - 3).days, 1);
});

test('Níveis por XP', () => {
  assert.equal(levelForXp(0).level, 1);
  assert.equal(levelForXp(99).level, 1);
  assert.equal(levelForXp(100).level, 2);
  assert.equal(levelForXp(300).level, 3);
});

test('Migração: recupera estado parcial/corrompido e recusa esquema futuro', () => {
  const s = migrate({ schema: 1, cards: { a: { box: 2, due: 5 }, b: null, c: { box: 'x' } }, log: 'x', xp: -3, days: { 1: { xp: 7 } } }, '1');
  assert.deepEqual(Object.keys(s.cards), ['a']);
  assert.deepEqual(s.log, []);
  assert.equal(s.xp, 7);
  assert.ok(s.settings.dailyGoal);
  assert.throws(() => migrate({ schema: 99 }, '1'));
  assert.throws(() => migrate(null, '1'));
  assert.throws(() => migrate({ foo: 1 }, '1'));
});

test('Exercícios: todas as unidades geram exercício válido', () => {
  const rand = seeded(11);
  let n = 0;
  for (const it of Object.values(content.items)) {
    if (it.tags.includes('grammar-model')) continue;
    for (const skill of ['rec', 'rcl', 'bld']) {
      if (skill === 'bld' && !it.sentences.length) continue;
      const ex = makeExercise(content, { unit: 'item', id: it.id, skill, k: `item:${it.id}:${skill}` }, rand);
      assert.ok(ex.type); n++;
      if (ex.type === 'mc') { assert.equal(ex.options.length, 4); assert.equal(ex.options.filter((o) => o.correct).length, 1); assert.equal(new Set(ex.options.map((o) => o.pt)).size, 4); }
      if (ex.type === 'cloze') assert.ok(ex.target.length > 0 && (ex.before + ex.target + ex.after) === ex.sentence.en);
    }
  }
  for (const s of Object.values(content.sentences)) for (const skill of ['ord', 'wrt']) { makeExercise(content, { unit: 'sent', id: s.id, skill, k: '' }, rand); n++; }
  for (const b of Object.values(content.blocks)) for (const skill of ['seq', 'tell']) { makeExercise(content, { unit: 'block', id: b.id, skill, k: '' }, rand); n++; }
  for (const r of content.routines) { const ex = makeExercise(content, { unit: 'routine', id: r.id, skill: 'retell', k: '' }, rand); assert.equal(ex.blocks.length, r.blocks.length); n++; }
  for (const q of Object.values(content.questions)) { makeExercise(content, { unit: 'q', id: q.id, skill: 'conv', k: '' }, rand); n++; }
  for (const v of content.verbs) { makeExercise(content, { unit: 'verb', id: v.id, skill: 'vb3', k: '' }, rand); n++; }
  assert.ok(n > 900, `${n} exercícios gerados`);
});

test('Peças de ordenação reconstituem a frase', () => {
  for (const s of Object.values(content.sentences)) {
    const p = orderPieces(s.en);
    assert.equal(p.join(' '), s.en.split(/\s+/).join(' '));
    assert.ok(p.length <= 12, `${s.id} tem ${p.length} peças`);
  }
});

test('Localização de itens e spans alinhados com os tokens', () => {
  const it = content.items['it.put-away'];
  const loc = locate(it, 'I put them away.');
  assert.equal(loc.target, 'put them away');
  for (const s of Object.values(content.sentences)) assert.equal(tokenSpans(s.en).length, wordTokens(s.en).length, s.id);
});

test('Pares: 4 itens distintos', () => {
  const ids = ['it.wake-up', 'it.take-a-shower', 'it.heat-up', 'it.tidy-up'];
  const ex = makePairs(content, { group: ids.map((id) => ({ id })) }, seeded(5));
  assert.equal(ex.left.length, 4); assert.equal(ex.right.length, 4);
});

test('Progressão simulada na Rotina 1 (60 dias, 2 sessões curtas/dia, 85% de acertos): todos os níveis são alcançados em ordem', () => {
  const state = freshState('1');
  const rand = seeded(42);
  const firstDay = {};
  let day = T;
  for (; day < T + 60; day++) {
    for (let session = 0; session < 2; session++) { // duas sessões curtas por dia
      const q = buildSession(content, state.cards, { today: day, rand, focus: { routine: 'R01' } });
      for (const e of q) {
        const outcome = rand() < 0.85 ? 'good' : 'bad';
        recordAnswer(state, e.k, outcome, { today: day });
        const skill = e.k.split(':')[2];
        if (!(skill in firstDay)) firstDay[skill] = day - T;
      }
    }
  }
  const backlog = Object.values(state.cards).filter((c) => c.due <= day).length;
  for (const s of ['rec', 'rcl', 'bld', 'ord', 'wrt', 'seq', 'tell', 'retell', 'conv']) assert.ok(s in firstDay, `habilidade ${s} nunca apareceu: ${JSON.stringify(firstDay)}`);
  assert.ok(firstDay.rec <= firstDay.rcl && firstDay.rcl <= firstDay.bld, `ordem: ${JSON.stringify(firstDay)}`);
  assert.ok(firstDay.ord <= firstDay.wrt && firstDay.ord <= firstDay.seq && firstDay.seq <= firstDay.tell, `ordem frases/blocos: ${JSON.stringify(firstDay)}`);
  const r1Seen = content.routines[0].items.filter((i) => state.cards[cardKey('item', i, 'rec')]).length;
  assert.ok(r1Seen / content.routines[0].items.length > 0.9, `R01 vista: ${r1Seen}/${content.routines[0].items.length}`);
  console.log('primeiro dia de cada habilidade:', JSON.stringify(firstDay), '· itens R01 vistos:', r1Seen, '/', content.routines[0].items.length, '· revisões acumuladas no dia 60:', backlog);
});
