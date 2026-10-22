// Estado do usuário, XP, níveis, sequência de dias e conquistas.
// Regras anti-farm: cada cartão rende XP no máximo 2 vezes por dia; gravações têm teto diário;
// erro rende XP de esforço só uma vez por cartão/dia. Nada é penalizado com perda de XP.
import { dayNumber, grade, newCard, MASTERED_BOX } from './scheduler.js';

export const SCHEMA = 1;

const SKILL_XP = { rec: 6, rcl: 10, bld: 10, ord: 8, wrt: 14, seq: 10, tell: 20, retell: 35, conv: 18, vb3: 6, learn: 2 };
const MAX_REWARDS_PER_CARD_DAY = 2;
const RECORDING_XP = 5, RECORDING_DAILY_CAP = 50;
const SESSION_XP = 20, SESSION_BONUS_PER_DAY = 3;

export function freshState(contentVersion) {
  const today = dayNumber();
  return {
    schema: SCHEMA, contentVersion, createdAt: Date.now(), updatedAt: Date.now(),
    cards: {}, log: [], days: {}, xp: 0, achievements: {}, myAnswers: {}, pending: [], userVariants: {},
    recordingsMeta: {}, checklist: {}, lastBackupAt: null, firstDay: today,
    settings: { audioSource: 'embedded', voiceURI: '', rate: 1, autoplay: true, fontScale: 1, theme: 'auto', reduceMotion: false, dailyGoal: 12 },
  };
}

function day(state, today) {
  if (!state.days[today]) state.days[today] = { xp: 0, ex: 0, good: 0, bad: 0, sessions: 0, rec: 0, recXp: 0, rewarded: {}, effort: {} };
  return state.days[today];
}

export const levelForXp = (xp) => {
  let n = 1;
  while (xp >= 50 * n * (n + 1)) n++;
  return { level: n, from: 50 * n * (n - 1), to: 50 * n * (n + 1) };
};

/**
 * Registra o resultado de um exercício. Retorna { xp, card, events }.
 * outcome: good | ok | bad ; opts: { hintUsed, answer, cls, mode }
 */
export function recordAnswer(state, k, outcome, opts = {}) {
  const today = opts.today ?? dayNumber();
  const d = day(state, today);
  const prev = state.cards[k] || newCard(k, today);
  const card = grade(prev, outcome, today);
  state.cards[k] = card;
  d.ex++;
  if (outcome === 'bad') d.bad++; else d.good++;

  const skill = k.split(':')[2];
  let xp = 0;
  const rewardedTimes = d.rewarded[k] || 0;
  if (outcome !== 'bad' && rewardedTimes < MAX_REWARDS_PER_CARD_DAY) {
    xp = SKILL_XP[skill] || 6;
    if (outcome === 'ok') xp = Math.round(xp * 0.6);
    if (opts.hintUsed) xp = Math.round(xp * 0.7);
    if (rewardedTimes === 1) xp = Math.round(xp * 0.5); // 2ª vez no dia vale metade
    d.rewarded[k] = rewardedTimes + 1;
    if (prev.box < MASTERED_BOX && card.box >= MASTERED_BOX) xp += 15; // domínio
  } else if (outcome === 'bad' && !d.effort[k]) {
    xp = 2; // esforço, uma vez
    d.effort[k] = 1;
  }
  d.xp += xp;
  state.xp += xp;
  state.log.push({ t: Date.now(), k, o: outcome, c: opts.cls || null, a: opts.answer ? String(opts.answer).slice(0, 300) : undefined, h: opts.hintUsed ? 1 : undefined });
  if (state.log.length > 3000) state.log.splice(0, state.log.length - 3000);
  state.updatedAt = Date.now();
  return { xp, card, events: checkAchievements(state, today) };
}

/** Primeira apresentação de um item (não é avaliação). */
export function recordLearn(state, itemId, today = dayNumber()) {
  const d = day(state, today);
  const key = `learn:${itemId}`;
  if (d.rewarded[key] || state.cards[`item:${itemId}:rec`]) return 0;
  d.rewarded[key] = 1;
  d.xp += SKILL_XP.learn;
  state.xp += SKILL_XP.learn;
  return SKILL_XP.learn;
}

export function recordSession(state, summary, today = dayNumber()) {
  const d = day(state, today);
  d.sessions++;
  let xp = 0;
  if (d.sessions <= SESSION_BONUS_PER_DAY && summary.count >= 5) xp = SESSION_XP;
  d.xp += xp;
  state.xp += xp;
  state.updatedAt = Date.now();
  return { xp, events: checkAchievements(state, today, summary) };
}

