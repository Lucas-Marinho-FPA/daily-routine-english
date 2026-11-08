# Curso — Atividades (traduções do curso)

Área independente das jornadas para fazer as atividades de tradução (inglês → português) do curso do usuário,
registrar a correção do professor e exportar as respostas para a plataforma do curso.

## Decisões do responsável (2026-11-08)

- **Nome neutro no app publicado:** a área se chama “Curso — Atividades”. O nome do curso/unidade é dado privado
  (regra permanente do `CLAUDE.md`) e não aparece no app, no repositório nem nos testes.
- **Texto das atividades importado no aparelho:** o material do curso é de terceiros, sem licença de publicação.
  O app publicado traz só a ferramenta; o usuário importa o arquivo `.txt` da atividade em
  **Início → Curso — Atividades → Importar atividade** (ou cola o texto). O texto e as respostas ficam só no
  aparelho (IndexedDB). **Nunca versionar o texto de uma atividade do curso** (testes usam conteúdo sintético).

## Fluxo

1. Início → cartão **Curso — Atividades** → **Abrir**.
2. Lista de atividades importadas (ex.: a Part 4 com 21 questões) → **Começar** / **Continuar (questão n)**.
3. Uma questão por vez: “Questão n de 21”, progresso, estado (Não iniciada / Em andamento / Concluída) e estado da
   validação do professor. Cada linha em inglês do arquivo é um bloco (o título da questão também), com o campo de
   tradução logo abaixo. Nada em português é mostrado antes da resposta.
4. **Salvar e avançar** exige todos os blocos preenchidos (mostra os que faltam). A navegação é sequencial: uma
   questão abre quando a anterior foi concluída; as concluídas podem ser abertas e editadas a qualquer momento.
5. Na última questão: **Salvar e concluir a atividade** → **Exportar todas as respostas** (TXT) e **Copiar o texto**.
   Se faltar algo em qualquer questão, a exportação é recusada com a lista do que falta.

## Formato do arquivo importado

```
<título da atividade>
(linhas ignoradas até a primeira questão)
QUESTION 1            (ou QUESTÃO 1)
<título da questão>   → bloco 1
<linha>               → um bloco por linha não vazia, sem alteração de texto, pontuação ou ordem
QUESTION 2
…
```

Reimportar o mesmo arquivo mantém as respostas (identificador = hash do conteúdo). Um arquivo com outro texto vira
outra atividade. A divisão em blocos é linha a linha (instrução do arquivo da Part 4); quando houver os exemplos de
segmentação da Part 3, basta ajustar as quebras de linha do arquivo antes de importar.

## Avaliação automática das traduções (2026-11-09)

Substitui a antiga “checagem básica” (que só olhava tamanho, números, nomes, “?” e negação e aprovava por padrão).
Agora compara o **sentido**, em `checkTranslation` (`js/engine/course.js`), reaproveitando `lemma` (`lexicon.js`),
`isFunctionWord` (`coherence.js`) e `levenshtein` (`text.js`):

- O original vira unidades de sentido: **expressões primeiro** (“take a message”, “hang up”, “hold on”), depois palavras
  de conteúdo (sem as gramaticais, modais e interjeições; nomes próprios à parte).
- Cada unidade com tradução conhecida é procurada na resposta (raízes do português; variações e paráfrases do glossário;
  sinônimos que voltam à mesma palavra inglesa pelo índice inverso).
- Palavras da resposta **reconhecidas** com sentido que não está no original = conteúdo acrescentado. Palavras
  desconhecidas do glossário **não contam contra**.
- **Memória de tradução:** a versão validada pelo professor para o mesmo texto em inglês tem prioridade (igual ou
  próxima → Adequada).
- Resultados: **Adequada** (sentido identificado), **Incompatível** (nada do original + conteúdo novo, ou acréscimos que
  mudam o sentido, ou ainda em inglês), **Inconclusiva** (sem evidência suficiente — não é erro). Número, nome ou negação
  faltando impedem “Adequada”. Cada resultado mostra o que não foi identificado e o que foi acrescentado.
- Caso de referência (Q4: pedido para anotar um recado respondido com “Posso comer frango com catupiry?”) =
  **Incompatível** (não identificado: take a message → anotar/deixar recado; acrescentado: comer, frango). Nos testes
  versionados a frase é sintética; o caso real roda só com `DRG_COURSE_FILE` (arquivo fora do repositório).
- **Glossário** `data/glossary-en-pt.json.gz` (~185 KB, carregado só na tela de questão do Curso, funciona offline):
  pares do app (prioridade), expressões de apoio escritas para o app (`dev/content/glossary/phrases-en-pt.json`) e
  **FreeDict English-Portuguese** (GPL-2.0+, atribuição em `data/glossary-LICENSE.txt` e
  `dev/vendor/freedict-eng-por/README.md`). Gerado por `dev/tools/build-glossary.mjs` (chamado pelo `build-app`).
- Limites: paráfrases com palavras fora do glossário ficam “Inconclusivas”; polissemia pode marcar uma palavra como
  acréscimo (por isso um único acréscimo não reprova); não avalia naturalidade, registro nem gramática do português.

## Caderno em vários aparelhos (2026-11-09)

