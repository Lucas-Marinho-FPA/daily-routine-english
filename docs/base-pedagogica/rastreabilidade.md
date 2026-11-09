# Base Pedagógica — Rastreabilidade

Normativo (aprovado em 2026-11-09). Objetivo: de qualquer informação da Base chegar, sem ambiguidade, ao registro
original de onde veio — e provar que esse original não mudou.

## 1. Cadeia de rastreabilidade

```
unidade (VOC, PER, ATV…) ──evidencias[].ori──▶ ORI ──fonte──▶ FON ──arquivo + versao──▶ arquivo no git (commit)
   └─ traducoes/explicacoes/habilidades[].origem ─▶ ORI | DEC | autoria do projeto
ORI.local ─▶ posição exata no arquivo (JSON pointer, índice de parágrafo, linha)
```

- **`FON`** identifica a fonte: arquivo, versão (commit), `hash_arquivo` (SHA-256 dos bytes do arquivo), natureza,
  licença. Fonte privada: só id e natureza na pública; o resto na camada privada.
- **`ORI`** guarda o registro literal: `fonte`, `versao_fonte`, `local`, `id_original`, `tipo_original`, `conteudo`,
  `hash`, `extraido_em`, `extrator`. Fica em `base/origem/<FON>.jsonl`.
- **Unidades** apontam para os `ORI` (`evidencias[]`, com o `campo` quando só parte do registro é usada).
- **Enriquecimento** (tradução, explicação, habilidade, classe gramatical, pronúncia, nível) sempre tem `origem`:
  `{ori}` (veio da fonte), `{decisao}` (decisão registrada) ou `{autoria: "projeto"}` (escrito pelo projeto, marcado
  como tal e sem criar fatos novos).

## 2. Hash do registro × hash do arquivo

| | Hash do registro (`ORI.hash`) | Hash do arquivo (`FON.hash_arquivo`) |
|---|---|---|
| Sobre | o `conteudo` do registro | os bytes do arquivo de origem |
| Forma | SHA-256 da **forma canônica**: JSON com chaves em ordem alfabética, sem espaços, strings **exatamente como na fonte** | SHA-256 dos bytes |
| Prova | aquele registro não mudou | o arquivo é o mesmo que foi extraído |

**Nenhuma normalização** que esconda diferenças: Unicode, aspas tipográficas, espaços, maiúsculas e quebras de linha
entram como estão. Um espaço a mais muda o hash (o autoteste confirma). Para texto de DOCX/TXT, o `conteudo` é o texto
do parágrafo/linha exatamente como extraído, e o extrator e sua versão ficam em `extrator`.

O validador recalcula: (a) o hash a partir do `conteudo`; (b) o `conteudo` a partir da fonte, com `git show
<versao_fonte>:<arquivo>` e o `local` — qualquer diferença reprova (verificação 4).

## 3. Conferência por fonte (conservação)

`base/conferencia/<FON>.json`:

```json
{ "fonte": "FON-000001", "originais": 0, "pendentes": [ { "local": "…", "motivo": "…" } ],
  "orfaos_justificados": [ { "ori": "ORI-…", "motivo": "…" } ] }
```

- `originais` = registros contados pelo extrator na fonte inteira.
- Regra: **originais = `ORI` incorporados + pendentes** (cada pendente com motivo). Nada some sem registro.
- Todo `ORI` é usado por alguma unidade/divergência ou justificado como órfão (verificação 6).
- A situação de cada fonte (`pendente`, `em_andamento`, `concluida`) fica em `FON.conferencia` e no plano do
  manifesto. Uma fonte só é `concluida` com o original disponível e a conferência fechada (ex.: E5 permanece
  `pendente` até o `Histórico IA inglês.docx` — `politica-de-preservacao.md` §5).

## 4. Duplicados e variantes

| Situação | Tratamento | Rastro |
|---|---|---|
| Conteúdo idêntico (mesmo hash, ou mesmo campo) | os dois `ORI` são mantidos; `REL duplicado_de` `confirmada`; uma unidade com as duas evidências | as duas evidências e a relação |
| Mesma forma, diferenças (tradução, categoria, escrita) | `REL variante_de` `proposta`; diferenças preservadas na unidade (várias traduções / `classificacoes_origem`) ou em `DIV` | `ORI` de cada versão |
| Mesmo conhecimento com formas diferentes | só `equivalente_a`/`semelhante_a` com `DEC` aprovada | a `DEC` com justificativa |
| Mesma fonte em duas versões (ex.: CP01 `b194cee` × `8d5ac0c`) | `ORI` por versão; iguais → `duplicado_de`; só numa versão → `ORI` próprio | `versao_fonte` |

Nenhuma duplicidade é eliminada: “juntar” é apontar várias evidências para a mesma unidade, nunca apagar um `ORI`.

## 5. Versões e histórico

- **`ORI` é imutável.** Fonte nova ou versão nova da fonte = **novo** `ORI` (com `versao_fonte` nova) e relação com o
  anterior. O validador compara com `HEAD` (ou outra referência): `ORI`, arquivo de origem ou linha de `ids.jsonl`
  removido ou alterado reprova (verificação 11).
- **Unidades** têm `versao` (inteiro) e `historico[]` só de acréscimo: `{versao, data, mudanca, motivo?, decisao?}`;
  a última entrada corresponde à `versao` atual.
- **Retirar ≠ apagar**: `status: "retirado"` + `DEC`. IDs nunca são reaproveitados.
- **Arquivos**: `manifesto.json` lista cada arquivo de `base/` com SHA-256 e contagem (gerado); o git guarda o
  histórico completo. Esquema versionado (semver) no `$id`.

## 6. Do app para a Base (e de volta)

O `id_original` e o `local` de cada `ORI` são os identificadores que o app já usa (`it.grab`, `lk.grab`, `R01.Q1`,
caminhos JSON das fontes em `dev/content/`). Assim, qualquer item do app publicado em `b194cee` é localizável na Base,
e uma futura geração do app a partir da Base pode ser conferida contra o app atual (`conferir-app.sh`).
