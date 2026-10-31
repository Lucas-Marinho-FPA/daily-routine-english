// Auditoria pedagógica automatizada: fidelidade ao Word e coerência dos modelos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createChecker } from '../../app/js/engine/checker.js';
import { wordTokens } from '../../app/js/engine/text.js';

const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const word = JSON.parse(readFileSync(new URL('../../content/word/word-extract.json', import.meta.url)));
const checker = createChecker(content.language);

test('As 10 rotinas e os 34 parágrafos (EN e PT) são idênticos ao Word', () => {
  assert.equal(content.routines.filter((r) => r.kind === 'routine').length, 10, 'rotinas do Word (os episódios R11+ são conteúdo novo, à parte)');
  assert.deepEqual(content.routines.slice(0, 10).map((r) => r.id), word.routines.map((r) => r.id), 'as rotinas do Word continuam primeiro, na ordem original');
  let n = 0;
  for (const r of word.routines) {
    const app = content.routines.find((x) => x.id === r.id);
    assert.equal(app.title, r.title);
    assert.equal(app.goal, r.goal);
    r.en.forEach((p, i) => {
      const b = content.blocks[app.blocks[i]];
      assert.equal(b.en, p, `${b.id} EN`);
      assert.equal(b.pt, r.pt[i], `${b.id} PT`);
      assert.equal(b.sentences.map((s) => content.sentences[s].en).join(' '), p, `${b.id}: frases não reconstituem o parágrafo`);
      assert.equal(b.sentences.map((s) => content.sentences[s].pt).join(' '), r.pt[i], `${b.id}: traduções das frases não reconstituem o parágrafo`);
      n++;
    });
  }
  assert.equal(n, 34);
});

test('As 176 linhas das tabelas do Word estão representadas, com tradução e nota originais', () => {
  let rows = 0;
  const all = [...word.routines.flatMap((r) => [...r.vocab, ...r.phrasal]), ...word.toolkit.structures, ...word.toolkit.simplePresent, ...word.toolkit.phrasalReview];
  for (const row of all) {
    rows++;
    const it = Object.values(content.items).find((x) => x.srcRefs.some(Boolean) && (x.pt === row.pt || x.ptAlt.includes(row.pt)) && (x.notes.some((nt) => nt.text === row.note) || !row.note));
    assert.ok(it, `linha sem item: ${row.en} = ${row.pt}`);
  }
  assert.equal(rows, 176);
});

test('Perguntas e respostas-modelo do Word sem alteração (51)', () => {
  const qs = [...word.routines.flatMap((r) => r.questions), ...word.generalQuestions];
  assert.equal(qs.length, 51);
  for (const qa of qs) {
    const q = Object.values(content.questions).find((x) => x.q === qa.q && x.source === 'word');
    assert.ok(q, `pergunta ausente: ${qa.q}`);
    assert.equal(q.a, qa.a);
  }
});

test('Pontos de uso, drills e checklist preservados', () => {
  assert.equal(content.routines.filter((r) => r.kind === 'routine').reduce((n, r) => n + r.usage.length, 0), 22);
  assert.deepEqual(content.drills.map((d) => d.prompts), word.drills.map((d) => d.prompts));
  assert.deepEqual(content.checklist, word.checklist);
});

test('Todo conteúdo novo está marcado e as perguntas novas citam a origem dos fatos', () => {
  for (const it of Object.values(content.items)) assert.ok(['word', 'word-table-only', 'derived', 'new'].includes(it.source), it.id);
  for (const ex of Object.values(content.items).flatMap((it) => it.ex)) assert.ok(ex.src, 'exemplo sem origem');
  for (const q of Object.values(content.questions).filter((x) => x.source === 'new')) assert.ok(q.openPersonal || q.facts.length, `${q.id} sem fatos de origem`);
});

test('Nenhuma resposta-modelo é rejeitada pelo próprio corretor', () => {
  for (const s of Object.values(content.sentences)) assert.equal(checker.check(s.en, [s.en]).cls, 'correct', s.id);
  for (const it of Object.values(content.items)) {
    const t = it.en.replace(/…$/, '').trim();
    assert.ok(checker.check(t, [t, ...it.v]).accepted, it.id);
    for (const v of it.v) assert.ok(checker.check(v, [t, ...it.v]).accepted, `${it.id}: variante ${v}`);
  }
  for (const q of Object.values(content.questions).filter((x) => x.a)) {
    const cov = checker.coverage(q.a, { keywords: q.keywords, items: q.items.map((i) => content.items[i]) });
    assert.ok(cov.keywords.every((k) => k.ok), `${q.id}: o modelo não cobre as próprias palavras-chave ${JSON.stringify(cov.keywords.filter((k) => !k.ok))}`);
    assert.equal(cov.grammar.filter((g) => !g.soft).length, 0, `${q.id}: o modelo dispara regra de erro`);
  }
});

test('Grafia britânica nos textos-modelo (sem formas americanas mapeadas)', () => {
  const ame = Object.keys(content.language.spellingAmE).filter((k) => !k.startsWith('_'));
  const texts = [...Object.values(content.sentences).map((s) => s.en), ...Object.values(content.questions).map((q) => q.a)];
  for (const t of texts) {
    const toks = wordTokens(t);
    const bad = toks.filter((w) => ame.includes(w));
    assert.deepEqual(bad, [], `forma AmE em: ${t}`);
    toks.forEach((w, i) => { if (w === 'practice' && ['i', 'we', 'you', 'they', 'to'].includes(toks[i - 1])) assert.fail(`verbo AmE ‘practice’ em: ${t}`); });
  }
});

test('Todo áudio referenciado existe (ou está no índice)', () => {
  const idxPath = new URL('../../app/data/audio-index.js', import.meta.url);
  if (!existsSync(idxPath)) return;
  const idx = JSON.parse(readFileSync(idxPath, 'utf8').split('window.DRG_AUDIO = ')[1].replace(/;\s*$/, ''));
  const keys = [...Object.values(content.sentences).map((s) => s.au), ...Object.values(content.items).map((i) => i.au), ...Object.values(content.questions).flatMap((q) => [q.au, q.aau]).filter(Boolean)];
  const missing = keys.filter((k) => !(k in idx.files));
  assert.deepEqual(missing, []);
});
