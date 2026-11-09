# Base Pedagógica — Modelo de dados

Normativo. Esquema executável: `base/esquema.json` (2.0.0). Origem, hash e versões: `rastreabilidade.md`.
Exemplos citados abaixo são registros **reais** da base (consolidação de R1–R7).

## 1. Identificadores

Formato **`<TIPO>-<NNNNNN>`**: prefixo de 3 letras e **uma única sequência pública por tipo**, a partir de `000001`.
Cada ID é gravado em `base/ids.jsonl` com uma **chave estável** (`{id, tipo, chave, criado_em}`), por isso consolidar de
novo a mesma fonte dá os mesmos IDs. Nunca muda, nunca é reaproveitado, não deriva do conteúdo.

| Prefixo | Tipo | Chave estável |
|---|---|---|
| `FON` | fonte | código do inventário (`R1`) |
| `ORI` | registro de origem | fonte + versão + local (`FON-000001@b194cee:/routines/3/phrasal/2`) |
| `VOC` / `EXP` | palavra / expressão | forma literal |
| `GRA` | estrutura gramatical | estrutura literal |
| `TXT` / `SEG` / `DIA` | texto / segmento / diálogo | identificador da fonte (`lucas:R01`) / `ORI` do segmento / `ORI` do bloco |
| `PER` / `RSP` / `ATV` | pergunta / resposta-modelo / atividade | enunciado literal / `ORI` da pergunta / grupo na fonte |
| `EXE` / `CTX` / `PSG` | exercício / contexto / personagem | `ORI` ou grupo / código da fonte / código do personagem |
| `REL` / `DEC` / `DIV` | relação / decisão / divergência | de + relação + para / — / unidade + campo |

Códigos fixos (`progressao/catalogo.json`): habilidades `hab:*` (7) e jornadas `jor:daily-routine`,
`jor:conversation-practice`. O identificador da fonte (`R01.Q1`, `R01-B7`, `lk.grab`) fica em `id_original`.

## 2. Campos comuns às unidades

| Campo | Regra |
|---|---|
| `id`, `tipo`, `status` | `proposto` (registrado, não ativo) · `ativo` · `retirado` (nunca apagado) |
| `versao`, `historico[]` | `rastreabilidade.md` §6 |
| `evidencias[]` | ≥ 1 `{ori, campo?}` |
| `jornadas[]`, `personagens[]` | `jor:*`; `PSG-*` (atribuição pelo escopo da fonte) |
| `traducoes[]`, `explicacoes[]` | `{texto, contexto?, origem}` — separados do original |
| `classificacoes_origem[]` | `{categoria, subtipo, ori}` — a categoria literal de cada fonte; `subtipo` só quando o catálogo diz que aquela categoria nomeia um subtipo |
| `niveis_origem[]` | `{valor, escala, origem}` — nível da fonte com a escala dela; nunca CEFR |
| `atributos_origem[]` | `{campo, valor, origem}` — campos da fonte sem semântica própria na Base (ex.: `match`, `icon`, `kind`), preservados e ligados |
| `divergencias[]`, `lacunas[]`, `revisoes[]` | `DIV-*`; lacunas registradas; registros de revisão linguística (`ORI`) ligados |
| campo único com origem | `{valor, origem}` (ex.: `titulo`, `objetivo`, `tipo_de_dia`, `falante`, `dica`) |

`origem` = `{ori, campo?}` | `{decisao}` | `{autoria: "projeto"}` — nunca ausente.

## 3. Tipos

- **`FON`** — `codigo`, `titulo`, `natureza` (`autoria` · `derivada` · `licenciada` · `terceiros`), `distribuicao`
  (`integral` · `somente_referencia`), `arquivo`, `versao`, `hash_arquivo`, `licenca`, `conferencia`
  (`pendente` · `em_andamento` · `concluida`). Fonte `somente_referencia`: identificação e licença, **sem conteúdo**.
