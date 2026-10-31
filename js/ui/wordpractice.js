// “Vamos praticar”: chips das palavras + cartão de prática de UMA palavra (ouvir → gravar só a palavra →
// ver o que o app ouviu → repetir/avançar → voltar à frase completa).
// A tentativa isolada usa o mesmo gravador e o mesmo reconhecimento local da frase, mas NÃO é salva:
// o áudio fica só na memória até ser transcrito, e o resultado vale só enquanto a tela está aberta.
// A gravação e a avaliação da frase completa não são tocadas.
import { h, icon, clear } from './dom.js';
import * as player from '../audio/player.js';
import * as recorder from '../audio/recorder.js';
import * as asr from '../audio/asr.js';
import * as localasr from '../audio/localasr.js';
import { analyseBlob } from '../audio/analysis.js';
import { practiceSummary, practiceReason, matchIsolatedWord } from '../engine/practice.js';
import { playWord } from './inlinewords.js';

const WORD_MAX_MS = 6000; // a gravação de uma palavra para sozinha em 6 s

const RESULT = {
  match: { cls: 'ok', mark: 'check', label: 'Reconhecida', text: (w) => `O app reconheceu “${w}”.` },
  mismatch: { cls: 'bad', mark: 'x', label: 'Não reconhecida corretamente', text: () => 'Ouça de novo e tente outra vez.' },
  extra: { cls: 'warn', mark: 'refresh', label: 'Inconclusivo', text: (w) => `O app ouviu outras palavras junto. Diga só “${w}” (pode repetir duas ou três vezes na mesma gravação).` },
  empty: { cls: 'warn', mark: 'refresh', label: 'Nenhuma palavra captada', text: () => 'Fale mais perto do microfone e tente de novo.' },
};
const CHIP = { done: ['check', 'reconhecida'], retry: ['x', 'tente de novo'], todo: ['speaker', 'não praticada'] };

/**
 * opts: { list, session (wordPracticeSession), engine ('model'|'webspeech'), clips, getRate(),
 *         focusWord(w), onFullSentence() }
 * Retorna { el, cancel() } — cancel() encerra uma gravação/transcrição da palavra em andamento.
 */
