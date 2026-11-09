# Base Pedagógica — inventário (GERADO)

> Gerado por `node dev/tools/base/gerar.mjs` a partir de `base/`. **Não editar à mão** — a validação compara.

Esquema: `base-pedagogica/esquema/2.0.0` · estado: **consolidação em andamento: Lucas R1–R7 consolidado, aguardando revisão do usuário**

## Registros por tipo

| Tipo | Descrição | Registros |
|---|---|---|
| `FON` | fontes | 7 |
| `ORI` | registros de origem (literais) | 1362 |
| `VOC` | vocabulário (uma palavra) | 76 |
| `EXP` | expressões | 257 |
| `GRA` | estruturas gramaticais | 18 |
| `TXT` | textos | 23 |
| `SEG` | segmentos (parágrafos, frases, falas) | 141 |
| `DIA` | diálogos | 6 |
| `PER` | perguntas | 109 |
| `RSP` | respostas-modelo | 91 |
| `ATV` | atividades | 29 |
| `EXE` | exercícios | 4 |
| `CTX` | contextos | 8 |
| `PSG` | personagens | 1 |
| `REL` | relações | 20 |
| `DEC` | decisões | 0 |
| `DIV` | divergências | 7 |

Unidades `proposto` (não ativas): 0 · léxico com lacuna “sem contexto de texto”: 38 · “sem tradução”: 17 · divergências abertas: 7

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

## Plano de consolidação

| Ordem | Fontes | Situação | Observação |
|---|---|---|---|
| 1 | Lucas: extração do Word e enriquecimentos (R1–R7) | **consolidada — aguardando revisão** |  |
| 2 | Karla e Lukinhas (R8, R9, R14, R11) | **pendente** |  |
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
| `base/fontes/fontes.jsonl` | 7 | `8c42d3de43196564` |
| `base/ids.jsonl` | 2159 | `81e13fc47e038c98` |
| `base/progressao/catalogo.json` | — | `0afb089b508b35e8` |
| `base/progressao/grafo.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/progressao/percursos.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/registros/atividades.jsonl` | 29 | `4826031fc3108529` |
| `base/registros/contextos.jsonl` | 9 | `a438a0d78fd5762e` |
| `base/registros/decisoes.jsonl` | 0 | `e3b0c44298fc1c14` |
| `base/registros/dialogos.jsonl` | 6 | `d56d1256ada45579` |
| `base/registros/divergencias.jsonl` | 7 | `06ffd1131c86f5da` |
| `base/registros/exercicios.jsonl` | 4 | `096933d06e7941a6` |
| `base/registros/expressoes.jsonl` | 257 | `b70bee5b401f2dd7` |
| `base/registros/gramatica.jsonl` | 18 | `5236f3dc0d27b8d2` |
| `base/registros/origem/FON-000001.jsonl` | 373 | `405834757d0ee102` |
| `base/registros/origem/FON-000002.jsonl` | 247 | `0df8a5b2b95136c9` |
| `base/registros/origem/FON-000003.jsonl` | 23 | `b817bb4fd4dc1b2e` |
| `base/registros/origem/FON-000004.jsonl` | 197 | `1d0e2851d311c8be` |
| `base/registros/origem/FON-000005.jsonl` | 77 | `2e3aabfe455a56a8` |
| `base/registros/origem/FON-000006.jsonl` | 24 | `7a022a88e80230ea` |
| `base/registros/origem/FON-000007.jsonl` | 421 | `c82abeb00cab26fb` |
| `base/registros/perguntas.jsonl` | 109 | `0fd6ea4114da25b9` |
| `base/registros/respostas.jsonl` | 91 | `59b84220718a55df` |
| `base/registros/textos.jsonl` | 164 | `5dfce9ceb042391e` |
| `base/registros/vocabulario.jsonl` | 76 | `d3291b4148cfbd2f` |
| `base/relacoes/relacoes.jsonl` | 20 | `4fb9f95b7a4f0aff` |
