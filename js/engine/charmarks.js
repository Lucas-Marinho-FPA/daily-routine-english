// Marcação VISUAL por trecho de uma palavra avaliada (atividade de vocabulário). Só apresentação: não muda o estado da
// palavra, a nota, a aprovação nem “Palavras a praticar” — tudo isso continua vindo do avaliador (evaluateWords).
// Representa correspondência TEXTUAL entre o esperado e a transcrição; não é avaliação fonética.
//
// Entrada: a palavra do avaliador { text, state, heard? } (heard = o que foi ouvido no lugar dela, quando há).
// Saída: trechos [{ text, mark }] com mark: 'good' (verde) | 'missing' (vermelho suave) | 'uncertain' (amarelo).
//  • good → palavra inteira verde; uncertain (não avaliada com segurança) → amarela.
//  • needs_practice:
//    – sem nada ouvido no lugar → inteira vermelha (ausente);
//    – ouvido = esperado sem uma TERMINAÇÃO conhecida (alinhamento seguro: o ouvido é o começo exato da palavra, com
//      ≥ 3 letras, e o que falta é só s/es/ed/d/ing/'s/er/est/ly): o começo verde e só a terminação vermelha
//      (“teams” ← “team”: “team” verde + “s” vermelho);
//    – há base comum, mas sem separar com segurança o que faltou (mesmo começo de ≥ 3 letras: “different” ←
//      “difficult”, “colour” ← “color”, “works” ← “working”), ou o lugar tem mais de uma palavra ouvida (“I'm” ←
//      “i am”) → inteira amarela (sem inventar precisão);
//    – nenhuma correspondência confiável (“teams” ← “dreams”: semelhança só no fim não conta) → inteira vermelha.

const SUFFIXES = ['ing', 'est', "'s", 'es', 'ed', 'er', 'ly', 's', 'd'];
const MIN_STEM = 3;
const norm = (t) => String(t || '').toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9']/g, '');

/** Letras comparáveis de um texto de exibição, com a posição de cada uma no texto original. */
function lettersOf(display) {
  const out = [];
  const s = String(display).replace(/[’`]/g, "'");
  for (let i = 0; i < s.length; i++) if (/[a-z0-9']/i.test(s[i])) out.push({ ch: s[i].toLowerCase(), at: i });
  return out;
}

/** Corta o texto de exibição em [verde até a letra n, vermelho depois] (pontuação fica com o trecho vizinho). */
function splitAt(display, n) {
  const L = lettersOf(display);
  const cut = n >= L.length ? display.length : L[n].at;
  return [{ text: display.slice(0, cut), mark: 'good' }, { text: display.slice(cut), mark: 'missing' }].filter((x) => x.text);
}

/** Tamanho do começo comum de duas palavras normalizadas. */
const commonPrefix = (a, b) => { let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++; return i; };

/**
 * Classificação de uma palavra ainda não refinada: { kind: 'good' | 'suffix' | 'uncertain' | 'missing', stem? }.
 * Exportada para os testes.
 */
export function classifyWord(word) {
  if (!word) return { kind: 'missing' };
  if (word.state === 'good') return { kind: 'good' };
  if (word.state !== 'needs_practice') return { kind: 'uncertain' };
  const heardRaw = String(word.heard || '').trim();
  if (!heardRaw) return { kind: 'missing' };
  if (/\s/.test(heardRaw)) return { kind: 'uncertain' }; // várias palavras no lugar desta: não dá para separar com segurança
  const exp = norm(word.text), heard = norm(heardRaw);
  if (!exp || !heard) return { kind: 'missing' };
  if (heard.length >= MIN_STEM && exp.startsWith(heard) && SUFFIXES.includes(exp.slice(heard.length))) return { kind: 'suffix', stem: heard.length };
  if (commonPrefix(exp, heard) >= MIN_STEM) return { kind: 'uncertain' };
  return { kind: 'missing' };
}

/** Trechos coloridos do texto de exibição de uma palavra (ex.: “teams,” com a vírgula do texto original). */
export function markWord(display, word) {
  const c = classifyWord(word);
  if (c.kind === 'suffix') {
    // o ouvido casa com as primeiras `stem` letras normalizadas; o resto (a terminação) é o que faltou
    const L = lettersOf(display);
    if (L.length === norm(word.text).length) return splitAt(display, c.stem);
    return [{ text: display, mark: 'uncertain' }]; // exibição e palavra avaliada não batem letra a letra: sem precisão
  }
  return [{ text: display, mark: c.kind === 'good' ? 'good' : c.kind === 'missing' ? 'missing' : 'uncertain' }];
}
