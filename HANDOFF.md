# HANDOFF — estado atual e continuidade

Mecanismo de continuidade entre sessões e de auditoria (governança: `docs/governanca/PAPEIS_E_RESPONSABILIDADES.md`).
O executor atualiza este topo ao fechar cada entrega; o ChatGPT audita a partir daqui e do GitHub; nada é apagado — o
que deixa de valer vai para o histórico abaixo. Estados aqui são verificados na data indicada: confirme no Git antes
de agir.

## Estado verificado (Git, GitHub e site publicado, 2026-11-11 15:50 UTC)

| Branch | Commit | O que é | Situação |
|---|---|---|---|
| `gh-pages` | `1f39b60` | **Publicada (2026-11-11 15:46 UTC, workflow nº 28, success; build `ee69e6bf46b5`).** Avatares de Lucas e Lukinhas sobre `a6e8bbb` (MVP de diálogo, workflow nº 27). Anterior: `12accf2`. | Concluído e verificado no site |
| `claude/daily-routine-governance-y9rr0b` | `1f39b60` + registro da publicação | Branch de trabalho (o nome contém “governance”); publicada em `gh-pages`. Commits desde `c9005fa`: `399c1b2`, `5b2d973`, `30c2cd1`, merge `2923008`, `54ec2c1`, `a6e8bbb`, `17b96d1`, `1f39b60` e o registro desta publicação (só documentação). | Concluído |
| `governanca` | `c9005fa` | Governança documental (sobre `curso-simplificado` `90b54b6`). Só documentação. | Concluído; integração aguarda PO |
| `curso-simplificado` | `90b54b6` | Curso — Atividades simplificado + avatar do Heitor. **Publicado em 2026-11-11** como parte de `a6e8bbb`. | Concluído |
| `base-conhecimento` | `01c59b4` | **Nova (2026-11-11 02:59 UTC):** governança da Base de Conhecimento (11 arquivos). Base Mestra, acervos Ian e de-para **não** publicados (motivos em `base-conhecimento/PUBLICACAO.md`). Área da Base: o produto não altera. | Fora do escopo do produto |
| `base-pedagogica` | `6aee572` | Base Pedagógica (camada pública distinta). | Inalterada |
| `main` | `13de9d2` | Branch padrão, desatualizada (out/2026). | Inalterada |
| `identidade-bora` · `mvp-jornadas` | `4cbb34e` · `cf78f87` | Referência de recuperação · linha anterior. | Históricas |
| `remodelagem` · `cp-publicacao` · `arquivo/publicado-2026-11-08` | `8d5ac0c` · `b582c29` · `b194cee` | Históricas/preservação. | Não integrar sem plano |

- **Autorizações permanentes registradas:** nenhuma. Commit e push de `399c1b2` foram autorizados pelo PO para aquela
  entrega; **esta rodada de correção não tem autorização de commit/push** (aguarda nova autorização expressa).
- **Base de Conhecimento:** o registro anterior “não está em nenhuma branch” era verdadeiro quando escrito (governança
  `c9005fa`, 02:41 UTC); às 02:59 UTC a governança da Base foi publicada na branch `base-conhecimento`. O conteúdo
  validado pelo professor (Base Mestra, acervos Ian Parts 1–4, de-para) continua **fora** do repositório.

## Avatares oficiais de Lucas e Lukinhas (2026-11-11) — PUBLICADO e verificado

Pedido do PO: integrar as imagens aprovadas de Lucas e Lukinhas no mesmo padrão do Heitor. Implementado sem autorização
de commit; depois o PO autorizou expressamente commit, push e publicação **só desta entrega** (fora dela: correções de
voz/Moonshine, diferenças visuais entre celulares, novos estados, conteúdo/pedagogia).

**Publicação (verificada):**
- Conferência antes de publicar: branch `claude/daily-routine-governance-y9rr0b` = remoto = `17b96d1`; `gh-pages` =
  `a6e8bbb` (ancestral); 13 arquivos modificados + 3 novos, todos da integração dos personagens (`data/characters.js`
  difere só no estado `idle` de Lucas e Lukinhas; `sw.js` só acrescenta as 2 imagens e atualiza os hashes de
  `data/characters.js` e `dist/app.js`; `dist/app.js` só um comentário). Nada do diagnóstico de voz no repositório.
- Commit **`1f39b60`** (“Personagens: avatares oficiais de Lucas e Lukinhas”), push da branch de trabalho
  `17b96d1..1f39b60`; `gh-pages` avançada por fast-forward **`a6e8bbb..1f39b60`** (sem force; leva também `17b96d1`,
  só registro no HANDOFF). `main` e demais branches intocadas.
- Workflow “pages build and deployment” **nº 28** (run 43051498114): *success*, 2026-11-11 15:45:18–15:46:14 UTC,
  `head_sha` `1f39b60`. Site servindo `sw.js` versão **`ee69e6bf46b5`**; imagens servidas com o mesmo sha256 dos
  aprovados (`eb03c4bf…` Lucas, `6f0999a8…` Lukinhas, `d44c5866…` Heitor).
- Testes da publicação (cópia de trabalho NOVA montada do repositório, `bash dev/setup-workdir.sh /home/user/drg-pub`):
  `node tools/build-app.mjs` → `ee69e6bf46b5`, 0 arquivos diferentes do repositório (reproduzível);
  `node tools/lukinhas-source.mjs` → idêntico ao `lucas-kid.json` versionado; `npm test` 254 — 253 aprovados, 1
  ignorado (pré-existente); em sequência: `avatars` 9/9, `characters` 14/14, `lukinhas` 12/12, `mvp` 14/14, `pwa`
  14/14, `run-pages` 37/37, `update-transition` (publicado `a6e8bbb` → novo) 25/25.
