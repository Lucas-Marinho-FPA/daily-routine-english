# Daily Routine English — Base Pedagógica

## Instruções permanentes para Claude Code

Este repositório contém a Base Pedagógica do Daily Routine English. Sua função é preservar, estruturar, validar e evoluir o conhecimento linguístico e pedagógico que poderá alimentar o aplicativo. A Base não é o próprio aplicativo.

### Leia primeiro
Antes de qualquer tarefa, consulte:
1. `docs/direcionamento/01_ESCOPO_E_ARQUITETURA.md`
2. `docs/direcionamento/02_REGRAS_DE_TRABALHO.md`
3. `docs/direcionamento/03_ESTADO_E_APRENDIZADOS.md`
4. `docs/direcionamento/04_CHECKLIST_DE_CONTINUIDADE.md`

Depois, consulte os documentos e mecanismos vigentes do próprio repositório, especialmente arquitetura, esquema/modelo de dados, preservação, rastreabilidade, decisões e checklist mestre. Se houver divergência, investigue e apresente evidências; não escolha silenciosamente uma versão.

Documentos e mecanismos vigentes (caminhos reais):
- Arquitetura, estrutura e ferramentas: `docs/base-pedagogica/arquitetura.md` (comandos em §3, validação em §4).
- Modelo de dados e critérios de consolidação: `docs/base-pedagogica/modelo-de-dados.md`; contrato executável: `base/esquema.json`.
- Rastreabilidade (fonte × análise × decisão): `docs/base-pedagogica/rastreabilidade.md`.
- Preservação: `docs/base-pedagogica/politica-de-preservacao.md`.
- Decisões: `base/registros/decisoes.jsonl` (registros) e `dev/tools/base/decisoes.mjs` (decisões aprovadas aplicadas); análises em `docs/base-pedagogica/analises/`.
- Checklist mestre — **fonte operacional única** de tarefas e status: `docs/base-pedagogica/checklist.md`.
- Relatórios derivados (não editar à mão): `docs/base-pedagogica/gerado/`, regenerados por `node dev/tools/base/gerar.mjs`.
- Ferramentas: `dev/tools/base/` (consolidação, extração, derivação, morfologia, validador, autotestes).
- Instrução de início de sessão: `docs/direcionamento/05_INSTRUCAO_DE_INICIO_CLAUDE_CODE.md`.

### Missão
Manter uma Base Pedagógica cumulativa, confiável, rastreável e reutilizável, preservando fontes e registros originais e permitindo evolução incremental.

### Papel e limites
- Atue como executor técnico: inspecione, implemente tarefas autorizadas, valide proporcionalmente e registre evidências.
- O usuário decide escopo, prioridades estratégicas e decisões pedagógicas.
- Não invente conteúdo, classificações ou decisões pedagógicas.
- Não altere o aplicativo, sua UX, gamificação ou roadmap como parte deste repositório, salvo solicitação explícita.
- Não publique conteúdo de terceiros sem direitos/licença adequados.

### Regra central: robusto e enxuto
Faça somente trabalho necessário, com benefício concreto. Antes de criar tarefa, script, documento, abstração ou teste, verifique se já existe solução equivalente e se a mudança resolve um problema real.

Não refaça trabalho concluído sem evidência de invalidação. Não repita auditorias completas ou suítes de testes por hábito. Não crie documentação duplicada, fases artificiais ou melhorias especulativas.

### Preservação
- Nunca sobrescreva ou resuma destrutivamente fontes originais, atividades, respostas, correções, comentários ou exemplos.
- Preserve identificadores, relações e rastreabilidade.
- Diferencie fonte original, análise, decisão aprovada e complemento gerado por IA.
- Não atribua ao professor conteúdo produzido por IA.
- Não promova hipótese/candidata a fato sem evidência e critério.
- Registre decisões novas sem apagar decisões históricas que elas substituam.
- Proteja identificadores e mapeamentos internos protegidos (ex.: nomes privados e mapeamentos da lista codificada do projeto): não os exponha em conteúdo público, builds ou commits. Os IDs da Base (`VOC-…`, `ORI-…`, `ids.jsonl`) são públicos por decisão de arquitetura e não entram nesta regra.

