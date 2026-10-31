// Jornada Conversation Practice (CP01–CP02): conteúdo original do app (nada do livro), quatro habilidades, correção, transferência,
// revisão cumulativa, progresso próprio e os dois exercícios novos (ouvir e responder; ler e responder).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { setLexicon } from '../../app/js/engine/lexicon.js';
import { createChecker } from '../../app/js/engine/checker.js';
import { makeExercise } from '../../app/js/engine/exercises.js';
import { buildSession, cardKey, cardInContent, unlockedNew } from '../../app/js/engine/scheduler.js';
import { recordAnswer, freshState, migrate } from '../../app/js/engine/progress.js';
import { journeyView, journeyById, unitStatus } from '../../app/js/engine/journeys.js';
import { contentFor } from '../../app/js/engine/characters.js';
import { frameRefs, findSlotSuspicions, findOddCombinations, findHoles, findContradictions } from '../../app/js/engine/coherence.js';
import { bookOverlap } from '../../tools/build-journeys.mjs';

setLexicon(gunzipSync(readFileSync(new URL('../../app/data/lexicon.txt.gz', import.meta.url))).toString('utf8').split('\n'));
const base = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const REG = JSON.parse(readFileSync(new URL('../../content/build/journeys.json', import.meta.url)));
const CHARS = JSON.parse(readFileSync(new URL('../../content/build/characters.json', import.meta.url)));
// referência local do livro (fora do repositório): sem ela, a comparação de reprodução é pulada
const BOOK_URL = new URL('../fixtures/conversation-book-01-02.json', import.meta.url);
const BOOK = existsSync(BOOK_URL) ? JSON.parse(readFileSync(BOOK_URL)) : null;
const cp = journeyView(base, 'cp', REG);
const karla = contentFor(base, 'karla', CHARS);
const S = Object.values(cp.sentences);
const ck = createChecker(cp.language);
const ent = (unit, id, skill) => ({ k: cardKey(unit, id, skill), unit, id, skill });

test('direitos: nada do Conversation Book no conteúdo publicável (sequências de 6 palavras, nomes, notas); nada “original” sem licença', () => {
  assert.equal(REG.journeys[0].content && REG.journeys.length, 1);
  const src = JSON.parse(readFileSync(new URL('../../content/journeys/cp.json', import.meta.url)));
  assert.equal(src.license, null);
  const all = [...S, ...Object.values(cp.blocks), ...Object.values(cp.items)].map((x) => x.provenance);
  assert.ok(all.every((p) => p === 'new'), 'só conteúdo novo do app');
  assert.ok(Object.values(cp.items).every((it) => !it.notes.length), 'nenhuma nota do glossário');
  const texts = [...S.flatMap((s) => [s.en, s.pt]), ...Object.values(cp.questions).flatMap((q) => [q.q, q.a, q.hint]),
    ...[...Object.values(cp.listening), ...Object.values(cp.reading)].flatMap((x) => [x.q, x.explain, ...x.options]),
    ...Object.values(cp.items).flatMap((it) => [it.en, it.pt, it.tip]), ...cp.routines.flatMap((r) => [r.title, r.goal, r.grammar, ...r.usage]),
    ...Object.values(cp.blocks).map((b) => b.title)].filter(Boolean);
  if (BOOK) {
    assert.deepEqual(bookOverlap(texts, BOOK), []);
    // a própria checagem detecta reprodução (controle positivo com uma fala do livro)
    assert.ok(bookOverlap([BOOK.CP02.lines[3].en], BOOK).length > 0);
  }
  // o arquivo publicado também: nada do livro, nada identificador (o cabeçalho do livro traz o nome da escola)
  const published = readFileSync(new URL('../../app/data/journeys.js', import.meta.url), 'utf8');
  assert.doesNotMatch(published, new RegExp(Buffer.from('XGIoRUFDfHBlcnNvbm5hbGl0XHcqfGl0YVt1w7pdfGxhc3Ryb3xUb2RkfFNhbiBEaWVnb3xMYXVyZW4pXGI=', 'base64').toString('utf8'), 'i') /* nomes privados e do livro (codificados) */);
});

