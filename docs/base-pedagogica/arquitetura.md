# Base Pedagógica Mestra — Arquitetura (Fase 1, Etapa 3)

Status: **proposta para revisão** (não aprovada; nenhuma ingestão feita). Branch `base-pedagogica`, criada de `b194cee`.
Referência de diagnóstico: `fase1-diagnostico.md` (Etapas 1 e 2). Protótipo executável: `docs/base-pedagogica/prototipo/`.

Princípio: a Base é o patrimônio de conhecimento do projeto; o aplicativo é **um** consumidor. Nada aqui depende de
telas, módulos do app, IndexedDB, service worker ou motor pedagógico.

---

## 1. Visão geral

Dois níveis de registro, sempre separados:

1. **Registro de origem (`ORI`)** — cópia **literal e imutável** de um registro de uma fonte (um item, uma pergunta, um
   parágrafo do Word, uma linha de JSON), com fonte, localização, identificador original e hash. É a prova de
   preservação: o conteúdo original nunca é editado, resumido nem descartado.
2. **Unidades pedagógicas** — o conhecimento organizado (vocabulário, expressões, gramática, textos, diálogos,
   perguntas, respostas, atividades, exercícios, contextos). Cada unidade **aponta para as evidências** (`ORI`) de onde
   vem cada informação; o que for escrito pelo projeto (explicação, nível, classe gramatical) é marcado como
   enriquecimento, com origem própria.

Ligações entre registros ficam num arquivo de **relações** explícitas (com tipo, evidência e status). Decisões que
juntam, separam ou resolvem registros ficam num **registro de decisões**. Nada é consolidado automaticamente.

Duas camadas (decisão aprovada):

| Camada | Conteúdo | Onde |
|---|---|---|
| Pública | autoria do projeto já generalizada; conteúdo licenciado compatível (ex.: FreeDict, GPL-2.0+) | repositório (branch `base-pedagogica`) |
| Privada | originais pessoais (Word das rotinas, histórico do `daily-english`, etapa anterior em `Bora_de_Ingles`); terceiros sem licença (Conversation Book, atividades do curso); registros internos | **fora** do repositório público (ver §8 e pendência P1) |

As duas compartilham **o mesmo espaço de identificadores**; a pública só conhece o **ID** de um registro privado,
nunca o conteúdo, o caminho ou o nome.

## 2. Estrutura de diretórios

```
base/                                   camada pública (dados)
  manifesto.json                        versão do esquema, arquivos, contagens e hash de cada arquivo
  ids.jsonl                             registro permanente de IDs (id, tipo, camada, criado_em) — só acrescenta
  esquemas/                             JSON Schema de cada tipo de registro
  fontes/fontes.jsonl                   FON: fontes públicas (e privadas só como id + natureza)
  origem/<FON-id>.jsonl                 ORI: registros literais, um arquivo por fonte (e por versão da fonte)
  conhecimento/vocabulario.jsonl        VOC
  conhecimento/expressoes.jsonl         EXP (phrasal, collocation, funcional, conector, tempo, chunk)
  conhecimento/gramatica.jsonl          GRA
  conteudo/textos.jsonl                 TXT (textos-modelo, blocos) e SEG (frases/falas)
  conteudo/dialogos.jsonl               DIA
  conteudo/contextos.jsonl              CTX (situações, cenas) e PSG (personagens)
  atividades/perguntas.jsonl            PER
  atividades/respostas.jsonl            RSP
  atividades/atividades.jsonl           ATV
  atividades/exercicios.jsonl           EXE
  relacoes/relacoes.jsonl               REL
  habilidades/catalogo.json             as 7 habilidades (fixo)
  progressao/grafo.jsonl                arestas de pré-requisito/relacionamento com evidência
  progressao/percursos.jsonl            percursos por jornada (sequências de unidades)
  decisoes/decisoes.jsonl               DEC (equivalências, resoluções, aprovações)
  decisoes/divergencias.jsonl           DIV (todas as versões de cada divergência)
  conferencia/                          gerado: por fonte (originais, incorporados, pendentes, duplicados, divergências)
docs/base-pedagogica/                   leitura (Markdown GERADO a partir de base/; não editar à mão)
  arquitetura.md                        este documento (normativo; único escrito à mão)
  visao-geral.md · vocabulario.md · expressoes-e-estruturas.md · gramatica.md · atividades.md
  habilidades.md · progressao-pedagogica.md · inventario-fontes.md · rastreabilidade.md
dev/tools/base/                         extração, validação e geração (Etapa 4)
<privado>/base/                         mesma estrutura de base/ para a camada privada (fora do repositório público)
```

