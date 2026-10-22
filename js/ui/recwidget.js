// Widget de gravação reutilizável: gravar → ouvir → regravar → comparar A/B → métricas locais.
import { h, icon, clear, toast } from './dom.js';
import * as recorder from '../audio/recorder.js';
import * as player from '../audio/player.js';
import { analyseBlob, describe } from '../audio/analysis.js';
import { putRecording, getRecording, backend } from '../store/db.js';
import { recordRecording } from '../engine/progress.js';

/**
 * opts: { targetId, reference: [{key,text}], expectedWords, referenceSec, maxMs, onStart(), onRecorded(blob, analysis) }
 */
export function recWidget(App, opts) {
  const { targetId, reference = [], expectedWords = 0, referenceSec = 0, maxMs = 180000 } = opts;
  let session = null, blob = null, url = null, startedAt = 0, timer = null, destroyed = false;
  const recBtn = h('button', { class: 'rec-btn', 'aria-label': 'Gravar' }, icon('mic'));
  const time = h('div', { class: 'small muted', text: 'Toque para gravar' });
  const meterFill = h('i');
  const meter = h('div', { class: 'meter hidden', 'aria-hidden': 'true' }, meterFill);
  const after = h('div', { class: 'stack hidden', style: { marginTop: '12px' } });
  const canvas = h('canvas', { class: 'wave', width: 600, height: 56, 'aria-hidden': 'true' });
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

  const el = h('div', { class: 'card flat' },
    h('div', { class: 'row nowrap' }, recBtn, h('div', { style: { flex: 1, minWidth: 0 } }, time, meter)),
    after);

  recBtn.addEventListener('click', () => (session ? stop() : start()));

  async function start() {
    player.stopAll();
    try {
      session = await recorder.start({ maxMs, onLevel: (v) => { meterFill.style.width = `${Math.round(v * 100)}%`; } });
    } catch (e) {
      toast(e.userMessage || 'Não foi possível gravar.', 6000);
      return;
    }
    recBtn.classList.add('on');
    recBtn.setAttribute('aria-label', 'Parar gravação');
    clear(recBtn).append(icon('stop'));
    meter.classList.remove('hidden');
    startedAt = Date.now();
    if (opts.onStart) { try { opts.onStart(); } catch (e) { /* o feedback opcional nunca bloqueia a gravação */ } }
    timer = setInterval(() => { time.textContent = `Gravando… ${Math.round((Date.now() - startedAt) / 1000)}s · toque para parar`; }, 250);
    session.stopped.then(onStopped);
  }
  function stop() { if (session) session.stop(); }

  async function onStopped(res) {
    clearInterval(timer);
    session = null;
    if (destroyed) {
      // a tela foi fechada durante a gravação: a gravação é preservada (salva), sem recriar a interface
      if (targetId && backend === 'indexeddb') { try { await putRecording(targetId, res.blob, { ms: res.ms }); } catch (e) { /* ok */ } }
      return;
    }
    recBtn.classList.remove('on');
    recBtn.setAttribute('aria-label', 'Gravar novamente');
    clear(recBtn).append(icon('mic'));
    meter.classList.add('hidden');
    blob = res.blob;
    player.releaseElement(audioEl);
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(blob);
    audioEl.src = url;
    time.textContent = `Gravação de ${String(Math.round(res.ms / 100) / 10).replace('.', ',')} s · toque no microfone para regravar`;
    const analysis = await analyseBlob(blob, { expectedWords, referenceSec });
    if (destroyed) return;
    drawWave(canvas, analysis ? analysis.envelope : []);
    const d = describe(analysis, { expectedWords });
    clear(metrics).append(...d.lines.map((l) => h('div', { text: '• ' + l })),
      h('div', { class: 'tiny muted', style: { marginTop: '4px' }, text: 'Métricas de ritmo e pausas medidas no aparelho. Não avaliam a pronúncia dos sons.' }));
    showAfter();
    if (targetId) {
      try { if (backend === 'indexeddb') await putRecording(targetId, blob, { ms: res.ms, analysis: analysis && { ...analysis, envelope: undefined } }); } catch (e) { /* segue sem salvar */ }
      const r = recordRecording(App.state, targetId, { ms: res.ms });
      App.save();
      if (r.xp) toast(`+${r.xp} XP pela prática oral`);
    }
    opts.onRecorded && opts.onRecorded(blob, analysis);
  }

  function showAfter() {
    clear(after).append(canvas,
      h('div', { class: 'row' },
        mineBtn,
        reference.length ? h('button', { class: 'btn small', onclick: () => playRef() }, icon('speaker'), 'Referência') : null,
        reference.length ? h('button', { class: 'btn small', onclick: () => ab() }, icon('ab'), 'Comparar A/B') : null),
      metrics);
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

  // gravação anterior salva
  if (targetId) {
    getRecording(targetId).then((rec) => {
      if (!rec || blob || destroyed) return;
      blob = rec.blob;
      url = URL.createObjectURL(blob);
      audioEl.src = url;
      time.textContent = `Última gravação salva (${new Date(rec.at).toLocaleDateString('pt-BR')}) · toque para gravar de novo`;
      analyseBlob(blob, { expectedWords, referenceSec }).then((a) => {
        if (destroyed) return;
        drawWave(canvas, a ? a.envelope : []);
        clear(metrics).append(...describe(a, { expectedWords }).lines.map((l) => h('div', { text: '• ' + l })));
        showAfter();
      });
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

  return { el, stop, getBlob: () => blob, isRecording: () => !!session, destroy, audioEl };
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
