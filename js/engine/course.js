// Atividades do curso (tradução inglês → português). Regras puras, sem DOM.
// O texto das atividades NÃO faz parte do app publicado: o aluno importa o arquivo da atividade no próprio
// aparelho (material de terceiros, sem licença de publicação). Formato aceito:
//   <título da atividade>            (primeira linha não vazia; linhas seguintes até a 1ª questão são ignoradas)
//   QUESTION 1                       (ou “QUESTÃO 1”)
//   <título da questão>              → bloco 1 (o título também é traduzido)
//   <linha>                          → um bloco por linha não vazia, na ordem e com a pontuação originais
//   QUESTION 2 …

const Q_HEAD = /^(?:QUESTION|QUESTÃO|QUESTAO)\s+(\d+)\s*$/i;

/** Texto do arquivo → { title, questions: [{ n, blocks: [en…] }], errors: [] }. Não altera nenhuma linha. */
export function parseActivity(text) {
  const lines = String(text || '').replace(/^﻿/, '').split(/\r\n|\r|\n/).map((l) => l.trim());
  let title = '';
  const questions = [];
  const errors = [];
  let cur = null;
  for (const line of lines) {
    if (!line) continue;
    const m = line.match(Q_HEAD);
    if (m) { cur = { n: Number(m[1]), blocks: [] }; questions.push(cur); continue; }
    if (cur) cur.blocks.push(line);
    else if (!title) title = line;
  }
  if (!questions.length) errors.push('Nenhuma questão encontrada (as questões começam com “QUESTION 1”, “QUESTION 2”…).');
  questions.forEach((q, i) => {
    if (q.n !== i + 1) errors.push(`A questão ${q.n} está fora de ordem (esperada a ${i + 1}).`);
    if (!q.blocks.length) errors.push(`A questão ${q.n} está vazia.`);
  });
  return { title: title || 'Atividade', questions, errors };
}

/** Identificador estável do conteúdo (mesmo arquivo importado de novo → mesma atividade, respostas mantidas). */
export function activityId(parsed) {
  const src = JSON.stringify([parsed.title, parsed.questions.map((q) => q.blocks)]);
  let x = 0x811c9dc5;
  for (let i = 0; i < src.length; i++) { x ^= src.charCodeAt(i); x = Math.imul(x, 0x01000193) >>> 0; }
  return `a${x.toString(16).padStart(8, '0')}`;
}

/** Atividade nova (sem respostas) a partir do texto analisado. */
export function newActivity(parsed, now = Date.now()) {
  return {
    id: activityId(parsed), title: parsed.title, importedAt: now,
    questions: parsed.questions.map((q) => ({ n: q.n, blocks: q.blocks.slice() })),
    answers: {}, // n → [pt…] (versão atual do aluno; salva enquanto digita)
    done: {}, // n → data em que a questão foi salva/finalizada
    submitted: {}, // n → { at, blocks, check } — primeira versão finalizada (preservada)
    teacher: {}, // n → { blocks, validatedAt|null } — versão corrigida conforme o professor
    pos: { q: 1, b: 0 },
  };
}

export const answersOf = (act, n) => {
  const q = act.questions.find((x) => x.n === n);
  const a = act.answers[n] || [];
  return q ? q.blocks.map((_, i) => a[i] || '') : [];
};
export const missingBlocks = (act, n) => answersOf(act, n).map((t, i) => (t.trim() ? null : i + 1)).filter(Boolean);
export const isDone = (act, n) => !!act.done[n] && !missingBlocks(act, n).length;

/** Resumo da atividade: concluídas, validadas e a questão onde continuar. */
export function summary(act) {
  const total = act.questions.length;
  const done = act.questions.filter((q) => isDone(act, q.n)).length;
  const validated = act.questions.filter((q) => act.teacher[q.n] && act.teacher[q.n].validatedAt).length;
  return { total, done, validated, complete: total > 0 && done === total };
}

/** Pode abrir a questão n? A 1ª sempre; as outras quando a anterior foi concluída (navegação sequencial). */
export const canOpen = (act, n) => n === 1 || isDone(act, n - 1) || !!act.done[n];

