# Arquitetura Técnica

## Snapshot auditado em 08/11/2026
- Web app estático, HTML/CSS/JavaScript puro, sem framework.
- Bundle em `dist/app.js`; build por `dev/tools/build-app.mjs`.
- Dados globais carregados antes do bundle: `DRG_CONTENT`, `DRG_CHARACTERS`, `DRG_JOURNEYS`, `DRG_AUDIO`.
- `js/main.js` inicializa app, roteamento por hash e abas.
- `js/engine/`: agenda, módulos, exercícios, progresso, perfis, checker, fala livre e Curso.
- `js/ui/`: telas; `js/audio/`: áudio; `js/store/db.js`: persistência.

## Persistência
IndexedDB `drg` v2, stores `kv`, `recordings`, `audio`. Gravações eliminadas após sete dias. Curso em `kv/course`. Backup JSON não incluía Curso. Confirmar no código antes de migrações.

## Voz
Moonshine tiny + onnxruntime-web (~39 MB, MIT), baixado após consentimento para cache local. Chrome Speech Recognition no modo compatível. Voz do sistema offline não confirmada para todos os cenários. Transcrição não equivale a avaliação de pronúncia.

## PWA/offline
Pré-cache de 1.807 caminhos com hash. Atualização incremental, retomada e aplicação explícita da nova versão; limpeza de cache antigo após abrir a nova versão. Nenhuma dependência externa identificada no bundle analisado. Offline testado em Chromium; aparelho físico/Samsung Internet não confirmados.

## Regras técnicas
- Priorizar local/offline, privacidade e compatibilidade Android.
- Não adicionar API, CDN, analytics ou serviço externo sem aprovação.
- Manter build reproduzível; alterar fontes, não artefatos gerados diretamente.
- Não misturar branch de trabalho e branch publicada sem plano.
- Confirmar estado Git atual antes de qualquer sprint.

## Branches históricas
`gh-pages` b194cee; `mvp-jornadas` b194cee; `main` 13de9d2; `remodelagem` 8d5ac0c; `cp-publicacao` b582c29. Valores são snapshot, não estado atual.