- No site publicado: suíte de avatares apontada para o endereço real 9/9 (escolha com as 3 imagens; Início com Lucas
  78×96, Lukinhas 105×96, Heitor 105×96, natural e sem recorte; Karla com marcador; transparência; 360/412/430 px;
  offline com a rede cortada) e `live-check` 5/5 (sw `ee69e6bf46b5`, diálogos, fases 4/5, offline).

**Registro da implementação (antes da autorização):**

- **Imagens** (cópia byte a byte dos arquivos enviados; PNG RGBA, fundo com alfa 0 e personagem com alfa 253 — sem
  tratamento): `assets/characters/lucas/lucas-avatar.png` (1132×1390, sha256 `eb03c4bf…`) e
  `assets/characters/lucas-kid/lucas-kid-avatar.png` (1312×1199, sha256 `6f0999a8…`). Os nomes dos arquivos enviados
  chegaram renomeados pelo sistema de upload; a atribuição foi pelo conteúdo (adulto = Lucas; criança = Lukinhas).
- **Cadastro** (mesmo formato do Heitor, só o estado `idle`, `kind: 'illustration'`): Lucas em
  `dev/tools/build-characters.mjs`; Lukinhas em `dev/tools/lukinhas-source.mjs` → `dev/content/characters/lucas-kid.json`
  (regenerado; só o campo `visual` mudou — textos, expressões e perguntas idênticos). Gerados: `data/characters.js`,
  `dev/content/build/characters.json`, `dist/app.js`, `sw.js` (build `ee69e6bf46b5`, 2.224 arquivos, 23,9 MB offline;
  as duas imagens no pré-cache com o hash do conteúdo).
- **Exibição:** a mesma função do Heitor (`characterImage`): bloco do personagem ativo no Início (96 px de altura) e
  escolha de personagem (64 px), proporção natural, sem recorte. Karla continua com o marcador da inicial. Nenhuma
  seleção, perfil ou gamificação nova. O build agora exige o arquivo de qualquer estado pronto (antes só das personas
  previstas). Documentação: `docs/personagens.md` (“Avatares oficiais”).
- **Testes (2026-11-11):** `npm test` 254 — 253 aprovados, 1 ignorado (pré-existente); novo `avatars.mjs` 9/9 (carga,
  proporção sem distorção/recorte, Início e escolha, Karla sem imagem, transparência real decodificada, 360/412/430 px,
  offline com servidor desligado); `characters` 14/14; `lukinhas` 12/12; `mvp` 14/14; `pwa` 14/14; `run-pages` 37/37;
  `update-transition` (publicado `a6e8bbb` → novo) 25/25. `dialogue` não reexecutado (código e dados dos diálogos
  inalterados).
- **Pendências:** autorização de commit/push e, se desejado, de publicação; demais estados visuais (thinking, correct,
  wrong, celebrate, levelup) continuam pendentes para todos os personagens; Karla sem imagem.

## Entrega final — decisões do PO, integração e publicação (2026-11-11)

Autorização expressa do PO (2026-11-11): ativar as questões, rodada proporcional, fase 5 independente, corrigir o
conteúdo, commit, push, integração e publicação. Fora da autorização: provedor de IA, serviços pagos e infraestrutura.

**Concluído:**
- Questões de compreensão **ativas**: 403 (30 diálogos com 10; 16 com rodada reduzida de 3 a 9), sem aviso de
  validação ao aluno; origem registrada em cada questão (rastreabilidade interna). DEC-016.
- Rodada reduzida com aprovação em ⌈0,8 n⌉; só as erradas voltam; resposta só depois de acertar. DEC-015/016.
- Fase 5 independente da fase 4 (abre com a fase 3; tradução só aguardando avaliação online também abre 4 e 5). DEC-017.
- Inconsistências corrigidas com rastreabilidade (`dev/content/dialogues/john-corrections.json`; fonte intacta): trem
  8.20 e ~2h30, encontro com Peter, abertura de Rick, mesa para seis pessoas, contexto da ligação de Mary; áudio novo
  das 6 falas; questões ajustadas. DEC-018.
- Documentação: `docs/dialogos.md` (regras vigentes e correções), `docs/produto/04` e `11` (DEC-014 a DEC-019).
- Integração: merge de `gh-pages` (`12accf2`) na branch de trabalho (`2923008`): conflitos só em `css/app.css` (bloco
  acrescentado ao fim pelos dois lados; mantido o nosso, que já tem as regras do avatar) e `sw.js` (gerado); imagem e
  dados do Heitor idênticos. Assim `gh-pages` avança por fast-forward (fluxo oficial, sem force).
- **Build `b7dbb3b76936`**, 2.222 arquivos, 20,68 MB offline; rebuild a partir do repositório idêntico byte a byte.

**Testes (2026-11-11, árvore integrada, Chromium, em sequência):** `npm test` 254 testes — 253 aprovados, 1 ignorado
(pré-existente); `dialogue` 14/14 (D07 questões reais e recuperação; D14 rodada reduzida 3/3 e leitura antes da
compreensão); `run-pages` 37/37; `mvp` 14/14; `journey` 10/10; `characters` 14/14; `lukinhas` 12/12; `course` 18/18;
`coursepractice` 10/10; `storage` 10/10; `wordpractice` 15/15; `asr-local` 22/22; `pwa` 14/14; `update-transition`
(publicado `12accf2` → novo) 25/25. `live-check` (app publicado) contra cópia local: 5/5.

**Resultado da publicação (verificado):**
- `gh-pages` avançada por fast-forward `12accf2..a6e8bbb` (sem force). Workflow “pages build and deployment” nº 27
  (run 43022463554): *success*, 2026-11-11 12:41:05–12:41:35 UTC, `head_sha` `a6e8bbb`.
- Site <https://lucas-marinho-fpa.github.io/daily-routine-english/> servindo `sw.js` versão `b7dbb3b76936` a partir de
  12:41:43 UTC.
