// Base Pedagógica — adaptador do grupo “lucas” (R1–R7). Cria unidades SÓ a partir dos registros de origem, com origem
// em cada campo. Critérios (modelo-de-dados.md §5):
// - forma literal idêntica = mesma unidade (VOC se uma palavra, EXP se mais de uma); grafias diferentes = unidades diferentes;
// - subtipo de EXP só quando as categorias da fonte que nomeiam um subtipo concordam; senão null (+ divergência se discordam);
// - rótulo de seção (ex.: tabela “phrasal” do Word, que mistura phrasal verbs e expressões verbais — REV-07) não classifica;
// - traduções, explicações, níveis e pronúncias: todos preservados, cada um com origem; valores diferentes = divergência;
// - nenhuma habilidade, nível CEFR, classe gramatical ou fato novo sem fonte.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, canon } from '../lib.mjs';

const CAT = JSON.parse(readFileSync(join(BASE, 'progressao/catalogo.json'), 'utf8'));
const SUBTIPO = CAT.categorias_que_nomeiam_subtipo;
const JOR = ['jor:daily-routine'];
const ESCALA = 'lvl 1–4 do pacote Lucas (escala interna, não CEFR)';
const desc = (s) => s.replace(/~1/g, '/').replace(/~0/g, '~');

export default function lucas({ ids, conteudo, semUnidade, data, fontes }) {
  const U = new Map();
  // ORI filhos diretos de um prefixo, na ordem da fonte: [{o, k}] (k = chave/índice do filho)
  const filhos = (codigo, prefixo) => Object.entries(fontes[codigo]).filter(([l]) => l.startsWith(`${prefixo}/`) && !l.slice(prefixo.length + 1).includes('/')).map(([l, o]) => ({ o, k: desc(l.slice(prefixo.length + 1)) }));
  const um = (codigo, local) => { const o = fontes[codigo][local]; if (!o) throw new Error(`ORI inexistente: ${codigo} ${local}`); return o; };
  const talvez = (codigo, local) => fontes[codigo][local] || null;
  const H = (m) => [{ versao: 1, data, mudanca: m }];
  const nova = (tipo, chave, campos, mudanca) => {
    const id = ids.id(tipo, chave);
    if (!U.has(id)) U.set(id, { id, tipo, ...campos, status: 'ativo', versao: 1, historico: H(mudanca), jornadas: JOR, evidencias: [] });
    return U.get(id);
  };
  const add = (u, campo, item) => { const l = (u[campo] ||= []); if (!l.some((x) => canon(x) === canon(item))) l.push(item); return u; };
  const ev = (u, o, campo) => add(u, 'evidencias', campo ? { ori: o, campo } : { ori: o });
  const og = (o, campo) => (campo ? { ori: o, campo } : { ori: o });
  const v = (o, campo) => ({ valor: campo ? conteudo(o)[campo] : conteudo(o), origem: og(o, campo) });

  // ---------- léxico (VOC/EXP) ----------
  const lex = (forma) => (/\s/.test(forma.trim())
    ? nova('EXP', forma, { forma, subtipo: null }, 'criada na consolidação de R1–R7')
    : nova('VOC', forma, { forma }, 'criada na consolidação de R1–R7'));
  const classif = (u, categoria, o, nomeia) => add(u, 'classificacoes_origem', { categoria, subtipo: nomeia ? SUBTIPO[categoria] ?? null : null, ori: o });
  const itemWord = (o, secao, contexto) => { // R1 {en, pt, note}
    const x = conteudo(o);
    const u = ev(lex(x.en), o, 'en');
    if (x.pt) add(u, 'traducoes', { texto: x.pt, contexto, origem: og(o, 'pt') });
    if (x.note) add(u, 'explicacoes', { texto: x.note, contexto, origem: og(o, 'note') });
    classif(u, `secao:${secao}`, o, false);
  };

  // ---------- personagem (R7.profile) ----------
  const psg = nova('PSG', 'lucas', { codigo: 'lucas' }, 'criada a partir do perfil do personagem (R7)');
  const oSrc = um('R7', '/profile/source'); ev(psg, oSrc); psg.fonte_do_perfil = v(oSrc);
  for (const [campo, chave] of [['traits', 'tracos'], ['facts', 'fatos'], ['pending', 'pendencias_da_fonte']]) {
    for (const { o } of filhos('R7', `/profile/${campo}`)) { ev(psg, o); add(psg, chave, v(o)); }
  }
  const P = [psg.id];

  // ---------- contextos (R5) ----------
  const ctx = {};
  for (const { o } of filhos('R5', '/contexts')) {
    const x = conteudo(o);
    const u = ev(nova('CTX', x.id, { codigo: x.id }, 'criada a partir de R5 (contextos)'), o);
    u.nome = v(o, 'en');
    add(u, 'traducoes', { texto: x.pt, origem: og(o, 'pt') });
    add(u, 'atributos_origem', { campo: 'icon', valor: x.icon, origem: og(o, 'icon') });
    ctx[x.id] = u.id;
  }
  const ctxIds = (o) => conteudo(o).map((c) => { if (!ctx[c]) throw new Error(`contexto desconhecido ${c}`); return ctx[c]; });
  for (const { o } of filhos('R5', '/categories')) semUnidade(o, 'metadado', 'rótulo de categoria da fonte (os valores aparecem em classificacoes_origem)');
  for (const { o } of filhos('R5', '/dayTypes')) semUnidade(o, 'metadado', 'rótulo do tipo de dia (o valor aparece em TXT.tipo_de_dia)');
  semUnidade(um('R5', '/_doc'), 'metadado', 'documentação do arquivo');

  // ---------- rotinas R01–R10 (R1 + R5 + R7.existing) ----------
  const txt = {}, seg = {}, segs = [];
  const rotinas = Object.keys(fontes.R1).filter((l) => /^\/routines\/\d+\/id$/.test(l)).map((l) => Number(l.split('/')[2]));
  for (const i of rotinas) {
    const R = (s) => `/routines/${i}/${s}`;
    const oId = um('R1', R('id')), rid = conteudo(oId);
    const t = nova('TXT', `lucas:${rid}`, { id_original: rid }, 'criada a partir da rotina do Word (R1), com R5 e R7');
    txt[rid] = t; ev(t, oId); t.personagens = P;
    const oT = um('R1', R('title')), oG = um('R1', R('goal'));
    ev(t, oT); ev(t, oG); t.titulo = v(oT); t.objetivo = v(oG);
    const oPt = um('R5', `/routines/${rid}/pt`), oDay = um('R5', `/routines/${rid}/dayType`);
    ev(t, oPt); ev(t, oDay); t.titulo_pt = v(oPt); t.tipo_de_dia = v(oDay);
    const oPri = talvez('R5', `/routines/${rid}/priority`); if (oPri) { ev(t, oPri); t.prioridade = v(oPri); }
    const oEx = um('R7', `/existing/${rid}`); ev(t, oEx); t.estagio = v(oEx, 'stage'); t.nota_gramatical = v(oEx, 'grammar');
    for (const { o } of filhos('R1', R('usage'))) { ev(t, o); add(t, 'explicacoes', { texto: conteudo(o), origem: og(o) }); }
    const en = filhos('R1', R('en')), pt = filhos('R1', R('pt')), bl = filhos('R5', `/routines/${rid}/blocks`);
    if (en.length !== pt.length || en.length !== bl.length) throw new Error(`${rid}: parágrafos en/pt/blocos com tamanhos diferentes`);
    t.segmentos = en.map(({ o: oEn }, k) => {
      const s = nova('SEG', oEn, { original: conteudo(oEn), texto: t.id, id_original: `${rid}-B${k + 1}` }, 'parágrafo da rotina (R1), tradução paralela (R1) e contextos (R5)');
      ev(s, oEn); ev(s, pt[k].o); ev(s, bl[k].o);
      add(s, 'traducoes', { texto: conteudo(pt[k].o), origem: og(pt[k].o) });
      s.contextos = ctxIds(bl[k].o); s.contextos_origem = og(bl[k].o);
      seg[`${rid}-B${k + 1}`] = s; segs.push(s); return s.id;
    });
    for (const { o } of filhos('R1', R('vocab'))) itemWord(o, 'vocab', `${rid} · vocabulário`);
    for (const { o } of filhos('R1', R('phrasal'))) itemWord(o, 'phrasal', `${rid} · phrasal verbs e expressões verbais`);
  }

  // ---------- perguntas, respostas, atividades ----------
  const rsp = {};
  // pergunta com resposta-modelo → PER + RSP; pergunta aberta/pessoal (sem resposta-modelo na fonte, com dica) → PER e
  // entrada em ATV.perguntas_abertas — nenhuma resposta é inventada
  const qa = (o, idOriginal, contexto) => {
    const x = conteudo(o);
    const p = ev(nova('PER', x.q, { enunciado: x.q }, 'enunciado literal de pergunta da fonte'), o, 'q');
    if (typeof x.a === 'string' && x.a.trim()) {
      const r = nova('RSP', o, { pergunta: p.id, original: x.a, id_original: idOriginal }, 'resposta-modelo do personagem (literal)');
      ev(r, o, 'a'); r.personagens = P; if (contexto) r.contexto = contexto;
      rsp[idOriginal] = r; return { p, r, o };
    }
    const aberta = { pergunta: p.id, id_original: idOriginal, ...(x.hint !== undefined ? { dica: v(o, 'hint') } : {}), origem: og(o) };
    return { p, r: null, o, aberta };
  };
  const atividade = (chave, pares, extra, mudanca) => {
    const a = nova('ATV', chave, extra, mudanca);
    a.perguntas = [...new Set(pares.map((x) => x.p.id))];
    a.respostas = pares.filter((x) => x.r).map((x) => x.r.id);
    const abertas = pares.filter((x) => x.aberta).map((x) => x.aberta);
    if (abertas.length) a.perguntas_abertas = abertas;
    a.personagens = P;
    for (const x of pares) ev(a, x.o);
    return a;
  };
  for (const i of rotinas) {
    const rid = conteudo(um('R1', `/routines/${i}/id`));
    const pares = filhos('R1', `/routines/${i}/questions`).map(({ o }, k) => qa(o, `${rid}.Q${k + 1}`, txt[rid].id));
    if (pares.length) atividade(`R1:${rid}:perguntas`, pares, { id_original: `${rid} · perguntas`, contexto: txt[rid].id }, 'perguntas da rotina no Word (R1)');
  }
  const gerais = filhos('R1', '/generalQuestions').map(({ o }, k) => qa(o, `G.Q${String(k + 1).padStart(2, '0')}`, null));
  atividade('R1:generalQuestions', gerais, { id_original: 'perguntas gerais (Word)' }, 'perguntas gerais do Word (R1)');
  semUnidade(um('R3', '/_doc'), 'metadado', 'documentação do arquivo');
  const novas = filhos('R3', '/new').map(({ o }, k) => {
    const par = qa(o, `N.Q${String(k + 1).padStart(2, '0')}`, null);
    const alvo = par.r || par.p;
    (conteudo(o).facts || []).forEach((f, j) => add(alvo, 'atributos_origem', { campo: 'facts', valor: f, origem: og(o, `facts/${j}`) }));
    if (conteudo(o).openPersonal !== undefined) add(par.p, 'atributos_origem', { campo: 'openPersonal', valor: conteudo(o).openPersonal, origem: og(o, 'openPersonal') });
    return par;
  });
  atividade('R3:new', novas, { id_original: 'perguntas novas (R3)' }, 'perguntas novas do Lucas (R3)');

  // ---------- episódios R11–R18 (R7) ----------
  semUnidade(um('R7', '/_doc'), 'metadado', 'documentação do arquivo');
  const episodios = Object.keys(fontes.R7).filter((l) => /^\/routines\/\d+\/id$/.test(l)).map((l) => Number(l.split('/')[2]));
  for (const i of episodios) {
    const R = (s) => `/routines/${i}/${s}`;
    const oId = um('R7', R('id')), rid = conteudo(oId);
    const t = nova('TXT', `lucas:${rid}`, { id_original: rid }, 'criada a partir do episódio (R7)');
    txt[rid] = t; ev(t, oId); t.personagens = P;
    for (const [campo, chave] of [['title', 'titulo'], ['pt', 'titulo_pt'], ['stage', 'estagio'], ['goal', 'objetivo'], ['grammar', 'nota_gramatical'], ['universe', 'universo']]) {
      const o = um('R7', R(campo)); ev(t, o); t[chave] = v(o);
    }
    for (const { o } of filhos('R7', R('basis'))) { ev(t, o); add(t, 'fatos_base', v(o)); }
    for (const { o } of filhos('R7', R('traits'))) { ev(t, o); add(t, 'tracos_mobilizados', v(o)); }
    for (const { o } of filhos('R7', R('usage'))) { ev(t, o); add(t, 'explicacoes', { texto: conteudo(o), origem: og(o) }); }
    t.segmentos = []; t.blocos = []; t.dialogos = [];
    const blocos = Object.keys(fontes.R7).filter((l) => new RegExp(`^/routines/${i}/blocks/\\d+/pt$`).test(l)).map((l) => Number(l.split('/')[4]));
    for (const b of blocos) {
      const B = (s) => R(`blocks/${b}/${s}`);
      const oBpt = um('R7', B('pt')), oCtx = um('R7', B('ctx')), oKind = talvez('R7', B('kind'));
      ev(t, oBpt); ev(t, oCtx); if (oKind) ev(t, oKind);
      const bloco = { titulo_pt: v(oBpt), ...(oKind ? { tipo_na_fonte: v(oKind) } : {}), contextos: ctxIds(oCtx), segmentos: [] };
      const falas = filhos('R7', B('sentences')).map(({ o: oS }) => {
        const x = conteudo(oS);
        const s = nova('SEG', oS, { original: x.en, texto: t.id }, 'frase do episódio (R7)');
        ev(s, oS, 'en'); ev(s, oCtx); add(s, 'traducoes', { texto: x.pt, origem: og(oS, 'pt') });
        if (x.speaker !== undefined) s.falante = v(oS, 'speaker');
        s.contextos = ctxIds(oCtx); s.contextos_origem = og(oCtx);
        t.segmentos.push(s.id); bloco.segmentos.push(s.id); segs.push(s); return s;
      });
      if (oKind && conteudo(oKind) === 'dialogue') {
        const d = nova('DIA', oKind, {}, 'bloco marcado como diálogo na fonte (R7)');
        d.titulo_pt = v(oBpt); d.texto = t.id; d.falas = falas.map((s) => s.id); d.contextos = ctxIds(oCtx);
        ev(d, oKind); ev(d, oBpt);
        for (const s of falas) { ev(d, s.evidencias[0].ori, 'speaker'); if (s.falante) add(d, 'participantes', s.falante); }
        t.dialogos.push(d.id);
      }
      t.blocos.push(bloco);
    }
    if (!t.dialogos.length) delete t.dialogos;
  }
  // numeração do app: as perguntas dos episódios continuam depois das perguntas do Word da mesma rotina
  const doWord = {};
  for (const i of rotinas) doWord[conteudo(um('R1', `/routines/${i}/id`))] = filhos('R1', `/routines/${i}/questions`).length;
  const porRotina = {};
  for (const { o } of filhos('R7', '/questions')) {
    const x = conteudo(o);
    const lista = (porRotina[x.routine] ||= []);
    const par = qa(o, `${x.routine}.Q${(doWord[x.routine] || 0) + lista.length + 1}`, txt[x.routine]?.id);
    if (x.keywords) add(par.r || par.aberta, 'criterios', { valor: { palavras_chave: x.keywords }, origem: og(o, 'keywords') });
    add(par.p, 'atributos_origem', { campo: 'kind', valor: x.kind, origem: og(o, 'kind') });
    lista.push(par);
  }
  for (const [rid, pares] of Object.entries(porRotina)) atividade(`R7:${rid}:perguntas`, pares, { id_original: `${rid} · perguntas`, contexto: txt[rid].id }, 'perguntas do episódio (R7)');
  for (const { o, k } of filhos('R3', '/keywords')) {
    if (k === '_doc') { semUnidade(o, 'metadado', 'documentação do campo de palavras-chave'); continue; }
    if (!rsp[k]) throw new Error(`palavras-chave de pergunta inexistente: ${k}`);
    ev(rsp[k], o); add(rsp[k], 'criterios', { valor: { palavras_chave: conteudo(o) }, origem: og(o) });
  }
  for (const { o } of filhos('R7', '/items')) {
    const x = conteudo(o);
    const u = ev(lex(x.en), o, 'en');
    add(u, 'traducoes', { texto: x.pt, contexto: 'Lucas 2.0 (episódios R11–R18)', origem: og(o, 'pt') });
    classif(u, x.c, o, true);
    if (x.lvl !== undefined) add(u, 'niveis_origem', { valor: x.lvl, escala: ESCALA, origem: og(o, 'lvl') });
    for (const kk of Object.keys(x)) if (!['en', 'pt', 'c', 'lvl'].includes(kk)) add(u, 'atributos_origem', { campo: kk, valor: x[kk], origem: og(o, kk) });
  }

  // ---------- toolkit, orientações e exercícios (R1) ----------
  for (const [secao, local] of [['toolkit.structures', '/toolkit/structures'], ['toolkit.simplePresent', '/toolkit/simplePresent']]) {
    for (const { o } of filhos('R1', local)) {
      const x = conteudo(o);
      const g = ev(nova('GRA', x.en, { estrutura: x.en }, 'estrutura do toolkit do Word (R1)'), o, 'en');
      add(g, 'traducoes', { texto: x.pt, origem: og(o, 'pt') });
      if (x.note) add(g, 'explicacoes', { texto: x.note, origem: og(o, 'note') });
      add(g, 'atributos_origem', { campo: 'secao', valor: secao, origem: og(o) });
    }
  }
  for (const { o } of filhos('R1', '/toolkit/phrasalReview')) itemWord(o, 'toolkit.phrasalReview', 'toolkit · revisão de phrasal verbs');
  const orientacao = (chave, oris) => {
    const t = nova('TXT', `R1:${chave}`, { id_original: chave }, 'texto de orientação do Word (R1)');
    t.segmentos = oris.map((o) => { const s = nova('SEG', o, { original: conteudo(o), texto: t.id }, 'linha do texto de orientação (R1)'); ev(s, o); ev(t, o); return s.id; });
  };
  for (const c of ['intro', 'howToUse', 'standards']) orientacao(c, filhos('R1', `/${c}`).map((x) => x.o));
  orientacao('toolkit.intro', [um('R1', '/toolkit/intro')]);
  orientacao('mainGoal', [um('R1', '/mainGoal')]);
  for (const { o } of filhos('R1', '/drills')) {
    const x = conteudo(o);
    const e = ev(nova('EXE', o, { id_original: x.title }, 'drill do Word (R1), texto integral'), o);
    e.titulo = v(o, 'title'); e.itens = x.prompts.map((_, j) => ({ ori: o, campo: `prompts/${j}` })); e.personagens = P;
  }
  const chk = filhos('R1', '/checklist').map((x) => x.o);
  const exc = nova('EXE', 'R1:checklist', { id_original: 'checklist' }, 'checklist do Word (R1), texto integral');
  chk.forEach((o) => ev(exc, o)); exc.itens = chk.map((o) => ({ ori: o }));
  semUnidade(um('R1', '/source'), 'metadado', 'identificação da cópia generalizada usada como fonte');

  // ---------- R2: tabela, itens novos, verbos, apelidos ----------
  semUnidade(um('R2', '/_doc'), 'metadado', 'documentação do arquivo');
  const enriquecer = (u, o, x, contexto) => {
    if (x.pt) add(u, 'traducoes', { texto: x.pt, ...(contexto ? { contexto } : {}), origem: og(o, 'pt') });
    if (x.c) classif(u, x.c, o, true);
    if (x.lvl !== undefined) add(u, 'niveis_origem', { valor: x.lvl, escala: ESCALA, origem: og(o, 'lvl') });
    if (x.ipa) add(u, 'pronuncia', { valor: x.ipa, origem: og(o, 'ipa') });
    if (x.tip) add(u, 'explicacoes', { texto: x.tip, origem: og(o, 'tip') });
    (x.v || []).forEach((val, j) => add(u, 'variantes', { valor: val, tipo: 'aceita', origem: og(o, `v/${j}`) }));
    for (const k of Object.keys(x)) if (!['en', 'pt', 'c', 'lvl', 'ipa', 'tip', 'v'].includes(k)) add(u, 'atributos_origem', { campo: k, valor: x[k], origem: og(o, k) });
  };
  for (const { o, k } of filhos('R2', '/table')) enriquecer(ev(lex(k), o), o, conteudo(o), null);
  for (const { o } of filhos('R2', '/new')) { const x = conteudo(o); enriquecer(ev(lex(x.en), o, 'en'), o, x, 'item novo (R2)'); }
  for (const { o } of filhos('R2', '/verbs')) {
    const x = conteudo(o);
    const u = ev(lex(x.base), o, 'base');
    add(u, 'formas_verbais', { valor: { terceira_pessoa: x.third }, origem: og(o, 'third') });
    if (x.pt) add(u, 'traducoes', { texto: x.pt, contexto: 'lista de verbos (R2)', origem: og(o, 'pt') });
  }
  // apelidos declarados pela fonte (forma do Word → item): relação confirmada pelo próprio registro do apelido
  const apelidos = [];
  for (const { o, k } of filhos('R2', '/aliases')) {
    const alvo = conteudo(o);
    const achar = (f) => [...U.values()].find((x) => (x.tipo === 'VOC' || x.tipo === 'EXP') && x.forma === f);
    const uAlvo = achar(alvo), uDe = achar(k);
    if (!uAlvo) { semUnidade(o, 'pendente_decisao', `apelido “${k}” aponta para “${alvo}”, que não é forma de nenhum item`); continue; }
    if (uDe && uDe !== uAlvo) apelidos.push([uDe, uAlvo, o]);
    else { ev(uAlvo, o); add(uAlvo, 'variantes', { valor: k, tipo: 'forma_no_texto_original', origem: og(o) }); }
  }

  // ---------- R4: regras do corretor ----------
  const L = (l) => um('R4', l);
  semUnidade(L('/_doc'), 'metadado', 'documentação do arquivo');
  for (const { o } of filhos('R4', '/errors')) {
    const x = conteudo(o);
    const u = [...U.values()].find((y) => (y.tipo === 'VOC' || y.tipo === 'EXP') && y.forma === x.fix);
    if (u) { ev(u, o, 'fix'); add(u, 'erros_frequentes', { ori: o }); }
    else semUnidade(o, 'recurso_do_corretor', `regra de erro frequente; a correção “${x.fix}” não é forma literal de nenhum item (vínculo exigiria inferência)`);
  }
  for (const [prefixo, motivo] of [
    ['/contractions', 'contração e forma expandida usadas pelo corretor'],
    ['/spellingAmE', 'grafia americana → britânica usada pelo corretor'],
    ['/stopwords', 'palavra funcional ignorada pelo corretor'],
    ['/determiners', 'determinante usado pelo corretor'],
    ['/numberWords', 'número por extenso usado pelo corretor'],
  ]) for (const { o } of filhos('R4', prefixo)) semUnidade(o, 'recurso_do_corretor', motivo);
  semUnidade(L('/practiceVerb'), 'recurso_do_corretor', 'regra practice (AmE) × practise (BrE) usada pelo corretor');
  semUnidade(L('/synonyms/_doc'), 'metadado', 'documentação dos grupos de sinônimos');
  for (const { o } of filhos('R4', '/synonyms/groups')) semUnidade(o, 'pendente_decisao', 'grupo de sinônimos aceitos pelo corretor; equivalência entre unidades só com decisão aprovada (DEC)');

  // ---------- R6: revisão linguística e lacunas ----------
  semUnidade(um('R6', '/_doc'), 'metadado', 'documentação do arquivo');
  for (const { o } of filhos('R6', '/rev')) {
    const x = conteudo(o);
    const alvo = /^R\d\d-B\d+$/.test(x.where) ? seg[x.where] : /^R\d\d\.Q\d+$/.test(x.where) ? rsp[x.where] : null;
    if (alvo) { ev(alvo, o); add(alvo, 'revisoes', { ori: o }); }
    else semUnidade(o, 'revisao_abrangente', `revisão de alcance amplo (onde: “${x.where}”); ligar a unidades específicas exigiria inferência`);
  }
  for (const { o } of filhos('R6', '/gap')) semUnidade(o, 'registro_de_projeto', 'lacuna do documento original e a decisão de projeto tomada (não é conteúdo de uma unidade)');

  // ---------- exemplos, divergências, lacunas, relações ----------
  const lexicos = [...U.values()].filter((u) => u.tipo === 'VOC' || u.tipo === 'EXP');
  const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  for (const u of lexicos) {
    // formas terminadas em “…” são modelos (ex.: “I usually…”): procura-se a parte antes das reticências
    const formas = [u.forma, ...(u.variantes || []).map((x) => x.valor), ...(u.atributos_origem || []).filter((a) => a.campo === 'match').map((a) => a.valor)]
      .filter((f) => typeof f === 'string' && f.trim()).map((f) => f.replace(/\s*(…|\.\.\.)$/u, '')).filter((f) => f.trim());
    const re = new RegExp(`(?<![\\p{L}\\p{N}])(${formas.map(escRe).join('|')})(?![\\p{L}\\p{N}])`, 'iu');
    const ex = segs.filter((s) => re.test(s.original)).map((s) => s.id);
    if (ex.length) u.exemplos = ex;
    const subt = [...new Set((u.classificacoes_origem || []).map((c) => c.subtipo).filter(Boolean))];
    if (u.tipo === 'EXP') u.subtipo = subt.length === 1 ? subt[0] : null;
    const lac = [];
    if (!ex.length) lac.push('sem_contexto_de_texto');
    if (!(u.traducoes || []).length) lac.push('sem_traducao');
    if (lac.length) u.lacunas = lac;
  }
  const divs = [];
  const divergencia = (u, campo, assunto, versoes) => {
    const d = nova('DIV', `${u.id}:${campo}`, { unidade: u.id, campo, assunto }, 'valores diferentes na(s) fonte(s)');
    delete d.status; delete d.versao; delete d.historico; delete d.jornadas; delete d.evidencias;
    d.versoes = versoes; d.status = 'aberta';
    add(u, 'divergencias', d.id); divs.push(d);
  };
  for (const u of lexicos) {
    const cls = (u.classificacoes_origem || []).filter((c) => c.subtipo);
    if (new Set(cls.map((c) => c.subtipo)).size > 1) divergencia(u, 'subtipo', `subtipo de “${u.forma}”`, cls.map((c) => ({ valor: c.categoria, ori: c.ori })));
    for (const [campo, rot, val] of [['traducoes', 'traduções', (x) => x.texto], ['niveis_origem', 'nível de origem', (x) => x.valor], ['pronuncia', 'pronúncia', (x) => x.valor]]) {
      const l = u[campo] || [];
      if (new Set(l.map(val)).size > 1) divergencia(u, campo, `${rot} de “${u.forma}”`, l.map((x) => ({ valor: val(x), ori: x.origem.ori })));
    }
  }
  // relações: duplicado_de (mesmo enunciado em registros diferentes); variante_de (formas iguais sem distinção de maiúsculas)
  const rels = [];
  const rel = (de, relacao, para, status, evidencias, extra = {}) => {
    const id = ids.id('REL', `${de}:${relacao}:${para}`);
    rels.push({ id, tipo: 'REL', de, relacao, para, status, evidencias, ...extra });
  };
  for (const p of [...U.values()].filter((u) => u.tipo === 'PER' && u.evidencias.length > 1)) {
    const [primeiro, ...outros] = p.evidencias;
    for (const e of outros) rel(e.ori, 'duplicado_de', primeiro.ori, 'confirmada', [{ ori: primeiro.ori, campo: 'q' }, { ori: e.ori, campo: 'q' }], { escopo: 'enunciado (campo q); as respostas continuam separadas' });
  }
  for (const [uDe, uAlvo, o] of apelidos) rel(uDe.id, 'variante_de', uAlvo.id, 'confirmada', [{ ori: o }], { motivo: `apelido declarado na fonte: “${uDe.forma}” → “${uAlvo.forma}”` });
  // mesma forma, só muda maiúscula/minúscula (inclui estruturas do toolkit): candidata, nunca fusão automática
  const porMinuscula = new Map();
  for (const u of [...[...U.values()].filter((x) => x.tipo === 'GRA'), ...lexicos]) {
    const f = (u.forma ?? u.estrutura).toLowerCase();
    (porMinuscula.get(f) || porMinuscula.set(f, []).get(f)).push(u);
  }
  for (const grupo of porMinuscula.values()) for (let j = 1; j < grupo.length; j++) {
    rel(grupo[j].id, 'variante_de', grupo[0].id, 'proposta', [{ ori: grupo[0].evidencias[0].ori }, { ori: grupo[j].evidencias[0].ori }], { motivo: 'mesma forma, só muda maiúscula/minúscula' });
  }
  return [...U.values(), ...rels];
}
