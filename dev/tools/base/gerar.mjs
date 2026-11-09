// Base Pedagógica — gera, a partir de base/, os arquivos derivados: a lista de arquivos do manifesto (hash e contagem)
// e o Markdown de leitura em docs/base-pedagogica/gerado/. O JSON/JSONL é a fonte; o Markdown nunca é editado à mão.
// Uso (na raiz do repositório): node dev/tools/base/gerar.mjs        (grava)   |   --conferir (só compara; sai 1 se mudou)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REPO, BASE, hashBytes, lerJsonl, arquivosBase } from './lib.mjs';
import { FONTES } from './fontes.mjs';
import { padraoLiteral } from './derivar.mjs';

const ROTULO = { FON: 'fontes', ORI: 'registros de origem (literais)', VOC: 'vocabulário (uma palavra)', EXP: 'expressões', GRA: 'estruturas gramaticais', TXT: 'textos', SEG: 'segmentos (parágrafos, frases, falas)', DIA: 'diálogos', PER: 'perguntas', RSP: 'respostas-modelo', ATV: 'atividades', EXE: 'exercícios', CTX: 'contextos', PSG: 'personagens', REL: 'relações', DEC: 'decisões', DIV: 'divergências' };
const G = 'docs/base-pedagogica/gerado';
const cel = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const cab = (titulo) => [`# ${titulo} (GERADO)`, '', '> Gerado por `node dev/tools/base/gerar.mjs` a partir de `base/`. **Não editar à mão** — a validação compara.', ''];

