// Jornadas, módulos e etapas na interface. Daily Routine (histórias da família) e Conversation Practice (situações
// comunicativas) usam o mesmo ciclo de seis etapas (engine/modules.js), com conteúdo e progresso próprios.
// A situação de módulos e etapas vem SÓ de engine/modules.js (cartões e gravações): a mesma em todas as telas.
import { h, icon, bar, toast } from './dom.js';
import { speakerButton, sessionHref } from './common.js';
import { STAGES, STATE_LABEL, moduleStatus, trackStatus, moduleItems, moduleOf, moduleSentences } from '../engine/modules.js';
import { categoryLabel, locate } from '../engine/exercises.js';
import { cardKey } from '../engine/scheduler.js';
import { isPlanned, registry, contentFor, CAST } from '../engine/characters.js';
import { progressOf } from '../engine/profiles.js';
import { illustration } from './illustration.js';

const MODULE_LABEL = { done: 'Concluído', progress: 'Em andamento', open: 'Não iniciado' };

/** Nome da jornada ativa. */
export const trackName = (App) => (App.journey ? App.journey.name : 'Daily Routine');
/** Raiz da jornada ativa (aba própria). */
export const trackRoot = (App) => (App.journey ? '#/cp' : '#/dr');
export const moduleTitle = (r) => (r.title && r.title !== r.pt ? r.title : r.pt);

/** Destino de uma etapa liberada (lista, sessão ou Speaking Lab). */
export function stageHref(moduleId, stageId) {
  if (stageId === 'vocab' || stageId === 'expr') return `#/words/${moduleId}?kind=${stageId}`;
  if (stageId === 'speak') return `#/lab?routine=${moduleId}&module=1`;
  return sessionHref({ routine: moduleId, stage: stageId });
}

/** Marcadores das seis etapas, com o estado também em texto (leitores de tela e quem não distingue cores). */
function stageDots(m) {
  return h('div', { class: 'stage-dots', role: 'img', 'aria-label': `${m.doneCount} de ${STAGES.length} etapas concluídas` },
    m.stages.map((s) => h('span', { class: `sdot ${s.state}`, title: `${s.n}. ${s.title} — ${STATE_LABEL[s.state]}`, 'aria-hidden': 'true' },
      s.state === 'locked' ? icon('lock') : s.state === 'done' ? icon('check') : String(s.n))));
}

/** Cabeçalho da história (Daily Routine): protagonista, quem é e troca de história. */
function storyHead(App) {
  const ch = App.character;
  const cast = CAST[ch.id] || {};
  return h('section', { class: 'story-head', 'data-role': 'story-head', 'data-character': ch.id },
    h('div', { class: 'grow' },
      h('div', { class: 'eyebrow', text: 'História' }),
      h('div', { class: 'story-name' }, h('b', { text: ch.name }), cast.role ? h('span', { class: 'muted', text: ` · ${cast.role}` }) : null),
      cast.about ? h('div', { class: 'small muted', text: cast.about }) : null),
    h('a', { class: 'btn small', href: '#/stories', 'data-role': 'change-story' }, 'Trocar história'));
}

/** Lista de módulos da jornada ativa. */
export function renderModules(App) {
  const { content, state } = App;
  const view = App.layout(trackName(App));
  if (!App.journey) view.append(storyHead(App));
  if (!App.journey && isPlanned(App.character)) { view.append(plannedNotice(App)); return; }
  const tr = trackStatus(content, state);
  view.append(h('section', { class: 'track-head', 'data-role': App.journey ? 'journey-bar' : 'track-bar' },
    h('p', { class: 'small muted', style: { margin: '0 0 6px' }, text: App.journey
      ? 'Situações de conversa do dia a dia, com progresso próprio.'
      : 'Sessões da rotina, cada uma com as mesmas seis etapas.' }),
    h('div', { class: 'row nowrap small' }, h('span', { class: 'grow', text: `${tr.modules.filter((m) => m.complete).length} de ${tr.modules.length} sessões concluídas` }), h('b', { text: `${tr.done}/${tr.total} etapas` })),
    bar(tr.ratio)));
  const list = h('ol', { class: 'module-list', 'data-role': 'module-list' });
  for (const m of tr.modules) {
    const r = moduleOf(content, m.id);
    const isNext = tr.current && tr.current.id === m.id;
    const nextTxt = !m.complete && m.next ? `Próxima: ${m.next.n}. ${m.next.title}` : null;
    list.append(h('li', {}, h('a', { class: `card link module-card${isNext ? ' current' : ''}`, href: `#/module/${r.id}`, 'data-role': App.journey ? 'journey-unit' : 'module-card', 'data-unit': r.id, 'data-complete': String(m.complete), 'data-state': m.state },
      h('div', { class: 'row nowrap' },
        h('div', { class: 'grow' },
          h('div', { class: 'chips' }, h('span', { class: 'chip', text: r.id }),
            h('span', { class: `chip state-${m.state}`, 'data-role': 'module-state', text: m.complete ? `${MODULE_LABEL.done} ✓` : MODULE_LABEL[m.state] }),
            isNext ? h('span', { class: 'chip accent', text: 'Continue aqui' }) : null),
          h('h3', { class: 'module-title', text: moduleTitle(r) }),
          r.title && r.title !== r.pt ? h('div', { class: 'small muted', text: r.pt }) : null,
          nextTxt ? h('div', { class: 'small', 'data-role': 'module-next', text: nextTxt }) : null),
        icon('next')),
      stageDots(m))));
  }
  view.append(list);
  if (!App.journey) view.append(h('a', { class: 'btn block ghost', href: '#/explore', style: { marginTop: '12px' } }, icon('list'), 'Consultar por momento do dia ou categoria'));
}

