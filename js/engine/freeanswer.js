// Avaliação de respostas orais LIVRES (missões e perguntas da teacher) — funções puras, sem DOM.
//
// Uma resposta livre não tem texto-alvo: não é comparada palavra por palavra com o exemplo.
// A avaliação é separada em quatro componentes, cada um com critérios explícitos (docs/feedback-de-pronuncia.md):
//   A. Reconhecimento — a transcrição automática e possíveis divergências DO RECONHECEDOR
//      (palavra inexistente em inglês; palavra fora do tema parecida com uma palavra esperada).
//   B. Adequação      — relação com a pergunta, o elemento que a pergunta pede (horário, motivo, frequência…)
//      e quantidade de fala. Vocabulário diferente do exemplo nunca é penalizado.
//   C. Métricas       — duração, tempo de fala, velocidade estimada e pausas, só quando medidos.
//   D. Pronúncia      — NÃO avaliada: o app não mede fonemas.
// Não há nota numérica geral: cada componente diz o que foi (ou não) avaliado.
import { wordTokens, levenshtein } from './text.js';
import { segment } from './wordfeedback.js';
import { lemma, isKnownWord, lexiconReady } from './lexicon.js';

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

const contentLemmas = (text) => wordTokens(text).map(lemma).filter((l) => l.length > 1 && !STOP.has(l) && !/^\d/.test(l));
const skeleton = (w) => w.replace(/(?!^)[aeiouy]/g, '').replace(/(.)\1+/g, '$1');

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
 */
