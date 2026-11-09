// Base Pedagógica — adaptador do grupo “lukinhas” (R9 + R14). Usa as partes comuns de personagem.mjs.
// Os dez textos aprovados (R14) não são reescritos nem substituídos: cada sessão aponta para o seu texto aprovado e
// registra a conferência (as frases da sessão, unidas por um espaço, reproduzem o texto caractere por caractere).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BASE } from '../lib.mjs';
import { pacote } from './personagem.mjs';

export default function lukinhas(api) {
  const catalogo = JSON.parse(readFileSync(join(BASE, 'progressao/catalogo.json'), 'utf8'));
  const k = pacote({ codigo: 'R9', quem: 'Lukinhas', grupoMudanca: 'criada na consolidação de R9 (Lukinhas)' }, { ...api, catalogo });
  const { psg, um, v, ev, add, semUnidade, conteudo, txt } = k;

  for (const [l, chave] of [['/short', 'nome_curto'], ['/audience', 'publico'], ['/age', 'idade']]) { const o = um(l); ev(psg, o); psg[chave] = v(o); }
  const oStatus = um('/status'); ev(psg, oStatus); add(psg, 'atributos_origem', { campo: 'status', valor: conteudo(oStatus), origem: { ori: oStatus } });
  const oThemes = um('/themes'); ev(psg, oThemes); psg.temas = { valor: conteudo(oThemes), origem: { ori: oThemes } };
  k.perfil([['/profile/summary', 'resumo'], ['/profile/family', 'familia'], ['/profile/notProvided', 'nao_informado_na_fonte'], ['/profile/source', 'fonte_do_perfil'], ['/facts', 'fatos']]);
  for (const [l, m] of [['/_doc', 'documentação do arquivo'], ['/idPrefix', 'prefixo de identificadores do app'], ['/itemPrefix', 'prefixo de identificadores de itens do app'],
    ['/visual', 'configuração das imagens do personagem no app (arquivos e estados)'], ['/audio', 'voz usada para gerar o áudio no app']]) semUnidade(um(l), 'metadado', m);

  const resolver = k.itens();
  k.textos(resolver, (t, R) => {
    const o = um(R('session')); const x = conteudo(o);
    ev(t, o); t.sessao = { valor: { n: x.n, focus: x.focus }, origem: { ori: o } };
    t.nivel_da_fonte = { valor: x.level, escala: 'rótulo de nível do pacote Lukinhas (não CEFR)', origem: { ori: o, campo: 'level' } };
    t.vocabulario_da_sessao = x.vocabIds.map((iid, j) => ({ valor: resolver(iid), origem: { ori: o, campo: `vocabIds/${j}` } }));
  });
  k.perguntas(resolver);

  // R14: textos aprovados
  semUnidade(um('/_doc', 'R14'), 'metadado', 'documentação do arquivo');
  for (const { o, k: sid } of k.filhos('/texts', 'R14')) {
    const t = txt[sid]; if (!t) throw new Error(`texto aprovado sem sessão: ${sid}`);
    const juntas = t.segmentos.map((s) => k.U.get(s).original).join(' ');
    const igual = juntas === conteudo(o);
    if (!igual) throw new Error(`${sid}: as frases da sessão não reproduzem o texto aprovado`);
    ev(t, o); t.texto_aprovado = { ori: o, conferencia: 'idêntico caractere por caractere às frases da sessão unidas por um espaço' };
  }
  return [...k.U.values()];
}
