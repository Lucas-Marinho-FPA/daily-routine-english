// Feedback de fala palavra por palavra — funções puras (sem DOM).
//
// Sinais realmente disponíveis neste app (ver docs/feedback-de-pronuncia.md):
//   • transcrição do reconhecimento de fala NO APARELHO (quando o Chrome oferece) + confiança global;
//   • métricas acústicas da gravação (tempo de fala, pausas, ritmo em relação à referência).
// NÃO há avaliador acústico de fonemas, de acento ou de entonação. Por isso:
//   • "good"            = a palavra foi reconhecida como esperado, com confiança suficiente (evidência de inteligibilidade);
//   • "needs_practice"  = a palavra não foi reconhecida como esperado (omitida ou ouvida como outra);
//   • "uncertain"       = sem evidência suficiente (sem reconhecimento, confiança baixa, palavra átona curta, gravação ruim);
//   • "pending"         = ainda não avaliada.
// Nenhum estado afirma qual som (vogal, consoante, sílaba tônica) foi pronunciado errado.
import { tokenSpans, wordTokens, lcsAlign, levenshtein } from './text.js';

export const STATES = ['pending', 'good', 'needs_practice', 'uncertain'];

/** Pesos iniciais da nota geral — HIPÓTESES de produto, não parâmetros validados. */
export const SCORE_WEIGHTS = [
  { id: 'intelligibility', label: 'Pronúncia e inteligibilidade', weight: 0.60 },
  { id: 'fluency', label: 'Ritmo e fluidez', weight: 0.20 },
  { id: 'prosody', label: 'Acentuação e entonação', weight: 0.15 },
  { id: 'duration', label: 'Duração e naturalidade', weight: 0.05 },
];

const MIN_CONFIDENCE = 0.5; // abaixo disso a transcrição não sustenta conclusões por palavra
// palavras curtas e átonas que o reconhecedor costuma omitir mesmo quando ditas: nunca marcamos como erro
const WEAK = new Set(['a', 'an', 'the', 'and', 'to', 'of', 'at', 'in', 'on', 'for', 'or', 'as', 'by', 'is', 'am', 'are', 'it', 'my', 'i', 'so', 'but', 'with', 'from', 'up', 'do']);
const NUM = { zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, fifteen: 15, twenty: 20, thirty: 30, forty: 40, fifty: 50 };
const AME = { analyze: 'analyse', analyzes: 'analyses', analyzing: 'analysing', practice: 'practise', practices: 'practises', finalize: 'finalise', organize: 'organise', neighborhood: 'neighbourhood' };

/**
 * Divide o texto em segmentos que, concatenados, reproduzem o texto original exatamente
 * (espaços e pontuação preservados). Segmentos de palavra têm `w` (índice da palavra).
 */
export function segment(text) {
  const segs = [];
  let pos = 0, w = 0;
  for (const s of tokenSpans(text)) {
    if (s.start > pos) segs.push({ text: text.slice(pos, s.start) });
    const norm = wordTokens(s.text).join(' ');
    // nome próprio (maiúscula no meio da frase, ex.: "Uber"): o reconhecedor pode não conhecê-lo
    const before = text.slice(0, s.start).trimEnd();
    const proper = /^[A-Z][a-z]/.test(s.text) && before !== '' && !/[.!?:]$/.test(before);
    segs.push({ text: s.text, w: w++, norm, weak: WEAK.has(norm), proper });
    pos = s.end;
  }
  if (pos < text.length) segs.push({ text: text.slice(pos) });
  return segs;
}

export const wordsOf = (text) => segment(text).filter((s) => s.w !== undefined);

/**
 * Texto do áudio isolado de uma palavra (gerado offline com a mesma voz britânica das frases):
 * sem pontuação final; minúsculas, exceto nomes próprios, "I" e siglas. Usado no build e no app.
 */
export function wordAudioText(seg) {
  const t = seg.text.replace(/[’]/g, "'").replace(/[.,!?;:]+$/, '');
  return seg.proper || t === 'I' || /^[A-Z]{2,}/.test(t) ? t : t.toLowerCase();
}

