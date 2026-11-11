# Papéis e Responsabilidades

> **Fonte central vigente desde 11/11/2026 (DEC-013):** `docs/governanca/PAPEIS_E_RESPONSABILIDADES.md`. Este
> documento é preservado como registro de 10/11/2026; em divergência sobre papéis, vale a fonte central. Em particular, a menção à “Base Pedagógica” como atribuição do projeto Base de Conhecimento
> foi superada: a Base Pedagógica (branch `base-pedagogica`) é camada distinta, com relação pendente de decisão do PO.

| Atividade | Usuário | ChatGPT | Claude/CoWork |
|---|---|---|---|
| Visão, prioridade e escopo | Decide | Estrutura e recomenda | Informa viabilidade |
| Regras pedagógicas | Aprova | Organiza e propõe | Implementa |
| UX/identidade | Aprova | Especifica e revisa | Implementa |
| Arquitetura | Aprova mudanças relevantes | Desenha/avalia | Inspeciona/implementa |
| Código | Define resultado | Planeja/revisa | Executa |
| Testes | Recebe resultados | Define estratégia/revisa | Executa e evidencia |
| Publicação | Autoriza | Confere critérios | Executa após autorização |
| Continuidade | Valida decisões relevantes | Mantém visão mestre e coordena sem repassar recados | Atualiza evidências operacionais e resolve pendências técnicas |
| Resolução operacional | Decide apenas limites e exceções de sua alçada | Investiga, concilia fontes e encaminha solução | Executa investigação, correção e validação técnica |

## Usuário — dono do produto
Define objetivos, prioridades, público e limites; aprova decisões que alterem experiência, pedagogia, escopo ou publicação.

## ChatGPT — produto, arquitetura e coordenação
Mantém visão integrada, documentos e checklist; antecipa riscos; coordena a execução sem usar o usuário como intermediário; investiga divergências e propõe/implementa encaminhamentos dentro da alçada; revisa entregas sem reabrir decisões aprovadas sem evidência nova.

## Claude/CoWork — execução
Inspeciona o estado real, implementa o escopo autorizado, resolve decisões técnicas locais e reversíveis, preserva funcionalidades, executa testes pertinentes e entrega arquivos, comandos, resultados, evidências e pendências já triadas.

## Escalonamento
Decisões técnicas locais, reversíveis e de baixo impacto podem ser tomadas dentro do escopo. Alterações de regra de negócio, pedagogia, UX estrutural, arquitetura, custo, privacidade, direitos ou escopo exigem aprovação.

## Regra de não intermediação
ChatGPT e Claude/CoWork devem trocar contexto por meio dos documentos, handoffs e ferramentas disponíveis. O usuário não deve ser solicitado a copiar e colar recados entre eles. Perguntas ao usuário ficam restritas a decisões de sua alçada ou a bloqueios externos incontornáveis, depois de esgotadas as verificações internas.

## Fronteira entre Produto e Desenvolvimento e Base de Conhecimento

| Responsável | Responsabilidade | Limite |
|---|---|---|
| Usuário | Dono do produto; define prioridades e aprova decisões reservadas | Não atua como intermediário entre projetos ou ferramentas |
| ChatGPT — Produto e Desenvolvimento | Requisitos, arquitetura técnica, UX/UI, roadmap, coordenação, testes e revisão de entregas | Não decide pedagogia, não cria/edita conteúdo pedagógico e não atribui códigos de-para |
| Projeto Base de Conhecimento | Conteúdo, curadoria, Base Pedagógica, decisões e validações pedagógicas, códigos de-para | É a referência responsável por essas matérias |
| Claude/Cloud Work | Inspeção e execução técnica do escopo autorizado, testes e evidências | Não altera decisões de produto ou pedagógicas sem autorização/direcionamento |

Quando Produto e Desenvolvimento identificar uma dependência pedagógica, deve encaminhar a demanda diretamente ao fluxo/projeto Base de Conhecimento, com contexto e pergunta objetiva. Não solicitar ao usuário que transporte mensagens ou reconstrua decisões. O trabalho técnico não dependente dessa decisão deve continuar quando possível.

## Padrão de comunicação
Respostas ao usuário devem ser curtas, objetivas e orientadas a decisão/resultado. Explicar procedimentos somente quando solicitado. Não apresentar bastidores nem listas extensas de ressalvas sem necessidade.
