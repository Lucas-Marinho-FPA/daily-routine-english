# Feedback de pronúncia inline (Speaking Lab)

O texto-alvo continua corrido. Cada palavra é um `<span>` no mesmo parágrafo, sem quebras artificiais. Antes de gravar, não há nenhuma marcação; depois da análise, cada palavra recebe um estado.

| Estado | Visual | Quando |
|---|---|---|
| `pending` | sem marcação | antes de gravar ou durante a gravação |
| `good` | verde + sublinhado contínuo | a palavra foi **reconhecida como esperado**, com confiança suficiente |
| `needs_practice` | âmbar + sublinhado ondulado | palavra de conteúdo **não reconhecida**: omitida, ou ouvida como outra (mostra o que foi ouvido) |
| `uncertain` | cinza + sublinhado tracejado | sem reconhecimento no aparelho, confiança baixa, transcrição corrompida (laço de repetição), gravação insuficiente, palavra átona curta (a, the, to…) ou nome próprio não reconhecido (ex.: Uber) |

Tocar numa palavra mostra o motivo em texto e um botão “Ouvir”.

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
- **Tamanho:** ≈ 38 MB, **baixados só quando o aluno toca em “Baixar reconhecimento local”**, uma vez, do próprio endereço do app (GitHub Pages). Ficam num cache separado (`asr-local-…`) e funcionam **offline**. O app básico continua com 5,5 MB. Pode ser removido em Ajustes.
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
