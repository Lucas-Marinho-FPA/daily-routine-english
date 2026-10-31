// Troca REAL de versão do aplicativo instalado (Chromium, 412 px), com os arquivos de duas versões publicadas.
// Diferente de pwa.mjs (mesmo site, outro sw.js), aqui o conteúdo muda de uma versão para a outra, então o teste
// confere o que a TELA mostra — não só a versão do service worker.
// Cobre o defeito de 2026-10-31: com a versão nova baixada e em espera, cada abertura do app antigo pedia a limpeza
// (CLEANUP) e o service worker antigo apagava o cache da versão nova; ao tocar “Atualizar agora”, a tela voltava com
// os dados antigos e o app deixava de abrir sem internet.
//
// Uso: node tests/e2e/update-transition.mjs <site-antigo> <site-novo> [pasta-de-evidências]
//   <site-*> = árvore publicada (raiz do app, como a branch gh-pages), por exemplo:
//     git archive 6a0c5b6 | tar -x -C /tmp/v-antiga ;  git archive HEAD | tar -x -C /tmp/v-nova
//   A versão antiga precisa ser anterior ao Lukinhas (6a0c5b6) ou já tê-lo (ec33411): o teste usa o nome “Lukinhas”
//   apenas como prova de conteúdo novo quando a versão antiga não o tem. Uma terceira versão (“seguinte”) é criada
//   pelo teste a partir da nova, com uma marca nos dados, para provar que a correção vale também para as próximas.
// Servidor de teste com Cache-Control: max-age=600 (como o GitHub Pages). Não valida o aparelho real.
import { chromium } from 'playwright';
import http from 'node:http';
import { mkdirSync, writeFileSync, rmSync, cpSync, readFileSync, appendFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve, normalize } from 'node:path';
import { tmpdir } from 'node:os';

const OLD = resolve(process.argv[2] || ''), NEW = resolve(process.argv[3] || '');
const OUT = resolve(process.argv[4] || join(tmpdir(), 'drg-update-transition'));
if (!process.argv[3]) { console.error('uso: node tests/e2e/update-transition.mjs <site-antigo> <site-novo> [evidências]'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const verOf = (dir) => /const VERSION = '([^']+)'/.exec(readFileSync(join(dir, 'sw.js'), 'utf8'))[1];
const V_OLD = verOf(OLD), V_NEW = verOf(NEW);
const oldHasLukinhas = readFileSync(join(OLD, 'data/characters.js'), 'utf8').includes('"Lukinhas"');

// versão “seguinte”: a nova com uma marca nos dados e outra VERSION (só para este teste)
const NEXT = join(OUT, 'site-seguinte');
rmSync(NEXT, { recursive: true, force: true });
cpSync(NEW, NEXT, { recursive: true });
appendFileSync(join(NEXT, 'data/journeys.js'), '\nwindow.DRG_TEST_MARK = "versao-seguinte";\n');
const V_NEXT = 'teste-seguinte';
writeFileSync(join(NEXT, 'sw.js'), readFileSync(join(NEW, 'sw.js'), 'utf8').replace(`const VERSION = '${V_NEW}'`, `const VERSION = '${V_NEXT}'`));

const BASE_PATH = '/daily-routine-english/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.ogg': 'audio/ogg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.gz': 'application/gzip', '.txt': 'text/plain', '.wasm': 'application/wasm', '.mjs': 'text/javascript' };
let root = OLD;
let requests = 0;
let slowMs = 0; // atraso por arquivo (exceto sw.js), como numa conexão de celular
let server = null, PORT = 0;
const startServer = () => new Promise((ok) => {
  server = http.createServer(async (req, res) => {
    requests++;
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (!p.startsWith(BASE_PATH)) { res.writeHead(404); return res.end(); }
    p = p.slice(BASE_PATH.length) || 'index.html';
    if (slowMs && !p.endsWith('sw.js')) await new Promise((r) => setTimeout(r, slowMs));
    let file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
    try {
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'max-age=600' });
      res.end(data);
    } catch (e) { res.writeHead(404); res.end(); }
  });
  server.listen(PORT, () => { PORT = server.address().port; ok(); });
});
const stopServer = () => new Promise((r) => { server.close(r); if (server.closeAllConnections) server.closeAllConnections(); });
// trecho sem internet: servidor desligado e rede cortada; religa sempre, mesmo se o trecho falhar
const offline = async (ctx, fn) => { await stopServer(); await ctx.setOffline(true); try { return await fn(); } finally { await ctx.setOffline(false); await startServer(); } };
await startServer();
const BASE = `http://localhost:${PORT}${BASE_PATH}`;

