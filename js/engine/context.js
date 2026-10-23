// Camada contextual entre a transcrição bruta e o feedback (funções puras, sem DOM).
//
// Ideia: quando um trecho da transcrição reproduz claramente uma frase conhecida do conteúdo (a rotina do
// próprio aluno), uma lacuna CURTA dentro desse trecho, ancorada dos dois lados, em que a transcrição diz
// outra coisa é uma SUSPEITA de erro do reconhecedor. Ex.: “set [this nation] to the office” × “set
// [my destination] to my office”.
// Regras (conservadoras, explícitas e testáveis):
//   • a transcrição NUNCA é alterada: devolvemos hipóteses, não correções;
//   • o trecho precisa casar com a frase de referência: ≥ 3 palavras de conteúdo em ordem, um par de palavras
//     de conteúdo vizinhas, e ≥ 60% das palavras de conteúdo da frase naquela região;
//   • só lacunas de até 3 palavras de cada lado, com palavra de conteúdo esperada que não aparece em
//     nenhum lugar da resposta;
//   • não são suspeitas: troca de artigo/possessivo (the ↔ my), formas equivalentes (horas, números,
//     contrações, grafias BrE/AmE, sinônimos do app), palavras a mais ou a menos, compostos (lunch box).
// O modelo não fornece confiança por palavra, então nenhuma probabilidade é inventada.
import { wordTokens, lcsAlign, levenshtein } from './text.js';
import { lemma } from './lexicon.js';

const SUBJ = new Set(['i', 'we', 'you', 'he', 'she', 'they', 'it']);
const CONNECT = new Set(['and', 'then', 'so', 'but', 'also']);
const FUNCTION = new Set(('a an the my your his her our their this that these those some any to of in on at for from by with into ' +
  'and or but so then also i you he she it we they me him us them is am are was were be been do does did have has had not ' +
  'up out off over about around after before').split(' '));

// Colocações comuns verbo + objeto no domínio da rotina (forma-base). Um verbo FORA da lista para um objeto
// listado é um sinal de transcrição suspeita (“sit on my Uber app”); um verbo DENTRO dela é uma alternativa
// legítima (“check my Uber app”) e nunca é marcado.
const OBJ_VERBS = {
  app: 'open check use close download install update start launch turn switch log tap look',
  phone: 'check use pick charge turn switch look call take unlock grab put answer',
  laptop: 'open switch turn start use close shut log boot charge check put',
  computer: 'switch turn start use shut log boot check put',
  car: 'drive park get take start wash use leave',
  shower: 'take have need',
  teeth: 'brush clean wash',
  breakfast: 'have eat make prepare cook skip grab take bring heat buy',
  lunch: 'have eat make prepare cook skip grab take bring heat buy',
  dinner: 'have eat make prepare cook skip grab take bring heat buy',
  destination: 'set enter choose type put select change',
  coffee: 'drink have make take grab buy',
  bus: 'take catch get ride miss wait',
  train: 'take catch get ride miss wait',
  email: 'check read answer send write reply',
  rides: 'accept take give do offer get',
  chess: 'play watch learn',
};
const VERB_LIKE = new Set(('sit stand lie put open check use close take have get set drive park brush eat make go do watch play listen read ' +
  'write send start switch turn shut log pick call accept leave arrive see look buy cook wash clean run walk').split(' '));
for (const k of Object.keys(OBJ_VERBS)) OBJ_VERBS[k] = new Set(OBJ_VERBS[k].split(' '));

/** Parecem soar parecido? (mesmo final ≥ 4 letras, ou esqueletos de consoantes próximos) — critério grosseiro, só para suspeita. */
export function soundsLike(a, b) {
  const norm = (x) => x.toLowerCase().replace(/[^a-z]/g, '').replace(/th/g, 't').replace(/ph/g, 'f').replace(/c(?=[aou])/g, 'k').replace(/ck/g, 'k');
  const x = norm(a), y = norm(b);
  if (!x || !y || x === y) return false;
  let suf = 0;
  while (suf < Math.min(x.length, y.length) && x[x.length - 1 - suf] === y[y.length - 1 - suf]) suf++;
  if (suf >= 4) return true;
  const sk = (z) => z.replace(/(?!^)[aeiouy]/g, '').replace(/(.)\1+/g, '$1');
  const sx = sk(x), sy = sk(y);
  return Math.max(sx.length, sy.length) >= 3 && levenshtein(sx, sy) / Math.max(sx.length, sy.length) <= 0.34;
}

