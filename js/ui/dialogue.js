// Atividades de diálogo (The Story of John): lista, tela do diálogo e as cinco fases.
// Regras em engine/dialogue.js; avaliadores em engine/dialogueeval.js; avaliação online/fila em engine/evalsync.js.
// Identidade visual: só classes e tokens existentes do app (css/app.css), mais poucas classes .dlg-* com os mesmos tokens.
//
// O que NUNCA aparece antes da tentativa: o inglês da fala na escrita por escuta (fase 2), a tradução de referência na
// tradução (fase 3), o gabarito das questões (fase 4). Por isso, na tela do diálogo, o texto em inglês de cada fala só
// aparece depois de a fala ter sido escrita na fase 2, e a tradução só depois da tentativa na fase 3.
import { h, icon, clear, toast, bar } from './dom.js';
import * as player from '../audio/player.js';
import * as recorder from '../audio/recorder.js';
import * as localasr from '../audio/localasr.js';
import * as speech from '../audio/speech.js';
import { analyseBlob } from '../audio/analysis.js';
import * as db from '../store/db.js';
import { asrSetupCard } from './asrsetup.js';
import { transcriptIntegrity } from '../engine/integrity.js';
import { markWord } from '../engine/charmarks.js';
import {
  PHASES, THRESHOLD, LISTENS_REQUIRED, passMark, STORE_KEY, dialoguePack, activityById, itemsOf, questionsOf,
  requiredOf, contentProblems, emptyStore, validStore, actProgress, newAttemptId, recordListen, listensOf, canSpeakItem, addAttempt,
  mastery, gradeRound, addRound, listeningNext, comprehension, questionMastered, phaseStatuses, activityStatus, nextItem, phaseOrder, settleCompletion,
  activityReport, phaseById, pendingAttempts, isLayered, phasesOf, isActive, activeActivities,
  MAX_TRIES, isTolerant, failedTries, canSkip, skipItem, isSkipped,
} from '../engine/dialogue.js';
import { diffText, closestReference } from '../engine/textdiff.js';
import { scoreWriting, evaluateSpeech, localTranslation, foldPt, tailMiss, tailCutByDuration, tailCutInconclusive, trimForLine } from '../engine/dialogueeval.js';
import { loadLexicon } from '../engine/lexicon.js';
import { evaluationConfig, remoteBlocker, createRemoteEvaluator, processQueue } from '../engine/evalsync.js';

// ---------------------------------------------------------------------------------------------------------
// Persistência (kv → 'dialogues'), gravada a cada audição, resposta, gravação e avaliação
// ---------------------------------------------------------------------------------------------------------
let store = null;
let loading = null;
export function loadStore() {
  if (store) return Promise.resolve(store);
  if (!loading) loading = db.getKv(STORE_KEY).then((v) => (store = validStore(v || null))).catch(() => (store = emptyStore())).finally(() => { loading = null; });
  return loading;
}
async function save() {
  try { await db.putKv(STORE_KEY, store); return true; } catch (e) { toast('Não foi possível salvar neste aparelho. Tente de novo.', 5000); return false; }
}
/** Testes: descarta o cache em memória (o próximo acesso relê do IndexedDB). */
export const _resetCache = () => { store = null; };

const STATE_LABEL = {
  locked: 'Bloqueada', available: 'Disponível', in_progress: 'Em andamento', pending_online: 'Aguardando avaliação online',
  needs_retry: 'Precisa de prática', completed: 'Concluída', blocked_by_content: 'Conteúdo pendente', not_applicable: 'Sem itens nesta atividade',
};
const ACT_LABEL = { not_started: 'Não iniciada', in_progress: 'Em andamento', waiting_for_online_evaluation: 'Aguardando avaliação online', completed: 'Concluída', blocked_by_content: 'Conteúdo pendente' };
const ITEM_LABEL = { unseen: 'Não praticado', passed: 'Aprovado', needs_practice: 'Precisa de prática', inconclusive: 'Inconclusivo', pending_evaluation: 'Aguardando avaliação' };
const TYPE_LABEL = { word: 'Palavra', phrasal_verb: 'Phrasal verb', collocation: 'Collocation', chunk: 'Expressão (chunk)', expression: 'Expressão', pattern: 'Padrão' };
const ITEM_CHIP = { passed: 'ok', needs_practice: 'bad', inconclusive: 'warn', pending_evaluation: 'warn', unseen: '' };

const online = () => navigator.onLine !== false;
// testes E2E podem substituir SÓ o reconhecedor (globalThis.__DRG_TEST_ASR = { status(), transcribe(blob, o) }); o resto é o real
const asrEngine = () => globalThis.__DRG_TEST_ASR || speech; // motor central: online desta gravação ou o modelo do aparelho
const hasAudio = (key) => player.hasEmbedded(key);

// ---------------------------------------------------------------------------------------------------------
// Áudio: uma audição só conta quando a reprodução termina de verdade (parar, trocar de tela ou tocar outro áudio não conta)
// ---------------------------------------------------------------------------------------------------------
async function playOnce(clip) {
  const pr = player.play(clip);
  const g = player.generation(); // a geração desta reprodução (play() troca a geração antes do 1º await)
  const r = await pr;
  return { completed: !!r.ok && player.generation() === g && r.reason !== 'cancel', via: r.via || null, ok: !!r.ok };
}
async function playAll(clips, { onIndex } = {}) {
  for (let i = 0; i < clips.length; i++) {
    onIndex && onIndex(i);
    const r = await playOnce(clips[i]);
    if (!r.completed) { onIndex && onIndex(-1); return false; }
    await new Promise((res) => setTimeout(res, 200));
  }
  onIndex && onIndex(-1);
  return true;
}

// ---------------------------------------------------------------------------------------------------------
// Avaliação online: estado de conexão e envio da fila
// ---------------------------------------------------------------------------------------------------------
function remote() {
  const config = evaluationConfig();
  return { config, blocker: remoteBlocker({ config, consent: !!(store && store.consent.online), online: online() }) };
}
async function flushQueue({ force = false } = {}) {
  const pack = dialoguePack();
  const { config, blocker } = remote();
  if (blocker) return { sent: 0, blocker };
  const evaluate = createRemoteEvaluator({ endpoint: config.endpoint, timeoutMs: config.timeoutMs });
  const r = await processQueue(store, pack, evaluate, { force, onApplied: (act) => { settleCompletion(pack, act, actProgress(store, act)); } });
  await save();
  return r;
}
const pendingTotal = () => Object.values(store.acts).reduce((n, p) => n + Object.values(p.attempts || {}).filter((a) => a.status === 'pending').length, 0);

function connectivityBar(onChange) {
  const box = h('div', { class: 'dlg-conn', 'data-role': 'connectivity', role: 'status', 'aria-live': 'polite' });
  const draw = () => {
    const n = pendingTotal();
    const { blocker } = remote();
    clear(box).append(
      h('span', { class: `chip ${online() ? 'ok' : 'warn'}`, 'data-role': 'online-state', text: online() ? 'Online' : 'Sem internet' }),
      n ? h('span', { class: 'chip warn', 'data-role': 'pending-count', text: `${n} ${n === 1 ? 'avaliação pendente' : 'avaliações pendentes'}` }) : null,
      n && !blocker ? h('button', { class: 'link-btn', type: 'button', 'data-role': 'send-pending', onclick: async () => { await flushQueue({ force: true }); draw(); onChange && onChange(); } }, 'Enviar agora') : null);
    box.dataset.online = String(online());
  };
  draw();
  const on = async () => { draw(); if (online() && pendingTotal()) { await flushQueue(); draw(); onChange && onChange(); } };
  window.addEventListener('online', on);
  window.addEventListener('offline', draw);
  box._cleanup = () => { window.removeEventListener('online', on); window.removeEventListener('offline', draw); };
  return box;
}

// ---------------------------------------------------------------------------------------------------------
// Início: cartão de entrada
// ---------------------------------------------------------------------------------------------------------
export function dialogueHomeCard(App) {
  const pack = dialoguePack();
  if (!pack) return null;
  const info = h('div', { class: 'small', style: { marginTop: '6px' }, 'data-role': 'dialogues-next' });
  loadStore().then(() => {
    const acts = activeActivities(pack);
    const next = acts.find((a) => activityStatus(pack, a, actProgress(store, a)).state !== 'completed');
    const done = acts.filter((a) => store.acts[a.id] && store.acts[a.id].completedAt).length;
    info.append(h('span', { class: 'muted', text: `${done} de ${acts.length} ${acts.length === 1 ? 'diálogo concluído' : 'diálogos concluídos'}` }), next ? ` · Próximo: ${partLabel(pack, next)} — ${next.title}` : '');
    const n = pendingTotal();
    if (n) info.append(h('div', { class: 'tiny muted', text: `${n} ${n === 1 ? 'tradução aguarda' : 'traduções aguardam'} avaliação online.` }));
  });
  return h('section', { class: 'card', style: { marginTop: '12px' }, 'data-role': 'dialogues-entry' },
    h('h3', { style: { margin: 0 }, text: pack.title }),
    h('p', { class: 'small muted', style: { margin: '2px 0 8px' }, text: activeActivities(pack).every(isLayered) ? 'Em sete etapas: unidades, frases e o diálogo completo.' : 'Diálogos em etapas, do vocabulário ao diálogo completo.' }),
    info,
    h('a', { class: 'btn block primary', href: '#/dialogues', style: { marginTop: '10px' }, 'data-role': 'open-dialogues' }, icon('chat'), 'Abrir'));
}
const partLabel = (pack, act) => `Parte ${act.partN}`;
/** “n/7 etapas” (em camadas: a etapa 7 conta quando as três partes dela estão concluídas) ou “n/5 fases”. */
function progressText(act, st) {
  if (!isLayered(act)) return `${st.done}/${st.total} fases`;
  const ok = (x) => x.state === 'completed' || x.state === 'not_applicable';
  const steps = [...new Set(st.phases.map((x) => x.step))];
  return `${steps.filter((n) => st.phases.filter((x) => x.step === n).every(ok)).length}/${steps.length} etapas`;
}

// ---------------------------------------------------------------------------------------------------------
// Lista das partes e diálogos
// ---------------------------------------------------------------------------------------------------------
export function renderDialogues(App) {
  const pack = dialoguePack();
  const view = App.layout(pack ? pack.title : 'Diálogos', { back: '#/' });
  if (!pack) { view.append(h('div', { class: 'notice bad', text: 'Conteúdo dos diálogos não encontrado (data/dialogues.js).' })); return null; }
  const body = h('div', { 'data-role': 'dialogues' }, h('div', { class: 'small muted', text: 'Carregando…' }));
  view.append(body);
  let conn = null;
  loadStore().then(() => {
    conn = connectivityBar(() => draw());
    const draw = () => {
      clear(body).append(conn,
        h('p', { class: 'small muted', text: 'Cada diálogo tem etapas em sequência. Cada item precisa de 80% individualmente; a média não compensa um item abaixo do corte.' }));
      for (const part of pack.parts) {
        const ids = part.activityIds.filter((id) => isActive(pack, activityById(pack, id))); // as demais ficam nos dados, fora da navegação
        if (!ids.length) continue;
        body.append(h('h2', { text: `Parte ${part.n} — ${part.title}` }));
        const list = h('ol', { class: 'stages', 'data-role': 'part', 'data-part': String(part.n) });
        for (const id of ids) {
          const act = activityById(pack, id);
          const st = activityStatus(pack, act, actProgress(store, act));
          list.append(h('li', { class: `stage ${st.state === 'completed' ? 'done' : 'open'}`, 'data-role': 'dialogue', 'data-id': act.id, 'data-state': st.state },
            h('a', { class: 'stage-row', href: `#/dialogue/${act.id}` },
              h('span', { class: `stage-mark ${st.state === 'completed' ? 'done' : 'open'}`, 'aria-hidden': 'true' }, st.state === 'completed' ? icon('check') : String(act.order)),
              h('div', { class: 'grow' },
                h('div', { class: 'stage-title' }, h('b', { text: act.title }), act.kind === 'supplementary' ? h('span', { class: 'small muted', text: ' · complementar' }) : null),
                h('div', { class: 'small muted', text: `${ACT_LABEL[st.state]} · ${progressText(act, st)} · ${act.lines.length} ${act.lines.length === 1 ? 'fala' : 'falas'}` })),
              icon('next'))));
        }
        body.append(list);
      }
      body.append(onlineSettings(() => draw()));
    };
    draw();
  });
  return () => { if (conn && conn._cleanup) conn._cleanup(); };
}

