# Atividades de diálogo em cinco fases — The Story of John

Especificação: `docs/produto/mvp-dialogo/` (pacote do Product Owner de 11/11/2026, copiado sem alteração).
Decisões do PO posteriores à especificação: seção “Decisões do Product Owner (2026-11-11)” abaixo.
Publicado em 2026-11-11 (`gh-pages` `a6e8bbb`, build `b7dbb3b76936`); detalhes e evidências no `HANDOFF.md`.

## Onde está cada coisa

| Parte | Arquivo |
|---|---|
| Documentos autorais (fonte, sem alteração) | `dev/content/dialogues/source/the-story-of-john/*.md` |
| Correções aprovadas pelo PO (rastreáveis) | `dev/content/dialogues/john-corrections.json` |
| Conversão para dados (texto literal + correções, IDs estruturais) | `dev/tools/dialogues-source.mjs` → `dev/content/dialogues/john.json` + `john-report.json` (lacunas) |
| Questões de compreensão | `dev/content/dialogues/john-questions.src.txt` → `john-questions.json` (`dev/tools/dialogues-questions.mjs`) |
| Build do pacote do app + áudio + CSP | `dev/tools/build-dialogues.mjs` → `data/dialogues.js`, `dev/content/build/dialogues-audio-manifest.json` (o `build-app.mjs` roda questões → fonte → pacote) |
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
| `DialogueLine` | `activities[].lines[]` (`en`, `pt`, `speaker`, `audio`, `src` com arquivo e linha do Markdown; `correction` com o original quando corrigida) |
| `LearningItem` | `items[]` (tabelas “English / Português”; `sourceLineIds` = falas que contêm o item) |
| `ComprehensionQuestion` | `questions[]` (403): `prompt`, 3 `options`, `correctOptionId`, `explanation` (justificativa + fala citada), `skill`, `sourceLineIds`; `status` = origem (rastreabilidade interna, não exibida ao aluno) |
| `Attempt` | `kv → dialogues → acts[id].attempts[attemptId]` (status, score, threshold 80, feedback, evidence, evaluationMode, rubricVersion, evaluatorVersion, syncStatus) |
| `ItemMastery` | derivado das tentativas (`mastery()`), nunca guardado à parte |
| `ActivityProgress` | `acts[id]` (+ audições, rodadas, ordem sorteada, anotações); estado derivado por `activityStatus()` |
| Estados da atividade/fase/item | `activityStatus()`, `phaseStatuses()`, `mastery()` (+ `not_applicable` para fase sem itens no conteúdo) |

Progresso guardado em `kv → dialogues` (IndexedDB), separado das jornadas Daily Routine e Conversation Practice.

## Regras pedagógicas vigentes

| Fase | Regra |
|---|---|
| 1 Vocabulário | Cada item ouvido 3 vezes até o fim; depois, produção oral; ≥ 80% de correspondência **por item**. |
| 2 Escuta e escrita | Pista em português (sem a tradução completa) + áudio; resposta em inglês; ≥ 80% **por frase**; frase só aparece depois do envio. |
| 3 Tradução | Fala em inglês → português; avaliação semântica; ≥ 80% **por fala**; referência só depois da avaliação. |
| 4 Compreensão | 3 audições completas do diálogo; rodada com **todas as questões que o diálogo sustenta** (10, ou menos nos diálogos curtos); aprovação com **80% arredondado para cima** (10 → 8; 9 → 8; 8 → 7; 7 → 6; 6 → 5; 5 → 4; 4 → 4; 3 → 3); só as erradas voltam, e contam ao serem acertadas; resposta e explicação só depois de acertar. |
| 5 Leitura em voz alta | ≥ 80% de correspondência confiável por fala; **abre quando a fase 3 termina** (ou quando todas as traduções foram enviadas e só aguardam avaliação online), independentemente da fase 4. |

Em todas: média não compensa item abaixo do corte; item aprovado não volta; inconclusivo e pendente não aprovam nem
reprovam; tentativas e resultados preservados; sem XP, níveis, moedas, recompensas ou ranking. A atividade só é
concluída com as cinco fases.

## Decisões técnicas

1. **Unidade = episódio.** Cada `Episode` vira uma atividade; seções complementares com falas (ex.: “Live race
   commentary”) viram atividades “complementares”. 46 atividades, 273 falas.
2. **Sem bloqueio entre diálogos.** As fases seguem a ordem acima dentro de cada diálogo; os diálogos ficam todos
   abertos (decisão de produto ainda não tomada; não bloqueia nada).
3. **Fase 1 sem itens no conteúdo = “sem itens nesta atividade”** (15 diálogos sem vocabulário próprio nos documentos):
   não trava a fase seguinte e não conta como domínio; lacuna listada no relatório (D-004).
4. **Pista da fase 2** = significados (em português) dos itens de vocabulário presentes na fala, ou o contexto da cena;
   nunca a tradução completa da fala (que é a resposta da fase 3). Item que equivale à fala inteira é omitido da pista.
