// Navegação por rotina, contexto e categoria + leitura das rotinas.
import { h, icon, bar, clear, toast } from './dom.js';
import { cardKey, mastery } from '../engine/scheduler.js';
import * as player from '../audio/player.js';
import { speakerButton, openItem, statusDot, sessionHref, sourceChip } from './common.js';
import { categoryLabel } from '../engine/exercises.js';

let exploreTab = 'routines';

export function renderExplore(App) {
  const view = App.layout('Estudar');
  const tabs = [['routines', 'Rotinas'], ['contexts', 'Momentos'], ['categories', 'Categorias']];
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Organizar por' });
  const body = h('div', { style: { marginTop: '12px' } });
  const draw = () => {
    clear(seg).append(...tabs.map(([id, label]) => h('button', { 'aria-pressed': String(exploreTab === id), onclick: () => { exploreTab = id; draw(); } }, label)));
    clear(body);
    if (exploreTab === 'routines') body.append(routineList(App));
    if (exploreTab === 'contexts') body.append(contextList(App));
    if (exploreTab === 'categories') body.append(categoryList(App));
  };
  draw();
  view.append(seg, body);
}

function routineList(App) {
  const { content, state } = App;
  return h('div', {}, content.routines.map((r) => {
    const m = mastery(state.cards, r.items.map((i) => cardKey('item', i, 'rec')));
    return h('a', { class: 'card link', href: `#/routine/${r.id}` },
      h('div', { class: 'chips' },
        h('span', { class: 'chip', text: r.id }),
        r.priority ? h('span', { class: 'chip accent', text: 'Prioritária' }) : null,
        h('span', { class: 'chip', text: content.dayTypes[r.dayType] })),
      h('h3', { style: { margin: '8px 0 2px' }, text: r.pt }),
      h('div', { class: 'small muted en', text: r.title }),
      h('div', { style: { marginTop: '10px' } }, bar(m.ratio)));
  }));
}

function contextList(App) {
  const { content, state } = App;
  return h('div', {}, content.contexts.map((c) => {
    const ids = Object.values(content.items).filter((it) => it.ctx.includes(c.id) && !it.tags.includes('grammar-model')).map((it) => it.id);
    const m = mastery(state.cards, ids.map((i) => cardKey('item', i, 'rec')));
    return h('a', { class: 'card link', href: `#/context/${c.id}` },
      h('div', { class: 'row nowrap' }, h('span', { style: { fontSize: '1.6rem' }, text: c.icon }),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('h3', { style: { margin: 0 }, text: c.pt }), h('div', { class: 'small muted en', text: `${c.en} · ${ids.length} itens` }))),
      h('div', { style: { marginTop: '10px' } }, bar(m.ratio)));
  }));
}

function categoryList(App) {
  const { content, state } = App;
  return h('ul', { class: 'list card' }, content.categories.map((c) => {
    const ids = categoryItems(content, c.id);
    const m = mastery(state.cards, ids.map((i) => cardKey('item', i, 'rec')));
    const count = c.id === 'qa' ? Object.keys(content.questions).length : c.id === 'text' ? content.routines.length : c.id === 'verb' ? content.verbs.length + ids.length : ids.length;
    return h('li', {}, h('a', { class: 'list-btn', href: `#/category/${c.id}` },
      h('div', { class: 'grow' }, h('div', { class: 'title', text: c.pt }), h('div', { class: 'small muted', text: `${count} ${c.id === 'qa' ? 'perguntas' : c.id === 'text' ? 'textos' : 'itens'}` })),
      ids.length ? h('span', { class: 'small muted', text: `${Math.round(m.ratio * 100)}%` }) : null, icon('next')));
  }));
}

const categoryItems = (content, cat) => Object.values(content.items).filter((it) => it.c === cat).map((it) => it.id);

