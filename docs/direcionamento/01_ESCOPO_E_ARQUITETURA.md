# Escopo e arquitetura essencial — Base Pedagógica

## Finalidade
A Base Pedagógica é o patrimônio estruturado de conhecimento linguístico e pedagógico que poderá alimentar o Daily Routine English. Deve ser cumulativa, rastreável, preservável e reutilizável.

## Dentro do escopo
- Fontes e registros de origem.
- Vocabulário, expressões, chunks, collocations e phrasal verbs.
- Estruturas gramaticais e explicações contextualizadas.
- Textos, diálogos, contextos e exemplos.
- Perguntas, respostas-modelo, atividades e exercícios.
- Personagens/contextos narrativos quando relevantes ao conteúdo.
- Decisões linguísticas, divergências, relações, metadados de origem e validação.
- Ferramentas de extração, consolidação, derivação, geração e validação.
- Preparação controlada de conteúdo para consumo pelo aplicativo.

## Fora do escopo
- Implementar telas, navegação, UX, gamificação ou funcionalidades do aplicativo.
- Definir o roadmap do produto.
- Publicar ou fazer deploy do aplicativo.
- Substituir o motor de aprendizagem ou a experiência do aluno.
- Redistribuir material de terceiros sem autorização/licença.

O projeto `Daily Routine English — Produto e Desenvolvimento` governa o aplicativo. A Base fornece conhecimento estruturado; o produto define como consumi-lo e apresentá-lo, respeitando validação e direitos.

## Arquitetura conceitual
O snapshot recebido continha estrutura para:
- esquema/contrato dos registros;
- registros estruturados por tipo;
- fontes e reconstruções de origem;
- conferências e rastreabilidade;
- relações entre registros;
- ferramentas de extração, consolidação, decisões, validação e geração;
- documentação normativa e saídas derivadas.

Os caminhos reais podem ter mudado. Antes de editar, inspecione a estrutura atual e reutilize os mecanismos existentes. Não recrie componentes apenas porque a descrição acima não coincide exatamente com os nomes atuais.

## Princípios
- Identificadores estáveis e rastreabilidade explícita.
- Separação entre fonte, interpretação, decisão e complemento de IA.
- Incertezas continuam identificadas até serem resolvidas.
- Crescimento incremental e idempotente, conforme os contratos existentes.
- Dados estruturados e fontes são primários; relatórios gerados são derivados.
- Integração com o app é controlada: elegibilidade, validação, direitos, adaptação mínima e vínculo com a origem.
