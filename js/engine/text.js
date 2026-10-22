// Funções puras de texto, compartilhadas pelo build (Node) e pelo app (navegador).
// Sem dependências e sem acesso a DOM.

const IRREGULAR = {
  get: ['gets', 'got', 'getting'], go: ['goes', 'went', 'going', 'gone'], do: ['does', 'did', 'doing', 'done'],
  have: ['has', 'had', 'having'], take: ['takes', 'took', 'taking', 'taken'], make: ['makes', 'made', 'making'],
  sit: ['sits', 'sat', 'sitting'], put: ['puts', 'putting'], run: ['runs', 'ran', 'running'], set: ['sets', 'setting'],
  shut: ['shuts', 'shutting'], spend: ['spends', 'spent', 'spending'], leave: ['leaves', 'left', 'leaving'],
  drive: ['drives', 'drove', 'driving', 'driven'], say: ['says', 'said', 'saying'], eat: ['eats', 'ate', 'eating', 'eaten'],
  feel: ['feels', 'felt', 'feeling'], grab: ['grabs', 'grabbed', 'grabbing'], skip: ['skips', 'skipped', 'skipping'],
  hit: ['hits', 'hitting'], send: ['sends', 'sent', 'sending'], wind: ['winds', 'wound', 'winding'],
  wake: ['wakes', 'woke', 'waking', 'woken'], begin: ['begins', 'began', 'beginning'], swim: ['swims', 'swimming'],
  stop: ['stops', 'stopped', 'stopping'], plan: ['plans', 'planned', 'planning'], shop: ['shops', 'shopped', 'shopping'],
  dry: ['dries', 'dried', 'drying'], tidy: ['tidies', 'tidied', 'tidying'], study: ['studies', 'studied', 'studying'],
  try: ['tries', 'tried', 'trying'], is: ['are', 'am', 'be', 'was', 'were'], be: ['is', 'are', 'am', 'was', 'were', 'being', 'been'],
};

/** Formas flexionadas plausíveis de um token (para localizar itens no texto). */
export function inflections(token) {
  const out = new Set([token]);
  if (IRREGULAR[token]) IRREGULAR[token].forEach((f) => out.add(f));
  if (token.length < 3) return out;
  out.add(token + 's');
  out.add(token + 'es');
  out.add(token + 'ed');
  out.add(token + 'd');
  out.add(token + 'ing');
  if (token.endsWith('e')) out.add(token.slice(0, -1) + 'ing');
  if (token.endsWith('y')) { out.add(token.slice(0, -1) + 'ies'); out.add(token.slice(0, -1) + 'ied'); }
  if (token.endsWith('s')) out.add(token.slice(0, -1));
  return out;
}

/** Normalização tipográfica básica: minúsculas, apóstrofos e aspas retos, hífens e espaços. */
export function basicNormalise(s) {
  return String(s)
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, ' ')
    .replace(/…/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Tokens de palavra: mantém dígitos, horas (5:00), apóstrofos internos e acentos; hífen vira espaço. */
export function wordTokens(s) {
  return basicNormalise(s)
    .replace(/(\d)[.:](\d\d)/g, '$1:$2')
    .replace(/\b([ap])\.\s?m\.?/g, '$1m')
    .replace(/-/g, ' ')
    .replace(/[^a-z0-9à-öø-ÿ':]+/g, ' ')
    .replace(/(^|\s)'+|'+(\s|$)/g, ' ')
    .replace(/:(?!\d)/g, ' ')
    .split(' ')
    .filter(Boolean);
}

const POSSESSIVES = new Set(['my', 'our', 'his', 'her', 'their', 'the', 'a', 'an', 'your']);

/**
 * Procura um padrão de item numa lista de tokens. Retorna [início, fim] ou null.
 * Regras: flexões verbais/nominais aceitas; 'my' casa com qualquer possessivo/artigo;
 * '*' ou 'someone' = 1 a 3 tokens quaisquer; em phrasal verbs de 2 palavras, até 3 tokens
 * podem separar verbo e partícula (put them away).
 */
export function findPattern(patternText, tokens, { separable = false } = {}) {
  const pat = wordTokens(patternText.replace(/\*/g, ' qqanyqq ').replace(/\bsomeone\b/g, ' qqanyqq '));
  const sets = pat.map((t) => (t === 'qqanyqq' ? null : t === 'my' ? POSSESSIVES : inflections(t)));
  const maxGapBeforeLast = separable && pat.length === 2 ? 3 : 0;

  const matchFrom = (pi, ti) => {
    if (pi === pat.length) return ti;
    if (sets[pi] === null) {
      for (let k = 1; k <= 3 && ti + k <= tokens.length; k++) {
        const end = matchFrom(pi + 1, ti + k);
        if (end !== -1) return end;
      }
      return -1;
    }
    const gap = pi === pat.length - 1 && pi > 0 ? maxGapBeforeLast : 0;
    for (let g = 0; g <= gap && ti + g < tokens.length; g++) {
      if (sets[pi].has(tokens[ti + g])) {
        const end = matchFrom(pi + 1, ti + g + 1);
        if (end !== -1) return end;
      }
    }
    return -1;
  };

  for (let i = 0; i < tokens.length; i++) {
    if (sets[0] !== null && !sets[0].has(tokens[i])) continue;
    const end = matchFrom(0, i);
    if (end !== -1) return [i, end];
  }
  return null;
}

/** Hash FNV-1a 32 bits em hexadecimal (nomes estáveis de arquivos de áudio). */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Texto canônico usado para chavear áudio: o mesmo texto em qualquer lugar → o mesmo arquivo. */
export function audioKey(text) {
  return fnv1a(String(text).replace(/\s+/g, ' ').trim());
}

/** Distância de edição (Damerau, alinhamento ótimo): transposição de letras vizinhas conta 1. */
export function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...new Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[m][n];
}

/** Alinhamento por LCS entre duas listas de tokens: retorna pares de índices casados. */
export function lcsAlign(a, b, eq = (x, y) => x === y) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = eq(a[i], b[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const pairs = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (eq(a[i], b[j])) { pairs.push([i, j]); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return pairs;
}

/** Divide um parágrafo em frases, sem quebrar em 'a.m.'/'p.m.' no meio da frase. */
export function splitSentences(text) {
  const protectedText = text.replace(/([ap])\.m\.(?!\s+[A-Z])/g, '$1·m·');
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ú])/)
    .map((s) => s.replace(/([ap])·m·/g, '$1.m.').trim())
    .filter(Boolean);
}

/** Embaralhamento determinístico opcional (seed) ou aleatório. */
export function shuffle(list, rand = Math.random) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Tokens com posição no texto original, alinhados 1:1 com wordTokens(text).
 * Usado para destacar ou ocultar um item dentro da frase exibida.
 */
export function tokenSpans(text) {
  const rx = /\d{1,2}[.:]\d\d|\b[ap]\.\s?m\.?|[A-Za-zÀ-ÖØ-öø-ÿ0-9]+(?:['’][A-Za-zÀ-ÖØ-öø-ÿ0-9]+)*/g;
  const spans = [];
  let m;
  while ((m = rx.exec(text))) spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
  return spans;
}
