// PROTÓTIPO — validador da Base Pedagógica (somente leitura). Implementa as verificações 1–4, 6–9 de arquitetura.md §10
// sobre um arquivo JSONL. Conservação (5), Markdown (10) e app inalterado (11) só fazem sentido na Etapa 4.
// Uso (na raiz do repositório):
//   node docs/base-pedagogica/prototipo/validar.mjs [arquivo.jsonl]   → valida (padrão: prototipo/exemplos.jsonl)
//   node docs/base-pedagogica/prototipo/validar.mjs --autoteste        → confirma que cada verificação reprova um defeito
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// mesma forma canônica do gerador: chaves ordenadas, sem espaços, strings exatas (nenhuma normalização)
const canon = (x) => (Array.isArray(x) ? `[${x.map(canon).join(',')}]` : x && typeof x === 'object'
  ? `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${canon(x[k])}`).join(',')}}` : JSON.stringify(x));
const hashOf = (x) => `sha256:${createHash('sha256').update(canon(x), 'utf8').digest('hex')}`;

const HERE = dirname(fileURLToPath(import.meta.url));
const ESQ = JSON.parse(readFileSync(join(HERE, 'esquema.json'), 'utf8'));
const D = ESQ.$defs;
const ID_RE = new RegExp(D.id.pattern);
const HASH_RE = new RegExp(D.hash.pattern);
// nomes privados protegidos — mesmo padrão dos builds do projeto, codificado de propósito
const PRIVATE = new RegExp(Buffer.from('XGIoPzppdGFbdcO6XXxFQUN8cGVyc29ubmFsaXRcdyp8bGFzdHJvKVxi', 'base64').toString('utf8'), 'i');
const UNIDADES = ['VOC', 'EXP', 'GRA', 'TXT', 'SEG', 'DIA', 'PER', 'RSP', 'ATV', 'EXE', 'CTX', 'PSG'];
const REL_COM_DEC = ['equivalente_a', 'semelhante_a'];

const gitCache = new Map();
const show = (rev, path) => {
  const k = `${rev}:${path}`;
  if (!gitCache.has(k)) gitCache.set(k, JSON.parse(execFileSync('git', ['show', k], { maxBuffer: 1 << 26 }).toString('utf8')));
  return gitCache.get(k);
};
const at = (doc, ptr) => ptr.split('/').slice(1).reduce((o, k) => (o == null ? undefined : o[k.replace(/~1/g, '/').replace(/~0/g, '~')]), doc);

export function validar(registros, { recalcularHash = true } = {}) {
  const erros = [];
  const err = (id, chk, msg) => erros.push({ id, verificacao: chk, msg });
  const porId = new Map();

  // 2. IDs: padrão e unicidade
  for (const r of registros) {
    if (!ID_RE.test(r.id ?? '')) err(r.id, 2, 'ID fora do padrão');
    else if (r.id.slice(0, 3) !== r.tipo) err(r.id, 2, `prefixo do ID não corresponde ao tipo ${r.tipo}`);
    if (porId.has(r.id)) err(r.id, 2, 'ID duplicado');
    porId.set(r.id, r);
  }
  const existe = (id, tipos) => porId.has(id) && (!tipos || tipos.includes(porId.get(id).tipo));

  for (const r of registros) {
    const t = ESQ.tipos[r.tipo];
    if (!t) { err(r.id, 1, `tipo desconhecido ${r.tipo}`); continue; }
    // 1. esquema (subconjunto: obrigatórios, enums, padrões)
    const req = [...(t.required || []), ...((t.allOf || []).flatMap((a) => (a.$ref ? D[a.$ref.split('/').pop()].required : [])))];
    for (const k of req) if (r[k] === undefined) err(r.id, 1, `campo obrigatório ausente: ${k}`);
    const enumDe = (v, def) => def.enum && !def.enum.includes(v);
    if (r.camada !== undefined && enumDe(r.camada, D.camada)) err(r.id, 1, `camada inválida: ${r.camada}`);
    if (UNIDADES.includes(r.tipo)) {
      if (enumDe(r.status, D.status)) err(r.id, 1, `status inválido: ${r.status}`);
      if (!Number.isInteger(r.versao) || r.versao < 1) err(r.id, 1, 'versão inválida');
      if (!Array.isArray(r.historico) || !r.historico.length) err(r.id, 1, 'histórico vazio');
      else if (r.historico.at(-1).versao !== r.versao) err(r.id, 1, 'última entrada do histórico ≠ versão');
      for (const j of r.jornadas || []) if (enumDe(j, D.jornada)) err(r.id, 1, `jornada desconhecida: ${j}`);
      if (!Array.isArray(r.evidencias) || !r.evidencias.length) err(r.id, 1, 'unidade sem evidência');
    }
    for (const [k, def] of Object.entries(t.properties || {})) if (def.enum && r[k] !== undefined && enumDe(r[k], def)) err(r.id, 1, `${k} inválido: ${r[k]}`);

    // 3. referências
    for (const e of r.evidencias || []) if (!existe(e.ori, ['ORI'])) err(r.id, 3, `evidência aponta para ORI inexistente: ${e.ori}`);
    if (r.tipo === 'ORI' && !existe(r.fonte, ['FON'])) err(r.id, 3, `fonte inexistente: ${r.fonte}`);
    if (r.tipo === 'REL') for (const k of ['de', 'para']) if (!existe(r[k])) err(r.id, 3, `${k} inexistente: ${r[k]}`);
    if (r.tipo === 'RSP' && !existe(r.pergunta, ['PER'])) err(r.id, 3, `pergunta inexistente: ${r.pergunta}`);
    if (r.tipo === 'ATV') {
      for (const p of r.perguntas || []) if (!existe(p, ['PER'])) err(r.id, 3, `pergunta inexistente: ${p}`);
      for (const p of r.respostas || []) if (!existe(p, ['RSP'])) err(r.id, 3, `resposta inexistente: ${p}`);
    }
    for (const d of r.divergencias || []) if (!existe(d, ['DIV'])) err(r.id, 3, `divergência inexistente: ${d}`);
    if (r.tipo === 'DIV') {
      if ((r.versoes || []).length < 2) err(r.id, 1, 'divergência com menos de duas versões');
      for (const v of r.versoes || []) if (!existe(v.ori, ['ORI'])) err(r.id, 3, `versão aponta para ORI inexistente: ${v.ori}`);
    }
    const origens = [...(r.traducoes || []), ...(r.explicacoes || []), ...(r.habilidades || [])].map((x) => x.origem).filter(Boolean);
    for (const o of origens) {
      if (o.ori && !existe(o.ori, ['ORI'])) err(r.id, 3, `origem aponta para ORI inexistente: ${o.ori}`);
      if (o.decisao && !existe(o.decisao, ['DEC'])) err(r.id, 3, `origem aponta para DEC inexistente: ${o.decisao}`);
    }

    // 4. hash do registro ORI = SHA-256 da forma canônica de "conteudo" (não do arquivo de origem)
    if (r.tipo === 'ORI') {
      if (!HASH_RE.test(r.hash ?? '')) err(r.id, 4, 'hash fora do padrão');
      else if (hashOf(r.conteudo) !== r.hash) err(r.id, 4, 'hash não corresponde ao conteúdo registrado');
      const f = porId.get(r.fonte);
      if (recalcularHash && f?.camada === 'publica' && f.arquivo) {
        let orig;
        try { orig = at(show(r.versao_fonte, f.arquivo), r.local); } catch (e) { err(r.id, 4, `fonte ilegível em ${r.versao_fonte}: ${e.message.split('\n')[0]}`); }
        if (orig === undefined) err(r.id, 4, `local ${r.local} não existe na fonte`);
        else if (canon(orig) !== canon(r.conteudo)) err(r.id, 4, 'conteúdo difere do original na versão registrada');
      }
    }

    // 7. relações: equivalência e semelhança só por decisão; duplicado só com conteúdo igual
    if (r.tipo === 'REL') {
      if (REL_COM_DEC.includes(r.relacao) && !existe(r.decisao, ['DEC'])) err(r.id, 7, `${r.relacao} sem DEC`);
      if (r.relacao === 'duplicado_de') {
        const [a, b] = [porId.get(r.de), porId.get(r.para)];
        const campos = new Set((r.evidencias || []).map((e) => e.campo).filter(Boolean));
        const iguais = a?.tipo === 'ORI' && b?.tipo === 'ORI' && (campos.size
          ? [...campos].every((c) => canon(a.conteudo?.[c]) === canon(b.conteudo?.[c]) && a.conteudo?.[c] !== undefined)
          : a.hash === b.hash);
        if (!iguais) err(r.id, 7, 'duplicado_de sem conteúdo idêntico (hash ou campo)');
      }
    }

    // 8. enriquecimento sem origem
    for (const k of ['traducoes', 'explicacoes', 'habilidades']) for (const x of r[k] || []) {
      const o = x.origem;
      if (!o || !(o.ori || o.decisao || o.autoria === 'projeto')) err(r.id, 8, `${k} sem origem`);
    }
    for (const c of r.classificacoes_origem || []) if (!c.ori) err(r.id, 8, 'classificação sem ORI');
    if (r.tipo === 'ATV') for (const h of r.habilidades || []) if (enumDe(h.habilidade, D.habilidade)) err(r.id, 1, `habilidade desconhecida: ${h.habilidade}`);

    // 9. privacidade: fonte privada só com id + natureza; nada privado em registro público
    if (r.tipo === 'FON' && r.camada === 'privada') {
      const extra = Object.keys(r).filter((k) => !['id', 'tipo', 'camada', 'natureza', '_ilustrativo'].includes(k));
      if (extra.length) err(r.id, 9, `fonte privada expõe campos na camada pública: ${extra.join(', ')}`);
    }
    if (r.tipo === 'ORI' && porId.get(r.fonte)?.camada === 'privada') err(r.id, 9, 'ORI de fonte privada no arquivo público');
    if (r.camada === 'privada' && r.tipo !== 'FON') err(r.id, 9, 'registro privado no arquivo público');
    if (PRIVATE.test(JSON.stringify(r))) err(r.id, 9, 'padrão de nome privado encontrado');
  }

  // 6. ORI órfão
  const citados = new Set();
  for (const r of registros) {
    for (const e of r.evidencias || []) citados.add(e.ori);
    for (const v of r.versoes || []) citados.add(v.ori);
    for (const x of [...(r.traducoes || []), ...(r.explicacoes || [])]) if (x.origem?.ori) citados.add(x.origem.ori);
    for (const p of r.pendencias || []) citados.add(p.ori);
  }
  for (const r of registros) if (r.tipo === 'ORI' && !citados.has(r.id)) err(r.id, 6, 'ORI órfão (nenhuma unidade nem pendência aponta para ele)');
  return erros;
}

const ler = (p) => readFileSync(p, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));

function autoteste(base) {
  const clone = () => structuredClone(base);
  const achar = (rs, f) => rs.find(f);
  const casos = [
    [2, 'ID duplicado', (rs) => rs.push({ ...rs[0] })],
    [1, 'campo obrigatório ausente', (rs) => delete achar(rs, (r) => r.tipo === 'VOC').forma],
    [3, 'evidência quebrada', (rs) => achar(rs, (r) => r.tipo === 'VOC').evidencias.push({ ori: 'ORI-999999' })],
    [4, 'conteúdo do ORI alterado (um espaço a mais)', (rs) => { const o = achar(rs, (r) => r.tipo === 'ORI'); o.conteudo.en += ' '; o.hash = hashOf(o.conteudo); }],
    [4, 'hash do registro errado', (rs) => { achar(rs, (r) => r.tipo === 'ORI').hash = `sha256:${'0'.repeat(64)}`; }],
    [6, 'ORI órfão', (rs) => { const o = structuredClone(achar(rs, (r) => r.tipo === 'ORI')); o.id = 'ORI-999998'; rs.push(o); }],
    [7, 'equivalente_a sem DEC', (rs) => { achar(rs, (r) => r.tipo === 'REL').relacao = 'equivalente_a'; }],
    [7, 'duplicado_de com conteúdo diferente', (rs) => { const r = achar(rs, (x) => x.relacao === 'variante_de'); r.relacao = 'duplicado_de'; }],
    [8, 'tradução sem origem', (rs) => { delete achar(rs, (r) => r.traducoes?.length).traducoes[0].origem; }],
    [9, 'fonte privada com caminho', (rs) => { achar(rs, (r) => r.tipo === 'FON' && r.camada === 'privada').arquivo = 'x.docx'; }],
    [9, 'nome privado em texto', (rs) => { achar(rs, (r) => r.tipo === 'DEC').justificativa += ` ${Buffer.from('RUFD', 'base64').toString()}`; }],
  ];
  let falhas = 0;
  for (const [chk, nome, mut] of casos) {
    const rs = clone(); mut(rs);
    const ok = validar(rs).some((e) => e.verificacao === chk);
    if (!ok) falhas++;
    console.log(`${ok ? 'ok   ' : 'FALHA'} verificação ${chk} reprova: ${nome}`);
  }
  return falhas;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const arq = args.find((a) => !a.startsWith('--')) || join(HERE, 'exemplos.jsonl');
  const regs = ler(arq);
  const erros = validar(regs);
  console.log(`${regs.length} registros; ${erros.length} erro(s)`);
  for (const e of erros) console.log(`  [${e.verificacao}] ${e.id}: ${e.msg}`);
  let falhas = 0;
  if (args.includes('--autoteste')) falhas = autoteste(regs);
  process.exit(erros.length || falhas ? 1 : 0);
}
