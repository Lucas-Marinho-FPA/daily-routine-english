// Motor de fala CENTRAL do app: um único caminho para todas as telas que transcrevem fala.
// Modos (Ajustes → Áudio, settings.onlineSpeech), sem troca automática entre eles:
//  • ONLINE: reconhecimento do navegador (SpeechRecognition / webkitSpeechRecognition). O RECONHECEDOR É O ÚNICO DONO
//    DO MICROFONE durante a tentativa (listen()): nenhuma gravação (getUserMedia/MediaRecorder) roda junto. Motivo
//    (causa da falha no Galaxy S25+, 2026-11-12): o Chrome Android não aceita start(MediaStreamTrack) e, com duas
//    capturas simultâneas, a gravação recebe o áudio e o reconhecedor recebe silêncio (“online: sem texto”). A
//    configuração que funciona no aparelho é a do diagnóstico isolado: start() sem faixa, continuous = false.
//    Consequência: no modo online não há áudio da própria voz (só a transcrição).
//  • MOONSHINE: gravação (recorder.js) + modelo do aparelho (localasr.js) sobre o áudio gravado.
// Resultado padronizado: { text, confidence (0 = não informada), engine ('online' | 'local-model'), lang, ms, secs,
// status, alternatives?, events?, fallbackReason? } — segue para os avaliadores de sempre (nenhum critério muda).
// Registro de diagnóstico por tentativa (eventos, tempos, contagens, motivo do fim, entrega; nunca áudio nem o texto
// falado): recentLog() / logReport() / lastAttempt() — Ajustes → Áudio.
// Não é avaliação fonética: é transcrição.
import * as localasr from './localasr.js';
import { h, sheet } from '../ui/dom.js';

const SR = () => globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null;
const START_TIMEOUT_MS = 6000;  // start() sem “start”/“audiostart” até isto: o reconhecimento não iniciou nesta tentativa
const END_WAIT_MS = 10000;      // depois de pedir o fim, espera o fim NATURAL do online (resultado final) até isto
const MAX_RESTARTS = 20;        // sessões curtas (continuous = false) reiniciadas enquanto a tentativa continua
const RESTART_DELAY_MS = 60;    // pausa entre o fim de uma sessão e a próxima (o serviço do Android precisa liberar o microfone)
const LOG_KEY = 'drg.speech.log', LOG_MAX = 20;
// erros que encerram a tentativa (não adianta reiniciar a sessão)
const FATAL = new Set(['not-allowed', 'service-not-allowed', 'audio-capture', 'network', 'language-not-supported', 'bad-grammar']);
const ERROR_PT = { 'not-allowed': 'microfone bloqueado para o reconhecimento', 'service-not-allowed': 'serviço de reconhecimento bloqueado',
  'audio-capture': 'o reconhecimento não conseguiu abrir o microfone', network: 'falha de rede do serviço de reconhecimento',
  'language-not-supported': 'idioma não suportado pelo reconhecimento', 'no-speech': 'nenhuma fala detectada', aborted: 'interrompido',
  'sem-resposta': 'o reconhecimento não respondeu', 'sem-fim': 'o resultado final não chegou a tempo' };

// consentimento guardado nos ajustes do aluno (settings.onlineSpeech: true | false | indefinido = ainda não decidido)
let cfg = { getConsent: () => undefined, setConsent: () => {} };
export function configure(c) { cfg = { ...cfg, ...c }; }

const isOnline = () => !(globalThis.navigator && navigator.onLine === false);
export const onlineSupported = () => !!SR();
/** O online pode ser usado agora? (API + internet + o aluno não recusou) */
export const onlineUsable = () => onlineSupported() && isOnline() && cfg.getConsent() !== false;
/**
 * Modo escolhido em Ajustes → Áudio (settings.onlineSpeech): 'online' (só o navegador; o Moonshine fica bloqueado),
 * 'local' (só o Moonshine; o online fica bloqueado) ou undefined (ainda não escolhido: pergunta na 1ª gravação).
 * Com um modo escolhido NÃO há troca automática entre os mecanismos.
 */
