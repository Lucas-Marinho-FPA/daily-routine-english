# HANDOFF — estado atual (atualizado em 2026-10-31)

## Protocolo para uma conversa nova

1. Ler `CLAUDE.md` (projeto, metodologia, arquitetura, regras) e este arquivo.
2. Clonar/atualizar e entrar na branch de desenvolvimento: `git fetch origin && git checkout remodelagem` (trabalho atual; `mvp-jornadas` = versão publicada).
3. Conferir: `git log --oneline -6`, `git status`, `git ls-remote origin`.
4. Para rodar testes ou build: `bash dev/setup-workdir.sh ../drg-work && cd ../drg-work && npm ci && npm test`
   (detalhes em `dev/README.md`).
5. Identificar o próximo passo (seção 7) e trabalhar **só no escopo pedido**.
6. Não pedir de novo os dez textos do Lukinhas (`dev/tests/fixtures/lukinhas-texts.json` e
   `dev/content/characters/lucas-kid.json`), não pedir explicação da arquitetura, não repetir auditorias completas sem
   motivo, não confundir o que está concluído com o que está pendente.
7. Ao fim de cada sessão relevante: atualizar este arquivo, commitar e **enviar a branch de desenvolvimento**
   (regra permanente: nada importante só no ambiente temporário).

## 1. Estado do Git (2026-10-31)

| Item | Estado |
|---|---|
| Repositório | `https://github.com/Lucas-Marinho-FPA/daily-routine-english` |
| **Publicado** (`gh-pages`) | `b25ebbc` — Lukinhas + correções de atualização do PWA (service worker `f7bf4c19ac6f`). **Intacto.** |
| `mvp-jornadas` | `b25ebbc` (igual ao publicado) |
| **Branch de trabalho** | **`remodelagem`** (a partir de `b25ebbc`) — remodelagem integral, **não publicada**, aguardando validação no Galaxy S25+ |
| `main` remota | `13de9d2` (não alterar) · `cp-publicacao` `b582c29` (não alterar) |

Publicar a remodelagem = fast-forward de `gh-pages` para o commit validado de `remodelagem`
(`git push origin <commit>:refs/heads/gh-pages`), **somente com autorização explícita**, conferindo antes que
`gh-pages` ainda é ancestral; acompanhar “pages build and deployment”. O domínio `lucas-marinho-fpa.github.io` é
bloqueado na rede do ambiente (sem verificação do site no ar daqui).

## 2. Publicações de 2026-10-31 (concluídas)

- `ec33411`: Lukinhas publicado. Diagnóstico do PWA que não atualizava → dois defeitos reais, corrigidos e publicados
  em `b25ebbc` (`docs/pwa-instalacao.md`): (1) a limpeza (CLEANUP) das versões ≤ `6db56e10bb5d` apagava o cache da
  versão nova em espera → cache novo com prefixo `drgapp-`, limpeza que não toca versão pendente, autocompletar o
  cache; (2) “Atualização indisponível neste modo de abertura” = `register()` preso na fila do navegador durante o
  download → registro por `getRegistration()`, estados verificando/baixando/pronta/falhou/atualizado.
- Suíte `dev/tests/e2e/update-transition.mjs`: troca **real** entre versões, conferindo a tela.

## 3. Remodelagem (branch `remodelagem`, NÃO publicada)

Diretriz do responsável: ferramenta de aprendizagem, não jogo; ciclo pedagógico único; Início orientador; navegação
previsível; progresso por domínio demonstrado; elenco fixo; acessibilidade.

- **Ciclo único de 6 etapas** nas duas jornadas (`js/engine/modules.js`): Vocabulary · Collocations, phrasal verbs &
  expressions · **Sentence building** (nova etapa: montar/escrever frases, ordenar blocos) · Listening · Speaking ·
  Application. Critérios de domínio em `CLAUDE.md` §2. Estados: Concluída / Em andamento / Não iniciada / Bloqueada;
  etapa concluída nunca volta a aparecer bloqueada (progresso anterior preservado).
- **Gamificação fora da tela:** XP, níveis, sequência, conquistas, mascote, 🎉 e escolha de avatar removidos (o estado
  guardado não foi apagado). Personagens = protagonistas: escolha de **história** em `#/stories`; elenco fixo (`CAST`);
  Heitor com 7 anos (informado pelo responsável).
