// Atividade de diálogo em cinco fases (engine/dialogue.js, dialogueeval.js, evalsync.js) e conteúdo de
// “The Story of John” (content/dialogues/john.json, gerado por tools/dialogues-source.mjs).
// Casos críticos de docs/produto/mvp-dialogo/07: limiar individual de 80%, média que não compensa, item aprovado que
// não volta, inconclusivo, pendência offline, idempotência, retomada, 3 audições, 8/10, sem gamificação.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createChecker } from '../../app/js/engine/checker.js';
import {
  THRESHOLD, LISTENS_REQUIRED, PHASES, meetsThreshold, emptyStore, validStore, actProgress, addAttempt, applyEvaluation, markRetry,
  pendingAttempts, mastery, recordListen, canSpeakItem, canAnswerQuestions, gradeRound, addRound, listeningNext, wrongOf, comprehension, questionMastered,
  phaseStatuses, activityStatus, nextItem, phaseOrder, activityReport, spokenItem, requiredOf, contentProblems, newAttemptId, settleCompletion,
} from '../../app/js/engine/dialogue.js';
import { scoreWriting, evaluateSpeech, localTranslation, validateTranslationResult, translationRequest, nearToken } from '../../app/js/engine/dialogueeval.js';
import { createRemoteEvaluator, processQueue, remoteBlocker, evaluationConfig } from '../../app/js/engine/evalsync.js';

const base = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const checker = createChecker(base.language);
const JOHN = JSON.parse(readFileSync(new URL('../../content/dialogues/john.json', import.meta.url)));

// atividade SINTÉTICA (2 falas, 3 itens, 10 questões) para as regras; o conteúdo real é conferido à parte
const Q = Array.from({ length: 10 }, (_, i) => ({ id: `t-q${i + 1}`, prompt: `Q${i + 1}`, options: [{ id: 'a', text: 'A' }, { id: 'b', text: 'B' }], correctOptionId: 'a', explanation: 'porque sim', skill: 'explicit_fact', sourceLineIds: ['t-l01'] }));
const ACT = {
  id: 't', title: 'Test', context: 'Teste', itemIds: ['t-v1', 't-v2', 't-v3'], questionIds: Q.map((q) => q.id),
  lines: [{ id: 't-l01', speaker: 'John', en: "I'm working for a technology company in Manchester.", pt: 'Estou trabalhando para uma empresa de tecnologia em Manchester.' },
    { id: 't-l02', speaker: 'Rick', en: 'That sounds interesting.', pt: 'Isso parece interessante.' }],
};
const PACK = { activities: [ACT], items: [{ id: 't-v1', en: 'these days' }, { id: 't-v2', en: 'sales department' }, { id: 't-v3', en: 'different teams' }], questions: Q };
const R = (status, score, extra = {}) => ({ status, score, evaluationMode: 'local_asr', ...extra });
let clock = 1000;
const att = (p, phase, itemId, status, score, extra) => addAttempt(p, { attemptId: `a${clock}`, phase, itemId, inputType: 'x', response: 'r', result: R(status, score, extra), now: clock++ });
const fresh = () => actProgress(emptyStore(), ACT);

test('limiar: 79 não aprova, 80 aprova; sem número nunca aprova', () => {
  assert.equal(THRESHOLD, 80);
  assert.equal(meetsThreshold(79), false);
  assert.equal(meetsThreshold(79.99), false);
  assert.equal(meetsThreshold(80), true);
  assert.equal(meetsThreshold(null), false);
  assert.equal(meetsThreshold(NaN), false);
  const p = fresh();
  assert.equal(att(p, 'vocab', 't-v1', 'passed', 79).status, 'inconclusive', '“passed” com 79 é incoerente → não aprova');
  assert.equal(att(p, 'vocab', 't-v1', 'needs_practice', 79).status, 'needs_practice');
  assert.equal(mastery(p, 'vocab', 't-v1').status, 'needs_practice');
  att(p, 'vocab', 't-v1', 'passed', 80);
  assert.equal(mastery(p, 'vocab', 't-v1').status, 'passed');
});

