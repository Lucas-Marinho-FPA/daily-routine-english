// Sessão de estudo: executa a fila, renderiza cada tipo de exercício, corrige, dá feedback e registra o progresso.
import { h, icon, clear, toast, confirmSheet } from './dom.js';
import { buildSession, cardKey } from '../engine/scheduler.js';
import { makeExercise, maybePairs, makePairs, hint, categoryLabel } from '../engine/exercises.js';
import { recordAnswer, recordLearn, recordSession } from '../engine/progress.js';
import * as player from '../audio/player.js';
import { speakerButton, sourceChip, focusTitle, sessionHref } from './common.js';
import { recWidget } from './recwidget.js';

const OUTCOME = { correct: 'good', accepted_variant: 'good', variant_ame: 'good', spelling: 'ok', grammar: 'bad', meaning: 'bad', inconclusive: 'bad', empty: 'bad' };
const HEAD = {
  correct: ['good', '✓ Correto!'], accepted_variant: ['good', '✓ Aceito'], variant_ame: ['good', '✓ Aceito — grafia americana'],
  spelling: ['mid', '✓ Quase perfeito — erro de digitação'], grammar: ['bad', '✗ Atenção à gramática'], meaning: ['bad', '✗ Não corresponde ao esperado'],
  inconclusive: ['mid', '≈ Diferente do modelo'], empty: ['bad', 'Sem resposta'],
};

