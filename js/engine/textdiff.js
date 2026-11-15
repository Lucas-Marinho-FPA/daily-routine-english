// Comparação visual da escrita (só apresentação): marca no texto do aluno o trecho errado e, na forma correta, o trecho
// que corrige — por caractere dentro de uma palavra parecida (“saund” × “sound”: só “a” × “o”), por palavra quando a
// palavra falta, sobra ou é outra. Não decide aprovação nem nota (isso continua com o corretor, scoreWriting).
// Maiúsculas/minúsculas e pontuação não são marcadas como erro (o corretor também não as cobra).
//
// diffText(answer, reference) → { answer: [{ text, mark }], reference: [{ text, mark }], changed }
//   mark no texto do aluno:  'same' | 'wrong' (caractere/trecho trocado ou a mais na palavra) | 'extra' (palavra a mais)
//   mark na forma correta:   'same' | 'fix'   (caractere/trecho correto)                       | 'missing' (palavra que faltou)
//   Espaços entre palavras vêm como { text: ' ', mark: 'space' }.

const norm = (w) => String(w).toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9']/g, '');
const tokens = (t) => String(t || '').trim().split(/\s+/).filter(Boolean);

/** Distância de edição (Levenshtein) entre duas palavras normalizadas. */
function lev(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}
/** Palavras parecidas o bastante para marcar só os caracteres (até metade das letras diferentes). */
const similar = (a, b) => { const x = norm(a), y = norm(b); return !!x && !!y && lev(x, y) <= Math.max(1, Math.floor(Math.max(x.length, y.length) / 2)); };
const subCost = (a, b) => { const x = norm(a), y = norm(b); if (x === y) return 0; return similar(a, b) ? lev(x, y) / Math.max(x.length, y.length) : 2.5; };

/** Alinhamento de palavras (custo mínimo): igual, substituição por parecida, falta ou sobra. */
function alignWords(A, B) {
  const n = A.length, m = B.length;
  const c = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) c[i][0] = i;
  for (let j = 1; j <= m; j++) c[0][j] = j;
  for (let i = 1; i <= n; i++) for (let j = 1; j <= m; j++) {
    c[i][j] = Math.min(c[i - 1][j] + 1, c[i][j - 1] + 1, c[i - 1][j - 1] + subCost(A[i - 1], B[j - 1]));
  }
  const ops = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && Math.abs(c[i][j] - (c[i - 1][j - 1] + subCost(A[i - 1], B[j - 1]))) < 1e-9 && subCost(A[i - 1], B[j - 1]) < 2) {
      ops.push({ a: A[i - 1], b: B[j - 1] }); i--; j--;
    } else if (i > 0 && Math.abs(c[i][j] - (c[i - 1][j] + 1)) < 1e-9) { ops.push({ a: A[i - 1], b: null }); i--; }
    else { ops.push({ a: null, b: B[j - 1] }); j--; }
  }
  return ops.reverse();
}

