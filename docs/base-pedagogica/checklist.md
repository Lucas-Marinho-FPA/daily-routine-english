# Base Pedagógica — checklists e histórico de execução

Escrito à mão (não é gerado). Estados: **concluído** · **em andamento** · **pendente** · **bloqueado**. Nenhum item é
marcado como concluído só porque um documento menciona a intenção: cada um traz a evidência.

Origem deste checklist: o checklist de conclusão da Fase 0 (relatório “Fase 0 — Preparação e segurança”, §H, fora do
repositório) e as entregas da Fase 1. **As Fases 2 a 7 não estão definidas em nenhum registro disponível** (repositório,
relatórios e mensagens desta sessão só descrevem as Fases 0 e 1); por isso aparecem como “definição pendente”, sem
estado antecipado. Basta enviar o roteiro dessas fases para que sejam incorporadas aqui.

## 1. Checklist mestre — Fases 0 a 7

### Fase 0 — Preparação e segurança — **concluída**

| Item | Estado | Evidência |
|---|---|---|
| Estado do GitHub confirmado e igual ao da auditoria | concluído | relatório da Fase 0 |
| Branch publicada (`gh-pages`) e deploy confirmados | concluído | `gh-pages` = `b194cee` (conferido de novo em 2026-11-09) |
| Referência de preservação definida e verificada (`b194cee`) | concluído | rebuild idêntico; unitários |
| Marcador de preservação criado | concluído | branch remota `arquivo/publicado-2026-11-08` = `b194cee`; a tag `publicado-2026-11-08` ficou só local (envio recusado) e é apenas auxiliar |
| Inventário do que não pode ser perdido; diferenças da `remodelagem`; mapa de testes e documentação | concluído | relatórios da Fase 0 e da Fase 1 (Etapa 1) |
| Linha de base de testes registrada | concluído | unitários 215 aprovados · 0 falhas · 1 ignorado; E2E todas as suítes aprovadas; intermitência T04/T05 depois explicada e corrigida nos testes (`c818524`) |
| Branch de trabalho da Fase 1 | concluído | `base-pedagogica`, criada de `b194cee` |
| Quais recursos da `remodelagem` entram no app | pendente | decisão de produto, fora da Base; na Base vale P6 (conteúdo só da remodelagem entra como `proposto`) |
| Branch padrão (`main` desatualizada) | pendente | não decidido |

### Fase 1 — Base Pedagógica Mestra — **em andamento**

| Item | Estado | Evidência |
|---|---|---|
| Etapa 1 — inventário das fontes (R1–R18, E1–E7) | concluído | relatório da Fase 1 |
| Etapa 2 — diagnóstico | concluído | relatório da Fase 1 |
| Etapa 3 — arquitetura | concluído (aprovada; base única pública em 2026-11-09) | `arquitetura.md`, `modelo-de-dados.md`, `rastreabilidade.md`, `politica-de-preservacao.md` |
| Etapa 4.1 — R1–R7 Lucas | **concluído e aprovado** | `3820cb9`; 1.362 ORI, 0 pendentes, reconstruíveis |
| Etapa 4.2 — R8 Karla | consolidada; **fechamento em andamento** (aguardando revisão) | `d2e6c28`; 585/585, 0 pendentes |
| Etapa 4.2 — R9 Lukinhas | consolidado; **fechamento em andamento** (aguardando revisão) | `0145029`; 345/345, 0 pendentes |
| Etapa 4.2 — R14 textos aprovados | preservados; **fechamento em andamento** (aguardando revisão) | `0145029`; 11/11; conferidos caractere por caractere |
| R11 personas previstas (Heitor) | pendente | sem conteúdo |
| R10 + R18 Conversation Practice (publicada e `remodelagem`) | pendente | não iniciar sem autorização |
| R12 expressões de apoio · R13 FreeDict | pendente | FreeDict sob GPL-2.0+ |
| R17 documentos pedagógicos | pendente | — |
| E1 Word original | pendente | contém nomes protegidos pela regra do projeto; a versão generalizada já entrou como R1 (risco R3) |
| E2 etapa anterior | pendente | — |
| E5 Daily-English | **bloqueado** | aguardando o documento original `Histórico IA inglês.docx`; não será declarado conferido antes dele |
| E3 Conversation Book · E4 atividades do curso | restrito | sem licença de redistribuição: no máximo `FON` `somente_referencia`, sem conteúdo |
| E6 Bora de Inglês | fora do escopo | projeto independente; só referências cruzadas |
| Mapa completo de gramática, vocabulário, habilidades e pré-requisitos | pendente | evidência ainda insuficiente; grafo de progressão vazio de propósito |

### Fases 2 a 7 — **definição pendente**

| Fase | Estado | Observação |
|---|---|---|
| Fase 2 | definição pendente | roteiro não registrado; nenhum estado antecipado |
| Fase 3 | definição pendente | idem |
| Fase 4 | definição pendente | idem |
| Fase 5 | definição pendente | idem |
| Fase 6 | definição pendente | idem |
| Fase 7 | definição pendente | idem |

## 2. Checklist operacional — fechamento de R8/R9/R14 (2026-11-09)

