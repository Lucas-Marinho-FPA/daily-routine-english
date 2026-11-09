// Base Pedagógica — funções comuns às ferramentas (sem dependências externas).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO = join(dirname(fileURLToPath(import.meta.url)), '../../..');
export const BASE = join(REPO, 'base');

// Forma canônica do conteúdo: chaves em ordem alfabética, sem espaços, strings EXATAMENTE como na fonte
// (nenhuma normalização de Unicode, aspas, espaços ou maiúsculas). É sobre ela que se calcula o hash do registro.
export const canon = (x) => (Array.isArray(x) ? `[${x.map(canon).join(',')}]` : x && typeof x === 'object'
  ? `{${Object.keys(x).sort().map((k) => `${JSON.stringify(k)}:${canon(x[k])}`).join(',')}}` : JSON.stringify(x));
export const hashOf = (x) => `sha256:${createHash('sha256').update(canon(x), 'utf8').digest('hex')}`;
export const hashBytes = (b) => `sha256:${createHash('sha256').update(b).digest('hex')}`;

// JSON pointer (RFC 6901)
export const at = (doc, ptr) => ptr.split('/').slice(1).reduce((o, k) => (o == null ? undefined : o[k.replace(/~1/g, '/').replace(/~0/g, '~')]), doc);

const gitCache = new Map();
export const gitShow = (rev, path, { json = true } = {}) => {
  const k = `${rev}:${path}`;
  if (!gitCache.has(k)) {
    const buf = execFileSync('git', ['show', k], { cwd: REPO, maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
    gitCache.set(k, buf);
  }
  const b = gitCache.get(k);
  return json ? JSON.parse(b.toString('utf8')) : b;
};
export const gitTem = (rev, path) => { try { gitShow(rev, path, { json: false }); return true; } catch { return false; } };

export const lerJsonl = (txt) => txt.split('\n').filter((l) => l.trim()).map((l, i) => {
  try { return JSON.parse(l); } catch (e) { throw new Error(`linha ${i + 1}: JSON inválido (${e.message})`); }
});

// todos os arquivos de dados de base/ (exceto esquema e manifesto), em ordem estável
export const arquivosBase = (dir = BASE) => {
  const out = [];
  const walk = (d) => { for (const n of readdirSync(d).sort()) { const p = join(d, n); if (statSync(p).isDirectory()) walk(p); else out.push(relative(dir, p).split('\\').join('/')); } };
  if (existsSync(dir)) walk(dir);
  return out.filter((f) => f !== 'manifesto.json' && f !== 'esquema.json' && !f.endsWith('.gitkeep'));
};

// arquivo de cada tipo de registro (ORI: um arquivo por fonte)
export const ARQUIVO_DO_TIPO = {
  FON: 'fontes/fontes.jsonl', VOC: 'registros/vocabulario.jsonl', EXP: 'registros/expressoes.jsonl', GRA: 'registros/gramatica.jsonl',
  TXT: 'registros/textos.jsonl', SEG: 'registros/textos.jsonl', DIA: 'registros/dialogos.jsonl', CTX: 'registros/contextos.jsonl', PSG: 'registros/contextos.jsonl',
  PER: 'registros/perguntas.jsonl', RSP: 'registros/respostas.jsonl', ATV: 'registros/atividades.jsonl', EXE: 'registros/exercicios.jsonl',
  DEC: 'registros/decisoes.jsonl', DIV: 'registros/divergencias.jsonl', REL: 'relacoes/relacoes.jsonl',
};
export const arquivoDe = (r) => (r.tipo === 'ORI' ? `registros/origem/${r.fonte}.jsonl` : ARQUIVO_DO_TIPO[r.tipo]);

// pointer helpers
export const esc = (k) => String(k).replace(/~/g, '~0').replace(/\//g, '~1');
export const ptr = (...ks) => ks.map((k) => `/${esc(k)}`).join('');

// grava JSONL estável: uma linha por registro, na ordem recebida, chaves na ordem em que o registro foi montado
export const jsonl = (rs) => (rs.length ? rs.map((r) => JSON.stringify(r)).join('\n') + '\n' : '');

// Alocador de IDs: uma única sequência por prefixo; cada ID tem uma chave estável (o mesmo registro de origem ou
// a mesma unidade recebe sempre o mesmo ID). ids.jsonl só cresce; IDs nunca são reaproveitados.
export class Ids {
  constructor(linhas = [], data) {
    this.linhas = linhas.map((l) => ({ ...l }));
    this.porChave = new Map(this.linhas.map((l) => [l.chave, l.id]));
    this.max = {};
    for (const l of this.linhas) { const t = l.id.slice(0, 3), n = Number(l.id.slice(4)); this.max[t] = Math.max(this.max[t] || 0, n); }
    this.data = data;
  }
  id(tipo, chave) {
    const k = `${tipo}:${chave}`;
    if (this.porChave.has(k)) return this.porChave.get(k);
    const n = (this.max[tipo] || 0) + 1; this.max[tipo] = n;
    const id = `${tipo}-${String(n).padStart(6, '0')}`;
    this.porChave.set(k, id); this.linhas.push({ id, tipo, chave: k, criado_em: this.data });
    return id;
  }
}

// Nomes privados protegidos (regra permanente do projeto: empregador, agência, unidade) — o mesmo padrão dos builds,
// codificado de propósito.
export const PRIVATE = new RegExp(Buffer.from('XGIoPzppdGFbdcO6XXxFQUN8cGVyc29ubmFsaXRcdyp8bGFzdHJvKVxi', 'base64').toString('utf8'), 'i');

// ---------- validador mínimo de JSON Schema (subconjunto usado em base/esquemas) ----------
// Palavras-chave: $ref (local), allOf, anyOf, type, enum, const, pattern, required, properties, items, minItems, minimum.
const SUPORTADAS = new Set(['$ref', 'allOf', 'anyOf', 'type', 'enum', 'const', 'pattern', 'required', 'properties', 'items', 'minItems', 'minimum', 'description', 'title', '$schema', '$id', '$defs', 'tipos']);
const tipoDe = (v) => (v === null ? 'null' : Array.isArray(v) ? 'array' : Number.isInteger(v) ? 'integer' : typeof v);
export function conferirEsquema(raiz) {
  const problemas = [];
  const visitar = (s, caminho) => {
    if (!s || typeof s !== 'object') return;
    for (const k of Object.keys(s)) if (!SUPORTADAS.has(k)) problemas.push(`${caminho}: palavra-chave não suportada "${k}"`);
    if (s.$ref && at(raiz, s.$ref.slice(1)) === undefined) problemas.push(`${caminho}: $ref inexistente ${s.$ref}`);
    if (s.pattern) try { new RegExp(s.pattern); } catch { problemas.push(`${caminho}: pattern inválido`); }
    for (const k of ['allOf', 'anyOf']) (s[k] || []).forEach((x, i) => visitar(x, `${caminho}/${k}/${i}`));
    for (const [k, x] of Object.entries(s.properties || {})) visitar(x, `${caminho}/properties/${k}`);
    if (s.items) visitar(s.items, `${caminho}/items`);
    for (const [k, x] of Object.entries(s.$defs || {})) visitar(x, `#/$defs/${k}`);
    for (const [k, x] of Object.entries(s.tipos || {})) visitar(x, `#/tipos/${k}`);
  };
  visitar(raiz, '#');
  return problemas;
}
export function validarEsquema(raiz, s, v, caminho = '') {
  const erros = [];
  const ir = (s, v, c) => {
    if (s.$ref) ir(at(raiz, s.$ref.slice(1)), v, c);
    for (const x of s.allOf || []) ir(x, v, c);
    if (s.anyOf && !s.anyOf.some((x) => validarEsquema(raiz, x, v, c).length === 0)) erros.push(`${c || '/'}: não satisfaz nenhuma alternativa (anyOf)`);
    if (s.type) { const ts = [].concat(s.type); const t = tipoDe(v); if (!ts.includes(t) && !(t === 'integer' && ts.includes('number'))) { erros.push(`${c || '/'}: tipo ${t}, esperado ${ts.join('|')}`); return; } }
    if (s.enum && !s.enum.includes(v)) erros.push(`${c || '/'}: valor fora da lista (${JSON.stringify(v)})`);
    if ('const' in s && v !== s.const) erros.push(`${c || '/'}: esperado ${JSON.stringify(s.const)}`);
    if (s.pattern && typeof v === 'string' && !new RegExp(s.pattern).test(v)) erros.push(`${c || '/'}: fora do padrão ${s.pattern}`);
    if (s.minimum !== undefined && typeof v === 'number' && v < s.minimum) erros.push(`${c || '/'}: menor que ${s.minimum}`);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      for (const k of s.required || []) if (!(k in v)) erros.push(`${c || '/'}: campo obrigatório ausente "${k}"`);
      for (const [k, x] of Object.entries(s.properties || {})) if (k in v) ir(x, v[k], `${c}/${k}`);
    }
    if (Array.isArray(v)) {
      if (s.minItems !== undefined && v.length < s.minItems) erros.push(`${c || '/'}: menos de ${s.minItems} item(ns)`);
      if (s.items) v.forEach((x, i) => ir(s.items, x, `${c}/${i}`));
    }
  };
  ir(s, v, caminho);
  return erros;
}
