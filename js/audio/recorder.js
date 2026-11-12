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

/**
 * Inicia a gravação. Retorna { stop(): Promise<{blob, ms}>, cancel() } ou lança erro com .userMessage.
 * maxMs limita a duração (padrão 3 min). lang: idioma do reconhecimento online; recognize: false = só gravar.
 */
export async function start({ maxMs = 180000, onLevel, lang = 'en-GB', recognize = true } = {}) {
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
  const cleanup = () => {
    if (raf) cancelAnimationFrame(raf);
    if (ctx) ctx.close().catch(() => {});
    stream.getTracks().forEach((t) => t.stop());
  };
  let timer = null;
  const stopped = new Promise((resolve) => {
    rec.onstop = () => {
      cleanup();
      clearTimeout(timer);
      const blob = new Blob(chunks, { type: rec.mimeType || mimeType || 'audio/webm' });
      if (liveCtl) speech.attach(blob, liveCtl.stop()); // o texto online desta gravação (speech.transcribe usa)
      resolve({ blob, ms: Math.round(performance.now() - t0), engine: liveCtl ? 'online' : null });
    };
  });
  rec.start(250);
  const liveCtl = online ? speech.startLive({ lang }) : null; // uma única escuta online por gravação
  timer = setTimeout(() => { if (rec.state !== 'inactive') rec.stop(); }, maxMs);
  return {
    stop: () => { if (rec.state !== 'inactive') rec.stop(); return stopped; },
    cancel: () => { if (liveCtl) liveCtl.cancel(); if (rec.state !== 'inactive') rec.stop(); },
    stopped,
  };
}
