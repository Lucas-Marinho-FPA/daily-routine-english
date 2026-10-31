#!/usr/bin/env node
// Monta o conteúdo do app a partir da extração fiel do Word (content/word) e da curadoria (content/enrich).
// Episódios (content/enrich/episodes.json, Lucas 2.0): rotinas novas R11+ no mesmo formato, marcadas como conteúdo
// novo (source 'new', kind 'episode'); R01–R10 continuam com o texto do Word e só ganham metadados e perguntas novas.
// Saídas:
//   app/data/content.js              → window.DRG_CONTENT (carregado pelo app, funciona até em file://)
//   content/build/content.json       → mesma estrutura, para testes e inspeção
//   content/build/audio-manifest.json→ textos que precisam de áudio
//   docs/CONTENT_INTEGRITY_REPORT.md → relatório de validação
// Sai com código 1 se houver erro de validação bloqueante.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { wordTokens, findPattern, splitSentences, audioKey, basicNormalise } from '../app/js/engine/text.js';
import { practiceCandidates, wordAudioText } from '../app/js/engine/wordfeedback.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const word = read('content/word/word-extract.json');
const E = {
  items: read('content/enrich/items.json'),
  structure: read('content/enrich/structure.json'),
  questions: read('content/enrich/questions.json'),
  language: read('content/enrich/language.json'),
  review: read('content/enrich/review-log.json'),
  episodes: read('content/enrich/episodes.json'),
};
const PRIVATE = new RegExp(Buffer.from('XGIoPzppdGFbdcO6XXxFQUN8cGVyc29ubmFsaXRcdyp8bGFzdHJvKVxi', 'base64').toString('utf8'), 'i'); // nomes privados protegidos (codificados de propósito) // nada identificador nos textos novos (ver tools/privacy_sanitize.py)

