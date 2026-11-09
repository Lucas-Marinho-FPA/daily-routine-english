# Base Pedagógica Mestra — Arquitetura

Status: **APROVADA em 2026-11-09** com as decisões P1–P6 (§9). Estrutura pública preparada e vazia; **ingestão e
consolidação (Etapa 4) bloqueadas até nova autorização expressa**. Branch de trabalho `base-pedagogica`, criada de
`b194cee` (versão publicada, preservada na branch `arquivo/publicado-2026-11-08`).

Princípio central: **preservar integralmente o conhecimento antes de transformá-lo**. A Base é o patrimônio de
conhecimento do projeto; o aplicativo é **um** consumidor. Nada aqui depende de telas, IndexedDB, service worker ou do
motor pedagógico, e nada aqui altera o app.

| Documento | Trata de |
|---|---|
| `arquitetura.md` (este) | visão geral, diretórios, camadas, progressão, validação, plano de ingestão, decisões, riscos |
| `modelo-de-dados.md` | identificadores, campos de cada tipo, relações, exemplos reais |
| `rastreabilidade.md` | registro de origem, hash, evidências, origem do enriquecimento, versões, duplicados, conferência por fonte |
| `politica-de-preservacao.md` | regras obrigatórias da consolidação, imutabilidade, divergências, lacunas, terceiros, proteção da publicação |
| `gerado/*.md` | leitura gerada de `base/` por `dev/tools/base/gerar.mjs` — **nunca editar à mão** |

Os quatro primeiros são normativos (escritos à mão, um assunto em cada, sem repetição). Os dados ficam em JSON/JSONL;
todo Markdown sobre o **conteúdo** da Base é gerado.

## 1. Visão geral

Dois níveis de registro, sempre separados:

1. **Registro de origem (`ORI`)** — cópia literal e **imutável** de um registro de uma fonte, com fonte, versão,
   localização, identificador original e hash (`rastreabilidade.md`). É a prova de preservação.
2. **Unidades pedagógicas** — vocabulário, expressões, gramática, textos, segmentos, diálogos, perguntas, respostas,
   atividades, exercícios, contextos, personagens (`modelo-de-dados.md`). Cada informação de uma unidade aponta para os
   `ORI` de onde veio; o que for escrito pelo projeto é marcado como tal.

Ligações entre registros ficam em **relações** explícitas (`REL`); o que junta, separa ou resolve registros fica em
**decisões** (`DEC`); versões conflitantes ficam em **divergências** (`DIV`). Nada é consolidado automaticamente.

## 2. Estrutura de diretórios

```
base/                                   camada pública (dados) — fora do app e do pré-cache (§2.1)
  manifesto.json                        esquema, estado, plano de ingestão; lista de arquivos com SHA-256 e contagem (gerada)
  ids.jsonl                             registro permanente de IDs {id, tipo, camada, criado_em} — só acrescenta
  esquemas/base.schema.json             JSON Schema 1.0.0 de todos os tipos
  fontes/fontes.jsonl                   FON: fontes públicas (privadas só como id + natureza)
  origem/<FON-id>.jsonl                 ORI: registros literais, um arquivo por fonte (e por versão da fonte)
  conferencia/<FON-id>.json             contagem do extrator, pendentes com motivo, órfãos justificados
  conhecimento/{vocabulario,expressoes,gramatica}.jsonl        VOC · EXP · GRA
  conteudo/{textos,dialogos,contextos}.jsonl                   TXT+SEG · DIA · CTX+PSG
  atividades/{perguntas,respostas,atividades,exercicios}.jsonl PER · RSP · ATV · EXE
  relacoes/relacoes.jsonl               REL
  habilidades/catalogo.json             7 habilidades e 2 jornadas (códigos fixos)
  progressao/{grafo,percursos}.jsonl    arestas com evidência; percursos por jornada
  decisoes/{decisoes,divergencias}.jsonl DEC · DIV
docs/base-pedagogica/                   os 4 documentos normativos + gerado/ (Markdown gerado)
dev/tools/base/                         lib.mjs, validar.mjs, autoteste-base.mjs, gerar.mjs, gerar-exemplos.mjs,
                                        conferir-app.sh, exemplos/ (amostra ilustrativa, IDs 900001+)
```

### 2.1 Exclusão do app (decisão P2)

