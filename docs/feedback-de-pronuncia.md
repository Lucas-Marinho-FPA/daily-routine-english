# Feedback de pronúncia inline (Speaking Lab)

O texto-alvo continua corrido. Cada palavra é um `<span>` no mesmo parágrafo, sem quebras artificiais. Antes de gravar, não há nenhuma marcação; depois da análise, cada palavra recebe um estado.

| Estado | Visual | Quando |
|---|---|---|
| `pending` | sem marcação | antes de gravar ou durante a gravação |
| `good` | verde + sublinhado contínuo | a palavra foi **reconhecida como esperado**, com confiança suficiente |
| `needs_practice` | âmbar + sublinhado ondulado | palavra de conteúdo **não reconhecida**: omitida, ou ouvida como outra (mostra o que foi ouvido) |
| `uncertain` | cinza + sublinhado tracejado | sem reconhecimento no aparelho, confiança baixa, transcrição corrompida (laço de repetição), gravação insuficiente, palavra átona curta (a, the, to…) ou nome próprio não reconhecido (ex.: Uber) |

Tocar numa palavra mostra o motivo em texto e um botão “Ouvir” (antes da análise, tocar numa palavra só toca o áudio dela). A legenda é compacta: ● Reconhecida · ● Praticar · ○ Não avaliada.

## Fluxo do Speaking Lab
1. **Primeira entrada em Falar:** se o reconhecimento local não estiver instalado, o cartão “Avalie sua pronúncia” oferece o download (tamanho real, precisa de internet só para baixar, depois funciona offline, tudo no aparelho). Nada é baixado sem o toque em “Baixar reconhecimento”. “Agora não” é lembrado: o cartão não volta a cada visita, e a tela mostra uma linha compacta “Análise automática desligada · Instalar”.
2. **Gravar:** “Gravar minha voz” → “Gravando… 0:03” → parar. A gravação é salva antes de qualquer análise.
3. **Análise automática:** ao parar, aparece “Analisando sua gravação…” e o resultado surge na própria tela, sem outro botão. Estados: não gravado, gravando, analisando, resultado, inconclusivo, falha recuperável (“Tentar de novo”; se o modelo não carrega, “Verificar instalação” confere os arquivos e só baixa de novo com o toque do aluno).
4. **Vamos praticar:** lista automática com as palavras da tentativa ATUAL que o reconhecedor não reconheceu (omitidas ou ouvidas como outra). Tocar numa palavra toca o áudio dela (voz britânica embutida), destaca a palavra na frase e abre “Ouvir · Devagar · Na frase · Gravar a frase de novo”. Sem pendências: “Nenhuma palavra pendente nesta tentativa.”
5. **Regravar** invalida o resultado anterior (inclusive uma análise ainda em andamento) e reconstrói a lista. **Excluir gravação** apaga só a gravação daquele exercício, seu resultado e suas pendências.
6. **Detalhes:** “Ver o que o app ouviu” (recolhido) mostra a transcrição, as dimensões da nota e os limites da análise.

A lista mede divergência de reconhecimento, não um fonema errado comprovado. Palavras átonas e nomes próprios não entram. A lista de **Revisar** é atualizada automaticamente: a palavra entra quando é sinalizada e só sai depois de ser reconhecida em **duas tentativas seguidas** (uma transcrição favorável isolada não prova a pronúncia). Palavras marcadas à mão nunca são removidas. A marcação manual só aparece quando não há análise automática.

**Áudio das palavras:** 356 palavras isoladas geradas offline com a mesma voz das frases (Kokoro `bf_emma`, inglês britânico), embutidas no app (+≈ 1,1 MB). Nenhum serviço de voz externo.

## O que é medido de verdade
- **Reconhecimento de fala no próprio aparelho**, só nos textos de leitura (frase, bloco, rotina) com até 60 palavras. A transcrição é alinhada à frase-alvo; horas (“6pm”, “900a. M.”), números por extenso, grafia americana, palavras compostas (“lunchbox”), flexões regulares (“walked”) e nomes próprios não penalizam. Dois motores, ambos locais:
  1. **Modelo local do app (opcional)** — ver abaixo. Transcreve a gravação **depois** que ela termina, sem disputar o microfone.
  2. **Modo local do Chrome** (`processLocally`), quando existir (Chrome de computador). Roda junto com a gravação.
- **Métricas acústicas da gravação:** tempo de fala, pausas, pausas longas e ritmo em relação à referência.

## O que NÃO é medido
Não há avaliador acústico de fonemas, de sílaba tônica nem de entonação. Por isso o app **nunca** diz que uma vogal, consoante ou acento está errado. “Reconhecida como esperado” é evidência de **inteligibilidade**, não uma análise fonética: o reconhecedor pode acertar a palavra pelo contexto.

