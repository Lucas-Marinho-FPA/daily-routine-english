// Ajustes (áudio, acessibilidade, metas, backup, dados) e checklist antes da aula.
import { h, icon, clear, toast, confirmSheet, fmtDate } from './dom.js';
import * as player from '../audio/player.js';
import * as asr from '../audio/asr.js';
import * as recorder from '../audio/recorder.js';
import * as db from '../store/db.js';
import { freshState } from '../engine/progress.js';

export function renderSettings(App) {
  const { state } = App;
  const s = state.settings;
  const view = App.layout('Ajustes', { back: '#/' });
  const set = (k, v) => { s[k] = v; App.applySettings(); App.save(); };

  const seg = (label, key, options) => {
    const box = h('div', { class: 'seg', role: 'group', 'aria-label': label });
    const draw = () => clear(box).append(...options.map(([v, t]) => h('button', { 'aria-pressed': String(s[key] === v), onclick: () => { set(key, v); draw(); } }, t)));
    draw();
    return h('div', { style: { marginBottom: '14px' } }, h('label', { class: 'lbl', text: label }), box);
  };
  const toggle = (label, key, sub) => {
    const input = h('input', { type: 'checkbox', checked: !!s[key], style: { width: '24px', height: '24px' } });
    input.addEventListener('change', () => set(key, input.checked));
    return h('label', { class: 'row nowrap', style: { minHeight: '48px', marginBottom: '8px' } }, h('div', { style: { flex: 1 } }, h('div', { style: { fontWeight: 600 }, text: label }), sub ? h('div', { class: 'small muted', text: sub }) : null), input);
  };

  // ---------- áudio ----------
  const voiceSel = h('select', { class: 'field', 'aria-label': 'Voz do sistema' });
  const diag = h('div', { class: 'kv small', style: { marginTop: '10px' } });
  view.append(h('h2', { text: 'Áudio' }), h('div', { class: 'card' },
    seg('Fonte da voz de referência', 'audioSource', [['embedded', 'Embutida (britânica)'], ['system', 'Voz do sistema']]),
    h('p', { class: 'small muted', text: 'A voz embutida foi gerada offline em inglês britânico e funciona sem internet. A voz do sistema depende das vozes instaladas no Android.' }),
    seg('Velocidade', 'rate', [[0.75, '0,75×'], [0.9, '0,9×'], [1, '1×'], [1.15, '1,15×']]),
    toggle('Tocar áudio automaticamente', 'autoplay', 'Nos exercícios e ao mostrar a resposta.'),
    h('label', { class: 'lbl', text: 'Voz do sistema (quando usada)' }), voiceSel,
    h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'btn small', onclick: () => player.play({ key: null, text: 'I wake up at five, take a shower and brush my teeth.' }).then((r) => toast(r.ok ? 'Voz do sistema OK' : 'Voz do sistema indisponível')) }, icon('speaker'), 'Testar voz do sistema'),
      h('button', { class: 'btn small', onclick: () => player.play({ key: App.content.sentences['R01-B1-S1'].au, text: '' }).then((r) => toast(r.ok ? 'Áudio embutido OK' : 'Áudio embutido indisponível')) }, icon('speaker'), 'Testar áudio embutido')),
    diag));
  player.diagnose().then((d) => {
    clear(voiceSel).append(h('option', { value: '', text: 'Automática (en-GB local preferida)' }), ...d.englishVoices.map((v) => h('option', { value: v.uri, selected: v.uri === s.voiceURI, text: `${v.name} (${v.lang}${v.local ? '' : ', online'})` })));
    voiceSel.onchange = () => set('voiceURI', voiceSel.value);
    Promise.resolve(asr.cachedStatus() || 'não verificado').then((a) => {
      recorder.permissionState().then((mic) => {
        clear(diag).append(
          h('span', { text: 'Áudios embutidos' }), h('span', { text: `${d.embedded} (${d.embeddedVoice || '—'})` }),
          h('span', { text: 'Vozes inglesas do sistema' }), h('span', { text: `${d.englishVoices.length} (${d.englishVoices.filter((v) => /GB/i.test(v.lang)).length} en-GB)` }),
          h('span', { text: 'Gravação' }), h('span', { text: recorder.supported() ? `disponível · microfone: ${{ granted: 'permitido', denied: 'bloqueado', prompt: 'perguntará' }[mic] || mic}` : 'indisponível' }),
          h('span', { text: 'Reconhecimento no aparelho' }), h('span', { text: { available: 'disponível', downloadable: 'pode ser baixado', downloading: 'baixando', unavailable: 'indisponível', unsupported: 'não suportado' }[a] || `${a} (verifique no Speaking Lab)` }));
      });
    });
  });

  // ---------- leitura e acessibilidade ----------
  view.append(h('h2', { text: 'Leitura e acessibilidade' }), h('div', { class: 'card' },
    seg('Tamanho do texto', 'fontScale', [[1, 'Normal'], [1.15, 'Grande'], [1.3, 'Maior']]),
    seg('Tema', 'theme', [['auto', 'Automático'], ['light', 'Claro'], ['dark', 'Escuro']]),
    toggle('Reduzir animações', 'reduceMotion'),
    seg('Meta diária (exercícios)', 'dailyGoal', [[8, '8'], [12, '12'], [20, '20']])));

  // ---------- dados ----------
  const usage = h('div', { class: 'kv small' });
  view.append(h('h2', { text: 'Seus dados' }), h('div', { class: 'card stack' },
    h('p', { class: 'small', text: 'Todo o progresso fica somente neste aparelho. Nada é enviado para a internet. Se você limpar os dados do navegador ou trocar de aparelho, só o backup recupera o progresso.' }),
    usage,
    h('div', { class: 'row' },
      h('button', { class: 'btn', onclick: exportNow }, icon('download'), 'Exportar backup'),
      h('label', { class: 'btn', role: 'button', tabindex: '0' }, icon('upload'), 'Importar backup',
        h('input', { type: 'file', accept: 'application/json,.json', class: 'hidden', onchange: (e) => importFile(e.target.files[0]) }))),
    h('button', { class: 'btn small', onclick: async () => { const ok = await db.requestPersistence(); toast(ok ? 'Armazenamento persistente ativo' : 'O navegador não concedeu armazenamento persistente (instalar o app na tela inicial ajuda).'); drawUsage(); } }, 'Proteger dados contra limpeza automática'),
    h('button', { class: 'btn danger', onclick: wipe }, 'Apagar todo o progresso…')));

  async function drawUsage() {
    let persisted = null, quota = null;
    try { persisted = await navigator.storage.persisted(); const est = await navigator.storage.estimate(); quota = est; } catch (e) { /* ok */ }
    const r = await db.recordingsUsage();
    clear(usage).append(
      h('span', { text: 'Armazenamento' }), h('span', { text: db.backend === 'indexeddb' ? 'IndexedDB' : db.backend === 'localstorage' ? 'localStorage (limitado)' : '—' }),
      h('span', { text: 'Protegido contra limpeza' }), h('span', { text: persisted === null ? '—' : persisted ? 'sim' : 'não' }),
      h('span', { text: 'Cartões de estudo' }), h('span', { text: String(Object.keys(state.cards).length) }),
      h('span', { text: 'Gravações salvas' }), h('span', { text: `${r.count} (${Math.round(r.bytes / 1024)} KB)` }),
      h('span', { text: 'Uso total' }), h('span', { text: quota ? `${Math.round(quota.usage / 1048576)} MB` : '—' }),
      h('span', { text: 'Último backup' }), h('span', { text: state.lastBackupAt ? fmtDate(state.lastBackupAt) : 'nunca' }));
  }
  drawUsage();

  function exportNow() {
    state.lastBackupAt = Date.now();
    App.save();
    const blob = db.exportBackup(state);
    const a = h('a', { href: URL.createObjectURL(blob), download: `daily-routine-backup-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.append(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast('Backup gerado. Guarde o arquivo em local seguro (gravações de voz não entram no backup).', 5000);
    drawUsage();
  }

  async function importFile(file) {
    if (!file) return;
    try {
      const incoming = await db.parseBackup(file, App.content.version);
      const n = Object.keys(incoming.cards).length;
      const ok = await confirmSheet('Restaurar backup?', `O progresso atual (${Object.keys(state.cards).length} cartões) será substituído pelo do backup (${n} cartões, ${incoming.xp} XP). Uma cópia do atual fica guardada no aparelho.`, { ok: 'Restaurar' });
      if (!ok) return;
      await db.keepPrevious(state);
      App.state = incoming;
      await db.saveState(incoming);
      App.rebuildChecker();
      App.applySettings();
      toast('Backup restaurado.');
      App.go('#/');
    } catch (e) {
      toast(`Não foi possível importar: ${e.message}`, 6000);
    }
  }

  async function wipe() {
    const ok = await confirmSheet('Apagar todo o progresso?', 'XP, revisões, conquistas, respostas e gravações serão apagados deste aparelho. Recomendo exportar um backup antes. Esta ação não pode ser desfeita.', { ok: 'Exportar backup e apagar', danger: true });
    if (!ok) return;
    exportNow();
    const sure = await confirmSheet('Confirmar exclusão', 'O backup foi baixado. Apagar agora?', { ok: 'Apagar', danger: true });
    if (!sure) return;
    await db.wipeState();
    App.state = freshState(App.content.version);
    App.state.settings = { ...App.state.settings, ...s };
    await db.saveState(App.state);
    App.rebuildChecker();
    toast('Progresso apagado.');
    App.go('#/');
  }

  // ---------- sobre ----------
  view.append(h('h2', { text: 'Sobre' }), h('div', { class: 'card small' },
    h('div', { class: 'kv' },
      h('span', { text: 'App' }), h('span', { text: '1.0.0 (MVP)' }),
      h('span', { text: 'Conteúdo' }), h('span', { text: `${App.content.version} · ${App.content.builtAt}` }),
      h('span', { text: 'Fonte' }), h('span', { text: 'Daily Routines — Conversation Practice (Word)' }),
      h('span', { text: 'Modo' }), h('span', { text: `${location.protocol.replace(':', '')}${navigator.serviceWorker && navigator.serviceWorker.controller ? ' · offline ativo' : ''}` }),
      h('span', { text: 'Internet' }), h('span', { text: navigator.onLine ? 'conectado (não é necessário)' : 'offline' })),
    h('p', { class: 'tiny muted', style: { marginTop: '10px' }, text: 'Voz embutida: modelo Kokoro (Apache-2.0), gerada offline. Conteúdo novo é marcado como tal; o restante vem do Word.' })));
}

export function renderChecklist(App) {
  const { state, content } = App;
  const view = App.layout('Checklist antes da aula', { back: '#/' });
  const links = ['#/routine/R01', '#/lab?q=R01.Q3', '#/lab?q=G.Q08', '#/category/time', '#/category/verb', '#/lab?drill=2'];
  view.append(h('p', { class: 'small muted', text: 'Os seis pontos do material. Marque quando se sentir seguro; a data fica registrada.' }));
  const list = h('ul', { class: 'list card' });
  const draw = () => clear(list).append(...content.checklist.map((item, i) => {
    const done = state.checklist[i];
    const cb = h('input', { type: 'checkbox', checked: !!done, 'aria-label': item, style: { width: '24px', height: '24px', flex: 'none' } });
    cb.addEventListener('change', () => { if (cb.checked) state.checklist[i] = Date.now(); else delete state.checklist[i]; App.save(); draw(); });
    return h('li', {}, h('div', { class: 'list-btn' }, cb,
      h('div', { class: 'grow' }, h('div', { class: 'title', text: item }), done ? h('div', { class: 'tiny muted', text: `marcado em ${fmtDate(done)}` }) : null),
      h('a', { class: 'btn small', href: links[i] || '#/explore' }, 'Praticar')));
  }));
  draw();
  view.append(list, h('div', { class: 'notice', style: { marginTop: '14px' }, text: content.meta.mainGoal }));
}
