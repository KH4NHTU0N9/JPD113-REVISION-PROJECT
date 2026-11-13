import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import type {
  ChoiceKey,
  GradedQuestionResult,
  QuizAttemptSession,
  QuizSubmissionResult,
  ScoreboardEntry,
} from '../types/lesson';
import {
  appendLocalDemoScoreboard,
  loadLocalDemoScoreboard,
} from './storage';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export const isSupabaseConfigured =
  supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function normalizeStudentCode(rawCode: string): string {
  return rawCode.trim().replace(/\s+/g, '').toUpperCase();
}

export function normalizeStudentName(rawName: string): string {
  return rawName.trim().replace(/\s+/g, ' ');
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
  if (studentCode.length < 2 || studentCode.length > 24) {
    throw new Error('MSSV hoặc mã định danh phải từ 2 đến 24 ký tự.');
  }

  if (supabase) {
    const { data, error } = await supabase.rpc('start_quiz_attempt', {
      p_student_name: studentName,
      p_student_code: studentCode,
    });

    if (error) {
      throw new Error(error.message || 'Không thể khởi tạo phiên thi trên Supabase.');
    }

    const payload = data as {
      attempt_id: string;
      attempt_number: number;
      student_name: string;
      student_code: string;
      started_at: string;
    };

    return {
      attemptId: payload.attempt_id,
      attemptNumber: payload.attempt_number,
      studentName: payload.student_name,
      studentCode: payload.student_code,
      startedAt: payload.started_at,
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
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    attemptNumber: previousCount + 1,
    studentName,
    studentCode,
    startedAt: new Date().toISOString(),
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

  if (supabase && session.mode === 'supabase') {
    const { data, error } = await supabase.rpc('submit_quiz_attempt', {
      p_attempt_id: session.attemptId,
      p_answers: stringKeyAnswers,
    });

    if (error) {
      throw new Error(error.message || 'Không thể nộp bài lên Supabase.');
    }

    return data as QuizSubmissionResult;
  }

  // Local Demo Mode: dynamically import fallback answer key only when needed
  const { LOCAL_DEMO_ANSWER_KEY } = await import('../data/localDemoAnswerKey');
  const submittedAt = new Date().toISOString();
  const startedMs = new Date(session.startedAt).getTime();
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
    results,
  };
}

export async function fetchScoreboardEntries(): Promise<ScoreboardEntry[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('scoreboard_entries')
      .select(
        'id, attempt_id, student_name, student_code, attempt_number, score, total_questions, duration_ms, submitted_at'
      )
      .order('score', { ascending: false })
      .order('duration_ms', { ascending: true })
      .order('submitted_at', { ascending: true })
      .limit(200);

    if (error) {
      throw new Error(error.message || 'Không thể tải Scoreboard.');
    }

    return (data ?? []) as ScoreboardEntry[];
  }

  return loadLocalDemoScoreboard();
}

export function subscribeScoreboardChanges(
  onNewEntry: (entry: ScoreboardEntry) => void,
  onStatusChange?: (status: string) => void
): () => void {
  if (!supabase) {
    onStatusChange?.('LOCAL_DEMO');
    return () => {};
  }

  const channel: RealtimeChannel = supabase
    .channel('public:scoreboard_entries')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'scoreboard_entries',
      },
      (payload) => {
        if (payload.new) {
          onNewEntry(payload.new as ScoreboardEntry);
        }
      }
    )
    .subscribe((status) => {
      onStatusChange?.(status);
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}
