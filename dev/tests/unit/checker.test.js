// Suíte do corretor (critério E4-03: ≥150 casos).
// Cada caso: [resposta, alvos (modelo + variantes), classe esperada | 'OK' (qualquer aceita) | 'NO' (qualquer não aceita)]
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createChecker } from '../../app/js/engine/checker.js';

const content = JSON.parse(readFileSync(new URL('../../content/build/content.json', import.meta.url)));
const checker = createChecker(content.language);

const S1 = 'I wake up at 5:00 a.m., take a shower and brush my teeth.';
const S_LUNCH = 'I heat up my lunch in the microwave.';
const S_HOME = 'I get home between 8:30 and 10:00 p.m., depending on traffic.';
const S_WIFE = 'My wife goes to bed early.';
const S_DOESNT = "My wife doesn't drive for Uber.";
const S_LAPTOP = 'While my laptop starts up, I put my lunch box in the fridge.';
const S_ANALYSE = 'I analyse profitability, efficiency and business performance.';
const S_PRACTISE = 'I practise speaking and work on my pronunciation.';
const S_LISTEN = 'I listen to music in English during the drive.';
const S_SPEND = 'We spend some time talking in the living room.';
const S_STRAIGHT = 'I drive straight home and listen to an English audiobook.';
const S_DISCUSS = 'I spend hours presenting financial results and discussing profitability.';
const S_CLASS = 'I have online classes three times a week, at eleven p.m.';
const S_SHARP = "I start at nine o'clock sharp.";
const S_KIDS = 'I help the children with their bedtime routine.';
const S_SWITCH = 'At 6:00 p.m., I switch off my laptop.';
const S_ERRAND = 'During my afternoon break, I run a quick errand nearby.';
const S_DECIDE = 'I decide not to accept any Uber rides on my way home.';
const S_Q = 'Do you work from home?';
const S_Q3 = 'Does your wife study English?';
const S_NEG = "I don't work from home every day.";
const S_SHOWER = 'After that, I take another shower at the gym and get changed.';