// ---------- rotina ----------
export function renderRoutine(App, { arg }) {
  const { content, state } = App;
  const r = content.routines.find((x) => x.id === arg);
  if (!r) return App.go('#/explore');
  const view = App.layout(`${r.id} · ${r.pt}`, { back: '#/explore' });
  let showPt = false;
  const m = mastery(state.cards, r.items.map((i) => cardKey('item', i, 'rec')));
  const revNotes = content.review.rev.filter((x) => x.note && (x.where.startsWith(r.id + '-') || x.where.startsWith(r.id + '.')));

  view.append(
    h('div', { class: 'chips' }, r.priority ? h('span', { class: 'chip accent', text: 'Prioritária para a aula' }) : null, h('span', { class: 'chip', text: content.dayTypes[r.dayType] }),
      r.stage ? h('span', { class: 'chip', 'data-role': 'stage', text: `Etapa ${r.stage}` }) : null,
      h('span', { class: 'chip', text: r.kind === 'episode' ? 'Situação ilustrativa' : 'Tipo de dia — não é todo dia' })),
    h('p', { class: 'en muted', style: { margin: '8px 0 2px' }, text: r.title }),
    h('p', { class: 'small', text: r.goal }),
    r.grammar ? h('p', { class: 'small', 'data-role': 'grammar' }, h('b', { text: 'Foco da língua: ' }), r.grammar) : null,
    bar(m.ratio),
    h('div', { class: 'row', style: { marginTop: '14px' } },
      h('a', { class: 'btn primary', href: sessionHref({ routine: r.id }) }, icon('play'), 'Praticar'),
      h('button', { class: 'btn', onclick: () => listenAll() }, icon('speaker'), 'Ouvir tudo'),
      h('a', { class: 'btn', href: `#/lab?routine=${r.id}` }, icon('mic'), 'Falar')),
    h('a', { class: 'btn block', href: sessionHref({ routine: r.id, mode: 'present' }), style: { marginTop: '10px' } }, icon('target'), 'Treino para a aula: contar blocos + perguntas'));

  const blocksBox = h('div', {});
  const ptToggle = h('button', { class: 'btn small', 'aria-pressed': 'false', onclick: () => { showPt = !showPt; ptToggle.setAttribute('aria-pressed', String(showPt)); ptToggle.textContent = showPt ? 'Ocultar tradução' : 'Mostrar tradução'; drawBlocks(); } }, 'Mostrar tradução');
  view.append(h('div', { class: 'row', style: { marginTop: '22px' } }, h('h2', { style: { margin: 0, flex: 1 }, text: 'Texto-modelo' }), ptToggle), blocksBox);

  const sentenceEls = new Map();
  function drawBlocks() {
    clear(blocksBox);
    sentenceEls.clear();
    r.blocks.forEach((bid) => {
      const b = content.blocks[bid];
      const told = state.cards[cardKey('block', bid, 'tell')];
      // diálogo: uma fala por linha, com quem fala; texto corrido: frases no mesmo parágrafo
      const para = h(b.kind === 'dialogue' ? 'div' : 'p', { class: b.kind === 'dialogue' ? 'para dialogue' : 'para' });
      b.sentences.forEach((sid, i) => {
        const s = content.sentences[sid];
        const el = h('span', { class: 'sent', role: 'button', tabindex: '0', 'aria-label': `Ouvir: ${s.en}`, text: s.en });
        el.addEventListener('click', () => playOne(sid));
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter') playOne(sid); });
        sentenceEls.set(sid, el);
        if (b.kind === 'dialogue') para.append(h('p', { class: 'line' }, h('b', { class: 'speaker', text: `${s.speaker}: ` }), el));
        else para.append(el, i < b.sentences.length - 1 ? ' ' : '');
      });
      blocksBox.append(h('section', { class: 'card' },
        h('div', { class: 'row' }, h('span', { class: 'chip', text: `Bloco ${b.index}` }), b.title && r.kind === 'episode' ? h('span', { class: 'chip', text: b.title }) : null, ...b.ctx.map((c) => h('span', { class: 'chip', text: content.contexts.find((x) => x.id === c).pt })),
          h('span', { class: 'spacer' }), told ? h('span', { class: 'chip ok', text: 'contado ✓' }) : null),
        para, showPt ? h('p', { class: 'para-pt', text: b.pt }) : null,
        h('div', { class: 'row' },
          h('button', { class: 'btn small', onclick: () => listenBlock(b) }, icon('speaker'), 'Ouvir bloco'),
          h('a', { class: 'btn small', href: `#/lab?block=${bid}` }, icon('mic'), 'Gravar'))));
    });
  }
  drawBlocks();

  const mark = (sid) => sentenceEls.forEach((el, k) => el.classList.toggle('playing', k === sid));
  async function playOne(sid) {
    player.stopAll();
    mark(sid);
    const s = content.sentences[sid];
    const res = await player.play({ key: s.au, text: s.en });
    mark(null);
    if (!res.ok) toast('Áudio indisponível neste aparelho.');
  }
  function listenBlock(b) {
    player.stopAll();
    const sids = b.sentences;
    player.playSequence(sids.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })), { onIndex: (i) => mark(i >= 0 ? sids[i] : null) });
  }
  function listenAll() {
    player.stopAll();
    const sids = r.blocks.flatMap((b) => content.blocks[b].sentences);
    player.playSequence(sids.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })), { onIndex: (i) => mark(i >= 0 ? sids[i] : null) });
  }

  // vocabulário da rotina
  const words = Object.values(content.items).filter((it) => it.routines.includes(r.id) && !it.tags.includes('grammar-model'));
  view.append(h('h2', { text: `Expressões desta rotina (${words.length})` }), itemList(App, words));

  if (r.usage.length || revNotes.length) {
    view.append(h('h2', { text: 'Pontos de uso' }), h('div', { class: 'card flat' },
      ...r.usage.map((u) => h('p', { class: 'small', text: '• ' + u })),
      ...revNotes.map((n) => h('div', { class: 'notice warn small', style: { marginTop: '8px' } }, h('b', { text: `Nota de revisão (${n.id}): ` }), n.note))));
  }
  view.append(h('h2', { text: 'Perguntas da teacher' }), h('ul', { class: 'list card' }, r.questions.map((qid) => {
    const q = content.questions[qid];
    const done = state.cards[cardKey('q', qid, 'conv')];
    return h('li', {}, h('a', { class: 'list-btn', href: `#/lab?q=${qid}` },
      h('div', { class: 'grow' }, h('div', { class: 'title en', text: q.q }), h('div', { class: 'small muted', text: `${QKIND[q.kind] ? QKIND[q.kind] + ' · ' : ''}${done ? 'praticada' : 'ainda não praticada'}` })), icon('mic')));
  })));
}

