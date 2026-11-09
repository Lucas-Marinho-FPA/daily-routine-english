// Base Pedagógica — derivações GLOBAIS, recalculadas sobre a base inteira a cada consolidação (assim o resultado não
// depende da ordem em que os grupos de fontes são consolidados). Mesmos critérios do adaptador do Lucas
// (modelo-de-dados.md §5):
// - exemplos: segmentos de textos NARRATIVOS (texto com personagem) em que a forma, uma variante ou o `match` aparece
//   literalmente (sem diferenciar maiúsculas, com limites de palavra; “…” final = modelo), mais os segmentos em que a
//   própria fonte marca o item (SEG.itens_da_fonte);
// - subtipo de EXP: só quando as categorias que nomeiam subtipo concordam; se discordam, null + divergência;
// - lacunas sem_contexto_de_texto / sem_traducao; divergências de traduções, níveis, pronúncias e subtipo;
// - variante_de proposta para formas que só diferem em maiúsculas/minúsculas; duplicado_de para enunciados repetidos;
// - formas flexionadas de EXP (morfologia.mjs): REL aparece_em com a forma literal, a posição e o critério —
//   confirmada só para verbos com paradigma no catálogo; as demais ficam como candidatas (proposta);
// - decisões aprovadas (DEC com efeitos): aplicadas sobre a unidade sem apagar as classificações de origem; a
//   divergência correspondente passa a resolvida, apontando para a DEC.
import { canon } from './lib.mjs';
import { ocorrencias } from './morfologia.mjs';

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CALCULADAS = ['sem_contexto_de_texto', 'sem_traducao'];

// critério LITERAL de ocorrência (exportado para os relatórios usarem exatamente o mesmo): forma, variantes e `match`
// da fonte, sem diferenciar maiúsculas, com limites de palavra; “…” final = modelo
export function padraoLiteral(u) {
  const formas = [u.forma, ...(u.variantes || []).map((x) => x.valor), ...(u.atributos_origem || []).filter((a) => a.campo === 'match').map((a) => a.valor)]
    .filter((f) => typeof f === 'string' && f.trim()).map((f) => f.replace(/\s*(…|\.\.\.)$/u, '')).filter((f) => f.trim());
  return new RegExp(`(?<![\\p{L}\\p{N}])(${formas.map(escRe).join('|')})(?![\\p{L}\\p{N}])`, 'iu');
}

