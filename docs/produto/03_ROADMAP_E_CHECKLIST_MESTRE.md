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
11. Rever assets/personagens pendentes. — [~] 11/11/2026: avatares oficiais (estado `idle`) de Lucas, Lukinhas e Heitor publicados (`gh-pages` `1f39b60`); faltam os demais estados de todos e a imagem da Karla. Avatar oficial da Karla integrado (11/11/2026, sem commit/publicação; ver `HANDOFF.md`).
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

## Entregas de 11/11/2026 (registro cumulativo)
- [x] MVP de diálogo em cinco fases (The Story of John), 403 questões, rodada proporcional, fase 5 independente — publicado (`gh-pages` `a6e8bbb`, workflow nº 27). Detalhes: `docs/dialogos.md`, `HANDOFF.md`.
- [x] Avatares oficiais de Lucas e Lukinhas no padrão do Heitor — publicado (`gh-pages` `1f39b60`, workflow nº 28, build `ee69e6bf46b5`); testes e evidências no `HANDOFF.md`.
- [ ] Reconhecimento de voz nas fases 1 e 5: diagnóstico feito (expressões de 2+ palavras sem recorte de silêncio → transcrição vazia); correção aguarda autorização própria.
  - [x] Correção implementada e testada (recorte nas fases 1 e 5, 2ª passada, corte do reconhecedor → inconclusivo, léxico): ensaio com Moonshine real 0 inconclusivas em 102 gravações (antes 16 vazias); `voice` 5/5, `dialogue` 14/14, `asr-local` 22/22. Falta validar com voz humana no Galaxy S25+.
- [ ] Diferenças visuais entre celulares: investigação em etapa separada.
  - [x] Diagnóstico registrado no `HANDOFF.md` (V-01 a V-09); causa da divergência de tema: padrão “automático” seguia o modo do sistema.
  - [x] Tema azul padrão + sol/lua no cabeçalho + tema claro (mockup aprovado): publicado (build `bcfa17dbf2ec`); falta validação nos dois celulares.
- [x] Avatar oficial da Karla no padrão dos demais: publicado (build `bcfa17dbf2ec`).
- [x] Descrições aprovadas dos quatro personagens nos cartões de escolha: publicado (build `bcfa17dbf2ec`).
- [x] Publicação consolidada (voz + temas + Karla + descrições) — publicado (`gh-pages` `1ba9b34`, workflow nº 29, build `bcfa17dbf2ec`); verificação no `HANDOFF.md`.
- [ ] Validação no Galaxy S25+ das entregas de 11/11.
