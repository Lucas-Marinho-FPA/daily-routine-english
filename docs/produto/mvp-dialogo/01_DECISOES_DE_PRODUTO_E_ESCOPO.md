# 01 — Decisões de Produto e Escopo

## 1. Visão

Daily Routine English (DRE) é uma ferramenta de aprendizagem de inglês para brasileiros, orientada a situações reais, rotinas e conversas. A nova experiência transforma cada diálogo em uma unidade estruturada de aprendizagem e demonstração de domínio.

Objetivo: o aluno compreender, recuperar, traduzir, escrever e produzir oralmente a linguagem em contexto — não apenas memorizar frases.

## 2. Escopo desta implantação

- Criar/adequar um componente reutilizável de atividade por diálogo.
- Implantar as cinco fases descritas neste pacote.
- Integrar conteúdo de `The Story of John` (sete partes) ao formato real de conteúdo do DRE.
- Integrar correção textual, avaliação semântica online, áudio, reconhecimento de fala, progresso e retomada.
- Criar experiência híbrida online/offline com estados explícitos.
- Apresentar resultado por fase e por item, sem gamificação de recompensa.
- Manter separadas as jornadas Daily Routine e Conversation Practice e seus progressos.

## 3. Fora de escopo / proibições

- XP, pontos, moedas, níveis, streaks, rankings, badges de recompensa ou loja.
- Rebranding, redesign geral do aplicativo ou substituição da identidade herdada do Bora de Inglês.
- Reescrita dos quatro acervos Ian originais.
- Exposição antecipada da tradução/resposta-modelo.
- Avaliação fonética alegada sem tecnologia/evidência que a sustente.
- Chaves de API no frontend, credenciais em repositório ou chamadas diretas do navegador a provedores com segredo.
- Dependência obrigatória de internet para abrir conteúdo e praticar itens que já estejam disponíveis localmente.
- Criação de infraestrutura paga, contratação de fornecedor, deploy, publicação, merge ou push sem autorização específica.

## 4. Decisões aprovadas

| Tema | Decisão |
|---|---|
| Estrutura | Cinco fases sequenciais por diálogo |
| Domínio | 80% individual por palavra, expressão ou frase, não média compensatória |
| Vocabulário | Ouvir cada item pelo menos 3 vezes antes da tentativa oral |
| Escrita por escuta | Pista de significado em português + áudio inglês; aluno escreve em inglês |
| Tradução | Aluno traduz cada fala do inglês para português; avaliação semântica |
| Listening | Ouvir diálogo completo 3 vezes; anotações recomendadas; 10 questões |
| Compreensão | 8/10 como proposta de corte para a rodada; corrigir e explicar depois |
| Speaking | Ler todas as falas em voz alta; mínimo de 80% de correspondência confiável por fala |
| Online/offline | Híbrido; IA generativa online quando necessária à qualidade |
| Offline | Continuar somente operações locais confiáveis; avaliações IA pendentes |
| Feedback | Explicação pedagógica após a resposta, não antes |
| Visual | Preservar identidade DRE/Bora de Inglês atual |
| Gamificação | Interações didáticas sim; recompensas/XP/níveis não |

## 5. Política de qualidade pedagógica

- Não reduzir rigor para acomodar limitações técnicas.
- Se o método local não avaliar adequadamente uma resposta, encaminhar para avaliação online.
- Se a avaliação online falhar, manter a tentativa pendente e permitir continuar em conteúdo não dependente daquela avaliação.
- Não reprovar o aluno por falha de rede, transcrição incompleta ou baixa confiança do reconhecedor.
- Não aprovar item com resultado inconclusivo.
- O aluno recebe explicação acionável: o que preservou, o que mudou, por que a resposta não atingiu o critério e um exemplo de correção.
- Variantes linguísticas naturais e semanticamente válidas devem ser aceitas, inclusive variantes identificadas de inglês britânico/americano quando aplicável.

## 6. Política de privacidade e segurança

- Informar quando áudio/texto será enviado para processamento online.
- Obter consentimento apropriado antes de transmitir gravações.
- Minimizar dados enviados; evitar nome/perfil quando não necessário.
- Definir retenção e exclusão de gravações e resultados.
- Segredos somente no backend; nunca em HTML, JavaScript público, arquivos de conteúdo ou storage acessível ao cliente.
- Registrar erros técnicos sem armazenar conteúdo sensível desnecessário.
