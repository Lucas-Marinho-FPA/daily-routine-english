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
| `ComprehensionQuestion` | `questions[]` — vazio: os documentos não trazem as dez questões (ver pendências) |
| `Attempt` | `kv → dialogues → acts[id].attempts[attemptId]` (status, score, threshold 80, feedback, evidence, evaluationMode, rubricVersion, evaluatorVersion, syncStatus) |
| `ItemMastery` | derivado das tentativas (`mastery()`), nunca guardado à parte |
| `ActivityProgress` | `acts[id]` (+ audições, rodadas, ordem sorteada, anotações); estado derivado por `activityStatus()` |
| Estados da atividade/fase/item | `activityStatus()`, `phaseStatuses()`, `mastery()` (+ `not_applicable` para fase sem itens no conteúdo) |

Progresso guardado em `kv → dialogues` (IndexedDB), separado das jornadas Daily Routine e Conversation Practice.

## Decisões técnicas (reversíveis; registradas aqui)

1. **Unidade = episódio.** Cada `Episode` vira uma atividade; seções complementares com falas (ex.: “Live race
   commentary”) viram atividades “complementares”. 46 atividades, 273 falas (conferidas caractere por caractere).
2. **Sem bloqueio entre diálogos.** As fases são sequenciais dentro de cada diálogo; os diálogos ficam todos abertos
   (com as questões ausentes, um cadeado entre diálogos travaria tudo depois do primeiro). Decisão do PO pendente.
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
9. **Compreensão (fase 4):** rodada de 10 questões, aprovada com ≥ 8/10; correção só depois do envio. Reprovada →
   recuperação obrigatória das questões erradas (com explicação) → nova rodada completa. Recuperação não aprova a fase.
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
- **Fase 4 bloqueada por conteúdo** em todos os diálogos (nenhuma questão curada) e, por consequência, a fase 5 também.
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
5. Fase 4: com as questões curadas, ouvir três vezes o diálogo inteiro; sem elas, ver o aviso de conteúdo pendente.
6. Modo avião com o app já aberto uma vez: lista, diálogo e áudio funcionam.
