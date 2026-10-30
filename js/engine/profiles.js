// Progresso por perfil (funções puras, sem DOM). Um PERFIL = um aprendiz numa trilha:
//   • cada persona da Daily Routine (lucas, karla, lucas-kid, heitor…) → perfil com o id da persona;
//   • cada jornada independente (Conversation Practice) → perfil próprio 'journey:<id>', único para o app.
// Cartões, XP, dias (sequência), histórico, conquistas, respostas, gravações, palavras marcadas e favoritos ficam
// no perfil. Preferências (settings), variantes aceitas pelo aluno e dados do backup continuam globais.
//
// Em execução, os campos de progresso do perfil ATIVO ficam no topo do estado (state.cards, state.xp…): todo o
// motor e as telas continuam lendo e gravando como antes. Ao gravar (toStored) e ao trocar de perfil (activate),
// o topo é devolvido ao perfil. Assim nenhuma regra de XP, revisão ou desbloqueio precisou mudar.

export const PROGRESS_KEYS = ['cards', 'log', 'days', 'xp', 'achievements', 'myAnswers', 'pending', 'recordingsMeta', 'checklist', 'difficultWords', 'favorites', 'firstDay'];
const OBJ = ['cards', 'days', 'achievements', 'myAnswers', 'recordingsMeta', 'checklist', 'difficultWords', 'favorites'];
const ARR = ['log', 'pending'];

export const journeyProfile = (journeyId) => `journey:${journeyId}`;
/** Perfil ativo: a jornada aberta (se houver) ou a persona. */
export const profileIdFor = (characterId, journeyId) => (journeyId ? journeyProfile(journeyId) : characterId || 'lucas');

export function emptyProgress(today) {
  return { cards: {}, log: [], days: {}, xp: 0, achievements: {}, myAnswers: {}, pending: [], recordingsMeta: {}, checklist: {}, difficultWords: {}, favorites: {}, firstDay: today };
}

/** Normaliza um perfil salvo (campos ausentes ou corrompidos viram vazios; nada válido é descartado). */
export function cleanProgress(p, today, repairs = []) {
  const out = { ...emptyProgress(today), ...(p && typeof p === 'object' ? p : {}) };
  for (const k of OBJ) if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) { repairs.push(k); out[k] = {}; }
  for (const k of ARR) if (!Array.isArray(out[k])) { repairs.push(k); out[k] = []; }
  if (typeof out.xp !== 'number' || !isFinite(out.xp) || out.xp < 0) { repairs.push('xp'); out.xp = Object.values(out.days).reduce((n, d) => n + ((d && d.xp) || 0), 0); }
  if (typeof out.firstDay !== 'number') out.firstDay = today;
  for (const [k, c] of Object.entries(out.cards)) {
    if (!c || typeof c.box !== 'number' || typeof c.due !== 'number') { delete out.cards[k]; repairs.push('card'); } else c.k = k;
  }
  return out;
}

/** Devolve o topo do estado ao perfil ativo (objetos são os mesmos; números e trocas de objeto são copiados). */
export function syncActive(state) {
  const id = state.activeProfile;
  if (!id) return state;
  const p = state.profiles[id] || (state.profiles[id] = {});
  for (const k of PROGRESS_KEYS) if (k in state) p[k] = state[k];
  return state;
}

/** Torna `id` o perfil ativo (criando-o vazio se ainda não existe). O progresso dos outros perfis não é tocado. */
export function activate(state, id, today) {
  syncActive(state);
  if (!state.profiles[id]) state.profiles[id] = emptyProgress(today ?? state.firstDay ?? 0);
  const p = state.profiles[id];
  for (const k of PROGRESS_KEYS) state[k] = p[k];
  state.activeProfile = id;
  return state;
}

/** Progresso de um perfil para leitura (o ativo vem do topo; os demais, do registro salvo). */
export function progressOf(state, id) {
  if (id === state.activeProfile) return Object.fromEntries(PROGRESS_KEYS.map((k) => [k, state[k]]));
  return state.profiles[id] || null;
}

/** Forma gravada: o perfil ativo devolvido e o topo sem cópias duplicadas do progresso. */
export function toStored(state) {
  syncActive(state);
  const out = {};
  for (const [k, v] of Object.entries(state)) if (!PROGRESS_KEYS.includes(k)) out[k] = v;
  return out;
}

/**
 * Esquema 1 (um progresso global para todos) → perfis. Nada é apagado:
 *   • cartões, respostas, gravações e histórico vão para o perfil DONO do conteúdo (ownerOf: chave → perfil;
 *     sem dono reconhecido → 'lucas', o aprendiz original do app, inclusive os itens genéricos compartilhados);
 *   • XP total, dias/sequência, conquistas, checklist e palavras marcadas ficam com 'lucas' (não há como separar
 *     o XP já ganho por personagem; o total não muda);
 *   • o perfil das outras trilhas começa com XP 0, mas com os cartões e respostas que já eram delas.
 */
export function splitLegacy(raw, { ownerOf = () => 'lucas', today = 0 } = {}) {
  const repairs = [];
  const legacy = cleanProgress(Object.fromEntries(PROGRESS_KEYS.filter((k) => k in raw).map((k) => [k, raw[k]])), raw.firstDay ?? today, repairs);
  const profiles = { lucas: { ...legacy, cards: {}, log: [], myAnswers: {}, recordingsMeta: {}, pending: [], favorites: {} } };
  const get = (id) => profiles[id] || (profiles[id] = emptyProgress(legacy.firstDay));
  const idOf = (key) => { const parts = String(key).split(':'); return parts.length >= 2 ? parts[1] : parts[0]; };
  for (const [k, c] of Object.entries(legacy.cards)) get(ownerOf(k, idOf(k)) || 'lucas').cards[k] = c;
  for (const e of legacy.log) get((e && e.k && ownerOf(e.k, idOf(e.k))) || 'lucas').log.push(e);
  for (const [qid, a] of Object.entries(legacy.myAnswers)) get(ownerOf(`q:${qid}:conv`, qid) || 'lucas').myAnswers[qid] = a;
  for (const [t, m] of Object.entries(legacy.recordingsMeta)) get(ownerOf(t, idOf(t)) || 'lucas').recordingsMeta[t] = m;
  for (const p of legacy.pending) get((p && p.key && ownerOf(p.key, idOf(p.key))) || 'lucas').pending.push(p);
  return { profiles, repairs };
}

const UNIT_FIELD = { item: 'items', sent: 'sentences', block: 'blocks', q: 'questions', lq: 'listening', rq: 'reading' };
/**
 * Dono de uma chave (cartão “unidade:id:habilidade”, gravação “unidade:id”) a partir das visões de conteúdo.
 * views: [{ profile, content }] na ordem de prioridade — a do Lucas primeiro, para que os itens genéricos
 * compartilhados (it.*) fiquem com ele, como no progresso único de antes. Sem dono reconhecido → 'lucas'.
 */
export function makeOwnerOf(views) {
  return (key, id) => {
    const unit = String(key).split(':')[0];
    for (const { profile, content } of views) {
      if (!content) continue;
      if (unit === 'routine' ? (content.routines || []).some((r) => r.id === id) : UNIT_FIELD[unit] && content[UNIT_FIELD[unit]] && content[UNIT_FIELD[unit]][id]) return profile;
    }
    return 'lucas';
  };
}
