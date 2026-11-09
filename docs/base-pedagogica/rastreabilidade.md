# Base Pedagógica — Rastreabilidade

Normativo. Objetivo: de qualquer informação da Base chegar ao registro original de onde veio, provar que ele não
mudou e poder reconstruir cada fonte inteira.

## 1. Cadeia

```
unidade ──evidencias[].ori / origem.ori──▶ ORI ──fonte──▶ FON ──arquivo @ versao (commit)──▶ arquivo no git
                                            └─ local (JSON pointer) = posição exata no arquivo
```

- **`FON`**: arquivo, versão (commit), `hash_arquivo` (SHA-256 dos bytes), natureza, distribuição, licença.
- **`ORI`**: `fonte`, `versao_fonte`, `local`, `regra` de extração, `conteudo` literal, `hash`, `extraido_em`, `extrator`;
  em `base/registros/origem/<FON>.jsonl`.
- **Unidades** apontam para os `ORI` (`evidencias`, com o `campo` quando só parte do registro é usada); toda tradução,
  explicação, nível, pronúncia, variante, critério ou atributo tem `origem`.

## 2. Hash do registro × hash do arquivo

| | `ORI.hash` | `FON.hash_arquivo` |
|---|---|---|
| Sobre | o `conteudo` do registro | os bytes do arquivo |
| Forma | SHA-256 da forma canônica: JSON com chaves em ordem, sem espaços, strings **exatamente** como na fonte | SHA-256 dos bytes |
| Prova | o registro não mudou | o arquivo é o mesmo que foi extraído |

Nenhuma normalização que esconda diferenças (Unicode, aspas, espaços, maiúsculas): um espaço a mais muda o hash. O
validador recalcula o hash e relê cada `ORI` na fonte, na versão registrada (`git show <versao>:<arquivo>` + `local`).

## 3. Extração, conferência e recuperabilidade

- **Regras de extração** por fonte (`dev/tools/base/fontes.mjs`): padrões de JSON pointer que definem a granularidade
  (um item de vocabulário, um parágrafo, uma pergunta com resposta, uma regra).
- **Cobertura total**: todo valor da fonte cai em **exatamente um** `ORI`; se sobrar ou sobrepor algo, a extração para.
- **Conferência** (`base/conferencia/<FON>.json`): `originais` (registros identificados), `incorporados` (`ORI`),
  `pendentes` (com motivo), `destinos` (em unidades / preservados sem unidade, por destino), `sem_unidade[]`
  (`{ori, destino, motivo}`), `regras` e `listas` (estrutura da fonte).
- **Recuperabilidade**: a fonte é reconstruída a partir dos `ORI` + `listas` e comparada com o arquivo no git. O
  conteúdo original continua recuperável mesmo que o arquivo de origem deixe de existir.
- Uma fonte só é `concluida` com originais = incorporados + pendentes, nenhum pendente sem motivo e nenhum `ORI` sem
  destino. O relatório de cada fonte é gerado em `docs/base-pedagogica/gerado/conferencia.md`.

## 4. Duplicados e variantes

| Situação | Tratamento |
|---|---|
| Conteúdo idêntico (hash, ou o mesmo campo) em registros diferentes | os dois `ORI` mantidos; `duplicado_de` `confirmada`; a unidade cita os dois |
| Mesma forma literal com traduções, notas ou categorias diferentes | **uma** unidade com todas as versões, cada uma com origem; `DIV` quando os valores divergem |
| Apelido declarado pela fonte | `variante_de` `confirmada`, com o `ORI` do apelido como evidência |
| Só maiúscula/minúscula diferente | `variante_de` `proposta` (nunca fusão automática) |
| Mesmo conhecimento em formas diferentes | só `equivalente_a`/`semelhante_a` com `DEC` aprovada |
| Mesma fonte em duas versões | `ORI` por versão (`versao_fonte`); iguais → `duplicado_de`; só numa versão → `ORI` próprio |

Nenhuma duplicidade é eliminada: juntar é citar várias evidências na mesma unidade, nunca apagar um `ORI`.

## 5. Versões e histórico

- **`ORI` é imutável.** O gravador se recusa a regravar um `ORI` existente com conteúdo diferente; o validador compara
  com `HEAD`. Versão nova da fonte = novos `ORI` (`versao_fonte` nova), ligados aos anteriores.
- **Unidades**: `versao` (inteiro) e `historico[]` só de acréscimo. Uma consolidação que muda uma unidade existente
  incrementa a versão e registra a mudança; sem mudança, nada é regravado (consolidação idempotente).
- **Retirar ≠ apagar**: `status: "retirado"` + `DEC`. IDs nunca são reaproveitados (`ids.jsonl` só cresce).
- **Arquivos**: `manifesto.json` lista cada arquivo de `base/` com SHA-256 e contagem; o git guarda o histórico; o
  esquema é versionado em `$id` (2.0.0).

## 6. Da Base para o app (e de volta)

`id_original` e `local` carregam os identificadores que o app já usa (`R01.Q1`, `R01-B7`, caminhos das fontes em
`dev/content/`). Qualquer conteúdo do app publicado em `b194cee` é localizável na Base, e uma futura geração do app a
partir da Base pode ser conferida contra o app atual (`conferir-app.sh`).
