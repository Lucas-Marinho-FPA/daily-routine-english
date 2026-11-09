# Base Pedagógica — Política de preservação

Normativa (aprovada em 2026-11-09). Princípio central: **preservar integralmente o conhecimento antes de
transformá-lo**. A aprovação da arquitetura **não** autoriza eliminar ou reescrever conteúdo.

## 1. Regras obrigatórias da consolidação

| # | Regra | Como é garantida |
|---|---|---|
| 1 | Nenhum original é sobrescrito | `ORI` imutável; verificações 4 (hash recalculado na fonte) e 11 (comparação com `HEAD`) |
| 2 | Nenhuma atividade é resumida | `ATV`/`TXT` guardam o texto integral; o `ORI` prova o original; revisão por fonte |
| 3 | Nenhuma pergunta ou resposta é descartada | conservação por fonte (verificação 5): originais = incorporados + pendentes com motivo |
| 4 | Nenhuma duplicidade é eliminada sem rastreabilidade | duplicados mantêm os dois `ORI` + `REL duplicado_de` (`rastreabilidade.md` §4) |
| 5 | Nenhuma equivalência semântica automática | `equivalente_a`/`semelhante_a` só com `DEC` aprovada (verificação 7) |
| 6 | Traduções e explicações separadas do original | campos `traducoes`/`explicacoes` com `origem`, nunca dentro de `original`/`forma` (esquema) |
| 7 | Toda unidade tem origem verificável | `evidencias` ≥ 1 e referências válidas (verificações 1 e 3) |
| 8 | Conteúdo privado não vaza para a pública | verificação 9 (padrões codificados + impressões digitais da camada privada) |
| 9 | Terceiros isolados e sujeitos às condições de uso | natureza `terceiros` só na camada privada; nunca na pública (verificação 9) |
| 10 | Lacuna registrada, nunca preenchida por invenção | `lacunas[]` na unidade, pendentes com motivo na conferência |

## 2. O que nunca se faz

- Apagar, editar ou “corrigir” um `ORI`, um arquivo original ou uma linha de `ids.jsonl`.
- Reaproveitar um ID. Retirar é `status: "retirado"` com `DEC`.
- Completar traduções, respostas, frases, classes gramaticais, níveis ou fatos de personagens por inferência.
- Copiar material de terceiros (Conversation Book, atividades do curso) ou textos pessoais para `base/`.
- Alterar o aplicativo, o motor pedagógico, o banco de dados, o PWA ou a publicação a partir da Base.

## 3. Proteção da publicação e do trabalho

- Versão publicada preservada na branch remota **`arquivo/publicado-2026-11-08`** = `b194cee` (decisão P3). A tag
  local `publicado-2026-11-08` é só referência auxiliar, **não** proteção remota.
- Trabalho na branch `base-pedagogica` (a partir de `b194cee`). Sem force push, sem reescrita de histórico, sem tocar
  em `gh-pages`, `main`, `mvp-jornadas`, `cp-publicacao`, `remodelagem`.
- Antes de qualquer alteração: conferir commit atual, branches, `b194cee`, estado de `gh-pages` e o escopo dos
  arquivos. Depois: `validar.mjs` com 0 erro e `conferir-app.sh` idêntico.
- Nada fica só no ambiente temporário: cada etapa termina com commit e envio da branch de trabalho.

## 4. Divergências (decisão P5)

Nenhuma decisão linguística ou pedagógica sem evidência. Quando as fontes divergem (tradução, categoria, conteúdo):

1. Todas as ocorrências originais são preservadas (`ORI`).
2. As classificações de cada fonte ficam em `classificacoes_origem`.
3. A divergência é registrada (`DIV`, status `aberta`, com todas as versões).
4. **Não há classificação central forçada**: o campo central fica `null` (ex.: `EXP.subtipo`). O validador reprova
   um subtipo central diferente das fontes sem `DEC` (verificação 8).
5. A classificação futura só por análise linguística documentada: `DEC` com justificativa e evidências, `status:
   "aprovada"`; a `DIV` passa a `resolvida` apontando para ela.

Caso **“get changed”**: 4 ocorrências (Word R01 vocabulário, R08 vocabulário, R08 phrasal; Lukinhas phrasal) — as quatro
preservadas, classificações mantidas, `DIV` aberta, subtipo central `null`.

## 5. Fonte pendente: `Histórico IA inglês.docx` (decisão P4)

Até o documento original ser enviado:

- a conferência da fonte E5 (`daily-english`) fica **pendente** (manifesto e `FON.conferencia`);
- os conteúdos já identificados (101 vocabulário, 52 phrasal verbs, 29 diálogos, 367 traduções, 42 registros
  excluídos para revisão) são mantidos com suas referências e hashes quando ingeridos, marcados
  `fonte_pendente_de_conferencia`;
- nada é completado por inferência e a conferência não é declarada concluída.

## 6. Conteúdo não publicado (decisão P6)

CP01: os 65 itens publicados são preservados como estão; os 9 itens só da `remodelagem` (`8d5ac0c`) são preservados
**à parte** (`ORI` com a versão de origem) e entram como unidades `proposto` — registradas, **não ativadas**, sem
alterar o conteúdo publicado. A mesma regra vale para o restante do conteúdo só da `remodelagem`.
