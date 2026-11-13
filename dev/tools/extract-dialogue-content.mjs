// Extração e organização de TODO o conteúdo de diálogos do repositório (documentação; não altera o app nem os dados).
// Uso: node dev/tools/extract-dialogue-content.mjs   (na raiz do repositório) → docs/conteudo-dialogos/
// Fontes lidas (somente leitura):
//  • Jornada Conversation Practice: dev/content/journeys/cp.json (fonte) e data/journeys.js (gerado para o app)
//  • Diálogos “The Story of John”: dev/content/dialogues/source/the-story-of-john/*.md (fonte autoral), john.json,
//    john-report.json, john-corrections.json, john-questions.json e data/dialogues.js (gerado para o app)
//  • Áudio: audio/*.ogg, dev/content/build/*audio-manifest.json, dev/content/build/audio-durations.json
// Regra: nada é resumido, traduzido, corrigido ou descartado; divergências são registradas, não resolvidas.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = join(ROOT, 'docs/conteudo-dialogos');
const rd = (p) => readFileSync(join(ROOT, p), 'utf8');
const json = (p) => JSON.parse(rd(p));
const win = (p, k) => { const w = {}; new Function('window', rd(p))(w); return w[k]; };

// ---------- fontes ----------
const CPJ = json('dev/content/journeys/cp.json');
const JB = win('data/journeys.js', 'DRG_JOURNEYS');
const CPB = JB.journeys.find((j) => j.id === 'cp');
const CPC = CPB.content; // versão gerada para o app (ids de fala CPnn-Bn-Sn, chaves de áudio `au`)
const P = win('data/dialogues.js', 'DRG_DIALOGUES');
const JJ = json('dev/content/dialogues/john.json');
const REP = json('dev/content/dialogues/john-report.json');
const CORR = json('dev/content/dialogues/john-corrections.json');
const QF = json('dev/content/dialogues/john-questions.json');
const SRC_DIR = 'dev/content/dialogues/source/the-story-of-john';
const SRC_FILES = readdirSync(join(ROOT, SRC_DIR)).filter((f) => f.endsWith('.md')).sort();
const MD = Object.fromEntries(SRC_FILES.map((f) => [f, rd(`${SRC_DIR}/${f}`).split('\n')]));
const MAN = {
  dialogues: json('dev/content/build/dialogues-audio-manifest.json'),
  journeys: json('dev/content/build/journeys-audio-manifest.json'),
  routines: json('dev/content/build/audio-manifest.json'),
  characters: json('dev/content/build/characters-audio-manifest.json'),
};
const DUR = json('dev/content/build/audio-durations.json');
const FILES = new Set(readdirSync(join(ROOT, 'audio')).filter((f) => f.endsWith('.ogg')).map((f) => f.slice(0, -4)));
const hasFile = (k) => !!k && FILES.has(k);

