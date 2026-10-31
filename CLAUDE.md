# CLAUDE.md — Daily Routine English (memória permanente)

Leia este arquivo e depois `HANDOFF.md` (estado atual e próximo passo) antes de qualquer trabalho.

## 1. Identidade do projeto

- **O que é:** app de estudo de **inglês britânico** a partir de rotinas e conversas do dia a dia. HTML5, CSS3 e
  JavaScript puro (sem framework), PWA instalável, 100% offline depois do primeiro acesso. Hospedado no GitHub Pages:
  https://lucas-marinho-fpa.github.io/daily-routine-english/ (branch `gh-pages`). Repositório:
  `Lucas-Marinho-FPA/daily-routine-english`.
- **Para quem:** o usuário (Lucas, adulto) e a família — cada um estuda com o conteúdo do seu personagem narrativo.
- **Objetivo educacional:** comunicação real — conseguir contar a própria rotina e participar de conversas sem ler
  um texto. Não é decorar frases.
- **Sem custos e sem servidores:** nenhuma API paga, nenhum serviço externo obrigatório, nenhuma gravação enviada a
  servidor. Política de segurança do HTML proíbe conexões externas.
- **Bora de Inglês** (`Lucas-Marinho-FPA/Bora_de_Ingles`) é **outro projeto/repositório**. Não modificar. O Daily
  Routine só reaproveita a convenção de nomes das imagens de personagens (`<dir>/<ESTADO>.png`, seis estados).
- **Abordagem:** MVP primeiro, mudanças incrementais sobre a arquitetura existente; melhorias não essenciais vão para
  backlog.

## 2. Metodologia pedagógica

- **Jornadas → módulos → cinco etapas** (`js/engine/modules.js`), sempre sobre o mesmo contexto do módulo:
  01 Palavras-chave · 02 Expressões práticas · 03 Ouvir e entender · 04 Falar na prática (Speaking Lab) ·
  05 Aplicar e conversar (perguntas, leitura, montar/escrever falas, produção livre “sem ler o texto”).
- **Cadeados:** uma etapa abre quando a anterior foi concluída. Concluir = acertar **ao menos uma vez** a maior parte
  (80% dos itens; 6 frases ouvidas nas rotinas ou 75% dos trechos nas jornadas; 3 gravações; perguntas respondidas).
  Visitar não conclui. Um erro depois não fecha a etapa (o item volta na revisão). Etapa sem itens conta como concluída.
  A situação é **calculada a partir dos cartões** (não há armazenamento à parte).
- **Aprendizagem cumulativa:** expressões de módulos anteriores voltam ligadas nos textos seguintes; revisão espaçada
  (Leitner, caixas 0–6) traz de volta o que foi errado ou está vencido.
- **Vocabulário contextualizado:** cada item aparece numa frase real do texto; phrasal verbs, collocations, conectivos e
  horários são categorias explícitas (`c`: phrasal, collocation, connector, time, word, verb…).
- **Gramática em contexto:** notas curtas ligadas ao texto (Present Simple, Present Perfect com “once”, possessivos,
  preposições, horários britânicos), nunca aulas isoladas.
- **Prática oral e produção independente:** Speaking Lab + pergunta aberta no fim de cada módulo.
- **Correção flexível** (`js/engine/checker.js`): resultado por classe — `correct` (inclui variantes equivalentes:
  contrações, BrE/AmE, números por extenso, sinônimos aceitos), `spelling` (erro de digitação próximo), `grammar`
  (regra conhecida violada), `meaning` (falta o essencial), `inconclusive` (o motor não sabe se a troca é válida;
  o aluno pode marcar “Eu estava certo”), `empty`. Na fala livre, **erro de reconhecimento** (transcrição duvidosa)
  é separado de **erro de inglês** e de **caso inconclusivo**.
- **Textos de referência não são inventados nem alterados sem autorização.** Conteúdo de apoio escrito pelo app
  (traduções, explicações, exemplos) é marcado como tal e não cria fatos novos sobre os personagens.
- Conteúdo de terceiros (ex.: Conversation Book) não é publicado sem licença verificável; o Conversation Practice
  publicado é original.

## 3. Personagens narrativos

