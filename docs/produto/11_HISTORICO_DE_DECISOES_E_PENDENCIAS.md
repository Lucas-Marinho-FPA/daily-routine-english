# Histórico de Decisões e Pendências

## Decisões registradas
| ID | Decisão | Estado |
|---|---|---|
| DEC-001 | Priorizar MVP funcional e pragmático | Aprovada |
| DEC-002 | Jornadas independentes e complementares | Aprovada |
| DEC-003 | Gramática em contexto, explicações curtas | Aprovada |
| DEC-004 | Revisão espaçada e cumulativa | Aprovada |
| DEC-005 | Progressão por domínio demonstrado | Aprovada |
| DEC-006 | Sem gamificação visível | Aprovada; confirmar branch publicada |
| DEC-007 | Personagens narrativos, não perfis | Aprovada |
| DEC-008 | Offline e processamento local prioritários | Aprovada |
| DEC-009 | Não publicar terceiros sem direitos | Aprovada |
| DEC-010 | Publicação só com autorização explícita | Aprovada |
| DEC-011 | PWA incremental como modelo técnico registrado | Confirmar vigência |
| DEC-012 | Autonomia operacional: resolver pendências internas sem usar o usuário como intermediário; escalar somente decisões de sua alçada ou bloqueios incontornáveis | Aprovada em 10/11/2026 |
| DEC-013 | Arquitetura de governança no repositório: ponto de entrada `CLAUDE.md`, fonte central de papéis em `docs/governanca/`, fluxo ChatGPT → Claude → auditoria no GitHub, Base de Conhecimento mantida fora deste repositório (público) com governança própria | Aprovada em 11/11/2026 |
| DEC-014 | Atividades de diálogo em cinco fases (The Story of John): domínio individual de 80% por item; inconclusivo/pendente não aprovam; arquitetura híbrida sem simular IA offline | Aprovada em 11/11/2026 (pacote `docs/produto/mvp-dialogo/`) |
| DEC-015 | Fase 4: só as questões erradas voltam e contam ao serem acertadas; resposta só depois de acertar (substitui a nova rodada completa proposta pelo executor) | Aprovada em 11/11/2026 |
| DEC-016 | Questões de compreensão geradas para o projeto a partir do texto dos diálogos integram o produto, sem exigir validação por professor; diálogos curtos com rodada reduzida e corte proporcional de 80% (⌈0,8 n⌉) | Aprovada em 11/11/2026 |
| DEC-017 | Fase 5 (leitura em voz alta) independente da fase 4: abre ao concluir a fase 3 (ou com as traduções só aguardando avaliação online) | Aprovada em 11/11/2026 |
| DEC-018 | Inconsistências de The Story of John corrigidas no conteúdo derivado, com a fonte preservada e o original registrado em cada fala (`dev/content/dialogues/john-corrections.json`) | Aprovada em 11/11/2026 |
| DEC-019 | Publicação da branch de trabalho do MVP de diálogo no GitHub Pages (integração com `gh-pages` pelo fluxo oficial) | Aprovada em 11/11/2026 |

## Histórico técnico — auditoria somente leitura de 08/11
`gh-pages` b194cee; `mvp-jornadas` no mesmo SHA; `main` 13de9d2; `remodelagem` 8d5ac0c; `cp-publicacao` b582c29. Workflow Pages 22 sucesso em b194cee. Rebuild de `dev/` idêntico byte a byte ao publicado. Site servido não confirmado diretamente.

## Pendências
| ID | Item | Estado no snapshot |
|---|---|---|
| P-001 | Confirmar conteúdo servido no domínio | Aberto |
| P-002 | Testar aparelho físico/Samsung Internet | Aberto |
| P-003 | Investigar áudios da Karla (293/312) | Aberto |
| P-004 | Investigar 349 áudios sem referência direta | Aberto |
| P-005 | Confirmar voz do sistema offline | Aberto |
| P-006 | Definir backup do Curso | Aberto |
| P-007 | Resolver divergência `remodelagem`/`gh-pages` | Aberto |
| P-008 | Atualizar documentação obsoleta | Aberto |
| P-009 | Rever exposição pública de `dev/` e `docs/` | Aberto |
| P-010 | Tratar licença FreeDict GPL-2.0+ | Aberto |
| P-011 | Definir licença do repositório | Aberto |
| P-012 | Decidir/completar assets de personagens | Aberto |
| P-013 | Confirmar retirada da gamificação na publicação | Aberto |

Acrescentar decisões com ID sequencial, data, contexto, decisão, alternativas, impacto e aprovador. Não apagar decisões superadas; marcar como substituídas e apontar a sucessora.


## Diretriz operacional DEC-012 — 10/11/2026
**Contexto:** excesso de repasses e perguntas sobre assuntos que poderiam ser resolvidos consultando regras, registros e evidências já existentes.

