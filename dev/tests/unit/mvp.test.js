// Arquitetura de jornadas (MVP): progresso por perfil, migração do progresso único, personas previstas,
// módulos com cinco etapas e cadeados, sessões por etapa e o exercício de ouvir frases.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { freshState, migrate, recordAnswer, recordRecording } from '../../app/js/engine/progress.js';
import { activate, toStored, progressOf, makeOwnerOf, journeyProfile, profileIdFor, PROGRESS_KEYS } from '../../app/js/engine/profiles.js';
import { contentFor, registry, isPlanned } from '../../app/js/engine/characters.js';
import { journeyView, unitStatus } from '../../app/js/engine/journeys.js';
import { STAGES, moduleStatus, trackStatus, stageFilter, stageOpen, stageKeys, moduleItems, moduleOf } from '../../app/js/engine/modules.js';
import { buildSession, cardKey } from '../../app/js/engine/scheduler.js';
import { makeExercise } from '../../app/js/engine/exercises.js';

const load = (f, name) => { const w = {}; new Function('window', readFileSync(new URL(`../../app/data/${f}`, import.meta.url), 'utf8'))(w); return w[name]; };
const base = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const REG = load('characters.js', 'DRG_CHARACTERS');
const JR = load('journeys.js', 'DRG_JOURNEYS');
globalThis.DRG_CHARACTERS = REG; globalThis.DRG_JOURNEYS = JR;
const karla = contentFor(base, 'karla', REG);
const cp = journeyView(base, 'cp', JR);
const views = [{ profile: 'lucas', content: base }, { profile: 'karla', content: karla }, { profile: 'lucas-kid', content: contentFor(base, 'lucas-kid', REG) }, { profile: 'heitor', content: null }, { profile: journeyProfile('cp'), content: cp }];
const ownerOf = makeOwnerOf(views);
const card = (k, extra = {}) => ({ k, box: 2, due: 1, reps: 2, lapses: 0, streak: 2, last: 1, lastResult: 'good', created: 1, ...extra });

test('perfis: persona e jornada têm progresso separado; trocar não apaga nem mistura', () => {
  const st = freshState(base.version);
  recordAnswer(st, cardKey('sent', 'R01-B1-S1', 'ord'), 'good', { today: 100 });
  const lucasXp = st.xp;
  activate(st, 'karla', 100);
  assert.deepEqual(Object.keys(st.cards), [], 'Karla começa sem os cartões do Lucas');
  assert.equal(st.xp, 0);
  recordAnswer(st, cardKey('sent', 'K01-B1-S1', 'ord'), 'good', { today: 100 });
  activate(st, journeyProfile('cp'), 100);
  recordAnswer(st, cardKey('lq', 'CP.L1', 'lis'), 'good', { today: 100 });
  activate(st, 'lucas', 100);
  assert.deepEqual(Object.keys(st.cards), ['sent:R01-B1-S1:ord']);
  assert.equal(st.xp, lucasXp);
  assert.deepEqual(Object.keys(progressOf(st, 'karla').cards), ['sent:K01-B1-S1:ord']);
  assert.deepEqual(Object.keys(progressOf(st, 'journey:cp').cards), ['lq:CP.L1:lis']);
  assert.equal(profileIdFor('karla', 'cp'), 'journey:cp');
  assert.equal(profileIdFor('karla', null), 'karla');
});

test('perfis: o item genérico compartilhado não gera domínio na outra persona', () => {
  const shared = Object.keys(karla.items).find((id) => id.startsWith('it.') && base.items[id]);
  assert.ok(shared, 'há item compartilhado');
  const st = freshState(base.version);
  for (let i = 0; i < 4; i++) recordAnswer(st, cardKey('item', shared, 'rec'), 'good', { today: 100 + i });
  activate(st, 'karla', 104);
  assert.equal(st.cards[cardKey('item', shared, 'rec')], undefined);
});

