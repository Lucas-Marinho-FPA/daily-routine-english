// Aplicativo instalável (PWA): registro do service worker, atualização controlada pelo aluno e instalação.
//
// Atualização (ver tools/sw.template.js): a versão nova é baixada em segundo plano e ESPERA. O app avisa
// (“Nova versão disponível”) fora das sessões de estudo; só quando o aluno toca “Atualizar agora” o progresso é
// gravado, a versão nova assume e o app recarrega. Depois de abrir com sucesso, o app pede a limpeza dos arquivos da
// versão anterior (CLEANUP). Falha no download: a versão em uso continua e o app tenta de novo mais tarde.
//
// Instalação: o botão “Instalar aplicativo” só aparece quando o navegador oferece a instalação nativa
// (beforeinstallprompt, Chrome/Edge no Android). Sem esse evento (Samsung Internet, Firefox…), o app mostra como instalar
// pelo menu do navegador — nunca simula uma instalação. Aberto como aplicativo (janela própria), nada disso aparece.
import { h, icon, toast } from './dom.js';
import { requestPersistence } from '../store/db.js';

const CHECK_EVERY_MS = 15 * 60 * 1000; // ao voltar ao app, no máximo uma verificação a cada 15 min
const RETRY_AFTER_MS = 60 * 1000; // verificação que falhou (sem internet): nova tentativa só depois de 1 min
const NO_BANNER = ['session']; // durante uma sessão o aviso não aparece (volta ao sair)
const LS_INSTALLED = 'drg.installed';

const listeners = new Set();
const notify = () => listeners.forEach((fn) => { try { fn(); } catch (e) { /* tela já fechada */ } });

const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } };

// O navegador pode oferecer a instalação logo no carregamento, antes de o app terminar de abrir (o estado vem do
// IndexedDB): o pedido é guardado já na importação deste módulo e entregue ao app em initPwa.
const early = { deferred: null, installed: false, app: null };
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // o app mostra o próprio botão, no lugar certo
    early.deferred = e;
    lsSet(LS_INSTALLED, null); // o navegador só oferece instalar quando o app não está instalado
    if (early.app) early.app();
  });
  window.addEventListener('appinstalled', () => {
    early.deferred = null;
    early.installed = true;
    lsSet(LS_INSTALLED, '1');
    if (early.app) early.app('installed');
  });
}

/** Aberto como aplicativo instalado (janela própria)? */
export function isStandalone() {
  try {
    return ['standalone', 'fullscreen', 'minimal-ui', 'window-controls-overlay'].some((m) => matchMedia(`(display-mode: ${m})`).matches) || navigator.standalone === true;
  } catch (e) { return false; }
}

/**
 * Estado compartilhado (App.pwa):
 *   install: 'standalone' | 'available' | 'installed-elsewhere' | 'manual' | 'unsupported'
 *   update:  null | 'downloading' | 'ready' | 'applying' | 'failed'
 */
