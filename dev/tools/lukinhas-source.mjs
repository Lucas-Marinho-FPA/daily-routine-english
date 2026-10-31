#!/usr/bin/env node
// Fonte do pacote do Lukinhas (personagem “lucas-kid”, 11 anos): gera content/characters/lucas-kid.json.
// Os dez textos são os DEFINITIVOS aprovados (Daily Routine do Lukinhas), copiados sem alteração; o script confere,
// caractere por caractere, que as frases de cada sessão juntas reproduzem o texto integral. As traduções, as
// explicações, os exemplos adicionais e as perguntas são conteúdo de apoio escrito para o app (marcado como tal).
// As expressões são ligadas às frases pelo mesmo localizador do motor (engine/exercises.js#locate): uma expressão
// introduzida numa sessão volta, ligada, nas sessões seguintes em que aparece (revisão cumulativa).
// Uso: node tools/lukinhas-source.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locate } from '../app/js/engine/exercises.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- fatos informados (rotina real; nada além disto) ----------
const FACTS = [
  ['F01', 'Acorda bem cedo.'], ['F02', 'Arruma a cama.'], ['F03', 'Desce e dá comida ao cachorro.'], ['F04', 'Limpa a sujeira do cachorro.'],
  ['F05', 'Leva o lixo para fora.'], ['F06', 'Toma café da manhã.'], ['F07', 'Toma banho.'], ['F08', 'Ajuda nas tarefas de casa.'],
  ['F09', 'Por volta das 11h se arruma e desce para ver TV com o irmão.'], ['F10', 'O pai deixa os dois verem TV até o transporte escolar chegar, por volta de 12h40.'],
  ['F11', 'Em dias de jiu-jitsu, ajuda nas tarefas e se prepara para o treino.'], ['F12', 'Em dias de jiu-jitsu, sai com o irmão às 9h40, já com a roupa de treino.'],
  ['F13', 'Em dias de jiu-jitsu, volta para casa às 11h.'], ['F14', 'Depois do treino, coloca a guia no cachorro e passeia com ele até cerca de 11h30.'],
  ['F15', 'Depois do passeio, toma outro banho, se arruma e desce para a sala.'],
].map(([id, pt]) => ({ id, kind: 'base', pt }));

// ---------- os dez textos definitivos ----------
const TEXTS = {
  L01: "I usually wake up very early in the morning. First, I make my bed and go downstairs to feed my dog. I also clean up after him and take the rubbish out. Then, I have breakfast and take a shower. After that, I help around the house with some chores. At around eleven o'clock, I freshen up and go downstairs to watch TV with my brother. My dad lets us watch television until our school minibus arrives at about twelve forty.",
  L02: "My mornings start really early. As soon as I get up, I tidy my bed and head downstairs. I put some food in my dog's bowl and make sure everything is clean. Once I've looked after my dog, I have a good breakfast. Then, I head upstairs to take a shower. After getting dressed, I help my family with a few things around the house. Later on, my brother and I go downstairs to relax and watch TV while we wait for our school transport.",
  L03: "One of my first jobs every morning is looking after my dog. I get out of bed, make it properly and take his food downstairs. Once he's eaten, I clean up after him and sort out any mess. Then, I take the rubbish out and get ready for breakfast. After eating, I jump in the shower and help with the household chores. I always try to do my bit around the house before relaxing in the living room with my brother.",
  L04: "After breakfast, I don't just sit around doing nothing. I usually lend a hand with the housework. There are always little jobs to do, such as tidying things up, putting things away and keeping the house clean. Before that, I make sure my dog has been fed and his mess has been cleared away. Once I've finished my chores, I go upstairs to freshen up. Then, I head down to the living room and spend some time with my brother.",
  L05: "On a jiu-jitsu day, my morning is a little different. After waking up, making my bed and feeding the dog, I have breakfast and take a shower. I also help out with some chores before getting ready for training. At twenty to ten, my brother and I get changed into our jiu-jitsu clothes and head off to class. We get back home at eleven o'clock. Then, we put our dog's lead on and take him out for a walk until half past eleven.",
  L06: "When we get back from jiu-jitsu, it's time to take our dog out. We grab his lead, put it on him and head outside for a walk. We usually stay out for about half an hour. Once we get home, we take another shower and freshen up. After that, we make our way downstairs to the living room. My dad lets my brother and me kick back and watch some TV. It's a nice way to relax before the school minibus turns up.",
  L07: "My morning is quite busy, so I have to keep an eye on the time. I get up early, make my bed and go downstairs to feed the dog. After cleaning up after him, I take out the rubbish and have a filling breakfast. Then, I have a shower and get on with my chores. On training days, my brother and I leave at twenty to ten. We return at eleven, walk the dog for half an hour and get ready for the rest of the day.",
  L08: "I'm usually up bright and early. First things first, I sort out my dog's breakfast and clean up after him. Then, I get myself ready, have breakfast and pitch in with whatever needs doing around the house. If it's a jiu-jitsu day, my brother and I get our gear on and head out for training. When we come back, we take the dog for a walk. Later, we chill out in the living room and watch TV until our school ride shows up.",
  L09: "I like to get things done in the morning before it's time to go to school. I start by making my bed and taking care of my dog. Once I've fed him and cleaned up after him, I take the rubbish out and sit down for a proper breakfast. I then have a shower and crack on with my household chores. On training days, my brother and I head off to jiu-jitsu at twenty to ten. By half past eleven, we're back from walking the dog and ready to wind down.",
  L10: "My mornings are usually quite busy, but I've got a routine that helps me get everything done. I wake up early, make my bed and head downstairs to feed my dog. Once I've cleaned up after him and taken the rubbish out, I sit down for a hearty breakfast. After that, I jump in the shower and lend a hand with the household chores. On jiu-jitsu days, my brother and I get changed and head off to training at twenty to ten. We get back at eleven, put the dog's lead on and take him out for a walk. Once we're home again, we freshen up and head downstairs. My dad lets us kick back and watch TV until our school minibus pulls up at around twelve forty. And that's pretty much how I spend my morning!",
};

