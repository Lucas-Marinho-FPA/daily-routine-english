// Glossário inglês → português para a avaliação automática das traduções (Curso — Atividades).
// Fontes, por prioridade: 1) pares en/pt do próprio app (itens curtos dos conteúdos); 2) expressões de apoio
// (content/glossary/phrases-en-pt.json); 3) FreeDict English-Portuguese (vendor/freedict-eng-por, GPL-2.0+).
// Saída: app/data/glossary-en-pt.json.gz ({ v, en: { "chave": ["tradução", …] } }) + app/data/glossary-LICENSE.txt.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'app');
const out = new Map();
const key = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' -]+/g, ' ').replace(/\s+/g, ' ').trim();
const clean = (s) => s.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
const add = (en, pts) => {
  const k = key(en);
  if (!k) return;
  const list = out.get(k) || [];
  for (const p of pts.flatMap((x) => clean(x).split(/\s*[;,/]\s*/))) if (p && p.length <= 40 && !list.includes(p)) list.push(p);
  if (list.length) out.set(k, list.slice(0, 14));
};

// 1) pares do app (window.DRG_CONTENT / DRG_CHARACTERS / DRG_JOURNEYS): só itens curtos (até 3 palavras)
const g = {};
for (const f of ['content.js', 'characters.js', 'journeys.js']) { try { new Function('window', readFileSync(join(APP, 'data', f), 'utf8'))(g); } catch (e) { /* ausente */ } }
let appPairs = 0;
const walk = (o) => {
  if (!o || typeof o !== 'object') return;
  if (typeof o.en === 'string' && typeof o.pt === 'string' && o.en.split(/\s+/).length <= 3 && o.pt.length <= 40) { add(o.en, [o.pt]); appPairs++; }
  for (const v of Object.values(o)) walk(v);
};
walk(g);

// 2) expressões de apoio do app
const phrases = JSON.parse(readFileSync(join(ROOT, 'content/glossary/phrases-en-pt.json'), 'utf8'));
for (const [en, pts] of Object.entries(phrases)) if (!en.startsWith('_')) add(en, pts);

// entradas escritas para o app (fontes 1 e 2), sem o FreeDict: as práticas do Curso só usam como significado
// confirmado o que vem daqui ou da versão validada pelo professor (engine/coursepractice.js)
const trusted = Object.fromEntries([...out].map(([k, v]) => [k, v.slice()]));

// 3) FreeDict (TEI): <orth> → <quote>
const tei = readFileSync(join(ROOT, 'vendor/freedict-eng-por/eng-por.tei'), 'utf8');
let fd = 0;
for (const e of tei.split('<entry>').slice(1)) {
  const orth = (e.match(/<orth>([^<]+)<\/orth>/) || [])[1];
  if (!orth) continue;
  const tr = [...e.matchAll(/<quote>([^<]+)<\/quote>/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  if (tr.length) { add(orth, tr); fd++; }
}

const data = { v: 1, sources: ['app', 'phrases-en-pt', 'FreeDict eng-por 0.3 (GPL-2.0+)'], en: Object.fromEntries([...out].sort()),
  trusted: Object.fromEntries(Object.entries(trusted).sort()) };
const gz = gzipSync(JSON.stringify(data), { level: 9 });
writeFileSync(join(APP, 'data/glossary-en-pt.json.gz'), gz);
writeFileSync(join(APP, 'data/glossary-LICENSE.txt'), [
  'Glossário inglês → português usado na avaliação automática das traduções (Curso — Atividades).',
  '',
  'Contém dados derivados do FreeDict English-Portuguese Dictionary (eng-por, edição 0.3),',
  'Copyright (C) 1999-2017 dos autores listados em https://github.com/freedict/fd-dictionaries/tree/master/eng-por',
  '(gerado a partir do Ergane; colaborador: Raul Fernandes).',
  'Disponível sob a GNU General Public License, versão 2.0 ou (a seu critério) qualquer versão posterior:',
  'https://www.gnu.org/licenses/gpl-2.0.html — este arquivo derivado mantém a mesma licença.',
  '',
  'Também contém pares inglês/português dos conteúdos do próprio app e um glossário de expressões escrito para o app.',
  '',
].join('\n'));
console.log(JSON.stringify({ glossary: out.size, appPairs, trusted: Object.keys(trusted).length, freedict: fd, KB: Math.round(gz.length / 1024) }));
