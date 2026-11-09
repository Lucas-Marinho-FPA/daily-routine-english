# Análise linguística — “get changed” (e o caso paralelo “take care of”)

> **Análise, não registro.** Este documento interpreta as evidências. As classificações das fontes continuam
> preservadas em `classificacoes_origem`; a classificação central só existe porque há decisão aprovada (`DEC`).

## 0. Decisões aprovadas (2026-11-09)

| Unidade | Fontes (preservadas) | Análise (este documento) | Decisão aprovada | Registro |
|---|---|---|---|---|
| `EXP-000006` “get changed” | R2 `collocation` · R9 `phrasal` | get + particípio; collocation | **collocation** (construção lexical get + particípio, “trocar de roupa”; não é phrasal verb em sentido estrito) | `DEC-000001`; `DIV-000010` resolvida |
| `EXP-000365` “take care of” | R8 `phrasal` · R9 `collocation` | verbo + substantivo + preposição; propunha collocation | **phrasal-prepositional verb** (`phrasal_preposicional`: verbo + partícula + preposição) | `DEC-000002`; `DIV-000013` resolvida |

Sobre “take care of”: a decisão aprovada difere da análise abaixo (§5), que tratava “care” como substantivo. A decisão
prevalece; a divergência entre análise e decisão fica registrada na justificativa de `DEC-000002` para eventual revisão.

## 1. Ocorrências originais (todas preservadas como ORI)

| ORI | Fonte | Onde | Classificação na fonte | Tradução / nota |
|---|---|---|---|---|
| ORI-000038 | R1 (Word) | rotina R01, tabela de vocabulário | seção “vocab” | trocar de roupa — “Muito comum no inglês britânico.” |
| ORI-000243 | R1 (Word) | rotina R08, tabela de vocabulário | seção “vocab” | trocar de roupa — “Comum no inglês britânico.” |
| ORI-000248 | R1 (Word) | rotina R08, tabela “Phrasal verbs e expressões verbais” | seção “phrasal” | trocar de roupa — “Get changed at the gym.” |
| ORI-000335 | R1 (Word) | toolkit, revisão de phrasal verbs | seção “toolkit.phrasalReview” | trocar de roupa — “I get changed at the gym.” |
| ORI-000386 | R2 (tabela de itens) | `/table/get changed` | **`c: collocation`** | lvl 2, tag `bre`, IPA /ɡet tʃeɪndʒd/ |
| ORI-002221 | R9 (Lukinhas) | `/items/31` (`lk.get-changed`) | **`c: phrasal`** | trocar de roupa — “Tirar uma roupa e colocar outra, como o kimono do jiu-jitsu.”; exemplo “You need to get changed for PE.”; `plain: change my clothes` |

Usos nos textos (literais):

- **Lucas R01-B2:** “…I take another shower at the gym, **get changed** and head to the office.”
- **Lucas R08-B2:** “After showering and **getting changed** at the gym, I walk to the office…” (forma no gerúndio — a busca literal de exemplos não a reconhece; ver §5)
- **Lukinhas L05:** “…my brother and I **get changed into our jiu-jitsu clothes** and head off to class.”
- **Lukinhas L10:** “On jiu-jitsu days, my brother and I **get changed** and head off to training at twenty to ten.”

Só duas fontes classificam de fato (campo `c`): R2 → `collocation`; R9 → `phrasal`. Os rótulos de seção do Word não
classificam: a tabela “Phrasal verbs e expressões verbais” mistura as duas coisas (revisão REV-07 da própria fonte).

## 2. Uso: há diferença ou só divergência terminológica?

**Só terminológica.** Nas seis ocorrências e nos quatro textos o sentido é o mesmo: *trocar de roupa* (antes/depois do
treino, para o jiu-jitsu, para a educação física). A tradução é idêntica em todas as fontes (“trocar de roupa”). A única
variação de uso é sintática e compatível com o mesmo sentido: “get changed **into** + roupa” (L05).

## 3. Natureza linguística

- **Phrasal verb**, em sentido estrito, é verbo + **partícula adverbial** (*up, out, off, down…*): *wake up, put away*.
  Em “get changed”, *changed* **não é partícula**: é o particípio passado de *change*.
- A estrutura é **get + particípio** com sentido reflexivo — o mesmo padrão de *get dressed, get washed, get ready*
  (*get dressed* aparece nas próprias fontes: Lucas R04, Lukinhas L02). Gramáticas de referência descrevem esse *get*
  como verbo de ligação/“get-passive” com particípio adjetival.
- É uma combinação **fixa e muito frequente** (sobretudo no inglês britânico, como as notas do Word já dizem), que os
  materiais didáticos costumam ensinar como **collocation / expressão fixa** — e, de forma ampla, como “expressão
  verbal de várias palavras”, às vezes junto aos phrasal verbs.

## 4. Adequação das classificações existentes

- `collocation` (R2): **adequada** — combinação fixa e frequente de *get* + *changed*.
- `phrasal` (R9): **inadequada em sentido estrito** (não há partícula), mas compreensível como rótulo pedagógico amplo de
  “verbo de mais de uma palavra” para crianças.
- `chunk` (disponível no esquema) também descreveria bem a natureza de bloco fixo, mas nenhuma fonte o usa.

**Decisão aprovada:** `collocation` (`DEC-000001`), com nota de estrutura “get + particípio (como get dressed)”;
`phrasal` permanece como classificação de origem do Lukinhas.

## 5. Caso paralelo: “take care of” (`DIV` de subtipo também aberta)

Karla (R8) classifica como `phrasal`; Lukinhas (R9), como `collocation` (“Igual a ‘look after’”). *Care* é substantivo:
a estrutura é verbo + substantivo + preposição, um **idiom/collocation preposicional**, não phrasal verb em sentido
estrito (*look after*, que a própria fonte cita como equivalente, esse sim é phrasal-preposicional). A análise propunha
`collocation`; **a decisão aprovada foi `phrasal_preposicional`** (`DEC-000002`), que prevalece.

## 6. Limitação observada

Resolvida em 2026-11-09: a identificação conservadora de formas flexionadas (`dev/tools/base/morfologia.mjs`) associa
*getting changed* (Lucas R08) a `EXP-000006` como ocorrência confirmada (`REL aparece_em`, com forma literal e posição).
