# Checklist de continuidade — executar uma vez na transição

Esta lista não é um novo plano de desenvolvimento. É uma conferência mínima para uma nova sessão assumir o trabalho sem retrabalho.

## Inventário somente leitura
- [ ] Confirmar repositório correto: `Lucas-Marinho-FPA/daily-routine-english`.
- [ ] Confirmar branch `base-pedagogica` (não trocar de branch sem avisar).
- [ ] Registrar HEAD, `git status` e commits recentes.
- [ ] Localizar instruções, checklist, arquitetura, modelo de dados, política de preservação, rastreabilidade e histórico de decisões vigentes.
- [ ] Identificar mudanças desde o snapshot `3d1ab20`, somente as relevantes.
- [ ] Verificar quais validações e testes existentes continuam aplicáveis e quais evidências recentes podem ser reaproveitadas.
- [ ] Separar: concluído válido, mudança posterior, pendência real, bloqueio real e item obsoleto.
- [ ] Apresentar proposta mínima de atualização documental, se necessária.

## Restrições durante o inventário
- Somente leitura: não editar, mover, renomear ou apagar arquivos.
- Não rodar consolidação completa nem geração em massa.
- Não executar suíte integral de testes por rotina.
- Não criar scripts, fases, documentos ou roadmap novos.
- Não fazer commit, push, rebase, force-push ou publicação.
- Se surgir evidência de risco imediato à integridade, parar e reportar antes de agir.

## Depois que o usuário aprovar a continuidade
Manter o checklist operacional vigente no repositório como fonte única. Ativar apenas tarefas que:
- tenham benefício concreto;
- não estejam concluídas;
- não sejam duplicatas;
- possuam resultado verificável.

Para cada tarefa, registrar motivo, resultado esperado, dependência real, status e evidência. Encerrar itens concluídos; retirar tarefas superadas do fluxo ativo, preservando decisões/histórico relevantes.
