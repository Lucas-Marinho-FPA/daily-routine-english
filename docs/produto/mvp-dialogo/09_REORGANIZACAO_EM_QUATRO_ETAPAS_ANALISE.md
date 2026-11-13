# Reorganização dos diálogos em quatro etapas — análise, proposta e decisões pendentes

**Data:** 2026-11-12 · **Autor:** executor técnico (Claude Code) · **Estado:** análise concluída; implementação
**aguardando decisões do PO** (seção 7). Nada foi alterado no aplicativo, nos dados ou no progresso por esta análise.
**Base:** especificação “Reorganização das atividades de diálogo” (PO, 2026-11-12) e o estado real do repositório no
commit `46b7d97` (fontes: `js/engine/dialogue.js`, `js/engine/dialogueeval.js`, `js/engine/evalsync.js`,
`js/ui/dialogue.js`, `app/data/dialogues.js` gerado por `dev/tools/build-dialogues.mjs`).

---

## 1. Como é hoje (fluxo real no código)

| Fase atual (id) | O que o aluno faz | Unidade | Avaliação | Critério |
|---|---|---|---|---|
| 1 `vocab` | ouve o item 3× e **fala** | item curado (palavra, chunk, expressão, phrasal verb) | reconhecimento de voz + alinhamento de palavras (local/online) | ≥ 80% por item |
| 2 `dictation` | ouve a fala e **escreve** (ordem embaralhada estável) | fala do diálogo | correção textual local | ≥ 80% por fala |
| 3 `translation` | **traduz** cada fala para o português | fala | local só para “igual à referência” / “ainda em inglês”; o resto fica **pendente de avaliação online** | ≥ 80% por fala |
| 4 `listening` | ouve o diálogo inteiro (falas em sequência, vozes por personagem) e responde **questões de compreensão** | diálogo | correção objetiva | rodada com nota de corte |
| 5 `reading` | **lê em voz alta** cada fala | fala | reconhecimento de voz + alinhamento | ≥ 80% por fala |

Progresso: `kv → 'dialogues'` (`{ v: 1, acts: { <actId>: { attempts, listens, rounds, order, ... } } }`); cada
tentativa guarda `phase` + `itemId` (ids estáveis do conteúdo), estado, nota e evidência. Pré-requisitos:
`vocab → dictation → translation → (listening, reading)`.

## 2. Inventário real do conteúdo (todos os 46 diálogos de The Story of John)

- **273 falas** (inglês, português, personagem, áudio próprio, voz), **183 itens curados** (50 palavras, 89 chunks,
  35 expressões, 9 phrasal verbs; cada um com inglês, português, áudio e ligação às falas de origem — 13 itens ligados
  a mais de uma fala), **403 questões de compreensão**.
- **Áudio:** 100% dos itens e 100% das falas têm áudio próprio. Cada fala tem a voz do personagem (8 vozes no total):
  a alternância de vozes da etapa 4 **já existe** (a fase atual de compreensão toca as falas em sequência). Exceções
  registradas: `john-p7-e04` (4 personagens, 3 vozes) e `john-p7-x01` (3 personagens, 2 vozes) — dois personagens
  compartilham voz; sem serviço novo, fica assim (limitação documentada).
- **Lacuna principal — cobertura dos itens curados:** **15 dos 46 diálogos não têm nenhum item** de vocabulário, e,
  em média, os itens cobrem só **17%** das palavras de conteúdo das falas (0% a 56%; tabela no anexo). Ou seja: com
  os itens atuais, a regra de cobertura integral (§2.1 da especificação) **não é atendida** em nenhum diálogo.
- **Traduções:** todas as falas e itens têm português (referência autoral, “não validada pelo professor”, conforme a
  própria fonte). **Nenhuma variante aceita** de tradução está registrada (`acceptedPt` vazio em todas as falas).
