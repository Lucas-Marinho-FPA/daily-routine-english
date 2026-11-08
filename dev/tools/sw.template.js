// Service worker do Daily Routine English (GERADO por tools/build-app.mjs a partir de tools/sw.template.js).
// Tudo é local e versionado: os arquivos do app ficam no aparelho e são servidos “cache primeiro”, com respostas
// parciais (Range) para o <audio>.
//
// ATUALIZAÇÃO INCREMENTAL E RETOMÁVEL (2026-11-08; corrige o “Baixando…” sem fim no celular)
//   Antes, cada versão baixava os ~1.800 arquivos (~15 MB) para um cache próprio, num único passo de instalação:
//   bastava uma falha, o app ser fechado ou a rede lenta passar dos 5 minutos que o navegador dá à instalação para
//   tudo ser descartado e recomeçar do zero.
//   Agora cada arquivo é guardado pelo CONTEÚDO: a lista FILES traz o hash (SHA-256) de cada arquivo, e a chave no
//   cache é “<endereço>?v=<hash>”. Dois caches compartilhados entre versões:
//     · drgshell-v1 — HTML, CSS, JavaScript, dados e ícones;
//     · drgaudio-v1 — os áudios (a grande maioria dos arquivos; quase nunca mudam).
//   Uma versão nova só baixa o que tem hash novo; o resto já está lá (de versões anteriores — inclusive das antigas,
//   com cache “drgapp-…”/“drg-…”, que são conferidas pelo hash e copiadas, sem baixar de novo).
//   · Cada arquivo baixado é conferido pelo hash antes de entrar no cache (integridade); errado → baixa de novo.
//   · Cada arquivo entra no cache assim que chega: fechar o app, o Android suspender o navegador ou a rede cair não
//     perdem nada — a próxima tentativa continua só com o que falta.
//   · Falha de um arquivo: até 3 tentativas com espera; os outros continuam. A versão só se declara instalada
//     quando TODOS os arquivos estão no cache com o hash certo.
//   · A instalação se encerra sozinha antes do limite de 5 minutos do navegador (o que já baixou fica guardado) e
//     o app tenta de novo; em rede lenta a atualização termina em algumas tentativas, nunca recomeça do zero.
//   · O progresso real (arquivos baixados, reaproveitados, pendentes, último erro) é enviado às telas abertas e
//     guardado em “…/__drg/update-status.json” (drgshell-v1) para a tela de diagnóstico.
// Ciclo (nenhuma versão nova assume sozinha uma tela aberta):
//   install → waiting (o app mostra “Atualizar agora”; só com o toque do aluno recebe SKIP_WAITING) → activate
//   (assume as telas; não apaga nada) → CLEANUP (pedido pelo app já aberto na versão nova: apaga os caches antigos
//   “drgapp-”/“drg-” e, dos caches compartilhados, só o que nenhuma versão instalada ou pendente usa).
// Dados do aluno (progresso, respostas, atividades, correções, ajustes) ficam no IndexedDB/localStorage: este
// arquivo só mexe em caches de arquivos do app, nunca nesses dados. O cache do reconhecimento de fala
// (asr-local-…) nunca é tocado aqui.
const VERSION = '__VERSION__';
const FILES = __FILES__; // { "caminho": "hash" } — "./" é a página inicial
const SHELL = 'drgshell-v1', AUDIO = 'drgaudio-v1';
const isStore = (k) => k === SHELL || k === AUDIO;
const isLegacy = (k) => k.startsWith('drgapp-') || k.startsWith('drg-'); // caches de versões até 79916fe
const SCOPE = self.registration.scope;
const PATHS = Object.keys(FILES);
const storeOf = (path) => (path.startsWith('audio/') ? AUDIO : SHELL);
const plain = (path) => new URL(path === './' ? '' : path, SCOPE).href;
const keyOf = (path) => `${plain(path)}?v=${FILES[path]}`;
const STATUS_KEY = new URL('__drg/update-status.json', SCOPE).href;
const BUDGET_MS = 4 * 60 * 1000; // a instalação para antes dos 5 min do navegador (o que baixou fica guardado)
const PARALLEL = 6;

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const digest = async (buf) => hex(await crypto.subtle.digest('SHA-256', buf)).slice(0, 16);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// corpo + cabeçalhos úteis; nunca guarda resposta “opaca” ou parcial
const store = async (path, buf, headers) => {
  const h = new Headers();
  h.set('Content-Type', (headers && headers.get('Content-Type')) || 'application/octet-stream');
  h.set('X-DRG-Hash', FILES[path]);
  await (await caches.open(storeOf(path))).put(keyOf(path), new Response(buf, { status: 200, headers: h }));
};
// chaves já guardadas nos dois caches (uma leitura só, em vez de uma consulta por arquivo)
const storedKeys = async () => {
  const out = new Set();
  for (const name of [SHELL, AUDIO]) for (const r of await (await caches.open(name)).keys()) out.add(r.url);
  return out;
};

