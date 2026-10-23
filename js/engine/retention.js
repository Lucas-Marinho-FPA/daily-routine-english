// Retenção automática de áudios gravados (função pura, testável com relógio controlado).
// Regra: cada ÁUDIO é apagado quando completa 7 dias corridos (7 × 24 h = 168 h) desde a gravação mais
// recente daquele exercício. Ex.: gravado em 1/10 às 10:00 → apagado a partir de 8/10 às 10:00.
// Só o áudio sai: transcrição, avaliação e todo o progresso continuam (ver store/db.js).
// Datas ausentes, inválidas ou no futuro (relógio do aparelho alterado) NÃO apagam nada: ficam registradas.

export const RETENTION_DAYS = 7;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;
const FUTURE_TOLERANCE_MS = 24 * 60 * 60 * 1000; // fuso/relógio levemente adiantado não invalida

/** 'keep' | 'expire' | 'invalid' para um áudio gravado em `recordedAt` (ms), avaliado em `now`. */
export function retentionStatus(recordedAt, now = Date.now()) {
  if (typeof recordedAt !== 'number' || !Number.isFinite(recordedAt) || recordedAt <= 0) return 'invalid';
  if (recordedAt > now + FUTURE_TOLERANCE_MS) return 'invalid';
  return now - recordedAt >= RETENTION_MS ? 'expire' : 'keep';
}

/** Quando o áudio será apagado (ms), ou null se a data não for válida. */
export const expiresAt = (recordedAt) => (retentionStatus(recordedAt, recordedAt) === 'invalid' ? null : recordedAt + RETENTION_MS);
