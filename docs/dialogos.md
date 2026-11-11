# Atividades de diálogo em cinco fases — The Story of John

Especificação: `docs/produto/mvp-dialogo/` (pacote do Product Owner de 11/11/2026, copiado sem alteração).
Implementação na branch de trabalho; **não publicada**.

## Onde está cada coisa

| Parte | Arquivo |
|---|---|
| Documentos autorais (fonte, sem alteração) | `dev/content/dialogues/source/the-story-of-john/*.md` |
| Conversão para dados (texto literal, IDs estruturais) | `dev/tools/dialogues-source.mjs` → `dev/content/dialogues/john.json` + `john-report.json` (lacunas) |
| Build do pacote do app + áudio + CSP | `dev/tools/build-dialogues.mjs` → `data/dialogues.js`, `dev/content/build/dialogues-audio-manifest.json` |
| Regras (fases, domínio, tentativas, compreensão, retomada) | `js/engine/dialogue.js` |
| Avaliadores locais e contrato online | `js/engine/dialogueeval.js` |
| Fila de avaliações pendentes / cliente do AI Gateway | `js/engine/evalsync.js` |
| Telas | `js/ui/dialogue.js` (rotas `#/dialogues`, `#/dialogue/<id>`, `#/dphase/<id>?p=<fase>`), cartão no Início |
| AI Gateway de referência (não implantado) | `dev/backend/ai-gateway/` |
| Testes | `dev/tests/unit/dialogue.test.js`, `dev/tests/unit/gateway.test.js`, `dev/tests/e2e/dialogue.mjs` |

## Mapeamento especificação → código

| Especificação (05) | Código |
|---|---|
| `DialogueActivity` | `activities[]` em `data/dialogues.js` (id `john-p<parte>-e<nn>` ou `-x<nn>` para mini-diálogos das seções complementares) |
| `DialogueLine` | `activities[].lines[]` (`en`, `pt` literal, `speaker`, `audio`, `src` com arquivo e linha do Markdown) |
| `LearningItem` | `items[]` (tabelas “English / Português”; `sourceLineIds` = falas que contêm o item) |
| `ComprehensionQuestion` | `questions[]` (401), de `dev/content/dialogues/john-questions.src.txt` → `john-questions.json` (`dev/tools/dialogues-questions.mjs`); complemento da IA, **não validado pelo professor** |
| `Attempt` | `kv → dialogues → acts[id].attempts[attemptId]` (status, score, threshold 80, feedback, evidence, evaluationMode, rubricVersion, evaluatorVersion, syncStatus) |
| `ItemMastery` | derivado das tentativas (`mastery()`), nunca guardado à parte |
| `ActivityProgress` | `acts[id]` (+ audições, rodadas, ordem sorteada, anotações); estado derivado por `activityStatus()` |
| Estados da atividade/fase/item | `activityStatus()`, `phaseStatuses()`, `mastery()` (+ `not_applicable` para fase sem itens no conteúdo) |

Progresso guardado em `kv → dialogues` (IndexedDB), separado das jornadas Daily Routine e Conversation Practice.

## Decisões técnicas (reversíveis; registradas aqui)

1. **Unidade = episódio.** Cada `Episode` vira uma atividade; seções complementares com falas (ex.: “Live race
   commentary”) viram atividades “complementares”. 46 atividades, 273 falas (conferidas caractere por caractere).
2. **Sem bloqueio entre diálogos.** As fases são sequenciais dentro de cada diálogo; os diálogos ficam todos abertos
   (16 diálogos curtos não têm 10 questões; um cadeado entre diálogos travaria a sequência neles). Decisão do PO pendente.
3. **Fase sem itens no conteúdo = “sem itens nesta atividade”** (15 diálogos sem vocabulário próprio nos documentos):
   não trava a fase seguinte e não conta como domínio; lacuna listada no relatório.
4. **Pista da fase 2** = significados (em português) dos itens de vocabulário presentes na fala, ou o contexto da cena;
   nunca a tradução completa da fala (que é a resposta da fase 3). Item que equivale à fala inteira é omitido da pista.
