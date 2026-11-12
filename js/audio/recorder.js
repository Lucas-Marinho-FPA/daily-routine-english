// Gravação da própria voz (MediaRecorder). A permissão do microfone só é pedida no primeiro toque em “Gravar”.
// Modo ONLINE (Ajustes → Áudio): NÃO grava — a tentativa é do reconhecimento do navegador, que fica sozinho com o
// microfone (speech.listen; no Chrome Android duas capturas simultâneas deixam o reconhecedor em silêncio).
// Modo MOONSHINE: grava; a gravação é a fonte de tudo (ouvir, ritmo, guardar e o reconhecimento do aparelho).
import * as speech from './speech.js';

export const supported = () => !!(globalThis.navigator && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && globalThis.MediaRecorder);

function pickMime() {
  const opts = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return opts.find((m) => MediaRecorder.isTypeSupported(m)) || '';
}

export async function permissionState() {
  try { return (await navigator.permissions.query({ name: 'microphone' })).state; } catch (e) { return 'unknown'; }
}

// ---------- fim de fala automático (detecção de atividade de voz, no próprio aparelho) ----------
// Parâmetros iniciais (ajustáveis por tela): só encerra depois de FALA (≥ minSpeechMs de voz acumulada) seguida de
// silêncio contínuo ≥ silenceMs. Pausas curtas e hesitações zeram o silêncio; sem fala nenhuma, nunca encerra sozinho
// (vale o limite de segurança maxMs). No modo online, a mesma regra (silenceMs depois de fala) é aplicada pelo
// speech.listen sobre os eventos do reconhecimento (não há nível de microfone: o microfone é do reconhecedor).
export const ENDPOINT = { silenceMs: 1800, minSpeechMs: 300, stepMs: 50 };

/** Acompanha o nível do microfone e chama onEnd() no fim da fala. Retorna { stop() }. */
export function endpointer(stream, { silenceMs = ENDPOINT.silenceMs, minSpeechMs = ENDPOINT.minSpeechMs, onSpeech, onEnd } = {}) {
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return { stop() {} };
  let ctx;
  try { ctx = new AC(); } catch (e) { return { stop() {} }; }
  if (ctx.state === 'suspended' && ctx.resume) ctx.resume().catch(() => {});
  const an = ctx.createAnalyser();
  an.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(an);
  const buf = new Float32Array(an.fftSize);
  const step = ENDPOINT.stepMs;
  let noise = null, voiced = 0, silence = 0, speaking = false, done = false, recent = [];
  const timer = setInterval(() => {
    an.getFloatTimeDomainData(buf);
    let sum = 0; for (const v of buf) sum += v * v;
    const rms = Math.sqrt(sum / buf.length);
    // piso de ruído: mínimo da média recente (~300 ms), que só sobe devagar — a fala não vira “ruído”
    recent.push(rms); if (recent.length > 6) recent.shift();
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    noise = noise === null ? avg : Math.min(avg, noise * 1.002 + 1e-5);
    const voice = rms > Math.max(0.012, noise * 3);
    if (voice) {
      voiced += step; silence = 0;
      if (!speaking && voiced >= minSpeechMs) { speaking = true; if (onSpeech) onSpeech(); }
    } else if (speaking) {
      silence += step;
      if (silence >= silenceMs && !done) { done = true; stop(); if (onEnd) onEnd(); }
    }
  }, step);
  function stop() { clearInterval(timer); ctx.close().catch(() => {}); }
  return { stop };
}

/**
 * Inicia a gravação (ou, no modo online, a tentativa do reconhecimento). Retorna { stop(): Promise<{blob, ms}>,
 * cancel(), stopped } ou lança erro com .userMessage. maxMs limita a duração (padrão 3 min; também é o limite de
 * segurança do fim automático). lang: idioma do reconhecimento online; recognize: false = só gravar. autoStop (padrão
 * true): encerra sozinho no fim da fala (silenceMs de silêncio depois de falar); o toque em Parar continua valendo.
 * No modo online o blob devolvido não tem áudio (speech.isOnlineCapture(blob)); leva a transcrição da tentativa.
 */
export async function start({ maxMs = 180000, onLevel, lang = 'en-GB', recognize = true, autoStop = true, silenceMs = ENDPOINT.silenceMs, source = null } = {}) {
  const online = recognize ? await speech.prepareOnline() : false; // modo online (ou consentimento, uma vez)
  if (online) return speech.listen({ lang, maxMs, silenceMs: autoStop ? silenceMs : null, onLevel, source });
  if (!supported()) {
    const e = new Error('unsupported');
    e.userMessage = 'Este navegador não oferece gravação de áudio neste modo de execução.';
    throw e;
  }
  const log = speech.logRecording({ source });
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (err) {
    log.fail(err.name);
    const e = new Error(err.name);
    e.userMessage = err.name === 'NotAllowedError'
      ? 'O microfone foi bloqueado. No Chrome: toque no cadeado ao lado do endereço → Permissões → Microfone → Permitir. Depois tente de novo.'
      : err.name === 'NotFoundError' ? 'Nenhum microfone encontrado.' : `Não foi possível acessar o microfone (${err.name}).`;
    throw e;
  }
  log.mark('microfone aberto');
  const mimeType = pickMime();
  const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  rec.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
  const t0 = performance.now();

  // medidor de nível (opcional)
  let raf = null, ctx = null;
  if (onLevel && (globalThis.AudioContext || globalThis.webkitAudioContext)) {
    ctx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    src.connect(an);
    const buf = new Uint8Array(an.fftSize);
    const loop = () => {
      an.getByteTimeDomainData(buf);
      let s = 0; for (const v of buf) s += ((v - 128) / 128) ** 2;
      onLevel(Math.min(1, Math.sqrt(s / buf.length) * 4));
      raf = requestAnimationFrame(loop);
    };
    loop();
  }
  let ep = null, cancelled = false;
  const cleanup = () => {
    if (ep) ep.stop();
    if (raf) cancelAnimationFrame(raf);
    if (ctx) ctx.close().catch(() => {});
    stream.getTracks().forEach((t) => t.stop());
  };
  let timer = null;
  const stopped = new Promise((resolve) => {
    rec.onstop = () => {
      clearTimeout(timer);
      cleanup();
      const blob = new Blob(chunks, { type: rec.mimeType || mimeType || 'audio/webm' });
      const ms = Math.round(performance.now() - t0);
      log.done(blob, ms, cancelled);
      resolve({ blob, ms, engine: null, audio: true });
    };
  });
  rec.start(250);
  timer = setTimeout(() => { log.mark('limite de segurança'); if (rec.state !== 'inactive') rec.stop(); }, maxMs);
  if (autoStop) {
    ep = endpointer(stream, { silenceMs,
      onSpeech: () => log.mark('fala detectada'),
      onEnd: () => { log.mark(`fim de fala (silêncio ${silenceMs / 1000} s)`); if (rec.state !== 'inactive') rec.stop(); } });
  }
  return {
    stop: () => { if (rec.state !== 'inactive') { log.mark('parar (toque)'); rec.stop(); } return stopped; },
    cancel: () => { cancelled = true; if (rec.state !== 'inactive') rec.stop(); },
    stopped,
  };
}
