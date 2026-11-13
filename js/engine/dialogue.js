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
export const QUESTIONS_TOTAL = 10; // rodada padrão
export const QUESTIONS_PASS = 8; // corte da rodada padrão (8/10 = 80%)
/** Corte proporcional de uma rodada com n questões: o menor número de acertos que atinge 80% (10 → 8; 9 → 8; 7 → 6; 5 → 4; 3 → 3). */
export const passMark = (n) => Math.ceil((n * THRESHOLD) / 100 - 1e-9);

export const PHASES = [
  { id: 'vocab', n: 1, title: 'Vocabulário e expressões', short: 'Vocabulário' },
  { id: 'dictation', n: 2, title: 'Escuta e escrita', short: 'Escrita' },
  { id: 'translation', n: 3, title: 'Tradução do diálogo', short: 'Tradução' },
  { id: 'listening', n: 4, title: 'Compreensão auditiva', short: 'Compreensão' },
  { id: 'reading', n: 5, title: 'Leitura em voz alta', short: 'Leitura' },
];
// Formato em camadas (documento-fonte aprovado de john-p1-e01, 2026-11-13): unidades (1–3) → frases (4–6) → diálogo (7).
// A etapa 7 reaproveita as fases existentes: escuta global + compreensão, leitura/produção oral e tradução.
export const LAYER_PHASES = [
  { id: 'u-write', n: 1, step: 1, layer: 'unit', mode: 'write', title: 'Conhecer e escrever as unidades', short: 'Unidades · escrever' },
  { id: 'u-speak', n: 2, step: 2, layer: 'unit', mode: 'speak', title: 'Escutar três vezes e falar as unidades', short: 'Unidades · falar' },
  { id: 'u-listen', n: 3, step: 3, layer: 'unit', mode: 'listen', title: 'Ouvir e escrever as unidades', short: 'Unidades · ouvir' },
  { id: 's-write', n: 4, step: 4, layer: 'sentence', mode: 'write', title: 'Conhecer e escrever as frases', short: 'Frases · escrever' },
  { id: 's-speak', n: 5, step: 5, layer: 'sentence', mode: 'speak', title: 'Escutar três vezes e falar as frases', short: 'Frases · falar' },
  { id: 's-listen', n: 6, step: 6, layer: 'sentence', mode: 'listen', title: 'Listening de frases', short: 'Frases · ouvir' },
  { id: 'listening', n: '7.1', step: 7, layer: 'dialogue', title: 'Escuta global e compreensão', short: 'Diálogo · compreensão' },
  { id: 'reading', n: '7.2', step: 7, layer: 'dialogue', title: 'Escuta acompanhada, leitura e produção oral', short: 'Diálogo · leitura' },
  { id: 'translation', n: '7.3', step: 7, layer: 'dialogue', title: 'Tradução', short: 'Diálogo · tradução' },
];
export const isLayered = (act) => !!act && act.format === 'layers-v1';
// Progressão tolerante (validação real no Galaxy S25+, decisão do PO de 2026-11-13): nas etapas com itens do formato em
// camadas (1–6 e a leitura 7.2), um item que não passa em MAX_TRIES tentativas pode ficar PENDENTE (o aluno segue sem
// concluí-lo); a etapa é aprovada pelo aproveitamento ≥ 80% dos itens efetivamente avaliados (ver phaseScore).
export const MAX_TRIES = 3;
export const TOLERANT_PHASES = ['u-write', 'u-speak', 'u-listen', 's-write', 's-speak', 's-listen', 'reading'];
export const isTolerant = (act, phaseId) => isLayered(act) && TOLERANT_PHASES.includes(phaseId);
export const phasesOf = (act) => (isLayered(act) ? LAYER_PHASES : PHASES);
export const phaseById = (id, act = null) => phasesOf(act).find((p) => p.id === id) || null;
/** Atividades na experiência ativa (pack.active, de content/dialogues/rollout.json; null = todas). As demais ficam nos dados. */
export const isActive = (pack, act) => !!act && (!pack || !Array.isArray(pack.active) || pack.active.includes(act.id));
export const activeActivities = (pack) => (pack ? pack.activities.filter((a) => isActive(pack, a)) : []);

/** Versões das rubricas e avaliadores locais (gravadas em cada tentativa). */
export const RUBRICS = {
  'u-write': 'dre-writing-1', 'u-speak': 'dre-speech-lexical-1', 'u-listen': 'dre-writing-1',
  's-write': 'dre-writing-1', 's-speak': 'dre-speech-lexical-1', 's-listen': 'dre-writing-1',
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
    case 'u-write': case 'u-speak': case 'u-listen': return (act.unitIds || []).slice();
    case 's-write': case 's-speak': case 's-listen': return (act.sentenceIds || []).slice();
    case 'dictation': case 'translation': case 'reading': return act.lines.map((l) => l.id);
    case 'listening': return (act.questionIds || []).slice();
    default: return [];
  }
}

