// Daily Routine do Lukinhas (personagem fixo “lucas-kid”, 11 anos): dez sessões com os textos definitivos, traduções,
// expressões interativas, progressão cumulativa, inglês britânico, perguntas de produção e o exercício “mais natural”.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contentFor, registry, isPlanned } from '../../app/js/engine/characters.js';
import { moduleStatus, stageFilter, moduleItems, moduleOf } from '../../app/js/engine/modules.js';
import { buildSession, unlockedNew, cardKey } from '../../app/js/engine/scheduler.js';
import { makeExercise, locate } from '../../app/js/engine/exercises.js';
import { createChecker } from '../../app/js/engine/checker.js';
import { evaluateWords } from '../../app/js/engine/wordfeedback.js';

const load = (f, name) => { const w = {}; new Function('window', readFileSync(new URL(`../../app/data/${f}`, import.meta.url), 'utf8'))(w); return w[name]; };
const base = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const REG = load('characters.js', 'DRG_CHARACTERS');
const AUDIO = load('audio-index.js', 'DRG_AUDIO');
const TEXTS = JSON.parse(readFileSync(new URL('../fixtures/lukinhas-texts.json', import.meta.url))).texts;
const lk = contentFor(base, 'lucas-kid', REG);
const IDS = ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09', 'L10'];
const sentencesOf = (r) => r.blocks.flatMap((b) => lk.blocks[b].sentences.map((s) => lk.sentences[s]));
const card = (k, extra = {}) => ({ k, box: 1, due: 999, reps: 1, lapses: 0, streak: 1, last: 1, lastResult: 'good', created: 1, ...extra });

