// Curso — Atividades: catálogo de atividades importadas pelo aluno (arquivo de estudo), tradução inglês → português,
// uma questão por vez, salvamento automático e exportação das respostas (também parcial). Regras em engine/course.js.
// Os dados ficam no IndexedDB (kv 'course'), separados do estado de estudo: nada aqui mexe em jornadas, progresso ou
// Speaking Lab. Os dados de validação do professor já gravados continuam guardados e usados internamente (resposta de
// referência, memória da avaliação, Praticar), mas não aparecem nem são geridos nesta tela.
import { h, icon, toast, bar, confirmSheet, sheet } from './dom.js';
import { getKv, putKv } from '../store/db.js';
import { readImportFile } from '../engine/docread.js';
import { loadGlossary } from '../engine/glossary.js';
import { practiceButton } from './coursepractice.js';
import {
  parseActivity, newActivity, answersOf, isDone, summary, canOpen, finishQuestion,
  isValidated, matchAnswers, applyOwnAnswers, setMemoryFrom,
  findSame, mergeActivity, transferData, readTransfer, dedupe,
  checkTranslation, CHECK_LABEL, CHECK_CLASS,
  readPackage, planPackage, applyPackage, partLock, catalogOrder, exportReport, similarity,
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
const SAFETY = 'course.copia-antes-catalogo';

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
    await ensureSafetyCopy(data);
    if (dedupe(data)) await saveNow(); // a mesma atividade importada duas vezes vira um só cartão (progresso juntado)
  }
  return data;
}
/** Cópia de segurança única do registro (antes do catálogo), gravada ao abrir e antes de a importação mudar algo. */
async function ensureSafetyCopy(d) {
  if (!Object.keys(d.activities).length) return;
  if (await getKv(SAFETY).catch(() => true)) return;
  await putKv(SAFETY, { at: Date.now(), data: JSON.parse(JSON.stringify(d)) }).catch(() => {});
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

const qHref = (id, n) => `#/cq/${encodeURIComponent(id)}?q=${n}`;
const resumeOf = (act) => {
  const n = act.pos && canOpen(act, act.pos.q) ? act.pos.q : 1;
  return Math.min(Math.max(1, n), act.questions.length);
};

// ---------- área: catálogo + ações discretas (adicionar atividade, exportar respostas) ----------
export function renderCourse(App) {
  const toolBtn = (name, label, role, onclick) => h('button', { class: 'icon-btn ghost', type: 'button', title: label, 'aria-label': label, 'data-role': role, onclick }, icon(name));
  const view = App.layout(AREA_NAME, { back: '#/', actions: [
    toolBtn('filePlus', 'Adicionar atividade (importar arquivo de estudo)', 'open-import', () => importSheet(() => drawList())),
    toolBtn('export', 'Exportar respostas', 'open-export', () => exportSheet()),
  ] });
  const list = h('div', { 'data-role': 'activities' }, h('p', { class: 'muted small', text: 'Carregando…' }));
  view.append(list);
  async function drawList() {
    const d = await loadCourse();
    list.replaceChildren();
    const all = Object.values(d.activities);
    if (!all.length) {
      list.append(h('div', { class: 'notice', 'data-role': 'no-activity' }, 'Nenhuma atividade ainda. Toque em ', icon('filePlus'), ' (no alto da tela) para adicionar um arquivo de estudo.'));
      return;
    }
    let group = null;
    for (const act of catalogOrder(all)) {
      const g = act.set ? `${act.set}` : '_';
      if (g !== group) { group = g; list.append(h('h2', { 'data-role': 'activity-group', text: act.set ? act.setTitle || 'Atividades' : 'Outras atividades' })); }
      list.append(activityCard(App, d, act, all, drawList));
    }
  }
  drawList();
  return () => { flushCourse(); };
}

function activityCard(App, d, act, all, redraw) {
  const s = summary(act);
  const lock = partLock(act, all);
  const name = act.part ? `Parte ${act.part}` : act.title;
  const open = () => { d.last = act.id; saveSoon(); App.go(qHref(act.id, resumeOf(act))); };
  const status = lock
    ? h('div', { class: 'small muted', 'data-role': 'activity-lock' }, icon('lock'), ` ${lock.reason}`)
    : h('div', { class: 'row nowrap small', style: { gap: '6px' } },
      h('span', { class: 'grow', 'data-role': 'activity-progress', text: `${s.done} de ${s.total} questões concluídas` }),
      h('span', { class: 'chip ok', 'data-role': 'offline', title: 'O conteúdo está salvo neste aparelho e funciona sem internet.' }, icon('check'), 'Offline'));
  const more = h('details', { class: 'more', 'data-role': 'activity-more' }, h('summary', { text: 'Opções' }),
    h('div', { class: 'row', style: { gap: '8px', margin: '4px 0 2px' } },
      h('button', { class: 'btn small', 'data-role': 'export-transfer', onclick: () => {
        download(`${slug(act.code || act.title)}-transferencia.json`, JSON.stringify(transferData(act)), 'application/json');
        toast('Cópia de segurança gerada: para restaurar ou continuar em outro aparelho, adicione este arquivo pelo ícone de adicionar.', 6000);
      } }, icon('download'), 'Cópia de segurança'),
      h('button', { class: 'btn small ghost', 'data-role': 'remove-activity', onclick: async () => {
        if (!(await confirmSheet(`Remover “${name}”?`, 'A atividade e as respostas dela saem deste aparelho. Se quiser guardar, gere antes a cópia de segurança.', { ok: 'Remover', danger: true }))) return;
        delete d.activities[act.id];
        if (d.last === act.id) d.last = null;
        await saveNow();
        redraw();
      } }, 'Remover')));
  return h('section', { class: `card${lock ? ' locked' : ''}`, style: { marginTop: '12px' }, 'data-role': 'activity', 'data-id': act.id, 'data-code': act.code || '' },
    h('div', { class: 'row nowrap' }, h('h3', { class: 'grow', style: { margin: 0 }, text: name }), lock ? null : practiceButton(act)),
    status,
    lock ? null : bar(s.total ? s.done / s.total : 0),
    lock ? null : h('button', { class: 'btn primary block', style: { marginTop: '10px' }, 'data-role': 'open-activity', onclick: open },
      icon('play'), s.done ? (s.complete ? 'Revisar' : `Continuar (questão ${resumeOf(act)})`) : 'Começar'),
    more);
}

// ---------- adicionar atividade: arquivo de estudo estruturado (formato oficial), arquivo de texto da atividade,
// cópia de segurança/transferência e respostas exportadas. Antes de alterar qualquer coisa, mostra o que será feito. ----------
const ACCEPT = `.json,application/json,${ACCEPT_TEXT}`;
function importSheet(onDone) {
  const out = h('div', { 'data-role': 'import-status', style: { marginTop: '10px' } });
  const paste = h('textarea', { class: 'field', rows: 4, placeholder: 'Cole aqui o texto da atividade', 'aria-label': 'Texto da atividade', 'data-role': 'import-text' });
  const file = h('input', { type: 'file', accept: ACCEPT, class: 'hidden', 'data-role': 'import-file',
    onchange: async (e) => { const f = e.target.files[0]; e.target.value = ''; if (!f) return; let text; try { text = await readImportFile(f); } catch (err) { return fail(`Não foi possível ler o arquivo: ${err.message}.`); } analyse(text); } });
  const sh = sheet(h('div', { 'data-role': 'import-sheet' },
    h('h2', { style: { marginTop: '4px' }, text: 'Adicionar atividade' }),
    h('p', { class: 'small muted', text: 'Escolha o arquivo de estudo (.json no formato do app). Também aceita o arquivo de texto da atividade (.txt, .docx, .md com “QUESTION 1”…) e a cópia de segurança de uma atividade. Nada é enviado: tudo fica neste aparelho.' }),
    h('label', { class: 'btn primary block' }, icon('filePlus'), 'Escolher arquivo', file),
    h('details', { class: 'more', style: { marginTop: '8px' } }, h('summary', { text: 'Ou colar o texto da atividade' }), paste,
      h('button', { class: 'btn block', style: { marginTop: '8px' }, 'data-role': 'import-paste', onclick: () => analyse(paste.value) }, 'Usar texto colado')),
    out), { label: 'Adicionar atividade' });
  const list = (items) => h('ul', { style: { margin: '6px 0 0', paddingLeft: '18px' } }, items.map((x) => h('li', { text: x })));
  function fail(msg, items) { out.replaceChildren(h('div', { class: 'notice bad', 'data-role': 'import-error' }, h('b', { text: 'Nada foi alterado. ' }), msg, items ? list(items) : null)); }
  function ok(msg) { out.replaceChildren(h('div', { class: 'notice ok', 'data-role': 'import-ok' }, msg)); onDone(); }
  function confirm(summaryEl, apply, label = 'Confirmar') {
    out.replaceChildren(h('div', { class: 'notice', 'data-role': 'import-preview' }, summaryEl,
      h('div', { class: 'row', style: { marginTop: '10px' } },
        h('button', { class: 'btn primary', 'data-role': 'import-apply', onclick: apply }, icon('check'), label),
        h('button', { class: 'btn', 'data-role': 'import-cancel', onclick: () => out.replaceChildren() }, 'Cancelar'))));
  }
  async function analyse(text) {
    out.replaceChildren();
    const d = await loadCourse();
    const acts = Object.values(d.activities);
    // 1) arquivo de estudo estruturado (formato oficial)
    const pkg = readPackage(text);
    if (pkg) {
      if (pkg.errors.length) return fail('O arquivo de estudo não está no formato esperado:', pkg.errors);
      const plan = planPackage(d, pkg);
      const nq = (p) => `${p.questions.length} ${p.questions.length === 1 ? 'questão' : 'questões'}`;
      const line = (st) => {
        const t = `Parte ${st.p.part} (${nq(st.p)})`;
        if (st.kind === 'new') return `${t}: nova.`;
        if (st.kind === 'same') return `${t}: já está neste aparelho, igual — nada muda.`;
        if (st.kind === 'adopt') return `${t}: já está neste aparelho — passa a fazer parte do catálogo; respostas mantidas.`;
        if (st.kind === 'update') return `${t}: versão ${st.p.version} diferente da que está aqui (${Math.round(st.sim * 100)}% dos trechos iguais) — atualização: as respostas dos trechos que não mudaram são mantidas e a versão anterior inteira fica guardada.`;
        return `${t}: o conteúdo já pertence a outra parte do catálogo — não será alterada.`;
      };
      const changes = plan.filter((x) => x.kind !== 'same' && x.kind !== 'conflict');
      const head = h('div', {}, h('b', { text: `${pkg.setTitle} — ${pkg.parts.length} ${pkg.parts.length === 1 ? 'parte' : 'partes'}, ${pkg.parts.reduce((n, p) => n + p.questions.length, 0)} questões` }), list(plan.map(line)));
      if (!changes.length) { out.replaceChildren(h('div', { class: 'notice', 'data-role': 'import-same' }, head)); return; }
      return confirm(head, async () => {
        await ensureSafetyCopy(d);
        const r = applyPackage(d, plan);
        const code = r.added[0] || r.adopted[0] || (r.updated[0] && r.updated[0].code);
        const first = Object.values(d.activities).find((a) => a.code === code);
        if (first) d.last = first.id;
        await saveNow();
        ok(`Pronto: ${[r.added.length && `${r.added.length} nova(s)`, r.adopted.length && `${r.adopted.length} reconhecida(s)`, r.updated.length && `${r.updated.length} atualizada(s)`].filter(Boolean).join(', ')}.`);
      }, changes.some((x) => x.kind === 'update') ? 'Atualizar' : 'Adicionar');
    }
    // 2) cópia de segurança / transferência de uma atividade
    let moved = null;
    try { moved = readTransfer(text); } catch (err) { return fail(`${err.message}.`); }
    if (moved) {
      const here = d.activities[moved.id] || findSame(acts, moved);
      const what = here ? `“${here.part ? `Parte ${here.part}` : here.title}” já está neste aparelho: em cada questão fica a versão editada por último.` : `A atividade será adicionada com ${summary(moved).done} de ${summary(moved).total} questões concluídas.`;
      return confirm(h('div', {}, h('b', { text: 'Cópia de segurança de uma atividade.' }), h('p', { style: { margin: '6px 0 0' }, text: what })), async () => {
        let act = here;
        if (here) mergeActivity(here, moved); else { act = moved; d.activities[act.id] = act; }
        d.last = act.id;
        await saveNow();
        ok('Cópia de segurança aplicada.');
      });
    }
    // 3) texto da atividade (QUESTION 1…) ou 4) respostas exportadas de uma atividade que já está aqui
    const p = parseActivity(text);
    if (!p.errors.length) {
      const twin = findSame(acts, p);
      if (twin) { out.replaceChildren(h('div', { class: 'notice', 'data-role': 'import-same' }, `“${twin.part ? `Parte ${twin.part}` : twin.title}” já está neste aparelho: nada muda e as respostas continuam as mesmas.`)); return; }
      const m = acts.length ? matchAnswers(text, acts) : null;
      if (m && !m.errors.length && m.matched) return answersPreview(m);
      // traz em boa parte o inglês de uma atividade daqui (respostas intercaladas ou cópia alterada): não vira atividade nova
      const near = acts.reduce((best, a) => Math.max(best, similarity(a, p)), 0);
      if (near >= 0.3 && m && m.errors.length) return fail('Este arquivo parece trazer respostas de uma atividade deste aparelho, mas não confere com ela:', m.errors);
      return confirm(h('div', {}, h('b', { text: `${p.title}: ${p.questions.length} questões, ${p.questions.reduce((n, q) => n + q.blocks.length, 0)} blocos.` })), async () => {
        const act = newActivity(p); d.activities[act.id] = act; d.last = act.id; await saveNow(); ok(`“${act.title}” adicionada.`);
      }, 'Adicionar');
    }
    const m = acts.length ? matchAnswers(text, acts) : null;
    if (m && !m.errors.length && m.matched) return answersPreview(m);
    return fail(m && m.errors.length && m.matched === 0 && /QUEST/i.test(text) ? 'O arquivo não confere com nenhuma atividade deste aparelho.' : p.errors.join(' '), m && m.errors.length ? m.errors : null);
    function answersPreview(r) {
      const nums = r.questions.map((q) => q.n);
      confirm(h('div', {}, h('b', { text: `Respostas da atividade “${r.act.part ? `Parte ${r.act.part}` : r.act.title}”: ${nums.length} de ${r.act.questions.length} questões identificadas.` }),
        r.warnings.length ? h('div', { class: 'small' }, 'Blocos sem resposta no arquivo (a resposta atual é mantida):', list(r.warnings)) : null), async () => {
        const res = applyOwnAnswers(r.act, r);
        d.last = r.act.id;
        await saveNow();
        ok(`Respostas importadas: ${res.updated.length} ${res.updated.length === 1 ? 'questão atualizada' : 'questões atualizadas'}.`);
      }, 'Importar respostas');
    }
  }
  return sh;
}

// ---------- exportar respostas (cópia; nunca altera nada). Parcial permitido, com aviso. ----------
async function exportSheet(preselect = null) {
  const d = await loadCourse();
  const acts = catalogOrder(Object.values(d.activities));
  const body = h('div', { 'data-role': 'export-sheet' }, h('h2', { style: { marginTop: '4px' }, text: 'Exportar respostas' }));
  const sh = sheet(body, { label: 'Exportar respostas' });
  if (!acts.length) { body.append(h('p', { class: 'small muted', 'data-role': 'export-empty', text: 'Nenhuma atividade neste aparelho ainda.' })); return sh; }
  let act = d.activities[preselect] || d.activities[d.last] || acts[0];
  const detail = h('div', { 'data-role': 'export-detail' });
  const pick = acts.length > 1 ? h('select', { class: 'field', 'aria-label': 'Atividade', 'data-role': 'export-pick', onchange: (e) => { act = d.activities[e.target.value]; draw(); } },
    acts.map((a) => h('option', { value: a.id, selected: a === act ? 'selected' : null, text: a.part ? `${a.setTitle || 'Atividades'} — Parte ${a.part}` : a.title }))) : null;
  body.append(h('p', { class: 'small muted', text: 'Gera uma cópia das suas respostas para enviar ao professor. Nada é apagado: você pode exportar de novo quando quiser.' }), pick, detail);
  function draw() {
    const r = exportReport(act);
    const base = slug(act.code || act.title);
    detail.replaceChildren(
      r.complete ? h('div', { class: 'notice ok', style: { marginTop: '10px' }, 'data-role': 'export-complete' }, 'Todas as questões estão respondidas.')
        : h('div', { class: 'notice warn', style: { marginTop: '10px' }, 'data-role': 'export-partial' }, h('b', { text: 'Contém respostas incompletas. ' }), `Faltam: ${r.missing.map((m) => `questão ${m.n}`).join(', ')}. A exportação traz o que já foi respondido e avisa o que falta.`),
      h('button', { class: 'btn primary block', style: { marginTop: '10px' }, 'data-role': 'export-txt', onclick: () => { download(`${base}-respostas.txt`, exportReport(act).text, 'text/plain'); toast('Arquivo de texto gerado.'); } }, icon('download'), 'Baixar texto (.txt)'),
      h('div', { class: 'row', style: { marginTop: '8px', gap: '8px' } },
        h('button', { class: 'btn grow', 'data-role': 'export-copy', onclick: async () => { try { await navigator.clipboard.writeText(exportReport(act).text); toast('Texto copiado.'); } catch (e) { toast('Não foi possível copiar; use o arquivo.'); } } }, 'Copiar texto'),
        h('button', { class: 'btn grow', 'data-role': 'export-json', onclick: () => { download(`${base}-respostas.json`, JSON.stringify(exportReport(act).json, null, 1), 'application/json'); toast('Arquivo JSON gerado.'); } }, 'Baixar JSON')));
  }
  draw();
  return sh;
}

// ---------- uma questão ----------
export function renderCourseQuestion(App, r) {
  const view = App.layout('Questão', { back: '#/course' });
  let alive = true;
  // avaliação automática: glossário en→pt (só nesta área) + memória das respostas validadas pelo professor
  Promise.all([loadCourse(), loadGlossary()]).then(([d]) => { if (!alive) return; setMemoryFrom(Object.values(d.activities)); draw(d); });
  function draw(d) {
    const act = d.activities[r.arg];
    if (!act) { view.append(h('div', { class: 'notice bad' }, 'Atividade não encontrada neste aparelho. ', h('a', { href: '#/course', text: 'Voltar' }))); return; }
    const total = act.questions.length;
    let n = Number(r.params.q) || resumeOf(act);
    n = Math.min(Math.max(1, n), total);
    const lock = partLock(act, Object.values(d.activities));
    if (lock) { view.append(h('div', { class: 'notice warn', 'data-role': 'q-locked' }, lock.reason, ' ', h('a', { href: '#/course', text: 'Voltar' }))); return; }
    if (!canOpen(act, n)) { App.go(qHref(act.id, resumeOf(act))); return; }
    const q = act.questions.find((x) => x.n === n);
    d.last = act.id;
    act.pos = { q: n, b: act.pos && act.pos.q === n ? act.pos.b || 0 : 0 };
    saveSoon();
    document.querySelector('.topbar h1').textContent = `Questão ${n} de ${total}`;

    const s = summary(act);
    const head = h('section', { class: 'card', 'data-role': 'course-head' },
      h('div', { class: 'row nowrap' }, h('div', { class: 'small muted grow', text: act.part ? `${act.setTitle || 'Atividades'} — Parte ${act.part}` : act.title }), practiceButton(act)),
      h('div', { class: 'row nowrap small', style: { marginTop: '4px' } }, h('span', { class: 'grow', 'data-role': 'course-progress', text: `${s.done} de ${total} questões concluídas` }), h('b', { text: `${Math.round((s.done / total) * 100)}%` })),
      bar(s.done / total),
      h('div', { class: 'chips', style: { marginTop: '8px' }, 'data-role': 'q-status' }));
    const nav = h('nav', { class: 'chips scroll', style: { margin: '10px 0' }, 'aria-label': 'Questões', 'data-role': 'q-nav' },
      act.questions.map((x) => {
        const ok = canOpen(act, x.n);
        return h('button', { class: `chip${isDone(act, x.n) ? ' ok' : ''}`, 'aria-pressed': x.n === n ? 'true' : 'false', disabled: !ok, 'aria-label': `Questão ${x.n}${isDone(act, x.n) ? ', concluída' : ''}`,
          onclick: () => App.go(qHref(act.id, x.n)) }, `${x.n}`);
      }));
    const statusChips = () => {
      const box = head.querySelector('[data-role="q-status"]');
      box.replaceChildren(
        h('span', { class: `chip ${isDone(act, n) ? 'ok' : answersOf(act, n).some((x) => x.trim()) ? 'warn' : ''}`, 'data-role': 'q-done', text: isDone(act, n) ? 'Concluída' : answersOf(act, n).some((x) => x.trim()) ? 'Em andamento' : 'Não iniciada' }));
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
      ta.value = answersOf(act, n)[i]; // a resposta de referência do professor (se houver) fica guardada à parte, não trava o campo
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
        chip.append(h('span', { class: `chip ${CHECK_CLASS[c.level]}`, 'data-level': c.level, text: `Avaliação automática: ${CHECK_LABEL[c.level]}` }), ' ', h('span', { class: 'muted', text: c.notes.join(' ') }));
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
      h('p', { class: 'small muted', text: 'Traduza cada bloco para o português. As respostas são salvas automaticamente enquanto você digita.' }),
      ...areas.map((x) => x.el), msg,
      h('div', { class: 'row nowrap', style: { marginTop: '14px' } }, prev, save),
      act.done[n] && !isValidated(act, n) ? h('p', { class: 'small muted', 'data-role': 'check-note', text: 'A avaliação automática compara o SENTIDO de cada bloco com o original (glossário inglês–português e respostas de referência já registradas): Adequada = sentido identificado; Incompatível = a resposta muda o sentido; Inconclusiva = não há evidência suficiente (não é erro). É só uma orientação de estudo: não muda sua resposta e não é a correção oficial.' }) : null,
      last && isDone(act, n) ? h('section', { class: 'card', style: { marginTop: '14px' }, 'data-role': 'export' },
        h('h3', { text: 'Atividade concluída' }),
        h('p', { class: 'small muted', text: 'Exporte as respostas para enviar ao professor (também pelo ícone de exportar, no alto da tela Curso — Atividades).' }),
        h('button', { class: 'btn primary block', 'data-role': 'open-export-final', onclick: () => exportSheet(act.id) }, icon('export'), 'Exportar respostas')) : null].filter(Boolean)); // append nativo escreveria “null”
    areas.forEach((x) => autosize(x.ta));
    const at = view.querySelector(`[data-pos="${act.pos.b}"]`);
    if (at && act.pos.b) at.scrollIntoView({ block: 'center' });
  }
  return () => { alive = false; flushCourse(); };
}

function autosize(ta) { ta.style.height = 'auto'; ta.style.height = `${Math.max(56, ta.scrollHeight + 2)}px`; }

/** Cartão do Início: acesso à área e onde continuar. */
export function courseHomeCard(App) {
  const info = h('div', { class: 'small', style: { marginTop: '6px' }, 'data-role': 'course-next' });
  loadCourse().then((d) => {
    const act = d.last && d.activities[d.last];
    if (!act) return;
    const s = summary(act);
    info.append(h('span', { class: 'muted', text: `${act.part ? `Parte ${act.part}` : act.title}: ` }), `${s.done} de ${s.total} questões concluídas`);
  });
  return h('section', { class: 'card', style: { marginTop: '12px' }, 'data-role': 'course-entry' },
    h('h3', { style: { margin: 0 }, text: AREA_NAME }),
    h('p', { class: 'small muted', style: { margin: '2px 0 8px' }, text: 'Traduções das atividades do curso e exportação das respostas.' }),
    info,
    h('a', { class: 'btn block primary', href: '#/course', style: { marginTop: '10px' }, 'data-role': 'open-course' }, icon('book'), 'Abrir'));
}
