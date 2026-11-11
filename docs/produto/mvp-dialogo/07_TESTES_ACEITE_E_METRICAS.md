# 07 — Testes, Aceite e Métricas de Qualidade

## Regras de teste

Testar o que mudou e o que pode ser afetado. Não repetir bateria completa sem justificativa. Confirmar estado atual das suítes antes de executar.

## Casos críticos de progressão

1. Item com 79% não é aprovado.
2. Item com 80% válido é aprovado.
3. Média de fase ≥80% não aprova item individual abaixo de 80%.
4. Item aprovado não volta a pendente quando outro falha.
5. Tentativa inconclusiva não aprova nem reprova.
6. Falha de internet preserva tentativa pendente.
7. Reenvio idempotente não duplica tentativa.
8. Retomar após fechar/reabrir preserva fase e item.
9. Áudio não conta como ouvido se reprodução não foi concluída.
10. A fase 1 não libera gravação antes de três audições concluídas.
11. Fase 2 não mostra inglês-alvo antes da submissão.
12. Fase 3 não mostra tradução de referência antes da submissão.
13. Fase 4 só libera as dez questões depois de três audições integrais.
14. Feedback das questões só aparece após envio da rodada.
15. Leitura oral não reprova quando transcrição está incompleta/inconclusiva.
16. Percentual de fala é identificado como correspondência, salvo avaliação fonética real.
17. Sem XP, níveis, pontos, streaks, moedas ou recompensas na UI.
18. Daily Routine e Conversation Practice mantêm progresso separado.

## Qualidade da avaliação

Criar conjunto de validação com:
- tradução literal correta;
- paráfrase natural correta;
- variantes brasileiras naturais;
- omissão de informação;
- inversão de negação/tempo/pessoa;
- erro gramatical relevante;
- resposta fora de contexto;
- resposta curta mas semanticamente suficiente;
- erros de transcrição e ruído;
- sotaques e velocidades variadas, quando possível.

A rubrica deve ser versionada. Amostras avaliadas por modelo precisam de revisão humana/curadoria antes de confiar no corte de 80%. Medir falso positivo (resposta errada aprovada) e falso negativo (resposta válida reprovada).

## Matriz de impacto

| Mudança | Testes |
|---|---|
| Conteúdo | schema, IDs, áudios, referências e integridade |
| Correção IA | contrato, rubrica, casos adversariais, timeout e custo |
| Fala/ASR | permissões, confiabilidade, corte de áudio, inconclusivo |
| Progressão | limiar individual, retomada, persistência |
| Sync | offline, retry, duplicidade, conflito |
| UX | mobile, acessibilidade, estados de erro e conclusão |
| PWA | cache, atualização e retomada |
| Backend | autenticação, rate limit, segredo, validação e logs |

## Aceite funcional

- Todas as cinco fases podem ser concluídas em cenário online.
- Itens abaixo de 80% permanecem para prática.
- Resultados inconclusivos não bloqueiam injustamente nem aprovam.
- Tentativas pendentes são preservadas offline e processadas ao reconectar.
- Correção semântica aceita paráfrases válidas e explica erros.
- Sem exposição antecipada de tradução/gabarito.
- Sem regressão nas jornadas existentes.
- Sem chamadas externas não aprovadas além do backend/provider configurado.
- Sem segredos no cliente.
- Build reproduzível e testes registrados.
- Experiência mobile verificada; aparelho Android real planejado para voz/PWA.

## Evidências de entrega

Registrar branch/commit de partida, arquivos alterados, testes executados, resultados, limitações, decisões pendentes, custos/serviços necessários e instruções de validação.
