// Converte content/dialogues/john-questions.src.txt (formato legível) em content/dialogues/john-questions.json
// (contrato ComprehensionQuestion, docs/produto/mvp-dialogo/05), lido por tools/dialogues-source.mjs.
//
// Confere: atividade existe; falas citadas existem (ou o contexto/título, quando citados, existem); 3 alternativas
// distintas; nenhuma pergunta repetida no mesmo diálogo; habilidade válida. A explicação mostrada depois da resposta
// = nota (quando houver) + a evidência literal (fala, contexto ou título). Questões são complemento da IA, não
// validado por professor por decisão do PO (2026-11-11); a origem fica em cada questão (rastreabilidade interna, não
// exibida ao aluno).
//
// Uso: node tools/dialogues-questions.mjs   (antes de tools/dialogues-source.mjs)
import { readFileSync, writeFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const SRC = new URL('content/dialogues/john-questions.src.txt', ROOT);
const OUT = new URL('content/dialogues/john-questions.json', ROOT);
const JOHN = JSON.parse(readFileSync(new URL('content/dialogues/john.json', ROOT), 'utf8'));
const SKILL = { F: 'explicit_fact', A: 'action', I: 'intention', C: 'context', R: 'relation', N: 'inference' };
const STATUS = 'gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)';
const pad = (n) => String(n).padStart(2, '0');

const questions = [];
const perActivity = {};
let act = null;
const errors = [];
readFileSync(SRC, 'utf8').split('\n').forEach((raw, i) => {
  const line = raw.trim();
  if (!line || line.startsWith('#')) return;
  if (line.startsWith('@')) {
    const id = line.slice(1).trim();
    act = JOHN.activities.find((a) => a.id === id);
    if (!act) errors.push(`linha ${i + 1}: atividade ${id} inexistente`);
    else perActivity[id] = [];
    return;
  }
  const f = line.split('|').map((x) => x.trim());
  if (!act) return errors.push(`linha ${i + 1}: questão fora de atividade`);
  if (f.length < 6) return errors.push(`linha ${i + 1}: campos insuficientes`);
  const [sk, refs, prompt, right, w1, w2, note = ''] = f;
  if (!SKILL[sk]) errors.push(`linha ${i + 1}: habilidade ${sk}`);
  if (new Set([right, w1, w2].map((x) => x.toLowerCase())).size !== 3) errors.push(`linha ${i + 1}: alternativas repetidas`);
  if (perActivity[act.id].some((q) => q.prompt === prompt)) errors.push(`linha ${i + 1}: pergunta repetida em ${act.id}`);
  const evidence = [];
  const sourceLineIds = [];
  for (const r of refs.split(',').map((x) => x.trim())) {
    if (r === 'ctx') { if (!act.context) errors.push(`linha ${i + 1}: ${act.id} sem contexto`); else evidence.push(`Contexto da cena: ${act.context}`); continue; }
    if (r === 'title') { evidence.push(`Título do episódio: ${act.title}`); continue; }
    const l = act.lines.find((x) => x.id.endsWith(`-${r}`));
    if (!l) { errors.push(`linha ${i + 1}: fala ${r} inexistente em ${act.id}`); continue; }
    sourceLineIds.push(l.id);
    evidence.push(`${l.speaker}: “${l.en}”`);
  }
  const n = perActivity[act.id].length + 1;
  const q = {
    id: `${act.id}-q${pad(n)}`, activityId: act.id, prompt, skill: SKILL[sk],
    options: [{ id: 'a', text: right }, { id: 'b', text: w1 }, { id: 'c', text: w2 }], correctOptionId: 'a',
    explanation: [note.replace(/^Nota:\s*/, ''), `No diálogo — ${evidence.join(' / ')}`].filter(Boolean).join(' '),
    sourceLineIds, sourceRefs: refs.split(',').map((x) => x.trim()), status: STATUS,
  };
  perActivity[act.id].push(q);
  questions.push(q);
});
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }

const missing = JOHN.activities.map((a) => ({ id: a.id, lines: a.lines.length, questions: (perActivity[a.id] || []).length })).filter((x) => x.questions < 10);
writeFileSync(OUT, JSON.stringify({ kind: 'daily-routine-english/dialogue-questions', formato: 1, status: STATUS,
  source: 'content/dialogues/john-questions.src.txt', questions, insufficient: missing }, null, 1) + '\n');
const skills = questions.reduce((m, q) => ({ ...m, [q.skill]: (m[q.skill] || 0) + 1 }), {});
console.log(JSON.stringify({ questions: questions.length, complete: JOHN.activities.length - missing.length, insufficient: missing.length, skills }));
