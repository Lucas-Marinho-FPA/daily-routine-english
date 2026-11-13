// Tema azul padrão + alternância sol/lua no cabeçalho + tema claro opcional.
// Uso: node tests/e2e/theme.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
//
// REAL: app construído, Chromium em viewport de celular, IndexedDB, service worker e cache offline.
// SIMULADO: o modo claro/escuro do sistema (emulateMedia colorScheme) e um estado “antigo” com theme: 'auto'
// gravado direto no IndexedDB (como ficou nos aparelhos que já usavam o app).
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = resolve(process.argv[4] || join(ROOT, 'evidence/theme'));
mkdirSync(OUT, { recursive: true });
const PORT = 8824, BASE = `http://localhost:${PORT}${BASE_PATH}`;
const DARK_BG = 'rgb(4, 20, 43)', LIGHT_BG = 'rgb(241, 240, 251)';

const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

let server = await serve(SITE, PORT);
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });
const open = () => chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, colorScheme: 'light' });
let ctx = await open();
let page = ctx.pages()[0] || await ctx.newPage();
const errors = [];
const watch = (p) => p.on('pageerror', (e) => errors.push(e.message));
watch(page);
const go = async (hash) => { await page.goto(BASE + hash); await page.reload(); await page.waitForSelector('#app > *'); await page.waitForTimeout(400); };
const look = () => page.evaluate(() => {
  const cs = (q, p = 'backgroundColor') => { const e = document.querySelector(q); return e ? getComputedStyle(e)[p] : null; };
  return { attr: document.documentElement.getAttribute('data-theme'), bg: getComputedStyle(document.body).backgroundColor, ink: getComputedStyle(document.body).color,
    hero: cs('[data-role=persona]'), card: cs('.view .card'), primary: cs('.view .btn.primary'), nav: cs('.nav'), topbar: cs('.topbar'),
    meta: document.querySelector('meta[name="theme-color"]').content, setting: window.DRG_APP.state.settings.theme,
    pressed: [...document.querySelectorAll('[data-role=theme-toggle] button')].map((b) => `${b.dataset.themeOption}:${b.getAttribute('aria-pressed')}`).join(' ') };
});
const stored = () => page.evaluate(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const t = r.result.transaction('kv').objectStore('kv').get('state'); t.onsuccess = () => res(t.result); }; }));
const choose = async () => { await page.evaluate(async () => { const A = window.DRG_APP; A.state.welcomed = true; await A.chooseCharacter('lucas'); }); };

await page.goto(BASE);
await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 120000 }).catch(() => null);
await page.reload();
await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 120000 });

await check('H01', 'Nova instalação (sistema em modo CLARO): abre no tema azul; padrão salvo = dark; seletor com a lua marcada', async () => {
  await choose();
  await go('#/');
  const l = await look();
  assert(l.attr === 'dark' && l.bg === DARK_BG && l.setting === 'dark', JSON.stringify(l));
  assert(l.pressed === 'light:false dark:true', l.pressed);
  assert(l.meta === '#0A2748', l.meta);
  await page.screenshot({ path: join(OUT, 'H01-azul-412.png') });
  return l;
});

let before = null;
await check('H02', 'Instalação existente com theme: \'auto\' salvo (e progresso): migra para o azul; progresso e dados intactos', async () => {
  await page.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
    const get = (k) => new Promise((r) => { const t = db.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => r(t.result); });
    const put = (k, v) => new Promise((r) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = r; });
    const s = await get('state');
    s.settings.theme = 'auto'; s.settings.fontScale = 1.15; s.settings.dailyGoal = 20;
    s.profiles.lucas.xp = 345; s.profiles.lucas.days = { 100: 3, 101: 5 };
    await put('state', s);
    await put('dialogues', { v: 1, acts: { 'john-p1-e01': { contentVersion: null, startedAt: 1, completedAt: null, attempts: { x1: { attemptId: 'x1', phase: 'vocab', itemId: 'i', status: 'passed', score: 100, threshold: 80, createdAt: 1, evaluatedAt: 1 } }, listens: {}, rounds: [], notes: '', order: {} } }, consent: { online: false, at: null } });
  });
  before = await stored();
  const dlgBefore = JSON.stringify(await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const t = r.result.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result); }; })));
  await go('#/');
  const l = await look();
  assert(l.attr === 'dark' && l.bg === DARK_BG && l.setting === 'dark', JSON.stringify(l));
  await page.evaluate(() => window.DRG_APP.flush());
  const after = await stored();
  const strip = (x) => JSON.stringify({ ...x, updatedAt: 0, settings: { ...x.settings, theme: 0 } });
  assert(after.settings.theme === 'dark', `salvo ${after.settings.theme}`);
  assert(after.settings.fontScale === 1.15 && after.settings.dailyGoal === 20, 'outros ajustes mudaram');
  assert(after.profiles.lucas.xp === 345 && JSON.stringify(after.profiles.lucas.days) === JSON.stringify(before.profiles.lucas.days), 'progresso mudou');
  const A = JSON.parse(strip(after)), B = JSON.parse(strip(before));
  const diff = [...new Set([...Object.keys(A), ...Object.keys(B)])].filter((k) => JSON.stringify(A[k]) !== JSON.stringify(B[k]));
  assert(!diff.length, `estado (fora o tema) mudou: ${diff.join(', ')}`);
  const dlgAfter = JSON.stringify(await page.evaluate(() => new Promise((res) => { const r = indexedDB.open('drg'); r.onsuccess = () => { const t = r.result.transaction('kv').objectStore('kv').get('dialogues'); t.onsuccess = () => res(t.result); }; })));
  assert(dlgAfter === dlgBefore, 'progresso dos diálogos mudou');
  await page.evaluate(async () => { const A = window.DRG_APP; A.state.settings.fontScale = 1; A.state.settings.dailyGoal = 12; A.applySettings(); await A.flush(); });
  return 'auto → dark; xp 345, dias, ajustes e diálogos preservados';
});

