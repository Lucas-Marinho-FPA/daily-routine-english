// Base Pedagógica — validador (somente leitura). Normativo: docs/base-pedagogica/arquitetura.md §6.
// Uso (na raiz do repositório):
//   node dev/tools/base/validar.mjs                 valida base/ inteira (verificações 1–11)
//   node dev/tools/base/validar.mjs --autoteste     planta um defeito por vez numa cópia em memória da base e exige reprovação
// Opções: --imutavel-desde <rev> (padrão HEAD) · --protegidos <arquivo> (texto de material de terceiros, guardado FORA do
//         repositório: nenhuma linha dele pode aparecer na base) · --sem-git-fonte (não reler as fontes no git).
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { REPO, BASE, canon, hashOf, hashBytes, at, gitShow, gitTem, lerJsonl, arquivosBase, arquivoDe, PRIVATE, validarEsquema, conferirEsquema } from './lib.mjs';
import { reconstruir } from './extrair.mjs';
import { gerar } from './gerar.mjs';

export const ESQUEMA = JSON.parse(readFileSync(join(BASE, 'esquema.json'), 'utf8'));
const CATALOGO = JSON.parse(readFileSync(join(BASE, 'progressao/catalogo.json'), 'utf8'));
const MAPA_SUBTIPO = CATALOGO.categorias_que_nomeiam_subtipo;
const PARADIGMAS = Object.fromEntries(Object.entries(CATALOGO.paradigmas_verbais || {}).filter(([k]) => k !== '_doc'));
const ID_RE = new RegExp(ESQUEMA.$defs.id.pattern);
const SO_POR_DECISAO = ['equivalente_a', 'semelhante_a'];
export const VERIFICACOES = {
  1: 'esquema', 2: 'identificadores', 3: 'referências', 4: 'hashes', 5: 'conservação e recuperabilidade por fonte', 6: 'destino de todo ORI',
  7: 'relações e decisões', 8: 'origem do enriquecimento e classificação', 9: 'nomes privados e material de terceiros', 10: 'arquivos gerados atualizados', 11: 'imutabilidade',
};
const impressao = (linha) => createHash('sha256').update(linha.trim(), 'utf8').digest('hex');

// cada string que tem forma de ID, fora do conteúdo literal dos ORI
const idsCitados = (x, out = []) => {
  if (typeof x === 'string') { if (ID_RE.test(x)) out.push(x); }
  else if (Array.isArray(x)) x.forEach((y) => idsCitados(y, out));
  else if (x && typeof x === 'object') for (const v of Object.values(x)) idsCitados(v, out);
  return out;
};
const orisCitados = (x, out) => {
  if (Array.isArray(x)) x.forEach((y) => orisCitados(y, out));
  else if (x && typeof x === 'object') { if (typeof x.ori === 'string') out.add(x.ori); for (const v of Object.values(x)) orisCitados(v, out); }
};

/**
 * @param o.registros  todos os registros (com _arquivo opcional)
 * @param o.ids        linhas de ids.jsonl
 * @param o.conferencias Map FON → conferência
 * @param o.gitFonte   reler as fontes no git (hash, conteúdo, reconstrução)
 * @param o.protegidos Set de impressões de linhas de material de terceiros
 */