**Decisão:** a equipe deve atuar de forma coordenada e orientada à resolução. ChatGPT mantém a visão integrada e coordena; Claude/CoWork investiga e executa. Nenhum deles deve transformar o usuário em pombo-correio ou solicitar repetição de decisões já tomadas. Divergências documentais/técnicas devem ser investigadas e reconciliadas internamente sempre que reversíveis e de baixo impacto.

**Limite:** continuam exigindo aprovação do usuário mudanças relevantes de produto, pedagogia, UX estrutural, arquitetura, escopo, custos, privacidade, direitos/licenciamento e publicação.

**Critério de qualidade:** toda comunicação de problema deve conter diagnóstico, impacto, encaminhamento e ação executada/próximo passo. Só escalar o que realmente depende do dono do produto. Não reabrir validações concluídas sem evidência concreta.

## DEC-013 — Arquitetura de governança e responsabilidades — 11/11/2026
**Contexto:** papéis e instruções estavam espalhados (pacote fora do repositório, `CLAUDE.md` do produto com conteúdo
técnico e protocolo desatualizado, Base de Conhecimento fora do repositório e uma Base Pedagógica distinta na branch
`base-pedagogica`), o que exigia que o usuário
transportasse contexto entre ChatGPT, Claude/CoWork e a Base de Conhecimento.

**Decisão (aprovador: Product Owner):** o repositório passa a ter um ponto de entrada comum (`CLAUDE.md`), uma fonte
central de papéis e fluxo (`docs/governanca/PAPEIS_E_RESPONSABILIDADES.md`), o pacote oficial de Produto e
Desenvolvimento em `docs/produto/` e a continuidade no `HANDOFF.md` (estado verificado, evidências, pendências e
demandas para a Base). Papéis: Product Owner decide; ChatGPT planeja, estrutura critérios de aceite e audita no GitHub;
Claude/CoWork executa, testa e registra evidências; o projeto Base de Conhecimento responde por conteúdo, curadoria,
validação pedagógica e códigos/de-para, com governança própria e acervo privado **fora deste repositório**; a Base
Pedagógica da branch `base-pedagogica` é uma camada pública distinta, cuja relação com a Base de Conhecimento aguarda
decisão do Product Owner. Produto implementa decisões pedagógicas aprovadas, mas não as define.

**Alternativas consideradas:** trazer a Base de Conhecimento para este repositório (rejeitada: repositório público e
material interno/de terceiros); copiar instruções de outras bases para as branches do produto (rejeitada: cópias divergentes);
manter o pacote só fora do repositório (rejeitada: o ChatGPT não poderia auditar a partir do GitHub).

**Impacto:** nenhuma mudança de código, conteúdo pedagógico, Base Pedagógica ou publicação. As regras de commit, push e
publicação continuam exigindo autorização explícita. O conteúdo técnico do antigo `CLAUDE.md` foi movido sem alteração
para `docs/aplicativo-referencia.md` (mesmo texto já arquivado na branch `base-pedagogica`).


## DEC-014 a DEC-019 — Atividades de diálogo — 11/11/2026

**Contexto:** implantação do MVP de diálogo (`docs/produto/mvp-dialogo/`) e duas rodadas de correção. Detalhes técnicos,
regras e correções de conteúdo: `docs/dialogos.md`.

**Decisões (aprovador: Product Owner, mensagens de 11/11/2026):**
- DEC-014: cinco fases sequenciais por diálogo, 80% individual por item, sem gamificação de recompensa, avaliação
  online provider-neutral (provedor/custo ainda por decidir).
- DEC-015: na compreensão, reapresentar só os itens não dominados, sem repetir os dominados (rubrica
  `dre-comprehension-2`). Substitui a regra `dre-comprehension-1` (nova rodada completa depois da recuperação).
- DEC-016: 403 questões elaboradas só a partir do texto dos diálogos, integradas como metodologia própria do DRE; a
  origem fica registrada em cada questão (rastreabilidade interna, sem aviso ao aluno). Diálogos que não sustentam 10
  questões não recebem questões inventadas: rodada reduzida com aprovação em ⌈0,8 n⌉.
- DEC-017: a leitura em voz alta não depende da compreensão. Alternativa descartada: manter a cadeia 4 → 5 (bloquearia
  a leitura quando a compreensão não estivesse feita).
- DEC-018: correções em 6 pontos (horário e duração do trem, encontro com Peter, abertura de Rick, mesa para seis
  pessoas, contexto da ligação de Mary), aplicadas ao conteúdo derivado e às questões; documentos-fonte intactos.
- DEC-019: integração e publicação autorizadas para esta entrega.

**Fora destas decisões:** escolha de provedor de IA, contratação de serviços e infraestrutura paga (continuam com o PO).