- **`ORI`** — `fonte`, `versao_fonte`, `local` (JSON pointer), `id_original`, `regra`, `conteudo`, `hash`, `extraido_em`, `extrator`.
- **`VOC` / `EXP`** — `forma` literal; `EXP.subtipo` (`phrasal` · `phrasal_preposicional` · `collocation` · `funcional` ·
  `conector` · `tempo` · `chunk` · `null`) e `subtipo_decisao` (a `DEC` aprovada, quando a classificação central vem
  de decisão — §5.9); `pronuncia[]`, `variantes[]` (`aceita`, `forma_no_texto_original`), `formas_verbais[]`,
  `exemplos[]` (→ `SEG`), `erros_frequentes[]` (`ORI` de regra de erro cuja correção é a própria forma).
- **`GRA`** — `estrutura` literal, traduções, explicações, `atributos_origem.secao`.
- **`TXT`** — `segmentos[]` (ordem da fonte), `titulo`, `titulo_pt`, `objetivo`, `tipo_de_dia`, `estagio`,
  `nota_gramatical`, `explicacoes` (notas de uso), `blocos[]` (episódios), `dialogos[]`, `personagens[]`.
- **`SEG`** — `original` (parágrafo/frase/fala literal, sem divisão), `texto`, `traducoes`, `falante`, `contextos[]`
  (+ `contextos_origem`), `revisoes[]`, `itens_da_fonte[]` (itens que a própria fonte marca na frase), `fatos_da_fonte[]`.
  Sessões do Lukinhas: `TXT.sessao`, `TXT.nivel_da_fonte` (rótulo da fonte, não CEFR), `TXT.vocabulario_da_sessao[]` e
  `TXT.texto_aprovado` (ORI de R14 + resultado da conferência caractere por caractere).
- **`DIA`** — `falas[]` (→ `SEG`), `participantes[]`, `titulo_pt`, `texto`, `contextos[]`.
- **`PER`** — `enunciado` literal; o mesmo enunciado em vários registros = **uma** `PER` com várias evidências.
- **`RSP`** — `original` literal de **uma** pergunta num personagem/contexto; `criterios[]` (palavras-chave da fonte).
- **`ATV`** — `perguntas[]`, `respostas[]`, `perguntas_abertas[]` (pergunta pessoal sem resposta-modelo na fonte, com
  `dica`), `contexto`, `personagens[]`, `habilidades[]` (só com origem).
- **`EXE`** — `itens[]` (evidências: cada item aponta para o texto literal no `ORI`), `titulo`.
- **`CTX`** — `codigo`, `nome`, `traducoes`. **`PSG`** — `codigo`, `tracos[]`, `fatos[]`, `pendencias_da_fonte[]`.
- **`REL`** — `{de, relacao, para, status, evidencias, decisao?, motivo}`; ocorrência flexionada (`aparece_em`) leva
  também `forma_canonica`, `forma_encontrada` (literal), `posicao {inicio, fim}` no `SEG.original` e `criterio`.
  **`DEC`** — `{data, decisao, justificativa, status (proposta · aprovada · revogada), aprovada_por, evidencias,
  efeitos[{unidade, campo, valor, explicacao}], revoga[]}`; imutável depois de registrada — rever = nova `DEC` com
  `revoga`; a revogada permanece como histórico e deixa de ter efeito (a explicação dela sai do estado atual da unidade).
  **`DIV`** — `{unidade, campo, assunto, versoes[{valor, ori}], status (aberta · resolvida · anulada), decisao?, motivo?}`.

## 4. Relações

| Tipo | Significado | Como nasce |
|---|---|---|
| `duplicado_de` | conteúdo literalmente igual (hash, ou o campo indicado) | automático, `confirmada` |
| `variante_de` | mesma forma com diferença de escrita, ou apelido declarado pela fonte | apelido da fonte → `confirmada`; só maiúscula/minúscula → `proposta` |
| `semelhante_a`, `equivalente_a` | parecido / mesmo conhecimento | **só com `DEC` aprovada** |
| `contextualiza` | contexto | da fonte |
| `aparece_em` | ocorrência flexionada de uma expressão num segmento | `morfologia.mjs`: `confirmada` só com paradigma no catálogo; demais `proposta` (§5.8) |
| `prerequisito_de`, `relacionada_a` | progressão | com evidência |