- **Início:** duas jornadas separadas, cada uma com sessão atual, contexto, etapa atual, próxima atividade e
  Continuar; revisão; backup; instalação.
- **Navegação:** abas Início · Daily Routine · Conversation · Falar · Progresso; Voltar do app = Voltar do Android
  (pilha da abertura); redirecionamentos substituem o histórico (sem ciclos); toda tela interna tem Voltar; posição
  de leitura restaurada.
- **Progresso — fonte única:** causa do “100% mas não concluída” = duas medidas diferentes (porcentagem de itens na
  página do texto/Explorar × etapas na lista). Agora módulo, lista, Início, resumo da sessão e Progresso usam
  `moduleStatus`; o Explorar mostra “% dominado” só para categorias de itens.
- **Conteúdo:** CP01 tinha 1 palavra no vocabulário (itens catalogados como connector/sentence) → 9 palavras do
  **próprio diálogo** (team, welcome, software developer, friendly, everyone, join, move, club, later), significado da
  tradução aprovada, áudio Kokoro `bf_emma` (6 clipes novos; os demais já existiam). Separação palavra × combinação
  por forma. Observação de auditoria (sem inventar): K02 tem 0 palavras de uma só palavra, K03/L05/L06 têm 2 — etapas
  pequenas, não vazias de propósito; ampliar só com material aprovado.
- **Traduções:** as 187 perguntas e respostas-modelo não tinham português → traduções de **apoio** marcadas
  (`dev/content/translations/questions-pt.json` → `data/translations.js`); Speaking Lab com “Mostrar tradução” nas
  abas Frases, Blocos e Perguntas; “Ver PT” não abre mais vazio.
- **Speaking:** recuperação após 3 tentativas (palavra persistente destacada → ouvir → gravar só a palavra, podendo
  repetir 2–3 vezes → calibração **temporária** na tentativa seguinte → resultado com confiabilidade: completa,
  com ressalva, parcial ou inconclusiva). Rótulos: Reconhecida / Possível erro de reconhecimento / Não avaliada.
  Captura: aviso “Preparando o microfone… espere” até a gravação começar (falar antes cortava a 1ª palavra).
- **Acessibilidade/visual:** 5 abas sem quebra, toque ≥ 44 px, texto ≥ 12,8 px, estados em texto (não só cor),
  bloqueadas legíveis, hierarquia de títulos, `prefers-reduced-motion` mantido.
- **Ilustrações:** `js/ui/illustration.js` (slots com proporção fixa, carregamento preguiçoso, faixa neutra sem
  imagem); só imagens aprovadas em `dev/content/illustrations.json` (vazio) → `data/illustrations.js`; arquivos em
  `img/illustrations/` entram no cache offline (build aceita webp/jpg).

## 4. Testes da remodelagem (Chromium headless, 412 px, sequência)

Ver tabela no relatório da sessão; evidências na cópia de trabalho. Unitários com `remodel.test.js` (ciclo, estados,
CP01, traduções, palavra isolada, persistência, calibração). Suítes E2E adaptadas ao comportamento aprovado (histórias
no lugar do seletor de avatar, Início orientador, abas, seis etapas) mantendo os mesmos objetivos de cobertura.
Não testado: aparelho físico (Galaxy S25+), Samsung Internet, app instalado real (só display-mode simulado).

## 5. Limitações conhecidas

- Voz do áudio britânica adulta (gerador offline sem voz infantil). Kokoro v1.0 foi baixado do GitHub nesta sessão
  (não versionado); regenerar exige `pip install kokoro-onnx` e os arquivos do modelo.
- Reconhecimento local Moonshine tiny (~38 MB): modelo pequeno; transcrição não comprova pronúncia; sem avaliação
  acústica. A calibração é só da tela atual.
- Pacote offline ~14,5 MB.

## 6. Backlog

1. Integrar as ilustrações aprovadas (personagens e cenários) em `dev/content/illustrations.json`.
2. Voz infantil local para o Lukinhas.
3. Ampliar vocabulário de sessões pequenas (K02, K03, L05, L06) só com material aprovado.
4. Teste físico no Galaxy S25+ da branch `remodelagem` antes de publicar.

## 7. Próximo passo

Validação da branch `remodelagem` no Galaxy S25+ (servida localmente ou numa publicação autorizada). Com aprovação
explícita: fast-forward de `gh-pages`. Não reconstruir; não alterar conteúdo aprovado; não reintroduzir gamificação.