const results = [];
const record = (id, name, ok, ev) => { results.push({ id, name, status: ok ? 'aprovado' : 'reprovado', evidence: ev }); console.log(`${ok ? '✔' : '✘'} ${id} ${name} — ${typeof ev === 'string' ? ev : JSON.stringify(ev)}`); };
const check = async (id, name, fn) => { try { record(id, name, true, (await fn()) ?? 'ok'); } catch (e) { record(id, name, false, e.message.split('\n')[0]); } };
const assert = (c, m) => { if (!c) throw new Error(m); };

const open = async (name) => {
  const ctx = await chromium.launchPersistentContext(join(OUT, `.perfil-${name}`), { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true });
  const page = ctx.pages()[0] || await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  return { ctx, page, errors };
};
const fresh = (name) => rmSync(join(OUT, `.perfil-${name}`), { recursive: true, force: true });
const app = (page, fn, arg) => page.evaluate(fn, arg);
const sw = (page) => app(page, async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  const ver = (w) => !w ? null : new Promise((r) => { const ch = new MessageChannel(); const t = setTimeout(() => r('?'), 3000); ch.port1.onmessage = (e) => { clearTimeout(t); r(e.data.version); }; w.postMessage({ type: 'VERSION' }, [ch.port2]); });
  const keys = await caches.keys();
  const sizes = {};
  for (const k of keys) sizes[k] = (await (await caches.open(k)).keys()).length;
  return { controller: await ver(navigator.serviceWorker.controller), waiting: await ver(reg && reg.waiting), installing: !!(reg && reg.installing), caches: sizes };
});
const waitSw = async (page, pred, ms = 120000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { const s = await sw(page); if (pred(s)) return s; await page.waitForTimeout(400); } return null; };
// o que a tela de fato carregou: dados do Lukinhas e marca da versão seguinte
// (codigoNovo: a verificação ao abrir, pwa.check, só existe a partir da versão corrigida — prova o código carregado
// quando a versão antiga já tem o Lukinhas)
const shown = (page) => app(page, () => ({ lukinhas: JSON.stringify(window.DRG_CHARACTERS || {}).includes('"Lukinhas"'), codigoNovo: !!(window.DRG_APP && window.DRG_APP.pwa && typeof window.DRG_APP.pwa.check === 'function'), marca: window.DRG_TEST_MARK || null }));
const filesOf = (dir) => JSON.parse(/^const FILES = (.*);$/m.exec(readFileSync(join(dir, 'sw.js'), 'utf8'))[1]).length;
const N_FILES = filesOf(NEW);
// progresso de Lucas e Karla (o ativo fica no topo do estado)
const progress = (page) => app(page, async () => {
  const A = window.DRG_APP; await A.flush();
  const st = A.state;
  const of = (id) => (id === st.activeProfile ? { cards: st.cards, xp: st.xp, days: st.days } : st.profiles[id] || null);
  return JSON.stringify({ lucas: of('lucas'), karla: of('karla') });
});
const seed = (page) => app(page, async () => {
  const A = window.DRG_APP, t = A.today();
  const card = (box) => ({ k: 'item:it.wake-up:rec', box, due: t + box, reps: box, lapses: 0, streak: box, last: t, lastResult: 'good', created: t - 2 });
  await A.chooseCharacter('karla');
  A.state.cards['item:it.wake-up:rec'] = card(3); A.state.xp += 40; await A.flush();
  await A.chooseCharacter('lucas');
  A.state.cards['item:it.wake-up:rec'] = card(2); A.state.xp += 30; await A.flush();
});
// observa o aviso de download (C2) desde já, sem depender do tempo do download
const watchDownload = (page) => app(page, () => { window.__dl = []; new MutationObserver(() => { const el = document.querySelector('[data-role=update-downloading]'); if (el && !window.__dl.includes(el.textContent)) window.__dl.push(el.textContent); }).observe(document.body, { childList: true, subtree: true }); });
const banner = (page) => page.locator('[data-role=update-banner]').count();
const clickUpdate = async (page) => { await Promise.all([page.waitForEvent('load', { timeout: 30000 }), page.locator('[data-role=update-banner] [data-role=update-now]').click()]); await page.waitForTimeout(1500); };
const installOld = async (name) => {
  fresh(name); root = OLD;
  const o = await open(name);
  await o.page.goto(BASE);
  const s = await waitSw(o.page, (x) => x.controller === V_OLD);
  return { ...o, s };
};

