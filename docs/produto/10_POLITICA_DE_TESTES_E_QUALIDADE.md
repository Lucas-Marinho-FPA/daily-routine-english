# Política de Testes e Qualidade

## Princípio
Testar o que mudou e o que pode ser afetado. Não repetir bateria completa sem justificativa.

## Snapshot de 08/11
19 arquivos unitários, 216 testes contabilizados; execução: 215 aprovados, 0 reprovados, 1 ignorado (caso Q4 depende do arquivo do Curso). Suítes E2E Chromium existentes: run, run-pages, update-transition, asr-local, course, wordpractice, pwa, mvp, characters, lukinhas, journey e storage. E2E não foram executados na auditoria. Sem medição de cobertura. Aparelho físico e Samsung Internet não testados.

## Matriz de impacto
| Alteração | Teste pertinente |
|---|---|
| Conteúdo | schema, IDs, referências e fluxo afetado |
| Correção | unitários do checker e regressões pertinentes |
| Progressão/revisão | motor, persistência e jornada afetada |
| Áudio/voz | áudio/ASR, permissões e falhas |
| IndexedDB/backup | persistência, migração, exportação/restauração |
| PWA/SW | build, cache, transição e retomada |
| UX/navegação | E2E e conferência visual dos fluxos |
| Build/release | build reproduzível e smoke test |

## Aceite
Resultado reproduzível; sem regressões relacionadas; mensagens claras; offline preservado quando aplicável; sem chamadas externas não aprovadas; persistência correta; evidências com comando, ambiente e resultado.

## Regressão
Repetir testes quando código compartilhado/contrato mudar, houver bug reportado, evidência de impacto ou necessidade de release. Não reabrir validação de conteúdo já confirmada pelo usuário/professor sem motivo concreto.

## Dispositivo físico
Planejar validação em aparelho real quando a mudança depender de navegador, microfone, PWA, cache ou áudio. Não bloquear tarefas não relacionadas.
