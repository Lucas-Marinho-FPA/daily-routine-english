// Geração de exercícios a partir de uma entrada da fila (cartão). Funções puras.
import { wordTokens, findPattern, tokenSpans, shuffle } from './text.js';

const CAT_LABEL = { word: 'palavra', verb: 'verbo', collocation: 'collocation', phrasal: 'phrasal verb', professional: 'profissional',
  time: 'tempo e frequência', connector: 'conector / estrutura', sentence: 'frase', qa: 'pergunta', text: 'texto' };
export const categoryLabel = (c) => CAT_LABEL[c] || c;

/** Localiza o item numa frase: retorna { before, target, after } em texto original, ou null. */
export function locate(item, text) {
  const pattern = (item.match || item.en).split(' / ')[0].replace(/…$/, '');
  const spans = tokenSpans(text);
  const hit = findPattern(pattern, wordTokens(text), { separable: item.c === 'phrasal' });
  if (!hit) return null;
  const start = spans[hit[0]].start, end = spans[hit[1] - 1].end;
  return { before: text.slice(0, start), target: text.slice(start, end), after: text.slice(end) };
}

/** Variantes aceitas para um item (forma principal, variantes da curadoria, sem reticências). */
export const itemTargets = (item) => [item.en, ...item.v].map((t) => t.replace(/…$/, '').trim());

function distractors(content, item, n, rand) {
  const pool = Object.values(content.items).filter((x) => x.id !== item.id && x.pt && x.pt !== item.pt && !x.tags.includes('grammar-model'));
  const sameCat = pool.filter((x) => x.c === item.c);
  const sameCtx = sameCat.filter((x) => x.ctx.some((c) => item.ctx.includes(c)));
  const picked = [];
  for (const group of [shuffle(sameCtx, rand), shuffle(sameCat, rand), shuffle(pool, rand)]) {
    for (const x of group) {
      if (picked.length >= n) break;
      if (!picked.some((p) => p.pt === x.pt)) picked.push(x);
    }
  }
  return picked;
}

/** Divide uma frase em peças para o exercício de ordenar (≤ 9 peças). */
export function orderPieces(text) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 9) return words;
  const pieces = [];
  let cur = [];
  for (const w of words) {
    cur.push(w);
    const size = words.length > 18 ? 3 : 2;
    if (/[,;]$/.test(w) || cur.length >= size) { pieces.push(cur.join(' ')); cur = []; }
  }
  if (cur.length) pieces.push(cur.join(' '));
  return pieces;
}

/** Pista progressiva: nível 1 = iniciais; nível 2 = metade das letras. */
export function hint(text, level) {
  return text.split(' ').map((w) => {
    const letters = w.replace(/[^A-Za-zÀ-ÿ]/g, '');
    if (!letters) return w;
    const keep = level >= 2 ? Math.ceil(letters.length / 2) : 1;
    return w.slice(0, keep) + w.slice(keep).replace(/[A-Za-zÀ-ÿ]/g, '_');
  }).join(' ');
}

