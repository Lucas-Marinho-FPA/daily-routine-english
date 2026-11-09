// Base Pedagógica — autoteste das verificações que dependem do git e do fluxo de consolidação (2, 4, 5, 10, 11 e a recusa
// de regravar um ORI). Monta um repositório git TEMPORÁRIO com as ferramentas, uma fonte sintética e um adaptador de
// teste; consolida, confirma 0 erro e depois planta um defeito por vez. Não toca no repositório real.
// Uso: node dev/tools/base/autoteste-base.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REAL = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const T = mkdtempSync(join(tmpdir(), 'base-autoteste-'));
const git = (...a) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: T, stdio: 'pipe' }).toString();
const node = (...a) => { try { return { code: 0, out: execFileSync('node', a, { cwd: T, stdio: 'pipe' }).toString() }; } catch (e) { return { code: e.status, out: e.stdout.toString() + e.stderr.toString() }; } };
const ler = (f) => readFileSync(join(T, f), 'utf8');
const gravar = (f, c) => writeFileSync(join(T, f), c);
try {
  mkdirSync(join(T, 'dev/tools'), { recursive: true });
  cpSync(join(REAL, 'dev/tools/base'), join(T, 'dev/tools/base'), { recursive: true });
  mkdirSync(join(T, 'base/conferencia'), { recursive: true });
  for (const f of ['esquema.json', 'manifesto.json', 'progressao/catalogo.json']) cpSync(join(REAL, 'base', f), join(T, 'base', f));
  // fonte e adaptador sintéticos (texto inventado só para o teste)
  gravar('fonte.json', JSON.stringify({ items: [{ en: 'synthetic word', pt: 'palavra sintética' }, { en: 'another word', pt: 'outra palavra' }], _doc: 'teste' }));
  gravar('dev/tools/base/fontes.mjs', `export const FONTES = [{ codigo: 'T1', titulo: 'fonte sintética', grupo: 'teste', arquivo: 'fonte.json', versao: process.env.REV_FONTE, natureza: 'autoria', distribuicao: 'integral', regras: ['/items/*', '/_doc'] }];\n`);
  gravar('dev/tools/base/decisoes.mjs', `export const DECISOES = [{ chave: 'subtipo:synthetic word', forma: 'synthetic word', data: '2026-11-09', status: 'aprovada', aprovada_por: 'teste',
  decisao: process.env.DEC_TEXTO || 'decisão sintética', justificativa: 'teste', efeitos: [{ campo: 'subtipo', valor: 'collocation' }] }];\n`);
  gravar('dev/tools/base/adaptadores/teste.mjs', `export default function ({ ids, conteudo, semUnidade, data, fontes }) {
  const out = [];
  for (const [local, o] of Object.entries(fontes.T1)) {
    if (local === '/_doc') { semUnidade(o, 'metadado', 'documentação'); continue; }
    const x = conteudo(o);
    out.push({ id: ids.id('EXP', x.en), tipo: 'EXP', forma: x.en, subtipo: null, status: 'ativo', versao: 1, historico: [{ versao: 1, data, mudanca: 'teste' }], evidencias: [{ ori: o, campo: 'en' }], traducoes: [{ texto: x.pt, origem: { ori: o, campo: 'pt' } }] });
  }
  return out;
}\n`);
  git('init', '-q'); git('add', '-A'); git('commit', '-qm', 'fonte');
  process.env.REV_FONTE = git('rev-parse', 'HEAD').trim();
  const c1 = node('dev/tools/base/consolidar.mjs', 'teste');
  if (c1.code) throw new Error(`consolidação falhou: ${c1.out}`);
  node('dev/tools/base/gerar.mjs');
  git('add', '-A'); git('commit', '-qm', 'base');
  const V = ['dev/tools/base/validar.mjs'];
  let falhas = 0;
  const caso = (nome, esperado, prep, desfaz = () => {}) => {
    prep(); const r = node(...V); desfaz();
    const ok = esperado === 0 ? r.code === 0 : r.out.includes(`ERRO ${esperado}.`);
    if (!ok) { falhas++; console.log(r.out); }
    console.log(`${ok ? 'ok   ' : 'FALHA'} ${esperado === 0 ? nome : `verificação ${esperado} reprova: ${nome}`}`);
  };
  const salva = (f) => { const c = ler(f); return () => gravar(f, c); };
  const ori = 'base/registros/origem/FON-000001.jsonl';
  caso('base mínima consolidada passa (0 erro)', 0, () => {});
  let d = salva('base/ids.jsonl');
  caso('ID ausente de ids.jsonl', 2, () => gravar('base/ids.jsonl', ler('base/ids.jsonl').split('\n').slice(1).join('\n')), d);
  d = salva('base/conferencia/FON-000001.json');
  caso('conservação (originais ≠ incorporados + pendentes)', 5, () => { const c = JSON.parse(ler('base/conferencia/FON-000001.json')); c.originais += 1; gravar('base/conferencia/FON-000001.json', JSON.stringify(c)); }, d);
  d = salva('docs/base-pedagogica/gerado/inventario.md');
  caso('Markdown editado à mão', 10, () => appendFileSync(join(T, 'docs/base-pedagogica/gerado/inventario.md'), 'edição\n'), d);
  d = salva('base/manifesto.json');
  caso('manifesto desatualizado', 10, () => { const m = JSON.parse(ler('base/manifesto.json')); m.arquivos[0].sha256 = '0'.repeat(64); gravar('base/manifesto.json', JSON.stringify(m)); }, d);
  d = salva(ori);
  caso('ORI apagado depois de registrado', 11, () => { gravar(ori, ler(ori).split('\n').slice(1).join('\n')); node('dev/tools/base/gerar.mjs'); }, () => { d(); node('dev/tools/base/gerar.mjs'); });
  d = salva('base/ids.jsonl');
  caso('linha de ids.jsonl alterada (ID reaproveitado)', 11, () => { gravar('base/ids.jsonl', ler('base/ids.jsonl').replace('EXP:synthetic word', 'EXP:outra coisa')); node('dev/tools/base/gerar.mjs'); }, () => { d(); node('dev/tools/base/gerar.mjs'); });
  // fonte alterada no git depois da extração: hash do arquivo e reconstrução acusam; reconsolidar é recusado (ORI imutável)
  gravar('fonte.json', JSON.stringify({ items: [{ en: 'synthetic  word', pt: 'palavra sintética' }, { en: 'another word', pt: 'outra palavra' }], _doc: 'teste' }));
  git('commit', '-qam', 'fonte alterada');
  const revNova = git('rev-parse', 'HEAD').trim();
  const fon = 'base/fontes/fontes.jsonl', confs = 'base/conferencia/FON-000001.json';
  d = (() => { const a = salva(fon), b = salva(confs), c = salva(ori); return () => { a(); b(); c(); }; })();
  caso('arquivo-fonte trocado sem nova versão (hash do arquivo)', 4, () => {
    for (const f of [fon, confs]) gravar(f, ler(f).replaceAll(process.env.REV_FONTE, revNova));
    gravar(ori, ler(ori).replaceAll(process.env.REV_FONTE, revNova));
  }, d);
  // consolidar NUNCA regrava um ORI existente: se o registro gravado difere do que a fonte daria, a consolidação para
  d = salva(ori);
  gravar(ori, ler(ori).replace('"palavra sintética"', '"palavra alterada"'));
  const rec = node('dev/tools/base/consolidar.mjs', 'teste');
  const recusou = rec.code !== 0 && rec.out.includes('imutável');
  d();
  console.log(`${recusou ? 'ok   ' : 'FALHA'} consolidação recusa regravar um ORI existente diferente (imutabilidade no gravador)`);
  if (!recusou) { falhas++; console.log(rec.out); }
  // decisão aplicada (subtipo central + DIV inexistente aqui) e imutável depois de registrada
  const exp = ler('base/registros/expressoes.jsonl');
  const okDec = exp.includes('"subtipo":"collocation"') && exp.includes('"subtipo_decisao":"DEC-000001"');
  console.log(`${okDec ? 'ok   ' : 'FALHA'} decisão aprovada aplicada à unidade (subtipo central + referência à DEC)`); if (!okDec) falhas++;
  process.env.DEC_TEXTO = 'decisão sintética ALTERADA';
  const rd = node('dev/tools/base/consolidar.mjs', 'teste');
  delete process.env.DEC_TEXTO;
  const recusouDec = rd.code !== 0 && rd.out.includes('uma decisão registrada não muda');
  console.log(`${recusouDec ? 'ok   ' : 'FALHA'} consolidação recusa alterar uma DEC já registrada`); if (!recusouDec) { falhas++; console.log(rd.out); }
  console.log(`autoteste da base: ${falhas ? 'FALHOU' : 'ok'} (${falhas} falha(s))`);
  process.exitCode = falhas ? 1 : 0;
} finally { rmSync(T, { recursive: true, force: true }); }
