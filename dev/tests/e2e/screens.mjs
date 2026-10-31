// Gera capturas de cada tipo de exercício (pergunta e feedback) para revisão visual.
// Uso: node tests/e2e/screens.mjs [pasta]
import { chromium } from 'playwright';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || join(ROOT, 'docs/evidence/screens');
mkdirSync(OUT, { recursive: true });
const content = JSON.parse(readFileSync(join(ROOT, 'content/build/content.json'), 'utf8'));
const srv = await serve(join(ROOT, 'app'), 8795);
const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'] });
const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ['microphone'] });
const p = await ctx.newPage();
await p.goto('http://localhost:8795/');
await p.waitForTimeout(500);
// estado avançado: cartões da R01 já em caixas altas para liberar todos os tipos
await p.evaluate(() => {
  const A = window.DRG_APP, c = A.content, st = A.state, t = A.today();
  const put = (k, box) => { st.cards[k] = { k, box, due: t, reps: 3, lapses: 0, streak: 1, last: t - 1, lastResult: 'good', created: t - 10 }; };
  const r = c.routines[0];
  r.items.forEach((i) => { put(`item:${i}:rec`, 2); put(`item:${i}:rcl`, 1); });
  r.blocks.forEach((bid) => c.blocks[bid].sentences.forEach((s) => put(`sent:${s}:ord`, 2)));
  r.blocks.slice(0, 3).forEach((bid) => put(`block:${bid}:seq`, 1));
  r.blocks.forEach((bid) => put(`block:${bid}:tell`, 1));
  st.welcomed = true;
  return A.flush();
});
const seen = new Set();
let n = 0;
for (let round = 0; round < 6 && seen.size < 11; round++) {
  await p.evaluate(() => window.DRG_APP.go('#/session?routine=R01'));
  await p.waitForTimeout(500);
  for (let i = 0; i < 40; i++) {
    const ex = await p.evaluate(() => { const e = window.DRG_APP.debugExercise; return e && { type: e.type, targets: e.targets, target: e.target, pieces: e.pieces, shuffled: e.shuffled, options: e.options, sentences: e.sentences && e.sentences.map((s) => s.en), verb: e.verb && e.verb.third }; });
    if (!ex || ex.type === 'summary') { if (!seen.has('summary')) { seen.add('summary'); await p.screenshot({ path: join(OUT, `${String(++n).padStart(2, '0')}-summary.png`) }); } break; }
    const first = !seen.has(ex.type);
    if (first) { seen.add(ex.type); await p.screenshot({ path: join(OUT, `${String(++n).padStart(2, '0')}-${ex.type}.png`) }); }
    const bar = p.locator('.actionbar');
    // respostas: às vezes erradas para mostrar o feedback de erro
    const wrong = first && ['recall', 'write', 'cloze'].includes(ex.type);
    if (ex.type === 'learn') { await bar.getByRole('button', { name: 'Próximo' }).click(); continue; }
    if (ex.type === 'mc') await p.locator('.options .option', { hasText: ex.options.find((o) => o.correct).pt }).first().click();
    else if (['recall', 'cloze', 'vb3'].includes(ex.type)) { await p.locator('.ex-area input').first().fill(wrong ? (ex.type === 'cloze' ? 'heat' : 'listen music') : (ex.target || ex.verb || ex.targets[0])); await bar.getByRole('button', { name: 'Verificar' }).click(); }
    else if (ex.type === 'write') { await p.locator('.ex-area textarea').fill(wrong ? ex.targets[0].replace(/\bthe\b/, '').replace(/s\b/, '') : ex.targets[0]); await bar.getByRole('button', { name: 'Verificar' }).click(); }
    else if (ex.type === 'order') { const used = new Set(); for (const piece of ex.pieces) { const k = ex.shuffled.findIndex((x, j) => x === piece && !used.has(j)); used.add(k); await p.locator('.tiles:not(.answer) .tile').nth(k).click(); } await bar.getByRole('button', { name: 'Verificar' }).click(); }
    else if (ex.type === 'seq') { for (const s of ex.sentences) await p.locator('.seq-item', { hasText: s.slice(0, 40) }).first().click(); await bar.getByRole('button', { name: 'Verificar' }).click(); }
    else if (ex.type === 'pairs') { const items = await p.evaluate(() => window.DRG_APP.debugExercise.items.map((x) => ({ en: x.en, pt: x.pt }))); for (const it of items) { await p.locator('.pairs .option.en', { hasText: it.en }).first().click(); await p.locator('.pairs .option:not(.en)', { hasText: it.pt }).first().click(); } }
    else if (['tell', 'retell', 'conv'].includes(ex.type)) {
      await p.locator('.ex-area textarea').fill('I wake up at five, take a shower and brush my teeth. Then I have a chicken sandwich and play chess.');
      await bar.getByRole('button', { name: 'Ver modelo e avaliar' }).click();
      await p.waitForTimeout(300);
      if (first) await p.screenshot({ path: join(OUT, `${String(++n).padStart(2, '0')}-${ex.type}-feedback.png`), fullPage: false });
      await p.getByRole('button', { name: 'Consegui', exact: true }).click();
      continue;
    }
    await p.waitForTimeout(250);
    if (first) await p.screenshot({ path: join(OUT, `${String(++n).padStart(2, '0')}-${ex.type}-feedback.png`) });
    await bar.getByRole('button', { name: 'Continuar' }).click();
  }
}
console.log('tipos capturados:', [...seen].join(', '));
await b.close(); srv.close();