test('domínio individual: média ≥ 80 não compensa um item abaixo do corte', () => {
  const p = fresh();
  att(p, 'vocab', 't-v1', 'passed', 100);
  att(p, 'vocab', 't-v2', 'passed', 100);
  att(p, 'vocab', 't-v3', 'needs_practice', 79); // média 93
  const ph = phaseStatuses(PACK, ACT, p).find((x) => x.id === 'vocab');
  assert.equal(ph.state, 'needs_retry');
  assert.equal(ph.passed, 2);
  assert.equal(phaseStatuses(PACK, ACT, p).find((x) => x.id === 'dictation').state, 'locked');
});

test('item aprovado não volta a pendente quando outra tentativa (dele ou de outro) falha', () => {
  const p = fresh();
  att(p, 'vocab', 't-v1', 'passed', 90);
  att(p, 'vocab', 't-v1', 'needs_practice', 40);
  att(p, 'vocab', 't-v2', 'needs_practice', 10);
  const m = mastery(p, 'vocab', 't-v1');
  assert.equal(m.status, 'passed');
  assert.equal(m.bestValidScore, 90);
  assert.equal(m.lastValidScore, 40);
  assert.equal(nextItem(['t-v1', 't-v2', 't-v3'], p, 'vocab'), 't-v2', 'retomada: primeiro item ainda não aprovado');
});

test('inconclusivo não aprova nem reprova; pendente não aprova', () => {
  const p = fresh();
  att(p, 'reading', 't-l01', 'inconclusive', null);
  assert.equal(mastery(p, 'reading', 't-l01').status, 'inconclusive');
  assert.equal(mastery(p, 'reading', 't-l01').bestValidScore, null, 'sem nota inventada');
  addAttempt(p, { attemptId: 'pend', phase: 'translation', itemId: 't-l02', response: 'x', result: { status: 'pending', evaluationMode: 'remote_ai' }, now: clock++ });
  assert.equal(mastery(p, 'translation', 't-l02').status, 'pending_evaluation');
});

test('fases em sequência; fase sem itens no conteúdo = não aplicável (lacuna), não trava a seguinte', () => {
  const noItems = { ...ACT, itemIds: [] };
  const st = phaseStatuses(PACK, noItems, fresh());
  assert.deepEqual(st.map((x) => x.state), ['not_applicable', 'available', 'locked', 'locked', 'locked']);
  assert.deepEqual(PHASES.map((x) => x.id), ['vocab', 'dictation', 'translation', 'listening', 'reading']);
});

test('três audições concluídas liberam a produção oral (fase 1) e as questões (fase 4)', () => {
  const p = fresh();
  assert.equal(LISTENS_REQUIRED, 3);
  for (let i = 1; i <= 2; i++) { recordListen(p, 'vocab:t-v1'); assert.equal(canSpeakItem(p, 't-v1'), false); }
  recordListen(p, 'vocab:t-v1');
  assert.equal(canSpeakItem(p, 't-v1'), true);
  assert.equal(canSpeakItem(p, 't-v2'), false, 'contagem por item');
  recordListen(p, 'listening'); recordListen(p, 'listening');
  assert.equal(canAnswerQuestions(p), false);
  recordListen(p, 'listening');
  assert.equal(canAnswerQuestions(p), true);
});

