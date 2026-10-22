// Speaking Lab: ouvir a referência, gravar, comparar A/B, métricas de ritmo e (se houver) reconhecimento local.
import { h, icon, clear, toast } from './dom.js';
import * as player from '../audio/player.js';
import * as asr from '../audio/asr.js';
import * as localasr from '../audio/localasr.js';
import { wordTokens } from '../engine/text.js';
import { recWidget } from './recwidget.js';
import { analyseBlob } from '../audio/analysis.js';
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
  // motor de reconhecimento (sempre no aparelho): 'model' = modelo local baixado; 'webspeech' = modo local do Chrome
  let engine = null, engineInfo = null;
  let listener = null;
  let attempt = 0; // cada nova gravação/avaliação invalida resultados ainda em andamento
  let alive = true;
  const missingNote = () => (!engineInfo ? 'Verificando o reconhecimento de fala no aparelho…'
    : engineInfo.local === 'not-installed' ? 'Avaliação por palavra desligada: baixe o reconhecimento local abaixo (opcional).'
    : 'Reconhecimento de fala no aparelho indisponível: palavras não avaliadas.');

  /** Avalia uma gravação já feita (o reconhecimento roda DEPOIS da gravação, sobre o áudio gravado). */
  async function evaluateRecording(blob, analysis, { fromListener = false } = {}) {
    const my = ++attempt;
    const insufficient = !analysis || analysis.silent || analysis.speechSec < 0.4;
    let res = null, why = '';
    if (fromListener) {
      res = await listener.stop();
      listener = null;
      if (!res) why = 'O reconhecimento não conseguiu rodar junto com a gravação neste aparelho. Use “Verificar palavras”.';
    } else if (!asrEligible) why = 'Texto longo: avaliação por palavra só para trechos de até 60 palavras (grave um bloco).';
    else if (engine === 'model' && !insufficient) {
      statusLine.textContent = 'Reconhecendo a gravação no aparelho… (alguns segundos)';
      try { res = await localasr.transcribe(blob); } catch (e) { why = `Reconhecimento local sem resultado (${e.message}): nada foi avaliado.`; }
    } else if (!engine) why = missingNote();
    if (!alive || my !== attempt) return; // a tela mudou ou já há uma gravação mais nova
    let evaluation = evaluateWords(iw.text, res, { insufficient });
    if (!res && !insufficient && why) evaluation = { ...evaluation, note: why };
    showEvaluation(evaluation, scoreAttempt({ evaluation, analysis, expectedWords }));
    if (res && evaluation.evaluated) statusLine.textContent = `Ouvido pelo reconhecimento local: “${res.text}”. Sotaque não é erro: as cores indicam se cada palavra foi reconhecida, não a qualidade dos sons.`;
  }

  const w = recWidget(App, {
    targetId, reference: clips, expectedWords, referenceSec, maxMs: params.routine ? 300000 : 120000,
    onStart: () => {
      attempt++;
      if (!reading) return;
      iw.reset(); legendEl.classList.add('hidden'); clear(scoreBox); statusLine.textContent = '';
      listener = asrEligible && engine === 'webspeech' ? asr.listen({ lang: 'en-GB' }) : null;
    },
    onRecorded: (blob, analysis) => { if (reading) evaluateRecording(blob, analysis, { fromListener: !!listener }); },
  });
  view.append(w.el);

  // reconhecimento no aparelho (opcional)
  if (en.length && asrEligible) {
    const asrBox = h('div', { class: 'card flat', style: { marginTop: '12px' } }, h('p', { class: 'small muted', text: 'Verificando o reconhecimento de fala no aparelho…' }));
    view.append(asrBox);
    const onLive = (res) => {
      const evaluation = evaluateWords(iw.text, res);
      showEvaluation(evaluation, scoreAttempt({ evaluation, analysis: null, expectedWords, recorded: false }));
    };
    const evalLast = async () => {
      const blob = w.getBlob();
      if (!blob) return toast('Grave primeiro.');
      iw.reset(); clear(scoreBox);
      const analysis = await analyseBlob(blob, { expectedWords, referenceSec });
      if (alive) evaluateRecording(blob, analysis);
    };
    const refresh = async (ask = false) => {
      engineInfo = await detectEngine({ ask, known: state.settings.asrKnown });
      if (!alive) return;
      engine = engineInfo.engine;
      if (engineInfo.webspeech && engineInfo.webspeech !== state.settings.asrKnown) { state.settings.asrKnown = engineInfo.webspeech; App.save(); }
      drawAsr(App, asrBox, engineInfo, { onLive, isQuestion: !!params.q, evalLast, refresh, hasBlob: () => !!w.getBlob() });
    };
    refresh();
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
  return () => { alive = false; attempt++; if (listener) { listener.stop(); listener = null; } localasr.release(); w.destroy(); };
}

