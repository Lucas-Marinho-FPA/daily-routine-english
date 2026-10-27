# Conversation Practice — jornada 2 (piloto CP01–CP02)

**Todo o conteúdo desta jornada é original do app.** Do Conversation Book (material do curso, enviado em 2026-10-27) só se aproveitam os **objetivos funcionais** dos temas 01 e 02: apresentar-se e apresentar outras pessoas; dar opiniões e dizer do que gosta e do que não gosta. Nenhum diálogo, personagem, cenário, explicação ou lista de expressões do livro é usado.

## 1. Auditoria de direitos (2026-10-27)

O primeiro piloto (commit local c0cb6c8) reproduzia o livro. Medido contra o texto extraído do próprio `.docx`, `data/journeys.js` trazia:
- 23 das 24 falas literais (a 24ª com uma palavra entre parênteses retirada);
- as 41 notas do glossário;
- 848 sequências de 6 palavras iguais às do livro;
- os nomes, lugares e títulos das conversas.

Além disso, 24 clipes de áudio gravavam as falas do livro, e a documentação citava os títulos e 3 trechos.

| Categoria | No c0cb6c8 | Tratamento |
|---|---|---|
| A. Original do livro (literal) | 24 falas, 41 notas do glossário, títulos, 24 áudios | **Removido** e substituído por conteúdo original |
| B. Adaptação | 2 diálogos “Na prática” e 16 explicações derivadas da seleção de expressões do livro | **Removido**; adaptação não equivale a autorização |
| C. Conteúdo novo | traduções, atividades, perguntas | **Reescrito** para os novos diálogos |
| D. Elementos linguísticos comuns | expressões usuais (Nice to meet you, What do you do?, a couple of…) e os nomes funcionais dos temas | **Mantidos** onde servem aos novos diálogos, sem a seleção, a ordem ou as definições do livro |

Salvaguardas permanentes:
- **Licença obrigatória para texto de terceiros:** o build recusa conteúdo `original` sem licença verificável (campo `license`, hoje vazio).
- **Comparação com o livro:** quando a referência local do livro existe, o build compara todo o texto publicável com ela (sequências de 6 palavras, nomes e lugares, notas). Essa referência fica só na cópia de trabalho, fora do repositório.
- **Controle positivo:** aplicada à versão anterior, a checagem acusa 165 reproduções; aplicada à atual, nenhuma.

**Pendência no histórico do git:** o c0cb6c8 continua no histórico local de `main`. Enviar `main` como está publicaria esse commit, e com ele o texto do livro, no histórico do repositório no GitHub, mesmo que o site final não o mostre. Por isso a publicação usa a branch `cp-publicacao`: parte do commit já publicado (13de9d2) e traz a mesma árvore final em um commit próprio, sem o c0cb6c8 no histórico. O c0cb6c8 não foi alterado nem apagado; fica só no histórico local de `main`, que não é enviada.