// ---------- sessões: blocos de frases (en, tradução, fatos) ----------
// bloco: [contexto, título em português, [[en, pt, fatos], …]]
const S = (n, title, pt, focus, level, objective, grammar, vocab, blocks) => ({ n, title, pt, focus, level, objective, grammar, vocab, blocks });
const SESSIONS = [
  S(1, 'My Morning Routine', 'Minha rotina da manhã', 'Basic vocabulary and everyday actions', 'Beginner — Foundation',
    'Compreender e descrever ações cotidianas utilizando frases simples.',
    'Present Simple para hábitos (I wake up, I make my bed) e “usually” para o que costuma acontecer. “My dad lets us watch…”: let + pessoa + verbo = deixar alguém fazer algo.',
    ['Wake up', 'Make my bed', 'Feed my dog', 'Clean up after him', 'Take the rubbish out', 'Help around the house', 'Freshen up'],
    [['morning', 'Começo da manhã e o cachorro', [
      ['I usually wake up very early in the morning.', 'Normalmente eu acordo bem cedo de manhã.', ['F01']],
      ['First, I make my bed and go downstairs to feed my dog.', 'Primeiro, arrumo a cama e desço para dar comida ao meu cachorro.', ['F02', 'F03']],
      ['I also clean up after him and take the rubbish out.', 'Também limpo a sujeira que ele faz e levo o lixo para fora.', ['F04', 'F05']]]],
    ['morning', 'Café, tarefas e TV', [
      ['Then, I have breakfast and take a shower.', 'Depois, tomo café da manhã e tomo banho.', ['F06', 'F07']],
      ['After that, I help around the house with some chores.', 'Em seguida, ajudo em casa com algumas tarefas.', ['F08']],
      ["At around eleven o'clock, I freshen up and go downstairs to watch TV with my brother.", 'Por volta das onze, eu me arrumo e desço para ver TV com o meu irmão.', ['F09']],
      ['My dad lets us watch television until our school minibus arrives at about twelve forty.', 'Meu pai deixa a gente ver televisão até o transporte escolar chegar, por volta de meio-dia e quarenta.', ['F10']]]]]),
  S(2, 'Getting Ready for the Day', 'Preparando-me para o dia', 'Sequence, transitions and connectors', 'Beginner — Sequencing',
    'Organizar acontecimentos cronologicamente e compreender conectivos temporais.',
    'Conectivos de tempo: as soon as, once, then, after, later on, while. “Once I’ve looked after my dog” usa o Present Perfect: primeiro termino isso, depois faço o resto. “After getting dressed”: depois de + verbo com -ing.',
    ['As soon as', 'Head downstairs', 'Make sure', 'Look after', "Once I've...", 'After getting dressed', 'Later on', 'While we wait'],
    [['morning', 'Logo cedo, com o cachorro', [
      ['My mornings start really early.', 'Minhas manhãs começam bem cedo.', ['F01']],
      ['As soon as I get up, I tidy my bed and head downstairs.', 'Assim que me levanto, arrumo a cama e desço.', ['F01', 'F02']],
      ["I put some food in my dog's bowl and make sure everything is clean.", 'Coloco comida na tigela do meu cachorro e confiro se está tudo limpo.', ['F03', 'F04']],
      ["Once I've looked after my dog, I have a good breakfast.", 'Depois de cuidar do meu cachorro, tomo um bom café da manhã.', ['F03', 'F06']]]],
    ['morning', 'Banho, ajuda em casa e TV', [
      ['Then, I head upstairs to take a shower.', 'Então, subo para tomar banho.', ['F07']],
      ['After getting dressed, I help my family with a few things around the house.', 'Depois de me vestir, ajudo minha família com algumas coisas em casa.', ['F08']],
      ['Later on, my brother and I go downstairs to relax and watch TV while we wait for our school transport.', 'Mais tarde, eu e meu irmão descemos para descansar e ver TV enquanto esperamos o transporte da escola.', ['F09', 'F10']]]]]),
  S(3, 'Looking After My Dog', 'Cuidando do meu cachorro', 'Verbs and expressions related to caring for the dog', 'Beginner to Elementary',
    'Ampliar o vocabulário por meio de situações familiares e atividades concretas.',
    'Possessivos: my dog, his food, my bit (meu, dele, minha parte). “Once he’s eaten”: Present Perfect para uma ação já terminada. Preposições de lugar: downstairs, in the shower, around the house, in the living room.',
    ['Get out of bed', 'Make it properly', 'Look after', 'Sort out', 'Get ready for', 'Jump in the shower', 'Household chores', 'Do my bit'],
    [['morning', 'Primeiro, o cachorro', [
      ['One of my first jobs every morning is looking after my dog.', 'Uma das minhas primeiras tarefas toda manhã é cuidar do meu cachorro.', ['F03', 'F04']],
      ['I get out of bed, make it properly and take his food downstairs.', 'Saio da cama, arrumo direitinho e levo a comida dele lá para baixo.', ['F01', 'F02', 'F03']],
      ["Once he's eaten, I clean up after him and sort out any mess.", 'Depois que ele come, limpo a sujeira dele e dou um jeito em qualquer bagunça.', ['F04']]]],
    ['morning', 'Lixo, café, banho e tarefas', [
      ['Then, I take the rubbish out and get ready for breakfast.', 'Depois, levo o lixo para fora e me preparo para o café da manhã.', ['F05', 'F06']],
      ['After eating, I jump in the shower and help with the household chores.', 'Depois de comer, tomo um banho rápido e ajudo nas tarefas de casa.', ['F07', 'F08']],
      ['I always try to do my bit around the house before relaxing in the living room with my brother.', 'Sempre tento fazer a minha parte em casa antes de relaxar na sala com o meu irmão.', ['F08', 'F09']]]]]),
  S(4, 'Helping Around the House', 'Ajudando em casa', 'Household responsibilities and phrasal verbs', 'Elementary',
    'Aprender a descrever responsabilidades domésticas e utilizar expressões naturais.',
    'Negativa no Present Simple: I don’t just sit around (eu não fico só à toa). “Such as” para dar exemplos. “Has been fed / has been cleared away”: o cachorro já foi alimentado, a sujeira já foi limpa (o importante é o resultado, não quem fez).',
    ['Sit around', 'Lend a hand', 'Housework', 'Tidy things up', 'Put things away', 'Clear away', 'Finish my chores', 'Spend some time'],
    [['morning', 'Nada de ficar à toa', [
      ["After breakfast, I don't just sit around doing nothing.", 'Depois do café da manhã, eu não fico só à toa sem fazer nada.', ['F06', 'F08']],
      ['I usually lend a hand with the housework.', 'Normalmente dou uma mão no serviço de casa.', ['F08']],
      ['There are always little jobs to do, such as tidying things up, putting things away and keeping the house clean.', 'Sempre tem pequenas tarefas para fazer, como arrumar as coisas, guardar tudo no lugar e manter a casa limpa.', ['F08']]]],
    ['morning', 'O cachorro antes, a sala depois', [
      ['Before that, I make sure my dog has been fed and his mess has been cleared away.', 'Antes disso, confiro se meu cachorro já comeu e se a sujeira dele já foi limpa.', ['F03', 'F04']],
      ["Once I've finished my chores, I go upstairs to freshen up.", 'Depois de terminar minhas tarefas, subo para me arrumar.', ['F08', 'F09']],
      ['Then, I head down to the living room and spend some time with my brother.', 'Depois, desço para a sala e passo um tempo com o meu irmão.', ['F09']]]]]),
  S(5, "It's Jiu-Jitsu Time!", 'Hora do jiu-jitsu!', 'Activities, movement and time expressions', 'Elementary',
    'Descrever atividades específicas, horários e deslocamentos.',
    'Horas em inglês britânico: twenty to ten (9h40), eleven o’clock (11h), half past eleven (11h30). “On a jiu-jitsu day”: on + dia. “Before getting ready”: antes de + verbo com -ing.',
    ['Help out', 'Get ready for', 'Get changed', 'Twenty to ten', 'Head off', 'Get back', 'Put the lead on', 'Take him out for a walk', 'Half past eleven'],
    [['morning', 'Uma manhã um pouco diferente', [
      ['On a jiu-jitsu day, my morning is a little different.', 'Em dia de jiu-jitsu, minha manhã é um pouco diferente.', ['F11']],
      ['After waking up, making my bed and feeding the dog, I have breakfast and take a shower.', 'Depois de acordar, arrumar a cama e dar comida ao cachorro, tomo café da manhã e tomo banho.', ['F01', 'F02', 'F03', 'F06', 'F07']],
      ['I also help out with some chores before getting ready for training.', 'Também ajudo com algumas tarefas antes de me preparar para o treino.', ['F08', 'F11']]]],
    ['gym', 'Treino e passeio com o cachorro', [
      ['At twenty to ten, my brother and I get changed into our jiu-jitsu clothes and head off to class.', 'Às nove e quarenta, eu e meu irmão vestimos a roupa de jiu-jitsu e saímos para a aula.', ['F12']],
      ["We get back home at eleven o'clock.", 'Voltamos para casa às onze horas.', ['F13']],
      ["Then, we put our dog's lead on and take him out for a walk until half past eleven.", 'Depois, colocamos a guia no nosso cachorro e levamos ele para passear até as onze e meia.', ['F14']]]]]),
  S(6, 'Back Home and Ready to Relax', 'De volta em casa e pronto para relaxar', 'Alternative phrasal verbs and conversational expressions', 'Elementary',
    'Compreender e utilizar phrasal verbs em situações cotidianas.',
    'Phrasal verbs = verbo + partícula com um sentido próprio: get back, head outside, stay out, kick back, turn up. “It’s time to take our dog out”: it’s time to + verbo. “For about half an hour”: por mais ou menos meia hora.',
    ['Get back', 'Grab', 'Head outside', 'Stay out', 'Freshen up', 'Make our way', 'Kick back', 'Turn up'],
    [['gym', 'Depois do jiu-jitsu, o passeio', [
      ["When we get back from jiu-jitsu, it's time to take our dog out.", 'Quando voltamos do jiu-jitsu, é hora de levar nosso cachorro para passear.', ['F13', 'F14']],
      ['We grab his lead, put it on him and head outside for a walk.', 'Pegamos a guia dele, colocamos nele e saímos para uma caminhada.', ['F14']],
      ['We usually stay out for about half an hour.', 'Normalmente ficamos fora por mais ou menos meia hora.', ['F14']]]],
    ['morning', 'Banho, sala e TV', [
      ['Once we get home, we take another shower and freshen up.', 'Quando chegamos em casa, tomamos outro banho e nos arrumamos.', ['F15']],
      ['After that, we make our way downstairs to the living room.', 'Depois disso, vamos lá para baixo, para a sala.', ['F15']],
      ['My dad lets my brother and me kick back and watch some TV.', 'Meu pai deixa eu e meu irmão relaxarmos e vermos um pouco de TV.', ['F10']],
      ["It's a nice way to relax before the school minibus turns up.", 'É um jeito gostoso de descansar antes de o transporte escolar aparecer.', ['F10']]]]]),
  S(7, 'My Morning, Step by Step', 'Minha manhã, passo a passo', 'Time management and transitions', 'Elementary',
    'Trabalhar horários, organização temporal e continuidade de ações.',
    '“So I have to”: so = por isso; have to = preciso (obrigação). “On training days”: nos dias de treino (on + dias). “Get on with”: continuar fazendo algo sem parar.',
    ['Keep an eye on', 'Filling breakfast', 'Get on with', 'Training days', 'Leave', 'Return', 'The rest of the day'],
    [['morning', 'Manhã corrida, um passo de cada vez', [
      ['My morning is quite busy, so I have to keep an eye on the time.', 'Minha manhã é bem corrida, então preciso ficar de olho no horário.', ['F01']],
      ['I get up early, make my bed and go downstairs to feed the dog.', 'Levanto cedo, arrumo a cama e desço para dar comida ao cachorro.', ['F01', 'F02', 'F03']],
      ['After cleaning up after him, I take out the rubbish and have a filling breakfast.', 'Depois de limpar a sujeira dele, levo o lixo para fora e tomo um café da manhã reforçado.', ['F04', 'F05', 'F06']],
      ['Then, I have a shower and get on with my chores.', 'Depois, tomo banho e sigo com as minhas tarefas.', ['F07', 'F08']]]],
    ['gym', 'Dias de treino', [
      ['On training days, my brother and I leave at twenty to ten.', 'Nos dias de treino, eu e meu irmão saímos às nove e quarenta.', ['F12']],
      ['We return at eleven, walk the dog for half an hour and get ready for the rest of the day.', 'Voltamos às onze, passeamos com o cachorro por meia hora e nos preparamos para o resto do dia.', ['F13', 'F14', 'F15']]]]]),
  S(8, 'A Typical Day at Home', 'Um dia normal em casa', 'Conversational and idiomatic English', 'Elementary',
    'Compreender linguagem conversacional e reconhecer expressões informais naturais.',
    'Expressões do inglês do dia a dia: first things first, pitch in, chill out, show up. “If it’s a jiu-jitsu day, …”: se + Present Simple para algo que acontece em certos dias. “Until our school ride shows up”: until + Present Simple.',
    ['Be up bright and early', 'First things first', 'Sort out', 'Get myself ready', 'Pitch in', 'Whatever needs doing', 'Get our gear on', 'Chill out', 'Show up'],
    [['morning', 'Bem cedinho', [
      ["I'm usually up bright and early.", 'Normalmente estou de pé bem cedinho.', ['F01']],
      ["First things first, I sort out my dog's breakfast and clean up after him.", 'Primeiro o mais importante: cuido do café da manhã do meu cachorro e limpo a sujeira dele.', ['F03', 'F04']],
      ['Then, I get myself ready, have breakfast and pitch in with whatever needs doing around the house.', 'Depois, eu me arrumo, tomo café da manhã e ajudo no que precisar ser feito em casa.', ['F06', 'F07', 'F08']]]],
    ['gym', 'Treino, passeio e sofá', [
      ["If it's a jiu-jitsu day, my brother and I get our gear on and head out for training.", 'Se é dia de jiu-jitsu, eu e meu irmão vestimos o nosso equipamento e saímos para o treino.', ['F12']],
      ['When we come back, we take the dog for a walk.', 'Quando voltamos, levamos o cachorro para passear.', ['F13', 'F14']],
      ['Later, we chill out in the living room and watch TV until our school ride shows up.', 'Mais tarde, relaxamos na sala e vemos TV até a condução da escola aparecer.', ['F09', 'F10']]]]]),
  S(9, 'Keeping My Morning Organised', 'Mantendo a manhã organizada', 'Rich vocabulary and greater linguistic precision', 'Elementary to Intermediate',
    'Desenvolver precisão vocabular e maior flexibilidade na construção de frases.',
    '“Start by + -ing”: começar fazendo algo. “By half past eleven”: até as onze e meia (no máximo nesse horário). “Back from walking the dog”: from + verbo com -ing. Palavras mais precisas: proper, crack on with, wind down.',
    ['Get things done', 'Start by', 'Take care of', 'Sit down for', 'Proper breakfast', 'Crack on with', 'By half past eleven', 'Wind down'],
    [['morning', 'Resolver tudo de manhã', [
      ["I like to get things done in the morning before it's time to go to school.", 'Gosto de resolver as coisas de manhã, antes da hora de ir para a escola.', ['F08']],
      ['I start by making my bed and taking care of my dog.', 'Começo arrumando a cama e cuidando do meu cachorro.', ['F02', 'F03']],
      ["Once I've fed him and cleaned up after him, I take the rubbish out and sit down for a proper breakfast.", 'Depois de dar comida a ele e limpar a sujeira dele, levo o lixo para fora e me sento para um café da manhã de verdade.', ['F03', 'F04', 'F05', 'F06']],
      ['I then have a shower and crack on with my household chores.', 'Depois tomo banho e mando ver nas tarefas de casa.', ['F07', 'F08']]]],
    ['gym', 'Dias de treino', [
      ['On training days, my brother and I head off to jiu-jitsu at twenty to ten.', 'Nos dias de treino, eu e meu irmão saímos para o jiu-jitsu às nove e quarenta.', ['F12']],
      ["By half past eleven, we're back from walking the dog and ready to wind down.", 'Até as onze e meia, já voltamos do passeio com o cachorro e estamos prontos para relaxar.', ['F14']]]]]),
  S(10, 'My Daily Routine: The Full Story', 'Minha rotina: a história completa', 'Full storytelling, integration and independent speaking', 'Elementary to Intermediate',
    'Integrar todo o vocabulário, expressões e construções trabalhados anteriormente, preparando Lukinhas para falar de maneira independente.',
    'Tudo junto: Present Simple para a rotina, “Once I’ve cleaned up… and taken…” (Present Perfect com once), “I’ve got” (forma britânica de “I have”), conectivos (after that, once, until) e horários (twenty to ten, at eleven, at around twelve forty).',
    ["I've got a routine", 'Get everything done', 'Hearty breakfast', 'Lend a hand', 'Head off', 'Get back', 'Home again', 'Kick back', 'Pull up', 'Pretty much'],
    [['morning', 'Começo da manhã', [
      ["My mornings are usually quite busy, but I've got a routine that helps me get everything done.", 'Minhas manhãs costumam ser bem corridas, mas eu tenho uma rotina que me ajuda a dar conta de tudo.', ['F01', 'F08']],
      ['I wake up early, make my bed and head downstairs to feed my dog.', 'Acordo cedo, arrumo a cama e desço para dar comida ao meu cachorro.', ['F01', 'F02', 'F03']],
      ["Once I've cleaned up after him and taken the rubbish out, I sit down for a hearty breakfast.", 'Depois de limpar a sujeira dele e levar o lixo para fora, eu me sento para um café da manhã caprichado.', ['F04', 'F05', 'F06']],
      ['After that, I jump in the shower and lend a hand with the household chores.', 'Depois disso, tomo um banho rápido e dou uma mão nas tarefas de casa.', ['F07', 'F08']]]],
    ['gym', 'Dias de jiu-jitsu', [
      ['On jiu-jitsu days, my brother and I get changed and head off to training at twenty to ten.', 'Nos dias de jiu-jitsu, eu e meu irmão trocamos de roupa e saímos para o treino às nove e quarenta.', ['F12']],
      ["We get back at eleven, put the dog's lead on and take him out for a walk.", 'Voltamos às onze, colocamos a guia no cachorro e levamos ele para passear.', ['F13', 'F14']]]],
    ['morning', 'Até o transporte da escola', [
      ["Once we're home again, we freshen up and head downstairs.", 'Quando estamos em casa de novo, nos arrumamos e descemos.', ['F15']],
      ['My dad lets us kick back and watch TV until our school minibus pulls up at around twelve forty.', 'Meu pai deixa a gente relaxar e ver TV até o transporte escolar parar aqui na frente, por volta de meio-dia e quarenta.', ['F10']],
      ["And that's pretty much how I spend my morning!", 'E é mais ou menos assim que eu passo a minha manhã!', ['F01', 'F10']]]]]), // resumo da manhã inteira
];

