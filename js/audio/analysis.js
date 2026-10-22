// Análise acústica local da gravação: duração, tempo com voz, pausas e ritmo estimado.
// Mede ritmo/fluência de forma aproximada. NÃO avalia a pronúncia dos sons.

export async function analyseBlob(blob, { expectedWords = 0, referenceSec = 0 } = {}) {
  const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  try {
    const buf = await ctx.decodeAudioData(await blob.arrayBuffer());
    return analyseSamples(buf.getChannelData(0), buf.sampleRate, { expectedWords, referenceSec });
  } catch (e) {
    return null;
  } finally {
    ctx.close().catch(() => {});
  }
}

export function analyseSamples(data, sampleRate, { expectedWords = 0, referenceSec = 0 } = {}) {
  const win = Math.round(sampleRate * 0.02);
  const rms = [];
  for (let i = 0; i + win <= data.length; i += win) {
    let s = 0;
    for (let j = i; j < i + win; j++) s += data[j] * data[j];
    rms.push(Math.sqrt(s / win));
  }
  if (!rms.length) return null;
  const sorted = [...rms].sort((a, b) => a - b);
  const noise = sorted[Math.floor(sorted.length * 0.15)] || 0;
  const peak = sorted[Math.floor(sorted.length * 0.98)] || 0;
  const thr = Math.max(0.008, noise * 2.5, peak * 0.12);
  const voiced = rms.map((r) => r > thr);
  const first = voiced.indexOf(true), last = voiced.lastIndexOf(true);
  const totalSec = rms.length * 0.02;
  if (first === -1) return { totalSec, speechSec: 0, voicedSec: 0, pauses: 0, longPauses: 0, wpm: 0, silent: true, envelope: downsample(rms, 120), peak };
  let pauses = 0, longPauses = 0, run = 0;
  for (let i = first; i <= last; i++) {
    if (!voiced[i]) run++;
    else { if (run >= 15) pauses++; if (run >= 40) longPauses++; run = 0; } // ≥0,3 s pausa; ≥0,8 s pausa longa
  }
  const speechSec = (last - first + 1) * 0.02;
  const voicedSec = voiced.filter(Boolean).length * 0.02;
  const wpm = expectedWords && speechSec > 0.5 ? Math.round((expectedWords / speechSec) * 60) : 0;
  return {
    totalSec: round(totalSec), speechSec: round(speechSec), voicedSec: round(voicedSec), pauses, longPauses, wpm,
    paceVsReference: referenceSec ? round(speechSec / referenceSec) : null,
    clipped: peak > 0.98, quiet: peak < 0.05, silent: false, envelope: downsample(rms, 120), peak,
  };
}

const round = (x) => Math.round(x * 10) / 10;
const fmt = (x) => String(x).replace('.', ',');
function downsample(arr, n) {
  if (arr.length <= n) return arr;
  const out = [];
  const step = arr.length / n;
  for (let i = 0; i < n; i++) {
    const slice = arr.slice(Math.floor(i * step), Math.floor((i + 1) * step));
    out.push(Math.max(...slice));
  }
  return out;
}

/** Interpretação em linguagem simples, sem falsa precisão. */
export function describe(a, { expectedWords = 0 } = {}) {
  if (!a) return { verdict: 'inconclusive', lines: ['Não foi possível analisar o áudio neste aparelho.'] };
  if (a.silent || a.speechSec < 0.4) return { verdict: 'inconclusive', lines: ['Quase não captei voz. Fale mais perto do microfone e tente de novo.'] };
  const lines = [];
  if (a.quiet) lines.push('Volume baixo: aproxime o celular da boca.');
  if (a.clipped) lines.push('Volume muito alto (distorção): afaste um pouco o celular.');
  lines.push(`Fala: ${fmt(a.speechSec)} s · ${a.pauses} pausa(s)${a.longPauses ? `, ${a.longPauses} longa(s)` : ''}.`);
  const unreliable = a.wpm && (a.wpm > 260 || a.wpm < 40);
  if (a.paceVsReference && !unreliable) {
    const p = a.paceVsReference;
    lines.push(p > 1.8 ? 'Ritmo bem mais lento que a referência — normal no início; tente ligar as palavras.'
      : p > 1.3 ? 'Ritmo um pouco mais lento que a referência.'
      : p < 0.75 ? 'Mais rápido que a referência: confira se não “engoliu” palavras.'
      : 'Ritmo próximo ao da referência.');
  }
  if (a.wpm && expectedWords >= 8) {
    if (a.wpm > 260 || a.wpm < 40) lines.push('Ritmo não estimado: a gravação parece curta demais ou com ruído para medir com segurança.');
    else lines.push(`≈ ${a.wpm} palavras/min (conversa natural: ~120–160).`);
  }
  return { verdict: 'ok', lines };
}
