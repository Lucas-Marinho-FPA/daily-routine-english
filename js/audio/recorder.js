// Gravação da própria voz (MediaRecorder). A permissão do microfone só é pedida no primeiro toque em “Gravar”.
// Junto com a gravação, o motor de fala central (speech.js) pode ouvir online pelo navegador; a gravação continua
// sendo a fonte de tudo (ouvir, ritmo, guardar e o reconhecimento do aparelho quando o online não atende).
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
// (vale o limite de segurança maxMs). Não depende do reconhecedor: vale igual para o online e para o Moonshine.
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
 * Inicia a gravação. Retorna { stop(): Promise<{blob, ms}>, cancel() } ou lança erro com .userMessage.
 * maxMs limita a duração (padrão 3 min; também é o limite de segurança do fim automático). lang: idioma do
 * reconhecimento online; recognize: false = só gravar. autoStop (padrão true): encerra sozinho no fim da fala
 * (silenceMs de silêncio depois de falar); o toque em Parar continua valendo.
 */
export async function start({ maxMs = 180000, onLevel, lang = 'en-GB', recognize = true, autoStop = true, silenceMs = ENDPOINT.silenceMs } = {}) {
  if (!supported()) {
    const e = new Error('unsupported');
    e.userMessage = 'Este navegador não oferece gravação de áudio neste modo de execução.';
    throw e;
  }
  const online = recognize ? await speech.prepareOnline() : false; // consentimento (uma vez) antes do microfone
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  } catch (err) {
    const e = new Error(err.name);
    e.userMessage = err.name === 'NotAllowedError'
      ? 'O microfone foi bloqueado. No Chrome: toque no cadeado ao lado do endereço → Permissões → Microfone → Permitir. Depois tente de novo.'
      : err.name === 'NotFoundError' ? 'Nenhum microfone encontrado.' : `Não foi possível acessar o microfone (${err.name}).`;
    throw e;
  }
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
  let ep = null;
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
      const blob = new Blob(chunks, { type: rec.mimeType || mimeType || 'audio/webm' });
      if (liveCtl) {
        // primeiro pede o fim do online (ele ainda pode estar processando a faixa); o microfone só fecha depois
        const res = liveCtl.stop();
        speech.attach(blob, res); // o texto online desta gravação (speech.transcribe usa)
        res.finally(cleanup);
      } else cleanup();
      resolve({ blob, ms: Math.round(performance.now() - t0), engine: liveCtl ? 'online' : null });
    };
  });
  rec.start(250);
  // uma única escuta online por gravação, sobre a MESMA faixa do microfone (sem segunda captura)
  const liveCtl = online ? speech.startLive({ lang, track: stream.getAudioTracks()[0] || null }) : null;
  timer = setTimeout(() => { if (liveCtl) liveCtl.mark('limite de segurança'); if (rec.state !== 'inactive') rec.stop(); }, maxMs);
  if (autoStop) {
    ep = endpointer(stream, { silenceMs,
      onSpeech: () => { if (liveCtl) liveCtl.mark('fala detectada'); },
      onEnd: () => { if (liveCtl) liveCtl.mark('fim de fala (silêncio)'); if (rec.state !== 'inactive') rec.stop(); } });
  }
  return {
    stop: () => { if (rec.state !== 'inactive') rec.stop(); return stopped; },
    cancel: () => { if (liveCtl) liveCtl.cancel(); if (rec.state !== 'inactive') rec.stop(); },
    stopped,
  };
}