- **Correções de conteúdo:** 6 falas têm correção aprovada pelo PO (`john-corrections.json`, 2026-11-11); o app usa o
  texto **corrigido** e o campo `correction` guarda o original da fonte (os Markdown de origem não foram alterados).
- **Tamanho para a leitura integral (etapa 4B):** 16 a 107 palavras por diálogo (mediana 47; 8 diálogos acima de
  60). Tecnicamente viável numa gravação (online: sessões reiniciadas; Moonshine: modo longo segmentado).

## 3. Proposta de inventário para as etapas 1–3 (sem inventar conteúdo)

A especificação lista **frases e falas de cada personagem** como parte do inventário. Proposta: **inventário =
itens curados + todas as falas do diálogo**, cada unidade com o seu inglês, português e áudio **já existentes**.

- Cobertura: **100% do texto do diálogo** aparece nas etapas 1–3 (todas as falas), sem criar itens novos; os itens
  curados continuam como unidades menores (vocabulário/expressões) ligados às falas.
- Os 15 diálogos sem itens passam a ter inventário (as falas). Nada é inventado: quando a Base de Conhecimento curar
  mais itens, eles entram sozinhos (mesma estrutura de dados).
- Ordem na etapa 1: itens primeiro (na ordem do conteúdo), depois as falas (ordem do diálogo) — “ordem de
  aprendizagem”. Etapas 2 e 3: embaralhamento estável por rodada, sobre unidades completas (id + texto + tradução +
  áudio juntos), com ordem diferente da etapa anterior (quando houver mais de 2 unidades).

Alternativa (se o PO preferir unidades menores que a fala): pedir à Base de Conhecimento a curadoria do inventário
completo (palavras, collocations, padrões) de cada diálogo — o produto não cria esses itens. Essa demanda pode correr
em paralelo; a proposta acima não depende dela.

## 4. Mapeamento das fases antigas para as novas

| Nova etapa | Reaproveita | Novo |
|---|---|---|
| 1 Vocabulário e expressões (ver EN+PT, **escrever** em inglês) | conteúdo dos itens/falas; correção textual da escrita (`scoreWriting`, já usada no ditado) | tela de cópia escrita |
| 2 Falar e produzir (ver EN, **falar**; PT revelado após reconhecimento válido) | tela de vocabulário remodelada (fase 1 atual), reconhecimento de voz, marcação por trecho | tradução oculta até o acerto; falas como unidades; áudio-modelo como ajuda |
| 3 Ouvir e reconhecer (ouvir, **escrever**) | fase 2 atual (ditado das falas, embaralhado), correção textual | itens no ditado; marcação por trecho no resultado escrito |
| 4A Ouvir o diálogo | reprodução sequencial da fase 4 atual (vozes por personagem) | — |
| 4B Ler em voz alta o diálogo inteiro | leitura (fase 5 atual) e avaliador por palavra | gravação única do diálogo; “palavra adicional” na marcação |
| 4C Traduzir o diálogo inteiro | fase 3 atual (contrato de avaliação semântica online) | correção por unidades de significado — **ver D3** |
| (questões de compreensão) | fase 4 atual | **sem lugar na nova sequência — ver D2** |

## 5. Critérios de progressão — recomendação (decisão D4)

- **Etapa 1 (escrever vendo EN+PT):** cada unidade escrita corretamente ao menos uma vez (texto igual ou variante
  aceita pela correção atual); erro = nova tentativa. Estado registrado: **apresentado**. Não conta como domínio.
- **Etapa 2 (falar):** cada unidade com **≥ 80%** de correspondência no reconhecimento (mesmo critério da fala de
  hoje); inconclusivo/falha técnica não reprova nem aprova. Estado: **demonstrado em produção** (oral).
- **Etapa 3 (ouvir e escrever):** cada unidade com **≥ 80%** na correção textual (mesmo critério do ditado de hoje).
  Estado: **em desenvolvimento → demonstrado** (recepção + escrita).
