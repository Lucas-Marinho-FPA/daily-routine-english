// Verificação funcional do app PUBLICADO (GitHub Pages), depois de uma publicação.
// Uso: node tests/e2e/live-check.mjs <url-do-app> <versão-esperada-do-sw> [pasta-de-evidências]
//
// REAL: site publicado, service worker e cache offline do navegador, conteúdo e áudio servidos pelo Pages.
// SIMULADO: o progresso das fases 1–3 de um diálogo curto é gravado direto no IndexedDB deste navegador de teste
// (atalho para chegar às fases 4 e 5 sem gravar voz; as fases 1–3 são cobertas por tests/e2e/dialogue.mjs).
// Não altera nada no servidor.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const URL0 = process.argv[2] || 'https://lucas-marinho-fpa.github.io/daily-routine-english/';
const WANT = process.argv[3];
const OUT = resolve(process.argv[4] || 'evidence/live');
mkdirSync(OUT, { recursive: true });
const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); await page.screenshot({ path: join(OUT, `${id}-falha.png`), fullPage: true }).catch(() => {}); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = ctx.pages()[0] || await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const go = async (hash) => { await page.goto(URL0 + hash); await page.waitForTimeout(500); };

await check('L01', 'Versão publicada: service worker esperado, controlando a página, pré-cache completo', async () => {
  await page.goto(URL0);
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 120000 }).catch(() => null);
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 120000 });
  const sw = await (await page.request.get(URL0 + 'sw.js')).text();
  const v = (sw.match(/const VERSION = '([^']+)'/) || [])[1];
  assert(!WANT || v === WANT, `versão servida ${v}, esperada ${WANT}`);
  await page.waitForFunction(async () => { const ks = await caches.keys(); for (const k of ks) { const c = await caches.open(k); if (await c.match(new Request('data/dialogues.js', { cache: 'no-store' }), { ignoreSearch: true })) return true; } return false; }, null, { timeout: 180000 });
  return `sw ${v}`;
});

await check('L02', 'Conteúdo publicado: 46 diálogos em 7 partes, 403 questões, correções aplicadas, áudio de todas as falas', async () => {
  await page.evaluate(async () => { const A = window.DRG_APP; A.state.settings.characterChosen = true; A.state.welcomed = true; await A.flush(); });
  const info = await page.evaluate(() => {
    const d = window.DRG_DIALOGUES; const files = (window.DRG_AUDIO || {}).files || {};
    const lines = d.activities.flatMap((a) => a.lines);
    return { acts: d.activities.length, parts: d.parts.length, q: d.questions.length, noAudio: lines.filter((l) => !(l.audio in files)).length,
      minQ: Math.min(...d.activities.map((a) => a.questionIds.length)), train: lines.filter((l) => /8\.40/.test(l.en)).length,
      corrected: lines.filter((l) => l.correction).length, endpoint: d.evaluation.endpoint };
  });
  assert(info.acts === 46 && info.parts === 7 && info.q === 403 && info.noAudio === 0 && info.minQ >= 3 && info.train === 0 && info.corrected === 6, JSON.stringify(info));
  await go('#/dialogues');
  await page.waitForSelector('[data-role=dialogue]');
  assert(await page.locator('[data-role=dialogue]').count() === 46, 'lista');
  const r = await page.evaluate(async () => { const a = new Audio('audio/' + window.DRG_DIALOGUES.activities[0].lines[0].audio + '.ogg'); try { await a.play(); await new Promise((ok, ko) => { a.onended = ok; a.onerror = ko; }); return 'tocou'; } catch (e) { return 'falhou'; } });
  assert(r === 'tocou', `áudio: ${r}`);
  return info;
});