/** Palavras que podem entrar na lista de prática (palavras de conteúdo, não átonas). */
export const practiceCandidates = (text) => wordsOf(text).filter((s) => !s.weak);

/** Formas equivalentes de um token (número por extenso ↔ dígitos, hora → hora cheia, AmE → BrE). */
function forms(t) {
  const out = new Set([t]);
  if (AME[t]) out.add(AME[t]);
  if (/iz(e|ed|es|ing|ation)$/.test(t)) out.add(t.replace(/iz(e|ed|es|ing|ation)$/, 'is$1')); // finalized → finalised
  const hm = /^(\d{1,2})(\d\d)$/.exec(t); // "900", "830": hora escrita sem dois-pontos
  if (hm && +hm[2] < 60) out.add(`${hm[1]}:${hm[2]}`).add(hm[1]);
  if (t in NUM) out.add(String(NUM[t]));
  const m = /^(\d{1,2}):(\d\d)$/.exec(t);
  if (m) { out.add(String(+m[1])); if (m[2] !== '00') out.add(m[2].replace(/^0/, '')); }
  if (/^\d+$/.test(t)) for (const [k, v] of Object.entries(NUM)) if (String(v) === t) out.add(k);
  if (t === 'am' || t === 'pm') { out.add(t[0]); out.add(t + '.'); }
  if (t.endsWith("'s")) out.add(t.slice(0, -2));
  return out;
}

/** Flexão regular (walk → walked/walks, stop → stopped): o radical foi entendido; não é erro de pronúncia. */
function inflected(target, heard) {
  if (target.length < 3 || !heard.startsWith(target)) return false;
  const rest = heard.slice(target.length);
  return ['s', 'es', 'd', 'ed', target.slice(-1) + 'ed'].includes(rest);
}

function tokenEq(target, heard) {
  if (target === heard) return true;
  const a = forms(target), b = forms(heard);
  for (const x of a) for (const y of b) if (x === y || inflected(x, y)) return true;
  // pequeno desvio de grafia na transcrição (ex.: "cafeteria"/"cafetaria") só em palavras longas
  return target.length >= 6 && heard.length >= 6 && levenshtein(target, heard) <= 1;
}

/** Tokens ouvidos: separa horas coladas ("6pm", "8:30pm", "6p m") e expande "a.m." etc. */
function heardTokens(transcript) {
  const out = [];
  for (const t of wordTokens(String(transcript || ''))) {
    const m = /^(\d{1,4}(?::\d\d)?)(am|pm|a|p)$/.exec(t);
    if (m) out.push(m[1], m[2].length === 1 ? m[2] + 'm' : m[2]);
    else if (t === 'm' && (out[out.length - 1] === 'am' || out[out.length - 1] === 'pm')) continue; // "6p. M."
    else out.push(t);
  }
  return out;
}

/**
 * Transcrição degenerada: modelos de reconhecimento às vezes entram em laço ("0, 0, 0, 0…")
 * ou produzem muito mais palavras do que o texto tem. Nesses casos nada é avaliado.
 */
export function degenerate(heard, expected) {
  let run = 1;
  for (let j = 1; j < heard.length; j++) { run = heard[j] === heard[j - 1] ? run + 1 : 1; if (run >= 4) return true; }
  return heard.length > Math.max(8, expected * 1.8);
}

/**
 * Compostos escritos de outro jeito na transcrição ("lunch box" ↔ "lunchbox", "audiobook" ↔ "audio book",
 * "I deal" ↔ "ideal"): ajusta os tokens ouvidos à divisão do texto-alvo antes do alinhamento.
 */
