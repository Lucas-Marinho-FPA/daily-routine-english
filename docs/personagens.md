# Personagens

O app tem dois personagens recorrentes que usam **o mesmo motor de aprendizagem** (exercícios, corretor, revisão espaçada, XP, gravação, reconhecimento local e avaliação oral). O que muda de um para o outro é só o **conteúdo** praticado.

| | Lucas | Karla |
|---|---|---|
| Situação | ativo (conteúdo atual do app) | **em preparação** |
| Conteúdo | `data/content.js` (intocado) — 10 rotinas, 101 frases | `data/characters.js` — jornada de 11 episódios (K01–K11), 104 frases, 151 itens próprios, 35 perguntas — ver [`karla-jornada.md`](karla-jornada.md) |
| Áudio de referência | 896 clipes britânicos pré-gerados | **pendente**: até ser gerado, o app usa a voz em inglês do aparelho (offline, qualidade varia) |
| Imagens dos 6 estados | **pendentes** (o app nunca teve imagem de personagem) | **pendentes** |

> Observação: antes desta etapa o app **não tinha** sistema de personagens — o “Lucas” existia só como a pessoa que narra as rotinas. Os seis estados com estes nomes seguem a convenção do Bora de Inglês (companheiro Tatu), adotada aqui para manter compatibilidade futura.

## Como funciona

- **Registro**: `tools/build-characters.mjs` lê `content/characters/*.json` (fonte) e gera `data/characters.js` (`window.DRG_CHARACTERS`), validando: IDs únicos e com prefixo do personagem, itens e fatos referenciados existentes, item presente na frase, seis estados declarados, sem colisão com o conteúdo do Lucas.
- **Visão de conteúdo** (`js/engine/characters.js#contentFor`): para o Lucas devolve o **próprio objeto** `DRG_CONTENT` (nada muda para quem já usa o app); para a Karla, uma visão no mesmo formato com as rotinas, frases e perguntas dela, os itens dela e os itens genéricos compartilhados (`it.wake-up`, `it.take-a-shower`…) reapontados para as frases dela.
- **Seleção** (só pelo nome, sem imagem nesta etapa):
  - **Primeira abertura**: o Início mostra antes “Quem vai acompanhar você?” com Lucas e Karla; o Lucas vem marcado e o botão diz “Continuar com …”. Nada é marcado como escolhido sem confirmar: se o app for fechado antes, a escolha volta a aparecer. Depois de confirmar, não aparece mais.
  - **Troca**: no Início, “Personagem atual: X · Trocar personagem” abre ali mesmo a lista (o ativo vem marcado e com a etiqueta “atual”); “Usar Y” troca e redesenha o Início com a rotina de Y; “Cancelar” não muda nada. Ajustes → Personagem continua funcionando do mesmo jeito.
  - **Durante uma atividade**: a sessão de exercícios não mostra o controle de troca (não tem barra de navegação nem acesso aos Ajustes). Cada resposta é gravada no momento em que é dada; sair da sessão para trocar mantém o que já foi respondido, no personagem em que foi respondido. O Speaking Lab grava a gravação ao sair da tela (comportamento de antes).
- **Persistência**: no mesmo estado salvo de sempre (IndexedDB `drg` → `kv/state`, ou `localStorage` como reserva), sem chave nova de armazenamento:
  - `settings.character` — `lucas` ou `karla` (valor inválido ou desconhecido → Lucas);
  - `settings.characterChosen` — `false` só num estado criado por esta versão e ainda sem confirmação (mostra a primeira escolha). Estados e backups de versões anteriores não têm a chave e são lidos como `true`: quem já usa o app não é interrompido e continua com o personagem salvo. Ajustes corrompidos (não-objeto) são refeitos com os padrões e avisados como reparo, sem tocar no progresso.
  - A troca grava na hora (`App.chooseCharacter` → `flush`), então trocar e fechar o app logo em seguida não perde a escolha. A escolha vai junto no backup “Exportar”.

## Progresso

- Frases, blocos, rotinas, perguntas e gravações têm **IDs próprios** (`K01-B1-S1`, `K.Q1`, `sent:K01-…`): o progresso de um personagem não aparece nas sessões, revisões, lista de difíceis ou contagem de pendentes do outro.
- Itens de vocabulário **genéricos** são compartilhados de propósito: a mesma palavra estudada com um personagem volta na revisão do outro.
- XP, nível, sequência de dias e conquistas são **globais** (regras inalteradas).
- Links antigos para conteúdo do outro personagem (ex.: `#/lab?sentence=R01-B1-S1` com a Karla ativa) voltam à tela inicial da seção em vez de quebrar.

## Estados visuais (pendentes de imagem)

Seis estados por personagem: `idle`, `thinking`, `correct`, `wrong`, `celebrate` (Celebration), `levelup` (LevelUp).

| Estado | Onde aparece no app |
|---|---|
| idle | Ajustes (o Início e a escolha usam só o nome nesta etapa) |
| thinking | painel de feedback quando a resposta é “quase”/diferente do modelo |
| correct / wrong | painel de feedback do exercício |
| celebrate / levelup | fim da sessão (levelup quando a sessão subiu de nível) |