export function recordRecording(state, targetId, meta, today = dayNumber()) {
  const d = day(state, today);
  d.rec++;
  state.recordingsMeta[targetId] = { ...meta, at: Date.now(), count: ((state.recordingsMeta[targetId] || {}).count || 0) + 1 };
  let xp = 0;
  const key = `recxp:${targetId}`;
  if (!d.rewarded[key] && d.recXp < RECORDING_DAILY_CAP) { xp = RECORDING_XP; d.rewarded[key] = 1; d.recXp += xp; }
  d.xp += xp;
  state.xp += xp;
  state.updatedAt = Date.now();
  return { xp, events: checkAchievements(state, today) };
}

/** Exclui a gravação de UM exercício do registro (o áudio é apagado em store/db.js). XP e histórico do dia ficam. */
export function forgetRecording(state, targetId) {
  delete state.recordingsMeta[targetId];
  state.updatedAt = Date.now();
}

/**
 * Atualiza a lista de revisão (“palavras marcadas”, usada em Revisar) a partir de uma tentativa conclusiva:
 * palavras a praticar entram automaticamente; uma palavra que entrou automaticamente só sai depois de
 * ser reconhecida em 2 tentativas seguidas (uma transcrição favorável isolada não prova a pronúncia).
 * Palavras marcadas à mão pelo aluno nunca são removidas aqui. Tentativas inconclusivas não mexem em nada.
 * attempt = resultado de engine/practice.js#analyseAttempt
 */
export function updatePracticeWords(state, targetId, attempt) {
  if (!attempt || !attempt.conclusive) return;
  const dw = state.difficultWords = state.difficultWords || {};
  for (const x of attempt.list) {
    const cur = dw[x.key];
    dw[x.key] = { ...(cur || {}), at: Date.now(), from: (cur && cur.from) || targetId, auto: cur ? !!cur.auto : true, misses: ((cur && cur.misses) || 0) + 1, okStreak: 0 };
  }
  for (const k of attempt.goodKeys) {
    const cur = dw[k];
    if (!cur || !cur.auto) continue;
    cur.okStreak = (cur.okStreak || 0) + 1;
    if (cur.okStreak >= 2) delete dw[k];
  }
  state.updatedAt = Date.now();
}

/**
 * Sequência de dias: conta dias com estudo (sessão concluída ou 5+ exercícios).
 * Folga: um dia sem estudo a cada 7 não quebra a sequência. O dia de hoje ainda sem estudo não conta como falta.
 */
export function streak(state, today = dayNumber()) {
  const active = (n) => !!state.days[n] && (state.days[n].sessions > 0 || state.days[n].ex >= 5);
  let n = active(today) ? today : today - 1;
  let count = 0;
  let lastSkip = Infinity;
  while (n >= state.firstDay) {
    if (active(n)) { count++; n--; continue; }
    if (lastSkip - n >= 7 && active(n - 1)) { lastSkip = n; n--; continue; }
    break;
  }
  return { days: count, today: active(today) };
}

export const ACHIEVEMENTS = [
  { id: 'first-session', icon: '🌱', title: 'Primeira sessão', desc: 'Concluiu a primeira sessão.' },
  { id: 'items-10', icon: '🧩', title: '10 itens dominados', desc: '10 itens na caixa 3 ou mais.' },
  { id: 'items-50', icon: '🏗️', title: '50 itens dominados', desc: 'Repertório em construção.' },
  { id: 'items-100', icon: '🏛️', title: '100 itens dominados', desc: 'Repertório sólido.' },
  { id: 'streak-3', icon: '🔥', title: '3 dias seguidos', desc: 'Consistência começa aqui.' },
  { id: 'streak-7', icon: '📅', title: 'Uma semana', desc: '7 dias de estudo.' },
  { id: 'streak-30', icon: '🏆', title: 'Um mês', desc: '30 dias de estudo.' },
  { id: 'first-recording', icon: '🎙️', title: 'Primeira gravação', desc: 'Ouviu a própria voz.' },
  { id: 'recordings-25', icon: '🎧', title: '25 gravações', desc: 'Prática oral frequente.' },
  { id: 'first-block', icon: '🧱', title: 'Primeiro bloco', desc: 'Contou um bloco do dia sem o texto.' },
  { id: 'routine1-blocks', icon: '⭐', title: 'Rotina 1 em blocos', desc: 'Contou todos os blocos da Rotina 1.' },
  { id: 'first-retell', icon: '🗣️', title: 'Rotina completa', desc: 'Contou uma rotina inteira.' },
  { id: 'teacher-10', icon: '👩‍🏫', title: '10 perguntas', desc: 'Respondeu 10 perguntas da teacher.' },
  { id: 'xp-1000', icon: '💎', title: '1.000 XP', desc: 'Muito treino acumulado.' },
  { id: 'perfect', icon: '🎯', title: 'Sessão impecável', desc: 'Sessão com 10+ exercícios sem erro.' },
];

