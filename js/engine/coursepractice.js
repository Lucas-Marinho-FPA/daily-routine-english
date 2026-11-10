// Curso — Atividades: práticas complementares (vocabulário e expressões, escuta, fala e tradução reversa).
// Funções puras, sem DOM. Tudo é gerado NO APARELHO a partir do texto já importado (nada do curso é versionado) e do
// glossário offline (data/glossary-en-pt.json.gz). A atividade principal (tradução), a correção automática, a
// validação do professor e a exportação NÃO são alteradas: aqui só se lê a atividade.
//
// Confiabilidade (nenhuma questão sem resposta verificável):
//   • itens = unidades de sentido do original (unitsOf de engine/course.js) que o glossário traduz;
//   • o glossário mistura entradas escritas para o app com o FreeDict, que traz sentidos fora de contexto (“booked” →
//     “livro”). Por isso o SIGNIFICADO de um item só é usado quando está CONFIRMADO: (a) um sentido do glossário aparece
//     na versão VALIDADA pelo professor de um bloco onde o item ocorre (nesta ou em outra atividade do aparelho), ou
//     (b) o sentido vem das entradas escritas para o app (trustedOf). Item sem confirmação não entra nas práticas de
//     significado; continua nas de escuta, fala e completar (cujo gabarito é o próprio original);
//   • múltipla escolha só com alternativas de SENTIDO DISJUNTO (nenhuma raiz em comum, nenhum sinônimo pelo índice
//     inverso, nenhuma relação entre as palavras inglesas) — sem isso, a questão não é gerada;
//   • completar a frase: o gabarito é o próprio texto original (o trecho precisa ser localizado nele);
//   • escuta: o gabarito é o trecho que foi tocado (voz do sistema do aparelho, não é áudio do curso);
//   • tradução reversa: só questões VALIDADAS pelo professor (act.teacher[n].validatedAt); o gabarito é o inglês
//     original e o enunciado é a versão do professor. Respostas do aluno e avaliações automáticas nunca são gabarito.
// Progresso: registro próprio no store 'kv' (chave PRACTICE_KEY), por atividade (id de conteúdo), separado das
// respostas da tradução (kv 'course') e do estado de estudo das jornadas (kv 'state').

import { unitsOf, namesIn, isValidated } from './course.js';
import { lemma } from './lexicon.js';
import { isFunctionWord } from './coherence.js';
import { fold, ptContent, stemEq, meaningsOf, trustedOf } from './glossary.js';
import { newCard, grade, dayNumber } from './scheduler.js';
import { shuffle } from './text.js';

export const PRACTICE_KEY = 'course-practice';
export const MAX_WORDS = 30; // frases para ouvir/falar/tradução reversa (o reconhecimento local vale para trechos curtos)

export const SKILL_LABEL = {
  mean: 'Significado', recall: 'Lembrar a expressão', cloze: 'Completar a frase', write: 'Escrever o significado',
  lisItem: 'Ouvir e identificar', lisBlock: 'Ouvir a frase', spkItem: 'Falar a expressão', spkBlock: 'Falar a frase',
  rev: 'Tradução reversa',
};
export const MODES = {
  vocab: { label: 'Vocabulário e expressões', skills: ['mean', 'recall', 'cloze', 'write'] },
  listen: { label: 'Escuta', skills: ['lisItem', 'lisBlock'] },
  speak: { label: 'Fala', skills: ['spkItem', 'spkBlock'] },
  rev: { label: 'Tradução reversa', skills: ['rev'] },
  errors: { label: 'Repetir erros', skills: null },
};