Observação técnica (pendência P2): hoje `dev/setup-workdir.sh` copia para o app toda pasta da raiz que não seja
`dev`, `docs` ou os `.md` — uma pasta `base/` na raiz entraria no pré-cache do app num build. Para não tocar no app,
há duas opções: (a) `base/` na raiz + uma exclusão de uma linha no `setup-workdir.sh`; (b) `dev/base/`, sem nenhuma
alteração de ferramenta. Recomendação: **(a)**, porque deixa a Base independente do app; requer sua aprovação.

## 3. Formato

- **JSONL** (um registro por linha) para todos os conjuntos de registros: diffs limpos no git, crescimento por
  acréscimo, leitura em streaming. Volume previsto na migração: ~5 mil `ORI` e ~3 mil unidades — confortável.
- **JSON** para manifesto, catálogo de habilidades e esquemas.
- **Um arquivo de origem por fonte** (`origem/<FON>.jsonl`): a conferência de cada fonte é independente.
- **Markdown só gerado** (`docs/base-pedagogica/*.md`, exceto `arquitetura.md`): uma única verdade.
- Sem banco de dados, sem servidor: scripts Node no padrão do repositório (`node --test`, sem dependências novas).

## 4. Identificadores

Formato definitivo: **`<TIPO>-<NNNNNN>`** (prefixo de 3 letras + 6 dígitos), alocado **sequencialmente** no momento
em que o registro nasce e gravado em `ids.jsonl`. Nunca é reutilizado, nunca muda (nem quando o conteúdo muda de
módulo, de jornada ou de texto). Não é derivado do conteúdo (um hash mudaria com a edição).

| Prefixo | Tipo | Prefixo | Tipo |
|---|---|---|---|
| `FON` | fonte | `PER` | pergunta |
| `ORI` | registro de origem (literal) | `RSP` | resposta-modelo |
| `VOC` | palavra / lexema | `ATV` | atividade |
| `EXP` | expressão (subtipo: phrasal, collocation, funcional, conector, tempo, chunk) | `EXE` | exercício |
| `GRA` | estrutura gramatical | `CTX` | contexto narrativo / situação |
| `TXT` | texto (texto-modelo, bloco) | `PSG` | personagem |
| `SEG` | segmento (frase de texto, fala de diálogo) | `REL` | relação |
| `DIA` | diálogo | `DEC` / `DIV` | decisão / divergência |

Códigos fixos (não numerados): habilidades `hab:reading`, `hab:writing`, `hab:listening`, `hab:speaking`,
`hab:vocabulary`, `hab:grammar`, `hab:functional`; jornadas `jor:daily-routine`, `jor:conversation-practice`.

O identificador **original** de cada fonte (`it.grab`, `lk.grab`, `R01.Q1`, `K.Q5`, `/routines/3/phrasal/2`) fica
gravado no `ORI` como `id_original` e `local` — a origem continua identificável.

## 5. Modelo de dados

Campos comuns a toda unidade: `id`, `tipo`, `camada`, `status` (`proposto` | `ativo` | `retirado`), `versao`,
`historico[]`, `jornadas[]`, `evidencias[]` (lista de `ORI` + campo de onde veio cada informação).
Separação obrigatória dentro de cada unidade: **`original`** (texto literal, copiado do `ORI`) · **`traducoes`**
(cada uma com sua origem) · **`explicacoes`** (com origem) · **`enriquecimento`** (classe, IPA, nível, habilidades —
com origem `ORI`, `DEC` ou “autoria do projeto”, nunca sem origem).

### 5.1 Registro de origem (`ORI`)
```jsonc
{ "id": "ORI-000123", "tipo": "ORI", "camada": "publica",
  "fonte": "FON-000001", "versao_fonte": "b194cee",
  "local": "/routines/3/phrasal/2",            // JSON pointer, índice de parágrafo, linha…
  "id_original": null, "tipo_original": "word.phrasal",
  "conteudo": { "en": "grab", "pt": "pegar rapidamente", "note": "Grab a snack / grab a coffee." },
  "hash": "sha256:…",                          // do conteúdo (forma canônica), NÃO do arquivo
  "extraido_em": "2026-11-09", "extrator": "dev/tools/base/extrair@1",
  "versoes": [] }                              // só acrescenta, se a fonte mudar
```
**Hash do registro**: SHA-256 de uma serialização determinística do conteúdo original — JSON com as chaves em ordem
alfabética, sem espaços, strings **exatamente como na fonte** (sem normalizar Unicode, aspas, espaços ou maiúsculas).
Para texto de DOCX/TXT, o hash é do texto do parágrafo/linha como extraído. O hash do **arquivo** fica na `FON`.

