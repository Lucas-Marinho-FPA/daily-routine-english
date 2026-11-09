# Base Pedagógica — Modelo de dados

Normativo (aprovado em 2026-11-09). Esquema executável: `base/esquemas/base.schema.json` (1.0.0). Origem, hash e
histórico estão em `rastreabilidade.md`; regras de preservação em `politica-de-preservacao.md`.

Todos os exemplos abaixo são **ilustrativos**: vêm de `dev/tools/base/exemplos/exemplos.jsonl`, gerados das fontes
reais de `b194cee`/`8d5ac0c`, com IDs da faixa `900001+` e o campo `_ilustrativo: true`. Não fazem parte da Base.

## 1. Identificadores

Formato: **`<TIPO>-<NNNNNN>`** (prefixo de 3 letras + 6 dígitos), alocado sequencialmente quando o registro nasce e
gravado em `base/ids.jsonl` (`{id, tipo, camada, criado_em}`). Nunca muda, nunca é reutilizado, não deriva do conteúdo.

| Prefixo | Tipo | Prefixo | Tipo |
|---|---|---|---|
| `FON` | fonte | `PER` | pergunta |
| `ORI` | registro de origem (literal, imutável) | `RSP` | resposta-modelo |
| `VOC` | palavra / lexema | `ATV` | atividade |
| `EXP` | expressão | `EXE` | exercício |
| `GRA` | estrutura gramatical | `CTX` | contexto / situação |
| `TXT` | texto (texto-modelo, bloco) | `PSG` | personagem |
| `SEG` | segmento (frase de texto, fala) | `REL` | relação |
| `DIA` | diálogo | `DEC` / `DIV` | decisão / divergência |

Faixas: pública `000001`–`499999`; privada `500000`–`899999`; ilustrativa `900000`+ (`arquitetura.md` §4).
Códigos fixos (não numerados): habilidades `hab:reading`, `hab:writing`, `hab:listening`, `hab:speaking`,
`hab:vocabulary`, `hab:grammar`, `hab:functional`; jornadas `jor:daily-routine`, `jor:conversation-practice`.
O identificador **original** da fonte (`lk.grab`, `/routines/3/phrasal/2`…) fica no `ORI` (`id_original`, `local`).

## 2. Campos comuns às unidades

`VOC EXP GRA TXT SEG DIA PER RSP ATV EXE CTX PSG` têm:

| Campo | Regra |
|---|---|
| `id`, `tipo`, `camada` | obrigatórios |
| `status` | `proposto` (registrado, **não ativo**) · `ativo` · `retirado` (nunca apagado) |
| `versao`, `historico[]` | obrigatórios; ver `rastreabilidade.md` §5 |
| `evidencias[]` | obrigatório, ≥ 1: `{ori, campo?}` — de qual `ORI` (e de qual campo dele) vem a unidade |
| `jornadas[]` | `jor:*` |
| `traducoes[]`, `explicacoes[]` | `{texto, contexto?, origem}` — sempre separados do original, cada um com origem |
| `classificacoes_origem[]` | `{categoria, ori}` — a categoria **de cada fonte**, preservada mesmo quando divergem |
| `divergencias[]` | `DIV` abertas que afetam a unidade |
| `lacunas[]` | `sem_contexto_de_texto`, `sem_traducao`, `sem_resposta_modelo`, `fonte_pendente_de_conferencia`, `outra` |

`origem` = `{ori}` | `{decisao}` | `{autoria: "projeto"}` — nunca ausente.

## 3. Tipos

### `FON` — fonte
`natureza` (`autoria`, `pessoal`, `terceiros`, `licenciada`, `derivada`), `camada`, e só na pública: `arquivo`,
`versao` (commit), `hash_arquivo`, `licenca`, `conferencia` (`pendente` · `em_andamento` · `concluida`).
Fonte privada na pública: **apenas** `{id, tipo, camada, natureza, conferencia}`.

### `ORI` — registro de origem
`fonte`, `versao_fonte`, `local` (JSON pointer, índice de parágrafo, linha), `id_original`, `tipo_original`,
`conteudo` (literal), `hash`, `extraido_em`, `extrator`. Detalhes em `rastreabilidade.md` §1–2.

### `VOC` e `EXP` — vocabulário e expressões
`forma` (inglês, literal); `EXP.subtipo` ∈ `phrasal`, `collocation`, `funcional`, `conector`, `tempo`, `chunk` ou
`null` (**`null` enquanto as fontes divergem**, `politica-de-preservacao.md` §4); `classe_gramatical` (só com
`origem`), `pronuncia[]` (cada uma com origem), `exemplos` (→ `SEG`), `contextos` (→ `CTX`), `funcao_comunicativa`.

### `GRA` — gramática
`estrutura`, `funcao`, `formacao[]`, `regras[]`, `exemplos` (→ `SEG`), `erros_frequentes[]` (com `ori`),
`relacionadas` (→ `GRA`). Sempre ligada a exemplos de texto (gramática em contexto).

