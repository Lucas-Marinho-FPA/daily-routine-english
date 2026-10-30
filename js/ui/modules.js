// Trilhas, módulos e etapas na interface: lista de módulos da trilha ativa (Daily Routine da persona ou
// Conversation Practice), página do módulo com as cinco etapas e cadeados, e as listas de Palavras-chave e
// Expressões práticas. A situação vem de engine/modules.js (cartões e gravações do perfil ativo).
import { h, icon, bar, toast } from './dom.js';
import { speakerButton, sessionHref } from './common.js';
import { STAGES, moduleStatus, trackStatus, moduleItems, moduleOf, moduleSentences } from '../engine/modules.js';
import { categoryLabel, locate } from '../engine/exercises.js';
import { cardKey } from '../engine/scheduler.js';
import { isPlanned } from '../engine/characters.js';

const STATE_LABEL = { done: 'concluída', open: 'disponível', locked: 'bloqueada' };

/** Nome da trilha ativa. */
export const trackName = (App) => (App.journey ? App.journey.name : `Daily Routine · ${App.character.short || App.character.name}`);

/** Destino de uma etapa liberada (lista, sessão ou Speaking Lab). */
export function stageHref(moduleId, stageId) {
  if (stageId === 'vocab' || stageId === 'expr') return `#/words/${moduleId}?kind=${stageId}`;
  if (stageId === 'speak') return `#/lab?routine=${moduleId}&module=1`;
  return sessionHref({ routine: moduleId, stage: stageId });
}

const moduleTitle = (r) => r.title && r.title !== r.pt ? r.title : r.pt;

/** Marcadores das cinco etapas (✓ concluída, ● disponível, cadeado bloqueada). */
function stageDots(m) {
  return h('div', { class: 'stage-dots', 'aria-label': `${m.doneCount} de ${STAGES.length} etapas concluídas` },
    m.stages.map((s) => h('span', { class: `sdot ${s.state}`, title: `${s.n}. ${s.title} — ${STATE_LABEL[s.state]}`, 'aria-hidden': 'true' },
      s.state === 'locked' ? icon('lock') : s.state === 'done' ? icon('check') : String(s.n))));
}

/** Lista de módulos da trilha ativa. */
export function renderModules(App) {
  const { content, state } = App;
  const view = App.layout(trackName(App), { back: '#/' });
  if (!App.journey && isPlanned(App.character)) { view.append(plannedNotice(App)); return; }
  const tr = trackStatus(content, state);
  view.append(h('section', { class: 'card track-head', 'data-role': App.journey ? 'journey-bar' : 'track-bar' },
    h('div', { class: 'row nowrap' },
      h('div', { class: 'grow' }, h('div', { class: 'small muted', text: App.journey ? 'Jornada comunicativa · progresso próprio' : `Jornada pessoal de ${App.character.short || App.character.name}` }),
        h('b', { text: `${tr.done} de ${tr.total} etapas concluídas` })),
      App.journey ? h('button', { class: 'btn small', 'data-role': 'leave-journey', onclick: async () => { await App.setJourney(null); App.go('#/modules'); } }, `Daily Routine (${App.character.short || App.character.name})`) : null),
    h('div', { style: { marginTop: '8px' } }, bar(tr.ratio))));
  if (App.journey) view.append(h('p', { class: 'small muted', style: { marginTop: '10px' }, text: 'Diálogos originais do app em situações do dia a dia: você aprende as palavras e expressões, ouve, fala e depois usa tudo numa conversa.' }));
  for (const m of tr.modules) {
    const r = moduleOf(content, m.id);
    const isNext = tr.current && tr.current.id === m.id;
    view.append(h('a', { class: `card link module-card${isNext ? ' current' : ''}`, href: `#/module/${r.id}`, 'data-role': App.journey ? 'journey-unit' : 'module-card', 'data-unit': r.id, 'data-complete': String(m.complete) },
      h('div', { class: 'row nowrap' },
        h('div', { class: 'grow' },
          h('div', { class: 'chips' }, h('span', { class: 'chip', text: r.id }), m.complete ? h('span', { class: 'chip ok', text: 'Concluído ✓' }) : isNext ? h('span', { class: 'chip accent', text: 'Continue aqui' }) : null),
          h('h3', { style: { marginTop: '6px' }, text: moduleTitle(r) }),
          r.title && r.title !== r.pt ? h('div', { class: 'small muted', text: r.pt }) : null),
        icon('next')),
      stageDots(m)));
  }
  if (!App.journey) view.append(h('a', { class: 'btn block ghost', href: '#/explore', style: { marginTop: '12px' } }, icon('list'), 'Explorar por momento do dia ou categoria'));
}