// ---------- expressões (vocabulário prioritário) ----------
// [id, en (como na lista), padrão no texto, pt, categoria, explicação para a idade, exemplo adicional (en, pt), forma simples (opcional)]
const I = (id, en, match, pt, c, explain, exEn, exPt, plain = null) => ({ id: `lk.${id}`, en, match, pt, c, explain, extra: { en: exEn, pt: exPt }, plain });
const ITEMS = [
  // 01
  I('wake-up', 'wake up', 'wake up', 'acordar', 'phrasal', 'É o momento em que você abre os olhos e para de dormir. “Get up” é sair da cama.', 'What time do you wake up on Saturdays?', 'A que horas você acorda aos sábados?'),
  I('make-my-bed', 'make my bed', 'make my bed', 'arrumar a minha cama', 'collocation', 'Em inglês, cama se “faz” (make): esticar o lençol, ajeitar o travesseiro e a coberta.', 'Make your bed before you leave your room.', 'Arrume a cama antes de sair do quarto.'),
  I('feed-my-dog', 'feed my dog', 'feed my dog', 'dar comida ao meu cachorro', 'collocation', '“Feed” é dar comida para um animal ou para um bebê.', 'Can you feed the dog this evening?', 'Você pode dar comida ao cachorro hoje à noite?'),
  I('clean-up-after', 'clean up after him', 'clean up after him', 'limpar a sujeira que ele faz', 'phrasal', '“Clean up after someone” é limpar a bagunça ou a sujeira que outra pessoa (ou um animal) deixou.', 'Remember to clean up after yourself.', 'Lembre-se de limpar a sua própria bagunça.', 'clean his mess'),
  I('rubbish-out', 'take the rubbish out', 'take the rubbish out', 'levar o lixo para fora', 'phrasal', 'No inglês britânico, lixo é “rubbish” (nos EUA, “garbage” ou “trash”).', 'Whose turn is it to take the rubbish out?', 'De quem é a vez de levar o lixo para fora?'),
  I('help-around', 'help around the house', 'help around the house', 'ajudar em casa', 'collocation', 'Fazer pequenas tarefas da casa para ajudar a família.', 'Do you help around the house at the weekend?', 'Você ajuda em casa no fim de semana?'),
  I('freshen-up', 'freshen up', 'freshen up', 'se arrumar, dar uma refrescada', 'phrasal', 'Lavar o rosto, pentear o cabelo, trocar de roupa: ficar limpinho e pronto.', 'You can freshen up before dinner.', 'Você pode se arrumar antes do jantar.', 'wash and get ready'),
  // 02
  I('as-soon-as', 'as soon as', 'as soon as', 'assim que', 'connector', 'Mostra que uma coisa acontece logo depois da outra, sem esperar.', "Call me as soon as you get home.", 'Me liga assim que chegar em casa.'),
  I('head-downstairs', 'head downstairs', 'head downstairs', 'descer (ir lá para baixo)', 'phrasal', '“Head” aqui quer dizer “ir em direção a”. É mais natural do que “go down the stairs”.', 'Breakfast is ready — let’s head downstairs.', 'O café está pronto — vamos descer.', 'go down the stairs'),
  I('make-sure', 'make sure', 'make sure', 'garantir, conferir que', 'collocation', 'Verificar para ter certeza de que algo está certo ou feito.', 'Make sure your trainers are in your bag.', 'Confira se o seu tênis está na mochila.', 'check'),
  I('look-after', 'look after', 'look after', 'cuidar de', 'phrasal', 'Cuidar de alguém ou de um animal: dar comida, atenção, limpar.', 'Who looks after your dog when you go on holiday?', 'Quem cuida do seu cachorro quando você sai de férias?', 'take care of'),
  I('once-ive', "once I've...", "once I've", 'depois que eu (já) …', 'connector', '“Once I’ve…” = assim que eu tiver terminado algo; depois vem o próximo passo.', "Once you've finished your homework, you can play.", 'Depois que você terminar a lição, pode brincar.'),
  I('after-getting-dressed', 'after getting dressed', 'after getting dressed', 'depois de me vestir', 'sentence', 'Depois de “after”, o verbo vai com -ing: after getting, after eating, after waking up.', 'After getting dressed, put your pyjamas away.', 'Depois de se vestir, guarde o pijama.'),
  I('later-on', 'later on', 'later on', 'mais tarde', 'time', 'Um tempo depois, no mesmo dia.', "I'll show you later on.", 'Eu te mostro mais tarde.'),
  I('while-we-wait', 'while we wait', 'while we wait', 'enquanto esperamos', 'connector', '“While” mostra duas coisas acontecendo ao mesmo tempo.', "Let's read a book while we wait.", 'Vamos ler um livro enquanto esperamos.'),
  // 03
  I('get-out-of-bed', 'get out of bed', 'get out of bed', 'sair da cama', 'phrasal', 'É levantar e sair da cama (depois de acordar).', 'It’s hard to get out of bed on cold mornings.', 'É difícil sair da cama nas manhãs frias.'),
  I('make-it-properly', 'make it properly', 'make it properly', 'arrumar direitinho', 'collocation', '“Properly” = do jeito certo, bem feito. Aqui “it” é a cama.', 'Do your homework properly, not too fast.', 'Faça a lição direitinho, não rápido demais.'),
  I('sort-out', 'sort out', 'sort out', 'resolver, dar um jeito em', 'phrasal', 'Organizar ou resolver algo que estava bagunçado ou pendente.', 'Can you sort out your toys before bedtime?', 'Você pode organizar os seus brinquedos antes de dormir?', 'fix'),
  I('get-ready-for', 'get ready for', 'get ready for', 'se preparar para', 'phrasal', 'Fazer o que é preciso antes de uma atividade.', "It's time to get ready for school.", 'Está na hora de se preparar para a escola.'),
  I('jump-in-shower', 'jump in the shower', 'jump in the shower', 'tomar um banho rápido', 'collocation', 'Jeito informal de dizer “tomar banho rapidinho” — ninguém pula de verdade!', 'I’m going to jump in the shower before we go out.', 'Vou tomar um banho rápido antes de sairmos.', 'take a shower'),
  I('household-chores', 'household chores', 'household chores', 'tarefas de casa', 'word', '“Chores” são as tarefas do dia a dia: lavar louça, arrumar, varrer.', 'Everyone should share the household chores.', 'Todo mundo deveria dividir as tarefas de casa.'),
  I('do-my-bit', 'do my bit', 'do my bit', 'fazer a minha parte', 'collocation', 'Expressão britânica: contribuir com a sua parte num trabalho em equipe.', 'Everyone has to do their bit to keep the classroom tidy.', 'Todo mundo tem que fazer a sua parte para manter a sala arrumada.', 'help'),
  // 04
  I('sit-around', 'sit around', 'sit around', 'ficar à toa', 'phrasal', 'Ficar parado sem fazer nada de útil.', "Don't just sit around — come and help me!", 'Não fique aí à toa — venha me ajudar!'),
  I('lend-a-hand', 'lend a hand', 'lend a hand', 'dar uma mão, ajudar', 'collocation', '“Emprestar a mão” = ajudar alguém. É um jeito simpático de dizer “help”.', 'Could you lend me a hand with these bags?', 'Você pode me dar uma mão com essas sacolas?', 'help'),
  I('housework', 'housework', 'housework', 'serviço de casa', 'word', 'Todo o trabalho de cuidar da casa. Não confunda com “homework” (lição da escola)!', 'Is your homework finished? Then help with the housework.', 'A lição está pronta? Então ajude no serviço de casa.'),
  I('tidy-things-up', 'tidy things up', 'tidy things up', 'arrumar as coisas', 'phrasal', '“Tidy” = arrumado. “Tidy up” = deixar tudo em ordem.', "Let's tidy things up before the guests arrive.", 'Vamos arrumar as coisas antes de as visitas chegarem.', 'organise things'),
  I('put-things-away', 'put things away', 'put things away', 'guardar as coisas (no lugar)', 'phrasal', 'Colocar cada coisa no lugar dela: no armário, na gaveta.', 'Put your books away when you finish.', 'Guarde os seus livros quando terminar.'),
  I('clear-away', 'clear away', 'clear away', 'tirar, limpar (deixar livre)', 'phrasal', 'Tirar algo do lugar para deixá-lo limpo, como a mesa depois do almoço.', 'Can you clear away the plates, please?', 'Você pode tirar os pratos, por favor?'),
  I('finish-chores', 'finish my chores', 'finish my chores', 'terminar as minhas tarefas', 'collocation', '“Chores” são as tarefas da casa. Terminar = finish.', 'You can play when you finish your chores.', 'Você pode brincar quando terminar suas tarefas.'),
  I('spend-some-time', 'spend some time', 'spend some time', 'passar um tempo', 'collocation', 'Em inglês, tempo se “gasta” (spend): passar um tempo com alguém ou fazendo algo.', "It's nice to spend some time with your friends.", 'É bom passar um tempo com os seus amigos.'),
  // 05
  I('help-out', 'help out', 'help out', 'ajudar (dar uma força)', 'phrasal', '“Help out” é ajudar alguém, principalmente quando ele tem muita coisa para fazer.', 'Can you help out in the kitchen, please?', 'Você pode ajudar na cozinha, por favor?'),
  I('get-changed', 'get changed', 'get changed', 'trocar de roupa', 'phrasal', 'Tirar uma roupa e colocar outra, como o kimono do jiu-jitsu.', 'You need to get changed for PE.', 'Você precisa trocar de roupa para a aula de educação física.', 'change my clothes'),
  I('twenty-to-ten', 'twenty to ten', 'twenty to ten', 'nove e quarenta (vinte para as dez)', 'time', 'Em inglês britânico, diz-se quantos minutos faltam para a hora seguinte: twenty to ten = 9h40.', 'The film starts at twenty to ten.', 'O filme começa às nove e quarenta.', 'nine forty'),
  I('head-off', 'head off', 'head off', 'sair, partir (para um lugar)', 'phrasal', 'Sair de onde você está e ir para outro lugar.', "It's late — we should head off now.", 'Está tarde — a gente devia ir embora agora.', 'go'),
  I('get-back', 'get back', 'get back', 'voltar', 'phrasal', 'Chegar de volta ao lugar de onde você saiu (em geral, para casa).', 'What time do you get back from school?', 'A que horas você volta da escola?', 'return'),
  I('put-lead-on', 'put the lead on', 'put * lead on', 'colocar a guia (no cachorro)', 'phrasal', '“Lead” é a guia do cachorro no inglês britânico (nos EUA, “leash”). O nome pode ficar no meio: put our dog’s lead on.', 'Put the lead on before you open the door.', 'Coloque a guia antes de abrir a porta.'),
  I('take-him-out-walk', 'take him out for a walk', 'take him out for a walk', 'levar ele para passear', 'phrasal', 'Levar o cachorro para fora para caminhar.', 'Can you take him out for a walk later?', 'Você pode levar ele para passear mais tarde?'),
  I('half-past-eleven', 'half past eleven', 'half past eleven', 'onze e meia', 'time', '“Half past” = e meia, 30 minutos depois da hora.', 'Lunch is at half past twelve.', 'O almoço é ao meio-dia e meia.', 'eleven thirty'),
  // 06
  I('grab', 'grab', 'grab', 'pegar (rapidinho)', 'word', 'Pegar algo rápido com a mão. Muito usado no dia a dia.', 'Grab your coat — it’s cold outside.', 'Pega o casaco — está frio lá fora.', 'take'),
  I('head-outside', 'head outside', 'head outside', 'sair (para fora de casa)', 'phrasal', 'Ir para fora, para a rua ou o quintal.', 'Let’s head outside and play football.', 'Vamos lá para fora jogar bola.', 'go outside'),
  I('stay-out', 'stay out', 'stay out', 'ficar fora (de casa)', 'phrasal', 'Continuar fora de casa por um tempo.', 'We can stay out until it gets dark.', 'Podemos ficar fora até escurecer.'),
  I('make-our-way', 'make our way', 'make our way', 'ir (seguir) até', 'collocation', 'Ir até um lugar, aos poucos ou com calma.', 'We made our way to the front of the queue.', 'Fomos até a frente da fila.', 'go'),
  I('kick-back', 'kick back', 'kick back', 'relaxar, ficar de boa', 'phrasal', 'Jeito informal de dizer “relax”: descansar sem preocupação.', "After a long day, it's nice to kick back.", 'Depois de um dia longo, é bom ficar de boa.', 'relax'),
  I('turn-up', 'turn up', 'turn up', 'aparecer, chegar', 'phrasal', 'Chegar a um lugar (às vezes sem horário exato).', 'My friend turned up late for the party.', 'Meu amigo chegou atrasado à festa.', 'arrive'),
  // 07
  I('keep-an-eye-on', 'keep an eye on', 'keep an eye on', 'ficar de olho em', 'collocation', 'Prestar atenção em algo ou alguém de vez em quando.', 'Can you keep an eye on my bag for a minute?', 'Você pode ficar de olho na minha mochila um minutinho?', 'watch'),
  I('filling-breakfast', 'filling breakfast', 'filling breakfast', 'café da manhã reforçado', 'collocation', '“Filling” = que enche, que deixa você satisfeito por bastante tempo.', 'Porridge is a filling breakfast.', 'Mingau é um café da manhã que sustenta.', 'big breakfast'),
  I('get-on-with', 'get on with', 'get on with', 'seguir com, continuar fazendo', 'phrasal', 'Começar ou continuar uma tarefa sem enrolar.', 'Stop talking and get on with your work.', 'Pare de conversar e continue o seu trabalho.', 'do'),
  I('training-days', 'training days', 'training days', 'dias de treino', 'time', 'Os dias em que tem treino (aqui, de jiu-jitsu).', 'Training days can be really tiring.', 'Dias de treino podem ser bem cansativos.'),
  I('leave', 'leave', 'leave', 'sair, partir', 'verb', 'Ir embora de um lugar. Passado: left.', 'What time do you leave for school?', 'A que horas você sai para a escola?'),
  I('return', 'return', 'return', 'voltar', 'verb', 'Voltar a um lugar. É um pouco mais formal que “get back” ou “come back”.', 'The teacher will return our tests tomorrow.', 'A professora vai devolver nossas provas amanhã.'),
  I('rest-of-day', 'the rest of the day', 'the rest of the day', 'o resto do dia', 'time', 'Todo o tempo que ainda falta no dia.', 'It rained for the rest of the day.', 'Choveu o resto do dia.'),
  // 08
  I('up-bright-early', 'be up bright and early', 'up bright and early', 'estar de pé bem cedinho', 'collocation', 'Expressão alegre para “acordar bem cedo e com disposição”.', 'We need to be up bright and early for the trip.', 'Precisamos estar de pé bem cedinho para a viagem.', 'up very early'),
  I('first-things-first', 'first things first', 'first things first', 'primeiro o mais importante', 'connector', 'Usado para dizer o que vem antes de tudo.', 'First things first: wash your hands.', 'Primeiro o mais importante: lave as mãos.', 'first'),
  I('get-myself-ready', 'get myself ready', 'get myself ready', 'me arrumar, me aprontar', 'phrasal', 'Fazer tudo o que é preciso para ficar pronto: vestir, pentear.', 'Give me five minutes to get myself ready.', 'Me dá cinco minutos para eu me aprontar.'),
  I('pitch-in', 'pitch in', 'pitch in', 'ajudar, colaborar', 'phrasal', 'Entrar para ajudar num trabalho que é de todo mundo.', 'If we all pitch in, we’ll finish quickly.', 'Se todo mundo ajudar, a gente termina rápido.', 'help'),
  I('whatever-needs-doing', 'whatever needs doing', 'whatever needs doing', 'o que precisar ser feito', 'sentence', '“Whatever” = qualquer coisa que. Muito natural no inglês britânico.', 'I’m happy to do whatever needs doing.', 'Faço com prazer o que precisar ser feito.'),
  I('get-gear-on', 'get our gear on', 'get our gear on', 'vestir o nosso equipamento', 'phrasal', '“Gear” é o equipamento ou a roupa de uma atividade, como o kimono e a faixa.', 'Get your gear on — the match starts soon.', 'Vista o seu equipamento — o jogo já vai começar.'),
  I('chill-out', 'chill out', 'chill out', 'relaxar, ficar tranquilo', 'phrasal', 'Bem informal: descansar e ficar calmo.', "Let's chill out and watch a film.", 'Vamos relaxar e ver um filme.', 'relax'),
  I('show-up', 'show up', 'show up', 'aparecer, chegar', 'phrasal', 'Chegar ou aparecer num lugar. Igual a “turn up”.', 'The bus showed up ten minutes late.', 'O ônibus apareceu dez minutos atrasado.', 'arrive'),
  // 09
  I('get-things-done', 'get things done', 'get things done', 'resolver as coisas', 'collocation', 'Conseguir terminar o que precisa ser feito.', 'A list helps you get things done.', 'Uma lista ajuda você a resolver as coisas.', 'finish things'),
  I('start-by', 'start by', 'start by', 'começar (fazendo algo)', 'phrasal', '“Start by + -ing” mostra a primeira coisa que você faz.', 'Start by reading the question carefully.', 'Comece lendo a pergunta com atenção.'),
  I('take-care-of', 'take care of', 'take care of', 'cuidar de', 'collocation', 'Igual a “look after”: cuidar de alguém ou de algo.', 'Who takes care of the plants?', 'Quem cuida das plantas?'),
  I('sit-down-for', 'sit down for', 'sit down for', 'sentar para (comer)', 'phrasal', 'Sentar à mesa para fazer uma refeição com calma.', "Let's sit down for lunch.", 'Vamos sentar para almoçar.'),
  I('proper-breakfast', 'proper breakfast', 'proper breakfast', 'café da manhã de verdade', 'collocation', '“Proper” = de verdade, completo, como deve ser.', 'Have a proper breakfast, not just a biscuit!', 'Tome um café da manhã de verdade, não só um biscoito!', 'good breakfast'),
  I('crack-on-with', 'crack on with', 'crack on with', 'mandar ver em, continuar (sem enrolar)', 'phrasal', 'Bem britânico e informal: começar ou continuar algo com energia.', 'Right, let’s crack on with our project.', 'Bom, vamos mandar ver no nosso trabalho.', 'start'),
  I('by-half-past-eleven', 'by half past eleven', 'by half past eleven', 'até as onze e meia (no máximo)', 'time', '“By” + horário = antes ou no máximo naquele horário.', 'Be home by six o’clock.', 'Esteja em casa até as seis.'),
  I('wind-down', 'wind down', 'wind down', 'desacelerar, relaxar', 'phrasal', 'Ir se acalmando aos poucos depois de uma atividade.', 'A warm bath helps you wind down.', 'Um banho quentinho ajuda você a relaxar.', 'relax'),
  // 10
  I('ive-got-a-routine', "I've got a routine", "I've got a routine", 'eu tenho uma rotina', 'sentence', '“I’ve got” é muito usado no inglês britânico com o mesmo sentido de “I have”.', "I've got a question.", 'Eu tenho uma pergunta.', 'I have a routine'),
  I('get-everything-done', 'get everything done', 'get everything done', 'dar conta de tudo', 'collocation', 'Conseguir fazer tudo o que precisava.', 'Try to get everything done before the holiday.', 'Tente dar conta de tudo antes das férias.'),
  I('hearty-breakfast', 'hearty breakfast', 'hearty breakfast', 'café da manhã caprichado', 'collocation', '“Hearty” = farto e gostoso, que dá energia.', 'A hearty breakfast gives you lots of energy.', 'Um café da manhã caprichado dá bastante energia.', 'big breakfast'),
  I('home-again', 'home again', 'home again', 'em casa de novo', 'sentence', '“Again” = de novo. “Home again” = de volta em casa.', "It's nice to be home again after the trip.", 'É bom estar em casa de novo depois da viagem.'),
  I('pull-up', 'pull up', 'pull up', 'parar (um veículo chegando)', 'phrasal', 'Quando um carro ou ônibus chega e para na frente de um lugar.', 'A taxi pulled up outside our house.', 'Um táxi parou na frente da nossa casa.', 'arrive'),
  I('pretty-much', 'pretty much', 'pretty much', 'mais ou menos, praticamente', 'collocation', 'Informal: “quase totalmente”, “praticamente”.', "The film's pretty much finished.", 'O filme está praticamente no fim.'),
];
// vocabulário prioritário de cada sessão → ids (a ordem é a da lista aprovada)
const VOCAB_IDS = {
  1: ['wake-up', 'make-my-bed', 'feed-my-dog', 'clean-up-after', 'rubbish-out', 'help-around', 'freshen-up'],
  2: ['as-soon-as', 'head-downstairs', 'make-sure', 'look-after', 'once-ive', 'after-getting-dressed', 'later-on', 'while-we-wait'],
  3: ['get-out-of-bed', 'make-it-properly', 'look-after', 'sort-out', 'get-ready-for', 'jump-in-shower', 'household-chores', 'do-my-bit'],
  4: ['sit-around', 'lend-a-hand', 'housework', 'tidy-things-up', 'put-things-away', 'clear-away', 'finish-chores', 'spend-some-time'],
  5: ['help-out', 'get-ready-for', 'get-changed', 'twenty-to-ten', 'head-off', 'get-back', 'put-lead-on', 'take-him-out-walk', 'half-past-eleven'],
  6: ['get-back', 'grab', 'head-outside', 'stay-out', 'freshen-up', 'make-our-way', 'kick-back', 'turn-up'],
  7: ['keep-an-eye-on', 'filling-breakfast', 'get-on-with', 'training-days', 'leave', 'return', 'rest-of-day'],
  8: ['up-bright-early', 'first-things-first', 'sort-out', 'get-myself-ready', 'pitch-in', 'whatever-needs-doing', 'get-gear-on', 'chill-out', 'show-up'],
  9: ['get-things-done', 'start-by', 'take-care-of', 'sit-down-for', 'proper-breakfast', 'crack-on-with', 'by-half-past-eleven', 'wind-down'],
  10: ['ive-got-a-routine', 'get-everything-done', 'hearty-breakfast', 'lend-a-hand', 'head-off', 'get-back', 'home-again', 'kick-back', 'pull-up', 'pretty-much'],
};

