// Base Pedagógica — decisões aprovadas pelo usuário. Cada uma vira um registro DEC imutável (base/registros/decisoes.jsonl)
// com efeitos aplicados pela derivação global: a classificação central é registrada SEM apagar as classificações de
// origem, e a divergência correspondente passa a “resolvida”, apontando para a DEC. Uma decisão registrada não muda:
// para revê-la, acrescente uma nova DEC com `revoga: [chave da anterior]` — a anterior permanece intacta como histórico
// e deixa de ter efeito.
const APROVACAO = 'usuário (responsável pelo projeto) — prompt “Fechamento e refinamento linguístico da Base Pedagógica, etapa R8/R9/R14”, 2026-11-09';

export const DECISOES = [
  {
    chave: 'subtipo:get changed', forma: 'get changed', data: '2026-11-09', status: 'aprovada', aprovada_por: APROVACAO,
    decisao: 'Classificação central de “get changed”: construção lexical / collocation, formada por get + particípio, com sentido de trocar de roupa. Não é phrasal verb em sentido estrito.',
    justificativa: 'Fonte original: R2 (Lucas) classifica como collocation; R9 (Lukinhas) como phrasal — ambas preservadas em classificacoes_origem. Análise linguística: “changed” é o particípio de change, não uma partícula adverbial; a estrutura é get + particípio com sentido reflexivo, como get dressed. Nas seis ocorrências registradas e nos quatro usos em texto o sentido é o mesmo (trocar de roupa): a divergência é terminológica. Análise completa: docs/base-pedagogica/analises/get-changed.md.',
    efeitos: [{ campo: 'subtipo', valor: 'collocation', explicacao: 'Construção get + particípio (como get dressed), com sentido de trocar de roupa; “changed” não funciona como partícula — não é phrasal verb em sentido estrito.' }],
  },
  {
    chave: 'subtipo:take care of', forma: 'take care of', data: '2026-11-09', status: 'aprovada', aprovada_por: APROVACAO,
    decisao: 'Classificação central de “take care of”: phrasal-prepositional verb, estrutura verbo + partícula + preposição.',
    justificativa: 'Fonte original: R8 (Karla) classifica como phrasal; R9 (Lukinhas) como collocation — ambas preservadas em classificacoes_origem. Decisão do usuário. Registro da análise linguística anterior, que divergia (docs/base-pedagogica/analises/get-changed.md §5): em “take care of”, “care” é usado como substantivo, e a análise havia proposto collocation (verbo + substantivo + preposição). A decisão aprovada prevalece; a observação fica registrada para eventual revisão.',
    efeitos: [{ campo: 'subtipo', valor: 'phrasal_preposicional', explicacao: 'Classificação central aprovada: phrasal-prepositional verb (verbo + partícula + preposição).' }],
  },
  {
    chave: 'subtipo:take care of#2', forma: 'take care of', data: '2026-11-09', status: 'aprovada', revoga: ['subtipo:take care of'],
    aprovada_por: 'usuário (responsável pelo projeto) — prompt “Ajustes finais — fechamento R8/R9/R14 e checklist mestre”, 2026-11-09',
    decisao: 'Revisão da classificação central de “take care of” (revoga DEC-000002): expressão verbal / construção multiword (subtipo chunk), estrutura verb + noun + preposition.',
    justificativa: 'Análise estrutural: “take” é verbo, “care” é substantivo e “of” é preposição — verb + noun + preposition. Não é phrasal-prepositional verb no sentido estrutural estrito, que pressupõe verbo + partícula + preposição (como put up with, look forward to). Categoria do esquema usada: chunk (bloco multiword fixo); nenhuma categoria nova foi criada. Classificações de origem preservadas: R8 (Karla) phrasal; R9 (Lukinhas) collocation. A DEC-000002 e a sua justificativa permanecem registradas como histórico, sem efeito.',
    efeitos: [{ campo: 'subtipo', valor: 'chunk', explicacao: 'Expressão verbal / construção multiword: verb (take) + noun (care) + preposition (of); não é phrasal-prepositional verb em sentido estrito.' }],
  },
];