- **Etapa 4:** leitura integral ≥ 80% (definido); tradução ≥ 80% (definido) — liberada só após a leitura.
- Parâmetros históricos (75%/seis frases no listening; três gravações no speaking) **não** são reaplicados.

## 6. Compatibilidade do progresso (decisão D6)

- **Não destrutiva:** as tentativas antigas ficam guardadas como estão (fases `vocab`, `dictation`, `translation`,
  `listening`, `reading`); as novas etapas usam ids novos (`learn`, `speak`, `hear`, `context`) no mesmo armazenamento.
  Nada é apagado nem reescrito; voltar à versão anterior continua lendo o histórico.
- **Crédito por evidência equivalente (proposta):** fala aprovada na fase 1 antiga (item falado ≥ 80%) conta para o
  mesmo item na nova etapa 2; fala ditada aprovada na fase 2 antiga conta para a mesma fala na nova etapa 3. Nada mais
  é creditado (leitura fala a fala ≠ leitura integral; tradução pendente não é evidência). A etapa 1 nova nunca é
  creditada (é exposição). Alternativa: nenhum crédito (o aluno refaz tudo).
- Migração testável (unitário com lojas reais anonimizadas) e reversível (não altera dados).

## 7. Decisões pendentes do PO (sem elas a implementação fica bloqueada ou incompleta)

- **D1 — Inventário das etapas 1–3:** aprovar “itens curados + todas as falas” (seção 3)? E abrir, em paralelo, a
  demanda à Base de Conhecimento para curadoria do inventário completo?
- **D2 — Questões de compreensão (403):** a especificação não as inclui. Opções: (a) manter como momento opcional
  depois de 4A; (b) manter obrigatórias em 4A; (c) retirar da sequência (os dados continuam no repositório).
  Recomendação: (a). Observação: as 403 questões foram geradas por IA e aguardam validação da Base (demanda D-003).
- **D3 — Correção da tradução (4C) por unidades de significado:** **não há avaliador local para isso** e o avaliador
  semântico online previsto **não está configurado** (`evalsync.js`: “not-configured”; ativá-lo exige serviço e
  possivelmente custo, que dependem de aprovação). Também **não existem** unidades de significado nem variantes
  aceitas nos dados. Opções: (a) aprovar o serviço de avaliação online (contrato já existe, provider-neutral);
  (b) a Base de Conhecimento cura unidades de significado e variantes aceitas por fala (correção local, offline);
  (c) provisório: tradução fala a fala com comparação à referência mostrada **depois** da tentativa e autoavaliação
  (não atinge um “80% automático”). Sem (a) ou (b), a regra “tradução ≥ 80%” e o destaque no inglês não são
  cumpríveis de forma confiável.
- **D4 — Critérios das etapas 1–3:** aprovar a recomendação da seção 5?
- **D5 — “Ouvir 3 vezes antes de gravar”:** é regra atual da fala de vocabulário; na nova etapa 2 (recuperação), a
  especificação oferece o áudio-modelo como ajuda. Recomendação: sem audições obrigatórias na etapa 2; áudio-modelo
  disponível após a primeira tentativa (as audições continuam na etapa 3, que é de escuta).
- **D6 — Crédito do progresso antigo:** aprovar o crédito por evidência equivalente (seção 6) ou nenhum crédito?
- **D7 — Texto das 6 falas corrigidas:** confirmar que o diálogo integral usa a versão corrigida aprovada em
  2026-11-11 (a que o app já usa) — validação da Base de Conhecimento.
- **D8 — Escopo do primeiro corte:** recomendação — implementar e validar no aparelho **um diálogo completo**
  (`john-p1-e01`) com as quatro etapas antes de ativar para todos (a especificação pede ao menos um módulo completo na
  verificação).

## 8. Plano de implementação proposto (após as decisões)