/** Salva/finaliza a questão: exige todos os blocos preenchidos; preserva a primeira versão enviada. */
export function finishQuestion(act, n, now = Date.now()) {
  const miss = missingBlocks(act, n);
  if (miss.length) return { ok: false, missing: miss };
  act.done[n] = now;
  if (!act.submitted[n]) {
    const q = act.questions.find((x) => x.n === n);
    const blocks = answersOf(act, n);
    act.submitted[n] = { at: now, blocks, check: blocks.map((pt, i) => checkTranslation(q.blocks[i], pt)) };
  }
  return { ok: true };
}

/** O que falta para exportar (lista vazia = pronto). */
export function exportProblems(act) {
  const out = [];
  for (const q of act.questions) {
    const miss = missingBlocks(act, q.n);
    if (miss.length) out.push(`Questão ${q.n}: ${miss.length === 1 ? 'bloco' : 'blocos'} ${miss.join(', ')} sem tradução`);
    else if (!act.done[q.n]) out.push(`Questão ${q.n}: não foi finalizada`);
  }
  return out;
}

/** TXT para copiar na plataforma do curso: QUESTÃO n, depois cada bloco em inglês seguido da tradução. */
export function exportText(act) {
  if (exportProblems(act).length) return null;
  const parts = act.questions.map((q) => {
    const a = officialAnswers(act, q.n);
    return [`QUESTÃO ${q.n}`, ...q.blocks.flatMap((en, i) => [en, a[i].trim()])].join('\n');
  });
  return `${parts.join('\n\n')}\n`;
}

// ---------- importar respostas (TXT exportado) e correções do professor ----------
// Formato = o da exportação: “QUESTÃO n”, depois cada bloco em inglês seguido da resposta em português. A questão é
// identificada pelo NÚMERO e conferida pelo TEXTO EM INGLÊS de cada bloco (o da atividade já importada no aparelho);
// a resposta é tudo o que fica entre um bloco em inglês e o seguinte — não depende da posição das linhas (aceita
// linhas em branco a mais, resposta em várias linhas, CRLF, título antes da 1ª questão).

/** Atividade validada pelo professor nesta questão? (a versão dele é a resposta oficial) */
export const isValidated = (act, n) => !!(act.teacher[n] && act.teacher[n].validatedAt);
/** Resposta de referência: a validada pelo professor, se houver; senão a do aluno. */
export const officialAnswers = (act, n) => (isValidated(act, n) ? act.teacher[n].blocks.slice() : answersOf(act, n));

const same = (s) => String(s || '').normalize('NFC').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();

/**
 * Lê um TXT de respostas para a atividade `act`. Não altera nada.
 * → { questions: [{ n, answers: [pt…] }], errors: [texto], warnings: [texto], matched }
 *   errors: questão inexistente, repetida, bloco em inglês que não confere, estrutura inesperada (impedem a importação)
 *   warnings: blocos sem resposta (a resposta atual desses blocos é mantida)
 */
