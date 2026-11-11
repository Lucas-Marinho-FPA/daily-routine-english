# PROMPT DE EXECUÇÃO — DAILY ROUTINE ENGLISH
## Implementar a jornada de diálogo em cinco fases no aplicativo existente

Você atuará como engenheiro responsável pela implementação no repositório existente do Daily Routine English (DRE). O pacote de especificação acompanha este prompt. Leia integralmente o `00_LEIA-ME_E_ORDEM_DE_LEITURA.md` e todos os documentos referenciados antes de alterar código.

## Objetivo

Implantar no aplicativo uma experiência reutilizável de aprendizagem por diálogo, aplicada inicialmente às sete partes de `The Story of John`, com cinco fases sequenciais, domínio individual mínimo de 80%, correção pedagógica de qualidade e arquitetura híbrida online/offline.

## Decisões não negociáveis

1. Cinco fases:
   - Vocabulário/expressões: cada item deve ser ouvido pelo menos três vezes; depois o aluno pronuncia; domínio individual ≥80%.
   - Escuta e reconstrução escrita: pista em português + áudio em inglês; aluno escreve em inglês; ≥80% em cada frase.
   - Tradução: fala em inglês; aluno traduz para português sem ver resposta-modelo; avaliação semântica; ≥80% em cada fala.
   - Compreensão: diálogo completo ouvido três vezes; anotações recomendadas; dez questões contextuais; corte de rodada 8/10, com explicação após envio.
   - Leitura em voz alta: aluno lê cada fala; ≥80% de correspondência confiável por fala.
2. 80% é individual por item, não média que compense item fraco. Itens aprovados não são reiniciados.
3. Resultado inconclusivo não aprova nem reprova. Falha de rede/ASR não é erro do aluno.
4. Tradução e gabaritos nunca aparecem antes da tentativa.
5. Correção semântica online é necessária quando o processamento local não consegue garantir qualidade.
6. Arquitetura híbrida: recursos locais confiáveis funcionam offline; avaliação generativa online fica pendente quando não houver conexão. Não simular IA offline.
7. Sem XP, pontos, moedas, níveis, streaks, ranking, recompensas ou badges de recompensa. Múltipla escolha e desafios são atividades didáticas e devem existir normalmente.
8. Preservar integralmente a identidade visual atual do DRE, herdada do Bora de Inglês. Os mockups anexos são referência de fluxo/hierarquia mobile, não autorização para rebranding, troca de paleta, tipografia, logo ou ícones.
9. Preservar conteúdo validado e acervos originais. Não sobrescrever, resumir ou corrigir silenciosamente conteúdo. Integrar as sete partes autorais de John.
10. Não expor credenciais de IA no frontend. Segredos só em backend seguro.
11. Não criar cobrança, contratar serviço, criar projeto cloud, publicar, fazer push, merge ou deploy sem autorização específica.

## Modo de trabalho obrigatório

### Passo 1 — Auditoria sem alteração
- Confirmar repositório, branch, commit, estado do working tree e remotes.
- Inspecionar arquitetura atual real; não assumir que snapshots históricos ainda correspondem ao código.
- Localizar motor de módulos/atividades, checker, áudio, ASR, Speaking Lab, IndexedDB, PWA, CSS tokens, logo, tipografia e testes.
- Inspecionar conteúdo das sete partes e mapear schema/áudios existentes.
- Identificar backend/infra online já existente e como segredos são tratados.
- Mapear o que já existe e pode ser reaproveitado.
- Entregar relatório conciso com riscos, lacunas, plano incremental e decisões externas necessárias.

Não alterar código durante a auditoria.

### Passo 2 — Arquitetura e dependências
- Mapear contratos conceituais do pacote aos contratos reais do app.
- Se não existir backend seguro para IA, propor uma opção mínima provider-neutral, com custos, segurança e privacidade. Não provisionar infraestrutura paga nem pedir/armazenar segredo em código.
- Definir adaptadores para correção local determinística, ASR local e avaliação online.
- Versionar rubricas de tradução e fala.
- Garantir que o domínio pedagógico não dependa de fornecedor específico.

### Passo 3 — Implementar em incrementos
- Conteúdo e schema das sete partes.
- Máquina de estados, tentativas, domínio individual e persistência.
- Fase 1 vocabulário.
- Fase 2 escrita por escuta.
- Fase 3 tradução semântica online.
- Fase 4 listening e dez perguntas.
- Fase 5 leitura em voz alta.
- conectividade, fila offline, retry e idempotência.
- feedback, resultado e revisão cumulativa.
- UX mobile preservando identidade DRE/Bora.
- testes pertinentes em cada incremento.

### Regras de avaliação
- Avaliação de tradução deve considerar significado, contexto, participantes, tempo, negação, intenção e informações essenciais; aceitar paráfrases naturais.
- Escrita deve aceitar contrações/variantes curadas e diferenciar erro de variante aceitável.
- Fala: separar confiabilidade de transcrição, correspondência lexical, completude, ritmo se medido e avaliação fonética somente se houver tecnologia validada. Não chamar ASR textual de avaliação fonética.
- IA deve devolver JSON validado por schema; saída do modelo é dado não confiável. Validar no backend antes de afetar progressão.
- Se modelo/provedor não conseguir julgar, retornar inconclusivo.
- O limiar de 80% não pode ser manipulado para compensar uma avaliação fraca.

### Conteúdo
- Integrar as sete partes preservando conteúdo, inglês britânico predominante e traduções PT-BR.
- IDs estáveis e únicos.
- Mapear áudio somente quando arquivo real existir.
- Não inventar áudio nem marcar áudio ausente como disponível.
- Não usar nomes do acervo original que não pertençam ao elenco autoral definido.
- Reportar divergências e ausências sem apagar fonte.

### UX/UI
- Mobile-first, uma coluna em smartphone.
- Diálogo protagonista; personagem identificado; áudio individual e completo.
- Painéis de vocabulário/gramática sob demanda.
- Português não é exibido como resposta antes da tentativa.
- Estado online/offline e avaliações pendentes visíveis.
- Mockups anexos orientam composição e hierarquia, não identidade de marca.
- Reutilizar tokens/componentes atuais do DRE, sem inventar novo branding.

### Testes mínimos
- 79% não aprova; 80% válido aprova.
- Média não compensa item individual abaixo do corte.
- Áudio conta apenas após reprodução concluída.
- Três audições liberam produção oral.
- Não revelar resposta antes de enviar.
- Traduções alternativas corretas são aceitas.
- Resposta sem sentido ou com omissão essencial não é aprovada.
- 8/10 aprova a rodada de compreensão.
- ASR inconclusivo não reprova.
- Offline mantém tentativas pendentes; reconexão não duplica.
- Retomada após fechar/reabrir.
- Sem XP/níveis/recompensas.
- Sem regressões nas duas jornadas.
- Segredos ausentes do frontend/build público.
- Testar estados de erro, carregamento, permissão de microfone, ausência de áudio e atualização PWA.

## Entrega esperada

Não encerre apenas com um protótipo visual. Entregue implementação funcional no branch de trabalho, testes e evidências.

Relate:
- branch/commit inicial e final;
- arquivos alterados;
- decisões técnicas;
- testes executados e resultados;
- conteúdo e áudio integrados/pendentes;
- limitações reais de IA/ASR;
- backend/credenciais/custos que exigem autorização;
- passos de validação no Galaxy S25+.

Não faça push, merge, deploy ou publicação. Não crie despesas ou recursos cloud sem autorização.

**Prioridade absoluta:** qualidade pedagógica, integridade do conteúdo, segurança e experiência consistente com a identidade atual do DRE.