/** Cria o exercício para a entrada da fila. */
export function makeExercise(content, entry, rand = Math.random) {
  const { unit, id, skill } = entry;
  if (unit === 'item') {
    const item = content.items[id];
    if (skill === 'rec') {
      const options = shuffle([{ pt: item.pt, correct: true }, ...distractors(content, item, 3, rand).map((x) => ({ pt: x.pt, correct: false }))], rand);
      const ex = item.ex.find((x) => x.src && /^[A-Z]\d\d-B\d+-S\d+$/.test(x.src)); // frase de rotina de qualquer personagem (R01-…, K01-…)
      const inContext = ex && rand() < 0.4 ? locate(item, ex.en) : null;
      return { type: 'mc', entry, item, options, context: inContext ? { ...inContext, au: ex.au } : null };
    }
    if (skill === 'rcl') {
      const ex = item.ex.find((x) => x.pt);
      return { type: 'recall', entry, item, targets: itemTargets(item), cue: ex ? ex.pt : null, label: categoryLabel(item.c) };
    }
    if (skill === 'nat') {
      // forma mais natural: a frase do texto com a forma simples no lugar da expressão; escolher a expressão britânica
      const s = content.sentences[item.sentences[0]];
      const loc = s ? locate(item, s.en) : null;
      if (!loc || !item.plain) return makeExercise(content, { ...entry, skill: 'rec' }, rand);
      const pool = Object.values(content.items).filter((x) => x.id !== item.id && x.en !== item.en && x.routines.some((r) => item.routines.includes(r)) && ['phrasal', 'collocation', 'time', 'connector'].includes(x.c));
      const others = shuffle(pool, rand).slice(0, 3);
      const options = shuffle([{ text: item.en, correct: true }, ...others.map((x) => ({ text: x.en, correct: false }))], rand);
      return { type: 'nat', entry, item: { ...item, q: `Qual expressão diz “${item.plain}” de um jeito mais natural?`, explain: `“${item.en}” = ${item.pt}.${item.explain ? ' ' + item.explain : ''}` },
        sentence: s, before: loc.before, plain: item.plain, after: loc.after, options };
    }
    if (skill === 'bld') {
      const sid = item.sentences[Math.floor(rand() * item.sentences.length)];
      const s = content.sentences[sid];
      const loc = locate(item, s.en);
      if (!loc) return makeExercise(content, { ...entry, skill: 'rcl' }, rand);
      return { type: 'cloze', entry, item, sentence: s, ...loc, targets: [loc.target] };
    }
  }
  if (unit === 'sent') {
    const s = content.sentences[id];
    if (skill === 'ord') {
      const pieces = orderPieces(s.en);
      let shuffled = shuffle(pieces, rand);
      for (let i = 0; i < 5 && shuffled.join(' ') === pieces.join(' ') && pieces.length > 1; i++) shuffled = shuffle(pieces, rand);
      return { type: 'order', entry, sentence: s, pieces, shuffled };
    }
    if (skill === 'lis') {
      // ouvir e reconhecer: a frase só aparece depois da resposta; as alternativas são outras frases do mesmo módulo
      const r = content.routines.find((x) => x.id === s.routine);
      const pool = (r ? r.blocks.flatMap((b) => content.blocks[b].sentences) : []).filter((x) => x !== s.id).map((x) => content.sentences[x]).filter((x) => x.en !== s.en);
      const others = shuffle(pool, rand).slice(0, 3);
      const options = shuffle([{ text: s.en, correct: true }, ...others.map((x) => ({ text: x.en, correct: false }))], rand);
      return { type: 'listen', entry, item: { q: 'Qual destas frases você ouviu?', explain: s.pt }, options, clips: [{ key: s.au, text: s.en, speaker: s.speaker || null, sid: s.id }] };
    }
    if (skill === 'wrt') {
      const items = s.items.map((i) => content.items[i]).filter((it) => it.c !== 'connector').slice(0, 4);
      return { type: 'write', entry, sentence: s, targets: [s.en], hints: items.map((it) => ({ en: it.en, pt: it.pt })) };
    }
  }
  if (unit === 'block') {
    const b = content.blocks[id];
    const sents = b.sentences.map((sid) => content.sentences[sid]);
    if (skill === 'seq') {
      let shuffled = shuffle(sents, rand);
      for (let i = 0; i < 5 && shuffled.every((x, k) => x.id === sents[k].id); i++) shuffled = shuffle(sents, rand);
      return { type: 'seq', entry, block: b, sentences: sents, shuffled };
    }
    if (skill === 'tell') {
      const items = [...new Set(sents.flatMap((s) => s.items))].map((i) => content.items[i])
        .filter((it) => !['connector'].includes(it.c)).sort((a, b) => b.lvl - a.lvl).slice(0, 8);
      return { type: 'tell', entry, block: b, sentences: sents, items, routine: content.routines.find((r) => r.id === b.routine) };
    }
  }
  if (unit === 'routine') {
    const r = content.routines.find((x) => x.id === id);
    const blocks = r.blocks.map((bid) => {
      const b = content.blocks[bid];
      const items = [...new Set(b.sentences.flatMap((sid) => content.sentences[sid].items))].map((i) => content.items[i])
        .filter((it) => it.c !== 'connector').sort((a, b2) => b2.lvl - a.lvl).slice(0, 3);
      return { block: b, items };
    });
    return { type: 'retell', entry, routine: r, blocks, items: blocks.flatMap((b) => b.items) };
  }
  if (unit === 'q') {
    const q = content.questions[id];
    return { type: 'conv', entry, q, items: q.items.map((i) => content.items[i]).filter(Boolean) };
  }
  if (unit === 'lq') {
    // ouvir e responder: o texto do trecho só aparece depois da resposta
    const l = content.listening[id];
    const options = shuffle(l.options.map((t, i) => ({ text: t, correct: i === l.answer })), rand);
    const clips = l.sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en, speaker: content.sentences[sid].speaker || null, sid }));
    return { type: 'listen', entry, item: l, options, clips };
  }
  if (unit === 'rq') {
    // ler e responder: o diálogo inteiro à vista, com a fala de referência destacada
    const x = content.reading[id];
    const options = shuffle(x.options.map((t, i) => ({ text: t, correct: i === x.answer })), rand);
    const passage = content.blocks[x.block].sentences.map((sid) => ({ ...content.sentences[sid], focus: sid === x.sentence }));
    return { type: 'read', entry, item: x, options, passage };
  }
  if (unit === 'verb') {
    const v = content.verbs.find((x) => x.id === id);
    return { type: 'vb3', entry, verb: v, targets: [v.third] };
  }
  throw new Error('Entrada desconhecida: ' + entry.k);
}

/** Agrupa até 4 reconhecimentos de revisão num exercício de pares (associação). */
export function maybePairs(queue, content, rand = Math.random) {
  const recs = queue.filter((q) => q.unit === 'item' && q.skill === 'rec' && q.review);
  if (recs.length < 4 || rand() < 0.5) return queue;
  const group = recs.slice(0, 4);
  const items = group.map((g) => content.items[g.id]);
  if (new Set(items.map((i) => i.pt)).size < 4) return queue;
  const pairs = { k: 'pairs:' + group.map((g) => g.id).join(','), unit: 'pairs', group, review: true };
  const rest = queue.filter((q) => !group.includes(q));
  rest.splice(Math.min(2, rest.length), 0, pairs);
  return rest;
}

export function makePairs(content, entry, rand = Math.random) {
  const items = entry.group.map((g) => content.items[g.id]);
  return { type: 'pairs', entry, items, left: shuffle(items, rand), right: shuffle(items, rand) };
}
