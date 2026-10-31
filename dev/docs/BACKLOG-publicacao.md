# Backlog — cópia de publicação (daily-routine-english)

| ID | Descrição | Grav. | Prior. | Status |
|---|---|---|---|---|
| P-01 | Reconhecimento de fala no aparelho **em paralelo à gravação** (MediaRecorder + SpeechRecognition): validado só com reconhecimento simulado. No Android pode falhar por microfone ocupado; nesse caso o app avisa e oferece “Verificar palavras (sem gravar)” | Média | P1 | aberto (validar no S25+) |
| P-02 | Sem avaliador acústico: o feedback por palavra mede reconhecimento (inteligibilidade), não fonemas. Acento e entonação ficam “não avaliado” | Média | P3 | aceito (interface pronta para um avaliador futuro) |
| P-03 | Avaliação por palavra limitada a textos de até 60 palavras (rotina completa fica cinza) | Baixa | P2 | aceito |
| P-04 | Pesos da nota (60/20/15/5) são hipóteses de produto; calibrar com gravações reais | Baixa | P2 | aberto |
| P-05 | Perguntas (resposta livre) não são avaliadas automaticamente; só “Verificar palavras (lendo o modelo)” | Baixa | P3 | aceito (por desenho) |
| P-06 | Exercícios de sessão com gravação (contar bloco/rotina, conversa) ainda não usam o feedback inline | Baixa | P2 | aberto |
| P-07 | URL pública não pôde ser aberta a partir do ambiente de desenvolvimento (github.io bloqueado pela rede da sessão); validação feita no commit idêntico servido em /daily-routine-english/ | Média | P1 | aberto (você abre no celular) |

## P-08 — Reconhecimento local e controle de áudio (publicado)
- Pendente no aparelho: testar no Galaxy S25+ o download (38 MB), o tempo de transcrição e a qualidade com a voz real do aluno (sotaque brasileiro). Calibração feita só com vozes sintéticas.
- Pendente: medir memória/tempo do worker no celular com blocos longos (até 30 s).
- T04 falhou 1 vez em 4 execuções (tempo esgotado no clique do auxiliar de respostas, exercícios aleatórios); não se repetiu. Investigar se voltar a ocorrer.

## P-09 — Speaking Lab 2.0 (publicado)
- Testar no Galaxy S25+: convite de instalação, “Analisando…” (tempo real no celular), lista “Vamos praticar”, regravar/excluir, tema escuro e alvos de toque.
- QA dos 356 áudios de palavras isoladas: o Moonshine não transcreve palavras isoladas curtas (saída vazia em ~75%), então a verificação automática não é conclusiva; ouvir uma amostra no aparelho.
- “Praticar” uma palavra é ouvir e repetir; não há avaliação automática da palavra isolada (o modelo não reconhece palavras soltas de forma confiável).
- Exercícios de perguntas (resposta livre) e drills não têm análise automática (não há texto-alvo para comparar).
- Histórico de tentativas não é guardado (só a tentativa atual, com a gravação); avaliar se vale guardar evolução por frase.
- Análise vale para trechos de até 60 palavras / 30 s (blocos longos e rotina completa: só gravação e A/B).

## P-10 — Avaliação de respostas livres nas missões (publicado)
- Validar no S25+ com a voz real: tempo de “Analisando sua resposta…” (30 s e 1–3 min), qualidade da transcrição com sotaque brasileiro e utilidade das marcações.
- Critérios de adequação são heurísticos e explícitos; 2 das 66 respostas-exemplo saem “em parte” (G.Q03, N.Q13). Revisar com exemplos reais do aluno.
- A transcrição não alimenta a sugestão da autoavaliação (que segue baseada no texto escrito); avaliar se deve.
- Respostas acima de 3 min (rotina completa) não são analisadas: só gravação e A/B.

## P-11 — Camada contextual (publicado)
- Validar com voz humana no S25+: o caso A real e outras falas com erros de reconhecimento; ajustar a lista de colocações verbo + objeto com exemplos reais.
- Respostas totalmente livres: erros do reconhecedor que geram palavras válidas e plausíveis não são detectáveis sem um modelo de linguagem; avaliar um modelo local pequeno só com medição de tamanho, memória e ganho.
- “My wife goes to the bed” continua aceito com “palavra a mais” (regra anterior); revisar artigos em expressões fixas (go to bed, at home).

## P-12 — Armazenamento e retenção de áudios (publicado)
- Validar no S25+: Ajustes → Armazenamento antes/depois de regravar e após 7 dias reais; comparar “Uso total” com Configurações do Chrome → Sites → armazenamento.
- A parte “Não atribuído” (≈ 1,6 MB sem modelo; ≈ 5 MB com modelo nas medições do Chromium) é dado interno do navegador (metadados de cache e, provavelmente, código compilado); não é controlável pelo app.
- Opcional: oferecer “Apagar todos os áudios agora” (mantendo resultados) e mostrar a data de expiração de cada gravação.
- Opcional: recomprimir gravações (Opus a 24 kbps) para reduzir ~40 KB/gravação de 10 s; medir antes de adotar.
- Retenção não roda com o app fechado (não há tarefa em segundo plano por decisão): um áudio vencido só sai na próxima abertura.

## P-13 — Prática isolada de palavras (publicado)
- Validar no S25+ com voz real: taxa de “Reconhecida” por palavra, sobretudo monossílabas; o Moonshine tiny erra palavras soltas (24/40 em fala sintética, mesmo recortado).
- Se a taxa for baixa com voz real: avaliar frase-portadora curta (“I said …”) ou repetição; medir antes de adotar.
- A prática isolada está no Speaking Lab; o painel “Palavras para revisar” das missões (resposta livre) continua só com Ouvir/Devagar. Avaliar levar o mesmo cartão para lá.
- O estado das palavras vale só enquanto a tela está aberta (decisão de armazenamento); avaliar guardar só o “reconhecida” (texto) se o aluno pedir.

## P-14 — Avaliação oral em camadas (local; aguardando autorização para publicar)
- Validar no S25+ com voz real: o caso frango/alface/Uber e outras falas; anotar falsos alarmes e trechos não detectados.
- Corrigir o corte silencioso do `generate` (vendor moonshine-js): devolver se houve fim de frase e não descartar o último token; exige novo pacote do reconhecimento (~0,7 MB) com consentimento.
- Ampliar molduras/categorias com exemplos reais do aluno; avaliar “I goes” na fala livre.
- Marcas de tempo por palavra (se o modelo permitir) para reproduzir só o trecho suspeito.
