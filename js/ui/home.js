import { h, icon, bar } from './dom.js';
import { streak, levelForXp } from '../engine/progress.js';
import { mastery, cardKey, cardInContent } from '../engine/scheduler.js';
import { sessionHref } from './common.js';
import { requestPersistence } from '../store/db.js';
import { registry } from '../engine/characters.js';
import { characterSwitcher } from './character.js';
import { journeyEntry } from './journey.js';

export function renderHome(App) {
  const { state, content } = App;
  const view = App.layout('Daily Routine English', {
    actions: [h('a', { class: 'icon-btn ghost', href: '#/settings', 'aria-label': 'Ajustes' }, icon('gear'))],
  });
  const today = App.today();
  const d = state.days[today] || { ex: 0, xp: 0 };
  const goal = state.settings.dailyGoal || 12;
  const st = streak(state, today);
  const lvl = levelForXp(state.xp);
  const due = Object.values(state.cards).filter((c) => c.due <= today && cardInContent(content, c.k)).length; // do personagem ativo
  const pct = Math.min(100, Math.round((d.ex / goal) * 100));

  if (App.isNew && !state.welcomed) view.append(welcome(App));
  // personagem ativo e troca ali mesmo (só aparece quando há mais de um personagem cadastrado)
  if (registry().characters.length > 1) view.append(characterSwitcher(App));

  view.append(h('section', { class: 'hero', style: { marginTop: '8px' } },
    h('div', { class: 'row nowrap' },
      h('div', { style: { flex: 1, minWidth: 0 } },
        h('div', { class: 'small muted', text: greeting() }),
        h('div', { style: { fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.25 }, text: d.ex >= goal ? 'Meta de hoje cumprida 🎉' : 'Pronto para praticar?' }),
        h('div', { class: 'small muted', text: `${d.ex}/${goal} exercícios hoje · ${due} revisão(ões) pendente(s)` })),
      h('div', { class: 'ring', style: { '--p': pct }, 'aria-label': `${pct}% da meta diária` }, h('span', { text: `${pct}%` }))),
    h('a', { class: 'btn primary block lg', href: sessionHref({}), style: { marginTop: '16px' } }, icon('play'), d.ex ? 'Continuar sessão' : 'Começar sessão do dia'),
    h('div', { class: 'small muted center', style: { marginTop: '8px' }, text: '≈ 6 minutos · revisões + itens novos da Rotina 1' })));

  view.append(h('div', { class: 'stat-grid', style: { marginTop: '12px' } },
    h('div', { class: 'stat' }, h('b', {}, h('span', { class: 'flame', text: '🔥' }), ` ${st.days}`), h('span', { text: st.days === 1 ? 'dia seguido' : 'dias seguidos' })),
    h('div', { class: 'stat' }, h('b', { text: `Nv ${lvl.level}` }), h('span', { text: `${state.xp} XP` })),
    h('div', { class: 'stat' }, h('b', { text: String(due) }), h('span', { text: 'para revisar' }))));

  // Rotina 1 (prioritária)
  const r1 = content.routines[0];
  const r1Keys = r1.items.map((i) => cardKey('item', i, 'rec'));
  const m1 = mastery(state.cards, r1Keys);
  const blocksTold = r1.blocks.filter((b) => state.cards[cardKey('block', b, 'tell')]).length;
  view.append(h('h2', { text: 'Para a próxima aula' }),
    h('a', { class: 'card link', href: `#/routine/${r1.id}` },
      h('div', { class: 'row nowrap' },
        h('div', { style: { flex: 1, minWidth: 0 } },
          h('div', { class: 'chips' }, h('span', { class: 'chip accent', text: 'Prioritária' }), h('span', { class: 'chip', text: 'Presencial' })),
          h('h3', { style: { marginTop: '8px' }, text: `Rotina 1 · ${r1.pt}` }),
          h('div', { class: 'small muted', text: `${m1.seen}/${m1.total} expressões vistas · ${blocksTold}/${r1.blocks.length} blocos contados` })),
        icon('next')),
      h('div', { style: { marginTop: '10px' } }, bar(m1.ratio))),
    h('a', { class: 'btn block', href: sessionHref({ routine: r1.id, mode: 'present' }), style: { marginTop: '10px' } }, icon('target'), 'Treino para a aula'));

  // atalhos
  view.append(h('h2', { text: 'Praticar por momento do dia' }),
    h('div', { class: 'chips scroll' }, content.contexts.filter((c) => c.id !== 'full').map((c) =>
      h('a', { class: 'chip', href: `#/context/${c.id}`, style: { minHeight: '40px', padding: '8px 14px', fontSize: '.88rem', textDecoration: 'none' } }, `${c.icon} ${c.pt}`))));

  view.append(h('div', { class: 'stack', style: { marginTop: '16px' } },
    shortcut('#/lab', 'mic', 'Speaking Lab', 'Ouça, grave e compare sua voz'),
    shortcut('#/review', 'refresh', 'Revisar erros', due ? `${due} pendente(s) para hoje` : 'Dificuldades e respostas para revisão'),
    content.checklist.length ? shortcut('#/checklist', 'check', 'Checklist antes da aula', `Os ${content.checklist.length} pontos do material`) : null));
  view.append(journeyEntry(App)); // jornada Conversation Practice (fora do seletor de personagem)

  if (state.lastBackupAt === null && Object.keys(state.cards).length > 30) {
    view.append(h('div', { class: 'notice warn', style: { marginTop: '16px' } }, 'Seu progresso fica só neste aparelho. ', h('a', { href: '#/settings', text: 'Faça um backup' }), ' de vez em quando.'));
  }
}

function shortcut(href, ic, title, sub) {
  return h('a', { class: 'card link flat', href },
    h('div', { class: 'row nowrap' }, h('span', { class: 'icon-btn accent' }, icon(ic)),
      h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { style: { fontWeight: 700 }, text: title }), h('div', { class: 'small muted', text: sub }))));
}

function greeting() {
  const hr = new Date().getHours();
  return hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
}

function welcome(App) {
  const box = h('section', { class: 'card', style: { marginTop: '8px' } },
    h('h3', { text: 'Bem-vindo! Como funciona' }),
    h('ul', { class: 'small', style: { paddingLeft: '18px', margin: '6px 0 10px' } },
      h('li', { text: 'Sessões curtas: reconhecer → lembrar → construir frases → falar.' }),
      h('li', { text: 'A Rotina 1 vem primeiro; as outras nove são variações de tipo de dia.' }),
      h('li', { text: 'Erros voltam para revisão. Respostas equivalentes são aceitas.' }),
      h('li', { text: 'Tudo funciona sem internet e fica só neste aparelho.' })),
    h('button', { class: 'btn primary block', onclick: async () => {
      App.state.welcomed = true;
      App.save();
      await requestPersistence();
      box.remove();
    } }, 'Entendi'));
  return box;
}
