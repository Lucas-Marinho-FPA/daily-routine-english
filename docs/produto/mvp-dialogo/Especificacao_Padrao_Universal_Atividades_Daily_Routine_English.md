# DAILY ROUTINE ENGLISH — Padrão Universal de Atividades (Markdown)

**Versão:** 1.0 — padrão estrutural de intercâmbio
**Escopo:** acervos de atividades de qualquer origem e direção de tradução.

## 1. Princípios

- Um arquivo Markdown por parte/atividade, em UTF-8.
- Preservar texto, pontuação, ordem, respostas, traduções e comentários da fonte.
- Não criar códigos oficiais; manter identificadores de origem e usar numeração estrutural local quando necessário.
- Não confundir tradução enviada pelo aluno com resposta de referência ou correção do professor.
- Não inferir conteúdo ausente. Registrar lacunas e ambiguidades.
- A anonimização institucional é separada da revisão pedagógica.

## 2. Estrutura comum

```markdown
# DAILY ROUTINE ENGLISH — ATIVIDADE

## Identificação
- Nome da atividade
- Identificador de origem (se houver)
- Idioma e direção da tradução (somente quando evidenciados)
- Situação de validação do professor (conforme fonte)

## 1. Apresentação e contexto
[apresentação e instruções originais]

## 2.N QUESTION N — [título original, se houver]
### ITEM N (numeração original preservada, quando houver)
#### Contexto e instruções
#### Diálogo ou texto original
#### Tradução enviada pelo aluno
#### Correção do professor (somente se existir na fonte)
#### Pontos de ajuste registrados
#### Sugestão alinhada registrada
#### Observações e explicações

## 2.SNN SUPPLEMENTARY UNIT NN — [título original]
[mesma estrutura de ITEM, ou conteúdo explicativo integral]

## 3. Síntese e notas finais do acervo de origem
[quando existente]
```

## 3. Semântica dos campos

- **Diálogo ou texto original:** bloco no idioma-fonte; pode ser diálogo com vários participantes ou texto corrido.
- **Tradução enviada pelo aluno:** versão efetivamente enviada pelo aluno. Não é automaticamente uma tradução de referência.
- **Correção do professor:** somente a correção explicitamente identificada como tal na fonte.
- **Pontos de ajuste / Sugestão alinhada / Observações e explicações:** comentários preservados com sua natureza original; não devem ser reclassificados como correção oficial sem evidência.
- **Contexto e instruções:** orientações e contexto associados à unidade, não conteúdo de tradução.
- **SUPPLEMENTARY UNIT:** unidade complementar que não deve ser artificialmente convertida em questão principal.

## 4. Direção da tradução

Registrar `EN → PT`, `PT → EN` ou outra direção apenas quando a fonte permitir identificar com segurança o texto-fonte e a tradução. Se houver múltiplas direções ou versões, separar os pares sem misturá-los. Se a direção não estiver clara, registrar “não identificada na fonte”.

## 5. Identificadores e numeração

- Preservar IDs oficiais existentes sem renomear ou reutilizar.
- Não atribuir ACT/SRC/MAT/EX/VOC durante a conversão.
- `QUESTION N`, `ITEM N` e `SUPPLEMENTARY UNIT NN` são marcadores estruturais locais, não códigos pedagógicos.
- Preservar lacunas e numeração original; não renumerar linhas faltantes para aparentar continuidade.

## 6. Regras de importação futura

Este padrão é um formato de intercâmbio documental e de rastreabilidade. A estrutura detalhada não equivale ao pacote técnico de importação do aplicativo. A extração para o importador deve selecionar somente os blocos de inglês exigidos pelo contrato técnico vigente, preservando a ordem e o texto literal; traduções, respostas e comentários não devem ser exportados como blocos de inglês. A compatibilidade técnica precisa ser validada pelo projeto Produto e Desenvolvimento.
