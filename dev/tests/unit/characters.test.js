// Personagens: cadastro, visão de conteúdo por personagem, isolamento do progresso e motor compartilhado.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { STATES, registry, characterById, contentFor, assetFor, visualStatus } from '../../app/js/engine/characters.js';
import { buildSession, cardInContent, cardKey } from '../../app/js/engine/scheduler.js';
import { freshState, migrate, recordAnswer } from '../../app/js/engine/progress.js';
import { createChecker } from '../../app/js/engine/checker.js';
import { setLexicon } from '../../app/js/engine/lexicon.js';
import { findDivergences, contextPool } from '../../app/js/engine/context.js';
import { analyseFreeAnswer, buildVocab } from '../../app/js/engine/freeanswer.js';
import { frameRefs, findSlotSuspicions } from '../../app/js/engine/coherence.js';
import { makeExercise } from '../../app/js/engine/exercises.js';

setLexicon(gunzipSync(readFileSync(new URL('../../app/data/lexicon.txt.gz', import.meta.url))).toString('utf8').split('\n'));
const base = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const REG = JSON.parse(readFileSync(new URL('../../content/build/characters.json', import.meta.url)));
const SRC = JSON.parse(readFileSync(new URL('../../content/characters/karla.json', import.meta.url)));
const karla = contentFor(base, 'karla', REG);

