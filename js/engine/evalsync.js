// Avaliação online e fila de tentativas pendentes (Sync Manager) — sem fornecedor fixo e sem segredo no cliente.
// O app só fala com o AI Gateway do próprio produto (endpoint configurado no build: data/dialogues.js →
// evaluation.endpoint). A chave do provedor fica SÓ no backend. Sem endpoint, sem consentimento ou sem conexão, a
// tentativa fica pendente (nada é simulado) e é reenviada depois, com o mesmo attemptId (idempotente).
import { translationRequest, validateTranslationResult } from './dialogueeval.js';
import { activityById, actProgress, applyEvaluation, markRetry, pendingAttempts } from './dialogue.js';

export const evaluationConfig = (pack = globalThis.DRG_DIALOGUES) => {
  const e = (pack && pack.evaluation) || {};
  return { endpoint: typeof e.endpoint === 'string' && /^https:\/\//.test(e.endpoint) ? e.endpoint.replace(/\/+$/, '') : null, timeoutMs: e.timeoutMs || 20000 };
};

/** Por que a avaliação online não pode rodar agora (null = pode). */
export function remoteBlocker({ config, consent, online }) {
  if (!config.endpoint) return { code: 'not-configured', text: 'A avaliação online ainda não está configurada neste aplicativo (falta o serviço seguro de avaliação). Sua resposta fica salva e pendente.' };
  if (!consent) return { code: 'consent', text: 'Para avaliar o sentido da tradução, o texto da sua resposta precisa ser enviado ao serviço de avaliação. Autorize o envio para continuar; sem isso, a resposta fica salva e pendente.' };
  if (!online) return { code: 'offline', text: 'Sem internet: sua resposta ficou salva neste aparelho e será avaliada quando a conexão voltar.' };
  return null;
}

/**
 * Cliente HTTP do AI Gateway. fetchImpl injetável (testes). Resolve o resultado VALIDADO; rejeita em erro de rede/
 * serviço (a tentativa continua pendente). Resposta fora do esquema → inconclusive (nunca aprova).
 */
export function createRemoteEvaluator({ endpoint, timeoutMs = 20000, fetchImpl = globalThis.fetch }) {
  return async function evaluateTranslation(request) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    let res;
    try {
      res = await fetchImpl(`${endpoint}/v1/evaluate/translation`, {
        method: 'POST', headers: { 'content-type': 'application/json', 'idempotency-key': request.attemptId },
        body: JSON.stringify(request), signal: ctrl ? ctrl.signal : undefined, credentials: 'omit', cache: 'no-store',
      });
    } catch (e) {
      throw Object.assign(new Error(e && e.name === 'AbortError' ? 'tempo esgotado' : 'falha de rede'), { retryable: true });
    } finally { if (t) clearTimeout(t); }
    if (res.status === 429 || res.status >= 500) throw Object.assign(new Error(`serviço indisponível (${res.status})`), { retryable: true });
    if (!res.ok) throw Object.assign(new Error(`pedido recusado (${res.status})`), { retryable: res.status === 408 });
    let json;
    try { json = await res.json(); } catch (e) { return validateTranslationResult(null); }
    return validateTranslationResult(json, { attemptId: request.attemptId });
  };
}

/** Pedido de avaliação da tentativa pendente (reconstruído do conteúdo + resposta salva). */
export function requestFor(pack, attempt) {
  const act = activityById(pack, attempt.itemId.replace(/-l\d+$/, ''));
  const line = act && act.lines.find((l) => l.id === attempt.itemId);
  if (!act || !line) return null;
  return translationRequest({ attemptId: attempt.attemptId, act, line, answer: attempt.response });
}

let running = null;
/**
 * Envia as tentativas pendentes (todas as atividades). Uma execução por vez; cada tentativa é aplicada uma única vez.
 * → { sent, applied, failed, skipped }
 */
export function processQueue(store, pack, evaluate, { now = () => Date.now(), force = false, onApplied } = {}) {
  if (running) return running;
  const job = (async () => {
    const out = { sent: 0, applied: 0, failed: 0, skipped: 0 };
    try {
      for (const actId of Object.keys(store.acts)) {
        const act = activityById(pack, actId);
        if (!act) continue;
        const p = actProgress(store, act);
        for (const a of pendingAttempts(p, now(), { force })) {
          if (a.phase !== 'translation') { out.skipped++; continue; }
          const req = requestFor(pack, a);
          if (!req) { out.skipped++; continue; }
          out.sent++;
          a.syncStatus = 'sending';
          try {
            const result = await evaluate(req);
            const r = applyEvaluation(p, a.attemptId, result, now());
            if (r.applied) { out.applied++; if (onApplied) await onApplied(act, a); }
            else if (r.reason === 'still-pending') markRetry(p, a.attemptId, 'avaliação ainda em andamento', now());
          } catch (e) {
            out.failed++;
            markRetry(p, a.attemptId, e.message, now());
          }
        }
      }
    } catch (e) { /* nunca rejeita: o que falhou continua pendente */ }
    return out;
  })();
  running = job;
  job.finally(() => { if (running === job) running = null; });
  return job;
}