test('compreensão: 8/10 aprova; abaixo disso só as erradas voltam (as acertadas não se repetem) e contam ao serem acertadas', () => {
  const p = fresh();
  for (let i = 0; i < 3; i++) recordListen(p, 'listening');
  const answers = (nRight) => Object.fromEntries(Q.map((q, i) => [q.id, i < nRight ? 'a' : 'b']));
  const r6 = gradeRound(Q, answers(6), { now: 1 });
  assert.equal(r6.correct, 6); assert.equal(r6.passed, false);
  addRound(p, r6);
  assert.equal(listeningNext(p), 'recovery');
  assert.deepEqual(comprehension(p).wrong, ['t-q7', 't-q8', 't-q9', 't-q10'], 'só as 4 erradas voltam');
  assert.equal(questionMastered(p, 't-q7'), false, 'resposta de questão ainda errada não é considerada dominada');
  // recuperação com 1 acerto: 7/10 → continua só com as 3 que faltam
  addRound(p, gradeRound(Q.slice(6), { 't-q7': 'a', 't-q8': 'b', 't-q9': 'b', 't-q10': 'b' }, { kind: 'recovery', now: 2 }));
  assert.equal(comprehension(p).tally, 7);
  assert.equal(listeningNext(p), 'recovery');
  assert.deepEqual(comprehension(p).wrong, ['t-q8', 't-q9', 't-q10']);
  assert.equal(addRound(p, r6), false, 'mesma rodada não entra duas vezes');
  // mais um acerto: 8/10 → aprovada, sem refazer as já acertadas; as 2 restantes ficam como recuperação opcional
  addRound(p, gradeRound(Q.slice(7), { 't-q8': 'a', 't-q9': 'b', 't-q10': 'b' }, { kind: 'recovery', now: 3 }));
  assert.equal(listeningNext(p), 'done');
  assert.deepEqual(comprehension(p).wrong, ['t-q9', 't-q10']);
  assert.equal(p.rounds.filter((r) => r.kind === 'full').length, 1, 'nenhuma rodada completa repetida');
  // 8/10 de primeira aprova direto
  const q = fresh(); for (let i = 0; i < 3; i++) recordListen(q, 'listening');
  addRound(q, gradeRound(Q, answers(8), { now: 4 }));
  assert.equal(listeningNext(q), 'done');
  const r7 = fresh(); for (let i = 0; i < 3; i++) recordListen(r7, 'listening');
  addRound(r7, gradeRound(Q, answers(7), { now: 5 }));
  assert.equal(listeningNext(r7), 'recovery', '7/10 não aprova');
  // sem 10 questões no conteúdo → fase indisponível (nada é inventado)
  assert.equal(listeningNext(fresh(), 9), 'blocked');
  assert.deepEqual(wrongOf(r6), ['t-q7', 't-q8', 't-q9', 't-q10']);
});

test('atividade completa só com todas as fases; resultado por item, sem XP/pontos/recompensas', () => {
  const p = fresh();
  for (const id of ACT.itemIds) att(p, 'vocab', id, 'passed', 100);
  for (const ph of ['dictation', 'translation']) for (const l of ACT.lines) att(p, ph, l.id, 'passed', 85);
  assert.equal(activityStatus(PACK, ACT, p).current.id, 'listening');
  for (let i = 0; i < 3; i++) recordListen(p, 'listening');
  addRound(p, gradeRound(Q, Object.fromEntries(Q.map((q) => [q.id, 'a'])), { now: 5 }));
  att(p, 'reading', 't-l01', 'passed', 100);
  assert.equal(activityStatus(PACK, ACT, p).state, 'in_progress');
  att(p, 'reading', 't-l02', 'inconclusive', null);
  assert.equal(activityStatus(PACK, ACT, p).state, 'in_progress', 'inconclusivo não conclui');
  att(p, 'reading', 't-l02', 'passed', 80);
  const st = settleCompletion(PACK, ACT, p, 99);
  assert.equal(st.state, 'completed');
  assert.equal(p.completedAt, 99);
  const rep = activityReport(PACK, ACT, p);
  assert.deepEqual(rep.reading.map((x) => x.status), ['passed', 'passed']);
  assert.equal(rep.reading[1].repeated, true);
  const json = JSON.stringify({ p, rep });
  for (const k of ['xp', 'points', 'coins', 'level', 'streak', 'badge', 'reward', 'ranking']) assert.ok(!new RegExp(`"${k}"`, 'i').test(json), `sem ${k}`);
});

