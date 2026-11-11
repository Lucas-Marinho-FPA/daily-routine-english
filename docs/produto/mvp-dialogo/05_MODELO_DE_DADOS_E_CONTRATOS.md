# 05 — Modelo de Dados e Contratos Conceituais

Este documento define contratos conceituais. O agente deve mapear para os esquemas reais existentes, evitando migração desnecessária e preservando IDs atuais.

## Entidades

### DialogueActivity
- `id`: estável e único
- `contentVersion`
- `title`
- `contextDescription`
- `locale`: referência BrE (`en-GB`) quando aplicável
- `characterIds`
- `lineIds`
- `learningItemIds`
- `questionIds`
- `phaseConfig`
- `provenance`

### DialogueLine
- `id`
- `activityId`
- `sequence`
- `speakerId`
- `englishText`
- `audioRef` (opcional; validar arquivo real)
- `portugueseReference` (oculto antes da fase 3 e da tentativa pertinente)
- `acceptedVariants` (quando curadas)
- `linguisticTags`

### LearningItem
- `id`
- `activityId`
- `type`: `word | phrasal_verb | collocation | chunk | expression | pattern`
- `english`
- `contextMeaningPtBr`
- `audioRef`
- `sourceLineIds`
- `examples`
- `explanation`
- `pronunciationTarget` (se definido por fonte confiável)
- `masteryThreshold`: 80

### ComprehensionQuestion
- `id`
- `activityId`
- `prompt`
- `options`
- `correctOptionId`
- `explanation`
- `skill`: `explicit_fact | action | intention | context | relation | inference`
- `sourceLineIds`

### Attempt
- `attemptId` idempotente
- `activityId`, `phaseId`, `itemId`
- `inputType`
- `response` ou referência local protegida
- `status`
- `score` opcional
- `threshold`
- `feedback`
- `evidence`
- `evaluationMode`: `local_deterministic | local_asr | remote_ai | human_review`
- `rubricVersion`, `evaluatorVersion`
- timestamps
- `syncStatus`

### ItemMastery
- `itemId`
- `phaseId`
- `status`
- `bestValidScore`
- `lastValidScore`
- `attemptCount`
- `evidenceRefs`
- `lastPractisedAt`
- `nextReviewAt`

### ActivityProgress
- `activityId`
- `currentPhase`
- `currentItemId`
- `phaseStatuses`
- `completedAt`
- `pendingAttemptIds`
- `contentVersion`

## Contrato de avaliação semântica (conceitual)

Entrada:
- texto-alvo em inglês ou referência semântica curada;
- resposta do aluno em português;
- contexto da fala e personagem;
- rubrica e limiar;
- variantes aceitas conhecidas;
- idioma/região da resposta.

Saída estruturada:
- `status`: `evaluated | inconclusive | pending`
- `score`: 0–100, somente se avaliável
- `meaningPreserved`: boolean
- `preservedElements`: lista curta
- `omissions`: lista
- `distortions`: lista
- `naturalnessNotes`: lista opcional
- `suggestedTranslation`
- `explanationPtBr`
- `rubricVersion`

Não usar correspondência literal como único critério. Não deixar o modelo inventar fatos fora do contexto. Saída deve ser validada por schema no backend.

## Contrato de avaliação oral

Separar:
- `transcriptionReliability`
- `lexicalCorrespondence`
- `completeness`
- `rhythmEvidence` (somente se medido)
- `phoneticAssessment` (somente se tecnologia validada realmente fornecer)
- `status`

Não transformar `ASR confidence` em nota de pronúncia. `inconclusive` não reprova.

## Contrato de correção de escrita

- Aceitar pontuação/capitalização toleradas quando não mudarem significado.
- Considerar contrações e variantes curadas.
- Identificar omissões, inserções, substituições, ordem, ortografia e gramática.
- Diferenciar variante aceitável de erro.
- Expor explicação depois da submissão.
- Score individual calculado por critérios consistentes e testados; nunca alegar semântica avançada se o algoritmo for apenas textual.

## Versionamento

Rubricas, conteúdo e avaliadores devem ter versões. Uma alteração de rubrica não pode reescrever silenciosamente tentativas antigas. Persistir evidência e versão usada.