test('gravação: só o topo do perfil ativo é devolvido; nada duplicado; ida e volta preserva tudo', () => {
  const st = freshState(base.version);
  recordAnswer(st, cardKey('sent', 'R01-B1-S1', 'ord'), 'good', { today: 100 });
  recordRecording(st, 'sent:R01-B1-S1', { ms: 900 }, 100);
  st.settings.character = 'karla'; // como App.setCharacter
  activate(st, 'karla', 100);
  recordAnswer(st, cardKey('sent', 'K01-B1-S1', 'ord'), 'good', { today: 100 });
  const stored = JSON.parse(JSON.stringify(toStored(st)));
  for (const k of PROGRESS_KEYS) assert.ok(!(k in stored), `${k} não fica no topo gravado`);
  const back = migrate(stored, base.version);
  assert.equal(back.activeProfile, 'karla');
  assert.deepEqual(Object.keys(back.cards), ['sent:K01-B1-S1:ord']);
  assert.ok(back.profiles.lucas.recordingsMeta['sent:R01-B1-S1']);
  assert.equal(back.profiles.lucas.xp, st.profiles.lucas.xp);
});

test('migração do progresso único (esquema 1): cada cartão vai para o dono; XP total e histórico preservados', () => {
  const legacy = {
    schema: 1, contentVersion: 'old', welcomed: true, xp: 777, firstDay: 90, days: { 100: { xp: 40, ex: 6, sessions: 1 } }, achievements: { 'first-session': 1 },
    settings: { character: 'karla', characterChosen: true, journey: 'cp' }, userVariants: { a: 1 },
    cards: { 'item:it.wake-up:rec': card('item:it.wake-up:rec'), 'sent:R01-B1-S1:ord': card('sent:R01-B1-S1:ord'), 'sent:K01-B1-S1:ord': card('sent:K01-B1-S1:ord'),
      'lq:CP.L1:lis': card('lq:CP.L1:lis'), 'item:cp.actually:rec': card('item:cp.actually:rec') },
    log: [{ t: 1, k: 'sent:K01-B1-S1:ord', o: 'good' }, { t: 2, k: 'lq:CP.L1:lis', o: 'good' }, { t: 3, k: 'item:it.wake-up:rec', o: 'good' }],
    myAnswers: { 'K.Q1': { text: 'a' }, 'G.Q01': { text: 'b' } }, recordingsMeta: { 'sent:K01-B1-S1': { at: 1 }, 'q:G.Q01': { at: 2 } },
    pending: [{ key: 'q:K.Q1:conv', status: 'claimed' }], checklist: {},
  };
  const s = migrate(JSON.parse(JSON.stringify(legacy)), base.version, { ownerOf });
  assert.equal(s.schema, 2);
  assert.equal(s.activeProfile, 'journey:cp', 'continua na jornada aberta');
  const p = (id) => progressOf(s, id);
  assert.deepEqual(Object.keys(p('lucas').cards).sort(), ['item:it.wake-up:rec', 'sent:R01-B1-S1:ord']);
  assert.deepEqual(Object.keys(p('karla').cards), ['sent:K01-B1-S1:ord']);
  assert.deepEqual(Object.keys(p('journey:cp').cards).sort(), ['item:cp.actually:rec', 'lq:CP.L1:lis']);
  const totalCards = ['lucas', 'karla', 'journey:cp'].reduce((n, id) => n + Object.keys(p(id).cards).length, 0);
  assert.equal(totalCards, Object.keys(legacy.cards).length, 'nenhum cartão perdido');
  assert.equal(p('lucas').xp, 777, 'XP total preservado (fica com o Lucas)');
  assert.deepEqual([p('lucas').days, p('lucas').achievements], [legacy.days, legacy.achievements]);
  assert.deepEqual(Object.keys(p('karla').myAnswers), ['K.Q1']);
  assert.deepEqual(Object.keys(p('lucas').myAnswers), ['G.Q01']);
  assert.deepEqual(Object.keys(p('karla').recordingsMeta), ['sent:K01-B1-S1']);
  assert.equal(p('karla').pending.length, 1);
  assert.equal(p('lucas').log.length + p('karla').log.length + p('journey:cp').log.length, 3);
  assert.deepEqual([s.welcomed, s.userVariants, s.settings.character], [true, { a: 1 }, 'karla']);
});

