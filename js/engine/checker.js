// Correção inteligente, local e determinística.
// Classes de resultado:
//   correct          idêntico ao modelo após normalização (maiúsculas, pontuação, espaços, contrações, horas, números)
//   accepted_variant variante aprovada (sinônimo seguro, variante do item, troca de determinante)
//   variant_ame      grafia americana aceitável → aceita com observação BrE
//   spelling         pequeno erro de digitação numa palavra → aceita com marca
//   grammar          erro gramatical reconhecido (regra com explicação) → não aceita
//   meaning          falta o conteúdo essencial → não aceita
//   inconclusive     diferença que o motor não consegue julgar com segurança → mostra a diferença; o usuário decide
//   empty            sem resposta
import { basicNormalise, wordTokens, tokenSpans, levenshtein, lcsAlign, findPattern, inflections } from './text.js';

const ACCEPTED = new Set(['correct', 'accepted_variant', 'variant_ame', 'spelling']);
const TIME_PREP = new Set(['at', 'until', 'by', 'around', 'about', 'from', 'till', 'before', 'after', 'between']);
const PRACTICE_SUBJ = new Set(['i', 'we', 'you', 'they', 'to', 'not', 'and', 'also', 'usually', 'often', 'always', 'sometimes']);

export function createChecker(lang, { userVariants = {} } = {}) {
  const contractions = lang.contractions || {};
  const ame = Object.fromEntries(Object.entries(lang.spellingAmE || {}).filter(([k]) => !k.startsWith('_')));
  const numberWords = lang.numberWords || {};
  const stop = new Set(lang.stopwords || []);
  const determiners = new Set(lang.determiners || []);
  const synonymGroups = (lang.synonyms || []).map((g) => g.map((p) => wordTokens(p)));
  const rules = (lang.errors || []).map((e) => ({ ...e, rx: new RegExp(e.re, 'i') }));

  // ---------- normalização em tokens (com procedência) ----------
  // Cada token guarda `src`: os índices dos trechos do texto ORIGINAL (tokenSpans) de onde veio. Assim a
  // diferença é mostrada por posição no texto que o aluno escreveu, nunca por palavra solta normalizada.
  const tok = (t, src) => ({ t, src });
  const srcUnion = (list) => [...new Set(list.flatMap((o) => o.src))].sort((a, b) => a - b);

  function srcTokens(text) {
    const spans = tokenSpans(text);
    const toks = [];
    spans.forEach((sp, k) => { for (const w of wordTokens(sp.text)) toks.push(tok(w, [k])); });
    return { spans, toks };
  }

  function expandContractionsS(toks) {
    const out = [];
    for (const o of toks) {
      if (contractions[o.t]) out.push(...contractions[o.t].split(' ').map((w) => tok(w, o.src)));
      else if (/^\w+'s$/.test(o.t)) out.push(tok(o.t.replace(/'s$/, ''), o.src));
      else out.push(o);
    }
    return out;
  }

  // Horas → token canônico "@H:MM" ou "@H:MMam/pm". `style` recebe formas compreensíveis mas pouco naturais.
  function canonTimesS(toks, style = []) {
    const tk = toks.map((o) => o.t);
    const out = [];
    const num = (t) => (/^\d{1,2}$/.test(t) ? Number(t) : numberWords[t]);
    // minutos a partir de j: "thirty", "forty five", "45"
    const minutesAt = (j) => {
      if (/^\d{2}$/.test(tk[j] || '') && +tk[j] < 60) return { m: +tk[j], n: 1 };
      const a = numberWords[tk[j]];
      if (a === undefined) return null;
      const b = numberWords[tk[j + 1]];
      if ([20, 30, 40, 50].includes(a) && b >= 1 && b <= 9) return { m: a + b, n: 2 };
      if (a >= 10 && a < 60 && a !== 12) return { m: a, n: 1 };
      return null;
    };
    for (let i = 0; i < toks.length; i++) {
      const t = tk[i];
      let h = null, m = 0, consumed = 0, unnatural = false;
      let match;
      if ((match = /^(\d{1,2}):(\d{2})$/.exec(t))) { h = +match[1]; m = +match[2]; consumed = 1; }
      else if ((match = /^(\d{1,2})h(\d{2})?$/.exec(t))) { h = +match[1]; m = match[2] ? +match[2] : 0; consumed = 1; }
      else if ((match = /^(\d{1,2}(?::\d{2})?)(am|pm)$/.exec(t))) {
        const [hh, mm] = match[1].split(':');
        out.push(tok(`@${+hh}:${mm || '00'}${match[2]}`, toks[i].src)); continue;
      }
      else if (t === 'midnight') { out.push(tok('@12:00am', toks[i].src)); continue; }
      else if (t === 'noon' || t === 'midday') { out.push(tok('@12:00pm', toks[i].src)); continue; }
      else if (t === 'half' && tk[i + 1] === 'past' && num(tk[i + 2]) <= 12) { h = num(tk[i + 2]); m = 30; consumed = 3; }
      else if (t === 'quarter' && tk[i + 1] === 'past' && num(tk[i + 2]) <= 12) { h = num(tk[i + 2]); m = 15; consumed = 3; if (out.length && out[out.length - 1].t === 'a') out.pop(); }
      else if (t === 'quarter' && tk[i + 1] === 'to' && num(tk[i + 2]) <= 12) { h = num(tk[i + 2]) - 1 || 12; m = 45; consumed = 3; if (out.length && out[out.length - 1].t === 'a') out.pop(); }
      else if (num(t) !== undefined && num(t) >= 1 && num(t) <= 12) {
        const isTimeContext = ['am', 'pm', "o'clock", 'oclock', 'sharp'].includes(tk[i + 1]) || TIME_PREP.has(tk[i - 1]) ||
          (tk[i + 1] === 'in' && tk[i + 2] === 'the' && ['morning', 'afternoon', 'evening'].includes(tk[i + 3]));
        if (isTimeContext) {
          h = num(t); consumed = 1;
          const mm = minutesAt(i + 1);
          if (mm) { m = mm.m; consumed = 1 + mm.n; } // "five thirty", "five forty-five"
          else if (tk[i + 1] === 'and') {
            // “five and thirty” (calque do português “cinco e trinta”): compreensível, pouco natural
            const m2 = minutesAt(i + 2);
            if (m2) { m = m2.m; consumed = 2 + m2.n; unnatural = true; }
          }
        }
      }
      if (h === null) { out.push(toks[i]); continue; }
      const parts = toks.slice(i, i + consumed);
      i += consumed - 1;
      let mer = '';
      if (tk[i + 1] === "o'clock" || tk[i + 1] === 'oclock') { parts.push(toks[++i]); }
      if (tk[i + 1] === 'am' || tk[i + 1] === 'pm') { mer = tk[i + 1]; parts.push(toks[++i]); }
      else if (tk[i + 1] === 'in' && tk[i + 2] === 'the' && tk[i + 3] === 'morning') { mer = 'am'; parts.push(...toks.slice(i + 1, i + 4)); i += 3; }
      else if (tk[i + 1] === 'in' && tk[i + 2] === 'the' && ['afternoon', 'evening'].includes(tk[i + 3])) { mer = 'pm'; parts.push(...toks.slice(i + 1, i + 4)); i += 3; }
      else if (tk[i + 1] === 'at' && tk[i + 2] === 'night') { mer = 'pm'; parts.push(...toks.slice(i + 1, i + 3)); i += 2; }
      if (h > 12 && h < 24) { h -= 12; mer = 'pm'; }
      const src = srcUnion(parts);
      if (unnatural) style.push({ kind: 'time-and', src, h, m, mer });
      out.push(tok(`@${h}:${String(m).padStart(2, '0')}${mer}`, src));
    }
    return out;
  }

  const numbersToDigitsS = (toks) => toks.map((o) => (numberWords[o.t] !== undefined && !/^@/.test(o.t) ? tok(String(numberWords[o.t]), o.src) : o));

  function applyAmES(toks) {
    let changed = false;
    const out = toks.map((o, i) => {
      const prev = toks[i - 1] && toks[i - 1].t;
      if (ame[o.t]) { changed = true; return tok(ame[o.t], o.src); }
      if (o.t === 'practice' && PRACTICE_SUBJ.has(prev)) { changed = true; return tok('practise', o.src); }
      if (o.t === 'practices' && ['my', 'wife', 'he', 'she', 'son'].includes(prev)) { changed = true; return tok('practises', o.src); }
      return o;
    });
    return { tokens: out, changed };
  }

  function applySynonymsS(toks) {
    let changed = false;
    let out = toks.slice();
    for (const group of synonymGroups) {
      const canon = group[0];
      for (const alt of group.slice(1)) {
        for (let i = 0; i + alt.length <= out.length; i++) {
          if (alt.every((t, k) => out[i + k].t === t)) {
            const src = srcUnion(out.slice(i, i + alt.length));
            out = [...out.slice(0, i), ...canon.map((t) => tok(t, src)), ...out.slice(i + alt.length)];
            changed = true;
          }
        }
      }
    }
    return { tokens: out, changed };
  }

  // versões em texto puro (usadas pela cobertura de respostas longas)
  const plain = (fn) => (tokens) => fn(tokens.map((t) => tok(t, []))).map((o) => o.t);
  const expandContractions = plain(expandContractionsS);
  const canonTimes = plain((x) => canonTimesS(x));
  const numbersToDigits = plain(numbersToDigitsS);
  const applyAmE = (tokens) => { const r = applyAmES(tokens.map((t) => tok(t, []))); return { tokens: r.tokens.map((o) => o.t), changed: r.changed }; };
  const applySynonyms = (tokens) => { const r = applySynonymsS(tokens.map((t) => tok(t, []))); return { tokens: r.tokens.map((o) => o.t), changed: r.changed }; };

  function prepare(text) {
    const { spans, toks } = srcTokens(text);
    const style = [];
    const baseS = numbersToDigitsS(canonTimesS(expandContractionsS(toks), style));
    const a = applyAmES(baseS);
    const s = applySynonymsS(a.tokens);
    const strs = (l) => l.map((o) => o.t);
    return { base: strs(baseS), bre: strs(a.tokens), full: strs(s.tokens), baseS, breS: a.tokens, fullS: s.tokens, spans, style, ame: a.changed, syn: s.changed };
  }

  const timeEq = (x, y) => {
    if (x[0] !== '@' || y[0] !== '@') return false;
    const cx = x.replace(/(am|pm)$/, ''), cy = y.replace(/(am|pm)$/, '');
    const merX = (x.match(/(am|pm)$/) || [])[1], merY = (y.match(/(am|pm)$/) || [])[1];
    return cx === cy && (!merX || !merY || merX === merY);
  };
  const same = (a, b) => a.length === b.length && a.every((t, i) => t === b[i] || timeEq(t, b[i]));
  const spellEq = (x, y) => {
    if (x === y || timeEq(x, y)) return true;
    if (x[0] === '@' || y[0] === '@' || /^\d+$/.test(x) || /^\d+$/.test(y)) return false;
    const L = Math.max(x.length, y.length);
    const d = levenshtein(x, y);
    return (L >= 4 && d <= 1) || (L >= 8 && d <= 2);
  };

  function ruleHits(text, targetText) {
    const a = basicNormalise(text).replace(/[.,!?;]/g, ' ').replace(/\s+/g, ' ').trim();
    const t = basicNormalise(targetText || '').replace(/[.,!?;]/g, ' ');
    return rules.filter((r) => r.rx.test(a) && !r.rx.test(t));
  }

  // ---------- diferença por posição (no texto original) ----------
  const spanText = (P, srcs) => {
    if (!srcs.length) return '';
    const a = Math.min(...srcs), b = Math.max(...srcs);
    return P.text.slice(P.spans[a].start, P.spans[b].end);
  };
  const srcOf = (list) => [...new Set(list.flatMap((o) => o.src))];

  /**
   * Classifica cada trecho do original: ok | equiv (equivalente: hora/número escrito de outro jeito) |
   * style (troca de artigo/possessivo: “the office” × “my office”) | extra | miss | typo.
   * A comparação é feita por LACUNAS entre âncoras alinhadas, nunca por palavra solta.
   */
  function buildDiff(A, P, pairs) {
    const aState = A.spans.map(() => 'ok'), pState = P.spans.map(() => 'ok');
    const RANK = { ok: 0, equiv: 1, style: 2, typo: 3, extra: 4, miss: 4 };
    const set = (st, srcs, v) => srcs.forEach((k) => { if (RANK[v] > RANK[st[k]]) st[k] = v; });
    const swaps = [];
    const anchors = [[-1, -1], ...pairs, [A.fullS.length, P.fullS.length]];
    for (let g = 0; g < anchors.length - 1; g++) {
      const [i0, j0] = anchors[g], [i1, j1] = anchors[g + 1];
      const aG = A.fullS.slice(i0 + 1, i1), pG = P.fullS.slice(j0 + 1, j1);
      if (aG.length && pG.length && aG.every((o) => determiners.has(o.t)) && pG.every((o) => determiners.has(o.t))) {
        set(aState, srcOf(aG), 'style'); set(pState, srcOf(pG), 'style');
        swaps.push({ a: srcOf(aG), p: srcOf(pG), nextA: i1 < A.fullS.length ? A.fullS[i1].src : [], nextP: j1 < P.fullS.length ? P.fullS[j1].src : [] });
        continue;
      }
      set(aState, srcOf(aG), 'extra');
      set(pState, srcOf(pG), 'miss');
    }
    for (const [i, j] of pairs) {
      const a = A.fullS[i], b = P.fullS[j];
      if (a.t !== b.t && !timeEq(a.t, b.t)) { set(aState, a.src, 'typo'); continue; }
      // mesma unidade de sentido escrita de outro jeito (ex.: “five thirty a.m.” × “5:30”)
      const sa = wordTokens(spanText(A, a.src)).join(' '), sb = wordTokens(spanText(P, b.src)).join(' ');
      if (sa !== sb && a.t[0] === '@') { set(aState, a.src, 'equiv'); set(pState, b.src, 'equiv'); }
    }
    const view = (X, st) => X.spans.map((sp, k) => ({ start: sp.start, end: sp.end, state: st[k] }));
    return { answerSpans: view(A, aState), targetSpans: view(P, pState), swaps };
  }

  /** Expressões compreensíveis, mas pouco naturais (ex.: “five and thirty” → “five thirty”). */
  function naturalnessNotes(A) {
    return A.style.map((st) => {
      if (st.kind !== 'time-and') return null;
      const k0 = Math.min(...st.src);
      const prev = k0 > 0 && TIME_PREP.has(wordTokens(A.spans[k0 - 1].text)[0]) ? [k0 - 1] : [];
      const surface = spanText(A, [...prev, ...st.src]);
      const better = surface.replace(/\s+and\s+/i, ' ');
      return `Seu significado está claro (${st.h}:${String(st.m).padStart(2, '0')}). Uma forma mais natural é: “${better.charAt(0).toUpperCase()}${better.slice(1)}”.`;
    }).filter(Boolean);
  }

  // ---------- verificação ----------
  /**
   * @param {string} answer   resposta do usuário
   * @param {string[]} targets [modelo, ...variantes aceitas]
   * @param {object} opts     { itemId } para variantes aprovadas pelo usuário
   */
  function check(answer, targets, opts = {}) {
    const raw = String(answer || '').trim();
    const model = targets[0];
    const result = (cls, extra = {}) => ({ cls, accepted: ACCEPTED.has(cls), model, answer: raw, notes: [], diff: null, ...extra });
    if (!raw) return result('empty');

    const A = { text: raw, ...prepare(raw) };
    const allTargets = [...targets, ...((opts.itemId && userVariants[opts.itemId]) || [])];
    const prepared = allTargets.map((t) => ({ text: t, ...prepare(t) }));
    const P0 = prepared[0];
    const natural = naturalnessNotes(A);

    // 1. exatamente o modelo (uma forma pouco natural, mas compreensível, é aceita com sugestão)
    if (same(A.base, P0.base)) return natural.length ? result('accepted_variant', { notes: natural }) : result('correct');
    // 2. grafia americana
    if (A.ame && same(A.bre, P0.bre)) return result('variant_ame', { notes: ['Grafia americana aceita. No inglês britânico: ' + P0.text, ...natural] });
    // 3. variantes (do item, sinônimos seguros, aprovadas pelo usuário); regras leves viram observação
    const soft = ruleHits(raw, model).filter((h) => h.soft).map((h) => h.msg);
    for (let i = 0; i < prepared.length; i++) {
      const P = prepared[i];
      if (same(A.full, P.full) || same(A.bre, P.bre)) {
        const fromUser = i >= targets.length;
        const note = i === 0 ? 'Variante equivalente aceita.' : fromUser ? 'Aceita por você anteriormente (variante pessoal).' : `Variante aceita: “${P.text}”.`;
        return result('accepted_variant', { notes: [note, ...(A.ame ? ['Grafia americana: no BrE use a forma britânica.'] : []), ...natural, ...soft] });
      }
    }

    // 4. alinhamento com o alvo mais parecido
    let best = null;
    for (const P of prepared) {
      const pairs = lcsAlign(A.full, P.full, spellEq);
      const score = pairs.length / Math.max(P.full.length, A.full.length, 1);
      if (!best || score > best.score) best = { P, pairs, score };
    }
    const { P, pairs } = best;
    const matchedA = new Set(pairs.map(([i]) => i));
    const matchedT = new Set(pairs.map(([, j]) => j));
    const extra = A.full.filter((_, i) => !matchedA.has(i));
    const missing = P.full.filter((_, j) => !matchedT.has(j));
    const typos = pairs.filter(([i, j]) => A.full[i] !== P.full[j] && !timeEq(A.full[i], P.full[j])).map(([i, j]) => [A.full[i], P.full[j]]);
    const view = buildDiff(A, P, pairs);
    const diff = {
      target: P.full.map((t, j) => ({ t, ok: matchedT.has(j) })),
      answer: A.full.map((t, i) => ({ t, ok: matchedA.has(i) })),
      missing, extra, typos,
      targetText: P.text, answerText: raw, targetSpans: view.targetSpans, answerSpans: view.answerSpans,
    };
    // diferenças descritas com as palavras ORIGINAIS (nunca tokens internos como “@5:30”)
    const listSpans = (X, spans, st) => {
      const out = [];
      let cur = null;
      spans.forEach((sp, k) => {
        if (sp.state === st) { if (cur && cur.end === k - 1) cur.end = k; else out.push(cur = { start: k, end: k }); }
      });
      return out.map((r) => `“${X.slice(spans[r.start].start, spans[r.end].end)}”`);
    };
    const missingSurf = listSpans(P.text, view.targetSpans, 'miss');
    const extraSurf = listSpans(raw, view.answerSpans, 'extra');
    const swapNotes = view.swaps.map((sw) => {
      const a = spanText(A, [...sw.a, ...sw.nextA]), b = spanText(P, [...sw.p, ...sw.nextP]);
      return `“${a}” também está correto aqui; o modelo usa “${b}”.`;
    });

    // 5. regras gramaticais reconhecidas (só quando a resposta tem relação com o modelo; senão é erro de sentido)
    const hits = ruleHits(raw, P.text);
    const hard = hits.filter((h) => !h.soft);
    const contentT0 = P.full.filter((t) => !stop.has(t) && !determiners.has(t));
    const related = !contentT0.length || P.full.some((t, j) => matchedT.has(j) && !stop.has(t) && !determiners.has(t));
    if (hard.length && related) {
      return result('grammar', { diff, notes: [...hard.map((h) => h.msg), ...natural], rules: hard.map((h) => h.id) });
    }
    const softNotes = [...hits.filter((h) => h.soft).map((h) => h.msg), ...natural];

    // 6a. “digitação” que é, na verdade, outra FORMA da palavra (gets × get, worked × work): gramática, não digitação
    // só verbos logo depois do sujeito (“I gets”, “she work”); plural de substantivo (oat × oats) segue tolerado
    const SUBJ = new Set(['i', 'you', 'we', 'they', 'he', 'she', 'it']);
    const formSwaps = pairs.filter(([i, j]) => A.full[i] !== P.full[j] && SUBJ.has(A.full[i - 1]) && SUBJ.has(P.full[j - 1])
      && ([...inflections(A.full[i])].includes(P.full[j]) || [...inflections(P.full[j])].includes(A.full[i]))).map(([i, j]) => [A.full[i], P.full[j]]);
    if (!missing.length && !extra.length && formSwaps.length && related) {
      return result('grammar', { diff, rules: ['E_FORM'], notes: [`Forma da palavra: ${formSwaps.map(([a, b]) => `você escreveu “${a}”, o modelo usa “${b}”`).join('; ')}.${formSwaps.some(([a, b]) => a === b + 's' || a === b + 'es') ? ' Com I/you/we/they o verbo no presente fica sem -s.' : ''}`, ...swapNotes, ...softNotes] });
    }
    // 6. só erros de digitação
    if (!missing.length && !extra.length && typos.length) {
      return result('spelling', { diff, notes: [`Pequeno erro de digitação: ${typos.map(([a, b]) => `“${a}” → “${b}”`).join(', ')}.`, ...swapNotes, ...softNotes] });
    }

    // 7. concordância (-s) e plural: palavra faltante = palavra extra + s/es/ies
    const agreement = missing.filter((m) => extra.some((x) => [...inflections(x)].includes(m) && m !== x && /s$/.test(m)));
    if (agreement.length && missing.length === agreement.length && extra.length === agreement.length) {
      return result('grammar', { diff, notes: [`Concordância: o modelo usa “${agreement.join('”, “')}”. Na 3ª pessoa (he/she/it, my wife, the laptop) o verbo leva -s.`, ...softNotes], rules: ['E_AGREEMENT'] });
    }

    // 8. diferenças só de determinantes (a/the/my…): troca = estilo (aceito); falta = gramática
    const missingContent = missing.filter((t) => !determiners.has(t));
    const extraContent = extra.filter((t) => !determiners.has(t));
    if (!missingContent.length && !extraContent.length) {
      // por posição: trocado no mesmo lugar (the ↔ my) = estilo; faltando sem nada no lugar = gramática
      if (missingSurf.length) return result('grammar', { diff, notes: [`Falta o artigo/determinante ${missingSurf.join(', ')}. Ex.: ${P.text}`, ...swapNotes, ...softNotes], rules: ['E_ARTICLE'] });
      if (view.swaps.length) return result('accepted_variant', { diff, notes: [`Aceito. ${swapNotes.join(' ')}`, ...softNotes] });
      return result('accepted_variant', { diff, notes: [`Aceito, com palavra a mais: ${extraSurf.join(', ')}.`, ...softNotes] });
    }

    // 9. cobertura de conteúdo
    const contentT = P.full.filter((t) => !stop.has(t) && !determiners.has(t));
    const contentFound = P.full.filter((t, j) => matchedT.has(j) && !stop.has(t) && !determiners.has(t));
    const coverage = contentT.length ? contentFound.length / contentT.length : (pairs.length / Math.max(P.full.length, 1));
    const overlap = pairs.length;

    if (overlap === 0 || coverage < 0.5) {
      return result('meaning', { diff, coverage, notes: [`A resposta não contém o essencial: ${missingSurf.slice(0, 4).join(', ') || 'conteúdo esperado'}.`, ...hard.map((h) => 'Além disso: ' + h.msg), ...softNotes] });
    }
    // Substituições pequenas: o motor não sabe se o sinônimo é válido → inconclusivo, com a diferença
    return result('inconclusive', {
      diff, coverage,
      notes: [`Diferença em relação ao modelo: ${missingSurf.length ? 'o modelo tem ' + missingSurf.join(', ') : ''}${missingSurf.length && extraSurf.length ? '; ' : ''}${extraSurf.length ? 'você usou ' + extraSurf.join(', ') : ''}. Se tiver certeza de que é equivalente, marque “Eu estava certo”.`, ...swapNotes, ...softNotes],
    });
  }

  /**
   * Cobertura de respostas longas (bloco, parágrafo, rotina, conversação).
   * keywords: grupos [["five","5"],["wake up"]]; items: [{id,en,match}]
   */
  function coverage(answer, { keywords = [], items = [] } = {}) {
    const plain = numbersToDigits(expandContractions(wordTokens(answer)));
    const tokens = numbersToDigits(canonTimes(expandContractions(wordTokens(answer))));
    const bre = applyAmE(tokens).tokens;
    const syn = applySynonyms(bre).tokens;
    const has = (raw) => {
      const phrase = numbersToDigits(expandContractions(wordTokens(raw))).join(' ');
      return [bre, plain, syn].some((t) => !!findPattern(phrase, t, { separable: true }))
        || !!findPattern(applySynonyms(wordTokens(phrase)).tokens.join(' '), syn, { separable: true });
    };
    const kw = keywords.map((group) => ({ group, ok: group.some((p) => has(String(p))) }));
    const it = items.map((x) => ({ id: x.id, en: x.en, ok: has((x.match || x.en).split(' / ')[0].replace(/…$/, '')) || (x.v || []).some((v) => has(v)) }));
    const all = [...kw.map((k) => k.ok), ...it.map((k) => k.ok)];
    const ratio = all.length ? all.filter(Boolean).length / all.length : 0;
    const hits = ruleHits(answer, '');
    return { keywords: kw, items: it, ratio, grammar: hits.map((h) => ({ id: h.id, msg: h.msg, soft: !!h.soft })), words: tokens.length };
  }

  /** Formas compreensíveis, mas pouco naturais, num texto livre (ex.: transcrição de uma resposta oral). */
  const naturalness = (text) => naturalnessNotes({ text, ...prepare(text) });

  return { check, coverage, prepare, naturalness, isAccepted: (cls) => ACCEPTED.has(cls) };
}

export { ACCEPTED };
