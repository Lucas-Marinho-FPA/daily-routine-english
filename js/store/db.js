// Persistência local. Estado do usuário = um único registro JSON (gravação atômica) no IndexedDB.
// Gravações (esquema 2):
//   store 'audio'      → { blob, bytes, type, recordedAt }      (só o áudio; apagado pela retenção de 7 dias)
//   store 'recordings' → { meta, recordedAt, at, audio: bool, audioExpiredAt? }  (transcrição, análise, etc.)
// Ambos usam a mesma chave: o exercício (ex.: “sent:R01-B1-S1”, “q:G.Q01”). Regravar substitui os dois
// numa única transação: se algo falhar, a gravação anterior fica intacta.
// Se o IndexedDB falhar (ex.: file:// restrito), usa localStorage para o estado e desativa as gravações.
import { freshState, migrate } from '../engine/progress.js';
import { retentionStatus, RETENTION_MS } from '../engine/retention.js';

const DB_NAME = 'drg';
const DB_VERSION = 2;
const LS_KEY = 'drg.state';

let dbPromise = null;
export let backend = 'none';

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('IndexedDB indisponível'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (ev) => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('recordings')) db.createObjectStore('recordings');
      if (!db.objectStoreNames.contains('audio')) db.createObjectStore('audio');
      // v1 → v2: separa o áudio dos dados de texto, sem perder nada (na mesma transação de atualização)
      if (ev.oldVersion >= 1 && ev.oldVersion < 2) {
        const t = req.transaction;
        const recs = t.objectStore('recordings'), audio = t.objectStore('audio');
        recs.openCursor().onsuccess = (e) => {
          const cur = e.target.result;
          if (!cur) return;
          const v = cur.value || {};
          if (v.blob instanceof Blob) {
            // data da gravação: o `at` da v1 (que também mudava ao guardar a transcrição: estimativa conservadora)
            const recordedAt = typeof v.at === 'number' ? v.at : null;
            audio.put({ blob: v.blob, bytes: v.blob.size, type: v.blob.type, recordedAt }, cur.key);
            cur.update({ meta: v.meta || null, recordedAt, at: v.at || null, audio: true, migratedFrom: 1 });
          }
          cur.continue();
        };
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB bloqueado'));
  });
  return dbPromise;
}

function tx(store, mode, fn) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    let out;
    Promise.resolve(fn(t.objectStore(store))).then((r) => { out = r; });
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error('transação abortada'));
  }));
}
const reqP = (r) => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

/** Carrega o estado (migrando se preciso). Nunca lança: em último caso começa do zero e informa. */
export async function loadState(contentVersion) {
  let raw = null;
  let problem = null;
  try {
    raw = await tx('kv', 'readonly', (s) => reqP(s.get('state')));
    backend = 'indexeddb';
  } catch (e) {
    backend = 'localstorage';
    try { raw = JSON.parse(localStorage.getItem(LS_KEY) || 'null'); } catch (e2) { problem = 'Não foi possível ler o progresso salvo.'; }
  }
  if (!raw) return { state: freshState(contentVersion), isNew: true, problem };
  try {
    const state = migrate(raw, contentVersion);
    if (raw.contentVersion !== contentVersion || raw.schema !== state.schema) await saveCopy('state.prev', raw);
    if (state._repairs) {
      await saveCopy('state.corrupt', raw);
      problem = `Parte do progresso salvo estava danificada (${state._repairs.join(', ')}) e foi reparada; uma cópia do original foi guardada. Se tiver backup recente, você pode importá-lo em Ajustes.`;
    }
    return { state, isNew: false, problem };
  } catch (e) {
    await saveCopy('state.corrupt', raw);
    return { state: freshState(contentVersion), isNew: true, problem: 'O progresso salvo estava inválido e foi guardado à parte; um novo progresso foi iniciado. Se tiver backup, importe-o em Ajustes.' };
  }
}

async function saveCopy(key, value) {
  try { await tx('kv', 'readwrite', (s) => s.put(value, key)); } catch (e) { /* sem IndexedDB: ignora cópia */ }
}