test('personas previstas: cadastradas sem conteúdo; visão vazia, nunca o conteúdo de outra persona', () => {
  const planned = registry(REG).characters.filter(isPlanned).map((c) => c.id);
  assert.deepEqual(planned, ['heitor']); // o Lukinhas (lucas-kid) ganhou pacote próprio
  for (const id of planned) {
    const v = contentFor(base, id, REG);
    assert.notEqual(v, base);
    assert.deepEqual([v.routines.length, Object.keys(v.items).length, Object.keys(v.questions).length], [0, 0, 0]);
    assert.deepEqual(trackStatus(v, { cards: {} }).total, 0);
  }
  assert.equal(registry(REG).characters.find((c) => c.id === 'lucas-kid').age, 11);
  assert.equal(registry(REG).characters.find((c) => c.id === 'heitor').age, 7, 'idade do Heitor: a informada pelo responsável (2026-10-31), nunca inventada');
});

test('módulos: as seis etapas do ciclo único, na ordem, nas duas jornadas; só a primeira começa aberta', () => {
  for (const [v, id] of [[base, 'R01'], [karla, 'K01'], [cp, 'CP01']]) {
    const m = moduleStatus(v, id, { cards: {}, recordingsMeta: {} });
    assert.deepEqual(m.stages.map((s) => s.id), ['vocab', 'expr', 'build', 'listen', 'speak', 'apply']);
    assert.deepEqual(m.stages.map((s) => s.state), ['open', 'locked', 'locked', 'locked', 'locked', 'locked'], id);
    assert.equal(m.next.id, 'vocab');
  }
  assert.equal(STAGES.length, 6);
});

test('cadeados: concluir abre a próxima; não exige perfeição; um erro depois não fecha de novo', () => {
  const r = moduleOf(base, 'R01');
  const vocab = moduleItems(base, r, 'vocab');
  const cards = {};
  const need = Math.ceil(vocab.length * 0.8);
  for (const it of vocab.slice(0, need - 1)) cards[cardKey('item', it.id, 'rec')] = card(cardKey('item', it.id, 'rec'));
  assert.equal(moduleStatus(base, 'R01', { cards }).stages[1].state, 'locked', 'abaixo do mínimo continua bloqueada');
  const k = cardKey('item', vocab[need - 1].id, 'rec');
  cards[k] = card(k);
  let m = moduleStatus(base, 'R01', { cards });
  assert.deepEqual([m.stages[0].state, m.stages[1].state, m.stages[2].state], ['done', 'open', 'locked']);
  cards[k] = { ...cards[k], box: 0, reps: 3, lapses: 1, lastResult: 'bad' }; // errou depois de ter acertado
  m = moduleStatus(base, 'R01', { cards });
  assert.equal(m.stages[0].state, 'done');
  // abrir não conclui: um cartão só com erro não conta
  const k2 = cardKey('item', vocab[0].id, 'rec');
  const only = { [k2]: { ...card(k2), box: 0, reps: 1, lapses: 1, lastResult: 'bad' } };
  assert.equal(moduleStatus(base, 'R01', { cards: only }).stages[0].done, 0);
});

