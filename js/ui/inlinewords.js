// Texto-alvo com feedback inline: a frase continua corrida; cada palavra é um <span> no mesmo fluxo.
// Antes da avaliação não há nenhuma marcação. Depois, a cor vem com um indicador não cromático
// (sublinhado diferente) e um toque na palavra mostra a explicação em texto.
import { h, clear } from './dom.js';
import { segment } from '../engine/wordfeedback.js';
import * as player from '../audio/player.js';
import { audioKey } from '../engine/text.js';

const LABEL = { good: 'Reconhecida como esperado', needs_practice: 'Precisa de prática', uncertain: 'Não avaliada / inconclusiva' };

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
      span.addEventListener('click', () => select(Number(span.dataset.i)));
      span.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(Number(span.dataset.i)); } });
      wordEls.push(span);
      el.append(span);
    }
    return el;
  });

  function select(i) {
    if (!results) return; // antes da avaliação, tocar na palavra não faz nada
    const r = results[i];
    if (selected !== null && wordEls[selected]) wordEls[selected].classList.remove('w-sel');
    selected = i;
    wordEls[i].classList.add('w-sel');
    const word = wordEls[i].textContent;
    clear(detail).append(
      h('div', { class: 'row nowrap' },
        h('b', { class: 'en', text: word }), h('span', { class: `chip w-chip-${r.state}`, text: LABEL[r.state] || r.state }),
        h('span', { class: 'spacer' }),
        h('button', { class: 'btn small', type: 'button', onclick: () => player.play({ key: audioKey(word.replace(/[.,!?;:]+$/, '')), text: word }) }, 'Ouvir')),
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

  return { el: h('div', { class: 'target-wrap' }, ...paras), detail, text, apply, reset, wordEls };
}

/** Legenda compacta numa linha (cor + forma do sublinhado + texto). */
export function legend() {
  return h('div', { class: 'w-legend tiny muted' },
    h('span', { class: 'w w-good', text: 'reconhecida' }), ' ',
    h('span', { class: 'w w-needs_practice', text: 'praticar' }), ' ',
    h('span', { class: 'w w-uncertain', text: 'não avaliada' }),
    ' · toque numa palavra para ver o motivo');
}

/** Nota geral compacta (uma linha + detalhes recolhidos). */
export function scoreLine(score) {
  const head = score.overall === null
    ? h('span', { class: 'chip', text: 'Sem nota geral' })
    : h('span', { class: 'chip accent', text: `Nota estimada ${score.overall}/100${score.partial ? ' · parcial' : ''}` });
  const det = h('details', { class: 'score-details tiny' },
    h('summary', { text: score.message }),
    h('ul', {}, score.dims.map((d) => h('li', {}, `${d.label} (peso ${Math.round(d.weight * 100)}%): `,
      d.score === null ? h('i', { text: `não avaliado — ${d.note}` }) : h('b', { text: `${d.score}/100` })))),
    h('div', { text: 'Pesos iniciais (hipóteses, não validados cientificamente). A nota não mede “perfeição” e uma gravação ruim não gera nota baixa: gera resultado inconclusivo.' }));
  return h('div', { class: 'score-line' }, head, det);
}
