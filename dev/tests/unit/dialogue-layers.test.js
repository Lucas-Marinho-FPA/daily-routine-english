// Formato em camadas (john-p1-e01, documento-fonte aprovado de 2026-11-13) e atividades ativas: regras do motor e
// integridade do pacote gerado (app/data/dialogues.js a partir de content/dialogues/john-p1-e01-layers.json).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  LAYER_PHASES, LAYER_PREREQ, PHASES, phasesOf, phaseById, isLayered, isActive, activeActivities, requiredOf, phaseStatuses, activityStatus,
  actProgress, emptyStore, addAttempt, recordListen, canSpeakItem, phaseOrder, activityReport, LISTENS_REQUIRED,
  mastery, MAX_TRIES, failedTries, canSkip, skipItem, isSkipped, itemOutcome, phaseScore, nextItem, settleCompletion, isTolerant,
} from '../../app/js/engine/dialogue.js';
import { diffText, closestReference } from '../../app/js/engine/textdiff.js';

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
  // U05 (validação real, 2026-11-13): “meet → met” virou “met someone” (o original do documento fica em `original`)
  const u05 = PACK.items.find((x) => x.id === 'john-p1-e01-u05');
  assert.equal(u05.spoken, 'I met someone.');
  assert.deepEqual(u05.original, { en: 'meet → met', pt: 'conhecer/encontrar → conheceu/encontrou' });
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
  assert.equal(by('U18').en, "I'm a project analyst."); // expressão real em primeiro plano (2026-11-13); o padrão vira complemento
  assert.equal(by('U18').original.en, "I'm a…");
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

// ---------- validação real no Galaxy S25+ (2026-11-13): progressão tolerante, aproveitamento, escrita marcada, conteúdo ----------
const fail = (p, phase, id, status, i) => addAttempt(p, { attemptId: `f-${phase}-${id}-${i}`, phase, itemId: id, inputType: 'speech', response: 'x',
  result: status === 'needs_practice' ? { status, score: 40, evaluationMode: 'local_asr' } : { status: 'inconclusive', score: null, evaluationMode: 'local_asr' }, now: 5000 + i });
const freshE01 = () => actProgress(emptyStore(), E01);
const passAllBut = (p, phase, ids, but) => ids.forEach((id, i) => { if (!but.includes(id)) pass(p, phase, id, i); });
const stateOf = (p, phase) => phaseStatuses(PACK, E01, p).find((x) => x.id === phase);

test('bloqueio reproduzido: sem “continuar”, um único item não reconhecido mantém a etapa aberta e o próximo item volta a ser ele', () => {
  const p = freshE01();
  passAllBut(p, 'u-write', E01.unitIds, []); // etapa 1 concluída
  const stuck = E01.unitIds[4];
  passAllBut(p, 'u-speak', E01.unitIds, [stuck]);
  for (let i = 0; i < 2; i++) fail(p, 'u-speak', stuck, 'needs_practice', i);
  assert.notEqual(stateOf(p, 'u-speak').state, 'completed'); // 31/32 aprovados, item com só 2 tentativas: ainda não resolvido
  assert.equal(nextItem(E01.unitIds, p, 'u-speak'), stuck); // é este o comportamento que travava o aluno no aparelho
  assert.equal(stateOf(p, 'u-listen').state, 'locked');
});

test('três tentativas: “continuar sem concluir” só depois de 3 sem sucesso (erro ou falha do reconhecedor); item aprovado nunca é pulado', () => {
  const p = freshE01(); const id = E01.unitIds[0];
  assert.equal(MAX_TRIES, 3);
  assert.equal(canSkip(p, 'u-speak', id), false);
  fail(p, 'u-speak', id, 'needs_practice', 1); fail(p, 'u-speak', id, 'inconclusive', 2);
  assert.equal(failedTries(p, 'u-speak', id), 2);
  assert.equal(canSkip(p, 'u-speak', id), false);
  assert.equal(skipItem(p, 'u-speak', id), false); // sem a terceira, não pula
  fail(p, 'u-speak', id, 'inconclusive', 3);
  assert.equal(canSkip(p, 'u-speak', id), true);
  assert.equal(skipItem(p, 'u-speak', id, 9000), true);
  assert.equal(skipItem(p, 'u-speak', id, 9999), true); // idempotente
  assert.equal(p.skipped['u-speak'][id], 9000);
  assert.ok(isSkipped(p, 'u-speak', id));
  assert.equal(mastery(p, 'u-speak', id).status, 'inconclusive'); // pendente NÃO vira acerto
  pass(p, 'u-speak', id, 50); // aprovado depois: deixa de ser pendente
  assert.ok(!isSkipped(p, 'u-speak', id));
  assert.equal(canSkip(p, 'u-speak', id), false);
});

