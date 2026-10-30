// Módulos e etapas (funções puras, sem DOM). Um MÓDULO é uma rotina/episódio da persona ou uma unidade de uma jornada
// (o mesmo objeto `routines[]` do conteúdo). Cada módulo tem as mesmas cinco etapas, sobre o MESMO contexto:
//   1. Palavras-chave        — itens de vocabulário do módulo (palavra, verbo, termo profissional)
//   2. Expressões práticas   — phrasal verbs, collocations, expressões de tempo, conectores e frases feitas do módulo
//   3. Ouvir e entender      — trechos de diálogo com pergunta (jornadas) ou frases do módulo para reconhecer pelo som
//   4. Falar na prática      — Speaking Lab com as frases e perguntas do módulo (gravações)
//   5. Aplicar e conversar   — perguntas abertas e de compreensão, leitura, montar/escrever as falas, transferência
// Nada é guardado à parte: a situação vem dos cartões e das gravações do perfil (o mesmo progresso de sempre).
// Desbloqueio: uma etapa abre quando a anterior foi concluída; abrir ou visitar não conclui nada. “Concluída” não exige
// perfeição: acertar ao menos uma vez a maior parte (erros posteriores não fecham a etapa de novo; voltam na revisão).

import { cardKey } from './scheduler.js';

export const STAGES = [
  { id: 'vocab', n: 1, title: 'Palavras-chave', en: 'Vocabulary', icon: 'book' },
  { id: 'expr', n: 2, title: 'Expressões práticas', en: 'Phrasal verbs & expressions', icon: 'chat' },
  { id: 'listen', n: 3, title: 'Ouvir e entender', en: 'Listening', icon: 'speaker' },
  { id: 'speak', n: 4, title: 'Falar na prática', en: 'Speaking Lab', icon: 'mic' },
  { id: 'apply', n: 5, title: 'Aplicar e conversar', en: 'Conversation practice', icon: 'target' },
];
export const stageById = (id) => STAGES.find((s) => s.id === id) || null;

const VOCAB_CATS = new Set(['word', 'verb', 'professional']);
const RATIO = 0.8; // palavras e expressões: 80% acertadas ao menos uma vez
const LISTEN_MIN = 6; // frases reconhecidas pelo som (módulos sem trechos de diálogo)
const SPEAK_MIN = 3; // gravações de frases/perguntas do módulo
const WRITE_MAX = 6; // falas montadas ou escritas (rotinas longas)

/** Acertou ao menos uma vez (houve resposta que não foi erro). Erros depois disso não “desconcluem”. */
export const everRight = (c) => !!c && c.reps > c.lapses;
const answered = (c) => !!c && c.reps > 0;

export const moduleOf = (view, id) => view.routines.find((r) => r.id === id) || null;
export const moduleSentences = (view, r) => r.blocks.flatMap((b) => (view.blocks[b] ? view.blocks[b].sentences : []));

/** Itens do módulo de um tipo: 'vocab' ou 'expr' (sem os modelos de gramática). */
export function moduleItems(view, r, kind) {
  const ids = r.items && r.items.length ? r.items
    : [...new Set(moduleSentences(view, r).flatMap((s) => (view.sentences[s] ? view.sentences[s].items : [])))];
  return ids.map((i) => view.items[i]).filter((it) => it && !(it.tags || []).includes('grammar-model'))
    .filter((it) => (kind === 'vocab' ? VOCAB_CATS.has(it.c) : !VOCAB_CATS.has(it.c)));
}

const hasListening = (r) => !!(r.listening && r.listening.length);

/** Cartões e gravações que contam para cada etapa (as mesmas chaves do motor). */
export function stageKeys(view, r) {
  const sents = moduleSentences(view, r);
  const qs = (r.questions || []).map((id) => view.questions[id]).filter(Boolean);
  return {
    vocab: moduleItems(view, r, 'vocab').map((it) => cardKey('item', it.id, 'rec')),
    expr: moduleItems(view, r, 'expr').map((it) => cardKey('item', it.id, 'rec')),
    listen: hasListening(r) ? r.listening.map((id) => cardKey('lq', id, 'lis')) : sents.map((s) => cardKey('sent', s, 'lis')),
    speak: [...sents.map((s) => `sent:${s}`), ...r.blocks.map((b) => `block:${b}`), `routine:${r.id}`, ...qs.map((q) => `q:${q.id}`)],
    questions: qs.filter((q) => q.kind !== 'transfer' && !q.openPersonal).map((q) => cardKey('q', q.id, 'conv')),
    transfer: qs.filter((q) => q.kind === 'transfer' || q.openPersonal).map((q) => cardKey('q', q.id, 'conv')),
    reading: (r.reading || []).map((id) => cardKey('rq', id, 'rdq')),
    writing: sents,
  };
}

/**
 * Situação das cinco etapas de um módulo para um progresso { cards, recordingsMeta }.
 * Cada etapa: { id, done, need, total, complete, state: 'done' | 'open' | 'locked', parts? }.
 */