export function renderSession(App, { params }) {
  const { content, state } = App;
  const focus = { routine: params.routine, context: params.context, category: params.category, mode: params.mode };
  const size = Math.max(8, Math.min(20, state.settings.dailyGoal || 12));
  let queue;
  const today = App.today();
  if (focus.mode === 'review') {
    queue = Object.values(state.cards).filter((c) => c.due <= today).sort((a, b) => a.box - b.box).slice(0, 20)
      .map((c) => { const [unit, id, skill] = c.k.split(':'); return { k: c.k, unit, id, skill, review: true }; });
  } else if (focus.mode === 'present' && focus.routine) {
    // treino para a aula: contar cada bloco, responder às perguntas e contar a rotina inteira (sem esperar desbloqueio)
    const r = content.routines.find((x) => x.id === focus.routine);
    const qs = [...r.questions, ...(r.priority ? Object.values(content.questions).filter((q) => q.source === 'word' && !q.routine).map((q) => q.id).slice(0, 3) : [])];
    queue = [
      ...r.blocks.map((b) => ({ k: cardKey('block', b, 'tell'), unit: 'block', id: b, skill: 'tell' })),
      ...qs.map((q) => ({ k: cardKey('q', q, 'conv'), unit: 'q', id: q, skill: 'conv' })),
      { k: cardKey('routine', r.id, 'retell'), unit: 'routine', id: r.id, skill: 'retell' },
    ];
  } else if (focus.mode === 'difficult') {
    queue = difficultCards(state).slice(0, 15).map((c) => { const [unit, id, skill] = c.k.split(':'); return { k: c.k, unit, id, skill, review: true }; });
  } else {
    queue = buildSession(content, state.cards, { focus, size, today });
  }
  queue = queue.filter((q) => validEntry(content, q));
  if (focus.mode !== 'present') queue = maybePairs(queue, content);

  const view = App.layout(focusTitle(App, focus), { nav: false, back: null, actions: [] });
  const top = view.previousElementSibling;
  const progress = h('div', { class: 'bar' }, h('i', { style: { width: '0%' } }));
  const closeBtn = h('button', { class: 'icon-btn ghost', 'aria-label': 'Sair da sessão', onclick: () => leave() }, icon('close'));
  clear(top).append(h('div', { class: 'session-top', style: { width: '100%' } }, closeBtn, progress, h('span', { class: 'small muted', id: 'count' })));

  const area = h('div', { class: 'ex-area' });
  const actionbar = h('div', { class: 'actionbar' }, h('div', { class: 'inner' }));
  view.append(area);
  document.getElementById('app').append(actionbar);
  const actions = (...btns) => { clear(actionbar.firstChild).append(...btns.filter(Boolean)); };

  let idx = 0;
  const results = [];
  const requeued = new Set();
  let xpGained = 0;
  const events = [];
  let widget = null;

  if (!queue.length) {
    area.append(h('div', { class: 'card center', style: { marginTop: '24px' } },
      h('div', { style: { fontSize: '2rem' }, text: '🎉' }),
      h('h3', { text: 'Nada pendente por aqui agora' }),
      h('p', { class: 'muted small', text: 'Você está em dia neste foco. Escolha outra rotina ou momento do dia, ou pratique a fala.' })));
    actions(h('a', { class: 'btn', href: '#/explore' }, 'Explorar'), h('a', { class: 'btn primary', href: '#/lab' }, 'Speaking Lab'));
    return () => actionbar.remove();
  }

  async function leave() {
    if (idx > 0 && idx < queue.length) {
      const ok = await confirmSheet('Sair da sessão?', 'As respostas já dadas ficam salvas. Os exercícios restantes voltam numa próxima sessão.', { ok: 'Sair' });
      if (!ok) return;
    }
    App.flush();
    App.go('#/');
  }

  function updateTop() {
    progress.firstChild.style.width = `${Math.round((idx / queue.length) * 100)}%`;
    document.getElementById('count').textContent = `${Math.min(idx + 1, queue.length)}/${queue.length}`;
  }

  function next() {
    if (widget) { widget.destroy(); widget = null; }
    player.stopAll();
    updateTop();
    clear(area);
    window.scrollTo(0, 0);
    if (idx >= queue.length) { App.debugExercise = { type: 'summary' }; return summary(); }
    const entry = queue[idx];
    try {
      if (entry.learn) { App.debugExercise = { type: 'learn', entry }; return renderLearn(entry); }
      const ex = entry.unit === 'pairs' ? makePairs(content, entry) : makeExercise(content, entry);
      App.debugExercise = ex; // somente leitura, usado pelos testes automatizados
      if (ex.type === 'pairs') return renderPairs(ex);
      RENDER[ex.type](ex);
    } catch (e) {
      console.error(e);
      idx++;
      next();
    }
  }

  /** Registra e avança. outcome: good|ok|bad */
  function finish(entry, outcome, info = {}) {
    const r = recordAnswer(state, entry.k, outcome, { ...info, today: App.today() });
    xpGained += r.xp;
    events.push(...r.events);
    results.push({ entry, outcome, cls: info.cls });
    if (outcome === 'bad' && !requeued.has(entry.k)) {
      requeued.add(entry.k);
      const copy = { k: entry.k, unit: entry.unit, id: entry.id, skill: entry.skill, review: true, retry: true };
      queue.splice(Math.min(queue.length, idx + 4), 0, copy);
    }
    App.save();
    return r;
  }

  const kind = (t) => h('div', { class: 'ex-kind', text: t });
  const continueBtn = (fn) => {
    const b = h('button', { class: 'btn primary lg', onclick: () => { idx++; fn && fn(); next(); } }, 'Continuar');
    setTimeout(() => b.focus({ preventScroll: true }), 50);
    return b;
  };
  const autoplay = (clip) => { if (state.settings.autoplay) player.playSoon(clip, 250); }; // cancelado se o exercício mudar antes
  const nextReviewText = (k) => {
    const c = state.cards[k];
    if (!c) return '';
    const days = c.due - App.today();
    return days <= 0 ? 'Volta ainda nesta sessão ou na próxima.' : days === 1 ? 'Próxima revisão: amanhã.' : `Próxima revisão em ${days} dias.`;
  };

  /** Painel de feedback a partir do resultado do corretor. */
  function feedback(res, { model, au, pt, example, tip, k, onClaim, extra } = {}) {
    const [tone, title] = HEAD[res.cls] || ['mid', res.cls];
    const panel = h('div', { class: `feedback ${tone}`, role: 'status', 'aria-live': 'polite' },
      h('div', { class: 'head' }, title, h('span', { class: 'spacer' }), res.xp ? h('span', { class: 'chip ok', text: `+${res.xp} XP` }) : null));
    if (res.cls !== 'correct') {
      panel.append(h('div', { class: 'small muted', style: { marginTop: '6px' }, text: 'Resposta-modelo' }));
      panel.append(h('div', { class: 'row nowrap' }, h('div', { class: 'model', style: { flex: 1 } }, diffModel(res, model)), au || model ? speakerButton({ key: au, text: model }, { cls: 'icon-btn ghost' }) : null));
      if (res.diff && res.diff.extra && res.diff.extra.length && res.cls !== 'meaning') panel.append(h('div', { class: 'small diff' }, 'Você escreveu: ', h('span', { class: 'en' }, ...res.diff.answer.map((t, i) => [i ? ' ' : '', h('span', { class: t.ok ? '' : 'extra', text: t.t })]))));
    } else if (model) {
      panel.append(h('div', { class: 'row nowrap' }, h('div', { class: 'model', style: { flex: 1 }, text: model }), speakerButton({ key: au, text: model }, { cls: 'icon-btn ghost' })));
    }
    if (pt) panel.append(h('div', { class: 'pt small', text: pt }));
    for (const n of res.notes || []) panel.append(h('div', { class: 'small', style: { marginTop: '6px' }, text: n }));
    if (tip) panel.append(h('div', { class: 'small', style: { marginTop: '6px' } }, '💡 ', tip));
    if (example && example.en && example.en !== model) panel.append(h('div', { class: 'small', style: { marginTop: '8px' } }, h('span', { class: 'muted', text: 'Exemplo: ' }), h('span', { class: 'en', text: example.en })));
    if (extra) panel.append(extra);
    if (k) panel.append(h('div', { class: 'tiny muted', style: { marginTop: '8px' }, text: nextReviewText(k) }));
    if (onClaim) {
      const claim = h('button', { class: 'btn small', style: { marginTop: '10px' }, onclick: () => { onClaim(); claim.disabled = true; claim.textContent = 'Registrado: sua resposta foi aceita e ficará como variante pessoal'; } }, 'Eu estava certo');
      panel.append(claim);
    }
    return panel;
  }

  function diffModel(res, model) {
    if (!res.diff || !res.diff.target || res.cls === 'meaning') return document.createTextNode(model || '');
    const missing = new Set(res.diff.missing);
    if (!missing.size) return document.createTextNode(model || '');
    // destaca no texto original as palavras ausentes
    const frag = document.createDocumentFragment();
    model.split(/(\s+)/).forEach((w) => {
      const norm = w.toLowerCase().replace(/[^a-z0-9'à-ÿ:]/g, '');
      frag.append(missing.has(norm) ? h('span', { class: 'miss', text: w }) : document.createTextNode(w));
    });
    return h('span', { class: 'diff' }, frag);
  }

  /** Corrige um texto livre curto e mostra o feedback. */
  function gradeText(entry, value, targets, meta) {
    const res = App.checker.check(value, targets, { itemId: entry.unit === 'item' ? entry.id : entry.k });
    const outcome = OUTCOME[res.cls];
    const r = finish(entry, outcome, { cls: res.cls, answer: value, hintUsed: meta.hintUsed });
    res.xp = r.xp;
    const onClaim = res.cls === 'inconclusive' ? () => claim(entry, value, targets[0]) : null;
    area.append(feedback(res, { ...meta, k: entry.k, onClaim }));
    if (meta.au) autoplay({ key: meta.au, text: meta.model });
    actions(continueBtn());
    return res;
  }

  function claim(entry, value, model) {
    const key = entry.unit === 'item' ? entry.id : entry.k;
    state.userVariants[key] = [...new Set([...(state.userVariants[key] || []), value.trim()])];
    state.pending.push({ key, answer: value.trim(), model, at: Date.now(), status: 'claimed' });
    // corrige o resultado já registrado: vira "ok"
    const last = results[results.length - 1];
    if (last && last.entry.k === entry.k) {
      state.cards[entry.k] = { ...state.cards[entry.k], box: Math.max(1, state.cards[entry.k].box), due: App.today() + 1, lapses: Math.max(0, state.cards[entry.k].lapses - 1), lastResult: 'ok' };
      last.outcome = 'ok';
      const qi = queue.findIndex((q, i) => i > idx && q.retry && q.k === entry.k);
      if (qi > -1) queue.splice(qi, 1);
    }
    App.rebuildChecker();
    App.save();
  }

  // ---------- tipos de exercício ----------
  function renderLearn(entry) {
    const item = content.items[entry.id];
    const ex = item.ex[0];
    area.append(kind('Nova expressão'),
      h('div', { class: 'card' },
        h('div', { class: 'chips' }, h('span', { class: 'chip accent', text: categoryLabel(item.c) }), sourceChip(item.source)),
        h('div', { class: 'row nowrap', style: { marginTop: '8px' } },
          h('div', { style: { flex: 1, minWidth: 0 } }, h('div', { class: 'big-en', text: item.en }), item.ipa ? h('div', { class: 'muted en small', text: item.ipa }) : null),
          speakerButton({ key: item.au, text: item.en })),
        h('p', { style: { fontSize: '1.1rem', marginTop: '6px' }, text: item.pt }),
        item.tip ? h('div', { class: 'notice small' }, '💡 ', item.tip) : null,
        ex ? h('div', { style: { marginTop: '12px' } },
          h('div', { class: 'row nowrap' }, h('div', { class: 'en', style: { flex: 1 }, text: ex.en }), ex.au ? speakerButton({ key: ex.au, text: ex.en }, { cls: 'icon-btn ghost' }) : null),
          ex.pt ? h('div', { class: 'pt small', text: ex.pt }) : null) : null));
    autoplay({ key: item.au, text: item.en });
    actions(h('button', { class: 'btn primary lg', onclick: () => {
      const xp = recordLearn(state, item.id, App.today());
      xpGained += xp;
      // a prática vem um pouco depois (2 posições), para não ser só “repetir o que acabou de ver”
      queue.splice(Math.min(queue.length, idx + 3), 0, { k: entry.k, unit: entry.unit, id: entry.id, skill: entry.skill, afterLearn: true });
      queue.splice(idx, 1);
      next();
    } }, 'Próximo'));
  }

  const RENDER = {
    mc(ex) {
      const { item } = ex;
      area.append(kind('Qual é o significado?'),
        h('div', { class: 'row nowrap ex-prompt' }, h('div', { class: 'big-en', style: { flex: 1 }, text: item.en }), speakerButton({ key: item.au, text: item.en })));
      if (ex.context) {
        area.append(h('p', { class: 'en', style: { fontSize: '1.05rem' } }, ex.context.before, h('span', { class: 'hl', text: ex.context.target }), ex.context.after),
          h('p', { class: 'small muted', text: 'O que significa a parte destacada nesta frase?' }));
      }
      const opts = h('div', { class: 'options' });
      ex.options.forEach((o) => {
        const b = h('button', { class: 'option', text: o.pt });
        b.addEventListener('click', () => {
          opts.querySelectorAll('button').forEach((x) => { x.disabled = true; });
          const right = [...opts.children][ex.options.findIndex((x) => x.correct)];
          right.classList.add('right');
          if (!o.correct) b.classList.add('wrong');
          const res = { cls: o.correct ? 'correct' : 'meaning', notes: o.correct ? [] : [`“${item.en}” = ${item.pt}`] };
          const r = finish(ex.entry, o.correct ? 'good' : 'bad', { cls: res.cls, answer: o.pt });
          res.xp = r.xp;
          area.append(feedback(res, { model: o.correct ? null : item.en, au: item.au, example: item.ex[0], tip: o.correct ? null : item.tip, k: ex.entry.k }));
          actions(continueBtn());
        });
        opts.append(b);
      });
      area.append(opts);
      autoplay({ key: item.au, text: item.en });
      actions(h('button', { class: 'btn ghost', onclick: () => {
        opts.querySelectorAll('button').forEach((x) => { x.disabled = true; });
        [...opts.children][ex.options.findIndex((x) => x.correct)].classList.add('right');
        const r = finish(ex.entry, 'bad', { cls: 'empty' });
        area.append(feedback({ cls: 'empty', notes: [`“${item.en}” = ${item.pt}`], xp: r.xp }, { model: item.en, au: item.au, example: item.ex[0], tip: item.tip, k: ex.entry.k }));
        actions(continueBtn());
      } }, 'Não sei'));
    },

    recall(ex) {
      const { item } = ex;
      let level = 0;
      const hintEl = h('div', { class: 'en muted', style: { minHeight: '1.6em', marginTop: '8px', letterSpacing: '.04em' } });
      const input = textInput('Digite em inglês');
      area.append(kind('Como se diz em inglês?'),
        h('div', { style: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 }, text: item.pt }),
        h('div', { class: 'chips', style: { margin: '8px 0' } }, h('span', { class: 'chip', text: ex.label })),
        ex.cue ? h('p', { class: 'small muted' }, 'Na rotina: ', h('i', { text: ex.cue })) : null,
        input, hintEl);
      const verify = h('button', { class: 'btn primary lg', disabled: true }, 'Verificar');
      const hintBtn = h('button', { class: 'btn', 'aria-label': 'Dica' }, icon('bulb'), 'Dica');
      input.addEventListener('input', () => { verify.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) verify.click(); });
      hintBtn.onclick = () => { level = Math.min(2, level + 1); hintEl.textContent = hint(item.en.replace(/…$/, ''), level); if (level >= 2) hintBtn.disabled = true; input.focus(); };
      verify.onclick = () => {
        input.disabled = true;
        gradeText(ex.entry, input.value, ex.targets, { hintUsed: level > 0, model: item.en, au: item.au, pt: item.pt, example: item.ex[0], tip: item.tip });
      };
      const giveUp = h('button', { class: 'btn ghost' }, 'Não sei');
      giveUp.onclick = () => { input.disabled = true; gradeText(ex.entry, '', ex.targets, { model: item.en, au: item.au, pt: item.pt, example: item.ex[0], tip: item.tip }); };
      actions(giveUp, hintBtn, verify);
      setTimeout(() => input.focus(), 80);
    },

    cloze(ex) {
      const { item, sentence } = ex;
      const input = h('input', { type: 'text', class: 'en', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', autocorrect: 'off', 'aria-label': 'Palavras que faltam', style: { width: `${Math.max(6, ex.target.length + 2)}ch` } });
      area.append(kind('Complete a frase'),
        h('p', { class: 'pt', text: sentence.pt }),
        h('p', { class: 'cloze' }, ex.before, input, ex.after),
        h('p', { class: 'small muted' }, 'Dica de sentido: ', h('b', { text: item.pt })));
      const verify = h('button', { class: 'btn primary lg', disabled: true }, 'Verificar');
      input.addEventListener('input', () => { verify.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) verify.click(); });
      verify.onclick = () => {
        input.disabled = true;
        gradeText(ex.entry, input.value, ex.targets, { model: sentence.en, au: sentence.au, pt: null, tip: item.tip });
      };
      const giveUp = h('button', { class: 'btn ghost' }, 'Não sei');
      giveUp.onclick = () => { input.disabled = true; gradeText(ex.entry, '', ex.targets, { model: sentence.en, au: sentence.au }); };
      actions(giveUp, verify);
      setTimeout(() => input.focus(), 80);
    },

    order(ex) {
      const { sentence } = ex;
      const built = [];
      const answer = h('div', { class: 'tiles answer', 'aria-label': 'Sua frase' });
      const pool = h('div', { class: 'tiles', 'aria-label': 'Peças disponíveis' });
      let hintUsed = false;
      const verify = h('button', { class: 'btn primary lg', disabled: true }, 'Verificar');
      const draw = () => {
        clear(answer).append(...built.map((i, pos) => h('button', { class: 'tile', onclick: () => { built.splice(pos, 1); draw(); } }, ex.shuffled[i])));
        clear(pool).append(...ex.shuffled.map((p, i) => h('button', { class: `tile${built.includes(i) ? ' used' : ''}`, 'aria-hidden': built.includes(i) ? 'true' : null, onclick: () => { if (!built.includes(i)) { built.push(i); draw(); } } }, p)));
        verify.disabled = built.length !== ex.shuffled.length;
      };
      area.append(kind('Monte a frase em inglês'), h('p', { style: { fontSize: '1.1rem' }, text: sentence.pt }), answer, h('div', { style: { height: '10px' } }), pool);
      draw();
      const listen = h('button', { class: 'btn', onclick: () => { hintUsed = true; player.play({ key: sentence.au, text: sentence.en }); } }, icon('speaker'), 'Ouvir');
      verify.onclick = () => {
        const attempt = built.map((i) => ex.shuffled[i]).join(' ');
        const ok = attempt === ex.pieces.join(' ');
        const res = { cls: ok ? 'correct' : 'meaning', notes: ok ? [] : ['A ordem está diferente do modelo.'] };
        const r = finish(ex.entry, ok ? 'good' : 'bad', { cls: res.cls, answer: attempt, hintUsed });
        res.xp = r.xp;
        answer.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        pool.remove();
        area.append(feedback(res, { model: sentence.en, au: sentence.au, k: ex.entry.k }));
        autoplay({ key: sentence.au, text: sentence.en });
        actions(continueBtn());
      };
      actions(listen, verify);
    },

    write(ex) {
      const { sentence } = ex;
      let level = 0;
      const input = h('textarea', { class: 'field en', rows: 3, autocomplete: 'off', autocapitalize: 'sentences', spellcheck: 'false', 'aria-label': 'Sua frase em inglês', placeholder: 'Escreva em inglês' });
      const hints = h('div', { class: 'small', style: { marginTop: '8px' } });
      area.append(kind('Escreva em inglês'), h('p', { style: { fontSize: '1.15rem' }, text: sentence.pt }), input, hints);
      const verify = h('button', { class: 'btn primary lg', disabled: true }, 'Verificar');
      const hintBtn = h('button', { class: 'btn' }, icon('bulb'), 'Dica');
      input.addEventListener('input', () => { verify.disabled = !input.value.trim(); });
      hintBtn.onclick = () => {
        level++;
        if (level === 1) clear(hints).append(h('div', { class: 'muted', text: 'Expressões que ajudam:' }), h('div', { class: 'chips' }, ex.hints.map((x) => h('span', { class: 'chip accent', text: `${x.en} = ${x.pt}` }))));
        if (level >= 2) { hints.append(h('div', { class: 'en muted', style: { marginTop: '6px' }, text: hint(sentence.en, 1) })); hintBtn.disabled = true; }
      };
      verify.onclick = () => {
        input.disabled = true;
        gradeText(ex.entry, input.value, ex.targets, { hintUsed: level > 0, model: sentence.en, au: sentence.au });
      };
      const giveUp = h('button', { class: 'btn ghost' }, 'Não sei');
      giveUp.onclick = () => { input.disabled = true; gradeText(ex.entry, '', ex.targets, { model: sentence.en, au: sentence.au }); };
      actions(giveUp, hintBtn, verify);
      setTimeout(() => input.focus(), 80);
    },

    seq(ex) {
      const picked = [];
      const list = h('div', {});
      const verify = h('button', { class: 'btn primary lg', disabled: true }, 'Verificar');
      const draw = () => {
        clear(list).append(...ex.shuffled.map((s) => {
          const pos = picked.indexOf(s.id);
          return h('button', { class: `seq-item${pos > -1 ? ' picked' : ''}`, onclick: () => { if (pos > -1) picked.splice(pos, 1); else picked.push(s.id); draw(); } },
            h('span', { class: 'num', text: pos > -1 ? String(pos + 1) : '' }), h('span', { text: s.en }));
        }));
        verify.disabled = picked.length !== ex.shuffled.length;
      };
      const routine = content.routines.find((r) => r.id === ex.block.routine);
      area.append(kind('Ordene as frases do bloco'), h('p', { class: 'small muted', text: `${routine.id} · ${routine.pt} · bloco ${ex.block.index}. Toque na ordem em que acontecem.` }), list);
      draw();
      verify.onclick = () => {
        const ok = picked.every((id, i) => id === ex.sentences[i].id);
        const res = { cls: ok ? 'correct' : 'meaning', notes: ok ? [] : ['Veja a ordem cronológica abaixo.'] };
        const r = finish(ex.entry, ok ? 'good' : 'bad', { cls: res.cls });
        res.xp = r.xp;
        list.querySelectorAll('button').forEach((b) => { b.disabled = true; });
        area.append(feedback(res, { model: ok ? null : ex.sentences.map((s, i) => `${i + 1}. ${s.en}`).join('\n'), k: ex.entry.k }));
        actions(continueBtn());
      };
      actions(verify);
    },

    tell(ex) { renderProduce(ex, 'block'); },
    retell(ex) { renderProduce(ex, 'routine'); },
    conv(ex) { renderProduce(ex, 'q'); },

    vb3(ex) {
      const v = ex.verb;
      const input = textInput('Forma da 3ª pessoa');
      area.append(kind('Simple Present — 3ª pessoa'),
        h('p', { class: 'small muted', text: 'Exercício de gramática (não é uma informação sobre a sua rotina).' }),
        h('div', { class: 'big-en' }, `I ${v.base} → He `, h('span', { class: 'hl', text: '___' })),
        h('p', { class: 'pt', text: v.pt }), input);
      const verify = h('button', { class: 'btn primary lg', disabled: true }, 'Verificar');
      input.addEventListener('input', () => { verify.disabled = !input.value.trim(); });
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) verify.click(); });
      verify.onclick = () => {
        input.disabled = true;
        gradeText(ex.entry, input.value.replace(/^\s*he\s+/i, ''), ex.targets, { model: v.third, au: v.au3, example: v.ex[0],
          tip: 'Na 3ª pessoa (he, she, it, my wife, the laptop) o verbo ganha -s/-es: goes, does, watches, studies, has.' });
      };
      actions(verify);
      setTimeout(() => input.focus(), 80);
    },
  };

  function textInput(label) {
    return h('input', { type: 'text', class: 'field en', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false', enterkeyhint: 'done', 'aria-label': label, placeholder: label });
  }

  /** Bloco, rotina e conversação: produção livre (escrita e/ou fala), modelo depois, autoavaliação. */
  function renderProduce(ex, unit) {
    const isQ = unit === 'q';
    let model, modelClips, title, intro, items, targetId, keywords = [];
    if (unit === 'block') {
      const r = ex.routine;
      title = 'Conte este bloco do dia';
      intro = `${r.id} · ${r.pt} · bloco ${ex.block.index} (${ex.block.ctx.map((c) => content.contexts.find((x) => x.id === c).pt).join(', ')})`;
      model = ex.block.en; modelClips = ex.sentences.map((s) => ({ key: s.au, text: s.en })); items = ex.items; targetId = `block:${ex.block.id}`;
    } else if (unit === 'routine') {
      title = 'Conte a rotina completa';
      intro = `${ex.routine.id} · ${ex.routine.pt}. Use as pistas de cada bloco. Fale com suas palavras — não precisa recitar.`;
      model = ex.routine.blocks.map((b) => content.blocks[b].en).join('\n\n');
      modelClips = ex.routine.blocks.flatMap((b) => content.blocks[b].sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })));
      items = ex.items; targetId = `routine:${ex.routine.id}`;
    } else {
      const q = ex.q;
      title = 'Pergunta da teacher';
      intro = q.routine ? `Sobre a ${q.routine}` : q.source === 'new' ? 'Pergunta inesperada (conteúdo novo)' : 'Pergunta geral';
      model = q.a; modelClips = q.a ? [{ key: q.aau, text: q.a }] : []; keywords = q.keywords; targetId = `q:${q.id}`;
      items = dedupeCues(ex.items, keywords);
    }
    area.append(kind(title), h('p', { class: 'small muted', text: intro }));
    if (isQ) {
      area.append(h('div', { class: 'row nowrap' }, h('div', { class: 'big-en', style: { flex: 1 }, text: ex.q.q }), speakerButton({ key: ex.q.au, text: ex.q.q })));
      if (ex.q.hint) area.append(h('div', { class: 'notice small', text: ex.q.hint }));
      autoplay({ key: ex.q.au, text: ex.q.q });
    } else if (unit === 'block') {
      area.append(h('div', { class: 'small muted', text: 'Pistas (expressões do bloco):' }), h('div', { class: 'chips', style: { margin: '6px 0 10px' } }, items.map((it) => h('span', { class: 'chip accent', text: it.en }))));
      const ptBox = h('p', { class: 'para-pt hidden', text: ex.block.pt });
      area.append(h('button', { class: 'btn small', onclick: (e) => { ptBox.classList.toggle('hidden'); e.currentTarget.textContent = ptBox.classList.contains('hidden') ? 'Ver o bloco em português (apoio)' : 'Ocultar português'; } }, 'Ver o bloco em português (apoio)'), ptBox);
    } else {
      area.append(h('div', { class: 'card flat' }, ...ex.blocks.map((b) => h('div', { style: { marginBottom: '8px' } },
        h('div', { class: 'small', style: { fontWeight: 700 }, text: `${b.block.index}. ${b.block.ctx.map((c) => content.contexts.find((x) => x.id === c).pt).join(' · ')}` }),
        h('div', { class: 'chips' }, b.items.map((it) => h('span', { class: 'chip', text: it.en })))))));
    }
    const input = h('textarea', { class: 'field en', rows: unit === 'routine' ? 6 : 4, spellcheck: 'false', autocapitalize: 'sentences', placeholder: 'Escreva sua resposta (opcional se você gravar)', 'aria-label': 'Sua resposta' });
    if (isQ && state.myAnswers[ex.q.id]) input.value = state.myAnswers[ex.q.id].text;
    area.append(h('label', { class: 'lbl', style: { marginTop: '12px' }, text: 'Fale e/ou escreva' }));
    widget = recWidget(App, { targetId, reference: modelClips, expectedWords: model ? model.split(/\s+/).length : 0, maxMs: unit === 'routine' ? 300000 : 120000 });
    area.append(widget.el, h('div', { style: { height: '10px' } }), input);

    const reveal = h('button', { class: 'btn primary lg' }, 'Ver modelo e avaliar');
    reveal.onclick = () => {
      if (widget) widget.stop();
      reveal.disabled = true;
      const text = input.value.trim();
      const cov = text ? App.checker.coverage(text, { keywords, items }) : null;
      const panel = h('div', { class: 'feedback' });
      if (model) {
        panel.append(h('div', { class: 'row nowrap' }, h('div', { class: 'small muted', style: { flex: 1 }, text: 'Modelo (uma forma possível — não precisa ser igual)' }),
          h('button', { class: 'icon-btn ghost', 'aria-label': 'Ouvir modelo', onclick: () => player.playSequence(modelClips) }, icon('speaker'))));
        model.split('\n\n').forEach((p) => panel.append(h('p', { class: 'model', style: { whiteSpace: 'pre-line' }, text: p })));
      }
      if (isQ && ex.q.altAnswers) panel.append(h('div', { class: 'small' }, h('b', { text: 'Alternativa natural: ' }), h('span', { class: 'en', text: ex.q.altAnswers[0] })), ex.q.reviewNote ? h('div', { class: 'small muted', text: ex.q.reviewNote }) : null);
      if (cov) {
        const list = h('ul', { class: 'cover-list small' });
        cov.keywords.forEach((k) => list.append(h('li', {}, k.ok ? '✅' : '⬜', ' ', h('span', { class: 'en', text: k.group.join(' / ') }))));
        cov.items.forEach((k) => list.append(h('li', {}, k.ok ? '✅' : '⬜', ' ', h('span', { class: 'en', text: k.en }))));
        panel.append(h('div', { class: 'small', style: { marginTop: '8px', fontWeight: 700 }, text: `Você usou ${Math.round(cov.ratio * 100)}% das ideias/expressões-chave:` }), list);
        cov.grammar.forEach((g) => panel.append(h('div', { class: 'small', text: '⚠️ ' + g.msg })));
      } else {
        panel.append(h('p', { class: 'small muted', text: 'Compare sua gravação com o modelo (botão A/B acima) e avalie com honestidade.' }));
      }
      if (isQ) {
        const mine = h('textarea', { class: 'field en', rows: 3, placeholder: 'Minha versão (a sua resposta real, para a aula)' });
        mine.value = state.myAnswers[ex.q.id] ? state.myAnswers[ex.q.id].text : text;
        panel.append(h('label', { class: 'lbl', style: { marginTop: '12px' }, text: 'Minha versão (fica salva só no aparelho)' }), mine,
          h('button', { class: 'btn small', style: { marginTop: '8px' }, onclick: () => { if (mine.value.trim()) { state.myAnswers[ex.q.id] = { text: mine.value.trim(), at: Date.now() }; App.save(); toast('Minha versão salva'); } } }, 'Salvar minha versão'));
      }
      const suggestion = cov ? (cov.ratio >= 0.7 ? 'good' : cov.ratio >= 0.4 ? 'ok' : 'bad') : null;
      const gradeRow = h('div', { class: 'stack', style: { marginTop: '14px' } },
        h('div', { class: 'small', style: { fontWeight: 700 }, text: 'Como foi?' + (suggestion ? ` (sugestão pela cobertura: ${{ good: 'Consegui', ok: 'Parcial', bad: 'Preciso rever' }[suggestion]})` : '') }),
        h('div', { class: 'row' }, [['bad', 'Preciso rever'], ['ok', 'Parcial'], ['good', 'Consegui']].map(([o, label]) =>
          h('button', { class: `btn${o === suggestion ? ' primary' : ''}`, style: { flex: 1 }, onclick: () => {
            const r = finish(ex.entry, o, { cls: 'self-' + o, answer: text });
            if (isQ && text && !state.myAnswers[ex.q.id]) { state.myAnswers[ex.q.id] = { text, at: Date.now() }; App.save(); }
            if (r.xp) toast(`+${r.xp} XP`);
            idx++; next();
          } }, label))));
      panel.append(gradeRow);
      area.append(panel);
      actions();
      panel.scrollIntoView({ behavior: state.settings.reduceMotion ? 'auto' : 'smooth', block: 'start' });
    };
    actions(reveal);
  }

  function renderPairs(ex) {
    const keyOf = (it) => cardKey('item', it.id, 'rec');
    const errors = new Set();
    const done = new Set();
    let sel = null;
    const left = h('div', { class: 'stack' });
    const right = h('div', { class: 'stack' });
    const draw = () => {
      clear(left).append(...ex.left.map((it) => h('button', { class: `option en${sel === it.id ? ' sel' : ''}${done.has(it.id) ? ' done' : ''}`, disabled: done.has(it.id), onclick: () => { sel = it.id; draw(); } }, it.en)));
      clear(right).append(...ex.right.map((it) => h('button', { class: `option${done.has(it.id) ? ' done' : ''}`, disabled: done.has(it.id), onclick: (e) => pick(it, e.currentTarget) }, it.pt)));
    };
    const pick = (it, btn) => {
      if (!sel) return;
      if (sel === it.id) { done.add(it.id); sel = null; draw(); if (done.size === ex.items.length) complete(); }
      else { errors.add(sel); btn.classList.add('wrong'); setTimeout(() => btn.classList.remove('wrong'), 600); }
    };
    area.append(kind('Associe inglês e português'), h('p', { class: 'small muted', text: 'Toque numa expressão e depois no significado.' }), h('div', { class: 'pairs' }, left, right));
    draw();
    function complete() {
      let gained = 0;
      for (const it of ex.items) gained += finish({ k: keyOf(it), unit: 'item', id: it.id, skill: 'rec' }, errors.has(it.id) ? 'bad' : 'good', { cls: errors.has(it.id) ? 'meaning' : 'correct' }).xp;
      area.append(feedback({ cls: errors.size ? 'inconclusive' : 'correct', xp: gained, notes: errors.size ? [`Revise: ${[...errors].map((id) => content.items[id].en).join(', ')}`] : [] }, {}));
      actions(continueBtn());
    }
    actions();
  }

  function summary() {
    const good = results.filter((r) => r.outcome !== 'bad').length;
    const bad = results.filter((r) => r.outcome === 'bad');
    const sr = recordSession(state, { count: results.length, bad: bad.length }, App.today());
    xpGained += sr.xp;
    events.push(...sr.events);
    App.flush();
    progress.firstChild.style.width = '100%';
    const wrongUnits = [...new Map(bad.map((r) => [r.entry.k, r.entry])).values()];
    area.append(h('div', { class: 'card center', style: { marginTop: '16px' } },
      h('div', { style: { fontSize: '2.2rem' }, text: bad.length ? '💪' : '🌟' }),
      h('h3', { text: 'Sessão concluída' }),
      h('div', { class: 'stat-grid', style: { marginTop: '12px' } },
        h('div', { class: 'stat' }, h('b', { text: `+${xpGained}` }), h('span', { text: 'XP' })),
        h('div', { class: 'stat' }, h('b', { text: `${results.length ? Math.round((good / results.length) * 100) : 0}%` }), h('span', { text: 'acertos' })),
        h('div', { class: 'stat' }, h('b', { text: String(results.length) }), h('span', { text: 'exercícios' })))),
      events.length ? h('div', { class: 'card' }, h('h3', { text: 'Conquistas' }), ...events.map((a) => h('div', { class: 'row' }, h('span', { style: { fontSize: '1.4rem' }, text: a.icon }), h('div', {}, h('b', { text: a.title }), h('div', { class: 'small muted', text: a.desc }))))) : null,
      wrongUnits.length ? h('div', { class: 'card' }, h('h3', { text: 'Vai voltar para revisão' }),
        ...wrongUnits.map((e) => h('div', { class: 'small en', text: '• ' + unitLabel(content, e) }))) : null);
    if (events.length) toast(`Conquista: ${events[0].title}`);
    actions(h('a', { class: 'btn', href: '#/' }, 'Início'), h('button', { class: 'btn primary', onclick: () => App.go(sessionHref(focus.mode ? {} : focus)) }, 'Nova sessão'));
  }

  next();
  return () => { player.stopAll(); if (widget) widget.destroy(); actionbar.remove(); App.flush(); };
}