export function validar({ registros, ids = [], conferencias = new Map(), gitFonte = true, protegidos = null }) {
  const erros = [], avisos = [];
  const err = (id, chk, msg) => erros.push({ id, verificacao: chk, msg });
  for (const p of conferirEsquema(ESQUEMA)) err('esquema', 1, p);

  // 2. identificadores
  const porId = new Map();
  for (const r of registros) {
    if (!ID_RE.test(r.id ?? '')) err(r.id, 2, 'ID fora do padrão');
    else if (r.id.slice(0, 3) !== r.tipo) err(r.id, 2, `prefixo do ID não corresponde ao tipo ${r.tipo}`);
    if (porId.has(r.id)) err(r.id, 2, 'ID duplicado');
    porId.set(r.id, r);
    if (r._arquivo && r._arquivo !== arquivoDe(r)) err(r.id, 2, `registro no arquivo errado (${r._arquivo}; esperado ${arquivoDe(r)})`);
  }
  const reg = new Map(), chaves = new Set();
  for (const l of ids) {
    if (reg.has(l.id)) err(l.id, 2, 'ID registrado duas vezes em ids.jsonl');
    if (chaves.has(l.chave)) err(l.id, 2, 'chave registrada duas vezes em ids.jsonl');
    reg.set(l.id, l); chaves.add(l.chave);
  }
  for (const r of registros) { const l = reg.get(r.id); if (!l) err(r.id, 2, 'ID ausente de ids.jsonl'); else if (l.tipo !== r.tipo) err(r.id, 2, 'tipo diferente do registrado em ids.jsonl'); }
  const existe = (id, tipos) => porId.has(id) && (!tipos || tipos.includes(porId.get(id).tipo));
  const REVOGADAS = new Set(registros.filter((r) => r.tipo === 'DEC' && r.status === 'aprovada').flatMap((d) => d.revoga || []));
  for (const d of registros.filter((r) => r.tipo === 'DEC')) for (const x of d.revoga || []) if (!existe(x, ['DEC'])) err(d.id, 3, `revoga uma DEC inexistente: ${x}`);

  const citadosOri = new Set();
  for (const r of registros) {
    const s = ESQUEMA.tipos[r.tipo];
    if (!s) { err(r.id, 1, `tipo desconhecido ${r.tipo}`); continue; }
    const { _arquivo, ...limpo } = r;
    // 1. esquema
    for (const e of validarEsquema(ESQUEMA, s, limpo)) err(r.id, 1, e);
    if (Array.isArray(r.historico) && r.historico.length && r.historico.at(-1).versao !== r.versao) err(r.id, 1, 'última entrada do histórico ≠ versão');
    if (r.tipo === 'DIV' && r.status === 'resolvida' && !r.decisao) err(r.id, 1, 'divergência resolvida sem DEC');
    if (r.tipo === 'DIV' && r.status === 'anulada' && !(typeof r.motivo === 'string' && r.motivo.trim())) err(r.id, 7, 'divergência anulada sem motivo');
    if (r.tipo === 'DIV' && r.status === 'anulada' && (porId.get(r.unidade)?.divergencias || []).includes(r.id)) err(r.id, 7, 'divergência anulada ainda listada na unidade');

    // 3. referências: todo ID citado fora do conteúdo literal existe
    if (r.tipo !== 'ORI') {
      for (const id of idsCitados(limpo)) if (id !== r.id && !existe(id)) err(r.id, 3, `referência a registro inexistente: ${id}`);
      orisCitados(limpo, citadosOri);
    }
    if (r.tipo === 'ORI' && !existe(r.fonte, ['FON'])) err(r.id, 3, `fonte inexistente: ${r.fonte}`);
    for (const e of r.evidencias || []) if (!existe(e.ori, ['ORI'])) err(r.id, 3, `evidência não é um ORI: ${e.ori}`);
    if (r.tipo === 'RSP' && !existe(r.pergunta, ['PER'])) err(r.id, 3, `pergunta inexistente: ${r.pergunta}`);
    if (r.tipo === 'SEG' && !existe(r.texto, ['TXT'])) err(r.id, 3, `texto inexistente: ${r.texto}`);
    if (r.tipo === 'TXT') for (const sg of r.segmentos || []) if (porId.get(sg)?.texto !== r.id) err(r.id, 3, `segmento ${sg} não aponta de volta para o texto`);

    // 4. hashes
    if (r.tipo === 'ORI') {
      if (hashOf(r.conteudo) !== r.hash) err(r.id, 4, 'hash não corresponde ao conteúdo registrado');
      const f = porId.get(r.fonte);
      if (gitFonte && f?.arquivo) {
        let orig;
        try { orig = at(gitShow(r.versao_fonte, f.arquivo), r.local); } catch (e) { err(r.id, 4, `fonte ilegível em ${r.versao_fonte}: ${String(e.message).split('\n')[0]}`); continue; }
        if (orig === undefined) err(r.id, 4, `local ${r.local} não existe na fonte`);
        else if (canon(orig) !== canon(r.conteudo)) err(r.id, 4, 'conteúdo difere do original na versão registrada');
      }
    }
    if (r.tipo === 'FON' && gitFonte && r.arquivo && r.versao && r.hash_arquivo) {
      try { if (hashBytes(gitShow(r.versao, r.arquivo, { json: false })) !== r.hash_arquivo) err(r.id, 4, 'hash do arquivo de origem não confere'); }
      catch { err(r.id, 4, 'arquivo de origem ilegível na versão registrada'); }
    }

    // 7. relações e decisões
    if (r.tipo === 'REL') {
      if (SO_POR_DECISAO.includes(r.relacao) && porId.get(r.decisao)?.status !== 'aprovada') err(r.id, 7, `${r.relacao} sem DEC aprovada`);
      if (r.relacao === 'duplicado_de') {
        const [a, b] = [porId.get(r.de), porId.get(r.para)];
        const campos = [...new Set((r.evidencias || []).map((e) => e.campo).filter(Boolean))];
        const iguais = a?.tipo === 'ORI' && b?.tipo === 'ORI' && (campos.length
          ? campos.every((c) => a.conteudo?.[c] !== undefined && canon(a.conteudo[c]) === canon(b.conteudo?.[c]))
          : a.hash === b.hash);
        if (!iguais) err(r.id, 7, 'duplicado_de sem conteúdo idêntico (hash ou campo)');
      }
    }
    if (r.tipo === 'DIV' && new Set((r.versoes || []).map((x) => canon(x.valor))).size < 2) err(r.id, 7, 'divergência sem valores diferentes');
    if ((r.tipo === 'DIV' || r.subtipo_decisao) && REVOGADAS.has(r.tipo === 'DIV' ? r.decisao : r.subtipo_decisao)) err(r.id, 7, 'aponta para uma DEC revogada');
    for (const x of r.explicacoes || []) if (REVOGADAS.has(x.origem?.decisao)) err(r.id, 7, 'explicação vinda de DEC revogada no estado atual');
    if (r.subtipo_decisao) {
      const dec = porId.get(r.subtipo_decisao);
      if (dec?.status !== 'aprovada' || !(dec.efeitos || []).some((e) => e.unidade === r.id && e.campo === 'subtipo' && e.valor === r.subtipo)) err(r.id, 7, 'classificação central sem DEC aprovada com o mesmo efeito');
    }
    if (r.tipo === 'REL' && r.relacao === 'aparece_em' && r.forma_encontrada !== undefined) {
      const sg = porId.get(r.para);
      const p = r.posicao || {};
      if (sg?.tipo !== 'SEG' || sg.original.slice(p.inicio, p.fim) !== r.forma_encontrada) err(r.id, 7, 'ocorrência registrada não está no texto na posição indicada');
      const verbo = String(r.criterio || '').split(':')[1];
      if (r.status === 'confirmada' && !(String(r.criterio).startsWith('paradigma_verbal_catalogo:') && PARADIGMAS[verbo])) err(r.id, 8, 'ocorrência flexionada confirmada sem paradigma no catálogo');
    }

    // 8. origem do enriquecimento e classificação
    for (const k of ['traducoes', 'explicacoes', 'habilidades']) for (const x of r[k] || []) {
      const og = x.origem;
      if (!og || !(og.ori || og.decisao || og.autoria === 'projeto')) err(r.id, 8, `${k} sem origem`);
      if (og?.decisao && porId.get(og.decisao)?.status !== 'aprovada') avisos.push({ id: r.id, msg: `origem em DEC ainda não aprovada (${og.decisao})` });
    }
    for (const k of ['niveis_origem', 'pronuncia', 'variantes', 'formas_verbais', 'criterios']) for (const x of r[k] || []) if (!x.origem) err(r.id, 8, `${k} sem origem`);
    for (const c of r.classificacoes_origem || []) {
      const esperado = Object.hasOwn(MAPA_SUBTIPO, c.categoria) && c.categoria !== '_doc' ? MAPA_SUBTIPO[c.categoria] : null;
      if (c.subtipo !== esperado) err(r.id, 8, `classificação “${c.categoria}” com subtipo ${c.subtipo} (o catálogo diz ${esperado})`);
    }
    if (r.tipo === 'EXP') {
      const sts = [...new Set((r.classificacoes_origem || []).map((c) => c.subtipo).filter(Boolean))];
      const temDiv = (r.divergencias || []).some((d) => porId.get(d)?.campo === 'subtipo');
      if (r.subtipo && !r.subtipo_decisao && !(sts.length === 1 && sts[0] === r.subtipo)) err(r.id, 8, 'subtipo central sem fonte que o nomeie ou com fontes divergentes (exige DEC)');
      if (sts.length > 1 && !temDiv) err(r.id, 8, 'fontes divergem no subtipo e a divergência não foi registrada');
    }
    if (/nivel_cefr|cefr/i.test(Object.keys(limpo).join(' '))) err(r.id, 8, 'nível CEFR sem fonte (proibido por inferência)');

    // 9. nomes privados e material de terceiros
    if (PRIVATE.test(JSON.stringify(limpo))) err(r.id, 9, 'padrão de nome privado encontrado');
    if (r.tipo === 'ORI' && porId.get(r.fonte)?.distribuicao === 'somente_referencia') err(r.id, 9, 'conteúdo de fonte sem licença de redistribuição');
    if (r.tipo === 'FON' && r.natureza === 'terceiros' && r.distribuicao !== 'somente_referencia' && !r.licenca) err(r.id, 9, 'material de terceiros sem licença registrada precisa ser somente_referencia');
    if (protegidos) {
      const textos = []; (function t(x) { if (typeof x === 'string') x.split('\n').forEach((l) => l.trim().length >= 12 && textos.push(l)); else if (x && typeof x === 'object') Object.values(x).forEach(t); })(limpo);
      if (textos.some((l) => protegidos.has(impressao(l)))) err(r.id, 9, 'texto idêntico a uma linha de material protegido');
    }
  }

  // 5. conservação e recuperabilidade; 6. destino de todo ORI
  const oriPorFonte = new Map();
  for (const r of registros) if (r.tipo === 'ORI') (oriPorFonte.get(r.fonte) || oriPorFonte.set(r.fonte, []).get(r.fonte)).push(r);
  const semUnidade = new Map();
  for (const [f, c] of conferencias) {
    const oris = oriPorFonte.get(f) || [];
    const pend = c.pendentes || [];
    for (const p of pend) if (!p.motivo) err(f, 5, `pendente sem motivo (${p.local})`);
    if (c.originais !== oris.length + pend.length) err(f, 5, `originais ${c.originais} ≠ incorporados ${oris.length} + pendentes ${pend.length}`);
    if (c.incorporados !== oris.length) err(f, 5, `conferência diz ${c.incorporados} incorporados; há ${oris.length}`);
    const fon = porId.get(f);
    if (fon && c.hash_arquivo !== fon.hash_arquivo) err(f, 5, 'hash do arquivo na conferência ≠ hash na fonte');
    if (gitFonte && fon?.arquivo && !pend.length) {
      try { if (canon(reconstruir(oris, c.listas || [])) !== canon(gitShow(fon.versao, fon.arquivo))) err(f, 5, 'a fonte NÃO é reconstruível a partir dos ORI'); }
      catch { err(f, 5, 'fonte ilegível para a reconstrução'); }
    }
    for (const s of c.sem_unidade || []) {
      if (!s.motivo || !s.destino) err(s.ori, 6, 'ORI sem unidade e sem destino/motivo');
      if (porId.get(s.ori)?.fonte !== f) err(s.ori, 6, 'ORI listado na conferência de outra fonte');
      semUnidade.set(s.ori, s);
    }
    if (fon?.conferencia === 'concluida' && (pend.length || c.originais !== oris.length)) err(f, 5, 'fonte marcada como concluída com pendências');
  }
  for (const [f] of oriPorFonte) if (!conferencias.has(f)) err(f, 5, 'fonte com ORI e sem conferência registrada');
  for (const r of registros) if (r.tipo === 'ORI' && !citadosOri.has(r.id) && !semUnidade.has(r.id)) err(r.id, 6, 'ORI sem destino (nenhuma unidade o cita e a conferência não justifica)');
  for (const [o] of semUnidade) if (citadosOri.has(o)) avisos.push({ id: o, msg: 'listado como sem unidade, mas citado por alguma unidade' });
  return { erros, avisos };
}

