// Reconhecimento de fala SOMENTE no aparelho (Chrome: processLocally = true).
// O modo padrão do Chrome envia áudio a servidores externos e por isso nunca é usado.
// Isto mede a correspondência entre o texto esperado e o reconhecido — não é nota de pronúncia.

const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;

let memo = null;
/** Último status já consultado (sem consultar de novo), ou null. */
export const cachedStatus = () => memo;

/** 'available' | 'downloadable' | 'downloading' | 'unavailable' | 'unsupported' — consulta sob demanda e memoriza. */
export async function status(lang = 'en-GB') {
  memo = await queryStatus(lang);
  return memo;
}

async function queryStatus(lang) {
  if (!SR || !('processLocally' in SR.prototype)) return 'unsupported';
  try {
    if (typeof SR.available === 'function') return await SR.available({ langs: [lang], processLocally: true });
    if (typeof SR.availableOnDevice === 'function') return await SR.availableOnDevice(lang);
  } catch (e) { return 'unavailable'; }
  return 'unsupported';
}

/** Instala o modelo local (download único feito pelo Chrome, iniciado pelo usuário). */
export async function install(lang = 'en-GB') {
  if (!SR) return false;
  try {
    if (typeof SR.install === 'function') return await SR.install({ langs: [lang], processLocally: true });
    if (typeof SR.installOnDevice === 'function') return await SR.installOnDevice(lang);
  } catch (e) { return false; }
  return false;
}

/** Reconhece uma fala, em modo local. Resolve { text, confidence, alternatives } ou rejeita com mensagem. */
export function recognise({ lang = 'en-GB', timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!SR) return reject(new Error('Reconhecimento indisponível'));
    const rec = new SR();
    if (!('processLocally' in rec)) return reject(new Error('Este navegador não oferece reconhecimento no aparelho'));
    rec.processLocally = true;
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    let done = false;
    const timer = setTimeout(() => { if (!done) { done = true; try { rec.abort(); } catch (e) { /* ok */ } reject(new Error('Tempo esgotado')); } }, timeoutMs);
    rec.onresult = (e) => {
      if (done) return;
      done = true; clearTimeout(timer);
      const alts = [...e.results[0]].map((a) => ({ text: a.transcript, confidence: a.confidence }));
      resolve({ text: alts[0].text, confidence: alts[0].confidence, alternatives: alts });
    };
    rec.onerror = (e) => { if (!done) { done = true; clearTimeout(timer); reject(new Error(e.error === 'no-speech' ? 'Não ouvi nada' : e.error)); } };
    rec.onend = () => { if (!done) { done = true; clearTimeout(timer); reject(new Error('Sem resultado')); } };
    try { rec.start(); } catch (e) { done = true; clearTimeout(timer); reject(e); }
  });
}
