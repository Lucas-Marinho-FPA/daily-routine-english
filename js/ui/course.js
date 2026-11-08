// Curso — Atividades: tradução inglês → português, uma questão por vez, com salvamento automático, revisão do
// professor por questão e exportação em TXT. Regras em engine/course.js. Os dados ficam no IndexedDB (kv 'course'),
// separados do estado de estudo: nada aqui mexe em jornadas, progresso ou Speaking Lab.
import { h, icon, toast, bar, confirmSheet } from './dom.js';
import { getKv, putKv } from '../store/db.js';
import { readImportFile } from '../engine/docread.js';
import {
  parseActivity, newActivity, answersOf, isDone, summary, canOpen, finishQuestion,
  isValidated, matchAnswers, applyOwnAnswers, applyTeacherAnswers,
  findSame, mergeActivity, transferData, readTransfer, dedupe, isGenericTitle,
  exportProblems, exportText, checkTranslation, CHECK_LABEL, CHECK_CLASS,
} from '../engine/course.js';

export const AREA_NAME = 'Curso — Atividades';
const KEY = 'course';
const ACCEPT_TEXT = '.txt,.md,.markdown,.docx,text/plain,text/markdown,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const slug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'atividade';
function download(name, text, type) {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` })), download: name });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const MIRROR = 'drg.course.mirror';

let data = null; // { v: 1, activities: { id: atividade }, last: id|null }
let timer = null;
let saving = Promise.resolve();

export async function loadCourse() {
  if (!data) {
    const raw = await getKv(KEY).catch(() => null);
    let mirror = null;
    try { mirror = JSON.parse(localStorage.getItem(MIRROR) || 'null'); } catch (e) { /* sem cópia */ }
    const ok = (x) => x && x.v === 1 && x.activities;
    // a cópia síncrona feita ao sair do app vence quando é mais nova (o IndexedDB pode não ter terminado de gravar)
    data = ok(mirror) && (!ok(raw) || (mirror.savedAt || 0) > (raw.savedAt || 0)) ? mirror : ok(raw) ? raw : { v: 1, activities: {}, last: null };
    if (dedupe(data)) await saveNow(); // a mesma atividade importada duas vezes vira um só cartão (progresso juntado)
  }
  return data;
}
function saveNow() {
  clearTimeout(timer);
  timer = null;
  if (!data) return saving;
  data.savedAt = Date.now();
  const snap = JSON.parse(JSON.stringify(data));
  saving = saving.then(() => putKv(KEY, snap)).catch((e) => { console.error('Falha ao salvar a atividade', e); toast('Não foi possível salvar. Tente de novo.'); });
  return saving;
}
function saveSoon() { clearTimeout(timer); timer = setTimeout(saveNow, 150); }
export function flushCourse() { return timer ? saveNow() : saving; }
/** Ao sair do app: cópia síncrona (localStorage) além da gravação no IndexedDB, que é assíncrona. */
function onLeave() {
  if (!data || !timer) return;
  flushCourse();
  try { localStorage.setItem(MIRROR, JSON.stringify(data)); } catch (e) { /* cheio ou indisponível: fica só o IndexedDB */ }
}
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') onLeave(); });
  window.addEventListener('pagehide', onLeave);
}

const fmtDay = (ts) => { try { return new Date(ts).toLocaleDateString('pt-BR'); } catch (e) { return ''; } };
const qHref = (id, n) => `#/cq/${encodeURIComponent(id)}?q=${n}`;
const resumeOf = (act) => {
  const n = act.pos && canOpen(act, act.pos.q) ? act.pos.q : 1;
  return Math.min(Math.max(1, n), act.questions.length);
};

// ---------- área: atividades + importação ----------
export function renderCourse(App) {
  const view = App.layout(AREA_NAME, { back: '#/' });
  const list = h('div', { 'data-role': 'activities' }, h('p', { class: 'muted small', text: 'Carregando…' }));
  view.append(
    h('p', { class: 'small muted', text: 'Atividades de tradução do curso (inglês → português). O texto de cada atividade é importado por você e fica só neste aparelho, junto com as suas respostas.' }),
    list,
    transferCard(() => drawList()),
    importCard(App, () => drawList()));
  async function drawList() {
    const d = await loadCourse();
    list.replaceChildren();
    const acts = Object.values(d.activities).sort((a, b) => (b.id === d.last) - (a.id === d.last) || a.importedAt - b.importedAt);
    if (!acts.length) list.append(h('div', { class: 'notice', 'data-role': 'no-activity' }, 'Nenhuma atividade ainda. Importe o arquivo da atividade abaixo.'));
    for (const act of acts) {
      const s = summary(act);
      list.append(h('section', { class: 'card', style: { marginTop: '12px' }, 'data-role': 'activity', 'data-id': act.id },
        h('h3', { style: { margin: 0 }, text: act.title }),
        h('div', { class: 'row nowrap small' }, h('span', { class: 'grow', 'data-role': 'activity-progress', text: `${s.done} de ${s.total} questões concluídas` }), h('b', { text: `${Math.round((s.done / s.total) * 100)}%` })),
        bar(s.done / s.total),
        h('div', { class: 'small muted', style: { marginTop: '4px' }, 'data-role': 'activity-validated', text: `Validadas pelo professor: ${s.validated} de ${s.total}` }),
        h('button', { class: 'btn primary block', style: { marginTop: '10px' }, 'data-role': 'open-activity', onclick: () => { d.last = act.id; saveSoon(); App.go(qHref(act.id, resumeOf(act))); } },
          icon('play'), s.done ? (s.complete ? 'Abrir' : `Continuar (questão ${resumeOf(act)})`) : 'Começar'),
        h('div', { class: 'row', style: { marginTop: '8px', gap: '8px' } },
          h('button', { class: 'btn small', 'data-role': 'export-transfer', onclick: () => {
            download(`${slug(act.title)}-transferencia.json`, JSON.stringify(transferData(act)), 'application/json');
            toast('Arquivo de transferência gerado: importe-o no outro aparelho em “Importar respostas de outro aparelho”.', 6000);
          } }, icon('download'), 'Exportar para outro aparelho'),
          h('button', { class: 'btn small ghost', 'data-role': 'remove-activity', onclick: async () => {
            if (!(await confirmSheet(`Remover “${act.title}”?`, 'A atividade e as respostas dela saem deste aparelho. Se quiser guardar, exporte antes para outro aparelho.', { ok: 'Remover', danger: true }))) return;
            delete d.activities[act.id];
            if (d.last === act.id) d.last = null;
            await saveNow();
            drawList();
          } }, 'Remover')),
        s.complete ? exportBox(act) : null));
    }
  }
  drawList();
  return () => { flushCourse(); };
}

// ---------- transferir respostas entre aparelhos (TXT exportado) e importar correções do professor ----------
// Tudo é lido e gravado só neste aparelho. Antes de alterar qualquer coisa, mostra o que será feito e os problemas.
function transferCard(onDone) {
  const out = h('div', { 'data-role': 'transfer-status' });
  const pick = (kind) => h('input', { type: 'file', accept: kind === 'own' ? `.json,application/json,${ACCEPT_TEXT}` : ACCEPT_TEXT, class: 'hidden', 'data-role': `import-${kind}`,
    onchange: async (e) => {
      const f = e.target.files[0]; e.target.value = ''; if (!f) return;
      let text;
      try { text = await readImportFile(f); } catch (err) { out.replaceChildren(h('div', { class: 'notice bad', 'data-role': 'transfer-error' }, `Não foi possível ler o arquivo: ${err.message}.`)); return; }
      await preview(kind, text);
    } });
  async function preview(kind, text) {
    const d = await loadCourse();
    out.replaceChildren();
    const acts = Object.values(d.activities);
    let moved = null;
    try { moved = readTransfer(text); } catch (err) { out.append(h('div', { class: 'notice bad', 'data-role': 'transfer-error' }, `Nada foi alterado: ${err.message}.`)); return; }
    if (moved && kind === 'teacher') { out.append(h('div', { class: 'notice bad', 'data-role': 'transfer-error' }, 'Este é um arquivo de transferência entre aparelhos; use “Importar respostas de outro aparelho”.')); return; }
    if (moved) return previewTransfer(d, moved);
    if (!acts.length) { out.append(h('div', { class: 'notice bad', 'data-role': 'transfer-error' }, 'Importe primeiro o texto da atividade (abaixo); depois, as respostas.')); return; }
    const r = matchAnswers(text, acts);
    const teacher = kind === 'teacher';
    const errs = r.errors.slice();
    if (teacher) for (const q of r.questions) { const miss = q.answers.map((a, i) => (a ? null : i + 1)).filter(Boolean); if (miss.length) errs.push(`Questão ${q.n}: correção sem resposta no${miss.length === 1 ? ' bloco' : 's blocos'} ${miss.join(', ')}.`); }
    const list = (items) => h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px' } }, items.map((x) => h('li', { text: x })));
    if (errs.length || !r.questions.length) {
      out.append(h('div', { class: 'notice bad', 'data-role': 'transfer-error' }, h('b', { text: 'Nada foi alterado. O arquivo não confere com a atividade:' }), list(errs.length ? errs : ['nenhuma questão identificada'])));
      return;
    }
    const act = r.act;
    const nums = r.questions.map((q) => q.n);
    const blocks = r.questions.reduce((n, q) => n + q.answers.length, 0);
    const kept = teacher ? [] : nums.filter((n) => isValidated(act, n));
    const what = teacher
      ? `${nums.length} ${nums.length === 1 ? 'questão será marcada' : 'questões serão marcadas'} como validada${nums.length === 1 ? '' : 's'} pelo professor; a versão corrigida passa a ser a resposta oficial.`
      : `${nums.length - kept.length} ${nums.length - kept.length === 1 ? 'questão será atualizada' : 'questões serão atualizadas'} com as suas respostas${kept.length ? `; ${kept.length} já validada${kept.length === 1 ? '' : 's'} pelo professor (${kept.join(', ')}) não muda${kept.length === 1 ? '' : 'm'}` : ''}.`;
    const apply = h('button', { class: 'btn primary', 'data-role': 'transfer-apply', onclick: async () => {
      const res = teacher ? applyTeacherAnswers(act, r) : applyOwnAnswers(act, r);
      d.last = act.id;
      await saveNow();
      out.replaceChildren(h('div', { class: 'notice ok', 'data-role': 'transfer-ok' }, teacher
        ? `Correções importadas: ${res.validated.length} ${res.validated.length === 1 ? 'questão validada' : 'questões validadas'} pelo professor (${res.validated.join(', ')}).`
        : `Respostas importadas: ${res.updated.length} ${res.updated.length === 1 ? 'questão atualizada' : 'questões atualizadas'}${res.keptValidated.length ? `; ${res.keptValidated.length} validadas mantidas` : ''}.`));
      onDone();
    } }, icon('check'), 'Aplicar');
    out.append(h('div', { class: 'notice', 'data-role': 'transfer-preview' },
      h('b', { text: `${act.title}: ${nums.length} de ${act.questions.length} questões identificadas no arquivo (${blocks} blocos).` }),
      h('p', { style: { margin: '6px 0' }, text: what }),
      r.warnings.length ? h('div', { class: 'small' }, 'Avisos (a resposta atual desses blocos é mantida):', list(r.warnings)) : null,
      h('div', { class: 'row', style: { marginTop: '8px' } }, apply, h('button', { class: 'btn', 'data-role': 'transfer-cancel', onclick: () => out.replaceChildren() }, 'Cancelar'))));
  }
  // arquivo de transferência (.json): a atividade completa de outro aparelho; em cada questão fica a versão mais nova
  function previewTransfer(d, moved) {
    const here = d.activities[moved.id] || findSame(Object.values(d.activities), moved);
    const s = summary(moved);
    let what;
    if (here) {
      const trial = mergeActivity(JSON.parse(JSON.stringify(here)), moved);
      what = `“${here.title}” já está neste aparelho: ${trial.fromFile.length} ${trial.fromFile.length === 1 ? 'questão será atualizada' : 'questões serão atualizadas'} com a versão mais nova do arquivo${trial.validated.length ? `, ${trial.validated.length} com correção do professor` : ''}; ${trial.keptHere.length} ${trial.keptHere.length === 1 ? 'fica' : 'ficam'} como ${trial.keptHere.length === 1 ? 'está' : 'estão'} aqui (mais nova${trial.keptHere.length === 1 ? '' : 's'} ou validada${trial.keptHere.length === 1 ? '' : 's'}).`;
    } else what = `“${moved.title}” será adicionada a este aparelho com ${s.done} de ${s.total} questões concluídas e ${s.validated} validadas pelo professor.`;
    out.append(h('div', { class: 'notice', 'data-role': 'transfer-preview' },
      h('b', { text: 'Arquivo de transferência de outro aparelho.' }), h('p', { style: { margin: '6px 0' }, text: what }),
      h('div', { class: 'row', style: { marginTop: '8px' } },
        h('button', { class: 'btn primary', 'data-role': 'transfer-apply', onclick: async () => {
          let act = here;
          if (here) mergeActivity(here, moved); else { act = moved; d.activities[act.id] = act; }
          d.last = act.id;
          await saveNow();
          const t = summary(act);
          out.replaceChildren(h('div', { class: 'notice ok', 'data-role': 'transfer-ok' }, `“${act.title}” atualizada neste aparelho: ${t.done} de ${t.total} questões concluídas, ${t.validated} validadas pelo professor.`));
          onDone();
        } }, icon('check'), 'Aplicar'),
        h('button', { class: 'btn', 'data-role': 'transfer-cancel', onclick: () => out.replaceChildren() }, 'Cancelar'))));
  }
  return h('details', { class: 'more card', 'data-role': 'transfer' },
    h('summary', { text: 'Transferir respostas e correções' }),
    h('p', { class: 'small muted', text: 'Para continuar em outro aparelho: no cartão da atividade, “Exportar para outro aparelho” gera um arquivo .json; no outro aparelho, importe-o abaixo (a atividade é reconhecida e atualizada, sem cartão repetido; em cada questão fica a versão mais nova). Também aceita o .txt exportado para a plataforma. Tudo fica só no aparelho.' }),
    h('label', { class: 'btn block' }, icon('upload'), 'Importar respostas de outro aparelho', pick('own')),
    h('label', { class: 'btn block', style: { marginTop: '8px' } }, icon('check'), 'Importar correções do professor', pick('teacher')),
    h('p', { class: 'tiny muted', style: { margin: '6px 0 0' }, text: 'Correções do professor (.txt, .docx ou .md): o formato do arquivo exportado para a plataforma, com as traduções corrigidas. Cada questão do arquivo passa a ter a versão corrigida como resposta oficial (validada). Pode importar de novo quando houver novas correções.' }),
    h('div', { style: { marginTop: '10px' } }, out));
}

function importCard(App, onDone) {
  const status = h('div', { 'data-role': 'import-status' });
  const paste = h('textarea', { class: 'field', rows: 4, placeholder: 'Ou cole aqui o texto da atividade', 'aria-label': 'Texto da atividade', 'data-role': 'import-text' });
  const fail = (msg) => status.replaceChildren(h('div', { class: 'notice bad', 'data-role': 'import-error' }, h('b', { text: 'Não foi possível importar. ' }), msg));
  async function importText(text) {
    status.replaceChildren();
    const d = await loadCourse();
    const acts = Object.values(d.activities);
    try { if (readTransfer(text)) return fail('Este é um arquivo de transferência. Use “Importar respostas de outro aparelho”, em “Transferir respostas e correções”.'); } catch (e) { return fail(e.message); }
    const p = parseActivity(text);
    if (p.errors.length) return fail(p.errors.join(' '));
    const same = findSame(acts, p);
    if (!same && acts.length) {
      const m = matchAnswers(text, acts);
      if (m && !m.errors.length && m.matched) return fail(`Este arquivo traz respostas da atividade “${m.act.title}”. Use “Importar respostas de outro aparelho” ou “Importar correções do professor”, em “Transferir respostas e correções”.`);
    }
    let act = same;
    if (same) { if (isGenericTitle(same.title) && !isGenericTitle(p.title)) same.title = p.title; } // mesma atividade: um só cartão
    else { act = newActivity(p); d.activities[act.id] = act; }
    d.last = act.id;
    await saveNow();
    paste.value = '';
    status.append(h('div', { class: 'notice ok', 'data-role': 'import-ok' },
      same ? `“${act.title}” já está neste aparelho: as respostas foram mantidas.` : `“${act.title}” importada: ${act.questions.length} questões, ${act.questions.reduce((n, q) => n + q.blocks.length, 0)} blocos para traduzir.`));
    onDone();
  }
  const file = h('input', { type: 'file', accept: ACCEPT_TEXT, class: 'hidden', 'data-role': 'import-file',
    onchange: async (e) => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; try { await importText(await readImportFile(f)); } catch (err) { fail(err.message); } } });
  return h('details', { class: 'more card', 'data-role': 'import' },
    h('summary', { text: 'Importar atividade' }),
    h('p', { class: 'small muted', text: 'Arquivo .txt, .docx (Word) ou .md com o título da atividade e as questões (“QUESTION 1”, “QUESTION 2”…), ou o texto colado abaixo. Cada linha em inglês vira um bloco para traduzir, sem alterar o texto. Importar de novo a mesma atividade (em qualquer formato) não cria outro cartão e mantém as respostas.' }),
    h('label', { class: 'btn block' }, icon('upload'), 'Escolher arquivo', file),
    h('div', { style: { marginTop: '10px' } }, paste),
    h('button', { class: 'btn block', style: { margin: '8px 0 12px' }, 'data-role': 'import-paste', onclick: () => importText(paste.value) }, 'Importar texto colado'),
    status);
}

