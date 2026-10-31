// Módulos e etapas (funções puras, sem DOM) — o CICLO PEDAGÓGICO ÚNICO do app. Um MÓDULO é uma sessão da Daily
// Routine (rotina/episódio de um personagem) ou uma unidade do Conversation Practice (o mesmo objeto `routines[]`).
// As duas jornadas usam o mesmo motor e o mesmo ciclo, cada uma com o próprio conteúdo e o próprio progresso:
//   1. Vocabulary                          — palavras do módulo: significado, tradução no contexto, áudio
//   2. Collocations, phrasal verbs & expr. — combinações naturais, sempre num exemplo da situação
//   3. Sentence building                   — montar e escrever as frases do módulo; ordenar blocos
//   4. Listening                           — frases ou trechos de diálogo reconhecidos pelo som
//   5. Speaking                            — gravações das frases, blocos e perguntas do módulo (Speaking Lab)
//   6. Application                         — responder, ler, recontar e falar de si sem depender do modelo
// Nada é guardado à parte: a situação vem dos cartões e das gravações (fonte única de verdade do progresso).
// Domínio, não perfeição: concluir = acertar ao menos uma vez a maior parte dos objetivos da etapa; erros posteriores
// não “desconcluem” (voltam na revisão espaçada). Falha do reconhecimento de fala nunca conta contra o aluno: falar
// conta gravações, não a transcrição.
// Estados: 'done' (concluída), 'progress' (em andamento), 'open' (não iniciada, liberada), 'locked' (bloqueada). Uma etapa
// abre quando a anterior foi concluída; uma etapa já concluída continua concluída mesmo que outra antes dela ainda não
// esteja (ex.: progresso feito antes de a construção de frases virar etapa própria).

import { cardKey } from './scheduler.js';

export const STAGES = [
  { id: 'vocab', n: 1, title: 'Vocabulário', en: 'Vocabulary', icon: 'book', goal: 'Conhecer as palavras: significado, tradução e pronúncia.' },
  { id: 'expr', n: 2, title: 'Combinações e expressões', en: 'Collocations, phrasal verbs & expressions', icon: 'chat', goal: 'Usar as palavras juntas, como os nativos falam.' },
  { id: 'build', n: 3, title: 'Construção de frases', en: 'Sentence building', icon: 'list', goal: 'Montar e escrever as frases da situação.' },
  { id: 'listen', n: 4, title: 'Ouvir e entender', en: 'Listening', icon: 'speaker', goal: 'Reconhecer as frases e os diálogos pelo som.' },
  { id: 'speak', n: 5, title: 'Falar', en: 'Speaking', icon: 'mic', goal: 'Ouvir a referência, gravar e comparar.' },
  { id: 'apply', n: 6, title: 'Aplicar', en: 'Application', icon: 'target', goal: 'Responder e falar da situação sem ler o modelo.' },
];
export const STATE_LABEL = { done: 'Concluída', progress: 'Em andamento', open: 'Não iniciada', locked: 'Bloqueada' };
export const stageById = (id) => STAGES.find((s) => s.id === id) || null;