test('tentativas idempotentes; avaliação aplicada uma vez; falha de rede mantém pendente com espera crescente', () => {
  const p = fresh();
  const mk = () => addAttempt(p, { attemptId: 'X1', phase: 'translation', itemId: 't-l01', response: 'Trabalho numa empresa', result: { status: 'pending', evaluationMode: 'remote_ai' }, now: 10 });
  mk(); mk();
  assert.equal(Object.keys(p.attempts).length, 1, 'mesmo attemptId não duplica');
  const t1 = markRetry(p, 'X1', 'falha de rede', 100);
  const t2 = markRetry(p, 'X1', 'falha de rede', 100);
  assert.ok(t2 - 100 > t1 - 100, 'espera cresce');
  assert.equal(pendingAttempts(p, 101).length, 0, 'aguarda a próxima janela');
  assert.equal(pendingAttempts(p, 101, { force: true }).length, 1, 'reenvio manual');
  assert.equal(p.attempts.X1.status, 'pending');
  assert.deepEqual(applyEvaluation(p, 'X1', { status: 'passed', score: 92, evaluationMode: 'remote_ai', rubricVersion: 'dre-translation-semantic-1', evaluatorVersion: 'g1' }, 200), { applied: true });
  assert.deepEqual(applyEvaluation(p, 'X1', { status: 'needs_practice', score: 10 }, 300), { applied: false, reason: 'already' });
  assert.equal(p.attempts.X1.score, 92);
  assert.match(newAttemptId(1, () => 0.5), /^att-1-/);
});

test('retomada: progresso serializado e recarregado continua na mesma fase e no mesmo item; ordem da escrita estável', () => {
  const store = emptyStore();
  const p = actProgress(store, ACT);
  for (const id of ACT.itemIds) att(p, 'vocab', id, 'passed', 100);
  const order = phaseOrder(p, 'dictation', ACT.lines.map((l) => l.id), () => 0);
  att(p, 'dictation', order[0], 'passed', 100);
  const again = validStore(JSON.parse(JSON.stringify(store)));
  const q = actProgress(again, ACT);
  assert.equal(activityStatus(PACK, ACT, q).current.id, 'dictation');
  assert.deepEqual(phaseOrder(q, 'dictation', ACT.lines.map((l) => l.id), () => 0.99), order, 'ordem sorteada uma vez');
  assert.equal(nextItem(order, q, 'dictation'), order[1]);
  assert.deepEqual(validStore(null), emptyStore());
});

test('escrita: contrações, BrE/AmE e números aceitos; digitação vale meio ponto; omissões reprovam abaixo de 80', () => {
  const T = ACT.lines[0].en;
  const exact = scoreWriting(checker, "I'm working for a technology company in Manchester.", T);
  assert.equal(exact.score, 100); assert.equal(exact.status, 'passed'); assert.equal(exact.feedback.kind, 'exact');
  const contr = scoreWriting(checker, 'I am working for a technology company in manchester', T);
  assert.equal(contr.score, 100); assert.equal(contr.status, 'passed');
  const typo = scoreWriting(checker, "I'm working for a tecnology company in Manchester", T);
  assert.ok(typo.score >= 80 && typo.score < 100, `um erro de digitação: ${typo.score}`);
  assert.deepEqual(typo.feedback.spelling, ['tecnology → technology']);
  const miss = scoreWriting(checker, "I'm working for a company", T);
  assert.ok(miss.score < 80); assert.equal(miss.status, 'needs_practice');
  assert.ok(miss.feedback.omissions.includes('technology') && miss.feedback.omissions.includes('manchester'));
  const extra = scoreWriting(checker, "I'm working for a big technology company in Manchester now", T);
  assert.deepEqual(extra.feedback.insertions, ['big', 'now']);
  const ame = scoreWriting(checker, 'I analyze the projects.', 'I analyse the projects.');
  assert.equal(ame.status, 'passed', 'grafia americana aceita como variante');
  assert.equal(scoreWriting(checker, '', T).status, 'inconclusive');
  assert.equal(nearToken('tecnology', 'technology'), true);
  assert.equal(nearToken('in', 'on'), false, 'palavras curtas diferentes não são “digitação”');
});

