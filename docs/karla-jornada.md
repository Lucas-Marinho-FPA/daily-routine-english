# Karla — jornada de aprendizagem

Fonte editorial: **Character Bible — Karla v1.0** (fornecida pelo usuário em 2026-10-26) e a rotina informada antes. Fonte técnica: `content/characters/karla.json` → `data/characters.js` (gerado por `tools/build-characters.mjs`).

> A personagem dá contexto. O contexto torna a língua significativa. A prática transforma esse contato em aprendizagem.

## Decisões de arquitetura

- **Nenhum sistema paralelo.** A jornada usa o motor que já existe: a ordem dos episódios no pacote é a ordem em que o motor apresenta os itens novos; frases, blocos, a rotina completa e as perguntas abrem pela mesma escada de habilidades de sempre (reconhecer → lembrar → completar; montar → escrever; ordenar → contar o bloco → contar tudo; responder). XP, níveis, revisão espaçada e armazenamento não mudaram.
- **Etapas A–D são metadados pedagógicos** (mostrados na tela do episódio), não níveis novos. O nível de cada item (`lvl` 1–3) continua sendo o do app.
- **Duas camadas de conteúdo.**
  - *Rotina-base* (K01–K03, `kind: routine`): só fatos informados; cada frase aponta para o fato de origem. IDs e textos de 482ec74 preservados (o progresso de quem já praticou continua apontando para as mesmas frases); só foram acrescentados um bloco no **fim** do K02, itens em frases existentes e metadados.
  - *Episódios* (K04–K11, `kind: episode`): situações ilustrativas criadas para a prática, ancoradas em fatos do perfil (`basis`). Não viram fatos biográficos. A tela mostra “Situação ilustrativa”.
- **Diálogos** com a menor extensão possível: bloco `kind: dialogue` e frase `speaker`. A tradução leva “Nome: …”, então os exercícios (montar, escrever, ordenar falas) funcionam sem mudança; só a tela do episódio desenha uma fala por linha.
- **Perguntas** em três tipos, todos no formato existente: conversa (responder como a Karla), compreensão (sobre a Karla, em 3ª pessoa) e **transferência** (sobre o aluno — `openPersonal` + dica, o mesmo mecanismo da pergunta pessoal do Lucas).
- **Revisão cumulativa** pela reutilização de itens: um item usado em vários episódios ganha exemplos de todos eles e volta na revisão espaçada; uma frase nova só abre quando metade dos itens dela já foi vista. O build calcula `reuse` (em que episódios cada item aparece) e os testes exigem retomada.
- **Ajuste no motor, mínimo e comprovado:** a avaliação oral tratava `myself`/`herself` como palavras de conteúdo; com as perguntas de compreensão em 3ª pessoa isso gerava aviso âmbar falso. Os pronomes reflexivos e possessivos (`mine`, `hers`…) entraram na lista de palavras funcionais de `engine/coherence.js` (vale para todos os personagens e só reduz falsos alarmes).

## Mapa da jornada

