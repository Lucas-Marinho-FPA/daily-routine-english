// Avaliadores das fases do diálogo — adaptadores LOCAIS determinísticos e o contrato da avaliação ONLINE.
// Nenhum deles conhece fornecedor de IA. Regras (docs/produto/mvp-dialogo/05):
//  • escrita: aceita contrações, grafia BrE/AmE, números e variantes curadas; separa omissão, inserção, troca,
//    ortografia e ordem; nota = correspondência textual (nunca “semântica”);
//  • fala: só correspondência lexical da transcrição (ASR) — NÃO é avaliação fonética; transcrição pouco confiável
//    → inconclusive (nunca reprovação);
//  • tradução: localmente só aprova quando a resposta coincide com a referência (normalização segura); o resto vai
//    para a avaliação semântica online — sem nota local inventada;
//  • resultado remoto é dado não confiável: validado por esquema antes de afetar a progressão.
import { lcsAlign, levenshtein } from './text.js';
import { evaluateWords } from './wordfeedback.js';
import { THRESHOLD, RUBRICS, EVALUATORS, meetsThreshold } from './dialogue.js';

const r100 = (x) => Math.max(0, Math.min(100, Math.round(x * 100)));

// ---------------------------------------------------------------------------------------------------------
// Fase 2 — escrita por escuta
// ---------------------------------------------------------------------------------------------------------

/** Tokens quase iguais (erro de digitação): 1 letra em palavras de 4–7 letras, até 2 em palavras maiores. */
export function nearToken(a, b) {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 4 || /\d/.test(a + b)) return false;
  return levenshtein(a, b) <= (Math.max(a.length, b.length) >= 8 ? 2 : 1);
}

/**
 * Correspondência entre a resposta escrita e a frase-alvo.
 * score = (acertos exatos + 0,5 × quase iguais) / max(palavras do alvo, palavras da resposta) — omissões e inserções
 * pesam igual; a ordem conta (alinhamento por subsequência comum). Variantes aceitas pelo verificador (contrações,
 * BrE/AmE, números, sinônimos curados, variantes da fala) valem 100.
 * @param checker createChecker(...) do app
 * @param variants variantes curadas da fala (acceptedVariants), se houver
 */
export function scoreWriting(checker, answer, target, variants = []) {
  const raw = String(answer || '').trim();
  const base = { evaluationMode: 'local_deterministic', rubricVersion: RUBRICS.dictation, evaluatorVersion: EVALUATORS.local_deterministic };
  if (!raw) return { ...base, status: 'inconclusive', score: null, feedback: { summary: 'Resposta vazia: escreva a frase que você ouviu.' } };
  const ck = checker.check(raw, [target, ...variants]);
  const A = checker.prepare(raw).full;
  const T = checker.prepare(target).full;
  const exact = lcsAlign(T, A, (x, y) => x === y);
  // segunda passagem: palavras restantes quase iguais (ortografia), na mesma ordem
  const usedT = new Set(exact.map(([i]) => i)), usedA = new Set(exact.map(([, j]) => j));
  const restT = T.map((t, i) => [t, i]).filter(([, i]) => !usedT.has(i));
  const restA = A.map((t, j) => [t, j]).filter(([, j]) => !usedA.has(j));
  const near = lcsAlign(restT.map(([t]) => t), restA.map(([t]) => t), nearToken).map(([i, j]) => [restT[i][1], restA[j][1]]);
  near.forEach(([i, j]) => { usedT.add(i); usedA.add(j); });
  let score = r100((exact.length + 0.5 * near.length) / Math.max(T.length, A.length, 1));
  const variantAccepted = ck.accepted && ck.cls !== 'spelling';
  if (variantAccepted) score = 100;
  // ordem: palavras presentes em posições trocadas (a LCS não as casou, mas existem dos dois lados)
  const leftT = T.filter((_, i) => !usedT.has(i)), leftA = A.filter((_, j) => !usedA.has(j));
  const reordered = leftT.filter((t) => leftA.includes(t));
  const omissions = leftT.filter((t) => !reordered.includes(t));
  const insertions = leftA.filter((t) => !reordered.includes(t));
  const spelling = near.map(([i, j]) => `${A[j]} → ${T[i]}`);
  const kind = variantAccepted ? (ck.cls === 'correct' ? 'exact' : 'variant') : ck.cls;
  return {
    ...base,
    status: meetsThreshold(score) ? 'passed' : 'needs_practice',
    score,
    feedback: {
      kind, // exact | variant | spelling | grammar | meaning | inconclusive (classe do verificador)
      summary: variantAccepted ? (ck.cls === 'correct' ? 'Igual à frase.' : 'Variante aceita.') : `Correspondência de ${score}% com a frase ouvida.`,
      notes: ck.notes || [],
      omissions, insertions, spelling, reordered,
      diff: ck.diff || null,
    },
    evidence: { method: 'alinhamento de palavras normalizadas (contrações, BrE/AmE, números)', targetWords: T.length, answerWords: A.length, exact: exact.length, near: near.length },
  };
}

