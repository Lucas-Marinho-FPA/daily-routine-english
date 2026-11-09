# Base Pedagógica — inventário (GERADO)

> Gerado por `node dev/tools/base/gerar.mjs` a partir de `base/`. **Não editar à mão** — a validação compara.

Esquema: `base-pedagogica/esquema/2.3.0` · estado: **consolidação em andamento: Lucas R1–R7 aprovado; Karla (R8) e Lukinhas (R9 + R14) consolidados, fechamento linguístico entregue — aguardando revisão**

## Registros por tipo

| Tipo | Descrição | Registros |
|---|---|---|
| `FON` | fontes | 10 |
| `ORI` | registros de origem (literais) | 2303 |
| `VOC` | vocabulário (uma palavra) | 110 |
| `EXP` | expressões | 431 |
| `GRA` | estruturas gramaticais | 18 |
| `TXT` | textos | 44 |
| `SEG` | segmentos (parágrafos, frases, falas) | 311 |
| `DIA` | diálogos | 12 |
| `PER` | perguntas | 172 |
| `RSP` | respostas-modelo | 138 |
| `ATV` | atividades | 50 |
| `EXE` | exercícios | 4 |
| `CTX` | contextos | 8 |
| `PSG` | personagens | 6 |
| `REL` | relações | 79 |
| `DEC` | decisões | 3 |
| `DIV` | divergências | 13 |

Unidades `proposto` (não ativas): 0 · léxico com lacuna “sem contexto de texto”: 33 · “sem tradução”: 17 · divergências abertas: 10

## Fontes

| ID | Código | Título | Natureza | Distribuição | Arquivo @ versão | Conferência |
|---|---|---|---|---|---|---|
| FON-000001 | R1 | Rotinas do Lucas — extração generalizada do documento Word | derivada | integral | `dev/content/word/word-extract.json` @ b194cee | concluida |
| FON-000002 | R2 | Itens do Lucas — tabela de enriquecimento, itens novos e verbos | autoria | integral | `dev/content/enrich/items.json` @ b194cee | concluida |
| FON-000003 | R3 | Perguntas novas e palavras-chave do Lucas | autoria | integral | `dev/content/enrich/questions.json` @ b194cee | concluida |
| FON-000004 | R4 | Regras de idioma do corretor | autoria | integral | `dev/content/enrich/language.json` @ b194cee | concluida |
| FON-000005 | R5 | Estrutura das rotinas do Lucas — contextos, categorias, blocos | autoria | integral | `dev/content/enrich/structure.json` @ b194cee | concluida |
| FON-000006 | R6 | Registro de revisão linguística e lacunas do Word | autoria | integral | `dev/content/enrich/review-log.json` @ b194cee | concluida |
| FON-000007 | R7 | Lucas 2.0 — perfil e episódios R11–R18 | autoria | integral | `dev/content/enrich/episodes.json` @ b194cee | concluida |
| FON-000008 | R8 | Karla — pacote da personagem (perfil, 11 episódios, itens, perguntas) | autoria | integral | `dev/content/characters/karla.json` @ b194cee | concluida |
| FON-000009 | R9 | Lukinhas — pacote do personagem (perfil, 10 sessões, itens, perguntas) | autoria | integral | `dev/content/characters/lucas-kid.json` @ b194cee | concluida |
| FON-000010 | R14 | Lukinhas — os dez textos definitivos aprovados | autoria | integral | `dev/tests/fixtures/lukinhas-texts.json` @ b194cee | concluida |

## Plano de consolidação

| Ordem | Fontes | Situação | Observação |
|---|---|---|---|
| 1 | Lucas: extração do Word e enriquecimentos (R1–R7) | **consolidada e aprovada** |  |
| 2 | Karla e Lukinhas (R8, R9, R14, R11) | **consolidada; decisões DEC-000001/2, formas flexionadas e indicadores entregues — aguardando revisão** |  |
| 3 | Conversation Practice: versão publicada (b194cee) e remodelagem (8d5ac0c) (R10, R18) | **pendente** | itens só da remodelagem entram como proposto |
| 4 | Expressões de apoio e FreeDict (R12, R13) | **pendente** | FreeDict sob GPL-2.0+: licença e atribuição registradas |
| 5 | Documentos pedagógicos (R17) | **pendente** |  |
| 6 | Daily-English (E5) | **pendente** | aguardando o documento original Histórico IA inglês.docx; não declarar conferido antes dele; nada completado por inferência |
| — | Materiais de terceiros sem licença de redistribuição (E3, E4) | **fora da distribuição** | podem ser registrados como fontes externas (somente_referencia), sem conteúdo |
| — | Bora de Inglês (E6) | **independente** | só referências cruzadas quando pertinentes |