export function gerar() {
  const manifesto = JSON.parse(readFileSync(join(BASE, 'manifesto.json'), 'utf8'));
  const registros = [], conferencias = [];
  const arquivos = arquivosBase().map((f) => {
    const buf = readFileSync(join(BASE, f));
    const item = { caminho: f, sha256: hashBytes(buf).slice(7) };
    if (f.endsWith('.jsonl')) { const rs = lerJsonl(buf.toString('utf8')); item.registros = rs.length; if (f !== 'ids.jsonl' && !f.startsWith('progressao/')) registros.push(...rs); }
    if (f.startsWith('conferencia/') && f.endsWith('.json')) conferencias.push(JSON.parse(buf.toString('utf8')));
    return item;
  });
  manifesto.arquivos = arquivos;
  const por = new Map(registros.map((r) => [r.id, r]));
  const de = (t) => registros.filter((r) => r.tipo === t);
  const n = (t) => de(t).length;
  const md = {};

  // ---------- inventário ----------
  let L = cab('Base Pedagógica — inventário');
  L.push(`Esquema: \`${manifesto.esquema}\` · estado: **${manifesto.estado}**`, '');
  L.push('## Registros por tipo', '', '| Tipo | Descrição | Registros |', '|---|---|---|');
  for (const [t, d] of Object.entries(ROTULO)) L.push(`| \`${t}\` | ${d} | ${n(t)} |`);
  const lex = registros.filter((r) => r.tipo === 'VOC' || r.tipo === 'EXP');
  L.push('', `Unidades \`proposto\` (não ativas): ${registros.filter((r) => r.status === 'proposto').length} · léxico com lacuna “sem contexto de texto”: ${lex.filter((u) => (u.lacunas || []).includes('sem_contexto_de_texto')).length} · “sem tradução”: ${lex.filter((u) => (u.lacunas || []).includes('sem_traducao')).length} · divergências abertas: ${de('DIV').filter((d) => d.status === 'aberta').length}`, '');
  L.push('## Fontes', '', '| ID | Código | Título | Natureza | Distribuição | Arquivo @ versão | Conferência |', '|---|---|---|---|---|---|---|');
  for (const f of de('FON')) L.push(`| ${f.id} | ${f.codigo} | ${cel(f.titulo)} | ${f.natureza} | ${f.distribuicao} | ${f.arquivo ? `\`${f.arquivo}\` @ ${f.versao}` : '—'} | ${f.conferencia} |`);
  L.push('', '## Plano de consolidação', '', '| Ordem | Fontes | Situação | Observação |', '|---|---|---|---|');
  for (const c of manifesto.plano || []) L.push(`| ${c.ordem} | ${cel(c.fontes)} | **${c.situacao}** | ${cel(c.observacao || '')} |`);
  L.push('', '## Arquivos', '', '| Arquivo | Registros | SHA-256 (início) |', '|---|---|---|');
  for (const a of arquivos) L.push(`| \`base/${a.caminho}\` | ${a.registros ?? '—'} | \`${a.sha256.slice(0, 16)}\` |`);
  md[`${G}/inventario.md`] = L.join('\n') + '\n';

  // ---------- conferência por fonte ----------
  L = cab('Base Pedagógica — conferência por fonte');
  if (!conferencias.length) L.push('Nenhuma fonte consolidada ainda.', '');
  for (const c of conferencias) {
    const f = por.get(c.fonte);
    L.push(`## ${c.codigo} — ${cel(f?.titulo)} (\`${c.fonte}\`)`, '');
    L.push(`- Arquivo: \`${c.arquivo}\` @ \`${c.versao}\` · SHA-256 \`${c.hash_arquivo.slice(7)}\``);
    L.push(`- Registros originais: **${c.originais}** · incorporados (ORI): **${c.incorporados}** · pendentes: **${c.pendentes.length}** · reconstruível a partir dos ORI: **${c.recuperavel ? 'sim' : 'não'}**`);
    L.push(`- Destino: ${c.destinos.em_unidades} em unidades · ${c.destinos.sem_unidade} preservados sem unidade (${Object.entries(c.destinos.por_destino).map(([k, v]) => `${k} ${v}`).join(', ') || '—'}) · situação: **${f?.conferencia}**`, '');
    if (c.pendentes.length) { L.push('| Pendente | Motivo |', '|---|---|'); for (const p of c.pendentes) L.push(`| \`${p.local}\` | ${cel(p.motivo)} |`); L.push(''); }
    if (c.sem_unidade.length) {
      L.push('<details><summary>Registros preservados sem unidade pedagógica</summary>', '', '| ORI | Local | Destino | Motivo |', '|---|---|---|---|');
      for (const s of c.sem_unidade) L.push(`| ${s.ori} | \`${cel(por.get(s.ori)?.local)}\` | ${s.destino} | ${cel(s.motivo)} |`);
      L.push('', '</details>', '');
    }
  }
  const divs = de('DIV');
  L.push('## Divergências', '');
  if (!divs.length) L.push('Nenhuma.', '');
  else { L.push('| ID | Unidade | Assunto | Versões (valor ← ORI) | Situação |', '|---|---|---|---|---|'); for (const d of divs) L.push(`| ${d.id} | ${d.unidade} | ${cel(d.assunto)} | ${d.versoes.map((x) => `“${cel(x.valor)}” ← ${x.ori}`).join('; ')} | ${d.status} |`); L.push(''); }
  const decs = de('DEC');
  const revogadaPor = new Map(decs.filter((d) => d.status === 'aprovada').flatMap((d) => (d.revoga || []).map((x) => [x, d.id])));
  L.push('## Decisões', '');
  if (!decs.length) L.push('Nenhuma.', '');
  else {
    L.push('| ID | Data | Decisão | Efeito | Revoga | Situação |', '|---|---|---|---|---|---|');
    for (const d of decs) L.push(`| ${d.id} | ${d.data} | ${cel(d.decisao)} | ${(d.efeitos || []).map((e) => `${e.unidade}.${e.campo} = ${e.valor}`).join('; ')} | ${(d.revoga || []).join(', ') || '—'} | ${revogadaPor.has(d.id) ? `revogada por ${revogadaPor.get(d.id)} (mantida como histórico, sem efeito)` : d.status === 'aprovada' ? 'em vigor' : d.status} |`);
    L.push('');
  }
  const rels = de('REL');
  L.push('## Relações', '');
  if (!rels.length) L.push('Nenhuma relação registrada nesta etapa.', '');
  else { L.push('| ID | De | Relação | Para | Situação |', '|---|---|---|---|---|'); for (const r of rels) L.push(`| ${r.id} | ${r.de} | ${r.relacao} | ${r.para} | ${r.status} |`); L.push(''); }
  md[`${G}/conferencia.md`] = L.join('\n') + '\n';

  // ---------- vocabulário e expressões ----------
  L = cab('Base Pedagógica — vocabulário e expressões');
  L.push('| ID | Forma | Subtipo | Traduções (cada uma com origem no registro) | Categorias nas fontes | Exemplos | Lacunas |', '|---|---|---|---|---|---|---|');
  for (const u of [...lex].sort((a, b) => a.forma.localeCompare(b.forma, 'en'))) {
    L.push(`| ${u.id} | **${cel(u.forma)}** | ${u.tipo === 'EXP' ? u.subtipo ?? '—' : '(palavra)'} | ${[...new Set((u.traducoes || []).map((t) => t.texto))].map(cel).join(' · ')} | ${[...new Set((u.classificacoes_origem || []).map((c) => c.categoria))].join(', ')} | ${(u.exemplos || []).length} | ${(u.lacunas || []).join(', ')} |`);
  }
  md[`${G}/vocabulario-e-expressoes.md`] = L.join('\n') + '\n';

  // ---------- textos ----------
  L = cab('Base Pedagógica — textos');
  for (const t of de('TXT')) {
    L.push(`## ${t.id} · ${cel(t.id_original)}${t.titulo ? ` — ${cel(t.titulo.valor)}` : ''}${t.titulo_pt ? ` (${cel(t.titulo_pt.valor)})` : ''}`, '');
    if (t.objetivo) L.push(`Objetivo: ${cel(t.objetivo.valor)}`, '');
    for (const s of t.segmentos) {
      const sg = por.get(s);
      L.push(`- ${sg.falante ? `**${cel(sg.falante.valor)}:** ` : ''}${cel(sg.original)}${sg.traducoes?.length ? `  \n  _${cel(sg.traducoes[0].texto)}_` : ''}`);
    }
    L.push('');
  }
  md[`${G}/textos.md`] = L.join('\n') + '\n';

  // ---------- perguntas e atividades ----------
  L = cab('Base Pedagógica — perguntas, respostas e atividades');
  for (const a of de('ATV')) {
    L.push(`## ${a.id} · ${cel(a.id_original)}`, '');
    const rs = (a.respostas || []).map((r) => por.get(r));
    for (const r of rs) L.push(`- **${cel(por.get(r.pergunta).enunciado)}** (${r.id_original})  \n  ${cel(r.original)}`);
    for (const x of a.perguntas_abertas || []) L.push(`- **${cel(por.get(x.pergunta).enunciado)}** (${x.id_original}) — pergunta aberta, sem resposta-modelo na fonte${x.dica ? `; dica: _${cel(x.dica.valor)}_` : ''}`);
    L.push('');
  }
  md[`${G}/perguntas-e-atividades.md`] = L.join('\n') + '\n';

  // ---------- gramática e exercícios ----------
  L = cab('Base Pedagógica — gramática e exercícios');
  L.push('## Estruturas', '', '| ID | Estrutura | Tradução | Nota |', '|---|---|---|---|');
  for (const g of de('GRA')) L.push(`| ${g.id} | ${cel(g.estrutura)} | ${cel(g.traducoes?.[0]?.texto)} | ${cel(g.explicacoes?.[0]?.texto)} |`);
  L.push('', '## Exercícios', '');
  for (const e of de('EXE')) {
    L.push(`### ${e.id} · ${cel(e.titulo?.valor || e.id_original)}`, '');
    for (const it of e.itens) { const o = por.get(it.ori); const val = it.campo ? it.campo.split('/').reduce((x, k) => x?.[k], o.conteudo) : o.conteudo; L.push(`- ${cel(val)}`); }
    L.push('');
  }
  md[`${G}/gramatica-e-exercicios.md`] = L.join('\n') + '\n';
  md[`${G}/personagens.md`] = personagens(registros, por);
  return { manifesto, markdown: md };
}

