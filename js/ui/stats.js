// Progresso: XP, nível, sequência, calendário, domínio por rotina/contexto/habilidade, conquistas.
import { h, icon, bar } from './dom.js';
import { streak, levelForXp, ACHIEVEMENTS } from '../engine/progress.js';
import { mastery, cardKey, MASTERED_BOX } from '../engine/scheduler.js';

export function renderStats(App) {
  const { state, content } = App;
  const view = App.layout('Progresso', { actions: [h('a', { class: 'icon-btn ghost', href: '#/settings', 'aria-label': 'Ajustes' }, icon('gear'))] });
  const today = App.today();
  const lvl = levelForXp(state.xp);
  const st = streak(state, today);
  const cards = Object.values(state.cards);

  view.append(h('div', { class: 'card' },
    h('div', { class: 'row nowrap' }, h('div', { style: { flex: 1 } }, h('div', { class: 'small muted', text: 'Nível' }), h('div', { style: { fontSize: '1.6rem', fontWeight: 800 }, text: String(lvl.level) })),
      h('div', { class: 'center' }, h('div', { style: { fontSize: '1.4rem', fontWeight: 800 } }, h('span', { class: 'flame', text: '🔥' }), ` ${st.days}`), h('div', { class: 'tiny muted', text: 'dias seguidos' }))),
    h('div', { class: 'small muted', style: { margin: '8px 0 4px' }, text: `${state.xp} XP · faltam ${lvl.to - state.xp} para o nível ${lvl.level + 1}` }),
    bar((state.xp - lvl.from) / (lvl.to - lvl.from)),
    h('p', { class: 'tiny muted', style: { marginTop: '8px' }, text: 'Um dia sem estudo por semana não quebra a sequência.' })));

  view.append(h('a', { class: 'card link flat', href: '#/review' }, h('div', { class: 'row nowrap' }, h('span', { class: 'icon-btn accent' }, icon('refresh')),
    h('div', { style: { flex: 1 } }, h('b', { text: 'Revisar erros e dificuldades' }), h('div', { class: 'small muted', text: `${cards.filter((c) => c.due <= today).length} pendente(s) hoje` })), icon('next'))));

  // calendário de 5 semanas
  const heat = h('div', { class: 'heat', 'aria-label': 'Atividade das últimas 5 semanas' });
  for (let n = today - 34; n <= today; n++) {
    const d = state.days[n];
    const lvlCls = !d || !d.ex ? '' : d.ex >= (state.settings.dailyGoal || 12) ? 'l3' : d.ex >= 5 ? 'l2' : 'l1';
    heat.append(h('i', { class: lvlCls, title: d ? `${d.ex} exercícios` : 'sem estudo' }));
  }
  view.append(h('h2', { text: 'Últimas 5 semanas' }), h('div', { class: 'card flat' }, heat));

  // precisão 14 dias
  let ex = 0, good = 0, rec = 0;
  for (let n = today - 13; n <= today; n++) { const d = state.days[n]; if (d) { ex += d.ex; good += d.good; rec += d.rec; } }
  view.append(h('div', { class: 'stat-grid', style: { marginTop: '12px' } },
    h('div', { class: 'stat' }, h('b', { text: String(ex) }), h('span', { text: 'exercícios (14d)' })),
    h('div', { class: 'stat' }, h('b', { text: ex ? `${Math.round((good / ex) * 100)}%` : '—' }), h('span', { text: 'acertos (14d)' })),
    h('div', { class: 'stat' }, h('b', { text: String(rec) }), h('span', { text: 'gravações (14d)' }))));

  // por habilidade
  const SK = [['rec', 'Reconhecer'], ['rcl', 'Lembrar (recuperar)'], ['bld', 'Completar na frase'], ['ord', 'Montar frases'], ['wrt', 'Escrever frases'], ['tell', 'Contar blocos'], ['retell', 'Contar rotinas'], ['conv', 'Perguntas da teacher']];
  view.append(h('h2', { text: 'Por habilidade' }), h('div', { class: 'card flat stack' }, SK.map(([s, label]) => {
    const cs = cards.filter((c) => c.k.endsWith(':' + s));
    const m = cs.filter((c) => c.box >= MASTERED_BOX).length;
    return h('div', {}, h('div', { class: 'row small' }, h('span', { style: { flex: 1 }, text: label }), h('span', { class: 'muted', text: `${m} dominados · ${cs.length} em estudo` })), bar(cs.length ? m / cs.length : 0, 'ok'));
  })));

  // por rotina
  view.append(h('h2', { text: 'Por rotina' }), h('div', { class: 'card flat stack' }, content.routines.map((r) => {
    const m = mastery(state.cards, r.items.map((i) => cardKey('item', i, 'rec')));
    const told = r.blocks.filter((b) => state.cards[cardKey('block', b, 'tell')]).length;
    return h('a', { href: `#/routine/${r.id}`, style: { textDecoration: 'none', color: 'inherit', display: 'block' } },
      h('div', { class: 'row small' }, h('span', { style: { flex: 1 }, text: `${r.id} · ${r.pt}` }), h('span', { class: 'muted', text: `${told}/${r.blocks.length} blocos` })), bar(m.ratio));
  })));

  // por contexto
  view.append(h('h2', { text: 'Por momento do dia' }), h('div', { class: 'card flat stack' }, content.contexts.map((c) => {
    const ids = Object.values(content.items).filter((it) => it.ctx.includes(c.id)).map((it) => cardKey('item', it.id, 'rec'));
    return h('div', {}, h('div', { class: 'row small' }, h('span', { style: { flex: 1 }, text: `${c.icon} ${c.pt}` })), bar(mastery(state.cards, ids).ratio));
  })));

  view.append(h('h2', { text: 'Conquistas' }), h('div', { class: 'ach' }, ACHIEVEMENTS.map((a) =>
    h('div', { class: state.achievements[a.id] ? '' : 'locked', title: a.desc }, h('span', { class: 'ico', text: a.icon }), a.title))));
}
