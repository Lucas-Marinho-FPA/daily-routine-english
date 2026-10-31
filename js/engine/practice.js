// Ciclo de prática do Speaking Lab — funções puras (sem DOM).
// A lista “Vamos praticar” é reconstruída a cada tentativa a partir do resultado ATUAL:
// só entram palavras de conteúdo que o reconhecedor não reconheceu (omitidas ou ouvidas como outra).
// Isso indica divergência de reconhecimento, não um fonema errado comprovado.
import { wordsOf, wordAudioText, sameWordForm } from './wordfeedback.js';
import { wordTokens } from './text.js';

/**
 * @param evaluation resultado de evaluateWords (da tentativa atual)
 * @param text       texto-alvo (o mesmo passado a evaluateWords)
 * @returns {{ list: Array<{w, text, audioText, key, heard, kind}>, goodKeys: string[], conclusive: boolean }}
 *   list     — palavras a praticar (sem repetição), na ordem do texto
 *   goodKeys — palavras de conteúdo reconhecidas nesta tentativa (minúsculas)
 */
export function analyseAttempt(evaluation, text) {
  if (!evaluation || !evaluation.evaluated) return { list: [], goodKeys: [], conclusive: false };
  const segs = wordsOf(text);
  const seen = new Set();
  const list = [];
  const goodKeys = new Set();
  evaluation.words.forEach((r, i) => {
    const seg = segs[i];
    if (!seg || seg.weak) return;
    const audioText = wordAudioText(seg);
    const key = audioText.toLowerCase();
    if (r.state === 'good') goodKeys.add(key);
    if (r.state !== 'needs_practice' || seen.has(key)) return;
    seen.add(key);
    list.push({ w: i, text: seg.text.replace(/[.,!?;:]+$/, ''), audioText, key, heard: r.heard || null, kind: r.heard ? 'substituted' : 'missing' });
  });
  // a mesma palavra reconhecida num ponto e não reconhecida em outro continua pendente
  for (const x of list) goodKeys.delete(x.key);
  return { list, goodKeys: [...goodKeys], conclusive: true };
}

export function practiceSummary(list) {
  if (!list.length) return 'Nenhuma palavra pendente nesta tentativa.';
  return list.length === 1 ? 'Vamos praticar 1 palavra.' : `Vamos praticar ${list.length} palavras.`;
}

/** Descrição curta e honesta do motivo (sem afirmar qual som foi errado). */
export const practiceReason = (x) => (x.kind === 'substituted' ? `o app ouviu “${x.heard}”` : 'não foi reconhecida');

/**
 * Portão “só a tentativa mais recente vale”: cada nova gravação/análise pega um bilhete;
 * resultados com bilhete antigo são descartados (resposta atrasada não sobrescreve a atual).
 */
export function latestGate() {
  let current = 0;
  return {
    next: () => ++current,
    invalidate: () => { current++; },
    isCurrent: (ticket) => ticket === current,
  };
}

// ---------- Prática isolada de uma palavra (gravação curta só com a palavra-alvo) ----------
/**
 * Compara a transcrição de uma tentativa ISOLADA com a palavra-alvo. Comparação lexical, não fonética.
 * @returns {{ status: 'match'|'mismatch'|'extra'|'empty', heard: string }}
 *   match    — a transcrição normalizada é a palavra-alvo (maiúsculas e pontuação ignoradas)
 *   extra    — a palavra-alvo aparece, mas junto com outras palavras: inconclusivo (diga só a palavra)
 *   mismatch — o reconhecedor entendeu outra coisa (mesmo que parecida)
 *   empty    — nenhuma palavra reconhecida (silêncio ou transcrição vazia): nunca é acerto
 * `heard` é a transcrição original, sem alteração.
 */
export function matchIsolatedWord(target, transcript) {
  const heard = String(transcript ?? '').trim();
  const T = wordTokens(target);
  const H = wordTokens(heard);
  if (!H.length || !T.length) return { status: 'empty', heard };
  const eqAt = (i) => T.every((t, k) => H[i + k] !== undefined && sameWordForm(t, H[i + k]));
  // compostos escritos junto/separado: "lunch box" ↔ "lunchbox"
  if ((H.length === T.length && eqAt(0)) || H.join('') === T.join('')) return { status: 'match', heard, reps: 1 };
  // a palavra repetida duas ou três vezes na mesma gravação (“dog, dog, dog”) também vale — e nada além dela
  for (const k of [2, 3]) {
    if (H.length === T.length * k && Array.from({ length: k }, (_, j) => eqAt(j * T.length)).every(Boolean)) return { status: 'match', heard, reps: k };
  }
  for (let i = 0; i + T.length <= H.length; i++) if (eqAt(i)) return { status: 'extra', heard };
  return { status: 'mismatch', heard };
}

// ---------- Recuperação depois de tentativas repetidas da frase completa ----------
export const PERSIST_AFTER = 3; // tentativas conclusivas da frase inteira até destacar a palavra problemática

/**
 * Tentativas da frase completa nesta visita à tela (memória da sessão; nada é persistido).
 * Uma palavra é “persistente” quando ficou pendente em cada uma das últimas PERSIST_AFTER tentativas conclusivas:
 * aí o app destaca a palavra e propõe ouvir a referência e gravá-la isolada.
 */
