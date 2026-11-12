// Motor de fala CENTRAL do app: um único caminho para todas as telas que transcrevem fala.
//  1. ONLINE (prioridade): reconhecimento do navegador (SpeechRecognition / webkitSpeechRecognition) durante a
//     gravação — só com internet, a API presente e o consentimento do aluno (a voz pode ir para o serviço do
//     navegador, ex.: Google). Configuração validada em speech-recognition-diagnostic.html (continuous = false).
//  2. LOCAL (alternativa automática): Moonshine (localasr.js) sobre a MESMA gravação — sem internet, sem
//     consentimento, sem a API, ou quando o online falha/não devolve texto. Nada da fala se perde: a gravação existe.
// Captura: o reconhecimento recebe a MESMA faixa do microfone aberta pelo gravador (start(track)), em vez de abrir
// outra captura — no Chrome Android, duas capturas simultâneas costumam funcionar “uma ou outra”.
// Resultado padronizado: { text, confidence (0 = não informada), engine ('online' | 'local-model'), lang, ms, secs,
// status, alternatives?, events?, fallbackReason? } — segue para os avaliadores de sempre (nenhum critério muda).
// Registro de diagnóstico (só eventos e tempos, nunca áudio nem texto): recentLog() / Ajustes → Áudio.
// Não é avaliação fonética: é transcrição.
import * as localasr from './localasr.js';
import { h, sheet } from '../ui/dom.js';

const SR = () => globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null;
const START_TIMEOUT_MS = 6000;  // nenhum evento depois de start(): o online é dado como indisponível nesta tentativa
const END_WAIT_MS = 10000;      // depois de parar a gravação, espera o fim NATURAL do online (resultado final) até isto
const MAX_RESTARTS = 20;        // sessões curtas (continuous = false) reiniciadas enquanto a gravação continua
const LOG_KEY = 'drg.speech.log', LOG_MAX = 15;

// consentimento guardado nos ajustes do aluno (settings.onlineSpeech: true | false | indefinido = ainda não decidido)
let cfg = { getConsent: () => undefined, setConsent: () => {} };
export function configure(c) { cfg = { ...cfg, ...c }; }

const isOnline = () => !(globalThis.navigator && navigator.onLine === false);
export const onlineSupported = () => !!SR();
/** O online pode ser usado agora? (API + internet + o aluno não recusou) */
export const onlineUsable = () => onlineSupported() && isOnline() && cfg.getConsent() !== false;

// ---------- registro de diagnóstico (eventos e tempos de cada tentativa; sem áudio e sem texto) ----------
let memLog = null;
function loadLog() {
  if (memLog) return memLog;
  try { memLog = JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch (e) { memLog = []; }
  if (!Array.isArray(memLog)) memLog = [];
  return memLog;
}
function saveLog() { try { localStorage.setItem(LOG_KEY, JSON.stringify(loadLog().slice(-LOG_MAX))); } catch (e) { /* sem armazenamento: fica só na memória */ } }
function newEntry(extra = {}) {
  const e = { at: new Date().toISOString(), online: isOnline(), consent: cfg.getConsent() === undefined ? 'não decidido' : String(cfg.getConsent()), events: [], ...extra };
  const log = loadLog(); log.push(e); if (log.length > LOG_MAX) log.splice(0, log.length - LOG_MAX);
  return e;
}
/** Últimas tentativas (mais antiga primeiro). */
export const recentLog = () => loadLog().slice();
/** Relatório em texto para copiar (Ajustes → Áudio). */
export function logReport() {
  const nav = globalThis.navigator || {};
  const head = [`Registro do reconhecimento de voz — Daily Routine English`, `Navegador: ${nav.userAgent || '?'}`, `App instalado: ${globalThis.matchMedia && matchMedia('(display-mode: standalone)').matches ? 'sim' : 'não'}`,
    `API online: ${onlineSupported() ? 'sim' : 'não'} · internet agora: ${isOnline() ? 'sim' : 'não'} · consentimento: ${cfg.getConsent() === undefined ? 'não decidido' : cfg.getConsent()}`, ''];
  const lines = recentLog().reverse().map((e, i) => `#${i + 1} ${e.at} | captura: ${e.capture || '—'} | idioma ${e.lang || '—'} | motor: ${e.engine || '—'}${e.fallbackReason ? ` | troca: ${e.fallbackReason}` : ''}${e.error ? ` | erro online: ${e.error}` : ''}${e.words != null ? ` | palavras online: ${e.words}` : ''}${e.sessions ? ` | sessões: ${e.sessions}` : ''}\n   ${e.events.map((x) => `${x.e}@${x.t}ms`).join(' → ') || 'sem eventos'}`);
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
      h('p', { class: 'small muted', text: 'Sem internet (ou se você preferir), o app usa o reconhecimento do próprio aparelho, quando instalado. Dá para mudar depois em Ajustes → Áudio.' }),
      h('div', { class: 'row', style: { marginTop: '14px' } },
        h('button', { class: 'btn', type: 'button', 'data-choice': 'local', onclick: () => finish(false) }, 'Só no aparelho'),
        h('button', { class: 'btn primary', type: 'button', 'data-choice': 'online', onclick: () => finish(true) }, 'Usar online')));
    s = sheet(body, { label: 'Reconhecimento de voz online', onClose: () => finish(null) });
  });
}

