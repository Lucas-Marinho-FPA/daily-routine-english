// Avaliação de respostas orais LIVRES (missões e perguntas da teacher) — funções puras, sem DOM.
//
// Uma resposta livre não tem texto-alvo: não é comparada palavra por palavra com o exemplo.
// A avaliação é separada em quatro componentes, cada um com critérios explícitos (docs/feedback-de-pronuncia.md):
//   0. Integridade   — a transcrição cobre todo o áudio? (engine/integrity.js) Se parte da fala pode ter sido
//      perdida, a falta de uma informação vira “não confirmado”, nunca “você não disse”.
//   A. Reconhecimento — a transcrição automática e possíveis divergências DO RECONHECEDOR
//      (palavra inexistente em inglês; trecho que destoa de uma moldura do conteúdo — engine/coherence.js e
//      engine/context.js; palavra fora do tema parecida com uma palavra esperada).
//      Cores (evidência, não confiança do reconhecedor): verde = compatível com o vocabulário/tema da atividade e
//      sem sinal contra; âmbar = trecho suspeito, confira; cinza = sem evidência para classificar.
//   B. Adequação      — relação com a pergunta, o elemento que a pergunta pede (horário, motivo, frequência…)
//      e quantidade de fala. Vocabulário diferente do exemplo nunca é penalizado.
//   C. Métricas       — duração, tempo de fala, velocidade estimada e pausas, só quando medidos.
//   D. Pronúncia      — NÃO avaliada: o app não mede fonemas.
// Não há nota numérica geral: cada componente diz o que foi (ou não) avaliado.
import { wordTokens, levenshtein } from './text.js';
import { segment, forms } from './wordfeedback.js';
import { lemma, isKnownWord, lexiconReady } from './lexicon.js';
import { findSlotSuspicions, findOddCombinations, findHoles, findContradictions, prepRef, categoryOf, phoneKey } from './coherence.js';
import { agreementIssues } from './agreement.js';
import { mayHaveLostSpeech } from './integrity.js';

// palavras funcionais, auxiliares e marcadores de hesitação: não contam como conteúdo
const STOP = new Set(('a an the and or but so if of to in on at for from by with about as into than then also too very really just ' +
  'i me my mine you your yours he him his she her it its we us our they them their this that these those there here ' +
  'be is am are was were been being do does did done have has had having can could will would shall should may might must ' +
  'not no yes oh um uh er ah hmm yeah okay ok well like what when where why how who which some any all every each much many ' +
  'more most lot lots thing things kind sort get got go going gone make made take took say said tell told know think').split(' '));

// vocabulário de vida diária além do conteúdo do app (respostas com outras palavras não podem parecer “fora do tema”)
const DAILY = ('wake sleep bed alarm breakfast lunch dinner supper meal snack coffee tea juice milk water toast bread egg eggs cereal fruit ' +
  'banana apple rice beans salad sandwich pasta pizza soup chicken meat fish vegetable cook cooking kitchen dish dishes shower bath teeth ' +
  'brush dress clothes uniform work job office company boss colleague coworker meeting email computer laptop desk report project task ' +
  'school college university class lesson course study homework teacher student english language book read write news newspaper ' +
  'watch tv television series movie film music song listen podcast radio phone message call chat text drive car bus train subway metro ' +
  'walk bike cycle taxi uber ride traffic commute home house apartment flat room clean cleaning laundry wash shop shopping supermarket ' +
  'market store buy pay gym exercise workout run running jog sport football soccer swim swimming yoga training walk family wife ' +
  'husband son daughter child kid baby parent mother mom mum father dad brother sister friend neighbour neighbor dog cat pet ' +
  'morning afternoon evening night noon midnight early late today weekday weekend monday tuesday wednesday thursday friday saturday ' +
  'sunday day week month year hour minute usually always sometimes often never daily routine schedule busy tired relax rest nap break ' +
  'hobby chess game play pray church eat drink prepare start finish leave arrive return spend stay visit help meet plan organise organize ' +
  'free time fun enjoy love park garden street bank salary shift customer client patient').split(' ');
// palavras genéricas demais para, sozinhas, mostrarem relação com o tema
const WEAK_TOPIC = new Set('today day time week year good nice great new big small thing people way part place number'.split(' '));

const ACTIVITY = new Set(('shut close log wake get have eat drink take go drive walk work study read watch listen play cook clean shower brush leave arrive ' +
  'start finish spend sleep prepare check meet call help pray relax rest run exercise train pick bring heat review practise practice write ' +
  'analyse analyze open turn switch park return come sit talk chat visit shop buy wash dress commute ride catch make do teach learn attend ' +
  'answer send plan organise organize try use present focus run jog swim cycle feed walk').split(' '));

