import type {
  DisplayMode,
  Phase1GameId,
  QuizAttemptSession,
  QuizSubmissionResult,
  ScoreboardEntry,
} from '../types/lesson';

const STORAGE_PREFIX = 'jpd113_bai1_v1_';

export interface ReviewProgressState {
  part1Completed: boolean;
  part2Completed: boolean;
  part3Completed: boolean;
  completedGames: Phase1GameId[];
  weakNotes: string[];
  displayMode: DisplayMode;
  timerStartedAtMs: number | null;
  pausedRemainingSeconds: number | null;
}

const DEFAULT_PROGRESS: ReviewProgressState = {
  part1Completed: false,
  part2Completed: false,
  part3Completed: false,
  completedGames: [],
  weakNotes: [],
  displayMode: 'full',
  timerStartedAtMs: null,
  pausedRemainingSeconds: null,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return parsed === null ? fallback : (parsed as T);
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
  const raw = safeReadJson<unknown>('review_progress', null);
  if (!isPlainObject(raw)) {
    return { ...DEFAULT_PROGRESS };
  }

  return {
    part1Completed: raw.part1Completed === true,
    part2Completed: raw.part2Completed === true,
    part3Completed: raw.part3Completed === true,
    completedGames: Array.isArray(raw.completedGames)
      ? (raw.completedGames.filter((item): item is Phase1GameId =>
          item === 'tinder' || item === 'match' || item === 'tiles' || item === 'bug'
        ))
      : [],
    weakNotes: Array.isArray(raw.weakNotes)
      ? raw.weakNotes.filter((item): item is string => typeof item === 'string')
      : [],
    displayMode:
      raw.displayMode === 'kana' || raw.displayMode === 'challenge'
        ? raw.displayMode
        : 'full',
    timerStartedAtMs:
      typeof raw.timerStartedAtMs === 'number' &&
      Number.isFinite(raw.timerStartedAtMs) &&
      raw.timerStartedAtMs > 0
        ? raw.timerStartedAtMs
        : null,
    pausedRemainingSeconds:
      typeof raw.pausedRemainingSeconds === 'number' &&
      Number.isFinite(raw.pausedRemainingSeconds) &&
      raw.pausedRemainingSeconds >= 0
        ? raw.pausedRemainingSeconds
        : null,
  };
}

export function saveReviewProgress(state: ReviewProgressState): void {
  safeWriteJson('review_progress', state);
}

export function loadSavedSession(): QuizAttemptSession | null {
  const raw = safeReadJson<unknown>('active_quiz_session', null);
  if (
    !isPlainObject(raw) ||
    typeof raw.attemptId !== 'string' ||
    typeof raw.attemptNumber !== 'number' ||
    typeof raw.studentName !== 'string' ||
    typeof raw.studentCode !== 'string' ||
    typeof raw.startedAt !== 'string' ||
    (raw.mode !== 'supabase' && raw.mode !== 'local-demo')
  ) {
    return null;
  }
  return raw as unknown as QuizAttemptSession;
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
  const raw = safeReadJson<unknown>('active_quiz_answers', null);
  if (!isPlainObject(raw)) {
    return {};
  }
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (typeof v === 'string') {
      clean[k] = v;
    }
  }
  return clean;
}

export function saveActiveAnswers(answers: Record<string, string>): void {
  safeWriteJson('active_quiz_answers', answers);
}

export function loadSavedQuizResult(): QuizSubmissionResult | null {
  const raw = safeReadJson<unknown>('last_quiz_result', null);
  if (
    !isPlainObject(raw) ||
    typeof raw.attempt_id !== 'string' ||
    typeof raw.score !== 'number' ||
    typeof raw.total_questions !== 'number' ||
    !Array.isArray(raw.results)
  ) {
    return null;
  }
  return raw as unknown as QuizSubmissionResult;
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
  const raw = safeReadJson<unknown>('demo_scoreboard', []);
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter(
    (item): item is ScoreboardEntry =>
      isPlainObject(item) &&
      typeof item.attempt_id === 'string' &&
      typeof item.student_code === 'string' &&
      typeof item.score === 'number'
  );
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
