// Aplicativo instalável (Chromium, 412 px): manifesto e instalabilidade, botão de instalação (evento do navegador
// simulado pelo teste), modo janela própria, atualização controlada (disponível, adiada, fora da sessão, aplicada,
// falha no download e recuperação), preservação do progresso e dos caches, offline e página de instalação.
// A “versão nova” é o mesmo site com outro sw.js (VERSION diferente), servido pelo servidor de teste.
// Uso: node tests/e2e/pwa.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]. Não valida o aparelho real.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || join(ROOT, 'app'));
const BASE_PATH = process.argv[3] || '/';
const OUT = process.argv[4] || join(ROOT, 'docs/evidence/pwa');
mkdirSync(OUT, { recursive: true });
const PORT = 8797, ORIGIN = `http://localhost:${PORT}`, BASE = ORIGIN + BASE_PATH;
const PROFILE = join(OUT, '.profile');
rmSync(PROFILE, { recursive: true, force: true });

const results = [];
const record = (id, name, status, ev) => { results.push({ id, name, status, evidence: ev }); console.log(`${status === 'aprovado' ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, 'aprovado', (await fn()) ?? 'ok'); } catch (e) { record(id, name, 'reprovado', e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

// sw.js de “outras versões”: o mesmo site com VERSION diferente (e, para simular falha, um arquivo que não existe)
const SW_PATH = BASE_PATH + 'sw.js';
const swOriginal = readFileSync(join(SITE, BASE_PATH.replace(/^\//, ''), 'sw.js'), 'utf8');
const V1 = /const VERSION = '([^']+)'/.exec(swOriginal)[1];
const swVersion = (v, { broken = false } = {}) => {
  let s = swOriginal.replace(`const VERSION = '${V1}'`, `const VERSION = '${v}'`);
  if (broken) s = s.replace('const FILES = ["./",', 'const FILES = ["./","audio/nao-existe-nesta-versao.ogg",');
  return s;
};
let swServed = null; // null = o sw.js do site
const intercept = (req, res) => {
  if (swServed && req.url.split('?')[0] === SW_PATH) { res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' }); res.end(swServed); return true; }
  return false;
};

let server = await serve(SITE, PORT, { intercept });
// desliga o servidor na hora (o navegador mantém conexões abertas; sem isso, close() espera minutos por elas)
const stopServer = () => new Promise((r) => { server.close(r); if (server.closeAllConnections) server.closeAllConnections(); });
const errors = [], external = [];
const ctx = await chromium.launchPersistentContext(PROFILE, { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
const page = ctx.pages()[0] || await ctx.newPage();
page.on('pageerror', (e) => errors.push(e.message));
// diagnóstico: queda do processo da página ou do navegador (distingue falha do app de falha do ambiente de teste)
page.on('crash', () => console.log('[diagnóstico] página travou (crash do renderizador)'));
page.on('close', () => console.log('[diagnóstico] página fechada'));
ctx.on('close', () => console.log('[diagnóstico] navegador/contexto fechado'));
ctx.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !/^(blob|data):/.test(u)) external.push(u); });
const go = async (hash) => { await page.goto(BASE + hash); await page.waitForTimeout(800); };
const app = (fn, arg) => page.evaluate(fn, arg);
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`), fullPage: true });
const swVersionNow = () => app(() => new Promise((res) => { const c = navigator.serviceWorker.controller; if (!c) return res(null); const ch = new MessageChannel(); ch.port1.onmessage = (e) => res(e.data.version); c.postMessage({ type: 'VERSION' }, [ch.port2]); setTimeout(() => res('sem resposta'), 3000); }));
const cacheKeys = () => app(() => caches.keys().then((k) => k.sort()));
const appCaches = (keys) => keys.filter((k) => !/^asr-local-(?!teste)/.test(k)).join(); // o app cria o cache do reconhecimento ao consultar o status
const progress = () => app(() => { const st = window.DRG_APP.state; return JSON.stringify({ active: st.activeProfile, cards: Object.keys(st.cards).sort(), xp: st.xp, profiles: Object.keys(st.profiles).sort(), settings: st.settings.character }); });
const waitFor = async (fn, arg, ms = 60000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await app(fn, arg)) return true; await page.waitForTimeout(300); } return false; };
const updateState = () => app(() => window.DRG_APP.pwa && window.DRG_APP.pwa.update);
// evento de instalação do navegador simulado (o Chromium de teste não o dispara sozinho); o app reage como no Chrome
const fireInstallPrompt = (outcome) => app((o) => {
  const e = new Event('beforeinstallprompt', { cancelable: true });
  e.prompt = () => { window.__prompted = (window.__prompted || 0) + 1; return Promise.resolve(); };
  e.userChoice = Promise.resolve({ outcome: o, platform: 'web' });
  window.dispatchEvent(e);
}, outcome);