test('atribuição: toda frase, bloco, item e atividade marcados como conteúdo do app; o livro só orienta os objetivos', () => {
  for (const x of [...Object.values(cp.questions), ...Object.values(cp.listening), ...Object.values(cp.reading)]) assert.equal(x.provenance, 'new', x.id);
  assert.match(REG.journeys[0].source.topicsAlignedWith, /só os objetivos/);
  assert.deepEqual(cp.routines.map((r) => r.title), ['First Steps: Meeting People', 'What I Think: Likes and Opinions']);
});

test('inglês britânico em todo o texto; notas de variante explicam o americano; o corretor aceita as duas grafias', () => {
  const en = [...S.map((s) => s.en), ...Object.values(cp.questions).flatMap((q) => [q.q, q.a])].join(' ');
  assert.doesNotMatch(en, /\b(color|favorite|apartment|movie|takeout|on the weekend|organize|realize)\b/i);
  for (const w of ['favourite', 'film', 'takeaway', 'flatmate', 'Brilliant', 'at the weekend', 'fancy']) assert.match(en, new RegExp(`\\b${w}\\b`), w);
  assert.ok(cp.routines.every((r) => r.usage.some((u) => /Variante/.test(u))));
  const fav = cp.sentences['CP02-B1-S3'].en;
  assert.ok(ck.check(fav.replace('favourite', 'favorite'), [fav]).accepted, 'favorite aceito');
});

test('quatro habilidades por unidade: listening, reading, writing, speaking e transferência', () => {
  for (const r of cp.routines) {
    assert.ok(r.listening.length >= 4 && r.reading.length >= 4, `${r.id}: ouvir/ler`);
    const qs = r.questions.map((q) => cp.questions[q]);
    assert.ok(qs.filter((q) => q.kind === 'conv').length >= 2, `${r.id}: fala/escrita com modelo`);
    assert.ok(qs.some((q) => q.kind === 'comp'), `${r.id}: compreensão aberta`);
    assert.ok(qs.some((q) => q.kind === 'transfer' && q.openPersonal && q.hint && q.a === ''), `${r.id}: transferência`);
    // writing: completar a expressão na frase (cloze) para as collocations/phrasals da unidade
    const cloze = r.items.map((i) => cp.items[i]).filter((it) => ['collocation', 'phrasal', 'time'].includes(it.c));
    assert.ok(cloze.length >= 4, `${r.id}: poucas expressões para completar`);
    for (const it of cloze) { const ex = makeExercise(cp, ent('item', it.id, 'bld'), () => 0.2); assert.equal(ex.type, 'cloze', it.id); assert.ok(ex.sentence.en.includes(ex.target), it.id); }
    for (const sid of r.blocks.flatMap((b) => cp.blocks[b].sentences)) {
      assert.equal(makeExercise(cp, ent('sent', sid, 'ord'), () => 0.4).type, 'order', sid);
      assert.equal(makeExercise(cp, ent('sent', sid, 'wrt'), () => 0.4).type, 'write', sid);
    }
  }
});

test('ouvir e responder: trecho em áudio sem texto na pergunta; uma única opção correta; itens ligados', () => {
  for (const l of Object.values(cp.listening)) {
    const ex = makeExercise(cp, ent('lq', l.id, 'lis'), () => 0.3);
    assert.equal(ex.type, 'listen');
    assert.ok(ex.clips.length && ex.clips.every((c) => c.key && c.text && c.sid.startsWith(l.routine)), l.id);
    assert.equal(ex.options.filter((o) => o.correct).length, 1);
    assert.equal(ex.options.find((o) => o.correct).text, l.options[l.answer]);
    // a pergunta não entrega a resposta: o texto da resposta certa não está na pergunta
    assert.ok(!l.q.toLowerCase().includes(l.options[l.answer].toLowerCase().replace(/\.$/, '')), l.id);
    assert.ok(l.items.every((i) => cp.items[i]) && l.explain);
  }
});

