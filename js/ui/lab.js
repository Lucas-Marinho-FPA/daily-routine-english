// Speaking Lab: ouvir a referência, gravar, comparar A/B, métricas de ritmo e (se houver) reconhecimento local.
import { h, icon, clear, toast } from './dom.js';
import * as player from '../audio/player.js';
import * as asr from '../audio/asr.js';
import { wordTokens } from '../engine/text.js';
import { recWidget } from './recwidget.js';
import { inlineWords, legend, scoreLine } from './inlinewords.js';
import { evaluateWords, scoreAttempt } from '../engine/wordfeedback.js';
import { speakerButton, sessionHref } from './common.js';

let labTab = 'sentences';
let labRoutine = 'R01';

export function renderLab(App, { params }) {
  if (params.q || params.block || params.routine && params.full || params.sentence || params.drill) return renderTarget(App, params);
  if (params.routine) labRoutine = params.routine;
  const { content, state } = App;
  const view = App.layout('Speaking Lab');
  view.append(h('p', { class: 'small muted', text: 'Ouça, grave sua voz e compare. As métricas medem ritmo e pausas; a pronúncia dos sons você avalia comparando com a referência.' }));
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Tipo de prática' });
  const filter = h('div', { class: 'chips scroll', style: { margin: '12px 0' } });
  const body = h('div', {});
  const tabs = [['sentences', 'Frases'], ['blocks', 'Blocos'], ['questions', 'Perguntas'], ['drills', 'Drills']];
  const rec = (id) => state.recordingsMeta[id] ? h('span', { class: 'chip ok', text: 'gravado' }) : null;

  const draw = () => {
    clear(seg).append(...tabs.map(([id, label]) => h('button', { 'aria-pressed': String(labTab === id), onclick: () => { labTab = id; draw(); } }, label)));
    clear(filter);
    if (labTab === 'sentences' || labTab === 'blocks') {
      filter.append(...content.routines.map((r) => h('button', { class: 'chip', 'aria-pressed': String(labRoutine === r.id), onclick: () => { labRoutine = r.id; draw(); } }, r.id)));
    }
    clear(body);
    const r = content.routines.find((x) => x.id === labRoutine);
    if (labTab === 'sentences') {
      body.append(h('ul', { class: 'list card' }, r.blocks.flatMap((b) => content.blocks[b].sentences).map((sid) => {
        const s = content.sentences[sid];
        return h('li', {}, h('a', { class: 'list-btn', href: `#/lab?sentence=${sid}` }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: s.en })), rec(`sent:${sid}`), icon('mic')));
      })));
    }
    if (labTab === 'blocks') {
      body.append(...r.blocks.map((bid) => {
        const b = content.blocks[bid];
        return h('a', { class: 'card link', href: `#/lab?block=${bid}` },
          h('div', { class: 'row' }, h('span', { class: 'chip', text: `Bloco ${b.index}` }), ...b.ctx.map((c) => h('span', { class: 'chip', text: content.contexts.find((x) => x.id === c).pt })), h('span', { class: 'spacer' }), rec(`block:${bid}`)),
          h('p', { class: 'en small', style: { marginTop: '8px' }, text: b.en.slice(0, 140) + (b.en.length > 140 ? '…' : '') }));
      }), h('a', { class: 'btn block', href: `#/lab?routine=${r.id}&full=1` }, icon('mic'), `Gravar a ${r.id} completa`));
    }
    if (labTab === 'questions') {
      const groups = [['Rotina 1 (prioritária)', (q) => q.routine === 'R01'], ['Gerais (Word)', (q) => q.source === 'word' && !q.routine], ['Outras rotinas', (q) => q.routine && q.routine !== 'R01'], ['Inesperadas (novas)', (q) => q.source === 'new']];
      for (const [title, pred] of groups) {
        body.append(h('h2', { text: title }), h('ul', { class: 'list card' }, Object.values(content.questions).filter(pred).map((q) =>
          h('li', {}, h('a', { class: 'list-btn', href: `#/lab?q=${q.id}` }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: q.q }), q.routine ? h('div', { class: 'small muted', text: q.routine }) : null), rec(`q:${q.id}`), icon('mic'))))));
      }
    }
    if (labTab === 'drills') {
      body.append(...content.drills.map((d, i) => h('a', { class: 'card link', href: `#/lab?drill=${i}` },
        h('div', { class: 'row' }, h('h3', { style: { margin: 0, flex: 1 }, text: d.title }), rec(`drill:${i}`)),
        h('p', { class: 'small muted', text: d.prompts.slice(0, 2).join(' · ') + '…' }))));
    }
  };
  draw();
  view.append(seg, filter, body);
}

