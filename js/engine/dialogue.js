// Atividade de diálogo em cinco fases — regras puras (sem DOM, sem rede, sem fornecedor de IA).
// Especificação: docs/produto/mvp-dialogo/02, 03 e 05.
//
//  Fase 1 vocab       — cada item ouvido 3× (reprodução concluída) → produção oral → correspondência ≥ 80% por item
//  Fase 2 dictation   — pista em português + áudio em inglês → aluno escreve em inglês → ≥ 80% por frase
//  Fase 3 translation — fala em inglês → aluno traduz para português → avaliação semântica ≥ 80% por fala
//  Fase 4 listening   — diálogo completo ouvido 3× → 10 questões → rodada aprovada com ≥ 8/10
//  Fase 5 reading     — leitura em voz alta de cada fala → correspondência confiável ≥ 80% por fala
//
// Princípios codificados aqui:
//  • domínio INDIVIDUAL: cada item precisa de uma tentativa aprovada; média nunca compensa item fraco;
//  • item aprovado continua aprovado (tentativas posteriores não o reabrem);
//  • `inconclusive` e `pending` não aprovam nem reprovam; percentual só existe quando a evidência permite medir;
//  • tudo é derivado das TENTATIVAS persistidas (não de estado de tela); cada tentativa tem `attemptId` único e
//    aplicar o mesmo resultado duas vezes não muda nada (idempotência);
//  • versões de rubrica/avaliador ficam gravadas em cada tentativa (mudar a rubrica não reescreve o passado).

export const THRESHOLD = 80;
export const LISTENS_REQUIRED = 3;
export const QUESTIONS_TOTAL = 10;
export const QUESTIONS_PASS = 8;

export const PHASES = [
  { id: 'vocab', n: 1, title: 'Vocabulário e expressões', short: 'Vocabulário' },
  { id: 'dictation', n: 2, title: 'Escuta e escrita', short: 'Escrita' },
  { id: 'translation', n: 3, title: 'Tradução do diálogo', short: 'Tradução' },
  { id: 'listening', n: 4, title: 'Compreensão auditiva', short: 'Compreensão' },
  { id: 'reading', n: 5, title: 'Leitura em voz alta', short: 'Leitura' },
];
export const phaseById = (id) => PHASES.find((p) => p.id === id) || null;

/** Versões das rubricas e avaliadores locais (gravadas em cada tentativa). */
export const RUBRICS = {
  vocab: 'dre-speech-lexical-1',
  dictation: 'dre-writing-1',
  translation: 'dre-translation-semantic-1',
  listening: 'dre-comprehension-2', // 2: recuperação só das erradas conta para a rodada (sem nova rodada completa)
  reading: 'dre-speech-lexical-1',
};
export const EVALUATORS = {
  local_deterministic: 'dre-local-1',
  local_asr: 'dre-local-asr-1',
};

/** 80% é o corte: 79 não aprova, 80 aprova. Sem número (evidência insuficiente) nunca aprova. */
export const meetsThreshold = (score, threshold = THRESHOLD) => typeof score === 'number' && Number.isFinite(score) && score >= threshold;

// ---------------------------------------------------------------------------------------------------------
// Conteúdo
// ---------------------------------------------------------------------------------------------------------

/** Pacote de diálogos carregado (data/dialogues.js → window.DRG_DIALOGUES). */
export const dialoguePack = (pack = globalThis.DRG_DIALOGUES) => (pack && Array.isArray(pack.activities) ? pack : null);
export const activityById = (pack, id) => (pack ? pack.activities.find((a) => a.id === id) || null : null);
export const itemsOf = (pack, act) => act.itemIds.map((id) => pack.items.find((x) => x.id === id)).filter(Boolean);
export const questionsOf = (pack, act) => (act.questionIds || []).map((id) => (pack.questions || []).find((x) => x.id === id)).filter(Boolean);

/** Texto falado de um item (“sister / uncle” → “sister, uncle”; “What do you think of...?” → “What do you think of?”). */
export function spokenItem(en) {
  return String(en).split(/\s*\/\s*/).map((v) => v.replace(/\(.*?\)/g, '').replace(/\s*(\.\.\.|…)\s*/g, ' ').replace(/\s+([?.!,])/g, '$1').replace(/\s+/g, ' ').trim())
    .filter(Boolean).join(', ');
}