test('ler e responder: passagem com a fala de referência destacada; uma única opção correta', () => {
  for (const x of Object.values(cp.reading)) {
    const ex = makeExercise(cp, ent('rq', x.id, 'rdq'), () => 0.7);
    assert.equal(ex.type, 'read');
    assert.equal(ex.passage.filter((p) => p.focus).length, 1);
    assert.equal(ex.passage.find((p) => p.focus).id, x.sentence);
    assert.equal(ex.options.filter((o) => o.correct).length, 1);
  }
});

test('correção: modelos aceitos; grafia britânica aceita nas falas americanas; palavra errada não passa', () => {
  for (const s of S) assert.equal(ck.check(s.en, [s.en]).cls, 'correct', s.id);
  for (const q of Object.values(cp.questions).filter((x) => x.a)) assert.ok(ck.check(q.a, [q.a]).accepted, q.id);
  const fav = cp.sentences['CP02-B1-S3'].en;
  assert.ok(ck.check(fav.replace('favourite', 'favorite'), [fav]).accepted, 'favorite');
  const fl = cp.sentences['CP01-B1-S4'].en;
  assert.ok(ck.check(fl.replace("I've been living", 'I have been living'), [fl]).accepted, 'forma por extenso');
  assert.equal(ck.check("I'm from Leeds, but I've been living in London for a couple of years.", [cp.sentences['CP01-B1-S4'].en]).accepted, false, 'cidade trocada não passa');
  // respostas abertas: palavras-chave com alternativas (I'm / my name)
  const cov = ck.coverage('Hello, my name is Ana. Glad to meet you!', { keywords: cp.questions['CP.Q1'].keywords, items: [] });
  assert.ok(cov.keywords.every((k) => k.ok), JSON.stringify(cov.keywords));
});

test('revisão cumulativa e transferência: CP02 retoma CP01; pergunta de revisão aponta a unidade anterior', () => {
  const cp1 = new Set(cp.routines[0].items), cp2 = cp.routines[1].items;
  const reused = cp2.filter((i) => cp1.has(i));
  assert.ok(reused.length >= 5, reused.join(', '));
  for (const id of ['cp.actually', 'cp.a-couple-of', 'cp.shall-we', 'cp.let-me-know', 'cp.that-sounds-great', 'cp.brilliant']) assert.ok(reused.includes(id), id);
  const rev = Object.values(cp.questions).filter((q) => q.kind === 'review');
  assert.equal(rev.length, 1);
  assert.deepEqual(rev[0].reviews, ['CP01']);
  assert.ok(rev[0].items.some((i) => cp1.has(i)) && rev[0].items.some((i) => !cp1.has(i)), 'mistura CP01 e CP02');
  // o diálogo “Na prática” reaproveita expressões do diálogo principal em outra situação (transferência guiada)
  for (const r of cp.routines) {
    const main = new Set(cp.blocks[r.blocks[0]].sentences.flatMap((s) => cp.sentences[s].items));
    const prac = cp.blocks[r.blocks[1]].sentences.flatMap((s) => cp.sentences[s].items);
    assert.ok(prac.filter((i) => main.has(i)).length >= 3, r.id);
  }
});

