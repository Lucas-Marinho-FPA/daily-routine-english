// Jornada Conversation Practice: tela inicial própria (fora do seletor de personagem) e acesso a partir das rotinas.
import { h, icon } from './dom.js';
import { sessionHref } from './common.js';
import { journeyRegistry, unitStatus } from '../engine/journeys.js';

const SKILLS = [['listening', 'Listening', 'ouvir e responder'], ['reading', 'Reading', 'ler e responder'], ['writing', 'Writing', 'montar e escrever falas'],
  ['speaking', 'Speaking', 'responder falando ou escrevendo'], ['transfer', 'Transferência', 'falar de você']];

/** Cartão nas rotinas (Início) que abre a jornada. */
export function journeyEntry(App) {
  const j = journeyRegistry()[0];
  if (!j) return null;
  return h('section', { class: 'card', 'data-role': 'journey-entry', style: { marginTop: '16px' } },
    h('div', { class: 'chips' }, h('span', { class: 'chip accent', text: 'Nova jornada' }), h('span', { class: 'chip', text: 'piloto' })),
    h('h3', { style: { marginTop: '8px' }, text: j.name }),
    h('p', { class: 'small muted', text: `Diálogos do Conversation Book para ouvir, ler, escrever e falar (${j.content.routines.map((r) => r.id).join(', ')}). Progresso próprio, separado das rotinas.` }),
    h('button', { class: 'btn block', 'data-role': 'open-journey', onclick: async () => { await App.setJourney(j.id); App.go('#/'); } }, icon('play'), 'Abrir Conversation Practice'));
}

/** Início da jornada: unidades, situação por habilidade e conclusão (calculadas a partir dos cartões). */
export function renderJourneyHome(App) {
  const { content, state } = App;
  const view = App.layout(App.journey.name, { actions: [h('a', { class: 'icon-btn ghost', href: '#/settings', 'aria-label': 'Ajustes' }, icon('gear'))] });
  view.append(h('section', { class: 'card char-switch', 'data-role': 'journey-bar' }, h('div', { class: 'row nowrap' },
    h('div', { class: 'grow small' }, 'Jornada: ', h('b', { text: App.journey.name })),
    h('button', { class: 'btn small', 'data-role': 'leave-journey', onclick: async () => { await App.setJourney(null); App.go('#/'); } }, `Voltar às rotinas (${App.character.name})`))));
  view.append(h('p', { class: 'small muted', style: { marginTop: '10px' }, text: 'Cada unidade parte de um diálogo original do livro. Primeiro você ouve, depois lê, monta e escreve as falas, responde e por fim fala de você.' }));
  for (const r of content.routines) {
    const st = unitStatus(content, r.id, state.cards);
    view.append(h('section', { class: 'card', 'data-role': 'journey-unit', 'data-unit': r.id, 'data-complete': String(st.complete) },
      h('div', { class: 'chips' }, h('span', { class: 'chip', text: r.id }), st.complete ? h('span', { class: 'chip ok', text: 'Concluída ✓' }) : h('span', { class: 'chip', text: 'Em andamento' })),
      h('h3', { style: { marginTop: '8px' }, text: r.title }),
      h('div', { class: 'small muted', text: r.pt }),
      h('p', { class: 'small', text: r.goal }),
      h('ul', { class: 'list skills small' }, SKILLS.map(([k, label, sub]) => {
        const s = st.skills[k];
        const need = s.need ?? s.total;
        const ok = s.done >= need;
        return h('li', { 'data-skill': k }, h('div', { class: 'row nowrap', style: { gap: '8px', padding: '6px 0' } },
          h('span', { text: ok ? '✅' : '⬜' }), h('div', { class: 'grow' }, h('b', { text: label }), ` — ${sub}`),
          h('span', { class: 'muted', text: k === 'writing' ? `${s.done}/${s.total} (meta ${need})` : `${s.done}/${s.total}` })));
      })),
      h('div', { class: 'row', style: { marginTop: '10px' } },
        h('a', { class: 'btn primary', href: sessionHref({ routine: r.id }) }, icon('play'), 'Praticar'),
        h('a', { class: 'btn', href: `#/routine/${r.id}` }, icon('book'), 'Diálogo'),
        h('a', { class: 'btn', href: `#/lab?routine=${r.id}` }, icon('mic'), 'Falar'))));
  }
  view.append(h('p', { class: 'tiny muted', style: { marginTop: '12px' }, text: 'Conclusão: ouvir e ler acertados ao menos uma vez, perguntas respondidas, metade das falas montadas ou escritas e uma transferência. XP, sequência e revisão são os mesmos do app; o domínio das expressões é desta jornada.' }));
}