// ---------- utilidades ----------
const esc = (t) => (t === null || t === undefined ? '' : String(t)).replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
const csv = (rows) => rows.map((r) => r.map((c) => { const s = c === null || c === undefined ? '' : String(c); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; }).join(',')).join('\n') + '\n';
const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map(esc).join(' | ')} |`)].join('\n');
const norm = (t) => String(t || '').toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
const words = (t) => norm(t).split(' ').filter(Boolean);
const STOP = new Set("a an the to of in on at for and or but is are am was were be been being i you he she it we they me him her us them my your his its our their this that these those do does did not no yes so if as with from by up out about what who where when how why which there here have has had will would can could just very really oh well ok okay i'm it's that's don't isn't aren't i've i'll you're he's she's we're they're there's let's".split(' '));
const content = (t) => words(t).filter((w) => !STOP.has(w));
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;
const write = (rel, text) => { const p = join(OUT, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text.endsWith('\n') ? text : text + '\n'); FILES_OUT.push(rel); };
const FILES_OUT = [];
const ISSUES = []; // { area, tipo, id, detalhe }
const issue = (area, tipo, id, detalhe) => ISSUES.push({ area, tipo, id, detalhe });

// ---------- áudio: todos os usos conhecidos ----------
const AUDIO_USE = new Map(); // key → [{ fonte, kind, ref, text, voice }]
const useAudio = (key, u) => { if (!key) return; if (!AUDIO_USE.has(key)) AUDIO_USE.set(key, []); AUDIO_USE.get(key).push(u); };

// ======================================================================================================
// A. Jornada Conversation Practice (CP)
// ======================================================================================================
const jmByText = new Map(); // `${voice}|${text}` e `|${text}` → entrada do manifesto
for (const m of MAN.journeys) { jmByText.set(`${m.voice || ''}|${m.text}`, m); if (!jmByText.has(`|${m.text}`)) jmByText.set(`|${m.text}`, m); }
const cpVoice = (speaker) => CPJ.voices[speaker] || CPJ.voices._default;
const cpAudioFor = (text, voice) => jmByText.get(`${voice}|${text}`) || null;
const cpItem = new Map(CPJ.items.map((i) => [i.id, i]));
const cpUsedItems = new Map(); // item → [posição]
const CP_LINES = []; // planilha
const CP_CATEGORY = { sentence: 'frase / expressão completa', connector: 'conector / expressão funcional', collocation: 'collocation', time: 'expressão de tempo', word: 'palavra', phrasal: 'phrasal verb', verb: 'verbo' };

function cpUnitDoc(r, ri) {
  const out = [`# Conversation Practice — ${r.id} · ${r.title}`, '',
    `**Jornada:** Conversation Practice (\`${CPJ.id}\`, status \`${CPJ.status}\`) · **Unidade:** ${r.id} · **Título em português:** ${r.pt}`,
    `**Tipo de dia:** ${r.dayType} · **Estágio:** ${r.stage}`, '',
    `**Objetivo (literal):** ${r.goal}`, '', `**Gramática (literal):** ${r.grammar}`, '',
    '**Uso e variantes (literal):**', '', ...(r.usage || []).map((u) => `- ${u}`), '',
    `Fonte: \`dev/content/journeys/cp.json\` → \`routines[${ri}]\`. Origem declarada: ${CPJ.source.note} Licença: ${CPJ.license === null ? '`null` (conteúdo original do app)' : JSON.stringify(CPJ.license)}.`, ''];
  r.blocks.forEach((b, bi) => {
    const bid = `${r.id}-B${bi + 1}`;
    out.push(`## Diálogo ${bi + 1} — ${b.pt}`, '', `Id no app: \`${bid}\` · tipo: \`${b.kind}\` · origem: \`${b.provenance}\` · contexto: ${(b.ctx || []).join(', ') || '—'} · ${plural(b.sentences.length, 'fala', 'falas')}`, '',
      'Ids das falas: gerados pelo build do app (`data/journeys.js`, `CPnn-Bn-Sn`); a fonte (`cp.json`) não tem id por fala. A tradução traz o nome do personagem no início, como na fonte.', '');
    if (!CPC.blocks[bid]) issue('Conversation Practice', 'divergência fonte × app', bid, 'diálogo ausente no app');
    const rows = b.sentences.map((s, si) => {
      const ref = `${bid}-S${si + 1}`;
      const voice = cpVoice(s.speaker);
      const bs = CPC.sentences[ref] || null;
      const m = bs && bs.au ? { key: bs.au } : cpAudioFor(s.en, voice);
      if (m) useAudio(m.key, { fonte: 'Conversation Practice', kind: 'fala', ref, text: s.en, voice });
      else issue('Conversation Practice', 'fala sem áudio no manifesto', ref, s.en);
      if (m && !hasFile(m.key)) issue('Conversation Practice', 'arquivo de áudio ausente', ref, m.key);
      if (!s.pt) issue('Conversation Practice', 'fala sem tradução', ref, s.en);
      (s.items || []).forEach((id) => { if (!cpUsedItems.has(id)) cpUsedItems.set(id, []); cpUsedItems.get(id).push(ref); if (!cpItem.has(id)) issue('Conversation Practice', 'fala aponta item inexistente', ref, id); });
      // divergência fonte × app
      if (!bs || bs.en !== s.en || bs.pt !== s.pt) issue('Conversation Practice', 'divergência fonte × app', ref, `fonte: ${s.en} / ${s.pt} | app: ${bs ? `${bs.en} / ${bs.pt}` : '(ausente)'}`);
      CP_LINES.push(['Conversation Practice', r.id, `${bi + 1}. ${b.pt}`, si + 1, ref, s.speaker, s.en, s.pt, m ? m.key : '', voice, s.provenance, (s.items || []).join(' ')]);
      return [si + 1, ref, s.speaker, s.en, s.pt, (s.items || []).join(', ') || '—', m ? `${m.key}${hasFile(m.key) ? '' : ' (arquivo ausente)'}` : '—', voice, s.provenance];
    });
    out.push(table(['#', 'Id (app)', 'Personagem', 'Inglês (literal)', 'Português (literal)', 'Itens relacionados', 'Áudio', 'Voz', 'Origem'], rows), '');
  });
  const L = CPJ.listening.filter((x) => x.routine === r.id);
  const R = CPJ.reading.filter((x) => x.routine === r.id);
  const Q = CPJ.questions.filter((x) => x.routine === r.id);
  out.push(`## Ouvir e responder (${L.length})`, '');
  for (const x of L) {
    const bl = CPC.listening[x.id];
    out.push(`### ${x.id} — diálogo ${x.block + 1}, falas: ${x.lines === 'all' ? 'todas' : x.lines.map((n) => n + 1).join(', ')}${bl ? ` (no app: ${bl.sentences.join(', ')})` : ''}`, '', `**Pergunta:** ${x.q}`, '',
      ...x.options.map((o, i) => `${i === x.answer ? '- **(correta)** ' : '- '}${o}`), '', `**Explicação:** ${x.explain}`, '', `Itens: ${(x.items || []).join(', ') || '—'}`, '');
  }
  out.push(`## Ler e responder (${R.length})`, '');
  for (const x of R) {
    const s = r.blocks[x.block] && r.blocks[x.block].sentences[x.quote];
    out.push(`### ${x.id} — diálogo ${x.block + 1}, fala citada ${x.quote + 1}`, '', `> ${s ? `${s.speaker}: ${s.en}` : '(fala não encontrada)'}`, '', `**Pergunta:** ${x.q}`, '',
      ...x.options.map((o, i) => `${i === x.answer ? '- **(correta)** ' : '- '}${o}`), '', `**Explicação:** ${x.explain}`, '', `Itens: ${(x.items || []).join(', ') || '—'}`, '');
    if (!s) issue('Conversation Practice', 'leitura cita fala inexistente', x.id, `bloco ${x.block}, fala ${x.quote}`);
  }
  out.push(`## Perguntas de produção, transferência e revisão (${Q.length})`, '');
  for (const x of Q) {
    out.push(`### ${x.id} (\`${x.kind}\`)`, '', `**Pergunta:** ${x.q}`, '', `**Resposta-modelo:** ${x.a}`, '', `**Palavras-chave aceitas:** ${(x.keywords || []).map((g) => g.join(' / ')).join(' · ') || '—'}`, '', `Itens: ${(x.items || []).join(', ') || '—'}`, '');
  }
  return out.join('\n');
}

// ======================================================================================================
// B. The Story of John
// ======================================================================================================
const actById = new Map(P.activities.map((a) => [a.id, a]));
const itemById = new Map(P.items.map((i) => [i.id, i]));
const qById = new Map(P.questions.map((q) => [q.id, q]));
const JOHN_LINES = [], ITEMS_CSV = [], Q_CSV = [];
const TYPE_PT = { word: 'palavra', chunk: 'chunk', expression: 'expressão', phrasal_verb: 'phrasal verb', collocation: 'collocation', pattern: 'padrão' };
const covered = Object.fromEntries(SRC_FILES.map((f) => [f, new Set()])); // linhas da fonte representadas nos dados
const cover = (src, line) => { if (src && covered[src] && line) covered[src].add(line); };

