// Base Pedagógica — validador (somente leitura). Normativo: docs/base-pedagogica/arquitetura.md §7.
// Uso (na raiz do repositório):
//   node dev/tools/base/validar.mjs                         valida base/ inteira (camada pública)
//   node dev/tools/base/validar.mjs --arquivo <x.jsonl>     valida só um conjunto de registros (ex.: exemplos)
//   node dev/tools/base/validar.mjs --autoteste             confirma que cada verificação reprova um defeito plantado
// Opções: --base <dir> (outra base, ex.: a camada privada; aceita --camada privada), --imutavel-desde <rev> (padrão HEAD),
//         --impressoes <arquivo> (hashes de linhas das fontes privadas, guardado NA CAMADA PRIVADA), --sem-git-fonte.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { REPO, BASE, canon, hashOf, hashBytes, at, gitShow, gitTem, lerJsonl, arquivosBase, PRIVATE, validarEsquema, conferirEsquema } from './lib.mjs';
import { gerar } from './gerar.mjs';

export const ESQUEMA = JSON.parse(readFileSync(join(BASE, 'esquemas/base.schema.json'), 'utf8'));
const UNIDADES = ['VOC', 'EXP', 'GRA', 'TXT', 'SEG', 'DIA', 'PER', 'RSP', 'ATV', 'EXE', 'CTX', 'PSG'];
const SO_POR_DECISAO = ['equivalente_a', 'semelhante_a'];
export const VERIFICACOES = {
  1: 'esquema', 2: 'identificadores', 3: 'referências', 4: 'hashes', 5: 'conservação por fonte', 6: 'ORI órfão',
  7: 'relações e decisões', 8: 'origem do enriquecimento', 9: 'privacidade', 10: 'arquivos gerados atualizados', 11: 'imutabilidade',
};

/**
 * @param registros  lista de registros
 * @param o.camada   camada esperada dos registros ('publica' por padrão)
 * @param o.ids      linhas de ids.jsonl (null = não conferir)
 * @param o.gitFonte recalcular o hash na fonte original (git show na versão registrada)
 * @param o.impressoes Set de hashes de linhas privadas
 * @param o.conferencias Map FON → {originais, pendentes[]}
 */