const norm = (s) => fold(s).replace(/[^a-z0-9']+/g, ' ').trim();
const enTokens = (s) => fold(s).match(/[a-z0-9']+/g) || [];
export const keyOf = (skill, target) => `${skill}|${target}`;
export const splitKey = (k) => { const i = k.indexOf('|'); return [k.slice(0, i), k.slice(i + 1)]; };
const blockId = (q, b) => `b:${q}.${b}`;

// ---------- itens (vocabulário e expressões) ----------

/** A tradução `v` (do glossário) aparece no texto em português `pt`? (raízes; 2/3 das palavras de conteúdo) */
export function variantIn(v, pt) {
  const vc = ptContent(v);
  if (!vc.length) return ` ${norm(pt)} `.includes(` ${norm(v)} `);
  const ans = ptContent(pt);
  const need = vc.length <= 2 ? vc.length : Math.ceil((vc.length * 2) / 3);
  return vc.filter((c) => ans.some((a) => stemEq(a.s, c.s))).length >= need;
}

/**
 * Sentidos confirmados pelo professor: em cada bloco de questão VALIDADA, os sentidos do glossário de cada unidade
 * que aparecem na versão do professor. → Map(en → [traduções do glossário confirmadas])
 */
export function teacherConfirmed(activities) {
  const out = new Map();
  for (const act of activities) for (const q of act.questions) {
    if (!isValidated(act, q.n)) continue;
    q.blocks.forEach((en, b) => {
      const pt = (act.teacher[q.n].blocks || [])[b] || '';
      if (!pt.trim()) return;
      for (const u of unitsOf(en, namesIn(en)).units) {
        if (!u.pts) continue;
        const ok = u.pts.filter((v) => variantIn(v, pt));
        if (ok.length) out.set(u.en, [...new Set([...(out.get(u.en) || []), ...ok])]);
      }
    });
  }
  return out;
}

/**
 * Itens da atividade: unidades do original com tradução no glossário, sem repetição.
 * `confirmed` = teacherConfirmed(atividades do aparelho).
 * → [{ id, en, pts (glossário, todas), meanings (confirmadas), via: 'professor'|'app'|null, reliable, kind,
 *      src: [{ q, b, surface: [tokens] }] }]  (src = rastreabilidade: questão e bloco do original)
 */
export function extractItems(act, confirmed = new Map()) {
  const map = new Map();
  for (const q of act.questions) q.blocks.forEach((en, b) => {
    const { toks, units } = unitsOf(en, namesIn(en));
    for (const u of units) {
      if (!u.pts || !u.pts.length || (u.n === 1 && u.en.length < 3) || typeof u.i !== 'number') continue;
      const id = `u:${u.en}`;
      let it = map.get(id);
      if (!it) { it = { id, en: u.en, pts: u.pts.slice(), kind: u.n > 1 ? 'expr' : 'word', src: [] }; map.set(id, it); }
      if (!it.src.some((s) => s.q === q.n && s.b === b)) it.src.push({ q: q.n, b, surface: toks.slice(u.i, u.i + u.n) });
    }
  });
  return [...map.values()].map((it) => {
    const byTeacher = confirmed.get(it.en) || [];
    const byApp = trustedOf(it.en) || [];
    const meanings = [...new Set([...byTeacher, ...byApp])];
    return { ...it, meanings, via: byTeacher.length ? 'professor' : byApp.length ? 'app' : null, reliable: meanings.length > 0 };
  });
}

/** Rótulo do significado (glossário): até duas traduções. */
export const meaningLabel = (it) => (it.meanings && it.meanings.length ? it.meanings : it.pts).slice(0, 2).join(' / ');
export const VIA_LABEL = { professor: 'sentido confirmado na versão validada pelo professor', app: 'glossário do app' };

/** O trecho `surface` (tokens) dentro do texto original → { before, target, after } ou null. */
export function locateIn(text, surface) {
  if (!surface || !surface.length) return null;
  const esc = surface.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/'/g, "['’]"));
  const W = "A-Za-z0-9'’";
  const re = new RegExp(`(^|[^${W}])(${esc.join(`[^${W}]+`)})(?=$|[^${W}])`, 'i');
  const m = re.exec(String(text));
  if (!m) return null;
  const start = m.index + m[1].length, end = start + m[2].length;
  return { before: text.slice(0, start), target: text.slice(start, end), after: text.slice(end) };
}

const stemsOf = (it) => it.pts.flatMap((p) => ptContent(p).map((c) => c.s));
const relatedEn = (a, b) => a.en === b.en || lemma(a.en) === lemma(b.en)
  || a.en.split(' ').some((w) => b.en.split(' ').some((x) => !isFunctionWord(w) && (w === x || lemma(w) === lemma(x))));
/** Dois itens têm sentidos disjuntos segundo o glossário? (condição para serem alternativas um do outro) */
export function disjoint(a, b) {
  if (relatedEn(a, b)) return false;
  const sa = stemsOf(a), sb = stemsOf(b);
  if (sa.some((x) => sb.some((y) => stemEq(x, y)))) return false;
  if (a.pts.some((p) => b.pts.some((q) => norm(p) === norm(q)))) return false;
  // índice inverso: uma tradução de um volta à palavra inglesa do outro?
  const back = (x, y) => stemsOf(x).some((s) => { const m = meaningsOf(s); return m && [...m].some((e) => e === y.en || lemma(e) === lemma(y.en)); });
  return !back(a, b) && !back(b, a);
}
/** Alternativas confiáveis para `it` (sentido disjunto de `it` E entre si). */
export function distractorsFor(it, pool, rand = Math.random) {
  const out = [];
  for (const x of shuffle(pool, rand)) {
    if (x === it || !x.reliable || !disjoint(it, x) || out.some((y) => !disjoint(x, y))) continue;
    if (meaningLabel(x) === meaningLabel(it)) continue;
    out.push(x);
    if (out.length === 3) break;
  }
  return out;
}

// ---------- blocos (frases do original) ----------
export function blocksOf(act) {
  return act.questions.flatMap((q) => q.blocks.map((en, b) => ({ id: blockId(q.n, b), q: q.n, b, en, words: enTokens(en).length })));
}

// ---------- o que pode ser praticado nesta atividade ----------
/**
 * Chaves de exercício possíveis (skill|alvo). Só entram as que têm resposta verificável.
 * → { keys: [..], items, blocks, counts: { skill: n } }
 */
export function candidates(act, items = extractItems(act)) {
  const keys = [];
  const rel = items.filter((i) => i.reliable);
  const blocks = blocksOf(act);
  const fixed = () => 0.5; // a existência de alternativas não pode depender do sorteio
  for (const it of rel) {
    if (distractorsFor(it, rel, fixed).length >= 2) keys.push(keyOf('mean', it.id), keyOf('recall', it.id));
    keys.push(keyOf('write', it.id));
  }
  // completar: o gabarito é o original; sem sentido confirmado, só expressões (dica: primeira letra e nº de letras)
  for (const it of items) if (clozeAllowed(it) && clozeSource(act, it)) keys.push(keyOf('cloze', it.id));
  const listenItems = items.filter((i) => i.kind === 'expr' || i.en.length >= 4);
  if (distinctTexts(listenItems.map((i) => surfaceText(act, i))) >= 3) for (const it of listenItems) keys.push(keyOf('lisItem', it.id));
  const sayable = blocks.filter((b) => b.words >= 2 && b.words <= MAX_WORDS);
  if (distinctTexts(sayable.map((b) => b.en)) >= 3) for (const b of sayable) keys.push(keyOf('lisBlock', b.id));
  for (const it of items.filter((i) => i.kind === 'expr')) keys.push(keyOf('spkItem', it.id));
  for (const b of sayable) keys.push(keyOf('spkBlock', b.id));
  for (const b of blocks) if (reverseSource(act, b)) keys.push(keyOf('rev', b.id));
  const counts = {};
  for (const k of keys) { const s = splitKey(k)[0]; counts[s] = (counts[s] || 0) + 1; }
  return { keys, items, blocks, counts };
}
const distinctTexts = (list) => new Set(list.map(norm)).size;

/** Texto do item como aparece no original (1ª ocorrência), para ouvir/falar. */
export function surfaceText(act, it) {
  for (const s of it.src) {
    const q = act.questions.find((x) => x.n === s.q);
    const loc = q && locateIn(q.blocks[s.b], s.surface);
    if (loc) return loc.target;
  }
  return it.en;
}
// sem sentido confirmado, só expressões que aparecem no texto na forma da própria chave do glossário (uma chave casada
// pela forma-base, como “is in” → “be in”, pode ser outra expressão)
const clozeAllowed = (it) => it.reliable || (it.kind === 'expr' && it.src.some((s) => s.surface.join(' ') === it.en));
function clozeSource(act, it) {
  for (const s of it.src) {
    const q = act.questions.find((x) => x.n === s.q);
    const text = q && q.blocks[s.b];
    const loc = text && locateIn(text, s.surface);
    // a frase precisa ter contexto além do próprio item
    if (loc && enTokens(loc.before + ' ' + loc.after).length >= 2) return { ...s, text, loc };
  }
  return null;
}
/** Bloco com tradução VALIDADA pelo professor (único gabarito aceito na tradução reversa). */
export function reverseSource(act, blk) {
  if (!isValidated(act, blk.q) || blk.words > MAX_WORDS || blk.words < 1) return null;
  const pt = ((act.teacher[blk.q].blocks || [])[blk.b] || '').trim();
  return pt ? { pt, en: blk.en } : null;
}

// ---------- montagem de um exercício ----------
/** Exercício a partir da chave (ou null se não houver mais dados confiáveis para ele). */
export function makeExercise(act, cand, key, rand = Math.random) {
  const [skill, target] = splitKey(key);
  const it = cand.items.find((x) => x.id === target);
  const blk = cand.blocks.find((x) => x.id === target);
  const base = { key, skill, label: SKILL_LABEL[skill] };
  const srcOf = (s) => (s ? { q: s.q, b: s.b } : null);
  const rel = cand.items.filter((x) => x.reliable);
  const choice = (correctText, others) => shuffle([{ text: correctText, correct: true }, ...others.map((t) => ({ text: t, correct: false }))], rand);
  switch (skill) {
    case 'mean': case 'recall': {
      if (!it || !it.reliable) return null;
      const ds = distractorsFor(it, rel, rand);
      if (ds.length < 2) return null;
      const ctx = clozeSource(act, it) || it.src[0];
      const context = ctx.text || blockText(act, ctx);
      return skill === 'mean'
        ? { ...base, item: it, en: it.en, context, options: choice(meaningLabel(it), ds.map(meaningLabel)), src: srcOf(it.src[0]) }
        : { ...base, item: it, pt: meaningLabel(it), context: null, options: choice(it.en, ds.map((d) => d.en)), src: srcOf(it.src[0]) };
    }
    case 'cloze': {
      const c = it && clozeAllowed(it) && clozeSource(act, it);
      if (!c) return null;
      return { ...base, item: it, before: c.loc.before, after: c.loc.after, answer: c.loc.target, hint: it.reliable ? meaningLabel(it) : null, first: c.loc.target[0], letters: c.loc.target.replace(/[^A-Za-z]/g, '').length, src: srcOf(c) };
    }
    case 'write':
      if (!it || !it.reliable) return null;
      return { ...base, item: it, en: it.en, context: blockText(act, it.src[0]), src: srcOf(it.src[0]) };
    case 'lisItem': {
      if (!it) return null;
      const text = surfaceText(act, it);
      const others = shuffle(cand.items.filter((x) => x !== it && (x.kind === 'expr' || x.en.length >= 4)), rand)
        .map((x) => surfaceText(act, x)).filter((t, i, a) => norm(t) !== norm(text) && a.findIndex((y) => norm(y) === norm(t)) === i).slice(0, 3);
      if (others.length < 2) return null;
      return { ...base, item: it, text, options: choice(text, others), src: srcOf(it.src[0]) };
    }
    case 'lisBlock': {
      if (!blk) return null;
      const others = shuffle(cand.blocks.filter((x) => x !== blk && x.words >= 2 && x.words <= MAX_WORDS), rand)
        .map((x) => x.en).filter((t, i, a) => norm(t) !== norm(blk.en) && a.findIndex((y) => norm(y) === norm(t)) === i).slice(0, 2);
      if (others.length < 2) return null;
      return { ...base, text: blk.en, options: choice(blk.en, others), src: { q: blk.q, b: blk.b } };
    }
    case 'spkItem':
      return it ? { ...base, item: it, text: surfaceText(act, it), meaning: it.reliable ? meaningLabel(it) : null, src: srcOf(it.src[0]) } : null;
    case 'spkBlock':
      return blk ? { ...base, text: blk.en, src: { q: blk.q, b: blk.b } } : null;
    case 'rev': {
      const r = blk && reverseSource(act, blk);
      return r ? { ...base, pt: r.pt, answer: r.en, src: { q: blk.q, b: blk.b } } : null;
    }
    default: return null;
  }
}
function blockText(act, s) { const q = s && act.questions.find((x) => x.n === s.q); return q ? q.blocks[s.b] : ''; }

// ---------- correção ----------
// Resultados: 'good' (certo) · 'ok' (aceito com ressalva) · 'bad' (errado) · 'unverified' (sem evidência para julgar:
// não conta como erro) · 'empty' (sem resposta: nada é registrado).

/**
 * Significado digitado em português. Certo: um sentido CONFIRMADO (raízes). Outro sentido que o glossário admite (ou um
 * sinônimo que volta à palavra inglesa pelo índice inverso), mas não confirmado neste texto: “sem evidência” (não é erro).
 * Errado só quando todas as palavras da resposta são conhecidas do glossário e nenhuma tem o sentido do item.
 */
export function checkMeaning(it, pt) {
  if (!String(pt || '').trim()) return { result: 'empty' };
  const ans = ptContent(pt);
  const hit = (it.meanings || []).find((v) => variantIn(v, pt));
  if (hit) return { result: 'good', via: hit };
  const other = it.pts.find((v) => variantIn(v, pt));
  if (other) return { result: 'unverified', other };
  for (const a of ans) {
    const m = meaningsOf(a.s);
    if (m && [...m].some((e) => e === it.en || lemma(e) === lemma(it.en))) return { result: 'unverified', other: a.w };
  }
  if (ans.length && ans.every((a) => meaningsOf(a.s))) return { result: 'bad' };
  return { result: 'unverified' };
}

/** Completar a frase: o gabarito é o trecho do original. Mesma forma-base em outra flexão = aceito com ressalva. */
export function checkCloze(answer, typed) {
  const t = enTokens(typed), a = enTokens(answer);
  if (!t.length) return { result: 'empty' };
  if (t.join(' ') === a.join(' ')) return { result: 'good' };
  if (t.length === a.length && t.every((w, i) => lemma(w) === lemma(a[i]))) return { result: 'ok', note: `No texto: “${answer}”.` };
  return { result: 'bad' };
}

/**
 * Tradução reversa (português → inglês): compara com o inglês original.
 * Palavras gramaticais não contam; flexões (forma-base) contam como iguais.
 */
export function checkReverse(original, typed) {
  const t = enTokens(typed), o = enTokens(original);
  if (!t.length) return { result: 'empty' };
  if (t.join(' ') === o.join(' ')) return { result: 'good', missing: [], extra: [] };
  const content = (list) => list.filter((w) => !isFunctionWord(w) && !isFunctionWord(lemma(w)));
  const oc = content(o), tc = content(t);
  const has = (list, w) => list.some((x) => x === w || lemma(x) === lemma(w));
  const missing = oc.filter((w) => !has(tc, w));
  const extra = tc.filter((w) => !has(oc, w));
  const cov = oc.length ? (oc.length - missing.length) / oc.length : (t.length ? 1 : 0);
  if (cov >= 0.8 && extra.length <= 1) return { result: 'ok', missing, extra };
  if (cov < 0.4) return { result: 'bad', missing, extra };
  return { result: 'unverified', missing, extra };
}

// ---------- progresso (separado da tradução e das jornadas) ----------
export const emptyProgress = () => ({ v: 1, acts: {} });
export function validProgress(p) { return p && p.v === 1 && p.acts && typeof p.acts === 'object' ? p : emptyProgress(); }
export function actProgress(p, actId) {
  return p.acts[actId] || (p.acts[actId] = { cards: {}, stats: { attempts: 0, good: 0, ok: 0, bad: 0, unverified: 0 }, session: null });
}
const GRADED = { good: 'good', ok: 'ok', bad: 'bad' };
/** Registra uma tentativa. 'unverified' conta tentativa, mas não mexe na repetição espaçada. */
export function record(p, actId, key, result, { today = dayNumber(), now = Date.now() } = {}) {
  if (!['good', 'ok', 'bad', 'unverified'].includes(result)) return null;
  const ap = actProgress(p, actId);
  ap.stats.attempts++;
  ap.stats[result]++;
  const card = ap.cards[key] || { ...newCard(key, today), unverified: 0 };
  ap.cards[key] = GRADED[result] ? { ...grade(card, GRADED[result], today), unverified: card.unverified || 0, at: now } : { ...card, unverified: (card.unverified || 0) + 1, at: now };
  return ap.cards[key];
}

/**
 * Fila de uma sessão: pendentes de revisão (vencidos), depois novos, depois os demais (para que a prática continue
 * útil com poucos itens). Em 'errors', só os que tiveram erro na última tentativa.
 */
export function buildQueue(cand, ap, mode, { today = dayNumber(), size = 10, rand = Math.random } = {}) {
  const m = MODES[mode];
  if (!m) return [];
  const pool = mode === 'errors'
    ? cand.keys.filter((k) => ap.cards[k] && ap.cards[k].lastResult === 'bad')
    : cand.keys.filter((k) => m.skills.includes(splitKey(k)[0]));
  const due = shuffle(pool.filter((k) => ap.cards[k] && ap.cards[k].due <= today), rand);
  const fresh = shuffle(pool.filter((k) => !ap.cards[k]), rand);
  const rest = pool.filter((k) => ap.cards[k] && ap.cards[k].due > today).sort((a, b) => ap.cards[a].due - ap.cards[b].due);
  return [...due, ...fresh, ...rest].slice(0, size);
}

/** Nova sessão (guardada para retomar). */
export function startSession(ap, mode, keys, now = Date.now()) {
  ap.session = { mode, keys: keys.slice(), i: 0, results: {}, startedAt: now };
  return ap.session;
}
export const sessionOpen = (ap) => !!(ap && ap.session && ap.session.i < ap.session.keys.length);
/** Chaves erradas na sessão atual (para “Repetir os erros”). */
export const sessionErrors = (s) => (s ? s.keys.filter((k) => s.results[k] === 'bad') : []);
/** Resumo da prática de uma atividade. */
export function practiceSummary(ap, cand, today = dayNumber()) {
  const keys = new Set(cand.keys);
  const cards = Object.values(ap ? ap.cards : {}).filter((c) => keys.has(c.k));
  return {
    available: cand.keys.length, practised: cards.length,
    due: cards.filter((c) => c.due <= today).length, errors: cards.filter((c) => c.lastResult === 'bad').length,
    stats: ap ? ap.stats : { attempts: 0, good: 0, ok: 0, bad: 0, unverified: 0 },
  };
}