test('fala: correspondência da transcrição (não fonética); sem reconhecimento ou transcrição pobre = inconclusivo', () => {
  const T = 'That sounds interesting.';
  assert.equal(evaluateSpeech(T, null).status, 'inconclusive');
  assert.equal(evaluateSpeech(T, { text: '' }).status, 'inconclusive');
  const ok = evaluateSpeech(T, { text: 'that sounds interesting', confidence: 0 });
  assert.equal(ok.status, 'passed'); assert.equal(ok.score, 100);
  assert.equal(ok.feedback.phoneticAssessment, null, 'nunca alega avaliação fonética');
  const half = evaluateSpeech("I'm working for a technology company in Manchester.", { text: 'I am walking for a technical company in Manchester', confidence: 0 });
  assert.equal(half.status, 'needs_practice');
  assert.ok(half.score < 80);
  assert.equal(evaluateSpeech(T, { text: 'that', confidence: 0 }, { tailUnreliable: true }).status, 'inconclusive', 'transcrição cortada não reprova');
  assert.equal(evaluateSpeech(T, { text: 'that sounds interesting' }, { insufficient: true }).status, 'inconclusive', 'gravação sem voz');
});

test('tradução local: só aprova igual à referência; inglês não é tradução; o resto vai para a avaliação online', () => {
  const L = ACT.lines[1];
  assert.equal(localTranslation('isso parece interessante', L).status, 'passed');
  assert.equal(localTranslation('That sounds interesting', L).status, 'needs_practice');
  assert.equal(localTranslation('That sounds interesting', L).score, null, 'sem nota local inventada');
  assert.equal(localTranslation('Parece interessante.', L), null, 'paráfrase: decisão é da avaliação semântica');
  assert.equal(localTranslation('', L), null);
});

test('contrato online: resposta validada por esquema; incoerência ou formato inválido → inconclusivo', () => {
  const ok = { attemptId: 'A', status: 'evaluated', score: 90, meaningPreserved: true, preservedElements: ['sentido'], omissions: [], distortions: [], suggestedTranslation: 'Parece interessante.', explanationPtBr: 'Paráfrase natural.', rubricVersion: 'dre-translation-semantic-1', evaluatorVersion: 'gw-1' };
  assert.equal(validateTranslationResult(ok, { attemptId: 'A' }).status, 'passed', 'paráfrase aceita pelo avaliador');
  assert.equal(validateTranslationResult({ ...ok, score: 79 }).status, 'needs_practice');
  assert.equal(validateTranslationResult({ ...ok, meaningPreserved: false }).status, 'inconclusive', 'nota alta com sentido perdido é incoerente');
  assert.equal(validateTranslationResult({ ...ok, distortions: ['negação invertida'] }).status, 'inconclusive');
  assert.equal(validateTranslationResult({ ...ok, score: '90' }).status, 'inconclusive');
  assert.equal(validateTranslationResult({ ...ok, rubricVersion: 'outra' }).status, 'inconclusive');
  assert.equal(validateTranslationResult({ ...ok, attemptId: 'B' }, { attemptId: 'A' }).status, 'inconclusive');
  assert.equal(validateTranslationResult('<script>').status, 'inconclusive');
  assert.equal(validateTranslationResult({ ...ok, status: 'inconclusive' }).status, 'inconclusive');
  const req = translationRequest({ attemptId: 'A', act: ACT, line: ACT.lines[1], answer: 'Parece legal' });
  assert.equal(req.response.text, 'Parece legal');
  assert.ok(!/name|email|profile|user/i.test(Object.keys(req).join(' ')), 'pedido sem dados pessoais');
});

