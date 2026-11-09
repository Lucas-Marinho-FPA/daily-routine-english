# Regras de trabalho — robustez sem desperdício

## 1. Teste de necessidade
Antes de abrir uma tarefa ou criar artefato, responda:
- Qual problema real existe hoje?
- Qual evidência confirma o problema?
- Já há mecanismo que o resolve?
- Qual o risco de não agir?
- Qual a menor solução suficiente?

Se não houver benefício concreto, não execute.

## 2. Evitar retrabalho
- Não refazer trabalho concluído cuja evidência continua válida.
- Não repetir auditorias integrais por rotina.
- Não reexecutar testes sem mudança relevante ou indício de regressão.
- Não reabrir decisões aprovadas sem fato novo ou erro demonstrável.
- Não importar automaticamente tarefas de checklists antigos.
- Não duplicar documentos, scripts, validadores ou inventários.
- Não criar fases, cerimônias ou relatórios para aparentar progresso.

## 3. Dados e preservação
- Nunca descartar ou sobrescrever fontes originais.
- Preservar integralmente atividades, respostas, correções, comentários e exemplos.
- Distinguir conteúdo original, resposta do aluno, correção/comentário do professor, análise de IA e complemento de IA.
- Não atribuir ao professor conteúdo de IA.
- Não converter candidatos em fatos sem evidência.
- Registrar decisões novas e a relação com decisões substituídas, sem apagar a história.

## 4. Direitos e exposição
Conteúdo de terceiros sem autorização/licença de redistribuição não deve entrar na distribuição pública do aplicativo. Identificadores e mapeamentos internos protegidos não devem aparecer em arquivos públicos, builds ou mensagens de commit.

## 5. Ferramentas e arquitetura
- Preferir evolução de ferramentas existentes a duplicação.
- Não introduzir serviços externos, APIs, dependências ou infraestrutura sem necessidade demonstrada e aprovação quando houver mudança de escopo.
- Não editar manualmente artefatos gerados se houver gerador reproduzível.
- Preservar a abordagem offline/local do aplicativo consumidor.

## 6. Testes e evidências
- Testar as áreas alteradas e impactos plausíveis.
- Reaproveitar testes/evidências recentes quando ainda válidos.
- Executar suíte ampla quando o risco justificar, não por hábito.
- Relatar comandos, resultados e limites.
- Separar evidência histórica de execução feita na sessão atual.

## 7. Git
- Conferir branch, HEAD e árvore de trabalho antes de agir.
- Não sobrescrever alterações locais.
- Não fazer commit, push, rebase, reset destrutivo, force-push ou publicação sem autorização explícita.
- Não reescrever histórico por questões menores.

## 8. Entrega
Resumo objetivo:
- problema e solução;
- arquivos/áreas alterados;
- testes e evidências;
- pendências reais;
- próximo passo mínimo.