/** Escolha da história da Daily Routine (o elenco fixo da família). Cada história guarda o próprio progresso. */
export function renderStories(App) {
  if (App.journey) App.setJourney(null);
  const view = App.layout('Histórias da Daily Routine', { back: '#/dr' });
  view.append(h('p', { class: 'small muted', text: 'Escolha a história que você quer estudar. O progresso de cada uma fica guardado separadamente.' }));
  const list = h('div', { class: 'stack', 'data-role': 'stories' });
  for (const c of registry().characters) {
    const cast = CAST[c.id] || {};
    const planned = isPlanned(c);
    const t = planned ? null : trackStatus(contentFor(App.baseContent, c.id), progressOf(App.state, c.id) || { cards: {}, recordingsMeta: {} });
    const current = App.character && App.character.id === c.id;
    const body = [
      illustration({ kind: 'character', id: c.id, variant: 'idle', alt: c.name, label: c.name, ratio: '1 / 1', cls: 'ill-avatar' }),
      h('div', { class: 'grow' },
        h('div', {}, h('b', { text: c.name }), cast.role ? h('span', { class: 'muted', text: ` · ${cast.role}` }) : null, current ? h('span', { class: 'chip accent', style: { marginLeft: '6px' }, text: 'Atual' }) : null),
        cast.about ? h('div', { class: 'small muted', text: cast.about }) : null,
        planned ? h('div', { class: 'small', text: 'Histórias em preparação.' })
          : h('div', { class: 'small', text: `${t.modules.filter((m) => m.complete).length} de ${t.modules.length} sessões concluídas` })),
    ];
    list.append(planned
      ? h('div', { class: 'card story disabled', 'data-role': 'story', 'data-character': c.id, 'aria-disabled': 'true' }, h('div', { class: 'row nowrap' }, ...body))
      : h('button', { class: 'card link story', type: 'button', 'data-role': 'story', 'data-character': c.id, 'aria-pressed': String(current),
        onclick: async () => { await App.chooseCharacter(c.id); App.go('#/dr', { replace: true }); } }, h('div', { class: 'row nowrap' }, ...body, icon('next'))));
  }
  view.append(list);
}

/** Página do módulo: contexto, objetivo e as seis etapas (estado em texto e ícone). */
export function renderModule(App, { arg }) {
  const { content, state } = App;
  const r = moduleOf(content, arg);
  if (!r) { App.go(trackRoot(App)); return; }
  const m = moduleStatus(content, r.id, state);
  const view = App.layout(`${r.id} · ${moduleTitle(r)}`, { back: trackRoot(App) });
  view.append(h('section', { class: 'module-head' },
    illustration({ kind: 'session', id: r.id, variant: 'cover', alt: moduleTitle(r), label: moduleTitle(r) }),
    h('div', { class: 'small muted', text: App.journey ? trackName(App) : `Daily Routine · ${App.character.name}` }),
    h('h2', { style: { margin: '4px 0' }, text: moduleTitle(r) }),
    r.title && r.title !== r.pt ? h('div', { class: 'small', text: r.pt }) : null,
    r.goal ? h('p', { class: 'small', style: { marginTop: '6px' } }, h('b', { text: 'O que você vai aprender: ' }), r.goal) : null,
    h('div', { class: 'row nowrap', style: { marginTop: '8px' } }, h('div', { class: 'grow' }, bar(m.ratio)), h('span', { class: 'small', 'data-role': 'module-state', text: `${MODULE_LABEL[m.state]} · ${m.doneCount}/${STAGES.length}` }))));
  // o texto da situação (história ou diálogo) sempre acessível: entender o contexto antes de praticar
  view.append(h('a', { class: 'card link session-text', href: `#/routine/${r.id}`, 'data-role': r.session ? 'session-text' : 'module-text' },
    h('div', { class: 'row nowrap' },
      h('span', { class: 'stage-mark open', 'aria-hidden': 'true' }, icon('book')),
      h('div', { class: 'grow' }, h('b', { text: App.journey ? 'Diálogo da situação' : r.session ? 'Texto da sessão e expressões' : 'Texto da história' }),
        r.session ? h('div', { class: 'small muted', text: `${r.session.level} · ${r.session.focus}` }) : null,
        h('div', { class: 'small', text: 'Leia, ouça e veja a tradução.' })),
      icon('next'))));
  const list = h('ol', { class: 'stages', 'data-role': 'stages' });
  for (const s of m.stages) list.append(stageRow(App, r, s));
  view.append(h('h3', { class: 'section-title', text: 'Etapas' }), list);
  view.append(h('p', { class: 'tiny muted', text: 'Cada etapa abre quando a anterior está concluída. Concluir é acertar a maior parte ao menos uma vez; o que você errar volta na revisão.' }));
}

