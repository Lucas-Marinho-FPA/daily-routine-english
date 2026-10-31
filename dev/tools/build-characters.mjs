#!/usr/bin/env node
// Personagens: content/characters/*.json → app/data/characters.js (window.DRG_CHARACTERS).
// O conteúdo do Lucas continua em data/content.js (intocado); aqui ficam o registro dos personagens e os pacotes
// dos novos personagens, no MESMO formato do conteúdo do app (rotinas, blocos, frases, itens, perguntas).
// Validação: IDs únicos e com o prefixo do personagem, itens/fatos referenciados existem, item aparece na frase,
// seis estados visuais declarados. Falha o build em vez de publicar um pacote inconsistente.
// Duas camadas de conteúdo: rotinas (kind 'routine', padrão) — cada frase aponta para fatos informados — e episódios
// (kind 'episode') — situações ilustrativas criadas para a prática, ancoradas em fatos do perfil (basis), com etapa
// pedagógica (A–D). Blocos de diálogo (kind 'dialogue') têm quem fala em cada frase (speaker) e na tradução.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioKey } from '../app/js/engine/text.js';
import { locate } from '../app/js/engine/exercises.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const STATES = ['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'levelup'];
const base = JSON.parse(readFileSync(join(ROOT, 'content/build/content.json'), 'utf8'));

// Lucas: o conteúdo atual do app. Sem imagens até hoje (o app nunca teve personagem visual): os seis estados ficam pendentes.
const LUCAS = {
  id: 'lucas', name: 'Lucas', status: 'active', content: 'base',
  profile: { summary: 'Rotinas atuais do app: trabalho, trajeto, academia, família e estudo de inglês.' },
  visual: { dir: 'assets/characters/lucas', ext: 'png', states: Object.fromEntries(STATES.map((s) => [s, { file: s.toUpperCase(), status: 'pending' }])) },
};