function matchCompounds(target, heard) {
  const joined = new Map(); // "lunchbox" -> ['lunch', 'box']
  for (let i = 0; i < target.length - 1; i++) joined.set(target[i] + target[i + 1], [target[i], target[i + 1]]);
  const tset = new Set(target);
  const out = [];
  for (let j = 0; j < heard.length; j++) {
    const h = heard[j], pair = j + 1 < heard.length ? h + heard[j + 1] : null;
    if (!tset.has(h) && joined.has(h)) out.push(...joined.get(h));
    else if (pair && tset.has(pair) && !(tset.has(h) && tset.has(heard[j + 1]))) { out.push(pair); j++; }
    else out.push(h);
  }
  return out;
}

/**
 * Avalia as palavras do texto-alvo a partir da transcrição local.
 * @param {string} text        texto-alvo exibido
 * @param {object|null} asr     { text, confidence } ou null quando não há reconhecimento
 * @param {object} opts         { insufficient: true } quando a gravação não tem voz suficiente
 * @returns {{ words: Array<{w, text, state, reason, heard?}>, evaluated: boolean, note: string }}
 */
export function evaluateWords(text, asr, opts = {}) {
  const words = wordsOf(text);
  const all = (state, reason, note) => ({ words: words.map((x) => ({ w: x.w, text: x.text, state, reason })), evaluated: false, note });
  if (opts.insufficient) return all('uncertain', 'Gravação insuficiente para avaliar esta palavra. Tente gravar novamente, mais perto do microfone.', 'Quase não captei voz: nada foi avaliado.');
  if (!asr) return all('uncertain', 'Não foi possível avaliar esta palavra: o reconhecimento de fala no aparelho não está disponível. Compare com a referência (A/B).', 'Avaliação por palavra indisponível neste aparelho.');
  const target = words.map((x) => x.norm);
  const heard = matchCompounds(target, heardTokens(asr.text));
  if (!heard.length) return all('uncertain', 'Nenhuma fala foi reconhecida. Tente gravar novamente.', 'O reconhecimento não captou fala: resultado inconclusivo.');
  if (degenerate(heard, words.length)) return all('uncertain', 'A transcrição saiu corrompida (repetições sem sentido); não dá para avaliar a palavra. Tente gravar de novo.', 'Transcrição não confiável (repetições): resultado inconclusivo.');
  if (typeof asr.confidence === 'number' && asr.confidence > 0 && asr.confidence < MIN_CONFIDENCE) {
    return all('uncertain', 'O reconhecimento teve confiança baixa nesta gravação; não dá para avaliar a palavra com segurança. Tente de novo.', 'Confiança baixa do reconhecimento: resultado inconclusivo.');
  }

  const pairs = lcsAlign(target, heard, tokenEq);
  const matchT = new Map(pairs.map(([i, j]) => [i, j]));
  // para cada palavra não casada, procura o que foi ouvido no mesmo intervalo entre âncoras
  const anchors = [[-1, -1], ...pairs, [target.length, heard.length]];
  const gapHeard = new Map();
  for (let k = 0; k < anchors.length - 1; k++) {
    const [ti, hj] = anchors[k], [tn, hn] = anchors[k + 1];
    const tGap = []; for (let i = ti + 1; i < tn; i++) tGap.push(i);
    const hGap = heard.slice(hj + 1, hn);
    tGap.forEach((i, idx) => gapHeard.set(i, tGap.length === hGap.length ? [hGap[idx]] : hGap));
  }

  const out = words.map((x, i) => {
    if (matchT.has(i)) return { w: x.w, text: x.text, state: 'good', reason: 'Reconhecida como esperado. Isso indica que a palavra foi entendida (inteligível); não é uma análise fonética dos sons.' };
    const near = (gapHeard.get(i) || []).filter(Boolean);
    if (x.weak) return { w: x.w, text: x.text, state: 'uncertain', reason: 'Palavra curta e átona: o reconhecedor costuma omiti-la mesmo quando é dita. Não foi avaliada.' };
    if (x.proper) return { w: x.w, text: x.text, state: 'uncertain', reason: 'Nome próprio: o reconhecedor pode não conhecê-lo e escrevê-lo de outro jeito. Não foi avaliado.' };
    if (near.length) {
      return { w: x.w, text: x.text, state: 'needs_practice', heard: near.join(' '),
        reason: `Não foi reconhecida como esperado: o reconhecedor ouviu “${near.join(' ')}”. Ouça a referência e repita esta palavra. (O sistema não identifica qual som diferiu.)` };
    }
    return { w: x.w, text: x.text, state: 'needs_practice', reason: 'Não foi reconhecida: a palavra pode ter sido omitida ou dita de forma pouco clara. Ouça a referência e repita. (O sistema não identifica qual som diferiu.)' };
  });
  return { words: out, evaluated: true, note: '' };
}

