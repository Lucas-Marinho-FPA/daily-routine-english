// Curso — Atividades → Praticar: práticas complementares de uma atividade importada (vocabulário e expressões, escuta,
// fala e tradução reversa). Regras e geração em engine/coursepractice.js. Tudo roda no aparelho: o texto importado e
// as respostas não saem dele. O progresso das práticas fica no kv 'course-practice' (separado da tradução, kv 'course',
// e do estado de estudo das jornadas). Nada aqui altera respostas, validações do professor ou a exportação.
import { h, icon, toast, bar, clear } from './dom.js';
import { getKv, putKv } from '../store/db.js';
import { loadGlossary } from '../engine/glossary.js';
import { loadLexicon } from '../engine/lexicon.js';
import { evaluateWords } from '../engine/wordfeedback.js';
import * as player from '../audio/player.js';
import * as recorder from '../audio/recorder.js';
import * as localasr from '../audio/localasr.js';
import { analyseBlob } from '../audio/analysis.js';
import { asrOffNotice } from './asrsetup.js';
import { loadCourse } from './course.js';
import {
  PRACTICE_KEY, MODES, MAX_WORDS, VIA_LABEL, teacherConfirmed, extractItems, candidates, makeExercise,
  checkMeaning, checkCloze, checkReverse, validProgress, actProgress, record, buildQueue, startSession, sessionOpen,
  sessionErrors, practiceSummary,
} from '../engine/coursepractice.js';

const href = (id, q = '') => `#/cpr/${encodeURIComponent(id)}${q}`;
const RESULT = {
  good: { cls: 'ok', text: 'Certo' }, ok: { cls: 'ok', text: 'Aceito, com ressalva' }, bad: { cls: 'bad', text: 'Não confere' },
  unverified: { cls: 'warn', text: 'Sem evidência para corrigir (não conta como erro)' },
};
const srcText = (s) => (s ? `Origem: questão ${s.q}, ${s.b === 0 ? 'título da questão' : `bloco ${s.b + 1}`}` : '');

let progress = null;
async function loadProgress() {
  if (!progress) progress = validProgress(await getKv(PRACTICE_KEY).catch(() => null));
  return progress;
}
function saveProgress() {
  return putKv(PRACTICE_KEY, progress).catch((e) => { console.error('Falha ao salvar a prática', e); toast('Não foi possível salvar a prática.'); });
}

