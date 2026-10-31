// Expressões interativas no texto (sessões do Lukinhas): a expressão destacada abre um painel com o original, o
// significado, uma explicação para a idade, um exemplo adicional com tradução e o áudio (clipes locais; sem clipe,
// a voz do aparelho). Só aparece em conteúdo que traz esses dados (itens com `explain`); os demais textos não mudam.
import { h, icon, sheet, toast } from './dom.js';
import * as player from '../audio/player.js';
import { locate, categoryLabel } from '../engine/exercises.js';

/** O item tem o apoio pedagógico das sessões (explicação e exemplo adicional)? */
export const hasExpressionCard = (it) => !!(it && it.explain && it.extra);

const play = async (clip) => { const r = await player.play(clip); if (!r.ok) toast('Áudio indisponível neste aparelho.'); };

/** Painel da expressão. */
export function openExpression(it, { sentence = null } = {}) {
  const say = it.en.replace(/\.\.\.$|…$/, '');
  return sheet(h('div', { class: 'expr-card', 'data-role': 'expression', 'data-item': it.id },
    h('div', { class: 'row nowrap' },
      h('div', { class: 'grow' }, h('div', { class: 'word-en en', text: it.en }), h('div', { class: 'small muted', text: categoryLabel(it.c) })),
      h('button', { class: 'icon-btn accent', 'aria-label': `Ouvir “${say}”`, 'data-role': 'expr-audio', onclick: () => play({ key: it.au, text: say }) }, icon('speaker'))),
    h('p', { style: { margin: '10px 0 4px' } }, h('b', { text: 'Significado: ' }), it.pt),
    h('p', { class: 'small', style: { margin: '4px 0 10px' }, text: it.explain }),
    sentence ? h('div', { class: 'small muted', style: { marginBottom: '8px' } }, 'No texto: ', h('span', { class: 'en', text: sentence.en })) : null,
    h('div', { class: 'card flat' },
      h('div', { class: 'tiny muted', text: 'Outro exemplo' }),
      h('p', { class: 'en', style: { margin: '2px 0' }, text: it.extra.en }),
      h('p', { class: 'small muted', style: { margin: 0 }, text: it.extra.pt }),
      h('button', { class: 'btn small', style: { marginTop: '6px' }, 'data-role': 'expr-example-audio', onclick: () => play({ key: it.extra.au, text: it.extra.en }) }, icon('speaker'), 'Ouvir o exemplo'))),
  { label: `Expressão: ${it.en}` });
}

/**
 * Frase com as expressões destacadas e tocáveis. Toque na expressão → painel; toque no resto da frase → onSentence.
 * Expressões sobrepostas: vale a primeira encontrada (ordem da frase).
 */
export function highlightedSentence(content, s, { onSentence } = {}) {
  const hits = [];
  for (const id of s.items) {
    const it = content.items[id];
    if (!hasExpressionCard(it)) continue;
    const loc = locate(it, s.en);
    if (!loc) continue;
    const start = loc.before.length, end = start + loc.target.length;
    if (hits.some((x) => start < x.end && end > x.start)) continue;
    hits.push({ start, end, it });
  }
  hits.sort((a, b) => a.start - b.start);
  const el = h('span', { class: 'sent', role: 'button', tabindex: '0', 'aria-label': `Ouvir: ${s.en}` });
  let pos = 0;
  for (const x of hits) {
    el.append(s.en.slice(pos, x.start));
    const b = h('button', { type: 'button', class: 'hl-expr', 'data-role': 'hl', 'data-item': x.it.id, 'aria-label': `${x.it.en}: ver significado` }, s.en.slice(x.start, x.end));
    b.addEventListener('click', (e) => { e.stopPropagation(); openExpression(x.it, { sentence: s }); });
    el.append(b);
    pos = x.end;
  }
  el.append(s.en.slice(pos));
  if (onSentence) {
    el.addEventListener('click', () => onSentence(s.id));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target === el) onSentence(s.id); });
  }
  return el;
}