// divergências entre as versões (john.json → data/dialogues.js)
const jjAct = new Map(JJ.activities.map((a) => [a.id, a]));
if (JJ.contentVersion !== P.contentVersion) issue('The Story of John', 'versão', 'contentVersion', `john.json ${JJ.contentVersion} × data/dialogues.js ${P.contentVersion}`);
if (REP.summary && REP.summary.contentVersion !== P.contentVersion) issue('The Story of John', 'versão', 'john-report.json', `relatório gerado na versão ${REP.summary.contentVersion}; app na ${P.contentVersion} (o relatório pode estar desatualizado em relação ao pacote)`);
for (const a of P.activities) {
  const b = jjAct.get(a.id);
  if (!b) { issue('The Story of John', 'divergência john.json × app', a.id, 'atividade ausente no john.json'); continue; }
  a.lines.forEach((l, i) => { const m = b.lines[i]; if (!m || m.id !== l.id || m.en !== l.en || m.pt !== l.pt || m.speaker !== l.speaker) issue('The Story of John', 'divergência john.json × app', l.id, `john.json: ${m ? m.en : '(ausente)'} | app: ${l.en}`); });
  if (b.lines.length !== a.lines.length) issue('The Story of John', 'divergência john.json × app', a.id, `falas: ${b.lines.length} × ${a.lines.length}`);
}
const jjItems = new Map(JJ.items.map((i) => [i.id, i]));
for (const it of P.items) { const m = jjItems.get(it.id); if (!m || m.en !== it.en || m.pt !== it.pt) issue('The Story of John', 'divergência john.json × app', it.id, `item: ${m ? m.en : '(ausente)'} × ${it.en}`); }
if (QF.questions.length !== P.questions.length) issue('The Story of John', 'divergência questões', 'john-questions.json', `${QF.questions.length} no arquivo × ${P.questions.length} no app`);

// fala da fonte (Markdown) × texto usado (o app usa o texto corrigido; correction guarda o original da fonte)
const stripMd = (t) => String(t || '').replace(/\*\*[^*]+:\*\*\s*/, '').replace(/^\*|\*$/g, '').replace(/^\s*\*?[^:*]{1,40}:\s*/, '').replace(/\s+$/, '').trim();
function checkSource(l) {
  const f = l.src && l.src.file; const lines = MD[f];
  if (!lines) { issue('The Story of John', 'fonte ausente', l.id, f); return; }
  const enSrc = lines[(l.src.line || 0) - 1] || ''; const ptSrc = lines[(l.src.ptLine || 0) - 1] || '';
  const enOrig = l.correction && l.correction.en ? l.correction.en : l.en;
  const ptOrig = l.correction && l.correction.pt ? l.correction.pt : l.pt;
  if (!norm(enSrc).includes(norm(enOrig))) issue('The Story of John', 'divergência fonte × dados (inglês)', l.id, `fonte l.${l.src.line}: ${enSrc.trim()} | dados: ${enOrig}`);
  if (!norm(ptSrc).includes(norm(ptOrig))) issue('The Story of John', 'divergência fonte × dados (português)', l.id, `fonte l.${l.src.ptLine}: ${ptSrc.trim()} | dados: ${ptOrig}`);
  cover(f, l.src.line); cover(f, l.src.ptLine);
}

// cobertura do inventário (palavras de conteúdo das falas que não estão em nenhum item da atividade)
function coverageOf(a) {
  const itemWords = new Set(a.itemIds.flatMap((id) => content(itemById.get(id) ? itemById.get(id).spoken || itemById.get(id).en : '')));
  const all = [...new Set(a.lines.flatMap((l) => content(l.en)))];
  return { all, missing: all.filter((w) => !itemWords.has(w)) };
}

