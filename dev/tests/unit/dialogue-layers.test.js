// Formato em camadas (john-p1-e01, documento-fonte aprovado de 2026-11-13) e atividades ativas: regras do motor e
// integridade do pacote gerado (app/data/dialogues.js a partir de content/dialogues/john-p1-e01-layers.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  LAYER_PHASES, LAYER_PREREQ, PHASES, phasesOf, phaseById, isLayered, isActive, activeActivities, requiredOf, phaseStatuses, activityStatus,
  actProgress, emptyStore, addAttempt, recordListen, canSpeakItem, phaseOrder, activityReport, LISTENS_REQUIRED,
} from '../../app/js/engine/dialogue.js';

const PACK = JSON.parse(readFileSync(new URL('../../app/data/dialogues.js', import.meta.url), 'utf8').replace(/^[\s\S]*?window\.DRG_DIALOGUES = /, '').replace(/;\s*$/, ''));
const SRC = JSON.parse(readFileSync(new URL('../../content/dialogues/john-p1-e01-layers.json', import.meta.url), 'utf8'));
const E01 = PACK.activities.find((a) => a.id === 'john-p1-e01');
const pass = (p, phase, id, i = 0) => addAttempt(p, { attemptId: `a-${phase}-${id}-${i}`, phase, itemId: id, inputType: 'text', response: 'x', result: { status: 'passed', score: 100, evaluationMode: 'local_deterministic' }, now: 1000 + i });

test('sete etapas em camadas: 1–6 + 7.1–7.3, sequência linear; atividades clássicas mantêm as cinco fases', () => {
  assert.deepEqual(LAYER_PHASES.map((x) => x.id), ['u-write', 'u-speak', 'u-listen', 's-write', 's-speak', 's-listen', 'listening', 'reading', 'translation']);
  assert.deepEqual([...new Set(LAYER_PHASES.map((x) => x.step))], [1, 2, 3, 4, 5, 6, 7]);
  const ids = LAYER_PHASES.map((x) => x.id);
  ids.forEach((id, i) => assert.equal(LAYER_PREREQ[id], i ? ids[i - 1] : null));
  assert.ok(isLayered(E01));
  assert.equal(phasesOf(E01), LAYER_PHASES);
  const classic = PACK.activities.find((a) => a.id === 'john-p1-e02');
  assert.ok(!isLayered(classic));
  assert.equal(phasesOf(classic), PHASES);
  assert.equal(phaseById('vocab', E01), null); // a fase antiga não existe para a e01
  assert.equal(phaseById('u-speak', E01).n, 2);
});

test('pacote: 32 unidades e 25 frases iguais ao documento-fonte, ids estáveis, mesmas listas nas três etapas de cada camada', () => {
  assert.equal(E01.unitIds.length, 32);
  assert.equal(E01.sentenceIds.length, 25);
  SRC.units.forEach((u, i) => { const it = PACK.items.find((x) => x.id === E01.unitIds[i]); assert.equal(it.id, `john-p1-e01-u${u.code.slice(1)}`); assert.equal(it.en, u.en); assert.equal(it.pt, u.pt); assert.equal(it.layer, 'unit'); });
  SRC.sentences.forEach((s, i) => { const it = PACK.items.find((x) => x.id === E01.sentenceIds[i]); assert.equal(it.en, s.en); assert.equal(it.pt, s.pt); assert.equal(it.origin, s.origin); });
  for (const ph of ['u-write', 'u-speak', 'u-listen']) assert.deepEqual(requiredOf(PACK, E01, ph), E01.unitIds);
  for (const ph of ['s-write', 's-speak', 's-listen']) assert.deepEqual(requiredOf(PACK, E01, ph), E01.sentenceIds);
  assert.deepEqual(requiredOf(PACK, E01, 'reading'), E01.lines.map((l) => l.id));
  // preservado: os 8 itens originais, as 7 falas e as 10 questões continuam no pacote
  assert.equal(E01.itemIds.length, 8);
  assert.equal(E01.lines.length, 7);
  assert.equal(E01.questionIds.length, 10);
  // forma falada das notações didáticas (áudio e reconhecimento) e aceita na escrita
  const u05 = PACK.items.find((x) => x.id === 'john-p1-e01-u05');
  assert.equal(u05.spoken, 'meet, met');
  assert.deepEqual(u05.accepted, ['meet, met']);
  assert.equal(PACK.items.find((x) => x.id === 'john-p1-e01-u02').spoken, 'Do you remember?');
});