// ---------- uma questão ----------
export function renderCourseQuestion(App, r) {
  const view = App.layout('Questão', { back: '#/course' });
  let alive = true;
  loadCourse().then((d) => { if (alive) draw(d); });
  function draw(d) {
    const act = d.activities[r.arg];
    if (!act) { view.append(h('div', { class: 'notice bad' }, 'Atividade não encontrada neste aparelho. ', h('a', { href: '#/course', text: 'Voltar' }))); return; }
    const total = act.questions.length;
    let n = Number(r.params.q) || resumeOf(act);
    n = Math.min(Math.max(1, n), total);
    if (!canOpen(act, n)) { App.go(qHref(act.id, resumeOf(act))); return; }
    const q = act.questions.find((x) => x.n === n);
    d.last = act.id;
    act.pos = { q: n, b: act.pos && act.pos.q === n ? act.pos.b || 0 : 0 };
    saveSoon();
    document.querySelector('.topbar h1').textContent = `Questão ${n} de ${total}`;

    const s = summary(act);
    const head = h('section', { class: 'card', 'data-role': 'course-head' },
      h('div', { class: 'small muted', text: act.title }),
      h('div', { class: 'row nowrap small', style: { marginTop: '4px' } }, h('span', { class: 'grow', 'data-role': 'course-progress', text: `${s.done} de ${total} questões concluídas` }), h('b', { text: `${Math.round((s.done / total) * 100)}%` })),
      bar(s.done / total),
      h('div', { class: 'chips', style: { marginTop: '8px' }, 'data-role': 'q-status' }));
    const nav = h('nav', { class: 'chips scroll', style: { margin: '10px 0' }, 'aria-label': 'Questões', 'data-role': 'q-nav' },
      act.questions.map((x) => {
        const ok = canOpen(act, x.n);
        const val = act.teacher[x.n] && act.teacher[x.n].validatedAt;
        return h('button', { class: `chip${isDone(act, x.n) ? ' ok' : ''}`, 'aria-pressed': x.n === n ? 'true' : 'false', disabled: !ok, 'aria-label': `Questão ${x.n}${isDone(act, x.n) ? ', concluída' : ''}${val ? ', validada pelo professor' : ''}`,
          onclick: () => App.go(qHref(act.id, x.n)) }, `${x.n}${val ? ' ✓' : ''}`);
      }));
    const statusChips = () => {
      const box = head.querySelector('[data-role="q-status"]');
      const t = act.teacher[n];
      box.replaceChildren(
        h('span', { class: `chip ${isDone(act, n) ? 'ok' : answersOf(act, n).some((x) => x.trim()) ? 'warn' : ''}`, 'data-role': 'q-done', text: isDone(act, n) ? 'Concluída' : answersOf(act, n).some((x) => x.trim()) ? 'Em andamento' : 'Não iniciada' }),
        h('span', { class: `chip ${t && t.validatedAt ? 'accent' : ''}`, 'data-role': 'q-validated', text: t && t.validatedAt ? `Validada pelo professor em ${fmtDay(t.validatedAt)}` : 'Aguardando validação do professor' }));
    };
    statusChips();

    const msg = h('div', { 'data-role': 'q-msg' });
    const checks = [];
    const areas = q.blocks.map((en, i) => {
      const chip = h('div', { class: 'small', style: { marginTop: '4px' }, 'data-role': 'block-check' });
      checks.push(chip);
      const ta = h('textarea', { class: 'field', rows: 2, lang: 'pt-BR', placeholder: 'Tradução em português', 'aria-label': `Tradução do bloco ${i + 1}`, 'data-role': 'block-pt', 'data-i': i,
        oninput: () => {
          (act.answers[n] = answersOf(act, n))[i] = ta.value;
          (act.edited || (act.edited = {}))[n] = Date.now(); // a versão mais nova vence ao juntar aparelhos
          autosize(ta);
          saveSoon();
          statusChips();
          drawChecks();
        },
        onfocus: () => { act.pos = { q: n, b: i }; saveSoon(); } });
      ta.value = answersOf(act, n)[i];
      if (isValidated(act, n)) ta.disabled = true; // resposta oficial: muda só por “Editar a correção”
      return { ta, el: h('div', { class: 'card flat', style: { marginTop: '10px' }, 'data-role': 'block', 'data-pos': i },
        h('div', { class: 'small muted', text: i === 0 ? 'Título da questão' : `Bloco ${i + 1}` }),
        h('p', { lang: 'en', style: { margin: '4px 0 8px', fontWeight: 600 }, 'data-role': 'block-en', text: en }),
        ta, chip) };
    });
    function drawChecks() {
      const show = !!act.done[n] && !isValidated(act, n); // resposta oficial do professor: sem checagem automática
      const a = answersOf(act, n);
      checks.forEach((chip, i) => {
        chip.replaceChildren();
        if (!show) return;
        const c = checkTranslation(q.blocks[i], a[i]);
        chip.append(h('span', { class: `chip ${CHECK_CLASS[c.level]}`, 'data-level': c.level, text: `Checagem básica: ${CHECK_LABEL[c.level]}` }), ' ', h('span', { class: 'muted', text: c.notes.join(' ') }));
      });
    }
    drawChecks();

    const prev = n > 1 ? h('button', { class: 'btn', 'data-role': 'q-prev', onclick: () => App.go(qHref(act.id, n - 1)) }, icon('back'), 'Anterior') : null;
    const last = n === total;
    const save = h('button', { class: 'btn primary grow', 'data-role': 'q-save', onclick: async () => {
      const res = finishQuestion(act, n);
      msg.replaceChildren();
      if (!res.ok) {
        msg.append(h('div', { class: 'notice warn', 'data-role': 'q-missing' }, `Falta traduzir: ${res.missing.length === 1 ? 'bloco' : 'blocos'} ${res.missing.join(', ')}.`));
        const first = areas[res.missing[0] - 1];
        first.ta.focus();
        return;
      }
      await saveNow();
      if (last) { toast('Questão salva.'); App.go(qHref(act.id, n)); } else { toast(`Questão ${n} salva.`); App.go(qHref(act.id, n + 1)); }
    } }, icon('check'), last ? 'Salvar e concluir a atividade' : 'Salvar e avançar');

    view.append(...[head, nav,
      isValidated(act, n)
        ? h('div', { class: 'notice ok', 'data-role': 'official-answer' }, `Resposta oficial: validada pelo professor em ${fmtDay(act.teacher[n].validatedAt)}. É ela que vale para revisões e exportação.`)
        : h('p', { class: 'small muted', text: 'Traduza cada bloco para o português. As respostas são salvas automaticamente enquanto você digita.' }),
      ...areas.map((x) => x.el), msg,
      h('div', { class: 'row nowrap', style: { marginTop: '14px' } }, prev, save),
      act.done[n] && !isValidated(act, n) ? h('p', { class: 'small muted', 'data-role': 'check-note', text: 'A checagem básica é só uma orientação de estudo (sinais como texto ainda em inglês, partes faltando, números, nomes, perguntas e negações). Ela não avalia o sentido, não muda sua resposta e não é a correção oficial.' }) : null,
      act.done[n] ? teacherBox(act, n, () => App.go(qHref(act.id, n))) : null,
      last && isDone(act, n) ? exportBox(act) : null].filter(Boolean)); // append nativo escreveria “null”
    areas.forEach((x) => autosize(x.ta));
    const at = view.querySelector(`[data-pos="${act.pos.b}"]`);
    if (at && act.pos.b) at.scrollIntoView({ block: 'center' });
  }
  return () => { alive = false; flushCourse(); };
}

