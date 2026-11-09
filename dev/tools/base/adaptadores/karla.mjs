// Base Pedagógica — adaptador do grupo “karla” (R8). Usa as partes comuns de personagem.mjs.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE } from '../lib.mjs';
import { pacote } from './personagem.mjs';

export default function karla(api) {
  const catalogo = JSON.parse(readFileSync(join(BASE, 'progressao/catalogo.json'), 'utf8'));
  const k = pacote({ codigo: 'R8', quem: 'Karla', grupoMudanca: 'criada na consolidação de R8 (Karla)' }, { ...api, catalogo });
  const { psg, um, filhos, v, ev, add, nova, semUnidade, conteudo, txt } = k;

  const oStatus = um('/status'); ev(psg, oStatus); add(psg, 'atributos_origem', { campo: 'status', valor: conteudo(oStatus), origem: { ori: oStatus } });
  k.perfil([['/profile/occupation', 'ocupacao'], ['/profile/workplace', 'local_de_trabalho'], ['/profile/traits', 'tracos'], ['/profile/interests', 'interesses'],
    ['/profile/summary', 'resumo'], ['/profile/notProvided', 'nao_informado_na_fonte'], ['/profile/studies', 'estudos'], ['/profile/family', 'familia'],
    ['/profile/motto', 'lema'], ['/profile/source', 'fonte_do_perfil'], ['/facts', 'fatos'], ['/themes', 'temas']]);
  for (const { o, k: etapa } of filhos('/journey/stages')) { ev(psg, o); add(psg, 'etapas_da_jornada', { valor: { etapa, descricao: conteudo(o) }, origem: { ori: o } }); }
  const oJdoc = um('/journey/_doc'); ev(psg, oJdoc); psg.nota_da_jornada = v(oJdoc);
  for (const l of ['/_doc', '/idPrefix']) semUnidade(um(l), 'metadado', l === '/_doc' ? 'documentação do arquivo' : 'prefixo de identificadores do app');
  semUnidade(um('/visual'), 'metadado', 'configuração das imagens do personagem no app (arquivos e estados)');

  const resolver = k.itens();
  k.textos(resolver);
  k.perguntas(resolver);

  // personagens secundários declarados pela fonte (fictícios ou sem nome informado — nada é acrescentado)
  for (const { o } of filhos('/journey/secondaryCharacters')) {
    const x = conteudo(o);
    const s = ev(nova('PSG', `karla:${x.name}`, { codigo: `karla:${x.name}` }, 'personagem secundário declarado no pacote R8'), o);
    s.nome = v(o, 'name'); s.papel = v(o, 'role'); s.personagem_principal = psg.id;
    s.aparece_em = x.episodes.map((e) => { if (!txt[e]) throw new Error(`episódio inexistente ${e}`); return txt[e].id; });
  }
  return [...k.U.values()];
}