/** Página do módulo: objetivo e as cinco etapas, com cadeado nas que ainda não abriram. */
export function renderModule(App, { arg }) {
  const { content, state } = App;
  const r = moduleOf(content, arg);
  if (!r) { App.go('#/modules'); return; }
  const m = moduleStatus(content, r.id, state);
  const view = App.layout(`${r.id} · ${moduleTitle(r)}`, { back: '#/modules' });
  view.append(h('section', { class: 'card module-head' },
    h('div', { class: 'small muted', text: trackName(App) }),
    h('h2', { style: { margin: '4px 0' }, text: moduleTitle(r) }),
    r.title && r.title !== r.pt ? h('div', { class: 'small', text: r.pt }) : null,
    r.goal ? h('p', { class: 'small', style: { marginTop: '6px' } }, h('b', { text: 'Objetivo: ' }), r.goal) : null,
    h('div', { class: 'row nowrap', style: { marginTop: '8px' } }, h('div', { class: 'grow' }, bar(m.doneCount / STAGES.length)), h('span', { class: 'small muted', text: `${m.doneCount}/${STAGES.length}` }))));
  const list = h('ol', { class: 'stages', 'data-role': 'stages' });
  for (const s of m.stages) list.append(stageRow(App, r, s));
  view.append(list);
  if (m.stages.find((s) => s.id === 'listen').complete) {
    view.append(h('a', { class: 'btn block', 'data-role': 'module-text', href: `#/routine/${r.id}`, style: { marginTop: '12px' } }, icon('book'), App.journey ? 'Ver o diálogo completo' : 'Ver o texto completo'));
  } else {
    view.append(h('p', { class: 'tiny muted', style: { marginTop: '12px' }, text: 'O texto completo fica disponível depois de “Ouvir e entender”, para você treinar o ouvido antes de ler.' }));
  }
  view.append(h('p', { class: 'tiny muted', text: 'Uma etapa abre quando a anterior é concluída: basta acertar a maior parte ao menos uma vez — o que você errar volta na revisão. Abrir uma etapa não a conclui.' }));
}

function stageRow(App, r, s) {
  const locked = s.state === 'locked';
  const counter = s.total === 0 ? 'sem itens neste módulo' : s.id === 'speak' ? `${Math.min(s.done, s.need)}/${s.need} gravações` : `${Math.min(s.done, s.need)}/${s.need}`;
  const mark = h('span', { class: `stage-mark ${s.state}`, 'aria-hidden': 'true' }, locked ? icon('lock') : s.state === 'done' ? icon('check') : String(s.n));
  const body = h('div', { class: 'grow' },
    h('div', { class: 'stage-title' }, h('b', { text: `${String(s.n).padStart(2, '0')}. ${s.title}` }), h('span', { class: 'small muted', text: ` · ${s.en}` })),
    h('div', { class: 'small muted', text: locked ? 'Bloqueada — conclua a etapa anterior' : `${STATE_LABEL[s.state][0].toUpperCase()}${STATE_LABEL[s.state].slice(1)} · ${counter}` }),
    s.parts && !locked ? h('ul', { class: 'tiny muted parts' }, s.parts.map((p) => h('li', { text: `${p.done >= p.need ? '✓' : '○'} ${p.label}: ${Math.min(p.done, p.need)}/${p.need}` }))) : null);
  const attrs = { class: `stage ${s.state}`, 'data-role': 'stage', 'data-stage': s.id, 'data-state': s.state };
  if (locked) return h('li', attrs, h('div', { class: 'stage-row', 'aria-disabled': 'true' }, mark, body, icon('lock')));
  return h('li', attrs, h('a', { class: 'stage-row', href: stageHref(r.id, s.id), 'aria-label': `${s.title}: ${STATE_LABEL[s.state]}` }, mark, body, icon('next')));
}

/** Palavras-chave ou Expressões práticas do módulo: significado, áudio, exemplo, situação e marcação. */
export function renderWords(App, { arg, params }) {
  const { content, state } = App;
  const r = moduleOf(content, arg);
  const kind = params.kind === 'expr' ? 'expr' : 'vocab';
  if (!r) { App.go('#/modules'); return; }
  const stage = moduleStatus(content, r.id, state).stages.find((s) => s.id === kind);
  if (stage.state === 'locked') { App.go(`#/module/${r.id}`); return; }
  const view = App.layout(kind === 'vocab' ? 'Palavras-chave' : 'Expressões práticas', { back: `#/module/${r.id}` });
  const items = moduleItems(content, r, kind);
  const today = App.today();
  const favs = state.favorites || (state.favorites = {});
  let onlyMarked = false;
  view.append(h('p', { class: 'small muted', text: kind === 'vocab'
    ? `Palavras de que você precisa em “${moduleTitle(r)}”. Ouça, veja o exemplo e pratique.`
    : `Phrasal verbs, collocations e expressões naturais de “${moduleTitle(r)}”, sempre num exemplo da situação.` }),
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
    it.tip ? h('div', { class: 'tiny muted', text: `Dica: ${it.tip}` }) : null,
    h('div', { class: 'row', style: { marginTop: '8px' } },
      h('span', { class: cls, text: lab }),
      sid ? h('a', { class: 'btn small ghost', href: `#/lab?sentence=${sid}` }, icon('mic'), 'Falar no exemplo') : null));
}

/** Persona prevista: trilha em preparação; o Conversation Practice já pode ser usado. */
export function plannedNotice(App) {
  return h('section', { class: 'card', 'data-role': 'planned' },
    h('h3', { text: `Jornada de ${App.character.name} em preparação` }),
    h('p', { class: 'small', text: 'As rotinas desta persona ainda não foram criadas. O progresso dela já é separado: quando o conteúdo chegar, começa do zero, sem misturar com as outras personas.' }),
    h('a', { class: 'btn primary block', href: '#/', 'data-role': 'planned-home' }, icon('home'), 'Voltar ao Início'));
}