5. **Texto do diálogo na tela principal:** o inglês de cada fala aparece só depois de a fala ser escrita na fase 2; a
   tradução, só depois da tentativa avaliada na fase 3. O áudio de cada fala está sempre disponível.
6. **Escrita (fase 2):** nota = (palavras iguais + ½ × quase iguais) ÷ maior entre alvo e resposta, depois de
   normalizar contrações, grafia BrE/AmE e números com o verificador do app; variante aceita pelo verificador = 100.
   É correspondência textual, não semântica.
7. **Fala (fases 1 e 5):** reconhecimento Moonshine no aparelho; nota = palavras avaliadas reconhecidas ÷ avaliadas.
   Inconclusivo quando: sem reconhecimento, gravação sem voz, transcrição vazia/degenerada/cortada, ou menos de 60% do
   texto avaliável. Não é avaliação fonética (o app não tem tecnologia validada para isso). Áudio não é guardado.
8. **Tradução (fase 3):** localmente só decide dois casos seguros — igual à referência (aprovada) e resposta ainda em
   inglês (prática, sem nota). Todo o resto vai para a avaliação semântica online; sem serviço, sem conexão ou sem
   autorização do aluno, fica **pendente** (nada é simulado). A referência só aparece depois da avaliação.
9. **Compreensão (fase 4):** rodada de 10 questões, aprovada com ≥ 8/10; correção só depois do envio da rodada.
   Abaixo de 8, **só as questões erradas** voltam (as acertadas não se repetem); cada uma passa a contar ao ser
   acertada, e a fase é aprovada ao chegar a 8 de 10 (regra do PO de 2026-11-11: reapresentar os itens não dominados
   sem repetir os dominados). A resposta e a explicação de uma questão errada só aparecem depois de acertada — antes,
   só a pista da fala a reouvir; com a fase aprovada, o aluno pode refazer as restantes ou pedir “Ver as respostas”.
   Rubrica `dre-comprehension-2` (a versão 1, substituída, exigia nova rodada completa depois da recuperação).
   Questões de múltipla escolha (3 alternativas embaralhadas a cada rodada), uma habilidade cada: fato explícito, ação,
   intenção, contexto, relação ou inferência simples; diálogo com menos de 10 questões = fase indisponível.
10. **Audições:** contam só quando a reprodução termina de verdade (parar, trocar de tela ou tocar outro áudio não conta).
11. **Áudio:** 425 clipes britânicos gerados offline (Kokoro, Apache-2.0), uma voz por personagem
    (`dev/tools/build-dialogues.mjs`), mesmo pipeline dos demais conteúdos. Pacote offline: 16,6 → 20,5 MB.
12. **Avaliação online:** provider-neutral. O app só fala com o AI Gateway do produto, configurado no build
    (`DRG_EVAL_ENDPOINT`); a CSP passa a aceitar só essa origem. Pedido sem dados pessoais; `idempotency-key` =
    `attemptId`; resposta validada por esquema no gateway **e** no app; incoerência → inconclusivo. Fila com espera
    crescente; reenvio manual (“Enviar agora”) e automático ao reconectar.

## Limitações reais

- **Sem serviço de avaliação configurado**, a fase 3 só conclui com traduções idênticas à referência; as demais ficam
  pendentes até o gateway existir.
- **Fase 4 indisponível em 16 diálogos curtos** (menos de 10 questões sustentadas pelo texto) e, por consequência, a
  fase 5 também neles. Nos outros 30, as questões são complemento da IA e aguardam validação (decisão do PO).
- Reconhecimento de fala: transcrição de modelo pequeno e local; não comprova pronúncia; nomes próprios e palavras
  átonas não são julgados; voz humana e o Galaxy S25+ não foram testados nesta sessão.
- O corte de 80% sobre a nota da IA exige calibração com amostras revisadas por pessoa (falso positivo/negativo) antes
  de confiar nele (doc. 07).

## Validação no Galaxy S25+ (quando publicado)

1. Abrir o app atualizado; Início → “The Story of John” → Parte 1 → “A familiar face”.
2. Fase 1: tocar “Ouvir” três vezes até o fim (o botão de gravar só libera na 3ª); gravar cada item; conferir aprovado,
   “precisa de prática” e inconclusivo (gravar em silêncio). Instalar o reconhecimento quando pedido (≈ 38 MB).
