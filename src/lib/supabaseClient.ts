import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type {
  ChoiceKey,
  GradedQuestionResult,
  QuizAttemptSession,
  QuizSubmissionResult,
  ScoreboardEntry,
} from '../types/lesson';
import { isSupabaseConfigured, supabaseEnv } from './env';
import {
  appendLocalDemoScoreboard,
  loadLocalDemoScoreboard,
} from './storage';

export { isSupabaseConfigured };

const SUPABASE_REQUEST_TIMEOUT_MS = 15000;
const INVISIBLE_OR_CONTROL_RE = /[\u200B-\u200D\uFEFF\u0000-\u001F\u007F]/g;
export const STUDENT_CODE_PATTERN = /^[A-Z0-9_-]{2,24}$/;

let clientPromise: Promise<SupabaseClient | null> | null = null;
let realtimeChannelSeq = 0;

async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) {
    return null;
  }
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(supabaseEnv.url, supabaseEnv.anonKey, {
          db: {
            timeout: SUPABASE_REQUEST_TIMEOUT_MS,
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        })
      )
      .catch((err) => {
        // Clear rejected promise so transient chunk/network failures can recover on retry
        clientPromise = null;
        throw err;
      });
  }
  return clientPromise;
}

export function normalizeStudentCode(rawCode: string): string {
  return rawCode
    .replace(INVISIBLE_OR_CONTROL_RE, '')
    .trim()
    .replace(/\s+/g, '')
    .normalize('NFC')
    .toUpperCase();
}

export function normalizeStudentName(rawName: string): string {
  return rawName
    .replace(INVISIBLE_OR_CONTROL_RE, '')
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFC');
}

export function computeSyncedLocalStartMs(
  startedAt: string,
  serverNow?: string,
  clientNowMs: number = Date.now()
): { localStartedAtMs: number; serverOffsetMs: number } {
  const startedMs = new Date(startedAt).getTime();
  const serverNowMs = serverNow ? new Date(serverNow).getTime() : Number.NaN;

  if (Number.isFinite(startedMs) && Number.isFinite(serverNowMs)) {
    const serverOffsetMs = clientNowMs - serverNowMs;
    const syncedStartMs = Math.min(clientNowMs, startedMs + serverOffsetMs);
    return { localStartedAtMs: syncedStartMs, serverOffsetMs };
  }

  return { localStartedAtMs: clientNowMs, serverOffsetMs: 0 };
}

function formatSupabaseError(rawMessage: string | undefined, fallback: string): string {
  const msg = rawMessage?.trim() ?? '';
  if (!msg) return fallback;
  if (/AbortError|TimeoutError|aborted/i.test(msg)) {
    return 'Kết nối máy chủ bị quá thời gian chờ (15 giây). Dữ liệu làm bài vẫn được giữ trên máy — vui lòng bấm thử lại.';
  }
  if (/Failed to fetch|NetworkError|Load failed|fetch/i.test(msg)) {
    return 'Mất kết nối mạng hoặc không thể chạm tới máy chủ. Vui lòng kiểm tra Wi-Fi/4G và bấm thử lại.';
  }
  return msg;
}

export async function startQuizSession(
  rawName: string,
  rawCode: string
): Promise<QuizAttemptSession> {
  const studentName = normalizeStudentName(rawName);
  const studentCode = normalizeStudentCode(rawCode);

  if (studentName.length < 2 || studentName.length > 60) {
    throw new Error('Họ tên phải từ 2 đến 60 ký tự.');
  }
  if (!STUDENT_CODE_PATTERN.test(studentCode)) {
    throw new Error(
      'MSSV hoặc mã định danh phải từ 2 đến 24 ký tự (chữ cái không dấu, số, - hoặc _).'
    );
  }

  const client = await getSupabaseClient();
  if (client) {
    const { data, error } = await client.rpc('start_quiz_attempt', {
      p_student_name: studentName,
      p_student_code: studentCode,
    });

    if (error) {
      throw new Error(
        formatSupabaseError(
          error.message,
          'Không thể khởi tạo phiên thi trên Supabase.'
        )
      );
    }

    const payload = data as {
      attempt_id: string;
      attempt_number: number;
      student_name: string;
      student_code: string;
      started_at: string;
      server_now?: string;
    };

    const { localStartedAtMs, serverOffsetMs } = computeSyncedLocalStartMs(
      payload.started_at,
      payload.server_now
    );

    return {
      attemptId: payload.attempt_id,
      attemptNumber: payload.attempt_number,
      studentName: payload.student_name,
      studentCode: payload.student_code,
      startedAt: payload.started_at,
      localStartedAtMs,
      serverOffsetMs,
      mode: 'supabase',
    };
  }

  // Local Demo Mode (no backend configured)
  const existing = loadLocalDemoScoreboard();
  const previousCount = existing.filter(
    (item) => item.student_code === studentCode
  ).length;

  return {
    attemptId:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    attemptNumber: previousCount + 1,
    studentName,
    studentCode,
    startedAt: new Date().toISOString(),
    localStartedAtMs: Date.now(),
    mode: 'local-demo',
  };
}

