# Base Pedagógica Mestra — Arquitetura

Status: **aprovada**; decisão definitiva de 2026-11-09: **uma única Base, pública**, neste repositório. Consolidação
(Etapa 4) autorizada fonte a fonte, com revisão do usuário ao fim de cada fonte. Preservação: `b194cee` (versão
publicada), na branch `arquivo/publicado-2026-11-08`; trabalho na branch `base-pedagogica`; `gh-pages` intocada.

Princípio central: **uma única Base Pedagógica pública, sem perda de conhecimento, com rastreabilidade integral e
evolução controlada.** A Base é o repositório central do conhecimento autoral do Daily Routine English; o aplicativo é
**um** consumidor e não é alterado por ela.

| Documento | Trata de |
|---|---|
| `arquitetura.md` (este) | visão geral, estrutura, ferramentas, validação, plano de consolidação, decisões, riscos |
| `modelo-de-dados.md` | identificadores, campos de cada tipo, relações, critérios de consolidação |
| `rastreabilidade.md` | registro de origem, hashes, conferência e recuperabilidade, versões, duplicados |
| `politica-de-preservacao.md` | regras obrigatórias, divergências, lacunas, terceiros, proteção do aplicativo |
| `gerado/*.md` | leitura gerada de `base/` (inventário, conferência por fonte, vocabulário, textos, perguntas, gramática) — **nunca editar à mão** |

## 1. Visão geral

1. **Registro de origem (`ORI`)** — cópia literal e **imutável** de cada registro de uma fonte, com fonte, versão,
   localização e hash. Todo o conteúdo de cada fonte vira `ORI` (cobertura total verificada), e a fonte pode ser
   **reconstruída** a partir deles (`rastreabilidade.md`).
2. **Unidades pedagógicas** — vocabulário, expressões, gramática, textos, segmentos, diálogos, perguntas, respostas,
   atividades, exercícios, contextos, personagens. Cada informação aponta para os `ORI` de onde veio.
3. **Relações** (`REL`), **decisões** (`DEC`) e **divergências** (`DIV`) explícitas. Nada é fundido, classificado ou
   declarado equivalente sem evidência.

## 2. Estrutura

```
base/
  manifesto.json                 esquema, estado, plano; lista de arquivos com SHA-256 e contagem (gerada)
  esquema.json                   JSON Schema 2.0.0 de todos os tipos
  ids.jsonl                      registro permanente de IDs {id, tipo, chave, criado_em} — só acrescenta
  fontes/fontes.jsonl            FON: fontes (inclusive externas de terceiros, só com identificação e licença)
  registros/origem/<FON>.jsonl   ORI: registros literais, um arquivo por fonte
  registros/vocabulario.jsonl    VOC        registros/expressoes.jsonl  EXP        registros/gramatica.jsonl  GRA
  registros/textos.jsonl         TXT + SEG  registros/dialogos.jsonl    DIA        registros/contextos.jsonl  CTX + PSG
  registros/perguntas.jsonl      PER        registros/respostas.jsonl   RSP        registros/atividades.jsonl ATV
  registros/exercicios.jsonl     EXE        registros/decisoes.jsonl    DEC        registros/divergencias.jsonl DIV
  relacoes/relacoes.jsonl        REL
  progressao/catalogo.json       habilidades, jornadas, categorias das fontes que nomeiam subtipo
  progressao/grafo.jsonl         arestas de progressão com evidência        progressao/percursos.jsonl  percursos
  conferencia/<FON>.json         conferência de cada fonte: contagens, destinos, estrutura para reconstrução
docs/base-pedagogica/            4 documentos normativos + gerado/
dev/tools/base/                  ferramentas (§3)
```

JSON/JSONL é a fonte estruturada; o Markdown sobre o conteúdo é gerado. Sem banco de dados, sem servidor, sem
dependências novas.

### 2.1 Fora do aplicativo