const errors = [];   // bloqueantes
const warnings = []; // revisão humana
const slug = (s) => basicNormalise(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const CATS = new Set(E.structure.categories.map((c) => c.id));
const CTXS = new Set(E.structure.contexts.map((c) => c.id));

// ---------- 1. Rotinas, blocos e frases ----------
const routines = [];
const sentences = {};
const blocks = {};
for (const r of word.routines) {
  const meta = E.structure.routines[r.id];
  if (!meta) { errors.push(`Rotina ${r.id} sem metadados em structure.json`); continue; }
  if (r.en.length !== r.pt.length) errors.push(`${r.id}: ${r.en.length} parágrafos EN × ${r.pt.length} PT`);
  if (meta.blocks.length !== r.en.length) errors.push(`${r.id}: contextos para ${meta.blocks.length} blocos, mas há ${r.en.length}`);
  const blockIds = [];
  r.en.forEach((para, bi) => {
    const bid = `${r.id}-B${bi + 1}`;
    const en = splitSentences(para);
    const pt = splitSentences(r.pt[bi] || '');
    if (en.length !== pt.length) errors.push(`${bid}: ${en.length} frases EN × ${pt.length} PT`);
    const ctx = meta.blocks[bi] || [];
    ctx.forEach((c) => { if (!CTXS.has(c)) errors.push(`${bid}: contexto inválido ${c}`); });
    const sids = en.map((s, si) => {
      const sid = `${bid}-S${si + 1}`;
      sentences[sid] = { id: sid, en: s, pt: pt[si] || '', routine: r.id, block: bid, ctx, items: [] };
      return sid;
    });
    blocks[bid] = { id: bid, routine: r.id, index: bi + 1, en: para, pt: r.pt[bi], ctx, sentences: sids };
    blockIds.push(bid);
  });
  const ex = E.episodes.existing[r.id] || {};
  routines.push({
    id: r.id, title: r.title, pt: meta.pt, goal: r.goal, dayType: meta.dayType, priority: !!meta.priority,
    blocks: blockIds, usage: r.usage, questions: [], items: [],
    kind: 'routine', stage: ex.stage || null, grammar: ex.grammar || null,
  });
}

// 1b. Episódios (ficção narrativa ancorada no perfil): mesmo formato de rotina, blocos e frases
const WORD_ROUTINES = new Set(routines.map((r) => r.id));
const profileFacts = new Set(E.episodes.profile.facts.map((f) => f.id));
for (const ep of E.episodes.routines) {
  if (WORD_ROUTINES.has(ep.id) || routines.some((r) => r.id === ep.id)) { errors.push(`Episódio ${ep.id}: ID já usado`); continue; }
  if (!['A', 'B', 'C', 'D'].includes(ep.stage) || !ep.goal || !ep.grammar) errors.push(`${ep.id}: episódio sem etapa, objetivo ou foco linguístico`);
  if (!(ep.basis || []).length || ep.basis.some((f) => !profileFacts.has(f))) errors.push(`${ep.id}: fatos de base ausentes ou inexistentes`);
  const blockIds = [];
  ep.blocks.forEach((b, bi) => {
    const bid = `${ep.id}-B${bi + 1}`;
    (b.ctx || []).forEach((c) => { if (!CTXS.has(c)) errors.push(`${bid}: contexto inválido ${c}`); });
    const sids = b.sentences.map((x, si) => {
      const sid = `${bid}-S${si + 1}`;
      if (b.kind === 'dialogue' && (!x.speaker || !x.pt.includes(': '))) errors.push(`${sid}: fala sem quem fala (speaker / “Nome: …” na tradução)`);
      if (b.kind !== 'dialogue' && x.speaker) errors.push(`${sid}: speaker fora de bloco de diálogo`);
      if (PRIVATE.test(x.en) || PRIVATE.test(x.pt)) errors.push(`${sid}: dado identificador no texto`);
      sentences[sid] = { id: sid, en: x.en, pt: x.pt, routine: ep.id, block: bid, ctx: b.ctx, items: [], ...(x.speaker ? { speaker: x.speaker } : {}) };
      return sid;
    });
    blocks[bid] = { id: bid, routine: ep.id, index: bi + 1, en: sids.map((x) => sentences[x].en).join(' '), pt: sids.map((x) => sentences[x].pt).join(' '), ctx: b.ctx, sentences: sids, title: b.pt, ...(b.kind === 'dialogue' ? { kind: 'dialogue' } : {}) };
    blockIds.push(bid);
  });
  routines.push({ id: ep.id, title: ep.title, pt: ep.pt, goal: ep.goal, dayType: 'episode', priority: false, blocks: blockIds, usage: ep.usage || [], questions: [], items: [],
    kind: 'episode', stage: ep.stage, grammar: ep.grammar, basis: ep.basis, source: 'new', universe: ep.universe || null, traits: ep.traits || [] });
  const unknownTraits = (ep.traits || []).filter((t) => !E.episodes.profile.traits.includes(t));
  if (!ep.universe || !(ep.traits || []).length || unknownTraits.length) errors.push(`${ep.id}: universo/traços ausentes ou fora do perfil (${unknownTraits.join(', ')})`);
}

// ---------- 2. Itens ----------
const items = {};
const byKey = new Map(); // inglês normalizado → id
const aliases = E.items.aliases;
const itemId = (en) => 'it.' + slug(en);

function addItem(en, data) {
  const key = basicNormalise(en);
  if (byKey.has(key)) return items[byKey.get(key)];
  let id = itemId(en);
  if (items[id]) id = id + '-' + Object.keys(items).length;
  const it = {
    id, en, pt: '', ptAlt: [], c: null, tags: [], lvl: null, v: [], notes: [], ipa: null, tip: null,
    ex: [], routines: [], blocks: [], sentences: [], ctx: [], source: null, srcRefs: [], match: null, ...data,
  };
  items[id] = it;
  byKey.set(key, id);
  return it;
}

// 2a. linhas de tabela do Word (176)
let tableRows = 0;
const tableRowRefs = [];
function ingestRow(row, ref, routineId) {
  tableRows++;
  const raw = basicNormalise(row.en);
  const canonical = aliases[row.en.toLowerCase()] ? basicNormalise(aliases[row.en.toLowerCase()]) : raw;
  const cur = E.items.table[row.en.toLowerCase()] || E.items.table[canonical] || {};
  let it = byKey.has(canonical) ? items[byKey.get(canonical)] : null;
  if (!it) {
    const enText = aliases[row.en.toLowerCase()] || row.en;
    it = addItem(enText, { source: 'word', pt: row.pt });
  }
  if (row.en.toLowerCase() !== basicNormalise(it.en) && !it.v.includes(row.en)) {
    // ex.: “start up / boot up” → item “start up”; a forma combinada vira referência
  }
  if (!it.pt) it.pt = row.pt;
  else if (row.pt && row.pt !== it.pt && !it.ptAlt.includes(row.pt)) it.ptAlt.push(row.pt);
  if (row.note) it.notes.push({ text: row.note, src: ref });
  it.srcRefs.push(ref);
  if (routineId && !it.routines.includes(routineId)) it.routines.push(routineId);
  const merged = E.items.table[basicNormalise(it.en)] || cur;
  Object.assign(it, {
    c: it.c || merged.c || null,
    tags: [...new Set([...(it.tags || []), ...(merged.tags || [])])],
    lvl: it.lvl || merged.lvl || null,
    v: [...new Set([...(it.v || []), ...(merged.v || [])])],
    ipa: it.ipa || merged.ipa || null,
    tip: it.tip || merged.tip || null,
    match: it.match || merged.match || null,
  });
  if (merged.ex && !it.ex.some((x) => x.src === 'new')) it.ex.push({ ...merged.ex, src: 'new' });
  tableRowRefs.push({ ref, en: row.en, item: it.id });
}
for (const r of word.routines) {
  r.vocab.forEach((row, i) => ingestRow(row, `${r.id}.vocab.${i + 1}`, r.id));
  r.phrasal.forEach((row, i) => ingestRow(row, `${r.id}.phrasal.${i + 1}`, r.id));
}
for (const key of ['structures', 'simplePresent', 'phrasalReview']) {
  word.toolkit[key].forEach((row, i) => ingestRow(row, `toolkit.${key}.${i + 1}`, null));
}

// 2b. itens novos / derivados
for (const n of E.items.new) {
  if (byKey.has(basicNormalise(n.en))) { warnings.push(`Item novo duplica item existente: “${n.en}”`); continue; }
  const it = addItem(n.en, {
    pt: n.pt, c: n.c, tags: n.tags || [], lvl: n.lvl || null, v: n.v || [], ipa: n.ipa || null, tip: n.tip || null,
    match: n.match || null, source: n.source || 'new', srcRefs: [n.source === 'derived' ? 'derived-from-text' : 'new'],
  });
  if (n.ex) it.ex.push({ ...n.ex, src: 'new' });
  if (n.third) it.third = n.third;
}

// 2b'. itens novos dos episódios: localizados SÓ nas frases dos episódios (não mudam as rotinas do Word)
const episodeOnly = new Set();
for (const n of E.episodes.items) {
  if (byKey.has(basicNormalise(n.en))) { errors.push(`Item de episódio duplica item existente: “${n.en}” (reaproveite o item existente)`); continue; }
  const it = addItem(n.en, { pt: n.pt, c: n.c, tags: ['episode'], lvl: n.lvl || null, v: n.v || [], tip: n.tip || null, match: n.match || null, source: 'new', srcRefs: ['episodes'] });
  episodeOnly.add(it.id);
}

// 2c. verbos (Simple Present)
const verbs = E.items.verbs.map((v) => ({ id: 'vb.' + slug(v.base), ...v, source: 'derived', ex: [] }));

// ---------- 3. Localizar itens nas frases ----------
const sentenceList = Object.values(sentences);
for (const it of Object.values(items)) {
  const isGrammarModel = it.c === 'sentence' && it.tags.includes('grammar-model');
  const pattern = (it.match || it.en).split(' / ')[0];
  const separable = it.c === 'phrasal';
  for (const s of isGrammarModel ? [] : episodeOnly.has(it.id) ? sentenceList.filter((x) => !WORD_ROUTINES.has(x.routine)) : sentenceList) {
    const hit = findPattern(pattern, wordTokens(s.en), { separable });
    if (hit) {
      it.sentences.push(s.id);
      s.items.push(it.id);
      (s._pos ||= {})[it.id] = hit[0];
      if (!it.blocks.includes(s.block)) it.blocks.push(s.block);
      if (!it.routines.includes(s.routine)) it.routines.push(s.routine);
    }
  }
  // exemplo: frase do texto (prioridade R01), depois nota da tabela em inglês, depois exemplo novo.
  // Frases de episódio não substituem o exemplo de antes: entram depois, como exemplo adicional.
  const sorted = it.sentences.filter((sid) => WORD_ROUTINES.has(sentences[sid].routine) || episodeOnly.has(it.id)).sort();
  const epEx = it.sentences.filter((sid) => !WORD_ROUTINES.has(sentences[sid].routine)).sort()[0];
  if (sorted.length) {
    const s = sentences[sorted[0]];
    it.ex.unshift({ en: s.en, pt: s.pt, src: s.id });
  } else {
    const noteEx = it.notes.find((n) => /^[A-Z][a-z].*[a-z.]$/.test(n.text) && !/[ãçáéíóúâêô]/i.test(n.text) && findPattern(pattern, wordTokens(n.text), { separable }));
    if (noteEx) it.ex.unshift({ en: noteEx.text, pt: '', src: noteEx.src + ' (nota)' });
    else {
      const qa = [...word.routines.flatMap((r) => r.questions.map((q, i) => [`${r.id}.Q${i + 1}`, q.a])),
        ...word.generalQuestions.map((q, i) => [`G.Q${String(i + 1).padStart(2, '0')}`, q.a])]
        .find(([, a]) => findPattern(pattern, wordTokens(a), { separable }));
      if (qa && !isGrammarModel) it.ex.unshift({ en: qa[1], pt: '', src: qa[0] });
    }
  }
  if (epEx && !episodeOnly.has(it.id) && !it.ex.some((x) => x.src === epEx)) it.ex.push({ en: sentences[epEx].en, pt: sentences[epEx].pt, src: epEx });
  if (it.source === 'word' && !it.sentences.some((sid) => WORD_ROUTINES.has(sentences[sid].routine))) it.source = 'word-table-only';
  // contextos
  const ctx = new Set();
  it.blocks.forEach((b) => blocks[b].ctx.forEach((c) => ctx.add(c)));
  if (!ctx.size) {
    it.routines.forEach((rid) => routines.find((r) => r.id === rid).blocks.forEach((b) => blocks[b].ctx.forEach((c) => ctx.add(c))));
  }
  if (!ctx.size) ctx.add('full');
  it.ctx = [...ctx];
  // nível automático quando a curadoria não define
  if (!it.lvl) it.lvl = Math.min(5, 1 + Math.floor(wordTokens(it.en).length / 2));
}
for (const s of sentenceList) { s.items.sort((a, b) => s._pos[a] - s._pos[b]); delete s._pos; }
// frase de episódio sem item seria liberada logo no início (o motor libera frases sem itens): o episódio precisa ensinar algo rastreável
for (const s of sentenceList) if (!WORD_ROUTINES.has(s.routine) && !s.items.length) errors.push(`${s.id}: frase de episódio sem nenhum item (“${s.en}”)`);
for (const v of verbs) {
  const s = sentenceList.find((x) => findPattern(v.third, wordTokens(x.en)) || findPattern(v.base, wordTokens(x.en)));
  if (s) v.ex.push({ en: s.en, pt: s.pt, src: s.id });
}
for (const r of routines) {
  const set = new Set();
  r.blocks.forEach((b) => blocks[b].sentences.forEach((sid) => sentences[sid].items.forEach((i) => set.add(i))));
  r.items = [...set];
}

// ---------- 4. Perguntas ----------
const questions = {};
const kwOverride = E.questions.keywords;
const STOP = new Set(E.language.stopwords);
function autoKeywords(answer) {
  const seen = new Set();
  return wordTokens(answer).filter((t) => !STOP.has(t) && t.length > 2 && !seen.has(t) && seen.add(t)).slice(0, 7).map((t) => [t]);
}
function addQuestion(id, q, a, extra) {
  const epQ = extra.routine && !WORD_ROUTINES.has(extra.routine); // itens novos dos episódios só contam nas perguntas dos episódios
  const itemsIn = Object.values(items).filter((it) => it.c !== 'sentence' && (epQ || !episodeOnly.has(it.id)) && findPattern((it.match || it.en).split(' / ')[0], wordTokens(a), { separable: it.c === 'phrasal' })).map((it) => it.id);
  questions[id] = { id, q, a, keywords: kwOverride[id] || (a ? autoKeywords(a) : []), items: itemsIn, ...extra };
}
word.routines.forEach((r) => r.questions.forEach((qa, i) => {
  const id = `${r.id}.Q${i + 1}`;
  addQuestion(id, qa.q, qa.a, { routine: r.id, source: 'word' });
  routines.find((x) => x.id === r.id).questions.push(id);
}));
word.generalQuestions.forEach((qa, i) => addQuestion(`G.Q${String(i + 1).padStart(2, '0')}`, qa.q, qa.a, { routine: null, source: 'word' }));
E.questions.new.forEach((qa, i) => addQuestion(`N.Q${String(i + 1).padStart(2, '0')}`, qa.q, qa.a, {
  routine: null, source: 'new', facts: qa.facts, openPersonal: !!qa.openPersonal, hint: qa.hint || null,
}));
// perguntas dos episódios e perguntas novas das rotinas do Word: numeração continua depois das existentes
for (const qa of E.episodes.questions) {
  const r = routines.find((x) => x.id === qa.routine);
  if (!r) { errors.push(`Pergunta de episódio: rotina inexistente ${qa.routine}`); continue; }
  if (!['conv', 'comp', 'transfer'].includes(qa.kind)) errors.push(`${qa.routine}: tipo de pergunta inválido ${qa.kind}`);
  if (qa.kind === 'transfer' ? (qa.a || !qa.hint) : !qa.a) errors.push(`${qa.routine}: “${qa.q}” — transferência precisa de dica e resposta vazia; as outras, de resposta-modelo`);
  if (PRIVATE.test(qa.q) || PRIVATE.test(qa.a || '') || PRIVATE.test(qa.hint || '')) errors.push(`${qa.routine}: dado identificador na pergunta`);
  const id = `${r.id}.Q${r.questions.length + 1}`;
  const itemsBefore = Object.keys(questions).length;
  addQuestion(id, qa.q, qa.a || '', { routine: r.id, source: 'new', kind: qa.kind, openPersonal: qa.kind === 'transfer', hint: qa.hint || null, facts: qa.kind === 'transfer' ? [] : [r.id] }); // a resposta vem do texto da rotina/episódio
  if (qa.keywords) questions[id].keywords = qa.keywords;
  if (Object.keys(questions).length === itemsBefore) errors.push(`${id}: ID de pergunta duplicado`);
  r.questions.push(id);
}

// REV: alternativa aceita / notas
for (const rev of E.review.rev) {
  if (rev.altAnswer && questions[rev.where]) questions[rev.where].altAnswers = [rev.altAnswer];
  if (rev.altAnswer && questions[rev.where]) questions[rev.where].reviewNote = rev.note;
  if (rev.ptAlt) for (const [en, alts] of Object.entries(rev.ptAlt)) {
    const it = items[byKey.get(basicNormalise(en))];
    if (it) it.ptAlt.push(...alts); else errors.push(`${rev.id}: item ${en} inexistente`);
  }
}

// ---------- 5. Validação ----------
const ids = [...Object.keys(items), ...Object.keys(sentences), ...Object.keys(questions), ...verbs.map((v) => v.id), ...routines.map((r) => r.id), ...Object.keys(blocks)];
const dupIds = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dupIds.length) errors.push(`IDs duplicados: ${dupIds.join(', ')}`);
for (const it of Object.values(items)) {
  if (!it.en) errors.push(`${it.id}: sem inglês`);
  if (!it.pt) errors.push(`${it.id}: tradução vazia`);
  if (!CATS.has(it.c)) errors.push(`${it.id} (“${it.en}”): categoria ausente/inválida (${it.c})`);
  if (!it.ctx.length) errors.push(`${it.id}: sem contexto`);
  if (!it.source) errors.push(`${it.id}: sem origem`);
  if (!it.ex.length && it.c !== 'connector' && !it.tags.includes('grammar-model')) warnings.push(`${it.id} (“${it.en}”): sem exemplo`);
}
for (const s of sentenceList) {
  if (!s.en || !s.pt) errors.push(`${s.id}: frase sem EN/PT`);
  s.items.forEach((i) => { if (!items[i]) errors.push(`${s.id}: referência quebrada ${i}`); });
}
for (const q of Object.values(questions)) {
  if (!q.q) errors.push(`${q.id}: pergunta vazia`);
  if (!q.a && !q.openPersonal) errors.push(`${q.id}: resposta-modelo vazia`);
  q.items.forEach((i) => { if (!items[i]) errors.push(`${q.id}: referência quebrada ${i}`); });
}
// variantes contraditórias: uma variante não pode disparar uma regra de erro
const errRes = E.language.errors.map((e) => ({ ...e, rx: new RegExp(e.re, 'i') }));
for (const it of Object.values(items)) {
  for (const v of [it.en, ...it.v]) {
    const bad = errRes.find((e) => !e.soft && e.rx.test(basicNormalise(v)));
    if (bad) errors.push(`${it.id}: forma aceita “${v}” dispara a regra de erro ${bad.id}`);
  }
  const vset = new Set(it.v.map(basicNormalise));
  if (vset.has(basicNormalise(it.en))) warnings.push(`${it.id}: variante igual à forma principal`);
}
for (const s of sentenceList) {
  const bad = errRes.find((e) => !e.soft && e.rx.test(basicNormalise(s.en)));
  if (bad) errors.push(`${s.id}: texto-modelo dispara a regra de erro ${bad.id} (“${s.en}”)`);
}
for (const q of Object.values(questions)) {
  const bad = errRes.find((e) => !e.soft && q.a && e.rx.test(basicNormalise(q.a)));
  if (bad) errors.push(`${q.id}: resposta-modelo dispara a regra de erro ${bad.id}`);
}
// duplicações desnecessárias: mesmo texto inglês em itens distintos
const enSeen = new Map();
for (const it of Object.values(items)) {
  const k = basicNormalise(it.en).replace(/[.…]+$/, '');
  if (enSeen.has(k)) warnings.push(`Possível duplicação: ${enSeen.get(k)} e ${it.id} (“${it.en}”)`);
  else enSeen.set(k, it.id);
}
// cobertura do Word
const coverage = {
  routines: [routines.filter((r) => WORD_ROUTINES.has(r.id)).length, 10],
  paragraphs: [Object.values(blocks).filter((b) => WORD_ROUTINES.has(b.routine)).length, word.routines.reduce((n, r) => n + r.en.length, 0)],
  episodes: [routines.filter((r) => r.kind === 'episode').length, null],
  sentences: [sentenceList.length, null],
  tableRows: [tableRowRefs.length, 176],
  questionsWord: [Object.values(questions).filter((q) => q.source === 'word').length, 51],
  usageNotes: [routines.filter((r) => WORD_ROUTINES.has(r.id)).reduce((n, r) => n + r.usage.length, 0), 22],
  toolkitStructures: [word.toolkit.structures.length, 12],
  drills: [word.drills.length, 3],
  checklist: [word.checklist.length, 6],
};
for (const [k, [got, want]] of Object.entries(coverage)) if (want !== null && got !== want) errors.push(`Cobertura ${k}: ${got} de ${want}`);

