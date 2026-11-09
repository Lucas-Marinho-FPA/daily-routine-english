// Base Pedagógica — autoteste da identificação de formas flexionadas (morfologia.mjs) e da sua aplicação na base real.
// Uso: node dev/tools/base/autoteste-morfologia.mjs
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE, lerJsonl } from './lib.mjs';
import { ocorrencias } from './morfologia.mjs';

const CAT = JSON.parse(readFileSync(join(BASE, 'progressao/catalogo.json'), 'utf8'));
const P = Object.fromEntries(Object.entries(CAT.paradigmas_verbais).filter(([k]) => k !== '_doc'));
let falhas = 0;
const caso = (nome, ok, det = '') => { if (!ok) falhas++; console.log(`${ok ? 'ok   ' : 'FALHA'} ${nome}${ok || !det ? '' : ` — ${det}`}`); };
const achar = (forma, texto) => ocorrencias(forma, texto, P);

// ---------- devem ser associadas (confirmadas: verbo-cabeça com paradigma no catálogo) ----------
for (const [forma, texto, esperado] of [
  ['get changed', 'After showering and getting changed at the gym, I walk.', 'getting changed'],
  ['get changed', 'He gets changed after work.', 'gets changed'],
  ['get changed', 'We got changed quickly.', 'got changed'],
  ['get dressed', 'After getting dressed, I help my family.', 'getting dressed'],
  ['get dressed', 'She got dressed for the party.', 'got dressed'],
  ['get changed', 'Getting  changed takes time.', 'Getting  changed'],
]) {
  const r = achar(forma, texto);
  caso(`associa “${esperado}” a “${forma}” (confirmada)`, r.length === 1 && r[0].forma_encontrada === esperado && r[0].status === 'confirmada'
    && texto.slice(r[0].inicio, r[0].fim) === esperado, JSON.stringify(r));
}
// ---------- NÃO devem ser associadas ----------
for (const [forma, texto, motivo] of [
  ['get changed', 'Last Tuesday, my plans changed completely.', 'só “changed”, sem o verbo-cabeça'],
  ['get changed', 'I get changed at the gym.', 'forma base literal (já coberta pelos exemplos literais)'],
  ['get changed', 'I got my clothes changed.', 'palavras intercaladas (não adjacente)'],
  ['get changed', 'They forgetting changed nothing.', 'limite de palavra (“forgetting”)'],
  ['get changed', 'Getting changedness is not a word.', 'limite de palavra no fim'],
  ['get dressed', 'I got undressed.', 'outra palavra (“undressed”)'],
  ['get', 'He got it.', 'palavra isolada (VOC) não entra'],
  ['get ready for', 'I got ready to leave.', 'resto da expressão diferente (“to” ≠ “for”)'],
]) caso(`não associa: ${motivo}`, achar(forma, texto).length === 0, JSON.stringify(achar(forma, texto)));
// ---------- candidatas (proposta, nunca confirmadas) ----------
for (const [forma, texto, esperado] of [
  ['turn up', 'He turns up late.', 'turns up'],
  ['look up', 'She looked up at the sky.', 'looked up'],
  ['make my bed', 'I am making my bed.', 'making my bed'],
]) {
  const r = achar(forma, texto);
  caso(`“${esperado}” fica só como candidata (proposta)`, r.length === 1 && r[0].status === 'proposta' && r[0].forma_encontrada === esperado, JSON.stringify(r));
}
// ---------- determinismo ----------
const t = 'After showering and getting changed at the gym, I got changed again.';
caso('determinística (mesma entrada → mesma saída, na ordem do texto)', JSON.stringify(achar('get changed', t)) === JSON.stringify(achar('get changed', t)) && achar('get changed', t).map((x) => x.inicio).join() === '20,50');

// ---------- base real ----------
const rels = lerJsonl(readFileSync(join(BASE, 'relacoes/relacoes.jsonl'), 'utf8')).filter((r) => r.relacao === 'aparece_em');
const segs = new Map(lerJsonl(readFileSync(join(BASE, 'registros/textos.jsonl'), 'utf8')).filter((r) => r.tipo === 'SEG').map((s) => [s.id, s]));
const conf = rels.filter((r) => r.status === 'confirmada');
caso('base: “getting changed” (Lucas R08) confirmada para get changed', conf.some((r) => r.forma_canonica === 'get changed' && r.forma_encontrada === 'getting changed' && segs.get(r.para)?.id_original === 'R08-B2'));
caso('base: “getting dressed” (Lukinhas L02) confirmada para get dressed', conf.some((r) => r.forma_canonica === 'get dressed' && r.forma_encontrada === 'getting dressed'));
caso('base: toda ocorrência registrada está no texto na posição indicada', rels.every((r) => segs.get(r.para)?.original.slice(r.posicao.inicio, r.posicao.fim) === r.forma_encontrada));
caso('base: confirmadas só com verbo-cabeça do catálogo', conf.every((r) => r.criterio === 'paradigma_verbal_catalogo:get'));
caso('base: “my plans changed” (Karla K09) não foi associado a nada', !rels.some((r) => /plans changed/i.test(r.forma_encontrada)));
console.log(`autoteste da morfologia: ${falhas ? 'FALHOU' : 'ok'} (${falhas} falha(s))`);
process.exitCode = falhas ? 1 : 0;