await check('P01', 'Manifesto e instalabilidade: sem erros no Chromium; id fixo igual à identidade atual; ícones e capturas', async () => {
  await go('#/');
  // service worker instala e pré-cacheia (~1.800 arquivos): espera a ativação de fato, não um tempo fixo
  const swReady = await waitFor(async () => { const r = await navigator.serviceWorker.getRegistration(); return !!(r && r.active && r.active.state === 'activated') && !!navigator.serviceWorker.controller; }, null, 60000);
  assert(swReady, 'service worker não ativou em 60 s');
  const cdp = await ctx.newCDPSession(page);
  const inst = await cdp.send('Page.getInstallabilityErrors');
  const man = await cdp.send('Page.getAppManifest');
  const m = JSON.parse(man.data);
  const parsed = man.manifest || {};
  assert(inst.installabilityErrors.length === 0 && man.errors.length === 0, JSON.stringify({ inst, errors: man.errors }));
  assert(parsed.id === `${ORIGIN}${BASE_PATH}index.html` && parsed.startUrl === parsed.id, JSON.stringify({ id: parsed.id, start: parsed.startUrl }));
  assert(m.display === 'standalone' && m.icons.some((i) => i.purpose === 'maskable') && m.icons.some((i) => i.sizes === '512x512') && m.screenshots.length === 3, 'campos');
  const shots = await app((list) => Promise.all(list.map((s) => fetch(s.src).then((r) => r.ok))), m.screenshots);
  assert(shots.every(Boolean), 'captura ausente');
  return { id: parsed.id, display: m.display, icones: m.icons.length, capturas: m.screenshots.map((s) => s.sizes) };
});

await check('P02', 'Service worker ativo e controlando; um único cache do app; capturas fora do pré-cache', async () => {
  await page.locator('[data-role=character-pick] [data-role=confirm-character]').click().catch(() => {});
  await page.waitForTimeout(300);
  const sw = await app(async () => { const r = await navigator.serviceWorker.getRegistration(); return { active: !!(r && r.active), waiting: !!(r && r.waiting), controller: !!navigator.serviceWorker.controller }; });
  const keys = await cacheKeys();
  const ver = await swVersionNow();
  const shotCached = await app(async () => !!(await caches.match(new URL('screenshots/modulo.png', location.href).href)));
  assert(sw.active && sw.controller && !sw.waiting && ver === V1 && keys.join() === `drg-${V1}` && !shotCached, JSON.stringify({ sw, keys, ver, shotCached }));
  return { versao: ver, caches: keys };
});

await check('P03', 'Instalar: sem o pedido do navegador, só instruções (nada simulado pelo app); com o pedido, botão → recusa tratada → aceite', async () => {
  await go('#/');
  const before = await app(() => ({ st: window.DRG_APP.pwa.install, btn: !!document.querySelector('[data-role=install-app]'), manual: !!document.querySelector('[data-role=install-manual]') }));
  await fireInstallPrompt('dismissed');
  await page.waitForTimeout(200);
  const shown = await page.locator('[data-role=install-app]').count();
  await shot('P03-instalar');
  await page.locator('[data-role=install-app]').click();
  await page.waitForTimeout(300);
  const afterNo = await app(() => ({ st: window.DRG_APP.pwa.install, prompted: window.__prompted, btn: !!document.querySelector('[data-role=install-app]') }));
  await fireInstallPrompt('accepted');
  await page.waitForTimeout(200);
  await page.locator('[data-role=install-app]').click();
  await page.waitForTimeout(300);
  const afterYes = await app(() => ({ st: window.DRG_APP.pwa.install, prompted: window.__prompted, status: (document.querySelector('[data-role=install-status]') || {}).textContent || '' }));
  await go('#/settings');
  const settings = await app(() => (document.querySelector('[data-role=app-section]') || {}).textContent || '');
  await app(() => { localStorage.removeItem('drg.installed'); });
  assert(before.st === 'manual' && !before.btn && before.manual && shown === 1, JSON.stringify(before));
  assert(afterNo.st === 'manual' && afterNo.prompted === 1 && !afterNo.btn, JSON.stringify(afterNo));
  assert(afterYes.prompted === 2 && afterYes.st === 'installed-elsewhere' && /já está instalado/.test(afterYes.status) && /já está instalado/.test(settings), JSON.stringify({ afterYes, settings: settings.slice(0, 120) }));
  return { semPedido: 'instruções', recusa: afterNo.st, aceite: afterYes.st };
});

