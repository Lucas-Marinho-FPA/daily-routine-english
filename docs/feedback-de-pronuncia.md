# Feedback de pronúncia inline (Speaking Lab)

O texto-alvo continua corrido. Cada palavra é um `<span>` no mesmo parágrafo, sem quebras artificiais. Antes de gravar, não há nenhuma marcação; depois da análise, cada palavra recebe um estado.

| Estado | Visual | Quando |
|---|---|---|
| `pending` | sem marcação | antes de gravar ou durante a gravação |
| `good` | verde + sublinhado contínuo | a palavra foi **reconhecida como esperado**, com confiança suficiente |
| `needs_practice` | âmbar + sublinhado ondulado | palavra de conteúdo **não reconhecida**: omitida, ou ouvida como outra (mostra o que foi ouvido) |
| `uncertain` | cinza + sublinhado tracejado | sem reconhecimento no aparelho, confiança baixa, gravação insuficiente ou palavra átona curta (a, the, to…) |

Tocar numa palavra mostra o motivo em texto e um botão “Ouvir”.

## O que é medido de verdade
- **Reconhecimento de fala no próprio aparelho** (Chrome `processLocally`; nada é enviado). Roda em paralelo à gravação, quando o navegador permite, e só nos textos de leitura (frase, bloco, rotina) com até 60 palavras. A transcrição é alinhada à frase-alvo; horas, números por extenso e grafia americana são equivalências aceitas.
- **Métricas acústicas da gravação:** tempo de fala, pausas, pausas longas e ritmo em relação à referência.

## O que NÃO é medido
Não há avaliador acústico de fonemas, de sílaba tônica nem de entonação. Por isso o app **nunca** diz que uma vogal, consoante ou acento está errado. “Reconhecida como esperado” é evidência de **inteligibilidade**, não uma análise fonética: o reconhecedor pode acertar a palavra pelo contexto.

## Nota geral (pesos iniciais — hipóteses, não validados)
| Dimensão | Peso | Situação |
|---|---|---|
| Pronúncia e inteligibilidade | 60% | proporção de palavras de conteúdo reconhecidas (exige reconhecimento no aparelho) |
| Ritmo e fluidez | 20% | pausas e pausas longas por palavra; falar devagar não perde pontos |
| Acentuação e entonação | 15% | **indisponível** (nunca recebe nota) |
| Duração e naturalidade | 5% | ritmo em relação à referência; só os extremos perdem pontos |

A nota combina apenas as dimensões medidas (pesos renormalizados) e aparece como “parcial”. **Sem a medida de inteligibilidade não há nota geral.** Gravação insuficiente gera resultado inconclusivo, nunca nota baixa.

## Integração futura
`app/js/engine/wordfeedback.js` recebe uma transcrição e devolve estados por palavra; um avaliador especializado (alinhamento forçado ou modelo fonêmico) pode preencher os mesmos estados e as dimensões hoje indisponíveis, sem mudar a interface (`app/js/ui/inlinewords.js`).
