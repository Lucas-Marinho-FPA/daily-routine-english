// Base Pedagógica — autoteste das verificações que dependem do repositório (2 ids.jsonl, 5, 10, 11, 4 na fonte).
// Monta um repositório git TEMPORÁRIO com as ferramentas e uma fonte sintética, grava uma base mínima válida,
// confirma 0 erro e depois planta um defeito por vez. Não toca no repositório real.
// Uso: node dev/tools/base/autoteste-base.mjs
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, rmSync, appendFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const REAL = join(AQUI, '../../..');
const T = mkdtempSync(join(tmpdir(), 'base-autoteste-'));
const git = (...a) => execFileSync('git', a, { cwd: T, stdio: 'pipe' }).toString();
const sh = (args) => { try { return { code: 0, out: execFileSync('node', args, { cwd: T, stdio: 'pipe' }).toString() }; } catch (e) { return { code: e.status, out: e.stdout.toString() }; } };
try {
  mkdirSync(join(T, 'dev/tools'), { recursive: true });
  cpSync(join(REAL, 'dev/tools/base'), join(T, 'dev/tools/base'), { recursive: true });
  cpSync(join(REAL, 'base'), join(T, 'base'), { recursive: true });
  for (const f of ['ids.jsonl', 'fontes/fontes.jsonl', 'conhecimento/vocabulario.jsonl']) writeFileSync(join(T, 'base', f), '');
  // fonte sintética (texto inventado só para o teste)
  writeFileSync(join(T, 'fonte.json'), JSON.stringify({ items: [{ en: 'synthetic word', pt: 'palavra sintética' }] }));
  git('init', '-q'); git('-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '-A'); git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'fonte');
  const rev = git('rev-parse', 'HEAD').trim();
  const { hashOf } = await import(join(T, 'dev/tools/base/lib.mjs'));
  const conteudo = { en: 'synthetic word', pt: 'palavra sintética' };
  const L = (o) => JSON.stringify(o) + '\n';
  writeFileSync(join(T, 'base/fontes/fontes.jsonl'), L({ id: 'FON-000001', tipo: 'FON', camada: 'publica', natureza: 'autoria', arquivo: 'fonte.json', versao: rev }));
  writeFileSync(join(T, 'base/origem/FON-000001.jsonl'), L({ id: 'ORI-000001', tipo: 'ORI', camada: 'publica', fonte: 'FON-000001', versao_fonte: rev, local: '/items/0', id_original: null, tipo_original: 'teste', conteudo, hash: hashOf(conteudo), extraido_em: '2026-11-09', extrator: 'autoteste' }));
  writeFileSync(join(T, 'base/conhecimento/vocabulario.jsonl'), L({ id: 'VOC-000001', tipo: 'VOC', camada: 'publica', status: 'ativo', versao: 1, historico: [{ versao: 1, data: '2026-11-09', mudanca: 'teste' }], forma: 'synthetic word', evidencias: [{ ori: 'ORI-000001', campo: 'en' }], traducoes: [{ texto: 'palavra sintética', origem: { ori: 'ORI-000001' } }] }));
  writeFileSync(join(T, 'base/conferencia/FON-000001.json'), JSON.stringify({ fonte: 'FON-000001', originais: 1, pendentes: [] }));
  writeFileSync(join(T, 'base/ids.jsonl'), ['FON-000001', 'ORI-000001', 'VOC-000001'].map((id) => L({ id, tipo: id.slice(0, 3), camada: 'publica', criado_em: '2026-11-09' })).join(''));
  sh(['dev/tools/base/gerar.mjs']);
  git('add', '-A'); git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'base');
  const V = ['dev/tools/base/validar.mjs'];
  let falhas = 0;
  const conferir = (nome, esperado, prep, desfaz) => {
    prep(); const r = sh(V); desfaz();
    const ok = esperado === 0 ? r.code === 0 : r.out.includes(`ERRO ${esperado}.`);
    if (!ok) { falhas++; console.log(r.out); }
    console.log(`${ok ? 'ok   ' : 'FALHA'} ${esperado === 0 ? 'base mínima válida passa' : `verificação ${esperado} reprova: ${nome}`}`);
  };
  const salva = (f) => { const c = readFileSync(join(T, f), 'utf8'); return () => writeFileSync(join(T, f), c); };
  let d;
  conferir('—', 0, () => {}, () => {});
  d = salva('base/ids.jsonl'); conferir('ID ausente de ids.jsonl', 2, () => writeFileSync(join(T, 'base/ids.jsonl'), readFileSync(join(T, 'base/ids.jsonl'), 'utf8').split('\n').slice(1).join('\n')), d);
  d = salva('base/ids.jsonl'); conferir('ID registrado duas vezes', 2, () => appendFileSync(join(T, 'base/ids.jsonl'), readFileSync(join(T, 'base/ids.jsonl'), 'utf8').split('\n')[0] + '\n'), d);
  d = salva('base/conferencia/FON-000001.json'); conferir('conservação (originais 2, incorporado 1, nenhum pendente)', 5, () => writeFileSync(join(T, 'base/conferencia/FON-000001.json'), JSON.stringify({ fonte: 'FON-000001', originais: 2, pendentes: [] })), d);
  d = salva('base/conferencia/FON-000001.json'); conferir('pendente sem motivo', 5, () => writeFileSync(join(T, 'base/conferencia/FON-000001.json'), JSON.stringify({ fonte: 'FON-000001', originais: 2, pendentes: [{ local: '/items/1' }] })), d);
  d = salva('docs/base-pedagogica/gerado/inventario.md'); conferir('Markdown editado à mão', 10, () => appendFileSync(join(T, 'docs/base-pedagogica/gerado/inventario.md'), 'edição\n'), d);
  d = salva('base/manifesto.json'); conferir('manifesto desatualizado', 10, () => { const m = JSON.parse(readFileSync(join(T, 'base/manifesto.json'))); m.arquivos[0].sha256 = '0'.repeat(64); writeFileSync(join(T, 'base/manifesto.json'), JSON.stringify(m)); }, d);
  d = salva('base/origem/FON-000001.jsonl'); conferir('ORI apagado do arquivo de origem', 11, () => { writeFileSync(join(T, 'base/origem/FON-000001.jsonl'), ''); sh(['dev/tools/base/gerar.mjs']); }, () => { d(); sh(['dev/tools/base/gerar.mjs']); });
  d = salva('base/ids.jsonl'); conferir('linha de ids.jsonl alterada (ID reaproveitado)', 11, () => { writeFileSync(join(T, 'base/ids.jsonl'), readFileSync(join(T, 'base/ids.jsonl'), 'utf8').replace('"tipo":"VOC"', '"tipo":"VOC","reuso":true')); sh(['dev/tools/base/gerar.mjs']); }, () => { d(); sh(['dev/tools/base/gerar.mjs']); });
  d = salva('fonte.json'); conferir('fonte alterada depois da extração (hash na fonte)', 4, () => { writeFileSync(join(T, 'base/origem/FON-000001.jsonl'), readFileSync(join(T, 'base/origem/FON-000001.jsonl'), 'utf8').replace(`"versao_fonte":"${rev}"`, '"versao_fonte":"HEAD~0"')); writeFileSync(join(T, 'fonte.json'), '{"items":[{"en":"synthetic  word","pt":"palavra sintética"}]}'); git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qam', 'muda fonte'); }, () => { git('reset', '-q', '--hard', 'HEAD~1'); });
  console.log(`autoteste da base: ${falhas ? 'FALHOU' : 'ok'} (${falhas} falha(s))`);
  process.exitCode = falhas ? 1 : 0;
} finally { rmSync(T, { recursive: true, force: true }); }