// ---------- estado da atualização (para as telas e para o diagnóstico) ----------
const status = { version: VERSION, phase: 'idle', total: PATHS.length, present: 0, reused: 0, downloaded: 0, pending: 0, failed: 0, attempt: 0, startedAt: 0, updatedAt: 0, lastError: null };
let lastSent = 0;
async function report(force = false) {
  status.updatedAt = Date.now();
  if (!force && status.updatedAt - lastSent < 400) return;
  lastSent = status.updatedAt;
  const msg = { type: 'UPDATE_STATUS', status: { ...status } };
  try { for (const c of await self.clients.matchAll({ includeUncontrolled: true, type: 'window' })) c.postMessage(msg); } catch (e) { /* sem telas */ }
  if (force) { try { await (await caches.open(SHELL)).put(STATUS_KEY, new Response(JSON.stringify(status), { headers: { 'Content-Type': 'application/json' } })); } catch (e) { /* ok */ } }
}

// arquivo de uma versão antiga (cache “drgapp-…”/“drg-…”, sem hash na chave): reaproveita se o conteúdo confere
async function fromLegacy(path, legacy) {
  for (const c of legacy) {
    const hit = await c.match(plain(path), { ignoreVary: true }); // chave exata (ignoreSearch varreria o cache inteiro a cada arquivo)
    if (!hit) continue;
    const buf = await hit.arrayBuffer();
    if ((await digest(buf)) === FILES[path]) { await store(path, buf, hit.headers); return true; }
  }
  return false;
}

// baixa um arquivo e confere o hash; 1ª tentativa aceita o cache HTTP revalidado, as seguintes vão direto à rede
async function download(path) {
  let err = null;
  for (let i = 0; i < 3; i++) {
    try {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 30000); // arquivo travado não segura a atualização
      let res, buf;
      try {
        res = await fetch(new Request(plain(path), { cache: i === 0 ? 'no-cache' : 'reload', signal: ctl.signal }));
        if (!res.ok) throw new Error(`HTTP ${res.status} em ${path}`);
        buf = await res.arrayBuffer();
      } finally { clearTimeout(timer); }
      if ((await digest(buf)) !== FILES[path]) throw new Error(`conteúdo diferente do esperado em ${path}`);
      await store(path, buf, res.headers);
      return;
    } catch (e) { err = e; await sleep(800 * (i + 1)); }
  }
  throw err;
}

/**
 * Deixa no cache todos os arquivos desta versão: reaproveita os que já estão (desta ou de versões antigas) e baixa
 * só os que faltam, com hash conferido. Retoma de onde parou. Lança erro se faltar algo ao fim do prazo.
 */
async function prepare(opts) {
  try { await run(opts); } catch (e) {
    status.phase = 'interrupted';
    status.lastError = status.lastError || (e && e.message) || String(e);
    await report(true);
    throw e;
  }
}
async function run({ budget = BUDGET_MS } = {}) {
  const t0 = Date.now();
  const legacy = await Promise.all((await caches.keys()).filter(isLegacy).map((k) => caches.open(k)));
  // tentativa anterior desta mesma versão (interrompida): continua a contagem
  try { const prev = await (await (await caches.open(SHELL)).match(STATUS_KEY)).json(); if (prev.version === VERSION && !status.attempt) status.attempt = prev.attempt || 0; } catch (e) { /* primeira */ }
  Object.assign(status, { phase: 'preparing', present: 0, reused: 0, downloaded: 0, failed: 0, pending: 0, startedAt: t0, lastError: null });
  status.attempt++;
  await report(true);
  const stored = await storedKeys();
  const missing = [];
  for (const p of PATHS) {
    if (stored.has(keyOf(p))) status.present++;
    else if (legacy.length && await fromLegacy(p, legacy)) { status.present++; status.reused++; }
    else missing.push(p);
    if (status.present % 100 === 0) await report();
  }
  status.pending = missing.length;
  status.phase = missing.length ? 'downloading' : 'verifying';
  await report(true);
  const errors = [];
  let next = 0;
  const worker = async () => {
    while (next < missing.length) {
      if (Date.now() - t0 > budget) return; // o que falta fica para a próxima tentativa
      const p = missing[next++];
      try { await download(p); status.downloaded++; status.present++; status.pending--; } catch (e) { status.failed++; errors.push(e.message); }
      await report();
    }
  };
  await Promise.all(Array.from({ length: PARALLEL }, worker));
  // integridade antes de declarar a versão instalada: todos os arquivos presentes, com o hash desta versão na chave
  status.phase = 'verifying';
  await report(true);
  const now = await storedKeys();
  const absent = PATHS.filter((p) => !now.has(keyOf(p)));
  status.pending = absent.length;
  if (absent.length) {
    status.phase = 'interrupted';
    status.lastError = errors[0] || (Date.now() - t0 > budget ? `tempo esgotado nesta tentativa; faltam ${absent.length} arquivos (o que já baixou fica guardado)` : `faltam ${absent.length} arquivos`);
    await report(true);
    throw new Error(status.lastError);
  }
  status.phase = 'ready';
  await report(true);
}

