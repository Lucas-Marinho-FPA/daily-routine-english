# Curso — Atividades (traduções do curso)

Área independente das jornadas para fazer as atividades de tradução (inglês → português) do curso do usuário,
registrar a correção do professor e exportar as respostas para a plataforma do curso.

## Catálogo, arquivo de estudo e exportação (2026-11-10) — vigente

Decisões do responsável (2026-11-10): o conteúdo do curso continua **só no aparelho** (importado pelo aluno; nunca
versionado nem publicado); a área vira um **catálogo** limpo; **importar** e **exportar** ficam em dois ícones discretos
no alto da tela; a **validação do professor sai da interface** (é controle editorial externo, registrado na Base de
Conhecimento), mas os dados já gravados continuam guardados e usados internamente; a **exportação parcial** é permitida
(substitui a regra anterior de exportar só com a atividade completa); entre partes vale a **regra sequencial**: a Parte N
abre quando todas as questões da Parte N−1 estão concluídas.

### Tela
- Título **Curso — Atividades**; no alto, à direita: ícone **Adicionar atividade (importar arquivo de estudo)** e ícone
  **Exportar respostas** (rótulo acessível e dica; área de toque de 48 px).
- Catálogo agrupado por conjunto (título neutro do arquivo) e partes (“Parte 1”…), na ordem; cada parte mostra o
  progresso, o selo **Offline** (o conteúdo está no aparelho), **Começar / Continuar (questão n) / Revisar**, **Praticar**
  e, recolhido em **Opções**, **Cópia de segurança** (arquivo de transferência) e **Remover**. Parte bloqueada mostra o
  motivo (“Conclua todas as questões da Parte 1…”, ou “Adicione a Parte 1…”); a rota direta também é recusada.
- Atividades antigas sem conjunto aparecem em “Outras atividades”, como antes (nunca bloqueadas).
- Na questão: sem chip, aviso, ✓ ou caixa de correção do professor; os campos ficam editáveis (a resposta de referência,
  se existir, fica guardada à parte). Na última questão concluída, atalho **Exportar respostas**.

### Formato oficial do arquivo de estudo (formato 1)
```json
{ "kind": "daily-routine-english/atividade", "formato": 1,
  "conjunto": { "id": "ACT-001", "titulo": "Curso — Atividades" },
  "partes": [
    { "id": "ACT-001-P01", "parte": 1, "titulo": "Parte 1", "versao": "1",
      "questoes": [ { "n": 1, "blocos": ["<título da questão>", "<linha em inglês>", "…"] } ] } ] }
```
- `conjunto.id`: letras maiúsculas + `-` + 3 dígitos (ex.: `ACT-001`); permanente; nunca reutilizar o código de outro
  conjunto. `partes[].id` = `<conjunto>-P<NN>` (ex.: `ACT-001-P02`), conferido com `parte`.
- `questoes`: em ordem a partir de 1; `blocos`: cada linha em inglês, sem alterar texto, pontuação ou ordem (o 1º bloco é
  o título da questão). Um arquivo pode trazer todas as partes ou só algumas.
- Só esses campos são lidos; **qualquer outro (fonte, autor, instituição, de-para…) é ignorado**: não é guardado nem
  exportado. Títulos devem ser neutros. O de-para e os nomes de origem ficam só na Base de Conhecimento.
- Continuam aceitos (mecanismo anterior): arquivo de texto da atividade (`.txt`, `.docx`, `.md` com “QUESTION 1”…, ou
  texto colado), a cópia de segurança (`.json` de transferência) e o TXT de respostas exportado (restaura respostas).

### Importação (`readPackage`, `planPackage`, `applyPackage` em `js/engine/course.js`)
Antes de alterar qualquer coisa, a folha mostra a prévia por parte e pede confirmação:
- **nova** → entra no catálogo com o código como identificador;
- **já está igual** → nada muda (sem duplicar);
- **já está no aparelho sem código** (mesmo conteúdo em inglês) → **adoção**: recebe código/parte; respostas,
  correções, progresso e retomada intactos (é o caminho das quatro partes atuais);
- **versão diferente da mesma parte** (ou a mesma atividade antiga com ≥ 50% dos trechos iguais) → **atualização
  controlada**: a versão anterior inteira vai para `archive`; respostas dos trechos que não mudaram são mantidas;
  questão alterada volta a ficar em aberto (isso pode bloquear de novo a parte seguinte, pela regra sequencial);
- conteúdo que já pertence a **outra parte** catalogada → recusado (nada muda);
- arquivo inválido, de respostas que não confere ou desconhecido → mensagem e **nada muda**.
Antes do catálogo, o app grava uma única cópia do registro (`kv` → `course.copia-antes-catalogo`).

### Exportação (`exportReport`)
Cópia (nunca altera nada; pode repetir). Texto: cabeçalho — `Curso — Atividades`, `Atividade: ACT-001-P01 · Parte 1 ·
versão 1`, `Exportado em: …`, `Situação: completa (n de n…)` ou `CONTÉM RESPOSTAS INCOMPLETAS (x de n…)` e `Faltam: …`
— seguido de, por questão, `QUESTÃO n`, cada bloco em inglês e a resposta (linha vazia quando falta), o mesmo corpo que
a plataforma recebe. JSON complementar (`daily-routine-english/respostas`, formato 1). Sem dados do professor, histórico,
aparelho ou de-para.

