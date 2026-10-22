// Componentes compartilhados entre telas.
import { h, icon, sheet, toast } from './dom.js';
import * as player from '../audio/player.js';
import { cardKey, MASTERED_BOX } from '../engine/scheduler.js';
import { categoryLabel } from '../engine/exercises.js';

/** Botão de ouvir. clip = { key, text }. */
export function speakerButton(clip, { label = 'Ouvir', cls = 'icon-btn accent', rate } = {}) {
  const btn = h('button', { class: cls, 'aria-label': label, type: 'button' }, icon('speaker'));
  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    btn.classList.add('playing');
    const res = await player.play(clip, { rate });
    btn.classList.remove('playing');
    if (!res.ok) toast('Áudio indisponível. Veja Ajustes → Áudio.');
  });
  return btn;
}

export const SOURCE_LABEL = {
  word: ['Word', 'chip'], 'word-table-only': ['Word (tabela)', 'chip'], derived: ['Do texto · glosa nova', 'chip warn'], new: ['Conteúdo novo', 'chip warn'],
};

export function sourceChip(source) {
  const [t, c] = SOURCE_LABEL[source] || [source, 'chip'];
  return h('span', { class: c, title: 'Origem do conteúdo' }, t);
}

/** Estado de domínio de um item (para os pontinhos). */
export function itemStatus(state, itemId) {
  const c = state.cards[cardKey('item', itemId, 'rec')];
  if (!c) return 'new';
  const r = state.cards[cardKey('item', itemId, 'rcl')];
  return r && r.box >= MASTERED_BOX ? 'mastered' : 'seen';
}

export function statusDot(state, itemId) {
  const s = itemStatus(state, itemId);
  return h('span', { class: `dot ${s === 'new' ? '' : s}`, title: s === 'new' ? 'Novo' : s === 'seen' ? 'Em estudo' : 'Dominado', 'aria-hidden': 'true' });
}

/** Folha com os detalhes de um item. */
export function openItem(App, item) {
  const exs = item.ex.slice(0, 3);
  const body = h('div', {},
    h('div', { class: 'row nowrap' },
      h('div', { class: 'grow', style: { flex: 1, minWidth: 0 } },
        h('div', { class: 'big-en', text: item.en }),
        item.ipa ? h('div', { class: 'muted en', text: item.ipa }) : null),
      speakerButton({ key: item.au, text: item.en })),
    h('p', { class: 'pt', style: { fontSize: '1.05rem' }, text: [item.pt, ...item.ptAlt].join(' · ') }),
    h('div', { class: 'chips', style: { margin: '8px 0' } },
      h('span', { class: 'chip accent', text: categoryLabel(item.c) }), sourceChip(item.source),
      ...item.tags.filter((t) => ['bre', 'idiom', 'uber', 'no-to'].includes(t)).map((t) => h('span', { class: 'chip', text: { bre: 'British English', idiom: 'idiomática', uber: 'Uber', 'no-to': 'sem “to”' }[t] })),
      ...item.routines.slice(0, 5).map((r) => h('span', { class: 'chip', text: r }))),
    item.tip ? h('div', { class: 'notice', style: { margin: '8px 0' } }, '💡 ', item.tip) : null,
    item.notes.length ? h('div', {}, h('h3', { text: 'Notas do Word' }), ...item.notes.map((n) => h('p', { class: 'small' }, n.text, h('span', { class: 'muted tiny', text: `  (${n.src})` })))) : null,
    exs.length ? h('div', {}, h('h3', { text: 'Exemplos' }), ...exs.map((x) => h('div', { class: 'card flat', style: { padding: '12px' } },
      h('div', { class: 'row nowrap' }, h('div', { class: 'en', style: { flex: 1 }, text: x.en }), x.au ? speakerButton({ key: x.au, text: x.en }, { cls: 'icon-btn ghost' }) : null),
      x.pt ? h('div', { class: 'pt small', text: x.pt }) : null,
      h('div', { class: 'tiny muted', text: x.src === 'new' ? 'Exemplo novo (não está no Word)' : `Fonte: ${x.src}` })))) : null,
    item.v.length ? h('p', { class: 'small' }, h('b', { text: 'Também aceito: ' }), item.v.join(' · ')) : null,
  );
  sheet(body, { label: item.en });
}

export function focusTitle(App, focus) {
  if (focus.routine && !focus.mode) { const r = App.content.routines.find((x) => x.id === focus.routine); return r ? `${r.id} · ${r.pt}` : focus.routine; }
  if (focus.context) { const c = App.content.contexts.find((x) => x.id === focus.context); return c ? c.pt : focus.context; }
  if (focus.category) { const c = App.content.categories.find((x) => x.id === focus.category); return c ? c.pt : focus.category; }
  if (focus.mode === 'present') return `Treino para a aula · ${focus.routine}`;
  if (focus.mode === 'review') return 'Revisão';
  if (focus.mode === 'difficult') return 'Dificuldades';
  return 'Sessão do dia';
}

export function sessionHref(focus) {
  const q = new URLSearchParams(Object.entries(focus).filter(([, v]) => v)).toString();
  return `#/session${q ? '?' + q : ''}`;
}
