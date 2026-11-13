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
| Commit desta etapa | o commit logo acima de `46b7d97` (“feat: john-p1-e01 in seven steps…”, 13/11/2026); confira com `git log --oneline -3` |
| `origin/gh-pages` (publicado) | `46b7d97` — build `583fa58264f1`, https://lucas-marinho-fpa.github.io/daily-routine-english/ |
| O que está publicado | até o vocabulário remodelado/marcação por trecho (12/11). **A e01 em sete etapas NÃO está publicada** |
| Build da branch | `dcaac9a1ecf7` (`dist/app.js`, `sw.js`) |
| Publicação da e01 | **pendente de autorização explícita do PO** (fast-forward de `gh-pages` para o commit da branch) |

Regras: commit/push só com autorização; nunca force push; nunca publicar sem autorização; não usar `main` como origem
(pode conter `c0cb6c8`, material sem licença). Identidade dos commits: `Lucas-Marinho-FPA <294024809+Lucas-Marinho-FPA@users.noreply.github.com>`.

## 2. O que foi feito nesta etapa (na branch de trabalho, não publicado)

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
| **Não testado em aparelho físico (Galaxy S25+)** | toda a e01 em sete etapas; reconhecimento real nos dois modos (em especial unidades curtas no Moonshine); naturalidade dos áudios por ouvido humano; vocabulário remodelado e marcação por trecho publicados em `46b7d97`; correção do reconhecimento online publicada em `1635b92` |

## 5. Limitações conhecidas
1. Transcrição não é avaliação fonética.
2. Moonshine em alvos de 1–2 palavras: pode nunca aprovar se errar sempre a fala do aluno (a regra impede culpar o
   aluno, mas não garante aprovação) — risco de travar a etapa 2 nesse modo; precisa de teste no aparelho.
3. Tradução sem avaliação automática enquanto não houver serviço semântico (D3): a etapa 7.3 e a atividade ficam
   “aguardando avaliação”.
4. Modo online sem áudio da própria voz (o microfone é do reconhecimento).
5. Progresso antigo da e01 (fases 1–2 clássicas) guardado sem crédito nas etapas novas; 7.x reaproveita compreensão,
   leitura e tradução já feitas.
6. `dev/content/dialogues/john*.json` versionados estão uma correção atrás dos regenerados pelo build (sem efeito no app).
7. Traduções autorais e as 403 questões não validadas pelo professor.

## 6. Decisões do Product Owner pendentes
- Autorizar a publicação da e01 (commit e push da branch já feitos em 13/11).
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

## 8. Instruções para o próximo chat
1. Ler `CLAUDE.md`, este arquivo e, conforme a tarefa, `docs/dialogos.md`, `docs/produto/03_…` e `docs/produto/11_…`.
   Conferir `git fetch`, `git status`, `git log --oneline -5` e o remoto (`git ls-remote origin
   claude/daily-routine-governance-y9rr0b gh-pages`): a branch deve estar no commit desta etapa e `gh-pages` em `46b7d97`.
2. Workdir de build/testes: `bash dev/setup-workdir.sh ../drg-work` (detalhes em `dev/README.md`); copiar `js/`, `css/`,
   `dev/tools/`, `dev/content/` e `dev/tests/` para o workdir, rodar `node tools/build-app.mjs` e copiar de volta
   `dist/app.js`, `sw.js`, `data/*.js`, `audio/` novos. Áudio: `kokoro-onnx` + modelo Kokoro (fora do repositório).
3. Testes da e01: `node tests/e2e/dialogue-layers.mjs <site> /daily-routine-english/` e `tests/e2e/audio-layers.mjs`;
   unitários `npm test`. Não repetir suítes aprovadas sem motivo técnico.
4. **Próximo passo:** aguardar o PO — (a) autorização para publicar a e01 (fast-forward de `gh-pages` para o commit da
   branch, depois conferir o workflow “pages build and deployment” e o `VERSION` do `sw.js` servido); (b) resultado da
   validação no Galaxy S25+ (roteiro abaixo); (c) decisões de DEC-022 e D1–D8. Depois: remodelar a próxima atividade de
   John, uma por vez, no mesmo formato (`*-layers.json` + `rollout.json`).
5. Roteiro do aparelho: (a) Ajustes → Áudio, modo Online, “Testar reconhecimento”; (b) e01 etapas 1→7 completas;
   (c) etapa 2 com “work for”, “didn't we?”, “but” e “I'm a project analyst.” nos dois modos; (d) ouvir os áudios das
   unidades curtas; (e) “Copiar registro do reconhecimento” e enviar ao chat.