const QKIND = { comp: 'compreensão da história', transfer: 'responda sobre você' };

export function itemList(App, items) {
  return h('ul', { class: 'list card' }, items.map((it) => h('li', {},
    h('button', { class: 'list-btn', onclick: () => openItem(App, it) },
      statusDot(App.state, it.id),
      h('div', { class: 'grow' }, h('div', { class: 'title en', text: it.en }), h('div', { class: 'small muted', text: `${it.pt} · ${categoryLabel(it.c)}` })),
      it.source === 'new' ? sourceChip('new') : null))));
}

// ---------- contexto / categoria ----------
export function renderContext(App, { arg }) {
  const c = App.content.contexts.find((x) => x.id === arg);
  if (!c) return App.go('#/explore');
  const view = App.layout(`${c.icon} ${c.pt}`, { back: '#/explore' });
  const items = Object.values(App.content.items).filter((it) => it.ctx.includes(c.id) && !it.tags.includes('grammar-model')).sort((a, b) => a.lvl - b.lvl);
  view.append(h('p', { class: 'muted en', text: c.en }),
    h('a', { class: 'btn primary block', href: sessionHref({ context: c.id }) }, icon('play'), 'Praticar este momento do dia'));
  const cats = App.content.categories.filter((cat) => items.some((it) => it.c === cat.id));
  for (const cat of cats) {
    view.append(h('h2', { text: cat.pt }), itemList(App, items.filter((it) => it.c === cat.id)));
  }
}

export function renderCategory(App, { arg }) {
  const { content } = App;
  const cat = content.categories.find((x) => x.id === arg);
  if (!cat) return App.go('#/explore');
  const view = App.layout(cat.pt, { back: '#/explore' });
  if (cat.id === 'qa') {
    view.append(h('a', { class: 'btn primary block', href: sessionHref({ category: 'qa' }) }, icon('play'), 'Praticar perguntas'));
    const groups = [['Das rotinas (Word)', (q) => q.source === 'word' && q.routine], ['Gerais (Word)', (q) => q.source === 'word' && !q.routine], ['Perguntas inesperadas (novas)', (q) => q.source === 'new']];
    for (const [title, pred] of groups) {
      view.append(h('h2', { text: title }), h('ul', { class: 'list card' }, Object.values(content.questions).filter(pred).map((q) =>
        h('li', {}, h('a', { class: 'list-btn', href: `#/lab?q=${q.id}` }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: q.q }), h('div', { class: 'small muted', text: q.routine || (q.source === 'new' ? 'conteúdo novo' : 'geral') })), icon('mic'))))));
    }
    return;
  }
  if (cat.id === 'text') {
    view.append(h('p', { class: 'muted', text: 'As dez rotinas completas, para ler, ouvir e recontar.' }), routineList(App));
    return;
  }
  const items = Object.values(content.items).filter((it) => it.c === cat.id).sort((a, b) => a.lvl - b.lvl);
  view.append(h('a', { class: 'btn primary block', href: sessionHref({ category: cat.id }) }, icon('play'), 'Praticar esta categoria'));
  if (cat.id === 'verb') {
    view.append(h('h2', { text: 'Simple Present — 3ª pessoa' }), h('ul', { class: 'list card' }, content.verbs.map((v) => h('li', {},
      h('div', { class: 'list-btn' }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: `${v.base} → ${v.third}` }), h('div', { class: 'small muted', text: v.pt })),
        speakerButton({ key: v.au3, text: v.third }, { cls: 'icon-btn ghost' }))))));
  }
  if (items.length) view.append(h('h2', { text: `Itens (${items.length})` }), itemList(App, items));
  if (cat.id === 'sentence') {
    view.append(h('p', { class: 'small muted', style: { marginTop: '10px' }, text: `Além destes, as ${Object.keys(content.sentences).length} frases das rotinas são praticadas nos exercícios de construção.` }));
  }
}
