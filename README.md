# Daily Routine English

Aplicativo web **offline** para praticar inglês britânico falando sobre rotinas diárias: reconhecer → lembrar → construir frases → falar.

**Abrir:** https://lucas-marinho-fpa.github.io/daily-routine-english/

- Funciona no navegador do celular. Depois do primeiro carregamento, todo o conteúdo e os 896 áudios ficam em cache e o app funciona **sem internet** (service worker).
- No Chrome do Android: ⋮ → **Instalar app** / **Adicionar à tela inicial**.
- **Privacidade:** o progresso, as respostas e as gravações ficam **somente no aparelho** (IndexedDB). O app não faz chamadas externas; uma política CSP bloqueia conexões para fora do site.
- O conteúdo é uma versão **generalizada** de um material pessoal de estudo: nomes de empresa e de escola foram substituídos por termos genéricos.
- **Speaking Lab:** grave a frase e a análise começa sozinha: cada palavra é marcada no próprio texto (reconhecida / praticar / não avaliada), com nota estimada parcial quando há evidência e uma lista automática “Vamos praticar” com o áudio de cada palavra; cada palavra pode ser gravada sozinha, vendo exatamente o que o app ouviu, antes de voltar à frase completa. Detalhes e limitações em [`docs/feedback-de-pronuncia.md`](docs/feedback-de-pronuncia.md).
- **Missões com resposta livre:** ao parar a gravação, a resposta é transcrita no aparelho e recebe feedback de conteúdo (responde à pergunta?), palavras para revisar e métricas de ritmo, sem exigir que seja igual ao exemplo.
- **Gravações:** regravar um exercício substitui o áudio anterior dele (não acumula). O **áudio** de cada gravação é apagado automaticamente 7 dias depois da gravação mais recente daquele exercício; transcrições, avaliações e progresso continuam. Detalhes em [`docs/armazenamento.md`](docs/armazenamento.md).
- **Personagens:** Lucas (10 rotinas do Word + 8 episódios do Lucas 2.0 — ver [`docs/lucas-jornada.md`](docs/lucas-jornada.md)) e Karla (personal trainer e instrutora de Pilates, em preparação; jornada de 11 episódios — ver [`docs/karla-jornada.md`](docs/karla-jornada.md)), no mesmo motor; escolha pelo nome na primeira abertura e troca no Início (“Trocar personagem”) ou em Ajustes, com progresso separado por personagem. Detalhes em [`docs/personagens.md`](docs/personagens.md).
- **Reconhecimento de fala local (opcional):** o Chrome para Android não tem reconhecimento no aparelho, então o app oferece um modelo próprio (Moonshine tiny, MIT, ≈ 38 MB) baixado só a pedido, do próprio site, que roda offline no celular. A voz nunca sai do aparelho. Licenças em `asr/LICENSES.txt`.
- **Voz de referência:** inglês britânico gerado offline com o modelo Kokoro (Apache-2.0), voz `bf_emma`.

Site estático: `index.html`, `css/`, `data/`, `dist/app.js` (bundle), `js/` (código-fonte modular), `audio/`, `icons/`, `manifest.webmanifest`, `sw.js`, `asr/` (reconhecimento local opcional, fora do pré-cache).
