// Avatares oficiais dos personagens (Lucas, Lukinhas, Heitor) no app — mesmo padrão para os três.
// Uso: node tests/e2e/avatars.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
//
// REAL: app construído, Chromium em viewport de celular, service worker e cache offline, arquivos PNG servidos.
// Verifica: carga de cada imagem; proporção natural (sem distorção) e sem recorte; exibição no bloco do personagem do
// Início (personagem ativo) e na escolha de personagem; Karla sem imagem; transparência real (pixel do canto com
// alfa 0, decodificado no navegador); sem rolagem horizontal em 360/412/430 px; exibição offline com o servidor desligado.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = resolve(process.argv[4] || join(ROOT, 'evidence/avatars'));
mkdirSync(OUT, { recursive: true });
const PORT = 8823, BASE = `http://localhost:${PORT}${BASE_PATH}`;
const AVATARS = { lucas: [1132, 1390], 'lucas-kid': [1312, 1199], heitor: [1312, 1199] };

const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

let server = await serve(SITE, PORT);
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
const page = ctx.pages()[0] || await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const go = async (hash) => { await page.goto(BASE + hash); await page.reload(); await page.waitForTimeout(500); };
const choose = (id) => page.evaluate(async (x) => { const A = window.DRG_APP; A.state.welcomed = true; await A.chooseCharacter(x); }, id);
/** Medidas da imagem do personagem num contêiner: carregada, natural × exibida, recorte e posição. */
const measure = (sel) => page.evaluate((s) => {
  const img = document.querySelector(s);
  if (!img) return null;
  const r = img.getBoundingClientRect(), cs = getComputedStyle(img), box = img.closest('.persona, .char-choice').getBoundingClientRect();
  return { src: img.getAttribute('src'), done: img.complete, nw: img.naturalWidth, nh: img.naturalHeight, w: r.width, h: r.height, fit: cs.objectFit, radius: cs.borderRadius,
    inside: r.left >= box.left - 12 && r.right <= box.right + 12, vw: innerWidth, sw: document.documentElement.scrollWidth };
}, sel);
const aspectOk = (m, [w, h]) => m && m.nw === w && m.nh === h && Math.abs(m.w / m.h - w / h) < 0.02;

await page.goto(BASE);
await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 120000 }).catch(() => null);
await page.reload();
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 120000 });

await check('A01', 'Escolha de personagem: Lucas, Lukinhas e Heitor com o avatar oficial (proporção natural); Karla só pelo nome', async () => {
  await go('#/');
  await page.waitForSelector('[data-role=character-pick]');
  const out = {};
  for (const id of Object.keys(AVATARS)) {
    const m = await measure(`[data-role=character-pick] [data-character="${id}"] img`);
    assert(m && m.done && aspectOk(m, AVATARS[id]), `${id}: ${JSON.stringify(m)}`);
    assert(m.h > 60 && m.h < 70 && m.fit === 'contain' && m.radius === '0px', `${id}: tamanho/recorte ${JSON.stringify(m)}`);
    out[id] = `${Math.round(m.w)}×${Math.round(m.h)}`;
  }
  assert(await page.locator('[data-role=character-pick] [data-character=karla] img').count() === 0, 'Karla com imagem');
  await page.screenshot({ path: join(OUT, 'A01-escolha.png'), fullPage: true });
  return out;
});

for (const [n, id] of [['A02', 'lucas'], ['A03', 'lucas-kid'], ['A04', 'heitor']]) {
  await check(n, `Início com ${id} ativo: avatar no bloco do personagem, carregado, sem distorção nem recorte, dentro do bloco`, async () => {
    await choose(id);
    await go('#/');
    await page.waitForSelector('[data-role=persona] img.char-illus');
    const m = await measure('[data-role=persona] img.char-illus');
    assert(m.src === `assets/characters/${id}/${id}-avatar.png`, m.src);
    assert(m.done && aspectOk(m, AVATARS[id]) && m.fit === 'contain' && m.radius === '0px' && m.inside, JSON.stringify(m));
    assert(m.sw <= m.vw, `rolagem horizontal ${m.sw} > ${m.vw}`);
    assert((await page.getAttribute('[data-role=persona]', 'data-character')) === id, 'bloco de outro personagem');
    await page.screenshot({ path: join(OUT, `${n}-inicio-${id}.png`) });
    return `${Math.round(m.w)}×${Math.round(m.h)} (natural ${m.nw}×${m.nh})`;
  });
}

await check('A05', 'Karla ativa: marcador com a inicial, sem imagem genérica', async () => {
  await choose('karla');
  await go('#/');
  assert(await page.locator('[data-role=persona] img').count() === 0, 'Karla com imagem');
  assert(await page.locator('[data-role=persona] .char-ph').count() === 1, 'marcador ausente');
});

await check('A06', 'Transparência real: cantos dos três PNGs com alfa 0 e o personagem opaco, decodificados no navegador', async () => {
  const r = await page.evaluate(async (ids) => {
    const out = {};
    for (const id of ids) {
      const bmp = await createImageBitmap(await (await fetch(`assets/characters/${id}/${id}-avatar.png`)).blob());
      const c = new OffscreenCanvas(bmp.width, bmp.height); const g = c.getContext('2d'); g.drawImage(bmp, 0, 0);
      const px = (x, y) => g.getImageData(x, y, 1, 1).data[3];
      out[id] = { corner: [px(0, 0), px(bmp.width - 1, 0)], center: px(Math.floor(bmp.width / 2), Math.floor(bmp.height * 0.6)) };
    }
    return out;
  }, Object.keys(AVATARS));
  for (const [id, v] of Object.entries(r)) assert(v.corner.every((a) => a === 0) && v.center >= 250, `${id}: ${JSON.stringify(v)}`);
  return r;
});

await check('A07', 'Telas de 360, 412 e 430 px: Início sem rolagem horizontal e avatar dentro do bloco (Lucas, Lukinhas, Heitor)', async () => {
  const bad = [];
  for (const id of Object.keys(AVATARS)) {
    await choose(id);
    for (const w of [360, 412, 430]) {
      await page.setViewportSize({ width: w, height: 900 });
      await go('#/');
      const m = await measure('[data-role=persona] img.char-illus');
      if (!m || !m.inside || m.sw > m.vw || !aspectOk(m, AVATARS[id])) bad.push(`${id}@${w}:${JSON.stringify(m)}`);
    }
  }
  await page.setViewportSize({ width: 412, height: 915 });
  assert(!bad.length, bad.join(' | '));
  return '9 combinações ok';
});

await check('A08', 'Offline: com o servidor desligado e a rede cortada, os três avatares carregam do cache', async () => {
  await page.waitForFunction(async () => { const ks = await caches.keys(); return ks.some((k) => k.startsWith('drgshell')); }, null, { timeout: 120000 });
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  const out = {};
  for (const id of Object.keys(AVATARS)) {
    await choose(id);
    await page.goto(BASE + '#/').catch(() => {});
    await page.reload().catch(() => {}); // recarga servida pelo service worker (sem rede)
    await page.waitForSelector(`[data-role=persona][data-character="${id}"] img.char-illus`, { timeout: 20000 });
    const m = await measure('[data-role=persona] img.char-illus');
    assert(m.done && m.nw === AVATARS[id][0], `${id} offline: ${JSON.stringify(m)}`);
    out[id] = 'ok';
  }
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  return out;
});

record('A09', 'Sem erros de página', !errors.length, errors.slice(0, 5));
await ctx.close();
server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