São **protagonistas** dos conteúdos, não perfis de usuário. Não duplicar; não criar novos sistemas de seleção sem
autorização. Registro: `data/characters.js` (gerado de `dev/content/characters/*.json` + `dev/content/personas-planned.json`).

| id | Nome exibido | Situação | Conteúdo |
|---|---|---|---|
| `lucas` | Lucas (adulto) | ativo | `data/content.js` (rotinas R01–R10 do Word + episódios R11–R18, “Lucas 2.0”) — `docs/lucas-jornada.md` |
| `karla` | Karla | ativo (rótulo “em preparação” herdado) | 11 episódios K01–K11 — `docs/karla-jornada.md` |
| `lucas-kid` | **Lukinhas** (11 anos) | ativo na branch `mvp-jornadas` (no GitHub; ainda **não publicado** no Pages) | 10 sessões L01–L10 — `docs/lukinhas.md` |
| `heitor` | Heitor | previsto (sem conteúdo; idade não informada) | — |

- **Conversation Practice** (`cp`) é uma **jornada** independente (não personagem): CP01 “First Steps: Meeting People”,
  CP02 “What I Think: Likes and Opinions” — `docs/conversation-practice.md`.
- **Lukinhas:** id interno `lucas-kid`, nome de exibição Lukinhas; fonte `dev/content/characters/lucas-kid.json`, gerada
  por `dev/tools/lukinhas-source.mjs` (que confere os dez textos aprovados caractere por caractere); publicado em
  `data/characters.js`. Dias da semana dos treinos de jiu-jitsu **não informados** — não atribuir.
- **Pendência de produto (decisão do usuário):** foi dito que o produto não deve ter XP, pontuação, recompensas,
  seleção de personagens/avatares nem personagens como perfis. O código atual (MVP de jornadas, já publicado) **ainda
  tem** XP, níveis, sequência, conquistas e “Trocar personagem” com progresso por personagem. Não acrescentar nada
  disso; remover exige tarefa própria autorizada.

## 4. Arquitetura técnica (repositório = conteúdo publicado do app)

```
index.html            CSP sem conexões externas; carrega data/*.js e dist/app.js
manifest.webmanifest  id fixo "/daily-routine-english/index.html", standalone, ícones 192/512/maskable, 3 screenshots
sw.js                 service worker (GERADO por tools/build-app.mjs a partir de tools/sw.template.js)
install.html/.js      página de instalação (Chrome / Samsung Internet, QR em img/install-qr.svg)
css/app.css           estilos (azul-marinho #1d4e89 + laranja --orange; temas claro/escuro)
dist/app.js           bundle esbuild de js/ (o que o navegador executa)
data/content.js       conteúdo do Lucas (window.DRG_CONTENT)
data/characters.js    personagens + pacotes (Karla, Lukinhas) (window.DRG_CHARACTERS)
data/journeys.js      Conversation Practice (window.DRG_JOURNEYS)
data/audio-index.js   chaves de áudio embutido → duração (window.DRG_AUDIO)
data/lexicon.txt.gz   léxico para “é palavra do inglês?” (gerado a partir do conteúdo + lista base)
audio/*.ogg           clipes Kokoro (Opus) — chave = fnv1a do texto
asr/                  reconhecimento de fala local opcional (Moonshine tiny + onnxruntime-web, ~38 MB, sob demanda)
screenshots/          capturas do manifesto (fora do pré-cache)
docs/                 documentação por tema
js/main.js            boot, roteador por hash, App (estado, persona, jornada, layout)
js/engine/            regras puras (sem DOM)
js/ui/                telas
js/audio/, js/store/  áudio/gravação/ASR e persistência
```

- **Motor:** `scheduler.js` (cartões unidade:id:habilidade, Leitner, `unlockedNew`, `buildSession`, sessão por etapa
  com filtro), `exercises.js` (gera exercícios: mc, recall, cloze, order, write, seq, tell, retell, conv, listen, read,
  pairs, vb3 e **nat** — “mais natural”, só para itens com `plain`), `progress.js` (XP, dias, conquistas, migração de
  estado), `modules.js` (etapas e cadeados), `profiles.js` (progresso por perfil), `characters.js` (registro e visão
  de conteúdo por personagem), `journeys.js`, `checker.js`, `freeanswer.js`/`coherence.js`/`context.js`/
  `integrity.js`/`agreement.js`/`wordfeedback.js` (avaliação de fala), `lexicon.js`, `text.js`, `practice.js`,
  `retention.js`.