`base/` não entra no pacote do app nem no pré-cache do PWA: `dev/setup-workdir.sh` não a copia para `app/`, e o
levantamento do pré-cache em `dev/tools/build-app.mjs` ignora `base/`, `docs/` e `dev/`. Contraprova registrada: com as
ferramentas de `b194cee`, `base/` entraria no pré-cache e o service worker mudaria de `552fc39dda0b` para outra versão.
`conferir-app.sh` confirma a cada etapa que o app gerado é **byte a byte** igual ao de `b194cee`.

## 3. Ferramentas (`dev/tools/base/`, rodar na raiz do repositório)

| Comando | Faz |
|---|---|
| `node dev/tools/base/consolidar.mjs <grupo>` | consolida as fontes de um grupo (`fontes.mjs` + `adaptadores/<grupo>.mjs`); determinístico e idempotente |
| `node dev/tools/base/gerar.mjs [--conferir]` | regenera a lista de arquivos do manifesto e `docs/base-pedagogica/gerado/*.md` |
| `node dev/tools/base/validar.mjs` | valida a base inteira (verificações 1–11) |
| `node dev/tools/base/validar.mjs --autoteste` | planta um defeito por vez numa cópia em memória da base real e exige reprovação (25 casos) |
| `node dev/tools/base/autoteste-base.mjs` | idem para o que depende do git e do fluxo de consolidação (repositório temporário, 9 casos) |
| `bash dev/tools/base/conferir-app.sh [ref]` | verificação 12: app gerado idêntico ao de `ref` (padrão `b194cee`) e `base/` fora do pré-cache |

Arquivos: `lib.mjs` (forma canônica, hash, IDs, esquema), `fontes.mjs` (catálogo de fontes e regras de extração),
`extrair.mjs` (extração com cobertura total e reconstrução), `adaptadores/<grupo>.mjs` (unidades de um grupo).

## 4. Validação

O validador reprova se houver:

1. **Esquema** — registro fora de `esquema.json` (interpretador próprio do subconjunto usado; conferido contra o Ajv).
2. **Identificadores** — fora do padrão, prefixo ≠ tipo, duplicado, ausente de `ids.jsonl`, chave repetida, arquivo errado.
3. **Referências** — qualquer ID citado fora do conteúdo literal que não exista; segmento e texto que não se apontam.
4. **Hashes** — hash do registro ≠ forma canônica do conteúdo; conteúdo ≠ original relido na versão registrada;
   hash do arquivo de origem diferente.
5. **Conservação e recuperabilidade** — originais ≠ incorporados + pendentes; pendente sem motivo; fonte que não se
   reconstrói a partir dos `ORI`; fonte marcada como concluída com pendências.
6. **Destino** — `ORI` que nenhuma unidade cita e que a conferência não justifica (destino + motivo).
7. **Relações** — `equivalente_a`/`semelhante_a` sem `DEC` aprovada; `duplicado_de` sem conteúdo idêntico; divergência
   sem valores diferentes; divergência resolvida sem `DEC`.
8. **Origem e classificação** — tradução, explicação, habilidade, nível, pronúncia, variante, critério sem origem;
   subtipo central sem fonte que o nomeie ou com fontes divergentes; divergência de subtipo não registrada; categoria
   com subtipo diferente do catálogo; nível CEFR.
9. **Nomes privados e terceiros** — padrão de nome privado (regra permanente do projeto); `ORI` de fonte
   `somente_referencia`; material de terceiros sem licença que não seja `somente_referencia`; com `--protegidos
   <arquivo fora do repositório>`, qualquer linha idêntica ao material protegido.
10. **Gerados** — manifesto ou Markdown diferente do regenerado.
11. **Imutabilidade** — `ORI`, arquivo de origem ou linha de `ids.jsonl` existente em `HEAD` removido ou alterado
    (o gravador também se recusa a regravar um `ORI` existente).
12. **App inalterado** — `conferir-app.sh` + regressão das suítes do app (procedimento, fora do validador).

## 5. Progressão pedagógica

- Grafo (`progressao/grafo.jsonl`): `prerequisito_de` e `relacionada_a` só com evidência (ordem na fonte, dependência
  documentada em `DEC`, uso conjunto). Sem evidência, sem aresta.
