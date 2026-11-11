# Papéis e responsabilidades — Daily Routine English

**Fonte central vigente** da divisão de autoridade, atribuições, limites e fluxo de trabalho entre os participantes.
Vigente desde 11/11/2026 (DEC-013). Consolida `docs/produto/01_PAPEIS_E_RESPONSABILIDADES.md` (registro de 10/11/2026,
preservado) e a diretriz DEC-012. Em caso de divergência entre documentos sobre **quem decide, planeja, executa ou
audita**, vale este arquivo; sobre o conteúdo das decisões, vale a hierarquia de fontes de
`docs/produto/00_INSTRUCOES_PERMANENTES.md`.

## 1. Quem é quem

| Papel | Quem | Em uma frase |
|---|---|---|
| Decide | **Product Owner** (o usuário) | Define visão, prioridades e objetivos; aprova o que é de sua alçada (seção 3). |
| Planeja e audita | **ChatGPT** — Produto, Arquitetura e Auditoria | Estrutura requisitos, arquitetura, roadmap e critérios de aceite; audita no GitHub o que foi entregue. |
| Executa | **Claude Code / CoWork** — Executor Técnico | Inspeciona o repositório, implementa o escopo autorizado, testa e registra evidências no Git. |
| Responde pelo conteúdo | **Projeto Base de Conhecimento** | Conteúdo, curadoria, decisões e validação pedagógicas (inclusive com o professor) e códigos/de-para. |

## 2. Atribuições e limites

### Product Owner — usuário
- Define visão, prioridades, público, objetivos e limites.
- Aprova decisões relevantes de produto, pedagogia, UX estrutural, arquitetura, escopo, custos, privacidade,
  direitos/licenciamento e publicação.
- **Não** executa tarefas operacionais e **não** é intermediário entre ferramentas ou projetos.

### ChatGPT — Produto, Arquitetura e Auditoria
- Mantém a visão integrada do produto: requisitos, arquitetura, roadmap, checklist mestre e critérios de aceite.
- Analisa riscos e dependências; estrutura cada demanda antes da execução (necessidade, escopo, fora de escopo, aceite).
- Consulta o GitHub para acompanhar e **auditar** o que foi implementado: commits, diffs, arquivos, testes e evidências.
- Identifica divergências e solicita correções ao executor, com o ajuste esperado.
- **Limites:** não assume autoridade de execução sobre o repositório quando não tem acesso de escrita; não decide
  pedagogia, não cria/edita conteúdo pedagógico e não atribui códigos de-para; não reabre decisões aprovadas sem
  evidência nova.

### Claude Code / CoWork — Executor Técnico
- Inspeciona o estado **real** do repositório antes de agir (branch, commit, árvore, remoto); não presume que SHAs,
  branches ou estados descritos em documentos continuam atuais.
- Implementa somente o escopo autorizado; atualiza arquivos e documentação diretamente no Git.
- Executa os testes pertinentes (`docs/produto/10_POLITICA_DE_TESTES_E_QUALIDADE.md`) e registra comandos, resultados,
  evidências e pendências — no `HANDOFF.md` e nas mensagens de commit.
- Resolve questões técnicas locais e reversíveis dentro do escopo, registrando a decisão e a justificativa.
- **Limites:** não altera decisões de produto ou pedagógicas por iniciativa própria; não cria, altera, valida nem atribui
  códigos de-para; não faz commit, push, merge ou publicação sem a autorização correspondente (seção 5).

### Projeto Base de Conhecimento
- Responsável por: conteúdo de aprendizagem, curadoria, decisões e validações pedagógicas (inclusive com o professor),
  Base Mestra e códigos/de-para de fontes e materiais (SRC, MAT, ACT, EX, VOC).
- **Onde está:** acervo pessoal e privado, com governança própria, mantido nas fontes do projeto Base de Conhecimento.
  **Não está neste repositório** nem em nenhuma das suas branches (verificado em 2026-11-11) e não deve vir para cá —
  o repositório é público. O de-para interno, a Base Mestra e os acervos das atividades nunca entram em repositório
  público, build ou artefato publicado.
- **Base Pedagógica (branch `base-pedagogica`)** é outra camada: dados estruturados públicos derivados do conteúdo
  próprio do app, com instruções próprias nessa branch (`CLAUDE.md`, `docs/direcionamento/`, checklist). Não é a Base
  de Conhecimento. A quem ela responde e como se relaciona com a Base de Conhecimento aguarda decisão do Product Owner;
  até lá, tarefas de produto não a alteram.
- **Produto e Desenvolvimento implementa** as decisões pedagógicas aprovadas, mas **não define** pedagogia: não cria,
  modifica, valida nem atribui códigos ou de-para; não altera conteúdo pedagógico, validações, Base Mestra ou Base
  Pedagógica. Dependências desse tipo são encaminhadas (seção 6), sem improvisação.

## 3. Matriz de decisão

| Atividade | Product Owner | ChatGPT | Claude/CoWork | Base de Conhecimento |
|---|---|---|---|---|
| Visão, prioridade e escopo | **Decide** | Estrutura e recomenda | Informa viabilidade | — |
| Regras e conteúdo pedagógicos | Aprova | Organiza a demanda (não define) | Implementa o que vier aprovado (não define) | **Define e valida** |
| Códigos/de-para e curadoria | — | — | — | **Responsável único** |
| UX/identidade | Aprova mudanças estruturais | Especifica e revisa | Implementa | — |
| Arquitetura | Aprova mudanças relevantes | Desenha e avalia | Inspeciona e implementa | — |
| Código | Define o resultado | Planeja e revisa | **Executa** | — |
| Testes | Recebe resultados | Define estratégia e audita | **Executa e evidencia** | Valida conteúdo, quando pedagógico |
| Commit/push de branch de trabalho | Autoriza (seção 5) | Confere | Executa após autorização | — |
| Publicação (`gh-pages`) | **Autoriza** | Confere critérios | Executa após autorização | — |
| Continuidade | Valida decisões relevantes | Mantém visão mestre e coordena | Atualiza `HANDOFF.md` e evidências | Mantém seu checklist |