- `node tests/e2e/live-check.mjs https://lucas-marinho-fpa.github.io/daily-routine-english/ b7dbb3b76936` → 5/5:
  service worker e pré-cache; 46 diálogos, 403 questões, 6 falas corrigidas, áudio de todas as falas; fases 4 e 5
  (rodada reduzida aprovada após recuperação; leitura disponível antes da compreensão); offline pelo cache; sem erros.
- Usuários com a versão anterior: a troca `12accf2` → nova foi testada (`update-transition` 25/25).
- Publicação inclui também o Curso simplificado (`curso-simplificado` `90b54b6`), que estava na base da branch de
  trabalho e foi coberto pela regressão (`course` 18/18, `coursepractice` 10/10).

**Pendências (não resolvidas por estarem fora da autorização ou dependerem de terceiros):**
- Avaliação semântica online da tradução: provedor, conta, chave, custo e hospedagem (decisão do PO). Sem isso,
  traduções diferentes da referência ficam pendentes (as fases 4 e 5 abrem mesmo assim; a atividade só conclui com as
  avaliações).
- D-004: vocabulário de 15 diálogos e 89 itens de tabelas sem fala correspondente.
- Validação no Galaxy S25+ (roteiro em `docs/dialogos.md`); calibração do corte de 80% da IA.
- Bloqueio sequencial entre diálogos: hoje todos abertos (sem decisão; não bloqueia nada).

## Registro — rodada de correção (2026-11-11, depois de `399c1b2`; decisões resolvidas na entrega final acima)

**Concluído nesta rodada (no ambiente de trabalho, sem commit):**
- Este `HANDOFF.md`: estado de `gh-pages` (`12accf2`, com evidência do workflow), identificação de `399c1b2`
  (branch de trabalho, não `governanca`), `governanca` com SHA, nova branch `base-conhecimento`, seções separadas.
- **Questões de compreensão (fase 4):** 401 questões de múltipla escolha em
  `dev/content/dialogues/john-questions.src.txt` → `john-questions.json` (por `dev/tools/dialogues-questions.mjs`).
  **30 de 46 diálogos com 10 questões**; 16 diálogos curtos com menos (o texto não sustenta 10 sem inventar).
  Habilidades: fato explícito 179, intenção 57, inferência simples 57, ação 43, relação 38, contexto 27. Cada questão
  cita as falas (ou o contexto/título) que a sustentam; gabarito e justificativa na explicação.
  **Fonte:** só o texto de cada diálogo de *The Story of John*. **Não** é conteúdo validado pelo professor (é
  complemento didático da IA, regra 4 da Base); a Base Mestra/acervos validados não estão acessíveis aqui. Cada
  questão e a tela da fase 4 dizem isso.
- **Fase 4 alinhada à regra do PO** (“reapresentar os itens não dominados, sem obrigar a repetir os já dominados”):
  antes, abaixo de 8/10, a recuperação era seguida de **nova rodada completa** (proposta minha); agora só as questões
  erradas voltam, e cada uma passa a contar ao ser acertada; a fase é aprovada quando chega a 8 de 10. A resposta certa
  e a explicação de uma questão errada só aparecem depois de ela ser acertada (ou, com a fase já aprovada, se o aluno
  pedir “Ver as respostas”); antes disso, só a pista da fala a reouvir. Rubrica `dre-comprehension-2`.
- `docs/dialogos.md` auditado e corrigido (ver lá a seção “Auditoria de 2026-11-11”). Código: o resumo final da
  atividade lia um campo da regra antiga da fase 4 (corrigido).
- `CLAUDE.md`, `docs/governanca/PAPEIS_E_RESPONSABILIDADES.md` e `docs/produto/00`: a frase “a Base não está em nenhuma
  branch” foi precisada (governança da Base publicada em `base-conhecimento`; acervo validado continua fora),
  preservando o registro anterior. `docs/produto/11` (DEC-013) não foi alterado: é registro histórico de decisão.
- **Build:** `518ca2361d94`, 2.222 arquivos, 20,67 MB offline, bundle 602 KB.
- **Testes desta rodada** (cópia de trabalho `bash dev/setup-workdir.sh`; Chromium; 2026-11-11):
  `node tools/build-app.mjs` ok; `npm test` → 252 testes, 251 aprovados, 0 falhas, 1 ignorado (pré-existente);
  `node tests/e2e/dialogue.mjs <site> /daily-routine-english/` → 13/13 (D07 agora com as questões REAIS de
  `john-p1-e01`; o gateway continua simulado só no teste); regressão pertinente (bundle, `sw.js` e dados mudaram;
  código das jornadas não): `run-pages` 37/37, `pwa` 14/14. Demais suítes não reexecutadas (sem mudança no código
  delas; última execução completa: entrega `399c1b2`).

**Pendências (técnicas/documentais):**
- Validação no Galaxy S25+ (roteiro em `docs/dialogos.md`).
- Calibração do corte de 80% da avaliação online com amostras revisadas por pessoa (quando houver provedor).
- Divergências de conteúdo encontradas (registradas, **não alteradas**): ver “Observações de conteúdo” em
  `docs/dialogos.md` (ex.: horário do trem 8.40 × 8.20; “at the university” × “at a conference”).

**Decisões que dependem do Product Owner:**
1. **Validação das 401 questões:** manter ativas como complemento da IA até a validação, ou desativar até a Base/professor
   validar. Hoje estão ativas só nesta branch (não publicada).
2. **16 diálogos curtos** (menos de 10 questões sustentadas): (a) manter a fase 4 indisponível neles; (b) permitir
   rodada menor com corte proporcional (ex.: 80% de N); (c) a Base/autor ampliar esses diálogos; (d) tratá-los como
   material complementar fora do fluxo de cinco fases. Sem decisão, continuam indisponíveis.
3. Provedor de IA, conta, chave, custo, hospedagem do gateway e retenção dos textos enviados (nada foi contratado).
4. Bloqueio sequencial entre diálogos (hoje todos abertos).
5. Publicar no repositório público os documentos autorais de John e as questões (hoje só nesta branch, em `dev/`).