console.log(`versão antiga ${V_OLD}${oldHasLukinhas ? ' (já tem o Lukinhas)' : ''} → nova ${V_NEW} → seguinte ${V_NEXT}; ${N_FILES} arquivos`);

// ---------- Cenário principal: reabrir com a versão nova em espera e “Atualizar agora” (cenário 7b) ----------
{
  let o = null, before = null;
  await check('T01', 'Instalação inicial da versão antiga: pronta para offline', async () => {
    o = await installOld('principal');
    assert(o.s, 'versão antiga não assumiu');
    await o.page.waitForTimeout(800);
    return { emUso: o.s.controller, caches: o.s.caches };
  });
  await check('T02', 'Abertura com a versão antiga (sem versão nova): sem aviso; progresso de Lucas e Karla gravado', async () => {
    await o.page.reload(); await o.page.waitForTimeout(1500);
    const b = await banner(o.page);
    await seed(o.page);
    before = await progress(o.page);
    assert(b === 0 && JSON.parse(before).karla && JSON.parse(before).lucas, JSON.stringify({ b, before: before.slice(0, 120) }));
    return { aviso: b, progresso: 'Lucas e Karla com cartões e XP' };
  });
  let dl = null;
  await check('T03', 'Publicação da versão nova + abertura com internet: a versão nova é baixada e fica em espera', async () => {
    root = NEW;
    await watchDownload(o.page);
    const r0 = requests;
    await o.page.goto(BASE); // abrir o app (navegação completa)
    await watchDownload(o.page);
    const s = await waitSw(o.page, (x) => x.waiting === V_NEW);
    await o.page.waitForTimeout(800);
    dl = await app(o.page, () => ({ textos: window.__dl, aindaVisivel: !!document.querySelector('[data-role=update-downloading]') }));
    assert(s && s.controller === V_OLD, JSON.stringify(s));
    return { requisicoes: requests - r0, emUso: s.controller, emEspera: s.waiting, caches: s.caches };
  });
  await check('T04', 'Indicador de download: “Baixando uma nova versão do aplicativo…” enquanto baixa; some quando termina', async () => {
    // a versão antiga em uso não tem esse aviso; ele só existe a partir da versão corrigida (ver T21)
    const has = readFileSync(join(NEW, 'dist/app.js'), 'utf8').includes('update-downloading'); // texto conferido na tela em T21
    assert(has, 'texto ausente no app novo');
    return { versaoAntigaMostrou: dl.textos, observacao: 'conferido na troca nova → seguinte (T21)' };
  });
  await check('T05', 'Aviso “Nova versão disponível”; “Depois” esconde e a versão antiga continua', async () => {
    await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
    await o.page.locator('[data-role=update-later]').click();
    await o.page.waitForTimeout(300);
    const b = await banner(o.page);
    const s = await sw(o.page);
    assert(b === 0 && s.controller === V_OLD && s.waiting === V_NEW, JSON.stringify({ b, s }));
    return { aviso: b, emUso: s.controller };
  });
  await check('T06', 'Reabertura com a versão nova em espera: o cache dela continua completo e o aviso volta', async () => {
    await o.page.goto(BASE); await o.page.waitForTimeout(2500); // abertura completa: o app antigo pede CLEANUP
    await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
    const s = await sw(o.page);
    const newCache = Object.entries(s.caches).find(([k]) => k.endsWith(V_NEW));
    assert(s.waiting === V_NEW && newCache && newCache[1] === N_FILES, JSON.stringify(s));
    return { cacheDaVersaoNova: newCache, emEspera: s.waiting };
  });
  await check('T07', '“Atualizar agora” depois da reabertura: a tela já mostra os dados novos, sem segundo recarregamento', async () => {
    await clickUpdate(o.page);
    const s = await waitSw(o.page, (x) => x.controller === V_NEW && Object.keys(x.caches).filter((k) => /^drg/.test(k)).length === 1, 20000);
    const t = await shown(o.page);
    const screen = await o.page.locator('body').innerText();
    assert(s && t.lukinhas && t.codigoNovo && s.caches[`drgapp-${V_NEW}`] === N_FILES, JSON.stringify({ s, t }));
    return { emUso: s.controller, caches: s.caches, lukinhasNosDados: t.lukinhas, codigoNovo: t.codigoNovo, telaInicial: screen.split('\n').slice(0, 2).join(' | ') };
  });
  await check('T08', 'Progresso de Lucas e Karla idêntico depois da atualização', async () => {
    const after = await progress(o.page);
    assert(after === before, 'progresso mudou');
    return { identico: true };
  });
  await check('T09', 'Compatibilidade: módulos do Lucas, da Karla e do Lukinhas abrem com as seis etapas', async () => {
    const out = {};
    for (const [who, mod] of [['lucas', 'R02'], ['karla', 'K01'], ['lucas-kid', 'L01']]) {
      await app(o.page, (id) => window.DRG_APP.chooseCharacter(id), who);
      await o.page.goto(BASE + `#/module/${mod}`); await o.page.reload(); await o.page.waitForTimeout(900);
      out[mod] = await o.page.locator('[data-role=stage]').count();
    }
    await app(o.page, () => window.DRG_APP.chooseCharacter('lucas'));
    assert(out.R02 === 6 && out.K01 === 6 && out.L01 === 6 && o.errors.length === 0, JSON.stringify({ out, errors: o.errors }));
    return out;
  });
  await check('T10', 'Offline depois da atualização (servidor desligado e rede cortada): app, Lukinhas, áudio dele e progresso', async () => {
    const r = await offline(o.ctx, async () => {
    await o.page.goto(BASE); await o.page.reload(); await o.page.waitForTimeout(1500);
    const t = await shown(o.page);
    const audio = await app(o.page, async () => { const r = await fetch('audio/ff44892c.ogg'); return { ok: r.ok, bytes: (await r.arrayBuffer()).byteLength }; });
    await app(o.page, () => window.DRG_APP.chooseCharacter('lucas-kid'));
    await o.page.goto(BASE + '#/module/L01'); await o.page.reload(); await o.page.waitForTimeout(900);
    const stages = await o.page.locator('[data-role=stage]').count();
    await app(o.page, () => window.DRG_APP.chooseCharacter('lucas'));
    const same = (await progress(o.page)) === before;
    return { t, audio, stages, same };
    });
    const { t, audio, stages, same } = r;
    assert(t.lukinhas && t.codigoNovo && audio.ok && audio.bytes > 1000 && stages === 6 && same, JSON.stringify({ t, audio, stages, same }));
    return { lukinhas: t.lukinhas, audio, etapasL01: stages, progressoIgual: same };
  });

  // ---------- versão seguinte (com a correção dos dois lados): o mesmo caminho, mais o indicador de download ----------
  await check('T21', 'Versão seguinte: indicador de download aparece na tela inicial e é substituído pelo aviso de versão pronta', async () => {
    root = NEXT;
    await o.page.goto(BASE); await watchDownload(o.page);
    const s = await waitSw(o.page, (x) => x.waiting === V_NEXT);
    await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
    const d = await app(o.page, () => ({ textos: window.__dl, aindaVisivel: !!document.querySelector('[data-role=update-downloading]') }));
    assert(s && d.textos.length === 1 && /Baixando uma nova versão do aplicativo…/.test(d.textos[0]) && !d.aindaVisivel, JSON.stringify({ s, d }));
    return { aviso: d.textos[0], depois: 'Nova versão disponível' };
  });
  await check('T22', 'Versão seguinte: reabrir com ela em espera + “Atualizar agora” → dados novos na hora; offline e progresso', async () => {
    await o.page.goto(BASE); await o.page.waitForTimeout(2500);
    await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
    const mid = await sw(o.page);
    await clickUpdate(o.page);
    const s = await waitSw(o.page, (x) => x.controller === V_NEXT && Object.keys(x.caches).filter((k) => /^drg/.test(k)).length === 1, 20000);
    const t = await shown(o.page);
    const { off, same } = await offline(o.ctx, async () => {
      await o.page.reload(); await o.page.waitForTimeout(1500);
      return { off: await shown(o.page), same: (await progress(o.page)) === before };
    });
    assert(mid.caches[`drgapp-${V_NEXT}`] === N_FILES && s && t.marca === 'versao-seguinte' && off.marca === 'versao-seguinte' && same, JSON.stringify({ mid: mid.caches, s, t, off, same }));
    return { emUso: s.controller, marcaNaTela: t.marca, offline: off.marca, progressoIgual: same };
  });
  await o.ctx.close();
}