/** Remove pistas redundantes (contidas em outra pista ou já cobertas pelas palavras-chave). */
function dedupeCues(items, keywords) {
  const norm = (t) => t.toLowerCase().replace(/[…."]/g, '').replace(/^i /, '').trim();
  const kw = keywords.flat().map((k) => norm(String(k)));
  const kept = [];
  for (const it of [...items].sort((a, b) => b.en.length - a.en.length)) {
    const n = norm(it.en);
    if (kw.some((k) => k.includes(n) || n.includes(k) && k.length > 3)) continue;
    if (kept.some((x) => norm(x.en).includes(n))) continue;
    kept.push(it);
  }
  return kept;
}

function validEntry(content, q) {
  if (q.unit === 'pairs') return true;
  if (q.unit === 'item') return !!content.items[q.id];
  if (q.unit === 'sent') return !!content.sentences[q.id];
  if (q.unit === 'block') return !!content.blocks[q.id];
  if (q.unit === 'routine') return content.routines.some((r) => r.id === q.id);
  if (q.unit === 'q') return !!content.questions[q.id];
  if (q.unit === 'verb') return content.verbs.some((v) => v.id === q.id);
  return false;
}

export function unitLabel(content, e) {
  if (e.unit === 'item') return `${content.items[e.id].en} — ${content.items[e.id].pt}`;
  if (e.unit === 'sent') return content.sentences[e.id].en;
  if (e.unit === 'block') return `Bloco ${content.blocks[e.id].index} da ${content.blocks[e.id].routine}`;
  if (e.unit === 'routine') return `Rotina ${e.id}`;
  if (e.unit === 'q') return content.questions[e.id].q;
  if (e.unit === 'verb') { const v = content.verbs.find((x) => x.id === e.id); return `${v.base} → ${v.third}`; }
  return e.k;
}

export function difficultCards(state) {
  return Object.values(state.cards).filter((c) => c.lapses >= 2 || (c.lastResult === 'bad' && c.lapses >= 1))
    .sort((a, b) => b.lapses - a.lapses || a.box - b.box);
}