const CASES = [
  // ---- corretos: maiúsculas, pontuação, espaços ----
  ['I wake up at 5:00 a.m., take a shower and brush my teeth.', [S1], 'correct'],
  ['i wake up at 5:00 am take a shower and brush my teeth', [S1], 'correct'],
  ['I WAKE UP AT 5:00 A.M., TAKE A SHOWER AND BRUSH MY TEETH', [S1], 'correct'],
  ['  I wake up   at 5:00 a.m.,   take a shower and brush my teeth  ', [S1], 'correct'],
  ['I wake up at 5:00 a.m. take a shower, and brush my teeth!', [S1], 'correct'],
  ['heat up', ['heat up'], 'correct'],
  ['Heat up.', ['heat up'], 'correct'],
  ['take a shower', ['take a shower'], 'correct'],
  [S_LUNCH, [S_LUNCH], 'correct'],
  [S_WIFE.toLowerCase(), [S_WIFE], 'correct'],
  // ---- horas em várias formas ----
  ['I wake up at 5 a.m., take a shower and brush my teeth.', [S1], 'correct'],
  ['I wake up at 5am, take a shower and brush my teeth.', [S1], 'correct'],
  ['I wake up at 5.00 am, take a shower and brush my teeth.', [S1], 'correct'],
  ['I wake up at five a.m., take a shower and brush my teeth.', [S1], 'correct'],
  ['I wake up at five in the morning, take a shower and brush my teeth.', [S1], 'correct'],
  ["I wake up at five o'clock, take a shower and brush my teeth.", [S1], 'correct'],
  ['I wake up at 5h, take a shower and brush my teeth.', [S1], 'correct'],
  ['I wake up at 5:00, take a shower and brush my teeth.', [S1], 'correct'],
  ['I get home between half past eight and 10 p.m., depending on traffic.', [S_HOME], 'correct'],
  ['I get home between 8.30 and ten pm, depending on traffic.', [S_HOME], 'correct'],
  ['I get home between 20:30 and 22:00, depending on traffic.', [S_HOME], 'correct'],
  ['I get home between 8:30 and 10:00, depending on traffic.', [S_HOME], 'correct'],
  ['I have online classes 3 times a week, at 11 p.m.', [S_CLASS], 'correct'],
  ['I have online classes three times a week, at 11pm.', [S_CLASS], 'correct'],
  ['I have online classes three times a week at eleven at night.', [S_CLASS], 'correct'],
  ['I start at 9 sharp.', [S_SHARP], 'correct'],
  ['I start at 9:00 sharp.', [S_SHARP], 'correct'],
  ['At 6 pm, I switch off my laptop.', [S_SWITCH], 'correct'],
  ['At 18:00, I switch off my laptop.', [S_SWITCH], 'correct'],
  ['At six in the evening, I switch off my laptop.', [S_SWITCH], 'correct'],
  // ---- horário errado não pode passar ----
  ['I wake up at 6 a.m., take a shower and brush my teeth.', [S1], 'NO'],
  ['I wake up at 5 p.m., take a shower and brush my teeth.', [S1], 'NO'],
  ['At 7 pm, I switch off my laptop.', [S_SWITCH], 'NO'],
  ['I have online classes twice a week, at eleven p.m.', [S_CLASS], 'NO'],
  // ---- contrações ----
  ["My wife does not drive for Uber.", [S_DOESNT], 'correct'],
  ["My wife doesn’t drive for Uber.", [S_DOESNT], 'correct'],
  ['I do not work from home every day.', [S_NEG], 'correct'],
  ["I dont work from home every day.", [S_NEG], 'NO'],
  ["I'm a Financial Planning Analyst.", ['I am a Financial Planning Analyst.'], 'correct'],
  ["It's mentally demanding.", ['It is mentally demanding.'], 'correct'],
  ["It is a rare and special evening.", ["It's a rare and special evening."], 'correct'],
  // ---- grafia americana ----
  ['I analyze profitability, efficiency and business performance.', [S_ANALYSE], 'variant_ame'],
  ['I practice speaking and work on my pronunciation.', [S_PRACTISE], 'variant_ame'],
  ['analyze', ['analyse'], 'variant_ame'],
  ['finalize', ['finalise'], 'variant_ame'],
  ['I finalize executive presentations.', ['I finalise executive presentations.'], 'variant_ame'],
  ['neighborhood', ['neighbourhood'], 'variant_ame'],
  ['I do a few trips around my neighborhood.', ['I do a few trips around my neighbourhood.'], 'variant_ame'],
  ['I need more practice.', ['I need more practice.'], 'correct'],
  // ---- variantes aprovadas (item / sinônimos) ----
  ['boot up', ['start up', 'boot up'], 'accepted_variant'],
  ['turn off', ['switch off', 'turn off', 'shut down'], 'accepted_variant'],
  ['shut down', ['switch off', 'turn off', 'shut down'], 'accepted_variant'],
  ['At 6:00 p.m., I turn off my laptop.', [S_SWITCH], 'accepted_variant'],
  ['I help the kids with their bedtime routine.', [S_KIDS], 'accepted_variant'],
  ['have a shower', ['take a shower', 'have a shower'], 'accepted_variant'],
  ['After that, I have another shower at the gym and get changed.', [S_SHOWER], 'NO'],
  ['Afterwards, I take another shower at the gym and get changed.', [S_SHOWER], 'accepted_variant'],
  ['While my laptop boots up, I put my lunchbox in the fridge.', [S_LAPTOP], 'accepted_variant'],
  ['sometimes', ['on some days', 'sometimes'], 'accepted_variant'],
  ['go to a meeting', ['attend a meeting', 'go to a meeting'], 'accepted_variant'],
  ['play chess', ['play a game of chess', 'play chess'], 'accepted_variant'],
  ['wash up', ['wash the dishes', 'wash up', 'do the washing-up'], 'accepted_variant'],
  ['canteen', ['cafeteria'], 'accepted_variant'],
  ['I go to the canteen at noon.', ['I go to the cafeteria at noon.'], 'accepted_variant'],
  ['executive deck', ['executive presentation', 'executive deck'], 'accepted_variant'],
  ['concentrate on', ['focus on', 'concentrate on'], 'accepted_variant'],
  ['review', ['go over', 'review'], 'accepted_variant'],
  ['handle', ['deal with', 'handle'], 'accepted_variant'],
  ['I accept trips along the way.', ['I accept rides along the way.'], 'accepted_variant'],
  ['have a quick snack', ['grab a quick snack', 'have a quick snack'], 'accepted_variant'],
  ['go home', ['head home', 'go home', 'drive home'], 'accepted_variant'],
  ['I usually wake up at five in the morning, because my schedule is very demanding.',
    ['I usually wake up at five in the morning, although my schedule is very demanding.', 'I usually wake up at five in the morning, because my schedule is very demanding.'], 'accepted_variant'],
  // ---- troca de determinante aceita ----
  ['I heat up the lunch in the microwave.', [S_LUNCH], 'accepted_variant'],
  ['heat up the lunch', ['heat up my lunch'], 'accepted_variant'],
  ['I put my containers away.', ['I put the containers away.'], 'accepted_variant'],
  // ---- artigo faltando ----
  ['I heat up my lunch in microwave.', [S_LUNCH], 'grammar'],
  ['take shower', ['take a shower'], 'grammar'],
  ['I have online classes three times week, at eleven p.m.', [S_CLASS], 'grammar'],
  // ---- erros de digitação ----
  ['I wake up at 5:00 a.m., take a shower and brush my teeht.', [S1], 'spelling'],
  ['profitabilty', ['profitability'], 'spelling'],
  ['efficency', ['efficiency'], 'spelling'],
  ['I heat up my lunch in the microwve.', [S_LUNCH], 'spelling'],
  ['presentaton notes', ['presentation notes'], 'spelling'],
  ['chesboard', ['chessboard'], 'spelling'],
  ['audiobok', ['audiobook'], 'spelling'],
  ['wekly report', ['weekly report'], 'spelling'],
  ['I listen to musik in English during the drive.', [S_LISTEN], 'spelling'],
  ['bowl of fruit and oat', ['bowl of fruit and oats'], 'OK'],
  // ---- regras gramaticais do Word ----
  ['I get to home between 8:30 and 10:00 p.m., depending on traffic.', [S_HOME], 'grammar'],
  ['I drive straight to home and listen to an English audiobook.', [S_STRAIGHT], 'grammar'],
  ['get to home', ['get home'], 'grammar'],
  ['go to home', ['go home'], 'grammar'],
  ['I listen music in English during the drive.', [S_LISTEN], 'grammar'],
  ['listen music', ['listen to music'], 'grammar'],
  ['I listen podcasts while I drive.', ['I listen to podcasts while I drive.'], 'grammar'],
  ['I spend hours presenting financial results and discussing about profitability.', [S_DISCUSS], 'grammar'],
  ['discuss about profitability', ['discuss profitability'], 'grammar'],
  ['chicken bread', ['chicken sandwich'], 'grammar'],
  ['I switch on the Uber app.', ['I open the Uber app.'], 'grammar'],
  ['We spend some time talk in the living room.', [S_SPEND], 'grammar'],
  ['We spend some time to talk in the living room.', [S_SPEND], 'grammar'],
  ['I decide to not accept any Uber rides on my way home.', [S_DECIDE], 'grammar'],
  ["My wife doesn't drives for Uber.", [S_DOESNT], 'grammar'],
  ['My wife does not goes to bed early.', ["My wife doesn't go to bed early."], 'grammar'],
  ['Do your wife study English?', [S_Q3], 'grammar'],
  ['My wife go to bed early.', [S_WIFE], 'grammar'],
  ['While my laptop start up, I put my lunch box in the fridge.', [S_LAPTOP], 'grammar'],
  ["My wife don't drive for Uber.", [S_DOESNT], 'grammar'],
  // ---- regras complementares (novas) ----
  ['When I arrive to the office, I park on the street.', ['When I arrive near the office, I park on the street.'], 'grammar'],
  ['I make a shower at the gym.', ['I take a shower at the gym.'], 'grammar'],
  ['I take breakfast at 5:20.', ['I have breakfast at 5:20.'], 'grammar'],
  ['On some days I do home office.', ['On some days I work from home.'], 'grammar'],
  ['I study English at the evening.', ['I study English in the evening.'], 'grammar'],
  ['The children is upstairs.', ['The children are upstairs.'], 'grammar'],
  // ---- concordância ----
  ['My wife go to bed early', [S_WIFE], 'grammar'],
  ['My laptop start up quickly.', ['My laptop starts up quickly.'], 'grammar'],
  ['She study English.', ['She studies English.'], 'grammar'],
  // ---- erros de sentido ----
  ['I go to sleep.', [S_LUNCH], 'meaning'],
  ['cold down', ['heat up'], 'NO'],
  ['put on', ['put away'], 'NO'],
  ['wake up', ['get up'], 'NO'],
  ['get up', ['wake up'], 'NO'],
  ['go to bed', ['go to bed early'], 'NO'],
  ['take a shower', ['brush my teeth'], 'meaning'],
  ['I play chess on my phone.', ['I listen to an English audiobook.'], 'meaning'],
  ['tidy up the kitchen', ['clear the table'], 'meaning'],
  ['financial statements', ['strategic forecasts'], 'meaning'],
  ['I work from home.', ['I go to the gym.'], 'meaning'],
  ['banana', ['chessboard'], 'meaning'],
  ['hello', ['Do you work from home?'], 'meaning'],
  ['run', ['run an errand'], 'NO'],
  ['an errand', ['run an errand'], 'NO'],
  ['I drive for Uber.', ['I drive straight home.'], 'NO'],
  ['senior managers', ['executive committee meeting'], 'meaning'],
  ['the rest of the day', ['the rest of the evening'], 'NO'],
  ['in time for lunch', ['in time for dinner'], 'NO'],
  ['three times a month', ['three times a week'], 'NO'],
  ['by 8:30 a.m.', ['by 7:30 a.m.'], 'NO'],
  ['at 10:00 a.m. sharp', ['at 9:00 a.m. sharp'], 'NO'],
  // ---- inconclusivos (substituição que pode ou não ser válida) ----
  ['I heat up my food in the microwave.', [S_LUNCH], 'inconclusive'],
  ['warm up', ['heat up'], 'NO'],
  ['I warm up my lunch in the microwave.', [S_LUNCH], 'inconclusive'],
  ['I listen to songs in English during the drive.', [S_LISTEN], 'inconclusive'],
  ['We spend some time chatting in the living room.', [S_SPEND], 'inconclusive'],
  ['During my afternoon break, I do a quick errand nearby.', [S_ERRAND], 'inconclusive'],
  ['I help the children with their night routine.', [S_KIDS], 'inconclusive'],
  // ---- perguntas e negativas ----
  ['Do you work from home?', [S_Q], 'correct'],
  ['do you work from home', [S_Q], 'correct'],
  ['You work from home?', [S_Q], 'NO'],
  ['Does your wife studies English?', [S_Q3], 'NO'],
  ["I don't work from home everyday.", [S_NEG], 'OK'],
  ['I not work from home every day.', [S_NEG], 'NO'],
  // ---- resposta vazia / lixo ----
  ['', [S1], 'empty'],
  ['   ', [S1], 'empty'],
  ['...', ['heat up'], 'meaning'],
  // ---- palavras soltas e collocations ----
  ['tidy up', ['tidy up'], 'correct'],
  ['get changed', ['get changed'], 'correct'],
  ['Get changed', ['get changed'], 'correct'],
  ['getting changed', ['get changed'], 'NO'],
  ['clear my head', ['clear my head'], 'correct'],
  ['clear the head', ['clear my head'], 'accepted_variant'],
  ['hit the road', ['hit the road'], 'correct'],
  ['run an errand', ['run an errand'], 'correct'],
  ['run a errand', ['run an errand'], 'accepted_variant'],
  ['work from home', ['work from home'], 'correct'],
  ['work at home', ['work from home'], 'inconclusive'],
  ['log in to', ['log in to', 'log on to', 'log into'], 'correct'],
  ['log into', ['log in to', 'log on to', 'log into'], 'accepted_variant'],
  ['mentally demanding', ['mentally demanding'], 'correct'],
  ['mentaly demanding', ['mentally demanding'], 'spelling'],
  ['a couple of hours', ['a couple of hours', 'two hours', 'a few hours'], 'correct'],
  ['two hours', ['a couple of hours', 'two hours', 'a few hours'], 'accepted_variant'],
  ['2 hours', ['a couple of hours', 'two hours', 'a few hours'], 'accepted_variant'],
  ['weight training session', ['weight-training session'], 'correct'],
  ['lunchbox', ['lunch box'], 'accepted_variant'],
];