/** Autorização de envio do texto das traduções ao serviço de avaliação (privacidade). */
function onlineSettings(onChange) {
  const { config } = remote();
  const consent = store.consent.online;
  return h('section', { class: 'card', style: { marginTop: '16px' }, 'data-role': 'online-settings' },
    h('h3', { style: { marginTop: 0 }, text: 'Avaliação online das traduções' }),
    h('p', { class: 'small', text: 'A tradução é corrigida pelo sentido, o que exige um serviço de avaliação na internet. Só o texto da sua resposta, a fala em inglês e o contexto do diálogo são enviados — nunca seu nome, gravações ou outros dados. Sem conexão ou sem autorização, a resposta fica salva aqui e pendente.' }),
    config.endpoint ? null : h('div', { class: 'notice warn small', 'data-role': 'eval-not-configured', text: 'Serviço de avaliação ainda não configurado nesta versão do aplicativo: as traduções que não forem iguais à referência ficam pendentes.' }),
    h('button', { class: `btn block${consent ? '' : ' primary'}`, type: 'button', 'data-role': 'consent-toggle', style: { marginTop: '10px' },
      onclick: async () => { store.consent = { online: !consent, at: Date.now() }; await save(); onChange && onChange(); } },
    consent ? 'Retirar autorização de envio' : 'Autorizar envio para avaliação'));
}

// ---------------------------------------------------------------------------------------------------------
// Tela do diálogo: contexto, falas, vocabulário, gramática e fases
// ---------------------------------------------------------------------------------------------------------
export function renderDialogue(App, { arg, params }) {
  const pack = dialoguePack();
  const act = activityById(pack, arg);
  if (!act || !isActive(pack, act)) { App.go('#/dialogues'); return null; } // fora da experiência ativa: preservada nos dados
  const view = App.layout(`${partLabel(pack, act)} · ${act.title}`, { back: '#/dialogues' });
  const body = h('div', { 'data-role': 'dialogue-screen', 'data-id': act.id });
  view.append(body);
  let tab = params.tab || 'dialogue';
  let conn = null;
  loadStore().then(() => {
    const p = actProgress(store, act);
    conn = connectivityBar(() => draw());
    const draw = () => {
      const st = settleCompletion(pack, act, p);
      clear(body).append(conn,
        h('section', { class: 'card module-head' },
          h('div', { class: 'eyebrow', text: `${pack.title} · Parte ${act.partN} · ${act.order}` }),
          h('h2', { style: { margin: '4px 0' }, text: act.title }),
          act.context ? h('p', { class: 'small', style: { margin: '4px 0' }, text: act.context }) : null,
          h('div', { class: 'row nowrap', style: { marginTop: '8px' } }, h('div', { class: 'grow' }, bar(st.ratio)), h('span', { class: 'small muted', 'data-role': 'phases-done', text: progressText(act, st) })),
          h('div', { class: 'small muted', 'data-role': 'activity-state', 'data-state': st.state, text: ACT_LABEL[st.state] })));
      const problems = contentProblems(pack, act, { hasAudio });
      if (problems.length) body.append(h('div', { class: 'notice warn small', 'data-role': 'content-problems' }, h('b', { text: 'Conteúdo pendente: ' }), problems.map((x) => x.text).join(' ')));
      // fases
      if (isLayered(act)) {
        // camadas: unidades (1–3) → frases (4–6) → diálogo completo (7)
        const LAYER_TITLE = { unit: `Camada 1 — Unidades linguísticas (${act.unitIds.length})`, sentence: `Camada 2 — Frases completas (${act.sentenceIds.length})`, dialogue: 'Camada 3 — Diálogo completo' };
        for (const layer of ['unit', 'sentence', 'dialogue']) {
          const list = h('ol', { class: 'stages', 'data-role': 'phases', 'data-layer': layer });
          for (const s of st.phases.filter((x) => x.layer === layer)) list.append(phaseRow(act, s));
          body.append(h('h3', { text: LAYER_TITLE[layer] }), list);
        }
      } else {
        const list = h('ol', { class: 'stages', 'data-role': 'phases' });
        for (const s of st.phases) list.append(phaseRow(act, s));
        body.append(h('h3', { text: 'Fases' }), list);
      }
      if (st.state === 'completed') body.append(resultCard(pack, act, p));
      // abas: diálogo, vocabulário, gramática (sob demanda)
      const tabs = h('div', { class: 'seg', role: 'tablist', style: { marginTop: '16px' } },
        ...[['dialogue', 'Diálogo'], ['vocab', isLayered(act) ? 'Unidades e frases' : 'Vocabulário'], ['grammar', 'Gramática']].map(([id, label]) =>
          h('button', { type: 'button', role: 'tab', 'aria-pressed': String(tab === id), 'data-tab': id, onclick: () => { tab = id; draw(); } }, label)));
      const panel = h('div', { 'data-role': `tab-${tab}`, style: { marginTop: '12px' } });
      body.append(tabs, panel);
      if (tab === 'dialogue') panel.append(dialogueList(pack, act, p));
      else if (tab === 'vocab') panel.append(isLayered(act) ? layerList(pack, act, p) : vocabList(pack, act, p));
      else panel.append(grammarNotes(act));
    };
    draw();
  });
  return () => { player.stopAll(); if (conn && conn._cleanup) conn._cleanup(); };
}

function phaseRow(act, s) {
  const locked = s.state === 'locked';
  const counter = s.id === 'listening' && s.total ? `${s.total} ${s.total === 1 ? 'questão' : 'questões'} · aprovação com ${s.passMark}/${s.total}`
    : s.total ? `${s.passed}/${s.total} aprovados${s.pending ? ` · ${s.pending} pendentes` : ''}` : 'sem itens';
  const cls = s.state === 'completed' ? 'done' : locked ? 'locked' : 'open';
  const mark = h('span', { class: `stage-mark ${cls}`, 'aria-hidden': 'true' }, locked ? icon('lock') : s.state === 'completed' ? icon('check') : String(s.n));
  const text = h('div', { class: 'grow' }, h('div', { class: 'stage-title' }, h('b', { text: `${s.n}. ${s.title}` })),
    h('div', { class: 'small muted', text: locked ? (s.id === 'reading' && !isLayered(act) ? 'Bloqueada — conclua a fase 3 (tradução)' : `Bloqueada — conclua ${isLayered(act) ? 'a etapa anterior' : 'a fase anterior'}`) : `${STATE_LABEL[s.state]} · ${counter}` }));
  const attrs = { class: `stage ${cls}`, 'data-role': 'phase', 'data-phase': s.id, 'data-state': s.state };
  if (locked || s.state === 'not_applicable') return h('li', attrs, h('div', { class: 'stage-row', 'aria-disabled': 'true' }, mark, text));
  return h('li', attrs, h('a', { class: 'stage-row', href: `#/dphase/${act.id}?p=${s.id}`, 'aria-label': `${s.title}: ${STATE_LABEL[s.state]}` }, mark, text, icon('next')));
}

/** Falas: personagem, áudio individual e completo; inglês e português só depois das tentativas pertinentes. */
function dialogueList(pack, act, p) {
  const layeredOpen = isLayered(act) && ['completed', 'not_applicable'].includes((phaseStatuses(pack, act, p).find((x) => x.id === 's-listen') || {}).state);
  const showEn = (l) => layeredOpen || mastery(p, 'dictation', l.id).attemptCount > 0;
  const showPt = (l) => { const m = mastery(p, 'translation', l.id); return m.attemptCount > 0 && m.status !== 'pending_evaluation'; };
  const playing = h('div', { class: 'small muted', 'data-role': 'full-status' });
  const rows = act.lines.map((l) => h('li', { class: 'dlg-line', 'data-line': l.id },
    h('div', { class: 'row nowrap' },
      h('div', { class: 'grow' }, h('div', { class: 'dlg-speaker', text: l.speaker }),
        showEn(l) ? h('div', { class: 'en dlg-en', text: l.en }) : h('div', { class: 'small muted', text: isLayered(act) ? 'Texto em inglês depois das etapas de unidades e frases (etapa 6).' : 'Texto em inglês depois da fase 2 (escrita por escuta).' }),
        showPt(l) ? h('div', { class: 'pt small muted dlg-pt', text: l.pt }) : null),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': `Ouvir a fala de ${l.speaker}`, 'data-role': 'line-audio', disabled: !hasAudio(l.audio),
        onclick: () => player.play({ key: l.audio, text: l.en }) }, icon('speaker')))));
  const list = h('ol', { class: 'dlg-lines' }, rows);
  const allAudio = act.lines.every((l) => hasAudio(l.audio));
  return h('div', {},
    h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', 'data-role': 'play-dialogue', disabled: !allAudio, onclick: () => playAll(act.lines.map((l) => ({ key: l.audio, text: l.en })), {
        onIndex: (i) => { rows.forEach((r, k) => r.classList.toggle('dlg-now', k === i)); playing.textContent = i >= 0 ? `Tocando a fala ${i + 1} de ${act.lines.length}` : ''; } }) }, icon('play'), 'Ouvir o diálogo completo'),
      h('button', { class: 'btn ghost', type: 'button', onclick: () => player.stopAll() }, icon('stop'), 'Parar')),
    allAudio ? playing : h('div', { class: 'notice warn small', 'data-role': 'audio-missing', text: 'Áudio indisponível para uma ou mais falas desta atividade.' }),
    list);
}

function vocabList(pack, act, p) {
  const items = itemsOf(pack, act);
  if (!items.length) return h('p', { class: 'small muted', 'data-role': 'no-items', text: 'Os documentos desta atividade não trazem vocabulário próprio (lacuna registrada para a curadoria).' });
  return h('ul', { class: 'list' }, items.map((it) => {
    const m = mastery(p, 'vocab', it.id);
    return h('li', { class: 'row nowrap', 'data-item': it.id },
      h('div', { class: 'grow' }, h('div', { class: 'en', text: it.en }), h('div', { class: 'small muted', text: it.pt })),
      h('span', { class: `chip ${ITEM_CHIP[m.status]}`, text: ITEM_LABEL[m.status] }),
      h('button', { class: 'icon-btn', type: 'button', 'aria-label': `Ouvir “${it.en}”`, disabled: !hasAudio(it.audio), onclick: () => player.play({ key: it.audio, text: it.spoken }) }, icon('speaker')));
  }));
}

