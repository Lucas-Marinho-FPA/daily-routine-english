// Controle central de áudio e reconhecimento local — testes em Node com elementos de mídia SIMULADOS
// (o comportamento real no navegador é coberto pelos testes de ponta a ponta).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as player from '../../app/js/audio/player.js';
import * as localasr from '../../app/js/audio/localasr.js';

/** <audio> simulado: play/pause/ended com eventos, como o HTMLMediaElement. */
class FakeMedia extends EventTarget {
  constructor() { super(); this.paused = true; this.ended = false; this.currentTime = 0; this.src = 'blob:fake'; this.loads = 0; }
  play() { this.paused = false; this.ended = false; this.dispatchEvent(new Event('play')); return Promise.resolve(); }
  pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event('pause')); } }
  finish() { this.paused = true; this.ended = true; this.dispatchEvent(new Event('ended')); }
  removeAttribute(n) { if (n === 'src') this.src = ''; }
  load() { this.loads++; }
}

test('playElement: toca, reflete estado e resolve ao terminar', async () => {
  const a = new FakeMedia();
  const p = player.playElement(a);
  assert.equal(a.paused, false);
  assert.equal(player.nowPlaying(), 'element');
  a.finish();
  assert.deepEqual(await p, { ok: true, reason: 'ended' });
  assert.equal(player.nowPlaying(), null);
});

test('pausa do usuário mantém a posição; tocar de novo retoma (não reinicia)', async () => {
  const a = new FakeMedia();
  const p = player.playElement(a);
  a.currentTime = 1.2;
  a.pause();
  assert.equal((await p).reason, 'pause');
  player.playElement(a);
  assert.equal(a.currentTime, 1.2);
  a.finish();
  player.playElement(a); // terminou: recomeça do início
  assert.equal(a.currentTime, 0);
  player.stopAll();
});

test('um áudio novo para o anterior (sem reprodução duplicada)', async () => {
  const a = new FakeMedia(), b = new FakeMedia();
  const pa = player.playElement(a);
  a.currentTime = 2;
  player.playElement(b);
  assert.equal(a.paused, true);
  assert.equal(a.currentTime, 0, 'parado por outro áudio volta ao início');
  assert.equal((await pa).reason, 'cancel');
  assert.equal(b.paused, false);
  player.stopAll();
  assert.equal(b.paused, true);
  assert.equal(player.nowPlaying(), null);
});

test('stopAll (troca de tela) para o elemento e não deixa ouvintes pendurados', async () => {
  const a = new FakeMedia();
  let calls = 0;
  const p = player.playElement(a);
  p.then(() => { calls++; });
  player.stopAll();
  await p;
  a.dispatchEvent(new Event('ended')); // eventos tardios não resolvem nada de novo
  a.dispatchEvent(new Event('pause'));
  await new Promise((r) => setTimeout(r, 5));
  assert.equal(calls, 1);
});

test('releaseElement: para se estiver tocando e libera o recurso (src removido)', () => {
  const a = new FakeMedia();
  player.playElement(a);
  player.releaseElement(a);
  assert.equal(a.paused, true);
  assert.equal(a.src, '');
  assert.ok(a.loads >= 1);
  assert.equal(player.nowPlaying(), null);
});

test('playSoon: reprodução agendada é cancelada se algo parar o áudio antes (próximo exercício/troca de tela)', async () => {
  const before = player.generation();
  player.playSoon({ key: null, text: '' }, 20);
  player.stopAll();
  assert.notEqual(player.generation(), before);
  await new Promise((r) => setTimeout(r, 40));
  assert.equal(player.nowPlaying(), null);
});

test('reconhecimento local: fora do navegador é "unsupported" com motivo, sem lançar erro', async () => {
  assert.ok(localasr.unsupportedReason().length > 0);
  assert.equal(await localasr.status(), 'unsupported');
  await assert.rejects(() => localasr.install(), /./);
  assert.doesNotThrow(() => localasr.release());
});
