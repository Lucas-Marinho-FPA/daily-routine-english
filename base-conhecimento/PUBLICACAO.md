# Base de Conhecimento — Daily Routine English (publicação no Git)

Branch `base-conhecimento`: área própria e independente da **Base de Conhecimento**. Não é o Produto (branches do
aplicativo, `governanca`) nem a **Base Pedagógica** (branch `base-pedagogica`); a relação entre esta Base e a Base
Pedagógica será organizada depois, por decisão do Product Owner, e nada daquela branch foi incorporado aqui.

A branch partiu de `main` apenas como referência inicial; o conteúdo do aplicativo herdado de `main` não pertence a
esta Base e não deve ser alterado a partir dela. Tudo o que é da Base está nesta pasta.

## Autoridade

A Base de Conhecimento mantém a autoridade sobre o acervo original, a organização do conhecimento, a rastreabilidade
das fontes, os códigos (SRC, MAT, ACT, EX, VOC) e o de-para, o histórico de decisões e o registro das validações
pedagógicas. Regras completas: `01_Governanca/00` a `09` (o 05 não é publicado; ver abaixo).

Validações vigentes (registradas pela Base, inalteradas): Ian Parts 1, 2 e 3 validadas com o professor; Ian Part 4
consolidada e **aguardando a correção do professor**. Nenhum código foi atribuído nesta publicação.

## Origem e integridade

Pacote "Base de Conhecimento — Daily Routine English", preparado em 2026-11-10, com 17 arquivos. Os arquivos
publicados são cópias **byte a byte** dos originais, com os mesmos nomes e a mesma estrutura de pastas
(`00_LEIA-ME_DO_PACOTE.txt` descreve o pacote completo). As somas SHA-256 de todos os 17 arquivos — publicados ou
não — estão em `MANIFESTO_SHA256.txt`, para conferir a integridade de qualquer cópia.

## Publicados (11)

`00_LEIA-ME_DO_PACOTE.txt` e `01_Governanca/`: `LEIA-ME.md`, `00_Instrucoes_Permanentes.md`,
`01_Manual_de_Consolidacao.md`, `02_Modelo_de_Registro_de_Atividades.md`, `03_Modelo_de_Conhecimento_Linguistico.md`,
`04_Politica_de_Preservacao_e_Rastreabilidade.md`, `06_BASE_MESTRA_E_CATALOGO.md`,
`07_Checklist_Mestre_de_Consolidacao.md`, `08_Historico_de_Decisoes_e_Pendencias.md`,
`09_Metodologia_de_Revisao_e_Praticas.md`.

## Preservados fora da publicação (6) e motivo concreto

O repositório é **público**. Estes arquivos continuam íntegros nas fontes do projeto Base de Conhecimento e no
pacote original; não foram alterados, resumidos nem redigidos.

| Arquivo | Restrição concreta |
|---|---|
| `01_Governanca/CONTROLE_INTERNO_NAO_PUBLICAR/05_De_Para_Interno_de_Fontes.md` | Classificado pelo próprio documento como controle interno: “não incluir em repositórios públicos” (DEC-KB-007). |
| `03_Acervos_Ian/Acervo_Atividade_Ian_Parte_1_FINAL.md` | Reproduz literalmente o texto original das atividades do curso (diálogos e frases, 48 trechos “Original”). É material de terceiros sem licença ou autorização de redistribuição registrada (o de-para não registra direitos da fonte; política 04, §7: “não presumir que o fato de o usuário possuir uma atividade autoriza sua redistribuição”). |
| `03_Acervos_Ian/Acervo_Atividade_Ian_Parte_2_FINAL.md` | Mesmo motivo: 44 trechos “Original” do material do curso, com as correções do professor. |
| `03_Acervos_Ian/Acervo_Atividade_Ian_Parte_3_FINAL.md` | Conteúdo das questões do curso (mesmo motivo de direitos) e 3 menções ao nome da instituição do curso, que está na lista de nomes protegidos do repositório (regra permanente do Product Owner). |
| `03_Acervos_Ian/Acervo_Atividade_Ian_Parte_4_FINAL.md` | Conteúdo das questões do curso (direitos) e 20 menções ao nome protegido da instituição. |
| `02_Base_Mestra/Base_Mestra_Daily_Routine_English_FINAL.md` | Título e conteúdo com o nome protegido da instituição (2 menções) e exemplos marcados `[ATIVIDADE]` extraídos do material do curso. |

Para publicar qualquer um deles é preciso decisão do Product Owner: autorização/licença de redistribuição do material
do curso e, para o nome da instituição, retirada da regra de proteção. Alternativa sem essas decisões: um repositório
**privado** (exige aprovação, pois esta tarefa não autorizou criar repositório).

## Proteção contra publicação acidental

- `.gitignore` desta pasta bloqueia `CONTROLE_INTERNO_NAO_PUBLICAR/`, arquivos de de-para, acervos e Base Mestra.
- `verificar-publicacao.sh` falha se algum arquivo bloqueado estiver no índice, se surgir (mesmo com outro nome)
  conteúdo do de-para ou códigos SRC/MAT, texto no formato dos acervos de atividades ou nome protegido, ou se um arquivo publicado divergir do manifesto. Rodar antes de cada commit, ou
  instalar como gancho local:

```bash
ln -sf ../../base-conhecimento/verificar-publicacao.sh .git/hooks/pre-commit
```

O `.gitignore` não impede `git add -f`; por isso a verificação técnica é obrigatória (exigência do próprio de-para:
“não confiar apenas no nome da pasta”).
