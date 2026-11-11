# 06 — UX/UI, Mobile e Identidade Visual

## Regra de marca

**Preservar integralmente a identidade visual vigente do Daily Routine English, herdada do Bora de Inglês.** Não redesenhar a marca, substituir logotipo, trocar paleta, tipografia, ícones ou linguagem visual com base nos mockups.

Os mockups incluídos são north star de fluxo e hierarquia mobile: apresentação contextual, diálogo protagonista, falas identificadas, áudio acessível, etapas claras e feedback. São referência, não design system.

Antes de codificar:
1. Inspecionar tokens CSS, logo, fontes, ícones, componentes e telas atuais.
2. Identificar cores e padrões efetivamente usados na versão/branch alvo.
3. Reutilizar componentes existentes.
4. Adaptar o fluxo mantendo a identidade atual.
5. Se houver conflito entre mockup e identidade existente, prevalece a identidade existente.

## Princípios de UX

- Mobile-first, Android prioritário.
- Informação essencial primeiro; detalhes sob demanda.
- Uma tarefa principal por tela.
- Tradução não aparece antes da resposta nas fases de escrita/tradução.
- Personagens são narrativos, não avatares de perfil/recompensa.
- Feedback explicativo após a tentativa.
- Estado de conectividade sempre compreensível quando afeta a ação.
- Área de toque, contraste, foco e legibilidade adequados.
- Sem dependência de hover.

## Tela do diálogo

Hierarquia sugerida:
1. Identificação da parte/atividade e progresso.
2. Título e breve contexto da cena.
3. Imagem contextual (opcional; não competir com o texto).
4. Diálogo em lista vertical, personagem identificado.
5. Áudio por fala e controle de diálogo completo.
6. Acesso contextual a vocabulário/expressões/gramática, sem poluir a leitura.
7. Ação principal clara para iniciar/continuar a fase.

## Fase 1 — Vocabulário
Cartão de um item por vez ou pequenos grupos; texto inglês em destaque; significado/contexto conforme desenho da atividade; controle de áudio com contador 1/3, 2/3, 3/3; botão de gravação liberado após três reproduções; resultado e explicação após tentativa.

## Fase 2 — Escrita por escuta
Mostrar pista em português e botão de áudio em inglês; campo de resposta; não mostrar inglês-alvo; depois de enviar, mostrar feedback e referência.

## Fase 3 — Tradução
Mostrar fala em inglês e campo de tradução em português; não mostrar tradução-modelo; mostrar correção semântica após envio.

## Fase 4 — Listening
Contador 0/3 a 3/3; controle de áudio completo; área de anotações opcional; liberar questionário após terceira reprodução; dez questões; correção no fim.

## Fase 5 — Speaking
Uma fala por vez, personagem e frase-alvo; gravar, ouvir/repetir quando útil; mostrar resultado com confiabilidade; inconclusivo não pode parecer reprovação.

## Resultado
Mostrar conclusão por fase e domínio por item; percentual global apenas como resumo secundário. Não ocultar item abaixo do corte com média geral. Indicar pendências online e itens para revisão.

## Estados obrigatórios de tela
- inicial/vazia;
- carregando;
- áudio indisponível;
- microfone negado;
- reconhecimento não instalado;
- sem internet;
- aguardando avaliação online;
- falha recuperável;
- resposta inconclusiva;
- item aprovado;
- item precisa de prática;
- fase concluída;
- atividade concluída;
- retomada após fechar app.

## Layout mobile
Não copiar layout desktop de três colunas para o celular. No mobile, manter coluna única; painéis de vocabulário/gramática em abas, acordeões ou folhas secundárias. Diálogo permanece protagonista.