// ---------- Download lento: reabrir durante o download (a causa de “Atualização indisponível neste modo de abertura”) ----------
// Enquanto o navegador instala a versão nova, register() fica na fila até o fim do download. O app tem de obter o
// registro sem depender dele: aviso de download visível, “Procurar atualização” informando o download, depois a
// versão pronta e “Atualizar agora” com os dados novos. Em aba normal (T14) e em modo app instalado simulado (T15:
// display-mode standalone; o Chromium de teste não cria um app instalado de verdade).
for (const [id, standalone] of [['T14', false], ['T15', true]]) {
  await check(id, `Download lento, ${standalone ? 'modo app instalado (simulado)' : 'aba normal do navegador'}: reabrir durante o download → aviso “Baixando…”, “Procurar atualização” informa o download; pronta → “Atualizar agora” → dados novos`, async () => {
    fresh('lento-' + id); root = NEW;
    const o = await open('lento-' + id);
    if (standalone) await o.page.addInitScript(() => { const real = window.matchMedia.bind(window); window.matchMedia = (q) => (/display-mode:\s*standalone/.test(q) ? { matches: true, media: q, addEventListener() {}, removeEventListener() {} } : real(q)); });
    await o.page.goto(BASE);
    await waitSw(o.page, (x) => x.controller === V_NEW);
    await o.page.reload(); await o.page.waitForTimeout(1500);
    const mode = await app(o.page, () => window.DRG_APP.pwa.install);
    root = NEXT; slowMs = 150;
    try {
      await o.page.goto(BASE); await o.page.waitForTimeout(2500); // abre: o navegador começa a instalar a seguinte (devagar)
      await o.page.reload(); await o.page.waitForTimeout(2500);   // reabre durante o download
      const during = await app(o.page, async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        const pending = await Promise.race([navigator.serviceWorker.register('sw.js').then(() => 'resolvido'), new Promise((r) => setTimeout(() => r('pendente'), 1500))]);
        return { installing: !!(reg && reg.installing), registerNaFila: pending, appTemReg: !!window.DRG_APP.pwa.reg, estado: window.DRG_APP.pwa.update, aviso: (document.querySelector('[data-role=update-downloading]') || {}).textContent || null };
      });
      await o.page.goto(BASE + '#/settings'); await o.page.waitForTimeout(800);
      await o.page.locator('[data-role=update-status] [data-role=update-check]').click();
      await o.page.waitForTimeout(600);
      const toastTxt = await app(o.page, () => [...document.querySelectorAll('.toast')].map((t) => t.textContent).join(' | '));
      const line = await app(o.page, () => document.querySelector('[data-role=update-status] .muted').textContent);
      await o.page.goto(BASE + '#/');
      const ready = await waitSw(o.page, (x) => x.waiting === V_NEXT, 240000);
      await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
      slowMs = 0;
      await clickUpdate(o.page);
      const s = await waitSw(o.page, (x) => x.controller === V_NEXT, 20000);
      const t = await shown(o.page);
      assert(mode === (standalone ? 'standalone' : 'manual') || (!standalone && mode !== 'standalone'), 'modo: ' + mode);
      assert(during.installing && during.appTemReg && during.estado === 'downloading' && /Baixando uma nova versão do aplicativo/.test(during.aviso || ''), 'durante: ' + JSON.stringify(during));
      assert(/Baixando a nova versão/.test(toastTxt) && !/indisponível/.test(toastTxt) && /Baixando/.test(line), 'Ajustes: ' + JSON.stringify({ toastTxt, line }));
      assert(ready && s && t.marca === 'versao-seguinte', JSON.stringify({ ready: !!ready, s, t }));
      return { modo: mode, durante: during, ajustes: toastTxt, depois: { emUso: s.controller, marca: t.marca } };
    } finally { slowMs = 0; await o.ctx.close(); }
  });
}

