// Início: orienta para a PRÓXIMA atividade de cada jornada. Daily Routine (histórias da família) e Conversation
// Practice (situações de conversa) aparecem separadas, cada uma com sessão atual, contexto, etapa atual, próxima
// atividade e um botão para continuar. Sem XP, níveis, sequências ou avatares: o progresso mostrado é o de
// engine/modules.js (etapas concluídas por domínio demonstrado), o mesmo de todas as outras telas.
import { h, icon, bar } from './dom.js';
import { cardInContent } from '../engine/scheduler.js';
import { requestPersistence } from '../store/db.js';
import { contentFor, isPlanned, CAST } from '../engine/characters.js';
import { journeyRegistry, journeyView } from '../engine/journeys.js';
import { progressOf, journeyProfile } from '../engine/profiles.js';
import { trackStatus, moduleOf, STAGES, STATE_LABEL } from '../engine/modules.js';
import { stageHref, moduleTitle } from './modules.js';
import { installCard } from './pwa.js';
import { illustration } from './illustration.js';

const EMPTY = { cards: {}, recordingsMeta: {} };

export function renderHome(App) {
  const { state } = App;
  const view = App.layout('Daily Routine English', {
    actions: [h('a', { class: 'icon-btn ghost', href: '#/settings', 'aria-label': 'Ajustes' }, icon('gear'))],
  });
  if (App.isNew && !state.welcomed) view.append(welcome(App));

  const ch = App.character;
  const planned = isPlanned(ch);
  const drView = contentFor(App.baseContent, ch.id);
  const dr = planned ? null : trackStatus(drView, progressOf(state, ch.id) || EMPTY);
  const j = journeyRegistry()[0] || null;
  const cpView = j ? journeyView(App.baseContent, j.id) : null;
  const cp = j ? trackStatus(cpView, progressOf(state, journeyProfile(j.id)) || EMPTY) : null;
  const cast = CAST[ch.id] || {};

  view.append(h('h2', { class: 'section-title', text: 'Suas jornadas' }));
  view.append(journeyCard(App, {
    role: 'track-dr', title: 'Daily Routine', tag: 'Histórias do dia a dia',
    context: `História de ${ch.name}${cast.role ? ` (${cast.role})` : ''}`,
    t: dr, view: drView, planned,
    open: async () => { await App.setJourney(null); },
    root: '#/dr',
  }));
  if (j) {
    view.append(journeyCard(App, {
      role: 'journey-entry', title: j.name, tag: 'Situações de conversa',
      context: null, t: cp, view: cpView, planned: false,
      open: async () => { await App.setJourney(j.id); },
      root: '#/cp',
    }));
  }

  // revisão espaçada da jornada aberta por último (o que venceu ou foi errado volta aqui)
  const due = Object.values(state.cards).filter((c) => c.due <= App.today() && cardInContent(App.content, c.k)).length;
  if (due) view.append(h('a', { class: 'card link flat', href: '#/review', style: { marginTop: '12px' }, 'data-role': 'due' },
    h('div', { class: 'row nowrap' }, h('span', { class: 'icon-btn accent', 'aria-hidden': 'true' }, icon('refresh')),
      h('div', { class: 'grow' }, h('b', { text: `Revisão: ${due} ${due === 1 ? 'item' : 'itens'}` }), h('div', { class: 'small muted', text: App.journey ? j.name : `Daily Routine · ${ch.name}` })), icon('next'))));
  const allCards = Object.values(state.profiles).reduce((n, p) => n + Object.keys((p && p.cards) || {}).length, 0);
  if (state.lastBackupAt === null && allCards > 30) {
    view.append(h('div', { class: 'notice warn', style: { marginTop: '16px' } }, 'Seu progresso fica só neste aparelho. ', h('a', { href: '#/settings', text: 'Faça um backup' }), ' de vez em quando.'));
  }
  view.append(h('div', { style: { marginTop: '16px' } }, installCard(App, { compact: true })));
}