### 5.2 Vocabulário (`VOC`) e expressões (`EXP`)
`forma` (inglês, literal), `subtipo` (EXP), `traducoes[]` `{texto, contexto, ori}`, `significado[]`, `classe_gramatical`
(só com evidência), `pronuncia[]` `{ipa, ori}`, `exemplos` (→ `SEG`), `contextos` (→ `CTX`), `variacoes[]`,
`funcao_comunicativa` (EXP), `estruturas` (→ `GRA`), `classificacoes_origem[]` `{categoria, ori}` (a categoria de
cada fonte preservada, ex.: `collocation`, `phrasal`).

### 5.3 Gramática (`GRA`)
`estrutura`, `funcao`, `formacao[]`, `regras[]`, `exemplos` (→ `SEG`), `erros_frequentes[]` (inclui as 22 regras do
corretor, com `ori`), `prerequisitos` (→ grafo), `relacionadas` (→ `GRA`). Fontes hoje: notas de gramática dos
41 módulos, toolkit do Word (12 estruturas, 6 de Present Simple), regras de erro. Sempre ligada a exemplos de texto
(gramática em contexto).

### 5.4 Textos, segmentos e diálogos (`TXT`, `SEG`, `DIA`)
`TXT`: `original` integral, `traducao` (com origem), `personagens` (→ `PSG`), `contexto` (→ `CTX`), `segmentos` (→ `SEG`,
em ordem). `SEG`: `original`, `traducao`, `falante` (diálogo), `vocabulario`/`expressoes`/`estruturas` (→ unidades).
`DIA`: `falas` (→ `SEG` em ordem), `participantes`, `situacao`.

### 5.5 Perguntas, respostas, atividades e exercícios (`PER`, `RSP`, `ATV`, `EXE`)
- `PER`: `enunciado` literal, `tipo` (compreensão, conversa, transferência, aberta pessoal…), `contexto`.
- `RSP`: resposta-modelo literal ligada a **uma** pergunta **num contexto/personagem**, `alternativas[]`
  (variações aceitas, cada uma com origem), `palavras_chave`, `criterios`.
- `ATV`: `enunciado` integral, `contexto`, `perguntas` (→ `PER`), `respostas` (→ `RSP`), `conhecimentos`
  (→ VOC/EXP/GRA), `habilidades` (com evidência), `criterios_avaliacao`, `origem`.
- `EXE`: exercícios originais (drills, checklists) e **modelos** de exercício (ex.: ordenar frase, completar lacuna),
  sem copiar a lógica do app.

### 5.6 Contextos e personagens (`CTX`, `PSG`)
Situações narrativas (manhã, trajeto, trabalho…), cenas e personagens (Lucas, Karla, Lukinhas, Heitor), com os
fatos de cada fonte preservados (`fatos[]` com `ori`).

## 6. Relações

Arquivo `relacoes/relacoes.jsonl`: `{ id: "REL-…", de, tipo, para, evidencias[], status: "proposta"|"confirmada", decisao }`.

| Tipo | Significado | Como nasce |
|---|---|---|
| `duplicado_de` | conteúdo **literalmente igual** (mesmo hash) | automático (comparação de hash) — `confirmada` |
| `variante_de` | mesma forma, diferença de escrita, tradução, categoria ou formatação | automático como **candidata** (`proposta`) |
| `semelhante_a` | parecido, mas pedagogicamente distinto | só por decisão (`DEC`) |
| `equivalente_a` | expressa o mesmo conhecimento | **só por decisão documentada** (`DEC`), nunca por palavras parecidas |
| `contextualiza` | texto/segmento que dá contexto a uma unidade | da fonte (ex.: `ex[].src`) |
| `aparece_em` | unidade presente num texto, atividade ou jornada | da fonte |
| `prerequisito_de` | precisa ser dominado antes | com evidência (§9) |

## 7. Versionamento e histórico

- `ORI` é **imutável**. Se a fonte mudar (nova versão), entra um novo `ORI` com `versao_fonte` nova e
  `variante_de`/`duplicado_de` para o anterior; o anterior nunca é apagado.