Antes desta etapa, `dev/setup-workdir.sh` copiava para `app/` toda pasta da raiz exceto `dev` e `docs`; com `base/` na
raiz, o build passaria a incluí-la no pré-cache do PWA (contraprova executada: com as ferramentas de `b194cee`, o
service worker mudaria de `552fc39dda0b` para `b256aaabc0ed` e listaria `base/…`). Ajustes, sem efeito no app:

- `dev/setup-workdir.sh`: `base` entra na lista de exclusões (não é copiada para `app/`).
- `dev/tools/build-app.mjs`: o levantamento do pré-cache ignora `base/`, `docs/` e `dev/` (proteção extra).
- `dev/tools/base/conferir-app.sh`: monta a cópia de trabalho da árvore atual, roda o build e compara arquivo por
  arquivo com o app de `b194cee`; falha se `base/`, `docs/` ou `dev/` aparecerem no app ou no pré-cache.

Observação: o GitHub Pages serve a branch `gh-pages` inteira. `base/` (camada pública) só chegaria lá numa
publicação futura autorizada; mesmo assim, não seria baixada pelo app nem guardada no aparelho.

## 3. Formato

- **JSONL** (um registro por linha) para todos os conjuntos de registros; **JSON** para manifesto, catálogo,
  conferências e esquema. Diffs limpos no git, crescimento por acréscimo.
- **Um arquivo de origem por fonte**: a conferência de cada fonte é independente.
- **Markdown só gerado** a partir dos dados (`gerado/`).
- Sem banco de dados, sem servidor, sem dependências novas: scripts Node do próprio repositório.

## 4. Camadas pública e privada (decisão P1)

| Camada | Conteúdo | Onde | Faixa de IDs |
|---|---|---|---|
| Pública | autoria do projeto já generalizada; conteúdo licenciado compatível (FreeDict, GPL-2.0+) | `base/` neste repositório | `000001`–`499999` |
| Privada | originais pessoais (Word das rotinas, `daily-english`, etapa anterior); terceiros sem licença; registros internos | repositório **privado** separado (§4.1) | `500000`–`899999` |
| Ilustrativa | exemplos de documentação e autoteste | `dev/tools/base/exemplos/` | `900000`+ (com `_ilustrativo`) |

- As faixas evitam colisão sem coordenação entre os repositórios; o padrão do ID é o mesmo (`modelo-de-dados.md`).
- A camada pública só conhece o **ID e a natureza** de uma fonte privada (`{"id": "FON-500001", "camada": "privada",
  "natureza": "pessoal"}`) — nunca conteúdo, nome de arquivo, caminho ou nome de pessoa/empresa.
- Referências da pública para a privada são só IDs. A privada pode referenciar a pública livremente.
- Privacidade é verificada automaticamente (§7, verificação 9): padrões de nomes privados (codificados, regra do
  projeto) e **impressões digitais** (SHA-256 de cada linha das fontes privadas), cuja lista fica **na camada
  privada** (hashes de linhas curtas poderiam ser adivinhados) e é passada ao validador por `--impressoes`.

### 4.1 Estrutura privada proposta (repositório ainda NÃO criado)

Verificado em 2026-11-09: nenhum repositório privado apropriado existe na conta (os 5 repositórios acessíveis são
públicos). Proposta para sua aprovação — nome **`daily-routine-english-privado`**, visibilidade **privada**, sem
colaboradores adicionais:

```
daily-routine-english-privado/
  LEIAME.md                       finalidade, regras (nada daqui vai para o público), como validar
  fontes-originais/               arquivos originais intocados (Word E1, pacotes E2, documento E5 quando chegar, E3, E4)
    SHA256SUMS                    hash de cada arquivo original (conferido antes de cada ingestão)
  base/                           mesma estrutura da pública: manifesto, ids.jsonl (faixa 500000–899999), esquemas
                                  (cópia versionada do público), fontes/, origem/, conferencia/, unidades, relacoes/, decisoes/
  privacidade/impressoes.txt      SHA-256 das linhas das fontes privadas (para o validador público)
```

Manifesto, IDs, hashes, rastreabilidade e versões próprios; validado pelas mesmas ferramentas
(`node dev/tools/base/validar.mjs --base <privado>/base --camada privada`). Criação, permissões e qualquer
compartilhamento dependem de autorização específica sua.

## 5. Progressão pedagógica

