// Início: quem está estudando, qual o progresso e onde continuar. Persona ativa (avatar, nível e progresso da
// Daily Routine dela), troca de persona e as duas jornadas: a Daily Routine da persona e o Conversation Practice
// (jornada comunicativa própria, com progresso separado). Os números vêm de engine/modules.js e engine/profiles.js.
import { h, icon, bar } from './dom.js';
import { streak, levelForXp } from '../engine/progress.js';
import { cardInContent } from '../engine/scheduler.js';
import { requestPersistence } from '../store/db.js';
import { registry, contentFor, isPlanned } from '../engine/characters.js';
import { journeyRegistry, journeyView } from '../engine/journeys.js';
import { progressOf, journeyProfile } from '../engine/profiles.js';
import { trackStatus, moduleOf } from '../engine/modules.js';
import { characterSwitcher, characterBadge } from './character.js';
import { stageHref } from './modules.js';

const EMPTY = { cards: {}, recordingsMeta: {}, xp: 0, days: {}, firstDay: 0 };

export function renderHome(App) {
  const { state } = App;
  const view = App.layout('Daily Routine English', {
    actions: [h('a', { class: 'icon-btn ghost', href: '#/settings', 'aria-label': 'Ajustes' }, icon('gear'))],
  });
  const today = App.today();
  const ch = App.character;
  const name = ch.short || ch.name;
  const planned = isPlanned(ch);

  // Daily Routine da persona e Conversation Practice, cada um com o próprio perfil de progresso
  const drView = contentFor(App.baseContent, ch.id);
  const drProg = progressOf(state, ch.id) || EMPTY;
  const dr = planned ? null : trackStatus(drView, drProg);
  const j = journeyRegistry()[0] || null;
  const cpView = j ? journeyView(App.baseContent, j.id) : null;
  const cpProg = j ? progressOf(state, journeyProfile(j.id)) || EMPTY : EMPTY;
  const cp = j ? trackStatus(cpView, cpProg) : null;

  if (App.isNew && !state.welcomed) view.append(welcome(App));

  // 1. quem está estudando e qual o progresso
  const lvl = levelForXp(drProg.xp || 0);
  const st = streak({ days: drProg.days || {}, firstDay: drProg.firstDay ?? today }, today);
  // “continuar de onde parou”: a trilha aberta por último (jornada) ou a Daily Routine da persona
  const resume = App.journey && cp ? { track: 'journey', t: cp } : dr && dr.next ? { track: 'dr', t: dr } : cp ? { track: 'journey', t: cp } : null;
  const resumeHref = resume && resume.t.current && resume.t.next ? stageHref(resume.t.current.id, resume.t.next.id) : null;
  const resumeLabel = resumeHref ? `${resume.track === 'journey' ? j.name : 'Daily Routine'} · ${resume.t.current.id} · ${resume.t.next.title}` : '';
  const continueBtn = h('button', { class: 'btn primary block lg', 'data-role': 'continue', disabled: !resumeHref,
    onclick: async () => { await App.setJourney(resume.track === 'journey' ? j.id : null); App.go(resumeHref); } }, icon('play'), 'Continuar de onde parou');

  view.append(h('section', { class: 'hero persona', 'data-role': 'persona', 'data-character': ch.id },
    h('div', { class: 'row nowrap' },
      characterBadge(ch, 'idle', { size: 56 }),
      h('div', { class: 'grow', style: { minWidth: 0 } },
        h('div', { class: 'small muted', text: greeting() }),
        h('div', { class: 'persona-name', text: name }),
        h('div', { class: 'small muted', 'data-role': 'persona-stats', text: planned ? 'Jornada em preparação' : `Nível ${lvl.level} · ${drProg.xp || 0} XP · ${st.days} ${st.days === 1 ? 'dia seguido' : 'dias seguidos'}` }))),
    dr ? h('div', { style: { marginTop: '12px' } },
      h('div', { class: 'row nowrap small' }, h('span', { class: 'grow', text: 'Progresso da Daily Routine' }), h('b', { text: `${Math.round(dr.ratio * 100)}%` })),
      bar(dr.ratio)) : null,
    h('div', { style: { marginTop: '14px' } }, continueBtn),
    resumeLabel ? h('div', { class: 'small muted center', style: { marginTop: '6px' }, 'data-role': 'continue-where', text: resumeLabel }) : null));

  // troca de persona (só aparece com mais de uma cadastrada); cada uma guarda o próprio progresso
  if (registry().characters.length > 1) view.append(characterSwitcher(App));

  // 2. minhas jornadas
  view.append(h('h2', { text: 'Minhas jornadas' }));
  view.append(trackCard({
    role: 'track-dr', title: `Daily Routine · ${name}`,
    desc: planned ? 'As rotinas desta persona ainda estão em preparação. O progresso dela já é separado.' : 'A rotina da persona em módulos: palavras, expressões, ouvir, falar e conversar.',
    t: dr, view: drView, planned,
    onOpen: async () => { await App.setJourney(null); App.go('#/modules'); },
  }));
  if (j) {
    view.append(trackCard({
      role: 'journey-entry', title: j.name,
      desc: 'Jornada comunicativa: entender e participar de conversas reais, com progresso próprio (o mesmo para todas as personas).',
      t: cp, view: cpView, button: 'open-journey',
      onOpen: async () => { await App.setJourney(j.id); App.go('#/modules'); },
    }));
  }

  // revisão do que está vencido na trilha aberta + lembrete de backup
  const due = Object.values(state.cards).filter((c) => c.due <= today && cardInContent(App.content, c.k)).length;
  if (due) view.append(h('a', { class: 'card link flat', href: '#/review', style: { marginTop: '12px' }, 'data-role': 'due' },
    h('div', { class: 'row nowrap' }, h('span', { class: 'icon-btn accent' }, icon('refresh')),
      h('div', { class: 'grow' }, h('b', { text: `${due} para revisar` }), h('div', { class: 'small muted', text: App.journey ? j.name : `Daily Routine · ${name}` })), icon('next'))));
  const allCards = Object.values(state.profiles).reduce((n, p) => n + Object.keys((p && p.cards) || {}).length, 0);
  if (state.lastBackupAt === null && allCards > 30) {
    view.append(h('div', { class: 'notice warn', style: { marginTop: '16px' } }, 'Seu progresso fica só neste aparelho. ', h('a', { href: '#/settings', text: 'Faça um backup' }), ' de vez em quando.'));
  }
}

