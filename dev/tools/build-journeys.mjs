#!/usr/bin/env node
// Jornadas independentes (Conversation Practice): content/journeys/*.json → app/data/journeys.js (window.DRG_JOURNEYS).
// Mesmo formato de conteúdo dos personagens (rotinas, blocos, frases, itens, perguntas) + duas listas aditivas:
//   listening — ouvir um trecho do diálogo SEM ver o texto e escolher a resposta (cartão lq:<id>:lis);
//   reading   — ler o diálogo e responder múltipla escolha (cartão rq:<id>:rdq).
// Regras: cada frase declara a origem (original | adapted | new). Direitos: conteúdo 'original' (texto de terceiros) só com
// licença verificável no campo 'license'; sem ela o build falha. Quando a referência local do livro existe
// (tests/fixtures/conversation-book-01-02.json, fora do repositório), todo texto publicável é comparado com ela:
// nenhuma sequência de 6 palavras, nome/lugar do livro ou nota do glossário pode aparecer. Itens são todos próprios da
// jornada (domínio não é herdado de Lucas/Karla) e podem apontar itens equivalentes em 'relatedTo'.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioKey } from '../app/js/engine/text.js';
import { locate } from '../app/js/engine/exercises.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = JSON.parse(readFileSync(join(ROOT, 'content/build/content.json'), 'utf8'));
const chars = JSON.parse(readFileSync(join(ROOT, 'content/build/characters.json'), 'utf8'));
const PROVENANCE = ['original', 'adapted', 'new'];
const PRIVATE = new RegExp(Buffer.from('XGIoPzppdGFbdcO6XXxFQUN8cGVyc29ubmFsaXRcdyp8bGFzdHJvKVxi', 'base64').toString('utf8'), 'i'); // nomes privados protegidos (codificados de propósito)