function actDoc(a) {
  const out = [`### ${a.sectionTitle || a.title}`, '',
    `**Id:** \`${a.id}\` · **Tipo:** ${a.kind === 'episode' ? 'episódio' : 'mini-diálogo (seção complementar)'} · **Ordem na parte:** ${a.order} · **Título:** ${a.title}`, '',
    `**Contexto (literal):** ${a.context || '—'}`, '',
    `**Origem:** ${a.provenance ? `${a.provenance.kind} · arquivo \`${a.provenance.file}\` a partir da linha ${a.provenance.firstLine} · tradução: ${a.provenance.translationStatus}` : '—'}`, ''];
  if (a.provenance && a.provenance.firstLine) cover(a.provenance.file, a.provenance.firstLine);
  out.push(`#### Falas (${a.lines.length}) — ordem original`, '');
  const rows = a.lines.map((l) => {
    checkSource(l);
    useAudio(l.audio, { fonte: 'The Story of John', kind: 'fala', ref: l.id, text: l.en, voice: l.voice });
    if (!l.pt) issue('The Story of John', 'fala sem tradução', l.id, l.en);
    if (!l.audio) issue('The Story of John', 'fala sem áudio', l.id, l.en); else if (!hasFile(l.audio)) issue('The Story of John', 'arquivo de áudio ausente', l.id, l.audio);
    JOHN_LINES.push(['The Story of John', a.part, a.id, l.seq, l.id, l.speaker, l.en, l.pt, l.audio, l.voice, l.correction ? l.correction.en || '' : '', l.correction ? l.correction.pt || '' : '', `${l.src.file}:${l.src.line}/${l.src.ptLine}`]);
    return [l.seq, l.id, `${l.speaker} (\`${l.speakerId}\`)`, l.en, l.ptSpeaker && l.ptSpeaker !== l.speaker ? `${l.pt} *(rótulo na tradução: ${l.ptSpeaker})*` : l.pt,
      `${l.audio}${hasFile(l.audio) ? '' : ' (arquivo ausente)'}`, l.voice, `${l.src.file}:${l.src.line} / ${l.src.ptLine}`];
  });
  out.push(table(['#', 'Id', 'Personagem', 'Inglês (usado no app)', 'Português (usado no app)', 'Áudio', 'Voz', 'Fonte (EN / PT)'], rows), '');
  const corrected = a.lines.filter((l) => l.correction);
  if (corrected.length) {
    out.push('**Falas corrigidas (decisão do PO de 2026-11-11; o app usa o texto corrigido, a fonte continua com o original):**', '');
    for (const l of corrected) {
      out.push(`- \`${l.id}\` — original da fonte: “${l.correction.en || l.en}” / “${l.correction.pt || l.pt}”`, ...(l.correction.reasons || []).map((r) => `  - motivo: ${r}`));
      issue('The Story of John', 'fala corrigida (registro)', l.id, `original: ${l.correction.en || '(inglês sem mudança)'} → usado: ${l.en}`);
    }
    out.push('');
  }
  const items = a.itemIds.map((id) => itemById.get(id)).filter(Boolean);
  out.push(`#### Itens de vocabulário (${items.length})`, '');
  if (!items.length) { out.push('*Nenhum item curado nos documentos para esta atividade.*', ''); issue('The Story of John', 'atividade sem itens de vocabulário', a.id, a.title); }
  else {
    out.push(table(['Id', 'Classificação', 'Inglês (literal)', 'Forma falada', 'Português (literal)', 'Falas relacionadas', 'Áudio', 'Tabela da fonte', 'Fonte'], items.map((it) => {
      cover(it.src && it.src.file, it.src && it.src.line);
      useAudio(it.audio, { fonte: 'The Story of John', kind: 'item', ref: it.id, text: it.spoken, voice: null });
      if (!it.audio || !hasFile(it.audio)) issue('The Story of John', 'item sem arquivo de áudio', it.id, it.audio || '(sem chave)');
      if (!(it.sourceLineIds || []).length) issue('The Story of John', 'item não aparece literalmente nas falas da atividade', it.id, it.en);
      ITEMS_CSV.push(['The Story of John', it.id, TYPE_PT[it.type] || it.type, it.en, it.pt, it.activityId, (it.sourceLineIds || []).join(' '), it.audio, it.table, it.link, `${it.src.file}:${it.src.line}`, a.provenance ? a.provenance.translationStatus : '']);
      return [it.id, TYPE_PT[it.type] || it.type, it.en, it.spoken !== it.en ? it.spoken : '=', it.pt, (it.sourceLineIds || []).join(', ') || '— (não aparece literalmente)', it.audio, it.table, `${it.src.file}:${it.src.line}`];
    })), '');
  }
  if ((a.notes || []).length) { out.push(`#### Notas pedagógicas (${a.notes.length}) — literal`, ''); a.notes.forEach((n) => out.push(n, '')); }
  const qs = (a.questionIds || []).map((id) => qById.get(id)).filter(Boolean);
  out.push(`#### Questões de compreensão (${qs.length})`, '');
  if (qs.length) out.push(`Status de origem: ${qs[0].status}`, '');
  for (const q of qs) {
    out.push(`- **${q.id}** (${q.skill}) — ${q.prompt}`, ...q.options.map((o) => `  - ${o.id === q.correctOptionId ? '**(correta)** ' : ''}${o.id}) ${o.text}`), `  - Explicação: ${q.explanation}`, `  - Falas de referência: ${(q.sourceLineIds || []).join(', ') || '—'}`);
    Q_CSV.push(['The Story of John', q.id, a.id, q.skill, q.prompt, q.options.map((o) => `${o.id}) ${o.text}`).join(' || '), q.correctOptionId, q.explanation, (q.sourceLineIds || []).join(' '), q.status]);
  }
  out.push('');
  const cov = coverageOf(a);
  out.push(`#### Conteúdo das falas fora do inventário de itens`, '', `${cov.missing.length} de ${cov.all.length} palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: ${cov.missing.join(', ') || '—'}.`, '');
  return out.join('\n');
}

function partDoc(part) {
  const acts = part.activityIds.map((id) => actById.get(id)).filter(Boolean);
  const out = [`# The Story of John — Parte ${part.n}: ${part.title}`, '',
    `**Pacote:** ${P.title} (\`${P.id}\`, conteúdo \`${P.contentVersion}\`, idioma ${P.locale}) · **Parte:** \`${part.id}\` · **Arquivo-fonte:** \`${SRC_DIR}/${part.file}\``, '',
    `**Origem do pacote (literal):** ${P.provenance}`, '',
    `**Atividades:** ${acts.length} (${acts.filter((a) => a.kind === 'episode').length} episódios, ${acts.filter((a) => a.kind !== 'episode').length} mini-diálogos) · **Falas:** ${acts.reduce((n, a) => n + a.lines.length, 0)} · **Itens:** ${acts.reduce((n, a) => n + a.itemIds.length, 0)} · **Questões:** ${acts.reduce((n, a) => n + (a.questionIds || []).length, 0)}`, '',
    '## Atividades', '', ...acts.map((a) => `- [\`${a.id}\` — ${a.title}](#${(a.sectionTitle || a.title).toLowerCase().replace(/[^a-z0-9à-ú —-]/g, '').replace(/[ —]+/g, '-')})`), '', '## Conteúdo por atividade', ''];
  acts.forEach((a) => out.push(actDoc(a)));
  // itens das tabelas da fonte que não ficaram ligados a nenhuma atividade
  const un = (REP.unassignedItems || []).filter((x) => x.part === part.n);
  out.push(`## Itens das tabelas da fonte sem atividade correspondente (${un.length})`, '',
    'Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.', '');
  if (un.length) out.push(table(['Inglês (literal)', 'Tabela', 'Fonte'], un.map((x) => { cover(x.src.file, x.src.line); const ln = (MD[x.src.file] || [])[x.src.line - 1] || ''; ITEMS_CSV.push(['The Story of John', '', '(sem atividade)', x.en, cellPt(ln), '', '', '', x.table, 'tabela da fonte', `${x.src.file}:${x.src.line}`, 'não integrado ao app']); return [x.en, x.table, `${x.src.file}:${x.src.line} — “${ln.trim()}”`]; })), '');
  // trechos da fonte que não estão nos dados do app (literal)
  out.push(`## Conteúdo da fonte que não está nos dados do app (literal)`, '',
    `Linhas de \`${part.file}\` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.`, '');
  out.push(...uncoveredBlocks(part.file, acts));
  return out.join('\n');
}
const cellPt = (row) => { const c = row.split('|').map((x) => x.trim()).filter(Boolean); return c.length >= 2 ? c[1] : ''; };