/** Itens obrigatórios de cada fase (ids estáveis do conteúdo). */
export function requiredOf(pack, act, phaseId) {
  switch (phaseId) {
    case 'vocab': return act.itemIds.slice();
    case 'dictation': case 'translation': case 'reading': return act.lines.map((l) => l.id);
    case 'listening': return (act.questionIds || []).slice();
    default: return [];
  }
}

/** Diagnóstico de conteúdo da atividade: o que impede uma fase (sem inventar nada). */
export function contentProblems(pack, act, { hasAudio = () => true } = {}) {
  const out = [];
  const qs = questionsOf(pack, act);
  if (qs.length < QUESTIONS_TOTAL) out.push({ phase: 'listening', code: 'questions', text: `Questões de compreensão: ${qs.length} de ${QUESTIONS_TOTAL} — o texto do diálogo não sustenta mais questões sem inventar conteúdo (fase 4 indisponível; decisão do Product Owner pendente).` });
  for (const q of qs) if (!q.options || q.options.length < 2 || !q.options.some((o) => o.id === q.correctOptionId)) out.push({ phase: 'listening', code: 'question-invalid', text: `Questão ${q.id} inválida (alternativas/gabarito).` });
  const noAudio = act.lines.filter((l) => !hasAudio(l.audio));
  if (noAudio.length) out.push({ phase: 'audio', code: 'audio', text: `${noAudio.length} fala(s) sem áudio gravado.`, ids: noAudio.map((l) => l.id) });
  return out;
}

// ---------------------------------------------------------------------------------------------------------
// Progresso (kv → 'dialogues'): separado das jornadas Daily Routine e Conversation Practice
// ---------------------------------------------------------------------------------------------------------

export const STORE_KEY = 'dialogues';
export const emptyStore = () => ({ v: 1, acts: {}, consent: { online: false, at: null } });
export function validStore(s) {
  if (!s || s.v !== 1 || typeof s.acts !== 'object' || !s.acts) return emptyStore();
  if (!s.consent) s.consent = { online: false, at: null };
  return s;
}
export function actProgress(store, act) {
  const p = store.acts[act.id] || (store.acts[act.id] = { contentVersion: act.contentVersion || null, startedAt: null, completedAt: null, attempts: {}, listens: {}, rounds: [], notes: '', order: {} });
  p.attempts = p.attempts || {}; p.listens = p.listens || {}; p.rounds = p.rounds || []; p.order = p.order || {};
  return p;
}

/** Identificador único de tentativa (idempotência). `rand` injetável nos testes. */
export function newAttemptId(now = Date.now(), rand = Math.random) {
  return `att-${now.toString(36)}-${Math.floor(rand() * 0xffffffff).toString(36).padStart(7, '0')}`;
}

/** Audição concluída (só chamar depois do fim REAL da reprodução). key: 'vocab:<itemId>' | 'listening'. */
export function recordListen(p, key, now = Date.now()) {
  p.listens[key] = (p.listens[key] || 0) + 1;
  if (!p.startedAt) p.startedAt = now;
  return p.listens[key];
}
export const listensOf = (p, key) => (p && p.listens && p.listens[key]) || 0;
export const canSpeakItem = (p, itemId) => listensOf(p, `vocab:${itemId}`) >= LISTENS_REQUIRED;
export const canAnswerQuestions = (p) => listensOf(p, 'listening') >= LISTENS_REQUIRED;

/**
 * Registra uma tentativa (já avaliada localmente ou pendente de avaliação online).
 * Tentativa com o mesmo attemptId já registrada não é duplicada.
 * result: { status: 'passed'|'needs_practice'|'inconclusive'|'pending', score?, feedback?, evidence?, evaluationMode, rubricVersion, evaluatorVersion }
 */
