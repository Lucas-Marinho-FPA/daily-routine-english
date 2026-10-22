// Repetição espaçada (Leitner) e montagem da sessão.
// Cartão = (unidade, habilidade). Unidades: item, sent (frase), block (parágrafo), routine, q (pergunta), verb.
// Habilidades: rec (reconhecer), rcl (recuperar), bld (completar na frase), ord (ordenar palavras),
//              wrt (escrever a frase), seq (ordenar frases do bloco), tell (contar o bloco),
//              retell (contar a rotina), conv (responder pergunta), vb3 (3ª pessoa).

export const INTERVALS = [0, 1, 3, 7, 16, 35, 90]; // dias por caixa
export const MASTERED_BOX = 3;
const DAY_MS = 86400000;

/** Número do dia local (muda à meia-noite do aparelho). */
export function dayNumber(ts = Date.now()) {
  const d = new Date(ts);
  return Math.floor((ts - d.getTimezoneOffset() * 60000) / DAY_MS);
}

export const cardKey = (unit, id, skill) => `${unit}:${id}:${skill}`;

export function newCard(k, today) {
  return { k, box: 0, due: today, reps: 0, lapses: 0, streak: 0, last: null, lastResult: null, created: today };
}

/**
 * Aplica o resultado a um cartão (retorna um novo objeto).
 * good = acerto · ok = aceito com ressalva/parcial · bad = erro.
 */
export function grade(card, outcome, today) {
  const c = { ...card, reps: card.reps + 1, last: today, lastResult: outcome };
  if (outcome === 'good') {
    c.box = Math.min(INTERVALS.length - 1, card.box + 1);
    c.streak = card.streak + 1;
    c.due = today + INTERVALS[c.box];
  } else if (outcome === 'ok') {
    c.box = Math.max(1, card.box);
    c.streak = 0;
    c.due = today + 1;
  } else {
    c.box = 0;
    c.streak = 0;
    c.lapses = card.lapses + 1;
    c.due = today; // volta na mesma sessão; se acertar depois, vai para o dia seguinte
  }
  return c;
}

const box = (cards, k) => (cards[k] ? cards[k].box : -1);

/** Lista de unidades disponíveis e ainda sem cartão, já respeitando o desbloqueio progressivo. */
export function unlockedNew(content, cards, focus) {
  const out = [];
  const inFocus = focusFilter(content, focus);
  const itemsOrdered = orderedItems(content, inFocus);

  for (const it of itemsOrdered) {
    const rec = cardKey('item', it.id, 'rec');
    if (!cards[rec]) { out.push({ k: rec, unit: 'item', id: it.id, skill: 'rec', isNewItem: true }); continue; }
    const rcl = cardKey('item', it.id, 'rcl');
    if (!cards[rcl] && box(cards, rec) >= 2) out.push({ k: rcl, unit: 'item', id: it.id, skill: 'rcl' });
    const bld = cardKey('item', it.id, 'bld');
    if (!cards[bld] && box(cards, rcl) >= 1 && it.sentences.length && ['collocation', 'phrasal', 'time', 'professional'].includes(it.c)) out.push({ k: bld, unit: 'item', id: it.id, skill: 'bld' });
  }
  for (const s of orderedSentences(content, inFocus)) {
    const ord = cardKey('sent', s.id, 'ord');
    const itemsSeen = s.items.filter((i) => box(cards, cardKey('item', i, 'rec')) >= 1).length;
    const ready = !s.items.length || itemsSeen / s.items.length >= 0.5;
    if (!cards[ord] && ready) out.push({ k: ord, unit: 'sent', id: s.id, skill: 'ord' });
    const wrt = cardKey('sent', s.id, 'wrt');
    if (!cards[wrt] && box(cards, ord) >= 2) out.push({ k: wrt, unit: 'sent', id: s.id, skill: 'wrt' });
  }
  for (const b of Object.values(content.blocks).filter((b) => inFocus.blocks.has(b.id))) {
    const seq = cardKey('block', b.id, 'seq');
    // basta ter montado cada frase do bloco ao menos uma vez (um erro recente não trava o bloco)
    const allOrd = b.sentences.every((sid) => cards[cardKey('sent', sid, 'ord')] && cards[cardKey('sent', sid, 'ord')].reps > 0);
    if (!cards[seq] && b.sentences.length > 1 && allOrd) out.push({ k: seq, unit: 'block', id: b.id, skill: 'seq' });
    const tell = cardKey('block', b.id, 'tell');
    const seqOk = b.sentences.length > 1 ? !!cards[seq] && cards[seq].reps > 0 : allOrd;
    if (!cards[tell] && seqOk) out.push({ k: tell, unit: 'block', id: b.id, skill: 'tell' });
  }
  for (const r of content.routines.filter((r) => inFocus.routines.has(r.id))) {
    const k = cardKey('routine', r.id, 'retell');
    // a rotina completa entra quando todos os blocos já foram contados ao menos uma vez
    if (!cards[k] && r.blocks.every((b) => cards[cardKey('block', b, 'tell')] && cards[cardKey('block', b, 'tell')].reps > 0)) out.push({ k, unit: 'routine', id: r.id, skill: 'retell' });
  }
  for (const q of Object.values(content.questions).filter((q) => inFocus.questions.has(q.id))) {
    const k = cardKey('q', q.id, 'conv');
    // as perguntas de uma rotina entram depois que o usuário já viu itens dela
    const routineStarted = !q.routine || content.routines.find((r) => r.id === q.routine).items.some((i) => cards[cardKey('item', i, 'rec')]);
    if (!cards[k] && routineStarted) out.push({ k, unit: 'q', id: q.id, skill: 'conv' });
  }
  if (inFocus.verbs) {
    for (const v of content.verbs) {
      const k = cardKey('verb', v.id, 'vb3');
      if (!cards[k] && Object.keys(cards).length > 20) out.push({ k, unit: 'verb', id: v.id, skill: 'vb3' });
    }
  }
  return out;
}