export function validar(registros, o = {}) {
  const { camada = 'publica', ids = null, gitFonte = true, impressoes = null, conferencias = null } = o;
  const erros = [], avisos = [];
  const err = (id, chk, msg) => erros.push({ id, verificacao: chk, msg });
  const porId = new Map();

  // 1 (o próprio esquema) — palavras-chave, $ref e padrões válidos
  for (const p of conferirEsquema(ESQUEMA)) err('esquema', 1, p);

  // 2. IDs
  for (const r of registros) {
    if (!new RegExp(ESQUEMA.$defs.id.pattern).test(r.id ?? '')) err(r.id, 2, 'ID fora do padrão');
    else if (r.id.slice(0, 3) !== r.tipo) err(r.id, 2, `prefixo do ID não corresponde ao tipo ${r.tipo}`);
    if (porId.has(r.id)) err(r.id, 2, 'ID duplicado');
    // faixas: pública 000001–499999 · privada 500000–899999 · ilustrativa 900000+ (só com _ilustrativo)
    const num = Number(String(r.id).slice(4));
    if (num >= 900000 ? !r._ilustrativo : r.camada === 'privada' ? num < 500000 : r.camada === 'publica' && num >= 500000) err(r.id, 2, 'ID fora da faixa da sua camada');
    porId.set(r.id, r);
  }
  if (ids) {
    const reg = new Map();
    for (const l of ids) { if (reg.has(l.id)) err(l.id, 2, 'ID registrado duas vezes em ids.jsonl'); reg.set(l.id, l); }
    for (const r of registros) {
      const l = reg.get(r.id);
      if (!l) err(r.id, 2, 'ID ausente de ids.jsonl');
      else if (l.tipo !== r.tipo || (l.camada && r.camada && l.camada !== r.camada)) err(r.id, 2, 'tipo/camada diferente do registrado em ids.jsonl');
    }
  }
  const existe = (id, tipos) => porId.has(id) && (!tipos || tipos.includes(porId.get(id).tipo));

  for (const r of registros) {
    const s = ESQUEMA.tipos[r.tipo];
    if (!s) { err(r.id, 1, `tipo desconhecido ${r.tipo}`); continue; }
    // 1. esquema
    for (const e of validarEsquema(ESQUEMA, s, r)) err(r.id, 1, e);
    if (UNIDADES.includes(r.tipo) && Array.isArray(r.historico) && r.historico.length && r.historico.at(-1).versao !== r.versao) err(r.id, 1, 'última entrada do histórico ≠ versão');
    if (r.tipo === 'DIV' && r.status === 'resolvida' && !r.decisao) err(r.id, 1, 'divergência resolvida sem DEC');

    // 3. referências
    for (const e of r.evidencias || []) if (!existe(e.ori, ['ORI'])) err(r.id, 3, `evidência aponta para ORI inexistente: ${e.ori}`);
    if (r.tipo === 'ORI' && !existe(r.fonte, ['FON'])) err(r.id, 3, `fonte inexistente: ${r.fonte}`);
    if (r.tipo === 'REL') for (const k of ['de', 'para']) if (!existe(r[k])) err(r.id, 3, `${k} inexistente: ${r[k]}`);
    if (r.tipo === 'RSP' && !existe(r.pergunta, ['PER'])) err(r.id, 3, `pergunta inexistente: ${r.pergunta}`);
    for (const p of r.tipo === 'ATV' ? r.perguntas || [] : []) if (!existe(p, ['PER'])) err(r.id, 3, `pergunta inexistente: ${p}`);
    for (const p of r.tipo === 'ATV' ? r.respostas || [] : []) if (!existe(p, ['RSP'])) err(r.id, 3, `resposta inexistente: ${p}`);
    for (const d of r.divergencias || []) if (!existe(d, ['DIV'])) err(r.id, 3, `divergência inexistente: ${d}`);
    for (const v of r.tipo === 'DIV' ? r.versoes || [] : []) if (!existe(v.ori, ['ORI'])) err(r.id, 3, `versão aponta para ORI inexistente: ${v.ori}`);
    for (const c of r.classificacoes_origem || []) if (!existe(c.ori, ['ORI'])) err(r.id, 3, `classificação aponta para ORI inexistente: ${c.ori}`);
    if (r.decisao && r.tipo !== 'DEC' && !existe(r.decisao, ['DEC'])) err(r.id, 3, `DEC inexistente: ${r.decisao}`);
    for (const x of [...(r.traducoes || []), ...(r.explicacoes || []), ...(r.habilidades || [])]) {
      const og = x.origem || {};
      if (og.ori && !existe(og.ori, ['ORI'])) err(r.id, 3, `origem aponta para ORI inexistente: ${og.ori}`);
      if (og.decisao && !existe(og.decisao, ['DEC'])) err(r.id, 3, `origem aponta para DEC inexistente: ${og.decisao}`);
      if (og.decisao && porId.get(og.decisao)?.status !== 'aprovada') avisos.push({ id: r.id, msg: `origem em DEC ainda não aprovada (${og.decisao})` });
    }

    // 4. hash do registro = SHA-256 da forma canônica de "conteudo" (o hash do ARQUIVO de origem fica na FON)
    if (r.tipo === 'ORI') {
      if (hashOf(r.conteudo) !== r.hash) err(r.id, 4, 'hash não corresponde ao conteúdo registrado');
      const f = porId.get(r.fonte);
      if (gitFonte && f?.camada === 'publica' && f.arquivo) {
        let orig;
        try { orig = at(gitShow(r.versao_fonte, f.arquivo), r.local); } catch (e) { err(r.id, 4, `fonte ilegível em ${r.versao_fonte}: ${String(e.message).split('\n')[0]}`); continue; }
        if (orig === undefined) err(r.id, 4, `local ${r.local} não existe na fonte`);
        else if (canon(orig) !== canon(r.conteudo)) err(r.id, 4, 'conteúdo difere do original na versão registrada');
      }
      if (gitFonte && f?.hash_arquivo && f.arquivo && f.versao && hashBytes(gitShow(f.versao, f.arquivo, { json: false })) !== f.hash_arquivo) err(f.id, 4, 'hash do arquivo de origem não confere');
    }

    // 7. relações
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

    // 8. enriquecimento sem origem
    for (const k of ['traducoes', 'explicacoes', 'habilidades']) for (const x of r[k] || []) {
      const og = x.origem;
      if (!og || !(og.ori || og.decisao || og.autoria === 'projeto')) err(r.id, 8, `${k} sem origem`);
    }
    if (r.classe_gramatical && !r.classe_gramatical.origem) err(r.id, 8, 'classe gramatical sem origem');
    for (const p of r.pronuncia || []) if (!p.origem && !p.ori) err(r.id, 8, 'pronúncia sem origem');
    if (r.tipo === 'EXP' && r.subtipo && !r.subtipo_decisao && !(r.classificacoes_origem || []).every((c) => c.categoria === r.subtipo)) err(r.id, 8, 'subtipo central sem DEC enquanto as fontes divergem');

    // 9. privacidade
    if (camada === 'publica') {
      if (r.tipo === 'FON' && r.camada === 'privada') {
        const extra = Object.keys(r).filter((k) => !['id', 'tipo', 'camada', 'natureza', 'conferencia', '_ilustrativo'].includes(k));
        if (extra.length) err(r.id, 9, `fonte privada expõe campos na camada pública: ${extra.join(', ')}`);
      } else if (r.camada === 'privada') err(r.id, 9, 'registro privado na camada pública');
      if (r.tipo === 'ORI' && porId.get(r.fonte)?.camada === 'privada') err(r.id, 9, 'ORI de fonte privada na camada pública');
      if (r.tipo === 'FON' && r.camada === 'publica' && ['pessoal', 'terceiros'].includes(r.natureza)) err(r.id, 9, `fonte de natureza "${r.natureza}" na camada pública`);
      const texto = JSON.stringify(r);
      if (PRIVATE.test(texto)) err(r.id, 9, 'padrão de nome privado encontrado');
      if (impressoes) for (const linha of textos(r)) if (impressoes.has(impressao(linha))) { err(r.id, 9, 'texto idêntico a uma linha de fonte privada'); break; }
    }
  }

  // 5. conservação por fonte
  if (conferencias) {
    const porFonte = new Map();
    for (const r of registros) if (r.tipo === 'ORI') porFonte.set(r.fonte, (porFonte.get(r.fonte) || 0) + 1);
    for (const [f, n] of porFonte) {
      const c = conferencias.get(f);
      if (!c) { err(f, 5, 'fonte com ORI e sem conferência registrada'); continue; }
      const pend = c.pendentes || [];
      for (const p of pend) if (!p.motivo) err(f, 5, `pendente sem motivo (${p.local})`);
      if (c.originais !== n + pend.length) err(f, 5, `originais ${c.originais} ≠ incorporados ${n} + pendentes ${pend.length}`);
    }
  }

  // 6. ORI órfão
  const citados = new Set();
  for (const r of registros) {
    for (const e of r.evidencias || []) citados.add(e.ori);
    for (const v of r.versoes || []) citados.add(v.ori);
    for (const x of [...(r.traducoes || []), ...(r.explicacoes || [])]) if (x.origem?.ori) citados.add(x.origem.ori);
  }
  for (const c of conferencias?.values() || []) for (const p of c.orfaos_justificados || []) citados.add(p.ori);
  for (const r of registros) if (r.tipo === 'ORI' && !citados.has(r.id)) err(r.id, 6, 'ORI órfão (nenhuma unidade nem pendência aponta para ele)');
  return { erros, avisos };
}