test('fila: offline mantém pendente; reconexão aplica uma vez; reenvio não duplica', async () => {
  const pack = { activities: [ACT], items: PACK.items, questions: Q };
  const store = emptyStore();
  const p = actProgress(store, ACT);
  addAttempt(p, { attemptId: 'Q1', phase: 'translation', itemId: 't-l02', response: 'Parece interessante.', result: { status: 'pending', evaluationMode: 'remote_ai' }, now: 1 });
  let calls = 0;
  const down = createRemoteEvaluator({ endpoint: 'https://gw.example', fetchImpl: async () => { calls++; throw new TypeError('Failed to fetch'); } });
  const r1 = await processQueue(store, pack, down, { now: () => 10 });
  assert.equal(r1.failed, 1);
  assert.equal(p.attempts.Q1.status, 'pending', 'falha de rede não apaga nem reprova');
  const seen = [];
  const up = createRemoteEvaluator({ endpoint: 'https://gw.example', fetchImpl: async (url, init) => {
    calls++; seen.push({ url, key: init.headers['idempotency-key'], body: JSON.parse(init.body) });
    return { ok: true, status: 200, json: async () => ({ attemptId: 'Q1', status: 'evaluated', score: 95, meaningPreserved: true, preservedElements: [], omissions: [], distortions: [], suggestedTranslation: 'Parece interessante.', explanationPtBr: 'Ok.', rubricVersion: 'dre-translation-semantic-1', evaluatorVersion: 'gw-1' }) };
  } });
  const r2 = await processQueue(store, pack, up, { now: () => 20, force: true });
  assert.equal(r2.applied, 1);
  assert.equal(p.attempts.Q1.status, 'passed');
  assert.equal(seen[0].url, 'https://gw.example/v1/evaluate/translation');
  assert.equal(seen[0].key, 'Q1');
  const r3 = await processQueue(store, pack, up, { now: () => 30, force: true });
  assert.equal(r3.sent, 0, 'nada pendente: não reenvia');
  assert.equal(Object.keys(p.attempts).length, 1);
  // resposta fora do esquema → inconclusivo (não aprova)
  addAttempt(p, { attemptId: 'Q2', phase: 'translation', itemId: 't-l01', response: 'x', result: { status: 'pending', evaluationMode: 'remote_ai' }, now: 2 });
  const evil = createRemoteEvaluator({ endpoint: 'https://gw.example', fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ status: 'evaluated', score: 100, rubricVersion: 'dre-translation-semantic-1', evaluatorVersion: 'x' }) }) });
  await processQueue(store, pack, evil, { now: () => 40, force: true });
  assert.equal(p.attempts.Q2.status, 'inconclusive');
  // bloqueios: sem endpoint, sem consentimento, sem internet
  assert.equal(remoteBlocker({ config: { endpoint: null }, consent: true, online: true }).code, 'not-configured');
  assert.equal(remoteBlocker({ config: { endpoint: 'https://x' }, consent: false, online: true }).code, 'consent');
  assert.equal(remoteBlocker({ config: { endpoint: 'https://x' }, consent: true, online: false }).code, 'offline');
  assert.equal(evaluationConfig({ evaluation: { endpoint: 'http://inseguro' } }).endpoint, null, 'só HTTPS');
});