**Bloqueado por dependência externa:**
- Avaliação semântica online da tradução (fase 3): depende da decisão 3; sem ela, traduções diferentes da referência
  ficam pendentes (não simuladas).
- Fase 4 dos 16 diálogos curtos: depende da decisão 2 ou de conteúdo novo.
- Demanda D-004: vocabulário de 15 diálogos e 89 itens de tabelas sem fala correspondente (Base/autor).

## Registro — entrega `399c1b2` (MVP de diálogo, 2026-11-11), preservado como foi escrito

> Correções posteriores: a fase 4 deixou de exigir nova rodada completa (regra do PO; ver “Rodada de correção”); a
> demanda D-003 foi atendida em parte pelas questões desta rodada (30 de 46 diálogos); `gh-pages` publicada é `12accf2`
> (o teste `update-transition` daquela entrega já rodou contra `12accf2`).

### Entrega — MVP de diálogo em cinco fases (2026-11-11) — commit e push da branch de trabalho autorizados pelo PO

Pedido do PO: pacote `DRE_MVP_Arquitetura_Implementacao` (cópia em `docs/produto/mvp-dialogo/`). Implementação
autorizada só no ambiente/branch de trabalho; **push, merge, deploy, publicação e contratação de serviços NÃO
autorizados**. Referência técnica completa: `docs/dialogos.md`.

- **Branch de trabalho:** `claude/daily-routine-governance-y9rr0b`, recriada localmente a partir de `origin/governanca`
  (`c9005fa` = `curso-simplificado` `90b54b6` + governança). Commit e push desta branch autorizados pelo PO em
  2026-11-11 (sem merge e sem publicação); `gh-pages`, `main` e `base-pedagogica` inalteradas.
- **Conteúdo:** sete partes de *The Story of John* (fonte literal em `dev/content/dialogues/source/`) → 46 diálogos,
  273 falas conferidas caractere por caractere, 183 itens de vocabulário; nenhum código ACT/SRC; 425 áudios britânicos
  Kokoro (uma voz por personagem). Lacunas em `dev/content/dialogues/john-report.json`.
- **App:** rotas `#/dialogues`, `#/dialogue/<id>`, `#/dphase/<id>?p=<fase>`; cartão no Início; progresso em
  `kv → dialogues` (separado das jornadas); motor `js/engine/dialogue.js`, avaliadores `dialogueeval.js`, fila/cliente
  online `evalsync.js`, telas `js/ui/dialogue.js`. Identidade visual: só tokens/classes existentes.
- **Avaliação online:** provider-neutral; AI Gateway de referência em `dev/backend/ai-gateway/` (não implantado).
  Sem `DRG_EVAL_ENDPOINT` no build, a CSP continua só `'self'` e traduções não idênticas à referência ficam pendentes.
- **Build:** `56c5df6175de`, 2.222 arquivos, 20,46 MB offline (era 16,64 MB; +425 áudios), bundle 599 KB.
- **Testes (2026-11-11):** unitários 250/250 (1 ignorado, pré-existente; a falha de `characters.test.js` da linha de
  base sumiu porque o build regenerou `content/build/characters.json`); E2E novo `dialogue.mjs` 13/13 (questões e
  gateway SIMULADOS só no teste; D11 com reconhecimento Moonshine real; D12 offline real com service worker).
  Regressão no build final (Chromium, simulação do Pages, em sequência): run-pages 37/37, mvp 14/14, journey 10/10,
  characters 14/14, lukinhas 12/12, course 18/18, coursepractice 10/10, storage 10/10, wordpractice 15/15,
  asr-local 22/22, pwa 14/14, update-transition (`gh-pages` publicada → nova) 25/25. Logs só no ambiente temporário.
- **Achados corrigidos durante os testes:** pista da fase 2 revelava a tradução completa quando o item era a fala
  inteira; tela da fase não se atualizava após “Enviar agora”; questões quebravam o layout móvel (`fieldset`).

#### Pendências desta entrega

- **Demanda D-003 (Base de Conhecimento / PO):** 10 questões de compreensão curadas por diálogo (46 diálogos). Sem elas,
  a fase 4 fica “conteúdo pendente” e a fase 5 não abre. O app não cria questões. Formato: `ComprehensionQuestion`
  (`docs/produto/mvp-dialogo/05`), arquivo `dev/content/dialogues/john-questions.json`.
- **Demanda D-004:** 15 diálogos sem vocabulário próprio nos documentos e 89 itens de tabelas da parte sem fala
  correspondente (lista no relatório).
- **Decisões do PO:** provedor de IA, conta/chave/custo e hospedagem do gateway; política de retenção dos textos
  enviados; bloqueio sequencial entre diálogos (hoje aberto); recuperação obrigatória na fase 4 antes de nova rodada
  (implementada como proposta); publicar no repositório público os documentos autorais de John (hoje só em `dev/`,
  não enviados).
- Validação no Galaxy S25+ (roteiro em `docs/dialogos.md`); calibração do corte de 80% da IA com amostras revisadas.


### Fatos verificados antes da rodada de correção (Git, 2026-11-11, cedo) — preservado

> Superado pela tabela “Estado verificado” acima: `gh-pages` estava aqui como `a5051d4` (publicação posterior: `12accf2`).