export function buildPack(src) {
  const errors = [];
  const fail = (m) => errors.push(`${src.id}: ${m}`);
  const P = src.idPrefix;
  const facts = new Set((src.facts || []).map((f) => f.id));
  const own = new Map((src.items || []).map((it) => [it.id, it]));
  const used = new Set();
  for (const s of STATES) if (!src.visual || !src.visual.states || !src.visual.states[s]) fail(`estado visual ausente: ${s}`);
  const routines = [], blocks = {}, sentences = {}, questions = {};
  for (const r of src.routines || []) {
    if (!r.id.startsWith(P)) fail(`rotina ${r.id} sem o prefixo ${P}`);
    const episode = r.kind === 'episode';
    if (r.stage && !['A', 'B', 'C', 'D'].includes(r.stage)) fail(`${r.id}: etapa inválida ${r.stage}`);
    if (episode) {
      if (!(r.basis || []).length) fail(`${r.id}: episódio sem fatos de base (basis)`);
      for (const f of r.basis || []) if (!facts.has(f)) fail(`${r.id}: fato de base inexistente ${f}`);
      if (!r.stage || !r.goal || !r.grammar) fail(`${r.id}: episódio sem etapa, objetivo ou foco linguístico`);
    }
    const bIds = [];
    r.blocks.forEach((b, bi) => {
      const bid = `${r.id}-B${bi + 1}`;
      const sIds = [];
      b.sentences.forEach((s, si) => {
        const sid = `${bid}-S${si + 1}`;
        for (const f of s.facts || []) if (!facts.has(f)) fail(`${sid}: fato inexistente ${f}`);
        if (!episode && !(s.facts || []).length) fail(`${sid}: frase sem fato de origem`);
        if (b.kind === 'dialogue' && (!s.speaker || !s.pt.includes(': '))) fail(`${sid}: fala sem quem fala (speaker / “Nome: …” na tradução)`);
        if (b.kind !== 'dialogue' && s.speaker) fail(`${sid}: speaker fora de bloco de diálogo`);
        for (const iid of s.items || []) {
          const it = own.get(iid) || base.items[iid];
          if (!it) { fail(`${sid}: item inexistente ${iid}`); continue; }
          if (!own.has(iid) && !iid.startsWith('it.')) fail(`${sid}: item de outro pacote ${iid}`);
          if (!locate(it, s.en)) fail(`${sid}: o item “${it.match || it.en}” não aparece na frase`);
          used.add(iid);
        }
        sentences[sid] = { id: sid, en: s.en, pt: s.pt, routine: r.id, block: bid, ctx: b.ctx, items: s.items || [], au: audioKey(s.en), facts: s.facts || [], ...(s.speaker ? { speaker: s.speaker } : {}) };
        sIds.push(sid);
      });
      blocks[bid] = { id: bid, routine: r.id, index: bi + 1, en: sIds.map((x) => sentences[x].en).join(' '), pt: sIds.map((x) => sentences[x].pt).join(' '), ctx: b.ctx, sentences: sIds, title: b.pt, ...(b.kind === 'dialogue' ? { kind: 'dialogue' } : {}) };
      bIds.push(bid);
    });
    // sessão (kind 'session', Lukinhas): rotina real (frases com fatos) organizada em sessões de prática com metadados
    if (r.kind === 'session' && (!r.session || !r.session.n || !r.session.focus || !r.session.level || !(r.session.vocabIds || []).length)) fail(`${r.id}: sessão sem número, foco, nível ou vocabulário prioritário`);
    routines.push({ id: r.id, title: r.title, pt: r.pt, goal: r.goal, dayType: r.dayType, priority: !!r.priority, blocks: bIds, usage: r.usage || [], questions: [], items: [],
      kind: episode ? 'episode' : r.kind === 'session' ? 'session' : 'routine', stage: r.stage || null, grammar: r.grammar || null, basis: r.basis || [],
      ...(r.session ? { session: r.session } : {}) });
  }
  for (const q of src.questions || []) {
    if (!q.id.startsWith(P)) fail(`pergunta ${q.id} sem o prefixo ${P}`);
    for (const f of q.facts || []) if (!facts.has(f)) fail(`${q.id}: fato inexistente ${f}`);
    const r = routines.find((x) => x.id === q.routine);
    if (!r) fail(`${q.id}: rotina inexistente ${q.routine}`); else r.questions.push(q.id);
    for (const iid of q.items || []) { if (!own.has(iid) && !base.items[iid]) fail(`${q.id}: item inexistente ${iid}`); used.add(iid); }
    if (!['conv', 'comp', 'transfer'].includes(q.kind || 'conv')) fail(`${q.id}: tipo de pergunta inválido ${q.kind}`);
    if (q.kind === 'transfer' ? (!q.openPersonal || !q.hint || q.a) : !q.a) fail(`${q.id}: pergunta de transferência precisa de openPersonal + hint e resposta vazia; as outras, de resposta-modelo`);
    questions[q.id] = { id: q.id, q: q.q, a: q.a, keywords: q.keywords || [], items: q.items || [], routine: q.routine, source: src.id, altAnswers: [], au: audioKey(q.q), aau: q.a ? audioKey(q.a) : null, altAu: [], facts: q.facts || [],
      kind: q.kind || 'conv', ...(q.openPersonal ? { openPersonal: true, hint: q.hint } : {}) };
  }
  // itens: os próprios (k.*) e as referências dos itens compartilhados (it.*) às frases DESTE personagem
  const refsOf = (iid) => {
    const ss = Object.values(sentences).filter((s) => s.items.includes(iid));
    return {
      routines: [...new Set(ss.map((s) => s.routine))], blocks: [...new Set(ss.map((s) => s.block))], sentences: ss.map((s) => s.id),
      ex: ss.slice(0, 3).map((s) => ({ en: s.en, pt: s.pt, src: s.id, au: s.au })),
    };
  };
  const items = {}, shared = {};
  for (const it of src.items || []) {
    if (!it.id.startsWith('k.') && !it.id.startsWith(`${src.id}.`) && !(src.itemPrefix && it.id.startsWith(src.itemPrefix))) fail(`item ${it.id} fora do espaço do personagem`);
    if (!used.has(it.id)) fail(`item ${it.id} não é usado em nenhuma frase ou pergunta`);
    const ref = refsOf(it.id);
    items[it.id] = { id: it.id, en: it.en, pt: it.pt, ptAlt: it.ptAlt || [], c: it.c, tags: it.tags || [], lvl: it.lvl || 1, v: it.v || [], notes: [], ipa: null, tip: it.tip || null,
      ex: ref.ex, routines: ref.routines, blocks: ref.blocks, sentences: ref.sentences, ctx: it.ctx || [], source: src.id, srcRefs: [], match: it.match || null, au: audioKey(src.audio ? it.en.replace(/\.\.\.$|…$/, '') : it.en), // áudio próprio: sem as reticências da forma escrita
      // apoio pedagógico (Lukinhas): explicação para a idade, exemplo adicional com tradução e forma simples (exercício “mais natural”)
      ...(it.explain ? { explain: it.explain } : {}), ...(it.extra ? { extra: { ...it.extra, au: audioKey(it.extra.en) } } : {}), ...(it.plain ? { plain: it.plain } : {}) };
    if (it.plain && !['phrasal', 'collocation', 'time', 'word', 'connector', 'sentence', 'verb'].includes(it.c)) fail(`item ${it.id}: categoria inválida`);
  }
  for (const iid of used) if (!own.has(iid)) shared[iid] = refsOf(iid);
  for (const r of routines) r.items = [...new Set(r.blocks.flatMap((b) => blocks[b].sentences.flatMap((s) => sentences[s].items)))];
  // temas: o que cada um cobre precisa existir
  for (const t of src.themes || []) for (const c of t.covers || []) if (!routines.some((r) => r.id === c) && !blocks[c]) fail(`tema ${t.n}: cobre ${c}, que não existe`);
  // reutilização: em quantos episódios/rotinas cada item aparece (frases ou perguntas) — base da revisão cumulativa
  const reuse = {};
  for (const iid of used) {
    const rs = new Set(Object.values(sentences).filter((s) => s.items.includes(iid)).map((s) => s.routine));
    for (const q of Object.values(questions)) if (q.items.includes(iid)) rs.add(q.routine);
    reuse[iid] = routines.map((r) => r.id).filter((id) => rs.has(id));
  }
  if (errors.length) throw new Error(`Pacote de personagem inválido:\n  ${errors.join('\n  ')}`);
  const ids = [...routines.map((r) => r.id), ...Object.keys(blocks), ...Object.keys(sentences), ...Object.keys(questions)];
  const clash = ids.filter((id) => base.sentences[id] || base.blocks[id] || base.questions[id] || base.routines.some((r) => r.id === id));
  if (clash.length) throw new Error(`IDs do personagem colidem com o conteúdo atual: ${clash.join(', ')}`);
  return {
    id: src.id, name: src.name, status: src.status, profile: src.profile, visual: src.visual, facts: src.facts, themes: src.themes,
    ...(src.short ? { short: src.short } : {}), ...(src.audience ? { audience: src.audience, age: src.age ?? null } : {}),
    journey: src.journey || null, reuse,
    content: { routines, blocks, sentences, items, questions, sharedItems: shared },
  };
}

