// Texto-alvo com feedback inline: a frase continua corrida; cada palavra é um <span> no mesmo fluxo.
// Antes da avaliação não há nenhuma marcação. Depois, a cor vem com um indicador não cromático
// (sublinhado diferente) e um toque na palavra mostra a explicação em texto.
import { h, icon, clear } from './dom.js';
import { segment, wordAudioText } from '../engine/wordfeedback.js';
import * as player from '../audio/player.js';
import { audioKey } from '../engine/text.js';

const LABEL = { good: 'Reconhecida', needs_practice: 'Possível erro de reconhecimento (ou de pronúncia — o app não sabe qual)', uncertain: 'Não avaliada' };

/** Toca o áudio isolado de uma palavra (voz britânica embutida; sem ele, a voz do sistema). */
export const playWord = (audioText, opts) => player.play({ key: audioKey(audioText), text: audioText }, opts);

/**
 * paragraphs: string[] (cada parágrafo original vira um <p>; as palavras ficam no fluxo do parágrafo)
 * Retorna { el, text, apply(evaluation), reset(), wordEls }
 */
export function inlineWords(paragraphs) {
  const text = paragraphs.join('\n\n');
  const wordEls = [];
  const detail = h('div', { class: 'word-detail hidden', role: 'status', 'aria-live': 'polite' });
  let results = null;
  let selected = null;

  const paras = paragraphs.map((p) => {
    const el = h('p', { class: 'para target-text', lang: 'en' });
    for (const seg of segment(p)) {
      if (seg.w === undefined) { el.append(document.createTextNode(seg.text)); continue; }
      const span = h('span', { class: 'w', text: seg.text });
      span.dataset.i = String(wordEls.length);
      span.dataset.audio = wordAudioText(seg);
      span.addEventListener('click', () => select(Number(span.dataset.i)));
      span.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(Number(span.dataset.i)); } });
      wordEls.push(span);
      el.append(span);
    }
    return el;
  });

  function select(i) {
    if (!results) { playWord(wordEls[i].dataset.audio); return; } // antes da avaliação: só ouvir a palavra
    const r = results[i];
    if (selected !== null && wordEls[selected]) wordEls[selected].classList.remove('w-sel');
    selected = i;
    wordEls[i].classList.add('w-sel');
    const word = wordEls[i].textContent;
    clear(detail).append(
      h('div', { class: 'row nowrap' },
        h('b', { class: 'en', text: word }), h('span', { class: `chip w-chip-${r.state}`, text: LABEL[r.state] || r.state }),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn small', type: 'button', onclick: () => playWord(wordEls[i].dataset.audio) }, icon('speaker'), 'Ouvir')),
      h('div', { class: 'small', style: { marginTop: '4px' }, text: r.reason }));
    detail.classList.remove('hidden');
  }

  function apply(evaluation) {
    results = evaluation.words.map((x) => ({ state: x.state, reason: x.reason }));
    wordEls.forEach((el, i) => {
      const st = results[i] ? results[i].state : 'uncertain';
      el.className = `w w-${st}`;
      el.dataset.state = st;
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', `${el.textContent}: ${LABEL[st] || st}`);
    });
    detail.classList.add('hidden');
    selected = null;
  }

  function reset() {
    results = null;
    selected = null;
    wordEls.forEach((el) => { el.className = 'w'; delete el.dataset.state; el.removeAttribute('role'); el.removeAttribute('tabindex'); el.removeAttribute('aria-label'); });
    detail.classList.add('hidden');
  }

  /** Destaca uma palavra (prática em andamento); i = null remove o destaque. */
  function focus(i) {
    wordEls.forEach((el, k) => el.classList.toggle('w-focus', k === i));
  }

  return { el: h('div', { class: 'target-wrap' }, ...paras), detail, text, apply, reset, focus, wordEls };
}

/** Legenda compacta: três indicadores (ponto colorido + rótulo curto; a cor nunca é a única informação). */
export function legend() {
  const item = (st, label) => h('span', { class: 'lg', role: 'listitem' }, h('i', { class: `dot dot-${st}`, 'aria-hidden': 'true' }), label);
  return h('div', { class: 'w-legend', role: 'list', 'aria-label': 'Legenda das cores' },
    item('good', 'Reconhecida'), item('needs_practice', 'Possível erro'), item('uncertain', 'Não avaliada'));
}

/**
 * Resumo da tentativa: nota estimada (só quando a lógica de wordfeedback tem evidência) + frase de orientação.
 * Os detalhes (dimensões, pesos, transcrição) ficam em scoreDetails, recolhidos.
 */
export function scoreLine(score, summary) {
  const head = score.overall === null
    ? h('div', { class: 'score-head' }, h('span', { class: 'chip', text: 'Sem nota geral' }))
    : h('div', { class: 'score-head' }, h('b', { class: 'score-num', text: `${score.overall}/100` }), h('span', { class: 'score-tag', text: score.partial ? 'Avaliação parcial' : 'Avaliação' }));
  return h('div', { class: 'score-line' }, head, summary ? h('p', { class: 'score-summary', text: summary }) : null);
}

/** “Ver o que o app ouviu”: transcrição, motivo e dimensões da nota — recolhido, para consulta. */
export function scoreDetails(score, { heard = null, engine = null, note = '' } = {}) {
  return h('details', { class: 'more fb-details' },
    h('summary', { text: 'Ver o que o app ouviu' }),
    heard !== null ? h('p', { class: 'small' }, h('span', { class: 'muted', text: 'Transcrição: ' }), h('span', { class: 'en', text: heard ? `“${heard}”` : '(nada reconhecido)' })) : h('p', { class: 'small muted', text: 'Nenhuma transcrição nesta tentativa.' }),
    note ? h('p', { class: 'small muted', text: note }) : null,
    score ? h('ul', { class: 'small dims' }, score.dims.map((d) => h('li', {}, `${d.label} (peso ${Math.round(d.weight * 100)}%): `,
      d.score === null ? h('i', { text: `não avaliado — ${d.note}` }) : h('b', { text: `${d.score}/100` })))) : null,
    h('p', { class: 'tiny muted', text: `${engine === 'model' ? 'Reconhecimento local (Moonshine), no aparelho.' : engine === 'webspeech' ? 'Reconhecimento do Chrome, no aparelho.' : ''} As cores indicam se cada palavra foi reconhecida, não qual som foi dito; sotaque não é erro. Pesos da nota: hipóteses iniciais, não validadas.` }));
}
