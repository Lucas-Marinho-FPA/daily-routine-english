// Progresso: o que foi DEMONSTRADO em cada jornada — sessões e etapas (engine/modules.js, a mesma fonte de verdade de
// todas as telas) e domínio dos itens e habilidades (revisão espaçada). Daily Routine e Conversation Practice
// separados. Sem XP, níveis, sequências ou conquistas.
import { h, icon, bar } from './dom.js';
import { MASTERED_BOX } from '../engine/scheduler.js';
import { contentFor, isPlanned } from '../engine/characters.js';
import { journeyRegistry, journeyView } from '../engine/journeys.js';
import { progressOf, journeyProfile } from '../engine/profiles.js';
import { trackStatus, STAGES, STATE_LABEL, moduleOf } from '../engine/modules.js';
import { moduleTitle } from './modules.js';

const EMPTY = { cards: {}, recordingsMeta: {} };
const SESSION_LABEL = { done: 'Concluída', progress: 'Em andamento', open: 'Não iniciada' };

export function renderStats(App) {
  const { state } = App;
  const view = App.layout('Progresso', { actions: [h('a', { class: 'icon-btn ghost', href: '#/settings', 'aria-label': 'Ajustes' }, icon('gear'))] });
  const today = App.today();

  const ch = App.character;
  const j = journeyRegistry()[0] || null;
  const tracks = [];
  if (!isPlanned(ch)) tracks.push({ role: 'progress-dr', title: `Daily Routine · ${ch.name}`, view: contentFor(App.baseContent, ch.id), prog: progressOf(state, ch.id) || EMPTY, journey: null });
  if (j) tracks.push({ role: 'progress-cp', title: j.name, view: journeyView(App.baseContent, j.id), prog: progressOf(state, journeyProfile(j.id)) || EMPTY, journey: j.id });

  const due = Object.values(state.cards).filter((c) => c.due <= today).length;
  view.append(h('a', { class: 'card link flat', href: '#/review', 'data-role': 'review-link' }, h('div', { class: 'row nowrap' }, h('span', { class: 'icon-btn accent', 'aria-hidden': 'true' }, icon('refresh')),
    h('div', { class: 'grow' }, h('b', { text: 'Revisar erros e dificuldades' }), h('div', { class: 'small muted', text: due ? `${due} para revisar hoje na jornada aberta` : 'Nada vencido hoje na jornada aberta' })), icon('next'))));

  for (const t of tracks) {
    const tr = trackStatus(t.view, t.prog);
    const counts = { done: 0, progress: 0, open: 0 };
    for (const m of tr.modules) counts[m.state]++;
    const cards = Object.values(t.prog.cards || {});
    const items = cards.filter((c) => c.k.startsWith('item:') && c.k.endsWith(':rec'));
    const learned = items.filter((c) => c.box >= MASTERED_BOX).length;
    const toReview = cards.filter((c) => c.due <= today).length;
    const recs = Object.keys(t.prog.recordingsMeta || {}).length;
    view.append(h('section', { class: 'card', 'data-role': t.role },
      h('h2', { style: { marginTop: 0 }, text: t.title }),
      h('div', { class: 'row nowrap small' }, h('span', { class: 'grow', text: `${tr.done} de ${tr.total} etapas concluídas` })), bar(tr.ratio),
      h('div', { class: 'stat-grid', style: { marginTop: '12px' } },
        h('div', { class: 'stat' }, h('b', { text: String(counts.done) }), h('span', { text: 'sessões concluídas' })),
        h('div', { class: 'stat' }, h('b', { text: String(counts.progress) }), h('span', { text: 'em andamento' })),
        h('div', { class: 'stat' }, h('b', { text: String(counts.open) }), h('span', { text: 'não iniciadas' }))),
      h('p', { class: 'small', style: { margin: '10px 0 4px' }, text: `Itens dominados: ${learned} de ${items.length} estudados · ${toReview} para revisar · ${recs} gravações` }),
      h('details', { 'data-role': 'sessions' }, h('summary', { class: 'small', text: 'Situação de cada sessão' }),
        h('ul', { class: 'list' }, tr.modules.map((m) => {
          const r = moduleOf(t.view, m.id);
          return h('li', {}, h('div', { class: 'list-btn static' },
            h('div', { class: 'grow' }, h('div', { class: 'title', text: `${r.id} · ${moduleTitle(r)}` }),
              h('div', { class: 'small muted', text: `${SESSION_LABEL[m.state]} · ${m.doneCount}/${STAGES.length} etapas${m.next && !m.complete ? ` · próxima: ${m.next.title} (${STATE_LABEL[m.next.state].toLowerCase()})` : ''}` }))));
        })))));
  }

  // domínio por habilidade (todas as jornadas): o que já foi praticado e o que já se mantém na revisão espaçada
  const all = Object.values(state.profiles).flatMap((p) => Object.values((p && p.cards) || {}));
  const SK = [['rec', 'Reconhecer palavras e expressões'], ['rcl', 'Lembrar (recuperar)'], ['bld', 'Completar na frase'], ['ord', 'Montar frases'], ['wrt', 'Escrever frases'], ['lis', 'Ouvir e entender'], ['tell', 'Contar blocos'], ['conv', 'Responder perguntas']];
  view.append(h('h2', { text: 'Por habilidade' }), h('div', { class: 'card flat stack', 'data-role': 'skills' }, SK.map(([s, label]) => {
    const cs = all.filter((c) => c.k.endsWith(':' + s));
    const m = cs.filter((c) => c.box >= MASTERED_BOX).length;
    return h('div', {}, h('div', { class: 'row small' }, h('span', { class: 'grow', text: label }), h('span', { class: 'muted', text: `${m} dominados de ${cs.length}` })), bar(cs.length ? m / cs.length : 0));
  })));
  view.append(h('p', { class: 'tiny muted', text: `“Dominado” = item que se manteve certo na revisão espaçada (caixa ${MASTERED_BOX} ou mais).` }));
}
