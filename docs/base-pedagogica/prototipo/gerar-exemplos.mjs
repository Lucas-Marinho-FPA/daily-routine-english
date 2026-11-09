// PROTÓTIPO — gera exemplos ILUSTRATIVOS da Base Pedagógica a partir das fontes reais (somente leitura, via git show).
// Os IDs da faixa 900000 e o campo "_ilustrativo" marcam que nada aqui é a Base de verdade (Etapa 4 ainda não começou).
// Uso (na raiz do repositório): node docs/base-pedagogica/prototipo/gerar-exemplos.mjs
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUB = 'b194cee', REMOD = '8d5ac0c';
const show = (rev, path) => JSON.parse(execFileSync('git', ['show', `${rev}:${path}`], { maxBuffer: 1 << 26 }).toString('utf8'));
const at = (doc, ptr) => ptr.split('/').slice(1).reduce((o, k) => o[k.replace(/~1/g, '/').replace(/~0/g, '~')], doc);
// forma canônica: chaves em ordem alfabética, sem espaços; strings EXATAMENTE como na fonte (sem normalizar nada)
export const canon = (x) => (Array.isArray(x) ? `[${x.map(canon).join(',')}]` : x && typeof x === 'object'
  ? `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${canon(x[k])}`).join(',')}}` : JSON.stringify(x));
export const hashOf = (x) => `sha256:${createHash('sha256').update(canon(x), 'utf8').digest('hex')}`;

let n = 900000;
const ids = {};
const nid = (p) => { ids[p] = (ids[p] || n) + 1; return `${p}-${ids[p]}`; };
const out = [];
const add = (r) => { out.push({ _ilustrativo: true, ...r }); return r.id; };
const H = (mudanca) => [{ versao: 1, data: '2026-11-09', mudanca }];

// ---------- fontes ----------
const F = {};
const fonte = (key, arquivo, versao, extra = {}) => (F[key] = add({ id: nid('FON'), tipo: 'FON', camada: 'publica', natureza: 'autoria', arquivo, versao, ...extra }));
fonte('word', 'dev/content/word/word-extract.json', PUB, { observacao: 'extração generalizada do Word original (o original fica na camada privada)' });
fonte('kid', 'dev/content/characters/lucas-kid.json', PUB);
fonte('qs', 'dev/content/enrich/questions.json', PUB);
fonte('karla', 'dev/content/characters/karla.json', PUB);
fonte('cp', 'dev/content/journeys/cp.json', PUB, { status_fonte: 'publicada' });
fonte('cpR', 'dev/content/journeys/cp.json', REMOD, { status_fonte: 'remodelagem (não publicada)' });
const wordPriv = add({ id: nid('FON'), tipo: 'FON', camada: 'privada', natureza: 'pessoal' }); // Word original: na pública, só ID e natureza

const srcRev = { [F.word]: PUB, [F.kid]: PUB, [F.qs]: PUB, [F.karla]: PUB, [F.cp]: PUB, [F.cpR]: REMOD };
const srcPath = { [F.word]: 'dev/content/word/word-extract.json', [F.kid]: 'dev/content/characters/lucas-kid.json', [F.qs]: 'dev/content/enrich/questions.json', [F.karla]: 'dev/content/characters/karla.json', [F.cp]: 'dev/content/journeys/cp.json', [F.cpR]: 'dev/content/journeys/cp.json' };
const docs = {};
const doc = (f) => (docs[f] ||= show(srcRev[f], srcPath[f]));
const ori = (f, local, tipo_original) => {
  const conteudo = at(doc(f), local);
  return add({ id: nid('ORI'), tipo: 'ORI', camada: 'publica', fonte: f, versao_fonte: srcRev[f], local, id_original: conteudo && conteudo.id ? conteudo.id : null, tipo_original, conteudo, hash: hashOf(conteudo), extraido_em: '2026-11-09', extrator: 'prototipo/gerar-exemplos' });
};
const byId = (id) => out.find((r) => r.id === id);
const rel = (de, relacao, para, status, evidencias, extra = {}) => add({ id: nid('REL'), tipo: 'REL', de, relacao, para, status, evidencias, ...extra });

// ---------- caso 1: “grab” ----------
const gW = ori(F.word, '/routines/3/phrasal/2', 'word.phrasal');
const gK = ori(F.kid, '/items/38', 'lucas-kid.item');
add({ id: nid('VOC'), tipo: 'VOC', camada: 'publica', status: 'ativo', versao: 1, historico: H('criada a partir de 2 ORI com a mesma forma literal'), jornadas: ['jor:daily-routine'],
  forma: 'grab', evidencias: [{ ori: gW, campo: 'en' }, { ori: gK, campo: 'en' }],
  traducoes: [{ texto: byId(gW).conteudo.pt, contexto: 'Lucas · trabalho (R04)', origem: { ori: gW } }, { texto: byId(gK).conteudo.pt, contexto: 'Lukinhas · casa (L06)', origem: { ori: gK } }],
  explicacoes: [{ texto: byId(gW).conteudo.note, origem: { ori: gW } }, { texto: byId(gK).conteudo.explain, origem: { ori: gK } }],
  classe_gramatical: null, classificacoes_origem: [{ categoria: 'verb (items.json table)', ori: gW }, { categoria: byId(gK).conteudo.c, ori: gK }] });
rel(gW, 'variante_de', gK, 'proposta', [{ ori: gW }, { ori: gK }], { motivo: 'mesma forma, traduções e categorias diferentes' });

// ---------- caso 2: “get changed” ----------
const c1 = ori(F.word, '/routines/0/vocab/5', 'word.vocab');
const c2 = ori(F.word, '/routines/7/vocab/4', 'word.vocab');
const c3 = ori(F.word, '/routines/7/phrasal/1', 'word.phrasal');
const c4 = ori(F.kid, '/items/31', 'lucas-kid.item');
const div = add({ id: nid('DIV'), tipo: 'DIV', assunto: 'subtipo de “get changed”', status: 'aberta',
  versoes: [{ valor: 'collocation (vocabulário)', ori: c1 }, { valor: 'collocation (vocabulário)', ori: c2 }, { valor: 'phrasal', ori: c3 }, { valor: byId(c4).conteudo.c, ori: c4 }] });
add({ id: nid('EXP'), tipo: 'EXP', camada: 'publica', status: 'ativo', versao: 1, historico: H('criada; subtipo pendente da divergência'), jornadas: ['jor:daily-routine'],
  forma: 'get changed', subtipo: null, divergencias: [div], evidencias: [c1, c2, c3, c4].map((o) => ({ ori: o, campo: 'en' })),
  traducoes: [...new Set([c1, c2, c3, c4].map((o) => byId(o).conteudo.pt))].map((t) => ({ texto: t, origem: { ori: [c1, c2, c3, c4].find((o) => byId(o).conteudo.pt === t) } })),
  classificacoes_origem: [{ categoria: 'vocab', ori: c1 }, { categoria: 'vocab', ori: c2 }, { categoria: 'phrasal', ori: c3 }, { categoria: byId(c4).conteudo.c, ori: c4 }] });
if (byId(c1).hash === byId(c2).hash) rel(c2, 'duplicado_de', c1, 'confirmada', [{ ori: c1 }, { ori: c2 }]);
else rel(c2, 'variante_de', c1, 'proposta', [{ ori: c1 }, { ori: c2 }], { motivo: 'mesma forma, registros diferentes na fonte' });

// ---------- caso 3: perguntas repetidas ----------
const pergunta = (texto, oris, atividades) => {
  const per = add({ id: nid('PER'), tipo: 'PER', camada: 'publica', status: 'ativo', versao: 1, historico: H('enunciado literalmente igual em várias fontes'), jornadas: ['jor:daily-routine'],
    enunciado: texto, evidencias: oris.map((o) => ({ ori: o, campo: 'q' })) });
  for (const [o, quem] of atividades) {
    const rsp = add({ id: nid('RSP'), tipo: 'RSP', camada: 'publica', status: 'ativo', versao: 1, historico: H('resposta-modelo do personagem'), jornadas: ['jor:daily-routine'],
      pergunta: per, personagem: quem, original: byId(o).conteudo.a, evidencias: [{ ori: o, campo: 'a' }] });
    add({ id: nid('ATV'), tipo: 'ATV', camada: 'publica', status: 'ativo', versao: 1, historico: H('atividade de conversa do personagem'), jornadas: ['jor:daily-routine'],
      personagem: quem, perguntas: [per], respostas: [rsp], evidencias: [{ ori: o }],
      habilidades: [{ habilidade: 'hab:speaking', origem: { decisao: 'DEC-900001' } }, { habilidade: 'hab:functional', origem: { decisao: 'DEC-900001' } }] });
  }
  for (let i = 1; i < oris.length; i++) rel(oris[i], 'duplicado_de', oris[0], byId(oris[i]).conteudo.q === byId(oris[0]).conteudo.q ? 'confirmada' : 'proposta', [{ ori: oris[0], campo: 'q' }, { ori: oris[i], campo: 'q' }], { escopo: 'campo q (enunciado); as respostas diferem' });
};
const q1 = ori(F.word, '/routines/0/questions/0', 'word.question');
const q2 = ori(F.kid, '/questions/0', 'lucas-kid.question');
pergunta('What time do you wake up?', [q1, q2], [[q1, 'PSG:lucas'], [q2, 'PSG:lukinhas']]);
const q3 = ori(F.qs, '/new/7', 'enrich.question');
const q4 = ori(F.karla, '/questions/4', 'karla.question');
pergunta('What do you do when you get home?', [q3, q4], [[q3, 'PSG:lucas'], [q4, 'PSG:karla']]);
add({ id: 'DEC-900001', tipo: 'DEC', data: '2026-11-09', decisao: 'perguntas de conversa mobilizam speaking e functional', justificativa: 'ILUSTRATIVO — no app essas perguntas são respondidas falando (Speaking Lab) sobre a própria rotina', aprovada_por: 'pendente (exemplo)' });

// ---------- caso 4: item sem frase (Lucas) ----------
const W = doc(F.word);
let ptr = null;
W.routines.forEach((r, i) => ['vocab', 'phrasal'].forEach((k) => (r[k] || []).forEach((x, j) => { if (!ptr && x.en === 'get up') ptr = `/routines/${i}/${k}/${j}`; })));
if (ptr) {
  const gu = ori(F.word, ptr, 'word.' + ptr.split('/')[3]);
  add({ id: nid('EXP'), tipo: 'EXP', camada: 'publica', status: 'ativo', versao: 1, historico: H('criada; sem segmento de texto que a contextualize'), jornadas: ['jor:daily-routine'],
    forma: 'get up', subtipo: null, evidencias: [{ ori: gu, campo: 'en' }], traducoes: [{ texto: byId(gu).conteudo.pt, origem: { ori: gu } }],
    lacunas: ['sem_contexto_de_texto'], classificacoes_origem: [{ categoria: ptr.split('/')[3], ori: gu }] });
}

// ---------- caso 5: CP01 publicada (65) × remodelagem (74) ----------
const A = doc(F.cp).items, B = doc(F.cpR).items;
const iA = new Map(A.map((x, i) => [x.id, i]));
let iguais = 0, mudaram = 0;
const novos = [];
B.forEach((x, j) => { if (!iA.has(x.id)) novos.push([x, j]); else if (hashOf(A[iA.get(x.id)]) === hashOf(x)) iguais++; else mudaram++; });
const t0 = novos[0];
const oT = ori(F.cpR, `/items/${t0[1]}`, 'cp.item');
add({ id: nid('VOC'), tipo: 'VOC', camada: 'publica', status: 'proposto', versao: 1, historico: H('só na remodelagem (não publicada): aguarda decisão'), jornadas: ['jor:conversation-practice'],
  forma: t0[0].en, evidencias: [{ ori: oT, campo: 'en' }], traducoes: [{ texto: t0[0].pt, origem: { ori: oT } }] });
const resumoCP = { publicada: A.length, remodelagem: B.length, iguais_em_ambas: iguais, mudaram: mudaram, so_na_remodelagem: novos.map(([x]) => `${x.id}=${x.en}`), so_na_publicada: A.filter((x) => !B.some((y) => y.id === x.id)).map((x) => x.id) };

writeFileSync(join(HERE, 'exemplos.jsonl'), out.map((r) => JSON.stringify(r)).join('\n') + '\n');
writeFileSync(join(HERE, 'exemplos-resumo.json'), JSON.stringify({ _ilustrativo: true, gerado_em: '2026-11-09', fontes: { publicada: PUB, remodelagem: REMOD }, registros: out.length, por_tipo: out.reduce((m, r) => ((m[r.tipo] = (m[r.tipo] || 0) + 1), m), {}), cp01: resumoCP, get_changed_word_vocab_iguais: byId(c1).hash === byId(c2).hash }, null, 2) + '\n');
console.log(JSON.stringify({ registros: out.length, cp01: resumoCP }));
