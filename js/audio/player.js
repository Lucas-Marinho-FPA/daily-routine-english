// Reprodução de áudio de referência.
// 1ª opção: áudio britânico embutido (app/audio/<chave>.ogg, gerado offline).
// 2ª opção: voz do sistema (speechSynthesis), preferindo en-GB local.
// Sem nenhuma das duas, o chamador recebe { ok:false } e mostra o aviso.

const files = () => (globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.files) || {};
let settings = { audioSource: 'embedded', voiceURI: '', rate: 1 };
let current = null; // { audio?, cancel() }
let voices = [];
const listeners = new Set();

export function configure(s) { settings = { ...settings, ...s }; }
export const hasEmbedded = (key) => !!key && key in files();
export const embeddedCount = () => Object.keys(files()).length;
export const onState = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
const emit = (st) => listeners.forEach((fn) => fn(st));

export function loadVoices() {
  if (!('speechSynthesis' in globalThis)) return Promise.resolve([]);
  return new Promise((resolve) => {
    const done = () => { voices = speechSynthesis.getVoices(); resolve(voices); };
    const v = speechSynthesis.getVoices();
    if (v.length) { voices = v; return resolve(v); }
    speechSynthesis.addEventListener('voiceschanged', done, { once: true });
    setTimeout(done, 2000);
  });
}
export const englishVoices = () => voices.filter((v) => /^en[-_]/i.test(v.lang))
  .sort((a, b) => (/GB/i.test(b.lang) - /GB/i.test(a.lang)) || (b.localService - a.localService) || a.name.localeCompare(b.name));

function pickVoice() {
  const en = englishVoices();
  return en.find((v) => v.voiceURI === settings.voiceURI) || en.find((v) => /GB/i.test(v.lang) && v.localService) || en.find((v) => /GB/i.test(v.lang)) || en[0] || null;
}

export function stop() {
  if (current) { current.cancel(); current = null; }
  if ('speechSynthesis' in globalThis) speechSynthesis.cancel();
  emit({ playing: false });
}

function playFile(key, rate) {
  return new Promise((resolve) => {
    const a = new Audio(`audio/${key}.ogg`);
    a.playbackRate = rate;
    a.preservesPitch = true;
    let settled = false;
    const finish = (ok, reason) => { if (!settled) { settled = true; resolve({ ok, reason }); } };
    a.onended = () => finish(true);
    a.onerror = () => finish(false, 'arquivo');
    current = { audio: a, cancel: () => { a.pause(); finish(true, 'cancel'); } };
    a.play().catch((e) => finish(false, e.name));
  });
}

function speak(text, rate) {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in globalThis)) return resolve({ ok: false, reason: 'sem-tts' });
    const u = new SpeechSynthesisUtterance(text.replace(/…/g, ''));
    const v = pickVoice();
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
    u.rate = rate;
    let settled = false;
    const finish = (ok, reason) => { if (!settled) { settled = true; resolve({ ok, reason }); } };
    u.onend = () => finish(true);
    u.onerror = (e) => finish(e.error === 'interrupted' || e.error === 'canceled', e.error);
    current = { cancel: () => finish(true, 'cancel') };
    speechSynthesis.speak(u);
  });
}

/** Toca um trecho {key, text}. Retorna { ok, via }. */
export async function play(clip, { rate } = {}) {
  stop();
  const r = rate || settings.rate || 1;
  emit({ playing: true, clip });
  let res = { ok: false };
  if (settings.audioSource !== 'system' && hasEmbedded(clip.key)) {
    res = await playFile(clip.key, r);
    if (res.ok) { emit({ playing: false }); return { ok: true, via: 'embedded' }; }
  }
  if (clip.text) {
    if (!voices.length) await loadVoices();
    res = await speak(clip.text, r);
    if (res.ok) { emit({ playing: false }); return { ok: true, via: 'system' }; }
  }
  emit({ playing: false });
  return { ok: false, reason: res.reason || 'indisponível' };
}

let seqId = 0;
/** Toca uma sequência (bloco/rotina), frase a frase, com callback de progresso. stopAll() interrompe. */
export async function playSequence(clips, { rate, onIndex, gapMs = 250 } = {}) {
  const id = ++seqId;
  let completed = true;
  for (let i = 0; i < clips.length; i++) {
    if (id !== seqId) { completed = false; break; }
    onIndex && onIndex(i);
    const res = await play(clips[i], { rate });
    if (id !== seqId || !res.ok || res.reason === 'cancel') { completed = false; break; }
    await new Promise((r) => setTimeout(r, gapMs));
  }
  if (onIndex) onIndex(-1);
  return completed;
}
export function stopAll() { seqId++; stop(); }

/** Diagnóstico para a tela de ajustes. */
export async function diagnose() {
  await loadVoices();
  const en = englishVoices();
  return {
    embedded: embeddedCount(),
    embeddedVoice: (globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.voice) || null,
    systemTts: 'speechSynthesis' in globalThis,
    englishVoices: en.map((v) => ({ uri: v.voiceURI, name: v.name, lang: v.lang, local: v.localService })),
  };
}
