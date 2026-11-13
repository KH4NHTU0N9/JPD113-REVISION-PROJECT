import type {
  DisplayMode,
  QuizAttemptSession,
  QuizSubmissionResult,
  ScoreboardEntry,
} from '../types/lesson';

const STORAGE_PREFIX = 'jpd113_bai1_v1_';

export interface ReviewProgressState {
  part1Completed: boolean;
  part2Completed: boolean;
  part3Completed: boolean;
  weakNotes: string[];
  displayMode: DisplayMode;
  timerStartedAtMs: number | null;
}

const DEFAULT_PROGRESS: ReviewProgressState = {
  part1Completed: false,
  part2Completed: false,
  part3Completed: false,
  weakNotes: [],
  displayMode: 'full',
  timerStartedAtMs: null,
};

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore storage quota or private-mode restrictions safely
  }
}

export function loadReviewProgress(): ReviewProgressState {
  return {
    ...DEFAULT_PROGRESS,
    ...safeReadJson<Partial<ReviewProgressState>>('review_progress', {}),
  };
}

export function saveReviewProgress(state: ReviewProgressState): void {
  safeWriteJson('review_progress', state);
}

export function loadSavedSession(): QuizAttemptSession | null {
  return safeReadJson<QuizAttemptSession | null>('active_quiz_session', null);
}

export function saveActiveSession(session: QuizAttemptSession | null): void {
  if (!session) {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}active_quiz_session`);
    } catch {
      // Ignore
    }
    return;
  }
  safeWriteJson('active_quiz_session', session);
}

export function loadSavedAnswers(): Record<string, string> {
  return safeReadJson<Record<string, string>>('active_quiz_answers', {});
}

export function saveActiveAnswers(answers: Record<string, string>): void {
  safeWriteJson('active_quiz_answers', answers);
}

export function loadSavedQuizResult(): QuizSubmissionResult | null {
  return safeReadJson<QuizSubmissionResult | null>('last_quiz_result', null);
}

export function saveQuizResult(result: QuizSubmissionResult | null): void {
  if (!result) {
    try {
      window.localStorage.removeItem(`${STORAGE_PREFIX}last_quiz_result`);
    } catch {
      // Ignore
    }
    return;
  }
  safeWriteJson('last_quiz_result', result);
}

export function loadLocalDemoScoreboard(): ScoreboardEntry[] {
  return safeReadJson<ScoreboardEntry[]>('demo_scoreboard', []);
}

export function appendLocalDemoScoreboard(entry: ScoreboardEntry): ScoreboardEntry[] {
  const existing = loadLocalDemoScoreboard();
  if (existing.some((item) => item.attempt_id === entry.attempt_id)) {
    return existing;
  }
  const updated = [...existing, entry];
  safeWriteJson('demo_scoreboard', updated);
  return updated;
}

export function clearLocalDemoScoreboard(): void {
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}demo_scoreboard`);
  } catch {
    // Ignore
  }
}