await check('L03', 'Fases 4 e 5 publicadas: diálogo curto com rodada reduzida (corte proporcional) e leitura disponível antes da compreensão', async () => {
  const SHORT = 'john-p2-x02';
  await page.evaluate(async (id) => {
    const sa = window.DRG_DIALOGUES.activities.find((a) => a.id === id);
    const db = await new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => res(r.result); });
    const get = () => new Promise((res) => { const t = db.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result); });
    const st = (await get()) || { v: 1, acts: {}, consent: { online: false, at: null } };
    const attempts = {}; let n = 0;
    const add = (phase, itemId) => { const k = `syn-${n++}`; attempts[k] = { attemptId: k, phase, itemId, status: 'passed', score: 100, threshold: 80, evaluationMode: 'teste', createdAt: n, evaluatedAt: n }; };
    sa.itemIds.forEach((x) => add('vocab', x));
    for (const ph of ['dictation', 'translation']) sa.lines.forEach((l) => add(ph, l.id));
    st.acts[id] = { contentVersion: null, startedAt: 1, completedAt: null, attempts, listens: {}, rounds: [], notes: '', order: {} };
    await new Promise((res) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(st, 'dialogues'); t.oncomplete = res; });
  }, SHORT);
  await page.reload(); await page.waitForTimeout(500);
  await go(`#/dialogue/${SHORT}`);
  await page.waitForSelector('[data-role=phases]');
  const states = await page.$$eval('[data-role=phase]', (els) => els.map((e) => e.dataset.state));
  assert(states[3] === 'available' && states[4] === 'available', `fases: ${states}`);
  const label = await page.locator('[data-phase=listening]').textContent();
  assert(label.includes('3 questões · aprovação com 3/3'), label);
  await go(`#/dphase/${SHORT}?p=listening`);
  for (let k = 1; k <= 3; k++) {
    await page.click('[data-role=play-dialogue]');
    await page.waitForFunction((n) => document.querySelector('[data-role=listen-count]')?.textContent.includes(`${n}/3`), k, { timeout: 60000 });
  }
  await page.waitForSelector('[data-role=questions][data-kind=full]');
  const qs = await page.$$eval('[data-role=questions] [data-question]', (els) => els.map((e) => e.dataset.question));
  for (let i = 0; i < qs.length; i++) await page.click(`[data-role=questions] [data-question="${qs[i]}"] [data-option="${i < 2 ? 'a' : 'b'}"]`);
  await page.click('[data-role=submit-round]');
  await page.waitForSelector('[data-role=round-result][data-passed=false]');
  await page.click('[data-role=round-result] [data-role=continue]');
  await page.waitForSelector('[data-role=questions][data-kind=recovery]');
  assert(await page.locator('[data-role=questions] [data-question]').count() === 1, 'recuperação só da errada');
  await page.click('[data-role=questions] [data-option="a"]');
  await page.click('[data-role=submit-round]');
  await page.waitForSelector('[data-role=round-result][data-passed=true]');
  await go(`#/dphase/${SHORT}?p=reading`);
  await page.waitForSelector('[data-role=reading-card]');
  assert(await page.locator('[data-role=record-line]').count() === 1, 'leitura em voz alta disponível');
  await page.screenshot({ path: join(OUT, 'L03-leitura.png'), fullPage: true });
  return `fases 4/5 disponíveis; rodada ${qs.length} questões → aprovada após recuperação`;
});

await check('L04', 'PWA offline: com a rede cortada, o app publicado abre os diálogos e toca o áudio do cache', async () => {
  await ctx.setOffline(true);
  await page.goto(URL0 + '#/dialogue/john-p7-e01').catch(() => {});
  await page.waitForSelector('[data-role=dialogue-screen]', { timeout: 20000 });
  const r = await page.evaluate(async () => { const a = new Audio('audio/' + window.DRG_DIALOGUES.activities.find((x) => x.id === 'john-p7-e01').lines[4].audio + '.ogg'); try { await a.play(); await new Promise((ok, ko) => { a.onended = ok; a.onerror = ko; }); return 'tocou'; } catch (e) { return 'falhou'; } });
  await ctx.setOffline(false);
  assert(r === 'tocou', `offline: ${r}`);
  return 'offline ok (fala corrigida do trem das 8.20)';
});

record('L05', 'Sem erros de página', !errors.length, errors.slice(0, 5));
await ctx.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