/** Rota #/cpr/<id da atividade>: início da prática (sem ?s) ou a sessão em andamento (?s=1). */
export function renderCoursePractice(App, r) {
  const view = App.layout('Praticar', { back: '#/course' });
  let alive = true;
  let cleanupEx = null;
  view.append(h('p', { class: 'muted small', text: 'Carregando…' }));
  Promise.all([loadCourse(), loadProgress(), loadGlossary(), loadLexicon()]).then(([d]) => {
    if (!alive) return;
    clear(view);
    const act = d.activities[r.arg];
    if (!act) { view.append(h('div', { class: 'notice bad' }, 'Atividade não encontrada neste aparelho. ', h('a', { href: '#/course', text: 'Voltar' }))); return; }
    const acts = Object.values(d.activities);
    const items = extractItems(act, teacherConfirmed(acts));
    const cand = candidates(act, items);
    const ap = actProgress(progress, act.id);
    if (r.params.s && sessionOpen(ap)) runSession(act, cand, ap);
    else if (r.params.s && ap.session) endOfSession(act, cand, ap);
    else home(act, cand, ap);
  });

  // ---------- início: tipos de prática e progresso ----------
  function home(act, cand, ap) {
    const s = practiceSummary(ap, cand);
    const n = (skills) => skills.reduce((t, k) => t + (cand.counts[k] || 0), 0);
    const start = (mode) => {
      const keys = buildQueue(cand, ap, mode);
      if (!keys.length) return;
      startSession(ap, mode, keys);
      saveProgress().then(() => App.go(href(act.id, '?s=1')));
    };
    const modeBtn = (mode, count, why) => h('div', { style: { marginTop: '10px' } },
      h('button', { class: 'btn block', 'data-role': `mode-${mode}`, disabled: !count, onclick: () => start(mode) },
        h('span', { class: 'grow', style: { textAlign: 'left' }, text: MODES[mode].label }), h('span', { class: 'small muted', text: count ? `${count}` : '—' })),
      !count && why ? h('p', { class: 'tiny muted', style: { margin: '4px 2px 0' }, text: why }) : null);
    const validated = act.questions.filter((q) => act.teacher[q.n] && act.teacher[q.n].validatedAt).length;
    view.append(...[
      h('section', { class: 'card', 'data-role': 'practice-head' },
        h('div', { class: 'small muted', text: act.title }),
        h('p', { class: 'small', style: { margin: '6px 0' }, text: 'Práticas para fixar o vocabulário, as expressões e as frases desta atividade. A tradução continua sendo a atividade principal: nada aqui muda as suas respostas, as correções do professor ou a exportação.' }),
        h('div', { class: 'small', 'data-role': 'practice-summary' },
          `Praticados: ${s.practised} de ${s.available} exercícios possíveis · para revisar hoje: ${s.due} · com erro: ${s.errors}`),
        h('div', { class: 'small muted', text: `Tentativas: ${s.stats.attempts} · certas: ${s.stats.good + s.stats.ok} · erros: ${s.stats.bad} · sem evidência: ${s.stats.unverified}` }),
        h('a', { class: 'btn block', href: `#/cq/${encodeURIComponent(act.id)}`, style: { marginTop: '10px' }, 'data-role': 'back-to-activity' }, icon('back'), 'Voltar à tradução')),
      sessionOpen(ap) ? h('button', { class: 'btn primary block', style: { marginTop: '12px' }, 'data-role': 'resume-practice', onclick: () => App.go(href(act.id, '?s=1')) },
        icon('play'), `Continuar a prática (${MODES[ap.session.mode].label}, ${ap.session.i + 1} de ${ap.session.keys.length})`) : null,
      h('section', { class: 'card', style: { marginTop: '12px' }, 'data-role': 'practice-modes' },
        h('h3', { style: { margin: 0 }, text: 'Escolha a prática' }),
        modeBtn('vocab', n(MODES.vocab.skills), 'Nenhum vocabulário com sentido confirmado nesta atividade ainda.'),
        modeBtn('listen', n(MODES.listen.skills), 'Poucas frases ou expressões distintas para montar as alternativas.'),
        modeBtn('speak', n(MODES.speak.skills), 'Nenhuma frase curta o bastante para a fala.'),
        modeBtn('rev', n(MODES.rev.skills), validated ? 'Sem blocos validados pelo professor curtos o bastante.' : 'Disponível só nas questões validadas pelo professor (nenhuma nesta atividade ainda).'),
        modeBtn('errors', s.errors, 'Nenhum erro para repetir.')),
      h('p', { class: 'tiny muted', style: { marginTop: '10px' }, 'data-role': 'practice-sources',
        text: `Gerado neste aparelho a partir do texto importado. Significados: só os confirmados na versão validada pelo professor ou no glossário do app (orientação de estudo, não é resposta oficial). Escuta e fala usam a voz do sistema do aparelho, não gravações do curso. Frases com até ${MAX_WORDS} palavras.` })].filter(Boolean)); // append nativo escreveria “null”
  }

  // ---------- sessão: um exercício por vez ----------
  function runSession(act, cand, ap) {
    const sess = ap.session;
    const key = sess.keys[sess.i];
    const ex = makeExercise(act, cand, key);
    if (!ex) { sess.i++; saveProgress().then(() => (alive ? (sessionOpen(ap) ? runSession(act, cand, ap) : endOfSession(act, cand, ap)) : null)); return; }
    clear(view);
    let moved = false;
    const next = () => { if (moved) return; moved = true; sess.i++; saveProgress().then(() => { if (!alive) return; if (cleanupEx) { cleanupEx(); cleanupEx = null; } clear(view); if (sessionOpen(ap)) runSession(act, cand, ap); else endOfSession(act, cand, ap); }); };
    const fb = h('div', { 'data-role': 'feedback', 'aria-live': 'polite' });
    const nextBtn = h('button', { class: 'btn primary block hidden', style: { marginTop: '12px' }, 'data-role': 'next', onclick: next }, sess.i + 1 < sess.keys.length ? 'Próxima' : 'Ver resultado');
    let answered = false;
    const done = (result, ...extra) => {
      if (answered) return;
      answered = true;
      if (result && result !== 'empty') { record(progress, act.id, key, result); sess.results[key] = result; }
      const R = RESULT[result];
      fb.replaceChildren(R ? h('div', { class: `notice ${R.cls}`, 'data-role': 'result', 'data-result': result }, h('b', { text: R.text }), ...extra) : h('div', { class: 'notice' }, ...extra));
      nextBtn.classList.remove('hidden');
      saveProgress();
    };
    view.append(
      h('div', { class: 'row nowrap small' }, h('span', { class: 'chip accent', 'data-role': 'skill', text: ex.label }), h('span', { class: 'grow' }), h('b', { 'data-role': 'step', text: `${sess.i + 1} de ${sess.keys.length}` })),
      bar(sess.i / sess.keys.length),
      h('section', { class: 'card', style: { marginTop: '10px' }, 'data-role': 'exercise', 'data-skill': ex.skill }, ...body(ex, done)),
      fb, nextBtn,
      h('div', { class: 'row', style: { marginTop: '12px' } },
        h('a', { class: 'btn small ghost', href: href(act.id), 'data-role': 'pause' }, 'Pausar (continua depois)'),
        nextBtn.classList.contains('hidden') ? h('button', { class: 'btn small ghost', 'data-role': 'skip', onclick: next }, 'Pular') : null),
      h('p', { class: 'tiny muted', text: srcText(ex.src) }));
  }

  function body(ex, done) {
    const listenBtn = (text, label = 'Ouvir') => h('button', { class: 'btn small', type: 'button', 'data-role': 'play', onclick: () => say(text) }, icon('speaker'), label);
    const options = (opts, onPick) => {
      const box = h('div', { class: 'options', 'data-role': 'options' });
      opts.forEach((o) => box.append(h('button', { class: 'option', 'data-correct': o.correct ? '1' : '0', text: o.text, onclick: (e) => {
        if (box.dataset.done) return;
        box.dataset.done = '1';
        box.querySelectorAll('button').forEach((b) => { b.disabled = true; if (b.dataset.correct === '1') b.classList.add('right'); });
        if (!o.correct) e.currentTarget.classList.add('wrong');
        onPick(o);
      } })));
      return box;
    };
    const field = (lang, placeholder, role) => h('input', { class: 'field', lang, placeholder, autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'data-role': role });
    const meaningNote = (it) => (it.reliable ? h('div', { class: 'small', style: { marginTop: '4px' } }, `Sentido: ${it.meanings.slice(0, 4).join(' / ')} `, h('span', { class: 'muted', text: `(${VIA_LABEL[it.via]})` })) : null);
    switch (ex.skill) {
      case 'mean': return [
        h('p', { class: 'small muted', text: 'O que significa no texto?' }),
        h('div', { class: 'row nowrap' }, h('h2', { lang: 'en', class: 'grow', style: { margin: 0 }, text: ex.en }), listenBtn(ex.en)),
        h('p', { lang: 'en', class: 'small', style: { margin: '6px 0 10px' }, text: ex.context }),
        options(ex.options, (o) => done(o.correct ? 'good' : 'bad', meaningNote(ex.item)))];
      case 'recall': return [
        h('p', { class: 'small muted', text: 'Qual expressão do texto tem este sentido?' }),
        h('h2', { style: { margin: '0 0 10px' }, text: ex.pt }),
        options(ex.options, (o) => done(o.correct ? 'good' : 'bad', h('div', { lang: 'en', text: `Resposta: ${ex.item.en}` })))];
      case 'cloze': {
        const inp = field('en', ex.first ? `Começa com “${ex.first}” (${ex.letters} letras)` : 'Escreva em inglês', 'cloze-input');
        const check = () => { const c = checkCloze(ex.answer, inp.value); if (c.result === 'empty') return; inp.disabled = true; done(c.result, h('div', { lang: 'en', text: `No texto: “${ex.answer}”.` }), meaningNote(ex.item)); };
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
        return [h('p', { class: 'small muted', text: 'Complete a frase com o trecho do texto original.' }),
          h('p', { lang: 'en', style: { fontSize: '1.05rem' } }, ex.before, h('b', { text: ' ____ ' }), ex.after),
          ex.hint ? h('p', { class: 'small', text: `Dica (sentido): ${ex.hint}` }) : null, inp,
          h('button', { class: 'btn block', style: { marginTop: '8px' }, 'data-role': 'check', onclick: check }, icon('check'), 'Conferir')].filter(Boolean);
      }
      case 'write': {
        const inp = field('pt-BR', 'Significado em português', 'write-input');
        const check = () => {
          const c = checkMeaning(ex.item, inp.value);
          if (c.result === 'empty') return;
          inp.disabled = true;
          done(c.result, c.result === 'unverified' && c.other ? h('div', { text: `“${c.other}” é um sentido que o glossário admite, mas ele não foi confirmado neste texto.` }) : null, meaningNote(ex.item));
        };
        inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') check(); });
        return [h('p', { class: 'small muted', text: 'Escreva o significado em português.' }),
          h('div', { class: 'row nowrap' }, h('h2', { lang: 'en', class: 'grow', style: { margin: 0 }, text: ex.en }), listenBtn(ex.en)),
          h('p', { lang: 'en', class: 'small', style: { margin: '6px 0 10px' }, text: ex.context }), inp,
          h('button', { class: 'btn block', style: { marginTop: '8px' }, 'data-role': 'check', onclick: check }, icon('check'), 'Conferir')];
      }
      case 'lisItem': case 'lisBlock': {
        setTimeout(() => say(ex.text), 300);
        return [h('p', { class: 'small muted', text: ex.skill === 'lisItem' ? 'Ouça e escolha a expressão que você ouviu.' : 'Ouça e escolha a frase que você ouviu.' }),
          h('div', { class: 'row' }, listenBtn(ex.text, 'Ouvir de novo'), h('button', { class: 'btn small', type: 'button', onclick: () => say(ex.text, 0.7) }, icon('slow'), 'Mais devagar')),
          h('div', { style: { marginTop: '10px' } }, options(ex.options.map((o) => ({ ...o })), (o) => done(o.correct ? 'good' : 'bad', h('div', { lang: 'en', text: `Você ouviu: “${ex.text}”.` }))))];
      }
      case 'spkItem': case 'spkBlock': return speakBody(ex, done, listenBtn);
      case 'rev': {
        const inp = h('textarea', { class: 'field', rows: 2, lang: 'en', placeholder: 'Escreva em inglês', autocapitalize: 'sentences', spellcheck: 'false', 'data-role': 'rev-input' });
        const check = () => {
          const c = checkReverse(ex.answer, inp.value);
          if (c.result === 'empty') return;
          inp.disabled = true;
          done(c.result, h('div', { lang: 'en', style: { marginTop: '4px' } }, h('span', { class: 'muted', text: 'Original: ' }), ex.answer),
            c.missing && c.missing.length ? h('div', { class: 'small', text: `Do original, faltou: ${c.missing.join(', ')}.` }) : null,
            c.extra && c.extra.length ? h('div', { class: 'small', text: `Não está no original: ${c.extra.join(', ')}.` }) : null,
            c.result === 'unverified' ? h('div', { class: 'small muted', text: 'Pode ser uma forma diferente e correta de dizer: compare com o original.' }) : null);
        };
        return [h('p', { class: 'small muted', text: 'Traduza para o inglês. O texto em português é a versão validada pelo professor; o gabarito é o inglês original da atividade.' }),
          h('p', { style: { fontSize: '1.05rem', margin: '0 0 10px' }, 'data-role': 'rev-pt', text: ex.pt }), inp,
          h('button', { class: 'btn block', style: { marginTop: '8px' }, 'data-role': 'check', onclick: check }, icon('check'), 'Conferir')];
      }
      default: return [h('p', { text: 'Exercício indisponível.' })];
    }
  }

  // fala: gravar → (reconhecimento local, se instalado) → palavras reconhecidas / não reconhecidas. Não avalia pronúncia.
  function speakBody(ex, done, listenBtn) {
    const textEl = h('p', { lang: 'en', style: { fontSize: '1.1rem', fontWeight: 600, margin: '6px 0' }, 'data-role': 'speak-text', text: ex.text });
    const hideBtn = h('button', { class: 'btn small', type: 'button', 'data-role': 'hide-text', onclick: () => { const hid = textEl.classList.toggle('hidden'); hideBtn.textContent = hid ? 'Mostrar o texto' : 'Falar sem olhar'; } }, 'Falar sem olhar');
    const out = h('div', { 'data-role': 'speak-out' });
    const recBtn = h('button', { class: 'rec-btn', type: 'button', 'aria-label': 'Gravar', 'data-role': 'rec' }, icon('mic'));
    const status = h('div', { class: 'small muted', text: 'Toque no microfone, fale e toque de novo para terminar.' });
    let rec = null, url = null;
    const stopRec = () => { if (rec) { rec.cancel(); rec = null; } };
    cleanupEx = () => { stopRec(); if (localasr.busy()) localasr.release(); if (url) URL.revokeObjectURL(url); };
    recBtn.onclick = async () => {
      if (rec) {
        const r0 = rec; rec = null; recBtn.classList.remove('on'); status.textContent = 'Analisando…';
        const { blob } = await r0.stop();
        analyse(blob);
        return;
      }
      player.stopAll();
      try { rec = await recorder.start({ maxMs: localasr.MAX_SECONDS * 1000 }); } catch (e) { status.textContent = e.userMessage || 'Não foi possível gravar.'; return; }
      recBtn.classList.add('on'); status.textContent = 'Gravando… toque para terminar.'; clear(out);
    };
    async function analyse(blob) {
      if (url) URL.revokeObjectURL(url);
      url = URL.createObjectURL(blob);
      const mine = h('audio', { src: url, preload: 'auto' });
      const mineBtn = h('button', { class: 'btn small', type: 'button', onclick: () => player.playElement(mine, { restart: true }) }, icon('play'), 'Minha voz');
      const analysis = await analyseBlob(blob).catch(() => null);
      const insufficient = !analysis || analysis.silent || analysis.speechSec < 0.4;
      const st = await localasr.status().catch(() => 'unsupported');
      status.textContent = 'Toque no microfone para gravar de novo.';
      if (st !== 'installed') {
        out.replaceChildren(h('div', { class: 'notice warn' }, 'Sem reconhecimento de fala instalado: ouça a sua voz e compare com o modelo. Esta tentativa não é corrigida.'),
          asrOffNotice(App, { onInstalled: () => analyse(blob) }), h('div', { class: 'row', style: { marginTop: '8px' } }, mineBtn));
        return;
      }
      let res = null;
      if (!insufficient) {
        try { res = await localasr.transcribe(blob); } catch (e) {
          if (e.code === 'cancelled') return;
          out.replaceChildren(h('div', { class: 'notice warn' }, `A análise falhou nesta gravação (${e.message}). Grave de novo; não conta como erro.`), mineBtn);
          return;
        }
      }
      const ev = evaluateWords(ex.text, res, { insufficient });
      const judged = ev.words.filter((w) => w.state === 'good' || w.state === 'needs_practice');
      const pending = ev.words.filter((w) => w.state === 'needs_practice');
      const chips = h('div', { class: 'chips', 'data-role': 'speak-words' }, ev.words.map((w) => h('span', {
        class: `chip ${w.state === 'good' ? 'ok' : w.state === 'needs_practice' ? 'warn' : ''}`, title: w.reason, lang: 'en', text: w.text })));
      out.replaceChildren(
        res ? h('p', { class: 'small', 'data-role': 'heard' }, h('span', { class: 'muted', text: 'O reconhecimento ouviu: ' }), h('span', { lang: 'en', text: res.text || '(nada)' })) : null,
        chips,
        h('p', { class: 'tiny muted', text: 'Verde = reconhecida; âmbar = não reconhecida (pode ser falha do reconhecimento ou da fala: ouça a sua voz); cinza = não avaliada. Não é uma avaliação de pronúncia.' }),
        h('div', { class: 'row' }, mineBtn));
      if (!ev.evaluated || !judged.length) done('unverified', h('div', { text: ev.note || 'Poucas palavras avaliáveis nesta gravação.' }));
      else done(pending.length ? 'ok' : 'good', h('div', { text: pending.length ? `Não reconhecidas: ${pending.map((w) => w.text).join(', ')}. Repita depois de ouvir o modelo.` : 'Todas as palavras avaliadas foram reconhecidas.' }));
    }
    return [h('p', { class: 'small muted', text: ex.skill === 'spkItem' ? 'Ouça e fale a expressão.' : 'Ouça e fale a frase.' }),
      textEl, ex.meaning ? h('p', { class: 'small muted', text: `Sentido: ${ex.meaning}` }) : null,
      h('div', { class: 'row' }, listenBtn(ex.text), hideBtn),
      h('div', { class: 'rec-main', style: { marginTop: '12px' } }, recBtn, h('div', { class: 'rec-info' }, status)), out].filter(Boolean);
  }

  // ---------- fim da sessão ----------
  function endOfSession(act, cand, ap) {
    clear(view);
    const s = ap.session;
    const res = Object.values(s.results);
    const count = (k) => res.filter((x) => x === k).length;
    const errs = sessionErrors(s);
    const again = (mode, keys) => { startSession(ap, mode, keys); saveProgress().then(() => alive && (clear(view), runSession(act, cand, ap))); };
    view.append(h('section', { class: 'card', 'data-role': 'session-end' },
      h('h3', { style: { margin: 0 }, text: `${MODES[s.mode].label}: rodada concluída` }),
      h('p', { 'data-role': 'session-score', text: `Certas: ${count('good') + count('ok')} · erros: ${count('bad')} · sem evidência: ${count('unverified')} · puladas: ${s.keys.length - res.length}` }),
      errs.length ? h('button', { class: 'btn primary block', 'data-role': 'repeat-errors', onclick: () => again(s.mode, errs) }, icon('refresh'), `Repetir os erros (${errs.length})`) : null,
      h('button', { class: 'btn block', style: { marginTop: '8px' }, 'data-role': 'new-round', onclick: () => {
        const keys = buildQueue(cand, ap, s.mode);
        if (keys.length) again(s.mode, keys);
      } }, 'Nova rodada'),
      h('a', { class: 'btn block', style: { marginTop: '8px' }, href: href(act.id), 'data-role': 'practice-home' }, 'Outras práticas'),
      h('a', { class: 'btn block ghost', style: { marginTop: '8px' }, href: `#/cq/${encodeURIComponent(act.id)}` }, icon('back'), 'Voltar à tradução')));
  }

  return () => { alive = false; if (cleanupEx) cleanupEx(); player.stopAll(); };
}

function say(text, rate) {
  // sem chave de áudio embutido: sempre a voz do sistema (en-GB, quando houver); nada é enviado para fora do aparelho
  return player.play({ key: null, text }, rate ? { rate } : undefined).then((res) => {
    if (!res.ok && res.reason !== 'cancel') toast('Voz do sistema indisponível neste aparelho.');
    return res;
  });
}

/** Botão “Praticar” do cartão da atividade (ui/course.js). */
export const practiceButton = (act) => h('a', { class: 'btn small', href: href(act.id), 'data-role': 'open-practice' }, icon('target'), 'Praticar');
