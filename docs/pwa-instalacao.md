# Aplicativo instalável (PWA): instalação, atualização segura e dados

Distribuição sem APK, sem loja e sem custo: o Daily Routine English é instalado pelo navegador (Chrome ou Samsung
Internet no Android) a partir do GitHub Pages e funciona offline depois do primeiro acesso.

Página para divulgar: `install.html` (no endereço público, `…/daily-routine-english/install.html`), com código QR.

## 1. Instalação

- **Manifesto:** `id` fixo `/daily-routine-english/index.html` — o MESMO valor que o Chrome já usava como identidade
  (quando não há `id`, ele vale o `start_url`). Medido no Chromium: um `id` relativo como `./index.html` é resolvido a
  partir da raiz do domínio (`/index.html`) e criaria um segundo aplicativo para quem já instalou. Se o endereço do site
  mudar um dia, o `id` precisa continuar o mesmo.
- `screenshots` (3 telas 824×1830, `form_factor: narrow`): o Chrome no Android mostra o pedido de instalação maior,
  com as telas. Ficam fora do pré-cache (não ocupam espaço no aparelho). Geradas por `tools/screenshots.mjs` a partir
  do próprio app (módulo, palavras-chave, ouvir) — sem telas com números de progresso.
- Ícones existentes mantidos (192/512 “any”, 512 “maskable” com o conteúdo dentro da área segura, 180 para iOS).
- **Botão “Instalar aplicativo”** (Início e Ajustes → Aplicativo; também na página de instalação): aparece só quando o
  navegador entrega o pedido nativo (`beforeinstallprompt`, capturado desde o carregamento). Recusa: o botão some e o
  app lembra que dá para instalar pelo menu. Aceite: “o aplicativo já está instalado”.
- **Sem o pedido nativo** (Samsung Internet, ou o Chrome ainda não ofereceu): instruções pelo menu do navegador. O app
  nunca simula uma instalação.
- **Já instalado:** aberto pelo ícone (janela própria, `display-mode: standalone`) nada de instalação aparece; aberto no
  navegador depois de instalar, mostra “já está instalado — abra pelo ícone” (o navegador para de oferecer a instalação).

## 2. Atualização controlada

| Momento | O que acontece |
|---|---|
| Publicação | O site novo tem um `sw.js` com outra `VERSION` (hash de todos os arquivos). |
| Ao abrir o app e ao voltar para ele | O app pede ao navegador para procurar versão nova: sempre ao abrir; ao voltar, no máximo a cada 15 min. A verificação só conta como feita quando o navegador consultou o servidor; sem internet, tenta de novo (no máximo uma vez por minuto). |
| Download | A versão nova baixa os ~1.800 arquivos para um cache próprio (`drgapp-<versão>`), sempre da rede. Enquanto baixa, aparece “Baixando uma nova versão do aplicativo…” (fora das sessões). Se qualquer arquivo falhar, esse cache incompleto é apagado e a versão em uso continua; o app avisa e tenta de novo depois. |
| Pronta | A versão nova **espera**. O app mostra “Nova versão disponível — Depois / Atualizar agora”. Durante uma sessão de estudo o aviso não aparece (volta ao sair). “Depois” esconde até a próxima abertura; em Ajustes → Aplicativo o botão continua. Fechar o app por completo também ativa a versão nova na próxima abertura. |
| “Atualizar agora” | O progresso é gravado, a versão nova assume e o app recarrega. Se a troca não acontecer em 10 s, nada é perdido e o aviso volta. |
| Depois da abertura | O app, já funcionando na versão nova, pede a limpeza: só então os caches de versões anteriores (`drgapp-…` e os antigos `drg-…`) são apagados — e só se o cache da versão em uso estiver completo e nenhuma outra versão estiver baixando ou esperando. |

- O cache do **reconhecimento de fala** (`asr-local-…`, ~38 MB, baixado sob demanda) nunca é apagado por uma atualização.
- Antes: a versão nova assumia sozinha e apagava o cache anterior na mesma hora, com a tela antiga ainda aberta.

