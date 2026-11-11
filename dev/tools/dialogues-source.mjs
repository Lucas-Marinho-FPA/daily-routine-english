// Gera a fonte estruturada das atividades de diálogo a partir dos documentos autorais (Markdown) de
// dev/content/dialogues/source/<pacote>/ — hoje “The Story of John” (sete partes).
//
// Regras (docs/produto/mvp-dialogo/05 e 08):
//  • o texto em inglês e a tradução em português de cada fala são copiados LITERALMENTE (nada é corrigido,
//    resumido ou completado); a conferência no fim refaz cada fala a partir do Markdown e compara caractere a
//    caractere;
//  • uma fala de diálogo é “**Pessoa:** texto” seguida da linha “*Pessoa: tradução*”; rótulos em negrito sem
//    tradução logo abaixo (Language focus, Note, respostas A/B…) não são falas;
//  • atividade = cada seção (Episode ou outra subseção) que contém falas; IDs estruturais locais e estáveis
//    (john-p1-e01, john-p1-e01-l01, john-p1-e01-v01) — NÃO são códigos pedagógicos (ACT/SRC/MAT/EX/VOC);
//  • vocabulário = linhas das tabelas “| English | Português |”; o item fica na atividade da seção onde a tabela
//    está e também em toda atividade da mesma parte cujas falas contêm o item (vínculo verificável, sourceLineIds);
//  • questões de compreensão: os documentos NÃO trazem as dez questões objetivas por diálogo; nada é inventado
//    aqui (a fase 4 fica bloqueada por conteúdo até chegar um arquivo de questões curado — ver questionsFile);
//  • lacunas e decisões ficam no relatório (dev/content/dialogues/<pacote>-report.json).
//
// Uso: node tools/dialogues-source.mjs   (na cópia de trabalho; grava content/dialogues/john.json e o relatório)
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { findPattern, wordTokens } from '../app/js/engine/text.js';

const ROOT = new URL('../', import.meta.url);
const SRC_DIR = new URL('content/dialogues/source/the-story-of-john/', ROOT);
const OUT = new URL('content/dialogues/john.json', ROOT);
const REPORT = new URL('content/dialogues/john-report.json', ROOT);
const QUESTIONS = new URL('content/dialogues/john-questions.json', ROOT); // opcional (curado fora deste gerador)

// Elenco recorrente (00_LEIA-ME.md, “Elenco recorrente”) + papéis que aparecem nas falas.
const CAST = {
  John: 'john', Mary: 'mary', Rick: 'rick', Jessy: 'jessy', Peter: 'peter', Ruan: 'ruan', Stuart: 'stuart', Ana: 'ana',
  Ketlyn: 'ketlyn', Joana: 'joana', Rodri: 'rodri', Penelope: 'penelope',
};
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const speakerId = (name) => {
  const base = name.replace(/\s*\(.*\)\s*$/, '').trim(); // “Mary (on the phone)” → Mary
  return CAST[base] || `role-${slug(base)}`;
};
const pad = (n) => String(n).padStart(2, '0');

const files = readdirSync(SRC_DIR).filter((f) => /^0[1-9]_.*\.md$/.test(f)).sort();
const hash = createHash('sha256');
const parts = [];
const activities = [];
const report = { package: 'the-story-of-john', files: [], unassignedItems: [], notDialogue: [], warnings: [], decisions: [] };

const SPEAKER = /^\*\*([^*]+?):\*\*\s+(.+?)\s*$/; // **Pessoa:** texto (dois espaços finais = quebra de linha do Markdown)
const TRANSL = /^\*([^*]+?):\s+(.+)\*\s*$/; // *Pessoa: tradução*
const TABLE_HEAD = /^\|\s*English\s*\|\s*Portugu[eê]s\s*\|\s*$/i;