5. **Texto do diálogo na tela principal:** o inglês de cada fala aparece só depois de a fala ser escrita na fase 2; a
   tradução, só depois da tentativa avaliada na fase 3. O áudio de cada fala está sempre disponível.
6. **Escrita (fase 2):** nota = (palavras iguais + ½ × quase iguais) ÷ maior entre alvo e resposta, depois de
   normalizar contrações, grafia BrE/AmE e números com o verificador do app; variante aceita pelo verificador = 100.
   É correspondência textual, não semântica.
7. **Fala (fases 1 e 5):** reconhecimento Moonshine no aparelho; nota = palavras avaliadas reconhecidas ÷ avaliadas.
   Inconclusivo quando: sem reconhecimento, gravação sem voz, transcrição vazia/degenerada/cortada, ou menos de 60% do
   texto avaliável. **Não é avaliação fonética** (o app não tem tecnologia validada para isso). Áudio não é guardado.
   Desde 2026-11-11 (correção de voz): a fase 1 transcreve **todo** item só no trecho com voz (mesmo recorte da prática
   de palavras do Speaking Lab: `speechBounds`, margem de 0,15 s); a fase 5 recorta as falas de até 4 palavras (as longas
   vão inteiras, pelo limite de 6 tokens/s do Moonshine). Transcrição que para no começo do texto, sem nada ouvido no
   lugar do resto (`tailMiss`), ganha uma 2ª passada no outro modo — vale a que reconhecer mais palavras; se ainda faltar
   o fim e a gravação tiver mais voz do que as palavras ouvidas explicam (0,3 s de voz por sílaba + 0,3 s), a tentativa
   fica **inconclusiva** (corte do reconhecedor, não erro do aluno). As fases 1 e 5 carregam o léxico, como o Speaking
   Lab. A tentativa guarda só metadados do reconhecimento (modo, 2ª passada, corte, segundos de voz), nunca o áudio.
8. **Tradução (fase 3):** localmente só decide dois casos seguros — igual à referência (aprovada) e resposta ainda em
   inglês (prática, sem nota). Todo o resto vai para a avaliação semântica online; sem serviço, sem conexão ou sem
   autorização do aluno, fica **pendente** (nada é simulado). A referência só aparece depois da avaliação.
9. **Compreensão (fase 4):** ver a tabela acima. Rubrica `dre-comprehension-2`. Rodada feita com outro número de
   questões (conteúdo alterado depois) não vale: o aluno faz uma rodada nova. Múltipla escolha com 3 alternativas
   embaralhadas a cada rodada; cada questão tem uma habilidade (fato explícito, ação, intenção, contexto, relação ou
   inferência simples).
10. **Audições:** contam só quando a reprodução termina de verdade (parar, trocar de tela ou tocar outro áudio não conta).
11. **Áudio:** 425 clipes britânicos gerados offline (Kokoro, Apache-2.0), uma voz por personagem
    (`dev/tools/build-dialogues.mjs`), mesmo pipeline dos demais conteúdos. As 6 falas corrigidas ganharam áudio novo;
    os 6 clipes antigos (sem nenhuma referência) foram removidos.
12. **Avaliação online:** provider-neutral. O app só fala com o AI Gateway do produto, configurado no build
    (`DRG_EVAL_ENDPOINT`); a CSP passa a aceitar só essa origem. Pedido sem dados pessoais; `idempotency-key` =
    `attemptId`; resposta validada por esquema no gateway **e** no app; incoerência → inconclusivo. Fila com espera
    crescente; reenvio manual (“Enviar agora”) e automático ao reconectar.

## Decisões do Product Owner (2026-11-11)

| Decisão | Implementação | Justificativa registrada |
|---|---|---|
| As questões de compreensão integram o produto, sem exigir validação por professor (metodologia própria do DRE). | 403 questões ativas; nenhum aviso ao aluno; a origem fica em `status` de cada questão (rastreabilidade interna). | Autorização expressa do PO. |
| Diálogos curtos: rodada reduzida com corte proporcional de 80%, sem inventar questões. | `passMark(n) = ⌈0,8 n⌉`; 16 diálogos com 3 a 9 questões. | Mantém a exigência de 80% sem bloquear a fase. |
| Fase 5 independente da fase 4. | `PREREQ.reading = 'translation'`; tradução só aguardando avaliação online também abre as fases 4 e 5. | A leitura em voz alta não pode ficar bloqueada pela compreensão; pendência online não bloqueia conteúdo independente (doc. 01 §5). |
| Corrigir as inconsistências do conteúdo derivado, com rastreabilidade. | `john-corrections.json` (12 campos); a fonte fica intacta; cada fala corrigida guarda o original e o motivo. | Não deixar contradições conhecidas no produto. |

### Correções de conteúdo (aplicadas ao conteúdo derivado; fonte preservada)