/** Diagnóstico de conteúdo da atividade: o que impede uma fase (sem inventar nada). */
export function contentProblems(pack, act, { hasAudio = () => true } = {}) {
  const out = [];
  const qs = questionsOf(pack, act);
  if (!qs.length) out.push({ phase: 'listening', code: 'questions', text: 'Sem questões de compreensão para este diálogo.' });
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
  p.skipped = p.skipped || {}; // { [fase]: { [itemId]: quando } } — itens deixados pendentes depois de MAX_TRIES tentativas
  p.phaseApproved = p.phaseApproved || {}; // { [fase]: quando } — etapa aprovada pelo aproveitamento continua aprovada
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
export const canSpeakItem = (p, itemId, phase = 'vocab') => listensOf(p, `${phase}:${itemId}`) >= LISTENS_REQUIRED;
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
// Itens pendentes e aproveitamento da etapa (formato em camadas)
// ---------------------------------------------------------------------------------------------------------

/** Tentativas sem sucesso de um item (resposta abaixo do corte ou falha/dúvida do reconhecimento). */
export const failedTries = (p, phase, itemId) => Object.values((p && p.attempts) || {})
  .filter((a) => a.phase === phase && a.itemId === itemId && (a.status === 'needs_practice' || a.status === 'inconclusive')).length;
/** Item deixado pendente pelo aluno (e ainda não aprovado: aprovação posterior prevalece). */
export const isSkipped = (p, phase, itemId) => !!(p && p.skipped && p.skipped[phase] && p.skipped[phase][itemId]) && mastery(p, phase, itemId).status !== 'passed';
/** “Continuar sem concluir” só aparece depois de MAX_TRIES tentativas sem sucesso de um item ainda não aprovado. */
export const canSkip = (p, phase, itemId) => mastery(p, phase, itemId).status !== 'passed' && failedTries(p, phase, itemId) >= MAX_TRIES;
/** Deixa o item pendente (para revisão). Não é acerto: continua fora dos aprovados. Idempotente. */
export function skipItem(p, phase, itemId, now = Date.now()) {
  if (!canSkip(p, phase, itemId)) return false;
  p.skipped = p.skipped || {};
  const s = p.skipped[phase] || (p.skipped[phase] = {});
  if (!s[itemId]) s[itemId] = now;
  return true;
}

/**
 * Resultado de um item para o aproveitamento, separando as três situações:
 *  passed    — aprovado;
 *  error     — resposta avaliada abaixo do corte (erro real do aluno);
 *  technical — só tentativas inconclusivas (falha ou dúvida do reconhecedor): não conta contra o aluno;
 *  pending   — aguardando avaliação online;  unseen — sem tentativa.
 */
export function itemOutcome(p, phase, itemId) {
  const m = mastery(p, phase, itemId);
  if (m.status === 'passed') return 'passed';
  if (m.status === 'pending_evaluation') return 'pending';
  const list = Object.values((p && p.attempts) || {}).filter((a) => a.phase === phase && a.itemId === itemId);
  if (list.some((a) => a.status === 'needs_practice')) return 'error';
  if (list.some((a) => a.status === 'inconclusive')) return 'technical';
  return 'unseen';
}

/**
 * Aproveitamento de uma etapa tolerante. Itens resolvidos = aprovados + pendentes deixados pelo aluno.
 * Avaliados = aprovados + itens com erro real; item só com falha do reconhecedor fica fora da conta (não penaliza o aluno)
 * e continua pendente. Aprovação: todos resolvidos, ≥ 80% dos itens avaliados (evidência mínima — sem evidência, não
 * decide) e acertos ≥ 80% dos avaliados (ex.: 10 itens, 9 aprovados e 1 pendente com erro → 9/10 = 90%, aprovada).
 * Pendente nunca conta como acerto.
 */
export function phaseScore(pack, act, p, phaseId) {
  const ids = requiredOf(pack, act, phaseId);
  const out = { total: ids.length, passed: 0, error: 0, technical: 0, skipped: 0, unresolved: 0, evaluated: 0, ratio: null, coverage: 0, approved: false, pendingIds: [] };
  for (const id of ids) {
    const o = itemOutcome(p, phaseId, id);
    if (o === 'passed') { out.passed++; continue; }
    if (o === 'error') out.error++;
    if (o === 'technical') out.technical++;
    out.pendingIds.push(id);
    if (isSkipped(p, phaseId, id)) out.skipped++; else out.unresolved++;
  }
  out.evaluated = out.passed + out.error;
  out.ratio = out.evaluated ? Math.floor((100 * out.passed) / out.evaluated) : null;
  out.coverage = out.total ? Math.floor((100 * out.evaluated) / out.total) : 0;
  out.approved = out.total > 0 && out.unresolved === 0 && out.evaluated > 0
    && 100 * out.evaluated >= THRESHOLD * out.total && 100 * out.passed >= THRESHOLD * out.evaluated;
  return out;
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
    passed: kind === 'full' && questions.length > 0 && correct >= passMark(questions.length), passMark: passMark(questions.length), rubricVersion: RUBRICS.listening };
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

/** O que a fase 4 pede agora: 'none' (diálogo sem questões) | 'listen' | 'full' | 'recovery' | 'done'.
 *  Rodada com todas as questões que o diálogo sustenta (padrão 10; diálogos curtos, menos), aprovada com 80% (passMark). */
export function listeningNext(p, questionsCount = QUESTIONS_TOTAL) {
  if (!questionsCount) return 'none';
  const c = comprehension(p);
  const valid = c && c.total === questionsCount; // rodada feita com outro conjunto de questões não vale
  if (valid && c.tally >= passMark(c.total)) return 'done';
  if (!canAnswerQuestions(p)) return 'listen';
  if (valid && c.wrong.length) return 'recovery';
  return 'full';
}
export const wrongOf = (round) => (round ? round.results.filter((r) => !r.correct).map((r) => r.questionId) : []);

// ---------------------------------------------------------------------------------------------------------
// Fases e atividade
// ---------------------------------------------------------------------------------------------------------

/** Fase de que cada fase depende: 1 → 2 → 3 → 4; a leitura em voz alta (5) depende só da tradução (3), não da
 *  compreensão (4) — decisão do PO de 2026-11-11: a fase 5 não pode ficar bloqueada pela fase 4. */
export const PREREQ = { vocab: null, dictation: 'vocab', translation: 'dictation', listening: 'translation', reading: 'translation' };
// em camadas: sequência linear 1 → 2 → … → 6 → 7.1 → 7.2 → 7.3
export const LAYER_PREREQ = { 'u-write': null, 'u-speak': 'u-write', 'u-listen': 'u-speak', 's-write': 'u-listen', 's-speak': 's-write', 's-listen': 's-speak', listening: 's-listen', reading: 'listening', translation: 'reading' };
const prereqOf = (act) => (isLayered(act) ? LAYER_PREREQ : PREREQ);

/**
 * Situação de cada fase: locked | available | in_progress | pending_online | needs_retry | completed | not_applicable.
 * Fase sem itens obrigatórios no conteúdo (ex.: atividade sem vocabulário curado) = not_applicable (registrada como lacuna
 * de conteúdo, não como domínio demonstrado) e não trava a seguinte.
 */
export function phaseStatuses(pack, act, p) {
  const out = [];
  const PRE = prereqOf(act);
  const open = (id) => { // a fase pré-requisito (e a cadeia dela) está concluída?
    const pre = PRE[id];
    if (!pre) return true;
    const x = out.find((y) => y.id === pre);
    // fase 3 com todas as falas respondidas e só aguardando a avaliação online também abre as fases 4 e 5: elas não
    // dependem do resultado dessa avaliação (doc. 01 §5: falha/pendência online não impede o conteúdo independente);
    // a atividade só é concluída quando as avaliações pendentes chegam
    return open(pre) && (x.state === 'completed' || x.state === 'not_applicable' || x.state === 'pending_online');
  };
  for (const ph of phasesOf(act)) {
    const ids = requiredOf(pack, act, ph.id);
    const items = ids.map((id) => (ph.id === 'listening' ? null : mastery(p, ph.id, id))).filter(Boolean);
    const passed = items.filter((m) => m.status === 'passed').length;
    const pending = items.filter((m) => m.status === 'pending_evaluation').length;
    const failing = items.filter((m) => m.status === 'needs_practice' || m.status === 'inconclusive').length;
    const touched = items.filter((m) => m.status !== 'unseen').length;
    const unlocked = open(ph.id);
    let state;
    if (ph.id === 'listening' && ids.length) {
      const next = listeningNext(p, ids.length);
      state = !unlocked ? 'locked' : next === 'done' ? 'completed' : (p.rounds.length || listensOf(p, 'listening') ? (next === 'recovery' ? 'needs_retry' : 'in_progress') : 'available');
      out.push({ ...ph, state, total: ids.length, passMark: passMark(ids.length), passed: state === 'completed' ? ids.length : 0, pending: 0, failing: 0, next });
    } else if (!ids.length) {
      state = unlocked ? 'not_applicable' : 'locked';
      out.push({ ...ph, state, total: 0, passed: 0, pending: 0, failing: 0 });
    } else {
      const score = isTolerant(act, ph.id) ? phaseScore(pack, act, p, ph.id) : null; // camadas: pendentes + aproveitamento ≥ 80%
      // etapa aprovada continua aprovada (rever depois um item pendente e errar de novo não reabre a etapa)
      const complete = passed === ids.length || (!!score && (score.approved || !!(p && p.phaseApproved && p.phaseApproved[ph.id])));
      state = !unlocked ? 'locked' : complete ? 'completed' : pending && !failing && passed + pending === ids.length ? 'pending_online'
        : (failing && touched === ids.length) || (score && score.unresolved === 0) ? 'needs_retry' : touched ? 'in_progress' : 'available';
      out.push({ ...ph, state, total: ids.length, passed, pending, failing, ...(score ? { skipped: score.skipped, score } : {}) });
    }
  }
  return out;
}

/** Estado da atividade: not_started | in_progress | waiting_for_online_evaluation | completed. */
export function activityStatus(pack, act, p) {
  const phases = phaseStatuses(pack, act, p);
  const current = phases.find((x) => x.state !== 'completed' && x.state !== 'not_applicable') || null;
  let state;
  if (!current) state = 'completed';
  else if (current.state === 'pending_online') state = 'waiting_for_online_evaluation';
  else if (!p || (!p.startedAt && !Object.keys(p.attempts || {}).length)) state = 'not_started';
  else state = 'in_progress';
  const done = phases.filter((x) => x.state === 'completed' || x.state === 'not_applicable').length;
  return { state, phases, current, done, ratio: done / phases.length, total: phases.length };
}

/**
 * Item pendente mais relevante da fase (retomada): o primeiro, na ordem da sessão, que ainda não foi aprovado.
 * after: começa depois desse item (circular) e nunca o devolve — “Próximo item” não volta ao item atual.
 * skipSkipped: ignora os itens que o aluno deixou pendentes (não retornam automaticamente).
 */
export function nextItem(order, p, phase, { after = null, skipSkipped = false } = {}) {
  const k = after === null ? -1 : order.indexOf(after);
  const seq = k < 0 ? order : [...order.slice(k + 1), ...order.slice(0, k)];
  for (const id of seq) {
    if (id === after) continue;
    if (mastery(p, phase, id).status === 'passed') continue;
    if (skipSkipped && isSkipped(p, phase, id)) continue;
    return id;
  }
  return null;
}

const SHUFFLED = new Set(['dictation', 'u-listen', 's-listen']); // escuta e escrita: ordem sorteada (ids e áudios juntos)
/** Ordem embaralhada estável da fase (frases da escrita por escuta): sorteada uma vez e guardada; ids estáveis. */
export function phaseOrder(p, phase, ids, rand = Math.random) {
  const saved = p.order[phase];
  if (saved && saved.length === ids.length && saved.every((id) => ids.includes(id))) return saved;
  const out = ids.slice();
  if (SHUFFLED.has(phase)) for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  p.order[phase] = out;
  return out;
}

/** Marca a conclusão (só quando todas as fases estão concluídas e nada depende de avaliação pendente). */
export function settleCompletion(pack, act, p, now = Date.now()) {
  if (isLayered(act)) for (const id of TOLERANT_PHASES) {
    if (!(p.phaseApproved && p.phaseApproved[id]) && phaseScore(pack, act, p, id).approved) (p.phaseApproved || (p.phaseApproved = {}))[id] = now;
  }
  const st = activityStatus(pack, act, p);
  if (st.state === 'completed' && !p.completedAt) p.completedAt = now;
  return st;
}

/** Resumo final por fase e por item (sem pontuação total como substituto e sem XP/recompensa). */
export function activityReport(pack, act, p) {
  const st = activityStatus(pack, act, p);
  const items = (phase) => requiredOf(pack, act, phase).map((id) => {
    const m = mastery(p, phase, id);
    return { id, status: m.status, best: m.bestValidScore, attempts: m.attemptCount, repeated: m.attemptCount > 1, skipped: isSkipped(p, phase, id), outcome: itemOutcome(p, phase, id) };
  });
  return {
    state: st.state, phases: st.phases,
    vocab: items('vocab'), dictation: items('dictation'), translation: items('translation'), reading: items('reading'),
    ...(isLayered(act) ? Object.fromEntries(LAYER_PHASES.filter((x) => x.mode).map((x) => [x.id, items(x.id)])) : {}),
    comprehension: (() => { const c = comprehension(p); return c ? { firstRound: c.round.correct, tally: c.tally, total: c.total, recovered: c.tally - c.round.correct, stillWrong: c.wrong.length, passed: c.tally >= QUESTIONS_PASS } : null; })(),
    pending: Object.values(p.attempts).filter((a) => a.status === 'pending').length,
    inconclusive: Object.values(p.attempts).filter((a) => a.status === 'inconclusive').length,
  };
}