- Unidades têm `versao` (inteiro) e `historico[]` só de acréscimo: `{versao, data, mudanca, motivo, decisao}`.
- Nada é apagado: retirar = `status: "retirado"` + `DEC`. IDs nunca são reaproveitados (`ids.jsonl` só acrescenta).
- O git guarda o histórico completo; `manifesto.json` registra a versão do esquema (semver) e o hash de cada arquivo.

## 8. Separação pública × privada

- Toda fonte tem `natureza` (autoria, pessoal, terceiros sem licença, licenciada, derivada) e `camada`.
- **Nada** de fonte pessoal ou de terceiros sem licença entra em `base/` pública: nem texto, nem nome de arquivo,
  nem caminho. Na pública aparece só `{"id": "FON-000020", "camada": "privada", "natureza": "terceiros"}`.
- A camada privada usa a mesma estrutura e os mesmos IDs; referências da pública para a privada são só IDs.
- A validação (§10) procura nomes privados (padrões codificados, como já é regra do projeto) e **impressões digitais**
  (hashes de cada parágrafo/linha das fontes privadas) em todos os arquivos públicos — qualquer ocorrência reprova.

## 9. Progressão pedagógica

- Grafo (`progressao/grafo.jsonl`): arestas `prerequisito_de` e `relacionada_a` entre unidades, cada uma com
  `evidencias` de um destes tipos: **ordem na fonte** (introduzida num módulo anterior da mesma jornada),
  **dependência estrutural documentada** (`DEC`, ex.: Present Simple antes de advérbios de frequência), **uso
  conjunto** (aparecem juntas nos mesmos segmentos). Sem evidência, sem aresta.
- **Complexidade** registrada por medidas verificáveis (tamanho, número de estruturas, frequência nas fontes,
  jornada/módulo de primeira aparição), não por um nível único.
- **Escala interna `lvl` (1–4)** preservada como `nivel_origem` **com o escopo** (`"escala do pacote Lucas"`); não é
  universal e não é comparada entre pacotes. **Nenhum CEFR** sem evidência externa documentada.
- **Percursos** (`progressao/percursos.jsonl`): sequências por jornada e personagem (ex.: a ordem atual R01–R18,
  K01–K11, L01–L10, CP01–CP02), permitindo vários percursos sobre o mesmo grafo.
- **Revisão cumulativa e domínio**: a Base registra **o que** deve ser revisto e **que evidência** demonstra domínio
  (ex.: produzir a expressão em contexto, responder sem ler); **como** agendar (Leitner) e liberar etapas continua no
  app, que consome a Base. A Base não muda o motor.

## 10. Validação automatizada (Etapas 4–6)

`dev/tools/base/validar.mjs` (protótipo em `docs/base-pedagogica/prototipo/validar.mjs`), reprova se:

1. Registro fora do esquema (JSON Schema).
2. ID duplicado, fora do padrão ou ausente de `ids.jsonl`; ID reaproveitado.
3. Referência quebrada (evidência, relação, unidade, fonte inexistente).
4. **Hash** de algum `ORI` diferente do recalculado na fonte, na versão registrada (fontes públicas; privadas na
   camada privada).
5. **Conservação** por fonte: originais contados pelo extrator ≠ `ORI` incorporados + pendentes listados com motivo.
6. `ORI` órfão (nenhuma unidade nem pendência aponta para ele).
7. `equivalente_a`/`semelhante_a` sem `DEC`; `duplicado_de` sem hashes iguais.
8. Enriquecimento sem origem (classe, IPA, nível, habilidade).
9. **Privacidade**: padrão de nome privado ou impressão digital de fonte privada/terceiros em arquivo público.
10. Markdown desatualizado (regerar e comparar).
11. O app mudou (build do app idêntico ao de `b194cee` e regressão).

## 11. Plano de migração (Etapa 4, após aprovação)

| Ordem | Fonte(s) | Camada | Observação |
|---|---|---|---|
| 1 | R1 extração do Word (generalizada), R2–R7 enriquecimentos | pública | `ORI` por registro; unidades VOC/EXP/GRA/TXT/PER/RSP do Lucas |
| 2 | R8 Karla, R9 Lukinhas (+ R14 textos aprovados), R11 personas | pública | |
| 3 | R10 Conversation Practice (`b194cee`) e R18 (`remodelagem` `8d5ac0c`) | pública | versões da mesma fonte (§12, CP01) |
| 4 | R12 expressões de apoio, R13 FreeDict (referência, sem virar unidade por entrada) | pública | |
| 5 | R17 documentos pedagógicos (orientações, decisões) | pública | |
| 6 | E1 Word original, E2 etapa anterior | privada | conferência E1 × R1 campo a campo |
| 7 | E5 `daily-english` | privada | **conferência só depois do `.docx` original** |
| 8 | E3 Conversation Book, E4 atividades do curso | privada | terceiros; nunca na pública |
| — | E6 Bora de Inglês | — | **independente**: só referência cruzada (`FON` + `semelhante_a` proposto), sem ingestão |

