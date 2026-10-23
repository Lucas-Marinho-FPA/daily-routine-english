// Feedback automático de respostas orais LIVRES (missões “Conte…”, perguntas da teacher, drills).
// Reaproveita a gravação (recwidget.js), o controle de áudio (player.js), o reconhecimento local (localasr.js)
// e o convite de instalação (asrsetup.js). A avaliação em si é pura: engine/freeanswer.js.
import { h, icon, clear } from './dom.js';
import * as player from '../audio/player.js';
import * as localasr from '../audio/localasr.js';
import { audioKey } from '../engine/text.js';
import { segment } from '../engine/wordfeedback.js';
import { latestGate } from '../engine/practice.js';
import { loadLexicon } from '../engine/lexicon.js';
import { analyseFreeAnswer, buildVocab, insufficientAudio, STATUS_LABEL } from '../engine/freeanswer.js';
import { findDivergences, contextPool } from '../engine/context.js';
import { legend } from './inlinewords.js';
import { asrSetupCard, asrOffNotice, runInstall } from './asrsetup.js';

const vocabCache = new WeakMap();
const vocabOf = (content) => { if (!vocabCache.has(content)) vocabCache.set(content, buildVocab(content)); return vocabCache.get(content); };
const fmt = (n) => String(n).replace('.', ',');
const STATE_LABEL = { good: 'Reconhecida', needs_practice: 'Possível erro de reconhecimento', uncertain: 'Não avaliada' };

/**
 * opts: { question, model, modelClips, unit: 'q'|'block'|'routine'|'drill' }
 * Uso: const fa = freeAnswerPanel(App, opts); const w = recWidget(App, { ..., ...fa.hooks }); fa.attach(w);
 */