- **Adicionar atividade:** arquivo **.txt, .docx (Word) ou .md**, ou texto colado (`js/engine/docread.js`: o .docx é
  lido no próprio aparelho, sem rede). A atividade é reconhecida pelo **conteúdo em inglês**: importar o mesmo
  material de novo (em qualquer formato) não cria outro cartão.
- **Um cartão por atividade:** ao abrir, atividades repetidas são juntadas (fica o título real). Um cartão genérico
  “Atividade” criado ao importar o TXT de respostas como atividade some: as traduções dele vão para as questões ainda sem
  resposta da atividade real. Esse TXT agora é recusado em “Adicionar atividade” (com a orientação certa). Cada cartão
  tem “Remover” (com confirmação).
- **Exportar para outro aparelho** (cartão da atividade): arquivo `<título>-transferencia.json` com a atividade
  inteira — questões, textos, respostas, conclusão, validações e data da última edição de cada questão. É diferente do
  TXT para a plataforma do curso (que continua igual, na questão final).
- **Importar respostas de outro aparelho:** aceita o .json de transferência (cria a atividade se ela não existir;
  senão atualiza o mesmo cartão — em cada questão fica a versão editada por último; validação do professor sempre
  prevalece) e, como antes, o TXT/DOCX/MD no formato da plataforma.
- **Importar correções do professor:** igual, agora também em .docx e .md.

## Transferir respostas e correções do professor (2026-11-08)

Área **Curso — Atividades → Transferir respostas e correções** (a atividade precisa estar importada no aparelho):

- **Importar minhas respostas:** o `.txt` exportado por este app em outro aparelho. Cada questão do arquivo atualiza
  as respostas daquela questão (bloco vazio no arquivo mantém o atual); questões validadas pelo professor não mudam.
  As respostas ficam visíveis e editáveis normalmente.
- **Importar correções do professor:** o mesmo formato, com as traduções corrigidas (pode conter só algumas
  questões). Cada questão do arquivo passa a ter a versão corrigida como **a** resposta, marcada como validada pelo
  professor (resposta oficial, campos travados; “Editar a correção” desfaz a validação). Importar de novo atualiza.
- **Leitura segura:** questão identificada pelo **número** e conferida pelo **texto em inglês** de cada bloco; a
  resposta é o que fica entre um bloco em inglês e o seguinte (não depende da posição das linhas; aceita CRLF, título,
  linhas em branco e respostas em várias linhas). Questão inexistente, repetida ou com inglês que não confere →
  aviso e **nada é alterado**. Antes de aplicar, uma prévia mostra o que será feito.
- **Resposta oficial:** com validação, a versão do professor é a resposta usada (`officialAnswers`), inclusive na
  exportação; sem validação, vale a resposta pessoal. Hoje nenhum exercício do app usa as respostas do curso; quando
  usar, deve ler `officialAnswers`.
- Tudo é lido e gravado só no aparelho (IndexedDB), offline; nada é enviado.

## Formato exportado

```
QUESTÃO 1
<bloco em inglês>
<tradução do aluno>
<próximo bloco em inglês>
<tradução do aluno>

QUESTÃO 2
…
```

UTF-8, acentos e pontuação preservados; arquivo `<título>-respostas.txt`.

## Salvamento

- Automático enquanto digita (~0,15 s depois da última tecla), no IndexedDB (`kv` → `course`), separado do estado
  de estudo: não mexe em jornadas, progresso, revisão nem Speaking Lab.
- Ao sair do app (página escondida/encerrada) também grava uma cópia síncrona no `localStorage`
  (`drg.course.mirror`); na abertura vale a mais nova.
- A posição (questão e bloco) é guardada: **Continuar** volta ao ponto em que parou.
- O backup JSON de Ajustes **não** inclui as atividades (limitação; o TXT exportado é a cópia das respostas).

## Checagem básica (orientação, não correção)

Depois que a questão é salva, cada bloco mostra **Adequada**, **Revisar** ou **Atenção**, com o motivo. É uma
heurística local (sem IA, sem serviço externo): texto ainda em inglês, tradução muito curta ou longa, número que não
aparece, nome próprio ausente, pergunta sem “?”, negação ausente. **Não avalia o sentido**, não bloqueia o avanço e
não muda a resposta. “Adequada” = nenhum alerta. O resultado do momento do envio fica guardado.

## Correção do professor

Em cada questão concluída: **Correção do professor** → **Registrar a correção do professor** (começa com a sua
tradução) → editar bloco a bloco → **Marcar como validada pelo professor** (data registrada; campos travados;
**Editar a correção** desfaz a validação). Independente por questão e não exigida para avançar. Ficam guardadas:
a primeira tradução enviada, a checagem básica do envio, a versão corrigida, o estado e a data da validação. A
checagem automática nunca vira a versão oficial.

## Código e testes

- `js/engine/course.js` (regras puras: importação, sequência, envio, exportação, checagem básica),
  `js/ui/course.js` (telas e salvamento), rotas `#/course` e `#/cq/<id>?q=<n>` em `js/main.js`, cartão no Início
  (`js/ui/home.js`), `getKv`/`putKv` em `js/store/db.js`.
- Unitários: `dev/tests/unit/course.test.js` (conteúdo sintético).
- E2E: `dev/tests/e2e/course.mjs` (13 verificações). Com o arquivo real fora do repositório:
  `DRG_COURSE_FILE=<arquivo> node tests/e2e/course.mjs <site> /daily-routine-english/ <evidências>`.
