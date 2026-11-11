#!/usr/bin/env node
// Build das atividades de diálogo: content/dialogues/john.json (gerado por tools/dialogues-source.mjs, texto literal)
// → app/data/dialogues.js (window.DRG_DIALOGUES) + content/build/dialogues-audio-manifest.json (para tools/gen_audio.py).
//
// Áudio: uma chave por fala (voz britânica do personagem) e por item de vocabulário (voz padrão). A chave só vira
// “áudio disponível” no app quando o arquivo existe de verdade (app/data/audio-index.js, gerado pelo gen_audio.py);
// nada é marcado como disponível sem arquivo.
//
// Avaliação online: o endereço do AI Gateway entra SÓ por variável de ambiente no build (DRG_EVAL_ENDPOINT=https://…);
// sem ela, evaluation.endpoint = null e a tradução fica pendente (nada é simulado). Nenhum segredo passa por aqui.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { audioKey } from '../app/js/engine/text.js';
import { spokenItem } from '../app/js/engine/dialogue.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APP = join(ROOT, 'app');
const src = JSON.parse(readFileSync(join(ROOT, 'content/dialogues/john.json'), 'utf8'));

// vozes britânicas (Kokoro, Apache-2.0) por personagem — escolha técnica, registrada aqui; papéis genéricos usam
// a voz de acordo com o gênero indicado no texto quando houver, senão a padrão
const VOICES = {
  john: 'bm_george', rick: 'bm_lewis', peter: 'bm_daniel', ruan: 'bm_fable', stuart: 'bm_daniel', rodri: 'bm_fable',
  mary: 'bf_emma', jessy: 'bf_isabella', ana: 'bf_lily', ketlyn: 'bf_alice', joana: 'bf_alice', penelope: 'bf_lily',
  'role-commentator': 'bm_fable', 'role-announcement': 'bf_alice', _default: 'bf_alice',
};
const DEFAULT_ITEM_VOICE = 'bf_emma'; // mesma voz padrão do restante do app (itens isolados)
const voiceOf = (speakerId) => VOICES[speakerId] || VOICES._default;

const audio = [];
const add = (text, kind, voice) => {
  const key = voice === DEFAULT_ITEM_VOICE ? audioKey(text) : audioKey(`${voice}|${text}`);
  if (!audio.some((a) => a.key === key)) audio.push({ key, text, kind, voice });
  return key;
};

const activities = src.activities.map((a) => ({
  ...a,
  contentVersion: src.contentVersion,
  lines: a.lines.map((l) => ({ ...l, audio: add(l.en, 'dialogue-line', voiceOf(l.speakerId)), voice: voiceOf(l.speakerId) })),
}));
const items = src.items.map((it) => ({ ...it, spoken: spokenItem(it.en), audio: add(spokenItem(it.en), 'dialogue-item', DEFAULT_ITEM_VOICE) }));

const endpoint = process.env.DRG_EVAL_ENDPOINT || null;
if (endpoint && !/^https:\/\/[a-z0-9.-]+(:\d+)?(\/[\w./-]*)?$/i.test(endpoint)) throw new Error('DRG_EVAL_ENDPOINT precisa ser um endereço https:// sem credenciais');

const out = {
  kind: src.kind, formato: src.formato, id: src.id, title: src.title, locale: src.locale, contentVersion: src.contentVersion,
  provenance: src.provenance, cast: src.cast, parts: src.parts, activities, items, questions: src.questions || [],
  evaluation: { endpoint, timeoutMs: 20000 },
};
writeFileSync(join(APP, 'data/dialogues.js'), `// GERADO por tools/build-dialogues.mjs a partir de content/dialogues/john.json — não editar à mão.\nwindow.DRG_DIALOGUES = ${JSON.stringify(out)};\n`);
writeFileSync(join(ROOT, 'content/build/dialogues-audio-manifest.json'), JSON.stringify(audio, null, 0));

// CSP: a única conexão externa possível é o AI Gateway configurado (sem ele, index.html continua só 'self')
const indexPath = join(APP, 'index.html');
let html = readFileSync(indexPath, 'utf8');
const origin = endpoint ? new URL(endpoint).origin : null;
html = html.replace(/connect-src [^;]*;/, `connect-src 'self' file: blob: data:${origin ? ` ${origin}` : ''};`);
if (!html.includes('data/dialogues.js')) html = html.replace('<script src="data/audio-index.js"></script>', '<script src="data/audio-index.js"></script>\n  <script src="data/dialogues.js"></script>');
writeFileSync(indexPath, html);

const present = existsSync(join(APP, 'data/audio-index.js')) ? readFileSync(join(APP, 'data/audio-index.js'), 'utf8') : '';
const withAudio = audio.filter((a) => present.includes(`"${a.key}"`)).length;
console.log(JSON.stringify({ dialogues: activities.length, lines: activities.reduce((n, a) => n + a.lines.length, 0), items: items.length, questions: out.questions.length, audio: audio.length, audioPresent: withAudio, evaluationEndpoint: endpoint ? origin : null }));
