// Lucas 2.0: episódios R11–R18 sobre o mesmo motor, sem alterar o conteúdo existente (Word + curadoria publicada).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { setLexicon } from '../../app/js/engine/lexicon.js';
import { createChecker } from '../../app/js/engine/checker.js';
import { makeExercise } from '../../app/js/engine/exercises.js';
import { buildSession, cardKey } from '../../app/js/engine/scheduler.js';

setLexicon(gunzipSync(readFileSync(new URL('../../app/data/lexicon.txt.gz', import.meta.url))).toString('utf8').split('\n'));
const C = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const EP = JSON.parse(readFileSync(new URL('../../content/enrich/episodes.json', import.meta.url)));
const FX = JSON.parse(readFileSync(new URL('../fixtures/lucas-published-35bd2fb.json', import.meta.url)));
const h = (x) => createHash('sha256').update(JSON.stringify(x)).digest('hex').slice(0, 16);
const episodes = C.routines.filter((r) => r.kind === 'episode');
const WORD = new Set(C.routines.filter((r) => r.kind === 'routine').map((r) => r.id));
const epSentences = Object.values(C.sentences).filter((s) => !WORD.has(s.routine));

test('conteúdo publicado preservado: frases, blocos, rotinas, perguntas, itens e dados do Word idênticos a 35bd2fb', () => {
  for (const [id, v] of Object.entries(FX.sentences)) assert.equal(h(C.sentences[id]), v, `frase ${id}`);
  for (const [id, v] of Object.entries(FX.blocks)) assert.equal(h(C.blocks[id]), v, `bloco ${id}`);
  for (const [id, v] of Object.entries(FX.questions)) assert.equal(h(C.questions[id]), v, `pergunta ${id}`);
  for (const [id, v] of Object.entries(FX.routines)) {
    const r = C.routines.find((x) => x.id === id);
    const { kind, stage, grammar, ...rest } = r; // metadados novos (etapa, foco) ficam de fora da comparação
    assert.equal(h({ ...rest, questions: undefined }), v.core, `rotina ${id}`);
    assert.deepEqual(r.questions.slice(0, v.questions.length), v.questions, `${id}: perguntas antigas primeiro, mesma ordem`);
  }
  for (const [id, v] of Object.entries(FX.items)) {
    const it = C.items[id];
    const core = { ...it }; for (const k of ['sentences', 'routines', 'blocks', 'ctx', 'ex']) delete core[k];
    assert.equal(h(core), v.core, `item ${id}`);
    assert.equal(h(it.ex.slice(0, v.nex)), v.ex, `${id}: exemplos antigos na mesma ordem`);
    assert.deepEqual(it.sentences.filter((s) => WORD.has(C.sentences[s].routine)), v.sentences, `${id}: mesmas frases do Word`);
  }
  for (const [k, v] of Object.entries(FX.top)) assert.equal(h(C[k]), v, k);
});

