// Traduções de APOIO (escritas pelo app, marcadas como tais na tela) para conteúdos aprovados que não traziam o
// português — hoje, as perguntas e as respostas-modelo (data/translations.js, gerado de
// dev/content/translations/questions-pt.json). O inglês aprovado nunca muda: só ganham os campos qpt (pergunta) e
// apt (resposta-modelo). Aplicado uma vez, antes de qualquer visão de conteúdo ser montada.
export function applyTranslations(g = globalThis) {
  const pt = g.DRG_PT && g.DRG_PT.questions;
  if (!pt) return 0;
  let n = 0;
  const fill = (qs) => {
    for (const q of Object.values(qs || {})) {
      const t = pt[q.id];
      if (!t) continue;
      if (!q.qpt && t.q) { q.qpt = t.q; n++; }
      if (!q.apt && t.a && q.a) q.apt = t.a;
      q.ptSupport = true;
    }
  };
  fill(g.DRG_CONTENT && g.DRG_CONTENT.questions);
  for (const c of (g.DRG_CHARACTERS && g.DRG_CHARACTERS.characters) || []) if (c.content && typeof c.content === 'object') fill(c.content.questions);
  for (const j of (g.DRG_JOURNEYS && g.DRG_JOURNEYS.journeys) || []) if (j.content) fill(j.content.questions);
  return n;
}

/** Tradução de uma pergunta para mostrar: { q, a, support } (vazios quando não há). */
export const questionPt = (q) => ({ q: (q && q.qpt) || '', a: (q && q.apt) || '', support: !!(q && q.ptSupport) });
