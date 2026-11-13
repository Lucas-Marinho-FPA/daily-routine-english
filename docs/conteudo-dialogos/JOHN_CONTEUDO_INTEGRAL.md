# The Story of John — conteúdo integral (Partes 1 a 7)

Compilação gerada em 2026-11-12 a partir dos arquivos já extraídos em `docs/conteudo-dialogos/` (gerador `dev/tools/extract-dialogue-content.mjs`, leitura das fontes do repositório). **As seções abaixo são cópias literais desses arquivos**, sem resumo, tradução nova ou correção. Nada no aplicativo ou nos dados foi alterado.

## Legenda de status (leia antes)

- **Validação pelo professor:** **nenhum conteúdo de The Story of John consta como validado pelo professor.** Todas as atividades trazem “tradução: referência autoral — não validada pelo professor”; o pacote declara “Traduções = referência autoral, não validadas pelo professor”.
- **Questões de compreensão (403):** geradas para o projeto a partir do texto dos diálogos (por IA, metodologia própria do DRE), integradas por decisão do PO de 2026-11-11; **validação da Base de Conhecimento pendente** (HANDOFF, demanda D-003).
- **Correções (6 falas):** aprovadas pelo **Product Owner** em 2026-11-11 (não pelo professor). O app usa o texto **corrigido**; o **original da fonte** aparece em cada atividade, em “Falas corrigidas”, e na seção de correções do relatório. Os Markdown de origem não foram alterados.
- **No aplicativo:** falas, traduções, itens de vocabulário (183), notas e questões listados por atividade.
- **Não integrado ao aplicativo:** (a) os **89 itens** de tabelas da fonte sem atividade correspondente (seção “Itens das tabelas da fonte sem atividade correspondente” de cada parte); (b) o **conteúdo da fonte fora do app**, reproduzido literalmente com número de linha no fim de cada parte — elenco, exercícios **Practice** (A. Comprehension, B. Translate into English, C. Personal production), **Suggested answers**, seções complementares e notas que não viraram dados.
- **Informação indisponível:** sinalizada com “—” (ex.: atividade sem itens curados, item que não aparece literalmente nas falas). Itens não têm exemplos próprios nos dados; os exemplos são as falas relacionadas.
- **Áudio:** cada fala e cada item trazem a chave do áudio (`audio/<chave>.ogg`) e a voz; a relação completa está no Anexo C.
- **Duplicidades:** não foram descartadas; estão identificadas no Anexo D.

## Sumário

- Documentos gerais da fonte e elenco
- Parte 1 — Getting to Know John
- Parte 2 — Work, Studies and Everyday Life
- Parte 3 — Family, Friends and Relationships
- Parte 4 — Opinions, Sports and Social Life
- Parte 5 — Business Calls and Social Arrangements
- Parte 6 — Shopping, Clothes and Everyday Services
- Parte 7 — Travelling and Unexpected Situations
- Anexo A — Inventário de itens por classificação
- Anexo B — Relatório da conversão (decisões, avisos, correções aprovadas, origem das questões)
- Anexo C — Relação de áudios de The Story of John
- Anexo D — Pendências, divergências e duplicidades de The Story of John

---

# The Story of John — documentos gerais da fonte (literal)

Arquivos da pasta-fonte que não são partes do diálogo (instruções e nota de integração). Reproduzidos sem alteração.

## `dev/content/dialogues/source/the-story-of-john/00_LEIA-ME.md`

```markdown
# THE STORY OF JOHN — Pacote das sete partes

## Conteúdo
Este pacote contém sete partes narrativas autorais, com diálogos em inglês e tradução imediata para português brasileiro, explicações gramaticais contextualizadas, vocabulário, expressões, phrasal verbs e atividades com respostas sugeridas.

## Ordem
1. Getting to Know John
2. Work, Studies and Everyday Life
3. Family, Friends and Relationships
4. Opinions, Sports and Social Life
5. Business Calls and Social Arrangements
6. Shopping, Clothes and Everyday Services
7. Travelling and Unexpected Situations

## Critério editorial
- Inglês britânico como referência predominante.
- Personagens e sobrenomes criados para esta narrativa.
- A narrativa e os diálogos desta edição são autorais.
- O acervo original das quatro partes deve continuar preservado separadamente.
- Os elementos linguísticos foram distribuídos por afinidade temática com base no inventário e nos conteúdos visíveis dos acervos.
- Traduções dos diálogos novos são versões de referência autorais, não traduções validadas pelo professor.
- Respostas de produção pessoal são abertas e podem variar.

## Nota de rastreabilidade
A edição atual reaproveita os principais núcleos identificados nas quatro partes: apresentações, profissões, Present Simple/Continuous/Perfect, família, parentesco, comparativos/superlativos, leitura e compreensão, opiniões, corrida/ordinais, telefonemas, pedidos com Could/Would, horários britânicos, convites, roupas/compras, atrasos, viagens, voos e phrasal verbs de transporte e telefonia.

A conferência editorial integral identificou e tratou lacunas de cobertura por meio de seções complementares nas sete partes: profissões e ações menos frequentes; estudos e futuro com intenção; frequência, parentesco e idades; opiniões, comparativos e eventos sociais; narração de corrida e ordinais; sentidos contextuais de phrasal verbs; pedidos educados; horários, atrasos, reclamações, direções e transportes. A cobertura foi verificada por núcleo linguístico/exercício e pelos exemplos relevantes do acervo. O acervo original validado permanece preservado separadamente; estas partes são uma adaptação narrativa autoral, não uma cópia integral nem substituto do acervo.

**Limite de rastreabilidade:** não se afirma equivalência textual linha a linha: os diálogos foram reescritos para a narrativa de John, preservando os objetivos e os itens linguísticos identificados. Respostas/traduções autorais novas não herdam automaticamente a validação docente dos arquivos de origem.

## Elenco recorrente
- John Bennett — protagonista.
- Jhessyka “Jessy” Whitmore — amiga de John e Rick.
- Ruan Parker — amigo de Rick, organizador de eventos.
- Rick Thompson — amigo de John desde a universidade.
- Mary Collins — colega de John.
- Stuart Hughes — tio de John.
- Peter Walker — amigo e vizinho de John.
- Rodri Morgan — sobrinho de John.
- Penelope Clarke — sobrinha de John.
- Joana Fletcher — prima de John.
- Ana Mitchell — irmã de John.
- Ketlyn Brooks — colega de Jessy.

Os sobrenomes e as relações acima são decisões autorais desta narrativa.

```

## `dev/content/dialogues/source/the-story-of-john/00_NOTA_DE_INTEGRACAO.md`

```markdown
# Nota de Integração — The Story of John

Os sete documentos desta pasta são o conteúdo narrativo autoral preparado para a nova experiência. Eles devem ser integrados como conteúdo, não tratados como especificação de UI nem executados diretamente como código.

Antes de publicar:
- mapear diálogos, falas, vocabulário, phrasal verbs, collocations, atividades, respostas e traduções para o schema real;
- gerar IDs estáveis sem sobrescrever IDs existentes;
- verificar áudio por item/fala;
- identificar cobertura incompleta e itens sem áudio;
- manter proveniência e status de validação;
- não presumir que a adaptação narrativa seja uma auditoria linha a linha de cada item dos acervos Ian.

```

## Elenco do pacote (`cast`)

| Id | Nome |
|---|---|
| rick | Rick |
| john | John |
| mary | Mary |
| ruan | Ruan |
| jessy | Jessy |
| ketlyn | Ketlyn |
| role-student | Student |
| role-new-colleague | New colleague |
| peter | Peter |
| ana | Ana |
| stuart | Stuart |
| role-commentator | Commentator |
| role-receptionist | Receptionist |
| role-shop-assistant | Shop assistant |
| role-passer-by | Passer-by |
| role-station-employee | Station employee |
| role-announcement | Announcement |
| role-travel-agent | Travel agent |
| role-passenger | Passenger |
| role-staff-member | Staff member |

---

# The Story of John — Parte 1: Getting to Know John

**Pacote:** The Story of John (`the-story-of-john`, conteúdo `118297cacc48`, idioma en-GB) · **Parte:** `john-p1` · **Arquivo-fonte:** `dev/content/dialogues/source/the-story-of-john/01_Getting_to_Know_John.md`

**Origem do pacote (literal):** Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.

**Atividades:** 9 (9 episódios, 0 mini-diálogos) · **Falas:** 55 · **Itens:** 46 · **Questões:** 81

## Atividades

- [`john-p1-e01` — A familiar face](#episode-1-a-familiar-face)
- [`john-p1-e02` — What does everyone do?](#episode-2-what-does-everyone-do)
- [`john-p1-e03` — A little about John](#episode-3-a-little-about-john)
- [`john-p1-e04` — Family and free time](#episode-4-family-and-free-time)
- [`john-p1-e05` — What are they doing?](#episode-5-what-are-they-doing)
- [`john-p1-e06` — More friends, more connections](#episode-6-more-friends-more-connections)
- [`john-p1-e07` — A university course](#episode-7-a-university-course)
- [`john-p1-e08` — People and what they do](#episode-8-people-and-what-they-do)
- [`john-p1-e09` — Past events and relationships](#episode-9-past-events-and-relationships)

## Conteúdo por atividade

### Episode 1 — A familiar face

**Id:** `john-p1-e01` · **Tipo:** episódio · **Ordem na parte:** 1 · **Título:** A familiar face

**Contexto (literal):** John encontra Rick numa pequena cafeteria perto do trabalho.

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 24 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e01-l01 | Rick (`rick`) | John Bennett? Do you remember me? | John Bennett? Você se lembra de mim? | 026becd7 | bm_lewis | 01_Getting_to_Know_John.md:24 / 25 |
| 2 | john-p1-e01-l02 | John (`john`) | Of course! We met at university, didn't we? | Claro! Nós nos conhecemos na universidade, não foi? | d42d08b5 | bm_george | 01_Getting_to_Know_John.md:27 / 28 |
| 3 | john-p1-e01-l03 | Rick (`rick`) | That's right. What are you doing these days? | Isso mesmo. O que você está fazendo atualmente? | 7ad0cdc9 | bm_lewis | 01_Getting_to_Know_John.md:30 / 31 |
| 4 | john-p1-e01-l04 | John (`john`) | I'm working for a technology company in Manchester. | Estou trabalhando para uma empresa de tecnologia em Manchester. | b930fc3c | bm_george | 01_Getting_to_Know_John.md:33 / 34 |
| 5 | john-p1-e01-l05 | Rick (`rick`) | Really? What do you do there? | Sério? O que você faz lá? | 95005377 | bm_lewis | 01_Getting_to_Know_John.md:36 / 37 |
| 6 | john-p1-e01-l06 | John (`john`) | I'm a project analyst. I usually work with different teams, but this week I'm helping the sales department. | Sou analista de projetos. Normalmente trabalho com equipes diferentes, mas esta semana estou ajudando o departamento de vendas. | f4d22b85 | bm_george | 01_Getting_to_Know_John.md:39 / 40 |
| 7 | john-p1-e01-l07 | Rick (`rick`) | That sounds interesting. | Isso parece interessante. | 20b6ca30 | bm_lewis | 01_Getting_to_Know_John.md:42 / 43 |

**Falas corrigidas (decisão do PO de 2026-11-11; o app usa o texto corrigido, a fonte continua com o original):**

- `john-p1-e01-l01` — original da fonte: “Do you remember John Bennett?” / “Você se lembra do John Bennett?”
  - motivo: Abertura ambígua: Rick perguntava ao próprio John se ele se lembrava de John Bennett. Agora Rick reconhece John e pergunta se John se lembra dele, o que combina com a resposta (“We met at university, didn't we?”).
  - motivo: Mesma correção na tradução.

#### Itens de vocabulário (8)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p1-e01-v01 | chunk | these days | = | atualmente / hoje em dia | john-p1-e01-l03 | 8e416243 | Vocabulary & chunks | 01_Getting_to_Know_John.md:61 |
| john-p1-e01-v02 | expressão | work for a company | = | trabalhar para uma empresa | — (não aparece literalmente) | ff0a57a3 | Vocabulary & chunks | 01_Getting_to_Know_John.md:62 |
| john-p1-e01-v03 | chunk | project analyst | = | analista de projetos | john-p1-e01-l06 | 720af6ec | Vocabulary & chunks | 01_Getting_to_Know_John.md:63 |
| john-p1-e01-v04 | chunk | sales department | = | departamento de vendas | john-p1-e01-l06 | 756cfa37 | Vocabulary & chunks | 01_Getting_to_Know_John.md:64 |
| john-p1-e01-v05 | chunk | different teams | = | equipes diferentes | john-p1-e01-l06 | 6e9d8df4 | Vocabulary & chunks | 01_Getting_to_Know_John.md:65 |
| john-p1-e01-v06 | chunk | this week | = | esta semana | john-p1-e01-l06 | 310eb6d3 | Vocabulary & chunks | 01_Getting_to_Know_John.md:66 |
| john-p1-e01-v07 | expressão | That sounds interesting. | = | Isso parece interessante. | john-p1-e01-l07 | cd684270 | Vocabulary & chunks | 01_Getting_to_Know_John.md:67 |
| john-p1-e01-v08 | expressão | What do you do? | = | O que você faz? (profissão) | john-p1-e01-l05 | b9f7a551 | Vocabulary & chunks | 01_Getting_to_Know_John.md:68 |

#### Notas pedagógicas (1) — literal

### Language focus — Present Simple × Present Continuous
- **Present Simple:** rotina, profissão, hábitos e factos relativamente estáveis.  
  *I work with different teams.* — Trabalho com equipes diferentes.
- **Present Continuous:** ação em andamento ou situação temporária.  
  *I'm helping the sales department this week.* — Estou ajudando o departamento de vendas esta semana.
Estruturas:
- I/you/we/they **work**.
- he/she **works**.
- I **am working**; he/she **is working**; we/they **are working**.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e01-q01** (relation) — Where did John and Rick meet for the first time?
  - **(correta)** a) At university
  - b) At a café near John's work
  - c) At the sales department
  - Explicação: No diálogo — John: “Of course! We met at university, didn't we?”
  - Falas de referência: john-p1-e01-l02
- **john-p1-e01-q02** (explicit_fact) — Who does John work for now?
  - **(correta)** a) A technology company
  - b) A local newspaper
  - c) A university
  - Explicação: No diálogo — John: “I'm working for a technology company in Manchester.”
  - Falas de referência: john-p1-e01-l04
- **john-p1-e01-q03** (explicit_fact) — Where is the company that John works for?
  - **(correta)** a) In Manchester
  - b) In Edinburgh
  - c) In London
  - Explicação: No diálogo — John: “I'm working for a technology company in Manchester.”
  - Falas de referência: john-p1-e01-l04
- **john-p1-e01-q04** (explicit_fact) — What is John's job?
  - **(correta)** a) Project analyst
  - b) Software engineer
  - c) Photographer
  - Explicação: No diálogo — John: “I'm a project analyst. I usually work with different teams, but this week I'm helping the sales department.”
  - Falas de referência: john-p1-e01-l06
- **john-p1-e01-q05** (action) — What is John doing this week?
  - **(correta)** a) Helping the sales department
  - b) Taking a week off
  - c) Starting a new course
  - Explicação: No diálogo — John: “I'm a project analyst. I usually work with different teams, but this week I'm helping the sales department.”
  - Falas de referência: john-p1-e01-l06
- **john-p1-e01-q06** (explicit_fact) — Who does John usually work with?
  - **(correta)** a) Different teams
  - b) Only the sales team
  - c) Nobody — he always works alone
  - Explicação: No diálogo — John: “I'm a project analyst. I usually work with different teams, but this week I'm helping the sales department.”
  - Falas de referência: john-p1-e01-l06
- **john-p1-e01-q07** (explicit_fact) — How does Rick react to John's job?
  - **(correta)** a) He says it sounds interesting
  - b) He says it sounds boring
  - c) He says he doesn't believe it
  - Explicação: No diálogo — Rick: “That sounds interesting.”
  - Falas de referência: john-p1-e01-l07
- **john-p1-e01-q08** (intention) — What does Rick want to know when he asks "What are you doing these days?"
  - **(correta)** a) What John does at the moment
  - b) What John did yesterday
  - c) What John's plans for the weekend are
  - Explicação: "these days" = atualmente. No diálogo — Rick: “That's right. What are you doing these days?”
  - Falas de referência: john-p1-e01-l03
- **john-p1-e01-q09** (action) — What does Rick ask after John says where he works?
  - **(correta)** a) What John does there
  - b) How long John has worked there
  - c) Where the company is
  - Explicação: No diálogo — Rick: “Really? What do you do there?”
  - Falas de referência: john-p1-e01-l05
- **john-p1-e01-q10** (context) — Where are John and Rick talking?
  - **(correta)** a) In a small café near John's work
  - b) At the university
  - c) In John's office
  - Explicação: No diálogo — Contexto da cena: John encontra Rick numa pequena cafeteria perto do trabalho.
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

14 de 26 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: john, bennett, remember, course, met, university, didn't, right, doing, working, technology, manchester, usually, helping.

### Episode 2 — What does everyone do?

**Id:** `john-p1-e02` · **Tipo:** episódio · **Ordem na parte:** 2 · **Título:** What does everyone do?

**Contexto (literal):** John apresenta Mary a Rick.

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 74 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e02-l01 | John (`john`) | Mary, this is Rick. Rick, this is Mary Collins. | Mary, este é o Rick. Rick, esta é Mary Collins. | edf58d9a | bm_george | 01_Getting_to_Know_John.md:74 / 75 |
| 2 | john-p1-e02-l02 | Mary (`mary`) | Nice to meet you, Rick. What do you do? | Prazer em conhecer você, Rick. O que você faz? | 63b8c730 | bf_emma | 01_Getting_to_Know_John.md:77 / 78 |
| 3 | john-p1-e02-l03 | Rick (`rick`) | I'm a photographer. I work for a local newspaper. | Sou fotógrafo. Trabalho para um jornal local. | de07d76a | bm_lewis | 01_Getting_to_Know_John.md:80 / 81 |
| 4 | john-p1-e02-l04 | Mary (`mary`) | Do you take photographs of sport? | Você tira fotografias de esportes? | 686e3dd3 | bf_emma | 01_Getting_to_Know_John.md:83 / 84 |
| 5 | john-p1-e02-l05 | Rick (`rick`) | Yes, I do. I'm the sports photographer, so I often cover football matches. | Sim. Sou o fotógrafo esportivo, então frequentemente faço a cobertura de partidas de futebol. | ccf729c8 | bm_lewis | 01_Getting_to_Know_John.md:86 / 87 |
| 6 | john-p1-e02-l06 | John (`john`) | Mary works in our company. She's a software engineer. | Mary trabalha na nossa empresa. Ela é engenheira de software. | bff949d2 | bm_george | 01_Getting_to_Know_John.md:89 / 90 |
| 7 | john-p1-e02-l07 | Mary (`mary`) | And John is being modest. He's very good at solving problems. | E John está sendo modesto. Ele é muito bom em resolver problemas. | 0ffd03fb | bf_emma | 01_Getting_to_Know_John.md:92 / 93 |

#### Itens de vocabulário (8)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p1-e02-v01 | palavra | photographer | = | fotógrafo | john-p1-e02-l03, john-p1-e02-l05 | 490aa90a | Vocabulary | 01_Getting_to_Know_John.md:106 |
| john-p1-e02-v02 | chunk | local newspaper | = | jornal local | john-p1-e02-l03 | 6f4e36db | Vocabulary | 01_Getting_to_Know_John.md:107 |
| john-p1-e02-v03 | chunk | sports photographer | = | fotógrafo esportivo | john-p1-e02-l05 | 9f0fd189 | Vocabulary | 01_Getting_to_Know_John.md:108 |
| john-p1-e02-v04 | chunk | cover a match | = | fazer a cobertura de uma partida | — (não aparece literalmente) | b8418f72 | Vocabulary | 01_Getting_to_Know_John.md:109 |
| john-p1-e02-v05 | chunk | football match | = | partida de futebol | john-p1-e02-l05 | 43b8afd9 | Vocabulary | 01_Getting_to_Know_John.md:110 |
| john-p1-e02-v06 | chunk | software engineer | = | engenheiro(a) de software | john-p1-e02-l06 | 0b8765b5 | Vocabulary | 01_Getting_to_Know_John.md:111 |
| john-p1-e02-v07 | chunk | solve a problem | = | resolver um problema | — (não aparece literalmente) | e7defb78 | Vocabulary | 01_Getting_to_Know_John.md:112 |
| john-p1-e02-v08 | chunk | be good at | = | ser bom em | — (não aparece literalmente) | 2bcffeca | Vocabulary | 01_Getting_to_Know_John.md:113 |

#### Notas pedagógicas (1) — literal

### Language focus — Jobs and the third person
- *He works / She works*: acrescentamos **-s** à maioria dos verbos na terceira pessoa.
- *He teaches*; *she programmes* (grafia britânica); *he drives*.
- Pergunta sobre profissão: **What does she do?**
- Pergunta sobre atividade atual: **What is she doing?**

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e02-q01** (action) — Who introduces Mary and Rick?
  - **(correta)** a) John
  - b) Mary
  - c) Peter
  - Explicação: No diálogo — John: “Mary, this is Rick. Rick, this is Mary Collins.”
  - Falas de referência: john-p1-e02-l01
- **john-p1-e02-q02** (explicit_fact) — What is Rick's job?
  - **(correta)** a) Photographer
  - b) Software engineer
  - c) Project analyst
  - Explicação: No diálogo — Rick: “I'm a photographer. I work for a local newspaper.”
  - Falas de referência: john-p1-e02-l03
- **john-p1-e02-q03** (explicit_fact) — Who does Rick work for?
  - **(correta)** a) A local newspaper
  - b) John's company
  - c) A football club
  - Explicação: No diálogo — Rick: “I'm a photographer. I work for a local newspaper.”
  - Falas de referência: john-p1-e02-l03
- **john-p1-e02-q04** (explicit_fact) — What does Rick often cover?
  - **(correta)** a) Football matches
  - b) Weddings
  - c) Company events
  - Explicação: No diálogo — Rick: “Yes, I do. I'm the sports photographer, so I often cover football matches.”
  - Falas de referência: john-p1-e02-l05
- **john-p1-e02-q05** (relation) — What is the relationship between John and Mary?
  - **(correta)** a) They work in the same company
  - b) They are cousins
  - c) They met at university
  - Explicação: No diálogo — John: “Mary works in our company. She's a software engineer.”
  - Falas de referência: john-p1-e02-l06
- **john-p1-e02-q06** (explicit_fact) — What is Mary's job?
  - **(correta)** a) Software engineer
  - b) Photographer
  - c) Teacher
  - Explicação: No diálogo — John: “Mary works in our company. She's a software engineer.”
  - Falas de referência: john-p1-e02-l06
- **john-p1-e02-q07** (explicit_fact) — According to Mary, what is John very good at?
  - **(correta)** a) Solving problems
  - b) Taking photographs
  - c) Playing football
  - Explicação: No diálogo — Mary: “And John is being modest. He's very good at solving problems.”
  - Falas de referência: john-p1-e02-l07
- **john-p1-e02-q08** (inference) — What does Mary mean when she says "John is being modest"?
  - **(correta)** a) John doesn't talk much about his own qualities
  - b) John is being rude
  - c) John is telling a joke
  - Explicação: ela completa a apresentação que John fez com um elogio que ele não fez a si mesmo. No diálogo — Mary: “And John is being modest. He's very good at solving problems.”
  - Falas de referência: john-p1-e02-l07
- **john-p1-e02-q09** (intention) — Why does Mary ask Rick "What do you do?"
  - **(correta)** a) To find out about his job
  - b) To ask what he is doing right now
  - c) To invite him to lunch
  - Explicação: No diálogo — Mary: “Nice to meet you, Rick. What do you do?”
  - Falas de referência: john-p1-e02-l02
- **john-p1-e02-q10** (explicit_fact) — Does Rick take photographs of sport?
  - **(correta)** a) Yes, he is the sports photographer
  - b) No, he only photographs people
  - c) No, he doesn't take photographs any more
  - Explicação: No diálogo — Mary: “Do you take photographs of sport?” / Rick: “Yes, I do. I'm the sports photographer, so I often cover football matches.”
  - Falas de referência: john-p1-e02-l04, john-p1-e02-l05

#### Conteúdo das falas fora do inventário de itens

17 de 26 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: mary, rick, collins, nice, meet, work, take, photographs, sport, often, matches, works, company, john, modest, solving, problems.

### Episode 3 — A little about John

**Id:** `john-p1-e03` · **Tipo:** episódio · **Ordem na parte:** 3 · **Título:** A little about John

**Contexto (literal):** Mais tarde, Rick pergunta sobre a vida de John.

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 119 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e03-l01 | Rick (`rick`) | Do you still live near the city centre? | Você ainda mora perto do centro da cidade? | eab91fad | bm_lewis | 01_Getting_to_Know_John.md:119 / 120 |
| 2 | john-p1-e03-l02 | John (`john`) | No, I live in a suburb outside Manchester. | Não, moro num subúrbio nos arredores de Manchester. | ce20ffd2 | bm_george | 01_Getting_to_Know_John.md:122 / 123 |
| 3 | john-p1-e03-l03 | Rick (`rick`) | How long have you lived there? | Há quanto tempo você mora lá? | 191ca11b | bm_lewis | 01_Getting_to_Know_John.md:125 / 126 |
| 4 | john-p1-e03-l04 | John (`john`) | I've lived there for three years. It's quiet, and the neighbours are friendly. | Moro lá há três anos. É tranquilo, e os vizinhos são amigáveis. | 4b891af2 | bm_george | 01_Getting_to_Know_John.md:128 / 129 |
| 5 | john-p1-e03-l05 | Rick (`rick`) | Are you still taking photographs? | Você ainda está tirando fotografias? | 7bfdf252 | bm_lewis | 01_Getting_to_Know_John.md:131 / 132 |
| 6 | john-p1-e03-l06 | John (`john`) | Yes. I usually take pictures at weekends. At the moment, I'm working on a small photography project. | Sim. Normalmente tiro fotografias nos fins de semana. No momento, estou trabalhando num pequeno projeto de fotografia. | 76440ded | bm_george | 01_Getting_to_Know_John.md:134 / 135 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Language focus — Present Perfect with duration
**have/has + past participle** pode ligar uma situação iniciada no passado ao presente.
- *I've lived here for three years.* — Moro aqui há três anos.
- *She's worked there since 2022.* — Ela trabalha lá desde 2022.
**For** indica duração (*for three years*); **since** indica o ponto inicial (*since 2022*).

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e03-q01** (explicit_fact) — Where does John live now?
  - **(correta)** a) In a suburb outside Manchester
  - b) Near the city centre
  - c) In Edinburgh
  - Explicação: No diálogo — John: “No, I live in a suburb outside Manchester.”
  - Falas de referência: john-p1-e03-l02
- **john-p1-e03-q02** (inference) — What does Rick's question "Do you still live near the city centre?" suggest?
  - **(correta)** a) John used to live near the city centre
  - b) John has never lived in Manchester
  - c) Rick wants to move to the city centre
  - Explicação: "still" indica que antes era assim. No diálogo — Rick: “Do you still live near the city centre?”
  - Falas de referência: john-p1-e03-l01
- **john-p1-e03-q03** (explicit_fact) — How long has John lived there?
  - **(correta)** a) For three years
  - b) Since last week
  - c) For ten years
  - Explicação: No diálogo — John: “I've lived there for three years. It's quiet, and the neighbours are friendly.”
  - Falas de referência: john-p1-e03-l04
- **john-p1-e03-q04** (explicit_fact) — How does John describe the place where he lives?
  - **(correta)** a) Quiet
  - b) Noisy
  - c) Expensive
  - Explicação: No diálogo — John: “I've lived there for three years. It's quiet, and the neighbours are friendly.”
  - Falas de referência: john-p1-e03-l04
- **john-p1-e03-q05** (explicit_fact) — What are John's neighbours like?
  - **(correta)** a) Friendly
  - b) Unfriendly
  - c) Very noisy
  - Explicação: No diálogo — John: “I've lived there for three years. It's quiet, and the neighbours are friendly.”
  - Falas de referência: john-p1-e03-l04
- **john-p1-e03-q06** (explicit_fact) — When does John usually take pictures?
  - **(correta)** a) At weekends
  - b) Every morning before work
  - c) Only on holiday
  - Explicação: No diálogo — John: “Yes. I usually take pictures at weekends. At the moment, I'm working on a small photography project.”
  - Falas de referência: john-p1-e03-l06
- **john-p1-e03-q07** (action) — What is John working on at the moment?
  - **(correta)** a) A small photography project
  - b) A football team
  - c) A new house
  - Explicação: No diálogo — John: “Yes. I usually take pictures at weekends. At the moment, I'm working on a small photography project.”
  - Falas de referência: john-p1-e03-l06
- **john-p1-e03-q08** (inference) — What do we learn about John's interest in photography?
  - **(correta)** a) He took photographs before and still does
  - b) He has just started taking photographs
  - c) He has stopped taking photographs
  - Explicação: Rick pergunta se ele "still" tira fotos; John confirma. No diálogo — Rick: “Are you still taking photographs?” / John: “Yes. I usually take pictures at weekends. At the moment, I'm working on a small photography project.”
  - Falas de referência: john-p1-e03-l05, john-p1-e03-l06
- **john-p1-e03-q09** (intention) — What does Rick want to know when he asks "How long have you lived there?"
  - **(correta)** a) For how much time John has lived in the suburb
  - b) How far the suburb is from the city
  - c) How big John's house is
  - Explicação: No diálogo — Rick: “How long have you lived there?”
  - Falas de referência: john-p1-e03-l03
- **john-p1-e03-q10** (context) — When does this conversation happen?
  - **(correta)** a) Later, after Rick and John meet again
  - b) Many years before they met
  - c) At John's wedding
  - Explicação: No diálogo — Contexto da cena: Mais tarde, Rick pergunta sobre a vida de John.
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

26 de 26 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: still, live, near, city, centre, suburb, outside, manchester, long, lived, three, years, quiet, neighbours, friendly, taking, photographs, usually, take, pictures, weekends, moment, working, small, photography, project.

### Episode 4 — Family and free time

**Id:** `john-p1-e04` · **Tipo:** episódio · **Ordem na parte:** 4 · **Título:** Family and free time

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 148 · tradução: referência autoral — não validada pelo professor

#### Falas (9) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e04-l01 | John (`john`) | This is a photograph of my family. | Esta é uma fotografia da minha família. | f3fc4e2a | bm_george | 01_Getting_to_Know_John.md:148 / 149 |
| 2 | john-p1-e04-l02 | Rick (`rick`) | Is that your sister? | Aquela é sua irmã? | c153fa20 | bm_lewis | 01_Getting_to_Know_John.md:151 / 152 |
| 3 | john-p1-e04-l03 | John (`john`) | Yes. Her name is Ana Mitchell. She's a teacher. | Sim. O nome dela é Ana Mitchell. Ela é professora. | af2126be | bm_george | 01_Getting_to_Know_John.md:154 / 155 |
| 4 | john-p1-e04-l04 | Rick (`rick`) | And the man next to her? | E o homem ao lado dela? | 4166d9f9 | bm_lewis | 01_Getting_to_Know_John.md:157 / 158 |
| 5 | john-p1-e04-l05 | John (`john`) | That's my uncle, Stuart Hughes. He's an engineer. | Aquele é meu tio, Stuart Hughes. Ele é engenheiro. | 72ccdbd0 | bm_george | 01_Getting_to_Know_John.md:160 / 161 |
| 6 | john-p1-e04-l06 | Rick (`rick`) | What do you do in your free time? | O que você faz no seu tempo livre? | 08a5aed2 | bm_lewis | 01_Getting_to_Know_John.md:163 / 164 |
| 7 | john-p1-e04-l07 | John (`john`) | I enjoy photography, I play football with Peter, and I sometimes go swimming. | Gosto de fotografia, jogo futebol com Peter e às vezes vou nadar. | 5a632246 | bm_george | 01_Getting_to_Know_John.md:166 / 167 |
| 8 | john-p1-e04-l08 | Rick (`rick`) | I play squash every Saturday morning. You should come along sometime. | Jogo squash todo sábado de manhã. Você deveria ir comigo algum dia. | a2dabb89 | bm_lewis | 01_Getting_to_Know_John.md:169 / 170 |
| 9 | john-p1-e04-l09 | John (`john`) | I'd like that. | Eu gostaria. | 090af7b6 | bm_george | 01_Getting_to_Know_John.md:172 / 173 |

#### Itens de vocabulário (9)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p1-e04-v01 | palavra | family | = | família | john-p1-e04-l01 | 521d0429 | Vocabulary & expressions | 01_Getting_to_Know_John.md:179 |
| john-p1-e04-v02 | chunk | sister / uncle | sister, uncle | irmã / tio | john-p1-e04-l02, john-p1-e04-l05 | e8f81c20 | Vocabulary & expressions | 01_Getting_to_Know_John.md:180 |
| john-p1-e04-v03 | chunk | next to | = | ao lado de | john-p1-e04-l04 | fee13031 | Vocabulary & expressions | 01_Getting_to_Know_John.md:181 |
| john-p1-e04-v04 | expressão | in my free time | = | no meu tempo livre | john-p1-e04-l06 | e2a185df | Vocabulary & expressions | 01_Getting_to_Know_John.md:182 |
| john-p1-e04-v05 | chunk | go swimming | = | ir nadar | john-p1-e04-l07 | d102b5cc | Vocabulary & expressions | 01_Getting_to_Know_John.md:183 |
| john-p1-e04-v06 | chunk | play squash | = | jogar squash | john-p1-e04-l08 | 0664beb0 | Vocabulary & expressions | 01_Getting_to_Know_John.md:184 |
| john-p1-e04-v07 | chunk | every Saturday morning | = | todo sábado de manhã | john-p1-e04-l08 | 9d6f4333 | Vocabulary & expressions | 01_Getting_to_Know_John.md:185 |
| john-p1-e04-v08 | phrasal verb | come along | = | vir junto / acompanhar | john-p1-e04-l08 | 21b2c620 | Vocabulary & expressions | 01_Getting_to_Know_John.md:186 |
| john-p1-e04-v09 | expressão | I'd like that. | = | Eu gostaria. | john-p1-e04-l09 | 06e2150f | Vocabulary & expressions | 01_Getting_to_Know_John.md:187 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e04-q01** (action) — What does John show Rick?
  - **(correta)** a) A photograph of his family
  - b) A photograph of a football match
  - c) A map of Manchester
  - Explicação: No diálogo — John: “This is a photograph of my family.”
  - Falas de referência: john-p1-e04-l01
- **john-p1-e04-q02** (explicit_fact) — What is the name of John's sister?
  - **(correta)** a) Ana Mitchell
  - b) Mary Collins
  - c) Joana Fletcher
  - Explicação: No diálogo — John: “Yes. Her name is Ana Mitchell. She's a teacher.”
  - Falas de referência: john-p1-e04-l03
- **john-p1-e04-q03** (explicit_fact) — What does Ana do?
  - **(correta)** a) She's a teacher
  - b) She's an engineer
  - c) She's a photographer
  - Explicação: No diálogo — John: “Yes. Her name is Ana Mitchell. She's a teacher.”
  - Falas de referência: john-p1-e04-l03
- **john-p1-e04-q04** (relation) — Who is the man next to Ana in the photograph?
  - **(correta)** a) John's uncle
  - b) John's brother
  - c) John's neighbour
  - Explicação: No diálogo — Rick: “And the man next to her?” / John: “That's my uncle, Stuart Hughes. He's an engineer.”
  - Falas de referência: john-p1-e04-l04, john-p1-e04-l05
- **john-p1-e04-q05** (explicit_fact) — What is Stuart Hughes's job?
  - **(correta)** a) Engineer
  - b) Teacher
  - c) Electrician
  - Explicação: No diálogo — John: “That's my uncle, Stuart Hughes. He's an engineer.”
  - Falas de referência: john-p1-e04-l05
- **john-p1-e04-q06** (relation) — Who does John play football with?
  - **(correta)** a) Peter
  - b) Rick
  - c) Stuart
  - Explicação: No diálogo — John: “I enjoy photography, I play football with Peter, and I sometimes go swimming.”
  - Falas de referência: john-p1-e04-l07
- **john-p1-e04-q07** (explicit_fact) — What does John sometimes do in his free time?
  - **(correta)** a) He goes swimming
  - b) He plays golf
  - c) He goes fishing
  - Explicação: No diálogo — John: “I enjoy photography, I play football with Peter, and I sometimes go swimming.”
  - Falas de referência: john-p1-e04-l07
- **john-p1-e04-q08** (explicit_fact) — When does Rick play squash?
  - **(correta)** a) Every Saturday morning
  - b) Every Sunday afternoon
  - c) On weekday evenings
  - Explicação: No diálogo — Rick: “I play squash every Saturday morning. You should come along sometime.”
  - Falas de referência: john-p1-e04-l08
- **john-p1-e04-q09** (intention) — What does Rick suggest?
  - **(correta)** a) That John comes along to play squash sometime
  - b) That John lends him a camera
  - c) That they go swimming tomorrow
  - Explicação: No diálogo — Rick: “I play squash every Saturday morning. You should come along sometime.”
  - Falas de referência: john-p1-e04-l08
- **john-p1-e04-q10** (inference) — How does John respond to Rick's suggestion?
  - **(correta)** a) He likes the idea
  - b) He refuses
  - c) He says he is too busy
  - Explicação: "I'd like that" = eu gostaria. No diálogo — John: “I'd like that.”
  - Falas de referência: john-p1-e04-l09

#### Conteúdo das falas fora do inventário de itens

16 de 33 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: photograph, name, ana, mitchell, teacher, man, stuart, hughes, engineer, enjoy, photography, football, peter, sometimes, should, sometime.

### Episode 5 — What are they doing?

**Id:** `john-p1-e05` · **Tipo:** episódio · **Ordem na parte:** 5 · **Título:** What are they doing?

**Contexto (literal):** John e Mary passam pelo escritório no fim do dia.

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 193 · tradução: referência autoral — não validada pelo professor

#### Falas (5) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e05-l01 | Mary (`mary`) | Look! Peter is waiting for us outside. | Olhe! Peter está esperando por nós lá fora. | 2239f84a | bf_emma | 01_Getting_to_Know_John.md:193 / 194 |
| 2 | john-p1-e05-l02 | John (`john`) | Is he standing by the main entrance? | Ele está em pé perto da entrada principal? | 8e418271 | bm_george | 01_Getting_to_Know_John.md:196 / 197 |
| 3 | john-p1-e05-l03 | Mary (`mary`) | Yes, and Rick is talking to him. | Sim, e Rick está conversando com ele. | 8cd6812d | bf_emma | 01_Getting_to_Know_John.md:199 / 200 |
| 4 | john-p1-e05-l04 | John (`john`) | Let's go and say hello. | Vamos lá cumprimentá-los. | b4f80da9 | bm_george | 01_Getting_to_Know_John.md:202 / 203 |
| 5 | john-p1-e05-l05 | Mary (`mary`) | They're waving at us now. | Eles estão acenando para nós agora. | 5177ccd4 | bf_emma | 01_Getting_to_Know_John.md:205 / 206 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Language focus — Present Continuous
**am/is/are + verbo-ing**:
- *Peter is waiting.* — Peter está esperando.
- *They are waving.* — Eles estão acenando.
- *I'm walking.* — Estou caminhando.
Atenção à formação:
- go → going
- sit → sitting
- run → running
- take → taking

#### Questões de compreensão (9)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e05-q01** (explicit_fact) — Who is waiting outside?
  - **(correta)** a) Peter
  - b) Mary's sister
  - c) A taxi driver
  - Explicação: No diálogo — Mary: “Look! Peter is waiting for us outside.”
  - Falas de referência: john-p1-e05-l01
- **john-p1-e05-q02** (relation) — Who is Peter waiting for?
  - **(correta)** a) John and Mary
  - b) Only Rick
  - c) His family
  - Explicação: No diálogo — Mary: “Look! Peter is waiting for us outside.”
  - Falas de referência: john-p1-e05-l01
- **john-p1-e05-q03** (explicit_fact) — Where is Peter standing?
  - **(correta)** a) By the main entrance
  - b) In the car park
  - c) At the bus stop
  - Explicação: No diálogo — John: “Is he standing by the main entrance?” / Mary: “Yes, and Rick is talking to him.”
  - Falas de referência: john-p1-e05-l02, john-p1-e05-l03
- **john-p1-e05-q04** (action) — What is Rick doing?
  - **(correta)** a) Talking to Peter
  - b) Waiting inside the office
  - c) Taking photographs
  - Explicação: No diálogo — Mary: “Yes, and Rick is talking to him.”
  - Falas de referência: john-p1-e05-l03
- **john-p1-e05-q05** (intention) — What does John suggest?
  - **(correta)** a) Going to say hello
  - b) Waiting inside the office
  - c) Calling Peter on the phone
  - Explicação: No diálogo — John: “Let's go and say hello.”
  - Falas de referência: john-p1-e05-l04
- **john-p1-e05-q06** (action) — What are Peter and Rick doing at the end?
  - **(correta)** a) Waving at John and Mary
  - b) Walking away
  - c) Talking on the phone
  - Explicação: No diálogo — Mary: “They're waving at us now.”
  - Falas de referência: john-p1-e05-l05
- **john-p1-e05-q07** (context) — When does this happen?
  - **(correta)** a) At the end of the day
  - b) Early in the morning
  - c) At lunchtime
  - Explicação: No diálogo — Contexto da cena: John e Mary passam pelo escritório no fim do dia.
  - Falas de referência: —
- **john-p1-e05-q08** (inference) — Who notices Peter first?
  - **(correta)** a) Mary
  - b) John
  - c) Rick
  - Explicação: Mary chama a atenção ("Look!"). No diálogo — Mary: “Look! Peter is waiting for us outside.”
  - Falas de referência: john-p1-e05-l01
- **john-p1-e05-q09** (context) — Where are John and Mary?
  - **(correta)** a) Passing by the office
  - b) At the sports centre
  - c) In a café
  - Explicação: No diálogo — Contexto da cena: John e Mary passam pelo escritório no fim do dia.
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

14 de 14 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: look, peter, waiting, outside, standing, main, entrance, rick, talking, go, say, hello, waving, now.

### Episode 6 — More friends, more connections

**Id:** `john-p1-e06` · **Tipo:** episódio · **Ordem na parte:** 6 · **Título:** More friends, more connections

**Contexto (literal):** No centro desportivo, Rick apresenta John a dois amigos.

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 256 · tradução: referência autoral — não validada pelo professor

#### Falas (8) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e06-l01 | Rick (`rick`) | John, this is Ruan Parker. He organises events around the city. | John, este é Ruan Parker. Ele organiza eventos pela cidade. | 2dc1709f | bm_lewis | 01_Getting_to_Know_John.md:256 / 257 |
| 2 | john-p1-e06-l02 | Ruan (`ruan`) | Nice to meet you. Rick has told me a lot about you. | Prazer em conhecer você. Rick me falou bastante sobre você. | 0103dbaf | bm_fable | 01_Getting_to_Know_John.md:259 / 260 |
| 3 | john-p1-e06-l03 | John (`john`) | Nice to meet you too. | Prazer em conhecer você também. | 4c10aac2 | bm_george | 01_Getting_to_Know_John.md:262 / 263 |
| 4 | john-p1-e06-l04 | Jessy (`jessy`) | And this is my colleague, Ketlyn Brooks. | E esta é minha colega, Ketlyn Brooks. | 851a4ff2 | bf_isabella | 01_Getting_to_Know_John.md:265 / 266 |
| 5 | john-p1-e06-l05 | Ketlyn (`ketlyn`) | Hello, everyone. Are you all coming to the family lunch on Sunday? | Olá, pessoal. Todos vocês vão ao almoço de família no domingo? | eae0d2c6 | bf_alice | 01_Getting_to_Know_John.md:268 / 269 |
| 6 | john-p1-e06-l06 | John (`john`) | Yes. My cousin Joana Fletcher is coming as well. | Sim. Minha prima Joana Fletcher também vai. | bd450b91 | bm_george | 01_Getting_to_Know_John.md:271 / 272 |
| 7 | john-p1-e06-l07 | Rick (`rick`) | It sounds like a big gathering! | Parece que vai ser um grande encontro! | 107b911e | bm_lewis | 01_Getting_to_Know_John.md:274 / 275 |
| 8 | john-p1-e06-l08 | John (`john`) | It will be. My family usually gets together at weekends. | Vai ser. Minha família geralmente se reúne nos fins de semana. | ae97e819 | bm_george | 01_Getting_to_Know_John.md:277 / 278 |

#### Itens de vocabulário (6)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p1-e06-v01 | chunk | organise events | = | organizar eventos | john-p1-e06-l01 | a030fa5e | New vocabulary | 01_Getting_to_Know_John.md:284 |
| john-p1-e06-v02 | palavra | colleague | = | colega de trabalho | john-p1-e06-l04 | 5b155444 | New vocabulary | 01_Getting_to_Know_John.md:285 |
| john-p1-e06-v03 | palavra | everyone | = | todos / todo mundo | john-p1-e06-l05 | d378dd78 | New vocabulary | 01_Getting_to_Know_John.md:286 |
| john-p1-e06-v04 | chunk | as well | = | também | john-p1-e06-l06 | 5f4253bf | New vocabulary | 01_Getting_to_Know_John.md:287 |
| john-p1-e06-v05 | palavra | gathering | = | reunião / encontro | john-p1-e06-l07 | 30895ef6 | New vocabulary | 01_Getting_to_Know_John.md:288 |
| john-p1-e06-v06 | phrasal verb | get together | = | reunir-se | john-p1-e06-l08 | 6547a31f | New vocabulary | 01_Getting_to_Know_John.md:289 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e06-q01** (action) — Who introduces Ruan to John?
  - **(correta)** a) Rick
  - b) Jessy
  - c) Ketlyn
  - Explicação: No diálogo — Rick: “John, this is Ruan Parker. He organises events around the city.”
  - Falas de referência: john-p1-e06-l01
- **john-p1-e06-q02** (explicit_fact) — What does Ruan do?
  - **(correta)** a) He organises events around the city
  - b) He teaches French
  - c) He works for a newspaper
  - Explicação: No diálogo — Rick: “John, this is Ruan Parker. He organises events around the city.”
  - Falas de referência: john-p1-e06-l01
- **john-p1-e06-q03** (inference) — What does Ruan's comment "Rick has told me a lot about you" show?
  - **(correta)** a) Rick had already talked to Ruan about John
  - b) Ruan and John were colleagues
  - c) Ruan doesn't know Rick well
  - Explicação: No diálogo — Ruan: “Nice to meet you. Rick has told me a lot about you.”
  - Falas de referência: john-p1-e06-l02
- **john-p1-e06-q04** (relation) — Who is Ketlyn Brooks?
  - **(correta)** a) Jessy's colleague
  - b) Rick's sister
  - c) John's cousin
  - Explicação: No diálogo — Jessy: “And this is my colleague, Ketlyn Brooks.”
  - Falas de referência: john-p1-e06-l04
- **john-p1-e06-q05** (explicit_fact) — Which event does Ketlyn ask about?
  - **(correta)** a) A family lunch on Sunday
  - b) A football match on Saturday
  - c) A wedding next week
  - Explicação: No diálogo — Ketlyn: “Hello, everyone. Are you all coming to the family lunch on Sunday?”
  - Falas de referência: john-p1-e06-l05
- **john-p1-e06-q06** (explicit_fact) — Who else is coming to the lunch?
  - **(correta)** a) John's cousin, Joana Fletcher
  - b) Ruan's parents
  - c) Ketlyn's family
  - Explicação: No diálogo — John: “Yes. My cousin Joana Fletcher is coming as well.”
  - Falas de referência: john-p1-e06-l06
- **john-p1-e06-q07** (relation) — What is Joana Fletcher to John?
  - **(correta)** a) His cousin
  - b) His sister
  - c) His niece
  - Explicação: No diálogo — John: “Yes. My cousin Joana Fletcher is coming as well.”
  - Falas de referência: john-p1-e06-l06
- **john-p1-e06-q08** (inference) — What does Rick think the lunch will be like?
  - **(correta)** a) A big gathering
  - b) A quiet meal for two
  - c) A business meeting
  - Explicação: No diálogo — Rick: “It sounds like a big gathering!”
  - Falas de referência: john-p1-e06-l07
- **john-p1-e06-q09** (explicit_fact) — When does John's family usually get together?
  - **(correta)** a) At weekends
  - b) Every evening
  - c) Only once a year
  - Explicação: No diálogo — John: “It will be. My family usually gets together at weekends.”
  - Falas de referência: john-p1-e06-l08
- **john-p1-e06-q10** (context) — Where does this conversation take place?
  - **(correta)** a) At the sports centre
  - b) In a restaurant
  - c) In John's office
  - Explicação: No diálogo — Contexto da cena: No centro desportivo, Rick apresenta John a dois amigos.
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

29 de 34 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: john, ruan, parker, organises, around, city, nice, meet, rick, told, lot, too, ketlyn, brooks, hello, all, coming, family, lunch, sunday, cousin, joana, fletcher, sounds, like, big, usually, gets, weekends.

### Episode 7 — A university course

**Id:** `john-p1-e07` · **Tipo:** episódio · **Ordem na parte:** 7 · **Título:** A university course

**Contexto (literal):** John encontra uma estudante no evento de formação da empresa.

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 299 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e07-l01 | John (`john`) | What are you studying at the moment? | O que você está estudando no momento? | 6f745a91 | bm_george | 01_Getting_to_Know_John.md:299 / 300 |
| 2 | john-p1-e07-l02 | Student (`role-student`) | I'm studying Business and Commerce at the University of Manchester. | Estou estudando Negócios e Comércio na Universidade de Manchester. *(rótulo na tradução: Estudante)* | 5677799d | bf_alice | 01_Getting_to_Know_John.md:302 / 303 |
| 3 | john-p1-e07-l03 | John (`john`) | Are you studying full-time? | Você está estudando em período integral? | cdba5142 | bm_george | 01_Getting_to_Know_John.md:305 / 306 |
| 4 | john-p1-e07-l04 | Student (`role-student`) | No. I work during the day and study in the evenings. | Não. Trabalho durante o dia e estudo à noite. *(rótulo na tradução: Estudante)* | f361a6b6 | bf_alice | 01_Getting_to_Know_John.md:308 / 309 |
| 5 | john-p1-e07-l05 | John (`john`) | Perhaps we can meet at the university sometime. | Talvez possamos nos encontrar na universidade algum dia. | 317142d3 | bm_george | 01_Getting_to_Know_John.md:311 / 312 |
| 6 | john-p1-e07-l06 | Student (`role-student`) | I'd like that. | Eu gostaria. *(rótulo na tradução: Estudante)* | 98fb62b0 | bf_alice | 01_Getting_to_Know_John.md:314 / 315 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e07-q01** (explicit_fact) — What is the student studying?
  - **(correta)** a) Business and Commerce
  - b) Project management
  - c) Photography
  - Explicação: No diálogo — Student: “I'm studying Business and Commerce at the University of Manchester.”
  - Falas de referência: john-p1-e07-l02
- **john-p1-e07-q02** (explicit_fact) — Where is she studying?
  - **(correta)** a) At the University of Manchester
  - b) Online, from home
  - c) At a school in Edinburgh
  - Explicação: No diálogo — Student: “I'm studying Business and Commerce at the University of Manchester.”
  - Falas de referência: john-p1-e07-l02
- **john-p1-e07-q03** (explicit_fact) — Is she studying full-time?
  - **(correta)** a) No, she isn't
  - b) Yes, she is
  - c) She has stopped studying
  - Explicação: No diálogo — John: “Are you studying full-time?” / Student: “No. I work during the day and study in the evenings.”
  - Falas de referência: john-p1-e07-l03, john-p1-e07-l04
- **john-p1-e07-q04** (action) — What does she do during the day?
  - **(correta)** a) She works
  - b) She studies
  - c) She plays sport
  - Explicação: No diálogo — Student: “No. I work during the day and study in the evenings.”
  - Falas de referência: john-p1-e07-l04
- **john-p1-e07-q05** (explicit_fact) — When does she study?
  - **(correta)** a) In the evenings
  - b) In the mornings
  - c) Only at weekends
  - Explicação: No diálogo — Student: “No. I work during the day and study in the evenings.”
  - Falas de referência: john-p1-e07-l04
- **john-p1-e07-q06** (inference) — Why isn't she a full-time student?
  - **(correta)** a) Because she works during the day
  - b) Because the course is online
  - c) Because she lives far away
  - Explicação: No diálogo — Student: “No. I work during the day and study in the evenings.”
  - Falas de referência: john-p1-e07-l04
- **john-p1-e07-q07** (intention) — What does John suggest?
  - **(correta)** a) Meeting at the university sometime
  - b) Working in the same company
  - c) Taking the same course
  - Explicação: No diálogo — John: “Perhaps we can meet at the university sometime.”
  - Falas de referência: john-p1-e07-l05
- **john-p1-e07-q08** (inference) — How does the student feel about John's suggestion?
  - **(correta)** a) She likes it
  - b) She refuses
  - c) She isn't sure
  - Explicação: "I'd like that" = eu gostaria. No diálogo — Student: “I'd like that.”
  - Falas de referência: john-p1-e07-l06
- **john-p1-e07-q09** (intention) — What does John want to know first?
  - **(correta)** a) What she is studying now
  - b) Where she lives
  - c) How old she is
  - Explicação: No diálogo — John: “What are you studying at the moment?”
  - Falas de referência: john-p1-e07-l01
- **john-p1-e07-q10** (context) — Where do John and the student meet?
  - **(correta)** a) At a company training event
  - b) At a café
  - c) At the sports centre
  - Explicação: No diálogo — Contexto da cena: John encontra uma estudante no evento de formação da empresa.
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

18 de 18 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: studying, moment, business, commerce, university, manchester, full, time, work, during, day, study, evenings, perhaps, meet, sometime, i'd, like.

### Episode 8 — People and what they do

**Id:** `john-p1-e08` · **Tipo:** episódio · **Ordem na parte:** 8 · **Título:** People and what they do

**Contexto (literal):** Na feira comunitária, John conhece profissionais com ocupações diferentes.

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 339 · tradução: referência autoral — não validada pelo professor

#### Falas (3) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e08-l01 | Rick (`rick`) | What does the greengrocer do? | O que o comerciante de frutas e verduras faz? | ab218d8e | bm_lewis | 01_Getting_to_Know_John.md:339 / 340 |
| 2 | john-p1-e08-l02 | John (`john`) | He sells vegetables. And the electrician is fixing a light over there. | Ele vende verduras. E o eletricista está consertando uma luminária ali. | 11581033 | bm_george | 01_Getting_to_Know_John.md:342 / 343 |
| 3 | john-p1-e08-l03 | Mary (`mary`) | The singer is performing now, but she usually works in a theatre. | A cantora está se apresentando agora, mas normalmente trabalha em um teatro. | 64196aec | bf_emma | 01_Getting_to_Know_John.md:345 / 346 |

#### Itens de vocabulário (15)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p1-e08-v01 | palavra | greengrocer | = | comerciante de frutas e verduras / verdureiro | john-p1-e08-l01 | 7fc0d7c0 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:323 |
| john-p1-e08-v02 | chunk | bus driver | = | motorista de ônibus | — (não aparece literalmente) | 580d2c59 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:324 |
| john-p1-e08-v03 | chunk | computer programmer | = | programador(a) de computador | — (não aparece literalmente) | 2cd86698 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:325 |
| john-p1-e08-v04 | chunk | French teacher | = | professor(a) de francês | — (não aparece literalmente) | f02e91db | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:326 |
| john-p1-e08-v05 | palavra | singer | = | cantor(a) | john-p1-e08-l03 | 6a3a7f29 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:327 |
| john-p1-e08-v06 | palavra | watchmaker | = | relojoeiro(a) | — (não aparece literalmente) | f2307040 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:328 |
| john-p1-e08-v07 | palavra | electrician | = | eletricista | john-p1-e08-l02 | bd2efc56 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:329 |
| john-p1-e08-v08 | palavra | fisherman | = | pescador | — (não aparece literalmente) | 128b9544 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:330 |
| john-p1-e08-v09 | chunk | sports photographer | = | fotógrafo(a) esportivo(a) | — (não aparece literalmente) | 9f0fd189 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:331 |
| john-p1-e08-v10 | chunk | fix a light | = | consertar uma luminária / reparar uma luz | john-p1-e08-l02 | 19bf3b1b | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:332 |
| john-p1-e08-v11 | chunk | make a watch | = | fabricar/consertar um relógio, conforme o contexto | — (não aparece literalmente) | 6e95d42f | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:333 |
| john-p1-e08-v12 | chunk | sell vegetables | = | vender verduras | john-p1-e08-l02 | c48502bb | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:334 |
| john-p1-e08-v13 | chunk | drive a bus | = | dirigir um ônibus | — (não aparece literalmente) | b66d8dd2 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:335 |
| john-p1-e08-v14 | chunk | teach French | = | ensinar francês | — (não aparece literalmente) | 5e5bcb2e | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:336 |
| john-p1-e08-v15 | chunk | programme computers | = | programar computadores (grafia BrE) | — (não aparece literalmente) | e6ebae67 | Episode 8 — People and what they do | 01_Getting_to_Know_John.md:337 |

#### Questões de compreensão (7)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e08-q01** (explicit_fact) — What does the greengrocer do?
  - **(correta)** a) He sells vegetables
  - b) He fixes lights
  - c) He sings
  - Explicação: No diálogo — John: “He sells vegetables. And the electrician is fixing a light over there.”
  - Falas de referência: john-p1-e08-l02
- **john-p1-e08-q02** (action) — What is the electrician doing?
  - **(correta)** a) Fixing a light
  - b) Selling vegetables
  - c) Performing
  - Explicação: No diálogo — John: “He sells vegetables. And the electrician is fixing a light over there.”
  - Falas de referência: john-p1-e08-l02
- **john-p1-e08-q03** (action) — What is the singer doing now?
  - **(correta)** a) Performing
  - b) Fixing a light
  - c) Selling vegetables
  - Explicação: No diálogo — Mary: “The singer is performing now, but she usually works in a theatre.”
  - Falas de referência: john-p1-e08-l03
- **john-p1-e08-q04** (explicit_fact) — Where does the singer usually work?
  - **(correta)** a) In a theatre
  - b) At the community fair
  - c) In a shop
  - Explicação: No diálogo — Mary: “The singer is performing now, but she usually works in a theatre.”
  - Falas de referência: john-p1-e08-l03
- **john-p1-e08-q05** (inference) — Is the singer at her usual workplace now?
  - **(correta)** a) No — she usually works in a theatre
  - b) Yes, she always works there
  - c) The dialogue says she has no job
  - Explicação: contraste "now" × "usually". No diálogo — Mary: “The singer is performing now, but she usually works in a theatre.”
  - Falas de referência: john-p1-e08-l03
- **john-p1-e08-q06** (context) — Where are John and his friends?
  - **(correta)** a) At a community fair
  - b) In a theatre
  - c) At the office
  - Explicação: No diálogo — Contexto da cena: Na feira comunitária, John conhece profissionais com ocupações diferentes.
  - Falas de referência: —
- **john-p1-e08-q07** (relation) — Who asks what the greengrocer does?
  - **(correta)** a) Rick
  - b) Mary
  - c) John
  - Explicação: No diálogo — Rick: “What does the greengrocer do?”
  - Falas de referência: john-p1-e08-l01

#### Conteúdo das falas fora do inventário de itens

8 de 13 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: sells, fixing, over, performing, now, usually, works, theatre.

### Episode 9 — Past events and relationships

**Id:** `john-p1-e09` · **Tipo:** episódio · **Ordem na parte:** 9 · **Título:** Past events and relationships

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `01_Getting_to_Know_John.md` a partir da linha 350 · tradução: referência autoral — não validada pelo professor

#### Falas (4) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p1-e09-l01 | Rick (`rick`) | When did you last see Peter? | Quando você viu o Peter pela última vez? | a271ab05 | bm_lewis | 01_Getting_to_Know_John.md:350 / 351 |
| 2 | john-p1-e09-l02 | John (`john`) | I met him last week at a conference. | Encontrei com ele na semana passada em uma conferência. | ce892a3f | bm_george | 01_Getting_to_Know_John.md:353 / 354 |
| 3 | john-p1-e09-l03 | Rick (`rick`) | Was he going out with anyone at the time? | Ele estava namorando alguém naquela época? | 9a036563 | bm_lewis | 01_Getting_to_Know_John.md:356 / 357 |
| 4 | john-p1-e09-l04 | John (`john`) | I don't know. He's married now. | Não sei. Ele é casado agora. | 52903ab7 | bm_george | 01_Getting_to_Know_John.md:359 / 360 |

**Falas corrigidas (decisão do PO de 2026-11-11; o app usa o texto corrigido, a fonte continua com o original):**

- `john-p1-e09-l01` — original da fonte: “Did you meet Peter at the university?” / “Você conheceu Peter na universidade?”
  - motivo: A resposta (“…at a conference”) contradizia a pergunta (“at the university”), e Peter é vizinho e amigo de John (p1-e04, p3-e04): “meet” aqui é encontrar, não conhecer. A pergunta passa a ser sobre o último encontro.
  - motivo: Mesma correção na tradução.
- `john-p1-e09-l02` — original da fonte: “Yes, I met him last week at a conference.” / “Sim, encontrei com ele na semana passada em uma conferência.”
  - motivo: Sem o “Yes”, que respondia à pergunta anterior; o foco gramatical (met = Past Simple de meet) é mantido.
  - motivo: Mesma correção na tradução.

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Questões de compreensão (5)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p1-e09-q01** (explicit_fact) — When did John last see Peter?
  - **(correta)** a) Last week
  - b) Last year
  - c) Ten years ago
  - Explicação: No diálogo — Rick: “When did you last see Peter?” / John: “I met him last week at a conference.”
  - Falas de referência: john-p1-e09-l01, john-p1-e09-l02
- **john-p1-e09-q02** (context) — Where did John see Peter last week?
  - **(correta)** a) At a conference
  - b) At the university
  - c) At the sports centre
  - Explicação: No diálogo — John: “I met him last week at a conference.”
  - Falas de referência: john-p1-e09-l02
- **john-p1-e09-q03** (explicit_fact) — Does John know if Peter was going out with anyone at the time?
  - **(correta)** a) No, he doesn't know
  - b) Yes, he was going out with Mary
  - c) Yes, he was going out with Jessy
  - Explicação: No diálogo — Rick: “Was he going out with anyone at the time?” / John: “I don't know. He's married now.”
  - Falas de referência: john-p1-e09-l03, john-p1-e09-l04
- **john-p1-e09-q04** (explicit_fact) — What is Peter's situation now?
  - **(correta)** a) He's married
  - b) He's single
  - c) He's engaged
  - Explicação: No diálogo — John: “I don't know. He's married now.”
  - Falas de referência: john-p1-e09-l04
- **john-p1-e09-q05** (relation) — Who asks the questions about Peter?
  - **(correta)** a) Rick
  - b) John
  - c) Mary
  - Explicação: No diálogo — Rick: “When did you last see Peter?” / Rick: “Was he going out with anyone at the time?”
  - Falas de referência: john-p1-e09-l01, john-p1-e09-l03

#### Conteúdo das falas fora do inventário de itens

12 de 12 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: last, see, peter, met, week, conference, going, anyone, time, know, married, now.

## Itens das tabelas da fonte sem atividade correspondente (9)

Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.

| Inglês (literal) | Tabela | Fonte |
|---|---|---|
| go fishing / fish in the sea | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:368 — “\| go fishing / fish in the sea \| pescar / pescar no mar \|” |
| fish for salmon | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:369 — “\| fish for salmon \| pescar salmão \|” |
| play golf | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:370 — “\| play golf \| jogar golfe \|” |
| golf player | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:371 — “\| golf player \| jogador(a) de golfe \|” |
| play basketball | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:372 — “\| play basketball \| jogar basquete \|” |
| basketball player | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:373 — “\| basketball player \| jogador(a) de basquete \|” |
| race cars | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:374 — “\| race cars \| competir em corridas de carros \|” |
| favourite sport | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:375 — “\| favourite sport \| esporte favorito (BrE: *favourite*) \|” |
| like + -ing | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:376 — “\| like + -ing \| gostar de fazer algo \|” |

## Conteúdo da fonte que não está nos dados do app (literal)

Linhas de `01_Getting_to_Know_John.md` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.

**Linhas 1–18:**

```markdown
# THE STORY OF JOHN
## Part 1 — Getting to Know John
**Daily Routine English · Inglês britânico como referência · Material autoral**

> **Sobre esta edição:** esta parte inaugura uma narrativa original. As situações e os personagens foram criados para dar continuidade ao curso. O vocabulário e os focos linguísticos reaproveitam conteúdos presentes no acervo validado das quatro partes de referência. A criação de novas falas não altera nem substitui as traduções e respostas preservadas no acervo original.

## Elenco apresentado nesta parte

- **John Bennett** — protagonista. Vive em Manchester e trabalha numa empresa de tecnologia. Gosta de fotografia, futebol e de passar tempo com os amigos.
- **Mary Collins** — colega de John, trabalha na mesma empresa.
- **Rick Thompson** — amigo de John desde a universidade.
- **Jhessyka “Jessy” Whitmore** — amiga de Rick e John; trabalha com comunicação.
- **Peter Walker** — vizinho de John.
- **Ruan Parker** — amigo de Rick, trabalha com organização de eventos.
- **Joana Fletcher** — prima de John, vive noutra cidade e aparece nas reuniões familiares.
- **Ketlyn Brooks** — colega de Jessy, trabalha com produção de conteúdos.

Os detalhes biográficos acima são **criação narrativa** e serão mantidos nas partes seguintes.
```

**Linhas 57–57:**

```markdown
### Vocabulary & chunks
```

**Linhas 102–102:**

```markdown
### Vocabulary
```

**Linhas 175–175:**

```markdown
### Vocabulary & expressions
```

**Linhas 221–249:**

```markdown
## Practice

### A. Comprehension — responda em inglês

1. Where does John work?
2. What does Rick do?
3. How long has John lived in the suburb?
4. What does John usually do at weekends?
5. What is Peter doing outside the office?

### B. Translate into English

1. Eu trabalho para uma empresa de tecnologia.
2. Ela está ajudando o departamento de vendas esta semana.
3. Rick é fotógrafo esportivo.
4. Moro aqui há três anos.
5. O que você faz no seu tempo livre?

### C. Personal production

Write 5–7 sentences introducing yourself. Include your job or studies, where you live, one habit, one current activity and one hobby.

### Suggested answers

**A:** 1. He works for a technology company in Manchester. 2. He's a photographer. 3. For three years. 4. He usually takes pictures. 5. He's waiting outside.

**B (one possible version):** 1. I work for a technology company. 2. She's helping the sales department this week. 3. Rick is a sports photographer. 4. I've lived here for three years. 5. What do you do in your free time?

*As respostas pessoais podem variar.*
```

**Linhas 280–280:**

```markdown
### New vocabulary
```

**Linhas 291–293:**

```markdown
## Source coverage — additional situations and language

Esta seção fecha os núcleos da Parte 1 que não apareciam suficientemente nos episódios anteriores. Os exemplos abaixo são novos, com personagens desta narrativa; não reproduzem nomes ou diálogos do acervo-fonte.
```

**Linhas 362–364:**

```markdown
**Language focus:** *met* é Past Simple de *meet*; *was/were + verbo-ing* forma o Past Continuous; *go out with someone* pode significar namorar/sair romanticamente; *have/has been married for...* expressa duração do casamento até o presente.

### Hobbies and sports — complete lexical set
```

**Linhas 378–378:**

```markdown
**Contrast:** *Joe races cars* descreve hábito/atividade; *He isn't racing now* descreve o que não está acontecendo neste momento.
```

---

# The Story of John — Parte 2: Work, Studies and Everyday Life

**Pacote:** The Story of John (`the-story-of-john`, conteúdo `118297cacc48`, idioma en-GB) · **Parte:** `john-p2` · **Arquivo-fonte:** `dev/content/dialogues/source/the-story-of-john/02_Work_Studies_and_Everyday_Life.md`

**Origem do pacote (literal):** Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.

**Atividades:** 7 (5 episódios, 2 mini-diálogos) · **Falas:** 35 · **Itens:** 29 · **Questões:** 56

## Atividades

- [`john-p2-e01` — A typical working day](#episode-1-a-typical-working-day)
- [`john-p2-e02` — Different professions, different tasks](#episode-2-different-professions-different-tasks)
- [`john-p2-e03` — Studying after work](#episode-3-studying-after-work)
- [`john-p2-e04` — A busy day](#episode-4-a-busy-day)
- [`john-p2-e05` — After work](#episode-5-after-work)
- [`john-p2-x01` — Frequency and intention](#frequency-and-intention)
- [`john-p2-x02` — Comparatives, superlatives and ages](#comparatives-superlatives-and-ages)

## Conteúdo por atividade

### Episode 1 — A typical working day

**Id:** `john-p2-e01` · **Tipo:** episódio · **Ordem na parte:** 1 · **Título:** A typical working day

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `02_Work_Studies_and_Everyday_Life.md` a partir da linha 9 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p2-e01-l01 | Mary (`mary`) | Do you usually arrive at the office before nine, John? | Você geralmente chega ao escritório antes das nove, John? | 448561a8 | bf_emma | 02_Work_Studies_and_Everyday_Life.md:9 / 10 |
| 2 | john-p2-e01-l02 | John (`john`) | Yes, I do. I usually get here at half past eight. | Sim. Geralmente chego aqui às oito e meia. | 10a86920 | bm_george | 02_Work_Studies_and_Everyday_Life.md:12 / 13 |
| 3 | john-p2-e01-l03 | Mary (`mary`) | What do you do first? | O que você faz primeiro? | fcfbb617 | bf_emma | 02_Work_Studies_and_Everyday_Life.md:15 / 16 |
| 4 | john-p2-e01-l04 | John (`john`) | I check my emails, read the project notes and speak to my team. | Verifico meus e-mails, leio as anotações do projeto e converso com minha equipe. | ae330c6c | bm_george | 02_Work_Studies_and_Everyday_Life.md:18 / 19 |
| 5 | john-p2-e01-l05 | Mary (`mary`) | Are you working on the new system today? | Você está trabalhando no novo sistema hoje? | 0d38ba32 | bf_emma | 02_Work_Studies_and_Everyday_Life.md:21 / 22 |
| 6 | john-p2-e01-l06 | John (`john`) | Yes. I'm checking the figures because the sales team needs the report this afternoon. | Sim. Estou conferindo os números porque a equipe de vendas precisa do relatório hoje à tarde. | 87f87c8c | bm_george | 02_Work_Studies_and_Everyday_Life.md:24 / 25 |
| 7 | john-p2-e01-l07 | Mary (`mary`) | I see. I'm preparing the presentation at the moment. | Entendi. Estou preparando a apresentação neste momento. | a82f6e97 | bf_emma | 02_Work_Studies_and_Everyday_Life.md:27 / 28 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Language focus — habits and current activities
- *usually, always, often, sometimes, never* indicam frequência.
- *every day, every Saturday, once a week* indicam periodicidade.
- Present Simple descreve a rotina: *I check my emails every morning.*
- Present Continuous descreve o que acontece agora ou temporariamente: *I'm preparing a presentation today.*

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p2-e01-q01** (relation) — Who asks John about his working day?
  - **(correta)** a) Mary
  - b) Rick
  - c) Peter
  - Explicação: No diálogo — Mary: “Do you usually arrive at the office before nine, John?”
  - Falas de referência: john-p2-e01-l01
- **john-p2-e01-q02** (explicit_fact) — What time does John usually get to the office?
  - **(correta)** a) At half past eight
  - b) At nine o'clock
  - c) At half past nine
  - Explicação: No diálogo — John: “Yes, I do. I usually get here at half past eight.”
  - Falas de referência: john-p2-e01-l02
- **john-p2-e01-q03** (action) — What does John check first?
  - **(correta)** a) His emails
  - b) The figures
  - c) The timetable
  - Explicação: No diálogo — John: “I check my emails, read the project notes and speak to my team.”
  - Falas de referência: john-p2-e01-l04
- **john-p2-e01-q04** (action) — Who does John speak to in the morning?
  - **(correta)** a) His team
  - b) The sales manager
  - c) Peter
  - Explicação: No diálogo — John: “I check my emails, read the project notes and speak to my team.”
  - Falas de referência: john-p2-e01-l04
- **john-p2-e01-q05** (explicit_fact) — What does John read?
  - **(correta)** a) The project notes
  - b) The newspaper
  - c) The report
  - Explicação: No diálogo — John: “I check my emails, read the project notes and speak to my team.”
  - Falas de referência: john-p2-e01-l04
- **john-p2-e01-q06** (explicit_fact) — What is John working on today?
  - **(correta)** a) The new system
  - b) A presentation
  - c) A photography project
  - Explicação: No diálogo — Mary: “Are you working on the new system today?” / John: “Yes. I'm checking the figures because the sales team needs the report this afternoon.”
  - Falas de referência: john-p2-e01-l05, john-p2-e01-l06
- **john-p2-e01-q07** (action) — What is John checking at the moment?
  - **(correta)** a) The figures
  - b) His emails
  - c) The presentation
  - Explicação: No diálogo — John: “Yes. I'm checking the figures because the sales team needs the report this afternoon.”
  - Falas de referência: john-p2-e01-l06
- **john-p2-e01-q08** (intention) — Why is John checking the figures?
  - **(correta)** a) The sales team needs the report this afternoon
  - b) Mary asked him to check them
  - c) The system is broken
  - Explicação: No diálogo — John: “Yes. I'm checking the figures because the sales team needs the report this afternoon.”
  - Falas de referência: john-p2-e01-l06
- **john-p2-e01-q09** (explicit_fact) — When does the sales team need the report?
  - **(correta)** a) This afternoon
  - b) Tomorrow morning
  - c) Next week
  - Explicação: No diálogo — John: “Yes. I'm checking the figures because the sales team needs the report this afternoon.”
  - Falas de referência: john-p2-e01-l06
- **john-p2-e01-q10** (action) — What is Mary doing at the moment?
  - **(correta)** a) Preparing the presentation
  - b) Checking the figures
  - c) Reading her emails
  - Explicação: No diálogo — Mary: “I see. I'm preparing the presentation at the moment.”
  - Falas de referência: john-p2-e01-l07

#### Conteúdo das falas fora do inventário de itens

33 de 33 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: usually, arrive, office, before, nine, john, get, half, past, eight, first, check, emails, read, project, notes, speak, team, working, new, system, today, checking, figures, because, sales, needs, report, afternoon, see, preparing, presentation, moment.

### Episode 2 — Different professions, different tasks

**Id:** `john-p2-e02` · **Tipo:** episódio · **Ordem na parte:** 2 · **Título:** Different professions, different tasks

**Contexto (literal):** John apresenta a equipe a um novo colega.

**Origem:** autoral (The Story of John) · arquivo `02_Work_Studies_and_Everyday_Life.md` a partir da linha 41 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p2-e02-l01 | John (`john`) | This is Mary Collins. She's a software engineer. | Esta é Mary Collins. Ela é engenheira de software. | c1eeeaf2 | bm_george | 02_Work_Studies_and_Everyday_Life.md:41 / 42 |
| 2 | john-p2-e02-l02 | New colleague (`role-new-colleague`) | What does she do exactly? | O que exatamente ela faz? *(rótulo na tradução: Novo colega)* | 7c9c0f59 | bf_alice | 02_Work_Studies_and_Everyday_Life.md:44 / 45 |
| 3 | john-p2-e02-l03 | John (`john`) | She designs and tests computer programmes. | Ela projeta e testa programas de computador. | b49a299d | bm_george | 02_Work_Studies_and_Everyday_Life.md:47 / 48 |
| 4 | john-p2-e02-l04 | Mary (`mary`) | And John analyses the projects and helps the teams organise their work. | E John analisa os projetos e ajuda as equipes a organizar o trabalho. | 46038317 | bf_emma | 02_Work_Studies_and_Everyday_Life.md:50 / 51 |
| 5 | john-p2-e02-l05 | New colleague (`role-new-colleague`) | Who looks after the office equipment? | Quem cuida dos equipamentos do escritório? *(rótulo na tradução: Novo colega)* | 105d702a | bf_alice | 02_Work_Studies_and_Everyday_Life.md:53 / 54 |
| 6 | john-p2-e02-l06 | Mary (`mary`) | Peter does. He's an electrician, and he repairs electrical appliances. | Peter cuida disso. Ele é eletricista e conserta aparelhos elétricos. | e350381d | bf_emma | 02_Work_Studies_and_Everyday_Life.md:56 / 57 |

#### Itens de vocabulário (13)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p2-e02-v01 | chunk | car salesperson | = | vendedor(a) de carros | — (não aparece literalmente) | 9f677704 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:63 |
| john-p2-e02-v02 | palavra | pilot | = | piloto(a) | — (não aparece literalmente) | 10066ae1 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:64 |
| john-p2-e02-v03 | palavra | engineer | = | engenheiro(a) | john-p2-e02-l01 | 9c3dd718 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:65 |
| john-p2-e02-v04 | palavra | electrician | = | eletricista | john-p2-e02-l06 | bd2efc56 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:66 |
| john-p2-e02-v05 | palavra | chef | = | chef de cozinha | — (não aparece literalmente) | a4430275 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:67 |
| john-p2-e02-v06 | chunk | taxi driver | = | taxista | — (não aparece literalmente) | b37f7bc9 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:68 |
| john-p2-e02-v07 | chunk | bus driver | = | motorista de ônibus | — (não aparece literalmente) | 580d2c59 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:69 |
| john-p2-e02-v08 | chunk | computer programmer | = | programador(a) | — (não aparece literalmente) | 2cd86698 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:70 |
| john-p2-e02-v09 | chunk | repair appliances | = | consertar aparelhos | john-p2-e02-l06 | 40a98bc8 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:71 |
| john-p2-e02-v10 | chunk | design engines | = | projetar motores | — (não aparece literalmente) | ac2c7070 | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:72 |
| john-p2-e02-v11 | chunk | teach French | = | ensinar francês | — (não aparece literalmente) | 5e5bcb2e | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:73 |
| john-p2-e02-v12 | chunk | sell vegetables | = | vender verduras | — (não aparece literalmente) | c48502bb | Vocabulary — professions and actions | 02_Work_Studies_and_Everyday_Life.md:74 |
| john-p2-e02-v13 | chunk | repair electrical appliances | = | consertar aparelhos elétricos | john-p2-e02-l06 | 6e1740c2 | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:231 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p2-e02-q01** (action) — Who does John introduce to the new colleague?
  - **(correta)** a) Mary Collins
  - b) Peter
  - c) Rick
  - Explicação: No diálogo — John: “This is Mary Collins. She's a software engineer.”
  - Falas de referência: john-p2-e02-l01
- **john-p2-e02-q02** (explicit_fact) — What is Mary's job?
  - **(correta)** a) Software engineer
  - b) Electrician
  - c) Project analyst
  - Explicação: No diálogo — John: “This is Mary Collins. She's a software engineer.”
  - Falas de referência: john-p2-e02-l01
- **john-p2-e02-q03** (explicit_fact) — What does Mary do exactly?
  - **(correta)** a) She designs and tests computer programmes
  - b) She repairs electrical appliances
  - c) She organises events
  - Explicação: No diálogo — John: “She designs and tests computer programmes.”
  - Falas de referência: john-p2-e02-l03
- **john-p2-e02-q04** (explicit_fact) — According to Mary, what does John do?
  - **(correta)** a) He analyses the projects and helps the teams organise their work
  - b) He designs computer programmes
  - c) He looks after the office equipment
  - Explicação: No diálogo — Mary: “And John analyses the projects and helps the teams organise their work.”
  - Falas de referência: john-p2-e02-l04
- **john-p2-e02-q05** (explicit_fact) — Who looks after the office equipment?
  - **(correta)** a) Peter
  - b) Mary
  - c) John
  - Explicação: No diálogo — New colleague: “Who looks after the office equipment?” / Mary: “Peter does. He's an electrician, and he repairs electrical appliances.”
  - Falas de referência: john-p2-e02-l05, john-p2-e02-l06
- **john-p2-e02-q06** (explicit_fact) — What is Peter's job?
  - **(correta)** a) Electrician
  - b) Software engineer
  - c) Photographer
  - Explicação: No diálogo — Mary: “Peter does. He's an electrician, and he repairs electrical appliances.”
  - Falas de referência: john-p2-e02-l06
- **john-p2-e02-q07** (action) — What does Peter repair?
  - **(correta)** a) Electrical appliances
  - b) Cars
  - c) Computer programmes
  - Explicação: No diálogo — Mary: “Peter does. He's an electrician, and he repairs electrical appliances.”
  - Falas de referência: john-p2-e02-l06
- **john-p2-e02-q08** (context) — Who is John talking to?
  - **(correta)** a) A new colleague
  - b) A student
  - c) A customer on the phone
  - Explicação: No diálogo — Contexto da cena: John apresenta a equipe a um novo colega.
  - Falas de referência: —
- **john-p2-e02-q09** (intention) — What does the new colleague want to know about Mary?
  - **(correta)** a) What she does exactly
  - b) How old she is
  - c) Where she lives
  - Explicação: No diálogo — New colleague: “What does she do exactly?”
  - Falas de referência: john-p2-e02-l02
- **john-p2-e02-q10** (relation) — Who explains John's work?
  - **(correta)** a) Mary
  - b) John himself
  - c) The new colleague
  - Explicação: No diálogo — Mary: “And John analyses the projects and helps the teams organise their work.”
  - Falas de referência: john-p2-e02-l04

#### Conteúdo das falas fora do inventário de itens

20 de 25 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: mary, collins, software, exactly, designs, tests, programmes, john, analyses, projects, helps, teams, organise, work, looks, after, office, equipment, peter, repairs.

### Episode 3 — Studying after work

**Id:** `john-p2-e03` · **Tipo:** episódio · **Ordem na parte:** 3 · **Título:** Studying after work

**Contexto (literal):** John decide fazer um curso de gestão de projectos.

**Origem:** autoral (The Story of John) · arquivo `02_Work_Studies_and_Everyday_Life.md` a partir da linha 82 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p2-e03-l01 | Rick (`rick`) | Are you still studying in the evenings? | Você ainda está estudando à noite? | 46d85e2b | bm_lewis | 02_Work_Studies_and_Everyday_Life.md:82 / 83 |
| 2 | john-p2-e03-l02 | John (`john`) | Yes. I'm taking an online course in project management. | Sim. Estou fazendo um curso on-line de gestão de projetos. | b7e6b67c | bm_george | 02_Work_Studies_and_Everyday_Life.md:85 / 86 |
| 3 | john-p2-e03-l03 | Rick (`rick`) | How often do you have classes? | Com que frequência você tem aulas? | b443f28a | bm_lewis | 02_Work_Studies_and_Everyday_Life.md:88 / 89 |
| 4 | john-p2-e03-l04 | John (`john`) | Twice a week. I usually study on Tuesdays and Thursdays. | Duas vezes por semana. Geralmente estudo às terças e quintas. | 886cf3c3 | bm_george | 02_Work_Studies_and_Everyday_Life.md:91 / 92 |
| 5 | john-p2-e03-l05 | Rick (`rick`) | Does it take a lot of time? | Isso toma muito tempo? | 5a4fa837 | bm_lewis | 02_Work_Studies_and_Everyday_Life.md:94 / 95 |
| 6 | john-p2-e03-l06 | John (`john`) | It does, but I've learnt a lot so far. | Sim, toma, mas aprendi bastante até agora. | ad83c0ab | bm_george | 02_Work_Studies_and_Everyday_Life.md:97 / 98 |
| 7 | john-p2-e03-l07 | Rick (`rick`) | That's great. Keep going! | Que ótimo. Continue! | e8f81a61 | bm_lewis | 02_Work_Studies_and_Everyday_Life.md:100 / 101 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Language focus — Present Perfect and experience up to now
*I've learnt a lot so far.* — Aprendi bastante até agora.
O Present Perfect pode apresentar uma experiência ou resultado ligado ao presente. No inglês britânico, **learnt** é uma forma muito comum do particípio de *learn*; **learned** também é correcto.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p2-e03-q01** (explicit_fact) — What course is John taking?
  - **(correta)** a) Project management
  - b) Business and Commerce
  - c) Photography
  - Explicação: No diálogo — John: “Yes. I'm taking an online course in project management.”
  - Falas de referência: john-p2-e03-l02
- **john-p2-e03-q02** (explicit_fact) — How is John taking the course?
  - **(correta)** a) Online
  - b) At the University of Manchester
  - c) At the office
  - Explicação: No diálogo — John: “Yes. I'm taking an online course in project management.”
  - Falas de referência: john-p2-e03-l02
- **john-p2-e03-q03** (explicit_fact) — How often does John have classes?
  - **(correta)** a) Twice a week
  - b) Every day
  - c) Once a month
  - Explicação: No diálogo — Rick: “How often do you have classes?” / John: “Twice a week. I usually study on Tuesdays and Thursdays.”
  - Falas de referência: john-p2-e03-l03, john-p2-e03-l04
- **john-p2-e03-q04** (explicit_fact) — On which days does John usually study?
  - **(correta)** a) Tuesdays and Thursdays
  - b) Mondays and Wednesdays
  - c) Saturdays and Sundays
  - Explicação: No diálogo — John: “Twice a week. I usually study on Tuesdays and Thursdays.”
  - Falas de referência: john-p2-e03-l04
- **john-p2-e03-q05** (explicit_fact) — Does the course take a lot of time?
  - **(correta)** a) Yes, it does
  - b) No, it doesn't
  - c) John doesn't know yet
  - Explicação: No diálogo — Rick: “Does it take a lot of time?” / John: “It does, but I've learnt a lot so far.”
  - Falas de referência: john-p2-e03-l05, john-p2-e03-l06
- **john-p2-e03-q06** (inference) — How does John feel about his progress?
  - **(correta)** a) He has learnt a lot so far
  - b) He hasn't learnt anything yet
  - c) He wants to stop the course
  - Explicação: No diálogo — John: “It does, but I've learnt a lot so far.”
  - Falas de referência: john-p2-e03-l06
- **john-p2-e03-q07** (intention) — What does Rick mean by "Keep going!"?
  - **(correta)** a) He encourages John to continue
  - b) He tells John to leave
  - c) He asks John to walk faster
  - Explicação: No diálogo — Rick: “That's great. Keep going!”
  - Falas de referência: john-p2-e03-l07
- **john-p2-e03-q08** (context) — What has John decided to do?
  - **(correta)** a) Take a course in project management
  - b) Change jobs
  - c) Move house
  - Explicação: No diálogo — Contexto da cena: John decide fazer um curso de gestão de projectos.
  - Falas de referência: —
- **john-p2-e03-q09** (inference) — What does Rick's question "Are you still studying in the evenings?" show?
  - **(correta)** a) John was already studying in the evenings before
  - b) John has never studied
  - c) Rick wants to start a course
  - Explicação: "still" indica continuidade. No diálogo — Rick: “Are you still studying in the evenings?”
  - Falas de referência: john-p2-e03-l01
- **john-p2-e03-q10** (relation) — Who asks John about the course?
  - **(correta)** a) Rick
  - b) Mary
  - c) Peter
  - Explicação: No diálogo — Rick: “Are you still studying in the evenings?” / Rick: “How often do you have classes?” / Rick: “Does it take a lot of time?”
  - Falas de referência: john-p2-e03-l01, john-p2-e03-l03, john-p2-e03-l05

#### Conteúdo das falas fora do inventário de itens

24 de 24 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: still, studying, evenings, taking, online, course, project, management, often, classes, twice, week, usually, study, tuesdays, thursdays, take, lot, time, learnt, far, great, keep, going.

### Episode 4 — A busy day

**Id:** `john-p2-e04` · **Tipo:** episódio · **Ordem na parte:** 4 · **Título:** A busy day

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `02_Work_Studies_and_Everyday_Life.md` a partir da linha 111 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p2-e04-l01 | Mary (`mary`) | John, are you free for a moment? | John, você está livre um instante? | 84156c8c | bf_emma | 02_Work_Studies_and_Everyday_Life.md:111 / 112 |
| 2 | john-p2-e04-l02 | John (`john`) | I'm afraid not. I'm dealing with a problem in the new system. | Infelizmente, não. Estou lidando com um problema no novo sistema. | c7c287c9 | bm_george | 02_Work_Studies_and_Everyday_Life.md:114 / 115 |
| 3 | john-p2-e04-l03 | Mary (`mary`) | Has the team found the cause? | A equipe encontrou a causa? | 4c03971e | bf_emma | 02_Work_Studies_and_Everyday_Life.md:117 / 118 |
| 4 | john-p2-e04-l04 | John (`john`) | Not yet. We've checked the files, but we haven't found the error. | Ainda não. Verificamos os arquivos, mas não encontramos o erro. | 3dc9901d | bm_george | 02_Work_Studies_and_Everyday_Life.md:120 / 121 |
| 5 | john-p2-e04-l05 | Mary (`mary`) | I can help. I know this part of the system. | Posso ajudar. Conheço esta parte do sistema. | a16254b3 | bf_emma | 02_Work_Studies_and_Everyday_Life.md:123 / 124 |
| 6 | john-p2-e04-l06 | John (`john`) | Thanks. That would be very helpful. | Obrigado. Isso ajudaria bastante. | bce5a950 | bm_george | 02_Work_Studies_and_Everyday_Life.md:126 / 127 |

#### Itens de vocabulário (6)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p2-e04-v01 | expressão | Are you free for a moment? | = | Você tem um instante disponível? | john-p2-e04-l01 | 2c7c9ac5 | Useful expressions | 02_Work_Studies_and_Everyday_Life.md:133 |
| john-p2-e04-v02 | expressão | I'm afraid not. | = | Infelizmente, não. | john-p2-e04-l02 | 55ee6e30 | Useful expressions | 02_Work_Studies_and_Everyday_Life.md:134 |
| john-p2-e04-v03 | expressão | deal with a problem | = | lidar com um problema | john-p2-e04-l02 | 41682b81 | Useful expressions | 02_Work_Studies_and_Everyday_Life.md:135 |
| john-p2-e04-v04 | chunk | find the cause | = | encontrar a causa | — (não aparece literalmente) | 2978e336 | Useful expressions | 02_Work_Studies_and_Everyday_Life.md:136 |
| john-p2-e04-v05 | chunk | not yet | = | ainda não | john-p2-e04-l04 | 6d9d33dc | Useful expressions | 02_Work_Studies_and_Everyday_Life.md:137 |
| john-p2-e04-v06 | expressão | That would be helpful. | = | Isso seria útil. | — (não aparece literalmente) | b6e9b90a | Useful expressions | 02_Work_Studies_and_Everyday_Life.md:138 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p2-e04-q01** (intention) — What does Mary want to know at the beginning?
  - **(correta)** a) If John is free for a moment
  - b) If John wants to leave early
  - c) If John can book a meeting room
  - Explicação: No diálogo — Mary: “John, are you free for a moment?”
  - Falas de referência: john-p2-e04-l01
- **john-p2-e04-q02** (explicit_fact) — Is John free?
  - **(correta)** a) No, he isn't
  - b) Yes, he is
  - c) Only after lunch
  - Explicação: No diálogo — Mary: “John, are you free for a moment?” / John: “I'm afraid not. I'm dealing with a problem in the new system.”
  - Falas de referência: john-p2-e04-l01, john-p2-e04-l02
- **john-p2-e04-q03** (action) — What is John dealing with?
  - **(correta)** a) A problem in the new system
  - b) A customer complaint
  - c) A broken light
  - Explicação: No diálogo — John: “I'm afraid not. I'm dealing with a problem in the new system.”
  - Falas de referência: john-p2-e04-l02
- **john-p2-e04-q04** (explicit_fact) — Has the team found the cause of the problem?
  - **(correta)** a) Not yet
  - b) Yes, they have
  - c) They haven't looked for it
  - Explicação: No diálogo — Mary: “Has the team found the cause?” / John: “Not yet. We've checked the files, but we haven't found the error.”
  - Falas de referência: john-p2-e04-l03, john-p2-e04-l04
- **john-p2-e04-q05** (action) — What have they already checked?
  - **(correta)** a) The files
  - b) The figures
  - c) The emails
  - Explicação: No diálogo — John: “Not yet. We've checked the files, but we haven't found the error.”
  - Falas de referência: john-p2-e04-l04
- **john-p2-e04-q06** (explicit_fact) — What haven't they found yet?
  - **(correta)** a) The error
  - b) The files
  - c) The report
  - Explicação: No diálogo — John: “Not yet. We've checked the files, but we haven't found the error.”
  - Falas de referência: john-p2-e04-l04
- **john-p2-e04-q07** (intention) — What does Mary offer?
  - **(correta)** a) To help John
  - b) To call Peter
  - c) To come back later
  - Explicação: No diálogo — Mary: “I can help. I know this part of the system.”
  - Falas de referência: john-p2-e04-l05
- **john-p2-e04-q08** (inference) — Why can Mary help?
  - **(correta)** a) She knows this part of the system
  - b) She is John's manager
  - c) She has already found the error
  - Explicação: No diálogo — Mary: “I can help. I know this part of the system.”
  - Falas de referência: john-p2-e04-l05
- **john-p2-e04-q09** (inference) — How does John react to Mary's offer?
  - **(correta)** a) He accepts and thanks her
  - b) He refuses her help
  - c) He doesn't answer
  - Explicação: No diálogo — John: “Thanks. That would be very helpful.”
  - Falas de referência: john-p2-e04-l06
- **john-p2-e04-q10** (context) — What kind of day is John having?
  - **(correta)** a) A busy day
  - b) A relaxing day
  - c) A day off
  - Explicação: No diálogo — Título do episódio: A busy day
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

15 de 22 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: john, dealing, new, system, team, found, we've, checked, files, haven't, error, help, know, part, thanks.

### Episode 5 — After work

**Id:** `john-p2-e05` · **Tipo:** episódio · **Ordem na parte:** 5 · **Título:** After work

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `02_Work_Studies_and_Everyday_Life.md` a partir da linha 142 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p2-e05-l01 | Peter (`peter`) | Are you going straight home, John? | Você vai direto para casa, John? | f6ade166 | bm_daniel | 02_Work_Studies_and_Everyday_Life.md:142 / 143 |
| 2 | john-p2-e05-l02 | John (`john`) | Not today. I'm meeting Rick and Jessy at the sports centre. | Hoje não. Vou encontrar Rick e Jessy no centro desportivo. | 398eda7e | bm_george | 02_Work_Studies_and_Everyday_Life.md:145 / 146 |
| 3 | john-p2-e05-l03 | Peter (`peter`) | Do you play football there? | Vocês jogam futebol lá? | 68282552 | bm_daniel | 02_Work_Studies_and_Everyday_Life.md:148 / 149 |
| 4 | john-p2-e05-l04 | John (`john`) | Sometimes. Today we're going swimming. | Às vezes. Hoje vamos nadar. | b6d31a92 | bm_george | 02_Work_Studies_and_Everyday_Life.md:151 / 152 |
| 5 | john-p2-e05-l05 | Peter (`peter`) | I haven't been swimming for ages. | Faz muito tempo que não vou nadar. | aeb814fc | bm_daniel | 02_Work_Studies_and_Everyday_Life.md:154 / 155 |
| 6 | john-p2-e05-l06 | John (`john`) | Come with us, then! | Então venha com a gente! | 027030be | bm_george | 02_Work_Studies_and_Everyday_Life.md:157 / 158 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Expression focus
- *for ages* — há muito tempo (informal).
- *go swimming* — ir nadar.
- *go straight home* — ir direto para casa.
- *come with us* — venha conosco.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p2-e05-q01** (intention) — What does Peter want to know?
  - **(correta)** a) If John is going straight home
  - b) If John wants to have dinner
  - c) If John likes swimming
  - Explicação: No diálogo — Peter: “Are you going straight home, John?”
  - Falas de referência: john-p2-e05-l01
- **john-p2-e05-q02** (explicit_fact) — Is John going straight home?
  - **(correta)** a) No, not today
  - b) Yes, he is
  - c) He doesn't know yet
  - Explicação: No diálogo — John: “Not today. I'm meeting Rick and Jessy at the sports centre.”
  - Falas de referência: john-p2-e05-l02
- **john-p2-e05-q03** (explicit_fact) — Who is John meeting?
  - **(correta)** a) Rick and Jessy
  - b) Mary and Peter
  - c) His family
  - Explicação: No diálogo — John: “Not today. I'm meeting Rick and Jessy at the sports centre.”
  - Falas de referência: john-p2-e05-l02
- **john-p2-e05-q04** (explicit_fact) — Where is John meeting them?
  - **(correta)** a) At the sports centre
  - b) At a café
  - c) At the station
  - Explicação: No diálogo — John: “Not today. I'm meeting Rick and Jessy at the sports centre.”
  - Falas de referência: john-p2-e05-l02
- **john-p2-e05-q05** (explicit_fact) — Does John play football there?
  - **(correta)** a) Sometimes
  - b) Never
  - c) Every day
  - Explicação: No diálogo — Peter: “Do you play football there?” / John: “Sometimes. Today we're going swimming.”
  - Falas de referência: john-p2-e05-l03, john-p2-e05-l04
- **john-p2-e05-q06** (action) — What are John and his friends doing today?
  - **(correta)** a) Going swimming
  - b) Playing football
  - c) Playing squash
  - Explicação: No diálogo — John: “Sometimes. Today we're going swimming.”
  - Falas de referência: john-p2-e05-l04
- **john-p2-e05-q07** (explicit_fact) — When did Peter last go swimming?
  - **(correta)** a) A long time ago
  - b) Yesterday
  - c) Last week
  - Explicação: No diálogo — Peter: “I haven't been swimming for ages.”
  - Falas de referência: john-p2-e05-l05
- **john-p2-e05-q08** (intention) — What does John suggest?
  - **(correta)** a) That Peter comes with them
  - b) That Peter goes home
  - c) That Peter plays football with them
  - Explicação: No diálogo — John: “Come with us, then!”
  - Falas de referência: john-p2-e05-l06
- **john-p2-e05-q09** (inference) — Why does John invite Peter?
  - **(correta)** a) Peter hasn't been swimming for ages
  - b) Peter is a swimming teacher
  - c) Peter asked to come
  - Explicação: No diálogo — Peter: “I haven't been swimming for ages.” / John: “Come with us, then!”
  - Falas de referência: john-p2-e05-l05, john-p2-e05-l06
- **john-p2-e05-q10** (context) — When does this conversation happen?
  - **(correta)** a) After work
  - b) Before work
  - c) At lunchtime
  - Explicação: No diálogo — Título do episódio: After work
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

18 de 18 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: going, straight, home, john, today, meeting, rick, jessy, sports, centre, play, football, sometimes, swimming, haven't, ages, come, then.

### Frequency and intention

**Id:** `john-p2-x01` · **Tipo:** mini-diálogo (seção complementar) · **Ordem na parte:** 6 · **Título:** Frequency and intention

**Contexto (literal):** O Present Simple também aparece com advérbios de frequência para hábitos.

**Origem:** autoral (The Story of John) · arquivo `02_Work_Studies_and_Everyday_Life.md` a partir da linha 211 · tradução: referência autoral — não validada pelo professor

#### Falas (2) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p2-x01-l01 | John (`john`) | I usually travel by train, but I sometimes drive to work. | Normalmente viajo de trem, mas às vezes vou de carro para o trabalho. | 455b9003 | bm_george | 02_Work_Studies_and_Everyday_Life.md:211 / 212 |
| 2 | john-p2-x01-l02 | Mary (`mary`) | I'm going to visit my aunt this weekend. | Vou visitar minha tia neste fim de semana. | 922cfb4b | bf_emma | 02_Work_Studies_and_Everyday_Life.md:216 / 217 |

#### Itens de vocabulário (9)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p2-x01-v01 | palavra | always | = | sempre | — (não aparece literalmente) | 6736afe4 | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:202 |
| john-p2-x01-v02 | palavra | usually | = | geralmente / normalmente | john-p2-x01-l01 | 0391d612 | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:203 |
| john-p2-x01-v03 | palavra | often | = | frequentemente | — (não aparece literalmente) | 9a6320f7 | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:204 |
| john-p2-x01-v04 | palavra | sometimes | = | às vezes | john-p2-x01-l01 | 5d689621 | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:205 |
| john-p2-x01-v05 | palavra | rarely | = | raramente | — (não aparece literalmente) | 5eef032e | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:206 |
| john-p2-x01-v06 | palavra | never | = | nunca | — (não aparece literalmente) | 0ac95089 | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:207 |
| john-p2-x01-v07 | chunk | every Saturday | = | todo sábado | — (não aparece literalmente) | d37bda53 | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:208 |
| john-p2-x01-v08 | chunk | twice a week | = | duas vezes por semana | — (não aparece literalmente) | 5df04aa4 | Frequency and intention | 02_Work_Studies_and_Everyday_Life.md:209 |
| john-p2-x01-v09 | chunk | uncle / aunt | uncle, aunt | tio / tia | john-p2-x01-l02 | bad59d74 | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:255 |

#### Questões de compreensão (3)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p2-x01-q01** (explicit_fact) — How does John usually travel?
  - **(correta)** a) By train
  - b) By car
  - c) By bus
  - Explicação: No diálogo — John: “I usually travel by train, but I sometimes drive to work.”
  - Falas de referência: john-p2-x01-l01
- **john-p2-x01-q02** (explicit_fact) — What does John sometimes do?
  - **(correta)** a) Drive to work
  - b) Walk to work
  - c) Work from home
  - Explicação: No diálogo — John: “I usually travel by train, but I sometimes drive to work.”
  - Falas de referência: john-p2-x01-l01
- **john-p2-x01-q03** (action) — What is Mary going to do this weekend?
  - **(correta)** a) Visit her aunt
  - b) Visit her uncle
  - c) Travel by train
  - Explicação: No diálogo — Mary: “I'm going to visit my aunt this weekend.”
  - Falas de referência: john-p2-x01-l02

#### Conteúdo das falas fora do inventário de itens

7 de 10 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: travel, train, drive, work, going, visit, weekend.

### Comparatives, superlatives and ages

**Id:** `john-p2-x02` · **Tipo:** mini-diálogo (seção complementar) · **Ordem na parte:** 7 · **Título:** Comparatives, superlatives and ages

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `02_Work_Studies_and_Everyday_Life.md` a partir da linha 246 · tradução: referência autoral — não validada pelo professor

#### Falas (1) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p2-x02-l01 | John (`john`) | My nephew Rodri is younger than Penelope, but he isn't the youngest person in the family. | Meu sobrinho Rodri é mais novo que Penelope, mas não é a pessoa mais nova da família. | d8e3b5c0 | bm_george | 02_Work_Studies_and_Everyday_Life.md:246 / 247 |

#### Itens de vocabulário (1)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p2-x02-v01 | chunk | nephew / niece | nephew, niece | sobrinho / sobrinha | john-p2-x02-l01 | 04a45ff0 | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:256 |

#### Questões de compreensão (3)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p2-x02-q01** (relation) — Who is Rodri?
  - **(correta)** a) John's nephew
  - b) John's brother
  - c) Penelope's father
  - Explicação: No diálogo — John: “My nephew Rodri is younger than Penelope, but he isn't the youngest person in the family.”
  - Falas de referência: john-p2-x02-l01
- **john-p2-x02-q02** (explicit_fact) — Who is younger, Rodri or Penelope?
  - **(correta)** a) Rodri
  - b) Penelope
  - c) They are the same age
  - Explicação: No diálogo — John: “My nephew Rodri is younger than Penelope, but he isn't the youngest person in the family.”
  - Falas de referência: john-p2-x02-l01
- **john-p2-x02-q03** (explicit_fact) — Is Rodri the youngest person in the family?
  - **(correta)** a) No, he isn't
  - b) Yes, he is
  - c) John doesn't know
  - Explicação: No diálogo — John: “My nephew Rodri is younger than Penelope, but he isn't the youngest person in the family.”
  - Falas de referência: john-p2-x02-l01

#### Conteúdo das falas fora do inventário de itens

7 de 8 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: rodri, younger, than, penelope, youngest, person, family.

## Itens das tabelas da fonte sem atividade correspondente (18)

Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.

| Inglês (literal) | Tabela | Fonte |
|---|---|---|
| car salesperson / car salesman | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:223 — “\| car salesperson / car salesman \| vendedor(a) de carros \|” |
| pilot | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:224 — “\| pilot \| piloto(a) \|” |
| fly an aeroplane | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:225 — “\| fly an aeroplane \| pilotar um avião \|” |
| design engines | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:227 — “\| design engines \| projetar motores \|” |
| grocer | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:228 — “\| grocer \| comerciante de mercearia / dono(a) de mercearia \|” |
| sell groceries | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:229 — “\| sell groceries \| vender produtos de mercearia \|” |
| businessman / businesswoman | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:232 — “\| businessman / businesswoman \| empresário / empresária \|” |
| work for a large company | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:233 — “\| work for a large company \| trabalhar para uma grande empresa \|” |
| chef | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:234 — “\| chef \| chef de cozinha \|” |
| cook in a restaurant | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:235 — “\| cook in a restaurant \| cozinhar em um restaurante \|” |
| taxi driver | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:236 — “\| taxi driver \| taxista \|” |
| drive a taxi | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:237 — “\| drive a taxi \| dirigir um táxi \|” |
| father / mother | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:253 — “\| father / mother \| pai / mãe \|” |
| brother / sister | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:254 — “\| brother / sister \| irmão / irmã \|” |
| grandson / granddaughter | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:257 — “\| grandson / granddaughter \| neto / neta \|” |
| cousin | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:258 — “\| cousin \| primo(a) \|” |
| parents | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:259 — “\| parents \| pais \|” |
| grandparents | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:260 — “\| grandparents \| avós \|” |

## Conteúdo da fonte que não está nos dados do app (literal)

Linhas de `02_Work_Studies_and_Everyday_Life.md` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.

**Linhas 1–5:**

```markdown
# THE STORY OF JOHN
## Part 2 — Work, Studies and Everyday Life
**Daily Routine English · British English**

> Continuação direta da Parte 1. John, Mary, Rick e Peter mantêm as características já estabelecidas. Os diálogos desta parte são autorais; os focos linguísticos retomam conteúdos presentes no acervo de referência.
```

**Linhas 59–59:**

```markdown
### Vocabulary — professions and actions
```

**Linhas 76–76:**

```markdown
**Nota BrE:** *programme* é a grafia britânica para programa de computador; *program* é comum no inglês americano e também aparece em alguns usos britânicos específicos.
```

**Linhas 129–129:**

```markdown
### Useful expressions
```

**Linhas 167–194:**

```markdown
## Practice

### A. Choose the correct tense

1. John usually (arrives / is arriving) at half past eight.
2. Mary (tests / is testing) the new programme at the moment.
3. Peter (repairs / is repairing) electrical appliances for a living.
4. John (has learnt / learns) a lot so far.

### B. Translate into English

1. Eu geralmente verifico meus e-mails pela manhã.
2. Mary está preparando uma apresentação neste momento.
3. Peter conserta aparelhos elétricos.
4. Estou fazendo um curso de gestão de projetos.
5. Ainda não encontramos o erro.

### C. Speaking / writing

Describe a typical working or studying day. Then describe what you are doing this week that is different from your normal routine.

### Suggested answers

**A:** 1. arrives; 2. is testing; 3. repairs; 4. has learnt.

**B:** 1. I usually check my emails in the morning. 2. Mary is preparing a presentation at the moment. 3. Peter repairs electrical appliances. 4. I'm taking a course in project management. 5. We haven't found the error yet.

## Source coverage — habits, professions, ages and family
```

**Linhas 214–214:**

```markdown
**Future with intention — be going to + verb:** expressa intenção/plano. Não confundir *I'm going* (estou indo) com *I'm going to study* (vou estudar / pretendo estudar).
```

**Linhas 219–219:**

```markdown
### Professions and actions — expanded inventory
```

**Linhas 226–226:**

```markdown
| engineer | engenheiro(a) |
```

**Linhas 230–230:**

```markdown
| electrician | eletricista |
```

**Linhas 241–244:**

```markdown
- *young → younger → youngest* — jovem → mais jovem → o(a) mais jovem.
- *old → older → oldest* — velho/idoso → mais velho → o(a) mais velho(a).
- *the biggest* — o maior; *the most beautiful* — o mais bonito.
- *two years younger than* — dois anos mais novo(a) que.
```

**Linhas 249–249:**

```markdown
### Family relationships — complete reference
```

**Linhas 262–275:**

```markdown
- My father's brother is my **uncle**. — O irmão do meu pai é meu tio.
- My mother's sister is my **aunt**. — A irmã da minha mãe é minha tia.
- My brother's son is my **nephew**. — O filho do meu irmão é meu sobrinho.
- My brother's daughter is my **niece**. — A filha do meu irmão é minha sobrinha.
- My uncle's and aunt's children are my **cousins**. — Os filhos dos meus tios são meus primos.
- My son's son is my **grandson**. — O filho do meu filho é meu neto.
- My daughter's daughter is my **granddaughter**. — A filha da minha filha é minha neta.

### Reading and comprehension — a workday

**John usually leaves the office at five, but today he's leaving earlier because he's meeting a friend.**  
*John normalmente sai do escritório às cinco, mas hoje está saindo mais cedo porque vai encontrar um amigo.*

Perguntas de compreensão devem distinguir hábito (*usually leaves*) de situação excepcional (*today he's leaving*), identificar horário e motivo, e reconhecer superlativos como *the biggest* e *the most beautiful*.
```

---

# The Story of John — Parte 3: Family, Friends and Relationships

**Pacote:** The Story of John (`the-story-of-john`, conteúdo `118297cacc48`, idioma en-GB) · **Parte:** `john-p3` · **Arquivo-fonte:** `dev/content/dialogues/source/the-story-of-john/03_Family_Friends_and_Relationships.md`

**Origem do pacote (literal):** Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.

**Atividades:** 7 (5 episódios, 2 mini-diálogos) · **Falas:** 39 · **Itens:** 37 · **Questões:** 56

## Atividades

- [`john-p3-e01` — Sunday lunch](#episode-1-sunday-lunch)
- [`john-p3-e02` — Who is older?](#episode-2-who-is-older)
- [`john-p3-e03` — Family connections](#episode-3-family-connections)
- [`john-p3-e04` — A story about two friends](#episode-4-a-story-about-two-friends)
- [`john-p3-e05` — Opinions and preferences](#episode-5-opinions-and-preferences)
- [`john-p3-x01` — Asking for and expressing opinions](#asking-for-and-expressing-opinions)
- [`john-p3-x02` — Wedding celebrations — British vocabulary](#wedding-celebrations-british-vocabulary)

## Conteúdo por atividade

### Episode 1 — Sunday lunch

**Id:** `john-p3-e01` · **Tipo:** episódio · **Ordem na parte:** 1 · **Título:** Sunday lunch

**Contexto (literal):** John convida alguns familiares e amigos para almoçar. Mary conhece parte da família dele.

**Origem:** autoral (The Story of John) · arquivo `03_Family_Friends_and_Relationships.md` a partir da linha 9 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p3-e01-l01 | John (`john`) | Mary, this is my sister, Ana Mitchell. | Mary, esta é minha irmã, Ana Mitchell. | 7ccfdfdd | bm_george | 03_Family_Friends_and_Relationships.md:9 / 10 |
| 2 | john-p3-e01-l02 | Mary (`mary`) | Nice to meet you, Ana. | Prazer em conhecer você, Ana. | f9956403 | bf_emma | 03_Family_Friends_and_Relationships.md:12 / 13 |
| 3 | john-p3-e01-l03 | Ana (`ana`) | Nice to meet you too. Are you John's colleague? | Prazer em conhecer você também. Você é colega do John? | ebe6ccd4 | bf_lily | 03_Family_Friends_and_Relationships.md:15 / 16 |
| 4 | john-p3-e01-l04 | Mary (`mary`) | Yes. We work together. | Sim. Trabalhamos juntos. | 29fb6127 | bf_emma | 03_Family_Friends_and_Relationships.md:18 / 19 |
| 5 | john-p3-e01-l05 | John (`john`) | And this is my uncle, Stuart Hughes. He's my mother's brother. | E este é meu tio, Stuart Hughes. Ele é irmão da minha mãe. | 0b2b7b49 | bm_george | 03_Family_Friends_and_Relationships.md:21 / 22 |
| 6 | john-p3-e01-l06 | Stuart (`stuart`) | Hello, Mary. Please, sit down. | Olá, Mary. Por favor, sente-se. | 38353a0d | bm_daniel | 03_Family_Friends_and_Relationships.md:24 / 25 |
| 7 | john-p3-e01-l07 | Mary (`mary`) | Thank you. What a lovely family! | Obrigada. Que família adorável! | 01e81ea9 | bf_emma | 03_Family_Friends_and_Relationships.md:27 / 28 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p3-e01-q01** (relation) — Who is Ana Mitchell?
  - **(correta)** a) John's sister
  - b) John's colleague
  - c) John's cousin
  - Explicação: No diálogo — John: “Mary, this is my sister, Ana Mitchell.”
  - Falas de referência: john-p3-e01-l01
- **john-p3-e01-q02** (action) — Who introduces Ana to Mary?
  - **(correta)** a) John
  - b) Stuart
  - c) Ana herself
  - Explicação: No diálogo — John: “Mary, this is my sister, Ana Mitchell.”
  - Falas de referência: john-p3-e01-l01
- **john-p3-e01-q03** (intention) — What does Ana want to know about Mary?
  - **(correta)** a) If she is John's colleague
  - b) Where she lives
  - c) If she is married
  - Explicação: No diálogo — Ana: “Nice to meet you too. Are you John's colleague?”
  - Falas de referência: john-p3-e01-l03
- **john-p3-e01-q04** (explicit_fact) — Do Mary and John work together?
  - **(correta)** a) Yes, they do
  - b) No, they don't
  - c) Only sometimes
  - Explicação: No diálogo — Mary: “Yes. We work together.”
  - Falas de referência: john-p3-e01-l04
- **john-p3-e01-q05** (relation) — Who is Stuart Hughes?
  - **(correta)** a) John's uncle
  - b) John's father
  - c) John's neighbour
  - Explicação: No diálogo — John: “And this is my uncle, Stuart Hughes. He's my mother's brother.”
  - Falas de referência: john-p3-e01-l05
- **john-p3-e01-q06** (relation) — Whose brother is Stuart?
  - **(correta)** a) John's mother's
  - b) John's father's
  - c) Mary's
  - Explicação: No diálogo — John: “And this is my uncle, Stuart Hughes. He's my mother's brother.”
  - Falas de referência: john-p3-e01-l05
- **john-p3-e01-q07** (action) — What does Stuart ask Mary to do?
  - **(correta)** a) Sit down
  - b) Help in the kitchen
  - c) Take a photograph
  - Explicação: No diálogo — Stuart: “Hello, Mary. Please, sit down.”
  - Falas de referência: john-p3-e01-l06
- **john-p3-e01-q08** (inference) — What does Mary think of John's family?
  - **(correta)** a) It's lovely
  - b) It's too big
  - c) It's very noisy
  - Explicação: No diálogo — Mary: “Thank you. What a lovely family!”
  - Falas de referência: john-p3-e01-l07
- **john-p3-e01-q09** (context) — What is the occasion?
  - **(correta)** a) A lunch with family and friends
  - b) A business meeting
  - c) A birthday party
  - Explicação: No diálogo — Contexto da cena: John convida alguns familiares e amigos para almoçar. Mary conhece parte da família dele.
  - Falas de referência: —
- **john-p3-e01-q10** (inference) — Is this the first time Mary and Ana meet?
  - **(correta)** a) Yes — they say "Nice to meet you"
  - b) No, they are old friends
  - c) No, they work together
  - Explicação: No diálogo — Mary: “Nice to meet you, Ana.” / Ana: “Nice to meet you too. Are you John's colleague?”
  - Falas de referência: john-p3-e01-l02, john-p3-e01-l03

#### Conteúdo das falas fora do inventário de itens

23 de 23 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: mary, sister, ana, mitchell, nice, meet, too, john's, colleague, work, together, uncle, stuart, hughes, mother's, brother, hello, please, sit, down, thank, lovely, family.

### Episode 2 — Who is older?

**Id:** `john-p3-e02` · **Tipo:** episódio · **Ordem na parte:** 2 · **Título:** Who is older?

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `03_Family_Friends_and_Relationships.md` a partir da linha 32 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p3-e02-l01 | Rick (`rick`) | Is Stuart your oldest uncle, John? | Stuart é seu tio mais velho, John? | 0e9a4541 | bm_lewis | 03_Family_Friends_and_Relationships.md:32 / 33 |
| 2 | john-p3-e02-l02 | John (`john`) | No. He's younger than my uncle Peter, but he's older than my father. | Não. Ele é mais novo que meu tio Peter, mas é mais velho que meu pai. | 6b7a971c | bm_george | 03_Family_Friends_and_Relationships.md:35 / 36 |
| 3 | john-p3-e02-l03 | Jessy (`jessy`) | How old is your sister? | Quantos anos sua irmã tem? | 06069b76 | bf_isabella | 03_Family_Friends_and_Relationships.md:38 / 39 |
| 4 | john-p3-e02-l04 | John (`john`) | Ana is twenty-eight. I'm thirty-two. | Ana tem vinte e oito anos. Eu tenho trinta e dois. | befd1a29 | bm_george | 03_Family_Friends_and_Relationships.md:41 / 42 |
| 5 | john-p3-e02-l05 | Rick (`rick`) | So you're older than Ana. | Então você é mais velho que Ana. | 52341fab | bm_lewis | 03_Family_Friends_and_Relationships.md:44 / 45 |
| 6 | john-p3-e02-l06 | John (`john`) | That's right, but she's the tallest person in our family! | Isso mesmo, mas ela é a pessoa mais alta da nossa família! | 3ead1e87 | bm_george | 03_Family_Friends_and_Relationships.md:47 / 48 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Language focus — comparatives and superlatives
**Adjectives curtos:**
- young → younger → the youngest
- old → older → the oldest
- tall → taller → the tallest
- funny → funnier → the funniest
**Adjectives longos:**
- handsome → more handsome → the most handsome
- interesting → more interesting → the most interesting
**Irregular:**
- good → better → the best
- bad → worse → the worst
Estruturas:
- *Stuart is older than John.* — Stuart é mais velho que John.
- *Ana is the tallest in the family.* — Ana é a mais alta da família.
- *as old as* — tão velho quanto.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p3-e02-q01** (explicit_fact) — Is Stuart John's oldest uncle?
  - **(correta)** a) No, he isn't
  - b) Yes, he is
  - c) John doesn't know
  - Explicação: No diálogo — Rick: “Is Stuart your oldest uncle, John?” / John: “No. He's younger than my uncle Peter, but he's older than my father.”
  - Falas de referência: john-p3-e02-l01, john-p3-e02-l02
- **john-p3-e02-q02** (relation) — Who is older than Stuart?
  - **(correta)** a) John's uncle Peter
  - b) John's father
  - c) Ana
  - Explicação: No diálogo — John: “No. He's younger than my uncle Peter, but he's older than my father.”
  - Falas de referência: john-p3-e02-l02
- **john-p3-e02-q03** (relation) — Who is younger than Stuart?
  - **(correta)** a) John's father
  - b) John's uncle Peter
  - c) Rick
  - Explicação: No diálogo — John: “No. He's younger than my uncle Peter, but he's older than my father.”
  - Falas de referência: john-p3-e02-l02
- **john-p3-e02-q04** (inference) — Which order, from the oldest to the youngest, is correct?
  - **(correta)** a) Uncle Peter, Stuart, John's father
  - b) John's father, Stuart, uncle Peter
  - c) Stuart, uncle Peter, John's father
  - Explicação: No diálogo — John: “No. He's younger than my uncle Peter, but he's older than my father.”
  - Falas de referência: john-p3-e02-l02
- **john-p3-e02-q05** (explicit_fact) — How old is Ana?
  - **(correta)** a) Twenty-eight
  - b) Thirty-two
  - c) Twenty-two
  - Explicação: No diálogo — John: “Ana is twenty-eight. I'm thirty-two.”
  - Falas de referência: john-p3-e02-l04
- **john-p3-e02-q06** (explicit_fact) — How old is John?
  - **(correta)** a) Thirty-two
  - b) Twenty-eight
  - c) Thirty
  - Explicação: No diálogo — John: “Ana is twenty-eight. I'm thirty-two.”
  - Falas de referência: john-p3-e02-l04
- **john-p3-e02-q07** (inference) — What does Rick conclude?
  - **(correta)** a) That John is older than Ana
  - b) That Ana is older than John
  - c) That they are twins
  - Explicação: No diálogo — John: “Ana is twenty-eight. I'm thirty-two.” / Rick: “So you're older than Ana.”
  - Falas de referência: john-p3-e02-l04, john-p3-e02-l05
- **john-p3-e02-q08** (inference) — How many years older than Ana is John?
  - **(correta)** a) Four
  - b) Two
  - c) Ten
  - Explicação: 32 − 28 = 4. No diálogo — John: “Ana is twenty-eight. I'm thirty-two.”
  - Falas de referência: john-p3-e02-l04
- **john-p3-e02-q09** (inference) — Who is the tallest person in John's family?
  - **(correta)** a) Ana
  - b) John
  - c) Stuart
  - Explicação: "she" retoma Ana, de quem falam na fala anterior. No diálogo — Rick: “So you're older than Ana.” / John: “That's right, but she's the tallest person in our family!”
  - Falas de referência: john-p3-e02-l05, john-p3-e02-l06
- **john-p3-e02-q10** (relation) — Who asks about Ana's age?
  - **(correta)** a) Jessy
  - b) Rick
  - c) Mary
  - Explicação: No diálogo — Jessy: “How old is your sister?”
  - Falas de referência: john-p3-e02-l03

#### Conteúdo das falas fora do inventário de itens

20 de 20 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: stuart, oldest, uncle, john, younger, than, peter, older, father, old, sister, ana, twenty, eight, thirty, two, right, tallest, person, family.

### Episode 3 — Family connections

**Id:** `john-p3-e03` · **Tipo:** episódio · **Ordem na parte:** 3 · **Título:** Family connections

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `03_Family_Friends_and_Relationships.md` a partir da linha 73 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p3-e03-l01 | Jessy (`jessy`) | Who is the little girl in this photograph? | Quem é a menininha nesta fotografia? | 30005ad8 | bf_isabella | 03_Family_Friends_and_Relationships.md:73 / 74 |
| 2 | john-p3-e03-l02 | John (`john`) | She's my niece, Penelope Clarke. She's my sister's daughter. | Ela é minha sobrinha, Penelope Clarke. É filha da minha irmã. | 9c622ae6 | bm_george | 03_Family_Friends_and_Relationships.md:76 / 77 |
| 3 | john-p3-e03-l03 | Mary (`mary`) | And the boy next to her? | E o menino ao lado dela? | 927eec1f | bf_emma | 03_Family_Friends_and_Relationships.md:79 / 80 |
| 4 | john-p3-e03-l04 | John (`john`) | That's my nephew, Rodri Morgan. He's my brother's son. | Aquele é meu sobrinho, Rodri Morgan. É filho do meu irmão. | 7801c0fb | bm_george | 03_Family_Friends_and_Relationships.md:82 / 83 |
| 5 | john-p3-e03-l05 | Rick (`rick`) | Do they live nearby? | Eles moram perto? | ce1e2958 | bm_lewis | 03_Family_Friends_and_Relationships.md:85 / 86 |
| 6 | john-p3-e03-l06 | John (`john`) | Yes. Their grandparents live in the same town. | Sim. Os avós deles moram na mesma cidade. | dd81d5e0 | bm_george | 03_Family_Friends_and_Relationships.md:88 / 89 |

#### Itens de vocabulário (9)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p3-e03-v01 | chunk | mother / father | mother, father | mãe / pai | — (não aparece literalmente) | 1b43c22c | Family vocabulary | 03_Family_Friends_and_Relationships.md:95 |
| john-p3-e03-v02 | chunk | brother / sister | brother, sister | irmão / irmã | — (não aparece literalmente) | 5c07082d | Family vocabulary | 03_Family_Friends_and_Relationships.md:96 |
| john-p3-e03-v03 | chunk | uncle / aunt | uncle, aunt | tio / tia | — (não aparece literalmente) | bad59d74 | Family vocabulary | 03_Family_Friends_and_Relationships.md:97 |
| john-p3-e03-v04 | chunk | nephew / niece | nephew, niece | sobrinho / sobrinha | john-p3-e03-l02, john-p3-e03-l04 | 04a45ff0 | Family vocabulary | 03_Family_Friends_and_Relationships.md:98 |
| john-p3-e03-v05 | palavra | cousin | = | primo(a) | — (não aparece literalmente) | 3799e184 | Family vocabulary | 03_Family_Friends_and_Relationships.md:99 |
| john-p3-e03-v06 | chunk | grandson / granddaughter | grandson, granddaughter | neto / neta | — (não aparece literalmente) | 9e37497b | Family vocabulary | 03_Family_Friends_and_Relationships.md:100 |
| john-p3-e03-v07 | palavra | grandparents | = | avós | john-p3-e03-l06 | 18126fc2 | Family vocabulary | 03_Family_Friends_and_Relationships.md:101 |
| john-p3-e03-v08 | palavra | relatives | = | parentes | — (não aparece literalmente) | ef8af02a | Family vocabulary | 03_Family_Friends_and_Relationships.md:102 |
| john-p3-e03-v09 | chunk | daughter / son | daughter, son | filha / filho | john-p3-e03-l02, john-p3-e03-l04 | defd411b | Family vocabulary | 03_Family_Friends_and_Relationships.md:103 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p3-e03-q01** (context) — What are they looking at?
  - **(correta)** a) A photograph
  - b) A video
  - c) A map
  - Explicação: No diálogo — Jessy: “Who is the little girl in this photograph?”
  - Falas de referência: john-p3-e03-l01
- **john-p3-e03-q02** (explicit_fact) — Who is the little girl?
  - **(correta)** a) Penelope Clarke
  - b) Ana Mitchell
  - c) Joana Fletcher
  - Explicação: No diálogo — Jessy: “Who is the little girl in this photograph?” / John: “She's my niece, Penelope Clarke. She's my sister's daughter.”
  - Falas de referência: john-p3-e03-l01, john-p3-e03-l02
- **john-p3-e03-q03** (relation) — Whose daughter is Penelope?
  - **(correta)** a) John's sister's
  - b) John's brother's
  - c) John's cousin's
  - Explicação: No diálogo — John: “She's my niece, Penelope Clarke. She's my sister's daughter.”
  - Falas de referência: john-p3-e03-l02
- **john-p3-e03-q04** (relation) — What is Penelope to John?
  - **(correta)** a) His niece
  - b) His daughter
  - c) His cousin
  - Explicação: No diálogo — John: “She's my niece, Penelope Clarke. She's my sister's daughter.”
  - Falas de referência: john-p3-e03-l02
- **john-p3-e03-q05** (explicit_fact) — Who is the boy next to Penelope?
  - **(correta)** a) Rodri Morgan
  - b) Peter Walker
  - c) Stuart Hughes
  - Explicação: No diálogo — Mary: “And the boy next to her?” / John: “That's my nephew, Rodri Morgan. He's my brother's son.”
  - Falas de referência: john-p3-e03-l03, john-p3-e03-l04
- **john-p3-e03-q06** (relation) — Whose son is Rodri?
  - **(correta)** a) John's brother's
  - b) John's sister's
  - c) Stuart's
  - Explicação: No diálogo — John: “That's my nephew, Rodri Morgan. He's my brother's son.”
  - Falas de referência: john-p3-e03-l04
- **john-p3-e03-q07** (relation) — What is Rodri to John?
  - **(correta)** a) His nephew
  - b) His son
  - c) His brother
  - Explicação: No diálogo — John: “That's my nephew, Rodri Morgan. He's my brother's son.”
  - Falas de referência: john-p3-e03-l04
- **john-p3-e03-q08** (explicit_fact) — Do Penelope and Rodri live nearby?
  - **(correta)** a) Yes, they do
  - b) No, they don't
  - c) Only Rodri does
  - Explicação: No diálogo — Rick: “Do they live nearby?” / John: “Yes. Their grandparents live in the same town.”
  - Falas de referência: john-p3-e03-l05, john-p3-e03-l06
- **john-p3-e03-q09** (explicit_fact) — Who lives in the same town?
  - **(correta)** a) Their grandparents
  - b) Their teachers
  - c) Rick and Jessy
  - Explicação: No diálogo — John: “Yes. Their grandparents live in the same town.”
  - Falas de referência: john-p3-e03-l06
- **john-p3-e03-q10** (inference) — What are Penelope and Rodri to each other?
  - **(correta)** a) Cousins
  - b) Brother and sister
  - c) Just neighbours
  - Explicação: filha da irmã e filho do irmão de John são primos. No diálogo — John: “She's my niece, Penelope Clarke. She's my sister's daughter.” / John: “That's my nephew, Rodri Morgan. He's my brother's son.”
  - Falas de referência: john-p3-e03-l02, john-p3-e03-l04

#### Conteúdo das falas fora do inventário de itens

15 de 20 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: little, girl, photograph, penelope, clarke, sister's, boy, next, rodri, morgan, brother's, live, nearby, same, town.

### Episode 4 — A story about two friends

**Id:** `john-p3-e04` · **Tipo:** episódio · **Ordem na parte:** 4 · **Título:** A story about two friends

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `03_Family_Friends_and_Relationships.md` a partir da linha 107 · tradução: referência autoral — não validada pelo professor

#### Falas (8) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p3-e04-l01 | Mary (`mary`) | Who's that man in the photograph with Rick? | Quem é aquele homem na fotografia com Rick? | 364a45e6 | bf_emma | 03_Family_Friends_and_Relationships.md:107 / 108 |
| 2 | john-p3-e04-l02 | John (`john`) | That's Peter Walker. He's one of Rick's oldest friends. | Aquele é Peter Walker. Ele é um dos amigos mais antigos de Rick. | 7477c624 | bm_george | 03_Family_Friends_and_Relationships.md:110 / 111 |
| 3 | john-p3-e04-l03 | Mary (`mary`) | Is he the most talkative one? | Ele é o mais falante? | 085f3766 | bf_emma | 03_Family_Friends_and_Relationships.md:113 / 114 |
| 4 | john-p3-e04-l04 | John (`john`) | Definitely! He's probably the funniest person in the group. | Com certeza! Provavelmente é a pessoa mais engraçada do grupo. | 22c2eb9f | bm_george | 03_Family_Friends_and_Relationships.md:116 / 117 |
| 5 | john-p3-e04-l05 | Mary (`mary`) | I think Rick is funnier. | Acho Rick mais engraçado. | 5a26b3e0 | bf_emma | 03_Family_Friends_and_Relationships.md:119 / 120 |
| 6 | john-p3-e04-l06 | John (`john`) | Maybe a little, but Peter is more outgoing than Rick. | Talvez um pouco, mas Peter é mais extrovertido que Rick. | b126971d | bm_george | 03_Family_Friends_and_Relationships.md:122 / 123 |
| 7 | john-p3-e04-l07 | Mary (`mary`) | Which one do you prefer spending time with? | Com qual dos dois você prefere passar o tempo? | 746979fe | bf_emma | 03_Family_Friends_and_Relationships.md:125 / 126 |
| 8 | john-p3-e04-l08 | John (`john`) | I like them both. They're different, but they're both great friends. | Gosto dos dois. São diferentes, mas ambos são ótimos amigos. | f6c80a22 | bm_george | 03_Family_Friends_and_Relationships.md:128 / 129 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p3-e04-q01** (explicit_fact) — Who is the man with Rick in the photograph?
  - **(correta)** a) Peter Walker
  - b) Stuart Hughes
  - c) Ruan Parker
  - Explicação: No diálogo — Mary: “Who's that man in the photograph with Rick?” / John: “That's Peter Walker. He's one of Rick's oldest friends.”
  - Falas de referência: john-p3-e04-l01, john-p3-e04-l02
- **john-p3-e04-q02** (relation) — What is Peter to Rick?
  - **(correta)** a) One of his oldest friends
  - b) His brother
  - c) His colleague
  - Explicação: No diálogo — John: “That's Peter Walker. He's one of Rick's oldest friends.”
  - Falas de referência: john-p3-e04-l02
- **john-p3-e04-q03** (explicit_fact) — Is Peter the most talkative one?
  - **(correta)** a) Yes, definitely
  - b) No, he's very quiet
  - c) John isn't sure
  - Explicação: No diálogo — Mary: “Is he the most talkative one?” / John: “Definitely! He's probably the funniest person in the group.”
  - Falas de referência: john-p3-e04-l03, john-p3-e04-l04
- **john-p3-e04-q04** (explicit_fact) — How does John describe Peter?
  - **(correta)** a) Probably the funniest person in the group
  - b) The quietest person in the group
  - c) The oldest person in the group
  - Explicação: No diálogo — John: “Definitely! He's probably the funniest person in the group.”
  - Falas de referência: john-p3-e04-l04
- **john-p3-e04-q05** (explicit_fact) — Who does Mary think is funnier?
  - **(correta)** a) Rick
  - b) Peter
  - c) John
  - Explicação: No diálogo — Mary: “I think Rick is funnier.”
  - Falas de referência: john-p3-e04-l05
- **john-p3-e04-q06** (explicit_fact) — According to John, who is more outgoing?
  - **(correta)** a) Peter
  - b) Rick
  - c) Mary
  - Explicação: No diálogo — John: “Maybe a little, but Peter is more outgoing than Rick.”
  - Falas de referência: john-p3-e04-l06
- **john-p3-e04-q07** (inference) — Does John completely disagree with Mary?
  - **(correta)** a) No — he says "Maybe a little"
  - b) Yes, completely
  - c) He doesn't answer her
  - Explicação: No diálogo — Mary: “I think Rick is funnier.” / John: “Maybe a little, but Peter is more outgoing than Rick.”
  - Falas de referência: john-p3-e04-l05, john-p3-e04-l06
- **john-p3-e04-q08** (intention) — What does Mary want to know at the end?
  - **(correta)** a) Which friend John prefers spending time with
  - b) Where Peter lives
  - c) How old Rick is
  - Explicação: No diálogo — Mary: “Which one do you prefer spending time with?”
  - Falas de referência: john-p3-e04-l07
- **john-p3-e04-q09** (explicit_fact) — Who does John prefer?
  - **(correta)** a) He likes them both
  - b) Peter
  - c) Rick
  - Explicação: No diálogo — John: “I like them both. They're different, but they're both great friends.”
  - Falas de referência: john-p3-e04-l08
- **john-p3-e04-q10** (explicit_fact) — What does John say about his two friends?
  - **(correta)** a) They're different, but both great friends
  - b) They're very similar
  - c) They don't like each other
  - Explicação: No diálogo — John: “I like them both. They're different, but they're both great friends.”
  - Falas de referência: john-p3-e04-l08

#### Conteúdo das falas fora do inventário de itens

31 de 31 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: who's, man, photograph, rick, peter, walker, one, rick's, oldest, friends, most, talkative, definitely, probably, funniest, person, group, think, funnier, maybe, little, more, outgoing, than, prefer, spending, time, like, both, different, great.

### Episode 5 — Opinions and preferences

**Id:** `john-p3-e05` · **Tipo:** episódio · **Ordem na parte:** 5 · **Título:** Opinions and preferences

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `03_Family_Friends_and_Relationships.md` a partir da linha 133 · tradução: referência autoral — não validada pelo professor

#### Falas (5) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p3-e05-l01 | Jessy (`jessy`) | What do you think of the new café? | O que você acha do novo café? | afc550af | bf_isabella | 03_Family_Friends_and_Relationships.md:133 / 134 |
| 2 | john-p3-e05-l02 | John (`john`) | I think it's nicer than the old one. | Acho que é mais agradável que o antigo. | b4b58c12 | bm_george | 03_Family_Friends_and_Relationships.md:136 / 137 |
| 3 | john-p3-e05-l03 | Rick (`rick`) | Really? I don't think it's as good as the café near the station. | Sério? Não acho que seja tão bom quanto o café perto da estação. | a1b81329 | bm_lewis | 03_Family_Friends_and_Relationships.md:139 / 140 |
| 4 | john-p3-e05-l04 | Mary (`mary`) | Which one do you prefer, then? | Então, de qual você gosta mais? | 76c8787a | bf_emma | 03_Family_Friends_and_Relationships.md:142 / 143 |
| 5 | john-p3-e05-l05 | Rick (`rick`) | I prefer the one near the station. Their coffee is the best. | Prefiro o que fica perto da estação. O café deles é o melhor. | c0f089a7 | bm_lewis | 03_Family_Friends_and_Relationships.md:145 / 146 |

#### Itens de vocabulário (9)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p3-e05-v01 | expressão | What do you think of...? | What do you think of? | O que você acha de...? | john-p3-e05-l01 | 39bcdc41 | Chunks | 03_Family_Friends_and_Relationships.md:152 |
| john-p3-e05-v02 | expressão | Which one do you prefer? | = | De qual você prefere? | john-p3-e05-l04 | e2610817 | Chunks | 03_Family_Friends_and_Relationships.md:153 |
| john-p3-e05-v03 | expressão | I prefer... | I prefer | Eu prefiro... | john-p3-e05-l05 | 0914b422 | Chunks | 03_Family_Friends_and_Relationships.md:154 |
| john-p3-e05-v04 | expressão | I think... | I think | Eu acho... | john-p3-e05-l02, john-p3-e05-l03 | 8e43efbc | Chunks | 03_Family_Friends_and_Relationships.md:155 |
| john-p3-e05-v05 | chunk | a bit | = | um pouco | — (não aparece literalmente) | 616bf52f | Chunks | 03_Family_Friends_and_Relationships.md:156 |
| john-p3-e05-v06 | chunk | not that handsome | = | não tão bonito assim | — (não aparece literalmente) | a72838e8 | Chunks | 03_Family_Friends_and_Relationships.md:157 |
| john-p3-e05-v07 | chunk | the nicest | = | o mais simpático / agradável | — (não aparece literalmente) | 182f2752 | Chunks | 03_Family_Friends_and_Relationships.md:158 |
| john-p3-e05-v08 | chunk | as good as | = | tão bom quanto | john-p3-e05-l03 | 0c2356ae | Chunks | 03_Family_Friends_and_Relationships.md:159 |
| john-p3-e05-v09 | palavra | both | = | ambos / os dois | — (não aparece literalmente) | ea81eea2 | Chunks | 03_Family_Friends_and_Relationships.md:160 |

#### Questões de compreensão (7)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p3-e05-q01** (explicit_fact) — What are they talking about?
  - **(correta)** a) The new café
  - b) A new restaurant
  - c) A football match
  - Explicação: No diálogo — Jessy: “What do you think of the new café?”
  - Falas de referência: john-p3-e05-l01
- **john-p3-e05-q02** (explicit_fact) — What does John think of the new café?
  - **(correta)** a) It's nicer than the old one
  - b) It isn't as good as the old one
  - c) It's too expensive
  - Explicação: No diálogo — John: “I think it's nicer than the old one.”
  - Falas de referência: john-p3-e05-l02
- **john-p3-e05-q03** (explicit_fact) — Does Rick agree with John?
  - **(correta)** a) No, he doesn't
  - b) Yes, completely
  - c) He has no opinion
  - Explicação: No diálogo — Rick: “Really? I don't think it's as good as the café near the station.”
  - Falas de referência: john-p3-e05-l03
- **john-p3-e05-q04** (explicit_fact) — Which café does Rick prefer?
  - **(correta)** a) The café near the station
  - b) The new café
  - c) Neither of them
  - Explicação: No diálogo — Rick: “I prefer the one near the station. Their coffee is the best.”
  - Falas de referência: john-p3-e05-l05
- **john-p3-e05-q05** (explicit_fact) — Why does Rick prefer it?
  - **(correta)** a) Their coffee is the best
  - b) It's cheaper
  - c) It's near his house
  - Explicação: No diálogo — Rick: “I prefer the one near the station. Their coffee is the best.”
  - Falas de referência: john-p3-e05-l05
- **john-p3-e05-q06** (relation) — Who starts the conversation?
  - **(correta)** a) Jessy
  - b) Rick
  - c) Mary
  - Explicação: No diálogo — Jessy: “What do you think of the new café?”
  - Falas de referência: john-p3-e05-l01
- **john-p3-e05-q07** (relation) — Who asks Rick which café he prefers?
  - **(correta)** a) Mary
  - b) Jessy
  - c) John
  - Explicação: No diálogo — Mary: “Which one do you prefer, then?”
  - Falas de referência: john-p3-e05-l04

#### Conteúdo das falas fora do inventário de itens

10 de 14 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: new, caf, nicer, than, old, near, station, then, coffee, best.

### Asking for and expressing opinions

**Id:** `john-p3-x01` · **Tipo:** mini-diálogo (seção complementar) · **Ordem na parte:** 6 · **Título:** Asking for and expressing opinions

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `03_Family_Friends_and_Relationships.md` a partir da linha 210 · tradução: referência autoral — não validada pelo professor

#### Falas (4) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p3-x01-l01 | Jessy (`jessy`) | What do you think of Rick's new photograph? | O que você acha da nova fotografia de Rick? | d38dc88e | bf_isabella | 03_Family_Friends_and_Relationships.md:210 / 211 |
| 2 | john-p3-x01-l02 | John (`john`) | It's nicer than the last one, but Mary's is the most impressive. | É mais bonita que a anterior, mas a de Mary é a mais impressionante. | 0da1f329 | bm_george | 03_Family_Friends_and_Relationships.md:213 / 214 |
| 3 | john-p3-x01-l03 | Jessy (`jessy`) | Which one do you prefer? | De qual você prefere? | 32ff3d87 | bf_isabella | 03_Family_Friends_and_Relationships.md:216 / 217 |
| 4 | john-p3-x01-l04 | John (`john`) | I think Mary's is the nicest. | Acho que a de Mary é a mais bonita. | 66c3829f | bm_george | 03_Family_Friends_and_Relationships.md:219 / 220 |

#### Itens de vocabulário (13)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p3-x01-v01 | expressão | What do you think of...? | What do you think of? | O que você acha de...? | john-p3-x01-l01 | 39bcdc41 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:196 |
| john-p3-x01-v02 | expressão | Which one do you prefer? | = | De qual você prefere? / Qual deles você prefere? | john-p3-x01-l03 | e2610817 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:197 |
| john-p3-x01-v03 | expressão | I think... | I think | Eu acho... | john-p3-x01-l04 | 8e43efbc | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:198 |
| john-p3-x01-v04 | expressão | Come on! | = | Ah, qual é! / Ora! (conforme o tom) | — (não aparece literalmente) | 58c13cfd | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:199 |
| john-p3-x01-v05 | chunk | not that handsome | = | não tão bonito assim | — (não aparece literalmente) | a72838e8 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:200 |
| john-p3-x01-v06 | chunk | a bit | = | um pouco | — (não aparece literalmente) | 616bf52f | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:201 |
| john-p3-x01-v07 | palavra | nicer | = | mais simpático / legal | john-p3-x01-l02 | 3221528a | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:202 |
| john-p3-x01-v08 | palavra | funnier | = | mais engraçado | — (não aparece literalmente) | ed1ff2d8 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:203 |
| john-p3-x01-v09 | chunk | the nicest | = | o(a) mais simpático(a) / legal | john-p3-x01-l04 | 182f2752 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:204 |
| john-p3-x01-v10 | chunk | more handsome than | = | mais bonito do que | — (não aparece literalmente) | 5c11ddd0 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:205 |
| john-p3-x01-v11 | chunk | the most handsome | = | o mais bonito | — (não aparece literalmente) | 9e83e13c | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:206 |
| john-p3-x01-v12 | expressão | isn't as ... as | isn't as as | não é tão ... quanto | — (não aparece literalmente) | 490ae432 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:207 |
| john-p3-x01-v13 | chunk | have ever seen | = | já vi (experiência de vida) | — (não aparece literalmente) | 0bc21638 | Asking for and expressing opinions | 03_Family_Friends_and_Relationships.md:208 |

#### Questões de compreensão (4)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p3-x01-q01** (explicit_fact) — What are they talking about?
  - **(correta)** a) Rick's new photograph
  - b) A new café
  - c) A family photograph
  - Explicação: No diálogo — Jessy: “What do you think of Rick's new photograph?”
  - Falas de referência: john-p3-x01-l01
- **john-p3-x01-q02** (explicit_fact) — How does John compare Rick's new photograph with the last one?
  - **(correta)** a) It's nicer
  - b) It isn't as good
  - c) It's the same
  - Explicação: No diálogo — John: “It's nicer than the last one, but Mary's is the most impressive.”
  - Falas de referência: john-p3-x01-l02
- **john-p3-x01-q03** (explicit_fact) — Whose photograph does John think is the most impressive and the nicest?
  - **(correta)** a) Mary's
  - b) Rick's
  - c) Jessy's
  - Explicação: No diálogo — John: “It's nicer than the last one, but Mary's is the most impressive.” / John: “I think Mary's is the nicest.”
  - Falas de referência: john-p3-x01-l02, john-p3-x01-l04
- **john-p3-x01-q04** (relation) — Who asks for John's opinion?
  - **(correta)** a) Jessy
  - b) Mary
  - c) Rick
  - Explicação: No diálogo — Jessy: “What do you think of Rick's new photograph?” / Jessy: “Which one do you prefer?”
  - Falas de referência: john-p3-x01-l01, john-p3-x01-l03

#### Conteúdo das falas fora do inventário de itens

6 de 13 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: rick's, new, photograph, last, mary's, impressive.

### Wedding celebrations — British vocabulary

**Id:** `john-p3-x02` · **Tipo:** mini-diálogo (seção complementar) · **Ordem na parte:** 7 · **Título:** Wedding celebrations — British vocabulary

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `03_Family_Friends_and_Relationships.md` a partir da linha 232 · tradução: referência autoral — não validada pelo professor

#### Falas (3) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p3-x02-l01 | Rick (`rick`) | Ruan is getting married next week. His friends are organising a stag do. | Ruan vai se casar na próxima semana. Os amigos dele estão organizando uma despedida de solteiro. | 658d57a9 | bm_lewis | 03_Family_Friends_and_Relationships.md:232 / 233 |
| 2 | john-p3-x02-l02 | Mary (`mary`) | And his future wife is having a hen do with her friends. | E a futura esposa dele vai fazer uma despedida de solteira com as amigas. | dbf57e68 | bf_emma | 03_Family_Friends_and_Relationships.md:235 / 236 |
| 3 | john-p3-x02-l03 | John (`john`) | They are going to a nightclub afterwards. | Depois eles vão a uma casa noturna. | 083187eb | bm_george | 03_Family_Friends_and_Relationships.md:238 / 239 |

#### Itens de vocabulário (6)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p3-x02-v01 | chunk | get married | = | casar-se | john-p3-x02-l01 | 181eafc7 | Wedding celebrations — British vocabulary | 03_Family_Friends_and_Relationships.md:243 |
| john-p3-x02-v02 | expressão | stag do / stag party | stag do, stag party | despedida de solteiro (BrE) | john-p3-x02-l01 | 324090a0 | Wedding celebrations — British vocabulary | 03_Family_Friends_and_Relationships.md:244 |
| john-p3-x02-v03 | expressão | hen do / hen party | hen do, hen party | despedida de solteira (BrE) | john-p3-x02-l02 | a44316ac | Wedding celebrations — British vocabulary | 03_Family_Friends_and_Relationships.md:245 |
| john-p3-x02-v04 | chunk | future wife | = | futura esposa | john-p3-x02-l02 | 3281069b | Wedding celebrations — British vocabulary | 03_Family_Friends_and_Relationships.md:246 |
| john-p3-x02-v05 | expressão | play tricks on someone | = | pregar peças em alguém | — (não aparece literalmente) | c211046a | Wedding celebrations — British vocabulary | 03_Family_Friends_and_Relationships.md:247 |
| john-p3-x02-v06 | expressão | go out to a nightclub | = | sair para uma casa noturna | — (não aparece literalmente) | f40ae28d | Wedding celebrations — British vocabulary | 03_Family_Friends_and_Relationships.md:248 |

#### Questões de compreensão (5)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p3-x02-q01** (explicit_fact) — Who is getting married?
  - **(correta)** a) Ruan
  - b) Rick
  - c) John
  - Explicação: No diálogo — Rick: “Ruan is getting married next week. His friends are organising a stag do.”
  - Falas de referência: john-p3-x02-l01
- **john-p3-x02-q02** (explicit_fact) — When is he getting married?
  - **(correta)** a) Next week
  - b) Next year
  - c) Tomorrow
  - Explicação: No diálogo — Rick: “Ruan is getting married next week. His friends are organising a stag do.”
  - Falas de referência: john-p3-x02-l01
- **john-p3-x02-q03** (action) — What are his friends organising?
  - **(correta)** a) A stag do
  - b) A hen do
  - c) A family lunch
  - Explicação: No diálogo — Rick: “Ruan is getting married next week. His friends are organising a stag do.”
  - Falas de referência: john-p3-x02-l01
- **john-p3-x02-q04** (action) — What is his future wife having with her friends?
  - **(correta)** a) A hen do
  - b) A stag do
  - c) A business dinner
  - Explicação: No diálogo — Mary: “And his future wife is having a hen do with her friends.”
  - Falas de referência: john-p3-x02-l02
- **john-p3-x02-q05** (explicit_fact) — Where are they going afterwards?
  - **(correta)** a) To a nightclub
  - b) To a restaurant
  - c) Home
  - Explicação: No diálogo — John: “They are going to a nightclub afterwards.”
  - Falas de referência: john-p3-x02-l03

#### Conteúdo das falas fora do inventário de itens

9 de 15 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: ruan, getting, next, week, friends, organising, having, going, afterwards.

## Itens das tabelas da fonte sem atividade correspondente (0)

Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.

## Conteúdo da fonte que não está nos dados do app (literal)

Linhas de `03_Family_Friends_and_Relationships.md` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.

**Linhas 1–3:**

```markdown
# THE STORY OF JOHN
## Part 3 — Family, Friends and Relationships
**Daily Routine English · British English**
```

**Linhas 91–91:**

```markdown
### Family vocabulary
```

**Linhas 148–148:**

```markdown
### Chunks
```

**Linhas 162–190:**

```markdown
## Practice

### A. Complete the comparisons

1. Stuart is ______ (old) than John.
2. Ana is the ______ (tall) person in the family.
3. Rick is ______ (funny) than Peter.
4. This café is ______ (good) than the old one.
5. It is the ______ (good) coffee in town.

### B. Translate into English

1. Ela é filha da minha irmã.
2. Ele é mais velho que eu.
3. Qual deles você prefere?
4. Acho que este café é melhor.
5. Os dois são meus amigos.

### C. Personal production

Describe three people you know. Include family relationships or friendships, ages (if appropriate), and at least three comparisons.

### Suggested answers

**A:** 1. older; 2. tallest; 3. funnier; 4. better; 5. best.

**B:** 1. She's my sister's daughter. 2. He's older than me. 3. Which one do you prefer? 4. I think this café is better. 5. They're both my friends.

## Source coverage — opinions, comparison and social events
```

**Linhas 222–228:**

```markdown
### Comparison patterns

- Adjetivo curto: *nice → nicer → the nicest*; *funny → funnier → the funniest*.
- Adjetivo longo: *handsome → more handsome → the most handsome*.
- Igualdade negativa: *not as handsome as* = não tão bonito quanto.
- Intensificador: *a bit nicer* = um pouco mais bonito/simpático.
- Experiência: *the most impressive photograph I've ever seen* = a fotografia mais impressionante que já vi.
```

**Linhas 250–250:**

```markdown
**Grammar in context:** *is getting married / is having* pode indicar plano futuro já organizado; *will* pode expressar previsão; *be going to* indica intenção/plano.
```

---

# The Story of John — Parte 4: Opinions, Sports and Social Life

**Pacote:** The Story of John (`the-story-of-john`, conteúdo `118297cacc48`, idioma en-GB) · **Parte:** `john-p4` · **Arquivo-fonte:** `dev/content/dialogues/source/the-story-of-john/04_Opinions_Sports_and_Social_Life.md`

**Origem do pacote (literal):** Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.

**Atividades:** 6 (5 episódios, 1 mini-diálogos) · **Falas:** 34 · **Itens:** 20 · **Questões:** 58

## Atividades

- [`john-p4-e01` — Saturday plans](#episode-1-saturday-plans)
- [`john-p4-e02` — At the race](#episode-2-at-the-race)
- [`john-p4-e03` — After the competition](#episode-3-after-the-competition)
- [`john-p4-e04` — Choosing a place](#episode-4-choosing-a-place)
- [`john-p4-e05` — An invitation](#episode-5-an-invitation)
- [`john-p4-x01` — Live race commentary](#live-race-commentary)

## Conteúdo por atividade

### Episode 1 — Saturday plans

**Id:** `john-p4-e01` · **Tipo:** episódio · **Ordem na parte:** 1 · **Título:** Saturday plans

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `04_Opinions_Sports_and_Social_Life.md` a partir da linha 7 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p4-e01-l01 | Rick (`rick`) | What shall we do on Saturday? | O que vamos fazer no sábado? | 44e8e4f5 | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:7 / 8 |
| 2 | john-p4-e01-l02 | John (`john`) | We could go to the football match. | Poderíamos ir à partida de futebol. | a75db40f | bm_george | 04_Opinions_Sports_and_Social_Life.md:10 / 11 |
| 3 | john-p4-e01-l03 | Jessy (`jessy`) | Again? Have you got any better ideas? | De novo? Você tem alguma ideia melhor? | f2a154ee | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:13 / 14 |
| 4 | john-p4-e01-l04 | Mary (`mary`) | There's a sports event in the park. We could watch the race. | Há um evento desportivo no parque. Poderíamos assistir à corrida. | 8da3f4dd | bf_emma | 04_Opinions_Sports_and_Social_Life.md:16 / 17 |
| 5 | john-p4-e01-l05 | Rick (`rick`) | That's a good idea. What time does it start? | Boa ideia. A que horas começa? | e961be69 | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:19 / 20 |
| 6 | john-p4-e01-l06 | Mary (`mary`) | It starts at half past ten. | Começa às dez e meia. | 213cdda4 | bf_emma | 04_Opinions_Sports_and_Social_Life.md:22 / 23 |

#### Itens de vocabulário (2)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p4-e01-v01 | chunk | sports event | = | evento desportivo | john-p4-e01-l04 | 9e0722fa | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:141 |
| john-p4-e01-v02 | palavra | race | = | corrida | john-p4-e01-l04 | 8ebbc298 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:142 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p4-e01-q01** (intention) — What does Rick want to decide?
  - **(correta)** a) What to do on Saturday
  - b) Where to work
  - c) What to eat
  - Explicação: No diálogo — Rick: “What shall we do on Saturday?”
  - Falas de referência: john-p4-e01-l01
- **john-p4-e01-q02** (explicit_fact) — What does John suggest?
  - **(correta)** a) Going to the football match
  - b) Watching the race
  - c) Going to the cinema
  - Explicação: No diálogo — John: “We could go to the football match.”
  - Falas de referência: john-p4-e01-l02
- **john-p4-e01-q03** (inference) — How does Jessy react to John's idea?
  - **(correta)** a) She isn't enthusiastic about it
  - b) She loves it
  - c) She agrees immediately
  - Explicação: "Again?" mostra que ela não quer repetir o programa. No diálogo — Jessy: “Again? Have you got any better ideas?”
  - Falas de referência: john-p4-e01-l03
- **john-p4-e01-q04** (intention) — What does Jessy ask for?
  - **(correta)** a) Better ideas
  - b) The time of the match
  - c) Tickets
  - Explicação: No diálogo — Jessy: “Again? Have you got any better ideas?”
  - Falas de referência: john-p4-e01-l03
- **john-p4-e01-q05** (explicit_fact) — What is there in the park?
  - **(correta)** a) A sports event
  - b) A concert
  - c) A market
  - Explicação: No diálogo — Mary: “There's a sports event in the park. We could watch the race.”
  - Falas de referência: john-p4-e01-l04
- **john-p4-e01-q06** (explicit_fact) — What does Mary suggest?
  - **(correta)** a) Watching the race
  - b) Playing football
  - c) Going swimming
  - Explicação: No diálogo — Mary: “There's a sports event in the park. We could watch the race.”
  - Falas de referência: john-p4-e01-l04
- **john-p4-e01-q07** (explicit_fact) — What does Rick think of Mary's idea?
  - **(correta)** a) It's a good idea
  - b) It's a bad idea
  - c) He isn't sure
  - Explicação: No diálogo — Rick: “That's a good idea. What time does it start?”
  - Falas de referência: john-p4-e01-l05
- **john-p4-e01-q08** (explicit_fact) — What time does the race start?
  - **(correta)** a) At half past ten
  - b) At ten o'clock
  - c) At half past eleven
  - Explicação: No diálogo — Mary: “It starts at half past ten.”
  - Falas de referência: john-p4-e01-l06
- **john-p4-e01-q09** (relation) — Who asks what time it starts?
  - **(correta)** a) Rick
  - b) Jessy
  - c) John
  - Explicação: No diálogo — Rick: “That's a good idea. What time does it start?”
  - Falas de referência: john-p4-e01-l05
- **john-p4-e01-q10** (inference) — Which plan do they choose?
  - **(correta)** a) The race in the park
  - b) The football match
  - c) Staying at home
  - Explicação: No diálogo — Mary: “There's a sports event in the park. We could watch the race.” / Rick: “That's a good idea. What time does it start?”
  - Falas de referência: john-p4-e01-l04, john-p4-e01-l05

#### Conteúdo das falas fora do inventário de itens

20 de 23 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: shall, saturday, go, football, match, again, got, any, better, ideas, park, watch, good, idea, time, start, starts, half, past, ten.

### Episode 2 — At the race

**Id:** `john-p4-e02` · **Tipo:** episódio · **Ordem na parte:** 2 · **Título:** At the race

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `04_Opinions_Sports_and_Social_Life.md` a partir da linha 27 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p4-e02-l01 | John (`john`) | Look! The runner in the blue shirt is in first place. | Olhe! O corredor de camisa azul está em primeiro lugar. | a5a1ebd7 | bm_george | 04_Opinions_Sports_and_Social_Life.md:27 / 28 |
| 2 | john-p4-e02-l02 | Rick (`rick`) | He's closely followed by the runner in red. | Ele está sendo seguido de perto pelo corredor de vermelho. | 4026d42f | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:30 / 31 |
| 3 | john-p4-e02-l03 | Jessy (`jessy`) | The runner in green is coming up quickly. | O corredor de verde está se aproximando rapidamente. | 7d9acb04 | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:33 / 34 |
| 4 | john-p4-e02-l04 | Mary (`mary`) | He's taken up second position! | Ele assumiu a segunda posição! | 71bb9662 | bf_emma | 04_Opinions_Sports_and_Social_Life.md:36 / 37 |
| 5 | john-p4-e02-l05 | John (`john`) | And the runner in red has gone back to third. | E o corredor de vermelho caiu para terceiro. | b77f81b8 | bm_george | 04_Opinions_Sports_and_Social_Life.md:39 / 40 |
| 6 | john-p4-e02-l06 | Rick (`rick`) | What a finish! The blue runner comes in first. | Que chegada! O corredor de azul chega em primeiro. | a63a277b | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:42 / 43 |

#### Itens de vocabulário (4)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p4-e02-v01 | palavra | runner | = | corredor | john-p4-e02-l01, john-p4-e02-l02, john-p4-e02-l03, john-p4-e02-l05, john-p4-e02-l06 | 73c212db | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:143 |
| john-p4-e02-v02 | chunk | first place | = | primeiro lugar | john-p4-e02-l01 | d05ab00a | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:144 |
| john-p4-e02-v03 | chunk | closely followed by | = | seguido de perto por | john-p4-e02-l02 | 6e00c345 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:145 |
| john-p4-e02-v04 | chunk | come in first | = | chegar em primeiro | john-p4-e02-l06 | 1c33936e | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:147 |

#### Notas pedagógicas (1) — literal

### Language focus — positions and ordinal numbers
| Number | Ordinal | Português |
|---:|---|---|
| 1 | first | primeiro |
| 2 | second | segundo |
| 3 | third | terceiro |
| 4 | fourth | quarto |
| 5 | fifth | quinto |
| 6 | sixth | sexto |
| 7 | seventh | sétimo |
| 8 | eighth | oitavo |
| 9 | ninth | nono |
| 10 | tenth | décimo |
**Useful race commentary:**
- *in first place* — em primeiro lugar.
- *closely followed by* — seguido de perto por.
- *come up* — aproximar-se / avançar.
- *go back to third* — voltar/cair para terceiro.
- *come in first* — chegar em primeiro lugar.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p4-e02-q01** (explicit_fact) — Who is in first place at the beginning?
  - **(correta)** a) The runner in the blue shirt
  - b) The runner in red
  - c) The runner in green
  - Explicação: No diálogo — John: “Look! The runner in the blue shirt is in first place.”
  - Falas de referência: john-p4-e02-l01
- **john-p4-e02-q02** (explicit_fact) — Who is closely following the leader?
  - **(correta)** a) The runner in red
  - b) The runner in green
  - c) The runner in blue
  - Explicação: No diálogo — Rick: “He's closely followed by the runner in red.”
  - Falas de referência: john-p4-e02-l02
- **john-p4-e02-q03** (action) — What is the runner in green doing?
  - **(correta)** a) Coming up quickly
  - b) Slowing down
  - c) Stopping
  - Explicação: No diálogo — Jessy: “The runner in green is coming up quickly.”
  - Falas de referência: john-p4-e02-l03
- **john-p4-e02-q04** (explicit_fact) — Which position does the runner in green take?
  - **(correta)** a) Second
  - b) First
  - c) Third
  - Explicação: No diálogo — Mary: “He's taken up second position!”
  - Falas de referência: john-p4-e02-l04
- **john-p4-e02-q05** (explicit_fact) — Where is the runner in red now?
  - **(correta)** a) In third place
  - b) In second place
  - c) In first place
  - Explicação: No diálogo — John: “And the runner in red has gone back to third.”
  - Falas de referência: john-p4-e02-l05
- **john-p4-e02-q06** (explicit_fact) — Who comes in first?
  - **(correta)** a) The blue runner
  - b) The green runner
  - c) The red runner
  - Explicação: No diálogo — Rick: “What a finish! The blue runner comes in first.”
  - Falas de referência: john-p4-e02-l06
- **john-p4-e02-q07** (inference) — Which runner loses a position during the race?
  - **(correta)** a) The runner in red
  - b) The runner in blue
  - c) The runner in green
  - Explicação: o vermelho estava logo atrás do líder e depois volta para terceiro. No diálogo — Rick: “He's closely followed by the runner in red.” / John: “And the runner in red has gone back to third.”
  - Falas de referência: john-p4-e02-l02, john-p4-e02-l05
- **john-p4-e02-q08** (inference) — Which runner moves up during the race?
  - **(correta)** a) The runner in green
  - b) The runner in red
  - c) The runner in blue
  - Explicação: No diálogo — Jessy: “The runner in green is coming up quickly.” / Mary: “He's taken up second position!”
  - Falas de referência: john-p4-e02-l03, john-p4-e02-l04
- **john-p4-e02-q09** (context) — What are they watching?
  - **(correta)** a) A race
  - b) A football match
  - c) A swimming competition
  - Explicação: No diálogo — John: “Look! The runner in the blue shirt is in first place.”
  - Falas de referência: john-p4-e02-l01
- **john-p4-e02-q10** (relation) — Who says "What a finish!"?
  - **(correta)** a) Rick
  - b) John
  - c) Mary
  - Explicação: No diálogo — Rick: “What a finish! The blue runner comes in first.”
  - Falas de referência: john-p4-e02-l06

#### Conteúdo das falas fora do inventário de itens

15 de 20 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: look, blue, shirt, red, green, coming, quickly, taken, second, position, gone, back, third, finish, comes.

### Episode 3 — After the competition

**Id:** `john-p4-e03` · **Tipo:** episódio · **Ordem na parte:** 3 · **Título:** After the competition

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `04_Opinions_Sports_and_Social_Life.md` a partir da linha 69 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p4-e03-l01 | Jessy (`jessy`) | That was great fun! | Foi muito divertido! | 45b9e230 | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:69 / 70 |
| 2 | john-p4-e03-l02 | Rick (`rick`) | The runner in blue was brilliant. | O corredor de azul foi brilhante. | c1699071 | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:72 / 73 |
| 3 | john-p4-e03-l03 | John (`john`) | He must train every day. | Ele deve treinar todos os dias. | ce76a643 | bm_george | 04_Opinions_Sports_and_Social_Life.md:75 / 76 |
| 4 | john-p4-e03-l04 | Mary (`mary`) | Perhaps. But the runner in green kept trying until the end. | Talvez. Mas o corredor de verde continuou tentando até o fim. | f59851df | bf_emma | 04_Opinions_Sports_and_Social_Life.md:78 / 79 |
| 5 | john-p4-e03-l05 | Rick (`rick`) | That's what matters. You must keep trying. | Isso é o que importa. É preciso continuar tentando. | e940e486 | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:81 / 82 |
| 6 | john-p4-e03-l06 | John (`john`) | Shall we get something to eat? | Vamos comer alguma coisa? | e985698e | bm_george | 04_Opinions_Sports_and_Social_Life.md:84 / 85 |
| 7 | john-p4-e03-l07 | Jessy (`jessy`) | Yes. I'm starving! | Sim. Estou morrendo de fome! | aa77de34 | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:87 / 88 |

#### Itens de vocabulário (4)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p4-e03-v01 | palavra | runner | = | corredor | john-p4-e03-l02, john-p4-e03-l04 | 73c212db | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:143 |
| john-p4-e03-v02 | chunk | keep trying | = | continuar tentando | john-p4-e03-l05 | 5041b0df | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:148 |
| john-p4-e03-v03 | chunk | great fun | = | muito divertido | john-p4-e03-l01 | 86968e37 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:149 |
| john-p4-e03-v04 | expressão | I'm starving. | = | Estou morrendo de fome. | john-p4-e03-l07 | 354a7594 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:152 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p4-e03-q01** (inference) — How does Jessy feel about the race?
  - **(correta)** a) It was great fun
  - b) It was boring
  - c) It was too long
  - Explicação: No diálogo — Jessy: “That was great fun!”
  - Falas de referência: john-p4-e03-l01
- **john-p4-e03-q02** (explicit_fact) — Who does Rick think was brilliant?
  - **(correta)** a) The runner in blue
  - b) The runner in green
  - c) The runner in red
  - Explicação: No diálogo — Rick: “The runner in blue was brilliant.”
  - Falas de referência: john-p4-e03-l02
- **john-p4-e03-q03** (inference) — What does John think about the runner in blue?
  - **(correta)** a) He must train every day
  - b) He was lucky
  - c) He didn't try hard
  - Explicação: No diálogo — John: “He must train every day.”
  - Falas de referência: john-p4-e03-l03
- **john-p4-e03-q04** (explicit_fact) — What did the runner in green do?
  - **(correta)** a) He kept trying until the end
  - b) He stopped running
  - c) He won the race
  - Explicação: No diálogo — Mary: “Perhaps. But the runner in green kept trying until the end.”
  - Falas de referência: john-p4-e03-l04
- **john-p4-e03-q05** (inference) — Is Mary sure that the runner in blue trains every day?
  - **(correta)** a) No — she says "Perhaps"
  - b) Yes, she is sure
  - c) She knows he doesn't train
  - Explicação: No diálogo — Mary: “Perhaps. But the runner in green kept trying until the end.”
  - Falas de referência: john-p4-e03-l04
- **john-p4-e03-q06** (intention) — What is Rick's message?
  - **(correta)** a) You must keep trying
  - b) Only winning matters
  - c) Training is not important
  - Explicação: No diálogo — Rick: “That's what matters. You must keep trying.”
  - Falas de referência: john-p4-e03-l05
- **john-p4-e03-q07** (relation) — Who agrees with Mary's point about the runner in green?
  - **(correta)** a) Rick
  - b) John
  - c) Jessy
  - Explicação: No diálogo — Mary: “Perhaps. But the runner in green kept trying until the end.” / Rick: “That's what matters. You must keep trying.”
  - Falas de referência: john-p4-e03-l04, john-p4-e03-l05
- **john-p4-e03-q08** (intention) — What does John suggest?
  - **(correta)** a) Getting something to eat
  - b) Going home
  - c) Watching another race
  - Explicação: No diálogo — John: “Shall we get something to eat?”
  - Falas de referência: john-p4-e03-l06
- **john-p4-e03-q09** (explicit_fact) — Why does Jessy agree with John's suggestion?
  - **(correta)** a) She's starving
  - b) She's tired
  - c) She's cold
  - Explicação: No diálogo — Jessy: “Yes. I'm starving!”
  - Falas de referência: john-p4-e03-l07
- **john-p4-e03-q10** (context) — When does this conversation happen?
  - **(correta)** a) After the competition
  - b) Before the race
  - c) During the race
  - Explicação: No diálogo — Título do episódio: After the competition
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

16 de 22 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: blue, brilliant, must, train, every, day, perhaps, green, kept, until, end, matters, shall, get, something, eat.

### Episode 4 — Choosing a place

**Id:** `john-p4-e04` · **Tipo:** episódio · **Ordem na parte:** 4 · **Título:** Choosing a place

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `04_Opinions_Sports_and_Social_Life.md` a partir da linha 92 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p4-e04-l01 | Mary (`mary`) | Where shall we go? | Aonde vamos? | 28e6f98d | bf_emma | 04_Opinions_Sports_and_Social_Life.md:92 / 93 |
| 2 | john-p4-e04-l02 | Rick (`rick`) | There's a new restaurant in King Street. | Há um restaurante novo na King Street. | f335465c | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:95 / 96 |
| 3 | john-p4-e04-l03 | John (`john`) | Is it better than the one near the station? | É melhor que aquele perto da estação? | 1aec6f21 | bm_george | 04_Opinions_Sports_and_Social_Life.md:98 / 99 |
| 4 | john-p4-e04-l04 | Rick (`rick`) | I haven't tried it yet, but people say it's very good. | Ainda não experimentei, mas dizem que é muito bom. | 7b9a405b | bm_lewis | 04_Opinions_Sports_and_Social_Life.md:101 / 102 |
| 5 | john-p4-e04-l05 | Jessy (`jessy`) | Let's give it a try. | Vamos experimentar. | 6446fada | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:104 / 105 |
| 6 | john-p4-e04-l06 | Mary (`mary`) | Good idea. We can talk about the race over lunch. | Boa ideia. Podemos conversar sobre a corrida durante o almoço. | 8d211f46 | bf_emma | 04_Opinions_Sports_and_Social_Life.md:107 / 108 |

#### Itens de vocabulário (2)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p4-e04-v01 | palavra | race | = | corrida | john-p4-e04-l06 | 8ebbc298 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:142 |
| john-p4-e04-v02 | expressão | give it a try | = | experimentar / dar uma chance | john-p4-e04-l05 | cf67d2c3 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:151 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p4-e04-q01** (intention) — What does Mary ask?
  - **(correta)** a) Where they should go
  - b) What time it is
  - c) Who won the race
  - Explicação: No diálogo — Mary: “Where shall we go?”
  - Falas de referência: john-p4-e04-l01
- **john-p4-e04-q02** (explicit_fact) — What does Rick suggest?
  - **(correta)** a) A new restaurant
  - b) The café near the station
  - c) The park
  - Explicação: No diálogo — Rick: “There's a new restaurant in King Street.”
  - Falas de referência: john-p4-e04-l02
- **john-p4-e04-q03** (explicit_fact) — Where is the new restaurant?
  - **(correta)** a) In King Street
  - b) In Duke Street
  - c) Near the station
  - Explicação: No diálogo — Rick: “There's a new restaurant in King Street.”
  - Falas de referência: john-p4-e04-l02
- **john-p4-e04-q04** (intention) — What does John want to know about the new restaurant?
  - **(correta)** a) If it's better than the one near the station
  - b) How much it costs
  - c) What time it opens
  - Explicação: No diálogo — John: “Is it better than the one near the station?”
  - Falas de referência: john-p4-e04-l03
- **john-p4-e04-q05** (explicit_fact) — Has Rick tried the new restaurant?
  - **(correta)** a) No, not yet
  - b) Yes, once
  - c) Yes, many times
  - Explicação: No diálogo — Rick: “I haven't tried it yet, but people say it's very good.”
  - Falas de referência: john-p4-e04-l04
- **john-p4-e04-q06** (inference) — Why does Rick suggest the restaurant, then?
  - **(correta)** a) People say it's very good
  - b) He works there
  - c) It's very cheap
  - Explicação: No diálogo — Rick: “I haven't tried it yet, but people say it's very good.”
  - Falas de referência: john-p4-e04-l04
- **john-p4-e04-q07** (intention) — What does Jessy suggest?
  - **(correta)** a) Giving it a try
  - b) Going home
  - c) Choosing another place
  - Explicação: No diálogo — Jessy: “Let's give it a try.”
  - Falas de referência: john-p4-e04-l05
- **john-p4-e04-q08** (relation) — Who agrees with Jessy's suggestion?
  - **(correta)** a) Mary
  - b) John
  - c) Rick
  - Explicação: No diálogo — Mary: “Good idea. We can talk about the race over lunch.”
  - Falas de referência: john-p4-e04-l06
- **john-p4-e04-q09** (action) — What can they talk about over lunch?
  - **(correta)** a) The race
  - b) The football match
  - c) Their trip
  - Explicação: No diálogo — Mary: “Good idea. We can talk about the race over lunch.”
  - Falas de referência: john-p4-e04-l06
- **john-p4-e04-q10** (context) — Which meal are they going to have?
  - **(correta)** a) Lunch
  - b) Breakfast
  - c) Dinner
  - Explicação: No diálogo — Mary: “Good idea. We can talk about the race over lunch.”
  - Falas de referência: john-p4-e04-l06

#### Conteúdo das falas fora do inventário de itens

21 de 24 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: shall, go, new, restaurant, king, street, better, than, one, near, station, haven't, tried, yet, people, say, good, idea, talk, over, lunch.

### Episode 5 — An invitation

**Id:** `john-p4-e05` · **Tipo:** episódio · **Ordem na parte:** 5 · **Título:** An invitation

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `04_Opinions_Sports_and_Social_Life.md` a partir da linha 112 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p4-e05-l01 | John (`john`) | Are you doing anything next Saturday, Jessy? | Você vai fazer alguma coisa no próximo sábado, Jessy? | a4315057 | bm_george | 04_Opinions_Sports_and_Social_Life.md:112 / 113 |
| 2 | john-p4-e05-l02 | Jessy (`jessy`) | Not that I know of. Why? | Que eu saiba, não. Por quê? | 8f0f2b05 | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:115 / 116 |
| 3 | john-p4-e05-l03 | John (`john`) | We're having a small get-together at my place. Would you like to come? | Vamos fazer um pequeno encontro na minha casa. Você gostaria de vir? | da3d0195 | bm_george | 04_Opinions_Sports_and_Social_Life.md:118 / 119 |
| 4 | john-p4-e05-l04 | Jessy (`jessy`) | I'd love to. What time? | Adoraria. A que horas? | 282706a0 | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:121 / 122 |
| 5 | john-p4-e05-l05 | John (`john`) | Around seven. I'll send you the address. | Por volta das sete. Vou enviar o endereço. | c037f032 | bm_george | 04_Opinions_Sports_and_Social_Life.md:124 / 125 |
| 6 | john-p4-e05-l06 | Jessy (`jessy`) | Lovely. See you then! | Ótimo. Até lá! | a240f606 | bf_isabella | 04_Opinions_Sports_and_Social_Life.md:127 / 128 |

#### Itens de vocabulário (1)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p4-e05-v01 | palavra | get-together | = | encontro informal | john-p4-e05-l03 | 02822284 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:150 |

#### Notas pedagógicas (1) — literal

### Language focus — suggestions, invitations and obligation
- **could** pode sugerir uma possibilidade: *We could go to the match.* — Poderíamos ir à partida.
- **Would you like to...?** faz um convite educado: *Would you like to come?* — Você gostaria de vir?
- **must** expressa obrigação ou forte necessidade: *You must keep trying.* — Você precisa continuar tentando.
- **Shall we...?** propõe uma ação conjunta: *Shall we get something to eat?* — Vamos comer alguma coisa?

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p4-e05-q01** (intention) — What does John want to know?
  - **(correta)** a) If Jessy is doing anything next Saturday
  - b) Where Jessy lives
  - c) If Jessy likes football
  - Explicação: No diálogo — John: “Are you doing anything next Saturday, Jessy?”
  - Falas de referência: john-p4-e05-l01
- **john-p4-e05-q02** (explicit_fact) — Has Jessy got any plans for next Saturday?
  - **(correta)** a) Not that she knows of
  - b) Yes, she's very busy
  - c) She's travelling
  - Explicação: No diálogo — Jessy: “Not that I know of. Why?”
  - Falas de referência: john-p4-e05-l02
- **john-p4-e05-q03** (action) — What is John having?
  - **(correta)** a) A small get-together
  - b) A big party in a club
  - c) A family lunch
  - Explicação: No diálogo — John: “We're having a small get-together at my place. Would you like to come?”
  - Falas de referência: john-p4-e05-l03
- **john-p4-e05-q04** (explicit_fact) — Where is the get-together?
  - **(correta)** a) At John's place
  - b) At Jessy's place
  - c) In a restaurant
  - Explicação: No diálogo — John: “We're having a small get-together at my place. Would you like to come?”
  - Falas de referência: john-p4-e05-l03
- **john-p4-e05-q05** (intention) — What does John do?
  - **(correta)** a) He invites Jessy
  - b) He asks Jessy for help
  - c) He cancels a plan
  - Explicação: No diálogo — John: “We're having a small get-together at my place. Would you like to come?”
  - Falas de referência: john-p4-e05-l03
- **john-p4-e05-q06** (inference) — How does Jessy respond to the invitation?
  - **(correta)** a) She'd love to come
  - b) She refuses
  - c) She says maybe
  - Explicação: No diálogo — Jessy: “I'd love to. What time?”
  - Falas de referência: john-p4-e05-l04
- **john-p4-e05-q07** (explicit_fact) — What time is the get-together?
  - **(correta)** a) Around seven
  - b) Around eight
  - c) At half past ten
  - Explicação: No diálogo — John: “Around seven. I'll send you the address.”
  - Falas de referência: john-p4-e05-l05
- **john-p4-e05-q08** (action) — What will John send Jessy?
  - **(correta)** a) The address
  - b) A ticket
  - c) Some photographs
  - Explicação: No diálogo — John: “Around seven. I'll send you the address.”
  - Falas de referência: john-p4-e05-l05
- **john-p4-e05-q09** (explicit_fact) — When is the get-together?
  - **(correta)** a) Next Saturday
  - b) This Sunday
  - c) Tonight
  - Explicação: No diálogo — John: “Are you doing anything next Saturday, Jessy?”
  - Falas de referência: john-p4-e05-l01
- **john-p4-e05-q10** (inference) — What does Jessy mean by "See you then!"?
  - **(correta)** a) At the get-together next Saturday
  - b) Tomorrow at work
  - c) Tonight
  - Explicação: No diálogo — John: “Around seven. I'll send you the address.” / Jessy: “Lovely. See you then!”
  - Falas de referência: john-p4-e05-l05, john-p4-e05-l06

#### Conteúdo das falas fora do inventário de itens

21 de 23 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: doing, anything, next, saturday, jessy, know, having, small, place, like, come, i'd, love, time, around, seven, send, address, lovely, see, then.

### Live race commentary

**Id:** `john-p4-x01` · **Tipo:** mini-diálogo (seção complementar) · **Ordem na parte:** 6 · **Título:** Live race commentary

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `04_Opinions_Sports_and_Social_Life.md` a partir da linha 186 · tradução: referência autoral — não validada pelo professor

#### Falas (3) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p4-x01-l01 | Commentator (`role-commentator`) | Number seven gets a good start and takes first position, closely followed by number four in second place. | O número sete larga bem e assume a primeira posição, seguido de perto pelo número quatro em segundo lugar. *(rótulo na tradução: Comentarista)* | 1b9ae529 | bm_fable | 04_Opinions_Sports_and_Social_Life.md:186 / 187 |
| 2 | john-p4-x01-l02 | Commentator (`role-commentator`) | Number one moves up into third place, while number three drops back to fifth. | O número um sobe para o terceiro lugar, enquanto o número três recua para o quinto. *(rótulo na tradução: Comentarista)* | adff21f8 | bm_fable | 04_Opinions_Sports_and_Social_Life.md:189 / 190 |
| 3 | john-p4-x01-l03 | Commentator (`role-commentator`) | Number seven has won the race! Number one is second, and number four comes in third. | O número sete venceu a corrida! O número um fica em segundo, e o número quatro chega em terceiro. *(rótulo na tradução: Comentarista)* | 571213a0 | bm_fable | 04_Opinions_Sports_and_Social_Life.md:192 / 193 |

#### Itens de vocabulário (7)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p4-x01-v01 | palavra | race | = | corrida | john-p4-x01-l03 | 8ebbc298 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:142 |
| john-p4-x01-v02 | chunk | closely followed by | = | seguido de perto por | john-p4-x01-l01 | 6e00c345 | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:145 |
| john-p4-x01-v03 | expressão | get a good start | = | largar bem | john-p4-x01-l01 | ca998c99 | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:214 |
| john-p4-x01-v04 | chunk | take first position | = | assumir a primeira posição | john-p4-x01-l01 | dd1bdccb | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:215 |
| john-p4-x01-v05 | expressão | move up into third | = | subir para o terceiro lugar | john-p4-x01-l02 | 9c9af9fc | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:217 |
| john-p4-x01-v06 | expressão | drop back to fifth | = | recuar para o quinto lugar | john-p4-x01-l02 | bf797525 | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:218 |
| john-p4-x01-v07 | chunk | come in third | = | chegar em terceiro | john-p4-x01-l03 | 3987e179 | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:220 |

#### Questões de compreensão (8)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p4-x01-q01** (explicit_fact) — Which runner gets a good start?
  - **(correta)** a) Number seven
  - b) Number four
  - c) Number one
  - Explicação: No diálogo — Commentator: “Number seven gets a good start and takes first position, closely followed by number four in second place.”
  - Falas de referência: john-p4-x01-l01
- **john-p4-x01-q02** (explicit_fact) — Who is in second place at the beginning?
  - **(correta)** a) Number four
  - b) Number seven
  - c) Number three
  - Explicação: No diálogo — Commentator: “Number seven gets a good start and takes first position, closely followed by number four in second place.”
  - Falas de referência: john-p4-x01-l01
- **john-p4-x01-q03** (action) — What does number one do?
  - **(correta)** a) Moves up into third place
  - b) Drops back to fifth
  - c) Stops running
  - Explicação: No diálogo — Commentator: “Number one moves up into third place, while number three drops back to fifth.”
  - Falas de referência: john-p4-x01-l02
- **john-p4-x01-q04** (action) — What happens to number three?
  - **(correta)** a) Drops back to fifth
  - b) Moves up into third
  - c) Wins the race
  - Explicação: No diálogo — Commentator: “Number one moves up into third place, while number three drops back to fifth.”
  - Falas de referência: john-p4-x01-l02
- **john-p4-x01-q05** (explicit_fact) — Who wins the race?
  - **(correta)** a) Number seven
  - b) Number one
  - c) Number four
  - Explicação: No diálogo — Commentator: “Number seven has won the race! Number one is second, and number four comes in third.”
  - Falas de referência: john-p4-x01-l03
- **john-p4-x01-q06** (explicit_fact) — Who finishes second?
  - **(correta)** a) Number one
  - b) Number four
  - c) Number three
  - Explicação: No diálogo — Commentator: “Number seven has won the race! Number one is second, and number four comes in third.”
  - Falas de referência: john-p4-x01-l03
- **john-p4-x01-q07** (explicit_fact) — Where does number four finish?
  - **(correta)** a) Third
  - b) Second
  - c) Fifth
  - Explicação: No diálogo — Commentator: “Number seven has won the race! Number one is second, and number four comes in third.”
  - Falas de referência: john-p4-x01-l03
- **john-p4-x01-q08** (inference) — Which runner is in a worse position at the end than at the beginning?
  - **(correta)** a) Number four
  - b) Number seven
  - c) Number one
  - Explicação: o número quatro começa em segundo e termina em terceiro. No diálogo — Commentator: “Number seven gets a good start and takes first position, closely followed by number four in second place.” / Commentator: “Number seven has won the race! Number one is second, and number four comes in third.”
  - Falas de referência: john-p4-x01-l01, john-p4-x01-l03

#### Conteúdo das falas fora do inventário de itens

14 de 25 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: number, seven, gets, takes, four, second, place, one, moves, while, three, drops, won, comes.

## Itens das tabelas da fonte sem atividade correspondente (5)

Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.

| Inglês (literal) | Tabela | Fonte |
|---|---|---|
| take up a position | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:146 — “\| take up a position \| assumir uma posição \|” |
| come up to the finish | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:219 — “\| come up to the finish \| aproximar-se da linha de chegada \|” |
| win the race | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:221 — “\| win the race \| vencer a corrida \|” |
| as fast as you can | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:222 — “\| as fast as you can \| o mais rápido que puder \|” |
| good fun | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:224 — “\| good fun \| muito divertido / uma diversão \|” |

## Conteúdo da fonte que não está nos dados do app (literal)

Linhas de `04_Opinions_Sports_and_Social_Life.md` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.

**Linhas 1–3:**

```markdown
# THE STORY OF JOHN
## Part 4 — Opinions, Sports and Social Life
**Daily Routine English · British English**
```

**Linhas 137–137:**

```markdown
## Vocabulary & expressions
```

**Linhas 154–182:**

```markdown
## Practice

### A. Answer in English

1. What event do the friends watch?
2. Which runner comes in first?
3. What does Rick suggest after the race?
4. What does John invite Jessy to do?
5. What does “closely followed by” mean?

### B. Translate into English

1. O corredor está em primeiro lugar.
2. Ela está sendo seguida de perto pelo corredor de vermelho.
3. Precisamos continuar tentando.
4. Você gostaria de vir?
5. Poderíamos ir ao restaurante novo.

### C. Retell the race

Write a short commentary (5–8 sentences). Use at least four ordinal numbers and three expressions from the race vocabulary.

### Suggested answers

**A:** 1. A race. 2. The runner in blue. 3. He suggests getting something to eat. 4. He invites her to a get-together. 5. “Seguido de perto por”.

**B:** 1. The runner is in first place. 2. She's closely followed by the runner in red. 3. We must keep trying. 4. Would you like to come? 5. We could go to the new restaurant.

## Source coverage — race commentary and ordinal numbers
```

**Linhas 195–210:**

```markdown
### Ordinal numbers

| Cardinal | Ordinal | Português |
|---|---|---|
| one | first (1st) | primeiro |
| two | second (2nd) | segundo |
| three | third (3rd) | terceiro |
| four | fourth (4th) | quarto |
| five | fifth (5th) | quinto |
| six | sixth (6th) | sexto |
| seven | seventh (7th) | sétimo |
| eight | eighth (8th) | oitavo |
| nine | ninth (9th) | nono |
| ten | tenth (10th) | décimo |

### Useful commentary chunks
```

**Linhas 216–216:**

```markdown
| closely followed by | seguido de perto por |
```

**Linhas 223–223:**

```markdown
| keep trying | continue tentando |
```

**Linhas 226–229:**

```markdown
**Practice instruction:** Listen to the commentator, read and record the dialogue, then listen to your recording. Repeat at a comfortable pace first; increase speed only while maintaining intelligibility.  
*Instrução: Ouça o comentarista, leia e grave o diálogo e depois escute sua gravação. Primeiro repita em um ritmo confortável; aumente a velocidade somente enquanto mantiver a inteligibilidade.*

**Language focus:** *must* expresses strong obligation; *keep + -ing* indicates continuation (*keep trying*). The pattern *as ... as you can* expresses the maximum degree possible.
```

---

# The Story of John — Parte 5: Business Calls and Social Arrangements

**Pacote:** The Story of John (`the-story-of-john`, conteúdo `118297cacc48`, idioma en-GB) · **Parte:** `john-p5` · **Arquivo-fonte:** `dev/content/dialogues/source/the-story-of-john/05_Business_Calls_and_Social_Arrangements.md`

**Origem do pacote (literal):** Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.

**Atividades:** 4 (4 episódios, 0 mini-diálogos) · **Falas:** 30 · **Itens:** 9 · **Questões:** 38

## Atividades

- [`john-p5-e01` — A call for Mary](#episode-1-a-call-for-mary)
- [`john-p5-e02` — Making arrangements](#episode-2-making-arrangements)
- [`john-p5-e03` — A social invitation](#episode-3-a-social-invitation)
- [`john-p5-e04` — Confirming the details](#episode-4-confirming-the-details)

## Conteúdo por atividade

### Episode 1 — A call for Mary

**Id:** `john-p5-e01` · **Tipo:** episódio · **Ordem na parte:** 1 · **Título:** A call for Mary

**Contexto (literal):** Mary is at the office when the receptionist calls her.

**Origem:** autoral (The Story of John) · arquivo `05_Business_Calls_and_Social_Arrangements.md` a partir da linha 9 · tradução: referência autoral — não validada pelo professor

#### Falas (11) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p5-e01-l01 | Receptionist (`role-receptionist`) | Mr Walker is on the phone for you, Mary. | O Sr. Walker está ao telefone para você, Mary. *(rótulo na tradução: Recepcionista)* | 37b08f66 | bf_alice | 05_Business_Calls_and_Social_Arrangements.md:9 / 10 |
| 2 | john-p5-e01-l02 | Mary (`mary`) | Thank you. Could you put him through, please? | Obrigada. Poderia transferir a ligação para mim, por favor? | 582564c9 | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:12 / 13 |
| 3 | john-p5-e01-l03 | Receptionist (`role-receptionist`) | Certainly. | Certamente. *(rótulo na tradução: Recepcionista)* | 64f93907 | bf_alice | 05_Business_Calls_and_Social_Arrangements.md:15 / 16 |
| 4 | john-p5-e01-l04 | Mary (`mary`) | Hello, Mr Walker. How are you today? | Olá, Sr. Walker. Como está hoje? | 7012631b | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:18 / 19 |
| 5 | john-p5-e01-l05 | Peter (`peter`) | Very well, thank you. I'm hoping you could advise me on a new computer system. | Muito bem, obrigado. Espero que você possa me aconselhar sobre um novo sistema de computador. | f8050ceb | bm_daniel | 05_Business_Calls_and_Social_Arrangements.md:21 / 22 |
| 6 | john-p5-e01-l06 | Mary (`mary`) | Of course. What would you like to know? | Claro. O que gostaria de saber? | 055dc4e7 | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:24 / 25 |
| 7 | john-p5-e01-l07 | Peter (`peter`) | Which of your products would most suit a small business? | Qual dos produtos de vocês atenderia melhor a uma pequena empresa? | 19dc098b | bm_daniel | 05_Business_Calls_and_Social_Arrangements.md:27 / 28 |
| 8 | john-p5-e01-l08 | Mary (`mary`) | I can explain the options. Could you meet me later this afternoon? | Posso explicar as opções. Poderia se encontrar comigo hoje à tarde? | f8981ef4 | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:30 / 31 |
| 9 | john-p5-e01-l09 | Peter (`peter`) | Yes. I'm free at about half past five. Is that all right with you? | Sim. Estou livre por volta das cinco e meia. Está bom para você? | f1385f41 | bm_daniel | 05_Business_Calls_and_Social_Arrangements.md:33 / 34 |
| 10 | john-p5-e01-l10 | Mary (`mary`) | That's fine. How about the Palace Hotel? They have a wonderful restaurant. | Ótimo. Que tal o Palace Hotel? Eles têm um restaurante maravilhoso. | 4f7a26e1 | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:36 / 37 |
| 11 | john-p5-e01-l11 | Peter (`peter`) | That sounds good. I'll see you there at half five, then. | Parece ótimo. Então nos vemos lá às cinco e meia. | c5bade8f | bm_daniel | 05_Business_Calls_and_Social_Arrangements.md:39 / 40 |

#### Itens de vocabulário (9)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p5-e01-v01 | chunk | on the phone | = | ao telefone | john-p5-e01-l01 | 4e6d0eeb | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:46 |
| john-p5-e01-v02 | phrasal verb | put someone through | = | transferir / conectar uma ligação | john-p5-e01-l02 | b0dc92ef | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:47 |
| john-p5-e01-v03 | expressão | The line is engaged. | = | A linha está ocupada. | — (não aparece literalmente) | 8f46df5f | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:48 |
| john-p5-e01-v04 | expressão | He hung up. | = | Ele desligou. | — (não aparece literalmente) | 13559cdb | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:49 |
| john-p5-e01-v05 | chunk | hold on, please | = | aguarde um instante, por favor | — (não aparece literalmente) | 7497cc43 | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:50 |
| john-p5-e01-v06 | expressão | What can I do for you? | = | Em que posso ajudar? | — (não aparece literalmente) | f7aa2578 | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:51 |
| john-p5-e01-v07 | chunk | advise me on | = | aconselhar-me sobre | john-p5-e01-l05 | f088e1b2 | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:52 |
| john-p5-e01-v08 | chunk | suit my company | = | atender às necessidades da minha empresa | — (não aparece literalmente) | be48eec5 | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:53 |
| john-p5-e01-v09 | expressão | I'll see you there. | = | Vejo você lá / Nos vemos lá. | john-p5-e01-l11 | 447db0b3 | Telephone expressions | 05_Business_Calls_and_Social_Arrangements.md:54 |

#### Notas pedagógicas (1) — literal

### Telephone expressions
**Phrasal verbs:** *put through* (transferir a ligação), *hang up* (desligar o telefone), *hold on* (aguardar).

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p5-e01-q01** (explicit_fact) — Who is on the phone for Mary?
  - **(correta)** a) Mr Walker
  - b) John
  - c) Rick
  - Explicação: No diálogo — Receptionist: “Mr Walker is on the phone for you, Mary.”
  - Falas de referência: john-p5-e01-l01
- **john-p5-e01-q02** (intention) — What does Mary ask the receptionist to do?
  - **(correta)** a) Put the call through
  - b) Take a message
  - c) Say she is busy
  - Explicação: No diálogo — Mary: “Thank you. Could you put him through, please?”
  - Falas de referência: john-p5-e01-l02
- **john-p5-e01-q03** (intention) — Why is Mr Walker calling?
  - **(correta)** a) He wants advice on a new computer system
  - b) He wants to complain
  - c) He wants to invite Mary to dinner
  - Explicação: No diálogo — Peter: “Very well, thank you. I'm hoping you could advise me on a new computer system.”
  - Falas de referência: john-p5-e01-l05
- **john-p5-e01-q04** (intention) — What does Mr Walker want to know?
  - **(correta)** a) Which product would most suit a small business
  - b) How much a computer costs
  - c) Where Mary's office is
  - Explicação: No diálogo — Peter: “Which of your products would most suit a small business?”
  - Falas de referência: john-p5-e01-l07
- **john-p5-e01-q05** (action) — What does Mary offer?
  - **(correta)** a) To explain the options
  - b) To send him a new computer
  - c) To call him tomorrow
  - Explicação: No diálogo — Mary: “I can explain the options. Could you meet me later this afternoon?”
  - Falas de referência: john-p5-e01-l08
- **john-p5-e01-q06** (intention) — What does Mary propose?
  - **(correta)** a) Meeting later this afternoon
  - b) Meeting tomorrow morning
  - c) Meeting next week
  - Explicação: No diálogo — Mary: “I can explain the options. Could you meet me later this afternoon?”
  - Falas de referência: john-p5-e01-l08
- **john-p5-e01-q07** (explicit_fact) — When is Mr Walker free?
  - **(correta)** a) At about half past five
  - b) At about nine
  - c) At about eleven
  - Explicação: No diálogo — Peter: “Yes. I'm free at about half past five. Is that all right with you?”
  - Falas de referência: john-p5-e01-l09
- **john-p5-e01-q08** (explicit_fact) — Where does Mary suggest meeting?
  - **(correta)** a) At the Palace Hotel
  - b) At a café near the station
  - c) At her office
  - Explicação: No diálogo — Mary: “That's fine. How about the Palace Hotel? They have a wonderful restaurant.”
  - Falas de referência: john-p5-e01-l10
- **john-p5-e01-q09** (inference) — Why does Mary suggest the Palace Hotel?
  - **(correta)** a) It has a wonderful restaurant
  - b) It's near her house
  - c) It's cheap
  - Explicação: No diálogo — Mary: “That's fine. How about the Palace Hotel? They have a wonderful restaurant.”
  - Falas de referência: john-p5-e01-l10
- **john-p5-e01-q10** (explicit_fact) — What time will they meet?
  - **(correta)** a) At half past five
  - b) At half past nine
  - c) At five o'clock
  - Explicação: "half five" = 5h30 (BrE). No diálogo — Peter: “That sounds good. I'll see you there at half five, then.”
  - Falas de referência: john-p5-e01-l11

#### Conteúdo das falas fora do inventário de itens

37 de 44 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: mr, walker, mary, thank, certainly, hello, today, hoping, new, computer, system, course, like, know, products, most, small, business, explain, options, meet, later, afternoon, free, half, past, five, all, right, fine, palace, hotel, wonderful, restaurant, sounds, good, then.

### Episode 2 — Making arrangements

**Id:** `john-p5-e02` · **Tipo:** episódio · **Ordem na parte:** 2 · **Título:** Making arrangements

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `05_Business_Calls_and_Social_Arrangements.md` a partir da linha 60 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p5-e02-l01 | John (`john`) | Mary, are you available tomorrow morning? | Mary, você está disponível amanhã de manhã? | 2746e833 | bm_george | 05_Business_Calls_and_Social_Arrangements.md:60 / 61 |
| 2 | john-p5-e02-l02 | Mary (`mary`) | It depends. What time are you thinking of? | Depende. Que horário você está pensando? | 05e050b9 | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:63 / 64 |
| 3 | john-p5-e02-l03 | John (`john`) | Could we meet at nine? | Poderíamos nos encontrar às nove? | dec2e1f2 | bm_george | 05_Business_Calls_and_Social_Arrangements.md:66 / 67 |
| 4 | john-p5-e02-l04 | Mary (`mary`) | I'm afraid I can't make it at nine. Could we meet at half past nine instead? | Infelizmente não consigo às nove. Poderíamos nos encontrar às nove e meia? | d1530800 | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:69 / 70 |
| 5 | john-p5-e02-l05 | John (`john`) | That would suit me. | Esse horário seria bom para mim. | d10c8ca9 | bm_george | 05_Business_Calls_and_Social_Arrangements.md:72 / 73 |
| 6 | john-p5-e02-l06 | Mary (`mary`) | Shall I book a meeting room? | Devo reservar uma sala de reunião? | dfe34229 | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:75 / 76 |
| 7 | john-p5-e02-l07 | John (`john`) | Yes, please. Thanks for arranging it. | Sim, por favor. Obrigado por organizar isso. | 45d8b1d3 | bm_george | 05_Business_Calls_and_Social_Arrangements.md:78 / 79 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Grammar in context — polite requests
- **Could you...?** — pedido educado: *Could you call me?*
- **Would you...?** — pedido ou convite educado: *Would you send the details?*
- **Could we...?** — proposta: *Could we meet tomorrow?*
- **That would suit me.** — Esse horário seria adequado para mim.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p5-e02-q01** (intention) — What does John want to know?
  - **(correta)** a) If Mary is available tomorrow morning
  - b) If Mary is free this afternoon
  - c) If Mary can book a flight
  - Explicação: No diálogo — John: “Mary, are you available tomorrow morning?”
  - Falas de referência: john-p5-e02-l01
- **john-p5-e02-q02** (inference) — What is Mary's first answer?
  - **(correta)** a) It depends on the time
  - b) Yes, she is free all morning
  - c) No, she isn't available
  - Explicação: No diálogo — Mary: “It depends. What time are you thinking of?”
  - Falas de referência: john-p5-e02-l02
- **john-p5-e02-q03** (explicit_fact) — What time does John suggest?
  - **(correta)** a) Nine
  - b) Half past nine
  - c) Eight
  - Explicação: No diálogo — John: “Could we meet at nine?”
  - Falas de referência: john-p5-e02-l03
- **john-p5-e02-q04** (explicit_fact) — Can Mary meet at nine?
  - **(correta)** a) No, she can't
  - b) Yes, she can
  - c) She isn't sure
  - Explicação: No diálogo — Mary: “I'm afraid I can't make it at nine. Could we meet at half past nine instead?”
  - Falas de referência: john-p5-e02-l04
- **john-p5-e02-q05** (explicit_fact) — What time does Mary suggest instead?
  - **(correta)** a) Half past nine
  - b) Nine
  - c) Ten
  - Explicação: No diálogo — Mary: “I'm afraid I can't make it at nine. Could we meet at half past nine instead?”
  - Falas de referência: john-p5-e02-l04
- **john-p5-e02-q06** (inference) — Does the new time suit John?
  - **(correta)** a) Yes, it does
  - b) No, it doesn't
  - c) He doesn't say
  - Explicação: No diálogo — John: “That would suit me.”
  - Falas de referência: john-p5-e02-l05
- **john-p5-e02-q07** (intention) — What does Mary offer to do?
  - **(correta)** a) Book a meeting room
  - b) Cancel the meeting
  - c) Call the team
  - Explicação: No diálogo — Mary: “Shall I book a meeting room?”
  - Falas de referência: john-p5-e02-l06
- **john-p5-e02-q08** (explicit_fact) — Does John accept Mary's offer?
  - **(correta)** a) Yes, he does
  - b) No, he doesn't
  - c) He'll book it himself
  - Explicação: No diálogo — John: “Yes, please. Thanks for arranging it.”
  - Falas de referência: john-p5-e02-l07
- **john-p5-e02-q09** (inference) — Why does John thank Mary?
  - **(correta)** a) For arranging the meeting
  - b) For the coffee
  - c) For the report
  - Explicação: No diálogo — John: “Yes, please. Thanks for arranging it.”
  - Falas de referência: john-p5-e02-l07
- **john-p5-e02-q10** (context) — When is the meeting going to be?
  - **(correta)** a) Tomorrow morning
  - b) This afternoon
  - c) Next week
  - Explicação: No diálogo — John: “Mary, are you available tomorrow morning?”
  - Falas de referência: john-p5-e02-l01

#### Conteúdo das falas fora do inventário de itens

23 de 23 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: mary, available, tomorrow, morning, depends, time, thinking, meet, nine, afraid, can't, make, half, past, instead, suit, shall, book, meeting, room, please, thanks, arranging.

### Episode 3 — A social invitation

**Id:** `john-p5-e03` · **Tipo:** episódio · **Ordem na parte:** 3 · **Título:** A social invitation

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `05_Business_Calls_and_Social_Arrangements.md` a partir da linha 90 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p5-e03-l01 | Rick (`rick`) | Where can we go next Friday? | Aonde podemos ir na próxima sexta-feira? | 6e29a919 | bm_lewis | 05_Business_Calls_and_Social_Arrangements.md:90 / 91 |
| 2 | john-p5-e03-l02 | John (`john`) | We could go to the cinema. | Poderíamos ir ao cinema. | 020b0b42 | bm_george | 05_Business_Calls_and_Social_Arrangements.md:93 / 94 |
| 3 | john-p5-e03-l03 | Jessy (`jessy`) | The cinema again? Have you got any better ideas? | Cinema de novo? Você tem alguma ideia melhor? | efde71a6 | bf_isabella | 05_Business_Calls_and_Social_Arrangements.md:96 / 97 |
| 4 | john-p5-e03-l04 | Mary (`mary`) | There's a new club that has just opened in Duke Street. | Há um clube novo que acabou de abrir na Duke Street. | 03d2e8ed | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:99 / 100 |
| 5 | john-p5-e03-l05 | Rick (`rick`) | Where's that? | Onde fica? | 574b05a8 | bm_lewis | 05_Business_Calls_and_Social_Arrangements.md:102 / 103 |
| 6 | john-p5-e03-l06 | Mary (`mary`) | Near the old library. How about meeting there at half past eight? | Perto da biblioteca antiga. Que tal nos encontrarmos lá às oito e meia? | b46113ea | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:105 / 106 |
| 7 | john-p5-e03-l07 | John (`john`) | That sounds good. I'll see you there. | Parece ótimo. Vejo vocês lá. | 2b8bc786 | bm_george | 05_Business_Calls_and_Social_Arrangements.md:108 / 109 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p5-e03-q01** (intention) — What are they planning?
  - **(correta)** a) Where to go next Friday
  - b) Where to work next week
  - c) What to buy
  - Explicação: No diálogo — Rick: “Where can we go next Friday?”
  - Falas de referência: john-p5-e03-l01
- **john-p5-e03-q02** (explicit_fact) — What does John suggest?
  - **(correta)** a) Going to the cinema
  - b) Going to a new club
  - c) Going to the park
  - Explicação: No diálogo — John: “We could go to the cinema.”
  - Falas de referência: john-p5-e03-l02
- **john-p5-e03-q03** (inference) — How does Jessy react to John's idea?
  - **(correta)** a) She wants a better idea
  - b) She loves it
  - c) She agrees immediately
  - Explicação: No diálogo — Jessy: “The cinema again? Have you got any better ideas?”
  - Falas de referência: john-p5-e03-l03
- **john-p5-e03-q04** (explicit_fact) — What does Mary suggest?
  - **(correta)** a) A new club in Duke Street
  - b) A restaurant in King Street
  - c) The café near the station
  - Explicação: No diálogo — Mary: “There's a new club that has just opened in Duke Street.”
  - Falas de referência: john-p5-e03-l04
- **john-p5-e03-q05** (explicit_fact) — What do we know about the club?
  - **(correta)** a) It has just opened
  - b) It is very old
  - c) It is closed
  - Explicação: No diálogo — Mary: “There's a new club that has just opened in Duke Street.”
  - Falas de referência: john-p5-e03-l04
- **john-p5-e03-q06** (intention) — What does Rick want to know?
  - **(correta)** a) Where the club is
  - b) What time it opens
  - c) How much it costs
  - Explicação: No diálogo — Rick: “Where's that?”
  - Falas de referência: john-p5-e03-l05
- **john-p5-e03-q07** (explicit_fact) — Where is the club?
  - **(correta)** a) Near the old library
  - b) Near the station
  - c) In King Street
  - Explicação: No diálogo — Mary: “Near the old library. How about meeting there at half past eight?”
  - Falas de referência: john-p5-e03-l06
- **john-p5-e03-q08** (explicit_fact) — What time does Mary suggest meeting?
  - **(correta)** a) At half past eight
  - b) At half past five
  - c) At seven
  - Explicação: No diálogo — Mary: “Near the old library. How about meeting there at half past eight?”
  - Falas de referência: john-p5-e03-l06
- **john-p5-e03-q09** (inference) — Does John agree with Mary's plan?
  - **(correta)** a) Yes, he does
  - b) No, he doesn't
  - c) He isn't sure
  - Explicação: No diálogo — John: “That sounds good. I'll see you there.”
  - Falas de referência: john-p5-e03-l07
- **john-p5-e03-q10** (explicit_fact) — When are they going out?
  - **(correta)** a) Next Friday
  - b) Next Saturday
  - c) Tonight
  - Explicação: No diálogo — Rick: “Where can we go next Friday?”
  - Falas de referência: john-p5-e03-l01

#### Conteúdo das falas fora do inventário de itens

25 de 25 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: go, next, friday, cinema, again, got, any, better, ideas, new, club, opened, duke, street, where's, near, old, library, meeting, half, past, eight, sounds, good, see.

### Episode 4 — Confirming the details

**Id:** `john-p5-e04` · **Tipo:** episódio · **Ordem na parte:** 4 · **Título:** Confirming the details

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `05_Business_Calls_and_Social_Arrangements.md` a partir da linha 113 · tradução: referência autoral — não validada pelo professor

#### Falas (5) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p5-e04-l01 | Jessy (`jessy`) | Are we still meeting at the Palace Hotel? | Ainda vamos nos encontrar no Palace Hotel? | 22f89a61 | bf_isabella | 05_Business_Calls_and_Social_Arrangements.md:113 / 114 |
| 2 | john-p5-e04-l02 | Mary (`mary`) | Yes. I've booked a table for six people. | Sim. Reservei uma mesa para seis pessoas. | 0ff14e5a | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:116 / 117 |
| 3 | john-p5-e04-l03 | Rick (`rick`) | What time should we arrive? | A que horas devemos chegar? | 44b417e5 | bm_lewis | 05_Business_Calls_and_Social_Arrangements.md:119 / 120 |
| 4 | john-p5-e04-l04 | Mary (`mary`) | At about half past five. | Por volta das cinco e meia. | 76d2a4fc | bf_emma | 05_Business_Calls_and_Social_Arrangements.md:122 / 123 |
| 5 | john-p5-e04-l05 | John (`john`) | Perfect. I'll be there a little early. | Perfeito. Estarei lá um pouco mais cedo. | aea604b2 | bm_george | 05_Business_Calls_and_Social_Arrangements.md:125 / 126 |

**Falas corrigidas (decisão do PO de 2026-11-11; o app usa o texto corrigido, a fonte continua com o original):**

- `john-p5-e04-l02` — original da fonte: “Yes. I've booked a table for six.” / “Sim. Reservei uma mesa para seis pessoas.”
  - motivo: “A table for six” podia ser lido como seis horas (eles chegam às cinco e meia). A tradução do próprio documento já dizia “seis pessoas”.

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### British time expressions
- *half past five* = 5h30.
- *half five* = 5h30, forma informal muito comum no inglês britânico.
- *at about five* = por volta das cinco.
- *this evening* = hoje à noite / no começo da noite, conforme o contexto.
- *later this afternoon* = mais tarde hoje à tarde.

#### Questões de compreensão (8)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p5-e04-q01** (explicit_fact) — Where are they meeting?
  - **(correta)** a) At the Palace Hotel
  - b) In Duke Street
  - c) In King Street
  - Explicação: No diálogo — Jessy: “Are we still meeting at the Palace Hotel?”
  - Falas de referência: john-p5-e04-l01
- **john-p5-e04-q02** (inference) — What does Jessy's question "Are we still meeting at the Palace Hotel?" show?
  - **(correta)** a) The plan was already arranged
  - b) It's a new idea
  - c) The meeting was cancelled
  - Explicação: No diálogo — Jessy: “Are we still meeting at the Palace Hotel?”
  - Falas de referência: john-p5-e04-l01
- **john-p5-e04-q03** (action) — What has Mary done?
  - **(correta)** a) She has booked a table
  - b) She has cancelled the meeting
  - c) She has changed the place
  - Explicação: No diálogo — Mary: “Yes. I've booked a table for six people.”
  - Falas de referência: john-p5-e04-l02
- **john-p5-e04-q04** (explicit_fact) — For how many people is the table?
  - **(correta)** a) Six
  - b) Four
  - c) Eight
  - Explicação: No diálogo — Mary: “Yes. I've booked a table for six people.”
  - Falas de referência: john-p5-e04-l02
- **john-p5-e04-q05** (intention) — What does Rick want to know?
  - **(correta)** a) What time they should arrive
  - b) Where the hotel is
  - c) Who is coming
  - Explicação: No diálogo — Rick: “What time should we arrive?”
  - Falas de referência: john-p5-e04-l03
- **john-p5-e04-q06** (explicit_fact) — What time should they arrive?
  - **(correta)** a) At about half past five
  - b) At about seven
  - c) At about nine
  - Explicação: No diálogo — Mary: “At about half past five.”
  - Falas de referência: john-p5-e04-l04
- **john-p5-e04-q07** (inference) — How does John feel about the arrangement?
  - **(correta)** a) He's happy with it — "Perfect"
  - b) He's worried about it
  - c) He doesn't like it
  - Explicação: No diálogo — John: “Perfect. I'll be there a little early.”
  - Falas de referência: john-p5-e04-l05
- **john-p5-e04-q08** (action) — What will John do?
  - **(correta)** a) Arrive a little early
  - b) Arrive late
  - c) Not go
  - Explicação: No diálogo — John: “Perfect. I'll be there a little early.”
  - Falas de referência: john-p5-e04-l05

#### Conteúdo das falas fora do inventário de itens

17 de 17 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: still, meeting, palace, hotel, booked, table, six, people, time, should, arrive, half, past, five, perfect, little, early.

## Itens das tabelas da fonte sem atividade correspondente (15)

Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.

| Inglês (literal) | Tabela | Fonte |
|---|---|---|
| the line is engaged | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:173 — “\| the line is engaged \| a linha está ocupada (BrE) \|” |
| hang up | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:174 — “\| hang up \| desligar o telefone \|” |
| hold on | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:175 — “\| hold on \| aguardar / espere um instante \|” |
| hold on a second | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:176 — “\| hold on a second \| espere um segundo \|” |
| We are late, aren't we? | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:190 — “\| We are late, aren't we? \| Estamos atrasados, não estamos? \|” |
| I wonder what time it is. | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:191 — “\| I wonder what time it is. \| Fico imaginando que horas são. \|” |
| I wonder if he will come. | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:192 — “\| I wonder if he will come. \| Será que ele vem? \|” |
| I wonder if you could help me. | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:193 — “\| I wonder if you could help me. \| Gostaria de saber se você poderia me ajudar. \|” |
| a natural wonder | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:194 — “\| a natural wonder \| uma maravilha natural \|” |
| with wonder | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:195 — “\| with wonder \| com admiração / espanto \|” |
| no wonder | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:196 — “\| no wonder \| não é à toa \|” |
| collect stamps | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:197 — “\| collect stamps \| colecionar selos \|” |
| collect the homework | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:198 — “\| collect the homework \| recolher a lição de casa \|” |
| collect a parcel | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:199 — “\| collect a parcel \| retirar/buscar uma encomenda \|” |
| collect the children from school | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:200 — “\| collect the children from school \| buscar as crianças na escola \|” |

## Conteúdo da fonte que não está nos dados do app (literal)

Linhas de `05_Business_Calls_and_Social_Arrangements.md` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.

**Linhas 1–3:**

```markdown
# THE STORY OF JOHN
## Part 5 — Business Calls and Social Arrangements
**Daily Routine English · British English**
```

**Linhas 7–7:**

```markdown
John is at the office when the receptionist calls.
```

**Linhas 136–167:**

```markdown
## Practice

### A. Complete with a suitable expression

1. Could you ______ me through, please?
2. The line is ______.
3. Can you hold ______, please?
4. He ______ up before I could answer.
5. Which product would most ______ my company?

### B. Translate into English

1. O Sr. Walker está ao telefone.
2. Poderia transferir a ligação, por favor?
3. A linha está ocupada.
4. Você poderia se encontrar comigo às cinco e meia?
5. Que tal o Palace Hotel?
6. Esse horário seria bom para mim.

### C. Role-play

Student A: receptionist / colleague. Student B: caller. Transfer a call, explain the reason for calling, ask for advice and arrange a meeting. Then change roles.

### Suggested answers

**A:** 1. put; 2. engaged; 3. on; 4. hung; 5. suit.

**B:** 1. Mr Walker is on the phone. 2. Could you put the call through, please? 3. The line is engaged. 4. Could you meet me at half five? 5. How about the Palace Hotel? 6. That time would suit me.

## Source coverage — telephone, phrasal verbs and wider meanings

### Telephone language
```

**Linhas 171–172:**

```markdown
| on the phone | ao telefone |
| put someone through | transferir/conectar alguém na ligação |
```

**Linhas 178–186:**

```markdown
**Important: context changes meaning.**

- *He hung up on me.* — Ele desligou na minha cara.
- *Hang up your coat.* — Pendure seu casaco.
- *He's still hung up on his ex.* — Ele ainda não superou a ex.
- *Hold on to the railing.* — Segure-se no corrimão.
- *Hold on, let's think.* — Calma, vamos pensar.

### Other source expressions
```

**Linhas 202–202:**

```markdown
**Grammar note:** *I wonder if...* é uma forma indireta e frequentemente polida de introduzir uma pergunta/dúvida; *wonder* também pode ser substantivo (maravilha/espanto). *Collect* varia entre colecionar, recolher e buscar/retirar conforme o objeto.
```

---

# The Story of John — Parte 6: Shopping, Clothes and Everyday Services

**Pacote:** The Story of John (`the-story-of-john`, conteúdo `118297cacc48`, idioma en-GB) · **Parte:** `john-p6` · **Arquivo-fonte:** `dev/content/dialogues/source/the-story-of-john/06_Shopping_Clothes_and_Everyday_Services.md`

**Origem do pacote (literal):** Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.

**Atividades:** 5 (5 episódios, 0 mini-diálogos) · **Falas:** 32 · **Itens:** 24 · **Questões:** 45

## Atividades

- [`john-p6-e01` — A suit for the meeting](#episode-1-a-suit-for-the-meeting)
- [`john-p6-e02` — In the clothes shop](#episode-2-in-the-clothes-shop)
- [`john-p6-e03` — Asking for help](#episode-3-asking-for-help)
- [`john-p6-e04` — A different choice](#episode-4-a-different-choice)
- [`john-p6-e05` — Getting ready](#episode-5-getting-ready)

## Conteúdo por atividade

### Episode 1 — A suit for the meeting

**Id:** `john-p6-e01` · **Tipo:** episódio · **Ordem na parte:** 1 · **Título:** A suit for the meeting

**Contexto (literal):** John has an important meeting next week. Mary suggests buying a new suit.

**Origem:** autoral (The Story of John) · arquivo `06_Shopping_Clothes_and_Everyday_Services.md` a partir da linha 9 · tradução: referência autoral — não validada pelo professor

#### Falas (5) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p6-e01-l01 | Mary (`mary`) | You need something smart for the meeting. | Você precisa de algo elegante para a reunião. | fec2ff2a | bf_emma | 06_Shopping_Clothes_and_Everyday_Services.md:9 / 10 |
| 2 | john-p6-e01-l02 | John (`john`) | I know. I haven't bought a suit for years. | Eu sei. Faz anos que não compro um terno. | a3007b12 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:12 / 13 |
| 3 | john-p6-e01-l03 | Mary (`mary`) | There's a good clothes shop in the city centre. | Há uma boa loja de roupas no centro da cidade. | dd485a3b | bf_emma | 06_Shopping_Clothes_and_Everyday_Services.md:15 / 16 |
| 4 | john-p6-e01-l04 | John (`john`) | Shall we have a look this afternoon? | Vamos dar uma olhada hoje à tarde? | 9714400f | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:18 / 19 |
| 5 | john-p6-e01-l05 | Mary (`mary`) | Certainly. I can help you choose. | Claro. Posso ajudar você a escolher. | 14b96702 | bf_emma | 06_Shopping_Clothes_and_Everyday_Services.md:21 / 22 |

#### Itens de vocabulário (3)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p6-e01-v01 | chunk | clothes shop | = | loja de roupas | john-p6-e01-l03 | 2356e28d | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:108 |
| john-p6-e01-v02 | palavra | suit | = | terno | john-p6-e01-l02 | 2e2f8980 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:109 |
| john-p6-e01-v03 | palavra | smart | = | elegante / arrumado | john-p6-e01-l01 | ae97e7d2 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:120 |

#### Questões de compreensão (8)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p6-e01-q01** (context) — What does John have next week?
  - **(correta)** a) An important meeting
  - b) A trip to Edinburgh
  - c) A wedding
  - Explicação: No diálogo — Contexto da cena: John has an important meeting next week. Mary suggests buying a new suit.
  - Falas de referência: —
- **john-p6-e01-q02** (explicit_fact) — According to Mary, what does John need?
  - **(correta)** a) Something smart for the meeting
  - b) A new computer
  - c) A train ticket
  - Explicação: No diálogo — Mary: “You need something smart for the meeting.”
  - Falas de referência: john-p6-e01-l01
- **john-p6-e01-q03** (explicit_fact) — When did John last buy a suit?
  - **(correta)** a) Years ago
  - b) Last week
  - c) Yesterday
  - Explicação: No diálogo — John: “I know. I haven't bought a suit for years.”
  - Falas de referência: john-p6-e01-l02
- **john-p6-e01-q04** (explicit_fact) — Where is there a good clothes shop?
  - **(correta)** a) In the city centre
  - b) Near the station
  - c) In King Street
  - Explicação: No diálogo — Mary: “There's a good clothes shop in the city centre.”
  - Falas de referência: john-p6-e01-l03
- **john-p6-e01-q05** (intention) — What does John suggest?
  - **(correta)** a) Having a look this afternoon
  - b) Buying online
  - c) Going next week
  - Explicação: No diálogo — John: “Shall we have a look this afternoon?”
  - Falas de referência: john-p6-e01-l04
- **john-p6-e01-q06** (action) — What will Mary do?
  - **(correta)** a) Help him choose
  - b) Wait at home
  - c) Pay for the suit
  - Explicação: No diálogo — Mary: “Certainly. I can help you choose.”
  - Falas de referência: john-p6-e01-l05
- **john-p6-e01-q07** (context) — Who suggests buying a new suit?
  - **(correta)** a) Mary
  - b) John
  - c) Rick
  - Explicação: No diálogo — Contexto da cena: John has an important meeting next week. Mary suggests buying a new suit.
  - Falas de referência: —
- **john-p6-e01-q08** (inference) — Does Mary agree to go with John?
  - **(correta)** a) Yes — "Certainly"
  - b) No, she's busy
  - c) She doesn't answer
  - Explicação: No diálogo — John: “Shall we have a look this afternoon?” / Mary: “Certainly. I can help you choose.”
  - Falas de referência: john-p6-e01-l04, john-p6-e01-l05

#### Conteúdo das falas fora do inventário de itens

16 de 20 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: need, something, meeting, know, haven't, bought, years, good, city, centre, shall, look, afternoon, certainly, help, choose.

### Episode 2 — In the clothes shop

**Id:** `john-p6-e02` · **Tipo:** episódio · **Ordem na parte:** 2 · **Título:** In the clothes shop

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `06_Shopping_Clothes_and_Everyday_Services.md` a partir da linha 26 · tradução: referência autoral — não validada pelo professor

#### Falas (9) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p6-e02-l01 | Shop assistant (`role-shop-assistant`) | Good afternoon. Can I help you? | Boa tarde. Posso ajudar? *(rótulo na tradução: Vendedor(a))* | 289c6827 | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:26 / 27 |
| 2 | john-p6-e02-l02 | John (`john`) | Yes, please. I'm looking for a suit for a business meeting. | Sim, por favor. Estou procurando um terno para uma reunião de negócios. | 5e20ed1b | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:29 / 30 |
| 3 | john-p6-e02-l03 | Shop assistant (`role-shop-assistant`) | What size are you? | Qual é o seu tamanho? *(rótulo na tradução: Vendedor(a))* | cb2dca8d | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:32 / 33 |
| 4 | john-p6-e02-l04 | John (`john`) | I'm not sure. Could I try this one on? | Não tenho certeza. Posso experimentar este? | 169e93f6 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:35 / 36 |
| 5 | john-p6-e02-l05 | Shop assistant (`role-shop-assistant`) | Of course. The changing rooms are over here. | Claro. Os provadores ficam aqui. *(rótulo na tradução: Vendedor(a))* | 2834a834 | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:38 / 39 |
| 6 | john-p6-e02-l06 | John (`john`) | This jacket is a little too large. Have you got a smaller size? | Este paletó está um pouco grande demais. Você tem um tamanho menor? | b97ad7e2 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:41 / 42 |
| 7 | john-p6-e02-l07 | Shop assistant (`role-shop-assistant`) | I'll have a look for you. | Vou procurar um para você. *(rótulo na tradução: Vendedor(a))* | 8991a948 | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:44 / 45 |
| 8 | john-p6-e02-l08 | Mary (`mary`) | That colour suits you. | Essa cor combina com você. | 56297709 | bf_emma | 06_Shopping_Clothes_and_Everyday_Services.md:47 / 48 |
| 9 | john-p6-e02-l09 | John (`john`) | Do you think so? I'll try the shirt as well. | Você acha? Vou experimentar a camisa também. | 69075ddd | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:50 / 51 |

#### Itens de vocabulário (9)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p6-e02-v01 | palavra | suit | = | terno | john-p6-e02-l02, john-p6-e02-l08 | 2e2f8980 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:109 |
| john-p6-e02-v02 | palavra | jacket | = | paletó / jaqueta, conforme o contexto | john-p6-e02-l06 | 100e165b | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:110 |
| john-p6-e02-v03 | palavra | shirt | = | camisa | john-p6-e02-l09 | 43e36503 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:111 |
| john-p6-e02-v04 | palavra | size | = | tamanho | john-p6-e02-l03, john-p6-e02-l06 | 23a0d95c | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:114 |
| john-p6-e02-v05 | chunk | smaller / larger | smaller, larger | menor / maior | john-p6-e02-l06 | 1f48fa68 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:115 |
| john-p6-e02-v06 | chunk | changing room | = | provador | john-p6-e02-l05 | a8be2031 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:116 |
| john-p6-e02-v07 | phrasal verb | try on | = | experimentar uma roupa | john-p6-e02-l04 | 6f3c33a3 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:117 |
| john-p6-e02-v08 | chunk | look for | = | procurar | john-p6-e02-l02, john-p6-e02-l07 | 92d01611 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:118 |
| john-p6-e02-v09 | chunk | over here | = | aqui / por aqui | john-p6-e02-l05 | 10a09ff3 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:119 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p6-e02-q01** (intention) — What does the shop assistant offer at the beginning?
  - **(correta)** a) To help John
  - b) To close the shop
  - c) To show the changing rooms
  - Explicação: No diálogo — Shop assistant: “Good afternoon. Can I help you?”
  - Falas de referência: john-p6-e02-l01
- **john-p6-e02-q02** (explicit_fact) — What is John looking for?
  - **(correta)** a) A suit for a business meeting
  - b) A shirt for a wedding
  - c) Shoes for work
  - Explicação: No diálogo — John: “Yes, please. I'm looking for a suit for a business meeting.”
  - Falas de referência: john-p6-e02-l02
- **john-p6-e02-q03** (intention) — What does the shop assistant ask?
  - **(correta)** a) What size John is
  - b) What colour he likes
  - c) How much he wants to spend
  - Explicação: No diálogo — Shop assistant: “What size are you?”
  - Falas de referência: john-p6-e02-l03
- **john-p6-e02-q04** (explicit_fact) — Does John know his size?
  - **(correta)** a) No, he isn't sure
  - b) Yes, he does
  - c) He says it's medium
  - Explicação: No diálogo — John: “I'm not sure. Could I try this one on?”
  - Falas de referência: john-p6-e02-l04
- **john-p6-e02-q05** (action) — What does John want to do?
  - **(correta)** a) Try this one on
  - b) Buy it without trying it
  - c) Look at another shop
  - Explicação: No diálogo — John: “I'm not sure. Could I try this one on?”
  - Falas de referência: john-p6-e02-l04
- **john-p6-e02-q06** (explicit_fact) — Where are the changing rooms?
  - **(correta)** a) Over here
  - b) Upstairs
  - c) There aren't any
  - Explicação: No diálogo — Shop assistant: “Of course. The changing rooms are over here.”
  - Falas de referência: john-p6-e02-l05
- **john-p6-e02-q07** (explicit_fact) — What is the problem with the jacket?
  - **(correta)** a) It's a little too large
  - b) It's too small
  - c) It's the wrong colour
  - Explicação: No diálogo — John: “This jacket is a little too large. Have you got a smaller size?”
  - Falas de referência: john-p6-e02-l06
- **john-p6-e02-q08** (intention) — What does John ask for?
  - **(correta)** a) A smaller size
  - b) A larger size
  - c) A different colour
  - Explicação: No diálogo — John: “This jacket is a little too large. Have you got a smaller size?”
  - Falas de referência: john-p6-e02-l06
- **john-p6-e02-q09** (explicit_fact) — What does Mary think?
  - **(correta)** a) The colour suits John
  - b) The jacket is too expensive
  - c) John should try another shop
  - Explicação: No diálogo — Mary: “That colour suits you.”
  - Falas de referência: john-p6-e02-l08
- **john-p6-e02-q10** (action) — What else is John going to try?
  - **(correta)** a) The shirt
  - b) A pair of shoes
  - c) A tie
  - Explicação: No diálogo — John: “Do you think so? I'll try the shirt as well.”
  - Falas de referência: john-p6-e02-l09

#### Conteúdo das falas fora do inventário de itens

18 de 27 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: good, afternoon, help, please, looking, business, meeting, sure, one, course, rooms, little, too, large, got, colour, suits, think.

### Episode 3 — Asking for help

**Id:** `john-p6-e03` · **Tipo:** episódio · **Ordem na parte:** 3 · **Título:** Asking for help

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `06_Shopping_Clothes_and_Everyday_Services.md` a partir da linha 55 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p6-e03-l01 | John (`john`) | Excuse me. Could you show me a blue shirt, please? | Com licença. Poderia me mostrar uma camisa azul, por favor? | 3ab945c2 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:55 / 56 |
| 2 | john-p6-e03-l02 | Shop assistant (`role-shop-assistant`) | Certainly. What size would you like? | Certamente. Qual tamanho você gostaria? *(rótulo na tradução: Vendedor(a))* | a0db3ac2 | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:58 / 59 |
| 3 | john-p6-e03-l03 | John (`john`) | A medium, if you have one. | Uma média, se tiver. | 19327e22 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:61 / 62 |
| 4 | john-p6-e03-l04 | Shop assistant (`role-shop-assistant`) | Here you are. Would you like to try it on? | Aqui está. Gostaria de experimentar? *(rótulo na tradução: Vendedor(a))* | 646ec7dd | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:64 / 65 |
| 5 | john-p6-e03-l05 | John (`john`) | Yes, please. Where can I change? | Sim, por favor. Onde posso me trocar? | c60626be | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:67 / 68 |
| 6 | john-p6-e03-l06 | Shop assistant (`role-shop-assistant`) | The changing rooms are over here. | Os provadores ficam aqui. *(rótulo na tradução: Vendedor(a))* | c8fca05c | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:70 / 71 |
| 7 | john-p6-e03-l07 | John (`john`) | Thank you. | Obrigado. | 33959c2b | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:73 / 74 |

#### Itens de vocabulário (5)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p6-e03-v01 | palavra | shirt | = | camisa | john-p6-e03-l01 | 43e36503 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:111 |
| john-p6-e03-v02 | palavra | size | = | tamanho | john-p6-e03-l02 | 23a0d95c | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:114 |
| john-p6-e03-v03 | chunk | changing room | = | provador | john-p6-e03-l06 | a8be2031 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:116 |
| john-p6-e03-v04 | phrasal verb | try on | = | experimentar uma roupa | john-p6-e03-l04 | 6f3c33a3 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:117 |
| john-p6-e03-v05 | chunk | over here | = | aqui / por aqui | john-p6-e03-l06 | 10a09ff3 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:119 |

#### Notas pedagógicas (1) — literal

### Language focus — Could and Would
- *Could you show me...?* — pedido educado.
- *Could I try this on?* — pedir permissão.
- *Would you like to try it on?* — oferecer algo.
- *What size would you like?* — perguntar a preferência.
- *Have you got a smaller size?* — forma muito comum no inglês britânico para perguntar se há outro tamanho.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p6-e03-q01** (intention) — What does John ask to see?
  - **(correta)** a) A blue shirt
  - b) A grey suit
  - c) A jacket
  - Explicação: No diálogo — John: “Excuse me. Could you show me a blue shirt, please?”
  - Falas de referência: john-p6-e03-l01
- **john-p6-e03-q02** (intention) — What does the shop assistant ask?
  - **(correta)** a) What size John would like
  - b) What colour he wants
  - c) When he needs it
  - Explicação: No diálogo — Shop assistant: “Certainly. What size would you like?”
  - Falas de referência: john-p6-e03-l02
- **john-p6-e03-q03** (explicit_fact) — What size does John want?
  - **(correta)** a) Medium
  - b) Small
  - c) Large
  - Explicação: No diálogo — John: “A medium, if you have one.”
  - Falas de referência: john-p6-e03-l03
- **john-p6-e03-q04** (inference) — What does "if you have one" show?
  - **(correta)** a) John isn't sure the shop has a medium
  - b) John doesn't want a shirt
  - c) John wants two shirts
  - Explicação: No diálogo — John: “A medium, if you have one.”
  - Falas de referência: john-p6-e03-l03
- **john-p6-e03-q05** (inference) — What happens when the assistant says "Here you are"?
  - **(correta)** a) The assistant gives John the shirt
  - b) The assistant shows the door
  - c) The assistant gives John the bill
  - Explicação: No diálogo — Shop assistant: “Here you are. Would you like to try it on?”
  - Falas de referência: john-p6-e03-l04
- **john-p6-e03-q06** (intention) — What does the shop assistant offer?
  - **(correta)** a) That John tries it on
  - b) A discount
  - c) Another colour
  - Explicação: No diálogo — Shop assistant: “Here you are. Would you like to try it on?”
  - Falas de referência: john-p6-e03-l04
- **john-p6-e03-q07** (explicit_fact) — What does John ask?
  - **(correta)** a) Where he can change
  - b) How much it costs
  - c) If they have a smaller size
  - Explicação: No diálogo — John: “Yes, please. Where can I change?”
  - Falas de referência: john-p6-e03-l05
- **john-p6-e03-q08** (explicit_fact) — Where are the changing rooms?
  - **(correta)** a) Over here
  - b) Upstairs
  - c) Outside
  - Explicação: No diálogo — Shop assistant: “The changing rooms are over here.”
  - Falas de referência: john-p6-e03-l06
- **john-p6-e03-q09** (context) — Where is John?
  - **(correta)** a) In a clothes shop
  - b) At the office
  - c) At the station
  - Explicação: No diálogo — John: “Excuse me. Could you show me a blue shirt, please?”
  - Falas de referência: john-p6-e03-l01
- **john-p6-e03-q10** (relation) — Who helps John?
  - **(correta)** a) The shop assistant
  - b) Mary
  - c) Rick
  - Explicação: No diálogo — Shop assistant: “Certainly. What size would you like?”
  - Falas de referência: john-p6-e03-l02

#### Conteúdo das falas fora do inventário de itens

11 de 16 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: excuse, show, blue, please, certainly, like, medium, one, change, rooms, thank.

### Episode 4 — A different choice

**Id:** `john-p6-e04` · **Tipo:** episódio · **Ordem na parte:** 4 · **Título:** A different choice

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `06_Shopping_Clothes_and_Everyday_Services.md` a partir da linha 86 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p6-e04-l01 | Mary (`mary`) | How about this dark blue suit? | Que tal este terno azul-escuro? | a1de6de2 | bf_emma | 06_Shopping_Clothes_and_Everyday_Services.md:86 / 87 |
| 2 | john-p6-e04-l02 | John (`john`) | I like it, but the grey one is cheaper. | Gosto dele, mas o cinza é mais barato. | 7e03fe4e | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:89 / 90 |
| 3 | john-p6-e04-l03 | Mary (`mary`) | The blue one looks smarter, though. | O azul parece mais elegante, porém. | bbc9c209 | bf_emma | 06_Shopping_Clothes_and_Everyday_Services.md:92 / 93 |
| 4 | john-p6-e04-l04 | John (`john`) | You're right. I think I'll take it. | Você tem razão. Acho que vou levá-lo. | cfcf6e72 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:95 / 96 |
| 5 | john-p6-e04-l05 | Shop assistant (`role-shop-assistant`) | Would you like anything else? | Gostaria de mais alguma coisa? *(rótulo na tradução: Vendedor(a))* | 4173f4c5 | bf_alice | 06_Shopping_Clothes_and_Everyday_Services.md:98 / 99 |
| 6 | john-p6-e04-l06 | John (`john`) | No, thank you. Just the suit and the shirt. | Não, obrigado. Apenas o terno e a camisa. | 737f0a1a | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:101 / 102 |

#### Itens de vocabulário (3)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p6-e04-v01 | palavra | suit | = | terno | john-p6-e04-l01, john-p6-e04-l06 | 2e2f8980 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:109 |
| john-p6-e04-v02 | palavra | shirt | = | camisa | john-p6-e04-l06 | 43e36503 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:111 |
| john-p6-e04-v03 | palavra | cheaper | = | mais barato | john-p6-e04-l02 | 5c4cf4f7 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:121 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p6-e04-q01** (intention) — What does Mary suggest?
  - **(correta)** a) The dark blue suit
  - b) The grey suit
  - c) A jacket
  - Explicação: No diálogo — Mary: “How about this dark blue suit?”
  - Falas de referência: john-p6-e04-l01
- **john-p6-e04-q02** (explicit_fact) — Does John like the dark blue suit?
  - **(correta)** a) Yes, he does
  - b) No, he doesn't
  - c) He isn't sure
  - Explicação: No diálogo — John: “I like it, but the grey one is cheaper.”
  - Falas de referência: john-p6-e04-l02
- **john-p6-e04-q03** (explicit_fact) — Which suit is cheaper?
  - **(correta)** a) The grey one
  - b) The dark blue one
  - c) They cost the same
  - Explicação: No diálogo — John: “I like it, but the grey one is cheaper.”
  - Falas de referência: john-p6-e04-l02
- **john-p6-e04-q04** (explicit_fact) — What does Mary think of the blue suit?
  - **(correta)** a) It looks smarter
  - b) It's too expensive
  - c) It's too large
  - Explicação: No diálogo — Mary: “The blue one looks smarter, though.”
  - Falas de referência: john-p6-e04-l03
- **john-p6-e04-q05** (inference) — Which suit does John decide to take?
  - **(correta)** a) The dark blue one
  - b) The grey one
  - c) Neither of them
  - Explicação: No diálogo — Mary: “The blue one looks smarter, though.” / John: “You're right. I think I'll take it.”
  - Falas de referência: john-p6-e04-l03, john-p6-e04-l04
- **john-p6-e04-q06** (inference) — Why does John choose that suit?
  - **(correta)** a) Mary convinces him that it looks smarter
  - b) It's cheaper
  - c) It's the only one in his size
  - Explicação: No diálogo — Mary: “The blue one looks smarter, though.” / John: “You're right. I think I'll take it.”
  - Falas de referência: john-p6-e04-l03, john-p6-e04-l04
- **john-p6-e04-q07** (relation) — How does John respond to Mary's opinion?
  - **(correta)** a) He agrees — "You're right"
  - b) He disagrees
  - c) He asks the shop assistant
  - Explicação: No diálogo — John: “You're right. I think I'll take it.”
  - Falas de referência: john-p6-e04-l04
- **john-p6-e04-q08** (intention) — What does the shop assistant ask?
  - **(correta)** a) If John would like anything else
  - b) If John needs a smaller size
  - c) If John wants to pay by card
  - Explicação: No diálogo — Shop assistant: “Would you like anything else?”
  - Falas de referência: john-p6-e04-l05
- **john-p6-e04-q09** (explicit_fact) — What is John buying?
  - **(correta)** a) The suit and the shirt
  - b) Only the suit
  - c) The suit, the shirt and a tie
  - Explicação: No diálogo — John: “No, thank you. Just the suit and the shirt.”
  - Falas de referência: john-p6-e04-l06
- **john-p6-e04-q10** (inference) — Does John want anything else?
  - **(correta)** a) No
  - b) Yes, a tie
  - c) Yes, shoes
  - Explicação: No diálogo — John: “No, thank you. Just the suit and the shirt.”
  - Falas de referência: john-p6-e04-l06

#### Conteúdo das falas fora do inventário de itens

14 de 17 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: dark, blue, like, grey, one, looks, smarter, though, right, think, take, anything, else, thank.

### Episode 5 — Getting ready

**Id:** `john-p6-e05` · **Tipo:** episódio · **Ordem na parte:** 5 · **Título:** Getting ready

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `06_Shopping_Clothes_and_Everyday_Services.md` a partir da linha 128 · tradução: referência autoral — não validada pelo professor

#### Falas (5) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p6-e05-l01 | Rick (`rick`) | Have you got everything for the meeting? | Você tem tudo para a reunião? | 101328bf | bm_lewis | 06_Shopping_Clothes_and_Everyday_Services.md:128 / 129 |
| 2 | john-p6-e05-l02 | John (`john`) | Almost. I've bought a suit and a shirt. | Quase. Comprei um terno e uma camisa. | 63f947b4 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:131 / 132 |
| 3 | john-p6-e05-l03 | Rick (`rick`) | Have you tried them on? | Você os experimentou? | f7506220 | bm_lewis | 06_Shopping_Clothes_and_Everyday_Services.md:134 / 135 |
| 4 | john-p6-e05-l04 | John (`john`) | Yes. They fit perfectly. | Sim. Servem perfeitamente. | ef02c690 | bm_george | 06_Shopping_Clothes_and_Everyday_Services.md:137 / 138 |
| 5 | john-p6-e05-l05 | Rick (`rick`) | Great. You'll look very smart. | Ótimo. Você vai ficar muito elegante. | 27cd007e | bm_lewis | 06_Shopping_Clothes_and_Everyday_Services.md:140 / 141 |

#### Itens de vocabulário (4)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p6-e05-v01 | palavra | suit | = | terno | john-p6-e05-l02 | 2e2f8980 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:109 |
| john-p6-e05-v02 | palavra | shirt | = | camisa | john-p6-e05-l02 | 43e36503 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:111 |
| john-p6-e05-v03 | phrasal verb | try on | = | experimentar uma roupa | john-p6-e05-l03 | 6f3c33a3 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:117 |
| john-p6-e05-v04 | palavra | smart | = | elegante / arrumado | john-p6-e05-l05 | ae97e7d2 | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:120 |

#### Questões de compreensão (7)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p6-e05-q01** (intention) — What does Rick want to know?
  - **(correta)** a) If John has got everything for the meeting
  - b) Where the meeting is
  - c) When John bought the suit
  - Explicação: No diálogo — Rick: “Have you got everything for the meeting?”
  - Falas de referência: john-p6-e05-l01
- **john-p6-e05-q02** (explicit_fact) — Has John got everything for the meeting?
  - **(correta)** a) Almost
  - b) Yes, everything
  - c) Nothing yet
  - Explicação: No diálogo — John: “Almost. I've bought a suit and a shirt.”
  - Falas de referência: john-p6-e05-l02
- **john-p6-e05-q03** (explicit_fact) — What has John bought?
  - **(correta)** a) A suit and a shirt
  - b) A suit and shoes
  - c) Only a shirt
  - Explicação: No diálogo — John: “Almost. I've bought a suit and a shirt.”
  - Falas de referência: john-p6-e05-l02
- **john-p6-e05-q04** (explicit_fact) — Has John tried them on?
  - **(correta)** a) Yes, he has
  - b) No, not yet
  - c) Only the shirt
  - Explicação: No diálogo — Rick: “Have you tried them on?” / John: “Yes. They fit perfectly.”
  - Falas de referência: john-p6-e05-l03, john-p6-e05-l04
- **john-p6-e05-q05** (explicit_fact) — How do the clothes fit?
  - **(correta)** a) Perfectly
  - b) They're too large
  - c) They're too small
  - Explicação: No diálogo — John: “Yes. They fit perfectly.”
  - Falas de referência: john-p6-e05-l04
- **john-p6-e05-q06** (inference) — What does Rick think?
  - **(correta)** a) John will look very smart
  - b) John needs another suit
  - c) John will be late
  - Explicação: No diálogo — Rick: “Great. You'll look very smart.”
  - Falas de referência: john-p6-e05-l05
- **john-p6-e05-q07** (context) — What are the clothes for?
  - **(correta)** a) The meeting
  - b) A wedding
  - c) A trip
  - Explicação: No diálogo — Rick: “Have you got everything for the meeting?”
  - Falas de referência: john-p6-e05-l01

#### Conteúdo das falas fora do inventário de itens

11 de 14 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: got, everything, meeting, almost, bought, tried, fit, perfectly, great, you'll, look.

## Itens das tabelas da fonte sem atividade correspondente (17)

Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.

| Inglês (literal) | Tabela | Fonte |
|---|---|---|
| trousers | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:112 — “\| trousers \| calças \|” |
| shoes | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:113 — “\| shoes \| sapatos \|” |
| it suits you | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:122 — “\| it suits you \| combina com você \|” |
| Could you help me? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:182 — “\| Could you help me? \| Você poderia me ajudar? \|” |
| Could you help me, please? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:183 — “\| Could you help me, please? \| Você poderia me ajudar, por favor? \|” |
| Could you pass the salt? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:184 — “\| Could you pass the salt? \| Você poderia me passar o sal? \|” |
| Would you pass the salt? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:185 — “\| Would you pass the salt? \| Você me passaria o sal? \|” |
| Would you like a cup of tea? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:186 — “\| Would you like a cup of tea? \| Você gostaria de uma xícara de chá? \|” |
| Would you take my coat, please? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:187 — “\| Would you take my coat, please? \| Você poderia pegar meu casaco, por favor? \|” |
| ask a question | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:188 — “\| ask a question \| fazer uma pergunta \|” |
| change in here | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:189 — “\| change in here \| trocar de roupa aqui \|” |
| catch the ball | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:200 — “\| catch the ball \| pegar a bola \|” |
| catch the train | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:201 — “\| catch the train \| pegar o trem \|” |
| catch the next bus | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:202 — “\| catch the next bus \| pegar o próximo ônibus \|” |
| I didn't catch your name. | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:203 — “\| I didn't catch your name. \| Não entendi / não peguei seu nome. \|” |
| Do you catch my drift? | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:204 — “\| Do you catch my drift? \| Você entende o que quero dizer? \|” |
| catch a thief | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:205 — “\| catch a thief \| capturar/prender um ladrão \|” |

## Conteúdo da fonte que não está nos dados do app (literal)

Linhas de `06_Shopping_Clothes_and_Everyday_Services.md` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.

**Linhas 1–3:**

```markdown
# THE STORY OF JOHN
## Part 6 — Shopping, Clothes and Everyday Services
**Daily Routine English · British English**
```

**Linhas 104–104:**

```markdown
## Vocabulary — clothes and shopping
```

**Linhas 124–124:**

```markdown
**Phrasal verbs:** *try on* (experimentar roupa), *look for* (procurar).
```

**Linhas 143–178:**

```markdown
## Practice

### A. Match the expressions

1. try on
2. look for
3. over here
4. changing room
5. smaller size

a. provador  
b. experimentar roupa  
c. tamanho menor  
d. por aqui  
e. procurar

### B. Translate into English

1. Estou procurando um terno.
2. Posso experimentar esta camisa?
3. Você tem um tamanho menor?
4. Os provadores ficam aqui.
5. Essa cor combina com você.
6. Gostaria de mais alguma coisa?

### C. Role-play

At a clothes shop, ask for a suit, check the size, try it on, request another size and decide what to buy. Use at least three polite requests.

### Suggested answers

**A:** 1-b; 2-e; 3-d; 4-a; 5-c.

**B:** 1. I'm looking for a suit. 2. Could I try this shirt on? 3. Have you got a smaller size? 4. The changing rooms are over here. 5. That colour suits you. 6. Would you like anything else?

## Source coverage — requests, offers and shopping expressions
```

**Linhas 190–196:**

```markdown
| over here | aqui / por aqui |
| try on | experimentar (roupa) |
| look for | procurar |

**Could** costuma formular pedidos e possibilidades de modo educado; **would** aparece em pedidos, ofertas e preferências. A interpretação depende da estrutura: *Would you like...?* oferece algo; *Would you...?* pode formular um pedido.

### Additional meanings of catch
```

**Linhas 207–207:**

```markdown
**Note:** *catch* não significa apenas capturar; pode significar conseguir pegar um transporte ou entender algo que foi dito.
```

---

# The Story of John — Parte 7: Travelling and Unexpected Situations

**Pacote:** The Story of John (`the-story-of-john`, conteúdo `118297cacc48`, idioma en-GB) · **Parte:** `john-p7` · **Arquivo-fonte:** `dev/content/dialogues/source/the-story-of-john/07_Travelling_and_Unexpected_Situations.md`

**Origem do pacote (literal):** Material autoral do Daily Routine English (dev/content/dialogues/source/the-story-of-john). Traduções = referência autoral, não validadas pelo professor.

**Atividades:** 8 (7 episódios, 1 mini-diálogos) · **Falas:** 48 · **Itens:** 18 · **Questões:** 69

## Atividades

- [`john-p7-e01` — Planning the trip](#episode-1-planning-the-trip)
- [`john-p7-e02` — Finding the station](#episode-2-finding-the-station)
- [`john-p7-e03` — Checking the timetable](#episode-3-checking-the-timetable)
- [`john-p7-e04` — The delay](#episode-4-the-delay)
- [`john-p7-e05` — What can we do now?](#episode-5-what-can-we-do-now)
- [`john-p7-e06` — A different journey: booking a flight](#episode-6-a-different-journey-booking-a-flight)
- [`john-p7-e07` — At the airport](#episode-7-at-the-airport)
- [`john-p7-x01` — Additional travel expressions](#additional-travel-expressions)

## Conteúdo por atividade

### Episode 1 — Planning the trip

**Id:** `john-p7-e01` · **Tipo:** episódio · **Ordem na parte:** 1 · **Título:** Planning the trip

**Contexto (literal):** John needs to travel from Manchester to Edinburgh for a work meeting. Mary helps him plan the journey.

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 9 · tradução: referência autoral — não validada pelo professor

#### Falas (7) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-e01-l01 | Mary (`mary`) | Have you booked your train ticket yet? | Você já reservou sua passagem de trem? | 60751b12 | bf_emma | 07_Travelling_and_Unexpected_Situations.md:9 / 10 |
| 2 | john-p7-e01-l02 | John (`john`) | Not yet. I'm checking the times now. | Ainda não. Estou conferindo os horários agora. | c11afa05 | bm_george | 07_Travelling_and_Unexpected_Situations.md:12 / 13 |
| 3 | john-p7-e01-l03 | Mary (`mary`) | There are several trains in the morning. | Há vários trens pela manhã. | 786f0458 | bf_emma | 07_Travelling_and_Unexpected_Situations.md:15 / 16 |
| 4 | john-p7-e01-l04 | John (`john`) | I'd like to get there before eleven. | Gostaria de chegar lá antes das onze. | 5d33c638 | bm_george | 07_Travelling_and_Unexpected_Situations.md:18 / 19 |
| 5 | john-p7-e01-l05 | Mary (`mary`) | You could take the 8.20 train. | Você poderia pegar o trem das 8h20. | 33f9c463 | bf_emma | 07_Travelling_and_Unexpected_Situations.md:21 / 22 |
| 6 | john-p7-e01-l06 | John (`john`) | That would be ideal. How long does the journey take? | Seria ideal. Quanto tempo dura a viagem? | c50caa80 | bm_george | 07_Travelling_and_Unexpected_Situations.md:24 / 25 |
| 7 | john-p7-e01-l07 | Mary (`mary`) | About two and a half hours. | Cerca de duas horas e meia. | 74063276 | bf_emma | 07_Travelling_and_Unexpected_Situations.md:27 / 28 |

**Falas corrigidas (decisão do PO de 2026-11-11; o app usa o texto corrigido, a fonte continua com o original):**

- `john-p7-e01-l05` — original da fonte: “You could take the 8.40 train.” / “Você poderia pegar o trem das 8h40.”
  - motivo: Horário do trem para Edinburgh: p7-e03 (“It leaves at twenty past eight”) e p7-e04 (“The 8.20 service…”) usam 8.20; a sugestão de Mary passa a ser o mesmo trem.
  - motivo: Mesma correção na tradução.
- `john-p7-e01-l07` — original da fonte: “About three and a half hours.” / “Cerca de três horas e meia.”
  - motivo: John quer chegar antes das onze (p7-e01) e o trem das 9.05, que para em várias estações, chegaria por volta das 11h30 (p7-e05). Com 3h30 de viagem, nem o trem das 8.20 chegaria antes das onze; com cerca de 2h30 a sequência fica coerente (8.20 → ~10h50; 9.05 com paradas → ~11h30).
  - motivo: Mesma correção na tradução.

#### Itens de vocabulário (1)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p7-e01-v01 | chunk | get there | = | chegar lá | john-p7-e01-l04 | aeabb68d | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:191 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-e01-q01** (context) — Where does John need to travel to?
  - **(correta)** a) Edinburgh
  - b) Boston
  - c) London
  - Explicação: No diálogo — Contexto da cena: John needs to travel from Manchester to Edinburgh for a work meeting. Mary helps him plan the journey.
  - Falas de referência: —
- **john-p7-e01-q02** (context) — Why does John need to travel?
  - **(correta)** a) For a work meeting
  - b) For a holiday
  - c) To visit his family
  - Explicação: No diálogo — Contexto da cena: John needs to travel from Manchester to Edinburgh for a work meeting. Mary helps him plan the journey.
  - Falas de referência: —
- **john-p7-e01-q03** (explicit_fact) — Has John booked his train ticket?
  - **(correta)** a) Not yet
  - b) Yes, he has
  - c) He has booked a flight
  - Explicação: No diálogo — Mary: “Have you booked your train ticket yet?” / John: “Not yet. I'm checking the times now.”
  - Falas de referência: john-p7-e01-l01, john-p7-e01-l02
- **john-p7-e01-q04** (action) — What is John doing now?
  - **(correta)** a) Checking the times
  - b) Buying the ticket
  - c) Packing his suitcase
  - Explicação: No diálogo — John: “Not yet. I'm checking the times now.”
  - Falas de referência: john-p7-e01-l02
- **john-p7-e01-q05** (explicit_fact) — How many trains are there in the morning?
  - **(correta)** a) Several
  - b) Only one
  - c) None
  - Explicação: No diálogo — Mary: “There are several trains in the morning.”
  - Falas de referência: john-p7-e01-l03
- **john-p7-e01-q06** (explicit_fact) — When does John want to get there?
  - **(correta)** a) Before eleven
  - b) Before nine
  - c) In the afternoon
  - Explicação: No diálogo — John: “I'd like to get there before eleven.”
  - Falas de referência: john-p7-e01-l04
- **john-p7-e01-q07** (explicit_fact) — Which train does Mary suggest?
  - **(correta)** a) The 8.20 train
  - b) The 9.05 train
  - c) The 7.15 train
  - Explicação: No diálogo — Mary: “You could take the 8.20 train.”
  - Falas de referência: john-p7-e01-l05
- **john-p7-e01-q08** (inference) — What does John think of Mary's suggestion?
  - **(correta)** a) It would be ideal
  - b) It's too early
  - c) It's too late
  - Explicação: No diálogo — John: “That would be ideal. How long does the journey take?”
  - Falas de referência: john-p7-e01-l06
- **john-p7-e01-q09** (explicit_fact) — How long does the journey take?
  - **(correta)** a) About two and a half hours
  - b) About ten minutes
  - c) About one hour
  - Explicação: No diálogo — John: “That would be ideal. How long does the journey take?” / Mary: “About two and a half hours.”
  - Falas de referência: john-p7-e01-l06, john-p7-e01-l07
- **john-p7-e01-q10** (relation) — Who helps John plan the journey?
  - **(correta)** a) Mary
  - b) Rick
  - c) A travel agent
  - Explicação: No diálogo — Contexto da cena: John needs to travel from Manchester to Edinburgh for a work meeting. Mary helps him plan the journey.
  - Falas de referência: —

#### Conteúdo das falas fora do inventário de itens

23 de 24 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: booked, train, ticket, yet, checking, times, now, several, trains, morning, i'd, like, before, eleven, take, 8, 20, ideal, long, journey, two, half, hours.

### Episode 2 — Finding the station

**Id:** `john-p7-e02` · **Tipo:** episódio · **Ordem na parte:** 2 · **Título:** Finding the station

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 32 · tradução: referência autoral — não validada pelo professor

#### Falas (5) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-e02-l01 | John (`john`) | Excuse me. Could you tell me how to get to the railway station? | Com licença. Poderia me dizer como chegar à estação ferroviária? | bf7c60d9 | bm_george | 07_Travelling_and_Unexpected_Situations.md:32 / 33 |
| 2 | john-p7-e02-l02 | Passer-by (`role-passer-by`) | Certainly. Go straight on and turn left at the traffic lights. | Claro. Siga em frente e vire à esquerda no semáforo. *(rótulo na tradução: Transeunte)* | d3f455cd | bf_alice | 07_Travelling_and_Unexpected_Situations.md:35 / 36 |
| 3 | john-p7-e02-l03 | John (`john`) | Is it far from here? | Fica longe daqui? | 88782683 | bm_george | 07_Travelling_and_Unexpected_Situations.md:38 / 39 |
| 4 | john-p7-e02-l04 | Passer-by (`role-passer-by`) | No, it's about ten minutes on foot. | Não, fica a cerca de dez minutos a pé. *(rótulo na tradução: Transeunte)* | df45bde8 | bf_alice | 07_Travelling_and_Unexpected_Situations.md:41 / 42 |
| 5 | john-p7-e02-l05 | John (`john`) | Thank you very much. | Muito obrigado. | 1fb58e68 | bm_george | 07_Travelling_and_Unexpected_Situations.md:44 / 45 |

#### Itens de vocabulário (8)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p7-e02-v01 | chunk | railway station | = | estação ferroviária | john-p7-e02-l01 | b7a600f4 | Useful directions | 07_Travelling_and_Unexpected_Situations.md:51 |
| john-p7-e02-v02 | phrasal verb | go straight on | = | siga em frente | john-p7-e02-l02 | 7f5ca2bc | Useful directions | 07_Travelling_and_Unexpected_Situations.md:52 |
| john-p7-e02-v03 | expressão | turn left / right | turn left, right | vire à esquerda / direita | john-p7-e02-l02 | ab302afb | Useful directions | 07_Travelling_and_Unexpected_Situations.md:53 |
| john-p7-e02-v04 | chunk | traffic lights | = | semáforo | john-p7-e02-l02 | 77b436ff | Useful directions | 07_Travelling_and_Unexpected_Situations.md:54 |
| john-p7-e02-v05 | chunk | on foot | = | a pé | john-p7-e02-l04 | aa7a8694 | Useful directions | 07_Travelling_and_Unexpected_Situations.md:55 |
| john-p7-e02-v06 | palavra | nearby | = | nas proximidades | — (não aparece literalmente) | 035356aa | Useful directions | 07_Travelling_and_Unexpected_Situations.md:56 |
| john-p7-e02-v07 | expressão | How do I get to...? | How do I get to? | Como chego a...? | — (não aparece literalmente) | bc1216f3 | Useful directions | 07_Travelling_and_Unexpected_Situations.md:57 |
| john-p7-e02-v08 | palavra | leave | = | partir / sair / deixar | john-p7-e02-l02 | 5473c0c0 | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:190 |

#### Questões de compreensão (7)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-e02-q01** (intention) — What does John want to know?
  - **(correta)** a) How to get to the railway station
  - b) What time the train leaves
  - c) Where the bus stop is
  - Explicação: No diálogo — John: “Excuse me. Could you tell me how to get to the railway station?”
  - Falas de referência: john-p7-e02-l01
- **john-p7-e02-q02** (explicit_fact) — What is the first direction the passer-by gives?
  - **(correta)** a) Go straight on
  - b) Turn right
  - c) Take the bus
  - Explicação: No diálogo — Passer-by: “Certainly. Go straight on and turn left at the traffic lights.”
  - Falas de referência: john-p7-e02-l02
- **john-p7-e02-q03** (explicit_fact) — Where should John turn left?
  - **(correta)** a) At the traffic lights
  - b) At the bus stop
  - c) At the station
  - Explicação: No diálogo — Passer-by: “Certainly. Go straight on and turn left at the traffic lights.”
  - Falas de referência: john-p7-e02-l02
- **john-p7-e02-q04** (explicit_fact) — Is the station far from there?
  - **(correta)** a) No, it isn't
  - b) Yes, very far
  - c) The passer-by doesn't know
  - Explicação: No diálogo — John: “Is it far from here?” / Passer-by: “No, it's about ten minutes on foot.”
  - Falas de referência: john-p7-e02-l03, john-p7-e02-l04
- **john-p7-e02-q05** (explicit_fact) — How long does it take on foot?
  - **(correta)** a) About ten minutes
  - b) About an hour
  - c) About two minutes
  - Explicação: No diálogo — Passer-by: “No, it's about ten minutes on foot.”
  - Falas de referência: john-p7-e02-l04
- **john-p7-e02-q06** (relation) — Who helps John?
  - **(correta)** a) A passer-by
  - b) A station employee
  - c) Mary
  - Explicação: No diálogo — Passer-by: “Certainly. Go straight on and turn left at the traffic lights.”
  - Falas de referência: john-p7-e02-l02
- **john-p7-e02-q07** (inference) — How does John react to the help?
  - **(correta)** a) He thanks the passer-by
  - b) He complains
  - c) He asks again
  - Explicação: No diálogo — John: “Thank you very much.”
  - Falas de referência: john-p7-e02-l05

#### Conteúdo das falas fora do inventário de itens

8 de 18 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: excuse, tell, certainly, far, ten, minutes, thank, much.

### Episode 3 — Checking the timetable

**Id:** `john-p7-e03` · **Tipo:** episódio · **Ordem na parte:** 3 · **Título:** Checking the timetable

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 61 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-e03-l01 | John (`john`) | Where can I find the departure board? | Onde posso encontrar o painel de partidas? | d47ee35b | bm_george | 07_Travelling_and_Unexpected_Situations.md:61 / 62 |
| 2 | john-p7-e03-l02 | Station employee (`role-station-employee`) | It's just over there, next to platform three. | Fica logo ali, ao lado da plataforma três. *(rótulo na tradução: Funcionário)* | 0652e83c | bf_alice | 07_Travelling_and_Unexpected_Situations.md:64 / 65 |
| 3 | john-p7-e03-l03 | John (`john`) | Could you tell me which platform the Edinburgh train leaves from? | Poderia me dizer de qual plataforma sai o trem para Edimburgo? | f6d9cc87 | bm_george | 07_Travelling_and_Unexpected_Situations.md:67 / 68 |
| 4 | john-p7-e03-l04 | Station employee (`role-station-employee`) | Platform five. It leaves at twenty past eight. | Plataforma cinco. Ele parte às oito e vinte. *(rótulo na tradução: Funcionário)* | 65caf46d | bf_alice | 07_Travelling_and_Unexpected_Situations.md:70 / 71 |
| 5 | john-p7-e03-l05 | John (`john`) | Thank you. Is the train direct? | Obrigado. O trem é direto? | 98bbee6a | bm_george | 07_Travelling_and_Unexpected_Situations.md:73 / 74 |
| 6 | john-p7-e03-l06 | Station employee (`role-station-employee`) | Yes, it is. | Sim. *(rótulo na tradução: Funcionário)* | 67841f4e | bf_alice | 07_Travelling_and_Unexpected_Situations.md:76 / 77 |

#### Itens de vocabulário (3)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p7-e03-v01 | palavra | leave | = | partir / sair / deixar | john-p7-e03-l03, john-p7-e03-l04 | 5473c0c0 | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:190 |
| john-p7-e03-v02 | chunk | departure board | = | painel de partidas | john-p7-e03-l01 | 4df96ca3 | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:289 |
| john-p7-e03-v03 | palavra | platform | = | plataforma | john-p7-e03-l02, john-p7-e03-l03, john-p7-e03-l04 | 2a4a32b2 | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:290 |

#### Questões de compreensão (8)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-e03-q01** (intention) — What is John looking for?
  - **(correta)** a) The departure board
  - b) The ticket office
  - c) The information desk
  - Explicação: No diálogo — John: “Where can I find the departure board?”
  - Falas de referência: john-p7-e03-l01
- **john-p7-e03-q02** (explicit_fact) — Where is the departure board?
  - **(correta)** a) Next to platform three
  - b) Next to platform five
  - c) Outside the station
  - Explicação: No diálogo — Station employee: “It's just over there, next to platform three.”
  - Falas de referência: john-p7-e03-l02
- **john-p7-e03-q03** (intention) — What does John want to know?
  - **(correta)** a) Which platform the Edinburgh train leaves from
  - b) How much the ticket costs
  - c) If the train is late
  - Explicação: No diálogo — John: “Could you tell me which platform the Edinburgh train leaves from?”
  - Falas de referência: john-p7-e03-l03
- **john-p7-e03-q04** (explicit_fact) — Which platform does the train leave from?
  - **(correta)** a) Platform five
  - b) Platform three
  - c) Platform eight
  - Explicação: No diálogo — Station employee: “Platform five. It leaves at twenty past eight.”
  - Falas de referência: john-p7-e03-l04
- **john-p7-e03-q05** (explicit_fact) — What time does the train leave?
  - **(correta)** a) At twenty past eight
  - b) At ten past nine
  - c) At half past nine
  - Explicação: No diálogo — Station employee: “Platform five. It leaves at twenty past eight.”
  - Falas de referência: john-p7-e03-l04
- **john-p7-e03-q06** (explicit_fact) — Is the train direct?
  - **(correta)** a) Yes, it is
  - b) No, it stops at several stations
  - c) The employee doesn't know
  - Explicação: No diálogo — John: “Thank you. Is the train direct?” / Station employee: “Yes, it is.”
  - Falas de referência: john-p7-e03-l05, john-p7-e03-l06
- **john-p7-e03-q07** (relation) — Who helps John?
  - **(correta)** a) A station employee
  - b) A passer-by
  - c) Mary
  - Explicação: No diálogo — Station employee: “It's just over there, next to platform three.”
  - Falas de referência: john-p7-e03-l02
- **john-p7-e03-q08** (context) — Where is John?
  - **(correta)** a) At the railway station
  - b) At the airport
  - c) At a travel agency
  - Explicação: No diálogo — John: “Where can I find the departure board?”
  - Falas de referência: john-p7-e03-l01

#### Conteúdo das falas fora do inventário de itens

14 de 17 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: find, over, next, three, tell, edinburgh, train, leaves, five, twenty, past, eight, thank, direct.

### Episode 4 — The delay

**Id:** `john-p7-e04` · **Tipo:** episódio · **Ordem na parte:** 4 · **Título:** The delay

**Contexto (literal):** A message appears on the departure board.

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 83 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-e04-l01 | Announcement (`role-announcement`) | The 8.20 service to Edinburgh is delayed by ten minutes. We apologise for the inconvenience. | O serviço das 8h20 para Edimburgo está atrasado em dez minutos. Pedimos desculpas pelo transtorno. *(rótulo na tradução: Anúncio)* | c7bd3cd3 | bf_alice | 07_Travelling_and_Unexpected_Situations.md:83 / 84 |
| 2 | john-p7-e04-l02 | John (`john`) | Oh, no. Is it always late? | Ah, não. Ele está sempre atrasado? | 21e59acd | bm_george | 07_Travelling_and_Unexpected_Situations.md:86 / 87 |
| 3 | john-p7-e04-l03 | Mary (on the phone) (`mary`) | What's happened? | O que aconteceu? *(rótulo na tradução: Mary (ao telefone))* | 408fb877 | bf_emma | 07_Travelling_and_Unexpected_Situations.md:89 / 90 |
| 4 | john-p7-e04-l04 | John (`john`) | The train is delayed. They're saying it'll be another ten minutes. | O trem está atrasado. Estão dizendo que serão mais dez minutos. | 28f7b43c | bm_george | 07_Travelling_and_Unexpected_Situations.md:92 / 93 |
| 5 | john-p7-e04-l05 | Mary (`mary`) | That's inconvenient. Have you asked the staff? | Que inconveniente. Você perguntou aos funcionários? | d6698657 | bf_emma | 07_Travelling_and_Unexpected_Situations.md:95 / 96 |
| 6 | john-p7-e04-l06 | John (`john`) | Not yet. I'll speak to someone at the information desk. | Ainda não. Vou falar com alguém no balcão de informações. | 51fb4331 | bm_george | 07_Travelling_and_Unexpected_Situations.md:98 / 99 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Notas pedagógicas (1) — literal

### Language focus — delays and complaints
- *The train is delayed.* — O trem está atrasado.
- *There is a ten-minute delay.* — Há um atraso de dez minutos.
- *We apologise for the inconvenience.* — Pedimos desculpas pelo transtorno.
- *complain* (verb) — reclamar.
- *a complaint* (noun) — uma reclamação.
- *always late* — sempre atrasado.
- *never on time* — nunca pontual / nunca no horário.

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-e04-q01** (context) — How does John learn that the train is delayed?
  - **(correta)** a) From a message on the departure board
  - b) From Mary
  - c) From a passer-by
  - Explicação: No diálogo — Announcement: “The 8.20 service to Edinburgh is delayed by ten minutes. We apologise for the inconvenience.”
  - Falas de referência: john-p7-e04-l01
- **john-p7-e04-q02** (explicit_fact) — Which train is delayed?
  - **(correta)** a) The 8.20 service to Edinburgh
  - b) The 9.05 train
  - c) The flight to Boston
  - Explicação: No diálogo — Announcement: “The 8.20 service to Edinburgh is delayed by ten minutes. We apologise for the inconvenience.”
  - Falas de referência: john-p7-e04-l01
- **john-p7-e04-q03** (explicit_fact) — How long is the delay?
  - **(correta)** a) Ten minutes
  - b) Two hours
  - c) Half an hour
  - Explicação: No diálogo — Announcement: “The 8.20 service to Edinburgh is delayed by ten minutes. We apologise for the inconvenience.”
  - Falas de referência: john-p7-e04-l01
- **john-p7-e04-q04** (inference) — How does John feel when he hears about the delay?
  - **(correta)** a) Unhappy — "Oh, no"
  - b) Happy
  - c) Indifferent
  - Explicação: No diálogo — John: “Oh, no. Is it always late?”
  - Falas de referência: john-p7-e04-l02
- **john-p7-e04-q05** (intention) — What does John ask?
  - **(correta)** a) If the train is always late
  - b) Where the platform is
  - c) How much the ticket costs
  - Explicação: No diálogo — John: “Oh, no. Is it always late?”
  - Falas de referência: john-p7-e04-l02
- **john-p7-e04-q06** (relation) — Who is John talking to?
  - **(correta)** a) Mary, on the phone
  - b) A station employee
  - c) Rick
  - Explicação: No diálogo — Mary (on the phone): “What's happened?”
  - Falas de referência: john-p7-e04-l03
- **john-p7-e04-q07** (explicit_fact) — What does John tell Mary?
  - **(correta)** a) It'll be another ten minutes
  - b) The train is cancelled
  - c) He has missed the train
  - Explicação: No diálogo — John: “The train is delayed. They're saying it'll be another ten minutes.”
  - Falas de referência: john-p7-e04-l04
- **john-p7-e04-q08** (inference) — What does Mary think of the delay?
  - **(correta)** a) It's inconvenient
  - b) It's good news
  - c) It's not a problem
  - Explicação: No diálogo — Mary: “That's inconvenient. Have you asked the staff?”
  - Falas de referência: john-p7-e04-l05
- **john-p7-e04-q09** (intention) — What does Mary want to know?
  - **(correta)** a) If John has asked the staff
  - b) Where John is
  - c) What time the meeting is
  - Explicação: No diálogo — Mary: “That's inconvenient. Have you asked the staff?”
  - Falas de referência: john-p7-e04-l05
- **john-p7-e04-q10** (action) — What will John do?
  - **(correta)** a) Speak to someone at the information desk
  - b) Take a taxi
  - c) Go home
  - Explicação: No diálogo — John: “Not yet. I'll speak to someone at the information desk.”
  - Falas de referência: john-p7-e04-l06

#### Conteúdo das falas fora do inventário de itens

25 de 25 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: 8, 20, service, edinburgh, delayed, ten, minutes, apologise, inconvenience, always, late, what's, happened, train, saying, it'll, another, inconvenient, asked, staff, yet, speak, someone, information, desk.

### Episode 5 — What can we do now?

**Id:** `john-p7-e05` · **Tipo:** episódio · **Ordem na parte:** 5 · **Título:** What can we do now?

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 113 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-e05-l01 | John (`john`) | Excuse me. Is there another train to Edinburgh? | Com licença. Há outro trem para Edimburgo? | fbcfd862 | bm_george | 07_Travelling_and_Unexpected_Situations.md:113 / 114 |
| 2 | john-p7-e05-l02 | Station employee (`role-station-employee`) | There's one at 9.05, but it stops at several stations. | Há um às 9h05, mas ele para em várias estações. *(rótulo na tradução: Funcionário)* | 3e8a6610 | bf_alice | 07_Travelling_and_Unexpected_Situations.md:116 / 117 |
| 3 | john-p7-e05-l03 | John (`john`) | Would I still arrive before eleven? | Mesmo assim eu chegaria antes das onze? | cde57a18 | bm_george | 07_Travelling_and_Unexpected_Situations.md:119 / 120 |
| 4 | john-p7-e05-l04 | Station employee (`role-station-employee`) | I'm afraid not. You'd arrive at about half past eleven. | Infelizmente, não. Você chegaria por volta das onze e meia. *(rótulo na tradução: Funcionário)* | 8ad84a1e | bf_alice | 07_Travelling_and_Unexpected_Situations.md:122 / 123 |
| 5 | john-p7-e05-l05 | John (`john`) | I see. I'll wait for the direct service, then. | Entendi. Então vou esperar pelo serviço direto. | 51e75cbe | bm_george | 07_Travelling_and_Unexpected_Situations.md:125 / 126 |
| 6 | john-p7-e05-l06 | Station employee (`role-station-employee`) | It should be here shortly. | Ele deve chegar em breve. *(rótulo na tradução: Funcionário)* | 99451bf0 | bf_alice | 07_Travelling_and_Unexpected_Situations.md:128 / 129 |

#### Itens de vocabulário (1)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p7-e05-v01 | chunk | direct service | = | serviço direto | john-p7-e05-l05 | 57702d47 | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:291 |

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-e05-q01** (intention) — What does John want to know?
  - **(correta)** a) If there is another train to Edinburgh
  - b) Where the information desk is
  - c) How much a ticket costs
  - Explicação: No diálogo — John: “Excuse me. Is there another train to Edinburgh?”
  - Falas de referência: john-p7-e05-l01
- **john-p7-e05-q02** (explicit_fact) — What time is the other train?
  - **(correta)** a) At 9.05
  - b) At 8.20
  - c) At 8.40
  - Explicação: No diálogo — Station employee: “There's one at 9.05, but it stops at several stations.”
  - Falas de referência: john-p7-e05-l02
- **john-p7-e05-q03** (explicit_fact) — What is the problem with the other train?
  - **(correta)** a) It stops at several stations
  - b) It is very expensive
  - c) It is cancelled
  - Explicação: No diálogo — Station employee: “There's one at 9.05, but it stops at several stations.”
  - Falas de referência: john-p7-e05-l02
- **john-p7-e05-q04** (intention) — What is John worried about?
  - **(correta)** a) Arriving before eleven
  - b) Finding the platform
  - c) Buying a ticket
  - Explicação: No diálogo — John: “Would I still arrive before eleven?”
  - Falas de referência: john-p7-e05-l03
- **john-p7-e05-q05** (explicit_fact) — Would John arrive before eleven on the other train?
  - **(correta)** a) No, he wouldn't
  - b) Yes, he would
  - c) The employee doesn't know
  - Explicação: No diálogo — Station employee: “I'm afraid not. You'd arrive at about half past eleven.”
  - Falas de referência: john-p7-e05-l04
- **john-p7-e05-q06** (explicit_fact) — When would he arrive on the other train?
  - **(correta)** a) At about half past eleven
  - b) At about eleven
  - c) At about ten
  - Explicação: No diálogo — Station employee: “I'm afraid not. You'd arrive at about half past eleven.”
  - Falas de referência: john-p7-e05-l04
- **john-p7-e05-q07** (action) — What does John decide to do?
  - **(correta)** a) Wait for the direct service
  - b) Take the 9.05 train
  - c) Go home
  - Explicação: No diálogo — John: “I see. I'll wait for the direct service, then.”
  - Falas de referência: john-p7-e05-l05
- **john-p7-e05-q08** (inference) — Why does John decide to wait?
  - **(correta)** a) The other train would arrive too late
  - b) The other train is cheaper
  - c) Mary told him to wait
  - Explicação: No diálogo — Station employee: “I'm afraid not. You'd arrive at about half past eleven.” / John: “I see. I'll wait for the direct service, then.”
  - Falas de referência: john-p7-e05-l04, john-p7-e05-l05
- **john-p7-e05-q09** (explicit_fact) — When should the direct train arrive?
  - **(correta)** a) Shortly
  - b) In two hours
  - c) Tomorrow
  - Explicação: No diálogo — Station employee: “It should be here shortly.”
  - Falas de referência: john-p7-e05-l06
- **john-p7-e05-q10** (relation) — Who gives John the information?
  - **(correta)** a) A station employee
  - b) Mary
  - c) A passenger
  - Explicação: No diálogo — Station employee: “There's one at 9.05, but it stops at several stations.”
  - Falas de referência: john-p7-e05-l02

#### Conteúdo das falas fora do inventário de itens

23 de 25 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: excuse, another, train, edinburgh, one, 9, 05, stops, several, stations, still, arrive, before, eleven, afraid, you'd, half, past, see, wait, then, should, shortly.

### Episode 6 — A different journey: booking a flight

**Id:** `john-p7-e06` · **Tipo:** episódio · **Ordem na parte:** 6 · **Título:** A different journey: booking a flight

**Contexto (literal):** Some weeks later, John needs to travel abroad. He calls a travel agency.

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 135 · tradução: referência autoral — não validada pelo professor

#### Falas (8) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-e06-l01 | Travel agent (`role-travel-agent`) | Good morning. How can I help you? | Bom dia. Como posso ajudar? *(rótulo na tradução: Agente de viagens)* | 687c5cbd | bf_alice | 07_Travelling_and_Unexpected_Situations.md:135 / 136 |
| 2 | john-p7-e06-l02 | John (`john`) | I'd like to book a flight to Boston, please. | Gostaria de reservar um voo para Boston, por favor. | 689cb7e6 | bm_george | 07_Travelling_and_Unexpected_Situations.md:138 / 139 |
| 3 | john-p7-e06-l03 | Travel agent (`role-travel-agent`) | Certainly. When would you like to travel? | Certamente. Quando gostaria de viajar? *(rótulo na tradução: Agente de viagens)* | 2edf1c92 | bf_alice | 07_Travelling_and_Unexpected_Situations.md:141 / 142 |
| 4 | john-p7-e06-l04 | John (`john`) | Next Thursday, if possible. Have you got any early flights? | Na próxima quinta-feira, se possível. Vocês têm voos cedo? | 07ef1447 | bm_george | 07_Travelling_and_Unexpected_Situations.md:144 / 145 |
| 5 | john-p7-e06-l05 | Travel agent (`role-travel-agent`) | We have a flight at around nine o'clock. There are also several charter flights later in the day. | Temos um voo por volta das nove horas. Também há vários voos charter mais tarde. *(rótulo na tradução: Agente de viagens)* | b7372e84 | bf_alice | 07_Travelling_and_Unexpected_Situations.md:147 / 148 |
| 6 | john-p7-e06-l06 | John (`john`) | The early flight would suit me better. | O voo mais cedo seria melhor para mim. | 88cdf1d2 | bm_george | 07_Travelling_and_Unexpected_Situations.md:150 / 151 |
| 7 | john-p7-e06-l07 | Travel agent (`role-travel-agent`) | Would you like me to book it? | Gostaria que eu o reservasse? *(rótulo na tradução: Agente de viagens)* | f8a06e5b | bf_alice | 07_Travelling_and_Unexpected_Situations.md:153 / 154 |
| 8 | john-p7-e06-l08 | John (`john`) | Yes, please. | Sim, por favor. | 8e6afd31 | bm_george | 07_Travelling_and_Unexpected_Situations.md:156 / 157 |

#### Itens de vocabulário (0)

*Nenhum item curado nos documentos para esta atividade.*

#### Questões de compreensão (10)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-e06-q01** (context) — Who does John call?
  - **(correta)** a) A travel agency
  - b) The railway station
  - c) Mary
  - Explicação: No diálogo — Contexto da cena: Some weeks later, John needs to travel abroad. He calls a travel agency.
  - Falas de referência: —
- **john-p7-e06-q02** (intention) — What does John want to do?
  - **(correta)** a) Book a flight
  - b) Book a train ticket
  - c) Book a hotel
  - Explicação: No diálogo — John: “I'd like to book a flight to Boston, please.”
  - Falas de referência: john-p7-e06-l02
- **john-p7-e06-q03** (explicit_fact) — Where does John want to fly to?
  - **(correta)** a) Boston
  - b) Edinburgh
  - c) Manchester
  - Explicação: No diálogo — John: “I'd like to book a flight to Boston, please.”
  - Falas de referência: john-p7-e06-l02
- **john-p7-e06-q04** (explicit_fact) — When does John want to travel?
  - **(correta)** a) Next Thursday
  - b) Next Saturday
  - c) Tomorrow
  - Explicação: No diálogo — John: “Next Thursday, if possible. Have you got any early flights?”
  - Falas de referência: john-p7-e06-l04
- **john-p7-e06-q05** (intention) — What kind of flight does John ask about?
  - **(correta)** a) An early flight
  - b) A charter flight
  - c) A night flight
  - Explicação: No diálogo — John: “Next Thursday, if possible. Have you got any early flights?”
  - Falas de referência: john-p7-e06-l04
- **john-p7-e06-q06** (explicit_fact) — What time is the early flight?
  - **(correta)** a) At around nine o'clock
  - b) At around eleven
  - c) At around seven
  - Explicação: No diálogo — Travel agent: “We have a flight at around nine o'clock. There are also several charter flights later in the day.”
  - Falas de referência: john-p7-e06-l05
- **john-p7-e06-q07** (explicit_fact) — What other flights are there?
  - **(correta)** a) Several charter flights later in the day
  - b) One flight early in the morning
  - c) No other flights
  - Explicação: No diálogo — Travel agent: “We have a flight at around nine o'clock. There are also several charter flights later in the day.”
  - Falas de referência: john-p7-e06-l05
- **john-p7-e06-q08** (inference) — Which flight does John prefer?
  - **(correta)** a) The early flight
  - b) A charter flight
  - c) He doesn't choose
  - Explicação: No diálogo — John: “The early flight would suit me better.”
  - Falas de referência: john-p7-e06-l06
- **john-p7-e06-q09** (intention) — What does the travel agent offer?
  - **(correta)** a) To book the flight
  - b) To change the date
  - c) To find a hotel
  - Explicação: No diálogo — Travel agent: “Would you like me to book it?”
  - Falas de referência: john-p7-e06-l07
- **john-p7-e06-q10** (inference) — Does John accept the offer?
  - **(correta)** a) Yes, he does
  - b) No, he doesn't
  - c) He'll call back later
  - Explicação: No diálogo — John: “Yes, please.”
  - Falas de referência: john-p7-e06-l08

#### Conteúdo das falas fora do inventário de itens

28 de 28 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: good, morning, help, i'd, like, book, flight, boston, please, certainly, travel, next, thursday, possible, got, any, early, flights, around, nine, o'clock, also, several, charter, later, day, suit, better.

### Episode 7 — At the airport

**Id:** `john-p7-e07` · **Tipo:** episódio · **Ordem na parte:** 7 · **Título:** At the airport

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 161 · tradução: referência autoral — não validada pelo professor

#### Falas (6) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-e07-l01 | Mary (`mary`) | Have you checked in online? | Você fez o check-in on-line? | bcaf0b5c | bf_emma | 07_Travelling_and_Unexpected_Situations.md:161 / 162 |
| 2 | john-p7-e07-l02 | John (`john`) | Yes. I only need to drop off my suitcase. | Sim. Só preciso despachar minha mala. | accc00d0 | bm_george | 07_Travelling_and_Unexpected_Situations.md:164 / 165 |
| 3 | john-p7-e07-l03 | Mary (`mary`) | What time do you board? | A que horas você embarca? | 417c471f | bf_emma | 07_Travelling_and_Unexpected_Situations.md:167 / 168 |
| 4 | john-p7-e07-l04 | John (`john`) | At eight twenty. I should get to the gate by eight. | Às oito e vinte. Devo chegar ao portão de embarque até as oito. | fcd99446 | bm_george | 07_Travelling_and_Unexpected_Situations.md:170 / 171 |
| 5 | john-p7-e07-l05 | Mary (`mary`) | Don't forget to pick up your passport. | Não se esqueça de pegar seu passaporte. | 432f9c88 | bf_emma | 07_Travelling_and_Unexpected_Situations.md:173 / 174 |
| 6 | john-p7-e07-l06 | John (`john`) | It's in my bag. Thanks for reminding me. | Está na minha bolsa. Obrigado por me lembrar. | e6b85601 | bm_george | 07_Travelling_and_Unexpected_Situations.md:176 / 177 |

#### Itens de vocabulário (2)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p7-e07-v01 | phrasal verb | pick up | = | buscar / pegar | john-p7-e07-l05 | b9d08f15 | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:187 |
| john-p7-e07-v02 | phrasal verb | check in | = | fazer check-in | john-p7-e07-l01 | 0fea38fe | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:188 |

#### Questões de compreensão (8)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-e07-q01** (explicit_fact) — Has John checked in online?
  - **(correta)** a) Yes, he has
  - b) No, not yet
  - c) He can't check in online
  - Explicação: No diálogo — Mary: “Have you checked in online?” / John: “Yes. I only need to drop off my suitcase.”
  - Falas de referência: john-p7-e07-l01, john-p7-e07-l02
- **john-p7-e07-q02** (action) — What does John still need to do?
  - **(correta)** a) Drop off his suitcase
  - b) Buy a ticket
  - c) Check in at the desk
  - Explicação: No diálogo — John: “Yes. I only need to drop off my suitcase.”
  - Falas de referência: john-p7-e07-l02
- **john-p7-e07-q03** (explicit_fact) — What time does John board?
  - **(correta)** a) At eight twenty
  - b) At eight
  - c) At nine
  - Explicação: No diálogo — John: “At eight twenty. I should get to the gate by eight.”
  - Falas de referência: john-p7-e07-l04
- **john-p7-e07-q04** (explicit_fact) — By what time should John get to the gate?
  - **(correta)** a) By eight
  - b) By eight twenty
  - c) By nine
  - Explicação: No diálogo — John: “At eight twenty. I should get to the gate by eight.”
  - Falas de referência: john-p7-e07-l04
- **john-p7-e07-q05** (intention) — What does Mary remind John to do?
  - **(correta)** a) Pick up his passport
  - b) Buy a ticket
  - c) Call her later
  - Explicação: No diálogo — Mary: “Don't forget to pick up your passport.”
  - Falas de referência: john-p7-e07-l05
- **john-p7-e07-q06** (explicit_fact) — Where is John's passport?
  - **(correta)** a) In his bag
  - b) At home
  - c) In his suitcase
  - Explicação: No diálogo — John: “It's in my bag. Thanks for reminding me.”
  - Falas de referência: john-p7-e07-l06
- **john-p7-e07-q07** (inference) — How does John react to Mary's reminder?
  - **(correta)** a) He thanks her
  - b) He gets angry
  - c) He goes back home
  - Explicação: No diálogo — John: “It's in my bag. Thanks for reminding me.”
  - Falas de referência: john-p7-e07-l06
- **john-p7-e07-q08** (context) — Where is John probably going?
  - **(correta)** a) To the airport, to take a flight
  - b) To the railway station
  - c) To the office
  - Explicação: No diálogo — Mary: “Have you checked in online?”
  - Falas de referência: john-p7-e07-l01

#### Conteúdo das falas fora do inventário de itens

19 de 20 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: checked, online, only, need, drop, off, suitcase, time, board, eight, twenty, should, get, gate, forget, passport, bag, thanks, reminding.

### Additional travel expressions

**Id:** `john-p7-x01` · **Tipo:** mini-diálogo (seção complementar) · **Ordem na parte:** 8 · **Título:** Additional travel expressions

**Contexto (literal):** —

**Origem:** autoral (The Story of John) · arquivo `07_Travelling_and_Unexpected_Situations.md` a partir da linha 264 · tradução: referência autoral — não validada pelo professor

#### Falas (4) — ordem original

| # | Id | Personagem | Inglês (usado no app) | Português (usado no app) | Áudio | Voz | Fonte (EN / PT) |
|---|---|---|---|---|---|---|---|
| 1 | john-p7-x01-l01 | John (`john`) | Could you tell me how much further it is to the station? | Você poderia me dizer quanto falta até a estação? | a9811e62 | bm_george | 07_Travelling_and_Unexpected_Situations.md:264 / 265 |
| 2 | john-p7-x01-l02 | Passenger (`role-passenger`) | It isn't much further. Keep walking until you see the bus stop. | Não falta muito. Continue andando até ver o ponto de ônibus. *(rótulo na tradução: Passageiro)* | 292d6e8e | bf_alice | 07_Travelling_and_Unexpected_Situations.md:267 / 268 |
| 3 | john-p7-x01-l03 | John (`john`) | I'd like to make a complaint about the service. The train is two hours late. | Gostaria de fazer uma reclamação sobre o serviço. O trem está duas horas atrasado. | b36f424f | bm_george | 07_Travelling_and_Unexpected_Situations.md:270 / 271 |
| 4 | john-p7-x01-l04 | Staff member (`role-staff-member`) | I'm sorry. I'll check the timetable and explain the delay. | Sinto muito. Vou consultar os horários e explicar o atraso. *(rótulo na tradução: Funcionário)* | ad0244fa | bf_alice | 07_Travelling_and_Unexpected_Situations.md:273 / 274 |

#### Itens de vocabulário (3)

| Id | Classificação | Inglês (literal) | Forma falada | Português (literal) | Falas relacionadas | Áudio | Tabela da fonte | Fonte |
|---|---|---|---|---|---|---|---|---|
| john-p7-x01-v01 | expressão | get on a train / bus | get on a train, bus | entrar / embarcar num trem ou ônibus | john-p7-x01-l02 | 4032b1b5 | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:183 |
| john-p7-x01-v02 | expressão | get off a train / bus | get off a train, bus | descer de um trem ou ônibus | john-p7-x01-l02 | b65ec06b | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:184 |
| john-p7-x01-v03 | chunk | make a complaint | = | fazer uma reclamação | john-p7-x01-l03 | b567587d | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:258 |

#### Questões de compreensão (6)

Status de origem: gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

- **john-p7-x01-q01** (intention) — What does John want to know first?
  - **(correta)** a) How much further it is to the station
  - b) What time the bus leaves
  - c) Where the hotel is
  - Explicação: No diálogo — John: “Could you tell me how much further it is to the station?”
  - Falas de referência: john-p7-x01-l01
- **john-p7-x01-q02** (explicit_fact) — Is the station much further?
  - **(correta)** a) No, it isn't
  - b) Yes, it's very far
  - c) The passenger doesn't know
  - Explicação: No diálogo — Passenger: “It isn't much further. Keep walking until you see the bus stop.”
  - Falas de referência: john-p7-x01-l02
- **john-p7-x01-q03** (action) — What should John do?
  - **(correta)** a) Keep walking until he sees the bus stop
  - b) Take a taxi
  - c) Turn back
  - Explicação: No diálogo — Passenger: “It isn't much further. Keep walking until you see the bus stop.”
  - Falas de referência: john-p7-x01-l02
- **john-p7-x01-q04** (intention) — What does John want to make?
  - **(correta)** a) A complaint about the service
  - b) A reservation
  - c) A phone call
  - Explicação: No diálogo — John: “I'd like to make a complaint about the service. The train is two hours late.”
  - Falas de referência: john-p7-x01-l03
- **john-p7-x01-q05** (explicit_fact) — How late is the train?
  - **(correta)** a) Two hours
  - b) Ten minutes
  - c) Half an hour
  - Explicação: No diálogo — John: “I'd like to make a complaint about the service. The train is two hours late.”
  - Falas de referência: john-p7-x01-l03
- **john-p7-x01-q06** (action) — What will the staff member do?
  - **(correta)** a) Check the timetable and explain the delay
  - b) Give John a new ticket
  - c) Call a taxi
  - Explicação: No diálogo — Staff member: “I'm sorry. I'll check the timetable and explain the delay.”
  - Falas de referência: john-p7-x01-l04

#### Conteúdo das falas fora do inventário de itens

20 de 24 palavras de conteúdo das falas (sem palavras funcionais) não aparecem em nenhum item desta atividade: tell, much, further, station, keep, walking, until, see, stop, i'd, like, service, two, hours, late, sorry, check, timetable, explain, delay.

## Itens das tabelas da fonte sem atividade correspondente (25)

Constam nas tabelas do documento-fonte, mas a conversão não os ligou a nenhuma atividade (não estão no app). Literal, com a linha da fonte.

| Inglês (literal) | Tabela | Fonte |
|---|---|---|
| get in a car / taxi | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:185 — “\| get in a car / taxi \| entrar num carro / táxi \|” |
| get out of a car | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:186 — “\| get out of a car \| sair de um carro \|” |
| go into | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:189 — “\| go into \| entrar em \|” |
| set off | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:192 — “\| set off \| partir / iniciar uma viagem \|” |
| look for | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:193 — “\| look for \| procurar \|” |
| hold on | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:194 — “\| hold on \| aguardar \|” |
| check the train timetable | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:249 — “\| check the train timetable \| consultar o horário dos trens \|” |
| a two-hour delay | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:250 — “\| a two-hour delay \| um atraso de duas horas \|” |
| a delay in replying | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:251 — “\| a delay in replying \| demora para responder \|” |
| delay the construction | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:252 — “\| delay the construction \| atrasar a construção \|” |
| delay the meeting until tomorrow | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:253 — “\| delay the meeting until tomorrow \| adiar a reunião para amanhã \|” |
| How much further is the station? | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:254 — “\| How much further is the station? \| Quanto falta até a estação? \|” |
| walk a bit further | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:255 — “\| walk a bit further \| caminhar um pouco mais \|” |
| further questions | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:256 — “\| further questions \| perguntas adicionais \|” |
| discuss this further | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:257 — “\| discuss this further \| discutir isso mais a fundo \|” |
| customer complaints | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:259 — “\| customer complaints \| reclamações de clientes \|” |
| complain about the delay | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:260 — “\| complain about the delay \| reclamar do atraso \|” |
| catch the train | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:280 — “\| catch the train \| pegar o trem \|” |
| miss the bus | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:281 — “\| miss the bus \| perder o ônibus \|” |
| catch the next one | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:282 — “\| catch the next one \| pegar o próximo \|” |
| get on / get off | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:283 — “\| get on / get off \| embarcar / desembarcar \|” |
| get in / get out of | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:284 — “\| get in / get out of \| entrar / sair de carro ou táxi \|” |
| set off | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:285 — “\| set off \| partir / iniciar a viagem \|” |
| pick someone up | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:286 — “\| pick someone up \| buscar alguém \|” |
| drop someone off | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:287 — “\| drop someone off \| deixar alguém em um local \|” |

## Conteúdo da fonte que não está nos dados do app (literal)

Linhas de `07_Travelling_and_Unexpected_Situations.md` que não correspondem a falas, traduções, itens, contextos ou notas já listados acima — exercícios, respostas sugeridas, elenco, seções complementares, tabelas e cabeçalhos. Reproduzidas sem alteração, com o número da linha.

**Linhas 1–3:**

```markdown
# THE STORY OF JOHN
## Part 7 — Travelling and Unexpected Situations
**Daily Routine English · British English**
```

**Linhas 47–47:**

```markdown
### Useful directions
```

**Linhas 179–179:**

```markdown
## Phrasal verbs and travel chunks
```

**Linhas 196–245:**

```markdown
**Atenção ao meio de transporte:**
- *get on* é usado normalmente com ônibus, trem e avião.
- *get in* é usado normalmente com carro e táxi.
- *get off* é descer de ônibus, trem ou avião.
- *get out of* é sair de carro ou táxi.

## Practice

### A. Comprehension

1. Where is John travelling from and to?
2. What time does the original train leave?
3. How long is the train delayed?
4. Which alternative train is available?
5. Where does John want to fly later?
6. What does he need to do at the airport?

### B. Choose the correct phrasal verb

1. You get (on / in) a train.
2. You get (off / out of) a bus.
3. You get (in / on) a taxi.
4. You get (out of / off) a car.
5. You (check in / pick up) at the airport before boarding.

### C. Translate into English

1. O trem para Edimburgo está atrasado.
2. Pedimos desculpas pelo transtorno.
3. Há outro trem às nove e cinco?
4. Gostaria de reservar um voo para Boston.
5. O voo mais cedo seria melhor para mim.
6. Você já fez o check-in?
7. Não se esqueça de pegar seu passaporte.

### D. Role-play

Student A is a passenger whose train is delayed. Student B works at the information desk. Ask about the delay, request another option, compare arrival times and decide what to do.

### Suggested answers

**A:** 1. From Manchester to Edinburgh. 2. At 8.20. 3. Ten minutes. 4. The 9.05 train. 5. Boston. 6. Drop off his suitcase and go to the gate.

**B:** 1. on; 2. off; 3. in; 4. out of; 5. check in.

**C:** 1. The train to Edinburgh is delayed. 2. We apologise for the inconvenience. 3. Is there another train at 9.05? 4. I'd like to book a flight to Boston. 5. The early flight would suit me better. 6. Have you checked in? 7. Don't forget to pick up your passport.

## Source coverage — timetables, delays, complaints and directions

### Timetable and delay language
```

**Linhas 276–276:**

```markdown
### Additional movement and transport chunks
```

**Linhas 288–288:**

```markdown
| check in | fazer check-in |
```

**Linhas 293–293:**

```markdown
**BrE usage note:** *railway station*, *the line is engaged*, *half five*, *timetable* e *holiday* são escolhas britânicas naturais. Para horários, *half five* significa 5h30 (não 4h30).
```

---

# Anexo A — The Story of John — inventário de itens por classificação

Itens do app (`data/dialogues.js` → `items`), agrupados pela classificação original (`type`), sem fundir categorias. Itens das tabelas da fonte sem atividade (não integrados ao app) no fim.

## chunk (`chunk`) — 89

| Id | Inglês | Português | Atividade | Falas relacionadas | Áudio |
|---|---|---|---|---|---|
| john-p1-e01-v01 | these days | atualmente / hoje em dia | john-p1-e01 | john-p1-e01-l03 | 8e416243 |
| john-p1-e01-v03 | project analyst | analista de projetos | john-p1-e01 | john-p1-e01-l06 | 720af6ec |
| john-p1-e01-v04 | sales department | departamento de vendas | john-p1-e01 | john-p1-e01-l06 | 756cfa37 |
| john-p1-e01-v05 | different teams | equipes diferentes | john-p1-e01 | john-p1-e01-l06 | 6e9d8df4 |
| john-p1-e01-v06 | this week | esta semana | john-p1-e01 | john-p1-e01-l06 | 310eb6d3 |
| john-p1-e02-v02 | local newspaper | jornal local | john-p1-e02 | john-p1-e02-l03 | 6f4e36db |
| john-p1-e02-v03 | sports photographer | fotógrafo esportivo | john-p1-e02 | john-p1-e02-l05 | 9f0fd189 |
| john-p1-e02-v04 | cover a match | fazer a cobertura de uma partida | john-p1-e02 | — | b8418f72 |
| john-p1-e02-v05 | football match | partida de futebol | john-p1-e02 | john-p1-e02-l05 | 43b8afd9 |
| john-p1-e02-v06 | software engineer | engenheiro(a) de software | john-p1-e02 | john-p1-e02-l06 | 0b8765b5 |
| john-p1-e02-v07 | solve a problem | resolver um problema | john-p1-e02 | — | e7defb78 |
| john-p1-e02-v08 | be good at | ser bom em | john-p1-e02 | — | 2bcffeca |
| john-p1-e04-v02 | sister / uncle | irmã / tio | john-p1-e04 | john-p1-e04-l02, john-p1-e04-l05 | e8f81c20 |
| john-p1-e04-v03 | next to | ao lado de | john-p1-e04 | john-p1-e04-l04 | fee13031 |
| john-p1-e04-v05 | go swimming | ir nadar | john-p1-e04 | john-p1-e04-l07 | d102b5cc |
| john-p1-e04-v06 | play squash | jogar squash | john-p1-e04 | john-p1-e04-l08 | 0664beb0 |
| john-p1-e04-v07 | every Saturday morning | todo sábado de manhã | john-p1-e04 | john-p1-e04-l08 | 9d6f4333 |
| john-p1-e06-v01 | organise events | organizar eventos | john-p1-e06 | john-p1-e06-l01 | a030fa5e |
| john-p1-e06-v04 | as well | também | john-p1-e06 | john-p1-e06-l06 | 5f4253bf |
| john-p1-e08-v02 | bus driver | motorista de ônibus | john-p1-e08 | — | 580d2c59 |
| john-p1-e08-v03 | computer programmer | programador(a) de computador | john-p1-e08 | — | 2cd86698 |
| john-p1-e08-v04 | French teacher | professor(a) de francês | john-p1-e08 | — | f02e91db |
| john-p1-e08-v09 | sports photographer | fotógrafo(a) esportivo(a) | john-p1-e08 | — | 9f0fd189 |
| john-p1-e08-v10 | fix a light | consertar uma luminária / reparar uma luz | john-p1-e08 | john-p1-e08-l02 | 19bf3b1b |
| john-p1-e08-v11 | make a watch | fabricar/consertar um relógio, conforme o contexto | john-p1-e08 | — | 6e95d42f |
| john-p1-e08-v12 | sell vegetables | vender verduras | john-p1-e08 | john-p1-e08-l02 | c48502bb |
| john-p1-e08-v13 | drive a bus | dirigir um ônibus | john-p1-e08 | — | b66d8dd2 |
| john-p1-e08-v14 | teach French | ensinar francês | john-p1-e08 | — | 5e5bcb2e |
| john-p1-e08-v15 | programme computers | programar computadores (grafia BrE) | john-p1-e08 | — | e6ebae67 |
| john-p2-e02-v01 | car salesperson | vendedor(a) de carros | john-p2-e02 | — | 9f677704 |
| john-p2-e02-v06 | taxi driver | taxista | john-p2-e02 | — | b37f7bc9 |
| john-p2-e02-v07 | bus driver | motorista de ônibus | john-p2-e02 | — | 580d2c59 |
| john-p2-e02-v08 | computer programmer | programador(a) | john-p2-e02 | — | 2cd86698 |
| john-p2-e02-v09 | repair appliances | consertar aparelhos | john-p2-e02 | john-p2-e02-l06 | 40a98bc8 |
| john-p2-e02-v10 | design engines | projetar motores | john-p2-e02 | — | ac2c7070 |
| john-p2-e02-v11 | teach French | ensinar francês | john-p2-e02 | — | 5e5bcb2e |
| john-p2-e02-v12 | sell vegetables | vender verduras | john-p2-e02 | — | c48502bb |
| john-p2-e04-v04 | find the cause | encontrar a causa | john-p2-e04 | — | 2978e336 |
| john-p2-e04-v05 | not yet | ainda não | john-p2-e04 | john-p2-e04-l04 | 6d9d33dc |
| john-p2-x01-v07 | every Saturday | todo sábado | john-p2-x01 | — | d37bda53 |
| john-p2-x01-v08 | twice a week | duas vezes por semana | john-p2-x01 | — | 5df04aa4 |
| john-p3-e03-v01 | mother / father | mãe / pai | john-p3-e03 | — | 1b43c22c |
| john-p3-e03-v02 | brother / sister | irmão / irmã | john-p3-e03 | — | 5c07082d |
| john-p3-e03-v03 | uncle / aunt | tio / tia | john-p3-e03 | — | bad59d74 |
| john-p3-e03-v04 | nephew / niece | sobrinho / sobrinha | john-p3-e03 | john-p3-e03-l02, john-p3-e03-l04 | 04a45ff0 |
| john-p3-e03-v06 | grandson / granddaughter | neto / neta | john-p3-e03 | — | 9e37497b |
| john-p3-e03-v09 | daughter / son | filha / filho | john-p3-e03 | john-p3-e03-l02, john-p3-e03-l04 | defd411b |
| john-p3-e05-v05 | a bit | um pouco | john-p3-e05 | — | 616bf52f |
| john-p3-e05-v06 | not that handsome | não tão bonito assim | john-p3-e05 | — | a72838e8 |
| john-p3-e05-v07 | the nicest | o mais simpático / agradável | john-p3-e05 | — | 182f2752 |
| john-p3-e05-v08 | as good as | tão bom quanto | john-p3-e05 | john-p3-e05-l03 | 0c2356ae |
| john-p3-x01-v05 | not that handsome | não tão bonito assim | john-p3-x01 | — | a72838e8 |
| john-p3-x01-v06 | a bit | um pouco | john-p3-x01 | — | 616bf52f |
| john-p3-x01-v09 | the nicest | o(a) mais simpático(a) / legal | john-p3-x01 | john-p3-x01-l04 | 182f2752 |
| john-p3-x01-v10 | more handsome than | mais bonito do que | john-p3-x01 | — | 5c11ddd0 |
| john-p3-x01-v11 | the most handsome | o mais bonito | john-p3-x01 | — | 9e83e13c |
| john-p3-x01-v13 | have ever seen | já vi (experiência de vida) | john-p3-x01 | — | 0bc21638 |
| john-p3-x02-v01 | get married | casar-se | john-p3-x02 | john-p3-x02-l01 | 181eafc7 |
| john-p3-x02-v04 | future wife | futura esposa | john-p3-x02 | john-p3-x02-l02 | 3281069b |
| john-p5-e01-v01 | on the phone | ao telefone | john-p5-e01 | john-p5-e01-l01 | 4e6d0eeb |
| john-p5-e01-v05 | hold on, please | aguarde um instante, por favor | john-p5-e01 | — | 7497cc43 |
| john-p5-e01-v07 | advise me on | aconselhar-me sobre | john-p5-e01 | john-p5-e01-l05 | f088e1b2 |
| john-p5-e01-v08 | suit my company | atender às necessidades da minha empresa | john-p5-e01 | — | be48eec5 |
| john-p7-e02-v01 | railway station | estação ferroviária | john-p7-e02 | john-p7-e02-l01 | b7a600f4 |
| john-p7-e02-v04 | traffic lights | semáforo | john-p7-e02 | john-p7-e02-l02 | 77b436ff |
| john-p7-e02-v05 | on foot | a pé | john-p7-e02 | john-p7-e02-l04 | aa7a8694 |
| john-p2-e02-v13 | repair electrical appliances | consertar aparelhos elétricos | john-p2-e02 | john-p2-e02-l06 | 6e1740c2 |
| john-p2-x01-v09 | uncle / aunt | tio / tia | john-p2-x01 | john-p2-x01-l02 | bad59d74 |
| john-p2-x02-v01 | nephew / niece | sobrinho / sobrinha | john-p2-x02 | john-p2-x02-l01 | 04a45ff0 |
| john-p4-e01-v01 | sports event | evento desportivo | john-p4-e01 | john-p4-e01-l04 | 9e0722fa |
| john-p4-e02-v02 | first place | primeiro lugar | john-p4-e02 | john-p4-e02-l01 | d05ab00a |
| john-p4-e02-v03 | closely followed by | seguido de perto por | john-p4-e02 | john-p4-e02-l02 | 6e00c345 |
| john-p4-x01-v02 | closely followed by | seguido de perto por | john-p4-x01 | john-p4-x01-l01 | 6e00c345 |
| john-p4-e02-v04 | come in first | chegar em primeiro | john-p4-e02 | john-p4-e02-l06 | 1c33936e |
| john-p4-e03-v02 | keep trying | continuar tentando | john-p4-e03 | john-p4-e03-l05 | 5041b0df |
| john-p4-e03-v03 | great fun | muito divertido | john-p4-e03 | john-p4-e03-l01 | 86968e37 |
| john-p4-x01-v04 | take first position | assumir a primeira posição | john-p4-x01 | john-p4-x01-l01 | dd1bdccb |
| john-p4-x01-v07 | come in third | chegar em terceiro | john-p4-x01 | john-p4-x01-l03 | 3987e179 |
| john-p6-e01-v01 | clothes shop | loja de roupas | john-p6-e01 | john-p6-e01-l03 | 2356e28d |
| john-p6-e02-v05 | smaller / larger | menor / maior | john-p6-e02 | john-p6-e02-l06 | 1f48fa68 |
| john-p6-e02-v06 | changing room | provador | john-p6-e02 | john-p6-e02-l05 | a8be2031 |
| john-p6-e03-v03 | changing room | provador | john-p6-e03 | john-p6-e03-l06 | a8be2031 |
| john-p6-e02-v08 | look for | procurar | john-p6-e02 | john-p6-e02-l02, john-p6-e02-l07 | 92d01611 |
| john-p6-e02-v09 | over here | aqui / por aqui | john-p6-e02 | john-p6-e02-l05 | 10a09ff3 |
| john-p6-e03-v05 | over here | aqui / por aqui | john-p6-e03 | john-p6-e03-l06 | 10a09ff3 |
| john-p7-e01-v01 | get there | chegar lá | john-p7-e01 | john-p7-e01-l04 | aeabb68d |
| john-p7-x01-v03 | make a complaint | fazer uma reclamação | john-p7-x01 | john-p7-x01-l03 | b567587d |
| john-p7-e03-v02 | departure board | painel de partidas | john-p7-e03 | john-p7-e03-l01 | 4df96ca3 |
| john-p7-e05-v01 | direct service | serviço direto | john-p7-e05 | john-p7-e05-l05 | 57702d47 |

## expressão (`expression`) — 35

| Id | Inglês | Português | Atividade | Falas relacionadas | Áudio |
|---|---|---|---|---|---|
| john-p1-e01-v02 | work for a company | trabalhar para uma empresa | john-p1-e01 | — | ff0a57a3 |
| john-p1-e01-v07 | That sounds interesting. | Isso parece interessante. | john-p1-e01 | john-p1-e01-l07 | cd684270 |
| john-p1-e01-v08 | What do you do? | O que você faz? (profissão) | john-p1-e01 | john-p1-e01-l05 | b9f7a551 |
| john-p1-e04-v04 | in my free time | no meu tempo livre | john-p1-e04 | john-p1-e04-l06 | e2a185df |
| john-p1-e04-v09 | I'd like that. | Eu gostaria. | john-p1-e04 | john-p1-e04-l09 | 06e2150f |
| john-p2-e04-v01 | Are you free for a moment? | Você tem um instante disponível? | john-p2-e04 | john-p2-e04-l01 | 2c7c9ac5 |
| john-p2-e04-v02 | I'm afraid not. | Infelizmente, não. | john-p2-e04 | john-p2-e04-l02 | 55ee6e30 |
| john-p2-e04-v03 | deal with a problem | lidar com um problema | john-p2-e04 | john-p2-e04-l02 | 41682b81 |
| john-p2-e04-v06 | That would be helpful. | Isso seria útil. | john-p2-e04 | — | b6e9b90a |
| john-p3-e05-v01 | What do you think of...? | O que você acha de...? | john-p3-e05 | john-p3-e05-l01 | 39bcdc41 |
| john-p3-e05-v02 | Which one do you prefer? | De qual você prefere? | john-p3-e05 | john-p3-e05-l04 | e2610817 |
| john-p3-e05-v03 | I prefer... | Eu prefiro... | john-p3-e05 | john-p3-e05-l05 | 0914b422 |
| john-p3-e05-v04 | I think... | Eu acho... | john-p3-e05 | john-p3-e05-l02, john-p3-e05-l03 | 8e43efbc |
| john-p3-x01-v01 | What do you think of...? | O que você acha de...? | john-p3-x01 | john-p3-x01-l01 | 39bcdc41 |
| john-p3-x01-v02 | Which one do you prefer? | De qual você prefere? / Qual deles você prefere? | john-p3-x01 | john-p3-x01-l03 | e2610817 |
| john-p3-x01-v03 | I think... | Eu acho... | john-p3-x01 | john-p3-x01-l04 | 8e43efbc |
| john-p3-x01-v04 | Come on! | Ah, qual é! / Ora! (conforme o tom) | john-p3-x01 | — | 58c13cfd |
| john-p3-x01-v12 | isn't as ... as | não é tão ... quanto | john-p3-x01 | — | 490ae432 |
| john-p3-x02-v02 | stag do / stag party | despedida de solteiro (BrE) | john-p3-x02 | john-p3-x02-l01 | 324090a0 |
| john-p3-x02-v03 | hen do / hen party | despedida de solteira (BrE) | john-p3-x02 | john-p3-x02-l02 | a44316ac |
| john-p3-x02-v05 | play tricks on someone | pregar peças em alguém | john-p3-x02 | — | c211046a |
| john-p3-x02-v06 | go out to a nightclub | sair para uma casa noturna | john-p3-x02 | — | f40ae28d |
| john-p5-e01-v03 | The line is engaged. | A linha está ocupada. | john-p5-e01 | — | 8f46df5f |
| john-p5-e01-v04 | He hung up. | Ele desligou. | john-p5-e01 | — | 13559cdb |
| john-p5-e01-v06 | What can I do for you? | Em que posso ajudar? | john-p5-e01 | — | f7aa2578 |
| john-p5-e01-v09 | I'll see you there. | Vejo você lá / Nos vemos lá. | john-p5-e01 | john-p5-e01-l11 | 447db0b3 |
| john-p7-e02-v03 | turn left / right | vire à esquerda / direita | john-p7-e02 | john-p7-e02-l02 | ab302afb |
| john-p7-e02-v07 | How do I get to...? | Como chego a...? | john-p7-e02 | — | bc1216f3 |
| john-p4-e04-v02 | give it a try | experimentar / dar uma chance | john-p4-e04 | john-p4-e04-l05 | cf67d2c3 |
| john-p4-e03-v04 | I'm starving. | Estou morrendo de fome. | john-p4-e03 | john-p4-e03-l07 | 354a7594 |
| john-p4-x01-v03 | get a good start | largar bem | john-p4-x01 | john-p4-x01-l01 | ca998c99 |
| john-p4-x01-v05 | move up into third | subir para o terceiro lugar | john-p4-x01 | john-p4-x01-l02 | 9c9af9fc |
| john-p4-x01-v06 | drop back to fifth | recuar para o quinto lugar | john-p4-x01 | john-p4-x01-l02 | bf797525 |
| john-p7-x01-v01 | get on a train / bus | entrar / embarcar num trem ou ônibus | john-p7-x01 | john-p7-x01-l02 | 4032b1b5 |
| john-p7-x01-v02 | get off a train / bus | descer de um trem ou ônibus | john-p7-x01 | john-p7-x01-l02 | b65ec06b |

## palavra (`word`) — 50

| Id | Inglês | Português | Atividade | Falas relacionadas | Áudio |
|---|---|---|---|---|---|
| john-p1-e02-v01 | photographer | fotógrafo | john-p1-e02 | john-p1-e02-l03, john-p1-e02-l05 | 490aa90a |
| john-p1-e04-v01 | family | família | john-p1-e04 | john-p1-e04-l01 | 521d0429 |
| john-p1-e06-v02 | colleague | colega de trabalho | john-p1-e06 | john-p1-e06-l04 | 5b155444 |
| john-p1-e06-v03 | everyone | todos / todo mundo | john-p1-e06 | john-p1-e06-l05 | d378dd78 |
| john-p1-e06-v05 | gathering | reunião / encontro | john-p1-e06 | john-p1-e06-l07 | 30895ef6 |
| john-p1-e08-v01 | greengrocer | comerciante de frutas e verduras / verdureiro | john-p1-e08 | john-p1-e08-l01 | 7fc0d7c0 |
| john-p1-e08-v05 | singer | cantor(a) | john-p1-e08 | john-p1-e08-l03 | 6a3a7f29 |
| john-p1-e08-v06 | watchmaker | relojoeiro(a) | john-p1-e08 | — | f2307040 |
| john-p1-e08-v07 | electrician | eletricista | john-p1-e08 | john-p1-e08-l02 | bd2efc56 |
| john-p1-e08-v08 | fisherman | pescador | john-p1-e08 | — | 128b9544 |
| john-p2-e02-v02 | pilot | piloto(a) | john-p2-e02 | — | 10066ae1 |
| john-p2-e02-v03 | engineer | engenheiro(a) | john-p2-e02 | john-p2-e02-l01 | 9c3dd718 |
| john-p2-e02-v04 | electrician | eletricista | john-p2-e02 | john-p2-e02-l06 | bd2efc56 |
| john-p2-e02-v05 | chef | chef de cozinha | john-p2-e02 | — | a4430275 |
| john-p2-x01-v01 | always | sempre | john-p2-x01 | — | 6736afe4 |
| john-p2-x01-v02 | usually | geralmente / normalmente | john-p2-x01 | john-p2-x01-l01 | 0391d612 |
| john-p2-x01-v03 | often | frequentemente | john-p2-x01 | — | 9a6320f7 |
| john-p2-x01-v04 | sometimes | às vezes | john-p2-x01 | john-p2-x01-l01 | 5d689621 |
| john-p2-x01-v05 | rarely | raramente | john-p2-x01 | — | 5eef032e |
| john-p2-x01-v06 | never | nunca | john-p2-x01 | — | 0ac95089 |
| john-p3-e03-v05 | cousin | primo(a) | john-p3-e03 | — | 3799e184 |
| john-p3-e03-v07 | grandparents | avós | john-p3-e03 | john-p3-e03-l06 | 18126fc2 |
| john-p3-e03-v08 | relatives | parentes | john-p3-e03 | — | ef8af02a |
| john-p3-e05-v09 | both | ambos / os dois | john-p3-e05 | — | ea81eea2 |
| john-p3-x01-v07 | nicer | mais simpático / legal | john-p3-x01 | john-p3-x01-l02 | 3221528a |
| john-p3-x01-v08 | funnier | mais engraçado | john-p3-x01 | — | ed1ff2d8 |
| john-p7-e02-v06 | nearby | nas proximidades | john-p7-e02 | — | 035356aa |
| john-p4-e01-v02 | race | corrida | john-p4-e01 | john-p4-e01-l04 | 8ebbc298 |
| john-p4-e04-v01 | race | corrida | john-p4-e04 | john-p4-e04-l06 | 8ebbc298 |
| john-p4-x01-v01 | race | corrida | john-p4-x01 | john-p4-x01-l03 | 8ebbc298 |
| john-p4-e02-v01 | runner | corredor | john-p4-e02 | john-p4-e02-l01, john-p4-e02-l02, john-p4-e02-l03, john-p4-e02-l05, john-p4-e02-l06 | 73c212db |
| john-p4-e03-v01 | runner | corredor | john-p4-e03 | john-p4-e03-l02, john-p4-e03-l04 | 73c212db |
| john-p4-e05-v01 | get-together | encontro informal | john-p4-e05 | john-p4-e05-l03 | 02822284 |
| john-p6-e01-v02 | suit | terno | john-p6-e01 | john-p6-e01-l02 | 2e2f8980 |
| john-p6-e02-v01 | suit | terno | john-p6-e02 | john-p6-e02-l02, john-p6-e02-l08 | 2e2f8980 |
| john-p6-e04-v01 | suit | terno | john-p6-e04 | john-p6-e04-l01, john-p6-e04-l06 | 2e2f8980 |
| john-p6-e05-v01 | suit | terno | john-p6-e05 | john-p6-e05-l02 | 2e2f8980 |
| john-p6-e02-v02 | jacket | paletó / jaqueta, conforme o contexto | john-p6-e02 | john-p6-e02-l06 | 100e165b |
| john-p6-e02-v03 | shirt | camisa | john-p6-e02 | john-p6-e02-l09 | 43e36503 |
| john-p6-e03-v01 | shirt | camisa | john-p6-e03 | john-p6-e03-l01 | 43e36503 |
| john-p6-e04-v02 | shirt | camisa | john-p6-e04 | john-p6-e04-l06 | 43e36503 |
| john-p6-e05-v02 | shirt | camisa | john-p6-e05 | john-p6-e05-l02 | 43e36503 |
| john-p6-e02-v04 | size | tamanho | john-p6-e02 | john-p6-e02-l03, john-p6-e02-l06 | 23a0d95c |
| john-p6-e03-v02 | size | tamanho | john-p6-e03 | john-p6-e03-l02 | 23a0d95c |
| john-p6-e01-v03 | smart | elegante / arrumado | john-p6-e01 | john-p6-e01-l01 | ae97e7d2 |
| john-p6-e05-v04 | smart | elegante / arrumado | john-p6-e05 | john-p6-e05-l05 | ae97e7d2 |
| john-p6-e04-v03 | cheaper | mais barato | john-p6-e04 | john-p6-e04-l02 | 5c4cf4f7 |
| john-p7-e02-v08 | leave | partir / sair / deixar | john-p7-e02 | john-p7-e02-l02 | 5473c0c0 |
| john-p7-e03-v01 | leave | partir / sair / deixar | john-p7-e03 | john-p7-e03-l03, john-p7-e03-l04 | 5473c0c0 |
| john-p7-e03-v03 | platform | plataforma | john-p7-e03 | john-p7-e03-l02, john-p7-e03-l03, john-p7-e03-l04 | 2a4a32b2 |

## phrasal verb (`phrasal_verb`) — 9

| Id | Inglês | Português | Atividade | Falas relacionadas | Áudio |
|---|---|---|---|---|---|
| john-p1-e04-v08 | come along | vir junto / acompanhar | john-p1-e04 | john-p1-e04-l08 | 21b2c620 |
| john-p1-e06-v06 | get together | reunir-se | john-p1-e06 | john-p1-e06-l08 | 6547a31f |
| john-p5-e01-v02 | put someone through | transferir / conectar uma ligação | john-p5-e01 | john-p5-e01-l02 | b0dc92ef |
| john-p7-e02-v02 | go straight on | siga em frente | john-p7-e02 | john-p7-e02-l02 | 7f5ca2bc |
| john-p6-e02-v07 | try on | experimentar uma roupa | john-p6-e02 | john-p6-e02-l04 | 6f3c33a3 |
| john-p6-e03-v04 | try on | experimentar uma roupa | john-p6-e03 | john-p6-e03-l04 | 6f3c33a3 |
| john-p6-e05-v03 | try on | experimentar uma roupa | john-p6-e05 | john-p6-e05-l03 | 6f3c33a3 |
| john-p7-e07-v01 | pick up | buscar / pegar | john-p7-e07 | john-p7-e07-l05 | b9d08f15 |
| john-p7-e07-v02 | check in | fazer check-in | john-p7-e07 | john-p7-e07-l01 | 0fea38fe |

## Itens das tabelas da fonte sem atividade (não integrados ao app) — 89

| Parte | Inglês (literal) | Tabela | Fonte |
|---|---|---|---|
| 1 | go fishing / fish in the sea | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:368 |
| 1 | fish for salmon | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:369 |
| 1 | play golf | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:370 |
| 1 | golf player | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:371 |
| 1 | play basketball | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:372 |
| 1 | basketball player | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:373 |
| 1 | race cars | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:374 |
| 1 | favourite sport | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:375 |
| 1 | like + -ing | Hobbies and sports — complete lexical set | 01_Getting_to_Know_John.md:376 |
| 2 | car salesperson / car salesman | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:223 |
| 2 | pilot | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:224 |
| 2 | fly an aeroplane | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:225 |
| 2 | design engines | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:227 |
| 2 | grocer | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:228 |
| 2 | sell groceries | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:229 |
| 2 | businessman / businesswoman | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:232 |
| 2 | work for a large company | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:233 |
| 2 | chef | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:234 |
| 2 | cook in a restaurant | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:235 |
| 2 | taxi driver | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:236 |
| 2 | drive a taxi | Professions and actions — expanded inventory | 02_Work_Studies_and_Everyday_Life.md:237 |
| 2 | father / mother | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:253 |
| 2 | brother / sister | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:254 |
| 2 | grandson / granddaughter | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:257 |
| 2 | cousin | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:258 |
| 2 | parents | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:259 |
| 2 | grandparents | Family relationships — complete reference | 02_Work_Studies_and_Everyday_Life.md:260 |
| 4 | take up a position | Vocabulary & expressions | 04_Opinions_Sports_and_Social_Life.md:146 |
| 4 | come up to the finish | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:219 |
| 4 | win the race | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:221 |
| 4 | as fast as you can | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:222 |
| 4 | good fun | Useful commentary chunks | 04_Opinions_Sports_and_Social_Life.md:224 |
| 5 | the line is engaged | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:173 |
| 5 | hang up | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:174 |
| 5 | hold on | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:175 |
| 5 | hold on a second | Telephone language | 05_Business_Calls_and_Social_Arrangements.md:176 |
| 5 | We are late, aren't we? | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:190 |
| 5 | I wonder what time it is. | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:191 |
| 5 | I wonder if he will come. | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:192 |
| 5 | I wonder if you could help me. | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:193 |
| 5 | a natural wonder | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:194 |
| 5 | with wonder | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:195 |
| 5 | no wonder | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:196 |
| 5 | collect stamps | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:197 |
| 5 | collect the homework | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:198 |
| 5 | collect a parcel | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:199 |
| 5 | collect the children from school | Other source expressions | 05_Business_Calls_and_Social_Arrangements.md:200 |
| 6 | trousers | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:112 |
| 6 | shoes | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:113 |
| 6 | it suits you | Vocabulary — clothes and shopping | 06_Shopping_Clothes_and_Everyday_Services.md:122 |
| 6 | Could you help me? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:182 |
| 6 | Could you help me, please? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:183 |
| 6 | Could you pass the salt? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:184 |
| 6 | Would you pass the salt? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:185 |
| 6 | Would you like a cup of tea? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:186 |
| 6 | Would you take my coat, please? | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:187 |
| 6 | ask a question | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:188 |
| 6 | change in here | Source coverage — requests, offers and shopping expressions | 06_Shopping_Clothes_and_Everyday_Services.md:189 |
| 6 | catch the ball | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:200 |
| 6 | catch the train | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:201 |
| 6 | catch the next bus | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:202 |
| 6 | I didn't catch your name. | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:203 |
| 6 | Do you catch my drift? | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:204 |
| 6 | catch a thief | Additional meanings of catch | 06_Shopping_Clothes_and_Everyday_Services.md:205 |
| 7 | get in a car / taxi | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:185 |
| 7 | get out of a car | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:186 |
| 7 | go into | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:189 |
| 7 | set off | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:192 |
| 7 | look for | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:193 |
| 7 | hold on | Phrasal verbs and travel chunks | 07_Travelling_and_Unexpected_Situations.md:194 |
| 7 | check the train timetable | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:249 |
| 7 | a two-hour delay | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:250 |
| 7 | a delay in replying | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:251 |
| 7 | delay the construction | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:252 |
| 7 | delay the meeting until tomorrow | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:253 |
| 7 | How much further is the station? | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:254 |
| 7 | walk a bit further | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:255 |
| 7 | further questions | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:256 |
| 7 | discuss this further | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:257 |
| 7 | customer complaints | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:259 |
| 7 | complain about the delay | Timetable and delay language | 07_Travelling_and_Unexpected_Situations.md:260 |
| 7 | catch the train | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:280 |
| 7 | miss the bus | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:281 |
| 7 | catch the next one | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:282 |
| 7 | get on / get off | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:283 |
| 7 | get in / get out of | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:284 |
| 7 | set off | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:285 |
| 7 | pick someone up | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:286 |
| 7 | drop someone off | Additional movement and transport chunks | 07_Travelling_and_Unexpected_Situations.md:287 |

---

# Anexo B — The Story of John — relatório da conversão (literal)

Fonte: `dev/content/dialogues/john-report.json` (gerado por `dev/tools/dialogues-source.mjs`).

Resumo: {"corrections":12,"contentVersion":"2175ff859f35","parts":7,"activities":46,"lines":273,"items":183,"questions":403,"activitiesWithoutItems":15,"unassignedItems":89}

## Arquivos

| Arquivo | Parte | Falas de diálogo | Atividades | Itens |
|---|---|---|---|---|
| 01_Getting_to_Know_John.md | 1 | 55 | 9 | 0 |
| 02_Work_Studies_and_Everyday_Life.md | 2 | 35 | 7 | 0 |
| 03_Family_Friends_and_Relationships.md | 3 | 39 | 7 | 0 |
| 04_Opinions_Sports_and_Social_Life.md | 4 | 34 | 6 | 0 |
| 05_Business_Calls_and_Social_Arrangements.md | 5 | 30 | 4 | 0 |
| 06_Shopping_Clothes_and_Everyday_Services.md | 6 | 32 | 5 | 0 |
| 07_Travelling_and_Unexpected_Situations.md | 7 | 48 | 8 | 0 |

## Decisões registradas (34)

- john-p1-e07-l02: rótulo da tradução “Estudante” ≠ “Student” (tradução do papel; mantido literal).
- john-p1-e07-l04: rótulo da tradução “Estudante” ≠ “Student” (tradução do papel; mantido literal).
- john-p1-e07-l06: rótulo da tradução “Estudante” ≠ “Student” (tradução do papel; mantido literal).
- john-p2-e02-l02: rótulo da tradução “Novo colega” ≠ “New colleague” (tradução do papel; mantido literal).
- john-p2-e02-l05: rótulo da tradução “Novo colega” ≠ “New colleague” (tradução do papel; mantido literal).
- john-p4-x01-l01: rótulo da tradução “Comentarista” ≠ “Commentator” (tradução do papel; mantido literal).
- john-p4-x01-l02: rótulo da tradução “Comentarista” ≠ “Commentator” (tradução do papel; mantido literal).
- john-p4-x01-l03: rótulo da tradução “Comentarista” ≠ “Commentator” (tradução do papel; mantido literal).
- john-p5-e01-l01: rótulo da tradução “Recepcionista” ≠ “Receptionist” (tradução do papel; mantido literal).
- john-p5-e01-l03: rótulo da tradução “Recepcionista” ≠ “Receptionist” (tradução do papel; mantido literal).
- john-p6-e02-l01: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p6-e02-l03: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p6-e02-l05: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p6-e02-l07: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p6-e03-l02: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p6-e03-l04: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p6-e03-l06: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p6-e04-l05: rótulo da tradução “Vendedor(a)” ≠ “Shop assistant” (tradução do papel; mantido literal).
- john-p7-e02-l02: rótulo da tradução “Transeunte” ≠ “Passer-by” (tradução do papel; mantido literal).
- john-p7-e02-l04: rótulo da tradução “Transeunte” ≠ “Passer-by” (tradução do papel; mantido literal).
- john-p7-e03-l02: rótulo da tradução “Funcionário” ≠ “Station employee” (tradução do papel; mantido literal).
- john-p7-e03-l04: rótulo da tradução “Funcionário” ≠ “Station employee” (tradução do papel; mantido literal).
- john-p7-e03-l06: rótulo da tradução “Funcionário” ≠ “Station employee” (tradução do papel; mantido literal).
- john-p7-e04-l01: rótulo da tradução “Anúncio” ≠ “Announcement” (tradução do papel; mantido literal).
- john-p7-e04-l03: rótulo da tradução “Mary (ao telefone)” ≠ “Mary (on the phone)” (tradução do papel; mantido literal).
- john-p7-e05-l02: rótulo da tradução “Funcionário” ≠ “Station employee” (tradução do papel; mantido literal).
- john-p7-e05-l04: rótulo da tradução “Funcionário” ≠ “Station employee” (tradução do papel; mantido literal).
- john-p7-e05-l06: rótulo da tradução “Funcionário” ≠ “Station employee” (tradução do papel; mantido literal).
- john-p7-e06-l01: rótulo da tradução “Agente de viagens” ≠ “Travel agent” (tradução do papel; mantido literal).
- john-p7-e06-l03: rótulo da tradução “Agente de viagens” ≠ “Travel agent” (tradução do papel; mantido literal).
- john-p7-e06-l05: rótulo da tradução “Agente de viagens” ≠ “Travel agent” (tradução do papel; mantido literal).
- john-p7-e06-l07: rótulo da tradução “Agente de viagens” ≠ “Travel agent” (tradução do papel; mantido literal).
- john-p7-x01-l02: rótulo da tradução “Passageiro” ≠ “Passenger” (tradução do papel; mantido literal).
- john-p7-x01-l04: rótulo da tradução “Funcionário” ≠ “Staff member” (tradução do papel; mantido literal).

## Avisos (89)

- john-p1-e01-v02 “work for a company”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e02-v04 “cover a match”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e02-v07 “solve a problem”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e02-v08 “be good at”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v02 “bus driver”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v03 “computer programmer”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v04 “French teacher”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v06 “watchmaker”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v08 “fisherman”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v09 “sports photographer”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v11 “make a watch”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v13 “drive a bus”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v14 “teach French”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e08-v15 “programme computers”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v01 “car salesperson”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v02 “pilot”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v05 “chef”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v06 “taxi driver”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v07 “bus driver”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v08 “computer programmer”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v10 “design engines”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v11 “teach French”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e02-v12 “sell vegetables”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e04-v04 “find the cause”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-e04-v06 “That would be helpful.”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-x01-v01 “always”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-x01-v03 “often”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-x01-v05 “rarely”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-x01-v06 “never”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-x01-v07 “every Saturday”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p2-x01-v08 “twice a week”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e03-v01 “mother / father”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e03-v02 “brother / sister”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e03-v03 “uncle / aunt”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e03-v05 “cousin”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e03-v06 “grandson / granddaughter”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e03-v08 “relatives”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e05-v05 “a bit”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e05-v06 “not that handsome”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e05-v07 “the nicest”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-e05-v09 “both”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v04 “Come on!”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v05 “not that handsome”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v06 “a bit”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v08 “funnier”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v10 “more handsome than”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v11 “the most handsome”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v12 “isn't as ... as”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x01-v13 “have ever seen”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x02-v05 “play tricks on someone”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p3-x02-v06 “go out to a nightclub”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p5-e01-v03 “The line is engaged.”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p5-e01-v04 “He hung up.”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p5-e01-v05 “hold on, please”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p5-e01-v06 “What can I do for you?”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p5-e01-v08 “suit my company”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p7-e02-v06 “nearby”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p7-e02-v07 “How do I get to...?”: não aparece literalmente nas falas da atividade (vocabulário da seção).
- john-p1-e03: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p1-e05: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p1-e07: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p1-e09: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p2-e01: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p2-e03: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p2-e05: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p3-e01: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p3-e02: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p3-e04: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p5-e02: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p5-e03: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p5-e04: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p7-e04: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p7-e06: sem itens de vocabulário nos documentos (a fase 1 fica sem itens).
- john-p1-e05: 9 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p1-e08: 7 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p1-e09: 5 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p2-x01: 3 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p2-x02: 3 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p3-e05: 7 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p3-x01: 4 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p3-x02: 5 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p4-x01: 8 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p5-e04: 8 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p6-e01: 8 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p6-e05: 7 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p7-e02: 7 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p7-e03: 8 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p7-e07: 8 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).
- john-p7-x01: 6 de 10 questões de compreensão sustentadas pelo texto (fase 4 indisponível).

## Trechos marcados como “não diálogo” (27)

| Arquivo | Linha | Rótulo |
|---|---|---|
| 01_Getting_to_Know_John.md | 245 | A |
| 01_Getting_to_Know_John.md | 247 | B (one possible version) |
| 01_Getting_to_Know_John.md | 362 | Language focus |
| 01_Getting_to_Know_John.md | 378 | Contrast |
| 02_Work_Studies_and_Everyday_Life.md | 76 | Nota BrE |
| 02_Work_Studies_and_Everyday_Life.md | 190 | A |
| 02_Work_Studies_and_Everyday_Life.md | 192 | B |
| 02_Work_Studies_and_Everyday_Life.md | 214 | Future with intention — be going to + verb |
| 03_Family_Friends_and_Relationships.md | 186 | A |
| 03_Family_Friends_and_Relationships.md | 188 | B |
| 03_Family_Friends_and_Relationships.md | 250 | Grammar in context |
| 04_Opinions_Sports_and_Social_Life.md | 178 | A |
| 04_Opinions_Sports_and_Social_Life.md | 180 | B |
| 04_Opinions_Sports_and_Social_Life.md | 226 | Practice instruction |
| 04_Opinions_Sports_and_Social_Life.md | 229 | Language focus |
| 05_Business_Calls_and_Social_Arrangements.md | 56 | Phrasal verbs |
| 05_Business_Calls_and_Social_Arrangements.md | 161 | A |
| 05_Business_Calls_and_Social_Arrangements.md | 163 | B |
| 05_Business_Calls_and_Social_Arrangements.md | 202 | Grammar note |
| 06_Shopping_Clothes_and_Everyday_Services.md | 124 | Phrasal verbs |
| 06_Shopping_Clothes_and_Everyday_Services.md | 174 | A |
| 06_Shopping_Clothes_and_Everyday_Services.md | 176 | B |
| 06_Shopping_Clothes_and_Everyday_Services.md | 207 | Note |
| 07_Travelling_and_Unexpected_Situations.md | 237 | A |
| 07_Travelling_and_Unexpected_Situations.md | 239 | B |
| 07_Travelling_and_Unexpected_Situations.md | 241 | C |
| 07_Travelling_and_Unexpected_Situations.md | 293 | BrE usage note |

## Correções aprovadas (12) — `john-corrections.json`

Aprovado por: Product Owner — autorização de 2026-11-11 (“Resolva os problemas identificados… Corrija o conteúdo derivado e suas perguntas, preservando a rastreabilidade”)

Nota: Os documentos autorais em source/ continuam sem alteração. Estas correções são aplicadas por tools/dialogues-source.mjs ao conteúdo derivado; cada fala corrigida guarda o texto original em `correction`.

| Id | Campo | De (fonte) | Para (usado) | Motivo |
|---|---|---|---|---|
| john-p7-e01-l05 | en | You could take the 8.40 train. | You could take the 8.20 train. | Horário do trem para Edinburgh: p7-e03 (“It leaves at twenty past eight”) e p7-e04 (“The 8.20 service…”) usam 8.20; a sugestão de Mary passa a ser o mesmo trem. |
| john-p7-e01-l05 | pt | Você poderia pegar o trem das 8h40. | Você poderia pegar o trem das 8h20. | Mesma correção na tradução. |
| john-p7-e01-l07 | en | About three and a half hours. | About two and a half hours. | John quer chegar antes das onze (p7-e01) e o trem das 9.05, que para em várias estações, chegaria por volta das 11h30 (p7-e05). Com 3h30 de viagem, nem o trem das 8.20 chegaria antes das onze; com cerca de 2h30 a sequência fica coerente (8.20 → ~10h50; 9.05 com paradas → ~11h30). |
| john-p7-e01-l07 | pt | Cerca de três horas e meia. | Cerca de duas horas e meia. | Mesma correção na tradução. |
| john-p1-e09-l01 | en | Did you meet Peter at the university? | When did you last see Peter? | A resposta (“…at a conference”) contradizia a pergunta (“at the university”), e Peter é vizinho e amigo de John (p1-e04, p3-e04): “meet” aqui é encontrar, não conhecer. A pergunta passa a ser sobre o último encontro. |
| john-p1-e09-l01 | pt | Você conheceu Peter na universidade? | Quando você viu o Peter pela última vez? | Mesma correção na tradução. |
| john-p1-e09-l02 | en | Yes, I met him last week at a conference. | I met him last week at a conference. | Sem o “Yes”, que respondia à pergunta anterior; o foco gramatical (met = Past Simple de meet) é mantido. |
| john-p1-e09-l02 | pt | Sim, encontrei com ele na semana passada em uma conferência. | Encontrei com ele na semana passada em uma conferência. | Mesma correção na tradução. |
| john-p1-e01-l01 | en | Do you remember John Bennett? | John Bennett? Do you remember me? | Abertura ambígua: Rick perguntava ao próprio John se ele se lembrava de John Bennett. Agora Rick reconhece John e pergunta se John se lembra dele, o que combina com a resposta (“We met at university, didn't we?”). |
| john-p1-e01-l01 | pt | Você se lembra do John Bennett? | John Bennett? Você se lembra de mim? | Mesma correção na tradução. |
| john-p5-e04-l02 | en | Yes. I've booked a table for six. | Yes. I've booked a table for six people. | “A table for six” podia ser lido como seis horas (eles chegam às cinco e meia). A tradução do próprio documento já dizia “seis pessoas”. |
| john-p5-e01 | context | John is at the office when the receptionist calls. | Mary is at the office when the receptionist calls her. | A ligação é para Mary (“Mr Walker is on the phone for you, Mary”); John não participa da cena. |

## Questões: origem e atividades com menos de 10 questões

Status (literal): gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11)

Fonte (literal): content/dialogues/john-questions.src.txt

| Atividade | Falas | Questões |
|---|---|---|
| john-p1-e05 | 5 | 9 |
| john-p1-e08 | 3 | 7 |
| john-p1-e09 | 4 | 5 |
| john-p2-x01 | 2 | 3 |
| john-p2-x02 | 1 | 3 |
| john-p3-e05 | 5 | 7 |
| john-p3-x01 | 4 | 4 |
| john-p3-x02 | 3 | 5 |
| john-p4-x01 | 3 | 8 |
| john-p5-e04 | 5 | 8 |
| john-p6-e01 | 5 | 8 |
| john-p6-e05 | 5 | 7 |
| john-p7-e02 | 5 | 7 |
| john-p7-e03 | 6 | 8 |
| john-p7-e07 | 6 | 8 |
| john-p7-x01 | 4 | 6 |

---

# Anexo C — Relação de áudios de The Story of John

Linhas de `docs/conteudo-dialogos/audios.md` com uso em The Story of John (literal).

| Chave | Arquivo | Duração (s) | Usos | Voz | Texto (literal) |
|---|---|---|---|---|---|
| 21b2c620 | audio/21b2c620.ogg | 1.07 | Conversation Practice · item · cp.come-along<br>The Story of John · item · john-p1-e04-v08 | bf_emma | come along |
| b9f7a551 | audio/b9f7a551.ogg | 1.22 | Conversation Practice · item · cp.what-do-you-do<br>The Story of John · item · john-p1-e01-v08 | bf_emma | What do you do? |
| 39bcdc41 | audio/39bcdc41.ogg | 1.34 | Conversation Practice · item · cp.what-do-you-think-of<br>The Story of John · item · john-p3-e05-v01<br>The Story of John · item · john-p3-x01-v01 | bf_emma | What do you think of…? |
| 026becd7 | audio/026becd7.ogg | 2.22 | The Story of John · fala · john-p1-e01-l01 | bm_lewis | John Bennett? Do you remember me? |
| d42d08b5 | audio/d42d08b5.ogg | 2.92 | The Story of John · fala · john-p1-e01-l02 | bm_george | Of course! We met at university, didn't we? |
| 7ad0cdc9 | audio/7ad0cdc9.ogg | 2.56 | The Story of John · fala · john-p1-e01-l03 | bm_lewis | That's right. What are you doing these days? |
| b930fc3c | audio/b930fc3c.ogg | 3.52 | The Story of John · fala · john-p1-e01-l04 | bm_george | I'm working for a technology company in Manchester. |
| 95005377 | audio/95005377.ogg | 1.79 | The Story of John · fala · john-p1-e01-l05 | bm_lewis | Really? What do you do there? |
| f4d22b85 | audio/f4d22b85.ogg | 7.02 | The Story of John · fala · john-p1-e01-l06 | bm_george | I'm a project analyst. I usually work with different teams, but this week I'm helping the sales department. |
| 20b6ca30 | audio/20b6ca30.ogg | 1.77 | The Story of John · fala · john-p1-e01-l07 | bm_lewis | That sounds interesting. |
| 8e416243 | audio/8e416243.ogg | 1.02 | The Story of John · item · john-p1-e01-v01 | — | these days |
| ff0a57a3 | audio/ff0a57a3.ogg | 1.47 | The Story of John · item · john-p1-e01-v02 | — | work for a company |
| 720af6ec | audio/720af6ec.ogg | 1.45 | The Story of John · item · john-p1-e01-v03 | — | project analyst |
| 756cfa37 | audio/756cfa37.ogg | 1.49 | The Story of John · item · john-p1-e01-v04 | — | sales department |
| 6e9d8df4 | audio/6e9d8df4.ogg | 1.3 | The Story of John · item · john-p1-e01-v05 | — | different teams |
| 310eb6d3 | audio/310eb6d3.ogg | 0.94 | The Story of John · item · john-p1-e01-v06 | — | this week |
| cd684270 | audio/cd684270.ogg | 1.64 | The Story of John · item · john-p1-e01-v07 | — | That sounds interesting. |
| edf58d9a | audio/edf58d9a.ogg | 3.71 | The Story of John · fala · john-p1-e02-l01 | bm_george | Mary, this is Rick. Rick, this is Mary Collins. |
| 63b8c730 | audio/63b8c730.ogg | 2.2 | The Story of John · fala · john-p1-e02-l02 | bf_emma | Nice to meet you, Rick. What do you do? |
| de07d76a | audio/de07d76a.ogg | 3.29 | The Story of John · fala · john-p1-e02-l03 | bm_lewis | I'm a photographer. I work for a local newspaper. |
| 686e3dd3 | audio/686e3dd3.ogg | 2.09 | The Story of John · fala · john-p1-e02-l04 | bf_emma | Do you take photographs of sport? |
| ccf729c8 | audio/ccf729c8.ogg | 5.23 | The Story of John · fala · john-p1-e02-l05 | bm_lewis | Yes, I do. I'm the sports photographer, so I often cover football matches. |
| bff949d2 | audio/bff949d2.ogg | 3.73 | The Story of John · fala · john-p1-e02-l06 | bm_george | Mary works in our company. She's a software engineer. |
| 0ffd03fb | audio/0ffd03fb.ogg | 3.65 | The Story of John · fala · john-p1-e02-l07 | bf_emma | And John is being modest. He's very good at solving problems. |
| 490aa90a | audio/490aa90a.ogg | 1.13 | The Story of John · item · john-p1-e02-v01 | — | photographer |
| 6f4e36db | audio/6f4e36db.ogg | 1.6 | The Story of John · item · john-p1-e02-v02 | — | local newspaper |
| 9f0fd189 | audio/9f0fd189.ogg | 1.64 | The Story of John · item · john-p1-e02-v03<br>The Story of John · item · john-p1-e08-v09 | — | sports photographer |
| b8418f72 | audio/b8418f72.ogg | 1.15 | The Story of John · item · john-p1-e02-v04 | — | cover a match |
| 43b8afd9 | audio/43b8afd9.ogg | 1.2 | The Story of John · item · john-p1-e02-v05 | — | football match |
| 0b8765b5 | audio/0b8765b5.ogg | 1.52 | The Story of John · item · john-p1-e02-v06 | — | software engineer |
| e7defb78 | audio/e7defb78.ogg | 1.32 | The Story of John · item · john-p1-e02-v07 | — | solve a problem |
| 2bcffeca | audio/2bcffeca.ogg | 1.02 | The Story of John · item · john-p1-e02-v08 | — | be good at |
| eab91fad | audio/eab91fad.ogg | 2.52 | The Story of John · fala · john-p1-e03-l01 | bm_lewis | Do you still live near the city centre? |
| ce20ffd2 | audio/ce20ffd2.ogg | 3.33 | The Story of John · fala · john-p1-e03-l02 | bm_george | No, I live in a suburb outside Manchester. |
| 191ca11b | audio/191ca11b.ogg | 1.88 | The Story of John · fala · john-p1-e03-l03 | bm_lewis | How long have you lived there? |
| 4b891af2 | audio/4b891af2.ogg | 4.67 | The Story of John · fala · john-p1-e03-l04 | bm_george | I've lived there for three years. It's quiet, and the neighbours are friendly. |
| 7bfdf252 | audio/7bfdf252.ogg | 2.09 | The Story of John · fala · john-p1-e03-l05 | bm_lewis | Are you still taking photographs? |
| 76440ded | audio/76440ded.ogg | 6.76 | The Story of John · fala · john-p1-e03-l06 | bm_george | Yes. I usually take pictures at weekends. At the moment, I'm working on a small photography project. |
| f3fc4e2a | audio/f3fc4e2a.ogg | 2.84 | The Story of John · fala · john-p1-e04-l01 | bm_george | This is a photograph of my family. |
| c153fa20 | audio/c153fa20.ogg | 1.62 | The Story of John · fala · john-p1-e04-l02 | bm_lewis | Is that your sister? |
| af2126be | audio/af2126be.ogg | 3.33 | The Story of John · fala · john-p1-e04-l03 | bm_george | Yes. Her name is Ana Mitchell. She's a teacher. |
| 4166d9f9 | audio/4166d9f9.ogg | 1.6 | The Story of John · fala · john-p1-e04-l04 | bm_lewis | And the man next to her? |
| 72ccdbd0 | audio/72ccdbd0.ogg | 3.58 | The Story of John · fala · john-p1-e04-l05 | bm_george | That's my uncle, Stuart Hughes. He's an engineer. |
| 08a5aed2 | audio/08a5aed2.ogg | 2.09 | The Story of John · fala · john-p1-e04-l06 | bm_lewis | What do you do in your free time? |
| 5a632246 | audio/5a632246.ogg | 5.44 | The Story of John · fala · john-p1-e04-l07 | bm_george | I enjoy photography, I play football with Peter, and I sometimes go swimming. |
| a2dabb89 | audio/a2dabb89.ogg | 4.5 | The Story of John · fala · john-p1-e04-l08 | bm_lewis | I play squash every Saturday morning. You should come along sometime. |
| 090af7b6 | audio/090af7b6.ogg | 1.37 | The Story of John · fala · john-p1-e04-l09 | bm_george | I'd like that. |
| 521d0429 | audio/521d0429.ogg | 0.83 | The Story of John · item · john-p1-e04-v01 | — | family |
| e8f81c20 | audio/e8f81c20.ogg | 1.37 | The Story of John · item · john-p1-e04-v02 | — | sister, uncle |
| fee13031 | audio/fee13031.ogg | 1.02 | The Story of John · item · john-p1-e04-v03 | — | next to |
| e2a185df | audio/e2a185df.ogg | 1.45 | The Story of John · item · john-p1-e04-v04 | — | in my free time |
| d102b5cc | audio/d102b5cc.ogg | 1.15 | The Story of John · item · john-p1-e04-v05 | — | go swimming |
| 0664beb0 | audio/0664beb0.ogg | 1.05 | The Story of John · item · john-p1-e04-v06 | — | play squash |
| 9d6f4333 | audio/9d6f4333.ogg | 1.64 | The Story of John · item · john-p1-e04-v07 | — | every Saturday morning |
| 06e2150f | audio/06e2150f.ogg | 1.32 | The Story of John · item · john-p1-e04-v09 | — | I'd like that. |
| 2239f84a | audio/2239f84a.ogg | 2.43 | The Story of John · fala · john-p1-e05-l01 | bf_emma | Look! Peter is waiting for us outside. |
| 8e418271 | audio/8e418271.ogg | 2.92 | The Story of John · fala · john-p1-e05-l02 | bm_george | Is he standing by the main entrance? |
| 8cd6812d | audio/8cd6812d.ogg | 1.98 | The Story of John · fala · john-p1-e05-l03 | bf_emma | Yes, and Rick is talking to him. |
| b4f80da9 | audio/b4f80da9.ogg | 2.16 | The Story of John · fala · john-p1-e05-l04 | bm_george | Let's go and say hello. |
| 5177ccd4 | audio/5177ccd4.ogg | 1.69 | The Story of John · fala · john-p1-e05-l05 | bf_emma | They're waving at us now. |
| 2dc1709f | audio/2dc1709f.ogg | 4.54 | The Story of John · fala · john-p1-e06-l01 | bm_lewis | John, this is Ruan Parker. He organises events around the city. |
| 0103dbaf | audio/0103dbaf.ogg | 3.61 | The Story of John · fala · john-p1-e06-l02 | bm_fable | Nice to meet you. Rick has told me a lot about you. |
| 4c10aac2 | audio/4c10aac2.ogg | 1.9 | The Story of John · fala · john-p1-e06-l03 | bm_george | Nice to meet you too. |
| 851a4ff2 | audio/851a4ff2.ogg | 2.54 | The Story of John · fala · john-p1-e06-l04 | bf_isabella | And this is my colleague, Ketlyn Brooks. |
| eae0d2c6 | audio/eae0d2c6.ogg | 4.05 | The Story of John · fala · john-p1-e06-l05 | bf_alice | Hello, everyone. Are you all coming to the family lunch on Sunday? |
| bd450b91 | audio/bd450b91.ogg | 3.56 | The Story of John · fala · john-p1-e06-l06 | bm_george | Yes. My cousin Joana Fletcher is coming as well. |
| 107b911e | audio/107b911e.ogg | 1.98 | The Story of John · fala · john-p1-e06-l07 | bm_lewis | It sounds like a big gathering! |
| ae97e819 | audio/ae97e819.ogg | 3.76 | The Story of John · fala · john-p1-e06-l08 | bm_george | It will be. My family usually gets together at weekends. |
| a030fa5e | audio/a030fa5e.ogg | 1.39 | The Story of John · item · john-p1-e06-v01 | — | organise events |
| 5b155444 | audio/5b155444.ogg | 0.9 | The Story of John · item · john-p1-e06-v02 | — | colleague |
| d378dd78 | audio/d378dd78.ogg | 0.9 | The Story of John · item · john-p1-e06-v03 | — | everyone |
| 5f4253bf | audio/5f4253bf.ogg | 0.9 | The Story of John · item · john-p1-e06-v04 | — | as well |
| 30895ef6 | audio/30895ef6.ogg | 0.88 | The Story of John · item · john-p1-e06-v05 | — | gathering |
| 6547a31f | audio/6547a31f.ogg | 1.05 | The Story of John · item · john-p1-e06-v06 | — | get together |
| 6f745a91 | audio/6f745a91.ogg | 2.18 | The Story of John · fala · john-p1-e07-l01 | bm_george | What are you studying at the moment? |
| 5677799d | audio/5677799d.ogg | 4.22 | The Story of John · fala · john-p1-e07-l02 | bf_alice | I'm studying Business and Commerce at the University of Manchester. |
| cdba5142 | audio/cdba5142.ogg | 1.92 | The Story of John · fala · john-p1-e07-l03 | bm_george | Are you studying full-time? |
| f361a6b6 | audio/f361a6b6.ogg | 3.26 | The Story of John · fala · john-p1-e07-l04 | bf_alice | No. I work during the day and study in the evenings. |
| 317142d3 | audio/317142d3.ogg | 3.37 | The Story of John · fala · john-p1-e07-l05 | bm_george | Perhaps we can meet at the university sometime. |
| 98fb62b0 | audio/98fb62b0.ogg | 1.47 | The Story of John · fala · john-p1-e07-l06 | bf_alice | I'd like that. |
| ab218d8e | audio/ab218d8e.ogg | 1.94 | The Story of John · fala · john-p1-e08-l01 | bm_lewis | What does the greengrocer do? |
| 11581033 | audio/11581033.ogg | 5.01 | The Story of John · fala · john-p1-e08-l02 | bm_george | He sells vegetables. And the electrician is fixing a light over there. |
| 64196aec | audio/64196aec.ogg | 3.29 | The Story of John · fala · john-p1-e08-l03 | bf_emma | The singer is performing now, but she usually works in a theatre. |
| 7fc0d7c0 | audio/7fc0d7c0.ogg | 1.11 | The Story of John · item · john-p1-e08-v01 | — | greengrocer |
| 580d2c59 | audio/580d2c59.ogg | 1.2 | The Story of John · item · john-p1-e08-v02<br>The Story of John · item · john-p2-e02-v07 | — | bus driver |
| 2cd86698 | audio/2cd86698.ogg | 1.58 | The Story of John · item · john-p1-e08-v03<br>The Story of John · item · john-p2-e02-v08 | — | computer programmer |
| f02e91db | audio/f02e91db.ogg | 1.34 | The Story of John · item · john-p1-e08-v04 | — | French teacher |
| 6a3a7f29 | audio/6a3a7f29.ogg | 0.75 | The Story of John · item · john-p1-e08-v05 | — | singer |
| f2307040 | audio/f2307040.ogg | 1 | The Story of John · item · john-p1-e08-v06 | — | watchmaker |
| bd2efc56 | audio/bd2efc56.ogg | 1.07 | The Story of John · item · john-p1-e08-v07<br>The Story of John · item · john-p2-e02-v04 | — | electrician |
| 128b9544 | audio/128b9544.ogg | 0.96 | The Story of John · item · john-p1-e08-v08 | — | fisherman |
| 19bf3b1b | audio/19bf3b1b.ogg | 1.2 | The Story of John · item · john-p1-e08-v10 | — | fix a light |
| 6e95d42f | audio/6e95d42f.ogg | 1.13 | The Story of John · item · john-p1-e08-v11 | — | make a watch |
| c48502bb | audio/c48502bb.ogg | 1.45 | The Story of John · item · john-p1-e08-v12<br>The Story of John · item · john-p2-e02-v12 | — | sell vegetables |
| b66d8dd2 | audio/b66d8dd2.ogg | 1.11 | The Story of John · item · john-p1-e08-v13 | — | drive a bus |
| 5e5bcb2e | audio/5e5bcb2e.ogg | 1.2 | The Story of John · item · john-p1-e08-v14<br>The Story of John · item · john-p2-e02-v11 | — | teach French |
| e6ebae67 | audio/e6ebae67.ogg | 1.54 | The Story of John · item · john-p1-e08-v15 | — | programme computers |
| a271ab05 | audio/a271ab05.ogg | 1.9 | The Story of John · fala · john-p1-e09-l01 | bm_lewis | When did you last see Peter? |
| ce892a3f | audio/ce892a3f.ogg | 2.71 | The Story of John · fala · john-p1-e09-l02 | bm_george | I met him last week at a conference. |
| 9a036563 | audio/9a036563.ogg | 2.6 | The Story of John · fala · john-p1-e09-l03 | bm_lewis | Was he going out with anyone at the time? |
| 52903ab7 | audio/52903ab7.ogg | 2.28 | The Story of John · fala · john-p1-e09-l04 | bm_george | I don't know. He's married now. |
| 448561a8 | audio/448561a8.ogg | 2.9 | The Story of John · fala · john-p2-e01-l01 | bf_emma | Do you usually arrive at the office before nine, John? |
| 10a86920 | audio/10a86920.ogg | 3.44 | The Story of John · fala · john-p2-e01-l02 | bm_george | Yes, I do. I usually get here at half past eight. |
| fcfbb617 | audio/fcfbb617.ogg | 1.49 | The Story of John · fala · john-p2-e01-l03 | bf_emma | What do you do first? |
| ae330c6c | audio/ae330c6c.ogg | 4.48 | The Story of John · fala · john-p2-e01-l04 | bm_george | I check my emails, read the project notes and speak to my team. |
| 0d38ba32 | audio/0d38ba32.ogg | 2.11 | The Story of John · fala · john-p2-e01-l05 | bf_emma | Are you working on the new system today? |
| 87f87c8c | audio/87f87c8c.ogg | 5.72 | The Story of John · fala · john-p2-e01-l06 | bm_george | Yes. I'm checking the figures because the sales team needs the report this afternoon. |
| a82f6e97 | audio/a82f6e97.ogg | 2.99 | The Story of John · fala · john-p2-e01-l07 | bf_emma | I see. I'm preparing the presentation at the moment. |
| c1eeeaf2 | audio/c1eeeaf2.ogg | 3.58 | The Story of John · fala · john-p2-e02-l01 | bm_george | This is Mary Collins. She's a software engineer. |
| 7c9c0f59 | audio/7c9c0f59.ogg | 1.96 | The Story of John · fala · john-p2-e02-l02 | bf_alice | What does she do exactly? |
| b49a299d | audio/b49a299d.ogg | 3.22 | The Story of John · fala · john-p2-e02-l03 | bm_george | She designs and tests computer programmes. |
| 46038317 | audio/46038317.ogg | 4.2 | The Story of John · fala · john-p2-e02-l04 | bf_emma | And John analyses the projects and helps the teams organise their work. |
| 105d702a | audio/105d702a.ogg | 2.33 | The Story of John · fala · john-p2-e02-l05 | bf_alice | Who looks after the office equipment? |
| e350381d | audio/e350381d.ogg | 4.14 | The Story of John · fala · john-p2-e02-l06 | bf_emma | Peter does. He's an electrician, and he repairs electrical appliances. |
| 9f677704 | audio/9f677704.ogg | 1.43 | The Story of John · item · john-p2-e02-v01 | — | car salesperson |
| 10066ae1 | audio/10066ae1.ogg | 0.83 | The Story of John · item · john-p2-e02-v02 | — | pilot |
| 9c3dd718 | audio/9c3dd718.ogg | 1 | The Story of John · item · john-p2-e02-v03 | — | engineer |
| a4430275 | audio/a4430275.ogg | 0.63 | The Story of John · item · john-p2-e02-v05 | — | chef |
| b37f7bc9 | audio/b37f7bc9.ogg | 1.41 | The Story of John · item · john-p2-e02-v06 | — | taxi driver |
| 40a98bc8 | audio/40a98bc8.ogg | 1.62 | The Story of John · item · john-p2-e02-v09 | — | repair appliances |
| ac2c7070 | audio/ac2c7070.ogg | 1.43 | The Story of John · item · john-p2-e02-v10 | — | design engines |
| 6e1740c2 | audio/6e1740c2.ogg | 2.13 | The Story of John · item · john-p2-e02-v13 | — | repair electrical appliances |
| 46d85e2b | audio/46d85e2b.ogg | 2.28 | The Story of John · fala · john-p2-e03-l01 | bm_lewis | Are you still studying in the evenings? |
| b7e6b67c | audio/b7e6b67c.ogg | 3.93 | The Story of John · fala · john-p2-e03-l02 | bm_george | Yes. I'm taking an online course in project management. |
| b443f28a | audio/b443f28a.ogg | 1.94 | The Story of John · fala · john-p2-e03-l03 | bm_lewis | How often do you have classes? |
| 886cf3c3 | audio/886cf3c3.ogg | 4.1 | The Story of John · fala · john-p2-e03-l04 | bm_george | Twice a week. I usually study on Tuesdays and Thursdays. |
| 5a4fa837 | audio/5a4fa837.ogg | 1.88 | The Story of John · fala · john-p2-e03-l05 | bm_lewis | Does it take a lot of time? |
| ad83c0ab | audio/ad83c0ab.ogg | 2.5 | The Story of John · fala · john-p2-e03-l06 | bm_george | It does, but I've learnt a lot so far. |
| e8f81a61 | audio/e8f81a61.ogg | 1.86 | The Story of John · fala · john-p2-e03-l07 | bm_lewis | That's great. Keep going! |
| 84156c8c | audio/84156c8c.ogg | 1.79 | The Story of John · fala · john-p2-e04-l01 | bf_emma | John, are you free for a moment? |
| c7c287c9 | audio/c7c287c9.ogg | 4.05 | The Story of John · fala · john-p2-e04-l02 | bm_george | I'm afraid not. I'm dealing with a problem in the new system. |
| 4c03971e | audio/4c03971e.ogg | 1.79 | The Story of John · fala · john-p2-e04-l03 | bf_emma | Has the team found the cause? |
| 3dc9901d | audio/3dc9901d.ogg | 3.88 | The Story of John · fala · john-p2-e04-l04 | bm_george | Not yet. We've checked the files, but we haven't found the error. |
| a16254b3 | audio/a16254b3.ogg | 2.43 | The Story of John · fala · john-p2-e04-l05 | bf_emma | I can help. I know this part of the system. |
| bce5a950 | audio/bce5a950.ogg | 2.09 | The Story of John · fala · john-p2-e04-l06 | bm_george | Thanks. That would be very helpful. |
| 2c7c9ac5 | audio/2c7c9ac5.ogg | 1.58 | The Story of John · item · john-p2-e04-v01 | — | Are you free for a moment? |
| 55ee6e30 | audio/55ee6e30.ogg | 1.45 | The Story of John · item · john-p2-e04-v02 | — | I'm afraid not. |
| 41682b81 | audio/41682b81.ogg | 1.45 | The Story of John · item · john-p2-e04-v03 | — | deal with a problem |
| 2978e336 | audio/2978e336.ogg | 1.3 | The Story of John · item · john-p2-e04-v04 | — | find the cause |
| 6d9d33dc | audio/6d9d33dc.ogg | 0.98 | The Story of John · item · john-p2-e04-v05 | — | not yet |
| b6e9b90a | audio/b6e9b90a.ogg | 1.41 | The Story of John · item · john-p2-e04-v06 | — | That would be helpful. |
| f6ade166 | audio/f6ade166.ogg | 2.07 | The Story of John · fala · john-p2-e05-l01 | bm_daniel | Are you going straight home, John? |
| 398eda7e | audio/398eda7e.ogg | 4.08 | The Story of John · fala · john-p2-e05-l02 | bm_george | Not today. I'm meeting Rick and Jessy at the sports centre. |
| 68282552 | audio/68282552.ogg | 1.84 | The Story of John · fala · john-p2-e05-l03 | bm_daniel | Do you play football there? |
| b6d31a92 | audio/b6d31a92.ogg | 2.94 | The Story of John · fala · john-p2-e05-l04 | bm_george | Sometimes. Today we're going swimming. |
| aeb814fc | audio/aeb814fc.ogg | 2.22 | The Story of John · fala · john-p2-e05-l05 | bm_daniel | I haven't been swimming for ages. |
| 027030be | audio/027030be.ogg | 1.58 | The Story of John · fala · john-p2-e05-l06 | bm_george | Come with us, then! |
| 455b9003 | audio/455b9003.ogg | 4.33 | The Story of John · fala · john-p2-x01-l01 | bm_george | I usually travel by train, but I sometimes drive to work. |
| 922cfb4b | audio/922cfb4b.ogg | 2.45 | The Story of John · fala · john-p2-x01-l02 | bf_emma | I'm going to visit my aunt this weekend. |
| 6736afe4 | audio/6736afe4.ogg | 0.92 | The Story of John · item · john-p2-x01-v01 | — | always |
| 0391d612 | audio/0391d612.ogg | 0.98 | The Story of John · item · john-p2-x01-v02 | — | usually |
| 9a6320f7 | audio/9a6320f7.ogg | 0.77 | The Story of John · item · john-p2-x01-v03 | — | often |
| 5d689621 | audio/5d689621.ogg | 1.13 | The Story of John · item · john-p2-x01-v04 | — | sometimes |
| 5eef032e | audio/5eef032e.ogg | 0.79 | The Story of John · item · john-p2-x01-v05 | — | rarely |
| 0ac95089 | audio/0ac95089.ogg | 0.75 | The Story of John · item · john-p2-x01-v06 | — | never |
| d37bda53 | audio/d37bda53.ogg | 1.32 | The Story of John · item · john-p2-x01-v07 | — | every Saturday |
| 5df04aa4 | audio/5df04aa4.ogg | 1.17 | The Story of John · item · john-p2-x01-v08 | — | twice a week |
| bad59d74 | audio/bad59d74.ogg | 1.24 | The Story of John · item · john-p2-x01-v09<br>The Story of John · item · john-p3-e03-v03 | — | uncle, aunt |
| d8e3b5c0 | audio/d8e3b5c0.ogg | 5.93 | The Story of John · fala · john-p2-x02-l01 | bm_george | My nephew Rodri is younger than Penelope, but he isn't the youngest person in the family. |
| 04a45ff0 | audio/04a45ff0.ogg | 1.32 | The Story of John · item · john-p2-x02-v01<br>The Story of John · item · john-p3-e03-v04 | — | nephew, niece |
| 7ccfdfdd | audio/7ccfdfdd.ogg | 3.12 | The Story of John · fala · john-p3-e01-l01 | bm_george | Mary, this is my sister, Ana Mitchell. |
| f9956403 | audio/f9956403.ogg | 1.66 | The Story of John · fala · john-p3-e01-l02 | bf_emma | Nice to meet you, Ana. |
| ebe6ccd4 | audio/ebe6ccd4.ogg | 2.88 | The Story of John · fala · john-p3-e01-l03 | bf_lily | Nice to meet you too. Are you John's colleague? |
| 29fb6127 | audio/29fb6127.ogg | 1.62 | The Story of John · fala · john-p3-e01-l04 | bf_emma | Yes. We work together. |
| 0b2b7b49 | audio/0b2b7b49.ogg | 4.22 | The Story of John · fala · john-p3-e01-l05 | bm_george | And this is my uncle, Stuart Hughes. He's my mother's brother. |
| 38353a0d | audio/38353a0d.ogg | 2.33 | The Story of John · fala · john-p3-e01-l06 | bm_daniel | Hello, Mary. Please, sit down. |
| 01e81ea9 | audio/01e81ea9.ogg | 2.01 | The Story of John · fala · john-p3-e01-l07 | bf_emma | Thank you. What a lovely family! |
| 0e9a4541 | audio/0e9a4541.ogg | 2.6 | The Story of John · fala · john-p3-e02-l01 | bm_lewis | Is Stuart your oldest uncle, John? |
| 6b7a971c | audio/6b7a971c.ogg | 4.27 | The Story of John · fala · john-p3-e02-l02 | bm_george | No. He's younger than my uncle Peter, but he's older than my father. |
| 06069b76 | audio/06069b76.ogg | 1.88 | The Story of John · fala · john-p3-e02-l03 | bf_isabella | How old is your sister? |
| befd1a29 | audio/befd1a29.ogg | 2.99 | The Story of John · fala · john-p3-e02-l04 | bm_george | Ana is twenty-eight. I'm thirty-two. |
| 52341fab | audio/52341fab.ogg | 1.86 | The Story of John · fala · john-p3-e02-l05 | bm_lewis | So you're older than Ana. |
| 3ead1e87 | audio/3ead1e87.ogg | 3.29 | The Story of John · fala · john-p3-e02-l06 | bm_george | That's right, but she's the tallest person in our family! |
| 30005ad8 | audio/30005ad8.ogg | 2.56 | The Story of John · fala · john-p3-e03-l01 | bf_isabella | Who is the little girl in this photograph? |
| 9c622ae6 | audio/9c622ae6.ogg | 4.29 | The Story of John · fala · john-p3-e03-l02 | bm_george | She's my niece, Penelope Clarke. She's my sister's daughter. |
| 927eec1f | audio/927eec1f.ogg | 1.58 | The Story of John · fala · john-p3-e03-l03 | bf_emma | And the boy next to her? |
| 7801c0fb | audio/7801c0fb.ogg | 3.88 | The Story of John · fala · john-p3-e03-l04 | bm_george | That's my nephew, Rodri Morgan. He's my brother's son. |
| ce1e2958 | audio/ce1e2958.ogg | 1.66 | The Story of John · fala · john-p3-e03-l05 | bm_lewis | Do they live nearby? |
| dd81d5e0 | audio/dd81d5e0.ogg | 3.26 | The Story of John · fala · john-p3-e03-l06 | bm_george | Yes. Their grandparents live in the same town. |
| 1b43c22c | audio/1b43c22c.ogg | 1.34 | The Story of John · item · john-p3-e03-v01 | — | mother, father |
| 5c07082d | audio/5c07082d.ogg | 1.41 | The Story of John · item · john-p3-e03-v02 | — | brother, sister |
| 3799e184 | audio/3799e184.ogg | 0.83 | The Story of John · item · john-p3-e03-v05 | — | cousin |
| 9e37497b | audio/9e37497b.ogg | 1.69 | The Story of John · item · john-p3-e03-v06 | — | grandson, granddaughter |
| 18126fc2 | audio/18126fc2.ogg | 1.2 | The Story of John · item · john-p3-e03-v07 | — | grandparents |
| ef8af02a | audio/ef8af02a.ogg | 1.05 | The Story of John · item · john-p3-e03-v08 | — | relatives |
| defd411b | audio/defd411b.ogg | 1.13 | The Story of John · item · john-p3-e03-v09 | — | daughter, son |
| 364a45e6 | audio/364a45e6.ogg | 2.39 | The Story of John · fala · john-p3-e04-l01 | bf_emma | Who's that man in the photograph with Rick? |
| 7477c624 | audio/7477c624.ogg | 3.73 | The Story of John · fala · john-p3-e04-l02 | bm_george | That's Peter Walker. He's one of Rick's oldest friends. |
| 085f3766 | audio/085f3766.ogg | 1.92 | The Story of John · fala · john-p3-e04-l03 | bf_emma | Is he the most talkative one? |
| 22c2eb9f | audio/22c2eb9f.ogg | 3.69 | The Story of John · fala · john-p3-e04-l04 | bm_george | Definitely! He's probably the funniest person in the group. |
| 5a26b3e0 | audio/5a26b3e0.ogg | 1.66 | The Story of John · fala · john-p3-e04-l05 | bf_emma | I think Rick is funnier. |
| b126971d | audio/b126971d.ogg | 3.56 | The Story of John · fala · john-p3-e04-l06 | bm_george | Maybe a little, but Peter is more outgoing than Rick. |
| 746979fe | audio/746979fe.ogg | 2.3 | The Story of John · fala · john-p3-e04-l07 | bf_emma | Which one do you prefer spending time with? |
| f6c80a22 | audio/f6c80a22.ogg | 4.29 | The Story of John · fala · john-p3-e04-l08 | bm_george | I like them both. They're different, but they're both great friends. |
| afc550af | audio/afc550af.ogg | 2.13 | The Story of John · fala · john-p3-e05-l01 | bf_isabella | What do you think of the new café? |
| b4b58c12 | audio/b4b58c12.ogg | 2.67 | The Story of John · fala · john-p3-e05-l02 | bm_george | I think it's nicer than the old one. |
| a1b81329 | audio/a1b81329.ogg | 3.84 | The Story of John · fala · john-p3-e05-l03 | bm_lewis | Really? I don't think it's as good as the café near the station. |
| 76c8787a | audio/76c8787a.ogg | 1.79 | The Story of John · fala · john-p3-e05-l04 | bf_emma | Which one do you prefer, then? |
| c0f089a7 | audio/c0f089a7.ogg | 3.9 | The Story of John · fala · john-p3-e05-l05 | bm_lewis | I prefer the one near the station. Their coffee is the best. |
| e2610817 | audio/e2610817.ogg | 1.58 | The Story of John · item · john-p3-e05-v02<br>The Story of John · item · john-p3-x01-v02 | — | Which one do you prefer? |
| 0914b422 | audio/0914b422.ogg | 1.11 | The Story of John · item · john-p3-e05-v03 | — | I prefer |
| 8e43efbc | audio/8e43efbc.ogg | 0.85 | The Story of John · item · john-p3-e05-v04<br>The Story of John · item · john-p3-x01-v03 | — | I think |
| 616bf52f | audio/616bf52f.ogg | 0.81 | The Story of John · item · john-p3-e05-v05<br>The Story of John · item · john-p3-x01-v06 | — | a bit |
| a72838e8 | audio/a72838e8.ogg | 1.43 | The Story of John · item · john-p3-e05-v06<br>The Story of John · item · john-p3-x01-v05 | — | not that handsome |
| 182f2752 | audio/182f2752.ogg | 1.11 | The Story of John · item · john-p3-e05-v07<br>The Story of John · item · john-p3-x01-v09 | — | the nicest |
| 0c2356ae | audio/0c2356ae.ogg | 1.24 | The Story of John · item · john-p3-e05-v08 | — | as good as |
| ea81eea2 | audio/ea81eea2.ogg | 0.73 | The Story of John · item · john-p3-e05-v09 | — | both |
| d38dc88e | audio/d38dc88e.ogg | 2.48 | The Story of John · fala · john-p3-x01-l01 | bf_isabella | What do you think of Rick's new photograph? |
| 0da1f329 | audio/0da1f329.ogg | 4.37 | The Story of John · fala · john-p3-x01-l02 | bm_george | It's nicer than the last one, but Mary's is the most impressive. |
| 32ff3d87 | audio/32ff3d87.ogg | 1.71 | The Story of John · fala · john-p3-x01-l03 | bf_isabella | Which one do you prefer? |
| 66c3829f | audio/66c3829f.ogg | 2.65 | The Story of John · fala · john-p3-x01-l04 | bm_george | I think Mary's is the nicest. |
| 58c13cfd | audio/58c13cfd.ogg | 1.3 | The Story of John · item · john-p3-x01-v04 | — | Come on! |
| 3221528a | audio/3221528a.ogg | 0.88 | The Story of John · item · john-p3-x01-v07 | — | nicer |
| ed1ff2d8 | audio/ed1ff2d8.ogg | 0.77 | The Story of John · item · john-p3-x01-v08 | — | funnier |
| 5c11ddd0 | audio/5c11ddd0.ogg | 1.41 | The Story of John · item · john-p3-x01-v10 | — | more handsome than |
| 9e83e13c | audio/9e83e13c.ogg | 1.34 | The Story of John · item · john-p3-x01-v11 | — | the most handsome |
| 490ae432 | audio/490ae432.ogg | 1.32 | The Story of John · item · john-p3-x01-v12 | — | isn't as as |
| 0bc21638 | audio/0bc21638.ogg | 1.28 | The Story of John · item · john-p3-x01-v13 | — | have ever seen |
| 658d57a9 | audio/658d57a9.ogg | 5.1 | The Story of John · fala · john-p3-x02-l01 | bm_lewis | Ruan is getting married next week. His friends are organising a stag do. |
| dbf57e68 | audio/dbf57e68.ogg | 2.97 | The Story of John · fala · john-p3-x02-l02 | bf_emma | And his future wife is having a hen do with her friends. |
| 083187eb | audio/083187eb.ogg | 2.58 | The Story of John · fala · john-p3-x02-l03 | bm_george | They are going to a nightclub afterwards. |
| 181eafc7 | audio/181eafc7.ogg | 1.05 | The Story of John · item · john-p3-x02-v01 | — | get married |
| 324090a0 | audio/324090a0.ogg | 1.81 | The Story of John · item · john-p3-x02-v02 | — | stag do, stag party |
| a44316ac | audio/a44316ac.ogg | 1.62 | The Story of John · item · john-p3-x02-v03 | — | hen do, hen party |
| 3281069b | audio/3281069b.ogg | 1.26 | The Story of John · item · john-p3-x02-v04 | — | future wife |
| c211046a | audio/c211046a.ogg | 1.56 | The Story of John · item · john-p3-x02-v05 | — | play tricks on someone |
| f40ae28d | audio/f40ae28d.ogg | 1.49 | The Story of John · item · john-p3-x02-v06 | — | go out to a nightclub |
| 44e8e4f5 | audio/44e8e4f5.ogg | 2.09 | The Story of John · fala · john-p4-e01-l01 | bm_lewis | What shall we do on Saturday? |
| a75db40f | audio/a75db40f.ogg | 2.3 | The Story of John · fala · john-p4-e01-l02 | bm_george | We could go to the football match. |
| f2a154ee | audio/f2a154ee.ogg | 2.56 | The Story of John · fala · john-p4-e01-l03 | bf_isabella | Again? Have you got any better ideas? |
| 8da3f4dd | audio/8da3f4dd.ogg | 3.24 | The Story of John · fala · john-p4-e01-l04 | bf_emma | There's a sports event in the park. We could watch the race. |
| e961be69 | audio/e961be69.ogg | 2.82 | The Story of John · fala · john-p4-e01-l05 | bm_lewis | That's a good idea. What time does it start? |
| 213cdda4 | audio/213cdda4.ogg | 1.88 | The Story of John · fala · john-p4-e01-l06 | bf_emma | It starts at half past ten. |
| 9e0722fa | audio/9e0722fa.ogg | 1.32 | The Story of John · item · john-p4-e01-v01 | — | sports event |
| 8ebbc298 | audio/8ebbc298.ogg | 0.75 | The Story of John · item · john-p4-e01-v02<br>The Story of John · item · john-p4-e04-v01<br>The Story of John · item · john-p4-x01-v01 | — | race |
| a5a1ebd7 | audio/a5a1ebd7.ogg | 3.31 | The Story of John · fala · john-p4-e02-l01 | bm_george | Look! The runner in the blue shirt is in first place. |
| 4026d42f | audio/4026d42f.ogg | 2.82 | The Story of John · fala · john-p4-e02-l02 | bm_lewis | He's closely followed by the runner in red. |
| 7d9acb04 | audio/7d9acb04.ogg | 2.5 | The Story of John · fala · john-p4-e02-l03 | bf_isabella | The runner in green is coming up quickly. |
| 71bb9662 | audio/71bb9662.ogg | 2.01 | The Story of John · fala · john-p4-e02-l04 | bf_emma | He's taken up second position! |
| b77f81b8 | audio/b77f81b8.ogg | 3.12 | The Story of John · fala · john-p4-e02-l05 | bm_george | And the runner in red has gone back to third. |
| a63a277b | audio/a63a277b.ogg | 3.09 | The Story of John · fala · john-p4-e02-l06 | bm_lewis | What a finish! The blue runner comes in first. |
| 73c212db | audio/73c212db.ogg | 0.73 | The Story of John · item · john-p4-e02-v01<br>The Story of John · item · john-p4-e03-v01 | — | runner |
| d05ab00a | audio/d05ab00a.ogg | 1.24 | The Story of John · item · john-p4-e02-v02 | — | first place |
| 6e00c345 | audio/6e00c345.ogg | 1.58 | The Story of John · item · john-p4-e02-v03<br>The Story of John · item · john-p4-x01-v02 | — | closely followed by |
| 1c33936e | audio/1c33936e.ogg | 1.22 | The Story of John · item · john-p4-e02-v04 | — | come in first |
| 45b9e230 | audio/45b9e230.ogg | 1.69 | The Story of John · fala · john-p4-e03-l01 | bf_isabella | That was great fun! |
| c1699071 | audio/c1699071.ogg | 2.28 | The Story of John · fala · john-p4-e03-l02 | bm_lewis | The runner in blue was brilliant. |
| ce76a643 | audio/ce76a643.ogg | 2.18 | The Story of John · fala · john-p4-e03-l03 | bm_george | He must train every day. |
| f59851df | audio/f59851df.ogg | 3.14 | The Story of John · fala · john-p4-e03-l04 | bf_emma | Perhaps. But the runner in green kept trying until the end. |
| e940e486 | audio/e940e486.ogg | 2.69 | The Story of John · fala · john-p4-e03-l05 | bm_lewis | That's what matters. You must keep trying. |
| e985698e | audio/e985698e.ogg | 1.94 | The Story of John · fala · john-p4-e03-l06 | bm_george | Shall we get something to eat? |
| aa77de34 | audio/aa77de34.ogg | 1.64 | The Story of John · fala · john-p4-e03-l07 | bf_isabella | Yes. I'm starving! |
| 5041b0df | audio/5041b0df.ogg | 1.24 | The Story of John · item · john-p4-e03-v02 | — | keep trying |
| 86968e37 | audio/86968e37.ogg | 1.05 | The Story of John · item · john-p4-e03-v03 | — | great fun |
| 354a7594 | audio/354a7594.ogg | 1.26 | The Story of John · item · john-p4-e03-v04 | — | I'm starving. |
| 28e6f98d | audio/28e6f98d.ogg | 1.32 | The Story of John · fala · john-p4-e04-l01 | bf_emma | Where shall we go? |
| f335465c | audio/f335465c.ogg | 2.43 | The Story of John · fala · john-p4-e04-l02 | bm_lewis | There's a new restaurant in King Street. |
| 1aec6f21 | audio/1aec6f21.ogg | 3.07 | The Story of John · fala · john-p4-e04-l03 | bm_george | Is it better than the one near the station? |
| 7b9a405b | audio/7b9a405b.ogg | 3.52 | The Story of John · fala · john-p4-e04-l04 | bm_lewis | I haven't tried it yet, but people say it's very good. |
| 6446fada | audio/6446fada.ogg | 1.69 | The Story of John · fala · john-p4-e04-l05 | bf_isabella | Let's give it a try. |
| 8d211f46 | audio/8d211f46.ogg | 2.77 | The Story of John · fala · john-p4-e04-l06 | bf_emma | Good idea. We can talk about the race over lunch. |
| cf67d2c3 | audio/cf67d2c3.ogg | 1.3 | The Story of John · item · john-p4-e04-v02 | — | give it a try |
| a4315057 | audio/a4315057.ogg | 3.22 | The Story of John · fala · john-p4-e05-l01 | bm_george | Are you doing anything next Saturday, Jessy? |
| 8f0f2b05 | audio/8f0f2b05.ogg | 1.86 | The Story of John · fala · john-p4-e05-l02 | bf_isabella | Not that I know of. Why? |
| da3d0195 | audio/da3d0195.ogg | 4.25 | The Story of John · fala · john-p4-e05-l03 | bm_george | We're having a small get-together at my place. Would you like to come? |
| 282706a0 | audio/282706a0.ogg | 1.92 | The Story of John · fala · john-p4-e05-l04 | bf_isabella | I'd love to. What time? |
| c037f032 | audio/c037f032.ogg | 2.77 | The Story of John · fala · john-p4-e05-l05 | bm_george | Around seven. I'll send you the address. |
| a240f606 | audio/a240f606.ogg | 1.66 | The Story of John · fala · john-p4-e05-l06 | bf_isabella | Lovely. See you then! |
| 02822284 | audio/02822284.ogg | 1.13 | The Story of John · item · john-p4-e05-v01 | — | get-together |
| 1b9ae529 | audio/1b9ae529.ogg | 6.44 | The Story of John · fala · john-p4-x01-l01 | bm_fable | Number seven gets a good start and takes first position, closely followed by number four in second place. |
| adff21f8 | audio/adff21f8.ogg | 4.86 | The Story of John · fala · john-p4-x01-l02 | bm_fable | Number one moves up into third place, while number three drops back to fifth. |
| 571213a0 | audio/571213a0.ogg | 5.38 | The Story of John · fala · john-p4-x01-l03 | bm_fable | Number seven has won the race! Number one is second, and number four comes in third. |
| ca998c99 | audio/ca998c99.ogg | 1.32 | The Story of John · item · john-p4-x01-v03 | — | get a good start |
| dd1bdccb | audio/dd1bdccb.ogg | 1.54 | The Story of John · item · john-p4-x01-v04 | — | take first position |
| 9c9af9fc | audio/9c9af9fc.ogg | 1.47 | The Story of John · item · john-p4-x01-v05 | — | move up into third |
| bf797525 | audio/bf797525.ogg | 1.41 | The Story of John · item · john-p4-x01-v06 | — | drop back to fifth |
| 3987e179 | audio/3987e179.ogg | 1.26 | The Story of John · item · john-p4-x01-v07 | — | come in third |
| 37b08f66 | audio/37b08f66.ogg | 2.77 | The Story of John · fala · john-p5-e01-l01 | bf_alice | Mr Walker is on the phone for you, Mary. |
| 582564c9 | audio/582564c9.ogg | 2.11 | The Story of John · fala · john-p5-e01-l02 | bf_emma | Thank you. Could you put him through, please? |
| 64f93907 | audio/64f93907.ogg | 1.24 | The Story of John · fala · john-p5-e01-l03 | bf_alice | Certainly. |
| 7012631b | audio/7012631b.ogg | 2.33 | The Story of John · fala · john-p5-e01-l04 | bf_emma | Hello, Mr Walker. How are you today? |
| f8050ceb | audio/f8050ceb.ogg | 4.57 | The Story of John · fala · john-p5-e01-l05 | bm_daniel | Very well, thank you. I'm hoping you could advise me on a new computer system. |
| 055dc4e7 | audio/055dc4e7.ogg | 1.96 | The Story of John · fala · john-p5-e01-l06 | bf_emma | Of course. What would you like to know? |
| 19dc098b | audio/19dc098b.ogg | 2.92 | The Story of John · fala · john-p5-e01-l07 | bm_daniel | Which of your products would most suit a small business? |
| f8981ef4 | audio/f8981ef4.ogg | 3.82 | The Story of John · fala · john-p5-e01-l08 | bf_emma | I can explain the options. Could you meet me later this afternoon? |
| f1385f41 | audio/f1385f41.ogg | 3.78 | The Story of John · fala · john-p5-e01-l09 | bm_daniel | Yes. I'm free at about half past five. Is that all right with you? |
| 4f7a26e1 | audio/4f7a26e1.ogg | 4.08 | The Story of John · fala · john-p5-e01-l10 | bf_emma | That's fine. How about the Palace Hotel? They have a wonderful restaurant. |
| c5bade8f | audio/c5bade8f.ogg | 3.07 | The Story of John · fala · john-p5-e01-l11 | bm_daniel | That sounds good. I'll see you there at half five, then. |
| 4e6d0eeb | audio/4e6d0eeb.ogg | 1.07 | The Story of John · item · john-p5-e01-v01 | — | on the phone |
| b0dc92ef | audio/b0dc92ef.ogg | 1.37 | The Story of John · item · john-p5-e01-v02 | — | put someone through |
| 8f46df5f | audio/8f46df5f.ogg | 1.71 | The Story of John · item · john-p5-e01-v03 | — | The line is engaged. |
| 13559cdb | audio/13559cdb.ogg | 1.2 | The Story of John · item · john-p5-e01-v04 | — | He hung up. |
| 7497cc43 | audio/7497cc43.ogg | 1.49 | The Story of John · item · john-p5-e01-v05 | — | hold on, please |
| f7aa2578 | audio/f7aa2578.ogg | 1.54 | The Story of John · item · john-p5-e01-v06 | — | What can I do for you? |
| f088e1b2 | audio/f088e1b2.ogg | 1.34 | The Story of John · item · john-p5-e01-v07 | — | advise me on |
| be48eec5 | audio/be48eec5.ogg | 1.56 | The Story of John · item · john-p5-e01-v08 | — | suit my company |
| 447db0b3 | audio/447db0b3.ogg | 1.34 | The Story of John · item · john-p5-e01-v09 | — | I'll see you there. |
| 2746e833 | audio/2746e833.ogg | 2.73 | The Story of John · fala · john-p5-e02-l01 | bm_george | Mary, are you available tomorrow morning? |
| 05e050b9 | audio/05e050b9.ogg | 2.24 | The Story of John · fala · john-p5-e02-l02 | bf_emma | It depends. What time are you thinking of? |
| dec2e1f2 | audio/dec2e1f2.ogg | 1.81 | The Story of John · fala · john-p5-e02-l03 | bm_george | Could we meet at nine? |
| d1530800 | audio/d1530800.ogg | 4.27 | The Story of John · fala · john-p5-e02-l04 | bf_emma | I'm afraid I can't make it at nine. Could we meet at half past nine instead? |
| d10c8ca9 | audio/d10c8ca9.ogg | 1.52 | The Story of John · fala · john-p5-e02-l05 | bm_george | That would suit me. |
| dfe34229 | audio/dfe34229.ogg | 1.69 | The Story of John · fala · john-p5-e02-l06 | bf_emma | Shall I book a meeting room? |
| 45d8b1d3 | audio/45d8b1d3.ogg | 2.67 | The Story of John · fala · john-p5-e02-l07 | bm_george | Yes, please. Thanks for arranging it. |
| 6e29a919 | audio/6e29a919.ogg | 1.79 | The Story of John · fala · john-p5-e03-l01 | bm_lewis | Where can we go next Friday? |
| 020b0b42 | audio/020b0b42.ogg | 2.09 | The Story of John · fala · john-p5-e03-l02 | bm_george | We could go to the cinema. |
| efde71a6 | audio/efde71a6.ogg | 3.12 | The Story of John · fala · john-p5-e03-l03 | bf_isabella | The cinema again? Have you got any better ideas? |
| 03d2e8ed | audio/03d2e8ed.ogg | 2.84 | The Story of John · fala · john-p5-e03-l04 | bf_emma | There's a new club that has just opened in Duke Street. |
| 574b05a8 | audio/574b05a8.ogg | 1.07 | The Story of John · fala · john-p5-e03-l05 | bm_lewis | Where's that? |
| b46113ea | audio/b46113ea.ogg | 3.71 | The Story of John · fala · john-p5-e03-l06 | bf_emma | Near the old library. How about meeting there at half past eight? |
| 2b8bc786 | audio/2b8bc786.ogg | 2.54 | The Story of John · fala · john-p5-e03-l07 | bm_george | That sounds good. I'll see you there. |
| 22f89a61 | audio/22f89a61.ogg | 2.35 | The Story of John · fala · john-p5-e04-l01 | bf_isabella | Are we still meeting at the Palace Hotel? |
| 0ff14e5a | audio/0ff14e5a.ogg | 2.35 | The Story of John · fala · john-p5-e04-l02 | bf_emma | Yes. I've booked a table for six people. |
| 44b417e5 | audio/44b417e5.ogg | 1.73 | The Story of John · fala · john-p5-e04-l03 | bm_lewis | What time should we arrive? |
| 76d2a4fc | audio/76d2a4fc.ogg | 1.86 | The Story of John · fala · john-p5-e04-l04 | bf_emma | At about half past five. |
| aea604b2 | audio/aea604b2.ogg | 2.58 | The Story of John · fala · john-p5-e04-l05 | bm_george | Perfect. I'll be there a little early. |
| fec2ff2a | audio/fec2ff2a.ogg | 2.2 | The Story of John · fala · john-p6-e01-l01 | bf_emma | You need something smart for the meeting. |
| a3007b12 | audio/a3007b12.ogg | 2.62 | The Story of John · fala · john-p6-e01-l02 | bm_george | I know. I haven't bought a suit for years. |
| dd485a3b | audio/dd485a3b.ogg | 2.48 | The Story of John · fala · john-p6-e01-l03 | bf_emma | There's a good clothes shop in the city centre. |
| 9714400f | audio/9714400f.ogg | 2.28 | The Story of John · fala · john-p6-e01-l04 | bm_george | Shall we have a look this afternoon? |
| 14b96702 | audio/14b96702.ogg | 1.96 | The Story of John · fala · john-p6-e01-l05 | bf_emma | Certainly. I can help you choose. |
| 2356e28d | audio/2356e28d.ogg | 1.2 | The Story of John · item · john-p6-e01-v01 | — | clothes shop |
| 2e2f8980 | audio/2e2f8980.ogg | 0.73 | The Story of John · item · john-p6-e01-v02<br>The Story of John · item · john-p6-e02-v01<br>The Story of John · item · john-p6-e04-v01<br>The Story of John · item · john-p6-e05-v01 | — | suit |
| ae97e7d2 | audio/ae97e7d2.ogg | 0.79 | The Story of John · item · john-p6-e01-v03<br>The Story of John · item · john-p6-e05-v04 | — | smart |
| 289c6827 | audio/289c6827.ogg | 2.22 | The Story of John · fala · john-p6-e02-l01 | bf_alice | Good afternoon. Can I help you? |
| 5e20ed1b | audio/5e20ed1b.ogg | 3.61 | The Story of John · fala · john-p6-e02-l02 | bm_george | Yes, please. I'm looking for a suit for a business meeting. |
| cb2dca8d | audio/cb2dca8d.ogg | 1.71 | The Story of John · fala · john-p6-e02-l03 | bf_alice | What size are you? |
| 169e93f6 | audio/169e93f6.ogg | 2.71 | The Story of John · fala · john-p6-e02-l04 | bm_george | I'm not sure. Could I try this one on? |
| 2834a834 | audio/2834a834.ogg | 2.86 | The Story of John · fala · john-p6-e02-l05 | bf_alice | Of course. The changing rooms are over here. |
| b97ad7e2 | audio/b97ad7e2.ogg | 4.29 | The Story of John · fala · john-p6-e02-l06 | bm_george | This jacket is a little too large. Have you got a smaller size? |
| 8991a948 | audio/8991a948.ogg | 1.71 | The Story of John · fala · john-p6-e02-l07 | bf_alice | I'll have a look for you. |
| 56297709 | audio/56297709.ogg | 1.49 | The Story of John · fala · john-p6-e02-l08 | bf_emma | That colour suits you. |
| 69075ddd | audio/69075ddd.ogg | 2.9 | The Story of John · fala · john-p6-e02-l09 | bm_george | Do you think so? I'll try the shirt as well. |
| 100e165b | audio/100e165b.ogg | 0.88 | The Story of John · item · john-p6-e02-v02 | — | jacket |
| 43e36503 | audio/43e36503.ogg | 0.73 | The Story of John · item · john-p6-e02-v03<br>The Story of John · item · john-p6-e03-v01<br>The Story of John · item · john-p6-e04-v02<br>The Story of John · item · john-p6-e05-v02 | — | shirt |
| 23a0d95c | audio/23a0d95c.ogg | 0.81 | The Story of John · item · john-p6-e02-v04<br>The Story of John · item · john-p6-e03-v02 | — | size |
| 1f48fa68 | audio/1f48fa68.ogg | 1.49 | The Story of John · item · john-p6-e02-v05 | — | smaller, larger |
| a8be2031 | audio/a8be2031.ogg | 1.28 | The Story of John · item · john-p6-e02-v06<br>The Story of John · item · john-p6-e03-v03 | — | changing room |
| 6f3c33a3 | audio/6f3c33a3.ogg | 1.02 | The Story of John · item · john-p6-e02-v07<br>The Story of John · item · john-p6-e03-v04<br>The Story of John · item · john-p6-e05-v03 | — | try on |
| 92d01611 | audio/92d01611.ogg | 0.85 | The Story of John · item · john-p6-e02-v08 | — | look for |
| 10a09ff3 | audio/10a09ff3.ogg | 1.09 | The Story of John · item · john-p6-e02-v09<br>The Story of John · item · john-p6-e03-v05 | — | over here |
| 3ab945c2 | audio/3ab945c2.ogg | 3.22 | The Story of John · fala · john-p6-e03-l01 | bm_george | Excuse me. Could you show me a blue shirt, please? |
| a0db3ac2 | audio/a0db3ac2.ogg | 2.26 | The Story of John · fala · john-p6-e03-l02 | bf_alice | Certainly. What size would you like? |
| 19327e22 | audio/19327e22.ogg | 2.13 | The Story of John · fala · john-p6-e03-l03 | bm_george | A medium, if you have one. |
| 646ec7dd | audio/646ec7dd.ogg | 2.52 | The Story of John · fala · john-p6-e03-l04 | bf_alice | Here you are. Would you like to try it on? |
| c60626be | audio/c60626be.ogg | 2.48 | The Story of John · fala · john-p6-e03-l05 | bm_george | Yes, please. Where can I change? |
| c8fca05c | audio/c8fca05c.ogg | 2.41 | The Story of John · fala · john-p6-e03-l06 | bf_alice | The changing rooms are over here. |
| 33959c2b | audio/33959c2b.ogg | 1.11 | The Story of John · fala · john-p6-e03-l07 | bm_george | Thank you. |
| a1de6de2 | audio/a1de6de2.ogg | 2.07 | The Story of John · fala · john-p6-e04-l01 | bf_emma | How about this dark blue suit? |
| 7e03fe4e | audio/7e03fe4e.ogg | 2.77 | The Story of John · fala · john-p6-e04-l02 | bm_george | I like it, but the grey one is cheaper. |
| bbc9c209 | audio/bbc9c209.ogg | 1.84 | The Story of John · fala · john-p6-e04-l03 | bf_emma | The blue one looks smarter, though. |
| cfcf6e72 | audio/cfcf6e72.ogg | 2.24 | The Story of John · fala · john-p6-e04-l04 | bm_george | You're right. I think I'll take it. |
| 4173f4c5 | audio/4173f4c5.ogg | 2.05 | The Story of John · fala · john-p6-e04-l05 | bf_alice | Would you like anything else? |
| 737f0a1a | audio/737f0a1a.ogg | 2.94 | The Story of John · fala · john-p6-e04-l06 | bm_george | No, thank you. Just the suit and the shirt. |
| 5c4cf4f7 | audio/5c4cf4f7.ogg | 0.79 | The Story of John · item · john-p6-e04-v03 | — | cheaper |
| 101328bf | audio/101328bf.ogg | 2.39 | The Story of John · fala · john-p6-e05-l01 | bm_lewis | Have you got everything for the meeting? |
| 63f947b4 | audio/63f947b4.ogg | 2.73 | The Story of John · fala · john-p6-e05-l02 | bm_george | Almost. I've bought a suit and a shirt. |
| f7506220 | audio/f7506220.ogg | 1.43 | The Story of John · fala · john-p6-e05-l03 | bm_lewis | Have you tried them on? |
| ef02c690 | audio/ef02c690.ogg | 1.96 | The Story of John · fala · john-p6-e05-l04 | bm_george | Yes. They fit perfectly. |
| 27cd007e | audio/27cd007e.ogg | 2.07 | The Story of John · fala · john-p6-e05-l05 | bm_lewis | Great. You'll look very smart. |
| 60751b12 | audio/60751b12.ogg | 2.09 | The Story of John · fala · john-p7-e01-l01 | bf_emma | Have you booked your train ticket yet? |
| c11afa05 | audio/c11afa05.ogg | 2.77 | The Story of John · fala · john-p7-e01-l02 | bm_george | Not yet. I'm checking the times now. |
| 786f0458 | audio/786f0458.ogg | 2.11 | The Story of John · fala · john-p7-e01-l03 | bf_emma | There are several trains in the morning. |
| 5d33c638 | audio/5d33c638.ogg | 2.56 | The Story of John · fala · john-p7-e01-l04 | bm_george | I'd like to get there before eleven. |
| 33f9c463 | audio/33f9c463.ogg | 2.24 | The Story of John · fala · john-p7-e01-l05 | bf_emma | You could take the 8.20 train. |
| c50caa80 | audio/c50caa80.ogg | 3.35 | The Story of John · fala · john-p7-e01-l06 | bm_george | That would be ideal. How long does the journey take? |
| 74063276 | audio/74063276.ogg | 1.88 | The Story of John · fala · john-p7-e01-l07 | bf_emma | About two and a half hours. |
| aeabb68d | audio/aeabb68d.ogg | 0.92 | The Story of John · item · john-p7-e01-v01 | — | get there |
| bf7c60d9 | audio/bf7c60d9.ogg | 3.82 | The Story of John · fala · john-p7-e02-l01 | bm_george | Excuse me. Could you tell me how to get to the railway station? |
| d3f455cd | audio/d3f455cd.ogg | 3.48 | The Story of John · fala · john-p7-e02-l02 | bf_alice | Certainly. Go straight on and turn left at the traffic lights. |
| 88782683 | audio/88782683.ogg | 1.64 | The Story of John · fala · john-p7-e02-l03 | bm_george | Is it far from here? |
| df45bde8 | audio/df45bde8.ogg | 2.52 | The Story of John · fala · john-p7-e02-l04 | bf_alice | No, it's about ten minutes on foot. |
| 1fb58e68 | audio/1fb58e68.ogg | 1.66 | The Story of John · fala · john-p7-e02-l05 | bm_george | Thank you very much. |
| b7a600f4 | audio/b7a600f4.ogg | 1.41 | The Story of John · item · john-p7-e02-v01 | — | railway station |
| 7f5ca2bc | audio/7f5ca2bc.ogg | 1.3 | The Story of John · item · john-p7-e02-v02 | — | go straight on |
| ab302afb | audio/ab302afb.ogg | 1.37 | The Story of John · item · john-p7-e02-v03 | — | turn left, right |
| 77b436ff | audio/77b436ff.ogg | 1.2 | The Story of John · item · john-p7-e02-v04 | — | traffic lights |
| aa7a8694 | audio/aa7a8694.ogg | 0.88 | The Story of John · item · john-p7-e02-v05 | — | on foot |
| 035356aa | audio/035356aa.ogg | 0.94 | The Story of John · item · john-p7-e02-v06 | — | nearby |
| bc1216f3 | audio/bc1216f3.ogg | 1.45 | The Story of John · item · john-p7-e02-v07 | — | How do I get to? |
| 5473c0c0 | audio/5473c0c0.ogg | 0.71 | The Story of John · item · john-p7-e02-v08<br>The Story of John · item · john-p7-e03-v01 | — | leave |
| d47ee35b | audio/d47ee35b.ogg | 2.65 | The Story of John · fala · john-p7-e03-l01 | bm_george | Where can I find the departure board? |
| 0652e83c | audio/0652e83c.ogg | 2.84 | The Story of John · fala · john-p7-e03-l02 | bf_alice | It's just over there, next to platform three. |
| f6d9cc87 | audio/f6d9cc87.ogg | 4.05 | The Story of John · fala · john-p7-e03-l03 | bm_george | Could you tell me which platform the Edinburgh train leaves from? |
| 65caf46d | audio/65caf46d.ogg | 3.09 | The Story of John · fala · john-p7-e03-l04 | bf_alice | Platform five. It leaves at twenty past eight. |
| 98bbee6a | audio/98bbee6a.ogg | 2.37 | The Story of John · fala · john-p7-e03-l05 | bm_george | Thank you. Is the train direct? |
| 67841f4e | audio/67841f4e.ogg | 1.47 | The Story of John · fala · john-p7-e03-l06 | bf_alice | Yes, it is. |
| 4df96ca3 | audio/4df96ca3.ogg | 1.49 | The Story of John · item · john-p7-e03-v02 | — | departure board |
| 2a4a32b2 | audio/2a4a32b2.ogg | 0.98 | The Story of John · item · john-p7-e03-v03 | — | platform |
| c7bd3cd3 | audio/c7bd3cd3.ogg | 6.32 | The Story of John · fala · john-p7-e04-l01 | bf_alice | The 8.20 service to Edinburgh is delayed by ten minutes. We apologise for the inconvenience. |
| 21e59acd | audio/21e59acd.ogg | 2.22 | The Story of John · fala · john-p7-e04-l02 | bm_george | Oh, no. Is it always late? |
| 408fb877 | audio/408fb877.ogg | 1.26 | The Story of John · fala · john-p7-e04-l03 | bf_emma | What's happened? |
| 28f7b43c | audio/28f7b43c.ogg | 4.29 | The Story of John · fala · john-p7-e04-l04 | bm_george | The train is delayed. They're saying it'll be another ten minutes. |
| d6698657 | audio/d6698657.ogg | 2.52 | The Story of John · fala · john-p7-e04-l05 | bf_emma | That's inconvenient. Have you asked the staff? |
| 51fb4331 | audio/51fb4331.ogg | 3.71 | The Story of John · fala · john-p7-e04-l06 | bm_george | Not yet. I'll speak to someone at the information desk. |
| fbcfd862 | audio/fbcfd862.ogg | 3.44 | The Story of John · fala · john-p7-e05-l01 | bm_george | Excuse me. Is there another train to Edinburgh? |
| 3e8a6610 | audio/3e8a6610.ogg | 4.18 | The Story of John · fala · john-p7-e05-l02 | bf_alice | There's one at 9.05, but it stops at several stations. |
| cde57a18 | audio/cde57a18.ogg | 2.6 | The Story of John · fala · john-p7-e05-l03 | bm_george | Would I still arrive before eleven? |
| 8ad84a1e | audio/8ad84a1e.ogg | 3.46 | The Story of John · fala · john-p7-e05-l04 | bf_alice | I'm afraid not. You'd arrive at about half past eleven. |
| 51e75cbe | audio/51e75cbe.ogg | 3.12 | The Story of John · fala · john-p7-e05-l05 | bm_george | I see. I'll wait for the direct service, then. |
| 99451bf0 | audio/99451bf0.ogg | 1.96 | The Story of John · fala · john-p7-e05-l06 | bf_alice | It should be here shortly. |
| 57702d47 | audio/57702d47.ogg | 1.54 | The Story of John · item · john-p7-e05-v01 | — | direct service |
| 687c5cbd | audio/687c5cbd.ogg | 2.13 | The Story of John · fala · john-p7-e06-l01 | bf_alice | Good morning. How can I help you? |
| 689cb7e6 | audio/689cb7e6.ogg | 2.86 | The Story of John · fala · john-p7-e06-l02 | bm_george | I'd like to book a flight to Boston, please. |
| 2edf1c92 | audio/2edf1c92.ogg | 2.39 | The Story of John · fala · john-p7-e06-l03 | bf_alice | Certainly. When would you like to travel? |
| 07ef1447 | audio/07ef1447.ogg | 3.95 | The Story of John · fala · john-p7-e06-l04 | bm_george | Next Thursday, if possible. Have you got any early flights? |
| b7372e84 | audio/b7372e84.ogg | 5.57 | The Story of John · fala · john-p7-e06-l05 | bf_alice | We have a flight at around nine o'clock. There are also several charter flights later in the day. |
| 88cdf1d2 | audio/88cdf1d2.ogg | 2.62 | The Story of John · fala · john-p7-e06-l06 | bm_george | The early flight would suit me better. |
| f8a06e5b | audio/f8a06e5b.ogg | 2.01 | The Story of John · fala · john-p7-e06-l07 | bf_alice | Would you like me to book it? |
| 8e6afd31 | audio/8e6afd31.ogg | 1.34 | The Story of John · fala · john-p7-e06-l08 | bm_george | Yes, please. |
| bcaf0b5c | audio/bcaf0b5c.ogg | 1.75 | The Story of John · fala · john-p7-e07-l01 | bf_emma | Have you checked in online? |
| accc00d0 | audio/accc00d0.ogg | 2.88 | The Story of John · fala · john-p7-e07-l02 | bm_george | Yes. I only need to drop off my suitcase. |
| 417c471f | audio/417c471f.ogg | 1.54 | The Story of John · fala · john-p7-e07-l03 | bf_emma | What time do you board? |
| fcd99446 | audio/fcd99446.ogg | 3.31 | The Story of John · fala · john-p7-e07-l04 | bm_george | At eight twenty. I should get to the gate by eight. |
| 432f9c88 | audio/432f9c88.ogg | 2.24 | The Story of John · fala · john-p7-e07-l05 | bf_emma | Don't forget to pick up your passport. |
| e6b85601 | audio/e6b85601.ogg | 2.88 | The Story of John · fala · john-p7-e07-l06 | bm_george | It's in my bag. Thanks for reminding me. |
| b9d08f15 | audio/b9d08f15.ogg | 0.85 | The Story of John · item · john-p7-e07-v01 | — | pick up |
| 0fea38fe | audio/0fea38fe.ogg | 0.94 | The Story of John · item · john-p7-e07-v02 | — | check in |
| a9811e62 | audio/a9811e62.ogg | 3.41 | The Story of John · fala · john-p7-x01-l01 | bm_george | Could you tell me how much further it is to the station? |
| 292d6e8e | audio/292d6e8e.ogg | 3.67 | The Story of John · fala · john-p7-x01-l02 | bf_alice | It isn't much further. Keep walking until you see the bus stop. |
| b36f424f | audio/b36f424f.ogg | 4.89 | The Story of John · fala · john-p7-x01-l03 | bm_george | I'd like to make a complaint about the service. The train is two hours late. |
| ad0244fa | audio/ad0244fa.ogg | 3.69 | The Story of John · fala · john-p7-x01-l04 | bf_alice | I'm sorry. I'll check the timetable and explain the delay. |
| 4032b1b5 | audio/4032b1b5.ogg | 1.56 | The Story of John · item · john-p7-x01-v01 | — | get on a train, bus |
| b65ec06b | audio/b65ec06b.ogg | 1.58 | The Story of John · item · john-p7-x01-v02 | — | get off a train, bus |
| b567587d | audio/b567587d.ogg | 1.41 | The Story of John · item · john-p7-x01-v03 | — | make a complaint |

---

# Anexo D — Pendências, divergências e duplicidades de The Story of John

Seções de `docs/conteudo-dialogos/pendencias.md` referentes a The Story of John (literal). Nada foi corrigido.

## The Story of John — versão (2)

| Referência | Detalhe |
|---|---|
| contentVersion | john.json 2175ff859f35 × data/dialogues.js 118297cacc48 |
| john-report.json | relatório gerado na versão 2175ff859f35; app na 118297cacc48 (o relatório pode estar desatualizado em relação ao pacote) |

## The Story of John — fala corrigida (registro) (6)

| Referência | Detalhe |
|---|---|
| john-p1-e01-l01 | original: Do you remember John Bennett? → usado: John Bennett? Do you remember me? |
| john-p1-e09-l01 | original: Did you meet Peter at the university? → usado: When did you last see Peter? |
| john-p1-e09-l02 | original: Yes, I met him last week at a conference. → usado: I met him last week at a conference. |
| john-p5-e04-l02 | original: Yes. I've booked a table for six. → usado: Yes. I've booked a table for six people. |
| john-p7-e01-l05 | original: You could take the 8.40 train. → usado: You could take the 8.20 train. |
| john-p7-e01-l07 | original: About three and a half hours. → usado: About two and a half hours. |

## The Story of John — item não aparece literalmente nas falas da atividade (58)

| Referência | Detalhe |
|---|---|
| john-p1-e01-v02 | work for a company |
| john-p1-e02-v04 | cover a match |
| john-p1-e02-v07 | solve a problem |
| john-p1-e02-v08 | be good at |
| john-p1-e08-v02 | bus driver |
| john-p1-e08-v03 | computer programmer |
| john-p1-e08-v04 | French teacher |
| john-p1-e08-v06 | watchmaker |
| john-p1-e08-v08 | fisherman |
| john-p1-e08-v09 | sports photographer |
| john-p1-e08-v11 | make a watch |
| john-p1-e08-v13 | drive a bus |
| john-p1-e08-v14 | teach French |
| john-p1-e08-v15 | programme computers |
| john-p2-e02-v01 | car salesperson |
| john-p2-e02-v02 | pilot |
| john-p2-e02-v05 | chef |
| john-p2-e02-v06 | taxi driver |
| john-p2-e02-v07 | bus driver |
| john-p2-e02-v08 | computer programmer |
| john-p2-e02-v10 | design engines |
| john-p2-e02-v11 | teach French |
| john-p2-e02-v12 | sell vegetables |
| john-p2-e04-v04 | find the cause |
| john-p2-e04-v06 | That would be helpful. |
| john-p2-x01-v01 | always |
| john-p2-x01-v03 | often |
| john-p2-x01-v05 | rarely |
| john-p2-x01-v06 | never |
| john-p2-x01-v07 | every Saturday |
| john-p2-x01-v08 | twice a week |
| john-p3-e03-v01 | mother / father |
| john-p3-e03-v02 | brother / sister |
| john-p3-e03-v03 | uncle / aunt |
| john-p3-e03-v05 | cousin |
| john-p3-e03-v06 | grandson / granddaughter |
| john-p3-e03-v08 | relatives |
| john-p3-e05-v05 | a bit |
| john-p3-e05-v06 | not that handsome |
| john-p3-e05-v07 | the nicest |
| john-p3-e05-v09 | both |
| john-p3-x01-v04 | Come on! |
| john-p3-x01-v05 | not that handsome |
| john-p3-x01-v06 | a bit |
| john-p3-x01-v08 | funnier |
| john-p3-x01-v10 | more handsome than |
| john-p3-x01-v11 | the most handsome |
| john-p3-x01-v12 | isn't as ... as |
| john-p3-x01-v13 | have ever seen |
| john-p3-x02-v05 | play tricks on someone |
| john-p3-x02-v06 | go out to a nightclub |
| john-p5-e01-v03 | The line is engaged. |
| john-p5-e01-v04 | He hung up. |
| john-p5-e01-v05 | hold on, please |
| john-p5-e01-v06 | What can I do for you? |
| john-p5-e01-v08 | suit my company |
| john-p7-e02-v06 | nearby |
| john-p7-e02-v07 | How do I get to...? |

## The Story of John — atividade sem itens de vocabulário (15)

| Referência | Detalhe |
|---|---|
| john-p1-e03 | A little about John |
| john-p1-e05 | What are they doing? |
| john-p1-e07 | A university course |
| john-p1-e09 | Past events and relationships |
| john-p2-e01 | A typical working day |
| john-p2-e03 | Studying after work |
| john-p2-e05 | After work |
| john-p3-e01 | Sunday lunch |
| john-p3-e02 | Who is older? |
| john-p3-e04 | A story about two friends |
| john-p5-e02 | Making arrangements |
| john-p5-e03 | A social invitation |
| john-p5-e04 | Confirming the details |
| john-p7-e04 | The delay |
| john-p7-e06 | A different journey: booking a flight |

## The Story of John — item duplicado (mesmo inglês) (26)

| Referência | Detalhe |
|---|---|
| john-p1-e02-v03, john-p1-e08-v09 | sports photographer |
| john-p1-e06-v06, john-p4-e05-v01 | get together |
| john-p1-e08-v02, john-p2-e02-v07 | bus driver |
| john-p1-e08-v03, john-p2-e02-v08 | computer programmer |
| john-p1-e08-v07, john-p2-e02-v04 | electrician |
| john-p1-e08-v12, john-p2-e02-v12 | sell vegetables |
| john-p1-e08-v14, john-p2-e02-v11 | teach french |
| john-p3-e03-v03, john-p2-x01-v09 | uncle aunt |
| john-p3-e03-v04, john-p2-x02-v01 | nephew niece |
| john-p3-e05-v01, john-p3-x01-v01 | what do you think of |
| john-p3-e05-v02, john-p3-x01-v02 | which one do you prefer |
| john-p3-e05-v04, john-p3-x01-v03 | i think |
| john-p3-e05-v05, john-p3-x01-v06 | a bit |
| john-p3-e05-v06, john-p3-x01-v05 | not that handsome |
| john-p3-e05-v07, john-p3-x01-v09 | the nicest |
| john-p4-e01-v02, john-p4-e04-v01, john-p4-x01-v01 | race |
| john-p4-e02-v01, john-p4-e03-v01 | runner |
| john-p4-e02-v03, john-p4-x01-v02 | closely followed by |
| john-p6-e01-v02, john-p6-e02-v01, john-p6-e04-v01, john-p6-e05-v01 | suit |
| john-p6-e02-v03, john-p6-e03-v01, john-p6-e04-v02, john-p6-e05-v02 | shirt |
| john-p6-e02-v04, john-p6-e03-v02 | size |
| john-p6-e02-v06, john-p6-e03-v03 | changing room |
| john-p6-e02-v07, john-p6-e03-v04, john-p6-e05-v03 | try on |
| john-p6-e02-v09, john-p6-e03-v05 | over here |
| john-p6-e01-v03, john-p6-e05-v04 | smart |
| john-p7-e02-v08, john-p7-e03-v01 | leave |

## The Story of John — fala repetida (mesmo inglês) (1)

| Referência | Detalhe |
|---|---|
| john-p1-e04-l09, john-p1-e07-l06 | i'd like that |

## The Story of John — questão repetida (mesmo enunciado) (20)

| Referência | Detalhe |
|---|---|
| john-p1-e02-q06, john-p2-e02-q02 | what is mary's job |
| john-p1-e03-q10, john-p2-e05-q10, john-p4-e03-q10 | when does this conversation happen |
| john-p1-e04-q09, john-p4-e04-q02 | what does rick suggest |
| john-p1-e05-q05, john-p1-e07-q07, john-p2-e05-q08, john-p4-e01-q02, john-p4-e03-q08, john-p5-e03-q02, john-p6-e01-q05 | what does john suggest |
| john-p1-e07-q09, john-p7-x01-q01 | what does john want to know first |
| john-p2-e02-q08, john-p7-e04-q06 | who is john talking to |
| john-p2-e04-q07, john-p5-e01-q05 | what does mary offer |
| john-p3-e05-q01, john-p3-x01-q01 | what are they talking about |
| john-p4-e01-q03, john-p5-e03-q03 | how does jessy react to john's idea |
| john-p4-e01-q06, john-p5-e03-q04, john-p6-e04-q01 | what does mary suggest |
| john-p4-e05-q01, john-p5-e02-q01, john-p7-e02-q01, john-p7-e03-q03, john-p7-e05-q01 | what does john want to know |
| john-p5-e03-q06, john-p5-e04-q05, john-p6-e05-q01 | what does rick want to know |
| john-p5-e04-q08, john-p7-e04-q10 | what will john do |
| john-p6-e02-q02, john-p7-e03-q01 | what is john looking for |
| john-p6-e02-q03, john-p6-e03-q02, john-p6-e04-q08 | what does the shop assistant ask |
| john-p6-e02-q05, john-p7-e06-q02 | what does john want to do |
| john-p6-e02-q06, john-p6-e03-q08 | where are the changing rooms |
| john-p6-e03-q07, john-p7-e04-q05 | what does john ask |
| john-p6-e03-q09, john-p7-e03-q08 | where is john |
| john-p6-e03-q10, john-p7-e02-q06, john-p7-e03-q07 | who helps john |

## The Story of John — validação pendente (2)

| Referência | Detalhe |
|---|---|
| traduções (273 falas, 183 itens) | referência autoral — não validada pelo professor |
| questões (403) | gerada para o projeto a partir do texto do diálogo (metodologia própria do DRE; integrada por decisão do PO de 2026-11-11) — validação da Base de Conhecimento pendente (HANDOFF D-003) |

## Duplicidades e coincidências entre fontes

Itens de Conversation Practice com o mesmo inglês de itens de John (não são duplicidade dentro de uma fonte; registro para a reorganização): 4

| Item CP | Inglês | Itens de John |
|---|---|---|
| cp.what-do-you-do | What do you do? | john-p1-e01-v08 |
| cp.not-yet | Not yet. | john-p2-e04-v05 |
| cp.come-along | come along | john-p1-e04-v08 |
| cp.what-do-you-think-of | What do you think of…? | john-p3-e05-v01, john-p3-x01-v01 |
