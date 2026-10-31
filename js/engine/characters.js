// Personagens recorrentes (funções puras, sem DOM). Um personagem = perfil + seis estados visuais + pacote de conteúdo.
// O MOTOR é o mesmo para todos: o app troca só a “visão” de conteúdo (App.content), no mesmo formato de data/content.js.
//   • Lucas: o conteúdo atual do app — a visão é o PRÓPRIO objeto DRG_CONTENT (nada muda para quem já usa o app).
//   • Karla (e futuros): pacote em data/characters.js (tools/build-characters.mjs).
// Progresso: frases, blocos, rotinas, perguntas e gravações têm IDs próprios por personagem (K01-…, K.Q1) e, portanto,
// cartões próprios; itens de vocabulário genéricos (it.*) são compartilhados de propósito — a mesma palavra estudada
// com um personagem volta na revisão espaçada do outro. XP, nível, sequência e conquistas continuam globais.

export const STATES = ['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'levelup'];
export const DEFAULT_CHARACTER = 'lucas';

const FALLBACK = { version: 1, states: STATES, characters: [{ id: 'lucas', name: 'Lucas', status: 'active', content: 'base', profile: {}, visual: { states: {} } }] };

/** Registro dos personagens (data/characters.js); sem o arquivo, só o Lucas existe. */
export const registry = (reg = globalThis.DRG_CHARACTERS) => (reg && Array.isArray(reg.characters) && reg.characters.length ? reg : FALLBACK);

export function characterById(id, reg) {
  const list = registry(reg).characters;
  return list.find((c) => c.id === id) || list.find((c) => c.id === DEFAULT_CHARACTER) || list[0];
}

/** Caminho do asset de um estado, ou null se a imagem ainda não foi aprovada (status ≠ 'ready'). */
export function assetFor(character, state) {
  const v = character && character.visual;
  const s = v && v.states && (v.states[state] || v.states.idle);
  if (!s || s.status !== 'ready') return null;
  return `${v.dir}/${s.file}.${v.ext || 'png'}`;
}

/** Persona prevista, ainda sem conteúdo próprio (a Daily Routine dela aparece “em preparação”). */
export const isPlanned = (character) => !!character && character.status === 'planned';

/** Situação dos seis estados: { ready: [...], pending: [...] } — a existência do cadastro não significa imagens prontas. */
export function visualStatus(character) {
  const st = (character && character.visual && character.visual.states) || {};
  return { ready: STATES.filter((s) => st[s] && st[s].status === 'ready'), pending: STATES.filter((s) => !st[s] || st[s].status !== 'ready') };
}

const views = new WeakMap(); // base → Map(id → visão): a mesma visão sempre (os caches do motor usam o objeto como chave)

/**
 * Conteúdo que o motor deve usar para o personagem. Lucas (ou personagem desconhecido) → o próprio base.
 * Outros → visão com as rotinas/frases/perguntas do pacote, os itens próprios e os itens genéricos compartilhados,
 * reapontados para as frases deste personagem. Nada do base é alterado.
 */
export function contentFor(base, id, reg) {
  const ch = characterById(id, reg);
  if (!ch || ch.content === 'base') return base;
  if (!views.has(base)) views.set(base, new Map());
  const cache = views.get(base);
  if (cache.has(ch.id)) return cache.get(ch.id);
  if (!ch.content) { // persona prevista, sem pacote ainda: visão vazia (nunca o conteúdo de outra persona)
    const empty = { ...base, character: ch.id, planned: true, meta: { ...base.meta, intro: [] }, routines: [], blocks: {}, sentences: {}, questions: {}, items: {},
      verbs: [], drills: [], checklist: [], review: { ...base.review, rev: [], gap: [] } };
    cache.set(ch.id, empty);
    return empty;
  }
  const pack = ch.content;
  const items = { ...pack.items };
  for (const [iid, ref] of Object.entries(pack.sharedItems || {})) {
    const it = base.items[iid];
    if (it) items[iid] = { ...it, ex: ref.ex, routines: ref.routines, blocks: ref.blocks, sentences: ref.sentences };
  }
  const view = {
    ...base,
    character: ch.id,
    meta: { ...base.meta, intro: [ch.profile && ch.profile.summary].filter(Boolean) },
    dayTypes: { club: 'Dia no clube', short: 'Dia mais curto', variation: 'Variação', episode: 'Episódio', session: 'Sessão de prática', ...base.dayTypes },
    routines: pack.routines, blocks: pack.blocks, sentences: pack.sentences, questions: pack.questions, items,
    verbs: [], drills: [], checklist: [], review: { ...base.review, rev: [], gap: [] },
  };
  cache.set(ch.id, view);
  return view;
}
