// Reconhecimento de fala LOCAL e opcional (Moonshine tiny via onnxruntime-web, num worker).
// Por quê: o Chrome para Android não oferece o reconhecimento “no aparelho” da Web Speech API
// (só o modo online, que envia a voz ao Google e por isso nunca é usado aqui).
// Como funciona: o aluno pede o download (≈ 40 MB, uma vez, do próprio endereço do app); os arquivos
// ficam num cache separado e passam a funcionar offline. A transcrição roda DEPOIS da gravação, sobre o
// áudio gravado, então não disputa o microfone com o MediaRecorder. Nenhum áudio sai do aparelho.

/* global __ASR_MANIFEST__ */
const MANIFEST = typeof __ASR_MANIFEST__ !== 'undefined' ? __ASR_MANIFEST__ : null;
const PREFIX = 'asr-local-'; // não começa com "drg-": o service worker não apaga este cache ao atualizar o app
const cacheName = () => PREFIX + MANIFEST.version;
export const MAX_SECONDS = 30; // o modelo foi treinado com trechos curtos; acima disso a transcrição piora
export const totalBytes = () => (MANIFEST ? MANIFEST.files.reduce((n, f) => n + f.size, 0) : 0);
let missingBytes = null; // calculado por status(): o que ainda falta baixar (menos que o total após uma atualização do app)
/** Bytes que o download vai realmente buscar. */
export const downloadBytes = () => (missingBytes === null ? totalBytes() : missingBytes);
export const sizeLabel = () => `${Math.max(1, Math.round(downloadBytes() / 1048576))} MB`;

/** Motivo de não suportar (texto) ou '' quando o aparelho/navegador suporta. */
export function unsupportedReason() {
  if (!MANIFEST) return 'pacote de reconhecimento ausente nesta versão';
  if (!/^https?:$/.test(globalThis.location ? location.protocol : '')) return 'precisa abrir o app pelo endereço (não como arquivo)';
  if (!('caches' in globalThis)) return 'armazenamento offline (Cache) indisponível';
  if (typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') return 'WebAssembly/Worker indisponível';
  if (typeof OfflineAudioContext === 'undefined' && typeof webkitOfflineAudioContext === 'undefined') return 'decodificação de áudio indisponível';
  return '';
}

/** 'unsupported' | 'not-installed' | 'installed' */
export async function status() {
  if (unsupportedReason()) return 'unsupported';
  try {
    const cache = await caches.open(cacheName());
    let missing = 0;
    for (const f of MANIFEST.files) {
      const url = new URL(f.path, location.href).href;
      if (await cache.match(url)) continue;
      if (await migrate(cache, f, url)) continue;
      missing += f.size;
    }
    missingBytes = missing;
    if (missing) return 'not-installed';
    await dropOldCaches();
    return 'installed';
  } catch (e) { return 'not-installed'; }
}

/**
 * Atualização do app: copia de um cache de versão anterior um arquivo IDÊNTICO ao atual
 * (mesmo sha; instalações antigas sem sha: mesmo tamanho). Local, sem rede.
 */
async function migrate(cache, f, url) {
  for (const k of await caches.keys()) {
    if (!k.startsWith(PREFIX) || k === cacheName()) continue;
    const old = await caches.open(k);
    const hit = await old.match(url);
    if (!hit) continue;
    const sha = hit.headers.get('X-DRG-Sha');
    if (sha ? sha !== f.sha : (await cachedSize(hit.clone())) !== f.size) continue;
    const body = await hit.blob();
    await cache.put(url, new Response(body, { headers: { 'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream', 'X-DRG-Size': String(body.size), 'X-DRG-Sha': f.sha } }));
    return true;
  }
  return false;
}

async function dropOldCaches() {
  for (const k of await caches.keys()) if (k.startsWith(PREFIX) && k !== cacheName()) await caches.delete(k);
}

// tamanho de um arquivo no cache (cabeçalho gravado na instalação; versões antigas: lê o corpo)
async function cachedSize(hit) {
  const h = hit.headers.get('X-DRG-Size');
  return h ? Number(h) : (await hit.blob()).size;
}

/** Confere se todos os arquivos estão no cache com o tamanho esperado. { ok, missing[], damaged[] } */
export async function verify() {
  if (unsupportedReason()) return { ok: false, missing: [], damaged: [], unsupported: true };
  const cache = await caches.open(cacheName());
  const missing = [], damaged = [];
  for (const f of MANIFEST.files) {
    const hit = await cache.match(new URL(f.path, location.href).href);
    if (!hit) missing.push(f.path);
    else if ((await cachedSize(hit)) !== f.size) damaged.push(f.path);
  }
  return { ok: !missing.length && !damaged.length, missing, damaged };
}

/**
 * Baixa os arquivos do modelo (do mesmo endereço do app) para o cache local.
 * onProgress(fração 0..1, bytes, total). Arquivos já baixados e íntegros são reaproveitados (retomável);
 * arquivos incompletos ou corrompidos são baixados de novo.
 */
export async function install({ onProgress } = {}) {
  const why = unsupportedReason();
  if (why) throw new Error(why);
  release(); // um worker antigo poderia estar com arquivos inválidos carregados
  const cache = await caches.open(cacheName());
  // só o que falta conta no progresso (arquivos já presentes ou reaproveitados de uma versão anterior)
  const todo = [];
  for (const f of MANIFEST.files) {
    const url = new URL(f.path, location.href).href;
    const hit = await cache.match(url);
    if (hit && (await cachedSize(hit)) === f.size) continue;
    if (hit) await cache.delete(url);
    if (await migrate(cache, f, url)) continue;
    todo.push(f);
  }
  const total = todo.reduce((n, f) => n + f.size, 0) || 1;
  let done = 0;
  const report = () => onProgress && onProgress(Math.min(1, done / total), done, total);
  report();
  for (const f of todo) {
    const url = new URL(f.path, location.href).href;
    const res = await fetch(url, { cache: 'no-store', headers: { 'X-DRG-Download': '1' } }); // o service worker não responde do cache
    if (!res.ok) throw new Error(`falha ao baixar ${f.path} (${res.status})`);
    const reader = res.body.getReader();
    const parts = [];
    for (;;) {
      const { done: end, value } = await reader.read();
      if (end) break;
      parts.push(value);
      done += value.byteLength;
      report();
    }
    const type = res.headers.get('Content-Type') || 'application/octet-stream';
    const body = new Blob(parts, { type });
    if (body.size !== f.size) throw new Error(`arquivo incompleto: ${f.path}`);
    await cache.put(url, new Response(body, { headers: { 'Content-Type': type, 'X-DRG-Size': String(body.size), 'X-DRG-Sha': f.sha } }));
  }
  missingBytes = 0;
  await dropOldCaches(); // versões antigas do modelo
  return true;
}

/** Remove o modelo do aparelho (libera o espaço). */
export async function remove() {
  release();
  for (const k of await caches.keys()) if (k.startsWith(PREFIX)) await caches.delete(k);
}

// ---------- worker ----------
let worker = null, seq = 0;
const pending = new Map();

function getWorker() {
  if (worker) return worker;
  try { worker = new Worker(new URL('asr/worker.js', location.href).href, { type: 'module' }); } catch (e) { throw asrError(`o reconhecimento local não pôde ser iniciado (${e.message})`, 'load'); }
  worker.onmessage = (e) => {
    const p = pending.get(e.data.id);
    if (!p) return;
    pending.delete(e.data.id);
    clearTimeout(p.timer);
    if (e.data.ok) p.resolve(e.data); else p.reject(asrError(e.data.error || 'falha no reconhecimento', e.data.stage === 'load' ? 'load' : 'run'));
  };
  worker.onerror = (e) => { e.preventDefault && e.preventDefault(); failAll(asrError('o reconhecimento local não pôde ser iniciado', 'load')); release(); };
  return worker;
}

/**
 * Erro com código para a interface escolher a recuperação:
 * 'load' (modelo não carregou: verificar/reinstalar), 'run' (falha nesta gravação), 'timeout',
 * 'decode' (áudio ilegível), 'too-long', 'cancelled' (tela fechada ou nova gravação).
 */
function asrError(message, code) { const e = new Error(message); e.code = code; return e; }

function failAll(err) {
  for (const [, p] of pending) { clearTimeout(p.timer); p.reject(err); }
  pending.clear();
}

function call(msg, transfer, timeoutMs) {
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(asrError('tempo esgotado', 'timeout')); release(); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    w.postMessage({ ...msg, id }, transfer || []);
  });
}

