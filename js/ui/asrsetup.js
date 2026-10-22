// Instalação do reconhecimento de fala local (Moonshine): cartão de boas-vindas, progresso real,
// falha com nova tentativa e “Agora não”. Nada é baixado sem o toque do aluno.
import { h, icon, clear, toast } from './dom.js';
import * as localasr from '../audio/localasr.js';

const mb = (bytes) => String(Math.round(bytes / 1048576));

/**
 * Executa o download com barra de progresso dentro de `box`. Resolve true (instalado) ou false (falhou).
 * Arquivos já baixados e íntegros não são baixados de novo.
 */
export async function runInstall(box, { onProgressText } = {}) {
  const fill = h('i', { style: { width: '0%' } });
  const bar = h('div', { class: 'bar', role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': 0, 'aria-label': 'Progresso do download' }, fill);
  const label = h('div', { class: 'small muted', text: 'Preparando o download…' });
  clear(box).append(bar, label);
  try {
    await localasr.install({
      onProgress: (f, done, total) => {
        const pct = Math.round(f * 100);
        fill.style.width = `${pct}%`;
        bar.setAttribute('aria-valuenow', String(pct));
        label.textContent = `Baixando… ${mb(done)} de ${mb(total)} MB`;
        onProgressText && onProgressText(pct);
      },
    });
    fill.style.width = '100%';
    label.textContent = 'Conferindo os arquivos…';
    const v = await localasr.verify();
    if (!v.ok) throw new Error('os arquivos baixados estão incompletos');
    clear(box).append(h('div', { class: 'setup-done', role: 'status' }, icon('check'), 'Reconhecimento instalado. Funciona offline.'));
    return true;
  } catch (e) {
    clear(box).append(h('div', { class: 'setup-error', role: 'alert' },
      h('b', { text: 'Não foi possível baixar agora.' }), ' ',
      h('span', { text: navigator.onLine === false ? 'Você está sem internet. Conecte-se e tente de novo.' : `Verifique a conexão e tente de novo (${e.message}).` }),
      h('div', { class: 'tiny muted', text: 'O que já foi baixado é aproveitado na próxima tentativa.' })));
    return false;
  }
}

/**
 * Cartão “Avalie sua pronúncia”. onInstalled() após instalar; onLater() quando o aluno escolhe “Agora não”.
 */
export function asrSetupCard(App, { onInstalled, onLater } = {}) {
  const progress = h('div', { class: 'setup-progress' });
  const primary = h('button', { class: 'btn primary', type: 'button' }, icon('download'), 'Baixar reconhecimento');
  const later = h('button', { class: 'btn ghost', type: 'button' }, 'Agora não');
  const card = h('section', { class: 'card setup-card', 'data-role': 'asr-setup', 'aria-labelledby': 'asr-setup-title' },
    h('div', { class: 'setup-head' }, h('span', { class: 'setup-icon', 'aria-hidden': 'true' }, icon('mic')), h('h3', { id: 'asr-setup-title', text: 'Avalie sua pronúncia' })),
    h('p', { text: 'Baixe o reconhecimento de fala para analisar suas gravações no próprio aparelho, sem enviar seu áudio para a nuvem.' }),
    h('ul', { class: 'setup-facts' },
      h('li', {}, h('b', { text: `${localasr.sizeLabel()}` }), ' de download, uma única vez'),
      h('li', { text: 'Precisa de internet só para baixar' }),
      h('li', { text: 'Depois funciona offline' }),
      h('li', { text: 'Tudo é processado no aparelho' })),
    progress,
    h('div', { class: 'row setup-actions' }, primary, later));

  primary.onclick = async () => {
    primary.disabled = true; later.disabled = true;
    const ok = await runInstall(progress);
    if (ok) {
      App.state.settings.asrPrompt = 'installed';
      App.flush().catch(() => {});
      toast('Reconhecimento instalado. Suas gravações serão analisadas automaticamente.', 4000);
      onInstalled && onInstalled();
      return;
    }
    clear(primary).append(icon('refresh'), 'Tentar de novo');
    primary.disabled = false; later.disabled = false;
  };
  later.onclick = () => {
    App.state.settings.asrPrompt = 'later';
    App.flush().catch(() => {}); // grava já: a escolha não pode se perder se o app for fechado em seguida
    onLater && onLater();
  };
  return card;
}

/** Linha compacta para quem escolheu “Agora não”: informa e permite instalar depois. */
export function asrOffNotice(App, { onInstalled } = {}) {
  const box = h('div', { class: 'asr-off', 'data-role': 'asr-off' });
  const open = () => clear(box).append(asrSetupCard(App, { onInstalled, onLater: () => { clear(box).append(...line()); } }));
  const line = () => [h('span', { class: 'small muted', text: 'Análise automática desligada até instalar o reconhecimento.' }),
    h('button', { class: 'link-btn', type: 'button', onclick: open }, 'Instalar')];
  box.append(...line());
  return box;
}
