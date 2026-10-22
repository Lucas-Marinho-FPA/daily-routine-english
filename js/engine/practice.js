// Ciclo de prática do Speaking Lab — funções puras (sem DOM).
// A lista “Vamos praticar” é reconstruída a cada tentativa a partir do resultado ATUAL:
// só entram palavras de conteúdo que o reconhecedor não reconheceu (omitidas ou ouvidas como outra).
// Isso indica divergência de reconhecimento, não um fonema errado comprovado.
import { wordsOf, wordAudioText } from './wordfeedback.js';

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