/** Caracteres da palavra: os que fazem parte da maior subsequência comum ficam 'same'; os outros, marcados. */
function charMarks(a, b) {
  const x = a.toLowerCase(), y = b.toLowerCase();
  const L = Array.from({ length: x.length + 1 }, () => Array(y.length + 1).fill(0));
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) {
    L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  }
  const ma = Array(x.length).fill(false), mb = Array(y.length).fill(false);
  let i = 0, j = 0;
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { ma[i] = mb[j] = true; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  // pontuação nunca é marcada (o corretor não a cobra)
  const punct = (ch) => !/[a-z0-9']/i.test(ch);
  const segs = (word, keep, bad) => {
    const out = [];
    for (let k = 0; k < word.length; k++) {
      const mark = keep[k] || punct(word[k]) ? 'same' : bad;
      if (out.length && out[out.length - 1].mark === mark) out[out.length - 1].text += word[k]; else out.push({ text: word[k], mark });
    }
    return out;
  };
  return { a: segs(a, ma, 'wrong'), b: segs(b, mb, 'fix') };
}

export function diffText(answer, reference) {
  const ops = alignWords(tokens(answer), tokens(reference));
  const A = [], B = [];
  const push = (arr, segs) => { if (arr.length) arr.push({ text: ' ', mark: 'space' }); arr.push(...segs); };
  let changed = false;
  for (const op of ops) {
    if (op.a !== null && op.b !== null) {
      if (norm(op.a) === norm(op.b)) { push(A, [{ text: op.a, mark: 'same' }]); push(B, [{ text: op.b, mark: 'same' }]); continue; }
      const cm = charMarks(op.a, op.b);
      push(A, cm.a); push(B, cm.b); changed = true;
    } else if (op.a !== null) { if (norm(op.a)) { push(A, [{ text: op.a, mark: 'extra' }]); changed = true; } else push(A, [{ text: op.a, mark: 'same' }]); }
    else if (norm(op.b)) { push(B, [{ text: op.b, mark: 'missing' }]); changed = true; } else push(B, [{ text: op.b, mark: 'same' }]);
  }
  return { answer: A, reference: B, changed };
}

/** A referência (entre a forma principal e as variantes aceitas) mais próxima do que o aluno escreveu. */
export function closestReference(answer, refs) {
  const list = refs.filter(Boolean);
  const dist = (r) => lev(tokens(answer).map(norm).join(' '), tokens(r).map(norm).join(' '));
  return list.reduce((best, r) => (best === null || dist(r) < dist(best) ? r : best), null);
}

/**
 * Correção sem revelar a resposta (ajustes 06/07, PO 2026-11-14). Mostra o que o aluno escreveu, na ordem:
 *  palavra certa → normal ('same'); letra a mais ou trocada → a letra do aluno em vermelho ('extra');
 *  letra que falta → um “X” vermelho por letra ('missing'), sem a letra; palavra inteira que falta → bloco de X
 *  (“with” → XXXX, “a” → X), com o espaço entre palavras preservado. Maiúsculas e pontuação não contam.
 * → [{ text, mark: 'same' | 'extra' | 'missing' | 'space' }]
 */
export function maskedAnswer(answer, reference) {
  const ops = alignWords(tokens(answer), tokens(reference));
  const out = [];
  const push = (segs) => { if (out.length) out.push({ text: ' ', mark: 'space' }); for (const s of segs) { const l = out[out.length - 1]; if (l && l.mark === s.mark && s.mark !== 'space') l.text += s.text; else out.push({ ...s }); } };
  const xs = (w) => 'X'.repeat(norm(w).length || 1);
  for (let k = 0; k + 1 < ops.length; k++) { // palavra trocada: a do aluno primeiro, depois o bloco de X
    if (ops[k].a === null && ops[k + 1].b === null) { const t = ops[k]; ops[k] = ops[k + 1]; ops[k + 1] = t; }
  }
  for (const op of ops) {
    if (op.a !== null && op.b !== null) {
      if (norm(op.a) === norm(op.b)) { push([{ text: op.a, mark: 'same' }]); continue; }
      push(charMask(op.a, op.b));
    } else if (op.a !== null) push([{ text: op.a, mark: norm(op.a) ? 'extra' : 'same' }]);
    else if (norm(op.b)) push([{ text: xs(op.b), mark: 'missing' }]);
  }
  return out;
}
/** Letra a letra (Levenshtein): igual → normal; trocada ou a mais → letra do aluno em vermelho; faltando → X. */
function charMask(a, b) {
  const punct = (ch) => !/[a-z0-9']/i.test(ch);
  const x = [...a], y = [...b].filter((ch) => !punct(ch)); // a pontuação da referência não é cobrada
  const X = x.map((c) => c.toLowerCase()), Y = y.map((c) => c.toLowerCase());
  const d = Array.from({ length: x.length + 1 }, (_, i) => [i, ...Array(y.length).fill(0)]);
  for (let j = 1; j <= y.length; j++) d[0][j] = j;
  for (let i = 1; i <= x.length; i++) for (let j = 1; j <= y.length; j++) {
    const sub = punct(x[i - 1]) ? 1 : (X[i - 1] === Y[j - 1] ? 0 : 1);
    d[i][j] = Math.min(d[i - 1][j] + (punct(x[i - 1]) ? 0 : 1), d[i][j - 1] + 1, d[i - 1][j - 1] + sub);
  }
  const segs = []; let i = x.length, j = y.length;
  while (i > 0 || j > 0) {
    if (i > 0 && punct(x[i - 1]) && d[i][j] === d[i - 1][j]) { segs.push({ text: x[i - 1], mark: 'same' }); i--; }
    else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (X[i - 1] === Y[j - 1] ? 0 : 1)) { segs.push({ text: x[i - 1], mark: X[i - 1] === Y[j - 1] ? 'same' : 'extra' }); i--; j--; }
    else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { segs.push({ text: x[i - 1], mark: 'extra' }); i--; }
    else { segs.push({ text: 'X', mark: 'missing' }); j--; }
  }
  return segs.reverse();
}
/** Acerto integral: nada a marcar (só maiúsculas/pontuação diferentes). */
export const integralMatch = (answer, reference) => maskedAnswer(answer, reference).every((s) => s.mark === 'same' || s.mark === 'space');