await check('P04', 'Aberto como aplicativo (janela própria): nada de botão ou instrução de instalação; Ajustes informa', async () => {
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (q) => (/display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : real(q));
  });
  await go('#/'); await page.reload(); await page.waitForTimeout(800); // o script só vale numa carga nova da página
  const home = await app(() => ({ st: window.DRG_APP.pwa.install, card: document.querySelectorAll('[data-role=install-card]').length }));
  await go('#/settings');
  const s = await app(() => (document.querySelector('[data-role=install-status]') || {}).textContent || '');
  assert(home.st === 'standalone' && home.card === 0 && /aplicativo instalado/.test(s), JSON.stringify({ home, s }));
  return { estado: home.st, ajustes: s.trim() };
});

let before = null;
await check('P05', 'Versão nova publicada: baixada em segundo plano e ESPERA; aviso “Nova versão disponível”; a tela em uso continua na versão antiga', async () => {
  await page.reload(); await page.waitForTimeout(600);
  // progresso real (sessão da etapa) + cache do reconhecimento de fala simulado
  await app(async () => { const A = window.DRG_APP, t = A.today(); A.state.cards['item:it.wake-up:rec'] = { k: 'item:it.wake-up:rec', box: 2, due: t + 3, reps: 2, lapses: 0, streak: 2, last: t, lastResult: 'good', created: t - 2 }; A.state.xp += 30; await A.flush();
    const c = await caches.open('asr-local-teste'); await c.put(new URL('asr/teste.bin', location.href).href, new Response('modelo')); });
  before = await progress();
  await app(() => { window.__marker = 'tela-antiga'; });
  swServed = swVersion('teste-v2');
  await app(() => window.DRG_APP.pwa.reg.update());
  const ready = await waitFor(() => window.DRG_APP.pwa.update === 'ready');
  await go('#/');
  await app(() => { window.__marker = 'tela-antiga'; });
  const banner = await page.locator('[data-role=update-banner]').count();
  const keys = await cacheKeys();
  const ver = await swVersionNow();
  await shot('P05-atualizacao-disponivel');
  assert(ready && banner === 1 && ver === V1 && keys.includes(`drg-${V1}`) && keys.includes('drg-teste-v2') && keys.includes('asr-local-teste'), JSON.stringify({ ready, banner, ver, keys }));
  return { emUso: ver, caches: keys };
});

await check('P06', 'Durante uma sessão o aviso não aparece nem recarrega nada; ao sair, volta', async () => {
  await page.evaluate(() => { location.hash = '#/session?routine=R01&stage=vocab'; });
  await page.waitForTimeout(800);
  const inSession = await page.locator('[data-role=update-banner]').count();
  const marker = await app(() => window.__marker);
  await page.evaluate(() => { location.hash = '#/modules'; });
  await page.waitForTimeout(500);
  const after = await page.locator('[data-role=update-banner]').count();
  assert(inSession === 0 && marker === 'tela-antiga' && after === 1, JSON.stringify({ inSession, marker, after }));
  return { naSessao: inSession, depois: after };
});

await check('P07', '“Depois”: o aviso some nesta abertura; a versão continua pronta em Ajustes; nada recarrega', async () => {
  await page.locator('[data-role=update-later]').click();
  await page.waitForTimeout(200);
  const gone = await page.locator('[data-role=update-banner]').count();
  await page.evaluate(() => { location.hash = '#/settings'; });
  await page.waitForTimeout(500);
  const st = await app(() => ({ state: document.querySelector('[data-role=update-status]').dataset.state, btn: !!document.querySelector('[data-role=update-status] [data-role=update-now]'), marker: window.__marker }));
  assert(gone === 0 && st.state === 'ready' && st.btn && st.marker === 'tela-antiga', JSON.stringify({ gone, st }));
  return st;
});

await check('P08', '“Atualizar agora”: grava, ativa a versão nova e recarrega; progresso idêntico; cache antigo removido só depois da abertura; reconhecimento de fala preservado', async () => {
  await page.locator('[data-role=update-status] [data-role=update-now]').click();
  await page.waitForFunction(() => !window.__marker, null, { timeout: 15000 }); // recarregou
  await waitFor(() => caches.keys().then((k) => k.filter((x) => x.startsWith('drg-')).length === 1), null, 20000); // abertura + limpeza
  const ver = await swVersionNow();
  const after = await progress();
  const keys = await cacheKeys();
  const asr = await app(async () => !!(await caches.match(new URL('asr/teste.bin', location.href).href)));
  assert(ver === 'teste-v2' && after === before && appCaches(keys) === 'asr-local-teste,drg-teste-v2' && asr, JSON.stringify({ ver, keys, asr, same: after === before }));
  return { versao: ver, caches: keys, progressoIgual: true };
});

