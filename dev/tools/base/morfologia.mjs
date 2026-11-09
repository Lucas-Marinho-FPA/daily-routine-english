// Base Pedagógica — identificação CONSERVADORA de ocorrências flexionadas de expressões (EXP) nos segmentos narrativos.
// Serve para descobrir e relacionar ocorrências; nunca altera texto, nunca funde unidades.
// Critérios (modelo-de-dados.md §5.8):
// - só EXP de duas ou mais palavras; a 1ª palavra é o verbo-cabeça; o restante tem de aparecer IDÊNTICO e adjacente
//   (só espaços entre eles), com limites de palavra; palavras isoladas (VOC) ficam de fora (ex.: “left” é ambíguo);
// - CONFIRMADA: verbo-cabeça com paradigma listado no catálogo (base/progressao/catalogo.json → paradigmas_verbais);
// - CANDIDATA (proposta, para análise): flexão regular ou irregular comum de outros verbos-cabeça — nunca associada
//   automaticamente, porque pode haver ambiguidade de sentido (ex.: “turns up”, “looked up”);
// - a forma literal encontrada, a posição exata e o critério ficam registrados; o validador confere a posição.

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// irregulares comuns — usados SÓ para gerar candidatas (nunca confirmam nada sozinhos)
const IRREGULARES_CANDIDATOS = {
  go: ['goes', 'going', 'went', 'gone'], take: ['takes', 'taking', 'took', 'taken'], have: ['has', 'having', 'had'],
  make: ['makes', 'making', 'made'], do: ['does', 'doing', 'did', 'done'], come: ['comes', 'coming', 'came'],
  leave: ['leaves', 'leaving', 'left'], put: ['puts', 'putting'], set: ['sets', 'setting'], run: ['runs', 'running', 'ran'],
  sit: ['sits', 'sitting', 'sat'], wake: ['wakes', 'waking', 'woke', 'woken'], drive: ['drives', 'driving', 'drove', 'driven'],
  meet: ['meets', 'meeting', 'met'], say: ['says', 'saying', 'said'], give: ['gives', 'giving', 'gave', 'given'],
  keep: ['keeps', 'keeping', 'kept'], think: ['thinks', 'thinking', 'thought'], eat: ['eats', 'eating', 'ate', 'eaten'],
  catch: ['catches', 'catching', 'caught'], bring: ['brings', 'bringing', 'brought'], feel: ['feels', 'feeling', 'felt'],
  find: ['finds', 'finding', 'found'], spend: ['spends', 'spending', 'spent'], send: ['sends', 'sending', 'sent'],
  grab: ['grabs', 'grabbing', 'grabbed'], stop: ['stops', 'stopping', 'stopped'], plan: ['plans', 'planning', 'planned'],
};
// flexão regular (3ª pessoa, gerúndio, passado) — só para candidatas
export const regulares = (v) => [
  /(s|x|z|ch|sh)$/.test(v) ? `${v}es` : /[^aeiou]y$/.test(v) ? `${v.slice(0, -1)}ies` : `${v}s`,
  /[^e]e$/.test(v) ? `${v.slice(0, -1)}ing` : `${v}ing`,
  /e$/.test(v) ? `${v}d` : /[^aeiou]y$/.test(v) ? `${v.slice(0, -1)}ied` : `${v}ed`,
];

/** formas flexionadas do verbo-cabeça e o critério de cada uma */
export function flexoes(verbo, paradigmas) {
  const v = verbo.toLowerCase();
  if (paradigmas[v]) return { formas: Object.values(paradigmas[v]), criterio: `paradigma_verbal_catalogo:${v}`, status: 'confirmada' };
  return { formas: IRREGULARES_CANDIDATOS[v] || regulares(v), criterio: IRREGULARES_CANDIDATOS[v] ? `flexao_irregular_candidata:${v}` : `flexao_regular_candidata:${v}`, status: 'proposta' };
}

/**
 * Ocorrências flexionadas de uma expressão num texto. Devolve [{forma_encontrada, inicio, fim, criterio, status}].
 * Formas terminadas em “…” são modelos (procura-se a parte antes das reticências). A forma base literal NÃO conta
 * aqui (já é coberta pelos exemplos literais).
 */
export function ocorrencias(forma, texto, paradigmas) {
  const palavras = forma.replace(/\s*(…|\.\.\.)$/u, '').trim().split(/\s+/);
  if (palavras.length < 2) return [];
  const [cabeca, ...resto] = palavras;
  const f = flexoes(cabeca, paradigmas);
  const formas = f.formas.filter((x) => x.toLowerCase() !== cabeca.toLowerCase());
  if (!formas.length) return [];
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${formas.map(escRe).join('|')})\\s+${resto.map(escRe).join('\\s+')}(?![\\p{L}\\p{N}])`, 'giu');
  const out = [];
  for (const m of texto.matchAll(re)) out.push({ forma_encontrada: m[0], inicio: m.index, fim: m.index + m[0].length, criterio: f.criterio, status: f.status });
  return out;
}
