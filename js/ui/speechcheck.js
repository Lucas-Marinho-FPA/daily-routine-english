// Diagnóstico INTEGRADO do reconhecimento de voz (Ajustes → Áudio): grava/reconhece uma frase real pelo MESMO caminho
// das atividades (recorder.start → speech.listen no modo online / gravação + Moonshine no modo Moonshine →
// speech.transcribe) e mostra, a partir do registro dessa tentativa, onde o fluxo parou. Não é uma implementação
// paralela: se as atividades falham, este teste falha do mesmo jeito. Nada sai do aparelho além do que o próprio modo
// já envia (online: o serviço do navegador); o registro copiado não contém áudio nem o texto falado.
import { h, icon, clear, toast } from './dom.js';
import * as recorder from '../audio/recorder.js';
import * as speech from '../audio/speech.js';

const has = (e, n) => !!e && e.events.some((x) => x.e === n);

/** Itens verificados na última tentativa: [{ label, ok: true | false | null, detail }]. */
export function checklist(e, { heard = null, mode = speech.mode() } = {}) {
  if (!e) return [];
  const online = e.engine === 'online';
  const expected = mode === 'online' ? 'online' : mode === 'local' ? 'local-model' : null;
  return [
    { label: 'Microfone capturou', ok: online ? has(e, 'audiostart') : !e.micError && (e.bytes || 0) > 0,
      detail: online ? (has(e, 'audiostart') ? `sim (o reconhecimento abriu o microfone${has(e, 'speechstart') || has(e, 'soundstart') ? ' e detectou fala' : ''})` : 'não (sem “audiostart”)')
        : e.micError ? `não (${e.micError})` : `${e.bytes || 0} bytes gravados${has(e, 'fala detectada') ? ', fala detectada' : ''}` },
    { label: 'Reconhecimento iniciou', ok: online ? (has(e, 'start') || has(e, 'audiostart')) && !e.startError : !!e.requested,
      detail: online ? (e.startError || (has(e, 'start') ? `sim (${e.sessions || 1} sessão(ões))` : 'não (sem “start”)')) : e.requested ? 'sim (Moonshine)' : 'não pedido' },
    { label: 'Resultado chegou', ok: online ? (e.finals || 0) + (e.partials || 0) > 0 && !!e.words : !!e.words,
      detail: online ? `parciais: ${e.partials || 0} · finais: ${e.finals || 0} · palavras: ${e.words || 0}${e.error ? ` · erro: ${e.error}` : ''}` : `palavras: ${e.words || 0}${e.deliveryError ? ` · ${e.deliveryError}` : ''}` },
    { label: 'Transcrição entregue', ok: !!e.delivered && heard !== null, detail: e.delivered && heard !== null ? `“${heard}”` : 'não entregue' },
    { label: 'Mecanismo = modo escolhido', ok: expected ? e.engine === expected : null,
      detail: `motor: ${online ? 'online (navegador)' : 'Moonshine (aparelho)'} · modo: ${mode === 'online' ? 'online' : mode === 'local' ? 'Moonshine' : 'não escolhido'}` },
  ];
}

export function speechCheckPanel(App, { phrase = 'I wake up at five, take a shower and brush my teeth.' } = {}) {
  const out = h('div', { 'data-role': 'speech-check-out', style: { marginTop: '8px' } });
  const btn = h('button', { class: 'btn small primary', type: 'button', 'data-role': 'speech-check-start' }, icon('mic'), 'Testar reconhecimento');
  let session = null;
  const finish = () => { if (session) session.stop(); };

  btn.onclick = async () => {
    if (session) return finish();
    clear(out);
    try { session = await recorder.start({ source: 'diagnóstico (Ajustes → Áudio)' }); } catch (e) {
      out.append(h('div', { class: 'notice warn small', text: e.userMessage || `Não foi possível iniciar (${e.message}).` }));
      return;
    }
    clear(btn).append(icon('stop'), 'Parar');
    out.append(h('p', { class: 'small', 'data-role': 'speech-check-status' }, 'Ouvindo… diga a frase acima. Para sozinho quando você terminar (ou toque em Parar).'));
    const res = await session.stopped;
    session = null;
    clear(btn).append(icon('mic'), 'Testar de novo');
    clear(out).append(h('p', { class: 'small muted', text: 'Reconhecendo…' }));
    let heard = null, err = null;
    try { heard = (await speech.transcribe(res.blob, { word: false })).text; } catch (e) { err = e; }
    const e = speech.lastAttempt();
    const v = speech.verdict(e);
    clear(out).append(
      h('ul', { class: 'small', 'data-role': 'speech-check-list', style: { paddingLeft: '18px', margin: '4px 0' } },
        checklist(e, { heard }).map((x) => h('li', { 'data-ok': String(x.ok) }, x.ok === true ? '✅ ' : x.ok === false ? '❌ ' : '— ', h('b', { text: x.label }), `: ${x.detail}`))),
      h('p', { class: 'small', 'data-role': 'speech-check-verdict' }, h('b', { text: v.code === 'ok' ? 'Funcionou: ' : 'Parou em: ' }), `[${v.code}] ${v.text}`),
      err ? h('p', { class: 'tiny muted', text: err.message }) : null,
      h('p', { class: 'tiny muted', text: 'Use “Copiar registro do reconhecimento” para enviar o diagnóstico (sem áudio e sem o texto falado).' }));
  };

  return h('div', { class: 'card flat', 'data-role': 'speech-check', style: { marginTop: '10px' } },
    h('b', { text: 'Diagnóstico do reconhecimento (mesmo caminho das atividades)' }),
    h('p', { class: 'small en', lang: 'en', style: { margin: '6px 0' }, text: phrase }),
    btn, out);
}