**Defeito corrigido (2026-10-31).** Nas versões até `6db56e10bb5d` (`ec33411`), a limpeza pedida a cada abertura do app
apagava todo cache `drg-` que não fosse o da versão em uso — inclusive o da versão nova já baixada e em espera. Quem
abria o app com uma atualização pendente perdia o download; ao tocar “Atualizar agora”, a versão nova assumia sem
arquivos próprios, servia os da versão antiga (a tela continuava antiga) e, depois da limpeza seguinte, o app ficava
sem cache e **não abria sem internet**. Esse código antigo continua nos aparelhos até a troca, por isso a correção fica
na versão nova:
- cache com outro prefixo (`drgapp-`), fora do alcance da limpeza antiga;
- a limpeza nova não apaga nada com outra versão baixando ou em espera (conferido de novo logo antes de apagar) e só
  apaga as anteriores com o próprio cache completo;
- ao instalar e ao assumir, a versão confere o próprio cache e baixa o que faltar; as telas só recebem arquivos depois;
- arquivo ausente no cache da versão em uso vem da rede; o de outra versão só é usado sem internet.

**Primeira atualização a partir de uma versão com o defeito (`6a0c5b6` ou `ec33411`):** o aviso “Baixando…” só existe
a partir da versão corrigida, então nessa primeira troca o download acontece sem aviso (o app precisa ficar aberto com
internet até aparecer “Nova versão disponível”). Dali em diante vale o fluxo acima. (Versões anteriores a `6a0c5b6`
assumem sozinhas a versão nova; o aviso antigo pede para fechar e reabrir o app.)

## 3. Dados

- Nenhum formato de armazenamento mudou. Progresso no IndexedDB (`drg` → `kv/state`), gravações no mesmo banco;
  localStorage só como reserva. O service worker não toca nesses dados; a atualização só troca os arquivos do app.
- Gravar antes de recarregar: “Atualizar agora” grava o estado (o app já grava ao sair e ao ir para segundo plano).
- Instalar pede armazenamento persistente (o navegador costuma conceder a apps instalados), o que protege contra a
  limpeza automática por falta de espaço. **Não protege** contra “Limpar dados” feito pelo usuário: por isso a página
  de instalação e o app recomendam o backup (Ajustes → Exportar backup).
- Cada navegador guarda o próprio progresso: instalar pelo Chrome e depois pelo Samsung Internet cria dois apps com
  dados separados.

## 4. Testes

- `tests/e2e/pwa.mjs` (P01–P13): manifesto e instalabilidade sem erros no Chromium, identidade fixa, capturas fora do
  pré-cache, botão de instalação (evento do navegador simulado pelo teste: recusa e aceite), modo janela própria,
  versão nova esperando, aviso fora da sessão, “Depois”, “Atualizar agora” com progresso idêntico e limpeza só depois da
  abertura, cache do reconhecimento preservado, falha no download sem cache pela metade, recuperação na versão
  seguinte, offline depois das atualizações, página de instalação offline e sem rede externa; P05 confere também o
  aviso de download e P05b a reabertura com a versão nova em espera (o cache dela continua completo).
- `tests/e2e/update-transition.mjs` (T01–T13, T21–T22): troca **real** entre duas versões publicadas (conteúdo
  diferente), conferindo o que a tela mostra — não só a versão do service worker: instalação, abertura, download,
  aviso de download, “Depois”, reabertura com a versão em espera, “Atualizar agora” com dados novos na hora, progresso
  de Lucas e Karla, módulos dos três personagens, offline, atualização imediata, fechar por completo, download
  interrompido e a troca seguinte (com a correção dos dois lados). Uso: `git archive <commit> | tar -x -C <pasta>`
  para a versão antiga; `app/` da cópia de trabalho para a nova.
- `tests/unit/qr.test.js`: Reed–Solomon e formato contra valores conhecidos; o QR é lido de volta por um decodificador
  escrito à parte.

## 5. Pendências

- Testar num Galaxy S25+: instalação pelo Chrome (pedido nativo com capturas) e pelo Samsung Internet (menu), ícone na
  gaveta, tela de abertura, janela própria, modo avião, atualização real a partir da versão publicada, leitura do QR
  pela câmera.
- O Chromium dos testes não dispara `beforeinstallprompt` sozinho nem abre em janela própria: esses dois estados são
  simulados nos testes.