1. **Motor (sem UI):** modelo de etapas v2 em `engine/dialogue.js` (ids novos, inventário = itens + falas, ordens
   embaralhadas estáveis por etapa/rodada, estados apresentado/em desenvolvimento/demonstrado, liberação de 4C só
   após 4B ≥ 80%), crédito do progresso antigo (D6), testes unitários de cobertura (inventário ≡ etapas 1–3),
   embaralhamento (ids/áudios juntos), critérios e retomada.
2. **Etapas 1 e 2** (telas; reaproveitam a remodelagem do vocabulário e a marcação por trecho).
3. **Etapa 3** (ditado de itens e falas; marcação por trecho na escrita).
4. **Etapa 4A/4B** (reprodução sequencial existente; leitura integral com marcação por palavra, incluindo adicionais).
5. **Etapa 4C** conforme D3.
6. E2E por etapa no diálogo `john-p1-e01` (correta, incorreta, parcial, variante, inconclusiva, microfone
   indisponível, sem áudio, retomada, bloqueio sem critério), documentação e HANDOFF.

Fora de escopo: jornada Daily Routine, outros módulos, Base de Conhecimento, revisão espaçada global, XP/gamificação.

## Anexo — inventário por diálogo

“Palavras de conteúdo cobertas” = palavras das falas (sem palavras funcionais) que aparecem em algum item curado.
Todos os itens e falas têm áudio e português.

