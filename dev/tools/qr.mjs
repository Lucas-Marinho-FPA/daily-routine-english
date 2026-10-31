// Código QR (ISO/IEC 18004) para a página de instalação — gerado no build como SVG estático, sem biblioteca externa.
// Escopo deliberadamente pequeno: modo byte (UTF-8), correção de erros nível M, versões 1 a 6 (até 106 bytes; o
// endereço do app tem ~65). Algoritmo no estilo da referência pública “QR Code generator” (Nayuki): padrões fixos,
// Reed–Solomon em GF(256) com polinômio 0x11D, intercalação de blocos, zigue-zague, 8 máscaras e informação de
// formato BCH(15,5). Autoverificação: o número de módulos de dados tem de bater com a capacidade da versão.

// [blocos, dados por bloco, correção por bloco] — nível M, versões 1–6
const VERSIONS = { 1: [1, 16, 10], 2: [1, 28, 16], 3: [1, 44, 26], 4: [2, 32, 18], 5: [2, 43, 24], 6: [4, 27, 16] };
const ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };
const REMAINDER_BITS = { 1: 0, 2: 7, 3: 7, 4: 7, 5: 7, 6: 7 };
const ECL_BITS = { L: 1, M: 0, Q: 3, H: 2 };

export function gfMul(x, y) {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; }
  return z & 0xff;
}
function rsDivisor(degree) {
  const d = new Array(degree).fill(0);
  d[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) { d[j] = gfMul(d[j], root); if (j + 1 < degree) d[j] ^= d[j + 1]; }
    root = gfMul(root, 0x02);
  }
  return d;
}
/** Bytes de correção Reed–Solomon para `data` (grau = quantidade de bytes de correção). */
export function rsRemainder(data, degree) {
  const div = rsDivisor(degree);
  const res = new Array(degree).fill(0);
  for (const b of data) {
    const f = b ^ res.shift();
    res.push(0);
    for (let i = 0; i < degree; i++) res[i] ^= gfMul(div[i], f);
  }
  return res;
}
/** 15 bits de formato (nível + máscara) já com o XOR 0x5412. */
export function formatBits(ecl, mask) {
  const data = (ECL_BITS[ecl] << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | (rem & 0x3ff)) ^ 0x5412;
}

function encodeData(bytes, version) {
  const [blocks, dataPer, eccPer] = VERSIONS[version];
  const capacity = blocks * dataPer;
  const bits = [];
  const push = (val, n) => { for (let i = n - 1; i >= 0; i--) bits.push((val >>> i) & 1); };
  push(0b0100, 4); push(bytes.length, 8); // modo byte; contagem com 8 bits nas versões 1–9
  for (const b of bytes) push(b, 8);
  push(0, Math.min(4, capacity * 8 - bits.length)); // terminador
  while (bits.length % 8) bits.push(0);
  const data = [];
  for (let i = 0; i < bits.length; i += 8) data.push(bits.slice(i, i + 8).reduce((n, b) => (n << 1) | b, 0));
  for (let pad = 0xec; data.length < capacity; pad ^= 0xec ^ 0x11) data.push(pad);
  // blocos, correção e intercalação (todos os blocos têm o mesmo tamanho nas versões 1–6, nível M)
  const dBlocks = [], eBlocks = [];
  for (let i = 0; i < blocks; i++) { const d = data.slice(i * dataPer, (i + 1) * dataPer); dBlocks.push(d); eBlocks.push(rsRemainder(d, eccPer)); }
  const out = [];
  for (let i = 0; i < dataPer; i++) for (const d of dBlocks) out.push(d[i]);
  for (let i = 0; i < eccPer; i++) for (const e of eBlocks) out.push(e[i]);
  return out;
}

