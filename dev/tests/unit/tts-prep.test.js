// Preparação do texto para o TTS (decisão do PO de 2026-11-14): reticências em pontos naturais, só no áudio.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const J = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), 'utf8'));
const PREP = J('../../content/tts/tts-prep.json').entries;
const LEDGER = J('../../content/build/tts-ledger.json');
const MAN = ['audio-manifest', 'characters-audio-manifest', 'journeys-audio-manifest', 'dialogues-audio-manifest']
  .flatMap((f) => J(`../../content/build/${f}.json`).map((m) => ({ ...m, file: f })));

test('texto do TTS = texto original + reticências: nenhuma palavra, vírgula ou pontuação mudou', () => {
  for (const e of PREP) {
    assert.match(e.tts, /\.\.\./, e.text);
    assert.equal(e.tts.replace(/\.\.\. /g, ' ').replace(/\.\.\./g, ''), e.text);
    assert.equal((e.tts.match(/,/g) || []).length, (e.text.match(/,/g) || []).length, `vírgula nova: ${e.tts}`);
    assert.doesNotMatch(e.tts, /[,;:.]\.\.\.|\.\.\.\s*[,;:]/, `reticências encostadas em pontuação: ${e.tts}`);
  }
});

test('reticências só em fronteira natural de frase longa (10+ palavras no trecho), nunca dentro de horário', () => {
  for (const e of PREP) for (const seg of e.tts.split(/(?<=[.?!])\s+(?=[A-Z])/)) {
    if (seg.includes('...')) assert.ok(seg.replace(/\.\.\./g, '').split(/\s+/).length >= 10, `trecho curto: ${seg}`);
  }
  assert.ok(PREP.every((e) => !/\d\.\.\.|\.\.\.\d/.test(e.tts)));
});

test('cada preparação tem um áudio com a MESMA chave, gerado com o texto do TTS e a voz de sempre; Conversation Practice intocada', () => {
  for (const e of PREP) {
    const ms = MAN.filter((m) => m.text === e.text);
    assert.ok(ms.length, `sem áudio: ${e.text}`);
    for (const m of ms) {
      assert.notEqual(m.file, 'journeys-audio-manifest', `Conversation Practice: ${e.text}`);
      assert.deepEqual(LEDGER[m.key], { text: e.text, tts: e.tts, voice: m.voice || 'bf_emma' });
    }
  }
  assert.equal(Object.keys(LEDGER).length, PREP.length);
  const cp = new Set(MAN.filter((m) => m.file === 'journeys-audio-manifest').map((m) => m.key));
  assert.ok(Object.keys(LEDGER).every((k) => !cp.has(k)));
});
