// Widget de gravação reutilizável: gravar → ouvir → regravar/excluir → comparar A/B → métricas locais.
// Cada exercício (targetId) tem um ciclo próprio: regravar substitui só a gravação dele; excluir apaga só ela.
import { h, icon, clear, toast, confirmSheet } from './dom.js';
import * as recorder from '../audio/recorder.js';
import * as player from '../audio/player.js';
import { analyseBlob, describe } from '../audio/analysis.js';
import { putRecording, getRecording, deleteRecording, updateRecordingMeta, backend } from '../store/db.js';
import { RETENTION_DAYS } from '../engine/retention.js';
import { recordRecording, forgetRecording } from '../engine/progress.js';

const fmtSec = (ms) => String(Math.round(ms / 100) / 10).replace('.', ',');
const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/**
 * opts: { targetId, reference: [{key,text}], expectedWords, referenceSec, maxMs,
 *         onStart(), onRecorded(blob, analysis), onLoaded(saved {blob, meta, at}), onDeleted() }
 */
export function recWidget(App, opts) {
  const { targetId, reference = [], expectedWords = 0, referenceSec = 0, maxMs = 180000 } = opts;
  let session = null, blob = null, meta = null, url = null, startedAt = 0, timer = null, destroyed = false;
  const recBtn = h('button', { class: 'rec-btn', type: 'button', 'aria-label': 'Gravar minha voz' }, icon('mic'));
  const title = h('div', { class: 'rec-title', text: 'Gravar minha voz' });
  const time = h('div', { class: 'small muted', text: 'Toque no microfone para começar' });
  const meterFill = h('i');
  const meter = h('div', { class: 'meter hidden', 'aria-hidden': 'true' }, meterFill);
  const after = h('div', { class: 'rec-after hidden' });
  const canvas = h('canvas', { class: 'wave', width: 600, height: 48, 'aria-hidden': 'true' });
  const metrics = h('div', { class: 'small' });
  const audioEl = h('audio', { preload: 'auto' });
  // “Minha voz”: o botão mostra o estado REAL do elemento (tocando ↔ pausado), não um palpite
  const mineBtn = h('button', { class: 'btn small', type: 'button', 'data-role': 'mine' });
  const drawMine = () => {
    const playing = !audioEl.paused && !audioEl.ended;
    clear(mineBtn).append(icon(playing ? 'pause' : 'play'), playing ? 'Pausar minha voz' : 'Minha voz');
    mineBtn.setAttribute('aria-pressed', String(playing));
  };
  const MEDIA_EVENTS = ['play', 'playing', 'pause', 'ended', 'emptied'];
  MEDIA_EVENTS.forEach((ev) => audioEl.addEventListener(ev, drawMine));
  drawMine();
  mineBtn.addEventListener('click', () => {
    if (!audioEl.paused && !audioEl.ended) audioEl.pause(); // pausa e mantém a posição
    else if (audioEl.src) player.playElement(audioEl); // retoma de onde parou (ou do início, se terminou)
  });

  const el = h('div', { class: 'card rec-panel' },
    h('div', { class: 'rec-main' }, recBtn, h('div', { class: 'rec-info' }, title, time, meter)),
    after);

  recBtn.addEventListener('click', () => (session ? stop() : start()));

  const setIdle = (hasRec) => {
    title.textContent = hasRec ? 'Gravar novamente' : 'Gravar minha voz';
    recBtn.setAttribute('aria-label', hasRec ? 'Gravar novamente' : 'Gravar minha voz');
  };

  async function start() {
    if (session || destroyed) return;
    player.stopAll();
    // o microfone leva um instante para abrir (no Android, centenas de milissegundos): falar antes disso corta o início
    // da primeira palavra e o reconhecedor a marca mesmo com a pronúncia certa — por isso o aviso só sai quando grava
    const prevTitle = title.textContent;
    title.textContent = 'Preparando o microfone… espere';
    recBtn.disabled = true;
    try {
      session = await recorder.start({ maxMs, onLevel: (v) => { meterFill.style.width = `${Math.round(v * 100)}%`; } });
    } catch (e) {
      title.textContent = prevTitle;
      recBtn.disabled = false;
      toast(e.userMessage || 'Não foi possível gravar.', 6000);
      return;
    } finally { if (!destroyed) recBtn.disabled = false; }
    recBtn.classList.add('on');
    recBtn.setAttribute('aria-label', 'Parar gravação');
    clear(recBtn).append(icon('stop'));
    meter.classList.remove('hidden');
    el.classList.add('recording');
    startedAt = Date.now();
    title.textContent = 'Gravando… 0:00';
    time.textContent = 'Fale agora. Toque no botão para parar.';
    if (opts.onStart) { try { opts.onStart(); } catch (e) { /* o feedback opcional nunca bloqueia a gravação */ } }
    timer = setInterval(() => { title.textContent = `Gravando… ${clock(Math.round((Date.now() - startedAt) / 1000))}`; }, 250);
    session.stopped.then(onStopped);
  }
  function stop() { if (session) session.stop(); }

  async function onStopped(res) {
    clearInterval(timer);
    session = null;
    if (destroyed) {
      // a tela foi fechada durante a gravação: a gravação é preservada (salva), sem recriar a interface
      if (targetId && backend === 'indexeddb') {
        try { await putRecording(targetId, res.blob, { ms: res.ms }); recordRecording(App.state, targetId, { ms: res.ms }); App.save(); } catch (e) { /* a anterior continua */ }
      }
      return;
    }
    recBtn.classList.remove('on');
    el.classList.remove('recording');
    clear(recBtn).append(icon('mic'));
    meter.classList.add('hidden');
    setIdle(true);
    blob = res.blob;
    meta = { ms: res.ms };
    player.releaseElement(audioEl);
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    audioEl.src = url;
    time.textContent = `Gravação de ${fmtSec(res.ms)} s`;
    const mine = blob;
    const analysis = await analyseBlob(blob, { expectedWords, referenceSec });
    if (destroyed || mine !== blob) return;
    drawWave(canvas, analysis ? analysis.envelope : []);
    showMetrics(analysis);
    showAfter();
    meta = { ...meta, analysis: analysis && { ...analysis, envelope: undefined } };
    if (targetId) {
      try { if (backend === 'indexeddb') await putRecording(targetId, blob, meta); } catch (e) {
        // a transação não foi confirmada: a gravação anterior (se houver) continua salva
        toast('Não foi possível salvar esta gravação no aparelho (pouco espaço?). A gravação anterior foi mantida.', 6000);
      }
      const r = recordRecording(App.state, targetId, { ms: res.ms });
      App.save();
    }
    opts.onRecorded && opts.onRecorded(blob, analysis);
  }

  function showMetrics(analysis) {
    clear(metrics).append(...describe(analysis, { expectedWords }).lines.map((l) => h('div', { text: '• ' + l })),
      h('div', { class: 'tiny muted', style: { marginTop: '4px' }, text: 'Medido no aparelho. Não avalia a pronúncia dos sons.' }));
  }

  function showAfter() {
    clear(after).append(canvas,
      h('div', { class: 'row rec-actions' },
        mineBtn,
        reference.length ? h('button', { class: 'btn small', type: 'button', onclick: () => playRef() }, icon('speaker'), 'Referência') : null,
        reference.length ? h('button', { class: 'btn small', type: 'button', onclick: () => ab() }, icon('ab'), 'Comparar A/B') : null),
      h('div', { class: 'rec-secondary' },
        h('details', { class: 'more' }, h('summary', { text: 'Ritmo e pausas' }), metrics),
        targetId ? h('button', { class: 'link-btn danger', type: 'button', onclick: () => askDelete() }, icon('trash'), 'Excluir gravação') : null));
    after.classList.remove('hidden');
  }

  const playRef = () => player.playSequence(reference);
  async function ab() {
    player.stopAll();
    const done = await player.playSequence(reference);
    if (!done || destroyed) return;
    const g = player.generation();
    await new Promise((r) => setTimeout(r, 400));
    // se algo parou o áudio no intervalo (outra reprodução, troca de tela), a parte B não começa
    if (destroyed || g !== player.generation()) return;
    player.playElement(audioEl, { restart: true });
  }

  async function askDelete() {
    if (session || !blob) return;
    const ok = await confirmSheet('Excluir esta gravação?', 'Só a gravação deste exercício será apagada. Suas outras gravações e seu progresso continuam.', { ok: 'Excluir', danger: true });
    if (!ok || destroyed) return;
    await remove();
  }

  /** Apaga a gravação deste exercício (somente dele) e volta ao estado inicial. */
  async function remove() {
    player.releaseElement(audioEl);
    if (url) { URL.revokeObjectURL(url); url = null; }
    blob = null; meta = null;
    if (targetId) {
      await deleteRecording(targetId);
      forgetRecording(App.state, targetId);
      App.save();
    }
    after.classList.add('hidden');
    clear(after);
    setIdle(false);
    time.textContent = 'Gravação excluída · toque no microfone para gravar';
    opts.onDeleted && opts.onDeleted();
  }

  /** Guarda um dado junto da gravação (ex.: resultado da análise). Ignora se a gravação já mudou. */
  async function updateMeta(forBlob, patch) {
    if (destroyed || !targetId || forBlob !== blob) return;
    meta = { ...(meta || {}), ...patch };
    try { await updateRecordingMeta(targetId, patch); } catch (e) { /* ok */ } // só o texto: o áudio não é regravado
  }

  // gravação anterior salva
  if (targetId) {
    getRecording(targetId).then((rec) => {
      if (!rec || blob || destroyed || session) return;
      if (!rec.blob) {
        // áudio apagado pela retenção automática; transcrição e análise continuam salvas
        setIdle(true);
        time.textContent = `O áudio desta gravação foi apagado automaticamente após ${RETENTION_DAYS} dias. O resultado continua salvo.`;
        meta = rec.meta || null;
        opts.onLoaded && opts.onLoaded(rec);
        return;
      }
      blob = rec.blob;
      meta = rec.meta || null;
      url = URL.createObjectURL(blob);
      audioEl.src = url;
      setIdle(true);
      time.textContent = `Última gravação salva (${new Date(rec.at).toLocaleDateString('pt-BR')})`;
      showAfter();
      analyseBlob(blob, { expectedWords, referenceSec }).then((a) => {
        if (destroyed || rec.blob !== blob) return;
        drawWave(canvas, a ? a.envelope : []);
        showMetrics(a);
      });
      opts.onLoaded && opts.onLoaded(rec);
    });
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    if (session) session.cancel(); // encerra o microfone; a gravação em curso é salva em onStopped
    clearInterval(timer);
    player.releaseElement(audioEl); // para “Minha voz” (se estiver tocando) e libera o decodificador
    MEDIA_EVENTS.forEach((ev) => audioEl.removeEventListener(ev, drawMine));
    if (url) { URL.revokeObjectURL(url); url = null; }
  }

  return { el, start, stop, getBlob: () => blob, getMeta: () => meta, updateMeta, isRecording: () => !!session, remove, destroy, audioEl };
}

function drawWave(canvas, env) {
  const g = canvas.getContext('2d');
  g.clearRect(0, 0, canvas.width, canvas.height);
  if (!env || !env.length) return;
  const max = Math.max(...env, 0.0001);
  g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent') || '#1d4e89';
  const step = canvas.width / env.length;
  env.forEach((v, i) => { const hh = Math.max(2, (v / max) * canvas.height); g.fillRect(i * step, (canvas.height - hh) / 2, Math.max(1, step - 1), hh); });
}