| Branch | Commit | O que é |
|---|---|---|
| `gh-pages` | `a5051d4` | **Publicada** (GitHub Pages). Conteúdo = `4cbb34e` + commit vazio de reativação do deploy. |
| `identidade-bora` | `4cbb34e` | Identidade visual do Bora; referência de recuperação. |
| `curso-simplificado` | `90b54b6` | **Trabalho não publicado:** Curso — Atividades simplificado + avatar oficial do Heitor. |
| `governanca` | (esta entrega; parte de `90b54b6`) | Governança documental: `CLAUDE.md`, `docs/governanca/`, `docs/produto/`, `docs/aplicativo-referencia.md`, este `HANDOFF.md`. Só documentação; nenhum código alterado. |
| `mvp-jornadas` | `cf78f87` | Linha de desenvolvimento anterior; atrás de `gh-pages`. |
| `base-pedagogica` | `6aee572` | **Base Pedagógica** — camada pública distinta, com instruções próprias; diverge da linha do produto desde `b194cee`. Não é a Base de Conhecimento. |
| `main` | `13de9d2` | Branch padrão do GitHub, desatualizada (out/2026). Não alterar sem autorização. |
| `remodelagem` · `cp-publicacao` · `arquivo/publicado-2026-11-08` | `8d5ac0c` · `b582c29` · `b194cee` | Históricas/preservação; não integrar sem plano aprovado. |

- A **Base de Conhecimento** (governança própria, Base Mestra, acervos das atividades, de-para interno) **não está em
  nenhuma branch nem no histórico** deste repositório (busca por nomes e por conteúdo em 2026-11-11: 0 ocorrências).
- Todos os repositórios acessíveis à sessão são públicos; não há repositório privado para a Base de Conhecimento.
- O de-para interno define a convenção de códigos (SRC, MAT, ACT, EX, VOC); **nenhum código ACT foi atribuído**.
- **Autorizações permanentes registradas:** nenhuma. Commit, push e publicação seguem autorização explícita por entrega.


## Registros históricos (execuções anteriores; não reverificados nesta sessão)

### Publicação `12accf2` — avatar oficial do Heitor (2026-11-11), registro trazido de `gh-pages` no merge, sem alteração

- **O quê:** só a identidade visual do Heitor, separada da sprint do Curso (`curso-simplificado`, `90b54b6`, que
  continua **não publicada**). Arquivo `assets/characters/heitor/heitor-avatar.png` (PNG RGBA 1312×1199, idêntico ao
  aprovado em 2026-11-10; sha256 `d44c5866…`). Heitor segue persona prevista, sem conteúdo nem idade; só o estado
  `idle` tem imagem, como ilustração (`object-fit: contain`, sem recorte). Aparece no bloco do personagem do Início
  (96 px de altura) e nas opções de escolha de personagem (64 px). Demais personagens sem mudança.
- **Arquivos:** imagem; `css/app.css` (bloco da ilustração); `js/ui/character.js`; `js/ui/home.js` (1 linha);
  `dev/content/personas-planned.json`; `dev/tools/build-characters.mjs` (falha o build se estado pronto não tiver
  imagem); testes `characters`; gerados `data/characters.js`, `dev/content/build/characters.json`, `dist/app.js`,
  `sw.js` (versão `deae501a5d3b`, imagem no manifesto offline).
- **Pendência:** ao publicar `curso-simplificado` no futuro, integrá-la sobre este commit (os arquivos do Heitor são os
  mesmos; `dev/content/build/characters.json` de `90b54b6` estava desatualizado e este é o correto).


- `gh-pages`: build `fce4fe7705db`; workflow Pages #25 com sucesso em 2026-11-10 (após falha por tempo esgotado do
  GitHub no #24, reexecução travada e commit vazio de reativação autorizado).
- `curso-simplificado`, build `1bc411deb516`, testes de 2026-11-10: unitários 231/232 (1 ignorado, pré-existente);
  `coursecatalog` 8/8; `course` 18/18; `coursepractice` 10/10; `characters` 14/14; `mvp` 14/14; `pwa` 14/14;
  `update-transition` 25/25. Conteúdo sintético.
- Contrato de importação do Curso (`docs/curso-atividades.md` em `90b54b6`) entregue para a Base em 2026-11-11.
- Diagnóstico de governança da Base de Conhecimento (2026-11-11, somente leitura): proposta apresentada ao Product
  Owner, nada implementado. Conflitos apontados: auditorias pedidas no checklist da Base × regra de não reauditar;
  fronteira Base de Conhecimento × Base Pedagógica; ausência de proteção automatizada contra versionar o de-para.

## Pendências

**Produto (executáveis quando autorizadas):**
- Validar no Galaxy S25+ a identidade Bora publicada e, quando publicada, a entrega `curso-simplificado`.
- ~~Publicação de `curso-simplificado` e integração desta governança: aguardam autorização do Product Owner.~~ **Concluído em 2026-11-11** (`gh-pages` `a6e8bbb`, ver topo).
- Proteções automatizadas contra versionar/publicar o de-para, a Base Mestra e os acervos (`.gitignore` e checagem no
  build/validador): proposta pronta, aguardando autorização.
- Itens P-001…P-013 de `docs/produto/11_HISTORICO_DE_DECISOES_E_PENDENCIAS.md` (snapshot de 08/11).

**Decisões reservadas ao Product Owner:**
- Onde a Base de Conhecimento será mantida (repositório privado próprio ou fora do Git) e o acesso dos agentes a ela.
- A quem a Base Pedagógica (`base-pedagogica`) responde e sua relação com a Base de Conhecimento.
- `main` desatualizada como branch padrão; alinhamento de `mvp-jornadas`.

## Demandas para a Base de Conhecimento

