// Base Pedagógica — decisões aprovadas pelo usuário. Cada uma vira um registro DEC imutável (base/registros/decisoes.jsonl)
// com efeitos aplicados pela derivação global: a classificação central é registrada SEM apagar as classificações de
// origem, e a divergência correspondente passa a “resolvida”, apontando para a DEC. Uma decisão registrada não muda:
// para revê-la, acrescente uma nova DEC que a revogue.
const APROVACAO = 'usuário (responsável pelo projeto) — prompt “Fechamento e refinamento linguístico da Base Pedagógica, etapa R8/R9/R14”, 2026-11-09';

export const DECISOES = [];