export function analyseFreeAnswer({ question = '', model = '', unit = 'q', transcript = '', analysis = null, vocab = { known: new Set(), domain: new Set() }, grammar = [] }) {
  const text = String(transcript || '').trim();
  const tokens = wordTokens(text);
  const metrics = measure(analysis, tokens.length);
  const pronunciation = { evaluated: false, note: 'Não avaliada: o app não mede os sons (fonemas). As marcações na transcrição indicam divergências do reconhecimento, não erros de pronúncia.' };
  const base = { transcript: text, metrics, pronunciation };
  const inconclusive = (reason, message) => ({ ...base, status: 'inconclusive', reason, message, words: wordsAll(text, 'uncertain'), practice: [], checklist: [], tips: [] });

  if (analysis && insufficientAudio(analysis)) return inconclusive('audio', 'Quase não captei voz nesta gravação. Grave de novo, num lugar silencioso e mais perto do microfone.');
  if (!tokens.length) return inconclusive('empty', 'O reconhecimento não captou fala nesta gravação. Grave de novo, falando um pouco mais alto.');
  if (degenerateFree(tokens)) return inconclusive('degenerate', 'A transcrição saiu corrompida (repetições sem sentido). Nada foi avaliado: grave de novo.');
  if (tokens.length < 3) return inconclusive('short', 'Fala curta demais para avaliar a resposta. Responda com uma ou duas frases completas.');

  // ---------- A. reconhecimento: possíveis divergências do reconhecedor ----------
  const answerLemmas = new Set(contentLemmas(text));
  const expected = [...new Set([...contentLemmas(question), ...contentLemmas(model)])].filter((l) => l.length >= 4);
  const missingExpected = expected.filter((l) => !answerLemmas.has(l));
  const exampleWord = new Map(); // lema → forma escrita no exemplo/pergunta (para o áudio de referência)
  for (const w of [...wordTokens(model), ...wordTokens(question)]) if (!exampleWord.has(lemma(w))) exampleWord.set(lemma(w), w);
  const words = [];
  const practice = [];
  const seen = new Set();
  for (const seg of segment(text)) {
    if (seg.w === undefined) continue;
    const t = seg.norm;
    const r = { w: seg.w, text: seg.text, state: 'good', reason: 'Reconhecida pelo app, sem divergência identificada. (Não é uma análise dos sons.)' };
    const skip = !t || t.length < 3 || /\d/.test(t) || seg.weak || seg.proper || t.includes(' ') || STOP.has(t);
    if (!skip) {
      const l = lemma(t);
      const known = isKnownWord(t, vocab.known) ?? null;
      const compound = known === false && splitsInTwo(t, vocab.known);
      if (known === false && !compound) {
        Object.assign(r, { state: 'needs_practice', flag: 'nonword', reason: `“${seg.text}” não parece uma palavra do inglês: provável erro do reconhecimento. Ouça sua gravação; se a palavra estiver clara, está tudo certo.` });
      } else if (!vocab.domain.has(l) && !expected.includes(l)) {
        // palavra fora do tema parecida com uma palavra esperada que não apareceu: possível troca do reconhecedor
        // critério estrito (melhor deixar de marcar do que marcar uma palavra válida): mesma inicial,
        // esqueleto de consoantes quase igual, no máximo 2 letras de diferença e tamanho parecido
        // prefixo comum ≥ 5 letras = variante de grafia/flexão (analyze/analyse, practice/practise), não troca
        const e = missingExpected.find((x) => x[0] === l[0] && x !== l && Math.abs(x.length - l.length) <= 2
          && levenshtein(skeleton(x), skeleton(l)) <= 1 && levenshtein(x, l) <= 2 && commonPrefix(x, l) < 5);
        if (e) {
          const ref = exampleWord.get(e) || e;
          Object.assign(r, { state: 'needs_practice', flag: 'confusion', ref, reason: `O app ouviu “${seg.text}”. Se você quis dizer “${ref}”, vale praticar essa palavra; se disse “${seg.text}”, está tudo certo.` });
        }
      }
    }
    if (r.state === 'needs_practice') {
      const key = (r.ref || t).toLowerCase();
      if (!seen.has(key)) { seen.add(key); practice.push({ w: r.w, text: seg.text.replace(/[.,!?;:]+$/, ''), heard: seg.text.replace(/[.,!?;:]+$/, ''), ref: r.ref || null, flag: r.flag, reason: r.reason }); }
    }
    words.push(r);
  }

  // ---------- B. adequação à pergunta ----------
  const intent = questionIntent(question, unit);
  const narrative = unit === 'block' || unit === 'routine' || /tell me about|routine/i.test(question);
  const low = ` ${tokens.join(' ')} `;
  const strongHits = [...answerLemmas].filter((l) => expected.includes(l) || contentLemmas(question).includes(l));
  const domainHits = [...answerLemmas].filter((l) => vocab.domain.has(l) && !WEAK_TOPIC.has(l));
  const activities = new Set(tokens.map(lemma).filter((l) => ACTIVITY.has(l)));
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

  const requiredOk = checklist.filter((c) => c.required).every((c) => c.ok);
  const status = relevance === 'none' ? 'off-topic' : requiredOk && tokens.length >= minToAnswer ? 'answers' : 'partial';
  const message = {
    answers: 'Sua resposta responde à pergunta.',
    partial: 'Sua resposta tem relação com a pergunta, mas pode ficar mais completa.',
    'off-topic': 'Não encontrei relação clara com a pergunta. Pode ser erro do reconhecimento: ouça sua gravação. Se você falou de outro assunto, tente responder diretamente.',
  }[status];

  const tips = [];
  for (const c of checklist) {
    if (c.ok) continue;
    if (c.id === 'topic') continue;
    if (c.id === 'length') tips.push(unit === 'q' ? 'Desenvolva com mais uma ou duas frases (o que, quando, por quê).' : 'Acrescente mais detalhes: o que você faz, quando e por quê.');
    else if (c.id === 'sequence') tips.push('Ligue as ideias com “then”, “after that”, “before”.');
    else if (INTENT_TIP[c.id]) tips.push(INTENT_TIP[c.id]);
  }
  if (practice.length) tips.push(practice.length === 1 ? 'Confira a palavra marcada: ouça sua gravação e a referência.' : `Confira as ${practice.length} palavras marcadas: ouça sua gravação e as referências.`);
  const grammarTips = (grammar || []).map((g) => g.msg).filter(Boolean).slice(0, 2);

  return { ...base, status, message, intent, relevance, checklist, tips: tips.slice(0, 4), grammarTips, words, practice,
    evidence: { strong: strongHits, domain: domainHits.length, activities: activities.size, words: tokens.length, minWords } };
}

function commonPrefix(a, b) { let i = 0; while (i < a.length && a[i] === b[i]) i++; return i; }
/** Composto escrito junto (“lunchbox”, “homework”): duas palavras conhecidas. */
function splitsInTwo(t, extra) {
  // cada parte: palavra do app ou palavra conhecida com 4+ letras (evita “you”+“ber” em “youber”)
  const ok = (x) => (extra && extra.has(x)) || (x.length >= 4 && isKnownWord(x, extra));
  for (let i = 3; i <= t.length - 3; i++) if (ok(t.slice(0, i)) && ok(t.slice(i))) return true;
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

export const STATUS_LABEL = { answers: 'Responde à pergunta', partial: 'Responde em parte', 'off-topic': 'Pouca relação com a pergunta', inconclusive: 'Avaliação inconclusiva' };
