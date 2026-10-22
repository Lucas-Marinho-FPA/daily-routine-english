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
export const sizeLabel = () => `${Math.round(totalBytes() / 1048576)} MB`;

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
    if (!(await caches.has(cacheName()))) return 'not-installed';
    const cache = await caches.open(cacheName());
    for (const f of MANIFEST.files) if (!(await cache.match(new URL(f.path, location.href).href))) return 'not-installed';
    return 'installed';
  } catch (e) { return 'not-installed'; }
}

/**
 * Baixa os arquivos do modelo (do mesmo endereço do app) para o cache local.
 * onProgress(fração 0..1). Arquivos já baixados são reaproveitados (retomável).
 */
export async function install({ onProgress } = {}) {
  const why = unsupportedReason();
  if (why) throw new Error(why);
  const cache = await caches.open(cacheName());
  const total = totalBytes();
  let done = 0;
  for (const f of MANIFEST.files) {
    const url = new URL(f.path, location.href).href;
    if (await cache.match(url)) { done += f.size; onProgress && onProgress(done / total); continue; }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`falha ao baixar ${f.path} (${res.status})`);
    const reader = res.body.getReader();
    const parts = [];
    for (;;) {
      const { done: end, value } = await reader.read();
      if (end) break;
      parts.push(value);
      done += value.byteLength;
      onProgress && onProgress(Math.min(1, done / total));
    }
    const type = res.headers.get('Content-Type') || 'application/octet-stream';
    await cache.put(url, new Response(new Blob(parts, { type }), { headers: { 'Content-Type': type } }));
  }
  // versões antigas do modelo
  for (const k of await caches.keys()) if (k.startsWith(PREFIX) && k !== cacheName()) await caches.delete(k);
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
  worker = new Worker(new URL('asr/worker.js', location.href).href, { type: 'module' });
  worker.onmessage = (e) => {
    const p = pending.get(e.data.id);
    if (!p) return;
    pending.delete(e.data.id);
    clearTimeout(p.timer);
    if (e.data.ok) p.resolve(e.data); else p.reject(new Error(e.data.error || 'falha no reconhecimento'));
  };
  worker.onerror = (e) => { e.preventDefault && e.preventDefault(); failAll(new Error('o reconhecimento local não pôde ser iniciado')); release(); };
  return worker;
}

function failAll(err) {
  for (const [, p] of pending) { clearTimeout(p.timer); p.reject(err); }
  pending.clear();
}

function call(msg, transfer, timeoutMs) {
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('tempo esgotado')); release(); }, timeoutMs);
    pending.set(id, { resolve, reject, timer });
    w.postMessage({ ...msg, id }, transfer || []);
  });
}

/** Encerra o worker e libera a memória do modelo (ao sair da tela). Transcrições pendentes são rejeitadas. */
export function release() {
  if (worker) { worker.terminate(); worker = null; }
  failAll(new Error('cancelado'));
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
  const pcm = await toPcm16k(blob);
  const secs = pcm.length / 16000;
  if (secs > MAX_SECONDS) throw new Error(`gravação longa demais para o reconhecimento local (máx. ${MAX_SECONDS} s)`);
  const res = await call({ type: 'transcribe', pcm }, [pcm.buffer], 60000 + secs * 4000);
  return { text: res.text, confidence: 0, engine: 'local-model', ms: res.ms };
}