// ---------------------------------------------------------------------------------------------------------
// Fases 1 e 5 — fala (correspondência da transcrição local)
// ---------------------------------------------------------------------------------------------------------

/**
 * @param target texto-alvo (item falado ou fala do diálogo)
 * @param asr    { text, confidence } da transcrição local, ou null (reconhecimento indisponível)
 * @param opts   { insufficient (gravação sem voz), tailUnreliable (transcrição possivelmente cortada), reason (motivo de asr ausente) }
 * → status passed | needs_practice | inconclusive, score (só quando confiável), dimensões separadas.
 */
export function evaluateSpeech(target, asr, opts = {}) {
  const base = { evaluationMode: 'local_asr', rubricVersion: RUBRICS.reading, evaluatorVersion: EVALUATORS.local_asr };
  const inconclusive = (why, extra = {}) => ({ ...base, status: 'inconclusive', score: null,
    feedback: { summary: why, transcriptionReliability: 'insufficient', ...extra }, evidence: { method: 'transcrição local', heard: asr ? asr.text : null } });
  if (!asr) return inconclusive(opts.reason || 'Reconhecimento de fala indisponível: a tentativa não aprova nem reprova.');
  const ev = evaluateWords(target, asr, { insufficient: !!opts.insufficient, tailUnreliable: !!opts.tailUnreliable });
  if (!ev.evaluated) return inconclusive(ev.note || 'Transcrição não confiável: grave de novo.');
  const words = ev.words;
  const judged = words.filter((w) => w.state === 'good' || w.state === 'needs_practice');
  // palavras que o método consegue julgar (exclui átonas curtas e nomes próprios, que o reconhecedor omite/escreve diferente)
  const judgeable = words.filter((w) => !/átona|Nome próprio/.test(w.reason || '') || w.state === 'good');
  if (!judged.length) return inconclusive('Nenhuma palavra avaliável com segurança nesta gravação (palavras átonas ou nomes próprios). Tente outra vez.', { words });
  const cover = judged.length / Math.max(judgeable.length, 1);
  if (cover < 0.6) return inconclusive('A transcrição cobriu pouco do texto (pode ter sido cortada): grave de novo.', { words });
  const good = judged.filter((w) => w.state === 'good').length;
  const score = r100(good / judged.length);
  return {
    ...base,
    status: meetsThreshold(score) ? 'passed' : 'needs_practice',
    score,
    feedback: {
      summary: `Correspondência da fala com o texto: ${score}% (${good} de ${judged.length} palavras avaliadas reconhecidas). Isto mede o que o reconhecedor entendeu, não a pronúncia de cada som.`,
      lexicalCorrespondence: score,
      completeness: r100(cover),
      transcriptionReliability: opts.tailUnreliable ? 'partial' : 'ok',
      rhythmEvidence: null, // não medido nesta fase
      phoneticAssessment: null, // o app não tem avaliação fonética validada
      words,
      toPractise: words.filter((w) => w.state === 'needs_practice').map((w) => w.text),
    },
    evidence: { method: 'transcrição local (Moonshine) + alinhamento de palavras', heard: asr.text, engine: asr.engine || null },
  };
}

/** Até quantas palavras uma fala da fase 5 é transcrita só no trecho com voz (falas longas vão inteiras: o recorte
 * reduz o limite de texto do reconhecedor, 6 tokens por segundo de áudio, e poderia cortar frases rápidas).
 * Na fase 1 todo item é recortado (mesmo recorte da prática de palavras do Speaking Lab). */
export const SHORT_LINE_WORDS = 4;
export const trimForLine = (text) => String(text || '').trim().split(/\s+/).filter(Boolean).length <= SHORT_LINE_WORDS;