test('item pendente não volta sozinho: “próximo item” segue em frente e pula os pendentes; sem mais nada, null', () => {
  const p = freshE01(); const ids = E01.unitIds;
  passAllBut(p, 'u-speak', ids, [ids[2], ids[5]]);
  for (let i = 0; i < 3; i++) fail(p, 'u-speak', ids[2], 'needs_practice', i);
  skipItem(p, 'u-speak', ids[2]);
  assert.equal(nextItem(ids, p, 'u-speak', { after: ids[2], skipSkipped: true }), ids[5]);
  assert.equal(nextItem(ids, p, 'u-speak', { after: ids[5], skipSkipped: true }), null); // não retorna ao pendente ids[2]
  assert.equal(nextItem(ids, p, 'u-speak', { skipSkipped: true }), ids[5]); // retomada da etapa também ignora o pendente
  assert.equal(nextItem(ids, p, 'u-speak', { after: ids[5] }), ids[2]); // fases clássicas (sem skipSkipped): comportamento de antes
});

test('aproveitamento ≥ 80%: 9/10 com 1 pendente aprova (90%); exatamente 80% aprova; abaixo de 80% não; pendente nunca conta como acerto', () => {
  // etapa de 10 itens simulada com requiredOf da 7.2? usamos as 25 frases e montamos cenários proporcionais
  const ids = E01.sentenceIds; // 25 frases
  const scen = (passN, errN, techN) => {
    const p = freshE01(); passAllBut(p, 'u-write', E01.unitIds, []); passAllBut(p, 'u-speak', E01.unitIds, []); passAllBut(p, 'u-listen', E01.unitIds, []); passAllBut(p, 's-write', ids, []);
    ids.forEach((id, i) => {
      if (i < passN) return pass(p, 's-speak', id, i);
      const kind = i < passN + errN ? 'needs_practice' : 'inconclusive';
      for (let k = 0; k < 3; k++) fail(p, 's-speak', id, kind, i * 10 + k);
      skipItem(p, 's-speak', id);
    });
    return { sc: phaseScore(PACK, E01, p, 's-speak'), st: stateOf(p, 's-speak').state, next: stateOf(p, 's-listen').state };
  };
  const a = scen(23, 2, 0); // 23/25 = 92%
  assert.equal(a.sc.ratio, 92); assert.ok(a.sc.approved); assert.equal(a.st, 'completed'); assert.equal(a.next, 'available');
  const b = scen(20, 5, 0); // 20/25 = 80% exatos
  assert.equal(b.sc.ratio, 80); assert.ok(b.sc.approved); assert.equal(b.st, 'completed');
  const c = scen(19, 6, 0); // 19/25 = 76%
  assert.equal(c.sc.ratio, 76); assert.ok(!c.sc.approved); assert.equal(c.st, 'needs_retry'); assert.equal(c.next, 'locked');
  assert.equal(c.sc.passed, 19); assert.equal(c.sc.skipped, 6); // os pendentes não somam acertos
  // falha do reconhecedor não penaliza: 21 aprovados + 4 só com falha técnica → 21/21 avaliados = 100% (cobertura 84%)
  const d = scen(21, 0, 4);
  assert.equal(d.sc.evaluated, 21); assert.equal(d.sc.technical, 4); assert.equal(d.sc.ratio, 100); assert.ok(d.sc.approved);
  // sem evidência suficiente não decide: 15 aprovados + 10 só com falha técnica → cobertura 60% < 80% → não aprova
  const e = scen(15, 0, 10);
  assert.equal(e.sc.ratio, 100); assert.equal(e.sc.coverage, 60); assert.ok(!e.sc.approved); assert.equal(e.st, 'needs_retry');
});

test('exemplo do PO: etapa de 10 itens, 9 corretos e 1 pendente → 90%, aprovada (leitura 7.2 tolerante; 7 falas → 6/7 = 85%)', () => {
  const sc10 = { passed: 9, error: 1 }; assert.ok(100 * sc10.passed >= 80 * (sc10.passed + sc10.error)); // 90% ≥ 80%
  const p = freshE01(); const lines = E01.lines.map((l) => l.id);
  lines.forEach((id, i) => { if (i) pass(p, 'reading', id, i); });
  for (let k = 0; k < 3; k++) fail(p, 'reading', lines[0], 'needs_practice', k);
  assert.ok(isTolerant(E01, 'reading'));
  assert.ok(!phaseScore(PACK, E01, p, 'reading').approved); // ainda não resolvido: o aluno não escolheu seguir
  skipItem(p, 'reading', lines[0]);
  const sc = phaseScore(PACK, E01, p, 'reading');
  assert.equal(sc.ratio, 85); assert.ok(sc.approved);
});