/** Notas de foco linguístico do documento (texto literal; marcação simples removida). */
function grammarNotes(act) {
  const notes = [...(act.layerNotes || []).map((n) => n.text), ...act.notes];
  if (!notes.length) return h('p', { class: 'small muted', text: 'Sem notas de gramática nesta atividade.' });
  const clean = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  return h('div', { class: 'stack' }, notes.map((n) => h('section', { class: 'card flat' }, n.split('\n').map((line) => {
    if (/^#{2,3}\s/.test(line)) return h('h4', { style: { margin: '0 0 6px' }, text: clean(line.replace(/^#{2,3}\s+/, '').replace(/^\d+\.\s+/, '')) });
    if (/^\s*-\s/.test(line)) return h('div', { class: 'small', text: `• ${clean(line.replace(/^\s*-\s+/, ''))}` });
    return h('p', { class: 'small', style: { margin: '4px 0' }, text: clean(line) });
  }))));
}

function resultCard(pack, act, p) {
  const rep = activityReport(pack, act, p);
  if (isLayered(act)) return layerResultCard(rep, act);
  const row = (label, list) => (list.length ? h('div', { class: 'small' }, h('b', { text: `${label}: ` }), `${list.filter((x) => x.status === 'passed').length}/${list.length} aprovados`,
    list.some((x) => x.repeated) ? h('span', { class: 'muted', text: ` · ${list.filter((x) => x.repeated).length} precisaram de repetição` }) : null) : null);
  return h('section', { class: 'card', 'data-role': 'activity-result', style: { marginTop: '12px' } },
    h('h3', { style: { marginTop: 0 }, text: 'Atividade concluída' }),
    row('Vocabulário', rep.vocab), row('Escrita por escuta', rep.dictation), row('Tradução', rep.translation),
    rep.comprehension ? h('div', { class: 'small', 'data-role': 'result-comprehension' }, h('b', { text: 'Compreensão: ' }), `${rep.comprehension.tally}/${rep.comprehension.total} (${rep.comprehension.firstRound} na rodada${rep.comprehension.recovered ? `, ${rep.comprehension.recovered} na recuperação` : ''})`) : null,
    row('Leitura em voz alta', rep.reading),
    h('p', { class: 'tiny muted', text: 'Os itens continuam voltando na revisão. O resultado é por item; não há pontos nem recompensas.' }));
}

/** Aba “Unidades e frases” (formato em camadas): conteúdo, origem e situação por etapa. */
function layerList(pack, act, p) {
  const row = (it, phases) => h('li', { class: 'row nowrap', 'data-item': it.id },
    h('div', { class: 'grow' }, h('div', { class: 'en', lang: 'en', text: it.say || it.en }), h('div', { class: 'small muted', text: it.pt }),
      it.note || it.say ? h('div', { class: 'tiny muted', text: it.note || `Padrão: ${it.en}` }) : null,
      h('div', { class: 'tiny muted', text: it.layer === 'unit' ? it.category : it.origin === 'expansion' ? 'expansão (não é fala dos personagens)' : 'frase do diálogo' })),
    h('span', { class: 'small', text: phases.map((ph) => (mastery(p, ph, it.id).status === 'passed' ? '✓' : '·')).join(' ') }),
    h('button', { class: 'icon-btn', type: 'button', 'aria-label': `Ouvir “${it.en}”`, disabled: !hasAudio(it.audio), onclick: () => player.play({ key: it.audio, text: it.spoken }) }, icon('speaker')));
  return h('div', {},
    h('h4', { text: `Unidades (${act.unitIds.length})` }), h('ul', { class: 'list' }, layerItems(pack, act.unitIds).map((it) => row(it, ['u-write', 'u-speak', 'u-listen']))),
    h('h4', { text: `Frases (${act.sentenceIds.length})` }), h('ul', { class: 'list' }, layerItems(pack, act.sentenceIds).map((it) => row(it, ['s-write', 's-speak', 's-listen']))),
    h('p', { class: 'tiny muted', text: '✓ = aprovado na etapa (escrever · falar · ouvir). Traduções autorais e questões ainda não validadas pelo professor.' }));
}

/** Fechamento (formato em camadas): síntese por etapa, sem pontos nem recompensas. */
function layerResultCard(rep, act) {
  const line = (label, list) => (list && list.length ? h('div', { class: 'small' }, h('b', { text: `${label}: ` }), `${list.filter((x) => x.status === 'passed').length}/${list.length} aprovados`,
    list.some((x) => x.status !== 'passed') ? h('span', { class: 'muted', text: ` · ${list.filter((x) => x.status !== 'passed').length} pendentes para revisão` }) : null,
    list.some((x) => x.repeated) ? h('span', { class: 'muted', text: ` · ${list.filter((x) => x.repeated).length} precisaram de repetição` }) : null) : null);
  return h('section', { class: 'card', 'data-role': 'activity-result', style: { marginTop: '12px' } },
    h('h3', { style: { marginTop: 0 }, text: 'Atividade concluída' }),
    line('1. Unidades — escrita', rep['u-write']), line('2. Unidades — fala', rep['u-speak']), line('3. Unidades — escuta', rep['u-listen']),
    line('4. Frases — escrita', rep['s-write']), line('5. Frases — fala', rep['s-speak']), line('6. Frases — escuta', rep['s-listen']),
    rep.comprehension ? h('div', { class: 'small', 'data-role': 'result-comprehension' }, h('b', { text: '7. Compreensão: ' }), `${rep.comprehension.tally}/${rep.comprehension.total}`) : null,
    line('7. Leitura em voz alta', rep.reading), line('7. Tradução', rep.translation),
    h('p', { class: 'tiny muted', text: 'Resultado por item; não há pontos nem recompensas. Transcrição não é avaliação fonética.' }));
}

// ---------------------------------------------------------------------------------------------------------
// Fases
// ---------------------------------------------------------------------------------------------------------
export function renderPhase(App, { arg, params }) {
  const pack = dialoguePack();
  const act = activityById(pack, arg);
  const ph = phaseById(params.p, act);
  if (!act || !ph || !isActive(pack, act)) { App.go('#/dialogues'); return null; }
  const view = App.layout(`${ph.n}. ${ph.short} · ${act.title}`, { back: `#/dialogue/${act.id}`, nav: false });
  const body = h('div', { 'data-role': 'phase-screen', 'data-phase': ph.id, 'data-id': act.id });
  view.append(body);
  const ctx = { alive: true, cleanups: [] };
  if (ph.id === 'vocab' || ph.id === 'reading' || ph.mode === 'speak') loadLexicon(); // como no Speaking Lab: já no cache offline; distingue palavra inexistente de outra palavra do inglês
  loadStore().then(() => {
    const p = actProgress(store, act);
    const st = phaseStatuses(pack, act, p).find((x) => x.id === ph.id);
    if (st.state === 'locked') { App.go(`#/dialogue/${act.id}`); return; }
    const area = h('div', {});
    const R = layerRenderer(ph.id) || { vocab: phaseVocab, dictation: phaseDictation, translation: phaseTranslation, listening: phaseListening, reading: phaseReading }[ph.id];
    // avaliações recebidas (envio manual ou ao reconectar) redesenham a fase com o resultado
    const conn = connectivityBar(() => { if (ctx.alive) R(App, { pack, act, p, area, ctx }); });
    ctx.cleanups.push(() => conn._cleanup());
    body.append(conn, area);
    R(App, { pack, act, p, area, ctx });
  });
  return () => { ctx.alive = false; player.stopAll(); ctx.cleanups.forEach((f) => { try { f(); } catch (e) { /* ok */ } }); localasr.release(); };
}

/** Rodapé comum: progresso da fase e caminho de volta quando concluída. */
function phaseFooter(pack, act, p, phaseId) {
  const s = phaseStatuses(pack, act, p).find((x) => x.id === phaseId);
  const done = s.state === 'completed';
  return h('div', { class: 'stack', style: { marginTop: '16px' }, 'data-role': 'phase-footer', 'data-state': s.state },
    done ? h('div', { class: 'notice ok', 'data-role': 'phase-done' }, icon('check'), ` ${phaseById(phaseId, act).title}: ${isLayered(act) ? 'etapa concluída' : 'fase concluída'}.`) : null,
    s.score ? phaseScoreNote(s) : null,
    s.state === 'pending_online' ? h('div', { class: 'notice warn small', 'data-role': 'phase-pending', text: 'Fase aguardando avaliação online das respostas pendentes. Ela será concluída quando todas forem avaliadas.' }) : null,
    h('a', { class: `btn block${done ? ' primary' : ''}`, href: `#/dialogue/${act.id}`, 'data-role': 'back-to-dialogue' }, icon('back'), 'Voltar ao diálogo'));
}

/**
 * Aproveitamento da etapa tolerante (formato em camadas): só aparece quando há item pendente ou a etapa terminou sem
 * atingir o mínimo. Separa resposta abaixo do corte de falha do reconhecimento (esta não entra na conta).
 */
function phaseScoreNote(s) {
  const sc = s.score;
  const pend = sc.error + sc.technical + (sc.total - sc.passed - sc.error - sc.technical);
  // só quando acrescenta: há item deixado pendente, ou a etapa terminou (aprovada com pendentes, ou abaixo do mínimo)
  if (!pend || (s.state !== 'completed' && !sc.skipped && sc.unresolved > 0)) return null;
  const parts = [sc.error ? `${sc.error} com resposta abaixo do corte` : null, sc.technical ? `${sc.technical} com falha do reconhecimento (fora da conta)` : null].filter(Boolean);
  const head = sc.evaluated ? `Aproveitamento: ${sc.passed} de ${sc.evaluated} ${sc.evaluated === 1 ? 'item avaliado' : 'itens avaliados'} (${sc.ratio}%) · mínimo ${THRESHOLD}%.` : 'Nenhum item avaliado ainda.';
  let tail = '';
  if (s.state === 'completed') tail = pend === 1 ? '1 item fica pendente para revisão; você pode refazê-lo quando quiser.' : `${pend} itens ficam pendentes para revisão; você pode refazê-los quando quiser.`;
  else if (sc.unresolved === 0 && 100 * sc.evaluated < THRESHOLD * sc.total) tail = `Poucos itens puderam ser avaliados (${sc.evaluated} de ${sc.total}). Refaça os pendentes; se o reconhecimento falhar muito, troque o modo em Ajustes → Áudio.`;
  else if (sc.unresolved === 0) tail = `Abaixo do mínimo: refaça os itens pendentes (borda tracejada).`;
  else if (sc.skipped) tail = `${sc.skipped} ${sc.skipped === 1 ? 'item deixado' : 'itens deixados'} para depois.`;
  return h('div', { class: `notice small ${s.state === 'completed' ? 'ok' : 'warn'}`, 'data-role': 'phase-score', 'data-ratio': String(sc.ratio ?? ''), 'data-approved': String(s.state === 'completed') },
    h('div', { text: head }), parts.length ? h('div', { class: 'muted', text: `Pendentes: ${parts.join(' · ')}.` }) : null, tail ? h('div', { text: tail }) : null);
}

/**
 * Tentativas do item na etapa tolerante: “Tentativa n de 3”; depois de 3 sem sucesso, “Continuar sem concluir” (o item
 * fica pendente para revisão e não conta como acerto; tentar de novo continua possível).
 */
function triesBox(act, p, phase, id, onSkip) {
  if (!isTolerant(act, phase)) return null;
  const m = mastery(p, phase, id);
  if (m.status === 'passed' || m.status === 'unseen' || m.status === 'pending_evaluation') return null;
  const n = failedTries(p, phase, id);
  if (isSkipped(p, phase, id)) return h('p', { class: 'vx-line muted', 'data-role': 'item-skipped', text: 'Item pendente para revisão (não conta como acerto). Você pode tentar de novo quando quiser.' });
  if (!canSkip(p, phase, id)) return h('p', { class: 'vx-line muted', 'data-role': 'tries', text: `Tentativa ${n} de ${MAX_TRIES}.` });
  return h('div', { class: 'vx-skip', 'data-role': 'skip-box' },
    h('p', { class: 'vx-line muted', 'data-role': 'tries', text: `${n} tentativas sem sucesso. Tente de novo ou siga: o item fica pendente para revisão e não conta como acerto.` }),
    h('button', { class: 'btn block', type: 'button', 'data-role': 'skip-item', onclick: onSkip }, 'Continuar sem concluir', icon('next')));
}
/** Registra o item como pendente e devolve o próximo item ainda não resolvido (nunca o mesmo; null = etapa resolvida). */
async function skipAndNext(pack, act, p, phase, order, id) {
  if (!skipItem(p, phase, id)) return id;
  settleCompletion(pack, act, p);
  await save();
  return nextItem(order, p, phase, { after: id, skipSkipped: true });
}
/** Próximo item a partir do atual: nas etapas tolerantes, sem voltar aos itens deixados pendentes. */
const nextAfter = (act, order, p, phase, id) => nextItem(order, p, phase, { after: id, skipSkipped: isTolerant(act, phase) });

/** Lista compacta de itens da fase (chips): estado individual de cada item. */
function itemChips(ids, p, phase, label, current, onPick) {
  return h('div', { class: 'chips', 'data-role': 'item-chips', style: { margin: '8px 0' } }, ids.map((id, i) => {
    const m = mastery(p, phase, id);
    const skipped = isSkipped(p, phase, id); // deixado pendente pelo aluno: borda tracejada, sem contar como acerto
    return h('button', { class: `chip ${ITEM_CHIP[m.status]}${skipped ? ' skipped' : ''}`, type: 'button', 'aria-pressed': String(id === current), 'data-item': id, 'data-status': m.status,
      'data-skipped': String(skipped), 'aria-label': `${label(id, i)}: ${skipped ? 'Pendente para revisão' : ITEM_LABEL[m.status]}`, onclick: () => onPick(id) }, label(id, i));
  }));
}

function statusFeedback(result, extra = []) {
  const cls = result.status === 'passed' ? 'good' : result.status === 'needs_practice' ? 'bad' : 'mid';
  const head = result.status === 'passed' ? 'Aprovado' : result.status === 'needs_practice' ? 'Precisa de prática' : result.status === 'pending' ? 'Aguardando avaliação' : 'Inconclusivo';
  return h('div', { class: `feedback ${cls}`, 'data-role': 'feedback', 'data-status': result.status, role: 'status' },
    h('div', { class: 'head' }, icon(result.status === 'passed' ? 'check' : result.status === 'needs_practice' ? 'x' : 'refresh'), head,
      typeof result.score === 'number' ? h('span', { class: 'score-tag', 'data-role': 'score', text: `${result.score}%` }) : null),
    result.status === 'inconclusive' ? h('div', { class: 'small', text: 'Não aprova nem reprova: tente de novo.' }) : null,
    result.feedback && result.feedback.summary ? h('p', { class: 'small', text: result.feedback.summary }) : null,
    ...extra);
}

// ---------- reconhecimento de fala (fases 1 e 5) ----------
async function speechReady(area, App, onReady) {
  const st = await asrEngine().status().catch(() => 'unsupported');
  if (st === 'installed') return true;
  const why = localasr.unsupportedReason();
  if (why) { area.append(h('div', { class: 'notice bad small', 'data-role': 'asr-unsupported', text: `Reconhecimento de fala indisponível neste navegador (${why}). As tentativas de fala ficam inconclusivas.` })); return false; }
  area.append(asrSetupCard(App, { onInstalled: onReady, onLater: () => {} }));
  return false;
}

/**
 * Avalia uma gravação da fase 1 ou 5 (depois de gravada). Nunca reprova por falha técnica.
 * trim = true: transcreve só o trecho com voz (speechBounds, margem de 0,15 s — começo e fim falados preservados), como
 * a prática de palavras do Speaking Lab; sem o recorte, o silêncio da gravação faz o Moonshine devolver texto vazio.
 * Transcrição que para no começo do texto (tailMiss) tem uma segunda passada no outro modo; se ainda faltar o fim e a
 * gravação tiver mais voz do que as palavras ouvidas explicam, a tentativa fica inconclusiva (corte do reconhecedor).
 * Exportada para os testes com o reconhecedor real (App.voiceEval).
 */
export async function evaluateRecording(blob, { target, trim, alive = () => true, maxExtra = null }) {
  const analysis = await analyseBlob(blob).catch(() => null);
  const insufficient = !analysis || analysis.silent || analysis.speechSec < 0.3;
  const recognise = async (word, local = false) => {
    let asr = null, reason = '';
    try { asr = await asrEngine().transcribe(blob, { word, local }); } catch (e) { reason = `O reconhecimento falhou nesta gravação (${e.message}). Isso não conta como erro seu.`; }
    const integrity = asr && asr.segments ? transcriptIntegrity({ text: asr.text, segments: asr.segments, secs: asr.secs }) : null;
    // fim não confiável: corte detectado no reconhecedor do aparelho ou texto online que veio de resultado parcial
    const tailUnreliable = (!!integrity && integrity.issues.some((x) => x.code === 'possibly-truncated' || x.code === 'lost-part')) || !!(asr && asr.partial);
    return { asr, result: evaluateSpeech(target, asr, { insufficient, tailUnreliable, reason, maxExtra }) };
  };
  let pass = await recognise(trim);
  const diag = { trim, engine: pass.asr ? pass.asr.engine || null : null, fallbackReason: pass.asr ? pass.asr.fallbackReason || null : null, firstPass: pass.asr ? pass.asr.text : null, secondPass: null, tailCut: false, voicedSec: analysis && !analysis.online ? analysis.voicedSec : null }; // modo online: sem áudio, sem medida de voz
  if (alive() && pass.asr && pass.asr.engine !== 'online' && tailMiss(pass.result).prefixOnly) { // 2ª passada: só o modelo do aparelho
    const other = await recognise(!trim, true); // mesma gravação, o modelo do aparelho no outro modo: só substitui se reconhecer MAIS palavras
    diag.secondPass = other.asr ? other.asr.text : null;
    const goods = (r) => ((r.feedback && r.feedback.words) || []).filter((w) => w.state === 'good').length;
    if (other.asr && goods(other.result) > goods(pass.result)) pass = other;
    const miss = tailMiss(pass.result);
    if (tailCutByDuration(miss, diag.voicedSec)) { diag.tailCut = true; pass = { ...pass, result: tailCutInconclusive(pass.result, miss) }; }
  }
  // registro local de diagnóstico (só metadados e o texto reconhecido, nunca o áudio): modo, segunda passada, corte, voz
  const result = { ...pass.result, evidence: { ...(pass.result.evidence || {}), asr: diag } };
  return { result, heard: pass.asr ? pass.asr.text : null };
}

/** Grava (até maxMs), transcreve no aparelho e avalia (evaluateRecording). */
async function recordAndEvaluate({ target, maxMs, trim, statusEl, ctx, maxExtra = null }) {
  let session;
  try { session = await recorder.start({ maxMs }); } catch (e) {
    return { result: evaluateSpeech(target, null, { reason: e.userMessage || 'Não foi possível usar o microfone.' }), micError: e.userMessage || 'Microfone indisponível.' };
  }
  return new Promise((resolve) => {
    clear(statusEl).append(h('span', { class: 'wp-dot', 'aria-hidden': 'true' }), ' Gravando… para sozinho quando você terminar de falar (ou toque em Parar).',
      h('button', { class: 'btn primary block', type: 'button', 'data-role': 'stop', style: { marginTop: '8px' }, onclick: () => session.stop() }, icon('stop'), 'Parar'));
    ctx.cleanups.push(() => session.cancel());
    session.stopped.then(async ({ blob }) => {
      if (!ctx.alive) return resolve(null);
      clear(statusEl).append(h('span', { class: 'spinner', 'aria-hidden': 'true' }), ' Reconhecendo no aparelho…');
      const out = await evaluateRecording(blob, { target, trim, alive: () => ctx.alive, maxExtra });
      if (!ctx.alive) return resolve(null);
      clear(statusEl);
      resolve(out);
    });
  });
}

/** Motor que atendeu (e, se houve troca, o motivo) — linha miúda, para diagnóstico. */
const engineText = (a) => a.engine === 'online' ? ' Reconhecimento online do navegador.' : a.engine === 'local-model' ? ` Reconhecimento do aparelho${a.fallbackReason ? ` (${a.fallbackReason})` : ''}.` : '';

function speechDetails(result, heard) {
  const f = result.feedback || {};
  return [
    heard !== null && heard !== undefined ? h('div', { class: 'small' }, h('span', { class: 'muted', text: 'O app ouviu: ' }), h('span', { 'data-role': 'heard', text: `“${heard}”` })) : null,
    f.toPractise && f.toPractise.length ? h('div', { class: 'small' }, h('span', { class: 'muted', text: 'Palavras a praticar: ' }), f.toPractise.join(', ')) : null,
    h('div', { class: 'tiny muted', 'data-role': 'asr-engine', text: `Correspondência entre a transcrição e o texto — não é avaliação fonética da pronúncia.${engineText((result.evidence || {}).asr || {})}` }),
  ];
}

// ---------- Fase 1: vocabulário ----------
// Interface remodelada (2026-11-12, primeira versão para avaliação visual): só apresentação — conteúdo, critérios,
// avaliação, gravação, audições e progresso são os de sempre. Cores por trecho (engine/charmarks.js) a partir do estado
// que o avaliador já produz: verde reconhecido; vermelho suave ausente/substituído (só a terminação, quando o alinhamento
// é seguro: “team|s”); amarelo correspondência parcial ou incerta. Correspondência textual — não é avaliação fonética.
const VX_MARK = { good: 'reconhecido', missing: 'ausente ou substituído', uncertain: 'correspondência parcial ou incerta' };
const VX_HEAD = { passed: 'Aprovado', needs_practice: 'Precisa de prática', inconclusive: 'Inconclusivo', pending: 'Aguardando avaliação' };
const letters = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9']/g, '');

/** A expressão (texto original do item) com cada palavra marcada pelo estado do avaliador (na ordem das palavras ditas). */
function vocabExpression(en, words) {
  const box = h('div', { class: 'vx-en en', 'data-role': 'item-en', lang: 'en' });
  if (!words || !words.length) { box.textContent = en; return box; }
  let k = 0;
  String(en).split(/(\s+)/).forEach((tok) => {
    if (!tok) return;
    if (/^\s+$/.test(tok)) { box.append(document.createTextNode(' ')); return; }
    const w = k < words.length && letters(tok) && letters(tok) === letters(words[k].text) ? words[k++] : null;
    if (!w) { box.append(h('span', { class: 'vx-w' }, tok)); return; }
    const segs = markWord(tok, w);
    const label = segs.map((x) => `${x.text}: ${VX_MARK[x.mark]}`).join('; ');
    box.append(h('span', { class: 'vx-w', 'data-state': w.state, 'data-marks': segs.map((x) => x.mark).join(' '), title: label, 'aria-label': label },
      ...segs.map((x) => h('span', { class: `vx-seg vx-${x.mark}`, text: x.text }))));
  });
  return box;
}

/** Progresso das audições: três marcas + “Audições: n/3”. */
function vocabListens(n) {
  const k = Math.min(n, LISTENS_REQUIRED);
  return h('div', { class: 'vx-listens' },
    h('div', { class: 'vx-dots', 'aria-hidden': 'true' }, Array.from({ length: LISTENS_REQUIRED }, (_, i) => h('i', { class: i < k ? 'on' : '' }))),
    h('span', { class: 'vx-count', 'data-role': 'listen-count', text: `Audições: ${k}/${LISTENS_REQUIRED}` }));
}

/** Cartão de resultado enxuto: estado, o que o app ouviu e palavras a praticar (falha técnica: mensagem curta). */
function vocabResult(result, heard) {
  const f = result.feedback || {};
  const cls = result.status === 'passed' ? 'good' : result.status === 'needs_practice' ? 'bad' : 'mid';
  const text = heard === null || heard === undefined ? '' : String(heard).trim();
  const technical = result.status === 'inconclusive' && !text;
  return h('div', { class: `vx-result ${cls}`, 'data-role': 'feedback', 'data-status': result.status, role: 'status' },
    h('div', { class: 'vx-head' }, icon(result.status === 'passed' ? 'check' : result.status === 'needs_practice' ? 'x' : 'refresh'), VX_HEAD[result.status] || 'Inconclusivo'),
    text ? h('p', { class: 'vx-line' }, h('span', { class: 'muted', text: 'O app ouviu: ' }), h('span', { class: 'en', lang: 'en', 'data-role': 'heard', text: `“${text}”` })) : null,
    f.toPractise && f.toPractise.length ? h('p', { class: 'vx-line', 'data-role': 'to-practise' }, h('span', { class: 'muted', text: 'Palavras a praticar: ' }), h('b', { class: 'en', lang: 'en', text: f.toPractise.join(', ') })) : null,
    result.status === 'needs_practice' ? h('p', { class: 'vx-line muted', 'data-role': 'retry-hint', text: (f.words || []).length <= 2
      ? 'Em trechos muito curtos o reconhecimento erra com mais frequência. Se você disse certo, grave de novo, sem pressa; isso não conta contra você.'
      : 'Ouça o modelo de novo e grave outra vez.' }) : null,
    result.status === 'inconclusive' ? h('p', { class: 'vx-line', text: technical ? 'O reconhecimento não devolveu texto nesta tentativa. Não aprova nem reprova — isso não conta como erro seu. Grave de novo.' : `Não aprova nem reprova: ${f.summary ? f.summary.replace(/\s*$/, '') : 'grave de novo.'}` }) : null,
    technical && f.summary ? h('details', { class: 'more vx-tech' }, h('summary', { text: 'Detalhes técnicos' }), h('p', { class: 'tiny muted', text: f.summary })) : null);
}

function phaseVocab(App, { pack, act, p, area, ctx }) {
  speakPhase(App, { pack, act, p, area, ctx }, { phase: 'vocab', items: itemsOf(pack, act), eyebrow: (it) => TYPE_LABEL[it.type] || it.type,
    instruction: `Ouça ${LISTENS_REQUIRED} vezes até o fim. Depois, grave você dizendo.`, empty: 'Esta atividade não tem itens de vocabulário nos documentos.' });
}

/**
 * Ouvir 3× e falar (fase 1 clássica; etapas 2 e 5 em camadas): a gravação só é liberada depois de LISTENS_REQUIRED
 * reproduções concluídas de verdade do modelo (playOnce: interromper, trocar de tela ou tocar outro áudio não conta;
 * o contador fica salvo por fase e item). Reconhecimento, avaliação e marcação por trecho são os de sempre.
 */
function speakPhase(App, { pack, act, p, area, ctx }, { phase, items, eyebrow, instruction, empty, maxMs = () => 8000, trim = () => true, maxExtra = null }) {
  const ids = items.map((x) => x.id);
  let current = nextItem(ids, p, phase, { skipSkipped: isTolerant(act, phase) }) || nextItem(ids, p, phase) || ids[0];
  let last = null;
  const draw = async () => {
    const it = items.find((x) => x.id === current);
    const m = mastery(p, phase, it.id);
    const n = listensOf(p, `${phase}:${it.id}`);
    const canSpeak = canSpeakItem(p, it.id, phase);
    const status = h('div', { class: 'wp-status', role: 'status', 'aria-live': 'polite', 'data-role': 'rec-status' });
    const listenBtn = h('button', { class: 'btn primary vx-listen', type: 'button', 'data-role': 'listen-item', disabled: !hasAudio(it.audio) }, icon('speaker'), 'Ouvir');
    const recBtn = h('button', { class: 'btn block vx-rec', type: 'button', 'data-role': 'record-item', disabled: !canSpeak }, icon('mic'), m.attemptCount ? 'Gravar de novo' : 'Gravar minha pronúncia');
    const fb = h('div', { 'data-role': 'item-result' });
    // resultado mostrado: a tentativa recém-feita ou, ao voltar ao item, a última tentativa guardada
    const shown = last && last.id === it.id ? { result: last.result, heard: last.heard }
      : m.lastAttempt ? { result: { status: m.lastAttempt.status, feedback: m.lastAttempt.feedback }, heard: m.lastAttempt.response } : null;
    // cores só num resultado avaliado (aprovado / precisa de prática); inconclusivo não colore a expressão
    const judged = shown && (shown.result.status === 'passed' || shown.result.status === 'needs_practice');
    const words = judged && shown.result.feedback && Array.isArray(shown.result.feedback.words) ? shown.result.feedback.words : null;
    clear(area).append(
      h('p', { class: 'vx-instruction', 'data-role': 'vocab-instruction' }, icon('speaker'), h('span', { text: instruction })),
      h('div', { class: 'vx-chips' }, itemChips(ids, p, phase, (id, i) => String(i + 1), current, (id) => { current = id; last = null; draw(); })),
      h('section', { class: 'card vx-card', 'data-role': 'vocab-card', 'data-item': it.id, 'data-status': m.status },
        h('div', { class: 'eyebrow', text: eyebrow(it) }),
        // a expressão real em primeiro plano; padrão/notação didática só como complemento
        it.say ? vocabExpression(it.say, words) : vocabExpression(it.en, words),
        h('div', { class: 'vx-pt', 'data-role': 'item-pt', text: it.pt }),
        itemNote(it),
        h('div', { class: 'vx-listen-row' }, listenBtn, vocabListens(n)),
        hasAudio(it.audio) ? null : h('div', { class: 'notice warn small', 'data-role': 'audio-missing', text: 'Áudio indisponível para este item: a produção oral fica bloqueada.' }),
        canSpeak ? null : h('div', { class: 'small muted', 'data-role': 'rec-locked', text: `A gravação é liberada depois de ${LISTENS_REQUIRED} reproduções completas do modelo.` }),
        recBtn, status),
      fb);
    if (shown) fb.append(vocabResult(shown.result, shown.heard));
    fb.append(triesBox(act, p, phase, it.id, async () => { current = (await skipAndNext(pack, act, p, phase, ids, it.id)) || it.id; last = null; if (ctx.alive) draw(); }) || '');
    const next = nextAfter(act, ids, p, phase, it.id);
    if (next && (m.status === 'passed' || isSkipped(p, phase, it.id))) fb.append(h('button', { class: 'btn primary block vx-next', type: 'button', 'data-role': 'next-item', onclick: () => { current = next; last = null; draw(); } }, 'Próximo item', icon('next')));
    area.append(phaseFooter(pack, act, p, phase));
    listenBtn.onclick = async () => {
      listenBtn.disabled = true;
      const r = await playOnce({ key: it.audio, text: it.spoken });
      if (!ctx.alive) return;
      if (r.completed) { recordListen(p, `${phase}:${it.id}`); await save(); }
      draw();
    };
    recBtn.onclick = async () => {
      if (!canSpeakItem(p, it.id, phase)) return; // bloqueio também na ação (não só no botão)
      if (!(await speechReady(status, App, () => draw()))) return;
      recBtn.disabled = true;
      const out = await recordAndEvaluate({ target: it.spoken, maxMs: maxMs(it), trim: trim(it), statusEl: status, ctx, maxExtra });
      if (!out || !ctx.alive) return;
      const result = { ...out.result, rubricVersion: 'dre-speech-lexical-1' };
      addAttempt(p, { attemptId: newAttemptId(), phase, itemId: it.id, inputType: 'speech', response: out.heard, result });
      settleCompletion(pack, act, p);
      await save();
      last = { id: it.id, result, heard: out.heard };
      if (out.micError) toast(out.micError, 6000);
      draw();
    };
  };
  if (!items.length) { clear(area).append(h('p', { class: 'small muted', text: empty }), phaseFooter(pack, act, p, phase)); return; }
  draw();
}

// ---------- Fase 2: escuta e escrita ----------
function phaseDictation(App, { pack, act, p, area, ctx }) {
  const order = phaseOrder(p, 'dictation', act.lines.map((l) => l.id));
  save();
  let current = nextItem(order, p, 'dictation') || order[0];
  let last = null;
  const items = itemsOf(pack, act);
  const draw = () => {
    const l = act.lines.find((x) => x.id === current);
    const m = mastery(p, 'dictation', l.id);
    // pista = significados dos itens da fala, exceto item que é a fala inteira (revelaria a tradução completa)
    const lineWords = foldPt(l.pt).split(' ').filter(Boolean);
    const whole = (pt) => { const w = foldPt(String(pt).replace(/\(.*?\)/g, '')).split(' ').filter(Boolean); return w.length >= lineWords.length * 0.6; };
    const hints = items.filter((it) => it.sourceLineIds.includes(l.id) && !whole(it.pt)).map((it) => it.pt);
    const input = h('textarea', { class: 'field en', rows: 3, 'data-role': 'answer', 'aria-label': 'Escreva em inglês a frase que você ouviu', autocapitalize: 'sentences', spellcheck: 'false', placeholder: 'Escreva em inglês o que você ouviu' });
    const send = h('button', { class: 'btn primary block', type: 'button', 'data-role': 'submit', style: { marginTop: '10px' } }, icon('check'), 'Enviar');
    const fb = h('div', { 'data-role': 'line-result' });
    clear(area).append(
      h('p', { class: 'small muted', text: `Ouça a fala em inglês e escreva-a. Cada frase precisa de ${THRESHOLD}% de correspondência. A frase só aparece depois do envio.` }),
      itemChips(order, p, 'dictation', (id, i) => String(i + 1), current, (id) => { current = id; last = null; draw(); }),
      h('section', { class: 'card', 'data-role': 'dictation-card', 'data-line': l.id, 'data-status': m.status },
        h('div', { class: 'eyebrow', text: `Fala de ${l.speaker}` }),
        h('div', { class: 'small', 'data-role': 'hint' }, h('b', { text: 'Pista em português: ' }),
          hints.length ? hints.join(' · ') : (act.context || `Fala de ${l.speaker} neste diálogo.`)),
        h('div', { class: 'row', style: { marginTop: '10px' } },
          h('button', { class: 'btn', type: 'button', 'data-role': 'listen-line', disabled: !hasAudio(l.audio), onclick: () => player.play({ key: l.audio, text: l.en }) }, icon('speaker'), 'Ouvir a fala'),
          h('button', { class: 'btn ghost', type: 'button', disabled: !hasAudio(l.audio), onclick: () => player.play({ key: l.audio, text: l.en }, { rate: 0.75 }) }, icon('slow'), 'Mais devagar')),
        hasAudio(l.audio) ? null : h('div', { class: 'notice warn small', text: 'Áudio indisponível para esta fala.' }),
        h('div', { style: { marginTop: '10px' } }, input), send),
      fb);
    if (last && last.id === l.id) {
      const f = last.result.feedback || {};
      fb.append(statusFeedback(last.result, [
        h('div', { class: 'model en', 'data-role': 'reference' }, h('span', { class: 'small muted', text: 'Frase: ' }), l.en),
        f.omissions && f.omissions.length ? h('div', { class: 'small', text: `Faltou: ${f.omissions.join(', ')}` }) : null,
        f.insertions && f.insertions.length ? h('div', { class: 'small', text: `A mais: ${f.insertions.join(', ')}` }) : null,
        f.spelling && f.spelling.length ? h('div', { class: 'small', text: `Ortografia: ${f.spelling.join(', ')}` }) : null,
        f.reordered && f.reordered.length ? h('div', { class: 'small', text: `Fora de ordem: ${f.reordered.join(', ')}` }) : null,
        ...(f.notes || []).map((n) => h('div', { class: 'small muted', text: n })),
      ]));
      const next = nextItem(order.filter((id) => id !== l.id), p, 'dictation');
      if (next) fb.append(h('button', { class: 'btn primary block', type: 'button', 'data-role': 'next-item', style: { marginTop: '10px' }, onclick: () => { current = next; last = null; draw(); } }, 'Próxima frase', icon('next')));
    } else if (m.status === 'passed') {
      fb.append(h('div', { class: 'chip ok', 'data-role': 'item-status', text: `Aprovada · ${m.bestValidScore}%` }), h('div', { class: 'en small', text: l.en }));
    }
    area.append(phaseFooter(pack, act, p, 'dictation'));
    send.onclick = async () => {
      const answer = input.value.trim();
      if (!answer) { toast('Escreva a frase antes de enviar.'); return; }
      send.disabled = true;
      const result = scoreWriting(App.checker, answer, l.en, l.acceptedVariants || []);
      addAttempt(p, { attemptId: newAttemptId(), phase: 'dictation', itemId: l.id, inputType: 'text', response: answer, result });
      settleCompletion(pack, act, p);
      await save();
      last = { id: l.id, result };
      if (ctx.alive) draw();
    };
  };
  draw();
}

// ---------- Formato em camadas: escrever (etapas 1 e 4) e ouvir e escrever (etapas 3 e 6) ----------
const layerItems = (pack, ids) => ids.map((id) => pack.items.find((x) => x.id === id)).filter(Boolean);
const LAYER_EYEBROW = (it) => (it.layer === 'unit' ? it.category || 'Unidade' : it.origin === 'expansion' ? 'Frase de expansão (não é fala dos personagens)' : 'Frase do diálogo');
/** Complemento didático do item: padrão/notação do documento (a expressão real fica em primeiro plano). */
function itemNote(it) {
  const t = it.note || (it.say ? `Padrão: ${it.en}` : '');
  return t ? h('div', { class: 'vx-note small muted', 'data-role': 'item-note', text: t }) : null;
}

/** Texto com a marcação da comparação (textdiff): só o trecho errado/correto ganha cor. */
const WD_LABEL = { wrong: 'trecho errado', extra: 'palavra a mais', fix: 'forma correta', missing: 'palavra que faltou' };
function diffLine(segs, role) {
  return h('span', { class: 'wd en', lang: 'en', 'data-role': role }, segs.map((x) => (x.mark === 'space' ? ' '
    : x.mark === 'same' ? h('span', { text: x.text }) : h('span', { class: `wd-${x.mark}`, 'data-mark': x.mark, title: WD_LABEL[x.mark], 'aria-label': `${x.text}: ${WD_LABEL[x.mark]}`, text: x.text }))));
}

/**
 * Resultado da escrita (corretor de sempre), na ordem: o que o aluno escreveu (trecho errado em vermelho) → a forma
 * correta (o que corrige em verde) → observação curta só quando acrescenta (ordem das palavras). O significado já está
 * no cartão; nada de listas repetindo o que a marcação mostra.
 */
function writingFeedback(result, it, answer, refs = []) {
  const f = result.feedback || {};
  const passed = result.status === 'passed';
  const ref = closestReference(answer || '', [refs[0] || it.en, ...refs.slice(1)]) || it.en;
  const d = answer ? diffText(answer, ref) : null;
  const marked = !!d && d.changed && !(passed && (f.kind === 'exact' || f.kind === 'variant'));
  const cls = passed ? 'good' : result.status === 'needs_practice' ? 'bad' : 'mid';
  const head = passed ? (marked ? 'Aprovado — confira o detalhe' : 'Correto') : result.status === 'needs_practice' ? 'Ainda não' : 'Inconclusivo';
  return h('div', { class: `vx-result ${cls}`, 'data-role': 'feedback', 'data-status': result.status, role: 'status' },
    h('div', { class: 'vx-head' }, icon(passed ? 'check' : result.status === 'needs_practice' ? 'x' : 'refresh'), head),
    marked ? h('p', { class: 'vx-line wd-row' }, h('span', { class: 'wd-label muted', text: 'Você escreveu' }), diffLine(d.answer, 'answer-echo')) : null,
    marked || !passed ? h('p', { class: 'vx-line wd-row' }, h('span', { class: 'wd-label muted', text: 'Correto' }),
      d ? diffLine(d.reference, 'reference') : h('span', { class: 'en', lang: 'en', 'data-role': 'reference', text: ref })) : null,
    !passed && f.reordered && f.reordered.length ? h('p', { class: 'vx-line muted', text: 'Atenção à ordem das palavras.' }) : null,
    !passed && f.summary && /vazia/.test(f.summary) ? h('p', { class: 'vx-line', text: f.summary }) : null);
}

/** Alvo da escrita (a expressão exibida em primeiro plano) seguido das variantes aceitas, sem repetição. */
const targets = (it) => [...new Set([it.say || it.en, it.en, it.spoken, ...(it.accepted || [])].filter(Boolean))];

/**
 * Etapas de escrita. listen = false (1 e 4): inglês e português juntos, o aluno escreve em inglês. listen = true (3 e 6):
 * ordem embaralhada estável (ids e áudios juntos), o inglês só aparece depois da resposta. Corretor: scoreWriting
 * (critério de sempre, ≥ 80%), com a forma falada das notações didáticas aceita como variante.
 */
function writePhase(App, { pack, act, p, area, ctx }, { phase, ids, listen }) {
  const items = layerItems(pack, ids);
  const order = listen ? phaseOrder(p, phase, items.map((x) => x.id)) : items.map((x) => x.id);
  if (listen) save();
  let current = nextItem(order, p, phase, { skipSkipped: isTolerant(act, phase) }) || nextItem(order, p, phase) || order[0];
  let last = null;
  const draw = () => {
    const it = items.find((x) => x.id === current);
    const m = mastery(p, phase, it.id);
    const input = h('textarea', { class: 'field en', rows: it.layer === 'unit' ? 2 : 3, 'data-role': 'answer', autocapitalize: 'off', spellcheck: 'false', lang: 'en',
      'aria-label': listen ? 'Escreva em inglês o que você ouviu' : 'Escreva em inglês', placeholder: listen ? 'Escreva em inglês o que você ouviu' : 'Escreva em inglês' });
    const send = h('button', { class: 'btn primary block', type: 'button', 'data-role': 'submit', style: { marginTop: '10px' } }, icon('check'), 'Enviar');
    const fb = h('div', { 'data-role': 'item-result' });
    const revealed = !listen || (last && last.id === it.id) || m.status === 'passed';
    const play = (rate) => player.play({ key: it.audio, text: it.spoken }, rate ? { rate } : undefined);
    const what = it.layer === 'unit' ? 'a unidade' : 'a frase';
    clear(area).append(
      h('p', { class: 'vx-instruction', 'data-role': 'layer-instruction' }, icon(listen ? 'speaker' : 'book'),
        h('span', { text: listen ? `Ouça e escreva em inglês ${what} que você ouviu. O texto aparece depois do envio.` : `Leia ${what} e o significado. Depois, escreva em inglês.` })),
      h('div', { class: 'vx-chips' }, itemChips(order, p, phase, (id, i) => String(i + 1), current, (id) => { current = id; last = null; draw(); })),
      h('section', { class: 'card vx-card', 'data-role': 'layer-card', 'data-item': it.id, 'data-status': m.status, 'data-revealed': String(!!revealed) },
        h('div', { class: 'eyebrow', text: LAYER_EYEBROW(it) }),
        revealed ? h('div', { class: 'vx-en en', 'data-role': 'item-en', lang: 'en', text: it.say || it.en }) : null,
        revealed ? h('div', { class: 'vx-pt', 'data-role': 'item-pt', text: it.pt }) : null,
        revealed ? itemNote(it) : null,
        h('div', { class: 'row', style: { marginTop: revealed ? '0' : '6px' } },
          h('button', { class: `btn${listen ? ' primary vx-listen' : ''}`, type: 'button', 'data-role': 'listen-item', disabled: !hasAudio(it.audio), onclick: () => play() }, icon('speaker'), listen ? 'Ouvir' : 'Ouvir o modelo'),
          listen ? h('button', { class: 'btn ghost', type: 'button', disabled: !hasAudio(it.audio), onclick: () => play(0.75) }, icon('slow'), 'Mais devagar') : null),
        hasAudio(it.audio) ? null : h('div', { class: 'notice warn small', 'data-role': 'audio-missing', text: listen ? 'Áudio indisponível para este item: a etapa de escuta fica bloqueada.' : 'Áudio indisponível para este item.' }),
        h('div', { style: { marginTop: '14px' } }, input), send),
      fb);
    if (listen && !hasAudio(it.audio)) { input.disabled = true; send.disabled = true; }
    if (last && last.id === it.id) fb.append(writingFeedback(last.result, it, last.answer, targets(it)));
    else if (m.status === 'passed') fb.append(h('div', { class: 'chip ok', 'data-role': 'item-status', text: 'Aprovado' }));
    fb.append(triesBox(act, p, phase, it.id, async () => { current = (await skipAndNext(pack, act, p, phase, order, it.id)) || it.id; last = null; if (ctx.alive) draw(); }) || '');
    const next = nextAfter(act, order, p, phase, it.id);
    if (next && m.status !== 'unseen') fb.append(h('button', { class: `btn block${m.status === 'passed' ? ' primary' : ''} vx-next`, type: 'button', 'data-role': 'next-item', onclick: () => { current = next; last = null; draw(); } }, 'Próximo item', icon('next')));
    area.append(phaseFooter(pack, act, p, phase));
    send.onclick = async () => {
      const answer = input.value.trim();
      if (!answer) { toast('Escreva em inglês antes de enviar.'); return; }
      send.disabled = true;
      // a resposta esperada é a expressão em primeiro plano (forma falada, quando há); a notação do documento também é aceita
      const [target, ...variants] = targets(it);
      const result = scoreWriting(App.checker, answer, target, variants);
      addAttempt(p, { attemptId: newAttemptId(), phase, itemId: it.id, inputType: 'text', response: answer, result });
      settleCompletion(pack, act, p);
      await save();
      last = { id: it.id, result, answer };
      if (ctx.alive) draw();
    };
  };
  if (!items.length) { clear(area).append(h('p', { class: 'small muted', text: 'Esta etapa não tem conteúdo.' }), phaseFooter(pack, act, p, phase)); return; }
  draw();
}

/** Etapas em camadas → componente (as da etapa 7 são as fases de sempre). */
function layerRenderer(phaseId) {
  const unit = (fn) => (App, c) => fn(App, c, c.act.unitIds);
  const sent = (fn) => (App, c) => fn(App, c, c.act.sentenceIds);
  const speak = (ids, c, App, layer) => speakPhase(App, c, { phase: layer === 'unit' ? 'u-speak' : 's-speak', items: layerItems(c.pack, ids), eyebrow: LAYER_EYEBROW,
    instruction: `Ouça ${layer === 'unit' ? 'cada unidade' : 'cada frase'} ${LISTENS_REQUIRED} vezes até o fim. Depois, grave você dizendo.`, empty: 'Esta etapa não tem conteúdo.',
    maxMs: (it) => (it.layer === 'unit' ? 8000 : 15000), trim: (it) => trimForLine(it.spoken), maxExtra: 1 }); // curtas: alvo dentro de fala maior não aprova
  return {
    'u-write': unit((App, c, ids) => writePhase(App, c, { phase: 'u-write', ids, listen: false })),
    'u-speak': unit((App, c, ids) => speak(ids, c, App, 'unit')),
    'u-listen': unit((App, c, ids) => writePhase(App, c, { phase: 'u-listen', ids, listen: true })),
    's-write': sent((App, c, ids) => writePhase(App, c, { phase: 's-write', ids, listen: false })),
    's-speak': sent((App, c, ids) => speak(ids, c, App, 'sentence')),
    's-listen': sent((App, c, ids) => writePhase(App, c, { phase: 's-listen', ids, listen: true })),
  }[phaseId] || null;
}

// ---------- Fase 3: tradução ----------
function phaseTranslation(App, { pack, act, p, area, ctx }) {
  const ids = act.lines.map((l) => l.id);
  let current = nextItem(ids, p, 'translation') || ids[0];
  let last = null;
  const draw = () => {
    const l = act.lines.find((x) => x.id === current);
    const m = mastery(p, 'translation', l.id);
    const { blocker } = remote();
    // pendente: o campo fecha; sem serviço online, quem marcou “vou revisar” pode enviar outra tradução
    const locked = m.status === 'pending_evaluation' && !(!remote().config.endpoint && m.lastAttempt && m.lastAttempt.selfCheck && m.lastAttempt.selfCheck.value === 'review');
    const input = h('textarea', { class: 'field', rows: 3, 'data-role': 'answer', 'aria-label': 'Escreva a tradução em português', placeholder: 'Tradução em português' });
    const send = h('button', { class: 'btn primary block', type: 'button', 'data-role': 'submit', style: { marginTop: '10px' } }, icon('check'), 'Enviar tradução');
    const fb = h('div', { 'data-role': 'line-result' });
    clear(area).append(
      h('p', { class: 'small muted', 'data-role': 'translation-instruction', text: remote().config.endpoint
        ? `Traduza cada fala para o português. A correção é pelo sentido (avaliação online); cada fala precisa de ${THRESHOLD}%. A tradução de referência só aparece depois da avaliação.`
        : 'Traduza cada fala para o português. A correção automática pelo sentido depende de um serviço online que ainda não está ativo: depois de enviar, você compara com a tradução de referência. A fala fica pendente de avaliação — não conta como aprovada.' }),
      itemChips(ids, p, 'translation', (id, i) => String(i + 1), current, (id) => { current = id; last = null; draw(); }),
      h('section', { class: 'card', 'data-role': 'translation-card', 'data-line': l.id, 'data-status': m.status },
        h('div', { class: 'eyebrow', text: l.speaker }),
        h('div', { class: 'row nowrap' }, h('div', { class: 'grow en big-en', 'data-role': 'source', text: l.en }),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Ouvir', disabled: !hasAudio(l.audio), onclick: () => player.play({ key: l.audio, text: l.en }) }, icon('speaker'))),
        locked ? (remote().config.endpoint ? h('div', { class: 'notice warn small', 'data-role': 'pending-note', text: 'Sua tradução está salva e aguarda avaliação online.' }) : null) : h('div', { style: { marginTop: '10px' } }, input),
        locked ? null : send),
        m.status === 'pending_evaluation' && !remote().config.endpoint ? selfCompare(m.lastAttempt, l, () => draw()) : null,
      fb);
    // sem serviço configurado, a instrução já explica a limitação e a comparação mostra a situação (sem avisos repetidos)
    const noService = !remote().config.endpoint;
    if (blocker && m.status !== 'passed' && !(noService && blocker.code === 'not-configured')) fb.append(blockerCard(blocker, () => draw()));
    const tf = last && last.id === l.id && !(noService && m.status === 'pending_evaluation') ? translationFeedback(last.result, l) : m.status === 'passed' ? translationFeedback(m.passedAttempt, l) : null;
    if (tf) fb.append(tf);
    const next = nextItem(ids.filter((id) => id !== l.id), p, 'translation');
    if (next && (m.status !== 'unseen')) fb.append(h('button', { class: 'btn block', type: 'button', 'data-role': 'next-item', style: { marginTop: '10px' }, onclick: () => { current = next; last = null; draw(); } }, 'Próxima fala', icon('next')));
    area.append(phaseFooter(pack, act, p, 'translation'));
    send.onclick = async () => {
      const answer = input.value.trim();
      if (!answer) { toast('Escreva a tradução antes de enviar.'); return; }
      send.disabled = true;
      const attemptId = newAttemptId();
      const seen = Object.values(p.attempts).some((a) => a.phase === 'translation' && a.itemId === l.id && a.revealedAt);
      let local = localTranslation(answer, l);
      if (seen && local && local.status === 'passed') local = null; // referência já vista: igualdade com ela não é evidência
      addAttempt(p, { attemptId, phase: 'translation', itemId: l.id, inputType: 'text', response: answer, result: local || { status: 'pending', evaluationMode: 'remote_ai' } });
      await save(); // salva ANTES de qualquer envio: a resposta nunca se perde
      if (!local && !remote().blocker) {
        clear(fb).append(h('div', { class: 'small', role: 'status' }, h('span', { class: 'spinner', 'aria-hidden': 'true' }), ' Avaliando o sentido…'));
        await flushQueue({ force: true });
      }
      settleCompletion(pack, act, p);
      await save();
      last = { id: l.id, result: p.attempts[attemptId] };
      if (ctx.alive) draw();
    };
  };
  draw();
}

/**
 * Sem avaliador semântico (serviço online não configurado): mostra a resposta do aluno ao lado da tradução de referência
 * (autoral, não validada pelo professor) e registra uma autoavaliação. Nada é aprovado: a tentativa continua pendente.
 */
function selfCompare(a, l, redraw) {
  if (!a) return null;
  if (!a.revealedAt) { a.revealedAt = Date.now(); save(); }
  const mark = async (v) => { a.selfCheck = { value: v, at: Date.now() }; await save(); redraw(); };
  return h('section', { class: 'card flat', 'data-role': 'self-compare', style: { marginTop: '10px' } },
    h('div', { class: 'chip warn', 'data-role': 'pending-status', text: 'Pendente de avaliação · não conta como aprovada' }),
    h('div', { class: 'small', style: { marginTop: '8px' } }, h('span', { class: 'muted', text: 'Sua tradução: ' }), h('span', { 'data-role': 'my-translation', text: `“${a.response}”` })),
    h('div', { class: 'small', 'data-role': 'reference' }, h('span', { class: 'muted', text: 'Tradução de referência (autoral): ' }), l.pt),
    h('p', { class: 'tiny muted', text: 'Compare o sentido, não as palavras: outra forma de dizer a mesma coisa também está certa. Esta comparação não é uma nota.' }),
    a.selfCheck ? h('div', { class: 'small', 'data-role': 'self-check', 'data-value': a.selfCheck.value, text: a.selfCheck.value === 'ok' ? 'Você marcou: o sentido confere.' : 'Você marcou: vou revisar esta fala.' })
      : h('div', { class: 'row', 'data-role': 'self-check-actions' },
        h('button', { class: 'btn small', type: 'button', 'data-role': 'self-ok', onclick: () => mark('ok') }, icon('check'), 'O sentido confere'),
        h('button', { class: 'btn small ghost', type: 'button', 'data-role': 'self-review', onclick: () => mark('review') }, icon('refresh'), 'Vou revisar')));
}

function blockerCard(blocker, onChange) {
  const box = h('div', { class: 'notice warn small', 'data-role': 'remote-blocker', 'data-code': blocker.code, style: { marginTop: '10px' } }, blocker.text);
  if (blocker.code === 'consent') box.append(h('div', { class: 'row', style: { marginTop: '8px' } },
    h('button', { class: 'btn primary small', type: 'button', 'data-role': 'consent-yes', onclick: async () => { store.consent = { online: true, at: Date.now() }; await save(); await flushQueue({ force: true }); onChange(); } }, 'Autorizar envio'),
    h('button', { class: 'btn ghost small', type: 'button', onclick: () => box.remove() }, 'Agora não')));
  return box;
}

function translationFeedback(a, l) {
  if (!a) return null;
  if (a.status === 'pending') return statusFeedback({ status: 'pending', feedback: { summary: 'Resposta salva. A avaliação do sentido acontece online; nada foi decidido ainda.' } });
  const f = a.feedback || {};
  return statusFeedback(a, [
    f.preservedElements && f.preservedElements.length ? h('div', { class: 'small', text: `Preservou: ${f.preservedElements.join('; ')}` }) : null,
    f.omissions && f.omissions.length ? h('div', { class: 'small', text: `Omitiu: ${f.omissions.join('; ')}` }) : null,
    f.distortions && f.distortions.length ? h('div', { class: 'small', text: `Distorceu: ${f.distortions.join('; ')}` }) : null,
    f.naturalnessNotes && f.naturalnessNotes.length ? h('div', { class: 'small', text: `Naturalidade: ${f.naturalnessNotes.join('; ')}` }) : null,
    f.suggestedTranslation ? h('div', { class: 'small', text: `Sugestão: ${f.suggestedTranslation}` }) : null,
    h('div', { class: 'small', 'data-role': 'reference' }, h('span', { class: 'muted', text: 'Tradução de referência (autoral): ' }), l.pt),
    h('div', { class: 'tiny muted', text: a.evaluationMode === 'remote_ai' ? `Avaliação online · rubrica ${a.rubricVersion}` : 'Avaliação local (igual à referência ou resposta ainda em inglês).' }),
  ]);
}

// ---------- Fase 4: compreensão auditiva ----------
function phaseListening(App, { pack, act, p, area, ctx }) {
  const qs = questionsOf(pack, act);
  let answers = {};
  let shown = null; // rodada recém-corrigida
  let optional = false; // recuperação opcional das erradas depois de a fase estar aprovada
  let revealed = false;
  const draw = () => {
    const next = listeningNext(p, qs.length);
    const n = listensOf(p, 'listening');
    clear(area);
    area.append(h('p', { class: 'small muted', text: `Ouça o diálogo completo ${LISTENS_REQUIRED} vezes até o fim (pode anotar). Depois, responda às ${qs.length} ${qs.length === 1 ? 'questão' : 'questões'}; a rodada é aprovada com ${passMark(qs.length)}/${qs.length} (80%). A correção aparece só depois do envio.` }));
    const allAudio = act.lines.every((l) => hasAudio(l.audio));
    const now = h('div', { class: 'small muted', 'data-role': 'full-status' });
    const play = h('button', { class: 'btn primary', type: 'button', 'data-role': 'play-dialogue', disabled: !allAudio }, icon('play'), n ? 'Ouvir de novo' : 'Ouvir o diálogo completo');
    area.append(h('section', { class: 'card', 'data-role': 'listening-card' },
      h('div', { class: 'row' }, play, h('button', { class: 'btn ghost', type: 'button', onclick: () => player.stopAll() }, icon('stop'), 'Parar'),
        h('span', { class: 'small', 'data-role': 'listen-count', text: `Audições completas: ${Math.min(n, LISTENS_REQUIRED)}/${LISTENS_REQUIRED}` })),
      now,
      allAudio ? null : h('div', { class: 'notice warn small', 'data-role': 'audio-missing', text: 'Áudio indisponível para uma ou mais falas: a fase não pode ser feita.' }),
      h('label', { class: 'small muted', for: 'dlg-notes', text: 'Suas anotações (opcional, não são avaliadas)' }),
      notesField()));
    play.onclick = async () => {
      play.disabled = true;
      const ok = await playAll(act.lines.map((l) => ({ key: l.audio, text: l.en })), { onIndex: (i) => { now.textContent = i >= 0 ? `Tocando a fala ${i + 1} de ${act.lines.length}` : ''; } });
      if (!ctx.alive) return;
      if (ok) { recordListen(p, 'listening'); await save(); } else toast('Audição interrompida: não conta. Ouça até o fim.');
      draw();
    };
    if (next === 'none') {
      area.append(h('div', { class: 'notice small', 'data-role': 'questions-missing', text: 'Este diálogo não tem questões de compreensão.' }));
    } else if (shown) {
      area.append(roundFeedback(shown, qs));
    } else if (next === 'listen') {
      area.append(h('div', { class: 'small muted', 'data-role': 'questions-locked', text: `As questões aparecem depois da ${LISTENS_REQUIRED}ª audição completa.` }));
    } else if (next === 'full' || next === 'recovery' || optional) {
      const c = comprehension(p);
      const list = next === 'full' ? qs : qs.filter((q) => c.wrong.includes(q.id));
      area.append(questionForm(list, next === 'full' ? 'full' : 'recovery'));
    } else if (next === 'done') {
      const c = comprehension(p);
      area.append(h('div', { class: 'notice ok small', 'data-role': 'comprehension-done', text: `Compreensão: ${c.tally}/${c.total} questões acertadas${c.tally > c.round.correct ? ` (${c.round.correct} na rodada e ${c.tally - c.round.correct} na recuperação)` : ''}.` }));
      if (c.wrong.length) area.append(h('div', { class: 'row', style: { marginTop: '8px' } },
        h('button', { class: 'btn', type: 'button', 'data-role': 'optional-recovery', onclick: () => { optional = true; draw(); } }, icon('refresh'), `Refazer ${c.wrong.length === 1 ? 'a errada' : `as ${c.wrong.length} erradas`}`),
        h('button', { class: 'btn ghost', type: 'button', 'data-role': 'reveal-answers', onclick: () => { revealed = true; draw(); } }, 'Ver as respostas')));
      if (revealed) area.append(...qs.filter((q) => c.wrong.includes(q.id)).map((q) => answerCard(q, { correct: false, reveal: true })));
    }
    area.append(phaseFooter(pack, act, p, 'listening'));
  };
  function notesField() {
    const t = h('textarea', { class: 'field', id: 'dlg-notes', rows: 3, 'data-role': 'notes', oninput: (e) => { p.notes = e.target.value; db.putKv(STORE_KEY, store).catch(() => {}); } });
    t.value = p.notes || '';
    return t;
  }
  const questionForm = (list, kind) => {
    const form = h('section', { class: 'stack', 'data-role': 'questions', 'data-kind': kind });
    if (kind === 'recovery') form.append(h('div', { class: 'notice small', text: 'Recuperação: só as questões que você ainda não acertou. As que você já acertou continuam valendo.' }));
    list.forEach((q, i) => {
      const opts = orderedOptions(q, kind);
      form.append(h('div', { class: 'card', role: 'group', 'aria-labelledby': `q-${q.id}`, 'data-question': q.id },
        h('div', { class: 'dlg-q', id: `q-${q.id}`, text: `${i + 1}. ${q.prompt}` }),
        h('div', { class: 'options' }, opts.map((o) => h('button', { class: 'option', type: 'button', 'aria-pressed': String(answers[q.id] === o.id), 'data-option': o.id,
          onclick: (e) => { answers[q.id] = o.id; e.currentTarget.parentElement.querySelectorAll('.option').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.option === o.id))); } }, o.text)))));
    });
    form.append(h('button', { class: 'btn primary block', type: 'button', 'data-role': 'submit-round', onclick: async () => {
      const missing = list.filter((q) => !answers[q.id]).length;
      if (missing) { toast(`Responda todas as questões (${missing} sem resposta).`); return; }
      const round = gradeRound(list, answers, { kind });
      addRound(p, round);
      settleCompletion(pack, act, p);
      await save();
      shown = round; answers = {}; optional = false;
      if (ctx.alive) draw();
    } }, 'Enviar respostas'));
    return form;
  };
  /** Cartão de uma questão corrigida. Errada e ainda não acertada: só a pista (fala a reouvir), sem a resposta. */
  const answerCard = (q, { correct, reveal }) => {
    const right = q.options.find((o) => o.id === q.correctOptionId);
    const showAnswer = correct || reveal || questionMastered(p, q.id);
    const where = (q.sourceLineIds || []).map((id) => { const i = act.lines.findIndex((l) => l.id === id); return i >= 0 ? `fala ${i + 1} (${act.lines[i].speaker})` : null; }).filter(Boolean);
    return h('div', { class: 'card flat small', 'data-question': q.id, 'data-correct': String(correct), 'data-revealed': String(showAnswer) },
      h('b', { text: `${correct ? '✓' : '✗'} ${q.prompt}` }),
      showAnswer ? h('div', { text: `Resposta: ${right.text}` }) : null,
      showAnswer && q.explanation ? h('div', { class: 'muted', text: q.explanation }) : null,
      showAnswer ? null : h('div', { class: 'muted', 'data-role': 'hint', text: `Incorreta. Pista: ouça de novo ${where.length ? where.join(' e ') : 'o diálogo'} e tente na recuperação.` }));
  };
  const roundFeedback = (round, all) => {
    const c = comprehension(p);
    const head = round.kind === 'full'
      ? `${round.correct}/${round.total} — ${round.passed ? 'rodada aprovada' : `abaixo de ${passMark(round.total)}/${round.total}: refaça só as erradas`}`
      : `Recuperação: ${round.correct}/${round.total} · compreensão ${c.tally}/${c.total}${c.tally >= passMark(c.total) ? ' — aprovada' : ''}`;
    return h('section', { class: 'stack', 'data-role': 'round-result', 'data-kind': round.kind, 'data-passed': String(c.tally >= passMark(c.total)), 'data-correct': String(round.correct), 'data-tally': String(c.tally) },
      h('div', { class: `feedback ${c.tally >= passMark(c.total) ? 'good' : round.kind === 'full' ? 'bad' : 'mid'}` }, h('div', { class: 'head', text: head })),
      ...round.results.map((r) => answerCard(all.find((x) => x.id === r.questionId), { correct: r.correct, reveal: false })),
      h('button', { class: 'btn block', type: 'button', 'data-role': 'continue', onclick: () => { shown = null; draw(); } }, 'Continuar'));
  };
  const orderedOptions = (q, kind) => {
    const key = `opts:${q.id}:${p.rounds.length}`;
    if (!p.order[key]) { const o = q.options.map((x) => x.id); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } p.order[key] = o; }
    return p.order[key].map((id) => q.options.find((x) => x.id === id)).filter(Boolean);
  };
  draw();
}