export function readAnswers(text, act) {
  const lines = String(text || '').replace(/^﻿/, '').split(/\r\n|\r|\n/).map((l) => l.replace(/\s+$/, ''));
  const sections = [];
  let cur = null;
  for (const line of lines) {
    const m = line.trim().match(Q_HEAD);
    if (m) { cur = { n: Number(m[1]), lines: [] }; sections.push(cur); continue; }
    if (cur) cur.lines.push(line);
  }
  const errors = [], warnings = [], questions = [];
  if (!sections.length) errors.push('Nenhuma questão encontrada no arquivo (as questões começam com “QUESTÃO 1”, “QUESTÃO 2”…).');
  const seen = new Set();
  for (const sec of sections) {
    const q = act.questions.find((x) => x.n === sec.n);
    if (!q) { errors.push(`Questão ${sec.n}: não existe na atividade “${act.title}”.`); continue; }
    if (seen.has(sec.n)) { errors.push(`Questão ${sec.n}: aparece mais de uma vez no arquivo.`); continue; }
    seen.add(sec.n);
    const L = sec.lines;
    const pos = [];
    let from = 0;
    let bad = null;
    for (let k = 0; k < q.blocks.length; k++) {
      let j = from;
      while (j < L.length && same(L[j]) !== same(q.blocks[k])) j++;
      if (j >= L.length) { bad = `Questão ${sec.n}: o bloco ${k + 1} em inglês não foi encontrado (${q.blocks[k].slice(0, 60)}${q.blocks[k].length > 60 ? '…' : ''}) — o arquivo não confere com a atividade.`; break; }
      if (k === 0 && L.slice(0, j).some((x) => x.trim())) { bad = `Questão ${sec.n}: há texto antes do primeiro bloco em inglês.`; break; }
      pos.push(j);
      from = j + 2; // a resposta ocupa ao menos uma linha
    }
    if (bad) { errors.push(bad); continue; }
    const answers = pos.map((p, k) => L.slice(p + 1, k + 1 < pos.length ? pos[k + 1] : L.length).join('\n').trim());
    const empty = answers.map((a, i) => (a ? null : i + 1)).filter(Boolean);
    if (empty.length) warnings.push(`Questão ${sec.n}: ${empty.length === 1 ? 'bloco' : 'blocos'} ${empty.join(', ')} sem resposta no arquivo.`);
    questions.push({ n: sec.n, answers });
  }
  return { questions, errors, warnings, matched: questions.length };
}

/** Entre as atividades do aparelho, a que confere com o arquivo (sem erros e com mais questões identificadas). */
export function matchAnswers(text, activities) {
  let best = null;
  for (const act of activities) {
    const r = readAnswers(text, act);
    const score = (r.errors.length ? 0 : 1e6) + r.matched;
    if (!best || score > best.score) best = { act, ...r, score };
  }
  return best;
}

/** Aplica as respostas do aluno. Questões validadas pelo professor não mudam; bloco vazio no arquivo mantém o atual. */
export function applyOwnAnswers(act, read, now = Date.now()) {
  const updated = [], keptValidated = [];
  for (const { n, answers } of read.questions) {
    if (isValidated(act, n)) { keptValidated.push(n); continue; }
    const cur = answersOf(act, n);
    act.answers[n] = cur.map((old, i) => (answers[i] ? answers[i] : old));
    finishQuestion(act, n, now); // completa → conta como concluída (sem completar, fica em andamento)
    updated.push(n);
  }
  return { updated, keptValidated };
}

/** Aplica as correções do professor: a versão corrigida passa a ser A resposta da questão, validada. */
export function applyTeacherAnswers(act, read, now = Date.now()) {
  const validated = [], incomplete = [];
  for (const { n, answers } of read.questions) {
    if (answers.some((a) => !a)) { incomplete.push(n); continue; }
    act.answers[n] = answers.slice();
    act.teacher[n] = { blocks: answers.slice(), validatedAt: now, imported: true };
    act.done[n] = act.done[n] || now;
    validated.push(n);
  }
  return { validated, incomplete };
}