// ---------- 6. Saídas ----------
const content = {
  version: '1.0.0',
  builtAt: new Date().toISOString().slice(0, 10),
  source: word.source,
  meta: { intro: word.intro, howToUse: word.howToUse, standards: word.standards, mainGoal: word.mainGoal },
  contexts: E.structure.contexts, categories: E.structure.categories, dayTypes: E.structure.dayTypes,
  routines, blocks, sentences, items, verbs, questions,
  toolkit: { intro: word.toolkit.intro },
  drills: word.drills, checklist: word.checklist,
  language: { contractions: E.language.contractions, spellingAmE: E.language.spellingAmE, synonyms: E.language.synonyms.groups,
    errors: E.language.errors, stopwords: E.language.stopwords, determiners: E.language.determiners, numberWords: E.language.numberWords },
  review: E.review,
};
mkdirSync(join(ROOT, 'app/data'), { recursive: true });
mkdirSync(join(ROOT, 'content/build'), { recursive: true });

// manifesto de áudio (a chave é gravada em cada entidade, campo "au")
const audio = new Map();
const addAudio = (text, kind) => {
  if (!text) return null;
  const k = audioKey(text);
  if (!audio.has(k)) audio.set(k, { key: k, text, kind });
  return k;
};
sentenceList.forEach((s) => { s.au = addAudio(s.en, 'sentence'); });
Object.values(items).forEach((it) => { it.au = addAudio(it.en.replace(/…$/, '').trim(), 'item'); it.ex.forEach((x) => { x.au = addAudio(x.en, 'example'); }); });
verbs.forEach((v) => { v.au = addAudio(v.base, 'verb'); v.au3 = addAudio(v.third, 'verb'); v.ex.forEach((x) => { x.au = addAudio(x.en, 'example'); }); });
Object.values(questions).forEach((q) => { q.au = addAudio(q.q, 'question'); q.aau = addAudio(q.a, 'answer'); q.altAu = (q.altAnswers || []).map((a) => addAudio(a, 'answer')); });
content.drills = word.drills.map((d) => ({ ...d, au: d.prompts.map((p) => addAudio(p, 'drill')) }));
// palavras isoladas para a lista “Vamos praticar” do Speaking Lab (mesma voz das frases; chave = audioKey(wordAudioText))
for (const t of [...sentenceList.map((s) => s.en), ...Object.values(questions).map((q) => q.a).filter(Boolean)]) {
  for (const seg of practiceCandidates(t)) addAudio(wordAudioText(seg), 'word');
}
// conteúdo idêntico ao do build anterior: mantém a data, para não gerar diferença só de timestamp em data/content.js
try {
  const prev = JSON.parse(readFileSync(join(ROOT, 'content/build/content.json'), 'utf8'));
  if (JSON.stringify({ ...content, builtAt: prev.builtAt }) === JSON.stringify(prev)) content.builtAt = prev.builtAt;
} catch (e) { /* primeiro build */ }
writeFileSync(join(ROOT, 'content/build/audio-manifest.json'), JSON.stringify([...audio.values()], null, 1));
writeFileSync(join(ROOT, 'content/build/content.json'), JSON.stringify(content, null, 1));
writeFileSync(join(ROOT, 'app/data/content.js'),
  `// GERADO por tools/build-content.mjs — não edite. Fonte: content/word + content/enrich.\nwindow.DRG_CONTENT = ${JSON.stringify(content)};\n`);