function autosize(ta) { ta.style.height = 'auto'; ta.style.height = `${Math.max(56, ta.scrollHeight + 2)}px`; }

// ---------- correção do professor (por questão, independente; não bloqueia o avanço) ----------
function teacherBox(act, n, redraw) {
  const q = act.questions.find((x) => x.n === n);
  const sub = act.submitted[n];
  const body = h('div');
  const box = h('details', { class: 'more card', 'data-role': 'teacher', open: !!(act.teacher[n]) },
    h('summary', { text: 'Correção do professor' }), body);
  function draw() {
    const t = act.teacher[n];
    const validated = !!(t && t.validatedAt);
    body.replaceChildren(h('p', { class: 'small muted', text: 'Depois da aula, registre aqui a versão corrigida conforme o professor e marque a questão como validada. Sua tradução enviada e a checagem básica ficam guardadas como estavam.' }));
    if (!t) {
      body.append(h('button', { class: 'btn block', 'data-role': 'teacher-start', onclick: () => {
        act.teacher[n] = { blocks: answersOf(act, n), validatedAt: null, startedAt: Date.now() };
        saveSoon();
        draw();
      } }, 'Registrar a correção do professor'));
      return;
    }
    if (!validated) q.blocks.forEach((en, i) => {
      const ta = h('textarea', { class: 'field', rows: 2, lang: 'pt-BR', 'aria-label': `Versão corrigida do bloco ${i + 1}`, 'data-role': 'teacher-pt',
        oninput: () => { t.blocks[i] = ta.value; autosize(ta); saveSoon(); } });
      ta.value = t.blocks[i] || '';
      const c = sub && sub.check && sub.check[i];
      body.append(h('div', { class: 'card flat', style: { marginTop: '8px' } },
        h('p', { lang: 'en', style: { margin: '0 0 4px', fontWeight: 600 }, text: en }),
        sub ? h('div', { class: 'small', 'data-role': 'teacher-submitted' }, h('span', { class: 'muted', text: 'Enviada: ' }), sub.blocks[i]) : null,
        c ? h('div', { class: 'small muted', text: `Checagem básica ao enviar: ${CHECK_LABEL[c.level]}` }) : null,
        h('div', { class: 'small muted', style: { marginTop: '6px' }, text: 'Versão corrigida (professor):' }), ta));
      requestAnimationFrame(() => autosize(ta));
    });
    if (validated) {
      body.append(h('div', { class: 'notice ok', style: { marginTop: '10px' }, 'data-role': 'teacher-validated' }, `Validada pelo professor em ${fmtDay(t.validatedAt)}. Esta é a referência oficial desta questão.`),
        h('button', { class: 'btn block', style: { marginTop: '8px' }, 'data-role': 'teacher-edit', onclick: async () => {
          if (!(await confirmSheet('Editar a correção?', 'A questão deixa de estar validada até você validar de novo.', { ok: 'Editar' }))) return;
          t.validatedAt = null; await saveNow(); redraw(); // campos de resposta voltam a ser editáveis
        } }, 'Editar a correção'));
    } else {
      const err = h('div');
      body.append(err, h('button', { class: 'btn primary block', style: { marginTop: '10px' }, 'data-role': 'teacher-validate', onclick: async () => {
        const miss = t.blocks.map((x, i) => ((x || '').trim() ? null : i + 1)).filter(Boolean);
        if (miss.length) { err.replaceChildren(h('div', { class: 'notice warn' }, `Preencha a versão corrigida dos blocos ${miss.join(', ')}.`)); return; }
        t.validatedAt = Date.now();
        act.answers[n] = t.blocks.slice(); // a versão do professor passa a ser a resposta da questão
        (act.edited || (act.edited = {}))[n] = t.validatedAt;
        await saveNow();
        toast('Questão validada pelo professor.');
        redraw(); // a versão do professor aparece como a resposta oficial
      } }, icon('check'), 'Marcar como validada pelo professor'));
    }
  }
  draw();
  return box;
}