// ---------- base inteira em disco ----------
export function lerBase(dir = BASE) {
  const arquivos = arquivosBase(dir);
  const registros = [], erros = [], conferencias = new Map();
  let ids = [];
  for (const f of arquivos) {
    const txt = readFileSync(join(dir, f), 'utf8');
    if (PRIVATE.test(txt)) erros.push({ id: f, verificacao: 9, msg: 'padrão de nome privado no arquivo' });
    try {
      if (f === 'ids.jsonl') ids = lerJsonl(txt);
      else if (f.startsWith('conferencia/')) { const c = JSON.parse(txt); conferencias.set(c.fonte, c); }
      else if (f.endsWith('.jsonl') && !f.startsWith('progressao/')) registros.push(...lerJsonl(txt).map((r) => ({ ...r, _arquivo: f })));
      else if (f.endsWith('.json')) JSON.parse(txt);
    } catch (e) { erros.push({ id: f, verificacao: 1, msg: e.message }); }
  }
  return { arquivos, registros, ids, conferencias, erros };
}

export function validarBase({ rev = 'HEAD', gitFonte = true, protegidos = null } = {}) {
  const b = lerBase();
  const v = validar({ registros: b.registros, ids: b.ids, conferencias: b.conferencias, gitFonte, protegidos });
  const erros = [...b.erros, ...v.erros];
  // 10. gerados
  const g = gerar();
  const man = JSON.parse(readFileSync(join(BASE, 'manifesto.json'), 'utf8'));
  if (canon(man.arquivos) !== canon(g.manifesto.arquivos)) erros.push({ id: 'manifesto.json', verificacao: 10, msg: 'manifesto desatualizado (rode dev/tools/base/gerar.mjs)' });
  for (const [p, conteudo] of Object.entries(g.markdown)) {
    const atual = existsSync(join(REPO, p)) ? readFileSync(join(REPO, p), 'utf8') : null;
    if (atual !== conteudo) erros.push({ id: p, verificacao: 10, msg: 'Markdown gerado desatualizado (rode dev/tools/base/gerar.mjs)' });
  }
  // 11. imutabilidade em relação a <rev>
  if (rev) {
    const antes = (p) => (gitTem(rev, `base/${p}`) ? lerJsonl(gitShow(rev, `base/${p}`, { json: false }).toString('utf8')) : []);
    const agoraIds = new Map(b.ids.map((l) => [l.id, canon(l)]));
    for (const l of antes('ids.jsonl')) if (agoraIds.get(l.id) !== canon(l)) erros.push({ id: l.id, verificacao: 11, msg: `linha de ids.jsonl removida ou alterada desde ${rev}` });
    const agoraOri = new Map(b.registros.filter((r) => r.tipo === 'ORI').map(({ _arquivo, ...r }) => [r.id, canon(r)]));
    let lista = [];
    try { lista = gitShow(rev, 'base/registros/origem', { json: false }).toString('utf8').split('\n').filter((n) => n.endsWith('.jsonl')); } catch { /* ainda não existia */ }
    for (const n of lista) {
      if (!b.arquivos.includes(`registros/origem/${n}`)) { erros.push({ id: n, verificacao: 11, msg: `arquivo de origem removido desde ${rev}` }); continue; }
      for (const r of antes(`registros/origem/${n}`)) if (agoraOri.get(r.id) !== canon(r)) erros.push({ id: r.id, verificacao: 11, msg: `ORI removido ou alterado desde ${rev}` });
    }
  }
  return { arquivos: b.arquivos.length, registros: b.registros.length, erros, avisos: v.avisos };
}

