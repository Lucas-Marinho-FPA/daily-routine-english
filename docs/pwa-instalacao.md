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
| Ao abrir o app e ao voltar para ele | O app pede ao navegador para procurar versão nova (no máximo a cada 15 min; silencioso sem internet). |
| Download | A versão nova baixa os ~1.560 arquivos para um cache próprio (`drg-<versão>`), sempre da rede. Se qualquer arquivo falhar, esse cache incompleto é apagado e a versão em uso continua; o app avisa e tenta de novo depois. |
| Pronta | A versão nova **espera**. O app mostra “Nova versão disponível — Depois / Atualizar agora”. Durante uma sessão de estudo o aviso não aparece (volta ao sair). “Depois” esconde até a próxima abertura; em Ajustes → Aplicativo o botão continua. Fechar o app por completo também ativa a versão nova na próxima abertura. |
| “Atualizar agora” | O progresso é gravado, a versão nova assume e o app recarrega. Se a troca não acontecer em 10 s, nada é perdido e o aviso volta. |
| Depois da abertura | O app, já funcionando na versão nova, pede a limpeza: só então os caches `drg-` antigos são apagados. Até lá, arquivos de uma versão anterior continuam disponíveis para qualquer tela antiga. |

- O cache do **reconhecimento de fala** (`asr-local-…`, ~38 MB, baixado sob demanda) nunca é apagado por uma atualização.
- Antes: a versão nova assumia sozinha e apagava o cache anterior na mesma hora, com a tela antiga ainda aberta.

**Primeira atualização a partir da versão hoje publicada (`b582c29`):** o código antigo não tem o botão “Atualizar
agora”. A versão nova fica esperando até o app ser fechado por completo; ao reabrir, ela assume. O aviso antigo (“Feche
e reabra o app”) já orienta isso. Dali em diante vale o fluxo acima.

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
  seguinte, offline depois das atualizações, página de instalação offline e sem rede externa.
- `tests/unit/qr.test.js`: Reed–Solomon e formato contra valores conhecidos; o QR é lido de volta por um decodificador
  escrito à parte.

## 5. Pendências

- Testar num Galaxy S25+: instalação pelo Chrome (pedido nativo com capturas) e pelo Samsung Internet (menu), ícone na
  gaveta, tela de abertura, janela própria, modo avião, atualização real a partir da versão publicada, leitura do QR
  pela câmera.
- O Chromium dos testes não dispara `beforeinstallprompt` sozinho nem abre em janela própria: esses dois estados são
  simulados nos testes.