// ---------- perguntas: duas de compreensão/conversa com resposta-modelo (tiradas do texto) + produção livre ----------
const Q = (n, q, a, kw, ids, facts) => ({ n, q, a, keywords: kw, items: ids.map((x) => `lk.${x}`), facts, kind: 'conv' });
const T = (n, q, hint, ids, facts) => ({ n, q, a: '', hint, openPersonal: true, items: ids.map((x) => `lk.${x}`), facts, kind: 'transfer' });
const QUESTIONS = [
  Q(1, 'What time do you wake up?', 'I usually wake up very early in the morning.', [['wake up', 'get up'], ['early']], ['wake-up'], ['F01']),
  Q(1, 'What do you do after breakfast?', 'After breakfast, I take a shower and help around the house with some chores.', [['shower'], ['help', 'chores']], ['help-around'], ['F07', 'F08']),
  T(1, 'Now, tell me about your morning without reading the text.', 'Conte do seu jeito, sem olhar o texto. Tente usar: wake up, make my bed, feed my dog, take the rubbish out, freshen up.', ['wake-up', 'make-my-bed', 'feed-my-dog', 'rubbish-out', 'freshen-up'], ['F01', 'F02', 'F03', 'F05', 'F09']),
  Q(2, 'What do you do as soon as you get up?', 'As soon as I get up, I tidy my bed and head downstairs.', [['bed'], ['downstairs']], ['as-soon-as', 'head-downstairs'], ['F02']),
  Q(2, 'What do you and your brother do while you wait for your school transport?', 'We go downstairs to relax and watch TV while we wait for our school transport.', [['watch', 'tv', 'television'], ['relax', 'downstairs']], ['while-we-wait'], ['F09', 'F10']),
  T(2, 'Now, tell me about your morning in order, without reading the text.', 'Use palavras de sequência: first, as soon as, once, then, after that, later on.', ['as-soon-as', 'once-ive', 'later-on'], ['F01', 'F02', 'F06', 'F07']),
  Q(3, 'How do you look after your dog?', "I take his food downstairs, and once he's eaten, I clean up after him and sort out any mess.", [['food', 'feed'], ['clean']], ['look-after', 'sort-out'], ['F03', 'F04']),
  Q(3, 'What do you do after eating?', 'After eating, I jump in the shower and help with the household chores.', [['shower'], ['chores', 'help']], ['jump-in-shower', 'household-chores'], ['F07', 'F08']),
  T(3, 'Now, tell me how you look after your dog, without reading the text.', 'Tente usar: look after, feed, clean up after him, sort out.', ['look-after', 'sort-out', 'clean-up-after'], ['F03', 'F04']),
  Q(4, 'What do you do around the house?', 'I usually lend a hand with the housework, such as tidying things up and putting things away.', [['help', 'lend a hand'], ['tidy', 'put', 'clean']], ['lend-a-hand', 'housework'], ['F08']),
  Q(4, "What do you do once you've finished your chores?", "Once I've finished my chores, I go upstairs to freshen up.", [['freshen up', 'get ready', 'shower'], ['upstairs', 'brother', 'living room']], ['finish-chores', 'freshen-up'], ['F09']),
  T(4, 'Now, tell me how you help around the house, without reading the text.', 'Tente usar: lend a hand, tidy things up, put things away, housework.', ['lend-a-hand', 'tidy-things-up', 'put-things-away'], ['F08']),
  Q(5, 'What happens on jiu-jitsu days?', 'At twenty to ten, my brother and I get changed and head off to class. We get back home at eleven.', [['twenty to ten', '9:40', 'nine forty'], ['class', 'training', 'jiu-jitsu']], ['get-changed', 'head-off'], ['F12', 'F13']),
  Q(5, 'What time do you get back home?', "We get back home at eleven o'clock.", [['eleven', '11']], ['get-back'], ['F13']),
  T(5, 'Now, tell me about a jiu-jitsu day without reading the text.', 'Diga os horários: twenty to ten, eleven o’clock, half past eleven. Tente usar: get changed, head off, get back, put the lead on.', ['get-changed', 'head-off', 'get-back', 'put-lead-on'], ['F11', 'F12', 'F13', 'F14']),
  Q(6, 'What do you do when you get back from jiu-jitsu?', "We grab our dog's lead, put it on him and head outside for a walk.", [['dog'], ['walk', 'outside']], ['get-back', 'grab', 'head-outside'], ['F14']),
  Q(6, 'How long do you stay out with your dog?', 'We usually stay out for about half an hour.', [['half an hour', 'thirty minutes']], ['stay-out'], ['F14']),
  T(6, 'Now, tell me what you do after jiu-jitsu, without reading the text.', 'Use alguns phrasal verbs: get back, head outside, stay out, freshen up, kick back.', ['get-back', 'head-outside', 'kick-back'], ['F14', 'F15', 'F10']),
  Q(7, 'Why do you have to keep an eye on the time?', 'Because my morning is quite busy.', [['busy']], ['keep-an-eye-on'], ['F01']),
  Q(7, 'What time do you leave for training?', 'My brother and I leave at twenty to ten.', [['twenty to ten', '9:40', 'nine forty']], ['leave', 'twenty-to-ten'], ['F12']),
  T(7, 'Now, tell me about your morning step by step, with the times, without reading the text.', 'Diga a ordem e os horários: first, then, after that, at twenty to ten, at eleven.', ['keep-an-eye-on', 'get-on-with', 'training-days'], ['F01', 'F12', 'F13']),
  Q(8, 'What do you do first thing in the morning?', "First things first, I sort out my dog's breakfast and clean up after him.", [['dog'], ['breakfast', 'clean']], ['first-things-first', 'sort-out'], ['F03', 'F04']),
  Q(8, 'What do you do until your school ride shows up?', 'We chill out in the living room and watch TV.', [['tv', 'television'], ['relax', 'chill out', 'living room']], ['chill-out', 'show-up'], ['F09', 'F10']),
  T(8, 'Now, tell me about a typical day at home in a relaxed way, without reading the text.', 'Fale como numa conversa: first things first, pitch in, chill out, show up.', ['first-things-first', 'pitch-in', 'chill-out'], ['F03', 'F08', 'F10']),
  Q(9, 'How do you start your morning?', 'I start by making my bed and taking care of my dog.', [['bed'], ['dog']], ['start-by', 'take-care-of'], ['F02', 'F03']),
  Q(9, 'Where are you by half past eleven on training days?', "By half past eleven, we're back from walking the dog and ready to wind down.", [['back', 'home'], ['dog', 'walk']], ['by-half-past-eleven', 'wind-down'], ['F14']),
  T(9, 'Now, tell me how you keep your morning organised, without reading the text.', 'Tente usar: get things done, start by, crack on with, wind down.', ['get-things-done', 'start-by', 'crack-on-with', 'wind-down'], ['F02', 'F08', 'F14']),
  Q(10, 'What do you do before going to school?', 'I watch TV with my brother until our school minibus pulls up at around twelve forty.', [['tv', 'television'], ['minibus', 'bus', 'school']], ['pull-up', 'kick-back'], ['F10']),
  Q(10, 'How do you spend your morning on jiu-jitsu days?', 'My brother and I get changed and head off to training at twenty to ten. We get back at eleven and take the dog out for a walk.', [['twenty to ten', '9:40', 'nine forty'], ['dog', 'walk']], ['get-changed', 'head-off', 'get-back'], ['F12', 'F13', 'F14']),
  T(10, 'Now, tell me the full story of your morning, without reading the text.', 'Conte a manhã inteira, de acordar até o transporte escolar, e o que muda nos dias de jiu-jitsu. Use o que você aprendeu nas dez sessões.', ['ive-got-a-routine', 'get-everything-done', 'head-off', 'get-back', 'kick-back', 'pull-up'], ['F01', 'F08', 'F10', 'F12', 'F13', 'F14']),
];

