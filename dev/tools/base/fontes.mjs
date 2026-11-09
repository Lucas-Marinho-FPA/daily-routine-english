// Base Pedagógica — catálogo das fontes e das regras de extração (granularidade dos registros de origem).
// Cada regra é um padrão de JSON pointer; tudo o que a fonte contém precisa cair em exatamente um registro
// (ver extrair.mjs). Acrescentar fontes aqui, uma etapa por vez (arquitetura.md §8).
export const VERSAO_PUBLICADA = 'b194cee';

export const FONTES = [
  {
    codigo: 'R1', titulo: 'Rotinas do Lucas — extração generalizada do documento Word', grupo: 'lucas',
    arquivo: 'dev/content/word/word-extract.json', versao: VERSAO_PUBLICADA, natureza: 'derivada', distribuicao: 'integral',
    observacao: 'extração do documento Word original das rotinas (E1, ainda não registrado), com o empregador generalizado',
    regras: ['/source', '/intro/*', '/howToUse/*', '/standards/*', '/routines/*/id', '/routines/*/title', '/routines/*/goal',
      '/routines/*/en/*', '/routines/*/pt/*', '/routines/*/vocab/*', '/routines/*/phrasal/*', '/routines/*/usage/*',
      '/routines/*/questions/*', '/toolkit/intro', '/toolkit/structures/*', '/toolkit/simplePresent/*', '/toolkit/phrasalReview/*',
      '/generalQuestions/*', '/drills/*', '/checklist/*', '/mainGoal'],
  },
  {
    codigo: 'R2', titulo: 'Itens do Lucas — tabela de enriquecimento, itens novos e verbos', grupo: 'lucas',
    arquivo: 'dev/content/enrich/items.json', versao: VERSAO_PUBLICADA, natureza: 'autoria', distribuicao: 'integral',
    regras: ['/_doc', '/aliases/*', '/table/*', '/new/*', '/verbs/*'],
  },
  {
    codigo: 'R3', titulo: 'Perguntas novas e palavras-chave do Lucas', grupo: 'lucas',
    arquivo: 'dev/content/enrich/questions.json', versao: VERSAO_PUBLICADA, natureza: 'autoria', distribuicao: 'integral',
    regras: ['/_doc', '/new/*', '/keywords/*'],
  },
  {
    codigo: 'R4', titulo: 'Regras de idioma do corretor', grupo: 'lucas',
    arquivo: 'dev/content/enrich/language.json', versao: VERSAO_PUBLICADA, natureza: 'autoria', distribuicao: 'integral',
    regras: ['/_doc', '/contractions/*', '/spellingAmE/*', '/practiceVerb', '/synonyms/_doc', '/synonyms/groups/*', '/errors/*',
      '/stopwords/*', '/determiners/*', '/numberWords/*'],
  },
  {
    codigo: 'R5', titulo: 'Estrutura das rotinas do Lucas — contextos, categorias, blocos', grupo: 'lucas',
    arquivo: 'dev/content/enrich/structure.json', versao: VERSAO_PUBLICADA, natureza: 'autoria', distribuicao: 'integral',
    regras: ['/_doc', '/contexts/*', '/categories/*', '/routines/*/pt', '/routines/*/dayType', '/routines/*/priority',
      '/routines/*/blocks/*', '/dayTypes/*'],
  },
  {
    codigo: 'R6', titulo: 'Registro de revisão linguística e lacunas do Word', grupo: 'lucas',
    arquivo: 'dev/content/enrich/review-log.json', versao: VERSAO_PUBLICADA, natureza: 'autoria', distribuicao: 'integral',
    regras: ['/_doc', '/rev/*', '/gap/*'],
  },
  {
    codigo: 'R7', titulo: 'Lucas 2.0 — perfil e episódios R11–R18', grupo: 'lucas',
    arquivo: 'dev/content/enrich/episodes.json', versao: VERSAO_PUBLICADA, natureza: 'autoria', distribuicao: 'integral',
    regras: ['/_doc', '/profile/source', '/profile/traits/*', '/profile/facts/*', '/profile/pending/*', '/existing/*',
      '/routines/*/id', '/routines/*/title', '/routines/*/pt', '/routines/*/stage', '/routines/*/basis/*', '/routines/*/goal',
      '/routines/*/grammar', '/routines/*/usage/*', '/routines/*/blocks/*/pt', '/routines/*/blocks/*/kind', '/routines/*/blocks/*/ctx',
      '/routines/*/blocks/*/sentences/*', '/routines/*/universe', '/routines/*/traits/*', '/items/*', '/questions/*'],
  },
];
