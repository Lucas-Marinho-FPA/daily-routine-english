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
import { contentFor, characterById, registry, isPlanned } from './engine/characters.js';
import { activate, profileIdFor, journeyProfile, makeOwnerOf } from './engine/profiles.js';
import { journeyById, journeyView, journeyRegistry } from './engine/journeys.js';
import { renderModules, renderModule, renderWords, renderStories, plannedNotice } from './ui/modules.js';
import { initPwa, confirmBoot, updateBanner, live } from './ui/pwa.js';
import { applyTranslations } from './engine/translations.js';
applyTranslations(); // traduções de apoio (perguntas e respostas-modelo) antes de montar qualquer visão

export const APP_VERSION = '1.0.0';

const App = {
  baseContent: globalThis.DRG_CONTENT, // conteúdo do Lucas (data/content.js), nunca alterado
  content: globalThis.DRG_CONTENT, // visão do personagem ativo (engine/characters.js); o motor só enxerga esta
  character: null,
  journey: null, // jornada independente ativa (Conversation Practice) ou null = rotinas do personagem
  state: null,
  checker: null,
  storageProblem: null,
  isNew: false,
  today: () => dayNumber(),
  save() { db.saveSoon(App.state); },
  flush() { return db.flush(App.state); },
  /** Abre uma tela. Redirecionamento (durante a montagem de uma tela, ou { replace: true }) SUBSTITUI a entrada do
   *  histórico: o Voltar do Android e o do app não caem de novo na tela que redirecionou (sem ciclos). */
  go(hash, { replace = rendering } = {}) {
    if (location.hash === hash) { route(); return; }
    if (replace) { nav.replaceNext = true; location.replace(hash); } else location.hash = hash;
  },
  /** Volta à tela de origem real (a mesma do Voltar do Android); sem origem nesta abertura, vai para `fallback`. */
  back(fallback = '#/') {
    if (nav.stack.length >= 2) history.back();
    else App.go(fallback, { replace: true });
  },
  rebuildChecker() { App.checker = createChecker(App.content.language, { userVariants: App.state.userVariants }); },
  /** Troca a persona ativa: visão de conteúdo e perfil de progresso dela; o progresso das outras fica intacto. */
  setCharacter(id) {
    App.character = characterById(id);
    App.content = App.journey ? journeyView(App.baseContent, App.journey.id) : contentFor(App.baseContent, App.character.id);
    if (App.state && App.state.settings.character !== App.character.id) App.state.settings.character = App.character.id; // quem chama grava
    if (App.state) activate(App.state, profileIdFor(App.character.id, App.journey && App.journey.id), App.today());
  },
  /** Escolha feita pela pessoa (primeira escolha, Início ou Ajustes): troca, marca como escolhido e grava já. */
  chooseCharacter(id) {
    App.setCharacter(id);
    App.state.settings.characterChosen = true;
    App.rebuildChecker();
    return App.flush().catch(() => {}); // trocar e fechar o app logo em seguida não pode perder a escolha
  },
  /** Entra (id) ou sai (null) de uma jornada independente: troca só a visão de conteúdo; personagem e progresso intactos. */
  setJourney(id) {
    App.journey = id ? journeyById(id) : null;
    if (App.state) App.state.settings.journey = App.journey ? App.journey.id : null;
    App.content = App.journey ? journeyView(App.baseContent, App.journey.id) : contentFor(App.baseContent, App.character.id);
    if (App.state) activate(App.state, profileIdFor(App.character.id, App.journey && App.journey.id), App.today());
    App.rebuildChecker();
    return App.flush().catch(() => {});
  },
  /** Passa a usar um estado inteiro (carregado, importado ou recém-criado): persona, jornada e perfil salvos nele. */
  adoptState(state) {
    App.state = state;
    App.journey = journeyById(state.settings.journey);
    App.setCharacter(state.settings.character);
    App.rebuildChecker();
    App.applySettings();
  },
  /** Visões de conteúdo de cada perfil (Lucas primeiro: dono dos itens genéricos compartilhados). */
  profileViews() {
    const chars = registry().characters.map((c) => ({ profile: c.id, content: c.content === 'base' ? App.baseContent : c.content ? contentFor(App.baseContent, c.id) : null }));
    const js = journeyRegistry().map((j) => ({ profile: journeyProfile(j.id), content: journeyView(App.baseContent, j.id) }));
    return [...chars.sort((a, b) => (a.profile === 'lucas' ? -1 : b.profile === 'lucas' ? 1 : 0)), ...js];
  },
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

// navegação inferior: as duas jornadas têm entrada própria (contextos nunca se misturam), o Speaking Lab é uma
// ferramenta à parte (ligada aos módulos) e o Progresso mostra as duas jornadas separadas
const STUDY = ['modules', 'module', 'words', 'explore', 'routine', 'context', 'category', 'checklist', 'stories'];
const TABS = [
  { hash: '#/', label: 'Início', icon: 'home', match: (r) => r === '' },
  { hash: '#/dr', label: 'Daily Routine', icon: 'book', match: (r) => r === 'dr' || (STUDY.includes(r) && !App.journey) },
  { hash: '#/cp', label: 'Conversation', icon: 'chat', match: (r) => r === 'cp' || (STUDY.includes(r) && !!App.journey) },
  { hash: '#/lab', label: 'Falar', icon: 'mic', match: (r) => r === 'lab' },
  { hash: '#/stats', label: 'Progresso', icon: 'chart', match: (r) => ['stats', 'review'].includes(r) },
];
const TAB_ROOTS = ['', 'dr', 'cp', 'lab', 'stats'];

// pilha das telas desta abertura (sessionStorage: sobrevive a recarregar a página, não a fechar o app). Serve para o
// Voltar do app ir à origem real e para restaurar a posição de leitura ao voltar.
const NAV_KEY = 'drg.nav';
const nav = { stack: [], scroll: {}, replaceNext: false, wentBack: false };
try { const saved = JSON.parse(sessionStorage.getItem(NAV_KEY) || 'null'); if (saved && Array.isArray(saved.stack)) Object.assign(nav, { stack: saved.stack, scroll: saved.scroll || {} }); } catch (e) { /* sem armazenamento */ }
const navSave = () => { try { sessionStorage.setItem(NAV_KEY, JSON.stringify({ stack: nav.stack.slice(-50), scroll: nav.scroll })); } catch (e) { /* ok */ } };
const currentHash = () => location.hash || '#/';
function navRecord() {
  const h = currentHash();
  const st = nav.stack;
  nav.wentBack = false;
  if (st.length && st[st.length - 1] === h) return; // mesma tela (recarregou)
  if (nav.replaceNext) { nav.replaceNext = false; if (st.length) st[st.length - 1] = h; else st.push(h); }
  else if (st.length >= 2 && st[st.length - 2] === h) { st.pop(); nav.wentBack = true; } // Voltar (app ou Android)
  else st.push(h);
  navSave();
}
let rendering = false;
App.nav = nav; // diagnóstico (testes)

const root = document.getElementById('app');
let cleanup = null;

function layout(title, { back, actions = [], nav: showNav = true } = {}) {
  clear(root);
  // toda tela interna tem Voltar: volta à origem real; `back` é só o destino quando não há origem nesta abertura
  const routeName = (location.hash.replace(/^#\/?/, '').split(/[/?]/)[0]) || '';
  const fallback = back === undefined ? (TAB_ROOTS.includes(routeName) ? null : '#/') : back === true ? '#/' : back;
  const top = h('header', { class: 'topbar' },
    fallback ? h('button', { class: 'icon-btn ghost', 'aria-label': 'Voltar', 'data-role': 'back', onclick: () => App.back(fallback) }, icon('back')) : null,
    h('h1', { text: title }),
    ...actions);
  const view = h('main', { class: `view${showNav ? '' : ' no-nav'}`, id: 'view' });
  root.append(top, view);
  if (App.pwa) view.append(live(() => updateBanner(App))); // “Nova versão disponível” (nunca dentro de uma sessão)
  if (showNav) {
    root.append(h('nav', { class: 'nav', 'aria-label': 'Principal' },
      TABS.map((t) => h('a', { href: t.hash, 'aria-current': t.match(routeName) ? 'page' : null }, icon(t.icon), h('span', { text: t.label })))));
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

let shownHash = null;
function route() {
  player.stopAll();
  if (cleanup) { try { cleanup(); } catch (e) { /* ok */ } cleanup = null; }
  if (shownHash) nav.scroll[shownHash] = window.scrollY; // posição de leitura da tela que sai
  navRecord();
  shownHash = currentHash();
  const r = parseRoute();
  window.scrollTo(0, 0);
  rendering = true;
  try {
    const screens = {
      '': renderHome, explore: renderExplore, routine: renderRoutine, context: renderContext, category: renderCategory,
      session: renderSession, lab: renderLab, review: renderReview, stats: renderStats, settings: renderSettings, checklist: renderChecklist,
      modules: renderModules, module: renderModule, words: renderWords, stories: renderStories,
      dr: (A, x) => { if (A.journey) A.setJourney(null); return renderModules(A, x); },
      cp: (A, x) => { const j = journeyRegistry()[0]; if (j && (!A.journey || A.journey.id !== j.id)) A.setJourney(j.id); return renderModules(A, x); },
    };
    // persona prevista (sem conteúdo ainda): telas de estudo da Daily Routine mostram “em preparação”
    const needsContent = ['explore', 'routine', 'context', 'category', 'session', 'lab', 'review', 'checklist', 'module', 'words'];
    if (!App.journey && isPlanned(App.character) && needsContent.includes(r.name)) {
      layout('Daily Routine', { back: '#/' }).append(plannedNotice(App));
      return;
    }
    // primeira abertura (estado novo, sem escolha salva): Início mostra antes a escolha do personagem
    const fn = screens[r.name] || renderHome;
    cleanup = fn(App, r) || null;
  } catch (e) {
    console.error(e);
    const v = layout('Algo deu errado', { back: '#/' });
    v.append(h('div', { class: 'notice bad' }, `Erro ao abrir a tela: ${e.message}. Seu progresso está salvo.`));
  } finally { rendering = false; }
  // voltou para esta tela: a posição de leitura volta junto
  if (nav.wentBack && nav.scroll[shownHash]) { const y = nav.scroll[shownHash]; requestAnimationFrame(() => window.scrollTo(0, y)); }
}

async function boot() {
  if (!App.content) {
    root.append(h('div', { class: 'view' }, h('div', { class: 'notice bad' }, 'Conteúdo não encontrado (data/content.js). Reinstale o app.')));
    return;
  }
  // progresso único de versões anteriores (esquema 1) é dividido por dono do conteúdo, sem perdas (engine/profiles.js)
  const { state, isNew, problem } = await db.loadState(App.content.version, { ownerOf: makeOwnerOf(App.profileViews()) });
  App.isNew = isNew;
  App.storageProblem = problem;
  App.adoptState(state); // persona e jornada abertas da última vez (ausentes/inválidas → Lucas, rotinas)
  if (isNew) await db.saveState(state).catch(() => {});
  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') App.flush().catch(() => {}); });
  window.addEventListener('pagehide', () => { App.flush().catch(() => {}); });
  initPwa(App); // instalação e atualização controlada (ui/pwa.js)
  route();
  if (problem) toast(problem, 6000);
  confirmBoot(App); // abriu com sucesso: arquivos de versões anteriores podem ser limpos
  scheduleRetention();
}

// ---------- retenção de 7 dias dos áudios gravados (store/db.js#pruneRecordings) ----------
// Roda depois da primeira tela (nunca atrasa a abertura), ao voltar para o app e de hora em hora com ele aberto.
// Não depende de tarefas em segundo plano; falhas são ignoradas e tentadas de novo no próximo momento.
let retentionRunning = null;
App.runRetention = (now) => {
  if (!retentionRunning) {
    retentionRunning = db.pruneRecordings(now === undefined ? {} : { now })
      .then((r) => { App.lastRetention = { ...r, at: now || Date.now() }; return r; })
      .catch(() => null)
      .finally(() => { retentionRunning = null; });
  }
  return retentionRunning;
};
function scheduleRetention() {
  setTimeout(() => App.runRetention(), 1500);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') App.runRetention(); });
  setInterval(() => App.runRetention(), 60 * 60 * 1000);
}

boot();