test('etapa aprovada continua aprovada: rever depois um pendente e errar de novo não reabre a etapa', () => {
  const p = freshE01(); const ids = E01.unitIds;
  // 25 aprovados + 1 erro + 6 só com falha do reconhecedor → 25/26 avaliados (96%), cobertura 81% → aprovada
  passAllBut(p, 'u-write', ids, ids.slice(0, 7));
  ids.slice(0, 7).forEach((id, i) => { for (let k = 0; k < 3; k++) fail(p, 'u-write', id, i < 1 ? 'needs_practice' : 'inconclusive', i * 10 + k); skipItem(p, 'u-write', id); });
  settleCompletion(PACK, E01, p, 7777);
  assert.equal(stateOf(p, 'u-write').state, 'completed'); assert.equal(p.phaseApproved['u-write'], 7777);
  // revendo depois os 6 pendentes e errando: 25/32 = 78% — sem a regra a etapa reabriria (e travaria as seguintes)
  ids.slice(1, 7).forEach((id, i) => fail(p, 'u-write', id, 'needs_practice', 900 + i));
  assert.equal(phaseScore(PACK, E01, p, 'u-write').ratio, 78);
  assert.ok(!phaseScore(PACK, E01, p, 'u-write').approved);
  assert.equal(stateOf(p, 'u-write').state, 'completed');
});

test('atividades clássicas não mudam: sem pular, sem aproveitamento; tudo aprovado exige todos os itens', () => {
  const classic = PACK.activities.find((a) => a.id === 'john-p1-e02');
  assert.ok(!isTolerant(classic, 'vocab') && !isTolerant(classic, 'reading') && !isTolerant(E01, 'listening') && !isTolerant(E01, 'translation'));
  const p = actProgress(emptyStore(), classic);
  const st = phaseStatuses(PACK, classic, p);
  assert.ok(st.every((x) => !('score' in x)));
});

test('três situações distintas por item: aprovado, erro de resposta, falha do reconhecedor (e não praticado)', () => {
  const p = freshE01(); const [a, b, c, d] = E01.unitIds;
  pass(p, 'u-speak', a, 1); fail(p, 'u-speak', b, 'needs_practice', 2); fail(p, 'u-speak', c, 'inconclusive', 3);
  assert.deepEqual([a, b, c, d].map((id) => itemOutcome(p, 'u-speak', id)), ['passed', 'error', 'technical', 'unseen']);
  const rep = activityReport(PACK, E01, p)['u-speak'];
  assert.deepEqual(rep.slice(0, 4).map((x) => x.outcome), ['passed', 'error', 'technical', 'unseen']);
});

test('escrita marcada: “saund” × “sound” marca só a × o; palavra a mais/faltando por palavra; maiúsculas e pontuação não são erro', () => {
  const marks = (segs) => segs.filter((x) => x.mark !== 'same' && x.mark !== 'space').map((x) => `${x.mark}:${x.text}`);
  const d = diffText('saund + adjective', 'sound + adjective');
  assert.deepEqual(marks(d.answer), ['wrong:a']); assert.deepEqual(marks(d.reference), ['fix:o']);
  assert.equal(d.answer.map((x) => x.text).join(''), 'saund + adjective');
  assert.equal(d.reference.map((x) => x.text).join(''), 'sound + adjective');
  const w = diffText('I work with a company', 'I work for a company');
  assert.deepEqual(marks(w.answer), ['extra:with']); assert.deepEqual(marks(w.reference), ['missing:for']);
  const m = diffText('I usually work different teams', 'I usually work with different teams.');
  assert.deepEqual(marks(m.answer), []); assert.deepEqual(marks(m.reference), ['missing:with']);
  assert.equal(diffText('Sounds interesting.', 'sounds interesting').changed, false);
  assert.deepEqual(marks(diffText('remmember me', 'remember me').answer), ['wrong:m']);
  assert.equal(closestReference('sounds intresting', ['sound + adjective', 'sounds interesting']), 'sounds interesting');
});

test('conteúdo (validação real): U31 “sounds interesting” com tradução natural e o padrão como complemento; U05 sem par isolado; U26 com reticências (sem silêncio fixo)', () => {
  const by = (c) => LAYER.find((x) => x.code === c);
  assert.equal(by('U31').en, 'sounds interesting'); assert.equal(by('U31').pt, 'Parece interessante.');
  assert.match(by('U31').note, /sound \+ adjective/); assert.equal(by('U31').original.en, 'sound + adjective');
  assert.equal(by('U31').audio, '4adaa17f'); // mesmo áudio de antes (forma falada inalterada)
  assert.equal(by('U05').en, 'I met someone.'); assert.equal(by('U04').en, 'meet someone'); // as duas formas em exercícios separados
  assert.ok(LAYER.every((x) => !/→/.test(x.en)), 'nenhum par com seta num mesmo exercício');
  assert.equal(by('U30').en, 'That sounds interesting.'); assert.equal(by('U30').pt, 'Isso parece interessante.');
  assert.equal(by('U26').spoken, 'help someone, help a team'); // reconhecimento e escrita como antes
  assert.ok(!['4410beef', '45b61163'].includes(by('U26').audio)); // nem a vírgula artificial nem o silêncio fixo de 1 s (2026-11-14)
  // o restante das unidades e todas as frases continuam literalmente iguais ao documento
  const changed = SRC.units.filter((u) => u.original).map((u) => u.code);
  assert.deepEqual(changed, ['U05', 'U18', 'U30', 'U31']);
});