- **Telas:** `home.js` (Início), `modules.js` (lista de módulos, módulo com etapas, Palavras-chave/Expressões),
  `explore.js` (texto do módulo/rotina — nas sessões do Lukinhas com expressões tocáveis via `expression.js`),
  `session.js` (sessão de exercícios), `lab.js` + `recwidget.js` + `freeanswer.js` + `inlinewords.js` (Speaking Lab),
  `settings.js` (Ajustes, backup, seção Aplicativo), `pwa.js` (instalação e atualização), `review.js`, `stats.js`.
- **Persistência:** IndexedDB `drg` (stores `kv` → `state`, `recordings`, `audio`); localStorage só de reserva.
  Estado **esquema 2**: `profiles` por personagem (`lucas`, `karla`, `lucas-kid`, `heitor`) e por jornada
  (`journey:cp`); o perfil ativo fica no topo do estado em execução. Esquema 1 é migrado sem perdas (cópia em
  `state.prev`). Backup exporta/importa JSON (Ajustes). Gravações: áudio apagado após 7 dias, texto mantido.

## 5. Speaking Lab (aprendizados)

- Gravação local (MediaRecorder); reconhecimento local opcional (Moonshine tiny, ~38 MB, baixado com consentimento,
  cache próprio `asr-local-…`); sem ele há gravação e comparação A/B, mas não transcrição.
- **Leitura em voz alta:** comparação palavra a palavra com a frase-alvo (`wordfeedback.js`): verde = reconhecido,
  âmbar = possível erro (reconhecimento ou pronúncia — o app não sabe qual), cinza = não avaliado (fala possivelmente
  cortada, confiança baixa, sem ASR). Normalização: contrações, BrE/AmE, números e horários (“five thirty” ↔ “5:30”),
  compostos, inserções/omissões sem deslocar destaques.
- **Resposta livre:** quatro dimensões separadas — **1. adequação** (relação com a pergunta e o elemento pedido),
  **2. gramática e naturalidade**, **3. confiabilidade da transcrição** (integridade, hipóteses contextuais de erro do
  reconhecedor rotuladas como sugestão, nunca certeza), **4. ritmo e pausas** (só o que foi medido).
- **Limitações:** a transcrição **não comprova pronúncia**; não há alinhamento acústico por palavra nem avaliação
  fonética; o reconhecedor corta textos longos (limite de tokens) — por isso a verificação de integridade.

## 6. PWA e offline

- Service worker: pré-cache de todos os arquivos (exceto `js/`, `asr/`, `screenshots/`) num cache `drg-<VERSION>`
  (VERSION = hash dos arquivos), “cache primeiro”, respostas parciais (Range) para áudio.
- **Atualização controlada:** a versão nova baixa tudo e **espera**; o app mostra “Nova versão disponível” (nunca
  durante uma sessão); só com “Atualizar agora” (ou fechando o app por completo) ela assume; o cache antigo só é
  apagado depois que o app abriu na versão nova (mensagem `CLEANUP`); download com falha descarta o cache incompleto.
  Verificação ao abrir e ao voltar ao app (no máximo a cada 15 min). Cache do reconhecimento nunca é apagado.
- Instalação: botão “Instalar aplicativo” só com `beforeinstallprompt` (Chrome); senão, instruções pelo menu
  (Chrome / Samsung Internet); nada aparece quando aberto como app. Página `install.html` com QR.
- **Tamanho offline:** ~11,8 MB antes do Lukinhas → **~14,5 MB** com o Lukinhas (não publicado ainda); +~38 MB se o
  reconhecimento de fala for instalado.
- Testes: `tests/e2e/pwa.mjs` (instalabilidade, atualização aceita/adiada/falha/recuperação, offline, página de
  instalação). Detalhes: `docs/pwa-instalacao.md`.

## 7. Fontes, ferramentas e testes — pasta `dev/` (branch `mvp-jornadas`)