test('atividades ativas: só john-p1-e01; as outras 45 continuam no pacote (conteúdo, questões, áudio)', () => {
  assert.deepEqual(PACK.active, ['john-p1-e01']);
  assert.deepEqual(activeActivities(PACK).map((a) => a.id), ['john-p1-e01']);
  assert.equal(PACK.activities.length, 46);
  assert.equal(PACK.activities.filter((a) => !isActive(PACK, a)).length, 45);
  assert.equal(PACK.questions.length, 403);
  assert.ok(PACK.activities.every((a) => a.lines.every((l) => l.audio)));
  assert.ok(isActive({ activities: [], active: null }, { id: 'x' })); // sem lista = todas
});

test('progressão: cada etapa abre só com a anterior concluída; 7.1 → 7.2 → 7.3', () => {
  const store = emptyStore(); const p = actProgress(store, E01);
  const state = (id) => phaseStatuses(PACK, E01, p).find((x) => x.id === id).state;
  assert.equal(state('u-write'), 'available');
  assert.equal(state('u-speak'), 'locked');
  E01.unitIds.slice(0, 31).forEach((id, i) => pass(p, 'u-write', id, i));
  assert.equal(state('u-speak'), 'locked', 'abriu com 31/32');
  pass(p, 'u-write', E01.unitIds[31], 99);
  assert.equal(state('u-speak'), 'available');
  let k = 200;
  for (const ph of ['u-speak', 'u-listen']) E01.unitIds.forEach((id) => pass(p, ph, id, k++));
  assert.equal(state('s-write'), 'available');
  for (const ph of ['s-write', 's-speak', 's-listen']) E01.sentenceIds.forEach((id) => pass(p, ph, id, k++));
  assert.equal(state('listening'), 'available');
  assert.equal(state('reading'), 'locked');
  assert.equal(state('translation'), 'locked');
  const st = activityStatus(PACK, E01, p);
  assert.equal(st.total, 9);
  assert.equal(st.done, 6);
  const rep = activityReport(PACK, E01, p);
  assert.equal(rep['u-write'].length, 32);
  assert.equal(rep['s-listen'].filter((x) => x.status === 'passed').length, 25);
});

test('três reproduções completas por etapa: a escuta da etapa 2 não libera a etapa 5 nem a fase antiga', () => {
  const p = actProgress(emptyStore(), E01);
  const u = E01.unitIds[0], s = E01.sentenceIds[0];
  for (let i = 0; i < LISTENS_REQUIRED - 1; i++) recordListen(p, `u-speak:${u}`);
  assert.equal(canSpeakItem(p, u, 'u-speak'), false);
  recordListen(p, `u-speak:${u}`);
  assert.equal(canSpeakItem(p, u, 'u-speak'), true);
  assert.equal(canSpeakItem(p, u, 'vocab'), false);
  assert.equal(canSpeakItem(p, s, 's-speak'), false);
});

test('ouvir e escrever: ordem embaralhada estável (mesmos ids); escrever segue a ordem do conteúdo', () => {
  const p = actProgress(emptyStore(), E01);
  let seed = 7; const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const a = phaseOrder(p, 'u-listen', E01.unitIds, rand);
  assert.notDeepEqual(a, E01.unitIds);
  assert.deepEqual([...a].sort(), [...E01.unitIds].sort());
  assert.deepEqual(phaseOrder(p, 'u-listen', E01.unitIds, Math.random), a); // estável
  assert.deepEqual(phaseOrder(p, 'u-write', E01.unitIds, rand), E01.unitIds); // escrita: ordem de aprendizagem
});

// ---------- fechamento de qualidade (2026-11-13) ----------
import { evaluateSpeech } from '../../app/js/engine/dialogueeval.js';
const LAYER = PACK.items.filter((i) => i.layer);

test('confiabilidade da fala (57 unidades/frases): correta aprova; vazia e errada nunca aprovam; alvo curto dentro de fala maior não aprova', () => {
  for (const it of LAYER) {
    const t = it.spoken, clean = t.replace(/[?.!,]/g, '');
    assert.equal(evaluateSpeech(t, { text: clean, engine: 'online', confidence: 0.9 }, { maxExtra: 1 }).status, 'passed', `${it.code} correta`);
    assert.equal(evaluateSpeech(t, { text: '', engine: 'online' }, { maxExtra: 1 }).status, 'inconclusive', `${it.code} vazia`);
    assert.notEqual(evaluateSpeech(t, { text: 'hello there', engine: 'online', confidence: 0.9 }, { maxExtra: 1 }).status, 'passed', `${it.code} errada`);
    const longer = evaluateSpeech(t, { text: `yes ${clean} I think so`, engine: 'online', confidence: 0.9 }, { maxExtra: 1 });
    if (t.split(/\s+/).length <= 3) assert.equal(longer.status, 'inconclusive', `${it.code} curta dentro de fala maior`);
  }
});