export function addAttempt(p, { attemptId, phase, itemId, inputType, response, result, now = Date.now() }) {
  if (p.attempts[attemptId]) return p.attempts[attemptId];
  const a = {
    attemptId, phase, itemId, inputType, response: response ?? null,
    status: result.status, score: typeof result.score === 'number' ? result.score : null, threshold: THRESHOLD,
    feedback: result.feedback || null, evidence: result.evidence || null,
    evaluationMode: result.evaluationMode, rubricVersion: result.rubricVersion || RUBRICS[phase], evaluatorVersion: result.evaluatorVersion || null,
    createdAt: now, evaluatedAt: result.status === 'pending' ? null : now,
    syncStatus: result.status === 'pending' ? 'queued' : 'local', tries: 0, nextTryAt: 0, lastError: null,
  };
  // coerência: “passed” exige número ≥ 80; número < 80 não pode ser “passed”
  if (a.status === 'passed' && !meetsThreshold(a.score)) a.status = 'inconclusive';
  if (a.status === 'needs_practice' && a.score !== null && meetsThreshold(a.score)) a.status = 'passed';
  p.attempts[attemptId] = a;
  if (!p.startedAt) p.startedAt = now;
  return a;
}

/**
 * Aplica o resultado de uma avaliação remota a uma tentativa pendente. Idempotente: tentativa já avaliada não muda
 * (um reenvio que volta depois não duplica nem sobrescreve).
 */
export function applyEvaluation(p, attemptId, result, now = Date.now()) {
  const a = p.attempts[attemptId];
  if (!a) return { applied: false, reason: 'unknown' };
  if (a.status !== 'pending') return { applied: false, reason: 'already' };
  if (result.status === 'pending') return { applied: false, reason: 'still-pending' };
  a.status = result.status;
  a.score = typeof result.score === 'number' ? result.score : null;
  if (a.status === 'passed' && !meetsThreshold(a.score)) a.status = 'inconclusive';
  if (a.status === 'needs_practice' && a.score !== null && meetsThreshold(a.score)) a.status = 'passed';
  a.feedback = result.feedback || null;
  a.evidence = result.evidence || null;
  a.evaluationMode = result.evaluationMode || 'remote_ai';
  a.rubricVersion = result.rubricVersion || a.rubricVersion;
  a.evaluatorVersion = result.evaluatorVersion || a.evaluatorVersion;
  a.evaluatedAt = now;
  a.syncStatus = 'done';
  return { applied: true };
}

/** Falha de rede/serviço: a tentativa continua pendente; próxima tentativa com espera crescente (até 30 min). */
export function markRetry(p, attemptId, error, now = Date.now()) {
  const a = p.attempts[attemptId];
  if (!a || a.status !== 'pending') return null;
  a.tries = (a.tries || 0) + 1;
  a.lastError = String(error || 'erro');
  a.syncStatus = 'retry';
  a.nextTryAt = now + Math.min(30 * 60e3, 15e3 * 2 ** Math.min(a.tries - 1, 7));
  return a.nextTryAt;
}
/** Tentativas pendentes que podem ser (re)enviadas agora, mais antigas primeiro. */
export const pendingAttempts = (p, now = Date.now(), { force = false } = {}) =>
  Object.values(p.attempts).filter((a) => a.status === 'pending' && (force || !a.nextTryAt || a.nextTryAt <= now)).sort((x, y) => x.createdAt - y.createdAt);

/** Domínio de um item numa fase, derivado das tentativas. */
export function mastery(p, phase, itemId) {
  const list = Object.values((p && p.attempts) || {}).filter((a) => a.phase === phase && a.itemId === itemId).sort((x, y) => x.createdAt - y.createdAt);
  const valid = list.filter((a) => a.score !== null && (a.status === 'passed' || a.status === 'needs_practice'));
  const passed = list.some((a) => a.status === 'passed');
  const last = list[list.length - 1] || null;
  let status = 'unseen';
  if (passed) status = 'passed';
  else if (list.some((a) => a.status === 'pending')) status = 'pending_evaluation';
  else if (last) status = last.status; // needs_practice | inconclusive
  return {
    itemId, phase, status, attemptCount: list.length,
    bestValidScore: valid.length ? Math.max(...valid.map((a) => a.score)) : null,
    lastValidScore: valid.length ? valid[valid.length - 1].score : null,
    lastAttempt: last, passedAttempt: list.find((a) => a.status === 'passed') || null,
    lastPractisedAt: last ? last.createdAt : null,
  };
}

