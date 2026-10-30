# Jornadas, personas e etapas — MVP

Evolução da arquitetura de aprendizagem sem reconstruir o app: o motor (repetição espaçada, exercícios, corretor,
XP, Speaking Lab, áudio offline, service worker) é o mesmo; mudaram a organização do progresso, a navegação e a forma
de apresentar o conteúdo que já existia.

## 1. Diagnóstico (antes)

- **Navegação:** Início com sessão do dia, Rotina 1, atalhos por momento do dia, Speaking Lab, revisão e um cartão do
  Conversation Practice; abas Início · Estudar (explorar) · Falar · Progresso. Muitas informações ao mesmo tempo.
- **Personagens:** Lucas (conteúdo base) e Karla (pacote em `data/characters.js`); troca de personagem mudava só a
  “visão” de conteúdo.
- **Progresso:** um único estado global (`cards`, `xp`, `days`, `log`, conquistas…) para todos os personagens e para
  o Conversation Practice. Itens genéricos (`it.*`) eram compartilhados de propósito: estudar com a Karla dominava o
  item também no Lucas. XP, nível e sequência eram globais.
- **Motor:** Leitner (caixas 0–6), cartão = (unidade, habilidade), desbloqueio progressivo dentro da sessão
  (reconhecer → lembrar → completar; montar → escrever; sequência → contar bloco → contar rotina; perguntas depois que
  a rotina começou; ouvir/ler nas jornadas). XP por habilidade com limites anti-farm.
- **Conversation Practice:** visão própria (IDs `CP…`, `cp.*`), situação por habilidade calculada dos cartões.
- **Speaking Lab:** frases, blocos, perguntas e drills; gravação local, reconhecimento local opcional (Moonshine) e
  feedback contextual; sem avaliação acústica por palavra.
- **Offline/PWA:** service worker com pré-cache completo, áudio Kokoro embutido.
- **Testes:** unitários (`node --test`) e E2E em Chromium (local, simulação do GitHub Pages, reconhecimento, armazenamento,
  prática de palavras, personagens, jornada).

## 2. O que mudou

### Progresso por perfil (esquema 2)
- `engine/profiles.js`: cada **persona** tem um perfil (`lucas`, `karla`, `lucas-kid`, `heitor`) e cada **jornada
  independente** tem um perfil único (`journey:cp`), igual para todas as personas.
- No perfil: cartões, XP, dias (sequência), histórico, conquistas, respostas, gravações (registro), palavras marcadas,
  favoritos e pendências. Globais: ajustes, variantes aceitas pelo aluno, data do último backup.
- Em execução, o perfil ativo fica no topo do estado (`state.cards`, `state.xp`…): todo o motor continua igual.
  Ao gravar, o topo volta ao perfil e não é duplicado.
- **Migração do esquema 1** (sem perdas): cada cartão, resposta, gravação, pendência e linha do histórico vai para o
  perfil dono do conteúdo; itens genéricos compartilhados e o que não tem dono reconhecido ficam com o Lucas (o aprendiz
  original). O XP total, os dias, as conquistas e o checklist ficam com o Lucas — não há como separar o XP já ganho por
  personagem, então nada é dividido nem zerado. A cópia do estado antigo fica em `state.prev` no IndexedDB, como em
  toda migração. Backups antigos são importados pelo mesmo caminho.
- Itens compartilhados não geram domínio automático em outra persona.

### Personas
- Lucas e Karla preservados. **Lucas (11 anos)** e **Heitor** cadastrados como `planned` em
  `content/personas-planned.json` (sem rotinas, sem fatos inventados; idade do Heitor a confirmar). A Daily Routine
  deles aparece “em preparação”; telas de estudo mostram o aviso em vez do conteúdo de outra persona; o Conversation
  Practice já pode ser usado. Para ativar: criar `content/characters/<id>.json` no formato do da Karla.

### Navegação
- **Início:** quem está estudando (avatar/inicial, nome, nível, XP e sequência da persona), progresso da Daily Routine,
  “Continuar de onde parou” (próxima etapa da última trilha aberta), troca de persona e **Minhas jornadas** com dois
  cartões — Daily Routine da persona e Conversation Practice — cada um com descrição, progresso, próxima etapa e botão.
