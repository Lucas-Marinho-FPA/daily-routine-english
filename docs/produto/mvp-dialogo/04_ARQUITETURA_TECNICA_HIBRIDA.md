# 04 — Arquitetura Técnica Híbrida (Online + Offline)

## Princípio

A qualidade pedagógica prevalece sobre a restrição de operar exclusivamente offline. O DRE deve oferecer experiência híbrida:
- local/offline para conteúdo baixado, áudio disponível, atividades determinísticas, progresso e revisão;
- online para avaliação generativa/semântica e capacidades que exijam serviço/modelo remoto de qualidade superior.

Offline não deve fingir que executou IA generativa. Resultado pendente permanece pendente.

## Componentes lógicos

### Frontend/PWA
Interface mobile-first; cache de conteúdo/áudio; gravação local consentida; fila de tentativas; estado de conectividade; apresentação de avaliação.

### Learning Engine
Orquestra cinco fases, regras de domínio, itens, tentativas e progressão. Não conhece detalhes de fornecedor de IA.

### Local Evaluation Adapters
Correção determinística, gabaritos, normalização, múltipla escolha, comparação textual segura e ASR local quando suportado. Só pode aprovar quando a evidência for suficiente.

### AI Gateway (backend seguro)
Intermedia solicitações para provedores/modelos. Autentica usuário/sessão, valida payload, aplica limites, controla custos, registra telemetria mínima e protege credenciais.

### Evaluation Service
Executa rubricas versionadas para tradução semântica, resposta aberta, explicação pedagógica e, se houver tecnologia adequada, avaliação avançada de fala.

### Sync Manager
Fila local, idempotência, retry com backoff, reconciliação de status e proteção contra duplicidade.

### Persistence
IndexedDB/local store para progresso, tentativas pendentes, conteúdo e cache. Backend pode guardar resultados sincronizados se o produto tiver conta/sincronização autorizada; confirmar arquitetura real antes de implementar.

## Fluxo de avaliação online

1. Frontend cria tentativa com ID único e persiste localmente.
2. Envia apenas os dados necessários ao AI Gateway por HTTPS.
3. Gateway valida identidade, limite e esquema.
4. Evaluation Service aplica rubrica versionada e chama provedor configurado.
5. Resposta estruturada é validada no backend.
6. Frontend recebe status/resultado e persiste.
7. Se a rede falhar, a tentativa permanece `pending_evaluation` e pode ser reenviada idempotentemente.

## Segurança

- Nunca colocar API key em JS, HTML, conteúdo JSON, Git ou armazenamento do cliente.
- Não chamar diretamente APIs que exigem segredo a partir do navegador.
- Não logar áudio/texto integral sem necessidade e consentimento.
- Limitar tamanho, frequência e custo; proteção contra abuso.
- Validar entradas e saídas com schema.
- Não executar conteúdo retornado pelo modelo.
- Respostas do modelo são dados não confiáveis: validar e normalizar antes de exibir/usar em progressão.
- Consentimento claro para envio de áudio e texto.
- Definir retenção, exclusão, exportação e política de privacidade.

## Independência de fornecedor

Criar interface/adapter provider-neutral. Não acoplar domínio pedagógico a um único fornecedor. A seleção de provedor deve considerar:
- qualidade em português brasileiro e inglês britânico;
- avaliação semântica de tradução;
- variantes aceitas e explicações;
- capacidade de áudio/fala se necessária;
- latência, custo por atividade e limites;
- política de dados, retenção e região;
- disponibilidade e fallback.

Não escolher ou contratar serviço pago sem aprovação do Product Owner. Primeiro inspecionar infraestrutura já existente e apresentar recomendação técnica/econômica se não houver backend.

## Política online/offline por fase

| Operação | Offline | Online |
|---|---|---|
| Abrir conteúdo previamente baixado | Sim | Não necessário |
| Tocar áudio em cache | Sim | Download quando permitido |
| Ouvir 3 vezes | Sim, com áudio disponível | Sim |
| Pronúncia via ASR local | Quando modelo instalado e confiável | Fallback/serviço especializado se aprovado |
| Escrita por escuta | Resposta pode ser salva | Avaliação avançada/variantes |
| Tradução semântica | Guardar tentativa pendente | Avaliação padrão |
| Questões objetivas existentes | Sim | Não necessário |
| Geração/adaptação de perguntas | Não | Sim |
| Leitura em voz alta | ASR local, com limites explícitos | Avaliação especializada quando aprovada |
| Progresso e retomada | Sim | Sincroniza quando disponível |

## Importante: infraestrutura

O snapshot anterior descreve GitHub Pages e frontend estático, sem backend seguro. GitHub Pages não pode guardar segredo de API. O Claude Code deve inspecionar o estado real e propor integração segura com infraestrutura existente ou um backend mínimo. Não criar projeto cloud, função paga, banco externo ou cobrança sem aprovação explícita.

## Compatibilidade com o app atual

Snapshot histórico: HTML/CSS/JS puro; bundle em `dist/app.js`; fontes em `js/`; IndexedDB `drg`; dados globais `DRG_CONTENT`, `DRG_CHARACTERS`, `DRG_JOURNEYS`, `DRG_AUDIO`; Moonshine local. Isso precisa ser confirmado no repositório/branch atuais antes de alterar.
