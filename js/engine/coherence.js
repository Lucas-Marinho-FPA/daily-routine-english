// Coerência semântica e contextual da transcrição de respostas orais (funções puras, sem DOM).
//
// Pergunta que este módulo responde: “este trecho do que o app ouviu faz sentido aqui, ou merece conferência?”.
// Ele NUNCA reescreve a transcrição: devolve suspeitas com os sinais que as sustentam e, quando há base, uma
// SUGESTÃO tirada do próprio conteúdo da atividade (identificada como sugestão, não como o que foi dito).
//
// Sinais observáveis usados (o reconhecedor não dá confiança por palavra; nenhuma probabilidade é inventada):
//   • moldura conhecida: o trecho repete uma expressão do conteúdo (“___ and tomato”, “my ___ app”, “set ___ to”)
//     com um encaixe diferente do esperado;
//   • som parecido: padrão aproximado de consoantes e vogais a partir da escrita (não é análise acústica);
//   • categoria incompatível: animal num prato (“kitten sandwich”), palavra funcional no lugar de um nome
//     (“a little and tomato”, “my over app”).
// Uma suspeita só existe com moldura + pelo menos um sinal. Alternativas da mesma categoria (ham × chicken,
// bus × car, school × office) nunca são marcadas: são respostas diferentes, não erros.
import { wordTokens, levenshtein } from './text.js';
import { lemma } from './lexicon.js';
import { segment, sameWordForm } from './wordfeedback.js';

const set = (s) => new Set(s.split(/\s+/).filter(Boolean));

// categorias semânticas pequenas e explícitas (heurística documentada; ampliar com exemplos reais)
export const CATEGORIES = {
  food: set(`breakfast lunch dinner supper meal snack food coffee tea juice milk water toast bread egg eggs cereal fruit fruits banana apple
    orange rice beans salad sandwich burger pasta pizza soup chicken meat fish beef pork ham turkey tuna salmon bacon sausage cheese butter
    vegetable vegetables lettuce tomato tomatoes onion onions carrot carrots potato potatoes chips fries crisps oats porridge yogurt yoghurt
    cake biscuit biscuits cookie cookies chocolate sugar honey jam pumpkin corn avocado mushroom mushrooms pepper spinach cucumber grape
    grapes lemon strawberry nuts wrap tortilla noodles steak lamb prawns shrimp mayo mayonnaise ketchup sauce`),
  animal: set('kitten kitty cat cats puppy dog dogs horse mouse mice rat donkey monkey snake frog spider insect bug bird parrot lion tiger rabbit'),
  transport: set('car bus train bike bicycle taxi cab uber subway metro tram motorbike motorcycle scooter van truck lift ride rides'),
  place: set('office home school gym bank street park kitchen cafeteria canteen work room house flat apartment church shop supermarket station garage'),
  device: set('app phone mobile laptop computer tablet email screen'),
  person: set('wife husband son daughter kids children child family mother mum mom father dad friend friends colleague colleagues boss teacher'),
  time: set('morning afternoon evening night noon midnight day days week weekend weekday weekdays today tonight'),
};
export const categoryOf = (t) => { const l = lemma(t); for (const [k, s] of Object.entries(CATEGORIES)) if (s.has(t) || s.has(l)) return k; return null; };

// palavras funcionais (artigos, possessivos, preposições, pronomes, auxiliares) e quantificadores
const FUNCTION = set(`a an the my your his her our their this that these those some any to of in on at for from by with into onto and or but
  so then also i you he she it we they me him us them is am are was were be been do does did have has had not up out off over under about
  around after before as if than very just`);
const QUANT = set('little bit lot lots few couple much many');
const DET = set('a an the my your his her our their this that some');
// preposições/advérbios que o reconhecedor costuma pôr no lugar de um nome (“my over app”); estruturais (to, at, in…) ficam de fora
const PREP_ADV = set('over under about after before up out off around through across');
export const isFunctionWord = (t) => FUNCTION.has(t) || QUANT.has(t);

