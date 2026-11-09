# Base Pedagógica — Política de preservação

Normativa. Princípio central: **preservar integralmente o conhecimento antes de transformá-lo**. Aprovação de
arquitetura ou de consolidação **não** autoriza eliminar ou reescrever conteúdo.

## 1. Regras obrigatórias

| # | Regra | Como é garantida |
|---|---|---|
| 1 | Nenhum original é sobrescrito | `ORI` imutável: gravador recusa regravar; verificações 4 e 11 |
| 2 | Nenhuma atividade, texto ou exercício é resumido | conteúdo literal no `ORI`; unidades citam o texto integral; fonte reconstruível (verificação 5) |
| 3 | Nenhuma pergunta ou resposta é descartada | cobertura total da extração; originais = incorporados + pendentes (verificação 5) |
| 4 | Nenhuma duplicidade é eliminada sem rastreabilidade | os `ORI` duplicados permanecem e são citados (`rastreabilidade.md` §4) |
| 5 | Nenhuma equivalência semântica automática; semelhança não vira duplicidade | `equivalente_a`/`semelhante_a` só com `DEC` aprovada; `duplicado_de` só com conteúdo idêntico (verificação 7) |
| 6 | Traduções e explicações separadas do original | campos próprios com `origem` (esquema) |
| 7 | Toda unidade tem origem verificável | `evidencias` ≥ 1 e referências válidas (verificações 1, 3) |
| 8 | Nenhuma classificação gramatical, nível CEFR ou habilidade sem evidência | verificação 8; habilidades só com origem |
| 9 | Materiais de terceiros sem licença compatível ficam fora da distribuição | `somente_referencia`, sem `ORI` (verificação 9) |
| 10 | Lacuna registrada, nunca preenchida por invenção | `lacunas[]`, `perguntas_abertas` sem resposta inventada, pendentes com motivo |

## 2. O que nunca se faz

- Apagar, editar ou “corrigir” um `ORI`, um arquivo de origem ou uma linha de `ids.jsonl`; reaproveitar um ID.
- Completar traduções, respostas, frases, classes gramaticais, níveis ou fatos de personagens por inferência.
- Copiar conteúdo protegido de terceiros para o repositório.
- Alterar o aplicativo, o motor pedagógico, os dados funcionais, IndexedDB, PWA, service worker, interface,
  reconhecimento de voz ou conteúdos publicados a partir da Base.

## 3. Materiais de terceiros

Manter o projeto público não autoriza redistribuir material de terceiros. Conversation Book, as atividades do curso e
outros materiais sem licença de redistribuição ficam **fora** da distribuição pública até haver autorização ou licença
compatível. Podem ser registrados como fontes externas (`FON` com `natureza: terceiros`, `distribuicao:
somente_referencia`, identificação e licença), **sem** conteúdo. Para conferir que nada vazou, o validador aceita
`--protegidos <arquivo>` com o texto protegido guardado fora do repositório. O FreeDict (GPL-2.0+) é licenciado: entra
com licença e atribuição registradas.

## 4. Divergências

Nenhuma decisão linguística ou pedagógica sem evidência. Quando as fontes divergem (tradução, categoria, nível,
pronúncia, conteúdo):

1. todas as ocorrências originais são preservadas (`ORI`);
2. as classificações de cada fonte ficam em `classificacoes_origem`;
3. a divergência é registrada (`DIV` aberta, com cada valor e seu `ORI`);
4. **não há classificação central forçada** (ex.: `EXP.subtipo` fica `null`);
5. a resolução futura só por análise documentada: `DEC` aprovada; a `DIV` passa a `resolvida` apontando para ela.

## 5. Daily-English e `Histórico IA inglês.docx`

O documento original será enviado pelo usuário. Até lá, o Daily-English não é declarado conferido, nada é completado
por inferência, e os conteúdos já identificados, quando incorporados, levam a lacuna `fonte_pendente_de_conferencia`.

## 6. Proteção do aplicativo e do trabalho

- Referência de preservação: `b194cee`, na branch `arquivo/publicado-2026-11-08`. `gh-pages` permanece intacta.
- Trabalho na branch `base-pedagogica`; sem force push, sem reescrita de histórico, sem publicação.
- A cada fonte: `consolidar` → `gerar` → `validar` (0 erro) → autotestes → `conferir-app.sh` (byte a byte igual a
  `b194cee`) → regressão das suítes do app → um commit → relatório para revisão do usuário antes da fonte seguinte.
- Testes nunca são alterados para passar sem corrigir a causa; intermitências são investigadas, não mascaradas.