| Ordem | Episódio | Etapa | Objetivo comunicativo | Foco da língua | Blocos (diálogo) | Frases | Itens | Perguntas (conv/comp/transf.) |
|---|---|---|---|---|---|---|---|---|
| 1 | **K01** A Normal Workday — Dia de trabalho normal (rotina-base) *(rotina-base, fatos)* | A | Descrever o dia normal da Karla em ordem: manhã, alunos de personal, almoço e treino, Pilates, último aluno e noite com a família. | Present Simple; horas (at around, from… to…); sequência do dia. | 6 (0) | 12 | 21 | 5/0/0 |
| 2 | **K02** A Shorter Day (Tuesdays and Thursdays) — Dia mais curto (terças e quintas) *(rotina-base, fatos)* | A | Contar o que muda nas terças e quintas: aulas até as 15h, treino às 16h e chegada em casa mais cedo. | Present Simple para dias específicos (on Tuesdays…); earlier / later; contraste com o dia normal. | 2 (0) | 6 | 9 | 1/1/0 |
| 3 | **K03** When Plans Change — Quando os planos mudam (possibilidades) *(rotina-base, fatos)* | A | Falar de mudanças que PODEM acontecer: cancelamento, aula de spinning, corrida. Use “when”, “if” e “can”. | when / if + Present Simple; can para possibilidades. | 3 (0) | 3 | 6 | 1/0/0 |
| 4 | **K04** Evenings at Home — Noites em casa | A | Falar da família e da noite em casa: chegada, conversa no jantar, lição de casa e hora de dormir. | Present Simple (hábitos da família); perguntas com How / Have you…?; can para pedidos. | 3 (1) | 11 | 22 | 1/1/1 |
| 5 | **K05** Teaching a Pilates Class — Dando uma aula de Pilates | B | Dar e entender instruções de movimento numa aula de Pilates e descrever o que está acontecendo agora. | Imperativo (Lie…, Keep…, Move…); Present Continuous para o que está acontecendo; because. | 3 (1) | 11 | 19 | 1/1/1 |
| 6 | **K06** A Session with a Client — Uma sessão com uma aluna | B | Conduzir o começo de uma sessão: perguntar como a pessoa está, ajustar o plano e dar orientações curtas. | Perguntas (How are you feeling?); advérbios de frequência (often); let's / can para propostas; so. | 3 (1) | 10 | 21 | 2/1/1 |
| 7 | **K07** Coffee and a Good Book — Café e um bom livro | B | Falar de preferências e de pequenos prazeres: café especial, leitura e um momento de calma. | like / enjoy / prefer + -ing; I'd rather… than…; adjetivos sensoriais; Would you like…? | 3 (1) | 10 | 19 | 2/0/1 |
| 8 | **K08** Studying Nutrition and Biomechanics — Estudando Nutrição e Biomecânica | C | Falar dos estudos: o que está aprendendo, uma dificuldade, como a resolveu e um prazo com uma colega. | Present Continuous para estudos em andamento; Past Simple (last night, had to, looked up); because / so. | 3 (1) | 11 | 25 | 1/1/1 |
| 9 | **K09** A Tuesday That Didn't Go to Plan — Uma terça que não saiu como planejado | C | Contar um dia em que os planos mudaram: o problema, as opções, a decisão e o que aprendeu. | Past Simple (regulares e irregulares); could para opções; decide to; comparativo (shorter than). | 3 (0) | 9 | 26 | 1/1/1 |
| 10 | **K10** Getting Ready for Hyrox — Preparando-se para o Hyrox | D | Falar de uma meta: o desafio, o plano de treino, o que vai melhorar e o que fazer se estiver cansada. | be going to / will; comparativos (stronger than); If…, I might…; want to + verbo. | 3 (1) | 11 | 23 | 2/1/1 |
| 11 | **K11** Sunday: Planning the Week Ahead — Domingo: planejando a semana | D | Planejar a semana com prioridades, prever imprevistos com “if” e refletir sobre equilíbrio. | will / first conditional (If…, I'll…); prioridades e intenções; revisão das estruturas da jornada. | 3 (0) | 10 | 20 | 2/1/1 |

Personagens secundários: **Sophie** (aluna, K06) e **Ana** (colega de pós, K08) são fictícios; a família aparece como *younger son*, *older son* e *husband*, sem nomes (não informados).

## Matriz de reutilização (itens em dois ou mais episódios)

O exemplo pedido — **schedule** — aparece no trabalho (K06), num imprevisto (K09) e no planejamento da semana (K11), e a pergunta de transferência do K11 pede ao aluno que organize a própria semana.

| Item | Episódios |
|---|---|
| it.because | K04 → K05 → K07 → K08 → K09 |
| it.so | K02 → K06 → K08 → K11 |
| client | K06 → K08 → K09 → K11 |
| it.later | K02 → K09 → K11 |
| club | K01 → K03 → K05 |
| go for a run | K03 → K09 → K11 |
| schedule | K06 → K09 → K11 |
| tired | K04 → K06 → K10 |
| it.at-around | K01 → K02 |
| it.get-home | K01 → K02 |
| it.have-dinner | K01 → K04 |
| it.usually | K01 → K04 |
| after dinner | K04 → K09 |
| always | K04 → K11 |
| assignment | K08 → K09 |
| at lunchtime | K03 → K11 |
| at the end of | K05 → K06 |
| catch up on | K09 → K11 |
| demanding | K08 → K10 |
| do my own workout | K01 → K02 |
| feel better | K06 → K09 |
| group Pilates class | K01 → K05 |
| keep your back straight | K05 → K06 |
| make time for | K10 → K11 |
| of course | K04 → K10 |
| often | K04 → K06 |
| plan the next day | K01 → K04 |
| recovery | K08 → K10 |
| take a deep breath | K05 → K09 |

### Estruturas ao longo da jornada

| Estrutura | Apresentada | Retomada |
|---|---|---|
| Present Simple (rotina e hábitos) | K01–K02 | K04, K06, K07, K11 |
| when / if + presente; can | K03 | K04 (pedidos), K06 (we can), K11 (if… I'll) |
| Imperativo (instruções) | K05 | K06 (keep, control), transferência do K05 |
| Present Continuous | K05 (agora) | K08 (estudos em andamento), K10 (are getting longer) |
| Preferências (enjoy / prefer / I'd rather) | K07 | transferência do K07 |
| Past Simple | K04 (had a test), K08 | K09 (narrativa completa) |
| could / might (opções e possibilidade) | K09 (could) | K10 (might), K11 |
| going to / will | K10 | K11 |
| Conectores because / so | K02, K05 | K06, K07, K08, K09, K11 |

## Qualidade e cuidado com o tema

- Inglês britânico: *flavour, speciality, maths, Mum, cancelled, learnt, organise, term, Shall we…?*; o corretor continua aceitando a grafia americana nas respostas.
- Saúde e treino: frases descrevem estudo, sensações e decisões da personagem (“I'm reading about protein and recovery”); nenhuma prescrição (“you should eat…”). Os testes barram termos como *detox*, *burn fat*, *cure*.
- Nada de idade dela, sobrenome, cidade, nomes da família, nome/profissão do marido, nome do clube ou meio de transporte (testado).

## Backlog

| Prioridade | Item | Por quê |
|---|---|---|
| Alta | Áudio britânico pré-gerado para as 104 frases, itens e perguntas da Karla | Hoje a Karla usa a voz do aparelho (offline, qualidade variável). `tools/gen_audio.py` ainda lê só o manifesto do Lucas. |
| Alta | Revisão humana dos episódios (falante nativo/professor) | Conteúdo novo; revisado aqui por regras e testes, não por um professor. |
| Média | Tabela de verbos (3ª pessoa) e drills próprios da Karla | O motor tem esses exercícios; o pacote ainda não fornece dados para eles. |
| Média | Episódios do fim de semana (sábado) e “Friday and Family Time” da Character Bible | Ficaram fora do MVP; as estruturas já estão na jornada (K09–K11). |
| Média | Textos do Início e da tela da rotina ainda ligados ao Lucas (“Para a próxima aula”, “Treino para a aula”, “Perguntas da teacher”) | Precisam de decisão de produto para cada personagem. |
| Baixa | Exibir quem fala também nos exercícios de montar/escrever (hoje está na tradução) | Só se a tradução com “Nome:” se mostrar insuficiente no uso real. |
| Baixa | Aplicar a mesma abordagem ao Lucas (episódios + transferência) | Pedido para uma etapa futura; não altera o Lucas agora. |
| Fora de escopo | Avatares e as seis expressões | Estados declarados e pendentes; requisitos visuais inalterados. |