/**
 * Escuta online durante a gravação. track: a faixa de áudio do microfone já aberta pelo gravador (compartilhada).
 * Sessões com continuous = false (a configuração validada no aparelho), reiniciadas enquanto a gravação continua.
 * Retorna { stop(): Promise<resultado online>, cancel(), entry }; nunca lança.
 */
export function startLive({ lang = 'en-GB', track = null } = {}) {
  const t0 = performance.now();
  const at = () => Math.round(performance.now() - t0);
  const entry = newEntry({ lang, capture: track ? 'faixa do gravador (start(track))' : 'captura própria do navegador', sessions: 0 });
  const ev = (e) => { entry.events.push({ e, t: at() }); };
  ev('gravação:início');
  const out = { engine: 'online', lang, text: '', confidence: 0, alternatives: [], events: [], error: null, ms: null, entry };
  const finals = []; // de todas as sessões
  let stopping = false, cancelled = false, finished = false, resolveFinished, rec = null, sessionEnded = true, gotEvent = false;
  const finishedP = new Promise((r) => { resolveFinished = r; });
  const done = () => { if (!finished) { finished = true; resolveFinished(); } };

  const startSession = () => {
    if (entry.sessions >= MAX_RESTARTS + 1) { ev('limite de sessões'); done(); return; }
    entry.sessions++;
    sessionEnded = false;
    try {
      rec = new (SR())();
      rec.lang = lang;
      try { rec.continuous = false; } catch (e) { /* ok */ }
      try { rec.interimResults = true; } catch (e) { /* não suportado */ }
      try { rec.maxAlternatives = 3; } catch (e) { /* não suportado */ }
      for (const n of ['start', 'audiostart', 'soundstart', 'speechstart', 'speechend', 'soundend', 'audioend', 'nomatch']) rec[`on${n}`] = () => { gotEvent = true; ev(n); };
      rec.onresult = (e) => {
        gotEvent = true;
        for (let i = e.resultIndex || 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal === false) continue;
          finals.push({ text: r[0].transcript, confidence: typeof r[0].confidence === 'number' ? r[0].confidence : 0, alts: Array.from(r, (a) => a.transcript) });
          ev('result(final)');
        }
      };
      rec.onerror = (e) => { gotEvent = true; out.error = e.error || 'erro'; ev(`error:${out.error}${e.message ? ` (${e.message})` : ''}`); };
      // “no-speech” no meio da gravação (o aluno ainda não começou a falar) não encerra a escuta: a sessão recomeça
      rec.onend = () => {
        sessionEnded = true; ev('end');
        // terminou sozinha (pausa na fala) e a gravação continua: nova sessão; com erro, para de tentar
        if (!stopping && !cancelled && (!out.error || out.error === 'no-speech')) { if (out.error === 'no-speech') out.error = null; startSession(); }
        else done();
      };
      if (track) {
        try { rec.start(track); } catch (e) { ev(`start(track) recusado: ${e.name}`); entry.capture = 'captura própria do navegador (start(track) recusado)'; rec.start(); }
      } else rec.start();
      ev(entry.sessions === 1 ? 'reconhecimento:start()' : `reconhecimento:reinício ${entry.sessions}`);
    } catch (e) { out.error = `start:${e.name || 'erro'}`; ev(out.error); sessionEnded = true; done(); }
  };
  startSession();
  const watchdog = setTimeout(() => {
    if (!gotEvent && !finished) { out.error = out.error || 'sem-resposta'; ev('sem eventos em 6 s'); try { rec.abort(); } catch (e) { /* ok */ } done(); }
  }, START_TIMEOUT_MS);

  let result = null;
  return {
    entry,
    mark: (e) => ev(e), // marcos do gravador (fala detectada, fim de fala, limite)
    stop() {
      if (result) return result;
      stopping = true;
      ev('gravação:fim');
      result = (async () => {
        if (!sessionEnded && rec) { try { rec.stop(); } catch (e) { /* ok */ } } else done();
        // espera o fim natural (resultado final); só depois do limite aborta — demora normal não vira falha
        const timedOut = await Promise.race([finishedP.then(() => false), new Promise((r) => setTimeout(() => r(true), END_WAIT_MS))]);
        clearTimeout(watchdog);
        if (timedOut) { ev(`sem fim em ${END_WAIT_MS / 1000} s`); if (!out.error) out.error = 'sem-fim'; try { rec.abort(); } catch (e) { /* ok */ } }
        out.text = finals.map((x) => x.text).join(' ').replace(/\s+/g, ' ').trim();
        const conf = finals.map((x) => x.confidence).filter((c) => c > 0);
        out.confidence = conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : 0;
        out.alternatives = finals.length === 1 ? finals[0].alts : [];
        out.ms = at();
        out.events = entry.events.map((x) => x.e);
        entry.error = out.error; entry.words = out.text ? out.text.split(/\s+/).length : 0;
        saveLog();
        return out;
      })();
      return result;
    },
    cancel() { cancelled = true; clearTimeout(watchdog); ev('cancelado'); if (!sessionEnded && rec) { try { rec.abort(); } catch (e) { /* ok */ } } done(); saveLog(); },
  };
}

