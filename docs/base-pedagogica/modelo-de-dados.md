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
| `versao`, `historico[]` | `rastreabilidade.md` §5 |
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
- **`VOC` / `EXP`** — `forma` literal; `EXP.subtipo` (`phrasal` · `collocation` · `funcional` · `conector` · `tempo` ·
  `chunk` · `null`); `pronuncia[]`, `variantes[]` (`aceita`, `forma_no_texto_original`), `formas_verbais[]`,
  `exemplos[]` (→ `SEG`), `erros_frequentes[]` (`ORI` de regra de erro cuja correção é a própria forma).
- **`GRA`** — `estrutura` literal, traduções, explicações, `atributos_origem.secao`.
- **`TXT`** — `segmentos[]` (ordem da fonte), `titulo`, `titulo_pt`, `objetivo`, `tipo_de_dia`, `estagio`,
  `nota_gramatical`, `explicacoes` (notas de uso), `blocos[]` (episódios), `dialogos[]`, `personagens[]`.
- **`SEG`** — `original` (parágrafo/frase/fala literal, sem divisão), `texto`, `traducoes`, `falante`, `contextos[]`
  (+ `contextos_origem`), `revisoes[]`.
- **`DIA`** — `falas[]` (→ `SEG`), `participantes[]`, `titulo_pt`, `texto`, `contextos[]`.
- **`PER`** — `enunciado` literal; o mesmo enunciado em vários registros = **uma** `PER` com várias evidências.
- **`RSP`** — `original` literal de **uma** pergunta num personagem/contexto; `criterios[]` (palavras-chave da fonte).
- **`ATV`** — `perguntas[]`, `respostas[]`, `perguntas_abertas[]` (pergunta pessoal sem resposta-modelo na fonte, com
  `dica`), `contexto`, `personagens[]`, `habilidades[]` (só com origem).
- **`EXE`** — `itens[]` (evidências: cada item aponta para o texto literal no `ORI`), `titulo`.
- **`CTX`** — `codigo`, `nome`, `traducoes`. **`PSG`** — `codigo`, `tracos[]`, `fatos[]`, `pendencias_da_fonte[]`.
- **`REL`** — `{de, relacao, para, status, evidencias, decisao?, motivo}`. **`DEC`** — decisão com `status`
  (`proposta` · `aprovada` · `revogada`). **`DIV`** — `{unidade, campo, assunto, versoes[{valor, ori}], status}`.

## 4. Relações

| Tipo | Significado | Como nasce |
|---|---|---|
| `duplicado_de` | conteúdo literalmente igual (hash, ou o campo indicado) | automático, `confirmada` |
| `variante_de` | mesma forma com diferença de escrita, ou apelido declarado pela fonte | apelido da fonte → `confirmada`; só maiúscula/minúscula → `proposta` |
| `semelhante_a`, `equivalente_a` | parecido / mesmo conhecimento | **só com `DEC` aprovada** |
| `contextualiza`, `aparece_em` | contexto / presença | da fonte |
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

## 6. Exemplos reais (consolidação R1–R7)

- **“get changed”** (`EXP-000006`): 4 evidências no Word (R01 vocabulário, R08 vocabulário, R08 tabela de phrasal,
  revisão do toolkit) + tabela R2 (`c: collocation`) → `subtipo: collocation`, com as categorias de seção preservadas.
  Quando outra fonte (Lukinhas) classificar como `phrasal`, a divergência será registrada (P5).
- **“wake up”** (`EXP-000001`): três traduções “acordar” com origens distintas; IPA e nível da tabela R2; `phrasal`.
- **“start up / boot up” → “start up”**: apelido declarado em R2 → `REL variante_de` `confirmada`.
- **Perguntas abertas**: 17 perguntas de transferência dos episódios e 1 de R3 ficam em `perguntas_abertas`, com dica.
