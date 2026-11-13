import { describe, expect, it } from 'vitest';
import {
  STUDENT_CODE_PATTERN,
  computeSyncedLocalStartMs,
  normalizeStudentCode,
  normalizeStudentName,
} from '../supabaseClient';

describe('Student Identity Normalization & Clock Sync', () => {
  it('normalizes student code by removing invisible/control chars, spaces, and uppercasing NFC', () => {
    expect(normalizeStudentCode('  se 181\u200B 234\uFEFF  ')).toBe('SE181234');
    expect(normalizeStudentCode('\u0007he-19_001')).toBe('HE-19_001');
  });

  it('normalizes student name from NFD to NFC while collapsing whitespace and stripping zero-width chars', () => {
    const nfdName = '  Trần\u200B   Khánh\uFEFF   Tường  '.normalize('NFD');
    const normalized = normalizeStudentName(nfdName);
    expect(normalized).toBe('Trần Khánh Tường');
    expect(normalized).toBe('Trần Khánh Tường'.normalize('NFC'));
  });

  it('enforces strict student code format matching PostgreSQL regex', () => {
    expect(STUDENT_CODE_PATTERN.test('SE211449')).toBe(true);
    expect(STUDENT_CODE_PATTERN.test('HS-19_01')).toBe(true);
    expect(STUDENT_CODE_PATTERN.test('A')).toBe(false);
    expect(STUDENT_CODE_PATTERN.test('SE@181234')).toBe(false);
    expect(STUDENT_CODE_PATTERN.test('A'.repeat(25))).toBe(false);
  });

  it('compensates client clock skew using server_now when resuming an active attempt', () => {
    const startedAt = '2026-11-14T01:00:00.000Z';
    const serverNow = '2026-11-14T01:02:00.000Z'; // 120s elapsed on server
    const skewedClientNowMs = Date.parse('2026-11-14T01:07:00.000Z'); // client +5m ahead

    const synced = computeSyncedLocalStartMs(startedAt, serverNow, skewedClientNowMs);
    expect(synced.serverOffsetMs).toBe(300_000);
    expect(skewedClientNowMs - synced.localStartedAtMs).toBe(120_000);
  });

  it('clamps future start timestamps to clientNowMs and falls back cleanly on invalid dates', () => {
    const clientNowMs = Date.parse('2026-11-14T01:00:00.000Z');
    const futureStart = computeSyncedLocalStartMs(
      '2026-11-14T01:00:05.000Z',
      '2026-11-14T01:00:00.000Z',
      clientNowMs
    );
    expect(futureStart.localStartedAtMs).toBe(clientNowMs);

    const invalidFallback = computeSyncedLocalStartMs('bad-date', undefined, clientNowMs);
    expect(invalidFallback).toEqual({
      localStartedAtMs: clientNowMs,
      serverOffsetMs: 0,
    });
  });
});
