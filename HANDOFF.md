# HANDOFF — estado atual (atualizado em 2026-10-31)

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

## 1. Estado do Git

| Item | Estado |
|---|---|
| Repositório | `https://github.com/Lucas-Marinho-FPA/daily-routine-english` |
| Branch de desenvolvimento | `mvp-jornadas` — **no GitHub** desde 2026-10-31 |
| Histórico de `mvp-jornadas` | commit de preservação ← `1181ea5` ← `523db11` ← `6a0c5b6` ← `0719ac7` ← `aa9c8f8` ← `b582c29` … |
| Lukinhas | `523db11` (módulo) e `1181ea5` (correção do “null”) — originais, preservados |
| Preservação | commit seguinte a `1181ea5`: `dev/`, `CLAUDE.md`, `HANDOFF.md` |
| Publicado (GitHub Pages) | `gh-pages` = `6a0c5b6` (MVP + PWA, **sem** o Lukinhas) |
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
`dev/`, `CLAUDE.md` e este arquivo. A verificação remota e o teste a partir de um clone limpo estão no relatório
dessa entrega (resultado registrado abaixo pela própria sessão de preservação).

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
