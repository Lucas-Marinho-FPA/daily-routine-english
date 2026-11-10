// Atividades do curso (tradução inglês → português). Regras puras, sem DOM.
// O texto das atividades NÃO faz parte do app publicado: o aluno importa o arquivo da atividade no próprio
// aparelho (material de terceiros, sem licença de publicação). Formato aceito:
//   <título da atividade>            (primeira linha não vazia; linhas seguintes até a 1ª questão são ignoradas)
//   QUESTION 1                       (ou “QUESTÃO 1”)
//   <título da questão>              → bloco 1 (o título também é traduzido)
//   <linha>                          → um bloco por linha não vazia, na ordem e com a pontuação originais
//   QUESTION 2 …

import { lemma } from './lexicon.js';
import { isFunctionWord } from './coherence.js';
import { fold, ptContent, stemEq, translationsOf, meaningsOf, glossaryReady } from './glossary.js';

const Q_HEAD = /^(?:QUESTION|QUESTÃO|QUESTAO)\s*(\d+)\s*[:.\-–—]?\s*$/i; // “QUESTION 1”, “Questão 1:”…

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
    edited: {}, // n → data da última alteração da resposta (decide a versão mais nova ao juntar aparelhos)
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
    (act.edited || (act.edited = {}))[n] = now;
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
    (act.edited || (act.edited = {}))[n] = now;
    act.done[n] = act.done[n] || now;
    validated.push(n);
  }
  return { validated, incomplete };
}