test('progresso e domínio próprios: itens só da jornada; cartões de Lucas/Karla não contam; nada da jornada entra nas rotinas', () => {
  assert.ok(Object.keys(cp.items).every((id) => id.startsWith('cp.')));
  assert.ok(Object.keys(cp.sentences).every((id) => id.startsWith('CP')));
  for (const it of Object.values(cp.items)) for (const rel of it.relatedTo) assert.ok(base.items[rel] || karla.items[rel], rel);
  const st = freshState(base.version);
  // o aluno já domina “at the weekend”, “I prefer to…” e “agree with” (Lucas): na jornada, os itens equivalentes continuam novos
  for (const k of ['item:it.at-the-weekend:rec', 'item:it.i-prefer-to:rec', 'item:it.agree-with:rec']) for (let i = 0; i < 4; i++) recordAnswer(st, k, 'good', { today: 100 + i * 10 });
  assert.ok(!cardInContent(cp, 'item:it.at-the-weekend:rec') && !cardInContent(base, 'item:cp.at-the-weekend:rec'));
  const fresh = unlockedNew(cp, st.cards, {}).filter((f) => f.isNewItem).map((f) => f.id);
  for (const id of ['cp.at-the-weekend', 'cp.prefer', 'cp.i-agree']) assert.ok(fresh.includes(id), `${id} não pode vir como já dominado`);
  // sessões das rotinas nunca trazem ouvir/ler nem itens da jornada
  for (const content of [base, karla]) {
    const q = buildSession(content, st.cards, { today: 300, size: 20, rand: () => 0.3 });
    assert.ok(q.every((e) => !['lq', 'rq'].includes(e.unit) && !String(e.id).startsWith('cp.') && !String(e.id).startsWith('CP')), JSON.stringify(q.map((e) => e.k)));
    assert.equal(cardInContent(content, 'lq:CP.L1:lis'), false);
  }
  // escolha da jornada guardada nos ajustes; estado antigo sem a chave → rotinas; valor inválido não quebra
  assert.equal(freshState(base.version).settings.journey, null);
  const old = freshState(base.version); delete old.settings.journey;
  assert.equal(migrate(JSON.parse(JSON.stringify(old)), base.version).settings.journey, null);
  assert.equal(journeyById('xyz', REG), null);
});

test('desbloqueio: ouvir abre quando a unidade começa; ler, depois de ouvir; transferência entra na sessão da unidade', () => {
  const st = freshState(base.version);
  const first = buildSession(cp, st.cards, { today: 300, size: 12, rand: () => 0.3 });
  assert.ok(first.filter((e) => e.unit === 'item').every((e) => cp.routines[0].items.includes(e.id)), 'começa pelo CP01');
  assert.ok(!first.some((e) => e.unit === 'lq' || e.unit === 'rq'), 'nada antes de começar a unidade');
  recordAnswer(st, 'item:cp.i-dont-think-weve-met:rec', 'good', { today: 300 });
  let open = unlockedNew(cp, st.cards, { routine: 'CP01' });
  assert.ok(open.some((e) => e.unit === 'lq') && !open.some((e) => e.unit === 'rq'), 'ouvir sim, ler ainda não');
  recordAnswer(st, 'lq:CP.L1:lis', 'good', { today: 300 });
  open = unlockedNew(cp, st.cards, { routine: 'CP01' });
  assert.ok(open.some((e) => e.unit === 'rq'), 'ler depois de ouvir');
  assert.ok(open.some((e) => e.unit === 'q' && cp.questions[e.id].kind === 'transfer'), 'transferência na sessão da unidade');
  // XP: regra existente (valor padrão de habilidade), sem regra nova
  const r = recordAnswer(freshState(base.version), 'rq:CP.R1:rdq', 'good', { today: 1 });
  assert.equal(r.xp, 6);
});