const MASKS = [
  (x, y) => (x + y) % 2 === 0, (x, y) => y % 2 === 0, (x) => x % 3 === 0, (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0, (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

function baseMatrix(version) {
  const size = version * 4 + 17;
  const m = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, v) => { m[y][x] = v; fn[y][x] = true; };
  for (let i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); } // temporização
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) { // localizadores + separadores
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy;
      if (x < 0 || y < 0 || x >= size || y >= size) continue;
      const d = Math.max(Math.abs(dx), Math.abs(dy));
      set(x, y, d !== 2 && d !== 4);
    }
  }
  const al = ALIGN[version];
  for (let i = 0; i < al.length; i++) for (let j = 0; j < al.length; j++) { // alinhamento
    if ((i === 0 && j === 0) || (i === 0 && j === al.length - 1) || (i === al.length - 1 && j === 0)) continue;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(al[i] + dx, al[j] + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }
  drawFormat(m, fn, size, 'M', 0); // reserva a área de formato (reescrita depois com a máscara escolhida)
  return { m, fn, size, set };
}

function drawFormat(m, fn, size, ecl, mask) {
  const bits = formatBits(ecl, mask);
  const bit = (i) => ((bits >>> i) & 1) === 1;
  const set = (x, y, v) => { m[y][x] = v; fn[y][x] = true; };
  for (let i = 0; i <= 5; i++) set(8, i, bit(i));
  set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
  for (let i = 9; i < 15; i++) set(14 - i, 8, bit(i));
  for (let i = 0; i < 8; i++) set(size - 1 - i, 8, bit(i));
  for (let i = 8; i < 15; i++) set(8, size - 15 + i, bit(i));
  set(8, size - 8, true); // módulo escuro fixo
}

function placeCodewords(m, fn, size, codewords) {
  let i = 0, placed = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) {
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        const up = ((right + 1) & 2) === 0;
        const y = up ? size - 1 - vert : vert;
        if (fn[y][x]) continue;
        placed++;
        if (i < codewords.length * 8) { m[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) === 1; i++; }
      }
    }
  }
  return placed;
}

function penalty(m) {
  const n = m.length;
  let p = 0;
  for (const line of [m, m[0].map((_, x) => m.map((r) => r[x]))]) { // regra 1: sequências de 5+ iguais (linhas e colunas)
    for (const row of line) { let run = 1; for (let x = 1; x <= n; x++) { if (x < n && row[x] === row[x - 1]) run++; else { if (run >= 5) p += run - 2; run = 1; } } }
  }
  for (let y = 0; y < n - 1; y++) for (let x = 0; x < n - 1; x++) { const c = m[y][x]; if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) p += 3; } // regra 2
  const dark = m.flat().filter(Boolean).length; // regra 4: equilíbrio claro/escuro
  p += Math.floor(Math.abs(dark * 20 - n * n * 10) / (n * n)) * 10;
  return p;
}

/** Matriz QR (array de linhas de booleanos; true = escuro) para um texto. */
export function qrMatrix(text) {
  const bytes = [...new TextEncoder().encode(text)];
  const version = Object.keys(VERSIONS).map(Number).find((v) => VERSIONS[v][0] * VERSIONS[v][1] >= bytes.length + 2);
  if (!version) throw new Error(`texto longo demais para o QR (${bytes.length} bytes)`);
  const codewords = encodeData(bytes, version);
  let best = null;
  for (let mask = 0; mask < 8; mask++) {
    const { m, fn, size } = baseMatrix(version);
    const placed = placeCodewords(m, fn, size, codewords);
    const [blocks, dataPer, eccPer] = VERSIONS[version];
    if (placed !== blocks * (dataPer + eccPer) * 8 + REMAINDER_BITS[version]) throw new Error(`QR v${version}: ${placed} módulos de dados (esperado ${blocks * (dataPer + eccPer) * 8 + REMAINDER_BITS[version]})`);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && MASKS[mask](x, y)) m[y][x] = !m[y][x];
    drawFormat(m, fn, size, 'M', mask);
    const score = penalty(m);
    if (!best || score < best.score) best = { m, score, mask, version };
  }
  return Object.assign(best.m, { version: best.version, mask: best.mask });
}

/** SVG do QR (quiet zone de 4 módulos), cores fixas escuro sobre branco para qualquer câmera ler. */
export function qrSvg(text, { label = 'Código QR' } = {}) {
  const m = qrMatrix(text);
  const n = m.length, q = 4, s = n + q * 2;
  let path = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y][x]) path += `M${x + q} ${y + q}h1v1h-1z`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" shape-rendering="crispEdges" role="img" aria-label="${label}"><rect width="${s}" height="${s}" fill="#fff"/><path d="${path}" fill="#0b2545"/></svg>\n`;
}