| ID | Demanda | Contrato | Situação |
|---|---|---|---|
| D-001 | Gerar os arquivos de estudo das quatro partes do conjunto atual de atividades do curso, com títulos neutros e blocos literais. **Os códigos do conjunto e das partes são atribuídos pela governança da Base** (nenhum foi atribuído até 2026-11-11); de-para e origem só na Base; arquivos fora do repositório | `docs/curso-atividades.md` (seção vigente, formato 1), commit `90b54b6` | Contrato entregue em 2026-11-11; aguardando atribuição de códigos e os arquivos |
| D-002 | Registrar na governança da Base que o de-para, a origem e a validação do professor das atividades do curso ficam só na Base (controle editorial externo; o app não exige validação) | `docs/governanca/PAPEIS_E_RESPONSABILIDADES.md`, seção 6 | Aberta |
| D-003 | Validar (ou substituir) as questões de compreensão da fase 4 de *The Story of John*: 401 questões elaboradas pela IA só a partir do texto dos diálogos, **não validadas pelo professor** | `ComprehensionQuestion` (`docs/produto/mvp-dialogo/05`); `dev/content/dialogues/john-questions.src.txt` | Aberta (2026-11-11): 30 de 46 diálogos com 10 questões; 16 diálogos curtos aguardam decisão do PO |
| D-004 | Vocabulário: 15 diálogos sem itens próprios nos documentos; 89 itens de tabelas sem fala correspondente | `dev/content/dialogues/john-report.json` | Aberta |

O trabalho técnico que não depende dessas demandas segue normalmente.

## Próxima sessão

1. Ler `CLAUDE.md` e este topo; conferir branch, `HEAD` e remoto.
2. Partir da branch indicada no pedido. Hoje: MVP de diálogo em `claude/daily-routine-governance-y9rr0b`
   (`399c1b2` + rodada de correção, se autorizada); Curso em `curso-simplificado`; documental em `governanca`.
   Não usar `main` como origem. (Texto anterior desta linha: “hoje `curso-simplificado`, ou `governanca`”.)
3. Atualizar este topo ao fechar: fatos verificados, registros, pendências e demandas — sem apagar o histórico.

---

# Histórico — estado em 2026-11-08 (preservado)

> O protocolo de sessão abaixo (trocar para `mvp-jornadas`, commitar e enviar ao fim de cada sessão) foi
> **substituído** em 2026-11-11 pelo `CLAUDE.md` e por `docs/governanca/PAPEIS_E_RESPONSABILIDADES.md` (commit e push só
> com autorização). O restante é registro técnico daquela data.


## Protocolo para uma conversa nova

1. Ler `CLAUDE.md` (projeto, metodologia, arquitetura, regras) e este arquivo.
2. Clonar/atualizar e entrar na branch de desenvolvimento: `git fetch origin && git checkout mvp-jornadas`.
3. Conferir: `git log --oneline -6`, `git status`, `git ls-remote origin`.
4. Para rodar testes ou build: `bash dev/setup-workdir.sh ../drg-work && cd ../drg-work && npm ci && npm test`
   (detalhes em `dev/README.md`).
5. Identificar o próximo passo (seção 9) e trabalhar **só no escopo pedido**.
6. Não pedir de novo os dez textos do Lukinhas (`dev/tests/fixtures/lukinhas-texts.json` e
   `dev/content/characters/lucas-kid.json`), não pedir explicação da arquitetura, não repetir auditorias completas sem
   motivo, não confundir o que está concluído com o que está pendente.
7. Ao fim de cada sessão relevante: atualizar este arquivo, commitar e **enviar a branch de desenvolvimento**
   (regra permanente: nada importante só no ambiente temporário).

## 0a. Correção definitiva da atualização do PWA (2026-11-08, publicada)

- **Problema:** no Galaxy S25+ (Samsung Internet) a versão `79916fe` ficava em “Baixando uma nova versão do aplicativo…”
  sem fim. Causa medida: cada versão baixava de novo 1.805 arquivos (15,18 MB) num único passo de instalação, embora
  só `dist/app.js` (0,45 MB) tivesse mudado; falha, app fechado ou rede lenta além dos 5 min do navegador descartavam
  tudo.
- **Solução** (`docs/pwa-instalacao.md` → “Atualização incremental e retomável”): arquivos guardados pelo hash do
  conteúdo em caches compartilhados entre versões (`drgshell-v1`, `drgaudio-v1`); só o que mudou é baixado (arquivos das
  versões antigas são conferidos e copiados); cada arquivo conferido e guardado ao chegar; tentativas com limite de
  4 min que guardam o progresso e continuam sozinhas; progresso real na faixa de aviso; **Ajustes → Aplicativo →
  Diagnóstico da atualização**. Dados do aluno (IndexedDB/localStorage) nunca são tocados.
- **Defeitos achados pelos testes novos e corrigidos antes de publicar:** consulta ao cache antigo quadrática (216 s →
  ~10 s); estado da tentativa sobrescrito pela conferência da versão ativa (contagem de tentativas); retomada automática
  bloqueada pelo intervalo de 15 min entre verificações.
- **Testes** (`dev/tests/e2e/update-transition.mjs`, 25 cenários; logs em `dev/evidence/2026-11-08-pwa/`): versão
  publicada `b25ebbc` → nova baixa **1 arquivo (0,46 MB), 0 áudios**; U01 1 arquivo alterado → 1 baixado (74 KB);
  U02 7 alterados → exatamente 7 (117 KB), 1.782 áudios reaproveitados; U03 app fechado no meio → retoma sem recomeçar;
  U04 503 temporário → refeito na mesma tentativa; U05 300 kbit/s, download de 6 min → 2 tentativas, 13,49 MB baixados =
  13,49 MB alterados; U06 hash errado → versão não instalada, erro no aviso e no Diagnóstico; U07 dados idênticos
  depois de 6 atualizações; U08 áudios reaproveitados.
- **Não testado:** aparelho físico (Galaxy S25+) e o Samsung Internet real (só Chromium com rede simulada).
- No celular ainda em `b25ebbc`, a troca usa o código novo de instalação: baixa só `dist/app.js` e copia o resto do
  cache atual. A retomada automática vale a partir da versão nova em uso.

## 0. Entrega de 2026-11-08 — Curso — Atividades (publicada)

- **O quê:** área independente “Curso — Atividades” (`#/course`): atividades de tradução inglês → português do curso do
  usuário, uma questão por vez, salvamento automático, retomada, edição, checagem básica local (orientação), correção do
  professor por questão e exportação TXT só com tudo concluído. Detalhes: `docs/curso-atividades.md`.