export function moduleStatus(view, moduleId, progress) {
  const r = moduleOf(view, moduleId);
  if (!r) return null;
  const cards = (progress && progress.cards) || {};
  const recs = (progress && progress.recordingsMeta) || {};
  const K = stageKeys(view, r);
  const count = (keys, f) => keys.filter((k) => f(cards[k])).length;
  const st = {};
  const ratio = (keys) => ({ done: count(keys, everRight), total: keys.length, need: Math.ceil(keys.length * RATIO) });
  st.vocab = ratio(K.vocab);
  st.expr = ratio(K.expr);
  st.listen = hasListening(r)
    ? { done: count(K.listen, everRight), total: K.listen.length, need: Math.ceil(K.listen.length * 0.75) }
    : { done: count(K.listen, everRight), total: K.listen.length, need: Math.min(K.listen.length, LISTEN_MIN) };
  st.speak = { done: K.speak.filter((t) => recs[t]).length, total: K.speak.length, need: Math.min(SPEAK_MIN, K.speak.length) };
  const written = K.writing.filter((s) => answered(cards[cardKey('sent', s, 'ord')]) || answered(cards[cardKey('sent', s, 'wrt')])).length;
  const parts = [
    { id: 'questions', label: 'Responder às perguntas', done: count(K.questions, answered), total: K.questions.length, need: K.questions.length },
    { id: 'reading', label: 'Ler e responder', done: count(K.reading, everRight), total: K.reading.length, need: K.reading.length },
    { id: 'writing', label: 'Montar ou escrever falas', done: written, total: K.writing.length, need: hasListening(r) ? Math.ceil(K.writing.length / 2) : Math.min(WRITE_MAX, Math.ceil(K.writing.length / 2)) },
    { id: 'transfer', label: 'Falar de você (situação nova)', done: count(K.transfer, answered), total: K.transfer.length, need: Math.min(1, K.transfer.length) },
  ].filter((p) => p.total > 0);
  st.apply = { done: parts.reduce((n, p) => n + Math.min(p.done, p.need), 0), need: parts.reduce((n, p) => n + p.need, 0), total: parts.reduce((n, p) => n + p.total, 0), parts };
  let open = true;
  const stages = STAGES.map((s) => {
    const x = st[s.id];
    const complete = x.done >= x.need; // etapa sem conteúdo (need 0) conta como concluída
    const state = !open ? 'locked' : complete ? 'done' : 'open';
    if (!complete) open = false; // a seguinte só abre depois desta
    return { ...s, ...x, complete, state };
  });
  const next = stages.find((s) => s.state === 'open') || null;
  return { id: r.id, stages, complete: stages.every((s) => s.complete), next, doneCount: stages.filter((s) => s.complete).length };
}

/** Progresso de uma trilha (todas as etapas de todos os módulos) e o próximo passo sugerido. */
export function trackStatus(view, progress) {
  const mods = view.routines.map((r) => moduleStatus(view, r.id, progress));
  const total = mods.length * STAGES.length;
  const done = mods.reduce((n, m) => n + m.doneCount, 0);
  const current = mods.find((m) => !m.complete) || null;
  return { modules: mods, done, total, ratio: total ? done / total : 0, current, next: current ? current.next : null };
}

/** Etapa liberada? (a sessão de uma etapa bloqueada não é montada) */
export function stageOpen(view, moduleId, stageId, progress) {
  const m = moduleStatus(view, moduleId, progress);
  const s = m && m.stages.find((x) => x.id === stageId);
  return !!s && s.state !== 'locked';
}

/**
 * Filtro de entradas da sessão de uma etapa (buildSession com focus.stage): só o conteúdo e as habilidades da etapa.
 * Devolve (entry) => boolean.
 */
export function stageFilter(view, moduleId, stageId) {
  const r = moduleOf(view, moduleId);
  if (!r) return () => false;
  const ids = (kind) => new Set(moduleItems(view, r, kind).map((it) => it.id));
  const sents = new Set(moduleSentences(view, r));
  if (stageId === 'vocab' || stageId === 'expr') {
    const set = ids(stageId);
    const skills = stageId === 'vocab' ? ['rec', 'rcl'] : ['rec', 'rcl', 'bld'];
    return (e) => e.unit === 'item' && set.has(e.id) && skills.includes(e.skill);
  }
  if (stageId === 'listen') {
    const lq = new Set(r.listening || []);
    return hasListening(r) ? (e) => e.unit === 'lq' && lq.has(e.id) : (e) => e.unit === 'sent' && e.skill === 'lis' && sents.has(e.id);
  }
  if (stageId === 'apply') {
    const qs = new Set(r.questions || []), rq = new Set(r.reading || []), blocks = new Set(r.blocks);
    return (e) => (e.unit === 'q' && qs.has(e.id)) || (e.unit === 'rq' && rq.has(e.id))
      || (e.unit === 'sent' && ['ord', 'wrt'].includes(e.skill) && sents.has(e.id))
      || (e.unit === 'block' && blocks.has(e.id)) || (e.unit === 'routine' && e.id === r.id);
  }
  return () => false; // falar: Speaking Lab, não sessão
}
