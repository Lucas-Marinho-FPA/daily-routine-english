# HANDOFF — estado consolidado (2026-11-13)

Ponto de continuidade entre sessões e de auditoria (governança: `CLAUDE.md` e
`docs/governanca/PAPEIS_E_RESPONSABILIDADES.md`). Este arquivo foi **reescrito como estado consolidado** por pedido do
Product Owner em 2026-11-13. O conteúdo anterior completo (registros por entrega desde 2026-10-30) continua no Git:
`git show 46b7d97:HANDOFF.md`. Estados abaixo foram verificados na data; confirme no Git antes de agir.

## 0. Contexto do projeto (para quem chega agora)

Daily Routine English é um PWA estático (GitHub Pages) para estudar inglês britânico pela rotina, offline, sem XP ou
gamificação nova. Jornadas: Daily Routine (Lucas, Karla, Lukinhas, Heitor), Conversation Practice (CP01–CP02), Curso
(texto importado no aparelho, nunca versionado) e **Diálogos — The Story of John** (7 partes, 46 atividades). Papéis:
PO decide; ChatGPT planeja e audita; Claude executa e registra no Git; a Base de Conhecimento (privada, fora deste
repositório) responde pelo conteúdo pedagógico. Referência técnica geral: `docs/aplicativo-referencia.md`; pacote de
produto: `docs/produto/` (checklist mestre `03_…`, arquitetura pedagógica `04_…`, decisões `11_…`); diálogos:
`docs/dialogos.md` e `docs/produto/mvp-dialogo/`.

## 1. Estado do Git e da publicação

| Item | Valor |
|---|---|
| Branch de trabalho | `claude/daily-routine-governance-y9rr0b` |
| Commit das correções (2A) | `7cf3a3c` (“fix: e01 real-device validation…”, 13/11/2026); este registro de publicação é o commit seguinte, só de documentação |
| `origin/gh-pages` (publicado) | `7cf3a3c` — build **`1f0474b1cbd8`**, workflow “pages build and deployment” nº 37 com sucesso; `sw.js`, `dist/app.js`, `data/*.js`, `index.html`, `css/app.css` e `js/engine/textdiff.js` servidos idênticos ao commit; site real: só a e01 listada, U31 “sounds interesting — Parece interessante.”, U05 “I met someone.”. Depois, `gh-pages` avança para o commit de documentação (mesmo build). Antes: `69025de` — build `dcaac9a1ecf7`, https://lucas-marinho-fpa.github.io/daily-routine-english/ (fast-forward de `46b7d97` autorizado pelo PO em 13/11; workflow “pages build and deployment” nº 36 com sucesso; `sw.js`, `dist/app.js`, `data/*.js` e `index.html` servidos idênticos ao commit) |
| O que está publicado | a e01 em sete etapas, só ela ativa; as outras 45 atividades preservadas fora da navegação |
| **Correções da validação real (seção 2A)** | **publicadas em 13/11** (`7cf3a3c`, build `1f0474b1cbd8`), com autorização do PO condicionada aos testes, todos aprovados no build reproduzido do zero |
| **Reticências no TTS + faixa de números (seção 2B, 14/11)** | commit logo acima de `72908ec` (“feat: TTS ellipses…”), build `c3c3a4d174ca`; commit, push e publicação **autorizados expressamente pelo PO em 14/11**. Resultado do deploy: registrado no commit seguinte, só de documentação |
| Registro histórico | antes de 13/11 (tarde), `gh-pages` estava em `46b7d97` (build `583fa58264f1`) e a e01 em sete etapas não estava publicada |

Regras: commit/push só com autorização; nunca force push; nunca publicar sem autorização; não usar `main` como origem
(pode conter `c0cb6c8`, material sem licença). Identidade dos commits: `Lucas-Marinho-FPA <294024809+Lucas-Marinho-FPA@users.noreply.github.com>`.

## 2B. Reticências no áudio e faixa horizontal de números (14/11/2026 — commit e publicação autorizados pelo PO)

Pedido do PO depois dos experimentos de qualidade do Kokoro (pacote de amostras entregue no chat em 14/11).

- **Escopo do áudio (decidido pelo PO):** Daily Routine (Lucas, Karla, Lukinhas) + The Story of John; Conversation
  Practice fora (nenhuma chave compartilhada).
