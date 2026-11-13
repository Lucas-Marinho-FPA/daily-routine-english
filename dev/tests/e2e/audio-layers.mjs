// Validação dos áudios das atividades em camadas (unidades e frases; ex.: john-p1-e01) ANTES da integração.
// Uso: node tests/e2e/audio-layers.mjs <pasta-do-site> <caminho-base> [pasta-de-evidências]
// Para cada chave de áudio de unidade/frase: (1) arquivo presente; (2) Opus, mono, duração plausível para o texto
// (ffprobe); (3) não é silêncio (ffmpeg volumedetect); (4) correspondência com o texto: transcrição pelo reconhecedor
// do próprio app (Moonshine, local, no navegador) comparada palavra a palavra com a forma falada. Nada é alterado.
import { chromium } from 'playwright';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const SITE = resolve(process.argv[2] || 'app');
const BASE_PATH = process.argv[3] || '/';
const OUT = resolve(process.argv[4] || 'evidence/audio-layers');
mkdirSync(OUT, { recursive: true });
const APP = join(SITE, BASE_PATH.replace(/^\/|\/$/g, ''));
const w = {}; new Function('window', readFileSync(join(APP, 'data/dialogues.js'), 'utf8'))(w);
const P = w.DRG_DIALOGUES;
const items = P.items.filter((i) => i.layer);
const MAN = JSON.parse(readFileSync(join(ROOT, 'content/build/dialogues-audio-manifest.json'), 'utf8'));
const voiceOf = (key) => (MAN.find((m) => m.key === key) || {}).voice || null;
// falas das atividades em camadas: voz do personagem (Rick = bm_lewis, John = bm_george, mapa de tools/build-dialogues.mjs)
const LAYERED = P.activities.filter((a) => a.format === 'layers-v1');
const LINES = LAYERED.flatMap((a) => a.lines);
const byKey = new Map(); for (const it of items) { if (!byKey.has(it.audio)) byKey.set(it.audio, []); byKey.get(it.audio).push(it); }
const words = (t) => String(t || '').toLowerCase().replace(/[’]/g, "'").replace(/\bi'm\b/g, 'i am').replace(/\bthat's\b/g, 'that is').replace(/\bdidn't\b/g, 'did not').match(/[a-z']+/g) || [];
const lcs = (a, b) => { const d = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0)); for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) d[i][j] = a[i] === b[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]); return d[0][0]; };