test('sessão por etapa: só o conteúdo e as habilidades da etapa; etapa bloqueada não abre', () => {
  const st = freshState(base.version);
  assert.equal(stageOpen(base, 'R01', 'expr', st), false);
  const q = buildSession(base, st.cards, { focus: { routine: 'R01', stage: 'vocab' }, size: 12, today: 100, filter: stageFilter(base, 'R01', 'vocab') });
  const vocabIds = new Set(moduleItems(base, moduleOf(base, 'R01'), 'vocab').map((i) => i.id));
  assert.ok(q.length > 0);
  assert.ok(q.every((e) => e.unit === 'item' && vocabIds.has(e.id) && ['rec', 'rcl'].includes(e.skill)), JSON.stringify(q.map((e) => e.k)));
  // a sessão do dia (sem etapa) continua igual: nada de “ouvir frase”
  const day = buildSession(base, st.cards, { size: 12, today: 100 });
  assert.ok(!day.some((e) => e.skill === 'lis'));
});

test('ouvir e entender: frase do módulo pelo som, texto só depois; alternativas do mesmo módulo', () => {
  const st = freshState(base.version);
  const q = buildSession(base, st.cards, { focus: { routine: 'R01', stage: 'listen' }, size: 8, today: 100, filter: stageFilter(base, 'R01', 'listen') });
  assert.ok(q.length && q.every((e) => e.unit === 'sent' && e.skill === 'lis'));
  const ex = makeExercise(base, q[0], () => 0.3);
  assert.equal(ex.type, 'listen');
  const s = base.sentences[q[0].id];
  assert.equal(ex.clips[0].key, s.au);
  assert.equal(ex.options.filter((o) => o.correct).length, 1);
  assert.equal(ex.options.find((o) => o.correct).text, s.en);
  assert.ok(ex.options.every((o) => Object.values(base.sentences).some((x) => x.en === o.text && x.routine === 'R01')));
  // jornada: os trechos de diálogo (lq) continuam sendo o “ouvir”
  const cq = buildSession(cp, {}, { focus: { routine: 'CP01', stage: 'listen' }, size: 8, today: 100, filter: stageFilter(cp, 'CP01', 'listen') });
  const started = Object.fromEntries(moduleOf(cp, 'CP01').items.slice(0, 1).map((i) => [cardKey('item', i, 'rec'), card(cardKey('item', i, 'rec'))]));
  const cq2 = buildSession(cp, started, { focus: { routine: 'CP01', stage: 'listen' }, size: 8, today: 100, filter: stageFilter(cp, 'CP01', 'listen') });
  assert.equal(cq.length, 0, 'ouvir abre depois que a unidade começou');
  assert.ok(cq2.length && cq2.every((e) => e.unit === 'lq'));
});

test('aplicar e conversar: inclui perguntas abertas de transferência nas rotinas; jornada concluída = unidade concluída', () => {
  const r = moduleOf(base, 'R01');
  const K = stageKeys(base, r);
  const f = stageFilter(base, 'R01', 'apply');
  for (const k of K.transfer) assert.ok(f({ unit: 'q', id: k.split(':')[1], skill: 'conv' }));
  // CP01: com tudo feito, as cinco etapas e a situação antiga da unidade concordam
  const cards = {}, recs = {};
  const c = moduleOf(cp, 'CP01');
  for (const it of c.items) cards[cardKey('item', it, 'rec')] = card(cardKey('item', it, 'rec'));
  for (const id of c.listening) cards[cardKey('lq', id, 'lis')] = card(cardKey('lq', id, 'lis'));
  for (const id of c.reading) cards[cardKey('rq', id, 'rdq')] = card(cardKey('rq', id, 'rdq'));
  for (const id of c.questions) cards[cardKey('q', id, 'conv')] = card(cardKey('q', id, 'conv'));
  for (const b of c.blocks) for (const s of cp.blocks[b].sentences) cards[cardKey('sent', s, 'ord')] = card(cardKey('sent', s, 'ord'));
  for (const t of stageKeys(cp, c).speak.slice(0, 3)) recs[t] = { at: 1 };
  assert.equal(moduleStatus(cp, 'CP01', { cards, recordingsMeta: recs }).complete, true);
  assert.equal(unitStatus(cp, 'CP01', cards).complete, true);
});
