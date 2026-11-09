# Base Pedagógica — inventário (GERADO)

> Gerado por `node dev/tools/base/gerar.mjs` a partir de `base/`. **Não editar à mão** — a validação compara.

Esquema: `base-pedagogica/esquema/2.1.0` · estado: **consolidação em andamento: Lucas R1–R7 aprovado; Karla R8 consolidada — aguardando revisão**

## Registros por tipo

| Tipo | Descrição | Registros |
|---|---|---|
| `FON` | fontes | 8 |
| `ORI` | registros de origem (literais) | 1947 |
| `VOC` | vocabulário (uma palavra) | 109 |
| `EXP` | expressões | 367 |
| `GRA` | estruturas gramaticais | 18 |
| `TXT` | textos | 34 |
| `SEG` | segmentos (parágrafos, frases, falas) | 245 |
| `DIA` | diálogos | 12 |
| `PER` | perguntas | 143 |
| `RSP` | respostas-modelo | 118 |
| `ATV` | atividades | 40 |
| `EXE` | exercícios | 4 |
| `CTX` | contextos | 8 |
| `PSG` | personagens | 5 |
| `REL` | relações | 21 |
| `DEC` | decisões | 0 |
| `DIV` | divergências | 9 |

Unidades `proposto` (não ativas): 0 · léxico com lacuna “sem contexto de texto”: 35 · “sem tradução”: 17 · divergências abertas: 8

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

## Plano de consolidação

| Ordem | Fontes | Situação | Observação |
|---|---|---|---|
| 1 | Lucas: extração do Word e enriquecimentos (R1–R7) | **consolidada e aprovada** |  |
| 2 | Karla e Lukinhas (R8, R9, R14, R11) | **Karla (R8) consolidada — aguardando revisão; Lukinhas pendente** |  |
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
| `base/fontes/fontes.jsonl` | 8 | `b027c437385649ef` |
| `base/ids.jsonl` | 3088 | `2fb1b104041ccd04` |
| `base/progressao/catalogo.json` | — | `0afb089b508b35e8` |
| `base/progressao/grafo.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/progressao/percursos.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/registros/atividades.jsonl` | 40 | `b67b8b4f57be55db` |
| `base/registros/contextos.jsonl` | 13 | `229efafaf83568ff` |
| `base/registros/decisoes.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/registros/dialogos.jsonl` | 12 | `9f2e924b97f1f5dd` |
| `base/registros/divergencias.jsonl` | 9 | `805a0b9a85636c75` |
| `base/registros/exercicios.jsonl` | 4 | `096933d06e7941a6` |
| `base/registros/expressoes.jsonl` | 367 | `160264f1fea5a363` |
| `base/registros/gramatica.jsonl` | 18 | `5236f3dc0d27b8d2` |
| `base/registros/origem/FON-000001.jsonl` | 373 | `405834757d0ee102` |
| `base/registros/origem/FON-000002.jsonl` | 247 | `0df8a5b2b95136c9` |
| `base/registros/origem/FON-000003.jsonl` | 23 | `b817bb4fd4dc1b2e` |
| `base/registros/origem/FON-000004.jsonl` | 197 | `1d0e2851d311c8be` |
| `base/registros/origem/FON-000005.jsonl` | 77 | `2e3aabfe455a56a8` |
| `base/registros/origem/FON-000006.jsonl` | 24 | `7a022a88e80230ea` |
| `base/registros/origem/FON-000007.jsonl` | 421 | `c82abeb00cab26fb` |
| `base/registros/origem/FON-000008.jsonl` | 585 | `e566fe85004b53f1` |
| `base/registros/perguntas.jsonl` | 143 | `068757cea50d7804` |
| `base/registros/respostas.jsonl` | 118 | `9bbae9d96c124ce4` |
| `base/registros/textos.jsonl` | 279 | `c35cca902ab015dd` |
| `base/registros/vocabulario.jsonl` | 109 | `2d55750d441979f5` |
| `base/relacoes/relacoes.jsonl` | 21 | `efcd837c27a00b98` |