/** Conjunto de unidades no foco atual (rotina, contexto, categoria ou padrão = Rotina 1 primeiro). */
export function focusFilter(content, focus = {}) {
  const routines = new Set();
  const blocks = new Set();
  const items = new Set();
  const questions = new Set();
  const all = !focus.routine && !focus.context && !focus.category;
  const routineList = content.routines;

  if (focus.routine) routines.add(focus.routine);
  if (all) routineList.forEach((r) => routines.add(r.id));

  for (const b of Object.values(content.blocks)) {
    if (routines.has(b.routine) || (focus.context && b.ctx.includes(focus.context))) blocks.add(b.id);
  }
  for (const it of Object.values(content.items)) {
    if (it.tags.includes('grammar-model')) continue;
    const inCat = focus.category && it.c === focus.category;
    const inCtx = focus.context && it.ctx.includes(focus.context);
    const inRoutine = focus.routine && it.routines.includes(focus.routine);
    if (all || inCat || inCtx || inRoutine) items.add(it.id);
  }
  for (const q of Object.values(content.questions)) {
    if (q.openPersonal && !all && !focus.category) continue;
    if (all || (focus.routine && q.routine === focus.routine) || focus.category === 'qa' ||
        (focus.context && q.routine && content.routines.find((r) => r.id === q.routine).blocks.some((b) => content.blocks[b].ctx.includes(focus.context)))) {
      questions.add(q.id);
    }
  }
  if (focus.category && !['qa', 'sentence', 'text'].includes(focus.category)) { blocks.clear(); questions.clear(); }
  if (focus.category === 'qa') items.clear();
  if (focus.category === 'sentence' || focus.category === 'text') routineList.forEach((r) => { routines.add(r.id); r.blocks.forEach((b) => blocks.add(b)); });
  return { routines, blocks, items, questions, verbs: all || focus.category === 'verb' };
}

/** Itens na ordem em que aparecem nas rotinas (R01 primeiro), depois por nível. */
function orderedItems(content, inFocus) {
  const order = new Map();
  let n = 0;
  for (const r of content.routines) for (const b of r.blocks) for (const sid of content.blocks[b].sentences) {
    for (const i of content.sentences[sid].items) if (!order.has(i)) order.set(i, n++);
  }
  return [...inFocus.items].map((id) => content.items[id])
    .sort((a, b) => (order.get(a.id) ?? 1e6 + a.lvl * 1000) - (order.get(b.id) ?? 1e6 + b.lvl * 1000));
}

function orderedSentences(content, inFocus) {
  const out = [];
  for (const r of content.routines) for (const b of r.blocks) if (inFocus.blocks.has(b)) out.push(...content.blocks[b].sentences.map((s) => content.sentences[s]));
  return out;
}

/**
 * Monta a fila da sessão com cotas, para que a progressão não trave:
 * - revisões vencidas: até 50% (prioriza o foco);
 * - habilidades recém-desbloqueadas (lembrar, completar, frases, blocos): até 25%;
 * - itens novos: o que sobrar, no máximo `maxNewItems` (menos quando há muitas revisões acumuladas);
 * - uma pergunta de conversação quando houver;
 * - espaço restante: mais revisões, depois mais desbloqueios, depois mais novos.
 */
