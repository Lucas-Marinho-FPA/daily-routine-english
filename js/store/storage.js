// Medição do armazenamento local, por categoria, só com o que dá para medir de fato.
//   • áudios gravados e dados de estudo: somados registro a registro no IndexedDB (store/db.js);
//   • app offline e reconhecimento local: somados arquivo a arquivo na Cache Storage;
//   • uso total: ESTIMATIVA do navegador (navigator.storage.estimate), que inclui dados internos dele
//     (metadados, código compilado guardado junto do cache) — a diferença não é atribuída a nenhuma categoria.
import * as db from './db.js';

async function cachesUsage() {
  const out = { app: 0, asr: 0, other: 0, files: 0 };
  if (!('caches' in globalThis)) return null;
  try {
    for (const name of await caches.keys()) {
      const c = await caches.open(name);
      let bytes = 0;
      for (const req of await c.keys()) {
        const r = await c.match(req);
        if (!r) continue;
        const h = r.headers.get('X-DRG-Size');
        bytes += h ? Number(h) : (await r.blob()).size;
        out.files++;
      }
      if (name.startsWith('drg-')) out.app += bytes; else if (name.startsWith('asr-local-')) out.asr += bytes; else out.other += bytes;
    }
    return out;
  } catch (e) { return null; }
}

export async function storageReport() {
  const [rec, kv, cache] = await Promise.all([db.recordingsUsage(), db.kvUsage(), cachesUsage()]);
  let estimate = null, persisted = null;
  try { estimate = await navigator.storage.estimate(); } catch (e) { /* ok */ }
  try { persisted = await navigator.storage.persisted(); } catch (e) { /* ok */ }
  const study = kv.reduce((n, x) => n + x.bytes, 0);
  const measured = rec.bytes + study + (cache ? cache.app + cache.asr + cache.other : 0);
  return {
    recordings: rec, study, studyKeys: kv, cache, persisted,
    usage: estimate ? estimate.usage : null, quota: estimate ? estimate.quota : null,
    // diferença entre a estimativa do navegador e o que foi somado: não é atribuída a nenhuma categoria
    unattributed: estimate && cache ? Math.max(0, estimate.usage - measured) : null,
  };
}
