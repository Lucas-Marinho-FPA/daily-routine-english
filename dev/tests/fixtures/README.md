# Fixtures de áudio dos testes

Falas **sintéticas** geradas offline com o Kokoro (voz `bm_george`, Apache-2.0) a partir das frases do próprio app — nenhuma gravação de pessoa real.
Usadas como “microfone falso” do Chromium (`--use-file-for-fake-audio-capture`) no teste `tests/e2e/asr-local.mjs`.

- `bm_george-R01-B1-S1.wav` — leitura correta de “I wake up at 5:00 a.m., take a shower and brush my teeth.”
- `bm_george-R01-B1-S1-sub.wav` — a mesma frase com “teeth” trocado por “tits” (erro de palavra controlado)
- `silence.wav` — 4 s de silêncio
- `free-routine.wav` — resposta livre a “Could you tell me about your daily routine?” com vocabulário diferente do exemplo (≈ 12 s)
- `free-lunch-chest.wav` — resposta sobre o almoço dizendo “chest videos” (divergência provável de “chess”) (≈ 7 s)
- `free-long.wav` — relato longo do dia (≈ 65 s), para a transcrição em trechos
- `moonshine-transcripts.json` — transcrições reais do modelo local para as 101 frases do app (fala sintética), usadas na calibração
- `word-kitchen.wav`, `word-fridge.wav` — uma palavra isolada (“kitchen”, “fridge”) com ~0,6 s de silêncio antes e ~2 s depois, a partir dos áudios de palavra do próprio app (Kokoro `bf_emma`). Usadas em `tests/e2e/wordpractice.mjs` (prática isolada de palavras).
