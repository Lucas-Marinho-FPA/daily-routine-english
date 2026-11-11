# Roadmap e Checklist Mestre
**Snapshot técnico de referência: auditoria de 08/11/2026. Atualizar Git antes de usar como estado corrente.**

Legenda: [x] evidência histórica; [~] parcial; [ ] não concluído/sem evidência; [?] confirmar.

| Fase | Objetivo | Estado registrado |
|---|---|---|
| 0. Base e preservação | Preservar versão, mapear branches e evidências | [x] Auditoria somente leitura |
| 1. Base pedagógica/conteúdo | Organizar jornadas, conteúdo, personagens, direitos | [~] Conteúdo amplo; lacunas/curadoria |
| 2. Inteligência de correção | Correção contextual e feedback confiável | [~] Motor existente; evolução a avaliar |
| 3. Conversation Practice | Ampliar diálogos e situações | [~] Dois módulos no snapshot |
| 4. Vocabulário progressivo | Revisão e domínio cumulativo | [~] Leitner e revisão existentes |
| 5. Atividades adaptativas | Adaptar prática a evidências de domínio | [ ] Sem evidência de conclusão |
| 6. Experiência integrada | Jornadas, continuidade e progresso | [~] MVP de jornadas registrado; confirmar branch |
| 7. Estabilização/release | Compatibilidade, offline, testes, docs e publicação | [~] PWA/build; validação física pendente |

## Snapshot Git de 08/11
- `gh-pages` publicada: `b194cee`; `mvp-jornadas` no mesmo SHA.
- `main`: `13de9d2`, 27 commits atrás.
- `remodelagem`: `8d5ac0c`, 7 commits próprios e sem 13 commits publicados.
- `cp-publicacao`: `b582c29`.
- Workflow Pages 22 terminou com sucesso em `b194cee`.
- Rebuild de `dev/` idêntico byte a byte à branch publicada.
- Site efetivamente servido não foi confirmado naquela auditoria.
**Não assumir que esses SHAs continuam atuais.**

## Backlog de riscos/investigações
1. Confirmar conteúdo efetivamente servido.
2. Testar aparelho físico e Samsung Internet.
3. Investigar 293/312 falas da Karla sem áudio embutido.
4. Investigar 349 arquivos de áudio sem referência direta.
5. Confirmar voz do sistema offline.
6. Rever backup: JSON não incluía o Curso.
7. Resolver divergência entre `remodelagem` e `gh-pages` sem integração presumida.
8. Atualizar README/CLAUDE/HANDOFF obsoletos.
9. Rever exposição pública de `dev/` e `docs/`.
10. Definir tratamento/licença do FreeDict (GPL-2.0+) e licença própria do repositório.
11. Rever assets/personagens pendentes.
12. Confirmar retirada de gamificação na branch publicada.

## Diretriz transversal de execução — DEC-012 (10/11/2026)
- [x] Estabelecer autonomia operacional: investigar e resolver pendências internas sem repassar ao usuário conciliações, identificadores ou recados entre ferramentas.
- [x] Restringir escalonamento ao usuário a decisões de sua alçada e bloqueios externos incontornáveis.
- [x] Exigir que relatórios tragam diagnóstico, impacto, solução/encaminhamento e ação executada/próximo passo.
- [x] Preservar decisões e validações concluídas; reabrir somente com evidência concreta.

## Próxima retomada
- [ ] Consultar branch padrão/publicada, commits e workflow atual.
- [ ] Ler handoff e relatórios mais recentes.
- [ ] Identificar último escopo autorizado.
- [ ] Atualizar somente itens impactados.
- [ ] Registrar evidências, pendências e próximo passo ao fechar sprint.

Checklist cumulativo: não apagar concluídos; reabrir apenas por regressão ou mudança de requisito.

## Diretriz transversal de operação (10/11/2026)
- [x] Separação de responsabilidades: Produto e Desenvolvimento não decide pedagogia, não altera a Base Pedagógica e não cria/atribui códigos de-para. Demandas desse tipo pertencem ao projeto Base de Conhecimento.
- [x] Comunicação objetiva: respostas curtas; detalhar procedimentos somente quando solicitado.
- [x] Autonomia operacional: resolver questões técnicas/administrativas dentro do escopo; não usar o usuário como intermediário entre projetos ou ferramentas.
- [x] Consulta seletiva: consultar documentos-fonte pertinentes quando houver dúvida ou conflito, sem reler todo o pacote a cada interação.
- [ ] Confirmar que as instruções equivalentes foram incorporadas às configurações permanentes dos projetos envolvidos.
  - [~] 11/11/2026: incorporadas ao repositório (branch `governanca`): `CLAUDE.md` como ponto de entrada, `docs/governanca/PAPEIS_E_RESPONSABILIDADES.md` como fonte central (DEC-013), pacote oficial em `docs/produto/`, continuidade no `HANDOFF.md`. Falta: configurações dos projetos fora do repositório (ChatGPT e Base de Conhecimento), a cargo de cada projeto.