- **Estudar** abre os módulos da trilha ativa (`#/modules`); cada módulo (`#/module/ID`) mostra as cinco etapas.
- Explorar por momento do dia/categoria e as telas de rotina continuam acessíveis a partir da lista de módulos.

### Módulos e etapas (`engine/modules.js`)
Módulo = rotina/episódio da persona ou unidade da jornada. As cinco etapas usam o MESMO contexto do módulo:

| Etapa | Conteúdo | Concluída quando (acertou ao menos uma vez) |
|---|---|---|
| 01 Palavras-chave | itens palavra/verbo/profissional | 80% dos itens |
| 02 Expressões práticas | phrasal verbs, collocations, tempo, conectores, frases feitas | 80% dos itens |
| 03 Ouvir e entender | jornadas: trechos de diálogo com pergunta; rotinas: reconhecer pelo som frases do módulo | jornadas: 75% dos trechos; rotinas: 6 frases |
| 04 Falar na prática | Speaking Lab só com frases, blocos e perguntas do módulo | 3 gravações |
| 05 Aplicar e conversar | perguntas (escrever ou falar), leitura, montar/escrever falas, transferência (falar de você) | todas as perguntas respondidas, leitura acertada, metade das falas (máx. 6 nas rotinas), 1 transferência |

- **Cadeados:** a etapa seguinte só abre quando a anterior está concluída; abrir ou visitar não conclui nada; link
  direto para uma etapa bloqueada volta ao módulo. “Acertou ao menos uma vez” = resposta que não foi erro; um erro
  depois não fecha a etapa de novo (volta na revisão). Etapa sem itens no módulo conta como concluída.
- Nada é armazenado à parte: a situação é recalculada dos cartões e gravações do perfil, por isso progresso antigo
  já aparece como etapas concluídas.
- **Sessão por etapa:** mesma fila, mesmos cartões, intervalos e XP; só entram o conteúdo e as habilidades da etapa
  (revisões vencidas primeiro). A sessão do dia não mudou.
- **Novo exercício (aditivo):** `sent:<id>:lis` — ouvir uma frase do módulo e escolher qual foi; o texto só aparece
  depois da resposta. Só é gerado na etapa “Ouvir e entender” de módulos sem trechos de diálogo.
- Palavras-chave/Expressões: inglês, classe, significado, áudio, exemplo do módulo com o item destacado, nota de uso e
  dica, situação (novo/aprendido/para revisar, pelos mesmos cartões), marcação (estrela, salva no perfil) e “Falar no
  exemplo” (Speaking Lab).
- Conversation Practice: títulos próprios — **CP01 First Steps: Meeting People** e **CP02 What I Think: Likes and
  Opinions** (IDs e conteúdo inalterados; progresso preservado).

## 3. Testes
- Unitários novos: `tests/unit/mvp.test.js` (perfis, migração, personas previstas, cadeados, sessões por etapa, ouvir).
- E2E novo: `tests/e2e/mvp.mjs` (M00–M13: migração no navegador, Início, navegação e cadeados, palavras, etapa
  concluída pela prática, ouvir sem texto, troca de persona, Conversation Practice separado, Speaking Lab do módulo,
  aplicação integrada e conclusão, XP/revisão, persona prevista, PWA offline, layout 412 px).
- Ajustados à nova regra (progresso por persona) os E2E de personagens e da jornada.

## 4. Limitações
- O XP ganho antes desta versão fica todo com o Lucas (não há registro de quanto foi ganho com cada personagem).
- Avatares são a inicial (as imagens dos seis estados continuam pendentes).
- “Falar na prática” conta gravações, não qualidade da pronúncia: o app não mede fonemas.
- Etapas de módulos longos do Lucas (R01: 45 expressões) pedem várias sessões.
- A troca de persona dentro de uma sessão não existe (de propósito): sair da sessão e trocar no Início.

## 5. Backlog (não essencial)
- Sessão de revisão só com os itens marcados (estrela).
- Conteúdo das personas Lucas (11 anos) e Heitor (pacotes no formato do da Karla) e a idade do Heitor no cadastro.
- Imagens das personas (seis estados).
- Ordem sugerida entre módulos (hoje todos abertos; só as etapas têm cadeado).
- Estatísticas (aba Progresso) por trilha com gráfico das etapas.
- Revisar critérios (80% / 6 frases / 3 gravações) com dados de uso real.
