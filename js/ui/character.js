// Personagem na interface: imagem do estado (quando aprovada) ou marcador com a inicial (enquanto pendente).
import { h } from './dom.js';
import { assetFor, STATES } from '../engine/characters.js';

const STATE_LABEL = { idle: 'em espera', thinking: 'pensando', correct: 'acertou', wrong: 'errou', celebrate: 'comemorando', levelup: 'subiu de nível' };

/**
 * Imagem do estado do personagem, ou null se a imagem desse estado ainda não foi aprovada.
 * Usado no meio dos exercícios: sem imagem pronta, a tela continua exatamente como antes.
 */
export function characterImage(ch, state, { size = 56 } = {}) {
  if (!ch || !STATES.includes(state)) return null;
  const src = assetFor(ch, state);
  if (!src) return null;
  return h('img', { class: `char-img char-${state}`, src, width: size, height: size, alt: `${ch.name} ${STATE_LABEL[state]}`, 'data-character': ch.id, 'data-state': state, decoding: 'async' });
}

/** Marcador do personagem (Início, Ajustes): imagem do estado se houver; senão a inicial, sem imagem genérica. */
export function characterBadge(ch, state = 'idle', { size = 44 } = {}) {
  const img = characterImage(ch, state, { size });
  if (img) return img;
  return h('span', { class: 'char-ph', role: 'img', 'aria-label': `${ch.name} (imagem pendente)`, 'data-character': ch.id, 'data-state': state, style: { width: `${size}px`, height: `${size}px` }, text: ch.name[0] });
}