export function wordPractice({ list, session, engine, clips, getRate, focusWord, onFullSentence }) {
  let sel = null, rec = null, token = 0, error = '';
  const chips = h('div', { class: 'practice-chips', role: 'list' });
  const progress = h('div', { class: 'tiny muted practice-hint', 'data-role': 'wp-progress' });
  const panel = h('div', { class: 'practice-panel hidden', 'data-role': 'word-practice' });
  const footer = h('div', { 'data-role': 'wp-footer' });
  const el = h('div', { class: 'practice', 'data-role': 'practice', 'aria-label': 'Vamos praticar' }, chips, progress, panel, footer);

  const drawChips = () => {
    clear(chips).append(...list.map((x) => {
      const st = session.get(x.key).status;
      const [mark, label] = CHIP[st] || CHIP.todo;
      const b = h('button', { class: `pchip${st === 'done' ? ' done' : ''}`, type: 'button', role: 'listitem', 'aria-pressed': String(sel === x), 'data-status': st,
        'aria-label': `Praticar “${x.text}”: ${practiceReason(x)} · ${label}` }, h('span', { class: 'en', text: x.text }), icon(mark));
      b.onclick = () => select(x);
      return b;
    }));
    const n = session.doneCount(list);
    progress.textContent = n ? `Palavras reconhecidas: ${n} de ${list.length}.` : 'Toque numa palavra para ouvir e praticar.';
  };

  const drawFooter = () => {
    // a frase completa está sempre ao alcance; depois de praticar, o convite fica explícito (e principal se todas foram reconhecidas)
    const practised = list.some((x) => session.get(x.key).tries > 0);
    const all = session.allDone(list);
    clear(footer);
    if (all) footer.append(h('div', { class: 'practice-ok', 'data-role': 'wp-all-done' }, icon('check'), 'Todas as palavras foram reconhecidas.'));
    footer.append(h('button', { class: `btn block${all ? ' primary' : ''}`, type: 'button', 'data-role': 'wp-full', style: { marginTop: '10px' }, onclick: () => full() }, icon('mic'), practised ? 'Agora, pratique a frase completa' : 'Gravar a frase completa'));
  };

  function select(x) {
    if (sel !== x) cancel();
    sel = x; error = '';
    focusWord(x.w);
    playWord(x.audioText);
    draw();
  }

  function draw() {
    drawChips();
    drawFooter();
    if (!sel) return;
    const x = sel, st = session.get(x.key);
    const sentenceClips = clips.filter((c) => new RegExp(`\\b${x.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(c.text));
    const status = h('div', { class: 'wp-status', role: 'status', 'aria-live': 'polite' });
    const actions = h('div', { class: 'wp-actions' });
    if (st.status === 'recording') {
      status.append(h('span', { class: 'wp-dot', 'aria-hidden': 'true' }), h('span', { text: `Gravando… diga só “${x.text}”` }));
      actions.append(h('button', { class: 'btn primary block', type: 'button', 'data-role': 'wp-stop', onclick: () => rec && rec.stop() }, icon('stop'), 'Parar'));
    } else if (st.status === 'processing') {
      status.append(h('span', { class: 'spinner', 'aria-hidden': 'true' }), h('span', { text: 'Reconhecendo a palavra…' }));
    } else {
      if (error) status.append(h('div', { class: 'wp-result warn', role: 'alert', 'data-role': 'wp-error' }, icon('refresh'), h('span', { text: error })));
      else if (st.last) status.append(resultBox(x, st.last));
      else status.append(h('span', { class: 'small muted', text: 'A próxima gravação avalia só esta palavra, não a frase.' }));
      const next = session.next(list, x.key);
      if (st.status === 'done' && !error) {
        // sem próxima palavra pendente, a ação principal é a frase completa (botão do rodapé, em destaque)
        if (next) actions.append(h('button', { class: 'btn primary block', type: 'button', 'data-role': 'wp-next', onclick: () => select(next) }, icon('next'), 'Praticar próxima palavra'));
        actions.append(h('div', { class: 'row wp-secondary' }, h('button', { class: 'link-btn', type: 'button', 'data-role': 'wp-record', onclick: () => practise(x) }, icon('mic'), 'Repetir esta palavra')));
      } else {
        actions.append(h('button', { class: 'btn primary block', type: 'button', 'data-role': 'wp-record', onclick: () => practise(x) }, icon('mic'), st.tries || error ? 'Tentar novamente' : 'Praticar esta palavra'));
        if (next) actions.append(h('div', { class: 'row wp-secondary' }, h('button', { class: 'link-btn', type: 'button', 'data-role': 'wp-skip', onclick: () => select(next) }, 'Próxima palavra', icon('next'))));
      }
    }
    clear(panel).append(
      h('div', { class: 'pp-head' }, h('b', { class: 'en wp-target', text: x.text }), h('span', { class: 'small muted', 'data-role': 'wp-before', text: ` · na frase, ${practiceReason(x)}` })),
      h('div', { class: 'row' },
        h('button', { class: 'btn small', type: 'button', onclick: () => playWord(x.audioText) }, icon('speaker'), 'Ouvir'),
        h('button', { class: 'btn small', type: 'button', onclick: () => playWord(x.audioText, { rate: 0.7 }) }, icon('slow'), 'Devagar'),
        h('button', { class: 'btn small', type: 'button', onclick: () => player.playSequence(sentenceClips.length ? sentenceClips : clips, { rate: getRate() }) }, icon('play'), 'Na frase')),
      status, actions);
    panel.dataset.status = st.status;
    panel.classList.remove('hidden');
  }

  function resultBox(x, m) {
    const r = RESULT[m.status];
    return h('div', { class: `wp-result ${r.cls}`, 'data-role': 'wp-result', 'data-result': m.status },
      h('dl', { class: 'wp-dl' },
        h('dt', { text: 'Palavra esperada' }), h('dd', { class: 'en', text: x.text }),
        h('dt', { text: 'O app ouviu' }), h('dd', { class: 'en', 'data-role': 'wp-heard', text: m.heard ? `“${m.heard}”` : '(nada)' }),
        h('dt', { text: 'Resultado' }), h('dd', { class: 'wp-verdict' }, icon(r.mark), h('b', { text: r.label }))),
      h('p', { class: 'small', text: r.text(x.text) }),
      m.status === 'match' ? h('p', { class: 'tiny muted', text: 'Reconhecida = o reconhecimento entendeu a palavra. Não é uma medição completa da pronúncia.' }) : null);
  }

  async function practise(x) {
    if (rec || sel !== x) return;
    const mine = ++token;
    player.stopAll();
    error = '';
    session.start(x.key);
    draw();
    let session_;
    try {
      session_ = await recorder.start({ maxMs: WORD_MAX_MS });
    } catch (e) {
      if (mine !== token) return;
      session.abort(x.key);
      error = e.userMessage || 'Não foi possível gravar.';
      return draw();
    }
    if (mine !== token) { session_.cancel(); return; }
    const listener = engine === 'webspeech' ? asr.listen({ lang: 'en-GB' }) : null;
    rec = session_;
    draw();
    const res = await session_.stopped;
    rec = null;
    if (mine !== token) { if (listener) listener.stop(); return; }
    session.processing(x.key);
    draw();
    let match;
    try {
      const a = await analyseBlob(res.blob, { expectedWords: 1 });
      if (!a) throw Object.assign(new Error('decode'), { code: 'decode' });
      if (a.silent || a.speechSec < 0.15) {
        if (listener) listener.stop();
        match = { status: 'empty', heard: '' }; // sem voz: o reconhecimento nem é chamado
      } else if (listener) {
        const out = await listener.stop();
        if (!out) throw Object.assign(new Error('webspeech'), { code: 'webspeech' });
        match = matchIsolatedWord(x.text, out.text);
      } else {
        match = matchIsolatedWord(x.text, (await localasr.transcribe(res.blob, { word: true })).text);
      }
    } catch (e) {
      if (mine !== token || e.code === 'cancelled') return;
      session.abort(x.key);
      error = e.code === 'decode' ? 'Não consegui ler esta gravação. Tente novamente.' : 'O reconhecimento falhou nesta tentativa. Tente novamente.';
      return draw();
    }
    if (mine !== token) return;
    session.result(x.key, match); // o áudio da tentativa é descartado aqui (não é salvo)
    draw();
  }

  function full() {
    cancel();
    onFullSentence();
  }

  /** Encerra a tentativa em andamento (troca de palavra, nova gravação da frase, saída da tela). */
  function cancel() {
    token++;
    if (rec) { const r = rec; rec = null; r.cancel(); }
    if (sel) { const st = session.get(sel.key).status; if (st === 'recording' || st === 'processing') session.abort(sel.key); }
  }

  drawChips();
  drawFooter();
  el.prepend(h('span', { class: 'sr-only', text: practiceSummary(list) }));
  return { el, cancel };
}