- **Grafo** (`progressao/grafo.jsonl`): arestas `prerequisito_de` e `relacionada_a`, cada uma com evidência de um
  destes tipos — ordem na fonte (introduzida antes na mesma jornada), dependência estrutural documentada (`DEC`), uso
  conjunto nos mesmos segmentos. Sem evidência, sem aresta.
- **Complexidade** por medidas verificáveis (tamanho, estruturas, frequência, primeira aparição), não por nível único.
- **`lvl` (1–4)** preservado como `nivel_origem` com o escopo do pacote; não comparado entre pacotes. **Nenhum CEFR**
  sem evidência externa documentada.
- **Percursos** (`progressao/percursos.jsonl`): a ordem atual (R01–R18, K01–K11, L01–L10, CP01–CP02) e outros sobre o
  mesmo grafo.
- A Base registra **o que** revisar e **que evidência** demonstra domínio; **como** agendar (Leitner) e liberar etapas
  continua no app. A Base não muda o motor.

## 6. Ferramentas

| Comando (na raiz) | Faz |
|---|---|
| `node dev/tools/base/validar.mjs` | valida `base/` inteira (verificações 1–11) |
| `node dev/tools/base/validar.mjs --arquivo <x.jsonl>` | valida um conjunto de registros (5, 10, 11 aparecem como “n/a”) |
| `node dev/tools/base/validar.mjs --autoteste` | planta um defeito por vez na amostra e exige reprovação (20 casos) |
| `node dev/tools/base/autoteste-base.mjs` | idem para as verificações que dependem do git (repositório temporário, 10 casos) |
| `node dev/tools/base/gerar.mjs [--conferir]` | regenera a lista de arquivos do manifesto e `gerado/*.md` |
| `node dev/tools/base/gerar-exemplos.mjs` | regenera a amostra ilustrativa a partir de `b194cee`/`8d5ac0c` (determinística) |
| `bash dev/tools/base/conferir-app.sh [ref]` | verificação 12: app gerado idêntico ao de `ref` e fora do pré-cache |

## 7. Validação automatizada

O validador reprova se houver:

1. **Esquema** — registro fora de `base.schema.json` (interpretador próprio do subconjunto usado; conferido contra o
   Ajv: 550 casos, 0 discordância); o próprio esquema com palavra-chave não suportada ou `$ref` quebrado.
2. **Identificadores** — fora do padrão, prefixo ≠ tipo, duplicado, fora da faixa da camada, ausente de `ids.jsonl`,
   tipo/camada diferente do registrado, registrado duas vezes.
3. **Referências** quebradas (evidência, fonte, relação, pergunta, resposta, divergência, decisão, origem).
4. **Hashes** — hash do registro ≠ hash da forma canônica do conteúdo; conteúdo ≠ original **recalculado na fonte, na
   versão registrada** (`git show`); local inexistente; hash do arquivo de origem (`FON.hash_arquivo`) diferente.
5. **Conservação por fonte** — originais contados ≠ `ORI` incorporados + pendentes; pendente sem motivo; fonte com `ORI`
   e sem conferência.
6. **`ORI` órfão** — nenhuma unidade, divergência ou justificativa aponta para ele.
7. **Relações** — `equivalente_a`/`semelhante_a` sem `DEC` **aprovada**; `duplicado_de` sem conteúdo idêntico; `DIV`
   resolvida sem `DEC`.
8. **Origem do enriquecimento** — tradução, explicação, habilidade, classe gramatical ou pronúncia sem origem;
   classificação central (subtipo) forçada enquanto as fontes divergem.
9. **Privacidade** — nome privado (arquivos e registros), fonte privada com campos além de id/natureza, registro ou
   `ORI` privado na pública, fonte pessoal/terceiros marcada como pública, linha idêntica a fonte privada.
10. **Gerados** — manifesto ou Markdown diferente do regenerado.
11. **Imutabilidade** — `ORI`, arquivo de origem ou linha de `ids.jsonl` existente em `HEAD` (ou `--imutavel-desde
    <rev>`) removido ou alterado.
12. **App inalterado** — `conferir-app.sh` + regressão das suítes do app (procedimento, fora do validador).

Avisos (não reprovam): origem apoiada numa `DEC` ainda não aprovada.

## 8. Plano de ingestão fonte a fonte (Etapa 4 — bloqueada até autorização)

Uma fonte por vez, cada uma num commit próprio na branch de trabalho, na ordem abaixo. Para cada fonte:

1. Conferir o hash do arquivo original (`FON.hash_arquivo`; privadas: `SHA256SUMS`).
2. Extrair **todos** os registros literais para `origem/<FON>.jsonl` (`ORI`, sem normalizar nada); gravar
   `conferencia/<FON>.json` com a contagem do extrator e os pendentes com motivo.
3. Criar unidades apontando para os `ORI`; registrar `duplicado_de` (automático, conteúdo idêntico), `variante_de`
   (proposta), `DIV` para versões conflitantes e lacunas — nada resolvido sem `DEC`.
4. `gerar.mjs`; `validar.mjs` com 0 erro; `conferir-app.sh` idêntico; relatório da fonte (originais, incorporados,
   pendentes, duplicados, divergências, lacunas) para sua revisão antes da próxima fonte.

| Ordem | Fonte(s) (inventário da Etapa 1) | Camada | Observação |
|---|---|---|---|
| 1 | R1 extração do Word (generalizada); R2–R7 enriquecimentos e episódios | pública | Lucas: VOC/EXP/GRA/TXT/PER/RSP; 28 itens sem frase → lacuna |
| 2 | R8 Karla; R9 Lukinhas + R14 textos aprovados; R11 personas previstas | pública | perguntas repetidas: uma `PER`, uma `RSP` por personagem |
| 3 | R10 Conversation Practice (`b194cee`, 65 itens CP01) e R18 remodelagem (`8d5ac0c`) | pública | 9 itens só da remodelagem como `proposto` (P6) |
| 4 | R12 expressões de apoio; R13 FreeDict | pública | FreeDict como referência licenciada, sem virar unidade por entrada |
| 5 | R17 documentos pedagógicos | pública | orientações e decisões já documentadas |
| 6 | E1 Word original; E2 etapa anterior | privada | conferência E1 × R1 campo a campo; requer P1 |
| 7 | E5 `daily-english` | privada | **pendente do documento original (P4)**; nada completado por inferência |
| 8 | E3 terceiros sem licença; E4 atividades do curso | privada | nunca na pública |
| — | E6 Bora de Inglês | — | independente: só referência cruzada |

Critério de cada fonte: originais = incorporados + pendentes com motivo; 100% dos hashes conferidos; 0 violação de
privacidade; Markdown gerado; app idêntico e regressão sem diferença.

## 9. Decisões aprovadas (2026-11-09)

| ID | Decisão | Situação |
|---|---|---|
| P1 | Camada privada num **repositório privado no GitHub**, independente do público | nenhum existente; proposta em §4.1 aguardando autorização para criar |
| P2 | `base/` na **raiz** do repositório público, fora do app e do pré-cache | feito (§2.1), app conferido idêntico |
| P3 | Proteção da publicação pela branch **`arquivo/publicado-2026-11-08`** (= `b194cee`); tag local `publicado-2026-11-08` só auxiliar, **não** é proteção remota | conferido em 2026-11-09 |
| P4 | `Histórico IA inglês.docx` será enviado; até lá a conferência de E5 fica **pendente**, sem conclusão nem preenchimento por inferência | pendente |
| P5 | Sem decisão linguística/pedagógica sem evidência; divergências preservadas com todas as versões, sem classificação central forçada (`politica-de-preservacao.md` §4) | regra ativa (validador, verificação 8) |
| P6 | CP01: 65 publicados preservados; 9 só da remodelagem preservados à parte como **propostas**, com origem e versão, não ativados | regra ativa |

## 10. Riscos e pendências

| ID | Risco / pendência | Tratamento |
|---|---|---|
| R1 | Volume de decisões manuais (divergências) | priorizar por uso; nada se resolve sem `DEC` |
| R2 | Alocação sequencial de IDs exige um gravador por vez | uma ingestão por vez, num commit; validador acusa duplicados |
| R3 | Fontes pessoais já estão em repositórios **públicos** existentes (`daily-english`, etapa anterior em `Bora_de_Ingles`) | fora do escopo desta etapa; não alterados; decisão sua |
| R4 | Originais privados (Word, pacotes, terceiros) não têm guarda durável até existir o repositório privado | P1 |
| R5 | `T04` da simulação do Pages é intermitente (falhou uma vez por tempo esgotado na linha de base, passou ao repetir) | registrado; não é efeito da Base |