let pending = null;
let saving = Promise.resolve();
/** Salva já (retorna promessa). */
export function saveState(state) {
  state.updatedAt = Date.now();
  const snapshot = JSON.parse(JSON.stringify(state));
  saving = saving.then(async () => {
    if (backend === 'indexeddb') {
      try { await tx('kv', 'readwrite', (s) => s.put(snapshot, 'state')); return; } catch (e) { backend = 'localstorage'; }
    }
    localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
  }).catch((e) => { console.error('Falha ao salvar', e); throw e; });
  return saving;
}
/** Salva com atraso curto (agrupa várias mudanças). */
export function saveSoon(state) {
  clearTimeout(pending);
  pending = setTimeout(() => saveState(state), 400);
}
export function flush(state) { clearTimeout(pending); return saveState(state); }

export async function wipeState() {
  try { await tx('kv', 'readwrite', (s) => { s.delete('state'); }); } catch (e) { /* ok */ }
  try { await txs(['audio', 'recordings'], 'readwrite', (a, r) => { a.clear(); r.clear(); }); } catch (e) { /* ok */ }
  try { localStorage.removeItem(LS_KEY); } catch (e) { /* ok */ }
}

// ---------- gravações ----------
const txs = (stores, mode, fn) => openDb().then((db) => new Promise((resolve, reject) => {
  const t = db.transaction(stores, mode);
  let out;
  let ret;
  // qualquer erro no meio desfaz a transação inteira (ex.: áudio novo gravado, registro não): nada muda
  try { ret = fn(...stores.map((n) => t.objectStore(n))); } catch (e) { try { t.abort(); } catch (e2) { /* já encerrada */ } reject(e); return; }
  Promise.resolve(ret).then((r) => { out = r; });
  t.oncomplete = () => resolve(out);
  t.onerror = () => reject(t.error);
  t.onabort = () => reject(t.error || new Error('transação abortada'));
}));

/**
 * Salva (ou SUBSTITUI) a gravação de um exercício: áudio e registro na mesma transação.
 * Só depois de confirmada a gravação nova o áudio anterior deixa de existir; se falhar, nada muda.
 */
export async function putRecording(id, blob, meta, { now = Date.now() } = {}) {
  if (backend !== 'indexeddb') throw new Error('Gravações não podem ser salvas neste modo de execução');
  return txs(['audio', 'recordings'], 'readwrite', (audio, recs) => {
    audio.put({ blob, bytes: blob.size, type: blob.type, recordedAt: now }, id);
    recs.put({ meta: meta || null, recordedAt: now, at: now, audio: true }, id);
  });
}

/** Atualiza só os dados de texto (transcrição, resultado) sem regravar o áudio nem mudar a data. */
export async function updateRecordingMeta(id, patch) {
  if (backend !== 'indexeddb') return;
  return txs(['recordings'], 'readwrite', (recs) => new Promise((res) => {
    const r = recs.get(id);
    r.onsuccess = () => { if (r.result) recs.put({ ...r.result, meta: { ...(r.result.meta || {}), ...patch } }, id); res(); };
    r.onerror = () => res();
  }));
}

/** { blob|null, meta, at, recordedAt, audioExpiredAt? } — blob null quando o áudio já foi apagado pela retenção. */
export async function getRecording(id) {
  try {
    return await txs(['audio', 'recordings'], 'readonly', (audio, recs) => Promise.all([reqP(audio.get(id)), reqP(recs.get(id))]).then(([a, r]) => {
      if (!r && !a) return null;
      return { blob: a ? a.blob : null, meta: r ? r.meta : null, at: (a && a.recordedAt) || (r && r.recordedAt) || null, recordedAt: (a && a.recordedAt) || (r && r.recordedAt) || null, audioExpiredAt: r && r.audioExpiredAt ? r.audioExpiredAt : null };
    }));
  } catch (e) { return null; }
}

/** Exclusão pedida pelo aluno: apaga o áudio e o resultado DAQUELE exercício (nenhum outro é tocado). */
export async function deleteRecording(id) {
  try { await txs(['audio', 'recordings'], 'readwrite', (audio, recs) => { audio.delete(id); recs.delete(id); }); } catch (e) { /* ok */ }
}

