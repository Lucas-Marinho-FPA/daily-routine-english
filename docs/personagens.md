# Personagens

O app tem dois personagens recorrentes que usam **o mesmo motor de aprendizagem** (exercícios, corretor, revisão espaçada, XP, gravação, reconhecimento local e avaliação oral). O que muda de um para o outro é só o **conteúdo** praticado.

| | Lucas | Karla |
|---|---|---|
| Situação | ativo (conteúdo atual do app) | **em preparação** |
| Conteúdo | `data/content.js` (intocado) — 10 rotinas, 101 frases | `data/characters.js` — 3 rotinas, 18 frases, 18 itens próprios, 7 perguntas |
| Áudio de referência | 896 clipes britânicos pré-gerados | **pendente**: até ser gerado, o app usa a voz em inglês do aparelho (offline, qualidade varia) |
| Imagens dos 6 estados | **pendentes** (o app nunca teve imagem de personagem) | **pendentes** |

> Observação: antes desta etapa o app **não tinha** sistema de personagens — o “Lucas” existia só como a pessoa que narra as rotinas. Os seis estados com estes nomes seguem a convenção do Bora de Inglês (companheiro Tatu), adotada aqui para manter compatibilidade futura.

## Como funciona

- **Registro**: `tools/build-characters.mjs` lê `content/characters/*.json` (fonte) e gera `data/characters.js` (`window.DRG_CHARACTERS`), validando: IDs únicos e com prefixo do personagem, itens e fatos referenciados existentes, item presente na frase, seis estados declarados, sem colisão com o conteúdo do Lucas.
- **Visão de conteúdo** (`js/engine/characters.js#contentFor`): para o Lucas devolve o **próprio objeto** `DRG_CONTENT` (nada muda para quem já usa o app); para a Karla, uma visão no mesmo formato com as rotinas, frases e perguntas dela, os itens dela e os itens genéricos compartilhados (`it.wake-up`, `it.take-a-shower`…) reapontados para as frases dela.
- **Seleção**: Ajustes → Personagem. A escolha fica em `state.settings.character` (padrão `lucas`; estados e backups antigos recebem o padrão sem migração). Início mostra “Praticando com …”.

## Progresso

- Frases, blocos, rotinas, perguntas e gravações têm **IDs próprios** (`K01-B1-S1`, `K.Q1`, `sent:K01-…`): o progresso de um personagem não aparece nas sessões, revisões, lista de difíceis ou contagem de pendentes do outro.
- Itens de vocabulário **genéricos** são compartilhados de propósito: a mesma palavra estudada com um personagem volta na revisão do outro.
- XP, nível, sequência de dias e conquistas são **globais** (regras inalteradas).
- Links antigos para conteúdo do outro personagem (ex.: `#/lab?sentence=R01-B1-S1` com a Karla ativa) voltam à tela inicial da seção em vez de quebrar.

## Estados visuais (pendentes de imagem)

Seis estados por personagem: `idle`, `thinking`, `correct`, `wrong`, `celebrate` (Celebration), `levelup` (LevelUp).

| Estado | Onde aparece no app |
|---|---|
| idle | Início (“Praticando com …”) e Ajustes |
| thinking | painel de feedback quando a resposta é “quase”/diferente do modelo |
| correct / wrong | painel de feedback do exercício |
| celebrate / levelup | fim da sessão (levelup quando a sessão subiu de nível) |

Enquanto a imagem de um estado não estiver aprovada, **nada muda nas telas de exercício** (o painel fica como antes) e Início/Ajustes mostram um marcador com a inicial — não há imagem genérica.

**Para entregar as imagens aprovadas** (um arquivo por estado; não usar o painel conceitual inteiro):
1. PNG quadrado com fundo transparente, recomendado 512×512 px, otimizado (< 100 KB cada); o mesmo enquadramento nos seis estados.
2. Salvar como `assets/characters/<id>/<ESTADO>.png` — `IDLE`, `THINKING`, `CORRECT`, `WRONG`, `CELEBRATE`, `LEVELUP` (maiúsculas; o servidor diferencia).
3. Em `content/characters/<id>.json`, trocar `"status": "pending"` por `"ready"` só nos estados entregues e rodar o build (as imagens entram no pré-cache offline).
O Lucas segue a mesma convenção em `assets/characters/lucas/` quando as imagens dele existirem.

## Karla — o que foi usado e o que falta

Fonte: `content/characters/karla.json` (cópia de trabalho). Só fatos informados; cada frase aponta para o fato de origem. Variações estão como **possibilidades** (“when…”, “if…”, “can…”), não como rotina fixa.

- Perfil: personal trainer e instrutora de Pilates em um clube; organizada, disciplinada, determinada, positiva, acolhedora. **Não informados (e não inventados)**: idade, sobrenome, cidade, formação, número/nomes dos filhos, nome do marido, meio de transporte.
- Rotinas: K01 dia normal (rotina-base), K02 terças e quintas, K03 variações (cancelamento, spinning, corrida).

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

Pendências técnicas da Karla: imagens dos seis estados; áudio britânico pré-gerado (o gerador `tools/gen_audio.py` ainda lê só o manifesto do conteúdo do Lucas); tabela de verbos (3ª pessoa) e drills próprios; revisão humana das frases antes de tirar o status “em preparação”.
