// Integridade da transcrição (função pura): a transcrição representa todo o áudio? Roda ANTES da avaliação,
// para que uma palavra perdida pelo sistema não vire “o aluno não disse”.
//
// O que se sabe do reconhecedor local (vendor/asr/moonshine-js, model.ts → generate):
//   • cada trecho é decodificado até o fim de frase OU até 6 tokens por segundo de áudio; no segundo caso o texto
//     sai cortado e a biblioteca ainda descarta o último token (ela supõe que é o fim de frase). Ela não informa
//     qual dos dois aconteceu, então aqui o corte é ESTIMADO pelo tamanho do texto (sinal, não prova);
//   • respostas longas são transcritas em trechos (audio/segment.js); um trecho com voz que volta vazio indica
//     fala perdida; um corte no meio da fala pode partir ou repetir uma palavra.
import { wordTokens } from './text.js';

export const TOKENS_PER_SECOND = 6; // limite de decodificação da biblioteca (generate: maxLen = segundos × 6)

/** Estimativa conservadora de tokens do texto (palavra comum ≈ 1–2 tokens; números e pontuação somam). */
export function estimateTokens(text) {
  const s = String(text || '');
  const words = wordTokens(s);
  let n = 0;
  for (const w of words) n += /\d/.test(w) ? Math.max(2, w.replace(/\D/g, '').length + 1) : w.length > 7 ? 2 : 1;
  return n + (s.match(/[.,!?;:]/g) || []).length;
}

/**
 * @param p.text      transcrição completa
 * @param p.segments  trechos do reconhecimento [{ secs, voicedSec, text, cutInSpeech }] (localasr.transcribe) ou null
 * @param p.secs      duração total do áudio transcrito (quando não há trechos)
 * @returns {{ checked: boolean, complete: boolean|null, issues: Array<{code, msg, part?}> }}
 *   complete = null quando não há dados para verificar (resultado salvo antigo, reconhecimento do Chrome)
 */
export function transcriptIntegrity({ text = '', segments = null, secs = null } = {}) {
  const parts = segments && segments.length ? segments : secs ? [{ secs, text, voicedSec: null }] : null;
  if (!parts) return { checked: false, complete: null, issues: [] };
  const issues = [];
  parts.forEach((p, i) => {
    const label = parts.length > 1 ? ` (trecho ${i + 1} de ${parts.length})` : '';
    const budget = Math.trunc((p.secs || 0) * TOKENS_PER_SECOND);
    const words = wordTokens(p.text || '').length;
    if (budget > 0 && words > 0 && estimateTokens(p.text) >= budget - 1) {
      issues.push({ code: 'possibly-truncated', part: i, msg: `A transcrição pode ter sido cortada no fim${label}: o reconhecedor chegou perto do limite de texto para esse tempo de áudio.` });
    }
    if (p.voicedSec != null && p.voicedSec >= 1 && words === 0) {
      issues.push({ code: 'lost-part', part: i, msg: `Um trecho com voz não gerou texto${label}: parte da fala pode ter sido perdida pelo reconhecimento.` });
    }
    if (p.cutInSpeech && i < parts.length - 1) {
      issues.push({ code: 'cut-in-speech', part: i, msg: `A divisão do áudio caiu no meio da fala${label}: uma palavra pode ter sido partida ou repetida na emenda.` });
    }
  });
  const voiced = parts.reduce((n, p) => n + (p.voicedSec || 0), 0);
  const words = segments && segments.length ? parts.reduce((n, p) => n + wordTokens(p.text || '').length, 0) : wordTokens(text).length;
  if (voiced >= 4 && words / voiced < 0.6) {
    issues.push({ code: 'low-density', msg: 'Há bem menos palavras do que o tempo de fala sugere: parte do que você disse pode não ter sido reconhecida.' });
  }
  return { checked: true, complete: issues.length === 0, issues };
}

/** Algum problema que torna a ausência de uma informação inconclusiva (em vez de “faltou”)? */
export const mayHaveLostSpeech = (integ) => !!integ && integ.issues.some((x) => ['possibly-truncated', 'lost-part', 'low-density', 'cut-in-speech'].includes(x.code));
