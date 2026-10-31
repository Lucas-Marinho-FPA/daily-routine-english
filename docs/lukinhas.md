# Daily Routine do Lukinhas (11 anos)

Módulo de dez sessões de prática oral sobre a rotina da manhã do Lukinhas, personagem narrativo fixo do app (id
interno `lucas-kid`, antes previsto como “Lucas (11 anos)”, sem conteúdo). Não é perfil de usuário nem uma segunda
identidade do Lucas: só o nome de exibição mudou para **Lukinhas** e o pacote de conteúdo passou a existir.

## 1. Onde está o conteúdo

| O quê | Onde |
|---|---|
| Os dez textos definitivos (sem alteração), as traduções, as expressões, os exemplos e as perguntas | fonte: `content/characters/lucas-kid.json`, gerado por `tools/lukinhas-source.mjs` (cópia de trabalho, como o pacote da Karla); publicado em `data/characters.js` |
| Áudio britânico (voz Kokoro `bm_lewis`, gerado offline) | `audio/*.ogg` — 245 clipes novos: 66 frases, 73 expressões, 73 exemplos adicionais, perguntas e respostas-modelo |
| Referência de integridade dos textos | `tests/fixtures/lukinhas-texts.json` |

- **Textos:** as 66 frases de cada sessão, juntas, reproduzem caractere por caractere o texto aprovado (o build e os
  testes conferem). Nenhuma correção gramatical foi necessária.
- **Traduções** (português do Brasil): uma por frase, escritas para o app; mantêm horários e acontecimentos; phrasal verbs
  traduzidos pelo sentido (kick back → relaxar, ficar de boa). Aparecem com “Mostrar tradução” no texto da sessão.
- **Fatos:** cada frase aponta para os fatos da rotina informada (F01–F15: dia normal e dia de jiu-jitsu, 9h40, 11h,
  ~11h30, ~12h40). Dias da semana dos treinos não foram atribuídos.
- **Expressões:** as do “vocabulário prioritário” de cada sessão, na ordem aprovada, com significado, explicação para a
  idade, exemplo adicional com tradução e áudio. Uma expressão já vista volta ligada no texto das sessões seguintes
  (revisão cumulativa: a sessão 10 retoma mais de oito). Exemplos adicionais são genéricos (perguntas, pedidos,
  situações comuns): não criam fatos novos sobre o Lukinhas ou a família.
- **Inglês britânico:** rubbish, lead, school minibus, get changed, have a shower, housework, holiday, trainers.

## 2. As cinco etapas em cada sessão

O módulo usa a estrutura de módulos que já existe (uma sessão = um módulo L01–L10, com as mesmas cinco etapas e os
mesmos cadeados):

| Etapa pedida | No app |
|---|---|
| 1. Texto e destaques | **Texto da sessão e expressões** (no topo do módulo, sempre aberto): título, foco, nível, objetivo, língua em contexto, vocabulário prioritário, texto integral com as expressões destacadas e tocáveis, tradução, áudio (frase, bloco, texto inteiro). |
| 2. Compreensão | Etapas **01 Palavras-chave** (vocabulário prioritário: palavras, conectivos, collocations, horários) e **02 Expressões práticas** (phrasal verbs da sessão), com a lista explicada e a prática. |
| 3. Speaking Lab | Etapas **03 Ouvir e entender** (ouvir uma frase da sessão sem o texto e reconhecê-la) e **04 Falar na prática** (Speaking Lab só com as frases, blocos e perguntas da sessão: gravação e reconhecimento locais, transcrição, comparação com verde/âmbar/cinza, sem avaliação fonética). |
| 4. Atividades | Dentro das etapas 1, 2 e 5: identificar o significado, lembrar a expressão, completar a frase, **escolher a forma mais natural**, montar a frase, ordenar as frases do bloco, ouvir e identificar. |
| 5. Produção independente | Etapa **05 Aplicar e conversar**: perguntas com resposta-modelo tirada do texto e, no fim, a pergunta livre (“Now, tell me about your morning without reading the text.” e variações por sessão), com o retorno já existente: adequação, gramática e naturalidade, confiabilidade da transcrição, ritmo. |

Critérios de conclusão e cadeados: os mesmos do app (acertar ao menos uma vez a maior parte; abrir não conclui). Nas
sessões, as etapas 1 e 2 contam só o vocabulário prioritário daquela sessão.

## 3. O que foi criado para o módulo

- **Exercício “mais natural”** (`item:…:nat`): a frase do texto aparece com uma forma simples no lugar da expressão
  (“We *take* his lead…”) e o aluno escolhe a expressão britânica (grab). Só existe para itens com forma simples
  cadastrada (`plain`) — hoje, só os do Lukinhas; o Lucas e a Karla não mudam.
- **Expressões tocáveis** no texto e no vocabulário prioritário (painel com significado, explicação, exemplo, áudio).
- **Texto primeiro** nas sessões (nos outros módulos o texto continua aparecendo depois de “Ouvir e entender”).
- Build: pacotes de personagem aceitam prefixo de itens, explicação, exemplo adicional, forma simples, metadados de
  sessão e áudio próprio (manifesto `characters-audio-manifest.json`, lido por `tools/gen_audio.py`).

## 4. Limitações

- A voz do áudio é britânica adulta (o gerador offline não tem voz infantil).
- “Falar na prática” e a produção livre dependem do reconhecimento de fala no aparelho (opcional, ~38 MB); sem ele, a
  gravação e o modelo continuam disponíveis, mas não há transcrição. A comparação é textual: não comprova a pronúncia.
- O pacote offline passa de 11,8 MB para 14,5 MB (os clipes do Lukinhas).
- O app ainda tem XP, níveis e a troca de personagem no Início (vindos do MVP); este módulo não acrescenta nada disso.

## 5. Backlog

- Voz infantil para o áudio, se surgir uma opção local gratuita.
- Revisão só das expressões marcadas com estrela.
- Imagens do Lukinhas (seis estados).
- Confirmar os dias de treino, se quiserem sessões específicas para eles.