const probe = (f) => {
  const s = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_name,channels', '-show_entries', 'format=duration', '-of', 'json', f], { encoding: 'utf8' });
  const j = JSON.parse(s);
  return { codec: j.streams[0].codec_name, channels: j.streams[0].channels, secs: +(+j.format.duration).toFixed(2) };
};
const meanVol = (f) => { const r = require_spawn(f); const m = r.match(/mean_volume: (-?[\d.]+) dB/); const x = r.match(/max_volume: (-?[\d.]+) dB/); return { mean: m ? +m[1] : null, max: x ? +x[1] : null, tail: tailMax(f) }; };
// fim do arquivo: os últimos 120 ms devem ser silêncio (a síntese não foi cortada no meio da fala)
const tailMax = (f) => { const r = spawnSync('ffmpeg', ['-hide_banner', '-sseof', '-0.12', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr || ''; const x = r.match(/max_volume: (-?[\d.]+) dB/); return x ? +x[1] : null; };
function require_spawn(f) { return spawnSync('ffmpeg', ['-hide_banner', '-i', f, '-af', 'volumedetect', '-f', 'null', '-'], { encoding: 'utf8' }).stderr || ''; }

const rows = [];
for (const l of LINES) { if (!byKey.has(l.audio)) byKey.set(l.audio, [{ id: l.id, spoken: l.en, line: true, speakerId: l.speakerId, voice: l.voice }]); }
for (const [key, its] of byKey) {
  const f = join(APP, 'audio', `${key}.ogg`);
  const r = { key, ids: its.map((i) => i.id).join(' '), text: its[0].spoken, file: existsSync(f), voice: its[0].line ? its[0].voice : voiceOf(key), line: !!its[0].line, speakerId: its[0].speakerId || null };
  if (r.file) Object.assign(r, probe(f), meanVol(f));
  rows.push(r);
}

// transcrição pelo Moonshine do app
const PORT = 8846, server = await serve(SITE, PORT);
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
await page.goto(`http://localhost:${PORT}${BASE_PATH}`); await page.waitForFunction(() => window.DRG_APP && window.DRG_APP.asr);
await page.evaluate(() => window.DRG_APP.asr.local.install());
for (const r of rows) {
  if (!r.file) continue;
  const n = words(r.text).length;
  r.heard = await page.evaluate(async ({ key, word }) => {
    const b = await (await fetch(`audio/${key}.ogg`)).blob();
    try { return (await window.DRG_APP.asr.local.transcribe(b, { word })).text; } catch (e) { return `ERRO ${e.code || e.message}`; }
  }, { key: r.key, word: n <= 1 });
  const exp = words(r.text), got = words(r.heard);
  r.match = exp.length ? Math.round((100 * lcs(exp, got)) / exp.length) : 0;
}
await browser.close(); server.close();

// critérios: arquivo + Opus mono + duração plausível + não silencioso + ≥ 80% das palavras reconhecidas
for (const r of rows) {
  const n = String(r.text).trim().split(/\s+/).length; // palavras como escritas (contrações contam 1)
  r.problems = [];
  if (!r.file) r.problems.push('arquivo ausente');
  else {
    if (r.codec !== 'opus' || r.channels !== 1) r.problems.push(`formato ${r.codec}/${r.channels}`);
    if (r.secs < 0.4 || r.secs > 1.5 + n * 0.9) r.problems.push(`duração ${r.secs}s para ${n} palavra(s)`);
    if (r.max === null || r.max < -20) r.problems.push(`volume baixo (pico ${r.max} dB)`);
    if (r.max !== null && r.max >= -0.1) r.problems.push(`saturação (pico ${r.max} dB)`);
    if (r.tail === null || r.tail > -35) r.problems.push(`fim sem silêncio (${r.tail} dB nos últimos 120 ms): possível corte`);
    const want = r.line ? { rick: 'bm_lewis', john: 'bm_george' }[r.speakerId] : 'bf_emma';
    if (want && r.voice !== want) r.problems.push(`voz ${r.voice} ≠ ${want}`);
    // trechos de até 2 palavras: o reconhecedor local (Moonshine) erra fragmentos curtos com qualquer voz (verificado em
    // 2026-11-13: “work for” → “Work so / Workthorn / Work forth” em 4 vozes; “didn't we?” correto com silêncio nas
    // pontas). Abaixo de 80% aí é AVISO (escuta humana), não falha; em textos maiores, é falha.
    if (r.match < 80) (n <= 2 ? (r.warnings = r.warnings || []) : r.problems).push(`transcrição ${r.match}% (“${r.heard}”)`);
  }
}
writeFileSync(join(OUT, 'audio-layers.json'), JSON.stringify(rows, null, 1));
const bad = rows.filter((r) => r.problems.length);
for (const r of rows) console.log(`${r.problems.length ? '✘' : r.warnings ? '⚠' : '✔'} ${r.key} ${r.line ? `[fala ${r.speakerId}]` : ''} ${r.voice} ${r.secs ?? '-'}s pico ${r.max ?? '-'}dB fim ${r.tail ?? '-'}dB ${r.match ?? '-'}% · “${r.text}” → “${r.heard ?? ''}”${r.problems.length ? ` · ${r.problems.join('; ')}` : ''}${r.warnings ? ` · aviso: ${r.warnings.join('; ')} — escuta humana` : ''}`);
console.log(`${rows.length - bad.length}/${rows.length} aprovados, ${rows.filter((r) => r.warnings).length} com aviso de reconhecimento (escuta humana) (${items.length} unidades/frases, ${rows.length} chaves distintas)`);
process.exit(bad.length ? 1 : 0);