test(`corretor: ${CASES.length} casos`, () => {
  assert.ok(CASES.length >= 150, `apenas ${CASES.length} casos`);
  const failures = [];
  for (const [answer, targets, expected] of CASES) {
    const r = checker.check(answer, targets);
    const ok = expected === 'OK' ? r.accepted : expected === 'NO' ? !r.accepted : r.cls === expected;
    if (!ok) failures.push(`“${answer}” vs “${targets[0]}”: esperado ${expected}, obtido ${r.cls} — ${r.notes.join(' | ')}`);
  }
  assert.deepEqual(failures, []);
});

test('nenhuma resposta de sentido errado é aceita (amostra adversarial)', () => {
  const wrong = [
    ['I go to the gym.', 'I work from home.'], ['get up', 'wake up'], ['put on', 'put away'], ['turn on', 'switch off'],
    ['I listen to an audiobook.', 'I watch an episode of The Simpsons.'], ['go to sleep', 'get changed'],
  ];
  for (const [a, t] of wrong) assert.equal(checker.check(a, [t]).accepted, false, `${a} aceito para ${t}`);
});

test('variante pessoal aprovada pelo usuário passa a ser aceita', () => {
  const c = createChecker(content.language, { userVariants: { 'it.heat-up': ['warm up'] } });
  assert.equal(c.check('warm up', ['heat up'], { itemId: 'it.heat-up' }).cls, 'accepted_variant');
  assert.equal(c.check('warm up', ['heat up'], { itemId: 'it.other' }).accepted, false);
});

test('cobertura de resposta longa por itens e palavras-chave', () => {
  const items = Object.values(content.items).filter((it) => ['it.wake-up', 'it.take-a-shower', 'it.brush-my-teeth'].includes(it.id));
  const r = checker.coverage('I woke up at five, had a shower and brushed my teeth.', { items, keywords: [['5', 'five']] });
  assert.equal(r.items.length, 3);
  assert.ok(r.items.find((x) => x.id === 'it.brush-my-teeth').ok);
  assert.ok(r.items.find((x) => x.id === 'it.take-a-shower').ok, 'have a shower deve contar como take a shower');
  assert.ok(r.keywords[0].ok);
  const r2 = checker.coverage('I listen music every day', {});
  assert.ok(r2.grammar.some((g) => g.id === 'E_LISTEN_TO'));
});