await check('H03', 'Sol: tema claro na hora (sem recarregar) e salvo no IndexedDB imediatamente', async () => {
  await go('#/');
  const nav0 = await page.evaluate(() => performance.getEntriesByType('navigation').length + ':' + performance.timeOrigin);
  await page.click('[data-role=theme-toggle] [data-theme-option=light]');
  await page.waitForTimeout(150);
  const l = await look();
  assert(l.attr === 'light' && l.bg === LIGHT_BG && l.pressed === 'light:true dark:false' && l.meta === '#F1F0FB', JSON.stringify(l));
  assert(l.hero === 'rgb(255, 255, 255)', `bloco do Início ${l.hero}`);
  const nav1 = await page.evaluate(() => performance.getEntriesByType('navigation').length + ':' + performance.timeOrigin);
  assert(nav0 === nav1, 'recarregou a página');
  assert((await stored()).settings.theme === 'light', 'não salvou na hora');
  await page.screenshot({ path: join(OUT, 'H03-claro-412.png') });
  return l;
});

await check('H04', 'Preferência mantida ao fechar e reabrir o app (claro)', async () => {
  await ctx.close();
  ctx = await open(); page = ctx.pages()[0] || await ctx.newPage(); watch(page);
  await go('#/');
  const l = await look();
  assert(l.attr === 'light' && l.bg === LIGHT_BG && l.pressed === 'light:true dark:false', JSON.stringify(l));
  return 'claro após reabrir';
});

await check('H05', 'Modo do sistema não altera a escolha: claro continua claro com o Android em modo escuro; azul continua azul em modo claro', async () => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await go('#/');
  const a = await look();
  assert(a.attr === 'light' && a.bg === LIGHT_BG, `claro+sistema escuro ${JSON.stringify(a)}`);
  await page.click('[data-role=theme-toggle] [data-theme-option=dark]');
  await page.emulateMedia({ colorScheme: 'light' });
  await go('#/');
  const b = await look();
  assert(b.attr === 'dark' && b.bg === DARK_BG && b.pressed === 'light:false dark:true', `azul+sistema claro ${JSON.stringify(b)}`);
  return 'independente do sistema';
});

await check('H06', 'Lua: volta ao azul na hora e salva', async () => {
  await page.click('[data-role=theme-toggle] [data-theme-option=light]');
  await page.click('[data-role=theme-toggle] [data-theme-option=dark]');
  const l = await look();
  assert(l.attr === 'dark' && l.bg === DARK_BG && (await stored()).settings.theme === 'dark', JSON.stringify(l));
  return 'ok';
});