// ---------------------------------------------------------------------------------------------------------
// Compreensão (fase 4): rodadas de 10 questões; feedback só depois do envio da rodada
// ---------------------------------------------------------------------------------------------------------

/**
 * Corrige uma rodada. answers: { [questionId]: optionId }. Questões sem resposta contam como erradas.
 * kind 'full' (as 10, decide a fase) ou 'recovery' (só as erradas da rodada anterior, para estudo com explicação).
 */
export function gradeRound(questions, answers, { kind = 'full', now = Date.now(), id } = {}) {
  const results = questions.map((q) => ({ questionId: q.id, chosen: answers[q.id] ?? null, correct: answers[q.id] === q.correctOptionId }));
  const correct = results.filter((r) => r.correct).length;
  return { id: id || `round-${now.toString(36)}`, kind, submittedAt: now, total: questions.length, correct, results,
    passed: kind === 'full' && questions.length === QUESTIONS_TOTAL && correct >= QUESTIONS_PASS, rubricVersion: RUBRICS.listening };
}
export function addRound(p, round) {
  if (p.rounds.some((r) => r.id === round.id)) return false;
  p.rounds.push(round);
  if (!p.startedAt) p.startedAt = round.submittedAt;
  return true;
}
/**
 * Compreensão a partir das rodadas gravadas: a rodada completa (10 questões) mais as recuperações feitas depois dela.
 * Cada questão errada é reapresentada SOZINHA (sem repetir as já acertadas); acertada na recuperação, passa a contar.
 * A fase é aprovada quando a rodada chega a ≥ 8/10 (contando as questões recuperadas). → { round, mastered:Set, wrong:[ids], tally }
 */
export function comprehension(p) {
  let full = -1;
  p.rounds.forEach((r, i) => { if (r.kind === 'full') full = i; });
  if (full < 0) return null;
  const round = p.rounds[full];
  const mastered = new Set(round.results.filter((r) => r.correct).map((r) => r.questionId));
  for (const r of p.rounds.slice(full + 1)) if (r.kind === 'recovery') r.results.forEach((x) => { if (x.correct) mastered.add(x.questionId); });
  const wrong = round.results.map((r) => r.questionId).filter((id) => !mastered.has(id));
  return { round, mastered, wrong, tally: mastered.size, total: round.total };
}
/** Questão já acertada (na rodada ou na recuperação): só então a resposta certa e a explicação completa aparecem. */
export const questionMastered = (p, id) => { const c = comprehension(p); return !!c && c.mastered.has(id); };

/** O que a fase 4 pede agora: 'blocked' | 'listen' | 'full' | 'recovery' | 'done'. */
export function listeningNext(p, questionsCount = QUESTIONS_TOTAL) {
  if (questionsCount < QUESTIONS_TOTAL) return 'blocked';
  const c = comprehension(p);
  if (c && c.total === QUESTIONS_TOTAL && c.tally >= QUESTIONS_PASS) return 'done';
  if (!canAnswerQuestions(p)) return 'listen';
  if (c && c.wrong.length) return 'recovery';
  return 'full';
}
export const wrongOf = (round) => (round ? round.results.filter((r) => !r.correct).map((r) => r.questionId) : []);

// ---------------------------------------------------------------------------------------------------------
// Fases e atividade
// ---------------------------------------------------------------------------------------------------------

/**
 * Situação de cada fase: locked | available | in_progress | pending_online | needs_retry | completed | blocked_by_content | not_applicable.
 * Fase sem itens obrigatórios no conteúdo (ex.: atividade sem vocabulário curado) = not_applicable (registrada como lacuna
 * de conteúdo, não como domínio demonstrado) e não trava a seguinte.
 */