/** Cartão de jornada: nome, descrição, progresso, próxima etapa e botão. */
function trackCard({ role, title, desc, t, view, planned = false, onOpen, button = 'open-track' }) {
  const next = t && t.current && t.next ? `${t.current.id} · ${moduleTitleOf(view, t.current.id)} — ${t.next.title}` : t && t.total ? 'Todas as etapas concluídas 🎉' : null;
  return h('section', { class: 'card track', 'data-role': role },
    h('h3', { text: title }),
    h('p', { class: 'small muted', style: { margin: '2px 0 8px' }, text: desc }),
    t && t.total ? h('div', {}, h('div', { class: 'row nowrap small' }, h('span', { class: 'grow', text: `${t.done} de ${t.total} etapas` }), h('b', { text: `${Math.round(t.ratio * 100)}%` })), bar(t.ratio)) : null,
    next ? h('div', { class: 'small', style: { marginTop: '6px' }, 'data-role': 'next-step' }, h('span', { class: 'muted', text: 'Próxima etapa: ' }), next) : null,
    h('button', { class: `btn block${planned ? '' : ' primary'}`, 'data-role': button, style: { marginTop: '10px' }, disabled: planned, onclick: onOpen },
      icon(planned ? 'lock' : 'play'), planned ? 'Em preparação' : t && t.done ? 'Continuar' : 'Começar'));
}

function moduleTitleOf(view, id) {
  const r = moduleOf(view, id);
  return r ? (r.title && r.title !== r.pt ? r.title : r.pt) : id;
}

function greeting() {
  const hr = new Date().getHours();
  return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
}

function welcome(App) {
  const box = h('section', { class: 'card', style: { marginTop: '8px' } },
    h('h3', { text: 'Bem-vindo! Como funciona' }),
    h('ul', { class: 'small', style: { paddingLeft: '18px', margin: '6px 0 10px' } },
      h('li', { text: 'Cada jornada é feita de módulos com cinco etapas: palavras, expressões, ouvir, falar e conversar.' }),
      h('li', { text: 'Uma etapa abre quando a anterior é concluída. Erros voltam para revisão; não é preciso acertar tudo.' }),
      h('li', { text: 'Cada persona e o Conversation Practice têm progresso próprio.' }),
      h('li', { text: 'Tudo funciona sem internet e fica só neste aparelho.' })),
    h('button', { class: 'btn primary block', onclick: async () => {
      App.state.welcomed = true;
      App.save();
      await requestPersistence();
      box.remove();
    } }, 'Entendi'));
  return box;
}
