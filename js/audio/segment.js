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
