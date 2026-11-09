// Base Pedagógica — gera, a partir de base/, os arquivos derivados: a lista de arquivos do manifesto (hash e contagem)
// e o Markdown de leitura (docs/base-pedagogica/gerado/). O JSON/JSONL é a fonte; o Markdown nunca é editado à mão.
// Uso (na raiz do repositório): node dev/tools/base/gerar.mjs        (grava)   |   --conferir (só compara; sai 1 se mudou)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPO, BASE, hashBytes, lerJsonl, arquivosBase } from './lib.mjs';

const ROTULO = { FON: 'fontes', ORI: 'registros de origem', VOC: 'vocabulário', EXP: 'expressões', GRA: 'gramática', TXT: 'textos', SEG: 'segmentos', DIA: 'diálogos', PER: 'perguntas', RSP: 'respostas-modelo', ATV: 'atividades', EXE: 'exercícios', CTX: 'contextos', PSG: 'personagens', REL: 'relações', DEC: 'decisões', DIV: 'divergências' };

export function gerar() {
  const manifesto = JSON.parse(readFileSync(join(BASE, 'manifesto.json'), 'utf8'));
  const registros = [];
  const arquivos = arquivosBase().map((f) => {
    const buf = readFileSync(join(BASE, f));
    const item = { caminho: f, sha256: hashBytes(buf).slice(7) };
    if (f.endsWith('.jsonl')) { const rs = lerJsonl(buf.toString('utf8')); item.registros = rs.length; if (f !== 'ids.jsonl') registros.push(...rs); }
    return item;
  });
  manifesto.arquivos = arquivos;

  const n = (t) => registros.filter((r) => r.tipo === t).length;
  const L = [];
  L.push('# Base Pedagógica — inventário (GERADO)', '');
  L.push('> Gerado por `node dev/tools/base/gerar.mjs` a partir de `base/`. **Não editar à mão** — a validação compara.', '');
  L.push(`Esquema: \`${manifesto.esquema}\` · camada: ${manifesto.camada} · estado: **${manifesto.estado}**`, '');
  L.push('## Registros por tipo', '', '| Tipo | Descrição | Registros |', '|---|---|---|');
  for (const [t, d] of Object.entries(ROTULO)) L.push(`| \`${t}\` | ${d} | ${n(t)} |`);
  L.push('', `Unidades com status \`proposto\` (não ativas): ${registros.filter((r) => r.status === 'proposto').length} · ` +
    `com lacunas registradas: ${registros.filter((r) => (r.lacunas || []).length).length} · ` +
    `divergências abertas: ${registros.filter((r) => r.tipo === 'DIV' && r.status === 'aberta').length}`, '');
  L.push('## Fontes registradas', '');
  const fons = registros.filter((r) => r.tipo === 'FON');
  if (!fons.length) L.push('Nenhuma fonte registrada ainda (a ingestão é a Etapa 4).', '');
  else { L.push('| ID | Camada | Natureza | Arquivo | Versão | Conferência |', '|---|---|---|---|---|---|'); for (const f of fons) L.push(`| ${f.id} | ${f.camada} | ${f.natureza} | ${f.arquivo ? `\`${f.arquivo}\`` : '—'} | ${f.versao || '—'} | ${f.conferencia || '—'} |`); L.push(''); }
  L.push('## Plano de ingestão e conferência por fonte', '', '| Ordem | Fonte (inventário) | Camada | Conferência | Observação |', '|---|---|---|---|---|');
  for (const c of manifesto.plano_de_ingestao || []) L.push(`| ${c.ordem} | ${c.fontes} | ${c.camada} | **${c.conferencia}** | ${c.observacao || ''} |`);
  L.push('', '## Arquivos', '', '| Arquivo | Registros | SHA-256 (início) |', '|---|---|---|');
  for (const a of arquivos) L.push(`| \`base/${a.caminho}\` | ${a.registros ?? '—'} | \`${a.sha256.slice(0, 16)}\` |`);
  L.push('');
  return { manifesto, markdown: { 'docs/base-pedagogica/gerado/inventario.md': L.join('\n') } };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const g = gerar();
  const saidas = { 'base/manifesto.json': JSON.stringify(g.manifesto, null, 2) + '\n', ...g.markdown };
  let mudou = 0;
  for (const [p, c] of Object.entries(saidas)) {
    const abs = join(REPO, p);
    const igual = existsSync(abs) && readFileSync(abs, 'utf8') === c;
    if (!igual) mudou++;
    if (!process.argv.includes('--conferir') && !igual) { mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, c); }
    console.log(`${igual ? 'igual  ' : process.argv.includes('--conferir') ? 'MUDOU  ' : 'gravado'} ${p}`);
  }
  process.exit(process.argv.includes('--conferir') && mudou ? 1 : 0);
}