/** Verbo da lacuna incompatível com o objeto logo depois (“sit … app”)? */
function verbObjectClash(tw, rightWords) {
  if (!rightWords.length || FUNCTION.has(rightWords[0]) && !['my', 'the', 'your', 'a'].includes(rightWords[0])) return false; // o objeto precisa vir logo depois
  const obj = rightWords.map((w) => lemma(w)).find((w) => OBJ_VERBS[w] || OBJ_VERBS[w + 's']);
  if (!obj) return false;
  const ok = OBJ_VERBS[obj] || OBJ_VERBS[obj + 's'];
  const verbs = tw.map((w) => lemma(w)).filter((w) => VERB_LIKE.has(w));
  return verbs.length > 0 && verbs.every((v) => !ok.has(v));
}

const poolCache = new WeakMap();

/** Frases de referência do conteúdo (preparadas uma vez): frases das rotinas, respostas e exemplos. */
export function contextPool(content, checker) {
  let byChecker = poolCache.get(content);
  if (!byChecker) poolCache.set(content, (byChecker = new WeakMap()));
  if (byChecker.has(checker)) return byChecker.get(checker);
  const refs = [];
  const add = (text, au) => { if (text && wordTokens(text).length >= 4) refs.push({ text, au: au || null, prep: checker.prepare(text) }); };
  for (const s of Object.values(content.sentences || {})) add(s.en, s.au);
  for (const q of Object.values(content.questions || {})) { add(q.a, q.aau); (q.altAnswers || []).forEach((a, i) => add(a, (q.altAu || [])[i])); }
  for (const it of Object.values(content.items || {})) (it.ex || []).forEach((x) => add(x.en, x.au));
  for (const r of refs) r.content = new Set(r.prep.full.filter((t) => !FUNCTION.has(t)));
  byChecker.set(checker, refs);
  return refs;
}

const isContent = (t) => !FUNCTION.has(t);
const surface = (X, srcs) => {
  if (!srcs.length) return '';
  const a = Math.min(...srcs), b = Math.max(...srcs);
  return X.text.slice(X.prep.spans[a].start, X.prep.spans[b].end);
};
const srcOf = (toks) => [...new Set(toks.flatMap((o) => o.src))].sort((a, b) => a - b);
// há pontuação no texto original logo antes do trecho de índice k?
const punctBefore = (X, k) => {
  const sp = X.prep.spans;
  const from = k > 0 ? sp[k - 1].end : 0;
  return /[.,;:!?]/.test(X.text.slice(from, sp[k] ? sp[k].start : X.text.length));
};

/** Tokens da cláusula antes de `idx` (até pontuação, conector ou limite), sem sujeito/conector iniciais. */
function clauseBefore(X, idx, max) {
  const toks = X.prep.fullS;
  const out = [];
  for (let i = idx - 1; i >= 0 && out.length < max + 2; i--) {
    out.unshift(toks[i]);
    const first = Math.min(...toks[i].src);
    if (punctBefore(X, first) || CONNECT.has(toks[i].t) || i === 0) break;
  }
  while (out.length && (SUBJ.has(out[0].t) || CONNECT.has(out[0].t))) out.shift();
  return out.length <= max ? out : null;
}

/** Agrupa pares alinhados em blocos densos (lacunas pequenas dos dois lados) e devolve o de mais conteúdo. */
function bestCluster(pairs, Tt, Rt) {
  let best = null, cur = [];
  const flush = () => {
    if (!cur.length) return;
    const contentN = cur.filter(([, j]) => isContent(Rt[j])).length;
    if (!best || contentN > best.contentN) best = { pairs: cur, contentN };
    cur = [];
  };
  for (const p of pairs) {
    const last = cur[cur.length - 1];
    if (last && (p[0] - last[0] > 5 || p[1] - last[1] > 5)) flush();
    cur.push(p);
  }
  flush();
  return best;
}

/**
 * @param transcript  texto reconhecido (inalterado)
 * @param opts.checker corretor do app (createChecker) — a mesma normalização das respostas escritas
 * @param opts.pool    contextPool(content, checker)
 * @param opts.model   resposta-exemplo do exercício (entra como referência prioritária)
 * @returns Array<{ src: number[] (índices de palavras da transcrição), heard, expected, context, ref: {text, au} }>
 */