- **Como:** `dev/content/tts/tts-prep.json` (95 frases: texto original → texto para o TTS com reticências). A **chave do
  áudio continua a do texto original** (IDs, referências e impressões digitais de Lucas/Karla intactos); só o arquivo é
  regenerado. `tools/gen_audio.py` aplica a preparação e registra em `dev/content/build/tts-ledger.json` (chave → texto,
  texto falado, voz); arquivo cujo texto falado mudou é regenerado (também se a preparação for desfeita).
- **Critério:** trechos de 10+ palavras, fronteira entre orações/blocos verbais (antes de while/until/because/before/
  hoping… ou do “and” que liga orações/verbos); nunca ao lado de pontuação, dentro de sujeito composto, phrasal verb,
  horário ou coordenação de substantivos. Proposta por regra (109) e revisada frase a frase (14 descartadas, 11
  corrigidas) → 95. Vírgulas e palavras idênticas ao original (teste). Sem silêncio fixo, sem mudar velocidade nem vozes.
- **U26:** o silêncio fixo de 1 s (13/11) saiu; áudio “help someone... help a team” (nova chave `c4ab4f3d`; `45b61163` removido).
- **Números:** 609 frases candidatas (8+ palavras) avaliadas; **95 áudios regenerados** (58 Lucas/Karla bf_emma, 35
  Lukinhas bm_lewis, 1 John bm_george, 1 narrador bm_fable) + 1 novo (U26) − 1 removido; 2.244 arquivos; alterados =
  exatamente as 95 chaves do registro; nenhum da Conversation Practice. Originais preservados no Git (`72908ec`).
- **Verificação objetiva (não substitui a escuta):** transcrição pelo Moonshine antes × depois: média 96,0% × 95,8%
  (9 melhores, 9 piores — quase tudo formatação como “9:30pm”); palavras a mais/trocadas 61 → 44; pausas criadas pelas
  reticências: mediana 410 ms, máx. 720 ms; duração +3% (mediana). **U26:** as reticências não abriram pausa clara entre as
  duas partes e o reconhecedor ouviu “help someone **to** help a team” → escuta humana.
- **Faixa de números (slider):** os chips numerados das etapas (e01: 1–6, 7.2, 7.3; e o ditado clássico) viraram uma
  **faixa horizontal de uma linha** (padrão `.chips.scroll` do Curso/Lab): desliza com o dedo, toque seleciona e só o
  conteúdo da etapa é redesenhado (mesma rota), o número selecionado vai para o centro com rolagem suave, a posição da
  faixa é guardada por etapa e restaurada a cada redesenho; bordas com esmaecimento. `js/ui/dialogue.js` (`itemChips`),
  `css/app.css` (`.num-strip`, `.dlg-strip`).