export function initPwa(App) {
  const pwa = App.pwa = { install: 'manual', update: null, deferred: early.deferred, reg: null, version: null, lastCheck: 0, lastAttempt: 0, postponed: false };
  const refreshInstall = () => {
    pwa.install = isStandalone() ? 'standalone' : pwa.deferred ? 'available' : lsGet(LS_INSTALLED) ? 'installed-elsewhere' : 'manual';
  };
  refreshInstall();

  // ----- instalação (eventos capturados desde o carregamento; ver `early`) -----
  early.app = (what) => {
    pwa.deferred = early.deferred;
    refreshInstall(); notify();
    if (what === 'installed') {
      requestPersistence().catch(() => {}); // instalado, o navegador costuma conceder armazenamento persistente
      toast('Aplicativo instalado. Abra pelo ícone “Daily English” na tela inicial ou na gaveta de aplicativos.', 6000);
    }
  };
  try { matchMedia('(display-mode: standalone)').addEventListener('change', () => { refreshInstall(); notify(); }); } catch (e) { /* navegador antigo */ }

  // ----- service worker -----
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) { pwa.install = isStandalone() ? 'standalone' : 'unsupported'; return pwa; }
  const sw = navigator.serviceWorker;
  const firstInstall = !sw.controller;
  let reloading = false;
  sw.addEventListener('controllerchange', () => {
    if (pwa.update === 'applying') { if (!reloading) { reloading = true; location.reload(); } return; }
    if (firstInstall) toast('Pronto para uso offline: todo o conteúdo e o áudio estão salvos no aparelho.', 5000);
  });
  const watch = (worker) => {
    if (!worker) return;
    if (sw.controller) { pwa.update = 'downloading'; notify(); }
    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed' && sw.controller) { pwa.update = 'ready'; notify(); }
      if (worker.state === 'redundant' && pwa.update === 'downloading') { pwa.update = 'failed'; notify(); }
    });
  };
  // procura versão nova: ao abrir o app e ao voltar a ele (no máximo a cada 15 min). A verificação só conta como feita
  // quando o navegador de fato consultou o servidor; sem internet, tenta de novo (no máximo uma vez por minuto).
  let checking = false;
  const check = ({ opening = false } = {}) => {
    const now = Date.now();
    if (!pwa.reg || checking || document.visibilityState !== 'visible') return;
    if (!opening && now - pwa.lastCheck < CHECK_EVERY_MS) return;
    if (now - pwa.lastAttempt < RETRY_AFTER_MS) return;
    pwa.lastAttempt = now;
    checking = true;
    if (pwa.update === 'failed') { pwa.update = null; notify(); }
    pwa.reg.update().then(() => { pwa.lastCheck = Date.now(); }).catch(() => {}).finally(() => { checking = false; });
  };
  pwa.check = check;

  sw.register('sw.js').then((reg) => {
    pwa.reg = reg;
    if (reg.waiting && sw.controller) { pwa.update = 'ready'; notify(); }
    if (reg.installing) watch(reg.installing);
    reg.addEventListener('updatefound', () => watch(reg.installing));
    if (sw.controller) check({ opening: true }); // abertura (na 1ª instalação não há o que procurar)
  }).catch((e) => console.warn('SW não registrado', e));

  document.addEventListener('visibilitychange', () => check());
  window.addEventListener('focus', () => check());
  return pwa;
}

/** Depois que o app abriu com sucesso: versão em uso e limpeza dos arquivos de versões anteriores. */
export function confirmBoot(App) {
  const ctrl = 'serviceWorker' in navigator && navigator.serviceWorker.controller;
  if (!ctrl) return;
  const ask = (type) => new Promise((resolve) => {
    const ch = new MessageChannel();
    const t = setTimeout(() => resolve(null), 5000);
    ch.port1.onmessage = (e) => { clearTimeout(t); resolve(e.data); };
    ctrl.postMessage({ type }, [ch.port2]);
  });
  ask('CLEANUP').then((r) => { if (r && App.pwa) { App.pwa.version = r.version; App.pwa.cleaned = r.removed; notify(); } });
}

/** O aluno escolheu atualizar: grava o progresso e ativa a versão nova (o app recarrega ao trocar). */
export async function applyUpdate(App) {
  const pwa = App.pwa;
  const waiting = pwa && pwa.reg && pwa.reg.waiting;
  if (!waiting) { pwa.update = null; notify(); return false; }
  try { await App.flush(); } catch (e) { toast('Não foi possível gravar o progresso agora. A atualização foi adiada.', 6000); return false; }
  pwa.update = 'applying';
  notify();
  waiting.postMessage({ type: 'SKIP_WAITING' });
  setTimeout(() => { // sem troca em 10 s: algo deu errado; nada foi perdido
    if (pwa.update === 'applying') { pwa.update = 'ready'; notify(); toast('A atualização não foi concluída. Seu progresso está salvo; tente de novo.', 6000); }
  }, 10000);
  return true;
}

