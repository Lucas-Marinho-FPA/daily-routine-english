# Daily Routine English — ponto de entrada

Ponto de entrada comum para agentes de IA e colaboradores. Leia este arquivo, depois o `HANDOFF.md` (estado atual) e,
conforme a tarefa, só os documentos pertinentes indicados abaixo — não é preciso reler tudo a cada sessão.

## Quem decide, quem planeja, quem executa, quem audita

| Papel | Quem |
|---|---|
| **Decide** | Product Owner (o usuário): visão, prioridades e aprovações de sua alçada |
| **Planeja e audita** | ChatGPT — Produto, Arquitetura e Auditoria (estrutura demandas e critérios de aceite; audita no GitHub) |
| **Executa** | Claude Code / CoWork — Executor Técnico (inspeciona, implementa, testa, registra evidências no Git) |
| **Responde pelo conteúdo** | Projeto Base de Conhecimento (conteúdo, curadoria, decisões e validação pedagógicas, códigos/de-para) |

Fonte central e completa (atribuições, limites, matriz de decisão, fluxo, escalonamento, interface com a Base):
**`docs/governanca/PAPEIS_E_RESPONSABILIDADES.md`**.

Fluxo: ChatGPT estrutura → Claude inspeciona o estado real → implementa o escopo autorizado → testa e registra
evidências → ChatGPT audita no GitHub → correções pelo mesmo caminho → o Product Owner entra só quando a decisão é
dele. **O usuário não é mensageiro entre ferramentas ou projetos:** o contexto circula pelo repositório (`HANDOFF.md`,
commits, documentos).

## Para onde ir, por área

**Produto e Desenvolvimento** (este conjunto de branches do aplicativo):
- Instruções permanentes e decisões: `docs/produto/00_INSTRUCOES_PERMANENTES.md`, `docs/produto/11_HISTORICO_DE_DECISOES_E_PENDENCIAS.md`.
- Visão, roadmap/checklist mestre, arquitetura pedagógica e técnica, funcional, UX/UI, dados, sprints, testes:
  `docs/produto/02`–`10` (índice em `docs/produto/LEIA-ME.md`).
- Referência técnica e pedagógica do aplicativo (código, PWA, Speaking Lab, `dev/`, build, testes, marcos):
  `docs/aplicativo-referencia.md` e os `docs/*.md` temáticos (ex.: `docs/curso-atividades.md`).

**Base de Conhecimento** — acervo pessoal e privado (atividades, respostas, correções, Base Mestra, de-para) com
governança própria. O **acervo validado** (Base Mestra, acervos das atividades, de-para) **não está neste repositório**
e não deve vir para cá: o repositório é público. É mantido pelo projeto Base de Conhecimento, nas fontes desse projeto.
Desde 2026-11-11 a **governança** da Base (documentos `00`–`09`, sem o de-para) está publicada na branch
`base-conhecimento`, que é área da Base: o produto não a altera. (Registro anterior, verdadeiro quando escrito:
“não está em nenhuma das branches”.)

**Base Pedagógica (branch `base-pedagogica`)** — camada **diferente**: dados estruturados públicos derivados do
conteúdo próprio do app, com instruções próprias nessa branch (`CLAUDE.md`, `docs/direcionamento/`,
`docs/base-pedagogica/checklist.md`). Não é a Base de Conhecimento; a relação de autoridade entre as duas aguarda
decisão do Product Owner. Não altere essa branch a partir de tarefas de produto.

O produto **implementa** decisões pedagógicas aprovadas, mas **não define** pedagogia, não cria, altera, valida nem
atribui códigos (SRC, MAT, ACT, EX, VOC) nem de-para: encaminha a demanda (seção “Demandas para a Base de
Conhecimento” do `HANDOFF.md`) e segue com o trabalho técnico independente.

## Antes de agir (executor)

1. Conferir branch, `HEAD`, árvore de trabalho e remoto; não presumir que SHAs/branches citados em documentos
   continuam atuais. Branch de trabalho ≠ branch publicada (`gh-pages`).
2. Ler o `HANDOFF.md` e o pedido; definir escopo, fora de escopo, riscos e aceite. Em atividades técnicas (código,
   build, PWA, testes, áudio, Speaking Lab, `dev/`), consultar **`docs/aplicativo-referencia.md`** e o `docs/*.md`
   temático da área antes de alterar qualquer coisa.
3. Implementar só o autorizado; testar proporcionalmente (`docs/produto/10_POLITICA_DE_TESTES_E_QUALIDADE.md`).
4. Registrar no `HANDOFF.md` o que foi feito, evidências, pendências e próximo passo; atualizar checklist sem apagar
   histórico.

## Regras permanentes (valem para todas as sessões)

- Não reconstruir o app nem refatorar módulos que funcionam sem justificativa; preferir mudanças pequenas e aditivas.
- Preservar personagens, conteúdos, progresso e funcionalidades existentes; conferir que Lucas/Karla não mudaram.
- Não alterar conteúdo aprovado nem inventar textos/fatos sem autorização.
- MVP primeiro; o resto vai para backlog.
- Não inventar resultados de testes; não reduzir cobertura; não mudar critério pedagógico para passar teste.
- **Não publicar** (push para `gh-pages`, deploy) **sem autorização explícita**; não alterar `main` nem
  `cp-publicacao` sem autorização; **nunca** force push nem reescrita de histórico; preservar autoria dos commits
  (identidade: `Lucas-Marinho-FPA <294024809+Lucas-Marinho-FPA@users.noreply.github.com>`).
- **Commit e push** de branch de trabalho somente com autorização explícita do Product Owner (por entrega ou
  autorização permanente registrada no `HANDOFF.md`).
- **Nunca enviar a `main` local** de clones antigos: ela pode conter o commit `c0cb6c8` (material do Conversation Book
  sem licença).
- Nunca publicar nomes do empregador, da agência ou de unidades de atendimento do usuário (dados privados).
- Nomes privados (empregador, agência, unidade) nunca em texto claro no repositório: os padrões de proteção nos builds
  e testes estão codificados em base64 de propósito; não os decodifique em arquivos versionados.
- Não modificar outros repositórios (Bora de Inglês).
- Não adicionar API, CDN, analytics, serviço externo, dependência de nuvem ou custo sem aprovação.
- Não publicar material de terceiros sem direitos/licença; o texto das atividades do curso é importado no aparelho e
  nunca é versionado.
- Sem XP, níveis, recompensas ou streaks novos; personagens são protagonistas narrativos, não perfis.
- **Ambiente efêmero:** nenhuma sessão é encerrada com trabalho importante só no ambiente temporário sem avisar o
  Product Owner e pedir autorização para commitar e enviar a branch de trabalho (nunca a produção sem autorização).
