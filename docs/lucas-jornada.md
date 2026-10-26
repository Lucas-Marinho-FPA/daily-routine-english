# Lucas 2.0 — jornada de aprendizagem

Fontes: **Bíblia de Personagem — Lucas 2.0 (Perfil Arquiteto)** e **Escopo Oficial do Personagem Lucas v1.0** (fornecidos pelo usuário em 2026-10-26), mais o repositório (fonte de verdade técnica). A Bíblia 2.0 não foi fornecida como arquivo separado; o perfil, os traços e os universos vêm do Escopo e do prompt de incorporação.

> A personalidade dá identidade. O universo fornece contextos. A narrativa cria situações de comunicação. A pedagogia decide o que se aprende. O motor existente transforma tudo em prática.

## 1. Auditoria

- **Onde o Lucas está:** ele não é um pacote como a Karla. É o conteúdo base do app: `data/content.js`, gerado por `tools/build-content.mjs` a partir da extração fiel do Word (`content/word/word-extract.json`) e da curadoria (`content/enrich/*.json`). No registro de personagens (`data/characters.js`) ele aparece só como `content: 'base'`.
- **Episódios reais:** os IDs são **R01–R10** (não L01–L10). São 10 rotinas e 34 parágrafos, todos descrições em 1ª pessoa de horários e tarefas, sem nenhum diálogo. A R01 é a apresentação prioritária para a aula.
- **Cobertura dos universos antes desta etapa:**
  - presentes: trabalho FP&A (genérico), Uber, xadrez, família, estudo de inglês;
  - ausentes: irmã/BPO, Python e aplicativos, cachorro, corrida e Hyrox, livros, emoções, erros, discordância e decisões difíceis.
- **Mecanismos preservados:**
  - escada de habilidades (reconhecer → lembrar → completar; montar → escrever; ordenar → contar o bloco → contar a rotina; responder);
  - revisão espaçada (Leitner), XP e conquistas;
  - corretor com variantes britânicas e americanas, avaliação oral em camadas;
  - áudio embutido, pré-cache offline e armazenamento no aparelho.
- **Privacidade:** a cópia publicada já generaliza o empregador e a escola de inglês (`tools/privacy_sanitize.py`). O conteúdo novo segue a mesma regra, verificada pelo build e pelos testes.

## 2. Decisões

- **R01–R10 intactos.** São texto fiel do Word. Mudar o texto mudaria os IDs (e com eles o progresso), a integridade com o Word e o treino da aula. Um teste compara cada frase, bloco, pergunta e item com a versão publicada em 35bd2fb.
- **Enriquecimento sem reescrever.** R01–R10 ganham etapa (A) e foco da língua. R02–R10 ganham duas perguntas cada: **compreensão** em 3ª pessoa e **transferência** para a vida do aluno, com dica, no mesmo mecanismo de perguntas pessoais que já existia. A R01 não recebeu perguntas, para não mudar o treino da aula.
- **Episódios novos R11–R18** cobrem os universos que faltavam e mostram a personalidade por decisões, falas e consequências. Ficam em `content/enrich/episodes.json`, como **ficção narrativa** ancorada em fatos de referência (`basis`). A tela mostra “Situação ilustrativa”.
- **Mesmo motor, sem mecânica nova.** Os episódios usam o formato de rotina, blocos e frases. Diálogos usam `speaker`, a mesma extensão mínima criada para a Karla: a tradução leva “Nome: …”, então os exercícios não mudam. XP, progressão, revisão, correção e armazenamento não foram alterados. Nenhum arquivo de código do app mudou nesta etapa.
- **Toda frase de episódio ensina ao menos um item** (o build recusa frase sem item: o motor libera frases sem itens logo na primeira sessão — problema encontrado e corrigido nesta etapa).
- **Vocabulário novo isolado.** Os 91 itens novos são localizados só nas frases dos episódios, para não injetar vocabulário nas rotinas antigas de quem já estuda. Os itens que já existiam são retomados nos episódios, e a frase de episódio entra no fim da lista de exemplos, depois dos exemplos antigos.
- **Áudio britânico embutido** para todo o conteúdo novo: 515 clipes, Kokoro `bf_emma` offline, a mesma voz do resto do Lucas. O pacote offline passou de 7,25 MB para 10,44 MB.

