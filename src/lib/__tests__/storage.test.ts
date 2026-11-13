import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  appendLocalDemoScoreboard,
  loadLocalDemoScoreboard,
  loadReviewProgress,
  loadSavedAnswers,
  loadSavedQuizResult,
  loadSavedSession,
  saveActiveAnswers,
  saveActiveSession,
  saveQuizResult,
  saveReviewProgress,
} from '../storage';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
  };
}

describe('LocalStorage Resilience & Payload Validation', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns safe defaults when localStorage contains "null", arrays, or corrupt field types', () => {
    const storage = createMemoryStorage({
      jpd113_bai1_v1_review_progress: JSON.stringify({
        part1Completed: 'yes',
        completedGames: ['tinder', 'swipe', 123, null],
        displayMode: 'broken-mode',
        timerStartedAtMs: -1,
        pausedRemainingSeconds: -50,
      }),
      jpd113_bai1_v1_active_quiz_session: 'null',
      jpd113_bai1_v1_active_quiz_answers: '["not-an-object"]',
      jpd113_bai1_v1_last_quiz_result: JSON.stringify({ attempt_id: 'a1' }),
      jpd113_bai1_v1_demo_scoreboard: JSON.stringify([
        null,
        { attempt_id: 123 },
        {
          id: 'ok-1',
          attempt_id: 'ok-1',
          student_code: 'SE101',
          student_name: 'Nguyễn A',
          attempt_number: 1,
          score: 19,
          total_questions: 20,
          duration_ms: 42000,
          submitted_at: '2026-11-14T00:00:00Z',
        },
      ]),
    });

    vi.stubGlobal('window', { localStorage: storage });

    const progress = loadReviewProgress();
    expect(progress.part1Completed).toBe(false);
    expect(progress.completedGames).toEqual(['tinder']);
    expect(progress.displayMode).toBe('full');
    expect(progress.timerStartedAtMs).toBeNull();
    expect(progress.pausedRemainingSeconds).toBeNull();

    expect(loadSavedSession()).toBeNull();
    expect(loadSavedAnswers()).toEqual({});
    expect(loadSavedQuizResult()).toBeNull();
    expect(loadLocalDemoScoreboard()).toHaveLength(1);
    expect(loadLocalDemoScoreboard()[0].attempt_id).toBe('ok-1');
  });

  it('degrades gracefully without throwing when localStorage throws SecurityError or QuotaExceededError', () => {
    const throwingStorage: Storage = {
      length: 0,
      clear: () => {
        throw new Error('Blocked');
      },
      getItem: () => {
        throw new Error('SecurityError');
      },
      key: () => null,
      removeItem: () => {
        throw new Error('Blocked');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };

    vi.stubGlobal('window', { localStorage: throwingStorage });

    expect(() => loadReviewProgress()).not.toThrow();
    expect(() => saveReviewProgress(loadReviewProgress())).not.toThrow();
    expect(() => loadSavedSession()).not.toThrow();
    expect(() => saveActiveSession(null)).not.toThrow();
    expect(() => loadSavedAnswers()).not.toThrow();
    expect(() => saveActiveAnswers({ 'q-01': 'A' })).not.toThrow();
    expect(() => loadSavedQuizResult()).not.toThrow();
    expect(() => saveQuizResult(null)).not.toThrow();
    expect(() =>
      appendLocalDemoScoreboard({
        id: 'd1',
        attempt_id: 'd1',
        student_code: 'SE01',
        student_name: 'Test',
        attempt_number: 1,
        score: 20,
        total_questions: 20,
        duration_ms: 10000,
        submitted_at: '2026-11-14T00:00:00Z',
      })
    ).not.toThrow();
  });

  it('filters out non-string answer values and supports valid round-trips', () => {
    const storage = createMemoryStorage({
      jpd113_bai1_v1_active_quiz_answers: JSON.stringify({
        'q-01': 'A',
        'q-02': 999,
        'q-03': null,
      }),
    });
    vi.stubGlobal('window', { localStorage: storage });

    expect(loadSavedAnswers()).toEqual({ 'q-01': 'A' });

    saveActiveSession({
      attemptId: 'att-1',
      studentCode: 'SE211449',
      studentName: 'Trần Khánh Tường',
      attemptNumber: 1,
      startedAt: '2026-11-14T00:00:00.000Z',
      localStartedAtMs: 1700000000000,
      serverOffsetMs: 0,
      mode: 'supabase',
    });
    expect(loadSavedSession()?.attemptId).toBe('att-1');
  });
});