function stageRow(App, r, s) {
  const locked = s.state === 'locked';
  const counter = s.total === 0 ? 'sem itens nesta sessão' : s.id === 'speak' ? `${Math.min(s.done, s.need)}/${s.need} gravações` : `${Math.min(s.done, s.need)}/${s.need}`;
  const mark = h('span', { class: `stage-mark ${s.state}`, 'aria-hidden': 'true' }, locked ? icon('lock') : s.state === 'done' ? icon('check') : String(s.n));
  const body = h('div', { class: 'grow' },
    h('div', { class: 'stage-title' }, h('b', { text: `${s.n}. ${s.title}` }), h('span', { class: 'small muted en', text: ` · ${s.en}` })),
    h('div', { class: 'small', 'data-role': 'stage-state' }, h('span', { class: `state-tag ${s.state}`, text: STATE_LABEL[s.state] }), locked ? ' — conclua a etapa anterior' : ` · ${counter}`),
    !locked && s.state !== 'done' && s.goal ? h('div', { class: 'tiny muted', text: s.goal }) : null,
    s.parts && !locked ? h('ul', { class: 'tiny muted parts' }, s.parts.map((p) => h('li', { text: `${p.done >= p.need ? '✓' : '○'} ${p.label}: ${Math.min(p.done, p.need)}/${p.need}` }))) : null);
  const attrs = { class: `stage ${s.state}`, 'data-role': 'stage', 'data-stage': s.id, 'data-state': s.state };
  if (locked) return h('li', attrs, h('div', { class: 'stage-row', 'aria-disabled': 'true' }, mark, body, icon('lock')));
  return h('li', attrs, h('a', { class: 'stage-row', href: stageHref(r.id, s.id), 'aria-label': `${s.n}. ${s.title}: ${STATE_LABEL[s.state]}` }, mark, body, icon('next')));
}

/** Palavras-chave ou Expressões práticas do módulo: significado, áudio, exemplo, situação e marcação. */
export function renderWords(App, { arg, params }) {
  const { content, state } = App;
  const r = moduleOf(content, arg);
  const kind = params.kind === 'expr' ? 'expr' : 'vocab';
  if (!r) { App.go(trackRoot(App)); return; }
  const stage = moduleStatus(content, r.id, state).stages.find((s) => s.id === kind);
  if (stage.state === 'locked') { App.go(`#/module/${r.id}`); return; }
  const view = App.layout(kind === 'vocab' ? '1. Vocabulário' : '2. Combinações e expressões', { back: `#/module/${r.id}` });
  const items = moduleItems(content, r, kind);
  const today = App.today();
  const favs = state.favorites || (state.favorites = {});
  let onlyMarked = false;
  view.append(h('p', { class: 'small muted', text: kind === 'vocab'
    ? `As palavras de “${moduleTitle(r)}”: significado, áudio e um exemplo da situação.`
    : `Como as palavras se combinam em “${moduleTitle(r)}”: collocations, phrasal verbs e expressões, cada uma num exemplo.` }),
  h('div', { class: 'row', style: { margin: '8px 0 12px' } },
    h('a', { class: 'btn primary', 'data-role': 'stage-practice', href: sessionHref({ routine: r.id, stage: kind }) }, icon('play'), 'Praticar'),
    h('span', { class: 'small muted', text: `${Math.min(stage.done, stage.need)}/${stage.need} para concluir` })));
  const list = h('div', { class: 'stack', 'data-role': 'word-list' });
  const filterBtn = h('button', { class: 'chip', 'aria-pressed': 'false', onclick: () => { onlyMarked = !onlyMarked; filterBtn.setAttribute('aria-pressed', String(onlyMarked)); draw(); } }, icon('star'), ' Só as marcadas');
  view.append(h('div', { class: 'row' }, filterBtn), list);
  const draw = () => {
    list.replaceChildren(...items.filter((it) => !onlyMarked || favs[it.id]).map((it) => wordCard(App, r, it, today)));
    if (!list.children.length) list.append(h('p', { class: 'small muted', text: 'Nenhuma marcada ainda: toque na estrela de um item para marcá-lo para revisão.' }));
  };
  draw();
}