test('cadastro: Lucas, Karla e as personas previstas (sem conteúdo), seis estados cada, imagens pendentes (nenhuma imagem genérica)', () => {
  assert.deepEqual(registry(REG).characters.map((c) => c.id), ['lucas', 'karla', 'lucas-kid', 'heitor']);
  // o Lukinhas (lucas-kid) ganhou pacote próprio; o Heitor continua previsto, sem conteúdo
  assert.deepEqual(REG.characters.filter((c) => c.status === 'planned').map((c) => [c.id, c.content]), [['heitor', null]]);
  assert.equal(REG.characters.find((c) => c.id === 'lucas-kid').name, 'Lukinhas');
  assert.deepEqual(STATES, ['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'levelup']);
  for (const c of REG.characters) {
    assert.deepEqual(Object.keys(c.visual.states).sort(), [...STATES].sort());
    assert.deepEqual(visualStatus(c), { ready: [], pending: STATES }, `${c.id}: o cadastro não significa imagens prontas`);
    for (const s of STATES) assert.equal(assetFor(c, s), null);
  }
  // quando uma imagem for aprovada, o caminho segue a convenção <dir>/<ESTADO>.png
  const ready = { ...characterById('karla', REG), visual: { ...SRC.visual, states: { ...SRC.visual.states, correct: { file: 'CORRECT', status: 'ready' } } } };
  assert.equal(assetFor(ready, 'correct'), 'assets/characters/karla/CORRECT.png');
  assert.equal(assetFor(ready, 'wrong'), null);
});

test('perfil da Karla: só o informado (rotina + Character Bible); nada de idade dela, sobrenome, cidade ou nomes da família', () => {
  const k = characterById('karla', REG);
  assert.deepEqual(Object.keys(k.profile).sort(), ['family', 'interests', 'motto', 'notProvided', 'occupation', 'source', 'studies', 'summary', 'traits', 'workplace']);
  assert.ok(['idade', 'sobrenome', 'cidade', 'nome e profissão do marido', 'nomes dos filhos'].every((x) => k.profile.notProvided.includes(x)));
  const all = JSON.stringify(k.content);
  assert.doesNotMatch(all, /\byears old\b|\bmy daughter\b|\b(three|four) (kids|children|sons)\b|\bdrive to\b|\bby (car|bus)\b/i);
  // nomes próprios no texto: só a Karla, personagens secundários fictícios declarados e nomes de coisas (Pilates, Hyrox…)
  const allowed = new Set(['I', 'Karla', 'Sophie', 'Ana', 'Mum', 'Pilates', 'Hyrox', 'Nutrition', 'Biomechanics', 'Tuesday', 'Tuesdays', 'Thursdays', 'Friday', 'Sunday', 'Yes', 'No', 'Of', 'OK']);
  const texts = [...Object.values(k.content.sentences).map((x) => x.en), ...Object.values(k.content.questions).flatMap((q) => [q.q, q.a])];
  const names = new Set(texts.flatMap((t) => [...t.matchAll(/(?<![.!?]\s|^)\b[A-Z][a-z]+/g)].map((m) => m[0])).filter((w) => !allowed.has(w)));
  assert.deepEqual([...names], [], 'nome próprio não declarado');
  const speakers = new Set(Object.values(k.content.sentences).map((x) => x.speaker).filter(Boolean));
  assert.deepEqual([...speakers].sort(), ['Ana', 'Husband', 'Karla', 'Older son', 'Participant', 'Sophie', 'Younger son'], 'família sem nomes; secundários declarados');
  assert.deepEqual(k.journey.secondaryCharacters.map((c) => c.name).slice(0, 2), ['Sophie', 'Ana']);
});

test('duas camadas: frases da rotina-base vêm de fatos (variações com when/if/can); episódios são ilustrativos, ancorados no perfil', () => {
  const facts = new Map(SRC.facts.map((f) => [f.id, f]));
  for (const r of karla.routines) {
    const sents = r.blocks.flatMap((b) => karla.blocks[b].sentences.map((x) => karla.sentences[x]));
    if (r.kind === 'routine') {
      for (const s of sents) {
        assert.ok(s.facts.length && s.facts.every((f) => facts.has(f)), s.id);
        if (s.facts.some((f) => facts.get(f).kind === 'conditional' && f !== 'V01')) assert.match(s.en, /\b(when|if|can|so)\b/i, s.id);
      }
    } else {
      assert.equal(r.kind, 'episode', r.id);
      assert.ok(r.basis.length && r.basis.every((f) => facts.has(f)), `${r.id}: base no perfil`);
      assert.ok(r.stage && r.goal && r.grammar, `${r.id}: etapa, objetivo e foco linguístico`);
    }
  }
  assert.deepEqual(karla.routines.filter((r) => r.kind === 'routine').map((r) => r.id), ['K01', 'K02', 'K03']);
  assert.equal(SRC.themes.length, 10);
  for (const t of SRC.themes) if (t.status === 'pending') assert.deepEqual(t.covers, []);
});

test('progresso já publicado preservado: K01–K03 mantêm IDs e textos de 482ec74 (blocos novos só no fim)', () => {
  const fx = JSON.parse(readFileSync(new URL('../fixtures/karla-published-482ec74.json', import.meta.url)));
  for (const [id, en] of Object.entries(fx.sentences)) assert.equal(karla.sentences[id] && karla.sentences[id].en, en, id);
  for (const [id, q] of Object.entries(fx.questions)) assert.equal(karla.questions[id] && karla.questions[id].q, q, id);
});

test('jornada: episódios em ordem de etapa (A→D), cada um com conversa/compreensão e transferência; diálogos com quem fala', () => {
  const order = 'ABCD';
  const stages = karla.routines.map((r) => order.indexOf(r.stage));
  assert.ok(stages.every((x, i) => x >= 0 && (i === 0 || x >= stages[i - 1])), `etapas fora de ordem: ${karla.routines.map((r) => r.stage).join('')}`);
  for (const r of karla.routines.filter((x) => x.kind === 'episode')) {
    const qs = r.questions.map((q) => karla.questions[q]);
    assert.ok(qs.some((q) => q.kind === 'conv' || q.kind === 'comp'), `${r.id}: sem pergunta com resposta-modelo`);
    assert.ok(qs.some((q) => q.kind === 'transfer' && q.openPersonal && q.hint && q.a === ''), `${r.id}: sem transferência`);
    assert.ok(r.items.length >= 12 && r.items.length <= 30, `${r.id}: ${r.items.length} itens (volume por episódio)`);
  }
  const dialogues = Object.values(karla.blocks).filter((b) => b.kind === 'dialogue');
  assert.ok(dialogues.length >= 6);
  for (const b of dialogues) for (const sid of b.sentences) {
    const s = karla.sentences[sid];
    assert.ok(s.speaker && s.pt.includes(': '), sid);
    assert.doesNotMatch(s.en, /^[A-Z][a-z]+( son)?:/, `${sid}: o nome de quem fala não entra no texto em inglês`);
  }
});

test('revisão cumulativa: palavras retomadas em episódios posteriores; cada episódio novo retoma algo já visto', () => {
  const k = characterById('karla', REG);
  const multi = Object.entries(k.reuse).filter(([, rs]) => rs.length > 1);
  assert.ok(multi.length >= 25, `${multi.length} itens em 2+ rotinas`);
  for (const id of ['k.schedule', 'k.client', 'k.catch-up-on', 'k.go-for-a-run', 'k.make-time-for', 'k.take-a-deep-breath', 'k.recovery']) assert.ok(k.reuse[id].length >= 2, id);
  assert.deepEqual(k.reuse['k.schedule'], ['K06', 'K09', 'K11'], 'agenda: trabalho → imprevisto → planejamento');
  const ids = karla.routines.map((r) => r.id);
  for (const [i, r] of karla.routines.entries()) {
    if (i < 3) continue;
    const earlier = new Set(karla.routines.slice(0, i).flatMap((x) => x.items));
    assert.ok(r.items.some((x) => earlier.has(x)), `${r.id} não retoma nada de ${ids.slice(0, i).join(', ')}`);
  }
  // os itens aparecem na ordem da jornada: o motor apresenta primeiro os de K01
  const q = buildSession(karla, {}, { today: 300, size: 12, rand: () => 0.3 });
  assert.ok(q.filter((e) => e.unit === 'item').every((e) => karla.routines[0].items.includes(e.id)), JSON.stringify(q.map((e) => e.id)));
});

test('inglês britânico nos textos novos (grafia e vocabulário), sem afirmação de saúde prescritiva', () => {
  const en = [...Object.values(karla.sentences).map((s) => s.en), ...Object.values(karla.questions).flatMap((q) => [q.q, q.a])].join(' \n ');
  assert.doesNotMatch(en, /\b(color|flavor|organize|specialty|realize|practice (my|your)|\bmath\b|Mom|learned|center)\b/);
  assert.match(en, /\bflavour\b/); assert.match(en, /\bspeciality\b/); assert.match(en, /\bmaths\b/); assert.match(en, /\bMum\b/);
  assert.doesNotMatch(en, /\byou (should|must) (eat|take|avoid)\b|\bcures?\b|\bburns? fat\b|\bdetox\b/i);
});

test('visão do Lucas = o próprio conteúdo atual (mesmo objeto): nada muda para quem já usa o app', () => {
  assert.equal(contentFor(base, 'lucas', REG), base);
  assert.equal(contentFor(base, undefined, REG), base);
  assert.equal(contentFor(base, 'desconhecido', REG), base);
  assert.equal(contentFor(base, 'karla', REG), karla, 'visão estável (os caches do motor usam o objeto como chave)');
});

test('visão da Karla: só conteúdo dela + vocabulário genérico compartilhado, reapontado para as frases dela', () => {
  assert.deepEqual(karla.routines.map((r) => r.id), ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11']);
  assert.ok(Object.keys(karla.sentences).every((id) => id.startsWith('K')));
  assert.ok(Object.keys(karla.questions).every((id) => id.startsWith('K.')));
  assert.ok(Object.keys(karla.items).every((id) => id.startsWith('k.') || id.startsWith('it.')));
  const wake = karla.items['it.wake-up'];
  assert.deepEqual(wake.routines, ['K01']);
  assert.deepEqual(karla.items['it.because'].routines, ['K05', 'K07', 'K08', 'K09'], 'conector genérico retomado ao longo da jornada');
  assert.ok(wake.ex.every((x) => x.src.startsWith('K')), 'exemplos da Karla, não do Lucas');
  assert.ok(base.items['it.wake-up'].routines.includes('R01'), 'o conteúdo do Lucas não é alterado');
  assert.deepEqual([karla.verbs.length, karla.drills.length, karla.checklist.length], [0, 0, 0]);
  assert.equal(karla.language, base.language, 'mesmas regras de correção (inglês britânico, variantes aceitas)');
});

test('progresso isolado: cartões de um personagem não entram nas sessões/revisões do outro; palavras genéricas sim', () => {
  const st = freshState(base.version);
  recordAnswer(st, cardKey('sent', 'R01-B1-S1', 'ord'), 'good', { today: 100 });
  recordAnswer(st, cardKey('sent', 'K01-B1-S1', 'ord'), 'good', { today: 100 });
  recordAnswer(st, cardKey('item', 'it.wake-up', 'rec'), 'good', { today: 100 });
  assert.ok(cardInContent(base, 'sent:R01-B1-S1:ord') && !cardInContent(base, 'sent:K01-B1-S1:ord'));
  assert.ok(cardInContent(karla, 'sent:K01-B1-S1:ord') && !cardInContent(karla, 'sent:R01-B1-S1:ord'));
  assert.ok(cardInContent(base, 'item:it.wake-up:rec') && cardInContent(karla, 'item:it.wake-up:rec'), 'vocabulário compartilhado');
  const q = buildSession(karla, st.cards, { today: 200, size: 12, rand: () => 0.3 });
  assert.ok(q.length > 0);
  for (const e of q) assert.ok(e.unit === 'pairs' || cardInContent(karla, e.k), e.k);
  const ql = buildSession(base, st.cards, { today: 200, size: 12, rand: () => 0.3 });
  assert.ok(ql.every((e) => e.unit === 'pairs' || cardInContent(base, e.k)));
});

test('armazenamento: estados antigos ganham personagem padrão (Lucas) sem migração destrutiva', () => {
  const old = freshState(base.version);
  delete old.settings.character;
  old.xp = 321;
  const m = migrate(JSON.parse(JSON.stringify(old)), base.version);
  assert.equal(m.settings.character, 'lucas');
  assert.equal(m.xp, 321);
  const withK = migrate({ ...JSON.parse(JSON.stringify(old)), settings: { ...old.settings, character: 'karla' } }, base.version);
  assert.equal(withK.settings.character, 'karla');
});

test('motor compartilhado: exercícios da Karla são gerados pelo mesmo gerador e respondidos pelo mesmo corretor', () => {
  const ck = createChecker(karla.language);
  for (const sid of Object.keys(karla.sentences)) {
    const ex = makeExercise(karla, { k: cardKey('sent', sid, 'ord'), unit: 'sent', id: sid, skill: 'ord' }, () => 0.4);
    assert.ok(ex, sid);
  }
  const s = karla.sentences['K01-B4-S1'];
  assert.equal(ck.check('From 2:00 to 4:30 p.m., I teach group Pilates classes.', [s.en]).cls, 'correct');
  assert.equal(ck.check('From 2 to 4:30 pm I teach group Pilates classes', [s.en]).accepted, true);
  assert.equal(ck.check("I organize dinner for my family and the children's snack.", [karla.sentences['K01-B6-S2'].en]).accepted, true, 'grafia americana aceita');
  assert.equal(ck.check('From 2:00 to 4:30 p.m., I teach group pilots classes.', [s.en]).accepted, false, 'palavra errada não passa');
});

test('avaliação oral com o conteúdo da Karla: respostas dela não geram falsos alarmes; troca real é marcada', () => {
  const ck = createChecker(karla.language), pool = contextPool(karla, ck), vocab = buildVocab(karla), frames = frameRefs(karla);
  for (const t of [...Object.values(karla.sentences).map((s) => s.en), ...Object.values(karla.questions).map((q) => q.a)]) {
    assert.deepEqual(findSlotSuspicions(t, frames), [], t);
  }
  const q = karla.questions['K.Q4'];
  const free = (t) => analyseFreeAnswer({ question: q.q, model: q.a, transcript: t, analysis: { silent: false, speechSec: 6, totalSec: 7, pauses: 1, longPauses: 0 }, vocab, frames, divergences: findDivergences(t, { checker: ck, pool, model: q.a }), naturalness: ck.naturalness(t) });
  const ok = free('In the afternoon I teach group Pilates classes until half past four.');
  assert.deepEqual(ok.practice, []);
  assert.ok(['pilates', 'classes'].every((w) => ok.words.find((x) => x.text.toLowerCase().startsWith(w)).state === 'good'));
  const bad = free('From two to four thirty I teach group pilots classes.');
  assert.ok(bad.words.find((x) => x.text === 'pilots').state !== 'good', 'palavra trocada não fica verde');
});

test('escolha de personagem: estado novo ainda não escolheu (Lucas marcado); antigos e backups não são interrompidos; dados inválidos caem no padrão', () => {
  const fresh = freshState(base.version);
  assert.deepEqual([fresh.settings.character, fresh.settings.characterChosen], ['lucas', false]);
  // estado novo gravado antes da escolha: continua sem escolha (a tela volta a aparecer)
  assert.equal(migrate(JSON.parse(JSON.stringify(fresh)), base.version).settings.characterChosen, false);
  // escolha feita: mantida
  const chosen = migrate({ ...JSON.parse(JSON.stringify(fresh)), settings: { ...fresh.settings, character: 'karla', characterChosen: true } }, base.version);
  assert.deepEqual([chosen.settings.character, chosen.settings.characterChosen], ['karla', true]);
  // estado/backup de antes desta versão (sem a chave): já estava em uso → não mostra a escolha e preserva o personagem
  const old = JSON.parse(JSON.stringify(fresh)); delete old.settings.characterChosen; old.settings.character = 'karla'; old.xp = 77;
  const mOld = migrate(old, base.version);
  // progresso por perfil: os 77 XP eram do perfil ativo na cópia (Lucas) e continuam com ele; a Karla tem o dela
  assert.deepEqual([mOld.settings.character, mOld.settings.characterChosen, mOld.profiles.lucas.xp, mOld.xp], ['karla', true, 77, 0]);
  const noSettings = JSON.parse(JSON.stringify(fresh)); delete noSettings.settings;
  assert.deepEqual([migrate(noSettings, base.version).settings.character, migrate(noSettings, base.version).settings.characterChosen], ['lucas', true]);
  // tipos inválidos: personagem volta ao Lucas, ajustes corrompidos são refeitos e avisados como reparo, cartões intactos
  const bad = migrate({ ...JSON.parse(JSON.stringify(fresh)), settings: { ...fresh.settings, character: 42, characterChosen: 'x' } }, base.version);
  assert.deepEqual([bad.settings.character, bad.settings.characterChosen], ['lucas', true]);
  const st = freshState(base.version);
  recordAnswer(st, cardKey('sent', 'R01-B1-S1', 'ord'), 'good', { today: 100 });
  const junk = migrate({ ...JSON.parse(JSON.stringify(st)), settings: 'lixo' }, base.version);
  assert.equal(junk.settings.dailyGoal, 12);
  assert.ok(!('0' in junk.settings), 'texto não vira ajustes');
  assert.deepEqual(junk._repairs, ['settings']);
  assert.ok(junk.cards['sent:R01-B1-S1:ord']);
  // personagem desconhecido: o cadastro devolve o Lucas (conteúdo atual)
  assert.equal(characterById('zzz', REG).id, 'lucas');
  assert.equal(contentFor(base, 42, REG), base);
});