3. Fase 2: conferir que a frase não aparece antes de enviar; enviar com erro e corrigido.
4. Fase 3: sem serviço configurado, ver a resposta ficar pendente; ligar modo avião, enviar, fechar e reabrir o app:
   continua salva.
5. Fase 4: ouvir três vezes o diálogo inteiro; responder às 10 questões; errar de propósito 3 e conferir que só elas
   voltam, sem a resposta antes da nova tentativa. Num diálogo curto (ex.: Parte 2, “Comparatives…”), ver o aviso.
6. Modo avião com o app já aberto uma vez: lista, diálogo e áudio funcionam.

## Auditoria de 2026-11-11 (rodada de correção depois de `399c1b2`)

| Verificação | Resultado |
|---|---|
| Diálogos previstos × presentes | 40 episódios nos 7 documentos = 40 atividades `episode`; mais 6 mini-diálogos complementares (`-x`). 273 falas conferidas literalmente (gerador e teste unitário). |
| Cinco fases em cada diálogo | Sim (motor único). Fase 1 “sem itens” em 15 diálogos (lacuna de vocabulário, D-004); fase 4 indisponível em 16 diálogos curtos. |
| Questões completas | 30 de 46 diálogos com 10; 16 com menos (ver lista abaixo). 401 questões; cada uma cita as falas/contexto que a sustentam. |
| Respostas e critérios coerentes | Conferência automática: estrutura, falas citadas existentes, 3 alternativas distintas, explicação com a evidência; palavras-chave da resposta presentes nas falas citadas (25 diferenças só de forma — isn't/doesn't, contrações — revisadas à mão; 1 citação corrigida). |
| Contradições documentação × código | Corrigidas nesta seção e nas decisões 2, 9 e limitações: o documento dizia “sem questões” e “nova rodada completa”; o resumo final lia um campo antigo da fase 4 (corrigido no código). |
| Regras individuais por item | Preservadas: 80% por item nas fases 1, 2, 3 e 5, sem média; inconclusivo/pendente não aprovam; 8/10 na fase 4. |

**Diálogos com menos de 10 questões** (questões / falas): p1-e05 9/5 · p1-e08 7/3 · p1-e09 4/4 · p2-x01 3/2 ·
p2-x02 3/1 · p3-e05 7/5 · p3-x01 4/4 · p3-x02 5/3 · p4-x01 8/3 · p5-e04 7/5 · p6-e01 8/5 · p6-e05 7/5 · p7-e02 7/5 ·
p7-e03 8/6 · p7-e07 8/6 · p7-x01 6/4.

### Observações de conteúdo (registradas, não alteradas)

- p7-e01: Mary sugere o trem das **8.40**; p7-e03/p7-e04: o trem para Edinburgh sai às **8.20**.
- p1-e09: Rick pergunta se John conheceu Peter “at the university”; John responde “Yes, … at a conference”.
- p1-e01: a abertura “Do you remember John Bennett?” é dita por Rick ao próprio John (ambígua).
- p5-e04: “a table for six” pode ser seis pessoas ou seis horas (nenhuma questão usa esse ponto).
- p5-e01: o contexto diz “John is at the office when the receptionist calls”, mas a ligação é para Mary.

As questões evitam esses pontos (distratores ajustados para não coincidir com os horários conflitantes).

### Avaliação online — o que está implementado e o que depende do PO

| Parte | Situação |
|---|---|
| Avaliação local (escrita, fala por transcrição local, tradução igual à referência, questões objetivas) | Implementada e testada; funciona offline. |
| Contrato da avaliação semântica (pedido mínimo, resposta validada por esquema, idempotência, fila offline) | Implementado e testado com serviço simulado nos testes. |
| AI Gateway de referência (`dev/backend/ai-gateway/`) | Código preparado e testado com provedor de teste; **não implantado**; nenhum adaptador de fornecedor real. |
| Provedor, conta, chave, custo, hospedagem, retenção | **Decisão do PO** — nada escolhido, criado ou contratado. Sem isso, traduções diferentes da referência ficam pendentes. |