const words = (t) => String(t || '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean);
/** Trechos do livro reproduzidos no texto: sequências de N palavras, nomes/lugares próprios e notas do glossário. */
export function bookOverlap(texts, book, N = 6) {
  const lines = Object.values(book).filter((u) => u && u.lines).flatMap((u) => [...u.lines.map((l) => l.en), ...u.glossary]);
  const grams = new Set();
  for (const l of lines) { const w = words(l); for (let i = 0; i + N <= w.length; i++) grams.add(w.slice(i, i + N).join(' ')); }
  const names = [...new Set(Object.values(book).filter((u) => u && u.lines).flatMap((u) => [...u.lines.map((l) => l.speaker[0] + l.speaker.slice(1).toLowerCase()), u.conversation.replace(/^Conversation: /, '')]))]
    .concat(['John', 'San Diego', 'Tech', 'Little League']);
  const hits = [];
  for (const t of texts) {
    const w = words(t);
    for (let i = 0; i + N <= w.length; i++) if (grams.has(w.slice(i, i + N).join(' '))) { hits.push(`“${w.slice(i, i + N).join(' ')}” em “${t.slice(0, 60)}”`); break; }
    for (const n of names) if (new RegExp(`\\b${n}\\b`).test(t)) hits.push(`nome do livro “${n}” em “${t.slice(0, 60)}”`);
  }
  return hits;
}

export function buildJourney(src, book) {
  const errors = [];
  const fail = (m) => errors.push(`${src.id}: ${m}`);
  const P = src.idPrefix;
  const own = new Map((src.items || []).map((it) => [it.id, it]));
  const known = new Set([...Object.keys(base.items), ...chars.characters.flatMap((c) => (c.content && c.content.items ? Object.keys(c.content.items) : []))]);
  const used = new Set();
  const voice = (speaker) => (src.voices && src.voices[speaker]) || (src.voices && src.voices._default) || 'bf_emma';
  const audio = []; // manifesto da jornada: { key, text, kind, voice }
  const addAudio = (text, kind, v = voice('_default')) => {
    if (!text) return null;
    const key = v === voice('_default') ? audioKey(text) : audioKey(`${v}|${text}`); // fala com voz própria: chave própria
    if (!audio.some((a) => a.key === key)) audio.push({ key, text, kind, voice: v });
    return key;
  };
  const routines = [], blocks = {}, sentences = {}, questions = {}, listening = {}, reading = {};
  for (const r of src.routines) {
    if (!r.id.startsWith(P)) fail(`rotina ${r.id} sem o prefixo ${P}`);
    if (!r.goal || !r.grammar) fail(`${r.id}: sem objetivo ou foco linguístico`);
    const bIds = [];
    r.blocks.forEach((b, bi) => {
      const bid = `${r.id}-B${bi + 1}`;
      if (!PROVENANCE.includes(b.provenance)) fail(`${bid}: origem inválida`);
      const sIds = b.sentences.map((s, si) => {
        const sid = `${bid}-S${si + 1}`;
        if (!PROVENANCE.includes(s.provenance)) fail(`${sid}: origem inválida (${s.provenance})`);
        if (b.kind === 'dialogue' && (!s.speaker || !s.pt.startsWith(`${s.speaker}: `))) fail(`${sid}: fala sem quem fala`);
        if (!(s.items || []).length) fail(`${sid}: frase sem item (seria liberada logo no início)`);
        if (PRIVATE.test(s.en) || PRIVATE.test(s.pt)) fail(`${sid}: dado identificador`);
        for (const iid of s.items || []) {
          const it = own.get(iid);
          if (!it) { fail(`${sid}: item ${iid} não é da jornada (itens são próprios; use relatedTo para apontar equivalentes)`); continue; }
          if (!locate(it, s.en)) fail(`${sid}: o item “${it.match || it.en}” não aparece na frase`);
          used.add(iid);
        }
        if (s.provenance === 'original' && !src.license) fail(`${sid}: texto de terceiros ('original') sem licença verificável`);
        sentences[sid] = { id: sid, en: s.en, pt: s.pt, routine: r.id, block: bid, ctx: b.ctx, items: s.items || [], au: addAudio(s.en, 'sentence', voice(s.speaker)),
          facts: [], provenance: s.provenance, ...(s.speaker ? { speaker: s.speaker } : {}), ...(s.edit ? { edit: s.edit } : {}), ...(s.variant ? { variant: s.variant } : {}) };
        return sid;
      });
      blocks[bid] = { id: bid, routine: r.id, index: bi + 1, en: sIds.map((x) => sentences[x].en).join(' '), pt: sIds.map((x) => sentences[x].pt).join(' '), ctx: b.ctx, sentences: sIds, title: b.pt,
        provenance: b.provenance, ...(b.kind === 'dialogue' ? { kind: 'dialogue' } : {}) };
      bIds.push(bid);
    });
    routines.push({ id: r.id, title: r.title, pt: r.pt, goal: r.goal, dayType: r.dayType, priority: false, blocks: bIds, usage: r.usage || [], questions: [], items: [],
      kind: 'unit', stage: r.stage || null, grammar: r.grammar, listening: [], reading: [] });
  }
  const rById = new Map(routines.map((r) => [r.id, r]));
  const lineIds = (rid, bi, lines) => { const r = rById.get(rid); const b = r && r.blocks[bi || 0]; if (!b) return []; const sids = blocks[b].sentences; return lines === 'all' ? sids : (lines || []).map((n) => sids[n]); };
  const mcCheck = (x, kind) => {
    if (!x.id.startsWith(`${P}.`)) fail(`${x.id}: sem o prefixo ${P}.`);
    if (!rById.has(x.routine)) fail(`${x.id}: rotina inexistente`);
    if (!Array.isArray(x.options) || x.options.length < 3 || new Set(x.options).size !== x.options.length) fail(`${x.id}: opções insuficientes ou repetidas`);
    if (!(x.answer >= 0 && x.answer < x.options.length) || !x.explain) fail(`${x.id}: sem resposta ou explicação (${kind})`);
    for (const iid of x.items || []) { if (!own.has(iid)) fail(`${x.id}: item ${iid} inexistente`); used.add(iid); }
  };
  for (const l of src.listening || []) {
    mcCheck(l, 'listening');
    const sids = lineIds(l.routine, l.block, l.lines);
    if (!sids.length || sids.some((s) => !s)) { fail(`${l.id}: trecho de áudio inválido`); continue; }
    listening[l.id] = { id: l.id, routine: l.routine, sentences: sids, q: l.q, options: l.options, answer: l.answer, explain: l.explain, items: l.items || [], provenance: 'new', au: addAudio(l.q, 'question') };
    rById.get(l.routine).listening.push(l.id);
  }
  for (const x of src.reading || []) {
    mcCheck(x, 'reading');
    const sid = lineIds(x.routine, x.block, [x.quote])[0];
    if (!sid) { fail(`${x.id}: trecho de leitura inválido`); continue; }
    reading[x.id] = { id: x.id, routine: x.routine, sentence: sid, block: sentences[sid].block, q: x.q, options: x.options, answer: x.answer, explain: x.explain, items: x.items || [], provenance: 'new' };
    rById.get(x.routine).reading.push(x.id);
  }
  for (const q of src.questions || []) {
    if (!q.id.startsWith(`${P}.`)) fail(`${q.id}: sem o prefixo ${P}.`);
    const r = rById.get(q.routine);
    if (!r) { fail(`${q.id}: rotina inexistente`); continue; }
    if (!['conv', 'comp', 'transfer', 'review'].includes(q.kind)) fail(`${q.id}: tipo inválido ${q.kind}`);
    if (q.kind === 'transfer' ? (q.a || !q.hint) : !q.a) fail(`${q.id}: transferência pede dica e resposta vazia; as outras, resposta-modelo`);
    if (q.kind === 'review' && !(q.reviews || []).every((x) => rById.has(x) && routines.indexOf(rById.get(x)) < routines.indexOf(r))) fail(`${q.id}: revisão deve retomar unidade anterior`);
    for (const iid of q.items || []) { if (!own.has(iid)) fail(`${q.id}: item ${iid} inexistente`); used.add(iid); }
    questions[q.id] = { id: q.id, q: q.q, a: q.a || '', keywords: q.keywords || [], items: q.items || [], routine: q.routine, source: 'new', altAnswers: [], altAu: [], facts: [],
      au: addAudio(q.q, 'question'), aau: q.a ? addAudio(q.a, 'answer') : null, kind: q.kind, provenance: 'new',
      ...(q.kind === 'transfer' ? { openPersonal: true, hint: q.hint } : {}), ...(q.reviews ? { reviews: q.reviews } : {}) };
    r.questions.push(q.id);
  }
  const items = {};
  for (const it of src.items || []) {
    if (!it.id.startsWith(`${src.id}.`)) fail(`item ${it.id} fora do espaço da jornada`);
    if (!PROVENANCE.includes(it.provenance)) fail(`${it.id}: origem inválida`);
    if (it.provenance === 'original' && !src.license) fail(`${it.id}: item com texto de terceiros sem licença`);
    if (!used.has(it.id)) fail(`item ${it.id} não é usado`);
    for (const rel of it.relatedTo || []) if (!known.has(rel)) fail(`${it.id}: relatedTo inexistente ${rel}`);
    const ss = Object.values(sentences).filter((s) => s.items.includes(it.id));
    if (!ss.length) fail(`${it.id}: item sem frase`);
    items[it.id] = { id: it.id, en: it.en, pt: it.pt, ptAlt: it.ptAlt || [], c: it.c, tags: ['journey'], lvl: it.lvl || 1, v: it.v || [], notes: it.bookNote ? [{ text: it.bookNote, src: 'book' }] : [],
      ipa: null, tip: it.tip || null, ex: ss.slice(0, 3).map((s) => ({ en: s.en, pt: s.pt, src: s.id, au: s.au })), routines: [...new Set(ss.map((s) => s.routine))],
      blocks: [...new Set(ss.map((s) => s.block))], sentences: ss.map((s) => s.id), ctx: it.ctx || [], source: 'new', srcRefs: [], match: it.match || null,
      au: addAudio(it.en.replace(/…/g, '').replace(/\(\+[^)]*\)/g, '').trim(), 'item'), provenance: it.provenance, relatedTo: it.relatedTo || [] };
  }
  for (const r of routines) r.items = [...new Set(r.blocks.flatMap((b) => blocks[b].sentences.flatMap((s) => sentences[s].items)))];
  const ids = [...routines.map((r) => r.id), ...Object.keys(blocks), ...Object.keys(sentences), ...Object.keys(questions), ...Object.keys(listening), ...Object.keys(reading)];
  const clash = ids.filter((id) => base.sentences[id] || base.blocks[id] || base.questions[id] || base.routines.some((r) => r.id === id));
  if (clash.length) fail(`IDs colidem com o conteúdo atual: ${clash.join(', ')}`);
  // direitos: nada do livro no texto publicável (quando a referência local existe; no CI sem ela, a checagem é pulada)
  if (book && !src.license) {
    const publishable = [...Object.values(sentences).flatMap((s) => [s.en, s.pt]), ...Object.values(questions).flatMap((q) => [q.q, q.a, q.hint]),
      ...[...Object.values(listening), ...Object.values(reading)].flatMap((x) => [x.q, x.explain, ...x.options]),
      ...Object.values(items).flatMap((it) => [it.en, it.pt, it.tip, ...it.notes.map((n) => n.text)]), ...routines.flatMap((r) => [r.title, r.pt, r.goal, r.grammar, ...r.usage]),
      ...Object.values(blocks).map((b) => b.title)].filter(Boolean);
    for (const hit of bookOverlap(publishable, book)) fail(`reprodução do livro: ${hit}`);
  }
  if (errors.length) throw new Error(`Jornada inválida:\n  ${errors.join('\n  ')}`);
  return {
    journey: { id: src.id, name: src.name, status: src.status, source: src.source, content: { routines, blocks, sentences, items, questions, listening, reading } },
    audio,
  };
}