// ---------- autoteste: um defeito plantado por vez numa cópia em memória da base real ----------
export function autoteste() {
  const b = lerBase();
  const base = { registros: b.registros, ids: b.ids, conferencias: b.conferencias };
  const sem = validar({ ...structuredClone(base), gitFonte: false });
  if (sem.erros.length) { console.log('a base real já tem erros — autoteste não é conclusivo'); return 1; }
  const acha = (rs, f) => { const r = rs.find(f); if (!r) throw new Error('caso de teste sem registro adequado'); return r; };
  const novoId = (rs, ids, r, id) => { r.id = id; ids.push({ id, tipo: id.slice(0, 3), chave: `teste:${id}`, criado_em: '2026-11-09' }); };
  const casos = [
    [1, 'campo obrigatório ausente', ({ rs }) => { delete acha(rs, (r) => r.tipo === 'VOC').forma; }],
    [1, 'status fora da lista', ({ rs }) => { acha(rs, (r) => r.tipo === 'VOC').status = 'publicado'; }],
    [1, 'tradução que não é objeto {texto, origem}', ({ rs }) => { acha(rs, (r) => r.traducoes?.length).traducoes.push('pegar'); }],
    [2, 'ID duplicado', ({ rs }) => { rs.push({ ...acha(rs, (r) => r.tipo === 'VOC') }); }],
    [2, 'prefixo do ID diferente do tipo', ({ rs }) => { acha(rs, (r) => r.tipo === 'VOC').id = 'EXP-999997'; }],
    [2, 'ID ausente de ids.jsonl', ({ ids }) => { ids.splice(ids.findIndex((l) => l.tipo === 'VOC'), 1); }],
    [2, 'registro no arquivo errado', ({ rs }) => { acha(rs, (r) => r.tipo === 'VOC')._arquivo = 'registros/expressoes.jsonl'; }],
    [3, 'evidência quebrada', ({ rs }) => { acha(rs, (r) => r.tipo === 'VOC').evidencias.push({ ori: 'ORI-999999' }); }],
    [3, 'segmento apontando para texto inexistente', ({ rs }) => { acha(rs, (r) => r.tipo === 'SEG').texto = 'TXT-999999'; }],
    [4, 'original alterado (um espaço a mais) com hash recalculado', ({ rs }) => { const o = acha(rs, (r) => r.tipo === 'ORI' && typeof r.conteudo?.en === 'string'); o.conteudo.en += ' '; o.hash = hashOf(o.conteudo); }, { gitFonte: true }],
    [4, 'hash do registro errado', ({ rs }) => { acha(rs, (r) => r.tipo === 'ORI').hash = `sha256:${'0'.repeat(64)}`; }],
    [4, 'local inexistente na fonte', ({ rs }) => { acha(rs, (r) => r.tipo === 'ORI').local = '/naoexiste/0'; }, { gitFonte: true }],
    [5, 'ORI a menos (contagem não fecha)', ({ rs }) => { rs.splice(rs.findIndex((r) => r.tipo === 'ORI'), 1); }],
    [5, 'pendente sem motivo', ({ cs }) => { const c = [...cs.values()][0]; c.pendentes.push({ local: '/x' }); c.originais += 1; }],
    [5, 'fonte não reconstruível (estrutura de listas perdida)', ({ cs }) => { [...cs.values()][0].listas = []; }, { gitFonte: true }],
    [6, 'ORI sem destino', ({ cs }) => { const c = [...cs.values()].find((x) => x.sem_unidade.length); c.sem_unidade.shift(); }],
    [7, 'equivalente_a sem DEC aprovada', ({ rs, ids }) => { const a = rs.filter((r) => r.tipo === 'VOC'); const r = { tipo: 'REL', de: a[0].id, relacao: 'equivalente_a', para: a[1].id, status: 'confirmada', evidencias: [a[0].evidencias[0]] }; novoId(rs, ids, r, 'REL-999990'); rs.push(r); }],
    [7, 'duplicado_de com conteúdo diferente', ({ rs, ids }) => { const o = rs.filter((r) => r.tipo === 'ORI'); const r = { tipo: 'REL', de: o[0].id, relacao: 'duplicado_de', para: o[1].id, status: 'confirmada', evidencias: [{ ori: o[0].id }] }; novoId(rs, ids, r, 'REL-999991'); rs.push(r); }],
    [7, 'divergência anulada sem motivo', ({ rs }) => { const d = acha(rs, (r) => r.tipo === 'DIV'); d.status = 'anulada'; delete d.motivo; const u = acha(rs, (r) => r.id === d.unidade); u.divergencias = u.divergencias.filter((x) => x !== d.id); }],
    [7, 'classificação central sem DEC aprovada', ({ rs }) => { const d = acha(rs, (r) => r.tipo === 'DEC'); d.status = 'proposta'; }],
    [7, 'unidade apontando para DEC revogada', ({ rs }) => { const u = acha(rs, (r) => r.forma === 'take care of'); u.subtipo_decisao = 'DEC-000002'; u.subtipo = 'phrasal_preposicional'; }],
    [7, 'ocorrência flexionada fora da posição registrada', ({ rs }) => { const r = acha(rs, (x) => x.relacao === 'aparece_em' && x.forma_encontrada); r.posicao = { inicio: r.posicao.inicio + 1, fim: r.posicao.fim + 1 }; }],
    [8, 'ocorrência candidata marcada como confirmada', ({ rs }) => { acha(rs, (x) => x.relacao === 'aparece_em' && x.status === 'proposta').status = 'confirmada'; }],
    [8, 'tradução sem origem', ({ rs }) => { delete acha(rs, (r) => r.traducoes?.length).traducoes[0].origem; }],
    [8, 'subtipo central forçado sem fonte que o nomeie', ({ rs }) => { const u = acha(rs, (r) => r.tipo === 'EXP' && r.subtipo === null && !(r.classificacoes_origem || []).some((c) => c.subtipo)); u.subtipo = 'phrasal'; }],
    [8, 'classificação com subtipo diferente do catálogo', ({ rs }) => { acha(rs, (r) => r.classificacoes_origem?.some((c) => c.categoria === 'word')).classificacoes_origem.find((c) => c.categoria === 'word').subtipo = 'chunk'; }],
    [8, 'nível CEFR atribuído', ({ rs }) => { acha(rs, (r) => r.tipo === 'VOC').nivel_cefr = 'A2'; }],
    [9, 'nome privado em texto', ({ rs }) => { const u = acha(rs, (r) => r.explicacoes?.length); u.explicacoes[0].texto += ` ${Buffer.from('RUFD', 'base64').toString()}`; }],
    [9, 'ORI de fonte sem licença de redistribuição', ({ rs }) => { acha(rs, (r) => r.tipo === 'FON').distribuicao = 'somente_referencia'; }],
    [9, 'texto idêntico a material protegido', ({ rs }) => { acha(rs, (r) => r.explicacoes?.length).explicacoes[0].texto = 'Linha sintética de um material protegido'; }, { protegidos: new Set([impressao('Linha sintética de um material protegido')]) }],
  ];
  let falhas = 0;
  for (const [chk, nome, mut, op = {}] of casos) {
    const c = structuredClone(base);
    mut({ rs: c.registros, ids: c.ids, cs: c.conferencias });
    const ok = validar({ ...c, gitFonte: false, ...op }).erros.some((e) => e.verificacao === chk);
    if (!ok) falhas++;
    console.log(`${ok ? 'ok   ' : 'FALHA'} verificação ${chk} (${VERIFICACOES[chk]}) reprova: ${nome}`);
  }
  console.log(`autoteste: ${casos.length - falhas}/${casos.length}`);
  return falhas;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  if (a.includes('--autoteste')) process.exit(autoteste() ? 1 : 0);
  const protegidos = opt('--protegidos') ? new Set(readFileSync(opt('--protegidos'), 'utf8').split('\n').filter((l) => l.trim().length >= 12).map(impressao)) : null;
  const gitFonte = !a.includes('--sem-git-fonte');
  const res = validarBase({ rev: opt('--imutavel-desde') ?? 'HEAD', gitFonte, protegidos });
  const naoExec = gitFonte ? [] : [4, 5];
  console.log(`${res.arquivos} arquivo(s), ${res.registros} registro(s): ${res.erros.length} erro(s), ${res.avisos.length} aviso(s)`);
  const porChk = {};
  for (const e of res.erros) porChk[e.verificacao] = (porChk[e.verificacao] || 0) + 1;
  for (const [k, n] of Object.entries(VERIFICACOES)) console.log(`  ${porChk[k] ? 'ERRO' : naoExec.includes(+k) ? 'parc' : 'ok  '} ${k}. ${n}${porChk[k] ? ` (${porChk[k]})` : naoExec.includes(+k) ? ' — parcial: fontes não relidas no git' : ''}`);
  for (const e of res.erros.slice(0, 50)) console.log(`  [${e.verificacao}] ${e.id}: ${e.msg}`);
  if (res.erros.length > 50) console.log(`  … e mais ${res.erros.length - 50}`);
  for (const w of res.avisos.slice(0, 20)) console.log(`  aviso ${w.id}: ${w.msg}`);
  process.exit(res.erros.length ? 1 : 0);
}