for (const file of files) {
  const raw = readFileSync(new URL(file, SRC_DIR), 'utf8');
  hash.update(file).update(raw);
  const lines = raw.split('\n');
  const partM = raw.match(/^## Part (\d+) — (.+)$/m);
  if (!partM) throw new Error(`${file}: título “## Part N — …” não encontrado`);
  const pn = Number(partM[1]);
  const part = { id: `john-p${pn}`, n: pn, title: partM[2].trim(), file, activityIds: [], partItems: [] };
  parts.push(part);
  const fileRep = { file, part: pn, dialogueLines: 0, activities: 0, items: 0 };
  report.files.push(fileRep);

  let section = null; // { level, title, ep, epTitle, tables: [], act }
  let current = null; // atividade da seção atual (criada na 1ª fala)
  let extraN = 0;
  let pendingContext = [];
  let focus = null; // linhas literais de foco linguístico/notas da seção (painel “Gramática”, sob demanda)

  const FOCUS = /^(Language focus|Grammar|Expression focus|Useful|Chunks|British time|Comparison patterns|Telephone)/i;
  const closeFocus = () => { if (focus && section && section.act && focus.length > 1) section.act.notes.push(focus.join('\n').trim()); focus = null; };
  const closeSection = () => {
    closeFocus();
    if (section && !section.act) for (const t of section.tables) part.partItems.push(t); // seção sem falas: vocabulário da parte
    if (section && section.act) section.act._tableItems = [...(section.act._tableItems || []), ...section.tables];
    section = null; current = null; pendingContext = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const head = line.match(/^(#{2,4})\s+(.+?)\s*$/);
    if (head) {
      const level = head[1].length;
      const title = head[2];
      const ep = title.match(/^Episode (\d+) — (.+)$/);
      // dentro de seções que não são Episode (ex.: “Source coverage”), cada subseção é independente (mini-diálogos próprios)
      if (ep || !section || level <= section.level || section.ep === null) {
        // nova seção: Episode (## ou ###) ou outra seção do mesmo nível ou acima
        closeSection();
        section = { level, title, ep: ep ? Number(ep[1]) : null, epTitle: ep ? ep[2] : title, tables: [], act: null };
      } else {
        // subseção dentro da seção atual (foco linguístico, vocabulário, expressões…)
        closeFocus();
        section.sub = title;
        if (FOCUS.test(title)) focus = [`### ${title}`];
      }
      continue;
    }
    const sp = line.match(SPEAKER);
    if (sp) {
      // a tradução é a próxima linha não vazia, no formato *Pessoa: …*
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      const tr = j < lines.length ? lines[j].match(TRANSL) : null;
      const instruction = /^(Practice instruction|Instruction|Note|Nota|Language focus|Grammar)/i.test(sp[1].trim()); // orientação, não fala de personagem
      if (!tr || instruction) { report.notDialogue.push({ file, line: i + 1, label: sp[1] }); if (focus) focus.push(line); continue; }
      if (!section) section = { level: 2, title: part.title, ep: null, epTitle: part.title, tables: [], act: null };
      if (!current) {
        const isEp = section.ep !== null;
        if (!isEp) extraN++;
        const id = isEp ? `john-p${pn}-e${pad(section.ep)}` : `john-p${pn}-x${pad(extraN)}`;
        if (activities.some((a) => a.id === id)) throw new Error(`${file}: id repetido ${id}`);
        current = {
          id, part: part.id, partN: pn, kind: isEp ? 'episode' : 'supplementary', order: activities.filter((a) => a.part === part.id).length + 1,
          title: section.epTitle, sectionTitle: section.title,
          context: pendingContext.join(' ').trim() || null, lines: [], itemIds: [], notes: [], questionIds: [],
          provenance: { file, firstLine: i + 1, kind: 'autoral (The Story of John)', translationStatus: 'referência autoral — não validada pelo professor' },
        };
        activities.push(current);
        part.activityIds.push(id);
        section.act = current;
        fileRep.activities++;
      }
      const n = current.lines.length + 1;
      current.lines.push({
        id: `${current.id}-l${pad(n)}`, seq: n, speaker: sp[1].trim(), speakerId: speakerId(sp[1]), en: sp[2],
        pt: tr[2].trim(), ptSpeaker: tr[1].trim(), src: { file, line: i + 1, ptLine: j + 1 },
      });
      fileRep.dialogueLines++;
      i = j;
      continue;
    }
    if (TABLE_HEAD.test(line)) {
      let j = i + 2; // pula o separador |---|---|
      for (; j < lines.length && /^\|/.test(lines[j]); j++) {
        const cells = lines[j].split('|').slice(1, -1).map((c) => c.trim());
        if (cells.length >= 2 && cells[0]) {
          const it = { en: cells[0], pt: cells[1], src: { file, line: j + 1 }, table: section ? (section.sub || section.title) : null };
          if (section) section.tables.push(it); else part.partItems.push(it);
        }
      }
      i = j - 1;
      continue;
    }
    // contexto da cena: parágrafo comum logo depois do título, antes da 1ª fala
    if (section && !current && !section.sub && line.trim() && !/^[|>*-]/.test(line.trim())) pendingContext.push(line.trim());
    if (focus && line.trim()) focus.push(line);
  }
  closeSection();
  // tabelas das seções com falas pertencem à atividade da seção
}
// ---------- itens de vocabulário ----------
// localizar o item nas falas: mesmo matcher do app (flexões “get” ~ “gets”, possessivos); o texto exibido continua literal
const norm = (s) => ` ${s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()} `;
const inLine = (v, line) => !!findPattern(v, wordTokens(line), { separable: true });
const variantsOf = (en) => en.split(/\s*\/\s*/).map((v) => v.replace(/\(.*?\)/g, '').replace(/\.\.\.|…/g, ' ').trim()).filter((v) => v.length > 1);
const itemType = (en) => {
  const w = en.replace(/[.!?]$/, '').trim().split(/\s+/);
  if (/[.!?]$/.test(en.trim()) || w.length >= 4) return 'expression';
  if (w.length === 1) return 'word';
  if (/^(get|go|come|look|put|hang|hold|take|pick|set|turn|check|find|give|run|break|call|carry|fill|work|try|sort|ring|cut|drop|make)$/i.test(w[0]) && /^(up|down|in|on|off|out|back|over|away|through|along|round|around|after|together|into)$/i.test(w[w.length - 1])) return 'phrasal_verb';
  return 'chunk';
};
const items = [];
const itemsById = new Map();
function addItem(act, it, how) {
  const key = norm(it.en).trim();
  if (act.itemIds.some((id) => norm(itemsById.get(id).en).trim() === key)) return; // mesmo item duas vezes na atividade
  const sourceLineIds = act.lines.filter((l) => variantsOf(it.en).some((v) => inLine(v, l.en))).map((l) => l.id);
  const id = `${act.id}-v${pad(act.itemIds.length + 1)}`;
  const item = { id, activityId: act.id, type: itemType(it.en), en: it.en, pt: it.pt, sourceLineIds, link: how, src: it.src, table: it.table };
  items.push(item);
  itemsById.set(id, item);
  act.itemIds.push(id);
}
for (const act of activities) for (const it of act._tableItems || []) addItem(act, it, 'tabela da seção');
for (const part of parts) {
  for (const it of part.partItems) {
    const owners = activities.filter((a) => a.part === part.id && a.lines.some((l) => variantsOf(it.en).some((v) => inLine(v, l.en))));
    if (!owners.length) { report.unassignedItems.push({ part: part.n, en: it.en, table: it.table, src: it.src }); continue; }
    for (const a of owners) addItem(a, it, 'tabela da parte; presente nas falas');
  }
}
// itens de tabela da seção que não aparecem literalmente nas falas: continuam no vocabulário da atividade, sinalizados
for (const it of items) if (!it.sourceLineIds.length) report.warnings.push(`${it.id} “${it.en}”: não aparece literalmente nas falas da atividade (vocabulário da seção).`);
for (const a of activities) {
  delete a._tableItems;
  if (!a.itemIds.length) report.warnings.push(`${a.id}: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).`);
  for (const l of a.lines) if (l.ptSpeaker !== l.speaker && !/[A-Z]$/.test(l.speaker)) report.decisions.push(`${l.id}: rótulo da tradução “${l.ptSpeaker}” ≠ “${l.speaker}” (tradução do papel; mantido literal).`);
}

// ---------- questões (opcionais, curadas fora daqui) ----------
let questions = [];
if (existsSync(QUESTIONS)) {
  const q = JSON.parse(readFileSync(QUESTIONS, 'utf8'));
  questions = q.questions || [];
  for (const x of questions) {
    const a = activities.find((y) => y.id === x.activityId);
    if (!a) throw new Error(`questão ${x.id}: atividade ${x.activityId} inexistente`);
    a.questionIds.push(x.id);
  }
}
for (const a of activities) if (a.questionIds.length < 10) report.warnings.push(`${a.id}: ${a.questionIds.length} de 10 questões de compreensão curadas (fase 4 bloqueada por conteúdo).`);

// ---------- conferência literal: cada fala refeita a partir do Markdown ----------
let checked = 0;
for (const a of activities) for (const l of a.lines) {
  const md = readFileSync(new URL(l.src.file, SRC_DIR), 'utf8').split('\n');
  const en = md[l.src.line - 1].match(SPEAKER)[2];
  const pt = md[l.src.ptLine - 1].match(TRANSL)[2].trim();
  if (en !== l.en || pt !== l.pt) throw new Error(`${l.id}: texto diferente do documento`);
  checked++;
}

const contentVersion = hash.digest('hex').slice(0, 12);
const out = {
  kind: 'daily-routine-english/dialogues', formato: 1, id: 'the-story-of-john', title: 'The Story of John', locale: 'en-GB',
  contentVersion, generatedBy: 'dev/tools/dialogues-source.mjs',
  provenance: 'Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.',
  cast: Object.fromEntries([...new Set(activities.flatMap((a) => a.lines.map((l) => l.speakerId)))].map((id) => [id, activities.flatMap((a) => a.lines).find((l) => l.speakerId === id).speaker.replace(/\s*\(.*\)$/, '')])),
  parts, activities, items, questions,
};
for (const p of out.parts) delete p.partItems;
writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
report.summary = { contentVersion, parts: parts.length, activities: activities.length, lines: checked, items: items.length, questions: questions.length,
  activitiesWithoutItems: activities.filter((a) => !a.itemIds.length).length, unassignedItems: report.unassignedItems.length };
writeFileSync(REPORT, JSON.stringify(report, null, 1) + '\n');
console.log(JSON.stringify(report.summary));