Critério de cada fonte: originais = incorporados + pendentes com motivo; 100% dos hashes conferidos; nenhuma
violação de privacidade; Markdown gerado; regressão do app sem diferença.

## 12. Casos reais do diagnóstico

(Exemplos completos e hashes reais em `prototipo/exemplos.jsonl`, gerados das fontes de `b194cee`/`8d5ac0c`.)

1. **“grab”** — 2 `ORI`: Word `/routines/3/phrasal/2` (“pegar rapidamente”, nota “Grab a snack / grab a coffee.”) e
   `lucas-kid.json /items/38` (“pegar (rapidinho)”, categoria `word`). Uma `VOC` “grab” (a **forma** é literalmente
   igual) com **duas traduções**, cada uma com seu `ORI` e contexto (trabalho × casa/cachorro). Relação
   `variante_de` (`proposta`) entre os `ORI`. Nenhuma tradução escolhida; a classe gramatical fica vazia até haver
   evidência (`verb` e `word` ficam como classificações de origem).
2. **“get changed”** — 3 `ORI` no Word (R01 vocabulário, R08 vocabulário **e** R08 phrasal) + `lk.get-changed`
   (`phrasal`). A divergência de categoria **já existe na fonte original** → `DIV` com as versões (collocation × phrasal)
   e `EXP` com `classificacoes_origem` das duas; subtipo definitivo só por `DEC`.
3. **Perguntas repetidas** — “What time do you wake up?” (Word R01, Lucas; `lucas-kid` L.Q1) e “What do you do when
   you get home?” (Lucas `questions.json /new/7`; Karla K.Q5): **uma `PER`** por enunciado (literalmente igual →
   `duplicado_de` entre os `ORI`) e **uma `RSP` por personagem** (as respostas-modelo são diferentes e continuam
   separadas), em duas `ATV` de jornadas/personagens diferentes.
4. **Itens sem frase** — 28 itens do Lucas (8 phrasal, 11 conectores, 7 frases, 1 tempo, 1 palavra; ex.: `get back to`,
   `get up`, `go over`, `send out`, `finish up`); 3 aparecem só em perguntas. Viram unidades normais, com
   `aparece_em` apenas onde houver evidência; a conferência lista “sem contexto de texto” como lacuna, sem remover.
5. **CP01: 65 × 74 itens** — a mesma fonte (`journeys/cp.json`) em duas versões: `b194cee` (publicada, 65) e
   `remodelagem` `8d5ac0c` (74). Os 65 iguais → `ORI` da versão publicada + `duplicado_de` na outra versão; os 9 novos
   (`team`, `welcome`, `software developer`, `friendly`, `everyone`, `join`, `move`, `club`, `later`) → `ORI` com
   `versao_fonte: 8d5ac0c` e unidades com `status: "proposto"` (não publicadas) até decisão.

## 13. Riscos e pendências

| ID | Pendência / risco | Decisão de quem |
|---|---|---|
| P1 | **Onde guardar a camada privada de forma durável.** Este ambiente é temporário; proposta: repositório **privado** no GitHub (ex.: `daily-routine-english-privado`) | sua (criação de repositório) |
| P2 | `base/` na raiz (com exclusão de uma linha no `setup-workdir.sh`) ou `dev/base/` (sem alteração) | sua |
| P3 | Tag `publicado-2026-11-08` recusada pelo canal git (envio cortado); usada a branch `arquivo/publicado-2026-11-08`. A tag existe só localmente | pode ser criada pelo GitHub (Releases) por você, se quiser |
| P4 | `Histórico IA inglês.docx` (conferência do `daily-english`) | aguardando o arquivo |
| P5 | Subtipos/categorias divergentes (“get changed”, “take care of”…) e equivalências | `DEC` por caso, com sua revisão |
| P6 | Conteúdo só da `remodelagem` (9 itens CP01, 187 traduções de apoio) entra como `proposto` | confirmar |
| R1 | Volume de decisões manuais (divergências) pode crescer | priorizar por uso |
| R2 | Alocação sequencial de IDs exige um único gravador por vez | regra de processo |
