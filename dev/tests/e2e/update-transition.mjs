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
import { mkdirSync, writeFileSync, rmSync, cpSync, readFileSync, appendFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
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

// lista de arquivos do sw.js: { caminho: hash } (a partir da atualização incremental) ou [caminhos] (versões antigas)
const FILES_RE = /^const FILES = (\{.*?\}|\[.*?\]);/m;
const manifestOf = (dir) => JSON.parse(FILES_RE.exec(readFileSync(join(dir, 'sw.js'), 'utf8'))[1]);
const sha16 = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 16);
// versão de teste: cópia de `base` com arquivos alterados por `mutate(dir)`; hashes do sw.js recalculados (como o build)
function makeVersion(name, base, mutate) {
  const dir = join(OUT, `site-${name}`);
  rmSync(dir, { recursive: true, force: true });
  cpSync(base, dir, { recursive: true });
  mutate(dir);
  const m = manifestOf(base);
  for (const f of Object.keys(m)) m[f] = sha16(readFileSync(join(dir, f === './' ? 'index.html' : f)));
  const v = `teste-${name}`;
  const src = readFileSync(join(base, 'sw.js'), 'utf8');
  writeFileSync(join(dir, 'sw.js'), src.replace(/const VERSION = '[^']+'/, `const VERSION = '${v}'`).replace(FILES_RE, `const FILES = ${JSON.stringify(m)};`));
  return { dir, v };
}
const changedBetween = (a, b) => { const ma = manifestOf(a), mb = manifestOf(b); return Object.keys(mb).filter((f) => f !== './' && ma[f] !== mb[f]); };
// versão “seguinte”: a nova com uma marca nos dados (um arquivo alterado)
const { dir: NEXT, v: V_NEXT } = makeVersion('seguinte', NEW, (d) => appendFileSync(join(d, 'data/journeys.js'), '\nwindow.DRG_TEST_MARK = "versao-seguinte";\n'));

const BASE_PATH = '/daily-routine-english/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.ogg': 'audio/ogg', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.gz': 'application/gzip', '.txt': 'text/plain', '.wasm': 'application/wasm', '.mjs': 'text/javascript' };
let root = OLD;
let requests = 0;
let slowMs = 0; // atraso por arquivo (exceto sw.js), como numa conexão de celular
const log = []; // { p, bytes, status } de cada arquivo servido (exceto sw.js)
const faults = {}; // caminho → { fail: n (próximas n respostas = 503), corrupt: true (conteúdo errado com 200) }
let net = { lat: 0, kbps: 0 }, linkFreeAt = 0; // rede de celular simulada: latência + enlace compartilhado
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
      let data = await readFile(file);
      if (!p.endsWith('sw.js')) {
        const f = faults[p];
        if (f && f.fail > 0) { f.fail--; log.push({ p, bytes: 0, status: 503 }); res.writeHead(503); return res.end(); }
        if (f && f.corrupt) data = Buffer.concat([data, Buffer.from('/* conteúdo alterado no caminho */')]);
        if (net.lat || net.kbps) {
          const now = Date.now(), start = Math.max(now + net.lat, linkFreeAt);
          linkFreeAt = start + (net.kbps ? (data.length * 8) / net.kbps : 0);
          await new Promise((r) => setTimeout(r, linkFreeAt - now));
        }
        log.push({ p, bytes: data.length, status: 200 });
      }
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
const N_FILES = Object.keys(manifestOf(NEW)).length;
// todos os arquivos da versão `dir` nos caches compartilhados (chave = endereço?v=hash)? → quantos faltam
const missingOf = (page, dir) => app(page, async (m) => {
  const have = new Set();
  for (const k of ['drgshell-v1', 'drgaudio-v1']) for (const r of await (await caches.open(k)).keys()) have.add(r.url);
  const scope = (await navigator.serviceWorker.getRegistration()).scope;
  return Object.entries(m).filter(([p, hh]) => !have.has(`${new URL(p === './' ? '' : p, scope).href}?v=${hh}`)).length;
}, manifestOf(dir));
const legacyCaches = (s) => Object.keys(s.caches).filter((k) => k.startsWith('drgapp-') || k.startsWith('drg-'));
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
    const l0 = log.length;
    await o.page.goto(BASE); // abrir o app (navegação completa)
    await watchDownload(o.page);
    const s = await waitSw(o.page, (x) => x.waiting === V_NEW);
    await o.page.waitForTimeout(800);
    dl = await app(o.page, () => ({ textos: window.__dl, aindaVisivel: !!document.querySelector('[data-role=update-downloading]') }));
    // atualização incremental a partir do cache da versão antiga (o caminho real do celular): só baixa o que mudou
    const got = log.slice(l0).filter((x) => x.status === 200);
    const legacyFiles = readdirSync(join(OLD, 'audio')).length;
    const changed = Object.entries(manifestOf(NEW)).filter(([f, hh]) => { try { return sha16(readFileSync(join(OLD, f === './' ? 'index.html' : f))) !== hh; } catch (e) { return true; } }).map(([f]) => f);
    const audioGot = got.filter((x) => x.p.startsWith('audio/')).length;
    const mb = got.reduce((n, x) => n + x.bytes, 0) / 1e6;
    assert(s && s.controller === V_OLD, JSON.stringify(s));
    assert(got.length <= changed.length && audioGot === changed.filter((f) => f.startsWith('audio/')).length, JSON.stringify({ baixados: got.map((x) => x.p), mudaram: changed }));
    return { baixados: got.length, MB: +mb.toFixed(3), arquivosQueMudaram: changed, audiosBaixados: audioGot, audiosReaproveitados: legacyFiles - audioGot, emUso: s.controller, emEspera: s.waiting, caches: s.caches };
  });
  await check('T04', 'Indicador de download: “Baixando uma nova versão do aplicativo…” enquanto baixa; some quando termina', async () => {
    // a versão antiga em uso não tem esse aviso; ele só existe a partir da versão corrigida (ver T21)
    const has = readFileSync(join(NEW, 'dist/app.js'), 'utf8').includes('update-progress'); // progresso real conferido na tela em T21
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
    const miss = await missingOf(o.page, NEW);
    assert(s.waiting === V_NEW && miss === 0, JSON.stringify({ s, miss }));
    return { arquivosDaVersaoNovaFaltando: miss, emEspera: s.waiting, caches: s.caches };
  });
  await check('T07', '“Atualizar agora” depois da reabertura: a tela já mostra os dados novos, sem segundo recarregamento', async () => {
    await clickUpdate(o.page);
    const s = await waitSw(o.page, (x) => x.controller === V_NEW && legacyCaches(x).length === 0, 20000); // CLEANUP apagou o cache da versão antiga
    const t = await shown(o.page);
    const screen = await o.page.locator('body').innerText();
    const miss = await missingOf(o.page, NEW);
    assert(s && t.lukinhas && t.codigoNovo && miss === 0, JSON.stringify({ s, t, miss }));
    return { emUso: s.controller, caches: s.caches, lukinhasNosDados: t.lukinhas, codigoNovo: t.codigoNovo, telaInicial: screen.split('\n').slice(0, 2).join(' | ') };
  });
  await check('T08', 'Progresso de Lucas e Karla idêntico depois da atualização', async () => {
    const after = await progress(o.page);
    assert(after === before, 'progresso mudou');
    return { identico: true };
  });
  await check('T09', 'Compatibilidade: módulos do Lucas, da Karla e do Lukinhas abrem com as cinco etapas', async () => {
    const out = {};
    for (const [who, mod] of [['lucas', 'R02'], ['karla', 'K01'], ['lucas-kid', 'L01']]) {
      await app(o.page, (id) => window.DRG_APP.chooseCharacter(id), who);
      await o.page.goto(BASE + `#/module/${mod}`); await o.page.reload(); await o.page.waitForTimeout(900);
      out[mod] = await o.page.locator('[data-role=stage]').count();
    }
    await app(o.page, () => window.DRG_APP.chooseCharacter('lucas'));
    assert(out.R02 === 5 && out.K01 === 5 && out.L01 === 5 && o.errors.length === 0, JSON.stringify({ out, errors: o.errors }));
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
    assert(t.lukinhas && t.codigoNovo && audio.ok && audio.bytes > 1000 && stages === 5 && same, JSON.stringify({ t, audio, stages, same }));
    return { lukinhas: t.lukinhas, audio, etapasL01: stages, progressoIgual: same };
  });

  // ---------- versão seguinte (com a correção dos dois lados): o mesmo caminho, mais o indicador de download ----------
  await check('T21', 'Versão seguinte: indicador de download aparece na tela inicial e é substituído pelo aviso de versão pronta', async () => {
    root = NEXT;
    await o.page.goto(BASE); await watchDownload(o.page);
    const s = await waitSw(o.page, (x) => x.waiting === V_NEXT);
    await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
    const d = await app(o.page, () => ({ textos: window.__dl, aindaVisivel: !!document.querySelector('[data-role=update-downloading]') }));
    assert(s && d.textos.length >= 1 && d.textos.every((x) => /Preparando a atualização|Baixando a atualização|Conferindo os arquivos|Nova versão baixada e conferida/.test(x)) && !d.aindaVisivel, JSON.stringify({ s, d }));
    return { avisos: d.textos, depois: 'Nova versão disponível' };
  });
  await check('T22', 'Versão seguinte: reabrir com ela em espera + “Atualizar agora” → dados novos na hora; offline e progresso', async () => {
    await o.page.goto(BASE); await o.page.waitForTimeout(2500);
    await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 10000 });
    const mid = await sw(o.page);
    await clickUpdate(o.page);
    const s = await waitSw(o.page, (x) => x.controller === V_NEXT && legacyCaches(x).length === 0, 20000);
    const t = await shown(o.page);
    const { off, same } = await offline(o.ctx, async () => {
      await o.page.reload(); await o.page.waitForTimeout(1500);
      return { off: await shown(o.page), same: (await progress(o.page)) === before };
    });
    assert(mid.waiting === V_NEXT && s && t.marca === 'versao-seguinte' && off.marca === 'versao-seguinte' && same, JSON.stringify({ mid, s, t, off, same }));
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
    root = NEXT; slowMs = 8000; // só 1 arquivo muda: um atraso longo mantém o download em andamento durante a reabertura
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
      assert(during.installing && during.appTemReg && during.estado === 'downloading' && /Baixando a atualização|Preparando a atualização|Conferindo os arquivos/.test(during.aviso || ''), 'durante: ' + JSON.stringify(during));
      assert(/Baixando a nova versão/.test(toastTxt) && !/indisponível/.test(toastTxt) && /Baixando|Preparando|Conferindo/.test(line), 'Ajustes: ' + JSON.stringify({ toastTxt, line }));
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
  const miss = await missingOf(p, NEW);
  await o.ctx.close();
  assert(s.controller === V_NEW && t.lukinhas && t.codigoNovo && miss === 0, JSON.stringify({ s, t, miss }));
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
  const miss = await missingOf(o2.page, NEW);
  await o2.ctx.close();
  assert(s && s2 && t.lukinhas && t.codigoNovo && miss === 0, JSON.stringify({ mid, s2, t, miss }));
  return { duranteODownload: mid.caches, depois: s2.caches, lukinhas: t.lukinhas };
});

