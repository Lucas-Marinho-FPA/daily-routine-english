// Glossário inglês → português (data/glossary-en-pt.json.gz) e o mínimo de português para a avaliação das
// traduções do Curso — Atividades: palavras gramaticais, redução simples de flexões e o índice inverso
// (palavra em português → significados em inglês). Carregado só na área do Curso; sem rede depois do 1º acesso.

import { levenshtein } from './text.js';

let en = null; // Map chave inglês → [traduções]
let trusted = new Map(); // chave → [traduções] só das entradas escritas para o app (sem FreeDict)
let inverse = null; // Map raiz pt → Set(chaves inglês)
let loading = null;

const PT_STOP = new Set(`a o as os um uma uns umas de do da dos das em no na nos nas num numa por pelo pela pelos pelas para pra pro
  com sem sob sobre entre ate e ou mas que se nao sim ja so tambem mais menos muito muita muitos muitas pouco pouca bem mal
  eu tu ele ela nos vos eles elas voce voces me te se lhe lhes nos vos meu minha meus minhas teu tua seu sua seus suas nosso nossa
  isso isto aquilo esse essa este esta aquele aquela esses essas estes estas aqueles aquelas aqui ali la ai ca entao como quando onde
  qual quais quem cujo ser sou e era foi fui sao estar estou esta estava estao ter tenho tem tinha temos ha haver vai vou ir
  poder posso pode podemos podia poderia fazer faco faz favor ok mim ti si comigo contigo conosco cade quer quero queria querer ta tah ah oh hum hmm hein ne pois o`.split(/\s+/));

export const fold = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[‘’]/g, "'").toLowerCase();
const SUFFIX = ['amentos', 'imentos', 'amento', 'imento', 'acoes', 'acao', 'mente', 'ando', 'endo', 'indo', 'aram', 'eram', 'iram', 'avam',
  'ados', 'idos', 'adas', 'idas', 'ado', 'ido', 'ada', 'ida', 'aria', 'eria', 'iria', 'ar', 'er', 'ir', 'ou', 'eu', 'iu', 'am', 'em', 'es', 'os', 'as', 's', 'a', 'o', 'e'];
/** Raiz aproximada de uma palavra em português (já sem acentos). */
export function ptStem(w) {
  for (const suf of SUFFIX) if (w.endsWith(suf) && w.length - suf.length >= 4) return w.slice(0, -suf.length);
  return w;
}
/** Duas raízes equivalem? (iguais, ou uma começa a outra com pelo menos 4 letras: “recad” ~ “recado”) */
export const stemEq = (a, b) => a === b || (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a)))
  || (a.length >= 5 && b.length >= 5 && a.slice(0, 3) === b.slice(0, 3) && levenshtein(a, b) <= 1); // “prefir” ~ “prefer”
/** Palavras de conteúdo de um texto em português (raízes), na ordem. */
export const ptContent = (text) => (fold(text).match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) || []).filter((w) => !PT_STOP.has(w) && !/^\d+$/.test(w)).map((w) => ({ w, s: ptStem(w) }));

/** Define o glossário diretamente (testes / dados já carregados). */
export function setGlossary(data) {
  en = new Map(Object.entries(data.en || data));
  trusted = new Map(Object.entries(data.trusted || {}));
  inverse = new Map();
  for (const [k, list] of en) {
    for (const p of list) {
      const c = ptContent(p);
      if (c.length !== 1) continue; // só traduções de uma palavra de conteúdo indicam o sentido de uma palavra solta
      const set = inverse.get(c[0].s) || new Set();
      set.add(k);
      inverse.set(c[0].s, set);
    }
  }
}
export const glossaryReady = () => !!en;
export const translationsOf = (k) => (en && en.get(k)) || null;
/** Traduções da chave vindas só das entradas escritas para o app (pares dos conteúdos e expressões de apoio), ou null. */
export const trustedOf = (k) => trusted.get(k) || null;
/** Significados em inglês de uma raiz em português (índice inverso), ou null. */
export function meaningsOf(stem) {
  if (!inverse) return null;
  if (inverse.has(stem)) return inverse.get(stem);
  for (const [s, set] of inverse) if (stemEq(s, stem) && Math.abs(s.length - stem.length) <= 2) return set;
  return null;
}

/** Carrega data/glossary-en-pt.json.gz (pré-cacheado). Resolve true/false; nunca lança. */
export function loadGlossary(url = 'data/glossary-en-pt.json.gz') {
  if (en) return Promise.resolve(true);
  if (!loading) {
    loading = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return false;
        let buf = new Uint8Array(await res.arrayBuffer());
        if (buf[0] === 0x1f && buf[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
          buf = new Uint8Array(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
        }
        setGlossary(JSON.parse(new TextDecoder().decode(buf)));
        return true;
      } catch (e) { return false; } finally { loading = null; }
    })();
  }
  return loading;
}