export function buildSession(content, cards, { focus = {}, size = 12, maxNewItems = 4, today = dayNumber(), rand = Math.random } = {}) {
  const inFocus = focusFilter(content, focus);
  const unitInFocus = (k) => {
    const [unit, id] = k.split(':');
    if (unit === 'item') return inFocus.items.has(id);
    if (unit === 'sent') return inFocus.blocks.has(content.sentences[id]?.block);
    if (unit === 'block') return inFocus.blocks.has(id);
    if (unit === 'routine') return inFocus.routines.has(id);
    if (unit === 'q') return inFocus.questions.has(id);
    return inFocus.verbs;
  };
  const exists = (k) => {
    const [unit, id] = k.split(':');
    return unit === 'item' ? !!content.items[id] : unit === 'sent' ? !!content.sentences[id] : unit === 'block' ? !!content.blocks[id]
      : unit === 'routine' ? content.routines.some((r) => r.id === id) : unit === 'q' ? !!content.questions[id] : content.verbs.some((v) => v.id === id);
  };
  // graduação: com a habilidade superior estabelecida (caixa ≥ 2), a inferior deixa de ser revisada
  const graduated = (k) => {
    const [unit, id, skill] = k.split(':');
    const up = { 'item:rec': 'rcl', 'sent:ord': 'wrt', 'block:seq': 'tell' }[`${unit}:${skill}`];
    return !!up && box(cards, cardKey(unit, id, up)) >= 2;
  };
  const toEntry = (c) => { const [unit, id, skill] = c.k.split(':'); return { k: c.k, unit, id, skill, review: true }; };
  const due = Object.values(cards).filter((c) => c.due <= today && exists(c.k) && !graduated(c.k))
    .sort((a, b) => (unitInFocus(b.k) - unitInFocus(a.k)) || (a.due - b.due) || (a.box - b.box) || (rand() - 0.5))
    .map(toEntry);
  const fresh = unlockedNew(content, cards, focus);
  const newItems = fresh.filter((f) => f.isNewItem).map((f) => ({ ...f, learn: true }));
  // desbloqueios: alterna tipos para não vir só um tipo de exercício
  const higher = roundRobin(fresh.filter((f) => !f.isNewItem && f.skill !== 'conv'), (f) => f.skill, ['retell', 'tell', 'seq', 'wrt', 'ord', 'rcl', 'bld', 'vb3']);
  const conv = fresh.filter((f) => f.skill === 'conv');

  const queue = [];
  const take = (list, n) => { const out = list.splice(0, Math.max(0, n)); queue.push(...out); return out.length; };
  const reviewQuota = Math.round(size * (due.length > 30 ? 0.7 : 0.5)); // muitas pendências → sessão mais de revisão
  const higherQuota = Math.round(size * 0.25);
  const freed = reviewQuota - take(due, reviewQuota); // vagas de revisão não usadas vão para os níveis desbloqueados
  take(higher, higherQuota + freed);
  const backlog = due.length; // revisões que ainda sobraram
  const newQuota = Math.min(backlog > 20 ? 1 : backlog > 8 ? 2 : maxNewItems + (queue.length <= 2 ? 2 : 0), size - queue.length - (conv.length && !queue.some((q) => q.skill === 'conv') ? 1 : 0));
  take(newItems, newQuota);
  if (!queue.some((q) => q.skill === 'conv')) take(conv, 1);
  take(due, size - queue.length);
  take(higher, size - queue.length);
  take(newItems, Math.min(size - queue.length, Math.max(0, maxNewItems + 2 - queue.filter((q) => q.learn).length)));
  return interleave(queue, rand);
}

/** Intercala grupos (um de cada por rodada), na ordem de prioridade dada. */
function roundRobin(list, keyFn, priority = []) {
  const groups = new Map();
  for (const x of list) { const k = keyFn(x); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(x); }
  const out = [];
  const rank = (k) => (priority.includes(k) ? priority.indexOf(k) : priority.length);
  const lists = [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0])).map(([, g]) => g);
  for (let i = 0; out.length < list.length; i++) for (const g of lists) if (g[i]) out.push(g[i]);
  return out;
}

/** Intercala para evitar blocos do mesmo tipo; itens novos aparecem cedo, perguntas e blocos no fim. */
function interleave(queue, rand) {
  let order = 0;
  const weight = (q) => (q.learn ? (order++) * 0.01 : ['rec'].includes(q.skill) ? 1 : ['rcl', 'vb3'].includes(q.skill) ? 2
    : ['bld', 'ord'].includes(q.skill) ? 3 : ['wrt', 'seq'].includes(q.skill) ? 4 : 5) + rand() * 1.5;
  return queue.map((q) => [weight(q), q]).sort((a, b) => a[0] - b[0]).map(([, q]) => q);
}

/** Estatística de domínio para um conjunto de chaves de cartão. */
export function mastery(cards, keys) {
  if (!keys.length) return { seen: 0, mastered: 0, total: 0, ratio: 0 };
  let seen = 0, mastered = 0;
  for (const k of keys) {
    const c = cards[k];
    if (c) { seen++; if (c.box >= MASTERED_BOX) mastered++; }
  }
  return { seen, mastered, total: keys.length, ratio: (seen * 0.3 + mastered * 0.7) / keys.length };
}
