import { BookOpen, Clock, Eye, RotateCcw, Trophy, Zap } from 'lucide-react';
import type { DisplayMode } from '../types/lesson';

export type ActiveRoute = 'phase1' | 'phase2' | 'scoreboard';

interface HeaderBarProps {
  activeRoute: ActiveRoute;
  onRouteChange: (route: ActiveRoute) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  remainingSeconds: number;
  timerRunning: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
}

const DISPLAY_MODES: { value: DisplayMode; label: string }[] = [
  { value: 'full', label: 'Đầy đủ' },
  { value: 'kana', label: 'Chỉ Kana' },
  { value: 'challenge', label: 'Thử thách' },
];

export function HeaderBar({
  activeRoute,
  onRouteChange,
  displayMode,
  onDisplayModeChange,
  remainingSeconds,
  timerRunning,
  onToggleTimer,
  onResetTimer,
}: HeaderBarProps) {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const isTimeUp = remainingSeconds === 0;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="font-jp flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-700 text-lg font-extrabold text-white shadow-sm"
              aria-hidden="true"
            >
              日
            </div>
            <h1 className="text-base font-extrabold tracking-tight text-stone-900 sm:text-lg">
              JPD113 · Bài 1
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              type="button"
              onClick={onToggleTimer}
              title="Bấm để bật/tạm dừng đồng hồ 7 phút"
              className={`tabular-nums flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-bold ${
                isTimeUp
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-stone-200 bg-stone-50 text-stone-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav className="flex rounded-xl bg-stone-100 p-1" aria-label="Điều hướng chính">
            <button
              type="button"
              onClick={() => onRouteChange('phase1')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeRoute === 'phase1'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>1. Ôn tập (7p)</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange('phase2')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeRoute === 'phase2'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>2. Quiz (20 câu)</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange('scoreboard')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeRoute === 'scoreboard'
                  ? 'bg-white text-red-700 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>Scoreboard</span>
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                onClick={onToggleTimer}
                className={`tabular-nums flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition ${
                  isTimeUp
                    ? 'animate-pulse border-red-300 bg-red-50 text-red-700'
                    : timerRunning
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-stone-200 bg-stone-50 text-stone-700'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {isTimeUp
                    ? 'Hết 7p → Quiz!'
                    : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`}
                </span>
              </button>
              <button
                type="button"
                onClick={onResetTimer}
                title="Đặt lại đồng hồ 7 phút"
                className="rounded-lg border border-stone-200 p-1.5 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>

            {activeRoute === 'phase1' && (
              <div
                className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 p-0.5"
                title="Chế độ hiển thị chữ tiếng Nhật"
              >
                <Eye className="ml-1.5 h-3.5 w-3.5 text-stone-400" />
                {DISPLAY_MODES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => onDisplayModeChange(m.value)}
                    className={`rounded-md px-2 py-1 text-[11px] font-semibold transition ${
                      displayMode === m.value
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