**Escalonamento ao Product Owner** somente para: mudanças relevantes de produto, pedagogia, UX estrutural,
arquitetura, escopo, custos, privacidade, direitos/licenciamento e publicação — ou bloqueio externo incontornável,
depois de esgotadas as verificações internas. Toda escalada traz diagnóstico, impacto, recomendação e o que já foi
feito; uma pergunta única e objetiva.

## 4. Fluxo de trabalho

1. **ChatGPT estrutura** a necessidade: objetivo, escopo, fora de escopo, dependências, riscos e critérios de aceite.
2. **Claude inspeciona** o repositório e verifica o estado real antes de executar (o que diverge do pedido é
   reconciliado por evidência; só o que é da alçada do PO volta como pergunta).
3. **Claude implementa** dentro do escopo autorizado, em incrementos pequenos, numa branch de trabalho.
4. **Claude testa** o que mudou e o que pode ter sido afetado, e registra evidências (comandos, resultados, build,
   arquivos) no `HANDOFF.md` e no commit.
5. **ChatGPT audita no GitHub**: arquivos, diffs, testes e evidências da branch/commit informados.
6. **Ajustes:** havendo problema, ChatGPT aponta o ajuste necessário e Claude executa a correção (volta ao passo 2).
7. **Product Owner** participa só quando houver decisão reservada à sua autoridade (seção 3).

**Não intermediação.** O Product Owner não é mensageiro entre ChatGPT, Claude/CoWork e a Base de Conhecimento. O
contexto circula pelo repositório:
- **Entrada da tarefa:** a demanda estruturada pelo ChatGPT inicia a sessão de execução (é o único ponto em que o
  PO entrega um texto ao executor — e entrega o pedido, não recados intermediários).
- **Saída e auditoria:** tudo o que o ChatGPT precisa para auditar fica no GitHub — branch e commit da entrega,
  `HANDOFF.md` (estado, evidências, pendências) e documentos atualizados. O PO não transporta resultados.
- **Correções:** a solicitação do ChatGPT referencia branch/commit/arquivo; o executor parte do estado do Git, não de
  resumos.

## 5. Git, commit, push e publicação

- Confirmar sempre o estado real: branch atual, `HEAD`, árvore de trabalho e remoto. Branch de trabalho ≠ branch
  publicada; nunca misturar.
- **Branch publicada:** `gh-pages` (GitHub Pages). Publicar = avançar `gh-pages` por fast-forward, **somente com
  autorização explícita do PO** para aquela publicação; depois, confirmar o workflow e o conteúdo servido.
- **Commit e push de branch de trabalho:** somente com autorização explícita do PO (por entrega ou autorização
  permanente registrada no `HANDOFF.md`). Ao fim de uma sessão com trabalho importante ainda não enviado, o executor
  avisa e pede a autorização — o ambiente das sessões na nuvem é temporário.
- Nunca: force push, reescrita de histórico remoto, alteração de `main` ou `cp-publicacao` sem autorização; nunca
  enviar a `main` local de clones antigos (pode conter material sem licença).
- Identidade dos commits: `Lucas-Marinho-FPA <294024809+Lucas-Marinho-FPA@users.noreply.github.com>`.
- Nomes privados (empregador, agência, unidades) nunca em texto claro no repositório, em builds ou em commits.

## 6. Interface com a Base de Conhecimento

- **Contrato técnico de conteúdo para o Curso:** `docs/curso-atividades.md`, seção vigente “Catálogo, arquivo de
  estudo e exportação” (formato 1 do arquivo de estudo). A Base gera os arquivos; o produto só os importa no aparelho.
  Os arquivos de estudo pessoais e o de-para **não** entram no repositório público.
- **Demandas do produto para a Base:** registradas na seção “Demandas para a Base de Conhecimento” do `HANDOFF.md`
  (o que é preciso, por quê, contrato aplicável, impacto e o que segue em andamento sem ela). O trabalho técnico
  independente continua.
- **Respostas da Base:** chegam como artefatos curados (ex.: arquivos de estudo no formato do contrato), entregues
  para importação no aparelho e não versionados aqui; o produto não reinterpreta nem completa conteúdo pedagógico
  ausente.
- **Códigos:** atribuição de códigos (SRC, MAT, ACT, EX, VOC) pertence à governança da Base. “ACT-001” e semelhantes
  em `docs/curso-atividades.md`, no código e nos testes são **exemplos do formato** de importação, não códigos
  atribuídos.

## 7. Onde está cada coisa

| Necessidade | Fonte |
|---|---|
| Ponto de entrada | `CLAUDE.md` (raiz) |
| Papéis, limites e fluxo | este arquivo |
| Instruções permanentes, visão, roadmap, arquiteturas, UX, dados, sprints, testes, decisões (produto) | `docs/produto/00`–`11` e `docs/produto/LEIA-ME.md` |
| Referência técnica e pedagógica do aplicativo | `docs/aplicativo-referencia.md` e os `docs/*.md` temáticos |
| Estado atual, entregas, evidências, pendências e demandas | `HANDOFF.md` |
| Base de Conhecimento (acervo, Base Mestra, de-para, validações) | fora deste repositório: fontes do projeto Base de Conhecimento |
| Base Pedagógica (camada pública distinta) | branch `base-pedagogica`: `CLAUDE.md`, `docs/direcionamento/`, `docs/base-pedagogica/` |