## Arquivos

| Arquivo | Registros | SHA-256 (início) |
|---|---|---|
| `base/conferencia/FON-000001.json` | — | `d3fc9c3aa6d8b296` |
| `base/conferencia/FON-000002.json` | — | `358e68047ce61dec` |
| `base/conferencia/FON-000003.json` | — | `0097b1c9326117fc` |
| `base/conferencia/FON-000004.json` | — | `a1ade23bb1bf2e0c` |
| `base/conferencia/FON-000005.json` | — | `296f094c50d1829e` |
| `base/conferencia/FON-000006.json` | — | `6812c3a07b1ba081` |
| `base/conferencia/FON-000007.json` | — | `921ba45cdca6c1ab` |
| `base/conferencia/FON-000008.json` | — | `14b6d2907545b1ce` |
| `base/conferencia/FON-000009.json` | — | `6c826cfbf9fa8c4b` |
| `base/conferencia/FON-000010.json` | — | `e06e1bb3eff7be53` |
| `base/fontes/fontes.jsonl` | 10 | `a41dd0102aef9e3c` |
| `base/ids.jsonl` | 3712 | `22dba21948b3ef20` |
| `base/progressao/catalogo.json` | — | `3845ea5d59a62342` |
| `base/progressao/grafo.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/progressao/percursos.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/registros/atividades.jsonl` | 50 | `7cd50edd2ce4de3e` |
| `base/registros/contextos.jsonl` | 14 | `db96b288ce6966be` |
| `base/registros/decisoes.jsonl` | 3 | `b7dfc1bf7b80d57c` |
| `base/registros/dialogos.jsonl` | 12 | `9f2e924b97f1f5dd` |
| `base/registros/divergencias.jsonl` | 13 | `39b3180866f5690d` |
| `base/registros/exercicios.jsonl` | 4 | `096933d06e7941a6` |
| `base/registros/expressoes.jsonl` | 431 | `84aa5b546fadcc96` |
| `base/registros/gramatica.jsonl` | 18 | `5236f3dc0d27b8d2` |
| `base/registros/origem/FON-000001.jsonl` | 373 | `405834757d0ee102` |
| `base/registros/origem/FON-000002.jsonl` | 247 | `0df8a5b2b95136c9` |
| `base/registros/origem/FON-000003.jsonl` | 23 | `b817bb4fd4dc1b2e` |
| `base/registros/origem/FON-000004.jsonl` | 197 | `1d0e2851d311c8be` |
| `base/registros/origem/FON-000005.jsonl` | 77 | `2e3aabfe455a56a8` |
| `base/registros/origem/FON-000006.jsonl` | 24 | `7a022a88e80230ea` |
| `base/registros/origem/FON-000007.jsonl` | 421 | `c82abeb00cab26fb` |
| `base/registros/origem/FON-000008.jsonl` | 585 | `e566fe85004b53f1` |
| `base/registros/origem/FON-000009.jsonl` | 345 | `c5a33c70f971f609` |
| `base/registros/origem/FON-000010.jsonl` | 11 | `41713d081ddf7e90` |
| `base/registros/perguntas.jsonl` | 172 | `bf10f6bc0c3d20ec` |
| `base/registros/respostas.jsonl` | 138 | `0a25c8b27a67f551` |
| `base/registros/textos.jsonl` | 355 | `1421e959244be324` |
| `base/registros/vocabulario.jsonl` | 110 | `124f3d4132fb490e` |
| `base/relacoes/relacoes.jsonl` | 79 | `837eb7ff73a9bcac` |