// ---------- montagem ----------
const fail = (m) => { throw new Error(m); };
const itemsById = new Map(ITEMS.map((it) => [it.id, it]));
const introduced = new Set();
const routines = SESSIONS.map((s) => {
  const rid = `L${String(s.n).padStart(2, '0')}`;
  const sents = s.blocks.flatMap((b) => b[2]);
  if (sents.map((x) => x[0]).join(' ') !== TEXTS[rid]) fail(`${rid}: as frases não reproduzem o texto aprovado`);
  const ids = VOCAB_IDS[s.n].map((x) => `lk.${x}`);
  for (const id of ids) if (!itemsById.has(id)) fail(`${rid}: expressão ${id} sem cadastro`);
  ids.forEach((id) => introduced.add(id));
  // cada frase: expressões desta sessão + expressões de sessões anteriores que reaparecem nela (revisão cumulativa)
  const blocks = s.blocks.map(([ctx, title, list]) => ({ pt: title, ctx: [ctx], sentences: list.map(([en, pt, facts]) => ({
    en, pt, facts, items: [...introduced].filter((id) => locate({ ...itemsById.get(id), c: itemsById.get(id).c }, en)),
  })) }));
  for (const id of ids) if (!blocks.some((b) => b.sentences.some((x) => x.items.includes(id)))) fail(`${rid}: “${itemsById.get(id).en}” não foi localizada no texto`);
  return { id: rid, title: s.title, pt: `Sessão ${String(s.n).padStart(2, '0')} · ${s.pt}`, dayType: 'session', priority: false, goal: s.objective, usage: [],
    kind: 'session', grammar: s.grammar, session: { n: s.n, focus: s.focus, level: s.level, vocab: s.vocab, vocabIds: ids }, blocks };
});
const questions = QUESTIONS.map((q, i) => {
  const rid = `L${String(q.n).padStart(2, '0')}`;
  const { n, ...rest } = q;
  return { id: `L.Q${i + 1}`, routine: rid, ...rest };
});
const pack = {
  _doc: 'Pacote do Lukinhas (id interno lucas-kid, 11 anos) — GERADO por tools/lukinhas-source.mjs a partir dos dez textos definitivos aprovados (Daily Routine do Lukinhas). Textos em inglês sem alteração; traduções, explicações, exemplos adicionais e perguntas são conteúdo de apoio do app. Personagem narrativo fixo: não é perfil de usuário. Dias da semana dos treinos não informados (não atribuir).',
  id: 'lucas-kid', name: 'Lukinhas', short: 'Lukinhas', status: 'active', audience: 'child', age: 11, idPrefix: 'L', itemPrefix: 'lk.',
  audio: { voice: 'bm_lewis' },
  profile: {
    summary: 'Tem 11 anos. De manhã, antes da escola, cuida do cachorro, ajuda em casa e vê TV com o irmão até o transporte escolar chegar (por volta de 12h40). Em alguns dias, faz jiu-jitsu com o irmão.',
    family: 'Pai e irmão aparecem nas rotinas; o cachorro é da família.',
    notProvided: ['dias da semana dos treinos de jiu-jitsu', 'nome do cachorro', 'nome do irmão', 'escola'],
    source: 'Daily Routine do Lukinhas — dez textos definitivos aprovados pelo usuário.',
  },
  visual: { dir: 'assets/characters/lucas-kid', ext: 'png', states: Object.fromEntries(['idle', 'thinking', 'correct', 'wrong', 'celebrate', 'levelup'].map((st) => [st, { file: st.toUpperCase(), status: 'pending' }])) },
  facts: FACTS,
  themes: [],
  routines,
  items: ITEMS.map(({ plain, ...it }) => ({ ...it, lvl: 1, ctx: ['morning'], ...(plain ? { plain } : {}) })),
  questions,
};
const unused = ITEMS.filter((it) => !routines.some((r) => r.blocks.some((b) => b.sentences.some((s) => s.items.includes(it.id)))));
if (unused.length) fail(`expressões sem frase: ${unused.map((x) => x.id).join(', ')}`);
writeFileSync(join(ROOT, 'content/characters/lucas-kid.json'), JSON.stringify(pack, null, 1) + '\n');
console.log(JSON.stringify({ sessions: routines.length, sentences: routines.reduce((n, r) => n + r.blocks.reduce((m, b) => m + b.sentences.length, 0), 0), items: ITEMS.length, questions: questions.length }));