// ---------- checagem básica (orientação de estudo; NÃO avalia o sentido nem substitui a correção) ----------
const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u2018\u2019]/g, "'").toLowerCase();
const words = (s) => fold(s).match(/[a-z0-9']+/g) || [];
const EN_ONLY = new Set(['the', 'you', 'your', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'i', "i'm", 'my', 'can', 'could', 'would', 'have', 'has', 'what', 'where', 'how', 'this', 'that', 'there', "there's", 'it', "it's", 'we', 'they', 'with', 'for', 'at', 'in', 'on', 'be', 'will', 'please', 'thank', 'thanks', 'yes', 'not', "don't", 'does', 'he', 'she', 'his', 'her', 'him', 'like', 'go', 'get']);
const NEG_EN = /\b(not|no|never|nothing|nobody|none)\b|n't\b/i;
const NEG_PT = /\b(nao|nunca|nenhum|nenhuma|nem|sem|nada|ninguem|jamais)\b/;
// palavras com maiúscula que costumam ser traduzidas (não são nomes próprios a conferir)
const NOT_NAMES = new Set(['i', 'ok', 'mr', 'mrs', 'miss', 'ms', 'sir', 'madam', 'street', 'road', 'hotel', 'restaurant', 'bar', 'show', 'clothes', 'airlines', 'air', 'lines', 'rail', 'travel', 'station', 'phrasal', 'verbs', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'ladies', 'gentlemen', 'yes', 'no', 'hello', 'well']);

/**
 * Checagem básica de uma tradução. Resultado:
 *   level 'ok' (Adequada: nenhum alerta), 'review' (Revisar), 'attention' (Atenção) ou 'empty'.
 *   notes: motivos em português. Heurística local: confere sinais objetivos (texto em inglês, tamanho,
 *   números, nomes próprios, pergunta, negação); não entende o sentido.
 */
export function checkTranslation(en, pt) {
  const t = String(pt || '').trim();
  if (!t) return { level: 'empty', notes: ['Sem tradução.'] };
  const notes = [];
  let level = 'ok';
  const raise = (l, msg) => { notes.push(msg); if (l === 'attention' || level === 'ok') level = l; };
  const ew = words(en), pw = words(t);
  const enShare = pw.length ? pw.filter((w) => EN_ONLY.has(w)).length / pw.length : 0;
  if (fold(t).replace(/\W+/g, '') === fold(en).replace(/\W+/g, '') || enShare >= 0.34) raise('attention', 'Parece ainda estar em inglês.');
  const len = (s) => fold(s).replace(/[^a-z0-9]/g, '').length;
  const ratio = len(t) / Math.max(1, len(en));
  if (len(en) >= 12 && ratio < 0.4) raise('attention', 'Bem mais curta que o original: pode faltar uma parte.');
  else if (len(en) >= 12 && ratio < 0.6) raise('review', 'Mais curta que o original: confira se nada ficou de fora.');
  else if (len(en) >= 12 && ratio > 2.6) raise('review', 'Bem mais longa que o original: confira se não há acréscimos.');
  for (const num of String(en).match(/\d+/g) || []) if (!String(t).includes(num)) raise('review', `O número ${num} do original não aparece.`);
  const names = [];
  const caps = (String(en).match(/[A-Za-z][A-Za-z']*/g) || []);
  const titleCase = caps.filter((w) => /^[A-Z]/.test(w)).length >= caps.length / 2; // títulos: maiúsculas não indicam nomes
  if (!titleCase) String(en).split(/(?<=[.!?:;—"“”])\s+/).forEach((sentence) => {
    (sentence.match(/[A-Za-z][A-Za-z']*/g) || []).slice(1).forEach((w) => { if (/^[A-Z]/.test(w) && !NOT_NAMES.has(fold(w).replace(/'s$/, ''))) names.push(w.replace(/'s$/, '')); });
  });
  const pf = fold(t);
  for (const n of [...new Set(names)]) if (!pf.includes(fold(n).slice(0, 3))) raise('review', `O nome “${n}” não aparece (confira).`);
  if (/\?/.test(en) && !/\?/.test(t)) raise('review', 'O original tem pergunta e a tradução não tem “?”.');
  if (NEG_EN.test(fold(en)) && !NEG_PT.test(fold(t))) raise('review', 'O original tem negação (not, no, never…); confira se a tradução também tem.');
  if (!notes.length) notes.push('Nenhum alerta na checagem básica (ela não avalia o sentido).');
  return { level, notes };
}

export const CHECK_LABEL = { ok: 'Adequada', review: 'Revisar', attention: 'Atenção', empty: 'Sem tradução' };
export const CHECK_CLASS = { ok: 'ok', review: 'warn', attention: 'bad', empty: '' };

/** Pior nível entre os blocos da questão. */
export function questionCheck(act, n) {
  const q = act.questions.find((x) => x.n === n);
  const a = answersOf(act, n);
  const rank = { empty: 3, attention: 2, review: 1, ok: 0 };
  return q.blocks.map((en, i) => checkTranslation(en, a[i])).reduce((w, c) => (rank[c.level] > rank[w] ? c.level : w), 'ok');
}