/** Cartão de jornada: contexto, sessão atual, etapa atual, próxima atividade e Continuar. */
function journeyCard(App, { role, title, tag, context, t, view, planned, open, root }) {
  const cur = t && t.current ? moduleOf(view, t.current.id) : null;
  const next = t && t.next;
  const allDone = t && t.total && !t.current;
  const href = cur && next ? stageHref(cur.id, next.id) : root;
  const go = async () => { await open(); App.go(href); };
  return h('section', { class: 'card journey', 'data-role': role },
    cur ? illustration({ kind: 'session', id: cur.id, variant: 'cover', alt: moduleTitle(cur), label: moduleTitle(cur), ratio: '16 / 6' }) : null,
    h('div', { class: 'row nowrap' },
      h('div', { class: 'grow' }, h('div', { class: 'eyebrow', text: tag }), h('h3', { class: 'journey-title', text: title })),
      h('a', { class: 'btn small ghost', href: root, 'data-role': `${role}-all`, onclick: (e) => { e.preventDefault(); open().then(() => App.go(root)); } }, 'Ver sessões')),
    context ? h('div', { class: 'small', 'data-role': 'journey-context' }, context, ' · ', h('a', { href: '#/stories', text: 'trocar' })) : null,
    planned ? h('p', { class: 'small', text: 'As sessões desta história estão em preparação. Escolha outra história para continuar.' }) : null,
    cur ? h('dl', { class: 'next-info', 'data-role': 'next-step' },
      h('dt', { text: 'Sessão atual' }), h('dd', {}, h('b', { text: `${cur.id} · ${moduleTitle(cur)}` })),
      h('dt', { text: 'Etapa atual' }), h('dd', { text: next ? `${next.n} de ${STAGES.length} · ${next.title} (${STATE_LABEL[next.state].toLowerCase()})` : '—' }),
      next && next.goal ? [h('dt', { text: 'Próxima atividade' }), h('dd', { text: next.goal })] : null) : null,
    allDone ? h('p', { class: 'small', 'data-role': 'next-step', text: 'Todas as sessões desta jornada estão concluídas. A revisão espaçada continua trazendo o que precisa ser reforçado.' }) : null,
    t && t.total ? h('div', { class: 'journey-progress' },
      h('div', { class: 'row nowrap small' }, h('span', { class: 'grow', text: `${t.modules.filter((m) => m.complete).length} de ${t.modules.length} sessões concluídas` }), h('span', { class: 'muted', text: `${t.done}/${t.total} etapas` })),
      bar(t.ratio)) : null,
    h('button', { class: `btn block${planned ? '' : ' primary'}`, 'data-role': role === 'track-dr' ? 'continue-dr' : 'open-journey', style: { marginTop: '10px' }, disabled: planned, onclick: planned ? null : go },
      icon(planned ? 'lock' : 'play'), planned ? 'Em preparação' : t && t.done ? 'Continuar' : 'Começar'));
}

function welcome(App) {
  const box = h('section', { class: 'card', style: { marginTop: '8px' }, 'data-role': 'welcome' },
    h('h3', { text: 'Como funciona' }),
    h('ol', { class: 'small', style: { paddingLeft: '18px', margin: '6px 0 10px' } },
      h('li', { text: 'Cada sessão segue seis etapas: vocabulário, combinações e expressões, construção de frases, ouvir, falar e aplicar.' }),
      h('li', { text: 'Uma etapa abre quando a anterior está concluída. Não é preciso acertar tudo: o que você errar volta na revisão.' }),
      h('li', { text: 'Daily Routine e Conversation Practice têm progresso separado.' }),
      h('li', { text: 'Tudo funciona sem internet e fica só neste aparelho.' })),
    h('button', { class: 'btn primary block', onclick: async () => {
      App.state.welcomed = true;
      App.save();
      await requestPersistence();
      box.remove();
    } }, 'Entendi'));
  return box;
}