// ---------- som parecido (aproximação pela escrita) ----------
/** Chave fonética grosseira: classes de som (V vogal, P oclusiva/africada, F fricativa, N nasal, L líquida, W semivogal). */
export function phoneKey(word) {
  let w = String(word).toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return { key: '', norm: '', syl: 0 };
  w = w.replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/^wh/, 'w').replace(/mb$/, 'm').replace(/gh/g, '');
  w = w.replace(/([^aeiouy])le$/, '$1el'); // little → littel (l silábico)
  w = w.replace(/tch/g, 'C').replace(/ch/g, 'C').replace(/sh/g, 'S').replace(/th/g, 'T').replace(/ph/g, 'f').replace(/ck/g, 'k')
    .replace(/qu/g, 'kw').replace(/x/g, 'ks').replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/g(?=[eiy])/g, 'j');
  if (w.length > 3 && /[^aeiouy]e$/.test(w) && /[aeiouy]/.test(w.slice(0, -2))) w = w.slice(0, -1); // e mudo final
  w = w.replace(/(.)\1+/g, '$1');
  let key = '';
  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const c = 'aeiou'.includes(ch) ? 'V' : ch === 'y' ? (i === 0 ? 'W' : 'V') : 'pbtdkgC'.includes(ch) ? 'P'
      : 'fvszSTjh'.includes(ch) ? 'F' : 'mn'.includes(ch) ? 'N' : 'lr'.includes(ch) ? 'L' : ch === 'w' ? 'W' : '';
    if (c && !(c === 'V' && key.endsWith('V'))) key += c;
  }
  return { key, norm: w, syl: (key.match(/V/g) || []).length };
}

/**
 * Soam parecido? Critério ESTRITO (é só um dos sinais de suspeita):
 *   • final comum longo (destination × station), ou
 *   • mesmo número de sílabas, padrão de sons igual com no máximo 1 troca, e mesma letra inicial ou mesmo final
 *     (kitten × chicken, over × Uber, a little × lettuce).
 * Artigos no começo são ignorados (“a little” → “little”).
 */
export function soundsAlike(a, b) {
  const strip = (s) => wordTokens(s).filter((t) => !DET.has(t)).join('');
  const x = strip(a), y = strip(b);
  if (!x || !y || x === y) return false;
  let suf = 0;
  while (suf < Math.min(x.length, y.length) && x[x.length - 1 - suf] === y[y.length - 1 - suf]) suf++;
  if (suf >= 4 && Math.min(x.length, y.length) >= 5) return true;
  const px = phoneKey(x), py = phoneKey(y);
  if (px.key.length < 4 || py.key.length < 4 || px.key.length !== py.key.length || px.syl !== py.syl) return false;
  if (levenshtein(px.key, py.key) > 1) return false;
  return px.norm[0] === py.norm[0] || px.norm.slice(-2) === py.norm.slice(-2);
}

// ---------- molduras do conteúdo ----------
const prepCache = new WeakMap();
/** Referências tokenizadas (frases das rotinas, respostas-modelo, exemplos), preparadas uma vez por conteúdo. */
export function frameRefs(content) {
  if (prepCache.has(content)) return prepCache.get(content);
  const refs = [];
  const add = (text, au) => { const r = prepRef(text, au); if (r && r.toks.length >= 3) refs.push(r); };
  for (const s of Object.values(content.sentences || {})) add(s.en, s.au);
  for (const q of Object.values(content.questions || {})) { add(q.a, q.aau); (q.altAnswers || []).forEach((a) => add(a)); }
  for (const it of Object.values(content.items || {})) { add(it.en); (it.ex || []).forEach((x) => add(x.en, x.au)); }
  prepCache.set(content, refs);
  return refs;
}

/** Referência preparada: palavras pelos mesmos segmentos da transcrição (texto original preservado para exibir). */
export function prepRef(text, au = null) {
  if (!text) return null;
  const segs = segment(text).filter((s) => s.w !== undefined && s.norm);
  const toks = segs.map((s) => s.norm);
  return { text, au, toks, lems: toks.map(lemma), surf: segs.map((s) => s.text.replace(/[.,!?;:]+$/, '')) };
}

