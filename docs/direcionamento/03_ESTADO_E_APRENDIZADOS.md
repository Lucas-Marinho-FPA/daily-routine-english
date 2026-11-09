# Estado de referência e aprendizados

## Aviso temporal
O ZIP analisado nesta conversa representa um snapshot de 09/11/2026, identificado como commit `3d1ab20`. Ele não define o estado atual do repositório. Branches, commits, contagens, fontes, pendências e resultados de testes podem ter mudado. Verifique tudo no Git antes de afirmar o estado presente.

## Aprendizados que devem ser preservados
- A Base já existe como estrutura de dados e ferramentas; não reconstruir do zero.
- Há separação entre fontes originais, registros estruturados, relações, decisões, conferências, ferramentas e documentos derivados.
- Preservação e rastreabilidade são requisitos essenciais.
- A consolidação deve ser incremental e evitar duplicação/reprocessamento destrutivo.
- Decisões linguísticas podem evoluir; a nova decisão deve indicar o que substitui, preservando a trilha histórica.
- Candidatos, hipóteses e divergências não devem ser promovidos silenciosamente a fatos.
- A Base é independente do código e da UX do aplicativo.
- Conteúdo de terceiros exige avaliação de direitos antes da distribuição.
- Validadores, geradores e testes existentes devem ser reaproveitados.

## Exemplos históricos de governança linguística
O snapshot registrava decisões sobre `get changed` e `take care of`, incluindo revisão de classificação de uma expressão e preservação da classificação original. O valor duradouro desses casos é o método: manter origem, análise e decisão atual separadas, registrando substituições sem apagar o histórico.

Consulte o registro atual de decisões antes de reutilizar IDs, classificações ou status desses exemplos.

## Referências históricas que não são tarefas atuais
O snapshot e relatórios anteriores mencionavam commits como `b194cee` e `5c9c8f7`, etapas R8/R9/R14, contagens de registros e várias pendências. Não trate esses itens como tarefas abertas ou decisões atuais sem confirmar no repositório e nas decisões mais recentes.

Não autorize reescrita de histórico Git apenas porque um relatório antigo a menciona. O padrão é preservar o histórico; qualquer ação destrutiva exige justificativa concreta e aprovação expressa.