const NUMBER_WORDS = 'one two three four five six seven eight nine ten eleven twelve fifteen twenty thirty forty fifty half quarter'.split(' ');
const RX = {
  time: new RegExp(`\\b(\\d{1,2}(:\\d\\d)?\\s?([ap]\\.?\\s?m\\.?)?|o'?clock|noon|midnight|morning|afternoon|evening|night|early|late|${NUMBER_WORDS.join('|')})\\b`),
  frequency: /\b(every|usually|always|often|sometimes|never|rarely|once|twice|times a|a week|a day|a month|daily|weekly|monthly|each (day|week)|on (mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays|weekdays|weekends))\b/,
  reason: /\b(because|since|so that|in order to|that's why|that is why|so i|so we|due to|as i|the reason)\b|\bto (be|have|get|spend|save|help|keep|relax|rest|study|improve|earn|make|avoid|feel|learn|stay|see)\b/,
  duration: /\b(minutes?|hours?|seconds?|half an hour|an hour|for (about |around )?(a|an|one|two|three|\d+)\b|all day|long|longer|shorter|quick|short)\b/,
  place: /\b(at|in|near|on|inside|outside|next to|close to)\b|\b(home|office|gym|street|park|work|school|bank|car|kitchen|room)\b/,
  meaning: /\b(means?|meaning|it'?s when|it is when|in other words|that is|it'?s like|refers to)\b/,
  like: /\b(like|love|enjoy|prefer|hate|don't|do not|favourite|favorite|fun|interesting|boring)\b/,
  yesno: /\b(yes|yeah|no|not|don't|doesn't|didn't|never|always|sometimes|usually|of course|sure|i do|i am|i did|i would|i'd|i will|i can)\b/,
  sequence: /\b(then|after|afterwards|before|first|next|later|finally|when|while|and then)\b/,
};
const FOOD = new Set('breakfast lunch dinner food eat drink coffee tea juice milk water toast bread egg cereal fruit banana apple rice beans salad sandwich pasta pizza soup chicken meat fish vegetable oats yogurt yoghurt cheese cake snack meal lunchbox'.split(' '));

const INTENT_LABEL = {
  time: 'Diz o horário ou o momento do dia', frequency: 'Diz com que frequência', reason: 'Explica o motivo', duration: 'Diz quanto tempo',
  place: 'Diz onde', meaning: 'Explica o significado', food: 'Diz o que come ou bebe', like: 'Diz se gosta (e por quê)',
  yesno: 'Responde sim/não ou confirma', activities: 'Conta o que você faz (atividades)', info: 'Dá uma informação concreta sobre o tema',
};
const INTENT_TIP = {
  time: 'Diga o horário ou o momento (ex.: “at seven”, “in the morning”).', frequency: 'Diga com que frequência (ex.: “every day”, “twice a week”).',
  reason: 'Explique o motivo (ex.: “because…”, “so I can…”).', duration: 'Diga quanto tempo (ex.: “for about an hour”).',
  place: 'Diga onde (ex.: “at home”, “near the office”).', meaning: 'Explique com suas palavras (ex.: “It means…”).',
  food: 'Diga o que você come ou bebe (ex.: “I have toast and coffee”).', like: 'Diga se gosta e por quê (ex.: “I love it because…”).',
  yesno: 'Comece respondendo diretamente (ex.: “Yes, I do” / “Not always”).', activities: 'Conte pelo menos duas coisas que você faz (ex.: “I wake up…, then I…”).',
  info: 'Dê um detalhe concreto ligado à pergunta.',
};

/** Qual elemento a pergunta pede (critério explícito, por padrões do texto da pergunta). */
export function questionIntent(question = '', unit = 'q') {
  if (unit === 'block' || unit === 'routine') return 'activities';
  const q = question.toLowerCase().replace(/[“”"?]/g, '').trim();
  if (/\bwhat time\b|^when\b|\bwhen do you\b/.test(q)) return 'time';
  if (/\bhow often\b/.test(q)) return 'frequency';
  if (/^why\b/.test(q)) return 'reason';
  if (/\bhow long\b/.test(q)) return 'duration';
  if (/^where\b/.test(q)) return 'place';
  if (/\bwhat does .* mean\b|\bmean\b$/.test(q)) return 'meaning';
  if (/\b(have|eat) for (breakfast|lunch|dinner)\b/.test(q)) return 'food';
  if (/^do you like\b|^do you enjoy\b/.test(q)) return 'like';
  if (/tell me about (your )?(daily )?(routine|day)|what do you (usually )?do\b|how do you spend|what do you like doing/.test(q)) return 'activities';
  // pergunta de escolha (“online or on a board?”): a resposta escolhe uma opção, não precisa de sim/não
  if (/^(do|does|did|is|are|was|were|have|has|would|can|could)\b/.test(q) && !/\bor\b/.test(q)) return 'yesno';
  return 'info';
}

/** Vocabulário do app (uma vez por conteúdo): palavras conhecidas e lemas de conteúdo do tema. */
export function buildVocab(content) {
  const known = new Set(), domain = new Set(DAILY.map(lemma));
  const add = (t) => { if (!t) return; for (const w of wordTokens(t)) { known.add(w); const l = lemma(w); if (!STOP.has(l) && !/\d/.test(l)) domain.add(l); } };
  for (const s of Object.values(content.sentences || {})) add(s.en);
  for (const b of Object.values(content.blocks || {})) add(b.en);
  for (const it of Object.values(content.items || {})) { add(it.en); (it.ex || []).forEach((x) => add(x.en)); }
  for (const q of Object.values(content.questions || {})) { add(q.q); add(q.a); (q.altAnswers || []).forEach(add); }
  return { known, domain };
}

// lemma() corta o e mudo nas formas em -ing (“driving” → “driv”): “driv” e “drive” contam como o mesmo verbo
const sameLemma = (a, b) => a === b || a + 'e' === b || b + 'e' === a;
const contentLemmas = (text) => wordTokens(text).map(lemma).filter((l) => l.length > 1 && !STOP.has(l) && !/^\d/.test(l));
const skeleton = (w) => w.replace(/(?!^)[aeiouy]/g, '').replace(/(.)\1+/g, '$1');
// esqueleto de SONS (grafia normalizada por phoneKey: c→s antes de e/i/y, ph→f, e mudo…): “ofcy”, “offsy”, “office” → “ofs”
const soundSkeleton = (w) => skeleton(phoneKey(w).norm);

/**
 * Hipótese contextual para um trecho que não é palavra do inglês (“ofcy”, “off-scene”): a palavra da pergunta,
 * do exemplo ou de uma alternativa aceita (ainda não dita na resposta) com o mesmo som-esqueleto (mesma inicial,
 * no máximo 1 consoante de diferença). Só devolve uma hipótese quando ela é ÚNICA; empate ou nada → null
 * (o trecho fica inconclusivo). Não é correção: a transcrição continua como foi reconhecida.
 */
export function contextualHypothesis(heard, candidates) {
  const h = soundSkeleton(heard);
  if (h.length < 2) return null;
  let best = null, bestD = 2, tie = false;
  for (const c of candidates) {
    const k = soundSkeleton(c);
    if (k.length < 3 || k[0] !== h[0] || Math.abs(k.length - h.length) > 1) continue;
    const d = levenshtein(h, k);
    if (d < bestD) { best = c; bestD = d; tie = false; } else if (d === bestD && best && lemma(best) !== lemma(c)) tie = true;
  }
  return best && !tie ? best : null;
}

/** Transcrição degenerada (laço do modelo) — nada é avaliado. */
export function degenerateFree(tokens) {
  let run = 1;
  for (let j = 1; j < tokens.length; j++) { run = tokens[j] === tokens[j - 1] ? run + 1 : 1; if (run >= 4) return true; }
  if (tokens.length >= 10) {
    const freq = {};
    for (const t of tokens) freq[t] = (freq[t] || 0) + 1;
    if (Math.max(...Object.values(freq)) / tokens.length > 0.4) return true;
  }
  return false;
}

/** Áudio sem voz suficiente para transcrever (o modelo nem é chamado). */
export const insufficientAudio = (analysis) => !analysis || analysis.silent || analysis.speechSec < 0.8;

/**
 * @param p.question   texto da pergunta (ou instrução da missão)
 * @param p.model      resposta-exemplo (só referência: nunca exigida)
 * @param p.unit       'q' (pergunta), 'block', 'routine', 'drill'
 * @param p.transcript transcrição automática ('' ou null = nada reconhecido)
 * @param p.analysis   métricas da gravação (audio/analysis.js) ou null
 * @param p.vocab      buildVocab(content)
 * @param p.grammar    dicas de gramática do corretor do app sobre a transcrição (opcional)
 * @param p.frames     frameRefs(content) — molduras do conteúdo para a coerência contextual (opcional)
 * @param p.integrity  transcriptIntegrity(...) do reconhecimento (opcional; null = não verificada)
 * @param p.alternatives respostas alternativas aceitas (só referência, como o exemplo: nunca exigidas)
 */
export function analyseFreeAnswer({ question = '', model = '', alternatives = [], unit = 'q', transcript = '', analysis = null, vocab = { known: new Set(), domain: new Set() }, grammar = [], divergences = [], naturalness = [], frames = null, integrity = null }) {
  const text = String(transcript || '').trim();
  const tokens = wordTokens(text);
  const metrics = measure(analysis, tokens.length);
  const pronunciation = { evaluated: false, note: 'Não avaliada: o app não mede os sons (fonemas). As marcações na transcrição indicam divergências do reconhecimento, não erros de pronúncia.' };
  const base = { transcript: text, metrics, pronunciation, integrity: integrity || { checked: false, complete: null, issues: [] } };
  const inconclusive = (reason, message) => ({ ...base, status: 'inconclusive', reason, message, words: wordsAll(text, 'uncertain'), practice: [], checklist: [], tips: [] });

  if (analysis && insufficientAudio(analysis)) return inconclusive('audio', 'Quase não captei voz nesta gravação. Grave de novo, num lugar silencioso e mais perto do microfone.');
  if (!tokens.length) return inconclusive('empty', 'O reconhecimento não captou fala nesta gravação. Grave de novo, falando um pouco mais alto.');
  if (degenerateFree(tokens)) return inconclusive('degenerate', 'A transcrição saiu corrompida (repetições sem sentido). Nada foi avaliado: grave de novo.');
  if (tokens.length < 3) return inconclusive('short', 'Fala curta demais para avaliar a resposta. Responda com uma ou duas frases completas.');

  // ---------- A. reconhecimento: possíveis divergências do reconhecedor ----------
  const answerLemmas = new Set(contentLemmas(text));
  const alts = (alternatives || []).filter(Boolean);
  const expected = [...new Set([...contentLemmas(question), ...contentLemmas(model), ...alts.flatMap(contentLemmas)])].filter((l) => l.length >= 4);
  const missingExpected = expected.filter((l) => !answerLemmas.has(l));
  const exampleWord = new Map(); // lema → forma escrita no exemplo/pergunta/alternativa (para o áudio de referência)
  for (const w of [...wordTokens(model), ...wordTokens(question), ...alts.flatMap(wordTokens)]) if (!exampleWord.has(lemma(w))) exampleWord.set(lemma(w), w);
  // candidatas a hipótese contextual: palavras de conteúdo esperadas, na forma escrita do exemplo
  const candidates = missingExpected.map((l) => exampleWord.get(l) || l);
  const words = [];
  const practice = [];
  const seen = new Set();
  // trechos suspeitos (cada palavra recebe no máximo uma marca): molduras do conteúdo, alinhamento com frases
  // conhecidas (context.js) e combinações estranhas sem referência
  const flags = new Map();
  const mark = (ws, f) => { if (ws.some((k) => flags.has(k))) return; ws.forEach((k) => flags.set(k, f)); };
  const refs = frames ? [...[model, ...alts].filter(Boolean).map(prepRef), ...frames].filter(Boolean) : [];
  // o alinhamento com uma frase inteira (context.js) explica melhor o trecho (“this nation” ← “my destination”): vem primeiro
  for (const d of divergences || []) mark(d.src, { kind: 'context', ...d });
  // uma moldura de OUTRO conteúdo não derruba uma palavra que a própria pergunta/exemplo/alternativa usa
  // (“I'm driving for Uber” × “I'm training for a race”, pergunta sobre dirigir para a Uber): o contexto apoia o que foi ouvido
  const supported = (heard) => { const ls = contentLemmas(heard); return ls.length > 0 && ls.every((l) => expected.some((e) => sameLemma(l, e))); };
  for (const sp of refs.length ? findSlotSuspicions(text, refs) : []) if (!supported(sp.heard)) mark(sp.src, { kind: 'frame', ...sp });
  for (const o of findOddCombinations(text)) mark(o.src, { kind: 'odd', ...o });
  const allSegs = segment(text);
  const segs = allSegs.filter((x) => x.w !== undefined);
  // pedaços unidos por hífen que, juntos, não são palavra (“off-scene”): o reconhecedor pode ter partido uma palavra
  // esperada. Se o conjunto soa como uma palavra da pergunta/exemplo, os dois pedaços recebem a mesma hipótese.
  const joined = new Map(); // w → { ws, heard, ref }
  for (let k = 1; k + 1 < allSegs.length; k++) {
    const a = allSegs[k - 1], g = allSegs[k], b = allSegs[k + 1];
    if (a.w === undefined || b.w === undefined || g.text !== '-' || flags.has(a.w) || flags.has(b.w)) continue;
    const whole = a.norm + b.norm;
    if (/\d/.test(whole) || isKnownWord(whole, vocab.known) !== false) continue;
    const ref = contextualHypothesis(whole, candidates);
    if (ref) { const j = { ws: [a.w, b.w], heard: `${a.text}-${b.text}`, ref }; joined.set(a.w, j); joined.set(b.w, j); }
  }
  const hypotheses = []; // { heard, ref } — possíveis erros do reconhecedor com hipótese contextual
  const deferred = [];
  for (const seg of segs) {
    const t = seg.norm;
    const f = flags.get(seg.w);
    if (f) {
      const r = { w: seg.w, text: seg.text, state: 'needs_practice', flag: f.kind, ref: f.expected || null, reason: flagReason(f) };
      const key = 'flag:' + f.src.join(',');
      if (!seen.has(key)) {
        seen.add(key);
        practice.push({ w: f.src[0], ws: f.src, text: f.heard, heard: f.heard, ref: f.expected || null, refAu: f.ref ? f.ref.au || null : null, refText: f.ref ? f.ref.text : null, context: f.context || null, flag: f.kind, category: f.expected ? 'recognition' : 'inconclusive', strength: f.strength || 'possible', reason: r.reason });
      }
      words.push(r);
      continue;
    }
    const jn = joined.get(seg.w);
    if (jn) {
      const reason = recognitionReason(jn.heard, jn.ref);
      if (!seen.has('join:' + jn.ws.join(','))) {
        seen.add('join:' + jn.ws.join(',')); hypotheses.push({ heard: jn.heard, ref: jn.ref });
        practice.push({ w: jn.ws[0], ws: jn.ws, text: jn.heard, heard: jn.heard, ref: jn.ref, flag: 'nonword', category: 'recognition', reason });
      }
      words.push({ w: seg.w, text: seg.text, state: 'needs_practice', flag: 'nonword', ref: jn.ref, reason });
      continue;
    }
    if (!t || /\d/.test(t) || NUMBER_WORDS.includes(t)) { words.push({ w: seg.w, text: seg.text, state: 'good', reason: 'Número ou horário reconhecido.' }); continue; }
    if (seg.weak || STOP.has(t) || t.length < 3) { deferred.push(words.length); words.push({ w: seg.w, text: seg.text, state: 'uncertain', reason: '' }); continue; }
    const l = lemma(t);
    // grafia americana/britânica e números por extenso contam como a mesma palavra; composto de palavras do app também
    const inActivity = [...forms(t)].some((f) => vocab.known.has(f) || vocab.domain.has(lemma(f)) || expected.includes(lemma(f)))
      || appCompound(t, vocab.known) || !!categoryOf(t); // palavra de uma categoria do cotidiano (alimento, transporte…)
    if (seg.proper && !inActivity) {
      words.push({ w: seg.w, text: seg.text, state: 'uncertain', reason: 'Nome próprio ou termo fora do vocabulário da atividade: não avaliado. O app não tenta adivinhar nomes.' });
      continue;
    }
    const r = { w: seg.w, text: seg.text, state: inActivity ? 'good' : 'uncertain',
      reason: inActivity ? 'Compatível com o vocabulário e o tema da atividade, sem sinal de divergência. (Não é uma análise dos sons.)'
        : 'Palavra do inglês fora do vocabulário desta atividade: o app não tem evidência para confirmar se é o que você disse. Se estiver certa, tudo bem.' };
    if (!t.includes(' ')) {
      const known = isKnownWord(t, vocab.known) ?? null;
      const compound = known === false && splitsInTwo(t, vocab.known);
      if (known === false && !compound) {
        const ref = contextualHypothesis(t, candidates);
        if (ref) hypotheses.push({ heard: seg.text.replace(/[.,!?;:]+$/, ''), ref });
        Object.assign(r, { state: 'needs_practice', flag: 'nonword', ref, category: ref ? 'recognition' : 'inconclusive',
          reason: ref ? recognitionReason(seg.text.replace(/[.,!?;:]+$/, ''), ref)
            : `“${seg.text}” não parece uma palavra do inglês: provável erro do reconhecimento, mas o contexto não indica uma palavra provável. Ouça sua gravação; se a palavra estiver clara, está tudo certo.` });
      } else if (!inActivity) {
        // palavra fora do tema parecida com uma palavra esperada que não apareceu: possível troca do reconhecedor
        // critério estrito (melhor deixar de marcar do que marcar uma palavra válida): mesma inicial,
        // esqueleto de consoantes quase igual, no máximo 2 letras de diferença e tamanho parecido
        // prefixo comum ≥ 5 letras = variante de grafia/flexão (analyze/analyse, practice/practise), não troca
        const e = missingExpected.find((x) => x[0] === l[0] && x !== l && Math.abs(x.length - l.length) <= 2
          && levenshtein(skeleton(x), skeleton(l)) <= 1 && levenshtein(x, l) <= 2 && commonPrefix(x, l) < 5);
        if (e) {
          const ref = exampleWord.get(e) || e;
          Object.assign(r, { state: 'needs_practice', flag: 'confusion', ref, category: 'recognition', reason: `O app ouviu “${seg.text}”. Se você quis dizer “${ref}”, vale praticar essa palavra; se disse “${seg.text}”, está tudo certo.` });
        }
      }
    }
    if (r.state === 'needs_practice') {
      // palavra inexistente: uma marca por trecho ouvido (duas grafias com a mesma sugestão continuam com a sua marca)
      const key = (r.flag === 'nonword' ? 'nw:' + t : r.ref || t).toLowerCase();
      if (!seen.has(key)) { seen.add(key); practice.push({ w: r.w, text: seg.text.replace(/[.,!?;:]+$/, ''), heard: seg.text.replace(/[.,!?;:]+$/, ''), ref: r.ref || null, flag: r.flag, category: r.category, reason: r.reason }); }
    }
    words.push(r);
  }
  // palavras funcionais não têm evidência própria: encostadas num trecho marcado, ou cercadas só de palavras não
  // confirmadas (até 3 posições), ficam “não avaliadas”; nos demais casos acompanham a frase
  for (const k of deferred) {
    const near = [1, -1, 2, -2, 3, -3].map((d) => k + d).filter((j) => words[j] && !deferred.includes(j)).map((j) => words[j]);
    const touchesFlag = [words[k - 1], words[k + 1]].some((x) => x && x.state === 'needs_practice');
    const good = !touchesFlag && (!near.length || near.some((x) => x.state === 'good'));
    Object.assign(words[k], { state: good ? 'good' : 'uncertain', reason: good ? 'Palavra curta que acompanha um trecho compatível.' : 'Palavra curta perto de um trecho não confirmado: não avaliada sozinha.' });
  }

  // ---------- B. adequação à pergunta ----------
  const intent = questionIntent(question, unit);
  const narrative = unit === 'block' || unit === 'routine' || /tell me about|routine/i.test(question);
  const low = ` ${tokens.join(' ')} `;
  const strongHits = [...answerLemmas].filter((l) => expected.includes(l) || contentLemmas(question).includes(l));
  const domainHits = [...answerLemmas].filter((l) => vocab.domain.has(l) && !WEAK_TOPIC.has(l));
  const activities = new Set(tokens.map(lemma).map((l) => (ACTIVITY.has(l + 'e') ? l + 'e' : l)).filter((l) => ACTIVITY.has(l)));
  const satisfied = {
    time: RX.time.test(low), frequency: RX.frequency.test(low), reason: RX.reason.test(low), duration: RX.duration.test(low),
    place: RX.place.test(low) && domainHits.length > 0, meaning: RX.meaning.test(low), like: RX.like.test(low) || RX.yesno.test(low),
    // relato (rotina, bloco, “tell me about…”): duas atividades; “o que você faz em X”: uma basta
    yesno: RX.yesno.test(low), food: tokens.some((t) => FOOD.has(lemma(t)) || FOOD.has(t)), activities: activities.size >= (narrative ? 2 : 1),
    info: domainHits.length >= 1 && tokens.length >= 4,
  };
  const answersYesNo = (intent === 'yesno' || intent === 'like') && RX.yesno.test(low);
  const relevance = strongHits.length >= 2 || (strongHits.length >= 1 && domainHits.length >= 3) || domainHits.length >= 4 ? 'clear'
    : strongHits.length >= 1 || domainHits.length >= 2 || answersYesNo || (domainHits.length >= 1 && satisfied[intent]) ? 'some' : 'none';
  // “desenvolve” é sugestão; só bloqueia quando a pergunta pede um relato (rotina, bloco, “tell me about…”)
  const minWords = unit === 'routine' ? 40 : unit === 'block' ? 20 : intent === 'activities' ? 15 : 8;
  const enough = tokens.length >= minWords;
  const minToAnswer = intent === 'activities' ? (narrative ? Math.max(8, Math.round(minWords / 2)) : 5) : 3;

  const checklist = [
    { id: 'topic', label: 'Fala do tema da pergunta', ok: relevance !== 'none', required: true },
    { id: intent, label: INTENT_LABEL[intent], ok: !!satisfied[intent], required: true },
  ];
  if (intent === 'activities' && narrative) {
    checklist.push({ id: 'time', label: 'Usa horários ou momentos do dia', ok: satisfied.time, required: false });
    checklist.push({ id: 'sequence', label: 'Liga as ideias (then, after, before…)', ok: RX.sequence.test(low), required: false });
  }
  checklist.push({ id: 'length', label: 'Desenvolve a resposta', ok: enough, required: false });

  // a falta de uma informação só é “falta” se a transcrição está íntegra: com fala possivelmente perdida
  // (integridade) ou lacunas (“at in the morning”), o item obrigatório fica “não confirmado” (ok = null)
  const holes = findHoles(text);
  const lostSpeech = mayHaveLostSpeech(integrity) || holes.length > 0;
  if (lostSpeech) for (const c of checklist) if (c.required && c.id !== 'topic' && !c.ok) { c.ok = null; c.unconfirmed = true; }
  const requiredOk = checklist.filter((c) => c.required).every((c) => c.ok !== false);
  const unconfirmed = checklist.some((c) => c.unconfirmed);
  // sem relação aparente, mas com trecho que soa como palavra da pergunta/exemplo (“offsy” ~ “office”): pode ser
  // o reconhecimento, não uma resposta fora do tema → “não deu para confirmar”, nunca “fora do tema”
  const misheard = relevance === 'none' && hypotheses.length > 0;
  const status = misheard ? 'unclear' : relevance === 'none' ? 'off-topic' : requiredOk && tokens.length >= minToAnswer ? (unconfirmed ? 'unclear' : 'answers') : 'partial';
  const holeText = holes.length ? ` (por exemplo, depois de “${holes[0].after}”)` : '';
  const message = {
    answers: 'Sua resposta responde à pergunta.',
    partial: 'Sua resposta tem relação com a pergunta, mas pode ficar mais completa.',
    unclear: misheard
      ? `O app pode ter reconhecido errado parte da sua fala (${hypotheses.slice(0, 2).map((x) => `“${x.heard}” — talvez “${x.ref}”`).join('; ')}). Por isso não dá para confirmar se a resposta trata da pergunta: confira o trecho marcado ouvindo sua gravação.`
      : `Sua resposta tem relação com a pergunta, mas o app pode ter perdido parte da sua fala${holeText}. Não dá para afirmar que faltou algo: ouça sua gravação.`,
    'off-topic': 'Não encontrei relação clara com a pergunta. Pode ser erro do reconhecimento: ouça sua gravação. Se você falou de outro assunto, tente responder diretamente.',
  }[status];

  // coerência interna do relato: informações conflitantes (não decide qual está certa)
  const coherence = findContradictions(text).map((c) => c.kind === 'two-times'
    ? { kind: c.kind, msg: `Você mencionou dois horários para “${c.activity}” (${c.times.join(' e ')}) sem dizer quando vale cada um (ex.: “on weekends”). Confira na gravação: pode ter sido o reconhecimento.` }
    : { kind: c.kind, msg: `“${c.times[0]}” e “${c.period}” não combinam (p.m. é tarde/noite; a.m. é manhã). Confira o horário na gravação.` });

  const tips = [];
  for (const c of checklist) {
    if (c.ok || c.unconfirmed) continue;
    if (c.id === 'topic') continue;
    if (c.id === 'length') tips.push(unit === 'q' ? 'Desenvolva com mais uma ou duas frases (o que, quando, por quê).' : 'Acrescente mais detalhes: o que você faz, quando e por quê.');
    else if (c.id === 'sequence') tips.push('Ligue as ideias com “then”, “after that”, “before”.');
    else if (INTENT_TIP[c.id]) tips.push(INTENT_TIP[c.id]);
  }
  if (practice.length) tips.push(practice.length === 1 ? 'Confira o trecho marcado: ouça sua gravação e a referência.' : `Confira os ${practice.length} trechos marcados: ouça sua gravação e as referências.`);
  // concordância (I gets / she go): erro de inglês, não do reconhecimento — vai para a gramática, sem marcar palavra.
  // As regras do corretor vêm primeiro; a concordância só entra se nenhuma regra já cobriu o mesmo trecho (E_THIRD_S).
  const agreement = agreementIssues(text).filter((a) => !(grammar || []).some((g) => /^E_(THIRD_S|DOESNT_S|DONT_THIRD|AGREEMENT)/.test(g.id || '')));
  const grammarTips = [...(grammar || []).map((g) => g.msg), ...agreement.map((a) => a.msg)].filter(Boolean).slice(0, 2);
  // B. correção linguística (pela transcrição): gramática e naturalidade, separadas da adequação e do reconhecimento
  const language = { grammar: grammarTips, naturalness: (naturalness || []).slice(0, 2) };

  return { ...base, status, message, intent, relevance, checklist, tips: tips.slice(0, 4), grammarTips, language, words, practice, coherence, holes, hypotheses,
    evidence: { strong: strongHits, domain: domainHits.length, activities: activities.size, words: tokens.length, minWords } };
}

/** Hipótese do reconhecimento: o que foi ouvido + palavra provável pelo contexto, rotulada como sugestão. */
function recognitionReason(heard, ref) {
  return `A palavra destacada pode ter sido reconhecida incorretamente: o app ouviu “${heard}”, que não é uma palavra do inglês. Pelo contexto da pergunta, talvez você tenha dito “${ref}” (sugestão, não a transcrição). Confira se essa sugestão corresponde ao que você disse; se não, ignore esta marca.`;
}

/** Explicação de uma marca: o que foi ouvido, por que destoa, sugestão (rotulada) e as duas hipóteses. */
function flagReason(f) {
  if (f.kind === 'context') {
    return `No contexto “${f.context}”, o app ouviu “${f.heard}”; o esperado seria algo como “${f.expected}” (sugestão, não a transcrição). Pode ter sido o reconhecimento ou a pronúncia: ouça sua gravação e a referência. Se você disse “${f.heard}” mesmo, ignore esta marca.`;
  }
  if (f.kind === 'odd') {
    const why = f.clash === 'not-food' ? `“${f.heard}” junta um animal ou objeto a um prato` : `“${f.heard}” não ocupa o lugar de um alimento na lista`;
    return `${why}: combinação incomum. Pode ter sido o reconhecimento ou a pronúncia, ou você quis dizer isso mesmo. Ouça sua gravação; o app não tem uma sugestão segura.`;
  }
  const why = [];
  if (f.signals.includes('category')) why.push(f.clash === 'not-food' ? `“${f.heard}” não é um alimento, mas o trecho fala de comida` : `“${f.heard}” não ocupa o lugar de um nome neste trecho`);
  if (f.signals.includes('sound')) why.push(`soa parecido com “${f.expected}”`);
  const lead = f.strength === 'likely' ? 'Este trecho provavelmente não corresponde ao que você quis dizer' : 'Este trecho pode não corresponder ao que você quis dizer';
  return `${lead}: no trecho “${f.context}” o app ouviu “${f.heard}” — ${why.join(' e ')}. Sugestão (não é a transcrição): “${f.expected}”, como em “${f.ref.text}”. Pode ter sido o reconhecimento ou a pronúncia: ouça sua gravação e a referência. Se você disse “${f.heard}” mesmo, ignore esta marca.`;
}

function commonPrefix(a, b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; }
/** Composto escrito junto (“lunchbox”, “homework”): duas palavras conhecidas. */
function splitsInTwo(t, extra) {
  // cada parte: palavra do app ou palavra conhecida com 4+ letras (evita “you”+“ber” em “youber”)
  const ok = (x) => (extra && extra.has(x)) || (x.length >= 4 && isKnownWord(x, extra));
  for (let i = 3; i <= t.length - 3; i++) if (ok(t.slice(0, i)) && ok(t.slice(i))) return true;
  return false;
}

/** Composto escrito junto cujas duas partes são palavras do conteúdo do app (“lunchbox” = lunch + box). */
function appCompound(t, known) {
  for (let i = 3; i <= t.length - 3; i++) if (known.has(t.slice(0, i)) && known.has(t.slice(i))) return true;
  return false;
}

function wordsAll(text, state) {
  return segment(text).filter((s) => s.w !== undefined).map((s) => ({ w: s.w, text: s.text, state, reason: 'Não avaliada nesta tentativa.' }));
}

/** C. Métricas: só o que foi medido; o resto fica null (“indisponível”). */
export function measure(analysis, words) {
  if (!analysis) return { totalSec: null, speechSec: null, wpm: null, pauses: null, longPauses: null };
  const ok = !analysis.silent;
  let wpm = null;
  if (ok && analysis.speechSec >= 3 && words >= 5) {
    const v = Math.round((words / analysis.speechSec) * 60);
    if (v >= 40 && v <= 260) wpm = v; // fora disso a medida não é confiável (transcrição ou detecção de voz falharam)
  }
  return {
    totalSec: analysis.totalSec != null ? Math.round(analysis.totalSec * 10) / 10 : null,
    speechSec: ok ? Math.round(analysis.speechSec * 10) / 10 : null,
    wpm, pauses: ok ? analysis.pauses : null, longPauses: ok ? analysis.longPauses : null,
  };
}

export const STATUS_LABEL = { answers: 'Responde à pergunta', partial: 'Responde em parte', unclear: 'Não deu para confirmar tudo', 'off-topic': 'Pouca relação com a pergunta', inconclusive: 'Avaliação inconclusiva' };
