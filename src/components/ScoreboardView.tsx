import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Trophy,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  buildScoreboardCsv,
  formatDurationMs,
  rankScoreboardEntries,
  type RankingFilter,
} from '../lib/scoreboardUtils';
import {
  fetchScoreboardEntries,
  isSupabaseConfigured,
  subscribeScoreboardChanges,
} from '../lib/supabaseClient';
import type { ScoreboardEntry } from '../types/lesson';

interface ScoreboardViewProps {
  refreshSignal: number;
}

export function ScoreboardView({ refreshSignal }: ScoreboardViewProps) {
  const [entries, setEntries] = useState<ScoreboardEntry[]>([]);
  const [filterMode, setFilterMode] = useState<RankingFilter>('first-only');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<string>('CONNECTING');
  const [showQrModal, setShowQrModal] = useState(false);

  const appUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://vercel.app';

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchScoreboardEntries();
      setEntries(data);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Không tải được Scoreboard.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries, refreshSignal]);

  useEffect(() => {
    const unsubscribe = subscribeScoreboardChanges(
      (newEntry) => {
        setEntries((prev) => {
          if (prev.some((e) => e.attempt_id === newEntry.attempt_id)) {
            return prev;
          }
          return [...prev, newEntry];
        });
      },
      (status) => setRealtimeStatus(status)
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const handleResync = () => {
      if (document.visibilityState === 'visible') {
        void loadEntries();
      }
    };
    const handleOnline = () => {
      void loadEntries();
    };
    document.addEventListener('visibilitychange', handleResync);
    window.addEventListener('online', handleOnline);
    return () => {
      document.removeEventListener('visibilitychange', handleResync);
      window.removeEventListener('online', handleOnline);
    };
  }, [loadEntries]);

  useEffect(() => {
    if (!showQrModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowQrModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showQrModal]);

  const rankedEntries = useMemo(() => {
    const sorted = rankScoreboardEntries(entries, filterMode);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (item) =>
        item.student_name.toLowerCase().includes(q) ||
        item.student_code.toLowerCase().includes(q)
    );
  }, [entries, filterMode, searchQuery]);

  const topThree = rankedEntries.slice(0, 3);

  const handleDownloadCsv = () => {
    const csv = buildScoreboardCsv(rankedEntries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const localDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date());
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `jpd113-bai1-scoreboard-${localDate}.csv`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Trophy className="h-5 w-5 text-red-700" />
            <h2 className="text-lg font-extrabold text-stone-900">
              Scoreboard Lớp Học · Xét Thưởng Top 1
            </h2>
            <span
              className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                !isSupabaseConfigured
                  ? 'bg-amber-100 text-amber-800'
                  : realtimeStatus === 'SUBSCRIBED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Radio className="h-3 w-3" />
              {!isSupabaseConfigured
                ? 'Demo Local'
                : realtimeStatus === 'SUBSCRIBED'
                  ? 'Live Realtime'
                  : realtimeStatus}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-stone-500">
            Ưu tiên: Điểm cao nhất (DESC) → Thời gian làm nhanh nhất (ASC). Mặc định lọc Lượt 1.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-red-700 px-3 py-2 text-xs font-extrabold text-white hover:bg-red-800"
          >
            <QrCode className="h-4 w-4" />
            Chiếu QR Lớp Học
          </button>
          <button
            type="button"
            onClick={() => void loadEntries()}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
          <button
            type="button"
            disabled={rankedEntries.length === 0}
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-50 disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Xuất CSV
          </button>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-900">
          Đang chạy ở <strong>Demo Local Mode</strong>: Scoreboard chỉ hiển thị các lượt làm bài trên chính trình duyệt này. Để gom điểm từ 30 điện thoại lên 1 bảng chiếu, hãy thêm <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code> theo hướng dẫn trong <code>README.md</code>.
        </div>
      )}

      {topThree.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          {topThree.map((entry, idx) => {
            const medals = ['Hạng #1 · Quán Quân', 'Hạng #2 · Á Quân', 'Hạng #3 · Hạng Ba'];
            const cardStyles = [
              'border-amber-400 bg-amber-50',
              'border-stone-300 bg-stone-50',
              'border-orange-200 bg-orange-50/50',
            ];
            return (
              <div
                key={entry.attempt_id}
                className={`rounded-2xl border-2 p-4 shadow-xs ${cardStyles[idx]}`}
              >
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-stone-700">
                  {medals[idx]}
                </span>
                <p className="mt-1 truncate text-base font-extrabold text-stone-900">
                  {entry.student_name}
                </p>
                <p className="text-xs font-semibold text-stone-500">
                  {entry.student_code} · Lượt {entry.attempt_number}
                </p>
                <div className="tabular-nums mt-3 flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-red-700">
                    {entry.score}/{entry.total_questions}
                  </span>
                  <span className="text-xs font-bold text-stone-700">
                    {formatDurationMs(entry.duration_ms)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setFilterMode('first-only')}
              className={`rounded-lg px-3 py-1.5 transition ${
                filterMode === 'first-only'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600'
              }`}
            >
              Chỉ Lượt 1 (Trao thưởng)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`rounded-lg px-3 py-1.5 transition ${
                filterMode === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600'
              }`}
            >
              Tất cả lượt ({entries.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên hoặc MSSV..."
              className="w-full rounded-xl border border-stone-200 py-2 pr-3 pl-8 text-base font-medium focus:border-red-600 focus:outline-none sm:text-xs"
            />
          </div>
        </div>

        {errorMsg && (
          <p className="mb-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700">
            {errorMsg}
          </p>
        )}

        {rankedEntries.length === 0 ? (
          <div className="rounded-xl bg-stone-50 p-8 text-center text-xs text-stone-500">
            Chưa có bài nộp nào. Hoàn thành Phase 2 Quiz để xuất hiện trên bảng xếp hạng!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="py-2.5 pr-3 font-bold">Hạng</th>
                  <th className="py-2.5 pr-3 font-bold">Họ tên</th>
                  <th className="py-2.5 pr-3 font-bold">MSSV</th>
                  <th className="py-2.5 pr-3 font-bold">Lượt</th>
                  <th className="py-2.5 pr-3 font-bold">Điểm</th>
                  <th className="py-2.5 font-bold">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rankedEntries.map((row, index) => (
                  <tr
                    key={row.attempt_id}
                    className={index === 0 ? 'bg-amber-50/70 font-semibold' : ''}
                  >
                    <td className="tabular-nums py-2.5 pr-3 font-extrabold text-stone-900">
                      #{index + 1}
                    </td>
                    <td className="py-2.5 pr-3 font-bold text-stone-900">
                      {row.student_name}
                    </td>
                    <td className="py-2.5 pr-3 text-stone-600">{row.student_code}</td>
                    <td className="py-2.5 pr-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          row.attempt_number === 1
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        Lần {row.attempt_number}
                      </span>
                    </td>
                    <td className="tabular-nums py-2.5 pr-3 font-extrabold text-red-700">
                      {row.score}/{row.total_questions}
                    </td>
                    <td className="tabular-nums py-2.5 font-bold text-stone-700">
                      {formatDurationMs(row.duration_ms)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showQrModal && (
        <div
          onClick={() => setShowQrModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Mã QR truy cập lớp học"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-stone-900">
                Quét QR vào Ôn tập & Quiz
              </h3>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="my-5 flex justify-center rounded-2xl border border-stone-200 bg-white p-4">
              <QRCodeSVG value={appUrl} size={220} level="M" />
            </div>
            <p className="break-all rounded-xl bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700">
              {appUrl}
            </p>
            <p className="mt-2 text-xs text-stone-500">
              7 phút tự ôn Phase 1 → Nộp 20 câu Phase 2 → Trao thưởng Top 1 trên Scoreboard!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