### `TXT`, `SEG`, `DIA` — textos, segmentos, diálogos
`TXT.original` integral (nunca resumido), `segmentos` (→ `SEG`, em ordem), `personagens` (→ `PSG`), `contexto`.
`SEG.original`, `falante`, `vocabulario`/`expressoes`/`estruturas` (→ unidades). `DIA.falas` (→ `SEG`), `participantes`.

### `PER`, `RSP`, `ATV`, `EXE` — perguntas, respostas, atividades, exercícios
- `PER.enunciado` literal; enunciados literalmente iguais em fontes diferentes = **uma** `PER` com várias evidências.
- `RSP`: resposta-modelo literal (`original`) de **uma** pergunta (`pergunta` → `PER`) **num personagem/contexto**;
  respostas diferentes nunca se fundem. `alternativas[]` com origem.
- `ATV`: `perguntas` (→ `PER`), `respostas` (→ `RSP`), `personagem`, `habilidades[]` `{habilidade, origem}`,
  `conhecimentos` (→ VOC/EXP/GRA). Enunciados de atividade são integrais — nunca resumidos.
- `EXE`: exercícios originais (drills, checklists) e modelos de exercício, sem copiar a lógica do app.

### `CTX`, `PSG` — contextos e personagens
Situações (manhã, trajeto, trabalho…) e personagens (Lucas, Karla, Lukinhas, Heitor) com `fatos[]` `{texto, ori}`
das fontes; nenhum fato novo sem fonte.

### `REL`, `DEC`, `DIV`
- `REL`: `{de, relacao, para, status (proposta|confirmada), evidencias[], decisao?}` — tipos na §4.
- `DEC`: `{data, decisao, justificativa, status (proposta|aprovada|revogada), aprovada_por, evidencias?}`. Só uma
  `DEC` **aprovada** sustenta equivalência ou resolve divergência.
- `DIV`: `{assunto, versoes[] {valor, ori}, status (aberta|resolvida), decisao?}` — todas as versões preservadas.

## 4. Relações

| Tipo | Significado | Como nasce |
|---|---|---|
| `duplicado_de` | conteúdo **literalmente igual** (hash, ou campo indicado em `evidencias[].campo`) | automático, `confirmada` |
| `variante_de` | mesma forma; difere em escrita, tradução, categoria ou formato | automático como **`proposta`** |
| `semelhante_a` | parecido, pedagogicamente distinto | só com `DEC` aprovada |
| `equivalente_a` | expressa o mesmo conhecimento | **só com `DEC` aprovada e documentada**, nunca automática |
| `contextualiza` | texto/segmento que dá contexto a uma unidade | da fonte |
| `aparece_em` | unidade presente num texto, atividade ou jornada | da fonte |
| `prerequisito_de`, `relacionada_a` | progressão | com evidência (`arquitetura.md` §5) |

## 5. Casos reais (amostra ilustrativa)

1. **“grab”** — 2 `ORI`: Word `/routines/3/phrasal/2` (“pegar rapidamente”, nota “Grab a snack / grab a coffee.”) e
   `lucas-kid.json /items/38` (“pegar (rapidinho)”, categoria `word`). Uma `VOC` com **duas traduções**, cada uma com
   seu `ORI` e contexto; `variante_de` **proposta** entre os `ORI`; `classe_gramatical: null` até haver evidência.
2. **“get changed”** — 4 `ORI` preservados (Word R01 vocabulário, R08 vocabulário, R08 phrasal; `lucas-kid /items/31`
   phrasal). `DIV` aberta com as 4 versões; `EXP` com `subtipo: null` e as 4 `classificacoes_origem`.
3. **Perguntas repetidas** — “What time do you wake up?” (Lucas, Lukinhas) e “What do you do when you get home?”
   (Lucas, Karla): uma `PER` por enunciado (`duplicado_de` no campo `q`), **uma `RSP` e uma `ATV` por personagem**.
4. **Item sem frase** — “get up”: `EXP` normal com `lacunas: ["sem_contexto_de_texto"]`; nada inventado.
5. **CP01 65 × 74** — os 65 da versão publicada são idênticos nas duas versões; os 9 só da remodelagem (`team`,
   `welcome`, `software developer`, `friendly`, `everyone`, `join`, `move`, `club`, `later`) têm `ORI` próprio com
   `versao_fonte: 8d5ac0c` e `VOC` com `status: "proposto"`.

```json
{"id":"VOC-900001","tipo":"VOC","camada":"publica","status":"ativo","versao":1,"forma":"grab",
 "evidencias":[{"ori":"ORI-900001","campo":"en"},{"ori":"ORI-900002","campo":"en"}],
 "traducoes":[{"texto":"pegar rapidamente","contexto":"Lucas · trabalho (R04)","origem":{"ori":"ORI-900001"}},
              {"texto":"pegar (rapidinho)","contexto":"Lukinhas · casa (L06)","origem":{"ori":"ORI-900002"}}],
 "classe_gramatical":null, "...": "registro completo em exemplos.jsonl"}
```