// ---------- visão integrada dos personagens (só fatos dos dados; propostas ficam fora daqui) ----------
function personagens(registros, por) {
  const NOME = { lucas: 'Lucas', karla: 'Karla', lukinhas: 'Lukinhas' };
  const grupoDaFonte = new Map();
  for (const f of registros.filter((r) => r.tipo === 'FON')) { const g = FONTES.find((x) => x.codigo === f.codigo)?.grupo; if (NOME[g]) grupoDaFonte.set(f.id, g); }
  const quemDoOri = (o) => grupoDaFonte.get(por.get(o)?.fonte);
  const psgGrupo = new Map(registros.filter((r) => r.tipo === 'PSG').map((p) => [p.id, { lucas: 'lucas', karla: 'karla', 'lucas-kid': 'lukinhas' }[p.codigo]]));
  const txtDe = new Map(registros.filter((r) => r.tipo === 'TXT').map((t) => [t.id, t]));
  const quemDoSeg = (s) => psgGrupo.get(txtDe.get(por.get(s)?.texto)?.personagens?.[0]);
  const ordemTxt = (t) => t?.id_original ?? '';
  const gs = ['lucas', 'karla', 'lukinhas'];
  const segsNarr = registros.filter((r) => r.tipo === 'SEG' && quemDoSeg(r.id));
  const declarado = new Map();
  for (const sg of segsNarr) for (const x of sg.itens_da_fonte || []) (declarado.get(x.valor) || declarado.set(x.valor, []).get(x.valor)).push(sg.id);
  const flex = registros.filter((r) => r.tipo === 'REL' && r.relacao === 'aparece_em' && r.forma_encontrada !== undefined);
  const lex = registros.filter((r) => r.tipo === 'VOC' || r.tipo === 'EXP');
  const info = lex.map((u) => {
    const cat = new Set(u.evidencias.map((e) => quemDoOri(e.ori)).filter(Boolean));
    const re = padraoLiteral(u);
    const lit = segsNarr.filter((sg) => re.test(sg.original)).map((sg) => sg.id);
    const dec = declarado.get(u.id) || [];
    const fc = flex.filter((r) => r.de === u.id && r.status === 'confirmada').map((r) => r.para);
    const fp = flex.filter((r) => r.de === u.id && r.status === 'proposta').map((r) => r.para);
    const quem = (l) => new Set(l.map(quemDoSeg).filter(Boolean));
    const uso = { lit: quem(lit), dec: quem(dec), fc: quem(fc), fp: quem(fp) };
    uso.antigo = new Set([...uso.lit, ...uso.dec]);              // critério do relatório anterior: literal ∪ marcado
    uso.todos = new Set([...uso.lit, ...uso.dec, ...uso.fc]);     // + flexão confirmada (candidatas nunca contam)
    const primeira = {};
    for (const sId of [...lit, ...dec, ...fc]) { const g = quemDoSeg(sId); const t = txtDe.get(por.get(sId).texto); if (g && (!primeira[g] || ordemTxt(t) < primeira[g])) primeira[g] = ordemTxt(t); }
    return { u, cat, lit, dec, fc, fp, uso, primeira };
  });
  const L = cab('Base Pedagógica — personagens: catálogo, uso em texto e o que NÃO se pode inferir');
  L.push('Três conceitos, nunca misturados:', '',
    '1. **Catálogo** — o item consta do material do personagem (a fonte do personagem registra o item: R1–R7 Lucas, R8 Karla, R9 Lukinhas).',
    '2. **Uso em texto** — o item ocorre nos textos narrativos do personagem, por um de três critérios, contados separadamente: **literal** (forma, variante ou `match` da fonte, sem diferenciar maiúsculas, com limites de palavra), **marcado pela fonte** (a frase lista o item em `items`) e **flexão confirmada** (`REL aparece_em` confirmada; candidatas são listadas à parte e não contam).',
    '3. **Conhecimento demonstrado** — domínio comprovado pelo aluno. **Não pode ser inferido da Base**: presença de uma palavra no material ou num texto não é evidência de aprendizagem. Esse dado, se existir, vem do progresso no aplicativo, fora do escopo da Base.', '');
  // ---------- 1. catálogo ----------
  L.push('## 1. Catálogo', '', '| Personagem | Itens no catálogo | Exclusivos | Compartilhados com 1 outro | Compartilhados com os 2 outros |', '|---|---|---|---|---|');
  for (const g of gs) {
    const m = info.filter((x) => x.cat.has(g));
    L.push(`| ${NOME[g]} | ${m.length} | ${m.filter((x) => x.cat.size === 1).length} | ${m.filter((x) => x.cat.size === 2).length} | ${m.filter((x) => x.cat.size === 3).length} |`);
  }
  const par = (a, b) => info.filter((x) => x.cat.size === 2 && x.cat.has(a) && x.cat.has(b)).length;
  L.push('', `Compartilhados por exatamente dois: Lucas–Karla ${par('lucas', 'karla')} · Lucas–Lukinhas ${par('lucas', 'lukinhas')} · Karla–Lukinhas ${par('karla', 'lukinhas')} · total ${info.filter((x) => x.cat.size === 2).length}. Pelos três: ${info.filter((x) => x.cat.size === 3).length}. Itens de catálogo distintos: ${info.filter((x) => x.cat.size).length}.`, '');
  // ---------- 2. uso em texto ----------
  L.push('## 2. Uso nos textos de cada personagem (unidades distintas)', '', '| Personagem | Literal | Marcado pela fonte | Flexão confirmada | Algum dos três | Candidatas de flexão (não contam) |', '|---|---|---|---|---|---|');
  for (const g of gs) L.push(`| ${NOME[g]} | ${info.filter((x) => x.uso.lit.has(g)).length} | ${info.filter((x) => x.uso.dec.has(g)).length} | ${info.filter((x) => x.uso.fc.has(g)).length} | ${info.filter((x) => x.uso.todos.has(g)).length} | ${info.filter((x) => x.uso.fp.has(g)).length} |`);
  const nLit = info.reduce((n, x) => n + x.lit.length, 0), nDec = info.reduce((n, x) => n + x.dec.length, 0);
  L.push('', `Ocorrências (pares unidade × segmento): literais ${nLit} · marcadas pela fonte ${nDec} · flexões confirmadas ${flex.filter((r) => r.status === 'confirmada').length} · candidatas ${flex.filter((r) => r.status === 'proposta').length}. Um mesmo segmento pode contar por mais de um critério.`, '');
  // ---------- 3. uso em textos de outro personagem ----------
  L.push('## 3. Itens usados nos textos de um personagem que não os tem no catálogo', '', '| Critério de uso | Itens (catálogo de 1 só personagem) usados em textos de outro | … destes, usados nos textos dos três | Itens (qualquer catálogo) usados em textos de outro |', '|---|---|---|---|');
  for (const [rot, k] of [['literal', 'lit'], ['marcado pela fonte', 'dec'], ['flexão confirmada', 'fc'], ['literal ∪ marcado (critério do relatório anterior)', 'antigo'], ['literal ∪ marcado ∪ flexão confirmada', 'todos']]) {
    const fora = (x) => [...x.uso[k]].some((g) => !x.cat.has(g));
    const sel = info.filter((x) => x.cat.size === 1 && fora(x));
    L.push(`| ${rot} | ${sel.length} | ${sel.filter((x) => x.uso[k].size === 3).length} | ${info.filter((x) => x.cat.size && fora(x)).length} |`);
  }
  L.push('');
  const lista = (titulo, f) => {
    const sel = info.filter(f).sort((a, b) => a.u.forma.localeCompare(b.u.forma, 'en'));
    L.push(`## ${titulo} (${sel.length})`, '');
    if (!sel.length) { L.push('Nenhum.', ''); return; }
    L.push('| Unidade | Forma | Catálogo de | Literal em | Marcado em | Flexão confirmada em | Primeira ocorrência por personagem |', '|---|---|---|---|---|---|---|');
    const ns = (set) => gs.filter((g) => set.has(g)).map((g) => NOME[g]).join(', ');
    for (const x of sel) L.push(`| ${x.u.id} | ${cel(x.u.forma)} | ${ns(x.cat)} | ${ns(x.uso.lit)} | ${ns(x.uso.dec)} | ${ns(x.uso.fc)} | ${gs.filter((g) => x.primeira[g]).map((g) => `${NOME[g]} ${x.primeira[g]}`).join(' · ')} |`);
    L.push('');
  };
  lista('Catálogo de dois ou três personagens', (x) => x.cat.size >= 2);
  lista('Catálogo de um só personagem e uso nos textos de outro (literal ∪ marcado ∪ flexão confirmada)', (x) => x.cat.size === 1 && [...x.uso.todos].some((g) => !x.cat.has(g)));
  for (const g of gs) {
    const ex = info.filter((x) => x.cat.size === 1 && x.cat.has(g)).map((x) => x.u.forma).sort((a, b) => a.localeCompare(b, 'en'));
    L.push(`## Exclusivos do catálogo de ${NOME[g]} (${ex.length})`, '', ex.map(cel).join(' · ') || 'Nenhum.', '');
  }
  const cands = flex.filter((r) => r.status === 'proposta').sort((a, b) => a.forma_canonica.localeCompare(b.forma_canonica, 'en') || a.id.localeCompare(b.id));
  L.push(`## Ocorrências flexionadas (${flex.length}: ${flex.length - cands.length} confirmadas, ${cands.length} candidatas)`, '', '| REL | Forma canônica | Forma encontrada | Segmento | Personagem | Critério | Situação |', '|---|---|---|---|---|---|---|');
  for (const r of [...flex.filter((x) => x.status === 'confirmada'), ...cands]) L.push(`| ${r.id} | ${cel(r.forma_canonica)} | ${cel(r.forma_encontrada)} | ${r.para} (${cel(por.get(r.para)?.id_original ?? txtDe.get(por.get(r.para)?.texto)?.id_original)}) | ${NOME[quemDoSeg(r.para)] ?? '—'} | ${r.criterio} | ${r.status === 'confirmada' ? 'confirmada' : 'candidata (para análise)'} |`);
  L.push('');
  const pers = registros.filter((r) => r.tipo === 'PER');
  const quemPer = (p) => new Set(p.evidencias.map((e) => quemDoOri(e.ori)).filter(Boolean));
  const comp = pers.filter((p) => quemPer(p).size > 1);
  L.push(`## Perguntas com o mesmo enunciado em mais de um personagem (${comp.length})`, '');
  for (const p of comp) {
    L.push(`### ${p.id} — “${cel(p.enunciado)}”`, '');
    const rs = registros.filter((r) => r.tipo === 'RSP' && r.pergunta === p.id);
    for (const r of rs) L.push(`- ${NOME[psgGrupo.get(r.personagens?.[0])] ?? '?'} (${r.id_original}, ${r.id}): ${cel(r.original)}`);
    for (const a of registros.filter((r) => r.tipo === 'ATV')) for (const x of a.perguntas_abertas || []) if (x.pergunta === p.id) L.push(`- ${NOME[psgGrupo.get(a.personagens?.[0])] ?? '?'} (${x.id_original}): pergunta aberta, sem resposta-modelo${x.dica ? ` — dica: ${cel(x.dica.valor)}` : ''}`);
    L.push('');
  }
  L.push('## Notas gramaticais por texto (literais das fontes)', '', '| Personagem | Texto | Etapa/nível na fonte | Nota gramatical |', '|---|---|---|---|');
  for (const t of [...txtDe.values()].filter((t) => t.nota_gramatical).sort((a, b) => ordemTxt(a).localeCompare(ordemTxt(b)))) {
    L.push(`| ${NOME[psgGrupo.get(t.personagens?.[0])] ?? '—'} | ${cel(t.id_original)} | ${cel(t.estagio?.valor ?? t.nivel_da_fonte?.valor ?? '')} | ${cel(t.nota_gramatical.valor)} |`);
  }
  L.push('');
  const ctxs = registros.filter((r) => r.tipo === 'CTX');
  L.push('## Contextos narrativos (segmentos por personagem)', '', `| Contexto | ${gs.map((g) => NOME[g]).join(' | ')} |`, `|---|${gs.map(() => '---').join('|')}|`);
  for (const c of ctxs) L.push(`| ${c.codigo} | ${gs.map((g) => registros.filter((s) => s.tipo === 'SEG' && (s.contextos || []).includes(c.id) && quemDoSeg(s.id) === g).length).join(' | ')} |`);
  return L.join('\n') + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const g = gerar();
  const saidas = { 'base/manifesto.json': JSON.stringify(g.manifesto, null, 2) + '\n', ...g.markdown };
  const conferir = process.argv.includes('--conferir');
  let mudou = 0;
  for (const [p, c] of Object.entries(saidas)) {
    const abs = join(REPO, p);
    const igual = existsSync(abs) && readFileSync(abs, 'utf8') === c;
    if (!igual) mudou++;
    if (!conferir && !igual) { mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, c); }
    console.log(`${igual ? 'igual  ' : conferir ? 'MUDOU  ' : 'gravado'} ${p}`);
  }
  process.exit(conferir && mudou ? 1 : 0);
}