## 5. Critérios de consolidação (aplicados pelo adaptador, verificados pelo validador)

1. **Forma literal idêntica = mesma unidade.** Uma palavra → `VOC`; mais de uma → `EXP` (critério estrutural).
   Grafias diferentes são unidades diferentes, ligadas por `variante_de` quando houver base para isso.
2. **Subtipo** só quando as categorias da fonte que nomeiam subtipo (`progressao/catalogo.json`) concordam. Rótulos de
   seção não classificam (a tabela “Phrasal verbs e expressões verbais” do Word mistura os dois — revisão REV-07).
   Fontes que discordam → `subtipo: null` + `DIV`.
3. **Traduções, níveis e pronúncias** diferentes para a mesma forma: todos preservados, cada um com origem, e `DIV`.
4. **Textos** são guardados na granularidade da fonte: um `SEG` por parágrafo (rotinas do Word) ou por frase/fala
   (episódios). A tradução paralela do Word é ligada pelo mesmo índice (listas `en`/`pt` de mesmo tamanho na fonte).
5. **Exemplos** (`exemplos[]`): segmentos em que a forma, uma variante ou o `match` da fonte aparece literalmente
   (sem diferenciar maiúsculas, com limites de palavra); formas terminadas em “…” são modelos e procuram a parte antes
   das reticências. Sem ocorrência → lacuna `sem_contexto_de_texto`.
6. **Perguntas**: numeração do app preservada em `id_original` (`R02.Q5` continua depois das do Word); perguntas
   pessoais sem resposta-modelo ficam em `perguntas_abertas` com a dica — **nenhuma resposta é inventada**.
7. **Registros sem unidade** (documentação de arquivo, rótulos, regras internas do corretor, revisões de alcance amplo)
   ficam preservados como `ORI` com destino e motivo na conferência.
8. **Formas flexionadas** (`dev/tools/base/morfologia.mjs`, conservador): só `EXP` de duas ou mais palavras; o
   verbo-cabeça flexionado seguido do resto **idêntico e adjacente**, com limites de palavra (“getting changed”,
   “got dressed”). **Confirmada** só quando o verbo-cabeça tem paradigma listado em `progressao/catalogo.json`
   (`paradigmas_verbais`; escopo aprovado: *get*); as demais flexões ficam como **candidatas** (`proposta`), para
   análise — nunca associadas automaticamente. Nada é reescrito nem fundido; a forma literal e a posição são
   conferidas pelo validador. Ocorrência flexionada confirmada também fecha a lacuna `sem_contexto_de_texto`.
9. **Decisões aprovadas** (`dev/tools/base/decisoes.mjs` → `DEC`): a classificação central é aplicada à unidade com
   `subtipo_decisao` e uma explicação de origem `{decisao}`; as `classificacoes_origem` continuam intactas e a `DIV`
   correspondente passa a `resolvida`, apontando para a `DEC`; o histórico da unidade registra a decisão.

## 6. Exemplos reais (consolidação R1–R7)

- **“get changed”** (`EXP-000006`): 4 evidências no Word + tabela R2 (`c: collocation`) + Lukinhas R9 (`c: phrasal`) —
  as duas classificações preservadas; `DIV-000010` resolvida pela `DEC-000001` → `subtipo: collocation` (get +
  particípio). “getting changed” (Lucas R08) é ocorrência flexionada confirmada.
- **“take care of”** (`EXP-000365`): R8 `phrasal` · R9 `collocation` preservadas; `DEC-000002` (phrasal-prepositional)
  revogada por `DEC-000003` → `chunk` (expressão verbal multiword: *verb + noun + preposition*).
- **“wake up”** (`EXP-000001`): três traduções “acordar” com origens distintas; IPA e nível da tabela R2; `phrasal`.
- **“start up / boot up” → “start up”**: apelido declarado em R2 → `REL variante_de` `confirmada`.
- **Perguntas abertas**: 17 perguntas de transferência dos episódios e 1 de R3 ficam em `perguntas_abertas`, com dica.
