// Ajustes (áudio, acessibilidade, metas, backup, dados) e checklist antes da aula.
import { h, icon, clear, toast, confirmSheet, fmtDate } from './dom.js';
import * as player from '../audio/player.js';
import * as asr from '../audio/asr.js';
import * as localasr from '../audio/localasr.js';
import * as recorder from '../audio/recorder.js';
import * as db from '../store/db.js';
import { storageReport } from '../store/storage.js';
import { freshState } from '../engine/progress.js';
import { registry, visualStatus } from '../engine/characters.js';
import { characterBadge } from './character.js';

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
  // personagem: troca só o conteúdo praticado; o progresso de cada um fica guardado
  const chars = h('div', { class: 'list card', role: 'radiogroup', 'aria-label': 'Personagem', 'data-role': 'characters' });
  const drawChars = () => clear(chars).append(...registry().characters.map((c) => {
    const on = App.character.id === c.id;
    const vs = visualStatus(c);
    const pack = c.content === 'base' ? App.baseContent : c.content;
    const sub = c.profile && c.profile.occupation ? `${c.profile.occupation.pt} · ` : '';
    const btn = h('button', { class: 'list-btn char-opt', type: 'button', role: 'radio', 'aria-checked': String(on), 'data-character': c.id },
      characterBadge(c, 'idle'),
      h('div', { class: 'grow' },
        h('div', { class: 'title' }, c.name, c.status === 'preview' ? h('span', { class: 'chip', style: { marginLeft: '8px' }, text: 'em preparação' }) : null),
        h('div', { class: 'small muted', text: `${sub}${pack.routines.length} rotina(s), ${Object.keys(pack.sentences).length} frases` }),
        h('div', { class: 'tiny muted', text: `Imagens: ${vs.ready.length} de 6 prontas${c.status === 'preview' ? ' · áudio de referência: voz do aparelho' : ''}` })),
      on ? icon('check') : null);
    btn.onclick = () => {
      if (on) return;
      App.chooseCharacter(c.id); // grava já: trocar e fechar o app logo em seguida não pode perder a escolha
      toast(`Praticando com ${c.name}. O progresso com cada personagem continua salvo.`);
      drawChars();
    };
    return h('li', {}, btn);
  }));
  drawChars();
  view.append(h('h2', { text: 'Personagem' }), chars,
    h('p', { class: 'tiny muted', text: 'Cada personagem tem rotinas e frases próprias. Palavras comuns às duas rotinas são revisadas juntas; XP, nível e sequência de dias são os mesmos.' }));

  view.append(h('h2', { text: 'Áudio' }), h('div', { class: 'card' },
    seg('Fonte da voz de referência', 'audioSource', [['embedded', 'Embutida (britânica)'], ['system', 'Voz do sistema']]),
    h('p', { class: 'small muted', text: 'A voz embutida foi gerada offline em inglês britânico e funciona sem internet. A voz do sistema depende das vozes instaladas no Android.' }),
    seg('Velocidade', 'rate', [[0.75, '0,75×'], [0.9, '0,9×'], [1, '1×'], [1.15, '1,15×']]),
    toggle('Tocar áudio automaticamente', 'autoplay', 'Nos exercícios e ao mostrar a resposta.'),
    h('label', { class: 'lbl', text: 'Voz do sistema (quando usada)' }), voiceSel,
    h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'btn small', onclick: () => player.play({ key: null, text: 'I wake up at five, take a shower and brush my teeth.' }).then((r) => toast(r.ok ? 'Voz do sistema OK' : 'Voz do sistema indisponível')) }, icon('speaker'), 'Testar voz do sistema'),
      h('button', { class: 'btn small', onclick: () => player.play({ key: App.baseContent.sentences['R01-B1-S1'].au, text: '' }).then((r) => toast(r.ok ? 'Áudio embutido OK' : 'Áudio embutido indisponível')) }, icon('speaker'), 'Testar áudio embutido')),
    diag));
  player.diagnose().then((d) => {
    clear(voiceSel).append(h('option', { value: '', text: 'Automática (en-GB local preferida)' }), ...d.englishVoices.map((v) => h('option', { value: v.uri, selected: v.uri === s.voiceURI, text: `${v.name} (${v.lang}${v.local ? '' : ', online'})` })));
    voiceSel.onchange = () => set('voiceURI', voiceSel.value);
    // o modo local do Chrome não é consultado aqui (só no Speaking Lab, a pedido): ver lab.js/detectEngine
    Promise.all([asr.cachedStatus() || 'não verificado', localasr.status()]).then(([a, local]) => {
      recorder.permissionState().then((mic) => {
        clear(diag).append(
          h('span', { text: 'Áudios embutidos' }), h('span', { text: `${d.embedded} (${d.embeddedVoice || '—'})` }),
          h('span', { text: 'Vozes inglesas do sistema' }), h('span', { text: `${d.englishVoices.length} (${d.englishVoices.filter((v) => /GB/i.test(v.lang)).length} en-GB)` }),
          h('span', { text: 'Gravação' }), h('span', { text: recorder.supported() ? `disponível · microfone: ${{ granted: 'permitido', denied: 'bloqueado', prompt: 'perguntará' }[mic] || mic}` : 'indisponível' }),
          h('span', { text: 'Reconhecimento local do Chrome' }), h('span', { text: { available: 'disponível', downloadable: 'pode ser baixado', downloading: 'baixando', unavailable: 'indisponível neste navegador', unsupported: 'não suportado neste navegador' }[a] || a }),
          h('span', { text: 'Reconhecimento local (modelo do app)' }), h('span', {},
            { installed: `instalado (${localasr.sizeLabel()}) `, 'not-installed': 'não baixado (opcional, no Speaking Lab)', unsupported: `indisponível: ${localasr.unsupportedReason()}` }[local],
            local === 'installed' ? h('button', { class: 'btn small', onclick: async (e) => { e.currentTarget.disabled = true; await localasr.remove(); toast('Modelo de reconhecimento removido.'); App.go(location.hash); } }, 'Remover') : null),
          h('span', { text: 'Reconhecimento online' }), h('span', { text: 'nunca usado (enviaria sua voz para fora do aparelho)' }));
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
    h('p', { class: 'tiny muted', text: 'Os áudios das suas gravações são apagados automaticamente 7 dias depois de gravados; transcrições, avaliações e progresso continuam. A proteção contra limpeza é um pedido ao navegador e não impede que o sistema ou você apaguem os dados do site.' }),
    h('button', { class: 'btn danger', onclick: wipe }, 'Apagar todo o progresso…')));

  async function drawUsage() {
    clear(usage).append(h('span', { class: 'muted', text: 'Medindo…' }), h('span', {}));
    if (App.runRetention) await App.runRetention(); // aplica a retenção antes de contar
    const r = await storageReport();
    if (!usage.isConnected) return;
    const kb = (b) => `${Math.round(b / 1024).toLocaleString('pt-BR')} KB`;
    const mb = (b) => `${(b / 1048576).toLocaleString('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 })} MB`;
    const row = (label, value, role) => [h('span', { text: label }), h('span', { text: value, 'data-role': role || null })];
    clear(usage).append(
      ...row('Armazenamento', db.backend === 'indexeddb' ? 'IndexedDB' : db.backend === 'localstorage' ? 'localStorage (limitado)' : '—'),
      ...row('Protegido contra limpeza', r.persisted === null ? '—' : r.persisted ? 'sim (pedido aceito pelo navegador)' : 'não', 'persisted'),
      ...row('Cartões de estudo', String(Object.keys(state.cards).length)),
      ...row('Gravações salvas', `${r.recordings.count} (${kb(r.recordings.bytes)})`, 'rec-usage'),
      ...(r.recordings.textOnly ? row('Resultados sem áudio', `${r.recordings.textOnly} (áudio já apagado; transcrição e análise mantidas)`, 'rec-textonly') : []),
      ...row('Progresso e respostas', kb(r.study), 'study-usage'),
      ...(r.cache ? row('App offline (textos e áudios de referência)', mb(r.cache.app), 'app-cache') : []),
      ...(r.cache ? row('Reconhecimento de fala local', r.cache.asr ? mb(r.cache.asr) : 'não instalado', 'asr-cache') : []),
      ...row('Uso total (estimativa do navegador)', r.usage === null ? '—' : `≈ ${mb(r.usage)}`, 'usage-total'),
      ...(r.unattributed ? row('Não atribuído (dados internos do navegador)', `≈ ${mb(r.unattributed)}`, 'usage-other') : []),
      ...row('Último backup', state.lastBackupAt ? fmtDate(state.lastBackupAt) : 'nunca'));
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
