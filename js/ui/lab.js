// Speaking Lab: ouvir a referência, gravar, comparar A/B, métricas de ritmo e (se houver) reconhecimento local.
import { h, icon, clear } from './dom.js';
import * as player from '../audio/player.js';
import * as asr from '../audio/asr.js';
import * as localasr from '../audio/localasr.js';
import { wordTokens } from '../engine/text.js';
import { recWidget } from './recwidget.js';
import { freeAnswerPanel } from './freeanswer.js';
import { inlineWords, legend, scoreLine, scoreDetails } from './inlinewords.js';
import { evaluateWords, scoreAttempt } from '../engine/wordfeedback.js';
import { analyseAttempt, practiceSummary, latestGate, wordPracticeSession } from '../engine/practice.js';
import { wordPractice } from './wordpractice.js';
import { updatePracticeWords } from '../engine/progress.js';
import { asrSetupCard, asrOffNotice, runInstall } from './asrsetup.js';
import { transcriptIntegrity } from '../engine/integrity.js';
import { loadLexicon } from '../engine/lexicon.js';
import { speakerButton, sessionHref } from './common.js';

let labTab = 'sentences';
let labRoutine = 'R01';

export function renderLab(App, { params }) {
  if (params.q || params.block || params.routine && params.full || params.sentence || params.drill) return renderTarget(App, params);
  if (params.routine) labRoutine = params.routine;
  const { content, state } = App;
  if (!content.routines.some((r) => r.id === labRoutine)) labRoutine = content.routines[0].id; // personagem trocado
  // vindo de um módulo (etapa “Falar na prática”): só as frases e perguntas daquele módulo, com volta ao módulo
  const fromModule = !!params.module && content.routines.some((r) => r.id === params.routine);
  const view = App.layout('Speaking Lab', fromModule ? { back: `#/module/${labRoutine}` } : {});
  if (fromModule) {
    const r = content.routines.find((x) => x.id === labRoutine);
    const recs = [...r.blocks.flatMap((b) => content.blocks[b].sentences).map((s) => `sent:${s}`), ...r.blocks.map((b) => `block:${b}`), `routine:${r.id}`, ...r.questions.map((q) => `q:${q}`)].filter((t) => state.recordingsMeta[t]).length;
    view.append(h('section', { class: 'card module-head', 'data-role': 'lab-module' },
      h('div', { class: 'small muted', text: `Falar na prática · ${r.id}` }), h('b', { text: r.title && r.title !== r.pt ? r.title : r.pt }),
      h('p', { class: 'small', style: { margin: '6px 0 0' }, text: `Pronúncia: leia em voz alta as frases do módulo. Conversa: responda às perguntas com suas palavras. ${recs} gravação(ões) neste módulo (3 concluem a etapa).` })));
    if (labTab === 'drills') labTab = 'sentences';
  }
  view.append(h('p', { class: 'small muted', text: 'Pronunciation Lab (Frases, Blocos): ouça, grave e compare. Conversation Lab (Perguntas, Drills): responda livremente e receba retorno sobre adequação, gramática, naturalidade e confiabilidade da transcrição.' }));
  // primeira entrada: convite para instalar o reconhecimento local (não baixa nada sem o toque do aluno)
  const setupSlot = h('div', {});
  view.append(setupSlot);
  if (state.settings.asrPrompt !== 'later') {
    localasr.status().then((st) => {
      if (st !== 'not-installed' || !setupSlot.isConnected) return;
      setupSlot.append(asrSetupCard(App, { onInstalled: () => { setTimeout(() => clear(setupSlot), 2500); }, onLater: () => clear(setupSlot) }));
    });
  }
  const seg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Tipo de prática' });
  const filter = h('div', { class: 'chips scroll', style: { margin: '12px 0' } });
  const body = h('div', {});
  const tabs = [['sentences', 'Frases'], ['blocks', 'Blocos'], ['questions', 'Perguntas'], ...(fromModule || !content.drills.length ? [] : [['drills', 'Drills']])];
  const rec = (id) => state.recordingsMeta[id] ? h('span', { class: 'chip ok', text: 'gravado' }) : null;

  const draw = () => {
    clear(seg).append(...tabs.map(([id, label]) => h('button', { 'aria-pressed': String(labTab === id), onclick: () => { labTab = id; draw(); } }, label)));
    clear(filter);
    if ((labTab === 'sentences' || labTab === 'blocks') && !fromModule) {
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
    if (labTab === 'questions' && fromModule) {
      const qs = r.questions.map((id) => content.questions[id]).filter(Boolean);
      body.append(qs.length ? h('ul', { class: 'list card' }, qs.map((q) => h('li', {}, h('a', { class: 'list-btn', href: `#/lab?q=${q.id}` }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: q.q })), rec(`q:${q.id}`), icon('mic')))))
        : h('p', { class: 'small muted', text: 'Este módulo não tem perguntas; pratique as frases e os blocos.' }));
    } else if (labTab === 'questions') {
      const r1 = content.routines[0].id;
      const groups = [['Rotina 1 (prioritária)', (q) => q.routine === r1], ['Gerais (Word)', (q) => q.source === 'word' && !q.routine], ['Outras rotinas', (q) => q.routine && q.routine !== r1], ['Inesperadas (novas)', (q) => q.source === 'new']];
      for (const [title, pred] of groups) {
        if (!Object.values(content.questions).some(pred)) continue; // grupo vazio (ex.: personagem sem perguntas “do Word”)
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
  // alvo de outro personagem (link antigo, palavra marcada com o outro): volta ao Lab em vez de quebrar
  const exists = params.sentence ? content.sentences[params.sentence] : params.block ? content.blocks[params.block]
    : params.routine ? content.routines.some((r) => r.id === params.routine) : params.q ? content.questions[params.q]
      : params.drill !== undefined ? content.drills[Number(params.drill)] : null;
  if (!exists) return App.go('#/lab');
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
  loadLexicon(); // já no cache offline: distingue palavra inexistente de outra palavra do inglês na comparação
  if (extra) view.append(extra);

  const durations = (globalThis.DRG_AUDIO && globalThis.DRG_AUDIO.files) || {};
  const referenceSec = clips.reduce((n, c) => n + (durations[c.key] || 0), 0);
  const expectedWords = en.join(' ').split(/\s+/).filter(Boolean).length;
  // avaliação automática só quando o aluno está LENDO o texto (frase, bloco, rotina); perguntas são respondidas livremente
  const iw = en.length ? inlineWords(en) : null;
  const reading = !!iw && !params.q;
  const asrEligible = expectedWords <= 60;
  let rate = state.settings.rate || 1;

  // ---------- 1. frase (foco da tela) + ouvir ----------
  const legendEl = legend();
  legendEl.classList.add('hidden');
  if (en.length) {
    let showPt = false;
    const ptBox = h('div', {});
    const ptBtn = h('button', { class: 'btn small ghost', type: 'button', 'aria-pressed': 'false' }, 'Ver PT');
    ptBtn.onclick = () => {
      showPt = !showPt;
      ptBtn.textContent = showPt ? 'Ocultar PT' : 'Ver PT';
      ptBtn.setAttribute('aria-pressed', String(showPt));
      clear(ptBox).append(showPt && pt ? h('p', { class: 'para-pt', style: { whiteSpace: 'pre-line' }, text: pt }) : null);
    };
    const rateSeg = h('div', { class: 'seg rate-seg', role: 'group', 'aria-label': 'Velocidade da referência' });
    const drawRates = () => clear(rateSeg).append(...[0.75, 1, 1.25].map((r) => h('button', { type: 'button', 'aria-pressed': String(r === rate), onclick: () => { rate = r; drawRates(); } }, `${String(r).replace('.', ',')}×`)));
    drawRates();
    view.append(h('section', { class: 'card phrase-card' },
      h('div', { class: 'phrase-top' }, h('span', { class: 'eyebrow', text: params.q ? 'Resposta-modelo' : 'Leia em voz alta' }), ptBtn),
      iw.el, legendEl, iw.detail, ptBox,
      h('div', { class: 'listen-row' },
        h('button', { class: 'btn primary', type: 'button', onclick: () => player.playSequence(clips, { rate }) }, icon('speaker'), 'Ouvir referência'),
        h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Parar', onclick: () => player.stopAll() }, icon('stop')),
        rateSeg)));
  }

  // ---------- 2. gravação + 3. feedback automático ----------
  const fbBox = h('section', { class: 'fb hidden', 'aria-live': 'polite', 'data-role': 'feedback' });
  // motor de reconhecimento (sempre no aparelho): 'model' = modelo local baixado; 'webspeech' = modo local do Chrome
  let engine = null, engineInfo = null, listener = null, alive = true, savedPending = null, lastBlob = null, lastAnalysis = null;
  const gate = latestGate(); // só a tentativa mais recente pode mostrar resultado
  const wordSession = wordPracticeSession(); // prática isolada das palavras: só na memória desta tela
  let wp = null;

  const resetFeedback = () => {
    gate.invalidate();
    if (localasr.busy()) localasr.release(); // cancela a análise anterior (o worker recomeça na próxima)
    if (iw) { iw.reset(); iw.focus(null); }
    legendEl.classList.add('hidden');
    if (wp) { wp.cancel(); wp = null; }
    clear(fbBox);
    fbBox.classList.add('hidden');
    fbBox.dataset.state = 'idle';
  };
  const showFb = (stateName, ...children) => {
    clear(fbBox).append(...children);
    fbBox.dataset.state = stateName;
    fbBox.classList.toggle('hidden', !children.filter(Boolean).length);
  };

  /** Analisa uma gravação concluída (o reconhecimento roda DEPOIS da gravação, sobre o áudio gravado). */
  async function analyse(blob, analysis, { listenerRes, saved = null } = {}) {
    if (!reading) return;
    const ticket = gate.next();
    lastBlob = blob; lastAnalysis = analysis;
    const insufficient = !analysis || analysis.silent || analysis.speechSec < 0.4;
    let res = null, why = '';
    if (saved) res = saved; // resultado já calculado para esta gravação (guardado com ela)
    else if (!asrEligible) why = 'Texto longo: a análise por palavra vale para trechos de até 60 palavras. Grave um bloco por vez.';
    else if (insufficient) why = '';
    else if (listenerRes !== undefined) { res = listenerRes; if (!res) why = 'O reconhecimento não conseguiu rodar junto com a gravação neste aparelho.'; }
    else if (engine === 'model') {
      showFb('analysing', h('div', { class: 'fb-analysing', role: 'status' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), 'Analisando sua gravação…'));
      try { res = await localasr.transcribe(blob); } catch (e) {
        if (!alive || !gate.isCurrent(ticket) || e.code === 'cancelled') return;
        return showError(e, blob, analysis);
      }
    } else if (!engine) { drawUnavailable(); }
    if (!alive || !gate.isCurrent(ticket)) return; // a tela mudou ou já há uma gravação mais nova

    // integridade antes da avaliação: com a transcrição possivelmente cortada, o fim da frase não vira “não reconhecido”
    const integrity = saved ? saved.integrity || null : res && res.segments ? transcriptIntegrity({ text: res.text, segments: res.segments, secs: res.secs }) : null;
    const tailUnreliable = !!integrity && integrity.issues.some((x) => x.code === 'possibly-truncated' || x.code === 'lost-part');
    let evaluation = evaluateWords(iw.text, res, { insufficient, tailUnreliable });
    if (tailUnreliable) evaluation = { ...evaluation, note: [evaluation.note, ...integrity.issues.map((x) => x.msg)].filter(Boolean).join(' ') };
    if (!res && !insufficient && why) evaluation = { ...evaluation, note: why };
    const score = scoreAttempt({ evaluation, analysis, expectedWords });
    const attempt = analyseAttempt(evaluation, iw.text);
    iw.apply(evaluation);
    legendEl.classList.remove('hidden');
    if (!engine && !res) return; // sem reconhecimento: palavras cinza + aviso de indisponibilidade (já desenhado)
    if (attempt.conclusive) {
      if (!saved) { updatePracticeWords(state, targetId, attempt); App.save(); }
      showResult(score, attempt, res, evaluation.note);
    } else {
      showFb('inconclusive',
        scoreLine(score, inconclusiveHint(evaluation, insufficient)),
        h('div', { class: 'row fb-actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => rerecord() }, icon('mic'), 'Gravar novamente')),
        scoreDetails(score, { heard: res ? res.text : null, engine, note: evaluation.note }));
    }
    if (res && !saved && engine === 'model') w.updateMeta(blob, { result: { text: res.text, at: Date.now(), integrity } });
  }

  const inconclusiveHint = (evaluation, insufficient) => (insufficient
    ? 'Quase não captei voz nesta gravação. Grave de novo, num lugar silencioso e mais perto do microfone.'
    : `${evaluation.note || 'Não deu para avaliar esta tentativa.'} Grave novamente.`);

  function showResult(score, attempt, res, note = '') {
    const list = attempt.list;
    if (wp) wp.cancel();
    wp = list.length ? wordPractice({ list, session: wordSession, engine, clips, getRate: () => rate, focusWord: (i) => iw.focus(i), onFullSentence: () => rerecord() }) : null;
    showFb('result',
      scoreLine(score, practiceSummary(list)),
      wp ? wp.el : h('div', { class: 'practice-ok', 'data-role': 'practice-ok' }, icon('check'), 'Nenhuma palavra pendente nesta tentativa.'),
      list.length ? null : h('div', { class: 'row fb-actions' }, h('button', { class: 'btn small', type: 'button', onclick: () => rerecord() }, icon('mic'), 'Gravar novamente')),
      scoreDetails(score, { heard: res ? res.text : null, engine, note }));
  }

  function showError(e, blob, analysis) {
    const msg = { load: 'O reconhecimento não carregou neste momento.', timeout: 'A análise demorou demais e foi interrompida.', decode: 'Não consegui ler esta gravação.', 'too-long': `Gravação longa demais para a análise (máx. ${localasr.MAX_SECONDS} s). Grave um trecho menor.` }[e.code] || 'A análise falhou nesta gravação.';
    const actions = h('div', { class: 'row fb-actions' });
    const help = h('div', { class: 'small' });
    if (e.code === 'decode' || e.code === 'too-long') actions.append(h('button', { class: 'btn small', type: 'button', onclick: () => rerecord() }, icon('mic'), 'Gravar novamente'));
    else actions.append(h('button', { class: 'btn small primary', type: 'button', onclick: () => analyse(blob, analysis) }, icon('refresh'), 'Tentar de novo'));
    if (e.code === 'load') {
      actions.append(h('button', { class: 'btn small', type: 'button', onclick: async (ev) => {
        ev.currentTarget.disabled = true;
        const v = await localasr.verify();
        if (v.ok) { help.textContent = 'Os arquivos do reconhecimento estão íntegros. Tente de novo; se continuar falhando, feche e reabra o app.'; return; }
        clear(help).append(h('p', { text: `Arquivos do reconhecimento incompletos (${[...v.missing, ...v.damaged].length}). É preciso baixá-los de novo (precisa de internet).` }),
          h('button', { class: 'btn small primary', type: 'button', onclick: async () => { const ok = await runInstall(help); if (ok) analyse(blob, analysis); } }, icon('download'), 'Baixar de novo'));
      } }, icon('target'), 'Verificar instalação'));
    }
    showFb('error', h('div', { class: 'fb-error', role: 'alert' }, h('b', { text: msg }), ' ', h('span', { class: 'muted', text: 'Nenhuma nota foi gerada. Sua gravação continua salva.' })), actions, help,
      h('details', { class: 'more' }, h('summary', { text: 'Detalhes técnicos' }), h('p', { class: 'tiny muted', text: `${e.code || 'erro'}: ${e.message}` })));
  }

  function rerecord() {
    w.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    w.start();
  }

  /** Sem reconhecimento: convite para instalar (uma vez), linha compacta depois de “Agora não”, ou motivo. */
  function drawUnavailable() {
    if (!reading || !asrEligible || !engineInfo) return;
    const installed = () => { refresh().then(() => { if (lastBlob) analyse(lastBlob, lastAnalysis); }); };
    if (engineInfo.local === 'not-installed' && state.settings.asrPrompt !== 'later') {
      return showFb('setup', asrSetupCard(App, { onInstalled: installed, onLater: () => drawUnavailable() }));
    }
    const parts = [];
    if (engineInfo.local === 'not-installed') parts.push(asrOffNotice(App, { onInstalled: installed }));
    else if (engineInfo.why) parts.push(h('p', { class: 'small muted', text: `Análise automática indisponível aqui: ${engineInfo.why}.` }));
    if (!engineInfo.webspeech && !isAndroid()) {
      // Chrome de computador pode ter reconhecimento no aparelho; a consulta só acontece com este toque
      parts.push(h('button', { class: 'link-btn', type: 'button', onclick: (e) => { e.currentTarget.disabled = true; refresh(true); } }, 'Ver se está disponível (reconhecimento do Chrome)'));
    }
    showFb('unavailable', ...parts);
  }

  // perguntas e drills (resposta livre): transcrição + avaliação contextual, como nas missões
  const free = !reading && (params.q || params.drill !== undefined)
    ? freeAnswerPanel(App, params.q
      ? { question: content.questions[params.q].q, model: content.questions[params.q].a || '', alternatives: content.questions[params.q].altAnswers || [], modelClips: clips, unit: 'q' }
      : { question: '', model: content.drills[Number(params.drill)].prompts.join(' '), modelClips: [], unit: 'drill' })
    : null;
  const w = recWidget(App, {
    targetId, reference: clips, expectedWords, referenceSec, maxMs: params.routine ? 300000 : 120000,
    onStart: () => {
      resetFeedback();
      if (!reading) return;
      listener = asrEligible && engine === 'webspeech' ? asr.listen({ lang: 'en-GB' }) : null;
    },
    onRecorded: async (blob, analysis) => {
      if (!reading) return;
      if (listener) { const l = listener; listener = null; analyse(blob, analysis, { listenerRes: await l.stop() }); } else analyse(blob, analysis);
    },
    onLoaded: (rec) => {
      // gravação salva: mostra o resultado guardado com ela; sem resultado, analisa (uma vez) se houver reconhecimento local
      savedPending = rec;
      if (engineInfo) processSaved();
    },
    onDeleted: () => { resetFeedback(); lastBlob = null; if (!engine) drawUnavailable(); },
    ...(free ? free.hooks : {}), // resposta livre: os ganchos do painel substituem os da leitura
  });
  if (free) free.attach(w);
  view.append(w.el, free ? free.el : fbBox);

  function processSaved() {
    const rec = savedPending;
    savedPending = null;
    if (!rec || !reading || !alive) return;
    const meta = rec.meta || {};
    if (meta.result && engine) analyse(rec.blob, meta.analysis, { saved: { text: meta.result.text, confidence: 0, integrity: meta.result.integrity || null } });
    else if (engine === 'model' && asrEligible && rec.blob) analyse(rec.blob, meta.analysis); // sem áudio (retenção): nada a analisar
    else { lastBlob = rec.blob; lastAnalysis = meta.analysis; }
  }

  const refresh = async (ask = false) => {
    engineInfo = await detectEngine({ ask, known: state.settings.asrKnown });
    if (!alive) return;
    engine = engineInfo.engine;
    if (engineInfo.webspeech && engineInfo.webspeech !== state.settings.asrKnown) { state.settings.asrKnown = engineInfo.webspeech; App.save(); }
    if (!engine) drawUnavailable();
    else if (fbBox.dataset.state === 'setup' || fbBox.dataset.state === 'unavailable') resetFeedback();
    drawManual();
    if (savedPending) processSaved();
  };
  if (reading) refresh();

  // ---------- autoavaliação manual: só quando não há análise automática ----------
  const manualBox = h('div', {});
  view.append(manualBox);
  function drawManual() {
    clear(manualBox);
    if (!en.length || !asrEligible || engine) return;
    const words = [...new Set(en.join(' ').split(/\s+/).map((w2) => w2.replace(/[^A-Za-z'’-]/g, '')).filter((w2) => w2.length > 2))];
    state.difficultWords = state.difficultWords || {};
    const picks = h('div', {}, ...words.map((wd) => {
      const key = wd.toLowerCase();
      const b = h('button', { class: 'word-pick', type: 'button', 'aria-pressed': String(!!state.difficultWords[key]) }, wd);
      b.onclick = () => {
        if (state.difficultWords[key]) delete state.difficultWords[key]; else state.difficultWords[key] = { at: Date.now(), from: targetId };
        b.setAttribute('aria-pressed', String(!!state.difficultWords[key]));
        App.save();
      };
      return b;
    }));
    manualBox.append(h('details', { class: 'more card flat manual' }, h('summary', { text: 'Marcar palavras difíceis (sem análise automática)' }),
      h('p', { class: 'small muted', text: 'Compare A/B e marque as palavras que soaram diferentes. Elas aparecem em “Revisar”.' }), picks));
  }
  // resposta livre: a marcação manual só aparece se não houver análise automática instalada
  if (!reading && en.length) { if (free) localasr.status().then((st) => { if (st !== 'installed' && alive) drawManual(); }); else drawManual(); }

  // ---------- dicas de pronúncia (recolhidas) ----------
  const tips = relevantTips(content, en.join(' '));
  if (tips.length) {
    view.append(h('details', { class: 'more card flat tips' }, h('summary', { text: `Dicas de pronúncia (${tips.length})` }),
      h('ul', { class: 'list' }, tips.map((it) => h('li', {},
        h('div', { class: 'list-btn' }, h('div', { class: 'grow' }, h('div', { class: 'title en', text: `${it.en}  ${it.ipa || ''}` }), h('div', { class: 'small muted', text: it.tip || '' })),
          speakerButton({ key: it.au, text: it.en }, { cls: 'icon-btn ghost' })))))));
  }
  return () => { alive = false; gate.invalidate(); if (wp) wp.cancel(); if (listener) { listener.stop(); listener = null; } if (free) free.destroy(); localasr.release(); w.destroy(); };
}

const isAndroid = () => /Android/i.test(navigator.userAgent || '');

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