export function buildCharacters() {
  const dir = join(ROOT, 'content/characters');
  const packs = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => buildPack(JSON.parse(readFileSync(join(dir, f), 'utf8')))) : [];
  // personas previstas (sem conteúdo ainda): status 'planned', content null — o app mostra a trilha como “em preparação”
  const plannedFile = join(ROOT, 'content/personas-planned.json');
  const planned = existsSync(plannedFile) ? JSON.parse(readFileSync(plannedFile, 'utf8')).personas.filter((p) => !packs.some((x) => x.id === p.id)).map((p) => ({
    id: p.id, name: p.name, short: p.short || p.name, status: 'planned', audience: p.audience || 'adult', age: p.age ?? null, content: null,
    profile: { summary: p.summary || '' },
    visual: { dir: `assets/characters/${p.id}`, ext: 'png', states: Object.fromEntries(STATES.map((s) => [s, { file: s.toUpperCase(), status: 'pending' }])) },
  })) : [];
  return { version: 1, states: STATES, characters: [LUCAS, ...packs, ...planned] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = buildCharacters();
  writeFileSync(join(ROOT, 'app/data/characters.js'), `// GERADO por tools/build-characters.mjs — não edite. Fonte: content/characters/*.json.\nwindow.DRG_CHARACTERS = ${JSON.stringify(out)};\n`);
  writeFileSync(join(ROOT, 'content/build/characters.json'), JSON.stringify(out, null, 1));
  // áudio embutido (voz britânica offline, tools/gen_audio.py) só para pacotes que o declaram (hoje, o do Lukinhas)
  const audio = [];
  const add = (text, kind, voice) => { if (text && !audio.some((a) => a.key === audioKey(text))) audio.push({ key: audioKey(text), text, kind, voice }); };
  for (const f of readdirSync(join(ROOT, 'content/characters')).filter((x) => x.endsWith('.json'))) {
    const src = JSON.parse(readFileSync(join(ROOT, 'content/characters', f), 'utf8'));
    if (!src.audio) continue;
    const c = out.characters.find((x) => x.id === src.id).content;
    for (const sn of Object.values(c.sentences)) add(sn.en, 'sentence', src.audio.voice);
    for (const it of Object.values(c.items)) { add(it.en.replace(/\.\.\.$|…$/, ''), 'item', src.audio.voice); if (it.extra) add(it.extra.en, 'example', src.audio.voice); }
    for (const q of Object.values(c.questions)) { add(q.q, 'question', src.audio.voice); add(q.a, 'answer', src.audio.voice); }
  }
  writeFileSync(join(ROOT, 'content/build/characters-audio-manifest.json'), JSON.stringify(audio, null, 1));
  const k = out.characters.filter((c) => c.content && c.content !== 'base');
  console.log(JSON.stringify({ characters: out.characters.map((c) => c.id), packs: k.map((c) => ({ id: c.id, routines: c.content.routines.length, sentences: Object.keys(c.content.sentences).length, items: Object.keys(c.content.items).length, shared: Object.keys(c.content.sharedItems).length, questions: Object.keys(c.content.questions).length })) }));
}
