# 03 — Arquitetura Funcional, Estados e Regras de Transição

## Unidade funcional

A unidade é `DialogueActivity`, composta por contexto narrativo, falas, itens linguísticos, áudios, questões e cinco fases. O mesmo componente deve servir às sete partes e a diálogos futuros.

## Estados da atividade

- `not_started`
- `in_progress`
- `waiting_for_online_evaluation`
- `ready_to_resume`
- `completed`
- `blocked_by_content` (por ausência de áudio/referência obrigatória ou conteúdo inválido, com diagnóstico)

## Estados por item

- `unseen`
- `listening` (contagem de audições)
- `awaiting_response`
- `submitted`
- `evaluating`
- `pending_evaluation`
- `passed`
- `needs_practice`
- `inconclusive`

Estados precisam ser derivados de evidências persistidas, não apenas de variáveis temporárias da tela.

## Máquina de estados por fase

Cada fase tem:
- `locked`: fase anterior não concluída;
- `available`: pode iniciar;
- `in_progress`;
- `pending_online`: depende de avaliação remota;
- `completed`;
- `needs_retry`.

A transição para a próxima fase só ocorre quando todos os itens obrigatórios da fase atual atendem ao critério.

## Retomada

- Salvar após cada audição concluída, resposta enviada, gravação finalizada e avaliação recebida.
- Ao reabrir, retomar no item pendente mais relevante.
- Evitar duplicar envio de uma mesma tentativa; usar `attemptId` idempotente.
- Nunca perder uma resposta quando a rede cair após o envio; manter fila local até confirmação.
- Exibir estado claro: salvo localmente, aguardando avaliação, avaliação concluída, erro recuperável.

## Correção e resultado

Cada resultado deve incluir:
- `score` (0–100 quando aplicável);
- `threshold` (80 para itens com domínio percentual);
- `status` (`passed`, `needs_practice`, `inconclusive`, `pending`);
- `feedback`;
- `evidence` e método usado;
- `evaluatedAt`;
- `evaluatorVersion`;
- `rubricVersion`.

Percentual não deve ser calculado quando a evidência não suporta quantificação confiável.

## Compreensão

Dez questões objetivas; uma questão individual não tem nota percentual intermediária. Registrar `correct/incorrect`. Rodada aprovada com 8/10 (decisão operacional proposta nesta arquitetura). Mostrar feedback após envio da rodada, depois permitir recuperação das questões erradas.

## Resultado final

Apresentar:
- conclusão por fase;
- domínio por palavra/expressão/frase;
- resultado da compreensão;
- itens que precisaram de repetição;
- avaliações inconclusivas/pendentes, se houver;
- recomendações de revisão.

Não usar pontuação total como substituto de critérios por item. Não converter o resultado em XP ou recompensa.