const VOCAB_CATS = new Set(['word', 'verb', 'professional']);
// palavra = item lexical de uma só palavra (ou categoria de palavra); combinação = phrasal verb, collocation, expressão
const isWord = (it) => VOCAB_CATS.has(it.c) || (it.c !== 'phrasal' && it.c !== 'sentence' && /^[A-Za-z'’-]+$/.test(String(it.en || '').trim()));
const RATIO = 0.8; // palavras e combinações: 80% acertadas ao menos uma vez
const LISTEN_MIN = 6; // frases reconhecidas pelo som (módulos sem trechos de diálogo)
const SPEAK_MIN = 3; // gravações de frases/blocos/perguntas do módulo (o reconhecimento de fala não conta contra)
const BUILD_RATIO = 0.6; // frases montadas ou escritas corretamente ao menos uma vez…
const BUILD_MAX = 8; // …até este número (sessões longas)

/** Acertou ao menos uma vez (houve resposta que não foi erro). Erros depois disso não “desconcluem”. */
export const everRight = (c) => !!c && c.reps > c.lapses;
const answered = (c) => !!c && c.reps > 0;

export const moduleOf = (view, id) => view.routines.find((r) => r.id === id) || null;
export const moduleSentences = (view, r) => r.blocks.flatMap((b) => (view.blocks[b] ? view.blocks[b].sentences : []));

/** Itens do módulo de um tipo: 'vocab' ou 'expr' (sem os modelos de gramática). */
export function moduleItems(view, r, kind) {
  // sessões (Lukinhas): o vocabulário prioritário aprovado da sessão — palavras, conectivos e collocations na etapa 1,
  // phrasal verbs na etapa 2 (as expressões de sessões anteriores que reaparecem voltam pela revisão espaçada)
  if (r.session && r.session.vocabIds) {
    return r.session.vocabIds.map((i) => view.items[i]).filter(Boolean).filter((it) => (kind === 'vocab' ? it.c !== 'phrasal' : it.c === 'phrasal'));
  }
  const ids = r.items && r.items.length ? r.items
    : [...new Set(moduleSentences(view, r).flatMap((s) => (view.sentences[s] ? view.sentences[s].items : [])))];
  return ids.map((i) => view.items[i]).filter((it) => it && !(it.tags || []).includes('grammar-model'))
    .filter((it) => (kind === 'vocab' ? isWord(it) : !isWord(it)));
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
    build: sents,
    blocks: r.blocks.filter((b) => view.blocks[b] && view.blocks[b].sentences.length > 1).map((b) => cardKey('block', b, 'seq')),
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
  // construção: frase montada (ord) ou escrita (wrt) corretamente ao menos uma vez
  const built = K.build.filter((s) => everRight(cards[cardKey('sent', s, 'ord')]) || everRight(cards[cardKey('sent', s, 'wrt')])).length;
  st.build = { done: built, total: K.build.length, need: Math.min(BUILD_MAX, Math.ceil(K.build.length * BUILD_RATIO)) };
  const parts = [
    { id: 'questions', label: 'Responder às perguntas', done: count(K.questions, answered), total: K.questions.length, need: K.questions.length },
    { id: 'reading', label: 'Ler e responder', done: count(K.reading, everRight), total: K.reading.length, need: K.reading.length },
    { id: 'transfer', label: 'Falar de você (situação nova)', done: count(K.transfer, answered), total: K.transfer.length, need: Math.min(1, K.transfer.length) },
  ].filter((p) => p.total > 0);
  st.apply = { done: parts.reduce((n, p) => n + Math.min(p.done, p.need), 0), need: parts.reduce((n, p) => n + p.need, 0), total: parts.reduce((n, p) => n + p.total, 0), parts };
  let open = true;
  const stages = STAGES.map((s) => {
    const x = st[s.id];
    const complete = x.done >= x.need; // etapa sem conteúdo (need 0) conta como concluída
    const started = x.done > 0;
    const state = complete ? 'done' : !open ? 'locked' : started ? 'progress' : 'open';
    if (!complete) open = false; // a seguinte só abre depois desta
    return { ...s, ...x, complete, started, state };
  });
  const next = stages.find((s) => s.state === 'progress' || s.state === 'open') || null;
  const doneCount = stages.filter((s) => s.complete).length;
  const complete = doneCount === stages.length;
  const started = stages.some((s) => s.started && s.total > 0);
  // situação do módulo (a mesma em todas as telas): concluído, em andamento ou não iniciado
  const state = complete ? 'done' : started ? 'progress' : 'open';
  return { id: r.id, stages, complete, state, next, doneCount, ratio: doneCount / stages.length };
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
    const skills = stageId === 'vocab' ? ['rec', 'rcl', 'nat'] : ['rec', 'rcl', 'bld', 'nat'];
    return (e) => e.unit === 'item' && set.has(e.id) && skills.includes(e.skill);
  }
  if (stageId === 'listen') {
    const lq = new Set(r.listening || []);
    return hasListening(r) ? (e) => e.unit === 'lq' && lq.has(e.id) : (e) => e.unit === 'sent' && e.skill === 'lis' && sents.has(e.id);
  }
  if (stageId === 'build') {
    const blocks = new Set(r.blocks);
    return (e) => (e.unit === 'sent' && ['ord', 'wrt'].includes(e.skill) && sents.has(e.id)) || (e.unit === 'block' && e.skill === 'seq' && blocks.has(e.id));
  }
  if (stageId === 'apply') {
    const qs = new Set(r.questions || []), rq = new Set(r.reading || []), blocks = new Set(r.blocks);
    return (e) => (e.unit === 'q' && qs.has(e.id)) || (e.unit === 'rq' && rq.has(e.id))
      || (e.unit === 'block' && e.skill === 'tell' && blocks.has(e.id)) || (e.unit === 'routine' && e.id === r.id);
  }
  return () => false; // falar: Speaking Lab, não sessão
}
