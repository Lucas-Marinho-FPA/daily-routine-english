// Service worker do Daily Routine English (GERADO por tools/build-app.mjs a partir de tools/sw.template.js).
// Estratégia: tudo é local e versionado → pré-cache completo na instalação e "cache primeiro" sempre.
// Atende requisições de faixa (Range) a partir do cache, necessárias para <audio> em alguns navegadores.
//
// Atualização controlada (nenhuma versão nova assume sozinha uma tela aberta):
//   1. install  — a versão nova baixa TODOS os arquivos para um cache próprio. Se algum falhar, o cache incompleto é
//                 apagado e a instalação falha: a versão em uso continua intacta (o navegador tenta de novo depois).
//   2. waiting  — instalada, ela espera. O app mostra “Atualizar agora”; só quando o aluno toca é que ela recebe
//                 SKIP_WAITING e assume (o app grava o progresso e recarrega). Fechar o app por completo também a ativa.
//   3. activate — assume as telas, mas NÃO apaga o cache anterior.
//   4. CLEANUP  — o app, já carregado com sucesso na versão nova, pede a limpeza: só então os caches de versões
//                 anteriores são apagados. O cache do reconhecimento de fala (asr-local-…) nunca é tocado aqui.
// Na primeira instalação (sem versão anterior) não há espera: o app passa a funcionar offline logo após o 1º acesso.
//
// Proteções da troca de versão (defeito corrigido em 2026-10-31):
//   · O cache desta versão usa o prefixo “drgapp-”. Até a versão 6db56e10bb5d, o CLEANUP apagava todo cache “drg-”
//     que não fosse o seu — inclusive o da versão nova já baixada e em espera. Esse código antigo continua nos
//     aparelhos até a troca; com outro prefixo, a versão nova fica fora do alcance dele.
//   · O CLEANUP desta versão não apaga nada enquanto houver outra versão instalando ou em espera, e só apaga as
//     anteriores depois de conferir que o próprio cache está completo.
//   · Ao assumir, a versão confere o próprio cache e baixa o que faltar (ex.: apagado pelo navegador ou por uma
//     versão antiga). As telas só recebem arquivos depois disso (o navegador segura as requisições até a ativação).
//   · Arquivo do app ausente no cache desta versão vem da rede; o de outra versão guardada só é usado sem internet.
const VERSION = '__VERSION__';
const CACHE = `drgapp-${VERSION}`;
const FILES = __FILES__;
const isAppCache = (k) => k.startsWith('drgapp-') || k.startsWith('drg-'); // “drg-”: versões até 6db56e10bb5d

// baixa para o cache desta versão os arquivos que faltam nele (todos, na instalação); sempre da rede
async function fill(cache, { onlyMissing = false } = {}) {
  let list = FILES;
  if (onlyMissing) {
    const have = new Set((await cache.keys()).map((r) => r.url));
    list = FILES.filter((f) => !have.has(new URL(f, self.registration.scope).href));
  }
  // em lotes, para não estourar conexões simultâneas; sempre da rede (nunca de um cache HTTP antigo)
  for (let i = 0; i < list.length; i += 40) await cache.addAll(list.slice(i, i + 40).map((f) => new Request(f, { cache: 'reload' })));
  return list.length;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await fill(cache);
      // o cache desta versão pode ter sido apagado no meio da instalação (limpeza de uma versão antiga em uso):
      // confere e completa antes de declarar a versão instalada
      if (!(await caches.keys()).includes(CACHE)) await fill(await caches.open(CACHE));
    } catch (e) {
      await caches.delete(CACHE); // nada de versão pela metade
      throw e;
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // primeiro assume as telas (o app recarrega); as requisições delas esperam o fim desta ativação
    await self.clients.claim();
    // o cache anterior fica até o app confirmar que a versão nova abriu (CLEANUP)
    try { await fill(await caches.open(CACHE), { onlyMissing: true }); } catch (e) { /* sem internet: completa depois */ }
  })());
});

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SKIP_WAITING') self.skipWaiting(); // só a pedido do aluno (“Atualizar agora”)
  if (msg.type === 'VERSION' && event.ports[0]) event.ports[0].postMessage({ version: VERSION });
  if (msg.type === 'CLEANUP') {
    event.waitUntil((async () => {
      const reply = (removed, extra = {}) => { if (event.ports[0]) event.ports[0].postMessage({ version: VERSION, removed, ...extra }); };
      const pending = () => self.registration.installing || self.registration.waiting;
      // outra versão instalando ou em espera: o cache dela não pode ser tocado (fica para depois que ela assumir)
      if (pending()) return reply([], { deferred: 'newer-version-pending' });
      // só apaga as versões anteriores com o cache desta versão completo (senão elas ainda servem sem internet)
      try { await fill(await caches.open(CACHE), { onlyMissing: true }); } catch (e) { return reply([], { deferred: 'incomplete' }); }
      const old = (await caches.keys()).filter((k) => isAppCache(k) && k !== CACHE);
      // confere de novo DEPOIS de listar e sem nenhuma espera até apagar: uma instalação que começou durante a
      // conferência acima já aparece aqui, e uma que comece depois não está na lista
      if (pending()) return reply([], { deferred: 'newer-version-pending' });
      await Promise.all(old.map((k) => caches.delete(k)));
      reply(old);
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

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // download do reconhecimento local: sempre da rede (nunca de um cache, nem de uma versão anterior)
  if (req.headers.get('X-DRG-Download') === '1') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const url = new URL(req.url);
    url.search = '';
    const answer = (hit) => (req.headers.get('range') ? rangeResponse(req, hit) : hit);
    let hit = await cache.match(url.href, { ignoreVary: true });
    if (!hit && req.mode === 'navigate') hit = await cache.match(new URL('index.html', self.registration.scope).href);
    if (hit) return answer(hit);
    // caches que não são de uma versão do app: reconhecimento de fala (“asr-local-…”, baixado sob demanda)
    for (const k of await caches.keys()) {
      if (isAppCache(k)) continue;
      const other = await (await caches.open(k)).match(url.href, { ignoreVary: true });
      if (other) return answer(other);
    }
    // arquivo do app fora do cache desta versão: da rede; o de uma versão anterior guardada só sem internet
    // (ou se a rede não o tiver mais — tela antiga ainda aberta até o CLEANUP)
    let net = null;
    try { net = await fetch(req); } catch (e) { /* sem internet */ }
    if (net && net.ok) return net;
    const older = await caches.match(url.href, { ignoreVary: true });
    if (older) return answer(older);
    if (!older && req.mode === 'navigate') {
      const idx = await caches.match(new URL('index.html', self.registration.scope).href);
      if (idx) return idx;
    }
    return net || new Response('Offline e arquivo não encontrado no cache.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  })());
});