Enquanto a imagem de um estado não estiver aprovada, **nada muda nas telas de exercício** (o painel fica como antes) e Ajustes mostra um marcador com a inicial — não há imagem genérica; o Início e a escolha mostram só o nome.

**Para entregar as imagens aprovadas** (um arquivo por estado; não usar o painel conceitual inteiro):
1. PNG quadrado com fundo transparente, recomendado 512×512 px, otimizado (< 100 KB cada); o mesmo enquadramento nos seis estados.
2. Salvar como `assets/characters/<id>/<ESTADO>.png` — `IDLE`, `THINKING`, `CORRECT`, `WRONG`, `CELEBRATE`, `LEVELUP` (maiúsculas; o servidor diferencia).
3. Em `content/characters/<id>.json`, trocar `"status": "pending"` por `"ready"` só nos estados entregues e rodar o build (as imagens entram no pré-cache offline).
O Lucas segue a mesma convenção em `assets/characters/lucas/` quando as imagens dele existirem.

## Karla — o que foi usado e o que falta

Fonte: `content/characters/karla.json` (cópia de trabalho) e a **Character Bible — Karla v1.0**. Duas camadas: a rotina-base (K01–K03) só com fatos informados, cada frase apontando para o fato de origem e variações como **possibilidades** (“when…”, “if…”, “can…”); e os **episódios** (K04–K11), situações ilustrativas ancoradas no perfil, que não viram fatos biográficos. Mapa, matriz e backlog: [`karla-jornada.md`](karla-jornada.md).

- Perfil (rotina + Character Bible): personal trainer e instrutora de Pilates num clube; estuda Nutrição e faz pós-graduação em Biomecânica do Movimento e Postura; casada, dois filhos (11 e 7 anos; o mais novo muito apegado a ela); gosta de treinar, correr, Hyrox, café especial e leitura. **Não informados (e não inventados)**: idade dela, sobrenome, cidade, nome e profissão do marido, nomes dos filhos, nome do clube, meio de transporte.
- Jornada: K01 dia normal, K02 terças e quintas, K03 quando os planos mudam (rotina-base); K04–K11 episódios — família, Pilates, sessão com aluna, café e leitura, estudos, um dia que saiu do plano, Hyrox e planejamento da semana.

| # | Tema | Situação | Precisa confirmar |
|---|---|---|---|
| 1 | Rotina completa de segunda-feira | pendente | a rotina-base vale para a segunda? algo muda? |
| 2 | Expediente mais curto, treino às 16h | rascunho (K02) | ainda atende o aluno das 17h30? quais aulas terminam às 15h? o que faz depois das 17h30? |
| 3 | Possível cancelamento pela manhã | rascunho (K03-B1) | frequência; horário de saída |
| 4 | Outra rotina com expediente mais curto | pendente | qual dia? difere da terça/quinta? |
| 5 | Dia de trabalho normal | rascunho (K01) | como vai ao clube; onde almoça |
| 6 | Aula de spinning | rascunho (K03-B2) | horário das aulas de spinning |
| 7 | Corrida no lugar do treino do almoço | rascunho (K03-B3) | horário, local e duração da corrida |
| 8 | Pilates e atendimentos individuais | rascunho (K01-B2, B4, B5) | detalhes das aulas |
| 9 | Jantar e rotina familiar | rascunho (K01-B6) | o que costuma ter no jantar e no lanche |
| 10 | Encerramento da noite | rascunho (K01-B6) | o que é “organizar o dia seguinte” |

## Backlog (fora desta etapa)

- Avatares/ilustrações e as seis expressões de cada personagem (a infraestrutura de estados já existe; ver “Estados visuais”). Quando houver imagens, avaliar trocar o marcador de inicial dos Ajustes e incluir a imagem na escolha.
- Vozes de referência próprias para cada personagem (hoje: Lucas com áudio britânico pré-gerado; Karla com a voz do aparelho).
- Textos do Início ainda ligados à jornada do Lucas (“Para a próxima aula”, “Presencial”, “Treino para a aula”, cartão de boas-vindas que fala em “nove variações”): revisar com o conteúdo final da Karla. O atalho “Checklist antes da aula” só aparece quando o personagem tem checklist.
- Domínio de vocabulário: hoje os itens genéricos (`it.*`) são compartilhados de propósito entre os personagens e os itens próprios (`k.*`) não; decidir se isso continua antes de criar qualquer regra nova.
- Novos personagens, rotinas e exercícios; revisão humana do conteúdo da Karla (perguntas da tabela acima).
- Fora de escopo no projeto todo até nova decisão: cadastro/login, sincronização em nuvem, integração com outros repositórios.

Pendências técnicas da Karla: imagens dos seis estados; áudio britânico pré-gerado (o gerador `tools/gen_audio.py` ainda lê só o manifesto do conteúdo do Lucas); tabela de verbos (3ª pessoa) e drills próprios; revisão humana das frases antes de tirar o status “em preparação”. Detalhes e prioridades no backlog de [`karla-jornada.md`](karla-jornada.md).