**Verificação antes do envio de `cp-publicacao`:** o c0cb6c8 não é ancestral da branch; os únicos objetos que o envio compartilha com ele são código do app (sem texto do livro) e 11 clipes de expressões comuns (“Nice to meet you.”, “What do you do?”, “can't stand”…); a árvore enviada não tem nenhuma sequência de 6 palavras do livro (as de 4 palavras que restam são expressões usuais e os nomes funcionais dos temas).

## 2. Arquitetura (sem mudança em relação ao piloto)

- **Jornada como visão de conteúdo:** `engine/journeys.js`, com dados em `data/journeys.js` gerados por `tools/build-journeys.mjs` a partir de `content/journeys/cp.json`. Lucas e Karla continuam com os mesmos arquivos de dados.
- **Fora do seletor de personagem:** um cartão no Início das rotinas abre a jornada, que tem Início próprio com situação por habilidade e conclusão. A escolha fica em `settings.journey` (padrão `null` = rotinas).
- **Progresso e domínio próprios:** itens `cp.*`, nunca compartilhados com Lucas ou Karla; os equivalentes ficam em `relatedTo`.
- **Exercícios aditivos (autorizados):** ouvir e responder (`lq`/`lis`), com o diálogo inteiro ou trechos, sem texto antes; ler e responder (`rq`/`rdq`), com a fala de referência destacada.
- **Regras do app:** XP pelo valor padrão já existente (6); revisão espaçada e armazenamento sem mudança. Na jornada, a transferência também entra na sessão focada na unidade.
- **Áudio:** britânico, offline, uma voz por personagem (Priya `bf_isabella`, Daniel `bm_lewis`, Ruth `bf_lily`, Omar `bm_george`, Beth `bf_isabella`; “Na prática”: Sam, Leo, Anna, Zoe, Mark). São 132 clipes, e o pacote offline passou de 10,44 MB para 11,68 MB.

## 3. Conteúdo

- **CP01:** “A new face at the office”. É o primeiro dia de Daniel; Priya puxa conversa e apresenta a colega Ruth. Em “Na prática”, Sam apresenta o amigo Leo num clube de corrida.
- **CP02:** “Choosing a film”. Omar e Beth discordam com educação sobre filmes e chegam a um meio-termo. Em “Na prática”, Zoe e Mark concordam e discordam sobre um café.
- **Língua:** inglês britânico (favourite, film, flatmate, takeaway, fancy, at the weekend). As notas de variante explicam o americano, e o corretor aceita as duas grafias.

## 4. Matriz de objetivos e habilidades

| Unidade | Objetivo comunicativo | Listening | Reading | Writing | Speaking | Transferência / revisão |
|---|---|---|---|---|---|---|
| **CP01** Introducing Yourself and Others | Puxar conversa com alguém novo, apresentar-se, perguntar de onde a pessoa é e o que faz, apresentar um colega e combinar o próximo encontro. | CP.L1, CP.L2, CP.L3, CP.L4: diálogo inteiro e trechos, sem texto antes; texto e repetição depois | CP.R1, CP.R2, CP.R3, CP.R4 (múltipla escolha: sentido e intenção) + CP.Q4 (aberta) | montar e escrever 19 falas; completar 9 expressões; respostas próprias | CP.Q1, CP.Q2, CP.Q3 (falar ou escrever, com modelo e avaliação oral) + Speaking Lab com as falas | CP.Q5, CP.Q6 |
| **CP02** Expressing Opinions, Likes and Dislikes | Dizer do que você gosta e do que não gosta, pedir e dar opinião, discordar com educação e chegar a um acordo — retomando as apresentações do CP01. | CP.L5, CP.L6, CP.L7, CP.L8: diálogo inteiro e trechos, sem texto antes; texto e repetição depois | CP.R5, CP.R6, CP.R7, CP.R8 (múltipla escolha: sentido e intenção) + CP.Q10 (aberta) | montar e escrever 18 falas; completar 10 expressões; respostas próprias | CP.Q7, CP.Q8, CP.Q9 (falar ou escrever, com modelo e avaliação oral) + Speaking Lab com as falas | CP.Q12, CP.Q13 · revisão CP.Q11 |

### Itens (65) e retomada
O CP02 retoma pelo menos 5 itens do CP01 (actually, a couple of, Shall we…?, let me know, That sounds great, brilliant). A pergunta de revisão CP.Q11 mistura as duas unidades. Cada diálogo “Na prática” reaproveita pelo menos 3 expressões do diálogo principal em outra situação.

| Item | Unidades | Equivalente já existente no app |
|---|---|---|
| I don't think we've met. | CP01 | — |
| I'm (+ nome) | CP01 | — |
| work in (+ área / equipe) | CP01 | — |
| Nice to meet you. | CP01 | — |
| It's my first day. | CP01 | — |
| actually | CP01 → CP02 | — |
| Where are you from? | CP01 | — |
| I'm from… | CP01 | — |
| I've been living in… for… | CP01 | — |
| a couple of | CP01 → CP02 | it.a-couple-of-hours |
| What do you do? | CP01 | — |
| I'm a (+ profissão) | CP01 | — |
| I'll be working on… | CP01 | — |
| Have you met…? | CP01 | — |
| He's / She's just (+ particípio) | CP01 | — |
| Pleased to meet you. | CP01 | — |
| How are you finding it? | CP01 | — |
| So far, so good. | CP01 | — |
| Glad to hear it. | CP01 | — |
| let me know | CP01 → CP02 | — |
| Thanks very much. | CP01 | — |
| I really appreciate it. | CP01 | — |
| Shall we…? | CP01 → CP02 | — |
| grab a coffee | CP01 | it.make-a-cup-of-coffee |
| introduce someone to | CP01 | — |
| That sounds great. | CP01 → CP02 | — |
| See you later! | CP01 | — |
| This is my friend… | CP01 | — |
| Have you… yet? | CP01 | — |
| Not yet. | CP01 | — |
| I'd like to… | CP01 | — |
| at the weekend | CP01 | it.at-the-weekend |
| brilliant | CP01 → CP02 | — |
| come along | CP01 | — |
| be looking forward to | CP01 | — |
| (Do you) fancy (+ -ing / algo)? | CP02 | — |
| be on at the cinema | CP02 | — |
| I'm not really into… | CP02 | — |
| prefer | CP02 | it.i-prefer-to |
| my favourite | CP02 | — |
| What kind of… do you like? | CP02 | — |
| be a huge / big fan of | CP02 | — |
| can't stand | CP02 | — |
| Fair enough. | CP02 | — |
| What do you think of…? | CP02 | — |
| I've heard (that)… | CP02 | — |
| To be honest, … | CP02 | — |
| I'm not keen on… | CP02 | — |
| That's true. | CP02 | — |
| Personally, … | CP02 | — |
| I don't mind… | CP02 | — |
| How about…? | CP02 | — |
| compromise | CP02 | — |
| takeaway | CP02 | — |
| Deal! | CP02 | — |
| feel like (+ -ing) | CP02 | — |
| I'd love (a / to…) | CP02 | — |
| I'm absolutely starving. | CP02 | — |
| I really like… | CP02 | — |
| I agree. | CP02 | it.agree-with |
| I'm not so sure about… | CP02 | — |
| I quite like… | CP02 | — |
| I find it (+ adjetivo) | CP02 | — |
| a matter of taste | CP02 | — |
| love (+ -ing) | CP02 | — |

## 5. Limitações conhecidas do motor compartilhado (propostas, não implementadas)

| Proposta | Evidência | Benefício | Risco |
|---|---|---|---|
| “Buraco” na avaliação oral: aceitar preposição no fim de pergunta | A resposta-modelo “Where are you from? And what do you do?” recebe aviso âmbar (“from” sem complemento), e o aluno que disser isso também | Remove um falso alarme numa estrutura-alvo comum | Muda a avaliação de todos os personagens; precisa de autorização e nova medição com as 101 leituras reais |

O teste fixa esse caso como a única exceção conhecida, para detectar qualquer outra regressão. A proposta anterior (categoria “esportes”) deixou de ser necessária, porque as falas do livro saíram.

## 6. Backlog

| Prioridade | Item | Por quê |
|---|---|---|
| Alta | Decidir o que publicar: `main` (com c0cb6c8 no histórico) ou `cp-publicacao` (histórico limpo) | O histórico também é distribuído |
| Alta | Revisão humana (professor) das falas, traduções e atividades | Revisado aqui por regras, testes e leitura própria |
| Média | Proposta do motor (seção 5) | Falso alarme numa estrutura comum |
| Média | Ditado (ouvir e escrever) | Ficou fora do MVP (o pedido autorizou dois tipos) |
| Média | Temas seguintes | Conteúdo original novo, com os mesmos objetivos funcionais |
| Baixa | Selo da jornada nas abas Estudar e Falar | Hoje só o Início mostra a jornada |
| Baixa | Versionar `content/`, `tools/` e `tests/` | Pendência antiga; a referência do livro nunca vai para o repositório |

## 7. Como testar

1. No Início das rotinas, abra “Conversation Practice”.
2. No CP01, toque em **Praticar**. A primeira sessão apresenta as expressões; a seguinte traz “Ouça e responda” (diálogo inteiro ou trecho, sem texto antes) e, depois de ouvir, “Leia e responda”.
3. **Diálogo** mostra as falas com quem fala e as notas de variante. **Falar** abre o Speaking Lab com as falas.
4. Responda às perguntas de transferência escrevendo ou gravando e faça a autoavaliação.
5. **Voltar às rotinas** devolve o personagem, com o progresso intacto. Em modo avião, tudo continua funcionando.

Testes: `tests/unit/journey.test.js` (13) e `tests/e2e/journey.mjs` (J01–J10).