/**
 * Nota geral: combina apenas as dimensões que têm medida real; as demais aparecem como indisponíveis.
 * Sem inteligibilidade (que pesa 60%), não há nota geral — só as medidas parciais.
 * @param {object} p { evaluation (de evaluateWords), analysis (de analyseBlob), expectedWords }
 */
export function scoreAttempt({ evaluation, analysis, expectedWords = 0, recorded = true }) {
  const dims = SCORE_WEIGHTS.map((d) => ({ ...d, score: null, note: '' }));
  const get = (id) => dims.find((d) => d.id === id);
  // recorded=false: verificação só por reconhecimento, sem gravação (ritmo e duração não medidos)
  const insufficient = recorded && (!analysis || analysis.silent || analysis.speechSec < 0.4);

  // inteligibilidade: palavras de conteúdo reconhecidas / avaliadas
  if (evaluation && evaluation.evaluated) {
    const judged = evaluation.words.filter((x) => x.state === 'good' || x.state === 'needs_practice');
    if (judged.length >= 2) get('intelligibility').score = Math.round((judged.filter((x) => x.state === 'good').length / judged.length) * 100);
    else get('intelligibility').note = 'Poucas palavras avaliáveis.';
  } else get('intelligibility').note = evaluation && evaluation.note ? evaluation.note : 'Sem reconhecimento de fala no aparelho.';

  // ritmo e fluidez: pausas longas e pausas por palavra (não penaliza falar devagar)
  if (analysis && !insufficient && analysis.speechSec >= 1) {
    const words = Math.max(1, expectedWords);
    let s = 100 - Math.max(0, analysis.longPauses - (words > 20 ? 2 : 0)) * 12 - Math.max(0, analysis.pauses - Math.ceil(words / 5)) * 5;
    get('fluency').score = Math.max(30, Math.min(100, Math.round(s)));
  } else get('fluency').note = 'Gravação curta ou sem voz suficiente.';

  get('prosody').note = 'Não avaliado: o app não tem um analisador de acento e entonação.';

  // duração: só penaliza extremos; fala mais lenta que a referência até 1,8× não perde pontos
  const p = analysis && analysis.paceVsReference;
  const plausible = analysis && !(analysis.wpm && (analysis.wpm > 260 || analysis.wpm < 40));
  if (!insufficient && p && plausible) get('duration').score = p > 2.4 ? 60 : p > 1.8 ? 80 : p < 0.6 ? 60 : p < 0.75 ? 80 : 100;
  else get('duration').note = analysis ? 'Sem duração de referência confiável.' : 'Sem gravação: duração não medida.';

  const available = dims.filter((d) => d.score !== null);
  const hasCore = get('intelligibility').score !== null;
  if (insufficient || !hasCore) {
    return { overall: null, dims, partial: true,
      message: insufficient ? 'Gravação insuficiente: sem nota. Tente novamente.' : 'Nota geral indisponível: falta a medida de inteligibilidade (reconhecimento de fala no aparelho).' };
  }
  const wsum = available.reduce((n, d) => n + d.weight, 0);
  const overall = Math.round(available.reduce((n, d) => n + d.score * d.weight, 0) / wsum);
  return { overall, dims, partial: available.length < dims.length,
    message: `Nota estimada com ${available.map((d) => d.label.toLowerCase()).join(', ')}. ${dims.filter((d) => d.score === null).map((d) => d.label).join(', ')}: não avaliado.` };
}