test('Lukinhas é o personagem fixo “lucas-kid” (nome de exibição), sem perfil novo nem identidade duplicada', () => {
  const chars = registry(REG).characters;
  assert.deepEqual(chars.map((c) => c.id), ['lucas', 'karla', 'lucas-kid', 'heitor']);
  const c = chars.find((x) => x.id === 'lucas-kid');
  assert.deepEqual([c.name, c.age, c.status, isPlanned(c)], ['Lukinhas', 11, 'active', false]);
  assert.equal(chars.filter((x) => /Lukinhas/.test(x.name)).length, 1);
  assert.ok(!chars.some((x) => /Lucas \(11/.test(x.name)), 'o nome antigo saiu');
  assert.notEqual(lk, base, 'conteúdo próprio, nunca o do Lucas adulto');
});

test('dez sessões na ordem, com título, foco, nível, objetivo e vocabulário prioritário aprovados', () => {
  assert.deepEqual(lk.routines.map((r) => r.id), IDS);
  const titles = ['My Morning Routine', 'Getting Ready for the Day', 'Looking After My Dog', 'Helping Around the House', "It's Jiu-Jitsu Time!",
    'Back Home and Ready to Relax', 'My Morning, Step by Step', 'A Typical Day at Home', 'Keeping My Morning Organised', 'My Daily Routine: The Full Story'];
  assert.deepEqual(lk.routines.map((r) => r.title), titles);
  lk.routines.forEach((r, i) => {
    assert.equal(r.kind, 'session');
    assert.equal(r.session.n, i + 1);
    assert.ok(r.session.focus && r.session.level && r.goal && r.grammar, r.id);
    assert.equal(r.session.vocab.length, r.session.vocabIds.length);
  });
  assert.equal(lk.routines[0].session.level, 'Beginner — Foundation');
  assert.equal(lk.routines[9].session.focus, 'Full storytelling, integration and independent speaking');
});

test('os dez textos estão completos e idênticos aos aprovados (nenhuma correção foi necessária)', () => {
  for (const id of IDS) {
    const r = moduleOf(lk, id);
    assert.equal(sentencesOf(r).map((s) => s.en).join(' '), TEXTS[id], id);
  }
});

test('traduções: uma por frase, em português, mantendo os horários', () => {
  const all = IDS.flatMap((id) => sentencesOf(moduleOf(lk, id)));
  assert.equal(all.length, 66);
  for (const s of all) { assert.ok(s.pt && s.pt !== s.en && /[ãáéíóúçêâô]|\b(eu|o|a|de|para|com|por|no|na|e|um|uma|meu|minha)\b/i.test(s.pt), s.en); assert.ok(s.facts.length, `${s.id} sem fato`); }
  const times = [[/twenty to ten/, /nove e quarenta/], [/half past eleven/, /onze e meia/], [/twelve forty/, /meio-dia e quarenta/], [/eleven o'clock|at eleven\b/, /onze/]];
  for (const s of all) for (const [en, pt] of times) if (en.test(s.en)) assert.match(s.pt, pt, s.en);
});

test('expressões: cada uma do vocabulário prioritário está no texto da sua sessão, com significado, explicação, exemplo e tradução', () => {
  for (const r of lk.routines) {
    const sents = sentencesOf(r);
    for (const id of r.session.vocabIds) {
      const it = lk.items[id];
      assert.ok(it && it.pt && it.explain && it.extra && it.extra.en && it.extra.pt && it.extra.au && it.au, id);
      assert.ok(sents.some((s) => s.items.includes(id) && locate(it, s.en)), `${r.id}: ${it.en} não localizada`);
    }
  }
});

test('progressão cumulativa: expressões de sessões anteriores voltam ligadas nas seguintes; a sessão 10 retoma várias', () => {
  const intro = new Map();
  for (const r of lk.routines) for (const id of r.session.vocabIds) if (!intro.has(id)) intro.set(id, r.id);
  const s10 = new Set(sentencesOf(moduleOf(lk, 'L10')).flatMap((s) => s.items));
  const fromBefore = [...s10].filter((id) => intro.get(id) && intro.get(id) !== 'L10');
  assert.ok(fromBefore.length >= 8, `retomadas na L10: ${fromBefore.length}`);
  // nenhuma frase liga expressão que só será apresentada depois
  lk.routines.forEach((r, i) => { for (const s of sentencesOf(r)) for (const id of s.items) assert.ok(IDS.indexOf(intro.get(id)) <= i, `${s.id} antecipa ${id}`); });
});

test('inglês britânico e rotina informada: rubbish, lead, minibus; sem dias da semana para o treino; só os horários informados', () => {
  const en = IDS.map((id) => TEXTS[id]).join(' ') + ' ' + Object.values(lk.items).map((i) => i.extra.en).join(' ') + ' ' + Object.values(lk.questions).map((q) => `${q.q} ${q.a}`).join(' ');
  for (const w of ['rubbish', 'lead', 'minibus', 'holiday', 'trainers']) assert.ok(new RegExp(`\\b${w}\\b`, 'i').test(en), w);
  for (const w of ['garbage', 'trash', 'leash', 'vacation', 'sneakers']) assert.ok(!new RegExp(`\\b${w}\\b`, 'i').test(en), w);
  for (const d of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday']) assert.ok(!en.includes(d), d);
  const clock = en.match(/\b(twenty to ten|half past eleven|eleven(?: o'clock)?|twelve forty)\b/g) || [];
  assert.ok(clock.length >= 10);
  assert.ok(!/\b(half past twelve|nine o'clock|ten o'clock)\b/.test(TEXTS.L01 + TEXTS.L05 + TEXTS.L10));
});

test('produção independente: cada sessão termina com uma pergunta aberta sem leitura, além de perguntas com resposta-modelo do texto', () => {
  for (const r of lk.routines) {
    const qs = r.questions.map((id) => lk.questions[id]);
    const open = qs.filter((q) => q.openPersonal);
    assert.equal(open.length, 1, r.id);
    assert.match(open[0].q, /without reading the text/);
    assert.ok(open[0].hint && !open[0].a);
    assert.ok(qs.filter((q) => !q.openPersonal && q.a).length >= 2, r.id);
  }
  assert.equal(lk.questions['L.Q3'].q, 'Now, tell me about your morning without reading the text.');
});

test('seis etapas por sessão (ciclo único); a sessão de expressões inclui “mais natural” e a de ouvir reconhece frases da sessão', () => {
  const m = moduleStatus(lk, 'L06', { cards: {}, recordingsMeta: {} });
  assert.deepEqual(m.stages.map((s) => s.id), ['vocab', 'expr', 'build', 'listen', 'speak', 'apply']);
  const r = moduleOf(lk, 'L06');
  const expr = moduleItems(lk, r, 'expr');
  const cards = Object.fromEntries(expr.map((it) => [cardKey('item', it.id, 'rec'), card(cardKey('item', it.id, 'rec'))]));
  const fresh = unlockedNew(lk, cards, { routine: 'L06', stage: 'expr' }).filter(stageFilter(lk, 'L06', 'expr'));
  const nat = fresh.filter((e) => e.skill === 'nat');
  assert.ok(nat.length >= 3, JSON.stringify(fresh.map((e) => e.k)));
  const ex = makeExercise(lk, nat[0], () => 0.3);
  const it = lk.items[nat[0].id];
  assert.equal(ex.type, 'nat');
  assert.equal(ex.plain, it.plain);
  assert.equal(ex.options.filter((o) => o.correct).length, 1);
  assert.equal(ex.options.find((o) => o.correct).text, it.en);
  assert.ok(!(ex.before + ex.plain + ex.after).includes(locate(it, ex.sentence.en).target) || it.plain.includes(locate(it, ex.sentence.en).target), 'a expressão não aparece na frase do enunciado');
  const lis = buildSession(lk, {}, { focus: { routine: 'L01', stage: 'listen' }, size: 8, today: 100, filter: stageFilter(lk, 'L01', 'listen') });
  assert.ok(lis.length && lis.every((e) => e.unit === 'sent' && e.skill === 'lis'));
});

test('exercício “mais natural” só existe onde há forma simples (Lucas e Karla não mudam)', () => {
  const karla = contentFor(base, 'karla', REG);
  for (const v of [base, karla]) {
    const all = Object.fromEntries(Object.values(v.items).map((it) => [cardKey('item', it.id, 'rec'), card(cardKey('item', it.id, 'rec'), { box: 3 })]));
    assert.ok(!unlockedNew(v, all, {}).some((e) => e.skill === 'nat'));
  }
});

test('o corretor aceita as respostas-modelo e o texto integral (respostas por escrito na etapa Aplicar)', () => {
  const ck = createChecker(lk.language);
  for (const q of Object.values(lk.questions).filter((x) => x.a)) assert.equal(ck.check(q.a, [q.a]).cls, 'correct', q.id);
});

test('áudio britânico local para frases, expressões e exemplos do Lukinhas', () => {
  const missing = [];
  for (const s of Object.values(lk.sentences)) if (!AUDIO.files[s.au]) missing.push(s.id);
  for (const it of Object.values(lk.items)) { if (!AUDIO.files[it.au]) missing.push(it.id); if (!AUDIO.files[it.extra.au]) missing.push(`${it.id}:exemplo`); }
  assert.deepEqual(missing, []);
});

test('Speaking Lab (leitura): a comparação com a transcrição local funciona nas frases do Lukinhas — verde, âmbar e cinza; nunca “pronúncia correta”', () => {
  const s = lk.sentences['L01-B1-S3']; // I also clean up after him and take the rubbish out.
  const ok = evaluateWords(s.en, { text: 'I also clean up after him and take the rubbish out.', confidence: 0 });
  assert.ok(ok.words.every((w) => w.state === 'good'), JSON.stringify(ok.words.map((w) => w.state)));
  const miss = evaluateWords(s.en, { text: 'I also clean up after him and take the rubbish', confidence: 0 }, { tailUnreliable: true });
  assert.ok(miss.words.some((w) => w.state === 'uncertain'), 'fim possivelmente cortado fica cinza');
  const wrong = evaluateWords(s.en, { text: 'I also clean up after him and take the rabbit out.', confidence: 0 });
  assert.equal(wrong.words.find((w) => /rubbish/.test(w.text)).state, 'needs_practice');
  const none = evaluateWords(s.en, null);
  assert.ok(none.words.every((w) => w.state === 'uncertain') && !none.evaluated);
  for (const w of [...ok.words, ...wrong.words]) assert.doesNotMatch(w.reason || '', /pronunciou corretamente|pronúncia correta/i);
  // britânico × americano não é marcado como erro (grafia)
  const br = evaluateWords(lk.sentences['L09-B1-S1'].en, { text: "I like to get things done in the morning before it's time to go to school.", confidence: 0 });
  assert.ok(br.words.every((w) => w.state === 'good'));
});

test('etapas 1 e 2 de cada sessão usam o vocabulário prioritário aprovado e nenhuma fica vazia', () => {
  for (const r of lk.routines) {
    const v = moduleItems(lk, r, 'vocab').map((i) => i.id), e = moduleItems(lk, r, 'expr').map((i) => i.id);
    assert.ok(v.length >= 2 && e.length >= 1, `${r.id}: ${v.length}/${e.length}`);
    assert.deepEqual([...v, ...e].sort(), [...r.session.vocabIds].sort(), r.id);
    const m = moduleStatus(lk, r.id, { cards: {}, recordingsMeta: {} });
    assert.deepEqual(m.stages.map((x) => x.state), ['open', 'locked', 'locked', 'locked', 'locked', 'locked'], r.id);
  }
});
