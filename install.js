// Página de instalação (install.html): botão de instalação nativa quando o navegador oferece (beforeinstallprompt),
// aviso de “já instalado” e registro do service worker (a página também deixa o app pronto para uso offline).
// Sem bibliotecas; a mesma lógica de instalação do app (js/ui/pwa.js), em versão mínima para esta página.
(function () {
  'use strict';
  var KEY = 'drg.installed';
  var btn = document.getElementById('install');
  var done = document.getElementById('installed');
  var open = document.getElementById('open');
  var deferred = null;
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) { /* sem armazenamento */ } }
  function standalone() {
    try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch (e) { return false; }
  }
  function draw() {
    var installed = standalone() || (!deferred && get() === '1');
    btn.hidden = !deferred;
    done.hidden = !installed;
    open.textContent = installed ? 'Abrir o aplicativo' : 'Abrir o aplicativo no navegador';
  }
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    set(null); // o navegador só oferece instalar quando o app não está instalado
    draw();
  });
  window.addEventListener('appinstalled', function () { deferred = null; set('1'); draw(); });
  btn.addEventListener('click', function () {
    if (!deferred) return;
    var ev = deferred;
    btn.disabled = true;
    ev.prompt();
    ev.userChoice.then(function (choice) {
      deferred = null;
      btn.disabled = false;
      if (choice && choice.outcome === 'accepted') set('1');
      draw();
    }, function () { deferred = null; btn.disabled = false; draw(); });
  });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(function () { /* a página continua útil sem o modo offline */ });
  }
  draw();
})();
