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
//   4. CLEANUP  — o app, já carregado com sucesso na versão nova, pede a limpeza: só então os caches drg- antigos são
//                 apagados. O cache do reconhecimento de fala (asr-local-…) nunca é tocado aqui.
// Na primeira instalação (sem versão anterior) não há espera: o app passa a funcionar offline logo após o 1º acesso.
const VERSION = '__VERSION__';
const CACHE = `drg-${VERSION}`;
const FILES = __FILES__;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      // em lotes, para não estourar conexões simultâneas; sempre da rede (nunca de um cache HTTP antigo)
      for (let i = 0; i < FILES.length; i += 40) await cache.addAll(FILES.slice(i, i + 40).map((f) => new Request(f, { cache: 'reload' })));
    } catch (e) {
      await caches.delete(CACHE); // nada de versão pela metade
      throw e;
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // o cache anterior fica até o app confirmar que a versão nova abriu (CLEANUP)
});

self.addEventListener('message', (event) => {
  const msg = event.data || {};
  if (msg.type === 'SKIP_WAITING') self.skipWaiting(); // só a pedido do aluno (“Atualizar agora”)
  if (msg.type === 'VERSION' && event.ports[0]) event.ports[0].postMessage({ version: VERSION });
  if (msg.type === 'CLEANUP') {
    event.waitUntil((async () => {
      const keys = await caches.keys();
      const old = keys.filter((k) => k.startsWith('drg-') && k !== CACHE);
      await Promise.all(old.map((k) => caches.delete(k)));
      if (event.ports[0]) event.ports[0].postMessage({ version: VERSION, removed: old });
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
    let hit = await cache.match(url.href, { ignoreVary: true });
    // fora do cache desta versão: reconhecimento de fala (cache próprio “asr-local-…”, baixado sob demanda) ou arquivo
    // de uma versão anterior ainda guardada (tela antiga aberta até o CLEANUP)
    if (!hit) hit = await caches.match(url.href, { ignoreVary: true });
    if (!hit && req.mode === 'navigate') hit = await cache.match(new URL('index.html', self.registration.scope).href);
    if (hit) return req.headers.get('range') ? rangeResponse(req, hit) : hit;
    try {
      return await fetch(req);
    } catch (e) {
      return new Response('Offline e arquivo não encontrado no cache.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