export function phaseStatuses(pack, act, p) {
  const out = [];
  let prevDone = true;
  for (const ph of PHASES) {
    const ids = requiredOf(pack, act, ph.id);
    const items = ids.map((id) => (ph.id === 'listening' ? null : mastery(p, ph.id, id))).filter(Boolean);
    const passed = items.filter((m) => m.status === 'passed').length;
    const pending = items.filter((m) => m.status === 'pending_evaluation').length;
    const failing = items.filter((m) => m.status === 'needs_practice' || m.status === 'inconclusive').length;
    const touched = items.filter((m) => m.status !== 'unseen').length;
    let state;
    if (ph.id === 'listening') {
      const next = listeningNext(p, ids.length);
      const st = next === 'blocked' ? 'blocked_by_content' : next === 'done' ? 'completed' : null;
      state = !prevDone ? 'locked' : st || (p.rounds.length || listensOf(p, 'listening') ? (next === 'recovery' ? 'needs_retry' : 'in_progress') : 'available');
      out.push({ ...ph, state, total: ids.length, passed: state === 'completed' ? ids.length : 0, pending: 0, failing: 0, next });
    } else if (!ids.length) {
      state = prevDone ? 'not_applicable' : 'locked';
      out.push({ ...ph, state, total: 0, passed: 0, pending: 0, failing: 0 });
    } else {
      const complete = passed === ids.length;
      state = !prevDone ? 'locked' : complete ? 'completed' : pending && !failing && passed + pending === ids.length ? 'pending_online'
        : failing && touched === ids.length ? 'needs_retry' : touched ? 'in_progress' : 'available';
      out.push({ ...ph, state, total: ids.length, passed, pending, failing });
    }
    const last = out[out.length - 1];
    prevDone = prevDone && (last.state === 'completed' || last.state === 'not_applicable');
  }
  return out;
}

/** Estado da atividade: not_started | in_progress | waiting_for_online_evaluation | completed | blocked_by_content. */
export function activityStatus(pack, act, p) {
  const phases = phaseStatuses(pack, act, p);
  const current = phases.find((x) => x.state !== 'completed' && x.state !== 'not_applicable') || null;
  let state;
  if (!current) state = 'completed';
  else if (current.state === 'blocked_by_content') state = 'blocked_by_content';
  else if (current.state === 'pending_online') state = 'waiting_for_online_evaluation';
  else if (!p || (!p.startedAt && !Object.keys(p.attempts || {}).length)) state = 'not_started';
  else state = 'in_progress';
  const done = phases.filter((x) => x.state === 'completed' || x.state === 'not_applicable').length;
  return { state, phases, current, done, ratio: done / PHASES.length };
}

/** Item pendente mais relevante da fase (retomada): o primeiro, na ordem da sessão, que ainda não foi aprovado. */
export function nextItem(order, p, phase) {
  for (const id of order) {
    const m = mastery(p, phase, id);
    if (m.status !== 'passed') return id;
  }
  return null;
}

/** Ordem embaralhada estável da fase (frases da escrita por escuta): sorteada uma vez e guardada; ids estáveis. */
export function phaseOrder(p, phase, ids, rand = Math.random) {
  const saved = p.order[phase];
  if (saved && saved.length === ids.length && saved.every((id) => ids.includes(id))) return saved;
  const out = ids.slice();
  if (phase === 'dictation') for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  p.order[phase] = out;
  return out;
}

/** Marca a conclusão (só quando todas as fases estão concluídas e nada depende de avaliação pendente). */
export function settleCompletion(pack, act, p, now = Date.now()) {
  const st = activityStatus(pack, act, p);
  if (st.state === 'completed' && !p.completedAt) p.completedAt = now;
  return st;
}

/** Resumo final por fase e por item (sem pontuação total como substituto e sem XP/recompensa). */
export function activityReport(pack, act, p) {
  const st = activityStatus(pack, act, p);
  const items = (phase) => requiredOf(pack, act, phase).map((id) => {
    const m = mastery(p, phase, id);
    return { id, status: m.status, best: m.bestValidScore, attempts: m.attemptCount, repeated: m.attemptCount > 1 };
  });
  return {
    state: st.state, phases: st.phases,
    vocab: items('vocab'), dictation: items('dictation'), translation: items('translation'), reading: items('reading'),
    comprehension: (() => { const c = comprehension(p); return c ? { firstRound: c.round.correct, tally: c.tally, total: c.total, recovered: c.tally - c.round.correct, stillWrong: c.wrong.length, passed: c.tally >= QUESTIONS_PASS } : null; })(),
    pending: Object.values(p.attempts).filter((a) => a.status === 'pending').length,
    inconclusive: Object.values(p.attempts).filter((a) => a.status === 'inconclusive').length,
  };
}