export function freeAnswerPanel(App, { question = '', model = '', modelClips = [], unit = 'q' }) {
  const el = h('section', { class: 'fb free-fb hidden', 'aria-live': 'polite', 'data-role': 'free-feedback', 'data-state': 'idle' });
  const gate = latestGate();
  let w = null, status = null, alive = true, last = null, pendingSaved = null;
  loadLexicon(); // ~350 KB, já no cache offline; sem ele só a checagem de palavras inexistentes deixa de existir

  const show = (state, ...children) => {
    clear(el).append(...children);
    el.dataset.state = state;
    el.classList.toggle('hidden', !children.filter(Boolean).length);
  };
  const reset = () => {
    gate.invalidate();
    if (localasr.busy()) localasr.release(); // cancela a análise anterior; a gravação não depende do worker
    show('idle');
  };
  const recordAgain = () => { if (!w) return; w.el.scrollIntoView({ block: 'center', behavior: 'smooth' }); w.start(); };
  const againBtn = (label = 'Gravar novamente') => h('button', { class: 'btn small', type: 'button', onclick: recordAgain }, icon('mic'), label);
  const mineBtn = () => h('button', { class: 'btn small', type: 'button', onclick: () => w && w.audioEl.src && player.playElement(w.audioEl, { restart: true }) }, icon('play'), 'Ouvir minha resposta');

  async function refreshStatus() {
    status = await localasr.status();
    if (!alive) return;
    if (pendingSaved) { const r = pendingSaved; pendingSaved = null; loaded(r); }
    else if (status !== 'installed' && el.dataset.state === 'idle' && last) unavailable();
  }

  /** Sem o modelo local: convite (uma vez), linha compacta depois de “Agora não”, ou o motivo. */
  function unavailable() {
    const installed = () => { status = 'installed'; if (last) analyse(last.blob, last.analysis); else show('idle'); };
    if (status === 'not-installed' && App.state.settings.asrPrompt !== 'later') {
      return show('setup', h('p', { class: 'small muted', text: 'Sua gravação está salva. Para receber a transcrição e o feedback automático, instale o reconhecimento de fala local.' }),
        asrSetupCard(App, { onInstalled: installed, onLater: () => unavailable() }));
    }
    if (status === 'not-installed') return show('unavailable', asrOffNotice(App, { onInstalled: installed }));
    show('unavailable', h('p', { class: 'small muted', text: `Análise automática indisponível aqui: ${localasr.unsupportedReason() || 'reconhecimento local ausente'}. A gravação continua salva.` }));
  }

  async function analyse(blob, analysis, saved = null) {
    const ticket = gate.next();
    last = { blob, analysis };
    if (!saved && status !== 'installed') return unavailable();
    let text = saved ? saved.text : null;
    if (!saved && !insufficientAudio(analysis)) {
      const prog = h('span', { class: 'small muted' });
      show('analysing', h('div', { class: 'fb-analysing', role: 'status' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), 'Analisando sua resposta…', prog));
      try {
        const res = await localasr.transcribe(blob, { long: true, onProgress: (i, n) => { if (n > 1) prog.textContent = ` parte ${i} de ${n}`; } });
        text = res.text;
      } catch (e) {
        if (!alive || !gate.isCurrent(ticket) || e.code === 'cancelled') return;
        return error(e, blob, analysis);
      }
    }
    await loadLexicon();
    if (!alive || !gate.isCurrent(ticket)) return; // nova gravação ou tela fechada: resultado antigo descartado
    const grammar = text && App.checker ? App.checker.coverage(text, { keywords: [] }).grammar : [];
    // camada contextual: hipóteses de erro do reconhecedor (a transcrição em si não é alterada)
    const divergences = text && App.checker ? findDivergences(text, { checker: App.checker, pool: contextPool(App.content, App.checker), model }) : [];
    const naturalness = text && App.checker ? App.checker.naturalness(text) : [];
    const r = analyseFreeAnswer({ question, model, unit, transcript: text || '', analysis, vocab: vocabOf(App.content), grammar, divergences, naturalness });
    render(r, !!saved);
    if (!saved && text !== null && w) w.updateMeta(blob, { free: { text, at: Date.now() } });
  }

  function error(e, blob, analysis) {
    const msg = e.code === 'too-long'
      ? `Sua resposta tem ${Math.round(e.secs)} s; a análise automática vai até ${Math.round(e.max / 60)} min. Ela não foi cortada nem avaliada. Grave uma versão mais curta (por exemplo, um bloco por vez).`
      : { load: 'O reconhecimento não carregou neste momento.', timeout: 'A análise demorou demais e foi interrompida.', decode: 'Não consegui ler esta gravação.' }[e.code] || 'A análise falhou nesta gravação.';
    const actions = h('div', { class: 'row fb-actions' });
    const help = h('div', { class: 'small' });
    if (e.code === 'too-long' || e.code === 'decode') actions.append(againBtn());
    else actions.append(h('button', { class: 'btn small primary', type: 'button', onclick: () => analyse(blob, analysis) }, icon('refresh'), 'Tentar de novo'));
    if (e.code === 'load') {
      actions.append(h('button', { class: 'btn small', type: 'button', onclick: async (ev) => {
        ev.currentTarget.disabled = true;
        const v = await localasr.verify();
        if (v.ok) { help.textContent = 'Os arquivos do reconhecimento estão íntegros. Tente de novo; se continuar falhando, feche e reabra o app.'; return; }
        clear(help).append(h('p', { text: 'Arquivos do reconhecimento incompletos. É preciso baixá-los de novo (precisa de internet).' }),
          h('button', { class: 'btn small primary', type: 'button', onclick: async () => { if (await runInstall(help)) analyse(blob, analysis); } }, icon('download'), 'Baixar de novo'));
      } }, icon('target'), 'Verificar instalação'));
    }
    show('error', h('div', { class: 'fb-error', role: 'alert' }, h('b', { text: msg }), ' ', h('span', { class: 'muted', text: 'Nenhuma avaliação foi gerada. Sua gravação continua salva e a missão pode seguir normalmente.' })),
      actions, help, h('details', { class: 'more' }, h('summary', { text: 'Detalhes técnicos' }), h('p', { class: 'tiny muted', text: `${e.code || 'erro'}: ${e.message}` })));
  }

  function render(r, fromSaved) {
    if (r.status === 'inconclusive') {
      return show('inconclusive', h('div', { class: 'fa-head' }, h('span', { class: 'chip', text: STATUS_LABEL.inconclusive })),
        h('p', { class: 'fa-msg', text: r.message }),
        r.transcript ? transcriptBox(r) : null,
        h('div', { class: 'row fb-actions' }, againBtn()));
    }
    const chips = h('div', { class: 'practice-chips', role: 'list' });
    const panel = h('div', { class: 'practice-panel hidden', 'aria-live': 'polite' });
    const tb = transcriptBox(r, (i) => focusPractice(i));
    function focusPractice(i) {
      const x = r.practice.find((p) => p.w === i || (p.ws && p.ws.includes(i)));
      tb.focus(x && x.ws ? x.ws : i);
      chips.querySelectorAll('.pchip').forEach((b) => b.setAttribute('aria-pressed', String(!!x && Number(b.dataset.w) === x.w)));
      if (!x) { panel.classList.add('hidden'); return; }
      if (x.ws) tb.focus(x.ws);
      // áudio de referência só quando existe de fato: a palavra isolada, ou a frase do conteúdo com o trecho esperado
      const refKey = x.ref ? audioKey(x.ref.toLowerCase().replace(/[.,!?;:]+$/, '')) : null;
      const hasRef = refKey && player.hasEmbedded(refKey);
      const hasSentence = x.refAu && player.hasEmbedded(x.refAu);
      if (hasRef) player.play({ key: refKey, text: x.ref });
      else if (hasSentence) player.play({ key: x.refAu, text: x.refText });
      clear(panel).append(
        h('p', { class: 'small', text: x.reason }),
        h('div', { class: 'row' },
          hasRef ? h('button', { class: 'btn small', type: 'button', onclick: () => player.play({ key: refKey, text: x.ref }) }, icon('speaker'), `Ouvir “${x.ref}”`) : null,
          hasSentence ? h('button', { class: 'btn small', type: 'button', onclick: () => player.play({ key: x.refAu, text: x.refText }) }, icon('speaker'), 'Ouvir a frase de referência') : null,
          mineBtn(),
          modelClips.length ? h('button', { class: 'btn small', type: 'button', onclick: () => player.playSequence(modelClips) }, icon('play'), 'Ouvir o exemplo') : null),
        h('p', { class: 'tiny muted', text: hasRef || hasSentence ? 'Ouça sua gravação e a referência. Se o app ouviu errado, está tudo certo; se a palavra saiu diferente, repita e grave de novo.' : 'Não há áudio de referência para este trecho; compare com sua gravação e com o exemplo.' }),
        h('button', { class: 'btn primary block', type: 'button', onclick: recordAgain }, icon('mic'), 'Gravar a resposta de novo'));
      panel.classList.remove('hidden');
    }
    for (const x of r.practice) {
      const b = h('button', { class: 'pchip', type: 'button', role: 'listitem', 'aria-pressed': 'false', 'data-w': String(x.w), 'aria-label': `Revisar “${x.text}”` },
        h('span', { class: 'en', text: x.text }), icon(x.ref ? 'speaker' : 'eye'));
      b.onclick = () => focusPractice(x.w);
      chips.append(b);
    }
    const m = r.metrics;
    const metricRow = (label, value) => h('li', {}, h('span', { class: 'muted', text: `${label}: ` }), value === null ? h('i', { text: 'indisponível' }) : h('b', { text: value }));
    show('result',
      h('div', { class: 'fa-head' }, h('span', { class: `chip fa-status fa-${r.status}`, text: STATUS_LABEL[r.status] }), fromSaved ? h('span', { class: 'tiny muted', text: 'última resposta gravada' }) : null),
      h('p', { class: 'fa-msg', text: r.message }),
      h('ul', { class: 'fa-check', 'aria-label': 'Critérios da resposta' }, r.checklist.map((c) => h('li', { class: c.ok ? 'ok' : 'no' },
        h('span', { class: 'fa-mark', 'aria-hidden': 'true', text: c.ok ? '✓' : '○' }), c.label, h('span', { class: 'sr-only', text: c.ok ? ' (sim)' : c.required ? ' (não)' : ' (sugestão)' })))),
      tb.el,
      r.practice.length ? h('div', { class: 'practice', 'data-role': 'free-practice', 'aria-label': 'Palavras para revisar' }, chips,
        h('div', { class: 'tiny muted practice-hint', text: 'Possíveis erros do reconhecimento, não erros de pronúncia comprovados. Toque para conferir.' }), panel) : null,
      r.tips.length ? h('div', { class: 'fa-tips' }, h('b', { class: 'small', text: 'Para melhorar a resposta' }),
        h('ul', { class: 'small' }, r.tips.map((t) => h('li', { text: t })))) : null,
      r.language && (r.language.grammar.length || r.language.naturalness.length) ? h('div', { class: 'fa-tips', 'data-role': 'fa-language' }, h('b', { class: 'small', text: 'Gramática e naturalidade' }),
        h('ul', { class: 'small' }, r.language.naturalness.map((t) => h('li', { text: t })), r.language.grammar.map((t) => h('li', { text: t }))),
        h('div', { class: 'tiny muted', text: 'Com base na transcrição automática: confira ouvindo sua gravação.' })) : null,
      h('div', { class: 'row fb-actions' }, mineBtn(), againBtn()),
      h('details', { class: 'more' }, h('summary', { text: 'Ritmo e pausas' }),
        h('ul', { class: 'small fa-metrics' },
          metricRow('Duração da gravação', m.totalSec === null ? null : `${fmt(m.totalSec)} s`),
          metricRow('Do início ao fim da fala', m.speechSec === null ? null : `${fmt(m.speechSec)} s`),
          metricRow('Velocidade estimada', m.wpm === null ? null : `~${m.wpm} palavras/min`),
          metricRow('Pausas (≥ 0,3 s)', m.pauses),
          metricRow('Pausas longas (≥ 0,8 s)', m.longPauses)),
        h('p', { class: 'tiny muted', text: 'Medido no aparelho a partir da gravação e da transcrição. Falar mais rápido não significa falar melhor; pausas curtas para pensar são normais.' })),
      h('details', { class: 'more' }, h('summary', { text: 'Como esta avaliação funciona' }),
        h('ul', { class: 'small' },
          h('li', {}, h('b', { text: 'Reconhecimento: ' }), 'a transcrição é automática e pode errar palavras; marcações em âmbar indicam possíveis divergências do reconhecedor.'),
          h('li', {}, h('b', { text: 'Resposta: ' }), 'confere se você falou do tema da pergunta e trouxe o que ela pede. Não precisa repetir o exemplo: outras palavras valem.'),
          h('li', {}, h('b', { text: 'Ritmo: ' }), 'duração, tempo de fala, velocidade e pausas, quando foi possível medir.'),
          h('li', {}, h('b', { text: 'Pronúncia: ' }), r.pronunciation.note))));
  }

  /** Transcrição com realce por palavra (verde reconhecida, âmbar revisar, cinza não avaliada). */
  function transcriptBox(r, onPick) {
    const detail = h('div', { class: 'word-detail hidden', role: 'status' });
    const spans = [];
    const p = h('p', { class: 'fa-text en', lang: 'en' });
    const states = new Map(r.words.map((x) => [x.w, x]));
    for (const seg of segment(r.transcript)) {
      if (seg.w === undefined) { p.append(document.createTextNode(seg.text)); continue; }
      const info = states.get(seg.w) || { state: 'uncertain', reason: '' };
      const span = h('span', { class: `w w-${info.state}`, role: 'button', tabindex: '0', 'data-state': info.state, 'aria-label': `${seg.text}: ${STATE_LABEL[info.state]}`, text: seg.text });
      const pick = () => {
        spans.forEach((s) => s.classList.toggle('w-focus', s === span));
        if (onPick && info.state === 'needs_practice') { detail.classList.add('hidden'); return onPick(seg.w); }
        const clean = seg.text.replace(/[.,!?;:]+$/, '').toLowerCase();
        const key = audioKey(clean);
        clear(detail).append(h('div', { class: 'row nowrap' }, h('b', { class: 'en', text: seg.text }), h('span', { class: `chip w-chip-${info.state}`, text: STATE_LABEL[info.state] }), h('span', { class: 'spacer' }),
          player.hasEmbedded(key) ? h('button', { class: 'btn small', type: 'button', onclick: () => player.play({ key, text: clean }) }, icon('speaker'), 'Ouvir') : null),
        h('div', { class: 'small', style: { marginTop: '4px' }, text: info.reason }));
        detail.classList.remove('hidden');
      };
      span.addEventListener('click', pick);
      span.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
      span.dataset.w = String(seg.w);
      spans.push(span);
      p.append(span);
    }
    const lg = legend();
    lg.querySelectorAll('.lg')[1].lastChild.textContent = STATE_LABEL.needs_practice;
    const box = h('div', { class: 'fa-transcript' },
      h('div', { class: 'fa-tlabel' }, h('span', { class: 'eyebrow', text: 'O que o app ouviu' }), h('span', { class: 'tiny muted', text: ' · transcrição automática, pode conter erros' })),
      p, lg, detail);
    // i: índice de uma palavra ou lista de índices (trecho inteiro)
    return { el: box, focus: (i) => { const set = new Set([].concat(i)); spans.forEach((s) => s.classList.toggle('w-focus', set.has(Number(s.dataset.w)))); } };
  }

  function loaded(rec) {
    if (!alive || !rec) return;
    const meta = rec.meta || {};
    last = { blob: rec.blob, analysis: meta.analysis || null };
    if (meta.free) return analyse(rec.blob, meta.analysis || null, { text: meta.free.text });
    if (status === 'installed') return analyse(rec.blob, meta.analysis || null); // gravada antes de instalar: analisa uma vez
    unavailable();
  }

  const hooks = {
    onStart: () => reset(),
    onRecorded: (blob, analysis) => analyse(blob, analysis),
    onLoaded: (rec) => { if (status === null) pendingSaved = rec; else loaded(rec); },
    onDeleted: () => { reset(); last = null; },
  };
  refreshStatus();

  return {
    el, hooks,
    attach(widget) { w = widget; },
    destroy() { alive = false; gate.invalidate(); localasr.release(); },
  };
}
