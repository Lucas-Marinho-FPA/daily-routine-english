// Jornadas independentes dos personagens (Conversation Practice). Funções puras, sem DOM.
// A jornada é uma VISÃO de conteúdo no mesmo formato de data/content.js, com IDs próprios (CP01-…, CP.L1, cp.*):
// progresso próprio e domínio próprio — nada é herdado das rotinas de Lucas ou Karla. Dados: data/journeys.js.

export const journeyRegistry = (reg = globalThis.DRG_JOURNEYS) => (reg && Array.isArray(reg.journeys) ? reg.journeys : []);
export const journeyById = (id, reg) => journeyRegistry(reg).find((j) => j.id === id) || null;

const views = new WeakMap(); // base → Map(id → visão): sempre o mesmo objeto (os caches do motor usam o objeto como chave)

export function journeyView(base, id, reg) {
  const j = journeyById(id, reg);
  if (!j) return null;
  if (!views.has(base)) views.set(base, new Map());
  const cache = views.get(base);
  if (cache.has(j.id)) return cache.get(j.id);
  const c = j.content;
  const view = {
    ...base,
    journey: j.id,
    meta: { ...base.meta, intro: [j.name] },
    dayTypes: { ...base.dayTypes, conversation: 'Conversa' },
    routines: c.routines, blocks: c.blocks, sentences: c.sentences, questions: c.questions, items: c.items,
    listening: c.listening || {}, reading: c.reading || {},
    verbs: [], drills: [], checklist: [], review: { ...base.review, rev: [], gap: [] },
  };
  cache.set(j.id, view);
  return view;
}

/**
 * Situação de uma unidade por habilidade, a partir dos cartões (sem armazenamento próprio).
 * Concluída quando: todo ouvir e todo ler acertados ao menos uma vez (caixa ≥ 1), todas as perguntas com resposta-modelo
 * respondidas, ao menos uma transferência respondida e metade das falas montadas ou escritas.
 */
export function unitStatus(view, unitId, cards) {
  const r = view.routines.find((x) => x.id === unitId);
  const c = (k) => cards[k];
  const done = (k) => !!c(k) && c(k).reps > 0;
  const right = (k) => !!c(k) && c(k).box >= 1;
  const listen = r.listening.map((id) => `lq:${id}:lis`), read = r.reading.map((id) => `rq:${id}:rdq`);
  const qs = r.questions.map((id) => view.questions[id]);
  const speak = qs.filter((q) => q.kind !== 'transfer').map((q) => `q:${q.id}:conv`);
  const transfer = qs.filter((q) => q.kind === 'transfer').map((q) => `q:${q.id}:conv`);
  const sents = r.blocks.flatMap((b) => view.blocks[b].sentences);
  const written = sents.filter((s) => done(`sent:${s}:ord`) || done(`sent:${s}:wrt`)).length;
  const skills = {
    listening: { done: listen.filter(right).length, total: listen.length },
    reading: { done: read.filter(right).length, total: read.length },
    writing: { done: written, total: sents.length, need: Math.ceil(sents.length / 2) },
    speaking: { done: speak.filter(done).length, total: speak.length },
    transfer: { done: transfer.filter(done).length, total: transfer.length, need: Math.min(1, transfer.length) },
  };
  const complete = skills.listening.done === skills.listening.total && skills.reading.done === skills.reading.total
    && skills.speaking.done === skills.speaking.total && skills.writing.done >= skills.writing.need && skills.transfer.done >= skills.transfer.need;
  return { id: unitId, skills, complete };
}