// ---------- Fase 5: leitura em voz alta ----------
function phaseReading(App, { pack, act, p, area, ctx }) {
  const ids = act.lines.map((l) => l.id);
  let current = nextItem(ids, p, 'reading', { skipSkipped: isTolerant(act, 'reading') }) || nextItem(ids, p, 'reading') || ids[0];
  let last = null;
  const draw = () => {
    const l = act.lines.find((x) => x.id === current);
    const m = mastery(p, 'reading', l.id);
    const status = h('div', { class: 'wp-status', role: 'status', 'aria-live': 'polite', 'data-role': 'rec-status' });
    const recBtn = h('button', { class: 'btn primary block', type: 'button', 'data-role': 'record-line' }, icon('mic'), m.attemptCount ? 'Gravar de novo' : 'Gravar a leitura');
    const fb = h('div', { 'data-role': 'line-result' });
    clear(area).append(
      h('p', { class: 'small muted', text: `Leia cada fala em voz alta. Aprovação: ${THRESHOLD}% de correspondência confiável por fala. Transcrição duvidosa não reprova: fica inconclusiva.` }),
      itemChips(ids, p, 'reading', (id, i) => String(i + 1), current, (id) => { current = id; last = null; draw(); }),
      h('section', { class: 'card', 'data-role': 'reading-card', 'data-line': l.id, 'data-status': m.status },
        h('div', { class: 'eyebrow', text: l.speaker }),
        h('div', { class: 'big-en en', 'data-role': 'target', text: l.en }),
        h('div', { class: 'row', style: { marginTop: '8px' } },
          h('button', { class: 'btn ghost small', type: 'button', disabled: !hasAudio(l.audio), onclick: () => player.play({ key: l.audio, text: l.en }) }, icon('speaker'), 'Ouvir o modelo')),
        h('div', { style: { marginTop: '12px' } }, recBtn), status),
      fb);
    if (last && last.id === l.id) fb.append(statusFeedback(last.result, speechDetails(last.result, last.heard)));
    else if (m.status !== 'unseen') fb.append(h('div', { class: `chip ${ITEM_CHIP[m.status]}`, 'data-role': 'item-status', text: `${ITEM_LABEL[m.status]}${m.bestValidScore !== null ? ` · melhor ${m.bestValidScore}%` : ''}` }));
    fb.append(triesBox(act, p, 'reading', l.id, async () => { current = (await skipAndNext(pack, act, p, 'reading', ids, l.id)) || l.id; last = null; if (ctx.alive) draw(); }) || '');
    const next = nextAfter(act, ids, p, 'reading', l.id);
    if (next && m.status !== 'unseen') fb.append(h('button', { class: `btn block${m.status === 'passed' ? ' primary' : ''}`, type: 'button', 'data-role': 'next-item', style: { marginTop: '10px' }, onclick: () => { current = next; last = null; draw(); } }, 'Próxima fala', icon('next')));
    area.append(phaseFooter(pack, act, p, 'reading'));
    recBtn.onclick = async () => {
      if (!(await speechReady(status, App, () => draw()))) return;
      recBtn.disabled = true;
      const out = await recordAndEvaluate({ target: l.en, maxMs: 30000, trim: trimForLine(l.en), statusEl: status, ctx }); // fase 5: falas curtas recortadas
      if (!out || !ctx.alive) return;
      addAttempt(p, { attemptId: newAttemptId(), phase: 'reading', itemId: l.id, inputType: 'speech', response: out.heard, result: out.result });
      settleCompletion(pack, act, p);
      await save();
      last = { id: l.id, result: out.result, heard: out.heard };
      if (out.micError) toast(out.micError, 6000);
      draw();
    };
  };
  draw();
}

/** Diagnóstico/testes: estado em memória (não altera nada). */
export const _debug = () => ({ store, pending: store ? pendingTotal() : 0, queued: store ? Object.values(store.acts).flatMap((p) => pendingAttempts(p, Date.now(), { force: true })).length : 0 });
