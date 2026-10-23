# Armazenamento e gravações

Tudo fica **no aparelho**. O app usa dois tipos de armazenamento do navegador.

| Categoria | Onde fica | Tamanho medido* | Observações |
|---|---|---|---|
| App (telas, conteúdo, 896 áudios de referência) | Cache do service worker `drg-<versão>` | 7,0 MB (909 arquivos) | Substituído a cada versão: a versão antiga é apagada. |
| Reconhecimento de fala local (opcional) | Cache `asr-local-<versão>` | 38,3 MB (5 arquivos) | Só existe se você baixar o modelo. |
| Suas gravações (áudio) | IndexedDB `drg`, tabela `audio` | ≈ 12 KB por segundo de fala (≈ 37 KB numa gravação de 3 s) | Uma por exercício. Apagadas após 7 dias. |
| Resultados das gravações (transcrição, análise) | IndexedDB `drg`, tabela `recordings` | < 1 KB por exercício | Nunca apagados automaticamente. |
| Progresso (XP, cartões, histórico, ajustes) | IndexedDB `drg`, chave `state` + cópias de segurança | ≈ 0,4–2 KB | Exportável em Ajustes → Backup. |
| Dados internos do navegador | Metadados de cache e código compilado | ≈ 1,3 MB (sem modelo) a ≈ 5 MB (com modelo) | Não são arquivos do app; o navegador gerencia. |

\* Medições em Chromium (computador), não no celular. Em Ajustes → Armazenamento o app mostra os valores do **seu** aparelho.

## Regravar substitui

Cada exercício tem **uma** gravação. Ao regravar, o áudio novo é salvo e o anterior é removido **na mesma transação**: se salvar falhar (por exemplo, falta de espaço), nada muda e a gravação anterior continua. O número de gravações não cresce.

## Retenção de 7 dias

- O **áudio** de um exercício é apagado quando completa 7 dias corridos (168 h) desde a gravação **mais recente** daquele exercício. Regravar reinicia o prazo.
- Continuam salvos: transcrição, análise, avaliações, pontuação, histórico e progresso. A tela do exercício avisa que o áudio foi apagado.
- A limpeza roda ao abrir o app, ao voltar para ele e a cada hora com o app aberto. Não há tarefa em segundo plano: com o app fechado, nada roda.
- Datas inválidas ou no futuro (relógio do aparelho alterado) **não** apagam nada; o caso fica registrado para diagnóstico.

## Indicadores (Ajustes → Armazenamento)

- **Gravações:** quantidade e tamanho somados dos áudios guardados (contados um a um).
- **Uso total:** estimativa do próprio navegador (`navigator.storage.estimate`), por isso aparece com “≈”. Pode demorar a diminuir depois de apagar áudios, porque o navegador libera o espaço em segundo plano.
- **Não atribuído:** diferença entre o total estimado e o que o app consegue medir. É do navegador; o app não a classifica.
- **Proteção contra limpeza:** pedido feito ao navegador. Não impede que você ou o sistema apaguem os dados do site.