export function derivar({ registros, ids, ordem, catalogo = {} }) {
  const paradigmas = Object.fromEntries(Object.entries(catalogo.paradigmas_verbais || {}).filter(([k]) => k !== '_doc'));
  // ordem = posição de criação (linha em ids.jsonl): define “o primeiro” de cada grupo de forma estável
  const pos = (id) => ordem.get(id) ?? Number.MAX_SAFE_INTEGER;
  const porId = new Map(registros.map((r) => [r.id, r]));
  const de = (t) => registros.filter((r) => r.tipo === t).sort((a, b) => pos(a.id) - pos(b.id));
  const narrativos = new Set(de('TXT').filter((t) => (t.personagens || []).length).map((t) => t.id));
  const segs = de('SEG').filter((s) => narrativos.has(s.texto));
  const declarados = new Map();
  for (const s of segs) for (const x of s.itens_da_fonte || []) (declarados.get(x.valor) || declarados.set(x.valor, new Set()).get(x.valor)).add(s.id);
  const lexicos = registros.filter((r) => r.tipo === 'VOC' || r.tipo === 'EXP').sort((a, b) => pos(a.id) - pos(b.id));
  const saida = [];
  const divs = [];
  const flex = []; // [unidade, seg, ocorrência]
  // decisões aprovadas com efeito sobre unidades
  const efeitos = new Map(); // `${unidade}:${campo}` → {dec, valor, explicacao}
  const aprovadas = registros.filter((r) => r.tipo === 'DEC' && r.status === 'aprovada');
  const revogadas = new Set(aprovadas.flatMap((d) => d.revoga || []));   // a DEC revogada fica no histórico, sem efeito
  for (const d of aprovadas.filter((x) => !revogadas.has(x.id))) for (const e of d.efeitos || []) efeitos.set(`${e.unidade}:${e.campo}`, { dec: d.id, valor: e.valor, explicacao: e.explicacao });

  for (const u0 of lexicos) {
    const u = structuredClone(u0);
    const re = padraoLiteral(u);
    const dec = declarados.get(u.id) || new Set();
    const ex = segs.filter((s) => re.test(s.original) || dec.has(s.id)).map((s) => s.id);
    if (ex.length) u.exemplos = ex; else delete u.exemplos;
    // ocorrências flexionadas (só EXP; a forma base literal já está em exemplos)
    let flexConfirmadas = 0;
    if (u.tipo === 'EXP') for (const sg of segs) for (const oc of ocorrencias(u.forma, sg.original, paradigmas)) { flex.push([u, sg, oc]); if (oc.status === 'confirmada') flexConfirmadas++; }
    const subt = [...new Set((u.classificacoes_origem || []).map((c) => c.subtipo).filter(Boolean))];
    if (u.explicacoes) { u.explicacoes = u.explicacoes.filter((x) => !revogadas.has(x.origem?.decisao)); if (!u.explicacoes.length) delete u.explicacoes; }
    const efSub = efeitos.get(`${u.id}:subtipo`);
    if (u.tipo === 'EXP' && efSub) {
      u.subtipo = efSub.valor; u.subtipo_decisao = efSub.dec;
      if (efSub.explicacao) { const item = { texto: efSub.explicacao, origem: { decisao: efSub.dec } }; if (!(u.explicacoes || []).some((x) => canon(x) === canon(item))) (u.explicacoes ||= []).push(item); }
    } else if (u.tipo === 'EXP') { delete u.subtipo_decisao; u.subtipo = subt.length === 1 ? subt[0] : null; }
    const outras = (u.lacunas || []).filter((l) => !CALCULADAS.includes(l));
    const lac = [];
    if (!ex.length && !flexConfirmadas) lac.push('sem_contexto_de_texto');
    if (!(u.traducoes || []).length) lac.push('sem_traducao');
    const todas = [...lac, ...outras];
    if (todas.length) u.lacunas = todas; else delete u.lacunas;
    // divergências
    const lista = [];
    const cls = (u.classificacoes_origem || []).filter((c) => c.subtipo);
    if (new Set(cls.map((c) => c.subtipo)).size > 1) lista.push(['subtipo', `subtipo de “${u.forma}”`, cls.map((c) => ({ valor: c.categoria, ori: c.ori }))]);
    for (const [campo, rot, val] of [['traducoes', 'traduções', (x) => x.texto], ['pronuncia', 'pronúncia', (x) => x.valor]]) {
      const l = u[campo] || [];
      if (new Set(l.map(val)).size > 1) lista.push([campo, `${rot} de “${u.forma}”`, l.map((x) => ({ valor: val(x), ori: x.origem.ori }))]);
    }
    // níveis só se comparam dentro da MESMA escala (cada pacote tem a sua; arquitetura §5)
    const porEscala = new Map();
    for (const n of u.niveis_origem || []) (porEscala.get(n.escala) || porEscala.set(n.escala, []).get(n.escala)).push(n);
    const conflito = [...porEscala.values()].filter((l) => new Set(l.map((x) => x.valor)).size > 1).flat();
    if (conflito.length) lista.push(['niveis_origem', `nível de origem de “${u.forma}”`, conflito.map((x) => ({ valor: x.valor, ori: x.origem.ori }))]);
    const ds = lista.map(([campo, assunto, versoes]) => {
      const id = ids.id('DIV', `${u.id}:${campo}`);
      const velho = porId.get(id);
      const ef = efeitos.get(`${u.id}:${campo}`);
      const d = ef ? { id, tipo: 'DIV', unidade: u.id, campo, assunto, versoes, status: 'resolvida', decisao: ef.dec }
        : { id, tipo: 'DIV', unidade: u.id, campo, assunto, versoes, status: velho?.status ?? 'aberta', ...(velho?.decisao ? { decisao: velho.decisao } : {}) };
      divs.push(d); return id;
    });
    // divergência derivada antes que o critério atual não confirma: anulada com motivo (nunca apagada; ID não reaproveitado)
    for (const d0 of (u.divergencias || []).filter((d) => !ds.includes(d) && porId.get(d)?.unidade === u.id).map((d) => porId.get(d))) {
      if (d0.status === 'aberta') divs.push({ ...d0, status: 'anulada', motivo: d0.campo === 'niveis_origem' ? 'critério corrigido: níveis de escalas de pacotes diferentes não se comparam' : 'o critério atual não confirma a divergência' });
    }
    const manter = (u.divergencias || []).filter((d) => !ds.includes(d) && porId.get(d)?.unidade !== u.id);
    const todasDiv = [...ds, ...manter];
    if (todasDiv.length) u.divergencias = todasDiv; else delete u.divergencias;
    saida.push(u);
  }

  // relações derivadas
  const rels = [];
  const rel = (de_, relacao, para, status, evidencias, extra) => rels.push({ id: ids.id('REL', `${de_}:${relacao}:${para}`), tipo: 'REL', de: de_, relacao, para, status, evidencias, ...extra });
  const porMinuscula = new Map();
  for (const u of [...de('GRA'), ...saida]) {
    const f = (u.forma ?? u.estrutura).toLowerCase();
    (porMinuscula.get(f) || porMinuscula.set(f, []).get(f)).push(u);
  }
  for (const grupo of porMinuscula.values()) for (let j = 1; j < grupo.length; j++) {
    rel(grupo[j].id, 'variante_de', grupo[0].id, 'proposta', [{ ori: grupo[0].evidencias[0].ori }, { ori: grupo[j].evidencias[0].ori }], { motivo: 'mesma forma, só muda maiúscula/minúscula' });
  }
  for (const [u, sg, oc] of flex) {
    rels.push({ id: ids.id('REL', `${u.id}:aparece_em:${sg.id}@${oc.inicio}`), tipo: 'REL', de: u.id, relacao: 'aparece_em', para: sg.id, status: oc.status,
      evidencias: [{ ori: sg.evidencias[0].ori }], forma_canonica: u.forma, forma_encontrada: oc.forma_encontrada, posicao: { inicio: oc.inicio, fim: oc.fim }, criterio: oc.criterio });
  }
  for (const p of de('PER').filter((u) => u.evidencias.length > 1)) {
    const [primeiro, ...outros] = p.evidencias;
    for (const e of outros) rel(e.ori, 'duplicado_de', primeiro.ori, 'confirmada', [{ ori: primeiro.ori, campo: 'q' }, { ori: e.ori, campo: 'q' }], { escopo: 'enunciado (campo q); respostas, personagens e contextos continuam separados' });
  }
  return { unidades: saida, divergencias: divs, relacoes: rels };
}

// helper para adaptadores: começa de uma unidade já existente (nunca perde o que outra fonte registrou)
export function construtor({ ids, existentes, data, mudanca: mudancaPadrao }) {
  const U = new Map();
  const nova = (tipo, chave, campos, mudanca = mudancaPadrao) => {
    const id = ids.id(tipo, chave);
    if (!U.has(id)) {
      const velho = existentes.get(id);
      U.set(id, velho ? structuredClone(velho) : { id, tipo, ...campos, status: 'ativo', versao: 1, historico: [{ versao: 1, data, mudanca }], jornadas: ['jor:daily-routine'], evidencias: [] });
    }
    return U.get(id);
  };
  const add = (u, campo, item) => { const l = (u[campo] ||= []); if (!l.some((x) => canon(x) === canon(item))) l.push(item); return u; };
  const ev = (u, o, campo) => add(u, 'evidencias', campo ? { ori: o, campo } : { ori: o });
  const og = (o, campo) => (campo ? { ori: o, campo } : { ori: o });
  return { U, nova, add, ev, og };
}
