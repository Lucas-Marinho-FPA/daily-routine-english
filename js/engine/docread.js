// Texto de arquivos importados no aparelho: .txt, .md e .docx (Word). Sem bibliotecas e sem rede: o .docx é um ZIP;
// o texto está em word/document.xml (descomprimido com DecompressionStream, nativo do navegador). Cada parágrafo do
// Word vira uma linha; o Markdown perde só a marcação (títulos, listas, negrito, citações), não o texto.

const dec = new TextDecoder('utf-8');

/** Texto de um arquivo escolhido (File/Blob com nome). Lança Error com mensagem em português. */
export async function readImportFile(file) {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.docx')) return docxText(new Uint8Array(await file.arrayBuffer()));
  const text = await file.text();
  return name.endsWith('.md') || name.endsWith('.markdown') ? mdText(text) : text;
}

/** Markdown → texto simples, linha a linha. */
export function mdText(md) {
  return String(md || '').replace(/^﻿/, '').split(/\r\n|\r|\n/).map((l) => {
    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(l)) return ''; // linha horizontal
    return l
      .replace(/^\s{0,3}#{1,6}\s+/, '') // títulos
      .replace(/^\s*>\s?/, '') // citação
      .replace(/^\s*[-*+]\s+(?!\s)/, '') // lista
      .replace(/(\*\*|__)(.+?)\1/g, '$2') // negrito
      .replace(/(^|[\s(])[*_]([^*_\s][^*_]*?)[*_](?=[\s).,;:!?]|$)/g, '$1$2') // itálico
      .replace(/\\([\\`*_{}[\]()#+\-.!>|])/g, '$1') // escapes
      .replace(/\s+$/, '');
  }).join('\n');
}

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

async function inflateRaw(data) {
  if (typeof DecompressionStream === 'undefined') throw new Error('este navegador não consegue abrir arquivos .docx; salve o documento como texto (.txt) ou cole o conteúdo');
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Bytes de um arquivo dentro do ZIP (pelo diretório central). */
async function unzipEntry(buf, wanted) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (u32(buf, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('o arquivo .docx está danificado ou não é um documento do Word');
  const count = u16(buf, eocd + 10);
  let p = u32(buf, eocd + 16);
  for (let k = 0; k < count && u32(buf, p) === 0x02014b50; k++) {
    const method = u16(buf, p + 10), size = u32(buf, p + 20), nameLen = u16(buf, p + 28), extra = u16(buf, p + 30), comment = u16(buf, p + 32), local = u32(buf, p + 42);
    const name = dec.decode(buf.subarray(p + 46, p + 46 + nameLen));
    if (name === wanted) {
      const start = local + 30 + u16(buf, local + 26) + u16(buf, local + 28);
      const data = buf.subarray(start, start + size);
      if (method === 0) return data;
      if (method === 8) return inflateRaw(data);
      throw new Error('compressão do .docx não suportada');
    }
    p += 46 + nameLen + extra + comment;
  }
  throw new Error('o arquivo .docx não tem o texto do documento (word/document.xml)');
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const unxml = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENT[e.toLowerCase()]));

/** .docx → texto: um parágrafo por linha (quebras e tabulações do Word preservadas). */
export async function docxText(buf) {
  const xml = dec.decode(await unzipEntry(buf, 'word/document.xml'));
  const body = xml.replace(/<w:del\b[\s\S]*?<\/w:del>/g, ''); // texto apagado com controle de alterações não entra
  return body.split(/<\/w:p>/).map((p) => {
    let out = '';
    for (const m of p.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>|<w:tab\/>|<w:br\/>|<w:cr\/>/g)) {
      if (m[1] !== undefined) out += unxml(m[1]);
      else out += m[0] === '<w:tab/>' ? '\t' : '\n';
    }
    return out;
  }).join('\n').replace(/\n+$/, '\n');
}