function relevantTips(content, text) {
  const tokens = new Set(wordTokens(text));
  return Object.values(content.items).filter((it) => (it.ipa || it.tip) && wordTokens(it.en).every((t) => tokens.has(t))).slice(0, 6);
}

/**
 * Qual reconhecimento existe NO APARELHO (nenhuma consulta envia áudio ou dados para fora).
 * O modo local do Chrome só é consultado a pedido do aluno (ask) ou se ele já confirmou antes que existe:
 * em algumas compilações do Chromium a própria consulta derruba a página, então nunca é automática.
 */
export async function detectEngine({ ask = false, known = null } = {}) {
  const local = await localasr.status();
  const webspeech = asr.cachedStatus() || (ask || known === 'available' ? await asr.status('en-GB') : null);
  return { engine: local === 'installed' ? 'model' : webspeech === 'available' ? 'webspeech' : null, local, webspeech, why: localasr.unsupportedReason() };
}

function drawAsr(App, box, info, { onLive, isQuestion, evalLast, refresh, hasBlob }) {
  clear(box);
  if (info.engine === 'model') {
    box.append(h('p', { class: 'small', text: isQuestion
      ? 'Reconhecimento local instalado. Para comparar com o modelo, grave lendo a resposta-modelo e toque em “Avaliar minha gravação”.'
      : 'Reconhecimento de fala local instalado: depois de cada gravação, as palavras são avaliadas no próprio aparelho (nada é enviado).' }),
    h('button', { class: 'btn small', onclick: (e) => { if (!hasBlob()) return toast('Grave primeiro.'); evalLast(); e.currentTarget.blur(); } }, icon('target'), 'Avaliar minha gravação'));
    return;
  }
  if (info.engine === 'webspeech') {
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
    return;
  }
  // sem reconhecimento: explica o motivo e oferece o modelo local (se o aparelho suporta)
  box.append(h('p', { class: 'small', text: info.webspeech
    ? 'Este navegador não oferece reconhecimento de fala no aparelho (o Chrome para Android só tem o modo online, que enviaria sua voz a servidores externos e por isso não é usado). Gravar, ouvir, comparar A/B e a autoavaliação continuam funcionando.'
    : 'Avaliação palavra por palavra usa reconhecimento de fala no próprio aparelho (opcional, nada é enviado). O Chrome para Android não tem esse modo; o modo online dele enviaria sua voz para fora e nunca é usado. Gravar, ouvir, comparar A/B e a autoavaliação funcionam sem ele.' }));
  if (info.local === 'not-installed') {
    const bar = h('div', { class: 'bar hidden', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: '0%' } }));
    const msg = h('p', { class: 'tiny muted' });
    const btn = h('button', { class: 'btn small' }, icon('download'), `Baixar reconhecimento local (${localasr.sizeLabel()}, uma vez)`);
    btn.onclick = async () => {
      btn.disabled = true;
      bar.classList.remove('hidden');
      msg.textContent = 'Baixando do endereço do próprio app…';
      try {
        await localasr.install({ onProgress: (f) => { bar.firstChild.style.width = `${Math.round(f * 100)}%`; bar.setAttribute('aria-valuenow', String(Math.round(f * 100))); } });
        toast('Reconhecimento local instalado. Funciona offline.');
        await refresh();
        if (hasBlob()) evalLast();
      } catch (e) {
        msg.textContent = `Não foi possível baixar agora (${e.message}). Tente com internet; o que já baixou é aproveitado.`;
        btn.disabled = false;
      }
    };
    box.append(h('p', { class: 'small muted', text: `Opcional: um modelo de reconhecimento (Moonshine, código aberto) que roda no próprio celular. São ${localasr.sizeLabel()} baixados uma vez do mesmo endereço do app; depois funciona offline. Sua voz nunca sai do aparelho. É um modelo pequeno: às vezes erra palavras, e sem certeza a palavra fica cinza (não avaliada).` }), btn, bar, msg);
  } else if (info.webspeech === 'downloadable' || info.webspeech === 'downloading') {
    const btn = h('button', { class: 'btn small' }, icon('download'), 'Baixar reconhecimento offline do Chrome (uma vez)');
    btn.onclick = async () => { btn.disabled = true; const ok = await asr.install(); toast(ok ? 'Modelo instalado.' : 'Não foi possível instalar agora.'); refresh(); };
    box.append(btn);
  } else if (info.why) {
    box.append(h('p', { class: 'tiny muted', text: `Reconhecimento local indisponível aqui: ${info.why}.` }));
  }
  if (!info.webspeech) {
    // navegadores de computador podem ter o modo local do Chrome; a consulta só acontece com este toque
    box.append(h('button', { class: 'btn small ghost', onclick: (e) => { e.currentTarget.disabled = true; refresh(true); } }, icon('target'), 'Ver se está disponível'),
      h('span', { class: 'tiny muted', text: ' (reconhecimento do próprio Chrome, no aparelho)' }));
  }
}
