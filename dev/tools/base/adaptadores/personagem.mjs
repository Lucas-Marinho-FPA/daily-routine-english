// Base Pedagógica — partes comuns aos pacotes de personagem (dev/content/characters/*.json: Karla, Lukinhas).
// Mesmos critérios do adaptador do Lucas; as unidades já existentes são retomadas (nunca recriadas) e recebem as novas
// evidências; exemplos, lacunas, subtipos e divergências são recalculados globalmente por derivar.mjs.
import { construtor } from '../derivar.mjs';
import { basicNormalise } from '../../../../js/engine/text.js';

const ESCALA = (quem) => `lvl 1–4 do pacote ${quem} (escala interna, não CEFR)`;
const desc = (s) => s.replace(/~1/g, '/').replace(/~0/g, '~');
// identificador de item do app (dev/tools/build-content.mjs): 'it.' + slug(en) — usado para resolver referências a itens do Lucas
const slug = (s) => basicNormalise(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

export function pacote({ codigo, quem, grupoMudanca }, ctxApi) {
  const { ids, conteudo, semUnidade, data, fontes, existentes } = ctxApi;
  const b = construtor({ ids, existentes, data, mudanca: grupoMudanca });
  const { U, nova, add, ev, og } = b;
  const F = fontes[codigo];
  const filhos = (prefixo, cod = codigo) => Object.entries(fontes[cod]).filter(([l]) => l.startsWith(`${prefixo}/`) && !l.slice(prefixo.length + 1).includes('/')).map(([l, o]) => ({ o, k: desc(l.slice(prefixo.length + 1)) }));
  const um = (local, cod = codigo) => { const o = fontes[cod][local]; if (!o) throw new Error(`ORI inexistente: ${cod} ${local}`); return o; };
  const talvez = (local) => F[local] || null;
  const v = (o, campo) => ({ valor: campo ? conteudo(o)[campo] : conteudo(o), origem: og(o, campo) });
  const indices = (re) => Object.keys(F).filter((l) => re.test(l)).map((l) => Number(l.split('/')[2])).filter((x, i, a) => a.indexOf(x) === i);

  // contextos já registrados (R5)
  const ctx = {};
  for (const r of existentes.values()) if (r.tipo === 'CTX') ctx[r.codigo] = r.id;
  const ctxIds = (o) => conteudo(o).map((c) => { if (!ctx[c]) throw new Error(`contexto desconhecido ${c}`); return ctx[c]; });

  // léxico
  const lex = (forma) => (/\s/.test(forma.trim())
    ? nova('EXP', forma, { forma, subtipo: null }, grupoMudanca)
    : nova('VOC', forma, { forma }, grupoMudanca));
  const SUBTIPO = ctxApi.catalogo.categorias_que_nomeiam_subtipo;
  const classif = (u, categoria, o) => add(u, 'classificacoes_origem', { categoria, subtipo: Object.hasOwn(SUBTIPO, categoria) && categoria !== '_doc' ? SUBTIPO[categoria] : null, ori: o });
  const itemDe = new Map(); // id do item na fonte → unidade
  const itens = () => {
    for (const { o } of filhos('/items')) {
      const x = conteudo(o);
      const u = ev(lex(x.en), o, 'en');
      itemDe.set(x.id, u);
      add(u, 'traducoes', { texto: x.pt, contexto: quem, origem: og(o, 'pt') });
      if (x.c) classif(u, x.c, o);
      if (x.lvl !== undefined) add(u, 'niveis_origem', { valor: x.lvl, escala: ESCALA(quem), origem: og(o, 'lvl') });
      (x.v || []).forEach((val, j) => add(u, 'variantes', { valor: val, tipo: 'aceita', origem: og(o, `v/${j}`) }));
      if (x.tip) add(u, 'explicacoes', { texto: x.tip, contexto: quem, origem: og(o, 'tip') });
      if (x.explain) add(u, 'explicacoes', { texto: x.explain, contexto: quem, origem: og(o, 'explain') });
      if (x.extra) add(u, 'exemplos_da_fonte', { valor: x.extra, origem: og(o, 'extra') });
      (x.ctx || []).forEach((c, j) => add(u, 'contextos_da_fonte', { valor: ctx[c], origem: og(o, `ctx/${j}`) }));
      for (const k of Object.keys(x)) if (!['id', 'en', 'pt', 'c', 'lvl', 'v', 'tip', 'explain', 'extra', 'ctx'].includes(k)) add(u, 'atributos_origem', { campo: k, valor: x[k], origem: og(o, k) });
    }
    // referências a itens de outro pacote (it.* = Lucas), resolvidas pela convenção do app; ambígua → erro (nada é adivinhado)
    const porSlug = new Map();
    for (const r of [...existentes.values(), ...U.values()]) if ((r.tipo === 'VOC' || r.tipo === 'EXP')) { const k = `it.${slug(r.forma)}`; (porSlug.get(k) || porSlug.set(k, new Set()).get(k)).add(r.id); }
    return (iid) => {
      if (itemDe.has(iid)) return itemDe.get(iid).id;
      const c = porSlug.get(iid);
      if (!c || c.size !== 1) throw new Error(`referência a item não resolvida sem ambiguidade: ${iid}`);
      return [...c][0];
    };
  };

  // personagem principal
  const psgOri = um('/id');
  const psg = ev(nova('PSG', conteudo(psgOri), { codigo: conteudo(psgOri) }, `criada a partir do pacote ${codigo}`), psgOri);
  const oNome = um('/name'); ev(psg, oNome); psg.nome = v(oNome);
  const P = [psg.id];

  // textos (episódios / sessões), segmentos, diálogos
  const txt = {};
  const textos = (resolver, extraTxt = () => {}) => {
    for (const i of indices(/^\/routines\/\d+\/id$/)) {
      const R = (s) => `/routines/${i}/${s}`;
      const oId = um(R('id')), rid = conteudo(oId);
      const t = nova('TXT', `${psg.codigo}:${rid}`, { id_original: rid }, `criada a partir do pacote ${codigo}`);
      txt[rid] = t; ev(t, oId); t.personagens = P;
      for (const [campo, chave] of [['title', 'titulo'], ['pt', 'titulo_pt'], ['kind', 'tipo_na_fonte'], ['dayType', 'tipo_de_dia'], ['priority', 'prioridade'], ['stage', 'estagio'], ['goal', 'objetivo'], ['grammar', 'nota_gramatical']]) {
        const o = talvez(R(campo)); if (o) { ev(t, o); t[chave] = v(o); }
      }
      for (const { o } of filhos(R('basis'))) { ev(t, o); add(t, 'fatos_base', v(o)); }
      for (const { o } of filhos(R('usage'))) { ev(t, o); add(t, 'explicacoes', { texto: conteudo(o), origem: og(o) }); }
      const oUsageVazio = talvez(R('usage')); if (oUsageVazio) { ev(t, oUsageVazio, 'usage'); }
      extraTxt(t, R);
      t.segmentos = []; t.blocos = []; t.dialogos = [];
      for (const bi of Object.keys(F).filter((l) => new RegExp(`^/routines/${i}/blocks/\\d+/pt$`).test(l)).map((l) => Number(l.split('/')[4]))) {
        const B = (s) => R(`blocks/${bi}/${s}`);
        const oBpt = um(B('pt')), oCtx = um(B('ctx')), oKind = talvez(B('kind'));
        ev(t, oBpt); ev(t, oCtx); if (oKind) ev(t, oKind);
        const bloco = { titulo_pt: v(oBpt), ...(oKind ? { tipo_na_fonte: v(oKind) } : {}), contextos: ctxIds(oCtx), segmentos: [] };
        const falas = filhos(B('sentences')).map(({ o: oS }) => {
          const x = conteudo(oS);
          const s = nova('SEG', oS, { original: x.en, texto: t.id }, `frase do pacote ${codigo}`);
          ev(s, oS, 'en'); ev(s, oCtx); add(s, 'traducoes', { texto: x.pt, origem: og(oS, 'pt') });
          if (x.speaker !== undefined) s.falante = v(oS, 'speaker');
          s.contextos = ctxIds(oCtx); s.contextos_origem = og(oCtx);
          (x.items || []).forEach((iid, j) => add(s, 'itens_da_fonte', { valor: resolver(iid), origem: og(oS, `items/${j}`) }));
          (x.facts || []).forEach((f, j) => add(s, 'fatos_da_fonte', { valor: f, origem: og(oS, `facts/${j}`) }));
          for (const k of Object.keys(x)) if (!['en', 'pt', 'speaker', 'items', 'facts'].includes(k)) add(s, 'atributos_origem', { campo: k, valor: x[k], origem: og(oS, k) });
          t.segmentos.push(s.id); bloco.segmentos.push(s.id); return s;
        });
        if (oKind && conteudo(oKind) === 'dialogue') {
          const d = nova('DIA', oKind, {}, `bloco marcado como diálogo na fonte (${codigo})`);
          d.titulo_pt = v(oBpt); d.texto = t.id; d.falas = falas.map((s) => s.id); d.contextos = ctxIds(oCtx);
          ev(d, oKind); ev(d, oBpt);
          for (const s of falas) { ev(d, s.evidencias[0].ori, 'speaker'); if (s.falante) add(d, 'participantes', s.falante); }
          t.dialogos.push(d.id);
        }
        t.blocos.push(bloco);
      }
      if (!t.dialogos.length) delete t.dialogos;
    }
  };

  // perguntas (enunciado compartilhado; resposta, personagem e contexto próprios)
  const perguntas = (resolver) => {
    const porRotina = {};
    for (const { o } of filhos('/questions')) {
      const x = conteudo(o);
      const p = ev(nova('PER', x.q, { enunciado: x.q }, 'enunciado literal de pergunta da fonte'), o, 'q');
      add(p, 'atributos_origem', { campo: 'kind', valor: x.kind, origem: og(o, 'kind') });
      const ctxTxt = txt[x.routine]?.id;
      let alvo, par;
      if (typeof x.a === 'string' && x.a.trim()) {
        const r = nova('RSP', o, { pergunta: p.id, original: x.a, id_original: x.id }, 'resposta-modelo do personagem (literal)');
        ev(r, o, 'a'); r.personagens = P; if (ctxTxt) r.contexto = ctxTxt;
        alvo = r; par = { p, r, o };
      } else {
        alvo = { pergunta: p.id, id_original: x.id, ...(x.hint !== undefined ? { dica: v(o, 'hint') } : {}), origem: og(o) };
        par = { p, r: null, o, aberta: alvo };
      }
      if (x.keywords) add(alvo, 'criterios', { valor: { palavras_chave: x.keywords }, origem: og(o, 'keywords') });
      (x.items || []).forEach((iid, j) => add(alvo, 'itens_da_fonte', { valor: resolver(iid), origem: og(o, `items/${j}`) }));
      (x.facts || []).forEach((f, j) => add(alvo, 'atributos_origem', { campo: 'facts', valor: f, origem: og(o, `facts/${j}`) }));
      if (x.openPersonal !== undefined) add(alvo, 'atributos_origem', { campo: 'openPersonal', valor: x.openPersonal, origem: og(o, 'openPersonal') });
      (porRotina[x.routine] ||= []).push(par);
    }
    for (const [rid, pares] of Object.entries(porRotina)) {
      const a = nova('ATV', `${psg.codigo}:${rid}:perguntas`, { id_original: `${rid} · perguntas` }, `perguntas do pacote ${codigo}`);
      a.contexto = txt[rid].id; a.perguntas = [...new Set(pares.map((x) => x.p.id))]; a.respostas = pares.filter((x) => x.r).map((x) => x.r.id);
      const ab = pares.filter((x) => x.aberta).map((x) => x.aberta); if (ab.length) a.perguntas_abertas = ab;
      a.personagens = P; for (const x of pares) ev(a, x.o);
    }
  };

  const perfil = (campos) => {
    for (const [local, chave] of campos) {
      const lista = filhos(local);
      if (lista.length) for (const { o } of lista) { ev(psg, o); add(psg, chave, v(o)); }
      else { const o = talvez(local); if (o) { ev(psg, o); psg[chave] = v(o); } }
    }
  };

  return { U, b, psg, P, txt, um, talvez, filhos, v, itens, textos, perguntas, perfil, ev, add, og, nova, semUnidade, conteudo, F, codigo };
}