test('jornada: rotinas do Word (etapa A) primeiro, episódios R11–R18 depois, em etapas B→D', () => {
  assert.deepEqual(C.routines.map((r) => r.id), ['R01', 'R02', 'R03', 'R04', 'R05', 'R06', 'R07', 'R08', 'R09', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18']);
  const order = 'ABCD', st = C.routines.map((r) => order.indexOf(r.stage));
  assert.ok(st.every((x, i) => x >= 0 && (i === 0 || x >= st[i - 1])), C.routines.map((r) => r.stage).join(''));
  for (const r of episodes) {
    assert.ok(r.goal && r.grammar && r.universe && r.traits.length && r.basis.length, r.id);
    assert.equal(r.dayType, 'episode'); assert.equal(r.source, 'new');
    const qs = r.questions.map((q) => C.questions[q]);
    assert.ok(qs.some((q) => q.kind === 'conv') && qs.some((q) => q.kind === 'comp') && qs.some((q) => q.kind === 'transfer' && q.openPersonal && q.hint && !q.a), `${r.id}: conversa, compreensão e transferência`);
  }
  // variedade: a maioria dos episódios tem diálogo; os outros são narrativa de decisão/análise (R13, R17)
  assert.deepEqual(episodes.filter((r) => !r.blocks.some((b) => C.blocks[b].kind === 'dialogue')).map((r) => r.id), ['R13', 'R17']);
  // R02–R10 ganham compreensão + transferência; R01 (apresentação da aula) não muda
  assert.equal(C.routines[0].questions.length, 5);
  for (const r of C.routines.slice(1, 10)) assert.deepEqual(r.questions.slice(4).map((q) => C.questions[q].kind), ['comp', 'transfer'], r.id);
});

test('Perfil Arquiteto e universos: todos os traços e os oito universos aparecem em situações concretas', () => {
  const traits = new Set(episodes.flatMap((r) => r.traits));
  assert.deepEqual([...EP.profile.traits].filter((t) => !traits.has(t)), [], 'traço sem episódio');
  assert.equal(new Set(episodes.map((r) => r.universe)).size, 8);
  // personalidade por decisões e reações, não por rótulos: os adjetivos do perfil não aparecem no texto em inglês
  const en = epSentences.map((s) => s.en).join(' ');
  assert.doesNotMatch(en, /\b(analytical|idealistic|pragmatic|collaborative|disciplined|competitive|transparent)\b/i);
  // humano: cansaço, frustração, erro e desculpas aparecem
  for (const w of [/\btired\b/, /\bfrustrated\b/, /\bmistake\b/, /\bSorry\b/, /\bnot sure\b/]) assert.match(en, w);
});

test('privacidade e ficção: nada de empregador, escola, agência ou nomes da família; secundários declarados por papel', () => {
  const texts = [...epSentences.flatMap((s) => [s.en, s.pt]), ...Object.values(C.questions).filter((q) => q.source === 'new').flatMap((q) => [q.q, q.a, q.hint || ''])];
  assert.doesNotMatch(texts.join(' '), new RegExp(Buffer.from('XGIoaXRhW3XDul18RUFDfHBlcnNvbm5hbGl0XHcqfGxhc3RybylcYg==', 'base64').toString('utf8'), 'i') /* nomes privados (codificados) */);
  const allowed = new Set(['I', 'Lucas', 'Dad', 'Uber', 'Python', 'AI', 'Border', 'Collie', 'Hyrox', 'São', 'Paulo', 'Die', 'Zero', 'March', 'Friday', 'Tuesday', 'Sunday', 'Saturdays', 'English', 'Yes', 'No', 'OK']);
  const names = new Set(epSentences.flatMap((s) => [...s.en.matchAll(/(?<![.!?:]\s|^)\b[A-Z][a-z]+/g)].map((m) => m[0])).filter((w) => !allowed.has(w)));
  assert.deepEqual([...names], [], 'nome próprio não declarado');
  assert.deepEqual([...new Set(epSentences.map((s) => s.speaker).filter(Boolean))].sort(), ['Lucas', 'Manager', 'Passenger', 'Sister', 'Son', 'Wife']);
  assert.doesNotMatch(epSentences.map((s) => s.en).join(' '), /\byears old\b|\bmy daughter\b|\bsalary\b|\bR\$/i);
});

test('vocabulário: itens novos só nos episódios; itens do Lucas retomados nos episódios; retomada entre episódios', () => {
  const fresh = Object.values(C.items).filter((it) => it.tags.includes('episode'));
  assert.ok(fresh.length >= 60);
  for (const it of fresh) {
    assert.ok(it.sentences.length, `${it.id} sem frase`);
    assert.ok(it.sentences.every((s) => !WORD.has(C.sentences[s].routine)), `${it.id} entrou numa rotina do Word`);
  }
  const old = Object.keys(FX.items).filter((id) => C.items[id].sentences.some((s) => !WORD.has(C.sentences[s].routine)));
  assert.ok(old.length >= 15, `${old.length} itens antigos retomados`);
  for (const id of ['it.deal-with', 'it.instead-of', 'it.it-depends-on', 'it.analyse', 'it.since', 'it.get-some-rest', 'it.focus-on', 'it.clear-my-head', 'it.at-the-weekend', 'it.drive-for-uber']) {
    assert.ok(old.includes(id), `${id} não retomado`);
  }
  const multi = fresh.filter((it) => it.routines.length > 1).map((it) => it.en);
  for (const w of ['suggest', 'weigh the options', 'learn from', 'frustrated', 'tired', 'deadline', 'route', 'priorities']) assert.ok(multi.includes(w), `${w}: retomado em outro episódio`);
  for (const r of episodes) {
    // retoma vocabulário que o aluno já encontrou: itens que já existiam no Lucas ou de episódios anteriores
    const before = new Set([...Object.keys(FX.items), ...C.routines.slice(0, C.routines.indexOf(r)).flatMap((x) => x.items)]);
    assert.ok(r.items.filter((i) => before.has(i)).length >= 2, `${r.id} retoma pouco`);
  }
});

test('toda frase (Lucas e Karla) tem ao menos um item: frase sem item seria liberada logo na primeira sessão', () => {
  const K = JSON.parse(readFileSync(new URL('../../content/build/characters.json', import.meta.url))).characters.find((c) => c.id === 'karla').content;
  assert.deepEqual([...Object.values(C.sentences), ...Object.values(K.sentences)].filter((s) => !s.items.length).map((s) => s.id), []);
  // primeira sessão de um aluno novo: nada de episódio, só a R01 (como sempre)
  const q = buildSession(C, {}, { today: 300, size: 12, rand: () => 0.3 });
  assert.ok(q.every((e) => e.unit !== 'sent' || e.id.startsWith('R01-')), JSON.stringify(q.map((e) => e.k)));
});

test('motor intacto: exercícios gerados para todas as frases novas, respostas-modelo aceitas, sessão do episódio só com ele', () => {
  const ck = createChecker(C.language);
  for (const s of epSentences) {
    assert.ok(makeExercise(C, { k: cardKey('sent', s.id, 'ord'), unit: 'sent', id: s.id, skill: 'ord' }, () => 0.4), s.id);
    assert.equal(ck.check(s.en, [s.en]).cls, 'correct', s.id);
  }
  for (const q of Object.values(C.questions).filter((x) => x.source === 'new' && x.a)) assert.ok(ck.check(q.a, [q.a]).accepted, q.id);
  const q = buildSession(C, {}, { focus: { routine: 'R14' }, today: 300, size: 12, rand: () => 0.3 });
  assert.ok(q.length && q.every((e) => e.unit !== 'item' || C.items[e.id].routines.includes('R14')), JSON.stringify(q.map((e) => e.k)));
  // sessão padrão de quem começa: R01 primeiro, como sempre
  const d = buildSession(C, {}, { today: 300, size: 12, rand: () => 0.3 });
  assert.ok(d.filter((e) => e.unit === 'item').every((e) => C.items[e.id].routines.includes('R01')));
});

test('inglês britânico nos episódios; nada de conselho financeiro ou de saúde prescritivo', () => {
  const en = [...epSentences.map((s) => s.en), ...Object.values(C.questions).filter((q) => q.source === 'new').flatMap((q) => [q.q, q.a])].join(' \n ');
  assert.doesNotMatch(en, /\b(organize|realize|color|favorite|center|analyze|apologize|practice (my|your)|Mom|learned|vacation)\b/);
  assert.match(en, /\borganise\b/); assert.match(en, /\brealise\b/); assert.match(en, /\blearnt\b/); assert.match(en, /\bapologise\b/);
  assert.doesNotMatch(en, /\byou (should|must) (invest|buy|sell|eat|take)\b|\bguaranteed\b|\bburns? fat\b/i);
});
