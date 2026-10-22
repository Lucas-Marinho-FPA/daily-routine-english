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
import { basicNormalise, wordTokens, levenshtein, lcsAlign, findPattern, inflections } from './text.js';

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

  // ---------- normalização em tokens ----------
  function expandContractions(tokens) {
    const out = [];
    for (const t of tokens) {
      if (contractions[t]) out.push(...contractions[t].split(' '));
      else if (/^\w+'s$/.test(t)) out.push(t.replace(/'s$/, ''), "'s");
      else out.push(t);
    }
    return out.filter((t) => t !== "'s");
  }

  // Horas → token canônico "@H:MM" ou "@H:MMam/pm"
  function canonTimes(tokens) {
    const out = [];
    const num = (t) => (/^\d{1,2}$/.test(t) ? Number(t) : numberWords[t]);
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      let h = null, m = 0, consumed = 0;
      let match;
      if ((match = /^(\d{1,2}):(\d{2})$/.exec(t))) { h = +match[1]; m = +match[2]; consumed = 1; }
      else if ((match = /^(\d{1,2})h(\d{2})?$/.exec(t))) { h = +match[1]; m = match[2] ? +match[2] : 0; consumed = 1; }
      else if ((match = /^(\d{1,2})(am|pm)$/.exec(t))) { h = +match[1]; consumed = 1; tokens.splice(i + 1, 0, match[2]); }
      else if (t === 'midnight') { out.push('@12:00am'); continue; }
      else if (t === 'noon' || t === 'midday') { out.push('@12:00pm'); continue; }
      else if (t === 'half' && tokens[i + 1] === 'past' && num(tokens[i + 2]) <= 12) { h = num(tokens[i + 2]); m = 30; consumed = 3; }
      else if (t === 'quarter' && tokens[i + 1] === 'past' && num(tokens[i + 2]) <= 12) { h = num(tokens[i + 2]); m = 15; consumed = 3; if (out[out.length - 1] === 'a') out.pop(); }
      else if (t === 'quarter' && tokens[i + 1] === 'to' && num(tokens[i + 2]) <= 12) { h = num(tokens[i + 2]) - 1 || 12; m = 45; consumed = 3; if (out[out.length - 1] === 'a') out.pop(); }
      else if (num(t) !== undefined && num(t) >= 1 && num(t) <= 12) {
        const next = tokens[i + 1];
        const nextNum = numberWords[next];
        const isTimeContext = ['am', 'pm', "o'clock", 'oclock', 'sharp'].includes(next) || TIME_PREP.has(tokens[i - 1]) ||
          (tokens[i + 1] === 'in' && tokens[i + 2] === 'the' && ['morning', 'afternoon', 'evening'].includes(tokens[i + 3]));
        if (isTimeContext) {
          h = num(t); consumed = 1;
          if (nextNum !== undefined && nextNum >= 10 && nextNum < 60 && nextNum !== 12) { m = nextNum; consumed = 2; } // "five forty-five"
        }
      }
      if (h === null) { out.push(t); continue; }
      i += consumed - 1;
      let mer = '';
      if (tokens[i + 1] === "o'clock" || tokens[i + 1] === 'oclock') { i++; }
      if (tokens[i + 1] === 'am' || tokens[i + 1] === 'pm') { mer = tokens[i + 1]; i++; }
      else if (tokens[i + 1] === 'in' && tokens[i + 2] === 'the' && tokens[i + 3] === 'morning') { mer = 'am'; i += 3; }
      else if (tokens[i + 1] === 'in' && tokens[i + 2] === 'the' && ['afternoon', 'evening'].includes(tokens[i + 3])) { mer = 'pm'; i += 3; }
      else if (tokens[i + 1] === 'at' && tokens[i + 2] === 'night') { mer = 'pm'; i += 2; }
      if (h > 12 && h < 24) { h -= 12; mer = 'pm'; }
      out.push(`@${h}:${String(m).padStart(2, '0')}${mer}`);
    }
    return out;
  }

  function numbersToDigits(tokens) {
    return tokens.map((t) => (numberWords[t] !== undefined && !/^@/.test(t) ? String(numberWords[t]) : t));
  }

  function applyAmE(tokens) {
    let changed = false;
    const out = tokens.map((t, i) => {
      if (ame[t]) { changed = true; return ame[t]; }
      if (t === 'practice' && PRACTICE_SUBJ.has(tokens[i - 1])) { changed = true; return 'practise'; }
      if (t === 'practices' && ['my', 'wife', 'he', 'she', 'son'].includes(tokens[i - 1])) { changed = true; return 'practises'; }
      return t;
    });
    return { tokens: out, changed };
  }

  function applySynonyms(tokens) {
    let changed = false;
    let out = tokens.slice();
    for (const group of synonymGroups) {
      const canon = group[0];
      for (const alt of group.slice(1)) {
        for (let i = 0; i + alt.length <= out.length; i++) {
          if (alt.every((t, k) => out[i + k] === t)) {
            out = [...out.slice(0, i), ...canon, ...out.slice(i + alt.length)];
            changed = true;
          }
        }
      }
    }
    return { tokens: out, changed };
  }

  function prepare(text) {
    const base = numbersToDigits(canonTimes(expandContractions(wordTokens(text))));
    const a = applyAmE(base);
    const s = applySynonyms(a.tokens);
    return { base, bre: a.tokens, full: s.tokens, ame: a.changed, syn: s.changed };
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

    const A = prepare(raw);
    const allTargets = [...targets, ...((opts.itemId && userVariants[opts.itemId]) || [])];
    const prepared = allTargets.map((t) => ({ text: t, ...prepare(t) }));
    const P0 = prepared[0];

    // 1. exatamente o modelo
    if (same(A.base, P0.base)) return result('correct');
    // 2. grafia americana
    if (A.ame && same(A.bre, P0.bre)) return result('variant_ame', { notes: ['Grafia americana aceita. No inglês britânico: ' + P0.text] });
    // 3. variantes (do item, sinônimos seguros, aprovadas pelo usuário); regras leves viram observação
    const soft = ruleHits(raw, model).filter((h) => h.soft).map((h) => h.msg);
    for (let i = 0; i < prepared.length; i++) {
      const P = prepared[i];
      if (same(A.full, P.full) || same(A.bre, P.bre)) {
        const fromUser = i >= targets.length;
        const note = i === 0 ? 'Variante equivalente aceita.' : fromUser ? 'Aceita por você anteriormente (variante pessoal).' : `Variante aceita: “${P.text}”.`;
        return result('accepted_variant', { notes: [note, ...(A.ame ? ['Grafia americana: no BrE use a forma britânica.'] : []), ...soft] });
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
    const diff = {
      target: P.full.map((t, j) => ({ t, ok: matchedT.has(j) })),
      answer: A.full.map((t, i) => ({ t, ok: matchedA.has(i) })),
      missing, extra, typos,
    };

    // 5. regras gramaticais reconhecidas (só quando a resposta tem relação com o modelo; senão é erro de sentido)
    const hits = ruleHits(raw, P.text);
    const hard = hits.filter((h) => !h.soft);
    const contentT0 = P.full.filter((t) => !stop.has(t) && !determiners.has(t));
    const related = !contentT0.length || P.full.some((t, j) => matchedT.has(j) && !stop.has(t) && !determiners.has(t));
    if (hard.length && related) {
      return result('grammar', { diff, notes: hard.map((h) => h.msg), rules: hard.map((h) => h.id) });
    }
    const softNotes = hits.filter((h) => h.soft).map((h) => h.msg);

    // 6. só erros de digitação
    if (!missing.length && !extra.length && typos.length) {
      return result('spelling', { diff, notes: [`Pequeno erro de digitação: ${typos.map(([a, b]) => `“${a}” → “${b}”`).join(', ')}.`, ...softNotes] });
    }

    // 7. concordância (-s) e plural: palavra faltante = palavra extra + s/es/ies
    const agreement = missing.filter((m) => extra.some((x) => [...inflections(x)].includes(m) && m !== x && /s$/.test(m)));
    if (agreement.length && missing.length === agreement.length && extra.length === agreement.length) {
      return result('grammar', { diff, notes: [`Concordância: o modelo usa “${agreement.join('”, “')}”. Na 3ª pessoa (he/she/it, my wife, the laptop) o verbo leva -s.`, ...softNotes], rules: ['E_AGREEMENT'] });
    }

    // 8. diferenças só de determinantes (a/the/my…)
    const missingContent = missing.filter((t) => !determiners.has(t));
    const extraContent = extra.filter((t) => !determiners.has(t));
    if (!missingContent.length && !extraContent.length) {
      const swapped = missing.length && extra.length;
      if (swapped) return result('accepted_variant', { diff, notes: [`Aceito. O modelo usa “${missing.join(' ')}” em vez de “${extra.join(' ')}”.`, ...softNotes] });
      if (missing.length) return result('grammar', { diff, notes: [`Falta o artigo/determinante “${missing.join(' ')}”. Ex.: ${P.text}`, ...softNotes], rules: ['E_ARTICLE'] });
      return result('accepted_variant', { diff, notes: [`Aceito, com palavra a mais: “${extra.join(' ')}”.`, ...softNotes] });
    }

    // 9. cobertura de conteúdo
    const contentT = P.full.filter((t) => !stop.has(t) && !determiners.has(t));
    const contentFound = P.full.filter((t, j) => matchedT.has(j) && !stop.has(t) && !determiners.has(t));
    const coverage = contentT.length ? contentFound.length / contentT.length : (pairs.length / Math.max(P.full.length, 1));
    const overlap = pairs.length;

    if (overlap === 0 || coverage < 0.5) {
      return result('meaning', { diff, coverage, notes: [`A resposta não contém o essencial: ${missingContent.slice(0, 4).map((t) => `“${t}”`).join(', ') || 'conteúdo esperado'}.`, ...hard.map((h) => 'Além disso: ' + h.msg), ...softNotes] });
    }
    // Substituições pequenas: o motor não sabe se o sinônimo é válido → inconclusivo, com a diferença
    return result('inconclusive', {
      diff, coverage,
      notes: [`Diferença em relação ao modelo: ${missingContent.length ? 'faltou ' + missingContent.map((t) => `“${t}”`).join(', ') : ''}${missingContent.length && extraContent.length ? '; ' : ''}${extraContent.length ? 'você usou ' + extraContent.map((t) => `“${t}”`).join(', ') : ''}. Se tiver certeza de que é equivalente, marque “Eu estava certo”.`, ...softNotes],
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

  return { check, coverage, prepare, isAccepted: (cls) => ACCEPTED.has(cls) };
}

export { ACCEPTED };