// impressões digitais: SHA-256 de cada linha não vazia (sem espaços nas pontas), sobre os textos dos registros públicos
export const impressao = (linha) => createHash('sha256').update(linha.trim(), 'utf8').digest('hex');
const textos = (x, out = []) => {
  if (typeof x === 'string') { for (const l of x.split('\n')) if (l.trim().length >= 12) out.push(l); }
  else if (x && typeof x === 'object') for (const v of Object.values(x)) textos(v, out);
  return out;
};

// ---------- validação da base inteira (arquivos, ids.jsonl, manifesto, gerados, imutabilidade) ----------
export function validarBase({ dir = BASE, camada = 'publica', rev = 'HEAD', gitFonte = true, impressoes = null } = {}) {
  const arquivos = arquivosBase(dir);
  const registros = [], erros = [];
  let ids = [];
  const conferencias = new Map();
  for (const f of arquivos) {
    const txt = readFileSync(join(dir, f), 'utf8');
    if (PRIVATE.test(txt) && camada === 'publica') erros.push({ id: f, verificacao: 9, msg: 'padrão de nome privado no arquivo' });
    if (f === 'ids.jsonl') { ids = lerJsonl(txt); continue; }
    if (f.startsWith('conferencia/') && f.endsWith('.json')) { const c = JSON.parse(txt); conferencias.set(c.fonte, c); continue; }
    if (f.endsWith('.jsonl')) { try { registros.push(...lerJsonl(txt).map((r) => ({ ...r, _arquivo: f }))); } catch (e) { erros.push({ id: f, verificacao: 1, msg: e.message }); } }
    else if (f.endsWith('.json')) { try { JSON.parse(txt); } catch (e) { erros.push({ id: f, verificacao: 1, msg: e.message }); } }
  }
  const limpos = registros.map(({ _arquivo, ...r }) => r);
  const v = validar(limpos, { camada, ids, gitFonte, impressoes, conferencias });
  erros.push(...v.erros);

  // ORI fora de origem/<FON>.jsonl, ou no arquivo de outra fonte
  for (const r of registros) if (r.tipo === 'ORI' && r._arquivo !== `origem/${r.fonte}.jsonl`) erros.push({ id: r.id, verificacao: 1, msg: `ORI deve ficar em origem/${r.fonte}.jsonl (está em ${r._arquivo})` });

  // 10. manifesto e Markdown gerados
  if (dir === BASE) {
    const g = gerar();
    const man = JSON.parse(readFileSync(join(dir, 'manifesto.json'), 'utf8'));
    if (canon(man.arquivos) !== canon(g.manifesto.arquivos)) erros.push({ id: 'manifesto.json', verificacao: 10, msg: 'manifesto desatualizado (rode dev/tools/base/gerar.mjs)' });
    for (const [p, conteudo] of Object.entries(g.markdown)) {
      const atual = existsSync(join(REPO, p)) ? readFileSync(join(REPO, p), 'utf8') : null;
      if (atual !== conteudo) erros.push({ id: p, verificacao: 10, msg: 'Markdown gerado desatualizado (rode dev/tools/base/gerar.mjs)' });
    }
  }

  // 11. imutabilidade: todo ORI e toda linha de ids.jsonl que existiam em <rev> continuam idênticos
  if (rev && dir === BASE) {
    const relBase = 'base';
    const antes = (p) => (gitTem(rev, `${relBase}/${p}`) ? lerJsonl(gitShow(rev, `${relBase}/${p}`, { json: false }).toString('utf8')) : []);
    const agoraIds = new Map(ids.map((l) => [l.id, canon(l)]));
    for (const l of antes('ids.jsonl')) if (agoraIds.get(l.id) !== canon(l)) erros.push({ id: l.id, verificacao: 11, msg: `linha de ids.jsonl removida ou alterada desde ${rev}` });
    const agoraOri = new Map(limpos.filter((r) => r.tipo === 'ORI').map((r) => [r.id, canon(r)]));
    for (const f of arquivos.filter((x) => x.startsWith('origem/'))) for (const r of antes(f)) if (agoraOri.get(r.id) !== canon(r)) erros.push({ id: r.id, verificacao: 11, msg: `ORI removido ou alterado desde ${rev}` });
    // arquivos de origem que existiam em rev e sumiram
    try {
      const lista = gitShow(rev, `${relBase}/origem`, { json: false }).toString('utf8').split('\n').filter((n) => n.endsWith('.jsonl'));
      for (const n of lista) if (!arquivos.includes(`origem/${n}`)) erros.push({ id: n, verificacao: 11, msg: `arquivo de origem removido desde ${rev}` });
    } catch { /* origem/ ainda não existia em rev */ }
  }
  return { registros: limpos.length, arquivos: arquivos.length, erros, avisos: v.avisos };
}

