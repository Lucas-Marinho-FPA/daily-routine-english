// Ilustrações narrativas (personagens, capas e cenários das sessões). Só imagens APROVADAS entram: a lista vem de
// data/illustrations.js (gerado de dev/content/illustrations.json). Sem imagem aprovada, a tela mostra um espaço
// neutro com o título — nunca uma imagem genérica no lugar de um personagem. Os arquivos ficam em img/illustrations/
// e entram no cache offline como os demais (o service worker pré-carrega tudo o que o build encontra).
import { h } from './dom.js';

const registry = () => globalThis.DRG_ILLUSTRATIONS || { characters: {}, sessions: {} };

/** Caminho aprovado (ou null): sessão → cover/scene; personagem → estado (ex.: idle). */
export function illustrationSrc(kind, id, variant = 'cover') {
  const reg = registry();
  const entry = kind === 'character' ? (reg.characters || {})[id] : (reg.sessions || {})[id];
  if (!entry) return null;
  return typeof entry === 'string' ? entry : entry[variant] || null;
}

/**
 * Espaço de ilustração com proporção fixa (sem “pulo” de layout). Com imagem aprovada: <img> com carregamento
 * preguiçoso; se o arquivo faltar, cai no espaço neutro. Sem imagem: espaço neutro decorativo (aria-hidden).
 */
export function illustration({ kind = 'session', id, variant = 'cover', alt = '', label = '', ratio = '16 / 7', cls = '' } = {}) {
  const src = illustrationSrc(kind, id, variant);
  const fallback = () => h('div', { class: 'ill-fallback', 'aria-hidden': 'true' }, label ? h('span', { text: label }) : null);
  const box = h('figure', { class: `ill ${cls}`.trim(), style: { aspectRatio: ratio }, 'data-role': 'illustration', 'data-state': src ? 'image' : 'empty' });
  if (!src) { box.append(fallback()); return box; }
  const img = h('img', { src, alt, loading: 'lazy', decoding: 'async' });
  img.addEventListener('error', () => { box.dataset.state = 'missing'; box.replaceChildren(fallback()); }, { once: true });
  box.append(img);
  return box;
}