- **Decisões do responsável:** nome neutro no app público; texto das atividades **importado no aparelho** (Início →
  Curso — Atividades → Importar atividade). **Nunca versionar o texto de uma atividade** (testes: conteúdo sintético
  ou `DRG_COURSE_FILE` apontando para um arquivo fora do repositório).
- **Base:** a versão publicada `b25ebbc` (não a `remodelagem`). Commits `cf65d9c`, `7eefdac` e o desta atualização;
  publicado por fast-forward de `gh-pages` = `mvp-jornadas`.
- **Regressão completa no build publicado** (logs em `dev/evidence/2026-11-08/`): unitários 207/207; Curso 13/13 com o
  arquivo real (21 questões, 210 blocos) e 13/13 sintético; MVP 14/14; Personagens 14/14; Conversation Practice
  10/10; Armazenamento 10/10; Prática de palavras 15/15; Lukinhas 12/12; PWA 14/14; troca real `b25ebbc` → nova
  17/17; simulação do Pages 37/37; E2E local 37/37; reconhecimento de voz 22/22.
- **Atenção para a `remodelagem`:** ela foi criada antes desta entrega e **não tem** a área do curso. Antes de publicá-la,
  integrar `mvp-jornadas` (merge) para não remover a área nem os dados do usuário (os dados ficam em `kv` → `course`).

## 1. Estado do Git

| Item | Estado |
|---|---|
| Repositório | `https://github.com/Lucas-Marinho-FPA/daily-routine-english` |
| Branch de desenvolvimento | `mvp-jornadas` (= publicado) · `remodelagem` (remodelagem integral, não publicada; ver seção 0) |
| Histórico de `mvp-jornadas` | `0d096ad` ← `be86c74` ← `1181ea5` ← `523db11` ← `6a0c5b6` ← `0719ac7` ← `aa9c8f8` ← `b582c29` … |
| Lukinhas | `523db11` (módulo) e `1181ea5` (correção do “null”) — originais, preservados |
| Preservação | `be86c74` (`dev/`, `CLAUDE.md`, `HANDOFF.md`) e `0d096ad` (correção do `setup-workdir.sh`) |
| Publicado (GitHub Pages) | `gh-pages` = `mvp-jornadas` (Lukinhas + correções do PWA `b25ebbc` + Curso — Atividades) |
| `main` remota | `13de9d2` (não alterar sem autorização) |
| `cp-publicacao` remota | `b582c29` (preserva também a versão publicada anterior ao MVP) |
| `main` local (só no ambiente antigo) | continha `c0cb6c8` (material do livro) — **nunca enviar** |

Publicar = avançar `gh-pages` por fast-forward a partir de `mvp-jornadas`
(`git push origin mvp-jornadas:gh-pages`), **somente com autorização explícita**, e acompanhar o workflow
“pages build and deployment”. Ao publicar, `dev/` vai junto para o Pages (não entra no pré-cache do app; não contém
dados privados nem texto de terceiros). O canal git destes ambientes recusou envio de tags; o domínio
`lucas-marinho-fpa.github.io` costuma estar bloqueado na rede do ambiente (sem verificação do site no ar).

## 2. Módulo Lukinhas — IMPLEMENTADO (`523db11`, `1181ea5`)

Não reconstruir. Personagem existente `lucas-kid`, nome de exibição **Lukinhas** (11 anos). Dez sessões L01–L10 com
os textos aprovados (66 frases, iguais caractere por caractere aos aprovados; nenhuma correção foi necessária),
tradução por frase, 73 expressões prioritárias, 30 perguntas, 245 clipes de áudio britânico (voz Kokoro `bm_lewis`).

1. My Morning Routine · 2. Getting Ready for the Day · 3. Looking After My Dog · 4. Helping Around the House ·
5. It's Jiu-Jitsu Time! · 6. Back Home and Ready to Relax · 7. My Morning, Step by Step · 8. A Typical Day at Home ·
9. Keeping My Morning Organised · 10. My Daily Routine: The Full Story

Cada sessão = um módulo com as cinco etapas existentes:
- **Texto e destaques** (topo do módulo, sempre aberto): título, foco, nível, objetivo, língua em contexto, vocabulário
  prioritário; texto integral com expressões **tocáveis** (significado, explicação, exemplo adicional com tradução,
  áudio); tradução; áudio por frase/bloco/texto.
- **Compreensão:** 01 Palavras-chave (vocabulário prioritário exceto phrasal verbs) e 02 Expressões práticas (phrasal
  verbs da sessão), com lista explicada e revisão espaçada.
- **Speaking Lab:** 03 Ouvir e entender (ouvir uma frase da sessão sem o texto e reconhecê-la) e 04 Falar na prática
  (só frases, blocos e perguntas da sessão; gravação, transcrição local, comparação verde/âmbar/cinza).
- **Atividades:** identificar o significado, lembrar a expressão, completar a frase, montar a frase, ordenar o bloco,
  ouvir e identificar, responder por escrito ou falando e o exercício novo **“mais natural”** (`nat`; só itens com
  `plain`, ou seja, só do Lukinhas).
- **Produção independente:** 05 Aplicar e conversar — perguntas com resposta-modelo do texto e a pergunta aberta final
  “Now, tell me … without reading the text.”
- Expressões de sessões anteriores voltam ligadas nas posteriores (a L10 retoma mais de oito).

## 3. Onde está cada coisa

- **App (raiz):** `js/ui/expression.js` (novo), `docs/lukinhas.md`, 245 clipes em `audio/`; dados em
  `data/characters.js`, `data/audio-index.js`, `data/lexicon.txt.gz`; código em `js/engine/{scheduler,exercises,modules,
  characters}.js`, `js/ui/{explore,modules,session}.js`, `css/app.css`, `dist/app.js`, `sw.js`.