const currentRoute = () => location.hash.replace(/^#\/?/, '').split(/[/?]/)[0] || '';

/** Aviso de versão nova (fora das sessões): baixando, pronta ou falhou. “Depois” esconde até a próxima abertura. */
export function updateBanner(App) {
  const pwa = App.pwa;
  if (!pwa || NO_BANNER.includes(currentRoute())) return null;
  const st = pwa.update;
  if (st === 'downloading') {
    return h('div', { class: 'update-bar', role: 'status', 'aria-live': 'polite', 'data-role': 'update-downloading' },
      icon('download'),
      h('span', { class: 'grow', text: 'Baixando uma nova versão do aplicativo…' }));
  }
  if (st === 'failed') {
    return h('div', { class: 'update-bar warn', role: 'status', 'data-role': 'update-failed' },
      h('span', { class: 'grow', text: 'Não foi possível baixar a nova versão agora. O app continua funcionando; tentaremos de novo mais tarde.' }),
      h('button', { class: 'btn small ghost', onclick: () => { pwa.update = null; notify(); } }, 'OK'));
  }
  if ((st !== 'ready' && st !== 'applying') || pwa.postponed) return null;
  const now = h('button', { class: 'btn small primary', 'data-role': 'update-now', disabled: st === 'applying', onclick: () => applyUpdate(App) }, st === 'applying' ? 'Atualizando…' : 'Atualizar agora');
  return h('div', { class: 'update-bar', role: 'status', 'data-role': 'update-banner' },
    icon('refresh'),
    h('span', { class: 'grow', text: 'Nova versão disponível. Seu progresso fica salvo.' }),
    h('button', { class: 'btn small ghost', 'data-role': 'update-later', onclick: () => { pwa.postponed = true; notify(); } }, 'Depois'),
    now);
}

/** Redesenha um elemento quando o estado de instalação/atualização muda (enquanto estiver na tela). */
export function live(render) {
  const slot = h('div', { class: 'pwa-slot' });
  const draw = () => { if (!slot.isConnected && slot.dataset.drawn) { listeners.delete(draw); return; } slot.dataset.drawn = '1'; slot.replaceChildren(...[render()].filter(Boolean)); };
  listeners.add(draw);
  draw();
  return slot;
}

/** Instruções pelo menu do navegador (quando não há botão nativo). */
function manualSteps() {
  return h('div', { class: 'small', 'data-role': 'install-manual' },
    h('p', { style: { margin: '6px 0 4px' } }, h('b', { text: 'No Google Chrome: ' }), 'toque em ⋮ (canto superior direito) → “Instalar app” (ou “Adicionar à tela inicial” → “Instalar”).'),
    h('p', { style: { margin: '4px 0' } }, h('b', { text: 'No Samsung Internet: ' }), 'toque em ≡ (canto inferior direito) → “Adicionar página a” → “Tela inicial”.'),
    h('p', { class: 'muted', style: { margin: '4px 0 0' }, text: 'Depois, abra o Daily English pelo ícone. Instale pelo mesmo navegador que você já usa: cada navegador guarda o seu próprio progresso.' }));
}

/** Cartão de instalação. compact: versão curta para o Início (some quando instalado ou sem informação útil). */
export function installCard(App, { compact = false } = {}) {
  return live(() => {
    const pwa = App.pwa || { install: 'unsupported' };
    const st = pwa.install;
    if (st === 'standalone') return compact ? null : h('div', { class: 'card flat small', 'data-role': 'install-status', 'data-state': st }, '✓ Aberto como aplicativo instalado.');
    if (st === 'installed-elsewhere') {
      return h('div', { class: 'card flat small', 'data-role': 'install-status', 'data-state': st },
        'O aplicativo já está instalado neste aparelho. Abra pelo ícone “Daily English”.');
    }
    if (st === 'available') {
      const btn = h('button', { class: 'btn primary block', 'data-role': 'install-app', onclick: async () => {
        const ev = pwa.deferred;
        if (!ev) return;
        btn.disabled = true;
        try {
          await ev.prompt();
          const choice = await ev.userChoice;
          pwa.deferred = null; early.deferred = null; // o mesmo pedido não pode ser usado de novo
          if (choice && choice.outcome === 'accepted') { pwa.install = 'installed-elsewhere'; lsSet(LS_INSTALLED, '1'); }
          else { pwa.install = 'manual'; toast('Instalação cancelada. Você pode instalar depois pelo menu do navegador.', 5000); }
        } catch (e) { pwa.deferred = null; early.deferred = null; pwa.install = 'manual'; }
        notify();
      } }, icon('download'), 'Instalar aplicativo');
      return h('section', { class: 'card install-card', 'data-role': 'install-card', 'data-state': st },
        h('b', { text: 'Instale o Daily English' }),
        h('p', { class: 'small muted', style: { margin: '4px 0 10px' }, text: 'Fica na gaveta de aplicativos, abre em janela própria e funciona sem internet.' }),
        btn);
    }
    if (st === 'unsupported') return compact ? null : h('div', { class: 'card flat small', 'data-role': 'install-status', 'data-state': st }, 'Este modo de abertura não permite instalar. Abra o endereço do app no Chrome do celular.');
    // manual: o navegador não ofereceu o pedido nativo (ou ainda não ofereceu)
    if (compact) {
      return h('details', { class: 'card flat install-card', 'data-role': 'install-card', 'data-state': st },
        h('summary', { class: 'small' }, h('b', { text: 'Instalar como aplicativo' })), manualSteps(),
        h('a', { class: 'small', href: 'install.html', text: 'Página de instalação' }));
    }
    return h('section', { class: 'card install-card', 'data-role': 'install-card', 'data-state': st },
      h('b', { text: 'Instalar como aplicativo' }), manualSteps(),
      h('a', { class: 'btn small', href: 'install.html', style: { marginTop: '8px' } }, 'Página de instalação'));
  });
}

/** Linha de versão e atualização para Ajustes. */
export function updateStatus(App) {
  return live(() => {
    const pwa = App.pwa || {};
    const ver = pwa.version ? `Versão ${pwa.version}` : 'Versão em uso';
    const st = pwa.update;
    const action = st === 'ready' || st === 'applying'
      ? h('button', { class: 'btn small primary', 'data-role': 'update-now', disabled: st === 'applying', onclick: () => applyUpdate(App) }, st === 'applying' ? 'Atualizando…' : 'Atualizar agora')
      : h('button', { class: 'btn small', 'data-role': 'update-check', onclick: async () => {
        if (!pwa.reg) { toast('Atualização indisponível neste modo de abertura.'); return; }
        pwa.lastAttempt = Date.now();
        try { await pwa.reg.update(); pwa.lastCheck = Date.now(); toast(pwa.reg.installing || pwa.reg.waiting ? 'Baixando a nova versão…' : 'Você já está na versão mais recente.'); }
        catch (e) { toast('Sem conexão: não foi possível procurar atualizações agora.'); }
      } }, 'Procurar atualização');
    const text = st === 'ready' ? 'Nova versão pronta para instalar.' : st === 'downloading' ? 'Baixando a nova versão em segundo plano…' : st === 'failed' ? 'O último download da atualização falhou; o app tentará de novo.' : 'O app procura atualizações ao ser aberto e ao voltar para ele.';
    return h('div', { class: 'card flat small', 'data-role': 'update-status', 'data-state': st || 'idle' },
      h('div', { class: 'row nowrap' }, h('div', { class: 'grow' }, h('b', { text: ver }), h('div', { class: 'muted', text })), action),
      h('div', { class: 'tiny muted', style: { marginTop: '6px' }, text: 'Atualizar não apaga seu progresso. O reconhecimento de fala baixado continua guardado.' }));
  });
}