/** Áudios guardados (quantidade e bytes) e registros só de texto (áudio já apagado pela retenção). */
export async function recordingsUsage() {
  try {
    return await txs(['audio', 'recordings'], 'readonly', (audio, recs) =>
      Promise.all([reqP(audio.getAll()), reqP(audio.getAllKeys()), reqP(recs.getAllKeys())]).then(([all, aKeys, rKeys]) => {
        const withAudio = new Set(aKeys);
        return { count: all.length, bytes: all.reduce((n, a) => n + (a && a.blob ? a.blob.size : 0), 0), textOnly: rKeys.filter((k) => !withAudio.has(k)).length };
      }));
  } catch (e) { return { count: 0, bytes: 0, textOnly: 0 }; }
}

/**
 * Retenção de 7 dias: apaga os ÁUDIOS vencidos e mantém o registro de texto (transcrição/análise).
 * Idempotente (rodar de novo não faz nada); datas inválidas não apagam nada e ficam em kv 'diag.retention'.
 * Nunca lança: uma falha aqui não pode impedir o uso do app.
 */
export async function pruneRecordings({ now = Date.now() } = {}) {
  const report = { checked: 0, removed: [], invalid: [], bytesFreed: 0 };
  if (backend !== 'indexeddb') return report;
  try {
    await txs(['audio', 'recordings', 'kv'], 'readwrite', (audio, recs, kv) => new Promise((res) => {
      const cur = audio.openCursor();
      cur.onsuccess = () => {
        const c = cur.result;
        if (!c) {
          if (report.invalid.length) kv.put({ at: now, items: report.invalid }, 'diag.retention');
          return res();
        }
        report.checked++;
        const v = c.value || {};
        const st = retentionStatus(v.recordedAt, now);
        if (st === 'expire') {
          report.removed.push(c.key);
          report.bytesFreed += v.blob ? v.blob.size : 0;
          const key = c.key;
          c.delete();
          const g = recs.get(key);
          g.onsuccess = () => { const r = g.result || { meta: null, recordedAt: v.recordedAt, at: v.recordedAt }; recs.put({ ...r, audio: false, audioExpiredAt: now }, key); };
        } else if (st === 'invalid') {
          report.invalid.push({ key: c.key, recordedAt: v.recordedAt === undefined ? null : v.recordedAt });
        }
        c.continue();
      };
      cur.onerror = () => res();
    }));
  } catch (e) { report.error = e.message; }
  return report;
}
export { RETENTION_MS };

/** Tamanho (aprox.) dos dados de estudo no IndexedDB: estado e cópias de segurança (JSON). */
export async function kvUsage() {
  try {
    return await txs(['kv'], 'readonly', (kv) => Promise.all([reqP(kv.getAllKeys()), reqP(kv.getAll())]).then(([keys, vals]) =>
      keys.map((k, i) => ({ key: k, bytes: new Blob([JSON.stringify(vals[i])]).size }))));
  } catch (e) { return []; }
}

// ---------- backup ----------
export function exportBackup(state) {
  const data = { app: 'daily-routine-english-game', schema: state.schema, exportedAt: new Date().toISOString(), state };
  return new Blob([JSON.stringify(data)], { type: 'application/json' });
}
/** Valida o arquivo de backup; retorna o estado migrado (não salva). */
export async function parseBackup(file, contentVersion) {
  const text = await file.text();
  let data;
  try { data = JSON.parse(text); } catch (e) { throw new Error('O arquivo não é um JSON válido.'); }
  if (data.app !== 'daily-routine-english-game' || !data.state) throw new Error('Este arquivo não é um backup deste app.');
  return migrate(data.state, contentVersion);
}
export async function keepPrevious(state) { await saveCopy('state.beforeImport', JSON.parse(JSON.stringify(state))); }

export async function requestPersistence() {
  try {
    if (navigator.storage && navigator.storage.persisted && await navigator.storage.persisted()) return true;
    if (navigator.storage && navigator.storage.persist) return await navigator.storage.persist();
  } catch (e) { /* ok */ }
  return false;
}