await check('H07', 'Os dois temas no cabeçalho, cartões, botões e navegação: contraste ≥ 4,5:1, alvos ≥ 40 px, sem rolagem horizontal (360/412/430)', async () => {
  const out = {};
  for (const theme of ['dark', 'light']) {
    await page.evaluate(async (t) => { window.DRG_APP.state.settings.theme = t; window.DRG_APP.applySettings(); await window.DRG_APP.flush(); }, theme);
    for (const w of [360, 412, 430]) {
      await page.setViewportSize({ width: w, height: 900 });
      await go('#/');
      const r = await page.evaluate(() => {
        const parse = (c) => { const ctx = document.createElement('canvas').getContext('2d'); ctx.fillStyle = c; const v = ctx.fillStyle; if (v.startsWith('#')) return [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16)); return v.match(/[\d.]+/g).slice(0, 3).map(Number); };
        const lum = (rgb) => { const [r, g, b] = rgb.map((x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const rgba = (c) => { const m = c.match(/[\d.]+/g).map(Number); return c.startsWith('color(') ? [m[0] * 255, m[1] * 255, m[2] * 255, m[3] ?? 1] : [m[0], m[1], m[2], m[3] ?? 1]; };
        // fundo efetivo: compõe as camadas translúcidas sobre o fundo opaco mais próximo
        const bgOf = (el) => { const layers = []; for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] >= 1) break; } }
          let out = rgba(getComputedStyle(document.body).backgroundColor); for (const [r, g, b, a] of layers.reverse()) out = [r * a + out[0] * (1 - a), g * a + out[1] * (1 - a), b * a + out[2] * (1 - a), 1];
          return `rgb(${out.slice(0, 3).map(Math.round).join(', ')})`; };
        const ratio = (el) => { const a = lum(parse(getComputedStyle(el).color)), b = lum(parse(bgOf(el))); return +((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2); };
        const q = { titulo: '.topbar h1', nome: '.persona-name', secundario: '[data-role=persona] .muted', botao: '[data-role=persona] .btn.primary', cartao: '.view .card h3',
          trocar: '[data-role=switch-character]', navAtual: '.nav a[aria-current="page"]', nav: '.nav a:not([aria-current])', temaAtivo: '[data-role=theme-toggle] [aria-pressed=true]' };
        const contrast = Object.fromEntries(Object.entries(q).map(([k, s]) => [k, document.querySelector(s) ? ratio(document.querySelector(s)) : null]));
        const t = [...document.querySelectorAll('[data-role=theme-toggle] button, .topbar .icon-btn')].map((b) => b.getBoundingClientRect()).filter((r) => r.width < 40 || r.height < 40).length;
        const h1 = document.querySelector('.topbar h1');
        return { contrast, small: t, overflow: document.documentElement.scrollWidth > innerWidth + 1, titleCut: h1.scrollWidth > h1.clientWidth + 1 };
      });
      const low = Object.entries(r.contrast).filter(([, v]) => v !== null && v < 4.5);
      assert(!low.length, `${theme}@${w}: contraste baixo ${JSON.stringify(low)}`);
      assert(!r.small && !r.overflow, `${theme}@${w}: ${JSON.stringify(r)}`);
      out[`${theme}@${w}`] = { ...r.contrast, tituloCortado: r.titleCut };
      if (w === 360) await page.screenshot({ path: join(OUT, `H07-${theme}-360.png`) });
    }
  }
  await page.setViewportSize({ width: 412, height: 915 });
  return out;
});

await check('H08', 'Tema claro nas outras telas (diálogo, fase, Estudar, Curso, Ajustes, Falar): fundo e cartões claros, sem rolagem horizontal', async () => {
  await page.evaluate(async () => { window.DRG_APP.state.settings.theme = 'light'; window.DRG_APP.applySettings(); await window.DRG_APP.flush(); });
  const bad = [];
  for (const [n, hsh] of [['dialogo', '#/dialogue/john-p1-e01'], ['fase1', '#/dphase/john-p1-e01?p=u-write'], ['estudar', '#/modules'], ['curso', '#/course'], ['ajustes', '#/settings'], ['falar', '#/lab'], ['dialogos', '#/dialogues']]) {
    await go(hsh);
    const r = await page.evaluate(() => ({ bg: getComputedStyle(document.body).backgroundColor, card: (() => { const c = document.querySelector('.view .card'); return c ? getComputedStyle(c).backgroundColor : null; })(), ov: document.documentElement.scrollWidth > innerWidth + 1, theme: document.documentElement.dataset.theme }));
    if (r.bg !== 'rgb(241, 240, 251)' || (r.card && !['rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'].includes(r.card)) || r.ov || r.theme !== 'light') bad.push(`${n}:${JSON.stringify(r)}`);
    await page.screenshot({ path: join(OUT, `H08-claro-${n}.png`) });
  }
  assert(!(await page.locator('text=Automático').count()), 'opção “Automático” ainda aparece');
  assert(!bad.length, bad.join(' | '));
  return '7 telas';
});

await check('H09', 'Offline: com o servidor desligado e a rede cortada, o app abre do cache no tema escolhido', async () => {
  await page.evaluate(async () => { window.DRG_APP.state.settings.theme = 'light'; window.DRG_APP.applySettings(); await window.DRG_APP.flush(); });
  await new Promise((r) => server.close(r));
  await ctx.setOffline(true);
  await page.goto(BASE + '#/').catch(() => {});
  await page.reload().catch(() => {});
  await page.waitForSelector('[data-role=theme-toggle]', { timeout: 20000 });
  const l = await look();
  await page.click('[data-role=theme-toggle] [data-theme-option=dark]');
  const d = await look();
  await ctx.setOffline(false);
  server = await serve(SITE, PORT);
  assert(l.attr === 'light' && d.attr === 'dark' && d.bg === DARK_BG, JSON.stringify({ l, d }));
  return 'offline ok (claro → azul)';
});

record('H10', 'Sem erros de página', !errors.length, errors.slice(0, 5));
await ctx.close();
server.close();
writeFileSync(join(OUT, 'resultados.json'), JSON.stringify(results, null, 1));
const fail = results.filter((r) => r.status !== 'aprovado').length;
console.log(`\n${results.length - fail}/${results.length} aprovados`);
process.exit(fail ? 1 : 0);