### Incorporar a próxima atividade
1. Na Base de Conhecimento: atribuir o próximo código livre (`ACT-002`…; conferir o registro interno antes) e registrar
   o de-para e a origem **só** ali.
2. Gerar o arquivo no formato 1 (títulos neutros, blocos literais) e guardá-lo **fora do repositório**.
3. No aparelho: Curso — Atividades → ícone de adicionar → escolher o arquivo → conferir a prévia → Adicionar.
4. Estudar, exportar as respostas pelo ícone e levar ao professor. A validação, quando houver, é registrada na Base;
   o app não precisa dela para disponibilizar ou estudar a atividade.

As seções abaixo descrevem versões anteriores; onde divergirem desta, vale esta.

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

## Praticar — práticas complementares (2026-11-10)

Botão **Praticar** no cartão de cada atividade e no topo da questão (rota `#/cpr/<id>`). A tradução continua sendo a
atividade principal: a prática **só lê** a atividade — não muda respostas, correções/validações do professor, avaliação
automática nem exportação. Tudo é gerado no aparelho a partir do texto importado (nada do curso é versionado ou enviado).

- **Vocabulário e expressões:** significado (múltipla escolha), lembrar a expressão a partir do sentido, completar a
  frase (o gabarito é o trecho do original) e escrever o significado. Itens = unidades de sentido do original
  (`unitsOf`, as mesmas da avaliação automática) que o glossário traduz; cada item guarda a origem (questão e bloco).
- **Significado só confirmado:** o glossário mistura entradas escritas para o app com o FreeDict, que traz sentidos fora
  de contexto. Um significado só vira questão quando (a) aparece na versão **validada pelo professor** de um bloco onde o
  item ocorre (nesta ou em outra atividade do aparelho) ou (b) vem das entradas escritas para o app (`trusted` no
  glossário: pares dos conteúdos e expressões de apoio). Múltipla escolha só com alternativas de sentido disjunto.
  Ao escrever o significado: sentido confirmado = certo; outro sentido que o glossário admite = “sem evidência” (não conta
  como erro); errado só quando todas as palavras são conhecidas e nenhuma tem o sentido do item.
- **Escuta:** ouvir uma expressão ou frase do original (voz do sistema do aparelho — não é áudio do curso) e escolher
  entre alternativas da própria atividade; o texto aparece depois da resposta.
- **Fala:** ouvir, falar (com opção de ocultar o texto) e, com o reconhecimento local instalado (o mesmo do Speaking
  Lab), ver o que foi reconhecido palavra a palavra. Não é avaliação de pronúncia; palavra não reconhecida pode ser falha
  do reconhecimento. Sem reconhecimento instalado, a tentativa não é corrigida e nada é bloqueado. Nenhuma gravação é
  guardada.
- **Tradução reversa (português → inglês):** só blocos de questões **validadas pelo professor**; o enunciado é a versão
  do professor e o gabarito é o inglês original. Resposta do aluno, correção não validada e avaliação automática nunca
  são gabarito. Paráfrase possível fica “sem evidência”, não erro.
- **Progresso:** registro próprio `kv` → `course-practice`, por atividade (id de conteúdo): tentativas, acertos, erros,
  “sem evidência”, repetição espaçada por exercício (a mesma de `scheduler.js`, em registro separado) e a sessão em
  andamento (retomada ao reabrir). “Repetir os erros” ao fim da rodada e como modo próprio. Não entra no backup de
  Ajustes (como as atividades).
- **Código e testes:** `js/engine/coursepractice.js` (regras), `js/ui/coursepractice.js` (telas);
  `dev/tests/unit/coursepractice.test.js` e `dev/tests/e2e/coursepractice.mjs` (conteúdo sintético).

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

## Transferir respostas e correções do professor (2026-11-08) — histórico: a importação de correções saiu da interface em 2026-11-10

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

## Formato exportado — histórico (o corpo continua o mesmo; ver “Exportação” acima)

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

## Correção do professor — histórico: saiu da interface em 2026-11-10 (dados preservados)

Em cada questão concluída: **Correção do professor** → **Registrar a correção do professor** (começa com a sua
tradução) → editar bloco a bloco → **Marcar como validada pelo professor** (data registrada; campos travados;
**Editar a correção** desfaz a validação). Independente por questão e não exigida para avançar. Ficam guardadas:
a primeira tradução enviada, a checagem básica do envio, a versão corrigida, o estado e a data da validação. A
checagem automática nunca vira a versão oficial.

## Código e testes

- `js/engine/course.js` (regras puras: importação, sequência, envio, exportação, checagem básica),
  `js/ui/course.js` (telas e salvamento), rotas `#/course` e `#/cq/<id>?q=<n>` em `js/main.js`, cartão no Início
  (`js/ui/home.js`), `getKv`/`putKv` em `js/store/db.js`.
- Unitários: `dev/tests/unit/course.test.js` e `dev/tests/unit/coursecatalog.test.js` (catálogo, formato, adoção,
  atualização, progressão, exportação; conteúdo sintético).
- E2E: `dev/tests/e2e/course.mjs` (18 verificações) e `dev/tests/e2e/coursecatalog.mjs` (8). Com o arquivo real fora do repositório:
  `DRG_COURSE_FILE=<arquivo> node tests/e2e/course.mjs <site> /daily-routine-english/ <evidências>`.