test('The Story of John: sete partes, IDs únicos e estáveis, texto literal, traduções presentes, sem códigos ACT nem nomes fora do elenco', () => {
  assert.equal(JOHN.parts.length, 7);
  assert.deepEqual(JOHN.parts.map((x) => x.n), [1, 2, 3, 4, 5, 6, 7]);
  const ids = [...JOHN.activities.map((a) => a.id), ...JOHN.activities.flatMap((a) => a.lines.map((l) => l.id)), ...JOHN.items.map((i) => i.id)];
  assert.equal(new Set(ids).size, ids.length, 'ids únicos');
  for (const id of ids) assert.match(id, /^john-p[1-7]-[ex]\d\d(-[lv]\d\d)?$/);
  assert.ok(!/\b(ACT|SRC|MAT|EX|VOC)-\d/.test(JSON.stringify(JOHN)), 'sem códigos pedagógicos');
  const lines = JOHN.activities.flatMap((a) => a.lines);
  assert.ok(lines.length >= 250);
  for (const l of lines) { assert.ok(l.en && l.pt, l.id); assert.ok(!/\*\*/.test(l.en + l.pt), `${l.id}: sem marcação Markdown`); }
  // conferência literal com os documentos (a mesma do gerador, refeita aqui)
  const src = (f) => readFileSync(new URL(`../../content/dialogues/source/the-story-of-john/${f}`, import.meta.url), 'utf8').split('\n');
  for (const l of lines) {
    const md = src(l.src.file);
    assert.ok(md[l.src.line - 1].includes(l.en), `${l.id}: inglês literal`);
    assert.ok(md[l.src.ptLine - 1].includes(l.pt), `${l.id}: português literal`);
  }
  const cast = new Set(['john', 'mary', 'rick', 'jessy', 'peter', 'ruan', 'stuart', 'ana', 'ketlyn', 'joana', 'rodri', 'penelope']);
  for (const id of new Set(lines.map((l) => l.speakerId))) assert.ok(cast.has(id) || id.startsWith('role-'), `fala de ${id}: só elenco autoral ou papel genérico`);
  assert.equal(JOHN.activities[0].lines[0].en, 'Do you remember John Bennett?');
  assert.equal(JOHN.activities[0].lines[0].pt, 'Rick: Você se lembra do John Bennett?'.slice(6));
  // itens: tipo, vínculo com as falas e texto falado
  assert.equal(spokenItem('sister / uncle'), 'sister, uncle');
  assert.equal(spokenItem('What do you think of...?'), 'What do you think of?');
  assert.ok(JOHN.items.every((i) => ['word', 'phrasal_verb', 'collocation', 'chunk', 'expression', 'pattern'].includes(i.type)));
  // fase 4: diálogo com 10 questões não tem problema de conteúdo; diálogo curto aparece com diagnóstico
  const a1 = JOHN.activities[0];
  assert.equal(requiredOf(JOHN, a1, 'listening').length, 10);
  assert.ok(!contentProblems(JOHN, a1).some((x) => x.code === 'questions'));
  const short = JOHN.activities.find((a) => a.id === 'john-p2-x02');
  assert.equal(contentProblems(JOHN, short).find((x) => x.code === 'questions').code, 'questions');
});

test('questões de compreensão: estrutura, evidência citada, sem resposta repetida nas alternativas, status de validação explícito', () => {
  const byId = new Map(JOHN.activities.map((a) => [a.id, a]));
  const ids = JOHN.questions.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(JOHN.questions.length >= 400);
  for (const q of JOHN.questions) {
    const a = byId.get(q.activityId);
    assert.ok(a, q.id);
    assert.ok(a.questionIds.includes(q.id));
    assert.equal(q.options.length, 3, q.id);
    assert.ok(q.options.some((o) => o.id === q.correctOptionId), q.id);
    assert.equal(new Set(q.options.map((o) => o.text.toLowerCase())).size, 3, `${q.id}: alternativas distintas`);
    assert.ok(['explicit_fact', 'action', 'intention', 'context', 'relation', 'inference'].includes(q.skill), q.id);
    assert.ok(q.sourceLineIds.length || q.sourceRefs.some((r) => r === 'ctx' || r === 'title'), `${q.id}: evidência`);
    for (const lid of q.sourceLineIds) assert.ok(a.lines.some((l) => l.id === lid), `${q.id}: fala ${lid}`);
    assert.match(q.explanation, /No diálogo — /, `${q.id}: explicação com a evidência`);
    assert.match(q.status, /não validado pelo professor/);
  }
  // equilíbrio: nenhum diálogo completo só com fatos explícitos
  for (const a of JOHN.activities.filter((x) => x.questionIds.length >= 10)) {
    const qs = JOHN.questions.filter((q) => q.activityId === a.id);
    assert.ok(qs.filter((q) => q.skill !== 'explicit_fact').length >= 3, `${a.id}: pelo menos 3 questões além de fatos explícitos`);
  }
  const full = JOHN.activities.filter((a) => a.questionIds.length >= 10).length;
  assert.equal(full, 30);
});