self.addEventListener('install', (event) => { event.waitUntil(prepare()); });

self.addEventListener('activate', (event) => {
  // assume as telas (o app recarrega); nada é apagado aqui — a limpeza espera o app abrir nesta versão (CLEANUP)
  event.waitUntil((async () => { status.phase = 'active'; await self.clients.claim(); await report(true); })());
});

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  const port = event.ports[0];
  if (msg.type === 'SKIP_WAITING') self.skipWaiting(); // só a pedido do aluno (“Atualizar agora”)
  if (msg.type === 'VERSION' && port) port.postMessage({ version: VERSION });
  if (msg.type === 'STATUS' && port) port.postMessage({ version: VERSION, status: { ...status } });
  if (msg.type === 'CLEANUP') {
    event.waitUntil((async () => {
      const reply = (removed, extra = {}) => { if (port) port.postMessage({ version: VERSION, removed, ...extra }); };
      const pending = () => self.registration.installing || self.registration.waiting;
      // versão nova instalando ou em espera: os arquivos dela não podem ser tocados (fica para depois)
      if (pending()) return reply([], { deferred: 'newer-version-pending' });
      // esta versão completa (arquivo apagado pelo navegador? baixa de novo) antes de apagar as anteriores
      try { await prepare({ budget: 2 * 60 * 1000 }); } catch (e) { return reply([], { deferred: 'incomplete' }); }
      if (pending()) return reply([], { deferred: 'newer-version-pending' });
      const removed = [];
      for (const k of (await caches.keys()).filter(isLegacy)) { await caches.delete(k); removed.push(k); }
      // dos caches compartilhados, só sai o que esta versão não usa (versões anteriores já não estão em uso)
      const keep = new Set(PATHS.map(keyOf).concat(STATUS_KEY));
      let pruned = 0;
      for (const name of [SHELL, AUDIO]) {
        const c = await caches.open(name);
        for (const req of await c.keys()) {
          if (keep.has(req.url)) continue;
          if (pending()) return reply(removed, { deferred: 'newer-version-pending', pruned });
          await c.delete(req); pruned++;
        }
      }
      reply(removed, { pruned });
    })());
  }
});

async function rangeResponse(request, response) {
  const range = request.headers.get('range');
  const buf = await response.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(range || '');
  const size = buf.byteLength;
  let start = m && m[1] ? Number(m[1]) : 0;
  let end = m && m[2] ? Number(m[2]) : size - 1;
  if (m && !m[1] && m[2]) { start = size - Number(m[2]); end = size - 1; }
  if (start >= size || end < start) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'audio/ogg', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' },
  });
}

// caminho do app para um endereço pedido (null = não é arquivo desta versão)
function pathOf(url, mode) {
  if (!url.startsWith(SCOPE)) return null;
  let rel = url.slice(SCOPE.length);
  if (rel === '' || rel === 'index.html') return FILES['./'] ? './' : 'index.html';
  if (FILES[rel]) return rel;
  return mode === 'navigate' ? './' : null;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // download do reconhecimento local: sempre da rede (nunca de um cache, nem de uma versão anterior)
  if (req.headers.get('X-DRG-Download') === '1') return;
  event.respondWith((async () => {
    const url = new URL(req.url);
    url.search = '';
    url.hash = '';
    const answer = (hit) => (req.headers.get('range') ? rangeResponse(req, hit) : hit);
    const path = pathOf(url.href, req.mode);
    if (path) {
      const hit = await (await caches.open(storeOf(path))).match(keyOf(path));
      if (hit) return answer(hit);
      // arquivo desta versão fora do cache (apagado pelo navegador?): da rede, conferido e guardado
      try {
        const res = await fetch(new Request(plain(path), { cache: 'no-cache' }));
        if (res.ok) {
          const buf = await res.arrayBuffer();
          const out = new Response(buf, { status: 200, headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream' } });
          if ((await digest(buf)) === FILES[path]) await store(path, buf.slice(0), res.headers).catch(() => {});
          return answer(out);
        }
      } catch (e) { /* sem internet */ }
    }
    // caches que não são do app: reconhecimento de fala (“asr-local-…”, baixado sob demanda)
    for (const k of await caches.keys()) {
      if (isStore(k) || isLegacy(k)) continue;
      const other = await (await caches.open(k)).match(url.href, { ignoreVary: true });
      if (other) return answer(other);
    }
    let net = null;
    try { net = await fetch(req); } catch (e) { /* sem internet */ }
    if (net && net.ok) return net;
    // sem internet: qualquer cópia guardada (de outra versão) é melhor que nada
    const older = await caches.match(url.href, { ignoreVary: true, ignoreSearch: true });
    if (older) return answer(older);
    return net || new Response('Offline e arquivo não encontrado no cache.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