const tokEq = (a, al, b, bl) => a === b || (a.length > 2 && b.length > 2 && al === bl) || (DET.has(a) && DET.has(b));

/** Por que o encaixe ouvido não combina com o esperado (ou null). */
export function categoryClash(heardToks, expected, { foodFrame = false, headAnchored = false, nounSlot = false, sound = false } = {}) {
  const content = heardToks.filter((t) => !isFunctionWord(t));
  const ce = categoryOf(expected);
  // quantificador ou preposição no lugar de um NOME (“a little” por “lettuce”, “over” por “Uber”), com o núcleo ancorado
  // e mais um indício (quantificador, ou som parecido): sozinho, “up” × “put” ou “few” × “quick” não diz nada
  if (!content.length && nounSlot && headAnchored && heardToks.some((t) => QUANT.has(t) || PREP_ADV.has(t))
    && (sound || heardToks.some((t) => QUANT.has(t)))) return 'function';
  // não alimento num trecho que fala de comida (a âncora é um alimento: “___ sandwich”)
  if (ce === 'food' && foodFrame && content.some((t) => ['animal', 'transport', 'device', 'place', 'person'].includes(categoryOf(t)))) return 'not-food';
  return null;
}

/**
 * Trechos que repetem uma moldura do conteúdo com um encaixe suspeito.
 * @param transcript texto reconhecido (inalterado)
 * @param refs       frameRefs(content) — e opcionalmente a resposta-modelo como primeira referência
 * @returns Array<{ src:number[], heard, expected, context, ref:{text,au}, signals:string[], clash, strength:'likely'|'possible' }>
 */