- **Fontes e ferramentas (`dev/`):** `dev/content/characters/lucas-kid.json` (fonte do Lukinhas),
  `dev/tools/lukinhas-source.mjs` (gerador), `dev/tools/build-*.mjs`, `dev/tools/gen_audio.py`, demais conteúdos
  (Lucas, Karla, Conversation Practice), `dev/vendor/` (léxico e fontes do reconhecimento de fala).
- **Testes (`dev/tests/`):** unitários (`lukinhas.test.js` e os demais), E2E (`lukinhas.mjs`, `pwa.mjs`, `mvp.mjs`,
  `run.mjs`, `run-pages.mjs`, `asr-local.mjs`, `storage.mjs`, `wordpractice.mjs`, `characters.mjs`, `journey.mjs`),
  fixtures (`lukinhas-texts.json` = os dez textos aprovados).
- **Evidências:** `dev/evidence/2026-10-31/*.log` (última regressão completa).
- **Fora do repositório, de propósito:** `privacy_sanitize.py` (contém nomes privados), texto do Conversation Book,
  Word original do usuário, modelo Kokoro, `node_modules/`. Ajustes feitos só na cópia versionada: padrões de proteção
  de nomes privados codificados (mesmo comportamento) e caminho do site simulado em `run-pages.mjs` (`../site` ou
  `DRG_PAGES_SITE`).

## 4. Testes da última regressão completa (2026-10-30/31; logs em `dev/evidence/2026-10-31/`)

Unitários: **200/200** (14 do Lukinhas). E2E (Chromium, viewport 412 px, simulação do GitHub Pages):

| Suíte | Resultado |
|---|---|
| Lukinhas | 12/12 |
| MVP | 14/14 |
| E2E local | 37/37 |
| Simulação do Pages | 37/37 |
| Reconhecimento de voz | 22/22 |
| Armazenamento | 10/10 |
| Prática de palavras | 15/15 |
| Personagens | 14/14 |
| Conversation Practice | 10/10 |
| PWA | 13/13 em duas execuções seguidas |

- Offline do Lukinhas aprovado (servidor desligado e rede cortada): texto, painel de expressão, áudio e exercícios.
- Lucas adulto e Karla comparados objeto por objeto com a versão publicada: idênticos.
- Verificação de portabilidade (clone limpo do GitHub → `setup-workdir.sh` → `npm ci` → `npm test`): ver seção 6.

## 5. Correções feitas durante o Lukinhas

- Exemplos adicionais que inventavam fatos → frases genéricas.
- L01 com etapa “Palavras-chave” vazia → nas sessões, etapa 1 = vocabulário prioritário sem phrasal verbs; etapa 2 =
  phrasal verbs.
- Dois códigos de áudio da Karla alterados sem querer → restaurados.
- “null” impresso na página de texto → corrigido e conferido nas quatro trilhas.
- Teste PWA com espera fixa de 4 s → espera pela ativação real do service worker.

## 6. Preservação (2026-10-31)

A sessão em que o Lukinhas foi feito deixou commits e fontes só no ambiente temporário; uma sessão seguinte não os
encontrou. Corrigido: `mvp-jornadas` foi enviada ao GitHub com os commits originais e um commit de preservação com
`dev/`, `CLAUDE.md` e este arquivo. Resultado registrado pela própria sessão de preservação:

- Antes do envio, `git ls-remote` não mostrava `mvp-jornadas` no remoto (sem divergência possível).
- `git push -u origin mvp-jornadas` sem force: `[new branch]`; o remoto aponta para `0d096ad`.
- Pela API do GitHub: os commits `0d096ad`, `be86c74`, `1181ea5`, `523db11` e `6a0c5b6` estão na branch, com os
  mesmos hashes; `dev/content/characters/lucas-kid.json` está acessível.
- Clone limpo do GitHub em outro diretório: autoria preservada, os dez textos estão na fixture, 1.787 arquivos em
  `audio/`; `setup-workdir.sh`, `npm ci` e `npm test` deram **200/200**.
- Num clone limpo, o rebuild (`node tools/build-app.mjs`) saiu **idêntico byte a byte** ao app do repositório. Nesse
  ambiente: E2E Lukinhas **12/12**, PWA **13/13**, simulação do Pages **37/37**.
- `gh-pages` (`6a0c5b6`), `main` (`13de9d2`) e `cp-publicacao` (`b582c29`) ficaram inalteradas. Nada foi
  publicado.

## 7. Limitações conhecidas

- Voz do áudio britânica adulta (o gerador offline não tem voz infantil).
- Reconhecimento de fala opcional (~38 MB); transcrição não comprova pronúncia; sem avaliação fonética.
- Pacote offline ~14,5 MB com o Lukinhas (era ~11,8 MB).
- XP, níveis e troca de personagem continuam no app (vindos do MVP); o Lukinhas não acrescentou gamificação.
- Teste físico no Galaxy S25+ da versão publicada `6a0c5b6` ficou com o usuário; sem retorno registrado.
- Regerar áudio exige o modelo Kokoro e Python com `kokoro-onnx` (não versionados; ver `dev/README.md`).

## 8. Backlog (não bloqueia)

1. Voz infantil local e gratuita para o Lukinhas.
2. Revisão só das expressões marcadas com estrela.
3. Imagens do Lukinhas (seis estados).
4. Sessões específicas de jiu-jitsu só se os dias de treino forem confirmados.
5. Decisão de produto sobre XP/seleção de personagens (seção 3 do `CLAUDE.md`).

## 9. Próximo passo recomendado

Revisão final do módulo Lukinhas pelo usuário e, se aprovado, **autorização explícita** para publicar
`mvp-jornadas` em `gh-pages` por fast-forward. Não reconstruir o módulo, não refazer testes aprovados sem motivo
técnico, não alterar conteúdo ou critérios pedagógicos.