## 3. Episódios novos

| Ordem | Episódio | Etapa | Universo | Traços em ação | Objetivo comunicativo | Foco da língua | Blocos (diálogo) | Frases | Perguntas (conv/comp/transf.) |
|---|---|---|---|---|---|---|---|---|---|
| 11 | **R11** A Ride Across Town — Uma corrida pela cidade | B | Uber e mobilidade | comunicativo e colaborativo; paciente | Conversar com um passageiro: tranquilizar, explicar o trânsito, atender um pedido educado e falar um pouco de si. | Present Continuous (I'm taking a shorter route); pedidos educados (Would you mind + -ing?); It depends on… | 3 (1) | 11 | 1/1/1 |
| 12 | **R12** Saturday Plans — Planos de sábado | B | Família e vida pessoal | verdadeiro e transparente; humano diante do cansaço e dos próprios limites | Negociar um plano em família: fazer e recusar convites, sugerir, reconhecer o cansaço e pedir desculpas por uma reação impaciente. | Sugestões (Why don't we…?, Let's…); pedidos com can; I didn't mean to…; be in the mood for. | 3 (1) | 12 | 1/1/1 |
| 13 | **R13** Running Before Sunrise — Correndo antes do amanhecer | C | Atividade física | disciplinado e focado; competitivo consigo mesmo; humano diante do cansaço e dos próprios limites | Falar de uma meta pessoal: comparar resultados, explicar um dia ruim e justificar a decisão de descansar. | Comparativos (slower than, faster than); Past Simple; had slept (o que tinha acontecido antes); instead of + -ing. | 3 (0) | 10 | 1/1/1 |
| 14 | **R14** An Unexpected Result — Um resultado inesperado | C | Trabalho corporativo — FP&A | analítico; verdadeiro e transparente | Explicar um resultado financeiro inesperado, justificar a causa e discordar de uma proposta com educação, sugerindo outra opção. | Past Simple; due to (causa); discordância educada (I'm not sure that's the best option); I suggest we… ; If…, we might… | 3 (1) | 12 | 1/1/1 |
| 15 | **R15** A Bug Before Bedtime — Um bug antes de dormir | C | Tecnologia e aplicativos | analítico; paciente; disciplinado e focado | Descrever um problema técnico em etapas, explicar a solução e reformular uma ideia para uma criança. | Sequência (First…, Then…); Present Simple e Continuous (I'm fixing…); explicar com palavras simples (It's a mistake in…). | 3 (1) | 13 | 1/1/1 |
| 16 | **R16** Planning a Service with My Sister — Planejando um serviço com a minha irmã | D | Empreendedorismo — BPO financeiro | idealista em busca de pragmatismo; comunicativo e colaborativo | Apresentar e ajustar uma ideia de negócio: comparar opções, recusar o plano grande demais e combinar prioridades e prazos. | Sugestões e contrapropostas (Why don't we…? / Let's start with…); first conditional (If…, we'll…); comparação de opções. | 3 (1) | 12 | 1/1/1 |
| 17 | **R17** A Chess Game I Lost — Uma partida de xadrez que perdi | D | Xadrez e raciocínio estratégico | competitivo consigo mesmo; analítico | Analisar uma derrota: contar a partida, explicar o erro, levantar hipóteses sobre o que poderia ter sido diferente e planejar a próxima vez. | Past Simple; should have / could have (crítica e hipótese no passado); If I had…, I could have…; going to / will. | 3 (0) | 9 | 1/1/1 |
| 18 | **R18** A Book That Made Me Think — Um livro que me fez pensar | D | Leitura e desenvolvimento pessoal | idealista em busca de pragmatismo; comunicativo e colaborativo | Resumir a ideia de um livro, dar uma opinião equilibrada, concordar em parte e propor uma mudança concreta. | Opinião (I agree that…, I'm not sure…, It depends on…); argue that; partly / however; should para sugestões. | 3 (1) | 12 | 1/1/1 |

Personagens secundários fictícios, identificados só pelo papel: passageira, gerente. Família e irmã aparecem sem nomes. A R13 e a R17 são narrativas de decisão e análise, sem diálogo, para variar o formato.

## 4. Rotinas do Word (enriquecidas sem mudar o texto)

| Rotina | Etapa | Foco da língua | Perguntas novas |
|---|---|---|---|
| **R01** Dia presencial completo | A | Present Simple na 1ª pessoa; horários (at around, between… and…); sequência do dia. | — (apresentação da aula preservada) |
| **R02** Dia de home office | A | Present Simple; since (razão) e instead (alternativa); work from home. | compreensão: “Why doesn't Lucas go to the gym on home office days?”<br>transferência: “How is your day different when you work or study from home?” |
| **R03** Manhã mais tarde | A | Present Simple; on some days; negativa (I don't…) e because. | compreensão: “Why doesn't Lucas drive for Uber in the morning on these days?”<br>transferência: “What do you do on days when you can sleep a bit longer?” |
| **R04** Dia presencial com muitas reuniões | A | Present Simple; spend + tempo + -ing (I spend hours presenting…); vocabulário de reuniões. | compreensão: “How does Lucas clear his head after lunch?”<br>transferência: “How do you prepare for an important meeting or presentation?” |
| **R05** Noite em família e xadrez | A | Present Simple; atividades em família; so (consequência). | compreensão: “Why doesn't Lucas have an English class that night?”<br>transferência: “What do you enjoy doing with your family or friends in the evening?” |
| **R06** Home office de concentração | A | Present Simple; so I can… (permissão/possibilidade); tarefas de análise. | compreensão: “Why can Lucas concentrate on individual tasks today?”<br>transferência: “What helps you concentrate when you have a lot of work?” |
| **R07** Dia de estudo intensivo de inglês | A | Present Simple; when I get home; for about an hour (duração). | compreensão: “How long does Lucas review his lesson materials?”<br>transferência: “How do you practise English during the week?” |
| **R08** Academia e escritório | A | Present Simple; by + horário (prazo); which gives me… (consequência). | compreensão: “Why does Lucas try to finish his last trip by 7:30 a.m.?”<br>transferência: “How do you fit exercise into your week?” |
| **R09** Home office com recados à tarde | A | Present Simple; sharp (pontualidade); before + -ing. | compreensão: “What does Lucas do during his afternoon break?”<br>transferência: “What small tasks do you usually do during your breaks?” |
| **R10** Dia presencial equilibrado | A | Present Simple; decide not to; straight home; equilíbrio trabalho–família. | compreensão: “Why does Lucas get home early on this day?”<br>transferência: “What do you do to keep a healthy balance between work and family?” |

## 5. Retomada de vocabulário

Itens que aparecem nos episódios e já existiam no Lucas (retomada do que o aluno estudou) ou que aparecem em dois ou mais episódios:

| Item | Onde aparece |
|---|---|
| analyse *(já existia)* | R01 → R02 → R03 → R06 → R07 → R10 → R14 → R17 |
| so *(já existia)* | R01 → R05 → R06 → R11 → R13 → R14 → R16 → R18 |
| drive for Uber *(já existia)* | R02 → R03 → R04 → R07 → R08 → R11 |
| work on *(já existia)* | R03 → R06 → R07 → R02 → R15 |
| focus on *(já existia)* | R06 → R07 → R09 → R15 |
| later *(já existia)* | R02 → R03 → R05 → R16 |
| while *(já existia)* | R01 → R03 → R08 → R18 |
| at first | R13 → R14 → R17 |
| instead *(já existia)* | R02 → R13 → R17 |
| suggest | R12 → R14 → R16 |
| Border Collie | R12 → R13 |
| clear my head *(já existia)* | R04 → R13 |
| deadline | R15 → R16 |
| deal with *(já existia)* | R08 → R11 |
| frustrated | R13 → R17 |
| get some rest *(já existia)* | R04 → R13 |
| Instead of… *(já existia)* | R13 → R17 |
| It depends on… *(já existia)* | R11 → R18 |
| learn from | R15 → R17 |
| Let's… | R12 → R16 |
| make a cup of coffee *(já existia)* | R03 → R18 |
| priorities | R16 → R18 |
| realise | R12 → R13 |
| route | R11 → R13 |
| since *(já existia)* | R02 → R13 |
| three times a week *(já existia)* | R01 → R13 |
| tired | R12 → R13 |
| weigh the options | R14 → R17 |
| Why don't we…? | R12 → R16 |
| work in finance | R11 → R18 |
| at the weekend *(já existia)* | R12 |
| I need to… *(já existia)* | R12 |

### Estruturas ao longo da jornada

| Estrutura | Onde |
|---|---|
| Present Simple (hábitos, rotina) | R01–R10 |
| Present Continuous | R11 (I'm taking a shorter route), R15 (I'm fixing a bug), R16 (we are planning) |
| Pedidos e sugestões educados | R11 (Would you mind…?), R12 (Why don't we…?, Let's…), R14 (I suggest we…), R16 (Why don't we…? / Let's start with…) |
| Comparativos | R11 (shorter route), R13 (slower / faster than) |
| Past Simple e narrativa | R13, R14, R16, R17 |
| Discordância e opinião | R14 (I'm not sure that's the best option), R18 (Partly. I agree that…, It depends on…) |
| Condicionais | R14 (If we cut it now, we might…), R16 (If clients ask…, we'll…), R17 (If I had checked…, I could have…) |
| should have / could have | R17 |
| Emoção e limites | R12 (tired, I didn't mean to sound impatient), R13 (frustrated, rest is part of the plan), R17 (frustrated, learn from my mistakes) |

## 6. Classificação editorial (interna)

- **Fatos de referência** (`episodes.json → profile.facts`, P01–P10): FP&A num banco, Uber, BPO com a irmã, Python/IA, família, Border Collie, interesses, leituras, formação, São Paulo.
- **Ficção narrativa:** todo o enredo dos episódios (passageira, resultado do mês, bug, proposta, partida, sábado no parque). Não aparece como fato biográfico.
- **Pendentes:**
  - idade de referência e idades dos filhos (não usadas no texto);
  - gênero dos dois filhos (o texto usa “my son”, como o Word, e “the children”);
  - nome do cachorro;
  - publicar ou não o nome da agência (mantido fora do texto).

## 7. Proposta para o motor compartilhado (não implementada)

**Avaliação oral: molduras de referência com âncoras fracas.**
- **Problema:** a heurística de “som parecido” da avaliação oral cria molduras a partir de qualquer frase do conteúdo. Contrações (“I'm”) e conectores (“because”) contam como palavras de conteúdo.
- **Efeito:** frases novas e legítimas podem marcar âmbar respostas de outras rotinas. Exemplos encontrados nesta etapa:
  - “a shorter/faster route”;
  - “I'm taking/working on a”;
  - “because I wanted/work at a”.
- **O que foi feito:** como pede o escopo, adaptei o conteúdo (quatro frases reescritas) em vez de mudar o motor.
- **Proposta:** tratar contrações e conectores como palavras funcionais nas âncoras das molduras.
- **Benefício:** menos falsos alarmes à medida que o conteúdo cresce, para todos os personagens.
- **Risco:** baixo, mas muda a avaliação de todos; precisa de autorização e de nova medição com as 101 leituras reais.

## 8. Backlog

| Prioridade | Item | Por quê |
|---|---|---|
| Alta | Revisão dos episódios por professor ou falante nativo | Conteúdo novo; revisado aqui por regras, testes e leitura própria. |
| Média | Proposta do motor (seção 7) | Reduz falsos alarmes para todos os personagens. |
| Média | Confirmar pendências biográficas (seção 6) | Permite usar idades, nomes ou a agência se o usuário quiser. |
| Média | Texto do Início para episódios (“Para a próxima aula”, “Treino para a aula”, “Perguntas da teacher”) | Os rótulos foram pensados para a R01 e a aula. |
| Baixa | Episódios com “Mais Esperto que o Diabo” e um episódio de fim de semana com a Karla como personagem secundária | Fora do MVP; a relação entre os dois personagens não foi informada. |
| Baixa | Tabela de verbos e drills com o vocabulário dos episódios | O motor suporta; o conteúdo atual vem só do Word. |