// relatório
const count = (pred) => Object.values(items).filter(pred).length;
const byCat = E.structure.categories.map((c) => `| ${c.pt} | ${count((it) => it.c === c.id)} |`).join('\n');
const bySrc = ['word', 'word-table-only', 'derived', 'new'].map((s) => `| ${s} | ${count((it) => it.source === s)} |`).join('\n');
const byCtx = E.structure.contexts.map((c) => `| ${c.pt} | ${count((it) => it.ctx.includes(c.id))} | ${sentenceList.filter((s) => s.ctx.includes(c.id)).length} |`).join('\n');
const sample = Object.values(items).filter((_, i) => i % 9 === 0).slice(0, 22)
  .map((it) => `| \`${it.id}\` | ${it.en} | ${it.pt} | ${it.c} | ${it.source} | ${it.sentences.slice(0, 3).join(', ') || '—'} |`).join('\n');
const report = `# CONTENT_INTEGRITY_REPORT

Gerado por \`tools/build-content.mjs\` em ${content.builtAt}. Fonte: Word (sha256 \`${word.source.sha256.slice(0, 16)}…\`).

## Resultado

- **Erros bloqueantes:** ${errors.length}
- **Avisos para revisão humana:** ${warnings.length}

## Cobertura do Word

| Elemento | Extraído | Esperado |
|---|---|---|
${Object.entries(coverage).map(([k, [g, w]]) => `| ${k} | ${g} | ${w ?? '—'} |`).join('\n')}

## Base gerada

| Conjunto | Quantidade |
|---|---|
| Itens (vocabulário, expressões, conectores…) | ${Object.keys(items).length} |
| Frases alinhadas EN↔PT | ${sentenceList.length} |
| Blocos (parágrafos) | ${Object.keys(blocks).length} |
| Perguntas (Word + novas) | ${Object.keys(questions).length} (${coverage.questionsWord[0]} do Word) |
| Verbos (Simple Present) | ${verbs.length} |
| Regras de erro | ${E.language.errors.length} |
| Grupos de sinônimos | ${E.language.synonyms.groups.length} |
| Textos com áudio | ${audio.size} |

### Itens por categoria
| Categoria | Itens |
|---|---|
${byCat}

### Itens por origem (rastreabilidade)
| Origem | Itens |
|---|---|
${bySrc}

\`word\` = linha de tabela do Word encontrada no texto · \`word-table-only\` = linha de tabela que não aparece no texto (REV-06) · \`derived\` = expressão do texto do Word com glosa/metadados novos · \`new\` = conteúdo novo.

### Itens e frases por contexto
| Contexto | Itens | Frases |
|---|---|---|
${byCtx}

## Amostra (1 a cada 9 itens)
| ID | Inglês | Português | Categoria | Origem | Frases |
|---|---|---|---|---|---|
${sample}

## Erros
${errors.length ? errors.map((e) => `- ${e}`).join('\n') : 'Nenhum.'}

## Avisos
${warnings.length ? warnings.map((e) => `- ${e}`).join('\n') : 'Nenhum.'}
`;
writeFileSync(join(ROOT, 'docs/CONTENT_INTEGRITY_REPORT.md'), report);

console.log(JSON.stringify({ items: Object.keys(items).length, sentences: sentenceList.length, questions: Object.keys(questions).length, audio: audio.size, errors: errors.length, warnings: warnings.length }));
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
