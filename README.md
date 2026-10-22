# Daily Routine English

Aplicativo web **offline** para praticar inglês britânico falando sobre rotinas diárias: reconhecer → lembrar → construir frases → falar.

**Abrir:** https://lucas-marinho-fpa.github.io/daily-routine-english/

- Funciona no navegador do celular. Depois do primeiro carregamento, todo o conteúdo e os 540 áudios ficam em cache e o app funciona **sem internet** (service worker).
- No Chrome do Android: ⋮ → **Instalar app** / **Adicionar à tela inicial**.
- **Privacidade:** o progresso, as respostas e as gravações ficam **somente no aparelho** (IndexedDB). O app não faz chamadas externas; uma política CSP bloqueia conexões para fora do site.
- O conteúdo é uma versão **generalizada** de um material pessoal de estudo: nomes de empresa e de escola foram substituídos por termos genéricos.
- **Speaking Lab:** a frase-alvo fica corrida e, depois de gravar, cada palavra é marcada no próprio texto (reconhecida / praticar / não avaliada), com nota estimada parcial. Detalhes e limitações em [`docs/feedback-de-pronuncia.md`](docs/feedback-de-pronuncia.md).
- **Reconhecimento de fala local (opcional):** o Chrome para Android não tem reconhecimento no aparelho, então o app oferece um modelo próprio (Moonshine tiny, MIT, ≈ 38 MB) baixado só a pedido, do próprio site, que roda offline no celular. A voz nunca sai do aparelho. Licenças em `asr/LICENSES.txt`.
- **Voz de referência:** inglês britânico gerado offline com o modelo Kokoro (Apache-2.0), voz `bf_emma`.

Site estático: `index.html`, `css/`, `data/`, `dist/app.js` (bundle), `js/` (código-fonte modular), `audio/`, `icons/`, `manifest.webmanifest`, `sw.js`, `asr/` (reconhecimento local opcional, fora do pré-cache).
