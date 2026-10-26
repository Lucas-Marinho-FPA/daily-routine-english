// Revisão: pendências do dia, dificuldades, respostas aceitas por você, minhas versões e palavras marcadas.
import { h, icon, clear, confirmSheet, fmtDate } from './dom.js';
import { sessionHref } from './common.js';
import { difficultCards, unitLabel } from './session.js';

export function renderReview(App) {
  const { state, content } = App;
  const view = App.layout('Revisar', { back: '#/stats' });
  const today = App.today();
  const due = Object.values(state.cards).filter((c) => c.due <= today);
  const hard = difficultCards(state, content);

  view.append(h('div', { class: 'stat-grid' },
    h('div', { class: 'stat' }, h('b', { text: String(due.length) }), h('span', { text: 'para hoje' })),
    h('div', { class: 'stat' }, h('b', { text: String(hard.length) }), h('span', { text: 'dificuldades' })),
    h('div', { class: 'stat' }, h('b', { text: String(Object.keys(state.difficultWords || {}).length) }), h('span', { text: 'palavras marcadas' }))));

  view.append(h('div', { class: 'row', style: { marginTop: '14px' } },
    h('a', { class: `btn primary${due.length ? '' : ' disabled'}`, href: due.length ? sessionHref({ mode: 'review' }) : null, 'aria-disabled': due.length ? null : 'true', style: { flex: 1 } }, icon('refresh'), 'Revisar pendências'),
    h('a', { class: 'btn', href: hard.length ? sessionHref({ mode: 'difficult' }) : null, 'aria-disabled': hard.length ? null : 'true', style: { flex: 1 } }, icon('target'), 'Treinar dificuldades')));

  const parse = (k) => { const [unit, id, skill] = k.split(':'); return { unit, id, skill, k }; };
  const SK = { rec: 'reconhecer', rcl: 'lembrar', bld: 'completar', ord: 'ordenar', wrt: 'escrever', seq: 'sequência', tell: 'contar bloco', retell: 'contar rotina', conv: 'conversa', vb3: '3ª pessoa' };
  view.append(h('h2', { text: 'Dificuldades' }));
  if (!hard.length) view.append(h('p', { class: 'small muted', text: 'Nenhuma por enquanto. Itens com erros repetidos aparecem aqui.' }));
  else view.append(h('ul', { class: 'list card' }, hard.slice(0, 40).map((c) => {
    const e = parse(c.k);
    return h('li', {}, h('div', { class: 'list-btn' }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: unitLabel(content, e) }),
      h('div', { class: 'small muted', text: `${SK[e.skill] || e.skill} · ${c.lapses} erro(s) · caixa ${c.box}` }))));
  })));

  // respostas que você declarou corretas (variantes pessoais)
  const claimed = state.pending.filter((p) => p.status === 'claimed');
  view.append(h('h2', { text: 'Respostas aceitas por você' }), h('p', { class: 'small muted', text: 'Quando o corretor não tinha certeza e você marcou “Eu estava certo”. Elas passam a ser aceitas; remova se mudar de ideia.' }));
  if (!claimed.length) view.append(h('p', { class: 'small muted', text: 'Nenhuma.' }));
  else {
    const ul = h('ul', { class: 'list card' });
    const draw = () => {
      clear(ul).append(...state.pending.filter((p) => p.status === 'claimed').map((p) => h('li', {}, h('div', { class: 'list-btn' },
        h('div', { class: 'grow' }, h('div', { class: 'title en', text: p.answer }), h('div', { class: 'small muted en', text: `modelo: ${p.model}` })),
        h('button', { class: 'btn small danger', onclick: async () => {
          if (!(await confirmSheet('Remover variante?', `“${p.answer}” deixará de ser aceita.`, { ok: 'Remover', danger: true }))) return;
          p.status = 'removed';
          state.userVariants[p.key] = (state.userVariants[p.key] || []).filter((v) => v !== p.answer);
          App.rebuildChecker();
          App.save();
          draw();
        } }, 'Remover')))));
    };
    draw();
    view.append(ul);
  }

  const mine = Object.entries(state.myAnswers);
  view.append(h('h2', { text: 'Minhas versões' }));
  if (!mine.length) view.append(h('p', { class: 'small muted', text: 'Suas respostas pessoais às perguntas da teacher aparecem aqui.' }));
  else view.append(h('ul', { class: 'list card' }, mine.map(([qid, a]) => {
    const q = content.questions[qid];
    return h('li', {}, h('a', { class: 'list-btn', href: `#/lab?q=${qid}` }, h('div', { class: 'grow' },
      h('div', { class: 'small muted en', text: q ? q.q : qid }), h('div', { class: 'title en', text: a.text }), h('div', { class: 'tiny muted', text: fmtDate(a.at) }))));
  })));

  const words = Object.keys(state.difficultWords || {});
  view.append(h('h2', { text: 'Palavras marcadas no Speaking Lab' }));
  if (!words.length) view.append(h('p', { class: 'small muted', text: 'Nenhuma palavra marcada.' }));
  else view.append(h('div', { class: 'chips' }, words.map((w) => h('a', { class: 'chip warn', href: labHref(state.difficultWords[w].from), text: w }))));
}

/** Converte o id de alvo do Lab (sent:…, block:…, routine:…, q:…, drill:…) em link. */
function labHref(target = '') {
  const [kind, id] = target.split(':');
  const param = { sent: 'sentence', block: 'block', q: 'q', drill: 'drill' }[kind];
  if (kind === 'routine') return `#/lab?routine=${id}&full=1`;
  return param ? `#/lab?${param}=${id}` : '#/lab';
}
