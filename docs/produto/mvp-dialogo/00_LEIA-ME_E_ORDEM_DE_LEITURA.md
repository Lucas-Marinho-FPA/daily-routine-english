# Daily Routine English — Pacote de Arquitetura e Implantação do MVP

**Versão:** 1.0 · **Data:** 11/11/2026  
**Finalidade:** fornecer ao Claude Code/CoWork a especificação de produto, engenharia pedagógica, arquitetura funcional/técnica, critérios de qualidade, conteúdo autoral e referências visuais para implementar a nova experiência de atividades por diálogo.

## Decisões centrais

1. A atividade de diálogo terá cinco fases sequenciais: vocabulário; escuta e reconstrução escrita; tradução do diálogo; compreensão auditiva; leitura em voz alta.
2. O domínio é **individual por palavra/expressão/frase**, com mínimo de 80% em cada item aplicável. Não se pode compensar um item fraco com a média dos demais.
3. A compreensão tem dez questões objetivas por atividade; proposta de aprovação: pelo menos 8/10, com correção explicada após o envio e nova tentativa das questões erradas.
4. A tradução não aparece antes da tentativa. O aluno produz a tradução; a avaliação semântica acontece depois.
5. O aplicativo será **híbrido**: operações locais/offline quando confiáveis; inteligência generativa online quando necessária para qualidade. O modo offline nunca simula avaliação generativa.
6. Sem gamificação de recompensa: **não implementar XP, pontos, moedas, níveis, streaks, ranking ou recompensas**. Múltipla escolha, desafios, feedback e indicadores de domínio são formatos didáticos, não gamificação de recompensa.
7. Preservar a identidade visual vigente do DRE, herdada do Bora de Inglês. Os mockups são referência de composição/fluxo, não autorização para trocar marca, paleta, tipografia, ícones ou linguagem visual.
8. Os sete documentos de The Story of John são o conteúdo autoral inicial. Não substituir nem alterar os acervos originais validados.

## Ordem de leitura obrigatória

1. `docs/01_DECISOES_DE_PRODUTO_E_ESCOPO.md`
2. `docs/02_ENGENHARIA_PEDAGOGICA_E_FLUXO.md`
3. `docs/03_ARQUITETURA_FUNCIONAL_E_ESTADOS.md`
4. `docs/04_ARQUITETURA_TECNICA_HIBRIDA.md`
5. `docs/05_MODELO_DE_DADOS_E_CONTRATOS.md`
6. `docs/06_UX_UI_E_IDENTIDADE_VISUAL.md`
7. `docs/07_TESTES_ACEITE_E_METRICAS.md`
8. `docs/08_PLANO_DE_IMPLANTACAO.md`
9. `09_REORGANIZACAO_EM_QUATRO_ETAPAS_ANALISE.md` — análise e proposta da reorganização em quatro etapas (2026-11-12; decisões pendentes)
10. `10_DOCUMENTO_FONTE_PEDAGOGICO_JOHN_P1_E01.md` — documento-fonte aprovado da remodelagem de john-p1-e01 em sete etapas (2026-11-13; implementado, ver `docs/dialogos.md`)
9. `conteudo/The_Story_of_John/` — sete partes e README editorial.

## Referências visuais

- `referencias_visuais/mockup_mobile_fluxo_aprovado.png`: referência mobile enviada/aprovada pelo Product Owner.
- `referencias_visuais/mockup_tela_dialogo_conceitual.png`: referência complementar da tela de diálogo.
- As imagens têm textos ilustrativos e eventuais inconsistências; **não são fonte de conteúdo nem especificação literal**.

## Como interpretar o pacote

- Decisões explícitas do Product Owner prevalecem sobre sugestões ou exemplos visuais.
- O código real prevalece sobre snapshots técnicos históricos: o agente deve inspecionar branch, commit, estrutura, serviços, contratos e testes atuais antes de alterar.
- Não inventar disponibilidade de áudio, capacidade de pronúncia, esquema de dados ou infraestrutura.
- Não remover, sobrescrever ou reescrever conteúdo já validado.
- Onde houver dependência externa, custo, credencial, política de privacidade ou decisão de fornecedor, implementar abstração/configuração segura e registrar a decisão; não contratar serviço, criar cobrança ou publicar sem aprovação.
