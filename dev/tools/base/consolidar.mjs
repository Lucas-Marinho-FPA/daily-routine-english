// Base Pedagógica — consolidação de um grupo de fontes (uma etapa por vez; arquitetura.md §8).
// 1. hash do arquivo original; 2. extração literal com cobertura total (extrair.mjs); 3. ORI imutáveis;
// 4. unidades pelo adaptador do grupo; 5. relações/divergências só com evidência; 6. conferência por fonte.
// Determinístico e idempotente: rodar de novo com as mesmas fontes produz os mesmos arquivos e os mesmos IDs.
// Uso (na raiz do repositório): node dev/tools/base/consolidar.mjs <grupo>     (ex.: lucas)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE, canon, hashOf, hashBytes, gitShow, lerJsonl, arquivoDe, jsonl, Ids, ARQUIVO_DO_TIPO } from './lib.mjs';
import { FONTES } from './fontes.mjs';
import { extrair, recuperavel } from './extrair.mjs';
import { derivar } from './derivar.mjs';
import { DECISOES } from './decisoes.mjs';

export const DATA = '2026-11-09';
const EXTRATOR = 'dev/tools/base/extrair.mjs@1';
const ORDEM_CHAVES = ['id', 'tipo', 'codigo', 'forma', 'subtipo', 'estrutura', 'enunciado', 'pergunta', 'original', 'texto', 'titulo',
  'status', 'versao', 'historico', 'jornadas', 'fonte', 'versao_fonte', 'local', 'id_original', 'regra', 'conteudo', 'hash', 'extraido_em', 'extrator'];
const ordenar = (r) => Object.fromEntries([...ORDEM_CHAVES.filter((k) => k in r), ...Object.keys(r).filter((k) => !ORDEM_CHAVES.includes(k))].map((k) => [k, r[k]]));

export function carregarBase() {
  const ler = (f) => (existsSync(join(BASE, f)) ? lerJsonl(readFileSync(join(BASE, f), 'utf8')) : []);
  const registros = [];
  for (const f of new Set(Object.values(ARQUIVO_DO_TIPO))) registros.push(...ler(f));
  const fons = registros.filter((r) => r.tipo === 'FON');
  for (const f of fons) registros.push(...ler(`registros/origem/${f.id}.jsonl`));
  return { registros, ids: ler('ids.jsonl') };
}