/** Situação de um item para o aluno: novo, aprendido ou para revisar (mesmos cartões da revisão espaçada). */
export function itemLearnState(cards, itemId, today) {
  const c = cards[cardKey('item', itemId, 'rec')];
  if (!c || !c.reps) return 'new';
  if (c.lastResult === 'bad' || c.due <= today) return 'review';
  return 'learned';
}
const LEARN_LABEL = { new: ['Novo', 'chip'], learned: ['Aprendido', 'chip ok'], review: ['Para revisar', 'chip warn'] };

/** Nota de uso do item (texto ou lista da curadoria), se houver. */
const noteOf = (it) => { const n = Array.isArray(it.notes) ? it.notes[0] : it.notes; return String((n && typeof n === 'object' ? n.text : n) || '').trim(); };

function wordCard(App, r, it, today) {
  const { content, state } = App;
  const sents = new Set(moduleSentences(content, r));
  const ex = (it.ex || []).find((x) => x.src && sents.has(x.src)) || (it.ex || [])[0] || null;
  const sid = ex && ex.src && content.sentences[ex.src] ? ex.src : (it.sentences || []).find((s) => sents.has(s));
  const ls = itemLearnState(state.cards, it.id, today);
  const [lab, cls] = LEARN_LABEL[ls];
  const marked = () => !!state.favorites[it.id];
  const star = h('button', { class: `icon-btn ghost star${marked() ? ' on' : ''}`, 'aria-pressed': String(marked()), 'aria-label': 'Marcar para revisão', 'data-role': 'mark',
    onclick: () => {
      if (marked()) delete state.favorites[it.id]; else state.favorites[it.id] = Date.now();
      star.classList.toggle('on', marked()); star.setAttribute('aria-pressed', String(marked()));
      App.save();
      toast(marked() ? 'Marcado para revisão.' : 'Marcação removida.');
    } }, icon('star'));
  const loc = ex ? locate(it, ex.en) : null;
  return h('article', { class: 'card word', 'data-role': 'word', 'data-item': it.id, 'data-state': ls },
    h('div', { class: 'row nowrap' },
      h('div', { class: 'grow' },
        h('div', { class: 'word-en en', text: it.en }),
        h('div', { class: 'small muted' }, h('span', { text: categoryLabel(it.c) }), ' · ', h('span', { class: 'word-pt', text: it.pt }))),
      it.au ? speakerButton({ key: it.au, text: it.en.replace(/…$/, '') }, { label: `Ouvir “${it.en}”` }) : null,
      star),
    ex ? h('p', { class: 'small en ex', style: { margin: '8px 0 2px' } }, ...(loc ? [loc.before, h('b', { text: loc.target }), loc.after] : [ex.en])) : null,
    ex && ex.pt ? h('div', { class: 'tiny muted', text: ex.pt }) : null,
    noteOf(it) ? h('div', { class: 'tiny', style: { marginTop: '4px' }, text: `Uso: ${noteOf(it)}` }) : null,
    it.explain ? h('div', { class: 'small', style: { marginTop: '4px' }, 'data-role': 'explain', text: it.explain }) : null,
    it.extra ? h('div', { class: 'row nowrap', style: { marginTop: '6px', alignItems: 'flex-start' }, 'data-role': 'extra' },
      h('div', { class: 'grow' }, h('div', { class: 'small en', text: it.extra.en }), h('div', { class: 'tiny muted', text: it.extra.pt })),
      speakerButton({ key: it.extra.au, text: it.extra.en }, { label: 'Ouvir o outro exemplo', cls: 'icon-btn ghost' })) : null,
    it.tip ? h('div', { class: 'tiny muted', text: `Dica: ${it.tip}` }) : null,
    h('div', { class: 'row', style: { marginTop: '8px' } },
      h('span', { class: cls, text: lab }),
      sid ? h('a', { class: 'btn small ghost', href: `#/lab?sentence=${sid}` }, icon('mic'), 'Falar no exemplo') : null));
}

/** Persona prevista: trilha em preparação; o Conversation Practice já pode ser usado. */
export function plannedNotice(App) {
  return h('section', { class: 'card', 'data-role': 'planned' },
    h('h3', { text: `Histórias de ${App.character.name} em preparação` }),
    h('p', { class: 'small', text: 'As sessões desta história ainda não foram criadas. Enquanto isso, escolha outra história da família.' }),
    h('a', { class: 'btn primary block', href: '#/stories', 'data-role': 'planned-home' }, 'Escolher outra história'));
}