export async function submitQuizSession(
  session: QuizAttemptSession,
  answers: Record<number, ChoiceKey>
): Promise<QuizSubmissionResult> {
  const stringKeyAnswers: Record<string, ChoiceKey> = {};
  for (const [k, v] of Object.entries(answers)) {
    stringKeyAnswers[String(k)] = v;
  }

  const client = await getSupabaseClient();
  if (client && session.mode === 'supabase') {
    const { data, error } = await client.rpc('submit_quiz_attempt', {
      p_attempt_id: session.attemptId,
      p_answers: stringKeyAnswers,
    });

    if (error) {
      throw new Error(
        formatSupabaseError(error.message, 'Không thể nộp bài lên Supabase.')
      );
    }

    return {
      ...(data as QuizSubmissionResult),
      mode: 'supabase',
    };
  }

  // Local Demo Mode: statically guarded so Vite strips the demo answer chunk when Supabase env vars are set
  if (!import.meta.env.VITE_SUPABASE_URL?.trim() || !import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()) {
    const { LOCAL_DEMO_ANSWER_KEY } = await import('../data/localDemoAnswerKey');
    const submittedAt = new Date().toISOString();
    const startedMs =
      session.localStartedAtMs ?? new Date(session.startedAt).getTime();
    const durationMs = Math.max(
      0,
      Number.isFinite(startedMs) ? Date.now() - startedMs : 0
    );

    let score = 0;
    const results: GradedQuestionResult[] = LOCAL_DEMO_ANSWER_KEY.map((item) => {
      const selected = answers[item.questionId] ?? null;
      const isCorrect = selected === item.correctChoice;
      if (isCorrect) score += 1;
      return {
        question_id: item.questionId,
        selected_choice: selected,
        correct_choice: item.correctChoice,
        is_correct: isCorrect,
        explanation: item.explanation,
      };
    });

    const entry: ScoreboardEntry = {
      id: session.attemptId,
      attempt_id: session.attemptId,
      student_name: session.studentName,
      student_code: session.studentCode,
      attempt_number: session.attemptNumber,
      score,
      total_questions: LOCAL_DEMO_ANSWER_KEY.length,
      duration_ms: durationMs,
      submitted_at: submittedAt,
    };

    appendLocalDemoScoreboard(entry);

    return {
      attempt_id: session.attemptId,
      attempt_number: session.attemptNumber,
      student_name: session.studentName,
      student_code: session.studentCode,
      score,
      total_questions: LOCAL_DEMO_ANSWER_KEY.length,
      duration_ms: durationMs,
      submitted_at: submittedAt,
      mode: 'local-demo',
      results,
    };
  }

  throw new Error('Phiên làm bài không khớp với cấu hình máy chủ.');
}

export async function fetchScoreboardEntries(): Promise<ScoreboardEntry[]> {
  const client = await getSupabaseClient();
  if (client) {
    // Query Attempt 1 explicitly (matching idx_scoreboard_ranking) alongside top overall
    // attempts so retakes cannot crowd out Attempt 1 prize candidates above 200 rows.
    const [firstAttemptRes, allAttemptsRes] = await Promise.all([
      client
        .from('scoreboard_entries')
        .select(
          'id, attempt_id, student_name, student_code, attempt_number, score, total_questions, duration_ms, submitted_at'
        )
        .eq('attempt_number', 1)
        .order('score', { ascending: false })
        .order('duration_ms', { ascending: true })
        .order('submitted_at', { ascending: true })
        .limit(500),
      client
        .from('scoreboard_entries')
        .select(
          'id, attempt_id, student_name, student_code, attempt_number, score, total_questions, duration_ms, submitted_at'
        )
        .order('score', { ascending: false })
        .order('duration_ms', { ascending: true })
        .order('submitted_at', { ascending: true })
        .limit(500),
    ]);

    if (firstAttemptRes.error) {
      throw new Error(
        formatSupabaseError(firstAttemptRes.error.message, 'Không thể tải Scoreboard.')
      );
    }
    if (allAttemptsRes.error) {
      throw new Error(
        formatSupabaseError(allAttemptsRes.error.message, 'Không thể tải Scoreboard.')
      );
    }

    const merged = new Map<string, ScoreboardEntry>();
    for (const row of (firstAttemptRes.data ?? []) as ScoreboardEntry[]) {
      merged.set(row.attempt_id, row);
    }
    for (const row of (allAttemptsRes.data ?? []) as ScoreboardEntry[]) {
      merged.set(row.attempt_id, row);
    }
    return Array.from(merged.values());
  }

  return loadLocalDemoScoreboard();
}

export function subscribeScoreboardChanges(
  onNewEntry: (entry: ScoreboardEntry) => void,
  onStatusChange?: (status: string) => void
): () => void {
  if (!isSupabaseConfigured) {
    onStatusChange?.('LOCAL_DEMO');
    return () => {};
  }

  let disposed = false;
  let activeClient: SupabaseClient | null = null;
  let activeChannel: RealtimeChannel | null = null;

  void getSupabaseClient()
    .then((client) => {
      if (disposed || !client) return;
      activeClient = client;
      const channelName = `scoreboard:entries:${++realtimeChannelSeq}:${Date.now()}`;
      activeChannel = client
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'scoreboard_entries',
          },
          (payload) => {
            if (!disposed && payload.new) {
              onNewEntry(payload.new as ScoreboardEntry);
            }
          }
        )
        .subscribe((status) => {
          if (!disposed) {
            onStatusChange?.(status);
          }
        });
    })
    .catch(() => {
      if (!disposed) {
        onStatusChange?.('CHANNEL_ERROR');
      }
    });

  return () => {
    disposed = true;
    if (activeClient && activeChannel) {
      void activeClient.removeChannel(activeChannel);
    }
  };
}
