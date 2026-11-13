import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCcw,
  Send,
  Trophy,
  XCircle,
} from 'lucide-react';
import { WORKBOOK_QUESTIONS } from '../data/quizQuestions';
import { formatDurationMs } from '../lib/scoreboardUtils';
import {
  isSupabaseConfigured,
  startQuizSession,
  submitQuizSession,
} from '../lib/supabaseClient';
import {
  loadSavedAnswers,
  loadSavedQuizResult,
  loadSavedSession,
  saveActiveAnswers,
  saveActiveSession,
  saveQuizResult,
} from '../lib/storage';
import type {
  ChoiceKey,
  QuizAttemptSession,
  QuizSubmissionResult,
} from '../types/lesson';

interface Phase2QuizRunnerProps {
  onGoToScoreboard: () => void;
  onScoreboardMutated: () => void;
}

function getRankBadge(score: number, total: number): {
  title: string;
  subtitle: string;
  style: string;
} {
  const ratio = total > 0 ? score / total : 0;
  if (ratio >= 0.9) {
    return {
      title: 'せんせい級 (Cấp Thầy/Cô)',
      subtitle: 'Nắm chắc toàn bộ bẫy Bài 1!',
      style: 'border-amber-400 bg-amber-50 text-amber-900',
    };
  }
  if (ratio >= 0.7) {
    return {
      title: 'せんぱい級 (Cấp Tiền Bối)',
      subtitle: 'Rất tốt! Xem lại vài câu bẫy là trọn điểm.',
      style: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    };
  }
  if (ratio >= 0.5) {
    return {
      title: 'がくせい級 (Cấp Học Viên)',
      subtitle: 'Đã nắm nền tảng, chú ý kỹ biến âm tuổi & ngày.',
      style: 'border-sky-300 bg-sky-50 text-sky-900',
    };
  }
  return {
    title: 'がんばろう (Cố lên!)',
    subtitle: 'Quay lại Phase 1 soi kỹ 6 quy tắc vàng rồi thử lại nhé.',
    style: 'border-stone-300 bg-stone-100 text-stone-800',
  };
}

