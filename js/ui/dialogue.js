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
import {
  PHASES, THRESHOLD, LISTENS_REQUIRED, passMark, STORE_KEY, dialoguePack, activityById, itemsOf, questionsOf,
  requiredOf, contentProblems, emptyStore, validStore, actProgress, newAttemptId, recordListen, listensOf, canSpeakItem, addAttempt,
  mastery, gradeRound, addRound, listeningNext, comprehension, questionMastered, phaseStatuses, activityStatus, nextItem, phaseOrder, settleCompletion,
  activityReport, phaseById, pendingAttempts,
} from '../engine/dialogue.js';
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
    const next = pack.activities.find((a) => activityStatus(pack, a, actProgress(store, a)).state !== 'completed');
    const done = pack.activities.filter((a) => store.acts[a.id] && store.acts[a.id].completedAt).length;
    info.append(h('span', { class: 'muted', text: `${done} de ${pack.activities.length} diálogos concluídos` }), next ? ` · Próximo: ${partLabel(pack, next)} — ${next.title}` : '');
    const n = pendingTotal();
    if (n) info.append(h('div', { class: 'tiny muted', text: `${n} ${n === 1 ? 'tradução aguarda' : 'traduções aguardam'} avaliação online.` }));
  });
  return h('section', { class: 'card', style: { marginTop: '12px' }, 'data-role': 'dialogues-entry' },
    h('h3', { style: { margin: 0 }, text: pack.title }),
    h('p', { class: 'small muted', style: { margin: '2px 0 8px' }, text: 'Diálogos em cinco fases: vocabulário, escrita, tradução, compreensão e leitura em voz alta.' }),
    info,
    h('a', { class: 'btn block primary', href: '#/dialogues', style: { marginTop: '10px' }, 'data-role': 'open-dialogues' }, icon('chat'), 'Abrir'));
}
const partLabel = (pack, act) => `Parte ${act.partN}`;

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
        h('p', { class: 'small muted', text: 'Cada diálogo tem cinco fases em sequência. Cada palavra, frase ou fala precisa de 80% individualmente; a média não compensa um item abaixo do corte.' }));
      for (const part of pack.parts) {
        body.append(h('h2', { text: `Parte ${part.n} — ${part.title}` }));
        const list = h('ol', { class: 'stages', 'data-role': 'part', 'data-part': String(part.n) });
        for (const id of part.activityIds) {
          const act = activityById(pack, id);
          const st = activityStatus(pack, act, actProgress(store, act));
          list.append(h('li', { class: `stage ${st.state === 'completed' ? 'done' : 'open'}`, 'data-role': 'dialogue', 'data-id': act.id, 'data-state': st.state },
            h('a', { class: 'stage-row', href: `#/dialogue/${act.id}` },
              h('span', { class: `stage-mark ${st.state === 'completed' ? 'done' : 'open'}`, 'aria-hidden': 'true' }, st.state === 'completed' ? icon('check') : String(act.order)),
              h('div', { class: 'grow' },
                h('div', { class: 'stage-title' }, h('b', { text: act.title }), act.kind === 'supplementary' ? h('span', { class: 'small muted', text: ' · complementar' }) : null),
                h('div', { class: 'small muted', text: `${ACT_LABEL[st.state]} · ${st.done}/${PHASES.length} fases · ${act.lines.length} ${act.lines.length === 1 ? 'fala' : 'falas'}` })),
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
    h('p', { class: 'small', text: 'A tradução (fase 3) é corrigida pelo sentido, o que exige um serviço de avaliação na internet. Só o texto da sua resposta, a fala em inglês e o contexto do diálogo são enviados — nunca seu nome, gravações ou outros dados. Sem conexão ou sem autorização, a resposta fica salva aqui e pendente.' }),
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
  if (!act) { App.go('#/dialogues'); return null; }
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
          h('div', { class: 'row nowrap', style: { marginTop: '8px' } }, h('div', { class: 'grow' }, bar(st.ratio)), h('span', { class: 'small muted', 'data-role': 'phases-done', text: `${st.done}/${PHASES.length} fases` })),
          h('div', { class: 'small muted', 'data-role': 'activity-state', 'data-state': st.state, text: ACT_LABEL[st.state] })));
      const problems = contentProblems(pack, act, { hasAudio });
      if (problems.length) body.append(h('div', { class: 'notice warn small', 'data-role': 'content-problems' }, h('b', { text: 'Conteúdo pendente: ' }), problems.map((x) => x.text).join(' ')));
      // fases
      const list = h('ol', { class: 'stages', 'data-role': 'phases' });
      for (const s of st.phases) list.append(phaseRow(act, s));
      body.append(h('h3', { text: 'Fases' }), list);
      if (st.state === 'completed') body.append(resultCard(pack, act, p));
      // abas: diálogo, vocabulário, gramática (sob demanda)
      const tabs = h('div', { class: 'seg', role: 'tablist', style: { marginTop: '16px' } },
        ...[['dialogue', 'Diálogo'], ['vocab', 'Vocabulário'], ['grammar', 'Gramática']].map(([id, label]) =>
          h('button', { type: 'button', role: 'tab', 'aria-pressed': String(tab === id), 'data-tab': id, onclick: () => { tab = id; draw(); } }, label)));
      const panel = h('div', { 'data-role': `tab-${tab}`, style: { marginTop: '12px' } });
      body.append(tabs, panel);
      if (tab === 'dialogue') panel.append(dialogueList(pack, act, p));
      else if (tab === 'vocab') panel.append(vocabList(pack, act, p));
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
    h('div', { class: 'small muted', text: locked ? (s.id === 'reading' ? 'Bloqueada — conclua a fase 3 (tradução)' : 'Bloqueada — conclua a fase anterior') : `${STATE_LABEL[s.state]} · ${counter}` }));
  const attrs = { class: `stage ${cls}`, 'data-role': 'phase', 'data-phase': s.id, 'data-state': s.state };
  if (locked || s.state === 'not_applicable') return h('li', attrs, h('div', { class: 'stage-row', 'aria-disabled': 'true' }, mark, text));
  return h('li', attrs, h('a', { class: 'stage-row', href: `#/dphase/${act.id}?p=${s.id}`, 'aria-label': `${s.title}: ${STATE_LABEL[s.state]}` }, mark, text, icon('next')));
}

/** Falas: personagem, áudio individual e completo; inglês e português só depois das tentativas pertinentes. */
function dialogueList(pack, act, p) {
  const showEn = (l) => mastery(p, 'dictation', l.id).attemptCount > 0;
  const showPt = (l) => { const m = mastery(p, 'translation', l.id); return m.attemptCount > 0 && m.status !== 'pending_evaluation'; };
  const playing = h('div', { class: 'small muted', 'data-role': 'full-status' });
  const rows = act.lines.map((l) => h('li', { class: 'dlg-line', 'data-line': l.id },
    h('div', { class: 'row nowrap' },
      h('div', { class: 'grow' }, h('div', { class: 'dlg-speaker', text: l.speaker }),
        showEn(l) ? h('div', { class: 'en dlg-en', text: l.en }) : h('div', { class: 'small muted', text: 'Texto em inglês depois da fase 2 (escrita por escuta).' }),
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
  if (!act.notes.length) return h('p', { class: 'small muted', text: 'Sem notas de gramática nesta atividade.' });
  const clean = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1');
  return h('div', { class: 'stack' }, act.notes.map((n) => h('section', { class: 'card flat' }, n.split('\n').map((line) => {
    if (/^###\s/.test(line)) return h('h4', { style: { margin: '0 0 6px' }, text: clean(line.replace(/^###\s+/, '')) });
    if (/^\s*-\s/.test(line)) return h('div', { class: 'small', text: `• ${clean(line.replace(/^\s*-\s+/, ''))}` });
    return h('p', { class: 'small', style: { margin: '4px 0' }, text: clean(line) });
  }))));
}

function resultCard(pack, act, p) {
  const rep = activityReport(pack, act, p);
  const row = (label, list) => (list.length ? h('div', { class: 'small' }, h('b', { text: `${label}: ` }), `${list.filter((x) => x.status === 'passed').length}/${list.length} aprovados`,
    list.some((x) => x.repeated) ? h('span', { class: 'muted', text: ` · ${list.filter((x) => x.repeated).length} precisaram de repetição` }) : null) : null);
  return h('section', { class: 'card', 'data-role': 'activity-result', style: { marginTop: '12px' } },
    h('h3', { style: { marginTop: 0 }, text: 'Atividade concluída' }),
    row('Vocabulário', rep.vocab), row('Escrita por escuta', rep.dictation), row('Tradução', rep.translation),
    rep.comprehension ? h('div', { class: 'small', 'data-role': 'result-comprehension' }, h('b', { text: 'Compreensão: ' }), `${rep.comprehension.tally}/${rep.comprehension.total} (${rep.comprehension.firstRound} na rodada${rep.comprehension.recovered ? `, ${rep.comprehension.recovered} na recuperação` : ''})`) : null,
    row('Leitura em voz alta', rep.reading),
    h('p', { class: 'tiny muted', text: 'Os itens continuam voltando na revisão. O resultado é por item; não há pontos nem recompensas.' }));
}

// ---------------------------------------------------------------------------------------------------------
// Fases
// ---------------------------------------------------------------------------------------------------------
export function renderPhase(App, { arg, params }) {
  const pack = dialoguePack();
  const act = activityById(pack, arg);
  const ph = phaseById(params.p);
  if (!act || !ph) { App.go('#/dialogues'); return null; }
  const view = App.layout(`${ph.n}. ${ph.short} · ${act.title}`, { back: `#/dialogue/${act.id}`, nav: false });
  const body = h('div', { 'data-role': 'phase-screen', 'data-phase': ph.id, 'data-id': act.id });
  view.append(body);
  const ctx = { alive: true, cleanups: [] };
  if (ph.id === 'vocab' || ph.id === 'reading') loadLexicon(); // como no Speaking Lab: já no cache offline; distingue palavra inexistente de outra palavra do inglês
  loadStore().then(() => {
    const p = actProgress(store, act);
    const st = phaseStatuses(pack, act, p).find((x) => x.id === ph.id);
    if (st.state === 'locked') { App.go(`#/dialogue/${act.id}`); return; }
    const area = h('div', {});
    const R = { vocab: phaseVocab, dictation: phaseDictation, translation: phaseTranslation, listening: phaseListening, reading: phaseReading }[ph.id];
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
    done ? h('div', { class: 'notice ok', 'data-role': 'phase-done' }, icon('check'), ` ${phaseById(phaseId).title}: fase concluída.`) : null,
    s.state === 'pending_online' ? h('div', { class: 'notice warn small', 'data-role': 'phase-pending', text: 'Fase aguardando avaliação online das respostas pendentes. Ela será concluída quando todas forem avaliadas.' }) : null,
    h('a', { class: `btn block${done ? ' primary' : ''}`, href: `#/dialogue/${act.id}`, 'data-role': 'back-to-dialogue' }, icon('back'), 'Voltar ao diálogo'));
}

/** Lista compacta de itens da fase (chips): estado individual de cada item. */
function itemChips(ids, p, phase, label, current, onPick) {
  return h('div', { class: 'chips', 'data-role': 'item-chips', style: { margin: '8px 0' } }, ids.map((id, i) => {
    const m = mastery(p, phase, id);
    return h('button', { class: `chip ${ITEM_CHIP[m.status]}`, type: 'button', 'aria-pressed': String(id === current), 'data-item': id, 'data-status': m.status,
      'aria-label': `${label(id, i)}: ${ITEM_LABEL[m.status]}`, onclick: () => onPick(id) }, label(id, i));
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
export async function evaluateRecording(blob, { target, trim, alive = () => true }) {
  const analysis = await analyseBlob(blob).catch(() => null);
  const insufficient = !analysis || analysis.silent || analysis.speechSec < 0.3;
  const recognise = async (word, local = false) => {
    let asr = null, reason = '';
    try { asr = await asrEngine().transcribe(blob, { word, local }); } catch (e) { reason = `O reconhecimento falhou nesta gravação (${e.message}). Isso não conta como erro seu.`; }
    const integrity = asr && asr.segments ? transcriptIntegrity({ text: asr.text, segments: asr.segments, secs: asr.secs }) : null;
    const tailUnreliable = !!integrity && integrity.issues.some((x) => x.code === 'possibly-truncated' || x.code === 'lost-part');
    return { asr, result: evaluateSpeech(target, asr, { insufficient, tailUnreliable, reason }) };
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
async function recordAndEvaluate({ target, maxMs, trim, statusEl, ctx }) {
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
      const out = await evaluateRecording(blob, { target, trim, alive: () => ctx.alive });
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
function phaseVocab(App, { pack, act, p, area, ctx }) {
  const items = itemsOf(pack, act);
  const ids = items.map((x) => x.id);
  let current = nextItem(ids, p, 'vocab') || ids[0];
  let last = null;
  const draw = async () => {
    const it = items.find((x) => x.id === current);
    const m = mastery(p, 'vocab', it.id);
    const n = listensOf(p, `vocab:${it.id}`);
    const canSpeak = canSpeakItem(p, it.id);
    const status = h('div', { class: 'wp-status', role: 'status', 'aria-live': 'polite', 'data-role': 'rec-status' });
    const listenBtn = h('button', { class: 'btn primary', type: 'button', 'data-role': 'listen-item', disabled: !hasAudio(it.audio) }, icon('speaker'), 'Ouvir');
    const recBtn = h('button', { class: 'btn block', type: 'button', 'data-role': 'record-item', disabled: !canSpeak }, icon('mic'), m.attemptCount ? 'Gravar de novo' : 'Gravar minha pronúncia');
    const fb = h('div', { 'data-role': 'item-result' });
    clear(area).append(
      h('p', { class: 'small muted', text: `Ouça cada item ${LISTENS_REQUIRED} vezes até o fim; depois, grave você dizendo. Aprovação: ${THRESHOLD}% de correspondência em cada item.` }),
      itemChips(ids, p, 'vocab', (id, i) => String(i + 1), current, (id) => { current = id; last = null; draw(); }),
      h('section', { class: 'card', 'data-role': 'vocab-card', 'data-item': it.id, 'data-status': m.status },
        h('div', { class: 'eyebrow', text: TYPE_LABEL[it.type] || it.type }),
        h('div', { class: 'big-en en', 'data-role': 'item-en', text: it.en }),
        h('div', { class: 'small muted', text: `Significado no contexto: ${it.pt}` }),
        h('div', { class: 'row', style: { marginTop: '10px' } }, listenBtn,
          h('span', { class: 'small', 'data-role': 'listen-count', text: `Audições: ${Math.min(n, LISTENS_REQUIRED)}/${LISTENS_REQUIRED}` })),
        hasAudio(it.audio) ? null : h('div', { class: 'notice warn small', 'data-role': 'audio-missing', text: 'Áudio indisponível para este item: a produção oral fica bloqueada.' }),
        h('div', { style: { marginTop: '12px' } }, recBtn), status),
      fb);
    if (last && last.id === it.id) fb.append(statusFeedback(last.result, speechDetails(last.result, last.heard)));
    else if (m.status !== 'unseen') fb.append(h('div', { class: `chip ${ITEM_CHIP[m.status]}`, 'data-role': 'item-status', text: `${ITEM_LABEL[m.status]}${m.bestValidScore !== null ? ` · melhor ${m.bestValidScore}%` : ''}` }));
    if (m.status === 'passed' || (last && last.id === it.id)) fb.append(h('div', { class: 'card flat small', 'data-role': 'item-explanation', style: { marginTop: '8px' } },
      h('b', { text: it.en }), ` — ${it.pt}.`, it.sourceLineIds.length ? h('div', { class: 'muted', text: `Aparece em ${it.sourceLineIds.length} ${it.sourceLineIds.length === 1 ? 'fala' : 'falas'} deste diálogo.` }) : null));
    const next = nextItem(ids, p, 'vocab');
    if (next && next !== it.id && (m.status === 'passed')) fb.append(h('button', { class: 'btn primary block', type: 'button', 'data-role': 'next-item', style: { marginTop: '10px' }, onclick: () => { current = next; last = null; draw(); } }, 'Próximo item', icon('next')));
    area.append(phaseFooter(pack, act, p, 'vocab'));
    listenBtn.onclick = async () => {
      listenBtn.disabled = true;
      const r = await playOnce({ key: it.audio, text: it.spoken });
      if (!ctx.alive) return;
      if (r.completed) { recordListen(p, `vocab:${it.id}`); await save(); }
      draw();
    };
    recBtn.onclick = async () => {
      if (!(await speechReady(status, App, () => draw()))) return;
      recBtn.disabled = true;
      const out = await recordAndEvaluate({ target: it.spoken, maxMs: 8000, trim: true, statusEl: status, ctx }); // fase 1: sempre só o trecho com voz
      if (!out || !ctx.alive) return;
      const result = { ...out.result, rubricVersion: 'dre-speech-lexical-1' };
      addAttempt(p, { attemptId: newAttemptId(), phase: 'vocab', itemId: it.id, inputType: 'speech', response: out.heard, result });
      settleCompletion(pack, act, p);
      await save();
      last = { id: it.id, result, heard: out.heard };
      if (out.micError) toast(out.micError, 6000);
      draw();
    };
  };
  if (!items.length) { clear(area).append(h('p', { class: 'small muted', text: 'Esta atividade não tem itens de vocabulário nos documentos.' }), phaseFooter(pack, act, p, 'vocab')); return; }
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

// ---------- Fase 3: tradução ----------
function phaseTranslation(App, { pack, act, p, area, ctx }) {
  const ids = act.lines.map((l) => l.id);
  let current = nextItem(ids, p, 'translation') || ids[0];
  let last = null;
  const draw = () => {
    const l = act.lines.find((x) => x.id === current);
    const m = mastery(p, 'translation', l.id);
    const { blocker } = remote();
    const input = h('textarea', { class: 'field', rows: 3, 'data-role': 'answer', 'aria-label': 'Escreva a tradução em português', placeholder: 'Tradução em português' });
    const send = h('button', { class: 'btn primary block', type: 'button', 'data-role': 'submit', style: { marginTop: '10px' } }, icon('check'), 'Enviar tradução');
    const fb = h('div', { 'data-role': 'line-result' });
    clear(area).append(
      h('p', { class: 'small muted', text: `Traduza cada fala para o português. A correção é pelo sentido (avaliação online); cada fala precisa de ${THRESHOLD}%. A tradução de referência só aparece depois da avaliação.` }),
      itemChips(ids, p, 'translation', (id, i) => String(i + 1), current, (id) => { current = id; last = null; draw(); }),
      h('section', { class: 'card', 'data-role': 'translation-card', 'data-line': l.id, 'data-status': m.status },
        h('div', { class: 'eyebrow', text: l.speaker }),
        h('div', { class: 'row nowrap' }, h('div', { class: 'grow en big-en', 'data-role': 'source', text: l.en }),
          h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Ouvir', disabled: !hasAudio(l.audio), onclick: () => player.play({ key: l.audio, text: l.en }) }, icon('speaker'))),
        m.status === 'pending_evaluation' ? h('div', { class: 'notice warn small', 'data-role': 'pending-note', text: 'Sua tradução está salva e aguarda avaliação online.' }) : h('div', { style: { marginTop: '10px' } }, input),
        m.status === 'pending_evaluation' ? null : send),
      fb);
    if (blocker && m.status !== 'passed') fb.append(blockerCard(blocker, () => draw()));
    const tf = last && last.id === l.id ? translationFeedback(last.result, l) : m.status === 'passed' ? translationFeedback(m.passedAttempt, l) : null;
    if (tf) fb.append(tf);
    const next = nextItem(ids.filter((id) => id !== l.id), p, 'translation');
    if (next && (m.status !== 'unseen')) fb.append(h('button', { class: 'btn block', type: 'button', 'data-role': 'next-item', style: { marginTop: '10px' }, onclick: () => { current = next; last = null; draw(); } }, 'Próxima fala', icon('next')));
    area.append(phaseFooter(pack, act, p, 'translation'));
    send.onclick = async () => {
      const answer = input.value.trim();
      if (!answer) { toast('Escreva a tradução antes de enviar.'); return; }
      send.disabled = true;
      const attemptId = newAttemptId();
      const local = localTranslation(answer, l);
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
  let current = nextItem(ids, p, 'reading') || ids[0];
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
    const next = nextItem(ids.filter((id) => id !== l.id), p, 'reading');
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
