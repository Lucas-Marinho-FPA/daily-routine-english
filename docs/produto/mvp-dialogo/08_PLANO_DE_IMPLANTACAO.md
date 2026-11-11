# 08 — Plano de Implantação para Claude Code / CoWork

## Regra de execução

O agente deve começar inspecionando o repositório e o estado real do Git. Os documentos são especificação de produto, mas snapshots técnicos são históricos e não substituem inspeção.

## Etapa 0 — Auditoria obrigatória (sem modificar)

- Confirmar repo, branch, commit, working tree e remotes.
- Confirmar estrutura atual, build, dados, rotas, componentes e testes.
- Mapear motor de atividades, checker, áudio, ASR, IndexedDB, PWA e identidade visual.
- Identificar implementação atual do diálogo e o que pode ser reaproveitado.
- Identificar infraestrutura online existente, autenticação, backend e configuração.
- Identificar arquivos das sete partes e mapear conteúdo/áudios.
- Produzir relatório curto: achados, divergências, riscos, arquitetura proposta e plano de alterações.

Não parar para pedir confirmação de detalhes que podem ser descobertos no código. Não modificar nesta etapa.

## Etapa 1 — Plano técnico e bloqueios externos

- Mapear contratos reais para os contratos conceituais deste pacote.
- Propor backend seguro para AI Gateway se não existir.
- Comparar opções de fornecedor com qualidade, custo e privacidade.
- Identificar decisões que exigem credencial, conta cloud, cobrança, política legal ou aprovação do Product Owner.
- Não criar recursos pagos ou credenciais.
- Implementar adapters e mocks locais apenas quando não fingirem avaliação real.

## Etapa 2 — Implementação incremental

- Criar/ajustar modelo de conteúdo para `The Story of John`.
- Implementar máquina de estados e persistência.
- Implementar fases 1–5.
- Implementar AI Gateway/evaluation adapter somente sobre infraestrutura autorizada.
- Implementar conectividade, fila e idempotência.
- Adaptar UI mobile mantendo identidade visual existente.
- Atualizar testes pertinentes.

## Etapa 3 — Integração de conteúdo

- Integrar as sete partes preservando texto, ordem, personagens, traduções e atividades.
- Validar IDs únicos e estáveis.
- Mapear cada fala aos áudios reais; não inventar referências.
- Listar áudios ausentes e conteúdo incompleto.
- Não alterar silenciosamente inglês/português validado.
- Se houver erro de conteúdo, registrar e propor correção com proveniência.

## Etapa 4 — Validação

- Rodar testes unitários pertinentes.
- Rodar E2E de atividade, áudio, ASR, persistência, offline/online e retomada.
- Validar limiar individual.
- Fazer smoke test mobile.
- Informar o que não pôde ser validado em aparelho real.
- Verificar que nenhuma recompensa/XP foi introduzida.

## Entrega ao Product Owner

Entregar:
1. resumo do que foi implementado;
2. branch e commit de partida/final;
3. arquivos alterados;
4. arquitetura final e decisões tomadas;
5. testes com comandos e resultados;
6. conteúdo/áudios integrados e pendências;
7. limitações de IA/ASR;
8. infraestrutura, credenciais ou custos ainda necessários;
9. instruções para validar no Galaxy S25+.

## Limites de autorização

Esta solicitação autoriza implementação no ambiente/branch de trabalho disponível, com mudanças locais e testes. **Não autoriza** push, merge, deploy, publicação, criação de cobrança/conta cloud, contratação de serviço, migração destrutiva ou exposição de dados. Pedir autorização específica antes dessas ações.