// ---------- exportação (só com todas as questões concluídas) ----------
function exportBox(act) {
  const probs = exportProblems(act);
  if (probs.length) {
    return h('div', { class: 'notice bad', style: { marginTop: '14px' }, 'data-role': 'export-blocked' },
      h('b', { text: 'Ainda não dá para exportar. Falta:' }), h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px' } }, probs.map((p) => h('li', { text: p }))));
  }
  const name = `${act.title.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'atividade'}-respostas.txt`;
  return h('section', { class: 'card', style: { marginTop: '14px' }, 'data-role': 'export' },
    h('h3', { text: 'Atividade concluída' }),
    h('p', { class: 'small muted', text: 'O arquivo traz cada questão com os blocos em inglês e as suas traduções, pronto para copiar e colar na plataforma do curso.' }),
    h('button', { class: 'btn primary block', 'data-role': 'export-txt', onclick: () => {
      const text = exportText(act);
      const a = h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' })), download: name });
      document.body.append(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      toast('Arquivo gerado.');
    } }, icon('download'), 'Exportar todas as respostas'),
    h('button', { class: 'btn block', style: { marginTop: '8px' }, 'data-role': 'export-copy', onclick: async () => {
      try { await navigator.clipboard.writeText(exportText(act)); toast('Texto copiado.'); } catch (e) { toast('Não foi possível copiar; use o arquivo.'); }
    } }, 'Copiar o texto'));
}

/** Cartão do Início: acesso à área e onde continuar. */
export function courseHomeCard(App) {
  const info = h('div', { class: 'small', style: { marginTop: '6px' }, 'data-role': 'course-next' });
  loadCourse().then((d) => {
    const act = d.last && d.activities[d.last];
    if (!act) return;
    const s = summary(act);
    info.append(h('span', { class: 'muted', text: `${act.title}: ` }), `${s.done} de ${s.total} questões · ${s.validated} validadas`);
  });
  return h('section', { class: 'card', style: { marginTop: '12px' }, 'data-role': 'course-entry' },
    h('h3', { style: { margin: 0 }, text: AREA_NAME }),
    h('p', { class: 'small muted', style: { margin: '2px 0 8px' }, text: 'Traduções das atividades do curso, revisão do professor e exportação das respostas.' }),
    info,
    h('a', { class: 'btn block primary', href: '#/course', style: { marginTop: '10px' }, 'data-role': 'open-course' }, icon('book'), 'Abrir'));
}