- `lvl` das fontes preservado como `niveis_origem` com a escala de origem; **nenhum CEFR** por inferência.
- Percursos por jornada sobre o mesmo grafo; a ordem das fontes fica preservada (`id_original`, ordem dos `ORI`).
- As duas jornadas permanecem: `jor:daily-routine` e `jor:conversation-practice`.
- A Base diz **o que** revisar e que evidência mostra domínio; agendar e liberar etapas continua no app.

## 6. Plano de consolidação (uma fonte ou conjunto delimitado por vez, com revisão do usuário entre elas)

| Ordem | Fontes (inventário da Etapa 1) | Situação |
|---|---|---|
| 1 | Lucas: extração do Word e enriquecimentos (R1–R7) | **consolidada — aguardando revisão** |
| 2 | Karla e Lukinhas (R8, R9 + R14, R11) | pendente |
| 3 | Conversation Practice: publicada `b194cee` e `remodelagem` `8d5ac0c` (R10, R18) | pendente; itens só da remodelagem como `proposto` |
| 4 | Expressões de apoio e FreeDict (R12, R13) | pendente; FreeDict sob GPL-2.0+, licença e atribuição registradas |
| 5 | Documentos pedagógicos (R17) | pendente |
| 6 | Daily-English (E5) | pendente do documento original `Histórico IA inglês.docx` |
| — | Terceiros sem licença (E3, E4) | fora da distribuição; no máximo `FON` `somente_referencia`, sem conteúdo |
| — | Bora de Inglês (E6) | independente; só referências cruzadas |

Método de cada fonte (12 passos): hash do arquivo → todos os registros identificados → conteúdo literal → `ORI` →
unidades → relações e classificações só com evidência → duplicidades e divergências → documentos gerados →
validadores → originais × incorporados → hashes → app byte a byte idêntico. Uma fonte só é concluída sem registro sem
destino e sem pendência sem justificativa. Um commit por fonte (ou conjunto delimitado).

## 7. Decisões

| ID | Decisão | Situação |
|---|---|---|
| D1 (substitui P1) | **Base única e pública** neste repositório; sem camada privada, sem faixas de IDs, sem sincronização | em vigor (2026-11-09) |
| P2 | `base/` na raiz, fora do pacote do app e do pré-cache | em vigor, conferido a cada etapa |
| P3 | Preservação pela branch `arquivo/publicado-2026-11-08` = `b194cee`; tag local só auxiliar | em vigor |
| P4 | `Histórico IA inglês.docx`: Daily-English não é declarado conferido antes do original; nada completado por inferência | pendente do arquivo |
| P5 | Divergências preservadas com todas as versões; sem classificação central forçada | em vigor (verificação 8) |
| P6 | Conteúdo só da `remodelagem` entra como `proposto`, sem ativar e sem mudar o publicado | em vigor (aplica-se na ordem 3) |
| D2 | Materiais de terceiros sem licença compatível (Conversation Book, atividades do curso, outros) ficam fora da distribuição pública; podem ser registrados como fontes externas com identificação e licença, sem conteúdo | em vigor (verificação 9) |

## 8. Riscos e pendências

| ID | Risco / pendência | Tratamento |
|---|---|---|
| R1 | Volume de divergências para decisão | priorizar por uso; nada se resolve sem `DEC` |
| R2 | IDs sequenciais exigem um gravador por vez | uma consolidação por vez, num commit; IDs com chave estável e verificação de duplicados |
| R3 | O documento Word original (E1) contém nomes protegidos pela regra permanente do projeto (empregador, agência, unidade) — a cópia R1 é a versão generalizada | antes de incorporar E1, confirmar com o usuário; o validador reprova esses nomes |
| R4 | Simulação do Pages (`run-pages`) intermitente: `T04` e `T05` falharam uma vez cada por tempo esgotado de clique e passaram ao repetir | investigação registrada no relatório de cada etapa; nenhum teste alterado para passar |