A raiz do repositório é o app publicado. Conteúdo-fonte, geradores, build, testes, fixtures, fontes do reconhecimento
de fala e evidências ficam em **`dev/`** (ver `dev/README.md`). Para trabalhar: `bash dev/setup-workdir.sh ../drg-work`
monta uma cópia de trabalho (`app/` = raiz do repositório; `content/`, `tools/`, `tests/`, `vendor/` = `dev/`); depois
`npm ci`, `npm test`, `node tools/build-app.mjs`. Arquivos gerados em `drg-work/app/` voltam para a raiz do repositório.
Fora do repositório de propósito: `privacy_sanitize.py` (contém os nomes privados que remove), o texto do
Conversation Book (sem licença), o Word original do usuário, o modelo Kokoro e `node_modules/`.
- Build: `node tools/build-app.mjs` (roda build de conteúdo, personagens e jornadas; gera `dist/`, `data/`, `sw.js`).
- Áudio: `tools/gen_audio.py <kokoro.onnx> <voices.bin>` (Kokoro offline; Lukinhas usa a voz `bm_lewis`).
- Testes: `npm test` (unitários, `node --test`); E2E Chromium: `node tests/e2e/<suíte>.mjs <site> <base> <evidências>`
  — `run.mjs`, `run-pages.mjs`, `asr-local.mjs`, `storage.mjs`, `wordpractice.mjs`, `characters.mjs`, `journey.mjs`,
  `mvp.mjs`, `pwa.mjs`, `lukinhas.mjs`. Rodar as suítes **em sequência** (rodar em paralelo já corrompeu resultados).
  A simulação do Pages usa `../site/daily-routine-english` (ou `DRG_PAGES_SITE`).

## 8. Regras permanentes

- Não reconstruir o app nem refatorar módulos que funcionam sem justificativa; preferir mudanças pequenas e aditivas.
- Preservar personagens, conteúdos, progresso e funcionalidades existentes; conferir que Lucas/Karla não mudaram.
- Não alterar conteúdo aprovado nem inventar textos/fatos sem autorização.
- MVP primeiro; o resto vai para backlog.
- Não inventar resultados de testes; não reduzir cobertura; não mudar critério pedagógico para passar teste.
- **Não publicar** (push para `gh-pages`, deploy) **sem autorização explícita**; não alterar `main` nem
  `cp-publicacao` sem autorização; **nunca** force push nem reescrita de histórico; preservar autoria dos commits
  (identidade: `Lucas-Marinho-FPA <294024809+Lucas-Marinho-FPA@users.noreply.github.com>`).
- **Nunca enviar a `main` local**: ela contém o commit `c0cb6c8` (material do Conversation Book sem licença).
- Nunca publicar nomes do empregador, da agência ou de unidades de atendimento do usuário (dados privados).
- Não modificar outros repositórios (Bora de Inglês).
- Nomes privados (empregador, agência, unidade) nunca em texto claro no repositório: os padrões de proteção nos builds
  e testes estão codificados em base64 de propósito.
- **Nenhuma sessão de desenvolvimento pode ser considerada encerrada enquanto existirem alterações, commits ou arquivos
  importantes exclusivamente num ambiente temporário, sem preservação ou transferência documentada** (o container
  destas sessões é efêmero: commitar e enviar a branch de desenvolvimento — nunca a produção sem autorização).

## 9. Marcos

| Commit | Marco |
|---|---|
| `90689e8` | Avaliação oral em camadas (integridade, coerência, cores por evidência) |
| `482ec74` · `4d9677e` · `35bd2fb` | Personagens; escolha de personagem; jornada da Karla (K01–K11) |
| `13de9d2` | Lucas 2.0 (episódios R11–R18) — atual `main` remota |
| `8cb37c9` · `b582c29` | Conversation Practice original (CP01–CP02), publicado sem o histórico do livro |
| `aa9c8f8` | Speaking Lab: hipóteses contextuais de erro de reconhecimento + concordância |
| `0719ac7` | MVP de jornadas: progresso por perfil (esquema 2), módulos com 5 etapas e cadeados |
| `6a0c5b6` | PWA: atualização controlada, instalação, página com QR — **versão publicada** |
| `523db11` · `1181ea5` | Lukinhas (10 sessões) + correção do “null” nas páginas de texto — na branch remota `mvp-jornadas`, **não publicados** |
| `be86c74` · `0d096ad` | Preservação: `dev/` (fontes, ferramentas, testes), `CLAUDE.md`, `HANDOFF.md` — `mvp-jornadas` no GitHub desde 2026-10-31 |