- **Testes:** unitários 287 ok / 1 ignorado (+3 em `tts-prep.test.js`); `dialogue-layers` 21/21 (L21 novo: uma linha,
  arraste real por eventos de toque, toque no 20 centralizado, posição mantida, último número, sem troca de tela);
  `audio-layers` 61/61 (avisos antigos: “work for”, “didn't we?”); `dialogue` 14/14; `speech-online` 13/13; `speech-mode`
  9/9; `speech-hybrid` 16/16; `pwa` 14/14; `theme` 10/10. Build `c3c3a4d174ca` reproduzido do zero: idêntico. Não
  repetidos: jornadas/Lukinhas/Curso (conteúdo e chaves inalterados; só o som de 95 arquivos mudou, coberto pelos
  unitários de integridade e pela comparação antes × depois).

## 2A. Correções da validação real no Galaxy S25+ (13/11/2026)

Pedido do PO após usar a e01 publicada no aparelho. Tudo nas fontes + build oficial (reproduzido do zero num workdir
novo: `dist/app.js`, `sw.js`, `data/*.js`, `index.html` e manifesto idênticos). Commit/publicação autorizados pelo PO.

| Problema (aparelho) | Causa | Correção |
|---|---|---|
| **Progressão bloqueada:** 31 de 32 unidades feitas, uma não reconhecida; “próximo” voltava sempre a ela | Etapa só concluía com **todos** os itens aprovados (`phaseStatuses`) e `nextItem` devolvia sempre o 1º não aprovado. Reproduzido contra o motor de `69025de`: 31/32 + U05 com 10 tentativas → etapa 2 `needs_retry`, etapa 3 `locked`, próximo = U05 | Etapas 1–6 e leitura 7.2 do formato em camadas: até **3 tentativas**; depois, **“Continuar sem concluir”** (item **pendente para revisão**, nunca acerto; pode refazer quando quiser); “próximo item” e a retomada **não voltam** ao pendente; etapa aprovada com **aproveitamento ≥ 80%** dos itens efetivamente avaliados (9/10 com 1 pendente = 90%, aprova). Distingue **erro de resposta** (conta) de **falha do reconhecedor** (fica fora da conta, sem penalizar) e de **não concluído**. Etapa aprovada continua aprovada. Atividades clássicas (inativas) e 7.1/7.3 sem mudança |
| U31 mostrava “sound + adjective” / “parecer + adjetivo” | O padrão do documento era o conteúdo principal | U31 = **“sounds interesting” — “Parece interessante.”**; “sound + adjective (parecer + adjetivo)” como complemento. Mesma regra para U18 (“I'm a project analyst.” — “Sou analista de projetos.”) e U30 (“That sounds interesting.” — “Isso parece interessante.”): eram padrões em primeiro plano; traduções = as do próprio documento (F07, F10). Texto literal do documento guardado em `original` |
| Escrita “saund” × “sound” só com descrição textual | O feedback listava “Ortografia/Faltou/A mais” | Marcação no próprio texto (`js/engine/textdiff.js`): “Você escreveu” com **só o trecho errado em vermelho** → “Correto” com **só o trecho que corrige em verde**; palavra a mais riscada, palavra que faltou sublinhada; maiúsculas/pontuação não marcadas. Etapas 1, 3, 4 e 6 |
| Feedback repetitivo | Significado repetido, listas duplicando a marcação | Ordem: o que escreveu → correto → nota curta só se acrescenta (ordem das palavras); “Tentativa n de 3”; quadro de aproveitamento só quando há pendente ou a etapa terminou |
| U05 “meet → met” ouvido como “meet Matt”; áudio sem pausa | Duas palavras curtas e próximas no mesmo exercício | U05 = **“I met someone.” — “Conheci/encontrei alguém.”**, separado de U04 “meet someone”; nota “meet → met”. “met someone” (sem sujeito) foi testado e descartado: Moonshine correto em 2 de 4 vozes (“To match someone.”), contra 4 de 4 com “I met someone.” (áudio sintético) |
| Pausas | — | Sem setas restantes. U26 (“help someone / help a team”, elementos separados) gravado com **pausa de 1,0 s** (medida 1,14 s); demais frases sem pausa artificial |

- **Arquivos:** `js/engine/dialogue.js`, `js/engine/textdiff.js` (novo), `js/ui/dialogue.js`, `css/app.css`,
  `dev/content/dialogues/john-p1-e01-layers.json`, `dev/tools/build-dialogues.mjs` (campos `note`/`original`; áudio com
  pausa para “/”/“→”), `dev/tools/gen_audio.py` (“ | ” = pausa), testes `dev/tests/unit/dialogue-layers.test.js` e
  `dev/tests/e2e/dialogue-layers.mjs`; gerados `dist/app.js`, `sw.js`, `data/dialogues.js`, `data/audio-index.js`,
  `dev/content/build/dialogues-audio-manifest.json`; áudios novos `audio/32c7ed10.ogg` (“I met someone.”) e
  `audio/45b61163.ogg` (U26 com pausa); removidos os 2 órfãos `e38ebf3c` (“meet, met”) e `4410beef` (U26 sem pausa),
  criados em `69025de` e sem referência. Índice de áudio: 2.244, idêntico ao publicado salvo essas duas trocas.
- **Correção de artefato de desenvolvimento:** `dev/content/build/audio-durations.json` não tinha as 44 durações geradas em
  `69025de` (estavam só no índice); sem elas o `gen_audio.py` apagaria essas entradas do índice. Completado com os
  valores do índice publicado (0 conflitos).
- **Testes:** unitários **284 ok / 1 ignorado / 0 falhas** (+10); `dialogue-layers` **20/20** (L16–L20 novos; L04/L11/L13
  atualizados para o conteúdo novo); `audio-layers` 61/61 (avisos de reconhecimento em unidades curtas: “work for”,
  “didn't we?” — antes já registrados — e “I met someone.” sem aviso); `dialogue` 14/14 (código compartilhado);
  `speech-online` 13/13; `speech-mode` 9/9 (microfone = áudio da U22, como a asserção exige); `speech-hybrid` 16/16;
  `pwa` 14/14. Não repetidos: `voice` e `endpoint` (dependem de ~18 MB de gravações de diagnóstico fora do repositório;
  testam `evaluateRecording`/detecção de fim, que não mudaram). Build reproduzível: saídas idênticas a partir das fontes.
- **Escolha técnica (DEC-023), incluída pelo PO nos critérios de finalização de 13/11:** item só com falha do reconhecedor fica fora da conta, mas a etapa
  exige que **≥ 80% dos itens tenham sido avaliados** (sem evidência, não decide). Ex.: 25 frases, 15 aprovadas e 10 só
  com falha técnica → 100% dos avaliados, mas cobertura 60% → não aprova; a tela orienta refazer os pendentes ou trocar o
  modo em Ajustes → Áudio. Tentar de novo depois de 3 tentativas continua possível (as 3 abrem a opção de seguir; não
  proíbem novas tentativas).

## 2. O que foi feito nesta etapa (publicado em `69025de`)

### 2.1 john-p1-e01 em sete etapas (documento-fonte aprovado em 2026-11-13)
- **Especificação:** `docs/produto/mvp-dialogo/10_DOCUMENTO_FONTE_PEDAGOGICO_JOHN_P1_E01.md` (cópia literal).
  Referência técnica: `docs/dialogos.md` → “Formato em camadas”. Decisões: `docs/produto/11_…` DEC-021/DEC-022.
- **Etapas:** 1 escrever unidades (EN + PT) · 2 ouvir 3× e falar unidades · 3 ouvir e escrever unidades (embaralhado,
  inglês oculto) · 4–6 o mesmo com frases · 7.1 escuta global + 10 questões · 7.2 escuta acompanhada, leitura e
  produção oral · 7.3 tradução · fechamento por etapa. Sequência linear; critérios vigentes (≥ 80% por item, 8/10).
- **Conteúdo:** 32 unidades U01–U32 e 25 frases F01–F25 (F11–F25 = expansões, nunca falas de personagem), extraídas
  por script do documento para `dev/content/dialogues/john-p1-e01-layers.json` (com linha de origem). As 7 falas, os 8
  itens originais e as 10 questões continuam.
- **Só a e01 ativa:** `dev/content/dialogues/rollout.json` → `pack.active`. As outras 45 atividades ficam fora da
  lista, do Início e do acesso direto, com dados, áudio, questões e progresso intactos (comparação do pacote: as 45
  idênticas ao `46b7d97`; e01 só com campos novos; 183 itens antigos e 403 questões idênticos).
- **Arquivos de código:** `dev/tools/build-dialogues.mjs` (camadas, rollout, forma falada), `js/engine/dialogue.js`
  (`LAYER_PHASES`, pré-requisitos, `isActive`, `canSpeakItem(p, id, fase)`), `js/engine/dialogueeval.js` e
  `js/engine/wordfeedback.js` (opções de confiabilidade, desligadas por padrão), `js/ui/dialogue.js` (telas: `writePhase`,
  `speakPhase`, comparação da tradução), `css/app.css` (`.vx-*`), `js/audio/speech.js` (marca de texto parcial).
  Gerados: `dist/app.js`, `sw.js`, `data/dialogues.js`, `data/audio-index.js`, `dev/content/build/dialogues-audio-manifest.json`.

### 2.2 Áudio
- **Vozes (verificado):** Rick `bm_lewis`, John `bm_george` nas 7 falas — tom mediano 96 Hz × 146 Hz, faixas sem
  sobreposição (≈ 7 semitons): personagens distinguíveis e consistentes. Unidades e frases: voz padrão `bf_emma`
  (expansões nunca na voz de personagem). Etapa 7 toca as falas com as vozes dos personagens.
- **Forma falada separada da notação:** “…”, “/”, “→”, “+” nunca são verbalizados. U18 “I'm a…” → “I'm a project
  analyst.”, U30 “That sounds…” → “That sounds interesting.”, U31 “sound + adjective” → “sounds interesting” (realização
  da fala de referência indicada no documento: falas 6/7); U05 → “meet, met”; U26 → “help someone, help a team”.
- **Arquivos:** 54 chaves de unidades/frases — 10 reaproveitam arquivos já existentes em `46b7d97`, 44 foram geradas
  nesta fase com o Kokoro local (`dev/tools/gen_audio.py`, voz `bf_emma`) — + 7 falas. 2.244 áudios no repositório
  (+44 em relação a `46b7d97`). Dois arquivos órfãos gerados nesta fase e nunca commitados foram removidos.
- **Validação objetiva (`dev/tests/e2e/audio-layers.mjs`, 61/61):** formato Opus mono, duração, volume, sem saturação,
  fim em silêncio (sem corte), voz correta e transcrição pelo Moonshine do app. Avisos: “didn't we?” e “work for”
  isolados são mal transcritos pelo reconhecedor com qualquer voz, mas dentro de contexto saem exatos (“We met at
  university, didn't we?”, “Work for a company.”) → áudio correto, não regenerado. **Naturalidade (voz robótica ou não)
  não foi avaliada por ouvido humano.**

### 2.3 Reconhecimento de fala e confiabilidade
- **Modo online:** `SpeechRecognition` do navegador, `en-GB`, sem `processLocally` (no Chrome, o serviço do Google — o
  melhor disponível na arquitetura aprovada, sem custo para o app), dono exclusivo do microfone. **Modo Moonshine:**
  gravação + Moonshine local. Sem troca automática. Nenhum serviço novo.
- **Regras (sem evidência, não decide; nunca culpa o aluno por falha do sistema):** confiança online < 0,5 →
  inconclusivo; transcrição vazia/falha → inconclusivo, pode repetir sem penalidade; texto online parcial ou corte do
  reconhecedor → palavras finais não avaliadas e nunca aprova a frase inteira; Moonshine (não informa confiança) em alvo
  de 1–2 palavras → divergência = “não consegui avaliar”; em alvos de até 3 palavras as átonas são avaliadas (“work with”
  não aprova “work for”) e o alvo dentro de fala maior fica inconclusivo; erro real → trecho marcado, “Palavras a
  praticar” e orientação de nova tentativa.
- **Tradução 7.3:** sem avaliador semântico (serviço online não configurado): depois de enviar, o aluno compara com a
  referência autoral e registra “O sentido confere”/“Vou revisar”; nada é aprovado (“Pendente de avaliação · não conta
  como aprovada”); depois de ver a referência, enviar texto igual a ela não aprova.

### 2.4 Documentação desta fase
`docs/dialogos.md`, `docs/produto/03_ROADMAP_E_CHECKLIST_MESTRE.md` (entregas de 12–13/11), `docs/produto/04_ARQUITETURA_PEDAGOGICA.md`
(formato em sete etapas), `docs/produto/11_HISTORICO_DE_DECISOES_E_PENDENCIAS.md` (DEC-020…022),
`docs/produto/mvp-dialogo/00_LEIA-ME_E_ORDEM_DE_LEITURA.md`, `09_REORGANIZACAO_EM_QUATRO_ETAPAS_ANALISE.md` (análise
das quatro etapas, decisões D1–D8), `10_DOCUMENTO_FONTE_…`, `docs/conteudo-dialogos/` (extração completa do conteúdo de
diálogos + gerador `dev/tools/extract-dialogue-content.mjs`), evidências em `dev/evidence/john-p1-e01-*.png`.

## 3. Testes (ambiente simulado: Chromium headless, microfone falso; reconhecimento online simulado)

| Suíte | Resultado | Observação |
|---|---|---|
| Unitários (`npm test`) | 274 ok / 1 ignorado | +11 em `dev/tests/unit/dialogue-layers.test.js` (camadas, matriz de confiabilidade nas 57 unidades/frases, forma falada) |
| `dialogue-layers.mjs` (novo) | 15/15 | navegação/rollout, conteúdo, 7 etapas, bloqueio de 3 escutas (interrompida não conta), retomada, notação × fala, feedback acerto/erro/inconclusivo, Moonshine curto, parcial, tradução |
| `audio-layers.mjs` (novo) | 61/61 (2 avisos) | ver 2.2 |
| `dialogue.mjs` | 14/14 | cinco fases preservadas (e01 em formato clássico só no teste) |
| `voice.mjs` | 5/5 | Moonshine real na etapa 2 |
| `endpoint` 9/9 · `speech-mode` 9/9 · `speech-online` 13/13 · `speech-hybrid` 16/16 · `pwa` 14/14 · `theme` 10/10 | aprovados | suítes de voz apontadas para a etapa 2 (U22 “different teams”, mesmo áudio do antigo v05) |

Build `dcaac9a1ecf7`: código, build e site testado idênticos. Testes de rodadas anteriores (jornadas, Lukinhas, Curso,
storage, asr-local, run-pages, wordpractice, coursepractice) não foram repetidos: não tocam o que mudou.

## 4. Validado × pendente × não testado em aparelho

| Situação | Itens |
|---|---|
| **Validado (automatizado, simulado)** | sete etapas e progressão; bloqueio de 3 escutas; retomada; integridade do conteúdo; preservação das 45 atividades; vozes e arquivos de áudio; regras de confiabilidade; tradução honesta; offline (PWA) |
| **Pendente de decisão do PO / curadoria** | formas faladas (U05, U18, U26, U30, U31); regras técnicas DEC-022; decisões D1–D8 da análise das quatro etapas (D3 = avaliação da tradução); Base: D-003, D-005, D-006 |
| **Não testado em aparelho físico (Galaxy S25+)** | correções da seção 2A (3 tentativas/continuar/pendente/aproveitamento, marcação da escrita, U05/U18/U30/U31, U26 com pausa); toda a e01 em sete etapas; reconhecimento real nos dois modos (em especial unidades curtas no Moonshine); naturalidade dos áudios por ouvido humano; vocabulário remodelado e marcação por trecho publicados em `46b7d97`; correção do reconhecimento online publicada em `1635b92` |

## 5. Limitações conhecidas
1. Transcrição não é avaliação fonética.
2. Moonshine em alvos de 1–2 palavras: pode nunca aprovar se errar sempre a fala do aluno. **Desde 2A** isso não trava
   mais a etapa (3 tentativas → continuar; falha técnica fora da conta), mas o item fica pendente; precisa de teste no aparelho.
3. Tradução sem avaliação automática enquanto não houver serviço semântico (D3): a etapa 7.3 e a atividade ficam
   “aguardando avaliação”.
4. Modo online sem áudio da própria voz (o microfone é do reconhecimento).
5. Progresso antigo da e01 (fases 1–2 clássicas) guardado sem crédito nas etapas novas; 7.x reaproveita compreensão,
   leitura e tradução já feitas.
6. `dev/content/dialogues/john*.json` versionados estão uma correção atrás dos regenerados pelo build (sem efeito no app).
7. Traduções autorais e as 403 questões não validadas pelo professor.

## 6. Decisões do Product Owner pendentes
- ~~Autorizar a publicação da e01~~ — publicada em 13/11 (`gh-pages` `69025de`).
- ~~Autorizar commit, push e publicação das correções da seção 2A~~ — autorizados em 13/11 (resultado no registro do deploy).
- Confirmar no aparelho as escolhas de DEC-023 (aproveitamento com cobertura mínima; U05/U18/U30/U31; pausa em U26).
- Validar DEC-022 e as formas faladas; decidir D1–D8 (`09_…ANALISE.md`), em especial D3 (avaliação da tradução: serviço
  online com possível custo ou curadoria de unidades de significado pela Base).
- Liberar as próximas atividades de John (uma por vez) após validar a e01 no aparelho.
- Anteriores, ainda abertas: onde a Base de Conhecimento será mantida e o acesso dos agentes; relação da Base
  Pedagógica (`base-pedagogica`) com a Base de Conhecimento; `main` desatualizada; proteções automatizadas contra
  versionar o acervo privado; itens P-001…P-013 de `docs/produto/11_…`.

## 7. Demandas para a Base de Conhecimento

| ID | Demanda | Contrato | Situação |
|---|---|---|---|
| D-001 | Gerar os arquivos de estudo das quatro partes do conjunto atual de atividades do curso, com títulos neutros e blocos literais. **Os códigos do conjunto e das partes são atribuídos pela governança da Base** (nenhum foi atribuído até 2026-11-11); de-para e origem só na Base; arquivos fora do repositório | `docs/curso-atividades.md` (seção vigente, formato 1), commit `90b54b6` | Contrato entregue em 2026-11-11; aguardando atribuição de códigos e os arquivos |
| D-002 | Registrar na governança da Base que o de-para, a origem e a validação do professor das atividades do curso ficam só na Base (controle editorial externo; o app não exige validação) | `docs/governanca/PAPEIS_E_RESPONSABILIDADES.md`, seção 6 | Aberta |
| D-003 | Validar (ou substituir) as questões de compreensão de *The Story of John*: 403 questões elaboradas pela IA só a partir do texto dos diálogos, **não validadas pelo professor** | `dev/content/dialogues/john-questions.src.txt` | Aberta |
| D-004 | Vocabulário: 15 diálogos sem itens próprios nos documentos; 89 itens de tabelas sem fala correspondente | `dev/content/dialogues/john-report.json` | Aberta |
| D-005 | Diálogos em etapas: curadoria do inventário linguístico completo de cada diálogo (a e01 já tem o seu, aprovado em 2026-11-13) e, se escolhida a correção local da tradução (D3-b), unidades de significado e variantes aceitas por fala | `09_…ANALISE.md`; formato `*-layers.json` | Aguarda decisão do PO |
| D-006 | Validar as 6 falas corrigidas por decisão do PO de 2026-11-11 (o app usa o texto corrigido; `correction` guarda o original) | `john-corrections.json` | Aberta |
| D-008 | Áudio: curadoria das reticências do TTS (`dev/content/tts/tts-prep.json`, 95 frases) — confirmar os pontos de separação escolhidos pelo executor | `tts-prep.json` | Aberta |
| D-007 | e01: registrar na curadoria as unidades apresentadas como expressão real por decisão do PO de 2026-11-13 (U05 “I met someone.”, U18, U30, U31; original em `original`) e avaliar os demais padrões com “…” (U02 “Do you remember…?”, U09, U16, U27), hoje falados como pergunta/expressão curta natural, sem mudança | `john-p1-e01-layers.json` (`note`, `original`, `change`) | Aberta |

## 8. Instruções para o próximo chat
1. Ler `CLAUDE.md`, este arquivo e, conforme a tarefa, `docs/dialogos.md`, `docs/produto/03_…` e `docs/produto/11_…`.
   Conferir `git fetch`, `git status`, `git log --oneline -5` e o remoto (`git ls-remote origin
   claude/daily-routine-governance-y9rr0b gh-pages`): ambos em `69025de` em 13/11 (as correções da seção 2A podem estar
   commitadas depois disso, se o PO autorizar; confira).
2. Workdir de build/testes: `bash dev/setup-workdir.sh ../drg-work` (detalhes em `dev/README.md`); copiar `js/`, `css/`,
   `dev/tools/`, `dev/content/` e `dev/tests/` para o workdir, rodar `node tools/build-app.mjs` e copiar de volta
   `dist/app.js`, `sw.js`, `data/*.js`, `audio/` novos. Áudio: `kokoro-onnx` + modelo Kokoro (fora do repositório).
   Atenção: copie também `dev/content/build/audio-durations.json` de volta — o `gen_audio.py` reescreve o índice a partir
   dele. No contêiner da nuvem, use o Playwright pré-instalado (o do `npm ci` não acha o Chromium).
3. Testes da e01: `node tests/e2e/dialogue-layers.mjs <site> /daily-routine-english/` e `tests/e2e/audio-layers.mjs`;
   unitários `npm test`. Não repetir suítes aprovadas sem motivo técnico.
4. **Próximo passo:** nova rodada de validação no Galaxy S25+ com as correções publicadas (roteiro abaixo; no aparelho,
   fechar e reabrir o app até o build `1f0474b1cbd8`); depois, decisões de DEC-022, DEC-023 e D1–D8. Depois: remodelar a próxima atividade de
   John, uma por vez, no mesmo formato (`*-layers.json` + `rollout.json`).
5. Roteiro do aparelho: (a) Ajustes → Áudio, modo Online, “Testar reconhecimento”; (b) e01 etapas 1→7 completas;
   (c) etapa 2 com “work for”, “didn't we?”, “but”, “I met someone.” e “I'm a project analyst.” nos dois modos;
   (d) num item que não reconhece: 3 tentativas → “Continuar sem concluir” → seguir sem voltar a ele → aproveitamento ao
   final; (e) escrever com um erro de letra e ver a marcação vermelho/verde; (f) ouvir U26 (pausa) e as unidades curtas;
   (g) “Copiar registro do reconhecimento” e enviar ao chat.
