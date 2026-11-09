// Base Pedagógica — derivações GLOBAIS, recalculadas sobre a base inteira a cada consolidação (assim o resultado não
// depende da ordem em que os grupos de fontes são consolidados). Mesmos critérios do adaptador do Lucas
// (modelo-de-dados.md §5):
// - exemplos: segmentos de textos NARRATIVOS (texto com personagem) em que a forma, uma variante ou o `match` aparece
//   literalmente (sem diferenciar maiúsculas, com limites de palavra; “…” final = modelo), mais os segmentos em que a
//   própria fonte marca o item (SEG.itens_da_fonte);
// - subtipo de EXP: só quando as categorias que nomeiam subtipo concordam; se discordam, null + divergência;
// - lacunas sem_contexto_de_texto / sem_traducao; divergências de traduções, níveis, pronúncias e subtipo;
// - variante_de proposta para formas que só diferem em maiúsculas/minúsculas; duplicado_de para enunciados repetidos.
import { canon } from './lib.mjs';

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const CALCULADAS = ['sem_contexto_de_texto', 'sem_traducao'];

export function derivar({ registros, ids, ordem }) {
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

  for (const u0 of lexicos) {
    const u = structuredClone(u0);
    const formas = [u.forma, ...(u.variantes || []).map((x) => x.valor), ...(u.atributos_origem || []).filter((a) => a.campo === 'match').map((a) => a.valor)]
      .filter((f) => typeof f === 'string' && f.trim()).map((f) => f.replace(/\s*(…|\.\.\.)$/u, '')).filter((f) => f.trim());
    const re = new RegExp(`(?<![\\p{L}\\p{N}])(${formas.map(escRe).join('|')})(?![\\p{L}\\p{N}])`, 'iu');
    const dec = declarados.get(u.id) || new Set();
    const ex = segs.filter((s) => re.test(s.original) || dec.has(s.id)).map((s) => s.id);
    if (ex.length) u.exemplos = ex; else delete u.exemplos;
    const subt = [...new Set((u.classificacoes_origem || []).map((c) => c.subtipo).filter(Boolean))];
    if (u.tipo === 'EXP' && !u.subtipo_decisao) u.subtipo = subt.length === 1 ? subt[0] : null;
    const outras = (u.lacunas || []).filter((l) => !CALCULADAS.includes(l));
    const lac = [];
    if (!ex.length) lac.push('sem_contexto_de_texto');
    if (!(u.traducoes || []).length) lac.push('sem_traducao');
    const todas = [...lac, ...outras];
    if (todas.length) u.lacunas = todas; else delete u.lacunas;
    // divergências
    const lista = [];
    const cls = (u.classificacoes_origem || []).filter((c) => c.subtipo);
    if (new Set(cls.map((c) => c.subtipo)).size > 1) lista.push(['subtipo', `subtipo de “${u.forma}”`, cls.map((c) => ({ valor: c.categoria, ori: c.ori }))]);
    for (const [campo, rot, val] of [['traducoes', 'traduções', (x) => x.texto], ['niveis_origem', 'nível de origem', (x) => x.valor], ['pronuncia', 'pronúncia', (x) => x.valor]]) {
      const l = u[campo] || [];
      if (new Set(l.map(val)).size > 1) lista.push([campo, `${rot} de “${u.forma}”`, l.map((x) => ({ valor: val(x), ori: x.origem.ori }))]);
    }
    const ds = lista.map(([campo, assunto, versoes]) => {
      const id = ids.id('DIV', `${u.id}:${campo}`);
      const velho = porId.get(id);
      const d = { id, tipo: 'DIV', unidade: u.id, campo, assunto, versoes, status: velho?.status ?? 'aberta', ...(velho?.decisao ? { decisao: velho.decisao } : {}) };
      divs.push(d); return id;
    });
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