| Onde | Antes | Depois | Motivo |
|---|---|---|---|
| p7-e01 l05 | “You could take the 8.40 train.” | “You could take the 8.20 train.” | p7-e03/e04 usam o trem das 8.20. |
| p7-e01 l07 | “About three and a half hours.” | “About two and a half hours.” | Com 3h30 nenhum trem chegaria “antes das onze”; com ~2h30: 8.20 → ~10h50 e o das 9.05 com paradas → ~11h30 (p7-e05). |
| p1-e09 l01–l02 | “Did you meet Peter at the university?” / “Yes, I met him last week at a conference.” | “When did you last see Peter?” / “I met him last week at a conference.” | Pergunta e resposta se contradiziam; Peter é vizinho e amigo de John. |
| p1-e01 l01 | “Do you remember John Bennett?” | “John Bennett? Do you remember me?” | Rick perguntava ao próprio John se ele lembrava de John Bennett. |
| p5-e04 l02 | “…a table for six.” | “…a table for six people.” | Ambíguo com o horário (5h30); a tradução do documento já dizia “seis pessoas”. |
| p5-e01 contexto | “John is at the office when the receptionist calls.” | “Mary is at the office when the receptionist calls her.” | A ligação é para Mary; John não está na cena. |

As traduções das falas corrigidas foram ajustadas da mesma forma. Questões afetadas: p7-e01 (trem e duração),
p1-e09 (+1 questão sobre a conferência), p5-e04 (+1 questão sobre o número de pessoas).

## Questões de compreensão por diálogo

30 diálogos com 10 questões; 16 com rodada reduzida (questões / falas): p1-e05 9/5 · p1-e08 7/3 · p1-e09 5/4 ·
p2-x01 3/2 · p2-x02 3/1 · p3-e05 7/5 · p3-x01 4/4 · p3-x02 5/3 · p4-x01 8/3 · p5-e04 8/5 · p6-e01 8/5 · p6-e05 7/5 ·
p7-e02 7/5 · p7-e03 8/6 · p7-e07 8/6 · p7-x01 6/4. Total: 403 (fato explícito 180, intenção 57, inferência 57,
ação 43, relação 38, contexto 28). Cada questão cita as falas (ou o contexto/título) que a sustentam; nenhuma usa
conhecimento externo.

## Limitações reais

- **Sem serviço de avaliação configurado**, a fase 3 só é *aprovada* com traduções idênticas à referência; as demais
  ficam pendentes até o gateway existir. As fases 4 e 5 abrem mesmo assim quando todas as falas foram traduzidas (o
  resultado semântico não é pré-requisito delas); a atividade só fica “concluída” quando as avaliações chegarem.
- Reconhecimento de fala: transcrição de modelo pequeno e local; não comprova pronúncia; nomes próprios e palavras
  átonas não são julgados; voz humana e o Galaxy S25+ não foram testados pelo executor.
- O corte de 80% sobre a nota da IA exige calibração com amostras revisadas por pessoa (falso positivo/negativo) antes
  de confiar nele (doc. 07).

## Avaliação online — o que está implementado e o que depende do PO

| Parte | Situação |
|---|---|
| Avaliação local (escrita, fala por transcrição local, tradução igual à referência, questões objetivas) | Implementada e testada; funciona offline. |
| Contrato da avaliação semântica (pedido mínimo, resposta validada por esquema, idempotência, fila offline) | Implementado e testado com serviço simulado nos testes. |
| AI Gateway de referência (`dev/backend/ai-gateway/`) | Código preparado e testado com provedor de teste; **não implantado**; nenhum adaptador de fornecedor real. |
| Provedor, conta, chave, custo, hospedagem, retenção | **Decisão do PO** (fora das autorizações recebidas) — nada escolhido, criado ou contratado. |

## Validação no Galaxy S25+

1. Abrir o app publicado; Início → “The Story of John” → Parte 1 → “A familiar face”.
2. Fase 1: tocar “Ouvir” três vezes até o fim (gravar só libera na 3ª); gravar cada item; conferir aprovado,
   “precisa de prática” e inconclusivo (gravar em silêncio). Instalar o reconhecimento quando pedido (≈ 38 MB).
3. Fase 2: a frase não aparece antes de enviar; enviar com erro e corrigido.
4. Fase 3: sem serviço configurado, uma resposta diferente da referência fica pendente; modo avião, enviar, fechar e
   reabrir: continua salva.
5. Depois da fase 3: as fases 4 e 5 aparecem disponíveis ao mesmo tempo.
6. Fase 4: ouvir três vezes; responder; errar de propósito e conferir que só as erradas voltam, sem a resposta antes.
   Num diálogo curto (ex.: Parte 2, “Comparatives, superlatives and ages”, 3 questões), a rodada é de 3 e exige 3/3.
7. Modo avião com o app já aberto uma vez: lista, diálogo e áudio funcionam.

## Histórico deste documento

- 2026-11-11 (`399c1b2`): criação; questões ausentes; fase 4 com nova rodada completa depois da recuperação.
- 2026-11-11 (`5b2d973`): 401 questões (complemento da IA, à espera de validação); fase 4 só com as erradas; diálogos
  curtos com fase 4 indisponível; inconsistências apenas registradas.
- 2026-11-11 (esta versão): decisões do PO — questões integradas sem exigir validação, rodada reduzida proporcional,
  fase 5 independente da 4, inconsistências corrigidas com rastreabilidade (403 questões).
