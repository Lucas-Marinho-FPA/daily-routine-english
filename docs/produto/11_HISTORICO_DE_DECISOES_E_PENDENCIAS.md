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