| Item | Estado | Evidência |
|---|---|---|
| Conferir branch, commits locais e remotos, alterações pendentes | concluído | `base-pedagogica` = `origin` = `0145029`, árvore limpa |
| Classificação central de “get changed” = collocation, com origens preservadas | concluído | `DEC-000001`; `EXP-000006` (`subtipo_decisao`); `DIV-000010` resolvida |
| Classificação central de “take care of” = phrasal-prepositional verb, com origens preservadas | concluído | `DEC-000002`; `EXP-000365`; `DIV-000013` resolvida; a análise anterior (collocation) registrada na justificativa |
| Fonte × análise × decisão × data distinguíveis | concluído | `rastreabilidade.md` §5 |
| Identificação conservadora de formas flexionadas | concluído | `morfologia.mjs`; 57 ocorrências: 5 confirmadas, 52 candidatas |
| Casos conhecidos: get changed/getting changed, get dressed/getting dressed | concluído | `autoteste-morfologia.mjs` (base real: Lucas R08 e Lukinhas L02) |
| Casos que não devem ser associados | concluído | 8 casos negativos no autoteste |
| Análise das 52 ocorrências candidatas | pendente | listadas em `gerado/personagens.md`; decisão do usuário |
| Conferir indicadores de compartilhamento (catálogo × uso × conhecimento) | concluído | `gerado/personagens.md` §1–3; 78 confirmado (critério misto), **28 corrigido para 29** |
| Conferir a contagem de commits do relatório anterior | concluído | §3 abaixo |
| Base valida sem erros; idempotência em mais de uma ordem | concluído | §4 abaixo |
| R1–R7 preservados; app e `gh-pages` intocados | concluído | §4 abaixo |
| Documentos e checklists atualizados | concluído | este arquivo, `arquitetura.md`, `modelo-de-dados.md`, `rastreabilidade.md`, `analises/get-changed.md` |
| Revisão e aprovação do usuário | pendente | aguardando |

## 3. Histórico de commits da Fase 1 (conferido no git)

| Commit | Conteúdo | Etapa |
|---|---|---|
| `43dab96` | arquitetura (Etapa 3) e protótipos de esquema | 3 |
| `e50894f` | arquitetura aprovada formalizada e estrutura pública preparada | 3 |
| `1ab204f` | registro da intermitência do T05 | 3 |
| `3820cb9` | base única pública e consolidação de Lucas R1–R7 | 4.1 |
| `c818524` | E2E: localizador por texto exato (causa de T04/T05) | 4.1 |
| `e287651` | registro da causa e da correção de T04/T05 | 4.1 |
| `35d60d1` | ferramentas compartilhadas para pacotes de personagem | 4.2 |
| `d2e6c28` | consolidação R8 — Karla | 4.2 |
| `e165e7a` | correções compartilhadas (níveis por escala, união entre grupos) | 4.2 |
| `0145029` | consolidação R9 — Lukinhas (+ R14) | 4.2 |
| `d1c2017` | identificação conservadora de formas flexionadas (+ mecanismo de decisões) | fechamento 4.2 |
| `a524f00` | decisões linguísticas aprovadas (get changed, take care of) | fechamento 4.2 |
| (este commit) | indicadores de compartilhamento, documentação e checklists | fechamento 4.2 |

**Correção:** a mensagem de progresso da etapa 4.2 disse “cinco commits enviados”. O git mostra **quatro** commits
nessa etapa (`35d60d1`, `d2e6c28`, `e165e7a`, `0145029`), todos enviados. O quinto contado era `e287651`, da etapa
anterior, que aparecia na saída de `git log -5`. A tabela do relatório (quatro commits) estava certa; a frase, não.

## 4. Testes do fechamento de R8/R9/R14

| Teste | Executado / reaproveitado | Motivo | Resultado |
|---|---|---|---|
| Validador integral da base | executado | registros novos (DEC, REL) e dados alterados | 0 erros |
| Autoteste do validador | executado | validador alterado | 29/29 |
| Ajv × interpretador do esquema | executado | esquema 2.2.0 | 0 discordâncias (todos os registros reais + mutações) |
| Autoteste do fluxo com git | executado | consolidação alterada (decisões) | 11/11 |
| Autoteste da morfologia | executado | código novo | 23/23 |
| Idempotência em duas ordens | executado | consolidação e derivação alteradas | nenhuma diferença (lucas→karla→lukinhas→decisoes e decisoes→lukinhas→lucas→karla) |
| Refatoração do critério literal | executado | `padraoLiteral` exportado | reconsolidar os 4 grupos: nenhuma diferença |
| Reconstrução das fontes e hashes | executado (pelo validador) | verificações 4 e 5 | todas as 10 fontes reconstruíveis |
| ORI e conferências de R1–R14 | executado | preservação | idênticos a `0145029` (git diff vazio) |
| Geração reproduzível | executado | gerador alterado | `gerar.mjs --conferir`: igual |
| Escopo das alterações | executado | regra da etapa | nada fora de `base/`, `docs/base-pedagogica/`, `dev/tools/base/` desde `0145029` |
| Comparação do build com `b194cee` e regressão E2E | reaproveitado | nenhum arquivo do app, do build ou dos testes mudou | resultado anterior: app idêntico byte a byte; E2E aprovadas |
| Testes unitários do app | reaproveitado | idem | 215 aprovados · 0 falhas · 1 ignorado |