/** Há uma transcrição em andamento? */
export const busy = () => pending.size > 0;

/** Encerra o worker e libera a memória do modelo (ao sair da tela). Transcrições pendentes são rejeitadas. */
export function release() {
  if (worker) { worker.terminate(); worker = null; }
  failAll(asrError('cancelado', 'cancelled'));
}

/** Decodifica a gravação e converte para 16 kHz mono (formato do modelo). */
export async function toPcm16k(blob) {
  const Ctx = globalThis.OfflineAudioContext || globalThis.webkitOfflineAudioContext;
  const data = await blob.arrayBuffer();
  const probe = new Ctx(1, 1, 16000);
  const decoded = await probe.decodeAudioData(data); // já reamostrado para 16 kHz
  const n = decoded.length;
  if (decoded.numberOfChannels === 1) return decoded.getChannelData(0).slice();
  const out = new Float32Array(n);
  for (let c = 0; c < decoded.numberOfChannels; c++) { const ch = decoded.getChannelData(c); for (let i = 0; i < n; i++) out[i] += ch[i] / decoded.numberOfChannels; }
  return out;
}

/**
 * Transcreve uma gravação. Resolve { text, confidence: 0, engine, ms } — o modelo não informa confiança
 * (0 = “sem informação”, nunca “confiança baixa”). Rejeita com mensagem em caso de falha.
 */
export async function transcribe(blob) {
  let pcm;
  try { pcm = await toPcm16k(blob); } catch (e) { throw asrError('não foi possível ler o áudio gravado', 'decode'); }
  const secs = pcm.length / 16000;
  if (secs > MAX_SECONDS) throw asrError(`gravação longa demais para a análise (máx. ${MAX_SECONDS} s)`, 'too-long');
  const res = await call({ type: 'transcribe', pcm }, [pcm.buffer], 60000 + secs * 4000);
  return { text: res.text, confidence: 0, engine: 'local-model', ms: res.ms };
}