function checkAchievements(state, today, summary) {
  const got = [];
  const unlock = (id) => { if (!state.achievements[id]) { state.achievements[id] = Date.now(); got.push(ACHIEVEMENTS.find((a) => a.id === id)); } };
  const cards = Object.values(state.cards);
  const masteredItems = cards.filter((c) => c.k.startsWith('item:') && c.box >= MASTERED_BOX).length;
  if (Object.values(state.days).some((d) => d.sessions > 0)) unlock('first-session');
  if (masteredItems >= 10) unlock('items-10');
  if (masteredItems >= 50) unlock('items-50');
  if (masteredItems >= 100) unlock('items-100');
  const s = streak(state, today).days;
  if (s >= 3) unlock('streak-3');
  if (s >= 7) unlock('streak-7');
  if (s >= 30) unlock('streak-30');
  const recs = Object.values(state.days).reduce((n, d) => n + d.rec, 0);
  if (recs >= 1) unlock('first-recording');
  if (recs >= 25) unlock('recordings-25');
  const told = cards.filter((c) => c.k.endsWith(':tell') && c.reps > 0 && c.lastResult !== 'bad');
  if (told.length) unlock('first-block');
  const r1 = ['R01-B1', 'R01-B2', 'R01-B3', 'R01-B4', 'R01-B5', 'R01-B6', 'R01-B7'];
  if (r1.every((b) => state.cards[`block:${b}:tell`] && state.cards[`block:${b}:tell`].box >= 1)) unlock('routine1-blocks');
  if (cards.some((c) => c.k.endsWith(':retell') && c.box >= 1)) unlock('first-retell');
  if (cards.filter((c) => c.k.endsWith(':conv') && c.reps > 0).length >= 10) unlock('teacher-10');
  if (state.xp >= 1000) unlock('xp-1000');
  if (summary && summary.count >= 10 && summary.bad === 0) unlock('perfect');
  return got.filter(Boolean);
}

/** Valida e migra um estado salvo/importado. Lança erro se não for recuperável. */
export function migrate(raw, contentVersion) {
  if (!raw || typeof raw !== 'object') throw new Error('Estado ausente ou inválido');
  if (typeof raw.schema !== 'number') throw new Error('Arquivo sem versão de esquema');
  if (raw.schema > SCHEMA) throw new Error(`Backup de uma versão mais nova do app (esquema ${raw.schema})`);
  const base = freshState(contentVersion);
  const s = { ...base, ...raw, settings: { ...base.settings, ...(raw.settings || {}) } };
  const repairs = [];
  for (const key of ['cards', 'days', 'achievements', 'myAnswers', 'userVariants', 'recordingsMeta', 'checklist']) {
    if (!s[key] || typeof s[key] !== 'object' || Array.isArray(s[key])) { if (key in raw) repairs.push(key); s[key] = {}; }
  }
  for (const key of ['log', 'pending']) if (!Array.isArray(s[key])) { if (key in raw) repairs.push(key); s[key] = []; }
  if (typeof s.xp !== 'number' || !isFinite(s.xp) || s.xp < 0) { repairs.push('xp'); s.xp = Object.values(s.days).reduce((n, d) => n + (d.xp || 0), 0); }
  // cartões: descarta entradas corrompidas
  for (const [k, c] of Object.entries(s.cards)) {
    if (!c || typeof c.box !== 'number' || typeof c.due !== 'number') { delete s.cards[k]; repairs.push('card'); }
    else c.k = k;
  }
  if (repairs.length) Object.defineProperty(s, '_repairs', { value: [...new Set(repairs)], enumerable: false });
  // (futuras migrações de esquema entram aqui: if (s.schema === 1) {...; s.schema = 2})
  s.schema = SCHEMA;
  s.contentVersion = contentVersion;
  return s;
}