export function Phase2QuizRunner({
  onGoToScoreboard,
  onScoreboardMutated,
}: Phase2QuizRunnerProps) {
  const [studentName, setStudentName] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const [session, setSession] = useState<QuizAttemptSession | null>(() =>
    loadSavedSession()
  );
  const [answers, setAnswers] = useState<Record<number, ChoiceKey>>(() => {
    const raw = loadSavedAnswers();
    const parsed: Record<number, ChoiceKey> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (v === 'A' || v === 'B' || v === 'C' || v === 'D') {
        parsed[Number(k)] = v;
      }
    }
    return parsed;
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmIncomplete, setConfirmIncomplete] = useState(false);

  const [result, setResult] = useState<QuizSubmissionResult | null>(() =>
    loadSavedQuizResult()
  );
  const [showWrongOnly, setShowWrongOnly] = useState(false);

  useEffect(() => {
    if (!session) {
      setElapsedSeconds(0);
      return;
    }
    const updateClock = () => {
      const startMs = new Date(session.startedAt).getTime();
      if (!Number.isFinite(startMs)) return;
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
    };
    updateClock();
    const id = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(id);
  }, [session]);

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setStartError(null);
    setIsStarting(true);
    try {
      const newSession = await startQuizSession(studentName, studentCode);
      setSession(newSession);
      setAnswers({});
      setCurrentIndex(0);
      setResult(null);
      setConfirmIncomplete(false);
      saveActiveSession(newSession);
      saveActiveAnswers({});
      saveQuizResult(null);
    } catch (err) {
      setStartError(
        err instanceof Error ? err.message : 'Không thể bắt đầu bài thi.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectOption = (questionId: number, choice: ChoiceKey) => {
    setConfirmIncomplete(false);
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: choice };
      const serializable: Record<string, string> = {};
      for (const [k, v] of Object.entries(next)) {
        serializable[String(k)] = v;
      }
      saveActiveAnswers(serializable);
      return next;
    });
  };

  const handleSubmit = async (force = false) => {
    if (!session || isSubmitting) return;
    const answeredCount = Object.keys(answers).length;
    if (!force && answeredCount < WORKBOOK_QUESTIONS.length) {
      setConfirmIncomplete(true);
      return;
    }

    setSubmitError(null);
    setConfirmIncomplete(false);
    setIsSubmitting(true);
    try {
      const graded = await submitQuizSession(session, answers);
      setResult(graded);
      setSession(null);
      saveQuizResult(graded);
      saveActiveSession(null);
      saveActiveAnswers({});
      onScoreboardMutated();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Lỗi khi nộp bài, vui lòng bấm thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNewAttempt = () => {
    setResult(null);
    saveQuizResult(null);
  };

  // 1. Graded Result Screen
  if (result) {
    const rank = getRankBadge(result.score, result.total_questions);
    const displayedItems = showWrongOnly
      ? result.results.filter((r) => !r.is_correct)
      : result.results;

    return (
      <div className="space-y-5">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-extrabold text-white">
                  Lượt {result.attempt_number}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    result.attempt_number === 1
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {result.attempt_number === 1
                    ? 'Hợp lệ xét thưởng Top 1'
                    : 'Lượt luyện lại'}
                </span>
              </div>
              <h2 className="mt-2 text-xl font-extrabold text-stone-900">
                {result.student_name} ({result.student_code})
              </h2>
              <p className="tabular-nums mt-1 text-sm text-stone-600">
                Điểm số:{' '}
                <strong className="text-lg text-red-700">
                  {result.score} / {result.total_questions}
                </strong>{' '}
                · Thời gian:{' '}
                <strong className="text-stone-900">
                  {formatDurationMs(result.duration_ms)}
                </strong>
              </p>
            </div>

            <div className={`rounded-xl border p-3 text-xs ${rank.style}`}>
              <div className="flex items-center gap-1.5 font-extrabold">
                <Award className="h-4 w-4" />
                <span className="font-jp">{rank.title}</span>
              </div>
              <p className="mt-0.5">{rank.subtitle}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onGoToScoreboard}
              className="flex items-center gap-1.5 rounded-xl bg-red-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-red-800"
            >
              <Trophy className="h-4 w-4" />
              Xem Scoreboard toàn lớp
            </button>
            <button
              type="button"
              onClick={handleStartNewAttempt}
              className="flex items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              <RotateCcw className="h-4 w-4" />
              Làm lại để luyện thêm
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold text-stone-900">
              Chi tiết đáp án & Giải thích từng câu
            </h3>
            <button
              type="button"
              onClick={() => setShowWrongOnly((prev) => !prev)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                showWrongOnly
                  ? 'border-red-400 bg-red-50 text-red-800'
                  : 'border-stone-200 bg-stone-50 text-stone-700'
              }`}
            >
              {showWrongOnly ? 'Đang lọc: Chỉ câu sai' : 'Lọc: Chỉ xem câu sai'}
            </button>
          </div>

          {displayedItems.length === 0 ? (
            <p className="rounded-xl bg-emerald-50 p-4 text-center text-xs font-bold text-emerald-800">
              Tuyệt đối 20/20 — Không có câu nào sai!
            </p>
          ) : (
            <div className="space-y-3">
              {displayedItems.map((res) => {
                const q = WORKBOOK_QUESTIONS.find((item) => item.id === res.question_id);
                if (!q) return null;
                return (
                  <div
                    key={res.question_id}
                    className={`rounded-xl border p-3.5 text-xs ${
                      res.is_correct
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold text-stone-500">
                          Câu {q.id} · {q.section}
                        </span>
                        <p className="font-jp mt-0.5 text-sm font-bold text-stone-900">
                          {q.prompt}
                        </p>
                        {q.subPrompt && (
                          <p className="text-stone-500">{q.subPrompt}</p>
                        )}
                      </div>
                      {res.is_correct ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                      )}
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3">
                      <span>
                        Bạn chọn:{' '}
                        <strong
                          className={
                            res.is_correct ? 'text-emerald-700' : 'text-red-700'
                          }
                        >
                          {res.selected_choice
                            ? `${res.selected_choice}. ${q.options[res.selected_choice]}`
                            : 'Chưa chọn'}
                        </strong>
                      </span>
                      {!res.is_correct && (
                        <span>
                          Đáp án đúng:{' '}
                          <strong className="text-emerald-700">
                            {res.correct_choice}. {q.options[res.correct_choice]}
                          </strong>
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 rounded-lg bg-white/80 p-2 text-stone-700">
                      {res.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  // 2. Entry Registration Screen
  if (!session) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        {!isSupabaseConfigured && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
            <strong>Chế độ Demo Local:</strong> Chưa cấu hình biến môi trường Supabase nên điểm số chỉ lưu tạm trong trình duyệt máy này (chưa đồng bộ giữa nhiều điện thoại).
          </div>
        )}

        <form
          onSubmit={handleStartQuiz}
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-700">
            Phase 2 · Thực chiến 20 câu Workbook
          </span>
          <h2 className="mt-1 text-lg font-extrabold text-stone-900">
            Nhập thông tin để ghi danh lên Scoreboard
          </h2>
          <p className="mt-1 text-xs text-stone-600">
            Xếp hạng trao thưởng dựa trên <strong>Điểm cao nhất → Thời gian làm nhanh nhất</strong>. Lượt thi đầu tiên (Lượt 1) được ưu tiên xét thưởng.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block text-xs">
              <span className="font-bold text-stone-800">Họ và tên</span>
              <input
                type="text"
                required
                minLength={2}
                maxLength={60}
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-medium focus:border-red-600 focus:outline-none"
              />
            </label>

            <label className="block text-xs">
              <span className="font-bold text-stone-800">MSSV / Mã định danh</span>
              <input
                type="text"
                required
                minLength={2}
                maxLength={24}
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="Ví dụ: SE181234"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm font-medium uppercase focus:border-red-600 focus:outline-none"
              />
            </label>
          </div>

          {startError && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{startError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isStarting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-red-800 disabled:opacity-60"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Đang bắt đầu tính giờ...</span>
              </>
            ) : (
              <span>Bắt đầu tính giờ & Làm 20 câu</span>
            )}
          </button>
        </form>
      </div>
    );
  }

  // 3. Active Quiz Runner
  const currentQuestion = WORKBOOK_QUESTIONS[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const elapsedMins = Math.floor(elapsedSeconds / 60);
  const elapsedSecs = elapsedSeconds % 60;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-xs">
        <div className="text-xs">
          <span className="font-extrabold text-stone-900">
            {session.studentName} ({session.studentCode})
          </span>
          <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-600">
            Lượt {session.attemptNumber}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="text-stone-600">
            Đã chọn: {answeredCount}/{WORKBOOK_QUESTIONS.length}
          </span>
          <span className="tabular-nums flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-red-700">
            <Clock className="h-3.5 w-3.5" />
            {String(elapsedMins).padStart(2, '0')}:
            {String(elapsedSecs).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-stone-200 bg-white p-3 shadow-xs">
        {WORKBOOK_QUESTIONS.map((q, idx) => {
          const isAnswered = Boolean(answers[q.id]);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-8 w-8 rounded-lg text-xs font-extrabold transition ${
                isCurrent
                  ? 'bg-red-700 text-white ring-2 ring-red-300'
                  : isAnswered
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {q.id}
            </button>
          );
        })}
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-700">
          Câu {currentQuestion.id} / {WORKBOOK_QUESTIONS.length} ·{' '}
          {currentQuestion.section}
        </span>

        <h3 className="font-jp mt-2 text-lg font-extrabold text-stone-900">
          {currentQuestion.prompt}
        </h3>

        {currentQuestion.type === 'order' && currentQuestion.orderTokens ? (
          <div className="mt-2 flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
            {currentQuestion.orderTokens.map((token, idx) => (
              <span
                key={`${token}-${idx}`}
                className="font-jp rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-bold text-stone-800 shadow-2xs"
              >
                {token}
              </span>
            ))}
          </div>
        ) : (
          currentQuestion.subPrompt && (
            <p className="mt-1 text-xs text-stone-500">{currentQuestion.subPrompt}</p>
          )
        )}

        <div className="mt-4 grid gap-2.5">
          {(['A', 'B', 'C', 'D'] as const).map((key) => {
            const isSelected = answers[currentQuestion.id] === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectOption(currentQuestion.id, key)}
                className={`flex items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition ${
                  isSelected
                    ? 'border-red-600 bg-red-50 font-bold text-red-900 ring-1 ring-red-600'
                    : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400 hover:bg-stone-50'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${
                    isSelected
                      ? 'bg-red-700 text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {key}
                </span>
                <span className="font-jp">{currentQuestion.options[key]}</span>
              </button>
            );
          })}
        </div>

        {confirmIncomplete && (
          <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-bold">
              Bạn còn {WORKBOOK_QUESTIONS.length - answeredCount} câu chưa chọn đáp án. Bạn vẫn muốn nộp bài ngay bây giờ?
            </p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => void handleSubmit(true)}
                className="rounded-lg bg-red-700 px-3 py-1.5 font-extrabold text-white"
              >
                Chắc chắn nộp bài
              </button>
              <button
                type="button"
                onClick={() => setConfirmIncomplete(false)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-bold text-stone-700"
              >
                Quay lại làm tiếp
              </button>
            </div>
          </div>
        )}

        {submitError && (
          <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
            {submitError}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-4">
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Câu trước
            </button>
            <button
              type="button"
              disabled={currentIndex === WORKBOOK_QUESTIONS.length - 1}
              onClick={() =>
                setCurrentIndex((i) =>
                  Math.min(WORKBOOK_QUESTIONS.length - 1, i + 1)
                )
              }
              className="flex items-center gap-1 rounded-xl border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-700 disabled:opacity-40"
            >
              Câu tiếp
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => void handleSubmit(false)}
            className="flex items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-stone-800 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang chấm điểm...</span>
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                <span>Nộp bài ({answeredCount}/20)</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