// ---------- autoteste ----------
export function autoteste(base) {
  const achar = (rs, f) => rs.find(f);
  const casos = [
    [1, 'campo obrigatório ausente', (rs) => delete achar(rs, (r) => r.tipo === 'VOC').forma],
    [1, 'status fora da lista', (rs) => { achar(rs, (r) => r.tipo === 'VOC').status = 'publicado'; }],
    [1, 'tradução que não é objeto {texto, origem}', (rs) => { achar(rs, (r) => r.traducoes?.length).traducoes.push('pegar'); }],
    [2, 'ID duplicado', (rs) => rs.push({ ...rs[0] })],
    [2, 'prefixo do ID diferente do tipo', (rs) => { achar(rs, (r) => r.tipo === 'VOC').id = 'EXP-999997'; }],
    [2, 'ID ilustrativo sem a marca _ilustrativo', (rs) => { delete achar(rs, (r) => r.tipo === 'VOC')._ilustrativo; }],
    [2, 'registro público na faixa privada', (rs) => { const v = achar(rs, (r) => r.tipo === 'VOC'); v.id = 'VOC-500001'; delete v._ilustrativo; }],
    [3, 'evidência quebrada', (rs) => achar(rs, (r) => r.tipo === 'VOC').evidencias.push({ ori: 'ORI-999999' })],
    [4, 'original alterado (um espaço a mais) com hash recalculado', (rs) => { const o = achar(rs, (r) => r.tipo === 'ORI'); o.conteudo.en += ' '; o.hash = hashOf(o.conteudo); }],
    [4, 'hash do registro errado', (rs) => { achar(rs, (r) => r.tipo === 'ORI').hash = `sha256:${'0'.repeat(64)}`; }],
    [4, 'local inexistente na fonte', (rs) => { const o = achar(rs, (r) => r.tipo === 'ORI'); o.local = '/routines/99/vocab/0'; }],
    [6, 'ORI órfão', (rs) => { const o = structuredClone(achar(rs, (r) => r.tipo === 'ORI')); o.id = 'ORI-999998'; rs.push(o); }],
    [7, 'equivalente_a sem DEC aprovada', (rs) => { achar(rs, (r) => r.tipo === 'REL').relacao = 'equivalente_a'; }],
    [7, 'duplicado_de com conteúdo diferente', (rs) => { achar(rs, (x) => x.relacao === 'variante_de').relacao = 'duplicado_de'; }],
    [8, 'tradução sem origem', (rs) => { delete achar(rs, (r) => r.traducoes?.length).traducoes[0].origem; }],
    [8, 'classificação central forçada numa divergência', (rs) => { achar(rs, (r) => r.forma === 'get changed').subtipo = 'phrasal'; }],
    [9, 'fonte privada com caminho', (rs) => { achar(rs, (r) => r.tipo === 'FON' && r.camada === 'privada').arquivo = 'x.docx'; }],
    [9, 'nome privado em texto', (rs) => { achar(rs, (r) => r.tipo === 'DEC').justificativa += ` ${Buffer.from('RUFD', 'base64').toString()}`; }],
    [9, 'texto idêntico a linha de fonte privada', (rs) => { achar(rs, (r) => r.tipo === 'DEC').justificativa = 'Linha sintética de uma fonte privada'; }, { impressoes: new Set([impressao('Linha sintética de uma fonte privada')]) }],
    [5, 'conservação: originais ≠ incorporados + pendentes', () => {}, { conferencias: new Map([['FON-900001', { originais: 99, pendentes: [] }]]) }],
  ];
  let falhas = 0;
  for (const [chk, nome, mut, op = {}] of casos) {
    const rs = structuredClone(base); mut(rs);
    const ok = validar(rs, op).erros.some((e) => e.verificacao === chk);
    if (!ok) falhas++;
    console.log(`${ok ? 'ok   ' : 'FALHA'} verificação ${chk} (${VERIFICACOES[chk]}) reprova: ${nome}`);
  }
  console.log(`autoteste: ${casos.length - falhas}/${casos.length}`);
  return falhas;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = process.argv.slice(2);
  const opt = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const impressoes = opt('--impressoes') ? new Set(readFileSync(opt('--impressoes'), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)) : null;
  const gitFonte = !a.includes('--sem-git-fonte');
  let res;
  if (a.includes('--autoteste') || opt('--arquivo')) {
    const arq = opt('--arquivo') || join(REPO, 'dev/tools/base/exemplos/exemplos.jsonl');
    const regs = lerJsonl(readFileSync(arq, 'utf8'));
    if (a.includes('--autoteste')) process.exit(autoteste(regs) ? 1 : 0);
    const v = validar(regs, { gitFonte, impressoes });
    res = { registros: regs.length, arquivos: 1, ...v, naoExecutadas: [5, 10, 11, ...(gitFonte ? [] : [4])] };
  } else {
    const dir = opt('--base') || BASE;
    res = validarBase({ dir, camada: opt('--camada') || 'publica', rev: opt('--imutavel-desde') ?? 'HEAD', gitFonte, impressoes });
    res.naoExecutadas = dir === BASE ? [] : [10, 11];
  }
  res.avisos = [...new Map(res.avisos.map((w) => [`${w.id} ${w.msg}`, w])).values()];
  console.log(`${res.arquivos} arquivo(s), ${res.registros} registro(s): ${res.erros.length} erro(s), ${res.avisos.length} aviso(s)`);
  const porChk = {};
  for (const e of res.erros) porChk[e.verificacao] = (porChk[e.verificacao] || 0) + 1;
  for (const [k, n] of Object.entries(VERIFICACOES)) console.log(`  ${porChk[k] ? 'ERRO' : res.naoExecutadas.includes(+k) ? 'n/a ' : 'ok  '} ${k}. ${n}${porChk[k] ? ` (${porChk[k]})` : res.naoExecutadas.includes(+k) ? ' — não executada neste modo' : ''}`);
  for (const e of res.erros) console.log(`  [${e.verificacao}] ${e.id}: ${e.msg}`);
  for (const w of res.avisos) console.log(`  aviso ${w.id}: ${w.msg}`);
  process.exit(res.erros.length ? 1 : 0);
}