export function findSlotSuspicions(transcript, refs = []) {
  const segs = segment(String(transcript || '')).filter((s) => s.w !== undefined && s.norm);
  if (segs.length < 3) return [];
  const T = segs.map((s) => s.norm), TL = T.map(lemma);
  const tLemmas = new Set(TL);
  const found = new Map(); // primeira palavra do trecho → melhor suspeita
  for (const ref of refs) {
    const R = ref.toks, RL = ref.lems;
    for (let j = 0; j < R.length; j++) {
      const e = R[j];
      if (isFunctionWord(e) || e.length < 3 || /\d/.test(e)) continue;
      if (tLemmas.has(RL[j])) continue; // a palavra esperada foi dita em algum lugar: não é suspeita
      const slots = [[j, j]];
      if (j > 0 && DET.has(R[j - 1])) slots.push([j - 1, j]);
      for (const [a, b] of slots) {
        for (let i = 0; i < T.length; i++) {
          for (const k of [1, 2]) {
            if (i + k > T.length) continue;
            // âncoras contíguas dos dois lados (até 2 palavras), comparando forma, lema ou determinante
            let left = 0, right = 0, contentAnchor = false, foodFrame = false;
            const anchor = (r) => { if (!isFunctionWord(r)) contentAnchor = true; if (categoryOf(r) === 'food') foodFrame = true; };
            while (left < 2 && i - 1 - left >= 0 && a - 1 - left >= 0 && tokEq(T[i - 1 - left], TL[i - 1 - left], R[a - 1 - left], RL[a - 1 - left])) { anchor(R[a - 1 - left]); left++; }
            while (right < 2 && i + k + right < T.length && b + 1 + right < R.length && tokEq(T[i + k + right], TL[i + k + right], R[b + 1 + right], RL[b + 1 + right])) { anchor(R[b + 1 + right]); right++; }
            if (left + right < 2 || !contentAnchor) continue;
            const H = T.slice(i, i + k), HS = segs.slice(i, i + k);
            if (H.join('') === R.slice(a, b + 1).join('')) continue; // composto: lunchbox × lunch box
            if (HS.some((s) => s.proper)) continue; // nome próprio desconhecido: o app não adivinha
            const Hc = H.filter((t) => !isFunctionWord(t));
            if (Hc.some((t) => lemma(t) === RL[j] || sameWordForm(e, t) || sameWordForm(t, e))) continue; // grafia BrE/AmE, número etc.
            const ce = categoryOf(e);
            if (ce && Hc.some((t) => categoryOf(t) === ce)) continue; // alternativa da mesma categoria: resposta diferente, não erro
            const alike = soundsAlike(H.join(' '), R.slice(a, b + 1).join(' ')) || (Hc.length > 0 && soundsAlike(Hc.join(' '), e));
            // nome: palavra de uma categoria conhecida ou nome próprio no texto de referência (“Uber”)
            const nounSlot = !!ce || /^[A-Z]/.test(ref.surf[j] || '') && j > 0;
            const clash = categoryClash(H, e, { foodFrame, headAnchored: right > 0, nounSlot, sound: alike });
            // som parecido sozinho exige âncoras dos dois lados (moldura completa)
            const sound = alike && (left > 0 && right > 0 || !!clash);
            if (!clash && !sound) continue;
            const signals = [sound && 'sound', clash && 'category'].filter(Boolean);
            const cand = {
              src: HS.map((s) => s.w), heard: HS.map((s) => s.text.replace(/[.,!?;:]+$/, '')).join(' '),
              expected: ref.surf.slice(a, b + 1).join(' '),
              context: [ref.surf.slice(Math.max(0, a - left), a).join(' '), '___', ref.surf.slice(b + 1, b + 1 + Math.max(right, 1)).join(' ')].filter(Boolean).join(' '),
              ref: { text: ref.text, au: ref.au }, signals, clash, strength: signals.length >= 2 ? 'likely' : 'possible', anchors: left + right,
            };
            const prev = found.get(i);
            const better = !prev || cand.signals.length > prev.signals.length || (cand.signals.length === prev.signals.length && (cand.anchors > prev.anchors || (cand.anchors === prev.anchors && cand.src.length < prev.src.length)));
            if (better) found.set(i, cand);
          }
        }
      }
    }
  }
  // sobreposições: fica a suspeita mais sustentada; no empate, o trecho mais preciso (menor)
  const list = [...found.values()].sort((x, y) => y.signals.length - x.signals.length || y.anchors - x.anchors || x.src.length - y.src.length);
  const used = new Set();
  const out = [];
  for (const c of list) {
    if (c.src.some((w) => used.has(w))) continue;
    c.src.forEach((w) => used.add(w));
    const { anchors, ...rest } = c;
    out.push(rest);
  }
  return out.sort((x, y) => x.src[0] - y.src[0]);
}

// ---------- combinações estranhas sem referência ----------
/**
 * Mesmo sem uma frase do conteúdo para comparar: animal/objeto modificando um prato (“kitten pizza”) e quantificador
 * coordenado com um alimento (“a little and tomato”). Sem sugestão: só pedem conferência.
 */
export function findOddCombinations(transcript) {
  const segs = segment(String(transcript || '')).filter((s) => s.w !== undefined && s.norm);
  const out = [];
  for (let i = 0; i + 1 < segs.length; i++) {
    const m = segs[i].norm, hd = segs[i + 1].norm;
    if (categoryOf(hd) === 'food' && ['animal', 'device', 'transport'].includes(categoryOf(m)) && !segs[i].proper) {
      out.push({ src: [segs[i].w], heard: `${segs[i].text} ${segs[i + 1].text}`.replace(/[.,!?;:]+$/, ''), kind: 'modifier', clash: 'not-food' });
    }
    if (i + 3 < segs.length + 1 && m === 'a' && QUANT.has(hd) && segs[i + 2] && segs[i + 2].norm === 'and' && segs[i + 3] && categoryOf(segs[i + 3].norm) === 'food') {
      out.push({ src: [segs[i].w, segs[i + 1].w], heard: `${segs[i].text} ${segs[i + 1].text}`, kind: 'coordination', clash: 'function' });
    }
  }
  return out;
}