// ---------- Atualização imediata (o app fica aberto durante o download) ----------
await check('T11', 'Atualização imediata: versão nova baixada com o app aberto → “Atualizar agora” → dados novos', async () => {
  const o = await installOld('imediata');
  root = NEW;
  await o.page.goto(BASE);
  await waitSw(o.page, (x) => x.waiting === V_NEW);
  await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
  await clickUpdate(o.page);
  const s = await waitSw(o.page, (x) => x.controller === V_NEW, 20000);
  const t = await shown(o.page);
  await o.ctx.close();
  assert(s && t.lukinhas && t.codigoNovo, JSON.stringify({ s, t }));
  return { emUso: s.controller, lukinhas: t.lukinhas };
});

// ---------- Fechar o app por completo ----------
await check('T12', 'Fechar todas as janelas com a versão nova em espera (após uma reabertura) → abre direto nos dados novos', async () => {
  const o = await installOld('fechar');
  root = NEW;
  await o.page.goto(BASE);
  await waitSw(o.page, (x) => x.waiting === V_NEW);
  await o.page.goto(BASE); await o.page.waitForTimeout(2500); // reabertura com a versão em espera (CLEANUP do app antigo)
  await o.page.close();
  const p = await o.ctx.newPage(); await p.goto(BASE); await p.waitForTimeout(2500);
  const s = await sw(p); const t = await shown(p);
  await o.ctx.close();
  assert(s.controller === V_NEW && t.lukinhas && t.codigoNovo && s.caches[`drgapp-${V_NEW}`] === N_FILES, JSON.stringify({ s, t }));
  return { emUso: s.controller, lukinhas: t.lukinhas, caches: s.caches };
});