test('conclusão da unidade por habilidade, calculada dos cartões', () => {
  const st = freshState(base.version);
  const r = cp.routines[0];
  assert.equal(unitStatus(cp, 'CP01', st.cards).complete, false);
  r.listening.forEach((id) => recordAnswer(st, `lq:${id}:lis`, 'good', { today: 5 }));
  r.reading.forEach((id) => recordAnswer(st, `rq:${id}:rdq`, 'good', { today: 5 }));
  r.questions.filter((q) => cp.questions[q].kind !== 'transfer').forEach((q) => recordAnswer(st, `q:${q}:conv`, 'ok', { today: 5 }));
  assert.equal(unitStatus(cp, 'CP01', st.cards).complete, false, 'falta escrever e transferir');
  const sents = r.blocks.flatMap((b) => cp.blocks[b].sentences);
  sents.slice(0, Math.ceil(sents.length / 2)).forEach((s) => recordAnswer(st, `sent:${s}:ord`, 'good', { today: 5 }));
  assert.equal(unitStatus(cp, 'CP01', st.cards).complete, false, 'falta transferir');
  recordAnswer(st, `q:${r.questions.find((q) => cp.questions[q].kind === 'transfer')}:conv`, 'ok', { today: 5 });
  const s = unitStatus(cp, 'CP01', st.cards);
  assert.equal(s.complete, true, JSON.stringify(s.skills));
  // ouvir errado não conta como domínio
  const st2 = freshState(base.version);
  recordAnswer(st2, 'lq:CP.L1:lis', 'bad', { today: 5 });
  assert.equal(unitStatus(cp, 'CP01', st2.cards).skills.listening.done, 0);
  assert.equal(unitStatus(cp, 'CP02', st.cards).complete, false, 'CP02 independente');
});

test('áudio britânico offline: falas com voz do personagem (chave própria), itens e perguntas com áudio no índice', () => {
  const man = JSON.parse(readFileSync(new URL('../../content/build/journeys-audio-manifest.json', import.meta.url)));
  const byKey = new Map(man.map((m) => [m.key, m]));
  const voiceOf = (sp) => byKey.get(S.find((s) => s.speaker === sp).au).voice;
  assert.deepEqual(['Priya', 'Daniel', 'Ruth', 'Omar', 'Beth'].map(voiceOf), ['bf_isabella', 'bm_lewis', 'bf_lily', 'bm_george', 'bf_isabella']);
  assert.ok(man.every((m) => /^b[fm]_/.test(m.voice)), 'só vozes britânicas');
  const lucasKeys = new Set(JSON.parse(readFileSync(new URL('../../content/build/audio-manifest.json', import.meta.url))).map((m) => m.key));
  assert.ok(S.every((s) => !lucasKeys.has(s.au)), 'falas da jornada não reaproveitam (nem sobrescrevem) áudio do Lucas');
  const idx = readFileSync(new URL('../../app/data/audio-index.js', import.meta.url), 'utf8');
  const files = JSON.parse(idx.slice(idx.indexOf('{'), idx.lastIndexOf('}') + 1)).files;
  const need = [...S.map((s) => s.au), ...Object.values(cp.items).map((i) => i.au), ...Object.values(cp.questions).flatMap((q) => [q.au, q.aau]).filter(Boolean)];
  const missing = need.filter((k) => !files[k] || !existsSync(new URL(`../../app/audio/${k}.ogg`, import.meta.url)));
  assert.deepEqual(missing, []);
});

test('avaliação oral sem falsos alarmes no conteúdo da jornada (molduras da própria jornada)', () => {
  const frames = frameRefs(cp);
  const texts = [...S.map((s) => s.en), ...Object.values(cp.questions).map((q) => q.a).filter(Boolean)];
  const fp = texts.filter((t) => findSlotSuspicions(t, frames).length || findOddCombinations(t).length || findHoles(t).length || findContradictions(t).length);
  // exceção conhecida, documentada (docs/conversation-practice.md): a checagem de “buraco” do motor compartilhado marca a
  // preposição no fim de pergunta (“Where are you from? And…”). É estrutura-alvo do tema; a correção proposta no motor
  // depende de autorização, por isso a resposta-modelo não foi alterada para esconder o problema.
  assert.deepEqual(fp, [cp.questions['CP.Q3'].a]);
  assert.deepEqual(findHoles(cp.questions['CP.Q3'].a).map((x) => x.after), ['from']);
});