// ---------- lacunas (possível palavra perdida pelo reconhecimento) ----------
const NEEDS_COMPLEMENT = set('a an the my your at to for with of from about');
const ARTICLE_LIKE = set('a an the my your');
const CONJ_PREP = set('and or but at in on to for with of from');
/** Palavra que exige complemento seguida de outra que não pode ser o complemento (“at in the morning”, “a and”). */
export function findHoles(transcript) {
  const all = segment(String(transcript || ''));
  const segs = all.filter((s) => s.w !== undefined && s.norm);
  const out = [];
  segs.forEach((s, i) => {
    if (!NEEDS_COMPLEMENT.has(s.norm)) return;
    const next = segs[i + 1];
    // palavra ligada por hífen ao que vem depois (“an on-site day”): é uma palavra só, não lacuna
    const sep = next ? all.slice(all.indexOf(s) + 1, all.indexOf(next)).map((x) => x.text).join('') : '';
    if (next && /-/.test(sep)) return;
    const afterNext = segs[i + 2] && all.slice(all.indexOf(next) + 1, all.indexOf(segs[i + 2])).map((x) => x.text).join('');
    if (next && afterNext && /^-$/.test(afterNext.trim())) return;
    const endsSentence = /[.!?]$/.test(s.text) || !next;
    // artigo/possessivo precisa de um nome: não pode vir seguido de outro artigo, preposição ou conjunção (“a and”);
    // preposição pode vir seguida de artigo (“at the office”), mas não de outra preposição/conjunção (“at in the morning”)
    // preposições coordenadas (“to or from”, “in and out”) são legítimas
    const coordinated = next && ['and', 'or'].includes(next.norm) && segs[i + 2] && CONJ_PREP.has(segs[i + 2].norm) && !['and', 'or', 'but'].includes(segs[i + 2].norm);
    const bad = next && !coordinated && (ARTICLE_LIKE.has(s.norm) ? (ARTICLE_LIKE.has(next.norm) || CONJ_PREP.has(next.norm)) : CONJ_PREP.has(next.norm));
    if (endsSentence || bad) {
      out.push({ src: [s.w], after: s.text.replace(/[.,!?;:]+$/, ''), before: next ? next.text : '' });
    }
  });
  return out;
}

// ---------- contradições ----------
const ACTIVITY_TIME = /\b(wake up|get up|leave home|leave the house|start work|finish work|have breakfast|have lunch|have dinner|go to bed|go to the gym|arrive)\b[^.!?]{0,30}?\bat (\d{1,2}(?::\d\d)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/g;
const CONTRAST = /\b(weekend|weekends|weekday|weekdays|saturday|sunday|saturdays|sundays|sometimes|some days|other days|on \w+days|when|if|but|except|holiday|holidays|today|yesterday|tomorrow)\b/;
/**
 * Informações conflitantes no próprio relato: a mesma atividade com dois horários sem marca de contraste,
 * ou “p.m.” com “in the morning” (e “a.m.” com “in the evening”). Não decide qual está certa.
 */
export function findContradictions(transcript) {
  const text = String(transcript || '').toLowerCase().replace(/(\d)\s?([ap])\.?\s?m\.?/g, '$1$2m');
  const out = [];
  const seen = new Map();
  for (const m of text.matchAll(ACTIVITY_TIME)) {
    const act = m[1], t = m[2];
    if (seen.has(act) && seen.get(act).t !== t) {
      const between = text.slice(seen.get(act).end, m.index + m[0].length);
      if (!CONTRAST.test(between)) out.push({ kind: 'two-times', activity: act, times: [seen.get(act).t, t] });
    }
    seen.set(act, { t, end: m.index });
  }
  for (const m of text.matchAll(/\b(\d{1,2}(?::\d\d)?)(pm)\b[^.!?]{0,20}\bin the morning\b|\b(\d{1,2}(?::\d\d)?)(am)\b[^.!?]{0,20}\b(in the evening|at night|in the afternoon)\b/g)) {
    out.push({ kind: 'period', times: [m[1] ? m[1] + ' p.m.' : m[3] + ' a.m.'], period: m[1] ? 'in the morning' : m[5] });
  }
  return out;
}