await check('P09', 'Falha no download da versão nova: a instalação dela é descartada (sem cache pela metade); o app segue na versão em uso e avisa', async () => {
  swServed = swVersion('teste-v3', { broken: true });
  await go('#/');
  await app(() => { window.DRG_APP.pwa.lastCheck = 0; return window.DRG_APP.pwa.reg.update().catch(() => {}); });
  const failed = await waitFor(() => window.DRG_APP.pwa.update === 'failed');
  await page.waitForTimeout(500);
  const banner = await page.locator('[data-role=update-failed]').count();
  const keys = await cacheKeys();
  const ver = await swVersionNow();
  await go('#/module/R02');
  const works = await page.locator('[data-role=stage]').count();
  assert(failed && banner === 1 && !keys.includes('drg-teste-v3') && ver === 'teste-v2' && works === 5 && (await progress()) === before, JSON.stringify({ failed, banner, keys, ver, works }));
  return { estado: 'failed', caches: keys, emUso: ver };
});

await check('P10', 'Recuperação: a versão seguinte, íntegra, é baixada e aplicada normalmente; progresso intacto', async () => {
  swServed = swVersion('teste-v4');
  await go('#/');
  await app(() => { window.__marker = 'antes'; window.DRG_APP.pwa.lastCheck = 0; return window.DRG_APP.pwa.reg.update().catch(() => {}); });
  const ready = await waitFor(() => window.DRG_APP.pwa.update === 'ready');
  await go('#/');
  await app(() => { window.__marker = 'antes'; });
  await page.locator('[data-role=update-banner] [data-role=update-now]').click();
  await page.waitForFunction(() => !window.__marker, null, { timeout: 15000 });
  await waitFor(() => caches.keys().then((k) => k.filter((x) => x.startsWith('drg-')).length === 1), null, 20000);
  const ver = await swVersionNow();
  const keys = await cacheKeys();
  assert(ready && ver === 'teste-v4' && appCaches(keys) === 'asr-local-teste,drg-teste-v4' && (await progress()) === before, JSON.stringify({ ready, ver, keys }));
  return { versao: ver, caches: keys };
});

await check('P11', 'Offline depois das atualizações (servidor desligado e rede cortada): abre, módulos, áudio, sessão e progresso', async () => {
  await stopServer();
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(1200);
  const p = await progress();
  await go('#/module/R02'); const stages = await page.locator('[data-role=stage]').count();
  const audio = await app(async () => { const it = Object.values(window.DRG_APP.content.items).find((i) => window.DRG_AUDIO.files[i.au]); const r = await fetch(`audio/${it.au}.ogg`); return { ok: r.ok, bytes: (await r.arrayBuffer()).byteLength }; });
  await go('#/session?routine=R02&stage=vocab');
  const ex = await app(() => window.DRG_APP.debugExercise && window.DRG_APP.debugExercise.type);
  await ctx.setOffline(false);
  server = await serve(SITE, PORT, { intercept });
  assert(p === before && stages === 5 && audio.ok && audio.bytes > 1000 && ex && ex !== 'summary', JSON.stringify({ same: p === before, stages, audio, ex }));
  return { etapas: stages, audio, exercicio: ex };
});

await check('P12', 'Página de instalação: identidade do app, instruções Chrome e Samsung Internet, offline, backup, QR; offline e sem rede externa; 412 px', async () => {
  await page.goto(BASE + 'install.html'); await page.waitForTimeout(800);
  const t = await page.locator('main').textContent();
  const qr = await app(() => { const i = document.querySelector('img[src="img/install-qr.svg"]'); return !!i && i.complete && i.naturalWidth > 0; });
  const noScroll = await app(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  await shot('P12-pagina-instalacao');
  await stopServer();
  await ctx.setOffline(true);
  await page.reload(); await page.waitForTimeout(800);
  const offline = await page.locator('main h1').textContent().catch(() => '');
  await ctx.setOffline(false);
  server = await serve(SITE, PORT, { intercept });
  assert(/Google Chrome/.test(t) && /Samsung Internet/.test(t) && /sem internet|offline/i.test(t) && /backup/i.test(t) && !/\bXP\b|pontos|recompensa/i.test(t), 'conteúdo');
  assert(qr && noScroll && offline === 'Daily Routine English', JSON.stringify({ qr, noScroll, offline }));
  return { qr, offline: true };
});

await check('P13', 'Nenhum erro de JavaScript nem requisição externa durante os testes', async () => {
  assert(!errors.length && !external.length, JSON.stringify({ errors: errors.slice(0, 3), external: external.slice(0, 3) }));
  return { erros: 0, externas: 0 };
});

await ctx.close();
server.close();
writeFileSync(join(OUT, 'results.json'), JSON.stringify(results, null, 1));
const ok = results.filter((r) => r.status === 'aprovado').length;
console.log(`\n${ok} aprovados, ${results.length - ok} reprovados`);
process.exit(ok === results.length ? 0 : 1);
