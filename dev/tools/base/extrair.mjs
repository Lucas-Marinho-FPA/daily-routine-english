// Base Pedagógica — extração literal de uma fonte JSON em registros de origem (ORI).
// Regras = lista de padrões de JSON pointer (`*` = qualquer segmento). Cada nó que casa vira UM registro, com o
// conteúdo exatamente como está na fonte. A extração FALHA se algum valor da fonte não ficar dentro de exatamente
// um registro (nada se perde, nada é contado duas vezes). `reconstruir` refaz o documento a partir dos registros:
// é a prova de que o original continua recuperável.
import { canon, esc } from './lib.mjs';

const casa = (padrao, segs) => {
  const p = padrao.split('/').slice(1);
  return p.length === segs.length && p.every((x, i) => x === '*' || x === segs[i]);
};

export function extrair(doc, regras) {
  const registros = [], descobertos = [], sobrepostos = [], listas = [];
  const andar = (no, segs) => {
    const local = segs.map((s) => `/${s}`).join('');
    const regra = regras.find((r) => casa(r, segs));
    if (regra) {
      if (regras.some((r) => r !== regra && casa(r, segs))) sobrepostos.push(local);
      registros.push({ local, regra, conteudo: no });
      return;
    }
    const filhos = Array.isArray(no) ? no.map((v, i) => [String(i), v]) : no && typeof no === 'object' ? Object.entries(no).map(([k, v]) => [esc(k), v]) : null;
    if (!filhos || !filhos.length) { descobertos.push(local || '/'); return; }
    if (Array.isArray(no)) listas.push(local || '/');
    for (const [k, v] of filhos) andar(v, [...segs, k]);
  };
  andar(doc, []);
  return { registros, descobertos, sobrepostos, listas };
}

const FOLHA = Symbol('folha');
const desc = (s) => s.replace(/~1/g, '/').replace(/~0/g, '~');
// `listas`: contêineres que eram listas na fonte (registrado na conferência), para a reconstrução ser exata
export function reconstruir(oris, listas = []) {
  const ehLista = new Set(listas);
  const raiz = {};
  for (const o of oris) {
    const segs = o.local.split('/').slice(1).map(desc);
    let cur = raiz;
    segs.forEach((k, i) => {
      if (i === segs.length - 1) cur[k] = { [FOLHA]: structuredClone(o.conteudo) };
      else cur = cur[k] ??= {};
    });
  }
  const arrumar = (x, local) => {
    if (x && FOLHA in x) return x[FOLHA];   // conteúdo de um registro: devolvido intacto
    for (const k of Object.keys(x)) x[k] = arrumar(x[k], `${local}/${k.replace(/~/g, '~0').replace(/\//g, '~1')}`);
    if (!ehLista.has(local || '/')) return x;
    const ks = Object.keys(x).map(Number).sort((a, b) => a - b);
    return ks.map((k) => x[k]);
  };
  return arrumar(raiz, '');
}

export const recuperavel = (oris, listas, fonte) => canon(reconstruir(oris, listas)) === canon(fonte);