/** Sílabas aproximadas (grupos de vogais; “e” final mudo descontado) — só para estimar o tempo de fala. */
export function syllables(text) {
  return String(text || '').toLowerCase().split(/[^a-z']+/).filter(Boolean).reduce((n, w) => {
    const v = (w.replace(/'/g, '').replace(/(?<=[^aeiouy].*[aeiouy][^aeiouy]*)e$/, '').match(/[aeiouy]+/g) || []).length;
    return n + Math.max(1, v);
  }, 0);
}

/**
 * Padrão de transcrição INTERROMPIDA: o que foi ouvido casa com o começo do texto e nada foi ouvido no lugar das
 * palavras que faltam (não houve troca de palavra — só o fim ficou sem texto). Não decide sozinho: o chamador só trata
 * como corte do reconhecedor se houver evidência (segunda passada ou tempo de voz — ver tailCutByDuration).
 * @param {object} result  saída de evaluateSpeech
 * @returns {{ prefixOnly: boolean, heard: string[], missing: string[] }}
 */
export function tailMiss(result) {
  const words = (result && result.feedback && result.feedback.words) || [];
  const good = words.map((w, i) => (w.state === 'good' ? i : -1)).filter((i) => i >= 0);
  const bad = words.map((w, i) => (w.state === 'needs_practice' ? i : -1)).filter((i) => i >= 0);
  const lastGood = good.length ? good[good.length - 1] : -1;
  const prefixOnly = result && result.status === 'needs_practice' && good.length > 0 && bad.length > 0
    && bad.every((i) => i > lastGood && !words[i].heard);
  return { prefixOnly: !!prefixOnly, heard: good.map((i) => words[i].text), missing: bad.map((i) => words[i].text) };
}

/** Segundos de voz que as palavras ouvidas explicam, com folga para fala lenta: 0,3 s de VOZ por sílaba (só os trechos
 * com voz contam; ≈ 2–2,5 sílabas por segundo de fala) + 0,3 s. Calibrado no ensaio de 2026-11-11 (tests/e2e/voice.mjs). */
export const heardSpeechBudget = (heardWords) => syllables(heardWords.join(' ')) * 0.3 + 0.3;

/** Evidência de voz depois do que foi reconhecido: tempo de voz da gravação maior do que as palavras ouvidas precisam. */
export const tailCutByDuration = (miss, voicedSec) => !!miss.prefixOnly && typeof voicedSec === 'number' && voicedSec > heardSpeechBudget(miss.heard);

/** Tentativa em que o reconhecimento parou antes do fim da fala: inconclusiva (não aprova nem reprova). */
export function tailCutInconclusive(result, miss) {
  return {
    ...result, status: 'inconclusive', score: null,
    feedback: { ...result.feedback, transcriptionReliability: 'partial',
      summary: `O reconhecimento parou antes do fim da sua fala (ouviu só “${miss.heard.join(' ')}”, mas a gravação continua com voz). Isso não conta como erro seu: grave de novo.`,
      toPractise: [] },
  };
}

// ---------------------------------------------------------------------------------------------------------
// Fase 3 — tradução (local só no caso seguro; semântica é online)
// ---------------------------------------------------------------------------------------------------------

export const foldPt = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9]+/g, ' ').trim();
const EN_ONLY = new Set(['the', 'and', 'you', 'are', 'is', 'what', 'do', 'does', 'have', 'has', 'with', 'this', 'that', 'my', 'your', 'i\'m', 'it\'s', 'of', 'to', 'at', 'in', 'on', 'for', 'we', 'they', 'he', 'she', 'can', 'could', 'would', 'will', 'please', 'thank', 'yes', 'not']);

/**
 * Avaliação local da tradução. Só decide nos casos que não exigem julgamento de sentido:
 *  • igual à referência (sem acentos, pontuação e maiúsculas) → aprovada 100;
 *  • ainda em inglês (cópia do original ou maioria de palavras inglesas) → precisa de prática, sem nota;
 * Fora disso → null (vai para a avaliação semântica online; sem conexão fica pendente).
 */