export function consolidar(grupo, adaptador) {
  const antes = carregarBase();
  const ids = new Ids(antes.ids, DATA);
  const porId = new Map(antes.registros.map((r) => [r.id, r]));
  const novos = new Map();          // id → registro produzido nesta consolidação
  const conferencias = [];
  const oriDe = {};                 // codigo → local → id

  // ---------- fontes e registros de origem ----------
  for (const f of FONTES.filter((x) => x.grupo === grupo)) {
    const bytes = gitShow(f.versao, f.arquivo, { json: false });
    const doc = JSON.parse(bytes.toString('utf8'));
    const fid = ids.id('FON', f.codigo);
    const ex = extrair(doc, f.regras);
    if (ex.descobertos.length || ex.sobrepostos.length) throw new Error(`${f.codigo}: extração incompleta — descobertos ${ex.descobertos.join(', ')}; sobrepostos ${ex.sobrepostos.join(', ')}`);
    oriDe[f.codigo] = {};
    const oris = ex.registros.map((x) => {
      const id = ids.id('ORI', `${fid}@${f.versao}:${x.local}`);
      const ori = { id, tipo: 'ORI', fonte: fid, versao_fonte: f.versao, local: x.local,
        ...(x.conteudo && typeof x.conteudo === 'object' && typeof x.conteudo.id === 'string' ? { id_original: x.conteudo.id } : {}),
        regra: x.regra, conteudo: x.conteudo, hash: hashOf(x.conteudo), extraido_em: DATA, extrator: EXTRATOR };
      const velho = porId.get(id);
      if (velho) { // imutável: um ORI existente nunca é regravado diferente
        const { extraido_em: a, ...va } = velho, { extraido_em: b, ...vb } = ori;
        if (canon(va) !== canon(vb)) throw new Error(`${id}: o registro de origem mudaria — proibido (ORI é imutável)`);
        novos.set(id, velho); oriDe[f.codigo][x.local] = id; return velho;
      }
      novos.set(id, ordenar(ori)); oriDe[f.codigo][x.local] = id; return ori;
    });
    if (!recuperavel(oris, ex.listas, doc)) throw new Error(`${f.codigo}: a fonte não é reconstruível a partir dos ORI`);
    novos.set(fid, ordenar({ id: fid, tipo: 'FON', codigo: f.codigo, titulo: f.titulo, natureza: f.natureza, distribuicao: f.distribuicao,
      arquivo: f.arquivo, versao: f.versao, hash_arquivo: hashBytes(bytes), ...(f.licenca ? { licenca: f.licenca } : {}),
      ...(f.observacao ? { observacao: f.observacao } : {}), conferencia: 'em_andamento' }));
    conferencias.push({ fonte: fid, codigo: f.codigo, arquivo: f.arquivo, versao: f.versao, hash_arquivo: hashBytes(bytes),
      regras: f.regras, originais: ex.registros.length, pendentes: [], listas: ex.listas, sem_unidade: [] });
  }

  // ---------- unidades (adaptador do grupo) ----------
  const ori = (codigo, local) => { const id = oriDe[codigo]?.[local]; if (!id) throw new Error(`ORI inexistente: ${codigo} ${local}`); return id; };
  const conteudo = (id) => novos.get(id).conteudo;
  const semUnidade = (oriId, destino, motivo) => conferencias.find((c) => c.fonte === novos.get(oriId).fonte).sem_unidade.push({ ori: oriId, destino, motivo });
  const brutos = adaptador({ ids, ori, conteudo, semUnidade, existentes: porId, data: DATA, fontes: oriDe });
  // um grupo nunca apaga o que outro registrou: a unidade existente é unida ao que o adaptador devolveu
  // (listas: união, mantendo a ordem existente; valores: o do adaptador, sem perder campos que só a existente tem)
  const doAdaptador = brutos.map((u) => {
    const velho = porId.get(u.id);
    if (!velho || ['ORI', 'FON', 'REL', 'DIV'].includes(u.tipo)) return u;
    const m = { ...velho, ...u };
    for (const k of Object.keys(velho)) if (Array.isArray(velho[k]) && Array.isArray(u[k]) && !['historico'].includes(k)) {
      const vistos = new Set(velho[k].map(canon)); m[k] = [...velho[k], ...u[k].filter((x) => !vistos.has(canon(x)))];
    }
    m.versao = velho.versao; m.historico = velho.historico;
    return m;
  });
  // derivações globais sobre a base inteira (existente + o que este grupo produziu)
  const combinado = new Map([...porId].filter(([, r]) => r.tipo !== 'ORI'));
  for (const u of doAdaptador) combinado.set(u.id, u);
  const ordem = new Map(ids.linhas.map((l, i) => [l.id, i]));
  // decisões aprovadas (dev/tools/base/decisoes.mjs): registros DEC imutáveis, criados uma vez, aplicados pela derivação
  for (const dec of DECISOES) {
    const id = ids.id('DEC', dec.chave);
    const { chave, forma, ...campos } = dec;
    const alvo = [...combinado.values()].find((r) => (r.tipo === 'EXP' || r.tipo === 'VOC') && r.forma === forma);
    if (!alvo) throw new Error(`decisão ${chave}: unidade “${forma}” inexistente`);
    const reg = ordenar({ id, tipo: 'DEC', ...campos, evidencias: (alvo.classificacoes_origem || []).map((c) => ({ ori: c.ori })),
      efeitos: campos.efeitos.map((e) => ({ unidade: alvo.id, ...e })) });
    const velho = porId.get(id);
    if (velho && canon(velho) !== canon(reg)) throw new Error(`${id}: uma decisão registrada não muda — revogue-a com uma nova DEC`);
    combinado.set(id, reg); doAdaptador.push(reg);
  }
  const catalogo = JSON.parse(readFileSync(join(BASE, 'progressao/catalogo.json'), 'utf8'));
  const d = derivar({ registros: [...combinado.values()], ids, ordem, catalogo });
  const final = new Map(doAdaptador.map((u) => [u.id, u]));
  for (const u of [...d.unidades, ...d.divergencias, ...d.relacoes]) final.set(u.id, u);
  const unidades = [...final.values()];

  // versões: unidade existente que muda recebe versão nova (histórico só cresce)
  for (const u of unidades) {
    const velho = porId.get(u.id);
    if (velho && !['ORI', 'FON'].includes(u.tipo) && velho.versao === undefined) { // REL e DIV: sem versão própria; o git guarda o histórico
      novos.set(u.id, canon(velho) === canon(u) ? velho : ordenar(u)); continue;
    }
    if (velho && !['ORI', 'FON'].includes(u.tipo)) {
      const { versao: va, historico: ha, ...ca } = velho, { versao: vb, historico: hb, ...cb } = u;
      if (canon(ca) === canon(cb)) { novos.set(u.id, velho); continue; }
      u.versao = velho.versao + 1;
      const novaDec = u.subtipo_decisao && u.subtipo_decisao !== velho.subtipo_decisao;
      u.historico = [...velho.historico, novaDec
        ? { versao: u.versao, data: DATA, mudanca: `classificação central aplicada (subtipo: ${u.subtipo}); classificações de origem preservadas`, decisao: u.subtipo_decisao }
        : { versao: u.versao, data: DATA, mudanca: `atualizada na consolidação do grupo “${grupo}”` }];
    }
    novos.set(u.id, ordenar(u));
  }

  // ---------- conferência ----------
  const citados = new Set();
  const marcar = (x) => { if (Array.isArray(x)) x.forEach(marcar); else if (x && typeof x === 'object') { if (typeof x.ori === 'string') citados.add(x.ori); Object.values(x).forEach(marcar); } };
  for (const u of unidades) if (u.tipo !== 'ORI') marcar(u);
  for (const c of conferencias) {
    const daFonte = [...novos.values()].filter((r) => r.tipo === 'ORI' && r.fonte === c.fonte);
    c.incorporados = daFonte.length;
    const semDestino = daFonte.filter((r) => !citados.has(r.id) && !c.sem_unidade.some((s) => s.ori === r.id));
    if (semDestino.length) throw new Error(`${c.codigo}: ${semDestino.length} ORI sem destino (ex.: ${semDestino.slice(0, 5).map((r) => r.local).join(', ')})`);
    c.sem_unidade.sort((a, b) => a.ori.localeCompare(b.ori));
    c.destinos = { em_unidades: daFonte.filter((r) => citados.has(r.id)).length, sem_unidade: c.sem_unidade.length,
      por_destino: c.sem_unidade.reduce((m, s) => ((m[s.destino] = (m[s.destino] || 0) + 1), m), {}) };
    c.recuperavel = true;
    if (c.originais === c.incorporados + c.pendentes.length && !semDestino.length) novos.get(c.fonte).conferencia = 'concluida';
  }

  // ---------- gravação (tudo o que já existia e não foi tocado permanece) ----------
  const todos = new Map([...porId, ...novos]);
  const porArquivo = {};
  for (const r of todos.values()) (porArquivo[arquivoDe(r)] ||= []).push(r);
  for (const f of new Set(Object.values(ARQUIVO_DO_TIPO))) porArquivo[f] ||= [];
  for (const [f, rs] of Object.entries(porArquivo)) {
    rs.sort((a, b) => (a.tipo === 'ORI' ? 0 : a.id.localeCompare(b.id)) || (Number(a.id.slice(4)) - Number(b.id.slice(4))));
    mkdirSync(dirname(join(BASE, f)), { recursive: true });
    writeFileSync(join(BASE, f), jsonl(rs));
  }
  writeFileSync(join(BASE, 'ids.jsonl'), jsonl(ids.linhas));
  for (const c of conferencias) writeFileSync(join(BASE, 'conferencia', `${c.fonte}.json`), JSON.stringify(ordenarConf(c), null, 2) + '\n');
  return { conferencias, total: todos.size };
}
const ordenarConf = (c) => { const { fonte, codigo, arquivo, versao, hash_arquivo, originais, incorporados, pendentes, destinos, recuperavel, regras, sem_unidade, listas } = c;
  return { fonte, codigo, arquivo, versao, hash_arquivo, originais, incorporados, pendentes, destinos, recuperavel, regras, sem_unidade, listas }; };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const grupo = process.argv[2];
  const arq = join(dirname(fileURLToPath(import.meta.url)), 'adaptadores', `${grupo}.mjs`);
  if (!grupo || !existsSync(arq)) { console.error(`grupo sem adaptador: ${grupo} (dev/tools/base/adaptadores/<grupo>.mjs)`); process.exit(2); }
  const r = consolidar(grupo, (await import(arq)).default);
  for (const c of r.conferencias) console.log(`${c.codigo} ${c.fonte}: originais ${c.originais} · incorporados ${c.incorporados} · pendentes ${c.pendentes.length} · em unidades ${c.destinos.em_unidades} · sem unidade ${c.destinos.sem_unidade} ${JSON.stringify(c.destinos.por_destino)}`);
  console.log(`registros na base: ${r.total}`);
}