export function attemptTracker(after = PERSIST_AFTER) {
  const history = []; // por tentativa: Set de chaves pendentes
  return {
    add: (keys) => { history.push(new Set(keys)); },
    count: () => history.length,
    persistent: () => {
      if (history.length < after) return [];
      const last = history.slice(-after);
      return [...last[last.length - 1]].filter((k) => last.every((s) => s.has(k)));
    },
  };
}

/**
 * Calibração contextual TEMPORÁRIA: uma palavra que o aluno acabou de confirmar isoladamente (gravação só da
 * palavra reconhecida como ela) e que o reconhecedor de novo não reconheceu na frase completa passa a contar como
 * divergência do reconhecedor — estado “não avaliada” (cinza), com o motivo —, nunca como erro do aluno.
 * Vale só nesta visita à tela; o modelo não aprende a voz de ninguém.
 * @param evaluation resultado de evaluateWords;  @param confirmedKeys chaves (minúsculas) confirmadas isoladamente
 * @returns { evaluation, calibrated: string[] }
 */
export function calibrate(evaluation, text, confirmedKeys) {
  const keys = new Set(confirmedKeys || []);
  if (!evaluation || !evaluation.evaluated || !keys.size) return { evaluation, calibrated: [] };
  const segs = wordsOf(text);
  const calibrated = new Set();
  const words = evaluation.words.map((r, i) => {
    const seg = segs[i];
    if (!seg || r.state !== 'needs_practice') return r;
    const key = wordAudioText(seg).toLowerCase();
    if (!keys.has(key)) return r;
    calibrated.add(key);
    return { ...r, state: 'uncertain', calibrated: true, reason: 'Você confirmou esta palavra gravando-a isolada; na frase, o reconhecedor divergiu. Conta como limite do reconhecimento, não como erro.' };
  });
  return { evaluation: { ...evaluation, words }, calibrated: [...calibrated] };
}

/**
 * Resultado da frase com a confiabilidade explícita (texto para o aluno; não é avaliação acústica de pronúncia).
 * reliability: 'high' (tudo reconhecido) | 'qualified' (reconhecida; divergências do reconhecedor já confirmadas
 * isoladamente) | 'partial' (palavras ainda pendentes) | 'inconclusive' (pendências persistentes sem confirmação).
 */
export function sentenceVerdict({ pending = [], calibrated = [], persistent = [] }) {
  const unconfirmedPersistent = persistent.filter((k) => !calibrated.includes(k));
  if (!pending.length && !calibrated.length) return { reliability: 'high', text: 'Frase reconhecida por completo.' };
  if (!pending.length) return { reliability: 'qualified', text: `Frase reconhecida. ${calibrated.length === 1 ? 'Em 1 palavra' : `Em ${calibrated.length} palavras`} o reconhecedor divergiu, mas você a${calibrated.length === 1 ? '' : 's'} confirmou isoladamente — não conta como erro.` };
  if (unconfirmedPersistent.length) return { reliability: 'inconclusive', text: `Reconhecimento inconclusivo para ${unconfirmedPersistent.map((k) => `“${k}”`).join(', ')} depois de ${PERSIST_AFTER} tentativas. Isso pode ser limite do reconhecedor; ouça a referência e grave só a palavra.` };
  return { reliability: 'partial', text: pending.length === 1 ? '1 palavra não foi reconhecida nesta tentativa.' : `${pending.length} palavras não foram reconhecidas nesta tentativa.` };
}

/**
 * Estado de prática das palavras numa visita à tela (memória da sessão; nada é persistido).
 * Estados: 'todo' (não praticada) | 'recording' | 'processing' | 'retry' (incorreta/inconclusiva) | 'done'.
 * Um acerto marca a palavra como 'done' e continua 'done' mesmo se o aluno repetir e errar depois
 * (o último resultado fica em `last`). Nunca conclui a frase.
 */
export function wordPracticeSession() {
  const words = new Map(); // key -> { status, tries, last: {status, heard} | null }
  const get = (key) => words.get(key) || { status: 'todo', tries: 0, last: null };
  const set = (key, patch) => { const v = { ...get(key), ...patch }; words.set(key, v); return v; };
  return {
    get,
    keys: () => [...words.keys()],
    start: (key) => set(key, { status: 'recording', prev: get(key).status }),
    processing: (key) => set(key, { status: 'processing' }),
    /** Gravação cancelada/falhou antes do resultado: volta ao estado anterior, sem contar tentativa. */
    abort: (key) => { const v = get(key); return set(key, { status: v.prev && !['recording', 'processing'].includes(v.prev) ? v.prev : 'todo' }); },
    result: (key, match) => {
      const v = get(key);
      const done = v.prev === 'done' || match.status === 'match';
      return set(key, { status: done ? 'done' : 'retry', tries: v.tries + 1, last: match, prev: undefined });
    },
    /** Próxima palavra ainda não concluída depois de `key` (dá a volta na lista); null se todas concluídas. */
    next: (list, key) => {
      const i = list.findIndex((x) => x.key === key);
      for (let k = 1; k <= list.length; k++) { const x = list[(i + k) % list.length]; if (x.key !== key && get(x.key).status !== 'done') return x; }
      return null;
    },
    allDone: (list) => list.length > 0 && list.every((x) => get(x.key).status === 'done'),
    doneCount: (list) => list.filter((x) => get(x.key).status === 'done').length,
  };
}
