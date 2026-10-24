// Divide uma gravação longa em trechos para o reconhecimento local (função pura, sem DOM).
// O Moonshine tiny foi treinado com trechos curtos: acima de ~30 s a transcrição piora ou degenera.
// Os cortes são feitos no ponto mais silencioso de cada janela (pausa entre frases), nunca no meio
// de uma fala contínua quando há alternativa — e nenhum trecho do áudio é descartado.

/**
 * @param {Float32Array} pcm  áudio mono
 * @param {number} sr         taxa de amostragem (16000 no reconhecimento)
 * @param {{maxSeg?: number, minSeg?: number}} opts  duração máxima/mínima de cada trecho, em segundos
 * @returns {Array<{start: number, end: number}>} limites em amostras, contíguos e cobrindo todo o áudio
 */
export function splitForAsr(pcm, sr = 16000, { maxSeg = 24, minSeg = 12 } = {}) {
  const n = pcm.length;
  if (n <= maxSeg * sr) return [{ start: 0, end: n }];
  const hop = Math.round(sr * 0.02);
  const frames = Math.ceil(n / hop);
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let s = 0, c = 0;
    for (let i = f * hop; i < Math.min(n, (f + 1) * hop); i++) { s += pcm[i] * pcm[i]; c++; }
    rms[f] = c ? Math.sqrt(s / c) : 0;
  }
  // energia suavizada em ~0,3 s: procura pausas, não um único quadro silencioso no meio de uma palavra
  const win = 15;
  const smooth = new Float32Array(frames);
  let acc = 0;
  for (let f = 0; f < frames; f++) {
    acc += rms[f];
    if (f >= win) acc -= rms[f - win];
    smooth[f] = acc / Math.min(f + 1, win);
  }
  const segs = [];
  let start = 0;
  while (n - start > maxSeg * sr) {
    const a = Math.floor((start + minSeg * sr) / hop), b = Math.floor((start + maxSeg * sr) / hop);
    let best = b, bestV = Infinity;
    for (let f = a; f <= b && f < frames; f++) if (smooth[f] < bestV) { bestV = smooth[f]; best = f; }
    // o centro da janela suavizada é o meio da pausa
    const cut = Math.min(n, Math.max(start + sr, (best - Math.floor(win / 2)) * hop));
    segs.push({ start, end: cut });
    start = cut;
  }
  segs.push({ start, end: n });
  return segs;
}

/**
 * Perfil de voz do áudio inteiro (janelas de 20 ms, o mesmo critério da análise acústica): um limiar único para
 * todos os trechos, para que “tem voz” signifique a mesma coisa no começo e no fim da gravação.
 */
export function voiceProfile(pcm, sr = 16000) {
  const hop = Math.round(sr * 0.02);
  const frames = Math.floor(pcm.length / hop);
  const voiced = new Uint8Array(frames);
  if (!frames) return { hop, voiced, sr };
  const rms = new Float32Array(frames);
  for (let f = 0; f < frames; f++) {
    let s = 0;
    for (let i = f * hop; i < (f + 1) * hop; i++) s += pcm[i] * pcm[i];
    rms[f] = Math.sqrt(s / hop);
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const noise = sorted[Math.floor(frames * 0.15)] || 0, peak = sorted[Math.floor(frames * 0.98)] || 0;
  const thr = Math.max(0.008, noise * 2.5, peak * 0.12);
  for (let f = 0; f < frames; f++) voiced[f] = rms[f] > thr ? 1 : 0;
  return { hop, voiced, sr };
}

/** Segundos com voz entre as amostras start e end. */
export function voicedSeconds(profile, start, end) {
  let n = 0;
  for (let f = Math.floor(start / profile.hop); f < Math.min(profile.voiced.length, Math.ceil(end / profile.hop)); f++) n += profile.voiced[f];
  return Math.round(n * 0.02 * 100) / 100;
}

/** A amostra idx cai no meio da fala? (voz nos 40 ms dos dois lados do corte) */
export function inSpeechAt(profile, idx) {
  const f = Math.floor(idx / profile.hop);
  const v = (k) => profile.voiced[k] === 1;
  return (v(f - 1) || v(f - 2)) && (v(f) || v(f + 1));
}

/**
 * Recorte de uma palavra isolada: só o trecho com voz, com uma pequena margem de silêncio.
 * Medido com o Moonshine tiny (40 palavras sintéticas do app): com ~0,6 s de silêncio antes e ~1,5 s depois
 * ele devolveu transcrição vazia em 25/40; recortado com margem de 0,15 s, em 1/40.
 * minSec: duração mínima do recorte, completada com o PRÓPRIO áudio ao redor (nunca com silêncio sintético):
 * o reconhecedor decodifica no máximo 6 tokens por segundo, e um recorte de 0,7 s cortaria palavras longas.
 * Sem voz detectável, devolve o áudio inteiro.
 * @returns {{start: number, end: number}} limites em amostras
 */
export function speechBounds(pcm, sr = 16000, { pad = 0.15, minSec = 0 } = {}) {
  const prof = voiceProfile(pcm, sr);
  const { hop, voiced } = prof;
  let first = -1, last = -1;
  for (let f = 0; f < voiced.length; f++) if (voiced[f]) { if (first < 0) first = f; last = f; }
  if (first < 0) return { start: 0, end: pcm.length };
  const p = Math.round(pad * sr);
  let start = Math.max(0, first * hop - p), end = Math.min(pcm.length, (last + 1) * hop + p);
  const min = Math.min(pcm.length, Math.round(minSec * sr));
  if (end - start < min) {
    const grow = min - (end - start);
    start = Math.max(0, start - Math.ceil(grow / 2));
    end = Math.min(pcm.length, start + min);
    start = Math.max(0, end - min);
  }
  return { start, end };
}