export function findDivergences(transcript, { checker, pool = [], model = '' } = {}) {
  const text = String(transcript || '');
  if (!checker || !text.trim()) return [];
  const T = { text, prep: checker.prepare(text) };
  const Tt = T.prep.full;
  if (Tt.length < 4) return [];
  const tContent = new Set(Tt.filter(isContent));
  const refs = [...(model ? [{ text: model, au: null, prep: checker.prepare(model) }] : []), ...pool];
  // iguais, mesma hora, ou mesma forma-base (walked × walk: flexão regular não é erro de reconhecimento)
  const eq = (a, b) => a === b || (a[0] === '@' && b[0] === '@' && a.replace(/(am|pm)$/, '') === b.replace(/(am|pm)$/, ''))
    || (a.length > 3 && b.length > 3 && lemma(a) === lemma(b));
  const out = [];
  const explained = new Set(); // palavras da transcrição que alguma referência alinha sem divergência
  const taken = new Set(); // cada palavra da transcrição recebe no máximo uma hipótese
  for (const ref of refs) {
    const rContent = ref.content || new Set(ref.prep.full.filter(isContent));
    let shared = 0;
    for (const t of rContent) if (tContent.has(t)) shared++;
    if (shared < 3) continue;
    const R = { text: ref.text, prep: ref.prep };
    const Rt = R.prep.full;
    const cl = bestCluster(lcsAlign(Tt, Rt, eq), Tt, Rt);
    if (!cl || cl.contentN < 3) continue;
    const ps = cl.pairs;
    // par de palavras de conteúdo vizinhas nos dois textos (evita casamentos espalhados)
    if (!ps.some(([i, j], k) => k > 0 && ps[k - 1][0] === i - 1 && ps[k - 1][1] === j - 1 && isContent(Rt[j]) && isContent(Rt[j - 1]))) continue;
    const j0 = ps[0][1], j1 = ps[ps.length - 1][1];
    const regionContent = Rt.slice(j0, j1 + 1).filter(isContent).length;
    if (cl.contentN / Math.max(1, regionContent) < 0.6) continue;

    for (const [i] of ps) explained.add(i);
    const blocks = [];
    for (let k = 1; k < ps.length; k++) {
      const [ia, ja] = ps[k - 1], [ib, jb] = ps[k];
      blocks.push({ tG: T.prep.fullS.slice(ia + 1, ib), rG: R.prep.fullS.slice(ja + 1, jb), left: ps[k - 1], right: ps[k] });
    }
    // lacuna à esquerda da primeira âncora, dentro da mesma cláusula (“I [sit on my] Uber app” × “[open the] Uber app”)
    const tL = clauseBefore(T, ps[0][0], 4), rL = clauseBefore(R, ps[0][1], 3);
    if (tL && rL) blocks.push({ tG: tL, rG: rL, left: null, right: ps[0] });

    for (const b of blocks) {
      const { tG, rG } = b;
      if (!tG.length || !rG.length || tG.length > 4 || rG.length > 3) continue;
      const tw = tG.map((o) => o.t), rw = rG.map((o) => o.t);
      if (tw.every((t) => !isContent(t)) && rw.every((t) => !isContent(t))) continue;   // só artigo/preposição
      if (tw.join('') === rw.join('')) continue;                                        // composto: lunchbox × lunch box
      const expectedContent = rw.filter(isContent);
      if (!expectedContent.length) continue;
      if (expectedContent.every((t) => tContent.has(t))) continue;                      // disse em outro lugar
      if (tw.every((t) => rw.includes(t))) continue;                                    // só faltou palavra
      // segundo sinal obrigatório: som parecido OU verbo incompatível com o objeto; sem ele é uma alternativa legítima
      const rightWords = R.prep.fullS.slice(b.right[1], b.right[1] + 3).map((o) => o.t);
      const tContentWords = tw.filter(isContent).join(' ') || tw.join(' ');
      if (!soundsLike(tContentWords, expectedContent.join(' ')) && !soundsLike(tw.join(''), rw.join('')) && !verbObjectClash(tw, rightWords)) continue;
      const src = srcOf(tG.filter((o) => isContent(o.t) || tG.length <= 3));
      if (src.some((k) => taken.has(k))) continue;
      src.forEach((k) => taken.add(k));
      const leftCtx = b.left ? surface(R, R.prep.fullS[b.left[1]].src) : '';
      const rightCtx = surface(R, R.prep.fullS.slice(b.right[1], Math.min(b.right[1] + 3, R.prep.fullS.length)).flatMap((o) => o.src));
      out.push({
        tIdx: tG.map((o) => T.prep.fullS.indexOf(o)),
        src, heard: surface(T, src), expected: surface(R, srcOf(rG)),
        context: `${leftCtx ? leftCtx + ' ' : ''}___ ${rightCtx}`.trim(),
        ref: { text: ref.text, au: ref.au },
      });
    }
  }
  // outra frase do conteúdo explica o trecho sem divergência (frases parecidas): não é suspeita
  return out.filter((d) => !d.tIdx.every((i) => explained.has(i))).map(({ tIdx, ...d }) => d).sort((a, b) => a.src[0] - b.src[0]);
}