// ---------- mesma atividade em vários aparelhos / importações ----------
// A atividade é reconhecida pelo CONTEÚDO em inglês (não pelo título nem pelo arquivo de origem: .txt, .docx e .md do
// mesmo material dão a mesma atividade). Título genérico (“Atividade”) cede lugar ao título real.
export const GENERIC_TITLE = 'Atividade';
export const isGenericTitle = (t) => !t || same(t) === same(GENERIC_TITLE);
export function contentKey(x) {
  const src = JSON.stringify(x.questions.map((q) => [q.n, q.blocks.map(same)]));
  let h = 0x811c9dc5;
  for (let i = 0; i < src.length; i++) { h ^= src.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
export const findSame = (activities, x) => { const k = contentKey(x); return activities.find((a) => contentKey(a) === k) || null; };

/**
 * Junta em `into` o progresso de `from` (mesma atividade): em cada questão fica a versão mais nova.
 * Validação do professor sempre prevalece (entre duas, a mais recente). Não apaga nada que só exista em `into`.
 * → { fromFile: [n], keptHere: [n], validated: [n] }
 */
export function mergeActivity(into, from) {
  const out = { fromFile: [], keptHere: [], validated: [] };
  into.edited = into.edited || {};
  const fe = from.edited || {};
  const has = (a, n) => (a.answers[n] || []).some((x) => (x || '').trim());
  for (const q of into.questions) {
    const n = q.n;
    const lv = isValidated(into, n) ? into.teacher[n].validatedAt : 0;
    const rv = isValidated(from, n) ? from.teacher[n].validatedAt : 0;
    if (lv || rv) {
      if (rv > lv) {
        into.teacher[n] = { ...from.teacher[n], blocks: from.teacher[n].blocks.slice() };
        into.answers[n] = from.teacher[n].blocks.slice();
        into.done[n] = into.done[n] || from.done[n] || rv;
        into.edited[n] = Math.max(fe[n] || 0, rv);
        out.validated.push(n);
      } else out.keptHere.push(n);
      continue;
    }
    if (!has(from, n)) { if (has(into, n)) out.keptHere.push(n); continue; }
    const take = (fe[n] || 0) > (into.edited[n] || 0) || !has(into, n);
    if (!take) { out.keptHere.push(n); continue; }
    into.answers[n] = answersOf(from, n);
    into.edited[n] = fe[n] || Date.now();
    if (from.done[n]) into.done[n] = from.done[n]; else delete into.done[n];
    if (from.submitted[n] && !into.submitted[n]) into.submitted[n] = from.submitted[n];
    if (from.teacher[n] && !into.teacher[n]) into.teacher[n] = from.teacher[n]; // correção em andamento (não validada)
    out.fromFile.push(n);
  }
  if (isGenericTitle(into.title) && !isGenericTitle(from.title)) into.title = from.title;
  return out;
}

// ---------- arquivo de transferência entre aparelhos (diferente do TXT da plataforma do curso) ----------
const TRANSFER_KIND = 'daily-routine-english/curso-transferencia';
export function transferData(act, now = Date.now()) {
  return { kind: TRANSFER_KIND, v: 1, exportedAt: new Date(now).toISOString(), activity: JSON.parse(JSON.stringify(act)) };
}
/** Atividade contida num arquivo de transferência (ou null se o texto não for um). Lança erro se estiver danificado. */
export function readTransfer(text) {
  let d;
  try { d = JSON.parse(String(text || '').replace(/^﻿/, '')); } catch (e) { return null; }
  if (!d || d.kind !== TRANSFER_KIND) return null;
  const a = d.activity;
  if (!a || !Array.isArray(a.questions) || !a.questions.length || a.questions.some((q) => !Array.isArray(q.blocks))) throw new Error('arquivo de transferência danificado');
  return { ...newActivity({ title: a.title || GENERIC_TITLE, questions: a.questions }, a.importedAt || Date.now()), ...a, edited: a.edited || {}, answers: a.answers || {}, done: a.done || {}, submitted: a.submitted || {}, teacher: a.teacher || {} };
}

/** Junta atividades repetidas (mesmo conteúdo) numa só. Devolve quantas foram juntadas. */
export function dedupe(data) {
  const acts = Object.values(data.activities);
  let merged = 0;
  for (const a of acts) {
    if (!data.activities[a.id]) continue;
    for (const b of acts) {
      if (a === b || !data.activities[b.id] || contentKey(a) !== contentKey(b)) continue;
      // fica a de título real (ou a mais antiga); a outra é juntada nela e sai
      const keep = isGenericTitle(a.title) && !isGenericTitle(b.title) ? b : a;
      const drop = keep === a ? b : a;
      mergeActivity(keep, drop);
      delete data.activities[drop.id];
      if (data.last === drop.id) data.last = keep.id;
      merged++;
    }
  }
  // cartão genérico que na verdade é um arquivo de RESPOSTAS importado como atividade (inglês e português intercalados):
  // as traduções vão para as questões ainda sem resposta da atividade verdadeira e o cartão genérico sai
  for (const g of Object.values(data.activities)) {
    if (!isGenericTitle(g.title) || g.questions.some((q) => (g.answers[q.n] || []).some((x) => (x || '').trim()))) continue;
    const text = g.questions.map((q) => [`QUESTÃO ${q.n}`, ...q.blocks].join('\n')).join('\n\n');
    const real = Object.values(data.activities).find((a) => a !== g && !readAnswers(text, a).errors.length);
    if (!real) continue;
    const r = readAnswers(text, real);
    if (r.matched !== g.questions.length) continue;
    const empty = { ...r, questions: r.questions.filter((q) => !answersOf(real, q.n).some((x) => x.trim()) && !isValidated(real, q.n)) };
    applyOwnAnswers(real, empty, g.importedAt || Date.now());
    delete data.activities[g.id];
    if (data.last === g.id) data.last = real.id;
    merged++;
  }
  return merged;
}

// ---------- avaliação automática das traduções (orientação de estudo; não substitui a correção do professor) ----------
// Correspondência de SIGNIFICADO, com evidências — nunca por tamanho, pontuação ou percentual isolado:
//   1. o original é dividido em unidades de sentido: expressões primeiro (“take a message”, “hang up”), depois palavras de
//      conteúdo (sem as gramaticais: isFunctionWord de coherence.js, forma-base com lemma de lexicon.js);
//   2. cada unidade com tradução conhecida (glossário: pares do app, expressões de apoio, FreeDict) é procurada na resposta
//      (raízes do português; variações e paráfrases do glossário contam; o índice inverso aceita sinônimos que voltam à
//      mesma palavra inglesa);
//   3. palavras da resposta reconhecidas com um sentido que NÃO está no original são conteúdo acrescentado;
//      palavras desconhecidas do glossário não contam contra;
//   4. a versão validada pelo professor para o mesmo texto (memória de tradução) tem prioridade.
// Resultados: 'ok' (Adequada), 'incompatible' (Incompatível: mudou o sentido), 'inconclusive' (Inconclusiva: falta
// evidência), 'empty'. Sem glossário carregado, a avaliação de sentido fica inconclusiva.
const words = (s) => fold(s).match(/[a-z0-9']+(?:-[a-z0-9']+)*/g) || [];
const EN_ONLY = new Set(['the', 'you', 'your', 'is', 'are', 'was', 'were', 'to', 'of', 'and', 'i', "i'm", 'my', 'can', 'could', 'would', 'have', 'has', 'what', 'where', 'how', 'this', 'that', 'there', "there's", 'it', "it's", 'we', 'they', 'with', 'for', 'at', 'in', 'on', 'be', 'will', 'please', 'thank', 'thanks', 'yes', 'not', "don't", 'does', 'he', 'she', 'his', 'her', 'him', 'like', 'go', 'get']);
// além de isFunctionWord: modais, interrogativos, contrações e verbos “leves” (o sentido vem do resto da frase)
const WEAK = new Set(`can could would will shall should may might must what where when how who which why yes no well oh ah ahmmm hmmm
  please here there now then really let let's i'm i'll i'd i've you're you'll you'd we're we'll they're it's that's there's what's
  don't can't couldn't won't isn't aren't doesn't didn't wouldn't shouldn't be have do get got go going make made`.split(/\s+/));
const NEG_EN = /\b(not|no|never|nothing|nobody|none)\b|n't\b/i;
// números: “3” no original pode ser “três” na tradução (e o glossário diz que “três” significa “three”)
const EN_NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const PT_NUM = ['zero', 'um uma', 'dois duas', 'tres', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove', 'vinte'].map((x) => x.split(' '));
const numIn = (num, t) => t.includes(num) || (PT_NUM[+num] || []).some((w) => new RegExp(`\\b${w}\\b`).test(fold(t)));
const NEG_PT = /\b(nao|nunca|nenhum|nenhuma|nem|sem|nada|ninguem|jamais)\b/;
// palavras com maiúscula que costumam ser traduzidas (não são nomes próprios a conferir)
const NOT_NAMES = new Set(['i', 'ok', 'mr', 'mrs', 'miss', 'ms', 'sir', 'madam', 'street', 'road', 'hotel', 'restaurant', 'bar', 'show', 'clothes', 'airlines', 'air', 'lines', 'rail', 'travel', 'station', 'phrasal', 'verbs', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'ladies', 'gentlemen', 'yes', 'no', 'hello', 'well']);

// memória de tradução: versões validadas pelo professor (texto em inglês → respostas oficiais)
let memory = new Map();
/** Define a memória a partir das atividades do aparelho (respostas validadas pelo professor). */
export function setMemoryFrom(activities) {
  memory = new Map();
  for (const a of activities) for (const q of a.questions) if (isValidated(a, q.n)) q.blocks.forEach((en, i) => {
    const k = same(en), v = (a.teacher[q.n].blocks[i] || '').trim();
    if (v) memory.set(k, [...(memory.get(k) || []), v]);
  });
}

export function namesIn(en) {
  const names = [];
  const caps = (String(en).match(/[A-Za-z][A-Za-z']*/g) || []);
  const titleCase = caps.filter((w) => /^[A-Z]/.test(w)).length >= caps.length / 2; // títulos: maiúsculas não indicam nomes
  if (!titleCase) String(en).split(/(?<=[.!?:;—"“”])\s+/).forEach((sentence) => {
    (sentence.match(/[A-Za-z][A-Za-z']*/g) || []).slice(1).forEach((w) => { if (/^[A-Z]/.test(w) && !NOT_NAMES.has(fold(w).replace(/'s$/, ''))) names.push(w.replace(/'s$/, '')); });
  });
  return [...new Set(names)];
}

/** Unidades de sentido do original: expressões (mais longas primeiro) e palavras de conteúdo.
 *  Cada unidade traz `i` (posição do 1º token) — usado pelas práticas (engine/coursepractice.js). */
export function unitsOf(en, names) {
  const toks = words(en);
  const skip = new Set(names.map((n) => fold(n)));
  const out = [];
  for (let i = 0; i < toks.length;) {
    let found = null;
    for (let n = Math.min(6, toks.length - i); n >= 2 && !found; n--) {
      const seq = toks.slice(i, i + n);
      for (const k of [seq.join(' '), seq.map(lemma).join(' ')]) { const tr = translationsOf(k); if (tr) { found = { en: k, pts: tr, n }; break; } }
    }
    if (found) { out.push({ ...found, i }); i += found.n; continue; }
    const at = i;
    const w = toks[i++];
    const base = w.replace(/'s$/, '');
    if (isFunctionWord(base) || WEAK.has(w) || WEAK.has(base) || /^\d+$/.test(base) || skip.has(base) || base.length < 2) continue;
    out.push({ en: base, pts: translationsOf(base) || translationsOf(lemma(base)) || translationsOf(base.replace(/es$/, '')) || null, n: 1, i: at });
  }
  return { toks, units: out };
}

/** A tradução `v` (do glossário) aparece na resposta? Marca as palavras da resposta usadas. */
function variantIn(v, ans, plain, used) {
  const vc = ptContent(v);
  if (!vc.length) return plain.includes(` ${fold(v).replace(/[^a-z0-9]+/g, ' ').trim()} `);
  const hits = vc.map((c) => ans.findIndex((a) => stemEq(a.s, c.s))).filter((k) => k >= 0);
  const need = vc.length <= 2 ? vc.length : Math.ceil((vc.length * 2) / 3);
  if (hits.length < need) return false;
  hits.forEach((k) => used.add(k));
  return true;
}

/** Avaliação de uma tradução. → { level, notes, missing: [en], added: [pt] } */
export function checkTranslation(en, pt) {
  const t = String(pt || '').trim();
  if (!t) return { level: 'empty', notes: ['Sem tradução.'], missing: [], added: [] };
  const notes = [];
  const pw = words(t);
  const enShare = pw.length ? pw.filter((w) => EN_ONLY.has(w)).length / pw.length : 0;
  if (fold(t).replace(/\W+/g, '') === fold(en).replace(/\W+/g, '') || enShare >= 0.34) {
    return { level: 'incompatible', notes: ['Parece não estar traduzida (ainda em inglês).'], missing: [], added: [] };
  }
  // sinais estruturais: não reprovam sozinhos, mas impedem “Adequada”
  const blocking = [];
  const len = (s) => fold(s).replace(/[^a-z0-9]/g, '').length;
  if (len(en) >= 12 && len(t) / Math.max(1, len(en)) < 0.4) blocking.push('Bem mais curta que o original: pode faltar uma parte.');
  for (const num of String(en).match(/\d+/g) || []) if (!numIn(num, t)) blocking.push(`O número ${num} do original não aparece.`);
  const names = namesIn(en);
  const pf = fold(t);
  for (const n of names) if (!pf.includes(fold(n).slice(0, 3))) blocking.push(`O nome “${n}” não aparece (confira).`);
  if (NEG_EN.test(fold(en)) && !NEG_PT.test(pf)) blocking.push('O original tem negação (not, no, never…) e a tradução não.');
  const minor = /\?/.test(en) && !/\?/.test(t) ? ['O original é uma pergunta e a tradução não tem “?”.'] : [];

  // memória: versão validada pelo professor para o mesmo texto em inglês (prioridade)
  const refs = memory.get(same(en)) || [];
  const flat = (s) => fold(s).replace(/[^a-z0-9]+/g, ' ').trim();
  if (refs.some((r) => flat(r) === flat(t))) return { level: 'ok', notes: ['Igual à versão validada pelo professor.'], missing: [], added: [] };
  const ans = ptContent(t);
  let bestRef = 0;
  for (const r of refs) {
    const rc = ptContent(r);
    if (rc.length) bestRef = Math.max(bestRef, rc.filter((c) => ans.some((a) => stemEq(a.s, c.s))).length / rc.length);
  }
  if (bestRef >= 0.6 && !blocking.length) return { level: 'ok', notes: ['Próxima da versão validada pelo professor.', ...minor], missing: [], added: [] };

  if (!glossaryReady()) return { level: 'inconclusive', notes: ['Avaliação de sentido indisponível (glossário não carregado).', ...blocking, ...minor], missing: [], added: [] };
  const { toks, units } = unitsOf(en, names);
  const srcLemmas = new Set(toks.flatMap((w) => [w, lemma(w), w.replace(/'s$/, ''), w.replace(/es$/, ''), ...(/^\d+$/.test(w) && EN_NUM[+w] ? [EN_NUM[+w]] : [])]));
  const plain = ` ${flat(t)} `;
  const used = new Set();
  const known = units.filter((u) => u.pts);
  const matched = new Set();
  for (const u of known) if (u.pts.some((v) => variantIn(v, ans, plain, used))) matched.add(u);
  // palavras de qualquer variante de uma unidade encontrada (“deixar” em “deixar recado”) não são acréscimo
  const variantStems = [...matched].flatMap((u) => u.pts.flatMap((v) => ptContent(v).map((c) => c.s)));
  ans.forEach((a, k) => { if (variantStems.some((s) => stemEq(s, a.s))) used.add(k); });
  const relates = (e, w) => e === w || lemma(e) === lemma(w) || e.split(' ').some((x) => x === w || lemma(x) === lemma(w));
  // palavras da resposta ainda não explicadas: sinônimo que volta a uma palavra do original (conta como encontrada),
  // sentido reconhecido que não está no original (acrescentado) ou desconhecida (não conta contra)
  const added = [];
  ans.forEach((a, k) => {
    if (used.has(k) || srcLemmas.has(a.w)) return;
    const m = meaningsOf(a.s);
    if (!m) return;
    const hit = known.find((u) => !matched.has(u) && [...m].some((e) => relates(e, u.en)));
    if (hit) { matched.add(hit); return; }
    if ([...m].some((e) => [...srcLemmas].some((w) => relates(e, w)))) return;
    added.push(`${a.w} (${[...m].slice(0, 2).join(', ')})`);
  });
  const missing = known.filter((u) => !matched.has(u)).map((u) => `${u.en} → ${u.pts.slice(0, 3).join(' / ')}`);
  const cov = known.length ? matched.size / known.length : 0;
  const why = [
    ...(missing.length ? [`Não identificado na resposta: ${missing.join('; ')}.`] : []),
    ...(added.length ? [`Acrescentado (não está no original): ${added.join('; ')}.`] : []),
  ];
  let level;
  if ((known.length && !matched.size && added.length) || (!units.length && added.length)) level = 'incompatible'; // nada do original + conteúdo novo
  else if (added.length >= 2 && cov < 0.5) level = 'incompatible';
  else if (added.length >= 3 && added.length > matched.size / 2) level = 'incompatible'; // acrescenta conteúdo que muda o sentido
  else if (known.length && cov >= 0.6 && (added.length === 0 || (cov >= 0.75 && added.length <= 1)) && !blocking.length) level = 'ok';
  else level = 'inconclusive';
  if (level === 'inconclusive' && !known.length) why.unshift('O glossário não cobre as palavras desta frase: não dá para avaliar o sentido com segurança.');
  if (level === 'ok') why.unshift(`Sentido do original identificado (${matched.size} de ${known.length} ${known.length === 1 ? 'elemento' : 'elementos'}).`);
  if (level === 'incompatible') why.unshift('A resposta não preserva o sentido do original.');
  return { level, notes: [...why, ...blocking, ...minor], missing, added };
}

// rótulos (inclui os níveis antigos guardados em “submitted.check” de versões anteriores)
export const CHECK_LABEL = { ok: 'Adequada', incompatible: 'Incompatível', inconclusive: 'Inconclusiva', review: 'Revisar', attention: 'Atenção', empty: 'Sem tradução' };
export const CHECK_CLASS = { ok: 'ok', incompatible: 'bad', inconclusive: 'warn', review: 'warn', attention: 'bad', empty: '' };

/** Pior nível entre os blocos da questão. */
export function questionCheck(act, n) {
  const q = act.questions.find((x) => x.n === n);
  const a = answersOf(act, n);
  const rank = { empty: 3, incompatible: 2, attention: 2, inconclusive: 1, review: 1, ok: 0 };
  return q.blocks.map((en, i) => checkTranslation(en, a[i])).reduce((w, c) => (rank[c.level] > rank[w] ? c.level : w), 'ok');
}