function renderTarget(App, params) {
  const { content, state } = App;
  let title, en = [], pt = '', clips = [], targetId, extra = null, back = '#/lab';
  if (params.sentence) {
    const s = content.sentences[params.sentence];
    title = `Frase · ${s.routine}`; en = [s.en]; pt = s.pt; clips = [{ key: s.au, text: s.en }]; targetId = `sent:${s.id}`;
  } else if (params.block) {
    const b = content.blocks[params.block];
    title = `${b.routine} · bloco ${b.index}`; en = [b.en]; pt = b.pt; // o bloco é um parágrafo corrido
    clips = b.sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en })); targetId = `block:${b.id}`;
  } else if (params.routine) {
    const r = content.routines.find((x) => x.id === params.routine);
    title = `${r.id} completa`; en = r.blocks.map((b) => content.blocks[b].en); pt = r.blocks.map((b) => content.blocks[b].pt).join('\n\n');
    clips = r.blocks.flatMap((b) => content.blocks[b].sentences.map((sid) => ({ key: content.sentences[sid].au, text: content.sentences[sid].en }))); targetId = `routine:${r.id}`;
    extra = h('div', { class: 'notice small' }, 'Dica: grave primeiro olhando o texto; depois tente só com as pistas, como no exercício “Conte a rotina”. Não precisa recitar.');
  } else if (params.q) {
    const q = content.questions[params.q];
    title = 'Pergunta da teacher'; targetId = `q:${q.id}`;
    en = q.a ? [q.a] : []; clips = q.a ? [{ key: q.aau, text: q.a }] : [];
    extra = h('div', {},
      h('div', { class: 'row nowrap' }, h('div', { class: 'big-en', style: { flex: 1 }, text: q.q }), speakerButton({ key: q.au, text: q.q })),
      q.hint ? h('div', { class: 'notice small', text: q.hint }) : null,
      h('p', { class: 'small muted', text: 'Responda em voz alta antes de olhar o modelo.' }),
      state.myAnswers[q.id] ? h('div', { class: 'card flat' }, h('div', { class: 'small muted', text: 'Minha versão' }), h('div', { class: 'en', text: state.myAnswers[q.id].text })) : null,
      h('a', { class: 'btn small', href: sessionHref({ category: 'qa' }), style: { marginTop: '8px' } }, 'Praticar perguntas com correção'));
  } else if (params.drill !== undefined) {
    const d = content.drills[Number(params.drill)];
    title = d.title; targetId = `drill:${params.drill}`;
    extra = h('div', {},
      h('ul', { class: 'small', style: { paddingLeft: '18px' } }, d.prompts.map((p, i) => h('li', { style: { marginBottom: '6px' } }, h('span', { class: 'en', text: p }), ' ', d.au && d.au[i] ? speakerButton({ key: d.au[i], text: p }, { cls: 'icon-btn ghost' }) : null))),
      Number(params.drill) === 0 ? h('div', { class: 'notice small', text: 'Fale de 30 a 45 segundos sem ler. O tempo aparece durante a gravação.' }) : null);
  }
  const view = App.layout(title, { back });
  if (extra) view.append(extra);

  // texto-alvo com feedback inline (mesmo fluxo de leitura; cores só depois de uma avaliação)
  const iw = en.length ? inlineWords(en) : null;
  const legendEl = legend();
  legendEl.classList.add('hidden');
  const scoreBox = h('div', {});
  const statusLine = h('div', { class: 'tiny muted' });
  const showEvaluation = (evaluation, score) => {
    iw.apply(evaluation);
    legendEl.classList.remove('hidden');
    statusLine.textContent = evaluation.note || '';
    clear(scoreBox).append(scoreLine(score));
  };
  if (en.length) {
    let showPt = false;
    const textBox = h('div', { class: 'card', style: { marginTop: '10px' } });
    const draw = () => {
      clear(textBox).append(
        h('div', { class: 'row nowrap' }, h('div', { class: 'small muted', style: { flex: 1 }, text: params.q ? 'Resposta-modelo' : 'Texto' }),
          h('button', { class: 'btn small', onclick: () => { showPt = !showPt; draw(); } }, showPt ? 'Ocultar PT' : 'Ver PT')),
        iw.el, legendEl, statusLine, iw.detail, scoreBox,
        showPt && pt ? h('p', { class: 'para-pt', style: { whiteSpace: 'pre-line' }, text: pt }) : null);
    };
    draw();
    const rates = [0.75, 1, 1.25];
    let rate = state.settings.rate || 1;
    const rateRow = h('div', { class: 'chips' });
    const drawRates = () => clear(rateRow).append(...rates.map((r) => h('button', { class: 'chip', 'aria-pressed': String(r === rate), onclick: () => { rate = r; drawRates(); } }, `${r}×`)));
    drawRates();
    view.append(textBox, h('div', { class: 'row', style: { marginTop: '10px' } },
      h('button', { class: 'btn primary', onclick: () => player.playSequence(clips, { rate }) }, icon('speaker'), 'Ouvir referência'),
      h('button', { class: 'btn', onclick: () => player.stopAll() }, icon('stop'), 'Parar'), rateRow));
  }

  const durations = (globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.files) || {};
  const referenceSec = clips.reduce((n, c) => n + (durations[c.key] || 0), 0);
  const expectedWords = en.join(' ').split(/\s+/).filter(Boolean).length;
  view.append(h('h2', { text: 'Sua gravação' }));
  // avaliação automática só quando o aluno está LENDO o texto (frase, bloco, rotina); perguntas são respondidas livremente
  const reading = !!iw && !params.q;
  const asrEligible = expectedWords <= 60;
  let listener = null;
  // o aluno já confirmou antes que o reconhecimento existe: consulta de novo automaticamente
  const autoStatus = state.settings.asrKnown === 'available' && !asr.cachedStatus() ? asr.status() : null;
  const w = recWidget(App, {
    targetId, reference: clips, expectedWords, referenceSec, maxMs: params.routine ? 300000 : 120000,
    onStart: () => {
      if (!reading) return;
      iw.reset(); legendEl.classList.add('hidden'); clear(scoreBox); statusLine.textContent = '';
      listener = asrEligible && asr.cachedStatus() === 'available' ? asr.listen({ lang: 'en-GB' }) : null;
    },
    onRecorded: async (blob, analysis) => {
      if (!reading) return;
      statusLine.textContent = 'Analisando…';
      const insufficient = !analysis || analysis.silent || analysis.speechSec < 0.4;
      const res = listener ? await listener.stop() : null;
      let evaluation = evaluateWords(iw.text, res, { insufficient });
      if (!res && !insufficient) {
        const why = !asrEligible ? 'Texto longo: avaliação por palavra só para trechos de até 60 palavras (grave um bloco).'
          : listener ? 'O reconhecimento não conseguiu rodar junto com a gravação neste aparelho. Use “Verificar palavras”.'
          : asr.cachedStatus() ? 'Reconhecimento de fala no aparelho indisponível: palavras não avaliadas.'
          : 'Para avaliar palavra por palavra, toque em “Ver se está disponível” abaixo (uma vez).';
        evaluation = { ...evaluation, note: why };
      }
      listener = null;
      showEvaluation(evaluation, scoreAttempt({ evaluation, analysis, expectedWords }));
    },
  });
  view.append(w.el);

  // reconhecimento no aparelho (opcional)
  if (en.length && expectedWords <= 60) {
    const asrBox = h('div', { class: 'card flat', style: { marginTop: '12px' } });
    view.append(asrBox);
    const onLive = (res) => {
      const evaluation = evaluateWords(iw.text, res);
      showEvaluation(evaluation, scoreAttempt({ evaluation, analysis: null, expectedWords, recorded: false }));
    };
    const known = asr.cachedStatus();
    if (known) drawAsr(App, asrBox, known, onLive, !!params.q);
    else if (autoStatus) {
      asrBox.append(h('p', { class: 'small muted', text: 'Verificando o reconhecimento no aparelho…' }));
      autoStatus.then((st) => { state.settings.asrKnown = st; drawAsr(App, asrBox, st, onLive, !!params.q); });
    } else {
      asrBox.append(h('p', { class: 'small muted', text: 'Avaliação palavra por palavra usa o reconhecimento de fala no próprio aparelho (opcional, nada é enviado).' }),
        h('button', { class: 'btn small', onclick: async (e) => { e.currentTarget.disabled = true; const st = await asr.status(); state.settings.asrKnown = st; App.save(); drawAsr(App, asrBox, st, onLive, !!params.q); } }, icon('target'), 'Ver se está disponível'));
    }
  }

  // palavras difíceis
  if (en.length && expectedWords <= 60) {
    const words = [...new Set(en.join(' ').split(/\s+/).map((w2) => w2.replace(/[^A-Za-z'’-]/g, '')).filter((w2) => w2.length > 2))];
    state.difficultWords = state.difficultWords || {};
    const picks = h('div', {}, ...words.map((wd) => {
      const key = wd.toLowerCase();
      const b = h('button', { class: 'word-pick', 'aria-pressed': String(!!state.difficultWords[key]) }, wd);
      b.onclick = () => {
        if (state.difficultWords[key]) delete state.difficultWords[key]; else state.difficultWords[key] = { at: Date.now(), from: targetId };
        b.setAttribute('aria-pressed', String(!!state.difficultWords[key]));
        App.save();
      };
      return b;
    }));
    view.append(h('h2', { text: 'Autoavaliação' }), h('p', { class: 'small muted', text: 'Compare A/B e marque as palavras que soaram diferentes da referência. Elas aparecem em “Revisar”.' }), picks);
  }
  const tips = relevantTips(content, en.join(' '));
  if (tips.length) {
    view.append(h('h2', { text: 'Dicas de pronúncia' }), h('ul', { class: 'list card' }, tips.map((it) => h('li', {},
      h('div', { class: 'list-btn' }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: `${it.en}  ${it.ipa || ''}` }), h('div', { class: 'small muted', text: it.tip || '' })),
        speakerButton({ key: it.au, text: it.en }, { cls: 'icon-btn ghost' }))))));
  }
  return () => w.destroy();
}

function relevantTips(content, text) {
  const tokens = new Set(wordTokens(text));
  return Object.values(content.items).filter((it) => (it.ipa || it.tip) && wordTokens(it.en).every((t) => tokens.has(t))).slice(0, 6);
}

function drawAsr(App, box, st, onLive, isQuestion) {
  clear(box);
  if (st === 'available') {
    const out = h('div', {});
    const btn = h('button', { class: 'btn' }, icon('target'), isQuestion ? 'Verificar palavras (lendo o modelo)' : 'Verificar palavras (sem gravar)');
    btn.onclick = async () => {
      player.stopAll();
      btn.disabled = true;
      clear(out).append(h('p', { class: 'small', text: '🎙️ Fale agora…' }));
      try {
        const res = await asr.recognise({ lang: 'en-GB' });
        onLive(res);
        clear(out).append(h('p', { class: 'tiny muted', text: `Ouvido: “${res.text}”. As cores no texto mostram se cada palavra foi reconhecida (inteligibilidade aproximada), não a qualidade dos sons. Sotaque não é erro.` }));
      } catch (e) {
        clear(out).append(h('p', { class: 'small', text: `Inconclusivo: ${e.message}. Tente de novo.` }));
      }
      btn.disabled = false;
    };
    box.append(h('div', { class: 'small muted', style: { marginBottom: '8px' }, text: isQuestion
      ? 'Reconhecimento no aparelho disponível. Para comparar com o modelo, leia a resposta-modelo em voz alta.'
      : 'Reconhecimento no aparelho disponível: ao gravar, as palavras são avaliadas automaticamente (nada é enviado).' }), btn, out);
  } else if (st === 'downloadable' || st === 'downloading') {
    const btn = h('button', { class: 'btn small' }, icon('download'), 'Baixar reconhecimento offline (uma vez)');
    btn.onclick = async () => { btn.disabled = true; const ok = await asr.install(); toast(ok ? 'Modelo instalado.' : 'Não foi possível instalar agora.'); const st2 = await asr.status(); App.state.settings.asrKnown = st2; drawAsr(App, box, st2, onLive, isQuestion); };
    box.append(h('p', { class: 'small', text: 'O Chrome pode baixar um modelo de reconhecimento que roda no aparelho. Requer internet só para o download; depois funciona offline.' }), btn);
  } else {
    box.append(h('p', { class: 'small muted', text: 'Reconhecimento de fala no aparelho não está disponível neste navegador. Use a gravação, a comparação A/B e a autoavaliação abaixo. (O reconhecimento online do Chrome não é usado, porque enviaria sua voz para fora do aparelho.)' }));
  }
}
