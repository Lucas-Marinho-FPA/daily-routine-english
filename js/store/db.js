// Persistência local. Estado do usuário = um único registro JSON (gravação atômica) no IndexedDB;
// gravações de voz = Blobs em store separado. Se o IndexedDB falhar (ex.: file:// restrito),
// usa localStorage para o estado e desativa a persistência de gravações (avisando na interface).
import { freshState, migrate } from '../engine/progress.js';

const DB_NAME = 'drg';
const DB_VERSION = 1;
const LS_KEY = 'drg.state';

let dbPromise = null;
export let backend = 'none';

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('IndexedDB indisponível'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('recordings')) db.createObjectStore('recordings');
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
  try { await tx('recordings', 'readwrite', (s) => { s.clear(); }); } catch (e) { /* ok */ }
  try { localStorage.removeItem(LS_KEY); } catch (e) { /* ok */ }
}

// ---------- gravações ----------
export async function putRecording(id, blob, meta) {
  if (backend !== 'indexeddb') throw new Error('Gravações não podem ser salvas neste modo de execução');
  return tx('recordings', 'readwrite', (s) => s.put({ blob, meta, at: Date.now() }, id));
}
export async function getRecording(id) {
  try { return await tx('recordings', 'readonly', (s) => reqP(s.get(id))); } catch (e) { return null; }
}
export async function deleteRecording(id) {
  try { await tx('recordings', 'readwrite', (s) => { s.delete(id); }); } catch (e) { /* ok */ }
}
export async function recordingsUsage() {
  try {
    return await tx('recordings', 'readonly', (s) => reqP(s.getAll()).then((all) => ({ count: all.length, bytes: all.reduce((n, r) => n + (r.blob ? r.blob.size : 0), 0) })));
  } catch (e) { return { count: 0, bytes: 0 }; }
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
