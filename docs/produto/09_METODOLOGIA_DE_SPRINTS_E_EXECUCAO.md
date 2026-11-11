# Metodologia de Sprints e Execução

## Princípios
Uma sessão Claude/CoWork por sprint relevante; manter nela discussão, implementação, testes e decisões. Consolidar documentos ao fechar sprint, não a cada alteração pequena. Não ampliar escopo silenciosamente.

## Autonomia durante a execução
- Tratar documentos, decisões, checklist e evidências existentes como memória operacional do projeto; consultá-los antes de perguntar.
- Não transferir ao usuário investigações que possam ser feitas no repositório, nos arquivos, no histórico ou nos registros disponíveis.
- Resolver divergências por rastreabilidade e precedentes. Se uma contagem, ID ou nomenclatura divergir, localizar a origem, reconciliar a estrutura e registrar a justificativa; não pedir ao usuário que arbitre detalhes administrativos.
- Aplicar decisões já aprovadas sem nova confirmação. A ausência de um registro perfeito não apaga uma decisão explícita já documentada.
- Separar bloqueio real de pendência interna. Pendência interna deve ter responsável e ação; bloqueio real deve vir acompanhado do trabalho independente já concluído e da decisão estritamente necessária.
- Nunca usar o usuário como mensageiro entre ferramentas, agentes ou executores.

## Antes
1. Ler instruções e documentos pertinentes.
2. Inspecionar branch, commit, working tree e estrutura.
3. Ler handoff/relatórios anteriores.
4. Definir objetivo, escopo, fora de escopo, dependências e riscos.
5. Listar arquivos/módulos afetados e critérios de aceite.

## Durante
Implementar em incrementos pequenos; preservar decisões; registrar decisões novas; colocar ideias fora de escopo no backlog; resolver autonomamente pendências operacionais; apresentar evidência, solução recomendada e impacto apenas diante de bloqueio real ou decisão reservada ao dono do produto.

## Fechamento
Registrar objetivo, escopo executado, arquivos alterados, comportamento, testes/resultados, evidências/build/commit, pendências, riscos, checklist atualizado e próximo passo.

## Modelo
### Sprint N — Nome
Status; objetivo; escopo autorizado; fora do escopo; dependências/riscos; plano; arquivos; testes/aceite; evidências; pendências; ideias para backlog.

## Publicação
Exige autorização explícita. Confirmar origem/destino, não usar force push e não presumir que branch de remodelagem substitui a publicada. Preservar referência recuperável antes de mudanças de alto impacto.

## Protocolo de autonomia e encaminhamento entre projetos
1. Antes de perguntar, consultar decisões, documentos e evidências pertinentes. Consultar somente as fontes relevantes à dúvida; não repetir leitura integral sem motivo.
2. Resolver dentro da sprint as decisões técnicas locais, reversíveis e de baixo impacto que estejam cobertas pelo escopo e pelas regras aprovadas.
3. Não tomar decisões pedagógicas, não criar/alterar conteúdo da Base Pedagógica e não criar/atribuir códigos de-para. Encaminhar essas demandas ao projeto Base de Conhecimento, preservando o contexto e as evidências.
4. Não transformar o usuário em mensageiro entre ChatGPT, Claude/Cloud Work e o projeto Base de Conhecimento. Registrar o encaminhamento no handoff e manter o trabalho independente em andamento.
5. Pedir decisão ao usuário apenas quando a governança exigir sua aprovação. A solicitação deve ser única, objetiva e acompanhada de recomendação e impacto.
6. Relatar problemas com solução executada ou plano de resolução; não entregar apenas inventário de pendências.

## Padrão de comunicação
Atualizações ao usuário devem ser sucintas e diretas: resultado, o que precisa ser feito (se houver) e bloqueio real (se houver). Detalhar o processo somente quando solicitado.