## Por que o reconhecimento aparecia “indisponível” no Galaxy S25+
Não era defeito da detecção: o **Chrome para Android não oferece o reconhecimento “no aparelho” da Web Speech API**. O Chromium implementa `processLocally` / `available()` / `install()` só no Chrome de computador (a partir da versão 150); no Android, `available()` responde “indisponível”. O `SpeechRecognition` comum do Chrome Android envia o áudio aos servidores do Google — por isso **nunca** é usado. Gravação (`MediaRecorder`) e reconhecimento são coisas separadas: a gravação sempre funcionou.

## Modelo local opcional (Moonshine tiny)
- **O quê:** modelo de reconhecimento de fala em inglês **Moonshine tiny** (MIT, Useful Sensors) rodando com **onnxruntime-web** (MIT, build só-WASM) num *Web Worker*.
- **Tamanho:** ≈ 38 MB, **baixados só quando o aluno toca em “Baixar reconhecimento”**, uma vez, do próprio endereço do app (GitHub Pages). Ficam num cache separado (`asr-local-…`) e funcionam **offline**. O app básico continua com 5,5 MB. Pode ser removido em Ajustes.
- **Atualizações do app:** arquivos do modelo idênticos aos já baixados são reaproveitados localmente; só o que mudou é baixado, e o convite mostra esse tamanho real (de 3eba9ae para esta versão: ≈ 0,7 MB, só o `worker.js`). A integridade (tamanho e hash) é conferida; um arquivo corrompido leva a “Verificar instalação” → “Baixar de novo”, nunca a um download silencioso.
- **Privacidade:** a gravação é transcrita no aparelho; nenhum áudio é enviado. Nenhuma CDN, nenhum serviço pago.
- **Calibração** (Chromium de computador, falas **sintéticas** britânicas lendo as 101 frases do app; não é a voz do aluno):

  | Conjunto | Palavras avaliadas | Falsos “praticar” |
  |---|---|---|
  | voz usada no ajuste (`bf_emma`) | 1 585 | 2 (0,1%) |
  | vozes novas, não usadas no ajuste (`bm_george`, `bf_isabella`) | 3 096 | 9 (0,3%) |

  Trocas de palavra controladas detectadas: 5 de 6. Tempo de transcrição ≈ 0,1× a duração do áudio no computador; no celular deve ser mais lento (não medido).
- **Limites:** é um modelo pequeno, treinado majoritariamente com inglês americano; erra às vezes (ex.: “chess” → “chest”, “fifteen” → “fifty”). Com sotaque brasileiro real ainda **não foi testado**. Quando a transcrição degenera (repetições) ou falha, nada é avaliado.
- **Descartado:** SoundSwallower/PocketSphinx (gramática fixa) — 27% a 50% de falsos erros em falas corretas.

## Controle de áudio
Tudo que toca passa por `app/js/audio/player.js`: só um áudio por vez (um novo para o anterior) e tudo para ao trocar de tela, avançar/voltar exercício, fechar uma folha (modal) ou começar a gravar. “Minha voz” tem tocar/pausar que reflete o estado real do elemento e retoma do ponto pausado. Ao sair da tela, o elemento e a URL da gravação são liberados e o worker do modelo é encerrado. Nada reinicia sozinho ao voltar. O controle de áudio nunca interrompe uma gravação; sair da tela durante a gravação encerra o microfone e salva o que foi gravado. O áudio **não** para quando o app vai para segundo plano (para permitir ouvir a rotina com a tela apagada).

## Nota geral (pesos iniciais — hipóteses, não validados)
| Dimensão | Peso | Situação |
|---|---|---|
| Pronúncia e inteligibilidade | 60% | proporção de palavras de conteúdo reconhecidas (exige reconhecimento no aparelho: modelo local ou Chrome) |
| Ritmo e fluidez | 20% | pausas e pausas longas por palavra; falar devagar não perde pontos |
| Acentuação e entonação | 15% | **indisponível** (nunca recebe nota) |
| Duração e naturalidade | 5% | ritmo em relação à referência; só os extremos perdem pontos |

A nota combina apenas as dimensões medidas (pesos renormalizados) e aparece como “parcial”. **Sem a medida de inteligibilidade não há nota geral.** Gravação insuficiente gera resultado inconclusivo, nunca nota baixa.

## Integração futura
`app/js/engine/wordfeedback.js` recebe uma transcrição e devolve estados por palavra; um avaliador especializado (alinhamento forçado ou modelo fonêmico) pode preencher os mesmos estados e as dimensões hoje indisponíveis, sem mudar a interface (`app/js/ui/inlinewords.js`).
