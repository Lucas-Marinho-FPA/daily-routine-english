// Personagem na interface: escolha pelo nome (primeira abertura, Início), imagem do estado (quando aprovada) ou
// marcador com a inicial (enquanto pendente).
import { h, clear, toast } from './dom.js';
import { assetFor, STATES, registry } from '../engine/characters.js';

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

/** Linha curta sob o nome na escolha (só texto do cadastro; nada inventado). */
function choiceSub(c) {
  const occ = c.profile && c.profile.occupation ? c.profile.occupation.pt : (c.profile && c.profile.summary) || '';
  if (c.status === 'planned') return 'Jornada em preparação · progresso próprio desde já';
  return `${occ.charAt(0).toUpperCase()}${occ.slice(1)}${c.status === 'preview' ? ' · em preparação' : ''}`;
}

/**
 * Opções de personagem só com o nome (sem imagem nesta etapa): grupo de rádio acessível.
 * selected: id marcado; current: id ativo (ganha a etiqueta “atual”); onSelect(id) ao tocar.
 */
export function characterChoices({ selected, current = null, onSelect, role = 'character-choices' }) {
  const box = h('div', { class: 'char-choices', role: 'radiogroup', 'aria-label': 'Personagem', 'data-role': role });
  const draw = (sel) => clear(box).append(...registry().characters.map((c) => {
    const on = c.id === sel;
    return h('button', { type: 'button', class: 'char-choice', role: 'radio', 'aria-checked': String(on), 'data-character': c.id,
      onclick: () => { draw(c.id); onSelect(c.id); } },
    h('span', { class: 'char-name', text: c.name }),
    c.id === current ? h('span', { class: 'chip accent', text: 'atual' }) : null,
    h('span', { class: 'char-sub small muted', text: choiceSub(c) }));
  }));
  draw(selected);
  return box;
}

/** Primeira abertura: escolher quem acompanha a pessoa. Lucas vem marcado (padrão); nada é gravado sem confirmar. */
export function renderCharacterPick(App) {
  const view = App.layout('Daily Routine English', { nav: false });
  let pick = App.character.id;
  const go = h('button', { class: 'btn primary block lg', 'data-role': 'confirm-character', onclick: async () => {
    go.disabled = true;
    await App.chooseCharacter(pick);
    App.go('#/');
  } });
  const label = () => { go.textContent = `Continuar com ${registry().characters.find((c) => c.id === pick).name}`; };
  view.append(h('section', { class: 'char-pick', 'data-role': 'character-pick' },
    h('h2', { text: 'Quem vai acompanhar você?' }),
    h('p', { class: 'small muted', text: 'Cada personagem tem a própria rotina para você praticar. Dá para trocar depois, na tela inicial, sem perder o progresso.' }),
    characterChoices({ selected: pick, onSelect: (id) => { pick = id; label(); } }),
    go));
  label();
}

/**
 * Início: “Personagem atual: X” + “Trocar personagem”, que abre ali mesmo um seletor leve.
 * A troca só muda quem acompanha (a visão de conteúdo): não inicia nem apaga nenhuma atividade ou progresso.
 */
export function characterSwitcher(App) {
  const wrap = h('section', { class: 'card char-switch', 'data-role': 'active-character' });
  const closed = () => clear(wrap).append(h('div', { class: 'row nowrap' },
    h('div', { class: 'grow' }, h('span', { class: 'small muted', text: 'Personagem atual: ' }), h('b', { 'data-role': 'active-name', text: App.character.name })),
    h('button', { class: 'btn small', 'aria-expanded': 'false', 'data-role': 'switch-character', onclick: open, text: 'Trocar personagem' })));
  function open() {
    let pick = App.character.id;
    const ok = h('button', { class: 'btn primary', 'data-role': 'confirm-character', disabled: true, onclick: async () => {
      ok.disabled = true;
      const name = registry().characters.find((c) => c.id === pick).name;
      await App.chooseCharacter(pick);
      toast(`Agora com ${name}. O progresso com cada personagem continua salvo.`);
      App.go('#/'); // redesenha o Início com a rotina do personagem escolhido
    } }, 'Confirmar');
    clear(wrap).append(h('div', { class: 'small muted', text: 'Escolha quem vai acompanhar você:' }),
      characterChoices({ selected: pick, current: App.character.id, onSelect: (id) => {
        pick = id;
        ok.disabled = id === App.character.id;
        ok.textContent = id === App.character.id ? 'Confirmar' : `Usar ${registry().characters.find((c) => c.id === id).name}`;
      } }),
      h('div', { class: 'row nowrap', style: { justifyContent: 'flex-end', gap: '8px' } },
        h('button', { class: 'btn ghost', 'data-role': 'cancel-character', onclick: closed, text: 'Cancelar' }), ok));
    const first = wrap.querySelector('[aria-checked=true]');
    if (first) first.focus();
  }
  closed();
  return wrap;
}
