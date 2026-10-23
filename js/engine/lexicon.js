// Léxico do inglês para conferir transcrições de respostas livres (sem rede: arquivo local em cache).
// Fonte: lista de palavras do CMU Pronouncing Dictionary (BSD-2, Carnegie Mellon University) + vocabulário do app.
// Uso: uma palavra transcrita que não existe em inglês (ex.: “ubershift”, “youber”) indica uma provável
// divergência do RECONHECIMENTO — nunca um erro de pronúncia comprovado.

let words = null;
let loading = null;

/** Define o léxico diretamente (testes em Node). */
export function setLexicon(list) { words = list instanceof Set ? list : new Set(list); }
export const lexiconReady = () => !!words;

/**
 * Carrega data/lexicon.txt.gz (pré-cacheado pelo service worker). Resolve true/false; nunca lança:
 * sem léxico (ex.: app aberto como arquivo), a checagem de palavras inexistentes simplesmente não é feita.
 */
export function loadLexicon(url = 'data/lexicon.txt.gz') {
  if (words) return Promise.resolve(true);
  if (!loading) {
    loading = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return false;
        let buf = new Uint8Array(await res.arrayBuffer());
        // alguns servidores já entregam descompactado (Content-Encoding): só descompacta se for gzip de fato
        if (buf[0] === 0x1f && buf[1] === 0x8b && typeof DecompressionStream !== 'undefined') {
          buf = new Uint8Array(await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
        }
        words = new Set(new TextDecoder().decode(buf).split('\n').filter(Boolean));
        return true;
      } catch (e) { return false; } finally { loading = null; }
    })();
  }
  return loading;
}

const IRREGULAR = { woke: 'wake', woken: 'wake', got: 'get', gotten: 'get', went: 'go', gone: 'go', had: 'have', has: 'have', ate: 'eat', eaten: 'eat', drove: 'drive', driven: 'drive', took: 'take', taken: 'take', made: 'make', came: 'come', left: 'leave', bought: 'buy', brought: 'bring', slept: 'sleep', did: 'do', does: 'do', was: 'be', were: 'be', is: 'be', are: 'be', am: 'be', been: 'be', saw: 'see', seen: 'see', said: 'say', spent: 'spend', met: 'meet', ran: 'run', drank: 'drink', felt: 'feel', kept: 'keep', thought: 'think', told: 'tell', taught: 'teach', read: 'read', wrote: 'write', written: 'write', sat: 'sit', stood: 'stand', began: 'begin', found: 'find', heard: 'hear', paid: 'pay', put: 'put', set: 'set', shut: 'shut', children: 'child', men: 'man', women: 'woman', feet: 'foot', teeth: 'tooth' };

/** Forma-base aproximada (minúsculas): irregulares comuns + -s/-es/-ies/-ed/-ing (com consoante dobrada). */
export function lemma(w) {
  let t = String(w).toLowerCase().replace(/[’]/g, "'").replace(/'s$/, '');
  if (IRREGULAR[t]) return IRREGULAR[t];
  if (t.length > 4 && t.endsWith('ies')) return t.slice(0, -3) + 'y';
  if (t.length > 4 && /(ches|shes|sses|xes|zes)$/.test(t)) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('s') && !/(ss|us|is)$/.test(t)) t = t.slice(0, -1);
  else if (t.length > 5 && t.endsWith('ing')) t = undouble(t.slice(0, -3));
  else if (t.length > 4 && t.endsWith('ied')) t = t.slice(0, -3) + 'y';
  else if (t.length > 4 && t.endsWith('ed')) t = undouble(t.slice(0, -2));
  return t;
}
function undouble(t) { return /([b-df-hj-np-tv-z])\1$/.test(t) && !/(ll|ss|ff|zz)$/.test(t) ? t.slice(0, -1) : t; }

/** A palavra existe em inglês? (léxico, vocabulário extra do app ou forma-base). null = léxico indisponível. */
export function isKnownWord(w, extra = null) {
  if (!words) return null;
  const t = String(w).toLowerCase().replace(/[’]/g, "'");
  if (words.has(t) || (extra && extra.has(t))) return true;
  const base = lemma(t);
  if (words.has(base) || (extra && extra.has(base))) return true;
  // -ed/-ing de verbos terminados em -e (“baked”, “making”)
  return words.has(base + 'e') || words.has(t.replace(/'s$/, ''));
}
