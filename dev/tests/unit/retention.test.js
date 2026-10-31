// Retenção de 7 dias dos áudios gravados — regra pura, com relógio controlado (sem esperar 7 dias).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { retentionStatus, expiresAt, RETENTION_MS, RETENTION_DAYS } from '../../app/js/engine/retention.js';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 23, 12, 0, 0);

test('7 dias corridos = 168 h, contados a partir da gravação', () => {
  assert.equal(RETENTION_DAYS, 7);
  assert.equal(RETENTION_MS, 168 * 60 * 60 * 1000);
});

test('menos de 7 dias: fica; exatamente no limite: apagado; mais de 7 dias: apagado', () => {
  assert.equal(retentionStatus(NOW - 6 * DAY - 23 * 3600e3, NOW), 'keep');
  assert.equal(retentionStatus(NOW - 7 * DAY + 1, NOW), 'keep', '1 ms antes do limite');
  assert.equal(retentionStatus(NOW - 7 * DAY, NOW), 'expire', 'exatamente 168 h');
  assert.equal(retentionStatus(NOW - 8 * DAY, NOW), 'expire');
  assert.equal(retentionStatus(NOW - 400 * DAY, NOW), 'expire');
});

test('nova gravação reinicia o prazo', () => {
  const first = NOW - 6.9 * DAY;
  assert.equal(retentionStatus(first, NOW + DAY), 'expire');
  const rerecorded = NOW; // regravado agora
  assert.equal(retentionStatus(rerecorded, NOW + DAY), 'keep');
  assert.equal(expiresAt(rerecorded), NOW + 7 * DAY);
});

test('datas inválidas, ausentes ou no futuro nunca apagam (ficam para diagnóstico)', () => {
  for (const v of [undefined, null, NaN, Infinity, -5, 0, '2026-10-01', {}]) assert.equal(retentionStatus(v, NOW), 'invalid', String(v));
  assert.equal(retentionStatus(NOW + 3 * DAY, NOW), 'invalid', 'relógio do aparelho voltou');
  assert.equal(retentionStatus(NOW + 2 * 3600e3, NOW), 'keep', 'pequena diferença de relógio é tolerada');
  assert.equal(expiresAt(null), null);
});

test('idempotente: avaliar de novo dá o mesmo resultado', () => {
  const t = NOW - 7.5 * DAY;
  assert.equal(retentionStatus(t, NOW), retentionStatus(t, NOW));
});