test('falso positivo em expressão curta: “work for” só aprova quando é a unidade; baixa confiança não aprova; erro aponta a palavra', () => {
  const T = 'work for';
  assert.equal(evaluateSpeech(T, { text: 'work for' }, { maxExtra: 1 }).status, 'passed');
  assert.equal(evaluateSpeech(T, { text: 'work for me' }, { maxExtra: 1 }).status, 'passed'); // 1 palavra a mais: tolerada
  const inside = evaluateSpeech(T, { text: 'I work for a company' }, { maxExtra: 1 });
  assert.equal(inside.status, 'inconclusive');
  assert.match(inside.feedback.summary, /Grave de novo dizendo só “work for”/);
  assert.equal(evaluateSpeech(T, { text: 'I work for a company' }).status, 'passed'); // sem a opção: comportamento de sempre (outras telas)
  assert.notEqual(evaluateSpeech(T, { text: 'work for', confidence: 0.05 }, { maxExtra: 1 }).status, 'passed'); // baixa confiança
  const wrong = evaluateSpeech(T, { text: 'work so', confidence: 0.9 }, { maxExtra: 1 });
  assert.equal(wrong.status, 'needs_practice');
  assert.deepEqual(wrong.feedback.toPractise, ['for']);
});

test('forma falada separada da notação: nada de “→”, “+”, “/” ou “…” falado; padrões truncados usam a fala de referência', () => {
  for (const it of LAYER) assert.doesNotMatch(it.spoken, /[→+/…]|\.\.\.|\bplus\b/, `${it.code}: ${it.spoken}`);
  const by = (c) => LAYER.find((x) => x.code === c);
  assert.equal(by('U18').spoken, "I'm a project analyst.");
  assert.equal(by('U30').spoken, 'That sounds interesting.');
  assert.equal(by('U31').spoken, 'sounds interesting');
  assert.equal(by('U18').en, "I'm a…"); // o texto exibido continua o do documento
  assert.equal(by('U18').audio, by('F07').audio); // mesmo áudio da frase F07 (sem gerar outro)
  assert.equal(by('U30').audio, by('F10').audio);
});

test('confiabilidade por reconhecedor: Moonshine em alvo de 1–2 palavras não reprova por divergência; online com boa confiança reprova; baixa confiança nunca decide', () => {
  const T = 'work for';
  const local = (text) => evaluateSpeech(T, { text, engine: 'local-model', confidence: 0 }, { maxExtra: 1 });
  assert.equal(local('work for').status, 'passed');
  const div = local('work so');
  assert.equal(div.status, 'inconclusive');
  assert.match(div.feedback.summary, /não conta como erro seu/);
  assert.equal(evaluateSpeech(T, { text: 'work so', engine: 'online', confidence: 0.9 }, { maxExtra: 1 }).status, 'needs_practice');
  for (const c of [0.05, 0.3, 0.49]) assert.equal(evaluateSpeech(T, { text: 'work so', engine: 'online', confidence: c }, { maxExtra: 1 }).status, 'inconclusive', `confiança ${c}`);
  // frases (3+ palavras) no Moonshine continuam avaliadas normalmente
  assert.equal(evaluateSpeech('I usually work with different teams.', { text: 'I never work with other people', engine: 'local-model', confidence: 0 }, { maxExtra: 1 }).status, 'needs_practice');
});

test('transcrição incompleta (fim não confiável): as palavras que não chegaram não viram erro do aluno', () => {
  const T = 'I usually work with different teams.';
  const r = evaluateSpeech(T, { text: 'I usually work with', engine: 'online', confidence: 0 }, { maxExtra: 1, tailUnreliable: true });
  assert.equal(r.status, 'inconclusive'); // o trecho ouvido não prova a frase inteira
  assert.ok(!(r.feedback.toPractise || []).some((w) => /different|teams/.test(w)), JSON.stringify(r.feedback.toPractise));
  const full = evaluateSpeech(T, { text: 'I usually work with', engine: 'online', confidence: 0.9 }, { maxExtra: 1 });
  assert.ok(full.feedback.toPractise.includes('teams')); // sem o aviso de fim incompleto, a omissão é apontada
});