export function localTranslation(answer, line) {
  const base = { evaluationMode: 'local_deterministic', rubricVersion: RUBRICS.translation, evaluatorVersion: EVALUATORS.local_deterministic };
  const t = foldPt(answer);
  if (!t) return null;
  if (t === foldPt(line.pt) || (line.acceptedPt || []).some((v) => foldPt(v) === t)) {
    return { ...base, status: 'passed', score: 100, feedback: { summary: 'Igual à tradução de referência.', meaningPreserved: true } };
  }
  const w = t.split(' ');
  const enShare = w.filter((x) => EN_ONLY.has(x)).length / w.length;
  if (t === foldPt(line.en) || (w.length >= 3 && enShare >= 0.4)) {
    return { ...base, status: 'needs_practice', score: null, feedback: { summary: 'A resposta parece ainda estar em inglês: escreva a tradução em português.', meaningPreserved: false } };
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------------
// Contrato da avaliação semântica online (provider-neutral) — validação do pedido e da resposta
// ---------------------------------------------------------------------------------------------------------

export const TRANSLATION_REQUEST_KIND = 'dre/translation-evaluation';

/** Pedido mínimo (sem nome/perfil do aluno). */
export function translationRequest({ attemptId, act, line, answer }) {
  return {
    kind: TRANSLATION_REQUEST_KIND, v: 1, attemptId, rubricVersion: RUBRICS.translation, threshold: THRESHOLD,
    source: { lang: 'en-GB', text: line.en, speaker: line.speaker, context: act.context || null, activityTitle: act.title,
      dialogue: act.lines.map((l) => ({ speaker: l.speaker, text: l.en })) },
    reference: { lang: 'pt-BR', text: line.pt, status: 'referência autoral, não validada pelo professor', acceptedVariants: line.acceptedPt || [] },
    response: { lang: 'pt-BR', text: String(answer).slice(0, 1000) },
  };
}

const isStrList = (x, max = 8) => Array.isArray(x) && x.length <= max && x.every((s) => typeof s === 'string' && s.length <= 300);

/**
 * Valida a saída estruturada do avaliador (backend). Qualquer desvio → inconclusive (não aprova nem reprova).
 * Esperado: { status: 'evaluated'|'inconclusive'|'pending', score?, meaningPreserved, preservedElements, omissions,
 *             distortions, naturalnessNotes?, suggestedTranslation, explanationPtBr, rubricVersion, evaluatorVersion }
 */
export function validateTranslationResult(json, { attemptId } = {}) {
  const bad = (why) => ({ status: 'inconclusive', score: null, evaluationMode: 'remote_ai', rubricVersion: RUBRICS.translation, evaluatorVersion: null,
    feedback: { summary: `Avaliação online inválida (${why}): a tentativa não aprova nem reprova. Envie de novo mais tarde.` }, evidence: { invalid: why } });
  if (!json || typeof json !== 'object' || Array.isArray(json)) return bad('formato');
  if (attemptId && json.attemptId !== undefined && json.attemptId !== attemptId) return bad('tentativa diferente');
  if (json.rubricVersion !== RUBRICS.translation) return bad('rubrica');
  if (typeof json.evaluatorVersion !== 'string' || !json.evaluatorVersion || json.evaluatorVersion.length > 80) return bad('versão do avaliador');
  if (json.status === 'pending') return { status: 'pending' };
  const common = { evaluationMode: 'remote_ai', rubricVersion: json.rubricVersion, evaluatorVersion: json.evaluatorVersion };
  const text = (s, max = 1200) => (typeof s === 'string' && s.length <= max ? s : null);
  if (json.status === 'inconclusive') {
    return { ...common, status: 'inconclusive', score: null, feedback: { summary: text(json.explanationPtBr) || 'O avaliador não conseguiu julgar esta resposta.' } };
  }
  if (json.status !== 'evaluated') return bad('status');
  if (typeof json.score !== 'number' || !Number.isInteger(json.score) || json.score < 0 || json.score > 100) return bad('nota');
  if (typeof json.meaningPreserved !== 'boolean') return bad('meaningPreserved');
  if (!isStrList(json.preservedElements) || !isStrList(json.omissions) || !isStrList(json.distortions)) return bad('listas');
  if (json.naturalnessNotes !== undefined && !isStrList(json.naturalnessNotes)) return bad('naturalidade');
  const suggested = text(json.suggestedTranslation, 600), explanation = text(json.explanationPtBr);
  if (suggested === null || explanation === null) return bad('textos');
  // coerência: sentido não preservado ou omissão/distorção essencial não pode aprovar
  const consistent = !(meetsThreshold(json.score) && (!json.meaningPreserved || json.distortions.length));
  if (!consistent) return bad('nota incoerente com o sentido');
  return {
    ...common,
    status: meetsThreshold(json.score) ? 'passed' : 'needs_practice',
    score: json.score,
    feedback: {
      summary: explanation, meaningPreserved: json.meaningPreserved, preservedElements: json.preservedElements, omissions: json.omissions,
      distortions: json.distortions, naturalnessNotes: json.naturalnessNotes || [], suggestedTranslation: suggested,
    },
  };
}