export function buildJourneys() {
  const dir = join(ROOT, 'content/journeys');
  const bookPath = join(ROOT, 'tests/fixtures/conversation-book-01-02.json'); // referência local (texto do livro): não vai para o repositório
  const book = existsSync(bookPath) ? JSON.parse(readFileSync(bookPath, 'utf8')) : null;
  if (!book) console.warn('aviso: referência local do livro ausente — comparação de reprodução não executada');
  const built = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => buildJourney(JSON.parse(readFileSync(join(dir, f), 'utf8')), book)) : [];
  return { data: { version: 1, journeys: built.map((b) => b.journey) }, audio: built.flatMap((b) => b.audio) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { data, audio } = buildJourneys();
  writeFileSync(join(ROOT, 'app/data/journeys.js'), `// GERADO por tools/build-journeys.mjs — não edite. Fonte: content/journeys/*.json.\nwindow.DRG_JOURNEYS = ${JSON.stringify(data)};\n`);
  writeFileSync(join(ROOT, 'content/build/journeys.json'), JSON.stringify(data, null, 1));
  writeFileSync(join(ROOT, 'content/build/journeys-audio-manifest.json'), JSON.stringify(audio, null, 1));
  console.log(JSON.stringify(data.journeys.map((j) => ({ id: j.id, units: j.content.routines.length, sentences: Object.keys(j.content.sentences).length, items: Object.keys(j.content.items).length,
    questions: Object.keys(j.content.questions).length, listening: Object.keys(j.content.listening).length, reading: Object.keys(j.content.reading).length, audio: audio.length }))));
}
