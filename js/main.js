// Inicialização, roteamento por hash e contexto compartilhado do app.
import { h, clear, icon, toast } from './ui/dom.js';
import { createChecker } from './engine/checker.js';
import { dayNumber } from './engine/scheduler.js';
import * as db from './store/db.js';
import * as player from './audio/player.js';
import * as localasr from './audio/localasr.js';
import { renderHome } from './ui/home.js';
import { renderExplore, renderRoutine, renderContext, renderCategory } from './ui/explore.js';
import { renderSession } from './ui/session.js';
import { renderLab } from './ui/lab.js';
import { renderReview } from './ui/review.js';
import { renderStats } from './ui/stats.js';
import { renderSettings, renderChecklist } from './ui/settings.js';

export const APP_VERSION = '1.0.0';

const App = {
  content: globalThis.DRG_CONTENT,
  state: null,
  checker: null,
  storageProblem: null,
  isNew: false,
  today: () => dayNumber(),
  save() { db.saveSoon(App.state); },
  flush() { return db.flush(App.state); },
  go(hash) { if (location.hash === hash) route(); else location.hash = hash; },
  rebuildChecker() { App.checker = createChecker(App.content.language, { userVariants: App.state.userVariants }); },
  applySettings() {
    const s = App.state.settings;
    const root = document.documentElement;
    if (s.theme === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', s.theme);
    root.style.setProperty('--fs', String(s.fontScale || 1));
    document.body.classList.toggle('reduce-motion', !!s.reduceMotion);
    player.configure({ audioSource: s.audioSource, voiceURI: s.voiceURI, rate: s.rate });
  },
};
App.asr = { local: localasr }; // diagnóstico (usado pelos testes automatizados)
globalThis.DRG_APP = App; // usado pelos testes automatizados

const TABS = [
  { hash: '#/', label: 'Início', icon: 'home', match: (r) => r === '' },
  { hash: '#/explore', label: 'Estudar', icon: 'book', match: (r) => ['explore', 'routine', 'context', 'category', 'checklist'].includes(r) },
  { hash: '#/lab', label: 'Falar', icon: 'mic', match: (r) => r === 'lab' },
  { hash: '#/stats', label: 'Progresso', icon: 'chart', match: (r) => ['stats', 'review'].includes(r) },
];

const root = document.getElementById('app');
let cleanup = null;

function layout(title, { back = null, actions = [], nav = true } = {}) {
  clear(root);
  const top = h('header', { class: 'topbar' },
    back ? h('button', { class: 'icon-btn ghost', 'aria-label': 'Voltar', onclick: () => (back === true ? history.back() : App.go(back)) }, icon('back')) : null,
    h('h1', { text: title }),
    ...actions);
  const view = h('main', { class: `view${nav ? '' : ' no-nav'}`, id: 'view' });
  root.append(top, view);
  if (nav) {
    const r = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]) || '';
    root.append(h('nav', { class: 'nav', 'aria-label': 'Principal' },
      TABS.map((t) => h('a', { href: t.hash, 'aria-current': t.match(r) ? 'page' : null }, icon(t.icon), t.label))));
  }
  return view;
}
App.layout = layout;

function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const params = Object.fromEntries(new URLSearchParams(query));
  return { name: parts[0] || '', arg: parts[1] ? decodeURIComponent(parts[1]) : null, params };
}

function route() {
  player.stopAll();
  if (cleanup) { try { cleanup(); } catch (e) { /* ok */ } cleanup = null; }
  const r = parseRoute();
  window.scrollTo(0, 0);
  try {
    const screens = {
      '': renderHome, explore: renderExplore, routine: renderRoutine, context: renderContext, category: renderCategory,
      session: renderSession, lab: renderLab, review: renderReview, stats: renderStats, settings: renderSettings, checklist: renderChecklist,
    };
    const fn = screens[r.name] || renderHome;
    cleanup = fn(App, r) || null;
  } catch (e) {
    console.error(e);
    const v = layout('Algo deu errado', { back: '#/' });
    v.append(h('div', { class: 'notice bad' }, `Erro ao abrir a tela: ${e.message}. Seu progresso está salvo.`));
  }
}

async function boot() {
  if (!App.content) {
    root.append(h('div', { class: 'view' }, h('div', { class: 'notice bad' }, 'Conteúdo não encontrado (data/content.js). Reinstale o app.')));
    return;
  }
  const { state, isNew, problem } = await db.loadState(App.content.version);
  App.state = state;
  App.isNew = isNew;
  App.storageProblem = problem;
  App.rebuildChecker();
  App.applySettings();
  if (isNew) await db.saveState(state).catch(() => {});
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') App.flush().catch(() => {}); });
  window.addEventListener('pagehide', () => { App.flush().catch(() => {}); });
  route();
  if (problem) toast(problem, 6000);
  registerServiceWorker();
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  const firstInstall = !navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (firstInstall) toast('Pronto para uso offline: todo o conteúdo e o áudio estão salvos no aparelho.', 5000);
  });
  navigator.serviceWorker.register('sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const w = reg.installing;
      w && w.addEventListener('statechange', () => {
        if (w.state === 'installed' && navigator.serviceWorker.controller) toast('Nova versão instalada. Feche e reabra o app para usar.', 5000);
      });
    });
  }).catch((e) => console.warn('SW não registrado', e));
}

boot();
