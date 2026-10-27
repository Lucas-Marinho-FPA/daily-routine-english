// Concordância sujeito–verbo no Present Simple, numa resposta livre (transcrição) — função pura, sem DOM.
//
// É um erro de INGLÊS, não do reconhecimento: “I gets ready” tem todas as palavras corretas, só a forma do verbo
// não combina com o sujeito. Por isso entra em “Gramática e naturalidade” e nunca marca a palavra de âmbar.
// Critério estrito (melhor deixar de apontar do que apontar uma frase certa):
//   • I/you/we/they (+ advérbio de frequência opcional) + verbo com -s/-es de uma lista fechada de verbos de rotina;
//   • he/she (+ advérbio opcional) + verbo na forma base, desde que não venha depois de um auxiliar
//     (“does he work”, “can she go” estão certos). “it” fica de fora: costuma ser objeto (“make it work”).
import { wordTokens } from './text.js';
import { lemma } from './lexicon.js';

const PLURAL_SUBJ = new Set(['i', 'you', 'we', 'they']);
const THIRD_SUBJ = new Set(['he', 'she']);
const ADVERB = new Set('usually always often sometimes never normally generally rarely also just really still'.split(' '));
const AUX = new Set("do does did don't doesn't didn't can could will would shall should may might must let make makes made help helps 'll".split(' '));
// verbos de rotina (forma base) — os mesmos tipos de verbo dos episódios; formas irregulares de 3ª pessoa à parte
const VERBS = new Set(('get go have do wake eat drink take drive walk work study read watch listen play cook clean shower brush leave arrive ' +
  'start finish spend sleep prepare check meet call help pray relax rest run exercise train pick bring heat review practise practice write ' +
  'open turn switch park return come sit talk chat visit shop buy wash dress commute ride catch teach learn attend answer send plan ' +
  'organise organize try use present focus jog swim cycle feed need want like love enjoy prefer hate live stay leave make').split(' '));
const IRREGULAR_S = { has: 'have', does: 'do', goes: 'go', is: 'am/are' };

/** base do verbo se `w` for a 3ª pessoa (-s/-es) de um verbo da lista; senão null */
function thirdPersonBase(w) {
  if (IRREGULAR_S[w]) return IRREGULAR_S[w];
  if (!/s$/.test(w) || /ss$/.test(w)) return null;
  const l = lemma(w);
  return l !== w && VERBS.has(l) && (w === l + 's' || w === l + 'es' || (/y$/.test(l) && w === l.slice(0, -1) + 'ies')) ? l : null;
}
const thirdPerson = (b) => (b === 'have' ? 'has' : b === 'do' ? 'does' : b === 'go' ? 'goes' : /(s|sh|ch|x|o)$/.test(b) ? b + 'es' : /[^aeiou]y$/.test(b) ? b.slice(0, -1) + 'ies' : b + 's');

/**
 * Erros de concordância encontrados na transcrição.
 * @returns [{ id: 'E_AGREEMENT_FREE', heard: 'I gets', fix: 'I get', msg }]
 */
export function agreementIssues(text) {
  const t = wordTokens(String(text || ''));
  const out = [];
  for (let i = 0; i < t.length; i++) {
    const s = t[i];
    if (!PLURAL_SUBJ.has(s) && !THIRD_SUBJ.has(s)) continue;
    let j = i + 1;
    if (ADVERB.has(t[j])) j++;
    const v = t[j];
    if (!v) continue;
    const span = t.slice(i, j + 1).join(' ');
    if (PLURAL_SUBJ.has(s)) {
      const base = thirdPersonBase(v);
      if (!base) continue;
      if (v === 'is' && s !== 'i') continue; // “you is/they is”: raro e ambíguo na fala; só “I is”
      const fix = [...t.slice(i, j), v === 'is' ? 'am' : base].join(' ');
      const cap = (x) => x.replace(/^i\b/, 'I');
      const rule = v === 'is' ? 'com “I” o verbo “be” fica “am”' : `com “${cap(s)}” o verbo no presente fica sem -s`;
      out.push({ id: 'E_AGREEMENT_FREE', heard: cap(span), fix: cap(fix), msg: `Concordância (Present Simple): ${rule} — “${cap(fix)}”, não “${cap(span)}”.` });
    } else {
      if (i > 0 && AUX.has(t[i - 1])) continue; // “does he work”, “can she go”
      if (!VERBS.has(v) || thirdPersonBase(v)) continue;
      const fix = [...t.slice(i, j), thirdPerson(v)].join(' ');
      out.push({ id: 'E_AGREEMENT_FREE', heard: span, fix, msg: `Concordância (Present Simple): com “${s}” o verbo no presente leva -s — “${fix}”, não “${span}”.` });
    }
  }
  return out;
}
