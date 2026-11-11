# Arquitetura de Dados e Conteúdo

## Fontes de dados
Globais identificados: `DRG_CONTENT`, `DRG_CHARACTERS`, `DRG_JOURNEYS`, `DRG_AUDIO`. Confirmar esquemas e arquivos no código antes de migrações.

## Inventário da branch auditada em 08/11
| Pacote | Módulos | Blocos | Frases | Itens | Perguntas | Gramática |
|---|---:|---:|---:|---:|---:|---:|
| Lucas | 18 | 58 | 192 | 291 | 109 | 18 |
| Karla | 11 | 35 | 104 | 151 | 35 | 11 |
| Lukinhas | 10 | 21 | 66 | 73 | 30 | 10 |
| Conversation Practice | 2 | 4 | 37 | 65 | 13 | 2 |
| Total | 41 | 118 | 399 | 580 | 187 | 41 |

## Áudio — snapshot
1.787 arquivos no índice; Lucas 771 sem ausência; Karla 293 de 312 chaves sem arquivo; Lukinhas 253 sem ausência; Conversation Practice 132 sem ausência. 349 arquivos sem correspondência direta nos dados; uso dinâmico não confirmado. Não apagar/renomear em lote sem rastrear referências.

## Modelo conceitual
Preservar relações entre jornada, módulo, bloco/etapa, atividade, item linguístico, frase, áudio, personagem/contexto, progresso e agenda de revisão. IDs estáveis e únicos; migrações controladas.

## Conteúdo
Inglês britânico como referência; variante americana quando útil; significado contextual; phrasal verbs, collocations, chunks e padrões com preposição como unidades; gramática em contexto; proveniência e status de curadoria.

## Direitos
Material de terceiros sem licença/autorização não deve ser publicado. FreeDict foi identificado como GPL-2.0+ e requer atribuição/compatibilidade. Repositório não declarava licença própria no snapshot. Separar conteúdo autoral, licenciado e referência interna.

## Backup/privacidade
Backup JSON auditado não incluía Curso. Definir escopo de exportação/restauração, privacidade e migração. Áudio respeita consentimento e retenção.
