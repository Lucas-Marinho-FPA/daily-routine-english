// Reprodução de áudio — controle CENTRAL de tudo que toca no app.
// 1ª opção: áudio britânico embutido (app/audio/<chave>.ogg, gerado offline).
// 2ª opção: voz do sistema (speechSynthesis), preferindo en-GB local.
// Sem nenhuma das duas, o chamador recebe { ok:false } e mostra o aviso.
// Elementos <audio> de outras telas (ex.: “Minha voz”) entram pelo playElement(): só um áudio toca por vez,
// e stopAll() (troca de tela, próximo exercício, nova gravação) para qualquer um deles.
// Nada aqui interrompe uma gravação em andamento (o microfone é controlado só por recorder.js).

const files = () => (globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.files) || {};
let settings = { audioSource: 'embedded', voiceURI: '', rate: 1 };
let current = null; // { audio?, cancel() }
let gen = 0; // muda a cada stop(): reproduções atrasadas (await, setTimeout) conferem e desistem
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
  gen++;
  if (current) { const c = current; current = null; c.cancel(); }
  if ('speechSynthesis' in globalThis) speechSynthesis.cancel();
  emit({ playing: false });
}

/** Geração atual: quem agenda uma reprodução guarda o valor e só toca se ele não mudou. */
export const generation = () => gen;
/** O que está tocando agora (para diagnóstico e testes): 'element' | 'file' | 'speech' | null. */
export const nowPlaying = () => (current ? current.kind : null);

// libera o decodificador do elemento (não fica preso à memória depois de parar)
function release(a) {
  try { a.pause(); a.removeAttribute('src'); a.load(); } catch (e) { /* ok */ }
}

function playFile(key, rate) {
  return new Promise((resolve) => {
    const a = new Audio(`audio/${key}.ogg`);
    a.playbackRate = rate;
    a.preservesPitch = true;
    let settled = false;
    const finish = (ok, reason) => { if (!settled) { settled = true; resolve({ ok, reason }); } };
    a.onended = () => { if (current && current.audio === a) current = null; release(a); finish(true); };
    a.onerror = () => { if (current && current.audio === a) current = null; finish(false, 'arquivo'); };
    current = { kind: 'file', audio: a, cancel: () => { a.onended = a.onerror = null; release(a); finish(true, 'cancel'); } };
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
    const finish = (ok, reason) => { if (current && current.u === u) current = null; if (!settled) { settled = true; resolve({ ok, reason }); } };
    u.onend = () => finish(true);
    u.onerror = (e) => finish(e.error === 'interrupted' || e.error === 'canceled', e.error);
    current = { kind: 'speech', u, cancel: () => finish(true, 'cancel') };
    speechSynthesis.speak(u);
  });
}

/** Toca um trecho {key, text}. Retorna { ok, via }. */
export async function play(clip, { rate } = {}) {
  stop();
  const my = gen;
  const r = rate || settings.rate || 1;
  emit({ playing: true, clip });
  let res = { ok: false };
  if (settings.audioSource !== 'system' && hasEmbedded(clip.key)) {
    res = await playFile(clip.key, r);
    if (res.ok) { emit({ playing: false }); return { ok: true, via: 'embedded' }; }
  }
  if (my !== gen) return { ok: false, reason: 'cancel' };
  if (clip.text) {
    if (!voices.length) await loadVoices();
    if (my !== gen) return { ok: false, reason: 'cancel' }; // parado enquanto carregava as vozes
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

/** Toca daqui a `ms`, a menos que algo pare o áudio antes (troca de tela, próximo exercício). */
export function playSoon(clip, ms = 250, opts) {
  const my = gen;
  const t = setTimeout(() => { if (my === gen) play(clip, opts); }, ms);
  return () => clearTimeout(t);
}

/**
 * Toca um <audio> externo (ex.: a gravação “Minha voz”) sob o controle central.
 * Para o que estiver tocando antes; resolve quando termina, é pausado ou é parado.
 * Parado por outro áudio/troca de tela, volta ao início (não retoma sozinho depois).
 */
export function playElement(audio, { restart = false } = {}) {
  stopAll();
  if (restart || audio.ended) audio.currentTime = 0;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (ok, reason) => {
      if (settled) return;
      settled = true;
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
      if (current && current.audio === audio) { current = null; emit({ playing: false }); }
      resolve({ ok, reason });
    };
    const onEnded = () => finish(true, 'ended');
    const onPause = () => finish(true, 'pause');
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);
    current = { kind: 'element', audio, cancel: () => { finish(true, 'cancel'); audio.pause(); try { audio.currentTime = 0; } catch (e) { /* ok */ } } };
    emit({ playing: true, element: audio });
    audio.play().catch((e) => finish(false, e.name));
  });
}

/** Tira um <audio> externo do controle central e libera seus recursos (ao destruir a tela/widget). */
export function releaseElement(audio) {
  if (current && current.audio === audio) stop();
  release(audio);
}

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