function uncoveredBlocks(file, acts) {
  const lines = MD[file] || [];
  const notes = acts.flatMap((a) => a.notes || []).join('\n');
  const contexts = new Set(acts.map((a) => norm(a.context)).filter(Boolean));
  const titles = new Set(acts.map((a) => norm(a.sectionTitle)).filter(Boolean));
  const isCovered = (i) => {
    const t = lines[i].trim(); if (!t) return true;
    if (covered[file].has(i + 1)) return true;
    const n = norm(t.replace(/^#+\s*/, '').replace(/^\*|\*$/g, ''));
    if (titles.has(n) || contexts.has(n)) return true;
    if (t.length > 3 && notes.includes(t)) return true;
    // cabeçalho/separador de tabela imediatamente antes de uma linha de item coberta
    if (/^\|/.test(t)) { let j = i + 1; while (j < lines.length && /^\|/.test(lines[j].trim()) && !covered[file].has(j + 1)) j++; if (j < lines.length && covered[file].has(j + 1) && /^\|[\s:|-]+\|?$|English|Português/i.test(t)) return true; }
    return false;
  };
  const out = []; let i = 0, n = 0;
  while (i < lines.length) {
    if (isCovered(i)) { i++; continue; }
    const s = i; while (i < lines.length && (!isCovered(i) || (!lines[i].trim() && i + 1 < lines.length && !isCovered(i + 1)))) i++;
    const block = lines.slice(s, i);
    while (block.length && !block[block.length - 1].trim()) block.pop();
    out.push(`**Linhas ${s + 1}–${s + block.length}:**`, '', '```markdown', ...block, '```', ''); n += block.filter((x) => x.trim()).length;
  }
  UNCOVERED[file] = n;
  return out.length ? out : ['*Nada: todas as linhas da fonte estão representadas acima.*', ''];
}
const UNCOVERED = {};

// ======================================================================================================
// Geração
// ======================================================================================================
rmSync(OUT, { recursive: true, force: true });

// A. Conversation Practice
CPJ.routines.forEach((r, ri) => write(`conversation-practice/${r.id}.md`, cpUnitDoc(r, ri)));
{
  const byCat = {};
  for (const it of CPJ.items) (byCat[it.c] = byCat[it.c] || []).push(it);
  const out = ['# Conversation Practice — inventário de itens', '', `Fonte: \`dev/content/journeys/cp.json\` → \`items\` (${CPJ.items.length}). Classificações preservadas como estão no campo \`c\` (sem fundir categorias).`, ''];
  for (const [c, list] of Object.entries(byCat)) {
    out.push(`## ${CP_CATEGORY[c] || c} (\`${c}\`) — ${list.length}`, '');
    out.push(table(['Id', 'Inglês (literal)', 'Português (literal)', 'Nível', 'Contexto', 'Forma de correspondência', 'Dica (literal)', 'Relacionado a', 'Variante', 'Origem', 'Falas que o usam', 'Exemplos no app (falas)', 'Áudio'], list.map((it) => {
      const used = cpUsedItems.get(it.id) || [];
      const bi = CPC.items[it.id] || null;
      if (!bi || bi.en !== it.en || bi.pt !== it.pt) issue('Conversation Practice', 'divergência fonte × app', it.id, `fonte: ${it.en} | app: ${bi ? bi.en : '(ausente)'}`);
      const m = bi && bi.au ? { key: bi.au, voice: CPJ.voices._default } : cpAudioFor(it.en, CPJ.voices._default);
      if (m) useAudio(m.key, { fonte: 'Conversation Practice', kind: 'item', ref: it.id, text: it.en, voice: m.voice });
      if (!used.length) issue('Conversation Practice', 'item não usado em nenhuma fala', it.id, it.en);
      if (!it.pt) issue('Conversation Practice', 'item sem tradução', it.id, it.en);
      ITEMS_CSV.push(['Conversation Practice', it.id, CP_CATEGORY[it.c] || it.c, it.en, it.pt, '', used.join(' '), m ? m.key : '', '', it.tip || '', 'dev/content/journeys/cp.json', `${CPJ.status} / ${it.provenance}`]);
      return [it.id, it.en, it.pt, it.lvl, (it.ctx || []).join(', '), it.match || '', it.tip || '', Array.isArray(it.relatedTo) ? it.relatedTo.join(', ') : it.relatedTo || '', it.v && it.v.length ? JSON.stringify(it.v) : '', it.provenance, used.join(', ') || '—', bi && bi.ex ? bi.ex.map((e) => e.src).join(', ') : '—', m ? `${m.key}${hasFile(m.key) ? '' : ' (ausente)'}` : '—'];
    })), '');
  }
  write('conversation-practice/itens.md', out.join('\n'));
}
// perguntas CP na planilha
for (const x of CPJ.listening) Q_CSV.push(['Conversation Practice', x.id, x.routine, 'ouvir e responder', x.q, x.options.map((o, i) => `${i}) ${o}`).join(' || '), x.answer, x.explain, x.lines === 'all' ? 'todas' : x.lines.join(' '), CPJ.status]);
for (const x of CPJ.reading) Q_CSV.push(['Conversation Practice', x.id, x.routine, 'ler e responder', x.q, x.options.map((o, i) => `${i}) ${o}`).join(' || '), x.answer, x.explain, `fala ${x.quote + 1}`, CPJ.status]);
for (const x of CPJ.questions) Q_CSV.push(['Conversation Practice', x.id, x.routine, x.kind, x.q, '', '', `resposta-modelo: ${x.a}`, '', CPJ.status]);
// áudio de perguntas/respostas da jornada (manifesto), para a relação de áudios
for (const m of MAN.journeys) if (!AUDIO_USE.has(m.key)) useAudio(m.key, { fonte: 'Conversation Practice', kind: m.kind, ref: '(manifesto)', text: m.text, voice: m.voice });

// B. The Story of John
for (const part of P.parts) write(`the-story-of-john/parte-${part.n}.md`, partDoc(part));
{
  const general = SRC_FILES.filter((f) => !P.parts.some((p) => p.file === f));
  const out = ['# The Story of John — documentos gerais da fonte (literal)', '', 'Arquivos da pasta-fonte que não são partes do diálogo (instruções e nota de integração). Reproduzidos sem alteração.', ''];
  for (const f of general) { out.push(`## \`${SRC_DIR}/${f}\``, '', '```markdown', ...MD[f], '```', ''); }
  out.push('## Elenco do pacote (`cast`)', '', table(['Id', 'Nome'], Object.entries(P.cast).map(([k, v]) => [k, v])), '');
  write('the-story-of-john/00_documentos-gerais.md', out.join('\n'));
}
{
  const out = ['# The Story of John — inventário de itens por classificação', '', 'Itens do app (`data/dialogues.js` → `items`), agrupados pela classificação original (`type`), sem fundir categorias. Itens das tabelas da fonte sem atividade (não integrados ao app) no fim.', ''];
  const byType = {};
  for (const it of P.items) (byType[it.type] = byType[it.type] || []).push(it);
  for (const [t, list] of Object.entries(byType)) {
    out.push(`## ${TYPE_PT[t] || t} (\`${t}\`) — ${list.length}`, '');
    out.push(table(['Id', 'Inglês', 'Português', 'Atividade', 'Falas relacionadas', 'Áudio'], list.map((it) => [it.id, it.en, it.pt, it.activityId, (it.sourceLineIds || []).join(', ') || '—', it.audio])), '');
  }
  const un = REP.unassignedItems || [];
  out.push(`## Itens das tabelas da fonte sem atividade (não integrados ao app) — ${un.length}`, '', table(['Parte', 'Inglês (literal)', 'Tabela', 'Fonte'], un.map((x) => [x.part, x.en, x.table, `${x.src.file}:${x.src.line}`])), '');
  write('the-story-of-john/inventario-por-classificacao.md', out.join('\n'));
}
// relatório de conversão (avisos e decisões) — literal
write('the-story-of-john/relatorio-de-conversao.md', ['# The Story of John — relatório da conversão (literal)', '', 'Fonte: `dev/content/dialogues/john-report.json` (gerado por `dev/tools/dialogues-source.mjs`).', '',
  `Resumo: ${JSON.stringify(REP.summary)}`, '', '## Arquivos', '', table(['Arquivo', 'Parte', 'Falas de diálogo', 'Atividades', 'Itens'], (REP.files || []).map((f) => [f.file, f.part, f.dialogueLines, f.activities, f.items])), '',
  `## Decisões registradas (${(REP.decisions || []).length})`, '', ...(REP.decisions || []).map((d) => `- ${d}`), '', `## Avisos (${(REP.warnings || []).length})`, '', ...(REP.warnings || []).map((d) => `- ${d}`), '',
  `## Trechos marcados como “não diálogo” (${(REP.notDialogue || []).length})`, '', table(['Arquivo', 'Linha', 'Rótulo'], (REP.notDialogue || []).map((x) => [x.file, x.line, x.label])), '',
  `## Correções aprovadas (${(CORR.corrections || []).length}) — \`john-corrections.json\``, '', `Aprovado por: ${CORR.approvedBy}`, '', `Nota: ${CORR.note}`, '',
  table(['Id', 'Campo', 'De (fonte)', 'Para (usado)', 'Motivo'], (CORR.corrections || []).map((c) => [c.id, c.field, c.from, c.to, c.reason])), '',
  `## Questões: origem e atividades com menos de 10 questões`, '', `Status (literal): ${QF.status}`, '', `Fonte (literal): ${typeof QF.source === 'string' ? QF.source : JSON.stringify(QF.source)}`, '',
  table(['Atividade', 'Falas', 'Questões'], (QF.insufficient || []).map((x) => [x.id, x.lines, x.questions])), ''].join('\n'));

// ---------- áudios ----------
const allKnown = new Set([...MAN.routines, ...MAN.characters, ...MAN.dialogues, ...MAN.journeys].map((m) => m.key));
for (const m of MAN.dialogues) if (!AUDIO_USE.has(m.key)) { useAudio(m.key, { fonte: 'The Story of John', kind: m.kind, ref: '(manifesto, sem uso nos dados)', text: m.text, voice: m.voice }); issue('The Story of John', 'áudio do manifesto sem fala/item correspondente', m.key, m.text); }
for (const [k, uses] of AUDIO_USE) if (!hasFile(k)) issue(uses[0].fonte, 'arquivo de áudio ausente', k, uses[0].ref);
const scopeKeys = [...AUDIO_USE.keys()];
const orphans = [...FILES].filter((k) => !allKnown.has(k));
const shared = [...AUDIO_USE].filter(([, u]) => u.length > 1);
{
  const rows = [...AUDIO_USE].sort((a, b) => (a[1][0].fonte + a[1][0].ref).localeCompare(b[1][0].fonte + b[1][0].ref))
    .map(([k, u]) => [k, hasFile(k) ? `audio/${k}.ogg` : '(ausente)', DUR[k] ?? '—', u.map((x) => `${x.fonte} · ${x.kind} · ${x.ref}`).join('<br>'), u[0].voice || '—', u[0].text]);
  write('audios.md', ['# Relação de áudios dos diálogos', '',
    `Chave = nome do arquivo em \`audio/<chave>.ogg\`. Fontes: \`dev/content/build/dialogues-audio-manifest.json\` (John, ${MAN.dialogues.length}) e \`journeys-audio-manifest.json\` (Conversation Practice, ${MAN.journeys.length}). Duração de \`audio-durations.json\`.`, '',
    `- Chaves usadas pelos diálogos: **${scopeKeys.length}** (arquivo presente: ${scopeKeys.filter(hasFile).length}; ausente: ${scopeKeys.filter((k) => !hasFile(k)).length}).`,
    `- Chaves compartilhadas por mais de um uso (mesmo texto e voz): ${shared.length}.`,
    `- Arquivos em \`audio/\` sem correspondência em nenhum manifesto do app (qualquer módulo): **${orphans.length}**${orphans.length ? ` — ${orphans.join(', ')}` : ''}.`, '',
    table(['Chave', 'Arquivo', 'Duração (s)', 'Usos', 'Voz', 'Texto (literal)'], rows), ''].join('\n'));
  if (orphans.length) issue('Áudio', 'arquivos sem correspondência em nenhum manifesto', `${orphans.length} arquivos`, orphans.join(', '));
}

// ---------- duplicidades ----------
function dups(list, keyOf, labelOf) { const m = new Map(); for (const x of list) { const k = keyOf(x); if (!k) continue; if (!m.has(k)) m.set(k, []); m.get(k).push(labelOf(x)); } return [...m].filter(([, v]) => v.length > 1); }
const dupItems = dups(P.items, (i) => norm(i.en), (i) => i.id);
const dupLines = dups(P.activities.flatMap((a) => a.lines), (l) => norm(l.en), (l) => l.id);
const dupQ = dups(P.questions, (q) => norm(q.prompt), (q) => q.id);
const dupCpItems = dups(CPJ.items, (i) => norm(i.en), (i) => i.id);
const crossItems = CPJ.items.filter((c) => P.items.some((j) => norm(j.en) === norm(c.en))).map((c) => [c.id, c.en, P.items.filter((j) => norm(j.en) === norm(c.en)).map((j) => j.id).join(', ')]);
dupItems.forEach(([k, v]) => issue('The Story of John', 'item duplicado (mesmo inglês)', v.join(', '), k));
dupLines.forEach(([k, v]) => issue('The Story of John', 'fala repetida (mesmo inglês)', v.join(', '), k));
dupQ.forEach(([k, v]) => issue('The Story of John', 'questão repetida (mesmo enunciado)', v.join(', '), k));
dupCpItems.forEach(([k, v]) => issue('Conversation Practice', 'item duplicado (mesmo inglês)', v.join(', '), k));

// ---------- validação ----------
const trStatus = [...new Set(P.activities.map((a) => a.provenance && a.provenance.translationStatus).filter(Boolean))];
issue('The Story of John', 'validação pendente', 'traduções (273 falas, 183 itens)', trStatus.join('; '));
issue('The Story of John', 'validação pendente', `questões (${P.questions.length})`, `${QF.status} — validação da Base de Conhecimento pendente (HANDOFF D-003)`);
issue('Conversation Practice', 'validação pendente', 'jornada', `status \`${CPJ.status}\` (piloto); licença \`${CPJ.license}\` = conteúdo original do app`);
P.activities.filter((a) => !a.itemIds.length).length; // (já registrado por atividade)

// ---------- pendências ----------
{
  const by = {};
  for (const x of ISSUES) { const k = `${x.area} — ${x.tipo}`; (by[k] = by[k] || []).push(x); }
  const out = ['# Pendências, divergências e lacunas', '', 'Registro gerado pela conferência entre as fontes. **Nada foi corrigido:** cada item fica para decisão do PO ou da Base de Conhecimento.', '',
    table(['Área — tipo', 'Ocorrências'], Object.entries(by).map(([k, v]) => [k, v.length])), ''];
  for (const [k, v] of Object.entries(by)) { out.push(`## ${k} (${v.length})`, '', table(['Referência', 'Detalhe'], v.map((x) => [x.id, x.detalhe])), ''); }
  out.push('## Duplicidades e coincidências entre fontes', '', `Itens de Conversation Practice com o mesmo inglês de itens de John (não são duplicidade dentro de uma fonte; registro para a reorganização): ${crossItems.length}`, '',
    crossItems.length ? table(['Item CP', 'Inglês', 'Itens de John'], crossItems) : '—', '');
  write('pendencias.md', out.join('\n'));
}

// ---------- planilhas ----------
write('planilhas/falas.csv', csv([['fonte', 'parte_ou_unidade', 'atividade_ou_dialogo', 'posicao', 'id', 'personagem', 'ingles', 'portugues', 'audio', 'voz', 'original_fonte_en', 'original_fonte_pt', 'referencia'], ...CP_LINES.map((r) => [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], '', '', `origem ${r[10]}; itens ${r[11]}`]), ...JOHN_LINES]));
write('planilhas/itens.csv', csv([['fonte', 'id', 'classificacao', 'ingles', 'portugues', 'atividade', 'falas_relacionadas', 'audio', 'tabela_da_fonte', 'observacoes', 'fonte_arquivo', 'status'], ...ITEMS_CSV]));
write('planilhas/questoes.csv', csv([['fonte', 'id', 'atividade_ou_unidade', 'tipo_ou_habilidade', 'enunciado', 'opcoes', 'correta', 'explicacao_ou_resposta_modelo', 'falas_de_referencia', 'status'], ...Q_CSV]));

// ---------- índice mestre ----------
{
  const johnLines = P.activities.reduce((n, a) => n + a.lines.length, 0);
  const cpLines = CPJ.routines.reduce((n, r) => n + r.blocks.reduce((m, b) => m + b.sentences.length, 0), 0);
  const typeCount = (list, f) => list.reduce((m, x) => (m[f(x)] = (m[f(x)] || 0) + 1, m), {});
  const jt = typeCount(P.items, (i) => TYPE_PT[i.type] || i.type), ct = typeCount(CPJ.items, (i) => CP_CATEGORY[i.c] || i.c);
  const srcLines = Object.fromEntries(P.parts.map((p) => [p.file, MD[p.file].filter((l) => l.trim()).length]));
  const out = ['# Conteúdo de diálogos — índice mestre', '',
    `Extração completa do conteúdo de diálogos que existe neste repositório, gerada por \`dev/tools/extract-dialogue-content.mjs\` (rode de novo para atualizar). Somente leitura das fontes: nada no app ou nos dados foi alterado. Nada foi resumido, traduzido ou corrigido; divergências estão em [pendências](pendencias.md).`, '',
    '> **Escopo.** Duas fontes de diálogo: (A) a **jornada Conversation Practice** (CP01–CP02, `dev/content/journeys/cp.json`) e (B) os **diálogos de The Story of John** (7 partes, `dev/content/dialogues/`), que o app apresenta em “Diálogos”. **Fora do escopo:** as rotinas de Lucas/Karla (Daily Routine: textos de rotina, não diálogos), o texto das atividades do curso (importado no aparelho e nunca versionado) e o material do Conversation Book (sem licença; não está neste repositório).',
    '', '> **Nome.** Este acervo é uma extração do que está no repositório público. Não é a “Base Mestra” da Base de Conhecimento (privada, fora deste repositório).', '',
    '## Totais', '',
    table(['', 'Conversation Practice', 'The Story of John', 'Total'], [
      ['Unidades / partes', CPJ.routines.length, P.parts.length, CPJ.routines.length + P.parts.length],
      ['Diálogos / atividades', CPJ.routines.reduce((n, r) => n + r.blocks.length, 0), `${P.activities.length} (${P.activities.filter((a) => a.kind === 'episode').length} episódios + ${P.activities.filter((a) => a.kind !== 'episode').length} mini-diálogos)`, CPJ.routines.reduce((n, r) => n + r.blocks.length, 0) + P.activities.length],
      ['Falas', cpLines, johnLines, cpLines + johnLines],
      ['Falas com tradução', CPJ.routines.reduce((n, r) => n + r.blocks.reduce((m, b) => m + b.sentences.filter((s) => s.pt).length, 0), 0), P.activities.reduce((n, a) => n + a.lines.filter((l) => l.pt).length, 0), CPJ.routines.reduce((n, r) => n + r.blocks.reduce((m, b) => m + b.sentences.filter((s) => s.pt).length, 0), 0) + P.activities.reduce((n, a) => n + a.lines.filter((l) => l.pt).length, 0)],
      ['Itens pedagógicos (no app)', CPJ.items.length, P.items.length, CPJ.items.length + P.items.length],
      ['Itens das tabelas da fonte não integrados', '—', (REP.unassignedItems || []).length, (REP.unassignedItems || []).length],
      ['Questões / perguntas', `${CPJ.listening.length} ouvir + ${CPJ.reading.length} ler + ${CPJ.questions.length} produção`, P.questions.length, CPJ.listening.length + CPJ.reading.length + CPJ.questions.length + P.questions.length],
      ['Notas pedagógicas', `${CPJ.routines.reduce((n, r) => n + (r.usage || []).length, 0)} de uso + objetivo e gramática por unidade`, P.activities.reduce((n, a) => n + (a.notes || []).length, 0), ''],
      ['Chaves de áudio (manifesto)', MAN.journeys.length, MAN.dialogues.length, `${AUDIO_USE.size} distintas (${MAN.journeys.length + MAN.dialogues.length - AUDIO_USE.size} compartilhadas entre as fontes)`],
      ['Arquivos de áudio presentes', [...new Set(MAN.journeys.map((m) => m.key))].filter(hasFile).length, [...new Set(MAN.dialogues.map((m) => m.key))].filter(hasFile).length, [...AUDIO_USE.keys()].filter(hasFile).length],
    ]), '',
    '## Itens por classificação (classificações originais, sem fundir)', '',
    table(['Fonte', 'Classificação', 'Itens'], [...Object.entries(ct).map(([k, v]) => ['Conversation Practice', k, v]), ...Object.entries(jt).map(([k, v]) => ['The Story of John', k, v]), ['The Story of John', 'itens das tabelas sem atividade (não integrados)', (REP.unassignedItems || []).length]]), '',
    '## Hierarquia', '', 'Jornada / pacote → unidade / parte → diálogo / atividade → falas.', '',
    '### A. Jornada Conversation Practice', '',
    table(['Unidade', 'Título', 'Diálogo', 'Falas', 'Arquivo'], CPJ.routines.flatMap((r) => r.blocks.map((b, bi) => [r.id, r.title, `${bi + 1}. ${b.pt}`, b.sentences.length, `[conversation-practice/${r.id}.md](conversation-practice/${r.id}.md)`]))), '',
    `Itens: [conversation-practice/itens.md](conversation-practice/itens.md)`, '',
    '### B. The Story of John', '',
    table(['Parte', 'Atividade', 'Tipo', 'Título', 'Falas', 'Personagens', 'Itens', 'Questões', 'Arquivo'], P.parts.flatMap((p) => p.activityIds.map((id) => actById.get(id)).filter(Boolean).map((a) => [p.n, a.id, a.kind === 'episode' ? 'episódio' : 'mini-diálogo', a.title, a.lines.length, [...new Set(a.lines.map((l) => l.speaker))].join(', '), a.itemIds.length, (a.questionIds || []).length, `[parte-${p.n}.md](the-story-of-john/parte-${p.n}.md)`]))), '',
    '## Fonte autoral de John × dados do app', '',
    table(['Arquivo-fonte', 'Linhas não vazias', 'Reproduzidas literalmente na seção “fora do app” da parte'], P.parts.map((p) => [p.file, srcLines[p.file], UNCOVERED[p.file] ?? 0])), '',
    'Toda linha não vazia da fonte está ou nos dados estruturados (fala, tradução, item, contexto, nota) ou reproduzida literalmente no fim do arquivo da parte.', '',
    '## Pendências (resumo)', '', table(['Área — tipo', 'Ocorrências'], Object.entries(ISSUES.reduce((m, x) => { const k = `${x.area} — ${x.tipo}`; m[k] = (m[k] || 0) + 1; return m; }, {}))), '', 'Detalhes: [pendencias.md](pendencias.md).', '',
    '## Arquivos', '', ...FILES_OUT.map((f) => `- [${f}](${f})`), '- [00_INDICE_MESTRE.md](00_INDICE_MESTRE.md) — este índice', ''];
  write('00_INDICE_MESTRE.md', out.join('\n'));
}
console.log(JSON.stringify({ arquivos: FILES_OUT.length, pendencias: ISSUES.length, audiosUsados: AUDIO_USE.size, orfaos: orphans.length, foraDoApp: UNCOVERED }));