export const mode = () => (cfg.getConsent() === true ? 'online' : cfg.getConsent() === false ? 'local' : undefined);

// ---------- registro de diagnóstico (eventos e tempos de cada tentativa; sem áudio e sem texto) ----------
let memLog = null;
function loadLog() {
  if (memLog) return memLog;
  try { memLog = JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch (e) { memLog = []; }
  if (!Array.isArray(memLog)) memLog = [];
  return memLog;
}
function saveLog() { try { localStorage.setItem(LOG_KEY, JSON.stringify(loadLog().slice(-LOG_MAX))); } catch (e) { /* sem armazenamento: fica só na memória */ } }
const routeNow = () => { try { return (globalThis.location && location.hash ? location.hash.split('?')[0] : '#/') || '#/'; } catch (e) { return '?'; } };
let seq = 0;
function newEntry(extra = {}) {
  const e = { id: `${Date.now().toString(36)}-${++seq}`, at: new Date().toISOString(), online: isOnline(), mode: mode() || 'não escolhido', source: routeNow(),
    events: [], partials: 0, finals: 0, ...extra };
  const log = loadLog(); log.push(e); if (log.length > LOG_MAX) log.splice(0, log.length - LOG_MAX);
  return e;
}
/** Últimas tentativas (mais antiga primeiro). */
export const recentLog = () => loadLog().slice();
/** A tentativa mais recente (ou null). */
export const lastAttempt = () => { const l = loadLog(); return l.length ? l[l.length - 1] : null; };

/**
 * Onde a tentativa parou — distingue: 1 microfone não capturou · 2 reconhecimento não iniciou · 3 iniciou sem
 * resultado · 4 resultado perdido na integração · 5 resultado vazio · 6 a atividade não pediu/recebeu · ok entregue.
 */
export function verdict(e) {
  if (!e) return { code: '—', text: 'nenhuma tentativa registrada' };
  const has = (n) => e.events.some((x) => x.e === n || x.e.startsWith(`${n}:`) || x.e.startsWith(`${n} `));
  if (e.cancelled && !e.delivered) return { code: 'cancelada', text: 'tentativa cancelada (troca de tela, nova gravação ou saída)' };
  if (e.engine === 'online' || e.capture === 'reconhecimento online (dono do microfone)') {
    if (e.startError || !(has('start') || has('audiostart'))) return { code: '2', text: `o reconhecimento não iniciou${e.startError ? ` (${e.startError})` : ''}` };
    if (!has('audiostart')) return { code: '1', text: 'o microfone não capturou (sem “audiostart”)' };
    if (!e.partials && !e.finals) return { code: '3', text: `o reconhecimento iniciou, mas não recebeu resultado${has('soundstart') || has('speechstart') ? ' (houve som/fala)' : ' (nenhum som/fala detectado)'}${e.error ? ` · ${e.error}` : ''}` };
    if (!e.words) return { code: '5', text: 'o resultado chegou vazio' };
  } else {
    if (e.micError) return { code: '1', text: `o microfone não capturou (${e.micError})` };
    if (e.bytes === 0) return { code: '1', text: 'o microfone não capturou (gravação vazia)' };
    if (e.requested && !e.words && !e.deliveryError) return { code: '5', text: 'o reconhecimento do aparelho devolveu texto vazio' };
  }
  if (e.delivered) return { code: 'ok', text: `transcrição entregue à atividade (${e.words} palavra(s))` };
  if (e.requested) return { code: '4', text: `o resultado chegou, mas se perdeu na entrega${e.deliveryError ? ` (${e.deliveryError})` : ''}` };
  if (e.engine === 'online') return { code: '6', text: 'o resultado chegou, mas a atividade não o pediu' };
  return { code: '6', text: 'a gravação terminou, mas a atividade não pediu a transcrição' };
}

/** Uma tentativa em texto (sem áudio, sem o texto falado). */
export function describeAttempt(e) {
  const v = verdict(e);
  return `${e.at} | origem: ${e.source || '—'} | modo: ${e.mode || '—'} | motor: ${e.engine || '—'} | captura: ${e.capture || '—'} | idioma ${e.lang || '—'}`
    + `\n   resultado: [${v.code}] ${v.text}`
    + `\n   parciais: ${e.partials || 0} · finais: ${e.finals || 0}${e.words != null ? ` · palavras: ${e.words}` : ''}${e.sessions ? ` · sessões: ${e.sessions}` : ''}${e.endReason ? ` · fim: ${e.endReason}` : ''}${e.error ? ` · erro: ${e.error}` : ''}${e.ms != null ? ` · duração: ${e.ms} ms` : ''}${e.bytes != null ? ` · áudio: ${e.bytes} bytes` : ''}`
    + `${e.fallbackReason ? `\n   motivo: ${e.fallbackReason}` : ''}`
    + `\n   ${e.events.map((x) => `${x.e}@${x.t}ms`).join(' → ') || 'sem eventos'}`;
}

/** Relatório em texto para copiar (Ajustes → Áudio). */
export function logReport() {
  const nav = globalThis.navigator || {};
  const head = [`Registro do reconhecimento de voz — Daily Routine English`, `Navegador: ${nav.userAgent || '?'}`, `App instalado: ${globalThis.matchMedia && matchMedia('(display-mode: standalone)').matches ? 'sim' : 'não'}`,
    `API online: ${onlineSupported() ? 'sim' : 'não'} · internet agora: ${isOnline() ? 'sim' : 'não'} · modo: ${mode() || 'não escolhido'}`, ''];
  const lines = recentLog().reverse().map((e, i) => `#${i + 1} ${describeAttempt(e)}`);
  return head.concat(lines.length ? lines : ['(nenhuma tentativa registrada)']).join('\n');
}

/**
 * Antes da gravação: decide se a escuta online roda nesta tentativa. Pergunta (folha) quando o online é possível e o
 * aluno ainda não decidiu. Nunca bloqueia a gravação: recusar — ou fechar a folha sem escolher — usa o aparelho.
 * Fechar sem escolher NÃO vira recusa permanente (pergunta de novo na próxima gravação).
 */
export async function prepareOnline() {
  if (!onlineSupported() || !isOnline()) return false;
  const c = cfg.getConsent();
  if (c === true) return true;
  if (c === false) return false;
  const choice = await askConsent(); // true | false | null (fechou sem escolher)
  if (choice !== null) cfg.setConsent(choice);
  return choice === true;
}

function askConsent() {
  return new Promise((resolve) => {
    let done = false, s = null;
    const finish = (v) => { if (!done) { done = true; resolve(v); if (s) s.close(); } };
    const body = h('div', { 'data-role': 'speech-consent' },
      h('h3', { text: 'Reconhecimento de voz online' }),
      h('p', { class: 'small', text: 'Com internet, o app usa o reconhecimento de voz do navegador/dispositivo, que costuma entender melhor. Sua voz poderá ser enviada a um serviço externo, como o Google; o aplicativo não controla esse processamento.' }),
      h('p', { class: 'small muted', text: 'Ou escolha o Moonshine: o reconhecimento do próprio aparelho, que funciona sem internet. O app usa só o que você escolher; dá para trocar em Ajustes → Áudio.' }),
      h('div', { class: 'row', style: { marginTop: '14px' } },
        h('button', { class: 'btn', type: 'button', 'data-choice': 'local', onclick: () => finish(false) }, 'Moonshine (aparelho)'),
        h('button', { class: 'btn primary', type: 'button', 'data-choice': 'online', onclick: () => finish(true) }, 'Usar online')));
    s = sheet(body, { label: 'Reconhecimento de voz online', onClose: () => finish(null) });
  });
}

// ---------- modo ONLINE: o reconhecedor é o dono do microfone ----------
const ONLINE = Symbol.for('drg-online'); // marca do “resultado de tentativa online” (um Blob vazio, sem áudio)
let active = null; // a tentativa online em andamento (no máximo uma: uma nova cancela a anterior)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** true quando a “gravação” veio do modo online (não há áudio: só a transcrição). */
export const isOnlineCapture = (blob) => !!(blob && blob[ONLINE]);

/**
 * Tentativa ONLINE (substitui a gravação no modo online): o navegador abre o microfone para o reconhecimento;
 * nenhuma outra captura roda junto. Sessões com continuous = false, reiniciadas enquanto a tentativa continua.
 * Fim: silêncio de silenceMs depois de fala reconhecida (null = só Parar/limite), Parar (stop) ou o limite maxMs.
 * O fim SEMPRE espera o resultado final (até END_WAIT_MS). Mesma interface do gravador:
 * { stop(): Promise<{ blob, ms, engine, audio: false }>, cancel(), stopped }. O blob é um marcador vazio que leva
 * a transcrição (speech.transcribe) e uma análise mínima (analysis.js: fala detectada e duração estimada).
 */
export async function listen({ lang = 'en-GB', maxMs = 180000, silenceMs = 1800, onLevel = null, source = null } = {}) {
  if (!onlineSupported()) { const e = new Error('unsupported'); e.userMessage = 'Este navegador não oferece reconhecimento de voz online. Escolha o Moonshine em Ajustes → Áudio.'; throw e; }
  if (active) { const prev = active; prev.cancel('nova tentativa'); await Promise.race([prev.ended, sleep(800)]); } // sem sessões concorrentes
  const t0 = performance.now();
  const at = () => Math.round(performance.now() - t0);
  const entry = newEntry({ lang, engine: 'online', capture: 'reconhecimento online (dono do microfone)', sessions: 0, ...(source ? { source } : {}) });
  const ev = (e) => { entry.events.push({ e, t: at() }); };
  const finals = [];
  let rec = null, sessionEnded = true, sessionFinal = false, lastInterim = '', started = false;
  let firstSpeech = null, lastActivity = null, finishing = null, cancelled = false, resolveEnded;
  const ended = new Promise((r) => { resolveEnded = r; }); // a última sessão terminou (microfone liberado)
  let level = 0;
  const bump = (v) => { level = Math.max(level, v); };
  const speechSeen = (now = at()) => { if (firstSpeech === null) firstSpeech = now; lastActivity = now; };

  const startSession = () => {
    if (finishing || cancelled) return;
    if (entry.sessions >= MAX_RESTARTS + 1) { ev('limite de sessões'); finish('limite de sessões'); return; }
    entry.sessions++;
    sessionEnded = false; sessionFinal = false; lastInterim = '';
    const r = new (SR())();
    rec = r;
    r.lang = lang;
    try { r.continuous = false; } catch (e) { /* ok */ }
    try { r.interimResults = true; } catch (e) { /* não suportado */ }
    try { r.maxAlternatives = 3; } catch (e) { /* não suportado */ }
    const mine = (fn) => (e) => { if (rec === r && !cancelled) fn(e); }; // eventos de uma sessão antiga não contam
    r.onstart = mine(() => { started = true; ev('start'); });
    r.onaudiostart = mine(() => { started = true; ev('audiostart'); });
    r.onsoundstart = mine(() => { ev('soundstart'); bump(0.3); });
    r.onspeechstart = mine(() => { ev('speechstart'); speechSeen(); bump(0.6); });
    for (const n of ['speechend', 'soundend', 'audioend']) r[`on${n}`] = mine(() => ev(n));
    r.onnomatch = mine(() => ev('nomatch'));
    r.onresult = mine((e) => {
      for (let i = e.resultIndex || 0; i < e.results.length; i++) {
        const res = e.results[i];
        const text = (res[0] && res[0].transcript) || '';
        if (res.isFinal === false) { entry.partials++; lastInterim = text; if (text.trim()) { speechSeen(); bump(0.7); } continue; }
        entry.finals++; sessionFinal = true; lastInterim = '';
        if (text.trim()) { finals.push({ text, confidence: typeof res[0].confidence === 'number' ? res[0].confidence : 0, alts: Array.from(res, (a) => a.transcript) }); speechSeen(); bump(0.7); }
        ev('result(final)');
      }
    });
    r.onerror = mine((e) => {
      const code = e.error || 'erro';
      ev(`error:${code}${e.message ? ` (${e.message})` : ''}`);
      if (code === 'no-speech' || code === 'aborted') return; // sem fala ainda / fim pedido: a tentativa continua
      entry.error = code;
      if (FATAL.has(code)) finish(`erro:${code}`);
    });
    r.onend = () => {
      if (rec !== r) return;
      sessionEnded = true; ev('end');
      // parou sem resultado final (fim pedido no meio da frase): o último parcial não se perde
      if (!sessionFinal && lastInterim.trim()) { finals.push({ text: lastInterim, confidence: 0, alts: [], interim: true }); ev('parcial aproveitado'); }
      lastInterim = '';
      if (finishing || cancelled) { resolveEnded(); return; }
      setTimeout(() => { if (!finishing && !cancelled) startSession(); else resolveEnded(); }, RESTART_DELAY_MS); // pausa na fala: nova sessão
    };
    try { r.start(); ev(entry.sessions === 1 ? 'reconhecimento:start()' : `reconhecimento:reinício ${entry.sessions}`); }
    catch (e) { entry.startError = `start:${e.name || 'erro'}`; ev(entry.startError); sessionEnded = true; finish('erro ao iniciar'); }
  };

  // relógio: fim por silêncio (depois de fala), nível para o medidor, início que não acontece
  const tick = setInterval(() => {
    level *= 0.75;
    if (onLevel) { try { onLevel(Math.min(1, level + (started && !sessionEnded ? 0.05 : 0))); } catch (e) { /* ok */ } }
    if (finishing || cancelled) return;
    const now = at();
    if (!started && now >= START_TIMEOUT_MS) { entry.error = entry.error || 'sem-resposta'; ev(`sem início em ${START_TIMEOUT_MS / 1000} s`); finish('o reconhecimento não iniciou'); return; }
    if (silenceMs && firstSpeech !== null && now - lastActivity >= silenceMs) { ev(`fim de fala (silêncio ${silenceMs / 1000} s)`); finish('silêncio'); return; }
    if (now >= maxMs) { ev('limite de segurança'); finish('limite'); }
  }, 100);

  let resolveStopped;
  const stopped = new Promise((r) => { resolveStopped = r; });
  const blob = new Blob([], { type: 'audio/x-drg-online' });

  function finish(reason) {
    if (finishing) return finishing;
    entry.endReason = entry.endReason || reason;
    finishing = (async () => {
      // pede o fim (o serviço devolve o resultado final do que já ouviu) e espera o fim natural — demora não vira falha
      if (!sessionEnded && rec) { try { rec.stop(); } catch (e) { /* ok */ } } else resolveEnded();
      const timedOut = await Promise.race([ended.then(() => false), sleep(END_WAIT_MS).then(() => true)]);
      clearInterval(tick);
      if (timedOut) { ev(`sem fim em ${END_WAIT_MS / 1000} s`); if (!entry.error) entry.error = 'sem-fim'; try { rec.abort(); } catch (e) { /* ok */ } resolveEnded(); }
      if (active === ctl) active = null;
      const text = finals.map((x) => x.text).join(' ').replace(/\s+/g, ' ').trim();
      const conf = finals.map((x) => x.confidence).filter((c) => c > 0);
      const out = { engine: 'online', lang, text, confidence: conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : 0,
        alternatives: finals.length === 1 ? finals[0].alts : [], events: entry.events.map((x) => x.e), error: entry.error || null, ms: at(), entry,
        partial: finals.some((x) => x.interim) }; // parte do texto é resultado parcial (o final não chegou): o fim pode estar incompleto
      entry.words = text ? text.split(/\s+/).length : 0;
      entry.ms = out.ms;
      // análise mínima para as telas (há fala? quanto?): sem áudio, vem dos eventos do reconhecimento
      // sem texto, a tentativa NUNCA vira “silêncio/quase não captei voz”: segue para transcribe(), que explica a falha
      // técnica com o motivo (não iniciou, erro, sem resultado) — nunca é tratada como erro do aluno
      const speechSec = text ? Math.max(entry.words * 0.4, ((lastActivity ?? 0) - (firstSpeech ?? 0)) / 1000) : 1;
      blob[ONLINE] = { result: out, cancelled, analysis: { online: true, totalSec: Math.round(out.ms / 100) / 10, speechSec: Math.round(speechSec * 100) / 100,
        voicedSec: Math.round(speechSec * 100) / 100, silent: false, pauses: null, longPauses: null, wpm: 0, paceVsReference: null, envelope: [], peak: null } };
      ev(cancelled ? 'tentativa cancelada' : 'tentativa encerrada');
      saveLog();
      resolveStopped({ blob, ms: out.ms, engine: 'online', audio: false });
      return out;
    })();
    return finishing;
  }

  const ctl = {
    ended,
    stop: () => { if (!finishing) { ev('parar (toque)'); finish('parar'); } return stopped; },
    cancel: (why = 'cancelada') => { if (finishing) return; cancelled = true; entry.cancelled = true; ev(`cancelado: ${why}`); try { if (!sessionEnded && rec) rec.abort(); } catch (e) { /* ok */ } finish(`cancelada (${why})`); },
    stopped,
  };
  active = ctl;
  ev('tentativa:início');
  startSession();
  return ctl;
}

// ---------- modo MOONSHINE: registro da gravação (recorder.js) ----------
const recEntries = new WeakMap(); // blob gravado → tentativa no registro
/** O gravador abre uma tentativa no registro (modo Moonshine). Retorna { mark(evento), done(blob, ms), fail(msg) }. */
export function logRecording({ source = null } = {}) {
  const t0 = performance.now();
  const entry = newEntry({ engine: 'local-model', capture: 'gravação do aparelho (MediaRecorder)', ...(source ? { source } : {}) });
  const ev = (e) => { entry.events.push({ e, t: Math.round(performance.now() - t0) }); };
  ev('gravação:início');
  return {
    mark: ev,
    done(blob, ms, cancelled = false) { entry.bytes = blob ? blob.size : 0; entry.ms = ms; if (cancelled) entry.cancelled = true; ev(cancelled ? 'gravação cancelada' : 'gravação:fim'); if (blob) recEntries.set(blob, entry); saveLog(); },
    fail(msg) { entry.micError = msg; ev(`microfone: ${msg}`); saveLog(); },
  };
}

/** Há algum reconhecimento utilizável agora? 'installed' (online usável ou modelo local) ou o estado do local. */
export async function status() {
  if (mode() === 'online') return onlineSupported() ? 'installed' : 'unsupported'; // Moonshine bloqueado
  if (mode() === 'local') return localasr.status();                                // online bloqueado
  if (onlineUsable()) return 'installed';
  return localasr.status();
}

/**
 * Transcreve uma tentativa. Modo online: devolve o texto que o reconhecimento entregou nessa tentativa (nunca o
 * Moonshine). Modo Moonshine: o modelo do aparelho sobre o áudio gravado (nunca o online). Modo ainda não escolhido
 * (consentimento fechado sem escolha): o Moonshine, se instalado. Falhas lançam { code: 'unavailable' | 'cancelled' }.
 * opts: os do localasr.transcribe ({ word, long, onProgress }) + { local: true } para pedir o Moonshine (2ª opinião).
 */
export async function transcribe(blob, opts = {}) {
  if (isOnlineCapture(blob)) return transcribeOnline(blob, opts);
  const m = mode();
  if (m === 'online') {
    // gravação comum no modo online: feita sem internet (ou sem a API) — o reconhecimento online não ouviu
    const reason = opts.local ? 'Moonshine desativado (modo online)' : !onlineSupported() ? 'navegador sem reconhecimento online' : !isOnline() ? 'sem internet' : 'gravação feita sem o reconhecimento online';
    throw unavailable(`Reconhecimento online indisponível nesta gravação (${reason}). Grave de novo; com o modo online, o Moonshine não é usado.`, reason);
  }
  return transcribeLocal(blob, opts);
}

const unavailable = (msg, reason) => { const e = new Error(msg); e.code = 'unavailable'; e.fallbackReason = reason; return e; };

/** Tentativa online: só o texto entregue pelo reconhecimento nesta tentativa. */
async function transcribeOnline(blob, opts) {
  const { result: r, cancelled } = blob[ONLINE];
  const entry = r.entry;
  entry.requested = true;
  if (cancelled) { entry.deliveryError = 'tentativa cancelada'; saveLog(); const e = new Error('cancelled'); e.code = 'cancelled'; throw e; }
  if (opts.local) { saveLog(); throw unavailable('Moonshine desativado (modo online).', 'Moonshine desativado (modo online)'); }
  if (r.text) {
    entry.delivered = true; entry.events.push({ e: 'transcrição entregue', t: entry.ms }); saveLog();
    return { text: r.text, confidence: r.confidence || 0, engine: 'online', lang: r.lang, ms: r.ms, secs: null, status: 'ok',
      alternatives: r.alternatives, events: r.events, error: r.error || null, partial: !!r.partial };
  }
  const v = verdict(entry);
  const why = r.error ? (ERROR_PT[r.error] || r.error) : v.code === '3' ? 'o reconhecimento não devolveu resultado' : 'nenhum texto reconhecido';
  entry.fallbackReason = `${why} · sem troca (modo online)`; saveLog();
  throw unavailable(`O reconhecimento online não devolveu texto nesta tentativa (${why}). Isso não conta como erro seu: grave de novo. No modo online o Moonshine não é usado.`, `online: ${why}`);
}

/** Modo Moonshine (ou não escolhido): só o modelo do aparelho, sobre o áudio gravado. */
async function transcribeLocal(blob, opts) {
  const entry = recEntries.get(blob) || newEntry({ engine: 'local-model', capture: 'gravação salva' });
  entry.requested = true;
  const st = await localasr.status().catch(() => 'unsupported');
  if (st !== 'installed') {
    entry.deliveryError = `Moonshine ${st}`; entry.fallbackReason = `Moonshine ${st} · sem troca`; saveLog();
    throw unavailable(`O Moonshine não está instalado neste aparelho (${st}). Instale-o ou escolha o reconhecimento online em Ajustes → Áudio.`, `Moonshine: ${st}`);
  }
  let r;
  try { r = await localasr.transcribe(blob, opts); } catch (e) { entry.deliveryError = e.code || e.message || 'erro'; saveLog(); throw e; }
  entry.words = r.text ? r.text.trim().split(/\s+/).filter(Boolean).length : 0;
  entry.delivered = !!entry.words; entry.events.push({ e: entry.words ? 'transcrição entregue' : 'transcrição vazia', t: entry.ms || 0 }); saveLog();
  return { ...r, engine: 'local-model', lang: 'en', status: 'ok', fallbackReason: null };
}