// resultado online de cada gravação (o gravador associa ao blob; a transcrição consulta aqui)
const live = new WeakMap();
export function attach(blob, liveResult) { if (blob && liveResult) live.set(blob, liveResult); }
/** Motor que vai atender esta gravação: 'online' quando houve escuta online junto com ela. */
export const engineFor = (blob) => (live.has(blob) ? 'online' : 'local-model');

/** Há algum reconhecimento utilizável agora? 'installed' (online usável ou modelo local) ou o estado do local. */
export async function status() {
  if (onlineUsable()) return 'installed';
  return localasr.status();
}

/**
 * Transcreve uma gravação: o texto online dessa gravação, se houver; senão o Moonshine sobre o mesmo áudio.
 * opts: os do localasr.transcribe ({ word, long, onProgress }) + { local: true } para forçar o Moonshine (2ª opinião).
 * Lança { code: 'unavailable', fallbackReason } só quando nenhum dos dois pode atender (nada é decidido em silêncio).
 */
export async function transcribe(blob, opts = {}) {
  let fallbackReason = null, entry = null;
  if (!opts.local) {
    const p = live.get(blob);
    if (p) {
      const r = await p;
      entry = r.entry || null;
      if (r.text) {
        if (entry) { entry.engine = 'online'; saveLog(); }
        return { text: r.text, confidence: r.confidence || 0, engine: 'online', lang: r.lang, ms: r.ms, secs: null, status: 'ok',
          alternatives: r.alternatives, events: r.events, error: r.error || null };
      }
      fallbackReason = r.error ? `online: ${r.error}` : 'online: sem texto';
    } else {
      fallbackReason = !onlineSupported() ? 'navegador sem reconhecimento online' : !isOnline() ? 'sem internet' : cfg.getConsent() === false ? 'online recusado pelo aluno' : 'online não iniciado';
      entry = newEntry({ capture: 'sem escuta online' });
    }
  }
  const st = await localasr.status().catch(() => 'unsupported');
  if (st !== 'installed') {
    if (entry) { entry.engine = 'nenhum'; entry.fallbackReason = `${fallbackReason} · aparelho: ${st}`; saveLog(); }
    const e = new Error(`nenhum reconhecimento disponível (${fallbackReason || 'local não instalado'})`);
    e.code = 'unavailable'; e.fallbackReason = fallbackReason;
    throw e;
  }
  const r = await localasr.transcribe(blob, opts);
  if (entry) { entry.engine = 'local-model'; entry.fallbackReason = fallbackReason; saveLog(); }
  return { ...r, engine: 'local-model', lang: 'en', status: 'ok', fallbackReason };
}
