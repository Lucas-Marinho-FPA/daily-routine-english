// Código QR da página de instalação (tools/qr.mjs): vetores conhecidos da norma/tutoriais e leitura de volta por um
// decodificador escrito à parte (mapa de módulos fixos, desmascaramento e leitura em zigue-zague próprios).
// Não substitui a leitura por uma câmera de celular (teste manual registrado no relatório).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { qrMatrix, rsRemainder, formatBits, gfMul } from '../../tools/qr.mjs';

test('Reed–Solomon: vetor “HELLO WORLD” 1-Q (13 bytes de correção)', () => {
  const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236];
  assert.deepEqual(rsRemainder(data, 13), [168, 72, 22, 82, 217, 54, 156, 0, 46, 15, 180, 122, 16]);
  assert.equal(gfMul(0x80, 2), 0x1d); // redução pelo polinômio 0x11D
});

test('informação de formato: valores da tabela da norma', () => {
  assert.equal(formatBits('M', 0), 0b101010000010010);
  assert.equal(formatBits('L', 4), 0b110011000101111);
  assert.equal(formatBits('Q', 0), 0b011010101011111);
  assert.equal(formatBits('H', 0), 0b001011010001001);
});

// ---------- decodificador independente ----------
const BLOCKS_M = { 1: [1, 16, 10], 2: [1, 28, 16], 3: [1, 44, 26], 4: [2, 32, 18], 5: [2, 43, 24], 6: [4, 27, 16] };
const ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34] };
const MASK = [(r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r * c) % 3) + ((r + c) % 2)) % 2 === 0];

function decode(m) {
  const n = m.length, version = (n - 17) / 4;
  assert.ok(Number.isInteger(version) && BLOCKS_M[version], `tamanho ${n}`);
  // localizadores: anel escuro 7×7, anel claro, núcleo 3×3
  for (const [r0, c0] of [[0, 0], [0, n - 7], [n - 7, 0]]) for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    const ring = Math.max(Math.abs(r - 3), Math.abs(c - 3));
    assert.equal(m[r0 + r][c0 + c], ring !== 2, `localizador (${r0},${c0})`);
  }
  for (let i = 8; i < n - 8; i++) { assert.equal(m[6][i], i % 2 === 0, 'temporização'); assert.equal(m[i][6], i % 2 === 0, 'temporização'); }
  assert.equal(m[n - 8][8], true, 'módulo escuro');
  // formato: leitura da 1ª cópia (linha 8 / coluna 8 ao redor do localizador superior esquerdo)
  const pos1 = [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]]; // [linha, coluna] do bit 14 ao 0
  const pos2 = [[n - 1, 8], [n - 2, 8], [n - 3, 8], [n - 4, 8], [n - 5, 8], [n - 6, 8], [n - 7, 8], [8, n - 8], [8, n - 7], [8, n - 6], [8, n - 5], [8, n - 4], [8, n - 3], [8, n - 2], [8, n - 1]];
  const read = (pos) => pos.reduce((v, [r, c]) => (v << 1) | (m[r][c] ? 1 : 0), 0);
  const f1 = read(pos1), f2 = read(pos2);
  assert.equal(f1, f2, 'as duas cópias do formato coincidem');
  const all = [];
  for (const [ecl, code] of [['L', 1], ['M', 0], ['Q', 3], ['H', 2]]) for (let k = 0; k < 8; k++) {
    const d = (code << 3) | k; let g = d << 10;
    for (let i = 14; i >= 10; i--) if ((g >> i) & 1) g ^= 0x537 << (i - 10);
    all.push({ ecl, mask: k, bits: ((d << 10) | g) ^ 0x5412 });
  }
  const fmt = all.find((x) => x.bits === f1);
  assert.ok(fmt, 'formato válido (sem erros)');
  assert.equal(fmt.ecl, 'M');
  // mapa de módulos fixos (independente do codificador)
  const fixed = Array.from({ length: n }, () => new Array(n).fill(false));
  const mark = (r, c) => { if (r >= 0 && c >= 0 && r < n && c < n) fixed[r][c] = true; };
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) mark(r, c); // localizador superior esquerdo + formato
  for (let r = 0; r < 9; r++) for (let c = n - 8; c < n; c++) mark(r, c);
  for (let r = n - 8; r < n; r++) for (let c = 0; c < 9; c++) mark(r, c);
  for (let i = 0; i < n; i++) { mark(6, i); mark(i, 6); }
  const al = ALIGN[version];
  for (const r of al) for (const c of al) {
    if ((r === 6 && c === 6) || (r === 6 && c === al[al.length - 1]) || (r === al[al.length - 1] && c === 6)) continue;
    for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) mark(r + dr, c + dc);
  }
  // leitura em zigue-zague, de baixo para cima a partir do canto inferior direito, pulando a coluna 6
  const bits = [];
  let upward = true;
  for (let col = n - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let k = 0; k < n; k++) {
      const r = upward ? n - 1 - k : k;
      for (const c of [col, col - 1]) if (!fixed[r][c]) bits.push(m[r][c] !== MASK[fmt.mask](r, c));
    }
    upward = !upward;
  }
  const [blocks, dataPer, eccPer] = BLOCKS_M[version];
  const total = blocks * (dataPer + eccPer);
  assert.equal(bits.length, total * 8 + (version === 1 ? 0 : 7), 'capacidade da versão');
  const cw = [];
  for (let i = 0; i < total; i++) cw.push(bits.slice(i * 8, i * 8 + 8).reduce((v, b) => (v << 1) | (b ? 1 : 0), 0));
  // desintercalação e verificação da correção de erros de cada bloco
  const data = [];
  for (let b = 0; b < blocks; b++) {
    const d = [], e = [];
    for (let i = 0; i < dataPer; i++) d.push(cw[i * blocks + b]);
    for (let i = 0; i < eccPer; i++) e.push(cw[dataPer * blocks + i * blocks + b]);
    assert.deepEqual(rsRemainder(d, eccPer), e, `bloco ${b}: correção de erros confere`);
    data.push(...d);
  }
  // modo byte: 0100 + contagem (8 bits) + bytes
  const bs = data.flatMap((v) => [7, 6, 5, 4, 3, 2, 1, 0].map((i) => (v >> i) & 1));
  const num = (from, len) => bs.slice(from, from + len).reduce((v, b) => (v << 1) | b, 0);
  assert.equal(num(0, 4), 0b0100, 'modo byte');
  const len = num(4, 8);
  const out = [];
  for (let i = 0; i < len; i++) out.push(num(12 + i * 8, 8));
  return { text: new TextDecoder().decode(new Uint8Array(out)), version, mask: fmt.mask };
}

test('QR lido de volta: endereço da página de instalação e outros textos (versões 1 a 6)', () => {
  const url = 'https://lucas-marinho-fpa.github.io/daily-routine-english/install.html';
  for (const t of [url, 'HELLO', 'https://example.com/', 'x'.repeat(60), 'ç'.repeat(40), 'a'.repeat(100)]) {
    const m = qrMatrix(t);
    const r = decode(m);
    assert.equal(r.text, t);
    assert.equal(r.mask, m.mask);
  }
  assert.equal(qrMatrix(url).version, 5);
  assert.throws(() => qrMatrix('a'.repeat(200)));
});

test('SVG publicado aponta para a página de instalação', () => {
  const svg = readFileSync(new URL('../../app/img/install-qr.svg', import.meta.url), 'utf8');
  assert.match(svg, /^<svg[^>]+viewBox="0 0 45 45"/);
  assert.match(svg, /fill="#fff"/);
});
