// Motor de fala CENTRAL do app: um único caminho para todas as telas que transcrevem fala.
//  1. ONLINE (prioridade): reconhecimento do navegador (SpeechRecognition / webkitSpeechRecognition), ouvindo EM
//     PARALELO à gravação (recorder.js) — só com internet, a API presente e o consentimento do aluno (a voz pode ir
//     para o serviço do navegador, ex.: Google). Comportamento validado em speech-recognition-diagnostic.html.
//  2. LOCAL (alternativa automática): Moonshine (localasr.js) sobre a MESMA gravação — sem internet, sem
//     consentimento, sem a API, ou quando o online falha/não devolve texto. Nada da fala se perde: a gravação existe.
// Resultado padronizado: { text, confidence (0 = não informada), engine ('online' | 'local-model'), lang, ms, secs,
// status, alternatives?, events?, fallbackReason? } — segue para os avaliadores de sempre (nenhum critério muda).
// Não é avaliação fonética: é transcrição.
import * as localasr from './localasr.js';
import { h, sheet } from '../ui/dom.js';

const SR = () => globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition || null;
const START_TIMEOUT_MS = 6000; // nenhum evento depois de start(): o online é dado como indisponível nesta tentativa
const END_WAIT_MS = 4000;      // espera pelo encerramento do online depois de parar a gravação

// consentimento guardado nos ajustes do aluno (settings.onlineSpeech: true | false | indefinido = ainda não perguntado)
let cfg = { getConsent: () => undefined, setConsent: () => {} };
export function configure(c) { cfg = { ...cfg, ...c }; }

const isOnline = () => !(globalThis.navigator && navigator.onLine === false);
export const onlineSupported = () => !!SR();
/** O online pode ser usado agora? (API + internet + o aluno não recusou) */
export const onlineUsable = () => onlineSupported() && isOnline() && cfg.getConsent() !== false;

/**
 * Antes da gravação: decide se a escuta online roda nesta tentativa. Pergunta UMA vez (folha) quando o online é
 * possível e o aluno ainda não decidiu. Nunca bloqueia a gravação: recusar só faz usar o reconhecimento do aparelho.
 */
export async function prepareOnline() {
  if (!onlineSupported() || !isOnline()) return false;
  const c = cfg.getConsent();
  if (c === true) return true;
  if (c === false) return false;
  const yes = await askConsent();
  cfg.setConsent(yes);
  return yes;
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
    s = sheet(body, { label: 'Reconhecimento de voz online', onClose: () => finish(false) });
  });
}

/** Escuta online em paralelo à gravação. Retorna { stop(): Promise<resultado online>, cancel() }; nunca lança. */
export function startLive({ lang = 'en-GB' } = {}) {
  const t0 = performance.now();
  const out = { engine: 'online', lang, text: '', confidence: 0, alternatives: [], events: [], error: null, ms: null };
  const finals = [];
  let ended = false, resolveEnd;
  const endP = new Promise((r) => { resolveEnd = r; });
  const end = () => { if (!ended) { ended = true; resolveEnd(); } };
  let rec = null;
  try {
    rec = new (SR())();
    rec.lang = lang;
    rec.continuous = true; // a gravação decide quando termina (respostas longas também)
    try { rec.interimResults = true; } catch (e) { /* não suportado */ }
    try { rec.maxAlternatives = 3; } catch (e) { /* não suportado */ }
    for (const n of ['start', 'audiostart', 'audioend', 'nomatch']) rec[`on${n}`] = () => out.events.push(n);
    rec.onresult = (e) => {
      for (let i = e.resultIndex || 0; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal === false) continue;
        finals[i] = { text: r[0].transcript, confidence: typeof r[0].confidence === 'number' ? r[0].confidence : 0, alts: Array.from(r, (a) => a.transcript) };
      }
    };
    rec.onerror = (e) => { out.error = e.error || 'erro'; out.events.push(`error:${out.error}`); };
    rec.onend = () => { out.events.push('end'); end(); };
    rec.start();
  } catch (e) { out.error = `start:${e.name || 'erro'}`; end(); }
  const watchdog = setTimeout(() => {
    if (!ended && !out.events.length) { out.error = out.error || 'sem-resposta'; try { rec.abort(); } catch (e) { /* ok */ } end(); }
  }, START_TIMEOUT_MS);
  let result = null;
  return {
    stop() {
      if (result) return result;
      result = (async () => {
        if (!ended && rec) { try { rec.stop(); } catch (e) { /* ok */ } }
        await Promise.race([endP, new Promise((r) => setTimeout(r, END_WAIT_MS))]);
        clearTimeout(watchdog);
        if (!ended && rec) { try { rec.abort(); } catch (e) { /* ok */ } }
        const parts = finals.filter(Boolean);
        out.text = parts.map((x) => x.text).join(' ').replace(/\s+/g, ' ').trim();
        const conf = parts.map((x) => x.confidence).filter((c) => c > 0);
        out.confidence = conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : 0;
        out.alternatives = parts.length === 1 ? parts[0].alts : [];
        out.ms = Math.round(performance.now() - t0);
        return out;
      })();
      return result;
    },
    cancel() { clearTimeout(watchdog); if (!ended && rec) { try { rec.abort(); } catch (e) { /* ok */ } } end(); },
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
  let fallbackReason = null;
  if (!opts.local) {
    const p = live.get(blob);
    if (p) {
      const r = await p;
      if (r.text) {
        return { text: r.text, confidence: r.confidence || 0, engine: 'online', lang: r.lang, ms: r.ms, secs: null, status: 'ok',
          alternatives: r.alternatives, events: r.events, error: r.error || null };
      }
      fallbackReason = r.error ? `online: ${r.error}` : 'online: sem texto';
    } else {
      fallbackReason = !onlineSupported() ? 'navegador sem reconhecimento online' : !isOnline() ? 'sem internet' : cfg.getConsent() === false ? 'online recusado pelo aluno' : 'online não iniciado';
    }
  }
  const st = await localasr.status().catch(() => 'unsupported');
  if (st !== 'installed') {
    const e = new Error(`nenhum reconhecimento disponível (${fallbackReason || 'local não instalado'})`);
    e.code = 'unavailable'; e.fallbackReason = fallbackReason;
    throw e;
  }
  const r = await localasr.transcribe(blob, opts);
  return { ...r, engine: 'local-model', lang: 'en', status: 'ok', fallbackReason };
}