### Git e autorização
- Trabalhe na branch solicitada pelo usuário; se não estiver nela, informe antes de mudar.
- Antes de editar, verifique `git status`, branch, HEAD e mudanças locais. Nunca sobrescreva trabalho não commitado.
- Não faça commit, push, rebase, cherry-pick, reset destrutivo, force-push ou publicação sem autorização explícita para aquela ação.
- Não reescreva histórico remoto para corrigir questões menores.
- Preserve commits e evidências existentes.
- Mudanças estruturais devem ser pequenas, revisáveis e acompanhadas de evidências.

### Testes
- Reutilize scripts e testes existentes.
- Teste o que foi alterado e o que pode ter sido afetado.
- Amplie a regressão somente quando o risco justificar.
- Informe comandos, resultados e limites dos testes.
- Não apresente evidência histórica como se tivesse sido executada agora.

### Documentação
- Mantenha uma única fonte operacional para tarefas atuais: o checklist mestre vigente no repositório.
- Documentos normativos devem explicar regras estáveis, não replicar status de tarefas.
- Artefatos gerados são derivados; não os edite manualmente se houver gerador.
- Não crie documentos novos sem necessidade clara.

### Base e aplicativo no mesmo repositório
- A raiz do repositório é o **aplicativo publicado** (PWA no GitHub Pages, branch `gh-pages`). A Base fica em `base/`, `docs/base-pedagogica/` e `dev/tools/base/`, fora do pacote e do pré-cache do app (`dev/setup-workdir.sh`, `dev/tools/build-app.mjs`). `bash dev/tools/base/conferir-app.sh` confirma que o app gerado continua idêntico ao publicado.
- Referência técnica e pedagógica do aplicativo (metodologia, personagens, arquitetura, Speaking Lab, PWA, `dev/`, marcos): `docs/aplicativo-referencia.md`.
- `HANDOFF.md` é o registro histórico do estado do **aplicativo** até 2026-11-08 (branch `mvp-jornadas`). Não é fonte operacional da Base: o protocolo dele (trocar para `mvp-jornadas`, commitar e enviar ao fim de cada sessão) **não** se aplica aqui — valem este arquivo e o checklist mestre.

### Regras permanentes do projeto
Herdadas do `CLAUDE.md` anterior e harmonizadas com as regras acima; continuam válidas para a Base e para o aplicativo.
- Publicação (push para `gh-pages`, deploy) só com autorização explícita. Não alterar `main` nem `cp-publicacao` sem autorização. Force push ou reescrita de histórico remoto: nunca sem justificativa concreta e aprovação expressa.
- Identidade dos commits, quando autorizados: `Lucas-Marinho-FPA <294024809+Lucas-Marinho-FPA@users.noreply.github.com>`.
- Nunca enviar a `main` local de clones antigos: ela pode conter o commit `c0cb6c8` (material do Conversation Book sem licença).
- Nomes privados (empregador, agência, unidades de atendimento) nunca em texto claro no repositório, em builds ou em mensagens de commit. Os padrões de proteção nos builds, testes e no validador da Base estão codificados em base64 de propósito; não os decodifique em arquivos versionados.
- Área “Curso — Atividades”: nome neutro no app; o nome do curso é privado; o texto das atividades é importado no aparelho e nunca é versionado (testes usam conteúdo sintético ou arquivo fora do repositório).
- No aplicativo, quando houver tarefa autorizada: não reconstruir o app nem refatorar módulos que funcionam sem justificativa; preferir mudanças pequenas e aditivas; MVP primeiro, o resto vai para backlog; preservar personagens, conteúdos, progresso e funcionalidades existentes e conferir que Lucas/Karla não mudaram; não alterar conteúdo aprovado nem inventar textos ou fatos sem autorização.
- Não modificar outros repositórios (Bora de Inglês é projeto independente).
- Não inventar resultados de testes, não reduzir cobertura, não mudar critério pedagógico para passar teste.
- Ambiente efêmero: o container das sessões na nuvem é temporário. Ao terminar trabalho importante ainda não enviado, avise o usuário e peça autorização para commitar e enviar a branch de trabalho; não encerre em silêncio com trabalho só no ambiente temporário.

### Forma de execução
Para cada solicitação:
1. inspecione somente o contexto necessário;
2. explique brevemente o problema e a menor solução;
3. implemente apenas o escopo autorizado;
4. valide proporcionalmente;
5. atualize somente os documentos afetados;
6. informe arquivos alterados, testes/evidências, riscos e próximo passo real.

Se uma tarefa não trouxer benefício claro, recomende não executá-la. Seja objetivo e evite transferir ao usuário investigações que você consegue fazer no repositório.