// ---------- Download interrompido ----------
await check('T13', 'Download interrompido (navegador encerrado no meio): ao reabrir com internet, conclui; atualização traz os dados novos', async () => {
  const o = await installOld('interrompido');
  root = NEW;
  await o.page.goto(BASE); await o.page.waitForTimeout(700);
  const mid = await sw(o.page);
  await o.ctx.close();
  const o2 = await open('interrompido');
  await o2.page.goto(BASE);
  const s = await waitSw(o2.page, (x) => x.waiting === V_NEW || x.controller === V_NEW);
  await o2.page.goto(BASE); await o2.page.waitForTimeout(2000);
  if ((await sw(o2.page)).controller !== V_NEW) { await o2.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 }); await clickUpdate(o2.page); }
  const s2 = await waitSw(o2.page, (x) => x.controller === V_NEW, 20000);
  const t = await shown(o2.page);
  await o2.ctx.close();
  assert(s && s2 && t.lukinhas && t.codigoNovo && s2.caches[`drgapp-${V_NEW}`] === N_FILES, JSON.stringify({ mid, s2, t }));
  return { duranteODownload: mid.caches, depois: s2.caches, lukinhas: t.lukinhas };
});

await stopServer();
const ok = results.filter((r) => r.status === 'aprovado').length, bad = results.length - ok;
writeFileSync(join(OUT, 'update-transition.json'), JSON.stringify({ old: V_OLD, new: V_NEW, next: V_NEXT, results }, null, 2));
console.log(`\n${ok} aprovados, ${bad} reprovados`);
process.exit(bad ? 1 : 0);