// ---------- Atualização incremental e retomável (2026-11-08) ----------
// Cada versão de teste altera arquivos escolhidos da anterior; o servidor registra cada arquivo baixado, injeta falhas
// e simula a rede do celular. Os dados do aluno são conferidos do começo ao fim (U07).
{
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const audioOf = (dir) => readdirSync(join(dir, 'audio')).sort();
  const dataSnap = (page) => app(page, async () => {
    await window.DRG_APP.flush();
    const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
    const get = (k) => new Promise((r) => { const g = db.transaction('kv').objectStore('kv').get(k); g.onsuccess = () => r(g.result); });
    const st = JSON.parse(JSON.stringify((await get('state')) || null));
    if (st) delete st.updatedAt;
    const ls = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k !== 'drg.version') ls[k] = localStorage.getItem(k); }
    return JSON.stringify({ state: st, course: (await get('course')) || null, ls });
  });
  const waitingStatus = (page) => app(page, async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    const w = reg && reg.waiting;
    if (!w) return null;
    return new Promise((res) => { const ch = new MessageChannel(); ch.port1.onmessage = (e) => res(e.data.status); w.postMessage({ type: 'STATUS' }, [ch.port2]); setTimeout(() => res(null), 3000); });
  });
  const watchStates = (page) => app(page, () => { window.__st = []; new MutationObserver(() => { for (const r of ['update-downloading', 'update-interrupted', 'update-failed', 'update-banner']) { const el = document.querySelector(`[data-role=${r}]`); if (el) { const t = `${r}: ${el.textContent}`; if (!window.__st.includes(t)) window.__st.push(t); } } }).observe(document.body, { childList: true, subtree: true }); });
  // publica `ver`, abre o app, espera a versão ficar pronta; devolve o que foi baixado (antes de aplicar)
  const fetchVersion = async (o, ver, ms = 120000) => {
    root = ver.dir;
    const l0 = log.length;
    await o.page.goto(BASE); await watchStates(o.page);
    const s = await waitSw(o.page, (x) => x.waiting === ver.v, ms);
    const got = log.slice(l0);
    return { s, got, ok200: got.filter((x) => x.status === 200), status: s ? await waitingStatus(o.page) : null, states: await app(o.page, () => window.__st) };
  };
  const applyVersion = async (o, ver) => {
    await o.page.goto(BASE); await o.page.waitForTimeout(1500);
    await o.page.locator('[data-role=update-banner]').waitFor({ timeout: 15000 });
    await clickUpdate(o.page);
    const s = await waitSw(o.page, (x) => x.controller === ver.v && legacyCaches(x).length === 0, 30000);
    await waitFor(o.page, (v) => window.DRG_APP.pwa.version === v, ver.v); // CLEANUP respondido
    return s;
  };
  const waitFor = async (page, fn, arg, ms = 30000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await app(page, fn, arg)) return true; await page.waitForTimeout(300); } return false; };
  const storeCount = (page) => app(page, async () => { let n = 0; for (const k of ['drgshell-v1', 'drgaudio-v1']) n += (await (await caches.open(k)).keys()).filter((r) => !r.url.includes('/__drg/')).length; return n; });
  const sameSet = (a, b) => JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());

  fresh('incremental'); root = NEW;
  let o = await open('incremental');
  await o.page.goto(BASE);
  await waitSw(o.page, (x) => x.controller === V_NEW);
  await o.page.reload(); await o.page.waitForTimeout(1500);
  // dados do aluno: progresso de Lucas e Karla, ajuste, atividade do curso com correção do professor, localStorage
  await seed(o.page);
  await app(o.page, async () => {
    const A = window.DRG_APP;
    A.state.settings.theme = 'dark'; A.applySettings(); await A.flush();
    const db = await new Promise((r) => { const q = indexedDB.open('drg'); q.onsuccess = () => r(q.result); });
    const act = { id: 'a1', title: 'Atividade sintética', importedAt: 1, questions: [{ n: 1, blocks: ['Hello.', 'Good morning.'] }], answers: { 1: ['Olá.', 'Bom dia.'] }, done: { 1: 2 }, submitted: { 1: { at: 2, blocks: ['Olá.', 'Bom dia.'], check: [] } }, teacher: { 1: { blocks: ['Olá!', 'Bom dia.'], validatedAt: 3 } }, pos: { q: 1, b: 1 } };
    await new Promise((r) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put({ v: 1, activities: { a1: act }, last: 'a1', savedAt: 4 }, 'course'); t.oncomplete = r; });
    localStorage.setItem('drg.teste.marca', 'preservar');
  });
  const snap0 = await dataSnap(o.page);
  const nAudio = audioOf(NEW).length;

  const V1 = makeVersion('um', NEW, (d) => appendFileSync(join(d, 'data/journeys.js'), '\nwindow.DRG_TEST_MARK = "um";\n'));
  await check('U01', 'Incremental, 1 arquivo alterado: baixa só ele (nenhum áudio); o resto é reaproveitado; a tela mostra a versão nova', async () => {
    const r = await fetchVersion(o, V1);
    const expected = changedBetween(NEW, V1.dir);
    assert(r.s && sameSet(r.ok200.map((x) => x.p), expected), JSON.stringify({ baixados: r.ok200.map((x) => x.p), esperado: expected }));
    const s = await applyVersion(o, V1);
    const t = await shown(o.page);
    assert(s && t.marca === 'um', JSON.stringify({ s, t }));
    return { baixados: r.ok200.map((x) => x.p), KB: Math.round(r.ok200.reduce((n, x) => n + x.bytes, 0) / 1024), reaproveitados: N_FILES - 1 - r.ok200.length, status: r.status && { present: r.status.present, downloaded: r.status.downloaded } };
  });

  const V2 = makeVersion('varios', V1.dir, (d) => {
    appendFileSync(join(d, 'css/app.css'), '\n/* teste: varios */\n');
    appendFileSync(join(d, 'install.js'), '\n// teste: varios\n');
    for (const f of audioOf(d).slice(0, 5)) appendFileSync(join(d, 'audio', f), Buffer.from([0]));
  });
  let u02 = null;
  await check('U02', 'Incremental, vários arquivos (2 do app + 5 áudios): baixa exatamente os 7; os outros 1.782 áudios são reaproveitados; arquivos substituídos saem do cache depois', async () => {
    const r = await fetchVersion(o, V2);
    const expected = changedBetween(V1.dir, V2.dir);
    const audioGot = r.ok200.filter((x) => x.p.startsWith('audio/')).length;
    assert(r.s && expected.length === 7 && sameSet(r.ok200.map((x) => x.p), expected) && r.ok200.length === 7 && audioGot === 5, JSON.stringify({ baixados: r.ok200.map((x) => x.p), esperado: expected }));
    const s = await applyVersion(o, V2);
    const total = await storeCount(o.page);
    const miss = await missingOf(o.page, V2.dir);
    assert(s && miss === 0 && total === N_FILES, JSON.stringify({ s, miss, total, N_FILES }));
    u02 = { audiosBaixados: audioGot, audiosReaproveitados: nAudio - audioGot };
    return { baixados: r.ok200.length, KB: Math.round(r.ok200.reduce((n, x) => n + x.bytes, 0) / 1024), ...u02, arquivosNoCacheDepoisDaLimpeza: total };
  });

  const V3 = makeVersion('interrompida', V2.dir, (d) => { for (const f of audioOf(d).slice(10, 90)) appendFileSync(join(d, 'audio', f), Buffer.from([1])); });
  await check('U03', 'Interrupção e retomada: app fechado no meio do download (80 áudios) → ao reabrir continua só com o que falta (“retomada”), sem recomeçar', async () => {
    const changed = changedBetween(V2.dir, V3.dir);
    net = { lat: 1500, kbps: 0 };
    root = V3.dir;
    const l0 = log.length;
    await o.page.goto(BASE);
    const t0 = Date.now();
    while (log.slice(l0).filter((x) => x.status === 200).length < 20 && Date.now() - t0 < 90000) await pause(300);
    const before = log.slice(l0).filter((x) => x.status === 200).length;
    await o.ctx.close(); // o Android encerrou o navegador
    o = await open('incremental');
    const l1 = log.length;
    await o.page.goto(BASE); await watchStates(o.page);
    const s = await waitSw(o.page, (x) => x.waiting === V3.v, 240000);
    net = { lat: 0, kbps: 0 };
    const after = log.slice(l1).filter((x) => x.status === 200);
    const all = log.slice(l0).filter((x) => x.status === 200 && changed.includes(x.p));
    const states = await app(o.page, () => window.__st);
    const st = await waitingStatus(o.page);
    assert(s && sameSet(all.map((x) => x.p), changed), 'nem todos os arquivos alterados foram baixados');
    assert(after.length <= changed.length - before + 6 && all.length <= changed.length + 6, JSON.stringify({ antes: before, depois: after.length, total: all.length, alterados: changed.length }));
    assert(st && st.attempt >= 2 && states.some((x) => /retomada \(tentativa 2\)/.test(x)), JSON.stringify({ st, states }));
    const ap = await applyVersion(o, V3);
    assert(ap, 'não aplicou');
    return { alterados: changed.length, baixadosAntesDeFechar: before, baixadosDepoisDeReabrir: after.length, totalBaixado: all.length, tentativa: st.attempt, aviso: states.find((x) => /retomada/.test(x)) };
  });

  const V4 = makeVersion('falha', V3.dir, (d) => { for (const f of ['css/app.css', 'install.js', 'data/journeys.js']) appendFileSync(join(d, f), '\n/* teste: falha */\n'); });
  await check('U04', 'Falha temporária de um arquivo (503 na 1ª vez): o arquivo é tentado de novo e a atualização conclui na mesma tentativa, sem aviso de erro', async () => {
    faults['css/app.css'] = { fail: 1 };
    const r = await fetchVersion(o, V4);
    delete faults['css/app.css'];
    const css = r.got.filter((x) => x.p === 'css/app.css').map((x) => x.status);
    assert(r.s && css.join() === '503,200' && r.status && r.status.attempt === 1 && !r.states.some((x) => /update-(failed|interrupted)/.test(x)), JSON.stringify({ css, status: r.status, states: r.states }));
    const s = await applyVersion(o, V4);
    assert(s, 'não aplicou');
    return { respostasDoArquivo: css, tentativa: r.status.attempt, baixados: r.ok200.length };
  });

  const V5 = makeVersion('integridade', V4.dir, (d) => appendFileSync(join(d, 'install.js'), '\n// teste: integridade\n'));
  await check('U06', 'Integridade antes da ativação: arquivo com conteúdo errado (hash não confere) → a versão NÃO é instalada; o app continua na atual e mostra o erro (aviso e Diagnóstico); corrigido o servidor, “Tentar de novo” conclui', async () => {
    faults['install.js'] = { corrupt: true };
    root = V5.dir;
    await o.page.goto(BASE); await watchStates(o.page);
    const failed = await waitFor(o.page, () => window.DRG_APP.pwa.update === 'failed', null, 90000);
    const s = await sw(o.page);
    const msg = await o.page.locator('[data-role=update-failed]').textContent().catch(() => '');
    const bad = await app(o.page, async (h) => !!(await (await caches.open('drgshell-v1')).keys()).find((r) => r.url.endsWith(`install.js?v=${h}`)), manifestOf(V5.dir)['install.js']);
    await o.page.goto(BASE + '#/settings'); await o.page.waitForTimeout(800);
    await o.page.locator('[data-role=update-diag] summary').click();
    await o.page.waitForTimeout(1500);
    const diag = await app(o.page, () => Object.fromEntries([...document.querySelectorAll('[data-role^=diag-]')].map((e) => [e.dataset.role, e.textContent])));
    await o.page.screenshot({ path: join(OUT, 'U06-diagnostico.png'), fullPage: true });
    assert(failed && !s.waiting && s.controller === V4.v && /conteúdo diferente/.test(msg) && !bad, JSON.stringify({ failed, s, msg, bad }));
    assert(diag['diag-active'] === V4.v && /conteúdo diferente/.test(diag['diag-error'] || '') && /falhou/.test(diag['diag-update'] || ''), JSON.stringify(diag));
    delete faults['install.js'];
    await app(o.page, () => { location.hash = '#/'; }); await o.page.waitForTimeout(800); // volta ao Início sem recarregar (o aviso de falha continua)
    await o.page.locator('[data-role=update-retry]').click();
    const ok = await waitSw(o.page, (x) => x.waiting === V5.v, 60000);
    const ap = ok && await applyVersion(o, V5);
    assert(ok && ap, 'não concluiu depois de corrigido');
    return { aviso: msg.slice(0, 120), diagnostico: diag, depoisDeCorrigido: ap.controller };
  });

  const V6 = makeVersion('lenta', V5.dir, (d) => { for (const f of audioOf(d)) appendFileSync(join(d, 'audio', f), Buffer.from([2])); });
  await check('U05', 'Rede lenta (300 kbit/s) com download maior que 5 min (todos os 1.787 áudios mudaram): cada tentativa para antes do limite guardando o que baixou, continua sozinha e conclui sem baixar de novo', async () => {
    const changed = changedBetween(V5.dir, V6.dir);
    const bytesChanged = changed.reduce((n, f) => n + readFileSync(join(V6.dir, f)).length, 0);
    net = { lat: 100, kbps: 300 };
    const t0 = Date.now();
    const r = await fetchVersion(o, V6, 20 * 60 * 1000);
    net = { lat: 0, kbps: 0 };
    const secs = Math.round((Date.now() - t0) / 1000);
    const got = r.ok200.filter((x) => changed.includes(x.p));
    const bytes = got.reduce((n, x) => n + x.bytes, 0);
    const interrupted = r.states.filter((x) => /update-interrupted/.test(x));
    assert(r.s && secs > 300 && sameSet(got.map((x) => x.p), changed), JSON.stringify({ pronta: !!r.s, secs, baixados: got.length, alterados: changed.length }));
    assert(bytes <= bytesChanged * 1.05 && r.status.attempt >= 2 && interrupted.length >= 1, JSON.stringify({ bytes, bytesChanged, status: r.status, interrupted }));
    const s = await applyVersion(o, V6);
    assert(s, 'não aplicou');
    return { segundos: secs, tentativas: r.status.attempt, MBbaixados: +(bytes / 1e6).toFixed(2), MBalterados: +(bytesChanged / 1e6).toFixed(2), repetidos: got.length - changed.length, avisoInterrompida: interrupted[0] && interrupted[0].slice(0, 140) };
  });

  await check('U07', 'Dados locais preservados em todas as atualizações: progresso, ajustes, atividade do curso com correção do professor, localStorage', async () => {
    const snap1 = await dataSnap(o.page);
    const s = await sw(o.page);
    assert(snap1 === snap0 && s.controller === V6.v, JSON.stringify({ igual: snap1 === snap0, emUso: s.controller, antes: snap0.slice(0, 200), depois: snap1.slice(0, 200) }));
    return { identicos: true, versoesAplicadas: [V1.v, V2.v, V3.v, V4.v, V5.v, V6.v], emUso: s.controller };
  });

  await check('U08', 'Reaproveitamento dos áudios: só os áudios alterados são baixados (versão antiga → nova: 0 baixados; U02: 5 de 1.787)', async () => {
    assert(u02 && u02.audiosBaixados === 5 && u02.audiosReaproveitados === nAudio - 5, JSON.stringify(u02));
    return { totalDeAudios: nAudio, ...u02 };
  });
  await o.ctx.close();
}

await stopServer();
const ok = results.filter((r) => r.status === 'aprovado').length, bad = results.length - ok;
writeFileSync(join(OUT, 'update-transition.json'), JSON.stringify({ old: V_OLD, new: V_NEW, next: V_NEXT, results }, null, 2));
console.log(`\n${ok} aprovados, ${bad} reprovados`);
process.exit(bad ? 1 : 0);