| Diálogo | Título | Falas | Itens curados | Tipos | Perguntas | Vozes/personagens | Palavras de conteúdo das falas cobertas pelos itens | Unidades nas etapas 1–3 (itens + falas) |
|---|---|---|---|---|---|---|---|---|
| john-p1-e01 | A familiar face | 7 | 8 | chunk 5, expression 3 | 10 | 2/2 | 46% | 15 |
| john-p1-e02 | What does everyone do? | 7 | 8 | word 1, chunk 7 | 10 | 3/3 | 31% | 15 |
| john-p1-e03 | A little about John | 6 | 0 | — | 10 | 2/2 | 0% | 6 |
| john-p1-e04 | Family and free time | 9 | 9 | word 1, chunk 5, expression 2, phrasal_verb 1 | 10 | 2/2 | 49% | 18 |
| john-p1-e05 | What are they doing? | 5 | 0 | — | 9 | 2/2 | 0% | 5 |
| john-p1-e06 | More friends, more connections | 8 | 6 | chunk 2, word 3, phrasal_verb 1 | 10 | 5/5 | 15% | 14 |
| john-p1-e07 | A university course | 6 | 0 | — | 10 | 2/2 | 0% | 6 |
| john-p1-e08 | People and what they do | 3 | 15 | word 5, chunk 10 | 7 | 3/3 | 38% | 18 |
| john-p1-e09 | Past events and relationships | 4 | 0 | — | 5 | 2/2 | 0% | 4 |
| john-p2-e01 | A typical working day | 7 | 0 | — | 10 | 2/2 | 0% | 7 |
| john-p2-e02 | Different professions, different tasks | 6 | 13 | chunk 9, word 4 | 10 | 3/3 | 19% | 19 |
| john-p2-e03 | Studying after work | 7 | 0 | — | 10 | 2/2 | 0% | 7 |
| john-p2-e04 | A busy day | 6 | 6 | expression 4, chunk 2 | 10 | 2/2 | 32% | 12 |
| john-p2-e05 | After work | 6 | 0 | — | 10 | 2/2 | 0% | 6 |
| john-p2-x01 | Frequency and intention | 2 | 9 | word 6, chunk 3 | 3 | 2/2 | 30% | 11 |
| john-p2-x02 | Comparatives, superlatives and ages | 1 | 1 | chunk 1 | 3 | 1/1 | 11% | 2 |
| john-p3-e01 | Sunday lunch | 7 | 0 | — | 10 | 4/4 | 0% | 7 |
| john-p3-e02 | Who is older? | 6 | 0 | — | 10 | 3/3 | 0% | 6 |
| john-p3-e03 | Family connections | 6 | 9 | chunk 6, word 3 | 10 | 4/4 | 23% | 15 |
| john-p3-e04 | A story about two friends | 8 | 0 | — | 10 | 2/2 | 0% | 8 |
| john-p3-e05 | Opinions and preferences | 5 | 9 | expression 4, chunk 4, word 1 | 7 | 4/4 | 29% | 14 |
| john-p3-x01 | Asking for and expressing opinions | 4 | 13 | expression 5, chunk 6, word 2 | 4 | 2/2 | 54% | 17 |
| john-p3-x02 | Wedding celebrations — British vocabulary | 3 | 6 | chunk 2, expression 4 | 5 | 3/3 | 40% | 9 |
| john-p4-e01 | Saturday plans | 6 | 2 | chunk 1, word 1 | 10 | 4/4 | 13% | 8 |
| john-p4-e02 | At the race | 6 | 4 | word 1, chunk 3 | 10 | 4/4 | 24% | 10 |
| john-p4-e03 | After the competition | 7 | 4 | word 1, chunk 2, expression 1 | 10 | 4/4 | 27% | 11 |
| john-p4-e04 | Choosing a place | 6 | 2 | word 1, expression 1 | 10 | 4/4 | 12% | 8 |
| john-p4-e05 | An invitation | 6 | 1 | word 1 | 10 | 2/2 | 8% | 7 |
| john-p4-x01 | Live race commentary | 3 | 7 | word 1, chunk 3, expression 3 | 8 | 1/1 | 44% | 10 |
| john-p5-e01 | A call for Mary | 11 | 9 | chunk 4, phrasal_verb 1, expression 4 | 10 | 3/3 | 18% | 20 |
| john-p5-e02 | Making arrangements | 7 | 0 | — | 10 | 2/2 | 0% | 7 |
| john-p5-e03 | A social invitation | 7 | 0 | — | 10 | 4/4 | 0% | 7 |
| john-p5-e04 | Confirming the details | 5 | 0 | — | 8 | 4/4 | 0% | 5 |
| john-p6-e01 | A suit for the meeting | 5 | 3 | chunk 1, word 2 | 8 | 2/2 | 19% | 8 |
| john-p6-e02 | In the clothes shop | 9 | 9 | word 4, chunk 4, phrasal_verb 1 | 10 | 3/3 | 32% | 18 |
| john-p6-e03 | Asking for help | 7 | 5 | word 2, chunk 2, phrasal_verb 1 | 10 | 2/2 | 31% | 12 |
| john-p6-e04 | A different choice | 6 | 3 | word 3 | 10 | 3/3 | 16% | 9 |
| john-p6-e05 | Getting ready | 5 | 4 | word 3, phrasal_verb 1 | 7 | 2/2 | 20% | 9 |
| john-p7-e01 | Planning the trip | 7 | 1 | chunk 1 | 10 | 2/2 | 5% | 8 |
| john-p7-e02 | Finding the station | 5 | 8 | chunk 3, phrasal_verb 1, expression 2, word 2 | 7 | 2/2 | 56% | 13 |
| john-p7-e03 | Checking the timetable | 6 | 3 | word 2, chunk 1 | 8 | 2/2 | 18% | 9 |
| john-p7-e04 | The delay | 6 | 0 | — | 10 | 3/4 | 0% | 6 |
| john-p7-e05 | What can we do now? | 6 | 1 | chunk 1 | 10 | 2/2 | 8% | 7 |
| john-p7-e06 | A different journey: booking a flight | 8 | 0 | — | 10 | 2/2 | 0% | 8 |
| john-p7-e07 | At the airport | 6 | 2 | phrasal_verb 2 | 8 | 2/2 | 5% | 8 |
| john-p7-x01 | Additional travel expressions | 4 | 3 | expression 2, chunk 1 | 6 | 2/3 | 15% | 7 |
